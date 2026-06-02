const express = require('express');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'gorj-booking-secret-2026';
const ROOT_DIR = path.join(__dirname, 'files');
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'gorjbooking.db');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

const db = new sqlite3.Database(DB_FILE, err => {
  if (err) {
    console.error('Unable to open database:', err);
    process.exit(1);
  }
});

app.use(express.json());
app.use(express.static(ROOT_DIR));

function initializeDatabase() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        firstName TEXT,
        lastName TEXT,
        email TEXT,
        accommodation TEXT,
        checkin TEXT,
        checkout TEXT,
        guests TEXT,
        message TEXT,
        createdAt TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);
  });
}

function createToken(user) {
  return jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Autentificare necesară.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token invalid.' });
    }

    const email = decoded.email;
    db.get('SELECT id, name, email FROM users WHERE email = ?', [email], (err2, user) => {
      if (err2) {
        return res.status(500).json({ error: 'Eroare server.' });
      }
      if (!user) {
        return res.status(401).json({ error: 'Utilizator inexistent.' });
      }
      req.user = user;
      next();
    });
  });
}

app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Toate câmpurile sunt obligatorii.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name.trim(), normalizedEmail, hashedPassword],
    function (err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
          return res.status(400).json({ error: 'Există deja un cont cu acest email.' });
        }
        return res.status(500).json({ error: 'Eroare server.' });
      }

      const user = { id: this.lastID, name: name.trim(), email: normalizedEmail };
      const token = createToken(user);
      return res.json({ user, token });
    }
  );
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email și parolă sunt obligatorii.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  db.get('SELECT id, name, email, password FROM users WHERE email = ?', [normalizedEmail], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Eroare server.' });
    }
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Date incorecte. Verifică email-ul și parola.' });
    }

    const token = createToken(user);
    res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
  });
});

app.get('/api/profile', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

app.get('/api/bookings', authMiddleware, (req, res) => {
  db.all(
    'SELECT id, firstName, lastName, email, accommodation, checkin, checkout, guests, message, createdAt FROM bookings WHERE user_id = ? ORDER BY id DESC',
    [req.user.id],
    (err, bookings) => {
      if (err) {
        return res.status(500).json({ error: 'Eroare server.' });
      }
      res.json({ bookings });
    }
  );
});

app.post('/api/bookings', authMiddleware, (req, res) => {
  const { firstName, lastName, email, accommodation, checkin, checkout, guests, message } = req.body;
  if (!accommodation || !checkin || !checkout) {
    return res.status(400).json({ error: 'Câmpurile obligatorii nu sunt completate.' });
  }

  const createdAt = new Date().toISOString();
  db.run(
    'INSERT INTO bookings (user_id, firstName, lastName, email, accommodation, checkin, checkout, guests, message, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [req.user.id, firstName || '', lastName || '', email || req.user.email, accommodation, checkin, checkout, guests || '', message || '', createdAt],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Eroare server.' });
      }
      res.json({ booking: { id: this.lastID, firstName, lastName, email, accommodation, checkin, checkout, guests, message, createdAt } });
    }
  );
});

app.get('*', (req, res) => {
  res.sendFile(path.join(ROOT_DIR, 'index.html'));
});

initializeDatabase();

app.listen(PORT, () => {
  console.log(`Gorj Booking backend started on http://localhost:${PORT}`);
});
