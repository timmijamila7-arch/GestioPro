<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conge extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'type_conge',
        'date_debut',
        'date_fin',
        'motif',
        'statut',
        'validateur_id',
        'commentaire',
    ];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin'   => 'date',
    ];

    
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function validateur()
    {
        return $this->belongsTo(User::class, 'validateur_id');
    }

    public function getDuree(): int
    {
        return $this->date_debut->diffInDays($this->date_fin) + 1;
    }

    public function isPending(): bool
    {
        return $this->statut === 'en_attente';
    }
}
