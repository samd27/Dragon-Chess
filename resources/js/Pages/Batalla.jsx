import { Head, Link } from '@inertiajs/react';

export default function GameArena({ auth, faction }) {
    const player = {
        name: auth.user?.name || 'Kakarot_99',
        avatar: 'https://i.pravatar.cc/150?u=player',
    };

    const opponent = {
        name: 'EMP-01',
        avatar: 'https://i.pravatar.cc/150?u=opponent',
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
                    <Link href={route('faction.select')} className="flex items-center gap-2 group text-white/60 hover:text-white transition-colors">
                        <span className="text-xl transition-transform group-hover:-translate-x-1">←</span>
                        <span className="text-xs font-black uppercase tracking-widest">Cambiar Facción</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs font-black tracking-[0.4em] uppercase text-white/40">Batalla en Progreso</span>
                    </div>
                </header>

                {/* Main Game Area */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left: Opponent Zone */}
                    <aside className="w-80 border-r border-white/5 bg-black/40 p-10 flex flex-col justify-between">
                    <div className="flex flex-col items-center gap-6">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-3xl border-4 border-secondary overflow-hidden bg-black p-1 shadow-neon-blue rotate-3">
                                <img src={opponent.avatar} alt="Opponent" className="w-full h-full object-cover rounded-2xl" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-secondary text-xs font-black px-4 py-1 rounded shadow-lg">EMP-01</div>
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none mb-2 text-white">{opponent.name}</h3>
                            <p className="text-[10px] font-bold text-secondary tracking-[0.4em] uppercase opacity-70">Oponente Universal</p>
                        </div>
                        
                        <div className="w-full space-y-4 pt-6">
                            <div className="flex flex-col items-center">
                                <span className="text-5xl font-mono font-black text-secondary leading-none">{formatTime(600)}</span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/30 mt-2">Umbral de Energía</span>
                            </div>
                            <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-white/10">
                                <div className="h-full bg-secondary shadow-neon-blue transition-all duration-1000" style={{ width: '100%' }}></div>
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
                    
                    <div className="relative z-10 mb-8">
                        <div className="px-10 py-2 rounded-2xl border-2 bg-primary/20 border-primary shadow-neon-orange flex items-center gap-4 transition-all duration-300 backdrop-blur-md">
                            <div className="w-3 h-3 rounded-full bg-primary shadow-neon-orange animate-pulse"></div>
                            <span className="text-sm font-black tracking-[0.4em] uppercase text-primary">
                                Iniciar Ataque
                            </span>
                        </div>
                    </div>

                    <div className="relative w-full max-w-[500px] aspect-square bg-[#1a1b1e] border-[8px] border-[#2d2e32] rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)] grid grid-cols-8 grid-rows-8 group">
                        {/* Holographic Overlays */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                        
                        {Array.from({ length: 64 }).map((_, i) => renderSquare(Math.floor(i / 8), i % 8))}

                        {/* Scouter Lines */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/5 pointer-events-none"></div>
                        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/5 pointer-events-none"></div>
                    </div>

                    <div className="mt-8 flex items-center gap-10 opacity-40">
                        <div className="flex -space-x-3">
                            {Array.from({length: 8}).map((_, i) => (
                                <div key={i} className="w-8 h-8 rounded-full border border-primary/20 bg-gray-900 flex items-center justify-center">
                                    <span className="text-[10px]">⚔️</span>
                                </div>
                            ))}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40 italic">Battle Field Alpha</span>
                        <div className="flex -space-x-3">
                            {Array.from({length: 8}).map((_, i) => (
                                <div key={i} className="w-8 h-8 rounded-full border border-secondary/20 bg-gray-900 flex items-center justify-center">
                                    <span className="text-[10px]">💀</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>

                {/* Right: Player Zone */}
                <aside className="w-80 border-l border-white/5 bg-black/40 p-10 flex flex-col justify-between">
                    <div className="flex flex-col items-center gap-6">
                        <div className="relative">
                            <div className="w-36 h-36 rounded-3xl border-4 border-primary overflow-hidden bg-black p-1 shadow-neon-orange transition-all duration-500 scale-110 -rotate-2">
                                <img src={player.avatar} alt="You" className="w-full h-full object-cover rounded-2xl" />
                            </div>
                            <div className="absolute -bottom-2 -left-2 bg-primary text-xs font-black px-4 py-1 rounded shadow-lg uppercase">Saiyan</div>
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none mb-2 text-white">{player.name}</h3>
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-[10px] font-bold text-primary tracking-[0.4em] uppercase">SYNC-READY</span>
                            </div>
                        </div>
                        
                        <div className="w-full space-y-4 pt-6">
                            <div className="flex flex-col items-center">
                                <span className="text-6xl font-mono font-black text-primary leading-none drop-shadow-[0_0_20px_rgba(249,122,31,0.5)]">
                                    {formatTime(600)}
                                </span>
                            </div>
                            <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden border border-white/10 relative p-[2px]">
                                <div className="h-full bg-gradient-to-r from-orange-600 via-primary to-yellow-300 transition-all duration-700 rounded-full shadow-[0_0_20px_rgba(249,122,31,0.8)]" style={{ width: '85%' }}></div>
                            </div>
                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-primary/60">
                                <span>Ki Charge</span>
                                <span>85%</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Link 
                            href={route('welcome')} 
                            className="py-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center gap-1 hover:bg-red-900/20 hover:border-red-500/30 transition-all group"
                        >
                            <span className="text-white/40 group-hover:text-red-500 text-2xl">🏳️</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-red-500">Retreat</span>
                        </Link>
                        <button className="py-4 bg-primary rounded-2xl shadow-neon-orange flex flex-col items-center gap-1 hover:bg-orange-500 transition-all active:scale-95 group">
                            <span className="font-black text-2xl">⚡</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Charge</span>
                        </button>
                    </div>
                </aside>
                </div>
            </div>
        </>
    );
}
