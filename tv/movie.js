/* ==========================================
   ESEA - Little movie player
   Plays a list of scenes in order. A scene is an async function that shows
   things on the stage and talks; everything waits for the voice, so pictures
   appear exactly when their word is spoken.

     ESEAMovie.create({
       stage: element, caption: element, controls: element,
       character: ESEAMovie.character(element)   // optional talking friend
       scenes: [async function(ctx) { ctx.show(...); await ctx.say('Hi!'); await ctx.wait(500); }, ...]
     });

   ctx.say(text)  speaks (and captions) the text, resolves when it is done
   ctx.wait(ms)   pauses
   Pause stops the voice and remembers the scene; Play continues from it.
   ========================================== */
(function(global) {
  var doc = global.document;
  var CANCELLED = { cancelled: true };

  function el(tag, className, html) {
    var node = doc.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  function plain(text) {
    return global.ESEASpeech ? global.ESEASpeech.plain(text) : String(text).replace(/\[([A-Za-z])\]/g, '$1');
  }

  // ---------- Talking character (Pip) ----------
  // A friendly child drawn in SVG: blinks, bobs, waves, points, jumps, and
  // moves its mouth while the voice is speaking.
  var PIP_SVG = [
    '<svg viewBox="0 0 200 270" class="pip-svg" aria-hidden="true">',
    '<ellipse cx="100" cy="262" rx="58" ry="7" fill="rgba(0,0,0,0.12)"/>',
    '<g class="pip-body">',
    // legs and shoes
    '<rect x="72" y="196" width="22" height="52" rx="10" fill="#3d5a99"/>',
    '<rect x="106" y="196" width="22" height="52" rx="10" fill="#3d5a99"/>',
    '<ellipse cx="80" cy="250" rx="17" ry="9" fill="#ff7a59"/>',
    '<ellipse cx="120" cy="250" rx="17" ry="9" fill="#ff7a59"/>',
    // arms (rotate at the shoulder)
    '<g class="pip-arm pip-arm-left"><rect x="40" y="142" width="20" height="62" rx="10" fill="#ffc94d"/><circle cx="50" cy="206" r="12" fill="#e0a77e"/></g>',
    '<g class="pip-arm pip-arm-right"><rect x="140" y="142" width="20" height="62" rx="10" fill="#ffc94d"/><circle cx="150" cy="206" r="12" fill="#e0a77e"/></g>',
    // shirt with a star
    '<rect x="56" y="132" width="88" height="78" rx="28" fill="#ffc94d"/>',
    '<path d="M100 152 l6 12 13 2 -9.5 9 2.3 13 -11.8-6.2 -11.8 6.2 2.3-13 -9.5-9 13-2z" fill="#ff7a59"/>',
    // head
    '<circle cx="100" cy="82" r="58" fill="#e0a77e"/>',
    '<circle cx="44" cy="88" r="10" fill="#e0a77e"/><circle cx="156" cy="88" r="10" fill="#e0a77e"/>',
    // hair
    '<path d="M44 76 C44 30 82 18 104 22 C134 26 160 44 156 78 C146 60 126 50 104 52 C84 54 62 60 44 76 Z" fill="#4a2c1d"/>',
    '<path d="M98 24 C92 8 112 2 116 14 C108 12 104 18 106 26 Z" fill="#4a2c1d"/>',
    // eyes
    '<g class="pip-eyes"><ellipse cx="80" cy="86" rx="8" ry="10" fill="#2b2140"/><ellipse cx="120" cy="86" rx="8" ry="10" fill="#2b2140"/>',
    '<circle cx="83" cy="82" r="3" fill="#fff"/><circle cx="123" cy="82" r="3" fill="#fff"/></g>',
    // cheeks
    '<circle cx="66" cy="106" r="9" fill="#ff8f91" opacity="0.55"/><circle cx="134" cy="106" r="9" fill="#ff8f91" opacity="0.55"/>',
    // mouth: smile when quiet, open mouth when talking
    '<path class="pip-smile" d="M84 110 Q100 126 116 110" stroke="#7a2e2e" stroke-width="5" fill="none" stroke-linecap="round"/>',
    '<ellipse class="pip-talk" cx="100" cy="116" rx="11" ry="8" fill="#7a2e2e"/>',
    '</g></svg>'
  ].join('');

  function character(container) {
    container.classList.add('pip');
    container.innerHTML = PIP_SVG;
    var pose = null;
    function setPose(name, ms) {
      if (pose) container.classList.remove('pip-' + pose);
      pose = name;
      if (name) container.classList.add('pip-' + name);
      if (ms) setTimeout(function() { if (pose === name) setPose(null); }, ms);
    }
    return {
      talking: function(on) { container.classList.toggle('pip-talking', Boolean(on)); },
      wave: function(ms) { setPose('wave', ms || 2400); },
      point: function() { setPose('point'); },
      jump: function(ms) { setPose('jump', ms || 1600); },
      rest: function() { setPose(null); }
    };
  }

  // ---------- Player ----------
  function create(opts) {
    var stage = opts.stage;
    var caption = opts.caption;
    var scenes = opts.scenes;
    var pip = opts.character || null;
    var index = 0;
    var playing = false;
    var generation = 0;
    var pending = [];

    var controls = opts.controls;
    var playBtn = el('button', 'movie-btn movie-play', '&#9654; Play');
    playBtn.type = 'button';
    var restartBtn = el('button', 'movie-btn movie-restart', '&#8634; Start over');
    restartBtn.type = 'button';
    var progress = el('div', 'movie-progress', '<div class="movie-progress-fill"></div>');
    progress.setAttribute('role', 'progressbar');
    progress.setAttribute('aria-valuemin', '0');
    progress.setAttribute('aria-valuemax', '100');
    controls.appendChild(playBtn);
    controls.appendChild(restartBtn);
    controls.parentNode.insertBefore(progress, controls);

    function setProgress() {
      var pct = Math.round((index / scenes.length) * 100);
      progress.firstChild.style.width = pct + '%';
      progress.setAttribute('aria-valuenow', String(pct));
    }

    function setPlaying(on) {
      playing = on;
      playBtn.innerHTML = on ? '&#10074;&#10074; Pause' : (index > 0 && index < scenes.length ? '&#9654; Keep watching' : '&#9654; Play');
      stage.classList.toggle('movie-paused', !on);
    }

    function cancelAll() {
      generation += 1;
      var list = pending;
      pending = [];
      list.forEach(function(p) { p.reject(CANCELLED); });
      if (global.ESEASpeech) global.ESEASpeech.stop();
      else if (global.speechSynthesis) global.speechSynthesis.cancel();
      if (pip) pip.talking(false);
    }

    function track(gen, executor) {
      return new Promise(function(resolve, reject) {
        if (gen !== generation) { reject(CANCELLED); return; }
        var entry = { reject: reject };
        pending.push(entry);
        executor(function(value) {
          pending = pending.filter(function(p) { return p !== entry; });
          if (gen !== generation) reject(CANCELLED); else resolve(value);
        });
      });
    }

    function makeCtx(gen) {
      return {
        stage: stage,
        pip: pip,
        el: el,
        say: function(text, sayOpts) {
          sayOpts = sayOpts || {};
          if (caption && !sayOpts.noCaption) caption.textContent = plain(text);
          if (pip) pip.talking(true);
          return track(gen, function(done) {
            function finish() {
              if (pip && gen === generation) pip.talking(false);
              done();
            }
            if (global.ESEASpeech && global.ESEASpeech.supported) {
              global.ESEASpeech.speak(text, { lang: opts.lang || 'en', onend: finish });
            } else {
              // No voice on this device: keep the movie moving with captions.
              setTimeout(finish, 600 + plain(text).length * 70);
            }
          });
        },
        wait: function(ms) {
          return track(gen, function(done) { setTimeout(done, ms); });
        },
        caption: function(text) { if (caption) caption.textContent = text; }
      };
    }

    function run() {
      var gen = generation;
      setPlaying(true);
      (function next() {
        if (gen !== generation) return;
        setProgress();
        if (index >= scenes.length) {
          setPlaying(false);
          index = 0;
          playBtn.innerHTML = '&#9654; Watch again';
          if (opts.onEnd) opts.onEnd();
          return;
        }
        var scene = scenes[index];
        Promise.resolve()
          .then(function() { return scene(makeCtx(gen)); })
          .then(function() {
            if (gen !== generation) return;
            index += 1;
            next();
          }, function(err) {
            if (err !== CANCELLED && global.console) global.console.error(err);
          });
      })();
    }

    function pause() {
      cancelAll();
      setPlaying(false);
    }

    function playFrom(i) {
      cancelAll();
      index = Math.max(0, Math.min(scenes.length - 1, i));
      run();
    }

    playBtn.addEventListener('click', function() {
      if (playing) pause();
      else { cancelAll(); run(); }
    });
    restartBtn.addEventListener('click', function() { playFrom(0); });
    global.addEventListener('pagehide', pause);
    doc.addEventListener('visibilitychange', function() {
      if (doc.hidden && playing) pause();
    });
    setPlaying(false);
    setProgress();

    return { play: run, pause: pause, playFrom: playFrom, isPlaying: function() { return playing; } };
  }

  // Small helpers for scenes.
  function wait(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }
  function pop(node) {
    node.classList.remove('pop-in');
    void node.offsetWidth;
    node.classList.add('pop-in');
  }

  global.ESEAMovie = { create: create, character: character, el: el, pop: pop, wait: wait };
})(window);
