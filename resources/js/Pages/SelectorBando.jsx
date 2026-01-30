import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function FactionSelector({ auth }) {
    const [selected, setSelected] = useState('Z_WARRIORS');

    return (
        <>
            <Head title="Choose Your Allegiance" />
            <div className="flex flex-col h-screen relative overflow-hidden bg-gradient-to-br from-[#0d0e12] via-[#1a1b1e] to-[#0d0e12]">
                <header className="px-10 py-6 flex items-center justify-between border-b border-white/5 relative z-10 bg-black/20">
                    <Link href={route('welcome')} className="flex items-center gap-2 group text-white/60 hover:text-white transition-colors">
                        <span className="text-xl transition-transform group-hover:-translate-x-1">←</span>
                        <span className="text-xs font-black uppercase tracking-widest">Abort Mission</span>
                    </Link>
                    <h2 className="text-xs font-black tracking-[0.5em] uppercase opacity-50 text-white">Operational Phase: Recruitment</h2>
                    <div className="w-24 h-[1px] bg-white/10"></div>
                </header>

                <div className="flex-1 flex gap-10 p-10 items-stretch">
                    {/* Left: Selection Column */}
                    <div className="w-1/3 flex flex-col justify-center gap-8">
                        <div className="space-y-2">
                            <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-tight text-white">Choose Your<br/><span className="text-primary">Allegiance</span></h1>
                            <p className="text-white/40 text-sm font-medium max-w-xs leading-relaxed">Your faction determines your battle perks and the warriors you'll command in the arena.</p>
                        </div>

                        <div className="space-y-4">
                            <div className={`p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${selected === 'Z_WARRIORS' ? 'bg-primary/10 border-primary shadow-neon-orange' : 'bg-white/5 border-white/10 opacity-60'}`}>
                                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                                    <span className="text-primary text-xl">🛡️</span>
                                </div>
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-widest mb-1 text-white">Saiyan Resilience</h4>
                                    <p className="text-[10px] opacity-70 leading-relaxed font-medium text-white/60">Your pieces gain defensive boost when standing near your King. A true Saiyan never gives up.</p>
                                </div>
                            </div>

                            <div className={`p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${selected === 'CONQUERORS' ? 'bg-secondary/10 border-secondary shadow-neon-blue' : 'bg-white/5 border-white/10 opacity-60'}`}>
                                <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0">
                                    <span className="text-secondary text-xl">💀</span>
                                </div>
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-widest mb-1 text-white">Galactic Domination</h4>
                                    <p className="text-[10px] opacity-70 leading-relaxed font-medium text-white/60">Gain a speed boost and extra Ki for every capture. Crushing enemies fuels your power.</p>
                                </div>
                            </div>
                        </div>

                        <Link 
                            href={route('game.arena', { faction: selected })}
                            className="w-full bg-primary h-16 rounded-2xl shadow-neon-orange font-black italic uppercase tracking-tighter text-2xl flex items-center justify-center gap-4 hover:bg-orange-500 transition-all active:scale-95 group"
                        >
                            Confirm Battle Plan
                            <span className="font-black group-hover:translate-x-2 transition-transform text-2xl">⚡</span>
                        </Link>
                    </div>

                    {/* Right: Large Vertical Selection Panels */}
                    <div className="flex-1 grid grid-cols-2 gap-6 items-stretch">
                        {/* Z-Warriors Large Panel */}
                        <div 
                            onClick={() => setSelected('Z_WARRIORS')}
                            className={`relative group rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 border-4 ${selected === 'Z_WARRIORS' ? 'border-primary ring-8 ring-primary/10 scale-100' : 'border-white/5 opacity-40 grayscale hover:opacity-80 scale-[0.98]'}`}
                        >
                            <img 
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvuxTmZ3Mog-ggz7sN1qzhBlSny4kvG5rKUL7hr51qzl2JY8XhZnHAh6H_Vqkk8HsGQnBpr-KEBe5V2qFWCkc9BJ27kZfB89RSKVXtdJWpJYMCoeqmraqtfKOH4vt61L3BkRpK2xNi07EqGvkM8f8IfzQhMlbI0m62QjqOTasLqcBcBZaEmIbPBbQ1EflFmECdh3Afucem3kPGsUiOxCQpM9g8Gj3q0Nq44xpsq3usJQhl4_ydQvklU4Z6E36yh8rDnyUyBBHtX7c" 
                                alt="Z-Warriors" 
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                            <div className="absolute bottom-10 left-10 right-10">
                                <h3 className="text-5xl font-black italic tracking-tighter uppercase leading-none drop-shadow-xl text-white">Z-WARRIORS</h3>
                                <p className="text-sm font-bold text-primary tracking-[0.4em] uppercase mt-2">Guardians of Earth</p>
                            </div>
                        </div>

                        {/* Conquerors Large Panel */}
                        <div 
                            onClick={() => setSelected('CONQUERORS')}
                            className={`relative group rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 border-4 ${selected === 'CONQUERORS' ? 'border-secondary ring-8 ring-secondary/10 scale-100' : 'border-white/5 opacity-40 grayscale hover:opacity-80 scale-[0.98]'}`}
                        >
                            <img 
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMWPpvubC6zTDVRN3hLAL8vEFEAPVeAHqiMQmBwiFp8JO98acCA4bOTPnG9-mkSO3zqvZIvvp2EsWgnrdSu8aNiY86wCbx_sZH6Tp_QgzNcyhY0Jn7TWtS59ZxQMmQ_86VFnb_oY5gXB0v0sGdOnZBtNvNm1BeTbHXA15Nj3Euuo2xyXUme4WwNtQsdPhrIrbv8aeSmBCzRRNp3Qoq2gGWMawmmgXRneoXUGz2i2bonMyS2tRwkss7GwlrBiSD1ogRDFEjNpG5Kt8" 
                                alt="Conquerors" 
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                            <div className="absolute bottom-10 left-10 right-10">
                                <h3 className="text-5xl font-black italic tracking-tighter uppercase leading-none drop-shadow-xl text-white">CONQUERORS</h3>
                                <p className="text-sm font-bold text-secondary tracking-[0.4em] uppercase mt-2">Destroyers of Worlds</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
