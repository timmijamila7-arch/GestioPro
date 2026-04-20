<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Absence extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'date_absence',
        'motif',
        'justifiee',
        'fichier_justification',
        'enregistre_par',
    ];

    protected $casts = [
        'date_absence' => 'date',
        'justifiee'    => 'boolean',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function enregistrePar()
    {
        return $this->belongsTo(User::class, 'enregistre_par');
    }
}
