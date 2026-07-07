import { useState, useEffect } from "react";

export default function AdminDashboard() {
  // ==========================================
  // STATE UNTUK DAFTAR USER (DASHBOARD)
  // ==========================================
  const [users, setUsers] = useState<any[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  
  // State untuk mengontrol Popup/Modal tampil atau tidak
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ==========================================
  // STATE UNTUK FORM TAMBAH PENGURUS (MODAL)
  // ==========================================
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [jabatan, setJabatan] = useState("Menteri");
  const [divisi, setDivisi] = useState("Kastrat");
  const [tingkat, setTingkat] = useState(""); 
  const [message, setMessage] = useState("");
  const [isFormLoading, setIsFormLoading] = useState(false);
  
  // State baru untuk toggle lihat/sembunyikan password
  const [showPassword, setShowPassword] = useState(false);

  // ==========================================
  // FUNGSI MENGAMBIL DATA (GET USERS)
  // ==========================================
  const fetchUsers = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/users", {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data user:", error);
    } finally {
      setIsPageLoading(false);
    }
  };

  // Panggil fetchUsers saat halaman pertama kali dibuka
  useEffect(() => {
    fetchUsers();
  }, []);

  // ==========================================
  // FUNGSI LOGOUT
  // ==========================================
  const handleLogout = () => {
    // Hapus token dari penyimpanan browser
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    // Arahkan kembali ke halaman login (sesuaikan path-nya jika berbeda)
    window.location.href = "/login";
  };

  // ==========================================
  // FUNGSI FORM (HANDLE INPUT & SUBMIT)
  // ==========================================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isPengurusInti = ["Presiden BEM", "Wakil Presiden BEM", "Bendahara", "Sekretaris"].includes(jabatan);
  const isBendumAtauSekre = ["Bendahara", "Sekretaris"].includes(jabatan);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password.length < 8) {
      setMessage("❌ Gagal: Password minimal harus 8 karakter.");
      return;
    }

    let finalRole = jabatan;
    if (isBendumAtauSekre && tingkat !== "") {
      finalRole = `${jabatan} ${tingkat}`;
    } else if (!isPengurusInti) {
      finalRole = `${jabatan} ${divisi}`;
    }

    setIsFormLoading(true);
    setMessage("");

    const payload = { ...formData, role: finalRole };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}` 
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ User berhasil didaftarkan sebagai ${finalRole}!`);
        // Reset form dan state mata
        setFormData({ name: "", email: "", password: "" });
        setJabatan("Menteri"); setDivisi("Kastrat"); setTingkat("");
        setShowPassword(false);
        
        // REFRESH TABEL SECARA OTOMATIS
        fetchUsers();
      } else {
        setMessage(`❌ Gagal: ${data.message || "Cek kembali data yang diinput."}`);
      }
    } catch (error) {
      setMessage("❌ Gagal terhubung ke server backend.");
    } finally {
      setIsFormLoading(false);
    }
  };

  // Membuka modal dan mereset pesan error sebelumnya
  const openModal = () => {
    setMessage("");
    setShowPassword(false); // Reset mata jadi tertutup
    setIsModalOpen(true);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="max-w-6xl mx-auto p-8 pt-10">
        
        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard Admin</h1>
            <p className="text-gray-500 mt-1">Kelola akun pengurus SIBEM dan hak akses.</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex gap-3">
            {/* Tombol Tambah Pengurus (Biru) untuk memunculkan Modal */}
            <button 
              onClick={openModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold shadow-sm transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Tambah Pengurus
            </button>
            
            {/* Tombol Logout (Merah) */}
            <button 
              onClick={handleLogout}
              className="bg-red-50 hover:bg-red-100 text-red-600 px-5 py-3 rounded-xl font-semibold transition-colors border border-red-200"
            >
              Logout
            </button>
          </div>
        </div>

        {/* ================= TABEL DAFTAR AKUN ================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-700">Daftar Akun Terdaftar</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                  <th className="p-4 font-semibold">No</th>
                  <th className="p-4 font-semibold">Nama Lengkap</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">Jabatan / Divisi</th>
                </tr>
              </thead>
              <tbody>
                {isPageLoading ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-400">Memuat data...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-400">Belum ada akun pengurus yang terdaftar.</td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-gray-600">{index + 1}</td>
                      <td className="p-4 font-medium text-gray-800">{user.name}</td>
                      <td className="p-4 text-gray-600">{user.email}</td>
                      <td className="p-4">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                          {user.role}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ================= POPUP / MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          
          {/* Container Modal dengan batas tinggi agar bisa di-scroll jika layar kecil */}
          <div className="bg-white p-8 rounded-[30px] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
            
            {/* Tombol Silang (Tutup Modal) */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            <div className="mb-6 pr-8">
              <h2 className="text-2xl font-bold text-gray-700">Tambah Pengurus</h2>
              <p className="text-gray-400 text-sm mt-1">Buat akun baru untuk anggota SIBEM</p>
            </div>

            {message && (
              <div className={`p-3 mb-4 rounded-lg text-sm ${message.includes("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap / Username</label>
                <input
                  type="text" name="name" value={formData.name} onChange={handleChange} required
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Salsabila Alun Sukma"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Aktif</label>
                <input
                  type="email" name="email" value={formData.email} onChange={handleChange} required
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: presbem@sibem.com"
                />
              </div>
              
              {/* BAGIAN PASSWORD YANG DIUBAH */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} // Type berubah sesuai state
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    required 
                    minLength={8}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    placeholder="Minimal 8 karakter" 
                  />
                  
                  {/* Tombol Mata */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      // Ikon Mata Tercoret (Sembunyikan)
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      // Ikon Mata Terbuka (Lihat)
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <div className={isPengurusInti && !isBendumAtauSekre ? "w-full" : "w-1/2"}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
                  <select
                    value={jabatan}
                    onChange={(e) => {
                      setJabatan(e.target.value);
                      setTingkat(""); 
                    }}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Presiden BEM">Presiden BEM</option>
                    <option value="Wakil Presiden BEM">Wakil Presiden BEM</option>
                    <option value="Bendahara">Bendahara</option>
                    <option value="Sekretaris">Sekretaris</option>
                    <option value="Menteri">Menteri</option>
                    <option value="Sekjen">Sekjen</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>

                {isBendumAtauSekre && (
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tingkat (Opsional)</label>
                    <select
                      value={tingkat}
                      onChange={(e) => setTingkat(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Tunggal (Kosongkan)</option>
                      <option value="1">Ke-1</option>
                      <option value="2">Ke-2</option>
                    </select>
                  </div>
                )}

                {!isPengurusInti && (
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Divisi / Kementerian</label>
                    <select
                      value={divisi}
                      onChange={(e) => setDivisi(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
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
              </div>

              <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 border border-gray-100 mt-2">
                Akan didaftarkan sebagai: <span className="font-semibold text-blue-600">
                  {isBendumAtauSekre 
                    ? `${jabatan} ${tingkat}`.trim() 
                    : isPengurusInti 
                      ? jabatan 
                      : `${jabatan} ${divisi}`}
                </span>
              </div>

              <button
                type="submit"
                disabled={isFormLoading}
                className={`w-full py-3 mt-4 rounded-xl text-white font-semibold transition-colors ${
                  isFormLoading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isFormLoading ? "Menyimpan..." : "Tambahkan Pengurus"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}