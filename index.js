const express = require('express');
const app = express();
const PORT = 3000;

const Database = require('better-sqlite3');
const db = new Database('todos.db');

// Middleware to handle JSON
app.use(express.json());

// Serve frontend files
app.use(express.static('public'));

// Create table if it doesn't exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task TEXT,
    completed INTEGER DEFAULT 0
  )
`).run();


let id = 1;

// Get all todos
app.get('/todos', (req, res) => {
    const todos = db.prepare('SELECT * FROM todos').all();
    res.json(todos);
  });
  
  app.post('/todos', (req, res) => {
    const { task } = req.body;
    const info = db.prepare('INSERT INTO todos (task) VALUES (?)').run(task);
    const newTodo = { id: info.lastInsertRowid, task };
    res.status(201).json(newTodo);
  });
  
  app.delete('/todos/:id', (req, res) => {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM todos WHERE id = ?').run(id);
  
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Task not found.' });
    }
  
    res.status(204).end(); // No content
  });

  // Toggle complete/uncomplete
app.put('/todos/:id/complete', (req, res) => {
  const { id } = req.params;

  // Get the current status
  const current = db.prepare('SELECT completed FROM todos WHERE id = ?').get(id);

  if (!current) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  // Toggle 1 to 0 or 0 to 1
  const newStatus = current.completed === 1 ? 0 : 1;

  db.prepare('UPDATE todos SET completed = ? WHERE id = ?').run(newStatus, id);

  res.status(200).json({ message: 'Task completion status toggled.' });
});

  
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });