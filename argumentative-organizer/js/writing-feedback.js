// === writing-feedback.js ===

// === Global transition phrases ===4
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
  const safeTitle = escapeHtml(title);
  const key = `${offset}-${word}`; // ✅ Only offset + word (not type)

  if (highlightRegistry.has(key)) {
    const entry = highlightRegistry.get(key);
    entry.types.add(type);           // ✅ Add new type to the Set
    entry.titles.add(safeTitle);     // ✅ Add new title to the Set
  } else {
    highlightRegistry.set(key, {
      word,
      offset,
      types: new Set([type]),
      titles: new Set([safeTitle])
    });
  }
}

function highlightSubjectVerbAgreement(text) {
  const doc = nlp(text);
  const sentences = doc.sentences().out('array');

  sentences.forEach(sentence => {
    const sentDoc = nlp(sentence);

    const simpleMatches = sentDoc.match('#Noun #Copula');

    simpleMatches.forEach(match => {
      const nounMatch = match.match('#Noun');
      const verbMatch = match.match('#Copula');

      const noun = nounMatch.text() || '';
      const verb = verbMatch.text() || '';
      const verbLower = verb.toLowerCase();

      if (!noun || !verb) return;

      const nounIndex = text.indexOf(noun);
      const verbIndex = text.indexOf(verb, nounIndex + noun.length);

      const nounIsPlural = nlp(noun).nouns().isPlural().out('boolean');
      const nounIsSingular = nlp(noun).nouns().isSingular().out('boolean');
      const verbIsPlural = verbLower === 'were';
      const verbIsSingular = ['was', 'is'].includes(verbLower);

      if (nounIsPlural && verbIsSingular) {
        if (nounIndex !== -1) addHighlight(noun, "subjectverb", `This is a plural subject — use a plural verb like are or were.`, nounIndex);
        if (verbIndex !== -1) addHighlight(verb, "subjectverb", `This is a singular verb — it doesn’t match the plural subject. Try are or were.`, verbIndex);
      } else if (nounIsSingular && verbIsPlural) {
        if (nounIndex !== -1) addHighlight(noun, "subjectverb", `This is a singular subject — use a singular verb like is or was.`, nounIndex);
        if (verbIndex !== -1) addHighlight(verb, "subjectverb", `This is a plural verb — it doesn’t match the singular subject. Try is or was.`, verbIndex);
      }
    });

    const compoundMatches = sentDoc.match('#Noun and #Noun #Copula');

    compoundMatches.forEach(match => {
      const subjectText = match.match('#Noun and #Noun').text() || '';
      const verbText = match.match('#Copula').last().text() || '';
      const verbLower = verbText.toLowerCase();

      if (!subjectText || !verbText) return;

      const subjectIndex = text.indexOf(subjectText);
      const verbIndex = text.indexOf(verbText, subjectIndex + subjectText.length);
      const verbIsSingular = ['was', 'is'].includes(verbLower);

      if (verbIsSingular) {
        const tooltip = `Compound subject — use a plural verb like are or were.`;
        if (subjectIndex !== -1) addHighlight(subjectText, "subjectverb", tooltip, subjectIndex);
        if (verbIndex !== -1) addHighlight(verbText, "subjectverb", tooltip, verbIndex);
      }
    });
  });
}

function getMidSentenceCapitalizationWarnings(text) {
  const midSentenceCapitalWords = [];
  const transitionCapitalErrors = [];
  const allowedCapitalWords = new Set([
    "DNA", "Google", "Monday", "America", "English", "Sasquatch", "Possible"
  ]);

  const capitalizedWordPattern = /\b([A-Z][a-z]+)\b/g;
  for (const match of text.matchAll(capitalizedWordPattern)) {
    const word = match[1];
    const index = match.index;
    if (allowedCapitalWords.has(word)) continue;

    const before = text.slice(0, index).trimEnd();
    const isSentenceStart = /(^|\.|\!|\?|\n|\r|\r\n)["“”']?$/.test(before.slice(-4));
    if (!isSentenceStart) {
      midSentenceCapitalWords.push({ word, index });
    }
  }

  transitionPhrases.forEach(phrase => {
    const capitalized = phrase.charAt(0).toUpperCase() + phrase.slice(1);
    const regex = new RegExp(`\\b${capitalized}\\b`, 'g');
    for (const match of text.matchAll(regex)) {
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

function getSentenceFragmentWarnings(text) {
  const doc = nlp(text);
  const fragmentWarnings = [];

  const subordinators = [
    "although", "because", "though", "since", "unless", "while", "whereas", 
    "even though", "as if", "as though", "if", "until", "after", "before", 
    "when", "whenever", "once"
  ];

  doc.sentences().forEach((sentenceDoc) => {
    const sentenceText = sentenceDoc.text().trim();
    const terms = sentenceDoc.terms().json();
    if (terms.length === 0) return;

    const offset = terms[0].terms[0]?.index || text.indexOf(sentenceText);

    const hasSubject = sentenceDoc.match('#Noun').found;
    const hasVerb = sentenceDoc.match('#Verb').found;
    const isShort = sentenceText.length < 5;

    const startsWithSubordinator = subordinators.some(sub =>
      sentenceText.toLowerCase().startsWith(sub + " ")
    );

    const reason = "Possible sentence fragment: missing subject or verb, or incomplete clause.";

if ((startsWithSubordinator && (!hasSubject || !hasVerb)) || (!hasVerb && !isShort)) {
  console.log("⚠️ Fragment Detected:", {
    sentence: sentenceText,
    hasSubject,
    hasVerb,
    startsWithSubordinator,
    offset
  });

  fragmentWarnings.push({
    word: sentenceText,
    offset,
    endOffset: offset + sentenceText.length,
    type: "fragment",
    titles: new Set([reason]),
    isRunon: true // Triggers background highlight
  });
}

  });

  return fragmentWarnings;
}

function highlightWritingIssues(text, targetId) {
  highlightRegistry.clear();
  const cleanedText = removeQuotedText(text);

  highlightSubjectVerbAgreement(text);

  const { uniqueCaps, transitionCaps } = getMidSentenceCapitalizationWarnings(text);
  uniqueCaps.forEach(({ word, index }) => {
    addHighlight(word, "capitalization", `May be capitalized unnecessarily. Proper names are okay!`, index);
  });
  transitionCaps.forEach(({ word, index }) => {
    addHighlight(word, "transition", `Check for missing punctuation before '${word}'. Proper names are okay!`, index);
  });

  const sentenceStartRegex = /(^|[.!?]\s+)(["“”']?)([a-z]\w*)/g;
  for (const match of text.matchAll(sentenceStartRegex)) {
    const lowercaseWord = match[3];
    const searchStart = match.index + match[0].indexOf(lowercaseWord);
    if (searchStart !== -1) {
      addHighlight(lowercaseWord, "capitalization", "Sentences should start with a capital letter.", searchStart);
    }
  }

  const contractionRegex = /\b\w+['’]\w+\b/g;
  for (const match of text.matchAll(contractionRegex)) {
    addHighlight(match[0], "contraction", "Contraction detected: use the full words", match.index);
  }

  const pronouns = /\b(i|I|my|me|we|us|our|you|your)\b/gi;
  for (const match of text.matchAll(pronouns)) {
    addHighlight(match[0], "personal", `Avoid first or second person: '${match[0]}'`, match.index);
  }

  if (targetId.includes('evidence') && !isWrappedInQuotes(text)) {
    const firstWord = text.match(/\b\w+/)?.[0];
    const offset = text.indexOf(firstWord);
    if (firstWord && offset !== -1) {
      addHighlight(firstWord, "quotation", "Missing quotation marks around your evidence.", offset);
    }
  }

const fragmentWarnings = getSentenceFragmentWarnings(text);
fragmentWarnings.forEach(fragment => {
  highlightRegistry.set(`${fragment.offset}-${fragment.word}`, {
    word: fragment.word,
    offset: fragment.offset,
    endOffset: fragment.endOffset,
    types: new Set(["fragment"]),
    titles: new Set(["Possible sentence fragment: missing subject or verb, or incomplete clause."]),
    isRunon: true // 💡 important for preview layer
  });
});



  const commonMisspellings = {
    becuase: "because", definately: "definitely", alot: "a lot",
    seperately: "separately", recieve: "receive", thier: "their",
    arguement: "argument", goverment: "government"
  };
  Object.keys(commonMisspellings).forEach(misspelling => {
    const regex = new RegExp(`\\b${misspelling}\\b`, 'gi');
    for (const match of text.matchAll(regex)) {
      addHighlight(match[0], "spelling", `Did you mean '${commonMisspellings[misspelling]}'?`, match.index);
    }
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
        addHighlight(lastWord, "punctuation", "Missing punctuation at the end of the sentence.", text.indexOf(lastWord));
      }
    }

    const skipRunOnCheck = targetId.includes('thesis');
    const isCopied = normalize(thesisText).includes(normalize(trimmed)) || normalize(restatedText).includes(normalize(trimmed));

    if (!skipRunOnCheck && !isCopied && trimmed.split(/\s+/).length > 25) {
      const escaped = trimmed.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
      const match = text.match(new RegExp(escaped, 'i'));
      const sentenceOffset = match?.index ?? -1;

      if (sentenceOffset !== -1) {
        const runonTip = "Possible run-on sentence — consider splitting into shorter sentences.";
        highlightRegistry.set(`runon-${sentenceOffset}`, {
          word: "",
          offset: sentenceOffset,
          endOffset: sentenceOffset + trimmed.length,
          types: new Set(["runon"]),
          titles: new Set([runonTip]),
          isRunon: true,
          styles: { zIndex: 1, background: "rgba(255, 200, 0, 0.2)" }
        });

        const wordsInSentence = trimmed.match(/\b\w+\b/g) || [];
        let searchStart = sentenceOffset;

        wordsInSentence.forEach(word => {
          const offset = text.indexOf(word, searchStart);
          if (offset === -1) return;
          searchStart = offset + word.length;

          const key = `${offset}-${word}`;
          if (highlightRegistry.has(key)) {
            const existing = highlightRegistry.get(key);
            existing.types.add("runon");

            if (existing.titles instanceof Set) {
              existing.titles.add(runonTip);
            } else {
              // just in case it got converted
              existing.titles = new Set([...(existing.titles || []), runonTip]);
            }
          } else {
            highlightRegistry.set(key, {
              word,
              offset,
              types: new Set(["runon"]),
              titles: new Set([runonTip])
            });
          }
        });
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
    for (const match of text.matchAll(pattern)) {
      addHighlight(match[0], "confusedpair", message, match.index);
    }
  });

  const exclamations = [...text.matchAll(/!+/g)];
  if (exclamations.length > 1) {
    for (const match of exclamations) {
      addHighlight(match[0], "exclamation", "Too many exclamation points — keep it academic", match.index);
    }
  }

  const fillerPattern = /\b(very|really|so)\b/gi;
  let fillerCount = 0;
  for (const match of text.matchAll(fillerPattern)) {
    if (fillerCount >= 3) break;
    fillerCount++;
    addHighlight(match[0], "filler", "Avoid filler words, consider stronger word choices", match.index);
  }

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
    for (const match of text.matchAll(regex)) {
      addHighlight(match[0], "pronoun", message, match.index);
    }
  });
// === Detect repeated words used 4+ times (excluding common ones) ===
const words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
const freq = {};
const ignoreList = new Set([
  "because", "therefore", "however", "which", "should",
  "would", "about", "their", "other", "these", "those",
  "first", "second", "third", "again", "another", "also",
  "author", "article", "quote", "text", "essay", "reason"
]);

words.forEach(word => {
  freq[word] = (freq[word] || 0) + 1;
});

Object.keys(freq).forEach(word => {
  if (freq[word] >= 4 && !ignoreList.has(word)) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    for (const match of text.matchAll(regex)) {
      addHighlight(match[0], "repeat", `Repeated word "${word}" (${freq[word]}×): consider rephrasing`, match.index);
    }
  }
});


return [...highlightRegistry.entries()].map(([key, entry]) => {
  const offset = parseInt(key.split('-')[0]);
  return {
    word: entry.word,
    offset,
    type: Array.from(entry.types || []),   // ✅ ensure it's an array
    titles: Array.from(entry.titles || []), // ✅ ensure it's an array
    isRunon: entry.isRunon || false,
    endOffset: entry.endOffset || (entry.word ? offset + entry.word.length : offset)
  };
});

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
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

//duplicate escaperegexp placement
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

//normalize duplicate placement

function normalize(str) {
  return str?.replace(/[^\w\s]|_/g, '').replace(/\s+/g, ' ').toLowerCase();
}

function joinTitles(titles) {
  if (titles instanceof Set) return [...titles].join(" • ");
  if (Array.isArray(titles)) return titles.join(" • ");
  if (typeof titles === "string") return titles; // fallback string
  return "";
}


function buildRunonHtmlLayer(text, backgroundHighlights) {
  let result = "";
  let lastIndex = 0;

  const sorted = [...backgroundHighlights].sort((a, b) => a.offset - b.offset);

  for (const { offset, endOffset, titles } of sorted) {
    if (offset < lastIndex) continue;

    result += escapeHtml(text.slice(lastIndex, offset));

    const highlightText = escapeHtml(text.slice(offset, endOffset));

    const tooltip = joinTitles(titles);


    result += `<span class="underline-highlight" title="${escapeHtml(tooltip)}" style="position: absolute; left: 0;">&nbsp;</span>`;

    lastIndex = endOffset;
  }

  result += escapeHtml(text.slice(lastIndex));
  return result;
}

function generateWritingTip(prompt, text, targetId) {
  const warnings = [];
  const cleanedText = removeQuotedText(text);

  const relevanceCheck = isRelevantToPrompt(prompt, text);
  if (!relevanceCheck.match) {
    warnings.push(`<div class="tip-warning">${relevanceCheck.warning}</div>`);
  }

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
    const longSentences = (text.match(/[^.!?]+[.!?]+/g) || [])
      .filter(s => s.trim().split(/\s+/).length > 25);
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
    "thesis", "intro-final",
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

  // Merged from second version
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

  // NLP-based agreement check
  const subjVerbWarnings = detectSubjectVerbAgreementIssues(cleanedText);
  subjVerbWarnings.forEach(message => {
    warnings.push(`<div class="tip-warning">⚠️ <strong>Subject–verb agreement issue:</strong> ${message}</div>`);
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

  // Hide all tip/preview boxes
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

  // ✅ Only generate highlights ONCE
  const highlights = highlightWritingIssues(userText, targetId);

  // === Writing Tip ===
  if (tipBox) {
    const tipContent = generateWritingTip(prompt || '', userText, targetId);
    tipBox.innerHTML = tipContent;
    tipBox.classList.remove('hidden');
    attachWarningEvents();
  }

  // === Writing Preview ===
  if (previewBox) {
    previewBox.innerHTML = ""; // Clear previous

    // Add header
    const heading = document.createElement("div");
    heading.textContent = "📝 Preview with Highlights:";
    heading.className = "preview-header";
    previewBox.appendChild(heading);
    previewBox.appendChild(document.createElement("br"));
    previewBox.appendChild(document.createElement("br"));

    // Add highlight container
    const highlightContainer = document.createElement("div");
    highlightContainer.id = "highlight-content";
    previewBox.appendChild(highlightContainer);

    // Render highlights
    renderPreviewSafely(userText, highlights, highlightContainer);

    previewBox.classList.remove("hidden");
  }
}

function detectSubjectVerbAgreementIssues(text) {
  const issues = [];
  const doc = nlp(text);
  const sentences = doc.sentences().out('array');
  const seenPairs = new Set();

  sentences.forEach(sentence => {
    const sentDoc = nlp(sentence);
    const matches = sentDoc.match('(#Determiner|#Adjective)* #Noun #Copula')
      .concat(sentDoc.match('#Noun #Copula'));

    matches.forEach(match => {
      const noun = match.match('#Noun').text() || '';
      const verb = match.match('#Copula').text() || '';
      if (!noun || !verb) return;

      const key = `${noun}__${verb}`;
      if (seenPairs.has(key)) return;
      seenPairs.add(key);

      const verbLower = verb.toLowerCase();
      const nounTerm = nlp(noun).terms().data()[0] || {};
      const nounIsPlural = nounTerm.tags?.includes('Plural');
      const nounIsSingular = nounTerm.tags?.includes('Singular');

      const verbIsPlural = verbLower === 'were';
      const verbIsSingular = ['was', 'is'].includes(verbLower);

      if (nounIsPlural && verbIsSingular) {
        issues.push(`'${noun} was' — plural subject with singular verb. Try 'were'.`);
      } else if (nounIsSingular && verbIsPlural) {
        issues.push(`'${noun} were' — singular subject with plural verb. Try 'was'.`);
      }
    });
  });

  return issues;
}

function renderPreviewSafely(text, highlights, container) {
  container.innerHTML = "";

  const backgroundHighlights = highlights.filter(h => {
    const types = Array.isArray(h.type) ? h.type : [h.type];
    return h.isRunon || types.includes("fragment");
  });

  const inlineHighlights = highlights.filter(h => !h.isRunon);
// === Build inline word-level HTML ===
  let lastIndex = 0;
  let inlineHtml = "";
  inlineHighlights.sort((a, b) => a.offset - b.offset);

  const typePriority = [
    "spelling", "subjectverb", "capitalization", "confusedpair", "contraction",
    "personal", "quotation", "punctuation", "exclamation", "repeat",
    "filler", "pronoun", "transition", "runon", "fragment"
  ];

  inlineHighlights.forEach(({ word, offset, type, titles }) => {
    if (offset < lastIndex) return;

    const before = text.slice(lastIndex, offset);
    const types = Array.isArray(type)
      ? type
      : type instanceof Set
      ? [...type]
      : typeof type === "string"
      ? [type]
      : [];

    types.sort((a, b) => {
      const aIndex = typePriority.indexOf(a);
      const bIndex = typePriority.indexOf(b);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });

    const primaryType = types[0];
    const safeClass = escapeHtml(primaryType);
    const safeType = escapeHtml(types.join(" "));
    const safeTitle = escapeHtml(joinTitles(titles));
    const safeWord = escapeHtml(word);

    inlineHtml += escapeHtml(before);
    inlineHtml += `<mark class="highlight ${safeClass}" data-type="${safeType}" title="${safeTitle}">${safeWord}</mark>`;
    lastIndex = offset + word.length;
  });

  inlineHtml += escapeHtml(text.slice(lastIndex));

  // === Inline highlight layer sits on top ===
  const inlineLayer = document.createElement("div");
  inlineLayer.className = "preview-inline";
  inlineLayer.innerHTML = inlineHtml;

  // === Background highlight layer uses spans and absolute positioning
  const backgroundLayer = document.createElement("div");
  backgroundLayer.className = "preview-runon";

  backgroundHighlights
    .sort((a, b) => a.offset - b.offset)
    .forEach(({ offset, endOffset, titles, type }) => {
      const span = document.createElement("span");
      span.className = "underline-highlight";
      span.setAttribute("data-type", Array.isArray(type) ? type.join(" ") : type || "");
      span.setAttribute("data-offset", offset);
      span.setAttribute("data-endoffset", endOffset);
      span.setAttribute("title", escapeHtml(joinTitles(titles)));

      backgroundLayer.appendChild(span);
    });

  container.appendChild(backgroundLayer);
  container.appendChild(inlineLayer);
}
function attachWarningEvents() {
  document.querySelectorAll('.tip-warning').forEach(warning => {
    const type = warning.dataset.type;
    if (!type) return;

    // 🟢 Make keyboard-focusable
    warning.setAttribute('tabindex', '0');

    // 🟡 Hover glow effect
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

    // 🔵 Click to scroll to related section
    warning.addEventListener('click', () => {
      const section = document.querySelector(`[data-section="${type}"]`);
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    });

    // 🟣 Keyboard accessibility (Enter or Space key)
    warning.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const section = document.querySelector(`[data-section="${type}"]`);
        if (section) section.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

window.showWritingCoach = showWritingCoach;

// === end-writing-feedback.js ===
