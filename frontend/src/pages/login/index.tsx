// frontend/src/pages/LoginPage.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

import { authService } from "@/services";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePageTitle } from '@/hooks/usePageTitle'

export default function LoginPage() {
  usePageTitle('Login')
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authService.login({ username, password });
      authService.saveToken(data.access_token);
      navigate("/");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-6 bg-bg">
      <div className="w-full max-w-sm">
        {/* ── Logo ───────────────────────────────────────────── */}
        <div className="flex flex-col items-center mb-10">
          <div className="size-10 bg-accent rounded-sm mb-4 flex items-center justify-center shadow-sm">
            <span className="text-white text-xl font-mono tracking-tight">金</span>
          </div>
          <h1 className="text-2xl font-light text-text-primary tracking-tight font-serif">
            Finku
          </h1>
          <p className="mt-1.5 text-[11px] tracking-[0.15em] text-text-muted font-sans">
            FINANCE · 間
          </p>
        </div>

        {/* ── Form ───────────────────────────────────────────── */}
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="username"
              className="text-[10px] uppercase tracking-[0.12em] text-text-secondary"
            >
              Username
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              autoComplete="username"
              className="h-auto rounded-none border-0 border-b border-border px-0 py-2 shadow-none bg-transparent text-text-primary placeholder:text-text-muted/60 focus:border-accent focus-visible:ring-0 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="password"
              className="text-[10px] uppercase tracking-[0.12em] text-text-secondary"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="h-auto rounded-none border-0 border-b border-border px-0 py-2 pr-8 shadow-none bg-transparent text-text-primary placeholder:text-text-muted/60 focus:border-accent focus-visible:ring-0 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 bottom-2 text-text-muted hover:text-text-primary transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-center text-expense font-sans mt-1">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-accent text-white rounded-[4px] hover:bg-accent/90 transition-colors py-2.5 font-sans text-sm font-normal tracking-wide disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        {/* ── Register link ──────────────────────────────────── */}
        <p className="text-center text-[12px] text-text-muted mt-6 font-sans">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-accent hover:underline transition-colors"
          >
            Register
          </Link>
        </p>

        {/* ── Footer ──────────────────────────────────────────── */}
        <p className="text-center text-[11px] text-text-muted/70 mt-8 font-sans tracking-wide">
          Finku · Personal Finance
        </p>
      </div>
    </div>
  );
}