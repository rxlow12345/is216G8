// src/controllers/taskController.js
import { db } from "../firebase.js"; // Import the initialized Firestore

// GET all tasks
export const getTasks = async (req, res) => {
  try {
    const snapshot = await db.collection("tasks").get();
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// POST a new task
export const addTask = async (req, res) => {
  try {
    const { title, status } = req.body;
    if (!title || !status) {
      return res.status(400).json({ error: "Title and status are required" });
    }
    const docRef = await db.collection("tasks").add({ title, status });
    res.json({ id: docRef.id, title, status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// PUT (update) a task by ID
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, status } = req.body;
    const taskRef = db.collection("tasks").doc(id);

    const doc = await taskRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Task not found" });
    }

    await taskRef.update({ title, status });
    res.json({ id, title, status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// DELETE a task by ID
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const taskRef = db.collection("tasks").doc(id);

    const doc = await taskRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Task not found" });
    }

    await taskRef.delete();
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
