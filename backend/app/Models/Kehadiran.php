<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kehadiran extends Model
{
    use HasFactory;

    protected $table = 'kehadiran';

    protected $fillable = [
        'sesi_presensi_id',
        'user_id',
        'status',
        'waktu_presensi'
    ];

    // Relasi balik ke tabel SesiPresensi (1 Kehadiran milik 1 Sesi)
    public function sesiPresensi()
    {
        return $this->belongsTo(SesiPresensi::class, 'sesi_presensi_id');
    }

    // Relasi ke tabel User (1 Kehadiran milik 1 User)
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}