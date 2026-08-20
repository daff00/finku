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
        <div style={{
            minHeight: '100dvh',
            background: 'var(--color-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
        }}>
            <div style={{ width: '100%', maxWidth: '360px' }}>

                {/* Logo */}
                <div style={{ marginBottom: '48px', textAlign: 'center' }}>
                    <div style={{
                        width: '4px',
                        height: '32px',
                        background: 'var(--color-accent)',
                        margin: '0 auto 16px',
                        borderRadius: '2px',
                    }} />
                    <h1 style={{
                        fontSize: '24px',
                        fontWeight: '300',
                        color: 'var(--color-text-primary)',
                        letterSpacing: '-0.5px',
                    }}>
                        Finku
                    </h1>
                    <p style={{
                        fontSize: '12px',
                        color: 'var(--color-text-muted)',
                        marginTop: '6px',
                        letterSpacing: '0.05em',
                    }}>
                        personal finance
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin}>

                    {/* Username */}
                    <div style={{ marginBottom: '20px' }}>
                        <label className='label-section' style={{
                            display: 'block',
                            marginBottom: '8px',
                        }}>
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="username"
                            required
                            style={{
                                width: '100%',
                                padding: '10px 0',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: '1px solid var(--color-border)',
                                color: 'var(--color-text-primary)',
                                fontSize: '14px',
                                outline: 'none',
                                fontFamily: 'var(--font-sans)',
                            }}
                        />
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: '32px' }}>
                        <label className='label-section' style={{
                            display: 'block',
                            marginBottom: '8px',
                        }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            style={{
                                width: '100%',
                                padding: '10px 0',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: '1px solid var(--color-border)',
                                color: 'var(--color-text-primary)',
                                fontSize: '14px',
                                outline: 'none',
                                fontFamily: 'var(--font-sans)',
                            }}
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <p style={{
                            fontSize: '12px',
                            color: 'var(--color-expense)',
                            marginBottom: '16px',
                            textAlign: 'center',
                        }}>
                            {error}
                        </p>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-accent"
                        style={{ width: '100%' }}
                    >
                        {loading ? 'Masuk...' : 'Masuk'}
                    </button>

                </form>
            </div>
        </div>
    )
}