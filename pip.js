/* ==========================================
   ESEA - Pip, the friendly guide
   One character for the whole app: videos, Today's learning and every lesson.

   ESEAPip.character(el)  draws Pip in el and returns controls:
       talking(on), wave(ms), point(), jump(ms), rest(), feel(name)
       feel: 'happy' | 'sad' | 'angry' | 'scared' | 'surprised' | 'calm'
   Lesson buddy: on lesson pages a small Pip sits next to the question. Pip
   talks whenever the voice speaks (speech.js 'esea-speaking' events) and
   reacts to 'esea-lesson' events: start, correct, miss, reveal, done.
   A "Watch with Pip" button links each lesson to its Pip video lesson.
   ========================================== */
(function(global) {
  var doc = global.document;
  var ROOT = (function() {
    try { return new URL('.', doc.currentScript.src).href; } catch (e) { return '../'; }
  })();

  var SVG = [
    '<svg viewBox="0 0 200 270" class="pip-svg" aria-hidden="true">',
    '<ellipse cx="100" cy="262" rx="58" ry="7" fill="rgba(0,0,0,0.12)"/>',
    '<g class="pip-body">',
    '<rect x="72" y="196" width="22" height="52" rx="10" fill="#3d5a99"/>',
    '<rect x="106" y="196" width="22" height="52" rx="10" fill="#3d5a99"/>',
    '<ellipse cx="80" cy="250" rx="17" ry="9" fill="#ff7a59"/>',
    '<ellipse cx="120" cy="250" rx="17" ry="9" fill="#ff7a59"/>',
    '<g class="pip-arm pip-arm-left"><rect x="40" y="142" width="20" height="62" rx="10" fill="#ffc94d"/><circle cx="50" cy="206" r="12" fill="#e0a77e"/></g>',
    '<g class="pip-arm pip-arm-right"><rect x="140" y="142" width="20" height="62" rx="10" fill="#ffc94d"/><circle cx="150" cy="206" r="12" fill="#e0a77e"/></g>',
    '<rect x="56" y="132" width="88" height="78" rx="28" fill="#ffc94d"/>',
    '<path d="M100 152 l6 12 13 2 -9.5 9 2.3 13 -11.8-6.2 -11.8 6.2 2.3-13 -9.5-9 13-2z" fill="#ff7a59"/>',
    '<circle cx="100" cy="82" r="58" fill="#e0a77e"/>',
    '<circle cx="44" cy="88" r="10" fill="#e0a77e"/><circle cx="156" cy="88" r="10" fill="#e0a77e"/>',
    '<path d="M44 76 C44 30 82 18 104 22 C134 26 160 44 156 78 C146 60 126 50 104 52 C84 54 62 60 44 76 Z" fill="#4a2c1d"/>',
    '<path d="M98 24 C92 8 112 2 116 14 C108 12 104 18 106 26 Z" fill="#4a2c1d"/>',
    // eyebrows (only shown for some feelings)
    '<g class="pip-brows">',
    '<path class="brow-sad" d="M68 70 L88 66 M132 70 L112 66" stroke="#4a2c1d" stroke-width="4" stroke-linecap="round"/>',
    '<path class="brow-angry" d="M68 64 L90 72 M132 64 L110 72" stroke="#4a2c1d" stroke-width="5" stroke-linecap="round"/>',
    '<path class="brow-up" d="M68 64 Q79 56 90 63 M110 63 Q121 56 132 64" stroke="#4a2c1d" stroke-width="4" fill="none" stroke-linecap="round"/>',
    '</g>',
    // eyes: open (default) or closed (calm)
    '<g class="pip-eyes"><ellipse cx="80" cy="86" rx="8" ry="10" fill="#2b2140"/><ellipse cx="120" cy="86" rx="8" ry="10" fill="#2b2140"/>',
    '<circle cx="83" cy="82" r="3" fill="#fff"/><circle cx="123" cy="82" r="3" fill="#fff"/></g>',
    '<path class="pip-eyes-closed" d="M71 88 Q80 80 89 88 M111 88 Q120 80 129 88" stroke="#2b2140" stroke-width="4" fill="none" stroke-linecap="round"/>',
    '<circle cx="66" cy="106" r="9" fill="#ff8f91" opacity="0.55"/><circle cx="134" cy="106" r="9" fill="#ff8f91" opacity="0.55"/>',
    '<path class="pip-tear" d="M70 98 q-5 9 0 12 q5 -3 0 -12z" fill="#5aa9e6"/>',
    // mouths: one shows at a time
    '<path class="pip-smile" d="M84 110 Q100 126 116 110" stroke="#7a2e2e" stroke-width="5" fill="none" stroke-linecap="round"/>',
    '<path class="pip-mouth-sad" d="M86 120 Q100 108 114 120" stroke="#7a2e2e" stroke-width="5" fill="none" stroke-linecap="round"/>',
    '<path class="pip-mouth-angry" d="M86 116 L114 116" stroke="#7a2e2e" stroke-width="5" stroke-linecap="round"/>',
    '<ellipse class="pip-mouth-o" cx="100" cy="116" rx="8" ry="10" fill="#7a2e2e"/>',
    '<path class="pip-mouth-calm" d="M90 113 Q100 119 110 113" stroke="#7a2e2e" stroke-width="4" fill="none" stroke-linecap="round"/>',
    '<ellipse class="pip-talk" cx="100" cy="116" rx="11" ry="8" fill="#7a2e2e"/>',
    '</g></svg>'
  ].join('');

  var CSS = [
    '.pip{width:clamp(110px,30vw,170px);}',
    '.pip-svg{width:100%;height:auto;display:block;overflow:visible;}',
    '.pip-body{transform-origin:100px 250px;animation:pip-bob 2.4s ease-in-out infinite;}',
    '.pip-eyes{transform-origin:100px 86px;animation:pip-blink 4.2s infinite;}',
    '.pip-talk,.pip-brows path,.pip-eyes-closed,.pip-tear,.pip-mouth-sad,.pip-mouth-angry,.pip-mouth-o,.pip-mouth-calm{display:none;}',
    // feelings
    '.pip-face-sad .brow-sad,.pip-face-sad .pip-tear,.pip-face-sad .pip-mouth-sad{display:inline;}',
    '.pip-face-angry .brow-angry,.pip-face-angry .pip-mouth-angry{display:inline;}',
    '.pip-face-scared .brow-sad,.pip-face-scared .pip-mouth-o,.pip-face-surprised .brow-up,.pip-face-surprised .pip-mouth-o{display:inline;}',
    '.pip-face-scared .pip-eyes,.pip-face-surprised .pip-eyes{transform:scale(1.25);}',
    '.pip-face-scared .pip-body{animation:pip-shake .18s linear infinite;}',
    '.pip-face-calm .pip-eyes{display:none;}.pip-face-calm .pip-eyes-closed,.pip-face-calm .pip-mouth-calm{display:inline;}',
    '.pip-face-sad .pip-smile,.pip-face-angry .pip-smile,.pip-face-scared .pip-smile,.pip-face-surprised .pip-smile,.pip-face-calm .pip-smile{display:none;}',
    // talking replaces whichever mouth is showing
    '.pip-talking .pip-smile,.pip-talking .pip-mouth-sad,.pip-talking .pip-mouth-angry,.pip-talking .pip-mouth-o,.pip-talking .pip-mouth-calm{display:none;}',
    '.pip-talking .pip-talk{display:block;transform-origin:100px 116px;animation:pip-talk .28s ease-in-out infinite alternate;}',
    '.pip-arm{transform-box:view-box;}.pip-arm-left{transform-origin:50px 146px;}.pip-arm-right{transform-origin:150px 146px;}',
    '.pip-wave .pip-arm-right{animation:pip-wave .5s ease-in-out infinite alternate;}',
    '.pip-point .pip-arm-right{transform:rotate(-115deg);transition:transform .4s ease;}',
    '.pip-jump .pip-body{animation:pip-jump .8s ease-in-out 2;}',
    '.pip-jump .pip-arm-right{transform:rotate(-160deg);}.pip-jump .pip-arm-left{transform:rotate(160deg);}',
    '@keyframes pip-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}',
    '@keyframes pip-blink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}',
    '@keyframes pip-talk{from{transform:scaleY(.35)}to{transform:scaleY(1.1)}}',
    '@keyframes pip-wave{from{transform:rotate(-140deg)}to{transform:rotate(-170deg)}}',
    '@keyframes pip-jump{0%,100%{transform:translateY(0)}45%{transform:translateY(-40px)}}',
    '@keyframes pip-shake{0%,100%{transform:translateX(0)}50%{transform:translateX(2px)}}',
    // lesson buddy
    '.pip-buddy{display:inline-block;vertical-align:middle;width:62px;margin:0 8px 0 0;}',
    '.pip-buddy .pip{width:100%;}',
    '.done-screen .pip-buddy,.complete-box .pip-buddy,.done-box .pip-buddy{display:block;width:96px;margin:0 auto 4px;}',
    '.pip-watch{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:8px 16px;border-radius:999px;background:#7445d6;color:#fff;font-weight:800;text-decoration:none;font-size:1rem;}',
    '.pip-watch .pip{width:26px;}',
    '@media (prefers-reduced-motion:reduce){.pip-body,.pip-eyes{animation:none;}}'
  ].join('');

  function ensureStyle() {
    if (doc.getElementById('esea-pip-style')) return;
    var style = doc.createElement('style');
    style.id = 'esea-pip-style';
    style.textContent = CSS;
    (doc.head || doc.documentElement).appendChild(style);
  }

  var FEELINGS = ['happy', 'sad', 'angry', 'scared', 'surprised', 'calm'];

  function character(container) {
    ensureStyle();
    container.classList.add('pip');
    container.innerHTML = SVG;
    var pose = null;
    var poseTimer = null;
    function setPose(name, ms) {
      clearTimeout(poseTimer);
      if (pose) container.classList.remove('pip-' + pose);
      pose = name;
      if (name) container.classList.add('pip-' + name);
      if (ms) poseTimer = setTimeout(function() { if (pose === name) setPose(null); }, ms);
    }
    return {
      el: container,
      talking: function(on) { container.classList.toggle('pip-talking', Boolean(on)); },
      wave: function(ms) { setPose('wave', ms || 2400); },
      point: function(ms) { setPose('point', ms); },
      jump: function(ms) { setPose('jump', ms || 1600); },
      rest: function() { setPose(null); },
      feel: function(name) {
        FEELINGS.forEach(function(f) { container.classList.remove('pip-face-' + f); });
        if (name && name !== 'happy') container.classList.add('pip-face-' + name);
      }
    };
  }

  // ---------- Lesson buddy ----------
  // Which Pip video teaches the same thing as each lesson.
  var VIDEO_FOR = [
    [/^reading\/rhyme/, 'tv/rhymes-with-pip.html'],
    [/^(reading\/|abc\/(abc|abcpic|alphabet-sounds|picktheletter|pronunciation-symbols|pickaword|pickthepic|kiddictionary)$|letter-match$|puzzles\/letter-match)/, 'tv/abc-with-pip.html'],
    [/^abc\/calendar/, 'tv/days-with-pip.html'],
    [/^(math\/|arithmetic\/|123\/|number-match$|puzzles\/number-match)/, 'tv/count-with-pip.html'],
    [/^color\//, 'tv/colors-with-pip.html'],
    [/^(shape-match$|puzzles\/shape-match)/, 'tv/shape-match-with-pip.html'],
    [/^(shapes\/|games\/whatshape)/, 'tv/shapes-with-pip.html'],
    [/^emotions\//, 'tv/feelings-with-pip.html'],
    [/^weather\//, 'tv/weather-with-pip.html'],
    [/^science\//, 'tv/nature-with-pip.html'],
    [/^(animal-match$|puzzles\/animal-match)/, 'tv/sound-parade.html'],
    [/^(sort-game$|puzzles\/sort-game)/, 'tv/sorting-with-pip.html'],
    [/^(find-pairs$|puzzles\/find-pairs)/, 'tv/memory-with-pip.html']
  ];
  var WATCH = { en: 'Watch with Pip', es: 'Mira con Pip', fr: 'Regarde avec Pip' };

  function lessonId() {
    var parts = global.location.pathname.split('/').filter(Boolean);
    var file = (parts.pop() || '').replace(/\.html?$/i, '');
    var folder = parts.pop() || '';
    return folder ? folder + '/' + file : file;
  }

  function videoFor(id) {
    for (var i = 0; i < VIDEO_FOR.length; i += 1) if (VIDEO_FOR[i][0].test(id)) return VIDEO_FOR[i][1];
    return null;
  }

  var SPOTS = ['[data-pip-spot]', '.done-screen', '.done-box.show', '.complete-box.show', '.quiz-prompt', '#activityArea .prompt', '.lesson-intro h2'];
  var buddy = null;
  var buddyEl = null;

  function bestSpot() {
    for (var i = 0; i < SPOTS.length; i += 1) {
      var spot = doc.querySelector(SPOTS[i]);
      if (spot && spot.offsetParent !== null) return spot;
    }
    return null;
  }

  // Keep the buddy next to the current question (lessons redraw each round).
  function placeBuddy() {
    var spot = bestSpot();
    if (!spot || !buddyEl) return;
    if (buddyEl.parentNode !== spot) spot.insertBefore(buddyEl, spot.firstChild);
  }

  function startBuddy() {
    if (doc.body.getAttribute('data-pip') === 'off') return;
    var id = lessonId();
    if (/^tv\//.test(id) || !doc.querySelector('.lesson-nav, .back-button')) return;
    ensureStyle();
    buddyEl = doc.createElement('span');
    buddyEl.className = 'pip-buddy';
    var inner = doc.createElement('span');
    buddyEl.appendChild(inner);
    buddy = character(inner);
    placeBuddy();
    new MutationObserver(placeBuddy).observe(doc.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden'] });
    setTimeout(function() { buddy.wave(2200); }, 400);

    // Watch the matching Pip video lesson.
    var video = videoFor(id);
    var nav = doc.querySelector('.lesson-nav');
    var back = doc.querySelector('.back-button');
    if (!nav && back && video) {
      // Puzzle pages have a single back button instead of a lesson nav.
      nav = doc.createElement('div');
      nav.className = 'pip-nav';
      nav.style.margin = '10px 0';
      back.parentNode.insertBefore(nav, back.nextSibling);
    }
    if (video && nav && !nav.querySelector('.pip-watch')) {
      var lang = global.ESEAFamily ? global.ESEAFamily.lang() : 'en';
      var a = doc.createElement('a');
      a.className = 'pip-watch';
      a.href = ROOT + video;
      var face = doc.createElement('span');
      a.appendChild(face);
      character(face);
      a.appendChild(doc.createTextNode('▶ ' + (WATCH[lang] || WATCH.en)));
      nav.appendChild(a);
    }
  }

  // Pip moves its mouth whenever the app's voice is speaking.
  global.addEventListener('esea-speaking', function(e) {
    if (buddy) buddy.talking(e.detail && e.detail.on);
  });

  // Pip reacts to what happens in the lesson.
  global.addEventListener('esea-lesson', function(e) {
    if (!buddy) return;
    placeBuddy();
    var type = e.detail && e.detail.type;
    if (type === 'correct') buddy.jump(1500);
    else if (type === 'miss' || type === 'reveal') buddy.point(1800);
    else if (type === 'done') { buddy.jump(1600); setTimeout(function() { buddy.wave(2400); }, 1700); }
    else if (type === 'start') buddy.wave(2000);
  });

  /** Lessons call this to let Pip react: start, correct, miss, reveal, done. */
  function lessonEvent(type) {
    try { global.dispatchEvent(new CustomEvent('esea-lesson', { detail: { type: type } })); } catch (e) {}
  }

  doc.addEventListener('DOMContentLoaded', startBuddy);

  global.ESEAPip = {
    character: character, lessonEvent: lessonEvent, videoFor: videoFor, feelings: FEELINGS,
    /** The lesson buddy's controls (null on pages without one). */
    buddy: function() { return buddy; }
  };
})(window);
