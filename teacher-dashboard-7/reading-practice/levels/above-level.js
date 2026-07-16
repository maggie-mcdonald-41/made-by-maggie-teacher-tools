// levels/above-level.js
// 7th Grade above-level content bundle: passages + questions + sets
// Topic: Gandhi's Salt March, nonviolent protest, and historical fiction

window.READING_LEVEL = {
  id: "above",
  label: "Above Grade Level",

  passages: {
    1: {
      title: "The Salt March and the Power of Nonviolent Protest",
      html: `
        <h2 class="passage-title">The Salt March and the Power of Nonviolent Protest</h2>
        <p class="passage-lexile"><em>Estimated Lexile Level: 1040L–1130L</em></p>

        <p><span class="para-num">1</span> In 1930, many people in India were living under British colonial rule. British laws controlled parts of daily life, including the production and sale of salt. Salt may seem like a small item, but it was necessary for preserving food, surviving heat, and cooking meals. Because the British government controlled the salt supply and taxed it, even poor families had to pay for something they could have collected or made themselves. Mohandas Gandhi recognized that this ordinary mineral could become a powerful symbol of unfair rule.</p>

        <p><span class="para-num">2</span> Gandhi did not choose salt because it was dramatic. He chose it because almost everyone understood it. Wealthy merchants, farmers, workers, and children all needed salt. By challenging the salt law, Gandhi created a protest that could include people from many regions and social classes. His strategy depended on <em>civil disobedience</em>, which means openly refusing to obey an unjust law while accepting the consequences. For Gandhi, nonviolent protest was not weakness. It was a way to expose injustice without giving opponents an excuse to dismiss the movement as disorderly or violent.</p>

        <table class="passage-table salt-march-chart">
          <caption>How Gandhi Turned Salt into a Protest Strategy</caption>
          <thead>
            <tr>
              <th>Choice</th>
              <th>Strategic Purpose</th>
              <th>Possible Effect</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Using salt as the issue</td>
              <td>Focused on something ordinary people needed</td>
              <td>Made the protest easy for many Indians to understand</td>
            </tr>
            <tr>
              <td>Walking publicly to the sea</td>
              <td>Turned resistance into a visible journey</td>
              <td>Gave newspapers and witnesses time to follow the story</td>
            </tr>
            <tr>
              <td>Breaking the law nonviolently</td>
              <td>Challenged British authority without physical attack</td>
              <td>Made harsh punishment look unreasonable to observers</td>
            </tr>
            <tr>
              <td>Inviting ordinary people to participate</td>
              <td>Made protest feel possible beyond political leaders</td>
              <td>Expanded the independence movement across communities</td>
            </tr>
          </tbody>
        </table>

        <p><span class="para-num">3</span> On March 12, 1930, Gandhi and a small group of followers left Sabarmati Ashram and began walking toward the coastal village of Dandi. The journey covered about 240 miles and took more than three weeks. Along the way, Gandhi spoke in villages and drew more attention to the salt law. The march was slow by design. Each day gave people time to hear about the protest, discuss its meaning, and decide whether they would join or support it. By the time Gandhi reached the coast in early April, the march had become a national and international story.</p>

        <p><span class="para-num">4</span> At Dandi, Gandhi picked up salty mud and made salt, deliberately breaking British law. The act itself was simple, but its meaning was not. It showed that a government could control armies, courts, and prisons, yet still struggle against people who refused to cooperate with an unjust rule. Across India, others made salt, sold illegal salt, joined marches, or participated in boycotts. British officials arrested tens of thousands of people, including Gandhi. Those arrests did not end the movement. Instead, they made the conflict more visible.</p>

        <p><span class="para-num">5</span> The Salt March did not immediately bring Indian independence. India would not become independent until 1947. Still, the march changed the independence movement by giving ordinary people a concrete way to participate and by showing the world the power of disciplined, nonviolent resistance. It also demonstrated a larger lesson about protest: a small action can become historically important when it reveals a larger injustice and invites people to act together.</p>
      `
    },

    2: {
      title: "A Handful of Salt",
      html: `
        <h2 class="passage-title">A Handful of Salt</h2>
        <p class="passage-lexile"><em>Estimated Lexile Level: 1050L–1140L</em></p>
        <p class="passage-note"><em>Historical fiction inspired by the Salt March of 1930.</em></p>

        <p><span class="para-num">1</span> The morning Bapu reached the sea, my mother woke me before the birds did. “Mira,” she whispered, “if you want to remember this day, you must see it while the sky is still gray.” I rubbed sleep from my eyes and followed her through the sand, where thousands of footprints crossed one another like lines in an unfinished letter. All around us, people waited quietly. They had walked for days, some for weeks. I had walked only from our village, yet even my legs felt full of stones.</p>

        <p><span class="para-num">2</span> At first, I did not understand how salt could frighten an empire. Salt sat in clay bowls. Salt dried fish. Salt stung the cracked skin near my fingernails. It was too common to be dangerous. But Father had explained the law the night before while he mended his sandals. “When a ruler can tax the salt in your food,” he said, pulling the thread tight, “he is not only taxing your coin. He is taxing your breath.” I had laughed because the sentence sounded like poetry. Father did not laugh back.</p>

        <p><span class="para-num">3</span> Gandhi appeared smaller than I expected. People had spoken of him as if he were taller than the palms, but he was a thin man with a walking stick and tired feet. That made the silence around him more surprising. No drumbeat ordered us to listen. No soldier forced us to stand still. Yet when he bent toward the shore, the crowd leaned with him, as if every person had become part of the same breath.</p>

        <p><span class="para-num">4</span> He lifted a lump of salty mud. For a moment, nothing happened. The sea kept folding itself onto the sand. A child coughed. Someone behind me began to cry, though I could not tell whether from joy or fear. Then the whisper moved through the crowd: the law had been broken. Not with a sword. Not with a stone. With a handful of earth that belonged to everyone and no one.</p>

        <figure class="passage-figure gandhi-figure">
          <img class="passage-image gandhi-image" src="../media/gandhi.png" alt="Illustration of Gandhi and others during the Salt March.">
          <figcaption>Gandhi’s simple act of making salt helped turn an ordinary object into a symbol of resistance.</figcaption>
        </figure>

        <p><span class="para-num">5</span> Later, men in uniforms would come. We knew this without being told. Mother pressed my shoulder when people began shouting, not to silence me but to steady me. “Remember,” she said, “courage is not always loud.” I watched an old woman beside us scoop mud into the corner of her sari. Her hands trembled, but she did not drop it. I wondered whether the British officers would see a criminal or a grandmother.</p>

        <p><span class="para-num">6</span> That evening, Father placed a pinch of homemade salt on my palm. It looked ordinary again, a scatter of white grains against my skin. But I could no longer see it as small. I thought of the footprints on the beach, the bent backs, the waiting silence, the law cracking open without a single fist raised. I closed my fingers around the salt carefully, as if I were holding a piece of the sea.</p>
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
          "The author argues that the Salt March succeeded because it ended British rule immediately after Gandhi reached Dandi.",
          "The author explains how Gandhi chose an ordinary item, used a public march, and turned nonviolent lawbreaking into a visible challenge to British authority.",
          "The author focuses mostly on Gandhi’s childhood to show why he was personally interested in salt and food preservation.",
          "The author compares several unrelated protests to prove that all independence movements use the same strategy."
        ],
        correctIndex: 1,
        standards: ["7.P.EICC.3", "7.T.T.2.a", "7.T.SS.1.a"],
        skills: ["central-idea", "expository-techniques", "text-structure", "passage-1", "mcq", "dok3"]
      },
      {
        id: 2,
        type: "mcq",
        linkedPassage: 2,
        stem: "Which summary best captures Mira’s changing understanding in Passage 2?",
        instructions: "Choose the best answer.",
        options: [
          "Mira wants to join the march, but she becomes disappointed when Gandhi appears smaller than she imagined.",
          "Mira is afraid of the crowd at first, but she becomes confident when soldiers decide not to arrest anyone.",
          "Mira begins by seeing salt as ordinary, but she comes to understand it as a symbol of shared resistance.",
          "Mira thinks the protest is exciting, but by evening she decides that small acts cannot affect powerful governments."
        ],
        correctIndex: 2,
        standards: ["7.P.EICC.3.d", "7.T.T.1.a", "7.T.T.1.c"],
        skills: ["summarizing", "character-development", "theme-development", "passage-2", "mcq", "dok3"]
      },
      {
        id: 3,
        type: "mcq",
        linkedPassage: 1,
        stem: "How does the chart in Passage 1 add to the reader’s understanding of Gandhi’s strategy?",
        instructions: "Choose the best answer.",
        options: [
          "It separates Gandhi’s choices from their purposes and effects, helping readers see the protest as carefully planned rather than symbolic only.",
          "It shows that Gandhi’s supporters disagreed about whether salt or newspapers should be the focus of the march.",
          "It proves that every British law in India could be changed by using exactly the same protest method.",
          "It gives fictional details that help readers imagine how Mira felt when Gandhi reached the sea."
        ],
        correctIndex: 0,
        standards: ["7.T.C.1.b", "7.T.T.2.a", "7.T.SS.1.a"],
        skills: ["text-features", "analyze-structure", "critical-thinking", "passage-1", "mcq", "dok3"]
      },
      {
        id: 4,
        type: "mcq",
        linkedPassage: 2,
        stem: "Which interpretation of the salt in Passage 2 is best supported by the whole narrative?",
        instructions: "Choose the best answer.",
        options: [
          "Salt represents Mira’s wish to leave her village and travel with Gandhi after the march ends.",
          "Salt mainly represents the danger of the sea because Mira describes the shore and salty mud.",
          "Salt represents money because Father explains that British laws affected coins and trade.",
          "Salt becomes a symbol of ordinary people claiming dignity through a small but deliberate act."
        ],
        correctIndex: 3,
        standards: ["7.T.T.1.a", "7.T.T.1.c", "7.P.EICC.3.a"],
        skills: ["symbolism", "inference", "theme-development", "passage-2", "mcq", "dok3"]
      },
      {
        id: 5,
        type: "multi",
        linkedPassage: 1,
        stem: "Which details from Passage 1 most strongly support the idea that Gandhi chose salt because it could unite many different people?",
        instructions: "Select exactly 3 answers.",
        options: [
          "Salt was necessary for preserving food, surviving heat, and cooking meals.",
          "The march began at Sabarmati Ashram and ended near the coastal village of Dandi.",
          "Wealthy merchants, farmers, workers, and children all needed salt.",
          "British officials arrested tens of thousands of people, including Gandhi.",
          "By challenging the salt law, Gandhi created a protest that could include people from many regions and social classes."
        ],
        correctIndices: [0, 2, 4],
        minSelections: 3,
        maxSelections: 3,
        standards: ["7.T.T.2.a", "7.P.EICC.3.g", "7.T.C.2.b"],
        skills: ["text-evidence", "details", "claim-support", "passage-1", "multi-select", "dok3"]
      },
      {
        id: 6,
        type: "multi",
        linkedPassage: 2,
        stem: "Which details best show that the narrative emphasizes quiet courage instead of dramatic violence?",
        instructions: "Select exactly 3 answers.",
        options: [
          "Mira says her legs felt full of stones after walking from her village.",
          "Gandhi breaks the law with a handful of salty mud rather than a weapon.",
          "Mother tells Mira that courage is not always loud.",
          "Father mends his sandals while explaining the salt law.",
          "An old woman’s hands tremble, but she still gathers salty mud."
        ],
        correctIndices: [1, 2, 4],
        minSelections: 3,
        maxSelections: 3,
        standards: ["7.T.T.1.a", "7.P.EICC.3.f", "7.T.C.2.b"],
        skills: ["text-evidence", "theme", "characterization", "passage-2", "multi-select", "dok3"]
      },
      {
        id: 7,
        type: "mcq",
        linkedPassage: 1,
        stem: "In paragraph 2 of Passage 1, what does civil disobedience mean in the context of the Salt March?",
        instructions: "Choose the best answer.",
        options: [
          "Secretly avoiding a law while trying not to be noticed by government officials",
          "Using speeches only, without taking any action that challenges government rules",
          "Openly refusing to follow an unjust law while accepting the consequences",
          "Voting to replace a law through the official system of colonial courts"
        ],
        correctIndex: 2,
        standards: ["7.L.V.3.b", "7.T.SS.2.a"],
        skills: ["vocabulary-in-context", "concept-development", "author-meaning", "passage-1", "mcq", "dok3"]
      },
      {
        id: 8,
        type: "mcq",
        linkedPassage: 2,
        stem: "What is the effect of Father’s statement, “he is not only taxing your coin. He is taxing your breath”?",
        instructions: "Choose the best answer.",
        options: [
          "It shows that the salt law feels deeply personal because salt is connected to daily survival, not just money.",
          "It proves that Father believes poetry is more useful than political action.",
          "It suggests that Mira’s family is more worried about cooking than about British rule.",
          "It explains that the British government literally charged people for breathing near the sea."
        ],
        correctIndex: 0,
        standards: ["7.L.V.3.b", "7.T.SS.2.a", "7.T.T.1.c"],
        skills: ["figurative-language", "inference", "theme-development", "passage-2", "mcq", "dok3"]
      },
      {
        id: 9,
        type: "order",
        linkedPassage: 1,
        stem: "Order the events that show how the Salt March became a larger act of resistance.",
        instructions: "Drag and drop from first to last.",
        items: [
          { id: "o3", text: "Gandhi reaches Dandi and deliberately makes salt." },
          { id: "o1", text: "Gandhi chooses the salt law as a symbol of unfair rule." },
          { id: "o4", text: "People across India make salt, boycott, march, and face arrests." },
          { id: "o2", text: "Gandhi and his followers walk publicly from Sabarmati toward the coast." }
        ],
        correctOrder: ["o1", "o2", "o3", "o4"],
        standards: ["7.T.T.2.a", "7.T.T.1.b", "7.T.SS.1.a"],
        skills: ["chronological-order", "cause-effect", "text-structure", "passage-1", "order", "dok3"]
      },
      {
        id: 10,
        type: "match",
        linkedPassage: 1,
        stem: "Match each strategic choice from Passage 1 with the reason it mattered.",
        instructions: "Match the items correctly.",
        left: [
          { id: "m1", text: "Choosing salt" },
          { id: "m2", text: "Walking slowly and publicly" },
          { id: "m3", text: "Using nonviolent lawbreaking" }
        ],
        right: [
          { id: "r1", text: "It made punishment appear harsh to outside observers." },
          { id: "r2", text: "It gave people time to hear about and join the protest." },
          { id: "r3", text: "It connected the protest to a daily need shared by many people." }
        ],
        pairs: { m1: "r3", m2: "r2", m3: "r1" },
        standards: ["7.T.C.1.b", "7.T.T.2.a", "7.P.EICC.3.c"],
        skills: ["cause-effect", "text-features", "inference", "matching", "passage-1", "dok3"]
      },
      {
        id: 11,
        type: "highlight",
        linkedPassage: 1,
        stem: "Which TWO sentences from Passage 1 best support the inference that the Salt March was designed to be understandable and participatory?",
        instructions: "Select exactly 2 sentences.",
        sentences: [
          { id: "h1", text: "Gandhi did not choose salt because it was dramatic.", correct: false },
          { id: "h2", text: "He chose it because almost everyone understood it.", correct: true },
          { id: "h3", text: "By challenging the salt law, Gandhi created a protest that could include people from many regions and social classes.", correct: true },
          { id: "h4", text: "At Dandi, Gandhi picked up salty mud and made salt, deliberately breaking British law.", correct: false },
          { id: "h5", text: "India would not become independent until 1947.", correct: false }
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
        stem: "Which TWO details from Passage 2 best reveal Mira’s realization that the act of making salt has a larger meaning?",
        instructions: "Select exactly 2 sentences.",
        sentences: [
          { id: "h1", text: "I had walked only from our village, yet even my legs felt full of stones.", correct: false },
          { id: "h2", text: "At first, I did not understand how salt could frighten an empire.", correct: false },
          { id: "h3", text: "Then the whisper moved through the crowd: the law had been broken.", correct: true },
          { id: "h4", text: "But I could no longer see it as small.", correct: true },
          { id: "h5", text: "Father placed a pinch of homemade salt on my palm.", correct: false }
        ],
        minSelections: 2,
        maxSelections: 2,
        standards: ["7.T.T.1.a", "7.P.EICC.3.f", "7.T.C.2.b"],
        skills: ["text-evidence", "character-development", "highlight", "passage-2", "dok3"]
      },
      {
        id: 13,
        type: "partAB",
        linkedPassage: 1,
        stem: "Answer Part A and Part B using Passage 1.",
        instructions: "Choose the best answer for each part.",
        partA: {
          stem: "Which claim does the author make about the Salt March?",
          options: [
            "The march was mostly symbolic and had little effect because independence came later.",
            "The march succeeded because British officials chose not to arrest protesters.",
            "The march revealed injustice by turning an ordinary need into a visible, nonviolent challenge.",
            "The march was important because it replaced all other forms of Indian nationalism."
          ],
          correctIndex: 2
        },
        partB: {
          stem: "Which evidence from Passage 1 best supports the answer to Part A?",
          options: [
            "Gandhi and a small group of followers left Sabarmati Ashram on March 12, 1930.",
            "The author explains that salt was necessary to many people and that making it at Dandi deliberately broke British law.",
            "The journey covered about 240 miles and took more than three weeks.",
            "India would not become independent until 1947."
          ],
          correctIndex: 1
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
            "A quiet act can carry great power when people understand what it represents.",
            "A child can understand history only after adults explain every political detail.",
            "A leader must appear physically impressive in order to inspire a crowd.",
            "A law is fair when it is difficult for ordinary people to challenge."
          ],
          correctIndex: 0
        },
        partB: {
          stem: "Which detail best supports the answer to Part A?",
          options: [
            "Mira follows her mother through the sand before the birds have begun making noise.",
            "Mira notices that Gandhi appears smaller than she expected when he reaches the sea.",
            "The law is broken with a handful of earth, and Mira later sees the salt as no longer small.",
            "Father mends his sandals before explaining the law to Mira."
          ],
          correctIndex: 2
        },
        standards: ["7.T.T.1.c", "7.T.T.1.a", "7.P.EICC.3.d"],
        skills: ["theme", "symbolism", "text-evidence", "partAB", "passage-2", "dok3"]
      },
      {
        id: 15,
        type: "classify",
        linkedPassage: null,
        stem: "Classify each detail based on whether it mainly shows historical context, protest strategy, or fictional craft.",
        instructions: "Place each item into the best category.",
        categories: [
          { id: "context", label: "Historical Context" },
          { id: "strategy", label: "Protest Strategy" },
          { id: "craft", label: "Fictional Craft" }
        ],
        items: [
          { id: "c1", text: "British laws controlled the production and sale of salt.", categoryId: "context" },
          { id: "c2", text: "Gandhi chose an issue many people understood.", categoryId: "strategy" },
          { id: "c3", text: "Mira describes footprints as lines in an unfinished letter.", categoryId: "craft" },
          { id: "c4", text: "India remained under British colonial rule in 1930.", categoryId: "context" },
          { id: "c5", text: "The march moved slowly so the story could spread.", categoryId: "strategy" },
          { id: "c6", text: "The narrative uses Mira’s changing view of salt to develop symbolism.", categoryId: "craft" }
        ],
        standards: ["7.T.C.1.b", "7.T.C.2.b", "7.P.EICC.3.c"],
        skills: ["classify", "synthesize", "compare-sources", "critical-thinking", "dok4"]
      },
      {
        id: 16,
        type: "mcq",
        linkedPassage: null,
        stem: "Which statement best synthesizes a shared idea from both passages?",
        instructions: "Use both passages. Choose the best answer.",
        options: [
          "The Salt March mattered because it made salt more affordable for Indian families immediately.",
          "The Salt March shows that historical change depends more on powerful leaders than on ordinary people.",
          "The Salt March was important mainly because it was the first protest against British rule in India.",
          "The Salt March turned a common object into a symbol that helped ordinary people understand and join a larger movement."
        ],
        correctIndex: 3,
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
          "Confused and uncertain, because Mira still does not understand why the protest matters.",
          "Reflective and reverent, because Mira treats the salt as a meaningful piece of the larger movement.",
          "Angry and impatient, because Mira wants the protest to become louder and more forceful.",
          "Playful and humorous, because Mira compares the sea to a small object in her hand."
        ],
        correctIndex: 1,
        standards: ["7.T.SS.2.a", "7.T.T.1.c"],
        skills: ["tone", "inference", "theme-development", "passage-2", "mcq", "dok3"]
      },
      {
        id: 18,
        type: "mcq",
        linkedPassage: 1,
        stem: "Which statement from Passage 1 is the strongest example of an interpretation rather than a simple historical fact?",
        instructions: "Choose the best answer.",
        options: [
          "On March 12, 1930, Gandhi and a small group of followers left Sabarmati Ashram.",
          "The journey covered about 240 miles and took more than three weeks.",
          "The Salt March changed the independence movement by giving ordinary people a concrete way to participate.",
          "Across India, others made salt, sold illegal salt, joined marches, or participated in boycotts."
        ],
        correctIndex: 2,
        standards: ["7.T.T.2.a", "7.T.C.2.b"],
        skills: ["claim", "fact-interpretation", "critical-thinking", "passage-1", "mcq", "dok3"]
      },
      {
        id: 19,
        type: "match",
        linkedPassage: 2,
        stem: "Match each fictional detail from Passage 2 with the effect it creates.",
        instructions: "Match the items correctly.",
        left: [
          { id: "m1", text: "Thousands of footprints cross like lines in an unfinished letter." },
          { id: "m2", text: "The crowd leans with Gandhi as if sharing one breath." },
          { id: "m3", text: "Mira closes her fingers around the salt carefully." }
        ],
        right: [
          { id: "r1", text: "It shows the crowd acting with shared attention and purpose." },
          { id: "r2", text: "It suggests Mira now understands the salt’s symbolic weight." },
          { id: "r3", text: "It hints that the protest is part of a larger story still being written." }
        ],
        pairs: { m1: "r3", m2: "r1", m3: "r2" },
        standards: ["7.T.T.1.a", "7.P.EICC.3.c", "7.T.SS.2.a"],
        skills: ["figurative-language", "inference", "matching", "passage-2", "dok3"]
      },
      {
        id: 20,
        type: "mcq",
        questionLabel: "Podcast",
        linkedPassage: null,
        media: {
          type: "audio",
          src: "../media/Salt_March_Podcast.m4a",
          captions: "../media/Salt_March_Podcast.vtt",
          label: "Podcast: The Salt March and Nonviolent Protest"
        },
        stem: "Which claim from the podcast best explains why Gandhi chose salt as the focus of the protest?",
        instructions: "Listen to the podcast. Choose the best answer.",
        options: [
          "Salt worked as a protest issue because the British monopoly affected a basic need shared by nearly everyone.",
          "Salt was useful because only political leaders understood why the British tax mattered.",
          "Gandhi chose salt because it allowed protesters to avoid breaking the law directly.",
          "The salt tax mattered mainly because it made spices harder for wealthy families to buy."
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
          src: "../media/Salt_March_Podcast.m4a",
          captions: "../media/Salt_March_Podcast.vtt",
          label: "Podcast: The Salt March and Nonviolent Protest"
        },
        stem: "Which TWO podcast details best support the idea that the Salt March became powerful because protesters accepted punishment without violence?",
        instructions: "Listen to the podcast. Select exactly 2 answers.",
        options: [
          "The podcast says Gandhi and 78 followers walked 240 miles to Dandi.",
          "The podcast explains that over 60,000 Indians were jailed.",
          "The podcast says protesters took punishment peacefully, which baffled British authorities.",
          "The podcast compares the salt monopoly to a school bully controlling a water fountain.",
          "The podcast says salt is not just a spice because people need it to survive."
        ],
        correctIndices: [1, 2],
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
          src: "../media/Salt_March_Podcast.m4a",
          captions: "../media/Salt_March_Podcast.vtt",
          label: "Podcast: The Salt March and Nonviolent Protest"
        },
        stem: "Answer Part A and Part B using the podcast.",
        instructions: "Listen carefully, then connect the speaker’s claim to supporting reasoning.",
        partA: {
          stem: "Which idea best captures the podcast’s message about the Salt March’s long-term impact?",
          options: [
            "The Salt March mattered because it gave later movements a model for peaceful resistance.",
            "The Salt March was successful because it ended the British Empire immediately.",
            "The Salt March showed that peaceful unity is less powerful than direct violence.",
            "The Salt March mattered mostly because it kept journalists from reporting on British actions."
          ],
          correctIndex: 0
        },
        partB: {
          stem: "Which podcast detail best supports the answer to Part A?",
          options: [
            "The speaker says journalists exposed cruelty toward peaceful protesters and that the same blueprint later inspired leaders like Martin Luther King Jr. and Nelson Mandela.",
            "The speaker explains that Gandhi and 78 followers walked to the coastal town of Dandi.",
            "The speaker says British officials had a strict monopoly on salt and taxed it heavily.",
            "The speaker compares the salt law to a bully charging students to drink from a water fountain."
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
          src: "../media/Salt_March_Video.mp4",
          label: "Video: How the Salt March Challenged an Empire"
        },
        stem: "How do the video’s map visuals of the route from Sabarmati Ashram to Dandi help develop the central idea?",
        instructions: "Watch the video. Choose the best answer.",
        options: [
          "They show that the march was a public, growing action that gave ordinary people time to join and witness the protest.",
          "They prove that the Salt March was successful only because Dandi was close to Sabarmati Ashram.",
          "They suggest that Gandhi’s followers were mostly interested in traveling to the Arabian Sea.",
          "They show that the British government supported Gandhi’s plan until the crowd became too large."
        ],
        correctIndex: 0,
        standards: ["7.T.C.1.b", "7.T.SS.2.a", "7.P.EICC.3.c"],
        skills: ["visual-analysis", "multimedia-analysis", "central-idea", "video", "mcq", "dok3"]
      },
      {
        id: 24,
        type: "multi",
        questionLabel: "Video",
        linkedPassage: null,
        media: {
          type: "video",
          src: "../media/Salt_March_Video.mp4",
          label: "Video: How the Salt March Challenged an Empire"
        },
        stem: "Which TWO conclusions are best supported by the video’s images and narration?",
        instructions: "Watch the video. Select exactly 2 answers.",
        options: [
          "The video presents salt as powerful because it was an everyday necessity connected to British control.",
          "The video suggests that Gandhi’s march gained strength as more people joined during the journey.",
          "The video shows that Gandhi defeated the British military through armed conflict.",
          "The video argues that the Salt March immediately won Indian independence.",
          "The video presents the arrests as proof that the protest had failed completely."
        ],
        correctIndices: [0, 1],
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
          src: "../media/Salt_March_Video.mp4",
          label: "Video: How the Salt March Challenged an Empire"
        },
        stem: "Answer Part A and Part B using the video and both passages.",
        instructions: "Synthesize the multimedia source with the reading passages.",
        partA: {
          stem: "Which statement best explains how the video contributes to the reader’s understanding of the Salt March?",
          options: [
            "The video makes the protest’s scale and consequences visible by showing the route, growing crowds, arrests, and nationwide illegal salt-making.",
            "The video is mainly useful because it gives fictional emotions that Passage 1 leaves out.",
            "The video proves that the Salt March mattered only because British officers arrested Gandhi at night.",
            "The video replaces Passage 1 because visuals alone explain why the salt law was unfair."
          ],
          correctIndex: 0
        },
        partB: {
          stem: "Which evidence best supports the answer to Part A?",
          options: [
            "The video shows a 240-mile route to Dandi, crowds swelling over time, police arrests, and a national wave of illegal salt-making.",
            "The video begins with Gandhi standing before soldiers and later shows the Arabian Sea.",
            "The video includes images of salt in hands and a pot of boiling seawater.",
            "The video says the Salt March did not win independence immediately, but it shattered British moral authority."
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