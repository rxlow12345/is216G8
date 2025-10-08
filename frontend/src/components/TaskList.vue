<template>
  <div class="task-container">
    <h1>Tasks</h1>
    <input v-model="newTask" @keyup.enter="handleAddTask" placeholder="New Task" />
    <ul>
      <li v-for="task in tasks" :key="task.id">
        {{ task.title }} - {{ task.status }}
        <button @click="handleDeleteTask(task.id)">Delete</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { fetchTasks, addTask, deleteTask } from "../api/tasks.js";
import "./TaskList.css"; // <-- Import the CSS file
import http from "../api/http"; // http.get("/tasks")


const tasks = ref([]);
const newTask = ref("");

// Load tasks when component mounts
const loadTasks = async () => {
  tasks.value = await fetchTasks();
};

onMounted(loadTasks);

// Add a task
const handleAddTask = async () => {
  if (!newTask.value) return;
  await addTask({ title: newTask.value, status: "todo" });
  newTask.value = "";
  await loadTasks();
};

// Delete a task
const handleDeleteTask = async (id) => {
  await deleteTask(id);
  await loadTasks();
};

</script>
