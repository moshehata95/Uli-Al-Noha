import { useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { quranService } from '../services/quran.service'

export default function SurahViewerPage() {
    const { surahNumber } = useParams<{ surahNumber: string }>()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const mode = searchParams.get('mode')

    useEffect(() => {
        const num = Number(surahNumber)
        if (!num || isNaN(num)) {
            navigate('/')
            return
        }

        quranService.getSurahStartPage(num).then((page) => {
            if (page) {
                const modeParam = mode ? `?mode=${mode}` : ''
                navigate(`/page/${page}${modeParam}`, { replace: true })
            } else {
                navigate('/')
            }
        })
    }, [surahNumber, navigate, mode])

    return (
        <div className="flex justify-center py-20">
            <Loader2 size={40} className="animate-spin" style={{ color: 'var(--color-gold)' }} />
            <p className="sr-only">جاري التوجيه...</p>
        </div>
    )
}
