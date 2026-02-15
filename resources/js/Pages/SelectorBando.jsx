import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { ShieldCheckIcon, FireIcon, BoltIcon } from '@heroicons/react/24/solid';

export default function FactionSelector({ auth, mode = 'PVP', player2Type = 'guest', player2 = null }) {
    const [selected, setSelected] = useState('Z_WARRIORS');

    return (
        <>
            <Head title="Elige Tu Bando" />
            <div className="flex flex-col h-screen relative overflow-hidden bg-gradient-to-br from-[#0d0e12] via-[#1a1b1e] to-[#0d0e12]">
                <header className="px-4 md:px-10 py-4 md:py-6 flex items-center justify-between border-b border-white/5 relative z-10 bg-black/20">
                    <Link 
                        href={mode === 'PVP' ? route('player2.select') : route('game.mode')} 
                        className="flex items-center gap-2 group text-white/60 hover:text-white transition-colors"
                    >
                        <span className="text-xl transition-transform group-hover:-translate-x-1">←</span>
                        <span className="text-xs font-black uppercase tracking-widest">{mode === 'PVP' ? 'Cambiar Jugador 2' : 'Cambiar Modo'}</span>
                    </Link>
                    <h2 className="hidden md:block text-xs font-black tracking-[0.5em] uppercase opacity-50 text-white">SELECTOR DE BANDO</h2>
                    <div className="w-12 md:w-24 h-[1px] bg-white/10"></div>
                </header>

                <div className="flex-1 flex flex-col md:flex-row gap-6 md:gap-10 p-4 md:p-10 items-stretch overflow-y-auto">
                    {/* Left: Selection Column */}
                    <div className="w-full md:w-1/3 flex flex-col justify-center gap-4 md:gap-8">
                        <div className="space-y-2">
                            <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-tight text-white">Elige Tu<br/><span className="text-primary">Bando</span></h1>
                            <p className="text-white/40 text-xs md:text-sm font-medium max-w-xs leading-relaxed">Tu facción determina tus ventajas de batalla y los guerreros que comandarás en la arena.</p>
                        </div>

                        <div className="space-y-3 md:space-y-4">
                            <div 
                                onClick={() => setSelected('Z_WARRIORS')}
                                className={`p-4 md:p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-2 md:gap-3 cursor-pointer hover:scale-[1.02] active:scale-95 ${selected === 'Z_WARRIORS' ? 'bg-primary/10 border-primary shadow-neon-orange' : 'bg-white/5 border-white/10 opacity-60 hover:opacity-80'}`}
                            >
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                                    <ShieldCheckIcon className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                                </div>
                                <h4 className="text-sm md:text-base font-black uppercase tracking-widest text-white text-center">Resistencia Terricola</h4>
                            </div>

                            <div 
                                onClick={() => setSelected('CONQUERORS')}
                                className={`p-4 md:p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-2 md:gap-3 cursor-pointer hover:scale-[1.02] active:scale-95 ${selected === 'CONQUERORS' ? 'bg-purple-500/10 border-purple-500 shadow-neon-purple' : 'bg-white/5 border-white/10 opacity-60 hover:opacity-80'}`}
                            >
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                    <FireIcon className="w-6 h-6 md:w-7 md:h-7 text-purple-500" />
                                </div>
                                <h4 className="text-sm md:text-base font-black uppercase tracking-widest text-white text-center">Dominación Galáctica</h4>
                            </div>
                        </div>

                        {mode === 'PVP' && player2Type === 'authenticated' && player2 && (
                            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3 md:p-4">
                                <p className="text-[10px] md:text-xs text-white/60 uppercase tracking-widest mb-2">Jugador 2</p>
                                <div className="flex items-center gap-2 md:gap-3">
                                    <img src={player2.avatar} alt="Player 2" className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-purple-500" />
                                    <span className="text-sm md:text-base font-bold text-white">{player2.name}</span>
                                </div>
                            </div>
                        )}
                        
                        <Link 
                            href={route('game.arena', { faction: selected, mode: mode })}
                            className="w-full bg-primary h-14 md:h-16 rounded-2xl shadow-neon-orange font-black italic uppercase tracking-tighter text-lg md:text-2xl flex items-center justify-center gap-3 md:gap-4 hover:bg-orange-500 transition-all active:scale-95 group"
                        >
                            <span className="hidden md:inline">Confirmar Plan de Batalla</span>
                            <span className="md:hidden">Confirmar</span>
                            <BoltIcon className="w-6 h-6 md:w-7 md:h-7 group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>

                    {/* Right: Large Vertical Selection Panels */}
                    <div className="flex-1 grid grid-cols-2 gap-3 md:gap-6 items-stretch min-h-[300px] md:min-h-0">
                        {/* Z-Warriors Large Panel */}
                        <div 
                            onClick={() => setSelected('Z_WARRIORS')}
                            className={`relative group rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 border-4 ${selected === 'Z_WARRIORS' ? 'border-primary ring-8 ring-primary/10 scale-100' : 'border-white/5 opacity-40 grayscale hover:opacity-80 scale-[0.98]'}`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-700"></div>
                            <img 
                                src="https://dragonball-api.com/characters/goku_normal.webp" 
                                alt="Z-Warriors" 
                                className="absolute inset-0 w-full h-full object-contain object-bottom transition-transform duration-1000 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                            <div className="absolute bottom-4 md:bottom-10 left-4 md:left-10 right-4 md:right-10">
                                <h3 className="text-2xl md:text-5xl font-black italic tracking-tighter uppercase leading-none drop-shadow-xl text-white">GUERREROS Z</h3>
                                <p className="text-[10px] md:text-sm font-bold text-primary tracking-[0.3em] md:tracking-[0.4em] uppercase mt-1 md:mt-2">Guardianes de la Tierra</p>
                            </div>
                        </div>

                        {/* Conquerors Large Panel */}
                        <div 
                            onClick={() => setSelected('CONQUERORS')}
                            className={`relative group rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 border-4 ${selected === 'CONQUERORS' ? 'border-purple-500 ring-8 ring-purple-500/10 scale-100' : 'border-white/5 opacity-40 grayscale hover:opacity-80 scale-[0.98]'}`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-900"></div>
                            <img 
                                src="https://dragonball-api.com/characters/Freezer.webp" 
                                alt="Conquerors" 
                                className="absolute inset-0 w-full h-full object-contain object-bottom transition-transform duration-1000 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                            <div className="absolute bottom-4 md:bottom-10 left-4 md:left-10 right-4 md:right-10">
                                <h3 className="text-2xl md:text-5xl font-black italic tracking-tighter uppercase leading-none drop-shadow-xl text-white">VILLANOS</h3>
                                <p className="text-[10px] md:text-sm font-bold text-purple-400 tracking-[0.3em] md:tracking-[0.4em] uppercase mt-1 md:mt-2">Destructores de Mundos</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
