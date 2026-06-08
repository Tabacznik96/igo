let currentUser = null; // { userId, username, displayName, role, passwordHash }

function sha256(str) {
  // Use SubtleCrypto for hashing in browser
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
    .then(buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join(''));
}

// --- Landing / Login ---
function toggleLoginPanel() {
  const panel = document.getElementById('loginPanel');
  const landing = document.getElementById('landingView');
  const visible = panel.style.display !== 'none';
  panel.style.display = visible ? 'none' : 'block';
  landing.style.display = visible ? 'block' : 'none';
  if (!visible) setTimeout(() => document.getElementById('usernameInput').focus(), 50);
}

async function doLogin() {
  const username = document.getElementById('usernameInput').value.trim();
  const password = document.getElementById('passwordInput').value;
  if (!username || !password) return;

  document.getElementById('loginBtn').disabled = true;
  const pwdHash = await sha256(password);

  fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
    .then(r => r.json())
    .then(data => {
      if (data.ok) {
        currentUser = { userId: data.userId, username, displayName: data.displayName, role: data.role, passwordHash: pwdHash };
        sessionStorage.setItem('currentUser', JSON.stringify({ ...currentUser, password }));
        showAdminPanel();
        loadAll();
      } else {
        showLoginError(data.error || 'Nieprawidłowy login lub hasło');
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

function showAdminPanel() {
  document.getElementById('landingView').style.display = 'none';
  document.getElementById('loginPanel').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'block';
  document.getElementById('loginToggleBtn').style.display = 'none';
  document.getElementById('userDisplayName').textContent = currentUser.displayName || currentUser.username;
  document.getElementById('userDisplayName').style.display = 'inline';
  document.getElementById('userDisplayNamePanel').textContent = currentUser.displayName || currentUser.username;
  if (currentUser.role === 'admin') {
    document.getElementById('userMgmtBtn').style.display = 'inline-flex';
  }
}

function logout() {
  currentUser = null;
  sessionStorage.removeItem('currentUser');
  document.getElementById('adminPanel').style.display = 'none';
  document.getElementById('landingView').style.display = 'block';
  document.getElementById('loginToggleBtn').style.display = 'inline-flex';
  document.getElementById('usernameInput').value = '';
  document.getElementById('passwordInput').value = '';
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-username': currentUser.username,
    'x-password-hash': currentUser.passwordHash
  };
}

function loadAll() {
  loadSessions();
  loadResults();
}

// --- Sessions ---
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
    el.innerHTML = '<div class="empty-state"><div class="icon">📂</div><div>Brak sesji. Kliknij „Nowa inspekcja" aby rozpocząć.</div></div>';
    return;
  }

  let html = '<div class="table-wrap"><table><thead><tr>' +
    '<th>Nazwa inspekcji</th><th>Utworzył</th><th>Data</th><th>Status</th><th>Wyniki</th><th>Akcje</th>' +
    '</tr></thead><tbody>';

  for (const s of sessions) {
    const date = new Date(s.created_at).toLocaleString('pl-PL');
    const status = s.active
      ? '<span class="badge badge-pass">Aktywna</span>'
      : '<span class="badge badge-fail">Zakończona</span>';
    const name = s.name ? escHtml(s.name) : `<code style="font-size:0.8rem">${s.id}</code>`;
    const creator = s.created_by_name ? escHtml(s.created_by_name) : '—';
    const creds = encodeURIComponent(JSON.stringify({ u: currentUser.username, h: currentUser.passwordHash }));

    html += `<tr>
      <td><a href="/session/${s.id}" style="color:var(--navy);font-weight:700;text-decoration:none;" onclick="openSession('${s.id}');return false;">${name}</a></td>
      <td style="font-size:0.85rem;">${creator}</td>
      <td style="font-size:0.85rem;white-space:nowrap;">${date}</td>
      <td>${status}</td>
      <td>${s.result_count} wynik(ów)</td>
      <td style="white-space:nowrap;">
        <button class="btn btn-primary btn-sm" onclick="showSessionQr('${s.id}')">📱 QR</button>
        ${s.active ? `<button class="btn btn-outline btn-sm" onclick="closeSession('${s.id}')">🔒 Zamknij</button>` : ''}
      </td>
    </tr>`;
  }

  html += '</tbody></table></div>';
  el.innerHTML = html;
}

// --- Results ---
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
    '<th>Sesja</th><th>Jednostka</th><th>Kategoria</th><th>Wynik</th><th>%</th><th>Data</th>' +
    '</tr></thead><tbody>';

  for (const r of results) {
    const pct = Math.round(r.score / r.total * 100);
    const passClass = pct >= 60 ? 'badge-pass' : 'badge-fail';
    const cat = CAT_LABELS[r.category] || r.category;
    const date = new Date(r.completed_at).toLocaleString('pl-PL');
    const sessionName = r.session_name ? escHtml(r.session_name) : `<code>${r.session_id}</code>`;

    html += `<tr>
      <td style="font-size:0.85rem;">${sessionName}</td>
      <td>${escHtml(r.unit)}</td>
      <td>${cat}</td>
      <td>${r.score}/${r.total}</td>
      <td><span class="badge ${passClass}">${pct}%</span></td>
      <td style="font-size:0.85rem;">${date}</td>
    </tr>`;
  }

  html += '</tbody></table></div>';
  el.innerHTML = html;
}

// --- New Session Modal ---
function openNewSessionModal() {
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
      if (data.error) throw new Error(data.error);
      closeNewSessionModal();
      showQrModal(data);
      loadAll();
    })
    .catch(e => {
      const el = document.getElementById('newSessionError');
      el.textContent = e.message || 'Błąd podczas generowania sesji';
      el.style.display = 'block';
    })
    .finally(() => {
      btn.disabled = false;
      btn.textContent = '✅ Generuj kody QR';
    });
}

// --- QR Modal ---
function showSessionQr(id) {
  fetch(`/api/sessions/${id}/qr`, { headers: authHeaders() })
    .then(r => r.json())
    .then(data => {
      if (data.error) { alert('Błąd: ' + data.error); return; }
      showQrModal(data);
    })
    .catch(() => alert('Błąd ładowania kodów QR'));
}

function showQrModal(data) {
  const name = data.name || data.id;
  document.getElementById('sessionInfo').textContent = name;
  document.getElementById('qrModalTitle').textContent = `📱 ${name}`;

  const catMeta = {
    kierowcy:              { label: 'Kierowcy',              desc: '15 pytań, 15 min', color: '#0a1628' },
    dowodcy:               { label: 'Dowódcy',               desc: '15 pytań, 15 min', color: '#c0392b' },
    stanowiska_kierowania: { label: 'Stanowiska Kierowania', desc: '10 pytań, 10 min', color: '#27ae60' }
  };

  let html = '';
  for (const [cat, qr] of Object.entries(data.qrCodes)) {
    const info = catMeta[cat] || { label: qr.label, desc: '', color: '#333' };
    const printUrl = `/print/${data.id}/${cat}?u=${encodeURIComponent(currentUser.username)}&h=${encodeURIComponent(currentUser.passwordHash)}`;
    html += `<div class="qr-item">
      <h4 style="color:${info.color}">${info.label}</h4>
      <p style="font-size:0.75rem;color:#666;margin-bottom:8px;">${info.desc}</p>
      <img src="${qr.dataUrl}" alt="QR ${info.label}">
      <div class="qr-url">${qr.url}</div>
      <a href="${printUrl}" target="_blank" style="display:block;margin-top:8px;font-size:0.78rem;color:#c0392b;text-align:center;">🖨️ Drukuj test papierowy</a>
    </div>`;
  }
  document.getElementById('qrGrid').innerHTML = html;
  document.getElementById('qrModal').classList.add('active');
}

function closeModal() {
  document.getElementById('qrModal').classList.remove('active');
}

function openSession(id) {
  sessionStorage.setItem('sessionCreds', JSON.stringify({ u: currentUser.username, h: currentUser.passwordHash }));
  window.open(`/session/${id}`, '_blank');
}

function closeSession(id) {
  if (!confirm('Czy na pewno chcesz zamknąć tę sesję?')) return;
  fetch(`/api/sessions/${id}`, { method: 'DELETE', headers: authHeaders() })
    .then(() => loadSessions())
    .catch(() => alert('Błąd podczas zamykania sesji'));
}

// --- User Management ---
function openUserMgmt() {
  document.getElementById('userMgmtModal').classList.add('active');
  loadUsers();
}

function closeUserMgmt() {
  document.getElementById('userMgmtModal').classList.remove('active');
}

function loadUsers() {
  fetch('/api/users', { headers: authHeaders() })
    .then(r => r.json())
    .then(renderUsers);
}

function renderUsers(users) {
  let html = '<table><thead><tr><th>Login</th><th>Imię/Nazwa</th><th>Rola</th><th>Akcje</th></tr></thead><tbody>';
  for (const u of users) {
    html += `<tr>
      <td>${escHtml(u.username)}</td>
      <td>${escHtml(u.display_name || '')}</td>
      <td><span class="badge ${u.role === 'admin' ? 'badge-pass' : 'badge-info'}">${u.role}</span></td>
      <td>
        ${u.username !== 'admin' ? `<button class="btn btn-outline btn-sm" onclick="deleteUser(${u.id})">🗑️</button>` : ''}
        <button class="btn btn-outline btn-sm" onclick="resetPassword(${u.id})">🔑 Hasło</button>
      </td>
    </tr>`;
  }
  html += '</tbody></table>';
  document.getElementById('usersList').innerHTML = html;
}

function addUser() {
  const username = document.getElementById('newUsername').value.trim();
  const password = document.getElementById('newPassword').value;
  const display_name = document.getElementById('newDisplayName').value.trim();
  const role = document.getElementById('newRole').value;
  if (!username || !password) { alert('Wypełnij login i hasło'); return; }

  fetch('/api/users', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ username, password, display_name, role })
  })
    .then(r => r.json())
    .then(data => {
      if (data.error) { alert(data.error); return; }
      document.getElementById('newUsername').value = '';
      document.getElementById('newPassword').value = '';
      document.getElementById('newDisplayName').value = '';
      loadUsers();
    });
}

function deleteUser(id) {
  if (!confirm('Usunąć użytkownika?')) return;
  fetch(`/api/users/${id}`, { method: 'DELETE', headers: authHeaders() })
    .then(() => loadUsers());
}

function resetPassword(id) {
  const pwd = prompt('Nowe hasło:');
  if (!pwd) return;
  fetch(`/api/users/${id}/password`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ password: pwd })
  }).then(r => r.json()).then(d => { if (d.ok) alert('Hasło zmienione'); });
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// --- Init ---
window.addEventListener('DOMContentLoaded', () => {
  const saved = sessionStorage.getItem('currentUser');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      // Re-login to verify
      fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: data.username, password: data.password })
      }).then(r => r.json()).then(async res => {
        if (res.ok) {
          currentUser = { ...data, passwordHash: await sha256(data.password) };
          showAdminPanel();
          loadAll();
        } else {
          sessionStorage.removeItem('currentUser');
        }
      }).catch(() => {});
    } catch(e) {}
  }

  document.getElementById('passwordInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') doLogin();
  });
  document.getElementById('usernameInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('passwordInput').focus();
  });

  ['qrModal','newSessionModal','userMgmtModal'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', e => { if (e.target === el) el.classList.remove('active'); });
  });
});
