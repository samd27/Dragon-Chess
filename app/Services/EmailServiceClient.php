<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EmailServiceClient
{
    protected string $baseUrl;
    protected string $secret;
    protected int $timeout;

    public function __construct()
    {
        $config = config('services.email');
        $this->baseUrl = rtrim($config['base_url'] ?? '', '/');
        $this->secret = (string) ($config['internal_secret'] ?? '');
        $this->timeout = (int) ($config['timeout'] ?? 5);
    }

    public function isConfigured(): bool
    {
        return !empty($this->baseUrl);
    }

    protected function client()
    {
        return Http::timeout($this->timeout)
            ->withHeaders([
                'x-internal-secret' => $this->secret,
            ]);
    }

    public function requestPasswordReset(string $email): bool
    {
        try {
            $response = $this->client()->post($this->baseUrl . '/internal/email/password-reset/request', [
                'email' => $email,
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Failed to request password reset via Email Service', ['error' => $e->getMessage()]);
            return false;
        }
    }

    public function verifyPasswordResetToken(string $email, string $token): bool
    {
        try {
            $response = $this->client()->post($this->baseUrl . '/internal/email/password-reset/verify-token', [
                'email' => $email,
                'token' => $token,
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Failed to verify password reset token via Email Service', ['error' => $e->getMessage()]);
            return false;
        }
    }

    public function sendProfileCreated(string $email, string $name): bool
    {
        try {
            $response = $this->client()->post($this->baseUrl . '/internal/email/profile-created/send', [
                'email' => $email,
                'name' => $name,
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Failed to send profile created email', ['error' => $e->getMessage()]);
            return false;
        }
    }

    public function loginNotification(string $email, string $name): bool
    {
        try {
            $response = $this->client()->post($this->baseUrl . '/internal/email/login/send', [
                'email' => $email,
                'name' => $name,
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Failed to send login notification email', ['error' => $e->getMessage()]);
            return false;
        }
    }
}
