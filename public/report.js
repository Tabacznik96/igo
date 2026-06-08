// PSP Report Page JS

const sessionId = location.pathname.split('/')[2];

const CAT_LABELS = {
  kierowcy: 'Kierowcy',
  dowodcy: 'Dowódcy',
  stanowiska_kierowania: 'Stanowiska Kierowania'
};

// Report page doesn't need auth token — we allow anyone with the URL to view
// But we need the admin password to call the API.
// We'll pass it via query param or sessionStorage fallback.
function getAdminPwd() {
  const params = new URLSearchParams(location.search);
  return params.get('pwd') || sessionStorage.getItem('adminPwd') || '';
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('reportSessionId').textContent = sessionId;
  document.getElementById('reportDate').textContent =
    new Date().toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' });

  loadReport();
});

function loadReport() {
  const pwd = getAdminPwd();
  fetch(`/api/results/${sessionId}`, {
    headers: { 'x-admin-password': pwd }
  })
    .then(r => {
      if (r.status === 401) throw new Error('Brak autoryzacji. Otwórz raport z panelu administratora.');
      return r.json();
    })
    .then(results => {
      document.getElementById('loadingView').style.display = 'none';
      document.getElementById('reportContent').style.display = 'block';
      renderReport(results);
    })
    .catch(err => {
      document.getElementById('loadingView').style.display = 'none';
      document.getElementById('errorView').style.display = 'block';
      document.getElementById('errorMsg').textContent = err.message || 'Błąd ładowania raportu';
    });
}

function renderReport(results) {
  // Summary
  const total = results.length;
  const passed = results.filter(r => (r.score / r.total) >= 0.6).length;
  const failed = total - passed;
  const avgPct = total > 0
    ? Math.round(results.reduce((sum, r) => sum + r.score / r.total * 100, 0) / total)
    : 0;

  const catCounts = {};
  results.forEach(r => {
    catCounts[r.category] = (catCounts[r.category] || 0) + 1;
  });

  let summaryHtml = `
    <div style="display:flex;flex-wrap:wrap;gap:16px;margin-bottom:8px;">
      <div class="info-box" style="min-width:120px;">
        <div class="val">${total}</div>
        <div class="lbl">Uczestników</div>
      </div>
      <div class="info-box" style="min-width:120px;">
        <div class="val" style="color:var(--green)">${passed}</div>
        <div class="lbl">Zdało (≥60%)</div>
      </div>
      <div class="info-box" style="min-width:120px;">
        <div class="val" style="color:var(--red)">${failed}</div>
        <div class="lbl">Nie zdało</div>
      </div>
      <div class="info-box" style="min-width:120px;">
        <div class="val">${avgPct}%</div>
        <div class="lbl">Średni wynik</div>
      </div>
    </div>
    <p style="font-size:0.85rem;color:var(--dark-gray);">
      Kategorie: `;

  for (const [cat, cnt] of Object.entries(catCounts)) {
    summaryHtml += `<span class="badge badge-info">${CAT_LABELS[cat] || cat}: ${cnt}</span> `;
  }
  summaryHtml += '</p>';
  document.getElementById('summaryContent').innerHTML = summaryHtml;

  // Results table
  const tbody = document.getElementById('resultsBody');
  let rows = '';
  results.forEach((r, idx) => {
    const pct = Math.round(r.score / r.total * 100);
    const passClass = pct >= 60 ? 'score-ok' : 'score-fail';
    const cat = CAT_LABELS[r.category] || r.category;
    const date = new Date(r.completed_at).toLocaleString('pl-PL');

    let breakdownHtml = '';
    if (r.category === 'dowodcy') {
      const errors = getErrorsBySection(r.questions_json);
      if (errors.length) {
        breakdownHtml = '<div class="section-errors">' +
          errors.map(e => `<span class="section-error-tag">❌ ${e.section} (${e.errors}/${e.total})</span>`).join('') +
          '</div>';
      }
    }

    rows += `<tr>
      <td>${idx + 1}</td>
      <td><strong>${escHtml(r.participant_name)}</strong>${breakdownHtml}</td>
      <td>${escHtml(r.unit)}</td>
      <td>${cat}</td>
      <td class="${passClass}">${r.score}/${r.total}</td>
      <td><span class="badge ${pct >= 60 ? 'badge-pass' : 'badge-fail'}">${pct}%</span></td>
      <td style="font-size:0.85rem;white-space:nowrap;">${date}</td>
    </tr>`;
  });
  tbody.innerHTML = rows || '<tr><td colspan="7" style="text-align:center;color:#999;">Brak wyników</td></tr>';

  // Dowódcy breakdown section
  const dowodcyResults = results.filter(r => r.category === 'dowodcy');
  if (dowodcyResults.length > 0) {
    document.getElementById('dowodcySection').style.display = 'block';
    renderDowodcyBreakdown(dowodcyResults);
  }
}

function getErrorsBySection(questionsJson) {
  const sectionMap = {};
  questionsJson.forEach(q => {
    const key = q.section || 'Nieznana';
    if (!sectionMap[key]) sectionMap[key] = { errors: 0, total: 0 };
    sectionMap[key].total++;
    if (!q.isCorrect) sectionMap[key].errors++;
  });

  return Object.entries(sectionMap)
    .filter(([, v]) => v.errors > 0)
    .map(([section, v]) => ({ section, ...v }))
    .sort((a, b) => b.errors - a.errors);
}

function renderDowodcyBreakdown(results) {
  // Aggregate errors across all dowódcy participants by section
  const sectionAgg = {};
  results.forEach(r => {
    r.questions_json.forEach(q => {
      const key = q.section || 'Nieznana';
      if (!sectionAgg[key]) sectionAgg[key] = { total: 0, errors: 0, participants: new Set() };
      sectionAgg[key].total++;
      if (!q.isCorrect) {
        sectionAgg[key].errors++;
        sectionAgg[key].participants.add(r.participant_name);
      }
    });
  });

  const sorted = Object.entries(sectionAgg)
    .sort((a, b) => (b[1].errors / b[1].total) - (a[1].errors / a[1].total));

  let html = '<div class="table-wrap"><table><thead><tr>' +
    '<th>Tematyka</th><th>Błędne odp.</th><th>Wszystkie odp.</th><th>% błędów</th><th>Dotyczy</th>' +
    '</tr></thead><tbody>';

  for (const [section, data] of sorted) {
    const errPct = Math.round(data.errors / data.total * 100);
    const cls = errPct >= 50 ? 'badge-fail' : errPct >= 30 ? 'badge-warn' : 'badge-pass';
    html += `<tr>
      <td>${escHtml(section)}</td>
      <td>${data.errors}</td>
      <td>${data.total}</td>
      <td><span class="badge ${cls}">${errPct}%</span></td>
      <td style="font-size:0.82rem;">${[...data.participants].join(', ')}</td>
    </tr>`;
  }

  html += '</tbody></table></div>';
  document.getElementById('dowodcyBreakdown').innerHTML = html;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
