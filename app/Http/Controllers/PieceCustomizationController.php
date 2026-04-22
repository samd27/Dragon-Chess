<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PieceCustomizationController extends Controller
{
    /**
     * Display the piece customization page.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        
        // Get user's current piece preferences or set defaults
        $currentPreferences = self::normalizePreferences(
            $user->piece_preferences ?? self::getDefaultPiecePreferences()
        );

        return Inertia::render('PersonalizarPiezas', [
            'currentPreferences' => $currentPreferences,
            'stats'              => $user->stats,
            'unlock_all'         => (bool) $user->unlock_all,
        ]);
    }

    /**
     * Update the user's piece preferences.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'piece_preferences' => 'required|array',
            'piece_preferences.guerreros' => 'required|array',
            'piece_preferences.villanos' => 'required|array',
        ]);

        $user = $request->user();
        $user->piece_preferences = $validated['piece_preferences'];
        $user->save();

        return back()->with('success', 'Preferencias de piezas actualizadas exitosamente');
    }

    /**
     * Convierte preferencias antiguas basadas en rutas locales a IDs canónicos.
     * El formato moderno guardado es siempre "faccion/tipo/archivo".
     */
    public static function normalizePreferences(array $prefs): array
    {
        $reverseFaction = ['guerreros' => 'guerreros', 'villanos' => 'villanos'];
        $reversePiece = [
            'rey' => 'rey',
            'reina' => 'reina',
            'torre' => 'torre',
            'caballo' => 'caballo',
            'alfil' => 'alfil',
            'peon' => 'peon',
        ];

        foreach ($prefs as $faction => &$pieces) {
            if (!is_array($pieces)) continue;
            foreach ($pieces as $pieceType => &$value) {
                if (!$value || !is_string($value)) {
                    continue;
                }

                if (str_starts_with($value, '/images/characters/')) {
                    $relative = str_replace('/images/characters/', '', $value);
                    $relative = preg_replace('/\.(webp|png|jpe?g|gif|avif)$/i', '', $relative ?? '');
                    $parts = explode('/', (string) $relative);

                    if (count($parts) >= 3) {
                        $rawFaction = strtolower((string) ($parts[0] ?? ''));
                        $rawPiece = strtolower((string) ($parts[1] ?? ''));
                        $filename = implode('/', array_slice($parts, 2));

                        $mappedFaction = $reverseFaction[$rawFaction] ?? $rawFaction;
                        $mappedPiece = $reversePiece[$rawPiece] ?? $rawPiece;

                        if ($mappedFaction && $mappedPiece && $filename) {
                            $value = "{$mappedFaction}/{$mappedPiece}/{$filename}";
                        }
                    }
                }
            }
        }
        return $prefs;
    }

    /**
     * Get default piece preferences (first character alphabetically for each piece type).
     */
    public static function getDefaultPiecePreferences(): array
    {
        return [
            'guerreros' => [
                'rey' => 'guerreros/rey/Bills',
                'reina' => 'guerreros/reina/Bulma',
                'torre' => 'guerreros/torre/Goku',
                'caballo' => 'guerreros/caballo/gohan',
                'alfil' => 'guerreros/alfil/caulifla',
                'peon' => 'guerreros/peon/chaos',
            ],
            'villanos' => [
                'rey' => 'villanos/rey/Champa',
                'reina' => 'villanos/reina/Arinsu',
                'torre' => 'villanos/torre/Broly_Z',
                'caballo' => 'villanos/caballo/Androide 17',
                'alfil' => 'villanos/alfil/Androide 18',
                'peon' => 'villanos/peon/Freezer_1ra forma',
            ],
        ];
    }

    /**
     * Get available pieces from filesystem.
     */
    private function getAvailablePieces(): array
    {
        $basePath = public_path('images/characters');
        $pieces = [];

        foreach (['Guerreros', 'Villanos'] as $faction) {
            $factionPath = $basePath . '/' . $faction;
            
            if (!is_dir($factionPath)) {
                continue;
            }

            $factionKey = strtolower($faction);
            $pieces[$factionKey] = [];

            foreach (scandir($factionPath) as $pieceType) {
                if ($pieceType === '.' || $pieceType === '..') {
                    continue;
                }

                $pieceTypePath = $factionPath . '/' . $pieceType;
                
                if (!is_dir($pieceTypePath)) {
                    continue;
                }

                $pieceKey = strtolower($pieceType);
                $pieces[$factionKey][$pieceKey] = [];

                foreach (scandir($pieceTypePath) as $file) {
                    if (pathinfo($file, PATHINFO_EXTENSION) === 'webp') {
                        $pieces[$factionKey][$pieceKey][] = [
                            'name' => pathinfo($file, PATHINFO_FILENAME),
                            'path' => '/images/characters/' . $faction . '/' . $pieceType . '/' . $file,
                        ];
                    }
                }
            }
        }

        return $pieces;
    }
}
