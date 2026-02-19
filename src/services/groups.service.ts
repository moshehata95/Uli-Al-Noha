import { supabase } from '../lib/supabase'
import type { Group, LeaderboardEntry } from '../types/database'

export const groupService = {
    async getUserGroups(userId: string): Promise<Group[]> {
        const { data, error } = await supabase
            .from('group_members')
            .select('groups(*)')
            .eq('user_id', userId)
        if (error) throw error
        return (data ?? [])
            .map((row: Record<string, unknown>) => row.groups as Record<string, unknown>)
            .filter(Boolean)
            .map(mapGroup)
    },

    async createGroup(name: string, ownerId: string): Promise<Group> {
        const { data, error } = await supabase
            .from('groups')
            .insert({ name, owner_id: ownerId, invite_code: '' })
            .select()
            .single()
        if (error) throw error
        const group = mapGroup(data as Record<string, unknown>)
        // Auto-join creator as member
        await supabase.from('group_members').insert({
            group_id: group.id,
            user_id: ownerId,
        })
        return group
    },

    async getGroupByInviteCode(code: string): Promise<Group | null> {
        const { data, error } = await supabase
            .from('groups')
            .select('*')
            .eq('invite_code', code)
            .maybeSingle()
        if (error) throw error
        return data ? mapGroup(data as Record<string, unknown>) : null
    },

    async joinGroup(groupId: string, userId: string): Promise<void> {
        const { error } = await supabase.from('group_members').insert({
            group_id: groupId,
            user_id: userId,
        })
        if (error && !error.message.includes('duplicate')) throw error
    },

    async isGroupMember(groupId: string, userId: string): Promise<boolean> {
        const { data } = await supabase
            .from('group_members')
            .select('id')
            .eq('group_id', groupId)
            .eq('user_id', userId)
            .maybeSingle()
        return !!data
    },

    async getLeaderboard(groupId: string): Promise<LeaderboardEntry[]> {
        const { data, error } = await supabase.rpc('get_group_leaderboard', {
            p_group_id: groupId,
        })
        if (error) throw error
        return (data ?? []).map((row: Record<string, unknown>) => ({
            userId: row.user_id as string,
            name: row.name as string,
            avatarUrl: row.avatar_url as string | null,
            progressSurah: row.progress_surah as number,
            progressAyah: row.progress_ayah as number,
            juzNumber: row.juz_number as number,
            surahNameAr: row.surah_name_ar as string,
            surahNameEn: row.surah_name_en as string,
            ayahCount: row.ayah_count as number,
            rank: Number(row.rank),
        }))
    },

    async getGroupById(groupId: string): Promise<Group | null> {
        const { data, error } = await supabase
            .from('groups')
            .select('*')
            .eq('id', groupId)
            .maybeSingle()
        if (error) throw error
        return data ? mapGroup(data as Record<string, unknown>) : null
    },
}

function mapGroup(row: Record<string, unknown>): Group {
    return {
        id: row.id as string,
        name: row.name as string,
        inviteCode: row.invite_code as string,
        ownerId: row.owner_id as string,
        createdAt: row.created_at as string,
    }
}
