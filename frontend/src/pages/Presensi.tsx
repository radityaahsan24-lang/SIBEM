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

export default function Presensi() {
  const [daftarSesi, setDaftarSesi] = useState<SesiPresensi[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    nama_kegiatan: "",
    tingkatan: "Komunal",
    kementerian: "",
    tanggal: "",
    waktu_mulai: "",
    batas_waktu: "",
  });

  const [visibleCodes, setVisibleCodes] = useState<{ [key: number]: boolean }>({});

  const fetchSesiPresensi = async () => {
    setIsPageLoading(true);
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/sesi-presensi", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setDaftarSesi(response.data.data || []);
    } catch (error) {
      console.error("Gagal mengambil data sesi presensi:", error);
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
    setVisibleCodes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormLoading(true);
    setMessage("");

    const payload = {
      ...formData,
      kementerian: formData.tingkatan === "Kementerian" ? formData.kementerian : null,
    };

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/sesi-presensi", payload, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (response.status === 200 || response.status === 201) {
        setMessage(`✅ Sesi berhasil dibuat! Kode: ${response.data.kode_presensi}`);
        
        setFormData({ 
          nama_kegiatan: "", 
          tingkatan: "Komunal", 
          kementerian: "", 
          tanggal: "", 
          waktu_mulai: "", 
          batas_waktu: "" 
        });
        fetchSesiPresensi();
        
        setTimeout(() => {
          setIsModalOpen(false);
          setMessage("");
        }, 2000);
      }
    } catch (error: any) {
      setMessage(`❌ Gagal: ${error.response?.data?.message || "Terjadi kesalahan sistem."}`);
    } finally {
      setIsFormLoading(false);
    }
  };

  const openModal = () => {
    setMessage("");
    setFormData({ 
      nama_kegiatan: "", 
      tingkatan: "Komunal", 
      kementerian: "", 
      tanggal: "", 
      waktu_mulai: "", 
      batas_waktu: "" 
    });
    setIsModalOpen(true);
  };

  // --- STYLING KHUSUS FORM (Modern & Clean) ---
  const inputWrapper = "relative flex items-center";
  const iconStyle = "absolute left-3.5 text-gray-400 pointer-events-none w-5 h-5";
  // Menghilangkan outline bawaan dan menggantinya dengan ring kustom Tailwind
  const inputClass = "w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 transition-all duration-200 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 hover:border-gray-300 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100";
  // Khusus Select agar panah bawaannya hilang dan diganti ikon kustom
  const selectClass = `${inputClass} appearance-none pr-10`;

  return (
    <div className="p-8 font-sans text-gray-800">
      
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manajemen Presensi</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Kelola pembuatan sesi presensi dan bagikan kode unik ke anggota.</p>
        </div>
        
        <button 
          onClick={openModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2 text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Buat Presensi
        </button>
      </div>

      {/* ================= TABEL SESI PRESENSI ================= */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-sm bg-gray-50/50">
                <th className="p-4 font-semibold w-16 text-center">No.</th>
                <th className="p-4 font-semibold">Nama Kegiatan</th>
                <th className="p-4 font-semibold">Tingkatan</th>
                <th className="p-4 font-semibold">Jadwal (WIB)</th>
                <th className="p-4 font-semibold text-center">Kode Presensi</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isPageLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 font-medium">Memuat data sesi...</td>
                </tr>
              ) : daftarSesi.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500 font-medium">Belum ada sesi presensi yang dibuat.</td>
                </tr>
              ) : (
                daftarSesi.map((sesi, index) => (
                  <tr key={sesi.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 text-gray-500 text-center text-sm font-medium">{index + 1}</td>
                    <td className="p-4 text-gray-800 font-semibold text-sm">{sesi.nama_kegiatan}</td>
                    <td className="p-4 text-gray-600 text-sm font-medium">
                      {sesi.tingkatan} {sesi.kementerian ? `(${sesi.kementerian})` : ""}
                    </td>
                    
                    <td className="p-4 text-sm">
                      <div className="text-gray-800 font-semibold mb-1">{sesi.tanggal}</div>
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-md text-xs font-bold text-gray-600 border border-gray-200/60">
                        <span className="text-blue-600">{sesi.waktu_mulai}</span> 
                        <span className="text-gray-400">-</span> 
                        <span className="text-red-500">{sesi.batas_waktu}</span>
                      </div>
                    </td>
                    
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`font-mono font-bold tracking-widest px-3 py-1 bg-gray-100 border border-gray-200/60 rounded-lg text-sm transition-all ${visibleCodes[sesi.id] ? "text-gray-800" : "text-transparent bg-gray-200/50 select-none"}`}>
                          {visibleCodes[sesi.id] ? sesi.kode_presensi : "••••••"}
                        </span>
                        <button 
                          onClick={() => toggleCodeVisibility(sesi.id)}
                          className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded-md hover:bg-blue-50"
                          title="Lihat Kode"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${sesi.is_active ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                        {sesi.is_active ? "Aktif" : "Ditutup"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-semibold transition-colors">
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL BUAT SESI PRESENSI ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-all">
          <div className="bg-white p-6 sm:p-8 rounded-[24px] shadow-2xl w-full max-w-md relative animate-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200 rounded-full p-2 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            <div className="mb-6 pr-8">
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Buat Sesi Baru</h2>
              <p className="text-gray-500 text-sm mt-1 font-medium">Sistem akan men-generate kode unik presensi.</p>
            </div>

            {message && (
              <div className={`p-4 mb-5 rounded-xl text-sm font-bold border ${message.includes("✅") ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Input Nama Kegiatan */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Nama Kegiatan</label>
                <div className={inputWrapper}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={iconStyle}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <input
                    type="text" name="nama_kegiatan" value={formData.nama_kegiatan} onChange={handleChange} required
                    className={inputClass} placeholder="Contoh: Rapat Koordinasi"
                  />
                </div>
              </div>

              {/* Input Tanggal */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Tanggal Kegiatan</label>
                <div className={inputWrapper}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={iconStyle}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  <input
                    type="date" name="tanggal" value={formData.tanggal} onChange={handleChange} required
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Waktu Mulai & Akhir */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Waktu Mulai</label>
                  <div className={inputWrapper}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={iconStyle}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <input
                      type="time" name="waktu_mulai" value={formData.waktu_mulai} onChange={handleChange} required
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="pt-6 text-gray-400 font-bold px-1">-</div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Batas Akhir</label>
                  <div className={inputWrapper}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={iconStyle}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <input
                      type="time" name="batas_waktu" value={formData.batas_waktu} onChange={handleChange} required
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Input Tingkatan */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Tingkatan</label>
                <div className={inputWrapper}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={iconStyle}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                  <select name="tingkatan" value={formData.tingkatan} onChange={handleChange} required className={selectClass}>
                    <option value="Komunal">Komunal (Seluruh Anggota)</option>
                    <option value="BPH">BPH (Badan Pengurus Harian)</option>
                    <option value="Kementerian">Kementerian Spesifik</option>
                  </select>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="absolute right-3.5 w-4 h-4 text-gray-400 pointer-events-none">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>

              {/* Input Kementerian */}
              {formData.tingkatan === "Kementerian" && (
                <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Pilih Kementerian</label>
                  <div className={inputWrapper}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={iconStyle}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                    </svg>
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
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="absolute right-3.5 w-4 h-4 text-gray-400 pointer-events-none">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>
              )}

              <button
                type="submit" disabled={isFormLoading}
                className={`w-full py-3.5 mt-2 rounded-xl text-white font-bold text-sm transition-all shadow-sm ${
                  isFormLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 active:scale-[0.98]"
                }`}
              >
                {isFormLoading ? "Memproses..." : "Generate Kode Presensi"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}