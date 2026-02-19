import { supabase } from '../lib/supabase'
import type { Surah, AyahMap } from '../types/database'

export const quranService = {
    async getAllSurahs(): Promise<Surah[]> {
        const { data, error } = await supabase
            .from('quran_surahs')
            .select('*')
            .order('surah_number')
        if (error) throw error
        return (data ?? []).map(mapSurah)
    },

    async getSurah(surahNumber: number): Promise<Surah | null> {
        const { data, error } = await supabase
            .from('quran_surahs')
            .select('*')
            .eq('surah_number', surahNumber)
            .maybeSingle()
        if (error) throw error
        return data ? mapSurah(data as Record<string, unknown>) : null
    },

    async getAyahMap(surahNumber: number, ayahNumber: number): Promise<AyahMap | null> {
        const { data, error } = await supabase
            .from('quran_ayah_map')
            .select('*')
            .eq('surah_number', surahNumber)
            .eq('ayah_number', ayahNumber)
            .maybeSingle()
        if (error) throw error
        if (!data) return null
        const row = data as Record<string, unknown>
        return {
            surahNumber: row.surah_number as number,
            ayahNumber: row.ayah_number as number,
            juzNumber: row.juz_number as number,
            pageNumber: row.page_number as number,
        }
    },

    async fetchSurahTextFromAPI(surahNumber: number): Promise<{
        ayahs: { numberInSurah: number; text: string }[]
        name: string
    } | null> {
        try {
            const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`)
            const json = await res.json()
            if (json.code !== 200) return null
            return {
                ayahs: json.data.ayahs.map((a: Record<string, unknown>) => ({
                    numberInSurah: a.numberInSurah as number,
                    text: a.text as string,
                })),
                name: json.data.name as string,
            }
        } catch {
            return null
        }
    },

    async fetchAyahText(surahNumber: number, ayahNumber: number): Promise<string | null> {
        try {
            const res = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/quran-uthmani`)
            const json = await res.json()
            if (json.code !== 200) return null
            return json.data.text
        } catch {
            return null
        }
    },

    async getPageData(pageNumber: number): Promise<{
        ayahs: {
            surah: { number: number; name: string; nameEn: string; englishNameTranslation: string; revelationType: string }
            numberInSurah: number
            text: string
            number: number
            juz: number
            manzil: number
            page: number
            ruku: number
            hizbQuarter: number
            sajda: boolean
        }[]
    } | null> {
        try {
            const res = await fetch(`https://api.alquran.cloud/v1/page/${pageNumber}/quran-uthmani`)
            const json = await res.json()
            if (json.code !== 200) return null
            return {
                ayahs: json.data.ayahs,
            }
        } catch {
            return null
        }
    },

    async getPageForAyah(surahNumber: number, ayahNumber: number): Promise<number | null> {
        const { data, error } = await supabase
            .from('quran_ayah_map')
            .select('page_number')
            .eq('surah_number', surahNumber)
            .eq('ayah_number', ayahNumber)
            .maybeSingle()
        if (error || !data) return null
        return (data as any).page_number
    },

    async getJuzStartPage(juzNumber: number): Promise<number | null> {
        const { data, error } = await supabase
            .from('quran_ayah_map')
            .select('page_number')
            .eq('juz_number', juzNumber)
            .order('surah_number', { ascending: true })
            .order('ayah_number', { ascending: true })
            .limit(1)
            .maybeSingle()
        if (error || !data) return null
        return (data as any).page_number
    },

    async getSurahStartPage(surahNumber: number): Promise<number | null> {
        const { data, error } = await supabase
            .from('quran_ayah_map')
            .select('page_number')
            .eq('surah_number', surahNumber)
            .eq('ayah_number', 1)
            .maybeSingle()
        if (error || !data) return null
        return (data as any).page_number
    },
}

function mapSurah(row: Record<string, unknown>): Surah {
    return {
        surahNumber: row.surah_number as number,
        nameAr: row.name_ar as string,
        nameEn: row.name_en as string,
        ayahCount: row.ayah_count as number,
    }
}
