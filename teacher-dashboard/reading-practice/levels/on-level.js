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
        <p class="passage-lexile"><em>Estimated Lexile Level: 940L–1010L</em></p>

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
        <p class="passage-lexile"><em>Estimated Lexile Level: 980L–1050L</em></p>
        
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
      stem: "Which option best states Passage 1’s main claim AND reflects how the author supports it across the passage?",
      instructions: "Select the best answer from the choices below.",
      options: [
        "Schools should move start times later because research-based evidence links additional sleep to improved learning, health, attendance, and safety.",
        "Schools should move start times later mainly because teens dislike waking up early and feel happier when mornings are easier.",
        "Schools should keep start times the same because transportation schedules are too complicated to change without major problems.",
        "Schools should focus on after-school programs instead of start times because activities are the strongest predictor of student success."
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
  stem: "Which statement best captures Passage 2’s central idea without overstating or oversimplifying the author’s position?",
  instructions: "Choose the answer that best summarizes the author’s main point.",
  options: [
    "Earlier start times are the only fair option because later starts always harm student achievement and family routines.",
    "Earlier start times better support community logistics and responsibilities, and the author argues the trade-offs of later starts can outweigh the benefits.",
    "Later start times improve student health so much that families should adjust their schedules no matter the cost.",
    "Transportation concerns are the single most important reason schools should keep earlier start times."
  ],
  correctIndex: 1,
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
        stem: "Which details from Passage 1 function as evidence (not just explanation) that later start times improve student health or safety?",
        instructions: "Select all answers that apply. There may be more than one correct answer.",
        options: [
            "The National Sleep Foundation study found students at later-start schools had fewer headaches, fewer nurse visits, and higher energy levels.",
            "Researchers at the University of Minnesota found communities with later school start times saw a 16% decrease in morning car accidents involving teen drivers.",
            "Schools that pushed their start time to 8:30 a.m. reported an increase in average student sleep by nearly one hour.",
            "When school starts at 7:30 a.m., many students wake up between 5:30 and 6:00 a.m., making it hard to get enough rest."
        ],
        correctIndices: [0, 1, 2],
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
        stem: "Which details from Passage 2 most directly support the author’s argument that later start times can create community-wide problems?",
        instructions: "Select all answers that apply.",
        options: [
            "A 2022 survey reported that 48% of parents said a later school start would make their work schedule significantly harder to manage.",
            "After districts moved the start time later, practices and rehearsals often ran later into the evening.",
            "One high school in Ohio found that tardiness increased by 18% when administrators experimented with a later start.",
            "Districts that changed to a later start reported longer bus rides, heavier traffic, and higher transportation costs.",
            "Middle-school students need between 9 and 12 hours of sleep per night."
        ],
        correctIndices: [0, 1, 2, 3],
        minSelections: 3,
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
        stem: "Put these ideas from Passage 1 in the order they appear based on how the author builds the argument from problem to outcomes.",
        instructions: "Drag and drop the ideas so they appear from first to last.",
        items: [
            { id: "e2", text: "The author presents research showing that students at later-start schools report better health and less tiredness." },
            { id: "e4", text: "The author explains that later start times can improve morning safety by reducing accident risk." },
            { id: "e1", text: "The author explains how middle-school students need more sleep and how early start times make adequate rest difficult." },
            { id: "e3", text: "The author uses an attendance example to show how increased sleep can improve school participation." }
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
        stem: "Sequence the ideas from Passage 2 based on how the author expands the argument from family routines to broader community systems.",
        instructions: "Drag and drop the ideas so they are in the correct sequence.",
        items: [
            { id: "s3", text: "The author argues that earlier start times help students build responsibility and time-management habits aligned with adult work routines." },
            { id: "s1", text: "The author explains how earlier start times fit many parents’ work schedules and reduce childcare complications." },
            { id: "s4", text: "The author describes transportation ripple effects, including bus routes, traffic, and costs, when start times shift later." },
            { id: "s2", text: "The author explains that later dismissal can push after-school activities later and increase time pressure for students." }
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
        stem: "Match each part of Passage 1’s argument with the description that best explains how the author uses it in the text.",
        instructions: "Drag the descriptions into the boxes to match the argument parts.",
        left: [
            { id: "m1", text: "Claim" },
            { id: "m2", text: "Reason" },
            { id: "m3", text: "Evidence" }
        ],
        right: [
            { id: "r1", text: "The author’s overall position about what schools should do regarding start times." },
            { id: "r2", text: "An explanation that connects increased sleep to improved learning, health, attendance, or safety." },
            { id: "r3", text: "Specific studies, statistics, or real examples used to prove the author’s reasoning is valid." }
        ],
        pairs: {
            m1: "r1",
            m2: "r2",
            m3: "r3"
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
        stem: "Match each category from Passage 2 with the description that best explains how the author supports that part of the argument.",
        instructions: "Drag the descriptions into the boxes to match the ideas.",
        left: [
            { id: "f1", text: "Family impact" },
            { id: "f2", text: "After-school activities" },
            { id: "f3", text: "Transportation systems" }
        ],
        right: [
            { id: "g1", text: "Uses survey data and examples of work schedules and childcare complications to show how later starts strain household routines." },
            { id: "g2", text: "Explains that later dismissal shifts practices, tutoring, and rehearsals later into the evening, increasing time pressure for students." },
            { id: "g3", text: "Describes ripple effects across bus routes, traffic flow, costs, and even start times at other grade levels." }
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
        stem: "Which sentences from Passage 1 most directly provide measurable evidence that later start times reduce student tiredness?",
        instructions: "Highlight all sentences that clearly show data or research specifically about reduced tiredness. You may select more than one.",
        sentences: [
            {
            id: "h1",
            text: "Research shows that students who get more sleep perform better in class, feel happier, and make healthier choices throughout the day.",
            correct: false
            },
            {
            id: "h2",
            text: "Schools that pushed their start time to 8:30 a.m. reported an increase in average student sleep by nearly one hour.",
            correct: false
            },
            {
            id: "h3",
            text: "The study found that students at later-start schools had fewer headaches, fewer nurse visits, and reported higher energy levels.",
            correct: true
            },
            {
            id: "h4",
            text: "The percentage of students who reported feeling \"very tired\" during the school day dropped from 56% to 31%.",
            correct: true
            },
            {
            id: "h5",
            text: "A later start time is a simple change that could make a big difference.",
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
        stem: "Which sentences from Passage 2 communicate the author’s stance through evaluative or persuasive language rather than neutral reporting?",
        instructions: "Highlight all sentences that reveal the author’s position. You may select more than one.",
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
            text: "Earlier start times offer important benefits that help students stay organized, manage responsibilities, and stay connected to family schedules.",
            correct: true
            },
            {
            id: "k4",
            text: "A 2022 survey from the National Family Planning Council reported that 48% of parents said a later school start would make their work schedule “significantly harder to manage,” while only 23% said it would help.",
            correct: false
            },
            {
            id: "k5",
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
        stem: "Select the option that best completes the sentence so it accurately reflects the author’s cause-and-effect reasoning in Passage 1.",
        sentenceParts: [
            "The author argues that moving the school start time later could ",
            " student health and safety by increasing sleep and reducing morning risks."
        ],
        options: [
            "eliminate risks to",
            "have little impact on",
            "guarantee improvements in",
            "significantly improve"
        ],
        correctIndex: 3,
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
        stem: "Choose the phrase that best reflects the author’s overall stance in Passage 2 without exaggerating the claim.",
        sentenceParts: [
            "Overall, the author suggests that earlier start times are ",
            " for families and the community."
        ],
        options: [
            "the only acceptable solution",
            "often a better fit",
            "never worth reconsidering",
            "slightly helpful but not important"
        ],
        correctIndex: 1,
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
        stem: "Sort each detail into the category it most directly supports in Passage 1’s argument. Some details may relate to more than one idea, so choose the strongest match.",
        instructions: "Drag each detail into the correct column.",
        categories: [
            { id: "health", label: "Health & Tiredness" },
            { id: "attendance", label: "Attendance & Participation" }
        ],
        items: [
            {
            id: "c1",
            text: "Students at later-start schools had fewer headaches, fewer nurse visits, and reported higher energy levels.",
            categoryId: "health"
            },
            {
            id: "c2",
            text: "The percentage of students who reported feeling \"very tired\" dropped from 56% to 31%.",
            categoryId: "health"
            },
            {
            id: "c3",
            text: "One district in Colorado saw chronic absenteeism drop by 12% after pushing back its start time.",
            categoryId: "attendance"
            },
            {
            id: "c4",
            text: "Better attendance means better learning, stronger grades, and more classroom participation.",
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
        stem: "Sort each detail into the category it most directly supports in Passage 2’s argument. Consider who is primarily affected by the issue described.",
        instructions: "Drag each detail into the correct column.",
        categories: [
            { id: "family", label: "Family Schedules" },
            { id: "activities", label: "After-School Activities" }
        ],
        items: [
            {
            id: "c5",
            text: "Many parents begin work between 7:00 and 8:00 a.m., so dropping off children earlier allows families to stay on the same routine.",
            categoryId: "family"
            },
            {
            id: "c6",
            text: "Parents often struggle to find extra childcare or rearrange their jobs when school start times shift later.",
            categoryId: "family"
            },
            {
            id: "c7",
            text: "Practices and rehearsals often ran later into the evening, leaving students with less free time and later bedtimes.",
            categoryId: "activities"
            },
            {
            id: "c8",
            text: "Many students reported feeling more rushed after school instead of less.",
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
            stem: "Which statement best expresses the author’s full claim in Passage 1?",
            options: [
            "Students should start school later mainly to avoid walking or biking in the dark.",
            "Schools should move start times later because doing so can improve student health, learning readiness, attendance, and safety.",
            "Students should be allowed to decide their own start times based on personal preference.",
            "Early start times are the only reason students struggle in school."
            ],
            correctIndex: 1
        },
        partB: {
            label: "Part B",
            stem: "Which piece of evidence from Passage 1 provides the strongest overall support for the claim in Part A?",
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
            stem: "Which reason is most central to the author’s argument for keeping earlier start times in Passage 2?",
            options: [
            "Earlier start times eliminate transportation challenges entirely.",
            "Earlier start times better coordinate with family routines and community schedules.",
            "Earlier start times guarantee that students will complete more homework.",
            "Earlier start times allow students to sleep longer."
            ],
            correctIndex: 1
        },
        partB: {
            label: "Part B",
            stem: "Which sentence from Passage 2 most directly supports the central reason identified in Part A?",
            options: [
            "\"Many parents begin work between 7:00 and 8:00 a.m., so dropping off children earlier allows families to stay on the same routine.\"",
            "\"Practices often ran later into the evening, leaving students with less free time.\"",
            "\"One high school in Ohio found that when administrators experimented with a later start, tardiness increased by 18%.\"",
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
        stem: "Sort each statement into the passage whose overall argument and emphasis it most closely reflects.",
        instructions: "Drag each statement into the correct column. Consider how each author frames the issue.",
        categories: [
            { id: "p1", label: "Passage 1" },
            { id: "p2", label: "Passage 2" }
        ],
        items: [
            {
            id: "cp1",
            text: "Frames later start times as a research-supported reform that improves measurable student outcomes.",
            categoryId: "p1"
            },
            {
            id: "cp2",
            text: "Emphasizes how schedule changes can create ripple effects that disrupt families and community systems.",
            categoryId: "p2"
            },
            {
            id: "cp3",
            text: "Builds its argument primarily around health, safety, and attendance improvements.",
            categoryId: "p1"
            },
            {
            id: "cp4",
            text: "Highlights trade-offs and logistical complications that may outweigh the benefits of change.",
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
        stem: "Sort each detail into the passage whose argumentative approach it best represents. Consider the type of evidence and how each author builds credibility.",
        instructions: "Drag each detail into the correct column. Think about whether the detail reflects research-based outcomes or logistical/community concerns.",
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
            text: "Cites a 2022 parent survey showing that 48% said later start times would make work schedules significantly harder to manage.",
            categoryId: "p2"
            },
            {
            id: "cp7",
            text: "Describes a 16% decrease in morning car accidents involving teen drivers after later start times.",
            categoryId: "p1"
            },
            {
            id: "cp8",
            text: "Explains that later dismissal can push practices and rehearsals later into the evening, affecting student routines.",
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
        stem: "Choose the revision that best matches the author’s formal, evidence-based tone and accurately reflects the strength of the argument in Passage 1.",
        originalSentence: "Starting school later might be kind of helpful for students who feel tired during the day.",
        sentenceParts: [
            "Starting school later would be ",
            " for students who feel tired during the day."
        ],
        options: [
            "somewhat helpful",
            "a meaningful improvement",
            "a complete solution",
            "nice but not essential"
        ],
        correctIndex: 1,
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
        stem: "Choose the revision that makes the author’s opinion in Passage 2 clear while maintaining a balanced and credible argumentative tone.",
        originalSentence: "Keeping an earlier start time is sort of okay for families and the community.",
        sentenceParts: [
            "Keeping an earlier start time is ",
            " for families and the community."
        ],
        options: [
            "the only responsible choice",
            "often a better fit",
            "always the best decision for every district",
            "barely helpful at all"
        ],
        correctIndex: 1,
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
        stem: "Based on the audio debate and the passages, what is the central disagreement between the two speakers?",
        instructions: "Consider how each speaker frames the issue when selecting your answer.",
        options: [
            "Whether teenagers biologically need more sleep than adults.",
            "Whether research about accident reduction is trustworthy.",
            "Whether later start times are primarily a public health priority or a systemic change that creates significant community trade-offs.",
            "Whether after-school activities should be eliminated to protect student sleep."
        ],
        correctIndex: 2,
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
        stem: "How does the graph in Passage 1 most effectively strengthen Speaker 1’s argument in the audio debate?",
        instructions: "Use both the visual data and the speaker’s claims when selecting your answer.",
        options: [
            "It provides measurable data showing a significant reduction in students who feel very tired, reinforcing the claim that later start times are supported by scientific evidence.",
            "It proves that later start times improve every aspect of student life, including grades and extracurricular success.",
            "It shows that participation in after-school activities increases when schools start later.",
            "It demonstrates that transportation costs decrease when start times are adjusted."
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
        stem: "Based on the video, which inference is best supported about why communities struggle to reach agreement on school start times?",
        instructions: "Choose the answer that is supported by the perspectives presented but not directly stated.",
        options: [
            "Communities struggle mainly because students frequently change their opinions about start times.",
            "Communities struggle because most stakeholders agree on the solution but lack the funding to implement it.",
            "Communities struggle because later start times automatically solve health problems but create no additional challenges.",
            "Communities struggle because improving one group’s outcomes (such as student sleep) can create new challenges for other groups, leading to unavoidable trade-offs."
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
        stem: "Using the video, the audio debate, and both passages, which explanation best synthesizes why changing school start times is such a complex decision for communities?",
        instructions: "Choose the answer that most fully integrates the perspectives presented across all sources.",
        options: [
            "Communities frequently change school schedules, so start times are rarely a long-term concern.",
            "The evidence shows that only one side of the debate has meaningful concerns, making the decision straightforward.",
            "Changing school start times affects multiple interconnected systems—student health and safety, family work routines, after-school activities, and transportation—so gains in one area can create costs in another.",
            "The main solution is to eliminate extracurricular activities so students can sleep more without affecting schedules."
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
