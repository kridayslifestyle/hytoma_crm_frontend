import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import AddLead from "./pages/AddLead";
import EditLead from "./pages/EditLead";
import SalesPerformance from "./pages/SalesPerformance";
import SalesReport from "./pages/SalesReport";
import Inventory from "./pages/Inventory";
import Complaints from "./pages/Complaints";
import ProductMovement from "./pages/ProductMovement";
import ComplaintForm from "./pages/ComplaintForm";
import ClientRequirements from "./pages/ClientRequirements";
import AddRequirement from "./pages/AddRequirement";
import ViewRequirement from "./pages/ViewRequirement";
import EditRequirement from "./pages/EditRequirement";

// ✅ Role-based route guard
const RoleRoute = ({ children, allowed }) => {
  const role = localStorage.getItem("role");
  if (!allowed.includes(role)) return <Navigate to="/" />;
  return children;
};

// ✅ Simanta lands on complaints, everyone else on dashboard
const HomeRedirect = () => {
  const role = localStorage.getItem("role");
  if (role === "simanta") return <Navigate to="/complaints" />;
  return <Dashboard />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route path="/submit-complaint" element={<ComplaintForm />} />

        {/* Home — redirects based on role */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <HomeRedirect />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Sales pages — all roles except simanta */}
        <Route
          path="/leads"
          element={
            <ProtectedRoute>
              <RoleRoute
                allowed={["admin", "sales", "revathi", "inventory_manager"]}
              >
                <Layout>
                  <Leads />
                </Layout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-lead"
          element={
            <ProtectedRoute>
              <RoleRoute
                allowed={["admin", "sales", "revathi", "inventory_manager"]}
              >
                <Layout>
                  <AddLead />
                </Layout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit/:id"
          element={
            <ProtectedRoute>
              <RoleRoute
                allowed={["admin", "sales", "revathi", "inventory_manager"]}
              >
                <Layout>
                  <EditLead />
                </Layout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/sales"
          element={
            <ProtectedRoute>
              <RoleRoute
                allowed={["admin", "sales", "revathi", "inventory_manager"]}
              >
                <Layout>
                  <SalesPerformance />
                </Layout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/sales-report"
          element={
            <ProtectedRoute>
              <RoleRoute
                allowed={["admin", "sales", "revathi", "inventory_manager"]}
              >
                <Layout>
                  <SalesReport />
                </Layout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Inventory — admin, revathi, inventory_manager only */}
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <RoleRoute
                allowed={["admin", "revathi", "inventory_manager", "simanta"]}
              >
                <Layout>
                  <Inventory />
                </Layout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Complaints — admin and simanta only */}
        <Route
          path="/complaints"
          element={
            <ProtectedRoute>
              <RoleRoute allowed={["admin", "simanta", "venkatesh"]}>
                <Layout>
                  <Complaints />
                </Layout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Product Movement — admin only */}
        <Route
          path="/product-movement"
          element={
            <ProtectedRoute>
              <RoleRoute allowed={["admin", "inventory_manager"]}>
                <Layout>
                  <ProductMovement />
                </Layout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route path="/requirements" element={<ClientRequirements />} />

        <Route path="/add-requirement" element={<AddRequirement />} />
        <Route path="/requirements/:id" element={<ViewRequirement />} />
        <Route path="/requirements/edit/:id" element={<EditRequirement />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
