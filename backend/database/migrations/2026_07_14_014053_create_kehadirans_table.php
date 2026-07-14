<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kehadiran', function (Blueprint $table) {
            $table->id();
            
            // Relasi ke tabel sesi_presensi (Foreign Key)
            // onDelete('cascade') artinya jika sesi dihapus, data kehadiran di sesi itu ikut terhapus
            $table->foreignId('sesi_presensi_id')->constrained('sesi_presensi')->onDelete('cascade');
            
            // Relasi ke tabel users / anggota (Foreign Key)
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            // Status presensi
            $table->enum('status', ['Hadir', 'Izin', 'Sakit', 'Alpa'])->default('Alpa');
            
            // Kapan anggota tersebut melakukan presensi
            $table->timestamp('waktu_presensi')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kehadiran');
    }
};