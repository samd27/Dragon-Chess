import { Link } from '@inertiajs/react';

const TONE_STYLES = {
    battle: {
        wrap: 'border-primary/40 bg-primary/10 hover:bg-primary/15 hover:border-primary/70 shadow-[0_12px_28px_rgba(249,122,31,0.25)]',
        icon: 'text-primary bg-primary/20',
        arrow: 'text-primary',
    },
    shop: {
        wrap: 'border-emerald-400/35 bg-emerald-500/10 hover:bg-emerald-500/15 hover:border-emerald-300/65 shadow-[0_12px_28px_rgba(52,211,153,0.2)]',
        icon: 'text-emerald-300 bg-emerald-500/20',
        arrow: 'text-emerald-300',
    },
    profile: {
        wrap: 'border-sky-400/35 bg-sky-500/10 hover:bg-sky-500/15 hover:border-sky-300/65 shadow-[0_12px_28px_rgba(56,189,248,0.2)]',
        icon: 'text-sky-300 bg-sky-500/20',
        arrow: 'text-sky-300',
    },
};

export default function HomeActionCard({ href, title, description, Icon, ArrowIcon, tone = 'battle' }) {
    const style = TONE_STYLES[tone] || TONE_STYLES.battle;

    return (
        <Link
            href={href}
            className={`group rounded-2xl border p-4 transition-all duration-300 ${style.wrap}`}
        >
            <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${style.icon}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black uppercase tracking-wider text-white">
                        {title}
                    </h3>
                    <p className="text-xs text-white/60 mt-1 leading-relaxed">
                        {description}
                    </p>
                </div>
                {ArrowIcon ? <ArrowIcon className={`w-5 h-5 mt-0.5 ${style.arrow} transition-transform group-hover:translate-x-1`} /> : null}
            </div>
        </Link>
    );
}