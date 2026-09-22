import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import AddLead from "./pages/AddLead";
import QuickLead from "./pages/QuickLead.jsx"
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
import GenerateQuotation from "./pages/GenerateQuotation";
import EmployeeWork from "./pages/EmployeeWork";
import CustomerWorkForm from "./pages/CustomerWorkForm";
import Inbox from "./pages/Inbox";
import PublicBookingForm from "./pages/PublicBookingForm";
import TravelExpenses from "./pages/TravelExpenses";
import CustomerFeedback from "./pages/CustomerFeedback";
import SalesDashboard from "./pages/SalesDashboard";

// ✅ Role-based route guard.
// Inventory is the only page locked down by role (admin, simanta, revathi).
// Every other page is open to any logged-in user, so RoleRoute is only
// used to guard /inventory now.
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
        <Route path="/book-service" element={<PublicBookingForm />} />

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

        {/* Sales pages — open to every logged-in user */}
        <Route
          path="/leads"
          element={
            <ProtectedRoute>
              <Layout>
                <Leads />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-lead"
          element={
            <ProtectedRoute>
              <Layout>
                <AddLead />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/quick-lead"
          element={
            <ProtectedRoute>
              <Layout>
                <QuickLead />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <EditLead />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/sales"
          element={
            <ProtectedRoute>
              <Layout>
                <SalesPerformance />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/sales-dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <SalesDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Inventory — the ONE page restricted by role: admin, simanta, revathi only */}
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <RoleRoute allowed={["admin", "simanta", "revathi"]}>
                <Layout>
                  <Inventory />
                </Layout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/travel-expenses"
          element={
            <ProtectedRoute>
                <Layout>
                  <TravelExpenses />
                </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/sales-report"
          element={
            <ProtectedRoute>
              <Layout>
                <SalesReport />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Complaints — open to every logged-in user */}
        <Route
          path="/complaints"
          element={
            <ProtectedRoute>
              <Layout>
                <Complaints />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Product Movement — admin only */}
        <Route
          path="/product-movement"
          element={
            <ProtectedRoute>
                <Layout>
                  <ProductMovement />
                </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/requirements"
          element={
            <ProtectedRoute>
              <Layout>
                <ClientRequirements />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-requirement"
          element={
            <ProtectedRoute>
              <Layout>
                <AddRequirement />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/requirements/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <ViewRequirement />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/requirements/edit/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <EditRequirement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/generate-quotation/:id"
          element={
            <Layout>
              <GenerateQuotation />
            </Layout>
          }
        />

        <Route
          path="/daily-work"
          element={
            <ProtectedRoute>
              <Layout>
                <EmployeeWork />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer-work"
          element={
            <ProtectedRoute>
              <Layout>
                <CustomerWorkForm />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/inbox"
          element={
            <ProtectedRoute>
              <Layout>
                <Inbox />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer-feedback"
          element={
            <ProtectedRoute>
              <Layout>
                <CustomerFeedback />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;