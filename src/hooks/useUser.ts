import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../stores/authStore'
import { userService } from '../services/users.service'
import type { UserProfile } from '../types/database'

export function useUser() {
    // Read directly from store to avoid re-subscribing to the auth hook
    const userId = useAuthStore((s) => s.session?.user?.id)
    const setUser = useAuthStore((s) => s.setUser)
    const queryClient = useQueryClient()

    const userQuery = useQuery<UserProfile>({
        queryKey: ['user', userId],
        queryFn: () => userService.getProfile(userId!),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,   // 5 minutes — profile only changes on mutation
        gcTime: 10 * 60 * 1000,     // keep in cache 10 minutes
        retry: 1,                   // only 1 retry for faster error recovery
    })

    const advanceAyah = useMutation({
        mutationFn: () => userService.advanceAyah(userId!),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['user', userId] })
            const prev = queryClient.getQueryData<UserProfile>(['user', userId])
            if (prev) {
                const optimistic: UserProfile = {
                    ...prev,
                    progressAyah: prev.progressAyah + 1,
                }
                queryClient.setQueryData<UserProfile>(['user', userId], optimistic)
            }
            return { prev }
        },
        onError: (_err: unknown, _v: unknown, ctx: { prev?: UserProfile } | undefined) => {
            if (ctx?.prev) queryClient.setQueryData<UserProfile>(['user', userId], ctx.prev)
        },
        onSuccess: (data: { new_surah: number; new_ayah: number; completed_surah: boolean } | undefined) => {
            if (data) {
                queryClient.setQueryData<UserProfile>(['user', userId], (old) =>
                    old ? { ...old, progressSurah: data.new_surah, progressAyah: data.new_ayah } : old
                )
                const updated = queryClient.getQueryData<UserProfile>(['user', userId])
                if (updated) setUser(updated)
            }
            queryClient.invalidateQueries({ queryKey: ['user', userId] })
        },
    })

    const completeSurah = useMutation({
        mutationFn: () => userService.completeSurah(userId!),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['user', userId] })
            const prev = queryClient.getQueryData<UserProfile>(['user', userId])
            if (prev) {
                queryClient.setQueryData<UserProfile>(['user', userId], {
                    ...prev,
                    progressSurah: Math.min(prev.progressSurah + 1, 114),
                    progressAyah: 1,
                })
            }
            return { prev }
        },
        onError: (_err: unknown, _v: unknown, ctx: { prev?: UserProfile } | undefined) => {
            if (ctx?.prev) queryClient.setQueryData<UserProfile>(['user', userId], ctx.prev)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', userId] })
        },
    })

    const resetProgress = useMutation({
        mutationFn: () => userService.setProgress(userId!, 1, 1),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['user', userId] })
            const prev = queryClient.getQueryData<UserProfile>(['user', userId])
            if (prev) {
                queryClient.setQueryData<UserProfile>(['user', userId], {
                    ...prev,
                    progressSurah: 1,
                    progressAyah: 1,
                })
            }
            return { prev }
        },
        onError: (_err: unknown, _v: unknown, ctx: { prev?: UserProfile } | undefined) => {
            if (ctx?.prev) queryClient.setQueryData<UserProfile>(['user', userId], ctx.prev)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', userId] })
        },
    })

    return {
        user: userQuery.data,
        isLoading: userQuery.isLoading,
        error: userQuery.error,
        advanceAyah,
        completeSurah,
        resetProgress,
    }
}
