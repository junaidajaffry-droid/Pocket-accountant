import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

dotenv.config();

// Firestore initialization (persists across serverless restarts, unlike in-memory Map)
if (!getApps().length) {
  let serviceAccount: any = undefined;
  try {
    serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
      : undefined;
  } catch (e: any) {
    console.error("FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON:", e?.message);
  }
  if (serviceAccount) {
    initializeApp({ credential: cert(serviceAccount) });
  } else {
    console.warn("FIREBASE_SERVICE_ACCOUNT_JSON not set — cloud sync will not persist.");
  }
}
const db = getApps().length ? getFirestore() : null;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "25mb" }));

// Server-side Gemini AI Client with lazy initialization
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// Cloud Sync data shape (now persisted in Firestore, see db.collection("cloudSync") below)
interface SyncStoreData {
  records: any[];
  categories: any[];
  settings: any;
  familyMembers: any[];
  lastSyncedAt: string;
}

// 1. Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// AdSense ads.txt domain root verification file
app.get("/ads.txt", (_req, res) => {
  res.type("text/plain").send("google.com, pub-1977106388827549, DIRECT, f08c47fec0942fa0\n");
});

// Fallback rule-based voice parser (for when offline or if API key unavailable)
function fallbackVoiceParser(text: string, currentCategories: string[] = []) {
  // Normalize eastern and urdu digits
  const eastern = "٠١٢٣٤٥٦٧٨٩";
  const urdu = "۰۱۲۳۴۵۶۷۸۹";
  const normalized = text.replace(/[٠-٩۰-۹]/g, (ch) => {
    let idx = eastern.indexOf(ch);
    if (idx === -1) idx = urdu.indexOf(ch);
    return idx === -1 ? ch : String(idx);
  });

  const numMatch = normalized.match(/(\d+([.,]\d+)?)/);
  const amount = numMatch ? parseFloat(numMatch[1].replace(",", ".")) : 0;
  const lower = normalized.toLowerCase();

  const isIncome = [
    "salary",
    "received",
    "earned",
    "freelance",
    "income",
    "client payment",
    "tanqah",
    "آمدنی",
    "تنخواہ",
    "ملی",
    "وصول",
    "ganado",
    "recibido",
    "ingreso",
    "salaire",
  ].some((kw) => lower.includes(kw));

  let matchedCategory = isIncome ? "Salary" : "General Expense";
  const catKeywords: Record<string, string[]> = {
    Food: ["food", "groceries", "dinner", "lunch", "coffee", "restaurant", "snack", "burger", "pizza", "khana", "nashta", "کھانا", "ناشتہ", "repas", "nourriture", "comida"],
    Transport: ["uber", "taxi", "gas", "fuel", "petrol", "parking", "bus", "train", "metro", "kiraya", "پٹرول", "کرایہ", "transporte", "essence"],
    Shopping: ["shopping", "clothes", "shoes", "amazon", "mall", "clothing", "kapray", "خریداری", "ropa", "vêtements"],
    Bills: ["bill", "electricity", "rent", "water", "internet", "wifi", "utility", "phone", "bijli", "بل", "بجلی", "facture", "recibo"],
    Entertainment: ["movie", "cinema", "game", "netflix", "concert", "party", "spotify", "تفریح", "cine", "jeu"],
    Health: ["doctor", "medicine", "pharmacy", "medical", "dentist", "dawai", "دوائی", "ڈاکٹر", "santé", "salud"],
  };

  for (const [cat, words] of Object.entries(catKeywords)) {
    if (words.some((w) => lower.includes(w))) {
      matchedCategory = cat;
      break;
    }
  }

  return {
    amount,
    currency: "USD",
    type: isIncome ? "income" : "expense",
    category: matchedCategory,
    note: text.trim(),
    originalLanguage: "auto-detected",
    translatedNote: text.trim(),
    confidence: 0.75,
  };
}

// 2. Global AI Voice Expense / Income Recognizer (All Languages)
app.post("/api/ai/parse-voice", async (req, res) => {
  const { text, currentCategories, baseCurrency, languageHint } = req.body;
  if (!text || typeof text !== "string") {
    res.status(400).json({ error: "Voice transcript or text is required." });
    return;
  }

  const ai = getGenAI();
  if (!ai) {
    // If no API key is provided, return intelligent fallback
    const fallback = fallbackVoiceParser(text, currentCategories);
    res.json(fallback);
    return;
  }

  try {
    const prompt = `You are a multilingual AI financial ledger assistant. The user spoke or typed the following financial transaction in their native language (any language in the world, e.g. English, Urdu, Spanish, Hindi, Arabic, French, German, Chinese, Japanese, Tagalog, Russian, etc.):
"${text}"

Task:
1. Extract the transaction amount as a numeric value.
2. Determine if it is an "expense" or "income" (e.g., spending, buying, paying = expense; getting paid, salary, receiving funds, client invoice, earnings = income).
3. Identify the best category. Choose from the user's current categories: ${JSON.stringify(currentCategories || ["Food", "Transport", "Shopping", "Bills", "Health", "Entertainment", "Payroll", "Inventory", "Marketing", "Utilities", "Other"])} or suggest a concise 1-2 word category if none fit.
4. Extract the currency if explicitly mentioned or implied, otherwise default to "${baseCurrency || "USD"}".
5. Extract a clean note/description in the original language, and provide an English translation if the original language is not English.
6. Detect the spoken language name (e.g., "Urdu", "Spanish", "English", "Hindi", "French").
7. Check if a relative date was mentioned (e.g., "yesterday", "2 days ago", "last Friday"). If none, use null.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER, description: "The numeric transaction amount" },
            currency: { type: Type.STRING, description: "3-letter currency code or symbol" },
            type: { type: Type.STRING, description: "'expense' or 'income'" },
            category: { type: Type.STRING, description: "Appropriate financial category" },
            note: { type: Type.STRING, description: "Transaction note or item purchased" },
            originalLanguage: { type: Type.STRING, description: "Detected language of the voice input" },
            translatedNote: { type: Type.STRING, description: "English translation of the note if different" },
            dateOffsetDays: { type: Type.INTEGER, description: "0 for today, -1 for yesterday, etc." },
            confidence: { type: Type.NUMBER, description: "Confidence score between 0.0 and 1.0" },
          },
          required: ["amount", "type", "category", "note", "originalLanguage"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({
      amount: parsed.amount || 0,
      currency: parsed.currency || baseCurrency || "USD",
      type: parsed.type === "income" ? "income" : "expense",
      category: parsed.category || "Other",
      note: parsed.note || text,
      originalLanguage: parsed.originalLanguage || "auto",
      translatedNote: parsed.translatedNote || parsed.note || text,
      dateOffsetDays: parsed.dateOffsetDays ?? 0,
      confidence: parsed.confidence ?? 0.95,
    });
  } catch (err: any) {
    console.error("Gemini voice parse error, falling back:", err?.message);
    const fallback = fallbackVoiceParser(text, currentCategories);
    res.json(fallback);
  }
});

// 3. AI Receipt & Bill Scanner (Vision OCR)
app.post("/api/ai/scan-receipt", async (req, res) => {
  const { imageBase64, mimeType = "image/jpeg", baseCurrency = "USD" } = req.body;
  if (!imageBase64) {
    res.status(400).json({ error: "Image data is required" });
    return;
  }

  const ai = getGenAI();
  if (!ai) {
    res.json({
      merchant: "Receipt Entry",
      amount: 0,
      currency: baseCurrency,
      date: new Date().toISOString().slice(0, 10),
      category: "Shopping",
      taxAmount: 0,
      items: [],
      note: "Receipt scanned (Offline mode)",
    });
    return;
  }

  try {
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          {
            text: `Analyze this receipt or expense document. Extract:
1. Merchant/Store or Vendor Name.
2. Total final amount (number).
3. Currency symbol or code.
4. Date of transaction (YYYY-MM-DD format if visible, otherwise today).
5. Tax amount if listed.
6. Suggested financial category (e.g. Food, Groceries, Dining, Supplies, Transport, Fuel, Utilities, Equipment).
7. A concise note summarizing items bought.
8. Array of line items with item name and price.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            merchant: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            currency: { type: Type.STRING },
            date: { type: Type.STRING },
            taxAmount: { type: Type.NUMBER },
            category: { type: Type.STRING },
            note: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                },
              },
            },
          },
          required: ["merchant", "amount", "category"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (err: any) {
    console.error("Gemini receipt scan error:", err?.message);
    res.status(500).json({
      error: "Failed to scan receipt with AI",
      details: err?.message,
    });
  }
});

// 4. AI Financial Advisor & Previous Month Budget Control
app.post("/api/ai/budget-advisor", async (req, res) => {
  const {
    currentMonthExpenses = [],
    previousMonthExpenses = [],
    monthlyBudget = 0,
    dailyLimit = 0,
    mode = "home",
    industry = "General",
    currency = "USD",
  } = req.body;

  const ai = getGenAI();
  if (!ai) {
    // Return intelligent heuristic suggestions if no API key
    const curTotal = currentMonthExpenses.reduce((s: number, e: any) => s + (e.amount || 0), 0);
    const prevTotal = previousMonthExpenses.reduce((s: number, e: any) => s + (e.amount || 0), 0);
    const diff = curTotal - prevTotal;

    res.json({
      summary: `You have spent ${currency} ${Math.round(curTotal).toLocaleString()} this month compared to ${currency} ${Math.round(prevTotal).toLocaleString()} last month.`,
      pacingAnalysis: diff > 0 ? "Spending is currently pacing higher than last month." : "Spending is under control compared to previous month.",
      savingsTips: [
        {
          title: "Optimize High-Frequency Outflows",
          advice: "Review recurring daily discretionary expenses to retain more cash reserve.",
          potentialSavings: Math.round(curTotal * 0.1),
          priority: "High",
        },
        {
          title: "Daily Limit Discipline",
          advice: `Keep daily spend under ${currency} ${dailyLimit || Math.round(curTotal / 30)} to prevent month-end budget overflow.`,
          potentialSavings: Math.round(curTotal * 0.05),
          priority: "Medium",
        },
      ],
      budgetStatus: curTotal > monthlyBudget && monthlyBudget > 0 ? "Exceeded" : "Within Budget",
    });
    return;
  }

  try {
    const prompt = `You are an expert Certified Financial Planner (CFP) & Business CFO. Analyze this user's records:
Profile:
- Operating Mode: ${mode === "business" ? `Business (Industry: ${industry})` : "Personal & Home Budget"}
- Currency: ${currency}
- Monthly Budget Target: ${monthlyBudget}
- Daily Spending Limit: ${dailyLimit}

Data:
Current Month Transactions Summary:
${JSON.stringify(currentMonthExpenses.slice(0, 30))}

Previous Month Transactions Summary:
${JSON.stringify(previousMonthExpenses.slice(0, 30))}

Task:
1. Provide a professional, encouraging 2-3 sentence executive summary of spending trends.
2. Compare previous month vs current month to detect category spikes or cost drift.
3. Generate 3 to 4 actionable, highly realistic suggestions to save funds, control budget, and optimize cash flow (specifically tailored to ${mode === "business" ? industry + " business operations" : "household expenses"}).
4. For each tip, estimate potential monthly savings in ${currency} and assign priority (High, Medium, Low).
5. Provide a pacing analysis based on the current day of the month.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            pacingAnalysis: { type: Type.STRING },
            budgetStatus: { type: Type.STRING },
            savingsTips: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  advice: { type: Type.STRING },
                  potentialSavings: { type: Type.NUMBER },
                  priority: { type: Type.STRING },
                },
                required: ["title", "advice", "potentialSavings", "priority"],
              },
            },
          },
          required: ["summary", "pacingAnalysis", "savingsTips"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (err: any) {
    console.error("Gemini budget advisor error:", err?.message);
    res.status(500).json({ error: "Failed to generate AI budget advice", details: err?.message });
  }
});

// 4b. Advanced AI Engine: Multi-Month Historical Income & Expense Deep Analysis & Budget Optimization
app.post("/api/ai/historical-analysis", async (req, res) => {
  const {
    transactions = [],
    monthlyBudget = 0,
    dailyLimit = 0,
    mode = "home",
    industry = "General",
    currency = "USD",
  } = req.body;

  // Compute multi-month mathematical statistics
  const incomeTxs = transactions.filter((t: any) => t.type === "income");
  const expenseTxs = transactions.filter((t: any) => t.type === "expense");

  const totalIncome = incomeTxs.reduce((sum: number, t: any) => sum + (Number(t.baseAmount) || Number(t.amount) || 0), 0);
  const totalExpense = expenseTxs.reduce((sum: number, t: any) => sum + (Number(t.baseAmount) || Number(t.amount) || 0), 0);

  // Group by month
  const monthlyData: Record<string, { income: number; expense: number }> = {};
  for (const t of transactions) {
    const m = (t.date || "").slice(0, 7) || "unknown";
    if (!monthlyData[m]) monthlyData[m] = { income: 0, expense: 0 };
    const amt = Number(t.baseAmount) || Number(t.amount) || 0;
    if (t.type === "income") monthlyData[m].income += amt;
    else monthlyData[m].expense += amt;
  }

  const monthsCount = Math.max(1, Object.keys(monthlyData).length);
  const avgMonthlyIncome = Math.round(totalIncome / monthsCount);
  const avgMonthlyExpense = Math.round(totalExpense / monthsCount);
  const savingsRate = avgMonthlyIncome > 0
    ? Math.max(0, Math.round(((avgMonthlyIncome - avgMonthlyExpense) / avgMonthlyIncome) * 100))
    : 0;

  // Category aggregations
  const catTotals: Record<string, number> = {};
  for (const t of expenseTxs) {
    const cat = t.category || "Other";
    catTotals[cat] = (catTotals[cat] || 0) + (Number(t.baseAmount) || Number(t.amount) || 0);
  }
  const topCategories = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([cat, amt]) => ({ category: cat, monthlyAvg: Math.round(amt / monthsCount) }));

  // Fallback heuristic generator
  const generateHeuristicResult = () => {
    let score = 70;
    if (savingsRate >= 25) score = 92;
    else if (savingsRate >= 15) score = 84;
    else if (savingsRate >= 5) score = 72;
    else if (savingsRate >= 0) score = 60;
    else score = 45;

    let rating: "Exceptional" | "Strong" | "Moderate" | "At Risk" | "Critical" = "Moderate";
    if (score >= 90) rating = "Exceptional";
    else if (score >= 80) rating = "Strong";
    else if (score >= 68) rating = "Moderate";
    else if (score >= 55) rating = "At Risk";
    else rating = "Critical";

    const leaks = [];
    if (catTotals["Food"] && catTotals["Food"] / monthsCount > avgMonthlyExpense * 0.3) {
      leaks.push({
        title: "Elevated Dining & Grocery Velocity",
        description: "Food expenditure represents more than 30% of total monthly outflow.",
        estimatedWastedMonthly: Math.round((catTotals["Food"] / monthsCount) * 0.15),
        urgency: "Warning" as const,
      });
    }
    if (catTotals["Entertainment"] || catTotals["Shopping"]) {
      const discAmt = ((catTotals["Entertainment"] || 0) + (catTotals["Shopping"] || 0)) / monthsCount;
      if (discAmt > 100) {
        leaks.push({
          title: "Discretionary Subscriptions & Lifestyle Creep",
          description: "Micro-transactions and entertainment services show repetitive recurring drift.",
          estimatedWastedMonthly: Math.round(discAmt * 0.2),
          urgency: "Immediate" as const,
        });
      }
    }
    if (leaks.length === 0) {
      leaks.push({
        title: "Unclassified Cash Outflows",
        description: "Frequent unbudgeted small transactions drain liquidity over quarterly cycles.",
        estimatedWastedMonthly: Math.round(avgMonthlyExpense * 0.06),
        urgency: "Consideration" as const,
      });
    }

    const recs = topCategories.slice(0, 4).map((c, i) => {
      const potSave = Math.round(c.monthlyAvg * (0.12 + i * 0.03));
      return {
        category: c.category,
        currentMonthlySpend: c.monthlyAvg,
        recommendedSpend: Math.max(0, c.monthlyAvg - potSave),
        potentialMonthlySavings: potSave,
        annualImpact: potSave * 12,
        actionStep:
          mode === "business"
            ? `Negotiate vendor contracts and trim redundant non-billable ${c.category.toLowerCase()} costs.`
            : `Set a weekly cap on ${c.category.toLowerCase()} and substitute with lower-cost alternatives.`,
        difficulty: (i === 0 ? "Easy" : i === 1 ? "Moderate" : "Strict") as "Easy" | "Moderate" | "Strict",
      };
    });

    const totalSaveMonthly = recs.reduce((s, r) => s + r.potentialMonthlySavings, 0);
    const netRetained = Math.max(0, avgMonthlyIncome - avgMonthlyExpense);
    const currentRunway = avgMonthlyExpense > 0 ? Number((netRetained * 3 / avgMonthlyExpense).toFixed(1)) : 1;
    const optimizedRunway = Number((currentRunway + (totalSaveMonthly * 6) / (avgMonthlyExpense || 1)).toFixed(1));

    return {
      financialHealthScore: score,
      healthRating: rating,
      executiveSummary: `Across ${monthsCount} month(s) of records, your monthly cash inflow averages ${currency} ${avgMonthlyIncome.toLocaleString()} against an average burn of ${currency} ${avgMonthlyExpense.toLocaleString()}, yielding a net savings rate of ${savingsRate}%.`,
      historicalTrends: {
        monthlyIncomeAverage: avgMonthlyIncome,
        monthlyExpenseAverage: avgMonthlyExpense,
        savingsRatePercentage: savingsRate,
        volatilityIndex: monthsCount > 1 ? "Moderate" as const : "Low" as const,
        burnRateTrajectory: avgMonthlyExpense > avgMonthlyIncome ? "Negative Cash Flow / Deficit Risk" : "Positive Cash Inflow Accumulation",
      },
      spendingLeaks: leaks,
      optimizationRecommendations: recs,
      totalPotentialMonthlySavings: totalSaveMonthly,
      totalAnnualSavingsProjection: totalSaveMonthly * 12,
      runwayAndMilestones: {
        currentEmergencyRunwayMonths: currentRunway,
        optimizedRunwayMonths: optimizedRunway,
        milestoneMessage: `By capturing ${currency} ${totalSaveMonthly.toLocaleString()}/month in budget optimizations, your reserve runway extends from ${currentRunway} to ${optimizedRunway} months.`,
      },
      analyzedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const ai = getGenAI();
  if (!ai) {
    res.json(generateHeuristicResult());
    return;
  }

  try {
    const prompt = `You are a Chief Financial Officer (CFO) and Principal Financial Engine AI.
Conduct a rigorous historical financial analysis on this user's data:

Profile:
- Operating Mode: ${mode === "business" ? `Commercial Business (${industry} sector)` : "Personal Household"}
- Currency: ${currency}
- User's Target Monthly Budget: ${monthlyBudget}
- Daily Limit: ${dailyLimit}

Aggregated Historical Metrics:
- Span of Analysis: ${monthsCount} distinct month(s)
- Total Historical Income: ${currency} ${totalIncome} (Monthly Avg: ${avgMonthlyIncome})
- Total Historical Expenses: ${currency} ${totalExpense} (Monthly Avg: ${avgMonthlyExpense})
- Base Savings Rate: ${savingsRate}%
- Top Expense Categories: ${JSON.stringify(topCategories)}
- Sample Recent Transactions: ${JSON.stringify(transactions.slice(0, 30))}

Required AI Output:
1. financialHealthScore: Numeric integer between 1 and 100 based on savings rate, budget adherence, and volatility.
2. healthRating: One of "Exceptional", "Strong", "Moderate", "At Risk", "Critical".
3. executiveSummary: 2-3 concise, analytical sentences explaining financial performance and cash-flow health.
4. historicalTrends: Object with monthlyIncomeAverage, monthlyExpenseAverage, savingsRatePercentage, volatilityIndex ("Low", "Moderate", or "High"), and burnRateTrajectory.
5. spendingLeaks: Array of 2 to 3 detected cost leakages or inefficiencies with title, description, estimatedWastedMonthly (number), and urgency ("Immediate", "Warning", "Consideration").
6. optimizationRecommendations: Array of 3 to 5 concrete budget optimization recommendations with category, currentMonthlySpend, recommendedSpend, potentialMonthlySavings, annualImpact (potentialMonthlySavings * 12), actionStep, and difficulty ("Easy", "Moderate", "Strict").
7. totalPotentialMonthlySavings: sum of potential monthly savings.
8. totalAnnualSavingsProjection: sum of annual savings.
9. runwayAndMilestones: Object with currentEmergencyRunwayMonths, optimizedRunwayMonths, and a milestoneMessage detailing goal attainment.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            financialHealthScore: { type: Type.INTEGER },
            healthRating: { type: Type.STRING },
            executiveSummary: { type: Type.STRING },
            historicalTrends: {
              type: Type.OBJECT,
              properties: {
                monthlyIncomeAverage: { type: Type.NUMBER },
                monthlyExpenseAverage: { type: Type.NUMBER },
                savingsRatePercentage: { type: Type.NUMBER },
                volatilityIndex: { type: Type.STRING },
                burnRateTrajectory: { type: Type.STRING },
              },
              required: ["monthlyIncomeAverage", "monthlyExpenseAverage", "savingsRatePercentage", "volatilityIndex", "burnRateTrajectory"],
            },
            spendingLeaks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  estimatedWastedMonthly: { type: Type.NUMBER },
                  urgency: { type: Type.STRING },
                },
                required: ["title", "description", "estimatedWastedMonthly", "urgency"],
              },
            },
            optimizationRecommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  currentMonthlySpend: { type: Type.NUMBER },
                  recommendedSpend: { type: Type.NUMBER },
                  potentialMonthlySavings: { type: Type.NUMBER },
                  annualImpact: { type: Type.NUMBER },
                  actionStep: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                },
                required: ["category", "currentMonthlySpend", "recommendedSpend", "potentialMonthlySavings", "annualImpact", "actionStep", "difficulty"],
              },
            },
            totalPotentialMonthlySavings: { type: Type.NUMBER },
            totalAnnualSavingsProjection: { type: Type.NUMBER },
            runwayAndMilestones: {
              type: Type.OBJECT,
              properties: {
                currentEmergencyRunwayMonths: { type: Type.NUMBER },
                optimizedRunwayMonths: { type: Type.NUMBER },
                milestoneMessage: { type: Type.STRING },
              },
              required: ["currentEmergencyRunwayMonths", "optimizedRunwayMonths", "milestoneMessage"],
            },
          },
          required: [
            "financialHealthScore",
            "healthRating",
            "executiveSummary",
            "historicalTrends",
            "spendingLeaks",
            "optimizationRecommendations",
            "totalPotentialMonthlySavings",
            "totalAnnualSavingsProjection",
            "runwayAndMilestones",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({
      ...parsed,
      analyzedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
  } catch (err: any) {
    console.error("Gemini historical analysis error, falling back to heuristics:", err?.message);
    res.json(generateHeuristicResult());
  }
});

// 5. Cloud Synchronization (Multi-Device Sync API) — Firestore-backed, persists across restarts/instances
app.post("/api/sync", async (req, res) => {
  const { userId = "default_user", records = [], categories = [], settings = {}, familyMembers = [] } = req.body;

  if (!db) {
    res.status(503).json({ error: "Cloud sync storage not configured (FIREBASE_SERVICE_ACCOUNT_JSON missing)." });
    return;
  }

  try {
    const docRef = db.collection("cloudSync").doc(userId);
    const snap = await docRef.get();
    const existing: SyncStoreData = snap.exists
      ? (snap.data() as SyncStoreData)
      : { records: [], categories: [], settings: {}, familyMembers: [], lastSyncedAt: new Date().toISOString() };

    // Merge records by unique ID, keeping newest modification
    const recordMap = new Map<string, any>();
    for (const r of existing.records || []) recordMap.set(r.id, r);
    for (const r of records) recordMap.set(r.id, r);

    const mergedRecords = Array.from(recordMap.values());
    const now = new Date().toISOString();

    const updatedData: SyncStoreData = {
      records: mergedRecords,
      categories: categories.length > 0 ? categories : existing.categories,
      settings: { ...existing.settings, ...settings },
      familyMembers: familyMembers.length > 0 ? familyMembers : existing.familyMembers,
      lastSyncedAt: now,
    };

    await docRef.set(updatedData);

    res.json({
      success: true,
      syncedAt: now,
      mergedCount: mergedRecords.length,
      data: updatedData,
    });
  } catch (err: any) {
    console.error("Firestore sync error:", err?.message);
    res.status(500).json({ error: "Sync failed", details: err?.message });
  }
});

app.get("/api/sync/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!db) {
    res.status(503).json({ error: "Cloud sync storage not configured (FIREBASE_SERVICE_ACCOUNT_JSON missing)." });
    return;
  }

  try {
    const snap = await db.collection("cloudSync").doc(userId).get();
    if (!snap.exists) {
      res.json({ found: false, message: "No remote cloud data found for user yet." });
      return;
    }
    res.json({ found: true, data: snap.data() });
  } catch (err: any) {
    console.error("Firestore fetch error:", err?.message);
    res.status(500).json({ error: "Fetch failed", details: err?.message });
  }
});

// 6. Vite / Static serving (only for traditional hosting — local dev, Cloud Run, Render, etc.)
// On Vercel, this file runs as a serverless function per request (see vercel.json),
// so we skip app.listen() and instead export the Express app itself.
if (!process.env.VERCEL) {
  async function startServer() {
    if (process.env.NODE_ENV !== "production") {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (_req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Spoken Ledger server running on http://0.0.0.0:${PORT}`);
    });
  }

  startServer();
}

export default app;
