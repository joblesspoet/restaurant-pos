import { useState, useEffect } from "react";
import { useSocket } from "../../context/SocketContext";
import axios from "axios";
import { toast } from "react-toastify";

const Kitchen = () => {
  const [orders, setOrders] = useState({
    pending: [],
    preparing: [],
    ready: [],
  });
  const socket = useSocket();

  useEffect(() => {
    fetchOrders();

    if (socket) {
      console.log(socket);
      socket.on("new_order", (order) => {
        setOrders((prev) => ({
          ...prev,
          pending: [order, ...prev.pending],
        }));
        toast.info(`New order #${order.orderNumber} received!`);
      });

      return () => {
        socket.off("new_order");
      };
    }
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get("/api/orders");
      const filteredOrders = response.data.reduce(
        (acc, order) => {
          if (["pending", "preparing", "ready"].includes(order.status)) {
            acc[order.status].push(order);
          }
          return acc;
        },
        { pending: [], preparing: [], ready: [] }
      );
      setOrders(filteredOrders);
    } catch (error) {
      toast.error("Failed to fetch orders");
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await axios.put(`/api/orders/${orderId}/status`, {
        status,
      });

      // Emit socket event for status update
      socket.emit("order_status_change", {
        orderId,
        status,
        orderNumber: response.data.orderNumber,
      });

      setOrders((prev) => {
        const oldStatus = Object.keys(prev).find((key) =>
          prev[key].find((o) => o._id === orderId)
        );

        return {
          ...prev,
          [oldStatus]: prev[oldStatus].filter((o) => o._id !== orderId),
          [status]: [...prev[status], response.data],
        };
      });

      toast.success(`Order status updated to ${status}`);
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const OrderCard = ({ order, onStatusUpdate }) => (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Order #{order.orderNumber}</h3>
        <span className="px-2 py-1 rounded bg-gray-100">
          Table: {order.table || "Takeaway"}
        </span>
      </div>
      <div className="space-y-2">
        {order.items.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <div>
              <span className="font-medium">{item.quantity}x</span>{" "}
              {item.menuItem.name}
            </div>
            {item.notes && (
              <span className="text-sm text-gray-500">{item.notes}</span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        {order.status === "pending" && (
          <button
            onClick={() => onStatusUpdate(order._id, "preparing")}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Start Preparing
          </button>
        )}
        {order.status === "preparing" && (
          <button
            onClick={() => onStatusUpdate(order._id, "ready")}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Mark Ready
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Kitchen Display</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Pending Orders</h2>
          <div className="space-y-4">
            {orders.pending.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onStatusUpdate={updateOrderStatus}
              />
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Preparing</h2>
          <div className="space-y-4">
            {orders.preparing.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onStatusUpdate={updateOrderStatus}
              />
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Ready to Serve</h2>
          <div className="space-y-4">
            {orders.ready.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Kitchen;
