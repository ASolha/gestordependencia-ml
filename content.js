/* =======================================================
   GESTOR DE PENDÊNCIAS ML — Content Script
   ======================================================= */

// ============================================================
//  CONFIGURAÇÃO
// ============================================================
const CFG = {
  supabaseUrl:  'https://dqiosohjicnruwrhxeou.supabase.co',
  supabaseKey:  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxaW9zb2hqaWNucnV3cmh4ZW91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0OTI0NzcsImV4cCI6MjA4ODA2ODQ3N30.y5LVH3Lb9xDuHLDVvDaNCrzuS2RsJenI0EqgVtHBWfM',
  emailTo:      'alcsolha@gmail.com',
};

// ============================================================
//  FEFRELLO
// ============================================================
const FEFRELLO_API_BASE      = 'https://southamerica-east1-fefrello.cloudfunctions.net';
const FEFRELLO_API_KEY       = '708a34771f2659594502ed4b74cd634819a297d37e3fb2fa3cafdf826c286f16';
const FEFRELLO_CONFIG_KEY    = 'mlp_fefrello_config';
const FEFRELLO_CACHE_KEY     = 'mlp_fefrello_cache';
const FEFRELLO_CACHE_TTL     = 24 * 60 * 60 * 1000;
const RESPONSAVEIS_FEFRELLO  = ['Solha', 'Ti', 'Vitão', 'Brunão', 'Fe'];
const EMAIL_SETTINGS_KEY     = 'mlp_email_settings';
const CARD_STATUS_KEY        = 'mlp_card_status';
const DEFAULT_EMAIL_TO       = 'brunosims@gmail.com';
const TERMOS_IGNORAR_MODELO  = [
  /ali[aâ]n[cç]a/i, /banhad[ao]/i, /folhead[ao]/i,
  /enchimento/i, /\bchapa\b/i, /formatura/i,
];

// ============================================================
//  SVG ICONS
// ============================================================
const SVG = {
  box:         `<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>`,
  eye:         `<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>`,
  eyeOff:      `<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>`,
  logOut:      `<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>`,
  pin:         `<line x1="12" x2="12" y1="17" y2="22"/><path d="M5 17H19V16a6 6 0 0 0-1.41-3.84l-.78-1A2 2 0 0 1 16 9.59V4.5a1.5 1.5 0 0 0-1.5-1.5h-5A1.5 1.5 0 0 0 8 4.5v5.09a2 2 0 0 1-.42 1.23l-.77.98A6 6 0 0 0 5 16v1z"/>`,
  user:        `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
  list:        `<line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/>`,
  clock:       `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
  settings:    `<line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="1" x2="7" y1="14" y2="14"/><line x1="9" x2="15" y1="8" y2="8"/><line x1="17" x2="23" y1="16" y2="16"/>`,
  trash:       `<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>`,
  database:    `<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>`,
  mail:        `<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 6.24a2 2 0 0 1-2.06 0L2 7"/>`,
  send:        `<path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="M22 2 11 13"/>`,
  plus:        `<path d="M5 12h14"/><path d="M12 5v14"/>`,
  search:      `<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>`,
  chevronDown: `<path d="m6 9 6 6 6-6"/>`,
  chevronUp:   `<path d="m18 15-6-6-6 6"/>`,
  x:           `<path d="M18 6 6 18"/><path d="m6 6 12 12"/>`,
  check:       `<path d="M20 6 9 17l-5-5"/>`,
  folder:      `<path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>`,
  grid:        `<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>`,
  clipboard:   `<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>`,
  edit:        `<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>`,
};

function icon(name, size = 18) {
  const paths = SVG[name];
  if (!paths) return '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;flex-shrink:0">${paths}</svg>`;
}

// ============================================================
//  ESTADO GLOBAL
// ============================================================
let auth       = { user: null, token: null, refreshToken: null };
let pendencias = [];
let isPinned   = false;
let closeTimer = null;
const fefrelloSentIds       = new Set();
const emailSentIds          = new Set();
const consolidadoCopiadoIds = new Set();
const archivedIds           = new Set();
const CAPTURE_CACHE_KEY     = 'mlp_capture_snapshot';
let expandedCardId = null;
let capturedData  = null;
let _captureTimer = null;
let _lastCapturedUrl = '';
let _urlWatcherStarted = false;

// ============================================================
//  SUPABASE
// ============================================================
async function sbFetch(path, opts = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'apikey': CFG.supabaseKey,
    'Authorization': `Bearer ${auth.token || CFG.supabaseKey}`,
    ...opts.headers,
  };
  const res = await fetch(`${CFG.supabaseUrl}${path}`, { ...opts, headers });
  if (res.status === 401) {
    try { await refreshSession(); } catch { throw new Error('Sessão expirada. Faça login novamente.'); }
    headers.Authorization = `Bearer ${auth.token}`;
    const retry = await fetch(`${CFG.supabaseUrl}${path}`, { ...opts, headers });
    if (!retry.ok) throw new Error(`HTTP ${retry.status}`);
    return retry.status === 204 ? null : retry.json();
  }
  if (!res.ok) {
    let msg;
    try { msg = (await res.json()).message || `HTTP ${res.status}`; } catch { msg = `HTTP ${res.status}`; }
    throw new Error(msg);
  }
  return res.status === 204 ? null : res.json().catch(() => null);
}

async function signIn(email, password) {
  const res = await fetch(`${CFG.supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': CFG.supabaseKey },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.msg || 'Falha no login');
  return data;
}

async function signOut() {
  await fetch(`${CFG.supabaseUrl}/auth/v1/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': CFG.supabaseKey, 'Authorization': `Bearer ${auth.token}` },
  }).catch(() => {});
}

async function refreshSession() {
  if (!auth.refreshToken) throw new Error('Sem refresh token');
  const res = await fetch(`${CFG.supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': CFG.supabaseKey },
    body: JSON.stringify({ refresh_token: auth.refreshToken }),
  });
  if (!res.ok) throw new Error('Sessão expirada');
  const data = await res.json();
  auth.token        = data.access_token;
  auth.refreshToken = data.refresh_token;
  await saveSession({ access_token: data.access_token, refresh_token: data.refresh_token, user: auth.user });
}

// ============================================================
//  STORAGE
// ============================================================
function saveSession(session) {
  return new Promise(r => chrome.storage.local.set({ mlp_session: session }, r));
}
function getSession() {
  return new Promise(r => chrome.storage.local.get('mlp_session', d => r(d.mlp_session || null)));
}
function clearSession() {
  return new Promise(r => chrome.storage.local.remove('mlp_session', r));
}

// ============================================================
//  DATABASE
// ============================================================
async function loadPendencias() {
  const data = await sbFetch(`/rest/v1/pendencias?user_id=eq.${auth.user.id}&order=created_at.desc&select=*`);
  pendencias = data || [];
}
async function createPendencia(fields) {
  const rows = await sbFetch('/rest/v1/pendencias', {
    method: 'POST',
    headers: { 'Prefer': 'return=representation' },
    body: JSON.stringify({ user_id: auth.user.id, ...fields }),
  });
  return rows[0];
}
async function updatePendencia(id, fields) {
  await sbFetch(`/rest/v1/pendencias?id=eq.${id}`, {
    method: 'PATCH',
    headers: { 'Prefer': 'return=minimal' },
    body: JSON.stringify({ ...fields, updated_at: new Date().toISOString() }),
  });
}
async function deletePendencia(id) {
  await sbFetch(`/rest/v1/pendencias?id=eq.${id}`, { method: 'DELETE' });
}

// ============================================================
//  CAPTURA DE DADOS DA PÁGINA (MercadoLivre)
// ============================================================
function capturePageData() {
  const url           = window.location.href;
  let textoCompleto   = null;
  const getTextoCompleto = () => {
    if (textoCompleto !== null) return textoCompleto;
    textoCompleto = document.body?.innerText || '';
    return textoCompleto;
  };

  // ── Login (comprador) ───────────────────────────────────
  let login_cliente = '';
  const elLogin = document.querySelector('div.sc-title-subtitle-action__container p.sc-text');
  if (elLogin) {
    const txt = elLogin.textContent || elLogin.innerText;
    const m   = txt.match(/^([^|]+?)\s*\|\s*CPF/);
    login_cliente = m ? m[1].trim() : txt.trim();
  }
  if (!login_cliente) {
    const m = getTextoCompleto().match(/([^\s|]+(?:\s+[^\s|]+)*)\s*\|\s*CPF\s*\d+/);
    login_cliente = m ? m[1].trim() : '';
  }

  // ── Número da venda — busca "Venda #XXXX" ───────────────
  let numero_venda = '';
  const vendaHashMatch = getTextoCompleto().match(/Venda\s*#\s*(\d+)/i);
  if (vendaHashMatch) {
    numero_venda = vendaHashMatch[1];
  } else {
    const elVenda = document.querySelector('[data-testid="order-number"]') ||
                    document.querySelector('.order-number') ||
                    document.querySelector('[class*="order-id"]');
    if (elVenda) {
      numero_venda = elVenda.textContent.replace(/[^0-9]/g, '');
    } else {
      const m = url.match(/[#?/](\d{8,})/);
      if (m) numero_venda = m[1];
    }
  }

  // ── Modelo — usa apenas regex no texto (sem seletores DOM genéricos)
  //    para não capturar o título do próprio sidebar ────────────────
  let modelo = '';
  const padroesModelo = [
    /\*\*(\d+mm[^*\n]+)/,
    /(\d+mm\s+[^\n]+)/,
    /\*\*([^*]*\d+mm[^*\n]+)/,
    /Modelo:\s*([^\n]+)/i,
  ];
  for (const padrao of padroesModelo) {
    const match = getTextoCompleto().match(padrao);
    if (match) {
      let mc = match[1].replace(/\*\*/g, '').trim();
      // Strip banhado/folheado FIRST, then check ignore terms
      mc = mc.replace(/\s+(Banhad[ao]|Folhead[ao]).*$/i, '').trim();
      if (!mc || TERMOS_IGNORAR_MODELO.some(r => r.test(mc))) continue;
      modelo = mc;
      break;
    }
  }

  // ── Aro — lógica idêntica ao código de referência ───────────────
  const arosCapturados = [];
  const matchesAro = getTextoCompleto().match(/Aro\s*-\s*([^\n|]+)/g);

  if (matchesAro && matchesAro.length > 0) {
    matchesAro.forEach((m, index) => {
      const textoAro = m.replace(/Aro\s*-\s*/i, '').trim();
      const numM = textoAro.match(/(\d+(?:[.,]\d+)?)/);
      const numero = numM ? numM[1] : '';
      const comPedra = /com\s+pedra/i.test(textoAro) ? ' com pedra' : '';
      arosCapturados.push({ label: `Avulso ${index + 1}`, value: numero + comPedra });
    });
  } else {
    const texto = getTextoCompleto();
    const mMasc = texto.match(/Masculino\s*[-\u2013]\s*([^\n|]+)/);
    if (mMasc) {
      const textoAro = mMasc[1].trim();
      const numM = textoAro.match(/(\d+(?:[.,]\d+)?)/);
      const numero = numM ? numM[1] : textoAro;
      const comPedra = /com\s+pedra/i.test(textoAro) ? ' com pedra' : '';
      arosCapturados.push({ label: 'Masculino', value: numero + comPedra });
    }
    const mFem = texto.match(/Feminino\s*[-\u2013]\s*([^\n|]+)/);
    if (mFem) {
      const textoAro = mFem[1].trim();
      const numM = textoAro.match(/(\d+(?:[.,]\d+)?)/);
      const numero = numM ? numM[1] : textoAro;
      const comPedra = /com\s+pedra/i.test(textoAro) ? ' com pedra' : '';
      arosCapturados.push({ label: 'Feminino', value: numero + comPedra });
    }
  }

  if (arosCapturados.length === 0) arosCapturados.push({ label: 'Avulso 1', value: '' });
  const aro = JSON.stringify(arosCapturados);

  return { login_cliente, numero_venda, url, modelo, aro };
}

function getStoredCapturedData() {
  try {
    const raw = window.sessionStorage.getItem(CAPTURE_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeCapturedData(data) {
  try {
    window.sessionStorage.setItem(CAPTURE_CACHE_KEY, JSON.stringify(data));
  } catch {}
}

function hasCapturedValue(data) {
  return Boolean(
    data && (
      (data.login_cliente || '').trim() ||
      (data.numero_venda || '').trim() ||
      (data.modelo || '').trim()
    )
  );
}

function mergeCapturedData(current, previous) {
  const base = previous || {};
  const next = current || {};
  return {
    login_cliente: (next.login_cliente || '').trim() || (base.login_cliente || '').trim(),
    numero_venda:  (next.numero_venda  || '').trim() || (base.numero_venda  || '').trim(),
    url:           next.url || base.url || window.location.href,
    modelo:        (next.modelo || '').trim() || (base.modelo || '').trim(),
    aro:           next.aro || base.aro || JSON.stringify([{ label: 'Avulso 1', value: '' }]),
  };
}

function getCapturedPageData() {
  const current  = capturePageData();
  const previous = capturedData || getStoredCapturedData();
  const merged   = mergeCapturedData(current, previous);
  if (hasCapturedValue(merged)) {
    capturedData = merged;
    storeCapturedData(merged);
    return merged;
  }
  return merged;
}

function captureAndCachePageData(force = false) {
  const currentUrl = window.location.href;
  if (!force && currentUrl === _lastCapturedUrl && hasCapturedValue(capturedData)) {
    return capturedData;
  }

  capturedData = getCapturedPageData();
  _lastCapturedUrl = currentUrl;
  return capturedData;
}

// ============================================================
//  E-MAIL
// ============================================================
function formatDate(d = new Date()) {
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) +
         ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function dateGroupLabel(dateStr) {
  if (!dateStr) return 'Sem data';
  const d     = new Date(dateStr);
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dDay  = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff  = Math.round((today - dDay) / 86400000);
  if (diff === 0) return 'Hoje';
  if (diff === 1) return 'Ontem';
  if (diff <= 6)  return 'Esta semana';
  if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) return 'Este mês';
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  if (d.getFullYear() === prevMonth.getFullYear() && d.getMonth() === prevMonth.getMonth()) return 'Mês anterior';
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

function renderGrouped(list, itemFn) {
  let lastLabel = null;
  return list.map(p => {
    const label = dateGroupLabel(p.created_at);
    const sep   = label !== lastLabel
      ? `<div class="mlp-date-sep"><span class="mlp-date-sep-label">${label}</span></div>`
      : '';
    lastLabel = label;
    return sep + itemFn(p);
  }).join('');
}

function cardToHtml(p) {
  const td1 = 'style="padding:4px 8px;color:#666;width:36%;vertical-align:top"';
  const td2 = 'style="padding:4px 8px;vertical-align:top"';
  return `
    <div style="font-family:Arial,sans-serif;border:1px solid #ddd;border-radius:8px;
                padding:16px;margin-bottom:8px;max-width:520px;background:#fff;">
      <h3 style="margin:0 0 10px;color:#222;border-bottom:3px solid #FFE600;padding-bottom:8px;font-size:15px;">
        ${esc(p.login_cliente) || '(sem login)'}
      </h3>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <tr><td ${td1}><b>Nº da Venda:</b></td>
            <td ${td2}>${esc(p.numero_venda) || '—'}</td></tr>
        <tr><td ${td1}><b>Modelo:</b></td>
            <td ${td2}>${esc(p.modelo) || '—'}</td></tr>
        ${parseAros(p.aro).filter(a => a.value).map(a =>
          `<tr><td ${td1}><b>${esc(a.label)}:</b></td>
               <td ${td2}>${esc(a.value)}</td></tr>`
        ).join('')}
        ${p.observacoes
          ? `<tr><td ${td1}><b>Observações:</b></td>
                 <td ${td2}>${esc(p.observacoes)}</td></tr>`
          : ''}
        ${p.url
          ? `<tr><td ${td1}><b>Link da venda:</b></td>
                 <td ${td2}><a href="${esc(p.url)}" style="color:#6366f1;text-decoration:none;font-weight:500;">Acessar link da venda</a></td></tr>`
          : ''}
      </table>
    </div>`;
}

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function getGmailToken() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'GET_GMAIL_TOKEN' }, (response) => {
      if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
      if (response?.error)         return reject(new Error(response.error));
      resolve(response.token);
    });
  });
}

async function sendEmail(subject, html) {
  const token         = await getGmailToken();
  const emailSettings = await carregarEmailSettings();
  const emailTo       = (emailSettings?.emailTo || DEFAULT_EMAIL_TO).trim();
  const emailCC       = (emailSettings?.emailCC || '').trim();
  const subjectEncoded = `=?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const rawLines = [
    `To: ${emailTo}`,
    emailCC ? `Cc: ${emailCC}` : null,
    `Subject: ${subjectEncoded}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    btoa(unescape(encodeURIComponent(html))),
  ].filter(v => v !== null);
  const raw = rawLines.join('\r\n');
  const encodedRaw = btoa(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: encodedRaw }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gmail API: HTTP ${res.status}`);
  }
  return res.json();
}

// ============================================================
//  FEFRELLO API
// ============================================================
async function fefrelloFetch(endpoint, options = {}) {
  const res = await fetch(`${FEFRELLO_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'x-api-key': FEFRELLO_API_KEY,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Erro na API Fefrello');
  return json;
}

function salvarCacheFefrello(data) {
  return new Promise(r => chrome.storage.local.set({ [FEFRELLO_CACHE_KEY]: { ...data, timestamp: Date.now() } }, r));
}
function carregarCacheFefrello() {
  return new Promise(r => {
    chrome.storage.local.get([FEFRELLO_CACHE_KEY], result => {
      const cache = result[FEFRELLO_CACHE_KEY];
      r(cache && (Date.now() - cache.timestamp) < FEFRELLO_CACHE_TTL ? cache : null);
    });
  });
}

async function carregarBoards(forceRefresh = false) {
  if (!forceRefresh) {
    const cache = await carregarCacheFefrello();
    if (cache?.boards) return cache.boards;
  }
  const res    = await fefrelloFetch('/listBoards');
  const boards = res.data;
  const atual  = (await carregarCacheFefrello()) || {};
  await salvarCacheFefrello({ ...atual, boards });
  return boards;
}

async function carregarColunas(boardId, forceRefresh = false) {
  if (!forceRefresh) {
    const cache = await carregarCacheFefrello();
    if (cache?.columns?.[boardId]) return cache.columns[boardId];
  }
  const res    = await fefrelloFetch(`/listColumns?boardId=${boardId}`);
  const cols   = res.data;
  const atual  = (await carregarCacheFefrello()) || {};
  const columns = atual.columns || {};
  columns[boardId] = cols;
  await salvarCacheFefrello({ ...atual, columns });
  return cols;
}

async function forcarAtualizacaoCache() {
  const boards  = await carregarBoards(true);
  const columns = {};
  for (const board of boards) { columns[board.id] = await carregarColunas(board.id, true); }
  await salvarCacheFefrello({ boards, columns });
}

async function criarCardFefrello(boardId, columnId, title, description, responsible) {
  const body = { boardId, columnId, title };
  if (description) body.description = description;
  if (responsible) body.responsible = responsible;
  return fefrelloFetch('/createCardEndpoint', { method: 'POST', body: JSON.stringify(body) });
}

function salvarConfigFefrello(config) {
  return new Promise(r => chrome.storage.local.set({ [FEFRELLO_CONFIG_KEY]: config }, r));
}
function carregarConfigFefrello() {
  return new Promise(r => {
    chrome.storage.local.get([FEFRELLO_CONFIG_KEY], result => r(result[FEFRELLO_CONFIG_KEY] || null));
  });
}

function formatCardForFefrello(p) {
  const lines = [];
  if (p.url)          lines.push(p.url);
  if (p.modelo)       lines.push(`Modelo: ${p.modelo}`);
  parseAros(p.aro).forEach(a => { if (a.value) lines.push(`${a.label}: ${a.value}`); });
  if (p.numero_venda) lines.push(`Venda #${p.numero_venda}`);
  if (p.observacoes)  lines.push(`\n${p.observacoes}`);
  return lines.join('\n');
}

// ── Aro helpers ─────────────────────────────────────────────────────
function parseAros(aroStr) {
  if (!aroStr) return [{ label: 'Avulso 1', value: '' }];
  try {
    const arr = JSON.parse(aroStr);
    if (Array.isArray(arr) && arr.length > 0) return arr;
  } catch {}
  // Legado: string simples
  return [{ label: 'Aro', value: String(aroStr).trim() }];
}

// ── Email settings ───────────────────────────────────────────────────
function carregarEmailSettings() {
  return new Promise(r => {
    chrome.storage.local.get([EMAIL_SETTINGS_KEY], result => r(result[EMAIL_SETTINGS_KEY] || null));
  });
}
function salvarEmailSettings(settings) {
  return new Promise(r => chrome.storage.local.set({ [EMAIL_SETTINGS_KEY]: settings }, r));
}

// ── Status de cartões (persiste entre abas) ───────────────────────────────
function loadCardStatus() {
  return new Promise(r => {
    chrome.storage.local.get([CARD_STATUS_KEY], result => {
      const s = result[CARD_STATUS_KEY] || {};
      (s.emailSentIds          || []).forEach(id => emailSentIds.add(id));
      (s.consolidadoCopiadoIds || []).forEach(id => consolidadoCopiadoIds.add(id));
      (s.fefrelloSentIds       || []).forEach(id => fefrelloSentIds.add(id));
      (s.archivedIds           || []).forEach(id => archivedIds.add(id));
      r();
    });
  });
}
function saveCardStatus() {
  return new Promise(r => chrome.storage.local.set({
    [CARD_STATUS_KEY]: {
      emailSentIds:          [...emailSentIds],
      consolidadoCopiadoIds: [...consolidadoCopiadoIds],
      fefrelloSentIds:       [...fefrelloSentIds],
      archivedIds:           [...archivedIds],
    },
  }, r));
}
function setupStatusSync() {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local' || !changes[CARD_STATUS_KEY]) return;
    const s = changes[CARD_STATUS_KEY].newValue || {};
    emailSentIds.clear();
    consolidadoCopiadoIds.clear();
    fefrelloSentIds.clear();
    archivedIds.clear();
    (s.emailSentIds          || []).forEach(id => emailSentIds.add(id));
    (s.consolidadoCopiadoIds || []).forEach(id => consolidadoCopiadoIds.add(id));
    (s.fefrelloSentIds       || []).forEach(id => fefrelloSentIds.add(id));
    (s.archivedIds           || []).forEach(id => archivedIds.add(id));
    if (document.getElementById('mlp-main-view')?.classList.contains('mlp-visible')) {
      renderCards();
      renderHistory(document.getElementById('mlp-hist-search')?.value || '');
    }
  });
}

// ============================================================
//  AUTO-CAPTURA DE DADOS DA PÁGINA
// ============================================================
function scheduleCapture(force = false, delay = 250) {
  clearTimeout(_captureTimer);
  _captureTimer = setTimeout(() => {
    captureAndCachePageData(force);
  }, delay);
}

function watchUrlChanges() {
  if (_urlWatcherStarted) return;
  _urlWatcherStarted = true;

  let lastUrl = location.href;
  const onUrlMaybeChanged = () => {
    if (location.href === lastUrl) return;
    lastUrl = location.href;
    scheduleCapture(true, 120);
  };

  // Intercepta pushState / replaceState (SPAs)
  ['pushState', 'replaceState'].forEach(fn => {
    const orig = history[fn];
    history[fn] = function (...args) {
      orig.apply(this, args);
      onUrlMaybeChanged();
    };
  });

  window.addEventListener('popstate', onUrlMaybeChanged, { passive: true });
  window.addEventListener('hashchange', onUrlMaybeChanged, { passive: true });

  // Fallback leve para SPAs que trocam a URL fora do histórico.
  const observerTarget = document.body || document.documentElement;
  if (observerTarget) {
    new MutationObserver(() => {
      onUrlMaybeChanged();
    }).observe(observerTarget, { childList: true, subtree: true });
  }
}

// ============================================================
//  INJEÇÃO DO SIDEBAR
// ============================================================
function injectSidebar() {
  if (document.getElementById('mlp-root')) return;

  const root = document.createElement('div');
  root.id = 'mlp-root';
  root.innerHTML = `
    <div id="mlp-tab">
      ${icon('box', 20)}
      <span class="mlp-tab-count" id="mlp-count"></span>
    </div>

    <div id="mlp-panel">

      <!-- LOGIN VIEW -->
      <div id="mlp-login-view" style="display:flex;">
        <div class="mlp-login-inner">
          <div class="mlp-login-logo">
            <div class="mlp-login-logo-box">${icon('box', 28)}</div>
          </div>
          <h1 class="mlp-login-title">Bem-vindo ao<br>Gestor de Pendências</h1>
          <p class="mlp-login-sub">Acesse sua conta para gerenciar pendências</p>

          <div class="mlp-lf-group">
            <label class="mlp-lf-label">Email</label>
            <div class="mlp-lf-input-wrap">
              <input type="email" id="mlp-email" class="mlp-lf-input"
                     placeholder="seu@email.com" autocomplete="email" />
            </div>
          </div>

          <div class="mlp-lf-group">
            <label class="mlp-lf-label">Senha</label>
            <div class="mlp-lf-input-wrap">
              <input type="password" id="mlp-password" class="mlp-lf-input has-toggle"
                     placeholder="••••••••" autocomplete="current-password" />
              <button type="button" class="mlp-pw-toggle" id="mlp-pw-toggle">${icon('eye', 18)}</button>
            </div>
          </div>

          <span class="mlp-forgot">Esqueci minha senha</span>
          <button id="mlp-login-btn" class="mlp-login-btn">Entrar</button>

          <p id="mlp-login-error" class="mlp-login-error"></p>
        </div>
        <footer class="mlp-login-footer">
          <div class="mlp-footer-row">${icon('database', 14)} Integrado com Supabase</div>
          <p class="mlp-footer-copy">© 2024 Gestor de Pendências. Todos os direitos reservados.</p>
        </footer>
      </div>

      <!-- MAIN VIEW -->
      <div id="mlp-main-view" style="display:none;">

        <div class="mlp-header">
          <div class="mlp-header-actions">
            <button id="mlp-ver-consolidado-btn" class="mlp-btn mlp-btn-remessa mlp-btn-hdr">
              ${icon('list', 12)} Ver Consolidado
            </button>
            <button id="mlp-remessa-btn" class="mlp-btn mlp-btn-remessa mlp-btn-hdr">
              ${icon('send', 12)} Env. Consolidado
            </button>
            <button id="mlp-envio-individual-all-btn" class="mlp-btn mlp-btn-remessa mlp-btn-hdr">
              ${icon('send', 12)} Envio Individual
            </button>
          </div>
          <div class="mlp-header-controls">
            <button id="mlp-pin-btn"    class="mlp-icon-btn" title="Fixar painel">${icon('pin', 18)}</button>
            <button id="mlp-logout-btn" class="mlp-icon-btn" title="Sair">${icon('logOut', 18)}</button>
          </div>
        </div>

        <div class="mlp-tab-content">

          <!-- Pendências -->
          <div id="mlp-tab-pendencias" class="mlp-active-tab">
            <div class="mlp-toolbar">
              <button id="mlp-criar-btn" class="mlp-btn mlp-btn-success">
                ${icon('plus', 18)} Criar Pendência
              </button>
            </div>
            <div id="mlp-cards-container">
              <div class="mlp-empty">Nenhuma pendência cadastrada.</div>
            </div>
          </div>

          <!-- Histórico -->
          <div id="mlp-tab-historico">
            <div class="mlp-search-bar">
              <span class="mlp-search-icon">${icon('search', 15)}</span>
              <input type="text" id="mlp-hist-search" class="mlp-search-input"
                     placeholder="Buscar login, venda ou data..." />
              <button id="mlp-limpar-hist" class="mlp-btn-icon-danger" title="Limpar histórico" style="flex-shrink:0">${icon('trash', 14)}</button>
            </div>
            <div id="mlp-history-list" class="mlp-history-list">
              <div class="mlp-empty">Nenhuma pendência cadastrada.</div>
            </div>
          </div>

          <!-- Ajustes -->
          <div id="mlp-tab-ajustes">
            <div class="mlp-view-content">
              <div class="mlp-settings-card">
                <div class="mlp-settings-label">Usuário</div>
                <div class="mlp-settings-value" id="mlp-ajustes-email">—</div>
              </div>
              <button id="mlp-logout-btn2" class="mlp-btn mlp-btn-ghost mlp-btn-logout-full">
                ${icon('logOut', 16)} Sair da conta
              </button>

              <div class="mlp-settings-section-title">Email de Envio</div>
              <div class="mlp-settings-card">
                <div class="mlp-lf-group">
                  <label class="mlp-fg-label">Destinatário (To)</label>
                  <input type="email" id="mlp-email-dest" class="mlp-fi"
                         placeholder="destinatario@email.com" />
                </div>
                <div class="mlp-lf-group">
                  <label class="mlp-fg-label">Com cópia (CC) — opcional</label>
                  <input type="email" id="mlp-email-cc" class="mlp-fi"
                         placeholder="copia@email.com" />
                </div>
                <button id="mlp-email-salvar" class="mlp-btn mlp-btn-primary">
                  ${icon('check', 13)} Salvar Email
                </button>
              </div>

              <div class="mlp-settings-section-title">Fefrello</div>
              <div class="mlp-settings-card">
                <div class="mlp-lf-group">
                  <label class="mlp-fg-label">Board</label>
                  <select id="mlp-fefrello-board" class="mlp-select">
                    <option value="">Abra Ajustes para carregar</option>
                  </select>
                </div>
                <div class="mlp-lf-group">
                  <label class="mlp-fg-label">Coluna Padrão</label>
                  <select id="mlp-fefrello-coluna" class="mlp-select" disabled>
                    <option value="">Selecione um board</option>
                  </select>
                </div>
                <div class="mlp-lf-group">
                  <label class="mlp-fg-label">Responsável</label>
                  <select id="mlp-fefrello-responsavel" class="mlp-select">
                    <option value="">Nenhum</option>
                    ${RESPONSAVEIS_FEFRELLO.map(r => `<option value="${r}">${r}</option>`).join('')}
                  </select>
                </div>
                <div class="mlp-settings-row">
                  <button id="mlp-fefrello-refresh" class="mlp-btn mlp-btn-ghost">
                    ${icon('settings', 13)} Atualizar
                  </button>
                  <button id="mlp-fefrello-salvar" class="mlp-btn mlp-btn-primary mlp-btn-flex-center">
                    ${icon('check', 13)} Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        <nav class="mlp-bottom-nav">
          <button class="mlp-nav-btn mlp-active" data-tab="pendencias">
            <span class="mlp-nav-icon">${icon('list', 20)}</span>
            <span>Pendências</span>
          </button>
          <button class="mlp-nav-btn" data-tab="historico">
            <span class="mlp-nav-icon">${icon('clock', 20)}</span>
            <span>Histórico</span>
          </button>
          <button class="mlp-nav-btn" data-tab="ajustes">
            <span class="mlp-nav-icon">${icon('settings', 20)}</span>
            <span>Ajustes</span>
          </button>
        </nav>

      </div>
    </div>

    <!-- CONSOLIDADO OVERLAY — irmão do panel, fora do transform -->
    <div id="mlp-consolidado-overlay" class="mlp-overlay mlp-hidden">
      <div class="mlp-modal">
        <div class="mlp-modal-header">
          <div class="mlp-modal-header-info">
            <div class="mlp-modal-title">Consolidado de Pendências</div>
            <div class="mlp-modal-count" id="mlp-modal-count"></div>
          </div>
          <button id="mlp-modal-close" class="mlp-icon-btn">${icon('x', 18)}</button>
        </div>
        <div class="mlp-modal-body" id="mlp-modal-cards-list"></div>
        <div class="mlp-modal-footer">
          <button id="mlp-copiar-dados" class="mlp-btn mlp-btn-primary">
            ${icon('clipboard', 15)} Copiar Dados
          </button>
        </div>
      </div>
    </div>

    <!-- ENVIO OVERLAY — irmão do panel, fora do transform -->
    <div id="mlp-envio-overlay" class="mlp-overlay mlp-hidden">
      <div class="mlp-modal">
        <div class="mlp-modal-header">
          <div class="mlp-modal-header-info">
            <div class="mlp-modal-title" id="mlp-envio-modal-title">Envio de Pendências</div>
            <div class="mlp-modal-count" id="mlp-envio-modal-count"></div>
          </div>
          <button id="mlp-envio-modal-close" class="mlp-icon-btn">${icon('x', 18)}</button>
        </div>
        <div class="mlp-modal-body" id="mlp-envio-cards-list"></div>
        <div class="mlp-modal-footer">
          <button id="mlp-envio-confirmar" class="mlp-btn mlp-btn-primary">
            ${icon('send', 15)} Enviar
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(root);
}

function hasOpenCardEditor() {
  return Boolean(document.querySelector(
    '#mlp-root .mlp-card:not(.mlp-card-saved), #mlp-root .mlp-card-saved.mlp-expanded'
  ));
}

// ============================================================
//  HOVER / PIN
// ============================================================
function setupHover() {
  const root  = document.getElementById('mlp-root');
  const panel = document.getElementById('mlp-panel');
  const tab   = document.getElementById('mlp-tab');
  if (!root) return;

  root.addEventListener('mouseenter', async () => {
    clearTimeout(closeTimer);
    panel?.classList.add('mlp-open');
    tab?.classList.add('mlp-tab-hidden');
    try {
      await refreshPendenciasView();
    } catch {}
  });

  root.addEventListener('mouseleave', () => {
    if (isPinned || hasOpenCardEditor()) return;
    closeTimer = setTimeout(() => {
      panel?.classList.remove('mlp-open');
      tab?.classList.remove('mlp-tab-hidden');
    }, 350);
  });
}

// ============================================================
//  LOGIN
// ============================================================
function showLogin() {
  document.getElementById('mlp-login-view').classList.add('mlp-visible');
  document.getElementById('mlp-main-view').classList.remove('mlp-visible');
  bindLoginEvents();
}

function bindLoginEvents() {
  const btn      = document.getElementById('mlp-login-btn');
  const email    = document.getElementById('mlp-email');
  const pass     = document.getElementById('mlp-password');
  const err      = document.getElementById('mlp-login-error');
  const pwToggle = document.getElementById('mlp-pw-toggle');
  if (!btn) return;

  if (pwToggle) {
    pwToggle.onclick = () => {
      if (!pass) return;
      pass.type = pass.type === 'password' ? 'text' : 'password';
      pwToggle.innerHTML = icon(pass.type === 'password' ? 'eye' : 'eyeOff', 18);
    };
  }

  btn.onclick = async () => {
    const e = email?.value?.trim();
    const p = pass?.value;
    if (!e || !p) { if (err) err.textContent = 'Preencha e-mail e senha.'; return; }
    btn.disabled = true; btn.textContent = 'Entrando…'; if (err) err.textContent = '';
    try {
      const session = await signIn(e, p);
      auth.token        = session.access_token;
      auth.refreshToken = session.refresh_token;
      auth.user         = session.user;
      await saveSession({ access_token: session.access_token, refresh_token: session.refresh_token, user: session.user });
      await loadPendencias();
      showMain();
    } catch (ex) {
      if (err) err.textContent = ex.message || 'Erro no login.';
    } finally {
      btn.disabled = false; btn.textContent = 'Entrar';
    }
  };
  [email, pass].forEach(el => {
    if (el) el.onkeypress = ev => { if (ev.key === 'Enter') btn.click(); };
  });
}

// ============================================================
//  MAIN
// ============================================================
// Garante que o layout vertical do painel esteja correto.
// Usa window.innerHeight — contorna qualquer problema com 100vh no host.
function fixLayout() {
  const h = Math.round(window.visualViewport?.height || document.documentElement.clientHeight || window.innerHeight || 0);

  // 1. Painel
  const root = document.getElementById('mlp-root');
  if (root) root.style.setProperty('height', h + 'px', 'important');
  const panel = document.getElementById('mlp-panel');
  if (panel) panel.style.setProperty('height', h + 'px', 'important');

  // 2. Main view
  const mv = document.getElementById('mlp-main-view');
  if (!mv?.classList.contains('mlp-visible')) return;
  mv.style.setProperty('height', h + 'px', 'important');

  // 3. Tab content — mede alturas reais para evitar "rodapé engolido"
  const tc = mv.querySelector('.mlp-tab-content');
  const header = mv.querySelector('.mlp-header');
  const nav = mv.querySelector('.mlp-bottom-nav');
  if (tc) {
    const headerH = header ? header.offsetHeight : 0;
    const navH = nav ? nav.offsetHeight : 0;
    const contentH = h - headerH - navH;
    tc.style.setProperty('height',     Math.max(0, contentH) + 'px', 'important');
    tc.style.setProperty('max-height', Math.max(0, contentH) + 'px', 'important');
    tc.style.setProperty('flex',       'none',                        'important');
  }
}

// Corrige dimensões de um overlay para cobrir 100% da tela via JS
function fixOverlay(overlayEl) {
  if (!overlayEl) return;
  overlayEl.style.setProperty('width',  window.innerWidth  + 'px', 'important');
  overlayEl.style.setProperty('height', window.innerHeight + 'px', 'important');
  overlayEl.style.setProperty('top',    '0',                        'important');
  overlayEl.style.setProperty('left',   '0',                        'important');
}

function fixMainViewHeight() { fixLayout(); }

async function refreshPendenciasView() {
  if (!auth.user) return;
  if (hasOpenCardEditor()) return;
  await loadPendencias();
  renderCards();
  renderHistory(document.getElementById('mlp-hist-search')?.value || '');
}

function showMain() {
  document.getElementById('mlp-login-view').classList.remove('mlp-visible');
  const mv = document.getElementById('mlp-main-view');
  mv.classList.add('mlp-visible');
  fixLayout();
  const emailEl = document.getElementById('mlp-ajustes-email');
  if (emailEl && auth.user) emailEl.textContent = auth.user.email;
  renderCards();
  bindMainEvents();
}

function bindMainEvents() {
  const criarBtn              = document.getElementById('mlp-criar-btn');
  const remessaBtn            = document.getElementById('mlp-remessa-btn');
  const verConsolidadoBtn     = document.getElementById('mlp-ver-consolidado-btn');
  const envioIndividualAllBtn = document.getElementById('mlp-envio-individual-all-btn');
  const pinBtn                = document.getElementById('mlp-pin-btn');
  const logoutBtn             = document.getElementById('mlp-logout-btn');
  const logoutBtn2            = document.getElementById('mlp-logout-btn2');

  if (criarBtn)              criarBtn.onclick              = onCriarExpandido;
  if (remessaBtn)            remessaBtn.onclick            = onEnvioConsolidado;
  if (verConsolidadoBtn)     verConsolidadoBtn.onclick     = onVerConsolidado;
  if (envioIndividualAllBtn) envioIndividualAllBtn.onclick = onEnvioIndividualAll;
  if (logoutBtn)             logoutBtn.onclick             = onLogout;
  if (logoutBtn2)            logoutBtn2.onclick            = onLogout;

  // Modal consolidado — fechar
  const consolidadoOverlay = document.getElementById('mlp-consolidado-overlay');
  const modalClose         = document.getElementById('mlp-modal-close');
  if (modalClose)        modalClose.onclick = () => consolidadoOverlay?.classList.add('mlp-hidden');
  if (consolidadoOverlay) {
    consolidadoOverlay.addEventListener('click', e => {
      if (e.target === consolidadoOverlay) consolidadoOverlay.classList.add('mlp-hidden');
    });
  }

  // Modal envio — fechar
  const envioOverlay = document.getElementById('mlp-envio-overlay');
  const envioClose   = document.getElementById('mlp-envio-modal-close');
  if (envioClose) envioClose.onclick = () => envioOverlay?.classList.add('mlp-hidden');
  if (envioOverlay) {
    envioOverlay.addEventListener('click', e => {
      if (e.target === envioOverlay) envioOverlay.classList.add('mlp-hidden');
    });
  }

  if (pinBtn) {
    pinBtn.onclick = () => {
      isPinned = !isPinned;
      pinBtn.classList.toggle('mlp-pinned', isPinned);
      pinBtn.title = isPinned ? 'Desafixar painel' : 'Fixar painel';
    };
  }

  // History search
  const histSearch = document.getElementById('mlp-hist-search');
  if (histSearch) histSearch.oninput = () => renderHistory(histSearch.value);

  // Limpar histórico
  const limparHistBtn = document.getElementById('mlp-limpar-hist');
  if (limparHistBtn) limparHistBtn.onclick = onLimparHistoricoArquivados;

  // Email save
  const emailSalvar = document.getElementById('mlp-email-salvar');
  if (emailSalvar) {
    emailSalvar.onclick = async () => {
      const emailTo = document.getElementById('mlp-email-dest')?.value?.trim();
      const emailCC = document.getElementById('mlp-email-cc')?.value?.trim() || '';
      if (!emailTo) { toast('Informe o email destinatário', 'warning'); return; }
      await salvarEmailSettings({ emailTo, emailCC });
      toast('Email de envio salvo!');
    };
  }

  // Fefrello save
  const fefrelloSalvar  = document.getElementById('mlp-fefrello-salvar');
  const fefrelloRefresh = document.getElementById('mlp-fefrello-refresh');

  if (fefrelloSalvar) {
    fefrelloSalvar.onclick = async () => {
      const boardId     = document.getElementById('mlp-fefrello-board')?.value;
      const columnId    = document.getElementById('mlp-fefrello-coluna')?.value;
      const responsible = document.getElementById('mlp-fefrello-responsavel')?.value || '';
      if (!boardId || !columnId) { toast('Selecione board e coluna', 'warning'); return; }
      await salvarConfigFefrello({ boardId, columnId, responsible });
      toast('Configurações Fefrello salvas!');
    };
  }

  if (fefrelloRefresh) {
    fefrelloRefresh.onclick = async () => {
      fefrelloRefresh.disabled = true;
      fefrelloRefresh.textContent = 'Atualizando…';
      try {
        await forcarAtualizacaoCache();
        await loadFefrelloSettings();
        toast('Listas atualizadas!');
      } catch (e) {
        toast(e.message, 'error');
      } finally {
        fefrelloRefresh.disabled = false;
        fefrelloRefresh.innerHTML = `${icon('settings', 13)} Atualizar`;
      }
    };
  }

  // Bottom nav
  document.querySelectorAll('#mlp-root .mlp-nav-btn').forEach(btn => {
    btn.onclick = async () => {
      const tab = btn.dataset.tab;
      try {
        await refreshPendenciasView();
      } catch {}
      document.querySelectorAll('#mlp-root .mlp-nav-btn').forEach(b => b.classList.remove('mlp-active'));
      btn.classList.add('mlp-active');
      ['pendencias', 'historico', 'ajustes'].forEach(t => {
        const el = document.getElementById(`mlp-tab-${t}`);
        if (!el) return;
        el.classList.toggle('mlp-active-tab', t === tab);
      });
      if (tab === 'historico') {
        const s = document.getElementById('mlp-hist-search');
        renderHistory(s?.value || '');
      }
      if (tab === 'ajustes') { loadFefrelloSettings(); loadEmailSettings(); }
    };
  });
}

// ============================================================
//  FEFRELLO SETTINGS LOADER
// ============================================================
async function loadFefrelloSettings() {
  const boardSel   = document.getElementById('mlp-fefrello-board');
  const respSel    = document.getElementById('mlp-fefrello-responsavel');
  if (!boardSel) return;

  const saved = await carregarConfigFefrello();
  boardSel.innerHTML = '<option value="">Carregando...</option>';

  try {
    const boards = await carregarBoards();
    boardSel.innerHTML = '<option value="">Selecione o board...</option>';
    boards.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b.id; opt.textContent = b.name;
      if (saved?.boardId === b.id) opt.selected = true;
      boardSel.appendChild(opt);
    });
    if (saved?.boardId) await loadFefrelloColunas(saved.boardId, saved.columnId);
    if (saved?.responsible && respSel) respSel.value = saved.responsible;
  } catch (e) {
    boardSel.innerHTML = '<option value="">Erro ao carregar</option>';
    toast('Erro ao carregar boards Fefrello', 'error');
  }

  boardSel.onchange = async () => {
    const colSel = document.getElementById('mlp-fefrello-coluna');
    if (boardSel.value) {
      await loadFefrelloColunas(boardSel.value);
    } else if (colSel) {
      colSel.innerHTML = '<option value="">Selecione um board</option>';
      colSel.disabled  = true;
    }
  };
}

async function loadFefrelloColunas(boardId, savedColumnId) {
  const colSel = document.getElementById('mlp-fefrello-coluna');
  if (!colSel) return;
  colSel.innerHTML = '<option value="">Carregando...</option>';
  colSel.disabled  = true;
  try {
    const cols = await carregarColunas(boardId);
    colSel.innerHTML = '<option value="">Selecione a coluna...</option>';
    cols.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id; opt.textContent = c.title;
      if (savedColumnId && savedColumnId === c.id) opt.selected = true;
      colSel.appendChild(opt);
    });
    colSel.disabled = false;
  } catch (e) {
    colSel.innerHTML = '<option value="">Erro ao carregar</option>';
    toast('Erro ao carregar colunas', 'error');
  }
}

async function loadEmailSettings() {
  const saved     = await carregarEmailSettings();
  const emailToEl = document.getElementById('mlp-email-dest');
  const emailCCEl = document.getElementById('mlp-email-cc');
  if (emailToEl) emailToEl.value = saved?.emailTo || DEFAULT_EMAIL_TO;
  if (emailCCEl) emailCCEl.value = saved?.emailCC || '';
}

// ============================================================
//  RENDER — CARDS (Pendências)
// ============================================================
function renderCards() {
  const container = document.getElementById('mlp-cards-container');
  const countEl   = document.getElementById('mlp-count');
  const ativos    = pendencias.filter(p => !archivedIds.has(String(p.id)));
  if (!container) return;
  if (ativos.length === 0) {
    container.innerHTML = '<div class="mlp-empty">Nenhuma pendência cadastrada.</div>';
    if (countEl) countEl.textContent = '';
    return;
  }
  if (countEl) countEl.textContent = ativos.length;
  container.innerHTML = renderGrouped(ativos, p => cardHtml(p, false));
  if (expandedCardId) {
    const expandedCard = container.querySelector(`.mlp-card[data-id="${expandedCardId}"]`);
    if (expandedCard) expandedCard.classList.add('mlp-expanded');
    else expandedCardId = null;
  }
  bindCardEvents();
}

// Field order: Login, Venda | URL | Modelo | Aro | Observações
function cardHtml(p, isNew) {
  const id  = p.id || 'new';
  const obs = p.observacoes || '';
  const arquivado = archivedIds.has(String(id));

  if (isNew) {
    const arosNew = parseAros(p.aro);
    return `
    <div class="mlp-card" data-id="${id}">
      <div class="mlp-card-header">
        <div class="mlp-card-header-left">
          <div class="mlp-card-avatar empty">${icon('user', 14)}</div>
          <span class="mlp-card-name">Nova Pendência</span>
        </div>
      </div>
      <div class="mlp-card-grid">
        ${fg2('login_cliente', 'Login',   p.login_cliente, 'Apelido do comprador')}
        ${fg1('numero_venda',  'Venda #', p.numero_venda,  'Número da venda')}
        ${fg2('url',           'URL',     p.url,           'https://...')}
        ${fg2('modelo',        'Modelo',  p.modelo,        'Descreva o modelo')}
        ${arosNew.map(a => fg_aro(a.label, a.value)).join('')}
        ${fgta('observacoes',  'Observações', p.observacoes, 'Detalhes adicionais...')}
      </div>
      <div class="mlp-card-footer">
        <button class="mlp-btn mlp-btn-ghost mlp-btn-cancel-new">
          ${icon('x', 13)} Cancelar
        </button>
        <button class="mlp-btn mlp-btn-primary mlp-btn-save-new">
          ${icon('check', 13)} Salvar
        </button>
      </div>
    </div>`;
  }

  const name       = p.login_cliente || 'Pendência';
  const obsPreview = obs.slice(0, 72) + (obs.length > 72 ? '…' : '');
  const aros       = parseAros(p.aro);
  const fefSent    = fefrelloSentIds.has(String(id));
  const emailSent  = emailSentIds.has(String(id));
  const copiado    = consolidadoCopiadoIds.has(String(id));
  const datetime   = formatDateTime(p.created_at);

  return `
  <div class="mlp-card mlp-card-saved" data-id="${id}">
    <div class="mlp-card-summary">
      <div class="mlp-card-header-left">
        <div class="mlp-card-avatar-stack">
          <div class="mlp-card-avatar ${!p.login_cliente ? 'empty' : ''}">${icon('user', 14)}</div>
          ${emailSent || copiado ? `<div class="mlp-card-badges mlp-card-status-stack">
            ${emailSent ? `<span class="mlp-badge mlp-badge-email" title="Email enviado">${icon('mail', 10)}</span>` : ''}
            ${copiado   ? `<span class="mlp-badge mlp-badge-copiado" title="Consolidado copiado">${icon('clipboard', 10)}</span>` : ''}
          </div>` : ''}
        </div>
        <div class="mlp-card-summary-info">
          <span class="mlp-card-name">${esc(name)}</span>
          <div class="mlp-card-meta-line">
            ${p.numero_venda ? `<span class="mlp-card-meta">#${esc(p.numero_venda)}</span>` : ''}
            ${datetime ? `<span class="mlp-card-time">${datetime}</span>` : ''}
          </div>
          ${obs ? `<span class="mlp-card-obs-preview">${esc(obsPreview)}</span>` : ''}
        </div>
      </div>
      <div class="mlp-card-summary-actions">
        <button class="mlp-btn-icon-archive mlp-btn-archive" data-id="${id}" title="${arquivado ? 'Desarquivar' : 'Arquivar'}">
          ${icon('folder', 12)}
        </button>
        <button class="mlp-btn-icon-send mlp-btn-send-one" data-id="${id}" title="Enviar por e-mail">
          ${icon('send', 12)}
        </button>
        <button class="mlp-btn-icon-danger mlp-btn-del" data-id="${id}" title="Excluir">
          ${icon('trash', 12)}
        </button>
      </div>
    </div>
    <div class="mlp-card-body">
      <div class="mlp-card-grid">
        ${fg2('login_cliente', 'Login',   p.login_cliente, 'Apelido do comprador')}
        ${fg1('numero_venda',  'Venda #', p.numero_venda,  'Número da venda')}
        ${fg2('url',           'URL',     p.url,           'https://...')}
        ${fg2('modelo',        'Modelo',  p.modelo,        'Descreva o modelo')}
        ${aros.map(a => fg_aro(a.label, a.value)).join('')}
        ${fgta('observacoes',  'Observações', p.observacoes, 'Detalhes adicionais...')}
      </div>
      <div class="mlp-card-footer">
        <button class="mlp-btn mlp-btn-primary mlp-btn-save-existing" data-id="${id}">
          ${icon('check', 13)} Salvar
        </button>
        <button class="mlp-btn mlp-btn-fefrello mlp-btn-criar-fefrello${fefSent ? ' mlp-btn-fefrello-sent' : ''}"
                data-id="${id}" ${fefSent ? 'disabled' : ''}>
          ${fefSent ? icon('check', 13) : icon('grid', 13)} ${fefSent ? 'Enviado' : 'Fefrello'}
        </button>
      </div>
    </div>
  </div>`;
}

function fg1(name, label, value, ph) {
  return `<div class="mlp-fg mlp-col-1">
    <label class="mlp-fg-label">${label}</label>
    <input type="text" class="mlp-fi" data-field="${name}" value="${esc(value)}" placeholder="${ph}" />
  </div>`;
}
function fg2(name, label, value, ph) {
  return `<div class="mlp-fg mlp-col-2">
    <label class="mlp-fg-label">${label}</label>
    <input type="text" class="mlp-fi" data-field="${name}" value="${esc(value)}" placeholder="${ph}" />
  </div>`;
}
function fgta(name, label, value, ph) {
  return `<div class="mlp-fg mlp-col-2">
    <label class="mlp-fg-label">${label}</label>
    <textarea class="mlp-fta" data-field="${name}" placeholder="${ph}">${esc(value)}</textarea>
  </div>`;
}
function fg_aro(label, value) {
  return `<div class="mlp-fg mlp-col-1">
    <label class="mlp-fg-label">${esc(label)}</label>
    <input type="text" class="mlp-fi" data-field="aro" data-aro-label="${esc(label)}" value="${esc(value)}" placeholder="Ex: 18" />
  </div>`;
}

function bindCardEvents() {
  const c = document.getElementById('mlp-cards-container');
  if (!c) return;

  // Expand/collapse — click na seta OU em qualquer área do summary (exceto botões de ação)
  c.querySelectorAll('.mlp-card-summary').forEach(summary => {
    summary.onclick = (e) => {
      if (e.target.closest('.mlp-btn, .mlp-btn-icon-send, .mlp-btn-icon-danger, .mlp-btn-icon-archive')) return;
      const card = summary.closest('.mlp-card-saved');
      if (!card) return;
      const expanded = card.classList.toggle('mlp-expanded');
      expandedCardId = expanded ? String(card.dataset.id) : null;
      const toggle = summary.querySelector('.mlp-card-toggle');
      if (toggle) toggle.innerHTML = icon(expanded ? 'chevronUp' : 'chevronDown', 15);
    };
  });

  // Excluir
  c.querySelectorAll('.mlp-btn-del').forEach(b => {
    b.onclick = async () => {
      if (!confirm('Excluir esta pendência?')) return;
      try {
        await deletePendencia(b.dataset.id);
        pendencias = pendencias.filter(p => String(p.id) !== String(b.dataset.id));
        if (expandedCardId === String(b.dataset.id)) expandedCardId = null;
        renderCards();
        toast('Pendência excluída.');
      } catch (e) { toast(e.message, 'error'); }
    };
  });

  // Cancelar novo
  c.querySelectorAll('.mlp-btn-cancel-new').forEach(b => {
    b.onclick = () => { b.closest('.mlp-card')?.remove(); if (!pendencias.length) renderCards(); };
  });

  // Salvar novo — substitui o cartão in-place e anima abertura
  c.querySelectorAll('.mlp-btn-save-new').forEach(b => {
    b.onclick = async () => {
      const card   = b.closest('.mlp-card');
      const fields = collectFields(card);
      if (hasDuplicateVenda(fields.numero_venda)) {
        highlightDuplicateCard(fields.numero_venda);
        card?.remove();
        if (!pendencias.length) renderCards();
        toast('Já existe pendência para esta venda.', 'warning');
        return;
      }
      b.disabled = true; b.innerHTML = `${icon('check', 13)} Salvando…`;
      try {
        const saved = await createPendencia(fields);
        pendencias.unshift(saved);
        expandedCardId = String(saved.id);

        // Constrói o HTML do cartão salvo e injeta no lugar
        const tmp = document.createElement('div');
        tmp.innerHTML = cardHtml(saved, false).trim();
        const newCard = tmp.firstElementChild;

        card.replaceWith(newCard);

        // Dois frames: primeiro o browser pinta o cartão colapsado,
        // depois adiciona mlp-expanded — a transição CSS dispara
        requestAnimationFrame(() => requestAnimationFrame(() => {
          newCard.classList.add('mlp-expanded');
          const toggle = newCard.querySelector('.mlp-card-toggle');
          if (toggle) toggle.innerHTML = icon('chevronUp', 15);
        }));

        // Re-vincula todos os eventos do container
        bindCardEvents();

        // Atualiza badge de contagem
        const countEl = document.getElementById('mlp-count');
        if (countEl) countEl.textContent = pendencias.length;

        toast('Pendência salva!');
      } catch (e) {
        toast(e.message, 'error');
        b.disabled = false; b.innerHTML = `${icon('check', 13)} Salvar`;
      }
    };
  });

  // Salvar existente
  c.querySelectorAll('.mlp-btn-save-existing').forEach(b => {
    b.onclick = async () => {
      const id     = b.dataset.id;
      const card   = b.closest('.mlp-card');
      const fields = collectFields(card);
      b.disabled = true; b.textContent = 'Salvando…';
      try {
        await updatePendencia(id, fields);
        const idx = pendencias.findIndex(p => String(p.id) === String(id));
        if (idx !== -1) pendencias[idx] = { ...pendencias[idx], ...fields };
        expandedCardId = null;
        toast('Atualizado!');
        renderCards();
      } catch (e) {
        toast(e.message, 'error');
        b.disabled = false; b.innerHTML = `${icon('check', 13)} Salvar`;
      }
    };
  });

  // Enviar individual (email)
  c.querySelectorAll('.mlp-btn-send-one').forEach(b => {
    b.onclick = () => onEnviarIndividual(b.dataset.id, b);
  });

  c.querySelectorAll('.mlp-btn-archive').forEach(b => {
    b.onclick = async (e) => {
      e.stopPropagation();
      const id = String(b.dataset.id);
      archivedIds.add(id);
      if (expandedCardId === id) expandedCardId = null;
      await saveCardStatus();
      renderCards();
      renderHistory(document.getElementById('mlp-hist-search')?.value || '');
      toast('Pendência arquivada no histórico.');
    };
  });

  // Criar card Fefrello
  c.querySelectorAll('.mlp-btn-criar-fefrello').forEach(b => {
    b.onclick = () => onCriarFefrello(b.dataset.id, b);
  });
}

function bindSavedCardEvents(container, rerender) {
  if (!container) return;

  container.querySelectorAll('.mlp-card-summary').forEach(summary => {
    summary.onclick = (e) => {
      if (e.target.closest('.mlp-btn, .mlp-btn-icon-send, .mlp-btn-icon-danger, .mlp-btn-icon-archive')) return;
      const card = summary.closest('.mlp-card-saved');
      if (!card) return;
      const expanded = card.classList.toggle('mlp-expanded');
      expandedCardId = expanded ? String(card.dataset.id) : null;
    };
  });

  container.querySelectorAll('.mlp-btn-del').forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      if (!confirm('Excluir esta pendência?')) return;
      try {
        await deletePendencia(btn.dataset.id);
        archivedIds.delete(String(btn.dataset.id));
        pendencias = pendencias.filter(p => String(p.id) !== String(btn.dataset.id));
        if (expandedCardId === String(btn.dataset.id)) expandedCardId = null;
        rerender();
        const countEl = document.getElementById('mlp-count');
        if (countEl) countEl.textContent = pendencias.filter(p => !archivedIds.has(String(p.id))).length || '';
        toast('Pendência excluída.');
      } catch (ex) { toast(ex.message, 'error'); }
    };
  });

  container.querySelectorAll('.mlp-btn-save-existing').forEach(btn => {
    btn.onclick = async () => {
      const id     = btn.dataset.id;
      const card   = btn.closest('.mlp-card');
      const fields = collectFields(card);
      btn.disabled = true; btn.textContent = 'Salvando…';
      try {
        await updatePendencia(id, fields);
        const idx = pendencias.findIndex(p => String(p.id) === String(id));
        if (idx !== -1) pendencias[idx] = { ...pendencias[idx], ...fields };
        expandedCardId = null;
        toast('Atualizado!');
        rerender();
      } catch (ex) {
        toast(ex.message, 'error');
        btn.disabled = false; btn.innerHTML = `${icon('check', 13)} Salvar`;
      }
    };
  });

  container.querySelectorAll('.mlp-btn-send-one').forEach(btn => {
    btn.onclick = () => onEnviarIndividual(btn.dataset.id, btn);
  });

  container.querySelectorAll('.mlp-btn-archive').forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const id = String(btn.dataset.id);
      if (archivedIds.has(id)) {
        archivedIds.delete(id);
        expandedCardId = id;
        await saveCardStatus();
        toast('Pendência retornou para a tela principal.');
      } else {
        archivedIds.add(id);
        if (expandedCardId === id) expandedCardId = null;
        await saveCardStatus();
        toast('Pendência arquivada no histórico.');
      }
      rerender();
    };
  });

  container.querySelectorAll('.mlp-btn-criar-fefrello').forEach(btn => {
    btn.onclick = () => onCriarFefrello(btn.dataset.id, btn);
  });
}

// ============================================================
//  RENDER — HISTÓRICO
// ============================================================
function renderHistory(filter = '') {
  const container = document.getElementById('mlp-history-list');
  if (!container) return;

  const q    = (filter || '').toLowerCase().trim();
  const historico = pendencias.filter(p => archivedIds.has(String(p.id)));
  const list = q
    ? historico.filter(p => {
        const d = p.created_at ? new Date(p.created_at).toLocaleDateString('pt-BR') : '';
        return (p.login_cliente || '').toLowerCase().includes(q) ||
               (p.numero_venda  || '').toLowerCase().includes(q) ||
               d.includes(q);
      })
    : historico;

  if (list.length === 0) {
    container.innerHTML = `<div class="mlp-empty">${q ? 'Nenhum resultado.' : 'Nenhuma pendência cadastrada.'}</div>`;
    return;
  }

  container.innerHTML = renderGrouped(list, p => historyItemHtml(p));
  bindHistoryEvents();
}

function historyItemHtml(p) {
  return cardHtml(p, false);
  const date    = p.created_at
    ? new Date(p.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
    : '—';
  const obs     = p.observacoes || '';
  const urlShort = (p.url || '').slice(0, 55) + ((p.url || '').length > 55 ? '…' : '');

  return `
  <div class="mlp-hist-item" data-id="${p.id}">
    <div class="mlp-hist-summary">
      <div class="mlp-hist-summary-left">
        <span class="mlp-hist-avatar">${icon('user', 14)}</span>
        <div class="mlp-hist-info">
          <span class="mlp-hist-login">${esc(p.login_cliente) || '(sem login)'}</span>
          ${obs ? `<span class="mlp-hist-obs">${esc(obs.slice(0, 50))}${obs.length > 50 ? '…' : ''}</span>` : ''}
        </div>
      </div>
      <div class="mlp-hist-summary-right">
        ${p.numero_venda ? `<span class="mlp-hist-venda">#${esc(p.numero_venda)}</span>` : ''}
        <span class="mlp-hist-date">${date}</span>
        <button class="mlp-hist-del-btn mlp-btn-icon-danger" data-id="${p.id}" title="Excluir">${icon('trash', 13)}</button>
        <button class="mlp-hist-toggle mlp-icon-btn" title="Expandir">${icon('chevronDown', 14)}</button>
      </div>
    </div>
    <div class="mlp-hist-body">
      ${p.url    ? `<div class="mlp-hist-detail-row"><span class="mlp-hist-detail-label">URL</span><a class="mlp-hist-detail-link" href="${esc(p.url)}" target="_blank">${esc(urlShort)}</a></div>` : ''}
      ${p.modelo ? `<div class="mlp-hist-detail-row"><span class="mlp-hist-detail-label">Modelo</span><span class="mlp-hist-detail-val">${esc(p.modelo)}</span></div>` : ''}
      ${parseAros(p.aro).filter(a => a.value).map(a =>
        `<div class="mlp-hist-detail-row"><span class="mlp-hist-detail-label">${esc(a.label)}</span><span class="mlp-hist-detail-val">${esc(a.value)}</span></div>`
      ).join('')}
      ${obs      ? `<div class="mlp-hist-detail-row"><span class="mlp-hist-detail-label">Obs</span><span class="mlp-hist-detail-val">${esc(obs)}</span></div>` : ''}
      <div class="mlp-hist-actions">
        <button class="mlp-btn mlp-btn-fefrello mlp-btn-criar-fefrello-hist" data-id="${p.id}" style="gap:5px">
          ${icon('grid', 13)} Fefrello
        </button>
      </div>
    </div>
  </div>`;
}

function bindHistoryEvents() {
  const container = document.getElementById('mlp-history-list');
  if (!container) return;
  bindSavedCardEvents(container, () => {
    const search = document.getElementById('mlp-hist-search');
    renderHistory(search?.value || '');
  });
  return;

  container.querySelectorAll('.mlp-hist-summary').forEach(summary => {
    summary.onclick = (e) => {
      if (e.target.closest('.mlp-btn, .mlp-btn-icon-danger')) return;
      const item     = summary.closest('.mlp-hist-item');
      if (!item) return;
      const expanded = item.classList.toggle('mlp-expanded');
      const toggle   = summary.querySelector('.mlp-hist-toggle');
      if (toggle) toggle.innerHTML = icon(expanded ? 'chevronUp' : 'chevronDown', 14);
    };
  });

  container.querySelectorAll('.mlp-hist-del-btn').forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      if (!confirm('Excluir esta pendência?')) return;
      try {
        await deletePendencia(btn.dataset.id);
        pendencias = pendencias.filter(p => String(p.id) !== String(btn.dataset.id));
        const search = document.getElementById('mlp-hist-search');
        renderHistory(search?.value || '');
        toast('Pendência excluída.');
      } catch (ex) { toast(ex.message, 'error'); }
    };
  });

  container.querySelectorAll('.mlp-btn-criar-fefrello-hist').forEach(btn => {
    btn.onclick = () => onCriarFefrello(btn.dataset.id, btn);
  });
}

// ============================================================
//  HELPERS
// ============================================================
function collectFields(card) {
  const out = {};
  const aroItems = [];
  card.querySelectorAll('.mlp-fi, .mlp-fta').forEach(f => {
    if (f.dataset.field === 'aro') {
      aroItems.push({ label: f.dataset.aroLabel || 'Aro', value: f.value || '' });
    } else {
      out[f.dataset.field] = f.value || '';
    }
  });
  out.aro = JSON.stringify(aroItems.length > 0 ? aroItems : [{ label: 'Avulso 1', value: '' }]);
  return out;
}

function hasDuplicateVenda(numeroVenda, excludeId = null) {
  const target = String(numeroVenda || '').trim();
  if (!target) return false;
  return pendencias.some(p =>
    String(p.numero_venda || '').trim() === target &&
    (excludeId == null || String(p.id) !== String(excludeId))
  );
}

function findDuplicatePendencia(numeroVenda, excludeId = null) {
  const target = String(numeroVenda || '').trim();
  if (!target) return null;
  return pendencias.find(p =>
    String(p.numero_venda || '').trim() === target &&
    (excludeId == null || String(p.id) !== String(excludeId))
  ) || null;
}

function highlightDuplicateCard(numeroVenda, excludeId = null) {
  const dupe = findDuplicatePendencia(numeroVenda, excludeId);
  if (!dupe) return false;

  const card = document.querySelector(`#mlp-root .mlp-card[data-id="${dupe.id}"]`);
  if (!card) return false;

  card.classList.remove('mlp-card-duplicate-flash');
  void card.offsetWidth;
  card.classList.add('mlp-card-duplicate-flash');
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => {
    card.classList.remove('mlp-card-duplicate-flash');
  }, 3000);
  return true;
}

// ============================================================
//  AÇÕES
// ============================================================
function onCriar() {
  const container = document.getElementById('mlp-cards-container');
  container?.querySelector('.mlp-empty')?.remove();

  const pageData = capturedData || getCapturedPageData();
  const tempDiv  = document.createElement('div');
  tempDiv.innerHTML = cardHtml({ ...pageData, id: null }, true);
  const cardEl = tempDiv.firstElementChild;
  container?.insertBefore(cardEl, container.firstChild);

  const cancelBtn = cardEl.querySelector('.mlp-btn-cancel-new');
  const saveBtn   = cardEl.querySelector('.mlp-btn-save-new');

  if (cancelBtn) cancelBtn.onclick = () => cardEl.remove();
  if (saveBtn) {
    saveBtn.onclick = async () => {
      const fields = collectFields(cardEl);
      if (hasDuplicateVenda(fields.numero_venda)) {
        highlightDuplicateCard(fields.numero_venda);
        cardEl.remove();
        if (!pendencias.length) renderCards();
        toast('Já existe pendência para esta venda.', 'warning');
        return;
      }
      saveBtn.disabled = true; saveBtn.textContent = 'Salvando…';
      try {
        const saved = await createPendencia(fields);
        pendencias.unshift(saved);
        renderCards();
        toast('Pendência salva!');
      } catch (e) {
        toast(e.message, 'error');
        saveBtn.disabled = false; saveBtn.innerHTML = `${icon('check', 13)} Salvar`;
      }
    };
  }
  cardEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function onCriarExpandido() {
  const container = document.getElementById('mlp-cards-container');
  container?.querySelector('.mlp-empty')?.remove();

  const pageData = capturedData || getCapturedPageData();
  const tempDiv  = document.createElement('div');
  tempDiv.innerHTML = cardHtml({ ...pageData, id: null }, true);
  const cardEl = tempDiv.firstElementChild;
  container?.insertBefore(cardEl, container.firstChild);

  const cancelBtn = cardEl.querySelector('.mlp-btn-cancel-new');
  const saveBtn   = cardEl.querySelector('.mlp-btn-save-new');

  if (cancelBtn) cancelBtn.onclick = () => cardEl.remove();
  if (saveBtn) {
    saveBtn.onclick = async () => {
      const fields = collectFields(cardEl);
      if (hasDuplicateVenda(fields.numero_venda)) {
        highlightDuplicateCard(fields.numero_venda);
        cardEl.remove();
        if (!pendencias.length) renderCards();
        toast('Já existe pendência para esta venda.', 'warning');
        return;
      }
      saveBtn.disabled = true;
      saveBtn.textContent = 'Salvando...';
      try {
        const saved = await createPendencia(fields);
        pendencias.unshift(saved);
        expandedCardId = String(saved.id);

        const wrap = document.createElement('div');
        wrap.innerHTML = cardHtml(saved, false).trim();
        const newCard = wrap.firstElementChild;
        cardEl.replaceWith(newCard);

        requestAnimationFrame(() => requestAnimationFrame(() => {
          newCard.classList.add('mlp-expanded');
          newCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }));

        bindCardEvents();
        const countEl = document.getElementById('mlp-count');
        if (countEl) countEl.textContent = pendencias.length;
        toast('Pendencia salva!');
      } catch (e) {
        toast(e.message, 'error');
        saveBtn.disabled = false;
        saveBtn.innerHTML = `${icon('check', 13)} Salvar`;
      }
    };
  }

  cardEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function onEnviarRemessa() {
  if (pendencias.length === 0) { toast('Nenhuma pendência para enviar.', 'warning'); return; }
  const btn = document.getElementById('mlp-remessa-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Enviando…'; }
  try {
    const date    = formatDate();
    const subject = `Pendentes - ${date}`;
    const body    = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
        <h2 style="color:#222;border-bottom:3px solid #FFE600;padding-bottom:8px;">
          Pendências em Aberto — ${date}
        </h2>
        <p style="color:#666;margin-bottom:16px;">Total: <strong>${pendencias.length}</strong> pendência(s)</p>
        ${pendencias.map((p, i) =>
          `${i > 0 ? '<hr style="border:none;border-top:1px solid #eee;margin:12px 0;" />' : ''}${cardToHtml(p)}`
        ).join('')}
      </div>`;
    await sendEmail(subject, body);
    pendencias.forEach(p => emailSentIds.add(String(p.id)));
    await saveCardStatus();
    renderCards();
    toast(`Remessa enviada — ${pendencias.length} pendência(s)!`);
  } catch (e) {
    toast(e.message, 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = `${icon('send', 13)} Enviar Consolidado`; }
  }
}

async function onEnviarIndividual(id, btn) {
  const p = pendencias.find(x => String(x.id) === String(id));
  if (!p) return;
  if (btn) { btn.disabled = true; btn.innerHTML = icon('send', 15); }
  try {
    const date    = formatDate();
    const subject = `${p.login_cliente || 'Cliente'} - Pendente - ${date}`;
    const body    = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
        <h2 style="color:#222;border-bottom:3px solid #FFE600;padding-bottom:8px;">
          Pendência — ${esc(p.login_cliente) || 'Cliente'}
        </h2>
        <p style="color:#666;margin-bottom:16px;">Data: <strong>${date}</strong></p>
        ${cardToHtml(p)}
      </div>`;
    await sendEmail(subject, body);
    emailSentIds.add(String(id));
    await saveCardStatus();
    renderCards();
    toast('E-mail enviado!');
  } catch (e) {
    toast(e.message, 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = icon('send', 15); }
  }
}

async function onCriarFefrello(id, btn) {
  const p = pendencias.find(x => String(x.id) === String(id));
  if (!p) return;
  const config = await carregarConfigFefrello();
  if (!config?.boardId || !config?.columnId) {
    toast('Configure o Fefrello em Ajustes', 'warning');
    return;
  }
  const originalHTML = btn?.innerHTML;
  if (btn) { btn.disabled = true; btn.textContent = 'Criando…'; }
  try {
    const title       = p.login_cliente || p.numero_venda || 'Sem título';
    const description = formatCardForFefrello(p);
    await criarCardFefrello(config.boardId, config.columnId, title, description, config.responsible || '');
    fefrelloSentIds.add(String(id));
    await saveCardStatus();
    toast('Card Fefrello criado!');
    // Mantém botão desabilitado e cinza (enviado)
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `${icon('check', 13)} Enviado`;
      btn.classList.add('mlp-btn-fefrello-sent');
    }
  } catch (e) {
    toast(e.message, 'error');
    if (btn) { btn.disabled = false; btn.innerHTML = originalHTML || `${icon('grid', 13)} Fefrello`; }
  }
}

// ============================================================
//  ENVIO COM CONFIRMAÇÃO (Consolidado do dia / Individual do dia)
// ============================================================
async function onEnvioConsolidado() {
  await loadPendencias();
  renderCards();
  renderHistory(document.getElementById('mlp-hist-search')?.value || '');
  const hoje = pendencias.filter(p => dateGroupLabel(p.created_at) === 'Hoje');
  if (hoje.length === 0) { toast('Nenhuma pendência de hoje para enviar.', 'warning'); return; }
  abrirEnvioModal('consolidado', new Set(hoje.map(p => String(p.id))));
}

async function onEnvioIndividualAll() {
  await loadPendencias();
  renderCards();
  renderHistory(document.getElementById('mlp-hist-search')?.value || '');
  const hoje = pendencias.filter(p => dateGroupLabel(p.created_at) === 'Hoje');
  if (hoje.length === 0) { toast('Nenhuma pendência de hoje para enviar.', 'warning'); return; }
  abrirEnvioModal('individual', new Set(hoje.map(p => String(p.id))));
}

function abrirEnvioModal(mode, selectedIds) {
  const overlay = document.getElementById('mlp-envio-overlay');
  const titleEl = document.getElementById('mlp-envio-modal-title');
  if (!overlay) return;
  if (titleEl) titleEl.textContent =
    mode === 'consolidado' ? 'Envio Consolidado — Hoje' : 'Envio Individual — Hoje';
  renderEnvioModal(mode, selectedIds);
  fixOverlay(overlay);
  overlay.classList.remove('mlp-hidden');
}

function renderEnvioModal(mode, selectedIds) {
  const list    = document.getElementById('mlp-envio-cards-list');
  const countEl = document.getElementById('mlp-envio-modal-count');
  if (!list) return;

  const todayCards = pendencias.filter(p => selectedIds.has(String(p.id)));

  const updateCount = () => {
    const n = selectedIds.size;
    if (countEl) countEl.textContent =
      `${n} de ${todayCards.length} selecionado${n !== 1 ? 's' : ''}`;
  };

  list.innerHTML = todayCards.map(p => {
    const id       = String(p.id);
    const selected = selectedIds.has(id);
    const aros     = parseAros(p.aro);
    const datetime = formatDateTime(p.created_at);
    return `
    <div class="mlp-modal-item${selected ? ' mlp-selected' : ''}" data-id="${id}">
      <div class="mlp-modal-item-header">
        <div class="mlp-modal-checkbox">${selected ? icon('check', 12) : ''}</div>
        <div class="mlp-modal-info">
          <div class="mlp-modal-client">
            ${esc(p.login_cliente) || '(sem login)'}
            ${p.numero_venda ? `<span class="mlp-modal-venda">#${esc(p.numero_venda)}</span>` : ''}
          </div>
          ${p.modelo ? `<div class="mlp-modal-detail">Modelo: ${esc(p.modelo)}</div>` : ''}
          ${aros.filter(a => a.value).map(a =>
            `<div class="mlp-modal-detail">${esc(a.label)}: ${esc(a.value)}</div>`
          ).join('')}
          ${datetime ? `<div class="mlp-modal-detail">${datetime}</div>` : ''}
        </div>
      </div>
    </div>`;
  }).join('');

  updateCount();

  list.querySelectorAll('.mlp-modal-item-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.mlp-modal-item');
      const id   = item.dataset.id;
      if (selectedIds.has(id)) {
        selectedIds.delete(id);
        item.classList.remove('mlp-selected');
        header.querySelector('.mlp-modal-checkbox').innerHTML = '';
      } else {
        selectedIds.add(id);
        item.classList.add('mlp-selected');
        header.querySelector('.mlp-modal-checkbox').innerHTML = icon('check', 12);
      }
      updateCount();
    });
  });

  const confirmBtn = document.getElementById('mlp-envio-confirmar');
  if (confirmBtn) confirmBtn.onclick = () => confirmarEnvio(mode, selectedIds);
}

async function confirmarEnvio(mode, selectedIds) {
  const selected = pendencias.filter(p => selectedIds.has(String(p.id)));
  if (selected.length === 0) { toast('Nenhum item selecionado.', 'warning'); return; }
  document.getElementById('mlp-envio-overlay')?.classList.add('mlp-hidden');
  if (mode === 'consolidado') {
    await _enviarConsolidado(selected);
  } else {
    await _enviarIndividualAll(selected);
  }
}

async function _enviarConsolidado(selected) {
  const btn = document.getElementById('mlp-remessa-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Enviando…'; }
  try {
    const date    = formatDate();
    const subject = `Pendentes - ${date}`;
    const body    = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
        <h2 style="color:#222;border-bottom:3px solid #FFE600;padding-bottom:8px;">
          Pendências em Aberto — ${date}
        </h2>
        <p style="color:#666;margin-bottom:16px;">Total: <strong>${selected.length}</strong> pendência(s)</p>
        ${selected.map((p, i) =>
          `${i > 0 ? '<hr style="border:none;border-top:1px solid #eee;margin:12px 0;" />' : ''}${cardToHtml(p)}`
        ).join('')}
      </div>`;
    await sendEmail(subject, body);
    selected.forEach(p => emailSentIds.add(String(p.id)));
    await saveCardStatus();
    renderCards();
    toast(`Consolidado enviado — ${selected.length} pendência(s)!`);
  } catch (e) {
    toast(e.message, 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = `${icon('send', 13)} Env. Consolidado`; }
  }
}

async function _enviarIndividualAll(selected) {
  const btn = document.getElementById('mlp-envio-individual-all-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Enviando…'; }
  let success = 0;
  const errors = [];
  for (const p of selected) {
    try {
      const date    = formatDate();
      const subject = `${p.login_cliente || 'Cliente'} - Pendente - ${date}`;
      const body    = `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
          <h2 style="color:#222;border-bottom:3px solid #FFE600;padding-bottom:8px;">
            Pendência — ${esc(p.login_cliente) || 'Cliente'}
          </h2>
          <p style="color:#666;margin-bottom:16px;">Data: <strong>${date}</strong></p>
          ${cardToHtml(p)}
        </div>`;
      await sendEmail(subject, body);
      emailSentIds.add(String(p.id));
      success++;
    } catch (e) {
      errors.push(`${p.login_cliente || 'Cliente'}: ${e.message}`);
    }
  }
  await saveCardStatus();
  renderCards();
  if (btn) { btn.disabled = false; btn.innerHTML = `${icon('send', 12)} Envio Individual`; }
  if (errors.length === 0) {
    toast(`${success} email(s) enviado(s)!`);
  } else {
    toast(`${success} enviados, ${errors.length} erro(s).`, 'warning');
  }
}

// ============================================================
//  CONSOLIDADO
// ============================================================
async function onVerConsolidado() {
  await loadPendencias();
  renderCards();
  renderHistory(document.getElementById('mlp-hist-search')?.value || '');
  if (pendencias.length === 0) { toast('Nenhuma pendência para consolidar.', 'info'); return; }
  const overlay = document.getElementById('mlp-consolidado-overlay');
  if (!overlay) return;
  const selectedIds = new Set(pendencias.map(p => String(p.id)));
  const localEdits  = new Map();
  renderConsolidadoModal(selectedIds, localEdits);
  fixOverlay(overlay);
  overlay.classList.remove('mlp-hidden');
}

function renderConsolidadoModal(selectedIds, localEdits) {
  const list    = document.getElementById('mlp-modal-cards-list');
  const countEl = document.getElementById('mlp-modal-count');
  if (!list) return;

  const updateCount = () => {
    if (countEl) countEl.textContent =
      `${selectedIds.size} de ${pendencias.length} selecionado${selectedIds.size !== 1 ? 's' : ''}`;
  };

  list.innerHTML = pendencias.map(p => {
    const id       = String(p.id);
    const selected = selectedIds.has(id);
    const aros     = parseAros(p.aro);
    return `
    <div class="mlp-modal-item${selected ? ' mlp-selected' : ''}" data-id="${id}">
      <div class="mlp-modal-item-header">
        <div class="mlp-modal-checkbox">${selected ? icon('check', 12) : ''}</div>
        <div class="mlp-modal-info">
          <div class="mlp-modal-client">
            ${esc(p.login_cliente) || '(sem login)'}
            ${p.numero_venda ? `<span class="mlp-modal-venda">#${esc(p.numero_venda)}</span>` : ''}
          </div>
          ${p.modelo ? `<div class="mlp-modal-detail">Modelo: ${esc(p.modelo)}</div>` : ''}
          ${aros.filter(a => a.value).map(a => `<div class="mlp-modal-detail">${esc(a.label)}: ${esc(a.value)}</div>`).join('')}
          ${p.observacoes ? `<div class="mlp-modal-detail">${esc(p.observacoes.slice(0, 80) + (p.observacoes.length > 80 ? '…' : ''))}</div>` : ''}
        </div>
        <button class="mlp-modal-edit-btn" title="Editar">${icon('edit', 13)}</button>
        <button class="mlp-modal-del-btn" data-id="${id}" title="Excluir">${icon('trash', 13)}</button>
      </div>
      <div class="mlp-modal-edit-form mlp-hidden">
        <div class="mlp-edit-field">
          <label class="mlp-edit-label">Cliente</label>
          <input class="mlp-edit-input" data-field="login_cliente" data-id="${id}" value="${esc(p.login_cliente || '')}">
        </div>
        <div class="mlp-edit-field">
          <label class="mlp-edit-label">Nº Venda</label>
          <input class="mlp-edit-input" data-field="numero_venda" data-id="${id}" value="${esc(p.numero_venda || '')}">
        </div>
        <div class="mlp-edit-field">
          <label class="mlp-edit-label">Modelo</label>
          <input class="mlp-edit-input" data-field="modelo" data-id="${id}" value="${esc(p.modelo || '')}">
        </div>
        ${aros.map((a, ai) => `
        <div class="mlp-edit-field">
          <label class="mlp-edit-label">${esc(a.label)}</label>
          <input class="mlp-edit-input" data-field="aro" data-aro-index="${ai}" data-aro-label="${esc(a.label)}" data-id="${id}" value="${esc(a.value || '')}">
        </div>`).join('')}
        <div class="mlp-edit-field">
          <label class="mlp-edit-label">Observações</label>
          <textarea class="mlp-edit-textarea" data-field="observacoes" data-id="${id}">${esc(p.observacoes || '')}</textarea>
        </div>
        <div class="mlp-edit-field">
          <label class="mlp-edit-label">URL</label>
          <input class="mlp-edit-input" data-field="url" data-id="${id}" value="${esc(p.url || '')}">
        </div>
      </div>
    </div>`;
  }).join('');

  updateCount();

  // Selection toggle — click on header area (not edit/delete buttons)
  list.querySelectorAll('.mlp-modal-item-header').forEach(header => {
    header.addEventListener('click', e => {
      if (e.target.closest('.mlp-modal-edit-btn, .mlp-modal-del-btn')) return;
      const item = header.closest('.mlp-modal-item');
      const id   = item.dataset.id;
      if (selectedIds.has(id)) {
        selectedIds.delete(id);
        item.classList.remove('mlp-selected');
        header.querySelector('.mlp-modal-checkbox').innerHTML = '';
      } else {
        selectedIds.add(id);
        item.classList.add('mlp-selected');
        header.querySelector('.mlp-modal-checkbox').innerHTML = icon('check', 12);
      }
      updateCount();
    });
  });

  // Delete button
  list.querySelectorAll('.mlp-modal-del-btn').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      if (!confirm('Excluir esta pendência?')) return;
      const id = btn.dataset.id;
      try {
        await deletePendencia(id);
        pendencias = pendencias.filter(p => String(p.id) !== id);
        selectedIds.delete(id);
        btn.closest('.mlp-modal-item')?.remove();
        updateCount();
        renderCards();
        toast('Pendência excluída.');
      } catch (ex) { toast(ex.message, 'error'); }
    });
  });

  // Edit button toggles the form
  list.querySelectorAll('.mlp-modal-edit-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const form = btn.closest('.mlp-modal-item').querySelector('.mlp-modal-edit-form');
      form.classList.toggle('mlp-hidden');
    });
  });

  // Inputs/textareas update localEdits; stop propagation to avoid selection toggle
  list.querySelectorAll('.mlp-edit-input, .mlp-edit-textarea').forEach(input => {
    input.addEventListener('click', e => e.stopPropagation());
    input.addEventListener('input', () => {
      const id    = input.dataset.id;
      const field = input.dataset.field;
      if (!localEdits.has(id)) localEdits.set(id, {});
      const edits = localEdits.get(id);
      if (field === 'aro') {
        const form     = input.closest('.mlp-modal-edit-form');
        const aroInputs = form.querySelectorAll('.mlp-edit-input[data-field="aro"]');
        edits.aro = JSON.stringify(Array.from(aroInputs).map(inp => ({
          label: inp.dataset.aroLabel,
          value: inp.value,
        })));
      } else {
        edits[field] = input.value;
      }
    });
  });

  const copyBtn = document.getElementById('mlp-copiar-dados');
  if (copyBtn) copyBtn.onclick = () => onCopiarConsolidado(selectedIds, localEdits);
}

function onCopiarConsolidado(selectedIds, localEdits) {
  const selected = pendencias.filter(p => selectedIds.has(String(p.id)));
  if (selected.length === 0) { toast('Nenhum item selecionado.', 'warning'); return; }

  const date   = formatDate();
  const merged = selected.map(p => ({ ...p, ...(localEdits?.get(String(p.id)) || {}) }));

  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
    <h2 style="color:#222;border-bottom:3px solid #FFE600;padding-bottom:8px;">
      Consolidado de Pendências — ${date}
    </h2>
    <p style="color:#666;margin-bottom:16px;">Total: <strong>${merged.length}</strong> pendência(s)</p>
    ${merged.map((p, i) =>
      `${i > 0 ? '<hr style="border:none;border-top:1px solid #eee;margin:12px 0;" />' : ''}${cardToHtml(p)}`
    ).join('')}
  </div>`;

  const afterCopy = () => {
    merged.forEach(p => consolidadoCopiadoIds.add(String(p.id)));
    saveCardStatus();
    document.getElementById('mlp-consolidado-overlay')?.classList.add('mlp-hidden');
    renderCards();
    toast(`${merged.length} pendência(s) copiadas!`);
  };

  (async () => {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'text/html': new Blob([html], { type: 'text/html' }) }),
      ]);
      afterCopy();
    } catch {
      // Fallback: plain text
      const plain = `CONSOLIDADO DE PENDÊNCIAS — ${date}\nTotal: ${merged.length} pendência(s)\n\n` +
        merged.map((p, i) => [
          `${i + 1}. ${p.login_cliente || '(sem login)'}${p.numero_venda ? ` | #${p.numero_venda}` : ''}`,
          p.modelo      ? `   Modelo: ${p.modelo}` : null,
          ...parseAros(p.aro).filter(a => a.value).map(a => `   ${a.label}: ${a.value}`),
          p.observacoes ? `   Obs: ${p.observacoes}` : null,
          p.url         ? `   URL: ${p.url}` : null,
        ].filter(Boolean).join('\n')).join('\n\n');
      const ta = document.createElement('textarea');
      ta.value = plain;
      ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      afterCopy();
    }
  })();
}

async function onLimparHistorico() {
  if (pendencias.length === 0) { toast('Histórico já está vazio.', 'info'); return; }
  if (!confirm(`Excluir ${pendencias.length} pendência(s) do histórico? Esta ação não pode ser desfeita.`)) return;
  const btn = document.getElementById('mlp-limpar-hist');
  if (btn) btn.disabled = true;
  try {
    await sbFetch(`/rest/v1/pendencias?user_id=eq.${auth.user.id}`, { method: 'DELETE' });
    pendencias = [];
    fefrelloSentIds.clear();
    emailSentIds.clear();
    consolidadoCopiadoIds.clear();
    await saveCardStatus();
    renderHistory();
    renderCards();
    toast('Histórico limpo com sucesso!');
  } catch (e) {
    toast(e.message || 'Erro ao limpar histórico.', 'error');
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function onLimparHistoricoArquivados() {
  const historico = pendencias.filter(p => archivedIds.has(String(p.id)));
  if (historico.length === 0) { toast('Histórico já está vazio.', 'info'); return; }
  if (!confirm(`Excluir ${historico.length} pendência(s) do histórico? Esta ação não pode ser desfeita.`)) return;
  const btn = document.getElementById('mlp-limpar-hist');
  if (btn) btn.disabled = true;
  try {
    for (const p of historico) {
      const id = String(p.id);
      await deletePendencia(id);
      archivedIds.delete(id);
      fefrelloSentIds.delete(id);
      emailSentIds.delete(id);
      consolidadoCopiadoIds.delete(id);
    }
    pendencias = pendencias.filter(p => !historico.some(h => String(h.id) === String(p.id)));
    await saveCardStatus();
    renderHistory();
    renderCards();
    toast('Histórico limpo com sucesso!');
  } catch (e) {
    toast(e.message || 'Erro ao limpar histórico.', 'error');
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function onLogout() {
  try { await signOut(); } catch {}
  chrome.runtime.sendMessage({ type: 'REVOKE_GMAIL_TOKEN' });
  await clearSession();
  auth       = { user: null, token: null, refreshToken: null };
  pendencias = [];
  isPinned   = false;
  document.getElementById('mlp-panel')?.classList.remove('mlp-open');
  document.getElementById('mlp-tab')?.classList.remove('mlp-tab-hidden');
  showLogin();
}

// ============================================================
//  TOAST
// ============================================================
function toast(msg, type = 'success') {
  const root = document.getElementById('mlp-root');
  if (!root) return;
  let el = document.getElementById('mlp-toast');
  if (el) el.remove();
  el = document.createElement('div');
  el.id = 'mlp-toast';
  el.className = `mlp-toast-${type}`;
  el.textContent = msg;
  root.appendChild(el);
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('mlp-toast-visible')));
  setTimeout(() => {
    el.classList.remove('mlp-toast-visible');
    setTimeout(() => el.remove(), 300);
  }, 3200);
}

// ============================================================
//  INIT
// ============================================================
function injectFonts() {
  if (document.getElementById('mlp-fonts')) return;
  const link = document.createElement('link');
  link.id   = 'mlp-fonts';
  link.rel  = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
  document.head.appendChild(link);
}

async function init() {
  injectFonts();
  injectSidebar();
  setupHover();
  capturedData = getStoredCapturedData();
  captureAndCachePageData();
  watchUrlChanges();
  setupStatusSync();
  window.addEventListener('resize', fixMainViewHeight, { passive: true });
  window.visualViewport?.addEventListener('resize', fixMainViewHeight, { passive: true });
  const session = await getSession();
  if (session?.access_token) {
    auth.token        = session.access_token;
    auth.refreshToken = session.refresh_token;
    auth.user         = session.user;
    try {
      await loadPendencias();
      await loadCardStatus();
      showMain();
    } catch (e) {
      await clearSession();
      auth = { user: null, token: null, refreshToken: null };
      showLogin();
    }
  } else {
    showLogin();
  }
}

init();
