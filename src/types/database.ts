export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    name: string
                    avatar_url: string | null
                    progress_surah: number
                    progress_ayah: number
                    created_at: string
                }
                Insert: {
                    id: string
                    name?: string
                    avatar_url?: string | null
                    progress_surah?: number
                    progress_ayah?: number
                    created_at?: string
                }
                Update: {
                    name?: string
                    avatar_url?: string | null
                    progress_surah?: number
                    progress_ayah?: number
                }
            }
            groups: {
                Row: {
                    id: string
                    name: string
                    invite_code: string
                    owner_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    invite_code?: string
                    owner_id: string
                    created_at?: string
                }
                Update: {
                    name?: string
                }
            }
            group_members: {
                Row: {
                    id: string
                    group_id: string
                    user_id: string
                    joined_at: string
                }
                Insert: {
                    id?: string
                    group_id: string
                    user_id: string
                    joined_at?: string
                }
                Update: never
            }
            quran_surahs: {
                Row: {
                    surah_number: number
                    name_ar: string
                    name_en: string
                    ayah_count: number
                }
                Insert: never
                Update: never
            }
            quran_ayah_map: {
                Row: {
                    surah_number: number
                    ayah_number: number
                    juz_number: number
                    page_number: number
                }
                Insert: never
                Update: never
            }
        }
        Functions: {
            advance_ayah: {
                Args: { p_user_id: string }
                Returns: { new_surah: number; new_ayah: number; completed_surah: boolean }[]
            }
            complete_surah: {
                Args: { p_user_id: string }
                Returns: { new_surah: number; new_ayah: number }[]
            }
            get_group_leaderboard: {
                Args: { p_group_id: string }
                Returns: {
                    user_id: string
                    name: string
                    avatar_url: string | null
                    progress_surah: number
                    progress_ayah: number
                    juz_number: number
                    surah_name_ar: string
                    surah_name_en: string
                    ayah_count: number
                    rank: number
                }[]
            }
            get_group_by_invite_code: {
                Args: { code: string }
                Returns: {
                    id: string
                    name: string
                    invite_code: string
                    owner_id: string
                    created_at: string
                }[]
            }
        }
    }
}

// App domain types
export interface UserProfile {
    id: string
    name: string
    avatarUrl: string | null
    progressSurah: number
    progressAyah: number
    createdAt: string
}

export interface Group {
    id: string
    name: string
    inviteCode: string
    ownerId: string
    createdAt: string
}

export interface GroupMember {
    id: string
    groupId: string
    userId: string
    joinedAt: string
}

export interface Surah {
    surahNumber: number
    nameAr: string
    nameEn: string
    ayahCount: number
}

export interface AyahMap {
    surahNumber: number
    ayahNumber: number
    juzNumber: number
    pageNumber: number
}

export interface LeaderboardEntry {
    userId: string
    name: string
    avatarUrl: string | null
    progressSurah: number
    progressAyah: number
    juzNumber: number
    surahNameAr: string
    surahNameEn: string
    ayahCount: number
    rank: number
}

export interface ProgressResult {
    newSurah: number
    newAyah: number
    completedSurah?: boolean
}
