// levels/below-grade-level.js
// 7th Grade below-level content bundle: passages + questions + sets

window.READING_LEVEL = {
  id: "below",
  label: "Below Grade Level",

  passages: {
    1: {
      title: "Why Sleep and Routines Help the Brain Focus",
      html: `
        <h2 class="passage-title">Why Sleep and Routines Help the Brain Focus</h2>
        <p class="passage-lexile"><em>Estimated Lexile Level: 800L–890L</em></p>
        <p><span class="para-num">1</span> Many students have had a morning when focusing felt almost impossible. A student may read the same sentence three times, forget directions, or stare at an assignment without knowing where to begin. These problems do not always happen because the work is too hard. Often, the brain is tired, rushed, or distracted before the school day even starts.</p>
        <p><span class="para-num">2</span> Sleep is one of the main ways the brain gets ready to learn. During sleep, the brain rests and organizes information from the day before. A student who sleeps enough is more likely to remember directions, notice details, and stay calm when a task takes effort. A student who sleeps too little may feel foggy, impatient, or more likely to make careless mistakes.</p>
        <p><span class="para-num">3</span> Routines can also improve focus. A routine is a pattern of actions that happens in a regular order. For example, a student might pack a backpack before bed, charge a school device in the same place, and begin homework at the same time each afternoon. These habits do not complete the work for the student, but they reduce the number of decisions the student must make. When the brain spends less energy deciding what to do next, it has more energy for reading, thinking, and problem solving.</p>
        <p><span class="para-num">4</span> Screen habits matter too. Phones, videos, games, and messages can keep the brain alert when it should be winding down. A bright screen or exciting video close to bedtime can make it harder for some students to fall asleep. Notifications can also interrupt homework time. Even a quick glance at a message can break a student’s attention and make it harder to return to the task.</p>
        <table class="passage-table">
          <caption>Sample Evening Habits and Possible Effects</caption>
          <thead>
            <tr><th>Habit</th><th>Possible Effect on Focus</th></tr>
          </thead>
          <tbody>
            <tr><td>Keeping a regular bedtime</td><td>The brain knows when to rest and wake up.</td></tr>
            <tr><td>Packing materials before bed</td><td>The morning feels less rushed.</td></tr>
            <tr><td>Turning off notifications during homework</td><td>Attention is interrupted less often.</td></tr>
            <tr><td>Watching videos until bedtime</td><td>Falling asleep may become harder.</td></tr>
          </tbody>
        </table>
        <p><span class="para-num">5</span> Better focus does not require a perfect schedule. Small changes can help. Going to bed at a steady time, placing a phone away from the bed, and creating a short homework routine can make schoolwork feel more manageable. These habits give the brain a better chance to do what it is built to do: pay attention, remember, and learn.</p>
      `
    },
    2: {
      title: "Maya’s New Plan",
      html: `
        <h2 class="passage-title">Maya’s New Plan</h2>
        <p class="passage-lexile"><em>Estimated Lexile Level: 790L–880L</em></p>
        <p><span class="para-num">1</span> On Monday morning, Maya opened her science notebook and frowned. The page was blank except for the date. Her teacher had just asked the class to answer three review questions, but Maya could not remember where the notes were. She pushed papers around in her folder and whispered, “I know I wrote this down somewhere.”</p>
        <p><span class="para-num">2</span> Maya had stayed up late the night before watching short videos. She had told herself she would watch only two, but the next video started before she made a decision. By the time she put her tablet away, her eyes felt dry and heavy. Now, in class, every sound seemed louder than usual. A pencil tapped. A chair scraped. Someone laughed across the room. Maya read the first review question twice and still did not understand it.</p>
        <p><span class="para-num">3</span> After school, Maya’s older brother Luis noticed her dropping books on the kitchen table. “Rough day?” he asked. Maya sighed and explained that she had missed part of the lesson and forgotten to turn in a reading response. Luis did not scold her. Instead, he helped her make a simple plan. First, she would put her tablet on the charger in the hallway at 8:30. Next, she would place her notebook and folder in her backpack before bed. Finally, she would spend ten minutes after school checking her assignment list.</p>

      <figure class="passage-figure maya-figure">
        <img class="passage-image maya-image" src="../media/maya.png" alt="Illustration of Maya organizing her school materials as part of her evening routine.">
        <figcaption>Maya builds a simple routine to help her start the school day prepared.</figcaption>
      </figure>
        <p><span class="para-num">4</span> The plan felt almost too simple, but Maya tried it for the rest of the week. On Tuesday, she still wanted to grab her tablet after 8:30, but it was not beside her bed. On Wednesday, she found her homework folder quickly because it was already in her backpack. By Thursday, she noticed that class felt less noisy. The room had not changed, but Maya felt more prepared to handle it.</p>
        <p><span class="para-num">5</span> On Friday, Maya’s teacher returned the science review. Maya had missed one question, but she had finished the assignment on time. That afternoon, Luis asked whether the plan had fixed everything. Maya laughed. “Not everything,” she said. “But I’m not starting the day already behind.” For Maya, the new routine was not magic. It was a tool that helped her focus before distractions took over.</p>
      `
    }
  },

  questions: (function () {
    // Types: 'mcq', 'multi', 'order', 'match', 'highlight', 'dropdown', 'classify', 'partAB', 'revise'
    let questions = [
      {
        id: 1,
        type: "mcq",
        linkedPassage: 1,
        stem: "Which statement best explains how the author develops the central idea of Passage 1?",
        instructions: "Choose the best answer.",
        options: [
          "The author argues that students lose focus mostly because schoolwork is too difficult, then suggests that teachers should assign less work.",
          "The author explains several habits that affect focus, then shows how small changes can help students manage attention more effectively.",
          "The author compares students who use screens with students who do not, then concludes that screens should never be used before school.",
          "The author tells a story about one student’s routine, then uses the story to prove that routines work the same way for everyone."
        ],
        correctIndex: 1,
        standards: ["7.P.EICC.3", "7.T.T.2.a", "7.T.SS.1.a"],
        skills: ["central-idea", "expository-techniques", "text-structure", "passage-1", "mcq"]
      },
      {
        id: 2,
        type: "mcq",
        linkedPassage: 2,
        stem: "Which summary best captures how Maya changes from the beginning to the end of Passage 2?",
        instructions: "Choose the best answer.",
        options: [
          "Maya begins the week unable to complete any schoolwork, but by Friday she has solved all of her problems by avoiding technology.",
          "Maya starts the week disorganized and distracted, but a simple routine helps her feel more prepared even though she is not perfect.",
          "Maya struggles because science is too difficult, but Luis teaches her how to answer the review questions correctly.",
          "Maya feels distracted by her classmates, but she learns that the classroom is not actually as noisy as she thought."
        ],
        correctIndex: 1,
        standards: ["7.P.EICC.3.d", "7.T.T.1.a", "7.T.T.1.c"],
        skills: ["summarizing", "theme-development", "characterization", "passage-2", "mcq"]
      },
      {
        id: 3,
        type: "mcq",
        linkedPassage: 1,
        stem: "How does the structure of Passage 1 help the author make the information easier to understand?",
        instructions: "Choose the best answer.",
        options: [
          "The author moves from a common student problem to several causes and solutions, helping readers connect habits to focus.",
          "The author tells events in time order so readers can follow one student’s school day from morning to night.",
          "The author presents two opposing arguments about screen use and lets readers decide which argument is stronger.",
          "The author begins with the table because the table contains all of the evidence needed to understand the passage."
        ],
        correctIndex: 0,
        standards: ["7.T.SS.1.a", "7.T.T.2.a"],
        skills: ["text-structure", "expository-techniques", "purpose-audience", "passage-1", "mcq"]
      },
      {
        id: 4,
        type: "mcq",
        linkedPassage: 2,
        stem: "Which interpretation of Maya’s experience is best supported by the whole passage?",
        instructions: "Choose the best answer.",
        options: [
          "Maya’s routine matters because it lets Luis take over her school responsibilities.",
          "Maya’s routine works because the teacher removes the classroom distractions by Thursday.",
          "Maya’s routine helps her prevent some problems before they make focusing harder.",
          "Maya’s routine succeeds because it completely fixes her screen habits and grades."
        ],
        correctIndex: 2,
        standards: ["7.T.T.1.a", "7.T.T.1.c", "7.P.EICC.3.a"],
        skills: ["inference", "theme-development", "critical-thinking", "passage-2", "mcq"]
      },
      {
        id: 5,
        type: "multi",
        linkedPassage: 1,
        stem: "Which details from Passage 1 most strongly support the idea that screen habits can affect a student’s ability to focus later?",
        instructions: "Select exactly 3 answers.",
        options: [
          "A routine is a pattern of actions that happens in a regular order.",
          "Phones, videos, games, and messages can keep the brain alert when it should be winding down.",
          "A student might pack a backpack before bed and charge a school device in the same place.",
          "Notifications can interrupt homework time and break a student’s attention.",
          "A bright screen or exciting video close to bedtime can make it harder for some students to fall asleep."
        ],
        correctIndices: [1, 3, 4],
        minSelections: 3,
        maxSelections: 3,
        standards: ["7.T.T.2.a", "7.P.EICC.3.g", "7.T.C.2.b"],
        skills: ["text-evidence", "details", "cause-effect", "passage-1", "multi-select"]
      },
      {
        id: 6,
        type: "multi",
        linkedPassage: 2,
        stem: "Which details best show that Maya’s problem on Monday is not just missing notes, but a larger struggle with attention?",
        instructions: "Select exactly 3 answers.",
        options: [
          "She could not remember where the notes were.",
          "Every sound seemed louder than usual.",
          "She read the first review question twice and still did not understand it.",
          "Luis helped her make a simple plan after school.",
          "Maya’s teacher returned the science review on Friday."
        ],
        correctIndices: [0, 1, 2],
        minSelections: 3,
        maxSelections: 3,
        standards: ["7.T.T.1.a", "7.P.EICC.3.f"],
        skills: ["details", "inference", "text-evidence", "passage-2", "multi-select"]
      },
      {
        id: 7,
        type: "mcq",
        linkedPassage: 1,
        stem: "In paragraph 2 of Passage 1, how does the word foggy contribute to the author’s explanation of too little sleep?",
        instructions: "Choose the best answer.",
        options: [
          "It suggests that a tired brain may feel unclear and slow, which supports the idea that sleep affects learning.",
          "It suggests that students become angry when they are tired, which supports the idea that sleep mainly affects behavior.",
          "It suggests that school mornings are confusing for all students, which supports the idea that routines are unnecessary.",
          "It suggests that students are bored by difficult work, which supports the idea that assignments should be easier."
        ],
        correctIndex: 0,
        standards: ["7.L.V.3.b", "7.T.SS.2.a"],
        skills: ["vocabulary-in-context", "connotation", "author-meaning", "passage-1", "mcq"]
      },
      {
        id: 8,
        type: "mcq",
        linkedPassage: 2,
        stem: "What does the phrase distractions took over suggest about Maya’s routine at the end of Passage 2?",
        instructions: "Choose the best answer.",
        options: [
          "The routine helps Maya act before distractions become too powerful for her to manage.",
          "The routine teaches Maya that distractions are caused mostly by other students.",
          "The routine proves that Maya can avoid every distraction if she follows Luis’s directions.",
          "The routine makes Maya realize that distractions are less serious than she first believed."
        ],
        correctIndex: 0,
        standards: ["7.L.V.3.b", "7.T.SS.2.a", "7.T.T.1.c"],
        skills: ["vocabulary-in-context", "author-meaning", "theme-development", "passage-2", "mcq"]
      },
      {
        id: 9,
        type: "order",
        linkedPassage: 2,
        stem: "Order the events that best show how Maya’s conflict develops into a possible solution.",
        instructions: "Drag and drop from first to last.",
        items: [
          { id: "o3", text: "Luis helps Maya make a plan for her tablet, backpack, and assignment list." },
          { id: "o1", text: "Maya stays up late watching short videos even though she planned to watch only two." },
          { id: "o4", text: "Maya notices that class feels less noisy and that she is more prepared." },
          { id: "o2", text: "Maya struggles to find her notes and understand the science review question." }
        ],
        correctOrder: ["o1", "o2", "o3", "o4"],
        standards: ["7.T.T.1.a", "7.T.T.1.b", "7.T.SS.1.a"],
        skills: ["plot-structure", "cause-effect", "text-structure", "passage-2", "order"]
      },
      {
        id: 10,
        type: "match",
        linkedPassage: 1,
        stem: "Match each habit with the deeper reason it may support focus, based on Passage 1.",
        instructions: "Match the items correctly.",
        left: [
          { id: "m1", text: "Keeping a regular bedtime" },
          { id: "m2", text: "Packing materials before bed" },
          { id: "m3", text: "Turning off notifications during homework" }
        ],
        right: [
          { id: "r1", text: "It reduces rushed decisions before school." },
          { id: "r2", text: "It helps the brain prepare for rest and learning." },
          { id: "r3", text: "It protects attention from repeated interruptions." }
        ],
        pairs: { m1: "r2", m2: "r1", m3: "r3" },
        standards: ["7.T.C.1.b", "7.T.T.2.a", "7.P.EICC.3.c"],
        skills: ["cause-effect", "text-features", "inference", "matching", "passage-1"]
      },
      {
        id: 11,
        type: "highlight",
        linkedPassage: 1,
        stem: "Which TWO sentences from Passage 1 best support the inference that routines help by saving mental energy?",
        instructions: "Select exactly 2 sentences.",
        sentences: [
          { id: "h1", text: "Routines can also improve focus.", correct: false },
          { id: "h2", text: "These habits do not complete the work for the student, but they reduce the number of decisions the student must make.", correct: true },
          { id: "h3", text: "When the brain spends less energy deciding what to do next, it has more energy for reading, thinking, and problem solving.", correct: true },
          { id: "h4", text: "A routine is a pattern of actions that happens in a regular order.", correct: false },
          { id: "h5", text: "A student might pack a backpack before bed.", correct: false }
        ],
        standards: ["7.T.T.2.a", "7.P.EICC.3", "7.P.EICC.3.f"],
        skills: ["text-evidence", "inference", "details", "highlight", "passage-1"]
      },
      {
        id: 12,
        type: "highlight",
        linkedPassage: 2,
        stem: "Which TWO sentences from Passage 2 best show that Maya’s routine changes how she experiences school?",
        instructions: "Select exactly 2 sentences.",
        sentences: [
          { id: "h1", text: "On Wednesday, she found her homework folder quickly because it was already in her backpack.", correct: true },
          { id: "h2", text: "By Thursday, she noticed that class felt less noisy.", correct: true },
          { id: "h3", text: "The plan felt almost too simple, but Maya tried it for the rest of the week.", correct: false },
          { id: "h4", text: "Maya had stayed up late the night before watching short videos.", correct: false },
          { id: "h5", text: "Luis did not scold her.", correct: false }
        ],
        standards: ["7.T.T.1.a", "7.T.T.1.c", "7.P.EICC.3.f"],
        skills: ["text-evidence", "inference", "characterization", "highlight", "passage-2"]
      },
      {
        id: 13,
        type: "partAB",
        linkedPassage: 1,
        stem: "Answer Part A and Part B based on Passage 1.",
        partA: {
          stem: "Which claim about student focus is most strongly developed in Passage 1?",
          options: [
            "Focus can improve when students use habits that support sleep, reduce distractions, and lower the number of decisions they must make.",
            "Focus depends mainly on whether students enjoy the assignment they are completing.",
            "Focus improves only when students stop using screens for entertainment and schoolwork.",
            "Focus is mostly a natural skill that routines can support but cannot meaningfully change."
          ],
          correctIndex: 0
        },
        partB: {
          stem: "Which sentence best supports the answer to Part A?",
          options: [
            "Many students have had a morning when focusing felt almost impossible.",
            "These problems do not always happen because the work is too hard.",
            "When the brain spends less energy deciding what to do next, it has more energy for reading, thinking, and problem solving.",
            "A student who sleeps too little may feel foggy, impatient, or more likely to make careless mistakes."
          ],
          correctIndex: 2
        },
        standards: ["7.T.T.2.a", "7.T.T.3.a", "7.T.C.2.b"],
        skills: ["claim", "text-evidence", "argument-structure", "two-part", "passage-1"]
      },
      {
        id: 14,
        type: "partAB",
        linkedPassage: 2,
        stem: "Answer Part A and Part B based on Passage 2.",
        partA: {
          stem: "Which inference about Maya is best supported by the passage?",
          options: [
            "Maya gains confidence because the routine helps her prevent some problems before the school day begins.",
            "Maya becomes successful because Luis takes control of her school responsibilities.",
            "Maya learns that her focus problems were caused only by the noise in her classroom.",
            "Maya improves because she stops making mistakes on every assignment by the end of the week."
          ],
          correctIndex: 0
        },
        partB: {
          stem: "Which sentence best supports the answer to Part A?",
          options: [
            "The plan felt almost too simple, but Maya tried it for the rest of the week.",
            "The room had not changed, but Maya felt more prepared to handle it.",
            "After school, Maya’s older brother Luis noticed her dropping books on the kitchen table.",
            "Maya had missed one question, but she had finished the assignment on time."
          ],
          correctIndex: 1
        },
        standards: ["7.T.T.1.a", "7.T.T.1.c", "7.P.EICC.3.f"],
        skills: ["inference", "text-evidence", "characterization", "two-part", "passage-2"]
      },
      {
        id: 15,
        type: "classify",
        linkedPassage: null,
        stem: "Sort each idea based on whether it is presented as a habit that may support focus or a habit/problem that may interfere with focus.",
        instructions: "Drag each idea to the correct column.",
        categories: [
          { id: "helps", label: "May Support Focus" },
          { id: "hurts", label: "May Interfere With Focus" }
        ],
        items: [
          { id: "c1", text: "Keeping a regular bedtime so the brain knows when to rest", categoryId: "helps" },
          { id: "c2", text: "Watching short videos until bedtime even after planning to stop", categoryId: "hurts" },
          { id: "c3", text: "Turning off notifications during homework time", categoryId: "helps" },
          { id: "c4", text: "Starting the morning unsure where important materials are", categoryId: "hurts" },
          { id: "c5", text: "Putting school materials in a backpack before bed", categoryId: "helps" }
        ],
        standards: ["7.T.C.1.b", "7.P.EICC.3", "7.P.EICC.3.c"],
        skills: ["classify", "cause-effect", "synthesize"]
      },
      {
        id: 16,
        type: "mcq",
        linkedPassage: 1,
        stem: "Why is the table in Passage 1 useful for developing the author’s explanation?",
        instructions: "Choose the best answer.",
        options: [
          "It turns the author’s ideas into examples, helping readers connect specific habits with possible effects on focus.",
          "It proves that each habit will affect every student in exactly the same way.",
          "It adds a personal story so readers can understand how one student changed her routine.",
          "It introduces new evidence that disagrees with the information in the paragraphs."
        ],
        correctIndex: 0,
        standards: ["7.T.C.1.b", "7.T.T.2.a", "7.T.SS.1.a"],
        skills: ["text-features", "purpose-audience", "expository-techniques", "passage-1", "mcq"]
      },
      {
        id: 17,
        type: "mcq",
        linkedPassage: 2,
        stem: "Which explanation best analyzes the tone of the last paragraph of Passage 2?",
        instructions: "Choose the best answer.",
        options: [
          "The tone is hopeless because Maya admits that her plan did not fix everything.",
          "The tone is realistic and encouraging because Maya recognizes progress without pretending the routine is a perfect solution.",
          "The tone is humorous because Maya laughs at Luis and refuses to take the routine seriously.",
          "The tone is frustrated because Maya misses one question and decides the plan was not worth following."
        ],
        correctIndex: 1,
        standards: ["7.T.SS.2.a", "7.T.T.1.c"],
        skills: ["tone", "inference", "theme-development", "passage-2", "mcq"]
      },
      {
        id: 18,
        type: "mcq",
        linkedPassage: 1,
        stem: "Which statement from Passage 1 is the strongest example of a fact used to support the author’s explanation?",
        instructions: "Choose the best answer.",
        options: [
          "Better focus does not require a perfect schedule.",
          "Small changes can help.",
          "A routine is a pattern of actions that happens in a regular order.",
          "Schoolwork can feel more manageable."
        ],
        correctIndex: 2,
        standards: ["7.T.T.2.a", "7.T.C.2.b"],
        skills: ["fact-opinion", "details", "critical-thinking", "passage-1", "mcq"]
      },
      {
        id: 19,
        type: "match",
        linkedPassage: 2,
        stem: "Match each event in Passage 2 with the conclusion a reader can draw from it.",
        instructions: "Match the items correctly.",
        left: [
          { id: "m1", text: "Maya watches videos late at night after planning to watch only two." },
          { id: "m2", text: "Maya puts her tablet on the charger in the hallway." },
          { id: "m3", text: "Maya packs her folder before bed." }
        ],
        right: [
          { id: "r1", text: "She is using a routine to reduce morning stress." },
          { id: "r2", text: "She has trouble stopping once the next video begins." },
          { id: "r3", text: "She changes her environment to make the better choice easier." }
        ],
        pairs: { m1: "r2", m2: "r3", m3: "r1" },
        standards: ["7.T.T.1.a", "7.P.EICC.3.c", "7.P.EICC.3.f"],
        skills: ["cause-effect", "inference", "matching", "passage-2"]
      },
            {
        id: 20,
        type: "mcq",
        questionLabel: "Podcast",
        linkedPassage: null,
        media: {
          type: "audio",
          src: "../media/How_screens_ruin_your_focus_and_sleep.m4a",
          captions: "../media/How_screens_ruin_your_focus_and_sleep.vtt",
          label: "Podcast: How Screens Ruin Your Focus and Sleep"
        },
        stem: "Which claim from the podcast is best supported by the way the speaker connects screen habits to both sleep and focus?",
        instructions: "Listen to the podcast. Choose the best answer.",
        options: [
          "Screens only matter when students use them during class, not before bed or homework.",
          "Screen habits can weaken focus because they interrupt work and make winding down harder.",
          "Switching among videos, messages, and assignments trains the brain to focus for longer.",
          "Sleep problems are mainly caused by school start times, so screen routines have little effect."
        ],
        correctIndex: 1,
        standards: ["7.P.EICC.3", "7.T.C.1.b", "7.T.C.2.b"],
        skills: ["multimedia-analysis", "cause-effect", "inference", "critical-thinking", "podcast", "dok3"]
      },
      {
        id: 21,
        type: "multi",
        questionLabel: "Podcast",
        linkedPassage: null,
        media: {
          type: "audio",
          src: "../media/How_screens_ruin_your_focus_and_sleep.m4a",
          captions: "../media/How_screens_ruin_your_focus_and_sleep.vtt",
          label: "Podcast: How Screens Ruin Your Focus and Sleep"
        },
        stem: "Which TWO ideas from the podcast would best support a recommendation to keep a phone away during homework and bedtime?",
        instructions: "Listen to the podcast. Select exactly 2 answers.",
        options: [
          "A nearby phone can pull attention away from a task even when the student planned to focus.",
          "Students should use screens for every assignment because digital tools always improve learning.",
          "The brain can instantly return to deep focus after every notification or short video.",
          "Screen routines before bed can make it harder for the brain to settle into sleep.",
          "The best solution is for students to avoid all technology in every part of school."
        ],
        correctIndices: [0, 3],
        minSelections: 2,
        maxSelections: 2,
        standards: ["7.P.EICC.3.c", "7.P.EICC.3.g", "7.T.C.1.b"],
        skills: ["multimedia-analysis", "text-evidence", "evaluate-claim", "podcast", "multi-select", "dok3"]
      },
      {
        id: 22,
        type: "partAB",
        questionLabel: "Podcast",
        linkedPassage: null,
        media: {
          type: "audio",
          src: "../media/How_screens_ruin_your_focus_and_sleep.m4a",
          captions: "../media/How_screens_ruin_your_focus_and_sleep.vtt",
          label: "Podcast: How Screens Ruin Your Focus and Sleep"
        },
        stem: "Answer Part A and Part B using the podcast.",
        instructions: "Listen carefully, then connect the speaker’s claim to supporting reasoning.",
        partA: {
          stem: "What is the speaker’s most reasonable purpose?",
          options: [
            "To entertain listeners with a story about one student who dislikes homework",
            "To explain why small screen-habit changes can protect attention and sleep",
            "To prove that every screen activity damages students in the same way",
            "To argue that routines matter less than natural ability when students focus"
          ],
          correctIndex: 1
        },
        partB: {
          stem: "Which reasoning best supports the answer to Part A?",
          options: [
            "The speaker links screen use to both interruptions during work and trouble winding down at night.",
            "The speaker focuses on grades only and avoids explaining what happens before school starts.",
            "The speaker says that one routine will solve every focus problem for every student.",
            "The speaker claims that students can multitask well if they practice switching quickly."
          ],
          correctIndex: 0
        },
        standards: ["7.P.EICC.3.d", "7.T.C.2.b", "7.T.SS.2.a"],
        skills: ["author-purpose", "multimedia-analysis", "claim", "reasoning", "podcast", "two-part", "dok3"]
      },
      {
        id: 23,
        type: "mcq",
        questionLabel: "Video",
        linkedPassage: null,
        media: {
          type: "video",
          src: "../media/How_Screens_Recalibrate_Your_Brain_s_Effort.mp4",
          label: "Video: How Screens Recalibrate Your Brain’s Effort"
        },
        stem: "How does the video’s scale image help develop the idea that screens can change how effort feels?",
        instructions: "Watch the video. Choose the best answer.",
        options: [
          "It shows that school tasks become impossible once a student has watched short videos.",
          "It suggests the brain may start comparing slower tasks to faster rewards from screens.",
          "It proves that entertainment is always more valuable than reading, homework, or sleep.",
          "It shows that students can restore focus only by removing every difficult task."
        ],
        correctIndex: 1,
        standards: ["7.T.C.1.b", "7.T.SS.2.a", "7.P.EICC.3.c"],
        skills: ["visual-analysis", "multimedia-analysis", "inference", "video", "dok3"]
      },
      {
        id: 24,
        type: "multi",
        questionLabel: "Video",
        linkedPassage: null,
        media: {
          type: "video",
          src: "../media/How_Screens_Recalibrate_Your_Brain_s_Effort.mp4",
          label: "Video: How Screens Recalibrate Your Brain’s Effort"
        },
        stem: "Which TWO conclusions are best supported by the video’s explanation of quick rewards and effort?",
        instructions: "Watch the video. Select exactly 2 answers.",
        options: [
          "A task that takes patience may feel less appealing after repeated quick rewards.",
          "The video argues that students should replace all homework with shorter videos.",
          "The video suggests the brain can begin choosing the easiest reward path first.",
          "The video claims that difficult reading has no value if it takes more effort.",
          "The video shows that focus depends only on whether a student likes the topic."
        ],
        correctIndices: [0, 2],
        minSelections: 2,
        maxSelections: 2,
        standards: ["7.P.EICC.3", "7.T.C.2.b", "7.T.SS.2.a"],
        skills: ["visual-analysis", "multimedia-analysis", "synthesize", "video", "multi-select", "dok3"]
      },
      {
        id: 25,
        type: "partAB",
        questionLabel: "Video",
        linkedPassage: null,
        media: {
          type: "video",
          src: "../media/How_Screens_Recalibrate_Your_Brain_s_Effort.mp4",
          label: "Video: How Screens Recalibrate Your Brain’s Effort"
        },
        stem: "Answer Part A and Part B using the video and the two passages.",
        instructions: "Synthesize the multimedia source with the reading passages.",
        partA: {
          stem: "Which recommendation is best supported across the video and the passages?",
          options: [
            "Students should avoid every screen, even when screens are required for schoolwork.",
            "Students can protect focus by building routines that reduce quick distractions before work or sleep.",
            "Students should wait for adults to organize materials and control all device use.",
            "Students can improve focus only by choosing easier assignments and shorter readings."
          ],
          correctIndex: 1
        },
        partB: {
          stem: "Which evidence best supports the answer to Part A?",
          options: [
            "The video explains quick rewards; the passages show routines that reduce decisions and distractions.",
            "The video says effort has no value; Passage 2 shows Maya succeeds by avoiding all technology.",
            "The video focuses on entertainment; Passage 1 claims sleep matters less than organization.",
            "The video shows a student reading; Passage 2 shows Maya’s teacher changing the classroom."
          ],
          correctIndex: 0
        },
        standards: ["7.P.EICC.3", "7.T.T.2.b", "7.T.C.2.b"],
        skills: ["synthesize", "compare-sources", "multimedia-analysis", "text-evidence", "video", "two-part", "dok3"]
      }
    ];

    return questions;
  })(),

  questionSets: {
    full: null,
    mini1: [1, 3, 5, 7, 10, 11, 13, 16, 20, 23],
    mini2: [2, 4, 6, 8, 9, 12, 14, 17, 22, 25]
  }
};