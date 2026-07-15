import { useState, useEffect } from "react";
import axios from "axios";

interface KAKData {
  id: number;
  nama_kegiatan: string;
  divisi: string;
  link_drive: string | null;
  status: string;
  tipe_pengajuan: 'kak' | 'lpj';
  catatan_revisi?: string | null;
  latar_belakang?: string | null;
  tujuan?: string | null;
  sasaran?: string | null;
  tempat?: string | null;
  tanggal_pelaksanaan?: string | null;
  anggaran_estimasi?: number | null;
  penanggung_jawab?: string | null;
}

const PengajuanKAK = () => {
  const [daftarPengajuan, setDaftarPengajuan] = useState<KAKData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPengajuan, setSelectedPengajuan] = useState<KAKData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [activeTab, setActiveTab] = useState<'kak' | 'lpj'>('kak');

  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const [approvedProkers, setApprovedProkers] = useState<{id: number, nama_proker: string}[]>([]);

  const [isRevisiModalOpen, setIsRevisiModalOpen] = useState(false);
  const [revisiData, setRevisiData] = useState({ id: 0, status_baru: '', catatan: '' });

  // Role Management
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userRole = user?.role || "";
  
  const isSekretaris = userRole.toLowerCase().includes("sekretaris");
  const isMenteri = userRole.toLowerCase().includes("menteri");
  const isStaff = userRole.toLowerCase().includes("staff") || userRole.toLowerCase().includes("staf");
  const isBPH = ["presiden", "wakil", "bendahara", "sekretaris"].some(keyword => userRole.toLowerCase().includes(keyword));
  
  const userDivisi = userRole.split(' ').slice(1).join(' ');

  const [formData, setFormData] = useState<{
    nama_kegiatan: string;
    divisi: string;
    link_drive: string;
    tipe_pengajuan: 'kak' | 'lpj';
  }>({
    nama_kegiatan: "",
    divisi: userDivisi || "",
    link_drive: "",
    tipe_pengajuan: 'kak',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (silent = false) => {
    if (!silent) setIsFetching(true);
    const token = localStorage.getItem("token");

    try {
      // 1. Fetch Proker secara terpisah agar tidak terblokir jika route KAK belum ada
      try {
        const prokerResponse = await axios.get("http://127.0.0.1:8000/api/proker", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const approved = prokerResponse.data.filter((p: any) => {
          const pStatus = p.status ? p.status.toLowerCase().trim() : "";
          const isApproved = pStatus === "disetujui" || pStatus === "acc";
          
          // Cek kembali isBPH karena letaknya di scope luar
          const bphCheck = ["presiden", "wakil", "bendahara", "sekretaris"].some(keyword => userRole.toLowerCase().includes(keyword));
          
          const pDivisi = p.divisi ? p.divisi.toLowerCase().trim() : "";
          const uDivisi = userDivisi ? userDivisi.toLowerCase().trim() : "";
          const isOwn = bphCheck || pDivisi === uDivisi || pDivisi.includes(uDivisi) || uDivisi.includes(pDivisi);
          
          return isApproved && isOwn;
        });
        setApprovedProkers(approved);
      } catch (error) {
        console.error("Gagal mengambil data proker:", error);
      }

      // 2. Fetch Pengajuan KAK
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/kak", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDaftarPengajuan(response.data);
      } catch (error) {
        console.error("Gagal mengambil data KAK:", error);
        // Jangan tampilkan alert error karena KAK API mungkin belum ada, set empty array saja.
        setDaftarPengajuan([]);
      }
    } finally {
      if (!silent) setIsFetching(false);
    }
  };

  const handleAddClick = (tipe: 'kak' | 'lpj') => {
    setFormData({
      nama_kegiatan: "",
      divisi: userDivisi || "",
      link_drive: "",
      tipe_pengajuan: tipe,
    });
    setIsEditMode(false);
    setEditId(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (item: KAKData) => {
    setFormData({
      nama_kegiatan: item.nama_kegiatan,
      divisi: item.divisi,
      link_drive: item.link_drive || "",
      tipe_pengajuan: item.tipe_pengajuan || 'kak',
    });
    setIsEditMode(true);
    setEditId(item.id);
    setIsModalOpen(true);
  };

  const handleDetailClick = (item: KAKData) => {
    setSelectedPengajuan(item);
    setIsDetailModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      
      // Jika form diedit, status otomatis kembali ke pending agar dicek ulang sekretaris
      const payload = {
        ...formData,
        status: isEditMode ? 'pending' : 'pending',
      };

      if (isEditMode && editId !== null) {
        await axios.put(`http://127.0.0.1:8000/api/kak/${editId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post("http://127.0.0.1:8000/api/kak", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setIsModalOpen(false);
      fetchData(true);
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
      alert("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsLoading(false);
    }
  };

  const openRevisiModal = (item: KAKData, status_baru: string) => {
    setRevisiData({ id: item.id, status_baru, catatan: item.catatan_revisi || '' });
    setIsRevisiModalOpen(true);
    setIsDetailModalOpen(false);
  };

  const submitRevisi = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const item = daftarPengajuan.find((p) => p.id === revisiData.id);
    if (!item) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://127.0.0.1:8000/api/kak/${item.id}`, {
        ...item,
        status: revisiData.status_baru,
        catatan_revisi: revisiData.catatan
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsRevisiModalOpen(false);
      fetchData(true);
    } catch (error) {
      console.error("Gagal mengirim revisi:", error);
      alert("Terjadi kesalahan saat mengubah status.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChangeFast = async (item: KAKData, newStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://127.0.0.1:8000/api/kak/${item.id}`, {
        ...item,
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData(true);
      setIsDetailModalOpen(false);
    } catch (error) {
      console.error("Gagal mengubah status:", error);
      alert("Terjadi kesalahan.");
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteTargetId === null) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://127.0.0.1:8000/api/kak/${deleteTargetId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsDeleteModalOpen(false);
      setDeleteTargetId(null);
      fetchData(true);
    } catch (error) {
      console.error("Gagal menghapus:", error);
      alert("Terjadi kesalahan saat menghapus data.");
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === "disetujui" || s === "acc") return "bg-green-100 text-green-800";
    if (s.includes("revisi")) return "bg-orange-100 text-orange-800";
    if (s === "ditolak") return "bg-red-100 text-red-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const formatStatusText = (status: string) => {
    const s = status.toLowerCase();
    if (s === "pending") return "Sedang di cek Sekretaris";
    if (s === "disetujui") return "ACC";
    if (s.startsWith("revisi ")) return `Revisi ${s.split(' ')[1]}`;
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Filter pengajuan berdasarkan role dan tab
  const filteredData = daftarPengajuan.filter((item) => {
    const matchTab = (item.tipe_pengajuan || 'kak') === activeTab;
    const matchRole = isBPH || item.divisi === userDivisi;
    
    // Sekretaris tidak perlu melihat pengajuan yang sedang direvisi (menunggu respon kementerian)
    if (isSekretaris && item.status.toLowerCase().startsWith('revisi')) {
      return false;
    }

    return matchTab && matchRole;
  });

  return (
    <div className="space-y-6 relative pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Pengajuan KAK & LPJ
          </h1>
          <p className="text-gray-500 text-sm md:text-base mt-1">
            Kelola dan pantau pengajuan KAK & LPJ Kegiatan BEM.
          </p>
        </div>
        
        {/* Tombol Ajukan Khusus Kementerian (Menteri / Staff) */}
        {(isMenteri || isStaff) && (
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => handleAddClick('kak')}
              className="flex-1 md:flex-none bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition shadow-sm font-medium"
            >
              + Ajukan KAK
            </button>
            <button
              onClick={() => handleAddClick('lpj')}
              className="flex-1 md:flex-none bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition shadow-sm font-medium"
            >
              + Ajukan LPJ
            </button>
          </div>
        )}
      </div>

      {/* TABS */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('kak')}
          className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors ${activeTab === 'kak' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          Daftar Pengajuan KAK
        </button>
        <button
          onClick={() => setActiveTab('lpj')}
          className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors ${activeTab === 'lpj' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          Daftar Pengajuan LPJ
        </button>
      </div>

      {/* Grid of Cards */}
      {isFetching ? (
        <div className="flex flex-col items-center justify-center p-12 text-gray-500 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-2"></div>
          <p>Memuat data pengajuan...</p>
        </div>
      ) : filteredData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((item) => {
            const isRevisi = item.status.toLowerCase().startsWith('revisi');
            const isOwnRevisi = isRevisi && (isMenteri || isStaff);

            return (
              <div 
                key={item.id} 
                onClick={() => handleDetailClick(item)}
                className={`rounded-xl shadow-sm border p-5 transition cursor-pointer flex flex-col h-full relative overflow-hidden ${
                  isOwnRevisi 
                    ? 'bg-orange-50 border-orange-400 hover:shadow-md' 
                    : 'bg-white border-gray-100 hover:shadow-md hover:border-orange-200'
                }`}
              >
                {isOwnRevisi && (
                  <div className="absolute top-0 right-0 w-full h-1 bg-orange-500"></div>
                )}
                
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${item.tipe_pengajuan === 'lpj' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
                    {item.tipe_pengajuan?.toUpperCase() || 'KAK'}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium text-center ${getStatusColor(item.status)}`}>
                    {formatStatusText(item.status)}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-800 line-clamp-2 mb-1">{item.nama_kegiatan}</h3>
                <p className="text-sm font-medium text-gray-500 mb-4">{item.divisi}</p>
                
                {isOwnRevisi && (
                  <div className="mb-4 bg-orange-100 text-orange-800 text-xs px-3 py-2 rounded-lg border border-orange-200 font-medium flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    Segera perbaiki dan kirim ulang!
                  </div>
                )}

                <div className="mt-auto pt-4 border-t border-gray-100/50 flex justify-between items-center">
                  <span className={`text-xs ${isOwnRevisi ? 'text-orange-600 font-medium' : 'text-gray-400'}`}>Klik untuk melihat detail</span>
                  <svg className={`w-5 h-5 ${isOwnRevisi ? 'text-orange-400' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-gray-400 bg-white rounded-xl border border-gray-100 shadow-sm">
          <svg className="w-16 h-16 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <p className="font-medium text-gray-600">Belum ada pengajuan {activeTab.toUpperCase()}.</p>
        </div>
      )}

      {/* MODAL TAMBAH / EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-[95%] sm:w-full max-w-lg p-5 sm:p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {isEditMode ? `Edit Pengajuan ${formData.tipe_pengajuan.toUpperCase()}` : `Ajukan ${formData.tipe_pengajuan.toUpperCase()} Baru`}
            </h2>

            {isEditMode && (
              <div className="mb-4 bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-sm text-yellow-800">
                Menyimpan form ini akan mengirim ulang pengajuan dan mengubah status menjadi <strong>Sedang di cek Sekretaris</strong>.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Kegiatan <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-base sm:text-sm"
                  value={formData.nama_kegiatan}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_kegiatan: e.target.value })
                  }
                >
                  <option value="" disabled>-- Pilih Kegiatan --</option>
                  {approvedProkers.map((proker) => (
                    <option key={proker.id} value={proker.nama_proker}>
                      {proker.nama_proker}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kementerian
                </label>
                <input
                  type="text"
                  readOnly
                  disabled
                  className="w-full p-2 border border-gray-300 bg-gray-100 rounded-lg text-gray-500 text-base sm:text-sm cursor-not-allowed"
                  value={formData.divisi}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Drive {formData.tipe_pengajuan.toUpperCase()} <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="Contoh: https://drive.google.com/..."
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-base sm:text-sm"
                  value={formData.link_drive}
                  onChange={(e) =>
                    setFormData({ ...formData, link_drive: e.target.value })
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
                  className="px-4 py-2 text-white bg-orange-500 hover:bg-orange-600 rounded-lg font-medium text-sm sm:text-base disabled:bg-orange-300"
                >
                  {isLoading ? "Menyimpan..." : "Simpan Pengajuan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETAIL KAK/LPJ */}
      {isDetailModalOpen && selectedPengajuan && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-[95%] sm:w-full max-w-lg p-5 sm:p-6 relative">
            <div className="flex justify-between items-start mb-4 pr-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Detail Pengajuan {selectedPengajuan.tipe_pengajuan?.toUpperCase() || 'KAK'}
                </h2>
                <p className="text-sm font-medium text-gray-500 mt-1">{selectedPengajuan.divisi}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedPengajuan.status)} text-center flex items-center h-fit mt-1`}
              >
                {formatStatusText(selectedPengajuan.status)}
              </span>
            </div>

            <div className="space-y-4">
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                <h3 className="text-sm text-gray-500 mb-1">Nama Kegiatan</h3>
                <p className="text-lg font-bold text-gray-800">{selectedPengajuan.nama_kegiatan}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Link Drive</p>
                <a href={selectedPengajuan.link_drive || "#"} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline break-all bg-blue-50 px-3 py-2 rounded-lg block border border-blue-100">
                  {selectedPengajuan.link_drive || "-"}
                </a>
              </div>

              {selectedPengajuan.catatan_revisi && (
                <div>
                  <p className="text-xs text-red-500 font-bold uppercase tracking-wide mb-1">Catatan Revisi dari Sekretaris</p>
                  <div className="text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-100 whitespace-pre-wrap">
                    {selectedPengajuan.catatan_revisi}
                  </div>
                </div>
              )}
            </div>

            {/* AKSI KHUSUS SEKRETARIS */}
            {isSekretaris && (
              <div className="mt-6 pt-4 border-t border-gray-100 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Tindakan Sekretaris</p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => {
                    let nextRevisiNum = 1;
                    if (selectedPengajuan.status.toLowerCase().startsWith('revisi ')) {
                      const currentNum = parseInt(selectedPengajuan.status.split(' ')[1]);
                      if (!isNaN(currentNum)) nextRevisiNum = currentNum + 1;
                    }
                    openRevisiModal(selectedPengajuan, `revisi ${nextRevisiNum}`);
                  }} className="bg-orange-100 text-orange-700 hover:bg-orange-200 py-2 rounded-lg text-sm font-bold transition">
                    {selectedPengajuan.status.toLowerCase().startsWith('revisi ') 
                      ? `Beri Revisi ${parseInt(selectedPengajuan.status.split(' ')[1]) + 1 || 2}` 
                      : 'Beri Revisi'}
                  </button>
                  <button onClick={() => handleStatusChangeFast(selectedPengajuan, 'disetujui')} className="bg-green-500 text-white hover:bg-green-600 py-2 rounded-lg text-sm font-bold transition shadow-sm">ACC Pengajuan</button>
                </div>
              </div>
            )}

            {/* AKSI KHUSUS PENGIRIM (Menteri/Staff) */}
            {(isMenteri || isStaff) && selectedPengajuan.divisi === userDivisi && (
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleEditClick(selectedPengajuan);
                  }}
                  className="px-4 py-2 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg font-bold text-sm transition shadow-sm border border-orange-200"
                >
                  {selectedPengajuan.status.toLowerCase().startsWith('revisi') ? "Perbaiki & Kirim Ulang" : "Edit KAK/LPJ"}
                </button>
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleDeleteClick(selectedPengajuan.id);
                  }}
                  className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium text-sm transition"
                >
                  Hapus
                </button>
              </div>
            )}

            {!isSekretaris && (!isMenteri && !isStaff) && (
              <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-sm transition"
                >
                  Tutup
                </button>
              </div>
            )}
            
            {/* Tutup tombol umum */}
            <div className="absolute top-4 right-4">
              <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 bg-gray-50 hover:bg-gray-100 rounded-full transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INPUT REVISI SEKRETARIS */}
      {isRevisiModalOpen && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-[95%] sm:w-full max-w-sm p-5 sm:p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Berikan {revisiData.status_baru.toUpperCase()}
            </h3>
            <form onSubmit={submitRevisi}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catatan Revisi <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Masukkan instruksi perbaikan untuk pengajuan ini..."
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-sm"
                  value={revisiData.catatan}
                  onChange={(e) => setRevisiData({...revisiData, catatan: e.target.value})}
                ></textarea>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRevisiModalOpen(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-sm transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-white bg-orange-500 hover:bg-orange-600 rounded-lg font-medium text-sm transition disabled:bg-orange-300"
                >
                  {isLoading ? 'Mengirim...' : 'Kirim Revisi'}
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
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Hapus Pengajuan?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Apakah kamu yakin ingin menghapus pengajuan ini? Data yang sudah dihapus tidak dapat dikembalikan.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteTargetId(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium w-full text-sm sm:text-base transition"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium w-full text-sm sm:text-base transition"
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

export default PengajuanKAK;
