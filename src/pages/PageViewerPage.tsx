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

function toEasternArabic(n: number): string {
    return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d])
}

// ─── Bismillah handling ────────────────────────────────────────────────────
// D = zero or more Arabic diacritics/harakat (any order)
const D = '[\\u0610-\\u061A\\u064B-\\u065F\\u0670]*'

// This regex matches بسم الله الرحمن الرحيم with ANY diacritics in ANY order
// between and after each base letter, followed by optional whitespace.
// This is the ONLY approach that handles all Unicode diacritic ordering variants.
const BISMILLAH_RE = new RegExp(
    `^${D}ب${D}س${D}م${D}\\s+` +
    `${D}ا${D}ل${D}ل${D}ه${D}\\s+` +
    `${D}ا${D}ل${D}ر${D}ح${D}م${D}ن${D}\\s+` +
    `${D}ا${D}ل${D}ر${D}ح${D}ي${D}م${D}\\s*`
)

const BISMILLAH_DISPLAY = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'

function removeBismillah(text: string): string {
    const stripped = text.replace(BISMILLAH_RE, '').trim()
    // Safety: strip any leading diacritics that may have been left behind
    // (e.g. trailing kasra on الرحيم ِ that the regex boundary left intact)
    return stripped.replace(/^[\u0610-\u061A\u064B-\u065F\u0670]+/, '').trim()
}

// ─── Font size persistence ─────────────────────────────────────────────────
const FS_KEY = 'quran_font_size'
const FS_DEFAULT = 1.5
const FS_MIN = 1.0
const FS_MAX = 2.8

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
        try { return parseFloat(localStorage.getItem(FS_KEY) || String(FS_DEFAULT)) }
        catch { return FS_DEFAULT }
    })

    useEffect(() => {
        if (!pageNum || isNaN(pageNum)) return
        setLoading(true)
        window.scrollTo(0, 0)
        quranService.getPageData(pageNum).then(data => {
            if (data) setAyahs(data.ayahs)
        }).finally(() => setLoading(false))
    }, [pageNum])

    const changeFontSize = (v: number) => {
        const clamped = Math.min(FS_MAX, Math.max(FS_MIN, Math.round(v * 20) / 20))
        setFontSize(clamped)
        try { localStorage.setItem(FS_KEY, String(clamped)) } catch { /* ignore */ }
    }

    const handleNextPage = async () => {
        if (pageNum >= 604) return
        if (!isReadOnly && user && ayahs.length > 0) {
            setUpdating(true)
            const last = ayahs[ayahs.length - 1]
            try {
                await userService.setProgress(user.id, last.surah.number, last.numberInSurah)
                queryClient.invalidateQueries({ queryKey: ['user'] })
            } catch (e) { console.error(e) }
            finally { setUpdating(false) }
        }
        navigate(`/page/${pageNum + 1}${isReadOnly ? '?mode=read_only' : ''}`)
    }

    const handlePrevPage = () => {
        if (pageNum <= 1) return
        navigate(`/page/${pageNum - 1}${isReadOnly ? '?mode=read_only' : ''}`)
    }

    if (loading) return (
        <div className="flex justify-center py-20">
            <Loader2 size={40} className="animate-spin" style={{ color: 'var(--color-gold)' }} />
        </div>
    )

    const surahName = ayahs[0]?.surah.name ?? ''

    return (
        <div className="max-w-2xl mx-auto space-y-4 pb-20 animate-fade-in-up">

            {/* ── Header ── */}
            <div className="flex items-center justify-between pt-4 px-4">
                <button onClick={() => navigate('/')} className="btn-ghost px-3 py-2 rounded-xl text-sm" dir="rtl">
                    ❮ رجوع
                </button>
                <div className="text-center">
                    <h2 className="text-base font-bold" dir="rtl">{surahName}</h2>
                    <p className="text-xs opacity-50" dir="rtl">صفحة {toEasternArabic(pageNum)}</p>
                </div>
                <div className="w-20" />
            </div>

            {/* ── Font size slider ── */}
            <div className="px-4">
                <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                    <span className="text-xs opacity-50 select-none" style={{ fontSize: '0.75rem', fontFamily: 'Scheherazade New, serif' }}>أ</span>
                    <input
                        aria-label="حجم الخط"
                        type="range"
                        min={FS_MIN}
                        max={FS_MAX}
                        step="0.05"
                        value={fontSize}
                        onChange={e => changeFontSize(parseFloat(e.target.value))}
                        className="quran-size-slider flex-1"
                    />
                    <span className="text-opacity-50 select-none" style={{ fontSize: '1.3rem', fontFamily: 'Scheherazade New, serif', opacity: 0.5 }}>أ</span>
                </div>
            </div>

            {/* ── Search ── */}
            <div className="px-4">
                <GlobalSearch />
            </div>

            {/* ── Quran text ── */}
            <div className="glass p-6 md:p-10 min-h-[60vh]">
                <div dir="rtl" className="quran-text text-justify" style={{ fontSize: `${fontSize}rem` }}>
                    {ayahs.map(ayah => {
                        const hasBism = BISMILLAH_RE.test(ayah.text)
                        const body = hasBism ? removeBismillah(ayah.text) : ayah.text
                        return (
                            <Fragment key={ayah.number}>
                                {hasBism && (
                                    <div className="bismillah-line">
                                        {BISMILLAH_DISPLAY}
                                    </div>
                                )}
                                <span>
                                    {body}
                                    {body && (
                                        <span className="ayah-marker">{toEasternArabic(ayah.numberInSurah)}</span>
                                    )}{' '}
                                </span>
                            </Fragment>
                        )
                    })}
                </div>
            </div>

            {/* ── Pagination ── */}
            <div className="fixed bottom-0 left-0 right-0 glass border-t border-[rgba(255,255,255,0.05)] max-w-2xl mx-auto">
                <div className="flex justify-between items-center px-4 py-3">
                    <button
                        onClick={handlePrevPage}
                        disabled={pageNum <= 1}
                        className="btn-ghost px-5 py-2 rounded-xl text-sm disabled:opacity-30"
                        dir="rtl"
                    >
                        السابقة
                    </button>
                    <span className="text-xs opacity-40 font-mono" dir="rtl">
                        {toEasternArabic(pageNum)} / ٦٠٤
                    </span>
                    <button
                        onClick={handleNextPage}
                        disabled={pageNum >= 604 || updating}
                        className="btn-primary px-5 py-2 rounded-xl text-sm"
                        dir="rtl"
                    >
                        {updating ? <Loader2 size={14} className="animate-spin" /> : 'التالية'}
                    </button>
                </div>
            </div>

            <div className="h-20" />
        </div>
    )
}
