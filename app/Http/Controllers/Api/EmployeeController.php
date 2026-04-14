<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EmployeeController extends Controller
{
    public function index()
    {
        if (Auth::user()->role !== 'admin') {
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

    public function store(Request $request)
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Action non autorisée.'
            ], 403);
        }

        $request->validate([
            'matricule'      => 'required|string|unique:employees,matricule',
            'nom'            => 'required|string|max:255',
            'prenom'         => 'required|string|max:255',
            'cin'            => 'required|string|unique:employees,cin',
            'date_naissance' => 'required|date',
            'date_embauche'  => 'required|date',
            'email'          => 'required|email|unique:users,email',
            'password'       => 'required|string|min:6',
            'poste'          => 'required|string|max:255',
            'departement'    => 'required|string|max:255',
            'telephone'      => 'nullable|string|max:20',
            'adresse'        => 'nullable|string',
            'statut'         => 'required|in:actif,inactif',
        ]);

        $user = User::create([
            'name'     => $request->nom . ' ' . $request->prenom,
            'email'    => $request->email,
            'password' => bcrypt($request->password),
            'role'     => 'employee',
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
            'statut'         => $request->statut,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Employé + compte créé avec succès',
            'data'    => $employee->load('user'),
        ], 201);
    }

    public function show(string $id)
    {
        $user     = Auth::user();
        $employee = Employee::with(['user', 'absences', 'conges', 'affectations'])->find($id);

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employé non trouvé.'
            ], 404);
        }

        // ✅ FIX: Khdm $user->employee?->id bedel $user->employee_id
        // $user->employee_id ma kaynach f users table —
        // employee_id kayn f employees table (user_id column)
        if ($user->role !== 'admin' && $user->employee?->id !== $employee->id) {
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

    public function update(Request $request, string $id)
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

        $data = $request->validate([
            'matricule'      => 'sometimes|required|string|unique:employees,matricule,' . $id,
            'nom'            => 'sometimes|required|string|max:255',
            'prenom'         => 'sometimes|required|string|max:255',
            'cin'            => 'sometimes|required|string|unique:employees,cin,' . $id,
            'date_naissance' => 'sometimes|required|date',
            'date_embauche'  => 'sometimes|required|date',
            'poste'          => 'sometimes|required|string|max:255',
            'departement'    => 'sometimes|required|string|max:255',
            'telephone'      => 'nullable|string|max:20',
            'adresse'        => 'nullable|string',
            'statut'         => 'sometimes|required|in:actif,inactif',
            'email'          => 'sometimes|required|email|unique:users,email,' . $employee->user_id,
            'password'       => 'nullable|string|min:6',
        ]);

        $employee->update(collect($data)->except(['email', 'password'])->toArray());

        if ($employee->user) {
            $userData = [];

            if (array_key_exists('email', $data)) {
                $userData['email'] = $data['email'];
            }

            if (array_key_exists('nom', $data) || array_key_exists('prenom', $data)) {
                $userData['name'] = trim(
                    ($data['nom'] ?? $employee->nom) . ' ' . ($data['prenom'] ?? $employee->prenom)
                );
            }

            if (!empty($data['password'])) {
                $userData['password'] = $data['password'];
            }

            if ($userData !== []) {
                $employee->user->update($userData);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Employé modifié avec succès.',
            'data'    => $employee->load('user'),
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

        $employee = Employee::find($id);

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employé non trouvé.'
            ], 404);
        }

        $user = $employee->user;
        $employee->delete();

        if ($user) {
            $user->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Employé supprimé avec succès.'
        ], 200);
    }
}
