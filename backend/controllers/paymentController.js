const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/Order");

exports.processPayment = async (req, res) => {
  try {
    const { orderId, paymentMethod, amount } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    let paymentResult;

    switch (paymentMethod) {
      case "card":
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: "usd",
        });
        paymentResult = paymentIntent;
        break;

      case "cash":
        paymentResult = { status: "completed" };
        break;

      default:
        return res.status(400).json({ message: "Invalid payment method" });
    }

    order.paymentStatus = "paid";
    order.paymentMethod = paymentMethod;
    await order.save();

    res.json({ success: true, payment: paymentResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Payment processing failed" });
  }
};

exports.refundPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentMethod === "card") {
      // Process refund through Stripe
      await stripe.refunds.create({
        payment_intent: order.stripePaymentId,
      });
    }

    order.paymentStatus = "refunded";
    await order.save();

    res.json({ message: "Refund processed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Refund processing failed" });
  }
};

exports.logPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { amount, method, cardLastDigits, receiptNumber, notes } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Create payment log
    const paymentLog = {
      amount,
      method,
      cardLastDigits,
      receiptNumber,
      cashierName: req.user.name,
      notes,
    };

    // Add payment to logs
    order.paymentLogs.push(paymentLog);

    // Calculate total paid amount
    const totalPaid = order.paymentLogs.reduce(
      (sum, log) => sum + log.amount,
      0
    );

    // Update payment status
    if (totalPaid >= order.total) {
      order.paymentStatus = "paid";
    } else if (totalPaid > 0) {
      order.paymentStatus = "partially_paid";
    }

    await order.save();

    // Generate receipt
    const receipt = await generateReceipt(order, paymentLog);

    res.json({
      success: true,
      order,
      receipt,
      remainingBalance: Math.max(0, order.total - totalPaid),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Payment logging failed" });
  }
};

exports.printReceipt = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { type } = req.query; // 'customer' or 'kitchen'

    const order = await Order.findById(orderId)
      .populate("items.menuItem")
      .populate("server", "name");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const receipt = await generateReceipt(order, null, type);
    order.printedCount += 1;
    await order.save();

    res.json({
      success: true,
      receipt,
      printedCount: order.printedCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Receipt printing failed" });
  }
};

// Helper function to generate receipt
const generateReceipt = async (order, paymentLog, type = "customer") => {
  // Format the receipt based on type (customer or kitchen)
  const receipt = {
    orderNumber: order.orderNumber,
    timestamp: new Date().toLocaleString(),
    type: type,
    items: order.items.map((item) => ({
      name: item.menuItem.name,
      quantity: item.quantity,
      price: item.price,
      total: item.quantity * item.price,
      notes: item.notes,
    })),
    subtotal: order.subtotal,
    tax: order.tax,
    total: order.total,
    table: order.table,
    server: order.server.name,
  };

  if (type === "customer" && paymentLog) {
    receipt.payment = {
      method: paymentLog.method,
      amount: paymentLog.amount,
      cardLastDigits: paymentLog.cardLastDigits,
      receiptNumber: paymentLog.receiptNumber,
    };

    // Calculate remaining balance
    const totalPaid = order.paymentLogs.reduce(
      (sum, log) => sum + log.amount,
      0
    );
    receipt.remainingBalance = Math.max(0, order.total - totalPaid);
  }

  return receipt;
};
