import { useState } from "react";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // State untuk menyimpan pesan error
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(""); // Reset error saat mencoba login kembali

    try {
      // Menggunakan 127.0.0.1 agar lebih stabil (sesuai optimasi sebelumnya)
      const response = await axios.post("http://127.0.0.1:8000/api/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("role", response.data.user.role);
      
      window.location.href = "/";
    } catch (error: any) {
      // Menampilkan pesan error spesifik jika ada dari server, atau pesan default
      setErrorMessage("Email atau password yang Anda masukkan salah.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Login SIBEM</h2>
        
        <input 
          type="email" 
          placeholder="Email" 
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <input 
          type="password" 
          placeholder="Password" 
          className="w-full p-3 mb-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Tempat pesan error muncul */}
        {errorMessage && (
          <p className="text-red-500 text-sm mb-4 font-medium">
            {errorMessage}
          </p>
        )}

        <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition">
          Masuk
        </button>
      </form>
    </div>
  );
}