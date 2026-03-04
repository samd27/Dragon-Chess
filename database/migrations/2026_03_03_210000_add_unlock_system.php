<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Agrega unlock_all a los usuarios (admin puede dárselo a cuentas especiales)
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('unlock_all')->default(false)->after('piece_preferences');
        });

        // Agrega unlocked_characters a player_stats: array JSON de IDs de personajes desbloqueados
        Schema::table('player_stats', function (Blueprint $table) {
            $table->json('unlocked_characters')->nullable()->after('senzu_seeds');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('unlock_all');
        });

        Schema::table('player_stats', function (Blueprint $table) {
            $table->dropColumn('unlocked_characters');
        });
    }
};
