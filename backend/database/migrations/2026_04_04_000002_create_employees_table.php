<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('matricule')->unique();
            $table->string('nom');
            $table->string('prenom');
            $table->string('cin')->unique();
            $table->date('date_naissance');
            $table->date('date_embauche');
            $table->string('poste');
            $table->string('departement');
            $table->string('telephone')->nullable();
            $table->string('adresse')->nullable();
            $table->enum('statut', ['actif', 'inactif'])->default('actif');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
