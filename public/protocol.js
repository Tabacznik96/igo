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
        id: 'exercise', name: '5. Ćwiczenie', maxPoints: 50, type: 'exercise',
        criticalErrors: [
          { id: 'crit01', name: 'Pozostawienie poszkodowanego/ratownika w strefie zagrożenia' },
          { id: 'crit02', name: 'Rażące naruszenie BHP – bezpośrednie zagrożenie życia lub zdrowia' },
          { id: 'crit03', name: 'Niewykonanie nakazu przerwania ćwiczenia przez prowadzącego' },
          { id: 'crit04', name: 'Całkowita utrata kontroli nad działaniem gaśniczym / akcją ratowniczą' }
        ],
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
      },
      {
        id: 'test', name: '6. Test wiedzy', maxPoints: 15, type: 'test_link',
        category: 'kierowcy'
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
        id: 'exercise', name: '4. Ćwiczenie', maxPoints: 40, type: 'exercise',
        criticalErrors: [
          { id: 'crit01', name: 'Pozostawienie poszkodowanego/ratownika w strefie zagrożenia' },
          { id: 'crit02', name: 'Rażące naruszenie BHP – bezpośrednie zagrożenie życia lub zdrowia' },
          { id: 'crit03', name: 'Niewykonanie nakazu przerwania ćwiczenia przez prowadzącego' },
          { id: 'crit04', name: 'Całkowita utrata kontroli nad działaniem gaśniczym / akcją ratowniczą' }
        ],
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
      },
      {
        id: 'test', name: '5. Test wiedzy', maxPoints: 10, type: 'test_link',
        category: 'kierowcy'
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
        criticalErrors: [
          { id: 'crit01', name: 'Całkowity brak reakcji na zgłoszenie zdarzenia (niepodjęcie działań)' },
          { id: 'crit02', name: 'Dysponowanie sił i środków niezgodne z planem – brak dysponowania do zdarzenia' },
          { id: 'crit03', name: 'Niewykonanie nakazu przerwania symulacji przez prowadzącego' },
          { id: 'crit04', name: 'Rażące naruszenie przepisów dot. działania SK – zagrożenie dla ludzi' }
        ],
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

// Alarm procedure checklist items per unit type
const ALARM_CHECKLISTS = {
  jrg: [
    'całkowite otwarcie bramy garażowej',
    'założenie przez załogę ubrań specjalnych',
    'zajęcie miejsc oraz zapięcie pasów bezpieczeństwa w samochodzie pożarniczym',
    'zamknięcie przez załogę drzwi oraz skrytek',
    'włączenie świateł drogowych lub mijania',
    'włączenie sygnałów alarmowych świetlnych i akustycznych'
  ],
  osp: [
    'całkowite otwarcie bramy garażowej',
    'założenie przez załogę ubrań specjalnych',
    'zajęcie miejsc oraz zapięcie pasów bezpieczeństwa w samochodzie pożarniczym',
    'zamknięcie przez załogę drzwi oraz skrytek',
    'włączenie świateł drogowych lub mijania',
    'włączenie sygnałów alarmowych świetlnych i akustycznych',
    'zgłoszenia wyjazdu zadysponowanego zastępu drogą radiową'
  ],
  sk: []
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
  const params = new URLSearchParams(location.search);
  if (params.get('u') && params.get('h')) {
    authU = params.get('u');
    authH = params.get('h');
  } else {
    try {
      const c = JSON.parse(sessionStorage.getItem('sessionCreds') || '{}');
      authU = c.u || ''; authH = c.h || '';
    } catch(e) {}
  }

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

function showSetupError(msg) {
  let el = document.getElementById('setupError');
  if (!el) {
    el = document.createElement('div');
    el.id = 'setupError';
    el.style.cssText = 'background:#f8d7da;border:2px solid #e74c3c;padding:12px;border-radius:6px;color:#721c24;margin:12px 0;font-size:1rem;font-weight:bold;';
    const btn = document.getElementById('startBtn');
    if (btn) btn.parentNode.insertBefore(el, btn);
    else document.body.prepend(el);
  }
  el.textContent = '❌ ' + msg;
  el.style.display = 'block';
}

async function startProtocol() {
  const errEl = document.getElementById('setupError');
  if (errEl) errEl.style.display = 'none';

  unitName = document.getElementById('unitNameInput').value.trim();
  unitType = document.getElementById('unitTypeSelect').value;
  if (!unitName) { showSetupError('Podaj nazwę jednostki'); return; }

  const btn = document.getElementById('startBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Tworzenie…'; }

  try {
    const r = await fetch(`/api/protocols/session/${sessionId}`, {
      method: 'POST',
      headers: authH_(),
      body: JSON.stringify({ unit: unitName, unit_type: unitType })
    });
    const d = await r.json();
    if (!d.ok) { showSetupError('Błąd ' + r.status + ': ' + (d.error || 'Nie udało się utworzyć protokołu')); return; }
    protocolId = d.id;
    initSectionData();
    await loadSessionResults();
    renderMainScreen();
  } catch(e) {
    showSetupError('Błąd połączenia: ' + e.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '▶ Rozpocznij protokół'; }
  }
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

  // Protocol-level metadata
  sectionData.meta = {
    location: '',
    teamMembers: [
      { name: '', role: 'przewodniczący Zespołu' },
      { name: '', role: 'członek Zespołu' },
      { name: '', role: 'członek Zespołu' },
      { name: '', role: 'członek Zespołu' }
    ],
    hourFrom: '', hourTo: '',
    presence: [{ name: '', role: '' }, { name: '', role: '' }],
    recommendations: ['', '', '', '', ''],
    serviceNotes: '',
    dorazneActions: '',
    uwagiFinal: ''
  };

  const cfg = PROTOCOL_CONFIG[unitType];
  for (const sec of cfg.sections) {
    if (sec.type === 'alarm') {
      const cl = {};
      (ALARM_CHECKLISTS[unitType] || []).forEach((_, i) => { cl[i+1] = false; });
      sectionData[sec.id] = { timeSeconds: null, points: null, alarmChecklist: cl, notes: '' };
    } else if (sec.type === 'firefighters') {
      sectionData[sec.id] = { people: [], points: sec.maxPoints, commanderName: '', deputyName: '', shiftLeaderName: '', notes21: '', notes22: '', notes: '' };
    } else if (sec.type === 'checklist_points') {
      const items = {};
      for (const it of sec.items) items[it.id] = 'ok';
      sectionData[sec.id] = { items, points: sec.maxPoints, notes: '', withdrawnVehicles: [] };
    } else if (sec.type === 'test_link') {
      sectionData[sec.id] = { resultId: null, score: null, total: null, points: null, avgDownodcy: '', avgRatownicy: '', avgKierowcy: '', notes: '' };
    } else if (sec.type === 'exercise') {
      const errors = {};
      for (const e of sec.errors) errors[e.id] = { checked: false, count: 1 };
      const criticalErrors = {};
      for (const e of (sec.criticalErrors || [])) criticalErrors[e.id] = false;
      sectionData[sec.id] = { errors, criticalErrors, extraErrors: [], points: sec.maxPoints, assumption: '', notes: '' };
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
  let html = `<button class="sec-nav-btn ${currentSectionId==='meta'?'active':''} done"
    onclick="switchSection('meta')">📋 Dane protokołu<span class="sec-pts">—</span></button>`;
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
  // On mobile scroll content into view
  const content = document.getElementById('sectionContent');
  if (content) content.scrollIntoView({ behavior: 'smooth', block: 'start' });
  // Also scroll active nav button into view in horizontal strip
  setTimeout(() => {
    const activeBtn = document.querySelector('.sec-nav-btn.active');
    if (activeBtn) activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, 50);
}

// ── META (protocol-level data) ──────────────────────────────────────────────
function renderMeta(m) {
  const tm = m.teamMembers || [];
  const teamRows = tm.map((t, i) => `
    <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px;">
      <span style="min-width:20px;font-weight:bold;">${i+1}.</span>
      <input type="text" class="form-control" style="flex:2;" placeholder="Imię i nazwisko"
        value="${esc(t.name)}" oninput="metaTeamName(${i},this.value)">
      <input type="text" class="form-control" style="flex:1;" placeholder="Rola"
        value="${esc(t.role)}" oninput="metaTeamRole(${i},this.value)">
    </div>`).join('');

  const presRows = (m.presence||[]).map((p, i) => `
    <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px;">
      <span style="min-width:20px;font-weight:bold;">${i+1}.</span>
      <input type="text" class="form-control" style="flex:2;" placeholder="Imię i nazwisko"
        value="${esc(p.name)}" oninput="metaPresenceName(${i},this.value)">
      <input type="text" class="form-control" style="flex:1;" placeholder="Stanowisko/funkcja"
        value="${esc(p.role)}" oninput="metaPresenceRole(${i},this.value)">
    </div>`).join('');

  const rec = m.recommendations || ['','','','',''];
  const recRows = rec.map((r, i) => `
    <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px;">
      <span style="min-width:20px;font-weight:bold;">${i+1}.</span>
      <input type="text" class="form-control" value="${esc(r)}" oninput="metaRec(${i},this.value)" placeholder="Zalecenie…">
    </div>`).join('');

  return `<div style="padding:4px 0;">

  <div class="form-group">
    <label style="font-weight:bold;">Miejscowość inspekcji</label>
    <input type="text" class="form-control" value="${esc(m.location||'')}" oninput="metaSet('location',this.value)" placeholder="np. Kraków">
  </div>

  <div class="form-group">
    <label style="font-weight:bold;">Skład zespołu inspekcyjnego</label>
    <div style="font-size:0.82rem;color:#666;margin-bottom:6px;">Wpisz imię i nazwisko każdego członka zespołu</div>
    ${teamRows}
  </div>

  <div class="form-group">
    <label style="font-weight:bold;">Godziny inspekcji</label>
    <div style="display:flex;gap:12px;align-items:center;">
      <input type="time" class="form-control" style="width:140px;" value="${esc(m.hourFrom||'')}" oninput="metaSet('hourFrom',this.value)">
      <span>—</span>
      <input type="time" class="form-control" style="width:140px;" value="${esc(m.hourTo||'')}" oninput="metaSet('hourTo',this.value)">
    </div>
  </div>

  <div class="form-group">
    <label style="font-weight:bold;">Osoby obecne podczas inspekcji</label>
    ${presRows}
  </div>

  <hr style="margin:16px 0;">
  <div style="font-weight:bold;font-size:1rem;margin-bottom:10px;">VII. Zalecenia zespołu inspekcyjnego</div>
  ${recRows}

  <div class="form-group">
    <label style="font-weight:bold;">Uwagi do warunków pełnienia służby</label>
    <textarea class="form-control" rows="3" oninput="metaSet('serviceNotes',this.value)"
      placeholder="Zastrzeżenia dot. zakwaterowania, stanu pomieszczeń, itp.">${esc(m.serviceNotes||'')}</textarea>
  </div>

  <hr style="margin:16px 0;">
  <div class="form-group">
    <label style="font-weight:bold;">IX. Doraźne działania podjęte podczas inspekcji</label>
    <textarea class="form-control" rows="3" oninput="metaSet('dorazneActions',this.value)"
      placeholder="Opisać podjęte działania lub wpisać: „Nie podejmowano".">${esc(m.dorazneActions||'')}</textarea>
  </div>

  <div class="form-group">
    <label style="font-weight:bold;">X. Uwagi i wnioski</label>
    <textarea class="form-control" rows="4" oninput="metaSet('uwagiFinal',this.value)"
      placeholder="Uwagi, odmowa podpisania protokołu lub „Uwag nie wniesiono".">${esc(m.uwagiFinal||'')}</textarea>
  </div>

  </div>`;
}

function metaSet(key, val) {
  sectionData.meta[key] = val;
  autoSave();
}
function metaTeamName(i, val) {
  sectionData.meta.teamMembers[i].name = val; autoSave();
}
function metaTeamRole(i, val) {
  sectionData.meta.teamMembers[i].role = val; autoSave();
}
function metaPresenceName(i, val) {
  sectionData.meta.presence[i].name = val; autoSave();
}
function metaPresenceRole(i, val) {
  sectionData.meta.presence[i].role = val; autoSave();
}
function metaRec(i, val) {
  sectionData.meta.recommendations[i] = val; autoSave();
}

function renderSection(id) {
  if (id === 'meta') {
    document.getElementById('sectionContent').innerHTML =
      `<div class="sec-header"><h2>📋 Dane protokołu</h2><div class="sec-maxpts">Informacje do wydruku</div></div>` +
      renderMeta(sectionData.meta);
    return;
  }
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
    ${renderAlarmChecklist(sd)}
    <div class="form-group" style="margin-top:12px;">
      <label>Uwagi w zakresie alarmowania:</label>
      <textarea class="form-control" rows="2" oninput="alarmNotesChange(this.value)"
        placeholder="Uwagi i wnioski…">${esc(sd.notes||'')}</textarea>
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

function renderAlarmChecklist(sd) {
  const items = ALARM_CHECKLISTS[unitType] || [];
  if (!items.length) return '';
  const cl = sd.alarmChecklist || {};
  const rows = items.map((name, i) => {
    const checked = cl[i+1] || false;
    return `<div style="display:flex;align-items:center;gap:10px;padding:5px 0;border-bottom:1px solid #eee;">
      <input type="checkbox" ${checked?'checked':''} onchange="alarmClCheck(${i+1},this.checked)"
        style="width:18px;height:18px;cursor:pointer;">
      <span style="${checked?'color:#c0392b;font-weight:600;':''}">${i+1}. ${name}</span>
      ${checked?'<span style="margin-left:auto;background:#f8d7da;color:#c0392b;padding:2px 8px;border-radius:4px;font-size:0.82rem;">pkt karny</span>':''}
    </div>`;
  }).join('');
  const anyChecked = Object.values(cl).some(v=>v);
  return `<div style="margin-top:14px;">
    <div style="font-weight:bold;margin-bottom:6px;font-size:0.9rem;">Przebieg alarmowania – zaznacz niespełnione elementy:</div>
    <div style="border:1px solid #ddd;border-radius:6px;padding:8px 12px;background:#fafafa;">
      ${rows}
    </div>
    ${anyChecked?`<div style="margin-top:6px;font-size:0.85rem;color:#c0392b;">⚠️ Zaznaczone pozycje zostaną ujęte jako punkty karne w protokole.</div>`:''}
  </div>`;
}

function alarmClCheck(idx, checked) {
  if (!sectionData[currentSectionId].alarmChecklist) sectionData[currentSectionId].alarmChecklist = {};
  sectionData[currentSectionId].alarmChecklist[idx] = checked;
  renderSection(currentSectionId);
  autoSave();
}

function alarmNotesChange(val) {
  sectionData[currentSectionId].notes = val;
  autoSave();
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
  const shiftBlock = (unitType === 'jrg') ? `
    <div style="border:1px solid #ddd;border-radius:6px;padding:12px;margin-bottom:14px;background:#f9f9f9;">
      <div style="font-weight:bold;margin-bottom:10px;">Skład zmiany służbowej</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px;">
        <div class="form-group" style="margin:0;">
          <label style="font-size:0.82rem;">Dowódca jednostki</label>
          <input type="text" class="form-control" value="${esc(sd.commanderName||'')}"
            oninput="ffMetaChange('commanderName',this.value)" placeholder="Imię i nazwisko">
        </div>
        <div class="form-group" style="margin:0;">
          <label style="font-size:0.82rem;">Zastępca Dowódcy</label>
          <input type="text" class="form-control" value="${esc(sd.deputyName||'')}"
            oninput="ffMetaChange('deputyName',this.value)" placeholder="Imię i nazwisko">
        </div>
        <div class="form-group" style="margin:0;">
          <label style="font-size:0.82rem;">Dowódca zmiany</label>
          <input type="text" class="form-control" value="${esc(sd.shiftLeaderName||'')}"
            oninput="ffMetaChange('shiftLeaderName',this.value)" placeholder="Imię i nazwisko">
        </div>
      </div>
      <div class="form-group" style="margin:0 0 8px;">
        <label style="font-size:0.82rem;">2.1 Ocena stanu zmiany służbowej – uwagi</label>
        <textarea class="form-control" rows="2" oninput="ffMetaChange('notes21',this.value)"
          placeholder="Uwagi dot. stanu minimalnego, zgodności z SWD PSP…">${esc(sd.notes21||'')}</textarea>
      </div>
      <div class="form-group" style="margin:0;">
        <label style="font-size:0.82rem;">2.2 Ocena stanu psychofizycznego – uwagi (lub BK)</label>
        <textarea class="form-control" rows="2" oninput="ffMetaChange('notes22',this.value)"
          placeholder="Brak uwag / błąd krytyczny – opis…">${esc(sd.notes22||'')}</textarea>
      </div>
    </div>` : '';

  return `
  <div class="ff-wrap">
    ${shiftBlock}
    <p style="color:var(--dark-gray);font-size:0.85rem;margin-bottom:12px;">Dodaj ratowników i sprawdź wyposażenie każdego z nich. Zaznaczenie „✗" odejmuje punkty.</p>
    <div id="ffList">${rows}</div>
    <button class="btn btn-outline" onclick="addFirefighter()">➕ Dodaj ratownika</button>
    <div class="ff-summary" id="ffSummary"></div>
    <div class="form-group" style="margin-top:12px;">
      <label>Uwagi ogólne do działu:</label>
      <textarea class="form-control" rows="2" oninput="ffMetaChange('notes',this.value)"
        placeholder="Uwagi…">${esc(sd.notes||'')}</textarea>
    </div>
  </div>`;
}

function ffMetaChange(key, val) {
  sectionData[currentSectionId][key] = val;
  autoSave();
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
    const note = (sd.itemNotes && sd.itemNotes[it.id]) || '';
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
      <input type="text" class="form-control" style="margin-top:4px;font-size:0.82rem;"
        placeholder="Uwagi do pozycji…" value="${esc(note)}"
        oninput="chkItemNote('${sec.id}','${it.id}',this.value)">
    </div>`;
  }).join('');

  // Withdrawn vehicles table - shown for vehicles section
  const wvBlock = sec.id === 'vehicles' ? renderWithdrawnVehicles(sd) : '';

  return `<div class="chk-wrap">
    ${rows}
    ${wvBlock}
    <div class="form-group" style="margin-top:12px;">
      <label>Uwagi ogólne do działu:</label>
      <textarea class="form-control" rows="2" oninput="chkNotes('${sec.id}',this.value)"
        placeholder="Uwagi…">${esc(sd.notes||'')}</textarea>
    </div>
  </div>`;
}

function renderWithdrawnVehicles(sd) {
  const wv = sd.withdrawnVehicles || [];
  const rows = wv.map((v, i) => `
    <tr>
      <td style="width:30px;text-align:center;font-size:0.85rem;">${i+1}</td>
      <td><input type="text" class="form-control" style="font-size:0.82rem;" value="${esc(v.name)}"
        oninput="wvChange(${i},'name',this.value)" placeholder="Rodzaj pojazdu/sprzętu"></td>
      <td style="width:110px;"><input type="date" class="form-control" style="font-size:0.82rem;" value="${esc(v.date)}"
        oninput="wvChange(${i},'date',this.value)"></td>
      <td><input type="text" class="form-control" style="font-size:0.82rem;" value="${esc(v.reason)}"
        oninput="wvChange(${i},'reason',this.value)" placeholder="Powód wycofania"></td>
      <td style="width:36px;"><button class="btn btn-outline btn-sm" onclick="wvRemove(${i})">✕</button></td>
    </tr>`).join('');

  return `<div style="margin-top:14px;border:1px solid #ddd;border-radius:6px;padding:10px;background:#f9f9f9;">
    <div style="font-weight:bold;margin-bottom:8px;font-size:0.9rem;">Pojazdy i sprzęt wycofane z podziału bojowego</div>
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr style="font-size:0.82rem;background:#eee;">
        <th style="padding:4px;border:1px solid #ccc;">Lp.</th>
        <th style="padding:4px;border:1px solid #ccc;">Rodzaj pojazdu / sprzętu</th>
        <th style="padding:4px;border:1px solid #ccc;">Data wycofania</th>
        <th style="padding:4px;border:1px solid #ccc;">Powód wycofania</th>
        <th style="padding:4px;border:1px solid #ccc;"></th>
      </tr></thead>
      <tbody id="wvTableBody">${rows}</tbody>
    </table>
    <button class="btn btn-outline btn-sm" onclick="wvAdd()" style="margin-top:8px;">➕ Dodaj pojazd</button>
  </div>`;
}

function wvAdd() {
  if (!sectionData[currentSectionId].withdrawnVehicles) sectionData[currentSectionId].withdrawnVehicles = [];
  sectionData[currentSectionId].withdrawnVehicles.push({ name: '', date: '', reason: '' });
  renderSection(currentSectionId);
}
function wvRemove(i) {
  sectionData[currentSectionId].withdrawnVehicles.splice(i, 1);
  renderSection(currentSectionId);
}
function wvChange(i, key, val) {
  sectionData[currentSectionId].withdrawnVehicles[i][key] = val;
  autoSave();
}
function chkItemNote(secId, itemId, val) {
  if (!sectionData[secId].itemNotes) sectionData[secId].itemNotes = {};
  sectionData[secId].itemNotes[itemId] = val;
  autoSave();
}
function chkNotes(secId, val) {
  sectionData[secId].notes = val;
  autoSave();
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
    <div style="border:1px solid #ddd;border-radius:6px;padding:12px;margin-top:14px;background:#f9f9f9;">
      <div style="font-weight:bold;margin-bottom:8px;font-size:0.9rem;">Średnie wyników grup (do protokołu)</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
        <div class="form-group" style="margin:0;">
          <label style="font-size:0.82rem;">Średnia – Dowódcy (pkt)</label>
          <input type="number" class="form-control" min="0" max="${sec.maxPoints}" step="0.1"
            value="${sd.avgDownodcy!==undefined&&sd.avgDownodcy!==''?sd.avgDownodcy:''}"
            oninput="testAvgChange('avgDownodcy',this.value)" placeholder="0.0">
        </div>
        <div class="form-group" style="margin:0;">
          <label style="font-size:0.82rem;">Średnia – Ratownicy (pkt)</label>
          <input type="number" class="form-control" min="0" max="${sec.maxPoints}" step="0.1"
            value="${sd.avgRatownicy!==undefined&&sd.avgRatownicy!==''?sd.avgRatownicy:''}"
            oninput="testAvgChange('avgRatownicy',this.value)" placeholder="0.0">
        </div>
        <div class="form-group" style="margin:0;">
          <label style="font-size:0.82rem;">Średnia – Kierowcy (pkt)</label>
          <input type="number" class="form-control" min="0" max="${sec.maxPoints}" step="0.1"
            value="${sd.avgKierowcy!==undefined&&sd.avgKierowcy!==''?sd.avgKierowcy:''}"
            oninput="testAvgChange('avgKierowcy',this.value)" placeholder="0.0">
        </div>
      </div>
    </div>
    <div class="form-group" style="margin-top:10px;">
      <label>Uwagi do testu wiedzy:</label>
      <textarea class="form-control" rows="2" oninput="testNotesChange(this.value)"
        placeholder="Uwagi…">${esc(sd.notes||'')}</textarea>
    </div>
  </div>`;
}

function testAvgChange(key, val) {
  const v = parseFloat(val);
  sectionData[currentSectionId][key] = isNaN(v) ? '' : v;
  autoSave();
}
function testNotesChange(val) {
  sectionData[currentSectionId].notes = val;
  autoSave();
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
  const critErrors = sec.criticalErrors || [];
  const anyCritical = critErrors.some(e => sd.criticalErrors && sd.criticalErrors[e.id]);

  const critRows = critErrors.map(e => {
    const checked = sd.criticalErrors && sd.criticalErrors[e.id];
    return `
    <div class="ex-row ${checked ? 'ex-checked' : ''}" style="${checked ? 'border-color:#c0392b;background:#f8d7da;' : 'border-color:#e74c3c;'}">
      <label class="ex-label" style="color:${checked ? '#721c24' : '#c0392b'};font-weight:600;">
        <input type="checkbox" ${checked ? 'checked' : ''} onchange="exCritCheck('${sec.id}','${e.id}',this.checked)">
        <span>⛔ ${e.name}</span>
      </label>
      <div class="ex-penalty">
        <span class="badge badge-fail" style="background:#c0392b;">DYSKWALIFIKACJA</span>
      </div>
    </div>`;
  }).join('');

  const errorRows = sec.errors.map(e => {
    const checked = sd.errors[e.id]?.checked;
    const cnt = sd.errors[e.id]?.count || 1;
    return `
    <div class="ex-row ${checked ? 'ex-checked' : ''}" ${anyCritical ? 'style="opacity:0.5;pointer-events:none;"' : ''}>
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
    <div class="ex-row ex-extra ex-checked" ${anyCritical ? 'style="opacity:0.5;pointer-events:none;"' : ''}>
      <input type="text" class="form-control ex-extra-name" value="${esc(e.name)}"
        oninput="exExtraName('${sec.id}',${i},this.value)" placeholder="Opis uchybienia">
      <div class="ex-penalty">
        <input type="number" class="ex-count" value="${e.penalty}" min="0" max="50"
          oninput="exExtraPenalty('${sec.id}',${i},this.value)"> pkt kara
        <button class="btn btn-outline btn-sm" onclick="exExtraRemove('${sec.id}',${i})">✕</button>
      </div>
    </div>`).join('');

  const critBanner = anyCritical ? `
    <div style="background:#c0392b;color:#fff;padding:12px 16px;border-radius:6px;font-size:1rem;font-weight:700;text-align:center;margin-bottom:12px;">
      ⛔ ĆWICZENIE ZAKOŃCZONE – BŁĄD KRYTYCZNY – 0 PKT
    </div>` : '';

  return `
  <div class="ex-wrap">
    <div class="form-group">
      <label style="font-weight:bold;">Treść założenia do ćwiczenia:</label>
      <textarea class="form-control" rows="3" id="exAssumption" oninput="exAssumptionChange('${sec.id}',this.value)"
        placeholder="Opisz założenia ćwiczenia…">${esc(sd.assumption||'')}</textarea>
    </div>
    ${critErrors.length ? `
    <div style="margin-bottom:16px;">
      <div style="font-weight:700;color:#c0392b;font-size:0.9rem;margin-bottom:6px;padding:6px 10px;background:#fff0f0;border-radius:4px;border:1px solid #e74c3c;">
        ⛔ BŁĘDY KRYTYCZNE – zaznaczenie któregokolwiek kończy ćwiczenie z wynikiem 0 pkt
      </div>
      <div id="exCritList">${critRows}</div>
    </div>` : ''}
    ${critBanner}
    <p style="color:var(--dark-gray);font-size:0.85rem;margin-bottom:12px;">
      Start: <strong>${sec.maxPoints} pkt</strong>. Zaznacz stwierdzone uchybienia – punkty będą odejmowane automatycznie.
    </p>
    <div id="exList">${errorRows}</div>
    <div id="exExtraList">${extraRows}</div>
    <button class="btn btn-outline btn-sm" onclick="exAddExtra('${sec.id}')" style="margin-top:8px;" ${anyCritical ? 'disabled' : ''}>➕ Dodaj własne uchybienie</button>
    <div class="ex-result" id="exResult">
      <div class="points-big" id="exPtsBig" style="${anyCritical ? 'color:#c0392b;' : ''}">${sd.points} pkt</div>
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

  const anyCritical = (sec.criticalErrors || []).some(e => sd.criticalErrors && sd.criticalErrors[e.id]);
  if (anyCritical) {
    sd.points = 0;
    const el = document.getElementById('exPtsBig');
    if (el) { el.textContent = '0 pkt'; el.style.color = '#c0392b'; }
    const pen = document.getElementById('exPenaltySum');
    if (pen) pen.textContent = '⛔ Błąd krytyczny – ćwiczenie zakończone';
    updateSecPts(sec, sd);
    updateScoreBar();
    autoSave();
    return;
  }

  let penalty = 0;
  for (const e of sec.errors) {
    if (sd.errors[e.id]?.checked) penalty += e.penalty * (sd.errors[e.id].count || 1);
  }
  for (const e of (sd.extraErrors || [])) {
    penalty += parseFloat(e.penalty) || 0;
  }
  sd.points = Math.max(0, sec.maxPoints - penalty);
  const el = document.getElementById('exPtsBig');
  if (el) { el.textContent = sd.points + ' pkt'; el.style.color = ''; }
  const pen = document.getElementById('exPenaltySum');
  if (pen) pen.textContent = penalty > 0 ? `Odliczono: –${penalty} pkt` : '';
  updateSecPts(sec, sd);
  updateScoreBar();
  autoSave();
}

function exCritCheck(secId, errorId, checked) {
  if (!sectionData[secId].criticalErrors) sectionData[secId].criticalErrors = {};
  sectionData[secId].criticalErrors[errorId] = checked;
  calcExercise(secId);
  renderSection(secId);
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

function exAssumptionChange(secId, val) {
  sectionData[secId].assumption = val;
  autoSave();
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
  if (!protocolId) { showSetupError('Najpierw zapisz protokół'); return; }
  sessionStorage.setItem('sessionCreds', JSON.stringify({ u: authU, h: authH }));
  window.open(`/protocol/print/${protocolId}?u=${encodeURIComponent(authU)}&h=${encodeURIComponent(authH)}`, '_blank');
}

function goBack() {
  if (sessionId) {
    sessionStorage.setItem('sessionCreds', JSON.stringify({ u: authU, h: authH }));
    window.location.href = `/session/${sessionId}?u=${encodeURIComponent(authU)}&h=${encodeURIComponent(authH)}`;
  } else {
    window.location.href = '/';
  }
}

function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
