import { Link } from '@inertiajs/react';
import { XMarkIcon, UserIcon, ArrowRightOnRectangleIcon, BoltIcon, SparklesIcon } from '@heroicons/react/24/solid';

export default function NavBarMobileSidebar({ 
    player, 
    level, 
    progress, 
    ki, 
    senzuSeeds, 
    navLinks,
    showSidebar,
    setShowSidebar 
}) {
    if (!showSidebar) return null;

    return (
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
    );
}