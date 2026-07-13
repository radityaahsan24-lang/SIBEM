<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Admin SIBEM',
            'email' => 'admin@sibem.com',
            'password' => \Illuminate\Support\Facades\Hash::make('admin123'),
            'role' => 'admin',
        ]);

        User::factory()->create([
            'name' => 'Presiden BEM',
            'email' => 'presbem@sibem.com',
            'password' => \Illuminate\Support\Facades\Hash::make('presbem123'),
            'role' => 'user',
        ]);
    }
}
