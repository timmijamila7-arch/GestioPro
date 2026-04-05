<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Projet extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'description',
        'date_debut',
        'date_fin',
        'statut',
        'budget',
    ];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin'   => 'date',
        'budget'     => 'decimal:2',
    ];

    // Relations
    public function affectations()
    {
        return $this->hasMany(Affectation::class);
    }

    public function employees()
    {
        return $this->hasManyThrough(Employee::class, Affectation::class, 'projet_id', 'id', 'id', 'employee_id');
    }
}
