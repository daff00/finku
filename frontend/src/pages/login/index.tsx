import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services'

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
        <div className="min-h-dvh flex items-center justify-center px-6"
            style={{ background: 'var(--color-bg)' }}
        >
            <div className="w-full max-w-sm">

                {/* ── Logo ───────────────────────────────── */}
                <div className="flex flex-col items-center mb-12">
                    <div
                        className="mb-4"
                        style={{
                            width: '3px',
                            height: '28px',
                            background: 'var(--color-accent)',
                            borderRadius: '2px',
                        }}
                    />
                    <h1
                        className="text-2xl tracking-tight"
                        style={{
                            fontWeight: 300,
                            color: 'var(--color-text-primary)',
                            letterSpacing: '-0.5px',
                        }}
                    >
                        Finku
                    </h1>
                    <p
                        className="mt-1.5 text-xs tracking-widest"
                        style={{ color: 'var(--color-text-muted)' }}
                    >
                        personal finance
                    </p>
                </div>

                {/* ── Form ───────────────────────────────── */}
                <form onSubmit={handleLogin} className="flex flex-col gap-6">

                    {/* Username */}
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="username"
                            className="label-section"
                        >
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="username"
                            required
                            autoComplete="username"
                            className="w-full py-2.5 text-sm bg-transparent outline-none transition-colors placeholder:text-[var(--color-text-muted)]"
                            style={{
                                borderBottom: '1px solid var(--color-border)',
                                color: 'var(--color-text-primary)',
                                fontFamily: 'var(--font-sans)',
                            }}
                            onFocus={e => {
                                e.target.style.borderBottomColor = 'var(--color-accent)'
                            }}
                            onBlur={e => {
                                e.target.style.borderBottomColor = 'var(--color-border)'
                            }}
                        />
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="password"
                            className="label-section"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                            className="w-full py-2.5 text-sm bg-transparent outline-none placeholder:text-[var(--color-text-muted)]"
                            style={{
                                borderBottom: '1px solid var(--color-border)',
                                color: 'var(--color-text-primary)',
                                fontFamily: 'var(--font-sans)',
                            }}
                            onFocus={e => {
                                e.target.style.borderBottomColor = 'var(--color-accent)'
                            }}
                            onBlur={e => {
                                e.target.style.borderBottomColor = 'var(--color-border)'
                            }}
                        />
                    </div>

                    {/* Error message */}
                    {error && (
                        <p
                            className="text-xs text-center"
                            style={{ color: 'var(--color-expense)' }}
                        >
                            {error}
                        </p>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-accent w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Masuk...' : 'Masuk'}
                    </button>

                </form>

                {/* ── Footer ─────────────────────────────── */}
                <p
                    className="text-center text-xs mt-8"
                    style={{ color: 'var(--color-text-muted)' }}
                >
                    Finku · Personal Finance
                </p>

            </div>
        </div>
    )
}