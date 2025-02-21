import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Bill from "../../components/bill/Bill";

const Payments = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({
    amount: "",
    method: "cash",
    cardLastDigits: "",
    receiptNumber: "",
    notes: "",
  });

  useEffect(() => {
    fetchUnpaidOrders();
  }, []);

  const fetchUnpaidOrders = async () => {
    try {
      const response = await axios.get("/api/orders?paymentStatus=pending");
      setOrders(response.data);
    } catch (error) {
      toast.error("Failed to fetch orders");
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      await axios.post(
        `/api/payments/${selectedOrder._id}/log`,
        paymentDetails
      );
      toast.success("Payment processed successfully");

      // Print receipt
      const receiptResponse = await axios.post(
        `/api/payments/${selectedOrder._id}/print`,
        { type: "customer" }
      );
      console.log("Receipt:", receiptResponse.data.receipt);

      setSelectedOrder(null);
      setPaymentDetails({
        amount: "",
        method: "cash",
        cardLastDigits: "",
        receiptNumber: "",
        notes: "",
      });
      fetchUnpaidOrders();
    } catch (error) {
      toast.error("Payment processing failed");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Payment Processing</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Orders List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Unpaid Orders</h2>
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className={`p-4 rounded-lg shadow cursor-pointer ${
                  selectedOrder?._id === order._id
                    ? "bg-blue-50 border-2 border-blue-500"
                    : "bg-white"
                }`}
                onClick={() => {
                  setSelectedOrder(order);
                  setPaymentDetails({ ...paymentDetails, amount: order.total });
                }}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Order #{order.orderNumber}</h3>
                  <span className="font-bold">${order.total}</span>
                </div>
                <p>Table: {order.table || "Takeaway"}</p>
                <p>Items: {order.items.length}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bill Preview and Payment Form */}
        {selectedOrder && (
          <div className="space-y-6">
            {/* Bill Preview */}
            <div className="bg-white p-6 rounded-lg shadow">
              <Bill order={selectedOrder} />
            </div>

            {/* Payment Form */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Process Payment</h2>
              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={paymentDetails.amount}
                    onChange={(e) =>
                      setPaymentDetails({
                        ...paymentDetails,
                        amount: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Payment Method
                  </label>
                  <select
                    value={paymentDetails.method}
                    onChange={(e) =>
                      setPaymentDetails({
                        ...paymentDetails,
                        method: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="card_machine">Card Machine</option>
                  </select>
                </div>

                {paymentDetails.method === "card_machine" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Last 4 Digits
                      </label>
                      <input
                        type="text"
                        maxLength="4"
                        value={paymentDetails.cardLastDigits}
                        onChange={(e) =>
                          setPaymentDetails({
                            ...paymentDetails,
                            cardLastDigits: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Receipt Number
                      </label>
                      <input
                        type="text"
                        value={paymentDetails.receiptNumber}
                        onChange={(e) =>
                          setPaymentDetails({
                            ...paymentDetails,
                            receiptNumber: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <textarea
                    value={paymentDetails.notes}
                    onChange={(e) =>
                      setPaymentDetails({
                        ...paymentDetails,
                        notes: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
                >
                  Process Payment
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;
