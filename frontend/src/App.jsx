import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import PrivateRoute from "./components/common/PrivateRoute";
import Layout from "./components/layout/Layout";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Orders from "./pages/orders/Orders";
import OrderTaking from "./pages/orders/OrderTaking";
import Menu from "./pages/menu/Menu";
import Kitchen from "./pages/kitchen/Kitchen";
import Payments from "./pages/payments/Payments";
import UserManagement from "./pages/admin/UserManagement";

import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <ToastContainer />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<Layout />}>
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <PrivateRoute>
                    <Orders />
                  </PrivateRoute>
                }
              />
              <Route
                path="/order-taking"
                element={
                  <PrivateRoute roles={["admin", "waiter"]}>
                    <OrderTaking />
                  </PrivateRoute>
                }
              />
              <Route
                path="/menu"
                element={
                  <PrivateRoute>
                    <Menu />
                  </PrivateRoute>
                }
              />
              <Route
                path="/kitchen"
                element={
                  <PrivateRoute roles={["chef"]}>
                    <Kitchen />
                  </PrivateRoute>
                }
              />
              <Route
                path="/payments"
                element={
                  <PrivateRoute roles={["admin", "cashier"]}>
                    <Payments />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <PrivateRoute roles={["admin"]}>
                    <UserManagement />
                  </PrivateRoute>
                }
              />
            </Route>
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
