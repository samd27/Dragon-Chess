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
        $currentPreferences = $user->piece_preferences ?? self::getDefaultPiecePreferences();
        
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
     * Get default piece preferences (first character alphabetically for each piece type).
     */
    public static function getDefaultPiecePreferences(): array
    {
        $basePath = public_path('images/characters');
        $defaults = [
            'guerreros' => [],
            'villanos' => []
        ];

        foreach (['Guerreros', 'Villanos'] as $faction) {
            $factionPath = $basePath . '/' . $faction;
            $factionKey = strtolower($faction);
            
            if (!is_dir($factionPath)) {
                continue;
            }

            foreach (['Rey', 'Reina', 'Torre', 'Caballo', 'Alfil', 'Peon'] as $pieceType) {
                $pieceTypePath = $factionPath . '/' . $pieceType;
                $pieceKey = strtolower($pieceType);
                
                if (!is_dir($pieceTypePath)) {
                    $defaults[$factionKey][$pieceKey] = null;
                    continue;
                }
                
                $files = scandir($pieceTypePath);
                $pngFiles = array_filter($files, function($file) {
                    return pathinfo($file, PATHINFO_EXTENSION) === 'png';
                });
                
                sort($pngFiles); // Ordenar alfabéticamente
                
                if (count($pngFiles) > 0) {
                    $defaults[$factionKey][$pieceKey] = '/images/characters/' . $faction . '/' . $pieceType . '/' . $pngFiles[0];
                } else {
                    $defaults[$factionKey][$pieceKey] = null;
                }
            }
        }

        return $defaults;
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
