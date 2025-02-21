import { useState, useEffect } from "react";
import axios from "axios";
import { useSocket } from "../../context/SocketContext";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import Bill from "../../components/bill/Bill";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [waiterFilter, setWaiterFilter] = useState("all");
  const [waiters, setWaiters] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const socket = useSocket();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    fetchOrders();

    if (socket) {
      // Listen for new orders
      socket.on("new_order", (order) => {
        setOrders((prevOrders) => [order, ...prevOrders]);
        toast.info(`New order #${order.orderNumber} received!`);
      });

      // Listen for order status updates
      socket.on("order_status_update", ({ orderId, status, orderNumber }) => {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status } : order
          )
        );
        toast.info(`Order #${orderNumber} status updated to ${status}`);
      });

      return () => {
        socket.off("new_order");
        socket.off("order_status_update");
      };
    }
  }, [socket]);

  const fetchOrders = async () => {
    try {
      const [ordersResponse, waitersResponse] = await Promise.all([
        axios.get("/api/orders"),
        axios.get("/api/users?role=waiter"),
      ]);
      setOrders(ordersResponse.data);
      setWaiters(waitersResponse.data);
    } catch (error) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData) => {
    try {
      const response = await axios.post("/api/orders", orderData);
      setOrders((prev) => [response.data, ...prev]);
      toast.success("Order created successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create order");
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status });
      toast.success("Order status updated");
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesPayment =
      paymentFilter === "all" || order.paymentStatus === paymentFilter;
    const matchesWaiter =
      waiterFilter === "all" || order.waiterId === waiterFilter;
    return matchesPayment && matchesWaiter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <Bill order={selectedOrder} />
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex gap-4 items-center">
          <Link
            to="/order-taking"
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
          >
            Create Order
          </Link>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="all">All Payments</option>
            <option value="pending">Pending Payment</option>
            <option value="paid">Paid</option>
          </select>
          {isAdmin && (
            <select
              value={waiterFilter}
              onChange={(e) => setWaiterFilter(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="all">All Waiters</option>
              {waiters.map((waiter) => (
                <option key={waiter._id} value={waiter._id}>
                  {waiter.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
      <div className="grid gap-4">
        {filteredOrders.map((order) => (
          <div
            key={order._id}
            className="border p-4 rounded-lg shadow bg-white"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                Order #{order.orderNumber}
              </h2>
              <span
                className={`px-2 py-1 rounded ${
                  order.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {order.status}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <p>Table: {order.table}</p>
              <p>Type: {order.type}</p>
              <p>Total: ${order.total}</p>
              <p>
                Payment:{" "}
                <span
                  className={`px-2 py-1 rounded ${
                    order.paymentStatus === "paid"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </p>
              {order.waiter && <p>Waiter: {order.waiter.name}</p>}
              <p>Created: {new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold">Items:</h3>
              <ul className="ml-4">
                {order.items.map((item, index) => (
                  <li key={index}>
                    {item.quantity}x {item.menuItem.name} - ${item.price}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 flex gap-2 justify-between">
              {order.status !== "completed" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => updateOrderStatus(order._id, "preparing")}
                    className={`bg-blue-500 text-white px-4 py-2 rounded ${
                      order.status === "preparing"
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={order.status === "preparing"}
                  >
                    Start Preparing
                  </button>
                  <button
                    onClick={() => updateOrderStatus(order._id, "completed")}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Mark Completed
                  </button>
                </div>
              )}
              <button
                onClick={() => setSelectedOrder(order)}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors"
              >
                View Bill
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
