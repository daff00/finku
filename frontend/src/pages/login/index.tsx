import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services';

// Using shadcn/ui components (they will inherit your Tailwind overrides)
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authService.login({ username, password });
      authService.saveToken(data.access_token);
      navigate('/');
    } catch (err: any) {
      // ✅ Uniform English error message
      console.error(err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-6 bg-bg">
      <div className="w-full max-w-sm">

        {/* ── Logo & Brand ─────────────────────────────────── */}
        <div className="flex flex-col items-center mb-12">
          <div className="size-10 bg-accent rounded-sm mb-4 flex items-center justify-center shadow-sm">
            <span className="text-white text-xl font-mono tracking-tight">金</span>
          </div>
          <h1 className="text-2xl font-light text-text-primary tracking-tight font-playfair">
            Finku
          </h1>
          {/* ✅ Updated to match your TopBar subtitle */}
          <p className="mt-1.5 text-[11px] tracking-[0.15em] text-text-muted font-sans">
            FINANCE · 間
          </p>
        </div>

        {/* ── Form ─────────────────────────────────────────── */}
        <form onSubmit={handleLogin} className="flex flex-col gap-6">

          {/* Username */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="username" className="text-[10px] uppercase tracking-[0.12em] text-text-secondary">
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

          {/* Password */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-[10px] uppercase tracking-[0.12em] text-text-secondary">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              className="h-auto rounded-none border-0 border-b border-border px-0 py-2 shadow-none bg-transparent text-text-primary placeholder:text-text-muted/60 focus:border-accent focus-visible:ring-0 transition-colors"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-center text-expense font-sans mt-1">
              {error}
            </p>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-accent text-white rounded-[4px] hover:bg-accent/90 transition-colors py-2.5 font-sans text-sm font-normal tracking-wide disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        {/* ── Footer ────────────────────────────────────────── */}
        <p className="text-center text-[11px] text-text-muted/70 mt-8 font-sans tracking-wide">
           Finku · Personal Finance
        </p>
      </div>
    </div>
  );
}