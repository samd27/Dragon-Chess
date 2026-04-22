export default function SurfaceSection({ title, subtitle, children, className = '' }) {
    return (
        <section className={`rounded-2xl border border-white/10 bg-black/25 backdrop-blur-xl ${className}`}>
            {(title || subtitle) && (
                <header className="px-5 md:px-6 pt-5 md:pt-6 pb-4 border-b border-white/10">
                    {title ? <h2 className="text-lg md:text-xl font-black tracking-tight text-white">{title}</h2> : null}
                    {subtitle ? <p className="text-sm text-white/55 mt-1">{subtitle}</p> : null}
                </header>
            )}
            <div className="p-5 md:p-6">{children}</div>
        </section>
    );
}