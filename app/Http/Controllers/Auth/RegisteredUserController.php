<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Controllers\PieceCustomizationController;
use App\Models\User;
use App\Models\PlayerStats;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
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
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => [
                'required',
                'string',
                'max:10',
                'unique:'.User::class,
                'regex:/^[a-zA-Z0-9_]+$/'
            ],
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
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

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'piece_preferences' => PieceCustomizationController::getDefaultPiecePreferences(),
        ]);

        // Crear estadísticas iniciales del jugador
        PlayerStats::create([
            'user_id' => $user->id,
            'level' => 1,
            'victories' => 0,
            'ki' => 0,
        ]);

        event(new Registered($user));

        // No hacer login automaticamente, redirigir al login
        return redirect(route('login'))->with('status', '¡Registro exitoso! Inicia sesión con tus credenciales.');
    }
}
