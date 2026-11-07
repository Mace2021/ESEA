/* ==========================================
   ESEA - Family features
   - Child profiles (siblings each get their own progress)
   - Grown-ups check before the parent area and before links leave the app
   - Optional daily time limit with a gentle "time for a break" screen
   - "Try this at home" ideas for each lesson
   Everything is stored in this browser only. Nothing is sent anywhere.
   Load this in <head> on every page, before skill-tracker.js.
   ========================================== */
(function(global) {
  var doc = global.document;
  var STORE_KEY = 'esea_family';
  var AVATARS = ['🐻', '🐰', '🦊', '🐼', '🐯', '🐸', '🦄', '🐵', '🐧', '🦁'];
  var ROOT = (function() {
    try { return new URL('.', doc.currentScript.src).href; } catch (e) { return './'; }
  })();
  var IS_PARENT_PAGE = /\/parents\.html$/i.test(global.location.pathname);

  // ---------- Storage ----------
  var memory = {};
  function getItem(key) {
    try { return global.localStorage.getItem(key); } catch (e) { return memory[key] || null; }
  }
  function setItem(key, value) {
    try { global.localStorage.setItem(key, value); } catch (e) { memory[key] = value; }
  }
  function removeItem(key) {
    try { global.localStorage.removeItem(key); } catch (e) { delete memory[key]; }
  }

  function today() {
    return new Date().toDateString();
  }

  function load() {
    var data = null;
    try { data = JSON.parse(getItem(STORE_KEY)); } catch (e) { data = null; }
    if (!data || !data.profiles || !data.profiles.length) {
      data = {
        profiles: [{ id: 'p1', name: 'My child', avatar: '🐻' }],
        active: 'p1',
        limitMinutes: 0,
        usage: {}
      };
      // Progress saved before profiles existed belongs to the first child.
      var old = getItem('esea_skills');
      if (old && !getItem('esea_skills:p1')) {
        setItem('esea_skills:p1', old);
        removeItem('esea_skills');
      }
      save(data);
    }
    if (!findProfile(data, data.active)) data.active = data.profiles[0].id;
    data.usage = data.usage || {};
    return data;
  }

  function save(data) {
    setItem(STORE_KEY, JSON.stringify(data));
  }

  function findProfile(data, id) {
    for (var i = 0; i < data.profiles.length; i += 1) {
      if (data.profiles[i].id === id) return data.profiles[i];
    }
    return null;
  }

  function usageFor(data, id) {
    var u = data.usage[id];
    if (!u || u.date !== today()) u = data.usage[id] = { date: today(), seconds: 0, bonus: 0 };
    return u;
  }

  // ---------- Lesson catalog and "try this at home" ideas ----------
  // id matches the lesson id the skill tracker uses ("folder/file" or puzzle id).
  var CATALOG = [
    { id: 'arithmetic/howmanyapple', area: 'Numbers', name: 'Count the Apples', href: 'arithmetic/howmanyapple.html', tracked: true,
      home: 'Snack counting: put 1 to 5 grapes or crackers on a plate. Touch each one as you count together, then ask "How many?"' },
    { id: '123/pickthenum', area: 'Numbers', name: 'Pick the Number', href: '123/pickthenum.html', tracked: true,
      home: 'Number hunt: spot numbers on clocks, doors, buses and price tags. Say each one together.' },
    { id: 'number-match', area: 'Numbers', name: 'Number Match', href: 'puzzles/number-match.html', tracked: true,
      home: 'Finger match: hold up 1 to 5 fingers and ask your child to show the same number with spoons or blocks.' },
    { id: '123/countto100', area: 'Numbers', name: 'Hear Numbers 1-100', href: '123/countto100.html',
      home: 'Count the stairs or steps to the car out loud every day.' },
    { id: 'abc/picktheletter', area: 'Letters & Words', name: 'Pick the Letter', href: 'abc/picktheletter.html', tracked: true,
      home: 'Letter of the day: pick one letter and find it on cereal boxes, signs and book covers.' },
    { id: 'letter-match', area: 'Letters & Words', name: 'Letter Match', href: 'puzzles/letter-match.html', tracked: true,
      home: 'Write big and small letters on sticky notes and match the pairs around the house.' },
    { id: 'abc/pickaword', area: 'Letters & Words', name: 'Pick the Word', href: 'abc/pickaword.html', tracked: true,
      home: 'Label three things at home (door, cup, bed) with paper signs and read them together each day.' },
    { id: 'abc/pickthepic', area: 'Letters & Words', name: 'Pick the Picture', href: 'abc/pickthepic.html', tracked: true,
      home: 'Picture book pointing: say a word and let your child point to it in a picture book.' },
    { id: 'abc/alphabet-sounds', area: 'Letters & Words', name: 'Sounds Phonics', href: 'abc/alphabet-sounds.html',
      home: 'First-sound game: "I spy something that starts with mmm..." Take turns.' },
    { id: 'abc/abcpic', area: 'Letters & Words', name: 'Letters with Pictures', href: 'abc/abcpic.html',
      home: 'Make an "A is for..." page together with drawings or magazine cut-outs.' },
    { id: 'shapes/whatshape', area: 'Shapes & Colors', name: 'What Shape Is This?', href: 'shapes/whatshape.html', tracked: true,
      home: 'Shape walk: find circles, squares and triangles in the kitchen or on the street.' },
    { id: 'shape-match', area: 'Shapes & Colors', name: 'Shape Match', href: 'puzzles/shape-match.html', tracked: true,
      home: 'Trace around cups, books and boxes on paper and guess which object made each shape.' },
    { id: 'color/colors', area: 'Shapes & Colors', name: 'Learn Colors', href: 'color/colors.html',
      home: 'I spy colors: "I spy something red." Then let your child choose the color.' },
    { id: 'emotions/emotions', area: 'Feelings & World', name: 'Learn Emotions', href: 'emotions/emotions.html',
      home: 'While reading, ask "How does she feel? How can you tell?" and name feelings together.' },
    { id: 'weather/weather', area: 'Feelings & World', name: 'Weather & Seasons', href: 'weather/weather.html',
      home: 'Look out of the window each morning and say the weather together. Choose clothes to match.' },
    { id: 'abc/calendar', area: 'Feelings & World', name: 'Calendar Words', href: 'abc/calendar.html',
      home: 'Say the day of the week at breakfast: "Today is Monday. Tomorrow is..."' },
    { id: 'science/bio', area: 'Feelings & World', name: 'Living Things', href: 'science/bio.html',
      home: 'Plant a bean in a wet paper towel in a cup and check it together every day.' },
    { id: 'animal-match', area: 'Games & Stories', name: 'Animal Match', href: 'puzzles/animal-match.html', tracked: true,
      home: 'Animal sounds: you make a sound, your child names the animal. Then swap.' },
    { id: 'sort-game', area: 'Games & Stories', name: 'Sort Game', href: 'puzzles/sort-game.html', tracked: true,
      home: 'Sort the laundry together: socks by color, then by size.' },
    { id: 'find-pairs', area: 'Games & Stories', name: 'Find Pairs', href: 'puzzles/find-pairs.html',
      home: 'Play memory with pairs of socks or matching cups turned upside down.' },
    { id: 'books/lego', area: 'Games & Stories', name: 'Who Took My Legos?', href: 'books/lego.html',
      home: 'After the story, ask "What happened first? What happened next?"' }
  ];

  function lessonById(id) {
    for (var i = 0; i < CATALOG.length; i += 1) if (CATALOG[i].id === id) return CATALOG[i];
    return null;
  }

  // ---------- Modal helpers ----------
  var STYLE = [
    '.esea-overlay{position:fixed;inset:0;z-index:9999;background:rgba(23,50,58,.72);display:flex;align-items:center;justify-content:center;padding:16px;}',
    '.esea-modal{background:#fff;color:#17323a;border-radius:18px;max-width:420px;width:100%;padding:24px 20px;text-align:center;box-shadow:0 18px 40px rgba(0,0,0,.3);font-family:inherit;}',
    '.esea-modal h2{margin:0 0 8px;font-size:1.6rem;color:#245f73;}',
    '.esea-modal p{margin:0 0 16px;font-size:1.05rem;line-height:1.45;}',
    '.esea-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:14px;}',
    '.esea-btn{min-height:52px;border:0;border-radius:12px;background:#245f73;color:#fff;font-size:1.2rem;font-weight:800;cursor:pointer;padding:10px;font-family:inherit;}',
    '.esea-btn.light{background:#fff3c7;color:#17323a;border:2px solid rgba(23,50,58,.16);}',
    '.esea-btn.link{background:none;color:#245f73;text-decoration:underline;font-size:1rem;min-height:40px;}',
    '.esea-avatars{display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:12px;margin-bottom:14px;}',
    '.esea-avatar{border:3px solid transparent;border-radius:16px;background:#d9f4f2;padding:12px 6px;cursor:pointer;font-family:inherit;font-size:1rem;font-weight:800;color:#17323a;}',
    '.esea-avatar span{display:block;font-size:3rem;line-height:1.1;}',
    '.esea-avatar.on{border-color:#245f73;background:#fff3c7;}',
    '.esea-break{font-size:4rem;line-height:1;margin-bottom:8px;}',
    '.profile-chip{display:inline-flex;align-items:center;gap:8px;border:0;border-radius:999px;background:#fff;color:#17323a;font-weight:800;font-size:1.05rem;padding:6px 16px 6px 8px;cursor:pointer;box-shadow:0 4px 10px rgba(0,0,0,.15);font-family:inherit;}',
    '.profile-chip span{font-size:2rem;line-height:1;}'
  ].join('');

  function ensureStyle() {
    if (doc.getElementById('esea-family-style')) return;
    var style = doc.createElement('style');
    style.id = 'esea-family-style';
    style.textContent = STYLE;
    doc.head.appendChild(style);
  }

  function openModal(html) {
    ensureStyle();
    var overlay = doc.createElement('div');
    overlay.className = 'esea-overlay';
    overlay.innerHTML = '<div class="esea-modal" role="dialog" aria-modal="true">' + html + '</div>';
    doc.body.appendChild(overlay);
    return overlay;
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function(c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function speak(text) {
    if (!text || !global.speechSynthesis) return;
    global.speechSynthesis.cancel();
    var msg = new global.SpeechSynthesisUtterance(text);
    msg.rate = 0.9;
    msg.pitch = 1.05;
    global.speechSynthesis.speak(msg);
  }

  // ---------- Grown-ups check ----------
  // A multiplication question: easy for adults, not something a 3-6 year old
  // can answer, and nothing is read aloud.
  function parentGate(onPass, onCancel) {
    var a = 3 + Math.floor(Math.random() * 7);
    var b = 3 + Math.floor(Math.random() * 7);
    var answer = a * b;
    var options = [answer];
    while (options.length < 4) {
      var wrong = answer + (Math.floor(Math.random() * 13) - 6);
      if (wrong > 0 && options.indexOf(wrong) === -1) options.push(wrong);
    }
    options.sort(function(x, y) { return x - y; });
    var overlay = openModal([
      '<h2>Grown-ups only</h2>',
      '<p>To continue, tap the answer:<br><strong style="font-size:1.6rem">' + a + ' &times; ' + b + ' = ?</strong></p>',
      '<div class="esea-grid">',
      options.map(function(o) { return '<button type="button" class="esea-btn light" data-v="' + o + '">' + o + '</button>'; }).join(''),
      '</div>',
      '<button type="button" class="esea-btn link" data-cancel>Cancel</button>'
    ].join(''));
    overlay.addEventListener('click', function(e) {
      var t = e.target.closest('button');
      if (!t) return;
      if (t.hasAttribute('data-cancel')) {
        overlay.remove();
        if (onCancel) onCancel();
        return;
      }
      overlay.remove();
      if (Number(t.getAttribute('data-v')) === answer) {
        try { global.sessionStorage.setItem('esea_gate_ok', String(Date.now())); } catch (err) {}
        onPass();
      }
      else parentGate(onPass, onCancel); // wrong: new question
    });
  }

  // ---------- Profiles ----------
  function profilePicker(onDone) {
    var data = load();
    var overlay = openModal([
      '<h2>Who is playing?</h2>',
      '<div class="esea-avatars">',
      data.profiles.map(function(p) {
        return '<button type="button" class="esea-avatar' + (p.id === data.active ? ' on' : '') + '" data-id="' + p.id + '">' +
          '<span aria-hidden="true">' + p.avatar + '</span>' + escapeHtml(p.name) + '</button>';
      }).join(''),
      '</div>',
      '<p style="font-size:.9rem;margin:0">Grown-ups can add children in the Grown-ups area.</p>'
    ].join(''));
    speak('Who is playing?');
    overlay.addEventListener('click', function(e) {
      var t = e.target.closest('.esea-avatar');
      if (!t) {
        if (e.target === overlay) overlay.remove();
        return;
      }
      var d = load();
      d.active = t.getAttribute('data-id');
      save(d);
      var p = findProfile(d, d.active);
      speak('Hi, ' + p.name + '!');
      overlay.remove();
      if (onDone) onDone(p);
    });
  }

  function renderChip() {
    var chip = doc.getElementById('profileChip');
    if (!chip) return;
    var p = ESEAFamily.activeProfile();
    chip.innerHTML = '<span aria-hidden="true">' + p.avatar + '</span>' + escapeHtml(p.name);
    chip.setAttribute('aria-label', 'Playing as ' + p.name + '. Change player.');
  }

  // ---------- Daily time limit ----------
  var breakShown = false;

  function limitReached() {
    var data = load();
    if (!data.limitMinutes) return false;
    var u = usageFor(data, data.active);
    return u.seconds >= (data.limitMinutes + (u.bonus || 0)) * 60;
  }

  function showBreak() {
    if (breakShown) return;
    breakShown = true;
    try { global.speechSynthesis && global.speechSynthesis.cancel(); } catch (e) {}
    var name = ESEAFamily.activeProfile().name;
    var overlay = openModal([
      '<div class="esea-break" aria-hidden="true">🌙</div>',
      '<h2>Time for a break!</h2>',
      '<p>Great learning today, ' + escapeHtml(name) + '. Let’s play again tomorrow.</p>',
      '<button type="button" class="esea-btn link" data-grownup>Grown-ups</button>'
    ].join(''));
    setTimeout(function() { speak('Time for a break! Great learning today. Let’s play again tomorrow.'); }, 50);
    overlay.querySelector('[data-grownup]').addEventListener('click', function() {
      parentGate(function() {
        var data = load();
        usageFor(data, data.active).bonus += 15;
        save(data);
        overlay.remove();
        breakShown = false;
      });
    });
  }

  var TICK = 10;
  function trackTime() {
    if (IS_PARENT_PAGE) return;
    setInterval(function() {
      if (doc.visibilityState !== 'visible') return;
      var data = load();
      usageFor(data, data.active).seconds += TICK;
      save(data);
      if (limitReached()) showBreak();
    }, TICK * 1000);
    if (limitReached()) showBreak();
  }

  // ---------- Links that leave the app go through the grown-ups check ----------
  function guardLinks() {
    if (IS_PARENT_PAGE) return;
    doc.addEventListener('click', function(e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      var external = a.hostname && a.hostname !== global.location.hostname;
      var gated = external || a.hasAttribute('data-parent-gate');
      if (!gated) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      parentGate(function() { global.location.href = a.href; });
    }, true);
  }

  // ---------- Public API ----------
  var ESEAFamily = {
    root: ROOT,
    avatars: AVATARS,
    catalog: CATALOG,
    lessonById: lessonById,

    data: load,
    save: save,

    profiles: function() { return load().profiles; },
    activeProfile: function() {
      var d = load();
      return findProfile(d, d.active);
    },
    setActive: function(id) {
      var d = load();
      if (findProfile(d, id)) { d.active = id; save(d); }
    },
    addProfile: function(name, avatar) {
      var d = load();
      var id = 'p' + Date.now().toString(36);
      d.profiles.push({ id: id, name: name || 'Child', avatar: avatar || AVATARS[d.profiles.length % AVATARS.length] });
      save(d);
      return id;
    },
    updateProfile: function(id, name, avatar) {
      var d = load();
      var p = findProfile(d, id);
      if (!p) return;
      if (name) p.name = name;
      if (avatar) p.avatar = avatar;
      save(d);
    },
    removeProfile: function(id) {
      var d = load();
      if (d.profiles.length <= 1) return false;
      d.profiles = d.profiles.filter(function(p) { return p.id !== id; });
      if (d.active === id) d.active = d.profiles[0].id;
      delete d.usage[id];
      save(d);
      removeItem('esea_skills:' + id);
      return true;
    },

    /** localStorage key for a child's skill progress (active child by default). */
    skillsKey: function(profileId) {
      return 'esea_skills:' + (profileId || load().active);
    },

    homeIdea: function(lessonId) {
      var l = lessonById(lessonId);
      return l ? l.home : '';
    },

    setLimit: function(minutes) {
      var d = load();
      d.limitMinutes = Number(minutes) || 0;
      save(d);
    },
    minutesToday: function(profileId) {
      var d = load();
      var u = d.usage[profileId || d.active];
      return u && u.date === today() ? Math.round(u.seconds / 60) : 0;
    },

    parentGate: parentGate,
    /** True if a grown-up passed the check in this tab in the last 5 minutes. */
    recentlyVerified: function() {
      try {
        return Date.now() - Number(global.sessionStorage.getItem('esea_gate_ok') || 0) < 5 * 60 * 1000;
      } catch (e) { return false; }
    },
    profilePicker: profilePicker
  };

  global.ESEAFamily = ESEAFamily;

  doc.addEventListener('DOMContentLoaded', function() {
    renderChip();
    var chip = doc.getElementById('profileChip');
    if (chip) chip.addEventListener('click', function() { profilePicker(renderChip); });
    var grownups = doc.getElementById('grownupsLink');
    if (grownups) {
      grownups.addEventListener('click', function(e) {
        e.preventDefault();
        parentGate(function() { global.location.href = grownups.href; });
      });
    }
    guardLinks();
    trackTime();
  });
})(window);
