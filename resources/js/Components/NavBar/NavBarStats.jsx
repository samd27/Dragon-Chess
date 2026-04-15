import { BoltIcon, SparklesIcon } from '@heroicons/react/24/solid';

export default function NavBarStats({ senzuSeeds, experience, ki, level, progress }) {
    return (
        <>
            {/* Senzu Seeds — desktop */}
            <div className="hidden md:flex items-center gap-1.5 bg-black/30 border border-white/10 rounded-full px-3 py-1.5">
                <SparklesIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-white text-xs font-black tabular-nums">{senzuSeeds.toLocaleString()}</span>
            </div>

            {/* EXP / Nivel — desktop */}
            <div className="hidden md:flex flex-col gap-0.5 min-w-[90px]">
                <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                        Nv {level}
                    </span>
                    <span className="text-[9px] text-white/40 font-bold tabular-nums">{progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-orange-400 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex items-center gap-1">
                    <BoltIcon className="w-3 h-3 text-yellow-400" />
                    <span className="text-[9px] text-white/40 tabular-nums">{ki.toLocaleString()} Ki</span>
                </div>
            </div>
        </>
    );
}