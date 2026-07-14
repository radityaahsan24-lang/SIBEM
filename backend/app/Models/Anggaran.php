<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Anggaran extends Model
{
    use HasFactory;

    protected $fillable = [
        'proker_id',
        'user_id',
        'nama_kegiatan',
        'divisi',
        'jenis',
        'jumlah',
        'keterangan',
        'tanggal',
        'bukti_file',
        'status',
        'catatan_revisi',
        'diverifikasi_oleh',
        'tanggal_verifikasi',
    ];
}
