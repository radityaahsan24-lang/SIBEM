<?php

namespace App\Http\Controllers;

use App\Models\LPJ;
use App\Models\KAK;
use Illuminate\Http\Request;

class LPJController extends Controller
{
    /**
     * Tampilkan semua data LPJ.
     */
    public function index()
    {
        $lpjs = LPJ::with('kak')->orderBy('created_at', 'desc')->get();
        return response()->json($lpjs);
    }

    /**
     * Simpan LPJ baru.
     */
    public function store(Request $request)
    {
        $request->validate([
            'kak_id' => 'required|exists:kaks,id',
            'link' => 'required|string',
            'total_anggaran' => 'required|numeric|min:0',
        ]);

        // Pastikan KAK sudah di-ACC
        $kak = KAK::find($request->kak_id);
        if ($kak->status !== 'disetujui') {
            return response()->json([
                'message' => 'LPJ hanya bisa diajukan untuk KAK yang sudah disetujui.',
            ], 422);
        }

        // Pastikan belum ada LPJ untuk KAK ini
        $existingLPJ = LPJ::where('kak_id', $request->kak_id)->first();
        if ($existingLPJ) {
            return response()->json([
                'message' => 'KAK ini sudah memiliki LPJ.',
            ], 422);
        }

        $lpj = LPJ::create(array_merge(
            $request->all(),
            ['user_id' => $request->user() ? $request->user()->id : null]
        ));

        return response()->json([
            'message' => 'LPJ berhasil diajukan!',
            'data' => $lpj->load('kak'),
        ], 201);
    }

    /**
     * Update data LPJ (termasuk perubahan status ACC/Tolak).
     */
    public function update(Request $request, $id)
    {
        $lpj = LPJ::find($id);

        if (!$lpj) {
            return response()->json(['message' => 'LPJ tidak ditemukan'], 404);
        }

        $lpj->update($request->all());

        return response()->json([
            'message' => 'LPJ berhasil diperbarui!',
            'data' => $lpj->load('kak'),
        ]);
    }

    /**
     * Hapus data LPJ.
     */
    public function destroy($id)
    {
        $lpj = LPJ::find($id);

        if (!$lpj) {
            return response()->json(['message' => 'LPJ tidak ditemukan'], 404);
        }

        $lpj->delete();

        return response()->json([
            'message' => 'LPJ berhasil dihapus!',
        ]);
    }
}
