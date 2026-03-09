<?php

use App\Http\Controllers\GameController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    $stats      = null;
    $unlockAll  = false;
    if (auth()->check()) {
        $stats     = auth()->user()->stats;
        $unlockAll = auth()->user()->unlock_all ?? false;
    }
    
    return Inertia::render('Inicio', [
        'canLogin'    => Route::has('login'),
        'canRegister' => Route::has('register'),
        'stats'       => $stats,
        'unlock_all'  => $unlockAll,
    ]);
})->name('welcome');

Route::get('/game-mode', function () {
    return Inertia::render('ModoJuego');
})->middleware(['auth'])->name('game.mode');

// Selección de Jugador 2 (PvP)
Route::get('/player2-select', function () {
    $rawMode = request('mode', 'PVP');
    $mode = in_array($rawMode, ['PVP', 'DRAGON_PVP'], true) ? 'PVP' : 'PVC';
    $variant = request('variant', in_array($rawMode, ['DRAGON_PVP', 'DRAGON_PVC'], true) ? 'SPECIAL' : 'CLASSIC');
    $difficulty = (int) request('difficulty', 2);

    return Inertia::render('SeleccionJugador2', [
        'mode' => $mode,
        'variant' => $variant,
        'difficulty' => $difficulty,
    ]);
})->middleware(['auth'])->name('player2.select');

// Login de Jugador 2
Route::get('/player2-login', function () {
    $rawMode = request('mode', 'PVP');
    $mode = in_array($rawMode, ['PVP', 'DRAGON_PVP'], true) ? 'PVP' : 'PVC';
    $variant = request('variant', in_array($rawMode, ['DRAGON_PVP', 'DRAGON_PVC'], true) ? 'SPECIAL' : 'CLASSIC');
    $difficulty = (int) request('difficulty', 2);

    return Inertia::render('Auth/LoginJugador2', [
        'mode' => $mode,
        'variant' => $variant,
        'difficulty' => $difficulty,
    ]);
})->middleware(['auth'])->name('player2.login');

// Autenticación de Jugador 2
Route::post('/player2-authenticate', function () {
    $credentials = request()->validate([
        'email' => ['required', 'email'],
        'password' => ['required'],
        'mode' => ['nullable', 'in:PVP,PVC,DRAGON_PVP,DRAGON_PVC'],
        'variant' => ['nullable', 'in:CLASSIC,SPECIAL'],
        'difficulty' => ['nullable', 'integer', 'between:1,3'],
    ]);

    $rawMode = request('mode', 'PVP');
    $mode = in_array($rawMode, ['PVP', 'DRAGON_PVP'], true) ? 'PVP' : 'PVC';
    $variant = request('variant', in_array($rawMode, ['DRAGON_PVP', 'DRAGON_PVC'], true) ? 'SPECIAL' : 'CLASSIC');
    $difficulty = (int) request('difficulty', 2);

    // Intentar autenticar
    $user = \App\Models\User::where('email', $credentials['email'])->first();
    
    if ($user && \Illuminate\Support\Facades\Hash::check($credentials['password'], $user->password)) {
        // Verificar que el jugador 2 no sea la misma cuenta que el jugador 1
        if ($user->id === auth()->id()) {
            return back()->withErrors([
                'email' => 'El jugador 2 no puede iniciar sesión con la misma cuenta que el jugador 1.',
            ]);
        }

        // Guardar el jugador 2 en sesión
        session(['player2_id' => $user->id]);
        return redirect()->route('faction.select', [
            'mode' => $mode,
            'variant' => $variant,
            'difficulty' => $difficulty,
            'player2Type' => 'authenticated',
        ]);
    }

    return back()->withErrors([
        'email' => 'Las credenciales no coinciden con nuestros registros.',
    ]);
})->middleware(['auth'])->name('player2.authenticate');

Route::get('/faction-select', function () {
    $rawMode = request('mode', 'PVP');
    $mode = in_array($rawMode, ['PVP', 'DRAGON_PVP'], true) ? 'PVP' : 'PVC';
    $variant = request('variant', in_array($rawMode, ['DRAGON_PVP', 'DRAGON_PVC'], true) ? 'SPECIAL' : 'CLASSIC');
    $player2Type = request('player2Type', 'guest');
    $difficulty = (int) request('difficulty', 2);
    $player2 = null;
    
    if ($player2Type === 'authenticated' && session('player2_id')) {
        $player2 = \App\Models\User::find(session('player2_id'));
    }
    
    return Inertia::render('SelectorBando', [
        'mode' => $mode,
        'variant' => $variant,
        'player2Type' => $player2Type,
        'player2' => $player2,
        'difficulty' => $difficulty,
    ]);
})->middleware(['auth'])->name('faction.select');

Route::get('/game-arena', function () {
    $faction = request('faction', 'Z_WARRIORS');
    $rawMode = request('mode', 'PVP');
    $mode = in_array($rawMode, ['PVP', 'DRAGON_PVP'], true) ? 'PVP' : 'PVC';
    $variant = request('variant', in_array($rawMode, ['DRAGON_PVP', 'DRAGON_PVC'], true) ? 'SPECIAL' : 'CLASSIC');
    $difficulty = (int) request('difficulty', 2);
    $player2 = null;
    $player1Preferences = \App\Http\Controllers\PieceCustomizationController::normalizePreferences(
        auth()->user()->piece_preferences ?? \App\Http\Controllers\PieceCustomizationController::getDefaultPiecePreferences()
    );
    $player2Preferences = \App\Http\Controllers\PieceCustomizationController::getDefaultPiecePreferences(); // Default para invitados
    
    if ($mode === 'PVP' && session('player2_id')) {
        $player2 = \App\Models\User::with('stats')->find(session('player2_id'));
        if ($player2) {
            $player2Preferences = \App\Http\Controllers\PieceCustomizationController::normalizePreferences(
                $player2->piece_preferences ?? \App\Http\Controllers\PieceCustomizationController::getDefaultPiecePreferences()
            );
        }
    }
    
    return Inertia::render('Batalla', [
        'faction' => $faction,
        'mode' => $mode,
        'variant' => $variant,
        'difficulty' => $difficulty,
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

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Piece Customization
    Route::get('/pieces', [\App\Http\Controllers\PieceCustomizationController::class, 'index'])->name('pieces.index');
    Route::patch('/pieces', [\App\Http\Controllers\PieceCustomizationController::class, 'update'])->name('pieces.update');

    // Game results & progression
    Route::post('/game/save-result', [GameController::class, 'saveResult'])->name('game.save-result');

    // Shop — compra con Semillas Senzu
    Route::post('/shop/purchase', [GameController::class, 'purchaseCharacter'])->name('shop.purchase');

    // Battle Pass
    Route::get('/battle-pass', [GameController::class, 'battlePass'])->name('battle.pass');

    // Tienda
    Route::get('/shop', [GameController::class, 'shop'])->name('shop.index');
});

require __DIR__.'/auth.php';
