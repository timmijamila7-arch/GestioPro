<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Affectation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AffectationController extends Controller
{
    // 📋 LISTER les affectations
    public function index()
    {
        $user = Auth::user();

        if ($user->role === 'admin' || $user->role === 'rh') {
            $affectations = Affectation::with(['employee', 'projet'])
                                       ->orderBy('date_debut', 'desc')
                                       ->get();
        } else {
            $affectations = Affectation::with(['employee', 'projet'])
                                       ->where('employee_id', $user->employee_id)
                                       ->orderBy('date_debut', 'desc')
                                       ->get();
        }

        return response()->json([
            'success' => true,
            'data'    => $affectations
        ], 200);
    }

    // 💾 AJOUTER une affectation
    public function store(Request $request)
    {
        if (Auth::user()->role !== 'admin' && Auth::user()->role !== 'rh') {
            return response()->json([
                'success' => false,
                'message' => 'Action non autorisée.'
            ], 403);
        }

        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'projet_id'   => 'required|exists:projets,id',
            'date_debut'  => 'required|date',
            'date_fin'    => 'nullable|date|after_or_equal:date_debut',
            'role_projet' => 'required|string|max:255',
        ]);

        $affectation = Affectation::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Affectation créée avec succès.',
            'data'    => $affectation->load(['employee', 'projet'])
        ], 201);
    }

    // 👁️ AFFICHER une affectation
    public function show(string $id)
    {
        $affectation = Affectation::with(['employee', 'projet'])->find($id);

        if (!$affectation) {
            return response()->json([
                'success' => false,
                'message' => 'Affectation non trouvée.'
            ], 404);
        }

        $this->autoriser($affectation);

        return response()->json([
            'success' => true,
            'data'    => $affectation
        ], 200);
    }

    // 🔄 MODIFIER une affectation
    public function update(Request $request, string $id)
    {
        if (Auth::user()->role !== 'admin' && Auth::user()->role !== 'rh') {
            return response()->json([
                'success' => false,
                'message' => 'Action non autorisée.'
            ], 403);
        }

        $affectation = Affectation::find($id);

        if (!$affectation) {
            return response()->json([
                'success' => false,
                'message' => 'Affectation non trouvée.'
            ], 404);
        }

        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'projet_id'   => 'required|exists:projets,id',
            'date_debut'  => 'required|date',
            'date_fin'    => 'nullable|date|after_or_equal:date_debut',
            'role_projet' => 'required|string|max:255',
        ]);

        $affectation->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Affectation modifiée avec succès.',
            'data'    => $affectation->load(['employee', 'projet'])
        ], 200);
    }

    // 🗑️ SUPPRIMER une affectation
    public function destroy(string $id)
    {
        if (Auth::user()->role !== 'admin' && Auth::user()->role !== 'rh') {
            return response()->json([
                'success' => false,
                'message' => 'Action non autorisée.'
            ], 403);
        }

        $affectation = Affectation::find($id);

        if (!$affectation) {
            return response()->json([
                'success' => false,
                'message' => 'Affectation non trouvée.'
            ], 404);
        }

        $affectation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Affectation supprimée avec succès.'
        ], 200);
    }

    // 🔒 Vérifier les droits d'accès
    private function autoriser(Affectation $affectation)
    {
        $user = Auth::user();

        if ($user->role === 'admin' || $user->role === 'rh') {
            return;
        }

        if ($affectation->employee_id !== $user->employee_id) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé.'
            ], 403);
        }
    }
}