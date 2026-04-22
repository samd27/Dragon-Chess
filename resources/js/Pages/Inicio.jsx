import { Head, Link } from '@inertiajs/react';
import {
    FireIcon,
    BoltIcon,
    SparklesIcon,
    ShoppingBagIcon,
    UserCircleIcon,
    ArrowRightIcon,
} from '@heroicons/react/24/solid';
import ElectricBorder from '@/Components/ElectricBorder';
import AppNavBar from '@/Components/AppNavBar';
import HomeActionCard from '@/Components/HomeActionCard';
import HomeStatCard from '@/Components/HomeStatCard';

export default function Welcome({ auth, stats }) {
    const isAuthenticated = Boolean(auth?.user);
    const battleHref = isAuthenticated ? route('game.mode') : route('login');
    const shopHref = isAuthenticated ? route('shop.index') : route('login');
    const profileHref = isAuthenticated ? route('profile.edit') : route('login');

    const quickActions = [
        {
            title: 'Entrar a Batalla',
            description: 'Elige modo de juego y entra a la arena.',
            href: battleHref,
            Icon: FireIcon,
            tone: 'battle',
        },
        {
            title: 'Tienda',
            description: 'Compra personajes con Semillas Senzu.',
            href: shopHref,
            Icon: ShoppingBagIcon,
            tone: 'shop',
        },
        {
            title: 'Personalizar Perfil',
            description: 'Actualiza avatar y datos de jugador.',
            href: profileHref,
            Icon: UserCircleIcon,
            tone: 'profile',
        },
    ];

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
                                    href={battleHref}
                                    className="group relative bg-primary h-16 md:h-20 px-10 md:px-14 rounded-2xl flex items-center gap-3 md:gap-4 shadow-[0_15px_30px_rgba(249,122,31,0.3)] hover:shadow-[0_20px_40px_rgba(249,122,31,0.4)] transition-all hover:-translate-y-1 active:scale-95 overflow-hidden w-full md:w-auto justify-center"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                    <span className="text-xl md:text-2xl font-black italic tracking-tighter uppercase relative z-10">Entrar a Batalla</span>
                                    <FireIcon className="w-7 h-7 md:w-8 md:h-8 rotate-45 group-hover:rotate-90 transition-transform relative z-10" />
                                </Link>
                            </ElectricBorder>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {quickActions.map((action) => (
                                <HomeActionCard
                                    key={action.title}
                                    href={action.href}
                                    title={action.title}
                                    description={action.description}
                                    Icon={action.Icon}
                                    ArrowIcon={ArrowRightIcon}
                                    tone={action.tone}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Right: Featured Event & Stats */}
                    {isAuthenticated && (
                        <div className="w-full md:w-80 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <HomeStatCard
                                    label="Victorias"
                                    value={(stats?.victories || 0).toLocaleString()}
                                    tone="primary"
                                />
                                <HomeStatCard
                                    label="Ki"
                                    value={(stats?.ki || 0).toLocaleString()}
                                    tone="yellow"
                                    Icon={BoltIcon}
                                />
                                <HomeStatCard
                                    label="Experiencia"
                                    value={(stats?.experience || 0).toLocaleString()}
                                    tone="orange"
                                />
                                <HomeStatCard
                                    label="Semillas Senzu"
                                    value={(stats?.senzu_seeds || 0).toLocaleString()}
                                    tone="green"
                                    Icon={SparklesIcon}
                                />
                            </div>
                        </div>
                    )}
                </main>

                {/* Subtle Footer Bar */}
            
            </div>
        </>
    );
}
