import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaShoppingCart, FaPlus, FaMinus, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";

const OrderTaking = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();

  // Redirect if not admin or waiter
  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "waiter")) {
      toast.error("Unauthorized access");
      window.location.href = "/";
      return;
    }
  }, [user]);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableNumber, setTableNumber] = useState("");
  const [waiters, setWaiters] = useState([]);
  const [selectedWaiter, setSelectedWaiter] = useState("");

  useEffect(() => {
    fetchMenuItems();
    fetchWaiters();
  }, []);

  const fetchWaiters = async () => {
    try {
      const response = await axios.get("/api/users");
      const waitersList = response.data.filter(
        (user) => user.role === "waiter"
      );
      setWaiters(waitersList);
    } catch (error) {
      toast.error("Failed to fetch waiters");
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get("/api/menu");
      setMenuItems(response.data);
    } catch (error) {
      toast.error("Failed to fetch menu items");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    console.log(item);
    const existingItem = cart.find((cartItem) => cartItem._id === item._id);
    if (existingItem) {
      setCart((prev) =>
        prev.map((cartItem) =>
          cartItem._id === item._id
            ? {
                ...cartItem,
                quantity: cartItem.quantity + 1,
                totalPrice: (cartItem.quantity + 1) * cartItem.price,
              }
            : cartItem
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1, totalPrice: item.price }]);
    }
    toast.success(`Added ${item.name} to cart`);
  };

  const updateQuantity = (itemId, change) => {
    setCart(
      cart
        .map((item) => {
          if (item._id === itemId) {
            const newQuantity = item.quantity + change;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter((item) => item._id !== itemId));
    toast.info("Item removed from cart");
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleSubmitOrder = async () => {
    if (!tableNumber) {
      toast.error("Please enter a table number");
      return;
    }
    if (!selectedWaiter) {
      toast.error("Please select a waiter");
      return;
    }
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    try {
      const orderData = {
        table: parseInt(tableNumber),
        items: cart.map((item) => ({
          menuItem: item._id,
          quantity: item.quantity,
          notes: item.notes || "",
        })),
        type: "dine-in",
        server: selectedWaiter,
        status: "pending",
      };

      const response = await axios.post("/api/orders", orderData);
      socket.emit("new_order", response.data);
      toast.success("Order created successfully");
      setCart([]);
      setTableNumber("");
      setSelectedWaiter("");

      navigate("/orders");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create order");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Menu Items Section */}
      <div className="w-2/3 p-6 overflow-auto">
        <h2 className="text-2xl font-bold mb-6">Menu Items</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-40 object-cover rounded-md mb-4"
                />
              )}
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{item.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">
                  ${item.price.toFixed(2)}
                </span>
                <button
                  onClick={() => addToCart(item)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-1/3 bg-white p-6 shadow-lg overflow-auto">
        <div className="flex items-center mb-6">
          <FaShoppingCart className="text-2xl mr-2" />
          <h2 className="text-2xl font-bold">Cart</h2>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Table Number
          </label>
          <input
            type="number"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="Enter table number"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Waiter
          </label>
          <select
            value={selectedWaiter}
            onChange={(e) => setSelectedWaiter(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Choose a waiter</option>
            {waiters.map((waiter) => (
              <option key={waiter._id} value={waiter._id}>
                {waiter.name}
              </option>
            ))}
          </select>
        </div>

        {cart.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Cart is empty</p>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-sm text-gray-600">
                      ${item.price.toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item._id, -1)}
                      className="p-1 rounded-full hover:bg-gray-200"
                    >
                      <FaMinus className="text-gray-600" />
                    </button>
                    <span className="font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, 1)}
                      className="p-1 rounded-full hover:bg-gray-200"
                    >
                      <FaPlus className="text-gray-600" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="p-1 rounded-full hover:bg-gray-200 ml-2"
                    >
                      <FaTrash className="text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-xl font-bold">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleSubmitOrder}
                className="w-full bg-green-500 text-white py-3 rounded-md hover:bg-green-600 transition-colors"
              >
                Place Order
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderTaking;
