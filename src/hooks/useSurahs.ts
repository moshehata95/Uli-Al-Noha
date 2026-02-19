import { useQuery } from '@tanstack/react-query'
import { quranService } from '../services/quran.service'

export function useSurahs() {
    return useQuery({
        queryKey: ['surahs'],
        queryFn: () => quranService.getAllSurahs(),
        staleTime: Infinity, // Quran data never changes
        gcTime: Infinity,
    })
}

export function useSurah(surahNumber: number | null | undefined) {
    return useQuery({
        queryKey: ['surah', surahNumber],
        queryFn: () => quranService.getSurah(surahNumber!),
        enabled: surahNumber != null && surahNumber > 0,
        staleTime: Infinity,
        gcTime: Infinity,
    })
}

export function useAyahMap(surahNumber: number | null, ayahNumber: number | null) {
    return useQuery({
        queryKey: ['ayah-map', surahNumber, ayahNumber],
        queryFn: () => quranService.getAyahMap(surahNumber!, ayahNumber!),
        enabled: surahNumber != null && ayahNumber != null,
        staleTime: Infinity,
        gcTime: Infinity,
    })
}
