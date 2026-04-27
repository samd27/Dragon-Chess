<?php

namespace App\Http\Requests\Auth;

use App\Services\AuthServiceClient;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): array
    {
        $this->ensureIsNotRateLimited();

        try {
            $response = app(AuthServiceClient::class)->login([
                'email' => $this->input('email'),
                'password' => $this->input('password'),
                'remember' => $this->boolean('remember'),
            ]);
        } catch (\App\Services\Exceptions\AuthServiceRequestException $e) {
            RateLimiter::hit($this->throttleKey());

            if ($e->status() === 422) {
                throw ValidationException::withMessages([
                    'email' => (string) ($e->payload()['message'] ?? trans('auth.failed')),
                ]);
            }

            throw $e;
        }

        RateLimiter::clear($this->throttleKey());

        return $response;
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('email')).'|'.$this->ip());
    }
}
