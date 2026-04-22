export default function PageHero({ icon: Icon, title, subtitle, rightSlot, tone = 'orange' }) {
    const tones = {
        orange: 'from-orange-900/40 via-amber-900/20 to-orange-900/30 border-orange-500/20',
        blue: 'from-blue-900/35 via-sky-900/20 to-blue-900/30 border-blue-500/20',
        emerald: 'from-emerald-900/35 via-green-900/20 to-emerald-900/30 border-emerald-500/20',
    };

    const toneClass = tones[tone] || tones.orange;

    return (
        <section className={`relative overflow-hidden rounded-2xl border bg-gradient-to-r ${toneClass} p-5 md:p-6`}>
            <div className="absolute inset-y-0 right-0 w-40 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_70%)] pointer-events-none" />
            <div className="relative flex items-center gap-4">
                {Icon ? (
                    <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                ) : null}
                <div className="min-w-0">
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">{title}</h1>
                    {subtitle ? <p className="text-sm md:text-base text-white/65 mt-1">{subtitle}</p> : null}
                </div>
                {rightSlot ? <div className="ml-auto">{rightSlot}</div> : null}
            </div>
        </section>
    );
}