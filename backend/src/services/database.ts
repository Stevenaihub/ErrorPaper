import sqlite3 from 'sqlite3';

const db = new sqlite3.Database(':memory:'); // for demonstration, using in-memory database

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
  )`);

  const stmt = db.prepare(`INSERT INTO users (name, email) VALUES (?, ?)`);
  stmt.run('Alice', 'alice@example.com');
  stmt.run('Bob', 'bob@example.com');
  stmt.finalize();

  db.each(`SELECT id, name, email FROM users`, (err, row) => {
    console.log(row.id + ': ' + row.name + ', ' + row.email);
  });
});

// Close the database connection
process.on('exit', () => {
  db.close();
});
