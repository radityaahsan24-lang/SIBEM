import { useState, useEffect } from "react";
import axios from "axios";

interface KAKData {
  id: number;
  nama_kegiatan: string;
  divisi: string;
  latar_belakang: string | null;
  tujuan: string | null;
  sasaran: string | null;
  tempat: string | null;
  tanggal_pelaksanaan: string | null;
  anggaran_estimasi: number | null;
  penanggung_jawab: string | null;
  status: string;
}

const PengajuanKAK = () => {
  const [daftarKAK, setDaftarKAK] = useState<KAKData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedKAK, setSelectedKAK] = useState<KAKData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const [isLpjModalOpen, setIsLpjModalOpen] = useState(false);
  const [lpjFormData, setLpjFormData] = useState({
    kak_id: "",
    link: "",
    total_anggaran: "",
  });

  // Daftar LPJ dari backend
  interface LPJData {
    id: number;
    kak_id: number;
    link: string;
    total_anggaran: number;
    status: string;
    kak?: KAKData;
  }
  const [daftarLPJ, setDaftarLPJ] = useState<LPJData[]>([]);

  const [formData, setFormData] = useState({
    nama_kegiatan: "",
    divisi: "",
    latar_belakang: "",
    tujuan: "",
    sasaran: "",
    tempat: "",
    tanggal_pelaksanaan: "",
    anggaran_estimasi: "",
    penanggung_jawab: "",
  });

  useEffect(() => {
    const loadData = async () => {
      setIsFetching(true);
      try {
        const token = localStorage.getItem("token");
        const [kakRes, lpjRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/api/kak", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://127.0.0.1:8000/api/lpj", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setDaftarKAK(kakRes.data);
        setDaftarLPJ(lpjRes.data);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      } finally {
        setIsFetching(false);
      }
    };
    loadData();
  }, []);

  async function fetchKAK(silent = false) {
    if (!silent) setIsFetching(true);
    try {
      const token = localStorage.getItem("token");
      const [kakRes, lpjRes] = await Promise.all([
        axios.get("http://127.0.0.1:8000/api/kak", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://127.0.0.1:8000/api/lpj", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setDaftarKAK(kakRes.data);
      setDaftarLPJ(lpjRes.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      if (!silent) setIsFetching(false);
    }
  }

  const handleAddClick = () => {
    setFormData({
      nama_kegiatan: "",
      divisi: "",
      latar_belakang: "",
      tujuan: "",
      sasaran: "",
      tempat: "",
      tanggal_pelaksanaan: "",
      anggaran_estimasi: "",
      penanggung_jawab: "",
    });
    setIsEditMode(false);
    setEditId(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (kak: KAKData) => {
    setFormData({
      nama_kegiatan: kak.nama_kegiatan,
      divisi: kak.divisi,
      latar_belakang: kak.latar_belakang || "",
      tujuan: kak.tujuan || "",
      sasaran: kak.sasaran || "",
      tempat: kak.tempat || "",
      tanggal_pelaksanaan: kak.tanggal_pelaksanaan || "",
      anggaran_estimasi: kak.anggaran_estimasi?.toString() || "",
      penanggung_jawab: kak.penanggung_jawab || "",
    });
    setIsEditMode(true);
    setEditId(kak.id);
    setIsModalOpen(true);
  };

  const handleDetailClick = (kak: KAKData) => {
    setSelectedKAK(kak);
    setIsDetailModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...formData,
        anggaran_estimasi: formData.anggaran_estimasi
          ? Number(formData.anggaran_estimasi)
          : null,
      };

      // --- LOGIKA VALIDASI 50% PAGU AWAL ---
      const paguRes = await axios.get("http://127.0.0.1:8000/api/settings/pagu", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const danaPaguAwal = paguRes.data.dana_pagu_awal;
      const batasMaksimal = danaPaguAwal * 0.5;

      if (payload.anggaran_estimasi && payload.anggaran_estimasi >= batasMaksimal) {
        alert(
          `SISTEM OTOMATIS MENOLAK!\n\n` +
          `Anggaran kegiatan yang diajukan melebihi batas maksimal 50% dari Dana Pagu Awal.\n` +
          `- Dana Pagu Awal: Rp ${danaPaguAwal.toLocaleString('id-ID')}\n` +
          `- Batas Maksimal (50%): Rp ${batasMaksimal.toLocaleString('id-ID')}\n` +
          `- Pengajuan Anda: Rp ${payload.anggaran_estimasi.toLocaleString('id-ID')}`
        );
        setIsLoading(false);
        return;
      }
      // -------------------------------------

      if (isEditMode && editId !== null) {
        await axios.put(
          `http://127.0.0.1:8000/api/kak/${editId}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      } else {
        await axios.post("http://127.0.0.1:8000/api/kak", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setIsModalOpen(false);
      fetchKAK(true);
    } catch (error) {
      console.error("Gagal menyimpan KAK:", error);
      alert("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsLoading(false);
    }
  };

  // Optimistic Update untuk Status (ACC/Tolak)
  const handleStatusChange = async (kak: KAKData, newStatus: string) => {
    const dataSebelumnya = [...daftarKAK];

    setDaftarKAK((prev) =>
      prev.map((item) =>
        item.id === kak.id ? { ...item, status: newStatus } : item
      )
    );

    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://127.0.0.1:8000/api/kak/${kak.id}`, {
        ...kak,
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Gagal mengubah status:", error);
      setDaftarKAK(dataSebelumnya);
      alert("Terjadi kesalahan saat memvalidasi KAK.");
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  const handleLpjClick = () => {
    setLpjFormData({ kak_id: "", link: "", total_anggaran: "" });
    setIsLpjModalOpen(true);
  };

  // Helper: Ambil KAK yang sudah di-ACC dan belum punya LPJ
  const kakYangSudahACC = daftarKAK.filter(kak => 
    kak.status === 'disetujui' && 
    !daftarLPJ.some(lpj => lpj.kak_id === kak.id)
  );

  // Helper: ambil detail KAK terpilih di form LPJ
  const selectedKAKForLPJ = lpjFormData.kak_id 
    ? daftarKAK.find(k => k.id === Number(lpjFormData.kak_id)) 
    : null;

  const handleLpjSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const kakId = Number(lpjFormData.kak_id);
      const kakTerkait = daftarKAK.find(k => k.id === kakId);
      if (!kakTerkait || !kakTerkait.anggaran_estimasi) {
        alert("Pilih kegiatan KAK yang valid.");
        setIsLoading(false);
        return;
      }

      const realisasi = Number(lpjFormData.total_anggaran);
      const anggaranKAK = kakTerkait.anggaran_estimasi;
      const selisih = realisasi - anggaranKAK;

      // Simpan LPJ ke backend
      const token = localStorage.getItem("token");
      await axios.post("http://127.0.0.1:8000/api/lpj", {
        kak_id: kakId,
        link: lpjFormData.link,
        total_anggaran: realisasi,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Beri info kepada user
      let pesan = `LPJ berhasil diajukan!\n\n`;
      pesan += `Kegiatan: ${kakTerkait.nama_kegiatan}\n`;
      pesan += `Anggaran KAK: Rp ${anggaranKAK.toLocaleString('id-ID')}\n`;
      pesan += `Realisasi Dana: Rp ${realisasi.toLocaleString('id-ID')}\n\n`;

      if (selisih < 0) {
        pesan += `✅ Dana lebih hemat Rp ${Math.abs(selisih).toLocaleString('id-ID')}.\nSisa akan dikembalikan ke Anggaran Tersisa saat LPJ di-ACC.`;
      } else if (selisih > 0) {
        pesan += `⚠️ Dana melebihi anggaran KAK sebesar Rp ${selisih.toLocaleString('id-ID')}.\nAnggaran Tersisa akan berkurang lagi saat LPJ di-ACC.`;
      } else {
        pesan += `✅ Realisasi dana sesuai dengan anggaran KAK. Sempurna!`;
      }

      alert(pesan);
      setIsLpjModalOpen(false);
      fetchKAK(true); // Refresh data
    } catch (error) {
      console.error(error);
      let msg = "Terjadi kesalahan saat menyimpan LPJ.";
      if (axios.isAxiosError(error)) {
        msg = error.response?.data?.message || msg;
      }
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Optimistic Update untuk Hapus Data
  const confirmDelete = async () => {
    if (deleteTargetId === null) return;

    const targetId = deleteTargetId;
    const dataSebelumnya = [...daftarKAK];

    setDaftarKAK((prev) => prev.filter((item) => item.id !== targetId));
    setIsDeleteModalOpen(false);
    setDeleteTargetId(null);

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://127.0.0.1:8000/api/kak/${targetId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Gagal menghapus KAK:", error);
      setDaftarKAK(dataSebelumnya);
      alert("Terjadi kesalahan saat menghapus data.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "disetujui":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "ditolak":
        return "bg-red-100 text-red-800";
      case "revisi":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Menunggu Review";
      case "disetujui":
        return "Disetujui";
      case "ditolak":
        return "Ditolak";
      case "revisi":
        return "Perlu Revisi";
      default:
        return status;
    }
  };

  const formatTanggal = (tanggal: string | null) => {
    if (!tanggal) return "-";
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(tanggal).toLocaleDateString('id-ID', options);
  };

  const formatRupiah = (angka: number | null) => {
    if (!angka) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Pengajuan KAK & LPJ
          </h1>
          <p className="text-gray-500 text-sm md:text-base mt-1">
            Kelola pengajuan dokumen Kerangka Acuan Kerja (KAK) dan Laporan Pertanggungjawaban (LPJ).
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={handleLpjClick}
            className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition shadow-sm font-medium w-full sm:w-auto"
          >
            + Ajukan LPJ Baru
          </button>
          <button
            onClick={handleAddClick}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition shadow-sm font-medium w-full sm:w-auto"
          >
            + Ajukan KAK Baru
          </button>
        </div>
      </div>

      {/* Statistik Ringkas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Pengajuan</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{daftarKAK.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-yellow-100 p-4">
          <p className="text-sm text-yellow-600">Menunggu Review</p>
          <p className="text-2xl font-bold text-yellow-700 mt-1">
            {daftarKAK.filter((k) => k.status === "pending").length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-green-100 p-4">
          <p className="text-sm text-green-600">Disetujui</p>
          <p className="text-2xl font-bold text-green-700 mt-1">
            {daftarKAK.filter((k) => k.status === "disetujui").length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-red-100 p-4">
          <p className="text-sm text-red-600">Ditolak</p>
          <p className="text-2xl font-bold text-red-700 mt-1">
            {daftarKAK.filter((k) => k.status === "ditolak").length}
          </p>
        </div>
      </div>

      {/* Tabel Daftar KAK */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-600">No.</th>
                <th className="p-4 text-sm font-semibold text-gray-600">
                  Nama Kegiatan
                </th>
                <th className="p-4 text-sm font-semibold text-gray-600">
                  Kementerian
                </th>
                <th className="p-4 text-sm font-semibold text-gray-600">
                  Penanggung Jawab
                </th>
                <th className="p-4 text-sm font-semibold text-gray-600">
                  Tanggal
                </th>
                <th className="p-4 text-sm font-semibold text-gray-600">
                  Estimasi Anggaran
                </th>
                <th className="p-4 text-sm font-semibold text-gray-600">
                  Status
                </th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-center">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {isFetching ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                      <p>Memuat data pengajuan KAK...</p>
                    </div>
                  </td>
                </tr>
              ) : daftarKAK.length > 0 ? (
                daftarKAK.map((kak, i) => (
                  <tr
                    key={kak.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 text-sm text-gray-700 font-medium">
                      {i + 1}
                    </td>
                    <td className="p-4 text-sm text-gray-800 font-medium">
                      {kak.nama_kegiatan}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {kak.divisi}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {kak.penanggung_jawab || "-"}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {formatTanggal(kak.tanggal_pelaksanaan)}
                    </td>
                    <td className="p-4 text-sm text-gray-600 font-medium">
                      {formatRupiah(kak.anggaran_estimasi)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(kak.status)}`}
                      >
                        {formatStatusText(kak.status)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2 flex-wrap">
                        {/* Tombol Detail */}
                        <button
                          onClick={() => handleDetailClick(kak)}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition"
                        >
                          Detail
                        </button>

                        {/* Tombol ACC/Tolak hanya muncul jika masih pending */}
                        {kak.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(kak, 'disetujui')}
                              className="text-green-700 bg-green-100 hover:bg-green-200 text-xs font-bold px-2 py-1 rounded-md transition"
                              title="Setujui KAK"
                            >
                              ACC
                            </button>
                            <button
                              onClick={() => handleStatusChange(kak, 'ditolak')}
                              className="text-orange-700 bg-orange-100 hover:bg-orange-200 text-xs font-bold px-2 py-1 rounded-md transition"
                              title="Tolak KAK"
                            >
                              TOLAK
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handleEditClick(kak)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(kak.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      <p className="font-medium text-gray-500">Belum ada pengajuan KAK.</p>
                      <p className="text-sm mt-1">Klik tombol "Ajukan KAK Baru" untuk memulai.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH / EDIT KAK */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-[95%] sm:w-full max-w-lg p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {isEditMode ? "Edit Pengajuan KAK" : "Ajukan KAK Baru"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Kegiatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Seminar Nasional Kewirausahaan"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-base sm:text-sm"
                  value={formData.nama_kegiatan}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_kegiatan: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kementerian <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-base sm:text-sm"
                  value={formData.divisi}
                  onChange={(e) =>
                    setFormData({ ...formData, divisi: e.target.value })
                  }
                >
                  <option value="" disabled>-- Pilih Kementerian --</option>
                  <option value="Kastrat">Kastrat</option>
                  <option value="Risil">Risil</option>
                  <option value="Kominfo">Kominfo</option>
                  <option value="Sosmas">Sosmas</option>
                  <option value="PSDM">PSDM</option>
                  <option value="Dagri">Dagri</option>
                  <option value="Ekraf">Ekraf</option>
                  <option value="Advokesma">Advokesma</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latar Belakang
                </label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan latar belakang kegiatan ini..."
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-base sm:text-sm"
                  value={formData.latar_belakang}
                  onChange={(e) =>
                    setFormData({ ...formData, latar_belakang: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tujuan
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Tujuan kegiatan..."
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-base sm:text-sm"
                    value={formData.tujuan}
                    onChange={(e) =>
                      setFormData({ ...formData, tujuan: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sasaran
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Sasaran peserta kegiatan..."
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-base sm:text-sm"
                    value={formData.sasaran}
                    onChange={(e) =>
                      setFormData({ ...formData, sasaran: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tempat Pelaksanaan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Aula UISI"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-base sm:text-sm"
                    value={formData.tempat}
                    onChange={(e) =>
                      setFormData({ ...formData, tempat: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Pelaksanaan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-base sm:text-sm"
                    value={formData.tanggal_pelaksanaan}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tanggal_pelaksanaan: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimasi Anggaran (Rp)
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 5000000"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-base sm:text-sm"
                    value={formData.anggaran_estimasi}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        anggaran_estimasi: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Penanggung Jawab <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama penanggung jawab"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-base sm:text-sm"
                    value={formData.penanggung_jawab}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        penanggung_jawab: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-sm sm:text-base"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-white bg-orange-500 hover:bg-orange-600 rounded-lg font-medium text-sm sm:text-base disabled:bg-orange-300"
                >
                  {isLoading ? "Menyimpan..." : "Simpan Pengajuan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETAIL KAK */}
      {isDetailModalOpen && selectedKAK && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-[95%] sm:w-full max-w-lg p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Detail Pengajuan KAK
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedKAK.status)}`}
              >
                {formatStatusText(selectedKAK.status)}
              </span>
            </div>

            <div className="space-y-4">
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                <h3 className="text-lg font-bold text-gray-800">{selectedKAK.nama_kegiatan}</h3>
                <p className="text-sm text-orange-600 mt-1">{selectedKAK.divisi}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Penanggung Jawab</p>
                  <p className="text-sm font-medium text-gray-800 mt-1">{selectedKAK.penanggung_jawab || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Tanggal Pelaksanaan</p>
                  <p className="text-sm font-medium text-gray-800 mt-1">{formatTanggal(selectedKAK.tanggal_pelaksanaan)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Tempat</p>
                  <p className="text-sm font-medium text-gray-800 mt-1">{selectedKAK.tempat || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Estimasi Anggaran</p>
                  <p className="text-sm font-bold text-orange-600 mt-1">{formatRupiah(selectedKAK.anggaran_estimasi)}</p>
                </div>
              </div>

              {selectedKAK.latar_belakang && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Latar Belakang</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedKAK.latar_belakang}</p>
                </div>
              )}

              {selectedKAK.tujuan && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Tujuan</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedKAK.tujuan}</p>
                </div>
              )}

              {selectedKAK.sasaran && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Sasaran</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedKAK.sasaran}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6 pt-2">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-sm sm:text-base"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-[95%] sm:w-full max-w-sm p-5 sm:p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Hapus Pengajuan KAK?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Apakah kamu yakin ingin menghapus pengajuan KAK ini? Data yang sudah
              dihapus tidak dapat dikembalikan.
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteTargetId(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium w-full text-sm sm:text-base"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium w-full flex justify-center items-center text-sm sm:text-base"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PENGAJUAN LPJ */}
      {isLpjModalOpen && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-[95%] sm:w-full max-w-lg p-5 sm:p-6 text-left">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              Pengajuan LPJ
            </h3>
            <p className="text-sm text-gray-500 mb-4">Laporan Pertanggungjawaban Kegiatan</p>
            
            <form onSubmit={handleLpjSubmit} className="space-y-4">
              {/* Pilih Kegiatan KAK */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pilih Kegiatan (KAK yang sudah di-ACC) <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 text-base sm:text-sm"
                  value={lpjFormData.kak_id}
                  onChange={(e) =>
                    setLpjFormData({ ...lpjFormData, kak_id: e.target.value })
                  }
                >
                  <option value="" disabled>-- Pilih Kegiatan --</option>
                  {kakYangSudahACC.length > 0 ? (
                    kakYangSudahACC.map(kak => (
                      <option key={kak.id} value={kak.id}>
                        {kak.nama_kegiatan} — {kak.divisi} (Rp {kak.anggaran_estimasi?.toLocaleString('id-ID')})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Belum ada KAK yang di-ACC</option>
                  )}
                </select>
              </div>

              {/* Info Anggaran KAK Terpilih */}
              {selectedKAKForLPJ && (
                <div className="bg-teal-50 border border-teal-100 rounded-lg p-3">
                  <p className="text-xs text-teal-600 font-medium">Anggaran Estimasi KAK</p>
                  <p className="text-lg font-bold text-teal-800">
                    Rp {selectedKAKForLPJ.anggaran_estimasi?.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Kementerian: {selectedKAKForLPJ.divisi}</p>
                </div>
              )}

              {/* Link Dokumen LPJ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Dokumen LPJ <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="Contoh: https://docs.google.com/..."
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 text-base sm:text-sm"
                  value={lpjFormData.link}
                  onChange={(e) =>
                    setLpjFormData({ ...lpjFormData, link: e.target.value })
                  }
                />
              </div>
              
              {/* Total Realisasi Dana */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Realisasi Dana (Rp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 4500000"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 text-base sm:text-sm"
                  value={lpjFormData.total_anggaran}
                  onChange={(e) =>
                    setLpjFormData({ ...lpjFormData, total_anggaran: e.target.value })
                  }
                />
              </div>

              {/* Preview Selisih */}
              {selectedKAKForLPJ && lpjFormData.total_anggaran && (() => {
                const realisasi = Number(lpjFormData.total_anggaran);
                const estimasi = selectedKAKForLPJ.anggaran_estimasi || 0;
                const selisih = realisasi - estimasi;
                return (
                  <div className={`rounded-lg p-3 border ${selisih > 0 ? 'bg-red-50 border-red-200' : selisih < 0 ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                    <p className="text-xs font-medium text-gray-600 mb-1">Preview Selisih Dana:</p>
                    {selisih < 0 && (
                      <p className="text-sm font-bold text-green-700">✅ Hemat Rp {Math.abs(selisih).toLocaleString('id-ID')} — sisa akan dikembalikan</p>
                    )}
                    {selisih > 0 && (
                      <p className="text-sm font-bold text-red-700">⚠️ Melebihi Rp {selisih.toLocaleString('id-ID')} — anggaran tersisa akan berkurang</p>
                    )}
                    {selisih === 0 && (
                      <p className="text-sm font-bold text-blue-700">✅ Realisasi sesuai anggaran KAK</p>
                    )}
                  </div>
                );
              })()}
              
              <div className="flex justify-end gap-3 mt-6 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLpjModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-sm sm:text-base"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading || kakYangSudahACC.length === 0}
                  className="px-4 py-2 text-white bg-teal-600 hover:bg-teal-700 rounded-lg font-medium text-sm sm:text-base disabled:bg-teal-300 flex items-center justify-center min-w-[120px]"
                >
                  {isLoading ? (
                    <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : "Ajukan LPJ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PengajuanKAK;
