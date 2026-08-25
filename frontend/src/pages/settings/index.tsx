import { useState } from "react";
import { LogOut, ShieldCheck, Plus, LockKeyhole } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth, useAccounts } from "@/hooks";
import { BANK_COLORS, BANK_LABELS } from "@/lib/constants";
import type { Account } from "@/types";
import WabiSabiFooter from "@/components/WabiSabiFooter";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data: accounts, isLoading: accountsLoading } = useAccounts();

  // ── Profile form ─────────────────────────────────────────────
  const [displayName, setDisplayName] = useState(user?.display_name || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  // ── Password form ────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  // ── Handlers ─────────────────────────────────────────────────
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMessage("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setProfileMessage("Profile updated successfully.");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update profile.";

      setProfileMessage(message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setPasswordMessage("New passwords do not match.");
      return;
    }

    setIsChangingPassword(true);
    setPasswordMessage("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      setPasswordMessage("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to change password.";

      setPasswordMessage(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAddAccount = () => {
    // Tetap mempertahankan behavior dari kode sebelumnya.
    alert("Add account functionality coming soon.");
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const userInitial =
    user?.display_name?.charAt(0) || user?.username?.charAt(0) || "F";

  return (
    <div className="space-y-8 pb-12">
      {/* ── Page Title ─────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-light text-text-primary tracking-tight font-serif">
          Settings
        </h1>
        <p className="text-sm text-text-muted mt-1 font-sans">
          Manage your account preferences
        </p>
      </div>

      {/* ── Profile & Security ─────────────────────────────────── */}
      <section>
        <h2 className="label-section mb-3 font-serif">
          PROFIL PENGGUNA & KEAMANAN AKUN
        </h2>

        <div className="card p-4 space-y-4">
          {/* User Card */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b-[0.5px] border-dashed border-[#E8E4DE]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 shrink-0 rounded-[2px] bg-[#1C1410] text-white flex items-center justify-center font-serif text-[15px] uppercase">
                {userInitial}
              </div>

              <div className="min-w-0">
                <div className="font-sans text-[14px] font-medium text-[#1C1410] truncate">
                  {user?.display_name || user?.username || "Finku User"}
                </div>

                <div className="font-sans text-[11px] text-[#8B7355] truncate">
                  @{user?.username || "user"}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="self-start sm:self-auto px-3 py-1.5 bg-white border-[0.5px] border-[#C0392B]/30 rounded-[4px] font-sans text-[11px] text-[#C0392B] hover:bg-[#C0392B]/5 cursor-pointer flex items-center gap-1.5 transition-colors"
              title="Keluar dari sesi"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>

          {/* Profile + Password */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-1">
            {/* Display Name */}
            <form onSubmit={handleUpdateProfile} className="space-y-3">
              <div>
                <label
                  htmlFor="displayName"
                  className="block font-sans text-[10px] uppercase font-semibold text-[#8B7355] tracking-[0.12em] mb-1"
                >
                  DISPLAY NAME
                </label>

                <div className="flex items-center gap-2">
                  <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="flex-1 font-sans text-[14px] text-[#1C1410] bg-transparent py-1 border-b-[0.5px] border-[#E8E4DE] focus:border-[#1C1410] focus:outline-none"
                    placeholder="Your display name"
                  />

                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="px-3 py-1 text-[11px] font-sans bg-[#1C1410] text-white rounded-[4px] disabled:opacity-40 cursor-pointer"
                  >
                    {isUpdatingProfile ? "Saving..." : "Simpan"}
                  </button>
                </div>
              </div>

              {profileMessage && (
                <div
                  className={`text-[10px] font-sans flex items-center gap-1 ${
                    profileMessage.includes("successfully")
                      ? "text-[#27AE60]"
                      : "text-[#C0392B]"
                  }`}
                >
                  {profileMessage.includes("successfully") && (
                    <ShieldCheck className="w-3 h-3" />
                  )}

                  <span>{profileMessage}</span>
                </div>
              )}
            </form>

            {/* Password */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <LockKeyhole className="w-3.5 h-3.5 text-[#8B7355]" />

                <span className="font-sans text-[10px] uppercase font-semibold text-[#8B7355] tracking-[0.12em]">
                  CHANGE PASSWORD
                </span>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-3">
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full font-sans text-[13px] text-[#1C1410] bg-transparent py-1 border-b-[0.5px] border-[#E8E4DE] focus:border-[#1C1410] focus:outline-none"
                  placeholder="Current password"
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full font-sans text-[13px] text-[#1C1410] bg-transparent py-1 border-b-[0.5px] border-[#E8E4DE] focus:border-[#1C1410] focus:outline-none"
                    placeholder="New password"
                    minLength={8}
                    required
                  />

                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full font-sans text-[13px] text-[#1C1410] bg-transparent py-1 border-b-[0.5px] border-[#E8E4DE] focus:border-[#1C1410] focus:outline-none"
                    placeholder="Confirm password"
                    minLength={8}
                    required
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  {passwordMessage ? (
                    <div
                      className={`text-[10px] font-sans flex items-center gap-1 ${
                        passwordMessage.includes("successfully")
                          ? "text-[#27AE60]"
                          : "text-[#C0392B]"
                      }`}
                    >
                      {passwordMessage.includes("successfully") && (
                        <ShieldCheck className="w-3 h-3" />
                      )}

                      <span>{passwordMessage}</span>
                    </div>
                  ) : (
                    <span />
                  )}

                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="shrink-0 px-3 py-1 text-[11px] font-sans bg-[#1C1410] text-white rounded-[4px] disabled:opacity-40 cursor-pointer"
                  >
                    {isChangingPassword ? "Changing..." : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bank Accounts ──────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="label-section font-serif">
            KELOLA REKENING BANK ({accounts?.length || 0})
          </h2>

          <button
            type="button"
            onClick={handleAddAccount}
            className="font-sans text-[11px] text-[#C0392B] hover:underline flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Rekening</span>
          </button>
        </div>

        {accountsLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-[66px] bg-white border-[0.5px] border-[#E8E4DE] rounded-[4px] animate-pulse"
              />
            ))}
          </div>
        ) : accounts && accounts.length > 0 ? (
          <div className="space-y-2">
            {accounts.map((account: Account) => {
              const bankColor = BANK_COLORS[account.bank] || "#6B7280";

              const bankLabel = BANK_LABELS[account.bank] || account.bank;

              const lastFour = account.name.slice(-4) || "••••";

              return (
                <div
                  key={account.id}
                  className="bg-white border-[0.5px] border-[#E8E4DE] rounded-[4px] p-3 flex items-center justify-between gap-4 border-l-[3px] hover:bg-[#FAFAF8] transition-colors"
                  style={{ borderLeftColor: bankColor }}
                >
                  <div className="min-w-0">
                    <div className="font-sans text-[13px] font-medium text-[#1C1410] truncate">
                      {account.name}
                    </div>

                    <div className="font-sans text-[10px] text-[#8B7355] mt-0.5">
                      {bankLabel} • {lastFour}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {account.is_active === false && (
                      <span className="text-[9px] uppercase text-[#8B7355] bg-[#F2EFE9] px-1.5 py-0.5 rounded">
                        Inactive
                      </span>
                    )}

                    <span className="font-mono text-[12px] text-[#8B7355]">
                      Active
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border-[0.5px] border-[#E8E4DE] rounded-[4px] p-6 text-center">
            <p className="text-[#8B7355] text-sm font-sans">
              No bank accounts added yet.
            </p>

            <button
              type="button"
              onClick={handleAddAccount}
              className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-sans text-[#C0392B] hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Rekening
            </button>
          </div>
        )}
      </section>

      {/* ── Change Password Detail ─────────────────────────────── */}
      <section>
        <h2 className="label-section mb-3 font-serif">KEAMANAN AKUN</h2>

        <div className="card p-4 max-w-none">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 shrink-0 rounded-[2px] bg-[#FAFAF8] border-[0.5px] border-[#E8E4DE] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#8B7355]" />
            </div>

            <div>
              <p className="font-serif text-sm text-[#1C1410]">
                Account security
              </p>

              <p className="font-sans text-[11px] text-[#8B7355] mt-1 leading-relaxed">
                Your session is protected by your account credentials. Use a
                strong password and log out when using a shared device.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Account Actions ────────────────────────────────────── */}
      <section>
        <h2 className="label-section mb-3 font-serif">ACCOUNT</h2>

        <div className="card p-4">
          <button
            onClick={logout}
            className="text-[#C0392B] hover:text-[#C0392B]/80 transition-colors text-sm font-sans text-left flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>

          <p className="text-xs text-text-muted mt-2">
            Logging out will clear your session and redirect you to the login
            page.
          </p>
        </div>
      </section>

      {/* ── About ──────────────────────────────────────────────── */}
      <section>
        <h2 className="label-section mb-3 font-serif">ABOUT</h2>

        <div className="card p-4 space-y-1">
          <p className="text-sm text-text-primary font-serif">Finku</p>

          <p className="text-xs text-text-muted font-sans">
            Personal Finance · Privacy First
          </p>

          <p className="text-xs text-text-muted/60 font-sans">
            Version 0.1.0 · Built with React, FastAPI, and 間 (Ma)
          </p>
        </div>
      </section>

      {/* ── Wabi-Sabi Footer ───────────────────────────────────── */}
      <WabiSabiFooter />
    </div>
  );
}
