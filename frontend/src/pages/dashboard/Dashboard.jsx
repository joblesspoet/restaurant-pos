import React, { useEffect, useState } from "react";
import { getAllAppUsers } from "@api/userApi";
import { getAllOrders } from "@api/orderApi";
import { FaUtensils, FaHourglass, FaClock, FaUsers, FaUserTie, FaClipboardList } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.role === 'admin') {
          const [usersData, ordersData] = await Promise.all([
            getAllAppUsers(),
            getAllOrders()
          ]);
          setUsers(usersData);
          setOrders(ordersData);
        } else {
          const ordersData = await getAllOrders();
          setOrders(ordersData.filter(order => 
            user?.role === 'chef' ? 
            ['pending', 'preparing'].includes(order.status) : 
            true
          ));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchData();
  }, [user?.role]);

  const getUserCountByRole = (role) => {
    return users.filter(user => user.role === role).length;
  };

  const getOrdersByStatus = (status) => {
    return orders.filter(order => order.status === status).length;
  };

  const getTodayOrders = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return orders.filter(order => new Date(order.createdAt) >= today).length;
  };

  const getWaiterOrders = (waiterId) => {
    return orders.filter(order => order.waiterId === waiterId).length;
  };

  const getStatsCards = () => {
    switch(user?.role) {
      case 'chef':
        return [
          {
            title: 'Pending Orders',
            count: getOrdersByStatus('pending'),
            icon: FaHourglass,
            color: 'bg-yellow-500'
          },
          {
            title: 'Orders in Preparing',
            count: getOrdersByStatus('preparing'),
            icon: FaUtensils,
            color: 'bg-green-500'
          },
          {
            title: 'Completed Orders',
            count: getOrdersByStatus('completed'),
            icon: FaClipboardList,
            color: 'bg-blue-500'
          }
        ];
      case 'waiter':
        return [
          {
            title: 'Pending Orders',
            count: getOrdersByStatus('pending'),
            icon: FaHourglass,
            color: 'bg-yellow-500'
          },
          {
            title: 'My Total Orders',
            count: getWaiterOrders(user?._id),
            icon: FaClipboardList,
            color: 'bg-blue-500'
          },
          {
            title: 'Ready to Serve',
            count: getOrdersByStatus('ready'),
            icon: FaUtensils,
            color: 'bg-green-500'
          }
        ];
      default: // admin
        return [
          {
            title: 'Total Orders',
            count: orders.length,
            icon: FaClipboardList,
            color: 'bg-blue-500'
          },
          {
            title: 'Active Orders',
            count: orders.filter(order => !['completed', 'cancelled'].includes(order.status)).length,
            icon: FaHourglass,
            color: 'bg-yellow-500'
          },
          {
            title: 'Total Waiters',
            count: getUserCountByRole('waiter'),
            icon: FaUserTie,
            color: 'bg-green-500'
          },
          {
            title: 'Total Chefs',
            count: getUserCountByRole('chef'),
            icon: FaUtensils,
            color: 'bg-purple-500'
          },
          {
            title: "Today's Orders",
            count: getTodayOrders(),
            icon: FaUsers,
            color: 'bg-pink-500'
          }
        ];
    }
  };

  const statsCards = getStatsCards();

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-8">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statsCards.map((card, index) => (
          <div
            key={index}
            className={`${card.color} rounded-lg shadow-lg p-6 text-white transform transition-transform hover:scale-105`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold mb-2">{card.title}</p>
                <h3 className="text-3xl font-bold">{card.count}</h3>
              </div>
              <card.icon className="text-4xl opacity-80" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
