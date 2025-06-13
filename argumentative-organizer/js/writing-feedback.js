// === writing-feedback.js ===

function removeQuotedText(text) {
  return text.replace(/(["“”])(?:(?=(\\?))\2.)*?\1/g, '');
}

function endsWithProperPunctuation(sentence) {
  const cleaned = sentence.trim().replace(/["'”]+$/, '');
  return /[.!?]$/.test(cleaned);
}

function startsWithCapital(sentence) {
  const cleaned = sentence.trim().replace(/^["'“”]+/, '');
  return /^[A-Z]/.test(cleaned);
}

function isWrappedInQuotes(text) {
  const trimmed = text.trim();
  return /^["“”].*["“”]$/.test(trimmed);
}
function highlightWritingIssues(text, targetId) {
  let highlighted = text;
  const cleanedText = removeQuotedText(text);

  const personalRegex = /\b(I|my|me|we|us|our|you|your)\b/gi;
  const contractionRegex = /\b\w+'(\w{1,2})\b/g;

  // Check for personal pronouns only in certain sections
  const applyPersonalCheck = ['thesis', 'essay-final', 'reason', 'explanation', 'conclusion-final', 'bp1-final', 'bp2-final', 'bp3-final'].some(id =>
    targetId.includes(id)
  );

  if (applyPersonalCheck) {
    highlighted = highlighted.replace(personalRegex, match => {
      if (cleanedText.includes(match)) {
        return `<mark title="Avoid first or second person: '${match}'">${match}</mark>`;
      }
      return match;
    });
  }

  // Contractions — always active
  highlighted = highlighted.replace(contractionRegex, (match, group) => {
    const commonContractions = [
      "it's", "he's", "she's", "that's", "what's", "who's", "where's", "there's", "let's"
    ];
    if (group === 's' && !commonContractions.includes(match.toLowerCase())) {
      return match;
    }
    if (cleanedText.includes(match)) {
      return `<mark title="Contraction detected: '${match}'">${match}</mark>`;
    }
    return match;
  });

  // Quotation check (evidence only)
  if (targetId.includes('evidence')) {
    if (!isWrappedInQuotes(text)) {
      highlighted = `<mark title="Missing quotation marks">⚠️ Add quotation marks</mark> ${text}`;
    }
  }
  

  // Common misspellings
  const commonMisspellings = {
    becuase: "because",
    definately: "definitely",
    alot: "a lot",
    seperately: "separately",
    recieve: "receive",
    thier: "their",
    arguement: "argument",
    goverment: "government"
  };

  Object.keys(commonMisspellings).forEach(misspelling => {
    const regex = new RegExp(`\\b${misspelling}\\b`, 'gi');
    highlighted = highlighted.replace(regex, match => {
      return `<mark title="Did you mean '${commonMisspellings[misspelling]}'?">${match}</mark>`;
    });
  });

// Sentence-level checks
const sentenceMatches = text.match(/[^.!?]+[.!?]+/g)?.filter(s =>
  s.trim().replace(/^["“”]+|["“”]+$/g, '').length > 0
);
if (sentenceMatches && sentenceMatches.length > 0) {
  const thesisText = document.getElementById('thesis-box')?.innerText.trim();
  const restatedText = document.getElementById('restate-thesis')?.innerText.trim();

  sentenceMatches.forEach(sentence => {
    const trimmed = sentence.trim();
    if (!trimmed) return;

    let fixed = trimmed;

    if (!startsWithCapital(trimmed)) {
      fixed = fixed.replace(/^\w/, match => `<mark title="Start sentence with a capital letter">${match}</mark>`);
    }
    
    const unquoted = trimmed.replace(/^["“”]+|["“”]+$/g, '');
    if (!endsWithProperPunctuation(unquoted)) {
      fixed += `<mark title="Add punctuation at the end of the sentence: . ! ?"> ⟵ missing punctuation</mark>`;
    }
    
    

    const isCopiedFromThesis =
    normalize(thesisText)?.length > 0 && normalize(trimmed).includes(normalize(thesisText)) ||
    normalize(restatedText)?.length > 0 && normalize(trimmed).includes(normalize(restatedText));
  
      const skipRunOnCheck = targetId.includes('thesis');
      if (!skipRunOnCheck && trimmed.split(/\s+/).length > 25 && !isCopiedFromThesis) {
      fixed = `<mark title="Possible run-on sentence — consider splitting into shorter sentences.">${fixed}</mark>`;
    }

    const safeTrimmed = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(safeTrimmed, 'g');
    highlighted = highlighted.replace(re, fixed);
      });
}



  // Additional structure/grammar checks
  if (/\bthey was\b/i.test(text)) {
    highlighted = highlighted.replace(/\bthey was\b/gi, match =>
      `<mark title="Use 'they were' instead of '${match}'">${match}</mark>`);
  }

  if (/\b(don't|doesn't|didn't)\s+\w+\s+no\b/i.test(text)) {
    highlighted = highlighted.replace(/\b(don't|doesn't|didn't)\s+\w+\s+no\b/gi, match =>
      `<mark title="Avoid double negatives like '${match}'">${match}</mark>`);
  }

  const confusedPairs = [
    { pattern: /\byour\s+welcome\b/i, message: "Did you mean 'you're welcome'?" },
    { pattern: /\byour\s+the\b/i, message: "Possible misuse: 'your' vs. 'you're'" },
    { pattern: /\bthen\s+than\b/i, message: "Then vs. than confusion" },
    { pattern: /\baffect\s+effect\b/i, message: "Affect vs. effect confusion" }
  ];

  confusedPairs.forEach(({ pattern, message }) => {
    highlighted = highlighted.replace(pattern, match =>
      `<mark title="${message}">${match}</mark>`);
  });

  const exclamations = (text.match(/!/g) || []).length;
  if (exclamations > 1) {
    highlighted = highlighted.replace(/!+/g, match =>
      `<mark title="Too many exclamation points — keep it academic">${match}</mark>`);
  }

  const fillerMatches = text.match(/\b(very|really|so)\b/gi);
  if (fillerMatches && fillerMatches.length > 3) {
    highlighted = highlighted.replace(/\b(very|really|so)\b/gi, match =>
      `<mark title="Consider stronger word choices than '${match}'">${match}</mark>`);
  }

  // Pronoun-antecedent agreement
  const pronounPatterns = [
    {
      regex: /\b(a|one)\s+(student|child|person|teacher|writer)\b[^.?!]*?\b(their|they|them)\b/gi,
      message: "Possible mismatch: singular noun with plural pronoun (try 'his or her')"
    },
    {
      regex: /\bstudents\b[^.?!]*?\b(he|she|his|her)\b/gi,
      message: "Possible mismatch: plural noun with singular pronoun"
    }
  ];

  pronounPatterns.forEach(({ regex, message }) => {
    highlighted = highlighted.replace(regex, match =>
      `<mark title="${message}">${match}</mark>`);
  });

// Highlight repeated words (over 5 letters, used more than once)
const repeatedWordMatches = cleanedText.toLowerCase().match(/\b\w+\b/g) || [];
const wordFrequency = {};

repeatedWordMatches.forEach(word => {
  if (word.length > 5) {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  }
});

Object.keys(wordFrequency).forEach(word => {
  if (wordFrequency[word] > 1) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    highlighted = highlighted.replace(regex, match =>
      `<mark style="background-color: #ffd966;" title="Repeated word: consider rephrasing">${match}</mark>`
    );
  }
});


  return highlighted;
}

function isRelevantToPrompt(prompt, response) {
  const topic = document.getElementById('essay-topic')?.innerText.trim() || '';
  const responseText = response.toLowerCase();

  const promptWords = prompt.toLowerCase().match(/\b\w{3,}\b/g) || [];
  const topicWords = topic.toLowerCase().match(/\b\w{3,}\b/g) || [];
  const keywords = [...new Set([...promptWords, ...topicWords])];

  let matchCount = 0;
  keywords.forEach(word => {
    if (responseText.includes(word)) matchCount++;
  });

  const isRelevant = (keywords.length < 4) ? matchCount >= 1 : matchCount >= 2;

  if (!isRelevant) {
    return {
      match: false,
      warning: `⚠️ This response might be off-topic based on your prompt "<strong>${prompt}</strong>" and your topic "<strong>${topic || 'no topic entered'}</strong>".`
    };
  }

  return { match: true };
}

// === Helper ===
function normalize(str) {
  return str?.replace(/[^\w\s]|_/g, '').replace(/\s+/g, ' ').toLowerCase();
}


function generateWritingTip(prompt, text, targetId) {
  const warnings = [];
  const cleanedText = removeQuotedText(text);

  const repeatedWords = text.toLowerCase().match(/\b\w+\b/g)?.reduce((acc, word, i, arr) => {
    if (arr.indexOf(word) !== i && !acc.includes(word) && word.length > 5) acc.push(word);
    return acc;
  }, []);
  if (repeatedWords?.length > 0) {
    warnings.push(`<div class="tip-warning">⚠️ <strong>Repeated word(s):</strong> "${repeatedWords.join(', ')}" — try using synonyms or rephrasing.</div>`);
  }

  const normalizedThesis = normalize(document.getElementById('thesis-box')?.innerText || '');
  const normalizedRestated = normalize(document.getElementById('restate-thesis')?.innerText || '');
  const normalizedText = normalize(text);
  
  const includesThesis =
    normalizedThesis.length > 0 && normalizedText.includes(normalizedThesis) ||
    normalizedRestated.length > 0 && normalizedText.includes(normalizedRestated);
  
  if (!targetId.includes('thesis') && !includesThesis) {
    const longSentences = text.split(/[.!?]/).filter(s => s.split(' ').length > 25);
    if (longSentences.length > 0) {
      warnings.push(`<div class="tip-warning">⚠️ <strong>Possible run-on sentence.</strong> Try breaking long sentences into shorter ones.</div>`);
    }
  }
  
  

  const transitionPhrases = [
    "for example", "in addition", "however", "this shows", "therefore",
    "as a result", "on the other hand", "moreover", "consequently",
    "in conclusion", "in contrast", "thus", "to illustrate", "similarly",
    "furthermore", "for instance", "additionally", "nevertheless",
    "nonetheless", "to clarify", "on the contrary", "as such"
  ];

  const transitionMatches = text.match(new RegExp(transitionPhrases.join("|"), "gi")) || [];
  if (transitionMatches.length > 2) {
    const freq = transitionMatches.reduce((acc, phrase) => {
      const lower = phrase.toLowerCase();
      acc[lower] = (acc[lower] || 0) + 1;
      return acc;
    }, {});
    const repeated = Object.entries(freq).filter(([, count]) => count > 1);
    if (repeated.length > 0) {
      warnings.push(`<div class="tip-warning">⚠️ <strong>Repeated transitions:</strong> ${repeated.map(([k, v]) => `"${k}" (${v}x)`).join(', ')} — mix them up for variety.</div>`);
    }
  }

  const potentialFragments = text.split(/[.!?]/).filter(line => {
    return line.trim().length > 0 && /^[a-z]+(,|\s)+[a-z]+$/i.test(line.trim()) && !/[.?!]$/.test(line.trim());
  });
  if (potentialFragments.length > 0) {
    warnings.push(`<div class="tip-warning">⚠️ <strong>Possible incomplete sentence.</strong> Double-check for a complete subject and verb.</div>`);
  }

  if (["thesis", "essay-final", "reason", "explanation", "conclusion-final"].some(id => targetId.includes(id))) {
    if (/\b\w+'\w+\b/.test(cleanedText)) {
      warnings.push(`<div class="tip-warning">⚠️ <strong>Contractions detected.</strong> Please write the full words.</div>`);
    }
    if (/\b(I|my|me|we|us|our|you|your)\b/i.test(cleanedText)) {
      warnings.push(`<div class="tip-warning">⚠️ <strong>Personal words detected.</strong> Avoid first or second person outside of direct quotes.</div>`);
    }
  }

  const generalTipHeader = `💬 <strong>Writing Coach:</strong><br><br>`;
  const tipFooter = warnings.length > 0
    ? warnings.join('<br>')
    : '<div class="tip-good">✅ Clear, structured, and academic — nice work!</div>';

  if (targetId.includes('intro-final')) {
    return `${generalTipHeader}
✅ Combine hook, issue, and thesis into one strong paragraph<br>
✅ Avoid personal pronouns and contractions<br>
✅ Use academic transitions like “In today’s world…” or “Many people believe…”<br><br>${tipFooter}`;
  }

  if (targetId.includes('bp1-final') || targetId.includes('bp2-final') || targetId.includes('bp3-final')) {
    return `${generalTipHeader}
✅ Start with a topic sentence that connects to your thesis<br>
✅ Include evidence and explain how it supports your reason<br>
✅ Use transitions like “For example,” or “This shows that…”<br><br>${tipFooter}`;
  }

  if (targetId.includes('conclusion-final')) {
    return `${generalTipHeader}
✅ Restate your thesis in a new way<br>
✅ Summarize key points from your essay<br>
✅ End with a strong final sentence<br><br>${tipFooter}`;
  }

  return `${generalTipHeader}${tipFooter}`;
}

function showWritingCoach(targetId) {
  const userText = document.getElementById(targetId)?.innerText.trim();
  const prompt = document.getElementById('writing-prompt')?.innerText.trim();
  const tipBox = document.getElementById(`writing-tip-${targetId}`);
  const previewBox = document.getElementById(`writing-preview-${targetId}`);

  document.querySelectorAll('.writing-tip-box, .writing-preview-box').forEach(box => {
    box.classList.add('hidden');
  });

  if (!userText) {
    if (tipBox) {
      tipBox.innerHTML = '✏️ Please write something first for feedback.';
      tipBox.classList.remove('hidden');
    }
    return;
  }

  if (tipBox) {
    const tipContent = generateWritingTip(prompt || '', userText, targetId);
    tipBox.innerHTML = tipContent;
    tipBox.classList.remove('hidden');
  }

  if (previewBox) {
    const highlighted = highlightWritingIssues(userText, targetId);
    previewBox.innerHTML = `<strong>📝 Preview with Highlights:</strong><br><br>${highlighted}`;
    previewBox.classList.remove('hidden');
  }
}



// === end-writing-feedback.js ===
