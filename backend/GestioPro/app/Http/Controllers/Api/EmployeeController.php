<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class EmployeeController extends Controller
{
    public function index()
    {
        return response()->json(Employee::with('user')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'           => 'required|string|max:255',
            'email'          => 'required|email|unique:users,email',
            'password'       => 'required|string|min:8',
            'matricule'      => 'required|string|unique:employees,matricule',
            'nom'            => 'required|string|max:255',
            'prenom'         => 'required|string|max:255',
            'cin'            => 'required|string|unique:employees,cin',
            'date_naissance' => 'required|date',
            'date_embauche'  => 'required|date',
            'poste'          => 'required|string|max:255',
            'departement'    => 'required|string|max:255',
            'telephone'      => 'nullable|string|max:20',
            'adresse'        => 'nullable|string|max:500',
            'statut'         => 'sometimes|in:actif,inactif',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => 'employe',
        ]);

        $employee = Employee::create([
            'user_id'        => $user->id,
            'matricule'      => $request->matricule,
            'nom'            => $request->nom,
            'prenom'         => $request->prenom,
            'cin'            => $request->cin,
            'date_naissance' => $request->date_naissance,
            'date_embauche'  => $request->date_embauche,
            'poste'          => $request->poste,
            'departement'    => $request->departement,
            'telephone'      => $request->telephone,
            'adresse'        => $request->adresse,
            'statut'         => $request->statut ?? 'actif',
        ]);

        return response()->json([
            'message'  => 'Employé créé avec succès',
            'employee' => $employee->load('user'),
        ], 201);
    }

    public function show(Employee $employee)
    {
        return response()->json(
            $employee->load(['user', 'affectations.projet', 'conges', 'absences'])
        );
    }

    public function update(Request $request, Employee $employee)
    {
        $request->validate([
            'matricule'      => 'sometimes|string|unique:employees,matricule,' . $employee->id,
            'nom'            => 'sometimes|string|max:255',
            'prenom'         => 'sometimes|string|max:255',
            'cin'            => 'sometimes|string|unique:employees,cin,' . $employee->id,
            'date_naissance' => 'sometimes|date',
            'date_embauche'  => 'sometimes|date',
            'poste'          => 'sometimes|string|max:255',
            'departement'    => 'sometimes|string|max:255',
            'telephone'      => 'nullable|string|max:20',
            'adresse'        => 'nullable|string|max:500',
            'statut'         => 'sometimes|in:actif,inactif',
        ]);

        $employee->update($request->only([
            'matricule', 'nom', 'prenom', 'cin',
            'date_naissance', 'date_embauche', 'poste',
            'departement', 'telephone', 'adresse', 'statut',
        ]));

        return response()->json([
            'message'  => 'Employé mis à jour',
            'employee' => $employee->load('user'),
        ]);
    }

    public function destroy(Employee $employee)
    {
        $employee->update(['statut' => 'inactif']);

        return response()->json([
            'message' => 'Employé désactivé avec succès',
        ]);
    }
}
