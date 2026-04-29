import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <>
            <Head title="Olvidé mi Contraseña - Dragon Chess" />
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
                            Recupera tu acceso a la arena. No dejes que tu guerrero caiga en el olvido.
                        </p>
                    </div>
                </div>

                {/* Right Side - Forgot Password Form */}
                <div className="flex-1 flex items-center justify-center p-4 md:p-8 relative z-10">
                    <div className="w-full max-w-md">
                        <Link href={route('login')} className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6 md:mb-8">
                            <span className="text-lg md:text-xl">←</span>
                            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Volver al Acceso</span>
                        </Link>

                        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl">
                            <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase text-white mb-2">
                                Forjar Nueva Clave
                            </h1>
                            <p className="text-white/40 text-xs md:text-sm mb-6 md:mb-8">
                                ¿Olvidaste tu contraseña? No hay problema. Simplemente indícanos tu correo electrónico y te enviaremos un código para restablecer tu contraseña.
                            </p>

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
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        autoComplete="username"
                                        autoFocus
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="guerrero@arena.com"
                                        readOnly={status !== null}
                                        disabled={status !== null}
                                    />
                                    {errors.email && (
                                        <p className="mt-2 text-sm text-red-400">{errors.email}</p>
                                    )}
                                </div>

                                {!status ? (
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-primary hover:bg-orange-500 text-white font-black italic uppercase tracking-tighter text-lg py-4 rounded-xl shadow-neon-orange transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processing ? 'Enviando...' : 'Enviar Código'}
                                    </button>
                                ) : (
                                    <div className="pt-4 border-t border-white/10 mt-6 space-y-4">
                                        <p className="text-white/70 text-sm font-medium">¿Ya recibiste tu código de 6 dígitos?</p>
                                        <div className="flex gap-2">
                                            <input
                                                id="manualCode"
                                                type="text"
                                                placeholder="000000"
                                                maxLength="6"
                                                className="w-1/2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-mono tracking-widest font-bold text-center"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const code = document.getElementById('manualCode').value;
                                                    if(code && code.length >= 6) {
                                                        window.location.href = route('password.reset', { token: code, email: data.email });
                                                    }
                                                }}
                                                className="w-1/2 bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-wider text-sm py-3 rounded-xl transition-all"
                                            >
                                                Validar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
