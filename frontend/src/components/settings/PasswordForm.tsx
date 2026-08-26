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
    <div>
      <div className="flex items-center gap-1.5">
        <LockKeyhole className="w-3.5 h-3.5 text-[#8B7355]" />
        <Label className="font-sans text-[10px] uppercase font-semibold text-[#8B7355] tracking-[0.12em]">
          Change Password
        </Label>
      </div>
      <form onSubmit={onSubmit} className="mt-1.5 space-y-2">
        <Input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full h-auto rounded-none border-0 border-b border-[#E8E4DE] px-0 py-1 shadow-none bg-transparent text-[#1C1410] font-sans text-sm focus:border-[#1C1410] focus:ring-0 focus:outline-none placeholder:text-[#C4B5A0]"
          placeholder="Current password"
          required
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full h-auto rounded-none border-0 border-b border-[#E8E4DE] px-0 py-1 shadow-none bg-transparent text-[#1C1410] font-sans text-sm focus:border-[#1C1410] focus:ring-0 focus:outline-none placeholder:text-[#C4B5A0]"
            placeholder="New password"
            minLength={8}
            required
          />
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full h-auto rounded-none border-0 border-b border-[#E8E4DE] px-0 py-1 shadow-none bg-transparent text-[#1C1410] font-sans text-sm focus:border-[#1C1410] focus:ring-0 focus:outline-none placeholder:text-[#C4B5A0]"
            placeholder="Confirm password"
            minLength={8}
            required
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          {message && (
            <div className={`text-[10px] font-sans flex items-center gap-1 ${
              message.type === "success" ? "text-[#27AE60]" : "text-[#C0392B]"
            }`}>
              {message.type === "success" ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
              <span>{message.text}</span>
            </div>
          )}
          <Button
            type="submit"
            disabled={isChanging}
            variant="ghost"
            size="sm"
            className="text-[#8B7355] hover:text-[#1C1410] hover:bg-[#FAFAF8] rounded-[4px] text-[11px] px-3 py-1 h-auto"
          >
            {isChanging ? "Changing..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}