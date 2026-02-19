import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Export a flag so the app can detect misconfiguration gracefully
// instead of crashing and hanging on the loading screen.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Using untyped client to avoid strict TS inference issues with RPC generics
// Domain types are enforced at the service layer instead
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
})
