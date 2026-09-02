import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LockKeyhole, CheckCircle, AlertCircle } from "lucide-react";

interface PasswordFormProps {
  currentPassword: string;
  setCurrentPassword: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  isChanging: boolean;
  message: { type: "success" | "error"; text: string } | null;
  onSubmit: (e: React.FormEvent) => void;
}

export default function PasswordForm({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  isChanging,
  message,
  onSubmit,
}: PasswordFormProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] bg-bg">
          <LockKeyhole className="h-3.5 w-3.5 text-text-secondary" />
        </div>

        <div>
          <Label className="font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
            Change Password
          </Label>
          <p className="mt-0.5 font-sans text-[10px] text-text-hint">
            At least 8 characters.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <Input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="
            h-auto w-full
            !border-0 !border-b !border-border
            !rounded-none
            !bg-transparent
            !px-0 !py-1.5
            !font-sans !text-[13px] !text-text-primary
            !shadow-none
            !outline-none !ring-0
            placeholder:!text-text-muted
            focus:!border-text-primary
            focus:!outline-none
            focus:!ring-0
          "
          placeholder="Current password"
          required
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="
              h-auto w-full
              !border-0 !border-b !border-border
              !rounded-none
              !bg-transparent
              !px-0 !py-1.5
              !font-sans !text-[13px] !text-text-primary
              !shadow-none
              !outline-none !ring-0
              placeholder:!text-text-muted
              focus:!border-text-primary
              focus:!outline-none
              focus:!ring-0
            "
            placeholder="New password"
            minLength={8}
            required
          />

          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="
              h-auto w-full
              !border-0 !border-b !border-border
              !rounded-none
              !bg-transparent
              !px-0 !py-1.5
              !font-sans !text-[13px] !text-text-primary
              !shadow-none
              !outline-none !ring-0
              placeholder:!text-text-muted
              focus:!border-text-primary
              focus:!outline-none
              focus:!ring-0
            "
            placeholder="Confirm password"
            minLength={8}
            required
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {message ? (
            <div
              className={`
                flex items-center gap-2
                rounded-[4px] border-[0.5px]
                px-3 py-2
                text-[11px]
                ${message.type === "success"
                  ? "border-success-subtle-border bg-success-subtle-bg text-color-income"
                  : "border-danger-subtle-border bg-danger-subtle-bg text-accent"
                }
              `}
            >
              {message.type === "success" ? (
                <CheckCircle className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              )}
              <span className="font-sans leading-relaxed">{message.text}</span>
            </div>
          ) : (
            <div />
          )}

          <Button
            type="submit"
            disabled={isChanging}
            className="
              h-9 w-full shrink-0
              !rounded-[4px]
              !border-0
              !bg-accent
              !px-4
              !font-sans !text-[11px] !font-medium !text-white
              !shadow-none
              transition-colors
              hover:!bg-accent-hover-strong
              disabled:!opacity-50 disabled:!cursor-not-allowed
              sm:w-auto
            "
          >
            {isChanging ? "Changing..." : "Change Password"}
          </Button>
        </div>
      </form>
    </div>
  );
}