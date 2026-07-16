<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kaks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('nama_kegiatan');
            $table->string('divisi');
            $table->text('latar_belakang')->nullable();
            $table->text('tujuan')->nullable();
            $table->text('sasaran')->nullable();
            $table->string('tempat')->nullable();
            $table->date('tanggal_pelaksanaan')->nullable();
            $table->decimal('anggaran_estimasi', 15, 2)->nullable();
            $table->string('penanggung_jawab')->nullable();
            $table->enum('status', ['draft', 'pending', 'verifikasi_sekjen', 'disetujui', 'ditolak'])->default('pending');
            $table->text('catatan_revisi')->nullable();
            $table->foreignId('diverifikasi_oleh')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('tanggal_verifikasi')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kaks');
    }
};
