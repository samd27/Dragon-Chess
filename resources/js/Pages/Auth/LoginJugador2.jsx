import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function LoginJugador2({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
    });
    
    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();

        post(route('player2.authenticate'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Login Jugador 2 - Dragon Chess" />
            <div className="flex flex-col md:flex-row h-screen relative overflow-hidden bg-gradient-to-br from-[#0d0e12] via-[#1a1b1e] to-[#0d0e12]">
                {/* Decorative Aura */}
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none"></div>
                <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>

                {/* Left Side - Branding */}
                <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-20">
                    <div className="relative z-10 max-w-md">
                        <div className="flex flex-col gap-0.5 transform -rotate-2 mb-8">
                            <h2 className="text-6xl font-black italic tracking-tighter uppercase leading-none text-white">
                                JUGADOR<br/>
                                <span className="text-purple-500">2</span>
                            </h2>
                            <div className="h-[3px] w-full bg-gradient-to-r from-purple-500 to-transparent"></div>
                        </div>
                        <p className="text-white/50 text-lg font-medium leading-relaxed">
                            Inicia sesión para que tus estadísticas y progreso se guarden en esta batalla.
                        </p>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="flex-1 flex items-center justify-center p-4 md:p-8 relative z-10">
                    <div className="w-full max-w-md">
                        <Link href={route('player2.select')} className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6 md:mb-8">
                            <span className="text-lg md:text-xl">←</span>
                            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Volver</span>
                        </Link>

                        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl">
                            <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase text-white mb-2">
                                Jugador 2
                            </h1>
                            <p className="text-white/40 text-xs md:text-sm mb-6 md:mb-8">Ingresa tus credenciales para registrar tu partida</p>

                            {status && (
                                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm font-medium">
                                    {status}
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <label htmlFor="email" className="block text-xs font-black uppercase tracking-widest text-white/60 mb-2">
                                        Correo
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        autoComplete="username"
                                        autoFocus
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="guerrero@arena.com"
                                    />
                                    {errors.email && (
                                        <p className="mt-2 text-sm text-red-400">{errors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-xs font-black uppercase tracking-widest text-white/60 mb-2">
                                        Contraseña
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={data.password}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            autoComplete="current-password"
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Ingresa tu contraseña"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                                        >
                                            {showPassword ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="mt-2 text-sm text-red-400">{errors.password}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-purple-500 hover:bg-purple-600 text-white font-black italic uppercase tracking-tighter text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Accediendo...' : 'Continuar como Jugador 2'}
                                </button>

                                <div className="flex items-center justify-center pt-4 border-t border-white/10">
                                    <span className="text-sm text-white/60 mr-2">¿No tienes cuenta?</span>
                                    <Link
                                        href={route('register')}
                                        className="text-sm text-purple-400 hover:text-purple-300 font-bold transition-colors"
                                    >
                                        Crear Cuenta
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
