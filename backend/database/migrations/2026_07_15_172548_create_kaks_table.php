<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('kaks', function (Blueprint $table) {
            $table->id();
            $table->string('nama_kegiatan');
            $table->string('divisi');
            $table->string('link_drive')->nullable();
            $table->string('status')->default('pending'); // "pending", "revisi 1", "revisi 2", "disetujui", "ditolak"
            $table->string('tipe_pengajuan')->default('kak'); // "kak" or "lpj"
            $table->text('catatan_revisi')->nullable();
            
            // Legacy / optional fields from original KAK structure if still needed
            $table->text('latar_belakang')->nullable();
            $table->text('tujuan')->nullable();
            $table->text('sasaran')->nullable();
            $table->string('tempat')->nullable();
            $table->date('tanggal_pelaksanaan')->nullable();
            $table->integer('anggaran_estimasi')->nullable();
            $table->string('penanggung_jawab')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kaks');
    }
};
