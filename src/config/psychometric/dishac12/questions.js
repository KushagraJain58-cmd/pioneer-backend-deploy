/**
 * DISHA — Class 12 Career Selection Test
 *
 * A standalone, focused assessment (not part of the numbered Test 1–8 battery)
 * for Class 12 students finalising a career, college, and entrance-exam path.
 * Restricted to students currently in Class 12.
 *
 * Duration 55–70 min. 9 sections, ~115 questions/items total.
 * Output: Top 12 career recommendations, entrance exam probability, life-design
 * aligned 5-year vision, and college-pathway categories (not a specific college
 * database — see scoring.js for the reasoning behind that scope decision).
 *
 * Section map
 *  1 — Academic Profile          Class 10 board + Class 11 annual + Class 12 (actual/predicted)
 *                                 + optional entrance-exam scores already attempted
 *  2 — Aptitude (Extended)       20 harder MCQ: Numerical, Verbal, Logical, Abstract
 *  3 — Personality (OCEAN)       25 Likert items, Big Five
 *  4 — Interests — Full RIASEC   30 Likert items, 5 per Holland type
 *  5 — Career Title Ratings      20 career titles, appeal 1..5 + Holland code + sector
 *  6 — Values & Motivations      12 work-value + 10 motivation Likert items
 *  7 — Life Design Preferences   4 Likert + 3 single-select + 1 Likert (lifestyle/geo/income)
 *  8 — Your Context              8 items — personalises, never blocks a career
 *  9 — Career Scenarios          5 single-select scenarios — descriptive only, informs counsellor
 *
 * A note on source fidelity: a handful of aptitude items in the source review
 * document contain internally inconsistent worked solutions (the stated
 * numeric answer doesn't match any option, or matches a different letter than
 * first written). Where that occurs, the designated answer LETTER is treated
 * as the scoring key (the clearest, most durable signal in the source), and
 * the hint text here is written to guide the correct method without asserting
 * a specific figure that contradicts the available options.
 */

/* =========================================================================
   SECTION 1 — ACADEMIC PROFILE
   Class 10 Board (single term) + Class 11 Annual (stream subjects, freeform
   labels since they depend on the student's stream) + Class 12 (actual or
   predicted, per-subject toggle) + optional entrance-exam scores already
   attempted.
   ========================================================================= */
const CLASS10_SUBJECTS = [
  { key: "mathematics", label: "Mathematics" },
  { key: "science", label: "Science (Aggregate)" },
  { key: "english", label: "English" },
  { key: "socialScience", label: "Social Science" },
  { key: "hindi", label: "Hindi / 2nd Language" },
];

// Class 11 / 12 subjects are freeform-labelled slots (stream-dependent) — the
// student names each slot (e.g. "Physics", "Accountancy", "History"). This
// mirrors the source document's generic "Subject 1 (e.g. Physics / History /
// Accountancy)" placeholders rather than a rigid stream-to-subject map.
const STREAM_SUBJECT_HINTS = {
  "Science PCM": ["Physics", "Chemistry", "Mathematics", "Computer Science / IT"],
  "Science PCB": ["Physics", "Chemistry", "Biology", "Computer Science / IT"],
  "Commerce + Maths": ["Accountancy", "Business Studies", "Economics", "Mathematics"],
  Commerce: ["Accountancy", "Business Studies", "Economics", "Informatics Practices"],
  Humanities: ["History", "Political Science", "Geography", "Economics"],
  Vocational: ["Vocational Subject", "Elective 2", "Elective 3", "Elective 4"],
  Other: ["Subject 1", "Subject 2", "Subject 3", "Subject 4"],
};

const CLASS11_SLOTS = ["subject1", "subject2", "subject3", "subject4", "english", "subject5"];
const CLASS12_SLOTS = ["subject1", "subject2", "subject3", "subject4", "english"];

const ENTRANCE_EXAMS_ATTEMPTED = [
  { key: "jeeMains", label: "JEE Mains", unit: "percentile", note: "If score known; entering this activates JEE-specific probability analysis" },
  { key: "jeeAdvanced", label: "JEE Advanced", unit: "rank", note: "Optional — if attempted" },
  { key: "neet", label: "NEET", unit: "score", note: "Score out of 720" },
  { key: "clat", label: "CLAT", unit: "score", note: "" },
  { key: "cuet", label: "CUET", unit: "score", note: "" },
  { key: "other", label: "Other", unit: "score", note: "Specify exam name" },
];

/* =========================================================================
   SECTION 2 — APTITUDE (EXTENDED, 20 items)
   Numerical (6) · Verbal (5) · Logical (4) · Abstract (5).
   answer is the 0-based option index (the source document's designated
   correct LETTER — see file header note on a few inconsistent items).
   ========================================================================= */
const APTITUDE_C12 = [
  { id: "AP1", difficulty: "Medium", dim: "Numerical",
    text: "A sum of ₹12,500 is invested at 8% per annum compound interest. What is the total interest earned after 2 years?",
    options: ["₹2,000", "₹2,080", "₹1,960", "₹2,120"],
    hint: "CI = P(1 + r/100)ⁿ − P = 12,500 × (1.08)² − 12,500", answer: 1 },
  { id: "AP2", difficulty: "Hard", dim: "Numerical",
    text: "A and B can complete a piece of work together in 12 days. B alone takes 20 days. After working together for 6 days, A leaves. In how many more days will B alone finish the remaining work?",
    options: ["6 days", "7 days", "8 days", "9 days"],
    hint: "Find A's rate from the combined rate, work out how much is done in 6 days together, then divide the remaining fraction by B's daily rate.", answer: 2 },
  { id: "AP3", difficulty: "Hard", dim: "Numerical",
    text: "A bag contains 4 red, 6 blue, and 5 green marbles. Two marbles are drawn at random without replacement. What is the probability that both marbles are the same colour?",
    options: ["31/105", "33/105", "29/105", "27/105"],
    hint: "P(same colour) = [C(4,2) + C(6,2) + C(5,2)] / C(15,2) = [6+15+10]/105", answer: 0 },
  { id: "AP4", difficulty: "Medium", dim: "Numerical",
    text: "A, B, and C invest ₹15,000, ₹12,000, and ₹18,000 in a business for 8, 10, and 6 months respectively. The total profit is ₹54,000. What is B's share of the profit?",
    options: ["₹16,000", "₹18,000", "₹20,000", "₹16,800"],
    hint: "Capital × Time ratio A:B:C = 10:10:9 (sum 29). B's share = (10/29) × 54,000 ≈ ₹18,000.", answer: 1 },
  { id: "AP5", difficulty: "Hard", dim: "Numerical",
    text: "In an election with 3 candidates, Candidate A gets 45% of valid votes, B gets 35%, and C gets the rest. A wins by 2,000 votes over B. Total invalid votes are 5% of votes cast. How many total votes were cast?",
    options: ["20,000", "21,000", "21,053", "22,000"],
    hint: "A − B = 10% of valid votes = 2,000 → valid votes = 20,000. Total = 20,000 ÷ 0.95.", answer: 2 },
  { id: "AP6", difficulty: "Hard", dim: "Numerical",
    text: "A train 180 metres long passes a platform 220 metres long in 20 seconds. Another train 150 metres long, running in the opposite direction, passes the first train in 10 seconds. Find the speed (km/h) of the second train.",
    options: ["54 km/h", "72 km/h", "90 km/h", "63 km/h"],
    hint: "First find the first train's speed from the platform-crossing data: (180+220)/20 m/s, converted to km/h.", answer: 1 },
  { id: "AP7", difficulty: "Hard", dim: "Verbal",
    text: "Rearrange the following sentences to form a coherent paragraph: P. India's semiconductor industry is poised for significant growth driven by global supply chain realignments. Q. Several multinational companies have already announced major investments in Indian fabrication facilities. R. The government's production-linked incentive scheme has provided crucial momentum to domestic manufacturing. S. Yet skilled talent remains the most critical constraint that could determine the pace of this transformation. The correct order is:",
    options: ["PRQS", "RQPS", "PQRS", "RPQS"],
    hint: "Look for the logical flow: general statement → government support → specific evidence → challenge/caveat.", answer: 0 },
  { id: "AP8", difficulty: "Medium", dim: "Verbal",
    text: "Fill in the blanks: 'The economist's ______ analysis of the housing market revealed that the problem was not merely one of supply but of ______ distribution of resources across income groups.'",
    options: ["superficial … equal", "nuanced … inequitable", "preliminary … sufficient", "comprehensive … balanced"],
    hint: "The economist found depth (not superficiality), and the distribution itself was the problem (so not equal or balanced).", answer: 1 },
  { id: "AP9", difficulty: "Hard", dim: "Verbal",
    text: "Reading passage: 'India's urban migration is not simply a story of economic mobility. For millions of first-generation migrants, the city represents both a liberation from caste-based occupational constraints and a new form of precarity — the insecurity of informal employment, absent social networks, and the constant negotiation between two worlds.' The passage most directly argues that urban migration:",
    options: [
      "Is primarily driven by economic opportunity",
      "Creates permanent social instability for all migrants",
      "Involves complex trade-offs between freedom and vulnerability",
      "Has successfully dismantled traditional social hierarchies",
    ],
    hint: "The passage uses 'both…and' to present two simultaneous realities — liberation AND a new form of precarity.", answer: 2 },
  { id: "AP10", difficulty: "Medium", dim: "Verbal",
    text: "The statement 'All good leaders are effective communicators' is given as TRUE. Which of the following conclusions can be DEFINITELY drawn?",
    options: [
      "All effective communicators are good leaders",
      "Some effective communicators are good leaders",
      "No effective communicator is a poor leader",
      "A person who is not an effective communicator cannot be a good leader",
    ],
    hint: "The original statement says A → B. Think carefully about which direction of this implication can be validly reversed (contrapositive).", answer: 3 },
  { id: "AP11", difficulty: "Easy", dim: "Verbal",
    text: "'The author wrote with remarkable clarity.' The word 'clarity' is most closely related to which of the following idioms?",
    options: ["Beat around the bush", "Cut to the chase", "Bite more than you can chew", "Jump on the bandwagon"],
    hint: "'Clarity' means being direct — which idiom means getting to the point without delay?", answer: 1 },
  { id: "AP12", difficulty: "Medium", dim: "Logical",
    text: "A is B's sister. C is B's mother. D is C's father. E is D's wife. How is A related to E?",
    options: ["Granddaughter", "Daughter", "Great-granddaughter", "Niece"],
    hint: "Build the family tree step by step: C is A and B's mother. D is C's father, so D is A's maternal grandfather. E is D's wife.", answer: 0 },
  { id: "AP13", difficulty: "Easy", dim: "Logical",
    text: "In a coded language, STRONG is written as VWURQJ. Using the same code, what is CODE?",
    options: ["FRGH", "GRHF", "FGHR", "HFGR"],
    hint: "Each letter is shifted forward by +3 positions in the alphabet.", answer: 0 },
  { id: "AP14", difficulty: "Hard", dim: "Logical",
    text: "5 friends — Aisha, Bharat, Chandra, Divya, and Eshan — sit around a circular table. Aisha sits directly opposite Chandra. Bharat is to the immediate left of Aisha. Eshan is not adjacent to Chandra. Who is to the immediate right of Chandra?",
    options: ["Aisha", "Bharat", "Divya", "Eshan"],
    hint: "In a 5-person circular arrangement, 'opposite' means 2 seats away. Place Aisha and Chandra across from each other, then use the Bharat and Eshan constraints to fix the remaining seats.", answer: 2 },
  { id: "AP15", difficulty: "Hard", dim: "Logical",
    text: "Statements: (i) All laptops are computers. (ii) Some computers are tablets. (iii) No tablet is a phone. Conclusion: Some laptops are not phones. Is this conclusion valid?",
    options: ["Yes, definitely valid", "No, definitely invalid", "Possibly valid but not certain", "Valid only if some laptops are tablets"],
    hint: "We know all laptops are computers, but not whether any laptop is a tablet — so the laptop-to-phone link cannot be established from these statements.", answer: 1 },
  { id: "AP16", difficulty: "Easy", dim: "Abstract",
    text: "Number matrix — find the missing value: | 4  9  16 | | 25  36  49 | | 64  81  ??? |",
    options: ["96", "100", "104", "108"],
    hint: "The matrix contains perfect squares: 2², 3², 4² … 10².", answer: 1 },
  { id: "AP17", difficulty: "Medium", dim: "Abstract",
    text: "Letter series: A, C, F, J, O, ? (The gaps between consecutive letters follow a specific pattern.)",
    options: ["T", "U", "V", "W"],
    hint: "Gaps: C−A=2, F−C=3, J−F=4, O−J=5 → next gap = 6.", answer: 1 },
  { id: "AP18", difficulty: "Easy", dim: "Abstract",
    text: "Which number does NOT belong in this group? 121, 144, 169, 196, 215, 225",
    options: ["121", "196", "215", "225"],
    hint: "Check which numbers are perfect squares: 11², 12², 13², 14², 15².", answer: 2 },
  { id: "AP19", difficulty: "Medium", dim: "Abstract",
    text: "Symbol analogy: △ → ▽ :: ◁ → ? (What transformation is being applied?)",
    options: ["▷", "▽", "◁", "△"],
    hint: "△ (pointing up) becomes ▽ (pointing down) — a vertical flip. Apply the equivalent flip to ◁ (pointing left).", answer: 0 },
  { id: "AP20", difficulty: "Hard", dim: "Abstract",
    text: "A clock shows 3:40. What is the angle between the hour hand and the minute hand?",
    options: ["120°", "125°", "130°", "135°"],
    hint: "At 3:40: minute hand at 240°. Hour hand at 3×30 + 40×0.5 = 110°. Angle = 240 − 110.", answer: 2 },
];

/* =========================================================================
   SECTION 3 — PERSONALITY (OCEAN, 25 items, 5 per factor)
   Format: 1..5 Strongly Disagree → Strongly Agree.
   ========================================================================= */
const PERSONALITY_C12 = [
  { id: "O1", factor: "O", reverse: false, indiaSpecific: false, text: "I enjoy exploring ideas from fields completely unrelated to my studies — I read about astronomy, philosophy, or art even when I study Commerce." },
  { id: "O2", factor: "O", reverse: false, indiaSpecific: true, text: "When I study a topic, I frequently wonder 'why does this work?' rather than just memorising it for the exam." },
  { id: "O3", factor: "O", reverse: true, indiaSpecific: false, text: "I prefer career paths that are predictable and well-defined over those that are open-ended and exploratory." },
  { id: "O4", factor: "O", reverse: false, indiaSpecific: false, text: "Even when I strongly disagree with an idea, I find myself genuinely trying to understand why a thoughtful person might believe it." },
  { id: "O5", factor: "O", reverse: false, indiaSpecific: true, text: "I find beauty in things others consider ordinary — a mathematical proof, a Mughal miniature, a well-written piece of code." },
  { id: "C1", factor: "C", reverse: false, indiaSpecific: true, text: "Once I commit to a goal — like clearing JEE or scoring 90%+ in boards — I keep working toward it even when it stops being exciting." },
  { id: "C2", factor: "C", reverse: true, indiaSpecific: false, text: "I often leave things to the last minute and then rush to complete them." },
  { id: "C3", factor: "C", reverse: false, indiaSpecific: true, text: "I maintain my study routine even during Diwali or Eid holidays, if important exams are approaching." },
  { id: "C4", factor: "C", reverse: false, indiaSpecific: false, text: "I double-check my work for errors before submitting, even when I am running short on time." },
  { id: "C5", factor: "C", reverse: true, indiaSpecific: true, text: "I find it genuinely hard to resist distractions — my phone, friends, or a cricket match on TV — when I am supposed to be studying." },
  { id: "E1", factor: "E", reverse: false, indiaSpecific: false, text: "I feel genuinely energised — not just fine, but energised — after spending time with a large group of people." },
  { id: "E2", factor: "E", reverse: true, indiaSpecific: false, text: "After a long day of social interactions at school, I need quiet time alone to recover my energy." },
  { id: "E3", factor: "E", reverse: false, indiaSpecific: true, text: "I would genuinely enjoy being a class representative, school captain, or event organiser." },
  { id: "E4", factor: "E", reverse: false, indiaSpecific: false, text: "I naturally take charge in unstructured situations where someone needs to step up and lead." },
  { id: "E5", factor: "E", reverse: false, indiaSpecific: true, text: "I genuinely enjoy performing — speaking at a school function, acting in a play, or presenting to a class." },
  { id: "A1", factor: "A", reverse: false, indiaSpecific: false, text: "I genuinely care about the well-being of people I have never met — underprivileged children, elderly farmers, displaced workers." },
  { id: "A2", factor: "A", reverse: false, indiaSpecific: true, text: "Maintaining family and community harmony is more important to me than always expressing my personal opinion." },
  { id: "A3", factor: "A", reverse: false, indiaSpecific: false, text: "I feel genuinely troubled when I see others suffering — it stays with me beyond the moment, not just in the moment." },
  { id: "A4", factor: "A", reverse: true, indiaSpecific: false, text: "I believe in looking out for myself first — others can take care of themselves." },
  { id: "A5", factor: "A", reverse: false, indiaSpecific: false, text: "I find satisfaction in contributing to a team's success, even when I personally receive no credit for it." },
  { id: "N1", factor: "N", reverse: false, indiaSpecific: true, text: "Thinking about not getting into my dream college or not clearing my target entrance exam makes me feel significantly anxious." },
  { id: "N2", factor: "N", reverse: false, indiaSpecific: false, text: "My mood changes dramatically based on events around me — one piece of bad news can ruin my entire day." },
  { id: "N3", factor: "N", reverse: true, indiaSpecific: false, text: "I bounce back quickly after a setback — a bad exam result, a rejection — usually within a day or two." },
  { id: "N4", factor: "N", reverse: false, indiaSpecific: true, text: "I often feel overwhelmed when I have too many tasks at once — mock tests, school exams, tuition, and family expectations all at the same time." },
  { id: "N5", factor: "N", reverse: true, indiaSpecific: false, text: "I feel comfortable in uncertain, unpredictable situations — they excite me rather than unsettle me." },
];

/* =========================================================================
   SECTION 4 — INTERESTS: FULL RIASEC PROFILE (30 items, 5 per type)
   Format: 1..5 Strongly Dislike → Strongly Like.
   ========================================================================= */
const INTEREST_C12 = [
  { id: "R1", type: "R", indiaSpecific: true, text: "Assembling and repairing a motorcycle engine from spare parts — working with tools to solve a mechanical problem." },
  { id: "R2", type: "R", indiaSpecific: false, text: "Operating and maintaining specialised industrial or medical equipment — calibrating it, troubleshooting it when it breaks." },
  { id: "R3", type: "R", indiaSpecific: true, text: "Working outdoors doing physical survey work — mapping land boundaries, testing soil quality, conducting geological surveys." },
  { id: "R4", type: "R", indiaSpecific: false, text: "Designing and building a working mechanical or electronic prototype for a science competition or personal project." },
  { id: "R5", type: "R", indiaSpecific: true, text: "Performing detailed hands-on technical work — vehicle servicing, electrical installation, or precision carpentry." },
  { id: "I1", type: "I", indiaSpecific: false, text: "Conducting a science experiment to investigate a hypothesis — collecting data, analysing results, and drawing conclusions." },
  { id: "I2", type: "I", indiaSpecific: false, text: "Reading research papers, academic articles, or books about new scientific or technological developments — even outside schoolwork." },
  { id: "I3", type: "I", indiaSpecific: true, text: "Analysing economic or social data to find hidden patterns — for example, studying the relationship between rainfall and farmer income in India." },
  { id: "I4", type: "I", indiaSpecific: false, text: "Working on a complex, abstract problem over several days or weeks — the kind that requires deep focus and no quick solution." },
  { id: "I5", type: "I", indiaSpecific: false, text: "Developing a new algorithm, mathematical model, or computational system to solve a problem that currently has no solution." },
  { id: "A1", type: "A", indiaSpecific: false, text: "Writing a short story, screenplay, or poem — creating something original that didn't exist before you sat down to write." },
  { id: "A2", type: "A", indiaSpecific: false, text: "Designing the visual identity of a brand, product, or campaign — making creative decisions about colour, form, and meaning." },
  { id: "A3", type: "A", indiaSpecific: true, text: "Composing, performing, or choreographing — expressing something through music, dance, or theatre that words alone cannot convey." },
  { id: "A4", type: "A", indiaSpecific: true, text: "Creating a documentary film, podcast, or photo essay that tells an important story about real people and real places." },
  { id: "A5", type: "A", indiaSpecific: false, text: "Designing physical spaces — interiors, buildings, or urban environments — that change how people experience the world." },
  { id: "S1", type: "S", indiaSpecific: true, text: "Teaching a difficult concept to someone who is struggling — explaining it patiently and differently until they genuinely understand." },
  { id: "S2", type: "S", indiaSpecific: false, text: "Counselling or guiding someone through a difficult personal decision — listening carefully, asking the right questions, helping them think clearly." },
  { id: "S3", type: "S", indiaSpecific: true, text: "Working with an NGO, government scheme, or community initiative that directly improves the lives of disadvantaged people." },
  { id: "S4", type: "S", indiaSpecific: true, text: "Providing healthcare, therapy, or rehabilitation to patients — the direct, repeated work of helping a specific person heal." },
  { id: "S5", type: "S", indiaSpecific: false, text: "Training or coaching other people — helping them develop skills, build confidence, or reach their full potential." },
  { id: "E1", type: "E", indiaSpecific: false, text: "Pitching a new business idea to investors — making a compelling case for why your vision deserves their trust and money." },
  { id: "E2", type: "E", indiaSpecific: true, text: "Leading a large organisation, district, or institution — setting direction, taking decisions, and being accountable for outcomes." },
  { id: "E3", type: "E", indiaSpecific: false, text: "Negotiating a complex deal — finding terms that work for multiple parties with competing interests, under pressure." },
  { id: "E4", type: "E", indiaSpecific: true, text: "Running a political campaign or advocacy effort — mobilising people to support a cause you believe is important." },
  { id: "E5", type: "E", indiaSpecific: false, text: "Building a company or enterprise from scratch — accepting the financial and personal risks that come with creating something new." },
  { id: "C1", type: "C", indiaSpecific: true, text: "Maintaining accurate and detailed financial records for an organisation — organising data, ensuring everything reconciles perfectly." },
  { id: "C2", type: "C", indiaSpecific: false, text: "Implementing complex regulatory compliance requirements — reading the rules carefully and ensuring every detail is followed." },
  { id: "C3", type: "C", indiaSpecific: false, text: "Managing large databases, inventories, or information systems — tracking many variables simultaneously without errors." },
  { id: "C4", type: "C", indiaSpecific: true, text: "Auditing financial statements to verify accuracy — methodically checking every entry and flagging discrepancies." },
  { id: "C5", type: "C", indiaSpecific: false, text: "Implementing quality control protocols in a manufacturing or laboratory setting — checking every output against precise standards." },
];

/* =========================================================================
   SECTION 5 — CAREER TITLE RATINGS (20 careers)
   Format: 1..5 appeal (Not at all appealing → Very appealing).
   Holland code letters weighted 0.5 / 0.3 / 0.2 in the RIASEC composite.
   ========================================================================= */
const CAREER_TITLES_C12 = [
  { id: "CT1", title: "Data Scientist / AI Engineer", holland: "ICR", sector: "IT / Finance / Research" },
  { id: "CT2", title: "MBBS Doctor — Government Hospital", holland: "SIR", sector: "Healthcare" },
  { id: "CT3", title: "IAS / IPS Officer (Civil Services)", holland: "ESI", sector: "Government" },
  { id: "CT4", title: "Chartered Accountant (CA)", holland: "CEI", sector: "Finance / Own practice" },
  { id: "CT5", title: "Corporate Lawyer / Litigation Advocate", holland: "ECI", sector: "Law" },
  { id: "CT6", title: "Software Architect / Systems Designer", holland: "ICR", sector: "IT / MNCs / Startups" },
  { id: "CT7", title: "Journalist / Documentary Filmmaker", holland: "ASE", sector: "Media" },
  { id: "CT8", title: "Social Worker / NGO Programme Director", holland: "SA", sector: "Development sector" },
  { id: "CT9", title: "Entrepreneur / Startup Founder", holland: "EAI", sector: "Own venture" },
  { id: "CT10", title: "Medical Researcher / ICMR Scientist", holland: "IRS", sector: "Govt Research" },
  { id: "CT11", title: "Graphic Designer / UI-UX Designer", holland: "AEI", sector: "Tech / Creative" },
  { id: "CT12", title: "School Teacher / Professor (Govt College)", holland: "SEC", sector: "Education" },
  { id: "CT13", title: "Cardiologist / Neurologist (AIIMS, Apollo)", holland: "ISR", sector: "Healthcare" },
  { id: "CT14", title: "Investment Banker (Goldman, Kotak, ICICI)", holland: "ECR", sector: "Finance" },
  { id: "CT15", title: "Architect + Urban Planner", holland: "AIR", sector: "Govt / Private" },
  { id: "CT16", title: "Environmental Scientist (TERI, WWF India)", holland: "IRS", sector: "NGO / Research" },
  { id: "CT17", title: "HR Manager / Organisational Development", holland: "SE", sector: "Corporate" },
  { id: "CT18", title: "Space Scientist (ISRO)", holland: "IRT", sector: "Govt Research" },
  { id: "CT19", title: "Counsellor / Psychotherapist", holland: "SIA", sector: "Mental health" },
  { id: "CT20", title: "Brand Manager / Marketing Director (HUL, P&G)", holland: "ECA", sector: "FMCG / Consumer" },
];

/* =========================================================================
   SECTION 6 — VALUES & MOTIVATIONS (22 items)
   Part A: Work Values (12 items, 1 each) — 1..5 importance.
   Part B: Career Motivations (10 items) — 1..5 agreement.
   Note: Item M19 (Extrinsic) is deliberately NOT scored as a deficit — a high
   score simply means family/community expectations are a major driver, which
   is common and valid in Indian families. The Intrinsic–Extrinsic GAP is the
   more meaningful signal than either score alone.
   ========================================================================= */
const WORK_VALUES_C12 = [
  { id: "V1", scale: "Security", indiaSpecific: true, text: "My career must give me a guaranteed monthly income — job security and a pension matter more to me than a high but uncertain salary." },
  { id: "V2", scale: "Mastery", indiaSpecific: false, text: "I want to become the best in my specific field in India — truly expert, not just competent." },
  { id: "V3", scale: "Autonomy", indiaSpecific: false, text: "I need the freedom to work in my own way, without micromanagement or rigid procedures I didn't design." },
  { id: "V4", scale: "Altruism", indiaSpecific: false, text: "I would accept a lower salary if my work directly helped underprivileged or marginalised people." },
  { id: "V5", scale: "WLB", indiaSpecific: true, text: "Having time for family, festivals, and personal interests matters more to me than career advancement or prestigious titles." },
  { id: "V6", scale: "Intellectual", indiaSpecific: false, text: "My work should constantly challenge me to learn, think deeply, and solve problems I have never seen before." },
  { id: "V7", scale: "Prestige", indiaSpecific: true, text: "I want my career to earn genuine respect from society — a title and position that my family and community are proud of." },
  { id: "V8", scale: "FamilyDuty", indiaSpecific: true, text: "Being financially able to support my parents and contribute to my family's household is genuinely important to me." },
  { id: "V9", scale: "Societal", indiaSpecific: true, text: "I want to be working on India's specific problems — not just global issues disconnected from this country's reality." },
  { id: "V10", scale: "Innovation", indiaSpecific: false, text: "I am drawn to careers in rapidly growing sectors — AI, clean energy, space, fintech — even if they are less stable." },
  { id: "V11", scale: "Voice", indiaSpecific: false, text: "I want a platform from which I can speak and be heard — not just implement others' decisions." },
  { id: "V12", scale: "Stability", indiaSpecific: true, text: "I prefer a known, stable career path over a volatile, high-risk, high-reward one." },
];

const MOTIVATIONS_C12 = [
  { id: "M13", scale: "Power", indiaSpecific: true, text: "The thought of being an IAS officer, a CEO, or a senior politician genuinely excites me — the scale of impact, not just the title." },
  { id: "M14", scale: "Achievement", indiaSpecific: false, text: "I keep a mental scorecard of my performance over time and push myself to beat my own previous results, even when no one else is watching." },
  { id: "M15", scale: "Affiliation", indiaSpecific: false, text: "The best part of any career for me would be the relationships — working with excellent people, building a strong team, belonging to a community." },
  { id: "M16", scale: "Mastery", indiaSpecific: false, text: "I would willingly take a lower-paying job if it offered dramatically better learning opportunities and skill development." },
  { id: "M17", scale: "SocietalImpact", indiaSpecific: true, text: "Making a tangible, visible difference in the lives of ordinary Indians is the most important outcome I want from my working life." },
  { id: "M18", scale: "Intrinsic", indiaSpecific: false, text: "I am choosing my career primarily because I genuinely love the work itself — not because of the salary, status, or parental approval." },
  { id: "M19", scale: "Extrinsic", indiaSpecific: true, text: "Honestly, much of my career thinking is driven by what my parents want or what is considered respectable in my community." },
  { id: "M20", scale: "Intrinsic", indiaSpecific: false, text: "I would pursue my chosen career even if nobody else approved of it — family, friends, or society." },
  { id: "M21", scale: "Mastery", indiaSpecific: false, text: "I am most engaged when I am learning something genuinely new — a new subject, skill, or perspective that changes how I see things." },
  { id: "M22", scale: "SocietalImpact", indiaSpecific: true, text: "I want to look back in 30 years and feel that India is a little better because of the work I did in my career." },
];

/* =========================================================================
   SECTION 7 — LIFE DESIGN PREFERENCES (8 items)
   Shapes lifestyle compatibility, not just capability-based recommendations.
   ========================================================================= */
const LIFE_DESIGN_C12 = {
  metroPreference: { id: "LD1", control: "likert", text: "I see myself building my long-term life in a metro city — the energy, opportunity, and professional networks of a large city genuinely appeal to me.", note: "Geographic filter for career and college recommendations." },
  autonomyIn5Years: { id: "LD2", control: "likert", text: "Within 5 years of graduating, I want to be genuinely free to choose my own work — not locked into one employer, contract, or boss.", note: "Autonomy + entrepreneurship pathway signal." },
  incomeAspiration: { id: "LD3", control: "likert", text: "Within 10 years, I want to earn enough to afford a comfortable home (owned, not rented) in my city and support my family well.", note: "Income aspiration — affects career timeline recommendations." },
  familyPresence: { id: "LD4", control: "likert", text: "I want my career to allow me to be physically present for family events, festivals, illnesses, and the daily rhythms of home — not constantly travelling or relocating.", note: "Work-life balance and geographic stability filter." },
  orgType: {
    id: "LD5", control: "single", text: "In which type of organisation do you most want to work?", note: "Sector filter for career recommendations.",
    options: [
      "Large, stable government organisation (UPSC, PSU, Banking)",
      "Private MNC or large Indian corporate (Tata, Infosys, HUL)",
      "Startup or entrepreneurial environment — high risk, high learning",
      "Social sector / NGO / Development organisation",
      "Self-employed or own practice (lawyer, CA, doctor)",
      "Family business or established trade",
    ],
  },
  geoExpectation: {
    id: "LD6", control: "single", text: "Where do you most expect to live and work during the first 10 years of your career?", note: "Geographic filter for college and career recommendations.",
    options: [
      "Metro city in India (Delhi, Mumbai, Bengaluru, Hyderabad, Chennai)",
      "Tier-2 city in India — close to family, lower cost",
      "Rural or semi-urban area — purposeful choice",
      "I am open to anywhere in India",
      "I am considering working abroad",
    ],
  },
  workingStyle: {
    id: "LD7", control: "single", text: "Which of the following best describes your ideal working style?", note: "Career cluster filter.",
    options: [
      "Deep specialist — I want to be the best in one specific domain",
      "Generalist leader — I want to be involved in many things at a high level",
      "Researcher or academic — slow, deep work over many years",
      "Builder / maker — I want to create physical or digital things",
      "People-focused — I want to spend most of my time working with and for people",
    ],
  },
  riskTolerance: { id: "LD8", control: "likert", text: "How willing are you to take a large financial risk — for example, starting a business or taking an unpaid internship — in the early years of your career?", note: "Risk tolerance — affects entrepreneurship and startup pathway recommendations." },
};

/* =========================================================================
   SECTION 8 — YOUR CONTEXT (8 items)
   Personalises the result — never blocks a career option.
   ========================================================================= */
const CONTEXT_C12 = {
  parentPreference: { id: "CTX1", text: "My parents or guardians have a strong preference for which career I choose after Class 12.", note: "Generates 'Family-Aligned Path' alongside 'Interest-Based Path' in your results." },
  financialUrgency: { id: "CTX2", text: "Choosing a career that generates income relatively quickly is genuinely necessary for my family's financial situation.", note: "Financial urgency — upweights faster-income career pathways." },
  geographicConstraint: { id: "CTX3", text: "I need to remain in or near my home city or state — I cannot relocate to another state or city for college or career.", note: "Geographic constraint — filters college list to within-state and online options." },
  secretInterest: { id: "CTX4", text: "Is there a career you are secretly interested in but feel you cannot pursue? If yes, what is it, and why do you feel you cannot pursue it?", note: "This is ONLY visible to your counsellor — it is never shared with anyone, including your parents, without your explicit written permission.", optional: true, counsellorOnly: true },
  careerClarity: {
    id: "CTX5", control: "single", text: "Which of the following best describes you right now?", note: "Career clarity index — adjusts the report tone and structure.",
    options: [
      "I have firmly decided on my career path.",
      "I have a general direction but I am still open to exploring.",
      "I am genuinely uncertain and still exploring broadly.",
      "I feel confused and anxious about this decision.",
    ],
  },
  targetExam: {
    id: "CTX6", control: "multi", text: "Which entrance exam are you targeting (or have already appeared for)?", note: "Activates exam-specific probability analysis and college list.",
    options: [
      "JEE Advanced (IIT)", "JEE Mains (NIT / state engineering)", "NEET (Medicine)", "CLAT (Law)",
      "CUET (Central University undergraduate)", "CA Foundation", "NDA / CDS (Defence)", "NIFT / NID (Design)",
      "GATE (Postgraduate engineering / PSU)", "UPSC (long-term aspiration)", "No specific exam — exploring options", "Other",
    ],
  },
  financialSituation: {
    id: "CTX7", control: "single", text: "My family's current financial situation is best described as:", note: "Modulates college affordability filter. Scholarship and loan pathway flagged where relevant.",
    options: [
      "We face financial difficulty in meeting daily needs",
      "We are careful but comfortable — managing well",
      "We are financially secure with no major concerns",
      "We are affluent — finances are not a constraint on my career choice",
    ],
  },
  roleModel: { id: "CTX8", control: "textPair", text: "My career role model is: ___. What specifically do you admire about their career? (50 words)", note: "Used in counsellor report narrative — reveals values and identity." },
};

/* =========================================================================
   SECTION 9 — CAREER SCENARIOS (5) — single-select "most likely" response.
   Descriptive only, per the source document: these do NOT change career
   recommendations, but reveal decision-making patterns for the counsellor.
   ========================================================================= */
const SCENARIOS_C12 = [
  {
    id: "SC1",
    title: "When JEE Results Disappoint",
    situation:
      "Rohan scored 71 percentile in JEE Mains — not enough for any NIT in his preferred branches. His parents want him to drop a year and try again. His DISHA profile shows high Enterprising (E) and Conventional (C) interests, moderate-to-low Spatial aptitude, and strong Numerical aptitude. He genuinely enjoyed the coding projects he built during Class 12 more than the mechanical engineering content he was preparing for.",
    options: [
      { key: "A", text: "Drop the year and attempt JEE again — his parents are right that IIT/NIT opens the most doors and one more year will make a difference." },
      { key: "B", text: "Accept a BCA or BSc (Computer Science) seat, build a strong development portfolio over 3 years, and aim for product management or software engineering — the field values skill over institution name far more than most students know." },
      { key: "C", text: "Research carefully: explore B.Tech CS at private colleges with strong placements (BITS, Manipal, VIT), weigh loan vs outcome, and present a data-backed plan to his parents before deciding." },
      { key: "D", text: "Accept any engineering seat, then explore lateral entry into his true interests through electives, clubs, and internships." },
    ],
    skillsTested: ["Evidence-Based Decision Making", "Career Self-Knowledge", "Pragmatism"],
    bestKeys: ["C"],
  },
  {
    id: "SC2",
    title: "Medicine vs Policy",
    situation:
      "Ananya has a NEET score of 540/720 — sufficient for MBBS at a government medical college in her state. She has also consistently topped her school in Political Science and Social Science, and has a long-standing interest in public policy and governance. She has been selected for a prestigious Model UN conference as a delegate. Her parents expect her to take the MBBS seat.",
    options: [
      { key: "A", text: "Take the MBBS seat — a government MBBS is one of the most secure and respected careers in India, and she can always engage with policy issues as a doctor." },
      { key: "B", text: "Decline the MBBS seat and appear for UPSC after graduation in a subject she genuinely loves — the 540 score shows she can work hard; the question is whether this is the right goal." },
      { key: "C", text: "Take the MBBS seat but commit to public health or health policy as a specialisation — this path combines both interests and produces some of India's most effective policy thinkers." },
      { key: "D", text: "Talk honestly with her parents, her counsellor, and ideally a practising IAS officer and a public health doctor before making any decision — she needs real-world perspective, not just data." },
    ],
    skillsTested: ["Authentic Self-Knowledge", "Evidence-Based Thinking", "Career Exploration"],
    bestKeys: ["C", "D"],
  },
  {
    id: "SC3",
    title: "The Family Business Expectation",
    situation:
      "Vikram's family runs a successful textile trading business in Surat. His father has always assumed Vikram will join after graduation. Vikram has developed a genuine passion for film direction during Class 12 — he has won a state-level short film competition and is considering applying to FTII or SRFTI. His DISHA profile shows very high Artistic (A) interests and high Intrinsic motivation, but moderate Family Duty values.",
    options: [
      { key: "A", text: "Join the family business — it is financially secure, and he can always pursue film as a serious hobby on evenings and weekends." },
      { key: "B", text: "Apply to FTII and SRFTI competitive entrance exams seriously — his profile and competition win suggest genuine aptitude. Have an honest conversation with his father, backed by data on what successful Indian filmmakers earn." },
      { key: "C", text: "Propose a compromise: manage the family business for 3 years, save money, and self-fund a short film that demonstrates his seriousness before making the full commitment to film school." },
      { key: "D", text: "Enrol in a Business Management programme that includes a media and communications module — combining both worlds before making an irreversible decision." },
    ],
    skillsTested: ["Family Dialogue", "Authentic Self-Knowledge", "Pragmatism"],
    bestKeys: ["B", "C"],
  },
  {
    id: "SC4",
    title: "The Gap Year Dilemma",
    situation:
      "Meera has Class 12 board results of 82% but her JEE score (48 percentile) and CUET score (below cut-off for her target programmes) were both disappointing. She genuinely loves Economics and wanted to study at Delhi School of Economics (DSE) or JNU. A gap year would let her prepare specifically for DSE's entrance. Her parents are anxious about a gap year and feel it looks bad. She is uncertain.",
    options: [
      { key: "A", text: "Skip the gap year — take the best seat available this year and try to transfer or do a post-graduation at DSE later." },
      { key: "B", text: "Take the gap year — DSE is a specific and achievable target, the gap is purposeful, and a single focused year to prepare for a well-researched goal is very different from drifting without a plan." },
      { key: "C", text: "Research carefully: what is the DSE entrance cut-off? What has been her trajectory on Economics practice tests? If the gap is genuinely justified by data, present the case to her parents with specific milestones and a clear plan." },
      { key: "D", text: "Ask her parents to decide — they have more life experience and are better positioned to weigh the risks of a gap year objectively." },
    ],
    skillsTested: ["Evidence-Based Thinking", "Goal Clarity", "Family Dialogue"],
    bestKeys: ["C"],
  },
  {
    id: "SC5",
    title: "A Career You Cannot Explain to Your Family",
    situation:
      "Siddharth wants to become a game designer. He has been building games using Unity since Class 9, has 3 published mobile games with combined downloads exceeding 50,000, and has a strong GitHub portfolio. His family does not understand what game design is or whether it constitutes a 'real' career. They are pushing him toward engineering or CA. He is 17 and applying for college in 3 months.",
    options: [
      { key: "A", text: "Follow his parents — engineering is a safe choice, and he can always continue game development as a hobby." },
      { key: "B", text: "Apply to design and game development programmes (NID, MIT Institute of Design, Pearl Academy, Symbiosis) and present his existing portfolio — 50,000+ downloads is a compelling argument that cannot easily be dismissed." },
      { key: "C", text: "Research the career rigorously: what do senior game designers in India earn? Which studios hire in India? What is the college-to-employment pathway? Present this data to his family in a structured conversation before any decision." },
      { key: "D", text: "Apply for both engineering and design programmes simultaneously, keeping all options open until results come in and the family conversation has been fully had." },
    ],
    skillsTested: ["Career Research", "Evidence-Based Thinking", "Family Dialogue"],
    bestKeys: ["C", "D"],
  },
];

/* =========================================================================
   SECTION METADATA
   ========================================================================= */
const SECTIONS = [
  { id: "academic", code: "1", name: "Academic Profile", timeMin: 7 },
  { id: "aptitude", code: "2", name: "Aptitude (Extended)", timeMin: 12 },
  { id: "personality", code: "3", name: "Personality (OCEAN)", timeMin: 8 },
  { id: "interests", code: "4", name: "Interests — Full RIASEC", timeMin: 8 },
  { id: "careerTitles", code: "5", name: "Career Title Ratings", timeMin: 5 },
  { id: "valuesMotivations", code: "6", name: "Values & Motivations", timeMin: 7 },
  { id: "lifeDesign", code: "7", name: "Life Design Preferences", timeMin: 3 },
  { id: "context", code: "8", name: "Your Context", timeMin: 4 },
  { id: "scenarios", code: "9", name: "Career Scenarios", timeMin: 8 },
];

module.exports = {
  SECTIONS,
  CLASS10_SUBJECTS,
  CLASS11_SLOTS,
  CLASS12_SLOTS,
  STREAM_SUBJECT_HINTS,
  ENTRANCE_EXAMS_ATTEMPTED,
  APTITUDE_C12,
  PERSONALITY_C12,
  INTEREST_C12,
  CAREER_TITLES_C12,
  WORK_VALUES_C12,
  MOTIVATIONS_C12,
  LIFE_DESIGN_C12,
  CONTEXT_C12,
  SCENARIOS_C12,
};
