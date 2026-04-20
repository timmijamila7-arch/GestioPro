<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'matricule',
        'nom',
        'prenom',
        'cin',
        'date_naissance',
        'date_embauche',
        'poste',
        'departement',
        'telephone',
        'adresse',
        'statut',
    ];

    protected $casts = [
        'date_naissance' => 'date',
        'date_embauche'  => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function affectations()
    {
        return $this->hasMany(Affectation::class);
    }

    public function projets()
    {
        return $this->hasManyThrough(Projet::class, Affectation::class, 'employee_id', 'id', 'id', 'projet_id');
    }

    public function conges()
    {
        return $this->hasMany(Conge::class);
    }

    public function absences()
    {
        return $this->hasMany(Absence::class);
    }
}
