<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlayerStats extends Model
{
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

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

