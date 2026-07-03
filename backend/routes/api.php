<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProkerController;

Route::post('/login', [AuthController::class, 'login']);

// Grup rute yang dilindungi (Hanya bisa diakses jika sudah login)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Rute untuk mengelola Program Kerja
    Route::get('/proker', [ProkerController::class, 'index']);
    Route::post('/proker', [ProkerController::class, 'store']);
    Route::put('/proker/{id}', [ProkerController::class, 'update']);
    Route::delete('/proker/{id}', [ProkerController::class, 'destroy']);
});

// Hanya untuk uji coba
Route::get('/test-koneksi', function () {
    return response()->json([
        'status' => 'Sukses!',
        'message' => 'Backend Laravel siap melayani Frontend React TypeScript.',
    ]);
});