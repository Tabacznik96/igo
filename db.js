const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, 'data.db');

let _db = null;

function hashPassword(pwd) {
  return crypto.createHash('sha256').update(pwd).digest('hex');
}

async function getDb() {
  if (_db) return _db;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buf = fs.readFileSync(DB_PATH);
    _db = new SQL.Database(buf);
  } else {
    _db = new SQL.Database();
  }

  _db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      name TEXT,
      specializations TEXT DEFAULT '[]',
      created_by INTEGER,
      created_at DATETIME DEFAULT (datetime('now')),
      active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS test_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      participant_name TEXT NOT NULL,
      unit TEXT NOT NULL,
      category TEXT NOT NULL,
      questions_json TEXT NOT NULL,
      answers_json TEXT NOT NULL,
      score INTEGER NOT NULL,
      total INTEGER NOT NULL,
      completed_at DATETIME DEFAULT (datetime('now')),
      FOREIGN KEY (session_id) REFERENCES sessions(id)
    );

    CREATE TABLE IF NOT EXISTS protocols (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      unit TEXT NOT NULL,
      unit_type TEXT NOT NULL,
      sections_json TEXT DEFAULT '{}',
      total_points REAL DEFAULT 0,
      max_points INTEGER DEFAULT 100,
      grade INTEGER DEFAULT 0,
      notes TEXT DEFAULT '',
      created_by INTEGER,
      created_at DATETIME DEFAULT (datetime('now')),
      updated_at DATETIME DEFAULT (datetime('now')),
      FOREIGN KEY (session_id) REFERENCES sessions(id)
    );
  `);

  // Migrations
  try { _db.run("ALTER TABLE sessions ADD COLUMN name TEXT"); } catch(e) {}
  try { _db.run("ALTER TABLE sessions ADD COLUMN specializations TEXT DEFAULT '[]'"); } catch(e) {}
  try { _db.run("ALTER TABLE sessions ADD COLUMN created_by INTEGER"); } catch(e) {}

  // Ensure default admin exists
  const admin = get(_db, "SELECT id FROM users WHERE username = 'admin'", []);
  if (!admin) {
    _db.run("INSERT INTO users (username, password_hash, display_name, role) VALUES (?, ?, ?, ?)",
      ['admin', hashPassword('admin123'), 'Administrator', 'admin']);
  }

  save();
  return _db;
}

function save() {
  if (!_db) return;
  const data = _db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function run(db, sql, params) {
  db.run(sql, params);
  save();
}

function get(db, sql, params) {
  const stmt = db.prepare(sql);
  stmt.bind(params || []);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

function all(db, sql, params) {
  const result = db.exec(sql, params);
  if (!result.length) return [];
  const { columns, values } = result[0];
  return values.map(row => {
    const obj = {};
    columns.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
}

module.exports = { getDb, run, get, all, save, hashPassword };
