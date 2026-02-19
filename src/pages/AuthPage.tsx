import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { BookOpen, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function AuthPage() {
    const { signIn, signUp } = useAuth()
    const [mode, setMode] = useState<'signin' | 'signup'>('signin')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
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
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl glow-gold mb-4"
                        style={{ background: 'linear-gradient(135deg, #c9a227, #8b6914)' }}>
                        <BookOpen size={40} color="#0a0e14" />
                    </div>
                    <h1 className="text-3xl font-bold text-gold mb-1">أولى النهى</h1>
                    <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">
                        تتبع رحلتك في ختم القرآن الكريم
                    </p>
                </div>

                {/* Card */}
                <div className="glass p-8">
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

                        <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 text-base mt-2" disabled={isLoading}>
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
