<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@i-bijuteri.com'],
            [
                'password' => Hash::make('Admin123!'),
                'business_name' => 'i-Bijuteri Yönetim',
                'owner_name' => 'Sistem Yöneticisi',
                'role' => User::ROLE_SUPER_ADMIN,
                'is_verified' => true,
                'verification_status' => 'approved',
                'verified_at' => now(),
                'approved_at' => now(),
                'email_verified_at' => now(),
            ]
        );
    }
}
