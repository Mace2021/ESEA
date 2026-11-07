/* ==========================================
   ESEA - Speech
   One voice for the whole app, tuned to sound calm, slow and natural.

   - Picks the most natural voice the device has (neural / "Natural" /
     premium voices first, novelty and robotic voices never).
   - Speaks a little slower than normal, with real pauses between
     sentences and after "..." so speech flows like a person talking.
   - Works around browser quirks: voices that load late, speech that must
     wait for the first tap, Chrome cutting off long sentences, and online
     voices that fail when the device is offline.
   - Grown-ups can choose the voice and speed (saved on this device).

   Use:  ESEASpeech.speak('Hello! How many apples?', { lang: 'en', queue: false, onend: fn })
   Load this before family.js on every page.
   ========================================== */
(function(global) {
  var synth = global.speechSynthesis;
  var SETTINGS_KEY = 'esea_voice';
  var LANG_CODES = { en: 'en-US', es: 'es-ES', fr: 'fr-FR' };
  // Speed choices offered to grown-ups. "slow" is the default for young children.
  var RATES = { slower: 0.72, slow: 0.82, normal: 0.94 };
  var PITCH = 1.03;

  // Pauses (ms) after a sentence, a question, and a "..." beat.
  var PAUSE_SENTENCE = 320;
  var PAUSE_QUESTION = 420;
  var PAUSE_BEAT = 600;
  // Tiny gap around a letter name said on its own (see [A] below).
  var PAUSE_LETTER = 140;

  // ---------- Settings ----------
  function loadSettings() {
    try {
      var s = JSON.parse(global.localStorage.getItem(SETTINGS_KEY));
      if (s && typeof s === 'object') return { rate: s.rate || 'slow', voices: s.voices || {} };
    } catch (e) { /* storage blocked */ }
    return { rate: 'slow', voices: {} };
  }
  function saveSettings(s) {
    try { global.localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch (e) {}
  }

  // ---------- Voice choice ----------
  var NOVELTY = /albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|jester|organ|superstar|trinoids|whisper|wobble|zarvox|fred|junior|ralph|kathy|princess|espeak|robot/i;
  var NATURAL = /natural|neural|premium|enhanced|wavenet|journey|studio|siri/i;
  var GOOD_NAMES = /samantha|ava|allison|susan|zoe|nicky|karen|moira|tessa|serena|aria|jenny|libby|sonia|natasha|clara|emma|michelle|monica|mónica|paulina|marisol|elvira|dalia|helena|lucia|lucía|amelie|amélie|audrey|denise|marie|julie|google/i;

  function score(voice, code) {
    var lang = (voice.lang || '').replace('_', '-');
    var s = 0;
    if (lang.toLowerCase() === code.toLowerCase()) s += 30;
    else if (lang.slice(0, 2).toLowerCase() === code.slice(0, 2)) s += 20;
    else return -1000;
    if (NOVELTY.test(voice.name)) return -500;
    if (NATURAL.test(voice.name)) s += 40;
    if (GOOD_NAMES.test(voice.name)) s += 15;
    if (voice.localService) s += 3; // keeps working offline
    return s;
  }

  function voicesFor(lang) {
    if (!synth) return [];
    var code = LANG_CODES[lang] || LANG_CODES.en;
    return (synth.getVoices() || [])
      .map(function(v) { return { voice: v, score: score(v, code) }; })
      .filter(function(x) { return x.score > 0; })
      .sort(function(a, b) { return b.score - a.score; })
      .map(function(x) { return x.voice; });
  }

  var failedVoices = {};
  function pickVoice(lang) {
    var list = voicesFor(lang).filter(function(v) { return !failedVoices[v.name]; });
    var chosen = loadSettings().voices[lang];
    for (var i = 0; i < list.length; i += 1) {
      if (list[i].name === chosen) return list[i];
    }
    if (!global.navigator.onLine) {
      var local = list.filter(function(v) { return v.localService; });
      if (local.length) return local[0];
    }
    return list[0] || null;
  }

  // ---------- Text preparation ----------
  var EMOJI;
  try { EMOJI = new RegExp('[\\p{Extended_Pictographic}\\u{FE0F}\\u{200D}]', 'gu'); } catch (e) { EMOJI = null; }

  function clean(text) {
    var t = String(text || '');
    if (EMOJI) t = t.replace(EMOJI, '');
    return t.replace(/&/g, ' and ')
      .replace(/…/g, '...')
      .replace(/\s+\+\s+/g, ', ')
      .replace(/\s*=\s*\??/g, '?')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Split into short pieces so each gets its own natural pause.
  // Letter names: write [A] in speech text to mean "the letter A".
  // Voices read a capital A inside a sentence as the word "a" ("uh"), so a
  // marked letter is spoken as its own tiny utterance, which every voice
  // reads as the letter name ("ay"). On screen, use plain() to show just "A".
  var LETTER_MARK = /\s*\[([A-Za-z])\]([.!?,;:]*)\s*/g;

  function plain(text) {
    return String(text || '').replace(/\[([A-Za-z])\]/g, '$1');
  }

  function chunks(text) {
    var marked = clean(text)
      .replace(LETTER_MARK, function(_, letter, punct) { return '\u0004' + letter.toUpperCase() + punct + '\u0004'; })
      .replace(/\.{3,}\s*/g, '...\u0001')
      .replace(/([!?¿¡]?[^.!?\u0001]*[!?])\s+/g, '$1\u0002')
      .replace(/([^.]\.)\s+(?=\S)/g, '$1\u0003');
    var out = [];
    var re = /([^\u0001\u0002\u0003\u0004]+)([\u0001\u0002\u0003\u0004]?)/g;
    var m;
    while ((m = re.exec(marked)) !== null) {
      var piece = m[1].trim();
      if (!piece) continue;
      // Punctuation left on its own just extends the previous pause.
      if (/^[.!?,;:]+$/.test(piece)) {
        if (out.length) out[out.length - 1].pause = Math.max(out[out.length - 1].pause, PAUSE_SENTENCE);
        continue;
      }
      var pause = m[2] === '\u0001' ? PAUSE_BEAT
        : m[2] === '\u0002' ? PAUSE_QUESTION
        : m[2] === '\u0004' ? (/[.!?]$/.test(piece) ? PAUSE_SENTENCE : PAUSE_LETTER)
        : PAUSE_SENTENCE;
      out.push({ text: piece.replace(/\.{3}$/, ''), pause: pause });
    }
    return out;
  }

  // ---------- Playback queue ----------
  var queue = [];
  var speaking = false;
  var generation = 0;
  var keep = [];           // Chrome drops utterances that are garbage collected
  var watchdog = null;
  var blockedText = null;  // speech the browser refused before the first tap
  var userHasTapped = false;

  function stop() {
    generation += 1;
    queue = [];
    speaking = false;
    clearTimeout(watchdog);
    if (synth) synth.cancel();
  }

  function next(gen) {
    if (gen !== generation) return;
    var item = queue.shift();
    if (!item) {
      speaking = false;
      return;
    }
    speaking = true;
    var u = new global.SpeechSynthesisUtterance(item.text);
    var lang = item.lang;
    u.lang = LANG_CODES[lang] || LANG_CODES.en;
    var voice = pickVoice(lang);
    if (voice) u.voice = voice;
    u.rate = item.rate;
    u.pitch = PITCH;
    keep.push(u);
    if (keep.length > 20) keep.shift();

    var done = false;
    function finish() {
      if (done) return;
      done = true;
      clearTimeout(watchdog);
      if (gen !== generation) return;
      if (item.onend) item.onend();
      setTimeout(function() { next(gen); }, queue.length ? item.pause : 0);
    }
    u.onend = finish;
    u.onerror = function(e) {
      var reason = e && e.error;
      if (reason === 'not-allowed' && !userHasTapped) {
        // The browser wants a tap first: say it as soon as the child touches the screen.
        blockedText = blockedText || { text: item.fullText, opts: item.opts };
        var callback = item.opts && item.opts.onend;
        stop();
        // Anyone waiting for this speech to finish should not wait forever.
        if (callback) setTimeout(callback, 0);
        return;
      }
      if (reason === 'interrupted' || reason === 'canceled') return;
      // An online voice failing (e.g. offline): try the next best voice once.
      if (voice && !item.retried) {
        failedVoices[voice.name] = true;
        item.retried = true;
        queue.unshift(item);
        done = true;
        clearTimeout(watchdog);
        setTimeout(function() { next(gen); }, 0);
        return;
      }
      finish();
    };
    // Some browsers never fire "end"; move on after a generous estimate.
    watchdog = setTimeout(finish, 2500 + item.text.length * 110 / item.rate);
    synth.speak(u);
    // Chrome pauses long speech after ~15 s; a resume keeps it going.
    if (synth.paused) synth.resume();
  }

  var voicesReady = false;
  function whenVoicesReady(fn) {
    if (voicesReady || !synth || (synth.getVoices() || []).length) {
      voicesReady = true;
      fn();
      return;
    }
    var called = false;
    function go() {
      if (called) return;
      called = true;
      voicesReady = true;
      fn();
    }
    synth.addEventListener && synth.addEventListener('voiceschanged', go, { once: true });
    setTimeout(go, 700);
  }

  function speak(text, opts) {
    opts = opts || {};
    if (!synth || !text) {
      if (opts.onend) setTimeout(opts.onend, 0);
      return;
    }
    var settings = loadSettings();
    var rate = RATES[settings.rate] || RATES.slow;
    if (opts.slower) rate *= 0.9;
    var lang = opts.lang || 'en';
    var pieces = chunks(text);
    if (!pieces.length) {
      if (opts.onend) setTimeout(opts.onend, 0);
      return;
    }
    if (!opts.queue) stop();
    blockedText = null;
    var items = pieces.map(function(p, i) {
      return {
        text: p.text,
        pause: p.pause,
        lang: lang,
        rate: rate,
        fullText: text,
        opts: opts,
        onend: i === pieces.length - 1 ? opts.onend : null
      };
    });
    queue = queue.concat(items);
    if (!speaking) {
      var gen = generation;
      speaking = true;
      // A short gap after cancel() avoids Safari/Chrome swallowing the next line.
      whenVoicesReady(function() { setTimeout(function() { next(gen); }, 60); });
    }
  }

  // First tap anywhere: replay speech the browser blocked before it.
  function onFirstTap() {
    if (userHasTapped) return;
    userHasTapped = true;
    if (blockedText) {
      var pending = blockedText;
      blockedText = null;
      setTimeout(function() {
        if (!speaking) speak(pending.text, pending.opts);
      }, 0);
    }
  }
  ['pointerdown', 'touchend', 'keydown'].forEach(function(type) {
    global.addEventListener(type, onFirstTap, { capture: true, passive: true });
  });

  if (synth && synth.addEventListener) {
    synth.addEventListener('voiceschanged', function() { voicesReady = true; });
  }
  // Stop talking when the child leaves the page.
  global.addEventListener('pagehide', stop);

  global.ESEASpeech = {
    speak: speak,
    stop: stop,
    isSpeaking: function() { return speaking; },
    supported: Boolean(synth),
    voicesFor: voicesFor,
    currentVoice: pickVoice,
    rates: RATES,
    settings: loadSettings,
    setRate: function(key) {
      var s = loadSettings();
      s.rate = RATES[key] ? key : 'slow';
      saveSettings(s);
    },
    setVoice: function(lang, name) {
      var s = loadSettings();
      if (name) s.voices[lang] = name; else delete s.voices[lang];
      saveSettings(s);
    },
    onVoicesReady: whenVoicesReady,
    // Exposed for tests.
    /** Text for the screen: "[A] is for apple" -> "A is for apple". */
    plain: plain,
    _chunks: chunks,
    _clean: clean
  };
})(window);
