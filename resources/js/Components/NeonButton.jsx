import { Link } from '@inertiajs/react';

export default function NeonButton({ href, onClick, children, className = "" }) {
    const baseClasses = "group relative bg-primary h-16 md:h-20 rounded-2xl flex items-center justify-center gap-4 shadow-[0_0_20px_rgba(249,122,31,0.25),0_0_40px_rgba(249,122,31,0.1)] hover:shadow-[0_0_25px_rgba(249,122,31,0.35),0_0_50px_rgba(249,122,31,0.15)] transition-all hover:-translate-y-1 active:scale-95 overflow-hidden w-full " + className;
    
    const content = (
        <>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            {children}
        </>
    );

    if (href) {
        return <Link href={href} className={baseClasses}>{content}</Link>;
    }

    return <button onClick={onClick} className={baseClasses}>{content}</button>;
}