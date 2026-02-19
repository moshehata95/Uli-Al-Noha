import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Loader2 } from 'lucide-react'
import { quranService } from '../services/quran.service'

import { useSurahs } from '../hooks/useSurahs'

export default function GlobalSearch() {
    const navigate = useNavigate()
    const [query, setQuery] = useState('')
    const { data: surahs = [] } = useSurahs()
    const [loading, setLoading] = useState(false)

    // Helper to normalize Arabic text for better search matching
    const normalizeArabic = (text: string) => {
        return text
            .replace(/([^\u0621-\u063A\u0641-\u064A\u0660-\u0669a-zA-Z 0-9])/g, '') // Remove diacritics
            .replace(/(آ|إ|أ)/g, 'ا')
            .replace(/(ة)/g, 'ه')
            .replace(/(ى)/g, 'ي')
            .replace(/(ؤ)/g, 'و')
            .replace(/(ئ)/g, 'ي')
            .trim()
            .toLowerCase()
    }

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim()) return

        setLoading(true)
        const normalizedQuery = normalizeArabic(query)

        try {


            const numVal = Number(query.replace(/[٠-٩]/g, d => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]))

            if (!isNaN(numVal) && numVal >= 1 && numVal <= 604) {
                navigate(`/page/${numVal}`)
                setLoading(false)
                return
            }

            // 2. Check if Juz/Part -> Juz navigation
            const juzMatch = query.match(/(?:juz|part|جزء)\s*(\d+|[٠-٩]+)/i)
            if (juzMatch) {
                const partNumStr = juzMatch[1].replace(/[٠-٩]/g, d => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)])
                const juzNum = Number(partNumStr)
                if (juzNum >= 1 && juzNum <= 30) {
                    const page = await quranService.getJuzStartPage(juzNum)
                    if (page) navigate(`/page/${page}`)
                }
                setLoading(false)
                return
            }

            // 3. Search Surah Names with Normalization
            const surah = surahs.find(s => {
                const normNameAr = normalizeArabic(s.nameAr)
                const normNameEn = normalizeArabic(s.nameEn) // Just lowercase/trim

                return (
                    normNameEn === normalizedQuery ||
                    normNameEn.includes(normalizedQuery) ||
                    normNameAr.includes(normalizedQuery) ||
                    // Handle "Surat Yusuf" vs "Yusuf"
                    normNameAr.replace('sura', '').trim().includes(normalizedQuery) ||
                    String(s.surahNumber) === normalizedQuery
                )
            })

            // If exact match not found, try fuzzy or "starts with"
            // actually includes() covers startsWith. 

            if (surah) {
                navigate(`/surah/${surah.surahNumber}`)
            } else {
                // Try finding by simple string includes on original text as fallback
                const fallback = surahs.find(s => s.nameAr.includes(query) || s.nameEn.toLowerCase().includes(query.toLowerCase()))
                if (fallback) {
                    navigate(`/surah/${fallback.surahNumber}`)
                } else {
                    alert(`لم يتم العثور على سورة "${query}"`)
                }
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSearch} className="relative w-full max-w-md mx-auto mb-6">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث عن سورة، صفحة (1-604)، أو جزء..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[rgba(30,58,95,0.3)] border border-[rgba(255,255,255,0.1)] focus:border-[var(--color-gold)] focus:outline-none text-right"
                dir="auto"
            />
            <button
                type="submit"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-gold)]"
                disabled={loading}
            >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            </button>
        </form>
    )
}
