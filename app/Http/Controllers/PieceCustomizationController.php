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
        $currentPreferences = $user->piece_preferences ?? $this->getDefaultPiecePreferences();
        
        // Get available pieces from filesystem
        $availablePieces = $this->getAvailablePieces();
        
        return Inertia::render('PersonalizarPiezas', [
            'currentPreferences' => $currentPreferences,
            'availablePieces' => $availablePieces,
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
     * Get default piece preferences.
     */
    private function getDefaultPiecePreferences(): array
    {
        return [
            'guerreros' => [
                'rey' => '/images/characters/Guerreros/Rey/Bills.png',
                'reina' => '/images/characters/Guerreros/Reina/Bulma.png',
                'torre' => '/images/characters/Guerreros/Torre/Goku.png',
                'caballo' => '/images/characters/Guerreros/Caballo/Vegeta.png',
                'alfil' => null,
                'peon' => null,
            ],
            'villanos' => [
                'rey' => '/images/characters/Villanos/Rey/Freezer.png',
                'reina' => '/images/characters/Villanos/Reina/Cell.png',
                'torre' => '/images/characters/Villanos/Torre/Broly_Z.png',
                'caballo' => '/images/characters/Villanos/Caballo/Androide 17.png',
                'alfil' => '/images/characters/Villanos/Alfil/Black Goku.png',
                'peon' => '/images/characters/Villanos/Peon/Saibaiman.png',
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
                    if (pathinfo($file, PATHINFO_EXTENSION) === 'png') {
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
