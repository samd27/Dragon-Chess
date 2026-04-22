import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    FireIcon,
    UsersIcon,
    ShoppingBagIcon,
    Bars3Icon,
    XMarkIcon,
    UserIcon,
    ArrowRightOnRectangleIcon,
    TrophyIcon,
    BoltIcon,
    SparklesIcon,
} from '@heroicons/react/24/solid';
import { resolveCharacterImageUrl } from '@/data/characters';

/**
 * Calcula el nivel a partir de la experiencia (debe coincidir con la lógica del backend).
 * level = floor(sqrt(experience / 80)) + 1
 */
function calcLevel(experience = 0) {
    return Math.floor(Math.sqrt(experience / 80)) + 1;
}

/**
 * Progreso dentro del nivel actual (0–100).
 */
function calcLevelProgress(experience = 0) {
    const level       = calcLevel(experience);
    const prevExp     = Math.pow(level - 1, 2) * 80;
    const nextExp     = Math.pow(level, 2) * 80;
    const span        = nextExp - prevExp;
    if (span <= 0) return 100;
    return Math.min(100, Math.round(((experience - prevExp) / span) * 100));
}

export default function AppNavBar({ auth, stats }) {
    const [showDropdown, setShowDropdown]   = useState(false);
    const [showSidebar, setShowSidebar]     = useState(false);
    const { url }                           = usePage();

    const experience  = stats?.experience  ?? 0;
    const senzuSeeds  = stats?.senzu_seeds ?? 0;
    const ki          = stats?.ki          ?? 0;
    const level       = stats?.level       ?? calcLevel(experience);
    const progress    = calcLevelProgress(experience);

    const player = {
        name:   auth?.user?.name   || 'Guerrero',
        avatar: resolveCharacterImageUrl(auth?.user?.avatar || 'guerreros/torre/Goku'),
    };

    // Determinar sección activa basada en la URL actual
    const isActive = (path) => url.startsWith(path);

    const navLinks = [
        {
            label:  'BATALLA',
            href:   route('welcome'),
            icon:   FireIcon,
            active: url === '/',
            color:  'text-primary',
        },
        {
            label:  'PIEZAS',
            href:   route('pieces.index'),
            icon:   UsersIcon,
            active: isActive('/pieces'),
            color:  'text-blue-400',
        },
        {
            label:  'TIENDA',
            href:   route('shop.index'),
            icon:   ShoppingBagIcon,
            active: isActive('/shop'),
            color:  'text-green-400',
        },
        {
            label:  'PASE',
            href:   route('battle.pass'),
            icon:   TrophyIcon,
            active: isActive('/battle-pass'),
            color:  'text-yellow-400',
        },
    ];

    return (
        <>
        <header className="fixed top-0 inset-x-0 flex items-center justify-between px-4 md:px-10 py-4 z-[60] bg-black/70 backdrop-blur-xl border-b border-white/10 flex-shrink-0">
            {/* ── Izquierda: Logo + Nav ── */}
            <div className="flex items-center gap-4 md:gap-8">
                {/* Logo */}
                <Link href={route('welcome')} className="flex flex-col gap-0.5 transform -rotate-2 flex-shrink-0">
                    <h2 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase leading-none text-white">
                        D <span className="text-primary">CHESS</span>
                    </h2>
                    <div className="h-[2px] w-full bg-gradient-to-r from-primary to-transparent"></div>
                </Link>

                {/* Nav Desktop */}
                {auth?.user && (
                    <nav className="hidden md:flex items-center gap-6">
                        {navLinks.map(({ label, href, icon: Icon, active, color }) => (
                            <Link
                                key={label}
                                href={href}
                                className={`font-black uppercase text-xs tracking-widest flex items-center gap-1.5 transition-colors ${
                                    active ? color : 'text-white/40 hover:text-white'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {label}
                            </Link>
                        ))}
                    </nav>
                )}
            </div>

            {/* ── Derecha: Stats + Avatar ── */}
            {auth?.user ? (
                <div className="flex items-center gap-3 md:gap-4">

                    {/* Senzu Seeds — desktop */}
                    <div className="hidden md:flex items-center gap-1.5 bg-black/30 border border-white/10 rounded-full px-3 py-1.5">
                        <SparklesIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-white text-xs font-black tabular-nums">{senzuSeeds.toLocaleString()}</span>
                    </div>

                    {/* EXP / Nivel — desktop */}
                    <div className="hidden md:flex flex-col gap-0.5 min-w-[90px]">
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                                Nv {level}
                            </span>
                            <span className="text-[9px] text-white/40 font-bold tabular-nums">{progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-orange-400 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="flex items-center gap-1">
                            <BoltIcon className="w-3 h-3 text-yellow-400" />
                            <span className="text-[9px] text-white/40 tabular-nums">{ki.toLocaleString()} Ki</span>
                        </div>
                    </div>

                    {/* Avatar + Dropdown — desktop */}
                    <div className="hidden md:block relative z-50">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center gap-2 bg-black/40 rounded-full pl-1 pr-3 py-1 border border-white/10 shadow-xl hover:border-primary/50 transition-all"
                        >
                            <img
                                src={player.avatar}
                                alt="Avatar"
                                className="w-9 h-9 rounded-full border-2 border-primary object-cover"
                            />
                            <div className="flex flex-col leading-none">
                                <span className="text-[9px] text-primary font-black uppercase tracking-widest mb-0.5">
                                    Lvl {level}
                                </span>
                                <span className="text-white text-[11px] font-bold">{player.name}</span>
                            </div>
                        </button>

                        {showDropdown && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                                <div className="absolute right-0 mt-2 w-52 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                                    {/* Mini stats en dropdown */}
                                    <div className="px-4 py-3 border-b border-white/10 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-white/50 uppercase tracking-widest">Ki</span>
                                            <span className="text-yellow-400 text-xs font-black tabular-nums">{ki.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-white/50 uppercase tracking-widest">Semillas Senzu</span>
                                            <span className="text-green-400 text-xs font-black tabular-nums">{senzuSeeds.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <Link
                                        href={route('profile.edit')}
                                        className="flex items-center gap-2 w-full text-left px-4 py-3 text-white hover:bg-primary/10 transition-colors text-sm font-medium border-b border-white/10"
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        <UserIcon className="w-4 h-4 text-primary" />
                                        Personalizar Perfil
                                    </Link>
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        type="button"
                                        className="flex items-center gap-2 w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        <ArrowRightOnRectangleIcon className="w-4 h-4" />
                                        Cerrar Sesión
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Hamburger — mobile */}
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
                            <div
                                className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9998] md:hidden"
                                onClick={() => setShowSidebar(false)}
                            />
                            <div className="fixed top-0 right-0 h-screen w-72 bg-gradient-to-b from-[#1a1b1e] to-[#0d0e12] border-l border-white/10 shadow-2xl z-[9999] md:hidden overflow-hidden">
                                <button
                                    onClick={() => setShowSidebar(false)}
                                    className="absolute top-4 right-4 p-2 text-white/60 hover:text-white transition-colors z-10"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>

                                <div className="flex flex-col h-full p-6 pt-16 overflow-y-auto pb-6">
                                    {/* User Info */}
                                    <div className="flex flex-col items-center pb-6 border-b border-white/10">
                                        <img
                                            src={player.avatar}
                                            alt="Avatar"
                                            className="w-20 h-20 rounded-full border-4 border-primary object-cover mb-3 shadow-lg"
                                        />
                                        <span className="text-primary font-black uppercase text-xs tracking-widest mb-1">
                                            Nivel {level}
                                        </span>
                                        <span className="text-white text-lg font-black mb-3">{player.name}</span>

                                        {/* EXP Bar móvil */}
                                        <div className="w-full space-y-1">
                                            <div className="flex justify-between text-[10px] text-white/40">
                                                <span>EXP</span>
                                                <span>{progress}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-primary to-orange-400 rounded-full transition-all duration-500"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="py-5 border-b border-white/10 grid grid-cols-2 gap-3">
                                        <div className="bg-white/5 rounded-xl p-3 flex flex-col items-center border border-white/10">
                                            <BoltIcon className="w-5 h-5 text-yellow-400 mb-1" />
                                            <span className="text-yellow-400 font-black text-base tabular-nums">{ki.toLocaleString()}</span>
                                            <span className="text-[9px] text-white/40 uppercase tracking-widest">Ki</span>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-3 flex flex-col items-center border border-white/10">
                                            <SparklesIcon className="w-5 h-5 text-green-400 mb-1" />
                                            <span className="text-green-400 font-black text-base tabular-nums">{senzuSeeds.toLocaleString()}</span>
                                            <span className="text-[9px] text-white/40 uppercase tracking-widest">Semillas</span>
                                        </div>
                                    </div>

                                    {/* Nav Links */}
                                    <div className="py-5 border-b border-white/10 space-y-1">
                                        {navLinks.map(({ label, href, icon: Icon, active, color }) => (
                                            <Link
                                                key={label}
                                                href={href}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                                                    active
                                                        ? 'bg-white/10 ' + color
                                                        : 'text-white hover:bg-white/5'
                                                }`}
                                                onClick={() => setShowSidebar(false)}
                                            >
                                                <Icon className={`w-5 h-5 ${active ? color : 'text-white/60'}`} />
                                                <span className="font-bold">{label}</span>
                                            </Link>
                                        ))}
                                    </div>

                                    {/* Actions */}
                                    <div className="py-5 space-y-1">
                                        <Link
                                            href={route('profile.edit')}
                                            className="flex items-center gap-3 px-4 py-3 text-white hover:bg-primary/10 rounded-xl transition-colors"
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
                                            className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors w-full text-left"
                                            onClick={() => setShowSidebar(false)}
                                        >
                                            <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                            <span className="font-bold">Cerrar Sesión</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
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
        </header>
        <div className="h-[76px] md:h-[84px] flex-shrink-0" />
        </>
    );
}
