import { useState } from "react";
import { NavLink } from "react-router-dom";
import { logoutUser } from "../services/api";

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const role = localStorage.getItem("role");

  // ✅ Permission helper
  const can = (page) => {
    if (page === "daily-work" && role) return true;
    if (role === "admin") return true;
    if (role === "simanta") return ["complaints", "inventory"].includes(page);
    if (role === "venkatesh") return ["Product movement"].includes(page);
    if (role === "technical") return ["complaints", "inventory", "daily-work"].includes(page);
    if (role === "installation") return ["product-movement", "daily-work"].includes(page);
    if (role === "revathi")
      return [
        "dashboard",
        "leads",
        "add-lead",
        "sales",
        "sales-report",
        "inventory",
        "product-movement",
        "requirements",
      ].includes(page);
    if (role === "inventory_manager")
      return [
        "dashboard",
        "leads",
        "add-lead",
        "sales",
        "sales-report",
        "inventory",
        "product-movement",
        "requirements",
      ].includes(page);
    if (role === "sales")
      return [
        "dashboard",
        "leads",
        "add-lead",
        "sales",
        "sales-report",
        "requirements",
      ].includes(page);
    return false;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-20 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`
        fixed z-30 top-0 left-0 h-full w-64 bg-white shadow-lg p-5 flex flex-col
        transform transition-transform duration-300
        ${menuOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:z-auto
      `}
      >
        <NavLink
          to={role === "simanta" ? "/complaints" : "/"}
          onClick={() => setMenuOpen(false)}
        >
          <h1 className="text-xl font-bold text-orange-500 mb-8 cursor-pointer hover:text-orange-600 transition">
            Hytoma CRM
          </h1>
        </NavLink>

        <nav className="flex flex-col gap-2">
          {can("dashboard") && (
            <NavItem
              to="/"
              label="Dashboard"
              onClick={() => setMenuOpen(false)}
            />
          )}
          {can("leads") && (
            <NavItem
              to="/leads"
              label="Leads"
              onClick={() => setMenuOpen(false)}
            />
          )}
          {can("requirements") && (
            <NavItem
              to="/requirements"
              label="Client Requirements"
              onClick={() => setMenuOpen(false)}
            />
          )}
          {can("add-lead") && (
            <NavItem
              to="/add-lead"
              label="Add Lead"
              onClick={() => setMenuOpen(false)}
            />
          )}
          {can("sales") && (
            <NavItem
              to="/sales"
              label="Sales Performance"
              onClick={() => setMenuOpen(false)}
            />
          )}

          {can("daily-work") && (
            <NavItem
              to="/daily-work"
              label="Daily Work"
              onClick={() => setMenuOpen(false)}
            />
          )}
          {can("inventory") && (
            <NavItem
              to="/inventory"
              label="Inventory"
              onClick={() => setMenuOpen(false)}
            />
          )}
          {can("sales-report") && (
            <NavItem
              to="/sales-report"
              label="Sales Report"
              onClick={() => setMenuOpen(false)}
            />
          )}
          {can("complaints") && (
            <NavItem
              to="/complaints"
              label="Complaints"
              onClick={() => setMenuOpen(false)}
            />
          )}
          {can("product-movement") && (
            <NavItem
              to="/product-movement"
              label="Product Movement"
              onClick={() => setMenuOpen(false)}
            />
          )}
          {role === "admin" && (
            <NavItem
              to="/product-movement"
              label="Product Movement"
              onClick={() => setMenuOpen(false)}
            />
          )}
        </nav>

        <button
          onClick={logoutUser}
          className="mt-auto px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 text-left transition font-medium"
        >
          Logout
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-auto">
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white shadow-sm">
          <h1 className="text-lg font-bold text-orange-500">Hytoma CRM</h1>
          <button
            onClick={() => setMenuOpen(true)}
            className="text-gray-600 text-2xl"
          >
            ☰
          </button>
        </div>
        <div className="flex-1 bg-gray-50 p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}

function NavItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `px-4 py-3 rounded-lg transition ${
          isActive
            ? "bg-orange-100 text-orange-600 font-medium"
            : "text-gray-700 hover:bg-gray-100"
        }`
      }
    >
      {label}
    </NavLink>
  );
}
