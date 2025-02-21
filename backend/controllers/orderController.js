const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");

exports.createOrder = async (req, res) => {
  try {
    const { items, type, table, customer, server } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Order must contain at least one item" });
    }

    if (!table) {
      return res.status(400).json({ message: "Table number is required" });
    }

    // Calculate subtotal, tax, and total while validating items
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      if (!item.menuItem || !item.quantity) {
        return res.status(400).json({
          message: "Each order item must have a menuItem ID and quantity",
        });
      }

      const menuItem = await MenuItem.findById(item.menuItem);
      if (!menuItem) {
        return res.status(404).json({
          message: `Menu item with ID ${item.menuItem} not found`,
        });
      }

      if (!menuItem.available) {
        return res.status(400).json({
          message: `Menu item ${menuItem.name} is currently not available`,
        });
      }

      const itemTotal = menuItem.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        menuItem: item.menuItem,
        quantity: item.quantity,
        price: menuItem.price,
        notes: item.notes || "",
      });
    }

    // Calculate tax and total
    const tax = subtotal * 0.1; // 10% tax rate
    const total = subtotal + tax;

    const orderNumber = `ORD${Date.now()}`;
    const order = new Order({
      orderNumber,
      items: orderItems,
      subtotal,
      tax,
      total,
      type: type || "dine-in",
      table,
      customer,
      server: server, // Add the server (waiter) ID from the authenticated user
      status: "pending",
    });

    await order.save();

    // Populate the order with menu item details before emitting
    const populatedOrder = await Order.findById(order._id)
      .populate("items.menuItem")
      .populate("server", "name");

    // Emit socket event for new order to chef and admin
    const io = req.app.get("io");
    io.to("chef").to("admin").emit("new_order", populatedOrder);

    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { 
        status,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('items.menuItem').populate('server', 'name');

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Emit socket events using a single io instance
    const io = req.app.get("io");
    
    // Emit to specific roles
    io.to("admin").to("chef").to("waiter").emit("order_status_changed", {
      orderId: order._id,
      status: order.status,
      updatedAt: order.updatedAt,
      message: `Order ${order.orderNumber} status changed to ${order.status}`,
      order: order
    });

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { status, type } = req.query;
    const query = {};

    // If it's a chef accessing the kitchen route
    if (req.originalUrl.includes('/kitchen')) {
      // Show only orders that need preparation (pending) or are being prepared
      query.status = { $in: ['pending', 'preparing'] };
    } else if (status) {
      query.status = status;
    }

    if (type) query.type = type;

    const orders = await Order.find(query)
      .populate("items.menuItem")
      .populate('server', 'name')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
