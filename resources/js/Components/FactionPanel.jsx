import React from 'react';

export default function FactionPanel({ title, subtitle, imageSrc, isSelected, onClick, factionType }) {
    const colorClasses = factionType === 'Z_WARRIORS' 
        ? {
            border: 'border-primary ring-8 ring-primary/10',
            bgGradient: 'from-orange-500 to-orange-700',
            textTitle: 'text-white',
            textSubtitle: 'text-primary'
        }
        : {
            border: 'border-purple-500 ring-8 ring-purple-500/10',
            bgGradient: 'from-purple-600 to-purple-900',
            textTitle: 'text-white',
            textSubtitle: 'text-purple-400'
        };

    return (
        <div 
            onClick={onClick}
            className={`relative group rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 border-4 ${
                isSelected 
                    ? `${colorClasses.border} scale-100` 
                    : 'border-white/5 opacity-40 grayscale hover:opacity-80 scale-[0.98]'
            }`}
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses.bgGradient}`}></div>
            <img 
                src={imageSrc} 
                alt={title} 
                className="absolute inset-0 w-full h-full object-contain object-bottom transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            <div className="absolute bottom-4 md:bottom-10 left-4 md:left-10 right-4 md:right-10">
                <h3 className={`text-2xl md:text-5xl font-black italic tracking-tighter uppercase leading-none drop-shadow-xl ${colorClasses.textTitle}`}>
                    {title}
                </h3>
                <p className={`text-[10px] md:text-sm font-bold tracking-[0.3em] md:tracking-[0.4em] uppercase mt-1 md:mt-2 ${colorClasses.textSubtitle}`}>
                    {subtitle}
                </p>
            </div>
        </div>
    );
}