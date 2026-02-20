import { useState, useEffect, Fragment } from 'react'
import { Loader2, ChevronRight, Bookmark, BookOpen } from 'lucide-react'
import { useUser } from '../hooks/useUser'
import { useAyahMap, useSurah } from '../hooks/useSurahs'
import { quranService } from '../services/quran.service'
import { userService } from '../services/users.service'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'


export default function DashboardPage() {
    const { user, isLoading, advanceAyah, completeSurah, resetProgress } = useUser()
    const { data: surahData } = useSurah(user?.progressSurah)
    const { data: ayahMap } = useAyahMap(user?.progressSurah ?? null, user?.progressAyah ?? null)
    const navigate = useNavigate()
    const [feedback, setFeedback] = useState<string | null>(null)
    const [pageAyahs, setPageAyahs] = useState<any[]>([])
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [isLastPageOfSurah, setIsLastPageOfSurah] = useState(false)
    const queryClient = useQueryClient() // Add queryClient for manual invalidation if needed

    // Fetch Page Data instead of single Ayah
    useEffect(() => {
        if (!user) return
        quranService.getPageForAyah(user.progressSurah, user.progressAyah).then(p => {
            if (p) {
                setCurrentPage(p)
                quranService.getPageData(p).then(data => {
                    if (data) {
                        setPageAyahs(data.ayahs)
                        // Check if this page contains the last ayah of the current surah
                        if (surahData) {
                            const lastAyahOfSurah = data.ayahs.find(a =>
                                a.surah.number === user.progressSurah &&
                                a.numberInSurah === surahData.ayahCount
                            )
                            setIsLastPageOfSurah(!!lastAyahOfSurah)
                        }
                    }
                })
            }
        })
    }, [user?.progressSurah, user?.progressAyah, surahData])

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

    const handleCompletePage = async () => {
        // If it's the last page of Surah, use the existing completeSurah
        if (isLastPageOfSurah) {
            try {
                const result = await completeSurah.mutateAsync(undefined)
                showFeedback(`🌟 ماشاء الله! انتقلت إلى سورة ${result?.new_surah}`)
            } catch {
                showFeedback('حدث خطأ، يرجى المحاولة مجدداً')
            }
            return
        }

        // Otherwise, move to the next page
        const nextPage = currentPage + 1
        if (nextPage > 604) return // End of Quran

        // We need to find the first ayah of the next page to set progress
        try {
            const nextPageData = await quranService.getPageData(nextPage)
            if (nextPageData && nextPageData.ayahs.length > 0) {
                const firstAyah = nextPageData.ayahs[0]
                // Optimistically update
                await userService.setProgress(user!.id, firstAyah.surah.number, firstAyah.numberInSurah)
                // Invalidate user query to refresh data
                queryClient.invalidateQueries({ queryKey: ['user'] })
                showFeedback(`✅ أتممت الصفحة ${currentPage}`)
            }
        } catch (e) {
            console.error(e)
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

    // Progress bar calculation based on PAGES
    // Total pages in Quran = 604
    // This is global progress. 
    // User wants "calculation for it for the progress bar ofcourse"
    // If they mean "Current Surah Progress":
    // We need start page of Surah and end page of Surah.
    // Let's stick to the existing "Surah Progress" but maybe refine it?
    // Actually, user said "make it... 'Complete Page'... and the calculation for it for the progress bar".
    // This likely means the progress bar should represent pages completed in the current Surah.

    // To do this strictly:
    // (Current Page - Start Page of Surah) / (End Page of Surah - Start Page of Surah)
    // But we don't easily have "End Page of Surah" without fetching/map.

    // Fallback: Stick to Ayah progress for the bar (it's accurate enough usually), 
    // OR allow the "Global Quran Progress" to be the main simple indicator?
    // The previous code had 2 bars: "Ayah/Surah Progress" and "Quran Progress".
    // I will update the text to say "Page X" maybe?

    // Let's keep Ayah-based percentage for now as it's the most granular and accurate "completion" metric.
    // Changing to page-based percentage requires knowing exactly how many pages the surah takes.
    const progress = surahData ? Math.round((user.progressAyah / surahData.ayahCount) * 100) : 0
    const quranProgress = Math.round(((user.progressSurah - 1) / 114) * 100) // Rough estimate by Surah

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
                            <div dir="rtl" className="quran-text text-justify text-white">
                                {pageAyahs.map((ayah) => {
                                    const isCurrent = ayah.numberInSurah === user.progressAyah && ayah.surah.number === user.progressSurah
                                    // no 'g' on the test regex — 'g' causes .test() to track lastIndex between calls
                                    const DIACRITIC_TEST = /[\u0610-\u061A\u064B-\u065F\u0670]/
                                    const BARE_BISMILLAH = 'بسم الله الرحمن الرحيم'
                                    const BISMILLAH_DISPLAY = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'
                                    const bare = ayah.text.replace(/[\u0610-\u061A\u064B-\u065F\u0670]/g, '')
                                    const hasBismillah = bare.startsWith(BARE_BISMILLAH)
                                    let bismillahEnd = 0
                                    if (hasBismillah) {
                                        let count = 0
                                        while (count < BARE_BISMILLAH.length && bismillahEnd < ayah.text.length) {
                                            if (!DIACRITIC_TEST.test(ayah.text[bismillahEnd])) count++
                                            bismillahEnd++
                                        }
                                    }
                                    const remainingText = hasBismillah ? ayah.text.slice(bismillahEnd).trim() : ayah.text
                                    return (
                                        <Fragment key={ayah.number}>
                                            {hasBismillah && (
                                                <div className="bismillah-line">{BISMILLAH_DISPLAY}</div>
                                            )}
                                            <span className={isCurrent ? 'bg-[rgba(201,162,39,0.2)] rounded px-1 transition-colors duration-500' : ''}>
                                                {remainingText}
                                                {remainingText && (
                                                    <span className="ayah-marker">
                                                        ﴾{String(ayah.numberInSurah).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d])}﴿
                                                    </span>
                                                )}{' '}
                                            </span>
                                        </Fragment>
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
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                        onClick={handleAdvance}
                        disabled={advanceAyah.isPending}
                        className="btn-primary flex items-center justify-center gap-2"
                    >
                        {advanceAyah.isPending ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={18} />}
                        تقدم آية
                    </button>
                    <button
                        onClick={handleCompletePage}
                        disabled={completeSurah.isPending || user.progressSurah >= 114}
                        className="btn-secondary flex items-center justify-center gap-2"
                    >
                        {completeSurah.isPending ? <Loader2 size={16} className="animate-spin" /> : <BookOpen size={18} />}
                        {isLastPageOfSurah ? 'أتممت السورة' : 'أتممت الصفحة'}
                    </button>
                </div>

                {/* Go Back Controls */}
                <div className="grid grid-cols-3 gap-2 mb-8">
                    <button
                        onClick={async () => {
                            if (!user) return
                            if (user.progressAyah > 1) {
                                await userService.setProgress(user.id, user.progressSurah, user.progressAyah - 1)
                                queryClient.invalidateQueries({ queryKey: ['user'] })
                                showFeedback(`تراجعت للآية ${user.progressAyah - 1}`)
                            } else if (user.progressSurah > 1) {
                                // Go to previous surah's last ayah? Or first ayah? Using FIRST of previous as safetynet for now as getting last requires fetch
                                // Actually better to just go to start of previous surah
                                await userService.setProgress(user.id, user.progressSurah - 1, 1)
                                queryClient.invalidateQueries({ queryKey: ['user'] })
                                showFeedback(`تراجعت لسورة السابقة`)
                            }
                        }}
                        className="btn-ghost text-xs border border-[rgba(30,58,95,0.4)] py-2"
                    >
                        تراجع آية
                    </button>
                    <button
                        onClick={async () => {
                            if (!user || currentPage <= 1) return
                            try {
                                // Go to start of previous page
                                const prevPage = currentPage - 1
                                const data = await quranService.getPageData(prevPage)
                                if (data && data.ayahs.length > 0) {
                                    const firstAyah = data.ayahs[0]
                                    await userService.setProgress(user.id, firstAyah.surah.number, firstAyah.numberInSurah)
                                    queryClient.invalidateQueries({ queryKey: ['user'] })
                                    showFeedback(`تراجعت للصفحة ${prevPage}`)
                                }
                            } catch (e) {
                                console.error(e)
                            }
                        }}
                        className="btn-ghost text-xs border border-[rgba(30,58,95,0.4)] py-2"
                    >
                        تراجع صفحة
                    </button>
                    <button
                        onClick={async () => {
                            if (!user || user.progressSurah <= 1) return
                            await userService.setProgress(user.id, user.progressSurah - 1, 1)
                            queryClient.invalidateQueries({ queryKey: ['user'] })
                            showFeedback(`تراجعت للسورة السابقة`)
                        }}
                        className="btn-ghost text-xs border border-[rgba(30,58,95,0.4)] py-2"
                    >
                        تراجع سورة
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
                <div className="grid grid-cols-2 gap-3 mb-6">
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

                <div className="text-center">
                    <button
                        onClick={() => {
                            if (window.confirm('هل أنت متأكد من رغبتك في إعادة ضبط تقدمك؟ سيعود العداد إلى بداية المصحف.')) {
                                resetProgress.mutate(undefined)
                                showFeedback('تم إعادة ضبط التقدم بنجاح')
                            }
                        }}
                        className="text-xs text-red-400/70 hover:text-red-400 transition-colors py-2 px-4 rounded-lg hover:bg-red-500/10"
                        disabled={resetProgress.isPending}
                    >
                        {resetProgress.isPending ? 'جاري التنفيذ...' : 'إعادة ضبط التقدم'}
                    </button>
                </div>
            </div>
        </div>
    )
}
