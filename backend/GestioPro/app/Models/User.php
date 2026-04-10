<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory;

    protected $fillable = [
        'avatar',
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    // ✅ FIX: Relation hasOne — User -> Employee (via user_id f employees table)
    // Avant: relation kanet mktuba sah, walakin $user->employee_id ma kaynach
    // f users table — donc khas dima nkhdmu $user->employee->id
    public function employee()
    {
        return $this->hasOne(Employee::class, 'user_id');
    }

    public function congesValides()
    {
        return $this->hasMany(Conge::class, 'validateur_id');
    }

    public function absencesEnregistrees()
    {
        return $this->hasMany(Absence::class, 'enregistre_par');
    }

    // ✅ Helper accessor: $user->employee_id -> ykhrej id dyal employee dyalo
    // Khdda bhal property pour simplifier le code dans les controllers
    public function getEmployeeIdAttribute(): ?int
    {
        return $this->employee?->id;
    }
}
