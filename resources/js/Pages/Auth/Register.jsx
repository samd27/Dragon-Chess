import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [clientErrors, setClientErrors] = useState({});

    const validateName = (value) => {
        if (!value) return 'El nombre de guerrero es obligatorio.';
        if (value.length > 10) return 'El nombre no puede tener más de 10 caracteres.';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Solo letras, números y guiones bajos.';
        return '';
    };

    const validateEmail = (value) => {
        if (!value) return 'El correo es obligatorio.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'El correo no es válido.';
        return '';
    };

    const validatePassword = (value) => {
        if (!value) return 'La contraseña es obligatoria.';
        if (value.length < 8) return 'Mínimo 8 caracteres.';
        if (value.length > 20) return 'Máximo 20 caracteres.';
        if (!/(?=.*[a-z])/.test(value)) return 'Debe incluir una minúscula.';
        if (!/(?=.*[A-Z])/.test(value)) return 'Debe incluir una mayúscula.';
        if (!/(?=.*\d)/.test(value)) return 'Debe incluir un número.';
        if (!/(?=.*[@$!%*?&#])/.test(value)) return 'Debe incluir un símbolo (@$!%*?&#).';
        return '';
    };

    const validatePasswordConfirmation = (value) => {
        if (!value) return 'Debes confirmar tu contraseña.';
        if (value !== data.password) return 'Las contraseñas no coinciden.';
        return '';
    };

    const handleNameChange = (e) => {
        const value = e.target.value;
        setData('name', value);
        setClientErrors({ ...clientErrors, name: validateName(value) });
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setData('email', value);
        setClientErrors({ ...clientErrors, email: validateEmail(value) });
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setData('password', value);
        setClientErrors({ 
            ...clientErrors, 
            password: validatePassword(value),
            password_confirmation: data.password_confirmation ? validatePasswordConfirmation(data.password_confirmation) : ''
        });
    };

    const handlePasswordConfirmationChange = (e) => {
        const value = e.target.value;
        setData('password_confirmation', value);
        setClientErrors({ ...clientErrors, password_confirmation: validatePasswordConfirmation(value) });
    };

    const submit = (e) => {
        e.preventDefault();

        // Validar todos los campos
        const nameError = validateName(data.name);
        const emailError = validateEmail(data.email);
        const passwordError = validatePassword(data.password);
        const passwordConfirmationError = validatePasswordConfirmation(data.password_confirmation);

        if (nameError || emailError || passwordError || passwordConfirmationError) {
            setClientErrors({
                name: nameError,
                email: emailError,
                password: passwordError,
                password_confirmation: passwordConfirmationError,
            });
            return;
        }

        post(route('register'), {
            onFinish: () => {
                // Reset password fields after submission
            },
        });
    };

    return (
        <>
            <Head title="Registro - Dragon Chess" />
            <div className="flex flex-col md:flex-row min-h-screen relative overflow-hidden bg-gradient-to-br from-[#0d0e12] via-[#1a1b1e] to-[#0d0e12]">
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
                            Únete a la arena más intensa. Crea tu perfil de guerrero, elige tu bando y domina el campo de batalla.
                        </p>
                    </div>
                </div>

                {/* Right Side - Register Form */}
                <div className="flex-1 flex items-center justify-center p-4 md:p-8 relative z-10">
                    <div className="w-full max-w-md">
                        <Link href={route('welcome')} className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6 md:mb-8">
                            <span className="text-lg md:text-xl">←</span>
                            <span className="text-xs md:text-sm font-medium">Volver al inicio</span>
                        </Link>

                        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl">
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
                                        onChange={handleNameChange}
                                        placeholder="Ingresa tu nombre de guerrero"
                                        required
                                    />
                                    {(clientErrors.name || errors.name) && (
                                        <p className="mt-2 text-sm text-red-400">{clientErrors.name || errors.name}</p>
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
                                        onChange={handleEmailChange}
                                        placeholder="guerrero@arena.com"
                                        required
                                    />
                                    {(clientErrors.email || errors.email) && (
                                        <p className="mt-2 text-sm text-red-400">{clientErrors.email || errors.email}</p>
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
                                        onChange={handlePasswordChange}
                                        placeholder="Crea una contraseña segura"
                                        required
                                    />
                                    {(clientErrors.password || errors.password) && (
                                        <p className="mt-2 text-sm text-red-400">{clientErrors.password || errors.password}</p>
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
                                        onChange={handlePasswordConfirmationChange}
                                        placeholder="Confirma tu contraseña"
                                        required
                                    />
                                    {(clientErrors.password_confirmation || errors.password_confirmation) && (
                                        <p className="mt-2 text-sm text-red-400">{clientErrors.password_confirmation || errors.password_confirmation}</p>
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
