<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    /**
     * Ambil Dana Pagu Awal.
     */
    public function getPagu()
    {
        $pagu = Setting::getValue('dana_pagu_awal', 0);

        return response()->json([
            'dana_pagu_awal' => (float) $pagu,
        ]);
    }

    /**
     * Update Dana Pagu Awal.
     */
    public function updatePagu(Request $request)
    {
        $request->validate([
            'dana_pagu_awal' => 'required|numeric|min:0',
        ]);

        Setting::setValue('dana_pagu_awal', $request->dana_pagu_awal);

        return response()->json([
            'message' => 'Dana Pagu Awal berhasil diperbarui!',
            'dana_pagu_awal' => (float) $request->dana_pagu_awal,
        ]);
    }
}
