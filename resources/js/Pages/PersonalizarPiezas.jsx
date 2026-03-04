import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { LockClosedIcon } from '@heroicons/react/24/solid';
import AppNavBar from '@/Components/AppNavBar';
import {
    ALL_CHARACTERS,
    PIECE_TYPES,
    PIECE_TYPE_DISPLAY,
    FACTION_DISPLAY,
    isUnlocked,
} from '@/data/characters';

const FACTIONS = ['guerreros', 'villanos'];

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
                [pieceType]: character.path, // guardar ruta completa para Batalla.jsx
            },
        });
    }

    function handleSubmit(e) {
        e.preventDefault();
        patch(route('pieces.update'));
    }

    const currentPref = data.piece_preferences[selectedFaction] || {};

    return (
        <>
            <Head title="Personalizar Piezas" />
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white">
                <AppNavBar auth={auth} stats={stats} />

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <h1 className="text-3xl font-bold text-white mb-2">Personalizar Piezas</h1>
                    <p className="text-gray-400 mb-8 text-sm">
                        Elige qué personaje representa cada tipo de pieza en batalla.
                    </p>

                    {/* Selector de facción */}
                    <div className="flex gap-3 mb-8">
                        {FACTIONS.map(f => (
                            <button
                                key={f}
                                onClick={() => { setSelectedFaction(f); setExpandedPiece(null); }}
                                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                                    selectedFaction === f
                                        ? f === 'guerreros'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-red-600 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
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
                                const selectedPath = currentPref[pieceType];
                                // buscar el personaje por ruta de imagen
                                const selectedChar = ALL_CHARACTERS.find(c => c.path === selectedPath);
                                const isExpanded = expandedPiece === pieceType;

                                return (
                                    <div
                                        key={pieceType}
                                        className="bg-gray-800/60 border border-gray-700/50 rounded-xl overflow-hidden"
                                    >
                                        {/* Header del tipo de pieza */}
                                        <button
                                            type="button"
                                            className="w-full flex items-center gap-4 p-4 hover:bg-gray-700/30 transition-colors text-left"
                                            onClick={() => setExpandedPiece(isExpanded ? null : pieceType)}
                                        >
                                            {selectedChar ? (
                                                <img
                                                    src={selectedChar.path}
                                                    alt={selectedChar.displayName}
                                                    className="w-12 h-12 rounded-lg object-cover border-2 border-blue-500"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center text-gray-500 text-xs">
                                                    Sin selección
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <p className="font-semibold text-white">{PIECE_TYPE_DISPLAY[pieceType]}</p>
                                                <p className="text-sm text-gray-400">
                                                    {selectedChar ? selectedChar.displayName : 'Ninguno seleccionado'}
                                                </p>
                                            </div>
                                            <span className="text-gray-400 text-sm">{isExpanded ? '▲' : '▼'}</span>
                                        </button>

                                        {/* Galería de personajes */}
                                        {isExpanded && (
                                            <div className="border-t border-gray-700/50 p-4">
                                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                                                    {chars.map(character => {
                                                        const unlocked = isUnlocked(character.id, unlockedIds, unlock_all);
                                                        const isSelected = selectedPath === character.path;

                                                        return (
                                                            <button
                                                                key={character.id}
                                                                type="button"
                                                                disabled={!unlocked}
                                                                title={unlocked ? character.displayName : `Bloqueado — ${character.displayName}`}
                                                                onClick={() => selectPiece(pieceType, character)}
                                                                className={`relative rounded-lg overflow-hidden transition-all aspect-square ${
                                                                    isSelected
                                                                        ? 'ring-2 ring-blue-400 scale-105'
                                                                        : unlocked
                                                                            ? 'hover:ring-2 hover:ring-blue-400/50 hover:scale-105'
                                                                            : 'cursor-not-allowed opacity-50'
                                                                }`}
                                                            >
                                                                <img
                                                                    src={character.path}
                                                                    alt={character.displayName}
                                                                    className={`w-full h-full object-cover ${!unlocked ? 'grayscale brightness-50' : ''}`}
                                                                />
                                                                {!unlocked && (
                                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                                        <LockClosedIcon className="w-5 h-5 text-gray-300 drop-shadow" />
                                                                    </div>
                                                                )}
                                                                {isSelected && (
                                                                    <div className="absolute inset-0 bg-blue-500/20 flex items-end justify-center pb-1">
                                                                        <span className="text-[9px] font-bold text-blue-200 bg-blue-900/80 px-1 rounded">
                                                                            ✓
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
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl font-semibold text-white transition-colors"
                            >
                                {processing ? 'Guardando...' : 'Guardar preferencias'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
