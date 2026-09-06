import React, { useState } from 'react';
import {
  X,
  Users,
  UserPlus,
  Shield,
  Trash2,
  Check,
  Lock,
  Eye,
  PlusCircle,
  FileSpreadsheet
} from 'lucide-react';
import { FamilyMember } from '../types';

interface FamilyAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  onUpdateMembers: (members: FamilyMember[]) => void;
}

export const FamilyAccessModal: React.FC<FamilyAccessModalProps> = ({
  isOpen,
  onClose,
  members,
  onUpdateMembers
}) => {
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<'manager' | 'contributor' | 'viewer'>('contributor');

  const [permissions, setPermissions] = useState({
    canView: true,
    canAdd: true,
    canEditDelete: false,
    canViewAnalytics: true,
    canExportReports: false,
    canManageBudget: false
  });

  if (!isOpen) return null;

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const newMember: FamilyMember = {
      id: 'mem_' + Date.now(),
      name: name.trim(),
      email: email.trim(),
      role,
      permissions,
      joinedAt: new Date().toISOString().slice(0, 10)
    };

    onUpdateMembers([...members, newMember]);
    setName('');
    setEmail('');
    setShowAddForm(false);
  };

  const handleTogglePermission = (memberId: string, permKey: keyof FamilyMember['permissions']) => {
    const updated = members.map((m) => {
      if (m.id === memberId) {
        return {
          ...m,
          permissions: {
            ...m.permissions,
            [permKey]: !m.permissions[permKey]
          }
        };
      }
      return m;
    });
    onUpdateMembers(updated);
  };

  const handleRemoveMember = (id: string) => {
    onUpdateMembers(members.filter((m) => m.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold font-serif text-lg sm:text-xl text-slate-900 dark:text-white">
                Family & Staff Granular Sub-Access
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Grant controlled access to spouses, family members, or business bookkeepers.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Members List */}
        <div className="space-y-4 mb-6">
          {members.map((m) => {
            const isOwner = m.role === 'owner';

            return (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {m.name}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          isOwner
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {m.role}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      {m.email}
                    </div>
                  </div>

                  {!isOwner && (
                    <button
                      onClick={() => handleRemoveMember(m.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Revoke access"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Granular Permission Toggles */}
                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Granular Permission Settings
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {[
                      { key: 'canView', label: 'View Ledger' },
                      { key: 'canAdd', label: 'Add Records' },
                      { key: 'canEditDelete', label: 'Edit / Delete' },
                      { key: 'canViewAnalytics', label: 'View Analytics' },
                      { key: 'canExportReports', label: 'Export Tax PDF' },
                      { key: 'canManageBudget', label: 'Set Limits' }
                    ].map((p) => {
                      const pKey = p.key as keyof FamilyMember['permissions'];
                      const isEnabled = m.permissions[pKey];

                      return (
                        <label
                          key={p.key}
                          className={`flex items-center gap-1.5 p-1.5 rounded-lg text-[11px] font-medium transition cursor-pointer select-none ${
                            isOwner
                              ? 'opacity-80 cursor-default bg-slate-200/50 dark:bg-slate-700/50'
                              : isEnabled
                              ? 'bg-amber-100/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300'
                              : 'bg-white dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          <input
                            type="checkbox"
                            disabled={isOwner}
                            checked={isEnabled}
                            onChange={() => !isOwner && handleTogglePermission(m.id, pKey)}
                            className="w-3.5 h-3.5 rounded text-amber-500"
                          />
                          <span>{p.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Member Form or Trigger */}
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <UserPlus className="w-4 h-4 text-amber-500" />
            <span>Invite Family Member or Staff</span>
          </button>
        ) : (
          <form onSubmit={handleAddMember} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-200">
              New Sub-Account Details
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Full Name (e.g. Alex)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow"
              >
                Add Sub-User
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
