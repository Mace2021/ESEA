(function() {
  var config = window.PuzzleLessonConfig;
  if (!config) return;

  var state = {
    roundIndex: 0,
    score: 0,
    answered: false,
    pairCards: [],
    revealed: [],
    matched: {}
  };

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
  }

  function handleChoice(event) {
    if (state.answered) return;

    var round = config.rounds[state.roundIndex];
    var selected = event.currentTarget.dataset.value;

    if (selected === round.answer) {
      state.score += 1;
      state.answered = true;
      event.currentTarget.classList.add('correct');
      Array.prototype.slice.call(activityArea.querySelectorAll('button')).forEach(function(button) {
        button.disabled = true;
      });
      setFeedback('Yes. That is correct.', 'good');
      nextButton.disabled = false;
      announce('Correct.');
      saveProgress(false);
    } else {
      event.currentTarget.classList.add('incorrect');
      setFeedback('Try again.', 'try');
      announce('Try again.');
    }

    updateProgress();
  }

  function moveNext() {
    if (config.type === 'pairs') return;

    if (state.roundIndex >= config.rounds.length - 1) {
      finishLesson();
      return;
    }

    state.roundIndex += 1;
    state.answered = false;
    renderRound();
  }

  function finishLesson() {
    completeText.textContent = 'You finished ' + config.title + ' with ' + state.score + ' correct.';
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
