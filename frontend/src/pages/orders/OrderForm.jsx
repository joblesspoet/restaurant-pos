import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSocket } from '../../context/SocketContext';

const OrderForm = ({ onOrderCreated }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableNumber, setTableNumber] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get('/api/menu');
      setMenuItems(response.data);
    } catch (error) {
      toast.error('Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = (item) => {
    const existingItem = selectedItems.find((selected) => selected._id === item._id);
    if (existingItem) {
      setSelectedItems(
        selectedItems.map((selected) =>
          selected._id === item._id
            ? { ...selected, quantity: selected.quantity + 1 }
            : selected
        )
      );
    } else {
      setSelectedItems([...selectedItems, { ...item, quantity: 1 }]);
    }
  };

  const handleRemoveItem = (itemId) => {
    setSelectedItems(selectedItems.filter((item) => item._id !== itemId));
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    setSelectedItems(
      selectedItems.map((item) =>
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const calculateTotal = () => {
    return selectedItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tableNumber) {
      toast.error('Please enter a table number');
      return;
    }
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item');
      return;
    }
    setShowPreview(true);
  };

  const handleConfirmOrder = async () => {
    try {
      const orderData = {
        tableNumber,
        items: selectedItems.map((item) => ({
          menuItem: item._id,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: calculateTotal(),
        status: 'pending',
      };

      const response = await axios.post('/api/orders', orderData);
      socket.emit('new_order', response.data);
      toast.success('Order created successfully');
      onOrderCreated(response.data);
      
      // Reset form
      setSelectedItems([]);
      setTableNumber('');
      setShowPreview(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create order');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Order</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="tableNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Table Number
          </label>
          <input
            type="number"
            id="tableNumber"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Menu Items</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item) => (
              <div
                key={item._id}
                className="border rounded-md p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => handleAddItem(item)}
              >
                <h4 className="font-medium text-gray-900">{item.name}</h4>
                <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Selected Items</h3>
          {selectedItems.length === 0 ? (
            <p className="text-gray-500">No items selected</p>
          ) : (
            <div className="space-y-4">
              {selectedItems.map((item) => (
                <div key={item._id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-4">
                <span className="font-medium text-gray-900">Total:</span>
                <span className="text-lg font-bold text-primary-600">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Preview Order
        </button>
      </form>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Preview</h2>
            <div className="mb-4">
              <p className="text-gray-700">Table Number: {tableNumber}</p>
            </div>
            <div className="space-y-4">
              {selectedItems.map((item) => (
                <div key={item._id} className="border-b pb-2">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Total:</span>
                  <span className="text-xl font-bold text-primary-600">
                    ${calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-4">
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Edit Order
              </button>
              <button
                onClick={handleConfirmOrder}
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700"
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderForm;