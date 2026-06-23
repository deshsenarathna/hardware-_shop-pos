import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import UnauthorizedPage from "./pages/UnauthorizedPage.jsx";
import UserManagementPage from "./pages/UserManagementPage.jsx";
import RoleRoute from "./auth/RoleRoute";
import UnitManagementPage from "./pages/UnitManagementPage.jsx";
import CategoryManagementPage from "./pages/CategoryManagementPage.jsx";
import BrandManagementPage from "./pages/BrandManagement.jsx";

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
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/unauthorized"
        element={
           <ProtectedRoute>
              <UnauthorizedPage />
           </ProtectedRoute>
         }
      />
      
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