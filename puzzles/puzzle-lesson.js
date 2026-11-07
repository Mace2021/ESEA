(function() {
  var config = window.PuzzleLessonConfig;
  if (!config) return;

  var state = {
    roundIndex: 0,
    score: 0,
    answered: false,
    pairCards: [],
    revealed: [],
    matched: {},
    misses: 0,
    requeued: {},
    advanceTimer: null
  };
  var lessonId = config.id || (window.SkillTracker ? SkillTracker.lessonId() : location.pathname);
  var PRAISE = ['Yes!', 'You got it!', 'Great job!', 'Well done!', 'Super!'];

  // All speech goes through speech.js: one calm, natural voice with pauses.
  function speak(text, onend) {
    if (window.ESEASpeech) {
      ESEASpeech.speak(text, { lang: 'en', onend: onend });
      return;
    }
    if (window.speechSynthesis && text) {
      window.speechSynthesis.cancel();
      var msg = new SpeechSynthesisUtterance(text);
      msg.rate = 0.85;
      window.speechSynthesis.speak(msg);
    }
    if (onend) setTimeout(onend, 900);
  }

  function itemKey(round) {
    return String(config.type === 'sort' ? (round.label || round.answer) : round.answer);
  }

  function promptText(round) {
    return config.type === 'sort' ? 'Where does the ' + round.label + ' go?' : (round.speak || round.prompt);
  }

  // Shuffle question order (and cap length) so each play is a fresh, short set.
  var allRounds = (config.rounds || []).slice();
  var maxRounds = config.maxRounds || 8;

  var title = document.getElementById('lessonTitle');
  var goal = document.getElementById('lessonGoal');
  var roundText = document.getElementById('roundText');
  var scoreText = document.getElementById('scoreText');
  var progressTrack = document.querySelector('.progress-track');
  var progressFill = document.getElementById('progressFill');
  var activityArea = document.getElementById('activityArea');
  var feedback = document.getElementById('feedback');
  var nextButton = document.getElementById('nextButton');
  var restartButton = document.getElementById('restartButton');
  var completeBox = document.getElementById('completeBox');
  var completeText = document.getElementById('completeText');

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

  function announce(message) {
    if (typeof A11y !== 'undefined' && A11y.announce) {
      A11y.announce(message);
    }
  }

  function setFeedback(message, tone) {
    feedback.textContent = message;
    feedback.className = 'feedback';
    if (tone) feedback.classList.add(tone);
  }

  function saveProgress(isComplete) {
    var key = 'esea_puzzle_lessons';
    var saved = {};
    try {
      saved = JSON.parse(localStorage.getItem(key)) || {};
    } catch (error) {
      saved = {};
    }
    saved[config.id] = {
      score: state.score,
      complete: Boolean(isComplete),
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(saved));
  }

  function getTotal() {
    return config.type === 'pairs' ? config.pairs.length : config.rounds.length;
  }

  function updateProgress() {
    var total = getTotal();
    var completed = config.type === 'pairs'
      ? Object.keys(state.matched).length
      : Math.min(state.roundIndex, total);

    if (config.type !== 'pairs' && state.answered) {
      completed = Math.min(state.roundIndex + 1, total);
    }

    var progress = total ? Math.round((completed / total) * 100) : 0;
    roundText.textContent = config.type === 'pairs'
      ? completed + ' of ' + total + ' pairs'
      : Math.min(state.roundIndex + 1, total) + ' of ' + total;
    scoreText.textContent = state.score + ' correct';
    progressFill.style.width = progress + '%';
    progressTrack.setAttribute('aria-valuenow', String(progress));
  }

  function renderRound() {
    var round = config.rounds[state.roundIndex];
    var options = config.type === 'sort' ? config.categories : round.options;

    completeBox.classList.remove('show');
    nextButton.disabled = true;
    nextButton.style.display = 'inline-flex';
    setFeedback('', '');
    state.misses = 0;
    clearTimeout(state.advanceTimer);

    if (config.type === 'sort') {
      activityArea.innerHTML = [
        '<div class="prompt">Where does this go?</div>',
        '<div class="target-display">',
        '<div class="sort-item"><span class="item-art" aria-hidden="true">' + round.art + '</span><span class="sort-label">' + round.label + '</span></div>',
        '</div>',
        '<div class="category-grid" id="choiceGrid"></div>'
      ].join('');
    } else {
      activityArea.innerHTML = [
        '<div class="prompt">' + round.prompt + '</div>',
        '<div class="target-display">' + round.target + '</div>',
        '<div class="choice-grid" id="choiceGrid"></div>'
      ].join('');
    }

    var choiceGrid = document.getElementById('choiceGrid');
    shuffle(options).forEach(function(option) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = config.type === 'sort' ? 'category-button' : 'choice-button';
      button.dataset.value = option.value;
      button.setAttribute('aria-label', option.label);
      button.innerHTML = '<span class="choice-art" aria-hidden="true">' + option.art + '</span><span>' + option.label + '</span>';
      button.addEventListener('click', handleChoice);
      choiceGrid.appendChild(button);
    });

    updateProgress();
    speak(promptText(round));
  }

  function choiceButtons() {
    return Array.prototype.slice.call(activityArea.querySelectorAll('#choiceGrid button'));
  }

  function labelFor(round) {
    var options = config.type === 'sort' ? config.categories : round.options;
    for (var i = 0; i < options.length; i += 1) {
      if (options[i].value === round.answer) return options[i].label;
    }
    return round.answer;
  }

  function handleChoice(event) {
    if (state.answered) return;

    var round = config.rounds[state.roundIndex];
    var selected = event.currentTarget.dataset.value;

    if (selected === round.answer) {
      var firstTry = state.misses === 0;
      state.score += 1;
      state.answered = true;
      event.currentTarget.classList.remove('reveal');
      event.currentTarget.classList.add('correct');
      choiceButtons().forEach(function(button) { button.disabled = true; });
      if (window.SkillTracker) SkillTracker.record(lessonId, itemKey(round), firstTry);
      var praise = PRAISE[Math.floor(Math.random() * PRAISE.length)];
      setFeedback(praise, 'good');
      var token = state.roundIndex;
      var advance = function() {
        if (state.roundIndex === token && state.answered) moveNext();
      };
      // Move on once the praise has been said (safety net if speech stalls).
      speak(praise + ' ' + labelFor(round) + '!', function() {
        clearTimeout(state.advanceTimer);
        state.advanceTimer = setTimeout(advance, 700);
      });
      nextButton.disabled = false;
      saveProgress(false);
      // Move on by itself so children who cannot read are never stuck.
      state.advanceTimer = setTimeout(advance, 7000);
    } else {
      state.misses += 1;
      event.currentTarget.classList.add('incorrect');
      event.currentTarget.disabled = true;
      if (state.misses === 1) {
        // Missed items come back once more later in this session.
        var key = itemKey(round);
        if (!state.requeued[key] && Object.keys(state.requeued).length < 3) {
          state.requeued[key] = true;
          config.rounds.push(round);
        }
        setFeedback('Look again.', 'try');
        speak('Hmm, not quite. Let\u2019s look again... ' + promptText(round));
      } else {
        choiceButtons().forEach(function(button) {
          if (button.dataset.value === round.answer) button.classList.add('reveal');
        });
        setFeedback('This one! Tap ' + labelFor(round) + '.', 'try');
        speak('Look, here it is... ' + labelFor(round) + '. Can you tap ' + labelFor(round) + '?');
      }
    }

    updateProgress();
  }

  function moveNext() {
    if (config.type === 'pairs') return;
    clearTimeout(state.advanceTimer);
    if (!state.answered) return;

    if (state.roundIndex >= config.rounds.length - 1) {
      finishLesson();
      return;
    }

    state.roundIndex += 1;
    state.answered = false;
    renderRound();
  }

  function finishLesson() {
    completeText.textContent = 'All done! Great learning today.';
    var idea = window.ESEAFamily ? ESEAFamily.homeIdea(lessonId) : '';
    var ideaBox = document.getElementById('homeIdea');
    if (idea && !ideaBox) {
      ideaBox = document.createElement('div');
      ideaBox.id = 'homeIdea';
      ideaBox.className = 'home-idea';
      completeBox.appendChild(ideaBox);
    }
    if (ideaBox) ideaBox.innerHTML = '<strong>Grown-ups, try this at home:</strong> ' + idea;
    speak('All done! You worked so hard today. Great job!');
    completeBox.classList.add('show');
    setFeedback('Lesson complete.', 'good');
    nextButton.disabled = true;
    saveProgress(true);
    updateProgress();
    announce('Lesson complete.');
  }

  function renderPairs() {
    completeBox.classList.remove('show');
    nextButton.style.display = 'none';
    setFeedback('', '');
    state.pairCards = shuffle(config.pairs.concat(config.pairs).map(function(card, index) {
      return {
        id: card.value + '-' + index,
        value: card.value,
        label: card.label,
        art: card.art
      };
    }));
    state.revealed = [];
    state.matched = {};
    state.score = 0;

    activityArea.innerHTML = [
      '<div class="prompt">Find two cards that match.</div>',
      '<div class="memory-grid" id="memoryGrid" aria-label="Find matching pairs"></div>'
    ].join('');

    drawMemoryCards();
  }

  function drawMemoryCards() {
    var memoryGrid = document.getElementById('memoryGrid');
    memoryGrid.innerHTML = '';
    state.pairCards.forEach(function(card, index) {
      var revealed = state.revealed.indexOf(index) !== -1 || state.matched[card.value];
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'memory-card';
      if (revealed) button.classList.add('revealed');
      if (state.matched[card.value]) button.classList.add('matched');
      button.dataset.index = String(index);
      button.dataset.value = card.value;
      button.disabled = Boolean(state.matched[card.value]) || state.revealed.length === 2;
      button.setAttribute('aria-label', revealed ? card.label : 'Hidden card');
      button.innerHTML = revealed
        ? '<span class="memory-art" aria-hidden="true">' + card.art + '</span>'
        : '<span class="memory-art" aria-hidden="true">?</span>';
      button.addEventListener('click', revealCard);
      memoryGrid.appendChild(button);
    });
    updateProgress();
  }

  function revealCard(event) {
    var index = Number(event.currentTarget.dataset.index);
    if (state.revealed.indexOf(index) !== -1) return;

    state.revealed.push(index);
    drawMemoryCards();

    if (state.revealed.length === 2) {
      var first = state.pairCards[state.revealed[0]];
      var second = state.pairCards[state.revealed[1]];
      if (first.value === second.value) {
        state.matched[first.value] = true;
        state.score += 1;
        state.revealed = [];
        setFeedback('You found a pair.', 'good');
        saveProgress(false);
        drawMemoryCards();
        if (Object.keys(state.matched).length === config.pairs.length) {
          finishLesson();
        }
      } else {
        setFeedback('Try another pair.', 'try');
        window.setTimeout(function() {
          state.revealed = [];
          drawMemoryCards();
        }, 850);
      }
    }
  }

  function restartLesson() {
    if (allRounds.length) {
      if (config.keepOrder) config.rounds = allRounds.slice(0, maxRounds);
      else if (window.SkillTracker) config.rounds = SkillTracker.choose(lessonId, allRounds, maxRounds, itemKey);
      else config.rounds = shuffle(allRounds).slice(0, maxRounds);
    }
    clearTimeout(state.advanceTimer);
    state.requeued = {};
    state.roundIndex = 0;
    state.score = 0;
    state.answered = false;
    state.revealed = [];
    state.matched = {};
    if (config.type === 'pairs') {
      renderPairs();
    } else {
      renderRound();
    }
  }

  title.textContent = config.title;
  goal.textContent = config.goal;
  nextButton.addEventListener('click', moveNext);
  restartButton.addEventListener('click', restartLesson);
  restartLesson();
})();
