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

// routes/api.php


// Public
Route::post('/auth/login',  [AuthController::class, 'login']);

// Protégées
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',[AuthController::class, 'me']);

    Route::apiResource('employees',    EmployeeController::class);
    Route::apiResource('absences',     AbsenceController::class);
    Route::apiResource('conges',       CongeController::class);
    Route::apiResource('projets',      ProjetController::class);
    Route::apiResource('affectations', AffectationController::class);

    Route::patch('/conges/{id}/valider', [CongeController::class, 'valider']);
});