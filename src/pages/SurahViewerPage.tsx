import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { quranService } from '../services/quran.service'

export default function SurahViewerPage() {
    const { surahNumber } = useParams<{ surahNumber: string }>()
    const navigate = useNavigate()

    useEffect(() => {
        const num = Number(surahNumber)
        if (!num || isNaN(num)) {
            navigate('/')
            return
        }

        // Fetch start page and redirect
        quranService.getSurahStartPage(num).then((page) => {
            if (page) {
                navigate(`/page/${page}`, { replace: true })
            } else {
                navigate('/')
            }
        })
    }, [surahNumber, navigate])

    return (
        <div className="flex justify-center py-20">
            <Loader2 size={40} className="animate-spin" style={{ color: 'var(--color-gold)' }} />
            <p className="sr-only">جاري التوجيه...</p>
        </div>
    )
}
