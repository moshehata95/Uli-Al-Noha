import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { groupService } from '../services/groups.service'

/**
 * Subscribes to real-time changes on the `users` table.
 * When any member of the given group updates their progress,
 * the leaderboard is refetched automatically.
 */
export function useGroupRealtime(groupId: string | null) {
    const queryClient = useQueryClient()

    useEffect(() => {
        if (!groupId) return

        // Fetch member IDs to filter realtime events
        let memberIds: string[] = []
        let channel: ReturnType<typeof supabase.channel> | null = null

        const setup = async () => {
            // Get current members
            const leaderboard = await groupService.getLeaderboard(groupId)
            memberIds = leaderboard.map((m) => m.userId)

            channel = supabase
                .channel(`group-${groupId}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'users',
                    },
                    (payload) => {
                        const updatedUserId = (payload.new as Record<string, unknown>).id as string
                        if (memberIds.includes(updatedUserId)) {
                            // Invalidate leaderboard to refetch
                            queryClient.invalidateQueries({ queryKey: ['leaderboard', groupId] })
                        }
                    }
                )
                .subscribe()
        }

        setup()

        return () => {
            if (channel) supabase.removeChannel(channel)
        }
    }, [groupId, queryClient])
}
