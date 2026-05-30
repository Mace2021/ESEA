const lessonNavMap = {
  '/123/123.html': { prev: '../index.html', next: 'pickthenum.html' },
  '/123/pickthenum.html': { prev: '123.html', next: 'ran1-10.html' },
  '/123/ran1-10.html': { prev: 'pickthenum.html', next: 'randnum.html' },
  '/123/randnum.html': { prev: 'ran1-10.html' },
  '/abc/abc.html': { prev: '../index.html', next: 'alphabet-sounds.html' },
  '/abc/alphabet-sounds.html': { prev: 'abc.html', next: 'abcpic.html' },
  '/abc/abcpic.html': { prev: 'alphabet-sounds.html', next: 'pronunciation-symbols.html' },
  '/abc/pronunciation-symbols.html': { prev: 'abcpic.html', next: 'picktheletter.html' },
  '/abc/picktheletter.html': { prev: 'pronunciation-symbols.html', next: 'pickthepic.html' },
  '/abc/pickthepic.html': { prev: 'picktheletter.html', next: 'ranABC.html' },
  '/abc/ranABC.html': { prev: 'pickthepic.html', next: 'pickaword.html' },
  '/abc/pickaword.html': { prev: 'ranABC.html', next: 'Spellingword.html' },
  '/abc/Spellingword.html': { prev: 'pickaword.html', next: 'filltheletter.html' },
  '/abc/filltheletter.html': { prev: 'Spellingword.html', next: 'kiddictionary.html' },
  '/abc/kiddictionary.html': { prev: 'filltheletter.html', next: 'dictionary.html' },
  '/abc/dictionary.html': { prev: 'kiddictionary.html', next: 'calendar.html' },
  '/abc/calendar.html': { prev: 'dictionary.html' },
  '/arithmetic/Arithmetic.html': { prev: '../index.html', next: 'math.html' },
  '/arithmetic/math.html': { prev: 'Arithmetic.html', next: 'howmanyapple.html' },
  '/arithmetic/howmanyapple.html': { prev: 'math.html' },
  '/civics/civic.html': { prev: '../index.html', next: 'CivicsGame.html' },
  '/civics/CivicsGame.html': { prev: 'civic.html', next: 'Civicsques.html' },
  '/civics/Civicsques.html': { prev: 'CivicsGame.html' },
  '/books/lego.html': { prev: '../index.html' },
  '/color/colors.html': { prev: '../index.html' },
  '/emotions/emotions.html': { prev: '../index.html' },
  '/games/catchme.html': { prev: '../index.html', next: 'tictactoe.html' },
  '/games/tictactoe.html': { prev: 'catchme.html', next: 'rps.html' },
  '/games/rps.html': { prev: 'tictactoe.html', next: 'shapes.html' },
  '/games/shapes.html': { prev: 'rps.html', next: 'whatshape.html' },
  '/games/whatshape.html': { prev: 'shapes.html' },
  '/puzzles/puzzles.html': { prev: '../index.html', next: 'gamification.html' },
  '/puzzles/gamification.html': { prev: 'puzzles.html' },
  '/science/bio.html': { prev: '../index.html', next: 'chem.html' },
  '/science/chem.html': { prev: 'bio.html', next: 'compute.html' },
  '/science/compute.html': { prev: 'chem.html' },
  '/shapes/shapes.html': { prev: '../index.html', next: 'whatshape.html' },
  '/shapes/whatshape.html': { prev: 'shapes.html' },
  '/tv/tv.html': { prev: '../index.html', next: 'animated-alphabet.html' },
  '/tv/animated-alphabet.html': { prev: 'tv.html', next: 'counting-rainbow.html' },
  '/tv/counting-rainbow.html': { prev: 'animated-alphabet.html', next: 'sound-parade.html' },
  '/tv/sound-parade.html': { prev: 'counting-rainbow.html' },
  '/weather/weather.html': { prev: '../index.html' },
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
  button.className = `nav-btn ${extraClass}`.trim();
  button.textContent = label;
  return button;
}

function addLessonNav() {
  const pageKey = getPageKey();
  if (!pageKey) return;
  const navConfig = lessonNavMap[pageKey];
  if (!navConfig) return;

  const nav = document.createElement('nav');
  nav.id = 'lesson-nav';
  nav.className = 'lesson-nav';
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
