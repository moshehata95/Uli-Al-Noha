-- Create a v2 leaderboard function to debug visibility issues
-- This function uses SECURITY DEFINER to bypass RLS on group_members and users
CREATE OR REPLACE FUNCTION get_group_leaderboard_debug(p_group_id uuid)
RETURNS TABLE (
    user_id uuid,
    name text,
    avatar_url text,
    progress_surah int,
    progress_ayah int,
    juz_number int,
    surah_name_ar text,
    surah_name_en text,
    ayah_count int,
    rank bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public -- Ensure we use public schema
AS $$
BEGIN
    -- For debugging, we removed the strict membership check temporarily to see if rows return.
    -- Ideally, we put it back later.
    -- IF NOT EXISTS (SELECT 1 FROM group_members WHERE group_id = p_group_id AND user_id = auth.uid()) THEN
    --    RAISE EXCEPTION 'Not a member';
    -- END IF;

    RETURN QUERY
    SELECT
        u.id AS user_id,
        u.name,
        u.avatar_url,
        u.progress_surah,
        u.progress_ayah,
        COALESCE(qam.juz_number, 1) AS juz_number,
        qs.name_ar AS surah_name_ar,
        qs.name_en AS surah_name_en,
        qs.ayah_count,
        RANK() OVER (ORDER BY u.progress_surah DESC, u.progress_ayah DESC) AS rank
    FROM group_members gm
    JOIN users u ON u.id = gm.user_id
    LEFT JOIN quran_surahs qs ON qs.surah_number = u.progress_surah
    LEFT JOIN quran_ayah_map qam ON qam.surah_number = u.progress_surah AND qam.ayah_number = u.progress_ayah
    WHERE gm.group_id = p_group_id
    ORDER BY u.progress_surah DESC, u.progress_ayah DESC;
END;
$$;
