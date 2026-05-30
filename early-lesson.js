(function() {
  var config = window.EarlyLesson;
  if (!config) return;

  var root = document.getElementById('lessonRoot');
  var state = {
    roundIndex: 0,
    score: 0,
    answered: false
  };

  function speak(text) {
    if (!text || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    var msg = new SpeechSynthesisUtterance(text);
    msg.rate = 0.9;
    msg.pitch = 1.05;
    window.speechSynthesis.speak(msg);
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

  function progressPercent() {
    var total = config.rounds.length;
    var completed = Math.min(state.roundIndex + (state.answered ? 1 : 0), total);
    return total ? Math.round((completed / total) * 100) : 0;
  }

  function renderQuiz() {
    var round = config.rounds[state.roundIndex];
    var choices = shuffle(round.options);
    root.innerHTML = [
      renderIntro(),
      '<div class="quiz-top">',
      '<div class="quiz-progress"><span class="pill" id="roundPill">' + (state.roundIndex + 1) + ' of ' + config.rounds.length + '</span><span class="pill" id="scorePill">' + state.score + ' correct</span></div>',
      '<div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + progressPercent() + '"><div class="progress-fill" id="progressFill" style="width:' + progressPercent() + '%"></div></div>',
      '</div>',
      '<div class="quiz-prompt">' + round.prompt + '</div>',
      '<div class="target-box">' + visualHtml(round.target, true) + '</div>',
      '<div class="choice-grid" id="choiceGrid"></div>',
      '<div class="feedback" id="lessonFeedback" role="status" aria-live="polite"></div>',
      '<div class="actions"><button type="button" class="lesson-action" id="nextButton" disabled>Next</button><button type="button" class="lesson-action secondary" id="newButton">New Question</button></div>',
      '<div class="complete-box" id="completeBox"><h3>Great work!</h3><p>You finished this lesson.</p></div>'
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
    speak(round.speak || round.prompt);
  }

  function updateQuizProgress() {
    document.getElementById('roundPill').textContent = (state.roundIndex + 1) + ' of ' + config.rounds.length;
    document.getElementById('scorePill').textContent = state.score + ' correct';
    var percent = progressPercent();
    document.getElementById('progressFill').style.width = percent + '%';
    document.querySelector('.progress-track').setAttribute('aria-valuenow', String(percent));
  }

  function handleAnswer(event) {
    if (state.answered) return;
    var round = config.rounds[state.roundIndex];
    var selected = event.currentTarget.dataset.value;
    var feedback = document.getElementById('lessonFeedback');
    if (selected === round.answer) {
      state.answered = true;
      state.score += 1;
      event.currentTarget.classList.add('correct');
      feedback.textContent = 'Yes. That is correct.';
      feedback.className = 'feedback good';
      speak('Yes. That is correct.');
      Array.prototype.slice.call(document.querySelectorAll('.choice-card')).forEach(function(button) {
        button.disabled = true;
      });
      document.getElementById('nextButton').disabled = false;
    } else {
      event.currentTarget.classList.add('incorrect');
      feedback.textContent = 'Try again.';
      feedback.className = 'feedback try';
      speak('Try again.');
    }
    updateQuizProgress();
  }

  function nextRound() {
    if (state.roundIndex >= config.rounds.length - 1) {
      document.getElementById('completeBox').classList.add('show');
      document.getElementById('nextButton').disabled = true;
      speak('Great work. Lesson complete.');
      return;
    }
    state.roundIndex += 1;
    state.answered = false;
    renderQuiz();
  }

  function restartQuiz() {
    state.roundIndex = 0;
    state.score = 0;
    state.answered = false;
    renderQuiz();
  }

  if (config.type === 'quiz') {
    renderQuiz();
  } else {
    renderExplore();
  }
})();
