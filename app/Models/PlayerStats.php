<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlayerStats extends Model
{
    /**
     * IDs de personajes desbloqueados por defecto (primera pieza de cada tipo/facción).
     * Deben coincidir con DEFAULT_UNLOCKED_IDS en resources/js/data/characters.js
     */
    public const DEFAULT_UNLOCKED_IDS = [
        'guerreros/alfil/caulifla',
        'guerreros/caballo/gohan',
        'guerreros/peon/chaos',
        'guerreros/reina/Bulma',
        'guerreros/rey/Bills',
        'guerreros/torre/gohan_adolescente',
        'guerreros/torre/Goku',
        'villanos/alfil/Androide 18',
        'villanos/caballo/Androide 17',
        'villanos/peon/Freezer_1ra forma',
        'villanos/reina/Arinsu',
        'villanos/rey/Champa',
        'villanos/torre/Broly_Z',
    ];

    protected $fillable = [
        'user_id',
        'level',
        'victories',
        'losses',
        'draws',
        'ki',
        'experience',
        'senzu_seeds',
        'unlocked_characters',
    ];

    protected $casts = [
        'level'                => 'integer',
        'victories'            => 'integer',
        'losses'               => 'integer',
        'draws'                => 'integer',
        'ki'                   => 'integer',
        'experience'           => 'integer',
        'senzu_seeds'          => 'integer',
        'unlocked_characters'  => 'array',
    ];

    /**
     * Calcula el nivel a partir de la experiencia acumulada.
     * Fórmula: nivel = floor(sqrt(experience / 80)) + 1
     * Ejemplos: 0xp=Lv1, 80xp=Lv2, 320xp=Lv3, 720xp=Lv4...
     */
    public static function calculateLevel(int $experience): int
    {
        return (int) floor(sqrt($experience / 80)) + 1;
    }

    /**
     * Experiencia requerida para llegar al siguiente nivel.
     */
    public static function expForNextLevel(int $currentLevel): int
    {
        return (int) pow($currentLevel, 2) * 80;
    }

    /**
     * Porcentaje de progreso dentro del nivel actual (0-100).
     */
    public function levelProgress(): int
    {
        $currentLevelExp = (int) pow($this->level - 1, 2) * 80;
        $nextLevelExp    = (int) pow($this->level, 2) * 80;
        $span            = $nextLevelExp - $currentLevelExp;

        if ($span <= 0) {
            return 100;
        }

        return (int) min(100, (($this->experience - $currentLevelExp) / $span) * 100);
    }

    /**
     * Devuelve todos los IDs de personajes desbloqueados (incluye los por defecto).
     */
    public function getEffectiveUnlockedIds(): array
    {
        $unlocked = $this->unlocked_characters ?? [];
        return array_unique(array_merge(self::DEFAULT_UNLOCKED_IDS, $unlocked));
    }

    /**
     * Comprueba si un ID de personaje está desbloqueado para este jugador.
     */
    public function isCharacterUnlocked(string $characterId): bool
    {
        if ($this->user?->unlock_all) {
            return true;
        }
        return in_array($characterId, $this->getEffectiveUnlockedIds(), true);
    }

    /**
     * Añade un ID de personaje a la lista de desbloqueados.
     */
    public function unlockCharacter(string $characterId): void
    {
        $current = $this->unlocked_characters ?? [];
        if (! in_array($characterId, $current, true)) {
            $current[] = $characterId;
            $this->update(['unlocked_characters' => $current]);
        }
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

