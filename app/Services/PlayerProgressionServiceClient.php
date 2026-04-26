<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;

class PlayerProgressionServiceClient
{
    private function baseUrl(): string
    {
        $baseUrl = trim((string) config('services.player_progression.base_url', ''));

        if ($baseUrl === '') {
            return '';
        }

        // Railway internal hosts are often configured without scheme.
        if (! str_contains($baseUrl, '://')) {
            $baseUrl = 'http://' . $baseUrl;
        }

        $parts = parse_url($baseUrl);
        $host = (string) ($parts['host'] ?? '');
        $port = $parts['port'] ?? null;

        // Railway internal DNS usually requires the service port for direct service-to-service HTTP.
        if ($host !== '' && str_ends_with($host, '.railway.internal') && $port === null) {
            $baseUrl .= ':5000';
        }

        return rtrim($baseUrl, '/');
    }

    private function playerPath(): string
    {
        return '/' . ltrim((string) config('services.player_progression.player_path', '/api/players'), '/');
    }

    private function request(string $method, string $path, array $payload = []): array
    {
        $baseUrl = $this->baseUrl();

        if ($baseUrl === '') {
            throw new \RuntimeException('PLAYER_PROGRESSION_SERVICE_URL is not configured');
        }

        try {
            $response = Http::timeout((int) config('services.player_progression.timeout', 8))
                ->acceptJson()
                ->send($method, $baseUrl . $path, ['json' => $payload]);
        } catch (\Throwable $e) {
            throw new \RuntimeException(
                'Unable to reach player progression service at ' . $baseUrl . ': ' . $e->getMessage(),
                0,
                $e
            );
        }

        if (! $response->successful()) {
            throw new \RuntimeException((string) ($response->json('error') ?? 'Player progression request failed'));
        }

        return $response->json() ?? [];
    }

    public function ensure(User $user): array
    {
        return $this->extractPlayer($this->request('PUT', $this->playerPath() . '/' . $user->id . '/progression/ensure'));
    }

    public function getProgression(User $user): array
    {
        return $this->extractPlayer($this->request('GET', $this->playerPath() . '/' . $user->id . '/progression'));
    }

    public function applyRewards(User $user, array $rewards, string $result): array
    {
        return $this->request('POST', $this->playerPath() . '/' . $user->id . '/progression/apply-rewards', [
            'result' => $result,
            'rewards' => $rewards,
        ]);
    }

    public function purchaseCharacter(User $user, string $characterId, int $price): array
    {
        return $this->request('POST', $this->playerPath() . '/' . $user->id . '/progression/purchase-character', [
            'character_id' => $characterId,
            'price' => $price,
        ]);
    }

    private function extractPlayer(array $payload): array
    {
        return $payload['player'] ?? $payload['stats'] ?? $payload;
    }
}