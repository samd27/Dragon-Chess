import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { FireIcon, UsersIcon, ShoppingBagIcon, Bars3Icon, XMarkIcon, UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';
import ElectricBorder from '@/Components/ElectricBorder';

export default function Welcome({ auth, stats }) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    
    const player = {
        name: auth.user?.name || 'Kakarot_99',
        level: stats?.level || 1,
        avatar: auth.user?.avatar || '/images/characters/Guerreros/Torre/Goku.png',
    };

    return (
        <>
            <Head title="Dragon Chess - Prepare for Impact" />
            <div className="flex flex-col h-screen relative overflow-hidden bg-gradient-to-br from-[#0d0e12] via-[#1a1b1e] to-[#0d0e12]">
                {/* Decorative Aura */}
                <div className="absolute -top-40 -right-40 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
                <div className="absolute -bottom-40 -left-40 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-secondary/5 blur-[120px] rounded-full pointer-events-none"></div>

                {/* Top Navigation Bar */}
                <header className="flex items-center justify-between px-4 md:px-10 py-4 md:py-6 relative z-50 bg-black/20 backdrop-blur-lg border-b border-white/5">
                    <div className="flex items-center gap-4 md:gap-10">
                        <div className="flex flex-col gap-0.5 transform -rotate-2">
                            <h2 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase leading-none text-white">
                                D <span className="text-primary">CHESS</span>
                            </h2>
                            <div className="h-[2px] w-full bg-gradient-to-r from-primary to-transparent"></div>
                        </div>
                        {auth.user && (
                            <nav className="hidden md:flex items-center gap-8">
                                <button className="text-primary font-black uppercase text-xs tracking-widest flex items-center gap-2">
                                    <FireIcon className="w-4 h-4" /> BATALLA
                                </button>
                                <Link 
                                    href={route('pieces.index')}
                                    className="text-white/40 hover:text-white font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-colors"
                                >
                                    <UsersIcon className="w-4 h-4" /> PIEZAS
                                </Link>
                                <button className="text-white/40 hover:text-white font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-colors">
                                    <ShoppingBagIcon className="w-4 h-4" /> TIENDA
                                </button>
                            </nav>
                        )}
                    </div>

                    <div className="flex items-center">
                        {auth.user ? (
                            <>
                                {/* Desktop: Dropdown */}
                                <div className="hidden md:block relative z-50">
                                    <button 
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        className="flex items-center gap-2 md:gap-3 bg-black/40 rounded-full pl-1 pr-3 md:pr-4 py-1 border border-white/10 shadow-xl hover:border-primary/50 transition-all"
                                    >
                                        <img src={player.avatar} alt="Avatar" className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-primary object-cover" />
                                        <div className="flex flex-col">
                                            <span className="text-[8px] md:text-[10px] text-primary font-black uppercase tracking-widest leading-none mb-0.5">Lvl {player.level}</span>
                                            <span className="text-white text-[10px] md:text-xs font-bold leading-none">{player.name}</span>
                                        </div>
                                    </button>

                                    {showDropdown && (
                                        <>
                                            <div 
                                                className="fixed inset-0 z-40" 
                                                onClick={() => setShowDropdown(false)}
                                            ></div>
                                            <div className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                                                <Link
                                                    href={route('profile.edit')}
                                                    className="block w-full text-left px-4 py-3 text-white hover:bg-primary/10 transition-colors text-sm font-medium border-b border-white/10"
                                                    onClick={() => setShowDropdown(false)}
                                                >
                                                    Personalizar Perfil
                                                </Link>
                                                <Link
                                                    href={route('logout')}
                                                    method="post"
                                                    as="button"
                                                    type="button"
                                                    className="block w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
                                                    onClick={() => setShowDropdown(false)}
                                                >
                                                    Cerrar Sesión
                                                </Link>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Mobile: Sidebar */}
                                <div className="md:hidden">
                                    <button 
                                        onClick={() => setShowSidebar(true)}
                                        className="flex items-center gap-2 bg-black/40 rounded-full p-2 border border-white/10 shadow-xl hover:border-primary/50 transition-all"
                                    >
                                        <Bars3Icon className="w-6 h-6 text-white" />
                                    </button>
                                </div>

                                {/* Mobile Sidebar */}
                                {showSidebar && (
                                    <>
                                        {/* Overlay */}
                                        <div 
                                            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9998] md:hidden"
                                            onClick={() => setShowSidebar(false)}
                                        ></div>
                                        
                                        {/* Sidebar */}
                                        <div className="fixed top-0 right-0 h-screen w-72 bg-gradient-to-b from-[#1a1b1e] to-[#0d0e12] border-l border-white/10 shadow-2xl z-[9999] md:hidden transform translate-x-0 transition-transform duration-300 ease-in-out overflow-hidden">
                                            {/* Close Button */}
                                            <button 
                                                onClick={() => setShowSidebar(false)}
                                                className="absolute top-4 right-4 p-2 text-white/60 hover:text-white transition-colors z-10"
                                            >
                                                <XMarkIcon className="w-6 h-6" />
                                            </button>

                                            <div className="flex flex-col h-full p-6 pt-16 overflow-y-auto pb-6">
                                                {/* User Profile Section */}
                                                <div className="flex flex-col items-center pb-6 border-b border-white/10">
                                                    <img 
                                                        src={player.avatar} 
                                                        alt="Avatar" 
                                                        className="w-20 h-20 rounded-full border-4 border-primary object-cover mb-3 shadow-lg"
                                                    />
                                                    <span className="text-primary font-black uppercase text-xs tracking-widest mb-1">
                                                        Nivel {player.level}
                                                    </span>
                                                    <span className="text-white text-lg font-black">
                                                        {player.name}
                                                    </span>
                                                </div>

                                                {/* Profile Actions */}
                                                <div className="py-6 border-b border-white/10 space-y-2">
                                                    <Link
                                                        href={route('profile.edit')}
                                                        className="flex items-center gap-3 px-4 py-3 text-white hover:bg-primary/10 rounded-xl transition-colors group"
                                                        onClick={() => setShowSidebar(false)}
                                                    >
                                                        <UserIcon className="w-5 h-5 text-primary" />
                                                        <span className="font-bold">Editar Perfil</span>
                                                    </Link>
                                                    <Link
                                                        href={route('logout')}
                                                        method="post"
                                                        as="button"
                                                        type="button"
                                                        className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors w-full text-left group"
                                                        onClick={() => setShowSidebar(false)}
                                                    >
                                                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                                        <span className="font-bold">Cerrar Sesión</span>
                                                    </Link>
                                                </div>

                                                {/* Navigation Links */}
                                                <div className="py-6 space-y-2">
                                                    <Link
                                                        href={route('pieces.index')}
                                                        className="flex items-center gap-3 px-4 py-3 text-white hover:bg-primary/10 rounded-xl transition-colors group"
                                                        onClick={() => setShowSidebar(false)}
                                                    >
                                                        <UsersIcon className="w-5 h-5 text-primary" />
                                                        <span className="font-bold">Piezas</span>
                                                    </Link>
                                                    <button
                                                        className="flex items-center gap-3 px-4 py-3 text-white hover:bg-primary/10 rounded-xl transition-colors group w-full text-left"
                                                        onClick={() => setShowSidebar(false)}
                                                    >
                                                        <ShoppingBagIcon className="w-5 h-5 text-primary" />
                                                        <span className="font-bold">Tienda</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    href={route('login')}
                                    className="px-4 py-2 text-white/80 hover:text-white font-bold text-sm transition-colors"
                                >
                                    Iniciar Sesión
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="px-6 py-2 bg-primary hover:bg-orange-500 text-white font-bold text-sm rounded-lg transition-colors"
                                >
                                    Registrarse
                                </Link>
                            </div>
                        )}
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col md:flex-row px-4 md:px-10 py-8 md:py-0 items-center justify-between relative z-10 gap-8 md:gap-0">
                    {/* Left: Hero Text */}
                    <div className="max-w-lg flex flex-col gap-6 md:gap-8 text-left">
                        <div className="flex flex-col">
                            <span className="text-xs md:text-sm font-black text-primary tracking-[0.4em] md:tracking-[0.6em] uppercase mb-3 md:mb-4 animate-pulse">Prepárate Para el Combate</span>
                            <h1 className="text-4xl md:text-6xl lg:text-8xl font-black italic tracking-tighter uppercase leading-[1.3] text-white drop-shadow-[0_0_30px_rgba(249,122,31,0.3)] pb-4 md:pb-8">
                                DRAGON<br/>
                                <span className="inline-block text-transparent bg-clip-text bg-gradient-to-b from-primary to-orange-700 py-2 overflow-visible">CHESS</span>
                            </h1>
                            <p className="mt-4 md:mt-6 text-white/50 text-sm font-medium leading-relaxed max-w-sm">
                                El campo de batalla de ajedrez definitivo. Elige tu guerrero, domina tu Ki y conquista la arena.
                            </p>
                        </div>
                        
                        <div className="flex items-center">
                            <ElectricBorder color="#F97A1F" speed={1.5} chaos={0.15} className="w-full md:w-auto" active={true}>
                                <Link 
                                    href={auth.user ? route('game.mode') : route('login')}
                                    className="group relative bg-primary h-16 md:h-20 px-10 md:px-14 rounded-2xl flex items-center gap-3 md:gap-4 shadow-[0_15px_30px_rgba(249,122,31,0.3)] hover:shadow-[0_20px_40px_rgba(249,122,31,0.4)] transition-all hover:-translate-y-1 active:scale-95 overflow-hidden w-full md:w-auto justify-center"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                    <span className="text-xl md:text-2xl font-black italic tracking-tighter uppercase relative z-10">Entrar a Batalla</span>
                                    <FireIcon className="w-7 h-7 md:w-8 md:h-8 rotate-45 group-hover:rotate-90 transition-transform relative z-10" />
                                </Link>
                            </ElectricBorder>
                        </div>
                    </div>

                    {/* Right: Featured Event & Stats */}
                    {auth.user && (
                        <div className="w-full md:w-80 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col items-center">
                                    <span className="text-3xl font-black text-primary italic leading-none">{stats?.victories || 0}</span>
                                    <span className="text-[10px] font-black uppercase text-white/40 tracking-widest mt-2">Victorias</span>
                                </div>
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col items-center">
                                    <span className="text-3xl font-black text-yellow-500 italic leading-none">{stats?.ki?.toLocaleString() || 0}</span>
                                    <span className="text-[10px] font-black uppercase text-white/40 tracking-widest mt-2">Ki</span>
                                </div>
                            </div>
                        </div>
                    )}
                </main>

                {/* Subtle Footer Bar */}
            
            </div>
        </>
    );
}
