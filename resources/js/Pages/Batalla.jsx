import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function GameArena({ auth, faction }) {
    const [showConfirmAbort, setShowConfirmAbort] = useState(false);
    
    const player = {
        name: auth.user?.name || 'Kakarot_99',
        avatar: auth.user?.avatar || '/images/characters/Goku.png',
    };

    const handleAbortMission = () => {
        setShowConfirmAbort(false);
        router.visit(route('faction.select'));
    };

    const opponent = {
        name: 'EMP-01',
        avatar: faction === 'Z_WARRIORS' ? '/images/characters/Freezer.png' : '/images/characters/Goku.png',
    };

    // Mock chess board (8x8)
    const renderSquare = (row, col) => {
        const isDark = (row + col) % 2 === 1;
        return (
            <div 
                key={`${row}-${col}`}
                className={`relative w-full aspect-square flex items-center justify-center cursor-pointer transition-all duration-200
                    ${isDark ? 'bg-board-dark' : 'bg-board-light'}
                `}
            >
            </div>
        );
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <>
            <Head title="Dragon Chess - Battle Arena" />
            <div className="flex flex-col h-screen relative overflow-hidden bg-[#0d0e12]">
                {/* Top Header */}
                <header className="px-10 py-4 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-lg">
                    <button onClick={() => setShowConfirmAbort(true)} className="flex items-center gap-2 group text-white/60 hover:text-red-500 transition-colors">
                        <span className="text-xl transition-transform group-hover:-translate-x-1">←</span>
                        <span className="text-xs font-black uppercase tracking-widest">Abortar Misión</span>
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs font-black tracking-[0.4em] uppercase text-white/40">Batalla en Progreso</span>
                    </div>
                </header>

                {/* Main Game Area */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left: Player Zone */}
                    <aside className="w-80 border-r border-white/5 bg-black/40 p-10 flex flex-col justify-between">
                    <div className="flex flex-col items-center gap-6">
                        <div className="relative">
                            <div className={`w-36 h-36 rounded-3xl border-4 overflow-hidden bg-black p-1 transition-all duration-500 scale-110 -rotate-2 ${
                                faction === 'Z_WARRIORS' 
                                    ? 'border-primary shadow-neon-orange' 
                                    : 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                            }`}>
                                <img src={player.avatar} alt="You" className="w-full h-full object-cover rounded-2xl" />
                            </div>
                            <div className={`absolute -bottom-2 -left-2 text-xs font-black px-4 py-1 rounded shadow-lg uppercase ${
                                faction === 'Z_WARRIORS' ? 'bg-primary' : 'bg-purple-500'
                            }`}>
                                {faction === 'Z_WARRIORS' ? 'Guerrero Z' : 'Villano'}
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none mb-2 text-white">{player.name}</h3>
                        </div>
                        
                        <div className="w-full space-y-4 pt-6">
                            <div className="flex flex-col items-center">
                                <span className={`text-6xl font-mono font-black leading-none ${
                                    faction === 'Z_WARRIORS' 
                                        ? 'text-primary drop-shadow-[0_0_20px_rgba(249,122,31,0.5)]' 
                                        : 'text-purple-500 drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]'
                                }`}>
                                    {formatTime(600)}
                                </span>
                            </div>
                           
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-[9px] font-black uppercase text-white/30 tracking-widest border-b border-white/5 pb-2">Registro de Combate</h4>
                        <div className="space-y-2 opacity-50 text-[10px] font-medium italic text-white/60">
                            <p>Esperando primer movimiento...</p>
                        </div>
                    </div>
                </aside>

                {/* Middle: Tactical Map (Chess Board) */}
                <main className="flex-1 flex flex-col items-center justify-center p-8 relative">
                    <div className="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(circle_at_center,white_0%,transparent_70%)]"></div>
                    
                    <div className="relative w-full max-w-[500px] aspect-square bg-[#1a1b1e] border-[8px] border-[#2d2e32] rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)] grid grid-cols-8 grid-rows-8 group">
                        {/* Holographic Overlays */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                        
                        {Array.from({ length: 64 }).map((_, i) => renderSquare(Math.floor(i / 8), i % 8))}

                        {/* Scouter Lines */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/5 pointer-events-none"></div>
                        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/5 pointer-events-none"></div>
                    </div>
                </main>

                {/* Right: Opponent Zone */}
                <aside className="w-80 border-l border-white/5 bg-black/40 p-10 flex flex-col justify-between">
                    <div className="flex flex-col items-center gap-6">
                        <div className="relative">
                            <div className={`w-32 h-32 rounded-3xl border-4 overflow-hidden bg-black p-1 rotate-3 ${
                                faction === 'Z_WARRIORS' 
                                    ? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]' 
                                    : 'border-primary shadow-neon-orange'
                            }`}>
                                <img src={opponent.avatar} alt="Opponent" className="w-full h-full object-cover rounded-2xl" />
                            </div>
                            <div className={`absolute -bottom-2 -right-2 text-xs font-black px-4 py-1 rounded shadow-lg uppercase ${
                                faction === 'Z_WARRIORS' ? 'bg-purple-500' : 'bg-primary'
                            }`}>
                                {faction === 'Z_WARRIORS' ? 'Villano' : 'Guerrero Z'}
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none mb-2 text-white">{opponent.name}</h3>
                        </div>
                        
                        <div className="w-full space-y-4 pt-6">
                            <div className="flex flex-col items-center">
                                <span className={`text-5xl font-mono font-black leading-none ${
                                    faction === 'Z_WARRIORS' ? 'text-purple-500' : 'text-primary'
                                }`}>
                                    {formatTime(600)}
                                </span>
                            </div>
                           
                        </div>
                    </div>
                </aside>
                </div>

                {/* Confirmation Modal */}
                {showConfirmAbort && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-gradient-to-br from-[#1a1b1e] to-[#0d0e12] border-2 border-red-500/30 rounded-3xl p-8 max-w-md mx-4 shadow-[0_0_50px_rgba(239,68,68,0.3)]">
                            <div className="text-center space-y-6">
                                <div className="text-6xl">⚠️</div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Confirmar Aborto</h3>
                                <p className="text-white/60 text-sm">¿Estás seguro de que quieres abandonar la batalla? Perderás todo el progreso actual.</p>
                                <div className="flex gap-4 pt-4">
                                    <button 
                                        onClick={() => setShowConfirmAbort(false)}
                                        className="flex-1 py-3 bg-white/5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all font-black uppercase text-sm tracking-widest"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        onClick={handleAbortMission}
                                        className="flex-1 py-3 bg-red-500 rounded-xl text-white hover:bg-red-600 transition-all font-black uppercase text-sm tracking-widest shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                                    >
                                        Abortar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
