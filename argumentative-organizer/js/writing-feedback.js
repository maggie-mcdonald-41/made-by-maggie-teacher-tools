
// === writing-feedback.js ===

// === Global transition phrases ===
const transitionPhrases = [
    "for example", "in addition", "however", "this shows", "therefore",
    "as a result", "on the other hand", "moreover", "consequently",
    "in conclusion", "in contrast", "thus", "to illustrate", "similarly",
    "furthermore", "for instance", "additionally", "nevertheless",
    "nonetheless", "to clarify", "on the contrary", "as such", 
    "according to the text", "the author states", "In the article, it says,",
    "according to the article", "according to the articles", "This quote shows that",
    "this means that", "this proves that", "the author is trying to say that",
    "as a result", "this reveals that", "another reason is", "next", "a second reason is",
    "finally", "The last reason is", "opponents might say", "some people argue that",
    "to summarize", "ultimately", "we must", "it is time to", "take the first step toward a better future",
    "speak up before it is too late", "take a stand and", "do not wait"
  ];
function removeQuotedText(text) {
  return text.replace(/(["“”])(?:(?=(\\?))\2.)*?\1/g, '');
}

function endsWithProperPunctuation(sentence) {
  const cleaned = sentence.trim().replace(/["'”]+$/, '');
  return /[.!?]$/.test(cleaned);
}

function hasCapitalizationErrors(text) {
  const sentences = text.split(/(?<=[.!?])\s+/); // Split into individual sentences

  return sentences.some(sentence => {
    const trimmed = sentence.trim();

    // Match the first word after optional leading quotes or punctuation
    const match = trimmed.match(/^["'“”‘’]*([A-Za-z]+)/);

    if (match) {
      const firstWord = match[1];
      return /^[a-z]/.test(firstWord); // Flag if not capitalized
    }

    return false; // If no word is found, don't flag it
  });
}


function isWrappedInQuotes(text) {
  const trimmed = text.trim();
  return /^["“”].*["“”]$/.test(trimmed);
}

const highlightRegistry = new Map();

function addHighlight(word, type, title, offset) {
  if (!highlightRegistry.has(offset)) {
    highlightRegistry.set(offset, {
      word,
      types: [type],
      titles: [title],
    });
  } else {
    const entry = highlightRegistry.get(offset);
    if (!entry.types.includes(type)) entry.types.push(type);
    if (!entry.titles.includes(title)) entry.titles.push(title);
  }
}

function highlightWritingIssues(text, targetId) {
  highlightRegistry.clear();
  let highlighted = text;
  const cleanedText = removeQuotedText(text);
  highlighted = highlightSubjectVerbAgreement(highlighted);


// === Subject–Verb Agreement Check using Compromise ===
function highlightSubjectVerbAgreement(text) {
  const doc = nlp(text);
  const sentences = doc.sentences().out('array');
  let highlighted = text;

  sentences.forEach(sentence => {
    const terms = nlp(sentence).terms().json()[0]?.terms || [];

    for (let i = 0; i < terms.length; i++) {
      const term = terms[i];

      if (term.tags.includes('Noun')) {
        const noun = term.text;
        const nounIsPlural = nlp(noun).nouns().isPlural().out('boolean');
        const nounIsSingular = nlp(noun).nouns().isSingular().out('boolean');

        // Look ahead to find the next verb within 3 words
        for (let j = i + 1; j <= i + 3 && j < terms.length; j++) {
          const nextTerm = terms[j];
          if (nextTerm.tags.includes('Verb')) {
            const verb = nextTerm.text;
            const verbIsSingular = nlp(verb).verbs().isSingular().out('boolean');
            const verbIsPlural = nlp(verb).verbs().isPlural().out('boolean');

            const fullPhrase = `${noun} ${verb}`;
            const phraseRegex = new RegExp(`\\b${escapeRegExp(noun)}\\s+${escapeRegExp(verb)}\\b`, 'gi');

            if (nounIsPlural && verbIsSingular) {
              highlighted = highlighted.replace(phraseRegex, match => {
                return `<mark class="highlight" data-type="subjectverb" title="Subject–verb agreement issue: '${noun}' is plural but is paired with '${verb}'.">${match}</mark>`;
              });
            }

            if (nounIsSingular && verbIsPlural) {
              highlighted = highlighted.replace(phraseRegex, match => {
                return `<mark class="highlight" data-type="subjectverb" title="Subject–verb agreement issue: '${noun}' is singular but is paired with '${verb}'.">${match}</mark>`;
              });
            }

            break; // only check the closest verb for this noun
          }
        }
      }
    }
  });

  return highlighted;
}


  const { uniqueCaps, transitionCaps } = getMidSentenceCapitalizationWarnings(text);
  uniqueCaps.forEach(({ word, index }) => {
    addHighlight(word, "capitalization", `May be capitalized unnecessarily. Proper names are okay!`, index);
  });
  transitionCaps.forEach(({ word, index }) => {
    addHighlight(word, "transition", `Check for missing punctuation before '${word}'. Proper names are okay!`, index);
  });

  const sentenceStartRegex = /(^|[.!?]\s+)(["“”']?)([a-z]\w*)/g;
  highlighted = highlighted.replace(sentenceStartRegex, (match, p1, p2, p3, offset) => {
    addHighlight(p3, "capitalization", "Sentences should start with a capital letter.", offset);
    return match;
  });

  const contractionRegex = /\b\w+['’]\w+\b/g;
  highlighted = highlighted.replace(contractionRegex, function(match, offset) {
    const context = typeof this === "string" ? this : highlighted;
    const before = context.slice(Math.max(0, offset - 15), offset);
    if (!before.includes('<mark')) {
      addHighlight(match, "contraction", `Contraction detected: use the full words`, offset);
    }
    return match;
  }.bind(highlighted));

  const pronouns = /\b(I|my|me|we|us|our|you|your)\b/gi;
  highlighted = highlighted.replace(pronouns, (match, offset) => {
    addHighlight(match, "personal", `Avoid first or second person: '${match}'`, offset);
    return match;
  });

  if (targetId.includes('evidence') && !isWrappedInQuotes(text)) {
    const firstWord = text.match(/\b\w+/)?.[0];
    const offset = text.indexOf(firstWord);
    if (firstWord && offset !== -1) {
      addHighlight(firstWord, "quotation", "Missing quotation marks around your evidence.", offset);
    }
  }

  const commonMisspellings = {
    becuase: "because", definately: "definitely", alot: "a lot",
    seperately: "separately", recieve: "receive", thier: "their",
    arguement: "argument", goverment: "government"
  };
  Object.keys(commonMisspellings).forEach(misspelling => {
    const regex = new RegExp(`\\b${misspelling}\\b`, 'gi');
    highlighted = highlighted.replace(regex, (match, offset) => {
      addHighlight(match, "spelling", `Did you mean '${commonMisspellings[misspelling]}'?`, offset);
      return match;
    });
  });

  const sentenceMatches = text.match(/[^.!?]+[.!?]+/g) || [];
  const thesisText = document.getElementById('thesis-box')?.innerText.trim() || '';
  const restatedText = document.getElementById('restate-thesis')?.innerText.trim() || '';

  sentenceMatches.forEach(sentence => {
    const trimmed = sentence.trim();
    if (!trimmed) return;

    if (!endsWithProperPunctuation(trimmed)) {
      const lastWordMatch = trimmed.match(/(\w+)[^a-zA-Z]*$/);
      if (lastWordMatch) {
        const lastWord = lastWordMatch[1];
        const offset = text.indexOf(lastWord);
        addHighlight(lastWord, "punctuation", "Missing punctuation at the end of the sentence.", offset);
      }
    }

    const skipRunOnCheck = targetId.includes('thesis');
    const isCopied = normalize(thesisText).includes(normalize(trimmed)) || normalize(restatedText).includes(normalize(trimmed));
    if (!skipRunOnCheck && !isCopied && trimmed.split(/\s+/).length > 25) {
      const firstWord = trimmed.match(/\b\w+/)?.[0];
      const offset = text.indexOf(firstWord);
      if (firstWord && offset !== -1) {
        addHighlight(firstWord, "runon", "Possible run-on sentence — consider splitting into shorter sentences.", offset);
      }
    }
  });

  const confusedPairs = [
    { pattern: /\byour\s+welcome\b/gi, message: "Did you mean 'you're welcome'?" },
    { pattern: /\byour\s+the\b/gi, message: "Possible misuse: 'your' vs. 'you're'" },
    { pattern: /\bthen\s+than\b/gi, message: "Then vs. than confusion" },
    { pattern: /\baffect\s+effect\b/gi, message: "Affect vs. effect confusion" }
  ];
  confusedPairs.forEach(({ pattern, message }) => {
    highlighted = highlighted.replace(pattern, (match, offset) => {
      addHighlight(match, "confusedpair", message, offset);
      return match;
    });
  });

  if ((text.match(/!/g) || []).length > 1) {
    highlighted = highlighted.replace(/!+/g, (match, offset) => {
      addHighlight(match, "exclamation", "Too many exclamation points — keep it academic", offset);
      return match;
    });
  }

  const fillerPattern = /\b(very|really|so)\b/gi;
  let fillerCount = 0;
  highlighted = highlighted.replace(fillerPattern, function(match, offset) {
    const str = this.toString();
    const before = str.slice(Math.max(0, offset - 15), offset);
    if (fillerCount < 3 && !before.includes('<mark')) {
      fillerCount++;
      addHighlight(match, "filler", `Avoid filler words, consider stronger word choices`, offset);
    }
    return match;
  }.bind(highlighted));

  const pronounPatterns = [
    {
      regex: /\b(a|one)\s+(student|child|person|teacher|writer)\b[^.?!]*?\b(their|they|them)\b/gi,
      message: "Singular noun with plural pronoun (use 'his or her')"
    },
    {
      regex: /\bstudents\b[^.?!]*?\b(he|she|his|her)\b/gi,
      message: "Plural noun with singular pronoun"
    }
  ];
  pronounPatterns.forEach(({ regex, message }) => {
    highlighted = highlighted.replace(regex, (match, offset) => {
      addHighlight(match, "pronoun", message, offset);
      return match;
    });
  });

  const words = cleanedText.toLowerCase().match(/\b\w{6,}\b/g) || [];
  const freq = {};
  words.forEach(word => freq[word] = (freq[word] || 0) + 1);
  Object.keys(freq).forEach(word => {
    if (freq[word] > 1) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      highlighted = highlighted.replace(regex, (match, offset) => {
        addHighlight(match, "repeat", `Repeated word: consider rephrasing`, offset);
        return match;
      });
    }
  });

  highlightRegistry.forEach(({ word, types, titles }, offset) => {
    const title = titles.join(" • ");
    const type = types[0];
    const safeRegex = new RegExp(`\\b${escapeRegExp(word)}\\b`, 'g');

    highlighted = highlighted.replace(safeRegex, function(match, matchOffset) {
      const str = this.toString();
      const before = str.slice(Math.max(0, matchOffset - 25), matchOffset);
      if (before.includes('<mark')) return match;
      return `<mark class="highlight" data-type="${type}" title="${title}">${match}</mark>`;
    }.bind(highlighted));
  });

  return highlighted;
}


function getMidSentenceCapitalizationWarnings(text) {
  const midSentenceCapitalWords = [];
  const transitionCapitalErrors = [];
  const allowedCapitalWords = new Set([
    "DNA", "Google", "Monday", "America", "English", "Sasquatch", "Possible"
  ]);

  // === Flag all capitalized words ===
  const capitalizedWordPattern = /\b([A-Z][a-z]+)\b/g;
  for (const match of text.matchAll(capitalizedWordPattern)) {
    const word = match[1];
    const index = match.index;

    // Skip allowed capitalized words
    if (allowedCapitalWords.has(word)) continue;

    // Look behind to see if it's sentence start
    const before = text.slice(0, index).trimEnd();
    const lastChar = before[before.length - 1];

    const isSentenceStart = !lastChar || /[.!?]["”']?\s*$/.test(before);

    if (!isSentenceStart) {
      midSentenceCapitalWords.push({ word, index });
    }
  }

  // === Capitalized transition phrase checks ===
  transitionPhrases.forEach(phrase => {
    const capitalized = phrase.charAt(0).toUpperCase() + phrase.slice(1);
    const pattern = new RegExp(`\\b${capitalized}\\b`, 'g');
    for (const match of text.matchAll(pattern)) {
      const index = match.index;
      const preceding = text.slice(Math.max(0, index - 50), index);
      if (!/[.!?]["”']?\s*$/.test(preceding)) {
        transitionCapitalErrors.push({ word: capitalized, index });
      }
    }
  });

  return {
    uniqueCaps: midSentenceCapitalWords,
    transitionCaps: transitionCapitalErrors
  };
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

function checkSubjectVerbAgreement(text) {
  const doc = nlp(text);
  const flagged = [];

  doc.sentences().forEach(sentence => {
    // Match patterns like: subject noun + verb
    const nounVerbPairs = sentence.match('#Noun #Verb');

    nounVerbPairs.forEach(pair => {
      const noun = pair.match('#Noun');
      const verb = pair.match('#Verb');

      if (!noun.found || !verb.found) return;

const nounText = noun.text();
const verbText = verb.text();

const isPluralNoun = noun.nouns().isPlural().out('boolean');
const isSingularNoun = noun.nouns().isSingular().out('boolean');

const isSingularVerb = verb.verbs().isSingular().out('boolean');
const isPluralVerb = verb.verbs().isPlural().out('boolean');

if (isPluralNoun && isSingularVerb) {
  flagged.push({
    type: "subjectVerb",
    message: `Possible mismatch: plural subject "${nounText}" with singular verb "${verbText}"`,
    subject: nounText,
    verb: verbText,
  });
}

if (isSingularNoun && isPluralVerb) {
  flagged.push({
    type: "subjectVerb",
    message: `Possible mismatch: singular subject "${nounText}" with plural verb "${verbText}"`,
    subject: nounText,
    verb: verbText,
  });
}

    });
  });

  return flagged;
}


// === Helper ===

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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

const sectionsForFormalChecks = [
  "thesis",
  "intro-final",
  "reason1-box", "reason2-box", "reason3-box",
  "explanation1-box", "explanation2-box", "explanation3-box",
  "bp1-final", "bp2-final", "bp3-final",
  "conclusion-final",
  "essay-final"
];

if (sectionsForFormalChecks.some(id => targetId.includes(id))) {
if (/\b\w+['’]\w+\b/.test(cleanedText)) {
    warnings.push(`<div class="tip-warning">⚠️ <strong>Contractions detected.</strong> Please write the full words.</div>`);
  }
  if (/\b(I|my|me|we|us|our|you|your)\b/i.test(cleanedText)) {
    warnings.push(`<div class="tip-warning">⚠️ <strong>Personal words detected.</strong> Avoid first or second person outside of direct quotes.</div>`);
  }
}

const doubleNegativePattern = /\b(?:don't|doesn't|didn't|can't|won't|isn't|aren't|wasn't|weren't|never|nothing|no one|nobody|none|neither|nor)\b.*\b(no|nothing|nobody|none|never|nor|nowhere|no one)\b/i;
if (doubleNegativePattern.test(cleanedText)) {
  warnings.push(`<div class="tip-warning">⚠️ <strong>Double negative detected:</strong> Watch out for phrases like "don't have no" — use standard grammar.</div>`);
}

const subjectVerbMistakes = [
  { pattern: /\bthey was\b/i, message: "Try 'they were' instead of 'they was'" },
  { pattern: /\bwe was\b/i, message: "Try 'we were' instead of 'we was'" },
  { pattern: /\bthere is\s+\w+\s+(and|or)\s+\w+\b/i, message: "Use 'there are' when referring to multiple things" }
];

subjectVerbMistakes.forEach(({ pattern, message }) => {
  if (pattern.test(cleanedText)) {
    warnings.push(`<div class="tip-warning">⚠️ <strong>Subject–verb agreement issue:</strong> ${message}</div>`);
  }
});

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
      attachWarningEvents();
  }

  if (previewBox) {
    const highlighted = highlightWritingIssues(userText, targetId);
    previewBox.innerHTML = `<strong>📝 Preview with Highlights:</strong><br><br>${highlighted}`;
    previewBox.classList.remove('hidden');
  }
}

function attachWarningEvents() {
  document.querySelectorAll('.tip-warning').forEach(warning => {
    const typeMatch = warning.innerHTML.match(/data-type="([^"]+)"/);
    const type = typeMatch ? typeMatch[1] : null;
    if (!type) return;

    warning.addEventListener('mouseenter', () => {
      document.querySelectorAll(`mark[data-type="${type}"]`).forEach(el => {
        el.classList.add('glow');
      });
    });

    warning.addEventListener('mouseleave', () => {
      document.querySelectorAll(`mark[data-type="${type}"]`).forEach(el => {
        el.classList.remove('glow');
      });
    });

    warning.addEventListener('click', () => {
      const match = document.querySelector(`mark[data-type="${type}"]`);
      if (match) {
        match.scrollIntoView({ behavior: 'smooth', block: 'center' });
        match.classList.add('pulse');
        setTimeout(() => match.classList.remove('pulse'), 1000);
      }
    });
  });
}



// === end-writing-feedback.js ===

function getMidSentenceCapitalizationWarnings(text) {
  const midSentenceCapitalWords = [];
  const transitionCapitalErrors = [];
  const allowedCapitalWords = new Set([
    "DNA", "Google", "Monday", "America", "English", "Sasquatch", "Possible"
  ]);

  // === Flag all capitalized words ===
  const capitalizedWordPattern = /\b([A-Z][a-z]+)\b/g;
  for (const match of text.matchAll(capitalizedWordPattern)) {
    const word = match[1];
    const index = match.index;

    // Skip allowed capitalized words
    if (allowedCapitalWords.has(word)) continue;

    // Look behind to see if it's sentence start
    const before = text.slice(0, index).trimEnd();
    const lastChar = before[before.length - 1];

    const isSentenceStart = !lastChar || /[.!?]["”']?\s*$/.test(before);

    if (!isSentenceStart) {
      midSentenceCapitalWords.push({ word, index });
    }
  }

  // === Capitalized transition phrase checks ===
  transitionPhrases.forEach(phrase => {
    const capitalized = phrase.charAt(0).toUpperCase() + phrase.slice(1);
    const pattern = new RegExp(`\\b${capitalized}\\b`, 'g');
    for (const match of text.matchAll(pattern)) {
      const index = match.index;
      const preceding = text.slice(Math.max(0, index - 50), index);
      if (!/[.!?]["”']?\s*$/.test(preceding)) {
        transitionCapitalErrors.push({ word: capitalized, index });
      }
    }
  });

  return {
    uniqueCaps: midSentenceCapitalWords,
    transitionCaps: transitionCapitalErrors
  };
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

function checkSubjectVerbAgreement(text) {
  const doc = nlp(text);
  const flagged = [];

  doc.sentences().forEach(sentence => {
    // Match patterns like: subject noun + verb
    const nounVerbPairs = sentence.match('#Noun #Verb');

    nounVerbPairs.forEach(pair => {
      const noun = pair.match('#Noun');
      const verb = pair.match('#Verb');

      if (!noun.found || !verb.found) return;

const nounText = noun.text();
const verbText = verb.text();

const isPluralNoun = noun.nouns().isPlural().out('boolean');
const isSingularNoun = noun.nouns().isSingular().out('boolean');

const isSingularVerb = verb.verbs().isSingular().out('boolean');
const isPluralVerb = verb.verbs().isPlural().out('boolean');

if (isPluralNoun && isSingularVerb) {
  flagged.push({
    type: "subjectVerb",
    message: `Possible mismatch: plural subject "${nounText}" with singular verb "${verbText}"`,
    subject: nounText,
    verb: verbText,
  });
}

if (isSingularNoun && isPluralVerb) {
  flagged.push({
    type: "subjectVerb",
    message: `Possible mismatch: singular subject "${nounText}" with plural verb "${verbText}"`,
    subject: nounText,
    verb: verbText,
  });
}

    });
  });

  return flagged;
}


// === Helper ===

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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

  const sectionsForFormalChecks = [
    "thesis",
    "intro-final",
    "reason1-box", "reason2-box", "reason3-box",
    "explanation1-box", "explanation2-box", "explanation3-box",
    "bp1-final", "bp2-final", "bp3-final",
    "conclusion-final", "essay-final"
  ];

  if (sectionsForFormalChecks.some(id => targetId.includes(id))) {
    if (/\b\w+['’]\w+\b/.test(cleanedText)) {
      warnings.push(`<div class="tip-warning">⚠️ <strong>Contractions detected.</strong> Please write the full words.</div>`);
    }
    if (/\b(I|my|me|we|us|our|you|your)\b/i.test(cleanedText)) {
      warnings.push(`<div class="tip-warning">⚠️ <strong>Personal words detected.</strong> Avoid first or second person outside of direct quotes.</div>`);
    }
  }

  const doubleNegativePattern = /\b(?:don't|doesn't|didn't|can't|won't|isn't|aren't|wasn't|weren't|never|nothing|no one|nobody|none|neither|nor)\b.*\b(no|nothing|nobody|none|never|nor|nowhere|no one)\b/i;
  if (doubleNegativePattern.test(cleanedText)) {
    warnings.push(`<div class="tip-warning">⚠️ <strong>Double negative detected:</strong> Watch out for phrases like "don't have no" — use standard grammar.</div>`);
  }

  const subjectVerbMistakes = [
    { pattern: /\bthey was\b/i, message: "Try 'they were' instead of 'they was'" },
    { pattern: /\bwe was\b/i, message: "Try 'we were' instead of 'we was'" },
    { pattern: /\bthere is\s+\w+\s+(and|or)\s+\w+\b/i, message: "Use 'there are' when referring to multiple things" }
  ];
  subjectVerbMistakes.forEach(({ pattern, message }) => {
    if (pattern.test(cleanedText)) {
      warnings.push(`<div class="tip-warning">⚠️ <strong>Subject–verb agreement issue:</strong> ${message}</div>`);
    }
  });

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
      attachWarningEvents();
  }

  if (previewBox) {
    const highlighted = highlightWritingIssues(userText, targetId);
    previewBox.innerHTML = `<strong>📝 Preview with Highlights:</strong><br><br>${highlighted}`;
    previewBox.classList.remove('hidden');
  }
}

function attachWarningEvents() {
  document.querySelectorAll('.tip-warning').forEach(warning => {
    const typeMatch = warning.innerHTML.match(/data-type="([^"]+)"/);
    const type = typeMatch ? typeMatch[1] : null;
    if (!type) return;

    warning.addEventListener('mouseenter', () => {
      document.querySelectorAll(`mark[data-type="${type}"]`).forEach(el => {
        el.classList.add('glow');
      });
    });

    warning.addEventListener('mouseleave', () => {
      document.querySelectorAll(`mark[data-type="${type}"]`).forEach(el => {
        el.classList.remove('glow');
      });
    });

    warning.addEventListener('click', () => {
      const match = document.querySelector(`mark[data-type="${type}"]`);
      if (match) {
        match.scrollIntoView({ behavior: 'smooth', block: 'center' });
        match.classList.add('pulse');
        setTimeout(() => match.classList.remove('pulse'), 1000);
      }
    });
  });
}



// === end-writing-feedback.js ===
