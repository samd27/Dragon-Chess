<?php

namespace App\Services;

use App\Services\Exceptions\AuthServiceRequestException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

class AuthServiceClient
{
    private function normalizeBaseUrl(string $value): string
    {
        $baseUrl = trim($value);

        if ($baseUrl === '') {
            return '';
        }

        if (! str_contains($baseUrl, '://')) {
            $baseUrl = 'http://' . $baseUrl;
        }

        $parts = parse_url($baseUrl);
        $host = (string) ($parts['host'] ?? '');
        $port = $parts['port'] ?? null;

        if ($host !== '' && str_ends_with($host, '.railway.internal') && $port === null) {
            $baseUrl .= ':8080';
        }

        return rtrim($baseUrl, '/');
    }

    /**
     * @return array<int, string>
     */
    private function baseUrls(): array
    {
        $candidates = [
            (string) config('services.auth.base_url', ''),
            (string) config('services.auth.fallback_url', ''),
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

    private function authPath(): string
    {
        return '/' . ltrim((string) config('services.auth.auth_path', '/internal/auth'), '/');
    }

    private function request(string $method, string $path, array $payload = []): array
    {
        $baseUrls = $this->baseUrls();

        if ($baseUrls === []) {
            throw new \RuntimeException('AUTH_SERVICE_URL is not configured');
        }

        $secret = trim((string) config('services.auth.internal_secret', ''));
        if ($secret === '') {
            throw new \RuntimeException('AUTH_SERVICE_INTERNAL_SECRET is not configured');
        }

        $lastError = null;
        foreach ($baseUrls as $baseUrl) {
            try {
                $response = Http::timeout((int) config('services.auth.timeout', 8))
                    ->acceptJson()
                    ->withHeaders(['x-internal-secret' => $secret])
                    ->send($method, $baseUrl . $path, ['json' => $payload]);

                $decoded = $response->json() ?? [];
                if (! $response->successful()) {
                    $lastError = [
                        'status' => $response->status(),
                        'payload' => is_array($decoded) ? $decoded : [],
                    ];
                    continue;
                }

                return is_array($decoded) ? $decoded : [];
            } catch (ConnectionException $e) {
                $lastError = ['status' => 503, 'payload' => ['success' => false, 'message' => $e->getMessage()]];
            } catch (\Throwable $e) {
                $lastError = ['status' => 500, 'payload' => ['success' => false, 'message' => $e->getMessage()]];
            }
        }

        $payloadError = $lastError['payload'] ?? ['success' => false, 'message' => 'Auth service request failed'];
        $message = (string) ($payloadError['message'] ?? 'Auth service request failed');
        throw new AuthServiceRequestException($message, (int) ($lastError['status'] ?? 500), $payloadError);
    }

    public function register(array $payload): array
    {
        return $this->request('POST', $this->authPath() . '/register', $payload);
    }

    public function login(array $payload): array
    {
        return $this->request('POST', $this->authPath() . '/login', $payload);
    }

    public function player2(array $payload): array
    {
        return $this->request('POST', $this->authPath() . '/player2', $payload);
    }

    public function logout(array $payload): array
    {
        return $this->request('POST', $this->authPath() . '/logout', $payload);
    }

    public function createSession(array $payload): array
    {
        return $this->request('POST', $this->authPath() . '/session', $payload);
    }

    public function revokeSession(array $payload): array
    {
        return $this->request('POST', $this->authPath() . '/session/revoke', $payload);
    }
}
