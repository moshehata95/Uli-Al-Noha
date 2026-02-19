import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2, UserPlus, CheckCircle } from 'lucide-react'
import { groupService } from '../services/groups.service'
import { useGroups } from '../hooks/useGroups'
import { useAuth } from '../hooks/useAuth'
import type { Group } from '../types/database'

export default function JoinGroupPage() {
    const { inviteCode } = useParams<{ inviteCode: string }>()
    const navigate = useNavigate()
    const { joinGroup } = useGroups()
    const { session } = useAuth()
    const [group, setGroup] = useState<Group | null>(null)
    const [status, setStatus] = useState<'loading' | 'found' | 'notfound' | 'joined' | 'already' | 'error'>('loading')
    const [isJoining, setIsJoining] = useState(false)

    const checkInvite = useCallback(() => {
        if (!inviteCode) return
        setStatus('loading')
        groupService.getGroupByInviteCode(inviteCode).then((g) => {
            if (!g) { setStatus('notfound'); return }
            setGroup(g)
            // Check if already a member
            if (session?.user?.id) {
                groupService.isGroupMember(g.id, session.user.id).then((isMember) => {
                    setStatus(isMember ? 'already' : 'found')
                })
            } else {
                setStatus('found')
            }
        }).catch(() => setStatus('error'))
    }, [inviteCode, session?.user?.id])

    useEffect(() => {
        checkInvite()
    }, [checkInvite])

    const handleJoin = async () => {
        if (!group || !session?.user?.id) return
        setIsJoining(true)
        try {
            await joinGroup.mutateAsync({ groupId: group.id })
            setStatus('joined')
            setTimeout(() => navigate(`/groups/${group.id}`), 2000)
        } catch {
            setStatus('error')
        } finally {
            setIsJoining(false)
        }
    }

    const renderContent = () => {
        if (status === 'loading') return (
            <div className="text-center py-8">
                <Loader2 size={40} className="animate-spin mx-auto" style={{ color: 'var(--color-gold)' }} />
                <p className="mt-3" style={{ color: 'var(--color-text-muted)' }}>جارٍ التحقق من الدعوة...</p>
            </div>
        )

        if (status === 'notfound') return (
            <div className="text-center py-8">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold mb-2">رابط الدعوة غير صالح</h3>
                <p style={{ color: 'var(--color-text-muted)' }} className="mb-6">تحقق من الرابط أو اطلب دعوة جديدة من صديقك</p>
                <div className="flex gap-3 justify-center">
                    <button onClick={checkInvite} className="btn-primary">حاول مجدداً</button>
                    <button onClick={() => navigate('/groups')} className="btn-secondary">العودة</button>
                </div>
            </div>
        )

        if (status === 'error') return (
            <div className="text-center py-8">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold mb-2">حدث خطأ</h3>
                <p style={{ color: 'var(--color-text-muted)' }} className="mb-6">تأكد من اتصالك بالإنترنت</p>
                <div className="flex gap-3 justify-center">
                    <button onClick={checkInvite} className="btn-primary">حاول مجدداً</button>
                    <button onClick={() => navigate('/groups')} className="btn-secondary">العودة</button>
                </div>
            </div>
        )

        if (status === 'already') return (
            <div className="text-center py-8">
                <CheckCircle size={56} className="mx-auto mb-4" style={{ color: '#10b981' }} />
                <h3 className="text-xl font-bold mb-2">أنت عضو بالفعل في {group?.name}</h3>
                <button onClick={() => navigate(`/groups/${group?.id}`)} className="btn-primary mt-4">
                    فتح المجموعة
                </button>
            </div>
        )

        if (status === 'joined') return (
            <div className="text-center py-8">
                <CheckCircle size={56} className="mx-auto mb-4" style={{ color: '#10b981' }} />
                <h3 className="text-xl font-bold mb-2">مرحباً بك في {group?.name}</h3>
                <p style={{ color: 'var(--color-text-muted)' }}>جارٍ التوجيه إلى المجموعة...</p>
            </div>
        )

        // found
        return (
            <div className="text-center py-4">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                    style={{ background: 'linear-gradient(135deg, rgba(201,162,39,0.2), rgba(201,162,39,0.05))', border: '1px solid rgba(201,162,39,0.3)' }}>
                    <UserPlus size={36} style={{ color: 'var(--color-gold)' }} />
                </div>
                <h3 className="text-2xl font-bold mb-1">{group?.name}</h3>
                <p className="mb-8" style={{ color: 'var(--color-text-muted)' }}>
                    دُعيت للانضمام إلى هذه المجموعة
                </p>
                <div className="flex gap-3 justify-center">
                    <button onClick={handleJoin} disabled={isJoining} className="btn-primary flex items-center gap-2">
                        {isJoining ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={18} />}
                        انضم الآن
                    </button>
                    <button onClick={() => navigate('/groups')} className="btn-ghost">لاحقاً</button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-md mx-auto pt-12 animate-fade-in-up">
            <div className="glass p-8">
                <div className="text-center mb-6">
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>دعوة للانضمام</p>
                </div>
                {renderContent()}
            </div>
        </div>
    )
}
