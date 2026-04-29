<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    /**
     * Display the password reset link request view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming password reset link request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $emailService = new \App\Services\EmailServiceClient();
        
        if (!$emailService->isConfigured()) {
            return back()->with('status', 'Servicio de correos inactivo.');
        }

        $success = $emailService->requestPasswordReset($request->email);

        if ($success) {
            return back()->with('status', __('passwords.sent'));
        }

        throw ValidationException::withMessages([
            'email' => [trans('passwords.user')],
        ]);
    }
}
