import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { TrophyIcon, LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import AppNavBar from '@/Components/AppNavBar';
import {
    BATTLE_PASS_REWARDS,
    DEFAULT_UNLOCKED_IDS,
    charPath,
    CHARACTERS_BY_ID,
} from '@/data/characters';

function calcLevel(exp = 0) {
    return Math.floor(Math.sqrt(exp / 80)) + 1;
}
function calcLevelProgress(exp = 0) {
    const level   = calcLevel(exp);
    const prevExp = Math.pow(level - 1, 2) * 80;
    const nextExp = Math.pow(level, 2) * 80;
    const span    = nextExp - prevExp;
    return span <= 0 ? 100 : Math.min(100, Math.round(((exp - prevExp) / span) * 100));
}

export default function BattlePass({ auth, stats, unlock_all = false }) {
    const [hoveredLevel, setHoveredLevel] = useState(null);
    const experience   = stats?.experience ?? 0;
    const currentLevel = stats?.level ?? calcLevel(experience);
    const progress     = stats?.level_progress ?? calcLevelProgress(experience);
    const unlockedIds  = stats?.unlocked_characters ?? [];

    function isCharUnlocked(charId) {
        if (unlock_all) return true;
        if (DEFAULT_UNLOCKED_IDS.includes(charId)) return true;
        return unlockedIds.includes(charId);
    }
    function isBpLevelReached(level) {
        if (unlock_all) return true;
        return currentLevel >= level;
    }

    const levels = Array.from({ length: 50 }, (_, i) => {
        const level   = i + 1;
        const reward  = BATTLE_PASS_REWARDS[level] ?? null;
        const reached = isBpLevelReached(level);
        const char    = reward ? CHARACTERS_BY_ID[reward.id] : null;
        return { level, reward, reached, char };
    });

    const nextReward = levels.find(l => l.reward && !l.reached);

    return (
        <>
            <Head title="Pase de Batalla - Dragon Chess" />
            <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0d0e12] via-[#1a1b1e] to-[#0d0e12] relative overflow-hidden">
                <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-yellow-500/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
                <AppNavBar auth={auth} stats={stats} />
                <main className="flex-1 px-4 md:px-10 py-8 relative z-10">
                    <div className="max-w-5xl mx-auto mb-8">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <p className="text-primary text-xs font-black uppercase tracking-[0.4em] mb-2">Progresion</p>
                                <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
                                    Pase de <span className="text-yellow-500">Batalla</span>
                                </h1>
                                <p className="text-white/40 text-sm mt-2">Sube de nivel para desbloquear personajes</p>
                            </div>
                            <div className="bg-black/40 border border-white/10 rounded-2xl p-4 min-w-[220px]">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-primary font-black uppercase text-xs tracking-widest">Nivel {currentLevel}</span>
                                    <span className="text-white/40 text-xs tabular-nums">{progress}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-2">
                                    <div className="h-full bg-gradient-to-r from-primary to-yellow-400 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
                                </div>
                                <p className="text-white/30 text-[10px] tabular-nums">{(stats?.experience ?? 0).toLocaleString()} EXP acumulados</p>
                            </div>
                        </div>
                        {nextReward && (
                            <div className="mt-6 flex items-center gap-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4">
                                <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-yellow-500/50 flex-shrink-0">
                                    <img src={charPath(nextReward.reward.id)} alt={nextReward.reward.name} className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-yellow-500/70 uppercase tracking-widest font-black mb-0.5">Proxima recompensa — Nivel {nextReward.level}</p>
                                    <p className="text-white font-black text-base">{nextReward.reward.name}</p>
                                    <p className="text-white/40 text-xs">{nextReward.level - currentLevel} nivel{nextReward.level - currentLevel !== 1 ? 'es' : ''} restante{nextReward.level - currentLevel !== 1 ? 's' : ''}</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="max-w-5xl mx-auto grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                        {levels.map(({ level, reward, reached, char }) => {
                            const isHovered = hoveredLevel === level;
                            const isCurrent = level === currentLevel;
                            return (
                                <div
                                    key={level}
                                    onMouseEnter={() => reward && setHoveredLevel(level)}
                                    onMouseLeave={() => setHoveredLevel(null)}
                                    className={`relative flex flex-col items-center rounded-xl transition-all duration-200 cursor-default p-1.5
                                        ${reward ? (reached ? 'bg-yellow-500/15 border-2 border-yellow-500/50 hover:border-yellow-500 hover:scale-105' : 'bg-white/5 border-2 border-white/10 hover:border-white/20') : (reached ? 'bg-white/10 border border-primary/20' : 'bg-white/3 border border-white/5')}
                                        ${isCurrent ? 'ring-2 ring-primary ring-offset-1 ring-offset-[#0d0e12]' : ''}`}
                                >
                                    <span className={`text-[9px] font-black tabular-nums mb-1 ${isCurrent ? 'text-primary' : reached ? 'text-white/70' : 'text-white/20'}`}>{level}</span>
                                    {reward ? (
                                        <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                                            <img src={charPath(reward.id)} alt={reward.name} className={`w-full h-full object-contain transition-all ${reached ? 'opacity-100' : 'opacity-25 grayscale'}`} />
                                            {!reached && <div className="absolute inset-0 flex items-center justify-center bg-black/40"><LockClosedIcon className="w-3 h-3 text-white/50" /></div>}
                                            {reached && <div className="absolute bottom-0 right-0 p-0.5"><CheckCircleIcon className="w-3 h-3 text-yellow-400" /></div>}
                                        </div>
                                    ) : (
                                        <div className={`w-full aspect-square rounded-lg flex items-center justify-center ${reached ? 'bg-primary/20' : 'bg-white/5'}`}>
                                            {reached ? <CheckCircleIcon className="w-3 h-3 text-primary/60" /> : <div className="w-1.5 h-1.5 rounded-full bg-white/10" />}
                                        </div>
                                    )}
                                    {isHovered && reward && (
                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-20 bg-black/95 border border-yellow-500/30 rounded-lg px-3 py-2 w-32 pointer-events-none shadow-2xl">
                                            <p className="text-yellow-400 font-black text-[10px] uppercase tracking-widest mb-1">Lv. {level}</p>
                                            <p className="text-white text-xs font-bold leading-tight">{reward.name}</p>
                                            <p className="text-white/40 text-[9px] mt-1">{reached ? 'Desbloqueado' : `Necesitas Lv.${level}`}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div className="max-w-5xl mx-auto mt-8 flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-yellow-500/15 border-2 border-yellow-500/50" /><span className="text-white/40 text-xs">Personaje desbloqueado</span></div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-white/5 border-2 border-white/10 flex items-center justify-center"><LockClosedIcon className="w-2 h-2 text-white/30" /></div><span className="text-white/40 text-xs">Personaje bloqueado</span></div>
                        <div className="flex items-center gap-2"><TrophyIcon className="w-4 h-4 text-yellow-500" /><span className="text-white/40 text-xs">{Object.keys(BATTLE_PASS_REWARDS).length} personajes en el Pase</span></div>
                    </div>
                </main>
            </div>
        </>
    );
}
