// ===== NAVIGATION =====
const pages = {
  home: document.getElementById('home'),
};

let completed = JSON.parse(localStorage.getItem('bac_completed') || '[]');

function showHome() {
  document.querySelectorAll('.chapter-page').forEach(p => p.classList.remove('active'));
  document.getElementById('home').style.display = 'block';
  document.querySelector('.progress-bar-wrap').style.display = 'none';
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
