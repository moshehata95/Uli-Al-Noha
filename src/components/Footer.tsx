import { MessageCircle } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="py-8 text-center text-sm mt-auto"
            style={{
                color: 'var(--color-text-muted)',
                borderTop: '1px solid rgba(201,162,39,0.1)',
                background: 'linear-gradient(to top, rgba(10,14,20,0.8), transparent)'
            }}>
            <div className="flex flex-col items-center gap-3">
                <p>
                    Developed by <span className="font-bold" style={{ color: '#c9a227' }}>Dr. Mohamed Shehata</span>
                </p>

                <a
                    href="https://wa.me/201015217299"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 hover:bg-[rgba(201,162,39,0.1)]"
                    style={{ color: 'var(--color-text-muted)' }}
                    dir="ltr"
                >
                    <MessageCircle size={16} style={{ color: '#25D366' }} />
                    <span className="font-mono">+20 101 521 7299</span>
                </a>
            </div>
        </footer>
    )
}
