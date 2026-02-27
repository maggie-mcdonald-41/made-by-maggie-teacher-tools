// levels/below-grade-level.js
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
  stem: "Which statement best states the central idea of Passage 1 AND reflects how the author develops that idea throughout the passage?",
  instructions: "Choose the best answer.",
  options: [
    "Listening to music makes learning more enjoyable for many students.",
    "Students should always listen to music while completing schoolwork.",
    "Listening to music can support focus and motivation during work time when it is used responsibly.",
    "Music blocks background noise in loud environments."
  ],
  correctIndex: 2,
    skills: ["central-idea", "passage-1", "mcq"]
  },

  // 2. MCQ – Main idea, Passage 2 (correct = A)
  {
    id: 2,
    type: "mcq",
    linkedPassage: 2,
  stem: "Which statement best explains the central idea of Passage 2 and how the author builds that idea?",
  instructions: "Choose the best answer.",
  options: [
    "Music can distract students, cause them to miss important information, and create classroom challenges, so it may need to be limited during work time.",
    "Music with lyrics distracts students from reading and writing tasks.",
    "Students sometimes have difficulty focusing when music is playing.",
    "Music should never be allowed in classrooms because it interferes with learning."
  ],
  correctIndex: 0,
    skills: ["central-idea", "passage-2", "mcq"]
  },

  // 3. MCQ – Author’s opinion, Passage 1 (correct = D)
  {
    id: 3,
    type: "mcq",
    linkedPassage: 1,
  stem: "Which statement best describes the author’s opinion in Passage 1, including the tone the author uses to present the idea?",
  instructions: "Choose the best answer.",
  options: [
    "The author believes music should be required during all independent work because it improves learning.",
    "The author believes music can support students’ focus and motivation when it is used appropriately.",
    "The author suggests that music is enjoyable but does not clearly take a side on the issue.",
    "The author believes music is helpful mainly because students prefer working with background noise."
  ],
  correctIndex: 1,
    skills: ["author-opinion", "passage-1", "mcq"]
  },

  // 4. MCQ – Author’s opinion, Passage 2 (correct = B)
  {
    id: 4,
    type: "mcq",
    linkedPassage: 2,
  stem: "Which statement best describes the author’s opinion in Passage 2 and how strongly the author presents that opinion?",
  instructions: "Choose the best answer.",
  options: [
    "The author argues that music should be completely banned because it harms student learning.",
    "The author believes music can interfere with focus and classroom instruction, so it may need to be limited during work time.",
    "The author explains both sides of the issue but does not clearly favor one position.",
    "The author suggests that only music with lyrics causes problems during independent work."
  ],
  correctIndex: 1,
    skills: ["author-opinion", "passage-2", "mcq"]
  },

  // 5. Multi – Supporting details, Passage 1
  {
    id: 5,
    type: "multi",
    linkedPassage: 1,
  stem: "Which details from Passage 1 MOST strongly support the author’s reasoning that music can improve students’ ability to focus during independent work?",
  instructions: "Select all that apply.",
  options: [
    "Quiet music can help cover distracting sounds, making it easier to concentrate.",
    "When students feel calmer, they may be able to stay on task for longer periods of time.",
    "Many students enjoy listening to music while they work.",
    "Allowing music gives students a simple choice during work time.",
    "Some teachers report students stay engaged longer when listening to soft, instrumental music."
  ],
  correctIndices: [0, 1, 4],
  minSelections: 2,
  maxSelections: 3,
    skills: ["text-evidence", "details", "multi-select"]
  },

  // 6. Multi – Problems, Passage 2
  {
    id: 6,
    type: "multi",
    linkedPassage: 2,
  stem: "Which details from Passage 2 BEST show different ways listening to music can interfere with learning during work time?",
  instructions: "Select all that apply.",
  options: [
    "Songs with lyrics may pull attention away from reading or writing.",
    "Students may miss important information if they are listening to music.",
    "It can be difficult to make sure music is used appropriately.",
    "Some students enjoy listening to music while they work.",
    "Music can slow down learning and lead to mistakes."
  ],
  correctIndices: [0, 1, 2],
  minSelections: 2,
  maxSelections: 3,
    skills: ["text-evidence", "details", "multi-select"]
  },

  // 7. Order – Passage 1
  {
    id: 7,
    type: "order",
    linkedPassage: 1,
    stem: "Put the author’s reasoning in Passage 1 in the order it is developed, from the main claim to the concluding idea.",    instructions: "Drag and drop from first to last.",
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
    stem: "Put the author’s reasoning in Passage 2 in the order it is developed, showing how the concerns build toward the conclusion.",
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
  stem: "Match each part of Passage 1’s argument to the statement that best represents it.",
  instructions: "Match the items correctly.",
  left: [
    { id: "m1", text: "Claim" },
    { id: "m2", text: "Reason" },
    { id: "m3", text: "Evidence (specific support)" }
  ],
  right: [
    { id: "r1", text: "Students should be allowed to listen to music while working." },
    { id: "r2", text: "Music can improve students’ focus and engagement during independent tasks." },
    { id: "r3", text: "Quiet music can block background noise, making it easier to concentrate." }
  ],
  pairs: { m1: "r1", m2: "r2", m3: "r3" },
    skills: ["argument-structure", "matching"]
  },

  // 10. Match – Passage 2 problems
  {
    id: 10,
    type: "match",
    linkedPassage: 2,
  stem: "Match each cause described in Passage 2 with the effect it creates.",
  instructions: "Match the items correctly.",
  left: [
    { id: "m1", text: "Songs with lyrics" },
    { id: "m2", text: "Listening to music while teachers give directions" },
    { id: "m3", text: "Difficulty monitoring how music is used in class" }
  ],
  right: [
    { id: "r1", text: "Students may miss important instructions and become confused." },
    { id: "r2", text: "Students’ attention may shift away from reading or writing tasks." },
    { id: "r3", text: "Classroom focus and consistency may become harder to manage." }
  ],
  pairs: {
    m1: "r2",
    m2: "r1",
    m3: "r3"
  },
    skills: ["cause-effect", "matching"]
  },

  // 11. Highlight – Evidence, Passage 1
  {
    id: 11,
    type: "highlight",
    linkedPassage: 1,
  stem: "Which TWO sentences from Passage 1 work together as the strongest evidence supporting the author’s claim?",
  instructions: "Select exactly 2 sentences.",
  sentences: [
    { id: "h1", text: "Quiet music can help cover distracting sounds, making it easier to concentrate.", correct: true },
    { id: "h2", text: "When students feel calmer, they may be able to stay on task for longer periods of time.", correct: true },
    { id: "h3", text: "Many students enjoy listening to music while they work.", correct: false },
    { id: "h4", text: "Allowing music during work time gives students a simple choice.", correct: false },
    { id: "h5", text: "Students should be allowed to listen to music while working.", correct: false }
  ],
    skills: ["text-evidence", "highlight"]
  },

  // 12. Highlight – Problems, Passage 2
  {
    id: 12,
    type: "highlight",
    linkedPassage: 2,
  stem: "Which TWO sentences from Passage 2 best show two different ways music can interfere with learning?",
  instructions: "Select exactly 2 sentences.",
  sentences: [
    { id: "h1", text: "Songs with lyrics may pull attention away from reading or writing.", correct: true },
    { id: "h2", text: "If students are listening to music, they may miss important information.", correct: true },
    { id: "h3", text: "Instead of focusing on their work, students may start thinking about the music.", correct: false },
    { id: "h4", text: "Some students enjoy listening to music while they work.", correct: false },
    { id: "h5", text: "It can be difficult to make sure music is used appropriately.", correct: false }
  ],
    skills: ["text-evidence", "highlight"]
  },

  // 13. Part A/B – Passage 1
  {
    id: 13,
    type: "partAB",
    linkedPassage: 1,
  stem: "Answer Part A and Part B based on Passage 1.",
  partA: {
    stem: "What is the author’s main claim in Passage 1?",
    options: [
      "Music makes school more enjoyable for students.",
      "Students should be allowed to listen to music while working.",
      "Quiet classrooms are not necessary for learning.",
      "Teachers should choose music for students during work time."
    ],
    correctIndex: 1
  },
  partB: {
    stem: "Which sentence from Passage 1 BEST supports the claim in Part A?",
    options: [
      "Many students enjoy listening to music while they work.",
      "Quiet music can help cover distracting sounds, making it easier to concentrate.",
      "Some teachers report that students stay engaged longer with instrumental music.",
      "Allowing music during work time gives students a simple choice."
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
  stem: "Answer Part A and Part B based on Passage 2.",
  partA: {
    stem: "What is the author’s main reason for arguing that music should be limited during work time?",
    options: [
      "Music can interfere with students’ focus and understanding during learning tasks.",
      "Music is not enjoyable for every student.",
      "Music makes classrooms louder than necessary.",
      "Teachers prefer quiet classrooms."
    ],
    correctIndex: 0
  },
  partB: {
    stem: "Which sentence from Passage 2 BEST supports the reason identified in Part A?",
    options: [
      "Songs with lyrics may pull attention away from reading or writing.",
      "Music can also make it harder for students to hear instructions.",
      "Not all students choose music that helps them focus.",
      "Instead of focusing on their work, students may start thinking about the music."
    ],
    correctIndex: 1
  },
    skills: ["reason", "text-evidence", "two-part"]
  },

  // 15. Classify – Benefits vs Problems
  {
    id: 15,
    type: "classify",
  stem: "Sort each idea into the correct category based on how it is presented in the passages.",
  instructions: "Drag each idea to the correct column.",
  categories: [
    { id: "benefit", label: "Benefits of Listening to Music" },
    { id: "problem", label: "Problems with Listening to Music" }
  ],
  items: [
    { id: "c1", text: "Music can reduce the impact of distracting background noise.", categoryId: "benefit" },
    { id: "c2", text: "Students may fail to hear important directions during work time.", categoryId: "problem" },
    { id: "c3", text: "Music may increase students’ ability to stay engaged with a task.", categoryId: "benefit" },
    { id: "c4", text: "Monitoring how students use music can create classroom challenges.", categoryId: "problem" },
    { id: "c5", text: "Students enjoy having more control over their work environment.", categoryId: "benefit" }
  ],
  skills: ["classify"]
},

  // 16. Classify – Which passage?
  {
    id: 16,
    type: "classify",
  stem: "Sort each idea by the passage that best supports it.",
  instructions: "Use Passage 1 and Passage 2.",
  categories: [
    { id: "p1", label: "Passage 1" },
    { id: "p2", label: "Passage 2" }
  ],
  items: [
    { id: "c1", text: "Music can improve students’ ability to concentrate during independent tasks.", categoryId: "p1" },
    { id: "c2", text: "Listening to music may cause students to miss important classroom instructions.", categoryId: "p2" },
    { id: "c3", text: "When used responsibly, music can support learning.", categoryId: "p1" },
    { id: "c4", text: "It can be difficult to ensure music is used in a way that helps all students focus.", categoryId: "p2" },
    { id: "c5", text: "Music affects students differently depending on the situation.", categoryId: "p1" }
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
    options: ["rarely", "always", "can"],
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
    options: ["never", "barely", "always"],
    correctIndex: 1,
    skills: ["revise", "author-opinion"]
  },

  // 19. Order – Compare passages
  {
    id: 19,
    type: "order",
  stem: "Put the statements in an order that best shows how Passage 2 responds to the argument in Passage 1.",
  instructions: "Drag and drop from first to last.",
  items: [
    { id: "cp1", text: "Listening to music can improve focus and engagement during independent work." },
    { id: "cp2", text: "Listening to music can distract students and cause them to miss important instructions." }
  ],
  correctOrder: ["cp1", "cp2"],
    skills: ["compare-passages", "order"]
  },

  // 20. Revise – Stronger wording
  {
    id: 20,
    type: "revise",
    linkedPassage: 1,
  stem: "Choose the revision that makes the sentence clearer and more precise while keeping the author’s original meaning.",
  originalSentence: "Music is kind of helpful for students.",
  sentenceParts: ["Music is ", " helpful for students."],
  options: ["extremely", "sometimes", "rarely"],
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
  stem: "Which statement best explains the central idea of the podcast?",
  instructions: "Listen to the podcast, then choose the best answer.",
  options: [
    "Music improves reading comprehension because it strengthens the brain over time.",
    "Music can either help or interfere with reading, depending on the type of music and how the brain processes it.",
    "Music with lyrics always distracts students from completing schoolwork.",
    "Students should decide for themselves whether music helps them focus."
  ],
  correctIndex: 1,
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
  stem: "According to the podcast, what is the main reason music with lyrics can interfere with reading comprehension?",
  instructions: "Choose the best answer based on what you hear.",
  options: [
    "Students may prefer listening to music instead of completing their reading assignments.",
    "Music makes students feel relaxed, which reduces their urgency to read carefully.",
    "Teachers cannot monitor whether students are paying attention while music is playing.",
    "The brain must divide its attention between processing lyrics and understanding the text.",
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
  stem: "Answer Part A and Part B using the podcast and Passage 2.",
  partA: {
    stem: "Which idea from the podcast most closely supports the argument made in Passage 2?",
    options: [
      "Music training can strengthen certain areas of the brain over time.",
      "Instrumental music is less distracting than music with lyrics.",
      "The brain must divide its attention when processing both music and reading at the same time.",
      "Music can improve students’ mood during difficult tasks."
    ],
    correctIndex: 2
  },
  partB: {
    stem: "Which sentence from Passage 2 best supports the same reasoning?",
    options: [
      "Songs with lyrics may pull attention away from reading or writing.",
      "Some students work in places that are loud or busy.",
      "Music can make learning more enjoyable.",
      "Allowing music during work time gives students a simple choice."
    ],
    correctIndex: 0
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
  stem: "Based on the video, which inference can best be made about listening to music while working?",
  instructions: "Watch the video, then choose the answer that is supported but not directly stated.",
  options: [
    "Music improves performance on all types of academic tasks.",
    "Whether music helps or distracts depends on the type of task and the type of music.",
    "Students who prefer music are usually stronger readers.",
    "Teachers should require instrumental music during every class period."
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
  stem: "Using information from the passages, the podcast, and the video, which policy about listening to music during work time is best supported?",
  instructions: "Choose the answer that is most strongly supported by ALL sources.",
  options: [
    "Music should be banned during all independent work because it distracts students from learning.",
    "Students should be free to listen to any type of music they choose during any task.",
    "Music may be allowed during certain independent tasks if it is instrumental and does not interfere with instructions or concentration.",
    "Teachers should create a single required playlist so that all students have the same experience."
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
