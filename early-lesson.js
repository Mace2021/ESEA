(function() {
  var config = window.EarlyLesson;
  if (!config) return;

  var root = document.getElementById('lessonRoot');
  var state = {
    roundIndex: 0,
    score: 0,
    answered: false,
    misses: 0,
    requeued: {},
    timers: []
  };

  // Short sessions: young children focus best for a handful of questions.
  // Questions are chosen from what this child still finds hard (SkillTracker),
  // and never in a fixed order a child could simply memorise.
  var allRounds = (config.rounds || []).slice();
  var maxRounds = config.maxRounds || 8;
  var MAX_REQUEUE = 3;
  var lessonId = config.id || (window.SkillTracker ? SkillTracker.lessonId() : location.pathname);

  function pickRounds() {
    if (config.keepOrder) {
      config.rounds = allRounds.slice(0, maxRounds);
    } else if (window.SkillTracker) {
      config.rounds = SkillTracker.choose(lessonId, allRounds, maxRounds);
    } else {
      config.rounds = shuffle(allRounds).slice(0, maxRounds);
    }
  }

  // speak() interrupts whatever is being said; queue: true waits its turn.
  function speak(text, queue) {
    if (!text || !window.speechSynthesis) return;
    if (!queue) window.speechSynthesis.cancel();
    var msg = new SpeechSynthesisUtterance(text);
    msg.rate = 0.9;
    msg.pitch = 1.05;
    window.speechSynthesis.speak(msg);
  }

  function later(fn, ms) {
    state.timers.push(setTimeout(fn, ms));
  }

  function clearTimers() {
    state.timers.forEach(clearTimeout);
    state.timers = [];
  }

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function shuffle(items) {
    var copy = items.slice();
    for (var i = copy.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  function imageHtml(src, alt, className) {
    if (!src) return '';
    return '<img class="' + className + '" src="' + src + '" alt="' + (alt || '') + '">';
  }

  function visualHtml(item, target) {
    var imgClass = target ? 'target-image' : 'card-image';
    if (item.image) return imageHtml(item.image, item.alt || item.label, imgClass);
    if (item.emoji) return '<span class="card-emoji" aria-hidden="true">' + item.emoji + '</span>';
    if (item.symbol) return '<span class="card-symbol">' + item.symbol + '</span>';
    if (item.text) return '<span class="target-text">' + item.text + '</span>';
    if (item.dots) {
      var dots = '';
      for (var i = 0; i < item.dots; i += 1) dots += '<span class="dot"></span>';
      return '<div class="dot-cloud" aria-label="' + item.dots + ' dots">' + dots + '</div>';
    }
    if (item.countImage) {
      var pics = '';
      for (var p = 0; p < item.count; p += 1) {
        pics += imageHtml(item.countImage, item.alt || item.label, 'cloud-image');
      }
      return '<div class="picture-cloud" aria-label="' + item.count + ' pictures">' + pics + '</div>';
    }
    return '';
  }

  function renderIntro() {
    return [
      '<section class="lesson-intro">',
      '<h2>' + config.title + '</h2>',
      '<p>' + config.instructions + '</p>',
      '</section>'
    ].join('');
  }

  function renderExplore() {
    var html = renderIntro();
    config.sections.forEach(function(section) {
      html += '<h3 class="section-title">' + section.title + '</h3>';
      html += '<div class="lesson-grid ' + (section.compact ? 'compact' : '') + '">';
      section.items.forEach(function(item) {
        html += [
          '<button type="button" class="learn-card" data-speak="' + (item.speak || item.label) + '">',
          visualHtml(item, false),
          '<span class="card-title">' + item.label + '</span>',
          item.note ? '<span class="card-note">' + item.note + '</span>' : '',
          '</button>'
        ].join('');
      });
      html += '</div>';
    });
    html += '<div class="feedback" id="lessonFeedback" role="status" aria-live="polite"></div>';
    root.innerHTML = html;
    Array.prototype.slice.call(root.querySelectorAll('.learn-card')).forEach(function(card) {
      card.addEventListener('click', function() {
        var text = card.getAttribute('data-speak');
        speak(text);
        var feedback = document.getElementById('lessonFeedback');
        feedback.textContent = text;
        feedback.className = 'feedback good';
      });
    });
  }

  var NUMBER_WORDS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
  var PRAISE_FIRST = ['Yes!', 'You got it!', 'Great job!', 'That is right!', 'Super!', 'Well done!'];
  var PRAISE_RETRY = ['You did it!', 'Yes, you found it!', 'Good trying!', 'There it is!'];

  function progressPercent() {
    var total = config.rounds.length;
    var completed = Math.min(state.roundIndex + (state.answered ? 1 : 0), total);
    return total ? Math.round((completed / total) * 100) : 0;
  }

  function roundSpeech(round) {
    return round.speak || round.prompt;
  }

  function correctOption(round) {
    for (var i = 0; i < round.options.length; i += 1) {
      if (round.options[i].value === round.answer) return round.options[i];
    }
    return { label: round.answer };
  }

  function choiceButtons() {
    return Array.prototype.slice.call(document.querySelectorAll('.choice-card'));
  }

  function renderQuiz() {
    clearTimers();
    var round = config.rounds[state.roundIndex];
    var choices = shuffle(round.options);
    state.misses = 0;
    root.innerHTML = [
      renderIntro(),
      '<div class="quiz-top">',
      '<div class="quiz-progress"><span class="pill" id="roundPill"></span><span class="pill" id="scorePill"></span></div>',
      '<div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="progress-fill" id="progressFill"></div></div>',
      '</div>',
      '<div class="quiz-prompt">' + round.prompt +
        ' <button type="button" class="hear-again" id="hearAgain" aria-label="Hear the question again">&#128264;</button></div>',
      '<div class="target-box" id="targetBox">' + visualHtml(round.target, true) + '</div>',
      '<div class="choice-grid" id="choiceGrid"></div>',
      '<div class="feedback" id="lessonFeedback" role="status" aria-live="polite"></div>',
      '<div class="actions"><button type="button" class="lesson-action" id="nextButton" disabled>Next</button><button type="button" class="lesson-action secondary" id="newButton">New Set</button></div>'
    ].join('');

    var grid = document.getElementById('choiceGrid');
    choices.forEach(function(option) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'choice-card';
      button.dataset.value = option.value;
      button.setAttribute('aria-label', option.label);
      button.innerHTML = [
        visualHtml(option, false),
        '<span class="card-title">' + option.label + '</span>',
        option.note ? '<span class="card-note">' + option.note + '</span>' : ''
      ].join('');
      button.addEventListener('click', handleAnswer);
      grid.appendChild(button);
    });

    document.getElementById('nextButton').addEventListener('click', nextRound);
    document.getElementById('newButton').addEventListener('click', restartQuiz);
    document.getElementById('hearAgain').addEventListener('click', function() {
      speak(roundSpeech(round));
    });
    updateQuizProgress();
    speak(roundSpeech(round));
  }

  function updateQuizProgress() {
    document.getElementById('roundPill').textContent = (state.roundIndex + 1) + ' of ' + config.rounds.length;
    document.getElementById('scorePill').textContent = '⭐ ' + state.score;
    document.getElementById('scorePill').setAttribute('aria-label', state.score + ' stars');
    var percent = progressPercent();
    document.getElementById('progressFill').style.width = percent + '%';
    document.querySelector('.progress-track').setAttribute('aria-valuenow', String(percent));
  }

  function setFeedback(text, tone) {
    var feedback = document.getElementById('lessonFeedback');
    feedback.textContent = text;
    feedback.className = 'feedback ' + tone;
  }

  function isCountingRound(round) {
    return Boolean(round.target && (round.target.dots || round.target.countImage));
  }

  // Hint for counting: point at each object in turn and count it aloud.
  function countAlong(round) {
    var items = Array.prototype.slice.call(document.querySelectorAll('#targetBox .dot, #targetBox .cloud-image'));
    var buttons = choiceButtons();
    buttons.forEach(function(b) { b.classList.add('waiting'); });
    setFeedback('Let’s count together.', 'try');
    speak('Let’s count together.');
    items.forEach(function(item, i) {
      later(function() {
        item.classList.add('counted');
        var word = NUMBER_WORDS[i] || String(i + 1);
        setFeedback(String(i + 1), 'try');
        speak(word, true);
      }, 900 + i * 900);
    });
    later(function() {
      buttons.forEach(function(b) { b.classList.remove('waiting'); });
      setFeedback('How many?', 'try');
      speak(roundSpeech(round), true);
    }, 900 + items.length * 900 + 400);
  }

  // Hint for other questions: take one more wrong choice away.
  function narrowChoices(round) {
    var remaining = choiceButtons().filter(function(b) {
      return !b.disabled && b.dataset.value !== round.answer;
    });
    if (remaining.length > 1) {
      var fade = pick(remaining);
      fade.disabled = true;
      fade.classList.add('faded');
    }
    var hint = round.hint || ('Look again. ' + roundSpeech(round));
    setFeedback('Look again.', 'try');
    speak(hint);
  }

  function showAnswer(round) {
    var label = correctOption(round).label;
    choiceButtons().forEach(function(b) {
      if (b.dataset.value === round.answer) b.classList.add('reveal');
    });
    setFeedback('This one! Tap ' + label + '.', 'try');
    speak('This one is ' + label + '. Tap ' + label + '.');
  }

  // Bring a missed item back once more near the end of this session.
  function requeue(round) {
    var key = String(round.answer);
    if (state.requeued[key] || Object.keys(state.requeued).length >= MAX_REQUEUE) return;
    state.requeued[key] = true;
    config.rounds.push(round);
  }

  function handleAnswer(event) {
    if (state.answered) return;
    var round = config.rounds[state.roundIndex];
    var button = event.currentTarget;
    if (button.classList.contains('waiting')) return;

    if (button.dataset.value === round.answer) {
      var firstTry = state.misses === 0;
      state.answered = true;
      state.score += 1;
      button.classList.remove('reveal');
      button.classList.add('correct');
      choiceButtons().forEach(function(b) { b.disabled = true; });
      if (window.SkillTracker) SkillTracker.record(lessonId, String(round.answer), firstTry);
      var praise = pick(firstTry ? PRAISE_FIRST : PRAISE_RETRY);
      setFeedback(praise, 'good');
      speak(praise + ' ' + correctOption(round).label + '.');
      document.getElementById('nextButton').disabled = false;
      // Move on by itself, so children who cannot read yet are never stuck.
      later(nextRound, 2200);
    } else {
      state.misses += 1;
      button.classList.add('incorrect');
      button.disabled = true;
      if (state.misses === 1) {
        requeue(round);
        if (isCountingRound(round)) countAlong(round);
        else narrowChoices(round);
      } else {
        showAnswer(round);
      }
    }
    updateQuizProgress();
  }

  function nextRound() {
    clearTimers();
    if (state.roundIndex >= config.rounds.length - 1) {
      renderDone();
      return;
    }
    state.roundIndex += 1;
    state.answered = false;
    renderQuiz();
  }

  function homeIdeaHtml() {
    var idea = window.ESEAFamily ? ESEAFamily.homeIdea(lessonId) : '';
    return idea ? '<div class="home-idea"><strong>Grown-ups, try this at home:</strong> ' + idea + '</div>' : '';
  }

  function renderDone() {
    var stars = '';
    for (var i = 0; i < state.score; i += 1) stars += '⭐';
    root.innerHTML = [
      '<section class="done-screen" aria-live="polite">',
      '<div class="done-stars" aria-label="' + state.score + ' stars">' + stars + '</div>',
      '<h2>All done!</h2>',
      '<p>Great learning today. Come back tomorrow to practise again.</p>',
      homeIdeaHtml(),
      '<div class="actions">',
      '<button type="button" class="lesson-action" id="againButton">Play Again</button>',
      '<a class="lesson-action secondary" href="../index.html">Home</a>',
      '</div>',
      '</section>'
    ].join('');
    document.getElementById('againButton').addEventListener('click', restartQuiz);
    speak('All done! Great learning today.');
  }

  function restartQuiz() {
    clearTimers();
    pickRounds();
    state.roundIndex = 0;
    state.score = 0;
    state.answered = false;
    state.requeued = {};
    renderQuiz();
  }

  if (config.type === 'quiz') {
    restartQuiz();
  } else {
    renderExplore();
  }
})();
