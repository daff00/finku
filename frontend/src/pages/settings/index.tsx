// frontend/src/pages/SettingsPage.tsx
import { useState } from 'react';
import { useAuth, useAccounts } from '@/hooks';
import { BANK_COLORS, BANK_LABELS } from '@/lib/constants';
import type { Account } from '@/types';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { data: accounts, isLoading: accountsLoading } = useAccounts();

  // ── Profile form ─────────────────────────────────────────────
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  // ── Password form ─────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');

  // ── Handlers ──────────────────────────────────────────────────
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMessage('');
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setProfileMessage('Profile updated successfully.');
    } catch (err: any) {
      setProfileMessage(err.message || 'Failed to update profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage('New passwords do not match.');
      return;
    }
    setIsChangingPassword(true);
    setPasswordMessage('');
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setPasswordMessage('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMessage(err.message || 'Failed to change password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAddAccount = () => {
    // TODO: open modal or navigate to add account page
    alert('Add account functionality coming soon.');
  };

  return (
    <div className="space-y-8">
      {/* ── Page Title ────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-light text-text-primary tracking-tight font-serif">
          Settings
        </h1>
        <p className="text-sm text-text-muted mt-1 font-sans">
          Manage your account preferences
        </p>
      </div>

      {/* ── Profile ────────────────────────────────────────────── */}
      <section>
        <h2 className="label-section mb-3 font-serif">Profile</h2>
        <div className="card p-6 space-y-4 max-w-md">
          <div>
            <label className="text-xs uppercase tracking-[0.12em] text-text-muted font-sans">
              Username
            </label>
            <p className="text-text-primary font-mono text-sm mt-1">{user?.username}</p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-3">
            <div>
              <label
                htmlFor="displayName"
                className="text-xs uppercase tracking-[0.12em] text-text-muted font-sans block mb-1"
              >
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full input-underline"
                placeholder="Your display name"
              />
            </div>

            {profileMessage && (
              <p
                className={`text-xs ${
                  profileMessage.includes('successfully')
                    ? 'text-income'
                    : 'text-expense'
                }`}
              >
                {profileMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="btn-accent text-sm px-4 py-2"
            >
              {isUpdatingProfile ? 'Saving...' : 'Update Profile'}
            </button>
          </form>
        </div>
      </section>

      {/* ── Bank Accounts Management ─────────────────────────── */}
      <section>
        <h2 className="label-section mb-3 font-serif">Kelola Rekening Bank</h2>
        <div className="card p-6 space-y-3 max-w-md">
          {accountsLoading ? (
            <div className="space-y-2 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 bg-border/50 rounded-[4px]" />
              ))}
            </div>
          ) : accounts && accounts.length > 0 ? (
            <div className="space-y-2">
              {accounts.map((account: Account) => {
                const bankColor = BANK_COLORS[account.bank] || '#6B7280';
                const bankLabel = BANK_LABELS[account.bank] || account.bank;
                // Simulate last 4 digits from account name (or a placeholder)
                const lastFour = account.name.slice(-4) || '••••';

                return (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-3 rounded-[4px] border-l-[3px] bg-[#FAFAF8] hover:bg-[#F2EFE9] transition-colors"
                    style={{ borderLeftColor: bankColor }}
                  >
                    <div className="min-w-0">
                      <div className="font-serif text-sm font-medium text-text-primary truncate">
                        {account.name}
                      </div>
                      <div className="font-sans text-xs text-text-muted">
                        {bankLabel} • {lastFour}
                      </div>
                    </div>
                    {account.is_active === false && (
                      <span className="text-[9px] uppercase text-text-muted bg-border/30 px-1.5 py-0.5 rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-text-muted text-sm font-sans">
              No bank accounts added yet.
            </p>
          )}

          <button
            onClick={handleAddAccount}
            className="w-full mt-2 border border-dashed border-border/70 rounded-[4px] py-3 text-sm text-text-muted hover:text-accent hover:border-accent/50 transition-colors font-sans flex items-center justify-center gap-2"
          >
            <span className="text-lg font-light">+</span> Tambah Rekening
          </button>
        </div>
      </section>

      {/* ── Change Password ────────────────────────────────────── */}
      <section>
        <h2 className="label-section mb-3 font-serif">Change Password</h2>
        <div className="card p-6 space-y-4 max-w-md">
          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label
                htmlFor="currentPassword"
                className="text-xs uppercase tracking-[0.12em] text-text-muted font-sans block mb-1"
              >
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full input-underline"
                placeholder="Enter current password"
                required
              />
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="text-xs uppercase tracking-[0.12em] text-text-muted font-sans block mb-1"
              >
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full input-underline"
                placeholder="Enter new password"
                required
                minLength={8}
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="text-xs uppercase tracking-[0.12em] text-text-muted font-sans block mb-1"
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full input-underline"
                placeholder="Confirm new password"
                required
                minLength={8}
              />
            </div>

            {passwordMessage && (
              <p
                className={`text-xs ${
                  passwordMessage.includes('successfully')
                    ? 'text-income'
                    : 'text-expense'
                }`}
              >
                {passwordMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isChangingPassword}
              className="btn-accent text-sm px-4 py-2"
            >
              {isChangingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </section>

      {/* ── Account Actions ────────────────────────────────────── */}
      <section>
        <h2 className="label-section mb-3 font-serif">Account</h2>
        <div className="card p-6 space-y-4 max-w-md">
          <button
            onClick={logout}
            className="text-expense hover:text-expense/80 transition-colors text-sm font-sans text-left"
          >
            Log Out
          </button>
          <p className="text-xs text-text-muted">
            Logging out will clear your session and redirect you to the login page.
          </p>
        </div>
      </section>

      {/* ── About ────────────────────────────────────────────────── */}
      <section>
        <h2 className="label-section mb-3 font-serif">About</h2>
        <div className="card p-6 space-y-1 max-w-md">
          <p className="text-sm text-text-primary font-serif">Finku</p>
          <p className="text-xs text-text-muted font-sans">
            Personal Finance · Privacy First
          </p>
          <p className="text-xs text-text-muted/60 font-sans">
            Version 0.1.0 · Built with React, FastAPI, and 間 (Ma)
          </p>
        </div>
      </section>

      {/* ── Wabi-Sabi Footer ──────────────────────────────────── */}
      <div className="border-t border-dashed border-border/50 pt-6 mt-8">
        <p className="text-center text-[11px] text-text-muted/60 leading-relaxed max-w-md mx-auto font-serif">
          WABI-SABI · 伝家
        </p>
        <p className="text-center text-[10px] text-text-muted/40 leading-relaxed max-w-md mx-auto mt-1 font-sans">
          Menghargai proses finansial bertahap. Fokus pada kejelasan angka,<br />
          kurangi distraksi, dan jaga ruang bernapas (Ma).
        </p>
      </div>
    </div>
  );
}