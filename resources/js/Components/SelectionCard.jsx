import React from 'react';

export default function SelectionCard({ 
    Icon, 
    title, 
    description, 
    tagText, 
    isSelected, 
    onClick, 
    colorClass = 'primary', 
    checkIcon = '✓',
    TagIcon = null 
}) {
    // Map of colors for dynamic Tailwind styling
    const colorMap = {
        primary: {
            borderAndRing: 'border-primary ring-8 ring-primary/10 bg-primary/10',
            text: 'text-primary',
            bg: 'bg-primary'
        },
        purple: {
            borderAndRing: 'border-purple-500 ring-8 ring-purple-500/10 bg-purple-500/10',
            text: 'text-purple-400',
            bg: 'bg-purple-400'
        }
    };

    const activeColor = colorMap[colorClass];

    return (
        <div 
            onClick={onClick}
            className={`relative group rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 border-4 p-4 md:p-10 lg:p-12 ${
                isSelected 
                    ? `${activeColor.borderAndRing} scale-100` 
                    : 'border-white/5 opacity-60 hover:opacity-80 scale-[0.98] bg-white/5'
            }`}
        >
            <div className="relative z-10 space-y-4 md:space-y-6">
                <Icon className="w-12 h-12 md:w-16 lg:w-20 md:h-16 lg:h-20 text-white" />
                <div>
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-black italic tracking-tighter uppercase leading-none text-white mb-2 md:mb-3 whitespace-pre-line">
                        {title}
                    </h3>
                    <p className="text-white/60 text-sm md:text-base font-medium leading-relaxed">
                        {description}
                    </p>
                </div>
                <div className={`flex items-center gap-2 text-xs md:text-sm font-black uppercase tracking-widest ${
                    isSelected ? activeColor.text : 'text-white/40'
                }`}>
                    {TagIcon ? (
                        <TagIcon className="w-4 h-4" />
                    ) : (
                        <span className={`w-2 h-2 rounded-full ${isSelected ? `${activeColor.bg} animate-pulse` : 'bg-white/40'}`}></span>
                    )}
                    {tagText}
                </div>
            </div>
            {isSelected && (
                <div className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center ${colorClass === 'primary' ? 'bg-primary' : 'bg-purple-500'}`}>
                    <span className="text-white text-xl font-bold">{checkIcon}</span>
                </div>
            )}
        </div>
    );
}