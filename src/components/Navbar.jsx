import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="w-64 h-screen bg-white shadow-md p-5">
      <NavLink to="/" onClick={() => setMenuOpen(false)} className="block mb-8">
        <h1 className="text-xl font-bold text-orange-500 cursor-pointer hover:text-orange-600 transition">
          Hytoma CRM
        </h1>
      </NavLink>

      {/* MENU */}
      <nav className="flex flex-col gap-3">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `px-4 py-2 rounded-lg ${
              isActive
                ? "bg-orange-100 text-orange-600"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/leads"
          className={({ isActive }) =>
            `px-4 py-2 rounded-lg ${
              isActive
                ? "bg-orange-100 text-orange-600"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          Leads
        </NavLink>

        <NavLink
          to="/add-lead"
          className={({ isActive }) =>
            `px-4 py-2 rounded-lg ${
              isActive
                ? "bg-orange-100 text-orange-600"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          Add Lead
        </NavLink>

        <NavLink
          to="/sales-dashboard"
          className={({ isActive }) =>
            `px-4 py-2 rounded-lg ${
              isActive
                ? "bg-orange-100 text-orange-600"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          Sales Dashboard
        </NavLink>

        <NavLink
          to="/daily-work"
          className={({ isActive }) =>
            `px-4 py-2 rounded-lg ${
              isActive
                ? "bg-orange-100 text-orange-600"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          Daily Work
        </NavLink>
        <NavLink
          to="/customer-feedback"
          className={({ isActive }) =>
            `px-4 py-2 rounded-lg ${
              isActive
                ? "bg-orange-100 text-orange-600"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          Customer Feedback 
        </NavLink>
        <button
          onClick={() => {
            localStorage.removeItem("isAuth");
            window.location.href = "/login";
          }}
        >
          Logout
        </button>
      </nav>
    </div>
  );
}
