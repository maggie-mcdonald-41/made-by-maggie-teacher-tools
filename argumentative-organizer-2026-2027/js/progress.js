function updateProgressBar() {
  const ids = [
    'claim-box', 'reason1-box', 'thesis-box',
    'evidence1-box', 'hook-box', 'issue-box', 'intro-final',
    'bp1-evidence', 'bp1-explanation', 'bp1-final',
    'conclusion-transition', 'restate-thesis', 'call-to-action', 'conclusion-final',
    'essay-final'
  ];

  if (selectedBodyCount >= 2) {
    ids.push('reason2-box', 'evidence2-box', 'bp2-evidence', 'bp2-explanation', 'bp2-final');
  }
  if (selectedBodyCount === 3) {
    ids.push('reason3-box', 'evidence3-box', 'bp3-evidence', 'bp3-explanation', 'bp3-final');
  }

  const filled = ids.filter(id => document.getElementById(id)?.innerText.trim()).length;
  const percent = Math.round((filled / ids.length) * 100);

  const progressBar = document.getElementById('progress-bar');
  progressBar.style.width = `${percent}%`;

  if (percent >= 100) {
    progressBar.classList.add('complete');
    // Trigger celebration
    document.getElementById('progress-message').innerText = "🎉 You did it! 🎉";
  } else {
    progressBar.classList.remove('complete');
    document.getElementById('progress-message').innerText = '';
  }
}

function celebrateEssayCompletion() {
  const duration = 6000;
  const animationEnd = Date.now() + duration;
  const defaults = {
    startVelocity: 40,
    spread: 360,
    ticks: 100,
    zIndex: 9999,
    colors: ['#FF5D52', '#FFB800', '#05C1B8', '#0AD1CC', '#FF8F85', '#FFA69E']
  };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    confetti(Object.assign({}, defaults, {
      particleCount: 10,
      origin: {
        x: randomInRange(0.1, 0.9),
        y: Math.random() - 0.2
      }
    }));
  }, 100);
}

