import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

const KitchenDisplay = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();

    socket.on('new_order', (order) => {
      setOrders((prevOrders) => [order, ...prevOrders]);
      toast.info(`New order received: #${order.orderNumber}`);
    });

    socket.on('order_status_changed', (updatedOrder) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
    });

    return () => {
      socket.off('new_order');
      socket.off('order_status_changed');
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders?status=pending');
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await axios.patch(`/api/orders/${orderId}`, { status });
      socket.emit('update_order_status', {
        orderId: response.data._id,
        status: response.data.status,
        order: response.data
      });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status } : order
        )
      );
      toast.success(`Order #${response.data.orderNumber} marked as ${status}`);
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Kitchen Display System</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders
          .filter((order) => order.status === 'pending')
          .map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="bg-primary-600 text-white px-4 py-2 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Order #{order.orderNumber}</h3>
                <span className="text-sm">Table {order.tableNumber}</span>
              </div>
              
              <div className="p-4">
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item._id}
                      className="flex justify-between items-center border-b pb-2"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">{item.menuItem.name}</h4>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-700">Total Amount:</span>
                    <span className="text-lg font-bold text-primary-600">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateOrderStatus(order._id, 'preparing')}
                      className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 transition-colors"
                    >
                      Start Preparing
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order._id, 'completed')}
                      className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
                    >
                      Mark Completed
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {orders.filter((order) => order.status === 'pending').length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No pending orders</p>
        </div>
      )}
    </div>
  );
};

export default KitchenDisplay;