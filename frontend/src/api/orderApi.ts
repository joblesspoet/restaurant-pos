import { API_BASE_URL } from "@constants/common";
import axios from "axios";

export const getAllOrders = async () => {
  const response = await axios.get(`/api/orders`);
  return response.data;
};

export const createOrder = async (orderData) => {
  const response = await axios.post(`/api/orders`, orderData);
  return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await axios.put(`/api/orders/${orderId}/status`, { status });
  return response.data;
};
