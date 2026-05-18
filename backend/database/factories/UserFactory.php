<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    protected $model = User::class;

    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'email' => fake()->unique()->safeEmail(),
            'password' => static::$password ??= Hash::make('Password123!'),
            'business_name' => fake()->company().' Bijuteri',
            'nickname' => fake()->company().' Toptan',
            'tax_number' => fake()->numerify('##########'),
            'phone' => '5'.fake()->numerify('##').fake()->numerify('#######'),
            'address' => fake()->streetAddress(),
            'city' => fake()->randomElement(['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'Adana', 'Konya']),
            'role' => User::ROLE_SELLER,
            'is_verified' => true,
            'verification_status' => 'approved',
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the user's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
            'is_verified' => false,
            'verification_status' => 'pending',
        ]);
    }

    /**
     * Super admin user
     */
    public function superAdmin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'super-admin',
            'is_verified' => true,
            'verification_status' => 'approved',
        ]);
    }

    /**
     * Seller user that can list offers.
     */
    public function seller(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => User::ROLE_SELLER,
            'is_verified' => true,
            'verification_status' => 'approved',
        ]);
    }

    /**
     * Pending verification user
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_verified' => false,
            'verification_status' => 'pending',
        ]);
    }

    /**
     * Rejected user
     */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_verified' => false,
            'verification_status' => 'rejected',
            'rejection_reason' => 'Belgeler eksik veya geçersiz.',
        ]);
    }

    /**
     * Set specific tax number.
     */
    public function withTaxNumber(string $taxNumber): static
    {
        return $this->state(fn (array $attributes) => [
            'tax_number' => $taxNumber,
        ]);
    }

    /**
     * Set specific city
     */
    public function inCity(string $city): static
    {
        return $this->state(fn (array $attributes) => [
            'city' => $city,
        ]);
    }
}
