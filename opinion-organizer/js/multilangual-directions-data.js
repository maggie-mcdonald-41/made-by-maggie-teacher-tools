//multilangual-directions-data.js //
//translations begin
const sectionTranslations = {
    "general-instructions": {
      "en-US": `
   
      Get ready to build an awesome essay — step by step!
      This organizer will guide you through each part of your writing.
      Whether you're starting with your thesis, or beginning with your evidence,
      all you have to do is take it one section at a time.
      Read the prompt.
      Follow the directions in each box.
      Use the sentence starters and teacher tips for support.
      And most importantly — you’ve got this!
  
      Your job is to think clearly, explain your ideas, and stay focused on your topic.
      We’ll help you organize your thoughts and put them all together into a powerful argument.
  
      Let’s do this — one step at a time!
  
      Before you dive in, take a moment to explore the tools at the top of the page.
      They’re here to make writing easier, smoother, and more fun.
  
      Dark Mode — Toggle for a darker screen if it helps you focus.
      Dyslexia Font — Switch to a font that’s easier to read if letters get tricky.
      Evidence-First Mode — Prefer to start with quotes? Flip this on!
      Body Paragraphs — Choose how many paragraphs your essay will have. Click Confirm to lock it in.
      Voice — Pick a voice for read-aloud support.
      Audio Language — Hear instructions in your preferred language.
      Play Directions — Listen to helpful directions for each section.
      Sign in with Google — Log in with Google to autosave your progress.
      Download or Upload — Save your progress or load previous work anytime.
      Sign Out & Reset — Clears the screen for a new user. Your saved work will reload when you sign back in.
  
      Teacher Tip — Tap the lightbulb for extra guidance or reminders.
      Writing Coach — Stuck or unsure? Click the writing coach for a boost!
      Refresh Button — Want to start that box over? Click refresh to bring back the starter or hint.
  
      These tools are here for YOU — mix and match them however you learn best!
  
      Let’s get started!
      `,
      "es-ES": `
        ¡Bienvenido a tu organizador de ensayos! Esta herramienta te guiará paso a paso para escribir un ensayo argumentativo sólido.
        Sigue las instrucciones en cada sección, usa los iniciadores de oraciones y consulta los consejos del maestro si necesitas ayuda.
        Puedes usar herramientas como el modo oscuro, la fuente para dislexia o el apoyo de lectura en voz alta para aprender a tu manera.
        ¡Recuerda: tú puedes hacerlo! Comencemos.
      `,
      "fr-FR": `
        Bienvenue dans ton organisateur de rédaction ! Cet outil va te guider étape par étape pour rédiger un essai argumentatif solide.
        Suis les consignes dans chaque section, utilise les amorces de phrases et lis les conseils de ton professeur si tu as besoin d’aide.
        Tu peux activer des options comme le mode sombre, la police dyslexie ou l’audio pour t’aider à apprendre comme tu préfères.
        Souviens-toi : tu en es capable ! C’est parti.
      `,
      "de-DE": `
        Willkommen bei deinem Aufsatz-Organizer! Dieses Tool führt dich Schritt für Schritt zu einem überzeugenden Argumentationsaufsatz.
        Folge den Anweisungen in jedem Abschnitt, nutze Satzanfänge und Lehrertipps zur Unterstützung.
        Du kannst Tools wie den Dunkelmodus, eine Dyslexie-Schriftart oder Vorlesefunktion verwenden – wie es für dich am besten passt.
        Denk daran: Du schaffst das! Los geht’s.
      `,
      "zh-CN": `
        欢迎使用写作组织工具！这个工具将一步步指导你写出一篇有说服力的议论文。
        按照每个部分的说明操作，使用句子开头提示，并查看老师的建议来获得帮助。
        你可以选择暗黑模式、阅读障碍字体或语音朗读等功能，以适合自己的学习方式。
        记住：你可以做到！我们开始吧。
      `
    },


    "evidence-first-setup": {
"en-US": `
    💡 Teacher Tip: This is your main opinion or stance — your guiding idea.

    Start with your point of view based on the prompt. Think about rewording the prompt to show your stance. Later, you’ll choose evidence and reasons that support it.

    Example:
    Prompt: Should homework be required in schools?
    Opinion: I think kids should not be required to do homework
  `,
  "es-ES": `
    💡 Consejo del maestro: Esta es tu opinión principal — la idea que guiará tu escritura.

    Comienza con tu punto de vista según el enunciado. Piensa en cómo volver a escribir el enunciado para mostrar tu postura. Después, elegirás evidencia y razones que la apoyen.

    Ejemplo:
    Enunciado: ¿Se debe exigir tarea en las escuelas?
    Opinión: Creo que no se debe exigir tarea a los niños.
  `,
  "fr-FR": `
    💡 Conseil de l’enseignant : Voici ton opinion principale — ton idée directrice.

    Commence par ton point de vue en te basant sur la consigne. Réécris-la pour montrer ta position. Ensuite, tu choisiras des preuves et des raisons pour la soutenir.

    Exemple :
    Consigne : Les devoirs devraient-ils être obligatoires à l’école ?
    Opinion : Je pense que les enfants ne devraient pas être obligés de faire des devoirs.
  `,
  "de-DE": `
    💡 Lehrertipp: Das ist deine Hauptmeinung — die zentrale Idee deines Aufsatzes.

    Starte mit deiner eigenen Sichtweise basierend auf dem Thema. Formuliere die Fragestellung so um, dass deine Haltung klar wird. Später wählst du Belege und Gründe, die sie unterstützen.

    Beispiel:
    Thema: Soll Hausaufgaben in der Schule verpflichtend sein?
    Meinung: Ich finde, Kinder sollten keine Hausaufgaben machen müssen.
  `,
  "zh-CN": `
    💡 教师提示：这是你的主要观点 — 你的核心想法。

    根据写作题目表达你的观点。试着用你自己的话改写题目来表明你的立场。接下来，你会选择支持这个观点的证据和理由。

    示例：
    题目：学校应该要求学生做家庭作业吗？
    观点：我认为孩子们不应该被要求做家庭作业。
  `
},

    "evidence-first-section": {
    "en-US": `
    💡 Teacher Tip: This section is where you collect your best evidence — a direct quote that supports each of your reasons. Your reasons are what your body paragraphs will be about.

    What kind of evidence?
    Just the quote itself! Copy a sentence (or two) directly from the article that connects to your reason. No transition words yet — we’ll add those later.

    Where does it come from?
    If you’ve been given articles in class, use those. Choose a part of the text that proves your point or supports your thinking. Your teacher will tell you if you are finding your own resources.

    Remember:
    - Use quotation marks
    - Keep it short and powerful
    - Make sure it matches your opinion
    - You will create reasons from your quotes

    Example:
    Quote: “Students who get too much homework are more likely to lose sleep and feel overwhelmed.”
    Reason: Homework makes kids feel stressed.
  `,
  "es-ES": `
    💡 Consejo del maestro: En esta sección recolectas tu mejor evidencia — una cita directa que apoye cada una de tus razones. Tus razones serán los temas de tus párrafos del cuerpo.

    ¿Qué tipo de evidencia?
    ¡Solo la cita! Copia una o dos oraciones directamente del artículo que se conecten con tu razón. Sin palabras de transición todavía — las agregaremos después.

    ¿De dónde viene?
    Si tu maestro te dio artículos, usa esos. Elige una parte del texto que pruebe tu punto o respalde tu pensamiento. Tu maestro te dirá si debes buscar tus propios recursos.

    Recuerda:
    - Usa comillas
    - Mantén la cita corta y poderosa
    - Asegúrate de que coincida con tu opinión
    - Crearás razones a partir de tus citas

    Ejemplo:
    Cita: “Los estudiantes que tienen demasiada tarea tienen más probabilidades de perder sueño y sentirse abrumados.”
    Razón: La tarea hace que los niños se sientan estresados.
  `,
  "fr-FR": `
    💡 Conseil de l’enseignant : Cette section est là pour que tu trouves ta meilleure preuve — une citation directe qui soutient chacune de tes raisons. Tes raisons sont les sujets de tes paragraphes.

    Quel type de preuve ?
    Juste la citation ! Copie une ou deux phrases directement de l’article qui se rapportent à ta raison. Pas de mots de transition pour l’instant — on les ajoutera plus tard.

    D’où vient-elle ?
    Si ton professeur t’a donné des articles, utilise-les. Choisis une partie du texte qui prouve ton idée ou soutient ta pensée. Ton professeur te dira si tu dois chercher tes propres sources.

    Rappelle-toi :
    - Utilise les guillemets
    - Garde la citation courte et percutante
    - Assure-toi qu’elle correspond à ton opinion
    - Tu vas créer des raisons à partir de tes citations

    Exemple :
    Citation : “Les élèves qui ont trop de devoirs dorment moins et se sentent dépassés.”
    Raison : Les devoirs stressent les enfants.
  `,
  "de-DE": `
    💡 Lehrertipp: In diesem Abschnitt sammelst du deine beste Begründung — ein direktes Zitat, das deine Gründe unterstützt. Diese Gründe bilden den Inhalt deiner Absätze.

    Welche Art von Belegen?
    Nur das Zitat! Kopiere einen oder zwei Sätze direkt aus dem Artikel, die zu deinem Grund passen. Noch keine Übergangswörter — die kommen später.

    Woher kommt das Zitat?
    Wenn du im Unterricht Artikel bekommen hast, nutze diese. Wähle eine Textstelle, die deinen Standpunkt beweist oder deine Meinung unterstützt. Dein Lehrer sagt dir, ob du eigene Quellen suchen sollst.

    Denk daran:
    - Verwende Anführungszeichen
    - Halte es kurz und aussagekräftig
    - Es muss zu deiner Meinung passen
    - Du entwickelst deine Gründe aus deinen Zitaten

    Beispiel:
    Zitat: „Schüler, die zu viele Hausaufgaben bekommen, verlieren häufiger Schlaf und fühlen sich überfordert.“
    Grund: Hausaufgaben machen Kinder gestresst.
  `,
  "zh-CN": `
    💡 教师提示：在这一部分，你要收集最有力的证据 —— 一句可以支持你每个理由的直接引用。这些理由将成为你正文段落的主题。

    什么样的证据？
    只需要引用句子本身！直接从文章中复制一到两句和你的理由相关的内容。还不用加过渡词 —— 我们稍后再添加。

    证据来自哪里？
    如果老师给了你文章，就用那些。选择能证明你观点或支持你想法的部分。如果要自己查找资料，老师会告诉你。

    记住：
    - 使用引号
    - 保持简短有力
    - 要与你的观点一致
    - 你的理由将从这些引用中提取

    示例：
    引用：“得到过多家庭作业的学生更容易失眠并感到压力大。”
    理由：家庭作业让孩子感到有压力。
  `
},
    
    "ef-evidence3": {
    "en-US": `
    💡 Teacher Tip: In Body Paragraph 3, you can either give a third reason for your opinion or talk about the other side — what someone who disagrees might say.

    What does that mean?
    Some people might not agree with your opinion. That’s okay! You can write what they might say and then explain why you still believe your opinion is best.

    Why is this smart?
    It shows you’ve thought about both sides and makes your opinion even stronger!

    Example:
    Some people think homework teaches kids to be responsible. But kids already learn responsibility by doing classwork, chores, and after-school activities.
  `,
  "es-ES": `
    💡 Consejo del maestro: En el tercer párrafo del cuerpo, puedes dar una tercera razón para tu opinión o hablar del otro lado — lo que alguien que no está de acuerdo podría decir.

    ¿Qué significa eso?
    Algunas personas podrían no estar de acuerdo contigo, ¡y está bien! Puedes escribir lo que ellos podrían decir y luego explicar por qué todavía crees que tu opinión es la mejor.

    ¿Por qué es una buena idea?
    Muestra que pensaste en los dos lados del tema y hace que tu opinión sea aún más fuerte.

    Ejemplo:
    Algunas personas piensan que la tarea enseña a los niños a ser responsables. Pero los niños ya aprenden responsabilidad con el trabajo en clase, los quehaceres y las actividades después de la escuela.
  `,
  "fr-FR": `
    💡 Conseil de l’enseignant : Dans le troisième paragraphe du corps, tu peux soit donner une troisième raison pour ton opinion, soit parler du point de vue opposé — ce que dirait quelqu’un qui n’est pas d’accord.

    Qu’est-ce que cela veut dire ?
    Certaines personnes ne seront peut-être pas d’accord avec ton opinion. Ce n’est pas grave ! Tu peux écrire ce qu’ils diraient, puis expliquer pourquoi tu penses toujours que ton opinion est la meilleure.

    Pourquoi c’est intelligent ?
    Cela montre que tu as réfléchi aux deux côtés et cela rend ton opinion encore plus forte !

    Exemple :
    Certaines personnes pensent que les devoirs apprennent aux enfants à être responsables. Mais les enfants apprennent déjà la responsabilité grâce au travail en classe, aux tâches ménagères et aux activités extrascolaires.
  `,
  "de-DE": `
    💡 Lehrertipp: Im dritten Hauptteil kannst du entweder einen dritten Grund für deine Meinung nennen oder die andere Seite zeigen — was jemand sagen könnte, der nicht deiner Meinung ist.

    Was heißt das?
    Manche Menschen stimmen deiner Meinung vielleicht nicht zu. Das ist okay! Du kannst schreiben, was sie sagen würden, und dann erklären, warum du trotzdem bei deiner Meinung bleibst.

    Warum ist das schlau?
    Es zeigt, dass du über beide Seiten nachgedacht hast — das macht deine Meinung noch überzeugender!

    Beispiel:
    Manche denken, dass Hausaufgaben Kinder verantwortungsvoll machen. Aber Kinder lernen Verantwortung bereits durch Klassenarbeiten, Hausarbeiten und außerschulische Aktivitäten.
  `,
  "zh-CN": `
    💡 教师提示：在第三段正文中，你可以写出支持你观点的第三个理由，也可以写出反方观点 —— 就是持不同意见的人可能会说什么。

    这是什么意思？
    有些人可能不同意你的观点。没关系！你可以写出他们可能的说法，然后解释为什么你仍然坚持自己的观点。

    为什么这样做很聪明？
    它表明你考虑过双方观点，并能让你的观点更加有说服力！

    示例：
    有些人认为家庭作业可以教孩子负责任。但孩子们已经通过课堂作业、家务和课外活动学习了责任感。
  `
},
      
    "thesis": {
   "en-US": `
    💡 Teacher Tip: Your thesis is the most important sentence in your whole essay.

    What is it?
    A thesis is one strong sentence that shares your opinion and gives your top reasons. It tells the reader what your whole writing will be about.

    Why does it matter?
    Your thesis is like a roadmap. It helps guide your writing and keeps all your ideas on track.

    Example:
    My Opinion: I do not think kids should have homework.
    Reason 1: It makes kids feel stressed or worried.
    Reason 2: It takes away time they could spend with their family or doing fun things.
  `,
  "es-ES": `
    💡 Consejo del maestro: Tu tesis es la oración más importante de todo tu ensayo.

    ¿Qué es?
    Una tesis es una oración fuerte que comparte tu opinión y da tus razones principales. Le dice al lector de qué se tratará todo tu texto.

    ¿Por qué es importante?
    Tu tesis es como un mapa. Guía tu escritura y mantiene tus ideas organizadas.

    Ejemplo:
    Mi opinión: No creo que los niños deban tener tarea.
    Razón 1: Les causa estrés o preocupación.
    Razón 2: Les quita tiempo que podrían pasar con su familia o haciendo cosas divertidas.
  `,
  "fr-FR": `
    💡 Conseil de l’enseignant : Ta thèse est la phrase la plus importante de tout ton essai.

    Qu’est-ce que c’est ?
    Une thèse est une phrase forte qui partage ton opinion et donne tes principales raisons. Elle explique au lecteur de quoi parle ton texte.

    Pourquoi c’est important ?
    Ta thèse est comme une carte. Elle guide ton écriture et garde toutes tes idées bien organisées.

    Exemple :
    Mon opinion : Je ne pense pas que les enfants devraient avoir des devoirs.
    Raison 1 : Cela les rend stressés ou inquiets.
    Raison 2 : Cela leur enlève du temps qu’ils pourraient passer avec leur famille ou à s’amuser.
  `,
  "de-DE": `
    💡 Lehrertipp: Deine These ist der wichtigste Satz in deinem ganzen Aufsatz.

    Was ist das?
    Eine These ist ein starker Satz, der deine Meinung und deine wichtigsten Gründe nennt. Sie sagt dem Leser, worum es in deinem Text geht.

    Warum ist das wichtig?
    Deine These ist wie eine Landkarte. Sie hilft dir, beim Schreiben den Überblick zu behalten und deine Gedanken zu ordnen.

    Beispiel:
    Meine Meinung: Ich finde, Kinder sollten keine Hausaufgaben haben.
    Grund 1: Es macht Kinder gestresst oder besorgt.
    Grund 2: Es nimmt ihnen Zeit weg, die sie mit der Familie oder mit Spaß verbringen könnten.
  `,
  "zh-CN": `
    💡 教师提示：你的论点句是整篇文章中最重要的一句话。

    什么是论点句？
    论点句是一个强有力的句子，它表达了你的观点并列出了你最重要的两个理由。它告诉读者整篇文章的主题。

    为什么重要？
    你的论点就像一张路线图。它帮助你组织思路，让你的写作更有方向。

    示例：
    我的观点：我认为孩子们不应该有家庭作业。
    理由一：它让孩子感到压力大或担忧。
    理由二：它占用了孩子可以和家人相处或做有趣事情的时间。
  `
},

    "evidence": {
        "en-US": `
    💡 Teacher Tip: This is where you find a strong sentence from the article that proves your reason is true.

    What should I use?
    Pick one or two sentences that come straight from the article — no need to add your own words yet.

    Where do I find it?
    Use the articles your teacher gave you. Look for a part that supports your opinion. If you’re picking your own, ask your teacher first.

    Quick Reminders:
    - Use quotation marks
    - Keep it short and strong
    - Make sure it matches your reason

    Example:
    “Students who get too much homework are more likely to lose sleep and feel overwhelmed.”
  `,
  "es-ES": `
    💡 Consejo del maestro: Aquí es donde encuentras una oración fuerte del artículo que demuestra que tu razón es verdadera.

    ¿Qué debo usar?
    Elige una o dos oraciones directamente del artículo — no necesitas agregar tus propias palabras todavía.

    ¿Dónde lo encuentro?
    Usa los artículos que te dio tu maestro. Busca una parte que apoye tu opinión. Si estás eligiendo tus propias fuentes, pregunta primero.

    Recordatorios rápidos:
    - Usa comillas
    - Mantenlo corto y fuerte
    - Asegúrate de que coincida con tu razón

    Ejemplo:
    “Los estudiantes que tienen demasiada tarea tienen más probabilidades de perder sueño y sentirse abrumados.”
  `,
  "fr-FR": `
    💡 Conseil de l’enseignant : C’est ici que tu trouves une phrase forte dans l’article qui prouve que ta raison est vraie.

    Que dois-je utiliser ?
    Choisis une ou deux phrases directement tirées de l’article — pas besoin d’ajouter tes propres mots pour l’instant.

    Où la trouver ?
    Utilise les articles donnés par ton professeur. Cherche une partie qui soutient ton opinion. Si tu choisis toi-même tes sources, demande d’abord à ton professeur.

    Rappels rapides :
    - Utilise des guillemets
    - Garde-la courte et percutante
    - Assure-toi qu’elle corresponde à ta raison

    Exemple :
    “Les élèves qui ont trop de devoirs dorment moins et se sentent dépassés.”
  `,
  "de-DE": `
    💡 Lehrertipp: Hier findest du einen starken Satz aus dem Artikel, der beweist, dass dein Grund richtig ist.

    Was soll ich verwenden?
    Wähle ein oder zwei Sätze direkt aus dem Artikel — du musst noch keine eigenen Worte hinzufügen.

    Wo finde ich ihn?
    Verwende die Artikel, die dir dein Lehrer gegeben hat. Suche nach einer Stelle, die deine Meinung unterstützt. Wenn du eigene Quellen nutzt, frag vorher deinen Lehrer.

    Kurze Erinnerungen:
    - Verwende Anführungszeichen
    - Halte es kurz und stark
    - Es muss zu deinem Grund passen

    Beispiel:
    „Schüler, die zu viele Hausaufgaben bekommen, verlieren häufiger Schlaf und fühlen sich überfordert.“
  `,
  "zh-CN": `
    💡 教师提示：这是你从文章中找到一个有力句子的地方，用来证明你的理由是对的。

    我该用什么？
    选一到两句话，直接从文章中摘录 —— 暂时不用添加你自己的话。

    我在哪里找？
    使用老师给你的文章。找出能支持你观点的部分。如果你要自己找资料，请先问老师。

    快速提醒：
    - 使用引号
    - 保持简洁有力
    - 确保它和你的理由一致

    示例：
    “得到太多家庭作业的学生更容易失眠并感到压力大。”
  `
},

    "intro": {
         "en-US": `
    What goes in an introduction?
    Try using the HIT strategy: Hook, Introduction, Thesis.

    - Hook: Start with a fun or surprising sentence to get your reader’s attention
    - Introduce topic: Say what the writing is about and give a little background
    - Thesis: Share your opinion and your top reasons (you’ve already written this!)

    Helpful Tip:
    It’s okay if it’s not perfect the first time. You can always go back and fix it later after your other paragraphs are done.

    Example Hook:
    Imagine coming home from school, tired and still having a pile of homework to do.
  `,
  "es-ES": `
    ¿Qué va en una introducción?
    Prueba la estrategia HIT: Gancho, Introducción, Tesis.

    - Gancho: Comienza con una oración divertida o sorprendente para captar la atención del lector
    - Introduce el tema: Explica de qué trata tu escritura y da un poco de contexto
    - Tesis: Comparte tu opinión y tus razones principales (¡ya la escribiste!)

    Consejo útil:
    No pasa nada si no está perfecto al principio. Siempre puedes regresar y mejorarlo después de escribir los otros párrafos.

    Ejemplo de gancho:
    Imagina que llegas a casa después de la escuela, cansado y con una montaña de tarea por hacer.
  `,
  "fr-FR": `
    Que mettre dans une introduction ?
    Essaie la stratégie HIT : Accroche, Introduction, Thèse.

    - Accroche : Commence par une phrase amusante ou surprenante pour capter l’attention du lecteur
    - Introduction du sujet : Dis de quoi tu vas parler et donne un peu de contexte
    - Thèse : Partage ton opinion et tes raisons principales (tu l’as déjà écrite !)

    Astuce :
    Ce n’est pas grave si ce n’est pas parfait au début. Tu pourras toujours y revenir et l’améliorer après avoir écrit les autres paragraphes.

    Exemple d’accroche :
    Imagine que tu rentres de l’école, fatigué, et que tu as encore une pile de devoirs à faire.
  `,
  "de-DE": `
    Was gehört in eine Einleitung?
    Probiere die HIT-Strategie: Einstieg, Einführung, These.

    - Einstieg: Starte mit einem lustigen oder überraschenden Satz, um die Aufmerksamkeit deiner Leser zu gewinnen
    - Thema vorstellen: Sage, worum es im Text geht, und gib etwas Hintergrundwissen
    - These: Teile deine Meinung und deine wichtigsten Gründe (die hast du schon geschrieben!)

    Nützlicher Hinweis:
    Es ist okay, wenn es beim ersten Mal nicht perfekt ist. Du kannst die Einleitung später überarbeiten, wenn der Rest fertig ist.

    Beispiel für einen Einstieg:
    Stell dir vor, du kommst müde von der Schule nach Hause – und dann wartet noch ein Berg Hausaufgaben auf dich.
  `,
  "zh-CN": `
    引言部分写什么？
    试试使用 HIT 策略：开头句（Hook）、介绍（Introduction）、论点（Thesis）。

    - 开头句：用有趣或令人惊讶的句子吸引读者的注意
    - 介绍主题：说明你的写作主题，并提供一些背景信息
    - 论点：表达你的观点和主要理由（你已经写过这部分了！）

    小贴士：
    一开始不完美没关系。在写完其他段落后你可以回来修改。

    示例开头句：
    想象一下，你放学回家很累，却还有一堆家庭作业等着你。
  `
},

    "body1": {
       "en-US": `
    💡 Teacher Tip: This paragraph is all about your first reason from your thesis.

    What’s the purpose?
    This is where you explain your reason, show a quote from the article, and tell how the quote helps prove your opinion.

    Remember:
    ✏️ If your thesis says...
    “I don’t think kids should have homework because it causes stress and takes away family time.”
    ✅ Then this paragraph should be about stress!

    How to build your paragraph:
    - Start with your reason
    - Add a quote from the article
    - Tell how the quote proves your reason
  `,
  "es-ES": `
    💡 Consejo del maestro: Este párrafo trata sobre tu primera razón de la tesis.

    ¿Cuál es el propósito?
    Aquí es donde explicas tu razón, muestras una cita del artículo y dices cómo esa cita apoya tu opinión.

    Recuerda:
    ✏️ Si tu tesis dice...
    “No creo que los niños deban tener tarea porque causa estrés y les quita tiempo en familia.”
    ✅ Entonces este párrafo debe tratar sobre el estrés.

    Cómo construir tu párrafo:
    - Comienza con tu razón
    - Agrega una cita del artículo
    - Explica cómo la cita prueba tu razón
  `,
  "fr-FR": `
    💡 Conseil de l’enseignant : Ce paragraphe parle de ta première raison dans ta thèse.

    Quel est le but ?
    C’est ici que tu expliques ta raison, que tu montres une citation de l’article et que tu expliques comment cette citation soutient ton opinion.

    Souviens-toi :
    ✏️ Si ta thèse dit...
    “Je ne pense pas que les enfants devraient avoir des devoirs parce que cela cause du stress et enlève du temps en famille.”
    ✅ Alors ce paragraphe doit parler du stress !

    Comment construire ton paragraphe :
    - Commence avec ta raison
    - Ajoute une citation de l’article
    - Explique comment la citation prouve ta raison
  `,
  "de-DE": `
    💡 Lehrertipp: In diesem Absatz geht es um deinen ersten Grund aus der These.

    Was ist das Ziel?
    Hier erklärst du deinen Grund, fügst ein Zitat aus dem Artikel ein und erklärst, wie dieses Zitat deine Meinung unterstützt.

    Denk daran:
    ✏️ Wenn deine These sagt...
    „Ich finde nicht, dass Kinder Hausaufgaben haben sollten, weil sie Stress verursachen und Familienzeit wegnehmen.“
    ✅ Dann sollte dieser Absatz über Stress gehen!

    So baust du deinen Absatz auf:
    - Beginne mit deinem Grund
    - Füge ein Zitat aus dem Artikel ein
    - Erkläre, wie das Zitat deinen Grund beweist
  `,
  "zh-CN": `
    💡 教师提示：这个段落是关于你论点中提到的第一个理由。

    写这一段的目的是什么？
    在这里你要解释你的理由，引用文章中的句子，并说明这个句子如何支持你的观点。

    记住：
    ✏️ 如果你的论点句说...
    “我认为孩子们不应该有家庭作业，因为它会引起压力，还会减少家庭时间。”
    ✅ 那么这一段就应该是关于“压力”的！

    如何写这个段落：
    - 从你的理由开始
    - 加入文章中的引用
    - 说明这个引用如何支持你的理由
  `
},

"body2": {
 "en-US": `
    💡 Teacher Tip: This paragraph is all about your second reason from your thesis.

    What’s the purpose?
    You’re using this paragraph to show your second reason, include a quote from the article, and explain how that quote helps prove your opinion.

    Remember:
    ✏️ If your thesis says...
    “I don’t think kids should have homework because it causes stress and takes away family time.”
    ✅ Then this paragraph is about how it takes away family time!

    How to build your paragraph:
    - Start with your second reason
    - Add a quote from the article that matches it
    - Tell how the quote proves your point
  `,
  "es-ES": `
    💡 Consejo del maestro: Este párrafo trata sobre tu segunda razón de la tesis.

    ¿Cuál es el propósito?
    Vas a usar este párrafo para mostrar tu segunda razón, incluir una cita del artículo y explicar cómo esa cita apoya tu opinión.

    Recuerda:
    ✏️ Si tu tesis dice...
    “No creo que los niños deban tener tarea porque causa estrés y les quita tiempo en familia.”
    ✅ Entonces este párrafo debe tratar sobre cómo les quita tiempo en familia.

    Cómo construir tu párrafo:
    - Comienza con tu segunda razón
    - Agrega una cita del artículo que se relacione
    - Explica cómo la cita prueba tu punto
  `,
  "fr-FR": `
    💡 Conseil de l’enseignant : Ce paragraphe parle de ta deuxième raison dans ta thèse.

    Quel est le but ?
    Tu vas utiliser ce paragraphe pour montrer ta deuxième raison, inclure une citation de l’article et expliquer comment cette citation soutient ton opinion.

    Souviens-toi :
    ✏️ Si ta thèse dit...
    “Je ne pense pas que les enfants devraient avoir des devoirs parce que cela cause du stress et enlève du temps en famille.”
    ✅ Alors ce paragraphe doit parler de la façon dont les devoirs enlèvent du temps en famille.

    Comment construire ton paragraphe :
    - Commence par ta deuxième raison
    - Ajoute une citation de l’article qui correspond
    - Explique comment cette citation prouve ton point
  `,
  "de-DE": `
    💡 Lehrertipp: In diesem Absatz geht es um deinen zweiten Grund aus der These.

    Was ist das Ziel?
    Du nutzt diesen Absatz, um deinen zweiten Grund zu zeigen, ein Zitat aus dem Artikel einzufügen und zu erklären, wie dieses Zitat deine Meinung unterstützt.

    Denk daran:
    ✏️ Wenn deine These sagt...
    „Ich finde nicht, dass Kinder Hausaufgaben haben sollten, weil sie Stress verursachen und Familienzeit wegnehmen.“
    ✅ Dann sollte dieser Absatz zeigen, wie Hausaufgaben Familienzeit wegnehmen!

    So baust du deinen Absatz auf:
    - Starte mit deinem zweiten Grund
    - Füge ein passendes Zitat aus dem Artikel ein
    - Erkläre, wie das Zitat deinen Standpunkt beweist
  `,
  "zh-CN": `
    💡 教师提示：这一段是关于你论点中提到的第二个理由。

    写这一段的目的是什么？
    在这里你要展示你的第二个理由，引用文章中的句子，并解释这个句子如何支持你的观点。

    记住：
    ✏️ 如果你的论点句说...
    “我认为孩子们不应该有家庭作业，因为它会引起压力，还会减少家庭时间。”
    ✅ 那么这一段就应该是关于“减少家庭时间”的！

    如何写这个段落：
    - 从你的第二个理由开始
    - 添加与之匹配的文章引用
    - 说明这个引用如何支持你的观点
  `
},     

    "body3": {
        "en-US": `
    💡 Teacher Tip: This paragraph is for your third reason from your thesis — or, if you picked a counterclaim, this is where you show the other side of the opinion.

    What’s a counterclaim?
    A counterclaim is what someone who doesn’t agree with your opinion might say.

    If you chose a counterclaim:
    Start by sharing what the other person might believe. Then, explain why your opinion still makes more sense. This helps your reader trust your thinking.

    What to include:
    - A sentence that tells the other side’s opinion
    - A quote or fact that connects
    - A sentence that shows why your opinion is stronger

    Example — Counterclaim:
    Some people say homework helps kids be more responsible. But I think kids already learn responsibility from chores and classwork, so homework isn’t the only way.
  `,
  "es-ES": `
    💡 Consejo del maestro: Este párrafo es para tu tercera razón de la tesis — o, si elegiste una contraargumentación, aquí es donde muestras el otro lado de la opinión.

    ¿Qué es una contraargumentación?
    Es lo que alguien que no está de acuerdo con tu opinión podría decir.

    Si elegiste una contraargumentación:
    Comienza compartiendo lo que esa persona podría creer. Luego, explica por qué tu opinión sigue teniendo más sentido. Esto ayuda a que el lector confíe en tu razonamiento.

    Qué incluir:
    - Una oración que muestre la opinión contraria
    - Una cita o dato que se relacione
    - Una oración que muestre por qué tu opinión es más fuerte

    Ejemplo — Contraargumentación:
    Algunas personas dicen que la tarea ayuda a que los niños sean responsables. Pero yo creo que los niños ya aprenden responsabilidad con los quehaceres y el trabajo en clase, así que la tarea no es la única forma.
  `,
  "fr-FR": `
    💡 Conseil de l’enseignant : Ce paragraphe est pour ta troisième raison de ta thèse — ou, si tu as choisi une contre-argumentation, c’est ici que tu montres l’autre point de vue.

    Qu’est-ce qu’une contre-argumentation ?
    C’est ce que dirait quelqu’un qui n’est pas d’accord avec ton opinion.

    Si tu choisis une contre-argumentation :
    Commence par dire ce que pense l’autre personne. Ensuite, explique pourquoi ton opinion a plus de sens. Cela aide le lecteur à te faire confiance.

    À inclure :
    - Une phrase qui montre l’opinion de l’autre côté
    - Une citation ou un fait qui s’y rapporte
    - Une phrase expliquant pourquoi ton opinion est plus forte

    Exemple — Contre-argumentation :
    Certaines personnes disent que les devoirs rendent les enfants plus responsables. Mais je pense que les enfants apprennent déjà la responsabilité grâce aux tâches ménagères et au travail en classe, donc les devoirs ne sont pas la seule façon.
  `,
  "de-DE": `
    💡 Lehrertipp: In diesem Absatz geht es um deinen dritten Grund aus der These — oder, wenn du dich für ein Gegenargument entschieden hast, zeigst du hier die andere Meinung.

    Was ist ein Gegenargument?
    Ein Gegenargument ist das, was jemand sagen könnte, der nicht deiner Meinung ist.

    Wenn du ein Gegenargument gewählt hast:
    Beginne damit, was die andere Person glauben könnte. Dann erkläre, warum deine Meinung trotzdem mehr Sinn macht. Das hilft dem Leser, deinem Denken zu vertrauen.

    Was du einbauen solltest:
    - Ein Satz, der die gegenteilige Meinung erklärt
    - Ein Zitat oder eine Tatsache, die dazu passt
    - Ein Satz, der zeigt, warum deine Meinung stärker ist

    Beispiel — Gegenargument:
    Manche sagen, Hausaufgaben machen Kinder verantwortungsbewusster. Aber ich finde, Kinder lernen Verantwortung schon durch Hausarbeiten und Unterricht – Hausaufgaben sind nicht der einzige Weg.
  `,
  "zh-CN": `
    💡 教师提示：这个段落是你论点中的第三个理由 — 或者，如果你选择了反方观点（反驳），这里是展示另一种看法的地方。

    什么是反驳？
    反驳是指那些不同意你观点的人可能会说的话。

    如果你选择了写反方观点：
    先说说别人可能会怎么想。然后解释为什么你的观点更有道理。这样读者会更信任你的思考方式。

    包括的内容：
    - 一句话说明对方的观点
    - 一条相关的引用或事实
    - 一句话说明你的观点为什么更强

    示例 — 反方观点：
    有些人说家庭作业可以帮助孩子变得更有责任感。但我认为孩子们已经可以通过做家务和课堂作业学会责任感了，所以家庭作业不是唯一的方式。
  `
},

    "conclusion": {
       "en-US": `
    💡 Teacher Tip: You’re almost done! Now it’s time to go back and make sure your writing is clear, complete, and easy to read.

    Use your Writer’s Checklist to help you!
    This will help you check your work and get your final draft ready to share.

    Here are some important things to check:
    - ✅ Your writing is in the right order and makes sense
    - ✅ You used quotation marks around your quotes
    - ✅ You stayed on topic and didn’t say “I” or “you” too much
    - ✅ You wrote full words like “do not” instead of short ones like “don’t”
    - ✅ Your sentences are clear and not all the same
    - ✅ You used transition words to connect your ideas
    - ✅ You ended your writing with a strong closing thought

    Pro Tip:
    Use the ✅ boxes to keep track of what you’ve fixed — and click 🔊 to read it out loud and catch anything that sounds funny!
  `,
  "es-ES": `
    💡 Consejo del maestro: ¡Ya casi terminas! Ahora es momento de revisar y asegurarte de que tu escritura sea clara, completa y fácil de leer.

    ¡Usa tu lista de verificación del escritor!
    Esto te ayudará a revisar tu trabajo y preparar tu borrador final para compartirlo.

    Aquí hay algunas cosas importantes que debes revisar:
    - ✅ Tu escritura está en el orden correcto y tiene sentido
    - ✅ Usaste comillas alrededor de tus citas
    - ✅ Te mantuviste en el tema y no usaste “yo” o “tú” demasiado
    - ✅ Escribiste palabras completas como “no lo hace” en lugar de formas cortas como “no”
    - ✅ Tus oraciones son claras y no todas suenan igual
    - ✅ Usaste palabras de transición para conectar tus ideas
    - ✅ Terminaste con una idea final fuerte

    Consejo útil:
    Usa las casillas ✅ para marcar lo que ya revisaste — y haz clic en 🔊 para escucharlo en voz alta y detectar si algo suena raro.
  `,
  "fr-FR": `
    💡 Conseil de l’enseignant : Tu y es presque ! C’est le moment de revenir en arrière pour t’assurer que ton texte est clair, complet et facile à lire.

    Utilise ta liste de vérification de l’écrivain !
    Elle t’aidera à relire ton travail et à préparer ta version finale à partager.

    Voici quelques points importants à vérifier :
    - ✅ Ton texte est dans le bon ordre et a du sens
    - ✅ Tu as utilisé des guillemets autour de tes citations
    - ✅ Tu es resté sur le sujet et tu n’as pas trop utilisé “je” ou “tu”
    - ✅ Tu as écrit des mots complets comme “ne pas” au lieu d’utiliser des contractions comme “n’pas”
    - ✅ Tes phrases sont claires et variées
    - ✅ Tu as utilisé des mots de transition pour relier tes idées
    - ✅ Tu as terminé avec une pensée finale forte

    Astuce :
    Utilise les cases ✅ pour cocher ce que tu as corrigé — et clique sur 🔊 pour l’entendre à voix haute et repérer ce qui sonne bizarre.
  `,
  "de-DE": `
    💡 Lehrertipp: Du bist fast fertig! Jetzt ist es Zeit, zurückzugehen und sicherzustellen, dass dein Text klar, vollständig und gut lesbar ist.

    Nutze deine Schreib-Checkliste zur Hilfe!
    Sie hilft dir, deinen Text zu überprüfen und deinen letzten Entwurf fertigzustellen.

    Hier sind ein paar wichtige Dinge, die du überprüfen solltest:
    - ✅ Deine Abschnitte sind in der richtigen Reihenfolge und ergeben Sinn
    - ✅ Du hast Anführungszeichen um Zitate gesetzt
    - ✅ Du bist beim Thema geblieben und hast “ich” oder “du” nicht zu oft verwendet
    - ✅ Du hast ganze Wörter wie “nicht tun” geschrieben statt Kurzformen wie “tun's nicht”
    - ✅ Deine Sätze sind klar und klingen nicht alle gleich
    - ✅ Du hast Übergangswörter verwendet, um deine Ideen zu verbinden
    - ✅ Du hast deinen Text mit einem starken Schlussgedanken beendet

    Profi-Tipp:
    Nutze die ✅-Kästchen, um abzuhaken, was du schon verbessert hast — und klicke auf 🔊, um es dir laut anzuhören und zu merken, wenn etwas komisch klingt!
  `,
  "zh-CN": `
    💡 教师提示：你快完成了！现在是时候回头检查一下你的写作是否清晰、完整、容易阅读。

    使用你的写作检查清单！
    它可以帮助你检查自己的写作，并准备好最终稿进行分享。

    以下是一些重要的检查内容：
    - ✅ 你的段落顺序正确，并且通顺有逻辑
    - ✅ 你在引用周围加上了引号
    - ✅ 你保持了主题，没有频繁使用“我”或“你”
    - ✅ 你使用了完整的词语，比如写“不要”而不是“别”
    - ✅ 你的句子清楚明了，而且不都一样
    - ✅ 你使用了过渡词来连接想法
    - ✅ 你用一个有力的结尾句结束了文章

    小贴士：
    使用 ✅ 方框来记录你已经修改的内容 — 然后点击 🔊，大声朗读，看看有没有听起来不对的地方！
  `
}

    };

    function translateSection(sectionId) {
        const lang = document.getElementById('directionLangSelect').value;
        const dict = sectionTranslations[lang];
        if (!dict) {
          alert("❌ Translation not available yet for this language.");
          return;
        }
      
        const sectionEl = document.getElementById(sectionId);
        if (!sectionEl) return;
      
        // Gather all translatable elements
        const translatables = sectionEl.querySelectorAll('[data-original]');
      
        const spokenSentences = [];
      
        translatables.forEach(el => {
          const original = el.getAttribute('data-original');
          const translated = dict[original];
          if (translated) {
            el.title = translated;
            el.setAttribute('data-translated', translated);
            spokenSentences.push(translated);
          }
        });
      
        // Also find and open any hidden tips inside this section
        const hiddenTips = sectionEl.querySelectorAll('.teacher-tip.hidden');
        hiddenTips.forEach(tip => {
          tip.classList.remove('hidden');
          const original = tip.getAttribute('data-original');
          const translated = dict[original];
          if (translated) {
            spokenSentences.push(translated);
          }
        });
      
        // Speak all sentences
        if (spokenSentences.length > 0) {
          speakTextSequence(spokenSentences, lang);
        }
      }

// end multilangual-directions-data.js //