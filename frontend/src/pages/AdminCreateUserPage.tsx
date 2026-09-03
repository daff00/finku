// frontend/src/pages/AdminCreateUserPage.tsx
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { authService } from "@/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePageTitle } from "@/hooks";

export default function AdminCreateUserPage() {
  usePageTitle("Create User");

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminKey, setShowAdminKey] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        username,
        password,
        display_name: displayName || username,
        adminKey,
      });
      setSuccess(`User "${username}" created successfully.`);
      setUsername("");
      setDisplayName("");
      setPassword("");
      // Deliberately keep adminKey filled in case you're creating multiple users in a row
    } catch (err: any) {
      setError(err.message || "Failed to create user.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "h-auto rounded-none border-0 border-b border-border px-0 py-2 shadow-none bg-transparent text-text-primary placeholder:text-text-muted/60 focus:border-accent focus-visible:ring-0 transition-colors";

  return (
    <div className="min-h-dvh flex items-center justify-center px-6 bg-bg">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <div className="size-10 bg-accent rounded-sm mb-4 flex items-center justify-center shadow-sm">
            <span className="text-white text-xl font-mono tracking-tight">金</span>
          </div>
          <h1 className="text-2xl font-light text-text-primary tracking-tight font-serif">
            Create User
          </h1>
          <p className="mt-1.5 text-[11px] tracking-[0.15em] text-text-muted font-sans">
            ADMIN ONLY
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="username" className="text-[10px] uppercase tracking-[0.12em] text-text-secondary">
              Username
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              required
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="displayName" className="text-[10px] uppercase tracking-[0.12em] text-text-secondary">
              Display Name
            </Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How they'll be greeted"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-[10px] uppercase tracking-[0.12em] text-text-secondary">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                className={`${inputClass} pr-8`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 bottom-2 text-text-muted hover:text-text-primary transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="adminKey" className="text-[10px] uppercase tracking-[0.12em] text-text-secondary">
              Admin Key
            </Label>
            <div className="relative">
              <Input
                id="adminKey"
                type={showAdminKey ? "text" : "password"}
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Server admin secret"
                required
                className={`${inputClass} pr-8`}
              />
              <button
                type="button"
                onClick={() => setShowAdminKey(!showAdminKey)}
                className="absolute right-0 bottom-2 text-text-muted hover:text-text-primary transition-colors"
                tabIndex={-1}
                aria-label={showAdminKey ? "Hide admin key" : "Show admin key"}
              >
                {showAdminKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-center text-expense font-sans">{error}</p>}
          {success && <p className="text-xs text-center text-income font-sans">{success}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-1 bg-accent text-white rounded-[4px] hover:bg-accent-hover transition-colors py-2.5 font-sans text-sm font-normal tracking-wide disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create User"}
          </Button>
        </form>
      </div>
    </div>
  );
}