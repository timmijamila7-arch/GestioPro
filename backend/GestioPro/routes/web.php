<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AbsenceController;

Route::middleware(['auth'])->group(function () {

});
Route::get('/', function () {
    return view('welcome');
});
