import { useEffect, useState, Fragment } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
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

// --- Bismillah helpers ---
// No 'g' flag here: using /g on a regex with .test() makes lastIndex persist between calls,
// causing every other diacritic to be miscounted as a base character.
const DIACRITIC_TEST = /[\u0610-\u061A\u064B-\u065F\u0670]/
const BARE_BISMILLAH = 'بسم الله الرحمن الرحيم'
const BISMILLAH_DISPLAY = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ'

function getBismillahEnd(text: string): number {
    let bareCount = 0
    let i = 0
    // Walk forward counting non-diacritic chars until we've matched all of BARE_BISMILLAH
    while (bareCount < BARE_BISMILLAH.length && i < text.length) {
        if (!DIACRITIC_TEST.test(text[i])) bareCount++
        i++
    }
    // CRITICAL: skip any trailing diacritics that still belong to the last Bismillah letter
    // Without this, the kasra/fatha on the final م ends up as a stray character at the start of the next ayah
    while (i < text.length && DIACRITIC_TEST.test(text[i])) {
        i++
    }
    return i
}

const FONT_SIZE_KEY = 'quran_font_size'
const DEFAULT_FONT_SIZE = 1.5

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
    const [fontSize, setFontSize] = useState<number>(() => {
        const saved = localStorage.getItem(FONT_SIZE_KEY)
        return saved ? parseFloat(saved) : DEFAULT_FONT_SIZE
    })

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

    const handleFontSize = (val: number) => {
        setFontSize(val)
        localStorage.setItem(FONT_SIZE_KEY, String(val))
    }

    const handleNextPage = async () => {
        if (pageNum >= 604) return

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
                <button onClick={() => navigate('/')} className="btn-ghost p-2 rounded-xl text-lg leading-none" dir="rtl">
                    ❮
                </button>
                <div className="text-center">
                    <h2 className="text-lg font-bold" dir="rtl">{surahName}</h2>
                    <p className="text-xs opacity-60">صفحة {toEasternArabic(pageNum)}</p>
                </div>
                {/* Zoom size control */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handleFontSize(Math.max(1, parseFloat((fontSize - 0.1).toFixed(1))))}
                        className="btn-ghost p-1 rounded text-xs font-bold opacity-60 hover:opacity-100"
                        title="تصغير"
                    >ا-</button>
                    <button
                        onClick={() => handleFontSize(Math.min(2.8, parseFloat((fontSize + 0.1).toFixed(1))))}
                        className="btn-ghost p-1 rounded text-base font-bold opacity-60 hover:opacity-100"
                        title="تكبير"
                    >ا+</button>
                </div>
            </div>

            {/* Font size slider */}
            <div className="px-4 flex items-center gap-3">
                <span className="text-xs opacity-40" style={{ fontFamily: 'inherit' }}>ا</span>
                <input
                    type="range"
                    min="1"
                    max="2.8"
                    step="0.05"
                    value={fontSize}
                    onChange={e => handleFontSize(parseFloat(e.target.value))}
                    className="quran-size-slider flex-1"
                />
                <span className="text-base opacity-40" style={{ fontFamily: 'inherit' }}>ا</span>
            </div>

            {/* Search Bar */}
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

                <div dir="rtl" className="quran-text text-justify" style={{ fontSize: `${fontSize}rem` }}>
                    {ayahs.map((ayah) => {
                        const hasBismillah = ayah.text.replace(/[\u0610-\u061A\u064B-\u065F\u0670]/g, '').startsWith(BARE_BISMILLAH)
                        const bismillahEnd = hasBismillah ? getBismillahEnd(ayah.text) : 0
                        const remainingText = hasBismillah
                            ? ayah.text.slice(bismillahEnd).trim()
                            : ayah.text

                        return (
                            <Fragment key={ayah.number}>
                                {hasBismillah && (
                                    <div className="bismillah-line" style={{ fontSize: `${Math.max(fontSize, 1.4)}rem` }}>
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

            {/* Pagination — clean text buttons, no directional arrows */}
            <div className="fixed bottom-0 left-0 right-0 p-4 glass border-t border-[rgba(255,255,255,0.05)] flex justify-between items-center max-w-2xl mx-auto">
                <button
                    onClick={handlePrevPage}
                    disabled={pageNum <= 1}
                    className="btn-ghost text-sm disabled:opacity-30 px-4 py-2 rounded-xl"
                    dir="rtl"
                >
                    ◂ السابقة
                </button>

                <div className="text-xs font-mono opacity-50" dir="rtl">
                    {toEasternArabic(pageNum)} / ٦٠٤
                </div>

                <button
                    onClick={handleNextPage}
                    disabled={pageNum >= 604 || updating}
                    className="btn-primary text-sm px-6 py-2 rounded-xl"
                    dir="rtl"
                >
                    {updating
                        ? <Loader2 size={16} className="animate-spin" />
                        : 'التالية ▸'}
                </button>
            </div>

            {/* Spacer for fixed footer */}
            <div className="h-16"></div>
        </div>
    )
}
