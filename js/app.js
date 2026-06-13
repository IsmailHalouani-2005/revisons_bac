// ===== NAVBAR HORIZONTAL SCROLL =====
document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelector('.nav-links');
  if (navLinks) {
    navLinks.addEventListener('wheel', (e) => {
      e.preventDefault();
      navLinks.scrollLeft += e.deltaY;
    }, { passive: false });
  }
});

// ===== THEME TOGGLE =====
function toggleTheme() {
  const html = document.documentElement;
  const btn = document.getElementById('themeBtn');
  const isLight = html.getAttribute('data-theme') === 'light';
  if (isLight) {
    html.removeAttribute('data-theme');
    if (btn) btn.textContent = '🌙';
    localStorage.setItem('bac_theme', 'dark');
  } else {
    html.setAttribute('data-theme', 'light');
    if (btn) btn.textContent = '☀️';
    localStorage.setItem('bac_theme', 'light');
  }
}

function loadTheme() {
  const saved = localStorage.getItem('bac_theme');
  const btn = document.getElementById('themeBtn');
  if (saved === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    if (btn) btn.textContent = '☀️';
  }
}

// ===== PROGRESS (index only) =====
let completed = JSON.parse(localStorage.getItem('bac_completed') || '[]');

function updateProgress() {
  const total = document.querySelectorAll('.chapter-card').length;
  if (!total) return;
  const pct = Math.round((completed.length / total) * 100);
  const stat = document.querySelector('.stat-progress');
  if (stat) stat.textContent = pct + '%';
}

function updateCards() {
  document.querySelectorAll('.chapter-card').forEach(card => {
    card.classList.toggle('done-card', completed.includes(card.dataset.id));
  });
}

// ===== FILTER & SORT (index only) =====
let activeFilters = { matiere: 'all', hot: false };
let searchQuery = '';

function setFilter(type, value, btn) {
  if (type === 'matiere') {
    activeFilters.matiere = value;
    document.querySelectorAll('.filter-btn.f-all,.filter-btn.f-phys,.filter-btn.f-chem')
      .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  } else if (type === 'hot') {
    activeFilters.hot = !activeFilters.hot;
    btn.classList.toggle('active', activeFilters.hot);
  }
  applyFilters();
}

function setSearch(val) {
  searchQuery = val.toLowerCase().trim();
  applyFilters();
}

function setSort(val) {
  ['grid-phys','grid-chem'].forEach(id => {
    const grid = document.getElementById(id);
    if (!grid) return;
    const cards = [...grid.querySelectorAll('.chapter-card')];
    cards.sort((a, b) => {
      if (val === 'hot') return (a.querySelector('.tag.hot') ? 0 : 1) - (b.querySelector('.tag.hot') ? 0 : 1);
      if (val === 'alpha') return a.querySelector('.card-title').textContent.localeCompare(b.querySelector('.card-title').textContent, 'fr');
      return 0;
    });
    cards.forEach(c => grid.appendChild(c));
  });
}

function applyFilters() {
  let visible = 0;
  document.querySelectorAll('.chapter-card').forEach(card => {
    const isPhys = card.classList.contains('phys');
    const isChem = card.classList.contains('chem');
    const isHot = !!card.querySelector('.tag.hot');
    const text = (card.querySelector('.card-title').textContent + card.querySelector('.card-desc').textContent).toLowerCase();
    let show = true;
    if (activeFilters.matiere === 'phys' && !isPhys) show = false;
    if (activeFilters.matiere === 'chem' && !isChem) show = false;
    if (activeFilters.hot && !isHot) show = false;
    if (searchQuery && !text.includes(searchQuery)) show = false;
    card.classList.toggle('hidden', !show);
    if (show) visible++;
  });
  const physCards = [...document.querySelectorAll('.chapter-card.phys')].filter(c => !c.classList.contains('hidden'));
  const chemCards = [...document.querySelectorAll('.chapter-card.chem')].filter(c => !c.classList.contains('hidden'));
  const ph = document.getElementById('section-phys');
  const ch = document.getElementById('section-chem');
  if (ph) ph.style.display = physCards.length ? '' : 'none';
  if (ch) ch.style.display = chemCards.length ? '' : 'none';
  const counter = document.getElementById('filter-count');
  if (counter) counter.textContent = visible + ' chapitre' + (visible > 1 ? 's' : '');
}

// ===== TABS (chapter pages) =====
function switchTab(chapterId, tabName) {
  const page = document.getElementById('ch-' + chapterId);
  if (!page) return;
  page.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tabName));
  page.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === tabName));
  if (typeof renderMathInElement !== 'undefined') {
    const panel = page.querySelector(`.tab-panel[data-panel="${tabName}"]`);
    if (panel) renderMathInElement(panel, {
      delimiters: [{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],
      throwOnError: false, strict: false
    });
  }
}

// ===== COMPLETE (chapter pages) =====
function toggleComplete(btn, id) {
  if (completed.includes(id)) {
    completed = completed.filter(c => c !== id);
    btn.classList.remove('done');
    btn.innerHTML = '☐ Marquer comme appris';
  } else {
    completed.push(id);
    btn.classList.add('done');
    btn.innerHTML = '✅ Appris !';
    confettiPop(btn);
  }
  localStorage.setItem('bac_completed', JSON.stringify(completed));
}

function toggleSolution(btn) {
  const box = btn.nextElementSibling;
  const show = !box.classList.contains('show');
  box.classList.toggle('show', show);
  btn.textContent = show ? '🙈 Masquer la correction' : '💡 Voir la correction';
}

// ===== CONFETTI =====
function confettiPop(el) {
  const colors = ['#4f8ef7','#a259f7','#f7c948','#3ecf8e','#f76f6f'];
  const rect = el.getBoundingClientRect();
  for (let i = 0; i < 20; i++) {
    const dot = document.createElement('div');
    dot.style.cssText = `position:fixed;pointer-events:none;z-index:9999;width:7px;height:7px;border-radius:50%;background:${colors[Math.floor(Math.random()*5)]};left:${rect.left+rect.width/2}px;top:${rect.top}px`;
    document.body.appendChild(dot);
    const angle = Math.random()*Math.PI*2, dist = 60+Math.random()*80;
    dot.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${Math.cos(angle)*dist}px,${Math.sin(angle)*dist-60}px) scale(0)`,opacity:0}],{duration:600+Math.random()*400,easing:'ease-out'}).onfinish = () => dot.remove();
  }
}

// ===== DONE CARD STYLE =====
const _style = document.createElement('style');
_style.textContent = '.chapter-card.done-card::after{content:"✅";position:absolute;top:.8rem;right:.8rem;font-size:1rem}.chapter-card.done-card{opacity:.7}';
document.head.appendChild(_style);

// ===== INIT =====
window.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  const filterBar = document.getElementById('filterBar');
  if (filterBar) filterBar.style.display = 'flex';
  updateProgress();
  updateCards();
  document.querySelectorAll('.check-btn').forEach(btn => {
    const id = btn.dataset.chapter;
    if (completed.includes(id)) {
      btn.classList.add('done');
      btn.innerHTML = '✅ Appris !';
    }
  });
});
