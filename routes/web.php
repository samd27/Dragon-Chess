<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    $stats = null;
    if (auth()->check()) {
        $stats = auth()->user()->stats;
    }
    
    return Inertia::render('Inicio', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'stats' => $stats,
    ]);
})->name('welcome');

Route::get('/game-mode', function () {
    return Inertia::render('ModoJuego');
})->middleware(['auth'])->name('game.mode');

Route::get('/faction-select', function () {
    $mode = request('mode', 'PVP');
    return Inertia::render('SelectorBando', [
        'mode' => $mode,
    ]);
})->middleware(['auth'])->name('faction.select');

Route::get('/game-arena', function () {
    $faction = request('faction', 'Z_WARRIORS');
    $mode = request('mode', 'PVP');
    return Inertia::render('Batalla', [
        'faction' => $faction,
        'mode' => $mode,
    ]);
})->name('game.arena');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
