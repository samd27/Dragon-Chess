import { Head, Link, useForm } from '@inertiajs/react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token || '',
        email: email || '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Restablecer Contraseña - Dragon Chess" />
            <div className="flex flex-col md:flex-row h-screen relative overflow-hidden bg-gradient-to-br from-[#0d0e12] via-[#1a1b1e] to-[#0d0e12]">
                {/* Decorative Aura */}
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
                <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-secondary/5 blur-[120px] rounded-full pointer-events-none"></div>

                {/* Left Side - Branding */}
                <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-20">
                    <div className="relative z-10 max-w-md">
                        <div className="flex flex-col gap-0.5 transform -rotate-2 mb-8">
                            <h2 className="text-6xl font-black italic tracking-tighter uppercase leading-none text-white">
                                DRAGON<br/>
                                <span className="text-primary">CHESS</span>
                            </h2>
                            <div className="h-[3px] w-full bg-gradient-to-r from-primary to-transparent"></div>
                        </div>
                        <p className="text-white/50 text-lg font-medium leading-relaxed">
                            Forja una nueva llave para tu reino. Tu ejército te espera.
                        </p>
                    </div>
                </div>

                {/* Right Side - Reset Password Form */}
                <div className="flex-1 flex items-center justify-center p-4 md:p-8 relative z-10 overflow-y-auto">
                    <div className="w-full max-w-md py-8">
                        <Link href={route('login')} className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6 md:mb-8">
                            <span className="text-lg md:text-xl">←</span>
                            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Cancelar</span>
                        </Link>

                        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl">
                            <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase text-white mb-2">
                                Nueva Contraseña
                            </h1>
                            <p className="text-white/40 text-xs md:text-sm mb-6 md:mb-8">
                                Ingresa tu código de seguridad y define tu nueva contraseña para recuperar el acceso a la arena.
                            </p>

                            <form onSubmit={submit} className="space-y-5">
                                <div>
                                    <label htmlFor="token" className="block text-xs font-black uppercase tracking-widest text-white/60 mb-2">
                                        Código de Seguridad
                                    </label>
                                    <input
                                        id="token"
                                        type="text"
                                        name="token"
                                        value={data.token}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-mono tracking-widest font-bold"
                                        onChange={(e) => setData('token', e.target.value)}
                                        placeholder="000000"
                                    />
                                    {errors.token && (
                                        <p className="mt-2 text-sm text-red-400">{errors.token}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-xs font-black uppercase tracking-widest text-white/60 mb-2">
                                        Correo
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all opacity-70"
                                        autoComplete="username"
                                        readOnly
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                    {errors.email && (
                                        <p className="mt-2 text-sm text-red-400">{errors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-xs font-black uppercase tracking-widest text-white/60 mb-2">
                                        Nueva Contraseña
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        autoComplete="new-password"
                                        autoFocus
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                    />
                                    {errors.password && (
                                        <p className="mt-2 text-sm text-red-400">{errors.password}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="password_confirmation" className="block text-xs font-black uppercase tracking-widest text-white/60 mb-2">
                                        Confirmar Contraseña
                                    </label>
                                    <input
                                        id="password_confirmation"
                                        type="password"
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        autoComplete="new-password"
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="••••••••"
                                    />
                                    {errors.password_confirmation && (
                                        <p className="mt-2 text-sm text-red-400">{errors.password_confirmation}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-primary hover:bg-orange-500 text-white font-black italic uppercase tracking-tighter text-lg py-4 rounded-xl shadow-neon-orange transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                                >
                                    {processing ? 'Procesando...' : 'Restablecer'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
