/**
 * DISHA — Class 10 Stream Selection Test
 *
 * A standalone, focused assessment for Class 10 students choosing a stream for
 * Class 11 (Science PCM, Science PCB, Commerce + Maths, Commerce, Humanities).
 * Unlike the numbered DISHA Tests 1–5, this is a single self-contained test —
 * not part of that battery — restricted to students currently in Class 10.
 *
 * Duration 35–40 min. 7 sections, 59 questions/items total.
 *
 * Section map
 *  1 — Academic Profile (marks)          6 subjects × up to 4 terms + enjoyment (1..5) + 1 open Q
 *  2 — Aptitude Snapshot                 14 timed MCQ: Numerical, Verbal, Logical, Abstract
 *  3 — Interest Profile                  18 items, RIASEC (hidden internal scale), 1..5 Like/Dislike
 *  4 — Values & Preferences              10 items, 1..5 importance
 *  5 — Stream Preferences                6 forced-choice pairs, direct stream signal
 *  6 — Your Context                      6 items — personalises, never blocks a stream
 *  7 — Real-Life Scenarios               5 single-select scenarios — descriptive only (does not
 *                                        change stream probabilities), informs the counsellor view
 *
 * Conventions
 *  - Aptitude: { id, difficulty, dim, text, options[4], hint, answer } — answer is 0-based index.
 *    Scoring: Correct = +1, Wrong = −0.33, Hint used = additional −0.25, Blank = 0.
 *  - Interest: { id, type (RIASEC letter, hidden from client), text, indiaSpecific }.
 *  - Values: { id, scale, text, indiaSpecific }.
 *  - Stream-preference pair: { id, optionA:{text,stream}, optionB:{text,stream} } — stream hidden.
 *  - Scenario: { id, title, situation, options:[{key,text}], skillsTested, bestKeys } — bestKeys
 *    and skillsTested are server-only / counsellor-facing, never sent to the client as "correct".
 */

/* =========================================================================
   SECTION 1 — ACADEMIC PROFILE (marks + enjoyment + "in the zone" subject)
   Marks are normally pre-filled from the student's DISHA profile; the student
   verifies/corrects them here. Terms shown are optional — Board Result may not
   yet exist mid-year.
   ========================================================================= */
const SUBJECTS_C10 = [
  { key: "mathematics", label: "Mathematics" },
  { key: "science", label: "Science" },
  { key: "english", label: "English" },
  { key: "socialScience", label: "Social Science" },
  { key: "hindi", label: "Hindi / 2nd Language" },
  { key: "computerScience", label: "Computer Science / IT" },
];

const TERMS_C10 = [
  { key: "t1", label: "Term 1 / Q-Test" },
  { key: "halfYearly", label: "Half-Yearly" },
  { key: "annual", label: "Annual / Pre-board" },
  { key: "board", label: "Board Result" },
];

const ENJOYMENT_SCALE_NOTE =
  "1 = I strongly dislike studying this · 3 = Neutral · 5 = I genuinely love it";

/* =========================================================================
   SECTION 2 — APTITUDE SNAPSHOT (14 items)
   Numerical (5) · Verbal (4) · Logical (3) · Abstract (2).
   ========================================================================= */
const APTITUDE_C10 = [
  { id: "AP1", difficulty: "Medium", dim: "Numerical",
    text: "A train covers 360 km in 4 hours. How long will it take to cover 594 km at 10% higher speed?",
    options: ["5 hours 24 minutes", "6 hours", "6 hours 30 minutes", "5 hours 48 minutes"],
    hint: "New speed = 90 × 1.1 = 99 km/h. Time = 594 ÷ 99 = ?", answer: 1 },
  { id: "AP2", difficulty: "Easy", dim: "Numerical",
    text: "A shopkeeper marks goods 40% above cost price and offers a 25% discount. His actual profit or loss is:",
    options: ["5% profit", "5% loss", "10% profit", "No profit, no loss"],
    hint: "Selling Price = Cost × 1.40 × 0.75 = 1.05 × Cost", answer: 0 },
  { id: "AP3", difficulty: "Easy", dim: "Numerical",
    text: "Number series: 3, 6, 11, 18, 27, 38, ? (Look at the differences between consecutive terms — they follow a pattern.)",
    options: ["48", "50", "51", "52"],
    hint: "Differences: 3, 5, 7, 9, 11, 13 → next term = 38 + 13", answer: 2 },
  { id: "AP4", difficulty: "Hard", dim: "Numerical",
    text: "Pipe A fills a tank in 12 hours. Pipe B empties it in 18 hours. If both pipes are open simultaneously, the tank fills in:",
    options: ["30 hours", "36 hours", "24 hours", "32 hours"],
    hint: "Net fill rate = 1/12 − 1/18 = 1/36 per hour", answer: 1 },
  { id: "AP5", difficulty: "Medium", dim: "Numerical",
    text: "If 15% of x = 90, what is 35% of (x + 50)?",
    options: ["210", "227.5", "245", "230"],
    hint: "x = 600. Then x + 50 = 650. 35% of 650 = ?", answer: 1 },
  { id: "AP6", difficulty: "Easy", dim: "Verbal",
    text: "DOCTOR : STETHOSCOPE :: ARCHITECT : ? (What does an architect use as their primary measuring tool?)",
    options: ["Blueprint", "Plumb line", "Scale", "Drawing board"],
    hint: "A doctor uses a stethoscope to measure. An architect uses a ___ to measure.", answer: 2 },
  { id: "AP7", difficulty: "Medium", dim: "Verbal",
    text: "Fill in the blank: 'The committee was ______ in its criticism — every flaw was catalogued and examined without exception.'",
    options: ["Effusive", "Perfunctory", "Exhaustive", "Lenient"],
    hint: "The blank means thorough, complete, covering everything without omission.", answer: 2 },
  { id: "AP8", difficulty: "Easy", dim: "Verbal",
    text: "The word LACONIC most closely means:",
    options: ["Verbose and elaborate", "Brief and to-the-point", "Emotionally charged", "Intentionally vague"],
    hint: "From Laconia (Sparta) — famous for saying much in very few words.", answer: 1 },
  { id: "AP9", difficulty: "Medium", dim: "Verbal",
    text: "Reading passage: 'The Chipko Andolan began when communities realised that ecological destruction was directly destroying their livelihoods — not an abstract concern, but a daily reality.' The author most strongly suggests that:",
    options: [
      "Environmental movements are always politically motivated",
      "Economic dependence on nature can drive ecological awareness",
      "The Chipko movement was internationally influenced",
      "All environmental protests are linked to livelihood",
    ],
    hint: "Find the explicit connection the author draws between ecology and livelihood.", answer: 1 },
  { id: "AP10", difficulty: "Medium", dim: "Logical",
    text: "All engineers are problem-solvers. Some problem-solvers are creative. (I) Some engineers are creative. (II) All creative people are engineers. Which conclusion definitely follows from the above statements?",
    options: ["Only I follows", "Only II follows", "Both I and II follow", "Neither I nor II follows"],
    hint: "Creativity overlaps with problem-solving — but there is no guaranteed link directly to engineers.", answer: 3 },
  { id: "AP11", difficulty: "Easy", dim: "Logical",
    text: "Complete the series: AZ, BY, CX, DW, ?",
    options: ["EV", "FW", "EU", "EW"],
    hint: "First letters: A→B→C→D→E (forward). Second letters: Z→Y→X→W→V (backward).", answer: 0 },
  { id: "AP12", difficulty: "Medium", dim: "Logical",
    text: "'If it rains, Kavya carries an umbrella. Kavya is NOT carrying an umbrella today.' What must be true?",
    options: ["It is raining", "It is not raining", "Kavya dislikes umbrellas", "Cannot be determined"],
    hint: "Modus tollens: If P then Q. Not Q → Not P. No umbrella → no rain.", answer: 1 },
  { id: "AP13", difficulty: "Medium", dim: "Abstract",
    text: "Pattern: 2, 6, 12, 20, 30, 42, ? (Each term = n × (n+1) where n = 1, 2, 3…)",
    options: ["52", "54", "56", "58"],
    hint: "1×2=2, 2×3=6, 3×4=12 … → 7×8 = 56", answer: 2 },
  { id: "AP14", difficulty: "Hard", dim: "Abstract",
    text: "January 26, 2020 was a Sunday. 2020 is a leap year. What day was March 8, 2020?",
    options: ["Saturday", "Sunday", "Monday", "Tuesday"],
    hint: "Jan 26 → Mar 8: 5 days (Jan) + 29 days (Feb, leap year) + 8 days (Mar) = 42 days = exactly 6 weeks → same day.", answer: 1 },
];

/* =========================================================================
   SECTION 3 — INTEREST PROFILE (18 items, RIASEC, 3 per type)
   Format: 1..5 Strongly Dislike → Strongly Like. Type is hidden from client.
   ========================================================================= */
const INTEREST_C10 = [
  { id: "IN1", type: "R", indiaSpecific: true, text: "Assembling and repairing a motorcycle engine from spare parts — working with tools to solve a mechanical problem." },
  { id: "IN2", type: "R", indiaSpecific: false, text: "Reading and interpreting engineering or architectural blueprints — understanding how physical structures are designed." },
  { id: "IN3", type: "R", indiaSpecific: true, text: "Growing crops using modern agricultural technology — precision irrigation, soil testing, drone monitoring of fields." },
  { id: "IN4", type: "I", indiaSpecific: true, text: "Conducting a science experiment to understand why a plant disease spreads faster during monsoon seasons." },
  { id: "IN5", type: "I", indiaSpecific: false, text: "Reading about new developments in artificial intelligence, space technology, or quantum computing — even outside schoolwork." },
  { id: "IN6", type: "I", indiaSpecific: true, text: "Analysing data to find patterns — for example, studying why crime rates or poverty levels vary across different Indian districts." },
  { id: "IN7", type: "A", indiaSpecific: false, text: "Writing a short story, poem, or screenplay — creating something genuinely original with words." },
  { id: "IN8", type: "A", indiaSpecific: false, text: "Designing the visual identity of a new app, product, or social cause campaign." },
  { id: "IN9", type: "A", indiaSpecific: true, text: "Choreographing, composing, or performing — whether classical dance, music, theatre, or contemporary art forms." },
  { id: "IN10", type: "S", indiaSpecific: true, text: "Teaching a difficult subject to a classmate who is struggling — explaining it patiently until they genuinely understand." },
  { id: "IN11", type: "S", indiaSpecific: false, text: "Counselling or supporting a friend going through a difficult time — listening, guiding, helping them think clearly." },
  { id: "IN12", type: "S", indiaSpecific: true, text: "Working with an NGO or community group on a project that directly helps disadvantaged or marginalised people." },
  { id: "IN13", type: "E", indiaSpecific: false, text: "Pitching a new business idea — convincing people to invest their time or money in something you genuinely believe in." },
  { id: "IN14", type: "E", indiaSpecific: true, text: "Leading a team or student council — making decisions, organising others, and taking responsibility for outcomes." },
  { id: "IN15", type: "E", indiaSpecific: true, text: "Preparing a policy proposal or debate position — arguing for a change you believe will improve society." },
  { id: "IN16", type: "C", indiaSpecific: true, text: "Maintaining accurate financial accounts for an organisation — organising numbers, ensuring everything balances perfectly." },
  { id: "IN17", type: "C", indiaSpecific: false, text: "Managing and organising large amounts of information — cataloguing, filing, and tracking data with precision." },
  { id: "IN18", type: "C", indiaSpecific: false, text: "Following detailed procedures carefully — ensuring compliance, accuracy, and consistency across all your work without errors." },
];

/* =========================================================================
   SECTION 4 — VALUES & PREFERENCES (10 items)
   Format: 1..5 Not important at all → Extremely important to me.
   ========================================================================= */
const VALUES_C10 = [
  { id: "VA1", scale: "Security", indiaSpecific: false, text: "Job security and a guaranteed income matter more to me than high pay with uncertainty." },
  { id: "VA2", scale: "Growth", indiaSpecific: false, text: "Continuously learning new things and never being bored intellectually is the most important thing a career can give me." },
  { id: "VA3", scale: "Altruism", indiaSpecific: false, text: "I want my career to directly help people who are poor, sick, or marginalised." },
  { id: "VA4", scale: "Prestige", indiaSpecific: true, text: "I want a career that earns strong social respect — one that my family is proud to talk about." },
  { id: "VA5", scale: "Autonomy", indiaSpecific: false, text: "I need personal freedom in my work — I dislike being told exactly what to do and how to do it." },
  { id: "VA6", scale: "Security", indiaSpecific: true, text: "Being able to support my family financially — contributing to household income — is genuinely important to me." },
  { id: "VA7", scale: "Seva", indiaSpecific: true, text: "I want to contribute to India's development as a nation — not just build personal wealth." },
  { id: "VA8", scale: "WLB", indiaSpecific: true, text: "I would rather have time for family, festivals, and personal interests than work long, intense hours." },
  { id: "VA9", scale: "Innovation", indiaSpecific: false, text: "I am genuinely excited by fast-changing fields — AI, renewable energy, space technology — even if they are less stable." },
  { id: "VA10", scale: "Autonomy", indiaSpecific: true, text: "I would choose a career I love, even if my family has strong reservations about it." },
];

/* =========================================================================
   SECTION 5 — STREAM PREFERENCES (6 forced-choice pairs, direct signal)
   Each option is tagged with the stream it signals (hidden from client).
   ========================================================================= */
const STREAM_PREF_C10 = [
  { id: "SP1",
    optionA: { text: "Designing and testing structural calculations for a new bridge — precise engineering mathematics", stream: "PCM" },
    optionB: { text: "Running a health awareness workshop in a rural area — explaining hygiene and disease prevention", stream: "PCB" } },
  { id: "SP2",
    optionA: { text: "Investigating why antibiotic resistance is spreading in Indian hospitals — original scientific research", stream: "PCB" },
    optionB: { text: "Building a business plan for a new startup in Bengaluru and pitching it to investors", stream: "Commerce" } },
  { id: "SP3",
    optionA: { text: "Writing and directing a short documentary film about street food culture in a Tier-2 Indian city", stream: "Humanities" },
    optionB: { text: "Auditing financial records and preparing detailed tax returns — ensuring accuracy and compliance", stream: "Commerce" } },
  { id: "SP4",
    optionA: { text: "Developing software that helps farmers track crop prices and weather patterns in real time", stream: "PCM" },
    optionB: { text: "Designing a government policy to reduce school dropout rates among girls in rural Rajasthan", stream: "Humanities" } },
  { id: "SP5",
    optionA: { text: "Diagnosing and treating patients — using medical knowledge to heal, one patient at a time", stream: "PCB" },
    optionB: { text: "Arguing cases in court — using language, logic, and legal knowledge to fight for justice", stream: "Humanities" } },
  { id: "SP6",
    optionA: { text: "Analysing financial data and building investment models — finding meaningful patterns in numbers", stream: "Commerce" },
    optionB: { text: "Creating a photography series, novel, or music album that expresses a genuinely original vision", stream: "Humanities" } },
];

/* =========================================================================
   SECTION 6 — YOUR CONTEXT (6 items)
   Personalises the result and narrative — no stream option is ever blocked.
   ========================================================================= */
const CONTEXT_C10 = {
  parentPreference: {
    id: "CTX1",
    text: "My parents or guardians have a strong preference for which stream I take in Class 11.",
    note: "Shapes the 'Family-Aligned Path' in your results.",
  },
  financialUrgency: {
    id: "CTX2",
    text: "Choosing a stream that leads to earning income relatively quickly is genuinely necessary for my family's financial situation.",
    note: "Influences career timeline recommendations.",
  },
  geographicConstraint: {
    id: "CTX3",
    text: "I need to study in or near my home city or state — I cannot move to another state for Class 11–12 or college.",
    note: "Filters college recommendations geographically.",
  },
  decisionStatus: {
    id: "CTX4",
    text: "Which of the following best describes you right now?",
    note: "Adjusts the tone of your results report.",
    options: [
      "I have already decided my stream.",
      "I have a general direction but I am still open.",
      "I am genuinely uncertain and still exploring.",
      "I feel anxious and confused about this decision.",
    ],
  },
  examTargets: {
    id: "CTX5",
    text: "Are you already preparing — or planning to prepare — for a specific entrance exam after Class 12?",
    note: "Activates exam probability analysis in results.",
    options: ["JEE (Engineering)", "NEET (Medicine)", "CLAT (Law)", "CA Foundation", "NDA / Defence", "Design entrance (NID / NIFT)", "Not yet decided"],
    multiSelect: true,
  },
  secretInterest: {
    id: "CTX6",
    text: "Is there a stream or career you are secretly interested in but feel you cannot pursue? If yes, what is it and why?",
    note: "The most important question in this section. Your counsellor sees this — it is NEVER shared with parents without your written consent.",
    optional: true,
    counsellorOnly: true,
  },
};

/* =========================================================================
   SECTION 7 — REAL-LIFE SCENARIOS (5) — single-select "most likely" response.
   Descriptive only: per the source document, these DO NOT change stream
   probability scores. They surface decision-making patterns for the
   counsellor and a supportive reflection for the student.
   ========================================================================= */
const SCENARIOS_C10 = [
  {
    id: "SC1",
    title: "Interest vs Marks",
    situation:
      "Priya has scored 89% in her Class 10 mock exams. She is genuinely passionate about writing and has been invited for a portfolio review at NID (National Institute of Design). Her father, a government engineer, and her mother, a school teacher, both insist she take Science PCM for JEE. 'Design is fine as a hobby, but it won't feed a family.' Her maternal uncle, an architect who respects her, asks privately what she truly wants.",
    options: [
      { key: "A", text: "Tell her uncle she will follow her parents' advice — there is no point creating conflict." },
      { key: "B", text: "Ask her uncle to help arrange a calm conversation where NID alumni salary data and placement records are shared with her parents." },
      { key: "C", text: "Independently research NID career outcomes, then present a rational, data-backed case to her parents herself." },
      { key: "D", text: "Secretly plan to take Science while intending to switch to Design after Class 12, without telling her parents." },
    ],
    skillsTested: ["Assertiveness", "Evidence-Based Thinking", "Family Dialogue"],
    bestKeys: ["B", "C"],
  },
  {
    id: "SC2",
    title: "Parental Pressure — PCB vs PCM",
    situation:
      "Arjun's father is a doctor and has assumed for years that Arjun will take PCB and appear for NEET. Arjun's Biology marks are moderate (63%) but his Maths (84%) and Computer Science aptitude are outstanding. He has secretly built two working mobile apps. He is afraid to tell his father he finds Biology genuinely uninteresting.",
    options: [
      { key: "A", text: "Take PCB — his father knows best, and he can always develop his coding interest as a hobby on the side." },
      { key: "B", text: "Take PCM — his marks and genuine interest clearly support it — and have an honest conversation with his father backed by his assessment data." },
      { key: "C", text: "Take PCM but continue studying Biology privately in case his interest develops and he can attempt NEET later." },
      { key: "D", text: "Ask his school counsellor to speak with his father on his behalf, sharing his assessment results, so Arjun does not have to face the conversation alone." },
    ],
    skillsTested: ["Authentic Self-Knowledge", "Evidence-Based Decision Making", "Family Dialogue"],
    bestKeys: ["B", "D"],
  },
  {
    id: "SC3",
    title: "Commerce Stigma",
    situation:
      "Rishi lives in Nagpur where his family and friend group are intensely focused on engineering and PCM. Nobody in his circle has taken Commerce. His genuine interests: he reads business news for fun, manages his school canteen's accounts during events, and wants to study at SRCC or become a CA. He is afraid of being seen as 'the one who couldn't do engineering.'",
    options: [
      { key: "A", text: "Take PCM to avoid social judgment — he can always switch to Commerce later if engineering does not work out." },
      { key: "B", text: "Take Commerce confidently — his interests, aptitude, and genuine excitement about business all point clearly in this direction." },
      { key: "C", text: "Talk to his parents honestly: present what CA and Commerce careers actually earn at senior levels, using real data, before making the decision." },
      { key: "D", text: "Find at least one Commerce student or CA professional to talk to before deciding — he needs a real role model in this environment, not just data." },
    ],
    skillsTested: ["Identity Clarity", "Evidence-Based Thinking", "Role Models"],
    bestKeys: ["C", "D"],
  },
  {
    id: "SC4",
    title: "The Genuinely Undecided Student",
    situation:
      "Tanvi has good marks in everything: Maths 78%, Biology 76%, English 80%, Social Science 74%. She genuinely finds multiple subjects interesting. Her interest scores show moderate ratings across 4 types with no clear dominant profile. She tells her counsellor: 'I don't know what I want. Everyone else seems to know and I feel like there is something wrong with me.'",
    options: [
      { key: "A", text: "Pick PCM — it keeps the most options open and she can decide on a specific career later." },
      { key: "B", text: "Choose the stream where her marks are highest and focus on maximising academic performance — direction will come through excellence." },
      { key: "C", text: "Tell her counsellor honestly that she does not know — this is important information, not a failure. Explore which activities, not which subjects, have felt most engaging in her life." },
      { key: "D", text: "Ask her parents to decide — they have more life experience and can make a more rational choice." },
    ],
    skillsTested: ["Authentic Self-Knowledge", "Counsellor Engagement"],
    bestKeys: ["C"],
  },
  {
    id: "SC5",
    title: "Surprising Assessment Results",
    situation:
      "Kavitha has been planning to take PCM since Class 8, following her elder sister. After this assessment, her Interest Profile shows very high Social (S) and Artistic (A) orientation — both pointing toward Humanities. She is shocked. She asks: 'Does this mean I have been wrong this whole time? What do I do?'",
    options: [
      { key: "A", text: "Ignore the results — she has been committed to PCM for 2 years and should not change based on one test." },
      { key: "B", text: "Immediately announce she is switching to Humanities — the results are clear." },
      { key: "C", text: "Treat the assessment data as an important signal worth exploring — not a definitive verdict. Discuss with her counsellor what specifically within PCM would or would not satisfy her Social and Artistic interests." },
      { key: "D", text: "Take PCM but choose a career within it that serves others — biomedical engineering, environmental science, or architecture all combine technical skill with meaningful impact." },
    ],
    skillsTested: ["Openness to Evidence", "Balanced Decision-Making"],
    bestKeys: ["C", "D"],
  },
];

/* =========================================================================
   STREAMS + SECTION METADATA
   ========================================================================= */
const STREAMS = [
  { key: "PCM", label: "Science (PCM)" },
  { key: "PCB", label: "Science (PCB)" },
  { key: "CommerceMaths", label: "Commerce + Maths" },
  { key: "Commerce", label: "Commerce" },
  { key: "Humanities", label: "Humanities" },
];

const SECTIONS = [
  { id: "academic", code: "1", name: "Academic Profile", items: 6, timeMin: 5 },
  { id: "aptitude", code: "2", name: "Aptitude Snapshot", items: 14, timeMin: 10 },
  { id: "interests", code: "3", name: "Interest Profile", items: 18, timeMin: 5 },
  { id: "values", code: "4", name: "Values & Preferences", items: 10, timeMin: 3 },
  { id: "streamPreference", code: "5", name: "Stream Preferences", items: 6, timeMin: 2 },
  { id: "context", code: "6", name: "Your Context", items: 6, timeMin: 3 },
  { id: "scenarios", code: "7", name: "Real-Life Scenarios", items: 5, timeMin: 7 },
];

module.exports = {
  SECTIONS,
  STREAMS,
  SUBJECTS_C10,
  TERMS_C10,
  ENJOYMENT_SCALE_NOTE,
  APTITUDE_C10,
  INTEREST_C10,
  VALUES_C10,
  STREAM_PREF_C10,
  CONTEXT_C10,
  SCENARIOS_C10,
};
