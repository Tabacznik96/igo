// protocol.js – silnik protokołów IGO

const PROTOCOL_CONFIG = {
  jrg: {
    name: 'JRG', fullName: 'Jednostka Ratowniczo-Gaśnicza',
    maxPoints: 100, annex: 'Załącznik Nr 5',
    sections: [
      {
        id: 'alarm', name: '1. Alarmowanie', maxPoints: 10, type: 'alarm',
        alarmType: 'seconds',
        table: [
          { maxSec: 60,       points: 10, label: 'do 60 s' },
          { maxSec: 90,       points: 8,  label: '61 – 90 s' },
          { maxSec: 120,      points: 6,  label: '91 – 120 s' },
          { maxSec: 150,      points: 4,  label: '121 – 150 s' },
          { maxSec: 180,      points: 2,  label: '151 – 180 s' },
          { maxSec: Infinity, points: 0,  label: 'powyżej 180 s' }
        ]
      },
      {
        id: 'firefighters', name: '2. Gotowość bojowa ratowników', maxPoints: 8, type: 'firefighters',
        checks: [
          { id: 'ubranie',   name: 'Ubranie specjalne kompletne i sprawne',   penalty: 1 },
          { id: 'oddo',      name: 'Aparat ODO – kompletny i sprawny',        penalty: 1 },
          { id: 'helm',      name: 'Hełm strażacki z osłoną twarzy',          penalty: 0.5 },
          { id: 'rekawice',  name: 'Rękawice specjalne',                       penalty: 0.5 },
          { id: 'buty',      name: 'Buty specjalne',                           penalty: 0.5 },
          { id: 'pas',       name: 'Pas strażacki z karabińczykiem',           penalty: 0.5 }
        ]
      },
      {
        id: 'vehicles', name: '3. Pojazdy i sprzęt', maxPoints: 15, type: 'checklist_points',
        items: [
          { id: 'v01', name: 'GBA/GCBA – ukompletowanie wyposażenia podstawowego',  points: 4 },
          { id: 'v02', name: 'Aparaty ODO zapasowe – kompletność i stan techniczny', points: 2 },
          { id: 'v03', name: 'Środki gaśnicze (woda, środek pianotwórczy)',          points: 2 },
          { id: 'v04', name: 'Sprzęt hydraulicznego ratownictwa technicznego',       points: 2 },
          { id: 'v05', name: 'Łączność (radiostacje – ilość i sprawność)',           points: 2 },
          { id: 'v06', name: 'Wyposażenie medyczne (PSP R-1 lub R-2)',               points: 2 },
          { id: 'v07', name: 'Sprzęt burzący, oświetleniowy i pomocniczy',           points: 1 }
        ]
      },
      {
        id: 'docs', name: '4. Dokumentacja', maxPoints: 2, type: 'checklist_points',
        items: [
          { id: 'd01', name: 'Dokumentacja taktyczno-bojowa (plany działań ratowniczych)', points: 1 },
          { id: 'd02', name: 'Książka wyjść i alarmowań',                                  points: 0.5 },
          { id: 'd03', name: 'Dziennik podejmowanych czynności / inne wymagane rejestry',   points: 0.5 }
        ]
      },
      {
        id: 'test', name: '5. Test wiedzy', maxPoints: 15, type: 'test_link',
        category: 'kierowcy'
      },
      {
        id: 'exercise', name: '6. Ćwiczenie', maxPoints: 50, type: 'exercise',
        errors: [
          { id: 'ex01', name: 'Brak meldunku dowódcy akcji o gotowości sił i środków',    penalty: 2 },
          { id: 'ex02', name: 'Brak lub błędne rozpoznanie miejsca zdarzenia',             penalty: 2 },
          { id: 'ex03', name: 'Nieprawidłowe miejsce ustawienia pojazdów',                 penalty: 2 },
          { id: 'ex04', name: 'Brak lub nieprawidłowe ustalenie stref (bezp./zagrożenia)', penalty: 2 },
          { id: 'ex05', name: 'Nieużycie ODO w strefie zagrożenia',                        penalty: 3 },
          { id: 'ex06', name: 'Brak ochrony ratowników (ubezpieczenie)',                   penalty: 3 },
          { id: 'ex07', name: 'Nieprawidłowe rozwinięcie do natarcia gaśniczego',          penalty: 2 },
          { id: 'ex08', name: 'Błędy na stanowisku wodnym (pompa, linie wężowe)',          penalty: 2 },
          { id: 'ex09', name: 'Brak wymaganej wentylacji',                                 penalty: 1 },
          { id: 'ex10', name: 'Brak meldunku do SWD / stanowiska kierowania',              penalty: 2 },
          { id: 'ex11', name: 'Niewykonanie polecenia dowódcy',                            penalty: 3 },
          { id: 'ex12', name: 'Porzucenie lub uszkodzenie sprzętu',                        penalty: 2 },
          { id: 'ex13', name: 'Naruszenie zasad bezpieczeństwa – BHP',                     penalty: 5 },
          { id: 'ex14', name: 'Brak lub nieprawidłowy meldunek końcowy akcji',             penalty: 1 },
          { id: 'ex15', name: 'Inne stwierdzone uchybienie (za każde)',                    penalty: 1 }
        ]
      }
    ]
  },
  osp: {
    name: 'OSP', fullName: 'Ochotnicza Straż Pożarna',
    maxPoints: 100, annex: 'Załącznik Nr 6',
    sections: [
      {
        id: 'alarm', name: '1. Alarmowanie', maxPoints: 10, type: 'alarm',
        alarmType: 'minutes',
        table: [
          { maxSec: 5*60,       points: 10, label: 'do 5 min' },
          { maxSec: 8*60,       points: 8,  label: '6 – 8 min' },
          { maxSec: 10*60,      points: 6,  label: '9 – 10 min' },
          { maxSec: 12*60,      points: 4,  label: '11 – 12 min' },
          { maxSec: 15*60,      points: 2,  label: '13 – 15 min' },
          { maxSec: Infinity,   points: 0,  label: 'powyżej 15 min' }
        ]
      },
      {
        id: 'firefighters', name: '2. Gotowość OSP', maxPoints: 20, type: 'firefighters',
        checks: [
          { id: 'ubranie',    name: 'Ubranie bojowe kompletne i sprawne',    penalty: 2 },
          { id: 'helm',       name: 'Hełm strażacki z osłoną twarzy',        penalty: 1 },
          { id: 'oddo',       name: 'Sprzęt ODO (jeśli wymagany – aparaty)', penalty: 2 },
          { id: 'rekawice',   name: 'Rękawice specjalne',                     penalty: 1 },
          { id: 'buty',       name: 'Buty specjalne',                         penalty: 1 },
          { id: 'wyposazenie',name: 'Pozostałe wyposażenie osobiste',          penalty: 1 }
        ]
      },
      {
        id: 'vehicles', name: '3. Pojazdy i sprzęt', maxPoints: 20, type: 'checklist_points',
        items: [
          { id: 'v01', name: 'Pojazd pożarniczy – stan techniczny i ukompletowanie',   points: 8 },
          { id: 'v02', name: 'Sprzęt gaśniczy (węże, prądownice, rozdzielacze)',        points: 4 },
          { id: 'v03', name: 'Środki gaśnicze (woda, środek pianotwórczy)',             points: 4 },
          { id: 'v04', name: 'Sprzęt ratowniczy i pomocniczy',                          points: 2 },
          { id: 'v05', name: 'Łączność (radiostacje)',                                  points: 2 }
        ]
      },
      {
        id: 'test', name: '4. Test wiedzy', maxPoints: 10, type: 'test_link',
        category: 'kierowcy'
      },
      {
        id: 'exercise', name: '5. Ćwiczenie', maxPoints: 40, type: 'exercise',
        errors: [
          { id: 'ex01', name: 'Brak meldunku o gotowości sił i środków',         penalty: 2 },
          { id: 'ex02', name: 'Brak rozpoznania miejsca zdarzenia',               penalty: 2 },
          { id: 'ex03', name: 'Nieprawidłowe ustawienie pojazdu',                 penalty: 2 },
          { id: 'ex04', name: 'Brak ustalenia stref bezpieczeństwa',             penalty: 2 },
          { id: 'ex05', name: 'Błędy w rozwinięciu bojowym',                     penalty: 2 },
          { id: 'ex06', name: 'Nieprawidłowa praca sprzętem gaśniczym',          penalty: 2 },
          { id: 'ex07', name: 'Brak łączności z PSP / SWD',                      penalty: 2 },
          { id: 'ex08', name: 'Naruszenie zasad bezpieczeństwa – BHP',           penalty: 4 },
          { id: 'ex09', name: 'Brak lub nieprawidłowy meldunek końcowy',         penalty: 1 },
          { id: 'ex10', name: 'Inne stwierdzone uchybienie (za każde)',           penalty: 1 }
        ]
      }
    ]
  },
  sk: {
    name: 'SK', fullName: 'Stanowisko Kierowania',
    maxPoints: 123, annex: 'Załącznik Nr 4',
    sections: [
      {
        id: 'obsada', name: '1. Obsada SK', maxPoints: 7, type: 'checklist_points',
        items: [
          { id: 'o01', name: 'Dyżurny operacyjny – kwalifikacje i uprawnienia',        points: 3 },
          { id: 'o02', name: 'Obsada na zmianie zgodna z etatem / wymaganiami',        points: 2 },
          { id: 'o03', name: 'Znajomość obszaru chronionego przez dyżurnego operacyjnego', points: 2 }
        ]
      },
      {
        id: 'test', name: '2. Test wiedzy', maxPoints: 10, type: 'test_link',
        category: 'stanowiska_kierowania'
      },
      {
        id: 'areas', name: '3. Obszary chronione', maxPoints: 22, type: 'checklist_points',
        items: [
          { id: 'a01', name: 'Znajomość obiektów kategorii ZL i PM na obszarze',      points: 5 },
          { id: 'a02', name: 'Znajomość dróg dojazdowych i źródeł wody',               points: 4 },
          { id: 'a03', name: 'Znajomość rozmieszczenia sił i środków na obszarze',     points: 4 },
          { id: 'a04', name: 'Plany działania ratowniczego – aktualność i kompletność', points: 5 },
          { id: 'a05', name: 'Znajomość podmiotów KSRG i współpracujących',            points: 4 }
        ]
      },
      {
        id: 'docs', name: '4. Dokumentacja', maxPoints: 28, type: 'checklist_points',
        items: [
          { id: 'd01', name: 'Plany działania ratowniczego – kompletność i aktualność', points: 6 },
          { id: 'd02', name: 'Dokumentacja sił i środków KSRG',                         points: 4 },
          { id: 'd03', name: 'Dokumentacja łączności (schematy, wykazy)',               points: 4 },
          { id: 'd04', name: 'Dziennik zdarzeń / alarmowań (ostatnie 3 miesiące)',      points: 4 },
          { id: 'd05', name: 'Rozkazy, zarządzenia i wytyczne – kompletność',           points: 4 },
          { id: 'd06', name: 'Dokumentacja szkoleń i ćwiczeń',                          points: 3 },
          { id: 'd07', name: 'Pozostała dokumentacja operacyjna wymagana przepisami',   points: 3 }
        ]
      },
      {
        id: 'equipment', name: '5. Wyposażenie SK', maxPoints: 19, type: 'checklist_points',
        items: [
          { id: 'eq01', name: 'Łączność telefoniczna (linie miejskie i wewnętrzne)',    points: 4 },
          { id: 'eq02', name: 'Łączność radiowa (sieć PSP, kanały taktyczne, zasięg)', points: 5 },
          { id: 'eq03', name: 'System SWD – sprawność i aktualność danych',             points: 5 },
          { id: 'eq04', name: 'Kartografia / mapa obszaru chronionego',                 points: 3 },
          { id: 'eq05', name: 'Inne wyposażenie operacyjne (tablice, DSO, itp.)',       points: 2 }
        ]
      },
      {
        id: 'swd', name: '6. Dokumentacja SWD', maxPoints: 5, type: 'checklist_points',
        items: [
          { id: 's01', name: 'Aktualność danych obiektów w systemie SWD-ST', points: 2 },
          { id: 's02', name: 'Kompletność kart obiektów kategorii ZL/PM',    points: 2 },
          { id: 's03', name: 'Plany działań ratowniczych w SWD – aktualność', points: 1 }
        ]
      },
      {
        id: 'exercise', name: '7. Ćwiczenie (symulacja zdarzeń)', maxPoints: 32, type: 'exercise',
        errors: [
          { id: 'ex01', name: 'Brak lub błędne przyjęcie zgłoszenia o zdarzeniu',             penalty: 3 },
          { id: 'ex02', name: 'Nieprawidłowe dysponowanie sił i środków do zdarzenia',        penalty: 4 },
          { id: 'ex03', name: 'Błędy w prowadzeniu łączności z siłami w terenie',             penalty: 3 },
          { id: 'ex04', name: 'Brak koordynacji działań z innymi służbami ratowniczymi',      penalty: 3 },
          { id: 'ex05', name: 'Nieprawidłowe informowanie przełożonych i SWD',                penalty: 2 },
          { id: 'ex06', name: 'Błędy w prowadzeniu dokumentacji zdarzenia (dziennik)',        penalty: 3 },
          { id: 'ex07', name: 'Brak znajomości obszaru chronionego podczas symulacji',        penalty: 3 },
          { id: 'ex08', name: 'Brak lub błędna analiza i reagowanie na zmianę sytuacji',      penalty: 3 },
          { id: 'ex09', name: 'Inne stwierdzone uchybienie w działaniu SK (za każde)',        penalty: 2 }
        ]
      }
    ]
  }
};

const GRADE_SCALE = [
  { minPct: 91, grade: 6, label: 'celujący',        color: '#27ae60' },
  { minPct: 81, grade: 5, label: 'bardzo dobry',    color: '#2ecc71' },
  { minPct: 71, grade: 4, label: 'dobry',           color: '#3498db' },
  { minPct: 61, grade: 3, label: 'dostateczny',     color: '#f39c12' },
  { minPct: 51, grade: 2, label: 'dopuszczający',   color: '#e67e22' },
  { minPct: 0,  grade: 1, label: 'niedostateczny',  color: '#e74c3c' }
];

// ── state ──────────────────────────────────────────────────────────────────
let protocolId = null;
let sessionId  = null;
let isEditMode = false;
let currentSectionId = null;
let sectionData = {};   // { sectionId: { ... section state ... } }
let unitType    = null;
let unitName    = '';
let sessionResults = [];
let sessionInfo    = null;
let authU = '', authH = '';

// stopwatch
let swInterval = null;
let swStartTs  = 0;
let swElapsed  = 0;
let swRunning  = false;

// ── init ───────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  try {
    const c = JSON.parse(sessionStorage.getItem('sessionCreds') || '{}');
    authU = c.u || ''; authH = c.h || '';
  } catch(e) {}

  const path = location.pathname;
  if (path.startsWith('/protocol/new/')) {
    sessionId  = path.split('/')[3];
    isEditMode = false;
    showSetupScreen();
  } else if (path.startsWith('/protocol/edit/')) {
    protocolId = parseInt(path.split('/')[3]);
    isEditMode = true;
    loadExistingProtocol();
  }
});

function authH_() {
  return { 'Content-Type':'application/json', 'x-username': authU, 'x-password-hash': authH };
}

// ── setup screen ───────────────────────────────────────────────────────────
async function showSetupScreen() {
  document.getElementById('setupScreen').style.display = 'block';
  document.getElementById('mainScreen').style.display  = 'none';
  // load session name for display
  try {
    const r = await fetch(`/api/sessions/${sessionId}`, { headers: authH_() });
    sessionInfo = await r.json();
    document.getElementById('setupSessionName').textContent = sessionInfo.name || sessionId;
  } catch(e) {}
}

async function startProtocol() {
  unitName = document.getElementById('unitNameInput').value.trim();
  unitType = document.getElementById('unitTypeSelect').value;
  if (!unitName) { alert('Podaj nazwę jednostki'); return; }

  // create protocol in DB
  const r = await fetch(`/api/protocols/session/${sessionId}`, {
    method: 'POST',
    headers: authH_(),
    body: JSON.stringify({ unit: unitName, unit_type: unitType })
  });
  const d = await r.json();
  if (!d.ok) { alert('Błąd tworzenia protokołu'); return; }
  protocolId = d.id;

  // init section data
  initSectionData();
  await loadSessionResults();
  renderMainScreen();
}

async function loadExistingProtocol() {
  const r = await fetch(`/api/protocols/${protocolId}`, { headers: authH_() });
  const d = await r.json();
  if (d.error) { document.body.innerHTML = '<p style="padding:40px;color:red;">Błąd: ' + d.error + '</p>'; return; }

  sessionId  = d.session_id;
  unitType   = d.unit_type;
  unitName   = d.unit;
  sessionInfo = { name: d.session_name, id: d.session_id };

  initSectionData();
  // overlay saved data
  if (d.sections_json && typeof d.sections_json === 'object') {
    for (const [sid, saved] of Object.entries(d.sections_json)) {
      if (sectionData[sid]) Object.assign(sectionData[sid], saved);
    }
  }
  await loadSessionResults();
  renderMainScreen();
}

function initSectionData() {
  sectionData = {};
  const cfg = PROTOCOL_CONFIG[unitType];
  for (const sec of cfg.sections) {
    if (sec.type === 'alarm') {
      sectionData[sec.id] = { timeSeconds: null, points: null };
    } else if (sec.type === 'firefighters') {
      sectionData[sec.id] = { people: [], points: sec.maxPoints };
    } else if (sec.type === 'checklist_points') {
      const items = {};
      for (const it of sec.items) items[it.id] = 'ok';
      sectionData[sec.id] = { items, points: sec.maxPoints };
    } else if (sec.type === 'test_link') {
      sectionData[sec.id] = { resultId: null, score: null, total: null, points: null };
    } else if (sec.type === 'exercise') {
      const errors = {};
      for (const e of sec.errors) errors[e.id] = { checked: false, count: 1 };
      sectionData[sec.id] = { errors, extraErrors: [], points: sec.maxPoints };
    }
  }
}

async function loadSessionResults() {
  try {
    const r = await fetch(`/api/results/${sessionId}`, { headers: authH_() });
    sessionResults = await r.json();
  } catch(e) { sessionResults = []; }
}

// ── main screen ────────────────────────────────────────────────────────────
function renderMainScreen() {
  document.getElementById('setupScreen').style.display = 'none';
  document.getElementById('mainScreen').style.display  = 'block';
  const cfg = PROTOCOL_CONFIG[unitType];
  document.getElementById('mainTitle').textContent = `${cfg.name} – ${unitName}`;
  document.getElementById('mainSubtitle').textContent = (sessionInfo && sessionInfo.name) || sessionId;

  renderSectionNav();
  const firstSec = cfg.sections[0];
  currentSectionId = firstSec.id;
  renderSection(firstSec.id);
  updateScoreBar();
}

function renderSectionNav() {
  const cfg = PROTOCOL_CONFIG[unitType];
  let html = '';
  for (const sec of cfg.sections) {
    const sd = sectionData[sec.id] || {};
    const pts = getPoints(sec, sd);
    const done = pts !== null;
    html += `<button class="sec-nav-btn ${currentSectionId===sec.id?'active':''} ${done?'done':''}"
      onclick="switchSection('${sec.id}')">${sec.name.replace(/^\d+\.\s*/,'')}<span class="sec-pts">${done ? pts+'/'+sec.maxPoints : '–'}</span></button>`;
  }
  document.getElementById('sectionNav').innerHTML = html;
}

function switchSection(id) {
  currentSectionId = id;
  renderSectionNav();
  renderSection(id);
}

function renderSection(id) {
  const cfg = PROTOCOL_CONFIG[unitType];
  const sec = cfg.sections.find(s => s.id === id);
  const sd  = sectionData[id];
  let html = `<div class="sec-header"><h2>${sec.name}</h2><div class="sec-maxpts">Maksymalnie: ${sec.maxPoints} pkt</div></div>`;

  if (sec.type === 'alarm')            html += renderAlarm(sec, sd);
  else if (sec.type === 'firefighters') html += renderFirefighters(sec, sd);
  else if (sec.type === 'checklist_points') html += renderChecklist(sec, sd);
  else if (sec.type === 'test_link')   html += renderTestLink(sec, sd);
  else if (sec.type === 'exercise')    html += renderExercise(sec, sd);

  html += `<div class="sec-pts-box">
    <span>Punkty sekcji: <strong id="secPtsLive">—</strong> / ${sec.maxPoints}</span>
  </div>`;

  document.getElementById('sectionContent').innerHTML = html;
  updateSecPts(sec, sd);
}

// ── ALARM ──────────────────────────────────────────────────────────────────
function renderAlarm(sec, sd) {
  const isMin = sec.alarmType === 'minutes';
  const unit  = isMin ? 'min' : 's';
  const curTime = sd.timeSeconds;

  let tableRows = sec.table.map(row => {
    const active = curTime !== null && timeToPoints(sec.table, curTime) === row.points && row.points === (curTime !== null ? timeToPoints(sec.table, curTime) : -1);
    return `<tr class="${curTime!==null && timeToPoints(sec.table, curTime)===row.points?'alarm-active':''}">
      <td>${row.label}</td><td><strong>${row.points} pkt</strong></td></tr>`;
  }).join('');

  return `
  <div class="alarm-wrap">
    <div class="stopwatch-display" id="swDisplay">${formatTime(swElapsed, isMin)}</div>
    <div class="stopwatch-btns">
      <button class="btn btn-danger" onclick="swStart()">▶ Start</button>
      <button class="btn btn-outline" onclick="swStop()">⏹ Stop</button>
      <button class="btn btn-outline btn-sm" onclick="swReset()">↺ Reset</button>
    </div>
    <div class="form-group" style="margin-top:16px;">
      <label>Czas wyjazdu (sekundy) – wpisz lub użyj stopera:</label>
      <input type="number" class="form-control" id="alarmTimeInput" min="0"
        value="${curTime !== null ? curTime : ''}"
        oninput="onAlarmInput()" placeholder="np. 75">
      ${isMin ? `<div style="color:#666;font-size:0.82rem;margin-top:4px;">= ${curTime !== null ? (curTime/60).toFixed(1) : '—'} min</div>` : ''}
    </div>
    <table class="alarm-table"><thead><tr><th>Czas wyjazdu</th><th>Punkty</th></tr></thead>
    <tbody>${tableRows}</tbody></table>
    <div class="alarm-result" id="alarmResult">
      ${curTime !== null ? `<div class="points-big">${timeToPoints(sec.table, curTime)} pkt</div><div>za czas ${formatTime(curTime, isMin)}</div>` : ''}
    </div>
  </div>`;
}

function swStart() {
  if (swRunning) return;
  swRunning = true;
  swStartTs = Date.now() - swElapsed * 1000;
  const secCfg = PROTOCOL_CONFIG[unitType].sections.find(s => s.id === currentSectionId);
  const isMin = secCfg && secCfg.alarmType === 'minutes';
  swInterval = setInterval(() => {
    swElapsed = Math.floor((Date.now() - swStartTs) / 1000);
    document.getElementById('swDisplay').textContent = formatTime(swElapsed, isMin);
    document.getElementById('alarmTimeInput').value = swElapsed;
    onAlarmInput();
  }, 500);
}

function swStop() {
  if (!swRunning) return;
  clearInterval(swInterval);
  swRunning = false;
}

function swReset() {
  swStop();
  swElapsed = 0;
  const secCfg = PROTOCOL_CONFIG[unitType].sections.find(s => s.id === currentSectionId);
  const isMin = secCfg && secCfg.alarmType === 'minutes';
  document.getElementById('swDisplay').textContent = formatTime(0, isMin);
  document.getElementById('alarmTimeInput').value = '';
  sectionData[currentSectionId].timeSeconds = null;
  sectionData[currentSectionId].points = null;
  updateSecPts(secCfg, sectionData[currentSectionId]);
  updateScoreBar();
}

function onAlarmInput() {
  const val = parseInt(document.getElementById('alarmTimeInput').value);
  const secCfg = PROTOCOL_CONFIG[unitType].sections.find(s => s.id === currentSectionId);
  if (isNaN(val) || val < 0) {
    sectionData[currentSectionId].timeSeconds = null;
    sectionData[currentSectionId].points = null;
  } else {
    const pts = timeToPoints(secCfg.table, val);
    sectionData[currentSectionId].timeSeconds = val;
    sectionData[currentSectionId].points = pts;
    const isMin = secCfg.alarmType === 'minutes';
    document.getElementById('alarmResult').innerHTML = `<div class="points-big">${pts} pkt</div><div>za czas ${formatTime(val, isMin)}</div>`;
    // highlight active row
    document.querySelectorAll('.alarm-table tbody tr').forEach((tr, i) => {
      tr.classList.toggle('alarm-active', timeToPoints(secCfg.table, val) === secCfg.table[i].points &&
        (i === 0 || val > secCfg.table[i-1].maxSec));
    });
  }
  updateSecPts(secCfg, sectionData[currentSectionId]);
  updateScoreBar();
  autoSave();
}

function timeToPoints(table, seconds) {
  for (const row of table) {
    if (seconds <= row.maxSec) return row.points;
  }
  return 0;
}

function formatTime(seconds, asMinutes) {
  if (asMinutes) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
  return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
}

// ── FIREFIGHTERS ────────────────────────────────────────────────────────────
function renderFirefighters(sec, sd) {
  let rows = sd.people.map((p, i) => renderFFRow(sec, p, i)).join('');
  return `
  <div class="ff-wrap">
    <p style="color:var(--dark-gray);font-size:0.85rem;margin-bottom:12px;">Dodaj ratowników i sprawdź wyposażenie każdego z nich. Zaznaczenie „✗" odejmuje punkty.</p>
    <div id="ffList">${rows}</div>
    <button class="btn btn-outline" onclick="addFirefighter()">➕ Dodaj ratownika</button>
    <div class="ff-summary" id="ffSummary"></div>
  </div>`;
}

function renderFFRow(sec, person, idx) {
  const checks = sec.checks.map(ch => `
    <label class="ff-check ${person.checks && person.checks[ch.id] === false ? 'err' : ''}">
      <input type="checkbox" ${!person.checks || person.checks[ch.id] !== false ? 'checked' : ''}
        onchange="ffCheckChange(${idx}, '${ch.id}', this.checked)">
      ${ch.name} <span style="color:#c0392b;font-size:0.75rem;">(–${ch.penalty} pkt)</span>
    </label>`).join('');
  return `
  <div class="ff-row" id="ff-row-${idx}">
    <div class="ff-row-header">
      <input type="text" class="form-control ff-name" placeholder="Imię i nazwisko ratownika"
        value="${esc(person.name || '')}" oninput="ffNameChange(${idx}, this.value)">
      <button class="btn btn-outline btn-sm" onclick="removeFirefighter(${idx})">✕</button>
    </div>
    <div class="ff-checks">${checks}</div>
  </div>`;
}

function addFirefighter() {
  const sec = PROTOCOL_CONFIG[unitType].sections.find(s => s.id === currentSectionId);
  const checks = {};
  for (const ch of sec.checks) checks[ch.id] = true;
  sectionData[currentSectionId].people.push({ name: '', checks });
  const idx = sectionData[currentSectionId].people.length - 1;
  const row = document.createElement('div');
  row.innerHTML = renderFFRow(sec, sectionData[currentSectionId].people[idx], idx);
  document.getElementById('ffList').appendChild(row.firstElementChild);
  calcFFPoints(sec);
}

function removeFirefighter(idx) {
  const sec = PROTOCOL_CONFIG[unitType].sections.find(s => s.id === currentSectionId);
  sectionData[currentSectionId].people.splice(idx, 1);
  renderSection(currentSectionId);
  calcFFPoints(sec);
}

function ffNameChange(idx, val) {
  sectionData[currentSectionId].people[idx].name = val;
  autoSave();
}

function ffCheckChange(idx, checkId, checked) {
  const sec = PROTOCOL_CONFIG[unitType].sections.find(s => s.id === currentSectionId);
  sectionData[currentSectionId].people[idx].checks[checkId] = checked;
  calcFFPoints(sec);
  const row = document.getElementById(`ff-row-${idx}`);
  if (row) {
    const label = row.querySelector(`input[onchange*="'${checkId}'"]`)?.closest('label');
    if (label) label.classList.toggle('err', !checked);
  }
}

function calcFFPoints(sec) {
  const sd = sectionData[sec.id];
  if (!sd.people.length) { sd.points = sec.maxPoints; }
  else {
    let totalPenalty = 0;
    for (const p of sd.people) {
      for (const ch of sec.checks) {
        if (p.checks && p.checks[ch.id] === false) totalPenalty += ch.penalty;
      }
    }
    sd.points = Math.max(0, sec.maxPoints - totalPenalty);
  }
  updateSecPts(sec, sd);
  updateScoreBar();
  autoSave();
}

// ── CHECKLIST POINTS ────────────────────────────────────────────────────────
function renderChecklist(sec, sd) {
  const rows = sec.items.map(it => {
    const val = sd.items[it.id] || 'ok';
    return `
    <div class="chk-row">
      <div class="chk-name">${it.name}</div>
      <div class="chk-controls">
        <span class="chk-pts-label">${it.points} pkt</span>
        <label class="radio-opt ${val==='ok'?'sel-ok':''}">
          <input type="radio" name="chk_${it.id}" value="ok" ${val==='ok'?'checked':''}
            onchange="chkChange('${sec.id}','${it.id}','ok')"> ✅ OK
        </label>
        <label class="radio-opt ${val==='partial'?'sel-partial':''}">
          <input type="radio" name="chk_${it.id}" value="partial" ${val==='partial'?'checked':''}
            onchange="chkChange('${sec.id}','${it.id}','partial')"> ⚠️ Częściowo (½)
        </label>
        <label class="radio-opt ${val==='no'?'sel-no':''}">
          <input type="radio" name="chk_${it.id}" value="no" ${val==='no'?'checked':''}
            onchange="chkChange('${sec.id}','${it.id}','no')"> ❌ Brak / nie
        </label>
      </div>
    </div>`;
  }).join('');
  return `<div class="chk-wrap">${rows}</div>`;
}

function chkChange(secId, itemId, val) {
  sectionData[secId].items[itemId] = val;
  const sec = PROTOCOL_CONFIG[unitType].sections.find(s => s.id === secId);
  calcChecklistPoints(sec, sectionData[secId]);
  // update radio label classes
  document.querySelectorAll(`[name="chk_${itemId}"]`).forEach(r => {
    const lbl = r.closest('label');
    lbl.className = `radio-opt${r.value===val?' sel-'+val:''}`;
  });
}

function calcChecklistPoints(sec, sd) {
  let pts = 0;
  for (const it of sec.items) {
    const v = sd.items[it.id] || 'ok';
    if (v === 'ok')      pts += it.points;
    else if (v === 'partial') pts += it.points * 0.5;
  }
  sd.points = Math.round(pts * 2) / 2;
  updateSecPts(sec, sd);
  updateScoreBar();
  autoSave();
}

// ── TEST LINK ───────────────────────────────────────────────────────────────
function renderTestLink(sec, sd) {
  const catLabel = { kierowcy: 'Kierowcy', dowodcy: 'Dowódcy', stanowiska_kierowania: 'St. Kierowania' };
  const cat = sec.category;
  const relevant = sessionResults.filter(r => r.category === cat);

  let opts = '<option value="">— wybierz wynik testu —</option>';
  opts += '<option value="manual">✏️ Wpisz ręcznie</option>';
  for (const r of relevant) {
    const pct = Math.round(r.score/r.total*100);
    opts += `<option value="${r.id}" ${sd.resultId==r.id?'selected':''}>${esc(r.unit)} – ${r.score}/${r.total} (${pct}%)</option>`;
  }

  const manual = sd.resultId === 'manual' || (!sd.resultId && sd.score !== null);

  return `
  <div class="test-link-wrap">
    <p style="color:var(--dark-gray);font-size:0.85rem;">Powiąż wynik testu z tego protokołu lub wpisz punkty ręcznie.<br>Kategoria testu: <strong>${catLabel[cat]||cat}</strong> (max ${sec.maxPoints} pkt)</p>
    <div class="form-group">
      <label>Wybierz wynik testu z sesji:</label>
      <select class="form-control" id="testResultSelect" onchange="testSelectChange('${sec.id}')">
        ${opts}
      </select>
    </div>
    <div id="testManualDiv" style="display:${manual?'block':'none'}">
      <div class="form-group">
        <label>Wynik (punkty uzyskane / max ${sec.maxPoints}):</label>
        <input type="number" class="form-control" id="testManualScore" min="0" max="${sec.maxPoints}"
          value="${sd.score !== null ? sd.score : ''}"
          oninput="testManualInput('${sec.id}')">
      </div>
    </div>
    <div class="alarm-result" id="testResult">
      ${sd.points !== null ? `<div class="points-big">${sd.points} pkt</div>` : ''}
    </div>
  </div>`;
}

function testSelectChange(secId) {
  const sel = document.getElementById('testResultSelect');
  const val = sel.value;
  const sec = PROTOCOL_CONFIG[unitType].sections.find(s => s.id === secId);
  const sd  = sectionData[secId];

  if (!val) {
    sd.resultId = null; sd.score = null; sd.total = null; sd.points = null;
    document.getElementById('testManualDiv').style.display = 'none';
  } else if (val === 'manual') {
    sd.resultId = 'manual';
    document.getElementById('testManualDiv').style.display = 'block';
  } else {
    const result = sessionResults.find(r => r.id == val);
    sd.resultId = val;
    sd.score  = result.score;
    sd.total  = result.total;
    sd.points = Math.min(result.score, sec.maxPoints);
    document.getElementById('testManualDiv').style.display = 'none';
    document.getElementById('testResult').innerHTML = `<div class="points-big">${sd.points} pkt</div>`;
  }
  updateSecPts(sec, sd);
  updateScoreBar();
  autoSave();
}

function testManualInput(secId) {
  const val = parseInt(document.getElementById('testManualScore').value);
  const sec = PROTOCOL_CONFIG[unitType].sections.find(s => s.id === secId);
  const sd  = sectionData[secId];
  if (!isNaN(val) && val >= 0) {
    sd.score  = val;
    sd.points = Math.min(val, sec.maxPoints);
    document.getElementById('testResult').innerHTML = `<div class="points-big">${sd.points} pkt</div>`;
  } else {
    sd.points = null;
  }
  updateSecPts(sec, sd);
  updateScoreBar();
  autoSave();
}

// ── EXERCISE ────────────────────────────────────────────────────────────────
function renderExercise(sec, sd) {
  const errorRows = sec.errors.map(e => {
    const checked = sd.errors[e.id]?.checked;
    const cnt = sd.errors[e.id]?.count || 1;
    return `
    <div class="ex-row ${checked ? 'ex-checked' : ''}">
      <label class="ex-label">
        <input type="checkbox" ${checked ? 'checked' : ''} onchange="exCheck('${sec.id}','${e.id}',this.checked)">
        <span>${e.name}</span>
      </label>
      <div class="ex-penalty">
        <span class="badge badge-fail">–${e.penalty} pkt</span>
        ${checked ? `<input type="number" class="ex-count" value="${cnt}" min="1" max="10"
          title="Ile razy" oninput="exCount('${sec.id}','${e.id}',this.value)">×` : ''}
      </div>
    </div>`;
  }).join('');

  const extraRows = (sd.extraErrors||[]).map((e, i) => `
    <div class="ex-row ex-extra ex-checked">
      <input type="text" class="form-control ex-extra-name" value="${esc(e.name)}"
        oninput="exExtraName('${sec.id}',${i},this.value)" placeholder="Opis uchybienia">
      <div class="ex-penalty">
        <input type="number" class="ex-count" value="${e.penalty}" min="0" max="50"
          oninput="exExtraPenalty('${sec.id}',${i},this.value)"> pkt kara
        <button class="btn btn-outline btn-sm" onclick="exExtraRemove('${sec.id}',${i})">✕</button>
      </div>
    </div>`).join('');

  return `
  <div class="ex-wrap">
    <p style="color:var(--dark-gray);font-size:0.85rem;margin-bottom:12px;">
      Start: <strong>${sec.maxPoints} pkt</strong>. Zaznacz stwierdzone uchybienia – punkty będą odejmowane automatycznie.
    </p>
    <div id="exList">${errorRows}</div>
    <div id="exExtraList">${extraRows}</div>
    <button class="btn btn-outline btn-sm" onclick="exAddExtra('${sec.id}')" style="margin-top:8px;">➕ Dodaj własne uchybienie</button>
    <div class="ex-result" id="exResult">
      <div class="points-big" id="exPtsBig">${sd.points} pkt</div>
      <div id="exPenaltySum"></div>
    </div>
    <div class="form-group" style="margin-top:16px;">
      <label>Uwagi do ćwiczenia:</label>
      <textarea class="form-control" rows="3" id="exNotes" oninput="exNotesChange('${sec.id}',this.value)">${sd.notes || ''}</textarea>
    </div>
  </div>`;
}

function calcExercise(secId) {
  const sec = PROTOCOL_CONFIG[unitType].sections.find(s => s.id === secId);
  const sd  = sectionData[secId];
  let penalty = 0;
  for (const e of sec.errors) {
    if (sd.errors[e.id]?.checked) penalty += e.penalty * (sd.errors[e.id].count || 1);
  }
  for (const e of (sd.extraErrors || [])) {
    penalty += parseFloat(e.penalty) || 0;
  }
  sd.points = Math.max(0, sec.maxPoints - penalty);
  const el = document.getElementById('exPtsBig');
  if (el) el.textContent = sd.points + ' pkt';
  const pen = document.getElementById('exPenaltySum');
  if (pen) pen.textContent = penalty > 0 ? `Odliczono: –${penalty} pkt` : '';
  updateSecPts(sec, sd);
  updateScoreBar();
  autoSave();
}

function exCheck(secId, errorId, checked) {
  sectionData[secId].errors[errorId].checked = checked;
  sectionData[secId].errors[errorId].count = 1;
  calcExercise(secId);
  renderSection(secId); // re-render to show/hide count
}

function exCount(secId, errorId, val) {
  sectionData[secId].errors[errorId].count = Math.max(1, parseInt(val) || 1);
  calcExercise(secId);
}

function exNotesChange(secId, val) {
  sectionData[secId].notes = val;
  autoSave();
}

function exAddExtra(secId) {
  if (!sectionData[secId].extraErrors) sectionData[secId].extraErrors = [];
  sectionData[secId].extraErrors.push({ name: '', penalty: 1 });
  calcExercise(secId);
  renderSection(secId);
}

function exExtraName(secId, idx, val) {
  sectionData[secId].extraErrors[idx].name = val;
  autoSave();
}

function exExtraPenalty(secId, idx, val) {
  sectionData[secId].extraErrors[idx].penalty = parseFloat(val) || 0;
  calcExercise(secId);
}

function exExtraRemove(secId, idx) {
  sectionData[secId].extraErrors.splice(idx, 1);
  calcExercise(secId);
  renderSection(secId);
}

// ── score helpers ──────────────────────────────────────────────────────────
function getPoints(sec, sd) {
  if (!sd) return null;
  if (sec.type === 'alarm') return sd.points;
  if (sec.type === 'firefighters') return sd.people.length > 0 ? sd.points : null;
  if (sec.type === 'checklist_points') {
    let pts = 0;
    for (const it of sec.items) {
      const v = sd.items[it.id] || 'ok';
      if (v === 'ok') pts += it.points;
      else if (v === 'partial') pts += it.points * 0.5;
    }
    return Math.round(pts * 2) / 2;
  }
  if (sec.type === 'test_link') return sd.points;
  if (sec.type === 'exercise') return sd.points !== undefined ? sd.points : sec.maxPoints;
  return null;
}

function updateSecPts(sec, sd) {
  const pts = getPoints(sec, sd);
  const el  = document.getElementById('secPtsLive');
  if (el) el.textContent = pts !== null ? pts : '—';
}

function updateScoreBar() {
  const cfg = PROTOCOL_CONFIG[unitType];
  let total = 0, allFilled = true;
  for (const sec of cfg.sections) {
    const pts = getPoints(sec, sectionData[sec.id] || {});
    if (pts === null) allFilled = false;
    else total += pts;
  }
  total = Math.round(total * 10) / 10;
  const pct = Math.round(total / cfg.maxPoints * 100);
  const grade = calcGrade(pct);

  document.getElementById('totalPts').textContent = total;
  document.getElementById('maxPts').textContent   = cfg.maxPoints;
  document.getElementById('totalPct').textContent = pct + '%';
  document.getElementById('gradeDisplay').textContent = grade ? `Ocena: ${grade.grade} (${grade.label})` : '—';
  document.getElementById('gradeDisplay').style.color = grade ? grade.color : '#666';
  document.getElementById('scoreBar').style.width = pct + '%';
  document.getElementById('scoreBar').style.background = grade ? grade.color : '#ccc';

  renderSectionNav();
}

function calcGrade(pct) {
  for (const g of GRADE_SCALE) {
    if (pct >= g.minPct) return g;
  }
  return GRADE_SCALE[GRADE_SCALE.length - 1];
}

// ── save ───────────────────────────────────────────────────────────────────
let saveTimeout = null;
function autoSave() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(saveProtocol, 2000);
}

async function saveProtocol() {
  clearTimeout(saveTimeout);
  if (!protocolId) return;
  const cfg  = PROTOCOL_CONFIG[unitType];
  let total = 0;
  for (const sec of cfg.sections) {
    const pts = getPoints(sec, sectionData[sec.id] || {});
    if (pts !== null) total += pts;
  }
  total = Math.round(total * 10) / 10;
  const pct   = Math.round(total / cfg.maxPoints * 100);
  const grade = calcGrade(pct);

  document.getElementById('saveStatus').textContent = '💾 Zapisywanie…';
  try {
    await fetch(`/api/protocols/${protocolId}`, {
      method: 'PUT',
      headers: authH_(),
      body: JSON.stringify({
        sections_json: sectionData,
        total_points:  total,
        max_points:    cfg.maxPoints,
        grade:         grade ? grade.grade : 0
      })
    });
    document.getElementById('saveStatus').textContent = '✅ Zapisano';
    setTimeout(() => { document.getElementById('saveStatus').textContent = ''; }, 2000);
  } catch(e) {
    document.getElementById('saveStatus').textContent = '⚠️ Błąd zapisu';
  }
}

function openPrint() {
  if (!protocolId) { alert('Najpierw zapisz protokół'); return; }
  sessionStorage.setItem('sessionCreds', JSON.stringify({ u: authU, h: authH }));
  window.open(`/protocol/print/${protocolId}`, '_blank');
}

function goBack() {
  if (sessionId) {
    sessionStorage.setItem('sessionCreds', JSON.stringify({ u: authU, h: authH }));
    window.location.href = `/session/${sessionId}`;
  } else {
    window.location.href = '/';
  }
}

function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
