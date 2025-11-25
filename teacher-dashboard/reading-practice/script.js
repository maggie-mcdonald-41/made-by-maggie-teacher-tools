// script.js

// ====== HIGHLIGHTING STATE ======
let currentHighlightColor = "yellow"; // default color
// ====== ASSESSMENT LABEL ======
const ASSESSMENT_NAME = "School Start Time";


function setHighlightColor(color) {
  currentHighlightColor = color;

  // Toggle "active" class on all color buttons in both toolbars
  document.querySelectorAll(".hl-color-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.color === color);
  });
}

// Initialize toolbar listeners (call this once after DOM is ready)
function initHighlightToolbars() {
  document.querySelectorAll(".hl-color-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const color = btn.dataset.color;
      if (!color) return;
      setHighlightColor(color);
    });
  });
}

// Cross-out helper: shift-click or right-click adds/removes crossed-out state
function attachCrossOutHandlers(btn) {
  // Right-click / two-finger tap
  btn.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    if (answered) return;
    btn.classList.toggle("crossed-out");
  });
}

// ====== DATA MODEL: QUESTIONS ======
// Types: 'mcq', 'multi', 'order', 'match', 'highlight', 'dropdown', 'classify', 'partAB', 'revise'
const questions = [
  // 1. MCQ – Main claim, Passage 1
  {
    id: 1,
    type: "mcq",
    linkedPassage: 1,
    stem: "What is the main claim the author makes in Passage 1?",
    instructions: "Select the best answer from the choices below.",
    options: [
      "Schools should give students more homework so they learn responsibility.",
      "The school day should start later so students can be healthier and more focused.",
      "Students should visit the nurse less often during the school day.",
      "Walking or biking to school is too dangerous for most students."
    ],
    correctIndex: 1,
    skills: [
      "claim",          // identifying the author's claim
      "central-idea",   // big idea of the passage
      "passage-1",
      "mcq"             // test-format skill
    ]
  },

  // 2. MCQ – Central idea, Passage 2
  {
    id: 2,
    type: "mcq",
    linkedPassage: 2,
    stem: "Which statement best describes the central idea of Passage 2?",
    instructions: "Choose the answer that best summarizes the author’s main point.",
    options: [
      "Later school start times always improve student health and happiness.",
      "Earlier school start times are better because they fit family schedules, activities, and transportation needs.",
      "Students should quit after-school activities so they have more time for sleep.",
      "Bus rides are the most important part of a student’s school experience."
    ],
    correctIndex: 1,
    skills: [
      "central-idea", // main idea / gist
      "summarizing",
      "passage-2",
      "mcq"           // test-format skill
    ]
  },

  // 3. Select All That Apply – Health & safety evidence, Passage 1
  {
    id: 3,
    type: "multi",
    linkedPassage: 1,
    stem: "Which details from Passage 1 support the idea that later start times improve student health and safety?",
    instructions: "Select all answers that apply. There may be more than one correct answer.",
    options: [
      "Students at later-start schools had fewer headaches and fewer nurse visits.",
      "Communities with later school start times saw a decrease in morning car accidents involving teen drivers.",
      "One district in Colorado saw chronic absenteeism drop by 12% after starting later.",
      "Many students with a 7:30 a.m. start time wake up between 5:30 and 6:00 a.m."
    ],
    // A & B directly support health/safety (headaches, nurse visits, accidents)
    correctIndices: [0, 1],
    minSelections: 2,
    maxSelections: 3,
    skills: [
      "text-evidence",   // choosing evidence
      "details",         // paying attention to data points
      "health-safety",   // specific focus
      "multi-select"     // test-format skill
    ]
  },

  // 4. Select All That Apply – Problems caused by later start times, Passage 2
  {
    id: 4,
    type: "multi",
    linkedPassage: 2,
    stem: "Which details from Passage 2 support the author’s argument that moving to a later start time causes problems?",
    instructions: "Select all answers that apply.",
    options: [
      "Parents struggle to rearrange their work schedules or find extra childcare when school starts later.",
      "Practices and rehearsals often run later into the evening, leaving students with less free time.",
      "Students learn to wake up early, prepare, and arrive on time, just like in real-world jobs.",
      "Bus routes became longer and traffic heavier when districts changed to a later school start time."
    ],
    // A: family schedule issues; B: after-school runs late; D: transportation problems
    correctIndices: [0, 1, 3],
    minSelections: 2,
    maxSelections: 4,
    skills: [
      "text-evidence",
      "details",
      "problem-solution",
      "multi-select"     // test-format skill
    ]
  },

  // 5. Chronological Order – Flow of ideas, Passage 1
  {
    id: 5,
    type: "order",
    linkedPassage: 1,
    stem: "Put these ideas from Passage 1 in the order they appear in the text.",
    instructions: "Drag and drop the ideas so they appear from first to last.",
    // Scrambled starting order — none in the correct position
    items: [
      { id: "e2", text: "The author describes a study showing students at later-start schools are healthier and less tired." },
      { id: "e4", text: "The author explains that later start times lead to safer travel for students in the morning." },
      { id: "e1", text: "The author explains how much sleep middle-school students need and how early schedules make this difficult." },
      { id: "e3", text: "The author gives an example of a district where attendance improved after starting school later." }
    ],
    // Correct sequence
    correctOrder: ["e1", "e2", "e3", "e4"],
    skills: [
      "chronological-order", // ordering ideas/events
      "text-structure",      // noticing how the argument is built
      "passage-1",
      "drag-drop"            // test-format skill
    ]
  },

  // 6. Chronological Order – Flow of ideas, Passage 2
  {
    id: 6,
    type: "order",
    linkedPassage: 2,
    stem: "Sequence the ideas from Passage 2 in the order they are presented.",
    instructions: "Drag and drop the ideas so they are in the correct sequence.",
    // Different scramble pattern, no piece starts in the right place
    items: [
      { id: "s3", text: "The author explains that earlier start times teach real-world responsibility and time management." },
      { id: "s1", text: "The author explains how earlier start times fit with parents’ work schedules." },
      { id: "s4", text: "The author discusses transportation problems that appear when schools move to later start times." },
      { id: "s2", text: "The author describes how later start times push after-school activities later into the evening." }
    ],
    correctOrder: ["s1", "s2", "s3", "s4"],
    skills: [
      "chronological-order",
      "text-structure",
      "cause-effect",
      "passage-2",
      "drag-drop"            // test-format skill
    ]
  },

  // 7. Matching – Claim, reason, evidence, Passage 1
  {
    id: 7,
    type: "match",
    linkedPassage: 1,
    stem: "Match each part of the argument in Passage 1 with the best description.",
    instructions: "Drag the descriptions into the boxes to match the argument parts.",
    left: [
      { id: "m1", text: "Claim" },
      { id: "m2", text: "Reason" },
      { id: "m3", text: "Evidence" }
    ],
    right: [
      { id: "r1", text: "A statement that school should start later to help students be healthier and more focused." },
      { id: "r2", text: "Information from research, such as a study showing fewer headaches and nurse visits at later-start schools." },
      { id: "r3", text: "An explanation of why more sleep helps students get the rest they need to learn and stay healthy." }
    ],
    pairs: {
      m1: "r1",
      m2: "r3",
      m3: "r2"
    },
    skills: [
      "argument-structure", // claim-reason-evidence roles
      "claim",
      "reason",
      "text-evidence",
      "matching"            // test-format skill
    ]
  },

  // 8. Matching – Types of support, Passage 2
  {
    id: 8,
    type: "match",
    linkedPassage: 2,
    stem: "Match each part of the author’s argument in Passage 2 with what it focuses on.",
    instructions: "Drag the descriptions into the boxes to match the ideas.",
    left: [
      { id: "f1", text: "Family impact" },
      { id: "f2", text: "After-school activities" },
      { id: "f3", text: "Transportation issue" }
    ],
    right: [
      { id: "g1", text: "Parents’ work schedules are harder to manage when school starts later, so they may need extra childcare." },
      { id: "g2", text: "Practices, rehearsals, or tutoring sessions run later into the evening after start times move to 8:30 a.m." },
      { id: "g3", text: "Bus routes become longer, traffic gets heavier, and other schools’ schedules are affected when start times change." }
    ],
    pairs: {
      f1: "g1",
      f2: "g2",
      f3: "g3"
    },
    skills: [
      "argument-structure",
      "details",
      "cause-effect",
      "matching"            // test-format skill
    ]
  },

  // 9. Highlight Sentences – Evidence about tiredness, Passage 1
  {
    id: 9,
    type: "highlight",
    linkedPassage: 1,
    stem: "Which sentences from Passage 1 give specific evidence that later start times reduce how tired students feel?",
    instructions: "Click to highlight all the sentences that are evidence, not just opinions. You may select more than one.",
    sentences: [
      {
        id: "h1",
        text: "Research shows that students who get more sleep perform better in class, feel happier, and make healthier choices throughout the day.",
        correct: false
      },
      {
        id: "h2",
        text: "The study found that students at later-start schools had fewer headaches, fewer nurse visits, and reported higher energy levels.",
        correct: true
      },
      {
        id: "h3",
        text: "The percentage of students who reported feeling “very tired” during the school day dropped from 56% to 31%.",
        correct: true
      },
      {
        id: "h4",
        text: "A later start time is a simple change that would make a big difference.",
        correct: false
      }
    ],
    skills: [
      "text-evidence",
      "details",
      "close-reading",
      "distinguish-fact-opinion",
      "highlight"           // test-format skill
    ]
  },

  // 10. Highlight Sentences – Author’s opinion, Passage 2
  {
    id: 10,
    type: "highlight",
    linkedPassage: 2,
    stem: "Which sentences from Passage 2 show the author’s opinion rather than just a fact?",
    instructions: "Click to highlight all of the sentences that reveal the author’s opinion. You may select more than one.",
    sentences: [
      {
        id: "k1",
        text: "Should our school consider keeping its current start time?",
        correct: true
      },
      {
        id: "k2",
        text: "I believe starting school earlier in the morning is better for families, teachers, and the community.",
        correct: true
      },
      {
        id: "k3",
        text: "Districts that changed to a later start reported longer bus rides, heavier traffic, and higher transportation costs.",
        correct: false
      },
      {
        id: "k4",
        text: "In some cases, younger elementary students were forced to begin even earlier to make the schedule work.",
        correct: false
      }
    ],
    skills: [
      "author-opinion",
      "distinguish-fact-opinion",
      "close-reading",
      "highlight"           // test-format skill
    ]
  },

  // 11. Dropdown – Author meaning, Passage 1
  {
    id: 11,
    type: "dropdown",
    linkedPassage: 1,
    stem: "Select the option that best completes the sentence so it matches the author’s meaning in Passage 1.",
    sentenceParts: [
      "The author believes that changing the school start time would ",
      " student health and safety."
    ],
    options: ["slightly change", "improve", "not affect"],
    correctIndex: 1,
    skills: [
      "author-meaning",      // keeping the meaning aligned with the passage
      "precision-language",  // choosing the most accurate phrasing
      "dropdown"             // test-format skill
    ]
  },

  // 12. Dropdown – Stronger phrasing, Passage 2
  {
    id: 12,
    type: "dropdown",
    linkedPassage: 2,
    stem: "Choose the phrase that most clearly expresses the author’s opinion in Passage 2.",
    sentenceParts: [
      "The author argues that earlier start times are ",
      " for families and the community."
    ],
    options: ["somewhat okay", "often confusing", "better overall"],
    correctIndex: 2,
    skills: [
      "author-opinion",      // matching the author's opinion
      "precision-language",  // stronger, clearer phrasing
      "dropdown"             // test-format skill
    ]
  },

  // 13. Classification – Health vs Attendance (Passage 1)
  {
    id: 13,
    type: "classify",
    linkedPassage: 1,
    stem: "Sort each detail into the category it best supports in Passage 1.",
    instructions: "Drag each detail into the correct column.",
    categories: [
      { id: "health", label: "Health & Tiredness" },
      { id: "attendance", label: "Attendance & Participation" }
    ],
    items: [
      {
        id: "c1",
        text: "Students at later-start schools had fewer headaches and fewer nurse visits.",
        categoryId: "health"
      },
      {
        id: "c2",
        text: "The percentage of students who reported feeling “very tired” dropped from 56% to 31%.",
        categoryId: "health"
      },
      {
        id: "c3",
        text: "One district in Colorado saw chronic absenteeism drop by 12% after starting later.",
        categoryId: "attendance"
      }
    ],
    skills: [
      "details",
      "text-evidence",
      "classify",        // conceptual skill
      "table-sorting"   // test-format skill
    ]
  },

  // 14. Classification – Family vs Activities (Passage 2)
  {
    id: 14,
    type: "classify",
    linkedPassage: 2,
    stem: "Sort each detail into the category it best supports in Passage 2.",
    instructions: "Drag each detail into the correct column.",
    categories: [
      { id: "family", label: "Family Schedules" },
      { id: "activities", label: "After-School Activities" }
    ],
    items: [
      {
        id: "c4",
        text: "Parents struggle to rearrange their work schedules or find extra childcare when school starts later.",
        categoryId: "family"
      },
      {
        id: "c5",
        text: "Practices and rehearsals often run later into the evening, leaving students with less free time.",
        categoryId: "activities"
      },
      {
        id: "c6",
        text: "Students reported feeling more rushed after school instead of less.",
        categoryId: "activities"
      }
    ],
    skills: [
      "details",
      "text-evidence",
      "classify",        // conceptual skill
      "table-sorting"   // test-format skill
    ]
  },

  // 15. Part A/B – Claim + Evidence (Passage 1)
  {
    id: 15,
    type: "partAB",
    linkedPassage: 1,
    stem: "Answer Part A and Part B about Passage 1.",
    partA: {
      label: "Part A",
      stem: "What is the best statement of the author’s claim in Passage 1?",
      options: [
        "Students should do more homework so they are ready for high school.",
        "School should start later so students can be healthier, safer, and more focused.",
        "Students should avoid walking or biking to school in the dark.",
        "Students need fewer after-school activities so they can sleep more."
      ],
      correctIndex: 1
    },
    partB: {
      label: "Part B",
      stem: "Which sentence from Passage 1 best supports your answer to Part A?",
      options: [
        "“When school starts at 7:30 a.m., many students wake up between 5:30 and 6:00 a.m.”",
        "“The percentage of students who reported feeling ‘very tired’ during the school day dropped from 56% to 31%.”",
        "“One district in Colorado saw chronic absenteeism drop by 12% after pushing back its start time.”",
        "“Researchers at the University of Minnesota found that communities with later school start times saw a 16% decrease in morning car accidents involving teen drivers.”"
      ],
      correctIndex: 3
    },
    skills: [
      "claim",
      "text-evidence",
      "argument-structure",
      "two-part"        // test-format skill
    ]
  },

  // 16. Part A/B – Reason + Evidence (Passage 2)
  {
    id: 16,
    type: "partAB",
    linkedPassage: 2,
    stem: "Answer Part A and Part B about Passage 2.",
    partA: {
      label: "Part A",
      stem: "What is one main reason the author gives for keeping an earlier start time in Passage 2?",
      options: [
        "It completely eliminates transportation problems.",
        "It allows students to sleep as late as they want.",
        "It matches many parents’ work schedules and routines.",
        "It shortens after-school activities."
      ],
      correctIndex: 2
    },
    partB: {
      label: "Part B",
      stem: "Which sentence from Passage 2 best supports your answer to Part A?",
      options: [
        "“Many parents begin work between 7:00 and 8:00 a.m., so dropping off children earlier allows families to stay on the same routine.”",
        "“Practices often ran later into the evening, leaving students with less free time.”",
        "“Bus routes became longer and traffic heavier when districts changed to a later school start time.”",
        "“In some cases, younger elementary students were forced to begin even earlier to make the schedule work.”"
      ],
      correctIndex: 0
    },
    skills: [
      "reason",
      "text-evidence",
      "argument-structure",
      "two-part"        // test-format skill
    ]
  },

  // 17. Classification – Which passage? (Claims)
  {
    id: 17,
    type: "classify",
    // no single linkedPassage because this uses BOTH passages
    stem: "Sort each statement into the passage it best describes.",
    instructions: "Drag each statement into the correct column. Use both Passage 1 and Passage 2.",
    categories: [
      { id: "p1", label: "Passage 1" },
      { id: "p2", label: "Passage 2" }
    ],
    items: [
      {
        id: "cp1",
        text: "Argues that later school start times help students be healthier, more rested, and safer.",
        categoryId: "p1"
      },
      {
        id: "cp2",
        text: "Argues that earlier school start times work better for families, activities, and the community.",
        categoryId: "p2"
      },
      {
        id: "cp3",
        text: "Focuses on benefits like fewer nurse visits, fewer headaches, and improved attendance.",
        categoryId: "p1"
      },
      {
        id: "cp4",
        text: "Focuses on matching parents’ work schedules and keeping after-school activities on track.",
        categoryId: "p2"
      }
    ],
    skills: [
      "compare-passages",
      "claim",
      "details",
      "classify",        // conceptual skill
      "table-sorting"   // test-format skill
    ]
  },

  // 18. Classification – Which passage? (Details/Evidence)
  {
    id: 18,
    type: "classify",
    stem: "Sort each detail into the passage it comes from or best matches.",
    instructions: "Drag each detail into the correct column. Use clues from both passages.",
    categories: [
      { id: "p1", label: "Passage 1" },
      { id: "p2", label: "Passage 2" }
    ],
    items: [
      {
        id: "cp5",
        text: "Reports that the percentage of students who felt “very tired” dropped from 56% to 31%.",
        categoryId: "p1"
      },
      {
        id: "cp6",
        text: "Describes a 16% decrease in morning car accidents involving teen drivers after later start times.",
        categoryId: "p1"
      },
      {
        id: "cp7",
        text: "Explains that many parents would struggle to rearrange work schedules or find extra childcare.",
        categoryId: "p2"
      },
      {
        id: "cp8",
        text: "Says that practices and rehearsals often run later into the evening when school starts later.",
        categoryId: "p2"
      }
    ],
    skills: [
      "compare-passages",
      "details",
      "text-evidence",
      "classify",        // conceptual skill
      "table-sorting"   // test-format skill
    ]
  },

  // 19. Sentence Revision – Stronger wording, Passage 1
  {
    id: 19,
    type: "revise",
    linkedPassage: 1,
    stem: "Improve the sentence so it best matches the author’s tone and meaning in Passage 1.",
    originalSentence: "Starting school later might be kind of helpful for students who feel tired during the day.",
    sentenceParts: [
      "Starting school later would be ",
      " for students who feel tired during the day."
    ],
    options: [
      "kind of helpful",
      "a little better",
      "very beneficial"
    ],
    correctIndex: 2,
    skills: [
      "revise-sentence",
      "precision-language",
      "clarity",
      "revise"           // test-format skill
    ]
  },

  // 20. Sentence Revision – Clearer claim, Passage 2
  {
    id: 20,
    type: "revise",
    linkedPassage: 2,
    stem: "Choose the revision that makes the author’s opinion in Passage 2 clearer and stronger.",
    originalSentence: "Keeping an earlier start time is sort of okay for families and the community.",
    sentenceParts: [
      "Keeping an earlier start time is ",
      " for families and the community."
    ],
    options: [
      "sort of okay",
      "often a good fit",
      "the best possible choice in every situation"
    ],
    // “often a good fit” is strong and realistic; “best possible choice in every situation”
    // is too extreme and not supported by the text
    correctIndex: 1,
    skills: [
      "revise-sentence",
      "author-opinion",
      "precision-language",
      "tone",
      "revise"           // test-format skill
    ]
  },

  // 21. MCQ – Audio debate, counterargument (Passages 1 & 2 + audio)
  {
    id: 21,
    type: "mcq",
    // Uses BOTH passages plus the audio; leaving this null is fine since it's multi-source.
    linkedPassage: null,
    media: {
      type: "audio",
      // change to "media/reading-lesson-1.mp4" if your file lives in a /media folder
      src: "reading-lesson-1.mp4",
      captions: "later-start-times-debate.vtt",
      label: "Audio Debate: Later School Start Times"
    },
    stem: "Use Passages 1 and 2 and the audio debate. How does the second speaker counter the argument that later school start times must be a “non-negotiable priority” for safety?",
    instructions: "Listen to the debate, then choose the best answer.",
    options: [
      "By arguing that later start times have no real effect on teen sleep.",
      "By pointing out that later start times create serious problems for families and after-school activities.",
      "By claiming that earlier start times improve students’ health more than sleep does.",
      "By insisting that transportation budgets always decrease when start times are changed."
    ],
    correctIndex: 1,
    skills: [
      "listening-comprehension", // audio-based understanding
      "evaluate-argument",       // weighing arguments/claims
      "counterclaim",            // how one speaker responds to another
      "compare-passages",        // uses both passages + audio
      "audio-media",             // multimedia skill tag
      "mcq"                      // test-format skill
    ]
  },

 // 22. MCQ – Audio debate, counterargument (Passages 1 & 2 + audio)
  {
  id: 22,
  type: "mcq",
  linkedPassage: null,
  media: {
    type: "audio",
    src: "reading-lesson-1.mp4",
    captions: "later-start-times-debate.vtt",
    label: "Audio Debate: Later School Start Times"
  },
  stem: "Based on the audio debate, what is the main disagreement between the two speakers?",
  instructions: "Use information from both passages and the audio debate to choose the best answer.",
  options: [
    "Whether students need more sleep than adults.",
    "Whether the health and safety benefits of later start times outweigh the scheduling problems they create for families and communities.",
    "Whether after-school activities are more important than academic learning.",
    "Whether schools should eliminate extracurricular activities to reduce stress."
  ],
  correctIndex: 1,
  skills: [
    "central-idea",
    "compare-passages",
    "evaluate-argument",
    "listening-comprehension",
    "audio-media",
    "mcq"
  ]
},

{
  id: 23,
  type: "mcq",
  linkedPassage: 1,
  media: {
    type: "audio",
    src: "reading-lesson-1.mp4",
    captions: "later-start-times-debate.vtt",
    label: "Audio Debate: Later School Start Times"
  },
  stem: "How does the graph in Passage 1 most clearly support a claim made by Speaker 1 in the audio debate?",
  instructions: "Use the graph and the audio to answer the question.",
  options: [
    "The graph proves that students at all schools sleep the same amount of time.",
    "The graph shows that later start times sharply reduce the percentage of students who feel very tired, supporting Speaker 1’s argument about improved health and alertness.",
    "The graph shows that after-school participation decreases when school starts later.",
    "The graph reveals that transportation costs always increase when start times change."
  ],
  correctIndex: 1,
  skills: [
    "graph-analysis",
    "text-evidence",
    "evaluate-argument",
    "synthesis",
    "audio-media",
    "mcq"
  ]
},

  //24. MCQ - Video debate, inference
  {
  id: 24,
  type: "mcq",
  linkedPassage: null,
  media: {
    type: "video",
    src: "video-clip.mp4",
    captions: "video-clip-captions.vtt", // optional; remove if you aren't adding captions
    label: "Video Report: The School Start Time Debate"
  },
  stem: "Based on the video, which inference can the viewer make about why communities struggle to agree on school start times?",
  instructions: "Watch the video, then choose the answer that is supported by evidence but not directly stated.",
  options: [
    "Most communities prefer to change start times every few years to test new schedules.",
    "Both sides have valid concerns, so any decision will create a trade-off that affects different groups in different ways.",
    "Students generally agree that earlier start times are the best way to prepare for future careers.",
    "The majority of parents believe that later start times will automatically fix every problem schools face."
  ],
  correctIndex: 1,
  skills: [
    "inference",
    "synthesis",
    "evaluate-argument",
    "listening-comprehension",
    "multimedia-analysis",
    "video",
    "mcq"
  ]
},

{
  id: 25,
  type: "mcq",
  linkedPassage: null,
  media: {
    type: "video",
    src: "video-clip.mp4",
    captions: "video-clip-captions.vtt",
    label: "Video Report: The School Start Time Debate"
  },
  stem: "Based on the video and the passages, which statement best explains why changing school start times is such a difficult decision for communities?",
  instructions: "Use information from the video and both passages to infer the best answer.",
  options: [
    "Most communities change their school schedules every year and are used to rapid adjustments.",
    "The evidence shows that only one side of the debate has meaningful concerns.",
    "Any schedule change creates trade-offs that affect student health, family routines, transportation, and after-school activities.",
    "Most parents and students want to eliminate extracurricular activities to simplify the schedules."
  ],
  correctIndex: 2,
  skills: [
    "inference",
    "synthesis",
    "compare-passages",
    "evaluate-argument",
    "multimedia-analysis",
    "video",
    "mcq"
  ]
}


];

function logQuestionResult(q, extra = {}) {
  if (!window.RP_REPORT || typeof RP_REPORT.recordQuestionResult !== "function") {
    return;
  }

  // If the renderer didn't pass q explicitly, fall back to currentQuestionIndex
  const questionObj = q || questions[currentQuestionIndex];
  if (!questionObj) return;

  const isCorrect = !!extra.isCorrect;
  const rest = { ...extra };
  delete rest.isCorrect;

  RP_REPORT.recordQuestionResult(questionObj, {
    isCorrect,
    ...rest
  });
}


// ====== STATE ======
let currentQuestionIndex = 0;
let answered = false;
let answeredQuestions = new Array(questions.length).fill(false);

// DOM references
const questionNumberEl = document.getElementById("question-number");
//const questionTotalEl = document.getElementById("question-total");
const questionTypeLabelEl = document.getElementById("question-type-label");
const linkedPassageLabelEl = document.getElementById("linked-passage-label");
const questionStemEl = document.getElementById("question-stem");
const questionInstructionsEl = document.getElementById("question-instructions");
const questionOptionsEl = document.getElementById("question-options");
const questionFeedbackEl = document.getElementById("question-feedback");
const checkAnswerBtn = document.getElementById("check-answer-btn");
const nextQuestionBtn = document.getElementById("next-question-btn");

const passageTabs = document.querySelectorAll(".passage-tab");
const passages = document.querySelectorAll(".passage");
const studentGoogleBtn = document.getElementById("rp-google-signin");
const authStatusEl = document.getElementById("rp-auth-status");
const sessionStatusEl = document.getElementById("rp-session-status");

// ====== PASSAGE & QUESTION HIGHLIGHTING (SELECTION-BASED) ======
const passageScrollEl = document.querySelector(".passage-scroll");


// ===== START SESSION BAR (student) =====

// Read from URL
function getSessionCodeFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("session");
  return code ? code.trim() : "";
}

function getClassCodeFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const val = params.get("class");
  return val ? val.trim() : "";
}

const SESSION_CODE = getSessionCodeFromUrl();
const URL_CLASS_CODE = getClassCodeFromUrl();

let rpSessionInitialized = false;

function beginTrainerSession({ studentName, classCode, sessionCode }) {
  if (rpSessionInitialized) return;
  rpSessionInitialized = true;

  const cleanName = (studentName || "").trim();
  const cleanClass = (classCode || "").trim();
  const cleanSession = (sessionCode || SESSION_CODE || "").trim();

  if (!cleanSession) {
    console.warn("[RP] beginTrainerSession called without a sessionCode.");
  }

  // Tell reporting who this is
  if (window.RP_REPORT && typeof RP_REPORT.setSessionInfo === "function") {
    RP_REPORT.setSessionInfo({
      studentName: cleanName,
      classCode: cleanClass,
      sessionCode: cleanSession,
      assessmentName: ASSESSMENT_NAME
    });
  }

  // Optional: let reporting.js log a "joined" event
  if (window.RP_REPORT && typeof RP_REPORT.sendSessionStart === "function") {
    RP_REPORT.sendSessionStart();
  }

  // Hide any start screen, show trainer screen if you still use them
  if (startScreenEl) startScreenEl.style.display = "none";
  if (trainerScreenEl) trainerScreenEl.style.display = "block";

  // Render first question if the question UI exists
  if (questionStemEl && questionOptionsEl) {
    renderQuestion();
  }
}


// Optional screen containers (if you still use them)
const startScreenEl = document.getElementById("start-screen");
const trainerScreenEl = document.getElementById("trainer-screen");

// New session bar inputs
const studentNameInput = document.getElementById("rp-student-name");
const classCodeInput = document.getElementById("rp-class-code");
const sessionCodeInput = document.getElementById("rp-session-code");
const startBtn = document.getElementById("rp-start-session");
const startErrorMsg = document.getElementById("rp-session-status");

// Pre-fill session + class from URL if present
if (sessionCodeInput && SESSION_CODE) {
  sessionCodeInput.value = SESSION_CODE;
  sessionCodeInput.readOnly = true;
}

if (classCodeInput && URL_CLASS_CODE) {
  classCodeInput.value = URL_CLASS_CODE;
}
// ===== IDENTITY MODAL (student) =====
const identityModalEl = document.getElementById("rp-identity-modal");
const identityNameInput = document.getElementById("rp-id-name");
const identityClassInput = document.getElementById("rp-id-class");
const identityGoogleBtn = document.getElementById("rp-id-google");
const identityContinueBtn = document.getElementById("rp-id-continue");
const identityErrorEl = document.getElementById("rp-id-error");

function showIdentityModal() {
  if (!identityModalEl || rpSessionInitialized) return;

  // Prefill class from URL if available
  if (identityClassInput && URL_CLASS_CODE && !identityClassInput.value) {
    identityClassInput.value = URL_CLASS_CODE;
  }

  identityModalEl.classList.add("active");
  identityModalEl.setAttribute("aria-hidden", "false");
  if (identityNameInput) {
    identityNameInput.focus();
  }
}

function hideIdentityModal() {
  if (!identityModalEl) return;
  identityModalEl.classList.remove("active");
  identityModalEl.setAttribute("aria-hidden", "true");
}

if (identityContinueBtn) {
  identityContinueBtn.addEventListener("click", () => {
    if (rpSessionInitialized) return;
    const name = (identityNameInput?.value || "").trim();
    const classCode = (identityClassInput?.value || "").trim();
    const sessionCode = (sessionCodeInput?.value || SESSION_CODE || "").trim();

    if (!name) {
      if (identityErrorEl) {
        identityErrorEl.textContent = "Please type your name to continue.";
      }
      return;
    }

    if (!sessionCode) {
      if (identityErrorEl) {
        identityErrorEl.textContent =
          "This link is missing a session code. Ask your teacher for the correct link.";
      }
      return;
    }

    if (identityErrorEl) identityErrorEl.textContent = "";

    // NEW: sync into the main form fields so everything matches
    if (studentNameInput) {
      studentNameInput.value = name;
    }
    if (classCodeInput && classCode) {
      classCodeInput.value = classCode;
    }
    if (sessionCodeInput && sessionCode) {
      sessionCodeInput.value = sessionCode;
    }

    hideIdentityModal();
    beginTrainerSession({ studentName: name, classCode, sessionCode });
  });
}


if (identityGoogleBtn) {
  identityGoogleBtn.addEventListener("click", () => {
    if (!window.RP_AUTH) {
      alert("Google sign-in is not ready yet. Please try again in a moment.");
      return;
    }
    RP_AUTH.promptSignIn();
  });
}

// Start button behavior
if (startBtn) {
  startBtn.addEventListener("click", () => {
    if (rpSessionInitialized) return;
    const name = (studentNameInput?.value || "").trim();
    const classCode = (classCodeInput?.value || "").trim();
    const sessionCode = (sessionCodeInput?.value || SESSION_CODE || "").trim();

    if (!name) {
      if (startErrorMsg) {
        startErrorMsg.textContent = "Please type your name before starting.";
        startErrorMsg.classList.add("error");
      }
      return;
    }

    if (!sessionCode) {
      if (startErrorMsg) {
        startErrorMsg.textContent =
          "This link is missing a session code. Ask your teacher for the correct link.";
        startErrorMsg.classList.add("error");
      }
      return;
    }

    if (startErrorMsg) {
      startErrorMsg.textContent = "Session started! Scroll down to answer the questions.";
      startErrorMsg.classList.remove("error");
    }

    hideIdentityModal();
    beginTrainerSession({ studentName: name, classCode, sessionCode });
  });
}


// Google auth wiring for student page
if (window.RP_AUTH) {
  RP_AUTH.onAuthChange((user) => {
    if (user) {
      // Auto-fill name field(s)
      const displayName = user.name || user.email || "";
      const nameInput = document.getElementById("rp-student-name");
      if (nameInput && !nameInput.value.trim()) {
        nameInput.value = displayName;
      }
      if (identityNameInput && !identityNameInput.value.trim()) {
        identityNameInput.value = displayName;
      }

      if (authStatusEl) {
        authStatusEl.textContent = `Signed in as ${user.email}. Your progress will sync across devices.`;
      }

      // If we haven't started the session yet, and we have a session code, auto-start.
      const sessionCode = (sessionCodeInput?.value || SESSION_CODE || "").trim();
      if (!rpSessionInitialized && sessionCode) {
        const classCode = (classCodeInput?.value || URL_CLASS_CODE || "").trim();
        hideIdentityModal();
        beginTrainerSession({
          studentName: displayName,
          classCode,
          sessionCode
        });
      }
    } else {
      if (authStatusEl) {
        authStatusEl.textContent =
          "Google sign-in saves your progress across devices. Local saving is also enabled.";
      }
      // If they sign out mid-session, we do NOT end the session.
    }
  });

  RP_AUTH.initGoogleAuth();
}


if (studentGoogleBtn) {
  studentGoogleBtn.addEventListener("click", () => {
    if (!window.RP_AUTH) {
      alert("Google sign-in is not ready yet. Please try again in a moment.");
      return;
    }
    RP_AUTH.promptSignIn();
  });
}


// Optional: keep for future logic if you want to inspect colors
const PASSAGE_HL_CLASSES = [
  "passage-hl-yellow",
  "passage-hl-green",
  "passage-hl-blue",
  "passage-hl-pink"
];

const QUESTION_HL_CLASSES = [
  "q-hl-yellow",
  "q-hl-green",
  "q-hl-blue",
  "q-hl-pink"
];

// Helper to get the currently visible passage <article>
function getActivePassageElement() {
  return document.querySelector(".passage.active");
}

/**
 * Wrap the current selection inside `containerEl` in a wrapper span.
 * Uses extractContents() to avoid InvalidStateError when selection touches
 * inline elements like <strong>, <em>, etc.
 */
function applySelectionHighlight(containerEl, mode) {
  if (!currentHighlightColor || !containerEl) return;

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);

  // Ignore empty selections or selections that are outside this container
  if (
    selection.isCollapsed ||
    !containerEl.contains(range.commonAncestorContainer) ||
    !range.toString().trim()
  ) {
    return;
  }

  // Build the wrapper span with the correct classes
  const wrapper = document.createElement("span");
  if (mode === "passage") {
    wrapper.classList.add("passage-highlight", `passage-hl-${currentHighlightColor}`);
  } else if (mode === "question") {
    wrapper.classList.add("q-highlight", `q-hl-${currentHighlightColor}`);
  }
  wrapper.dataset.highlightColor = currentHighlightColor;

  try {
    const contents = range.extractContents();
    wrapper.appendChild(contents);
    range.insertNode(wrapper);
    // Clear the native blue selection
    selection.removeAllRanges();
  } catch (err) {
    console.error("Highlight error:", err);
  }
}


// Mouseup in the passage area → highlight inside the ACTIVE passage only
if (passageScrollEl) {
  passageScrollEl.addEventListener("mouseup", () => {
    const activePassage = getActivePassageElement();
    if (activePassage) {
      applySelectionHighlight(activePassage, "passage");
    }
  });
}

// Mouseup on the question stem → highlight selection in the stem
if (questionStemEl) {
  questionStemEl.addEventListener("mouseup", () => {
    applySelectionHighlight(questionStemEl, "question");
  });
}

/**
 * Utility to unwrap highlight spans (keeps the text, removes the span).
 */
function unwrapHighlightSpan(span) {
  const parent = span.parentNode;
  while (span.firstChild) {
    parent.insertBefore(span.firstChild, span);
  }
  parent.removeChild(span);
}

/**
 * Clear ALL passage highlights (any color).
 */
function clearPassageHighlights() {
  const activePassage = getActivePassageElement();
  if (!activePassage) return;

  const spans = activePassage.querySelectorAll(".passage-highlight");
  spans.forEach(unwrapHighlightSpan);
}


/**
 * Clear ALL question highlights (any color) from the stem.
 */
function clearQuestionHighlights() {
  if (!questionStemEl) return;
  const spans = questionStemEl.querySelectorAll(".q-highlight");
  spans.forEach(unwrapHighlightSpan);
}


// ====== HELPERS ======
function setActivePassage(passageNumber) {
  passageTabs.forEach((tab) => {
    const isActive = tab.dataset.passage === String(passageNumber);
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  passages.forEach((p) => {
    const isActive = p.dataset.passage === String(passageNumber);
    p.classList.toggle("active", isActive);
  });
}

function resetFeedback() {
  questionFeedbackEl.textContent = "";
  questionFeedbackEl.classList.remove("ok", "error");
}

function setFeedback(message, isOK = true) {
  questionFeedbackEl.textContent = message;
  questionFeedbackEl.classList.toggle("ok", isOK);
  questionFeedbackEl.classList.toggle("error", !isOK);
}

function getTypeLabel(type) {
  switch (type) {
    case "mcq":
      return "Multiple Choice";
    case "multi":
      return "Select All That Apply";
    case "order":
      return "Chronological Order";
    case "match":
      return "Matching";
    case "highlight":
      return "Text Evidence (Highlight)";
    case "dropdown":
      return "Inline Choice";
    case "classify":
      return "Classification Table";
    case "partAB":
      return "Part A & Part B"
    case "revise":
      return "Sentence Revision"; 
    default:
      return "Question";
  }
}

function initQuestionNavStrip() {
  const strip = document.getElementById("question-nav-strip");
  if (!strip) return;

  strip.innerHTML = "";

  questions.forEach((q, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "q-nav-btn";
    btn.dataset.index = String(index);
    btn.textContent = index + 1; // show 1–10

    btn.addEventListener("click", () => {
      currentQuestionIndex = index;
      renderQuestion();
    });

    strip.appendChild(btn);
  });

  updateQuestionNavStrip();
}
initHighlightToolbars();

function updateQuestionNavStrip() {
  const strip = document.getElementById("question-nav-strip");
  if (!strip) return;

  const buttons = strip.querySelectorAll(".q-nav-btn");
  buttons.forEach((btn) => {
    const idx = Number(btn.dataset.index);
    btn.classList.toggle("current", idx === currentQuestionIndex);
    btn.classList.toggle("answered", answeredQuestions[idx]);
  });
}

function markQuestionAnswered() {
  answeredQuestions[currentQuestionIndex] = true;
  updateQuestionNavStrip();
}

const questionTotalEl = document.getElementById("question-total");

// Only update the total if that element exists on this page
if (questionTotalEl) {
  questionTotalEl.textContent = questions.length.toString();
}

// Safe even if the strip doesn’t exist (function exits early)
initQuestionNavStrip();


// ====== MEDIA RENDERING (audio / video with subtitles support) ======
function renderMediaIfPresent(q) {
  if (!q.media) return;

  const { type, src, captions, label } = q.media || {};
  if (!src || (type !== "audio" && type !== "video")) return;

  const wrapper = document.createElement("div");
  wrapper.className = "question-media";

  // 🔥 IMPORTANT:
  // Browsers DO NOT show captions on <audio>.
  // If captions exist, we MUST switch to <video>.
  const useVideo = !!captions || type === "video";
  const player = document.createElement(useVideo ? "video" : "audio");

  player.className = "question-media-player";
  player.controls = true;
  player.preload = "metadata";
  player.src = src;

  // Make video-style audio player look nice
  if (useVideo) {
    player.style.width = "100%";
    player.style.maxWidth = "520px";
  }

  // Add captions track if present
  if (captions) {
    const track = document.createElement("track");
    track.kind = "captions"; 
    track.src = captions;
    track.srclang = "en";
    track.label = label || "English";
    track.default = true;
    player.appendChild(track);
  }

  wrapper.appendChild(player);

  if (label) {
    const labelEl = document.createElement("p");
    labelEl.className = "media-caption";
    labelEl.textContent = label;
    wrapper.appendChild(labelEl);
  }

  // Insert media block into question area
  questionOptionsEl.appendChild(wrapper);
}




// ====== RENDERING ======
function renderQuestion() {
    if (
    !questionNumberEl ||
    !questionTypeLabelEl ||
    !questionStemEl ||
    !questionInstructionsEl ||
    !questionOptionsEl ||
    !questionFeedbackEl
  ) {
    return;
  }
  const q = questions[currentQuestionIndex];
  answered = false;

  // Progress + type label
  questionNumberEl.textContent = (currentQuestionIndex + 1).toString();
  questionTypeLabelEl.textContent = getTypeLabel(q.type);
  // Stem and instructions
  questionStemEl.textContent = q.stem;
  questionInstructionsEl.textContent = q.instructions || "";

  // Reset question stem highlight for each new question
  questionStemEl.classList.remove(
    "q-highlight",
    "q-hl-yellow",
    "q-hl-green",
    "q-hl-blue",
    "q-hl-pink"
  );
  delete questionStemEl.dataset.highlightColor;

  // Linked passage helper label
  if (q.linkedPassage === 1 || q.linkedPassage === 2) {
    linkedPassageLabelEl.textContent = `Tip: You may want to look back at Passage ${q.linkedPassage}.`;
    setActivePassage(q.linkedPassage);
  } else {
    linkedPassageLabelEl.textContent = "";
  }

  // Stem and instructions
  questionStemEl.textContent = q.stem;
  questionInstructionsEl.textContent = q.instructions || "";

  // Reset area
  questionOptionsEl.innerHTML = "";
  resetFeedback();
  checkAnswerBtn.disabled = true;
  nextQuestionBtn.disabled = true;

    // 🔊 Render media (audio/video) if this question has it
  renderMediaIfPresent(q);

  // Render by type
  if (q.type === "mcq") {
    renderMCQ(q);
  } else if (q.type === "multi") {
    renderMulti(q);
  } else if (q.type === "order") {
    renderOrder(q);
  } else if (q.type === "match") {
    renderMatch(q);
  } else if (q.type === "highlight") {
    renderHighlight(q);
  } else if (q.type === "dropdown") {
    renderDropdown(q); 
  } else if (q.type === "classify") {
    renderClassify(q); 
  } else if (q.type === "partAB") {
    renderPartAB(q);
  } else if (q.type === "revise") {
    renderRevise(q);    
  }

  updateQuestionNavStrip();

}

// ====== TYPE: MCQ ======
function renderMCQ(q) {
  const list = document.createElement("div");
  list.className = "choice-list";

  let selectedIndex = null;

  q.options.forEach((optText, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice-btn";
    btn.dataset.index = String(index);

    const labelSpan = document.createElement("span");
    labelSpan.className = "choice-btn-label";
    labelSpan.textContent = String.fromCharCode(65 + index) + ".";

    const contentSpan = document.createElement("span");
    contentSpan.className = "choice-btn-content";
    contentSpan.textContent = optText;

    btn.appendChild(labelSpan);
    btn.appendChild(contentSpan);

    // Main click: select answer. Shift-click: cross out.
    btn.addEventListener("click", (event) => {
      if (answered) return;

      if (event.shiftKey) {
        event.preventDefault();
        btn.classList.toggle("crossed-out");
        return;
      }

      selectedIndex = index;
      list.querySelectorAll(".choice-btn").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      checkAnswerBtn.disabled = false;
      resetFeedback();
    });

    // Right-click / two-finger tap also crosses out
    attachCrossOutHandlers(btn);

    list.appendChild(btn);
  });

  questionOptionsEl.appendChild(list);

checkAnswerBtn.onclick = () => {
  if (selectedIndex === null || answered) return;

  answered = true;
  markQuestionAnswered();

  const buttons = list.querySelectorAll(".choice-btn");
  const isCorrect = selectedIndex === q.correctIndex;

  buttons.forEach((b) => {
    const idx = Number(b.dataset.index);
    if (idx === q.correctIndex) {
      b.classList.add("correct");
    }
    if (idx === selectedIndex && idx !== q.correctIndex) {
      b.classList.add("incorrect");
    }
    b.disabled = true;
  });

  if (isCorrect) {
    setFeedback("Nice work! That’s the correct answer.", true);
  } else {
    setFeedback("Not quite. Check the passage again and think about the main idea.", false);
  }

  // 🔹 REPORTING HOOK
  logQuestionResult(q, {
    isCorrect,
    selectedIndex
  });

  checkAnswerBtn.disabled = true;
  nextQuestionBtn.disabled = false;
};

}

// ====== TYPE: MULTI (Select All That Apply) ======
function renderMulti(q) {
  const list = document.createElement("div");
  list.className = "choice-list";

  const selectedSet = new Set();
  const minSelections = q.minSelections || 1;

  q.options.forEach((optText, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    // use same base style, but add a hook class if you want special styling later
    btn.className = "choice-btn multi-choice";
    btn.dataset.index = String(index);

    // 🟦 NO LETTER LABEL HERE – just the text box
    const contentSpan = document.createElement("span");
    contentSpan.className = "choice-btn-content";
    contentSpan.textContent = optText;

    btn.appendChild(contentSpan);

    btn.addEventListener("click", (event) => {
      if (answered) return;

      // Shift-click to cross out without changing selection
      if (event.shiftKey) {
        event.preventDefault();
        btn.classList.toggle("crossed-out");
        return;
      }

      const idx = Number(btn.dataset.index);

      if (selectedSet.has(idx)) {
        selectedSet.delete(idx);
        btn.classList.remove("selected");
      } else {
        if (q.maxSelections && selectedSet.size >= q.maxSelections) {
          setFeedback(`You can select up to ${q.maxSelections} answers.`, false);
          return;
        }
        selectedSet.add(idx);
        btn.classList.add("selected");
      }

      resetFeedback();
      checkAnswerBtn.disabled = selectedSet.size < minSelections;
    });

    attachCrossOutHandlers(btn);


    list.appendChild(btn);
  });

  questionOptionsEl.appendChild(list);

checkAnswerBtn.onclick = () => {
  if (answered) return;

  const minSelections = q.minSelections || 1;
  if (selectedSet.size < minSelections) {
    setFeedback(
      `Select at least ${minSelections} answer${minSelections > 1 ? "s" : ""} before checking.`,
      false
    );
    return;
  }

  answered = true;
  markQuestionAnswered();

  const correctSet = new Set(q.correctIndices);
  const buttons = list.querySelectorAll(".choice-btn");

  buttons.forEach((b) => {
    const idx = Number(b.dataset.index);
    const isSelected = selectedSet.has(idx);
    const isCorrect = correctSet.has(idx);

    if (isCorrect) {
      b.classList.add("correct");
    }
    if (isSelected && !isCorrect) {
      b.classList.add("incorrect");
    }
    b.disabled = true;
  });

  const allCorrectSelected =
    [...correctSet].every((idx) => selectedSet.has(idx)) &&
    [...selectedSet].every((idx) => correctSet.has(idx));

  if (allCorrectSelected) {
    setFeedback("Great job! You selected all the correct statements.", true);
  } else {
    setFeedback(
      "Some of your choices are off. Revisit the passage and think about the author’s point of view.",
      false
    );
  }

  // 🔹 REPORTING HOOK
  logQuestionResult(q, {
    isCorrect: allCorrectSelected,
    selectedIndices: [...selectedSet],
    correctIndices: [...correctSet]
  });

  checkAnswerBtn.disabled = true;
  nextQuestionBtn.disabled = false;
};

}
// ====== TYPE: ORDER (Chronological) ======
function renderOrder(q) {
  const list = document.createElement("div");
  list.className = "order-list";

  q.items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "order-item";
    row.draggable = true;
    row.dataset.id = item.id;

    const handle = document.createElement("span");
    handle.className = "order-item-handle";
    handle.textContent = "⋮⋮";

    const textSpan = document.createElement("span");
    textSpan.textContent = item.text;

    row.appendChild(handle);
    row.appendChild(textSpan);
    list.appendChild(row);
  });

  questionOptionsEl.appendChild(list);

  let dragSrcEl = null;

  list.addEventListener("dragstart", (e) => {
    const target = e.target;
    if (!target.classList.contains("order-item") || answered) return;
    dragSrcEl = target;
    target.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
  });

  list.addEventListener("dragend", (e) => {
    const target = e.target;
    if (target.classList.contains("order-item")) {
      target.classList.remove("dragging");
    }
  });

  list.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (answered) return;
    const dragging = list.querySelector(".dragging");
    const afterElement = getDragAfterElement(list, e.clientY);
    if (!dragging) return;
    if (afterElement == null) {
      list.appendChild(dragging);
    } else {
      list.insertBefore(dragging, afterElement);
    }
  });

  function getDragAfterElement(container, y) {
    const draggableElements = [
      ...container.querySelectorAll(".order-item:not(.dragging)")
    ];

    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY, element: null }
    ).element;
  }

  checkAnswerBtn.disabled = false;

  checkAnswerBtn.onclick = () => {
    if (answered) return;

    answered = true;
    markQuestionAnswered();

    const items = [...list.querySelectorAll(".order-item")];
    const currentOrder = items.map((el) => el.dataset.id);

    // Freeze drag + clear old visual states
    items.forEach((el) => {
      el.draggable = false;
      el.classList.remove("dragging", "drag-over", "correct", "incorrect");
    });

    let allCorrect = true;
    items.forEach((el, idx) => {
      const id = currentOrder[idx];
      const correctId = q.correctOrder[idx];
      if (id === correctId) {
        el.classList.add("correct");
      } else {
        el.classList.add("incorrect");
        allCorrect = false;
      }
    });

    if (allCorrect) {
      setFeedback("Yes! You placed all the events in the correct order.", true);
    } else {
      setFeedback(
        "Some events are out of order. Use the passage to double-check the sequence.",
        false
      );
    }

    // 🔹 REPORTING HOOK
    logQuestionResult(q, {
      isCorrect: allCorrect,
      currentOrder,
      correctOrder: q.correctOrder.slice()
    });

    checkAnswerBtn.disabled = true;
    nextQuestionBtn.disabled = false;
  };
}


// ====== TYPE: MATCH ======
function renderMatch(q) {
  const layout = document.createElement("div");
  layout.className = "match-layout";

  const rowsContainer = document.createElement("div");
  rowsContainer.className = "match-rows";

  const bank = document.createElement("div");
  bank.className = "match-bank";
  bank.dataset.bank = "true";

  // Create chips
  q.right.forEach((item) => {
    const chip = document.createElement("div");
    chip.className = "match-chip";
    chip.draggable = true;
    chip.dataset.id = item.id;
    chip.textContent = item.text;
    bank.appendChild(chip);
  });

  // Create rows with drop zones
  q.left.forEach((item) => {
    const row = document.createElement("div");
    row.className = "match-row";

    const leftCell = document.createElement("div");
    leftCell.className = "match-left";
    leftCell.textContent = item.text;

    const dropZone = document.createElement("div");
    dropZone.className = "match-drop";
    dropZone.dataset.leftId = item.id;

    row.appendChild(leftCell);
    row.appendChild(dropZone);
    rowsContainer.appendChild(row);
  });

  layout.appendChild(rowsContainer);
  layout.appendChild(bank);
  questionOptionsEl.appendChild(layout);

  let draggedChip = null;

  function handleDragStart(e) {
    if (!e.target.classList.contains("match-chip") || answered) return;
    draggedChip = e.target;
    draggedChip.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragEnd(e) {
    if (draggedChip) {
      draggedChip.classList.remove("dragging");
      draggedChip = null;
    }
  }

  function handleDragOver(e) {
    if (!draggedChip || answered) return;
    e.preventDefault();
  }

  function handleDropZoneDrop(e) {
    if (!draggedChip || answered) return;
    e.preventDefault();
    const dropZone = e.currentTarget;

    // If dropZone already has a chip, move that one back to the bank
    if (dropZone.firstElementChild) {
      bank.appendChild(dropZone.firstElementChild);
    }

    dropZone.appendChild(draggedChip);
    dropZone.classList.add("filled");
  }

  function handleBankDrop(e) {
    if (!draggedChip || answered) return;
    e.preventDefault();
    bank.appendChild(draggedChip);
  }

  // Listeners
  questionOptionsEl.addEventListener("dragstart", handleDragStart);
  questionOptionsEl.addEventListener("dragend", handleDragEnd);

  const dropZones = questionOptionsEl.querySelectorAll(".match-drop");
  dropZones.forEach((dz) => {
    dz.addEventListener("dragover", handleDragOver);
    dz.addEventListener("drop", handleDropZoneDrop);
  });

  bank.addEventListener("dragover", handleDragOver);
  bank.addEventListener("drop", handleBankDrop);

  checkAnswerBtn.disabled = false;

  checkAnswerBtn.onclick = () => {
    if (answered) return;
    answered = true;
  markQuestionAnswered();
    dropZones.forEach((dz) => {
      const leftId = dz.dataset.leftId;
      const correctRightId = q.pairs[leftId];
      const chip = dz.firstElementChild;

      dz.classList.remove("correct", "incorrect");

      if (!chip) {
        dz.classList.add("incorrect");
        return;
      }

      const chosenId = chip.dataset.id;
      if (chosenId === correctRightId) {
        dz.classList.add("correct");
      } else {
        dz.classList.add("incorrect");
      }
    });

    const allCorrect = [...dropZones].every((dz) =>
      dz.classList.contains("correct")
    );

    if (allCorrect) {
      setFeedback("Awesome! All your matches are correct.", true);
    } else {
      setFeedback("Some matches are not correct yet. Recheck how each description fits the term.", false);
    }
// Build a mapping of leftId -> chosen rightId (or null)
const mapping = {};
dropZones.forEach((dz) => {
  const leftId = dz.dataset.leftId;
  const chip = dz.firstElementChild;
  mapping[leftId] = chip ? chip.dataset.id : null;
});

// 🔹 REPORTING HOOK
logQuestionResult(q, {
  isCorrect: allCorrect,
  pairs: mapping
});

    // Disable further dragging
    const allChips = questionOptionsEl.querySelectorAll(".match-chip");
    allChips.forEach((chip) => (chip.draggable = false));

    checkAnswerBtn.disabled = true;
    nextQuestionBtn.disabled = false;
  };
}

// ====== TYPE: CLASSIFY (Table Sorting) ======
function renderClassify(q) {
  const layout = document.createElement("div");
  layout.className = "classify-layout";

  // Bank of unsorted items
  const bank = document.createElement("div");
  bank.className = "classify-bank";
  bank.dataset.role = "bank";

  q.items.forEach((item) => {
    const chip = document.createElement("div");
    chip.className = "classify-chip";
    chip.draggable = true;
    chip.dataset.id = item.id;
    chip.textContent = item.text;
    bank.appendChild(chip);
  });

  // Columns for categories
  const columnsWrapper = document.createElement("div");
  columnsWrapper.className = "classify-columns";

  q.categories.forEach((cat) => {
    const col = document.createElement("div");
    col.className = "classify-column";
    col.dataset.categoryId = cat.id;

    const header = document.createElement("div");
    header.className = "classify-column-header";
    header.textContent = cat.label;

    const dropZone = document.createElement("div");
    dropZone.className = "classify-dropzone";
    dropZone.dataset.categoryId = cat.id;

    col.appendChild(header);
    col.appendChild(dropZone);
    columnsWrapper.appendChild(col);
  });

  layout.appendChild(bank);
  layout.appendChild(columnsWrapper);
  questionOptionsEl.appendChild(layout);

  let draggedChip = null;

  // Drag behavior (delegated on layout)
  layout.addEventListener("dragstart", (e) => {
    const target = e.target;
    if (!target.classList.contains("classify-chip") || answered) return;
    draggedChip = target;
    draggedChip.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
  });

  layout.addEventListener("dragend", () => {
    if (draggedChip) {
      draggedChip.classList.remove("dragging");
      draggedChip = null;
      if (!answered) {
        updateCheckButtonState();
      }
    }
  });

  const dropZones = layout.querySelectorAll(".classify-dropzone, .classify-bank");

  dropZones.forEach((zone) => {
    zone.addEventListener("dragover", (e) => {
      if (!draggedChip || answered) return;
      e.preventDefault();
    });

    zone.addEventListener("drop", (e) => {
      if (!draggedChip || answered) return;
      e.preventDefault();
      zone.appendChild(draggedChip);
      if (!answered) {
        resetFeedback();
        updateCheckButtonState();
      }
    });
  });

  checkAnswerBtn.disabled = true;

  function updateCheckButtonState() {
    const chipsInBank = bank.querySelectorAll(".classify-chip");
    // Require students to sort all chips out of the bank before checking
    checkAnswerBtn.disabled = chipsInBank.length > 0;
  }

  checkAnswerBtn.onclick = () => {
    if (answered) return;

    const chipsInBank = bank.querySelectorAll(".classify-chip");
    if (chipsInBank.length > 0) {
      setFeedback(
        "Sort all of the details into a category before checking.",
        false
      );
      return;
    }

    answered = true;
    markQuestionAnswered();

    const correctMap = {};
    q.items.forEach((item) => {
      correctMap[item.id] = item.categoryId;
    });

    let allCorrect = true;

    const categoryDropZones = layout.querySelectorAll(".classify-dropzone");

    categoryDropZones.forEach((zone) => {
      const zoneCatId = zone.dataset.categoryId;
      const chips = zone.querySelectorAll(".classify-chip");

      chips.forEach((chip) => {
        const itemId = chip.dataset.id;
        const correctCatId = correctMap[itemId];

        chip.classList.remove("correct", "incorrect");

        if (correctCatId === zoneCatId) {
          chip.classList.add("correct");
        } else {
          chip.classList.add("incorrect");
          allCorrect = false;
        }
      });
    });

    if (allCorrect) {
      setFeedback(
        "Awesome sorting! Each detail is in the correct category.",
        true
      );
    } else {
      setFeedback(
        "Some details are in the wrong category. Reread the passage and think about what each statement mainly supports.",
        false
      );
    }

    // Build placements for reporting
    const placements = {};
    q.items.forEach((item) => {
      const chip = layout.querySelector(`.classify-chip[data-id="${item.id}"]`);
      if (!chip) {
        placements[item.id] = null;
        return;
      }
      const parentZone = chip.closest(".classify-dropzone");
      placements[item.id] = parentZone ? parentZone.dataset.categoryId : null;
    });

    // 🔹 REPORTING HOOK
    logQuestionResult(q, {
      isCorrect: allCorrect,
      placements,
      correctMap
    });

    // Disable further dragging
    const allChips = layout.querySelectorAll(".classify-chip");
    allChips.forEach((chip) => (chip.draggable = false));

    checkAnswerBtn.disabled = true;
    nextQuestionBtn.disabled = false;
  };
}


// ====== TYPE: HIGHLIGHT ======
function renderHighlight(q) {
  const block = document.createElement("div");
  block.className = "highlight-block paragraph-mode";

  const para = document.createElement("p");
  para.className = "highlight-paragraph";

  const selectedSet = new Set();

  q.sentences.forEach((sent, index) => {
    const span = document.createElement("span");
    span.className = "highlight-sentence";
    span.dataset.id = sent.id;
    span.textContent = sent.text;

    // Add a space after each sentence except maybe the last
    if (index < q.sentences.length - 1) {
      span.textContent += " ";
    }

    span.addEventListener("click", () => {
      if (answered) return;

      if (selectedSet.has(sent.id)) {
        selectedSet.delete(sent.id);
        span.classList.remove("selected");
      } else {
        selectedSet.add(sent.id);
        span.classList.add("selected");
      }
      resetFeedback();
      checkAnswerBtn.disabled = selectedSet.size === 0;
    });

    para.appendChild(span);
  });

  block.appendChild(para);
  questionOptionsEl.appendChild(block);
  checkAnswerBtn.disabled = true;

  checkAnswerBtn.onclick = () => {
    if (answered) return;
    if (selectedSet.size === 0) {
      setFeedback("Click at least one sentence before checking.", false);
      return;
    }

    answered = true;
    markQuestionAnswered();

    const correctIds = new Set(q.sentences.filter((s) => s.correct).map((s) => s.id));
    const sentenceEls = block.querySelectorAll(".highlight-sentence");

    let allCorrect = true;

    sentenceEls.forEach((el) => {
      const id = el.dataset.id;
      const isCorrect = correctIds.has(id);
      const isSelected = selectedSet.has(id);

      el.classList.remove("selected", "correct", "incorrect");

      if (isCorrect && isSelected) {
        el.classList.add("correct");
      } else if (!isCorrect && isSelected) {
        el.classList.add("incorrect");
        allCorrect = false;
      } else if (isCorrect && !isSelected) {
        // A correct sentence was missed
        allCorrect = false;
      }
    });

    if (allCorrect) {
      setFeedback("You highlighted the correct evidence. Nice close reading!", true);
    } else {
      setFeedback("Some evidence is missing or incorrect. Reread and think about which sentences show feelings or opinions.", false);
    }
    logQuestionResult(q, {
      isCorrect: allCorrect,
      selectedSentenceIds: Array.from(selectedSet)
    });
    
    checkAnswerBtn.disabled = true;
    nextQuestionBtn.disabled = false;
  };
}

// ====== TYPE: DROPDOWN (Inline Choice / Replacement) ======
function renderDropdown(q) {
  const block = document.createElement("div");
  block.className = "dropdown-block";

  const para = document.createElement("p");
  para.className = "dropdown-sentence";

  const beforeSpan = document.createElement("span");
  beforeSpan.textContent = q.sentenceParts[0] || "";

  const select = document.createElement("select");
  select.className = "dropdown-select";

  // Default placeholder option
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "— Select an answer —";
  placeholder.disabled = true;
  placeholder.selected = true;
  select.appendChild(placeholder);

  q.options.forEach((optText, index) => {
    const opt = document.createElement("option");
    opt.value = String(index);
    opt.textContent = optText;
    select.appendChild(opt);
  });

  const afterSpan = document.createElement("span");
  afterSpan.textContent = q.sentenceParts[1] || "";

  para.appendChild(beforeSpan);
  para.appendChild(select);
  para.appendChild(afterSpan);

  block.appendChild(para);
  questionOptionsEl.appendChild(block);

  let selectedIndex = null;
  checkAnswerBtn.disabled = true;

  select.addEventListener("change", () => {
    if (answered) return;
    const value = select.value;

    if (value === "") {
      selectedIndex = null;
      checkAnswerBtn.disabled = true;
    } else {
      selectedIndex = Number(value);
      checkAnswerBtn.disabled = false;
    }

    // Clear old feedback + classes while they're choosing
    resetFeedback();
    select.classList.remove("correct", "incorrect");
  });

  checkAnswerBtn.onclick = () => {
    if (answered) return;
    if (selectedIndex === null) {
      setFeedback("Choose an option from the dropdown before checking.", false);
      return;
    }

    answered = true;
    markQuestionAnswered();

    const isCorrect = selectedIndex === q.correctIndex;

    if (isCorrect) {
      select.classList.add("correct");
      setFeedback("Nice work! You chose the best replacement.", true);
    } else {
      select.classList.add("incorrect");
      setFeedback(
        "Not quite. Reread the passage and think about what the author is really saying.",
        false
      );
    }

    // 🔹 REPORTING HOOK
    logQuestionResult(q, {
      isCorrect,
      selectedIndex
    });

    select.disabled = true;
    checkAnswerBtn.disabled = true;
    nextQuestionBtn.disabled = false;
  };
}


// ====== TYPE: PART A + PART B ======
function renderPartAB(q) {
  const block = document.createElement("div");
  block.className = "partab-block";

  // ---- Part A section ----
  const partASection = document.createElement("div");
  partASection.className = "partab-section partab-section-a";

  const partALabel = document.createElement("div");
  partALabel.className = "partab-label";
  partALabel.textContent = q.partA.label || "Part A";

  const partAStem = document.createElement("div");
  partAStem.className = "partab-stem";
  partAStem.textContent = q.partA.stem;

  const partAChoices = document.createElement("div");
  partAChoices.className = "choice-list partab-choices";

  let selectedA = null;

  q.partA.options.forEach((optText, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice-btn partab-choice-a";
    btn.dataset.index = String(index);

    const labelSpan = document.createElement("span");
    labelSpan.className = "choice-btn-label";
    labelSpan.textContent = String.fromCharCode(65 + index) + ".";

    const contentSpan = document.createElement("span");
    contentSpan.className = "choice-btn-content";
    contentSpan.textContent = optText;

    btn.appendChild(labelSpan);
    btn.appendChild(contentSpan);

    btn.addEventListener("click", (event) => {
      if (answered) return;

      if (event.shiftKey) {
        event.preventDefault();
        btn.classList.toggle("crossed-out");
        return;
      }

      selectedA = index;
      partAChoices
        .querySelectorAll(".choice-btn")
        .forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      resetFeedback();
      updateCheckEnabled();
    });

    attachCrossOutHandlers(btn);
    partAChoices.appendChild(btn);
  });

  partASection.appendChild(partALabel);
  partASection.appendChild(partAStem);
  partASection.appendChild(partAChoices);

  // ---- Part B section ----
  const partBSection = document.createElement("div");
  partBSection.className = "partab-section partab-section-b";

  const partBLabel = document.createElement("div");
  partBLabel.className = "partab-label";
  partBLabel.textContent = q.partB.label || "Part B";

  const partBStem = document.createElement("div");
  partBStem.className = "partab-stem";
  partBStem.textContent = q.partB.stem;

  const partBChoices = document.createElement("div");
  partBChoices.className = "choice-list partab-choices";

  let selectedB = null;

  q.partB.options.forEach((optText, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice-btn partab-choice-b";
    btn.dataset.index = String(index);

    const labelSpan = document.createElement("span");
    labelSpan.className = "choice-btn-label";
    labelSpan.textContent = String.fromCharCode(65 + index) + ".";

    const contentSpan = document.createElement("span");
    contentSpan.className = "choice-btn-content";
    contentSpan.textContent = optText;

    btn.appendChild(labelSpan);
    btn.appendChild(contentSpan);

    btn.addEventListener("click", (event) => {
      if (answered) return;

      if (event.shiftKey) {
        event.preventDefault();
        btn.classList.toggle("crossed-out");
        return;
      }

      selectedB = index;
      partBChoices
        .querySelectorAll(".choice-btn")
        .forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      resetFeedback();
      updateCheckEnabled();
    });

    attachCrossOutHandlers(btn);
    partBChoices.appendChild(btn);
  });

  partBSection.appendChild(partBLabel);
  partBSection.appendChild(partBStem);
  partBSection.appendChild(partBChoices);

  // ---- Add both sections to block ----
  block.appendChild(partASection);
  block.appendChild(partBSection);
  questionOptionsEl.appendChild(block);

  // Require both parts selected before checking
  checkAnswerBtn.disabled = true;

  function updateCheckEnabled() {
    checkAnswerBtn.disabled = selectedA === null || selectedB === null;
  }

  checkAnswerBtn.onclick = () => {
    if (answered) return;
    if (selectedA === null || selectedB === null) {
      setFeedback("Answer both Part A and Part B before checking.", false);
      return;
    }

    answered = true;
    markQuestionAnswered();

    const buttonsA = partAChoices.querySelectorAll(".choice-btn");
    const buttonsB = partBChoices.querySelectorAll(".choice-btn");

    // Mark Part A
    buttonsA.forEach((b) => {
      const idx = Number(b.dataset.index);
      if (idx === q.partA.correctIndex) {
        b.classList.add("correct");
      }
      if (idx === selectedA && idx !== q.partA.correctIndex) {
        b.classList.add("incorrect");
      }
      b.disabled = true;
    });

    // Mark Part B
    buttonsB.forEach((b) => {
      const idx = Number(b.dataset.index);
      if (idx === q.partB.correctIndex) {
        b.classList.add("correct");
      }
      if (idx === selectedB && idx !== q.partB.correctIndex) {
        b.classList.add("incorrect");
      }
      b.disabled = true;
    });

    const aCorrect = selectedA === q.partA.correctIndex;
    const bCorrect = selectedB === q.partB.correctIndex;

    if (aCorrect && bCorrect) {
      setFeedback(
        "Excellent! You chose the correct answer in Part A and the best supporting evidence in Part B.",
        true
      );
    } else if (aCorrect && !bCorrect) {
      setFeedback(
        "You chose a strong answer for Part A, but the evidence in Part B doesn’t best support it. Revisit the passage and look for a sentence that proves your Part A choice.",
        false
      );
    } else if (!aCorrect && bCorrect) {
      setFeedback(
        "Your evidence in Part B is strong, but your Part A answer doesn’t fully match it. Reread to make sure your main idea and evidence go together.",
        false
      );
    } else {
      setFeedback(
        "Part A and Part B are both off. Reread the passage and think about the author’s main point and the sentence that proves it.",
        false
      );
    }

    // 🔹 REPORTING HOOK
    logQuestionResult(q, {
      isCorrect: aCorrect && bCorrect,
      selectedA,
      selectedB,
      aCorrect,
      bCorrect
    });

    checkAnswerBtn.disabled = true;
    nextQuestionBtn.disabled = false;
  };
}


// ====== TYPE: REVISE (Sentence Revision / Stronger Phrasing) ======
function renderRevise(q) {
  const block = document.createElement("div");
  block.className = "revise-block";

  // Original sentence (read-only)
  const original = document.createElement("div");
  original.className = "revise-row revise-original";

  const originalTag = document.createElement("span");
  originalTag.className = "revise-tag";
  originalTag.textContent = "Original:";

  const originalText = document.createElement("span");
  originalText.className = "revise-text";
  originalText.textContent = q.originalSentence;

  original.appendChild(originalTag);
  original.appendChild(originalText);

  // Edited sentence (with inline dropdown)
  const edited = document.createElement("div");
  edited.className = "revise-row revise-edited";

  const editedTag = document.createElement("span");
  editedTag.className = "revise-tag";
  editedTag.textContent = "Revised:";

  const sentenceSpan = document.createElement("span");
  sentenceSpan.className = "revise-sentence";

  const beforeSpan = document.createElement("span");
  beforeSpan.textContent = q.sentenceParts[0] || "";

  const select = document.createElement("select");
  select.className = "revise-select";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.disabled = true;
  placeholder.selected = true;
  placeholder.textContent = "— choose a revision —";
  select.appendChild(placeholder);

  q.options.forEach((optText, index) => {
    const opt = document.createElement("option");
    opt.value = String(index);
    opt.textContent = optText;
    select.appendChild(opt);
  });

  const afterSpan = document.createElement("span");
  afterSpan.textContent = q.sentenceParts[1] || "";

  sentenceSpan.appendChild(beforeSpan);
  sentenceSpan.appendChild(select);
  sentenceSpan.appendChild(afterSpan);

  edited.appendChild(editedTag);
  edited.appendChild(sentenceSpan);

  block.appendChild(original);
  block.appendChild(edited);
  questionOptionsEl.appendChild(block);

  let selectedIndex = null;
  checkAnswerBtn.disabled = true;

  select.addEventListener("change", () => {
    if (answered) return;
    const value = select.value;

    if (value === "") {
      selectedIndex = null;
      checkAnswerBtn.disabled = true;
    } else {
      selectedIndex = Number(value);
      checkAnswerBtn.disabled = false;
    }

    resetFeedback();
    select.classList.remove("correct", "incorrect");
  });

  checkAnswerBtn.onclick = () => {
    if (answered) return;

    if (selectedIndex === null) {
      setFeedback("Choose a revision from the dropdown before checking.", false);
      return;
    }

    answered = true;
    markQuestionAnswered();

    const isCorrect = selectedIndex === q.correctIndex;

    if (isCorrect) {
      select.classList.add("correct");
      setFeedback(
        "Nice revision! Your wording is strong and matches the author’s meaning.",
        true
      );
    } else {
      select.classList.add("incorrect");
      setFeedback(
        "This revision isn’t the strongest match. Think about which choice is clear, precise, and supported by the passage.",
        false
      );
    }

    // 🔹 REPORTING HOOK
    logQuestionResult(q, {
      isCorrect,
      selectedIndex
    });

    select.disabled = true;
    checkAnswerBtn.disabled = true;
    nextQuestionBtn.disabled = false;
  };
}


// ====== NAVIGATION ======
if (nextQuestionBtn) {
  nextQuestionBtn.addEventListener("click", () => {
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
      renderQuestion();
    } else {
      // End of set
      setFeedback("You’ve reached the end of this practice set. 🎉", true);

      // 🔹 REPORTING HOOK – send summary to Netlify/Google Sheet
      if (window.RP_REPORT && typeof window.RP_REPORT.sendFinalReport === "function") {
        window.RP_REPORT.sendFinalReport();
      }
    }
  });
}


// Passage tab clicks
passageTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const num = tab.dataset.passage;
    setActivePassage(num);
  });
});

// Initial render (only if the question UI exists)
if (questionStemEl && questionOptionsEl) {
  renderQuestion();
}

// Show identity modal on load if we have a session code and the trainer UI is present
if (SESSION_CODE && questionStemEl && questionOptionsEl && identityModalEl) {
  showIdentityModal();
}


// ====== THEME TOGGLE & CLEAR HIGHLIGHTS ======
(function initThemeAndHighlightControls() {
  const bodyEl = document.body;
  const themeToggleInput = document.getElementById("theme-toggle");

  if (themeToggleInput) {
    const savedTheme = localStorage.getItem("rp-theme");
    if (savedTheme === "dark") {
      bodyEl.classList.add("dark-theme");
      themeToggleInput.checked = true;
    }

    themeToggleInput.addEventListener("change", () => {
      if (themeToggleInput.checked) {
        bodyEl.classList.add("dark-theme");
        localStorage.setItem("rp-theme", "dark");
      } else {
        bodyEl.classList.remove("dark-theme");
        localStorage.setItem("rp-theme", "light");
      }
    });
  }

  const clearPassageBtn = document.getElementById("clear-passage-highlights");
  if (clearPassageBtn) {
    clearPassageBtn.addEventListener("click", () => {
      clearPassageHighlights();
    });
  }

  const clearQuestionBtn = document.getElementById("clear-question-highlights");
  if (clearQuestionBtn) {
    clearQuestionBtn.addEventListener("click", () => {
      clearQuestionHighlights();
    });
  }
})();

// ====== PROGRESS AUTOSAVE ======

// Build a stable key so each student (name + class + session)
// gets their own row in the live monitor.
function getStudentKey() {
  // If they're signed in with Google, keep using the Google sub.
  const user = window.RP_AUTH && RP_AUTH.currentUser;
  if (user && user.sub) {
    return `google-${user.sub}`;
  }

  // Otherwise, derive the key from session info: session + class + name
  try {
    if (window.RP_REPORT && RP_REPORT._debugGetState) {
      const state = RP_REPORT._debugGetState();
      const info = state.sessionInfo || {};

      const safe = (value, fallback) =>
        (value || fallback)
          .toString()
          .trim()
          .toLowerCase()
          .replace(/[^\w]+/g, "_");

      const session = safe(info.sessionCode, "nosession");
      const name = safe(info.studentName, "noname");
      const cls = safe(info.classCode, "noclass");

      // Example: sess_new_test__class_6a__name_maya_j
      return `sess_${session}__class_${cls}__name_${name}`;
    }
  } catch (e) {
    console.warn(
      "[RP] Failed to build name-based studentKey, falling back to anon id",
      e
    );
  }

  // Final fallback: old anon-id behavior, just in case sessionInfo isn't set.
  const KEY = "rp_anon_id";
  try {
    let anon = localStorage.getItem(KEY);
    if (!anon) {
      anon = "anon-" + Math.random().toString(36).slice(2);
      localStorage.setItem(KEY, anon);
    }
    return anon;
  } catch (_) {
    return "anon-" + Math.random().toString(36).slice(2);
  }
}



// Simple debounce so we don't spam the server
function debounce(fn, delay) {
  let timeoutId = null;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Called after any question is checked
async function autosaveProgress() {
  if (!window.RP_REPORT || !RP_REPORT._debugGetState) return;

  const state = RP_REPORT._debugGetState();
  const info = state.sessionInfo || {};
  const sessionCode = (info.sessionCode || "").trim();
  if (!sessionCode) return;

  const studentKey = getStudentKey();

  const payload = {
    // who + session
    studentKey,
    sessionCode,
    studentName: info.studentName || "",
    classCode: info.classCode || "",
    assessmentName: info.assessmentName || "",
    // progress
    startedAt: state.startedAt,
    lastSavedAt: new Date().toISOString(),
    currentQuestionIndex: typeof currentQuestionIndex === "number" ? currentQuestionIndex : null,
    questionResults: state.questionResults || [],
    // optional Google user info
    user: (window.RP_AUTH && RP_AUTH.currentUser) ? {
      email: RP_AUTH.currentUser.email,
      name: RP_AUTH.currentUser.name,
      sub: RP_AUTH.currentUser.sub
    } : null
  };

  // Local fallback
  try {
    const localKey = `rp_progress_${sessionCode}_${studentKey}`;
    localStorage.setItem(localKey, JSON.stringify(payload));
  } catch (e) {
    console.warn("[RP] Unable to save progress locally:", e);
  }

  // Server copy (Netlify function)
  try {
    await fetch("/.netlify/functions/saveReadingProgress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.warn("[RP] Autosave to server failed (will retry later).", e);
  }
}

// Debounced wrapper used by reporting.js
window.RP_AUTOSAVE_PROGRESS = debounce(autosaveProgress, 2000);


//script end