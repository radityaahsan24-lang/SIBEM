import { useState } from "react";
import axios from "axios";
import logoBem from "../assets/logo-bem.png";
import logoKarsacipta from "../assets/logo-karsacipta.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(""); 
    setIsLoading(true); 

    try {
      // Sengaja ditambahkan delay 1 detik agar animasi loading terlihat jelas
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await axios.post("http://127.0.0.1:8000/api/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("role", response.data.user.role);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      window.location.href = "/";
    } catch {
      setErrorMessage("Email atau password yang Anda masukkan salah.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-50 via-slate-50 to-orange-50 px-4">
      
      <form 
        onSubmit={handleLogin} 
        className="bg-white/80 backdrop-blur-md p-10 rounded-[30px] shadow-2xl border border-white/50 w-full max-w-md"
      >
        
        {/* Bagian Dua Logo */}
        <div className="flex justify-center items-center gap-6 mb-6">
          <img 
            src={logoBem} 
            alt="Logo BEM" 
            className="h-16 w-16 object-contain rounded-full shadow-sm bg-white"
          />
          <div className="h-10 w-[2px] bg-gray-200 rounded-full"></div>
          <img 
            src={logoKarsacipta} 
            alt="Logo Karsa Cipta" 
            className="h-16 w-16 object-contain rounded-full shadow-sm bg-white"
          />
        </div>

        {/* Bagian Judul */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Login SIBEM</h2>
          <p className="text-gray-500 text-sm mt-2 font-medium">Sistem Informasi BEM</p>
        </div>
        
        <div className="space-y-4">
            <div>
              <input 
                type="email" 
                placeholder="Alamat Email" 
                className="w-full px-5 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/70 transition-all font-medium"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            {/* Bagian Input Password dengan Ikon Mata */}
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                className="w-full px-5 py-3.5 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/70 transition-all font-medium"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              
              {/* Tombol Mata */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
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

        {errorMessage && (
          <div className="mt-5 p-3 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-red-500 text-sm font-medium text-center">
              {errorMessage}
            </p>
          </div>
        )}

        <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full mt-8 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg transition-all flex justify-center items-center gap-2 ${
              isLoading 
                ? 'bg-orange-400 cursor-not-allowed shadow-none' 
                : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/30 active:scale-[0.98]'
            }`}
        >
          {isLoading && (
            <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {isLoading ? "Memproses..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}