<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Migrar rutas de imágenes de .png a .webp en avatares y preferencias de piezas.
     */
    public function up(): void
    {
        // Actualizar avatares con ruta .png
        DB::table('users')
            ->where('avatar', 'like', '%.png')
            ->chunkById(100, function ($users) {
                foreach ($users as $user) {
                    DB::table('users')
                        ->where('id', $user->id)
                        ->update(['avatar' => str_replace('.png', '.webp', $user->avatar)]);
                }
            });

        // Actualizar piece_preferences (JSON) que contengan rutas .png
        DB::table('users')
            ->whereNotNull('piece_preferences')
            ->where('piece_preferences', 'like', '%.png%')
            ->chunkById(100, function ($users) {
                foreach ($users as $user) {
                    $prefs = json_decode($user->piece_preferences, true);
                    if (is_array($prefs)) {
                        $json = json_encode($prefs);
                        $updated = str_replace('.png', '.webp', $json);
                        DB::table('users')
                            ->where('id', $user->id)
                            ->update(['piece_preferences' => $updated]);
                    }
                }
            });
    }

    /**
     * Revertir: .webp → .png (solo rutas de /images/characters/).
     */
    public function down(): void
    {
        DB::table('users')
            ->where('avatar', 'like', '%/images/characters/%.webp')
            ->chunkById(100, function ($users) {
                foreach ($users as $user) {
                    DB::table('users')
                        ->where('id', $user->id)
                        ->update(['avatar' => str_replace('.webp', '.png', $user->avatar)]);
                }
            });

        DB::table('users')
            ->whereNotNull('piece_preferences')
            ->where('piece_preferences', 'like', '%.webp%')
            ->chunkById(100, function ($users) {
                foreach ($users as $user) {
                    $prefs = json_decode($user->piece_preferences, true);
                    if (is_array($prefs)) {
                        $json = json_encode($prefs);
                        $updated = str_replace('.webp', '.png', $json);
                        DB::table('users')
                            ->where('id', $user->id)
                            ->update(['piece_preferences' => $updated]);
                    }
                }
            });
    }
};
