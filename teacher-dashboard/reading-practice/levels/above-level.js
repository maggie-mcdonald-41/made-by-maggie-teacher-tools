// levels/above-level.js
// Above-grade-level content bundle: passages + questions + sets

window.READING_LEVEL = {
  id: "above",
  label: "Above Grade Level",

passages: {
  1: {
    title: "Using Artificial Intelligence to Support Learning",
    html: `
    <h2 class="passage-title">Using Artificial Intelligence to Support Learning</h2>
    <p class="passage-lexile"><em>Estimated Lexile Level: 1020L–1100L</em></p>  
    <p>
        Artificial intelligence (AI) is becoming an increasingly common part of daily life, influencing how people work, communicate, and solve problems. As this technology continues to expand, schools must decide whether AI tools should be integrated into classrooms or kept out of academic settings. Supporters argue that when used responsibly, AI can strengthen instruction and prepare students for future challenges. Schools should allow the use of AI tools for learning because they support personalized instruction, increase engagement and accessibility, and help students develop essential digital literacy skills.
      </p>

      <p>
        One major benefit of AI tools in education is their ability to personalize learning. Traditional classrooms often move at a single pace, which can make it difficult to meet the needs of all students. AI-powered programs can analyze student performance and adjust instruction by providing targeted feedback and additional practice. According to UNESCO, adaptive learning technologies can help identify learning gaps and support students who need extra assistance. This individualized approach allows students to progress more effectively while giving teachers useful insight into student needs.
      </p>

        <figure class="graph-placeholder">
          <img src="../media/ai-image1.png"
               alt="Image of AI benefits summary">
          <figcaption>
            Image of AI benefits summary
          </figcaption>
        </figure>

      <p>
        AI tools can also increase engagement and accessibility. Interactive platforms that provide immediate feedback, simulations, or guided practice encourage students to participate more actively in learning. A report from the Brookings Institution notes that well-designed digital tools can improve student motivation when they are used with clear instructional goals. In addition, AI-supported features such as speech-to-text, text simplification, and translation tools can help students with disabilities or language barriers access complex academic content.
      </p>

      <p>
        Beyond academic support, AI tools help prepare students for a technology-driven future. Digital literacy is increasingly important in higher education and the workforce. The Organization for Economic Co-operation and Development (OECD) emphasizes that students must learn how to evaluate digital information, use technology responsibly, and think critically about automated tools. Teaching students how to use AI appropriately encourages thoughtful decision-making rather than dependence.
      </p>

      <p>
        When implemented with clear guidelines and teacher oversight, AI tools can enhance learning without replacing instruction. Rather than banning AI outright, schools can focus on teaching students how to use technology ethically and effectively. Used in this way, AI has the potential to strengthen education while preparing students for future academic and professional demands.
      </p>
    `
  },

  2: {
    title: "Why Artificial Intelligence Use Should Be Limited in Schools",
    html: `
        <h2 class="passage-title">Why Artificial Intelligence Use Should Be Limited in Schools</h2>
        <p class="passage-lexile"><em>Estimated Lexile Level: 1040L–1130L</em></p>

    <p>
        The rapid growth of artificial intelligence has led many educators to question its role in schools. While AI tools may offer convenience, critics argue that their use in classrooms presents serious challenges. Without clear limits, AI can reduce independent thinking, create fairness concerns, and make it difficult to measure student understanding. Schools should restrict or ban the use of AI tools in classrooms because they undermine critical thinking, threaten academic integrity, and complicate assessment.
      </p>

      <p>
        One major concern is the impact of AI on student thinking skills. When AI tools generate explanations, summaries, or written responses, students may rely on the technology instead of engaging deeply with the learning process. Researchers at the Stanford Graduate School of Education warn that productive struggle plays an important role in learning. If students turn to AI to complete challenging tasks, they may miss opportunities to develop problem-solving and analytical skills.
      </p>

        <figure class="graph-placeholder">
          <img src="../media/ai-image2.png"
               alt="Image of AI negatives summary">
          <figcaption>
               Image of AI negatives summary
          </figcaption>
        </figure>

      <p>
        AI tools also raise questions about academic honesty and fairness. When students submit AI-generated work, teachers may struggle to determine whether assignments reflect genuine understanding. According to Educational Testing Service, AI-generated content complicates traditional assessment methods and can result in inaccurate evaluations of student ability. In addition, access to advanced AI tools is not equal. Students with greater access may gain unfair advantages, increasing educational inequality.
      </p>

      <p>
        Teachers face additional challenges when AI is widely used in classrooms. Monitoring technology use and identifying AI-generated work can take time away from instruction. In many cases, schools lack clear policies or reliable tools to manage these issues. As a result, grades may no longer accurately represent what students know and can do.
      </p>

      <p>
        Until clear instructional frameworks and safeguards are established, limiting or banning AI use may be the most effective way to protect learning. While AI may have future potential, unrestricted use risks weakening essential academic skills. Schools must prioritize student thinking, fairness, and meaningful assessment over convenience.
      </p>
    `
  }
},

  // Move your questions array here EXACTLY as-is
  questions: (function () {
  // Types: 'mcq', 'multi', 'order', 'match', 'highlight', 'dropdown', 'classify', 'partAB', 'revise'
let questions = [

  // 1. MCQ – Main claim, Passage 1 (correct = C)
  {
    id: 1,
    type: "mcq",
    linkedPassage: 1,
    stem: "Which statement best captures Passage 1’s central claim AND reflects the scope of the author’s reasoning?",
    instructions: "Select the best answer.",
options: [
  "Because AI is common in society, schools should require AI tools in every class and replace many traditional lessons.",
  "AI tools are most valuable for grading and efficiency, so schools should adopt them mainly to reduce teacher workload.",
  "With clear guidelines and teacher oversight, schools should allow AI tools because they can personalize learning, improve access, and build digital literacy.",
  "Since AI helps some learners, schools should allow AI only for students with disabilities and multilingual learners."
],
    correctIndex: 2,
    skills: ["claim", "central-idea", "passage-1", "mcq"]
  },

  // 2. MCQ – Central idea, Passage 2 (correct = A)
  {
    id: 2,
    type: "mcq",
    linkedPassage: 2,
    stem: "Which statement best expresses Passage 2’s central idea, including the author’s main reasoning?",
    instructions: "Choose the answer that best summarizes the author’s main point.",
options: [
  "Without clear limits, AI can reduce independent thinking, raise fairness and integrity concerns, and make it harder to assess what students truly understand.",
  "AI should be used more often because it saves time for teachers and reduces grading burdens.",
  "Technology generally improves learning outcomes, so schools should expand AI access to close achievement gaps.",
  "AI tools mainly help students work faster, which makes them the best solution for modern classrooms."
],
    correctIndex: 0,
    skills: ["central-idea", "summarizing", "passage-2", "mcq"]
  },

  // 3. Multi-select – Passage 1
  {
    id: 3,
    type: "multi",
    linkedPassage: 1,
stem: "Which details best support the idea that AI tools can personalize learning in a way that changes instruction for individual students?",   
instructions: "Select all that apply.",
options: [
  "AI programs analyze student performance and adjust instruction based on learning needs.",
  "AI makes learning more fun, which helps students stay motivated to complete work.",
  "Adaptive systems can provide targeted feedback and extra practice to address learning gaps.",
  "AI offers translation and speech-to-text features that help students access academic content."
],
    correctIndices: [0, 2],
    minSelections: 2,
    maxSelections: 3,
    skills: ["text-evidence", "details", "personalization", "multi-select"]
  },

  // 4. Multi-select – Passage 2
  {
    id: 4,
    type: "multi",
    linkedPassage: 2,
stem: "Which details best support the author’s concern that AI use may weaken critical thinking by reducing productive struggle?",    instructions: "Select all that apply.",
options: [
  "Students may rely on AI-generated explanations instead of working through challenging tasks.",
  "AI tools often simplify complex ideas, which can help students understand difficult content quickly.",
  "Overuse of automation can reduce opportunities for independent problem-solving and analysis.",
  "Teachers may need time to monitor technology use, which can reduce instructional time."
],
    correctIndices: [0, 2],
    minSelections: 2,
    maxSelections: 3,
    skills: ["text-evidence", "critical-thinking", "multi-select"]
  },

  // 5. Order – Passage 1
  {
    id: 5,
    type: "order",
    linkedPassage: 1,
    stem: "Put the ideas from Passage 1 in the order they appear.",
    instructions: "Drag and drop the ideas from first to last.",
    items: [
      { id: "a2", text: "The author explains how AI personalizes instruction." },
      { id: "a4", text: "The author discusses the importance of digital literacy for future careers." },
      { id: "a1", text: "The author introduces the growing presence of AI in daily life." },
      { id: "a3", text: "The author describes how AI increases engagement and accessibility." }
    ],
    correctOrder: ["a1", "a2", "a3", "a4"],
    skills: ["text-structure", "chronological-order", "passage-1", "drag-drop"]
  },

  // 6. Order – Passage 2
  {
    id: 6,
    type: "order",
    linkedPassage: 2,
    stem: "Sequence the ideas from Passage 2 in the order they are presented.",
    instructions: "Drag and drop the ideas in the correct sequence.",
    items: [
      { id: "b3", text: "The author discusses fairness and access concerns." },
      { id: "b1", text: "The author introduces concerns about AI in education." },
      { id: "b4", text: "The author explains challenges for teachers and assessment." },
      { id: "b2", text: "The author explains how AI can reduce independent thinking." }
    ],
    correctOrder: ["b1", "b2", "b3", "b4"],
    skills: ["text-structure", "chronological-order", "passage-2", "drag-drop"]
  },

  // 7. Matching – Passage 1
  {
    id: 7,
    type: "match",
    linkedPassage: 1,
    stem: "Match each part of Passage 1’s argument with its description.",
    instructions: "Match the parts correctly.",
    left: [
      { id: "c1", text: "Claim" },
      { id: "c2", text: "Reason" },
      { id: "c3", text: "Evidence" }
    ],
right: [
  { id: "d3", text: "A cited organization explains that adaptive technologies can identify gaps and provide targeted support." },
  { id: "d1", text: "Schools should allow AI tools for learning when implemented with guidelines and oversight." },
  { id: "d2", text: "Instruction can shift based on student needs when tools adjust practice and feedback." }
],
    pairs: { c1: "d1", c2: "d2", c3: "d3" },
    skills: ["argument-structure", "claim", "reason", "evidence", "matching"]
  },

  // 8. Matching – Passage 2
  {
    id: 8,
    type: "match",
    linkedPassage: 2,
    stem: "Match each concern in Passage 2 with its focus.",
    instructions: "Drag each description to the correct category.",
    left: [
      { id: "e1", text: "Critical thinking" },
      { id: "e2", text: "Fairness" },
      { id: "e3", text: "Assessment" }
    ],
right: [
  { id: "f2", text: "Differences in access can create unequal advantages for some students." },
  { id: "f3", text: "AI-generated work makes it harder to judge what a student actually understands." },
  { id: "f1", text: "Students may lean on AI responses instead of developing independent problem-solving." }
],
    pairs: { e1: "f1", e2: "f2", e3: "f3" },
    skills: ["details", "cause-effect", "matching"]
  },

  // 9. Highlight – Passage 1
  {
    id: 9,
    type: "highlight",
    linkedPassage: 1,
    stem: "Which sentences from Passage 1 provide evidence rather than opinion?",
    instructions: "Highlight all sentences that provide evidence.",
sentences: [
  { id: "h1", text: "When used with teacher oversight, AI tools can strengthen learning without replacing instruction.", correct: false }, 
  { id: "h2", text: "UNESCO states that adaptive learning technologies can help identify learning gaps and provide targeted support.", correct: true },
  { id: "h3", text: "A Brookings report notes that well-designed digital tools can improve motivation when paired with clear instructional goals.", correct: true },
  { id: "h4", text: "Rather than banning AI outright, schools should focus on responsible use.", correct: false }
],
    skills: ["text-evidence", "fact-opinion", "highlight"]
  },

  // 10. Highlight – Passage 2
  {
    id: 10,
    type: "highlight",
    linkedPassage: 2,
    stem: "Which sentences from Passage 2 express the author’s opinion?",
    instructions: "Highlight all sentences that reflect opinion.",
sentences: [
  { id: "i1", text: "AI-generated content can complicate traditional assessment methods and lead to inaccurate evaluations.", correct: false },
  { id: "i2", text: "Until safeguards are established, schools should restrict or ban AI tools in classrooms.", correct: true },
  { id: "i3", text: "Unrestricted AI use risks weakening essential academic skills by reducing productive struggle.", correct: true },
  { id: "i4", text: "Educational Testing Service notes that AI-generated content complicates traditional assessment approaches.", correct: false }
],
    skills: ["author-opinion", "fact-opinion", "highlight"]
  },

  // 11. Dropdown – Passage 1
  {
    id: 11,
    type: "dropdown",
    linkedPassage: 1,
    stem: "Choose the option that best completes the sentence.",
    sentenceParts: [
      "The author suggests that AI tools can ",
      " student learning when used responsibly."
    ],
options: ["limit", "standardize", "enhance", "replace"],
    correctIndex: 2,
    skills: ["author-meaning", "precision-language", "dropdown"]
  },

  // 12. Dropdown – Passage 2
  {
    id: 12,
    type: "dropdown",
    linkedPassage: 2,
    stem: "Select the phrase that best reflects the author’s stance.",
    sentenceParts: [
      "The author argues that AI use in classrooms should be ",
      "."
    ],
options: [
  "expanded with few restrictions",
  "carefully limited until safeguards exist",
  "encouraged as a replacement for challenging tasks",
  "left to individual student choice"
],
    correctIndex: 1,
    skills: ["author-opinion", "precision-language", "dropdown"]
  },

// 13. Classify – Benefits vs Risks 
{
  id: 13,
  type: "classify",
  stem: "Sort each idea into the category it best fits.",
  instructions: "Drag each idea into the correct column.",
  categories: [
    { id: "benefit", label: "Benefits of AI" },
    { id: "risk", label: "Risks of AI" }
  ],
  items: [
    { id: "j1", text: "Reduces opportunities for productive struggle and independent thinking", categoryId: "risk" },
    { id: "j2", text: "Supports students with disabilities or language barriers", categoryId: "benefit" },
    { id: "j3", text: "Complicates accurate assessment of student understanding", categoryId: "risk" },
    { id: "j4", text: "Helps students develop digital literacy skills for future careers", categoryId: "benefit" },
    { id: "j5", text: "Creates fairness issues when access to AI tools is unequal", categoryId: "risk" },
    { id: "j6", text: "Provides personalized feedback based on student performance", categoryId: "benefit" },
    { id: "j7", text: "Increases student engagement through interactive learning tools", categoryId: "benefit" },
    { id: "j8", text: "Makes it difficult for teachers to verify student work", categoryId: "risk" }
  ],
  skills: ["classify", "compare-ideas"]
}
,


// 14. Classify – Which passage? (Mixed Order, No Pattern)
{
  id: 14,
  type: "classify",
  stem: "Sort each statement by the passage it comes from.",
  instructions: "Use Passage 1 and Passage 2.",
  categories: [
    { id: "p1", label: "Passage 1" },
    { id: "p2", label: "Passage 2" }
  ],
  items: [
    { id: "k6", text: "AI helps students prepare for a technology-driven future.", categoryId: "p1" },
    { id: "k3", text: "Unequal access to AI tools can increase educational inequality.", categoryId: "p2" },
    { id: "k4", text: "Technology can increase student engagement when used with clear goals.", categoryId: "p1" },
    { id: "k5", text: "Limiting AI use may better protect learning and assessment accuracy.", categoryId: "p2" },
    { id: "k2", text: "AI tools can personalize instruction to meet individual student needs.", categoryId: "p1" },
    { id: "k1", text: "Teachers may struggle to determine if work is student-generated.", categoryId: "p2" },
    { id: "k7", text: "AI use can weaken critical thinking and problem-solving skills.", categoryId: "p2" },
    { id: "k8", text: "Schools should teach ethical and responsible AI use rather than banning it.", categoryId: "p1" }
  ],
  skills: ["compare-passages", "classify"]
},

  // 15. Part A/B – Passage 1
  {
    id: 15,
    type: "partAB",
    linkedPassage: 1,
    stem: "Answer Part A and Part B.",
    partA: {
      stem: "What is the author’s main claim in Passage 1?",
      options: [
        "AI harms student engagement.",
        "AI should only be used outside school.",
        "AI should replace teachers.",
        "AI tools should be used to support learning."
      ],
      correctIndex: 3
    },
    partB: {
      stem: "Which evidence best supports this claim?",
options: [
  "The author mentions that technology is common in daily life.",
  "UNESCO is cited to show adaptive tools can identify gaps and provide targeted support.",
  "The author claims students will enjoy school more when AI is used.",
  "The author suggests teachers will not need to plan as much when AI is available."
],
      correctIndex: 1
    },
    skills: ["claim", "text-evidence", "two-part"]
  },

  // 16. Part A/B – Passage 2
  {
    id: 16,
    type: "partAB",
    linkedPassage: 2,
    stem: "Answer Part A and Part B.",
    partA: {
      stem: "What is one main reason the author gives for limiting AI?",
      options: [
        "AI replaces textbooks.",
        "AI weakens independent thinking.",
        "AI improves grades.",
        "AI saves time."
      ],
      correctIndex: 1
    },
    partB: {
      stem: "Which detail best supports this reason?",
options: [
  "Some AI tools require paid subscriptions.",
  "Teachers may prefer technology that automates tasks.",
  "AI tools work quickly and can produce complete responses.",
  "Researchers warn that relying on AI can replace productive struggle that builds thinking skills."
],
      correctIndex: 3
    },
    skills: ["reason", "text-evidence", "two-part"]
  },

// 17. Order – Cross-passage synthesis
{
  id: 17,
  type: "order",
  stem: "Put the ideas in the order they are developed across both passages.",
  instructions: "Drag and drop from first to last.",
items: [
  { id: "o3", text: "Passage 2 argues that AI can interfere with learning by reducing productive struggle and independent thinking." },
  { id: "o1", text: "Passage 1 explains how AI can adapt instruction to student needs through targeted feedback and practice." },
  { id: "o4", text: "Passage 2 expands the critique to fairness, integrity, and the difficulty of valid assessment." },
  { id: "o2", text: "Passage 1 adds that students must learn responsible digital literacy for future academic and workplace demands." }
],
  correctOrder: ["o1", "o2", "o3", "o4"],
  skills: ["compare-passages", "argument-development", "drag-drop"]
},


  // 18. Multi-select – Evidence vs opinion
  {
    id: 18,
    type: "multi",
    stem: "Which details from the passages provide strong evidence rather than opinion?",
    instructions: "Select all that apply.",
options: [
  "UNESCO reports that adaptive technologies can help identify learning gaps and support students who need additional assistance.",
  "Researchers prove that AI always reduces critical thinking in students.",
  "The OECD emphasizes that students must learn to evaluate digital information and use technology responsibly.",
  "Most educators agree that convenience should never outweigh fairness in schools."
],
    correctIndices: [0, 2],
    minSelections: 2,
    maxSelections: 3,
    skills: ["text-evidence", "fact-vs-opinion", "synthesize", "multi-select"]
  },

  // 19. MCQ – Video central idea
  {
    id: 19,
    type: "mcq",
    linkedPassage: null,
    media: {
      type: "video",
      src: "../media/AI_in_the_Classroom.mp4",
      captions: "../media/AI_in_the_Classroom.mp4.vtt",
      label: "Video: AI in the Classroom"
    },
 stem: "Which statement best captures the central message of the video?",
 instructions: "Choose the best answer.",
  options: [
    "AI should be treated mainly as a cheating problem, so schools must focus on detection and punishment.",
    "Because AI tools can generate complete work, schools should avoid them until technology becomes more accurate and fair.",
    "The main issue with AI is that it is impossible to detect, so traditional writing assignments should be replaced completely.",
    "AI can support learning, but it raises serious concerns (like cheating and fairness), so schools need clear guidelines for how it should be used."
  ],
    correctIndex: 3,
    skills: ["central-idea", "listening-comprehension", "video-media", "mcq"]
  },

  // 20. MCQ – Video detail
  {
    id: 20,
    type: "mcq",
    linkedPassage: null,
    media: {
      type: "video",
      src: "../media/AI_in_the_Classroom.mp4",
      captions: "../media/AI_in_the_Classroom.mp4.vtt",
      label: "Video: AI in the Classroom"
    },
  stem: "According to the video, what is one concern when students use AI as a shortcut rather than a tool?",
  instructions: "Choose the best answer.",
  options: [
    "Students may let AI do the thinking or writing instead of finishing work themselves.",
    "AI detectors can always identify AI-written work with complete accuracy.",
    "Most students say they will stop using AI if schools ban it.",
    "AI use eliminates fairness concerns because the internet provides equal training data."
  ],
    correctIndex: 0,
    skills: ["details", "listening-comprehension", "video-media", "mcq"]
  },

  // 21. MCQ – Video inference
  {
    id: 21,
    type: "mcq",
    linkedPassage: null,
    media: {
      type: "video",
      src: "../media/AI_in_the_Classroom.mp4",
      captions: "../media/AI_in_the_Classroom.mp4.vtt",
      label: "Video: AI in the Classroom"
    },
  stem: "Which inference is best supported by the video?",
  instructions: "Choose the answer that is supported by the video but not directly stated.",
  options: [
    "Because AI detectors are unreliable, schools should stop assigning any writing tasks.",
    "Schools will need clear rules that define when AI support is appropriate and when it becomes replacement for thinking.",
    "Most students will avoid AI completely as long as teachers increase the consequences.",
    "The fairest solution is to use AI detection software to decide grades automatically."
  ],
    correctIndex: 1,
    skills: ["inference", "evaluate-ideas", "video-media", "mcq"]
  },

  // 22. MCQ – Podcast central question (correct = C)
  {
    id: 22,
    type: "mcq",
    linkedPassage: null,
    media: {
      type: "audio",
      src: "../media/Does_AI_Boost_Learning_or_Encourage_Cheating.m4a",
      captions: "../media/Does-AI-Boost-Learning-or-Encourage-Cheating.vtt",
      label: "Podcast: AI in Schools Debate"
    },
    stem: "What central question frames the debate in the podcast?",
    instructions: "Choose the best answer.",
  options: [
    "Should teachers use AI mainly to save time on planning and communication tasks?",
    "Is generative AI already replacing teachers from K–12 through university?",
    "Does AI help learning overall, or do risks like fairness and honesty hurt learning more than they help?",
    "Should schools treat AI use as cheating in every situation?"
  ],
    correctIndex: 2,
    skills: ["central-idea", "listening-comprehension", "audio-media", "mcq"]
  },

  // 23. MCQ – Speaker viewpoints (correct = C)
  {
    id: 23,
    type: "mcq",
    linkedPassage: null,
    media: {
      type: "audio",
      src: "../media/Does_AI_Boost_Learning_or_Encourage_Cheating.m4a",
      captions: "../media/Does-AI-Boost-Learning-or-Encourage-Cheating.vtt",
      label: "Podcast: AI in Schools Debate"
    },
    stem: "How do the two speakers differ in their views of AI in education?",
    instructions: "Choose the best answer.",
  options: [
    "Both argue that AI should be avoided because it reduces learning for most students.",
    "Both agree that AI is useful only for students, not for teachers.",
    "One argues AI is becoming necessary (especially for efficiency), while the other warns the risks—bias, cheating, and weaker thinking skills—are too high.",
    "One supports AI only for students with disabilities, while the other supports AI only for grading."
  ],
    correctIndex: 2,
    skills: ["compare-ideas", "speaker-perspective", "audio-media", "mcq"]
  },

  // 24. Multi-select – Podcast risks (correct = B)
  {
    id: 24,
    type: "multi",
    linkedPassage: null,
    media: {
      type: "audio",
      src: "../media/Does_AI_Boost_Learning_or_Encourage_Cheating.m4a",
      captions: "../media/Does-AI-Boost-Learning-or-Encourage-Cheating.vtt",
      label: "Podcast: AI in Schools Debate"
    },
    stem: "Which concerns about AI use are raised in the podcast?",
    instructions: "Select all that apply.",
  options: [
    "Bias in AI systems",
    "Cheating and academic dishonesty",
    "Reduced development of thinking skills",
    "Less time for teachers to plan lessons"
  ],
    correctIndices: [0, 1, 2],
    minSelections: 2,
    maxSelections: 3,
    skills: ["listening-details", "evaluate-ideas", "multi-select"]
  },

  // 25. MCQ – Podcast inference (correct = C)
  {
    id: 25,
    type: "mcq",
    linkedPassage: null,
    media: {
      type: "audio",
      src: "../media/Does_AI_Boost_Learning_or_Encourage_Cheating.m4a",
      captions: "../media/Does-AI-Boost-Learning-or-Encourage-Cheating.vtt",
      label: "Podcast: AI in Schools Debate"
    },
    stem: "Which inference is best supported by the podcast discussion?",
    instructions: "Choose the best answer.",
  options: [
    "Because AI saves time, schools should treat it as required for teachers and students.",
    "Since the risks are mentioned, schools should ban AI tools across K–12 and university settings immediately.",
    "Schools will need careful guidelines to balance AI’s benefits with risks like fairness, honesty, and thinking skills.",
    "The debate suggests AI has little impact on learning because it only affects convenience."
  ],
    correctIndex: 2,
    skills: ["inference", "synthesize", "audio-media", "mcq"]
  }

];


    return questions;
  })(),

  // Move your sets here EXACTLY as-is
  questionSets: {
    full: null,
    mini1: [3, 6, 7, 10, 11, 16, 17, 20, 22, 24],
    mini2: [4, 8, 9, 12, 14, 18, 19, 21, 23, 25],

  }
};
