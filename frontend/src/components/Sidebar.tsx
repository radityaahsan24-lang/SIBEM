import { useState } from "react";
import logoKarsacipta from "../assets/logo-karsacipta.png";

interface SidebarProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export default function Sidebar({ activeMenu, setActiveMenu, isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

  const menus = [
    { 
      name: "Overview", 
      icon: <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> 
    },
    { 
      name: "Kegiatan", 
      icon: <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> 
    },
    { 
      name: "Pengajuan KAK", 
      icon: <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> 
    },
    { 
      name: "Anggaran", 
      icon: <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> 
    },
    { 
      name: "Kementerian", 
      icon: <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg> 
    },
    { 
      name: "Laporan", 
      icon: <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> 
    },
    { 
      name: "Presensi", 
      icon: <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> 
    },
    { 
      name: "Pengaturan", 
      icon: <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> 
    },
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
          bg-white border-r border-gray-100 flex flex-col h-full z-50 transition-all duration-300 ease-in-out
        `}
      >
        {/* Header Sidebar */}
        <div className="h-24 flex items-center px-7 gap-3 border-b border-gray-50 overflow-hidden whitespace-nowrap shrink-0">
          
          {/* Tombol Hamburger (Khusus Laptop) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden md:block p-1 rounded-lg text-orange-500 hover:bg-orange-50 focus:outline-none shrink-0"
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
              className={`object-contain transition-all duration-300 ease-in-out shrink-0 ${isOpen ? "h-8 w-8 opacity-100" : "h-0 w-0 opacity-0"}`}
            />

            {/* Bagian Teks SIBEM yang sudah ada */}
            <h1 className={`text-2xl font-extrabold text-orange-500 transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden ${isOpen ? "opacity-100 max-w-[200px] md:ml-1" : "opacity-0 max-w-0 md:ml-0"}`}>
              SIBEM
            </h1>
          </div>

          {/* Tombol Tutup (X) khusus HP */}
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1 text-gray-400 hover:text-red-500 focus:outline-none ml-auto"
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
              className={`w-full flex items-center justify-start px-4 py-3.5 rounded-xl font-medium transition-colors duration-200 ${
                activeMenu === menu.name
                  ? "bg-orange-50 text-orange-600 shadow-inner"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center justify-center w-8 shrink-0">
                <span className="text-xl">{menu.icon}</span>
              </div>
              <span className={`text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "opacity-100 max-w-[200px] ml-4" : "opacity-0 max-w-0 ml-0"}`}>
                {menu.name}
              </span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}