import axios from "axios";

// Support both localhost (via proxy) and cloud (via VITE_API_URL)
let API_URL = '/api/tasks'; // Default: relative path (uses Vite proxy in dev)

if (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('localhost')) {
  // Production: use full URL, check if /api is already included
  const viteUrl = import.meta.env.VITE_API_URL;
  if (viteUrl.endsWith('/api')) {
    API_URL = `${viteUrl}/tasks`;
  } else {
    API_URL = `${viteUrl}/api/tasks`;
  }
} else {
  // Localhost or no VITE_API_URL: use relative path (Vite proxy)
  API_URL = '/api/tasks';
}

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
