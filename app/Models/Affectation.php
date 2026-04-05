<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Affectation extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'projet_id',
        'date_debut',
        'date_fin',
        'role_projet',
    ];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin'   => 'date',
    ];

    // Relations
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function projet()
    {
        return $this->belongsTo(Projet::class);
    }
}
