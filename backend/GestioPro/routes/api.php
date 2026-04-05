<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\ProjetController;
use App\Http\Controllers\Api\AffectationController;
use App\Http\Controllers\Api\CongeController;
use App\Http\Controllers\Api\AbsenceController;
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::middleware('auth:sanctum')->group(function () {
    Route::resource('projets', ProjetController::class);
});
Route::middleware('auth:sanctum')->group(function () {
    Route::resource('employees', EmployeeController::class);
});
Route::middleware('auth:sanctum')->group(function () {
    Route::resource('conges', CongeController::class);
    Route::patch('conges/{id}/valider', [CongeController::class, 'valider']);
});
Route::middleware('auth:sanctum')->group(function () {
    Route::resource('affectations', AffectationController::class);
});
Route::middleware('auth:sanctum')->group(function () {
    Route::resource('absences', AbsenceController::class);
});
Route::prefix('auth')->group(function () {
    // Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});


Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',      [AuthController::class, 'me']);

    // Employees
    Route::apiResource('employees', EmployeeController::class);

    // Projets
   // Route::apiResource('projets', ProjetController::class);

    // Affectations
    //Route::apiResource('affectations', AffectationController::class);

    // Congés
    //Route::apiResource('conges', CongeController::class);
    //Route::patch('conges/{id}/valider', [CongeController::class, 'valider']);
    //Route::patch('conges/{id}/refuser', [CongeController::class, 'refuser']);

    // Absences
    //Route::apiResource('absences', AbsenceController::class);
});

