import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import WorkOrders from "./pages/WorkOrders";
import Production from "./pages/Production";
import Issues from "./pages/Issues";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import Settings from "./pages/Settings";

import ProtectedRoute from "./components/common/ProtectedRoute";

import { InventoryProvider } from "./context/InventoryContext";

// Same visibility rules as the sidebar, now enforced on the routes too.
function App() {
  return (
    <InventoryProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute roles={["Admin", "Planner"]}>
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute roles={["Admin", "Planner"]}>
                  <Inventory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workorders"
              element={
                <ProtectedRoute roles={["Admin", "Planner"]}>
                  <WorkOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/production"
              element={
                <ProtectedRoute roles={["Admin", "Planner", "Supervisor", "Management"]}>
                  <Production />
                </ProtectedRoute>
              }
            />
            <Route
              path="/issues"
              element={
                <ProtectedRoute roles={["Admin", "Planner", "Supervisor", "Management"]}>
                  <Issues />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute roles={["Admin", "Management"]}>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute roles={["Admin"]}>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute roles={["Admin"]}>
                  <Settings />
                </ProtectedRoute>
              }
            />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </InventoryProvider>
  );
}

export default App;
