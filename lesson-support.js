const lessonNavMap = {
  '/123/123.html': { home: '../index.html' },
  '/123/pickthenum.html': { home: '../index.html' },
  '/123/ran1-10.html': { home: '../index.html' },
  '/123/randnum.html': { home: '../index.html' },
  '/abc/abc.html': { home: '../index.html' },
  '/abc/abcpic.html': { home: '../index.html' },
  '/abc/picktheletter.html': { home: '../index.html' },
  '/abc/pickthepic.html': { home: '../index.html' },
  '/abc/ranABC.html': { home: '../index.html' },
  '/abc/pickaword.html': { home: '../index.html' },
  '/abc/Spellingword.html': { home: '../index.html' },
  '/abc/filltheletter.html': { home: '../index.html' },
  '/abc/kiddictionary.html': { home: '../index.html' },
  '/abc/dictionary.html': { home: '../index.html' },
  '/abc/calendar.html': { home: '../index.html' },
  '/arithmetic/Arithmetic.html': { prev: '../index.html', next: 'math.html' },
  '/arithmetic/math.html': { prev: 'Arithmetic.html', next: 'howmanyapple.html' },
  '/arithmetic/howmanyapple.html': { prev: 'math.html' },
  '/civics/civic.html': { prev: '../index.html', next: 'CivicsGame.html' },
  '/civics/CivicsGame.html': { prev: 'civic.html', next: 'Civicsques.html' },
  '/civics/Civicsques.html': { prev: 'CivicsGame.html' },
  '/books/lego.html': { prev: '../index.html' },
  '/color/colors.html': { home: '../index.html' },
  '/emotions/emotions.html': { home: '../index.html' },
  '/games/catchme.html': { prev: '../index.html', next: 'tictactoe.html' },
  '/games/tictactoe.html': { prev: 'catchme.html', next: 'rps.html' },
  '/games/rps.html': { prev: 'tictactoe.html', next: 'shapes.html' },
  '/games/shapes.html': { prev: 'rps.html', next: 'whatshape.html' },
  '/games/whatshape.html': { prev: 'shapes.html' },
  '/puzzles/puzzles.html': { prev: '../index.html', next: 'gamification.html' },
  '/puzzles/gamification.html': { prev: 'puzzles.html' },
  '/science/bio.html': { home: '../index.html' },
  '/science/chem.html': { prev: 'bio.html', next: 'compute.html' },
  '/science/compute.html': { prev: 'chem.html' },
  '/shapes/shapes.html': { home: '../index.html' },
  '/shapes/whatshape.html': { home: '../index.html' },
  '/tv/tv.html': { prev: '../index.html', next: 'storytime.html' },
  '/tv/storytime.html': { prev: 'tv.html' },
  '/weather/weather.html': { home: '../index.html' },
};

function getPageKey() {
  const cleanPath = window.location.pathname.replace(/\\/g, '/');
  const segments = cleanPath.split('/').filter(Boolean);
  if (!segments.length) return null;
  const file = segments.pop();
  const folder = segments.pop() || '';
  return `/${folder}/${file}`;
}

function createNavButton(href, label, extraClass = '') {
  const button = document.createElement('a');
  button.href = href;
  button.className = `nav-button ${extraClass}`.trim();
  button.textContent = label;
  return button;
}

function addLessonNav() {
  if (document.querySelector('.page-nav') || document.querySelector('a.back-button')) return;
  const pageKey = getPageKey();
  if (!pageKey) return;
  const navConfig = lessonNavMap[pageKey];
  if (!navConfig) return;

  const nav = document.createElement('nav');
  nav.id = 'lesson-nav';
  nav.className = 'page-nav lesson-nav';
  if (navConfig.prev) {
    nav.appendChild(createNavButton(navConfig.prev, '← Previous', 'prev-btn'));
  }
  nav.appendChild(createNavButton(navConfig.home || '../index.html', '🏠 Home', 'home-btn'));
  if (navConfig.next) {
    nav.appendChild(createNavButton(navConfig.next, 'Next →', 'next-btn'));
  }

  const body = document.body;
  if (body.firstChild) {
    body.insertBefore(nav, body.firstChild);
  } else {
    body.appendChild(nav);
  }
}

function speakText(text) {
  if (!window.speechSynthesis || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1.05;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
}

function gatherLessonText() {
  const title = document.querySelector('h1, h2, h3');
  const paragraphs = Array.from(document.querySelectorAll('p'))
    .map((p) => p.textContent.trim())
    .filter(Boolean);
  if (title) {
    paragraphs.unshift(title.textContent.trim());
  }
  return paragraphs.join(' ');
}

function addSpeakButton() {
  if (!window.speechSynthesis) return;
  const existing = document.getElementById('lesson-speak-button');
  if (existing) return;

  const button = document.createElement('button');
  button.id = 'lesson-speak-button';
  button.className = 'lesson-speak-button';
  button.type = 'button';
  button.textContent = '🔊 Hear the lesson';
  button.addEventListener('click', () => {
    const text = gatherLessonText() || document.title;
    speakText(text);
  });

  const nav = document.getElementById('lesson-nav');
  if (nav && nav.parentNode) {
    nav.parentNode.insertBefore(button, nav.nextSibling);
  } else {
    document.body.insertBefore(button, document.body.firstChild);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  addLessonNav();
  addSpeakButton();
  // If a page has a question trigger element, auto-start it for learners
  try {
    const q = document.getElementById('question') || document.querySelector('[data-question-start]');
    if (q) setTimeout(() => { try { q.click(); } catch(e){} }, 600);
  } catch(e) {}

  // Ensure back-button anchors have accessible labels
  try {
    document.querySelectorAll('a.back-button').forEach(a => {
      if (!a.getAttribute('aria-label')) a.setAttribute('aria-label','Back to Home');
    });
  } catch(e) {}
});
