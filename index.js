const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Replace this with your Supabase connection string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required by Supabase
});

// Test route
app.get("/ping", (req, res) => {
  res.send("pong");
});

// Get all todos
app.get("/todos", async (req, res) => {
  const result = await pool.query("SELECT * FROM todos ORDER BY id DESC");
  res.json(result.rows);
});

// Add a new todo
app.post("/todos", async (req, res) => {
  const { task } = req.body;
  await pool.query("INSERT INTO todos (task) VALUES ($1)", [task]);
  res.status(201).json({ message: "Todo added" });
});

// Toggle completed
app.put("/todos/:id/complete", async (req, res) => {
  const { id } = req.params;
  const result = await pool.query("SELECT completed FROM todos WHERE id = $1", [id]);
  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Task not found" });
  }
  const newStatus = !result.rows[0].completed;
  await pool.query("UPDATE todos SET completed = $1 WHERE id = $2", [newStatus, id]);
  res.status(200).json({ message: "Todo toggled" });
});

// Edit a todo
app.put("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { task } = req.body;
  await pool.query("UPDATE todos SET task = $1 WHERE id = $2", [task, id]);
  res.status(200).json({ message: "Todo updated" });
});

// Delete a todo
app.delete("/todos/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM todos WHERE id = $1", [id]);
  res.status(200).json({ message: "Todo deleted" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
