<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;

class PlayerProgressionServiceClient
{
    private function normalizeBaseUrl(string $value): string
    {
        $baseUrl = trim($value);

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

    /**
     * @return array<int, string>
     */
    private function baseUrls(): array
    {
        $candidates = [
            (string) config('services.player_progression.base_url', ''),
            (string) config('services.player_progression.fallback_url', ''),
        ];

        $urls = [];
        foreach ($candidates as $candidate) {
            $normalized = $this->normalizeBaseUrl($candidate);
            if ($normalized !== '' && ! in_array($normalized, $urls, true)) {
                $urls[] = $normalized;
            }
        }

        return $urls;
    }

    private function playerPath(): string
    {
        return '/' . ltrim((string) config('services.player_progression.player_path', '/api/players'), '/');
    }

    private function request(string $method, string $path, array $payload = []): array
    {
        $baseUrls = $this->baseUrls();

        if ($baseUrls === []) {
            throw new \RuntimeException('PLAYER_PROGRESSION_SERVICE_URL is not configured');
        }

        $lastError = null;
        foreach ($baseUrls as $baseUrl) {
            try {
                $response = Http::timeout((int) config('services.player_progression.timeout', 8))
                    ->acceptJson()
                    ->send($method, $baseUrl . $path, ['json' => $payload]);

                if (! $response->successful()) {
                    $lastError = new \RuntimeException((string) ($response->json('error') ?? 'Player progression request failed'));
                    continue;
                }

                return $response->json() ?? [];
            } catch (\Throwable $e) {
                $lastError = new \RuntimeException(
                    'Unable to reach player progression service at ' . $baseUrl . ': ' . $e->getMessage(),
                    0,
                    $e
                );
            }
        }

        throw $lastError ?? new \RuntimeException('Player progression request failed');
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