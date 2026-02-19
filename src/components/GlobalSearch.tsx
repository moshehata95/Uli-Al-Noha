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

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim()) return

        setLoading(true)
        const lowerQuery = query.toLowerCase().trim()

        try {
            // 1. Check if number (1-604) -> Page navigation
            const pageNum = Number(lowerQuery)
            if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= 604) {
                navigate(`/page/${pageNum}`)
                setLoading(false)
                return
            }

            // 2. Check if Juz/Part -> Juz navigation
            const juzMatch = lowerQuery.match(/(?:juz|part|جزء)\s*(\d+)/i)
            if (juzMatch) {
                const juzNum = Number(juzMatch[1])
                if (juzNum >= 1 && juzNum <= 30) {
                    const page = await quranService.getJuzStartPage(juzNum)
                    if (page) navigate(`/page/${page}`)
                }
                setLoading(false)
                return
            }

            // 3. Search Surah Names
            const surah = surahs.find(s =>
                s.nameEn.toLowerCase() === lowerQuery ||
                s.nameEn.toLowerCase().includes(lowerQuery) ||
                s.nameAr.includes(query) ||
                String(s.surahNumber) === lowerQuery
            )

            if (surah) {
                navigate(`/surah/${surah.surahNumber}`)
            } else {
                alert(`لم يتم العثور على سورة "${query}"`)
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
