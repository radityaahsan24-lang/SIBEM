<?php

namespace App\Http\Controllers;

use App\Models\SesiPresensi;
use App\Models\Kehadiran;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;

class KehadiranController extends Controller
{
    // Mengambil daftar anggota sesuai tingkatan rapat
    public function getPeserta($sesi_id)
    {
        $sesi = SesiPresensi::findOrFail($sesi_id);
        $usersQuery = User::where('role', '!=', 'admin'); 

        if ($sesi->tingkatan === 'Kementerian') {
            $usersQuery->where('role', 'ILIKE', '%' . $sesi->kementerian . '%');
        } elseif ($sesi->tingkatan === 'BPH') {
            $bphRoles = ['Presiden BEM', 'Wakil Presiden BEM', 'Sekretaris', 'Bendahara', 'Sekretaris 1', 'Sekretaris 2', 'Bendahara 1', 'Bendahara 2'];
            $usersQuery->whereIn('role', $bphRoles);
        }
        
        $users = $usersQuery->get();
        $kehadiran = Kehadiran::where('sesi_presensi_id', $sesi_id)->get()->keyBy('user_id');

        // Menentukan apakah rapat sudah melewati batas waktu
        $waktuBatas = Carbon::parse($sesi->tanggal . ' ' . $sesi->batas_waktu);
        $isTerlambat = now()->greaterThan($waktuBatas);

        $peserta = $users->map(function($u) use ($kehadiran, $isTerlambat) {
            // Jika sudah ada data di database (Sudah absen/direkap admin)
            if (isset($kehadiran[$u->id])) {
                $status = $kehadiran[$u->id]->status;
            } else {
                // Jika belum absen: Tentukan 'Alpa' jika terlambat, atau 'Belum Presensi' jika masih ada waktu
                $status = $isTerlambat ? 'Alpa' : 'Belum Presensi';
            }

            return [
                'user_id' => $u->id,
                'name' => $u->name,
                'role' => $u->role,
                'status' => $status
            ];
        });

        return response()->json(['status' => 'success', 'data' => $peserta]);
    }

    // Menyimpan data kehadiran massal dari Admin
    public function simpanKehadiran(Request $request, $sesi_id)
    {
        $request->validate([
            'kehadiran' => 'required|array',
            'kehadiran.*.user_id' => 'required|exists:users,id',
            'kehadiran.*.status' => 'required|in:Hadir,Izin,Sakit,Alpa,Belum Presensi',
        ]);

        foreach ($request->kehadiran as $absen) {
            // Abaikan jika statusnya masih "Belum Presensi" (biarkan database kosong)
            if ($absen['status'] === 'Belum Presensi') continue;

            Kehadiran::updateOrCreate(
                ['sesi_presensi_id' => $sesi_id, 'user_id' => $absen['user_id']],
                ['status' => $absen['status'], 'waktu_presensi' => now()]
            );
        }

        return response()->json(['status' => 'success', 'message' => 'Data kehadiran berhasil disimpan.']);
    }

    // Fungsi untuk User melakukan presensi mandiri menggunakan kode (Bisa pilih Hadir/Izin/Sakit)
    public function submitKode(Request $request, $sesi_id)
    {
        $request->validate([
            'kode_presensi' => 'required|string',
            'status' => 'required|in:Hadir,Izin,Sakit' // Wajib menyertakan status
        ]);

        $sesi = SesiPresensi::findOrFail($sesi_id);

        if (!$sesi->is_active) {
            return response()->json(['status' => 'error', 'message' => 'Sesi presensi sudah ditutup.'], 400);
        }

        $waktuBatas = Carbon::parse($sesi->tanggal . ' ' . $sesi->batas_waktu);
        if (now()->greaterThan($waktuBatas)) {
            return response()->json(['status' => 'error', 'message' => 'Batas waktu presensi telah lewat. Anda dihitung Alpa.'], 400);
        }

        if (strtoupper($sesi->kode_presensi) !== strtoupper($request->kode_presensi)) {
            return response()->json(['status' => 'error', 'message' => 'Kode presensi tidak valid.'], 400);
        }

        Kehadiran::updateOrCreate(
            ['sesi_presensi_id' => $sesi_id, 'user_id' => auth()->id()],
            ['status' => $request->status, 'waktu_presensi' => now()]
        );

        return response()->json(['status' => 'success', 'message' => 'Berhasil melakukan presensi!']);
    }
}