import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { UsersIcon, CpuChipIcon } from '@heroicons/react/24/solid';

export default function GameMode({ auth }) {
    const [selectedMode, setSelectedMode] = useState('PVP');

    return (
        <>
            <Head title="Seleccionar Modo de Juego" />
            <div className="flex flex-col h-screen relative overflow-hidden bg-gradient-to-br from-[#0d0e12] via-[#1a1b1e] to-[#0d0e12]">
                {/* Decorative Aura */}
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
                <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-secondary/5 blur-[120px] rounded-full pointer-events-none"></div>

                <header className="px-4 md:px-10 py-4 md:py-6 flex items-center justify-between border-b border-white/5 relative z-10 bg-black/20">
                    <Link href={route('welcome')} className="flex items-center gap-2 group text-white/60 hover:text-white transition-colors">
                        <span className="text-xl transition-transform group-hover:-translate-x-1">←</span>
                        <span className="text-xs font-black uppercase tracking-widest">Volver al Inicio</span>
                    </Link>
                    <h2 className="hidden md:block text-xs font-black tracking-[0.5em] uppercase opacity-50 text-white">MODO DE JUEGO</h2>
                    <div className="w-12 md:w-24 h-[1px] bg-white/10"></div>
                </header>

                <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-10 py-8 relative z-10">
                    <div className="max-w-4xl w-full space-y-8">
                        <div className="text-center space-y-4">
                            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-tight text-white">
                                Elige el<br/>
                                <span className="text-primary">Modo de Batalla</span>
                            </h1>
                            <p className="text-white/40 text-sm md:text-base font-medium max-w-xl mx-auto leading-relaxed">
                                Selecciona cómo quieres enfrentarte en el tablero de combate
                            </p>
                        </div>

                        {/* Game Mode Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            {/* Player vs Player */}
                            <div 
                                onClick={() => setSelectedMode('PVP')}
                                className={`relative group rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 border-4 p-8 md:p-12 ${
                                    selectedMode === 'PVP' 
                                        ? 'border-primary ring-8 ring-primary/10 scale-100 bg-primary/10' 
                                        : 'border-white/5 opacity-60 hover:opacity-80 scale-[0.98] bg-white/5'
                                }`}
                            >
                                <div className="relative z-10 space-y-6">
                                    <UsersIcon className="w-16 h-16 md:w-20 md:h-20 text-white" />
                                    <div>
                                        <h3 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase leading-none text-white mb-3">
                                            Jugador vs<br/>Jugador
                                        </h3>
                                        <p className="text-white/60 text-sm md:text-base font-medium leading-relaxed">
                                            Enfréntate a otro guerrero en el mismo dispositivo. Turnos alternados, batalla estratégica.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-primary text-xs md:text-sm font-black uppercase tracking-widest">
                                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                        Modo Local
                                    </div>
                                </div>
                                {selectedMode === 'PVP' && (
                                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                        <span className="text-white text-xl">✓</span>
                                    </div>
                                )}
                            </div>

                            {/* Player vs CPU */}
                            <div 
                                onClick={() => setSelectedMode('PVC')}
                                className={`relative group rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 border-4 p-8 md:p-12 ${
                                    selectedMode === 'PVC' 
                                        ? 'border-purple-500 ring-8 ring-purple-500/10 scale-100 bg-purple-500/10' 
                                        : 'border-white/5 opacity-60 hover:opacity-80 scale-[0.98] bg-white/5'
                                }`}
                            >
                                <div className="relative z-10 space-y-6">
                                    <CpuChipIcon className="w-16 h-16 md:w-20 md:h-20 text-white" />
                                    <div>
                                        <h3 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase leading-none text-white mb-3">
                                            Jugador vs<br/>CPU
                                        </h3>
                                        <p className="text-white/60 text-sm md:text-base font-medium leading-relaxed">
                                            Desafía a una inteligencia artificial. Perfecto para entrenar tus habilidades.
                                        </p>
                                    </div>
                                    <div className={`flex items-center gap-2 text-xs md:text-sm font-black uppercase tracking-widest ${
                                        selectedMode === 'PVC' ? 'text-purple-400' : 'text-white/40'
                                    }`}>
                                        <span className={`w-2 h-2 rounded-full ${selectedMode === 'PVC' ? 'bg-purple-400 animate-pulse' : 'bg-white/40'}`}></span>
                                        IA Modular
                                    </div>
                                </div>
                                {selectedMode === 'PVC' && (
                                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                                        <span className="text-white text-xl">✓</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Continue Button */}
                        <Link 
                            href={selectedMode === 'PVP' ? route('player2.select') : route('faction.select', { mode: selectedMode })}
                            className="w-full group relative bg-primary h-16 md:h-20 rounded-2xl flex items-center justify-center gap-4 shadow-[0_15px_30px_rgba(249,122,31,0.3)] hover:shadow-[0_20px_40px_rgba(249,122,31,0.4)] transition-all hover:-translate-y-1 active:scale-95 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                            <span className="text-xl md:text-2xl font-black italic tracking-tighter uppercase relative z-10">Continuar</span>
                            <span className="text-2xl md:text-3xl font-black group-hover:translate-x-2 transition-transform relative z-10">→</span>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
