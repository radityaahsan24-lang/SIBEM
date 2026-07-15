<?php

namespace App\Http\Controllers;

use App\Models\Proker;
use Illuminate\Http\Request;

class ProkerController extends Controller
{
    // Mengambil daftar proker (difilter berdasarkan role)
    public function index()
    {
        $user = auth()->user();
        $role = $user->role;

        // BPH melihat semua
        $isBPH = in_array($role, ['Presiden BEM', 'Wakil Presiden BEM', 'Bendahara', 'Sekretaris']) 
                 || str_starts_with($role, 'Bendahara') 
                 || str_starts_with($role, 'Sekretaris');

        if ($isBPH || $role === 'admin') {
            $prokers = Proker::all();
        } else {
            // Misalnya 'Menteri Kastrat', ambil 'Kastrat'
            $parts = explode(' ', $role, 2);
            $divisiUser = isset($parts[1]) ? $parts[1] : '';
            $prokers = Proker::where('divisi', $divisiUser)->get();
        }

        return response()->json($prokers);
    }

    // Menambahkan proker baru ke database
    public function store(Request $request)
    {
        $request->validate([
            'nama_proker' => 'required|string',
            'divisi' => 'required|string',
            'deskripsi' => 'nullable|string',
            'status' => 'in:pending,disetujui,ditolak',
            'tanggal_pelaksanaan' => 'nullable|date'
        ]);

        $data = $request->all();
        $data['user_id'] = auth()->id();

        $proker = Proker::create($data);

        return response()->json([
            'message' => 'Program kerja berhasil ditambahkan!', 
            'data' => $proker
        ], 201);
    }

    // --- FITUR BARU: EDIT (UPDATE) ---
    public function update(Request $request, $id)
    {
        $proker = Proker::find($id);
        
        if (!$proker) {
            return response()->json(['message' => 'Program kerja tidak ditemukan'], 404);
        }

        // Menyimpan perubahan yang dikirim dari Frontend
        $proker->update($request->all());

        return response()->json([
            'message' => 'Program kerja berhasil diperbarui!',
            'data' => $proker
        ]);
    }

    // --- FITUR BARU: HAPUS (DELETE) ---
    public function destroy($id)
    {
        $proker = Proker::find($id);

        if (!$proker) {
            return response()->json(['message' => 'Program kerja tidak ditemukan'], 404);
        }

        // Menghapus data dari database
        $proker->delete();

        return response()->json([
            'message' => 'Program kerja berhasil dihapus!'
        ]);
    }
}