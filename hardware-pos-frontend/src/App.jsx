import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import RoleRoute from "./auth/RoleRoute";
import Layout from "./components/Layout.jsx";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import UnauthorizedPage from "./pages/UnauthorizedPage.jsx";
import UserManagementPage from "./pages/UserManagementPage.jsx";
import UnitManagementPage from "./pages/UnitManagementPage.jsx";
import CategoryManagementPage from "./pages/CategoryManagementPage.jsx";
import BrandManagementPage from "./pages/BrandManagement.jsx";
import ProductManagementPage from "./pages/ProductManagement.jsx";
import CashierPage from "./pages/CashierPage.jsx";
import InventoryManagement from "./pages/InventoryManagement.jsx";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to="/dashboard" replace />
            : <LoginPage />
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
       >
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route
          path="/users"
          element={
            <RoleRoute allowedRoles={["OWNER"]}>
              <UserManagementPage />
            </RoleRoute>
          }
        />

        <Route
          path="/units"
          element={
            <RoleRoute allowedRoles={["OWNER", "MANAGER"]}>
              <UnitManagementPage />
            </RoleRoute>
          }
        />

        <Route
          path="/categories"
          element={
            <RoleRoute allowedRoles={["OWNER", "MANAGER"]}>
              <CategoryManagementPage />
            </RoleRoute>
          }
        />

        <Route
          path="/brands"
          element={
            <RoleRoute allowedRoles={["OWNER", "MANAGER"]}>
              <BrandManagementPage />
            </RoleRoute>
          }
        />

        <Route
          path="/products"
          element={
            <RoleRoute allowedRoles={["OWNER", "MANAGER"]}>
              <ProductManagementPage />
            </RoleRoute>
          }
        />

        <Route
          path="/new-sale"
          element={
            <RoleRoute allowedRoles={["OWNER", "MANAGER", "CASHIER"]}>
              <CashierPage />
            </RoleRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <RoleRoute allowedRoles={["OWNER", "MANAGER", "CASHIER"]}>
              <InventoryManagement />
            </RoleRoute>
          }
        />
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to={
              isAuthenticated
                ? "/dashboard"
                : "/login"
            }
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;