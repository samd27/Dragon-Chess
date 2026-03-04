import { Head, router } from '@inertiajs/react';
import { ShoppingBagIcon, LockClosedIcon, CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import AppNavBar from '@/Components/AppNavBar';
import {
    SHOP_ITEMS,
    charPath,
    FACTION_DISPLAY,
    PIECE_TYPE_DISPLAY,
    isUnlocked,
} from '@/data/characters';

export default function Shop({ auth, stats, unlock_all }) {
    const [purchasing, setPurchasing] = useState(null);
    const [message, setMessage] = useState(null);

    const unlockedIds = stats?.unlocked_characters ?? [];
    const seeds = stats?.senzu_seeds ?? 0;

    const groups = {
        guerreros: SHOP_ITEMS.filter(c => c.faction === 'guerreros'),
        villanos:  SHOP_ITEMS.filter(c => c.faction === 'villanos'),
    };

    function handlePurchase(character) {
        if (purchasing) return;
        const owned = isUnlocked(character.id, unlockedIds, unlock_all);
        if (owned) return;
        if (seeds < character.shopPrice) {
            setMessage({ type: 'error', text: 'No tienes suficientes Semillas Senzu.' });
            setTimeout(() => setMessage(null), 3000);
            return;
        }
        setPurchasing(character.id);
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content ?? '';
        fetch(route('shop.purchase'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
            },
            body: JSON.stringify({ character_id: character.id, price: character.shopPrice }),
        })
            .then(async (r) => {
                const data = await r.json();
                if (!r.ok || !data.success) {
                    setMessage({ type: 'error', text: data.message ?? 'Error al comprar.' });
                } else {
                    setMessage({ type: 'success', text: `¡${character.displayName} desbloqueado!` });
                    // Recargar los props de Inertia para actualizar senzu y personajes
                    router.reload({ only: ['stats'] });
                }
                setTimeout(() => setMessage(null), 3000);
            })
            .catch(() => {
                setMessage({ type: 'error', text: 'Error de conexión.' });
                setTimeout(() => setMessage(null), 3000);
            })
            .finally(() => setPurchasing(null));
    }

    return (
        <>
            <Head title="Tienda" />
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white">
                <AppNavBar auth={auth} stats={stats} />

                {/* Header */}
                <div className="relative overflow-hidden bg-gradient-to-r from-yellow-900/40 via-orange-900/30 to-yellow-900/40 border-b border-yellow-700/30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex items-center gap-4">
                            <ShoppingBagIcon className="w-10 h-10 text-yellow-400" />
                            <div>
                                <h1 className="text-3xl font-bold text-yellow-400">Tienda</h1>
                                <p className="text-gray-400 text-sm mt-1">Desbloquea personajes con Semillas Senzu</p>
                            </div>
                            <div className="ml-auto flex items-center gap-2 bg-yellow-900/40 border border-yellow-700/50 rounded-xl px-4 py-2">
                                <SparklesIcon className="w-5 h-5 text-yellow-400" />
                                <span className="font-bold text-yellow-300 text-lg">{seeds}</span>
                                <span className="text-yellow-500 text-sm">Semillas Senzu</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mensaje flash */}
                {message && (
                    <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-xl font-semibold transition-all ${
                        message.type === 'success'
                            ? 'bg-green-700 text-green-100 border border-green-500'
                            : 'bg-red-800 text-red-100 border border-red-500'
                    }`}>
                        {message.text}
                    </div>
                )}

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
                    {Object.entries(groups).map(([factionKey, items]) => (
                        <section key={factionKey}>
                            <h2 className={`text-2xl font-bold mb-6 pb-2 border-b ${
                                factionKey === 'guerreros'
                                    ? 'text-blue-400 border-blue-700/40'
                                    : 'text-red-400 border-red-700/40'
                            }`}>
                                {FACTION_DISPLAY[factionKey]}
                            </h2>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                {items.map(character => {
                                    const owned = isUnlocked(character.id, unlockedIds, unlock_all);
                                    const canAfford = seeds >= (character.shopPrice ?? 0);
                                    const loading = purchasing === character.id;

                                    return (
                                        <div
                                            key={character.id}
                                            className={`relative rounded-xl overflow-hidden border transition-all ${
                                                owned
                                                    ? 'border-green-600/50 bg-gray-800/60'
                                                    : canAfford
                                                        ? 'border-yellow-600/50 bg-gray-800/80 hover:border-yellow-400 cursor-pointer'
                                                        : 'border-gray-700/40 bg-gray-800/40 opacity-60 cursor-not-allowed'
                                            }`}
                                            onClick={() => !owned && handlePurchase(character)}
                                        >
                                            {/* Imagen */}
                                            <div className="relative aspect-square">
                                                <img
                                                    src={charPath(character.id)}
                                                    alt={character.displayName}
                                                    className={`w-full h-full object-cover ${owned ? '' : 'brightness-75'}`}
                                                />
                                                {owned && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-green-900/30">
                                                        <CheckCircleIcon className="w-10 h-10 text-green-400 drop-shadow-lg" />
                                                    </div>
                                                )}
                                                {!owned && (
                                                    <div className="absolute top-1 right-1">
                                                        <LockClosedIcon className="w-5 h-5 text-gray-300 drop-shadow" />
                                                    </div>
                                                )}
                                                {loading && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                                        <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="p-2 text-center">
                                                <p className="text-xs font-semibold text-white truncate">{character.displayName}</p>
                                                <p className="text-xs text-gray-400">{PIECE_TYPE_DISPLAY[character.pieceType]}</p>
                                                {owned ? (
                                                    <span className="inline-block mt-1 text-xs text-green-400 font-bold">Ya desbloqueado</span>
                                                ) : (
                                                    <div className="flex items-center justify-center gap-1 mt-1">
                                                        <SparklesIcon className="w-3 h-3 text-yellow-400" />
                                                        <span className={`text-xs font-bold ${canAfford ? 'text-yellow-300' : 'text-gray-500'}`}>
                                                            {character.shopPrice ?? '?'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </>
    );
}
