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
    });
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

// Game Scoring System
const GameScoring = {
  save(data) {
    localStorage.setItem('esea_scoring', JSON.stringify(data));
  },

  load() {
    const saved = localStorage.getItem('esea_scoring');
    return saved ? JSON.parse(saved) : {
      totalPoints: 0,
      level: 1,
      badges: [],
      moduleStats: {},
      streak: 0,
      bestStreak: 0
    };
  },

  addPoints(moduleId, points, bonus = 0) {
    const scoring = this.load();
    scoring.totalPoints += (points + bonus);
    
    if (!scoring.moduleStats[moduleId]) {
      scoring.moduleStats[moduleId] = { points: 0, attempts: 0 };
    }
    scoring.moduleStats[moduleId].points += (points + bonus);
    scoring.moduleStats[moduleId].attempts += 1;
    
    // Update level based on points
    scoring.level = this.getLevel(scoring.totalPoints);
    
    // Check for new badges
    const newBadges = this.checkBadges(scoring.totalPoints);
    scoring.badges = [...new Set([...scoring.badges, ...newBadges])];
    
    this.save(scoring);
    return scoring;
  },

  getLevel(points) {
    if (points < 100) return 1;
    if (points < 300) return 2;
    if (points < 600) return 3;
    if (points < 1000) return 4;
    return 5;
  },

  getLevelName(level) {
    const names = ['Beginner', 'Explorer', 'Scholar', 'Master', 'Champion'];
    return names[level - 1] || 'Champion';
  },

  checkBadges(points) {
    const badges = [];
    if (points >= 50 && !this.load().badges.includes('first-steps')) badges.push('first-steps');
    if (points >= 100 && !this.load().badges.includes('century')) badges.push('century');
    if (points >= 500 && !this.load().badges.includes('scholar')) badges.push('scholar');
    if (points >= 1000 && !this.load().badges.includes('master')) badges.push('master');
    return badges;
  },

  awardPoints(moduleId, points, message) {
    const scoring = this.addPoints(moduleId, points);
    StreakTracker.recordSuccess();
    if (message) {
      A11y.announce(message);
    }
    return scoring;
  },

  reset() {
    localStorage.removeItem('esea_scoring');
  }
};

// Streak Tracker
const StreakTracker = {
  save(data) {
    localStorage.setItem('esea_streak', JSON.stringify(data));
  },

  load() {
    const saved = localStorage.getItem('esea_streak');
    return saved ? JSON.parse(saved) : { current: 0, best: 0, lastDate: null };
  },

  recordSuccess() {
    const streak = this.load();
    const today = new Date().toDateString();
    
    if (streak.lastDate !== today) {
      streak.current = 1;
      streak.lastDate = today;
    } else {
      streak.current += 1;
    }
    
    if (streak.current > streak.best) {
      streak.best = streak.current;
    }
    
    this.save(streak);
    return streak;
  },

  recordFailure() {
    const streak = this.load();
    streak.current = 0;
    this.save(streak);
    return streak;
  },

  reset() {
    localStorage.removeItem('esea_streak');
  }
};

// Speed Bonus Calculator
const SpeedBonus = {
  calculateBonus(timeSeconds) {
    if (timeSeconds <= 5) return 50;
    if (timeSeconds <= 10) return 30;
    if (timeSeconds <= 15) return 20;
    if (timeSeconds <= 20) return 10;
    return 0;
  },

  calculateAccuracyBonus(accuracy) {
    // accuracy as percentage (0-100)
    if (accuracy === 100) return 50;
    if (accuracy >= 80) return 30;
    if (accuracy >= 60) return 15;
    if (accuracy >= 40) return 5;
    return 0;
  }
};

// Initialize learning progress tracking
LearningProgress.init();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LearningProgress, GameUtils, A11y, GameScoring, StreakTracker, SpeedBonus };
}
