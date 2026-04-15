import { Link } from '@inertiajs/react';

export default function GameHeader({ backUrl, backText = 'Volver', title }) {
    return (
        <header className="px-4 md:px-10 py-4 md:py-6 flex items-center justify-between border-b border-white/5 relative z-10 bg-black/20 flex-shrink-0">
            <Link href={backUrl} className="flex items-center gap-2 group text-white/60 hover:text-white transition-colors">
                <span className="text-xl transition-transform group-hover:-translate-x-1">←</span>
                <span className="text-xs font-black uppercase tracking-widest">{backText}</span>
            </Link>
            {title && (
                <h2 className="hidden md:block text-xs font-black tracking-[0.5em] uppercase opacity-50 text-white">
                    {title}
                </h2>
            )}
            <div className="w-12 md:w-24 h-[1px] bg-white/10"></div>
        </header>
    );
}