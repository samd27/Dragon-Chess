<?php

namespace App\Services;

class GameRewardService
{
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
}
