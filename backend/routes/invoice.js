const express = require("express");
const router = express.Router();
const invoiceService = require("../services/invoiceService");
const Order = require("../models/Order");

router.get("/order/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('items.menuItem')
      .populate('server', 'name')
      .populate('customer');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const pdfBuffer = await invoiceService.generateInvoice(order);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderNumber}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ message: 'Failed to generate invoice' });
  }
});

module.exports = router;
