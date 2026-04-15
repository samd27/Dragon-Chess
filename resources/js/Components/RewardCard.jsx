import React from 'react';

export default function RewardCard({ name, avatar, rewards, levelUp, accentClass }) {
    return (
        <div className="bg-gradient-to-br from-[#1a1b1e] to-[#0d0e12] border border-white/10 rounded-2xl p-5 flex flex-col gap-4 w-full">
            {/* Avatar + nombre */}
            <div className="flex items-center gap-3">
                <img
                    src={avatar}
                    alt={name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white/20 bg-white/5 shrink-0"
                />
                <span className={`font-black uppercase tracking-tighter text-base leading-tight ${accentClass}`}>{name}</span>
            </div>

            {/* Ki | EXP | Senzu */}
            <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/5 rounded-xl p-2.5 flex flex-col items-center border border-white/10">
                    <span className={`text-xl font-black tabular-nums ${(rewards?.ki ?? 0) >= 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {(rewards?.ki ?? 0) >= 0 ? '+' : ''}{rewards?.ki ?? 0}
                    </span>
                    <span className="text-[9px] font-black uppercase text-white/40 tracking-widest mt-0.5">Ki</span>
                </div>
                <div className="bg-white/5 rounded-xl p-2.5 flex flex-col items-center border border-white/10">
                    <span className="text-xl font-black text-orange-400 tabular-nums">+{rewards?.exp ?? 0}</span>
                    <span className="text-[9px] font-black uppercase text-white/40 tracking-widest mt-0.5">EXP</span>
                </div>
                <div className="bg-white/5 rounded-xl p-2.5 flex flex-col items-center border border-white/10">
                    <span className="text-xl font-black text-green-400 tabular-nums">+{rewards?.senzu ?? 0}</span>
                    <span className="text-[9px] font-black uppercase text-white/40 tracking-widest mt-0.5">Senzu</span>
                </div>
            </div>

            {/* Level Up Banner */}
            {levelUp?.leveled_up && (
                <div className="bg-yellow-400/10 border border-yellow-400/40 rounded-xl p-3 text-center">
                    <p className="text-yellow-400 font-black text-base uppercase tracking-tighter">
                        ¡Nivel {levelUp.new_level}!
                    </p>
                    <p className="text-white/50 text-[10px] mt-0.5">
                        {levelUp.old_level} → {levelUp.new_level}
                    </p>
                </div>
            )}

            {/* Barra de progreso */}
            {levelUp && (
                <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-white/40">
                        <span>Nv. {levelUp.new_level}</span>
                        <span>{levelUp.level_progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-orange-400 rounded-full transition-all duration-700"
                            style={{ width: `${levelUp.level_progress}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}