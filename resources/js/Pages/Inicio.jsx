import { Head, Link } from '@inertiajs/react';
import { FireIcon, BoltIcon, SparklesIcon } from '@heroicons/react/24/solid';
import ElectricBorder from '@/Components/ElectricBorder';
import AppNavBar from '@/Components/AppNavBar';

export default function Welcome({ auth, stats }) {

    return (
        <>
            <Head title="Dragon Chess - Prepare for Impact" />
            <div className="flex flex-col h-screen relative overflow-hidden bg-gradient-to-br from-[#0d0e12] via-[#1a1b1e] to-[#0d0e12]">
                {/* Decorative Aura */}
                <div className="absolute -top-40 -right-40 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
                <div className="absolute -bottom-40 -left-40 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-secondary/5 blur-[120px] rounded-full pointer-events-none"></div>

                {/* Top Navigation Bar */}
                <AppNavBar auth={auth} stats={stats} />

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
                                <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col items-center">
                                    <span className="text-3xl font-black text-primary italic leading-none">{stats?.victories || 0}</span>
                                    <span className="text-[10px] font-black uppercase text-white/40 tracking-widest mt-2">Victorias</span>
                                </div>
                                <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col items-center">
                                    <div className="flex items-center gap-1">
                                        <BoltIcon className="w-5 h-5 text-yellow-400" />
                                        <span className="text-3xl font-black text-yellow-500 italic leading-none">{stats?.ki?.toLocaleString() || 0}</span>
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-white/40 tracking-widest mt-2">Ki</span>
                                </div>
                                <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col items-center">
                                    <span className="text-3xl font-black text-orange-400 italic leading-none">{stats?.experience?.toLocaleString() || 0}</span>
                                    <span className="text-[10px] font-black uppercase text-white/40 tracking-widest mt-2">Experiencia</span>
                                </div>
                                <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col items-center">
                                    <div className="flex items-center gap-1">
                                        <SparklesIcon className="w-5 h-5 text-green-400" />
                                        <span className="text-3xl font-black text-green-400 italic leading-none">{stats?.senzu_seeds?.toLocaleString() || 0}</span>
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-white/40 tracking-widest mt-2">Semillas Senzu</span>
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
