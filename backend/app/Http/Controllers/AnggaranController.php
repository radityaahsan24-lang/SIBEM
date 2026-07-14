<?php

namespace App\Http\Controllers;

use App\Models\Anggaran;
use Illuminate\Http\Request;

class AnggaranController extends Controller
{
    public function index()
    {
        // For now, return all records. Later this can be filtered based on role.
        $anggarans = Anggaran::all();
        return response()->json($anggarans);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_kegiatan' => 'required|string',
            'divisi' => 'required|string',
            'jenis' => 'required|in:pemasukan,pengeluaran',
            'jumlah' => 'required|numeric',
            'tanggal' => 'required|date',
            'keterangan' => 'nullable|string',
        ]);

        $anggaran = Anggaran::create($request->all());

        return response()->json([
            'message' => 'Anggaran berhasil diajukan!', 
            'data' => $anggaran
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $anggaran = Anggaran::find($id);
        
        if (!$anggaran) {
            return response()->json(['message' => 'Anggaran tidak ditemukan'], 404);
        }

        $anggaran->update($request->all());

        return response()->json([
            'message' => 'Anggaran berhasil diperbarui!',
            'data' => $anggaran
        ]);
    }

    public function destroy($id)
    {
        $anggaran = Anggaran::find($id);

        if (!$anggaran) {
            return response()->json(['message' => 'Anggaran tidak ditemukan'], 404);
        }

        $anggaran->delete();

        return response()->json([
            'message' => 'Anggaran berhasil dihapus!'
        ]);
    }
}
