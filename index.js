const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

// Middleware para parsear JSON
app.use(express.json());

app.get('/', (req, res) => {
  res.send('¡Bienvenido a la API de tareas!');
});

// Conexión a la base de datos SQLite
const db = new sqlite3.Database('./tasks.db', (err) => {
  if (err) {
    return console.error('Error al conectar con la base de datos:', err.message);
  }
  console.log('Conectado a la base de datos SQLite.');
});

// Crear tabla si no existe
db.run(`CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  completed INTEGER DEFAULT 0
)`);

// Ruta raíz
app.get('/', (req, res) => {
  res.send('¡Bienvenido a la API de tareas!');
});

// Obtener todas las tareas
app.get('/tasks', (req, res) => {
  db.all('SELECT * FROM tasks', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Crear una nueva tarea
app.post('/tasks', (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'El título es obligatorio.' });
  }

  db.run('INSERT INTO tasks (title) VALUES (?)', [title], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, title, completed: 0 });
  });
});

// Marcar tarea como completada
app.put('/tasks/:id', (req, res) => {
  const id = req.params.id;
  db.run('UPDATE tasks SET completed = 1 WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.json({ message: 'Tarea actualizada correctamente' });
  });
});

// Eliminar tarea
app.delete('/tasks/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM tasks WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.json({ message: 'Tarea eliminada correctamente' });
  });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`API escuchando en http://localhost:${port}`);
});
