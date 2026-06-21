import { useState, useEffect } from "react";
import axios from "axios";

interface ProkerData {
  id: number;
  nama_proker: string;
  divisi: string;
  deskripsi: string | null;
  status: string;
  tanggal_pelaksanaan: string | null;
}

const Proker = () => {
  const [daftarKegiatan, setDaftarKegiatan] = useState<ProkerData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    nama_proker: "",
    divisi: "",
    deskripsi: "",
    tanggal_pelaksanaan: "",
  });

  useEffect(() => {
    fetchProkers();
  }, []);

  // PERUBAHAN 1: Tambahkan parameter 'silent' agar saat nambah/edit data, tabel tidak nge-blank loading
  const fetchProkers = async (silent = false) => {
    if (!silent) setIsFetching(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://127.0.0.1:8000/api/proker", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDaftarKegiatan(response.data);
    } catch (error) {
      console.error("Gagal mengambil data proker:", error);
    } finally {
      if (!silent) setIsFetching(false);
    }
  };

  const handleAddClick = () => {
    setFormData({
      nama_proker: "",
      divisi: "",
      deskripsi: "",
      tanggal_pelaksanaan: "",
    });
    setIsEditMode(false);
    setEditId(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (kegiatan: ProkerData) => {
    setFormData({
      nama_proker: kegiatan.nama_proker,
      divisi: kegiatan.divisi,
      deskripsi: kegiatan.deskripsi || "",
      tanggal_pelaksanaan: kegiatan.tanggal_pelaksanaan || "",
    });
    setIsEditMode(true);
    setEditId(kegiatan.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (isEditMode && editId !== null) {
        await axios.put(
          `http://127.0.0.1:8000/api/proker/${editId}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      } else {
        await axios.post("http://127.0.0.1:8000/api/proker", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setIsModalOpen(false);
      // PERUBAHAN 2: Fetch data diam-diam tanpa merubah isFetching jadi true
      fetchProkers(true); 
    } catch (error) {
      console.error("Gagal menyimpan proker:", error);
      alert("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsLoading(false);
    }
  };

  // PERUBAHAN 3: Optimistic Update untuk Status (ACC/Tolak)
  const handleStatusChange = async (kegiatan: ProkerData, newStatus: string) => {
    const dataSebelumnya = [...daftarKegiatan];

    // Langsung ubah tampilan status di tabel detik itu juga
    setDaftarKegiatan((prev) =>
      prev.map((item) =>
        item.id === kegiatan.id ? { ...item, status: newStatus } : item
      )
    );

    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://127.0.0.1:8000/api/proker/${kegiatan.id}`, {
        ...kegiatan,
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Tidak perlu fetchProkers() lagi karena tabel sudah otomatis update
    } catch (error) {
      console.error("Gagal mengubah status:", error);
      // Jika server error, kembalikan tampilan seperti semula (Rollback)
      setDaftarKegiatan(dataSebelumnya);
      alert("Terjadi kesalahan saat memvalidasi proker.");
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  // PERUBAHAN 4: Optimistic Update untuk Hapus Data
  const confirmDelete = async () => {
    if (deleteTargetId === null) return;
    
    const targetId = deleteTargetId;
    const dataSebelumnya = [...daftarKegiatan];

    // Langsung hapus baris dari tabel dan tutup modal detik itu juga
    setDaftarKegiatan((prev) => prev.filter((item) => item.id !== targetId));
    setIsDeleteModalOpen(false);
    setDeleteTargetId(null);

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://127.0.0.1:8000/api/proker/${targetId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Sukses! Tidak perlu fetchProkers() lagi
    } catch (error) {
      console.error("Gagal menghapus proker:", error);
      // Jika server gagal menghapus, kembalikan datanya ke tabel
      setDaftarKegiatan(dataSebelumnya);
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
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Menunggu Validasi";
      case "disetujui":
        return "Disetujui";
      case "ditolak":
        return "Ditolak";
      default:
        return status;
    }
  };

  const formatTanggal = (tanggal: string | null) => {
    if (!tanggal) return "-";
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(tanggal).toLocaleDateString('id-ID', options);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Manajemen Program Kerja
          </h1>
          <p className="text-gray-500 text-sm md:text-base mt-1">
            Kelola pengajuan dan pelaksanaan proker himpunan.
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm font-medium w-full sm:w-auto"
        >
          + Tambah Proker
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-600">No.</th>
                <th className="p-4 text-sm font-semibold text-gray-600">
                  Nama Kegiatan
                </th>
                <th className="p-4 text-sm font-semibold text-gray-600">
                  Divisi
                </th>
                <th className="p-4 text-sm font-semibold text-gray-600">
                  Tanggal
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
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                      <p>Memuat data program kerja...</p>
                    </div>
                  </td>
                </tr>
              ) : daftarKegiatan.length > 0 ? (
                daftarKegiatan.map((kegiatan, i) => (
                  <tr
                    key={kegiatan.id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="p-4 text-sm text-gray-700 font-medium">
                      {i + 1}
                    </td>
                    <td className="p-4 text-sm text-gray-800">
                      {kegiatan.nama_proker}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {kegiatan.divisi}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {formatTanggal(kegiatan.tanggal_pelaksanaan)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(kegiatan.status)}`}
                      >
                        {formatStatusText(kegiatan.status)}
                      </span>
                    </td>
                    <td className="p-4 flex justify-center gap-2">
                      {kegiatan.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleStatusChange(kegiatan, 'disetujui')}
                            className="text-green-700 bg-green-100 hover:bg-green-200 text-xs font-bold px-2 py-1 rounded-md transition"
                            title="Setujui Proker"
                          >
                            ACC
                          </button>
                          <button 
                            onClick={() => handleStatusChange(kegiatan, 'ditolak')}
                            className="text-orange-700 bg-orange-100 hover:bg-orange-200 text-xs font-bold px-2 py-1 rounded-md transition"
                            title="Tolak Proker"
                          >
                            TOLAK
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => handleEditClick(kegiatan)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(kegiatan.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500">
                    Belum ada data program kerja.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH / EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-[95%] sm:w-full max-w-md p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {isEditMode ? "Edit Program Kerja" : "Tambah Program Kerja"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Proker <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-base sm:text-sm"
                  value={formData.nama_proker}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_proker: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kementerian <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-base sm:text-sm"
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
                  Deskripsi Kegiatan
                </label>
                <textarea
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-base sm:text-sm"
                  value={formData.deskripsi}
                  onChange={(e) =>
                    setFormData({ ...formData, deskripsi: e.target.value })
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
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-base sm:text-sm"
                  value={formData.tanggal_pelaksanaan}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tanggal_pelaksanaan: e.target.value,
                    })
                  }
                />
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
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-sm sm:text-base disabled:bg-blue-300"
                >
                  {isLoading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
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
              Hapus Program Kerja?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Apakah kamu yakin ingin menghapus data proker ini? Data yang sudah
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
                // Hapus efek isLoading di tombol karena modal akan langsung tertutup
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium w-full flex justify-center items-center text-sm sm:text-base"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Proker;