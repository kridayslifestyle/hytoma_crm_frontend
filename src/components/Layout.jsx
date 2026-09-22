import { useState } from "react";
import { NavLink } from "react-router-dom";
import { logoutUser } from "../services/api";

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const role = localStorage.getItem("role");

  // ✅ Permission helper.
  // Inventory is the ONE page restricted by role: admin, simanta, revathi
  // only. Every other page is visible to any logged-in user.
  const can = (page) => {
    if (page === "inventory") {
      return role === "admin" || role === "simanta" || role === "revathi";
    }
    return Boolean(role);
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
          <h1 className="text-xl font-bold text-orange-500 mb-8 cursor-pointer hover:text-orange-600 transition shrink-0">
            Hytoma CRM
          </h1>
        </NavLink>

        {/* Scrollable menu area */}
        <nav className="flex flex-col gap-2 flex-1 overflow-y-auto">
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
          {can("sales-dashboard") && (
            <NavItem
              to="/sales-dashboard"
              label="Sales Dashboard"
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
          {can("customer-work") && (
            <NavItem
              to="/customer-work"
              label="Customer Work"
              onClick={() => setMenuOpen(false)}
            />
          )}
          {can("inbox") && (
            <NavItem
              to="/inbox"
              label="WhatsApp Inbox"
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

          {can("travel-expenses") && (
            <NavItem
              to="/travel-expenses"
              label="Travel Expenses"
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
          {can("customer-feedback") && (
            <NavItem
              to="/customer-feedback"
              label="customer feedback"
              onClick={() => setMenuOpen(false)}
            />
          )}
        </nav>

        {/* Logout pinned at the bottom */}
        <button
          onClick={logoutUser}
          className="shrink-0 mt-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 text-left transition font-medium"
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