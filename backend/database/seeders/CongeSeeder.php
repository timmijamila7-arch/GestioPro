<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CongeSeeder extends Seeder
{
    public function run(): void
    {
        $employees = DB::table('employees')->pluck('id');

        if ($employees->isEmpty()) {
            $this->command->info('Aucun employé trouvé.');
            return;
        }

        $types   = ['annuel', 'maladie', 'maternite', 'sans_solde'];
        $statuts = ['en_attente', 'approuve', 'refuse'];

        foreach ($employees as $employeeId) {
            for ($i = 0; $i < 3; $i++) {
                $debut = Carbon::now()->subDays(rand(10, 90));
                $fin   = (clone $debut)->addDays(rand(3, 15));

                DB::table('conges')->insert([
                    'employee_id'   => $employeeId,
                    'type_conge'    => $types[array_rand($types)],
                    'date_debut'    => $debut->toDateString(),
                    'date_fin'      => $fin->toDateString(),
                    'motif'         => 'Motif de test ' . ($i + 1),
                    'statut'        => $statuts[array_rand($statuts)],
                    'validateur_id' => null,
                    'commentaire'   => null,
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ]);
            }
        }
    }
}