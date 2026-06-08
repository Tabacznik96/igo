const express = require('express');
const path = require('path');
const crypto = require('crypto');
const QRCode = require('qrcode');
const { getDb, run, get, all, hashPassword } = require('./db');
const questions = require('./questions.json');

const app = express();
const PORT = 3000;

const BASE_SECTIONS = {
  kierowcy:              ['I', 'II', 'III', 'IV'],
  dowodcy:               ['I', 'II', 'III', 'V', 'VI', 'VIII', 'X', 'XII', 'XIII', 'XV'],
  stanowiska_kierowania: ['XVI']
};

const SPEC_SECTIONS = {
  chemical: ['VII'],
  sar:      ['IX'],
  water:    ['XI'],
  heights:  ['XIV']
};

const CAT_META = {
  kierowcy:              { label: 'Kierowcy',              count: 15, time: 15 },
  dowodcy:               { label: 'Dowódcy',               count: 15, time: 15 },
  stanowiska_kierowania: { label: 'Stanowiska Kierowania', count: 10, time: 10 }
};

function buildSections(category, specializations = []) {
  const base = [...BASE_SECTIONS[category]];
  if (category === 'dowodcy') {
    for (const spec of specializations) {
      if (SPEC_SECTIONS[spec]) base.push(...SPEC_SECTIONS[spec]);
    }
  }
  return [...new Set(base)];
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Auth ---
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ ok: false, error: 'Brak danych' });
    const db = await getDb();
    const user = get(db, 'SELECT * FROM users WHERE username = ? AND password_hash = ?',
      [username, hashPassword(password)]);
    if (!user) return res.status(401).json({ ok: false, error: 'Nieprawidłowy login lub hasło' });
    res.json({ ok: true, userId: user.id, displayName: user.display_name, role: user.role });
  } catch(e) {
    res.status(500).json({ ok: false, error: 'Błąd serwera' });
  }
});

async function requireAuth(req, res, next) {
  const username = req.headers['x-username'];
  const pwdHash = req.headers['x-password-hash'];
  if (!username || !pwdHash) return res.status(401).json({ error: 'Brak autoryzacji' });
  try {
    const db = await getDb();
    const user = get(db, 'SELECT * FROM users WHERE username = ? AND password_hash = ?', [username, pwdHash]);
    if (!user) return res.status(401).json({ error: 'Brak autoryzacji' });
    req.user = user;
    next();
  } catch(e) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
}

async function requireAdmin(req, res, next) {
  await requireAuth(req, res, async () => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Brak uprawnień' });
    next();
  });
}

// --- Users (admin only) ---
app.get('/api/users', requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const users = all(db, 'SELECT id, username, display_name, role, created_at FROM users ORDER BY id');
    res.json(users);
  } catch(e) { res.status(500).json({ error: 'Błąd serwera' }); }
});

app.post('/api/users', requireAdmin, async (req, res) => {
  try {
    const { username, password, display_name, role } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Brak danych' });
    const db = await getDb();
    const existing = get(db, 'SELECT id FROM users WHERE username = ?', [username]);
    if (existing) return res.status(400).json({ error: 'Login już istnieje' });
    run(db, 'INSERT INTO users (username, password_hash, display_name, role) VALUES (?,?,?,?)',
      [username, hashPassword(password), display_name || username, role || 'user']);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: 'Błąd serwera' }); }
});

app.delete('/api/users/:id', requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const user = get(db, 'SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (user && user.username === 'admin') return res.status(400).json({ error: 'Nie można usunąć głównego admina' });
    run(db, 'DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: 'Błąd serwera' }); }
});

app.put('/api/users/:id/password', requireAdmin, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Brak hasła' });
    const db = await getDb();
    run(db, 'UPDATE users SET password_hash = ? WHERE id = ?', [hashPassword(password), req.params.id]);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: 'Błąd serwera' }); }
});

// --- Sessions ---
app.post('/api/sessions', requireAuth, async (req, res) => {
  try {
    const { name, specializations = [] } = req.body;
    if (!name) return res.status(400).json({ error: 'Brak nazwy sesji' });

    const db = await getDb();
    const id = crypto.randomBytes(4).toString('hex');
    run(db, 'INSERT INTO sessions (id, name, specializations, created_by) VALUES (?, ?, ?, ?)',
      [id, name, JSON.stringify(specializations), req.user.id]);

    const host = req.headers.host;
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const base = `${protocol}://${host}`;

    const qrCodes = {};
    for (const cat of Object.keys(CAT_META)) {
      const url = `${base}/test/${id}/${cat}`;
      qrCodes[cat] = { url, label: CAT_META[cat].label,
        dataUrl: await QRCode.toDataURL(url, { width: 250, margin: 2 }) };
    }

    res.json({ id, name, qrCodes });
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

app.get('/api/sessions', requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    const sessions = all(db, `
      SELECT s.id, s.name, s.specializations, s.created_at, s.active,
        COUNT(t.id) as result_count,
        u.display_name as created_by_name
      FROM sessions s
      LEFT JOIN test_results t ON t.session_id = s.id
      LEFT JOIN users u ON u.id = s.created_by
      GROUP BY s.id ORDER BY s.created_at DESC`);
    res.json(sessions);
  } catch(e) { res.status(500).json({ error: 'Błąd serwera' }); }
});

app.get('/api/sessions/:id', requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    const session = get(db, `
      SELECT s.*, u.display_name as created_by_name
      FROM sessions s LEFT JOIN users u ON u.id = s.created_by
      WHERE s.id = ?`, [req.params.id]);
    if (!session) return res.status(404).json({ error: 'Sesja nie istnieje' });
    res.json(session);
  } catch(e) { res.status(500).json({ error: 'Błąd serwera' }); }
});

app.delete('/api/sessions/:id', requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    run(db, 'UPDATE sessions SET active = 0 WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: 'Błąd serwera' }); }
});

app.get('/api/sessions/:id/qr', requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    const session = get(db, 'SELECT * FROM sessions WHERE id = ?', [req.params.id]);
    if (!session) return res.status(404).json({ error: 'Sesja nie istnieje' });

    const host = req.headers.host;
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const base = `${protocol}://${host}`;

    const qrCodes = {};
    for (const cat of Object.keys(CAT_META)) {
      const url = `${base}/test/${session.id}/${cat}`;
      qrCodes[cat] = { url, label: CAT_META[cat].label,
        dataUrl: await QRCode.toDataURL(url, { width: 250, margin: 2 }) };
    }

    res.json({ id: session.id, name: session.name || session.id, qrCodes });
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// --- Test ---
app.get('/api/test/:sessionId/:category', async (req, res) => {
  try {
    const { sessionId, category } = req.params;
    const db = await getDb();
    const session = get(db, 'SELECT * FROM sessions WHERE id = ? AND active = 1', [sessionId]);
    if (!session) return res.status(404).json({ error: 'Sesja nie istnieje lub jest nieaktywna' });

    const meta = CAT_META[category];
    if (!meta) return res.status(400).json({ error: 'Nieznana kategoria' });

    const specializations = session.specializations ? JSON.parse(session.specializations) : [];
    const sections = buildSections(category, specializations);
    const pool = questions.filter(q => sections.includes(q.section_key));
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, meta.count).map(q => ({
      id: q.id, section: q.section, section_key: q.section_key,
      question: q.question, answers: q.answers.map(a => ({ letter: a.letter, text: a.text }))
    }));

    res.json({ sessionId, category, categoryLabel: meta.label,
      count: meta.count, timeMinutes: meta.time, questions: selected });
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

app.post('/api/test/:sessionId/:category/submit', async (req, res) => {
  try {
    const { sessionId, category } = req.params;
    const { participantName, unit, answers } = req.body;
    if (!unit) return res.status(400).json({ error: 'Brak wymaganych danych' });

    const db = await getDb();
    const session = get(db, 'SELECT * FROM sessions WHERE id = ?', [sessionId]);
    if (!session) return res.status(404).json({ error: 'Sesja nie istnieje' });

    const meta = CAT_META[category];
    if (!meta) return res.status(400).json({ error: 'Nieznana kategoria' });

    let score = 0;
    const questionDetails = [];
    for (const [qIdStr, selectedLetter] of Object.entries(answers)) {
      const q = questions.find(x => x.id === parseInt(qIdStr));
      if (!q) continue;
      const correct = q.answers.find(a => a.correct);
      const isCorrect = correct && correct.letter === selectedLetter;
      if (isCorrect) score++;
      questionDetails.push({
        id: q.id, section: q.section, section_key: q.section_key,
        question: q.question, selectedLetter,
        correctLetter: correct ? correct.letter : null, isCorrect
      });
    }

    run(db,
      `INSERT INTO test_results (session_id, participant_name, unit, category, questions_json, answers_json, score, total)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [sessionId, participantName || 'Anonim', unit, category,
       JSON.stringify(questionDetails), JSON.stringify(answers), score, meta.count]);

    res.json({ ok: true, score, total: meta.count });
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// --- Results ---
app.get('/api/results/:sessionId', requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    const results = all(db,
      `SELECT * FROM test_results WHERE session_id = ? ORDER BY completed_at ASC`,
      [req.params.sessionId]);
    res.json(results.map(r => ({
      ...r, questions_json: JSON.parse(r.questions_json), answers_json: JSON.parse(r.answers_json)
    })));
  } catch(e) { res.status(500).json({ error: 'Błąd serwera' }); }
});

app.get('/api/results', requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    const results = all(db, `
      SELECT t.*, s.name as session_name
      FROM test_results t JOIN sessions s ON s.id = t.session_id
      ORDER BY t.completed_at DESC LIMIT 200`);
    res.json(results);
  } catch(e) { res.status(500).json({ error: 'Błąd serwera' }); }
});

// --- Learning API (public) ---
app.get('/api/nauka/sections', (req, res) => {
  const seen = {};
  for (const q of questions) {
    if (!seen[q.section_key]) seen[q.section_key] = { key: q.section_key, name: q.section, count: 0 };
    seen[q.section_key].count++;
  }
  const order = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI'];
  res.json(order.filter(k => seen[k]).map(k => seen[k]));
});

app.get('/api/nauka/questions', (req, res) => {
  const { sections, from, count } = req.query;
  const sectionList = sections ? sections.split(',') : null;
  let pool = sectionList ? questions.filter(q => sectionList.includes(q.section_key)) : [...questions];
  pool = [...pool].sort(() => Math.random() - 0.5);
  const start = Math.max(0, parseInt(from || 0));
  const n = Math.min(parseInt(count || 20), 50);
  const selected = pool.slice(start, start + n).map(q => ({
    id: q.id, section: q.section, section_key: q.section_key, question: q.question,
    answers: q.answers.map(a => ({ letter: a.letter, text: a.text })),
    correctLetter: (q.answers.find(a => a.correct) || {}).letter
  }));
  res.json({ total: pool.length, from: start, questions: selected });
});

// --- Print ---
app.get('/api/print/:sessionId/:category', requireAuth, async (req, res) => {
  try {
    const { sessionId, category } = req.params;
    const db = await getDb();
    const session = get(db, 'SELECT * FROM sessions WHERE id = ?', [sessionId]);
    if (!session) return res.status(404).json({ error: 'Sesja nie istnieje' });

    const meta = CAT_META[category];
    if (!meta) return res.status(400).json({ error: 'Nieznana kategoria' });

    const specializations = session.specializations ? JSON.parse(session.specializations) : [];
    const sections = buildSections(category, specializations);
    const pool = questions.filter(q => sections.includes(q.section_key));
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, meta.count);

    res.json({ session: { id: session.id, name: session.name || session.id },
      category, categoryLabel: meta.label, questions: selected });
  } catch(e) { res.status(500).json({ error: 'Błąd serwera' }); }
});

// --- SPA routes ---
app.get('/test/:sessionId/:category', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'test.html')));
app.get('/report/:sessionId', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'report.html')));
app.get('/session/:sessionId', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'session.html')));
app.get('/print/:sessionId/:category', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'print.html')));

app.listen(PORT, () => console.log(`PSP Inspekcja uruchomiona na porcie ${PORT}`));
