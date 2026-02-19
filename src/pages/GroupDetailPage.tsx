import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2, Users, Copy, Check, Trophy, Trash2, ArrowRight } from 'lucide-react'
import { groupService } from '../services/groups.service'
import { useLeaderboard, useGroupById } from '../hooks/useGroups'
import { useGroupRealtime } from '../hooks/useGroupRealtime'
import { useAuth } from '../hooks/useAuth'
import type { LeaderboardEntry } from '../types/database'

function AvatarCircle({ name, size = 40 }: { name: string; size?: number }) {
    const initials = name.charAt(0).toUpperCase()
    const colors: [string, string][] = [
        ['#c9a227', '#8b6914'], ['#10b981', '#047857'], ['#6366f1', '#4338ca'],
        ['#f97316', '#c2410c'], ['#ec4899', '#be185d'],
    ]
    const idx = name.charCodeAt(0) % colors.length
    const [start, end] = colors[idx]
    return (
        <div
            style={{
                width: size, height: size, borderRadius: '50%',
                background: `linear-gradient(135deg, ${start}, ${end})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: size * 0.4, color: '#fff', flexShrink: 0,
            }}
        >
            {initials}
        </div>
    )
}

function SurahTimeline({ members }: { members: LeaderboardEntry[] }) {
    if (!members.length) return null
    const maxSurah = 114
    const sorted = [...members].sort((a, b) => a.progressSurah - b.progressSurah || a.progressAyah - b.progressAyah)

    return (
        <div className="glass p-6">
            <h3 className="font-bold mb-5 flex items-center gap-2">
                <span style={{ color: 'var(--color-gold)' }}>🛤️</span> رحلة الختم
            </h3>
            <div className="relative">
                {/* Track */}
                <div className="h-2 rounded-full mb-12 relative" style={{ background: 'rgba(30,58,95,0.5)' }}>
                    <div className="absolute inset-0 rounded-full" style={{
                        background: 'linear-gradient(90deg, rgba(30,58,95,0.8), rgba(201,162,39,0.5))',
                    }} />

                    {/* Member markers on track */}
                    {members.map((m, i) => {
                        const pct = Math.min((m.progressSurah / maxSurah) * 100, 99)
                        const yOffset = -40 - (i % 2) * 20
                        return (
                            <div
                                key={m.userId}
                                className="absolute flex flex-col items-center transition-all duration-700"
                                style={{ left: `${pct}%`, top: yOffset }}
                            >
                                <AvatarCircle name={m.name} size={28} />
                                {m.rank === 1 && <span className="absolute -top-3 text-xs">👑</span>}
                                <div className="w-0.5 h-3 mt-0.5" style={{ background: 'rgba(201,162,39,0.4)' }} />
                            </div>
                        )
                    })}

                    {/* Goal */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-1/2 text-xl">🎯</div>
                </div>

                {/* Surah labels */}
                <div className="flex justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    <span>سورة ١</span>
                    <span>الجزء ١٥</span>
                    <span>سورة ١١٤ 🎯</span>
                </div>
            </div>

            {/* Member progress bars */}
            <div className="mt-5 space-y-2">
                {sorted.map((m) => (
                    <div key={m.userId} className="flex items-center gap-3">
                        <AvatarCircle name={m.name} size={26} />
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="truncate font-medium">{m.name}</span>
                                <span style={{ color: 'var(--color-text-muted)' }}>{m.progressSurah}/{maxSurah}</span>
                            </div>
                            <div className="progress-bar" style={{ height: '3px' }}>
                                <div className="progress-bar-fill" style={{ width: `${(m.progressSurah / maxSurah) * 100}%` }} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function LeaderboardTable({ members, currentUserId }: { members: LeaderboardEntry[]; currentUserId: string }) {
    const rankIcon = (rank: number): string | number => {
        if (rank === 1) return '🥇'
        if (rank === 2) return '🥈'
        if (rank === 3) return '🥉'
        return rank
    }

    return (
        <div className="glass p-6">
            <h3 className="font-bold mb-5 flex items-center gap-2">
                <Trophy size={18} style={{ color: 'var(--color-gold)' }} />
                المتصدرون
            </h3>
            <div className="space-y-3">
                {members.map((m) => {
                    const isMe = m.userId === currentUserId
                    const progressPct = Math.round((m.progressAyah / m.ayahCount) * 100)
                    const rankStyle =
                        m.rank === 1 ? { background: 'linear-gradient(135deg,#ffd700,#b8860b)', color: '#000' }
                            : m.rank === 2 ? { background: 'linear-gradient(135deg,#c0c0c0,#808080)', color: '#000' }
                                : m.rank === 3 ? { background: 'linear-gradient(135deg,#cd7f32,#8b4513)', color: '#fff' }
                                    : { background: 'rgba(30,58,95,0.3)', color: 'var(--color-text)' }
                    return (
                        <div
                            key={m.userId}
                            className="flex items-center gap-4 p-4 rounded-xl transition-all duration-200"
                            style={{
                                background: isMe ? 'rgba(201,162,39,0.08)' : 'rgba(10,14,20,0.4)',
                                border: isMe ? '1px solid rgba(201,162,39,0.3)' : '1px solid rgba(30,58,95,0.3)',
                            }}
                        >
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0" style={rankStyle}>
                                {rankIcon(m.rank)}
                            </div>
                            <AvatarCircle name={m.name} size={38} />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold truncate">{m.name}</span>
                                    {isMe && (
                                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(201,162,39,0.15)', color: 'var(--color-gold)' }}>
                                            أنت
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs mt-0.5" dir="rtl" style={{ color: 'var(--color-text-muted)' }}>
                                    {m.surahNameAr} · الآية {m.progressAyah}/{m.ayahCount}
                                </div>
                                <div className="progress-bar mt-1.5" style={{ height: '3px' }}>
                                    <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
                                </div>
                            </div>
                            <div className="flex-shrink-0 text-center">
                                <div className="text-xs font-bold" style={{ color: 'var(--color-gold)' }}>جزء</div>
                                <div className="text-lg font-bold">{m.juzNumber}</div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default function GroupDetailPage() {
    const { groupId } = useParams<{ groupId: string }>()
    const navigate = useNavigate()
    const { data: group } = useGroupById(groupId ?? null)
    const { data: members, isLoading } = useLeaderboard(groupId ?? null)
    const { session } = useAuth()
    const [copied, setCopied] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    useGroupRealtime(groupId ?? null)

    // suppress unused import warning
    useEffect(() => { }, [])

    const copyInvite = () => {
        if (!group) return
        navigator.clipboard.writeText(`${window.location.origin}/join/${group.inviteCode}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleDelete = async () => {
        if (!group || !window.confirm('هل أنت متأكد من حذف المجموعة؟ لا يمكن التراجع عن هذا الإجراء.')) return
        setIsDeleting(true)
        try {
            await groupService.deleteGroup(group.id)
            navigate('/groups')
        } catch {
            alert('فشل حذف المجموعة')
            setIsDeleting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 size={40} className="animate-spin" style={{ color: 'var(--color-gold)' }} />
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
            <div className="flex items-center gap-4 pt-4">
                <button onClick={() => navigate('/groups')} className="btn-ghost p-2 rounded-xl" title="عودة للمجموعات">
                    <ArrowRight size={20} />
                </button>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold">{group?.name ?? '...'}</h2>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Users size={14} style={{ color: 'var(--color-text-muted)' }} />
                        <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                            {members?.length ?? 0} عضو
                        </span>
                        {group && (
                            <span className="text-xs font-mono px-2 py-0.5 rounded-lg"
                                style={{ background: 'rgba(30,58,95,0.4)', color: 'var(--color-text-muted)' }}>
                                {group.inviteCode}
                            </span>
                        )}
                    </div>
                </div>
                <button onClick={copyInvite} className="btn-secondary flex items-center gap-2 text-sm">
                    {copied ? <Check size={16} style={{ color: '#10b981' }} /> : <Copy size={16} />}
                    دعوة
                </button>
            </div>

            {members && members.length > 0 && <SurahTimeline members={members} />}

            {members && members.length > 0 ? (
                <LeaderboardTable members={members} currentUserId={session?.user?.id ?? ''} />
            ) : (
                <div className="glass p-12 text-center">
                    <Users size={48} className="mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
                    <p className="font-semibold">لا يوجد أعضاء بعد</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>شارك رابط الدعوة لإضافة أصدقاء</p>
                </div>
            )}

            {group && (
                <div className="rounded-xl p-4 text-sm"
                    style={{ background: 'rgba(201,162,39,0.05)', border: '1px solid rgba(201,162,39,0.15)', color: 'var(--color-text-muted)' }}>
                    <span style={{ color: 'var(--color-gold)' }}>🔗</span>{' '}
                    رابط الانضمام: <code className="text-xs">{window.location.origin}/join/{group.inviteCode}</code>
                </div>
            )}

            {group && session?.user?.id === group.ownerId && (
                <div className="flex justify-end pt-4 border-t border-[rgba(255,255,255,0.1)]">
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="btn-ghost text-red-400 hover:text-red-300 hover:bg-red-900/20 flex items-center gap-2 px-4"
                    >
                        {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                        حذف المجموعة
                    </button>
                </div>
            )}
        </div>
    )
}
