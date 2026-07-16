<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LPJ extends Model
{
    use HasFactory;

    protected $table = 'lpjs';

    protected $fillable = [
        'kak_id',
        'user_id',
        'link',
        'total_anggaran',
        'status',
        'catatan_revisi',
        'diverifikasi_oleh',
        'tanggal_verifikasi',
    ];

    /**
     * Relasi: LPJ terhubung ke satu KAK.
     */
    public function kak()
    {
        return $this->belongsTo(KAK::class, 'kak_id');
    }

    /**
     * Relasi: LPJ dimiliki oleh seorang User (pengaju).
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
