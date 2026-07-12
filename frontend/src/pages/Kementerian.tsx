import { useState, useEffect } from "react";
import axios from "axios";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface KementerianData {
  id: string;
  nama: string;
  menteri: string;
  menteriObj: User | null;
  anggota: User[];
  staffCount: number;
  prokerCount: number;
  anggaran: string;
  status: string;
}

export default function Kementerian() {
  const [stats, setStats] = useState({
    totalKementerian: 0,
    totalStaff: 0,
    totalProker: 0,
  });
  
  const [kementerianList, setKementerianList] = useState<KementerianData[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const [selectedKementerian, setSelectedKementerian] = useState<KementerianData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStatistik = async () => {
    setIsLoadingStats(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const usersRes = await axios.get("http://127.0.0.1:8000/api/users", { headers });
      const users: User[] = usersRes.data.data || usersRes.data || [];

      const kegiatanRes = await axios.get("http://127.0.0.1:8000/api/proker", { headers }).catch(() => ({ data: [] }));
      const kegiatan = kegiatanRes.data.data || kegiatanRes.data || [];

      const excludedRoles = [
        "admin", 
        "presiden bem", 
        "wakil presiden bem", 
        "bendahara", "bendahara 1", "bendahara 2", 
        "sekretaris", "sekretaris 1", "sekretaris 2"
      ];

      const staffTerdaftar = users.filter((u) => u.role?.toLowerCase() !== "admin");

      const kementerianMap = new Map<string, User[]>();

      staffTerdaftar.forEach(user => {
        const role = user.role?.trim() || "";
        const roleLower = role.toLowerCase();

        if (excludedRoles.includes(roleLower) || !roleLower) return;

        let namaKementerian = role.replace(/^(Menteri|Sekjen|Staff)\s+/i, '').trim();
        if (!namaKementerian) namaKementerian = role;

        if (!kementerianMap.has(namaKementerian)) {
          kementerianMap.set(namaKementerian, []);
        }
        kementerianMap.get(namaKementerian)!.push(user);
      });

      const dynamicKementerian: KementerianData[] = Array.from(kementerianMap.entries()).map(([namaKementerian, usersInDivisi]) => {
        const menteriObj = usersInDivisi.find((u) => u.role?.toLowerCase().startsWith("menteri")) || null;
        const anggotaList = usersInDivisi.filter((u) => !u.role?.toLowerCase().startsWith("menteri"));

        const prokerDivisi = kegiatan.filter((k: any) => 
          k.divisi?.toLowerCase() === namaKementerian.toLowerCase() || 
          k.kementerian?.toLowerCase() === namaKementerian.toLowerCase()
        );

        return {
          id: namaKementerian,
          nama: namaKementerian,
          menteri: menteriObj ? menteriObj.name : "Belum ada Menteri",
          menteriObj: menteriObj,
          anggota: anggotaList,
          staffCount: usersInDivisi.length,
          prokerCount: prokerDivisi.length,
          anggaran: "Rp -", 
          status: "Aktif",
        };
      });

      setStats({
        totalKementerian: dynamicKementerian.length,
        totalStaff: staffTerdaftar.length,
        totalProker: kegiatan.length,
      });

      setKementerianList(dynamicKementerian.sort((a, b) => b.staffCount - a.staffCount));

    } catch (error) {
      console.error("Gagal mengambil data statistik:", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStatistik();
  }, []);

  const openDetailModal = (kementerian: KementerianData) => {
    setSelectedKementerian(kementerian);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedKementerian(null), 200); 
  };

  return (
    <div className="p-4 sm:p-8 font-sans text-gray-800">
      
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Kementerian</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Kelola data kementerian dan struktur organisasi SIBEM.</p>
        </div>
      </div>

      {/* ================= STATISTIK DINAMIS (3 Kolom Sejajar) ================= */}
      <div className="grid grid-cols-3 gap-3 sm:gap-5 mb-8">
        <Card 
          title="Total Kementerian" 
          value={isLoadingStats ? "..." : stats.totalKementerian.toString()} 
          color="blue"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-7 sm:h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
            </svg>
          } 
        />
        <Card 
          title="Total Pengurus" 
          value={isLoadingStats ? "..." : stats.totalStaff.toString()} 
          color="orange"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-7 sm:h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          } 
        />
        <Card 
          title="Total Program Kerja" 
          value={isLoadingStats ? "..." : stats.totalProker.toString()} 
          color="green"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-7 sm:h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
            </svg>
          } 
        />
      </div>

      {/* ================= SEARCH & FILTER ================= */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Cari kementerian..."
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* ================= DAFTAR KEMENTERIAN ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {isLoadingStats ? (
          <div className="col-span-2 text-center py-12 text-gray-400 font-medium">Memuat struktur kementerian...</div>
        ) : kementerianList.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-gray-400 font-medium">Belum ada data kementerian. Pastikan ada user yang didaftarkan.</div>
        ) : (
          kementerianList.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:border-blue-100 group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                      {item.nama}
                    </h2>
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold border bg-green-50 text-green-700 border-green-200/60">
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 font-medium">Menteri:</span>
                    <span className={`font-semibold ${item.menteriObj ? "text-blue-600" : "text-gray-400 italic"}`}>
                      {item.menteri}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => openDetailModal(item)}
                  className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all active:scale-95 flex items-center gap-2"
                >
                  Detail
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-50">
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Pengurus</p>
                  <p className="text-gray-900 font-bold text-lg">{item.staffCount} <span className="text-gray-400 font-medium text-xs">Orang</span></p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Proker</p>
                  <p className="text-gray-900 font-bold text-lg">{item.prokerCount}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Anggaran</p>
                  <p className="text-gray-900 font-bold text-lg">{item.anggaran}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ================= MODAL DETAIL KEMENTERIAN ================= */}
      {isModalOpen && selectedKementerian && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-all">
          <div className="bg-white p-6 sm:p-8 rounded-[32px] shadow-2xl w-full max-w-xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            
            <div className="flex justify-between items-start mb-6 shrink-0">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Kementerian {selectedKementerian.nama}</h2>
                <p className="text-gray-500 text-sm mt-1 font-medium">Struktur Kepengurusan SIBEM</p>
              </div>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-full p-2.5 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto pr-2 pb-2 space-y-6">
              
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Menteri Kementerian</h3>
                {selectedKementerian.menteriObj ? (
                  <div className="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-white border border-blue-100 p-4 rounded-2xl">
                    <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-inner shrink-0">
                      {selectedKementerian.menteriObj.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{selectedKementerian.menteriObj.name}</p>
                      <p className="text-sm font-semibold text-blue-600">{selectedKementerian.menteriObj.role}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-100 border-dashed p-4 rounded-2xl text-center text-gray-400 font-medium">
                    Belum ada Menteri yang didaftarkan.
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Jajaran Staff ({selectedKementerian.anggota.length})</h3>
                </div>
                
                {selectedKementerian.anggota.length > 0 ? (
                  <div className="space-y-3">
                    {selectedKementerian.anggota.map((staff) => (
                      <div key={staff.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm shrink-0">
                          {staff.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-800">{staff.name}</p>
                          <p className="text-xs font-medium text-gray-500">{staff.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-2xl text-center text-gray-400 font-medium text-sm">
                    Belum ada staff di kementerian ini.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

function Card({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: "blue" | "orange" | "green";
}) {
  const colorStyles = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    green: "bg-green-50 text-green-600 border-green-100",
  };

  const bgDecorationColor = colorStyles[color].split(" ")[0];

  return (
    <div className="relative overflow-hidden rounded-[20px] sm:rounded-[24px] bg-white p-4 sm:p-6 shadow-sm border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group cursor-default">
      
      <div className={`absolute -right-6 -top-6 w-20 h-20 sm:w-24 sm:h-24 rounded-full opacity-50 transition-transform group-hover:scale-[1.8] duration-700 ease-out ${bgDecorationColor}`}></div>
      
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5">
        <div className={`flex items-center justify-center w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl border ${colorStyles[color]} shadow-sm shrink-0`}>
          {icon}
        </div>
        
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{value}</h2>
          <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-0.5 sm:mt-1">{title}</p>
        </div>
      </div>
    </div>
  );
}