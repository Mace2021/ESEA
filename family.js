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
  var LANGUAGES = {
    en: { name: 'English', speech: 'en-US' },
    es: { name: 'Español (Spanish)', speech: 'es-ES' },
    fr: { name: 'Français (French)', speech: 'fr-FR' }
  };
  // Child-facing words used by family.js itself.
  var WORDS = {
    en: { who: 'Who is playing?', hi: 'Hi, {name}!', grownupsAdd: 'Grown-ups can add children in the Grown-ups area.',
          breakTitle: 'Time for a break!', breakText: 'Great learning today, {name}. Let\u2019s play again tomorrow.',
          breakSay: 'Time for a break! Great learning today. Let\u2019s play again tomorrow.', grownups: 'Grown-ups',
          setupTitle: 'Welcome to ESEA!', setupIntro: 'A few quick questions so ESEA fits your child. It takes about 30 seconds.',
          setupLang: 'Which language would you like?', setupName: 'What is your child\u2019s name?', setupNamePh: 'First name',
          setupAnimal: 'Pick an animal for them', setupAge: 'How old is {name}?',
          setupAgeNote: 'This sets where the reading and math steps begin. ESEA keeps adjusting as your child plays.',
          years: '{n} years', setupTime: 'Daily screen time',
          setupTimeNote: 'Health experts advise short screen time for young children, ideally shared with a grown-up. ESEA shows a calm break screen when time is up.',
          minutes: '{n} min', noLimit: 'No limit', recommended: 'recommended', next: 'Next', back: 'Back', skip: 'Skip for now',
          setupDone: 'All set!', setupDoneText: 'Tap \u201cToday\u2019s learning\u201d for a short daily plan made for {name}. You can change these answers any time in the Grown-ups area.',
          start: 'Let\u2019s go!', yourChild: 'your child', backToPlan: '\u2b50 Back to today\u2019s plan' },
    es: { who: '¿Quién va a jugar?', hi: '¡Hola, {name}!', grownupsAdd: 'Los adultos pueden añadir niños en el área de adultos.',
          breakTitle: '¡Hora de descansar!', breakText: '¡Aprendiste mucho hoy, {name}! Jugamos otra vez mañana.',
          breakSay: '¡Hora de descansar! Aprendiste mucho hoy. Jugamos otra vez mañana.', grownups: 'Adultos',
          setupTitle: '¡Bienvenidos a ESEA!', setupIntro: 'Unas preguntas rápidas para adaptar ESEA a tu hijo o hija. Tarda unos 30 segundos.',
          setupLang: '¿Qué idioma prefieres?', setupName: '¿Cómo se llama tu hijo o hija?', setupNamePh: 'Nombre',
          setupAnimal: 'Elige un animal', setupAge: '¿Cuántos años tiene {name}?',
          setupAgeNote: 'Así sabemos por dónde empezar en lectura y matemáticas. ESEA se sigue ajustando mientras juega.',
          years: '{n} años', setupTime: 'Tiempo de pantalla al día',
          setupTimeNote: 'Los expertos en salud recomiendan ratos cortos de pantalla para los niños pequeños, mejor acompañados de un adulto. ESEA muestra una pantalla de descanso al terminar el tiempo.',
          minutes: '{n} min', noLimit: 'Sin límite', recommended: 'recomendado', next: 'Siguiente', back: 'Atrás', skip: 'Omitir por ahora',
          setupDone: '¡Todo listo!', setupDoneText: 'Toca «Aprender hoy» para ver un plan corto hecho para {name}. Puedes cambiar estas respuestas cuando quieras en el área de adultos.',
          start: '¡Vamos!', yourChild: 'tu hijo o hija', backToPlan: '\u2b50 Volver al plan de hoy' },
    fr: { who: 'Qui joue ?', hi: 'Bonjour, {name} !', grownupsAdd: 'Les adultes peuvent ajouter des enfants dans l\u2019espace adultes.',
          breakTitle: 'C\u2019est l\u2019heure de la pause !', breakText: 'Tu as bien appris aujourd\u2019hui, {name}. On rejoue demain.',
          breakSay: 'C\u2019est l\u2019heure de la pause ! Tu as bien appris aujourd\u2019hui. On rejoue demain.', grownups: 'Adultes',
          setupTitle: 'Bienvenue sur ESEA !', setupIntro: 'Quelques questions rapides pour adapter ESEA à votre enfant. Environ 30 secondes.',
          setupLang: 'Quelle langue préférez-vous ?', setupName: 'Comment s\u2019appelle votre enfant ?', setupNamePh: 'Prénom',
          setupAnimal: 'Choisissez un animal', setupAge: 'Quel âge a {name} ?',
          setupAgeNote: 'Cela fixe le point de départ en lecture et en maths. ESEA continue de s\u2019adapter pendant le jeu.',
          years: '{n} ans', setupTime: 'Temps d\u2019écran par jour',
          setupTimeNote: 'Les experts de santé conseillent des moments d\u2019écran courts pour les jeunes enfants, idéalement avec un adulte. ESEA affiche une pause calme quand le temps est écoulé.',
          minutes: '{n} min', noLimit: 'Sans limite', recommended: 'conseillé', next: 'Suivant', back: 'Retour', skip: 'Passer pour l\u2019instant',
          setupDone: 'C\u2019est prêt !', setupDoneText: 'Touchez « Apprendre aujourd\u2019hui » pour un petit programme fait pour {name}. Vous pouvez changer ces réponses à tout moment dans l\u2019espace adultes.',
          start: 'C\u2019est parti !', yourChild: 'votre enfant', backToPlan: '\u2b50 Retour au programme du jour' }
  };
  function word(key, name) {
    var lang = currentLang();
    var text = (WORDS[lang] || WORDS.en)[key] || WORDS.en[key];
    return name === undefined ? text : text.replace('{name}', name).replace('{n}', name);
  }
  function currentLang() {
    var lang = load().language;
    return LANGUAGES[lang] ? lang : 'en';
  }

  // Speech goes through speech.js (one calm, natural voice for the whole app).
  function speakIn(text, lang, opts) {
    opts = opts || {};
    if (global.ESEASpeech) {
      global.ESEASpeech.speak(text, { lang: lang, queue: opts.queue, onend: opts.onend });
    } else if (global.speechSynthesis) {
      global.speechSynthesis.cancel();
      var msg = new global.SpeechSynthesisUtterance(text);
      msg.rate = 0.85;
      global.speechSynthesis.speak(msg);
    }
  }

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
    { id: 'math/quicklook', area: 'Numbers', name: 'Quick Look', href: 'math/quicklook.html', tracked: true,
      path: 'math', step: 1, langs: ['en', 'es', 'fr'],
      home: 'Dice glance: roll one die, cover it after a second, and ask how many dots. Use dominoes or fingers too.' },
    { id: 'arithmetic/howmanyapple', area: 'Numbers', name: 'Count the Apples', href: 'arithmetic/howmanyapple.html', tracked: true,
      path: 'math', step: 2, langs: ['en', 'es', 'fr'],
      home: 'Snack counting: put 1 to 5 grapes or crackers on a plate. Touch each one as you count together, then ask "How many?"' },
    { id: 'math/countto10', area: 'Numbers', name: 'Count to 10', href: 'math/countto10.html', tracked: true,
      path: 'math', step: 3, langs: ['en', 'es', 'fr'],
      home: 'Count 6 to 10 things at bath time or while tidying: toys into the box, one at a time.' },
    { id: 'math/moreorless', area: 'Numbers', name: 'More or Less', href: 'math/moreorless.html', tracked: true,
      path: 'math', step: 4, langs: ['en', 'es', 'fr'],
      home: 'Snack sharing: make two piles of crackers and ask "Which pile has more?" Then count to check.' },
    { id: 'math/whatsnext', area: 'Numbers', name: 'What Comes Next?', href: 'math/whatsnext.html', tracked: true,
      path: 'math', step: 5, langs: ['en', 'es', 'fr'],
      home: 'Count steps out loud, stop, and let your child say the next number.' },
    { id: '123/pickthenum', area: 'Numbers', name: 'Pick the Number', href: '123/pickthenum.html', tracked: true,
      path: 'math', step: 6,
      home: 'Number hunt: spot numbers on clocks, doors, buses and price tags. Say each one together.' },
    { id: 'number-match', area: 'Numbers', name: 'Number Match', href: 'puzzles/number-match.html', tracked: true,
      home: 'Finger match: hold up 1 to 5 fingers and ask your child to show the same number with spoons or blocks.' },
    { id: '123/countto100', area: 'Numbers', name: 'Hear Numbers 1-100', href: '123/countto100.html',
      home: 'Count the stairs or steps to the car out loud every day.' },
    { id: 'reading/rhyme', area: 'Letters & Words', name: 'Rhyme Time', href: 'reading/rhyme.html', tracked: true,
      path: 'reading', step: 1,
      home: 'Rhyme silly names: cat, hat, bat, zat! Read rhyming books and pause so your child can say the rhyme.' },
    { id: 'reading/wordparts', area: 'Letters & Words', name: 'Word Parts', href: 'reading/wordparts.html', tracked: true,
      path: 'reading', step: 2,
      home: 'Robot talk: say a word in parts ("pan... cake") and let your child say the whole word. Then clap the parts.' },
    { id: 'reading/firstsounds', area: 'Letters & Words', name: 'First Sounds', href: 'reading/firstsounds.html', tracked: true,
      path: 'reading', step: 3,
      home: 'I spy first sounds: "I spy something that starts like sss... sock!" Take turns choosing.' },
    { id: 'abc/alphabet-sounds', area: 'Letters & Words', name: 'Sounds Phonics', href: 'abc/alphabet-sounds.html',
      path: 'reading', step: 4,
      home: 'First-sound game: "I spy something that starts with mmm..." Take turns.' },
    { id: 'abc/picktheletter', area: 'Letters & Words', name: 'Pick the Letter', href: 'abc/picktheletter.html', tracked: true,
      path: 'reading', step: 5,
      home: 'Letter of the day: pick one letter and find it on cereal boxes, signs and book covers.' },
    { id: 'letter-match', area: 'Letters & Words', name: 'Letter Match', href: 'puzzles/letter-match.html', tracked: true,
      home: 'Write big and small letters on sticky notes and match the pairs around the house.' },
    { id: 'abc/pickaword', area: 'Letters & Words', name: 'Pick the Word', href: 'abc/pickaword.html', tracked: true,
      home: 'Label three things at home (door, cup, bed) with paper signs and read them together each day.' },
    { id: 'abc/pickthepic', area: 'Letters & Words', name: 'Pick the Picture', href: 'abc/pickthepic.html', tracked: true,
      home: 'Picture book pointing: say a word and let your child point to it in a picture book.' },
    { id: 'abc/abcpic', area: 'Letters & Words', name: 'Letters with Pictures', href: 'abc/abcpic.html',
      home: 'Make an "A is for..." page together with drawings or magazine cut-outs.' },
    { id: 'shapes/whatshape', area: 'Shapes & Colors', name: 'What Shape Is This?', href: 'shapes/whatshape.html', tracked: true,
      home: 'Shape walk: find circles, squares and triangles in the kitchen or on the street.' },
    { id: 'shape-match', area: 'Shapes & Colors', name: 'Shape Match', href: 'puzzles/shape-match.html', tracked: true,
      home: 'Trace around cups, books and boxes on paper and guess which object made each shape.' },
    { id: 'color/balloon-pop', area: 'Shapes & Colors', name: 'Balloon Pop', href: 'color/balloon-pop.html', tracked: true, langs: ['en', 'es', 'fr'],
      home: 'Color hunt: name a color and find three things of that color at home. Then let your child choose the color.' },
    { id: 'color/colors', area: 'Shapes & Colors', name: 'Learn Colors', href: 'color/colors.html',
      home: 'I spy colors: "I spy something red." Then let your child choose the color.' },
    { id: 'emotions/emotions', area: 'Feelings & World', name: 'Name My Feelings', href: 'emotions/emotions.html',
      home: 'Feelings check-in: at bedtime, ask "What was one feeling you had today?" Share one of yours too.' },
    { id: 'emotions/feelings-quiz', area: 'Feelings & World', name: 'How Do They Feel?', href: 'emotions/feelings-quiz.html', tracked: true,
      home: 'While reading, pause and ask "How does she feel? How can you tell?" Point to the face and body.' },
    { id: 'emotions/calm-corner', area: 'Feelings & World', name: 'Calm Down Corner', href: 'emotions/calm-corner.html',
      home: 'Practise flower breathing together when everyone is calm, so it is easy to use when feelings get big.' },
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
      home: 'After the story, ask "What happened first? What happened next?"' },
    { id: 'tv/abc-with-pip', area: 'Watch & Listen', name: 'ABC with Pip', href: 'tv/abc-with-pip.html', video: true,
      home: 'Sing the alphabet together in the car or at bath time, and point to letters you see on signs.' },
    { id: 'tv/count-with-pip', area: 'Watch & Listen', name: 'Count with Pip', href: 'tv/count-with-pip.html', video: true,
      home: 'Count everyday things out loud together: stairs, spoons, toys going into the box.' },
    { id: 'tv/animated-alphabet', area: 'Watch & Listen', name: 'Alphabet Adventure', href: 'tv/animated-alphabet.html', video: true,
      home: 'Pick a letter and find three things at home that start with it.' },
    { id: 'tv/counting-rainbow', area: 'Watch & Listen', name: 'Counting Rainbow', href: 'tv/counting-rainbow.html', video: true,
      home: 'Go on a color hunt: find something red, orange, yellow, green, blue and purple.' },
    { id: 'tv/colors-with-pip', area: 'Watch & Listen', name: 'Colors with Pip', href: 'tv/colors-with-pip.html', video: true,
      home: 'Mix paints or play-dough together: what happens when you mix red and yellow? Blue and yellow?' },
    { id: 'tv/shapes-with-pip', area: 'Watch & Listen', name: 'Shapes with Pip', href: 'tv/shapes-with-pip.html', video: true,
      home: 'Shape hunt: find something round, something square, and something shaped like a triangle at home.' },
    { id: 'tv/feelings-with-pip', area: 'Watch & Listen', name: 'Feelings with Pip', href: 'tv/feelings-with-pip.html', video: true,
      home: 'Make feeling faces in a mirror together and guess each other\u2019s feeling.' },
    { id: 'tv/weather-with-pip', area: 'Watch & Listen', name: 'Weather with Pip', href: 'tv/weather-with-pip.html', video: true,
      home: 'Each morning, look outside together and choose clothes for the weather.' },
    { id: 'tv/days-with-pip', area: 'Watch & Listen', name: 'Days of the Week with Pip', href: 'tv/days-with-pip.html', video: true,
      home: 'At breakfast, say what day it is today, what day it was yesterday, and what day it will be tomorrow.' },
    { id: 'tv/rhymes-with-pip', area: 'Watch & Listen', name: 'Rhymes with Pip', href: 'tv/rhymes-with-pip.html', video: true,
      home: 'Rhyme game in the car: say a word and take turns finding words that rhyme with it.' },
    { id: 'tv/luna-little-cloud', area: 'Watch & Listen', name: 'Luna the Little Cloud', href: 'tv/luna-little-cloud.html', video: true,
      home: 'Ask "How did Luna help the flower?" Then find one small way your child can help someone today.' },
    { id: 'tv/sound-parade', area: 'Watch & Listen', name: 'Sound Parade', href: 'tv/sound-parade.html', video: true,
      home: 'Take turns making an animal sound and guessing the animal.' }
  ];

  function lessonById(id) {
    for (var i = 0; i < CATALOG.length; i += 1) if (CATALOG[i].id === id) return CATALOG[i];
    return null;
  }

  // ---------- Learning paths and Today's Plan ----------
  // Where each path starts for a child's age (step numbers). The path then
  // moves on as each step is going well, whatever the starting point.
  var PATH_START = { 3: { reading: 1, math: 1 }, 4: { reading: 1, math: 1 }, 5: { reading: 2, math: 2 }, 6: { reading: 3, math: 3 } };
  // The third activity of the day rotates through videos and feelings.
  var PLAN_EXTRAS = ['tv/abc-with-pip', 'emotions/feelings-quiz', 'tv/count-with-pip', 'color/balloon-pop', 'tv/sound-parade',
    'tv/colors-with-pip', 'tv/luna-little-cloud', 'tv/shapes-with-pip', 'tv/feelings-with-pip', 'tv/weather-with-pip',
    'tv/days-with-pip', 'tv/rhymes-with-pip',
    'emotions/calm-corner', 'tv/animated-alphabet', 'tv/counting-rainbow'];

  function pathSteps(path) {
    return CATALOG.filter(function(l) { return l.path === path && l.tracked; })
      .sort(function(a, b) { return a.step - b.step; });
  }

  // A step is going well when the child knows some items and is practising none.
  function stepGoingWell(lessonId, profileId) {
    if (!global.SkillTracker) return false;
    var items = global.SkillTracker.summary(lessonId, profileId);
    var known = 0;
    for (var i = 0; i < items.length; i += 1) {
      if (items[i].status === 'practising') return false;
      if (items[i].status === 'known') known += 1;
    }
    return known > 0;
  }

  function nextStep(path, profileId) {
    var d = load();
    var p = findProfile(d, profileId || d.active) || d.profiles[0];
    var start = (PATH_START[p.age] || PATH_START[4])[path] || 1;
    var steps = pathSteps(path);
    for (var i = 0; i < steps.length; i += 1) {
      if (steps[i].step < start) continue;
      if (!stepGoingWell(steps[i].id, p.id)) return steps[i];
    }
    return steps[steps.length - 1];
  }

  function dayNumber() {
    var now = new Date();
    return Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
  }

  // Today's plan stays the same all day: next reading step, next math step,
  // and one video or feelings activity.
  function todayPlan(profileId) {
    var d = load();
    var pid = profileId || d.active;
    d.plans = d.plans || {};
    var plan = d.plans[pid];
    if (!plan || plan.date !== today()) {
      var idx = d.profiles.map(function(x) { return x.id; }).indexOf(pid);
      plan = {
        date: today(),
        items: [nextStep('reading', pid).id, nextStep('math', pid).id, PLAN_EXTRAS[(dayNumber() + Math.max(idx, 0)) % PLAN_EXTRAS.length]],
        done: {}
      };
      d.plans[pid] = plan;
      save(d);
    }
    return plan;
  }

  function planIfMade() {
    var d = load();
    var plan = d.plans && d.plans[d.active];
    return plan && plan.date === today() ? plan : null;
  }

  function markDone(lessonId) {
    var d = load();
    var plan = d.plans && d.plans[d.active];
    if (!plan || plan.date !== today() || plan.items.indexOf(lessonId) === -1) return false;
    plan.done[lessonId] = true;
    save(d);
    return true;
  }

  function lessonIdFromPath() {
    var parts = global.location.pathname.split('/').filter(Boolean);
    var file = (parts.pop() || 'index').replace(/\.html?$/i, '');
    var folder = parts.pop() || '';
    return folder ? folder + '/' + file : file;
  }

  // Pages opened from Today's Plan carry ?plan=1 so they can lead back to it.
  function inPlan() { return /[?&]plan=1\b/.test(global.location.search); }

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
    '.profile-chip span{font-size:2rem;line-height:1;}',
    '.esea-wiz{max-width:460px;text-align:center;max-height:calc(100vh - 32px);overflow:auto;}',
    '.esea-wiz .esea-step{font-size:.85rem;font-weight:800;color:#4a6067;margin-bottom:6px;}',
    '.esea-wiz h3{margin:14px 0 8px;font-size:1.15rem;color:#17323a;}',
    '.esea-choices{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;margin-bottom:12px;}',
    '.esea-choice{min-height:52px;border:3px solid rgba(23,50,58,.14);border-radius:14px;background:#fff;font-family:inherit;font-weight:800;font-size:1.05rem;cursor:pointer;color:#17323a;padding:8px;}',
    '.esea-choice small{display:block;font-size:.75rem;color:#1c6b46;}',
    '.esea-choice.on{border-color:#245f73;background:#fff3c7;}',
    '.esea-input{width:100%;min-height:52px;border:2px solid rgba(23,50,58,.2);border-radius:12px;font:inherit;font-size:1.15rem;padding:10px 12px;margin-bottom:12px;box-sizing:border-box;}',
    '.esea-note{font-size:.92rem !important;color:#4a6067;}',
    '.esea-row{display:flex;gap:10px;justify-content:space-between;align-items:center;margin-top:8px;}',
    '.esea-row .esea-btn{flex:1;}',
    '.esea-avatars.small{grid-template-columns:repeat(5,1fr);gap:6px;}',
    '.esea-avatars.small .esea-avatar{padding:6px 0;}',
    '.esea-avatars.small .esea-avatar span{font-size:2rem;}'
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
    speakIn(text, currentLang());
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
      '<h2>' + word('who') + '</h2>',
      '<div class="esea-avatars">',
      data.profiles.map(function(p) {
        return '<button type="button" class="esea-avatar' + (p.id === data.active ? ' on' : '') + '" data-id="' + p.id + '">' +
          '<span aria-hidden="true">' + p.avatar + '</span>' + escapeHtml(p.name) + '</button>';
      }).join(''),
      '</div>',
      '<p style="font-size:.9rem;margin:0">' + word('grownupsAdd') + '</p>'
    ].join(''));
    speak(word('who'));
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
      speak(word('hi', p.name));
      overlay.remove();
      if (onDone) onDone(p);
    });
  }

  // ---------- First-run setup for grown-ups ----------
  function setupWizard(onDone) {
    var d = load();
    var p = findProfile(d, d.active);
    var answers = {
      name: p.name === 'My child' ? '' : p.name,
      avatar: p.avatar,
      age: p.age || 4,
      limit: d.limitMinutes || (p.age === 3 ? 15 : 20)
    };
    var startLang = currentLang();
    var step = 0;
    var STEPS = 4;
    ensureStyle();
    var overlay = doc.createElement('div');
    overlay.className = 'esea-overlay';
    var box = doc.createElement('div');
    box.className = 'esea-modal esea-wiz';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    overlay.appendChild(box);
    doc.body.appendChild(overlay);

    function childName() { return answers.name || word('yourChild'); }
    function choice(value, label, on, extra) {
      return '<button type="button" class="esea-choice' + (on ? ' on' : '') + '" data-v="' + value + '">' + label + (extra ? '<small>' + extra + '</small>' : '') + '</button>';
    }
    function nav(nextLabel) {
      return '<div class="esea-row">' +
        (step > 0 ? '<button type="button" class="esea-btn light" data-act="back">' + word('back') + '</button>' : '') +
        '<button type="button" class="esea-btn" data-act="next">' + (nextLabel || word('next')) + '</button></div>' +
        (step < STEPS ? '<button type="button" class="esea-btn link" data-act="skip">' + word('skip') + '</button>' : '');
    }
    function render() {
      var html = step < STEPS ? '<div class="esea-step">' + (step + 1) + ' / ' + STEPS + '</div>' : '';
      if (step === 0) {
        html += '<h2>' + word('setupTitle') + '</h2><p>' + word('setupIntro') + '</p><h3>' + word('setupLang') + '</h3><div class="esea-choices" data-field="lang">' +
          Object.keys(LANGUAGES).map(function(code) { return choice(code, LANGUAGES[code].name.split(' (')[0], code === currentLang()); }).join('') + '</div>' + nav();
      } else if (step === 1) {
        html += '<h2>' + word('setupName') + '</h2><input class="esea-input" id="eseaName" maxlength="20" autocomplete="off" placeholder="' + word('setupNamePh') + '" value="' + escapeHtml(answers.name) + '">' +
          '<h3>' + word('setupAnimal') + '</h3><div class="esea-avatars small" data-field="avatar">' +
          AVATARS.map(function(a) { return '<button type="button" class="esea-avatar' + (a === answers.avatar ? ' on' : '') + '" data-v="' + a + '"><span>' + a + '</span></button>'; }).join('') + '</div>' + nav();
      } else if (step === 2) {
        html += '<h2>' + word('setupAge', escapeHtml(childName())) + '</h2><div class="esea-choices" data-field="age">' +
          [3, 4, 5, 6].map(function(n) { return choice(n, word('years', n), n === answers.age); }).join('') + '</div><p class="esea-note">' + word('setupAgeNote') + '</p>' + nav();
      } else if (step === 3) {
        var rec = answers.age === 3 ? 15 : 20;
        html += '<h2>' + word('setupTime') + '</h2><div class="esea-choices" data-field="limit">' +
          [15, 20, 30, 0].map(function(n) { return choice(n, n ? word('minutes', n) : word('noLimit'), n === answers.limit, n === rec ? word('recommended') : ''); }).join('') +
          '</div><p class="esea-note">' + word('setupTimeNote') + '</p>' + nav();
      } else {
        html += '<div class="esea-break" aria-hidden="true">' + answers.avatar + '</div><h2>' + word('setupDone') + '</h2><p>' + word('setupDoneText', escapeHtml(childName())) + '</p>' +
          '<button type="button" class="esea-btn" data-act="finish" style="width:100%">' + word('start') + '</button>';
      }
      box.innerHTML = html;
      var input = box.querySelector('#eseaName');
      if (input) {
        input.addEventListener('input', function() { answers.name = input.value.trim(); });
        setTimeout(function() { input.focus(); }, 50);
      }
    }
    function saveAnswers() {
      var data = load();
      var prof = findProfile(data, data.active);
      if (answers.name) prof.name = answers.name;
      prof.avatar = answers.avatar;
      prof.age = answers.age;
      data.limitMinutes = answers.limit;
      data.setupDone = true;
      save(data);
    }
    function close() {
      overlay.remove();
      if (onDone) onDone({ languageChanged: currentLang() !== startLang });
    }
    box.addEventListener('click', function(e) {
      var pick = e.target.closest('[data-v]');
      if (pick) {
        var field = pick.parentNode.getAttribute('data-field');
        var v = pick.getAttribute('data-v');
        if (field === 'lang') {
          var data = load();
          data.language = v;
          save(data);
        } else if (field === 'avatar') answers.avatar = v;
        else answers[field] = Number(v);
        render();
        return;
      }
      var act = e.target.closest('[data-act]');
      if (!act) return;
      var a = act.getAttribute('data-act');
      if (a === 'next') { step += 1; if (step === STEPS) saveAnswers(); render(); }
      else if (a === 'back') { step -= 1; render(); }
      else if (a === 'skip') { var data2 = load(); data2.setupDone = true; save(data2); close(); }
      else if (a === 'finish') close();
    });
    render();
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
    if (global.ESEASpeech) global.ESEASpeech.stop();
    var name = ESEAFamily.activeProfile().name;
    var overlay = openModal([
      '<div class="esea-break" aria-hidden="true">🌙</div>',
      '<h2>' + word('breakTitle') + '</h2>',
      '<p>' + word('breakText', escapeHtml(name)) + '</p>',
      '<button type="button" class="esea-btn link" data-grownup>' + word('grownups') + '</button>'
    ].join(''));
    setTimeout(function() { speak(word('breakSay')); }, 50);
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

  // ---------- Offline + install ----------
  var installPrompt = null;
  global.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    installPrompt = e;
    doc.dispatchEvent(new Event('esea-installable'));
  });
  if ('serviceWorker' in global.navigator && /^https?:$/.test(global.location.protocol)) {
    global.addEventListener('load', function() {
      global.navigator.serviceWorker.register(ROOT + 'service-worker.js').catch(function() {});
    });
  }

  // ---------- Public API ----------
  var ESEAFamily = {
    root: ROOT,
    avatars: AVATARS,
    catalog: CATALOG,
    lessonById: lessonById,

    data: load,
    save: save,
    word: word,

    // Learning paths and Today's Plan
    pathSteps: pathSteps,
    nextStep: nextStep,
    stepGoingWell: stepGoingWell,
    todayPlan: todayPlan,
    planIfMade: planIfMade,
    markDone: markDone,
    inPlan: inPlan,
    lessonIdFromPath: lessonIdFromPath,
    setupWizard: setupWizard,
    /**
     * Call when an activity is finished: ticks it off today's plan and, if the
     * page was opened from the plan, returns a "Back to today's plan" link to
     * show (otherwise null).
     */
    finished: function(lessonId, className) {
      markDone(lessonId || lessonIdFromPath());
      if (!inPlan()) return null;
      var a = doc.createElement('a');
      a.href = ROOT + 'today.html';
      a.className = className || 'lesson-action';
      a.textContent = word('backToPlan');
      return a;
    },
    setAge: function(id, age) {
      var d = load();
      var p = findProfile(d, id);
      if (p) { p.age = Number(age) || undefined; save(d); }
    },

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

    languages: LANGUAGES,
    /** The language grown-ups chose for practice ('en', 'es' or 'fr'). */
    lang: currentLang,
    setLanguage: function(lang) {
      var d = load();
      d.language = LANGUAGES[lang] ? lang : 'en';
      save(d);
    },
    /** The chosen language if this lesson supports it, otherwise English. */
    lessonLang: function(supported) {
      var lang = currentLang();
      return (supported || ['en']).indexOf(lang) !== -1 ? lang : 'en';
    },
    /** Speak in the chosen practice language (or opts.lang). */
    speak: function(text, opts) {
      opts = opts || {};
      speakIn(text, opts.lang || currentLang(), opts);
    },

    /** Offer to install the app (Chrome/Edge/Android). Returns false if not available. */
    canInstall: function() { return Boolean(installPrompt); },
    install: function() {
      if (!installPrompt) return false;
      installPrompt.prompt();
      installPrompt = null;
      return true;
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
    if (doc.body && doc.body.getAttribute('data-page') === 'home' && !load().setupDone) {
      setupWizard(function(result) {
        if (result.languageChanged) global.location.reload();
        else { renderChip(); doc.dispatchEvent(new Event('esea-setup-done')); }
      });
    }
  });
})(window);
