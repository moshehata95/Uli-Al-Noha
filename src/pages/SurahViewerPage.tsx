import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2, ArrowRight, Wifi, WifiOff } from 'lucide-react'
import { useSurah } from '../hooks/useSurahs'
import { quranService } from '../services/quran.service'

interface Ayah { numberInSurah: number; text: string }

export default function SurahViewerPage() {
    const { surahNumber } = useParams<{ surahNumber: string }>()
    const navigate = useNavigate()
    const num = Number(surahNumber)
    const { data: surah } = useSurah(num)
    const [ayahs, setAyahs] = useState<Ayah[]>([])
    const [loading, setLoading] = useState(true)
    const [source, setSource] = useState<'api' | 'unavailable'>('api')

    useEffect(() => {
        if (!num) return
        setLoading(true)
        quranService.fetchSurahTextFromAPI(num).then((data) => {
            if (data) {
                setAyahs(data.ayahs)
                setSource('api')
            } else {
                setSource('unavailable')
            }
        }).finally(() => setLoading(false))
    }, [num])

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
            <div className="flex items-center gap-4 pt-4">
                <button onClick={() => navigate(-1)} className="btn-ghost p-2 rounded-xl">
                    <ArrowRight size={20} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold" dir="rtl">{surah?.nameAr ?? '...'}</h2>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{surah?.nameEn} · {surah?.ayahCount} آية</p>
                </div>
                <div className="mr-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
                    style={{ background: 'rgba(30,58,95,0.4)', color: 'var(--color-text-muted)' }}>
                    {source === 'api' ? <Wifi size={12} /> : <WifiOff size={12} />}
                    AlQuran Cloud
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 size={40} className="animate-spin" style={{ color: 'var(--color-gold)' }} />
                </div>
            ) : source === 'unavailable' ? (
                <div className="glass p-12 text-center">
                    <WifiOff size={48} className="mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
                    <p className="font-semibold mb-2">النص غير متاح حالياً</p>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        تحقق من الاتصال بالإنترنت لتحميل نص السورة
                    </p>
                </div>
            ) : (
                <div className="glass p-8">
                    <div className="text-center mb-8 pb-6" style={{ borderBottom: '1px solid rgba(30,58,95,0.4)' }}>
                        <p className="text-xl font-semibold" dir="rtl" style={{ fontFamily: 'Noto Naskh Arabic', color: 'var(--color-gold)' }}>
                            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                        </p>
                    </div>
                    <div className="space-y-4" dir="rtl">
                        {ayahs.map((ayah) => (
                            <div key={ayah.numberInSurah} className="flex gap-4 items-start py-3"
                                style={{ borderBottom: '1px solid rgba(30,58,95,0.2)' }}>
                                <div
                                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                    style={{ background: 'rgba(201,162,39,0.1)', color: 'var(--color-gold)', border: '1px solid rgba(201,162,39,0.2)' }}
                                >
                                    {ayah.numberInSurah}
                                </div>
                                <p className="text-lg leading-loose flex-1"
                                    style={{ fontFamily: 'Noto Naskh Arabic', lineHeight: '2.2' }}>
                                    {ayah.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
