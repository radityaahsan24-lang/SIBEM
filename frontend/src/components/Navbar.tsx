import { useState } from "react";

// Menerima perintah onMenuClick dari MainLayout
interface NavbarProps {
  onMenuClick?: () => void;
}

interface UserData {
  name: string;
  role: string;
  email?: string;
  [key: string]: unknown;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user] = useState<UserData | null>(() => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  });

  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("user");
  window.location.href = "/login"; // Kembali ke login
};

  return (
    <header className="flex justify-between items-center">
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
        <button className="hidden md:block text-gray-400 hover:text-gray-500 transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
        </button>
        <button className="text-orange-400 hover:text-orange-500 transition-colors relative">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
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