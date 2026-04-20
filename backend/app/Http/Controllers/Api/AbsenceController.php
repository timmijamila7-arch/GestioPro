<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Absence;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class AbsenceController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if ($user->role === 'admin') {
            $absences = Absence::with(['employee', 'enregistrePar'])
                ->orderBy('date_absence', 'desc')
                ->get();
        }else {
            $absences = Absence::with(['employee', 'enregistrePar'])
                ->where('employee_id', $user->employee?->id)
                ->orderBy('date_absence', 'desc')
                ->get();
        }
        return response()->json([
            'success' => true,
            'data' => $absences,
        ], 200);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Seul un administrateur peut declarer une absence.',
            ], 403);
        }

        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'date_absence' => 'required|date',
            'justifiee' => 'boolean',
            'fichier_justification' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        $data = $request->all();
        $data['enregistre_par'] = $user->id;
        $data['justifiee'] = $request->boolean('justifiee');

        if ($request->hasFile('fichier_justification')) {
            $data['fichier_justification'] = $request
                ->file('fichier_justification')
                ->store('justificatifs', 'public');
        }

        $absence = Absence::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Absence enregistree avec succes.',
            'data' => $absence->load(['employee', 'enregistrePar']),
        ], 201);
    }

    public function show(string $id)
    {
        /** @var Absence|null $absence */
        $absence = Absence::with(['employee', 'enregistrePar'])->find($id);

        if (!$absence) {
            return response()->json([
                'success' => false,
                'message' => 'Absence non trouvee.',
            ], 404);
        }

        $check = $this->autoriserLecture($absence);
        if ($check) {
            return $check;
        }

        return response()->json([
            'success' => true,
            'data' => $absence,
        ], 200);
    }

    public function update(Request $request, string $id)
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Seul un administrateur peut modifier une absence.',
            ], 403);
        }

        /** @var Absence|null $absence */
        $absence = Absence::find($id);

        if (!$absence) {
            return response()->json([
                'success' => false,
                'message' => 'Absence non trouvee.',
            ], 404);
        }

        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'date_absence' => 'required|date',
            'justifiee' => 'boolean',
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
            'message' => 'Absence modifiee avec succes.',
            'data' => $absence->load(['employee', 'enregistrePar']),
        ], 200);
    }

    public function destroy(string $id)
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Action non autorisee.',
            ], 403);
        }

        /** @var Absence|null $absence */
        $absence = Absence::find($id);

        if (!$absence) {
            return response()->json([
                'success' => false,
                'message' => 'Absence non trouvee.',
            ], 404);
        }

        if ($absence->fichier_justification) {
            Storage::disk('public')->delete($absence->fichier_justification);
        }

        $absence->delete();

        return response()->json([
            'success' => true,
            'message' => 'Absence supprimee avec succes.',
        ], 200);
    }

    private function autoriserLecture(Absence $absence): ?\Illuminate\Http\JsonResponse
    {
        $user = Auth::user();

        if ($user->role === 'admin') {
            return null;
        }

        if ($absence->employee_id !== $user->employee?->id) {
            return response()->json([
                'success' => false,
                'message' => 'Acces non autorise.',
            ], 403);
        }

        return null;
    }
}
