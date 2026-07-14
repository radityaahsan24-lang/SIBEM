<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SesiPresensi extends Model
{
    use HasFactory;

    // Mendefinisikan nama tabel secara manual
    protected $table = 'sesi_presensi';

    // Kolom-kolom yang diizinkan untuk diisi secara massal
    protected $fillable = [
        'nama_kegiatan',
        'tingkatan',
        'kementerian',
        'kode_presensi',
        'tanggal',
        'waktu_mulai',
        'batas_waktu',
        'is_active',
    ];

    public function daftarKehadiran()
    {
        return $this->hasMany(Kehadiran::class, 'sesi_presensi_id');
    }
}