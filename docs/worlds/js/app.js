/* 藍星十帖・3D 世界 — 介面與互動 */
import { WorldEngine } from './engine.js';
import { WORLDS } from './worlds.js';

const STORAGE_KEY = 'lansing-worlds-v1';

/* 每帖走完後浮現的一句「帖語」 */
const SEALS = {
  s01: '有些聲音不必敲響，摸一下就知道它還在。',
  s02: '重量不是拿來扛的，是拿來量你今天願意再多一點。',
  s03: '紙會爛，字會暈；有人在暈開之前把它們接住。',
  s04: '穩定不是不變，是每天同一個時間回來。',
  s05: '有些提醒來得太早，正好足夠讓人把該收的東西收好。',
  s06: '歪掉的樹也結果。',
  s07: '二手的不是舊，是有人用過、還願意交到你手上。',
  s08: '一百零八個名字，最後只留一個能承接的人。',
  s09: '茶涼了要重溫。',
  s10: '傳的不是機器，是願意再接一次電的人。',
};

const $ = (id) => document.getElementById(id);

const state = {
  idx: 0,
  progress: {},
  cardIndex: -1,
  doneShownFor: null,
};

/* ---------- 進度 ---------- */

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    for (const w of WORLDS) {
      const arr = Array.isArray(data[w.id]) ? data[w.id] : [];
      state.progress[w.id] = [...new Set(arr.filter((i) => Number.isInteger(i) && i >= 0 && i < w.nodes.length))];
    }
  } catch {
    for (const w of WORLDS) state.progress[w.id] = [];
  }
}

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
  } catch {
    /* 無痕模式／空間不足時靜默失敗，不影響遊玩 */
  }
}

const gotOf = (id) => state.progress[id]?.length ?? 0;
const totalOf = (id) => WORLDS.find((w) => w.id === id)?.nodes.length ?? 0;
const isComplete = (id) => gotOf(id) >= totalOf(id);

/* ---------- 引擎 ---------- */

let engine = null;
try {
  engine = new WorldEngine({
    canvas: $('scene'),
    onNode: (i) => openCard(i),
    onWorldReady: () => refreshHud(),
  });
  engine.start();
} catch (err) {
  console.error(err);
  $('fatal').classList.add('open');
}

/* ---------- 帖列 ---------- */

function buildRail() {
  const ol = $('worldList');
  ol.innerHTML = '';
  WORLDS.forEach((w, i) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.className = 'w';
    btn.type = 'button';
    btn.dataset.idx = String(i);
    const no = document.createElement('span');
    no.className = 'no';
    no.textContent = w.no;
    const tt = document.createElement('span');
    tt.className = 'tt';
    tt.textContent = w.title;
    const dots = document.createElement('span');
    dots.className = 'dots';
    w.nodes.forEach(() => dots.appendChild(document.createElement('i')));
    btn.append(no, tt, dots);
    btn.addEventListener('click', () => loadWorld(i));
    li.appendChild(btn);
    ol.appendChild(li);
  });
  refreshRail();
}

function refreshRail() {
  const total = WORLDS.reduce((s, w) => s + w.nodes.length, 0);
  const got = WORLDS.reduce((s, w) => s + gotOf(w.id), 0);
  document.querySelectorAll('#worldList button.w').forEach((btn) => {
    const i = Number(btn.dataset.idx);
    const w = WORLDS[i];
    btn.setAttribute('aria-current', i === state.idx ? 'true' : 'false');
    btn.querySelectorAll('.dots i').forEach((dot, di) => {
      dot.classList.toggle('on', state.progress[w.id].includes(di));
    });
  });
  const foot = document.querySelector('#rail .foot');
  if (foot) {
    foot.textContent = '';
    const back = document.createElement('a');
    back.href = '../index.html';
    back.textContent = '← 回閱讀';
    foot.append(back, document.createTextNode(`　・　${got} / ${total} 段記憶`));
    const ver = document.createElement('span');
    ver.className = 'ver';
    ver.textContent = 'v20261019.3';
    foot.append(ver);
  }
}

/* ---------- HUD ---------- */

function refreshHud() {
  const w = WORLDS[state.idx];
  const got = gotOf(w.id);
  document.documentElement.style.setProperty('--accent', w.accent);
  $('hudNo').textContent = w.no;
  $('hudTitle').textContent = w.title;
  $('hudPlace').textContent = w.place;
  $('hudCount').textContent = `${got} / ${w.nodes.length}`;
  $('hudDots').innerHTML = w.nodes
    .map((_, i) => `<i class="${state.progress[w.id].includes(i) ? 'on' : ''}"></i>`)
    .join('');
  document.title = `${w.no}・${w.title}｜藍星十帖 3D 世界`;
}

/* ---------- 載入世界 ---------- */

function loadWorld(i, { fromHash = false } = {}) {
  const w = WORLDS[i];
  if (!w || !engine) return;
  state.idx = i;
  closeCard();
  $('done').classList.remove('open');

  engine.setWorld(w, new Set(state.progress[w.id]));

  if (!fromHash) {
    history.replaceState(null, '', `#${w.id}`);
  }
  refreshRail();
  refreshHud();
  $('tip').style.opacity = '1';
  clearTimeout(loadWorld._tip);
  loadWorld._tip = setTimeout(() => { $('tip').style.opacity = '0'; }, 5200);
}

/* ---------- 記憶卡 ---------- */

function openCard(index) {
  const w = WORLDS[state.idx];
  const node = w.nodes[index];
  if (!node) return;

  const wasNew = !state.progress[w.id].includes(index);
  if (wasNew) {
    state.progress[w.id].push(index);
    saveProgress();
    engine.markCollected(index);
  }

  state.cardIndex = index;
  $('cardEyebrow').textContent = `記憶 ${index + 1} / ${w.nodes.length}${wasNew ? '・新點亮' : '・已讀'}`;
  $('cardTitle').textContent = node.title;
  $('cardQuote').textContent = node.quote;
  $('cardNote').textContent = node.note;
  $('cardStory').href = `../${w.id}.html`;
  $('cardNext').textContent = nextUncollected(index) >= 0 ? '下一段記憶' : '看看這一帖';
  $('card').classList.add('open');

  refreshRail();
  refreshHud();

  if (isComplete(w.id) && wasNew) {
    setTimeout(() => showDone(), 900);
  }
}

function nextUncollected(after) {
  const w = WORLDS[state.idx];
  const got = state.progress[w.id];
  const n = w.nodes.length;
  for (let k = 1; k <= n; k++) {
    const i = (after + k) % n;
    if (!got.includes(i)) return i;
  }
  return -1;
}

function closeCard() {
  state.cardIndex = -1;
  $('card').classList.remove('open');
}

/* ---------- 圓滿 ---------- */

function showDone() {
  const w = WORLDS[state.idx];
  const allDone = WORLDS.every((x) => isComplete(x.id));
  $('doneSeal').textContent = allDone ? '缽' : '帖';
  $('doneKicker').textContent = allDone ? '十帖圓滿' : '此帖圓滿';
  $('doneTitle').textContent = allDone ? '傳缽' : w.title;
  $('doneText').textContent = allDone
    ? '十個場景、四十段記憶都亮過了。藍鵝還在等下一雙手——故事沒有結束，只是換人接著跑。'
    : (SEALS[w.id] || '');
  $('doneStory').href = `../${w.id}.html`;
  $('doneStory').textContent = '讀原文';
  $('doneNext').textContent = allDone ? '從頭再看' : '下一帖';
  $('doneNext').dataset.act = allDone ? 'restart' : 'next';
  $('done').classList.add('open');
  state.doneShownFor = w.id;
}

function closeDone() {
  $('done').classList.remove('open');
}

/* ---------- 事件 ---------- */

$('cardClose').addEventListener('click', closeCard);
$('cardNext').addEventListener('click', () => {
  const w = WORLDS[state.idx];
  if (isComplete(w.id)) {
    showDone();
    return;
  }
  const nxt = nextUncollected(state.cardIndex >= 0 ? state.cardIndex : -1);
  if (nxt >= 0) {
    closeCard();
    const target = engine.nodes[nxt];
    if (target) {
      engine.orbit.target.lerp(target.group.position, 0.55);
      engine.orbit.radius = Math.min(engine.orbit.radius, 9.5);
      engine.orbit.idle = 0;
    }
    setTimeout(() => openCard(nxt), 260);
  } else {
    showDone();
  }
});

$('hintBtn').addEventListener('click', () => {
  if (!engine) return;
  const r = engine.hint();
  if (r.done) {
    showDone();
    return;
  }
  const tip = $('tip');
  tip.style.opacity = '1';
  tip.textContent = `最近的記憶：${r.title}（距離 ${r.distance.toFixed(1)}）`;
  clearTimeout(loadWorld._tip);
  loadWorld._tip = setTimeout(() => { tip.style.opacity = '0'; }, 3600);
});

$('resetBtn').addEventListener('click', () => engine?.resetCamera());

$('autoBtn').addEventListener('click', () => {
  if (!engine) return;
  const on = !engine.orbit.auto;
  engine.setAutoRotate(on);
  $('autoBtn').textContent = `自動環繞：${on ? '開' : '關'}`;
});

$('doneClose').addEventListener('click', closeDone);
$('doneNext').addEventListener('click', (e) => {
  const act = e.currentTarget.dataset.act;
  closeDone();
  if (act === 'restart') loadWorld(0);
  else loadWorld((state.idx + 1) % WORLDS.length);
});

document.addEventListener('keydown', (e) => {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
  switch (e.key) {
    case 'ArrowRight':
      loadWorld((state.idx + 1) % WORLDS.length);
      e.preventDefault();
      break;
    case 'ArrowLeft':
      loadWorld((state.idx + WORLDS.length - 1) % WORLDS.length);
      e.preventDefault();
      break;
    case 'r':
    case 'R':
      engine?.resetCamera();
      break;
    case 'h':
    case 'H':
      $('hintBtn').click();
      break;
    case 'Escape':
      closeCard();
      closeDone();
      break;
    case ' ':
      $('autoBtn').click();
      e.preventDefault();
      break;
    default:
      break;
  }
});

window.addEventListener('hashchange', () => {
  const id = location.hash.replace('#', '');
  const i = WORLDS.findIndex((w) => w.id === id);
  if (i >= 0 && i !== state.idx) loadWorld(i, { fromHash: true });
});

/* ---------- 啟動 ---------- */

// 方便在瀏覽器主控台檢查場景（除錯用，不影響遊玩）
window.__worlds = { get engine() { return engine; }, state, WORLDS, SEALS };

loadProgress();
buildRail();

const startId = location.hash.replace('#', '');
const startIdx = Math.max(0, WORLDS.findIndex((w) => w.id === startId));
loadWorld(startIdx, { fromHash: Boolean(startId) });

/* 第一次來的人，先看到提示；尊重減少動態偏好 */
if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
  engine?.setAutoRotate(false);
  const b = $('autoBtn');
  if (b) b.textContent = '自動環繞：關';
}
