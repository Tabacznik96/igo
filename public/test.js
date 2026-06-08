// PSP Test Page JS
let testData = null;
let timerInterval = null;
let secondsLeft = 0;
let totalSeconds = 0;
let submitted = false;

const params = (() => {
  const parts = location.pathname.split('/');
  // /test/{sessionId}/{category}
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
      if (data.error) {
        showError(data.error);
        return;
      }
      testData = data;

      const badgeEl = document.getElementById('categoryBadge');
      const titleEl = document.getElementById('testTitle');
      badgeEl.textContent = CAT_LABELS[data.category] || data.category.toUpperCase();
      titleEl.textContent = 'Inspekcja Gotowości Operacyjnej';

      document.title = (CAT_LABELS[data.category] || data.category) + ' – PSP';

      // Info boxes
      document.getElementById('testInfoBoxes').innerHTML = `
        <div class="info-box">
          <div class="val">${data.count}</div>
          <div class="lbl">Pytań</div>
        </div>
        <div class="info-box">
          <div class="val">${data.timeMinutes}</div>
          <div class="lbl">Minut</div>
        </div>
        <div class="info-box">
          <div class="val">60%</div>
          <div class="lbl">Próg zaliczenia</div>
        </div>`;

      document.getElementById('loadingView').style.display = 'none';
      document.getElementById('startView').style.display = 'block';
    })
    .catch(err => {
      showError('Nie można załadować testu. Sprawdź połączenie z internetem.');
    });
}

function showError(msg) {
  document.getElementById('loadingView').style.display = 'none';
  document.getElementById('errorView').style.display = 'block';
  document.getElementById('errorMsg').textContent = msg;
}

function startTest() {
  const name = document.getElementById('participantName').value.trim();
  const unit = document.getElementById('unitName').value.trim();

  if (!name || !unit) {
    const el = document.getElementById('startError');
    el.textContent = 'Proszę uzupełnić imię i nazwisko oraz jednostkę.';
    el.style.display = 'block';
    return;
  }

  document.getElementById('startError').style.display = 'none';
  document.getElementById('startView').style.display = 'none';

  renderQuestions();
  startTimer(testData.timeMinutes * 60);

  document.getElementById('timerBar').style.display = 'flex';
  document.getElementById('testView').style.display = 'block';
  document.getElementById('submitBar').style.display = 'flex';
  document.getElementById('totalProgress').textContent = testData.count;
  document.getElementById('answeredCount').textContent = `0/${testData.count}`;
}

function renderQuestions() {
  const container = document.getElementById('questionsContainer');
  let html = '';

  testData.questions.forEach((q, idx) => {
    html += `<div class="question-card" id="qcard-${q.id}">
      <div class="question-number">Pytanie ${idx + 1} z ${testData.count}</div>
      <div class="question-section">${q.section}</div>
      <div class="question-text">${escHtml(q.question)}</div>
      <div class="answers">`;

    q.answers.forEach(a => {
      html += `<label class="answer-option">
        <input type="radio" name="q${q.id}" value="${a.letter}" onchange="onAnswerChange()">
        <span class="answer-label">
          <span class="answer-letter">${a.letter}</span>
          <span>${escHtml(a.text)}</span>
        </span>
      </label>`;
    });

    html += `</div></div>`;
  });

  container.innerHTML = html;
}

function onAnswerChange() {
  const answered = countAnswered();
  document.getElementById('answeredProgress').textContent = answered;
  document.getElementById('answeredCount').textContent = `${answered}/${testData.count}`;
}

function countAnswered() {
  let count = 0;
  testData.questions.forEach(q => {
    const checked = document.querySelector(`input[name="q${q.id}"]:checked`);
    if (checked) count++;
  });
  return count;
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
  const val = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  document.getElementById('timerValue').textContent = val;

  const pct = (secondsLeft / totalSeconds) * 100;
  document.getElementById('timerProgressBar').style.width = pct + '%';

  const bar = document.getElementById('timerBar');
  if (secondsLeft <= 120) {
    bar.classList.add('warning');
  } else {
    bar.classList.remove('warning');
  }
}

function submitTest(autoSubmit) {
  if (submitted) return;

  const answered = countAnswered();
  const total = testData.count;

  if (!autoSubmit && answered < total) {
    const unanswered = total - answered;
    if (!confirm(`Nie odpowiedziałeś/aś na ${unanswered} pytanie(nia). Czy na pewno chcesz zakończyć test?`)) {
      return;
    }
  }

  submitted = true;
  clearInterval(timerInterval);

  // Collect answers
  const answers = {};
  testData.questions.forEach(q => {
    const checked = document.querySelector(`input[name="q${q.id}"]:checked`);
    if (checked) answers[q.id] = checked.value;
  });

  const participantName = document.getElementById('participantName').value.trim();
  const unit = document.getElementById('unitName').value.trim();

  // Disable submit bar
  document.getElementById('submitBar').style.display = 'none';
  document.getElementById('timerBar').style.display = 'none';
  document.getElementById('testView').style.display = 'none';

  // Show loading
  const loadDiv = document.getElementById('loadingView');
  loadDiv.style.display = 'block';
  loadDiv.innerHTML = '<div style="text-align:center;padding:60px 20px;"><div style="font-size:2rem;margin-bottom:12px;">📤</div><p>Wysyłanie wyników...</p></div>';

  fetch(`/api/test/${params.sessionId}/${params.category}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ participantName, unit, answers })
  })
    .then(r => r.json())
    .then(data => {
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
