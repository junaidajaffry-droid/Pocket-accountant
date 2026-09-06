import { CURRENCIES } from '../data/defaults';

export function formatCurrency(amount: number, currencyCode: string = 'USD'): string {
  const curr = CURRENCIES[currencyCode] || { symbol: currencyCode, code: currencyCode };
  const rounded = Math.round(amount * 100) / 100;
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(rounded);
  } catch {
    return `${curr.symbol} ${rounded.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }
}

export function convertCurrency(
  amount: number,
  fromCode: string,
  toCode: string
): number {
  if (fromCode === toCode) return amount;
  const fromRate = CURRENCIES[fromCode]?.rateToUSD || 1;
  const toRate = CURRENCIES[toCode]?.rateToUSD || 1;

  // Amount in USD = amount / fromRate
  const usd = amount / fromRate;
  // Amount in toCode = usd * toRate
  return usd * toRate;
}
