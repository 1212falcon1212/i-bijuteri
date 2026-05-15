<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class PreservedUsersSeeder extends Seeder
{
    /**
     * Preserved users from before database reset.
     * Run this seeder after migrate:fresh to restore important accounts.
     */
    public function run(): void
    {
        // Admin user
        User::create([
            'email' => 'admin@eczanepazari.com',
            'password' => '$2y$12$aKNyJHmg.tKiKk2QFa6IO.WI5OyDUdcFv76aisCLkonhSEWec7lly', // Same password hash
            'business_name' => 'EczanePazarı Admin',
            'nickname' => 'EczanePazari',
            'phone' => null,
            'address' => null,
            'city' => 'İstanbul',
            'role' => 'super-admin',
            'gln_code' => '8680000000000',
            'is_verified' => true,
            'verification_status' => 'approved',
            'email_verified_at' => now(),
        ]);

        // Real user - o10sahin@gmail.com (Falcon)
        User::create([
            'email' => 'o10sahin@gmail.com',
            'password' => '$2y$12$Se8Rf4SCTlyt77fJjlV6AOPDVXdB9z5x1AyMbC.RvSue4nrSipJPi', // Same password hash
            'business_name' => 'Falcon',
            'nickname' => 'Falcon34',
            'phone' => null,
            'address' => null,
            'city' => null,
            'role' => 'company',
            'gln_code' => null,
            'is_verified' => true,
            'verification_status' => 'pending',
            'email_verified_at' => now(),
        ]);

        $this->command->info('Preserved users restored: admin@eczanepazari.com, o10sahin@gmail.com');
    }
}