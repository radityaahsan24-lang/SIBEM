<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('kehadiran', function (Blueprint $table) {
            $table->string('bukti_izin')->nullable(); // Menambahkan kolom link surat izin
        });
    }
    public function down(): void {
        Schema::table('kehadiran', function (Blueprint $table) {
            $table->dropColumn('bukti_izin');
        });
    }
};