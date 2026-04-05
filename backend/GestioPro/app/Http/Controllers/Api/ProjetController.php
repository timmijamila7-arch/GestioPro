<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Projet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProjetController extends Controller
{

    public function index()
    {
        $projets = Projet::with('affectations.employee')
                         ->orderBy('date_debut', 'desc')
                         ->get();

        return response()->json([
            'success' => true,
            'data'    => $projets
        ], 200);
    }

    public function store(Request $request)
    {
        if (Auth::user()->role !== 'admin' && Auth::user()->role !== 'rh') {
            return response()->json([
                'success' => false,
                'message' => 'Action non autorisée.'
            ], 403);
        }

        $request->validate([
            'nom'         => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_debut'  => 'required|date',
            'date_fin'    => 'nullable|date|after_or_equal:date_debut',
            'statut'      => 'required|in:en_cours,termine,suspendu,planifie',
            'budget'      => 'nullable|numeric|min:0',
        ]);

        $projet = Projet::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Projet créé avec succès.',
            'data'    => $projet
        ], 201);
    }

    public function show(string $id)
    {
        $projet = Projet::with('affectations.employee')->find($id);

        if (!$projet) {
            return response()->json([
                'success' => false,
                'message' => 'Projet non trouvé.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $projet
        ], 200);
    }

    public function update(Request $request, string $id)
    {
        if (Auth::user()->role !== 'admin' && Auth::user()->role !== 'rh') {
            return response()->json([
                'success' => false,
                'message' => 'Action non autorisée.'
            ], 403);
        }

        $projet = Projet::find($id);

        if (!$projet) {
            return response()->json([
                'success' => false,
                'message' => 'Projet non trouvé.'
            ], 404);
        }

        $request->validate([
            'nom'         => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_debut'  => 'required|date',
            'date_fin'    => 'nullable|date|after_or_equal:date_debut',
            'statut'      => 'required|in:en_cours,termine,suspendu,planifie',
            'budget'      => 'nullable|numeric|min:0',
        ]);

        $projet->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Projet modifié avec succès.',
            'data'    => $projet
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

        $projet = Projet::find($id);

        if (!$projet) {
            return response()->json([
                'success' => false,
                'message' => 'Projet non trouvé.'
            ], 404);
        }

        $projet->delete();

        return response()->json([
            'success' => true,
            'message' => 'Projet supprimé avec succès.'
        ], 200);
    }
}