import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { groupService } from '../services/groups.service'

export function useGroups() {
    const { session } = useAuth()
    const queryClient = useQueryClient()

    const groupsQuery = useQuery({
        queryKey: ['groups', session?.user?.id],
        queryFn: () => groupService.getUserGroups(session!.user.id),
        enabled: !!session?.user?.id,
        staleTime: 60_000,
    })

    const createGroup = useMutation({
        mutationFn: (name: string) => groupService.createGroup(name, session!.user.id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups', session?.user?.id] }),
    })

    const joinGroup = useMutation({
        mutationFn: ({ groupId }: { groupId: string }) =>
            groupService.joinGroup(groupId, session!.user.id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups', session?.user?.id] }),
    })

    return {
        groups: groupsQuery.data ?? [],
        isLoading: groupsQuery.isLoading,
        error: groupsQuery.error,
        createGroup,
        joinGroup,
    }
}

export function useLeaderboard(groupId: string | null) {
    return useQuery({
        queryKey: ['leaderboard', groupId],
        queryFn: () => groupService.getLeaderboard(groupId!),
        enabled: !!groupId,
        staleTime: 10_000,
        refetchInterval: 30_000,
    })
}

export function useGroupById(groupId: string | null) {
    return useQuery({
        queryKey: ['group', groupId],
        queryFn: () => groupService.getGroupById(groupId!),
        enabled: !!groupId,
        staleTime: 60_000,
    })
}
