<?php

namespace App\Http\Controllers;

use App\Models\SesiPresensi;
use App\Models\Kehadiran;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;

class KehadiranController extends Controller
{
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

        $waktuBatas = Carbon::parse($sesi->tanggal . ' ' . $sesi->batas_waktu);
        $isTerlambat = now()->greaterThan($waktuBatas);

        $peserta = $users->map(function($u) use ($kehadiran, $isTerlambat) {
            $bukti_izin = null;
            if (isset($kehadiran[$u->id])) {
                $status = $kehadiran[$u->id]->status;
                // Ubah tampilan dari DB Alpa menjadi Tidak Hadir
                if ($status === 'Alpa') $status = 'Tidak Hadir'; 
                $bukti_izin = $kehadiran[$u->id]->bukti_izin;
            } else {
                $status = $isTerlambat ? 'Tidak Hadir' : 'Belum Presensi';
            }

            return [
                'user_id' => $u->id,
                'name' => $u->name,
                'role' => $u->role,
                'status' => $status,
                'bukti_izin' => $bukti_izin
            ];
        });

        return response()->json(['status' => 'success', 'data' => $peserta]);
    }

    public function simpanKehadiran(Request $request, $sesi_id)
    {
        $request->validate([
            'kehadiran' => 'required|array',
            'kehadiran.*.user_id' => 'required|exists:users,id',
            'kehadiran.*.status' => 'required|in:Hadir,Izin,Tidak Hadir,Belum Presensi',
        ]);

        foreach ($request->kehadiran as $absen) {
            if ($absen['status'] === 'Belum Presensi') continue;

            // Kembalikan ke format enum DB
            $statusDB = $absen['status'] === 'Tidak Hadir' ? 'Alpa' : $absen['status']; 

            Kehadiran::updateOrCreate(
                ['sesi_presensi_id' => $sesi_id, 'user_id' => $absen['user_id']],
                ['status' => $statusDB, 'waktu_presensi' => now()]
            );
        }

        return response()->json(['status' => 'success', 'message' => 'Data kehadiran berhasil disimpan.']);
    }

    public function submitKode(Request $request, $sesi_id)
    {
        $request->validate([
            'status' => 'required|in:Hadir,Izin',
            'kode_presensi' => 'required_if:status,Hadir', // Kode HANYA wajib jika status Hadir
            'bukti_izin' => 'required_if:status,Izin|nullable|url' // Link surat Izin
        ]);

        $sesi = SesiPresensi::findOrFail($sesi_id);

        if (!$sesi->is_active) {
            return response()->json(['status' => 'error', 'message' => 'Sesi presensi sudah ditutup.'], 400);
        }

        $waktuBatas = Carbon::parse($sesi->tanggal . ' ' . $sesi->batas_waktu);
        if (now()->greaterThan($waktuBatas)) {
            return response()->json(['status' => 'error', 'message' => 'Batas waktu presensi telah lewat. Anda dihitung Tidak Hadir.'], 400);
        }

        if ($request->status === 'Hadir') {
            if (strtoupper($sesi->kode_presensi) !== strtoupper($request->kode_presensi)) {
                return response()->json(['status' => 'error', 'message' => 'Kode presensi tidak valid.'], 400);
            }
        }

        Kehadiran::updateOrCreate(
            ['sesi_presensi_id' => $sesi_id, 'user_id' => auth()->id()],
            [
                'status' => $request->status, 
                'waktu_presensi' => now(),
                'bukti_izin' => $request->status === 'Izin' ? $request->bukti_izin : null
            ]
        );

        return response()->json(['status' => 'success', 'message' => 'Berhasil mengirim presensi!']);
    }
}