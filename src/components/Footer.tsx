import { MessageCircle } from 'lucide-react'

export default function Footer() {


    return (
        <footer className="py-8 text-center text-sm mt-auto"
            style={{
                color: 'var(--color-text-muted)',
                borderTop: '1px solid rgba(201,162,39,0.1)',
                background: 'linear-gradient(to top, rgba(10,14,20,0.8), transparent)'
            }}>
            <div className="flex flex-col items-center gap-4">
                <p>
                    Developed by <a href="http://drmohamedshehata.online/" target="_blank" rel="noopener noreferrer" className="font-bold" style={{ color: '#c9a227', textDecoration: 'none' }}>Dr. Mohamed Shehata</a>
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                    <a
                        href="https://wa.me/201015217299"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 hover:bg-[rgba(201,162,39,0.1)]"
                        style={{ color: 'var(--color-text-muted)' }}
                        dir="ltr"
                    >
                        <MessageCircle size={16} style={{ color: '#25D366' }} />
                        <span>contact the developer</span>
                    </a>

                </div>
            </div>
        </footer>
    )
}
