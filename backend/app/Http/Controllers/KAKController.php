<?php

namespace App\Http\Controllers;

use App\Models\KAK;
use Illuminate\Http\Request;

class KAKController extends Controller
{
    /**
     * Tampilkan semua data KAK.
     */
    public function index()
    {
        $kaks = KAK::orderBy('created_at', 'desc')->get();
        return response()->json($kaks);
    }

    /**
     * Simpan KAK baru.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama_kegiatan' => 'required|string',
            'divisi' => 'required|string',
            'latar_belakang' => 'nullable|string',
            'tujuan' => 'nullable|string',
            'sasaran' => 'nullable|string',
            'tempat' => 'nullable|string',
            'tanggal_pelaksanaan' => 'nullable|date',
            'anggaran_estimasi' => 'nullable|numeric',
            'penanggung_jawab' => 'nullable|string',
        ]);

        $kak = KAK::create(array_merge(
            $request->all(),
            ['user_id' => $request->user() ? $request->user()->id : null]
        ));

        return response()->json([
            'message' => 'KAK berhasil diajukan!',
            'data' => $kak,
        ], 201);
    }

    /**
     * Update data KAK (termasuk perubahan status ACC/Tolak).
     */
    public function update(Request $request, $id)
    {
        $kak = KAK::find($id);

        if (!$kak) {
            return response()->json(['message' => 'KAK tidak ditemukan'], 404);
        }

        $kak->update($request->all());

        return response()->json([
            'message' => 'KAK berhasil diperbarui!',
            'data' => $kak,
        ]);
    }

    /**
     * Hapus data KAK.
     */
    public function destroy($id)
    {
        $kak = KAK::find($id);

        if (!$kak) {
            return response()->json(['message' => 'KAK tidak ditemukan'], 404);
        }

        $kak->delete();

        return response()->json([
            'message' => 'KAK berhasil dihapus!',
        ]);
    }
}
