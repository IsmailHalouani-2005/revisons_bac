
// ===== NAVBAR HORIZONTAL SCROLL ON VERTICAL WHEEL =====
document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelector('.nav-links');
  if (navLinks) {
    navLinks.addEventListener('wheel', (e) => {
      e.preventDefault();
      navLinks.scrollLeft += e.deltaY;
    }, { passive: false });
  }
});


// ===== FILTER & SORT =====
let activeFilters = { matiere: 'all', hot: false };
let searchQuery = '';

function setFilter(type, value, btn) {
  if (type === 'matiere') {
    activeFilters.matiere = value;
    document.querySelectorAll('.filter-btn.f-all, .filter-btn.f-phys, .filter-btn.f-chem')
      .forEach(b => b.classList.remove('active'));
  } else if (type === 'hot') {
    activeFilters.hot = !activeFilters.hot;
  }
  btn.classList.toggle('active', type === 'matiere' ? true : activeFilters.hot);
  if (type === 'matiere') btn.classList.add('active');
  applyFilters();
}

function setSearch(val) {
  searchQuery = val.toLowerCase().trim();
  applyFilters();
}

function setSort(val) {
  const grid1 = document.getElementById('grid-phys');
  const grid2 = document.getElementById('grid-chem');
  [grid1, grid2].forEach(grid => {
    if (!grid) return;
    const cards = [...grid.querySelectorAll('.chapter-card')];
    cards.sort((a, b) => {
      if (val === 'hot') {
        const aHot = a.querySelector('.tag.hot') ? 0 : 1;
        const bHot = b.querySelector('.tag.hot') ? 0 : 1;
        return aHot - bHot;
      }
      if (val === 'alpha') {
        return a.querySelector('.card-title').textContent.localeCompare(
          b.querySelector('.card-title').textContent, 'fr');
      }
      return 0; // default order
    });
    cards.forEach(c => grid.appendChild(c));
  });
}

function applyFilters() {
  const cards = document.querySelectorAll('.chapter-card');
  let visible = 0;
  cards.forEach(card => {
    const isPhys = card.classList.contains('phys');
    const isChem = card.classList.contains('chem');
    const isHot = !!card.querySelector('.tag.hot');
    const title = card.querySelector('.card-title').textContent.toLowerCase();
    const desc = card.querySelector('.card-desc').textContent.toLowerCase();

    let show = true;
    if (activeFilters.matiere === 'phys' && !isPhys) show = false;
    if (activeFilters.matiere === 'chem' && !isChem) show = false;
    if (activeFilters.hot && !isHot) show = false;
    if (searchQuery && !title.includes(searchQuery) && !desc.includes(searchQuery)) show = false;

    card.classList.toggle('hidden', !show);
    if (show) visible++;
  });

  // Show/hide section headers
  const physCards = [...document.querySelectorAll('.chapter-card.phys')].filter(c => !c.classList.contains('hidden'));
  const chemCards = [...document.querySelectorAll('.chapter-card.chem')].filter(c => !c.classList.contains('hidden'));
  const physHeader = document.getElementById('section-phys');
  const chemHeader = document.getElementById('section-chem');
  if (physHeader) physHeader.style.display = physCards.length ? '' : 'none';
  if (chemHeader) chemHeader.style.display = chemCards.length ? '' : 'none';

  const counter = document.getElementById('filter-count');
  if (counter) counter.textContent = visible + ' chapitre' + (visible > 1 ? 's' : '');
}

// ===== TABS =====
function switchTab(chapterId, tabName) {
  const page = document.getElementById('ch-' + chapterId);
  if (!page) return;
  page.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tabName));
  page.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === tabName));
  // Re-render KaTeX on the newly visible panel
  renderAllKatex(page.querySelector(`.tab-panel[data-panel="${tabName}"]`));
}

function renderAllKatex(container) {
  if (!container || typeof renderMathInElement === 'undefined') return;
  renderMathInElement(container, {
    delimiters: [
      {left: '$$', right: '$$', display: true},
      {left: '$', right: '$', display: false}
    ],
    ignoredTags: ['script','noscript','style','textarea','pre','code'],
    throwOnError: false,
    strict: false
  });
}

// ===== THEME TOGGLE =====
function toggleTheme() {
  const html = document.documentElement;
  const btn = document.getElementById('themeBtn');
  const isLight = html.getAttribute('data-theme') === 'light';
  
  if (isLight) {
    html.removeAttribute('data-theme');
    btn.textContent = '🌙';
    localStorage.setItem('bac_theme', 'dark');
  } else {
    html.setAttribute('data-theme', 'light');
    btn.textContent = '☀️';
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

// ===== NAVIGATION =====
const pages = {
  home: document.getElementById('home'),
};

let completed = JSON.parse(localStorage.getItem('bac_completed') || '[]');

function showHome() {
  document.querySelectorAll('.chapter-page').forEach(p => p.classList.remove('active'));
  document.getElementById('home').style.display = 'block';
  document.querySelector('.progress-bar-wrap').style.display = 'none';
  document.getElementById('filterBar').style.display = 'flex';
  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  // reset active nav pill
  document.querySelectorAll('.nav-pill').forEach(p => p.classList.remove('active-phys','active-chem'));
}

function showChapter(id, type) {
  document.getElementById('home').style.display = 'none';
  document.querySelectorAll('.chapter-page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('ch-' + id);
  if (page) {
    page.classList.add('active');
    document.querySelector('.progress-bar-wrap').style.display = 'block';
  document.getElementById('filterBar').style.display = 'none';
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
  // active nav pill
  document.querySelectorAll('.nav-pill').forEach(p => p.classList.remove('active-phys','active-chem'));
  const pill = document.querySelector(`.nav-pill[data-id="${id}"]`);
  if (pill) pill.classList.add(type === 'phys' ? 'active-phys' : 'active-chem');
}

// ===== SOLUTION TOGGLE =====
function toggleSolution(btn) {
  const box = btn.nextElementSibling;
  if (box.classList.contains('show')) {
    box.classList.remove('show');
    btn.textContent = '💡 Voir la correction';
  } else {
    box.classList.add('show');
    btn.textContent = '🙈 Masquer la correction';
  }
}

// ===== MARK COMPLETE =====
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
  updateProgress();
  updateCards();
}

function updateCards() {
  document.querySelectorAll('.chapter-card').forEach(card => {
    const id = card.dataset.id;
    if (completed.includes(id)) {
      card.classList.add('done-card');
    } else {
      card.classList.remove('done-card');
    }
  });
}

function updateProgress() {
  const total = document.querySelectorAll('.chapter-card').length;
  const pct = total ? Math.round((completed.length / total) * 100) : 0;
  document.querySelectorAll('.progress-fill').forEach(el => el.style.width = pct + '%');
  const heroStat = document.querySelector('.stat-progress');
  if (heroStat) heroStat.textContent = pct + '%';
}

// ===== MINI CONFETTI =====
function confettiPop(el) {
  const colors = ['#4f8ef7','#a259f7','#f7c948','#3ecf8e','#f76f6f'];
  const rect = el.getBoundingClientRect();
  for (let i = 0; i < 20; i++) {
    const dot = document.createElement('div');
    dot.style.cssText = `
      position:fixed; pointer-events:none; z-index:9999;
      width:7px; height:7px; border-radius:50%;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      left:${rect.left + rect.width/2}px; top:${rect.top}px;
    `;
    document.body.appendChild(dot);
    const angle = (Math.random() * 360) * Math.PI / 180;
    const dist = 60 + Math.random() * 80;
    const duration = 600 + Math.random() * 400;
    dot.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${Math.cos(angle)*dist}px, ${Math.sin(angle)*dist - 60}px) scale(0)`, opacity: 0 }
    ], { duration, easing: 'cubic-bezier(.25,.46,.45,.94)' }).onfinish = () => dot.remove();
  }
}

// ===== SCROLL PROGRESS =====
window.addEventListener('scroll', () => {
  const fill = document.querySelector('.progress-bar-fill');
  if (fill) {
    const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    fill.style.width = pct + '%';
  }
});

// ===== DONE CARD STYLE =====
const style = document.createElement('style');
style.textContent = `
  .chapter-card.done-card::after {
    content:'✅';
    position:absolute; top:.8rem; right:.8rem;
    font-size:1rem;
  }
  .chapter-card.done-card { opacity: .7; }
`;
document.head.appendChild(style);

// ===== INIT =====
window.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  document.getElementById('filterBar').style.display = 'flex';
  // Render KaTeX on ALL panels including hidden ones
  setTimeout(() => {
    if (typeof renderMathInElement !== 'undefined') {
      renderMathInElement(document.body, {
        delimiters: [
          {left: '$$', right: '$$', display: true},
          {left: '$', right: '$', display: false}
        ],
        ignoredTags: ['script','noscript','style','textarea','pre','code'],
        throwOnError: false,
        strict: false
      });
    }
  }, 100);
  updateProgress();
  updateCards();
  // restore check buttons
  document.querySelectorAll('.check-btn').forEach(btn => {
    const id = btn.dataset.chapter;
    if (completed.includes(id)) {
      btn.classList.add('done');
      btn.innerHTML = '✅ Appris !';
    }
  });
});
