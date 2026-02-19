import { useState, useEffect } from 'react'
import { Loader2, ChevronRight, Bookmark, BookOpen } from 'lucide-react'
import { useUser } from '../hooks/useUser'
import { useAyahMap, useSurah } from '../hooks/useSurahs'
import { quranService } from '../services/quran.service'
import { useNavigate } from 'react-router-dom'


export default function DashboardPage() {
    const { user, isLoading, advanceAyah, completeSurah } = useUser()
    const { data: surahData } = useSurah(user?.progressSurah)
    const { data: ayahMap } = useAyahMap(user?.progressSurah ?? null, user?.progressAyah ?? null)
    const navigate = useNavigate()
    const [feedback, setFeedback] = useState<string | null>(null)
    const [pageAyahs, setPageAyahs] = useState<any[]>([])
    const [currentPage, setCurrentPage] = useState<number>(1)

    // Fetch Page Data instead of single Ayah
    useEffect(() => {
        if (!user) return
        quranService.getPageForAyah(user.progressSurah, user.progressAyah).then(p => {
            if (p) {
                setCurrentPage(p)
                quranService.getPageData(p).then(data => {
                    if (data) setPageAyahs(data.ayahs)
                })
            }
        })
    }, [user?.progressSurah, user?.progressAyah])

    const showFeedback = (msg: string) => {
        setFeedback(msg)
        setTimeout(() => setFeedback(null), 3000)
    }

    const handleAdvance = async () => {
        try {
            const result = await advanceAyah.mutateAsync(undefined)
            if (result?.completed_surah) {
                showFeedback(`🎉 أتممت السورة! انتقلت إلى سورة ${result.new_surah}`)
            } else {
                showFeedback(`✅ انتقلت إلى الآية ${result?.new_ayah}`)
            }
        } catch {
            showFeedback('حدث خطأ، يرجى المحاولة مجدداً')
        }
    }

    const handleComplete = async () => {
        try {
            const result = await completeSurah.mutateAsync(undefined)
            showFeedback(`🌟 ماشاء الله! انتقلت إلى سورة ${result?.new_surah}`)
        } catch {
            showFeedback('حدث خطأ، يرجى المحاولة مجدداً')
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 size={40} className="animate-spin" style={{ color: 'var(--color-gold)' }} />
            </div>
        )
    }

    if (!user) return null

    const progress = surahData ? Math.round((user.progressAyah / surahData.ayahCount) * 100) : 0
    const quranProgress = Math.round(((user.progressSurah - 1) / 114) * 100)

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
            {/* Feedback toast */}
            {feedback && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 glass px-6 py-3 rounded-2xl text-sm font-semibold animate-fade-in-up"
                    style={{ color: 'var(--color-gold)', border: '1px solid rgba(201,162,39,0.3)' }}>
                    {feedback}
                </div>
            )}

            {/* Welcome header */}
            <div className="text-center pt-4">
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>أهلاً وسهلاً</p>
                <h2 className="text-2xl font-bold">{user.name}</h2>
            </div>

            {/* Main progress card */}
            <div className="glass p-7 glow-gold">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
                        style={{ background: 'rgba(201,162,39,0.1)', color: 'var(--color-gold)', border: '1px solid rgba(201,162,39,0.2)' }}>
                        <Bookmark size={12} />
                        الجزء {ayahMap?.juzNumber ?? '—'}
                    </div>

                    <h3 className="text-4xl font-bold mb-1 text-gold" dir="rtl">
                        {surahData?.nameAr ?? '...'}
                    </h3>
                    <p className="text-lg mb-6" style={{ color: 'var(--color-text-muted)' }}>
                        {surahData?.nameEn}
                    </p>

                    {/* Page Text Display */}
                    {pageAyahs.length > 0 ? (
                        <div className="mb-8 relative py-4 px-2">
                            <div dir="rtl" className="leading-[2.5] text-xl md:text-2xl text-justify text-white" style={{ fontFamily: 'Noto Naskh Arabic' }}>
                                {pageAyahs.map((ayah) => {
                                    const isCurrent = ayah.numberInSurah === user.progressAyah && ayah.surah.number === user.progressSurah
                                    return (
                                        <span key={ayah.number} className={isCurrent ? "bg-[rgba(201,162,39,0.2)] rounded px-1 transition-colors duration-500" : ""}>
                                            {ayah.text}
                                            <span className="inline-flex items-center justify-center w-8 h-8 mx-1 text-xs border rounded-full align-middle relative top-1"
                                                style={{ borderColor: 'var(--color-gold)', color: 'var(--color-gold)', background: 'rgba(201,162,39,0.05)' }}>
                                                {ayah.numberInSurah}
                                            </span>
                                            {' '}
                                        </span>
                                    )
                                })}
                            </div>
                            <div className="text-xs mt-4 text-center opacity-70" style={{ color: 'var(--color-gold)' }}>
                                ﴿ صفحة {currentPage} ﴾
                            </div>
                        </div>
                    ) : (
                        <div className="h-24 flex items-center justify-center mb-8">
                            <Loader2 size={24} className="animate-spin" style={{ color: 'var(--color-text-muted)' }} />
                        </div>
                    )}
                </div>

                {/* Ayah progress */}
                <div className="flex items-center justify-between text-sm mb-3">
                    <span style={{ color: 'var(--color-text-muted)' }}>الآية</span>
                    <span className="font-bold">
                        <span style={{ color: 'var(--color-gold)' }}>{user.progressAyah}</span>
                        <span style={{ color: 'var(--color-text-muted)' }}> / {surahData?.ayahCount ?? '—'}</span>
                    </span>
                </div>
                <div className="progress-bar mb-6">
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                </div>

                {/* Action buttons - Moved here for better accessibility */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    <button
                        onClick={handleAdvance}
                        disabled={advanceAyah.isPending}
                        className="btn-primary flex items-center justify-center gap-2"
                    >
                        {advanceAyah.isPending ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={18} />}
                        تقدم آية
                    </button>
                    <button
                        onClick={handleComplete}
                        disabled={completeSurah.isPending || user.progressSurah >= 114}
                        className="btn-secondary flex items-center justify-center gap-2"
                    >
                        {completeSurah.isPending ? <Loader2 size={16} className="animate-spin" /> : <BookOpen size={18} />}
                        أتممت السورة
                    </button>
                </div>

                {/* Quran overall progress */}
                <div className="flex items-center justify-between text-xs mb-2">
                    <span style={{ color: 'var(--color-text-muted)' }}>التقدم الكلي في القرآن</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>{quranProgress}%</span>
                </div>
                <div className="progress-bar mb-6" style={{ height: '4px' }}>
                    <div className="progress-bar-fill" style={{ width: `${quranProgress}%` }} />
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mb-7">
                    {[
                        { label: 'السورة', value: user.progressSurah },
                        { label: 'الآية', value: user.progressAyah },
                        { label: 'الجزء', value: ayahMap?.juzNumber ?? '—' },
                    ].map(({ label, value }) => (
                        <div key={label} className="rounded-xl p-3 text-center"
                            style={{ background: 'rgba(10,14,20,0.5)', border: '1px solid rgba(30,58,95,0.4)' }}>
                            <div className="text-2xl font-bold" style={{ color: 'var(--color-gold)' }}>{value}</div>
                            <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
                        </div>
                    ))}
                </div>



                {user.progressSurah >= 114 && (
                    <div className="mt-4 text-center p-4 rounded-xl"
                        style={{ background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.3)' }}>
                        <span className="text-2xl">🎯</span>
                        <p className="font-bold mt-1 text-gold">ماشاء الله! أتممت ختم القرآن الكريم</p>
                    </div>
                )}
            </div>

            {/* Reading Section */}
            <div className="pt-4 border-t border-[rgba(30,58,95,0.4)]">
                <h3 className="text-sm font-bold mb-3 pr-2 border-r-2 border-[var(--color-gold)]" style={{ color: 'var(--color-text-muted)' }}>
                    المصحف الشريف
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => navigate(`/page/${currentPage}`)}
                        className="btn-secondary flex items-center justify-center gap-2"
                    >
                        <BookOpen size={18} />
                        تابع القراءة
                    </button>
                    <button
                        onClick={() => navigate('/page/1?mode=read_only')}
                        className="btn-ghost flex items-center justify-center gap-2 border border-[rgba(255,255,255,0.1)]"
                    >
                        <BookOpen size={18} />
                        تصفح المصحف
                    </button>
                </div>
            </div>
        </div>
    )
}
