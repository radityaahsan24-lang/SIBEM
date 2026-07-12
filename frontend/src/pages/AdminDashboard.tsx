import { useState, useEffect } from "react";
import logoBem from "../assets/logo-bem.png";
import logoKarsacipta from "../assets/logo-karsacipta.png";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [jabatan, setJabatan] = useState("Menteri");
  const [divisi, setDivisi] = useState("Kastrat");
  const [tingkat, setTingkat] = useState(""); 
  const [message, setMessage] = useState("");
  const [isFormLoading, setIsFormLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);

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

  useEffect(() => {
    fetchUsers();
  }, []);

  // ==========================================
  // FUNGSI LOGOUT
  // ==========================================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
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
        setFormData({ name: "", email: "", password: "" });
        setJabatan("Menteri"); setDivisi("Kastrat"); setTingkat("");
        setShowPassword(false);
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

  const openModal = () => {
    setMessage("");
    setShowPassword(false); 
    setIsModalOpen(true);
  };

  // Fungsi untuk memberi warna badge berbeda tergantung jabatan
  const getRoleBadgeStyle = (role: string) => {
    if (role.includes("Presiden") || role.includes("Bendahara") || role.includes("Sekretaris")) {
      return "bg-purple-100 text-purple-700 border-purple-200"; // Pengurus Inti
    }
    if (role.includes("Menteri") || role.includes("Sekjen")) {
      return "bg-blue-100 text-blue-700 border-blue-200"; // Menteri
    }
    return "bg-orange-100 text-orange-700 border-orange-200"; // Staff
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-12 font-sans">
      <div className="max-w-6xl mx-auto p-4 sm:p-8 pt-8">
        
        {/* ================= HEADER MODERN DENGAN LOGO ================= */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 bg-white p-8 rounded-[30px] shadow-sm border border-slate-100 gap-6 lg:gap-0 relative overflow-hidden">
          
          {/* Dekorasi Background Abstrak (Opsional untuk estetika) */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-50 to-blue-50 rounded-full blur-3xl -z-10 transform translate-x-20 -translate-y-20 opacity-60"></div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 z-10">
            {/* Bagian Dua Logo */}
            <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 shadow-sm">
              <img src={logoBem} alt="Logo BEM" className="h-14 w-14 object-contain rounded-full bg-white" />
              <div className="h-8 w-[2px] bg-slate-200 rounded-full"></div>
              <img src={logoKarsacipta} alt="Logo Karsa Cipta" className="h-14 w-14 object-contain rounded-full bg-white" />
            </div>
            
            {/* Judul */}
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Dashboard Admin</h1>
              <p className="text-slate-500 mt-1.5 font-medium">Pusat kendali hak akses & akun pengurus SIBEM.</p>
            </div>
          </div>
          
          {/* Tombol Aksi */}
          <div className="flex gap-3 w-full lg:w-auto z-10">
            <button 
              onClick={openModal}
              className="flex-1 lg:flex-none justify-center bg-orange-500 hover:bg-orange-600 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-orange-500/30 transition-all active:scale-95 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Tambah Pengurus
            </button>
            
            <button 
              onClick={handleLogout}
              className="justify-center bg-white hover:bg-red-50 text-red-600 px-6 py-3.5 rounded-xl font-bold transition-colors border border-red-100 hover:border-red-200 flex items-center gap-2"
            >
              Logout
            </button>
          </div>
        </div>

        {/* ================= TABEL DAFTAR AKUN ================= */}
        <div className="bg-white rounded-[30px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white/50 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-slate-800">Daftar Pengurus Terdaftar</h2>
            <div className="bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-sm font-bold border border-orange-100">
              Total: {users.length} Akun
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-sm">
                  <th className="p-5 font-bold border-b border-slate-100 w-16 text-center">No</th>
                  <th className="p-5 font-bold border-b border-slate-100">Nama Lengkap</th>
                  <th className="p-5 font-bold border-b border-slate-100">Alamat Email</th>
                  <th className="p-5 font-bold border-b border-slate-100">Jabatan / Divisi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isPageLoading ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-slate-400 font-medium animate-pulse">Memuat data pengurus...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-slate-400 font-medium">Belum ada akun pengurus yang terdaftar.</td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="p-5 text-slate-400 font-medium text-center">{index + 1}</td>
                      <td className="p-5 font-bold text-slate-700 group-hover:text-orange-600 transition-colors">{user.name}</td>
                      <td className="p-5 text-slate-500 font-medium">{user.email}</td>
                      <td className="p-5">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getRoleBadgeStyle(user.role)}`}>
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

      {/* ================= POPUP / MODAL (TAMBAH PENGURUS) ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-all">
          <div className="bg-white p-8 sm:p-10 rounded-[40px] shadow-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-full p-2.5 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            <div className="mb-8 pr-8">
              <h2 className="text-2xl font-extrabold text-slate-800">Tambah Pengurus</h2>
              <p className="text-slate-500 text-sm mt-1.5 font-medium">Buat akun baru untuk anggota organisasi SIBEM.</p>
            </div>

            {message && (
              <div className={`p-4 mb-6 rounded-2xl text-sm font-bold border ${message.includes("✅") ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nama Lengkap</label>
                <input
                  type="text" name="name" value={formData.name} onChange={handleChange} required
                  className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-medium transition-all"
                  placeholder="Contoh: Salsabila Alun Sukma"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email Aktif</label>
                <input
                  type="email" name="email" value={formData.email} onChange={handleChange} required
                  className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-medium transition-all"
                  placeholder="Contoh: presbem@sibem.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} 
                    name="password" value={formData.password} onChange={handleChange} required minLength={8}
                    className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-12 font-medium transition-all"
                    placeholder="Minimal 8 karakter" 
                  />
                  <button
                    type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-orange-500 transition-colors"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <div className={isPengurusInti && !isBendumAtauSekre ? "w-full" : "w-1/2"}>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Jabatan</label>
                  <select
                    value={jabatan}
                    onChange={(e) => { setJabatan(e.target.value); setTingkat(""); }}
                    className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white font-medium"
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
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tingkat</label>
                    <select
                      value={tingkat} onChange={(e) => setTingkat(e.target.value)}
                      className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white font-medium"
                    >
                      <option value="">Tunggal</option>
                      <option value="1">Ke-1</option>
                      <option value="2">Ke-2</option>
                    </select>
                  </div>
                )}

                {!isPengurusInti && (
                  <div className="w-1/2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Divisi</label>
                    <select
                      value={divisi} onChange={(e) => setDivisi(e.target.value)}
                      className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white font-medium"
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

              <div className="bg-blue-50/50 p-4 rounded-2xl text-sm text-slate-600 border border-blue-100 mt-2 flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" /></svg>
                </div>
                <div>
                  Akan didaftarkan sebagai:<br/>
                  <span className="font-extrabold text-blue-700 text-base">
                    {isBendumAtauSekre ? `${jabatan} ${tingkat}`.trim() : isPengurusInti ? jabatan : `${jabatan} ${divisi}`}
                  </span>
                </div>
              </div>

              <button
                type="submit" disabled={isFormLoading}
                className={`w-full py-4 mt-2 rounded-2xl text-white font-bold text-lg shadow-lg transition-all ${
                  isFormLoading ? "bg-orange-300 cursor-not-allowed shadow-none" : "bg-orange-500 hover:bg-orange-600 shadow-orange-500/30 active:scale-[0.98]"
                }`}
              >
                {isFormLoading ? "Menyimpan Data..." : "Tambahkan Pengurus"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}