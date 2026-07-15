import { useState, useEffect } from "react";
import axios from "axios";

interface AnggaranData {
  id: number;
  proker_id: number | null;
  nama_kegiatan: string;
  divisi: string;
  jenis: string;
  jumlah: number;
  keterangan: string | null;
  tanggal: string | null;
  bukti_file: string | null;
  status: string;
}

const Anggaran = () => {
  const [daftarAnggaran, setDaftarAnggaran] = useState<AnggaranData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    nama_kegiatan: "",
    divisi: "",
    jenis: "pengeluaran",
    jumlah: "",
    tanggal: "",
    keterangan: "",
  });

  useEffect(() => {
    fetchAnggarans();
  }, []);

  async function fetchAnggarans(silent = false) {
    if (!silent) setIsFetching(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://127.0.0.1:8000/api/anggaran", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDaftarAnggaran(response.data);
    } catch (error) {
      console.error("Gagal mengambil data anggaran:", error);
    } finally {
      if (!silent) setIsFetching(false);
    }
  }

  const handleAddClick = () => {
    setFormData({
      nama_kegiatan: "",
      divisi: "",
      jenis: "pengeluaran",
      jumlah: "",
      tanggal: "",
      keterangan: "",
    });
    setIsEditMode(false);
    setEditId(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (anggaran: AnggaranData) => {
    setFormData({
      nama_kegiatan: anggaran.nama_kegiatan,
      divisi: anggaran.divisi,
      jenis: anggaran.jenis,
      jumlah: anggaran.jumlah.toString(),
      tanggal: anggaran.tanggal || "",
      keterangan: anggaran.keterangan || "",
    });
    setIsEditMode(true);
    setEditId(anggaran.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...formData,
        jumlah: parseFloat(formData.jumlah)
      };

      if (isEditMode && editId !== null) {
        await axios.put(
          `http://127.0.0.1:8000/api/anggaran/${editId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post("http://127.0.0.1:8000/api/anggaran", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setIsModalOpen(false);
      fetchAnggarans(true);
    } catch (error) {
      console.error("Gagal menyimpan anggaran:", error);
      alert("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (anggaran: AnggaranData, newStatus: string) => {
    const dataSebelumnya = [...daftarAnggaran];

    setDaftarAnggaran((prev) =>
      prev.map((item) =>
        item.id === anggaran.id ? { ...item, status: newStatus } : item
      )
    );

    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://127.0.0.1:8000/api/anggaran/${anggaran.id}`, {
        ...anggaran,
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Gagal mengubah status:", error);
      setDaftarAnggaran(dataSebelumnya);
      alert("Terjadi kesalahan saat memvalidasi anggaran.");
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteTargetId === null) return;
    
    const targetId = deleteTargetId;
    const dataSebelumnya = [...daftarAnggaran];

    setDaftarAnggaran((prev) => prev.filter((item) => item.id !== targetId));
    setIsDeleteModalOpen(false);
    setDeleteTargetId(null);

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://127.0.0.1:8000/api/anggaran/${targetId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Gagal menghapus anggaran:", error);
      setDaftarAnggaran(dataSebelumnya);
      alert("Terjadi kesalahan saat menghapus data.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "disetujui":
        return "bg-green-100 text-green-800";
      case "pending":
      case "verifikasi_sekjen":
        return "bg-yellow-100 text-yellow-800";
      case "ditolak":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const formatTanggal = (tanggal: string | null) => {
    if (!tanggal) return "-";
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(tanggal).toLocaleDateString('id-ID', options);
  };

  // Role sementara didapatkan dari localStorage
  const userRole = localStorage.getItem("role") || "user";
  const isSekjen = userRole === "sekjen";
  const isPresbem = userRole === "presbem";

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Manajemen Anggaran
          </h1>
          <p className="text-gray-500 text-sm md:text-base mt-1">
            Kelola pengajuan, pemasukan, dan pengeluaran anggaran himpunan.
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-sm font-medium w-full sm:w-auto"
        >
          + Ajukan Anggaran
        </button>
      </div>

      {/* Ringkasan Anggaran (Pagu Dana) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
            <h3 className="text-gray-500 text-sm font-medium mb-1">Total Pemasukan</h3>
            <p className="text-2xl font-bold text-green-600">
               {formatRupiah(daftarAnggaran.filter(a => a.jenis === 'pemasukan' && a.status === 'disetujui').reduce((acc, curr) => acc + parseFloat(String(curr.jumlah)), 0))}
            </p>
         </div>
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
            <h3 className="text-gray-500 text-sm font-medium mb-1">Total Pengeluaran (Disetujui)</h3>
            <p className="text-2xl font-bold text-red-500">
               {formatRupiah(daftarAnggaran.filter(a => a.jenis === 'pengeluaran' && a.status === 'disetujui').reduce((acc, curr) => acc + parseFloat(String(curr.jumlah)), 0))}
            </p>
         </div>
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
            <h3 className="text-gray-500 text-sm font-medium mb-1">Menunggu Validasi</h3>
            <p className="text-2xl font-bold text-yellow-600">
               {daftarAnggaran.filter(a => a.status === 'pending' || a.status === 'verifikasi_sekjen').length} Pengajuan
            </p>
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-600">No.</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Kegiatan</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Divisi</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Jenis</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Nominal</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Tanggal</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isFetching ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                      <p>Memuat data anggaran...</p>
                    </div>
                  </td>
                </tr>
              ) : daftarAnggaran.length > 0 ? (
                daftarAnggaran.map((anggaran, i) => (
                  <tr key={anggaran.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="p-4 text-sm text-gray-700 font-medium">{i + 1}</td>
                    <td className="p-4 text-sm text-gray-800 font-medium">{anggaran.nama_kegiatan}</td>
                    <td className="p-4 text-sm text-gray-600">{anggaran.divisi}</td>
                    <td className="p-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${anggaran.jenis === 'pemasukan' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                         {anggaran.jenis.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-800">{formatRupiah(anggaran.jumlah)}</td>
                    <td className="p-4 text-sm text-gray-600">{formatTanggal(anggaran.tanggal)}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(anggaran.status)}`}>
                        {anggaran.status.replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 flex justify-center gap-2">
                      {/* Tombol Approval Berjenjang */}
                      {(isSekjen && anggaran.status === 'pending') && (
                          <button 
                             onClick={() => handleStatusChange(anggaran, 'verifikasi_sekjen')}
                             className="text-white bg-orange-500 hover:bg-orange-600 text-xs font-bold px-2 py-1 rounded-md transition"
                             title="Verifikasi Tahap 1"
                          >
                             Verifikasi
                          </button>
                      )}
                      
                      {(isPresbem && anggaran.status === 'verifikasi_sekjen') && (
                          <button 
                             onClick={() => handleStatusChange(anggaran, 'disetujui')}
                             className="text-white bg-green-500 hover:bg-green-600 text-xs font-bold px-2 py-1 rounded-md transition"
                             title="Persetujuan Akhir"
                          >
                             ACC Final
                          </button>
                      )}

                      {/* Tolak bisa dilakukan oleh Sekjen (saat pending) atau Presbem (saat verif) */}
                      {((isSekjen && anggaran.status === 'pending') || (isPresbem && anggaran.status === 'verifikasi_sekjen')) && (
                          <button 
                             onClick={() => handleStatusChange(anggaran, 'ditolak')}
                             className="text-white bg-red-500 hover:bg-red-600 text-xs font-bold px-2 py-1 rounded-md transition"
                          >
                             Tolak
                          </button>
                      )}

                      <button onClick={() => handleEditClick(anggaran)} className="text-orange-600 hover:text-orange-800 text-sm font-medium bg-orange-50 hover:bg-orange-100 px-3 py-1 rounded-md transition">Edit</button>
                      <button onClick={() => handleDeleteClick(anggaran.id)} className="text-red-600 hover:text-red-800 text-sm font-medium bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition">Hapus</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-gray-500">
                    Belum ada data anggaran.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-[95%] sm:w-full max-w-lg p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {isEditMode ? "Edit Anggaran" : "Ajukan Anggaran"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kegiatan/Proker <span className="text-red-500">*</span></label>
                <input type="text" required className="w-full p-2 border border-gray-300 rounded-lg" value={formData.nama_kegiatan} onChange={(e) => setFormData({ ...formData, nama_kegiatan: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Divisi/Kementerian <span className="text-red-500">*</span></label>
                   <select required className="w-full p-2 border border-gray-300 rounded-lg" value={formData.divisi} onChange={(e) => setFormData({ ...formData, divisi: e.target.value })}>
                     <option value="" disabled>-- Pilih --</option>
                     <option value="Kastrat">Kastrat</option>
                     <option value="Risil">Risil</option>
                     <option value="Kominfo">Kominfo</option>
                     <option value="Sosmas">Sosmas</option>
                     <option value="PSDM">PSDM</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Jenis <span className="text-red-500">*</span></label>
                   <select required className="w-full p-2 border border-gray-300 rounded-lg" value={formData.jenis} onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}>
                     <option value="pengeluaran">Pengeluaran (Ajukan)</option>
                     <option value="pemasukan">Pemasukan (Lapor)</option>
                   </select>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Nominal (Rp) <span className="text-red-500">*</span></label>
                   <input type="number" min="0" required className="w-full p-2 border border-gray-300 rounded-lg" value={formData.jumlah} onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })} />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal <span className="text-red-500">*</span></label>
                   <input type="date" required className="w-full p-2 border border-gray-300 rounded-lg" value={formData.tanggal} onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })} />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan / Rincian</label>
                <textarea rows={2} className="w-full p-2 border border-gray-300 rounded-lg" value={formData.keterangan} onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })} />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">Batal</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg font-medium disabled:bg-green-300">{isLoading ? "Menyimpan..." : "Simpan"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL HAPUS */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-[95%] sm:w-full max-w-sm p-6 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Data Anggaran?</h3>
            <p className="text-sm text-gray-500 mb-6">Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium w-full">Batal</button>
              <button onClick={confirmDelete} className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium w-full">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Anggaran;
