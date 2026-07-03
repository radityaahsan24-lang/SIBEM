import { useState, useEffect } from "react";

// Menerima perintah onMenuClick dari MainLayout
interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");

    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("user");
  window.location.href = "/login"; // Kembali ke login
};

  return (
    <header className="flex justify-between items-center mb-6 md:mb-8">
      {/* Bagian Kiri: Tombol HP + Teks Sambutan */}
      <div className="flex items-center gap-3">
        {/* Tombol Hamburger HP (Otomatis hilang di Laptop) */}
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg focus:outline-none"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div>
          <h2 className="text-xl md:text-3xl font-bold text-gray-800">Selamat Datang</h2>
          <p className="hidden md:block text-gray-400 mt-1 text-sm">
            Kelola dan pantau seluruh kegiatan organisasi secara menyeluruh
          </p>
        </div>
      </div>

      {/* Bagian Kanan: Ikon & Profil */}
      <div className="flex items-center gap-3 md:gap-5">
        <button className="hidden md:block text-gray-300 hover:text-gray-500 text-xl">✉️</button>
        <button className="text-orange-400 hover:text-orange-500 text-xl relative">
          🔔
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Profil BEM */}
        <div className="relative md:ml-4">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
            className="flex items-center gap-3 text-left focus:outline-none hover:opacity-80 transition-opacity"
          >
            <div className="hidden md:block text-right">
              <p className="text-sm font-bold text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-400">{user?.role}</p>
            </div>
            <div className="h-9 w-9 md:h-10 md:w-10 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
              {user?.name?.split(" ").map((i: string) => i[0]).join("").toUpperCase( )}
            </div>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profil Saya</button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Pengaturan</button>
              <hr className="my-1 border-gray-100" />
              <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium">Keluar</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}