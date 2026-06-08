// PSP Admin Panel JS
let adminPassword = '';

function doLogin() {
  const pwd = document.getElementById('passwordInput').value;
  if (!pwd) return;
  document.getElementById('loginBtn').disabled = true;

  fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: pwd })
  })
    .then(r => r.json())
    .then(data => {
      if (data.ok) {
        adminPassword = pwd;
        sessionStorage.setItem('adminPwd', pwd);
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        loadAll();
      } else {
        showLoginError(data.error || 'Nieprawidłowe hasło');
      }
    })
    .catch(() => showLoginError('Błąd połączenia z serwerem'))
    .finally(() => { document.getElementById('loginBtn').disabled = false; });
}

function showLoginError(msg) {
  const el = document.getElementById('loginError');
  el.textContent = msg;
  el.style.display = 'block';
}

function logout() {
  adminPassword = '';
  sessionStorage.removeItem('adminPwd');
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('adminPanel').style.display = 'none';
  document.getElementById('passwordInput').value = '';
}

function authHeaders() {
  return { 'Content-Type': 'application/json', 'x-admin-password': adminPassword };
}

function loadAll() {
  loadSessions();
  loadResults();
}

function loadSessions() {
  fetch('/api/sessions', { headers: authHeaders() })
    .then(r => r.json())
    .then(renderSessions)
    .catch(() => {
      document.getElementById('sessionsList').innerHTML =
        '<div class="alert alert-danger">Błąd ładowania sesji</div>';
    });
}

function renderSessions(sessions) {
  const el = document.getElementById('sessionsList');
  if (!sessions.length) {
    el.innerHTML = '<div class="empty-state"><div class="icon">📂</div><div>Brak sesji. Kliknij „Generuj nową inspekcję" aby rozpocząć.</div></div>';
    return;
  }

  let html = '<div class="table-wrap"><table><thead><tr>' +
    '<th>Nazwa inspekcji</th><th>Data utworzenia</th><th>Status</th><th>Wyniki</th><th>Akcje</th>' +
    '</tr></thead><tbody>';

  for (const s of sessions) {
    const date = new Date(s.created_at).toLocaleString('pl-PL');
    const status = s.active
      ? '<span class="badge badge-pass">Aktywna</span>'
      : '<span class="badge badge-fail">Zakończona</span>';
    const name = s.name ? escHtml(s.name) : `<code>${s.id}</code>`;

    html += `<tr>
      <td>${name}</td>
      <td>${date}</td>
      <td>${status}</td>
      <td>${s.result_count} wynik(ów)</td>
      <td style="white-space:nowrap;">
        <button class="btn btn-primary btn-sm" onclick="showSessionQr('${s.id}')">📱 QR</button>
        <a href="/report/${s.id}?pwd=${encodeURIComponent(adminPassword)}" target="_blank" class="btn btn-gold btn-sm">📄 Raport</a>
        ${s.active ? `<button class="btn btn-outline btn-sm" onclick="closeSession('${s.id}')">🔒 Zamknij</button>` : ''}
      </td>
    </tr>`;
  }

  html += '</tbody></table></div>';
  el.innerHTML = html;
}

function loadResults() {
  fetch('/api/results', { headers: authHeaders() })
    .then(r => r.json())
    .then(renderResults)
    .catch(() => {
      document.getElementById('resultsList').innerHTML =
        '<div class="alert alert-danger">Błąd ładowania wyników</div>';
    });
}

const CAT_LABELS = {
  kierowcy: 'Kierowcy',
  dowodcy: 'Dowódcy',
  stanowiska_kierowania: 'St. Kierowania'
};

function renderResults(results) {
  const el = document.getElementById('resultsList');
  if (!results.length) {
    el.innerHTML = '<div class="empty-state"><div class="icon">📝</div><div>Brak wyników testów.</div></div>';
    return;
  }

  let html = '<div class="table-wrap"><table><thead><tr>' +
    '<th>Imię i nazwisko</th><th>Jednostka</th><th>Kategoria</th><th>Wynik</th><th>%</th><th>Data</th><th>Sesja</th>' +
    '</tr></thead><tbody>';

  for (const r of results) {
    const pct = Math.round(r.score / r.total * 100);
    const passClass = pct >= 60 ? 'badge-pass' : 'badge-fail';
    const cat = CAT_LABELS[r.category] || r.category;
    const date = new Date(r.completed_at).toLocaleString('pl-PL');

    html += `<tr>
      <td>${escHtml(r.participant_name)}</td>
      <td>${escHtml(r.unit)}</td>
      <td>${cat}</td>
      <td>${r.score}/${r.total}</td>
      <td><span class="badge ${passClass}">${pct}%</span></td>
      <td>${date}</td>
      <td><code>${r.session_id}</code></td>
    </tr>`;
  }

  html += '</tbody></table></div>';
  el.innerHTML = html;
}

function generateSession() {
  document.getElementById('sessionName').value = '';
  document.querySelectorAll('input[name="spec"]').forEach(cb => cb.checked = false);
  document.getElementById('newSessionError').style.display = 'none';
  document.getElementById('newSessionModal').classList.add('active');
}

function closeNewSessionModal() {
  document.getElementById('newSessionModal').classList.remove('active');
}

function submitNewSession() {
  const name = document.getElementById('sessionName').value.trim();
  if (!name) {
    const el = document.getElementById('newSessionError');
    el.textContent = 'Podaj nazwę inspekcji.';
    el.style.display = 'block';
    return;
  }

  const specializations = [...document.querySelectorAll('input[name="spec"]:checked')].map(cb => cb.value);

  const btn = document.querySelector('[onclick="submitNewSession()"]');
  btn.disabled = true;
  btn.textContent = 'Generowanie...';

  fetch('/api/sessions', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ name, specializations })
  })
    .then(r => r.json())
    .then(data => {
      closeNewSessionModal();
      showQrModal(data);
      loadAll();
    })
    .catch(() => {
      const el = document.getElementById('newSessionError');
      el.textContent = 'Błąd podczas generowania sesji';
      el.style.display = 'block';
    })
    .finally(() => {
      btn.disabled = false;
      btn.textContent = '✅ Generuj kody QR';
    });
}

function showQrModal(data) {
  const grid = document.getElementById('qrGrid');
  document.getElementById('sessionInfo').textContent = data.name ? `${data.name} (ID: ${data.id})` : `ID sesji: ${data.id}`;

  const catLabels = {
    kierowcy: { label: 'Kierowcy', desc: '15 pytań, 15 min', color: '#0a1628' },
    dowodcy: { label: 'Dowódcy', desc: '15 pytań, 15 min', color: '#c0392b' },
    stanowiska_kierowania: { label: 'Stanowiska Kierowania', desc: '10 pytań, 10 min', color: '#27ae60' }
  };

  let html = '';
  for (const [cat, qr] of Object.entries(data.qrCodes)) {
    const info = catLabels[cat] || { label: qr.label, desc: '', color: '#333' };
    html += `<div class="qr-item">
      <h4 style="color:${info.color}">${info.label}</h4>
      <p style="font-size:0.75rem;color:#666;margin-bottom:8px;">${info.desc}</p>
      <img src="${qr.dataUrl}" alt="QR ${info.label}">
      <div class="qr-url">${qr.url}</div>
    </div>`;
  }
  grid.innerHTML = html;

  document.getElementById('qrModal').classList.add('active');
}

function closeModal() {
  document.getElementById('qrModal').classList.remove('active');
}

function showSessionQr(id) {
  fetch(`/api/sessions/${id}/qr`, { headers: authHeaders() })
    .then(r => r.json())
    .then(data => showQrModal(data))
    .catch(() => alert('Błąd ładowania kodów QR'));
}

function closeSession(id) {
  if (!confirm('Czy na pewno chcesz zamknąć tę sesję?')) return;
  fetch(`/api/sessions/${id}`, { method: 'DELETE', headers: authHeaders() })
    .then(() => loadSessions())
    .catch(() => alert('Błąd podczas zamykania sesji'));
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// On page load, try auto-login from session storage
window.addEventListener('DOMContentLoaded', () => {
  const saved = sessionStorage.getItem('adminPwd');
  if (saved) {
    document.getElementById('passwordInput').value = saved;
    adminPassword = saved;
    doLogin();
  }

  document.getElementById('passwordInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') doLogin();
  });

  document.getElementById('qrModal').addEventListener('click', e => {
    if (e.target === document.getElementById('qrModal')) closeModal();
  });
  document.getElementById('newSessionModal').addEventListener('click', e => {
    if (e.target === document.getElementById('newSessionModal')) closeNewSessionModal();
  });
});
