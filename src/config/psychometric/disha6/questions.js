/**
 * DISHA — Test 6 of 8
 * Creative Thinking, Innovation Mindset, Entrepreneurial Potential &
 * Problem-Solving Style.
 *
 * Target: Classes 9–12, Ages 13–25. Duration 30–45 min. CCRE weight 15–20% of
 * the Master Combined Score.
 *
 * India has produced Sundar Pichai, Ritesh Agarwal, Falguni Nayar, Kunal Shah
 * and Byju Raveendran — people who built transformative products from a
 * country where creativity was historically undermined by rote-learning
 * education. Test 6 identifies where a student sits on that spectrum and what
 * it means for their career: the TYPE of creativity they have (divergent
 * thinking, design sensitivity, innovation orientation, entrepreneurial
 * execution), how it interacts with their academic/personality profile from
 * Tests 1–5, and which career pathways will channel it most productively.
 *
 * Section map
 *  A — Creative Thinking: Divergent Tasks (TTCT-adapted)   8 open-ended tasks
 *  B — Creative Self-Report                                 18 Likert items
 *  C — Innovation Mindset & Idea Generation                 16 Likert + 4 FC pairs
 *  D — Entrepreneurial Potential                            24 items, 4 sub-scales × 6
 *  E — Problem-Solving Style                                16 Likert, 4 styles × 4
 *  F — Aesthetic & Design Sensitivity                        14 Likert items
 *  G — SJT Block 1: Creative & Entrepreneurial Dilemmas      8 MO/LO scenarios
 *  H — SJT Block 2: Innovation & Startup Scenarios           7 MO/LO scenarios
 *  V — Validity (embedded)                                   8 items (SD + admin-rule RII)
 *
 * A note on Section V fidelity: the source review document lists a Validity
 * section (8 items, "SD + RII") only in its summary table — the literal item
 * text does not appear anywhere in the 44-page document. The items below are
 * constructed following the exact LikeMe/social-desirability pattern already
 * established in DISHA Tests 4 and 5 (aspirational, agree-keyed statements).
 * The one validity RULE the source document does specify explicitly (in its
 * §16.2 administration notes) — flagging responses where all 3 RoteConstraint
 * items (Section B) are answered "Strongly Disagree" as a social-desirability
 * signal to be cross-checked against Section A performance — is implemented
 * directly in scoring.js.
 *
 * A note on Section A scoring fidelity: the source document's Fluency/
 * Flexibility/Originality/Elaboration scoring depends on a norm-referenced
 * frequency table built from an actual Indian Class 9–12 student response
 * sample ("human calibration during the norming phase"). No such sample
 * exists in this codebase. scoring.js implements a documented, best-effort
 * algorithmic proxy for these dimensions rather than fabricating a fake norm
 * table — the same scope decision already made for "college database" and
 * "specific institution" gaps in the Class 10 and Class 12 tests.
 */

/* =========================================================================
   SECTION A — CREATIVE THINKING: DIVERGENT TASKS (8 tasks, TTCT-adapted)
   Open-ended text responses. Instruction: "For each task, write as many ideas
   as you can within the time limit. There are no right or wrong answers —
   unusual, creative, or unexpected ideas are especially valued. Write
   quickly, don't filter your ideas."
   ========================================================================= */
const DIVERGENT_TASKS = [
  {
    id: "DT1", title: "Alternative Uses", timeSeconds: 90,
    prompt: "List as many different uses as you can think of for a STEEL TIFFIN BOX (dabba), other than its normal use for carrying food.",
    scoringNote: "Fluency: total valid uses. Flexibility: distinct categories (storage, musical instrument, building material, flotation device, planter, cooking vessel, message container, artistic medium). Originality: rated against norm-group frequency — rare uses score higher. Elaboration: detailed descriptions score higher than a bare label.",
    indiaContextStars: 1,
  },
  {
    id: "DT2", title: "Consequences", timeSeconds: 120,
    prompt: "Imagine that ALL private vehicles (cars, bikes, autos) are BANNED in Indian cities for the next 10 years. List as many consequences as you can think of — social, economic, environmental, behavioural, technological. Include both obvious AND unexpected consequences.",
    scoringNote: "Fluency: total consequences listed. Flexibility: breadth of categories (transport, economy, culture, health, gender safety, real estate, etc.). Originality: unexpected second- and third-order consequences score highest. Elaboration: developed scenarios score higher than a one-line mention.",
    indiaContextStars: 1,
  },
  {
    id: "DT3", title: "Product Improvement", timeSeconds: 180,
    prompt: "The NCERT textbook has been largely unchanged for decades. Suggest as many improvements as you can — to its content, format, physical design, supplementary materials, or delivery method — to make it dramatically more effective for students in India in 2025.",
    scoringNote: "Fluency: total ideas. Flexibility: breadth of improvement types (visual design, interactive elements, multilingual support, teacher training, digital integration, regional relevance, exam alignment, student agency features). Originality: ideas that go beyond the obvious. Elaboration: specific implementation details.",
    indiaContextStars: 2,
  },
  {
    id: "DT4", title: "Unusual Connections", timeSeconds: 75,
    prompt: "What do the following 4 things have in common? Find as many connections as you can — they can be physical, conceptual, metaphorical, or functional: MONSOON RAIN · CRICKET · CHAI · EXAMINATION.",
    scoringNote: "Flexibility and Originality focused. Simple literal connections (all Indian cultural elements) score 1 point. Abstract/metaphorical connections score higher (e.g. 'all create collective anticipation and anxiety in Indian families'). Unique connections across categories score highest.",
    indiaContextStars: 3,
  },
  {
    id: "DT5", title: "Just Suppose", timeSeconds: 120,
    prompt: "Suppose that electricity in India became FREE for all households and small businesses starting tomorrow. What would happen? List as many consequences, opportunities, new business ideas, social changes, and challenges as you can imagine.",
    scoringNote: "Fluency: total ideas. Flexibility: categories covered (economic, social, business, environmental, technological, political). Originality: second-order effects and non-obvious implications. Elaboration: developed scenarios with implementation thought.",
    indiaContextStars: 1,
  },
  {
    id: "DT6", title: "Story Titles", timeSeconds: 90,
    prompt: "Look at this scene: an old woman sits alone at a railway station, watching hundreds of people rush past. She is holding a small, wrapped gift. Generate as many possible story or film titles for this scene as you can — titles that capture the emotion, story, or meaning of it.",
    scoringNote: "Originality and Elaboration focused. Literal titles ('Woman at Railway Station') score 0. Emotionally resonant titles score 1. Poetically original titles score 2. Titles suggesting a rich narrative arc score 3. Tests verbal-artistic originality; scored in Hindi or English.",
    indiaContextStars: 0,
  },
  {
    id: "DT7", title: "Problem Finding", timeSeconds: 120,
    prompt: "Think about DAILY LIFE in an Indian village (or small town) that you know or can imagine. List as many PROBLEMS, INEFFICIENCIES, or UNMET NEEDS as you can identify — problems that technology, social innovation, or a new business model could potentially solve.",
    scoringNote: "Fluency: total problems identified. Flexibility: variety of problem domains (healthcare access, agriculture, waste management, water, financial inclusion, connectivity, gender safety, entertainment). Originality: non-obvious, under-articulated problems score higher. Elaboration: specific, vivid problem descriptions.",
    indiaContextStars: 3,
    substitutionNote: "If the student has never been to a village or small town, they may substitute 'a neighbourhood or area you are less familiar with in your city.' The goal is empathic problem-observation, not geographic knowledge.",
  },
  {
    id: "DT8", title: "Idea Elaboration", timeSeconds: 120,
    prompt: "Here is a basic idea: 'A mobile app that helps small vegetable vendors in Indian cities manage their daily inventory and connect with regular customers.' Develop this idea as richly as possible — add features, solve potential problems, describe users, imagine how it would work, think about what could go wrong and how to fix it.",
    scoringNote: "Elaboration focus. Simple feature list = 1–2 pts per feature. Problem-anticipation and solution = 2–3 pts extra. User empathy and real-world specifics (e.g. voice interface in local language for vendors without smartphones) = high Originality. Business model consideration = extra Elaboration points.",
    indiaContextStars: 3,
  },
];

/* =========================================================================
   SECTION B — CREATIVE SELF-REPORT (18 items)
   Format: 1..5 Strongly Disagree → Strongly Agree.
   CreativeIdentity(4) · CreativeHistory(4) · CreativeConfidence(3) ·
   RoteConstraint(3, contributes to the Creativity Suppression Index) ·
   Aesthetic(2) · DivergentDisp(2).
   ========================================================================= */
const CREATIVE_SELF_REPORT = [
  { id: "B1", scale: "CreativeIdentity", indiaSpecific: true, text: "I think of myself as a creative person — even if the education system around me hasn't particularly encouraged it." },
  { id: "B2", scale: "CreativeIdentity", indiaSpecific: false, text: "I have an active imagination — I often find myself thinking about things in unusual or unconventional ways." },
  { id: "B3", scale: "CreativeIdentity", indiaSpecific: true, text: "When I am given a 'free choice' task (an essay with no set topic, a project with no fixed format), I genuinely enjoy the freedom." },
  { id: "B4", scale: "CreativeIdentity", indiaSpecific: false, text: "People around me — friends, family, teachers — have noticed and commented on my creative or original thinking." },
  { id: "B5", scale: "CreativeHistory", indiaSpecific: true, text: "I have independently created something — a story, a design, a piece of music, a business idea, a game, an invention, a social initiative — outside of school requirements." },
  { id: "B6", scale: "CreativeHistory", indiaSpecific: true, text: "I have a portfolio, sketchbook, blog, YouTube channel, Instagram page, notebook of ideas, or any space where I collect and develop my creative output." },
  { id: "B7", scale: "CreativeHistory", indiaSpecific: true, text: "I have entered, won, or seriously participated in a creative competition, hackathon, design contest, or innovation challenge." },
  { id: "B8", scale: "CreativeHistory", indiaSpecific: false, text: "I regularly generate new ideas — for products, services, solutions, stories, or experiences — even when nobody has asked me to." },
  { id: "B9", scale: "CreativeConfidence", indiaSpecific: false, text: "I believe my creativity is a real strength — not just a minor trait but a core part of who I am." },
  { id: "B10", scale: "CreativeConfidence", indiaSpecific: false, text: "I am willing to put my creative work out into the world even when I know it might be judged or criticised." },
  { id: "B11", scale: "CreativeConfidence", indiaSpecific: false, text: "I feel confident experimenting and trying unusual approaches, even when they might not work out." },
  { id: "B12", scale: "RoteConstraint", reverse: true, indiaSpecific: true, text: "I find it difficult to think creatively because my whole education has been about finding the 'correct' answer." },
  { id: "B13", scale: "RoteConstraint", reverse: true, indiaSpecific: true, text: "I feel embarrassed sharing an unusual or creative idea in class because it might be considered wrong or strange." },
  { id: "B14", scale: "RoteConstraint", reverse: true, indiaSpecific: true, text: "I have censored or suppressed my own creative ideas because they seemed too unusual or not 'practical' enough." },
  { id: "B15", scale: "Aesthetic", indiaSpecific: false, text: "I am sensitive to beauty — in nature, architecture, design, music, language, mathematics — I notice things others walk past." },
  { id: "B16", scale: "Aesthetic", indiaSpecific: false, text: "I am drawn to understanding how things were designed and why they look, feel, or function the way they do." },
  { id: "B17", scale: "DivergentDisp", indiaSpecific: false, text: "When faced with a problem, my natural approach is to generate many possible solutions before evaluating any of them." },
  { id: "B18", scale: "DivergentDisp", indiaSpecific: false, text: "I enjoy exploring ideas from completely different fields and finding unexpected connections between them." },
];

/* =========================================================================
   SECTION C — INNOVATION MINDSET & IDEA GENERATION (16 items + 4 FC pairs)
   Format: 1..5 Strongly Disagree → Strongly Agree.
   ProblemFinding(4) · Experimentation(3) · SystemsThinking(2) ·
   IndiaInnovation(2) · CombinativeThink(2) · ConstraintCreativity(2) ·
   Initiative(1).
   ========================================================================= */
const INNOVATION_MINDSET = [
  { id: "C1", scale: "ProblemFinding", indiaSpecific: true, text: "I actively notice problems and inefficiencies around me — in my school, neighbourhood, or community — and find myself thinking about how to fix them." },
  { id: "C2", scale: "ProblemFinding", indiaSpecific: false, text: "I am not content with 'that's how it has always been done' — I am drawn to questioning why things work the way they do." },
  { id: "C3", scale: "ProblemFinding", indiaSpecific: false, text: "I often find myself thinking: 'Why doesn't someone build this? Why doesn't this exist?'" },
  { id: "C4", scale: "ProblemFinding", indiaSpecific: false, text: "I find it more interesting to identify a previously overlooked problem than to solve a well-defined existing one." },
  { id: "C5", scale: "Experimentation", indiaSpecific: false, text: "I enjoy testing ideas in the real world — building a prototype, running a small experiment, launching a pilot — rather than only planning." },
  { id: "C6", scale: "Experimentation", indiaSpecific: false, text: "I believe failure in an experiment or innovation attempt is primarily valuable information — not a personal defeat." },
  { id: "C7", scale: "Experimentation", indiaSpecific: true, text: "I have tried to build something new — a small business, a product, an app, a social campaign — even informally." },
  { id: "C8", scale: "SystemsThinking", indiaSpecific: false, text: "When I look at a problem, I naturally think about all the connected factors that cause it — not just the obvious surface symptom." },
  { id: "C9", scale: "SystemsThinking", indiaSpecific: false, text: "I can imagine how changing one element of a system (a policy, a product feature, a social norm) would ripple through and affect many other things." },
  { id: "C10", scale: "IndiaInnovation", indiaSpecific: true, text: "I believe India has an enormous number of unsolved problems that are actually incredible opportunities for innovation — in agriculture, healthcare, education, and infrastructure." },
  { id: "C11", scale: "IndiaInnovation", indiaSpecific: true, text: "I follow or am inspired by Indian innovators and entrepreneurs — people who have built solutions specific to India's challenges." },
  { id: "C12", scale: "CombinativeThink", indiaSpecific: false, text: "My best ideas often come from combining two completely different fields — not from staying within one domain." },
  { id: "C13", scale: "CombinativeThink", indiaSpecific: false, text: "I am drawn to learning about fields very different from my main area of study or interest — because unusual combinations produce the best ideas." },
  { id: "C14", scale: "ConstraintCreativity", indiaSpecific: true, text: "I find that working with tight constraints (limited money, limited time, limited resources) often produces more creative solutions than having everything available." },
  { id: "C15", scale: "ConstraintCreativity", indiaSpecific: true, text: "The Jugaad approach — finding ingenious low-cost solutions using available resources — is something I genuinely admire and practice." },
  { id: "C16", scale: "Initiative", indiaSpecific: false, text: "When I have an idea I believe in, I take the first step — I start, even if imperfectly — rather than waiting until I have a complete plan." },
];

// Forced-choice innovation-preference pairs — no right answer, tally a style tally.
const INNOVATION_FC = [
  { id: "CFC1", prompt: "When two approaches to a problem conflict, which resonates more?",
    optionA: { key: "Incremental", text: "Improve and optimise what already exists — make an existing product, system, or process significantly better" },
    optionB: { key: "Radical", text: "Build something completely new that doesn't exist yet — even if it means starting from scratch with high uncertainty" } },
  { id: "CFC2", prompt: "When two approaches to a problem conflict, which resonates more?",
    optionA: { key: "DeepDevelop", text: "Work alone on an idea in focused depth — getting the concept perfect before involving anyone else" },
    optionB: { key: "RapidPrototype", text: "Test a rough, imperfect idea with real users as quickly as possible — let feedback shape it" } },
  { id: "CFC3", prompt: "When two approaches to a problem conflict, which resonates more?",
    optionA: { key: "RiskAverse", text: "A proven solution that reliably works — even if it's less innovative — is more valuable than a brilliant idea that might fail" },
    optionB: { key: "RiskSeeking", text: "A brilliant new idea that carries real risk of failure is more exciting and worth attempting than a safe, incremental improvement" } },
  { id: "CFC4", prompt: "When two approaches to a problem conflict, which resonates more?",
    optionA: { key: "DeepFocus", text: "Focus on one well-defined problem and solve it completely" },
    optionB: { key: "BroadExplore", text: "Explore many different problems and generate initial solutions for several simultaneously" } },
];

/* =========================================================================
   SECTION D — ENTREPRENEURIAL POTENTIAL (24 items, 4 sub-scales × 6)
   Format: 1..5 Strongly Disagree → Strongly Agree.
   ========================================================================= */
const ENTREPRENEURIAL = [
  // D-1 Opportunity Recognition
  { id: "D1", scale: "OppRec", indiaSpecific: false, text: "I naturally notice market gaps — products or services that people need but can't currently get, or get only poorly." },
  { id: "D2", scale: "OppRec", indiaSpecific: true, text: "When I encounter a frustrating experience as a customer (bad app, poor service, missing product), I almost always find myself thinking: 'Someone should build this differently.'" },
  { id: "D3", scale: "OppRec", indiaSpecific: true, text: "I can identify business opportunities in everyday situations that others overlook — in my neighbourhood, school, or daily interactions." },
  { id: "D4", scale: "OppRec", indiaSpecific: true, text: "I follow Indian startup news or entrepreneurship stories not just out of curiosity but because I am genuinely studying the opportunities they identified." },
  { id: "D5", scale: "OppRec", indiaSpecific: true, text: "I have had at least one idea for a business, product, or service that I genuinely believe would work, even if I haven't acted on it yet." },
  { id: "D6", scale: "OppRec", indiaSpecific: false, text: "I think in terms of: 'What do people need? What would they pay for? What is missing in the market?'" },
  // D-2 Risk Willingness & Financial Tolerance
  { id: "D7", scale: "RiskWill", indiaSpecific: true, text: "I am willing to accept an income of ₹0–20,000/month for 1–2 years in exchange for building something of my own with significant long-term potential." },
  { id: "D8", scale: "RiskWill", indiaSpecific: false, text: "The idea of having no guaranteed monthly salary — but unlimited upside — is more motivating to me than the reverse." },
  { id: "D9", scale: "RiskWill", indiaSpecific: true, text: "I could handle the social pressure of being 'the one who started a business' in my family or community, with all the expectations and judgements that come with it." },
  { id: "D10", scale: "RiskWill", indiaSpecific: false, text: "I am comfortable making decisions with incomplete information — I don't need certainty to act." },
  { id: "D11", scale: "RiskWill", indiaSpecific: false, text: "If my first startup failed, I would learn from it and try again — I would not interpret it as permanent evidence that entrepreneurship is not for me." },
  { id: "D12", scale: "RiskWill", indiaSpecific: true, text: "I could survive, emotionally and practically, a period where I have no income, clear direction, or public validation for my work." },
  // D-3 Execution & Drive
  { id: "D13", scale: "Execution", indiaSpecific: false, text: "I take initiative — when I see something that needs to be done, I start doing it without being asked or waiting for perfect conditions." },
  { id: "D14", scale: "Execution", indiaSpecific: false, text: "I have a track record of completing projects I start — I am not someone who has many unfinished ideas." },
  { id: "D15", scale: "Execution", indiaSpecific: false, text: "I am comfortable selling — pitching an idea, persuading people to join me, convincing someone to pay for something I built." },
  { id: "D16", scale: "Execution", indiaSpecific: true, text: "I can motivate and lead other people toward a goal — I have done it in school, college, sports, or community contexts." },
  { id: "D17", scale: "Execution", indiaSpecific: false, text: "I am highly self-disciplined when working on something I care about — I don't need external deadlines or supervision to make progress." },
  { id: "D18", scale: "Execution", indiaSpecific: false, text: "I get things done — even imperfectly — rather than waiting until everything is perfect." },
  // D-4 Resilience in Business Context
  { id: "D19", scale: "BizResilience", indiaSpecific: false, text: "When customers reject my idea or product, my primary response is curiosity — 'Why? What do they actually need?' — not discouragement." },
  { id: "D20", scale: "BizResilience", indiaSpecific: false, text: "I can handle public failure — a product that doesn't work, a pitch that gets rejected, a business that closes — without it defining my identity." },
  { id: "D21", scale: "BizResilience", indiaSpecific: true, text: "I believe that almost every successful Indian entrepreneur failed multiple times before succeeding — and this reality motivates rather than deters me." },
  { id: "D22", scale: "BizResilience", indiaSpecific: false, text: "I can keep working on an idea for months without external validation or positive feedback, driven purely by my own belief in it." },
  { id: "D23", scale: "BizResilience", indiaSpecific: true, text: "I am comfortable navigating ambiguous regulatory and market environments — like India's GST system, MSME policies, or informal market dynamics." },
  { id: "D24", scale: "BizResilience", indiaSpecific: false, text: "If someone significantly more successful than me was critical of my business idea, I could evaluate their feedback rationally — taking what's useful and not internalising the rest." },
];

/* =========================================================================
   SECTION E — PROBLEM-SOLVING STYLE (16 items, 4 styles × 4)
   Format: 1..5 Strongly Disagree → Strongly Agree. All items neutral —
   no style is presented as superior.
   ========================================================================= */
const PROBLEM_SOLVING_STYLE = [
  { id: "E1", scale: "Analytical", text: "When I face a complex problem, my first instinct is to gather all available data and analyse it systematically before acting." },
  { id: "E2", scale: "Analytical", text: "I prefer to fully understand the root cause of a problem before attempting a solution." },
  { id: "E3", scale: "Analytical", text: "I am most effective when I have sufficient time to research and think through a problem carefully." },
  { id: "E4", scale: "Analytical", text: "I naturally evaluate pros and cons, consider evidence, and follow logical chains of reasoning when problem-solving." },
  { id: "E5", scale: "Creative", text: "My best solutions often come from unexpected angles — combining ideas from unrelated fields or generating a completely novel approach." },
  { id: "E6", scale: "Creative", text: "I find conventional, 'by-the-book' solutions unsatisfying — I am always looking for a more creative or elegant approach." },
  { id: "E7", scale: "Creative", text: "When brainstorming, I tend to generate more and more unusual ideas — I prefer quantity and novelty over quickly converging on one answer." },
  { id: "E8", scale: "Creative", text: "I find constraints and rules creatively stimulating rather than limiting." },
  { id: "E9", scale: "Practical", text: "I prefer to try something — even imperfectly — rather than spending too much time analysing or brainstorming." },
  { id: "E10", scale: "Practical", text: "A good-enough solution implemented quickly is often better than a perfect solution implemented too late." },
  { id: "E11", scale: "Practical", text: "I focus primarily on what can realistically be done given the constraints of time, money, and resources." },
  { id: "E12", scale: "Practical", text: "I get frustrated with too much brainstorming or discussion — I want to move to action." },
  { id: "E13", scale: "Collaborative", text: "My best ideas come through discussion with others — the process of talking through a problem generates solutions I wouldn't reach alone." },
  { id: "E14", scale: "Collaborative", text: "I naturally involve a diverse group of people in problem-solving — different perspectives produce better solutions." },
  { id: "E15", scale: "Collaborative", text: "I am good at synthesising different people's ideas into a coherent solution." },
  { id: "E16", scale: "Collaborative", text: "I prefer consensus-building to unilateral decision-making, even if it takes more time." },
];

/* =========================================================================
   SECTION F — AESTHETIC & DESIGN SENSITIVITY (14 items)
   Format: 1..5 Strongly Disagree → Strongly Agree.
   Aesthetic(4) · DesignThink(3) · IndiaDesign(2) · PersonalDesign(2) ·
   AestheticJudge(3).
   ========================================================================= */
const DESIGN_SENSITIVITY = [
  { id: "F1", scale: "Aesthetic", indiaSpecific: false, text: "I notice the design quality of everyday objects — whether a chair is well-proportioned, whether an app interface feels intuitive, whether a building is beautifully or poorly designed." },
  { id: "F2", scale: "Aesthetic", indiaSpecific: false, text: "I am affected by my environment — a beautiful, well-designed space genuinely improves my mood and thinking." },
  { id: "F3", scale: "Aesthetic", indiaSpecific: false, text: "I find myself noticing font choices, colour palettes, and layout decisions in posters, apps, books, and websites — even when I'm not trying to." },
  { id: "F4", scale: "Aesthetic", indiaSpecific: false, text: "I have a strong sense of what looks 'right' vs 'wrong' in visual design — even if I can't always explain why." },
  { id: "F5", scale: "DesignThink", indiaSpecific: false, text: "I find the history and evolution of design — how a product, building, or visual style developed over time — genuinely fascinating." },
  { id: "F6", scale: "DesignThink", indiaSpecific: false, text: "I approach object or space design with empathy — I think about the person who will use it: their habits, frustrations, and delights." },
  { id: "F7", scale: "DesignThink", indiaSpecific: false, text: "I notice when a product or service has been designed with deep care and attention to the user's experience." },
  { id: "F8", scale: "IndiaDesign", indiaSpecific: true, text: "I am drawn to the design vocabulary of traditional Indian crafts, textiles, and architecture — and find them relevant to contemporary design." },
  { id: "F9", scale: "IndiaDesign", indiaSpecific: true, text: "I find it exciting to see how Indian design traditions (Madhubani, Warli, Ikat, Kolam) can be reimagined in modern, digital, or product contexts." },
  { id: "F10", scale: "PersonalDesign", indiaSpecific: false, text: "I have an instinctive design sense that I express — in how I arrange my room, design presentations, dress, or compose photographs." },
  { id: "F11", scale: "PersonalDesign", indiaSpecific: true, text: "I have independently learned or practiced a design skill — drawing, photography, graphic design, interior arrangement, film editing." },
  { id: "F12", scale: "AestheticJudge", indiaSpecific: false, text: "The difference between a mediocre design and an excellent one is something I notice and care about — it's not trivial to me." },
  { id: "F13", scale: "AestheticJudge", indiaSpecific: false, text: "I am drawn to work where I have aesthetic input — I would find a purely functional role with no attention to quality or beauty unsatisfying." },
  { id: "F14", scale: "AestheticJudge", indiaSpecific: false, text: "I find the intersection of technology and aesthetics — beautiful apps, well-designed products, elegant code — particularly fascinating." },
];

/* =========================================================================
   SECTION G — SJT BLOCK 1: CREATIVE & ENTREPRENEURIAL DILEMMAS (8 scenarios)
   Format: MO/LO. Competencies: Opportunity Recognition, Creative Problem-
   Solving, Risk-Calibration, Execution vs Planning balance, Creative Courage,
   Innovation Ethics.
   ========================================================================= */
const SJT_G = [
  {
    id: "SJT_T6_G1", title: "The Hackathon Opportunity",
    competencies: ["Initiative", "Execution", "Innovation Mindset"],
    context: "Class 11–12 / college student — competitive innovation context",
    scenario: "Priya is in Class 12 (Commerce) and has an idea for a digital payments feature that would allow small vendors to offer 'pay later' credit through UPI — targeted at daily wage workers who need small credit. She has heard about the Smart India Hackathon opening. She has 3 weeks before the registration deadline. She has never participated in a hackathon, doesn't know how to code, and doesn't have a team yet.",
    options: [
      { key: "A", text: "Skip this hackathon — she needs more preparation and a ready team before attempting something this ambitious.", moPoints: 1, note: "Avoidant" },
      { key: "B", text: "Register immediately, find 2–3 interested classmates in the next 2 days, divide work by skill (business case, design mockup, pitch), and learn what she needs as she builds.", moPoints: 3, note: "Initiative + Execution + Creative Courage" },
      { key: "C", text: "Spend the next 3 weeks learning to code first — she can't participate in a tech hackathon without technical skills.", moPoints: 1, note: "Misguided — hackathons are team events; non-technical members contribute business design and strategy" },
      { key: "D", text: "Research the Smart India Hackathon requirements thoroughly this week, attend an online orientation webinar, and then decide whether to register based on what she learns.", moPoints: 3, note: "Analytical approach before acting — also strong" },
    ],
  },
  {
    id: "SJT_T6_G2", title: "The Idea vs the Stable Job",
    competencies: ["Risk Willingness", "Opportunity Recognition", "Pragmatism"],
    context: "Post-graduation — first career decision with entrepreneurial option",
    scenario: "Rohit has graduated from IIT (Civil Engineering, 7.2 CGPA). He has a campus placement offer from L&T (₹9 LPA). He also has an idea for a construction-tech startup — using AI to predict and prevent structural failures in Indian buildings. He has done a feasibility analysis. The problem is real and large. His family has invested heavily in his education and expects a stable job. His ERI score is Founder-Ready.",
    options: [
      { key: "A", text: "Accept the L&T offer — job first, startup later. He needs 2–3 years of industry experience before entrepreneurship anyway.", moPoints: 2, note: "Valid but may miss the momentum window" },
      { key: "B", text: "Decline the placement and begin the startup immediately — the opportunity is too good to delay.", moPoints: 1, note: "High risk — particularly given family financial investment" },
      { key: "C", text: "Accept the L&T offer and simultaneously use the first year to validate the startup idea: speak to 50 potential customers, build a minimal prototype in evenings/weekends, apply for Atal Innovation Mission funding — then revisit the startup vs job decision in 12 months with real data.", moPoints: 3, note: "Analytical + Pragmatic + Risk-calibrated — highest MO for most profiles" },
      { key: "D", text: "Ask his family to let him try the startup for exactly 1 year — with the commitment that he will take a job if it doesn't gain traction within that time.", moPoints: 3, note: "Valid for a high-family-pressure context" },
    ],
  },
  {
    id: "SJT_T6_G3", title: "The Creative Project Conflict",
    competencies: ["Creative Courage", "Problem-Solving", "Assertiveness"],
    context: "School/college project — creative freedom vs teacher instruction",
    scenario: "Kiran is given a History assignment: 'Write a 5-page essay on the causes of the 1857 Sepoy Mutiny.' Kiran wants to instead create a 4-minute documentary-style video with narration, original illustrations, and primary source quotes — presenting the same historical content but in a completely different format. His teacher says: 'That is not what I asked for. Write the essay.'",
    options: [
      { key: "A", text: "Write the standard essay as instructed — it's not worth fighting about.", moPoints: 1, note: "No creative expression" },
      { key: "B", text: "Make the video anyway and submit it — if it's better work, the teacher will recognise it.", moPoints: 2, note: "Valid if the creative output is demonstrably excellent; risks relationship damage with the teacher" },
      { key: "C", text: "Present the idea to the teacher, explain the educational value of the format, show a brief sample, and ask: 'Can I submit the video AND a 2-page written summary that meets the assignment requirement?' Offer a creative compromise.", moPoints: 3, note: "Creative Courage + Negotiation + Practical Compromise — highest MO" },
      { key: "D", text: "Ask the school's principal to allow creative project submissions — change the system, not just this one assignment.", moPoints: 2, note: "Ambitious systems change but ignores the immediate assignment" },
    ],
  },
  {
    id: "SJT_T6_G4", title: "When Your Startup Idea Gets Copied",
    competencies: ["Business Resilience", "Innovation", "Execution"],
    context: "Early entrepreneurship — competitive landscape",
    scenario: "Meera has spent 6 months developing an idea for an AgriTech app connecting farmers in her district to direct buyers. She has 50 farmers onboarded and a working prototype. She discovers that a well-funded Bengaluru startup has just launched an almost identical product — better designed, better funded, and with a national rollout plan. Her motivation drops sharply.",
    options: [
      { key: "A", text: "Shut down the project — if a funded startup is doing the same thing better, there's no point continuing.", moPoints: 0, note: "Lowest — Fixed Mindset + low Business Resilience" },
      { key: "B", text: "Continue and focus on her specific geographical advantage — she knows her district's farmers personally, speaks the local language, and understands the local market better than any Bengaluru startup.", moPoints: 3, note: "Local competitive advantage (execution insight)" },
      { key: "C", text: "Pivot the product in a clearly different direction — perhaps focusing on one specific crop or one specific problem the national startup's generic product won't address well.", moPoints: 3, note: "Creative pivot + differentiation" },
      { key: "D", text: "Reach out to the Bengaluru startup and offer to partner or sell her user base to them.", moPoints: 2, note: "Pragmatic exit — valid if B/C are not viable" },
    ],
  },
  {
    id: "SJT_T6_G5", title: "The Design Criticism",
    competencies: ["Creative Resilience", "Growth Mindset", "Feedback Processing"],
    context: "Design student or aspiring designer",
    scenario: "Anjali has worked intensively for 3 weeks on a UI/UX design project for a hypothetical healthcare app. At her design review, the mentor says: 'This is technically competent but has no personality. The colour palette is timid, the user flows are conventional — it feels like you were afraid to make bold choices. I expected more from you.' Anjali is shocked — she had thought it was her best work.",
    options: [
      { key: "A", text: "Thank the mentor and internally resolve to do better — but feel crushed for the next week.", moPoints: 1, note: "Low Creative Resilience" },
      { key: "B", text: "Ask the mentor immediately: 'Can you show me one example of the kind of boldness you're referring to? I want to understand what direction you mean.' Then go back to the design and make 3 radical changes based on the feedback.", moPoints: 3, note: "Growth Mindset + Analytical feedback-processing + Creative Courage to revise — highest MO" },
      { key: "C", text: "Defend her design choices — she made deliberate decisions that she can explain, and the mentor's feedback is subjective.", moPoints: 2, note: "Valid if the design choices were genuinely intentional and defensible; requires assertiveness and evidence" },
      { key: "D", text: "Start the project over from scratch — clearly the current approach was wrong.", moPoints: 1, note: "Unnecessarily drastic — revision, not abandonment" },
    ],
  },
  {
    id: "SJT_T6_G6", title: "Innovation vs Feasibility",
    competencies: ["Practical Problem-Solving", "Innovation Ethics", "Execution"],
    context: "Class 11–12 / young innovator competition",
    scenario: "Dev has designed an innovative solar-powered water purification device for rural India. It wins a school innovation award. A judge — an engineer from a water NGO — says: 'Beautiful concept. But your cost estimate is ₹8,000 per unit. The people who need this most can afford ₹200. What's your plan?' Dev has no good answer.",
    options: [
      { key: "A", text: "Acknowledge he hasn't solved the cost problem and use the award as motivation to research it — speak to manufacturers, explore government subsidy programmes, and redesign with a ₹200 target.", moPoints: 3, note: "Innovation Ethics + Practical Problem-Solving + Execution humility — highest MO" },
      { key: "B", text: "Argue that the technology will scale and cost will come down naturally over time.", moPoints: 1, note: "Weak — handwaving without a plan" },
      { key: "C", text: "Target a different customer segment — institutions and schools rather than individual households — where ₹8,000 is affordable.", moPoints: 2, note: "Valid additional strategy" },
      { key: "D", text: "Find a partner NGO that can subsidise the cost for rural users.", moPoints: 2, note: "Valid additional strategy" },
    ],
  },
  {
    id: "SJT_T6_G7", title: "The Content Creator Dilemma",
    competencies: ["Creative Courage", "Risk-Taking", "Brand Building"],
    context: "Class 12 / young adult — new-age career decision",
    scenario: "Samyukta (Class 12, Arts stream) has been running a YouTube channel about Indian history and classical art — presented in engaging, contemporary language. She has 28,000 subscribers and her videos regularly reach 50,000+ views. She is passionate about it. Her family wants her to complete a BA History and then prepare for UPSC. She wonders if the YouTube channel itself could become her primary career.",
    options: [
      { key: "A", text: "Continue the channel as a hobby and pursue the BA + UPSC path — it's too risky to rely on YouTube as a primary income.", moPoints: 2, note: "Valid for a risk-averse profile" },
      { key: "B", text: "Drop all other plans and focus entirely on growing the channel — 28,000 subscribers proves there's an audience.", moPoints: 1, note: "High risk — only valid for a very high Risk-Tolerance + Founder-Ready ERI profile" },
      { key: "C", text: "Continue BA History (which directly enriches her content), simultaneously grow the channel, monetise it, and treat it as a serious parallel career track. Reassess in 2 years based on revenue and growth data.", moPoints: 3, note: "Pragmatic + Risk-calibrated parallel track" },
      { key: "D", text: "Explore how to combine both: a career in heritage communication, cultural journalism, or digital museum curation that uses her UPSC preparation AND her channel as complementary assets.", moPoints: 3, note: "Creative synthesis of two paths — highest Innovation score" },
    ],
  },
  {
    id: "SJT_T6_G8", title: "Building a Social Enterprise",
    competencies: ["Social Entrepreneurship", "Innovation", "Execution Drive"],
    context: "Post-graduation / young professional — social impact orientation",
    scenario: "Divya (24, MBA graduate) is deeply passionate about rural education. She has a job offer at McKinsey (₹20 LPA) and also has a working model for a low-cost, gamified learning platform for children in government schools — tested in 3 schools in Rajasthan. 80 teachers are using it voluntarily. She genuinely doesn't know which path to take.",
    options: [
      { key: "A", text: "Take the McKinsey offer — build financial and professional capital for 3 years, then return to the social enterprise.", moPoints: 2, note: "Valid depending on values profile (scored against Altruism + Security values)" },
      { key: "B", text: "Launch the social enterprise immediately — the pilot is working and she has momentum.", moPoints: 2, note: "Valid depending on values profile" },
      { key: "C", text: "Use the next 6 weeks to clarify two things: (a) Can the social enterprise be sustainable — is there a viable funding model (government contracts, CSR, impact investors)? (b) Is McKinsey willing to let her do part-time advisory work for the social enterprise? Decide based on what she learns.", moPoints: 3, note: "Analytical + Evidence-Based + Both-options-tested — highest MO" },
      { key: "D", text: "Ask McKinsey if she can defer the offer by 1 year — test the enterprise full-time, and return to consulting if it doesn't work.", moPoints: 3, note: "Also valid — structured experiment" },
    ],
  },
];

/* =========================================================================
   SECTION H — SJT BLOCK 2: INNOVATION & STARTUP SCENARIOS (7 scenarios)
   ========================================================================= */
const SJT_H = [
  {
    id: "SJT_T6_H1", title: "Inventing the Problem-First",
    competencies: ["Problem Finding", "Innovation Mindset", "Empathy"],
    context: "School or early college — first entrepreneurship exposure",
    scenario: "Ashok (Class 12) has been told by his entrepreneurship teacher: 'Before you think of a startup idea, go observe the world for 2 weeks. Don't look for ideas — look for problems.' He doesn't know where to start.",
    options: [
      { key: "A", text: "Spend 2 weeks using apps and products he finds frustrating and write down everything that bothers him.", moPoints: 2, note: "Valid for secondary research" },
      { key: "B", text: "Spend time in a part of his city or town he usually doesn't visit — a market, a hospital waiting area, a bus terminal — and observe what problems people face there.", moPoints: 3, note: "Experiential observation (Design Thinking empathy)" },
      { key: "C", text: "Read about problems Indian startups are trying to solve and pattern-match to see which are most important.", moPoints: 2, note: "Valid for secondary research" },
      { key: "D", text: "Talk to 10 people in different occupations (vendor, auto driver, schoolteacher, nurse) and ask them: 'What is the biggest frustration or inefficiency you face every day?'", moPoints: 3, note: "Direct customer discovery — the gold standard in entrepreneurship" },
    ],
  },
  {
    id: "SJT_T6_H2", title: "The Pitch Rejection",
    competencies: ["Business Resilience", "Growth Mindset", "Creative Pivoting"],
    context: "Startup pitch or innovation competition",
    scenario: "Nandini has pitched her food-tech startup idea at a college competition. Three judges rejected it: 'Crowded market, no differentiation, unclear unit economics.' She is devastated. Her co-founder wants to give up entirely.",
    options: [
      { key: "A", text: "Give up the idea and start fresh with something completely different.", moPoints: 0, note: "Lowest — premature abandonment" },
      { key: "B", text: "Ask the judges in detail: 'What specific differentiation would make this compelling? What unit economics would you need to see?' Use their feedback as precise design specifications for the next iteration.", moPoints: 3, note: "Evidence-Based learning from failure + Innovation mindset — highest MO" },
      { key: "C", text: "Ignore the feedback — judges are conservative and the idea is solid. Build it anyway.", moPoints: 1, note: "Low Business Resilience + low Growth Mindset" },
      { key: "D", text: "Take 2 weeks off from the startup, then return with fresh eyes and the judges' feedback as a guide.", moPoints: 2, note: "Resilience strategy (break + return)" },
    ],
  },
  {
    id: "SJT_T6_H3", title: "The Copycat Problem",
    competencies: ["Innovation Ethics", "Competitive Strategy", "Problem-Solving"],
    context: "Entrepreneurship context — idea theft concern",
    scenario: "Harish has shared his startup idea with a potential investor. A month later, he discovers the investor has introduced the same idea to another team and is funding them instead. Harish feels betrayed and angry.",
    options: [
      { key: "A", text: "Threaten legal action against the investor.", moPoints: 1, note: "Lowest — escalation before information" },
      { key: "B", text: "Reach out to the investor directly and calmly: 'I'd like to understand what happened. If you believed the idea had merit, why not invest in me?' — gathering information before reacting.", moPoints: 3, note: "Self-Regulation + Analytical information-gathering — highest MO" },
      { key: "C", text: "Accept the lesson: next time, don't share the full idea without an NDA. Then build faster than the competitor.", moPoints: 3, note: "Pragmatic + forward-looking resilience" },
      { key: "D", text: "Give up — if investors can't be trusted, entrepreneurship is not for him.", moPoints: 0, note: "Lowest — avoidant" },
    ],
  },
  {
    id: "SJT_T6_H4", title: "First Customer Rejection",
    competencies: ["Execution", "Resilience", "Creative Problem-Solving"],
    context: "Early-stage startup — first product test",
    scenario: "Sneha has built a tutoring marketplace app for her city. She has shown it to 20 potential customers (parents of school students). 18 out of 20 said they would not pay for it. 'WhatsApp is free — why would we use an app for this?' She is discouraged.",
    options: [
      { key: "A", text: "Shut down the app — the market has spoken.", moPoints: 0, note: "Lowest — Fixed Mindset about market feedback" },
      { key: "B", text: "Ask the 2 who said yes: 'What specifically makes this valuable to you? What would make you recommend it to others?' Build for them first.", moPoints: 3, note: "Execution insight + customer discovery + Creative focus — highest MO" },
      { key: "C", text: "Redesign the app to be free, with a paid premium tier — eliminating the price objection.", moPoints: 2, note: "Valid pivot" },
      { key: "D", text: "Research what specific problem WhatsApp tutoring groups have that an app could solve better, and pivot to solving only that specific problem.", moPoints: 3, note: "Innovation pivot based on data" },
    ],
  },
  {
    id: "SJT_T6_H5", title: "Family Business Innovation",
    competencies: ["Innovation Mindset", "Risk Willingness", "Respect for Tradition"],
    context: "Family business succession context",
    scenario: "Rahul's family has a 30-year-old saree retail business in Varanasi. They are struggling — online players like Meesho and Flipkart are eating their customer base. Rahul has studied digital marketing. His father is resistant to change: 'We have loyal customers. They will come back.'",
    options: [
      { key: "A", text: "Respect his father's view and wait — he will naturally adapt when the crisis becomes undeniable.", moPoints: 1, note: "Low Initiative" },
      { key: "B", text: "Build the family business's Instagram and WhatsApp Business presence in the next 30 days, without needing to change the core business model — just add a digital channel to what already works.", moPoints: 3, note: "Also strong MO (low-risk first step)" },
      { key: "C", text: "Propose a 3-month pilot: 'Let's sell 20% of inventory through Instagram Live. If revenue is better, we expand. If not, we stop.' — evidence-based, low-risk, respects his father's authority.", moPoints: 3, note: "Analytical + Incremental Innovation + Family respect + Evidence-Based — highest MO" },
      { key: "D", text: "Tell his father: 'Either we go digital or we close. I am doing this.' — radical push for immediate transformation.", moPoints: 1, note: "May damage the family relationship and business simultaneously" },
    ],
  },
  {
    id: "SJT_T6_H6", title: "The Atal Tinkering Lab Decision",
    competencies: ["Innovation Initiative", "Learning Agility", "Problem-Finding"],
    context: "Class 9–11 — innovation education opportunity",
    scenario: "Kabir's school has recently set up an Atal Tinkering Lab (ATL) with 3D printers, Arduino kits, and design tools. Most students use it casually. Kabir has 3 hours per week of free ATL time. He has no specific project in mind but is genuinely curious about innovation. He doesn't know where to start.",
    options: [
      { key: "A", text: "Use the ATL casually — try out different equipment without a specific goal.", moPoints: 1, note: "Minimum engagement" },
      { key: "B", text: "Identify one specific real problem he has noticed in his school or home, and commit to spending all 12 weeks of the semester trying to prototype a solution to it using ATL resources.", moPoints: 3, note: "Problem-first innovation approach" },
      { key: "C", text: "Find another interested student and jointly join an ATL national competition — use the deadline and competitive structure as motivation.", moPoints: 3, note: "Execution structure through competition" },
      { key: "D", text: "Watch YouTube tutorials about what people build with 3D printers and Arduino, replicate 2–3 existing projects to learn the tools, then design his own original project from week 7 onwards.", moPoints: 3, note: "Learning Agility approach (build on existing, then invent) — all three (B, C, D) valid depending on personality profile" },
    ],
  },
  {
    id: "SJT_T6_H7", title: "When Creativity Meets Commercial Reality",
    competencies: ["Creative-Commercial Balance", "Pragmatism", "Innovation"],
    context: "Design student or creative professional — client context",
    scenario: "Shreya is a graphic design student. Her first paid client wants a company logo. She designs something she considers genuinely original — a deconstructed, abstract geometric form. The client says: 'I don't understand this at all. My customers are small traders in UP. They need something simple — a name, a simple symbol. Make it easy to understand.' Shreya feels creatively compromised.",
    options: [
      { key: "A", text: "Tell the client the design is correct and they need to trust her creative vision.", moPoints: 1, note: "Low client empathy, poor professional judgment" },
      { key: "B", text: "Ask the client 5 questions: 'Who are your customers? What do you want them to feel when they see this logo? What logos in your industry do you admire?' Then redesign with those constraints — use the brief as a creative challenge, not a limitation.", moPoints: 3, note: "Client empathy + Creative problem-solving within constraints — highest MO" },
      { key: "C", text: "Give the client exactly what they asked for — simple name + symbol — and keep her own creative projects for personal portfolio work.", moPoints: 2, note: "Professional pragmatism — valid. B+C combined = ideal designer approach" },
      { key: "D", text: "Explain to the client why the abstract design is superior and show them examples of similar logos that work for established brands.", moPoints: 1, note: "Low client empathy, poor professional judgment" },
    ],
  },
];

/* =========================================================================
   VALIDITY (embedded, 8 items) — see file header note on Section V fidelity.
   ========================================================================= */
const VALIDITY = [
  { id: "V1", validity: "LikeMe", agreeKeyed: true, text: "I have never once censored or held back a creative idea because I was worried what others would think." },
  { id: "V2", validity: "LikeMe", agreeKeyed: true, text: "I am always completely comfortable with financial risk and uncertainty — it has never worried me at all." },
  { id: "V3", validity: "LikeMe", agreeKeyed: true, text: "I have never given up on an idea or project I started, regardless of how difficult it became." },
  { id: "V4", validity: "LikeMe", agreeKeyed: true, text: "I always generate original, creative ideas — I have never struggled to think of anything unusual or new." },
  { id: "V5", validity: "LikeMe", agreeKeyed: true, text: "I have never felt embarrassed or hesitant to share an unconventional idea with anyone, in any context." },
  { id: "V6", validity: "LikeMe", agreeKeyed: true, text: "I always follow through on every business or creative idea I have — I have never left one unfinished." },
  { id: "V7", validity: "LikeMe", agreeKeyed: true, text: "I am never affected by criticism of my creative or entrepreneurial work — it has no emotional impact on me at all." },
  { id: "V8", validity: "LikeMe", agreeKeyed: true, text: "I have always felt fully supported by my education system in expressing my creativity, without exception." },
];

/* =========================================================================
   SECTION METADATA
   ========================================================================= */
const SECTIONS = [
  { id: "divergentTasks", code: "A", name: "Creative Thinking (Divergent Tasks)", timeMin: 10 },
  { id: "creativeSelfReport", code: "B", name: "Creative Self-Report", timeMin: 5 },
  { id: "innovationMindset", code: "C", name: "Innovation Mindset", timeMin: 4 },
  { id: "entrepreneurial", code: "D", name: "Entrepreneurial Potential", timeMin: 6 },
  { id: "problemSolvingStyle", code: "E", name: "Problem-Solving Style", timeMin: 4 },
  { id: "designSensitivity", code: "F", name: "Aesthetic & Design Sensitivity", timeMin: 4 },
  { id: "scenarios", code: "G·H", name: "Creative & Innovation Scenarios", timeMin: 12 },
];

module.exports = {
  SECTIONS,
  DIVERGENT_TASKS,
  CREATIVE_SELF_REPORT,
  INNOVATION_MINDSET,
  INNOVATION_FC,
  ENTREPRENEURIAL,
  PROBLEM_SOLVING_STYLE,
  DESIGN_SENSITIVITY,
  SJT_G,
  SJT_H,
  VALIDITY,
};
