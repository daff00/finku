import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, AlertCircle } from "lucide-react";

interface ProfileFormProps {
  displayName: string;
  setDisplayName: (value: string) => void;
  isUpdating: boolean;
  message: { type: "success" | "error"; text: string } | null;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ProfileForm({
  displayName,
  setDisplayName,
  isUpdating,
  message,
  onSubmit,
}: ProfileFormProps) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
          Display Name
        </Label>
        <p className="mt-0.5 font-sans text-[10px] text-text-hint">
          Shown throughout your account.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="
              h-auto flex-1
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
            placeholder="Your display name"
          />

          <Button
            type="submit"
            disabled={isUpdating}
            className="
              h-9 shrink-0
              !rounded-[4px]
              !border-0
              !bg-accent
              !px-4
              !font-sans !text-[11px] !font-medium !text-white
              !shadow-none
              transition-colors
              hover:!bg-accent-hover-strong
              disabled:!opacity-50 disabled:!cursor-not-allowed
            "
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {message && (
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
        )}
      </form>
    </div>
  );
}