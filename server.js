const express = require('express');
const path = require('path');
const crypto = require('crypto');
const QRCode = require('qrcode');
const { getDb, run, get, all } = require('./db');
const questions = require('./questions.json');

const app = express();
const PORT = 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Category config
const CATEGORIES = {
  kierowcy: {
    label: 'Kierowcy',
    sections: ['I', 'II', 'III', 'IV', 'V'],
    count: 15,
    time: 15
  },
  dowodcy: {
    label: 'Dowódcy',
    sections: ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV'],
    count: 15,
    time: 15
  },
  stanowiska_kierowania: {
    label: 'Stanowiska Kierowania',
    sections: ['XVI'],
    count: 10,
    time: 10
  }
};

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Auth ---
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ ok: true });
  } else {
    res.status(401).json({ ok: false, error: 'Nieprawidłowe hasło' });
  }
});

function requireAuth(req, res, next) {
  const auth = req.headers['x-admin-password'];
  if (auth === ADMIN_PASSWORD) return next();
  res.status(401).json({ error: 'Brak autoryzacji' });
}

// --- Sessions ---
app.post('/api/sessions', requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    const id = crypto.randomBytes(4).toString('hex');
    run(db, 'INSERT INTO sessions (id) VALUES (?)', [id]);

    const host = req.headers.host;
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const base = `${protocol}://${host}`;

    const qrCodes = {};
    for (const [cat, cfg] of Object.entries(CATEGORIES)) {
      const url = `${base}/test/${id}/${cat}`;
      qrCodes[cat] = {
        url,
        label: cfg.label,
        dataUrl: await QRCode.toDataURL(url, { width: 250, margin: 2 })
      };
    }

    res.json({ id, qrCodes });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

app.get('/api/sessions', requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    const sessions = all(db, `
      SELECT s.id, s.created_at, s.active,
        COUNT(t.id) as result_count
      FROM sessions s
      LEFT JOIN test_results t ON t.session_id = s.id
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `);
    res.json(sessions);
  } catch (e) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

app.delete('/api/sessions/:id', requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    run(db, 'UPDATE sessions SET active = 0 WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
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

    const cfg = CATEGORIES[category];
    if (!cfg) return res.status(400).json({ error: 'Nieznana kategoria' });

    const pool = questions.filter(q => cfg.sections.includes(q.section_key));
    const shuffled = pool.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, cfg.count).map(q => ({
      id: q.id,
      section: q.section,
      section_key: q.section_key,
      question: q.question,
      answers: q.answers.map(a => ({ letter: a.letter, text: a.text }))
    }));

    res.json({
      sessionId,
      category,
      categoryLabel: cfg.label,
      count: cfg.count,
      timeMinutes: cfg.time,
      questions: selected
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

app.post('/api/test/:sessionId/:category/submit', async (req, res) => {
  try {
    const { sessionId, category } = req.params;
    const { participantName, unit, answers } = req.body;

    if (!participantName || !unit) return res.status(400).json({ error: 'Brak wymaganych danych' });

    const db = await getDb();
    const session = get(db, 'SELECT * FROM sessions WHERE id = ?', [sessionId]);
    if (!session) return res.status(404).json({ error: 'Sesja nie istnieje' });

    const cfg = CATEGORIES[category];
    if (!cfg) return res.status(400).json({ error: 'Nieznana kategoria' });

    let score = 0;
    const questionDetails = [];

    for (const [qIdStr, selectedLetter] of Object.entries(answers)) {
      const qId = parseInt(qIdStr);
      const q = questions.find(x => x.id === qId);
      if (!q) continue;
      const correct = q.answers.find(a => a.correct);
      const isCorrect = correct && correct.letter === selectedLetter;
      if (isCorrect) score++;
      questionDetails.push({
        id: q.id,
        section: q.section,
        section_key: q.section_key,
        question: q.question,
        selectedLetter,
        correctLetter: correct ? correct.letter : null,
        isCorrect
      });
    }

    run(db,
      `INSERT INTO test_results (session_id, participant_name, unit, category, questions_json, answers_json, score, total)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [sessionId, participantName, unit, category,
       JSON.stringify(questionDetails), JSON.stringify(answers), score, cfg.count]
    );

    res.json({ ok: true, score, total: cfg.count });
  } catch (e) {
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
      [req.params.sessionId]
    );
    res.json(results.map(r => ({
      ...r,
      questions_json: JSON.parse(r.questions_json),
      answers_json: JSON.parse(r.answers_json)
    })));
  } catch (e) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

app.get('/api/results', requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    const results = all(db, `
      SELECT t.*, s.created_at as session_created
      FROM test_results t
      JOIN sessions s ON s.id = t.session_id
      ORDER BY t.completed_at DESC
      LIMIT 200
    `);
    res.json(results);
  } catch (e) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// --- SPA routes ---
app.get('/test/:sessionId/:category', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test.html'));
});

app.get('/report/:sessionId', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'report.html'));
});

app.listen(PORT, () => {
  console.log(`PSP Inspekcja uruchomiona na porcie ${PORT}`);
});
