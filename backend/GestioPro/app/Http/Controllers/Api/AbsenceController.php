<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
    public function show(string $id)
    {
        $absence = Absence::with('employee')->find($id);

        if (!$absence) {
            return response()->json([
                'success' => false,
                'message' => 'Absence non trouvée.'
            ], 404);
        }

        $this->autoriser($absence);

        return response()->json([
            'success' => true,
            'data'    => $absence
        ], 200);
    }

    // 🔄 MODIFIER une absence
    public function update(Request $request, string $id)
    {
        $absence = Absence::find($id);

        if (!$absence) {
            return response()->json([
                'success' => false,
                'message' => 'Absence non trouvée.'
            ], 404);
        }

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

    // 🗑️ SUPPRIMER une absence
    public function destroy(string $id)
    {
        if (Auth::user()->role !== 'admin' && Auth::user()->role !== 'rh') {
            return response()->json([
                'success' => false,
                'message' => 'Action non autorisée.'
            ], 403);
        }

        $absence = Absence::find($id);

        if (!$absence) {
            return response()->json([
                'success' => false,
                'message' => 'Absence non trouvée.'
            ], 404);
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

    // 🔒 Vérifier les droits d'accès
    private function autoriser(Absence $absence)
    {
        $user = Auth::user();

        if ($user->role === 'admin' || $user->role === 'rh') {
            return;
        }

        if ($absence->employee_id !== $user->employee_id) {
            abort(response()->json([
                'success' => false,
                'message' => 'Accès non autorisé.'
            ], 403));
        }
    }
}