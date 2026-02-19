import { supabase } from '../lib/supabase'
import type { UserProfile } from '../types/database'

export const userService = {
    async getProfile(userId: string): Promise<UserProfile> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()
        if (error) throw error
        return mapUser(data)
    },

    async updateName(userId: string, name: string): Promise<void> {
        const { error } = await supabase
            .from('users')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .update({ name } as any)
            .eq('id', userId)
        if (error) throw error
    },

    async advanceAyah(userId: string): Promise<{ new_surah: number; new_ayah: number; completed_surah: boolean }> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any).rpc('advance_ayah', { p_user_id: userId })
        if (error) throw error
        return data[0]
    },

    async completeSurah(userId: string): Promise<{ new_surah: number; new_ayah: number }> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any).rpc('complete_surah', { p_user_id: userId })
        if (error) throw error
        return data[0]
    },

    async setProgress(userId: string, surah: number, ayah: number): Promise<void> {
        const { error } = await supabase
            .from('users')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .update({ progress_surah: surah, progress_ayah: ayah } as any)
            .eq('id', userId)
        if (error) throw error
    },
}

function mapUser(row: Record<string, unknown>): UserProfile {
    return {
        id: row.id as string,
        name: row.name as string,
        avatarUrl: row.avatar_url as string | null,
        progressSurah: row.progress_surah as number,
        progressAyah: row.progress_ayah as number,
        createdAt: row.created_at as string,
    }
}
