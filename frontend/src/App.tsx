import { useState } from "react";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Proker from "./pages/Proker";
import Presensi from "./pages/Presensi";
import Login from "./pages/Login";
import Laporan from "./pages/Laporan";

export default function App() {
  const [activeMenu, setActiveMenu] = useState("Overview"); // Default menu sesuai desain

  const renderContent = () => {
    switch (activeMenu) {
      case "Overview":
        return <Dashboard />;
      case "Kegiatan":
        return <Proker />;
      case "Laporan":
        return <Laporan />;
      case "Presensi":
        return <Presensi />;
      default:
        return (
          <div className="bg-white p-10 rounded-[40px] shadow-sm flex items-center justify-center h-96 border border-gray-100">
            <div className="text-center">
              <p className="text-gray-400 mb-2">Halaman sedang dikembangkan</p>
              <h2 className="text-2xl font-bold text-gray-700">
                {activeMenu} SIBEM
              </h2>
            </div>
          </div>
        );
    }
  };

  const isAuthenticated = !!localStorage.getItem("token");
  // const isAuthenticated = true;

  return isAuthenticated ? <MainLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu}>
      {renderContent()}
    </MainLayout> : <Login />;

 
}
