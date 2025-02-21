import axios from "axios";

export const generateInvoice = async (orderId) => {
  try {
    const response = await axios.get(`/invoices/order/${orderId}`, {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
