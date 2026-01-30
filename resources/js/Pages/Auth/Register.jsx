import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Register - Dragon Chess" />
            <div className="flex h-screen relative overflow-hidden bg-gradient-to-br from-[#0d0e12] via-[#1a1b1e] to-[#0d0e12]">
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
                            Join the ultimate high-stakes chess battleground. Create your warrior profile and start your journey to dominance.
                        </p>
                    </div>
                </div>

                {/* Right Side - Register Form */}
                <div className="flex-1 flex items-center justify-center p-8 relative z-10">
                    <div className="w-full max-w-md">
                        <Link href={route('welcome')} className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8">
                            <span className="text-xl">←</span>
                            <span className="text-xs font-black uppercase tracking-widest">Back to Arena</span>
                        </Link>

                        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                            <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white mb-2">
                                Únete a la Arena
                            </h1>
                            <p className="text-white/40 text-sm mb-8">Crea tu perfil de guerrero para comenzar</p>

                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-xs font-black uppercase tracking-widest text-white/60 mb-2">
                                        Nombre de Guerrero
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        autoComplete="name"
                                        autoFocus
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Ingresa tu nombre de guerrero"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="mt-2 text-sm text-red-400">{errors.name}</p>
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
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        autoComplete="username"
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="guerrero@arena.com"
                                        required
                                    />
                                    {errors.email && (
                                        <p className="mt-2 text-sm text-red-400">{errors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-xs font-black uppercase tracking-widest text-white/60 mb-2">
                                        Contraseña
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        autoComplete="new-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Crea una contraseña segura"
                                        required
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
                                        placeholder="Confirma tu contraseña"
                                        required
                                    />
                                    {errors.password_confirmation && (
                                        <p className="mt-2 text-sm text-red-400">{errors.password_confirmation}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-primary hover:bg-orange-500 text-white font-black italic uppercase tracking-tighter text-lg py-4 rounded-xl shadow-neon-orange transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Creando Guerrero...' : 'Crear Cuenta'}
                                </button>

                                <div className="flex items-center justify-center pt-4 border-t border-white/10">
                                    <span className="text-sm text-white/60 mr-2">¿Ya tienes una cuenta?</span>
                                    <Link
                                        href={route('login')}
                                        className="text-sm text-primary hover:text-orange-400 font-bold transition-colors"
                                    >
                                        Iniciar Sesión
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
