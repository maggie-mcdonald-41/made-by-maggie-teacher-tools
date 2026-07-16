// levels/below-level.js
// 8th Grade below-level content bundle: passages + questions + sets

window.READING_LEVEL = {
  id: "below",
  label: "Below Grade Level",

  passages: {
    1: {
      title: "Why Film Crews Come to Georgia",
      html: `
        <h2 class="passage-title">Why Film Crews Come to Georgia</h2>
        <p class="passage-lexile"><em>Estimated Lexile Level: 850L–940L</em></p>
        <p><span class="para-num">1</span> On some mornings in Georgia, an ordinary street can look very different. A row of trailers may line a parking lot. A restaurant may have a sign from a made-up town. A crew member may ask people to pause while a scene is filmed. For a few days, a familiar place can become part of a movie, television show, commercial, or music video.</p>
        <p><span class="para-num">2</span> Film companies choose Georgia for several reasons. The state has cities, small towns, mountains, forests, coastlines, farms, and historic buildings. A story that seems to happen in another place can often be filmed somewhere in Georgia. The state also has large studio spaces, experienced workers, and a climate that can make filming possible during many parts of the year.</p>
        <p><span class="para-num">3</span> Another reason is Georgia’s film tax credit. A tax credit lowers the amount of certain taxes a company owes if the company meets specific rules. In Georgia, approved productions can qualify for a credit when they spend enough money on production work in the state. This does not mean a neighborhood receives free money when a crew arrives. Instead, the tax credit is meant to encourage companies to choose Georgia instead of another filming location.</p>
        <p><span class="para-num">4</span> When a production films in a community, the effects can spread beyond the camera. A crew may rent equipment, pay local workers, use hotel rooms, order meals, hire security, or pay to use a building or property. These choices can help some businesses earn money. They can also introduce students to jobs they may not have considered, such as set design, lighting, sound, editing, makeup, transportation, and location scouting.</p>
        <table class="passage-table">
          <caption>How a Film Production May Connect to a Local Economy</caption>
          <thead>
            <tr><th>Production Need</th><th>Possible Local Connection</th></tr>
          </thead>
          <tbody>
            <tr><td>Meals for cast and crew</td><td>Restaurants or catering companies may provide food.</td></tr>
            <tr><td>Places to film</td><td>Homes, farms, businesses, or streets may be rented or used.</td></tr>
            <tr><td>People to support filming</td><td>Local workers may help with transportation, security, or setup.</td></tr>
            <tr><td>Visitors staying nearby</td><td>Hotels and shops may see more customers for a short time.</td></tr>
          </tbody>
        </table>
        <p><span class="para-num">5</span> Still, the impact is not the same for every person or every town. A business near a filming site might gain customers, while another business might lose customers if a road closes. A family might enjoy seeing a famous actor nearby, while another family might be frustrated by noise or traffic. For this reason, many communities try to plan carefully before a production begins.</p>
        <p><span class="para-num">6</span> Georgia’s film industry is more than red carpets and famous names. It is also connected to jobs, local businesses, transportation, tourism, and public planning. Understanding those connections helps people see why a film crew can be exciting and complicated at the same time.</p>
      `
    },
    2: {
      title: "Rolling Out the Red Carpet—Carefully",
      html: `
        <h2 class="passage-title">Rolling Out the Red Carpet—Carefully</h2>
        <p class="passage-lexile"><em>Estimated Lexile Level: 870L–960L</em></p>
        <figure class="passage-media-figure">
          <img src="../media/film.png" alt="Film production equipment representing Georgia's film industry" class="passage-image">
          <figcaption>Film productions can bring attention, spending, and planning challenges to Georgia communities.</figcaption>
        </figure>
        <p><span class="para-num">1</span> When a film production wants to work in a Georgia community, local leaders may feel excited. A movie or show can bring attention, visitors, and spending. However, excitement should not replace planning. Communities should welcome film productions only when clear rules protect residents, businesses, and public spaces.</p>
        <p><span class="para-num">2</span> Supporters of filming often point to the benefits. A production may buy meals from nearby restaurants, rent rooms from hotels, hire local workers, and bring customers to shops. A town can also gain a new kind of pride when people recognize a street, courthouse, park, or neighborhood on screen. Some visitors even travel to places where favorite shows or movies were filmed.</p>
        <p><span class="para-num">3</span> These benefits are real, but they do not erase the concerns. Filming can close streets, take up parking spaces, create noise, or make it harder for regular customers to reach businesses. Public workers may need to help with traffic and safety. If a community only focuses on the money a production might bring, it may ignore the people who live and work there every day.</p>
        <p><span class="para-num">4</span> A better approach is to make filming a partnership. Before a production begins, local leaders should share clear schedules, explain which streets or buildings will be affected, and give residents a way to ask questions. Productions should be encouraged to hire local workers when possible, clean up filming areas, and respect nearby homes and businesses.</p>
        <p><span class="para-num">5</span> Film productions can be good for Georgia communities, but they should not be treated like automatic wins. A production is helpful when the benefits are shared and the problems are managed. Rolling out the red carpet may be a smart choice, but only if communities also keep their eyes open.</p>
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
          "The author focuses mostly on famous actors, then explains why students should watch more movies filmed in Georgia.",
          "The author lists problems caused by film crews, then argues that Georgia should stop offering tax credits.",
          "The author explains why productions choose Georgia, then shows how filming can affect local businesses and communities.",
          "The author describes one movie set in detail, then compares that movie with other productions filmed in Georgia."
        ],
        correctIndex: 2,
        standards: ["8.T.T.2.a", "8.T.C.1.a", "8.T.SS.1.a"],
        skills: ["central-idea", "expository-techniques", "text-structure", "passage-1", "mcq", "dok3"]
      },
      {
        id: 2,
        type: "mcq",
        linkedPassage: 2,
        stem: "Which claim is most strongly developed in Passage 2?",
        instructions: "Choose the best answer.",
        options: [
          "Georgia communities should reject most film productions because the problems are greater than the benefits.",
          "Georgia communities can benefit from film productions, but they need clear planning to protect local people and businesses.",
          "Film productions help only large cities because small towns do not have the resources to manage visitors.",
          "Local leaders should let production companies make all decisions because filming usually lasts only a short time."
        ],
        correctIndex: 1,
        standards: ["8.T.T.3.a", "8.T.C.1.a", "8.P.AC.1.a"],
        skills: ["claim", "argument-structure", "purpose-audience", "passage-2", "mcq", "dok3"]
      },
      {
        id: 3,
        type: "mcq",
        linkedPassage: 1,
        stem: "How does the structure of Passage 1 help readers understand the topic?",
        instructions: "Choose the best answer.",
        options: [
          "It moves from a familiar filming scene to reasons productions choose Georgia and then to local effects.",
          "It begins with a personal problem and ends by showing how one character solves that problem.",
          "It presents two opposing arguments and then asks readers to decide which side is more credible.",
          "It uses only the table to explain the topic, while the paragraphs mainly provide background entertainment."
        ],
        correctIndex: 0,
        standards: ["8.T.SS.1.a", "8.T.T.2.a"],
        skills: ["text-structure", "organization", "purpose-audience", "passage-1", "mcq", "dok3"]
      },
      {
        id: 4,
        type: "mcq",
        linkedPassage: 2,
        stem: "Which sentence best describes the author’s perspective in Passage 2?",
        instructions: "Choose the best answer.",
        options: [
          "The author believes film productions are too disruptive to be worth considering.",
          "The author believes film productions matter only when famous actors visit a town.",
          "The author believes local businesses should receive all of the money from film productions.",
          "The author believes film productions can help communities when leaders plan carefully and set expectations."
        ],
        correctIndex: 3,
        standards: ["8.T.C.2.a", "8.T.C.2.b", "8.P.ST.2.b"],
        skills: ["author-perspective", "inference", "claim", "passage-2", "mcq", "dok3"]
      },
      {
        id: 5,
        type: "multi",
        linkedPassage: 1,
        stem: "Which details from Passage 1 best support the idea that Georgia offers several advantages to film productions?",
        instructions: "Select exactly 3 answers.",
        options: [
          "Georgia has cities, small towns, mountains, forests, coastlines, farms, and historic buildings.",
          "A family might be frustrated by noise or traffic near a filming site.",
          "The state has large studio spaces, experienced workers, and a climate that can support filming during many parts of the year.",
          "Approved productions can qualify for a tax credit when they spend enough money on production work in the state.",
          "A business near a filming site might gain customers during production."
        ],
        correctIndices: [0, 2, 3],
        minSelections: 3,
        maxSelections: 3,
        standards: ["8.T.T.2.a", "8.T.C.2.c", "8.P.EICC.3.f"],
        skills: ["text-evidence", "details", "context", "passage-1", "multi-select", "dok3"]
      },
      {
        id: 6,
        type: "multi",
        linkedPassage: 2,
        stem: "Which details from Passage 2 best support the author’s concern that filming can create problems for a community?",
        instructions: "Select exactly 3 answers.",
        options: [
          "A production may buy meals from nearby restaurants.",
          "Filming can close streets and take up parking spaces.",
          "Some visitors travel to places where favorite shows or movies were filmed.",
          "Noise may affect residents and businesses near the filming area.",
          "Public workers may need to help with traffic and safety."
        ],
        correctIndices: [1, 3, 4],
        minSelections: 3,
        maxSelections: 3,
        standards: ["8.T.T.3.a", "8.P.EICC.3.f"],
        skills: ["text-evidence", "details", "argument-structure", "passage-2", "multi-select", "dok3"]
      },
      {
        id: 7,
        type: "mcq",
        linkedPassage: 1,
        stem: "In paragraph 3 of Passage 1, what does the word incentive most nearly mean?",
        instructions: "Choose the best answer.",
        options: [
          "A rule that makes a company film only in one location",
          "A benefit that encourages a company to make a certain choice",
          "A warning that prevents a community from working with visitors",
          "A cost that must be paid before a movie can be shown in theaters"
        ],
        correctIndex: 1,
        standards: ["8.L.V.3.b", "8.L.V.3.d", "8.P.EICC.3.g"],
        skills: ["vocabulary-in-context", "word-analysis", "academic-vocabulary", "passage-1", "mcq"]
      },
      {
        id: 8,
        type: "mcq",
        linkedPassage: 2,
        stem: "What does the phrase “rolling out the red carpet—carefully” suggest about the author’s message?",
        instructions: "Choose the best answer.",
        options: [
          "Communities should act as if every production is a major award show.",
          "Communities should focus on visitors instead of residents when productions arrive.",
          "Communities can welcome filming while still setting rules and paying attention to possible problems.",
          "Communities should keep productions away unless they can promise famous actors will visit."
        ],
        correctIndex: 2,
        standards: ["8.L.V.3.c", "8.T.SS.2.a", "8.T.C.1.a"],
        skills: ["author-meaning", "connotation", "tone", "passage-2", "mcq", "dok3"]
      },
      {
        id: 9,
        type: "order",
        linkedPassage: 1,
        stem: "Order the steps that best show how a film production may affect a local economy, based on Passage 1.",
        instructions: "Drag and drop from first to last.",
        items: [
          { id: "o3", text: "The production pays for needs such as meals, workers, hotels, equipment, or locations." },
          { id: "o1", text: "A production chooses Georgia because the state offers useful locations, workers, studios, or incentives." },
          { id: "o4", text: "Some local businesses or workers may benefit, while others may face temporary problems." },
          { id: "o2", text: "The crew begins filming in or near a Georgia community." }
        ],
        correctOrder: ["o1", "o2", "o3", "o4"],
        standards: ["8.T.SS.1.a", "8.T.T.2.a", "8.P.EICC.3.d"],
        skills: ["cause-effect", "text-structure", "details", "passage-1", "order", "dok3"]
      },
      {
        id: 10,
        type: "match",
        linkedPassage: 1,
        stem: "Match each detail from Passage 1 with the idea it supports.",
        instructions: "Match the items correctly.",
        left: [
          { id: "m1", text: "Georgia has cities, farms, coastlines, forests, and historic buildings." },
          { id: "m2", text: "Crews may order meals, rent equipment, and use hotel rooms." },
          { id: "m3", text: "A road closure may help one business but make it harder for another business to get customers." }
        ],
        right: [
          { id: "r1", text: "Filming can create both benefits and challenges." },
          { id: "r2", text: "Georgia can stand in for many different settings." },
          { id: "r3", text: "Productions may spend money in several parts of the local economy." }
        ],
        pairs: { m1: "r2", m2: "r3", m3: "r1" },
        standards: ["8.T.T.2.a", "8.P.EICC.3.f"],
        skills: ["details", "inference", "matching", "passage-1", "dok3"]
      },
      {
        id: 11,
        type: "highlight",
        linkedPassage: 1,
        stem: "Which TWO sentences from Passage 1 best support the inference that a film production can affect more than the people seen on camera?",
        instructions: "Select exactly 2 sentences.",
        sentences: [
          { id: "h1", text: "For a few days, a familiar place can become part of a movie, television show, commercial, or music video.", correct: false },
          { id: "h2", text: "When a production films in a community, the effects can spread beyond the camera.", correct: true },
          { id: "h3", text: "A crew may rent equipment, pay local workers, use hotel rooms, order meals, hire security, or pay to use a building or property.", correct: true },
          { id: "h4", text: "Another reason is Georgia’s film tax credit.", correct: false },
          { id: "h5", text: "Georgia’s film industry is more than red carpets and famous names.", correct: false }
        ],
        standards: ["8.T.T.2.a", "8.P.EICC.3.f"],
        skills: ["text-evidence", "inference", "details", "highlight", "passage-1", "dok3"]
      },
      {
        id: 12,
        type: "highlight",
        linkedPassage: 2,
        stem: "Which TWO sentences from Passage 2 best show the author’s balanced position?",
        instructions: "Select exactly 2 sentences.",
        sentences: [
          { id: "h1", text: "When a film production wants to work in a Georgia community, local leaders may feel excited.", correct: false },
          { id: "h2", text: "These benefits are real, but they do not erase the concerns.", correct: true },
          { id: "h3", text: "A better approach is to make filming a partnership.", correct: true },
          { id: "h4", text: "A production may buy meals from nearby restaurants, rent rooms from hotels, hire local workers, and bring customers to shops.", correct: false },
          { id: "h5", text: "Some visitors even travel to places where favorite shows or movies were filmed.", correct: false }
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
            "Georgia’s film industry affects only actors and directors who work on major movies.",
            "Film productions can connect to Georgia communities through locations, workers, businesses, and planning decisions.",
            "Georgia should depend on film productions more than any other part of the state economy.",
            "A community should refuse a production if any resident is worried about traffic or noise."
          ],
          correctIndex: 1
        },
        partB: {
          stem: "Which sentence best supports the answer to Part A?",
          options: [
            "On some mornings in Georgia, an ordinary street can look very different.",
            "Another reason is Georgia’s film tax credit.",
            "These choices can help some businesses earn money.",
            "It is also connected to jobs, local businesses, transportation, tourism, and public planning."
          ],
          correctIndex: 3
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
            "The author admits benefits and concerns, then recommends planning that protects both productions and communities.",
            "The author focuses only on money to show that filming should be accepted without limits.",
            "The author uses a fictional story to prove that every production causes the same problems.",
            "The author lists famous filming locations to persuade readers that tourism is the only benefit."
          ],
          correctIndex: 0
        },
        partB: {
          stem: "Which sentence best supports the answer to Part A?",
          options: [
            "Supporters of filming often point to the benefits.",
            "Public workers may need to help with traffic and safety.",
            "Before a production begins, local leaders should share clear schedules, explain which streets or buildings will be affected, and give residents a way to ask questions.",
            "When a film production wants to work in a Georgia community, local leaders may feel excited."
          ],
          correctIndex: 2
        },
        standards: ["8.T.T.3.a", "8.P.AC.1.a", "8.T.C.2.a"],
        skills: ["argument-structure", "text-evidence", "claim", "two-part", "passage-2", "dok3"]
      },
      {
        id: 15,
        type: "classify",
        linkedPassage: null,
        stem: "Sort each idea based on whether it is presented as a possible benefit or a possible challenge of film productions in Georgia communities.",
        instructions: "Drag each idea to the correct column.",
        categories: [
          { id: "benefit", label: "Possible Benefit" },
          { id: "challenge", label: "Possible Challenge" }
        ],
        items: [
          { id: "c1", text: "Restaurants may sell meals to cast and crew members.", categoryId: "benefit" },
          { id: "c2", text: "Road closures may make it harder for regular customers to reach a business.", categoryId: "challenge" },
          { id: "c3", text: "Local workers may be hired for transportation, security, or setup.", categoryId: "benefit" },
          { id: "c4", text: "Noise may frustrate people who live or work nearby.", categoryId: "challenge" },
          { id: "c5", text: "A town may gain pride or tourism when people recognize it on screen.", categoryId: "benefit" }
        ],
        standards: ["8.T.T.2.a", "8.T.T.3.a", "8.P.EICC.3.f"],
        skills: ["classify", "synthesize", "cause-effect", "dok3"]
      },
      {
        id: 16,
        type: "mcq",
        linkedPassage: 1,
        stem: "Why is the table in Passage 1 useful for developing the author’s explanation?",
        instructions: "Choose the best answer.",
        options: [
          "It proves that every production helps all businesses in the same way.",
          "It adds a story about one student who wants to work in film production.",
          "It gives the reader a list of famous movies and television shows filmed in Georgia.",
          "It connects production needs with examples of local businesses, workers, or places that may be involved."
        ],
        correctIndex: 3,
        standards: ["8.T.C.1.b", "8.T.SS.1.a", "8.T.T.2.a"],
        skills: ["text-features", "text-design", "expository-techniques", "passage-1", "mcq", "dok3"]
      },
      {
        id: 17,
        type: "mcq",
        linkedPassage: 2,
        stem: "Which explanation best analyzes the tone of Passage 2?",
        instructions: "Choose the best answer.",
        options: [
          "The tone is practical and cautious because the author sees benefits but argues for planning and protection.",
          "The tone is angry because the author believes film productions are harmful to every Georgia town.",
          "The tone is playful because the author mainly wants to entertain readers with movie-related language.",
          "The tone is uncertain because the author never takes a clear position on whether communities should allow filming."
        ],
        correctIndex: 0,
        standards: ["8.T.SS.2.a", "8.T.C.2.a", "8.P.AC.1.b"],
        skills: ["tone", "author-perspective", "word-choice", "passage-2", "mcq", "dok3"]
      },
      {
        id: 18,
        type: "mcq",
        linkedPassage: 1,
        stem: "Which statement from Passage 1 is the strongest example of a fact used to support the author’s explanation?",
        instructions: "Choose the best answer.",
        options: [
          "For a few days, a familiar place can become part of a movie, television show, commercial, or music video.",
          "Understanding those connections helps people see why a film crew can be exciting and complicated at the same time.",
          "A tax credit lowers the amount of certain taxes a company owes if the company meets specific rules.",
          "A family might enjoy seeing a famous actor nearby."
        ],
        correctIndex: 2,
        standards: ["8.T.T.2.a", "8.T.C.2.b", "8.L.V.1.b"],
        skills: ["details", "credibility", "critical-thinking", "passage-1", "mcq", "dok3"]
      },
      {
        id: 19,
        type: "match",
        linkedPassage: 2,
        stem: "Match each community concern from Passage 2 with the planning solution that best responds to it.",
        instructions: "Match the items correctly.",
        left: [
          { id: "m1", text: "Residents may not know when filming will affect streets or buildings." },
          { id: "m2", text: "A filming area may be left messy after a production ends." },
          { id: "m3", text: "Local people may feel that productions benefit outsiders more than the community." }
        ],
        right: [
          { id: "r1", text: "Encourage productions to hire local workers when possible." },
          { id: "r2", text: "Share clear schedules and explain affected areas before filming begins." },
          { id: "r3", text: "Require productions to clean up filming areas." }
        ],
        pairs: { m1: "r2", m2: "r3", m3: "r1" },
        standards: ["8.T.T.3.a", "8.P.EICC.2.e", "8.P.ST.2.c"],
        skills: ["claim", "reason", "problem-solution", "matching", "passage-2", "dok3"]
      },
      {
        id: 20,
        type: "mcq",
        questionLabel: "Podcast",
        linkedPassage: null,
        media: {
          type: "audio",
          src: "../media/Georgia_Film_Jobs_Podcast.m4a",
          captions: "../media/Georgia_Film_Jobs_Podcast.vtt",
          label: "Podcast: Georgia’s Booming Film Industry"
        },
        stem: "Which claim from the podcast is best supported by the speaker’s examples?",
        instructions: "Listen to the podcast. Choose the best answer.",
        options: [
          "Georgia’s film industry has grown because tax credits, large studios, and local business spending make the state attractive to productions.",
          "Georgia’s film industry is successful mainly because most movies filmed there are about Georgia history.",
          "Georgia’s film industry depends only on actors and directors, not on local businesses or behind-the-scenes workers.",
          "Georgia’s film industry is becoming smaller because the state no longer wants productions to work there."
        ],
        correctIndex: 0,
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
          src: "../media/Georgia_Film_Jobs_Podcast.m4a",
          captions: "../media/Georgia_Film_Jobs_Podcast.vtt",
          label: "Podcast: Georgia’s Booming Film Industry"
        },
        stem: "Which THREE details from the podcast best support the idea that Georgia uses film incentives to grow its economy?",
        instructions: "Listen to the podcast. Select exactly 3 answers.",
        options: [
          "Georgia gives productions an uncapped 30% tax credit.",
          "Productions must spend $500,000 and include the Georgia Peach logo to receive the full benefit described by the speaker.",
          "Trilith Studios is described as a large complex with many sound stages.",
          "The speaker says Hollywood is the historic home of cinema.",
          "The speaker begins by asking listeners to imagine their backyard as a movie set."
        ],
        correctIndices: [0, 1, 2],
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
          src: "../media/Georgia_Film_Jobs_Podcast.m4a",
          captions: "../media/Georgia_Film_Jobs_Podcast.vtt",
          label: "Podcast: Georgia’s Booming Film Industry"
        },
        stem: "Answer Part A and Part B using the podcast.",
        instructions: "Listen carefully, then connect the speaker’s purpose to supporting details.",
        partA: {
          stem: "What is the speaker’s most likely purpose?",
          options: [
            "To explain why Georgia has become a major film production state and how that growth affects the economy",
            "To tell a fictional story about a student who visits a movie set in Georgia",
            "To argue that Georgia should stop supporting film productions because they create no local benefits",
            "To compare movie plots from Avengers and Stranger Things"
          ],
          correctIndex: 0
        },
        partB: {
          stem: "Which detail best supports the answer to Part A?",
          options: [
            "The speaker describes Georgia’s tax credit, large studio spaces, spending at local businesses, and film-related jobs.",
            "The speaker mentions several movie and television titles without explaining why they matter.",
            "The speaker says Hollywood is the historic home of cinema but does not discuss Georgia’s economy.",
            "The speaker focuses only on post-production work like sound and editing."
          ],
          correctIndex: 0
        },
        standards: ["8.T.C.1.a", "8.P.AC.3.d", "8.T.T.2.a"],
        skills: ["purpose-audience", "multimodal-features", "text-evidence", "podcast", "two-part", "dok3"]
      },
           {
        id: 23,
        type: "mcq",
        questionLabel: "Video",
        linkedPassage: null,
        media: {
          type: "video",
          src: "../media/Georgia_Film_Behind_The_Scenes.mp4",
          label: "Video: Behind the Scenes in a Georgia Production"
        },
        stem: "How do the video’s images and captions help explain Georgia’s growth as a film production state?",
        instructions: "Watch the video. Choose the best answer.",
        options: [
          "They focus on one actor’s costume to show that Georgia films are mostly about superheroes.",
          "They combine maps, money images, studio diagrams, and set visuals to show how incentives and infrastructure attracted productions.",
          "They show mostly red carpet events to prove that tourism is the only reason productions come to Georgia.",
          "They use rural images only to suggest that Georgia has not changed much because of the film industry."
        ],
        correctIndex: 1,
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
          src: "../media/Georgia_Film_Behind_The_Scenes.mp4",
          label: "Video: Behind the Scenes in a Georgia Production"
        },
        stem: "Which TWO details from the video best support the idea that Georgia’s film industry grew because of both financial incentives and physical production spaces?",
        instructions: "Watch the video. Select exactly 2 answers.",
        options: [
          "The video shows stacks of money with a clapperboard while explaining Georgia’s discount for movie makers.",
          "The video shows Trilith Studios as a large complex with many sound stages and a town nearby.",
          "The video begins with a superhero image from a fictional movie world.",
          "The video says Hollywood is the historic home of cinema.",
          "The video includes captions at the bottom of the screen."
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
          src: "../media/Georgia_Film_Behind_The_Scenes.mp4",
          label: "Video: Behind the Scenes in a Georgia Production"
        },
        stem: "Answer Part A and Part B using the video and the two passages.",
        instructions: "Synthesize the multimedia source with the reading passages.",
        partA: {
          stem: "Which statement best synthesizes the main idea across the video and both passages?",
          options: [
            "Georgia’s film industry is important only because famous movies and shows have filmed there.",
            "Georgia’s film industry has grown through incentives, studio spaces, local spending, and community planning, but its effects can be complex.",
            "Georgia communities should avoid film productions because filming creates more problems than benefits.",
            "Georgia became a film center by copying Hollywood without involving local businesses or workers."
          ],
          correctIndex: 1
        },
        partB: {
          stem: "Which evidence best supports the answer to Part A?",
          options: [
            "The video shows Georgia’s tax credit and Trilith Studios, Passage 1 explains local economic connections, and Passage 2 explains the need for careful planning.",
            "The video shows superhero images, Passage 1 describes ordinary streets, and Passage 2 mentions red carpets.",
            "The video says Hollywood is historic, Passage 1 defines tax credits, and Passage 2 begins with local leaders feeling excited.",
            "The video focuses on one studio, Passage 1 lists possible jobs, and Passage 2 says benefits are real."
          ],
          correctIndex: 0
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