import { useState, useEffect } from "react";
import axios from "axios";

interface SesiPresensi {
  id: number;
  nama_kegiatan: string;
  tingkatan: string;
  kementerian: string | null;
  kode_presensi: string;
  tanggal: string;
  waktu_mulai: string;
  batas_waktu: string;
  created_at: string;
  is_active: boolean;
  user_has_attended?: boolean;
}

interface PesertaSesi {
  user_id: number;
  name: string;
  role: string;
  status: string;
  bukti_izin?: string;
}

export default function Presensi() {
  const [daftarSesi, setDaftarSesi] = useState<SesiPresensi[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  
  // State Mode Tampilan & Riwayat Detail
  const [viewMode, setViewMode] = useState<"aktif" | "riwayat">("aktif");
  const [selectedHistorySesi, setSelectedHistorySesi] = useState<SesiPresensi | null>(null);

  // Modals State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false); // Untuk Daftar Hadir (Aktif)
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);   
  
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedSesi, setSelectedSesi] = useState<SesiPresensi | null>(null);

  const [isFormLoading, setIsFormLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    nama_kegiatan: "", tingkatan: "Komunal", kementerian: "", tanggal: "", waktu_mulai: "", batas_waktu: "",
  });

  const [daftarPeserta, setDaftarPeserta] = useState<PesertaSesi[]>([]);
  const [isLoadingPeserta, setIsLoadingPeserta] = useState(false);
  const [statusHadir, setStatusHadir] = useState<{ [key: number]: string }>({});
  
  const [inputKode, setInputKode] = useState(""); 
  const [inputStatus, setInputStatus] = useState("Hadir");
  const [inputLinkIzin, setInputLinkIzin] = useState("");

  const getToken = () => localStorage.getItem("token");

  // ================= ROLE BASED ACCESS CONTROL =================
  const currentUserRole = localStorage.getItem("role")?.toLowerCase() || "";
  const bphRoles = ["admin", "presiden bem", "wakil presiden bem", "sekretaris", "sekretaris 1", "sekretaris 2", "bendahara", "bendahara 1", "bendahara 2"];
  const isBPH = bphRoles.includes(currentUserRole);

  const fetchSesiPresensi = async () => {
    setIsPageLoading(true);
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/sesi-presensi", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setDaftarSesi(res.data.data || []);
    } catch (error) {
      console.error("Gagal mengambil sesi:", error);
    } finally {
      setIsPageLoading(false);
    }
  };

  useEffect(() => {
    fetchSesiPresensi();
  }, []);

  const isSessionExpired = (sesi: SesiPresensi) => {
    if (!sesi.is_active) return true;
    const batasWaktuSesi = new Date(`${sesi.tanggal}T${sesi.batas_waktu}`);
    return new Date() > batasWaktuSesi;
  };

  const filteredSesi = daftarSesi.filter((sesi) => {
    const expired = isSessionExpired(sesi);
    return viewMode === "aktif" ? !expired : expired;
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormLoading(true);
    setMessage("");

    const payload = { ...formData, kementerian: formData.tingkatan === "Kementerian" ? formData.kementerian : null };

    try {
      const headers = { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` };
      let response;
      if (modalMode === "create") {
        response = await axios.post("http://127.0.0.1:8000/api/sesi-presensi", payload, { headers });
      } else {
        response = await axios.put(`http://127.0.0.1:8000/api/sesi-presensi/${selectedSesi?.id}`, payload, { headers });
      }

      if (response.status === 200 || response.status === 201) {
        setMessage(modalMode === "create" ? `✅ Sesi berhasil dibuat!` : "✅ Sesi berhasil diperbarui!");
        fetchSesiPresensi();
        setTimeout(() => { setIsFormModalOpen(false); setMessage(""); }, 1500);
      }
    } catch (error: any) {
      setMessage(`❌ Gagal: ${error.response?.data?.message || "Terjadi kesalahan sistem."}`);
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSesi) return;
    setIsFormLoading(true);
    try {
      await axios.delete(`http://127.0.0.1:8000/api/sesi-presensi/${selectedSesi.id}`, { headers: { Authorization: `Bearer ${getToken()}` }});
      fetchSesiPresensi();
      setIsDeleteModalOpen(false);
      setSelectedHistorySesi(null); // Tutup detail jika dihapus
    } catch (error) {
      alert("Gagal menghapus sesi presensi.");
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleInputKodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSesi) return;
    setIsFormLoading(true);
    setMessage("");

    try {
      const payload = {
        status: inputStatus,
        ...(inputStatus === "Hadir" && { kode_presensi: inputKode }),
        ...(inputStatus === "Izin" && { bukti_izin: inputLinkIzin })
      };

      const res = await axios.post(`http://127.0.0.1:8000/api/sesi-presensi/${selectedSesi.id}/hadir`, payload, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }
      });
      
      setMessage(`✅ ${res.data.message}`);
      setDaftarSesi(prev => prev.map(s => s.id === selectedSesi.id ? { ...s, user_has_attended: true } : s));
      setTimeout(() => { 
        setIsInputModalOpen(false); setInputKode(""); setInputStatus("Hadir"); setInputLinkIzin(""); setMessage(""); 
      }, 1500);
    } catch (error: any) {
      setMessage(`❌ ${error.response?.data?.message || "Terjadi kesalahan saat memproses kode."}`);
    } finally {
      setIsFormLoading(false);
    }
  };

  const openActionModal = async (sesi: SesiPresensi) => {
    setSelectedSesi(sesi);
    setIsActionModalOpen(true);
    setIsLoadingPeserta(true);
    setMessage("");

    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/sesi-presensi/${sesi.id}/peserta`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      const peserta: PesertaSesi[] = res.data.data;
      setDaftarPeserta(peserta);

      const initialStatus: { [key: number]: string } = {};
      peserta.forEach(p => { initialStatus[p.user_id] = p.status; });
      setStatusHadir(initialStatus);
    } catch (error) {
      console.error("Gagal mengambil peserta:", error);
    } finally {
      setIsLoadingPeserta(false);
    }
  };

  // Fungsi khusus buka History Page View
  const openHistoryDetail = async (sesi: SesiPresensi) => {
    setSelectedHistorySesi(sesi);
    setIsLoadingPeserta(true);
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/sesi-presensi/${sesi.id}/peserta`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setDaftarPeserta(res.data.data);
    } catch (error) {
      console.error("Gagal mengambil history peserta:", error);
    } finally {
      setIsLoadingPeserta(false);
    }
  };

  const simpanKehadiran = async () => {
    if (!selectedSesi) return;
    setIsFormLoading(true);
    setMessage("");
    
    const payload = {
      kehadiran: Object.keys(statusHadir).map(userId => ({
        user_id: parseInt(userId),
        status: statusHadir[parseInt(userId)]
      }))
    };

    try {
      await axios.post(`http://127.0.0.1:8000/api/sesi-presensi/${selectedSesi.id}/peserta`, payload, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }
      });
      setMessage("✅ Daftar hadir berhasil disimpan!");
      setTimeout(() => { setIsActionModalOpen(false); setMessage(""); }, 1500);
    } catch (error: any) {
      setMessage("❌ Gagal menyimpan daftar hadir.");
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleStatusChange = (userId: number, status: string) => {
    setStatusHadir(prev => ({ ...prev, [userId]: status }));
  };

  const inputWrapper = "relative flex items-center";
  const inputClass = "w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600";
  const selectClass = `${inputClass} appearance-none pr-10`;

  return (
    <div className="p-4 sm:p-8 font-sans text-gray-800">
      
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {viewMode === "aktif" ? "Presensi Berlangsung" : "Riwayat Presensi"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {viewMode === "aktif" ? "Sesi yang sedang aktif dan bisa dilakukan presensi." : "Arsip kegiatan dan rapat yang telah selesai."}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {isBPH && (
            <button 
              onClick={() => {
                setViewMode(viewMode === "aktif" ? "riwayat" : "aktif");
                setSelectedHistorySesi(null); // Reset page detail saat switch mode
              }} 
              className="flex-1 sm:flex-none bg-white text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-lg font-bold border border-gray-200 transition-all text-sm flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {viewMode === "aktif" ? (
                <><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Lihat Riwayat</>
              ) : (
                <><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg> Kembali</>
              )}
            </button>
          )}

          {isBPH && viewMode === "aktif" && (
            <button onClick={() => { setModalMode("create"); setMessage(""); setFormData({ nama_kegiatan: "", tingkatan: "Komunal", kementerian: "", tanggal: "", waktu_mulai: "", batas_waktu: "" }); setIsFormModalOpen(true); }} className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm text-sm whitespace-nowrap">
              Buat Presensi
            </button>
          )}
        </div>
      </div>

      {/* ================= PAGE RENDERER ================= */}
      {viewMode === "riwayat" && selectedHistorySesi ? (
        // ----------------- TAMPILAN DETAIL PAGE RIWAYAT -----------------
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button 
            onClick={() => setSelectedHistorySesi(null)}
            className="text-sm font-bold text-gray-400 hover:text-blue-600 mb-6 flex items-center gap-2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            Kembali ke Daftar Riwayat
          </button>
          
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-6">
            <div>
              <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1.5">Hasil Rekapitulasi Kehadiran</h2>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">{selectedHistorySesi.nama_kegiatan}</h1>
              <p className="text-gray-500 font-medium text-sm mt-1">{selectedHistorySesi.tanggal} | {selectedHistorySesi.waktu_mulai.substring(0, 5)} - {selectedHistorySesi.batas_waktu.substring(0, 5)} WIB</p>
            </div>
            
            {/* Tombol Delete di Detail Riwayat */}
            {isBPH && (
              <button onClick={() => { setSelectedSesi(selectedHistorySesi); setIsDeleteModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                Hapus Riwayat
              </button>
            )}
          </div>

          <div className="space-y-3">
            {isLoadingPeserta ? (
              <div className="text-center py-12 text-gray-400 font-medium">Memuat data anggota...</div>
            ) : daftarPeserta.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">Tidak ada data anggota terdaftar.</div>
            ) : (
              daftarPeserta.map((peserta) => (
                <div key={peserta.user_id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-gray-50 hover:bg-white rounded-xl border border-gray-100 shadow-sm transition-colors gap-4">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{peserta.name}</p>
                    <p className="text-xs font-semibold text-gray-500 mt-0.5">{peserta.role}</p>
                  </div>
                  
                  <div className="flex items-center flex-wrap gap-3">
                    {/* Badge Status */}
                    <span className={`px-4 py-1.5 rounded-lg text-xs font-bold border tracking-wide ${
                      peserta.status === 'Hadir' ? 'bg-green-100 text-green-700 border-green-300' :
                      peserta.status === 'Izin' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                      'bg-red-100 text-red-700 border-red-300'
                    }`}>
                      {peserta.status}
                    </span>

                    {/* Tombol Link Surat Izin */}
                    {peserta.status === 'Izin' && peserta.bukti_izin && (
                      <a 
                        href={peserta.bukti_izin} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs font-bold text-blue-600 hover:text-white hover:bg-blue-600 bg-white px-3 py-1.5 rounded-lg border border-blue-200 transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        Lihat Surat
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        // ----------------- TAMPILAN GRID CARDS (AKTIF & RIWAYAT) -----------------
        isPageLoading ? (
          <div className="text-center py-12 text-gray-400 font-medium">Memuat data sesi...</div>
        ) : filteredSesi.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 font-medium">
            {viewMode === "aktif" ? "Tidak ada sesi presensi yang sedang berlangsung." : "Belum ada riwayat presensi yang tersimpan."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredSesi.map((sesi) => {
              const isExpired = isSessionExpired(sesi);

              if (viewMode === "riwayat") {
                return (
                  <div key={sesi.id} className="relative group animate-in zoom-in-95 duration-300">
                    <div 
                      onClick={() => openHistoryDetail(sesi)} 
                      className="cursor-pointer bg-white border border-gray-100 rounded-[24px] shadow-sm hover:border-blue-300 hover:shadow-md p-5 flex flex-col transition-all opacity-95 h-full"
                    >
                      <div className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-[20px] text-[10px] font-bold bg-gray-100 text-gray-500 tracking-wider">SELESAI</div>
                      <h3 className="text-lg font-extrabold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors pr-12 leading-tight">{sesi.nama_kegiatan}</h3>
                      <p className="text-sm font-semibold text-gray-500 mb-6">{sesi.tingkatan} {sesi.kementerian ? `(${sesi.kementerian})` : ""}</p>
                      <div className="mt-auto flex items-center text-gray-400 text-xs font-bold uppercase tracking-wider bg-gray-50 w-fit px-3 py-1.5 rounded-lg border border-gray-100">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                        {sesi.tanggal}
                      </div>
                    </div>

                    {isBPH && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedSesi(sesi); setIsDeleteModalOpen(true); }}
                        className="absolute bottom-4 right-4 p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors z-10 opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Hapus Riwayat"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                      </button>
                    )}
                  </div>
                );
              }

              return (
                <div key={sesi.id} className="bg-white border border-gray-100 rounded-[24px] shadow-sm hover:shadow-md p-5 flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-300">
                  <div className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-[20px] text-[10px] font-bold bg-green-100 text-green-700 tracking-wider">AKTIF</div>
                  <div className="pr-16 mb-4">
                    <h3 className="text-lg font-extrabold text-gray-900 leading-tight">{sesi.nama_kegiatan}</h3>
                    <p className="text-sm font-semibold text-gray-500 mt-1">{sesi.tingkatan} {sesi.kementerian ? `(${sesi.kementerian})` : ""}</p>
                  </div>

                  <div className="space-y-4 mb-6 flex-1">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{sesi.tanggal}</p>
                        <p className="text-sm font-extrabold text-gray-800 mt-0.5">{sesi.waktu_mulai.substring(0, 5)} - {sesi.batas_waktu.substring(0, 5)} WIB</p>
                      </div>
                    </div>

                    {isBPH && (
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 text-center">KODE PRESENSI</p>
                        <div className="flex justify-center">
                          <span className="font-mono font-black tracking-[0.3em] px-6 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xl text-gray-900 shadow-inner select-all">
                            {sesi.kode_presensi}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* TOMBOL ACTIONS (Edit/Hapus/Daftar Hadir/Isi Presensi) */}
                  <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                    {isBPH ? (
                      <div className="flex gap-2">
                        <button onClick={() => { setModalMode("edit"); setSelectedSesi(sesi); setMessage(""); setFormData({ nama_kegiatan: sesi.nama_kegiatan, tingkatan: sesi.tingkatan, kementerian: sesi.kementerian || "", tanggal: sesi.tanggal, waktu_mulai: sesi.waktu_mulai.substring(0, 5), batas_waktu: sesi.batas_waktu.substring(0, 5) }); setIsFormModalOpen(true); }} className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-transparent hover:border-blue-100 transition-colors" title="Edit">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                        </button>
                        <button onClick={() => { setSelectedSesi(sesi); setIsDeleteModalOpen(true); }} className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100 transition-colors" title="Hapus">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                        </button>
                      </div>
                    ) : <div />}

                    <div className="flex gap-2 flex-1 justify-end flex-wrap">
                      {sesi.user_has_attended ? (
                         <div className="bg-green-50 text-green-700 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm border border-green-200 cursor-default whitespace-nowrap">
                           ✅ Sudah Presensi
                         </div>
                      ) : (
                        <button onClick={() => { setSelectedSesi(sesi); setIsInputModalOpen(true); setMessage(""); setInputKode(""); setInputStatus("Hadir"); setInputLinkIzin(""); }} className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm border border-blue-200 transition-colors whitespace-nowrap shadow-sm">
                          Isi Presensi
                        </button>
                      )}
                      
                      {isBPH && (
                        <button onClick={() => openActionModal(sesi)} className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm border border-transparent shadow-sm shadow-blue-500/30 transition-all active:scale-[0.98] whitespace-nowrap">
                          Daftar Hadir
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )
      )}

      {/* ================= MODAL INPUT KODE PRESENSI / IZIN (MANDIRI) ================= */}
      {isInputModalOpen && selectedSesi && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-[32px] shadow-2xl w-full max-w-sm relative text-center animate-in zoom-in-95 duration-200">
            <button onClick={() => setIsInputModalOpen(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors">✕</button>
            
            <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1.5">Presensi Kehadiran</h2>
            <h1 className="text-xl font-extrabold text-gray-900 mb-6 leading-tight">{selectedSesi.nama_kegiatan}</h1>

            {message && (
              <div className={`p-4 mb-5 rounded-xl text-sm font-bold border text-left ${message.includes("✅") ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>{message}</div>
            )}

            <form onSubmit={handleInputKodeSubmit}>
              <div className="grid grid-cols-2 gap-2 mb-6 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                {['Hadir', 'Izin'].map((status) => (
                  <button key={status} type="button" onClick={() => { setInputStatus(status); setInputLinkIzin(""); setInputKode(""); }} className={`py-2 rounded-xl text-sm font-bold transition-all ${inputStatus === status ? "bg-white shadow-sm border border-gray-200 text-blue-600" : "text-gray-500 hover:bg-gray-100"}`}>
                    {status}
                  </button>
                ))}
              </div>

              {inputStatus === "Izin" ? (
                <div className="mb-6 text-left animate-in fade-in slide-in-from-right-2 duration-300">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Link Bukti / Surat Izin (G-Drive dll)</label>
                  <input 
                    type="url" 
                    value={inputLinkIzin} 
                    onChange={(e) => setInputLinkIzin(e.target.value)} 
                    placeholder="https://..."
                    className="w-full text-sm font-medium py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all"
                    required
                  />
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                  <input 
                    type="text" 
                    value={inputKode} 
                    onChange={(e) => setInputKode(e.target.value.toUpperCase())} 
                    maxLength={6}
                    placeholder="Kode 6 Digit"
                    className="w-full text-center font-mono tracking-[0.3em] text-2xl font-black py-4 bg-gray-50 border border-gray-200 rounded-2xl mb-6 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 uppercase transition-all"
                    required
                  />
                </div>
              )}

              <button 
                type="submit" 
                disabled={isFormLoading || (inputStatus === "Hadir" && inputKode.length < 6) || (inputStatus === "Izin" && inputLinkIzin.length < 5)} 
                className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all shadow-sm bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 active:scale-[0.98] disabled:bg-blue-400 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {isFormLoading ? "Memproses..." : "Kirim Presensi"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL DAFTAR HADIR (ADMIN REKAP AKTIF) ================= */}
      {isActionModalOpen && selectedSesi && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-[32px] shadow-2xl w-full max-w-4xl relative max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <button onClick={() => setIsActionModalOpen(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors">✕</button>

            <div className="mb-6">
              <h2 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-1.5">Daftar Kehadiran Saat Ini</h2>
              <h1 className="text-2xl font-extrabold text-gray-900">{selectedSesi.nama_kegiatan}</h1>
            </div>

            {message && <div className={`p-4 mb-5 rounded-xl text-sm font-bold border ${message.includes("✅") ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>{message}</div>}

            <div className="overflow-y-auto flex-1 mb-6 border border-gray-100 rounded-2xl p-2 bg-gray-50">
              {isLoadingPeserta ? (
                <div className="text-center py-12 text-gray-400 font-medium">Memuat anggota...</div>
              ) : daftarPeserta.length === 0 ? (
                <div className="text-center py-12 text-gray-400 font-medium border-2 border-dashed border-gray-200 m-2 rounded-xl">Tidak ada anggota yang terdaftar.</div>
              ) : (
                <div className="space-y-2">
                  {daftarPeserta.map((peserta) => {
                    const isBelumPresensi = statusHadir[peserta.user_id] === 'Belum Presensi';
                    
                    return (
                    <div key={peserta.user_id} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white rounded-xl border shadow-sm gap-4 transition-all ${isBelumPresensi ? 'border-dashed border-gray-300 opacity-80 hover:opacity-100' : 'border-gray-100 hover:border-gray-200'}`}>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{peserta.name}</p>
                        <p className="text-xs font-semibold text-gray-500 mt-0.5">{peserta.role}</p>
                        {isBelumPresensi && <p className="text-[10px] text-orange-600 font-bold mt-1.5 bg-orange-50 border border-orange-100 inline-block px-2 py-0.5 rounded-md uppercase tracking-wider">Belum Ada Aksi</p>}
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex flex-wrap gap-2">
                          {['Hadir', 'Izin', 'Tidak Hadir'].map((status) => {
                            const isSelected = statusHadir[peserta.user_id] === status;
                            let activeColor = "";
                            if(status === 'Hadir') activeColor = "bg-green-100 text-green-700 border-green-300 shadow-sm";
                            if(status === 'Izin') activeColor = "bg-blue-100 text-blue-700 border-blue-300 shadow-sm";
                            if(status === 'Tidak Hadir') activeColor = "bg-red-100 text-red-700 border-red-300 shadow-sm";

                            return (
                              <button key={status} onClick={() => handleStatusChange(peserta.user_id, status)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${isSelected ? activeColor : "bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}>
                                {status}
                              </button>
                            )
                          })}
                        </div>
                        {/* Jika admin merubah ke Izin padahal aslinya tidak punya link, link tidak akan muncul disini (Admin rekap manual). Namun jika data Izin berasal dari user yang menginput link, link akan muncul. */}
                        {peserta.status === 'Izin' && peserta.bukti_izin && (
                          <a href={peserta.bukti_izin} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-blue-500 hover:text-blue-700 underline flex items-center gap-1">
                            Buka Bukti Izin <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                          </a>
                        )}
                      </div>
                    </div>
                  )})}
                </div>
              )}
            </div>

            <button onClick={simpanKehadiran} disabled={isFormLoading || isLoadingPeserta} className="w-full py-4 rounded-xl text-white font-bold text-sm transition-all shadow-sm bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 active:scale-[0.98] disabled:bg-blue-400 disabled:cursor-not-allowed">
              {isFormLoading ? "Menyimpan Data..." : "Simpan Daftar Hadir"}
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL FORM CREATE/EDIT ================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-[32px] shadow-2xl w-full max-w-md relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setIsFormModalOpen(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors">✕</button>
            <h2 className="text-xl font-extrabold text-gray-900">{modalMode === "create" ? "Buat Sesi Baru" : "Edit Sesi Presensi"}</h2>
            <p className="text-gray-500 text-sm mt-1 mb-6">{modalMode === "create" ? "Generate kode unik presensi." : "Perbarui detail informasi."}</p>

            {message && <div className={`p-4 mb-5 rounded-xl text-sm font-bold border ${message.includes("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{message}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Nama Kegiatan</label><div className={inputWrapper}><input type="text" name="nama_kegiatan" value={formData.nama_kegiatan} onChange={handleChange} required className={inputClass} placeholder="Contoh: Rapat Koordinasi" /></div></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Tanggal Kegiatan</label><div className={inputWrapper}><input type="date" name="tanggal" value={formData.tanggal} onChange={handleChange} required className={inputClass} /></div></div>
              <div className="flex items-center gap-3">
                <div className="flex-1"><label className="block text-sm font-bold text-gray-700 mb-1.5">Waktu Mulai</label><input type="time" name="waktu_mulai" value={formData.waktu_mulai} onChange={handleChange} required className={inputClass} /></div>
                <div className="flex-1"><label className="block text-sm font-bold text-gray-700 mb-1.5">Batas Akhir</label><input type="time" name="batas_waktu" value={formData.batas_waktu} onChange={handleChange} required className={inputClass} /></div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Tingkatan</label>
                <select name="tingkatan" value={formData.tingkatan} onChange={handleChange} required className={selectClass}>
                  <option value="Komunal">Komunal (Seluruh Anggota)</option><option value="BPH">BPH (Badan Pengurus Harian)</option><option value="Kementerian">Kementerian Spesifik</option>
                </select>
              </div>
              {formData.tingkatan === "Kementerian" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Pilih Kementerian</label>
                  <select name="kementerian" value={formData.kementerian} onChange={handleChange} required className={selectClass}>
                    <option value="" disabled>-- Pilih --</option><option value="Kastrat">Kastrat</option><option value="Risil">Risil</option><option value="Kominfo">Kominfo</option><option value="Sosmas">Sosmas</option><option value="PSDM">PSDM</option><option value="Dagri">Dagri</option><option value="Ekraf">Ekraf</option><option value="Advokesma">Advokesma</option>
                  </select>
                </div>
              )}
              <button type="submit" disabled={isFormLoading} className={`w-full py-3.5 mt-2 rounded-xl text-white font-bold text-sm transition-all ${isFormLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-600/20 active:scale-[0.98]"}`}>
                {isFormLoading ? "Memproses..." : (modalMode === "create" ? "Generate Kode Presensi" : "Simpan Perubahan")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL HAPUS ================= */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-[24px] shadow-2xl w-full max-w-sm text-center animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-extrabold text-gray-900 mb-2 mt-4">Hapus Sesi?</h2>
            <p className="text-gray-500 text-sm mb-6">Anda yakin ingin menghapus sesi <b>{selectedSesi?.nama_kegiatan}</b>?</p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">Batal</button>
              <button onClick={handleDelete} disabled={isFormLoading} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-sm shadow-red-600/20">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}