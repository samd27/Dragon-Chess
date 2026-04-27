<?php

use App\Http\Controllers\GameController;
use App\Http\Controllers\ProfileController;
use App\Services\AuthServiceClient;
use App\Services\ChessEngineGrpcService;
use App\Services\PlayerProgressionServiceClient;
use App\Services\RemoteAuthUserSyncService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/media/catalog', function () {
    $baseUrl = rtrim((string) config('services.media.base_url', ''), '/');
    $catalogPath = '/' . ltrim((string) config('services.media.catalog_path', '/api/media/catalog'), '/');

    if ($baseUrl === '') {
        return response()->json([
            'success' => false,
            'error' => 'MEDIA_SERVICE_URL is not configured',
        ], 503);
    }

    try {
        $response = Http::timeout(12)->acceptJson()->get($baseUrl . $catalogPath);

        return response($response->body(), $response->status())
            ->header('Content-Type', 'application/json');
    } catch (\Throwable $e) {
        return response()->json([
            'success' => false,
            'error' => 'Media catalog proxy request failed',
            'detail' => $e->getMessage(),
        ], 502);
    }
})->name('media.catalog.proxy');

Route::post('/media/catalog/sync', function () {
    $baseUrl = rtrim((string) config('services.media.base_url', ''), '/');
    
    if ($baseUrl === '') {
        return response()->json([
            'success' => false,
            'error' => 'MEDIA_SERVICE_URL is not configured',
        ], 503);
    }

    try {
        $response = Http::timeout(30)->acceptJson()->post($baseUrl . '/api/media/catalog/sync', []);

        return response($response->body(), $response->status())
            ->header('Content-Type', 'application/json');
    } catch (\Throwable $e) {
        return response()->json([
            'success' => false,
            'error' => 'Media sync request failed',
            'detail' => $e->getMessage(),
        ], 502);
    }
})->name('media.catalog.sync');

Route::post('/ai/best-move', function () {
    $validated = request()->validate([
        'fen' => ['required', 'string'],
        'difficulty' => ['nullable', 'integer', 'between:1,3'],
    ]);

    try {
        $service = app(ChessEngineGrpcService::class);
        $payload = $service->getBestMove(
            $validated['fen'],
            (int) ($validated['difficulty'] ?? 2)
        );
        $transport = (string) ($payload['_transport'] ?? 'unknown');
        unset($payload['_transport']);

        return response()->json($payload)
            ->header('X-AI-Transport', $transport);
    } catch (\Throwable $e) {
        return response()->json([
            'success' => false,
            'error' => 'Chess engine best-move request failed',
            'detail' => $e->getMessage(),
        ], 502);
    }
})->middleware(['auth'])->name('ai.best-move.proxy');

Route::post('/ai/analyze', function () {
    $validated = request()->validate([
        'fen' => ['required', 'string'],
        'difficulty' => ['nullable', 'integer', 'between:1,3'],
        'multiPv' => ['nullable', 'integer', 'between:1,12'],
    ]);

    try {
        $service = app(ChessEngineGrpcService::class);
        $payload = $service->analyzePosition(
            $validated['fen'],
            (int) ($validated['difficulty'] ?? 2),
            (int) ($validated['multiPv'] ?? 5)
        );
        $transport = (string) ($payload['_transport'] ?? 'unknown');
        unset($payload['_transport']);

        return response()->json($payload)
            ->header('X-AI-Transport', $transport);
    } catch (\Throwable $e) {
        return response()->json([
            'success' => false,
            'error' => 'Chess engine analyze request failed',
            'detail' => $e->getMessage(),
        ], 502);
    }
})->middleware(['auth'])->name('ai.analyze.proxy');

Route::get('/', function () {
    return Inertia::render('Inicio', [
        'canLogin'    => Route::has('login'),
        'canRegister' => Route::has('register'),
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

    try {
        $response = app(AuthServiceClient::class)->player2([
            'email' => $credentials['email'],
            'password' => $credentials['password'],
            'player1Id' => (int) (auth()->user()?->auth_service_id ?? auth()->id() ?? 0),
        ]);

        $player2 = app(RemoteAuthUserSyncService::class)->sync($response['data'] ?? []);
        session(['player2_id' => $player2->id]);

        return redirect()->route('faction.select', [
            'mode' => $mode,
            'variant' => $variant,
            'difficulty' => $difficulty,
            'player2Type' => 'authenticated',
        ]);
    } catch (\App\Services\Exceptions\AuthServiceRequestException $e) {
        if ($e->status() === 422 && str_contains((string) ($e->payload()['code'] ?? ''), 'SAME_ACCOUNT_NOT_ALLOWED')) {
            return back()->withErrors([
                'email' => 'El jugador 2 no puede iniciar sesión con la misma cuenta que el jugador 1.',
            ]);
        }

        return back()->withErrors([
            'email' => 'Las credenciales no coinciden con nuestros registros.',
        ]);
    }
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
    $progressionService = app(PlayerProgressionServiceClient::class);
    $player1Preferences = \App\Http\Controllers\PieceCustomizationController::normalizePreferences(
        auth()->user()->piece_preferences ?? \App\Http\Controllers\PieceCustomizationController::getDefaultPiecePreferences()
    );
    $player2Preferences = \App\Http\Controllers\PieceCustomizationController::getDefaultPiecePreferences(); // Default para invitados
    
    if ($mode === 'PVP' && session('player2_id')) {
        $player2 = \App\Models\User::find(session('player2_id'));
        if ($player2) {
            $player2Preferences = \App\Http\Controllers\PieceCustomizationController::normalizePreferences(
                $player2->piece_preferences ?? \App\Http\Controllers\PieceCustomizationController::getDefaultPiecePreferences()
            );

            try {
                $player2 = [
                    'id' => $player2->id,
                    'name' => $player2->name,
                    'avatar' => $player2->avatar,
                    'email' => $player2->email,
                    'stats' => $progressionService->getProgression($player2),
                ];
            } catch (\Throwable $e) {
                $player2 = [
                    'id' => $player2->id,
                    'name' => $player2->name,
                    'avatar' => $player2->avatar,
                    'email' => $player2->email,
                    'stats' => null,
                ];
            }
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
