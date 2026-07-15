<?php

namespace App\Http\Controllers;

use App\Models\Kak;
use Illuminate\Http\Request;

class KakController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $kaks = Kak::all();
        return response()->json($kaks);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama_kegiatan' => 'required|string',
            'divisi' => 'required|string',
            'link_drive' => 'nullable|string',
            'status' => 'nullable|string',
            'tipe_pengajuan' => 'required|string',
        ]);

        $kak = Kak::create($request->all());

        return response()->json([
            'message' => 'Pengajuan berhasil ditambahkan!', 
            'data' => $kak
        ], 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $kak = Kak::find($id);
        
        if (!$kak) {
            return response()->json(['message' => 'Pengajuan tidak ditemukan'], 404);
        }

        $kak->update($request->all());

        return response()->json([
            'message' => 'Pengajuan berhasil diperbarui!',
            'data' => $kak
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $kak = Kak::find($id);

        if (!$kak) {
            return response()->json(['message' => 'Pengajuan tidak ditemukan'], 404);
        }

        $kak->delete();

        return response()->json([
            'message' => 'Pengajuan berhasil dihapus!'
        ]);
    }
}
