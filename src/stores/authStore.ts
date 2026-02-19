import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Session } from '@supabase/supabase-js'
import type { UserProfile } from '../types/database'

interface AuthState {
    session: Session | null
    user: UserProfile | null
    isLoading: boolean
    setSession: (session: Session | null) => void
    setUser: (user: UserProfile | null) => void
    setLoading: (loading: boolean) => void
    clear: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            session: null,
            user: null,
            isLoading: true,
            setSession: (session) => set({ session }),
            setUser: (user) => set({ user }),
            setLoading: (isLoading) => set({ isLoading }),
            clear: () => set({ session: null, user: null, isLoading: false }),
        }),
        {
            name: 'uli-al-noha-auth',
            partialize: (state) => ({ session: state.session }),
        }
    )
)
