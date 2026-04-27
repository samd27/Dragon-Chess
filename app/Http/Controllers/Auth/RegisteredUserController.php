<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\Exceptions\AuthServiceRequestException;
use App\Services\AuthServiceClient;
use App\Services\RemoteAuthUserSyncService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request, AuthServiceClient $authService, RemoteAuthUserSyncService $userSync): RedirectResponse
    {
        $request->validate([
            'name' => [
                'required',
                'string',
                'max:10',
                'regex:/^[a-zA-Z0-9_]+$/'
            ],
            'email' => 'required|string|lowercase|email|max:255',
            'password' => [
                'required',
                'confirmed',
                'min:8',
                'max:20',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/'
            ],
        ], [
            'name.max' => 'El nombre de guerrero no puede tener más de 10 caracteres.',
            'name.unique' => 'Este nombre de guerrero ya está en uso.',
            'name.regex' => 'El nombre solo puede contener letras, números y guiones bajos.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.max' => 'La contraseña no puede tener más de 20 caracteres.',
            'password.regex' => 'La contraseña debe incluir al menos una mayúscula, una minúscula, un número y un símbolo (@$!%*?&#).',
            'password.confirmed' => 'Las contraseñas no coinciden.',
        ]);

        try {
            $response = $authService->register([
                'name' => $request->name,
                'email' => $request->email,
                'password' => $request->password,
            ]);
        } catch (AuthServiceRequestException $e) {
            if ($e->status() === 422) {
                $payload = $e->payload();
                $code = (string) ($payload['code'] ?? 'AUTH_REGISTER_FAILED');
                $message = (string) ($payload['message'] ?? 'No se pudo registrar el usuario.');

                throw ValidationException::withMessages([
                    'email' => $code === 'EMAIL_ALREADY_EXISTS' ? 'Este correo ya está en uso.' : $message,
                    'name' => $code === 'NAME_ALREADY_EXISTS' ? 'Este nombre de guerrero ya está en uso.' : $message,
                ]);
            }

            throw $e;
        }

        $user = $userSync->sync($response['data'] ?? []);

        try {
            app(\App\Services\PlayerProgressionServiceClient::class)->ensure($user);
        } catch (\Throwable $e) {
            report($e);
        }

        event(new Registered($user));

        // No hacer login automaticamente, redirigir al login
        return redirect(route('login'))->with('status', '¡Registro exitoso! Inicia sesión con tus credenciales.');
    }
}
