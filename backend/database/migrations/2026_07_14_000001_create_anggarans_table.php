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
        Schema::create('anggarans', function (Blueprint $table) {
            $table->id();

            // Relasi ke proker dan user
            $table->foreignId('proker_id')->nullable()->constrained('prokers')->onDelete('set null');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');

            // Data utama anggaran
            $table->string('nama_kegiatan');
            $table->string('divisi'); // Kementerian pengaju
            $table->enum('jenis', ['pemasukan', 'pengeluaran'])->default('pengeluaran');
            $table->decimal('jumlah', 15, 2); // Nominal dalam Rupiah
            $table->text('keterangan')->nullable();
            $table->date('tanggal')->nullable();

            // Bukti kwitansi/nota (upload file oleh Staff)
            $table->string('bukti_file')->nullable();

            // Alur persetujuan berjenjang
            $table->enum('status', ['draft', 'pending', 'verifikasi_sekjen', 'disetujui', 'ditolak'])->default('draft');
            $table->text('catatan_revisi')->nullable(); // Catatan dari Sekjen / Presbem
            $table->foreignId('diverifikasi_oleh')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('tanggal_verifikasi')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('anggarans');
    }
};
