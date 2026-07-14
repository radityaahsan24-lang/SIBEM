<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sesi_presensi', function (Blueprint $table) {
            $table->id();
            $table->string('nama_kegiatan');
            $table->string('tingkatan');
            $table->string('kementerian')->nullable(); // Boleh kosong jika tingkatan bukan kementerian
            $table->string('kode_presensi', 10)->unique(); // Kode unik untuk presensi
            $table->date('tanggal');
            $table->time('waktu_mulai');
            $table->time('batas_waktu');
            $table->boolean('is_active')->default(true); // Status sesi: aktif atau ditutup
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sesi_presensi');
    }
};