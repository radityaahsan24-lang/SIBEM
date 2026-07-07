import { useState, useEffect } from "react";
import axios from "axios";

interface PresensiData {
  id: number;
  nama_anggota: string;
  divisi: string;
  kegiatan: string;
  tanggal: string;
  status: string; // "hadir" | "izin" | "alpha"
  keterangan: string | null;
}

const Presensi = () => {
  const [daftarPresensi, setDaftarPresensi] = useState<PresensiData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const [filterKegiatan, setFilterKegiatan] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [formData, setFormData] = useState({
    nama_anggota: "",
    divisi: "",
    kegiatan: "",
    tanggal: "",
    status: "hadir",
    keterangan: "",
  });

  useEffect(() => {
    fetchPresensi();
  }, []);

  const fetchPresensi = async (silent = false) => {
    if (!silent) setIsFetching(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://127.0.0.1:8000/api/presensi", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDaftarPresensi(response.data);
    } catch (error) {
      console.error("Gagal mengambil data presensi:", error);
    } finally {
      if (!silent) setIsFetching(false);
    }
  };

  const handleAddClick = () => {
    setFormData({
      nama_anggota: "",
      divisi: "",
      kegiatan: "",
      tanggal: "",
      status: "hadir",
      keterangan: "",
    });
    setIsEditMode(false);
    setEditId(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (presensi: PresensiData) => {
    setFormData({
      nama_anggota: presensi.nama_anggota,
      divisi: presensi.divisi,
      kegiatan: presensi.kegiatan,
      tanggal: presensi.tanggal,
      status: presensi.status,
      keterangan: presensi.keterangan || "",
    });
    setIsEditMode(true);
    setEditId(presensi.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (isEditMode && editId !== null) {
        await axios.put(
          `http://127.0.0.1:8000/api/presensi/${editId}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post("http://127.0.0.1:8000/api/presensi", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setIsModalOpen(false);
      fetchPresensi(true);
    } catch (error) {
      console.error("Gagal menyimpan presensi:", error);
      alert("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (presensi: PresensiData, newStatus: string) => {
    const dataSebelumnya = [...daftarPresensi];

    setDaftarPresensi((prev) =>
      prev.map((item) =>
        item.id === presensi.id ? { ...item, status: newStatus } : item
      )
    );

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://127.0.0.1:8000/api/presensi/${presensi.id}`,
        { ...presensi, status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Gagal mengubah status:", error);
      setDaftarPresensi(dataSebelumnya);
      alert("Terjadi kesalahan saat mengubah status presensi.");
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteTargetId === null) return;

    const targetId = deleteTargetId;
    const dataSebelumnya = [...daftarPresensi];

    setDaftarPresensi((prev) => prev.filter((item) => item.id !== targetId));
    setIsDeleteModalOpen(false);
    setDeleteTargetId(null);

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://127.0.0.1:8000/api/presensi/${targetId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Gagal menghapus presensi:", error);
      setDaftarPresensi(dataSebelumnya);
      alert("Terjadi kesalahan saat menghapus data.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "hadir":
        return "bg-green-100 text-green-800";
      case "izin":
        return "bg-yellow-100 text-yellow-800";
      case "alpha":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatusText = (status: string) => {
    switch (status) {
      case "hadir":
        return "Hadir";
      case "izin":
        return "Izin";
      case "alpha":
        return "Alpha";
      default:
        return status;
    }
  };

  const formatTanggal = (tanggal: string | null) => {
    if (!tanggal) return "-";
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return new Date(tanggal).toLocaleDateString("id-ID", options);
  };

  const daftarTerfilter = daftarPresensi.filter((item) => {
    const cocokKegiatan = filterKegiatan
      ? item.kegiatan.toLowerCase().includes(filterKegiatan.toLowerCase())
      : true;
    const cocokStatus = filterStatus ? item.status === filterStatus : true;
    return cocokKegiatan && cocokStatus;
  });

  const totalHadir = daftarTerfilter.filter((i) => i.status === "hadir").length;
  const totalIzin = daftarTerfilter.filter((i) => i.status === "izin").length;
  const totalAlpha = daftarTerfilter.filter((i) => i.status === "alpha").length;

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Manajemen Presensi
          </h1>
          <p className="text-gray-500 text-sm md:text-base mt-1">
            Catat dan pantau kehadiran anggota pada setiap kegiatan.
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm font-medium w-full sm:w-auto"
        >
          + Tambah Presensi
        </button>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{totalHadir}</p>
          <p className="text-sm text-green-600 mt-1">Hadir</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-700">{totalIzin}</p>
          <p className="text-sm text-yellow-600 mt-1">Izin</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-700">{totalAlpha}</p>
          <p className="text-sm text-red-600 mt-1">Alpha</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Cari nama kegiatan..."
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
          value={filterKegiatan}
          onChange={(e) => setFilterKegiatan(e.target.value)}
        />
        <select
          className="sm:w-48 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Semua Status</option>
          <option value="hadir">Hadir</option>
          <option value="izin">Izin</option>
          <option value="alpha">Alpha</option>
        </select>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-600">No.</th>
                <th className="p-4 text-sm font-semibold text-gray-600">
                  Nama Anggota
                </th>
                <th className="p-4 text-sm font-semibold text-gray-600">
                  Divisi
                </th>
                <th className="p-4 text-sm font-semibold text-gray-600">
                  Kegiatan
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
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                      <p>Memuat data presensi...</p>
                    </div>
                  </td>
                </tr>
              ) : daftarTerfilter.length > 0 ? (
                daftarTerfilter.map((presensi, i) => (
                  <tr
                    key={presensi.id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="p-4 text-sm text-gray-700 font-medium">
                      {i + 1}
                    </td>
                    <td className="p-4 text-sm text-gray-800">
                      {presensi.nama_anggota}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {presensi.divisi}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {presensi.kegiatan}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {formatTanggal(presensi.tanggal)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(presensi.status)}`}
                      >
                        {formatStatusText(presensi.status)}
                      </span>
                    </td>
                    <td className="p-4 flex justify-center gap-2">
                      {presensi.status === "alpha" && (
                        <button
                          onClick={() => handleStatusChange(presensi, "izin")}
                          className="text-yellow-700 bg-yellow-100 hover:bg-yellow-200 text-xs font-bold px-2 py-1 rounded-md transition"
                          title="Ubah ke Izin"
                        >
                          IZIN
                        </button>
                      )}
                      {presensi.status !== "hadir" && (
                        <button
                          onClick={() => handleStatusChange(presensi, "hadir")}
                          className="text-green-700 bg-green-100 hover:bg-green-200 text-xs font-bold px-2 py-1 rounded-md transition"
                          title="Tandai Hadir"
                        >
                          HADIR
                        </button>
                      )}
                      <button
                        onClick={() => handleEditClick(presensi)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(presensi.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">
                    {filterKegiatan || filterStatus
                      ? "Tidak ada data yang cocok dengan filter."
                      : "Belum ada data presensi."}
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
              {isEditMode ? "Edit Presensi" : "Tambah Presensi"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Anggota <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-base sm:text-sm"
                  value={formData.nama_anggota}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_anggota: e.target.value })
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
                  Nama Kegiatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-base sm:text-sm"
                  value={formData.kegiatan}
                  onChange={(e) =>
                    setFormData({ ...formData, kegiatan: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-base sm:text-sm"
                  value={formData.tanggal}
                  onChange={(e) =>
                    setFormData({ ...formData, tanggal: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status Kehadiran <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-base sm:text-sm"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="hadir">Hadir</option>
                  <option value="izin">Izin</option>
                  <option value="alpha">Alpha</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keterangan
                </label>
                <textarea
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-base sm:text-sm"
                  placeholder="Opsional — isi alasan izin atau catatan lainnya"
                  value={formData.keterangan}
                  onChange={(e) =>
                    setFormData({ ...formData, keterangan: e.target.value })
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
              Hapus Data Presensi?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Apakah kamu yakin ingin menghapus data presensi ini? Data yang
              sudah dihapus tidak dapat dikembalikan.
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
    </div>
  );
};

export default Presensi;
