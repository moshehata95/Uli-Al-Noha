import { MessageCircle, Download } from 'lucide-react'
import { usePWAInstall } from '../hooks/usePWAInstall'

export default function Footer() {
    const { isInstallable, installApp } = usePWAInstall()

    return (
        <footer className="py-8 text-center text-sm mt-auto"
            style={{
                color: 'var(--color-text-muted)',
                borderTop: '1px solid rgba(201,162,39,0.1)',
                background: 'linear-gradient(to top, rgba(10,14,20,0.8), transparent)'
            }}>
            <div className="flex flex-col items-center gap-4">
                <p>
                    Developed by <span className="font-bold" style={{ color: '#c9a227' }}>Dr. Mohamed Shehata</span>
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
                        <span className="font-mono">+20 101 521 7299</span>
                    </a>

                    {isInstallable && (
                        <button
                            onClick={installApp}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
                            style={{
                                background: 'linear-gradient(135deg, #c9a227, #8b6914)',
                                color: '#0a0e14',
                                fontWeight: 'bold',
                                boxShadow: '0 4px 15px rgba(201, 162, 39, 0.3)'
                            }}
                        >
                            <Download size={16} />
                            <span>تثبيت التطبيق</span>
                        </button>
                    )}
                </div>
            </div>
        </footer>
    )
}
