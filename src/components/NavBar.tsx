import { NavLink, useNavigate } from 'react-router-dom'
import { BookOpen, LayoutDashboard, Users, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function NavBar() {
    const { signOut, user } = useAuth()
    const navigate = useNavigate()

    const handleSignOut = async () => {
        await signOut()
        navigate('/auth')
    }

    const navItems = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'لوحتي' },
        { to: '/groups', icon: Users, label: 'المجموعات' },
    ]

    return (
        <nav className="glass fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3"
            style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
            {/* Logo */}
            <NavLink to="/dashboard" className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #c9a227, #8b6914)' }}>
                    <BookOpen size={18} color="#0a0e14" />
                </div>
                <span className="font-bold text-gold text-lg hidden sm:block">أولي النهي</span>
            </NavLink>

            {/* Nav items */}
            <div className="flex items-center gap-1">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive
                                ? 'text-[#c9a227] bg-[rgba(201,162,39,0.1)] border border-[rgba(201,162,39,0.2)]'
                                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[rgba(255,255,255,0.04)]'
                            }`
                        }
                    >
                        <Icon size={16} />
                        <span className="hidden sm:inline">{label}</span>
                    </NavLink>
                ))}
            </div>

            {/* User + Sign out */}
            <div className="flex items-center gap-3">
                {user && (
                    <span className="text-sm hidden md:block" style={{ color: 'var(--color-text-muted)' }}>
                        {user.name}
                    </span>
                )}
                <button onClick={handleSignOut} className="btn-ghost p-2 rounded-xl" title="تسجيل الخروج">
                    <LogOut size={18} />
                </button>
            </div>
        </nav>
    )
}
