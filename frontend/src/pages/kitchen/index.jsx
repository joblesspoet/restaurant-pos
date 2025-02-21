import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { SocketContext } from '../../context/SocketContext';
import axios from 'axios';

const KitchenPage = () => {
  const [orders, setOrders] = useState([]);
  const { user } = useContext(AuthContext);
  const socket = useContext(SocketContext);

  useEffect(() => {
    // Fetch pending orders when component mounts
    fetchOrders();

    // Listen for new orders
    if (socket) {
      socket.on('newOrder', (order) => {
        setOrders(prev => [order, ...prev]);
      });

      socket.on('orderStatusUpdated', ({ orderId, status }) => {
        setOrders(prev =>
          prev.map(order =>
            order._id === orderId ? { ...order, status } : order
          )
        );
      });
    }

    return () => {
      if (socket) {
        socket.off('newOrder');
        socket.off('orderStatusUpdated');
      }
    };
  }, [socket]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders/kitchen`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/orders/${orderId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setOrders(prev =>
        prev.map(order =>
          order._id === orderId ? { ...order, status } : order
        )
      );
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Kitchen Orders</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map(order => (
          <div key={order._id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Order #{order.orderNumber}</h2>
              <span className={`px-2 py-1 rounded text-sm ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                {order.status}
              </span>
            </div>
            <div className="space-y-2">
              {order.items.map(item => (
                <div key={item._id} className="flex justify-between items-center">
                  <span>{item.quantity}x {item.menuItem.name}</span>
                  {item.notes && <span className="text-sm text-gray-500">Note: {item.notes}</span>}
                </div>
              ))}
            </div>
            {order.status === 'pending' && (
              <button
                onClick={() => updateOrderStatus(order._id, 'preparing')}
                className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                Start Preparing
              </button>
            )}
            {order.status === 'preparing' && (
              <button
                onClick={() => updateOrderStatus(order._id, 'ready')}
                className="mt-4 w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
              >
                Mark as Ready
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KitchenPage;