<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Proker extends Model
{
    use HasFactory;

    // Mengizinkan pengisian data ke kolom-kolom ini
    protected $fillable = [
        'nama_proker',
        'divisi',
        'deskripsi',
        'status',
        'tanggal_pelaksanaan',
        'user_id'
    ];
}