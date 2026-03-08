<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\GameRewardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class GameController extends Controller
{
    public function __construct(private GameRewardService $rewardService) {}

    /**
     * Guarda el resultado de una partida y devuelve las recompensas obtenidas.
     */
    public function saveResult(Request $request): JsonResponse
    {
        $request->validate([
            'result'         => 'required|in:win,loss,draw',
            'mode'           => 'required|in:PVC,PVP,DRAGON_PVC,DRAGON_PVP',
            'difficulty'     => 'nullable|integer|between:1,3',
            'opponent_ki'    => 'nullable|integer|min:0',
            'player2_id'     => 'nullable|integer',
            'player2_result' => 'nullable|in:win,loss,draw',
        ]);

        /** @var User $user */
        $user = $request->user();

        try {
            if (in_array($request->mode, ['PVC', 'DRAGON_PVC'], true)) {
                $difficulty = (int) ($request->difficulty ?? 2);
                $rewards = $request->mode === 'DRAGON_PVC'
                    ? $this->rewardService->calculateDragonPvcRewards($request->result, $difficulty)
                    : $this->rewardService->calculatePvcRewards($request->result, $difficulty);
            } else {
                $playerKi   = $user->stats?->ki ?? 1000;
                $opponentKi = (int) ($request->opponent_ki ?? $playerKi);
                $rewards    = $request->mode === 'DRAGON_PVP'
                    ? $this->rewardService->calculateDragonPvpRewards($request->result, $playerKi, $opponentKi)
                    : $this->rewardService->calculatePvpRewards($request->result, $playerKi, $opponentKi);
            }

            $levelResult = $this->rewardService->applyRewards($user, $rewards, $request->result);

            // En PVP, guardar también las stats del jugador 2 si está autenticado
            $player2Payload = null;
            if (in_array($request->mode, ['PVP', 'DRAGON_PVP'], true) && $request->player2_id && $request->player2_result) {
                $player2 = User::find($request->player2_id);
                if ($player2 && $player2->id !== $user->id) {
                    $p2Ki          = $player2->stats?->ki ?? 1000;
                    $p2Rewards     = $request->mode === 'DRAGON_PVP'
                        ? $this->rewardService->calculateDragonPvpRewards($request->player2_result, $p2Ki, $playerKi)
                        : $this->rewardService->calculatePvpRewards($request->player2_result, $p2Ki, $playerKi);
                    $p2LevelResult = $this->rewardService->applyRewards($player2, $p2Rewards, $request->player2_result);
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
        $result = $this->rewardService->purchaseCharacter(
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
        $user  = $request->user();
        $stats = $user?->stats;

        return Inertia::render('BattlePass', [
            'stats'       => $stats,
            'unlock_all'  => $user?->unlock_all ?? false,
        ]);
    }

    /**
     * Renderiza la página de la Tienda.
     */
    public function shop(Request $request)
    {
        $user  = $request->user();
        $stats = $user?->stats;

        return Inertia::render('Shop', [
            'stats'      => $stats,
            'unlock_all' => $user?->unlock_all ?? false,
        ]);
    }
}
