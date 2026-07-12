import { useState } from "react";
import logoKarsacipta from "../assets/logo-karsacipta.jpeg";

interface SidebarProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export default function Sidebar({ activeMenu, setActiveMenu, isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

  const menus = [
    { name: "Overview", icon: "📈" },
    { name: "Kegiatan", icon: "📋" },
    { name: "Pengajuan KAK", icon: "📝" },
    { name: "Anggaran", icon: "💳" },
    { name: "Kementerian", icon: "🏛️" },
    { name: "Laporan", icon: "📊" },
    { name: "Presensi", icon: "📅" },
    { name: "Pengaturan", icon: "⚙️" },
  ];

  return (
    <>
      {/* 1. Layar Gelap (Overlay) khusus HP */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* 2. Sidebar Utama */}
      <aside
        className={`
          ${isOpen ? "w-64" : "w-24"} 
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0
          fixed md:relative top-0 left-0
          bg-white border-r border-gray-100 flex flex-col h-full z-50 transition-transform duration-300
        `}
      >
        {/* Header Sidebar */}
        <div className={`h-24 flex items-center ${isOpen ? "px-6 justify-between md:justify-start gap-3" : "justify-center"} border-b border-gray-50 transition-all`}>
          
          {/* Tombol Hamburger (Khusus Laptop) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden md:block p-1 rounded-lg text-orange-500 hover:bg-orange-50 focus:outline-none"
            title={isOpen ? "Tutup Menu" : "Buka Menu"}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={isOpen ? "M4 6h16M4 12h10M4 18h16" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>

          <div className="flex items-center gap-2 overflow-hidden">
            {/* Bagian Foto Logo */}
            <img 
              src={logoKarsacipta} 
              alt="Logo SIBEM" 
              className={`object-contain transition-all duration-300 ${isOpen ? "h-8 w-8 opacity-100" : "h-0 w-0 opacity-0"}`}
            />

            {/* Bagian Teks SIBEM yang sudah ada */}
            <h1 className={`text-2xl font-extrabold text-orange-500 transition-all duration-300 overflow-hidden whitespace-nowrap ${isOpen ? "opacity-100 w-auto md:ml-1" : "opacity-0 w-0"}`}>
              SIBEM
            </h1>
          </div>

          {/* Tombol Tutup (X) khusus HP */}
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1 text-gray-400 hover:text-red-500 focus:outline-none"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Area Menu Navigasi */}
        <nav className="flex-1 px-4 space-y-2 mt-6 overflow-y-auto overflow-x-hidden">
          {menus.map((menu) => (
            <button
              key={menu.name}
              onClick={() => {
                setActiveMenu(menu.name);
                setIsMobileOpen(false); // Otomatis tutup saat menu diklik di HP
              }}
              title={!isOpen ? menu.name : ""}
              className={`w-full flex items-center ${
                isOpen ? "justify-start px-4" : "justify-center px-0"
              } py-3.5 rounded-xl font-medium transition-all duration-200 ${
                activeMenu === menu.name
                  ? "bg-orange-50 text-orange-600 shadow-inner"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              <span className="text-xl flex-shrink-0">{menu.icon}</span>
              <span className={`text-sm ml-4 transition-all duration-300 whitespace-nowrap ${isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"}`}>
                {menu.name}
              </span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}