<?php

namespace App\Http\Requests\Api;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
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
        $role = $this->input('role', User::ROLE_BUYER);

        $rules = [
            'role' => ['required', 'string', 'in:'.implode(',', [User::ROLE_SELLER, User::ROLE_BUYER])],
            'email' => ['required', 'email', 'unique:users,email', 'max:255'],
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.,#^()_+=\-\[\]{}|\\:";\'<>,\/]).+$/',
            ],
            'business_name' => ['required', 'string', 'max:255'],
            'nickname' => ['required', 'string', 'min:3', 'max:100', 'unique:users,nickname'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'district' => ['nullable', 'string', 'max:100'],
        ];

        // Vergi numarasi (VKN/TCKN) zorunlulugu role gore
        if ($role === User::ROLE_SELLER) {
            $rules['tax_number'] = ['required', 'string', 'regex:/^[0-9]{10,11}$/', 'unique:users,tax_number'];
        } else {
            $rules['tax_number'] = ['nullable', 'string', 'regex:/^[0-9]{10,11}$/', 'unique:users,tax_number'];
        }

        return $rules;
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'role.required' => 'Hesap tipi secimi gereklidir.',
            'role.in' => 'Gecersiz hesap tipi.',
            'email.required' => 'E-posta adresi gereklidir.',
            'email.email' => 'Gecerli bir e-posta adresi giriniz.',
            'email.unique' => 'Bu e-posta adresi zaten kayitli.',
            'password.required' => 'Sifre gereklidir.',
            'password.min' => 'Sifre en az 8 karakter olmalidir.',
            'password.confirmed' => 'Sifre tekrari eslemiyor.',
            'password.regex' => 'Sifre en az bir buyuk harf, bir kucuk harf, bir rakam ve bir ozel karakter icermelidir.',
            'business_name.required' => 'Isletme adi gereklidir.',
            'nickname.required' => 'Rumuz gereklidir.',
            'nickname.min' => 'Rumuz en az 3 karakter olmalidir.',
            'nickname.max' => 'Rumuz en fazla 100 karakter olmalidir.',
            'nickname.unique' => 'Bu rumuz zaten kullanilmaktadir.',
            'tax_number.required' => 'Vergi numarasi gereklidir.',
            'tax_number.regex' => 'Vergi numarasi 10 (VKN) veya 11 (TCKN) haneli olmalidir.',
            'tax_number.unique' => 'Bu vergi numarasi zaten kayitli.',
        ];
    }
}
