import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function FactionSelector({ auth }) {
    const [selected, setSelected] = useState('Z_WARRIORS');

    return (
        <>
            <Head title="Elige Tu Bando" />
            <div className="flex flex-col h-screen relative overflow-hidden bg-gradient-to-br from-[#0d0e12] via-[#1a1b1e] to-[#0d0e12]">
                <header className="px-10 py-6 flex items-center justify-between border-b border-white/5 relative z-10 bg-black/20">
                    <Link href={route('welcome')} className="flex items-center gap-2 group text-white/60 hover:text-white transition-colors">
                        <span className="text-xl transition-transform group-hover:-translate-x-1">←</span>
                        <span className="text-xs font-black uppercase tracking-widest">Abortar Misión</span>
                    </Link>
                    <h2 className="text-xs font-black tracking-[0.5em] uppercase opacity-50 text-white">SELECTOR DE BANDO</h2>
                    <div className="w-24 h-[1px] bg-white/10"></div>
                </header>

                <div className="flex-1 flex gap-10 p-10 items-stretch">
                    {/* Left: Selection Column */}
                    <div className="w-1/3 flex flex-col justify-center gap-8">
                        <div className="space-y-2">
                            <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-tight text-white">Elige Tu<br/><span className="text-primary">Bando</span></h1>
                            <p className="text-white/40 text-sm font-medium max-w-xs leading-relaxed">Tu facción determina tus ventajas de batalla y los guerreros que comandarás en la arena.</p>
                        </div>

                        <div className="space-y-4">
                            <div 
                                onClick={() => setSelected('Z_WARRIORS')}
                                className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-3 cursor-pointer hover:scale-[1.02] active:scale-95 ${selected === 'Z_WARRIORS' ? 'bg-primary/10 border-primary shadow-neon-orange' : 'bg-white/5 border-white/10 opacity-60 hover:opacity-80'}`}
                            >
                                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                                    <span className="text-primary text-2xl">🛡️</span>
                                </div>
                                <h4 className="text-base font-black uppercase tracking-widest text-white text-center">Resistencia Terricola</h4>
                            </div>

                            <div 
                                onClick={() => setSelected('CONQUERORS')}
                                className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-3 cursor-pointer hover:scale-[1.02] active:scale-95 ${selected === 'CONQUERORS' ? 'bg-purple-500/10 border-purple-500 shadow-neon-purple' : 'bg-white/5 border-white/10 opacity-60 hover:opacity-80'}`}
                            >
                                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                    <span className="text-purple-500 text-2xl">💀</span>
                                </div>
                                <h4 className="text-base font-black uppercase tracking-widest text-white text-center">Dominación Galáctica</h4>
                            </div>
                        </div>

                        <Link 
                            href={route('game.arena', { faction: selected })}
                            className="w-full bg-primary h-16 rounded-2xl shadow-neon-orange font-black italic uppercase tracking-tighter text-2xl flex items-center justify-center gap-4 hover:bg-orange-500 transition-all active:scale-95 group"
                        >
                            Confirmar Plan de Batalla
                            <span className="font-black group-hover:translate-x-2 transition-transform text-2xl">⚡</span>
                        </Link>
                    </div>

                    {/* Right: Large Vertical Selection Panels */}
                    <div className="flex-1 grid grid-cols-2 gap-6 items-stretch">
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
                            <div className="absolute bottom-10 left-10 right-10">
                                <h3 className="text-5xl font-black italic tracking-tighter uppercase leading-none drop-shadow-xl text-white">GUERREROS Z</h3>
                                <p className="text-sm font-bold text-primary tracking-[0.4em] uppercase mt-2">Guardianes de la Tierra</p>
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
                            <div className="absolute bottom-10 left-10 right-10">
                                <h3 className="text-5xl font-black italic tracking-tighter uppercase leading-none drop-shadow-xl text-white">VILLANOS</h3>
                                <p className="text-sm font-bold text-purple-400 tracking-[0.4em] uppercase mt-2">Destructores de Mundos</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
