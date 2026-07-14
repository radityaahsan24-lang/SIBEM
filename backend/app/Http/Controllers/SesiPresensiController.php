<?php

namespace App\Http\Controllers;

use App\Models\SesiPresensi;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SesiPresensiController extends Controller
{
    // Method untuk mengambil daftar sesi presensi
    public function index()
    {
        // Ambil data dan urutkan dari yang paling baru dibuat
        $sesi = SesiPresensi::orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $sesi
        ]);
    }

    // Method untuk menyimpan sesi presensi baru
    public function store(Request $request)
    {
        // Validasi data dari React
        $request->validate([
            'nama_kegiatan' => 'required|string',
            'tingkatan' => 'required|string',
            'tanggal' => 'required|date',
            'waktu_mulai' => 'required|date_format:H:i',
            'batas_waktu' => 'required|date_format:H:i',
        ]);

        // Generate Kode Acak 6 Karakter (Huruf Kapital dan Angka)
        $kodePresensi = strtoupper(Str::random(6));

        // Simpan ke database
        $sesi = SesiPresensi::create([
            'nama_kegiatan' => $request->nama_kegiatan,
            'tingkatan' => $request->tingkatan,
            'kementerian' => $request->kementerian, // Akan bernilai null jika tingkatan == 'Komunal'
            'kode_presensi' => $kodePresensi,
            'tanggal' => $request->tanggal,
            'waktu_mulai' => $request->waktu_mulai,
            'batas_waktu' => $request->batas_waktu,
            'is_active' => true,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Sesi presensi berhasil dibuat',
            'kode_presensi' => $kodePresensi,
            'data' => $sesi
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nama_kegiatan' => 'required|string',
            'tingkatan' => 'required|string',
            'tanggal' => 'required|date',
            'waktu_mulai' => 'required|date_format:H:i',
            'batas_waktu' => 'required|date_format:H:i',
        ]);

        $sesi = SesiPresensi::find($id);

        if (!$sesi) {
            return response()->json(['status' => 'error', 'message' => 'Data tidak ditemukan'], 404);
        }

        $sesi->update([
            'nama_kegiatan' => $request->nama_kegiatan,
            'tingkatan' => $request->tingkatan,
            'kementerian' => $request->kementerian,
            'tanggal' => $request->tanggal,
            'waktu_mulai' => $request->waktu_mulai,
            'batas_waktu' => $request->batas_waktu,
        ]);

        return response()->json(['status' => 'success', 'message' => 'Data berhasil diperbarui', 'data' => $sesi]);
    }

    // Fungsi DELETE untuk Menghapus Data
    public function destroy($id)
    {
        $sesi = SesiPresensi::find($id);

        if (!$sesi) {
            return response()->json(['status' => 'error', 'message' => 'Data tidak ditemukan'], 404);
        }

        $sesi->delete();

        return response()->json(['status' => 'success', 'message' => 'Data berhasil dihapus']);
    }
}
