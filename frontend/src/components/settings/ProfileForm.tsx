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
    <div>
      <Label className="font-sans text-[10px] uppercase font-semibold text-[#8B7355] tracking-[0.12em]">
        Display Name
      </Label>
      <form onSubmit={onSubmit} className="mt-1.5 space-y-2">
        <div className="flex items-center gap-2">
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="flex-1 h-auto rounded-none border-0 border-b border-[#E8E4DE] px-0 py-1 shadow-none bg-transparent text-[#1C1410] font-sans text-sm focus:border-[#1C1410] focus:ring-0 focus:outline-none placeholder:text-[#C4B5A0]"
            placeholder="Your display name"
          />
          <Button
            type="submit"
            disabled={isUpdating}
            variant="ghost"
            size="sm"
            className="text-[#8B7355] hover:text-[#1C1410] hover:bg-[#FAFAF8] rounded-[4px] text-[11px] px-3 py-1 h-auto"
          >
            {isUpdating ? "Saving..." : "Save"}
          </Button>
        </div>
        {message && (
          <div className={`text-[10px] font-sans flex items-center gap-1 ${
            message.type === "success" ? "text-[#27AE60]" : "text-[#C0392B]"
          }`}>
            {message.type === "success" ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
            <span>{message.text}</span>
          </div>
        )}
      </form>
    </div>
  );
}