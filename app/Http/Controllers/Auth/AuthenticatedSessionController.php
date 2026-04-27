<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\AuthServiceClient;
use App\Services\RemoteAuthUserSyncService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request, RemoteAuthUserSyncService $userSync): RedirectResponse
    {
        $response = $request->authenticate();

        $user = $userSync->sync($response['data'] ?? []);

        Auth::login($user, (bool) ($response['meta']['remember'] ?? false));

        $request->session()->regenerate();

        return redirect()->intended(route('welcome'));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request, AuthServiceClient $authService): RedirectResponse
    {
        $currentUser = $request->user();
        if ($currentUser?->auth_service_id) {
            try {
                $authService->logout([
                    'userId' => $currentUser->auth_service_id,
                    'sessionKey' => (string) $request->session()->getId(),
                    'sessionType' => 'web',
                ]);
                $authService->revokeSession([
                    'sessionKey' => (string) $request->session()->getId(),
                    'sessionType' => 'web',
                ]);
            } catch (\Throwable $e) {
                report($e);
            }
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
