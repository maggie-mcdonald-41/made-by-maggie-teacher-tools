// levels/on-level.js
// On-grade-level content bundle: passages + questions + sets

window.READING_LEVEL = {
  id: "on",
  label: "On Grade Level",

  passages: {
    1: {
      title: "Later Start Times Improve Student Health",
      html: `
        <h2 class="passage-title">Later Start Times Improve Student Health</h2>

        <p><span class="para-num">1</span>
          Should schools do more to help students stay healthy and focused? Many educators and researchers argue that one effective solution is starting school later in the morning. Research shows that students who get more sleep perform better in class, feel happier, and make healthier choices throughout the day. A later start time would benefit everyone.
        </p>

        <p><span class="para-num">2</span>
          First of all, students need more sleep than they are currently getting. According to the American Academy of Pediatrics, middle-school students need between 9 and 12 hours of sleep per night, but most get far less. When school starts at 7:30 a.m., many students wake up between 5:30 and 6:00 a.m. This early schedule makes it almost impossible to get enough rest. Schools that pushed their start time to 8:30 a.m. reported an increase in average student sleep by nearly one hour.
        </p>

        <p><span class="para-num">3</span>
          In addition, students who sleep more are healthier. The National Sleep Foundation conducted a study in 2019 comparing schools with 7:30 a.m. start times to schools with 8:30 a.m. start times. The study found that students at later-start schools had fewer headaches, fewer nurse visits, and reported higher energy levels. The percentage of students who reported feeling “very tired” during the school day dropped from 56% to 31%.
        </p>

        <figure class="graph-placeholder">
          <img src="../media/placeholder-start-time-graph.png"
               alt="Bar graph comparing percentage of students reporting daytime tiredness: 56% at 7:30 a.m. start, 31% at 8:30 a.m. start.">
          <figcaption>
            Bar graph comparing the percentage of students who report feeling very tired at different school start times.
          </figcaption>
        </figure>

        <p><span class="para-num">4</span>
          Another benefit of starting school later is improved attendance. When students are extremely tired, they are more likely to oversleep or miss school altogether. One district in Colorado saw chronic absenteeism drop by 12% after pushing back its start time. Better attendance means better learning, stronger grades, and more classroom participation.
        </p>

        <p><span class="para-num">5</span>
          Furthermore, later start times lead to safer travel in the mornings. Students who bike or walk to school in the dark are more at risk for accidents. When school begins later, it is brighter outside and visibility improves. Researchers at the University of Minnesota found that communities with later school start times saw a 16% decrease in morning car accidents involving teen drivers.
        </p>

        <p><span class="para-num">6</span>
          For all these reasons, many education experts support shifting school start times to 8:30 a.m. Students who get enough sleep are more likely to learn effectively, feel healthier, and stay safer. A later start time is a simple change that could make a big difference.
        </p>
      `
    },

    2: {
      title: "Earlier Start Times Support Family and Community Needs",
      html: `
        <h2 class="passage-title">Earlier Start Times Support Family and Community Needs</h2>

        <p><span class="para-num">1</span>
          Should schools consider keeping their current start times? Some families and educators believe starting school earlier in the morning is better for families, teachers, and the community. While some people argue for pushing the start time later, earlier start times offer important benefits that help students stay organized, manage responsibilities, and stay connected to family schedules.
        </p>

        <p><span class="para-num">2</span>
          To begin with, an earlier start time helps families plan their mornings. Many parents begin work between 7:00 and 8:00 a.m., so dropping off children earlier allows families to stay on the same routine. When school start times shift to 8:30 a.m., parents often struggle to find extra childcare or rearrange their jobs. A 2022 survey from the National Family Planning Council reported that 48% of parents said a later school start would make their work schedule “significantly harder to manage,” while only 23% said it would help.
        </p>

        <p><span class="para-num">3</span>
          Earlier start times also support important after-school activities. Students who participate in sports, band, robotics, or tutoring need enough time in the afternoon to finish practices and still complete homework. In districts that moved the start time to 8:30 a.m., practices often ran later into the evening, leaving students with less free time and later bedtimes. Many students reported feeling more rushed after school instead of less.
        </p>

        <figure class="graph-placeholder">
          <img src="../media/placeholder-activity-bargraph.png"
               alt="Bar graph comparing after-school activity participation before and after later start times: 71% participation at 7:30 a.m. start vs. 54% at 8:30 a.m. start.">
          <figcaption>
            Bar graph comparing after-school activity participation:
            <strong>71% participation</strong> at a 7:30 a.m. start vs. <strong>54% participation</strong> at an 8:30 a.m. start.
          </figcaption>
        </figure>

        <p><span class="para-num">4</span>
          In addition, earlier start times give students more exposure to real-world routines. Most adult jobs begin in the early morning. Learning to wake up, prepare, and arrive on time helps students build responsibility and strong time-management skills. One high school in Ohio found that when administrators experimented with a later start, tardiness increased by 18% because students felt they had “more time” and used it poorly.
        </p>

        <p><span class="para-num">5</span>
          Another concern with later start times is transportation. Bus routes often serve multiple schools, so shifting one start time affects all others. Districts that changed to a later start reported longer bus rides, heavier traffic, and higher transportation costs. In some cases, younger elementary students were forced to begin even earlier to make the schedule work.
        </p>

        <p><span class="para-num">6</span>
          For all these reasons, some community members believe schools should keep earlier start times. Earlier schedules support working families, protect after-school activities, and help students build lifelong habits. While sleep is important, earlier start times offer a balanced routine that works well for the entire community.
        </p>
      `
    }
  },

  // Move your questions array here EXACTLY as-is
  questions: (function () {
  // Types: 'mcq', 'multi', 'order', 'match', 'highlight', 'dropdown', 'classify', 'partAB', 'revise'
    let questions = [
    // 1. MCQ – Main claim, Passage 1
    {
        id: 1,
        type: "mcq",
        linkedPassage: 1,
        stem: "What is the main claim the author makes in Passage 1?",
        instructions: "Select the best answer from the choices below.",
        options: [
        "The school day should start later so students can be healthier and more focused.",
        "Students should visit the nurse less often during the school day.",
        "Walking or biking to school is too dangerous for most students.",
        "Schools should give students more homework so they learn responsibility."
        ],
        correctIndex: 0,
        skills: [
        "claim",
        "central-idea",
        "passage-1",
        "mcq"
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
        "Students should quit after-school activities so they have more time for sleep.",
        "Bus rides are the most important part of a student’s school experience.",
        "Earlier school start times are better because they fit family schedules, activities, and transportation needs."
        ],
        correctIndex: 3,
        skills: [
        "central-idea",
        "summarizing",
        "passage-2",
        "mcq"
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
        correctIndices: [0, 1],
        minSelections: 2,
        maxSelections: 3,
        skills: [
        "text-evidence",
        "details",
        "health-safety",
        "multi-select"
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
        correctIndices: [0, 1, 3],
        minSelections: 2,
        maxSelections: 4,
        skills: [
        "text-evidence",
        "details",
        "problem-solution",
        "multi-select"
        ]
    },

    // 5. Chronological Order – Flow of ideas, Passage 1
    {
        id: 5,
        type: "order",
        linkedPassage: 1,
        stem: "Put these ideas from Passage 1 in the order they appear in the text.",
        instructions: "Drag and drop the ideas so they appear from first to last.",
        items: [
        { id: "e2", text: "The author describes a study showing students at later-start schools are healthier and less tired." },
        { id: "e4", text: "The author explains that later start times lead to safer travel for students in the morning." },
        { id: "e1", text: "The author explains how much sleep middle-school students need and how early schedules make this difficult." },
        { id: "e3", text: "The author gives an example of a district where attendance improved after starting school later." }
        ],
        correctOrder: ["e1", "e2", "e3", "e4"],
        skills: [
        "chronological-order",
        "text-structure",
        "passage-1",
        "drag-drop"
        ]
    },

    // 6. Chronological Order – Flow of ideas, Passage 2
    {
        id: 6,
        type: "order",
        linkedPassage: 2,
        stem: "Sequence the ideas from Passage 2 in the order they are presented.",
        instructions: "Drag and drop the ideas so they are in the correct sequence.",
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
        "drag-drop"
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
        "argument-structure",
        "claim",
        "reason",
        "text-evidence",
        "matching"
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
        "matching"
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
            text: "The percentage of students who reported feeling \"very tired\" during the school day dropped from 56% to 31%.",
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
        "highlight"
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
            text: "Should schools consider keeping their current start times?",
            correct: true
        },
        {
            id: "k2",
            text: "Some families and educators believe starting school earlier in the morning is better for families, teachers, and the community.",
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
        "highlight"
        ]
    },

    // 11. Dropdown – Author meaning, Passage 1
    {
        id: 11,
        type: "dropdown",
        linkedPassage: 1,
        stem: "Select the option that best completes the sentence so it matches the author’s meaning in Passage 1.",
        sentenceParts: [
        "The passage explains that changing the school start time would ",
        " student health and safety."
        ],
        options: ["not affect", "slightly change", "improve"],
        correctIndex: 2,
        skills: [
        "author-meaning",
        "precision-language",
        "dropdown"
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
        "author-opinion",
        "precision-language",
        "dropdown"
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
            text: "The percentage of students who reported feeling \"very tired\" dropped from 56% to 31%.",
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
        "classify",
        "table-sorting"
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
        "classify",
        "table-sorting"
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
            "\"When school starts at 7:30 a.m., many students wake up between 5:30 and 6:00 a.m.\"",
            "\"The percentage of students who reported feeling 'very tired' during the school day dropped from 56% to 31%.\"",
            "\"One district in Colorado saw chronic absenteeism drop by 12% after pushing back its start time.\"",
            "\"Researchers at the University of Minnesota found that communities with later school start times saw a 16% decrease in morning car accidents involving teen drivers.\""
        ],
        correctIndex: 3
        },
        skills: [
        "claim",
        "text-evidence",
        "argument-structure",
        "two-part"
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
            "\"Many parents begin work between 7:00 and 8:00 a.m., so dropping off children earlier allows families to stay on the same routine.\"",
            "\"Practices often ran later into the evening, leaving students with less free time.\"",
            "\"Bus routes became longer and traffic heavier when districts changed to a later school start time.\"",
            "\"In some cases, younger elementary students were forced to begin even earlier to make the schedule work.\""
        ],
        correctIndex: 0
        },
        skills: [
        "reason",
        "text-evidence",
        "argument-structure",
        "two-part"
        ]
    },

    // 17. Classification – Which passage? (Claims)
    {
        id: 17,
        type: "classify",
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
        "classify",
        "table-sorting"
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
            text: "Reports that the percentage of students who felt \"very tired\" dropped from 56% to 31%.",
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
        "classify",
        "table-sorting"
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
        "revise"
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
        "often a good fit",
        "sort of okay",
        "the best possible choice in every situation"
        ],
        correctIndex: 0,
        skills: [
        "revise-sentence",
        "author-opinion",
        "precision-language",
        "tone",
        "revise"
        ]
    },

    // 21. MCQ – Audio debate, counterargument (Passages 1 & 2 + audio)
    {
        id: 21,
        type: "mcq",
        linkedPassage: null,
        media: {
        type: "audio",
        src: "../media/reading-lesson-1.mp4",
        captions: "../media/later-start-times-debate.vtt",
        label: "Audio Debate: Later School Start Times"
        },
        stem: "Use Passages 1 and 2 and the audio debate. How does the second speaker counter the argument that later school start times must be a \"non-negotiable priority\" for safety?",
        instructions: "Listen to the debate, then choose the best answer.",
        options: [
        "By insisting that transportation budgets always decrease when start times are changed.",
        "By arguing that later start times have no real effect on teen sleep.",
        "By pointing out that later start times create serious problems for families and after-school activities.",
        "By claiming that earlier start times improve students’ health more than sleep does."
        ],
        correctIndex: 2,
        skills: [
        "listening-comprehension",
        "evaluate-argument",
        "counterclaim",
        "compare-passages",
        "audio-media",
        "mcq"
        ]
    },

    // 22. MCQ – Audio debate, main disagreement (Passages 1 & 2 + audio)
    {
        id: 22,
        type: "mcq",
        linkedPassage: null,
        media: {
        type: "audio",
        src: "../media/reading-lesson-1.mp4",
        captions: "../media/later-start-times-debate.vtt",
        label: "Audio Debate: Later School Start Times"
        },
        stem: "Based on the audio debate, what is the main disagreement between the two speakers?",
        instructions: "Use information from both passages and the audio debate to choose the best answer.",
        options: [
        "Whether students need more sleep than adults.",
        "Whether after-school activities are more important than academic learning.",
        "Whether schools should eliminate extracurricular activities to reduce stress.",
        "Whether the health and safety benefits of later start times outweigh the scheduling problems they create for families and communities."
        ],
        correctIndex: 3,
        skills: [
        "central-idea",
        "compare-passages",
        "evaluate-argument",
        "listening-comprehension",
        "audio-media",
        "mcq"
        ]
    },

    // 23. MCQ – Graph + audio
    {
        id: 23,
        type: "mcq",
        linkedPassage: 1,
        media: {
        type: "audio",
        src: "../media/reading-lesson-1.mp4",
        captions: "../media/later-start-times-debate.vtt",
        label: "Audio Debate: Later School Start Times"
        },
        stem: "How does the graph in Passage 1 most clearly support a claim made by Speaker 1 in the audio debate?",
        instructions: "Use the graph and the audio to answer the question.",
        options: [
        "The graph shows that later start times sharply reduce the percentage of students who feel very tired, supporting Speaker 1’s argument about improved health and alertness.",
        "The graph proves that students at all schools sleep the same amount of time.",
        "The graph shows that after-school participation decreases when school starts later.",
        "The graph reveals that transportation costs always increase when start times change."
        ],
        correctIndex: 0,
        skills: [
        "graph-analysis",
        "text-evidence",
        "evaluate-argument",
        "synthesis",
        "audio-media",
        "mcq"
        ]
    },

    // 24. MCQ – Video debate, inference
    {
        id: 24,
        type: "mcq",
        linkedPassage: null,
        media: {
        type: "video",
        src: "../media/video-clip.mp4",
        captions: "../media/video-clip-captions.vtt",
        label: "Video Report: The School Start Time Debate"
        },
        stem: "Based on the video, which inference can the viewer make about why communities struggle to agree on school start times?",
        instructions: "Watch the video, then choose the answer that is supported by evidence but not directly stated.",
        options: [
        "Most communities prefer to change start times every few years to test new schedules.",
        "Students generally agree that earlier start times are the best way to prepare for future careers.",
        "The majority of parents believe that later start times will automatically fix every problem schools face.",
        "Both sides have valid concerns, so any decision will create a trade-off that affects different groups in different ways."
        ],
        correctIndex: 3,
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

    // 25. MCQ – Video + passages, synthesis
    {
        id: 25,
        type: "mcq",
        linkedPassage: null,
        media: {
        type: "video",
        src: "../media/video-clip.mp4",
        captions: "../media/video-clip-captions.vtt",
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
    return questions;
  })(),

  // Move your sets here EXACTLY as-is
  questionSets: {
    full: null,
    mini1: [3, 6, 7, 10, 11, 16, 17, 20, 22, 24],
    mini2: [4, 8, 9, 12, 14, 18, 19, 21, 23, 25],
    //to not break old sets
    mini: [3, 6, 7, 10, 11, 16, 17, 20, 22, 24]

    
  }
};
