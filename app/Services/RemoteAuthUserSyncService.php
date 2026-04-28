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

        $remoteEmail = strtolower(trim((string) ($remoteUser['email'] ?? '')));
        $remoteName = trim((string) ($remoteUser['name'] ?? ''));

        $defaults = PieceCustomizationController::getDefaultPiecePreferences();
        $rawPreferences = $remoteUser['piece_preferences'] ?? $defaults;
        $preferences = PieceCustomizationController::normalizePreferences(
            is_array($rawPreferences) ? $rawPreferences : $defaults
        );

        $user = User::query()
            ->where('auth_service_id', $remoteId)
            ->when($remoteEmail !== '', function ($query) use ($remoteEmail) {
                $query->orWhere('email', $remoteEmail);
            })
            ->first();

        if (! $user) {
            $user = new User();
        }

        $user->auth_service_id = $remoteId;
        $user->name = $remoteName !== '' ? $remoteName : ('User' . $remoteId);
        $user->email = $remoteEmail !== '' ? $remoteEmail : ("user{$remoteId}@example.com");
        $user->password = Hash::make(Str::random(64));
        $user->avatar = (string) ($remoteUser['avatar'] ?? '/images/characters/Guerreros/Torre/Goku.webp');
        $user->piece_preferences = $preferences;
        $user->unlock_all = (bool) ($remoteUser['unlock_all'] ?? false);

        $user->save();

        return $user;
    }
}
