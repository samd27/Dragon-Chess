<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\GameRewardService;
use App\Services\PlayerProgressionServiceClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class GameController extends Controller
{
    public function __construct(
        private GameRewardService $rewardService,
        private PlayerProgressionServiceClient $progressionService,
    ) {}

    /**
     * Guarda el resultado de una partida y devuelve las recompensas obtenidas.
     */
    public function saveResult(Request $request): JsonResponse
    {
        $request->validate([
            'result'         => 'required|in:win,loss,draw',
            'mode'           => 'required|in:PVC,PVP,DRAGON_PVC,DRAGON_PVP',
            'variant'        => 'nullable|in:CLASSIC,SPECIAL',
            'difficulty'     => 'nullable|integer|between:1,3',
            'opponent_ki'    => 'nullable|integer|min:0',
            'player2_id'     => 'nullable|integer',
            'player2_result' => 'nullable|in:win,loss,draw',
        ]);

        /** @var User $user */
        $user = $request->user();
        $rawMode = $request->mode;
        $isPvpMode = in_array($rawMode, ['PVP', 'DRAGON_PVP'], true);
        $baseMode = $isPvpMode ? 'PVP' : 'PVC';
        $isSpecialVariant = $request->variant
            ? $request->variant === 'SPECIAL'
            : in_array($rawMode, ['DRAGON_PVC', 'DRAGON_PVP'], true);

        Log::info('GameController@saveResult start', [
            'user_id' => $user->id,
            'mode' => $rawMode,
            'variant' => $request->variant,
            'result' => $request->result,
            'player2_id' => $request->player2_id,
            'player2_result' => $request->player2_result,
        ]);

        try {
            if ($baseMode === 'PVC') {
                $difficulty = (int) ($request->difficulty ?? 2);
                $rewards = $isSpecialVariant
                    ? $this->rewardService->calculateDragonPvcRewards($request->result, $difficulty)
                    : $this->rewardService->calculatePvcRewards($request->result, $difficulty);
            } else {
                $playerStats = $this->progressionService->ensure($user);
                $playerKi   = (int) ($playerStats['ki'] ?? 1000);
                $opponentKi = (int) ($request->opponent_ki ?? $playerKi);
                $rewards    = $isSpecialVariant
                    ? $this->rewardService->calculateDragonPvpRewards($request->result, $playerKi, $opponentKi)
                    : $this->rewardService->calculatePvpRewards($request->result, $playerKi, $opponentKi);
            }

            $levelResult = $this->progressionService->applyRewards($user, $rewards, $request->result);

            Log::info('GameController@saveResult progression applied', [
                'user_id' => $user->id,
                'mode' => $rawMode,
                'rewards' => $rewards,
                'level_result' => $levelResult,
            ]);

            // En PVP, guardar también las stats del jugador 2 si está autenticado
            $player2Payload = null;
            if ($baseMode === 'PVP' && $request->player2_id && $request->player2_result) {
                $player2 = User::find($request->player2_id);
                if ($player2 && $player2->id !== $user->id) {
                    $player2Stats  = $this->progressionService->ensure($player2);
                    $p2Ki          = (int) ($player2Stats['ki'] ?? 1000);
                    $p2Rewards     = $isSpecialVariant
                        ? $this->rewardService->calculateDragonPvpRewards($request->player2_result, $p2Ki, $playerKi)
                        : $this->rewardService->calculatePvpRewards($request->player2_result, $p2Ki, $playerKi);
                    $p2LevelResult = $this->progressionService->applyRewards($player2, $p2Rewards, $request->player2_result);
                    Log::info('GameController@saveResult player2 progression applied', [
                        'player2_id' => $player2->id,
                        'rewards' => $p2Rewards,
                        'level_result' => $p2LevelResult,
                    ]);
                    $player2Payload = [
                        'name'     => $player2->name,
                        'avatar'   => $player2->avatar,
                        'rewards'  => $p2Rewards,
                        'level_up' => $p2LevelResult,
                    ];
                }
            }

            return response()->json([
                'rewards'   => $rewards,
                'level_up'  => $levelResult,
                'player2'   => $player2Payload,
            ]);
        } catch (\Throwable $e) {
            Log::error('GameController@saveResult error: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'request' => $request->all(),
                'trace'   => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Compra un personaje de la tienda con Semillas Senzu.
     */
    public function purchaseCharacter(Request $request): JsonResponse
    {
        $request->validate([
            'character_id' => 'required|string',
            'price'        => 'required|integer|min:1',
        ]);

        /** @var User $user */
        $user   = $request->user();
        $result = $this->progressionService->purchaseCharacter(
            $user,
            $request->character_id,
            $request->price
        );

        return response()->json($result, $result['success'] ? 200 : 422);
    }

    /**
     * Renderiza la página del Pase de Batalla.
     */
    public function battlePass(Request $request)
    {
        return Inertia::render('BattlePass', [
            'unlock_all'  => $request->user()?->unlock_all ?? false,
        ]);
    }

    /**
     * Renderiza la página de la Tienda.
     */
    public function shop(Request $request)
    {
        return Inertia::render('Shop', [
            'unlock_all' => $request->user()?->unlock_all ?? false,
        ]);
    }
}
