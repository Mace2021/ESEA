/* ==========================================
   ESEA - Skill Tracker
   Remembers how a child does on each item (each letter, number, shape...)
   and picks the next questions from what they still find hard, with a
   little review of what they already know.

   Uses a simple Leitner box per item:
     box 0  = just missed, practise soon
     box 1-2 = learning
     box 3+ = known, review now and then
   Everything stays in this browser (localStorage). Nothing is sent anywhere.
   ========================================== */
(function(global) {
  var STORAGE_KEY = 'esea_skills';
  var MAX_BOX = 5;
  var DAY = 24 * 60 * 60 * 1000;
  // Days to wait before a known item is due for review, by box.
  var REVIEW_DAYS = [0, 0, 1, 2, 4, 7];

  function load() {
    try {
      var data = JSON.parse(global.localStorage.getItem(STORAGE_KEY));
      if (data && data.lessons) return data;
    } catch (e) { /* storage blocked or corrupt: start fresh */ }
    return { version: 1, lessons: {} };
  }

  function save(data) {
    try {
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) { /* storage full or blocked: progress just isn't kept */ }
  }

  function lessonIdFromPath() {
    var parts = global.location.pathname.split('/').filter(Boolean);
    var file = (parts.pop() || 'index').replace(/\.html?$/i, '');
    var folder = parts.pop() || '';
    return folder ? folder + '/' + file : file;
  }

  function weightFor(item, now) {
    if (!item) return 3;                       // never tried: worth meeting
    if (item.box <= 1) return 5;               // struggling: most practice
    var due = now - item.last >= REVIEW_DAYS[item.box] * DAY;
    if (item.box >= 3) return due ? 2 : 0.5;   // known: occasional review
    return due ? 3 : 2;                         // learning
  }

  var SkillTracker = {
    lessonId: lessonIdFromPath,

    /** Record an answer. firstTry = answered right with no wrong taps. */
    record: function(lessonId, key, firstTry) {
      var data = load();
      var lesson = data.lessons[lessonId] || (data.lessons[lessonId] = {});
      var item = lesson[key] || (lesson[key] = { box: 1, seen: 0, correct: 0, last: 0 });
      item.seen += 1;
      if (firstTry) {
        item.correct += 1;
        item.box = Math.min(MAX_BOX, item.box + 1);
      } else {
        item.box = 0;
      }
      item.last = Date.now();
      save(data);
    },

    /**
     * Choose up to n rounds, favouring items the child finds hard or has not
     * met yet. keyOf(round) gives the item key (defaults to round.answer).
     */
    choose: function(lessonId, rounds, n, keyOf) {
      keyOf = keyOf || function(round) { return String(round.answer); };
      var lesson = load().lessons[lessonId] || {};
      var now = Date.now();
      var seenKeys = {};
      var ranked = rounds.map(function(round) {
        var w = weightFor(lesson[keyOf(round)], now);
        // Weighted random order (Efraimidis-Spirakis): higher weight, earlier.
        return { round: round, key: keyOf(round), rank: Math.pow(Math.random(), 1 / w) };
      }).sort(function(a, b) { return b.rank - a.rank; });
      var picked = [];
      for (var i = 0; i < ranked.length && picked.length < n; i += 1) {
        if (seenKeys[ranked[i].key]) continue;
        seenKeys[ranked[i].key] = true;
        picked.push(ranked[i].round);
      }
      return picked;
    },

    /** Per-item progress for one lesson, e.g. for a parent view. */
    summary: function(lessonId) {
      var lesson = load().lessons[lessonId] || {};
      return Object.keys(lesson).map(function(key) {
        var item = lesson[key];
        return {
          key: key,
          status: item.box >= 3 ? 'known' : (item.box === 0 ? 'practising' : 'learning'),
          seen: item.seen,
          correct: item.correct,
          last: item.last
        };
      });
    },

    all: function() { return load().lessons; },

    reset: function() { save({ version: 1, lessons: {} }); }
  };

  global.SkillTracker = SkillTracker;
})(window);
