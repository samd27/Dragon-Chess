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

// Selección de Jugador 2 (PvP)
Route::get('/player2-select', function () {
    return Inertia::render('SeleccionJugador2');
})->middleware(['auth'])->name('player2.select');

// Login de Jugador 2
Route::get('/player2-login', function () {
    return Inertia::render('Auth/LoginJugador2');
})->middleware(['auth'])->name('player2.login');

// Autenticación de Jugador 2
Route::post('/player2-authenticate', function () {
    $credentials = request()->validate([
        'email' => ['required', 'email'],
        'password' => ['required'],
    ]);

    // Intentar autenticar
    $user = \App\Models\User::where('email', $credentials['email'])->first();
    
    if ($user && \Illuminate\Support\Facades\Hash::check($credentials['password'], $user->password)) {
        // Guardar el jugador 2 en sesión
        session(['player2_id' => $user->id]);
        return redirect()->route('faction.select', ['mode' => 'PVP', 'player2Type' => 'authenticated']);
    }

    return back()->withErrors([
        'email' => 'Las credenciales no coinciden con nuestros registros.',
    ]);
})->middleware(['auth'])->name('player2.authenticate');

Route::get('/faction-select', function () {
    $mode = request('mode', 'PVP');
    $player2Type = request('player2Type', 'guest');
    $player2 = null;
    
    if ($player2Type === 'authenticated' && session('player2_id')) {
        $player2 = \App\Models\User::find(session('player2_id'));
    }
    
    return Inertia::render('SelectorBando', [
        'mode' => $mode,
        'player2Type' => $player2Type,
        'player2' => $player2,
    ]);
})->middleware(['auth'])->name('faction.select');

Route::get('/game-arena', function () {
    $faction = request('faction', 'Z_WARRIORS');
    $mode = request('mode', 'PVP');
    $player2 = null;
    $player1Preferences = auth()->user()->piece_preferences ?? \App\Http\Controllers\PieceCustomizationController::getDefaultPiecePreferences();
    $player2Preferences = \App\Http\Controllers\PieceCustomizationController::getDefaultPiecePreferences(); // Default para invitados
    
    if ($mode === 'PVP' && session('player2_id')) {
        $player2 = \App\Models\User::with('stats')->find(session('player2_id'));
        if ($player2) {
            $player2Preferences = $player2->piece_preferences ?? \App\Http\Controllers\PieceCustomizationController::getDefaultPiecePreferences();
        }
    }
    
    return Inertia::render('Batalla', [
        'faction' => $faction,
        'mode' => $mode,
        'player2' => $player2,
        'player1Preferences' => $player1Preferences,
        'player2Preferences' => $player2Preferences,
    ]);
})->name('game.arena');

// Limpiar sesión de jugador 2
Route::post('/clear-player2-session', function () {
    session()->forget('player2_id');
    return response()->json(['success' => true]);
})->name('clear.player2.session');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Piece Customization
    Route::get('/pieces', [\App\Http\Controllers\PieceCustomizationController::class, 'index'])->name('pieces.index');
    Route::patch('/pieces', [\App\Http\Controllers\PieceCustomizationController::class, 'update'])->name('pieces.update');
});

require __DIR__.'/auth.php';
