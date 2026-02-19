import { useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'

export function useAuth() {
    const { session, user, isLoading, setSession, setLoading, clear } = useAuthStore()

    useEffect(() => {
        // If env vars are missing, bail immediately so app isn't stuck loading
        if (!isSupabaseConfigured) {
            setLoading(false)
            return
        }

        // Safety net: never stay in loading state more than 5 seconds
        const timeout = setTimeout(() => setLoading(false), 5000)

        // Get initial session — only update auth session, NOT user profile.
        // The profile is fetched by useUser via React Query (single source of truth).
        supabase.auth.getSession().then(({ data: { session } }) => {
            clearTimeout(timeout)
            setSession(session)
            setLoading(false)
        }).catch(() => {
            clearTimeout(timeout)
            setLoading(false)
        })

        // Listen for auth changes (sign-in, sign-out, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            if (!session) {
                // Signed out — clear loading
                setLoading(false)
            }
            // Don't set isLoading=false here for sign-in events;
            // getSession().then() above already does that on initial load.
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
