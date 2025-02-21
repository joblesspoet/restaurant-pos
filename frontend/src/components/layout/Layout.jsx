import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-xl font-bold text-gray-800">
                  Restaurant POS
                </Link>
              </div>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                {user?.role === "chef" ? (
                  <>
                    <Link
                      to="/"
                      className="inline-flex items-center px-1 pt-1 text-gray-500 hover:text-gray-700"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/kitchen"
                      className="inline-flex items-center px-1 pt-1 text-gray-500 hover:text-gray-700"
                    >
                      Kitchen
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/"
                      className="inline-flex items-center px-1 pt-1 text-gray-500 hover:text-gray-700"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/orders"
                      className="inline-flex items-center px-1 pt-1 text-gray-500 hover:text-gray-700"
                    >
                      Orders
                    </Link>
                    <Link
                      to="/menu"
                      className="inline-flex items-center px-1 pt-1 text-gray-500 hover:text-gray-700"
                    >
                      Menu
                    </Link>
                    {(user?.role === "admin" || user?.role === "cashier") && (
                      <Link
                        to="/payments"
                        className="inline-flex items-center px-1 pt-1 text-gray-500 hover:text-gray-700"
                      >
                        Payments
                      </Link>
                    )}
                    {user?.role === "admin" && (
                      <Link
                        to="/admin/users"
                        className="inline-flex items-center px-1 pt-1 text-gray-500 hover:text-gray-700"
                      >
                        Users
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 mr-4">
                {user?.name} ({user?.role})
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
