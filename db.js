// SQLite via sql.js (pure JS, no native bindings needed)
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data.db');

let _db = null;

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
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      name TEXT,
      specializations TEXT DEFAULT '[]',
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
  `);

  // Migrate: add columns if they don't exist
  try { _db.run("ALTER TABLE sessions ADD COLUMN name TEXT"); } catch(e) {}
  try { _db.run("ALTER TABLE sessions ADD COLUMN specializations TEXT DEFAULT '[]'"); } catch(e) {}

  save();
  return _db;
}

function save() {
  if (!_db) return;
  const data = _db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

// Helper: run a query (INSERT/UPDATE/DELETE) and save
function run(db, sql, params) {
  db.run(sql, params);
  save();
}

// Helper: get one row
function get(db, sql, params) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

// Helper: get all rows
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

module.exports = { getDb, run, get, all, save };
