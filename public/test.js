let testData = null;
let timerInterval = null;
let secondsLeft = 0;
let totalSeconds = 0;
let submitted = false;
let currentIdx = 0;
let userAnswers = {};

const params = (() => {
  const parts = location.pathname.split('/');
  return { sessionId: parts[2], category: parts[3] };
})();

const CAT_LABELS = {
  kierowcy: 'TEST KIEROWCY',
  dowodcy: 'TEST DOWÓDCY',
  stanowiska_kierowania: 'TEST STANOWISK KIEROWANIA'
};

window.addEventListener('DOMContentLoaded', () => {
  loadTest();
});

function loadTest() {
  fetch(`/api/test/${params.sessionId}/${params.category}`)
    .then(r => r.json())
    .then(data => {
      if (data.error) { showError(data.error); return; }
      testData = data;

      document.getElementById('categoryBadge').textContent = CAT_LABELS[data.category] || data.category.toUpperCase();
      document.title = (CAT_LABELS[data.category] || data.category) + ' – PSP';

      document.getElementById('testInfoBoxes').innerHTML = `
        <div class="info-box"><div class="val">${data.count}</div><div class="lbl">Pytań</div></div>
        <div class="info-box"><div class="val">${data.timeMinutes}</div><div class="lbl">Minut</div></div>
        <div class="info-box"><div class="val">60%</div><div class="lbl">Próg zaliczenia</div></div>`;

      document.getElementById('loadingView').style.display = 'none';
      document.getElementById('startView').style.display = 'block';
    })
    .catch(() => showError('Nie można załadować testu. Sprawdź połączenie z internetem.'));
}

function showError(msg) {
  document.getElementById('loadingView').style.display = 'none';
  document.getElementById('errorView').style.display = 'block';
  document.getElementById('errorMsg').textContent = msg;
}

function startTest() {
  const unit = document.getElementById('unitName').value.trim();
  if (!unit) {
    const el = document.getElementById('startError');
    el.textContent = 'Proszę podać nazwę jednostki.';
    el.style.display = 'block';
    return;
  }

  document.getElementById('startError').style.display = 'none';
  document.getElementById('startView').style.display = 'none';
  document.getElementById('timerBar').style.display = 'flex';
  document.getElementById('testView').style.display = 'block';

  currentIdx = 0;
  userAnswers = {};
  renderQuestion(currentIdx);
  startTimer(testData.timeMinutes * 60);
}

function renderQuestion(idx) {
  const q = testData.questions[idx];
  const total = testData.questions.length;

  document.getElementById('questionCounter').textContent = `${idx + 1}/${total}`;

  const savedAnswer = userAnswers[q.id];

  let html = `
    <div class="question-card">
      <div class="question-number">Pytanie ${idx + 1} z ${total}</div>
      <div class="question-section">${escHtml(q.section)}</div>
      <div class="question-text">${escHtml(q.question)}</div>
      <div class="answers">`;

  q.answers.forEach(a => {
    const checked = savedAnswer === a.letter ? 'checked' : '';
    html += `<label class="answer-option">
      <input type="radio" name="qcurrent" value="${a.letter}" ${checked} onchange="onAnswerChange('${a.letter}')">
      <span class="answer-label">
        <span class="answer-letter">${a.letter}</span>
        <span>${escHtml(a.text)}</span>
      </span>
    </label>`;
  });

  html += `</div></div>`;
  document.getElementById('questionSlide').innerHTML = html;

  // Nav buttons
  document.getElementById('prevBtn').style.display = idx > 0 ? 'inline-flex' : 'none';

  const isLast = idx === total - 1;
  document.getElementById('nextBtn').style.display = isLast ? 'none' : 'inline-flex';
  document.getElementById('finishBtn').style.display = isLast ? 'inline-flex' : 'none';
}

function onAnswerChange(letter) {
  const q = testData.questions[currentIdx];
  userAnswers[q.id] = letter;
}

function nextQuestion() {
  if (currentIdx < testData.questions.length - 1) {
    currentIdx++;
    renderQuestion(currentIdx);
    window.scrollTo(0, 0);
  }
}

function prevQuestion() {
  if (currentIdx > 0) {
    currentIdx--;
    renderQuestion(currentIdx);
    window.scrollTo(0, 0);
  }
}

function startTimer(seconds) {
  secondsLeft = seconds;
  totalSeconds = seconds;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    secondsLeft--;
    updateTimerDisplay();
    if (secondsLeft <= 0) {
      clearInterval(timerInterval);
      submitTest(true);
    }
  }, 1000);
}

function updateTimerDisplay() {
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  document.getElementById('timerValue').textContent =
    `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;

  const pct = (secondsLeft / totalSeconds) * 100;
  document.getElementById('timerProgressBar').style.width = pct + '%';

  const bar = document.getElementById('timerBar');
  if (secondsLeft <= 120) bar.classList.add('warning');
  else bar.classList.remove('warning');
}

function submitTest(autoSubmit) {
  if (submitted) return;

  const answered = Object.keys(userAnswers).length;
  const total = testData.count;

  if (!autoSubmit && answered < total) {
    const unanswered = total - answered;
    if (!confirm(`Nie odpowiedziałeś/aś na ${unanswered} pytanie(nia). Czy na pewno zakończyć test?`)) return;
  }

  submitted = true;
  clearInterval(timerInterval);

  const unit = document.getElementById('unitName').value.trim();

  document.getElementById('submitBar') && (document.getElementById('submitBar').style.display = 'none');
  document.getElementById('timerBar').style.display = 'none';
  document.getElementById('testView').style.display = 'none';

  const loadDiv = document.getElementById('loadingView');
  loadDiv.style.display = 'block';
  loadDiv.innerHTML = '<div style="text-align:center;padding:60px 20px;"><div style="font-size:2rem;margin-bottom:12px;">📤</div><p>Wysyłanie wyników...</p></div>';

  fetch(`/api/test/${params.sessionId}/${params.category}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ participantName: 'Anonim', unit, answers: userAnswers })
  })
    .then(r => r.json())
    .then(() => {
      document.getElementById('loadingView').style.display = 'none';
      document.getElementById('thankYouView').style.display = 'block';
    })
    .catch(() => {
      document.getElementById('loadingView').style.display = 'none';
      showError('Błąd podczas wysyłania wyników. Skontaktuj się z administratorem.');
    });
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
