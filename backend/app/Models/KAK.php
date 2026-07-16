<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KAK extends Model
{
    use HasFactory;

    protected $table = 'kaks';

    protected $fillable = [
        'user_id',
        'nama_kegiatan',
        'divisi',
        'latar_belakang',
        'tujuan',
        'sasaran',
        'tempat',
        'tanggal_pelaksanaan',
        'anggaran_estimasi',
        'penanggung_jawab',
        'status',
        'catatan_revisi',
        'diverifikasi_oleh',
        'tanggal_verifikasi',
    ];

    /**
     * Relasi: KAK dimiliki oleh seorang User (pengaju).
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi: KAK memiliki satu LPJ.
     */
    public function lpj()
    {
        return $this->hasOne(LPJ::class, 'kak_id');
    }
}
