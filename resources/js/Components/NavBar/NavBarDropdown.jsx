import { Link } from '@inertiajs/react';
import { UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';

export default function NavBarDropdown({ 
    player, 
    level, 
    ki, 
    senzuSeeds, 
    showDropdown, 
    setShowDropdown 
}) {
    return (
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
    );
}