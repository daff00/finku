import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const data = await authService.login({ username, password })
            authService.saveToken(data.access_token)
            navigate('/')
        } catch (err: any) {
            setError(err.message || 'Login gagal')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-dvh flex items-center justify-center px-6 bg-bg">
            <div className="w-full max-w-sm">

                {/* ── Logo ─────────────────────────────────── */}
                <div className="flex flex-col items-center mb-12">
                    <div className="size-9 bg-accent rounded-sm mb-4 flex items-center justify-center">
                        <p className="text-white text-xl">金</p>
                    </div>
                    <h1 className="text-2xl font-light text-text-primary tracking-tight">
                        Finku
                    </h1>
                    <p className="mt-1.5 text-[11px] tracking-widest text-text-muted">
                        Personal Finance
                    </p>
                </div>

                {/* ── Form ─────────────────────────────────── */}
                <form onSubmit={handleLogin} className="flex flex-col gap-6">

                    {/* Username */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="username" className="label-section">Username</Label>
                        <Input
                            id="username"
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="username"
                            required
                            autoComplete="username"
                            className="h-auto rounded-none border-0 border-b border-border px-0 py-2 shadow-none bg-transparent text-text-primary placeholder:text-text-muted focus:border-accent focus-visible:ring-0"
                        />
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="password" className="label-section">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                            className="h-auto rounded-none border-0 border-b border-border px-0 py-2 shadow-none bg-transparent text-text-primary placeholder:text-text-muted focus:border-accent focus-visible:ring-0"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-xs text-center text-expense">
                            {error}
                        </p>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-accent w-full mt-2"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                {/* ── Footer ───────────────────────────────── */}
                <p className="text-center text-[11px] text-text-muted mt-8">
                    Finku · Personal Finance
                </p>
            </div>
        </div>
    )
}