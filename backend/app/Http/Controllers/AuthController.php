<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        // Cek apakah user ada dan password benar
        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        // Buat token (menggunakan Sanctum)
        $token = $user->createToken('auth_token')->plainTextToken;

        // Kirim response beserta role agar frontend tahu menu apa yang harus ditampilkan
        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'role' => $user->role, // Penting untuk RBAC
            ]
        ]);
    }

    // Fungsi khusus untuk Admin menambahkan user/pengurus baru
    public function createUser(Request $request)
    {
        // Validasi input
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|unique:users',
            'password' => 'required|string|min:8', // Minimal 8 karakter
            'role'     => 'required|string'
        ]);

        // Masukkan ke database
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password), // Password di-hash
            'role'     => $request->role
        ]);

        return response()->json([
            'message' => 'User baru berhasil ditambahkan ke database!',
            'data'    => $user
        ], 201);
    }

    // Fungsi untuk mengambil semua data pengurus (ditampilkan di tabel Admin)
    public function getAllUsers()
    {
        // Mengambil id, name, email, dan role dari tabel users, diurutkan dari yang terbaru
        $users = User::select('id', 'name', 'email', 'role')
                     ->orderBy('created_at', 'asc')
                     ->get();

        return response()->json([
            'message' => 'Berhasil mengambil daftar pengurus',
            'data'    => $users
        ], 200);
    }
}