<?php

namespace App\Http\Controllers;

use App\Models\Absence;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class AbsenceController extends Controller
{
    // 📋 LISTER les absences
    public function index()
    {
        $user = Auth::user();

        if ($user->role === 'admin' || $user->role === 'rh') {
            $absences = Absence::with('employee')
                               ->orderBy('date_absence', 'desc')
                               ->get();
        } else {
            $absences = Absence::with('employee')
                               ->where('employee_id', $user->employee_id)
                               ->orderBy('date_absence', 'desc')
                               ->get();
        }

        return response()->json([
            'success' => true,
            'data'    => $absences
        ], 200);
    }

    // 💾 AJOUTER une absence
    public function store(Request $request)
    {
        $request->validate([
            'employee_id'           => 'required|exists:employees,id',
            'date_absence'          => 'required|date',
            'motif'                 => 'required|string|max:255',
            'justifiee'             => 'boolean',
            'fichier_justification' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        $data = $request->all();
        $data['enregistre_par'] = Auth::id();
        $data['justifiee']      = $request->boolean('justifiee');

        // Upload fichier
        if ($request->hasFile('fichier_justification')) {
            $data['fichier_justification'] = $request
                ->file('fichier_justification')
                ->store('justificatifs', 'public');
        }

        $absence = Absence::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Absence enregistrée avec succès.',
            'data'    => $absence
        ], 201);
    }

    // 👁️ AFFICHER une absence
    public function show(Absence $absence)
    {
        $this->autoriser($absence);

        return response()->json([
            'success' => true,
            'data'    => $absence->load('employee')
        ], 200);
    }

    public function update(Request $request, Absence $absence)
    {
        $this->autoriser($absence);

        $request->validate([
            'employee_id'           => 'required|exists:employees,id',
            'date_absence'          => 'required|date',
            'motif'                 => 'required|string|max:255',
            'justifiee'             => 'boolean',
            'fichier_justification' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        $data = $request->all();
        $data['justifiee'] = $request->boolean('justifiee');

        // Remplacer le fichier
        if ($request->hasFile('fichier_justification')) {
            if ($absence->fichier_justification) {
                Storage::disk('public')->delete($absence->fichier_justification);
            }
            $data['fichier_justification'] = $request
                ->file('fichier_justification')
                ->store('justificatifs', 'public');
        }

        $absence->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Absence modifiée avec succès.',
            'data'    => $absence
        ], 200);
    }

    public function destroy(Absence $absence)
    {
        if (Auth::user()->role !== 'admin' && Auth::user()->role !== 'rh') {
            return response()->json([
                'success' => false,
                'message' => 'Action non autorisée.'
            ], 403);
        }

        if ($absence->fichier_justification) {
            Storage::disk('public')->delete($absence->fichier_justification);
        }

        $absence->delete();

        return response()->json([
            'success' => true,
            'message' => 'Absence supprimée avec succès.'
        ], 200);
    }

    private function autoriser(Absence $absence)
    {
        $user = Auth::user();

        if ($user->role === 'admin' || $user->role === 'rh') {
            return;
        }

        if ($absence->employee_id !== $user->employee_id) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé.'
            ], 403);
        }
    }
}