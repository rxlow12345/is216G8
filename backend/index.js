// backend/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({ path: "../.env" });

import "./src/firebase.js"; // init Admin SDK
import taskRoutes from "./src/routes/tasks.js";

const app = express();
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/tasks", taskRoutes);

// Serve frontend build
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, "../frontend/dist");

app.use(express.static(distDir));
app.get("*", (req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

const PORT = process.env.PORT || 4100;
app.listen(PORT, () => console.log(`🐾 Critter Connect running on port ${PORT}`));
