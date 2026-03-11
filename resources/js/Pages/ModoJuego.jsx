import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { UsersIcon, CpuChipIcon, AcademicCapIcon, BoltIcon, FireIcon } from '@heroicons/react/24/solid';

export default function GameMode() {
    const [selectedMode, setSelectedMode] = useState('PVP');
    const [selectedVariant, setSelectedVariant] = useState('CLASSIC');
    const [difficulty, setDifficulty] = useState(2); // 1=Fácil, 2=Normal, 3=Difícil
    const isCpuMode = selectedMode === 'PVC';
    const needsPlayer2Selection = selectedMode === 'PVP';

    const modeCards = [
        {
            id: 'PVP',
            title: 'Jugador vs Jugador',
            subtitle: 'Local',
            description: 'Batalla local en el mismo dispositivo.',
            Icon: UsersIcon,
            accentClass: 'border-primary ring-primary/10 bg-primary/10 text-primary',
            dotClass: 'bg-primary',
        },
        {
            id: 'PVC',
            title: 'Jugador vs CPU',
            subtitle: 'IA',
            description: 'Desafía a la IA con dificultad configurable.',
            Icon: CpuChipIcon,
            accentClass: 'border-purple-500 ring-purple-500/10 bg-purple-500/10 text-purple-400',
            dotClass: 'bg-purple-400',
        },
    ];

    const variantCards = [
        {
            id: 'CLASSIC',
            title: 'Modo Clásico',
            description: 'Reglas normales de ajedrez sin casillas especiales.',
            accentClass: 'border-white/20 ring-white/10 bg-white/5 text-white',
            dotClass: 'bg-white',
        },
        {
            id: 'SPECIAL',
            title: 'Casillas Especiales',
            description: 'Partida con reglas Dragon y eventos especiales progresivos.',
            accentClass: 'border-cyan-400 ring-cyan-400/10 bg-cyan-400/10 text-cyan-300',
            dotClass: 'bg-cyan-300',
        },
    ];

    return (
        <>
            <Head title="Seleccionar Modo de Juego" />
            <div className="flex flex-col h-screen relative overflow-hidden bg-gradient-to-br from-[#0d0e12] via-[#1a1b1e] to-[#0d0e12]">
                {/* Decorative Aura */}
                <div className="absolute -top-40 -right-40 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
                <div className="absolute -bottom-40 -left-40 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-secondary/5 blur-[120px] rounded-full pointer-events-none"></div>

                <header className="px-4 md:px-10 py-4 md:py-6 flex items-center justify-between border-b border-white/5 relative z-10 bg-black/20">
                    <Link href={route('welcome')} className="flex items-center gap-2 group text-white/60 hover:text-white transition-colors">
                        <span className="text-xl transition-transform group-hover:-translate-x-1">←</span>
                        <span className="text-xs font-black uppercase tracking-widest">Volver al Inicio</span>
                    </Link>
                    <h2 className="hidden md:block text-xs font-black tracking-[0.5em] uppercase opacity-50 text-white">MODO DE JUEGO</h2>
                    <div className="w-12 md:w-24 h-[1px] bg-white/10"></div>
                </header>

                <div className="flex-1 flex flex-col items-center justify-start px-4 md:px-10 py-6 md:py-8 relative z-10 overflow-y-auto">
                    <div className="max-w-4xl w-full space-y-4 md:space-y-8 mx-auto">
                        <div className="text-center space-y-2 md:space-y-4">
                            <h1 className="text-2xl md:text-5xl lg:text-6xl font-black italic tracking-tighter uppercase leading-tight text-white">
                                Elige el<br/>
                                <span className="text-primary">Modo de Batalla</span>
                            </h1>
                            <p className="text-white/40 text-sm md:text-base font-medium max-w-xl mx-auto leading-relaxed">
                                Selecciona cómo quieres enfrentarte en el tablero de combate
                            </p>
                        </div>

                        {/* Game Mode Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
                            {modeCards.map(({ id, title, subtitle, description, Icon, accentClass, dotClass }) => {
                                const isSelected = selectedMode === id;
                                return (
                                    <div
                                        key={id}
                                        onClick={() => setSelectedMode(id)}
                                        className={`relative group rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 border-4 p-4 md:p-10 lg:p-12 ${
                                            isSelected
                                                ? `${accentClass} ring-8 scale-100`
                                                : 'border-white/5 opacity-60 hover:opacity-80 scale-[0.98] bg-white/5'
                                        }`}
                                    >
                                        <div className="relative z-10 space-y-4 md:space-y-6">
                                            <Icon className="w-12 h-12 md:w-16 lg:w-20 md:h-16 lg:h-20 text-white" />
                                            <div>
                                                <h3 className="text-2xl md:text-3xl lg:text-4xl font-black italic tracking-tighter uppercase leading-none text-white mb-2 md:mb-3">
                                                    {title}
                                                </h3>
                                                <p className="text-white/60 text-sm md:text-base font-medium leading-relaxed">
                                                    {description}
                                                </p>
                                            </div>
                                            <div className={`flex items-center gap-2 text-xs md:text-sm font-black uppercase tracking-widest ${isSelected ? 'text-white' : 'text-white/40'}`}>
                                                <span className={`w-2 h-2 rounded-full ${dotClass} ${isSelected ? 'animate-pulse' : ''}`}></span>
                                                {subtitle}
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                                <span className="text-white text-xl">✓</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-center text-sm md:text-base font-black uppercase tracking-[0.2em] text-white/70">Variante de partida</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                {variantCards.map(({ id, title, description, accentClass, dotClass }) => {
                                    const isSelected = selectedVariant === id;
                                    return (
                                        <button
                                            key={id}
                                            type="button"
                                            onClick={() => setSelectedVariant(id)}
                                            className={`relative rounded-2xl border-2 p-4 md:p-5 text-left transition-all duration-300 ${
                                                isSelected
                                                    ? `${accentClass} ring-4`
                                                    : 'border-white/10 bg-white/5 opacity-70 hover:opacity-100'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`w-2.5 h-2.5 rounded-full ${dotClass} ${isSelected ? 'animate-pulse' : ''}`}></span>
                                                <span className="text-sm md:text-base font-black uppercase tracking-wider text-white">{title}</span>
                                            </div>
                                            <p className="text-xs md:text-sm text-white/60">{description}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Difficulty Selector (solo PVC) */}
                        {isCpuMode && (
                            <div className="bg-white/5 border border-purple-500/20 rounded-2xl p-4 md:p-6 space-y-4 animate-in fade-in duration-300">
                                <h3 className="text-lg md:text-xl font-black italic uppercase tracking-tighter text-white text-center">
                                    Nivel de <span className="text-purple-400">Dificultad</span>
                                </h3>
                                <div className="grid grid-cols-3 gap-3 md:gap-4">
                                    {[
                                        { level: 1, label: 'Fácil', desc: 'Para aprender', Icon: AcademicCapIcon, color: 'green' },
                                        { level: 2, label: 'Normal', desc: 'Desafío justo', Icon: BoltIcon, color: 'yellow' },
                                        { level: 3, label: 'Difícil', desc: 'Sin piedad', Icon: FireIcon, color: 'red' },
                                    ].map(({ level, label, desc, Icon, color }) => (
                                        <button
                                            key={level}
                                            type="button"
                                            onClick={() => setDifficulty(level)}
                                            className={`relative rounded-xl border-2 p-3 md:p-4 transition-all duration-300 text-center ${
                                                difficulty === level
                                                    ? `border-${color}-500 bg-${color}-500/10 ring-4 ring-${color}-500/20 scale-105`
                                                    : 'border-white/10 bg-white/5 opacity-60 hover:opacity-80 hover:scale-[1.02]'
                                            }`}
                                        >
                                            <Icon className={`w-7 h-7 md:w-9 md:h-9 mx-auto mb-1 ${
                                                difficulty === level ? `text-${color}-500` : 'text-white/60'
                                            }`} />
                                            <p className="text-sm md:text-base font-black uppercase tracking-wider text-white">{label}</p>
                                            <p className="text-[10px] md:text-xs text-white/50 mt-1">{desc}</p>
                                            {difficulty === level && (
                                                <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full bg-${color}-500 flex items-center justify-center text-xs text-white font-bold`}>✓</div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Continue Button */}
                        <Link 
                            href={needsPlayer2Selection
                                ? route('player2.select', { mode: selectedMode, variant: selectedVariant, difficulty })
                                : route('faction.select', { mode: selectedMode, variant: selectedVariant, difficulty })}
                            className="w-full group relative bg-primary h-16 md:h-20 rounded-2xl flex items-center justify-center gap-4 shadow-[0_0_20px_rgba(249,122,31,0.25),0_0_40px_rgba(249,122,31,0.1)] hover:shadow-[0_0_25px_rgba(249,122,31,0.35),0_0_50px_rgba(249,122,31,0.15)] transition-all hover:-translate-y-1 active:scale-95 overflow-hidden"
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
