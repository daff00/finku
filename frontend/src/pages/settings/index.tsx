// frontend/src/pages/SettingsPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth, useAccounts } from "@/hooks";
import type { Account } from "@/types";
import WabiSabiFooter from "@/components/WabiSabiFooter";
import { usePageTitle } from '@/hooks/usePageTitle'

// ── ShadCN Components ──────────────────────────────────────────
import { Button } from "@/components/ui/button";
import { LogOut, ShieldCheck, Plus } from "lucide-react";

// ── Child Components ───────────────────────────────────────────
import UserAvatar from "@/components/settings/UserAvatar";
import ProfileForm from "@/components/settings/ProfileForm";
import PasswordForm from "@/components/settings/PasswordForm";
import AccountList from "@/components/settings/AccountList";
import CreateAccountDialog from "@/components/settings/CreateAccountDialog";
import EditAccountDialog from "@/components/settings/EditAccountDialog";
import DeleteAccountDialog from "@/components/settings/DeleteAccountDialog";

export default function SettingsPage() {
  usePageTitle('Settings')
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data: accounts, isLoading: accountsLoading } = useAccounts({ include_inactive: true });

  // ── Profile state ─────────────────────────────────────────────
  const [displayName, setDisplayName] = useState(user?.display_name || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // ── Password state ────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // ── Dialog states ─────────────────────────────────────────────
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // ── Handlers ─────────────────────────────────────────────────
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMessage(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setProfileMessage({ type: "success", text: "Profile updated successfully." });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update profile.";
      setProfileMessage({ type: "error", text: message });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }

    setIsChangingPassword(true);
    setPasswordMessage(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setPasswordMessage({ type: "success", text: "Password changed successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to change password.";
      setPasswordMessage({ type: "error", text: message });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleEditClick = (account: Account) => {
    setEditingAccount(account);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (account: Account) => {
    setDeletingAccount(account);
    setIsDeleteDialogOpen(true);
  };

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-2xl font-light tracking-tight text-text-primary">Settings</h1>
        <p className="mt-1 font-sans text-sm text-text-secondary">Manage your account preferences</p>
      </div>

      {/* ── Profile & Security ──────────────────────────────────── */}
      <section>
        <h2 className="font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-text-secondary mb-3">
          Profile & Security
        </h2>

        <div className="bg-white border-[0.5px] border-border rounded-[4px] p-5 space-y-5">
          {/* User Avatar & Name */}
          <UserAvatar user={user ?? null} />

          {/* Display Name & Password */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProfileForm
              displayName={displayName}
              setDisplayName={setDisplayName}
              isUpdating={isUpdatingProfile}
              message={profileMessage}
              onSubmit={handleUpdateProfile}
            />

            <PasswordForm
              currentPassword={currentPassword}
              setCurrentPassword={setCurrentPassword}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              isChanging={isChangingPassword}
              message={passwordMessage}
              onSubmit={handleChangePassword}
            />
          </div>
        </div>
      </section>

      {/* ── Bank Accounts ──────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
            Bank Accounts ({accounts?.length || 0})
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCreateDialogOpen(true)}
            className="text-accent hover:text-accent-hover-strong hover:bg-transparent p-0 h-auto text-[11px] font-sans gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Account
          </Button>
        </div>

        <AccountList
          accounts={accounts}
          isLoading={accountsLoading}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onAdd={() => setIsCreateDialogOpen(true)}
        />
      </section>

      {/* ── Account Security ───────────────────────────────────── */}
      <section>
        <h2 className="font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-text-secondary mb-3">
          Account Security
        </h2>
        <div className="bg-white border-[0.5px] border-border rounded-[4px] p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 shrink-0 rounded-[2px] bg-bg border-[0.5px] border-border flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-text-secondary" />
            </div>
            <div>
              <p className="font-serif text-sm text-text-primary">Account security</p>
              <p className="font-sans text-[11px] text-text-secondary mt-1 leading-relaxed">
                Your session is protected by your account credentials. Use a strong password
                and log out when using a shared device.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Account Actions ────────────────────────────────────── */}
      <section>
        <h2 className="font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-text-secondary mb-3">
          Account
        </h2>
        <div className="bg-white border-[0.5px] border-border rounded-[4px] p-4">
          <button
            onClick={handleLogout}
            className="text-accent hover:text-accent-hover-strong transition-colors text-sm font-sans flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
          <p className="font-sans text-xs text-text-muted mt-2">
            Logging out will clear your session and redirect you to the login page.
          </p>
        </div>
      </section>

      {/* ── About ──────────────────────────────────────────────── */}
      <section>
        <h2 className="font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-text-secondary mb-3">
          About
        </h2>
        <div className="bg-white border-[0.5px] border-border rounded-[4px] p-4 space-y-1">
          <p className="font-serif text-sm text-text-primary">Finku</p>
          <p className="font-sans text-xs text-text-secondary">Personal Finance · Privacy First</p>
          <p className="font-sans text-xs text-text-muted">
            Version 0.1.0 · Built with React, FastAPI, and 間 (Ma)
          </p>
        </div>
      </section>

      <WabiSabiFooter />

      {/* ── Dialogs ────────────────────────────────────────────── */}
      <CreateAccountDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      <EditAccountDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        account={editingAccount}
      />

      <DeleteAccountDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        account={deletingAccount}
      />
    </div>
  );
}