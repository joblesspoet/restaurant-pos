import { API_BASE_URL } from "@constants/common";
import axios from "axios";

export const getAllAppUsers = async () => {
  const response = await axios.get(`/api/users`);
  return response.data;
};

export const createUser = async (userData) => {
  const response = await axios.post(`${API_BASE_URL}/api/users`, userData);
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await axios.put(`/api/users/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await axios.delete(`/api/users/${userId}`);
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await axios.get(`/api/users/${userId}`);
  return response.data;
};
