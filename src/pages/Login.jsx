import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      console.log("LOGIN RESPONSE:", data); // 👈 DEBUG


      if (data.message === "Login success") {
        localStorage.setItem("role", data.role);
        navigate("/");
      } else {
        alert(data.error || "Invalid login");
      }

    } catch (err) {
      console.error(err);
      alert("Server error");
    }

    
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      {/* Card */}
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Login to CRM
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">

          {/* Username */}
          <div>
            <label className="text-sm text-gray-600">Username</label>
            <input
              type="text"
              placeholder="Enter username"
              required
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
            />
          </div>

          {/* Password */}
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              required
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 outline-none pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-semibold transition"
          >
            Login
          </button>

        </form>

      </div>

    </div>
  );
}