<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('player_stats', function (Blueprint $table) {
            $table->unsignedBigInteger('experience')->default(0)->after('ki');
            $table->unsignedBigInteger('senzu_seeds')->default(0)->after('experience');
            $table->unsignedInteger('losses')->default(0)->after('victories');
            $table->unsignedInteger('draws')->default(0)->after('losses');
        });
    }

    public function down(): void
    {
        Schema::table('player_stats', function (Blueprint $table) {
            $table->dropColumn(['experience', 'senzu_seeds', 'losses', 'draws']);
        });
    }
};
