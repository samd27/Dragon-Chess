import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function EditarPerfil({ auth, stats }) {
    const { data, setData, patch, processing, errors } = useForm({
        name: auth.user.name,
        email: auth.user.email,
        avatar: auth.user.avatar || '/images/characters/Guerreros/Torre/Goku.png',
    });

    const [clientErrors, setClientErrors] = useState({});
    const [showAvatarSelector, setShowAvatarSelector] = useState(false);

    const validateName = (name) => {
        if (!name || name.length === 0) {
            return 'El nombre de guerrero es obligatorio.';
        }
        if (name.length > 10) {
            return 'El nombre de guerrero no puede tener más de 10 caracteres.';
        }
        if (!/^[a-zA-Z0-9_]+$/.test(name)) {
            return 'El nombre solo puede contener letras, números y guiones bajos.';
        }
        return null;
    };

    const validateEmail = (email) => {
        if (!email || email.length === 0) {
            return 'El correo electrónico es obligatorio.';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return 'El formato del correo electrónico no es válido.';
        }
        return null;
    };

    const handleNameChange = (e) => {
        const name = e.target.value;
        setData('name', name);
        const error = validateName(name);
        setClientErrors(prev => ({ ...prev, name: error }));
    };

    const handleEmailChange = (e) => {
        const email = e.target.value;
        setData('email', email);
        const error = validateEmail(email);
        setClientErrors(prev => ({ ...prev, email: error }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const nameError = validateName(data.name);
        const emailError = validateEmail(data.email);

        if (nameError || emailError) {
            setClientErrors({
                name: nameError,
                email: emailError,
            });
            return;
        }

        patch(route('profile.update'), {
            onSuccess: () => {
                window.location.href = route('welcome');
            }
        });
    };

    const availableAvatars = [
        { name: 'Goku', path: '/images/characters/Guerreros/Torre/Goku.png' },
        { name: 'Vegeta', path: '/images/characters/Guerreros/Caballo/Vegeta.png' },
        { name: 'Bills', path: '/images/characters/Guerreros/Rey/Bills.png' },
        { name: 'Bulma', path: '/images/characters/Guerreros/Reina/Bulma.png' },
        { name: 'Freezer', path: '/images/characters/Villanos/Rey/Freezer.png' },
        { name: 'Champa', path: '/images/characters/Villanos/Rey/Champa.png' },
        { name: 'Dabura', path: '/images/characters/Villanos/Rey/Dabura.png' },
        { name: 'Ginyu', path: '/images/characters/Villanos/Rey/Ginyu.png' },
        { name: 'Moro', path: '/images/characters/Villanos/Rey/Moro.png' },
    ];

    return (
        <>
            <Head title="Personalizar Perfil" />
            <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-[#0d0e12] via-[#1a1b1e] to-[#0d0e12]">
                {/* Decorative Aura */}
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
                <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-secondary/5 blur-[120px] rounded-full pointer-events-none"></div>

                {/* Header */}
                <header className="flex items-center justify-between px-4 md:px-10 py-4 md:py-6 relative z-10 bg-black/20 backdrop-blur-lg border-b border-white/5">
                    <Link href={route('welcome')} className="flex flex-col gap-0.5 transform -rotate-2">
                        <h2 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase leading-none text-white">
                            D <span className="text-primary">CHESS</span>
                        </h2>
                        <div className="h-[2px] w-full bg-gradient-to-r from-primary to-transparent"></div>
                    </Link>
                    <Link 
                        href={route('welcome')}
                        className="px-3 md:px-4 py-2 text-white/80 hover:text-white font-bold text-xs md:text-sm transition-colors"
                    >
                        ← Volver
                    </Link>
                </header>

                {/* Main Content */}
                <main className="flex-1 flex items-center justify-center px-4 md:px-10 py-6 md:py-12 relative z-10">
                    <div className="w-full max-w-2xl bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-2xl">
                        <div className="text-center mb-6 md:mb-8">
                            <h1 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase text-white mb-2">
                                Personalizar <span className="text-primary">Perfil</span>
                            </h1>
                            <p className="text-white/50 text-xs md:text-sm">Configura tu identidad de guerrero</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                            {/* Avatar Selector */}
                            <div className="space-y-2">
                                <label className="block text-white font-black uppercase text-xs tracking-widest mb-2">
                                    Avatar de Guerrero
                                </label>
                                <div className="flex items-center gap-3 md:gap-4">
                                    <img 
                                        src={data.avatar} 
                                        alt="Avatar actual" 
                                        className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 md:border-4 border-primary object-cover shadow-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                                        className="px-4 md:px-6 py-2 md:py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold text-xs md:text-sm transition-all"
                                    >
                                        Cambiar Avatar
                                    </button>
                                </div>

                                {showAvatarSelector && (
                                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 mt-3 md:mt-4 p-3 md:p-4 bg-black/20 rounded-xl border border-white/5">
                                        {availableAvatars.map((avatar) => (
                                            <button
                                                key={avatar.path}
                                                type="button"
                                                onClick={() => {
                                                    setData('avatar', avatar.path);
                                                    setShowAvatarSelector(false);
                                                }}
                                                className={`p-2 rounded-xl border-2 transition-all ${
                                                    data.avatar === avatar.path
                                                        ? 'border-primary bg-primary/20'
                                                        : 'border-white/10 hover:border-white/30'
                                                }`}
                                            >
                                                <img 
                                                    src={avatar.path} 
                                                    alt={avatar.name} 
                                                    className="w-full h-16 md:h-20 object-cover rounded-lg"
                                                />
                                                <span className="block text-white text-[10px] md:text-xs font-bold mt-1 md:mt-2 text-center">{avatar.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Nombre */}
                            <div className="space-y-2">
                                <label htmlFor="name" className="block text-white font-black uppercase text-xs tracking-widest">
                                    Nombre de Guerrero
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={handleNameChange}
                                    maxLength={10}
                                    className="w-full px-5 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    placeholder="Tu nombre de guerrero"
                                />
                                {(clientErrors.name || errors.name) && (
                                    <p className="text-red-400 text-xs font-medium mt-1">
                                        {clientErrors.name || errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-white font-black uppercase text-xs tracking-widest">
                                    Correo Electrónico
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={handleEmailChange}
                                    className="w-full px-5 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    placeholder="guerrero@dragonchess.com"
                                />
                                {(clientErrors.email || errors.email) && (
                                    <p className="text-red-400 text-xs font-medium mt-1">
                                        {clientErrors.email || errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Estadísticas (Solo lectura) */}
                            <div className="grid grid-cols-3 gap-3 md:gap-4 p-3 md:p-4 bg-black/20 rounded-xl border border-white/5">
                                <div className="text-center">
                                    <span className="block text-xl md:text-2xl font-black text-primary italic">{stats?.level || 1}</span>
                                    <span className="block text-[9px] md:text-[10px] font-black uppercase text-white/40 tracking-widest mt-1">Nivel</span>
                                </div>
                                <div className="text-center">
                                    <span className="block text-xl md:text-2xl font-black text-primary italic">{stats?.victories || 0}</span>
                                    <span className="block text-[9px] md:text-[10px] font-black uppercase text-white/40 tracking-widest mt-1">Victorias</span>
                                </div>
                                <div className="text-center">
                                    <span className="block text-xl md:text-2xl font-black text-yellow-500 italic">{stats?.ki?.toLocaleString() || 0}</span>
                                    <span className="block text-[9px] md:text-[10px] font-black uppercase text-white/40 tracking-widest mt-1">Ki</span>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing || Object.values(clientErrors).some(err => err)}
                                className="w-full group relative bg-primary h-12 md:h-14 rounded-2xl flex items-center justify-center gap-2 md:gap-3 shadow-[0_10px_30px_rgba(249,122,31,0.3)] hover:shadow-[0_15px_40px_rgba(249,122,31,0.4)] transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                <span className="text-lg md:text-xl font-black italic tracking-tighter uppercase relative z-10">
                                    {processing ? 'Guardando...' : 'Guardar Cambios'}
                                </span>
                                <span className="text-xl md:text-2xl relative z-10">💾</span>
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        </>
    );
}
