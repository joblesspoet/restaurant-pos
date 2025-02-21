import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { generateInvoice } from '../../api/invoiceApi';

const Bill = ({ order }) => {
  const calculateSubtotal = () => {
    return order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1; // 10% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const [loading, setLoading] = useState(false);

  const handlePrint = async () => {
    try {
      setLoading(true);
      const pdfBlob = await generateInvoice(order._id);
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Open PDF in new window and trigger print
      const printWindow = window.open(pdfUrl);
      printWindow.onload = () => {
        printWindow.print();
        URL.revokeObjectURL(pdfUrl);
      };
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Failed to generate invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="print:block" id="bill-content">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Restaurant POS</h1>
          <p className="text-gray-600">123 Restaurant Street</p>
          <p className="text-gray-600">Phone: (123) 456-7890</p>
        </div>

        {/* Order Details */}
        <div className="mb-6">
          <p><strong>Order #:</strong> {order.orderNumber}</p>
          <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
          <p><strong>Table:</strong> {order.table}</p>
          <p><strong>Server:</strong> {order.waiter?.name}</p>
        </div>

        {/* Items */}
        <table className="w-full mb-6">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-2">Item</th>
              <th className="text-center py-2">Qty</th>
              <th className="text-right py-2">Price</th>
              <th className="text-right py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="py-2">{item.menuItem.name}</td>
                <td className="text-center py-2">{item.quantity}</td>
                <td className="text-right py-2">${item.price.toFixed(2)}</td>
                <td className="text-right py-2">${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div className="border-t-2 border-gray-300 pt-4">
          <div className="flex justify-between mb-2">
            <span>Subtotal:</span>
            <span>${calculateSubtotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Tax (10%):</span>
            <span>${calculateTax().toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600">
          <p>Thank you for dining with us!</p>
          <p>Please come again</p>
        </div>
      </div>

      {/* Print Button - Only visible on screen */}
      <div className="mt-6 text-center print:hidden">
        <button
          onClick={handlePrint}
          className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          {loading ? 'Generating...' : 'Print Bill'}
        </button>
      </div>
    </div>
  );
};

Bill.propTypes = {
  order: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    orderNumber: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    table: PropTypes.number.isRequired,
    waiter: PropTypes.shape({
      name: PropTypes.string
    }),
    items: PropTypes.arrayOf(
      PropTypes.shape({
        menuItem: PropTypes.shape({
          name: PropTypes.string.isRequired
        }),
        quantity: PropTypes.number.isRequired,
        price: PropTypes.number.isRequired
      })
    ).isRequired
  }).isRequired
};

export default Bill;