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
}

interface PesertaSesi {
  user_id: number;
  name: string;
  role: string;
  status: string;
}

export default function Presensi() {
  const [daftarSesi, setDaftarSesi] = useState<SesiPresensi[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  
  // Modals State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false); 
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);   
  
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedSesi, setSelectedSesi] = useState<SesiPresensi | null>(null);

  const [isFormLoading, setIsFormLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    nama_kegiatan: "", tingkatan: "Komunal", kementerian: "", tanggal: "", waktu_mulai: "", batas_waktu: "",
  });

  // Data Kehadiran & Kode Mandiri
  const [daftarPeserta, setDaftarPeserta] = useState<PesertaSesi[]>([]);
  const [isLoadingPeserta, setIsLoadingPeserta] = useState(false);
  const [statusHadir, setStatusHadir] = useState<{ [key: number]: string }>({});
  
  const [inputKode, setInputKode] = useState(""); 
  const [inputStatus, setInputStatus] = useState("Hadir"); // Status pilihan saat input kode mandiri
  const [visibleCodes, setVisibleCodes] = useState<{ [key: number]: boolean }>({});

  const getToken = () => localStorage.getItem("token");

  // ================= ROLE BASED ACCESS CONTROL (RBAC) =================
  // Mengambil role dari localStorage (Pastikan backend mengirim role saat login dan kamu menyimpannya)
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleCodeVisibility = (id: number) => {
    setVisibleCodes((prev) => ({ ...prev, [id]: !prev[id] }));
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
        setMessage(modalMode === "create" ? `✅ Sesi berhasil dibuat! Kode: ${response.data.kode_presensi}` : "✅ Sesi berhasil diperbarui!");
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
    } catch (error) {
      alert("Gagal menghapus sesi presensi.");
    } finally {
      setIsFormLoading(false);
    }
  };

  // --- SUBMIT KODE PRESENSI (Dengan Opsi Izin/Sakit) ---
  const handleInputKodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSesi) return;
    
    setIsFormLoading(true);
    setMessage("");

    try {
      const res = await axios.post(`http://127.0.0.1:8000/api/sesi-presensi/${selectedSesi.id}/hadir`, {
        kode_presensi: inputKode,
        status: inputStatus 
      }, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }
      });
      
      setMessage(`✅ ${res.data.message}`);
      setTimeout(() => { 
        setIsInputModalOpen(false); setInputKode(""); setInputStatus("Hadir"); setMessage(""); 
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
      peserta.forEach(p => {
        initialStatus[p.user_id] = p.status; 
      });
      setStatusHadir(initialStatus);
    } catch (error) {
      console.error("Gagal mengambil peserta:", error);
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

  // --- STYLING VARS ---
  const inputWrapper = "relative flex items-center";
  const inputClass = "w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600";
  const selectClass = `${inputClass} appearance-none pr-10`;

  return (
    <div className="p-4 sm:p-8 font-sans text-gray-800">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Presensi</h1>
          <p className="text-gray-500 text-sm mt-1">Sistem presensi rapat dan kegiatan organisasi.</p>
        </div>
        
        {/* HANYA BPH YANG BISA MELIHAT TOMBOL BUAT PRESENSI */}
        {isBPH && (
          <button onClick={() => { setModalMode("create"); setMessage(""); setFormData({ nama_kegiatan: "", tingkatan: "Komunal", kementerian: "", tanggal: "", waktu_mulai: "", batas_waktu: "" }); setIsFormModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm text-sm">
            Buat Presensi
          </button>
        )}
      </div>

      {/* GRID CARDS */}
      {isPageLoading ? (
        <div className="text-center py-12 text-gray-400">Memuat data sesi...</div>
      ) : daftarSesi.length === 0 ? (
        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">Belum ada sesi presensi yang dibuat.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {daftarSesi.map((sesi) => (
            <div key={sesi.id} className="bg-white border border-gray-100 rounded-[24px] shadow-sm hover:shadow-md p-5 flex flex-col relative overflow-hidden group">
              
              <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-[20px] text-xs font-bold ${sesi.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {sesi.is_active ? "AKTIF" : "DITUTUP"}
              </div>

              <div className="pr-16 mb-4">
                <h3 className="text-lg font-extrabold text-gray-900">{sesi.nama_kegiatan}</h3>
                <p className="text-sm font-semibold text-gray-500">{sesi.tingkatan} {sesi.kementerian ? `(${sesi.kementerian})` : ""}</p>
              </div>

              <div className="space-y-4 mb-6 flex-1">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">{sesi.tanggal}</p>
                    <p className="text-sm font-bold text-gray-800">{sesi.waktu_mulai.substring(0, 5)} - {sesi.batas_waktu.substring(0, 5)} WIB</p>
                  </div>
                </div>

                {/* HANYA BPH YANG BISA MELIHAT BLOK KODE PRESENSI */}
                {isBPH && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 text-center">KODE PRESENSI</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className={`font-mono font-bold tracking-[0.2em] px-4 py-2 bg-gray-100 border border-gray-200/60 rounded-xl text-lg ${visibleCodes[sesi.id] ? "text-gray-900" : "text-transparent bg-gray-200/50 select-none blur-[2px]"}`}>
                        {visibleCodes[sesi.id] ? sesi.kode_presensi : "XXXXXX"}
                      </span>
                      <button onClick={() => toggleCodeVisibility(sesi.id)} className="text-gray-400 hover:text-blue-600 p-2 rounded-xl hover:bg-blue-50">Lihat</button>
                    </div>
                  </div>
                )}
              </div>

              {/* CARD FOOTER - ACTIONS */}
              <div className="pt-4 border-t border-gray-100 flex flex-col lg:flex-row items-center justify-between gap-3">
                
                {/* HANYA BPH YANG BISA EDIT & HAPUS */}
                {isBPH ? (
                  <div className="flex gap-2 w-full lg:w-auto justify-start">
                    <button onClick={() => { setModalMode("edit"); setSelectedSesi(sesi); setMessage(""); setFormData({ nama_kegiatan: sesi.nama_kegiatan, tingkatan: sesi.tingkatan, kementerian: sesi.kementerian || "", tanggal: sesi.tanggal, waktu_mulai: sesi.waktu_mulai.substring(0, 5), batas_waktu: sesi.batas_waktu.substring(0, 5) }); setIsFormModalOpen(true); }} className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-transparent hover:border-blue-100 transition-colors" title="Edit">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                    </button>
                    <button onClick={() => { setSelectedSesi(sesi); setIsDeleteModalOpen(true); }} className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100 transition-colors" title="Hapus">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                    </button>
                  </div>
                ) : (
                  <div className="hidden lg:block w-auto"></div> // Placeholder layout agar rapi
                )}

                <div className="flex gap-2 w-full lg:w-auto">
                  {/* SEMUA ORANG BISA ISI PRESENSI */}
                  <button 
                    onClick={() => { setSelectedSesi(sesi); setIsInputModalOpen(true); setMessage(""); setInputKode(""); setInputStatus("Hadir"); }} 
                    className="flex-1 lg:flex-none bg-white text-blue-600 hover:bg-blue-50 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-center border border-blue-200 transition-colors"
                  >
                    Isi Presensi
                  </button>
                  
                  {/* HANYA BPH YANG BISA BUKA DAFTAR HADIR (REKAP) */}
                  {isBPH && (
                    <button 
                      onClick={() => openActionModal(sesi)} 
                      className="flex-1 lg:flex-none bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-center border border-blue-100 hover:border-blue-600 transition-colors"
                    >
                      Daftar Hadir
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ================= MODAL INPUT KODE PRESENSI (MANDIRI) ================= */}
      {isInputModalOpen && selectedSesi && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-[32px] shadow-2xl w-full max-w-sm relative text-center">
            <button onClick={() => setIsInputModalOpen(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-full p-2">✕</button>
            
            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-1">Presensi Kehadiran</h2>
            <h1 className="text-xl font-extrabold text-gray-900 mb-6">{selectedSesi.nama_kegiatan}</h1>

            {message && (
              <div className={`p-4 mb-5 rounded-xl text-sm font-bold border text-left ${message.includes("✅") ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>{message}</div>
            )}

            <form onSubmit={handleInputKodeSubmit}>
              {/* Pilihan Status Kehadiran (Hadir, Izin, Sakit) */}
              <div className="grid grid-cols-3 gap-2 mb-6 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                {['Hadir', 'Izin', 'Sakit'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setInputStatus(status)}
                    className={`py-2 rounded-xl text-sm font-bold transition-all ${inputStatus === status ? "bg-white shadow-sm border border-gray-200 text-blue-600" : "text-gray-500 hover:bg-gray-100"}`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <input 
                type="text" 
                value={inputKode} 
                onChange={(e) => setInputKode(e.target.value.toUpperCase())} 
                maxLength={6}
                placeholder="Kode 6 Digit"
                className="w-full text-center font-mono tracking-[0.3em] text-2xl font-bold py-4 bg-gray-50 border border-gray-200 rounded-2xl mb-6 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 uppercase"
                required
              />
              <button type="submit" disabled={isFormLoading || inputKode.length < 6} className={`w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all shadow-sm ${isFormLoading || inputKode.length < 6 ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 active:scale-[0.98]"}`}>
                {isFormLoading ? "Memproses..." : "Kirim Presensi"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL DAFTAR HADIR (ADMIN REKAP) ================= */}
      {isActionModalOpen && selectedSesi && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-[32px] shadow-2xl w-full max-w-4xl relative max-h-[90vh] flex flex-col">
            <button onClick={() => setIsActionModalOpen(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-full p-2">✕</button>

            <div className="mb-6">
              <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-1">Daftar Kehadiran</h2>
              <h1 className="text-2xl font-extrabold text-gray-900">{selectedSesi.nama_kegiatan}</h1>
            </div>

            {message && (
              <div className={`p-4 mb-5 rounded-xl text-sm font-bold border ${message.includes("✅") ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>{message}</div>
            )}

            <div className="overflow-y-auto flex-1 mb-6 border border-gray-100 rounded-2xl p-2 bg-gray-50">
              {isLoadingPeserta ? (
                <div className="text-center py-12 text-gray-400">Memuat anggota...</div>
              ) : daftarPeserta.length === 0 ? (
                <div className="text-center py-12 text-gray-400">Tidak ada anggota yang terdaftar.</div>
              ) : (
                <div className="space-y-2">
                  {daftarPeserta.map((peserta) => {
                    // Beri penanda visual jika statusnya masih Belum Presensi
                    const isBelumPresensi = statusHadir[peserta.user_id] === 'Belum Presensi';
                    
                    return (
                    <div key={peserta.user_id} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white rounded-xl border shadow-sm gap-4 ${isBelumPresensi ? 'border-dashed border-gray-300 opacity-70' : 'border-gray-100'}`}>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{peserta.name}</p>
                        <p className="text-xs font-semibold text-gray-500">{peserta.role}</p>
                        {isBelumPresensi && <p className="text-[10px] text-orange-500 font-bold mt-1 bg-orange-50 inline-block px-2 py-0.5 rounded">Belum Ada Aksi</p>}
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {['Hadir', 'Izin', 'Sakit', 'Alpa'].map((status) => {
                          const isSelected = statusHadir[peserta.user_id] === status;
                          let activeColor = "";
                          if(status === 'Hadir') activeColor = "bg-green-100 text-green-700 border-green-300";
                          if(status === 'Izin') activeColor = "bg-blue-100 text-blue-700 border-blue-300";
                          if(status === 'Sakit') activeColor = "bg-yellow-100 text-yellow-700 border-yellow-300";
                          if(status === 'Alpa') activeColor = "bg-red-100 text-red-700 border-red-300";

                          return (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(peserta.user_id, status)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${isSelected ? activeColor : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"}`}
                            >
                              {status}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )})}
                </div>
              )}
            </div>

            <button onClick={simpanKehadiran} disabled={isFormLoading || isLoadingPeserta} className={`w-full py-4 rounded-xl text-white font-bold text-sm transition-all shadow-sm ${isFormLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 active:scale-[0.98]"}`}>
              {isFormLoading ? "Menyimpan Data..." : "Simpan Daftar Hadir"}
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL CREATE/EDIT & HAPUS ADA DI SINI ================= */}
      {/* KODE INI SAMA PERSIS SEPERTI SEBELUMNYA, DIBIARKAN AGAR TIDAK HILANG */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-[32px] shadow-2xl w-full max-w-md relative">
            <button onClick={() => setIsFormModalOpen(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-full p-2">✕</button>
            <h2 className="text-xl font-extrabold text-gray-900">{modalMode === "create" ? "Buat Sesi Baru" : "Edit Sesi Presensi"}</h2>
            <p className="text-gray-500 text-sm mt-1 mb-6">{modalMode === "create" ? "Generate kode unik presensi." : "Perbarui detail informasi."}</p>

            {message && <div className={`p-4 mb-5 rounded-xl text-sm font-bold border ${message.includes("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{message}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Nama Kegiatan</label>
                <div className={inputWrapper}><input type="text" name="nama_kegiatan" value={formData.nama_kegiatan} onChange={handleChange} required className={inputClass} placeholder="Contoh: Rapat Koordinasi" /></div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Tanggal Kegiatan</label>
                <div className={inputWrapper}><input type="date" name="tanggal" value={formData.tanggal} onChange={handleChange} required className={inputClass} /></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1"><label className="block text-sm font-bold text-gray-700 mb-1.5">Waktu Mulai</label><input type="time" name="waktu_mulai" value={formData.waktu_mulai} onChange={handleChange} required className={inputClass} /></div>
                <div className="flex-1"><label className="block text-sm font-bold text-gray-700 mb-1.5">Batas Akhir</label><input type="time" name="batas_waktu" value={formData.batas_waktu} onChange={handleChange} required className={inputClass} /></div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Tingkatan</label>
                <select name="tingkatan" value={formData.tingkatan} onChange={handleChange} required className={selectClass}>
                  <option value="Komunal">Komunal (Seluruh Anggota)</option>
                  <option value="BPH">BPH (Badan Pengurus Harian)</option>
                  <option value="Kementerian">Kementerian Spesifik</option>
                </select>
              </div>
              {formData.tingkatan === "Kementerian" && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Pilih Kementerian</label>
                  <select name="kementerian" value={formData.kementerian} onChange={handleChange} required className={selectClass}>
                    <option value="" disabled>-- Pilih --</option>
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
              )}
              <button type="submit" disabled={isFormLoading} className={`w-full py-3.5 mt-2 rounded-xl text-white font-bold text-sm ${isFormLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}>
                {isFormLoading ? "Memproses..." : (modalMode === "create" ? "Generate Kode Presensi" : "Simpan Perubahan")}
              </button>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-[24px] shadow-2xl w-full max-w-sm text-center">
            <h2 className="text-xl font-extrabold text-gray-900 mb-2 mt-4">Hapus Sesi?</h2>
            <p className="text-gray-500 text-sm mb-6">Anda yakin ingin menghapus sesi <b>{selectedSesi?.nama_kegiatan}</b>?</p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold">Batal</button>
              <button onClick={handleDelete} disabled={isFormLoading} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}