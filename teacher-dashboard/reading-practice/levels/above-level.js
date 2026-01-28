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
    stem: "What is the main claim the author makes in Passage 1?",
    instructions: "Select the best answer.",
    options: [
      "AI tools should be banned because they replace teachers.",
      "AI tools are mainly useful for grading student work faster.",
      "AI tools should be used in schools because they support personalized learning and digital literacy.",
      "AI tools are only helpful for students with disabilities."
    ],
    correctIndex: 2,
    skills: ["claim", "central-idea", "passage-1", "mcq"]
  },

  // 2. MCQ – Central idea, Passage 2 (correct = A)
  {
    id: 2,
    type: "mcq",
    linkedPassage: 2,
    stem: "Which statement best expresses the central idea of Passage 2?",
    instructions: "Choose the answer that best summarizes the author’s main point.",
    options: [
      "Unrestricted AI use can weaken independent thinking and create fairness issues.",
      "Teachers should rely more heavily on automated grading systems.",
      "Technology always improves education outcomes.",
      "AI tools help students learn more efficiently."
    ],
    correctIndex: 0,
    skills: ["central-idea", "summarizing", "passage-2", "mcq"]
  },

  // 3. Multi-select – Passage 1
  {
    id: 3,
    type: "multi",
    linkedPassage: 1,
    stem: "Which details from Passage 1 support the idea that AI tools can personalize learning?",
    instructions: "Select all that apply.",
    options: [
      "AI programs adjust instruction based on student performance data.",
      "Teachers no longer need to plan lessons when AI is used.",
      "Adaptive systems provide targeted feedback and practice opportunities.",
      "AI tools remove the need for student effort."
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
    stem: "Which details from Passage 2 support the concern that AI may weaken critical thinking?",
    instructions: "Select all that apply.",
    options: [
      "Students may rely on AI instead of engaging in productive struggle.",
      "AI tools always provide incorrect answers.",
      "Overuse of automation can limit opportunities for independent problem-solving.",
      "Teachers benefit from faster grading."
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
        { id: "d3", text: "Research organizations report benefits of adaptive learning technologies." },
        { id: "d1", text: "Schools should use AI tools to support learning." },
        { id: "d2", text: "AI allows instruction to adapt to individual student needs." },
        
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
      { id: "f2", text: "Not all students have equal access to advanced AI tools." },
      { id: "f3", text: "Teachers struggle to verify student understanding." },
      { id: "f1", text: "Students may depend on AI instead of thinking independently." }
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
      { id: "h1", text: "AI tools have the potential to strengthen education.", correct: false },
      { id: "h2", text: "UNESCO reports that adaptive technologies can provide targeted feedback.", correct: true },
      { id: "h3", text: "Research shows interactive platforms improve student engagement.", correct: true },
      { id: "h4", text: "Schools should embrace innovation.", correct: false }
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
      { id: "i1", text: "AI-generated work makes assessment difficult.", correct: false },
      { id: "i2", text: "Schools should restrict AI use until safeguards exist.", correct: true },
      { id: "i3", text: "Overreliance on AI threatens independent learning.", correct: true },
      { id: "i4", text: "Some tools provide automated feedback.", correct: false }
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
    options: ["limit", "replace", "enhance"],
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
    options: ["fully unrestricted", "carefully limited", "encouraged without rules"],
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
        "Students enjoy technology.",
        "UNESCO reports benefits of adaptive learning tools.",
        "Teachers benefit from reduced workload.",
        "AI is common in society."
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
        "AI tools are expensive.",
        "Teachers enjoy automation.",
        "AI works quickly.",
        "Students rely on AI instead of productive struggle."
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
    { id: "o3", text: "Critics warn unrestricted AI use may weaken critical thinking." },
    { id: "o1", text: "AI tools can personalize instruction and support diverse learners." },
    { id: "o4", text: "Concerns emerge about fairness, honesty, and assessment accuracy." },
    { id: "o2", text: "Supporters argue AI prepares students for future careers." }
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
      "UNESCO reports that adaptive technologies can help identify learning gaps.",
      "AI tools are dangerous if students rely on them too often.",
      "The OECD emphasizes the importance of digital literacy in modern education.",
      "Schools should prioritize fairness over convenience."
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
    stem: "What is the main idea of the video?",
    instructions: "Choose the best answer.",
    options: [
      "Artificial intelligence will replace teachers in schools.",
      "Students should be allowed to use AI tools for all schoolwork.",
      "AI tools are already perfect and should be used without limits.",
      "AI can support learning, but it also raises concerns that schools must consider."
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
    stem: "According to the video, what is one concern about using AI tools in classrooms?",
    instructions: "Choose the best answer.",
    options: [
      "Students may rely on AI instead of doing their own thinking.",
      "AI tools are too slow to be useful.",
      "Teachers are unable to learn how AI works.",
      "AI tools always give incorrect answers."
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
    stem: "Which inference can be made based on the video?",
    instructions: "Choose the answer that is supported by the video but not directly stated.",
    options: [
      "All schools should ban AI tools immediately.",
      "Clear rules are needed to decide how and when AI should be used in schools.",
      "AI tools are more helpful for teachers than for students.",
      "Students learn best when AI completes work for them."
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
      "Should teachers rely on AI for grading?",
      "Is AI already replacing educators?",
      "Does AI help learning more than it harms it?",
      "Should students decide when to use AI tools?"
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
      "Both agree AI should be banned in schools.",
      "Both believe AI improves thinking skills.",
      "One argues AI is necessary, while the other warns the risks are too high.",
      "One supports AI only for grading, the other only for lesson planning."
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
      "Lack of access to physical textbooks"
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
      "AI tools should immediately replace traditional teaching methods.",
      "Schools should allow unrestricted AI use.",
      "Clear guidelines are needed to balance AI benefits and risks.",
      "AI has no role in modern education."
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
