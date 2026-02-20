import { useEffect, useState, Fragment } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, ChevronRight, ChevronLeft } from 'lucide-react'
import { quranService } from '../services/quran.service'
import { userService } from '../services/users.service'
import { useAuth } from '../hooks/useAuth'
import { useQueryClient } from '@tanstack/react-query'
import GlobalSearch from '../components/GlobalSearch'

interface PageAyah {
    surah: { number: number; name: string; nameEn: string }
    numberInSurah: number
    text: string
    number: number
    page: number
}

// Convert Western Arabic numerals to Eastern Arabic (١٢٣ ...)
function toEasternArabic(n: number): string {
    return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d])
}

// Strip Arabic diacritics/harakat for comparison (handles Unicode ordering differences)
// NOTE: no 'g' flag — using 'g' with .test() causes lastIndex to persist between calls
const DIACRITIC_RE = /[\u0610-\u061A\u064B-\u065F\u0670]/
function stripDiacritics(s: string) { return s.replace(/[\u0610-\u061A\u064B-\u065F\u0670]/g, '') }

// Bare Bismillah for detection (without any diacritics)
const BARE_BISMILLAH = 'بسم الله الرحمن الرحيم'
const BISMILLAH_DISPLAY = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'

// Find where Bismillah ends in the original diacriticized string
function getBismillahEnd(text: string): number {
    let bareCount = 0
    let i = 0
    while (bareCount < BARE_BISMILLAH.length && i < text.length) {
        if (!DIACRITIC_RE.test(text[i])) bareCount++
        i++
    }
    return i
}

export default function PageViewerPage() {
    const { pageNumber } = useParams<{ pageNumber: string }>()
    const navigate = useNavigate()
    const { user } = useAuth()
    const queryClient = useQueryClient()

    const [searchParams] = useSearchParams()
    const isReadOnly = searchParams.get('mode') === 'read_only'

    const pageNum = Number(pageNumber)
    const [ayahs, setAyahs] = useState<PageAyah[]>([])
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)

    useEffect(() => {
        if (!pageNum || isNaN(pageNum)) return
        setLoading(true)
        window.scrollTo(0, 0)
        quranService.getPageData(pageNum).then((data) => {
            if (data) {
                setAyahs(data.ayahs)
            }
        }).finally(() => setLoading(false))
    }, [pageNum])

    const handleNextPage = async () => {
        if (pageNum >= 604) return

        // Update progress to the last ayah of the CURRENT page ONLY if not read-only
        if (!isReadOnly && user && ayahs.length > 0) {
            setUpdating(true)
            const lastAyah = ayahs[ayahs.length - 1]
            try {
                await userService.setProgress(user.id, lastAyah.surah.number, lastAyah.numberInSurah)
                queryClient.invalidateQueries({ queryKey: ['user'] })
            } catch (err) {
                console.error('Failed to update progress', err)
            } finally {
                setUpdating(false)
            }
        }

        navigate(`/page/${pageNum + 1}${isReadOnly ? '?mode=read_only' : ''}`)
    }

    const handlePrevPage = () => {
        if (pageNum <= 1) return
        navigate(`/page/${pageNum - 1}${isReadOnly ? '?mode=read_only' : ''}`)
    }

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 size={40} className="animate-spin" style={{ color: 'var(--color-gold)' }} />
            </div>
        )
    }

    const surahName = ayahs.length > 0 ? ayahs[0].surah.name : ''


    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-20 animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between pt-4 px-2">
                <button onClick={() => navigate('/')} className="btn-ghost p-2 rounded-xl">
                    <ChevronRight size={20} />
                </button>
                <div className="text-center">
                    <h2 className="text-lg font-bold" dir="rtl">{surahName}</h2>
                    <p className="text-xs opacity-60">صفحة {pageNum}</p>
                </div>
                <div className="w-10"></div> {/* Spacer */}
            </div>

            {/* Search Bar - Visible in both modes as it helps navigation, but user emphasized it for Read Only */}
            <div className="px-4 mb-6">
                <GlobalSearch />
            </div>

            {/* Content */}
            <div className="glass p-6 md:p-10 min-h-[60vh]">
                <div className="text-center mb-8 pb-4 border-b border-[rgba(30,58,95,0.2)]">
                    {pageNum === 1 || pageNum === 2 ? null : (
                        <p className="text-xs opacity-50 mb-2">بداية الصفحة</p>
                    )}
                </div>

                <div dir="rtl" className="quran-text text-justify">
                    {ayahs.map((ayah) => {
                        const hasBismillah = stripDiacritics(ayah.text).startsWith(BARE_BISMILLAH)
                        const bismillahEnd = hasBismillah ? getBismillahEnd(ayah.text) : 0
                        const remainingText = hasBismillah
                            ? ayah.text.slice(bismillahEnd).trim()
                            : ayah.text

                        return (
                            <Fragment key={ayah.number}>
                                {hasBismillah && (
                                    <div className="bismillah-line">
                                        {BISMILLAH_DISPLAY}
                                    </div>
                                )}
                                <span>
                                    {remainingText}
                                    {remainingText && (
                                        <span className="ayah-marker">
                                            ﴾{toEasternArabic(ayah.numberInSurah)}﴿
                                        </span>
                                    )}{' '}
                                </span>
                            </Fragment>
                        )
                    })}
                </div>
            </div>

            {/* Pagination — standard web nav: السابقة on LEFT, التالية on RIGHT */}
            <div className="fixed bottom-0 left-0 right-0 p-4 glass border-t border-[rgba(255,255,255,0.05)] flex justify-between items-center max-w-2xl mx-auto">
                <button
                    onClick={handlePrevPage}
                    disabled={pageNum <= 1}
                    className="btn-ghost flex items-center gap-2 text-sm disabled:opacity-30"
                >
                    <ChevronRight size={18} /> السابقة
                </button>

                <div className="text-xs font-mono opacity-50">
                    {pageNum} / 604
                </div>

                <button
                    onClick={handleNextPage}
                    disabled={pageNum >= 604 || updating}
                    className="btn-primary flex items-center gap-2 text-sm px-6 py-2"
                >
                    {updating
                        ? <Loader2 size={16} className="animate-spin" />
                        : <>التالية <ChevronLeft size={18} /></>}
                </button>
            </div>

            {/* Spacer for fixed footer */}
            <div className="h-16"></div>
        </div>
    )
}
