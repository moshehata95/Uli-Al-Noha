import { useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { userService } from '../services/users.service'

export function useAuth() {
    const { session, user, isLoading, setSession, setUser, setLoading, clear } = useAuthStore()

    useEffect(() => {
        // If env vars are missing, bail immediately so app isn't stuck loading
        if (!isSupabaseConfigured) {
            setLoading(false)
            return
        }

        // Safety net: never stay in loading state more than 5 seconds
        const timeout = setTimeout(() => setLoading(false), 5000)

        // Get initial session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            clearTimeout(timeout)
            setSession(session)
            if (session?.user) {
                try {
                    const profile = await userService.getProfile(session.user.id)
                    setUser(profile)
                } catch {
                    // Profile may not exist yet
                }
            }
            setLoading(false)
        }).catch(() => {
            clearTimeout(timeout)
            setLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session)
            if (session?.user) {
                try {
                    const profile = await userService.getProfile(session.user.id)
                    setUser(profile)
                } catch {
                    setUser(null)
                }
            } else {
                setUser(null)
            }
            setLoading(false)
        })

        return () => {
            clearTimeout(timeout)
            subscription.unsubscribe()
        }
    }, [])

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
    }

    const signUp = async (email: string, password: string, name: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name } },
        })
        if (error) throw error
        return data
    }

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/`,
            },
        })
        if (error) throw error
    }

    const signOut = async () => {
        await supabase.auth.signOut()
        clear()
    }

    return { session, user, isLoading, signIn, signUp, signInWithGoogle, signOut }
}
