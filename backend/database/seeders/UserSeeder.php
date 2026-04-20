<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::factory()->create([
        'name'     => 'Hamza Hadfi',
        'email'    => 'Hadfi@gmail.com',
        'password' => Hash::make('admin4321'),
        'role'     => 'admin',
    ]);
        User::factory()->create([
        'name'     => 'Jamila Timmi',
        'email'    => 'Timmi@gmail.com',
        'password' => Hash::make('admin4321'),
        'role'     => 'admin',
    ]);
    }
}
