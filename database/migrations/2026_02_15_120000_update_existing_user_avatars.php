<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Usuarios sin avatar o con rutas antiguas se actualizan a las nuevas rutas
        DB::table('users')
            ->whereNull('avatar')
            ->orWhere('avatar', '')
            ->update(['avatar' => '/images/characters/Guerreros/Torre/Goku.webp']);

        DB::table('users')
            ->where('avatar', '/images/characters/Goku.png')
            ->update(['avatar' => '/images/characters/Guerreros/Torre/Goku.webp']);

        DB::table('users')
            ->where('avatar', '/images/characters/Freezer.png')
            ->update(['avatar' => '/images/characters/Villanos/Rey/Freezer.webp']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('users')
            ->where('avatar', '/images/characters/Guerreros/Torre/Goku.webp')
            ->update(['avatar' => '/images/characters/Goku.png']);

        DB::table('users')
            ->where('avatar', '/images/characters/Villanos/Rey/Freezer.webp')
            ->update(['avatar' => '/images/characters/Freezer.png']);
    }
};
