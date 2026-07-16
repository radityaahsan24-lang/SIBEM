<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lpjs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kak_id')->constrained('kaks')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('link');
            $table->decimal('total_anggaran', 15, 2); // Realisasi dana
            $table->enum('status', ['pending', 'verifikasi_sekjen', 'disetujui', 'ditolak'])->default('pending');
            $table->text('catatan_revisi')->nullable();
            $table->foreignId('diverifikasi_oleh')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('tanggal_verifikasi')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lpjs');
    }
};
