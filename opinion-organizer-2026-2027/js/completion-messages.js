// === completion-messages.js ===

function getCompletionNextStep(stepKey) {
  switch (stepKey) {
    case 'evidenceFirst':
      return 'thesis';

    case 'thesis':
      return isEvidenceFirst ? 'intro' : 'evidence';

    case 'evidence':
      return 'intro';

    case 'intro':
      return 'bp1';

    case 'bp1':
      return selectedBodyCount === 1 ? 'conclusion' : 'bp2';

    case 'bp2':
      return selectedBodyCount === 2 ? 'conclusion' : 'bp3';

    case 'bp3':
      return 'conclusion';

    case 'conclusion':
      return 'final';

    case 'final':
      return null;

    default:
      return null;
  }
}

function getStepDisplayName(stepKey) {
  const labels = {
    thesis: 'your thesis sentence',
    evidence: 'your evidence section',
    intro: 'your introduction',
    bp1: 'Body Paragraph 1',
    bp2: 'Body Paragraph 2',
    bp3: 'Body Paragraph 3',
    conclusion: 'your conclusion',
    final: 'your final essay'
  };

  return labels[stepKey] || 'the next section';
}

function getCompletionMessageContent(stepKey) {
  const nextStep = getCompletionNextStep(stepKey);
  const nextLabel = nextStep ? getStepDisplayName(nextStep) : '';

  const messages = {
    evidenceFirst: {
      title: '📚 Great Job!',
      body1: 'You found strong quotes and matched them to reasons that support your opinion.',
      body2: `Next, you’ll turn those ideas into ${nextLabel}.`
    },
    thesis: {
      title: '✨ Great Job! ✨',
      body1: 'You finished your thesis sentence and built a clear roadmap for your opinion writing.',
      body2: isEvidenceFirst
        ? `Next, you’ll use your planning to build ${nextLabel}.`
        : `Next, you’ll gather direct quotes in ${nextLabel}.`
    },
    evidence: {
      title: '🔍 Evidence Gathered! 🔍',
      body1: 'You found strong direct quotations that support your reasons.',
      body2: `Next, you’ll use those ideas in ${nextLabel}.`
    },
    intro: {
      title: '🎉 Excellent Introduction! 🎉',
      body1: 'You created a strong opening that introduces your topic and prepares the reader for your opinion writing.',
      body2: `Next up: ${nextLabel}.`
    },
    bp1: {
      title: '💪 Body Paragraph 1 Complete! 💪',
      body1: 'You explained your first reason and supported it with evidence.',
      body2: `Next up: ${nextLabel}.`
    },
    bp2: {
      title: '📝 Body Paragraph 2 Complete! 📝',
      body1: 'You added another strong reason with evidence and explanation.',
      body2: `Next up: ${nextLabel}.`
    },
    bp3: {
      title: '🧠 Body Paragraph 3 Complete! 🧠',
      body1: 'You supported your final reason with evidence and explanation.',
      body2: `Next up: ${nextLabel}.`
    },
    conclusion: {
      title: '✨💪 Conclusion Done! 💪✨',
      body1: 'You wrapped up your opinion and gave your reader something to remember.',
      body2: `Now it is time to build ${nextLabel}.`
    },
    final: {
      title: '🏁🏁 You Did It! 🏁🏁',
      body1: 'You’ve written a complete, organized, and thoughtful opinion piece.',
      body2: '<strong>Go submit your assignment now!</strong> 🎊'
    }
  };

  return messages[stepKey] || {
    title: '✅ Nice work!',
    body1: 'You completed this section.',
    body2: nextStep ? `Next up: ${nextLabel}.` : ''
  };
}

function renderCompletionMessage(messageId, stepKey) {
  const message = document.getElementById(messageId);
  if (!message) return;

  const content = getCompletionMessageContent(stepKey);

  message.innerHTML = `
    <h2>${content.title}</h2>
    <p>${content.body1}</p>
    ${content.body2 ? `<p>${content.body2}</p>` : ''}
  `;
}