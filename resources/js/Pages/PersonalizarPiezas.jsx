import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    LockClosedIcon,
    SparklesIcon,
    BoltIcon,
    TrophyIcon,
    FireIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/solid';
import AppNavBar from '@/Components/AppNavBar';
import {
    ALL_CHARACTERS,
    PIECE_TYPES,
    PIECE_TYPE_DISPLAY,
    FACTION_DISPLAY,
    isUnlocked,
    resolveCharacterImageUrl,
} from '@/data/characters';

const FACTIONS = ['guerreros', 'villanos'];

const PIECE_TYPE_ICONS = {
    rey: TrophyIcon,
    reina: SparklesIcon,
    torre: FireIcon,
    caballo: BoltIcon,
    alfil: SparklesIcon,
    peon: CheckCircleIcon,
};

export default function PersonalizarPiezas({ auth, stats, currentPreferences, unlock_all }) {
    const [selectedFaction, setSelectedFaction] = useState('guerreros');
    const [expandedPiece, setExpandedPiece] = useState(null);

    const unlockedIds = stats?.unlocked_characters ?? [];

    const { data, setData, patch, processing } = useForm({
        piece_preferences: currentPreferences || {
            guerreros: { rey: null, reina: null, torre: null, caballo: null, alfil: null, peon: null },
            villanos:  { rey: null, reina: null, torre: null, caballo: null, alfil: null, peon: null },
        },
    });

    // Obtener personajes de characters.js para una facción+tipo
    function getCharsFor(faction, pieceType) {
        return ALL_CHARACTERS.filter(c => c.faction === faction && c.pieceType === pieceType);
    }

    function selectPiece(pieceType, character) {
        if (!isUnlocked(character.id, unlockedIds, unlock_all)) return;
        setData('piece_preferences', {
            ...data.piece_preferences,
            [selectedFaction]: {
                ...data.piece_preferences[selectedFaction],
                [pieceType]: character.id,
            },
        });
    }

    function handleSubmit(e) {
        e.preventDefault();
        patch(route('pieces.update'));
    }

    const currentPref = data.piece_preferences[selectedFaction] || {};

    const selectedFactionStyles = selectedFaction === 'guerreros'
        ? {
            tab: 'bg-blue-500/20 text-blue-200 border-blue-400/40 shadow-[0_0_24px_rgba(59,130,246,0.25)]',
            chip: 'text-blue-300 bg-blue-500/10 border-blue-400/30',
            ring: 'ring-blue-400',
            hoverRing: 'hover:ring-blue-300/50',
            save: 'bg-blue-500 hover:bg-blue-400',
          }
        : {
            tab: 'bg-red-500/20 text-red-200 border-red-400/40 shadow-[0_0_24px_rgba(248,113,113,0.25)]',
            chip: 'text-red-300 bg-red-500/10 border-red-400/30',
            ring: 'ring-red-400',
            hoverRing: 'hover:ring-red-300/50',
            save: 'bg-red-500 hover:bg-red-400',
          };

    return (
        <>
            <Head title="Personalizar Piezas" />
            <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(239,68,68,0.14),transparent_35%),linear-gradient(135deg,#0f1117_0%,#161a22_45%,#10131a_100%)] text-white">
                <AppNavBar auth={auth} stats={stats} />

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="mb-8 rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl p-5 md:p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">Personalizar Piezas</h1>
                                <p className="text-white/60 text-sm md:text-base">
                                    Elige el personaje de cada pieza para tu escuadron en batalla.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 w-full md:w-auto">
                                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                                    <p className="text-[10px] uppercase tracking-widest text-white/40">Desbloqueados</p>
                                    <p className="text-sm font-black text-white">{unlockedIds.length}</p>
                                </div>
                                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                                    <p className="text-[10px] uppercase tracking-widest text-white/40">Modo</p>
                                    <p className="text-sm font-black text-white">{unlock_all ? 'Unlock All' : 'Progreso'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Selector de facción */}
                    <div className="grid grid-cols-2 gap-3 mb-8">
                        {FACTIONS.map(f => (
                            <button
                                key={f}
                                onClick={() => { setSelectedFaction(f); setExpandedPiece(null); }}
                                className={`px-6 py-3 rounded-xl border font-black tracking-wide uppercase transition-all ${
                                    selectedFaction === f
                                        ? selectedFactionStyles.tab
                                        : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                {FACTION_DISPLAY[f]}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            {PIECE_TYPES.map(pieceType => {
                                const chars = getCharsFor(selectedFaction, pieceType);
                                const selectedValue = currentPref[pieceType];
                                const selectedChar = ALL_CHARACTERS.find(c => c.id === selectedValue)
                                    || ALL_CHARACTERS.find(c => c.path === selectedValue);
                                const isExpanded = expandedPiece === pieceType;
                                const PieceIcon = PIECE_TYPE_ICONS[pieceType] || SparklesIcon;

                                return (
                                    <div
                                        key={pieceType}
                                        className="rounded-2xl overflow-hidden border border-white/10 bg-black/25 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
                                    >
                                        {/* Header del tipo de pieza */}
                                        <button
                                            type="button"
                                            className="w-full flex items-center gap-4 p-4 md:p-5 hover:bg-white/5 transition-colors text-left"
                                            onClick={() => setExpandedPiece(isExpanded ? null : pieceType)}
                                        >
                                            <div className={`w-10 h-10 rounded-xl border ${selectedFactionStyles.chip} flex items-center justify-center`}>
                                                <PieceIcon className="w-5 h-5" />
                                            </div>
                                            {selectedChar ? (
                                                <img
                                                    src={resolveCharacterImageUrl(selectedChar.id)}
                                                    alt={selectedChar.displayName}
                                                    className="w-12 h-12 rounded-xl object-cover border-2 border-white/20"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 text-xs">
                                                    <PieceIcon className="w-5 h-5" />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <p className="font-black text-white uppercase tracking-wide">{PIECE_TYPE_DISPLAY[pieceType]}</p>
                                                <p className="text-sm text-white/60">
                                                    {selectedChar ? selectedChar.displayName : 'Ninguno seleccionado'}
                                                </p>
                                            </div>
                                            {isExpanded ? (
                                                <ChevronUpIcon className="w-5 h-5 text-white/50" />
                                            ) : (
                                                <ChevronDownIcon className="w-5 h-5 text-white/50" />
                                            )}
                                        </button>

                                        {/* Galería de personajes */}
                                        {isExpanded && (
                                            <div className="border-t border-white/10 p-4 md:p-5">
                                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                                                    {chars.map(character => {
                                                        const unlocked = isUnlocked(character.id, unlockedIds, unlock_all);
                                                        const isSelected = selectedValue === character.id || selectedValue === character.path;

                                                        return (
                                                            <button
                                                                key={character.id}
                                                                type="button"
                                                                disabled={!unlocked}
                                                                title={unlocked ? character.displayName : `Bloqueado — ${character.displayName}`}
                                                                onClick={() => selectPiece(pieceType, character)}
                                                                className={`relative rounded-xl overflow-hidden transition-all aspect-square ring-1 ring-white/10 ${
                                                                    isSelected
                                                                        ? `ring-2 ${selectedFactionStyles.ring} scale-[1.03]`
                                                                        : unlocked
                                                                            ? `${selectedFactionStyles.hoverRing} hover:ring-2 hover:scale-[1.03]`
                                                                            : 'cursor-not-allowed opacity-50'
                                                                }`}
                                                            >
                                                                <img
                                                                    src={resolveCharacterImageUrl(character.id)}
                                                                    alt={character.displayName}
                                                                    className={`w-full h-full object-cover ${!unlocked ? 'grayscale brightness-50' : ''}`}
                                                                />
                                                                {!unlocked && (
                                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                                        <LockClosedIcon className="w-5 h-5 text-white/80 drop-shadow" />
                                                                    </div>
                                                                )}
                                                                {isSelected && (
                                                                    <div className="absolute inset-0 bg-black/10 flex items-end justify-center pb-1.5">
                                                                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md border ${selectedFactionStyles.chip}`}>
                                                                            Seleccionada
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className={`px-8 py-3.5 ${selectedFactionStyles.save} disabled:opacity-50 rounded-xl font-black uppercase tracking-wider text-white transition-colors shadow-[0_8px_24px_rgba(0,0,0,0.35)] inline-flex items-center gap-2`}
                            >
                                <CheckCircleIcon className="w-5 h-5" />
                                {processing ? 'Guardando...' : 'Guardar preferencias'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
