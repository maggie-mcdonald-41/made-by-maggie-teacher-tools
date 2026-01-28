// levels/above-level.js
// Below-grade-level content bundle: passages + questions + sets

window.READING_LEVEL = {
  id: "below",
  label: "Below Grade Level",

passages: {
  1: {
    title: "Why Listening to Music Can Help Students While Working",
    html: `
    <h2 class="passage-title">Why Listening to Music Can Help Students While Working</h2> 
    <p class="passage-lexile"><em>Estimated Lexile Level: 720L–800L</em></p>
 
    <p>
        Many students enjoy listening to music while they work. Supporters believe that music can help students stay focused and calm, especially during independent tasks. They argue that allowing music while working can improve concentration, block out distractions, and make learning more enjoyable. Students should be allowed to listen to music while working because it can help them focus and stay motivated.
      </p>

      <p>
        One reason music can help students is that it blocks out background noise. Some students work in places that are loud or busy, especially during virtual learning. Quiet music can help cover distracting sounds, making it easier to concentrate. When students feel calmer, they may be able to stay on task for longer periods of time.
      </p>

        <figure class="graph-placeholder">
          <img src="../media/music-image1.png"
               alt="Image of Music benefits summary">
          <figcaption>
            Image of music benefits summary
          </figcaption>
        </figure>
      
      <p>
        Music can also make learning feel more enjoyable. When students feel relaxed and comfortable, they may be more willing to complete their work. Some teachers report that students stay engaged longer when they are allowed to listen to soft, instrumental music during independent work time.
      </p>

      <p>
        When used responsibly, listening to music can support learning. Allowing music during work time gives students a simple choice that may help them focus and complete tasks more effectively.
      </p>
    `
  },

  2: {
    title: "Why Listening to Music Can Be a Distraction While Working",
    html: `
    <h2 class="passage-title">Why Listening to Music Can Be a Distraction While Working</h2>  
    <p class="passage-lexile"><em>Estimated Lexile Level: 750L–820L</em></p>

    <p>
        Although some students enjoy listening to music while they work, others believe it can cause problems. Critics argue that music can distract students, make it harder to follow directions, and reduce focus. Because of these concerns, students should not be allowed to listen to music while working.
      </p>

      <p>
        One problem with listening to music is that it can distract students from their tasks. Songs with lyrics may pull attention away from reading or writing. Instead of focusing on their work, students may start thinking about the music. This can slow down learning and lead to mistakes.
      </p>

        <figure class="graph-placeholder">
          <img src="../media/music-image2.png"
               alt="Image of Music issues summary">
          <figcaption>
            Image of music issues summary
          </figcaption>
        </figure>

      <p>
        Music can also make it harder for students to hear instructions. Teachers often give directions during work time. If students are listening to music, they may miss important information. This can cause confusion and require teachers to repeat directions.
      </p>

      <p>
        In addition, it can be difficult to make sure music is used appropriately. Not all students choose music that helps them focus. Because of these challenges, limiting music during work time may help students stay more focused and complete their work more accurately.
      </p>
    `
  }
},

  questions: (function () {
  // Types: 'mcq', 'multi', 'order', 'match', 'highlight', 'dropdown', 'classify', 'partAB', 'revise'
let questions = [

  // 1. MCQ – Main idea, Passage 1 (correct = C)
  {
    id: 1,
    type: "mcq",
    linkedPassage: 1,
    stem: "What is the main idea of Passage 1?",
    instructions: "Choose the best answer.",
    options: [
      "All students need music to learn.",
      "Music is better than silence for every task.",
      "Listening to music can help students focus and enjoy their work.",
      "Music should only be played during breaks."
    ],
    correctIndex: 2,
    skills: ["central-idea", "passage-1", "mcq"]
  },

  // 2. MCQ – Main idea, Passage 2 (correct = A)
  {
    id: 2,
    type: "mcq",
    linkedPassage: 2,
    stem: "What is the author mainly explaining in Passage 2?",
    instructions: "Choose the best answer.",
    options: [
      "Listening to music can distract students and cause problems.",
      "Music helps students finish work faster.",
      "Teachers enjoy music during class.",
      "Music is fun for everyone."
    ],
    correctIndex: 0,
    skills: ["central-idea", "passage-2", "mcq"]
  },

  // 3. MCQ – Author’s opinion, Passage 1 (correct = D)
  {
    id: 3,
    type: "mcq",
    linkedPassage: 1,
    stem: "How does the author of Passage 1 feel about listening to music while working?",
    instructions: "Choose the best answer.",
    options: [
      "The author strongly disagrees with it.",
      "The author believes it should always be required.",
      "The author does not give an opinion.",
      "The author believes it can help students when used responsibly."
    ],
    correctIndex: 3,
    skills: ["author-opinion", "passage-1", "mcq"]
  },

  // 4. MCQ – Author’s opinion, Passage 2 (correct = B)
  {
    id: 4,
    type: "mcq",
    linkedPassage: 2,
    stem: "What is the author’s opinion in Passage 2?",
    instructions: "Choose the best answer.",
    options: [
      "Music is needed for learning.",
      "Music can distract students during work time.",
      "Music helps all students focus.",
      "Music should be used only during breaks."
    ],
    correctIndex: 1,
    skills: ["author-opinion", "passage-2", "mcq"]
  },

  // 5. Multi – Supporting details, Passage 1
  {
    id: 5,
    type: "multi",
    linkedPassage: 1,
    stem: "Which details from Passage 1 support the idea that music can help students focus?",
    instructions: "Select all that apply.",
    options: [
      "Music can block out background noise.",
      "Music helps some students feel calm.",
      "Music makes students miss directions.",
      "Some students stay engaged longer."
    ],
    correctIndices: [0, 1, 3],
    minSelections: 2,
    maxSelections: 3,
    skills: ["text-evidence", "details", "multi-select"]
  },

  // 6. Multi – Problems, Passage 2
  {
    id: 6,
    type: "multi",
    linkedPassage: 2,
    stem: "Which problems with music are explained in Passage 2?",
    instructions: "Select all that apply.",
    options: [
      "Songs with lyrics can distract students.",
      "Music always improves focus.",
      "Students may miss directions.",
      "Teachers enjoy repeating instructions."
    ],
    correctIndices: [0, 2],
    minSelections: 2,
    maxSelections: 3,
    skills: ["text-evidence", "details", "multi-select"]
  },

  // 7. Order – Passage 1
  {
    id: 7,
    type: "order",
    linkedPassage: 1,
    stem: "Put the ideas from Passage 1 in the order they appear.",
    instructions: "Drag and drop from first to last.",
    items: [
        { id: "o4", text: "Music should be used responsibly." },
        { id: "o1", text: "The author introduces the idea of music during work time." },
        { id: "o3", text: "Music can make learning more enjoyable." },
        { id: "o2", text: "Music can block out background noise." },
   
    ],
    correctOrder: ["o1", "o2", "o3", "o4"],
    skills: ["text-structure", "order", "passage-1"]
  },

  // 8. Order – Passage 2
  {
    id: 8,
    type: "order",
    linkedPassage: 2,
    stem: "Sequence the ideas from Passage 2.",
    instructions: "Drag and drop the ideas in the correct order.",
    items: [
        { id: "o8", text: "The author explains why music should be limited." },
        { id: "o6", text: "Music can distract students." },
        { id: "o7", text: "Music can cause students to miss directions." },
        { id: "o5", text: "The author explains concerns about music." },
    ],
    correctOrder: ["o5", "o6", "o7", "o8"],
    skills: ["text-structure", "order", "passage-2"]
  },

  // 9. Match – Passage 1 argument
  {
    id: 9,
    type: "match",
    linkedPassage: 1,
    stem: "Match each part of Passage 1’s argument.",
    instructions: "Match the items correctly.",
    left: [
      { id: "m1", text: "Claim" },
      { id: "m2", text: "Reason" },
      { id: "m3", text: "Detail" }
    ],
    right: [
        { id: "r2", text: "Music helps students focus and feel calm." },
        { id: "r3", text: "Music blocks out background noise." },
        { id: "r1", text: "Students should be allowed to listen to music while working." },

    ],
    pairs: { m1: "r1", m2: "r2", m3: "r3" },
    skills: ["argument-structure", "matching"]
  },

  // 10. Match – Passage 2 problems
  {
    id: 10,
    type: "match",
    linkedPassage: 2,
    stem: "Match each problem with what it causes.",
    instructions: "Match the items correctly.",
    left: [
      { id: "m4", text: "Lyrics in songs" },
      { id: "m5", text: "Listening during directions" }
    ],
    right: [
      { id: "r4", text: "Can distract students from reading or writing." },
      { id: "r5", text: "Can cause students to miss instructions." }
    ],
    pairs: { m4: "r4", m5: "r5" },
    skills: ["cause-effect", "matching"]
  },

  // 11. Highlight – Evidence, Passage 1
  {
    id: 11,
    type: "highlight",
    linkedPassage: 1,
    stem: "Which sentences from Passage 1 give reasons why music can help students?",
    instructions: "Select all that apply.",
    sentences: [
      { id: "h1", text: "Music can block out background noise.", correct: true },
      { id: "h2", text: "Some students feel calmer with quiet music.", correct: true },
      { id: "h3", text: "Music is popular.", correct: false },
      { id: "h4", text: "Music should always be allowed.", correct: false }
    ],
    skills: ["text-evidence", "highlight"]
  },

  // 12. Highlight – Problems, Passage 2
  {
    id: 12,
    type: "highlight",
    linkedPassage: 2,
    stem: "Which sentences show problems with listening to music?",
    instructions: "Select all that apply.",
    sentences: [
      { id: "h5", text: "Songs with lyrics may pull attention away.", correct: true },
      { id: "h6", text: "Students enjoy music.", correct: false },
      { id: "h7", text: "Students may miss important directions.", correct: true },
      { id: "h8", text: "Music is relaxing.", correct: false }
    ],
    skills: ["text-evidence", "highlight"]
  },

  // 13. Part A/B – Passage 1
  {
    id: 13,
    type: "partAB",
    linkedPassage: 1,
    stem: "Answer Part A and Part B.",
    partA: {
      stem: "What is the author’s claim in Passage 1?",
      options: [
        "Music should only be played at home.",
        "Music should be loud.",
        "Students dislike quiet rooms.",
        "Students should be allowed to listen to music while working."
      ],
      correctIndex: 3
    },
    partB: {
      stem: "Which detail best supports this claim?",
      options: [
        "Music is popular.",
        "Music blocks out background noise.",
        "Music is new.",
        "Music is fun."
      ],
      correctIndex: 1
    },
    skills: ["claim", "text-evidence", "two-part"]
  },

  // 14. Part A/B – Passage 2
  {
    id: 14,
    type: "partAB",
    linkedPassage: 2,
    stem: "Answer Part A and Part B.",
    partA: {
      stem: "Why does the author believe music can be a problem?",
      options: [
        "Music is boring.",
        "Music is expensive.",
        "Music can distract students.",
        "Music is too quiet."
      ],
      correctIndex: 2
    },
    partB: {
      stem: "Which sentence best supports this idea?",
      options: [
        "Music can make students miss directions.",
        "Music is enjoyable.",
        "Music is helpful.",
        "Music is popular."
      ],
      correctIndex: 0
    },
    skills: ["reason", "text-evidence", "two-part"]
  },

  // 15. Classify – Benefits vs Problems
  {
    id: 15,
    type: "classify",
    stem: "Sort each idea into the correct category.",
    instructions: "Drag each idea to the correct column.",
    categories: [
      { id: "benefit", label: "Benefits of Music" },
      { id: "problem", label: "Problems with Music" }
    ],
    items: [
      { id: "c1", text: "Blocks out background noise", categoryId: "benefit" },
      { id: "c2", text: "Students may miss directions", categoryId: "problem" }
    ],
    skills: ["classify"]
  },

  // 16. Classify – Which passage?
  {
    id: 16,
    type: "classify",
    stem: "Sort each idea by the passage it comes from.",
    instructions: "Use Passage 1 and Passage 2.",
    categories: [
      { id: "p1", label: "Passage 1" },
      { id: "p2", label: "Passage 2" }
    ],
    items: [
      { id: "c3", text: "Music helps students stay calm.", categoryId: "p1" },
      { id: "c4", text: "Music can distract students.", categoryId: "p2" }
    ],
    skills: ["compare-passages", "classify"]
  },

  // 17. Revise – Passage 1
  {
    id: 17,
    type: "revise",
    linkedPassage: 1,
    stem: "Choose the revision that best matches the author’s meaning.",
    originalSentence: "Music might help students work.",
    sentenceParts: [
      "Music ",
      " help students focus while working."
    ],
    options: ["rarely", "might", "can"],
    correctIndex: 2,
    skills: ["revise", "clarity"]
  },

  // 18. Revise – Passage 2
  {
    id: 18,
    type: "revise",
    linkedPassage: 2,
    stem: "Choose the revision that best explains the author’s concern.",
    originalSentence: "Music can be a problem.",
    sentenceParts: [
      "Music ",
      " distract students during work time."
    ],
    options: ["never", "can", "always"],
    correctIndex: 1,
    skills: ["revise", "author-opinion"]
  },

  // 19. Order – Compare passages
  {
    id: 19,
    type: "order",
    stem: "Put the claims from the passages in the correct order.",
    instructions: "Drag and drop from Passage 1 to Passage 2.",
    items: [
      { id: "cp1", text: "Music can help students focus while working." },
      { id: "cp2", text: "Music can distract students during work time." }
    ],
    correctOrder: ["cp1", "cp2"],
    skills: ["compare-passages", "order"]
  },

  // 20. Revise – Stronger wording
  {
    id: 20,
    type: "revise",
    linkedPassage: 1,
    stem: "Choose the revision that makes the sentence clearer.",
    originalSentence: "Music is kind of helpful.",
    sentenceParts: [
      "Music is ",
      " helpful for some students."
    ],
    options: ["kind of", "very", "not"],
    correctIndex: 1,
    skills: ["revise", "precision-language"]
  },

  // 21. MCQ – Podcast, central idea (correct = A)
  {
    id: 21,
    type: "mcq",
    linkedPassage: null,
    media: {
      type: "audio",
      src: "../media/Music_Helps_or_Hurts_Reading_Focus.m4a",
      captions: "../media/Music_Helps_or_Hurts_Reading_Focus.m4a.vtt",
      label: "Podcast: Music Helps or Hurts Reading Focus"
    },
    stem: "What is the main idea of the podcast?",
    instructions: "Listen to the podcast, then choose the best answer.",
    options: [
      "Music can help some students focus, but it can distract others.",
      "Teachers should choose music for students.",
      "All students should always listen to music while reading.",
      "Music should never be used during schoolwork."
    ],
    correctIndex: 0,
    skills: ["listening-comprehension", "central-idea", "audio-media", "mcq"]
  },

  // 22. MCQ – Podcast, detail (correct = D)
  {
    id: 22,
    type: "mcq",
    linkedPassage: null,
    media: {
      type: "audio",
      src: "../media/Music_Helps_or_Hurts_Reading_Focus.m4a",
      captions: "../media/Music_Helps_or_Hurts_Reading_Focus.m4a.vtt",
      label: "Podcast: Music Helps or Hurts Reading Focus"
    },
    stem: "According to the podcast, why can music sometimes make reading harder?",
    instructions: "Choose the best answer based on what you hear.",
    options: [
      "Music causes students to read faster than normal.",
      "Music makes books less interesting.",
      "Students are not allowed to pause music.",
      "Songs with lyrics can distract students from the words they are reading."
    ],
    correctIndex: 3,
    skills: ["listening-comprehension", "details", "audio-media", "mcq"]
  },

  // 23. Part A/B – Podcast + passages
  {
    id: 23,
    type: "partAB",
    linkedPassage: null,
    media: {
      type: "audio",
      src: "../media/Music_Helps_or_Hurts_Reading_Focus.m4a",
      captions: "../media/Music_Helps_or_Hurts_Reading_Focus.m4a.vtt",
      label: "Podcast: Music Helps or Hurts Reading Focus"
    },
    stem: "Answer Part A and Part B using the podcast and the passages.",
    partA: {
      stem: "What idea from the podcast best matches a claim made in Passage 2?",
      options: [
        "Music can help students feel calm while working.",
        "Music should always be allowed during reading.",
        "Music helps students work faster.",
        "Music can distract students and make it harder to focus."
      ],
      correctIndex: 3
    },
    partB: {
      stem: "Which idea from Passage 2 supports your answer to Part A?",
      options: [
        "Music blocks out background noise.",
        "Music makes learning more enjoyable.",
        "Songs with lyrics may pull attention away from reading or writing.",
        "Some teachers play instrumental music."
      ],
      correctIndex: 2
    },
    skills: [
      "listening-comprehension",
      "compare-media",
      "text-evidence",
      "two-part",
      "audio-media"
    ]
  },

  // 24. MCQ – Video, inference (correct = B)
  {
    id: 24,
    type: "mcq",
    linkedPassage: null,
    media: {
      type: "video",
      src: "../media/Music_While_You_Work_.mp4",
      captions: "../media/Music_While_You_Work_.mp4.vtt",
      label: "Video: Music While You Work"
    },
    stem: "Based on the video, which inference can the viewer make about listening to music while working?",
    instructions: "Watch the video, then choose the answer that is supported by the video but not directly stated.",
    options: [
      "Students should always be allowed to listen to music in class.",
      "Some students focus better with music, while others are distracted.",
      "Listening to music works the same way for all tasks.",
      "Listening to music helps every student work better."
    ],
    correctIndex: 1,
    skills: ["inference", "listening-comprehension", "video-media", "mcq"]
  },

  // 25. MCQ – Video + passages, synthesis (correct = C)
  {
    id: 25,
    type: "mcq",
    linkedPassage: null,
    media: {
      type: "video",
      src: "../media/Music_While_You_Work_.mp4",
      captions: "../media/Music_While_You_Work_.mp4.vtt",
      label: "Video: Music While You Work"
    },
    stem: "Based on the video and the passages, which statement best explains why rules about listening to music while working are important?",
    instructions: "Use information from the video and both passages to choose the best answer.",
    options: [
      "Rules make school more enjoyable for students.",
      "Rules help teachers decide what music students should hear.",
      "Rules help balance focus, fairness, and learning needs for different students.",
      "Rules stop students from listening to music completely."
    ],
    correctIndex: 2,
    skills: ["synthesis", "compare-media", "compare-passages", "evaluate-ideas", "video-media", "mcq"]
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
