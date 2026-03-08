<?php

namespace App\Services;

use App\Models\PlayerStats;
use App\Models\User;

class GameRewardService
{
    /**
     * Pase de Batalla: nivel → characterId desbloqueado.
     * Debe coincidir con BATTLE_PASS_REWARDS en resources/js/data/characters.js
     */
    public const BATTLE_PASS_LEVELS = [
         3 => 'guerreros/torre/piccolo',
         6 => 'villanos/rey/Freezer',
         9 => 'guerreros/alfil/hit',
        12 => 'villanos/caballo/Kid Buu',
        15 => 'guerreros/reina/vegetto',
        18 => 'villanos/reina/Cell',
        21 => 'guerreros/peon/krilin',
        24 => 'villanos/alfil/Janemba',
        27 => 'guerreros/caballo/vegetta',
        30 => 'villanos/torre/Toppo',
        33 => 'guerreros/rey/Bills_muychistoso',
        36 => 'villanos/reina/Jiren',
        39 => 'guerreros/reina/goku_ui',
        42 => 'villanos/alfil/Black Goku',
        45 => 'guerreros/rey/zen',
        48 => 'villanos/torre/Gas',
    ];

    /**
     * Calcula las recompensas de una partida PVC según el resultado y la dificultad del CPU.
     *
     * @param  string  $result    'win' | 'loss' | 'draw'
     * @param  int     $difficulty 1=fácil, 2=normal, 3=difícil
     */
    public function calculatePvcRewards(string $result, int $difficulty): array
    {
        $base = match ($result) {
            'win'  => ['exp' => 100, 'senzu' => 8,  'ki' => 25],
            'draw' => ['exp' => 35,  'senzu' => 3,  'ki' => 0],
            'loss' => ['exp' => 15,  'senzu' => 1,  'ki' => -15],
            default => ['exp' => 0, 'senzu' => 0, 'ki' => 0],
        };

        // Multiplicador por dificultad (nivel del CPU)
        $multiplier = match ($difficulty) {
            1 => 0.7,   // CPU fácil
            2 => 1.0,   // CPU normal
            3 => 1.6,   // CPU difícil
            default => 1.0,
        };

        return [
            'exp'   => (int) round($base['exp']   * $multiplier),
            'senzu' => (int) round($base['senzu'] * $multiplier),
            'ki'    => (int) round($base['ki']    * $multiplier),
        ];
    }

    /**
     * Recompensas para Dragon PvC (ligero bonus por reglas especiales).
     */
    public function calculateDragonPvcRewards(string $result, int $difficulty): array
    {
        $rewards = $this->calculatePvcRewards($result, $difficulty);
        return [
            'exp'   => (int) round($rewards['exp'] * 1.15),
            'senzu' => (int) round($rewards['senzu'] * 1.15),
            'ki'    => (int) round($rewards['ki'] * 1.15),
        ];
    }

    /**
     * Calcula las recompensas de una partida PVP según el Ki del oponente vs el jugador.
     *
     * @param  string  $result         'win' | 'loss' | 'draw'
     * @param  int     $playerKi       Ki actual del jugador
     * @param  int     $opponentKi     Ki del oponente (0 si es invitado)
     */
    public function calculatePvpRewards(string $result, int $playerKi, int $opponentKi): array
    {
        $base = match ($result) {
            'win'  => ['exp' => 100, 'senzu' => 10, 'ki' => 25],
            'draw' => ['exp' => 40,  'senzu' => 4,  'ki' => 0],
            'loss' => ['exp' => 20,  'senzu' => 2,  'ki' => -20],
            default => ['exp' => 0, 'senzu' => 0, 'ki' => 0],
        };

        // Diferencia de Ki: si el oponente tiene más Ki, mayor recompensa al ganar; si tiene menos, menor recompensa
        if ($opponentKi > 0 && $playerKi > 0) {
            $kiDiff       = $opponentKi - $playerKi;
            $multiplier   = 1.0;

            if ($result === 'win') {
                // +10% de multiplicador por cada 100 Ki de diferencia a favor del oponente (máx +80%)
                $multiplier = max(0.6, min(1.8, 1.0 + ($kiDiff / 100) * 0.10));
            } elseif ($result === 'loss') {
                // Si pierdes contra alguien más débil, pierdes más Ki
                $multiplier = max(1.0, min(1.5, 1.0 + (-$kiDiff / 100) * 0.10));
            }

            $base['exp']   = (int) round($base['exp']   * $multiplier);
            $base['senzu'] = (int) round($base['senzu'] * $multiplier);
            $base['ki']    = (int) round($base['ki']    * $multiplier);
        }

        return $base;
    }

    /**
     * Recompensas para Dragon PvP.
     */
    public function calculateDragonPvpRewards(string $result, int $playerKi, int $opponentKi): array
    {
        $rewards = $this->calculatePvpRewards($result, $playerKi, $opponentKi);
        return [
            'exp'   => (int) round($rewards['exp'] * 1.15),
            'senzu' => (int) round($rewards['senzu'] * 1.15),
            'ki'    => (int) round($rewards['ki'] * 1.15),
        ];
    }

    /**
     * Aplica las recompensas al jugador, recalcula nivel y desbloquea personajes del Pase de Batalla.
     *
     * @return array { leveled_up, old_level, new_level, level_progress, new_unlocks, stats }
     */
    public function applyRewards(User $user, array $rewards, string $result): array
    {
        if (! $user->stats) {
            $user->stats()->create([
                'level'               => 1,
                'victories'           => 0,
                'losses'              => 0,
                'draws'               => 0,
                'ki'                  => 1000,
                'experience'          => 0,
                'senzu_seeds'         => 0,
                'unlocked_characters' => [],
            ]);
            $user->load('stats');
        }

        $stats    = $user->stats;
        $oldLevel = $stats->level;

        if ($result === 'win') {
            $stats->increment('victories');
        } elseif ($result === 'loss') {
            $stats->increment('losses');
        } else {
            $stats->increment('draws');
        }

        $stats->increment('experience',  $rewards['exp']);
        $stats->increment('senzu_seeds', $rewards['senzu']);

        $newKi = max(0, $stats->ki + $rewards['ki']);
        $stats->update(['ki' => $newKi]);
        $stats->refresh();

        $newLevel   = PlayerStats::calculateLevel($stats->experience);
        $newUnlocks = [];

        if ($newLevel > $oldLevel) {
            $stats->update(['level' => $newLevel]);

            // Desbloquear personajes del Pase de Batalla para cada nivel nuevo alcanzado
            for ($lvl = $oldLevel + 1; $lvl <= $newLevel; $lvl++) {
                if (isset(self::BATTLE_PASS_LEVELS[$lvl])) {
                    $charId = self::BATTLE_PASS_LEVELS[$lvl];
                    $stats->refresh();
                    $stats->unlockCharacter($charId);
                    $newUnlocks[] = $charId;
                }
            }

            $stats->refresh();
        }

        return [
            'leveled_up'     => $newLevel > $oldLevel,
            'old_level'      => $oldLevel,
            'new_level'      => $newLevel,
            'level_progress' => $stats->levelProgress(),
            'new_unlocks'    => $newUnlocks,
            'stats'          => [
                'level'               => $stats->level,
                'experience'          => $stats->experience,
                'senzu_seeds'         => $stats->senzu_seeds,
                'ki'                  => $stats->ki,
                'victories'           => $stats->victories,
                'losses'              => $stats->losses,
                'draws'               => $stats->draws,
                'unlocked_characters' => $stats->getEffectiveUnlockedIds(),
            ],
        ];
    }

    /**
     * Compra un personaje de la tienda con Semillas Senzu.
     *
     * @return array { success, message, senzu_remaining }
     */
    public function purchaseCharacter(User $user, string $characterId, int $price): array
    {
        $stats = $user->stats;

        if (! $stats) {
            return ['success' => false, 'message' => 'No se encontraron estadísticas del jugador.'];
        }

        if ($stats->isCharacterUnlocked($characterId)) {
            return ['success' => false, 'message' => 'Ya tienes este personaje desbloqueado.'];
        }

        if ($stats->senzu_seeds < $price) {
            return ['success' => false, 'message' => 'No tienes suficientes Semillas Senzu.'];
        }

        $stats->decrement('senzu_seeds', $price);
        $stats->unlockCharacter($characterId);

        return [
            'success'         => true,
            'message'         => '¡Personaje desbloqueado!',
            'senzu_remaining' => $stats->fresh()->senzu_seeds,
        ];
    }
}
