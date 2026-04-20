<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conge;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CongeController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if ($user->role === 'admin') {
            $conges = Conge::with('employee')
                           ->orderBy('date_debut', 'desc')
                           ->get();
        } else {
            // ✅ FIX: khdm $user->employee?->id bedel $user->employee_id
            $conges = Conge::with('employee')
                           ->where('employee_id', $user->employee?->id)
                           ->orderBy('date_debut', 'desc')
                           ->get();
        }

        return response()->json([
            'success' => true,
            'data'    => $conges
        ], 200);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            // ✅ FIX: employee_id — admin yrslu, employee normal ykhdu auto
            'employee_id' => $user->role === 'admin'
                           ? 'required|exists:employees,id'
                           : 'prohibited',
            'type_conge'  => 'required|string|max:255',
            'date_debut'  => 'required|date',
            'date_fin'    => 'required|date|after_or_equal:date_debut',
            'motif'       => 'nullable|string|max:255',
            'statut'      => 'in:en_attente,approuve,refuse',
            'commentaire' => 'nullable|string',
        ]);

        $data = $request->all();
        $data['statut'] = $data['statut'] ?? 'en_attente';

        // ✅ FIX: Employee normal — auto-assign dyalo, bhal AbsenceController
        if ($user->role !== 'admin') {
            if (!$user->employee) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucun employé associé à ce compte.'
                ], 422);
            }
            $data['employee_id'] = $user->employee->id;
        }

        $conge = Conge::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Congé créé avec succès.',
            'data'    => $conge->load('employee')
        ], 201);
    }

    public function show(string $id)
    {
        $conge = Conge::with('employee')->find($id);

        if (!$conge) {
            return response()->json([
                'success' => false,
                'message' => 'Congé non trouvé.'
            ], 404);
        }

        $this->autoriser($conge);

        return response()->json([
            'success' => true,
            'data'    => $conge
        ], 200);
    }

    public function update(Request $request, string $id)
    {
        $conge = Conge::find($id);

        if (!$conge) {
            return response()->json([
                'success' => false,
                'message' => 'Congé non trouvé.'
            ], 404);
        }

        $this->autoriser($conge);

        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'type_conge'  => 'required|string|max:255',
            'date_debut'  => 'required|date',
            'date_fin'    => 'required|date|after_or_equal:date_debut',
            'motif'       => 'nullable|string|max:255',
            'commentaire' => 'nullable|string',
        ]);

        $conge->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Congé modifié avec succès.',
            'data'    => $conge->load('employee')
        ], 200);
    }

    public function valider(Request $request, string $id)
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Action non autorisée.'
            ], 403);
        }

        $conge = Conge::find($id);

        if (!$conge) {
            return response()->json([
                'success' => false,
                'message' => 'Congé non trouvé.'
            ], 404);
        }

        $request->validate([
            'statut'      => 'required|in:approuve,refuse',
            'commentaire' => 'nullable|string',
        ]);

        $conge->update([
            'statut'        => $request->statut,
            'validateur_id' => Auth::id(),
            'commentaire'   => $request->commentaire,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Congé ' . $request->statut . ' avec succès.',
            'data'    => $conge->load('employee')
        ], 200);
    }

    public function destroy(string $id)
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Action non autorisée.'
            ], 403);
        }

        $conge = Conge::find($id);

        if (!$conge) {
            return response()->json([
                'success' => false,
                'message' => 'Congé non trouvé.'
            ], 404);
        }

        $conge->delete();

        return response()->json([
            'success' => true,
            'message' => 'Congé supprimé avec succès.'
        ], 200);
    }

    // ✅ FIX: abort(403) bedel abort(response()->json(...)) — Laravel abort() ma kayqbalch objects
    private function autoriser(Conge $conge)
    {
        $user = Auth::user();

        if ($user->role === 'admin') {
            return;
        }

        if ($conge->employee_id !== $user->employee?->id) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé.'
            ], 403);
        }
    }
}
