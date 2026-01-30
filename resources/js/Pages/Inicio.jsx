import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }) {
    const player = {
        name: auth.user?.name || 'Kakarot_99',
        level: 54,
        avatar: 'https://i.pravatar.cc/150?u=player',
    };

    return (
        <>
            <Head title="Dragon Chess - Prepare for Impact" />
            <div className="flex flex-col h-screen relative overflow-hidden bg-gradient-to-br from-[#0d0e12] via-[#1a1b1e] to-[#0d0e12]">
                {/* Decorative Aura */}
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
                <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-secondary/5 blur-[120px] rounded-full pointer-events-none"></div>

                {/* Top Navigation Bar */}
                <header className="flex items-center justify-between px-10 py-6 relative z-10 bg-black/20 backdrop-blur-lg border-b border-white/5">
                    <div className="flex items-center gap-10">
                        <div className="flex flex-col gap-0.5 transform -rotate-2">
                            <h2 className="text-2xl font-black italic tracking-tighter uppercase leading-none text-white">
                                DB <span className="text-primary">ARENA</span>
                            </h2>
                            <div className="h-[2px] w-full bg-gradient-to-r from-primary to-transparent"></div>
                        </div>
                        <nav className="hidden md:flex items-center gap-8">
                            <button className="text-primary font-black uppercase text-xs tracking-widest flex items-center gap-2">
                                <span className="text-sm">⚔️</span> BATTLE
                            </button>
                            <button className="text-white/40 hover:text-white font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-colors">
                                <span className="text-sm">👥</span> ALLIANCE
                            </button>
                            <button className="text-white/40 hover:text-white font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-colors">
                                <span className="text-sm">🏪</span> BAZAAR
                            </button>
                        </nav>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                            <span className="text-primary font-black tracking-tighter">9,000</span>
                            <span className="text-sm text-yellow-400">⭐</span>
                        </div>
                        {auth.user ? (
                            <div className="flex items-center gap-3 bg-black/40 rounded-full pl-1 pr-4 py-1 border border-white/10 shadow-xl">
                                <img src={player.avatar} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-primary object-cover" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-primary font-black uppercase tracking-widest leading-none mb-0.5">Lvl {player.level}</span>
                                    <span className="text-white text-xs font-bold leading-none">{player.name}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    href={route('login')}
                                    className="px-4 py-2 text-white/80 hover:text-white font-bold text-sm transition-colors"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="px-6 py-2 bg-primary hover:bg-orange-500 text-white font-bold text-sm rounded-lg transition-colors"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 flex px-10 items-center justify-between relative z-10">
                    {/* Left: Hero Text */}
                    <div className="max-w-lg flex flex-col gap-8 text-left">
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-primary tracking-[0.6em] uppercase mb-4 animate-pulse">Prepare for Impact</span>
                            <h1 className="text-8xl font-black italic tracking-tighter uppercase leading-[0.8] text-white drop-shadow-[0_0_30px_rgba(249,122,31,0.3)]">
                                DRAGON<br/>
                                <span className="text-transparent bg-clip-text bg-gradient-to-b from-primary to-orange-700">CHESS</span>
                            </h1>
                            <p className="mt-6 text-white/50 text-sm font-medium leading-relaxed max-w-sm">
                                The ultimate high-stakes chess battleground. Choose your warrior, master your Ki, and dominate the arena.
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <Link 
                                href={route('faction.select')}
                                className="group relative bg-primary h-16 px-10 rounded-2xl flex items-center gap-4 shadow-[0_15px_30px_rgba(249,122,31,0.3)] hover:shadow-[0_20px_40px_rgba(249,122,31,0.4)] transition-all hover:-translate-y-1 active:scale-95 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                <span className="text-xl font-black italic tracking-tighter uppercase relative z-10">Enter Battle</span>
                                <span className="text-2xl font-black rotate-45 group-hover:rotate-90 transition-transform relative z-10">⚔️</span>
                            </Link>
                            <button className="h-16 px-10 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors uppercase font-black italic tracking-tighter text-lg">
                                Training
                                <span>🤖</span>
                            </button>
                        </div>
                    </div>

                    {/* Right: Featured Event & Stats */}
                    <div className="w-80 space-y-6">
                        <div className="bg-[#1e1f26] border-2 border-yellow-500/30 rounded-3xl p-6 relative overflow-hidden group cursor-pointer hover:border-yellow-500/60 transition-all shadow-2xl">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="text-8xl text-yellow-500">🏆</span>
                            </div>
                            <div className="relative z-10">
                                <span className="text-[10px] font-black text-yellow-500 tracking-[0.3em] uppercase block mb-1">Live Event</span>
                                <h3 className="text-xl font-black italic tracking-tighter uppercase text-white mb-4 leading-tight">Cell Games<br/>Classic</h3>
                                <div className="flex items-center justify-between mt-6">
                                    <div className="flex -space-x-2">
                                        {[1,2,3].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-[#1e1f26] bg-gray-800 overflow-hidden">
                                                <img src={`https://i.pravatar.cc/100?u=${i}`} alt="" />
                                            </div>
                                        ))}
                                        <div className="w-8 h-8 rounded-full border-2 border-[#1e1f26] bg-gray-700 flex items-center justify-center text-[10px] font-bold">+24</div>
                                    </div>
                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Ongoing</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col items-center">
                                <span className="text-2xl font-black text-primary italic leading-none">542</span>
                                <span className="text-[9px] font-black uppercase text-white/40 tracking-widest mt-1">Wins</span>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col items-center">
                                <span className="text-2xl font-black text-secondary italic leading-none">128</span>
                                <span className="text-[9px] font-black uppercase text-white/40 tracking-widest mt-1">Rank</span>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Subtle Footer Bar */}
                <footer className="px-10 py-4 border-t border-white/5 flex items-center justify-between opacity-50 text-[9px] font-black uppercase tracking-[0.4em] text-white">
                    <span>Server Status: Synchronized</span>
                    <div className="flex items-center gap-6">
                        <a href="#" className="hover:text-primary transition-colors">Privacy Protocol</a>
                        <a href="#" className="hover:text-primary transition-colors">Combat Rules</a>
                        <span>© Capsule Corp 762</span>
                    </div>
                </footer>
            </div>
        </>
    );
}
