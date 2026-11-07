/* ==========================================
   ESEA - Main JavaScript
   Interactive Learning Features
   ========================================== */

// Toggle dropdown menus
document.addEventListener('DOMContentLoaded', function() {
  const cards = document.querySelectorAll('.card');
  
  cards.forEach(card => {
    // Click handler for card (not on dropdown items)
    card.addEventListener('click', function(e) {
      // If clicking on a dropdown item (link), let it navigate naturally
      if (e.target.classList.contains('dropdown-item')) {
        return; // Allow default link behavior
      }
      
      // Prevent default only for card itself
      e.preventDefault();
      
      // Close other dropdowns
      cards.forEach(otherCard => {
        if (otherCard !== this) {
          otherCard.classList.remove('active');
        }
      });
      
      // Toggle current dropdown
      this.classList.toggle('active');
      if (this.classList.contains('active')) {
        var title = this.querySelector('.card-title');
        if (title) speakLabel(title.textContent + '. Pick a game.');
      }
    });
  });

  // Say each activity's name when a child points at it (mouse or keyboard),
  // so children who cannot read yet can still choose.
  document.querySelectorAll('.dropdown-item').forEach(function(item) {
    // Only the visible name, not the icon or step number.
    var label = Array.prototype.filter.call(item.childNodes, function(node) {
      return node.nodeType === 3;
    }).map(function(node) { return node.textContent; }).join('').trim();
    var say = function() { speakLabel(label); };
    item.addEventListener('mouseenter', say);
    item.addEventListener('focus', say);
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.card')) {
      cards.forEach(card => {
        card.classList.remove('active');
      });
    }
  });

  // Handle dropdown item clicks - ensure they navigate
  const dropdownItems = document.querySelectorAll('.dropdown-item');
  dropdownItems.forEach(item => {
    item.addEventListener('click', function(e) {
      // Let the link navigate naturally - don't prevent default
      const href = this.getAttribute('href');
      if (href) {
        // Navigate to the href after a small delay for smooth transition
        setTimeout(() => {
          window.location.href = href;
        }, 100);
        e.preventDefault();
      }
    });
  });

  // Make cards keyboard accessible
  cards.forEach(card => {
    card.setAttribute('tabindex', '0');
    card.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });
  });
});

// Speak a short label aloud (skipped where the browser has no speech).
function speakLabel(text) {
  if (!text || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  var msg = new SpeechSynthesisUtterance(text.replace(/&/g, 'and'));
  msg.rate = 0.95;
  msg.pitch = 1.1;
  window.speechSynthesis.speak(msg);
}

// Utility function to add click feedback
function addClickFeedback(element) {
  element.addEventListener('click', function() {
    this.style.transform = 'scale(0.95)';
    setTimeout(() => {
      this.style.transform = '';
    }, 100);
  });
}

// Progress tracking for learning modules
const LearningProgress = {
  init() {
    this.load();
  },

  save(moduleName, score, total) {
    const progress = this.load();
    progress[moduleName] = {
      score: score,
      total: total,
      percentage: Math.round((score / total) * 100),
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('esea_progress', JSON.stringify(progress));
  },

  load() {
    const saved = localStorage.getItem('esea_progress');
    return saved ? JSON.parse(saved) : {};
  },

  getScore(moduleName) {
    const progress = this.load();
    return progress[moduleName] || null;
  }
};

// Game utilities
const GameUtils = {
  // Show a celebration message
  celebrate() {
    const messages = [
      '🎉 Great Job!',
      '⭐ Awesome!',
      '🌟 Excellent!',
      '👏 Fantastic!',
      '💯 Perfect!',
      '🎊 Keep it up!'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  },

  // Shuffle an array
  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  // Get random item from array
  random(array) {
    return array[Math.floor(Math.random() * array.length)];
  },

  // Check if answer is correct
  isCorrect(answer, correct) {
    return String(answer).toLowerCase().trim() === String(correct).toLowerCase().trim();
  }
};

// Accessibility helpers
const A11y = {
  // Announce to screen readers
  announce(message, priority = 'polite') {
    const ariaLive = document.createElement('div');
    ariaLive.setAttribute('aria-live', priority);
    ariaLive.setAttribute('aria-atomic', 'true');
    ariaLive.className = 'sr-only';
    ariaLive.textContent = message;
    document.body.appendChild(ariaLive);
    
    setTimeout(() => ariaLive.remove(), 1000);
  },

  // Focus management
  focusElement(element) {
    element.focus();
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

// Initialize learning progress tracking
LearningProgress.init();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LearningProgress, GameUtils, A11y };
}
