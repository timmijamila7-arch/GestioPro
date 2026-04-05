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

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::resource('projets', ProjetController::class);
    Route::resource('employees', EmployeeController::class);
    Route::resource('affectations', AffectationController::class);
    Route::resource('absences', AbsenceController::class);
    Route::resource('conges', CongeController::class);
    Route::patch('conges/{id}/valider', [CongeController::class, 'valider']);
});