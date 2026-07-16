// levels/on-level.js
// 8th Grade on-level content bundle: passages + questions + sets

window.READING_LEVEL = {
  id: "on",
  label: "On Grade Level",

  passages: {
    1: {
      title: "Why the Next Video Feels Chosen for You",
      html: `
        <h2 class="passage-title">Why the Next Video Feels Chosen for You</h2>
        <p class="passage-lexile"><em>Estimated Lexile Level: 940L–1050L</em></p>

        <p><span class="para-num">1</span> Nia opened a video app to watch one cooking clip. Twenty minutes later, she had watched a lunchbox idea, a review of colorful water bottles, a backpack organization video, and three clips from a creator who called every product “life-changing.” Nia had not searched for those videos one by one. The app’s recommendation system had chosen them for her, based on signals from what she watched, skipped, liked, saved, and replayed.</p>

        <p><span class="para-num">2</span> A recommendation system is a set of computer instructions that tries to predict what a user may want to see next. These systems are common on streaming, shopping, music, gaming, and video platforms. They can be helpful because they sort through more content than one person could search alone. Instead of starting from a blank screen, users receive suggestions connected to their past choices, popular trends, or the behavior of people with similar interests.</p>

        <table class="passage-table">
          <caption>Common Signals in Recommendation Systems</caption>
          <thead>
            <tr><th>User Signal</th><th>What the Platform May Infer</th><th>Possible Result</th></tr>
          </thead>
          <tbody>
            <tr><td>Watch time</td><td>The user stayed interested.</td><td>The platform may suggest similar videos.</td></tr>
            <tr><td>Skipping quickly</td><td>The user may not be interested.</td><td>The platform may show fewer similar items.</td></tr>
            <tr><td>Saving or liking</td><td>The user wants to return to the content.</td><td>The platform may treat the topic as important.</td></tr>
            <tr><td>Buying or clicking a product</td><td>The user may be a likely customer.</td><td>The platform may show related products or creators.</td></tr>
          </tbody>
        </table>

        <p><span class="para-num">3</span> The system does not truly know a person. It studies patterns. If Nia finishes several organization videos, the app may decide she wants more videos about school supplies, planners, desk makeovers, and study routines. If she watches several product reviews without buying anything, the system may still learn that she pays attention to those topics. The platform is not reading her mind; it is making predictions from her behavior.</p>

        <p><span class="para-num">4</span> Those predictions can shape attention. When a platform keeps offering similar content, a user may begin to feel that a trend is everywhere. A backpack brand, a skincare routine, or a new game may seem more popular than it really is because the user’s feed repeats it. Repetition can also affect identity. A student who watches one guitar tutorial may discover a new hobby, while another student may start wanting products because the same style appears again and again.</p>

        <p><span class="para-num">5</span> Personalized recommendations are not automatically harmful. They can help people find useful tutorials, new music, creative hobbies, and communities with shared interests. The problem begins when users forget that the feed is designed. A recommendation is not a neutral list of everything available. It is a selected path shaped by data, design choices, business goals, and user behavior.</p>

        <p><span class="para-num">6</span> Careful users do not need to reject every recommendation. Instead, they can become more aware of how recommendations work. They can pause before buying a product, look for more than one review, notice when a feed becomes repetitive, and ask why a certain video or product keeps appearing. The next suggestion may feel personal, but it is still worth questioning.</p>
      `
    },

    2: {
      title: "Recommendation Labels Should Be Easier to Notice",
      html: `
        <h2 class="passage-title">Recommendation Labels Should Be Easier to Notice</h2>
        <p class="passage-lexile"><em>Estimated Lexile Level: 970L–1080L</em></p>

        <p><span class="para-num">1</span> Personalized recommendations can make digital life easier. A music app suggests a new artist. A shopping site remembers the size of a notebook a student searched for last week. A video platform offers a drawing lesson similar to one a user already enjoyed. These tools can save time, but they also raise an important question: when a platform recommends something, should users be told why they are seeing it?</p>

        <p><span class="para-num">2</span> Platforms should make recommendation labels clearer, especially when money or sponsorship is involved. Many users can recognize a traditional advertisement, such as a commercial before a video. It is harder to recognize an ad when it looks like a creator’s normal post, a product review, or the next suggested clip. If a creator was paid, received a free product, or has another important connection to a brand, the audience deserves to know that relationship clearly.</p>

        <p><span class="para-num">3</span> Some people argue that labels are unnecessary because users should already know that platforms and creators try to make money. That argument is too simple. Knowing that a platform earns money is not the same as knowing which recommendation was shaped by a payment, sponsorship, or sales goal. A student watching a backpack review, for example, may judge the creator’s praise differently if the creator bought the backpack independently than if the company sent it for free.</p>

        <figure class="passage-media-figure">
          <img src="../media/label.png" alt="A sponsored-content label showing how digital recommendations can be identified" class="passage-image">
          <figcaption>Clear labels can help users understand when content may be sponsored, personalized, or recommended for a specific reason.</figcaption>
        </figure>

        <p><span class="para-num">4</span> Clear labels would not have to ruin the user experience. A short note such as “sponsored,” “paid partnership,” “recommended because you watched study videos,” or “suggested from your shopping activity” could help users understand the purpose behind the content. The goal is not to shame creators or platforms. The goal is to give audiences enough context to think critically.</p>

        <p><span class="para-num">5</span> Better labels could also help creators build trust. When creators explain their connection to a product, audiences can decide how much weight to give the recommendation. A clear disclosure does not automatically make a review dishonest. In fact, honesty about sponsorship may make the review feel more credible because the audience is not left guessing.</p>

        <p><span class="para-num">6</span> Platforms do not need to stop personalizing recommendations. Personalization can help users find useful, entertaining, and creative content. But personalized systems should not be invisible when they are influencing attention and choices. If recommendations shape what people watch, want, and buy, then users need labels that are easy to notice and easy to understand.</p>
      `
    }
  },

  questions: (() => {
    const questions = [
      {
        id: 1,
        type: "mcq",
        linkedPassage: 1,
        stem: "Which statement best explains how the author develops the central idea of Passage 1?",
        instructions: "Choose the best answer.",
        options: [
          "The author begins with an example, explains how recommendation systems use signals, and then shows why users should think critically about suggestions.",
          "The author tells the story of one student who stops using video apps and then argues that all personalized recommendations should be banned.",
          "The author compares music apps with shopping sites to prove that every platform uses the same recommendation system.",
          "The author focuses mainly on how creators earn money from product reviews and sponsored posts."
        ],
        correctIndex: 0,
        standards: ["8.T.T.2.a", "8.T.SS.1.a", "8.T.C.1.a"],
        skills: ["central-idea", "text-structure", "expository-techniques", "passage-1", "mcq", "dok3"]
      },
      {
        id: 2,
        type: "mcq",
        linkedPassage: 2,
        stem: "Which claim is most strongly developed in Passage 2?",
        instructions: "Choose the best answer.",
        options: [
          "Platforms should stop using recommendation systems because users cannot make decisions when content is personalized.",
          "Creators should avoid reviewing products because audiences cannot trust any opinion connected to a brand.",
          "Recommendation labels should be clearer so users can understand when personalization, payment, or sponsorship may affect what they see.",
          "Traditional advertisements are more harmful than sponsored creator content because commercials are easier to recognize."
        ],
        correctIndex: 2,
        standards: ["8.T.T.3.a", "8.T.C.1.a", "8.P.AC.1.a"],
        skills: ["claim", "argument-structure", "purpose-audience", "passage-2", "mcq", "dok3"]
      },
      {
        id: 3,
        type: "mcq",
        linkedPassage: 1,
        stem: "How does the table in Passage 1 help develop the author’s explanation?",
        instructions: "Choose the best answer.",
        options: [
          "It shows that platforms use different user signals to make predictions about what to suggest next.",
          "It proves that watch time is the only signal platforms use when choosing videos.",
          "It ranks recommendation systems from most helpful to least helpful.",
          "It gives instructions for deleting every signal a platform has collected."
        ],
        correctIndex: 0,
        standards: ["8.T.C.1.b", "8.T.T.2.a", "8.T.SS.1.a"],
        skills: ["text-features", "text-design", "details", "passage-1", "mcq", "dok3"]
      },
      {
        id: 4,
        type: "mcq",
        linkedPassage: 2,
        stem: "Which sentence best describes the author’s perspective in Passage 2?",
        instructions: "Choose the best answer.",
        options: [
          "The author believes personalization can be useful, but users need clearer information about why content is being recommended.",
          "The author believes sponsored content is always dishonest and should never appear on digital platforms.",
          "The author believes users should be responsible for guessing whether every creator has a connection to a brand.",
          "The author believes platforms should show only traditional advertisements instead of personalized recommendations."
        ],
        correctIndex: 0,
        standards: ["8.T.C.2.a", "8.T.C.2.b", "8.P.ST.2.b"],
        skills: ["author-perspective", "claim", "inference", "passage-2", "mcq", "dok3"]
      },
      {
        id: 5,
        type: "multi",
        linkedPassage: 1,
        stem: "Which THREE details from Passage 1 best support the idea that recommendations are based on user behavior?",
        instructions: "Select exactly 3 answers.",
        options: [
          "Nia’s app chose videos based on what she watched, skipped, liked, saved, and replayed.",
          "A recommendation system tries to predict what a user may want to see next.",
          "A student who watches one guitar tutorial may discover a new hobby.",
          "If Nia finishes several organization videos, the app may suggest more school supply and study routine videos.",
          "Personalized recommendations are not automatically harmful."
        ],
        correctIndices: [0, 1, 3],
        minSelections: 3,
        maxSelections: 3,
        standards: ["8.T.T.2.a", "8.P.EICC.3.f", "8.T.C.1.b"],
        skills: ["text-evidence", "details", "expository-techniques", "passage-1", "multi-select", "dok3"]
      },
      {
        id: 6,
        type: "multi",
        linkedPassage: 2,
        stem: "Which THREE details from Passage 2 best support the argument that clearer labels help audiences think critically?",
        instructions: "Select exactly 3 answers.",
        options: [
          "A user may judge a backpack review differently if the creator received the product for free.",
          "A short note such as “sponsored” or “recommended because you watched study videos” could explain the purpose behind content.",
          "A music app may suggest a new artist to a listener.",
          "When creators explain their connection to a product, audiences can decide how much weight to give the recommendation.",
          "Personalization can help users find useful, entertaining, and creative content."
        ],
        correctIndices: [0, 1, 3],
        minSelections: 3,
        maxSelections: 3,
        standards: ["8.T.T.3.a", "8.P.EICC.3.f", "8.T.C.2.b"],
        skills: ["text-evidence", "claim", "credibility", "passage-2", "multi-select", "dok3"]
      },
      {
        id: 7,
        type: "mcq",
        linkedPassage: 1,
        stem: "In paragraph 5 of Passage 1, what does the word neutral most nearly mean?",
        instructions: "Choose the best answer.",
        options: [
          "Selected for only one age group",
          "Unbiased or not favoring a particular direction",
          "Hidden from the user’s screen",
          "Designed to be entertaining instead of useful"
        ],
        correctIndex: 1,
        standards: ["8.L.V.3.b", "8.L.V.3.d", "8.P.EICC.3.g"],
        skills: ["vocabulary-in-context", "denotation-connotation", "author-meaning", "passage-1", "mcq"]
      },
      {
        id: 8,
        type: "mcq",
        linkedPassage: 2,
        stem: "What does the phrase “the audience is not left guessing” suggest in paragraph 5 of Passage 2?",
        instructions: "Choose the best answer.",
        options: [
          "Clear disclosures help viewers understand a creator’s connection to a product.",
          "Audiences should avoid all creators who recommend products online.",
          "Sponsored reviews are always more accurate than independent reviews.",
          "Platforms should remove labels because viewers already know how recommendations work."
        ],
        correctIndex: 0,
        standards: ["8.L.V.3.b", "8.T.SS.2.a", "8.T.C.1.a"],
        skills: ["author-meaning", "vocabulary-in-context", "purpose-audience", "passage-2", "mcq", "dok3"]
      },
      {
        id: 9,
        type: "order",
        linkedPassage: 1,
        stem: "Order the steps that best show how a recommendation loop can develop, based on Passage 1.",
        instructions: "Drag and drop from first to last.",
        items: [
          { id: "o3", text: "The platform suggests more content connected to that behavior." },
          { id: "o1", text: "A user watches, skips, likes, saves, clicks, or replays content." },
          { id: "o4", text: "The user may begin to see the same topic or product repeatedly." },
          { id: "o2", text: "The platform studies the behavior as a signal of interest or disinterest." }
        ],
        correctOrder: ["o1", "o2", "o3", "o4"],
        standards: ["8.T.SS.1.a", "8.T.T.2.a", "8.P.EICC.3.d"],
        skills: ["cause-effect", "text-structure", "details", "passage-1", "order", "dok3"]
      },
      {
        id: 10,
        type: "match",
        linkedPassage: 1,
        stem: "Match each user signal from Passage 1 with the platform inference it may support.",
        instructions: "Match the items correctly.",
        left: [
          { id: "m1", text: "A user finishes several videos about school organization." },
          { id: "m2", text: "A user skips a video after only a few seconds." },
          { id: "m3", text: "A user saves several product review videos." }
        ],
        right: [
          { id: "r1", text: "The user may want to return to that topic later." },
          { id: "r2", text: "The user may not be interested in that kind of content." },
          { id: "r3", text: "The user may be interested in related study routines or supplies." }
        ],
        pairs: { m1: "r3", m2: "r2", m3: "r1" },
        standards: ["8.T.T.2.a", "8.P.EICC.3.f"],
        skills: ["details", "inference", "text-features", "passage-1", "match", "dok3"]
      },
      {
        id: 11,
        type: "highlight",
        linkedPassage: 1,
        stem: "Which TWO sentences from Passage 1 best support the inference that recommendation systems can influence what users believe is popular?",
        instructions: "Select exactly 2 sentences.",
        sentences: [
          { id: "h1", text: "A recommendation system is a set of computer instructions that tries to predict what a user may want to see next.", correct: false },
          { id: "h2", text: "When a platform keeps offering similar content, a user may begin to feel that a trend is everywhere.", correct: true },
          { id: "h3", text: "A backpack brand, a skincare routine, or a new game may seem more popular than it really is because the user’s feed repeats it.", correct: true },
          { id: "h4", text: "These systems are common on streaming, shopping, music, gaming, and video platforms.", correct: false },
          { id: "h5", text: "Careful users do not need to reject every recommendation.", correct: false }
        ],
        standards: ["8.T.T.2.a", "8.P.EICC.3.f", "8.T.C.1.a"],
        skills: ["text-evidence", "inference", "details", "highlight", "passage-1", "dok3"]
      },
      {
        id: 12,
        type: "highlight",
        linkedPassage: 2,
        stem: "Which TWO sentences from Passage 2 best show that the author is not arguing against all personalization?",
        instructions: "Select exactly 2 sentences.",
        sentences: [
          { id: "h1", text: "Personalized recommendations can make digital life easier.", correct: true },
          { id: "h2", text: "Platforms should make recommendation labels clearer, especially when money or sponsorship is involved.", correct: false },
          { id: "h3", text: "Clear labels would not have to ruin the user experience.", correct: false },
          { id: "h4", text: "Platforms do not need to stop personalizing recommendations.", correct: true },
          { id: "h5", text: "If recommendations shape what people watch, want, and buy, then users need labels that are easy to notice and easy to understand.", correct: false }
        ],
        standards: ["8.T.T.3.a", "8.T.C.2.a", "8.P.AC.1.a"],
        skills: ["text-evidence", "author-perspective", "claim", "highlight", "passage-2", "dok3"]
      },
      {
        id: 13,
        type: "partAB",
        linkedPassage: 1,
        stem: "Answer Part A and Part B based on Passage 1.",
        partA: {
          stem: "Which idea is most strongly developed in Passage 1?",
          options: [
            "Recommendation systems are designed only to help users make better purchases.",
            "Recommendation systems can be useful, but users should understand that suggestions are shaped by data and design choices.",
            "Recommendation systems use random guesses and cannot learn anything from user behavior.",
            "Recommendation systems are harmful whenever they suggest content connected to hobbies or products."
          ],
          correctIndex: 1
        },
        partB: {
          stem: "Which sentence best supports the answer to Part A?",
          options: [
            "Nia opened a video app to watch one cooking clip.",
            "The system does not truly know a person.",
            "A recommendation is not a neutral list of everything available.",
            "A student who watches one guitar tutorial may discover a new hobby."
          ],
          correctIndex: 2
        },
        standards: ["8.T.T.2.a", "8.P.EICC.3.f", "8.T.C.1.a"],
        skills: ["central-idea", "text-evidence", "synthesize", "two-part", "passage-1", "dok3"]
      },
      {
        id: 14,
        type: "partAB",
        linkedPassage: 2,
        stem: "Answer Part A and Part B based on Passage 2.",
        partA: {
          stem: "Which statement best describes how the author supports the argument?",
          options: [
            "The author mostly uses examples of music and shopping apps to suggest that personalization is useful in everyday situations.",
            "The author explains that traditional advertisements are usually easy to recognize, while some recommendations may be harder to judge.",
            "The author presents the problem of unclear recommendations, responds to an opposing view, and proposes clearer labels as a solution.",
            "The author describes how students use recommendation systems, then compares those systems with older forms of advertising."
          ],
          correctIndex: 2
        },
        partB: {
          stem: "Which sentence best supports the answer to Part A?",
          options: [
            "A music app suggests a new artist, showing that personalized recommendations can sometimes make digital tools easier or more useful.",
            "A short note such as “sponsored,” “paid partnership,” “recommended because you watched study videos,” or “suggested from your shopping activity” could help users understand the purpose behind the content.",
            "Many users can recognize a traditional advertisement, such as a commercial before a video, but may have more trouble recognizing advertising that looks like regular content.",
            "A shopping site remembers the size of a notebook a student searched for last week, showing one way personalization can connect to a user’s previous activity."
          ],
          correctIndex: 1
        },
        standards: ["8.T.T.3.a", "8.P.AC.1.a", "8.T.C.2.a"],
        skills: ["argument-structure", "counterclaim", "text-evidence", "two-part", "passage-2", "dok3"]
      },
      {
        id: 15,
        type: "classify",
        linkedPassage: null,
        stem: "Sort each idea based on whether it is presented as a possible benefit or possible concern of personalized recommendations.",
        instructions: "Drag each idea to the correct column.",
        categories: [
          { id: "benefit", label: "Possible Benefit" },
          { id: "concern", label: "Possible Concern" }
        ],
        items: [
          { id: "c1", text: "A user may find a useful tutorial connected to a new hobby.", categoryId: "benefit" },
          { id: "c2", text: "A product may seem more popular because it appears repeatedly.", categoryId: "concern" },
          { id: "c3", text: "A platform may help users sort through a large amount of content.", categoryId: "benefit" },
          { id: "c4", text: "A user may not realize that a recommendation is connected to a sponsorship.", categoryId: "concern" },
          { id: "c5", text: "A music app may suggest an artist similar to one the user already enjoys.", categoryId: "benefit" }
        ],
        standards: ["8.T.T.2.a", "8.T.T.3.a", "8.P.EICC.3.f"],
        skills: ["classify", "synthesize", "critical-thinking", "dok3"]
      },
      {
        id: 16,
        type: "mcq",
        linkedPassage: 1,
        stem: "Which choice best analyzes the author’s use of Nia in paragraph 1?",
        instructions: "Choose the best answer.",
        options: [
          "Nia’s example introduces a familiar situation so readers can understand how recommendations can guide a user from one topic to another.",
          "Nia’s example proves that all students make careless choices when using video platforms.",
          "Nia’s example shows that cooking videos are the main reason recommendation systems were created.",
          "Nia’s example distracts from the passage because it does not connect to the explanation that follows."
        ],
        correctIndex: 0,
        standards: ["8.P.AC.1.a", "8.T.C.1.a", "8.T.T.2.a"],
        skills: ["author-craft", "purpose-audience", "expository-techniques", "passage-1", "mcq", "dok3"]
      },
      {
        id: 17,
        type: "mcq",
        linkedPassage: 2,
        stem: "Which explanation best analyzes the tone of Passage 2?",
        instructions: "Choose the best answer.",
        options: [
          "The tone is practical and persuasive because the author recognizes benefits while arguing for clearer labels.",
          "The tone is angry and dismissive because the author believes creators and platforms are always trying to trick users.",
          "The tone is humorous because the author mainly wants to entertain readers with examples of music and backpacks.",
          "The tone is uncertain because the author never makes a clear claim about recommendation labels."
        ],
        correctIndex: 0,
        standards: ["8.T.SS.2.a", "8.T.C.2.a", "8.P.AC.1.b"],
        skills: ["tone", "author-perspective", "word-choice", "passage-2", "mcq", "dok3"]
      },
      {
        id: 18,
        type: "mcq",
        linkedPassage: 1,
        stem: "Which statement from Passage 1 best supports the conclusion that recommendations are selected rather than neutral?",
        instructions: "Choose the best answer.",
        options: [
          "These systems are common on streaming, shopping, music, gaming, and video platforms, which shows that many digital spaces use recommendation tools.",
          "The platform is not reading her mind; it is making predictions from her behavior, which shows that the system responds to user actions.",
          "A student who watches one guitar tutorial may discover a new hobby, which shows that recommendations can sometimes lead to positive experiences.",
          "Instead of starting from a blank screen, users receive suggestions connected to their past choices, popular trends, or the behavior of people with similar interests."
        ],
        correctIndex: 3,
        standards: ["8.T.T.2.a", "8.T.C.1.b", "8.P.EICC.3.f"],
        skills: ["text-evidence", "inference", "critical-thinking", "passage-1", "mcq", "dok3"]
      },
      {
        id: 19,
        type: "match",
        linkedPassage: 2,
        stem: "Match each point from Passage 2 with the role it plays in the author’s argument.",
        instructions: "Match the items correctly.",
        left: [
          { id: "m1", text: "Personalized recommendations can make digital life easier." },
          { id: "m2", text: "Some people argue labels are unnecessary because users should know platforms make money." },
          { id: "m3", text: "Short notes such as “sponsored” or “paid partnership” could help users understand the purpose behind content." }
        ],
        right: [
          { id: "r1", text: "Proposed solution" },
          { id: "r2", text: "Acknowledged benefit" },
          { id: "r3", text: "Opposing view" }
        ],
        pairs: { m1: "r2", m2: "r3", m3: "r1" },
        standards: ["8.T.T.3.a", "8.P.AC.1.a", "8.T.SS.1.a"],
        skills: ["argument-structure", "counterclaim", "claim", "match", "passage-2", "dok3"]
      },
      {
        id: 20,
        type: "mcq",
        questionLabel: "Podcast",
        linkedPassage: null,
        media: {
          type: "audio",
          src: "../media/Recommendation_Loops_Podcast.m4a",
          captions: "../media/Recommendation_Loops_Podcast.vtt",
          label: "Podcast: The Recommendation Loop"
        },
        stem: "Which claim from the podcast is best supported by the speaker’s explanation of algorithms?",
        instructions: "Listen to the podcast. Choose the best answer.",
        options: [
          "Recommendation algorithms mainly help users avoid advertisements by giving them more control over what appears in their feeds.",
          "Recommendation algorithms are described as simple tools that show popular videos without studying individual user behavior.",
          "Recommendation algorithms can keep users engaged by tracking behavior and using those signals to predict what people will keep watching.",
          "Recommendation algorithms are presented as entertainment features that influence trends but do not affect user attention or choices."
        ],
        correctIndex: 2,
        standards: ["8.T.C.1.b", "8.T.T.2.a", "8.P.AC.3.d"],
        skills: ["multimodal-features", "claim", "details", "podcast", "dok3"]
      },
      {
        id: 21,
        type: "multi",
        questionLabel: "Podcast",
        linkedPassage: null,
        media: {
          type: "audio",
          src: "../media/Recommendation_Loops_Podcast.m4a",
          captions: "../media/Recommendation_Loops_Podcast.vtt",
          label: "Podcast: The Recommendation Loop"
        },
        stem: "Which THREE details from the podcast best support the idea that platforms use user behavior to shape future recommendations?",
        instructions: "Listen to the podcast. Select exactly 3 answers.",
        options: [
          "The speaker compares scrolling to a rabbit hole near the end of the podcast.",
          "Platforms use algorithms to predict what users will like, share, or watch.",
          "Microtrends can disappear as quickly as they appear.",
          "Every pause, like, and swipe can be monitored as a signal.",
          "Infinite scrolling and emotional videos can be used to keep users engaged."
        ],
        correctIndices: [1, 3, 4],
        minSelections: 3,
        maxSelections: 3,
        standards: ["8.T.C.1.b", "8.T.T.2.a", "8.P.EICC.3.f"],
        skills: ["multimodal-features", "text-evidence", "details", "podcast", "multi-select", "dok3"]
      },
      {
        id: 22,
        type: "partAB",
        questionLabel: "Podcast",
        linkedPassage: null,
        media: {
          type: "audio",
          src: "../media/Recommendation_Loops_Podcast.m4a",
          captions: "../media/Recommendation_Loops_Podcast.vtt",
          label: "Podcast: The Recommendation Loop"
        },
        stem: "Answer Part A and Part B using the podcast.",
        instructions: "Listen carefully, then connect the speaker’s purpose to supporting details.",
        partA: {
          stem: "What is the speaker’s most likely purpose?",
          options: [
            "To warn listeners that recommendation systems can shape attention and choices in ways users may not notice",
            "To explain how students can build their own video platform using mathematical rules",
            "To entertain listeners with a fictional story about a detective solving a mystery inside a phone",
            "To argue that users should trust every recommended video because algorithms know their interests best"
          ],
          correctIndex: 0
        },
        partB: {
          stem: "Which detail best supports the answer to Part A?",
          options: [
            "The speaker says every pause, like, and swipe is monitored and compares the app to a tiny detective watching the user.",
            "The speaker begins by saying the podcast is a brief about social media algorithms.",
            "The speaker mentions that some trends explode in days and vanish quickly.",
            "The speaker uses the phrase “video feeds on our phones” near the beginning."
          ],
          correctIndex: 0
        },
        standards: ["8.T.C.1.a", "8.P.AC.3.d", "8.T.SS.2.a"],
        skills: ["purpose-audience", "multimodal-features", "tone", "podcast", "two-part", "dok3"]
      },
      {
        id: 23,
        type: "mcq",
        questionLabel: "Video",
        linkedPassage: null,
        media: {
          type: "video",
          src: "../media/Influencer_Recommendation_Design.mp4",
          label: "Video: Engagement Pods and Recommendation Design"
        },
        stem: "How do the video’s visuals and captions help explain how some posts gain attention online?",
        instructions: "Watch the video. Choose the best answer.",
        options: [
          "They suggest that online posts gain attention mostly because creators choose bright colors, clear photos, and polished captions.",
          "They show that platforms always rank posts randomly, even when users like, save, comment on, or share content.",
          "They explain that popular posts usually become visible only after a platform employee reviews and approves each one.",
          "They show how coordinated likes, comments, saves, shares, and early engagement can make a post appear more valuable to a platform."
        ],
        correctIndex: 3,
        standards: ["8.T.C.1.b", "8.P.AC.3.d", "8.T.SS.1.a"],
        skills: ["multimodal-features", "text-design", "inference", "video", "dok3"]
      },
      {
        id: 24,
        type: "multi",
        questionLabel: "Video",
        linkedPassage: null,
        media: {
          type: "video",
          src: "../media/Influencer_Recommendation_Design.mp4",
          label: "Video: Engagement Pods and Recommendation Design"
        },
        stem: "Which TWO details from the video best support the idea that engagement pods try to influence recommendation systems?",
        instructions: "Watch the video. Select exactly 2 answers.",
        options: [
          "The video describes a group that works together to like, comment on, save, or share a post soon after it appears.",
          "The video shows that quick early activity can make a post seem more valuable or popular to a platform.",
          "The video explains that engagement pods are used mainly to help creators choose better lighting and camera angles.",
          "The video focuses on users reading product labels before deciding whether to trust a creator’s recommendation.",
          "The video suggests that recommendation systems ignore comments, saves, shares, and early audience activity."
        ],
        correctIndices: [0, 1],
        minSelections: 2,
        maxSelections: 2,
        standards: ["8.T.T.2.a", "8.T.C.1.b", "8.P.AC.3.d"],
        skills: ["text-evidence", "multimodal-features", "details", "video", "multi-select", "dok3"]
      },
      {
        id: 25,
        type: "partAB",
        questionLabel: "Video",
        linkedPassage: null,
        media: {
          type: "video",
          src: "../media/Influencer_Recommendation_Design.mp4",
          label: "Video: Engagement Pods and Recommendation Design"
        },
        stem: "Answer Part A and Part B using the video and the two passages.",
        instructions: "Synthesize the multimedia source with the reading passages.",
        partA: {
          stem: "Which statement best synthesizes the main idea across the video and both passages?",
          options: [
            "Recommendation systems are useful because they always show users the strongest, most balanced, and most trustworthy content first.",
            "Online popularity is usually natural because posts become popular only when many people independently choose them.",
            "Recommendation systems can help users discover content, but users should understand that signals, labels, design choices, and planned engagement can shape what appears popular.",
            "Platforms should remove personalized recommendations because users are unable to make thoughtful decisions when content is suggested."
          ],
          correctIndex: 2
        },
        partB: {
          stem: "Which evidence best supports the answer to Part A?",
          options: [
            "Passage 1 includes an example about Nia watching videos, Passage 2 mentions a shopping site, and the video shows a post gaining attention.",
            "Passage 1 explains that users sometimes discover hobbies, Passage 2 says personalization can save time, and the video includes creator content.",
            "Passage 1 says recommendations are neutral, Passage 2 says labels are unnecessary, and the video shows that popularity is always random.",
            "Passage 1 explains user signals, Passage 2 argues for clearer labels, and the video shows coordinated engagement actions that may influence what appears popular."
          ],
          correctIndex: 3
        },
        standards: ["8.T.T.2.b", "8.P.EICC.3.f", "8.P.AC.3.d"],
        skills: ["synthesize", "paired-text-analysis", "text-evidence", "video", "two-part", "dok3"]
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