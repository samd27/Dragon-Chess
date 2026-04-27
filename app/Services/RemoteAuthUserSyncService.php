<?php

namespace App\Services;

use App\Http\Controllers\PieceCustomizationController;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class RemoteAuthUserSyncService
{
    /**
     * Synchronize a remote auth user into the local shadow users table.
     */
    public function sync(array $remoteUser): User
    {
        $remoteId = (int) ($remoteUser['id'] ?? 0);
        if ($remoteId <= 0) {
            throw new \InvalidArgumentException('Remote user id is required');
        }

        $defaults = PieceCustomizationController::getDefaultPiecePreferences();
        $preferences = $remoteUser['piece_preferences'] ?? $defaults;
        if (! is_array($preferences)) {
            $preferences = $defaults;
        }

        $user = User::updateOrCreate(
            ['auth_service_id' => $remoteId],
            [
                'name' => (string) ($remoteUser['name'] ?? 'User' . $remoteId),
                'email' => (string) ($remoteUser['email'] ?? "user{$remoteId}@example.com"),
                'password' => Hash::make(Str::random(64)),
                'avatar' => (string) ($remoteUser['avatar'] ?? '/images/characters/Guerreros/Torre/Goku.webp'),
                'piece_preferences' => $preferences,
                'unlock_all' => (bool) ($remoteUser['unlock_all'] ?? false),
            ]
        );

        return $user;
    }
}
