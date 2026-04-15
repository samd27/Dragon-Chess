import { Link } from '@inertiajs/react';

export default function AuthLayout({ 
    children, 
    title, 
    subtitle,
    brandTitle = "DRAGON",
    brandHighlight = "CHESS",
    brandDescription = "El campo de batalla definitivo de ajedrez de alto riesgo. Elige tu guerrero, domina tu Ki y conquista la arena.",
    primaryColorClass = "text-primary",
    gradientClass = "from-primary",
    aura1Class = "bg-primary/10",
    aura2Class = "bg-secondary/5"
}) {
    return (
        <div className="flex flex-col md:flex-row min-h-screen relative overflow-hidden bg-gradient-to-br from-[#0d0e12] via-[#1a1b1e] to-[#0d0e12]">
            {/* Decorative Aura */}
            <div className={`absolute -top-40 -right-40 w-[600px] h-[600px] ${aura1Class} blur-[120px] rounded-full pointer-events-none`}></div>
            <div className={`absolute -bottom-40 -left-40 w-[600px] h-[600px] ${aura2Class} blur-[120px] rounded-full pointer-events-none`}></div>

            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-20">
                <div className="relative z-10 max-w-md">
                    <div className="flex flex-col gap-0.5 transform -rotate-2 mb-8">
                        <h2 className="text-6xl font-black italic tracking-tighter uppercase leading-none text-white">
                            {brandTitle}<br/>
                            <span className={primaryColorClass}>{brandHighlight}</span>
                        </h2>
                        <div className={`h-[3px] w-full bg-gradient-to-r ${gradientClass} to-transparent`}></div>
                    </div>
                    <p className="text-white/50 text-lg font-medium leading-relaxed">
                        {brandDescription}
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-4 md:p-8 relative z-10">
                <div className="w-full max-w-md">
                    <Link href={route('welcome')} className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6 md:mb-8">
                        <span className="text-lg md:text-xl">←</span>
                        <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Volver a la Arena</span>
                    </Link>

                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl">
                        {title && (
                            <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase text-white mb-2">
                                {title}
                            </h1>
                        )}
                        {subtitle && (
                            <p className="text-white/40 text-xs md:text-sm mb-6 md:mb-8">{subtitle}</p>
                        )}
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}