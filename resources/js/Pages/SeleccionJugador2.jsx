import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { UserIcon, LockClosedIcon, CheckIcon } from '@heroicons/react/24/solid';
import GameLayout from '@/Layouts/GameLayout';
import SelectionCard from '@/Components/SelectionCard';

export default function SeleccionJugador2({ mode = 'PVP', variant = 'CLASSIC', difficulty = 2 }) {
    const [selectedType, setSelectedType] = useState('guest');

    const handleContinue = () => {
        if (selectedType === 'guest') {
            // Continuar como invitado
            router.visit(route('faction.select', { mode, variant, difficulty, player2Type: 'guest' }));
        } else {
            // Ir a login especial para jugador 2
            router.visit(route('player2.login', { mode, variant, difficulty }));
        }
    };

    return (
        <GameLayout>
            <Head title="Configurar Jugador 2" />

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
                            <SelectionCard
                                Icon={UserIcon}
                                title={'Modo\nInvitado'}
                                description="El jugador 2 participa sin cuenta. No se guardan estadísticas de esta partida para él."
                                tagText="Sin Registro"
                                isSelected={selectedType === 'guest'}
                                onClick={() => setSelectedType('guest')}
                                colorClass="primary"
                            />

                            <SelectionCard
                                Icon={LockClosedIcon}
                                title={'Iniciar\nSesión'}
                                description="El jugador 2 inicia sesión con su cuenta. Se guardarán sus estadísticas y progreso."
                                tagText="Cuenta Registrada"
                                isSelected={selectedType === 'login'}
                                onClick={() => setSelectedType('login')}
                                colorClass="purple"
                            />
                        </div>

                        {/* Continue Button */}
                        <button 
                            onClick={handleContinue}
                            className="w-full group relative bg-primary h-16 md:h-20 rounded-2xl flex items-center justify-center gap-4 shadow-[0_0_20px_rgba(249,122,31,0.25),0_0_40px_rgba(249,122,31,0.1)] hover:shadow-[0_0_25px_rgba(249,122,31,0.35),0_0_50px_rgba(249,122,31,0.15)] transition-all hover:-translate-y-1 active:scale-95 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                            <span className="text-xl md:text-2xl font-black italic tracking-tighter uppercase relative z-10">Continuar</span>
                            <span className="text-2xl md:text-3xl font-black group-hover:translate-x-2 transition-transform relative z-10">→</span>
                        </button>
                    </div>
                </div>
        </GameLayout>
    );
}
