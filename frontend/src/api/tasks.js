import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/tasks`
  : "/api/tasks"; // Use relative URL for production (proxied or same origin)

// Fetch all tasks
export const fetchTasks = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Add a task
export const addTask = async (task) => {
  const response = await axios.post(API_URL, task);
  return response.data;
};

// Update a task
export const updateTask = async (id, task) => {
  const response = await axios.put(`${API_URL}/${id}`, task);
  return response.data;
};

// Delete a task
export const deleteTask = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
