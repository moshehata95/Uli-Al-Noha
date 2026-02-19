import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users, Link, Loader2, Copy, Check } from 'lucide-react'
import { useGroups } from '../hooks/useGroups'

export default function GroupsPage() {
    const { groups, isLoading, createGroup } = useGroups()
    const [showCreate, setShowCreate] = useState(false)
    const [newGroupName, setNewGroupName] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const navigate = useNavigate()

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newGroupName.trim()) return
        setIsCreating(true)
        setError(null)
        try {
            const group = await createGroup.mutateAsync(newGroupName.trim())
            setNewGroupName('')
            setShowCreate(false)
            navigate(`/groups/${group.id}`)
        } catch {
            setError('فشل إنشاء المجموعة، يرجى المحاولة مجدداً')
        } finally {
            setIsCreating(false)
        }
    }

    const copyLink = (code: string, id: string) => {
        const url = `${window.location.origin}/join/${code}`
        navigator.clipboard.writeText(url)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between pt-4">
                <h2 className="text-2xl font-bold">مجموعاتي</h2>
                <button onClick={() => setShowCreate(!showCreate)} className="btn-primary flex items-center gap-2">
                    <Plus size={18} />
                    مجموعة جديدة
                </button>
            </div>

            {/* Create group form */}
            {showCreate && (
                <form onSubmit={handleCreate} className="glass p-6 animate-fade-in-up">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Plus size={20} style={{ color: 'var(--color-gold)' }} />
                        إنشاء مجموعة جديدة
                    </h3>
                    <input
                        className="input mb-3"
                        placeholder="اسم المجموعة..."
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        disabled={isCreating}
                        dir="rtl"
                    />
                    {error && (
                        <p className="text-sm mb-3" style={{ color: '#f87171' }}>{error}</p>
                    )}
                    <div className="flex gap-3">
                        <button type="submit" disabled={isCreating} className="btn-primary flex items-center gap-2">
                            {isCreating ? <Loader2 size={16} className="animate-spin" /> : null}
                            إنشاء
                        </button>
                        <button type="button" onClick={() => setShowCreate(false)} className="btn-ghost">
                            إلغاء
                        </button>
                    </div>
                </form>
            )}

            {/* Groups list */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 size={36} className="animate-spin" style={{ color: 'var(--color-gold)' }} />
                </div>
            ) : groups.length === 0 ? (
                <div className="glass p-12 text-center">
                    <Users size={48} className="mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
                    <p className="font-semibold mb-2">لا توجد مجموعات بعد</p>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        أنشئ مجموعة أو انضم بدعوة من صديق
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {groups.map((group) => (
                        <div
                            key={group.id}
                            className="glass p-5 flex items-center justify-between cursor-pointer hover:border-[rgba(201,162,39,0.3)] transition-all duration-200"
                            onClick={() => navigate(`/groups/${group.id}`)}
                            style={{ borderColor: 'rgba(30,58,95,0.4)' }}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{ background: 'linear-gradient(135deg, rgba(201,162,39,0.15), rgba(201,162,39,0.05))', border: '1px solid rgba(201,162,39,0.2)' }}>
                                    <Users size={22} style={{ color: 'var(--color-gold)' }} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{group.name}</h3>
                                    <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                                        {group.inviteCode}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); copyLink(group.inviteCode, group.id) }}
                                    className="btn-ghost p-2 rounded-xl"
                                    title="نسخ رابط الدعوة"
                                >
                                    {copiedId === group.id ? <Check size={18} style={{ color: '#10b981' }} /> : <Copy size={18} />}
                                </button>
                                <Link size={18} style={{ color: 'var(--color-text-muted)' }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Info */}
            <div className="rounded-xl p-4 text-sm"
                style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', color: 'var(--color-text-muted)' }}>
                <p className="flex items-center gap-2">
                    <span style={{ color: '#10b981' }}>💡</span>
                    مشارك بنفس مستواك في كل مجموعة — تقدمك الحقيقي واحد لكل مجموعاتك.
                </p>
            </div>
        </div>
    )
}
