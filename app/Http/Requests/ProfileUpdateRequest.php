<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:10',
                'regex:/^[a-zA-Z0-9_]+$/',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
            'avatar' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * Get custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.max' => 'El nombre de guerrero no puede tener más de 10 caracteres.',
            'name.unique' => 'Este nombre de guerrero ya está en uso.',
            'name.regex' => 'El nombre solo puede contener letras, números y guiones bajos.',
            'email.unique' => 'Este correo electrónico ya está registrado.',
            'email.email' => 'El formato del correo electrónico no es válido.',
        ];
    }
}
