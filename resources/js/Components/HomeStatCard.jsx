export default function HomeStatCard({ label, value, tone = 'primary', Icon }) {
    const tones = {
        primary: {
            value: 'text-primary',
            icon: 'text-primary',
        },
        yellow: {
            value: 'text-yellow-400',
            icon: 'text-yellow-400',
        },
        orange: {
            value: 'text-orange-400',
            icon: 'text-orange-400',
        },
        green: {
            value: 'text-green-400',
            icon: 'text-green-400',
        },
    };

    const current = tones[tone] || tones.primary;

    return (
        <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col items-center">
            <div className="flex items-center gap-1">
                {Icon ? <Icon className={`w-5 h-5 ${current.icon}`} /> : null}
                <span className={`text-3xl font-black italic leading-none ${current.value}`}>
                    {value}
                </span>
            </div>
            <span className="text-[10px] font-black uppercase text-white/40 tracking-widest mt-2">
                {label}
            </span>
        </div>
    );
}