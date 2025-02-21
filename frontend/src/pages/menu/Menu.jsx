import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import menuData from "../../data/menuData";
import { FaEdit, FaTrash } from "react-icons/fa";

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: null,
  });
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const categories = [
    "all",
    "appetizers",
    "main_course",
    "desserts",
    "beverages",
  ];

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      // For now, use the static menu data
      setMenuItems(menuData);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to fetch menu items");
      setLoading(false);
    }
  };

  const handleNewItemSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(newItem).forEach((key) => {
      formData.append(key, newItem[key]);
    });

    try {
      const response = await axios.post("/api/menu", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMenuItems([...menuItems, response.data]);
      toast.success("Menu item added successfully");
      setNewItem({
        name: "",
        description: "",
        price: "",
        category: "",
        image: null,
      });
    } catch (error) {
      toast.error("Failed to add menu item");
    }
  };

  const handleImageChange = (e) => {
    setNewItem({ ...newItem, image: e.target.files[0] });
  };

  const filteredItems =
    selectedCategory === "all"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const handleDelete = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/menu/${selectedItem._id}`);
      setMenuItems(menuItems.filter((item) => item._id !== selectedItem._id));
      toast.success("Menu item deleted successfully");
      setShowDeleteModal(false);
    } catch (error) {
      toast.error("Failed to delete menu item");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/api/menu/${selectedItem._id}`, selectedItem);
      setMenuItems(menuItems.map((item) => 
        item._id === selectedItem._id ? response.data : item
      ));
      toast.success("Menu item updated successfully");
      setShowEditModal(false);
    } catch (error) {
      toast.error("Failed to update menu item");
    }
  };

  return (
    <div className="p-4 flex gap-6">
      {/* Left Column - Menu Items */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Menu Items</h1>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded border p-2"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.replace("_", " ").toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredItems.map((item) => (
            <div key={item.name} className="bg-white rounded-lg shadow-md overflow-hidden">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <span className="text-lg font-bold">${item.price}</span>
                </div>
                <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                <p className="text-gray-500 text-sm mb-2">
                  Category: {item.category.replace("_", " ").toUpperCase()}
                </p>
                {isAdmin && (
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <FaEdit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column - Add Menu Form */}
      {isAdmin && (
        <div className="w-1/3 bg-white rounded-lg shadow p-6 h-fit sticky top-4">
          <h2 className="text-xl font-semibold mb-4">Add New Menu Item</h2>
          <form onSubmit={handleNewItemSubmit} className="space-y-4">
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="number"
                placeholder="Price"
                value={newItem.price}
                onChange={(e) =>
                  setNewItem({ ...newItem, price: e.target.value })
                }
                className="w-full p-2 border rounded"
                required
              />
              <select
                value={newItem.category}
                onChange={(e) =>
                  setNewItem({ ...newItem, category: e.target.value })
                }
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Category</option>
                {categories
                  .filter((cat) => cat !== "all")
                  .map((category) => (
                    <option key={category} value={category}>
                      {category.replace("_", " ").toUpperCase()}
                    </option>
                  ))}
              </select>
              <input
                type="file"
                onChange={handleImageChange}
                className="w-full p-2 border rounded"
                accept="image/*"
              />
              <textarea
                placeholder="Description"
                value={newItem.description}
                onChange={(e) =>
                  setNewItem({ ...newItem, description: e.target.value })
                }
                className="w-full p-2 border rounded"
                rows="4"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
            >
              Add Item
            </button>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-4">Are you sure you want to delete {selectedItem?.name}?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Edit Menu Item</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={selectedItem?.name || ''}
                onChange={(e) =>
                  setSelectedItem({ ...selectedItem, name: e.target.value })
                }
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="number"
                placeholder="Price"
                value={selectedItem?.price || ''}
                onChange={(e) =>
                  setSelectedItem({ ...selectedItem, price: e.target.value })
                }
                className="w-full p-2 border rounded"
                required
              />
              <select
                value={selectedItem?.category || ''}
                onChange={(e) =>
                  setSelectedItem({ ...selectedItem, category: e.target.value })
                }
                className="w-full p-2 border rounded"
                required
              >
                {categories
                  .filter((cat) => cat !== "all")
                  .map((category) => (
                    <option key={category} value={category}>
                      {category.replace("_", " ").toUpperCase()}
                    </option>
                  ))}
              </select>
              <textarea
                placeholder="Description"
                value={selectedItem?.description || ''}
                onChange={(e) =>
                  setSelectedItem({ ...selectedItem, description: e.target.value })
                }
                className="w-full p-2 border rounded"
                rows="4"
                required
              />
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
