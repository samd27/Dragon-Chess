import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function PersonalizarPiezas({ auth, availablePieces, currentPreferences }) {
    const [selectedFaction, setSelectedFaction] = useState('guerreros');
    const [expandedPiece, setExpandedPiece] = useState(null);

    const { data, setData, patch, processing } = useForm({
        piece_preferences: currentPreferences || {
            guerreros: {
                rey: null,
                reina: null,
                torre: null,
                caballo: null,
                alfil: null,
                peon: null,
            },
            villanos: {
                rey: null,
                reina: null,
                torre: null,
                caballo: null,
                alfil: null,
                peon: null,
            }
        }
    });

    const pieceNames = {
        rey: 'Rey',
        reina: 'Reina',
        torre: 'Torre',
        caballo: 'Caballo',
        alfil: 'Alfil',
        peon: 'Peón'
    };

    // Mapeo de nombres de avatares basado en EditarPerfil
    const characterNames = {
        'Androide 17': 'Androide 17',
        'Androide 18': 'Androide 18',
        'Arinsu': 'Arinsu',
        'Bills': 'Bills',
        'Black Goku': 'Black Goku',
        'Broly Super': 'Broly Super',
        'Broly_Z': 'Broly Z',
        'Bulma': 'Bulma',
        'Burter': 'Burter',
        'Cell': 'Cell',
        'Champa': 'Champa',
        'Dabura': 'Dabura',
        'Dyspo': 'Dyspo',
        'Freezer': 'Freezer',
        'Freezer_100': 'Freezer 100%',
        'Freezer_1ra forma': 'Freezer 1ra forma',
        'Freezer_2da Forma': 'Freezer 2da Forma',
        'Freezer_Black': 'Black Freezer',
        'Gas': 'Gas',
        'Ginyu': 'Ginyu',
        'Goku': 'Goku',
        'Guldo': 'Guldo',
        'Janemba': 'Janemba',
        'Jeice': 'Jeice',
        'Jiren': 'Jiren',
        'Kid Buu': 'Kid Buu',
        'Krillin': 'Krillin',
        'Majin Buu': 'Majin Buu',
        'Moro': 'Moro',
        'Pilaf': 'Pilaf',
        'Recoome': 'Recoome',
        'Saibaiman': 'Saibaiman',
        'Super Buu': 'Super Buu',
        'Toppo': 'Toppo',
        'Trunks': 'Trunks',
        'Vegeta': 'Vegeta',
        'Zamas_fusion': 'Zamas Fusión',
        'Zamasu': 'Zamas',
        'Zoirei': 'Zoirei'
    };

    const getCharacterName = (filename) => {
        return characterNames[filename] || filename;
    };

    const handlePieceSelection = (faction, pieceType, imagePath) => {
        setData('piece_preferences', {
            ...data.piece_preferences,
            [faction]: {
                ...data.piece_preferences[faction],
                [pieceType]: imagePath
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route('pieces.update'), {
            preserveScroll: false,
            onSuccess: () => {
                window.location.href = route('welcome');
            }
        });
    };

    const getCurrentSelection = (faction, pieceType) => {
        return data.piece_preferences?.[faction]?.[pieceType];
    };

    const togglePieceExpansion = (pieceType) => {
        setExpandedPiece(expandedPiece === pieceType ? null : pieceType);
    };

    return (
        <>
            <Head title="Personalizar Piezas" />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
                {/* Header */}
                <div className="border-b border-white/10 backdrop-blur-xl bg-black/40">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route('welcome')}
                                className="text-white/60 hover:text-white transition-colors"
                            >
                                ← Volver
                            </Link>
                            <h1 className="text-white font-black text-xl md:text-2xl uppercase tracking-wider">
                                Personalizar Piezas
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8">
                        
                        {/* Faction Tabs */}
                        <div className="flex gap-3 mb-8">
                            <button
                                type="button"
                                onClick={() => setSelectedFaction('guerreros')}
                                className={`flex-1 px-6 py-3 rounded-xl font-black uppercase text-sm tracking-widest transition-all ${
                                    selectedFaction === 'guerreros'
                                        ? 'bg-primary text-black border-2 border-primary shadow-lg'
                                        : 'bg-white/5 text-white/60 border-2 border-white/10 hover:border-white/30'
                                }`}
                            >
                                Guerreros Z
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedFaction('villanos')}
                                className={`flex-1 px-6 py-3 rounded-xl font-black uppercase text-sm tracking-widest transition-all ${
                                    selectedFaction === 'villanos'
                                        ? 'bg-primary text-black border-2 border-primary shadow-lg'
                                        : 'bg-white/5 text-white/60 border-2 border-white/10 hover:border-white/30'
                                }`}
                            >
                                Villanos
                            </button>
                        </div>

                        {/* Pieces Grid */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {Object.keys(pieceNames).map((pieceType) => {
                                const availableForPiece = availablePieces?.[selectedFaction]?.[pieceType] || [];
                                const currentSelection = getCurrentSelection(selectedFaction, pieceType);
                                const isExpanded = expandedPiece === pieceType;

                                return (
                                    <div key={pieceType} className="bg-black/20 rounded-xl border border-white/5 overflow-hidden">
                                        {/* Piece Header */}
                                        <button
                                            type="button"
                                            onClick={() => togglePieceExpansion(pieceType)}
                                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-lg border-2 border-primary/50 bg-black/40 flex items-center justify-center overflow-hidden aspect-square">
                                                    {currentSelection ? (
                                                        <img 
                                                            src={currentSelection} 
                                                            alt={pieceNames[pieceType]} 
                                                            className="w-full h-full object-contain"
                                                        />
                                                    ) : (
                                                        <span className="text-white/30 text-2xl font-bold">?</span>
                                                    )}
                                                </div>
                                                <div className="text-left">
                                                    <h3 className="text-white font-black uppercase text-lg tracking-wider">
                                                        {pieceNames[pieceType]}
                                                    </h3>
                                                    <p className="text-white/50 text-sm">
                                                        {availableForPiece.length} {availableForPiece.length === 1 ? 'opción disponible' : 'opciones disponibles'}
                                                    </p>
                                                </div>
                                            </div>
                                            <svg 
                                                className={`w-6 h-6 text-white/60 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                fill="none" 
                                                viewBox="0 0 24 24" 
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        {/* Avatar Grid */}
                                        {isExpanded && (
                                            <div className="px-6 pb-6">
                                                {availableForPiece.length > 0 ? (
                                                    <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3 mt-4">
                                                        {availableForPiece.map((avatar) => (
                                                            <button
                                                                key={avatar.path}
                                                                type="button"
                                                                onClick={() => handlePieceSelection(selectedFaction, pieceType, avatar.path)}
                                                                className={`p-2 rounded-xl border-2 transition-all ${
                                                                    currentSelection === avatar.path
                                                                        ? 'border-primary bg-primary/20 scale-105'
                                                                        : 'border-white/10 hover:border-white/30 hover:scale-105'
                                                                }`}
                                                            >
                                                                <div className="w-full aspect-square rounded-lg overflow-hidden bg-black/20">
                                                                    <img 
                                                                        src={avatar.path} 
                                                                        alt={getCharacterName(avatar.name)} 
                                                                        className="w-full h-full object-contain"
                                                                    />
                                                                </div>
                                                                <span className="block text-white text-xs font-bold mt-2 text-center truncate">
                                                                    {getCharacterName(avatar.name)}
                                                                </span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="mt-4 p-8 text-center">
                                                        <p className="text-white/50 text-sm">
                                                            No hay avatares disponibles para esta pieza aún.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Save Button */}
                            <div className="pt-6 flex justify-end gap-4">
                                <Link
                                    href={route('welcome')}
                                    className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold transition-all"
                                >
                                    Cancelar
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-8 py-3 bg-primary hover:bg-primary/90 rounded-xl text-black font-black uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/50"
                                >
                                    {processing ? 'Guardando...' : 'Guardar Personalización'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
