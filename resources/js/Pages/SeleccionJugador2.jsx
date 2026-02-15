import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { UserIcon, LockClosedIcon, CheckIcon } from '@heroicons/react/24/solid';

export default function SeleccionJugador2({ auth }) {
    const [selectedType, setSelectedType] = useState('guest');

    const handleContinue = () => {
        if (selectedType === 'guest') {
            // Continuar como invitado
            router.visit(route('faction.select', { mode: 'PVP', player2Type: 'guest' }));
        } else {
            // Ir a login especial para jugador 2
            router.visit(route('player2.login'));
        }
    };

    return (
        <>
            <Head title="Configurar Jugador 2" />
            <div className="flex flex-col h-screen relative overflow-hidden bg-gradient-to-br from-[#0d0e12] via-[#1a1b1e] to-[#0d0e12]">
                {/* Decorative Aura */}
                <div className="absolute -top-40 -right-40 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
                <div className="absolute -bottom-40 -left-40 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-secondary/5 blur-[120px] rounded-full pointer-events-none"></div>

                <header className="px-4 md:px-10 py-4 md:py-6 flex items-center justify-between border-b border-white/5 relative z-10 bg-black/20">
                    <Link href={route('game.mode')} className="flex items-center gap-2 group text-white/60 hover:text-white transition-colors">
                        <span className="text-xl transition-transform group-hover:-translate-x-1">←</span>
                        <span className="text-xs font-black uppercase tracking-widest">Cambiar Modo</span>
                    </Link>
                    <h2 className="hidden md:block text-xs font-black tracking-[0.5em] uppercase opacity-50 text-white">JUGADOR 2</h2>
                    <div className="w-12 md:w-24 h-[1px] bg-white/10"></div>
                </header>

                <div className="flex-1 flex flex-col items-center justify-start md:justify-center px-4 md:px-10 py-4 md:py-8 relative z-10 overflow-y-auto">
                    <div className="max-w-4xl w-full space-y-4 md:space-y-8 my-auto">
                        <div className="text-center space-y-2 md:space-y-4">
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black italic tracking-tighter uppercase leading-tight text-white">
                                Configura al<br/>
                                <span className="text-primary">Jugador 2</span>
                            </h1>
                            <p className="text-white/40 text-sm md:text-base font-medium max-w-xl mx-auto leading-relaxed">
                                ¿El segundo jugador iniciará sesión o jugará como invitado?
                            </p>
                        </div>

                        {/* Selection Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
                            {/* Guest Mode */}
                            <div 
                                onClick={() => setSelectedType('guest')}
                                className={`relative group rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 border-4 p-4 md:p-10 lg:p-12 ${
                                    selectedType === 'guest' 
                                        ? 'border-primary ring-8 ring-primary/10 scale-100 bg-primary/10' 
                                        : 'border-white/5 opacity-60 hover:opacity-80 scale-[0.98] bg-white/5'
                                }`}
                            >
                                <div className="relative z-10 space-y-4 md:space-y-6">
                                    <UserIcon className="w-12 h-12 md:w-16 lg:w-20 md:h-16 lg:h-20 text-white" />
                                    <div>
                                        <h3 className="text-2xl md:text-3xl lg:text-4xl font-black italic tracking-tighter uppercase leading-none text-white mb-2 md:mb-3">
                                            Modo<br/>Invitado
                                        </h3>
                                        <p className="text-white/60 text-sm md:text-base font-medium leading-relaxed">
                                            El jugador 2 participa sin cuenta. No se guardan estadísticas de esta partida para él.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-primary text-xs md:text-sm font-black uppercase tracking-widest">
                                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                        Sin Registro
                                    </div>
                                </div>
                                {selectedType === 'guest' && (
                                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                        <CheckIcon className="w-5 h-5 text-white" />
                                    </div>
                                )}
                            </div>

                            {/* Login Mode */}
                            <div 
                                onClick={() => setSelectedType('login')}
                                className={`relative group rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 border-4 p-4 md:p-10 lg:p-12 ${
                                    selectedType === 'login' 
                                        ? 'border-purple-500 ring-8 ring-purple-500/10 scale-100 bg-purple-500/10' 
                                        : 'border-white/5 opacity-60 hover:opacity-80 scale-[0.98] bg-white/5'
                                }`}
                            >
                                <div className="relative z-10 space-y-4 md:space-y-6">
                                    <LockClosedIcon className="w-12 h-12 md:w-16 lg:w-20 md:h-16 lg:h-20 text-white" />
                                    <div>
                                        <h3 className="text-2xl md:text-3xl lg:text-4xl font-black italic tracking-tighter uppercase leading-none text-white mb-2 md:mb-3">
                                            Iniciar<br/>Sesión
                                        </h3>
                                        <p className="text-white/60 text-sm md:text-base font-medium leading-relaxed">
                                            El jugador 2 inicia sesión con su cuenta. Se guardarán sus estadísticas y progreso.
                                        </p>
                                    </div>
                                    <div className={`flex items-center gap-2 text-xs md:text-sm font-black uppercase tracking-widest ${
                                        selectedType === 'login' ? 'text-purple-400' : 'text-white/40'
                                    }`}>
                                        <span className={`w-2 h-2 rounded-full ${selectedType === 'login' ? 'bg-purple-400 animate-pulse' : 'bg-white/40'}`}></span>
                                        Cuenta Registrada
                                    </div>
                                </div>
                                {selectedType === 'login' && (
                                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                                        <CheckIcon className="w-5 h-5 text-white" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Continue Button */}
                        <button 
                            onClick={handleContinue}
                            className="w-full group relative bg-primary h-16 md:h-20 rounded-2xl flex items-center justify-center gap-4 shadow-[0_15px_30px_rgba(249,122,31,0.3)] hover:shadow-[0_20px_40px_rgba(249,122,31,0.4)] transition-all hover:-translate-y-1 active:scale-95 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                            <span className="text-xl md:text-2xl font-black italic tracking-tighter uppercase relative z-10">Continuar</span>
                            <span className="text-2xl md:text-3xl font-black group-hover:translate-x-2 transition-transform relative z-10">→</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
