<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EmployeeController extends Controller
{
    // 📋 LISTER les employés
    public function index()
    {
        if (Auth::user()->role !== 'admin' && Auth::user()->role !== 'rh') {
            return response()->json([
                'success' => false,
                'message' => 'Action non autorisée.'
            ], 403);
        }

        $employees = Employee::with('user')
                             ->orderBy('nom')
                             ->get();

        return response()->json([
            'success' => true,
            'data'    => $employees
        ], 200);
    }

    // 💾 AJOUTER un employé
    public function store(Request $request)
    {
        if (Auth::user()->role !== 'admin' && Auth::user()->role !== 'rh') {
            return response()->json([
                'success' => false,
                'message' => 'Action non autorisée.'
            ], 403);
        }

        $request->validate([
            'user_id'        => 'nullable|exists:users,id',
            'matricule'      => 'required|string|unique:employees,matricule',
            'nom'            => 'required|string|max:255',
            'prenom'         => 'required|string|max:255',
            'cin'            => 'required|string|unique:employees,cin',
            'date_naissance' => 'required|date',
            'date_embauche'  => 'required|date',
            'poste'          => 'required|string|max:255',
            'departement'    => 'required|string|max:255',
            'telephone'      => 'nullable|string|max:20',
            'adresse'        => 'nullable|string',
            'statut'         => 'required|in:actif,inactif,conge',
        ]);

        $employee = Employee::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Employé créé avec succès.',
            'data'    => $employee
        ], 201);
    }

    // 👁️ AFFICHER un employé
    public function show(string $id)
    {
        $user = Auth::user();
        $employee = Employee::with(['user', 'absences', 'conges', 'affectations'])->find($id);

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employé non trouvé.'
            ], 404);
        }

        // Un employé ne peut voir que son propre profil
        if ($user->role !== 'admin' && $user->role !== 'rh' && $user->employee_id !== $employee->id) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé.'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data'    => $employee
        ], 200);
    }

    // 🔄 MODIFIER un employé
    public function update(Request $request, string $id)
    {
        if (Auth::user()->role !== 'admin' && Auth::user()->role !== 'rh') {
            return response()->json([
                'success' => false,
                'message' => 'Action non autorisée.'
            ], 403);
        }

        $employee = Employee::find($id);

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employé non trouvé.'
            ], 404);
        }

        $request->validate([
            'user_id'        => 'nullable|exists:users,id',
            'matricule'      => 'required|string|unique:employees,matricule,' . $id,
            'nom'            => 'required|string|max:255',
            'prenom'         => 'required|string|max:255',
            'cin'            => 'required|string|unique:employees,cin,' . $id,
            'date_naissance' => 'required|date',
            'date_embauche'  => 'required|date',
            'poste'          => 'required|string|max:255',
            'departement'    => 'required|string|max:255',
            'telephone'      => 'nullable|string|max:20',
            'adresse'        => 'nullable|string',
            'statut'         => 'required|in:actif,inactif,conge',
        ]);

        $employee->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Employé modifié avec succès.',
            'data'    => $employee
        ], 200);
    }

    // 🗑️ SUPPRIMER un employé
    public function destroy(string $id)
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Action non autorisée.'
            ], 403);
        }

        $employee = Employee::find($id);

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employé non trouvé.'
            ], 404);
        }

        $employee->delete();

        return response()->json([
            'success' => true,
            'message' => 'Employé supprimé avec succès.'
        ], 200);
    }
}