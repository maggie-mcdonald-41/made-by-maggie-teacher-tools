// levels/on-level.js
// 7th Grade on-level content bundle: passages + questions + sets

window.READING_LEVEL = {
  id: "on",
  label: "On Grade Level",

  passages: {
    1: {
      title: "How Social Media Changes the Way People Get News",
      html: `
        <h2 class="passage-title">How Social Media Changes the Way People Get News</h2>
        <p class="passage-lexile"><em>Estimated Lexile Level: 940L–1040L</em></p>

        <p><span class="para-num">1</span> For many people, news no longer arrives mainly through a newspaper on the porch or a scheduled evening broadcast. It appears between a friend’s vacation photo, a short comedy clip, and a school announcement. A headline can travel through a group chat, a repost, or a video caption before a reader ever visits the original news source. Social media has not simply made news faster; it has changed how people notice, judge, and share information.</p>

        <p><span class="para-num">2</span> One major change is speed. A breaking story can spread to thousands of people within minutes because users do not need to wait for a full article or broadcast. That speed can be useful during emergencies, school closings, or local events. However, speed can also make mistakes harder to stop. If a post is missing context, using an old image, or repeating a rumor, each share gives the claim a larger audience before anyone has checked it carefully.</p>

        <p><span class="para-num">3</span> Another change is personalization. Social media platforms use signals such as likes, comments, follows, watch time, and shares to decide what to show each user. This can help people find stories related to their interests. It can also create a narrow information stream. If a student often clicks dramatic headlines about school rules, the platform may show more dramatic headlines about schools. Over time, the student may begin to feel as if those stories represent the whole picture, even when important details or opposing views are missing.</p>

        <table class="passage-table social-news-chart">
          <caption>Common Social Media News Habits</caption>
          <thead>
            <tr>
              <th>Habit</th>
              <th>Possible Benefit</th>
              <th>Possible Risk</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Reading only the headline</td>
              <td>Quickly notices a topic</td>
              <td>Misses context, evidence, or updates</td>
            </tr>
            <tr>
              <td>Sharing because a friend shared it</td>
              <td>Helps spread information quickly</td>
              <td>Treats popularity like proof</td>
            </tr>
            <tr>
              <td>Following accounts with similar opinions</td>
              <td>Builds a feed that feels relevant</td>
              <td>Limits exposure to other perspectives</td>
            </tr>
            <tr>
              <td>Checking the original source</td>
              <td>Allows a reader to evaluate evidence</td>
              <td>Takes more time and effort</td>
            </tr>
          </tbody>
        </table>

        <p><span class="para-num">4</span> Social media also changes the way readers judge credibility. In the past, many news stories were filtered by editors before publication. Online, a post may look professional even if it comes from an account that is trying to sell something, influence opinions, or gain attention. A large number of likes can make a claim feel trustworthy, but likes show reaction, not accuracy. A reader still has to ask who created the information, what evidence is included, and whether another reliable source reports the same thing.</p>

        <p><span class="para-num">5</span> None of this means social media is useless for news. Social platforms can help people hear from eyewitnesses, learn about issues ignored by larger outlets, and respond quickly when events affect their community. The challenge is that readers must become more active. Instead of asking only, “Did I see this post?” a careful reader asks, “Where did this come from, what is missing, and what should I check before I share?”</p>
      `
    },

    2: {
      title: "The Story Everyone Shared",
      html: `
        <h2 class="passage-title">The Story Everyone Shared</h2>
        <p class="passage-lexile"><em>Estimated Lexile Level: 960L–1050L</em></p>

        <p><span class="para-num">1</span> By lunch, the post had appeared on almost every phone at Westbrook Middle School. A photo showed a muddy soccer field with the caption, “Spring dance canceled because the gym roof leaked!” Under the post were shocked-face emojis, angry comments, and dozens of shares. Elena saw it while standing in the cafeteria line. Her best friend Tasha groaned, “I already bought my shoes.”</p>

        <p><span class="para-num">2</span> Elena almost tapped the share button. The post looked official because it used the school colors and included a photo of the gym doors. Still, something felt off. The caption said the gym roof had leaked, but the picture showed the soccer field, not the gym. Elena also noticed that the account name was @WestbrookBuzz, not the school’s official account. It had posted cafeteria memes, sports rumors, and a blurry video of a fire drill the week before.</p>

        <p><span class="para-num">3</span> In seventh-period media literacy, Ms. Patel projected the post on the board. “Before we react,” she said, “let’s slow the story down.” She asked the class to list what the post claimed, what evidence it gave, and what they still needed to know. Marcus pointed out that the photo did not prove anything about the dance. Tasha found the same soccer-field image in an old post from last month. Elena checked the school website and saw a short announcement: the dance was still scheduled, but the location had been moved to the cafeteria because the gym floor was being refinished.</p>

        <figure class="passage-figure westbrook-figure">
        <img class="passage-image westbrook-image" src="../media/westbrook.png" alt="Illustration of students checking a social media post about Westbrook Middle School.">
        <figcaption>Elena and her classmates slow down the rumor by checking the source and evidence.</figcaption>
        </figure>

        <p><span class="para-num">4</span> The room grew quieter as the class compared the rumor with the announcement. The post had not invented everything. There really was a change. But it had turned a location change into a cancellation, then used an unrelated photo to make the claim feel urgent. “So it was half true?” Marcus asked. Ms. Patel nodded. “And half true can be more dangerous than completely silly. It gives people just enough truth to stop questioning the rest.”</p>

        <p><span class="para-num">5</span> After school, Elena posted a correction in the group chat: “Dance is not canceled. It moved to the cafeteria. Check the school website.” She did not embarrass the student who had shared the rumor first. Instead, she added, “I almost shared it too.” The message did not get as many reactions as the original post, but several classmates thanked her. Tasha replied with a shoe emoji and wrote, “Crisis paused.”</p>

        <p><span class="para-num">6</span> That night, Elena thought about how quickly the rumor had traveled. No single person had meant to mislead the whole grade, but each quick share had carried the mistake farther. The next morning, when another dramatic post appeared about a teacher quitting, Elena did not forward it. She opened a new tab, looked for the original source, and waited.</p>
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
          "The author describes several ways social media changes news habits, then explains why readers must verify before sharing.",
          "The author argues that traditional newspapers are always more accurate than online sources because editors check every claim.",
          "The author tells a story about one student who believed a rumor and then compares that event to a chart about habits.",
          "The author lists only the dangers of social media in order to prove that students should avoid reading news online."
        ],
        correctIndex: 0,
        standards: ["7.P.EICC.3", "7.T.T.2.a", "7.T.SS.1.a"],
        skills: ["central-idea", "expository-techniques", "text-structure", "passage-1", "mcq", "dok3"]
      },
      {
        id: 2,
        type: "mcq",
        linkedPassage: 2,
        stem: "Which summary best captures how Elena changes from the beginning to the end of Passage 2?",
        instructions: "Choose the best answer.",
        options: [
          "Elena first trusts @WestbrookBuzz, but by the end she decides the account should be removed from social media.",
          "Elena begins by nearly sharing the rumor, but she learns to pause, check sources, and correct misinformation carefully.",
          "Elena starts by ignoring the post, but Ms. Patel convinces her to share the correction with every student at school.",
          "Elena believes the dance is canceled until Tasha proves that the school website is usually wrong."
        ],
        correctIndex: 1,
        standards: ["7.P.EICC.3.d", "7.T.T.1.a", "7.T.T.1.c"],
        skills: ["summarizing", "character-development", "theme-development", "passage-2", "mcq", "dok3"]
      },
      {
        id: 3,
        type: "mcq",
        linkedPassage: 1,
        stem: "How does the chart in Passage 1 deepen the reader’s understanding of social media news habits?",
        instructions: "Choose the best answer.",
        options: [
          "It proves that checking sources is the only habit with a benefit and that all other habits should be avoided.",
          "It organizes habits by showing that the same action can have a useful side and a risk depending on how readers use it.",
          "It ranks the habits from most harmful to least harmful so readers know which behavior matters most.",
          "It gives examples of school rumors so readers can compare them to Elena’s experience in Passage 2."
        ],
        correctIndex: 1,
        standards: ["7.T.C.1.b", "7.T.T.2.a", "7.T.SS.1.a"],
        skills: ["text-features", "analyze-structure", "critical-thinking", "passage-1", "mcq", "dok3"]
      },
      {
        id: 4,
        type: "mcq",
        linkedPassage: 2,
        stem: "Which interpretation of the rumor in Passage 2 is best supported by the whole passage?",
        instructions: "Choose the best answer.",
        options: [
          "The rumor spreads because students are intentionally trying to mislead classmates about the dance.",
          "The rumor becomes believable because it contains a real change but leaves out important context.",
          "The rumor is harmless because most students quickly recognize that the account is unofficial.",
          "The rumor matters mainly because Elena wants to prove that Tasha should not trust group chats."
        ],
        correctIndex: 1,
        standards: ["7.T.T.1.a", "7.T.T.1.c", "7.P.EICC.3.a"],
        skills: ["inference", "theme-development", "critical-thinking", "passage-2", "mcq", "dok3"]
      },
      {
        id: 5,
        type: "multi",
        linkedPassage: 1,
        stem: "Which details from Passage 1 most strongly support the idea that popularity is not the same as accuracy?",
        instructions: "Select exactly 3 answers.",
        options: [
          "A headline can travel through a group chat before a reader visits the original source.",
          "A large number of likes can make a claim feel trustworthy, but likes show reaction, not accuracy.",
          "People can hear from eyewitnesses and learn about issues ignored by larger outlets.",
          "Each share gives a questionable claim a larger audience before anyone has checked it carefully.",
          "Sharing because a friend shared it can treat popularity like proof."
        ],
        correctIndices: [1, 3, 4],
        minSelections: 3,
        maxSelections: 3,
        standards: ["7.T.T.2.a", "7.P.EICC.3.g", "7.T.C.2.b"],
        skills: ["text-evidence", "evaluate-claim", "details", "passage-1", "multi-select", "dok3"]
      },
      {
        id: 6,
        type: "multi",
        linkedPassage: 2,
        stem: "Which details best show that Elena uses evidence instead of reacting only to emotion?",
        instructions: "Select exactly 3 answers.",
        options: [
          "She notices that the caption mentions the gym but the photo shows the soccer field.",
          "She checks whether @WestbrookBuzz is the school’s official account.",
          "She feels tempted to tap the share button while standing in the cafeteria line.",
          "She checks the school website before posting a correction.",
          "She sees shocked-face emojis and angry comments under the post."
        ],
        correctIndices: [0, 1, 3],
        minSelections: 3,
        maxSelections: 3,
        standards: ["7.T.T.1.a", "7.P.EICC.3.f", "7.T.C.2.b"],
        skills: ["text-evidence", "inference", "characterization", "passage-2", "multi-select", "dok3"]
      },
      {
        id: 7,
        type: "mcq",
        linkedPassage: 1,
        stem: "In paragraph 3 of Passage 1, what does the phrase narrow information stream suggest?",
        instructions: "Choose the best answer.",
        options: [
          "A feed may become limited, showing a reader similar views while leaving out other useful information.",
          "A platform removes all untrue posts before a reader has a chance to see them.",
          "A student can read only short articles because social media posts are too brief for complex ideas.",
          "A news source becomes easier to trust when many friends share the same type of story."
        ],
        correctIndex: 0,
        standards: ["7.L.V.3.b", "7.T.SS.2.a"],
        skills: ["vocabulary-in-context", "connotation", "author-meaning", "passage-1", "mcq", "dok3"]
      },
      {
        id: 8,
        type: "mcq",
        linkedPassage: 2,
        stem: "What does Ms. Patel mean when she says, “let’s slow the story down”?",
        instructions: "Choose the best answer.",
        options: [
          "She wants students to stop talking so she can punish the person who started the rumor.",
          "She wants students to delay the dance announcement until every class has discussed the post.",
          "She wants students to examine the claim, evidence, and missing information before responding.",
          "She wants students to avoid social media completely whenever a post includes school colors."
        ],
        correctIndex: 2,
        standards: ["7.L.V.3.b", "7.T.SS.2.a", "7.T.T.1.c"],
        skills: ["vocabulary-in-context", "author-meaning", "theme-development", "passage-2", "mcq", "dok3"]
      },
      {
        id: 9,
        type: "order",
        linkedPassage: 2,
        stem: "Order the events that best show how the class moves from rumor to verification.",
        instructions: "Drag and drop from first to last.",
        items: [
          { id: "o3", text: "The class compares the rumor with the school’s actual announcement." },
          { id: "o1", text: "Students see and share a post claiming that the spring dance is canceled." },
          { id: "o4", text: "Elena posts a correction explaining that the dance moved locations." },
          { id: "o2", text: "Ms. Patel asks students to identify the claim, evidence, and missing information." }
        ],
        correctOrder: ["o1", "o2", "o3", "o4"],
        standards: ["7.T.T.1.a", "7.T.T.1.b", "7.T.SS.1.a"],
        skills: ["plot-structure", "cause-effect", "text-structure", "passage-2", "order", "dok3"]
      },
      {
        id: 10,
        type: "match",
        linkedPassage: 1,
        stem: "Match each social media news habit with the deeper risk explained in Passage 1.",
        instructions: "Match the items correctly.",
        left: [
          { id: "m1", text: "Reading only a headline" },
          { id: "m2", text: "Trusting a post because many people liked it" },
          { id: "m3", text: "Following mostly similar accounts" }
        ],
        right: [
          { id: "r1", text: "It may make reaction feel like proof." },
          { id: "r2", text: "It may hide context, evidence, or updates." },
          { id: "r3", text: "It may limit exposure to other perspectives." }
        ],
        pairs: { m1: "r2", m2: "r1", m3: "r3" },
        standards: ["7.T.C.1.b", "7.T.T.2.a", "7.P.EICC.3.c"],
        skills: ["cause-effect", "text-features", "inference", "matching", "passage-1", "dok3"]
      },
      {
        id: 11,
        type: "highlight",
        linkedPassage: 1,
        stem: "Which TWO sentences from Passage 1 best support the inference that readers must evaluate posts actively instead of accepting them passively?",
        instructions: "Select exactly 2 sentences.",
        sentences: [
          { id: "h1", text: "For many people, news no longer arrives mainly through a newspaper on the porch or a scheduled evening broadcast.", correct: false },
          { id: "h2", text: "A reader still has to ask who created the information, what evidence is included, and whether another reliable source reports the same thing.", correct: true },
          { id: "h3", text: "Social media also changes the way readers judge credibility.", correct: false },
          { id: "h4", text: "Instead of asking only, “Did I see this post?” a careful reader asks, “Where did this come from, what is missing, and what should I check before I share?”", correct: true },
          { id: "h5", text: "This can help people find stories related to their interests.", correct: false }
        ],
        minSelections: 2,
        maxSelections: 2,
        standards: ["7.T.T.2.a", "7.P.EICC.3.f", "7.T.C.2.b"],
        skills: ["text-evidence", "inference", "highlight", "passage-1", "dok3"]
      },
      {
        id: 12,
        type: "highlight",
        linkedPassage: 2,
        stem: "Which TWO details from Passage 2 best show that the rumor is partly true but misleading?",
        instructions: "Select exactly 2 sentences.",
        sentences: [
          { id: "h1", text: "The post looked official because it used the school colors and included a photo of the gym doors.", correct: false },
          { id: "h2", text: "Elena checked the school website and saw a short announcement: the dance was still scheduled, but the location had been moved to the cafeteria because the gym floor was being refinished.", correct: true },
          { id: "h3", text: "The room grew quieter as the class compared the rumor with the announcement.", correct: false },
          { id: "h4", text: "The post had not invented everything. There really was a change.", correct: true },
          { id: "h5", text: "Tasha replied with a shoe emoji and wrote, “Crisis paused.”", correct: false }
        ],
        minSelections: 2,
        maxSelections: 2,
        standards: ["7.T.T.1.a", "7.P.EICC.3.f", "7.T.C.2.b"],
        skills: ["text-evidence", "inference", "highlight", "passage-2", "dok3"]
      },
      {
        id: 13,
        type: "partAB",
        linkedPassage: 1,
        stem: "Answer Part A and Part B using Passage 1.",
        instructions: "Choose the best answer for each part.",
        partA: {
          stem: "Which claim does the author make about social media and news?",
          options: [
            "Social media can be useful, but it requires readers to check context and evidence before sharing.",
            "Social media is less popular than traditional news because readers prefer scheduled broadcasts.",
            "Social media platforms show every user the same news so communities share common facts.",
            "Social media posts are usually checked by editors before they reach a large audience."
          ],
          correctIndex: 0
        },
        partB: {
          stem: "Which evidence from Passage 1 best supports the answer to Part A?",
          options: [
            "The author says social media can help people hear from eyewitnesses, but careful readers should ask what is missing and what to check before sharing.",
            "The author explains that many people used to get news from newspapers or evening broadcasts.",
            "The chart says reading only the headline can help people quickly notice a topic.",
            "The author gives an example of a student clicking dramatic headlines about school rules."
          ],
          correctIndex: 0
        },
        standards: ["7.T.T.2.a", "7.T.C.2.b", "7.P.EICC.3.d"],
        skills: ["claim", "evidence", "author-purpose", "partAB", "passage-1", "dok3"]
      },
      {
        id: 14,
        type: "partAB",
        linkedPassage: 2,
        stem: "Answer Part A and Part B using Passage 2.",
        instructions: "Choose the best answer for each part.",
        partA: {
          stem: "Which theme is most strongly developed in Passage 2?",
          options: [
            "Correcting misinformation is impossible once a post becomes popular.",
            "A careful pause can prevent a quick reaction from spreading a mistake.",
            "School rumors are usually harmless when students share them with friends.",
            "Unofficial accounts should be trusted when they use familiar colors."
          ],
          correctIndex: 1
        },
        partB: {
          stem: "Which detail best supports the answer to Part A?",
          options: [
            "Elena almost shares the post, then checks the account, the image, and the school website before correcting the rumor.",
            "The post appears on almost every phone at Westbrook Middle School by lunch.",
            "Tasha groans because she has already bought shoes for the spring dance.",
            "The correction gets fewer reactions than the original rumor."
          ],
          correctIndex: 0
        },
        standards: ["7.T.T.1.c", "7.T.T.1.a", "7.P.EICC.3.d"],
        skills: ["theme", "text-evidence", "characterization", "partAB", "passage-2", "dok3"]
      },
      {
        id: 15,
        type: "classify",
        linkedPassage: null,
        stem: "Classify each detail based on whether it mainly shows a benefit of social media news, a risk of social media news, or a verification strategy.",
        instructions: "Place each item into the best category.",
        categories: [
          { id: "benefit", label: "Benefit" },
          { id: "risk", label: "Risk" },
          { id: "verify", label: "Verification Strategy" }
        ],
        items: [
          { id: "c1", text: "People can learn quickly about emergencies or local events.", categoryId: "benefit" },
          { id: "c2", text: "A claim can gain a large audience before anyone checks it.", categoryId: "risk" },
          { id: "c3", text: "Readers can compare a post with the original source.", categoryId: "verify" },
          { id: "c4", text: "A feed may show mostly similar opinions over time.", categoryId: "risk" },
          { id: "c5", text: "Eyewitness voices can reach people outside a local area.", categoryId: "benefit" },
          { id: "c6", text: "Readers can ask who created the information and what evidence is included.", categoryId: "verify" }
        ],
        standards: ["7.T.C.1.b", "7.T.C.2.b", "7.P.EICC.3.c"],
        skills: ["classify", "synthesize", "compare-sources", "critical-thinking", "dok4"]
      },
      {
        id: 16,
        type: "mcq",
        linkedPassage: null,
        stem: "Which statement best synthesizes the message of both passages?",
        instructions: "Use both passages. Choose the best answer.",
        options: [
          "Social media makes information easier to find, but readers need verification habits because speed and popularity can distort the truth.",
          "Social media spreads rumors mainly because students enjoy drama more than they enjoy accurate information.",
          "Official websites should replace all social media because online posts never provide useful community information.",
          "Readers can avoid misinformation by sharing only posts that include school colors, photos, or many comments."
        ],
        correctIndex: 0,
        standards: ["7.P.EICC.3", "7.T.T.2.b", "7.T.C.2.b"],
        skills: ["synthesis", "compare-passages", "central-idea", "both-passages", "mcq", "dok4"]
      },
      {
        id: 17,
        type: "mcq",
        linkedPassage: 2,
        stem: "Which best describes the tone of the final paragraph of Passage 2?",
        instructions: "Choose the best answer.",
        options: [
          "Cautious and reflective, because Elena recognizes how easily a mistake can spread and changes her behavior.",
          "Angry and blaming, because Elena believes one student intentionally misled the whole grade.",
          "Humorous and carefree, because Elena decides school rumors are usually entertaining.",
          "Confused and doubtful, because Elena no longer knows whether any school announcement can be trusted."
        ],
        correctIndex: 0,
        standards: ["7.T.SS.2.a", "7.T.T.1.c"],
        skills: ["tone", "inference", "theme-development", "passage-2", "mcq", "dok3"]
      },
      {
        id: 18,
        type: "mcq",
        linkedPassage: 1,
        stem: "Which statement from Passage 1 is the strongest example of a claim that requires evidence rather than a simple fact?",
        instructions: "Choose the best answer.",
        options: [
          "A breaking story can spread to thousands of people within minutes because users do not need to wait for a full article or broadcast.",
          "In the past, many news stories were filtered by editors before publication.",
          "None of this means social media is useless for news.",
          "A headline can travel through a group chat, a repost, or a video caption."
        ],
        correctIndex: 2,
        standards: ["7.T.T.2.a", "7.T.C.2.b"],
        skills: ["claim", "fact-opinion", "critical-thinking", "passage-1", "mcq", "dok3"]
      },
      {
        id: 19,
        type: "match",
        linkedPassage: 2,
        stem: "Match each detail from Passage 2 with the conclusion a careful reader can draw from it.",
        instructions: "Match the items correctly.",
        left: [
          { id: "m1", text: "The photo shows the soccer field, not the gym." },
          { id: "m2", text: "The account is @WestbrookBuzz instead of the official school account." },
          { id: "m3", text: "The school website says the dance moved to the cafeteria." }
        ],
        right: [
          { id: "r1", text: "The source should be questioned." },
          { id: "r2", text: "The post’s visual evidence does not match its claim." },
          { id: "r3", text: "The accurate information changes the meaning of the rumor." }
        ],
        pairs: { m1: "r2", m2: "r1", m3: "r3" },
        standards: ["7.T.T.1.a", "7.P.EICC.3.c", "7.P.EICC.3.f"],
        skills: ["cause-effect", "inference", "matching", "passage-2", "dok3"]
      },
      {
        id: 20,
        type: "mcq",
        questionLabel: "Podcast",
        linkedPassage: null,
        media: {
          type: "audio",
          src: "../media/Why_you_share_news_without_reading.m4a",
          captions: "../media/Why_you_share_news_without_reading.vtt",
          label: "Podcast: Why You Share News Without Reading"
        },
        stem: "Which claim from the podcast is best supported by the idea that people may share news before reading the full story?",
        instructions: "Listen to the podcast. Choose the best answer.",
        options: [
          "Sharing without reading can spread incomplete or misleading information because the headline may not tell the whole story.",
          "People who share news without reading are always trying to trick others on purpose.",
          "Headlines usually include every important detail, so reading the full article rarely changes a reader’s understanding.",
          "News spreads slowly online because most users wait until experts confirm each post."
        ],
        correctIndex: 0,
        standards: ["7.P.EICC.3", "7.T.C.1.b", "7.T.C.2.b"],
        skills: ["multimedia-analysis", "evaluate-claim", "cause-effect", "podcast", "mcq", "dok3"]
      },
      {
        id: 21,
        type: "multi",
        questionLabel: "Podcast",
        linkedPassage: null,
        media: {
          type: "audio",
          src: "../media/Why_you_share_news_without_reading.m4a",
          captions: "../media/Why_you_share_news_without_reading.vtt",
          label: "Podcast: Why You Share News Without Reading"
        },
        stem: "Which TWO ideas from the podcast would best support a recommendation to read past the headline before sharing?",
        instructions: "Listen to the podcast. Select exactly 2 answers.",
        options: [
          "A headline can be written to create a fast emotional reaction.",
          "Every repost from a friend should be treated as confirmed evidence.",
          "Opening the original source can reveal context that the post or headline leaves out.",
          "Short posts are always more accurate than long articles because they are easier to understand.",
          "Sharing quickly is the best way to make sure a confusing story gets corrected."
        ],
        correctIndices: [0, 2],
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
          src: "../media/Why_you_share_news_without_reading.m4a",
          captions: "../media/Why_you_share_news_without_reading.vtt",
          label: "Podcast: Why You Share News Without Reading"
        },
        stem: "Answer Part A and Part B using the podcast.",
        instructions: "Listen carefully, then connect the speaker’s claim to supporting reasoning.",
        partA: {
          stem: "What is the speaker’s most reasonable purpose?",
          options: [
            "To explain why people may share news quickly and how that habit can spread misinformation",
            "To entertain listeners with a story about students arguing over a school dance",
            "To prove that all news on social media is fake and should be ignored",
            "To describe how newspapers were delivered before people used phones"
          ],
          correctIndex: 0
        },
        partB: {
          stem: "Which reasoning best supports the answer to Part A?",
          options: [
            "The speaker connects quick reactions, headlines, and sharing behavior to the risk of spreading claims without enough context.",
            "The speaker says that reliable sources are unnecessary when a post has many reactions.",
            "The speaker focuses only on school rules and does not discuss online sharing habits.",
            "The speaker argues that students should stop discussing news with friends."
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
          src: "../media/How_Shares_Without_Clicks_Spread_Fake_News.mp4",
          label: "Video: How Shares Without Clicks Spread Fake News"
        },
        stem: "How does the video’s explanation of shares without clicks help develop the idea that misinformation can spread quickly?",
        instructions: "Watch the video. Choose the best answer.",
        options: [
          "It shows that people may pass along a claim after reacting to a headline without checking the full source.",
          "It proves that fake news spreads only when professional reporters make mistakes.",
          "It argues that clicking every link is unnecessary because friends usually summarize articles correctly.",
          "It shows that misinformation disappears once a post receives enough comments."
        ],
        correctIndex: 0,
        standards: ["7.T.C.1.b", "7.T.SS.2.a", "7.P.EICC.3.c"],
        skills: ["visual-analysis", "multimedia-analysis", "inference", "video", "mcq", "dok3"]
      },
      {
        id: 24,
        type: "multi",
        questionLabel: "Video",
        linkedPassage: null,
        media: {
          type: "video",
          src: "../media/How_Shares_Without_Clicks_Spread_Fake_News.mp4",
          label: "Video: How Shares Without Clicks Spread Fake News"
        },
        stem: "Which TWO conclusions are best supported by the video’s message about sharing without clicking?",
        instructions: "Watch the video. Select exactly 2 answers.",
        options: [
          "A share can give a false or incomplete claim a larger audience before readers verify it.",
          "People should judge online news by whether the post uses dramatic images or bold text.",
          "Checking the source before sharing can slow the spread of misinformation.",
          "A post becomes accurate when enough people repeat it on different platforms.",
          "Users who do not click are always unable to understand complicated news stories."
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
          src: "../media/How_Shares_Without_Clicks_Spread_Fake_News.mp4",
          label: "Video: How Shares Without Clicks Spread Fake News"
        },
        stem: "Answer Part A and Part B using the video and both passages.",
        instructions: "Synthesize the multimedia source with the reading passages.",
        partA: {
          stem: "Which recommendation is best supported across the video and the passages?",
          options: [
            "Readers should pause before sharing, check the original source, and look for missing context.",
            "Readers should share quickly so incorrect posts can be corrected by other people later.",
            "Readers should trust a post when it uses official-looking colors, familiar photos, or many reactions.",
            "Readers should avoid all social media because online platforms never help people learn about current events."
          ],
          correctIndex: 0
        },
        partB: {
          stem: "Which evidence best supports the answer to Part A?",
          options: [
            "The video shows the risk of sharing without clicking; Passage 1 explains verification questions; Passage 2 shows Elena checking the school website before posting.",
            "The video says headlines are always wrong; Passage 1 says social media has no benefits; Passage 2 shows Elena ignoring official sources.",
            "The video focuses on school announcements; Passage 1 describes newspapers; Passage 2 shows Tasha buying shoes for the dance.",
            "The video claims reposts are harmless; Passage 1 argues popularity is proof; Passage 2 shows the original rumor was completely false."
          ],
          correctIndex: 0
        },
        standards: ["7.P.EICC.3", "7.T.T.2.b", "7.T.C.2.b"],
        skills: ["synthesize", "compare-sources", "multimedia-analysis", "text-evidence", "video", "two-part", "dok4"]
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