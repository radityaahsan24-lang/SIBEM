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

    // Rute untuk mengelola Anggaran
    Route::get('/anggaran', [\App\Http\Controllers\AnggaranController::class, 'index']);
    Route::post('/anggaran', [\App\Http\Controllers\AnggaranController::class, 'store']);
    Route::put('/anggaran/{id}', [\App\Http\Controllers\AnggaranController::class, 'update']);
    Route::delete('/anggaran/{id}', [\App\Http\Controllers\AnggaranController::class, 'destroy']);

    // Rute untuk mengelola KAK (Kerangka Acuan Kerja)
    Route::get('/kak', [\App\Http\Controllers\KAKController::class, 'index']);
    Route::post('/kak', [\App\Http\Controllers\KAKController::class, 'store']);
    Route::put('/kak/{id}', [\App\Http\Controllers\KAKController::class, 'update']);
    Route::delete('/kak/{id}', [\App\Http\Controllers\KAKController::class, 'destroy']);

    // Rute untuk mengelola LPJ (Laporan Pertanggungjawaban)
    Route::get('/lpj', [\App\Http\Controllers\LPJController::class, 'index']);
    Route::post('/lpj', [\App\Http\Controllers\LPJController::class, 'store']);
    Route::put('/lpj/{id}', [\App\Http\Controllers\LPJController::class, 'update']);
    Route::delete('/lpj/{id}', [\App\Http\Controllers\LPJController::class, 'destroy']);

    // Rute untuk mengelola Setting (Dana Pagu Awal)
    Route::get('/settings/pagu', [\App\Http\Controllers\SettingController::class, 'getPagu']);
    Route::put('/settings/pagu', [\App\Http\Controllers\SettingController::class, 'updatePagu']);

    // Rute untuk Admin menambah akun pengurus baru
    Route::post('/users', [AuthController::class, 'createUser']);

    // Rute untuk melihat daftar akun
    Route::get('/users', [AuthController::class, 'getAllUsers']);
});

// Hanya untuk uji coba
Route::get('/test-koneksi', function () {
    return response()->json([
        'status' => 'Sukses!',
        'message' => 'Backend Laravel siap melayani Frontend React TypeScript.',
    ]);
});