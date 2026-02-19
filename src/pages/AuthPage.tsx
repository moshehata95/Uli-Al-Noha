import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { isSupabaseConfigured } from '../lib/supabase'
import { Eye, EyeOff, Loader2, AlertTriangle } from 'lucide-react'

// Google logo SVG (official colors, no external dependency)
function GoogleIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
    )
}

export default function AuthPage() {
    const { signIn, signUp, signInWithGoogle } = useAuth()
    const [mode, setMode] = useState<'signin' | 'signup'>('signin')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setMessage(null)
        setIsLoading(true)
        try {
            if (mode === 'signin') {
                await signIn(email, password)
            } else {
                if (!name.trim()) { setError('الاسم مطلوب'); return }
                await signUp(email, password, name.trim())
                setMessage('تم إرسال رابط التحقق إلى بريدك. تحقق من صندوق الوارد.')
            }
        } catch (err: unknown) {
            const e = err as { message?: string }
            setError(e.message ?? 'حدث خطأ، يرجى المحاولة مجدداً')
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogle = async () => {
        setError(null)
        setIsGoogleLoading(true)
        try {
            await signInWithGoogle()
            // Page will redirect to Google — no need to setLoading(false)
        } catch (err: unknown) {
            const e = err as { message?: string }
            setError(e.message ?? 'فشل تسجيل الدخول بجوجل')
            setIsGoogleLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-pattern flex items-center justify-center p-4" style={{ background: 'var(--color-bg)' }}>
            {/* Decorative glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(201,162,39,0.08) 0%, transparent 70%)' }} />
            </div>

            <div className="w-full max-w-md animate-fade-in-up">
                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl glow-gold mb-4 overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, #c9a227, #8b6914)' }}>
                        <img src="/Icon.webp" alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-3xl font-bold text-gold mb-1">أولي النهى</h1>
                    <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">
                        تتبع رحلتك في ختم القرآن الكريم
                    </p>
                </div>

                {/* Card */}
                <div className="glass p-8">

                    {/* Config warning banner — shown when env vars are missing */}
                    {!isSupabaseConfigured && (
                        <div className="flex items-start gap-3 rounded-xl p-4 mb-6 text-sm"
                            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                            <p>
                                يرجى إضافة متغيرات البيئة <strong>VITE_SUPABASE_URL</strong> و <strong>VITE_SUPABASE_ANON_KEY</strong> في إعدادات Netlify ثم إعادة النشر.
                            </p>
                        </div>
                    )}

                    {/* Google Sign-In Button */}
                    <button
                        type="button"
                        onClick={handleGoogle}
                        disabled={isGoogleLoading || isLoading}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 mb-6"
                        style={{
                            background: 'rgba(255,255,255,0.07)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            color: 'var(--color-text)',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                    >
                        {isGoogleLoading
                            ? <Loader2 size={20} className="animate-spin" />
                            : <GoogleIcon />
                        }
                        {isGoogleLoading ? 'جارٍ التوجيه...' : 'تسجيل الدخول بحساب Google'}
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>أو بالبريد الإلكتروني</span>
                        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
                    </div>

                    {/* Tabs */}
                    <div className="flex rounded-xl overflow-hidden mb-7" style={{ background: 'rgba(10,14,20,0.6)' }}>
                        {(['signin', 'signup'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => { setMode(tab); setError(null); setMessage(null) }}
                                className="flex-1 py-3 text-sm font-semibold transition-all duration-200"
                                style={{
                                    background: mode === tab ? 'linear-gradient(135deg, #c9a227, #b8891a)' : 'transparent',
                                    color: mode === tab ? '#0a0e14' : 'var(--color-text-muted)',
                                    borderRadius: '10px',
                                    margin: '4px',
                                }}
                            >
                                {tab === 'signin' ? 'تسجيل الدخول' : 'حساب جديد'}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'signup' && (
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>
                                    الاسم الكريم
                                </label>
                                <input
                                    className="input"
                                    type="text"
                                    placeholder="اكتب اسمك"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={isLoading}
                                    dir="rtl"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>
                                البريد الإلكتروني
                            </label>
                            <input
                                className="input"
                                type="email"
                                placeholder="example@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                dir="ltr"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>
                                كلمة المرور
                            </label>
                            <div className="relative">
                                <input
                                    className="input pr-12"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    dir="ltr"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                    style={{ color: 'var(--color-text-muted)' }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-xl p-3 text-sm text-center"
                                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="rounded-xl p-3 text-sm text-center"
                                style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>
                                {message}
                            </div>
                        )}

                        <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 text-base mt-2" disabled={isLoading || isGoogleLoading}>
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
                            {mode === 'signin' ? 'دخول' : 'إنشاء حساب'}
                        </button>
                    </form>

                    <p className="text-center text-xs mt-6" style={{ color: 'var(--color-text-muted)' }}>
                        بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                    </p>
                </div>
            </div>
        </div>
    )
}
