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
     * Convierte cualquier valor en formato ID (guerreros/torre/Goku) a ruta de imagen.
     * Protección hacia atrás por si algún usuario tiene datos en el formato antiguo.
     */
    public static function normalizePreferences(array $prefs): array
    {
        $factionDir  = ['guerreros' => 'Guerreros', 'villanos' => 'Villanos'];
        $pieceDir    = ['rey' => 'Rey', 'reina' => 'Reina', 'torre' => 'Torre',
                        'caballo' => 'Caballo', 'alfil' => 'Alfil', 'peon' => 'Peon'];

        foreach ($prefs as $faction => &$pieces) {
            if (!is_array($pieces)) continue;
            foreach ($pieces as $pieceType => &$value) {
                if ($value && !str_starts_with($value, '/')) {
                    // Es un ID: convertir a ruta
                    $parts = explode('/', $value, 3);
                    if (count($parts) === 3) {
                        [$f, $p, $filename] = $parts;
                        $fDir = $factionDir[$f]  ?? ucfirst($f);
                        $pDir = $pieceDir[$p]    ?? ucfirst($p);
                        $value = "/images/characters/{$fDir}/{$pDir}/{$filename}.webp";
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
                $webpFiles = array_filter($files, function($file) {
                    return pathinfo($file, PATHINFO_EXTENSION) === 'webp';
                });
                
                sort($webpFiles); // Ordenar alfabéticamente
                
                if (count($webpFiles) > 0) {
                    $defaults[$factionKey][$pieceKey] = '/images/characters/' . $faction . '/' . $pieceType . '/' . reset($webpFiles);
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
