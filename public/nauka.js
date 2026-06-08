let allSections = [];
let selectedSections = new Set();
let quizQuestions = [];
let currentIdx = 0;
let answers = []; // { correct: bool }
let answered = false;
let lastConfig = null;

window.addEventListener('DOMContentLoaded', loadSections);

function loadSections() {
  fetch('/api/nauka/sections')
    .then(r => r.json())
    .then(data => {
      allSections = data;
      renderSections();
    });
}

function renderSections() {
  const grid = document.getElementById('sectionGrid');
  grid.innerHTML = allSections.map(s => `
    <div class="section-card ${selectedSections.has(s.key) ? 'selected' : ''}"
         onclick="toggleSection('${s.key}')" id="sec-${s.key}">
      <div class="sec-key">${s.key}</div>
      <div class="sec-info">
        <div class="sec-name">${escHtml(s.name)}</div>
        <div class="sec-count">${s.count} pytań</div>
      </div>
    </div>`).join('');
  updateSelectionInfo();
}

function toggleSection(key) {
  if (selectedSections.has(key)) selectedSections.delete(key);
  else selectedSections.add(key);
  renderSections();
}

function selectAll() {
  allSections.forEach(s => selectedSections.add(s.key));
  renderSections();
}

function selectNone() {
  selectedSections.clear();
  renderSections();
}

function updateSelectionInfo() {
  const total = allSections.filter(s => selectedSections.has(s.key)).reduce((a, s) => a + s.count, 0);
  const el = document.getElementById('selectionInfo');
  el.textContent = selectedSections.size > 0
    ? `Wybrano ${selectedSections.size} dział(ów), łącznie ${total} pytań w puli.`
    : 'Nie wybrano żadnego działu.';
}

function selectAllAndStart() {
  selectAll();
  document.getElementById('questionCount').value = 20;
  document.getElementById('fromQuestion').value = 1;
  startQuiz();
}

function startQuiz() {
  if (selectedSections.size === 0) { alert('Wybierz co najmniej jeden dział.'); return; }

  const count = Math.min(50, Math.max(5, parseInt(document.getElementById('questionCount').value) || 20));
  const from = Math.max(0, parseInt(document.getElementById('fromQuestion').value || 1) - 1);
  const sections = [...selectedSections].join(',');

  lastConfig = { count, from, sections };

  fetch(`/api/nauka/questions?sections=${encodeURIComponent(sections)}&from=${from}&count=${count}`)
    .then(r => r.json())
    .then(data => {
      quizQuestions = data.questions;
      if (!quizQuestions.length) { alert('Brak pytań dla wybranych ustawień.'); return; }
      currentIdx = 0;
      answers = [];
      answered = false;
      showView('quizView');
      renderQuizQuestion();
    });
}

function renderQuizQuestion() {
  const q = quizQuestions[currentIdx];
  const total = quizQuestions.length;
  answered = false;

  document.getElementById('quizProgress').textContent = `${currentIdx + 1} / ${total}`;

  // progress dots
  const dots = document.getElementById('progressDots');
  dots.innerHTML = quizQuestions.map((_, i) => {
    let cls = 'dot';
    if (i === currentIdx) cls += ' current';
    else if (answers[i] !== undefined) cls += answers[i].correct ? ' ok' : ' err';
    return `<div class="${cls}"></div>`;
  }).join('');

  const container = document.getElementById('quizQuestion');
  container.innerHTML = `
    <div class="question-card" id="qcard">
      <div class="question-number">Pytanie ${currentIdx + 1} z ${total}</div>
      <div class="question-section">${escHtml(q.section)}</div>
      <div class="question-text">${escHtml(q.question)}</div>
      <div class="answers" id="answersContainer">
        ${q.answers.map(a => `
          <label class="answer-option" id="opt-${a.letter}">
            <input type="radio" name="qnauka" value="${a.letter}" onchange="onNaukaAnswer('${a.letter}', '${q.correctLetter}')">
            <span class="answer-label">
              <span class="answer-letter">${a.letter}</span>
              <span>${escHtml(a.text)}</span>
            </span>
          </label>`).join('')}
      </div>
      <div id="feedbackBox"></div>
      <div id="navButtons" style="display:none; margin-top:16px; display:none;">
        ${currentIdx < total - 1
          ? `<button class="btn btn-danger" onclick="nextQuestion()">Następne pytanie →</button>`
          : `<button class="btn btn-danger" onclick="finishQuiz()">📊 Zobacz wyniki</button>`}
      </div>
    </div>`;
}

function onNaukaAnswer(selected, correct) {
  if (answered) return;
  answered = true;
  const isCorrect = selected === correct;
  answers[currentIdx] = { correct: isCorrect };

  // disable all inputs
  document.querySelectorAll('input[name="qnauka"]').forEach(inp => inp.disabled = true);

  // highlight
  document.querySelectorAll('.answer-option').forEach(opt => {
    const inp = opt.querySelector('input');
    if (inp.value === correct) opt.classList.add('answer-correct');
    else if (inp.value === selected && !isCorrect) opt.classList.add('answer-wrong');
  });

  // feedback
  const fb = document.getElementById('feedbackBox');
  fb.innerHTML = isCorrect
    ? `<div class="feedback-box feedback-ok">✅ Poprawnie!</div>`
    : `<div class="feedback-box feedback-err">❌ Błąd. Prawidłowa odpowiedź: <strong>${correct}</strong></div>`;

  // show nav
  const nav = document.getElementById('navButtons');
  nav.style.display = 'block';

  // update dots
  renderQuizQuestion._updateDots && renderQuizQuestion._updateDots();
  const dots = document.getElementById('progressDots');
  const allDots = dots.querySelectorAll('.dot');
  if (allDots[currentIdx]) {
    allDots[currentIdx].classList.remove('current');
    allDots[currentIdx].classList.add(isCorrect ? 'ok' : 'err');
  }
}

function nextQuestion() {
  currentIdx++;
  renderQuizQuestion();
  window.scrollTo(0, 0);
}

function finishQuiz() {
  const correct = answers.filter(a => a && a.correct).length;
  const total = quizQuestions.length;
  const pct = Math.round(correct / total * 100);

  document.getElementById('resultScore').textContent = `${correct} / ${total} (${pct}%)`;
  document.getElementById('resultDetails').textContent =
    pct >= 60 ? '✅ Wynik powyżej progu zaliczenia (60%)' : '❌ Wynik poniżej progu zaliczenia (60%)';

  showView('resultView');
}

function endQuiz() {
  if (currentIdx > 0 && !confirm('Przerwać sesję nauki?')) return;
  showView('sectionSelectView');
}

function restartQuiz() {
  if (!lastConfig) { backToConfig(); return; }
  const { count, from, sections } = lastConfig;
  fetch(`/api/nauka/questions?sections=${encodeURIComponent(sections)}&from=${from}&count=${count}`)
    .then(r => r.json())
    .then(data => {
      quizQuestions = data.questions;
      currentIdx = 0;
      answers = [];
      answered = false;
      showView('quizView');
      renderQuizQuestion();
    });
}

function backToConfig() {
  showView('sectionSelectView');
}

function showView(id) {
  ['sectionSelectView', 'quizView', 'resultView'].forEach(v => {
    document.getElementById(v).style.display = v === id ? (id === 'quizView' ? 'block' : 'block') : 'none';
  });
  window.scrollTo(0, 0);
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
