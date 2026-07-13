/**
 * DISHA — Differential Intelligence & Scholastic Horizon Assessment
 * Test 1 of 8 (Flagship). Target: Classes 9–12, Ages 13–18+.
 *
 * This file is the single source of truth for the DISHA item bank. It is served
 * to the client (with answer keys / scoring metadata stripped) and is also used
 * server-side for scoring. Keeping the bank in code (rather than seeded into the
 * DB) keeps the ~185-item flagship test versionable alongside the scoring logic.
 *
 * Item types
 *  - "marks"          Module 1 subject mark entry (obtained / maximum per term)
 *  - "supplementary"  Module 1 contextual questions (dropdown / likert / text)
 *  - "mcq"            Aptitude MCQ with a single correct option (Modules 2A–2F)
 *  - "likert"         5-point Likert (OCEAN, RIASEC likert, Work Values, ICS, validity)
 *  - "forced_choice"  Two-option forced choice mapped to dimensions (RIASEC FC, WVI-FC)
 *  - "sjt"            Situational Judgment Test (pick Most-Likely + Least-Likely)
 *
 * Each scored item carries the metadata the scoring engine needs (dimension,
 * factor, reverse flag, answer key, MO/LO competency map, validity scale id, …).
 */

/* =========================================================================
   MODULE 1 — ACADEMIC MARKS INTEGRATION
   Marks carry 25–30% of the CCRE score. Self-reported; optional verification.
   ========================================================================= */

const ACADEMIC_SUBJECTS = [
  { key: "mathematics", label: "Mathematics", ssi: "SSI_Math", streamRelevance: ["PCM", "Commerce"], appliesTo: ["9", "10", "11", "12"] },
  { key: "physics", label: "Physics", ssi: "SSI_Physics", streamRelevance: ["PCM", "PCB"], appliesTo: ["11", "12"] },
  { key: "chemistry", label: "Chemistry", ssi: "SSI_Chemistry", streamRelevance: ["PCM", "PCB"], appliesTo: ["11", "12"] },
  { key: "biology", label: "Biology", ssi: "SSI_Biology", streamRelevance: ["PCB"], appliesTo: ["11", "12"] },
  { key: "science", label: "Science (combined)", ssi: "SSI_Science", streamRelevance: ["PCM", "PCB"], appliesTo: ["9", "10"] },
  { key: "english", label: "English (Core / Elective)", ssi: "SSI_English", streamRelevance: ["Humanities"], appliesTo: ["9", "10", "11", "12"] },
  { key: "socialScience", label: "Social Science / History / Geography / Economics / PolSci", ssi: "SSI_SocSci", streamRelevance: ["Humanities"], appliesTo: ["9", "10", "11", "12"] },
  { key: "secondLanguage", label: "Hindi / Regional / 2nd Language", ssi: "SSI_Language", streamRelevance: [], appliesTo: ["9", "10", "11", "12"] },
  { key: "computerScience", label: "Computer Science / IT", ssi: "SSI_CS", streamRelevance: ["PCM"], appliesTo: ["9", "10", "11", "12"], optional: true },
  { key: "streamSubject", label: "Stream subject (PCM / PCB / Commerce / Humanities elective)", ssi: "SSI_Stream", streamRelevance: [], appliesTo: ["11", "12"], optional: true },
];

// Terms collected per subject; recency weighting handled in scoring (recent = 2×).
const ACADEMIC_TERMS = [
  { key: "previousYear", label: "Previous Year (Annual)", recencyWeight: 1 },
  { key: "q1", label: "Quarterly / Q1", recencyWeight: 1 },
  { key: "halfYearly", label: "Half-Yearly", recencyWeight: 1.5 },
  { key: "preBoard", label: "Pre-board", recencyWeight: 2 },
  { key: "annualBoard", label: "Annual / Board", recencyWeight: 2 },
];

const ACADEMIC_SUPPLEMENTARY = [
  { id: "M1", type: "supplementary", control: "dropdown", text: "What is your current class / most recently completed class?", options: ["Class 8", "Class 9", "Class 10", "Class 11", "Class 12", "Passed Class 12"], use: "classAdaptiveVersion" },
  { id: "M2", type: "supplementary", control: "dropdown", text: "Which board are you studying under?", options: ["CBSE", "ICSE", "IB", "State Board", "Other"], use: "normTable" },
  { id: "M3", type: "supplementary", control: "dropdown", text: "Are you attending coaching classes for any competitive exam?", options: ["JEE", "NEET", "CLAT", "CA Foundation", "CUET", "UPSC", "None", "Other"], use: "examProbabilitySection" },
  { id: "M4", type: "supplementary", control: "likert_per_subject", text: "On a scale of 1–5, how much do you enjoy studying each subject? (1 = Hate it, 5 = Love it)", use: "enjoymentVsMarks" },
  { id: "M5", type: "supplementary", control: "easiest_hardest", text: "Which subject do you find easiest? Which is hardest?", use: "selfEfficacyCrossValidation" },
  { id: "M6", type: "supplementary", control: "yesno_text", text: "Has your performance in any subject significantly changed in the last year? If yes, which subject and why?", use: "trajectoryFlag" },
  { id: "M7", type: "supplementary", control: "text", text: "Is there a subject you wish you had studied harder? Why?", use: "regretData" },
  { id: "M8", type: "supplementary", control: "file", optional: true, text: "Upload marksheet screenshot (optional — marks flagged as Verified vs Self-Reported)", use: "verification" },
];

/* =========================================================================
   MODULE 2 — APTITUDE BATTERY (10-dimension DBDA-R extended)
   All aptitude items are MCQ, formula-scored: Correct − (Wrong / (k−1)).
   "dim" maps each item to one of the 10 aptitude dimensions.
   ========================================================================= */

// 2A — Verbal Ability (18 items, 8 min, timed)
const VERBAL = [
  { id: "VA1", dim: "verbal", subType: "Analogy", text: "DOCTOR : STETHOSCOPE :: ARCHITECT : ?", options: ["Blueprint", "Plumb line", "Scale", "Drawing board"], answer: 2 },
  { id: "VA2", dim: "verbal", subType: "Odd one out", text: "Choose the word that does NOT belong: Opulent / Lavish / Extravagant / Frugal / Sumptuous", options: ["Opulent", "Lavish", "Frugal", "Sumptuous"], answer: 2 },
  { id: "VA3", dim: "verbal", subType: "Analogy", text: "SITAR : RAGA :: TABLA : ?", options: ["Taal", "Melody", "Rhythm", "Instrument"], answer: 0 },
  { id: "VA4", dim: "verbal", subType: "Vocabulary in context", text: "Fill in the blank: 'The committee was ______ in its criticism — every flaw was catalogued and examined.'", options: ["Effusive", "Perfunctory", "Exhaustive", "Lenient"], answer: 2 },
  { id: "VA5", dim: "verbal", subType: "Grammar", text: "Identify the grammatical error: 'Neither the principal nor the teachers was present at the function.'", options: ["Neither…nor", "was present", "at the function", "No error"], answer: 1 },
  { id: "VA6", dim: "verbal", subType: "Vocabulary", text: "The word PELLUCID most closely means:", options: ["Muddy and unclear", "Translucent; easy to understand", "Brightly coloured", "Very ancient"], answer: 1 },
  { id: "VA7", dim: "verbal", subType: "Analogy", text: "BOOK : LIBRARY :: CASE : ?", options: ["Lawyer", "Court", "File", "Brief"], answer: 1 },
  { id: "VA8", dim: "verbal", subType: "Verbal deduction", text: "Complete the logical deduction: 'All gazetted holidays are non-working days. Today is Diwali, a gazetted holiday. Therefore…'", options: ["The office may be open", "The office is closed", "It depends on the state", "Cannot be determined"], answer: 1 },
  { id: "VA9", dim: "verbal", subType: "Vocabulary", text: "Choose the word closest in meaning to LACONIC:", options: ["Verbose and elaborate", "Brief and to-the-point", "Emotionally charged", "Intentionally vague"], answer: 1 },
  { id: "VA10", dim: "verbal", subType: "Comprehension", text: "Reading comprehension: 'The Chipko Andolan began when communities realised that ecological destruction was directly destroying their livelihoods — not an abstract concern, but a daily reality.' What does the author most strongly suggest?", options: ["Environmental movements are always politically motivated", "Economic dependence on nature can drive ecological awareness", "The Chipko movement was internationally influenced", "All environmental protests link to livelihood"], answer: 1 },
  { id: "VA11", dim: "verbal", subType: "Analogy", text: "Choose the pair most similar in relationship to OPULENT : POVERTY:", options: ["Courageous : Fear", "Honest : Truth", "Skilled : Practice", "Silent : Noise"], answer: 0 },
  { id: "VA12", dim: "verbal", subType: "Literary devices", text: "Identify the literary device: 'The market was a living, breathing organism, it consumed dreams and exhaled despair.'", options: ["Simile", "Personification + Metaphor", "Hyperbole", "Alliteration"], answer: 1 },
  { id: "VA13", dim: "verbal", subType: "Grammar", text: "Sentence correction: 'Each of the students have submitted their assignments.' — Identify the error.", options: ["Each of the students", "have submitted", "their assignments", "No error"], answer: 1 },
  { id: "VA14", dim: "verbal", subType: "Odd one out", text: "Odd one out by meaning: OPAQUE / MURKY / TURBID / PELLUCID / CLOUDY", options: ["Opaque", "Murky", "Pellucid", "Cloudy"], answer: 2 },
  { id: "VA15", dim: "verbal", subType: "Proverb application", text: "Proverb application: 'Ramesh spent three years learning classical music, then abandoned it after one poor review.' Which proverb best applies?", options: ["A rolling stone gathers no moss", "All that glitters is not gold", "Patience is a virtue", "The early bird catches the worm"], answer: 0 },
  { id: "VA16", dim: "verbal", subType: "Vocabulary in context", text: "Fill in the blank: 'The river, once the lifeline of the village, has now been reduced to a ______ stream choked with industrial waste.'", options: ["Turbulent", "Perennial", "Trickle of a", "Brackish"], answer: 2 },
  { id: "VA17", dim: "verbal", subType: "Critical reasoning", text: "Statement and assumption: 'Buy Healthy Heart oil — doctors recommend oil with low saturated fat.' Underlying assumption:", options: ["All doctors recommend this brand", "Low saturated fat in cooking oil promotes heart health", "Heart disease is the most common disease in India", "Healthy Heart oil has no saturated fat"], answer: 1 },
  { id: "VA18", dim: "verbal", subType: "Tone detection", text: "Reading passage (120 words on the Indian Independence movement). Tone-detection question: 'The author's tone in this passage is best described as…'", options: ["Passionate advocacy", "Clinical and analytical", "Satirical and ironic", "Nostalgic and melancholic"], answer: 1 },
];

// 2B — Numerical & Logical Reasoning (16 items, 8 min, timed)
const NUMERICAL = [
  { id: "NL1", dim: "numerical", subType: "Speed-Distance", text: "A train covers 360 km in 4 hours. How long will it take to cover 594 km at 10% higher speed?", options: ["5 h 24 min", "6 h", "6 h 30 min", "5 h 48 min"], answer: 1 },
  { id: "NL2", dim: "numerical", subType: "Profit & Loss", text: "A shopkeeper marks goods 40% above cost price and gives a 25% discount. His profit/loss is:", options: ["5% profit", "5% loss", "10% profit", "No profit/no loss"], answer: 0 },
  { id: "NL3", dim: "numerical", subType: "Number series", text: "Number series: 3, 6, 11, 18, 27, 38, ?", options: ["48", "50", "51", "52"], answer: 2 },
  { id: "NL4", dim: "numerical", subType: "Percentages", text: "If 15% of x = 90, what is 35% of (x + 50)?", options: ["210", "227.5", "245", "230"], answer: 1 },
  { id: "NL5", dim: "numerical", subType: "Letter series", text: "Letter series: AZ, BY, CX, DW, ?", options: ["EV", "FW", "EU", "EW"], answer: 0 },
  { id: "NL6", dim: "logical", subType: "Syllogism", text: "Syllogism: 'All engineers are problem-solvers. Some problem-solvers are creative.' Which conclusion definitely follows? (I) Some engineers are creative. (II) All creative people are engineers.", options: ["Only I follows", "Only II follows", "Both I and II follow", "Neither I nor II follows"], answer: 3 },
  { id: "NL7", dim: "numerical", subType: "Time & Work", text: "Pipe A fills a tank in 12 hours; Pipe B empties it in 18 hours. If both are open simultaneously, the tank fills in:", options: ["30 hours", "36 hours", "24 hours", "32 hours"], answer: 1 },
  { id: "NL8", dim: "numerical", subType: "Relative Speed", text: "Priya and Ravi start from opposite ends of a 60 km road, walking toward each other at 4 km/h and 6 km/h. At what distance from Priya's starting point do they meet?", options: ["30 km", "24 km", "36 km", "20 km"], answer: 1 },
  { id: "NL9", dim: "logical", subType: "Deductive logic", text: "Logical deduction: 'If it rains, Kavya carries an umbrella. Kavya is NOT carrying an umbrella.' What must be true?", options: ["It is raining", "It is not raining", "Kavya dislikes umbrellas", "Cannot determine"], answer: 1 },
  { id: "NL10", dim: "logical", subType: "Number properties", text: "Odd one out — which number does NOT fit? 144, 121, 100, 81, 63, 49", options: ["81", "100", "63", "121"], answer: 2 },
  { id: "NL11", dim: "numerical", subType: "Ratio & Mixture", text: "A mixture of milk and water is in ratio 5:2. If 7 litres of water is added, the ratio becomes 5:3. Find the original quantity of milk.", options: ["25 litres", "30 litres", "35 litres", "28 litres"], answer: 2 },
  { id: "NL12", dim: "numerical", subType: "SI vs CI", text: "Simple interest on ₹12,000 at 8% per annum for 3 years is ₹2,880. What is the compound interest for the same principal, rate, and period?", options: ["₹2,880", "₹3,073.28", "₹3,200", "₹2,995.20"], answer: 1 },
  { id: "NL13", dim: "numerical", subType: "Data interpretation", text: "Data interpretation: A bar chart shows quarterly sales figures for 5 companies in 2023-24. In which quarter did Company B show the highest % growth over the previous quarter?", options: ["Q1 to Q2", "Q2 to Q3", "Q3 to Q4", "Q4 to Q1"], answer: 1 },
  { id: "NL14", dim: "logical", subType: "Calendar", text: "Calendar: If January 26, 2020 was a Sunday, what day was March 8, 2020?", options: ["Saturday", "Sunday", "Monday", "Tuesday"], answer: 1 },
  { id: "NL15", dim: "logical", subType: "Arrangement", text: "Seating arrangement: Five friends (Aakash, Bhavna, Chetan, Divya, Esha) sit in a row. Aakash is not at either end. Bhavna sits immediately next to Aakash. Chetan sits at one end. Esha does not sit next to Chetan. Which seating order is possible?", options: ["Chetan, Bhavna, Aakash, Divya, Esha", "Esha, Bhavna, Aakash, Divya, Chetan", "Chetan, Esha, Bhavna, Aakash, Divya", "Divya, Bhavna, Aakash, Esha, Chetan"], answer: 0 },
  { id: "NL16", dim: "numerical", subType: "Number series", text: "Number pattern: 2, 6, 12, 20, 30, 42, ?", options: ["54", "56", "52", "58"], answer: 1 },
];

// 2C — Spatial / Visual Reasoning (14 items, 6 min, timed)
// All items are image-based. imageUrl points to /disha-images/<name>.svg served from public/.
const SPATIAL = [
  {
    id: "SP1", dim: "spatial", subType: "Net folding",
    text: "Which 3D solid does this cross-shaped net form when folded?",
    imageUrl: "/disha-images/sp1.svg",
    imageDescription: "Cross-shaped net with Top, Front, Left, Right, and Bottom labelled panels and dashed fold lines.",
    options: ["Cuboid", "Cube", "Triangular Prism", "Pyramid"],
    answer: 1,
  },
  {
    id: "SP2", dim: "spatial", subType: "Mental rotation",
    text: "Which option shows the asymmetric L-shape rotated 90° clockwise?",
    imageUrl: "/disha-images/sp2.svg",
    imageDescription: "Original asymmetric L-shape alongside three rotation options. Option B is correct — long arm pointing down, stub extends left.",
    options: ["A. (see figure)", "B. (see figure)", "C. (see figure)", "D. (rotated 180°)"],
    answer: 1,
  },
  {
    id: "SP3", dim: "spatial", subType: "Mirror image",
    text: "Identify the correct mirror image of the Devanagari text along the vertical axis shown.",
    imageUrl: "/disha-images/sp3.svg",
    imageDescription: "Original Devanagari text 'नम', vertical mirror axis (dashed), and options A–D.",
    indiaContext: "Uses Hindi/Devanagari script, visually familiar to all students in the target population.",
    options: ["A. (see figure)", "B. (see figure)", "C. (rotated version)", "D. (upside-down)"],
    answer: 1,
  },
  {
    id: "SP4", dim: "spatial", subType: "Cube counting",
    text: "How many unit cubes are in this isometric arrangement (including hidden cubes)?",
    imageUrl: "/disha-images/sp4.svg",
    imageDescription: "Isometric 3D stack. Total = 19 cubes including hidden ones.",
    options: ["14", "17", "19", "22"],
    answer: 2,
  },
  {
    id: "SP5", dim: "spatial", subType: "Paper folding",
    text: "A square paper is folded diagonally twice, then punched once near the corner. Which option shows the correct hole pattern when fully unfolded?",
    imageUrl: "/disha-images/sp5.svg",
    imageDescription: "Step-by-step: square → diagonal fold → second diagonal fold + punch. Options A–D show different hole patterns.",
    options: ["1 hole at centre", "4 symmetrical holes", "2 holes diagonal", "3 holes offset"],
    answer: 1,
  },
  {
    id: "SP6", dim: "spatial", subType: "Visual matrix",
    text: "The matrix follows two rules: shape type changes across rows; fill level increases down columns. Which option completes the missing bottom-right cell?",
    imageUrl: "/disha-images/sp6.svg",
    imageDescription: "3×3 matrix: Row 1 = circles, Row 2 = triangles, Row 3 = squares. Column fill: empty → half → full. Missing cell = fully filled square.",
    options: ["Empty circle", "Fully filled square", "Empty square", "Half-filled triangle"],
    answer: 1,
  },
  {
    id: "SP7", dim: "spatial", subType: "Embedded figure",
    text: "A simple geometric shape is hidden within this complex rangoli pattern. Identify it.",
    imageUrl: "/disha-images/sp7.svg",
    imageDescription: "Colourful rangoli with petal motifs. An equilateral triangle is embedded in the decorative lines.",
    indiaContext: "Rangoli patterns are culturally familiar to Indian students across all regions.",
    options: ["Circle", "Equilateral Triangle", "Square", "Diamond"],
    answer: 1,
  },
  {
    id: "SP8", dim: "spatial", subType: "Top-down view",
    text: "Which option correctly represents the top-down (bird's-eye) view of this classroom arrangement?",
    imageUrl: "/disha-images/sp8.svg",
    imageDescription: "3D classroom: blackboard North wall, teacher desk, 3×3 student grid, window West wall, door South-East. Option B shows correct top view.",
    options: ["A. (see figure)", "B. (see figure)", "C. (see figure)", "D. (rotated 180°)"],
    answer: 1,
  },
  {
    id: "SP9", dim: "spatial", subType: "Count triangles",
    text: "How many triangles of all sizes are contained in this figure?",
    imageUrl: "/disha-images/sp9.svg",
    imageDescription: "Large triangle subdivided by internal lines. Total = 16 triangles of all sizes.",
    options: ["12", "14", "16", "18"],
    answer: 2,
  },
  {
    id: "SP10", dim: "spatial", subType: "Figure series",
    text: "The figure rotates 45° clockwise each step. What is the 6th figure in the series?",
    imageUrl: "/disha-images/sp10.png",
    imageDescription: "Arrow series: Fig1=0°, Fig2=45°, Fig3=90°, Fig4=135°, Fig5=180°. Fig6 = 225°.",
    options: ["Arrow at 180°", "Arrow at 225° (pointing down-left)", "Arrow at 270°", "Arrow at 90°"],
    answer: 1,
  },
  {
    id: "SP11", dim: "spatial", subType: "Figure analogy",
    text: "The first pair shows a transformation rule (inside-out swap). Apply the same rule to find the missing figure.",
    imageUrl: "/disha-images/sp11.svg",
    imageDescription: "Pair 1: circle-inside-square → square-inside-circle. Pair 2: triangle-inside-circle → ? (circle inside triangle).",
    options: ["Triangle inside circle (unchanged)", "Both shapes solid", "Inverted versions", "Filled circle inside triangle outline"],
    answer: 3,
  },
  {
    id: "SP12", dim: "spatial", subType: "Architectural plan",
    text: "You are in Room A facing North. You turn 180°. You walk through the connecting door. Which room are you in and which direction are you facing?",
    imageUrl: "/disha-images/sp12.svg",
    imageDescription: "Floor plan: Room A (left) and Room B (right) connected by a door in the shared east wall. North arrow shown.",
    options: ["Room A, facing North", "Room B, facing South", "Room B, facing North", "Room A, facing South"],
    answer: 1,
  },
  {
    id: "SP13", dim: "spatial", subType: "Odd one out",
    text: "Three of the four figures follow a rotation pattern. Which figure does NOT belong?",
    imageUrl: "/disha-images/sp13.png",
    imageDescription: "Four arrow+dot figures rotating 90° CW. Figure D's dot position breaks the consistent pattern.",
    options: ["Figure A", "Figure B", "Figure C", "Figure D"],
    answer: 3,
  },
  {
    id: "SP14", dim: "spatial", subType: "Gestalt completion",
    text: "Only about 70% of this object is visible. What is the complete object?",
    imageUrl: "/disha-images/sp14.svg",
    imageDescription: "Partial view of a pressure cooker: safety valve on lid, side handles, domed lid shape visible.",
    indiaContext: "Pressure cookers are found in virtually every Indian household.",
    options: ["Metal bucket", "Pressure cooker", "Water jug", "Tiffin box"],
    answer: 1,
  },
];

// 2D — Logical / Abstract Reasoning (14 items, 6 min, timed)
// Q15–16 are image-based; Q17–28 are text-based.
const ABSTRACT = [
  {
    id: "AB1", dim: "abstract", subType: "Abstract matrix",
    text: "The 3×3 matrix follows two rules: shape gains sides across rows (triangle→square→pentagon); fill darkens down columns (empty→half→full). Which figure fills the missing bottom-right cell?",
    imageUrl: "/disha-images/ab1.png",
    imageDescription: "3×3 matrix: Row 1 = triangles (empty, half-filled, full). Row 2 = squares. Row 3 = pentagons (empty, half, ?). Missing = fully filled pentagon.",
    options: ["Empty pentagon", "Fully filled pentagon", "Half-filled square", "Full triangle"],
    answer: 1,
  },
  {
    id: "AB2", dim: "abstract", subType: "Abstract series",
    text: "The series follows two simultaneous rules: shape gains one side per step; a satellite dot moves 45° clockwise per step. What is the 6th figure?",
    imageUrl: "/disha-images/ab2.svg",
    imageDescription: "F1=triangle dot@12, F2=square dot@45°, F3=pentagon dot@90°, F4=hexagon dot@135°, F5=heptagon dot@180°. F6=octagon dot@225°.",
    options: ["Heptagon, dot at 180°", "Octagon, dot at 225° (bottom-left)", "Hexagon, dot at 270°", "Octagon, dot at 180°"],
    answer: 1,
  },
  {
    id: "AB3", dim: "abstract", subType: "Blood relation",
    text: "A is the son of B. C is B's sister. D is C's mother. E is D's husband. How is A related to E?",
    options: ["Son", "Nephew", "Grandson", "Great-grandson"],
    imageUrl: "/disha-images/ab3.png",
    answer: 2,
  },
  {
    id: "AB4", dim: "abstract", subType: "Direction",
    text: "Ankit walks 5 km North, turns right (East) and walks 3 km, then turns right again (South) and walks 5 km. How far and in which direction is he from his starting point?",
    options: ["5 km North", "3 km East", "3 km West", "8 km South-East"],
    imageUrl: "/disha-images/ab4.png",
    answer: 1,
  },
  {
    id: "AB5", dim: "abstract", subType: "Coded language",
    text: "If STRONG is coded as OPQJLE, what is the code for CODE in the same system?",
    options: ["YJAB", "AMBC", "BODE", "QMBC"],
    // imageUrl: "/disha-images/ab5.png",
    answer: 1,
  },
  {
    id: "AB6", dim: "abstract", subType: "Ranking",
    text: "In a class of 40 students, Deepa ranks 12th from the top and 31st from the bottom. Is this consistent?",
    options: ["Yes, it is possible", "No, it is impossible (12 + 31 − 1 = 42 ≠ 40)", "Cannot determine", "Only if ties exist"],
    // imageUrl: "/disha-images/ab6.png",
    answer: 1,
  },
  {
    id: "AB7", dim: "abstract", subType: "Odd one out",
    text: "Which number is the odd one out: 144, 121, 100, 81, 63, 49?",
    options: ["81", "100", "63", "49"],
    // imageUrl: "/disha-images/ab7.png",
    answer: 2,
  },
  {
    id: "AB8", dim: "abstract", subType: "Venn diagram",
    text: "A Venn diagram has three overlapping circles: Indians, Doctors, Footballers. Which region represents Indians who are BOTH doctors AND footballers?",
    imageUrl: "/disha-images/ab8.png",
    options: ["Only the Doctors circle", "The centre region (intersection of all three)", "The Footballers-only region", "The Indians-only region"],
    answer: 1,
  },
  {
    id: "AB9", dim: "abstract", subType: "Input-output",
    text: "A machine gives: Input 4 → Output 18; Input 7 → Output 51; Input 5 → Output 27. What is the output when input = 6?",
    options: ["36", "37", "38", "40"],
    imageUrl: "/disha-images/ab9.png",
    answer: 2,
  },
  {
    id: "AB10", dim: "abstract", subType: "Symbol analogy",
    text: "○△ : △○ :: □● : ?   (Apply the same position-swap rule to the second pair.)",
    options: ["●□", "□●", "●●", "○□"],
    imageUrl: "/disha-images/ab10.png",
    answer: 0,
  },
  {
    id: "AB11", dim: "abstract", subType: "Alphabet series",
    text: "A, C, F, J, O, __ — What comes next? (Gaps between letters: +2, +3, +4, +5, +6…)",
    options: ["T", "U", "V", "W"],
    answer: 1,
  },
  {
    id: "AB12", dim: "abstract", subType: "Missing number",
    text: "Using the pattern in the grid, find the missing number.",
    options: ["24", "25", "26", "27"],
    imageUrl: "/disha-images/ab11.png",
    answer: 3,
  },
  {
    id: "AB13", dim: "abstract", subType: "Statement-conclusion",
    text: "Does the conclusion necessarily follow from the two statements?",
    options: ["Yes — the conclusion follows", "No — the conclusion does not follow"],
    imageUrl: "/disha-images/ab12.png",
    answer: 0,
  },
  {
    id: "AB14", dim: "abstract", subType: "Clock angle",
    text: "At 3:40, what is the angle between the hour and minute hands of a clock?",
    options: ["100°", "115°", "130°", "145°"],
    answer: 2,
  },
];

// 2E — Closure (6) · Clerical Accuracy (5) · Mechanical Reasoning (5) — 16 items, 7 min
const CLOSURE_CLERICAL_MECH = [
  // ── CLOSURE ──
  {
    id: "CL1", dim: "closure", subType: "Closure",
    text: "Only part of this Indian string instrument is visible (~70%). Which instrument is shown?",
    imageUrl: "/disha-images/cl29.svg",
    imageDescription: "Partial sitar: long fretted neck, two gourd resonators, tuning pegs visible.",
    indiaContext: "Indian classical instrument. All four options are Indian string instruments.",
    options: ["Veena", "Sarod", "Sitar", "Tanpura"],
    answer: 2,
  },
  {
    id: "CL2", dim: "closure", subType: "Closure",
    text: "From this fragmented and partially blurred map outline, identify the Indian state.",
    imageUrl: "/disha-images/cl30.svg",
    imageDescription: "Triangular shape with long eastern coastline along Bay of Bengal, pointed southern tip.",
    options: ["Andhra Pradesh", "Odisha", "West Bengal", "Jharkhand"],
    answer: 1,
  },
  {
    id: "CL3", dim: "closure", subType: "Closure",
    text: "Fill in the blanks to complete this word related to scientific investigation: C_R_O_I_T_",
    imageUrl: "/disha-images/cl31.svg",
    imageDescription: "Word pattern with alternating letters shown and blanks.",
    options: ["CURIOSITY", "CHEMISTRY", "CORROSIVE", "CIRCUITRY"],
    answer: 0,
  },
  {
    id: "CL4", dim: "closure", subType: "Closure",
    text: "What figure do these Kolam dots suggest when mentally connected?",
    imageUrl: "/disha-images/cl32.svg",
    imageDescription: "Concentric diamond arrangement of dots with large central dot — classic Kolam/rangoli structure.",
    indiaContext: "Kolam dot patterns are part of daily domestic culture in India, especially during festivals.",
    options: ["A square grid", "A lotus / star polygon", "A spiral", "A cross"],
    answer: 1,
  },
  {
    id: "CL5", dim: "closure", subType: "Closure",
    text: "Based on the visible data points (Jan–Apr), which option shows the most likely complete graph?",
    imageUrl: "/disha-images/cl33.svg",
    imageDescription: "Line graph showing rising S-curve Jan–Apr with rate decelerating. May–Aug missing.",
    options: ["Continues rising steeply to 100", "S-curve, plateaus around 80–82", "Falls back sharply to 20", "Oscillates up and down"],
    answer: 1,
  },
  {
    id: "CL6", dim: "closure", subType: "Closure",
    text: "Based on the partially revealed paragraph, which historical event is being described?",
    imageUrl: "/disha-images/cl34.svg",
    imageDescription: "Passage with blacked-out words: '...The year was 1947. Thousands gathered as midnight approached. Nehru's voice crackled over the radio...'",
    indiaContext: "Refers to Nehru's 'Tryst with Destiny' speech, 14–15 August 1947.",
    options: ["Partition of Bengal (1905)", "Indian Independence, 15 August 1947", "Republic Day, 26 January 1950", "Gandhi's Salt March (1930)"],
    answer: 1,
  },
  // ── CLERICAL ACCURACY ──
  {
    id: "CL7", dim: "clerical", subType: "Compare pairs",
    text: "For each pair, decide SAME or DIFFERENT as quickly as possible.",
    options: ["3 pairs are DIFFERENT", "4 pairs are DIFFERENT", "5 pairs are DIFFERENT", "6 pairs are DIFFERENT"],
    answer: 2,
    imageUrl: "/disha-images/cl7.png",
  },
  {
    id: "CL8", dim: "clerical", subType: "Error detection",
    text: "In the transaction ledger below, find all entries where the Running Balance is incorrect (Debit/Credit not properly applied). How many errors are there?\n\n1. Opening Balance → ₹10,000 ✓\n2. Salary +₹25,000 → Balance ₹35,000 ✓\n3. Rent −₹8,000 → Balance ₹28,500\n4. Groceries −₹1,200 → Balance ₹25,800 ✓\n5. Phone −₹600 → Balance ₹25,200 ✓\n6. Freelance +₹5,000 → Balance ₹29,400\n7. Petrol −₹800 → Balance ₹24,400 ✓\n8. Electricity −₹1,500 → Balance ₹26,900\n9. Dividend +₹2,000 → Balance ₹24,900 ✓\n10. Books −₹450 → Balance ₹24,450 ✓",
    options: ["1 error", "2 errors", "3 errors", "4 errors"],
    answer: 2,
  },
  {
    id: "CL9", dim: "clerical", subType: "Spot typos",
    text: "How many typographical errors are in this passage?\n\n'The Reserve Bank of Inida has raised the repo rate by 25 basis poionts to control inflaiton. The decision was taken after a meeting of the Monetary Policy Committee.'",
    options: ["1 error", "2 errors", "3 errors", "4 errors"],
    answer: 2,
  },
  {
    id: "CL10", dim: "clerical", subType: "Alphabetise",
    text: "Arrange these 8 names in A–Z alphabetical order by first name:\nZafar Malik, Aditya Kumar, Bhavna Joshi, Chetan Sharma, Priya Nair, Meena Pillai, Reena Iyer, Suresh Gopal\n\nWhich of these is the correct 4th name in the sorted list?",
    indiaContext: "Indian names from diverse regional, religious, and gender backgrounds.",
    options: ["Chetan Sharma", "Meena Pillai", "Priya Nair", "Reena Iyer"],
    answer: 1,
  },
  {
    id: "CL11", dim: "clerical", subType: "Number scanning",
    text: "How many times does the number 2847 appear in the grid below? (60-second limit)\n\n3847 2847 7248 4728 2748 8274 2847 4827 7284 2478\n4728 7284 2478 2847 3748 4782 7482 2847 3748 4827\n8472 2847 4827 7842 8247 2748 4287 8472 2847 7284\n7248 4827 8274 3847 2847 4278 8724 2748 7428 2847\n2478 8472 2847 4782 7248 8247 3847 4728 2847 7284",
    options: ["9 occurrences", "10 occurrences", "13 occurrences", "15 occurrences"],
    answer: 2,
  },
  // ── MECHANICAL REASONING ──
  {
    id: "CL12", dim: "mechanical", subType: "Lever",
    text: "A 40 kg child sits 3 m from the pivot of a see-saw. Where must a 60 kg child sit on the other side to balance it?",
    imageUrl: "/disha-images/cl40.png",
    imageDescription: "See-saw with 40 kg child at 3 m left of pivot and 60 kg child at unknown distance right.",
    options: ["1.5 m", "2 m", "2.5 m", "3 m"],
    answer: 1,
  },
  {
    id: "CL13", dim: "mechanical", subType: "Gears",
    text: "Gear A (large) rotates clockwise at 10 rpm. Gear B (medium) meshes with A. Gear C (small) meshes with B. In which direction does Gear C rotate, and at what relative speed?",
    imageUrl: "/disha-images/cl41.svg",
    imageDescription: "Gear train: A (large, CW) → B (medium, CCW) → C (small, CW). Each mesh reverses direction; smaller gear rotates faster.",
    options: ["Clockwise, same speed as A", "Anticlockwise, higher rpm", "Clockwise, higher rpm", "Anticlockwise, same speed"],
    answer: 2,
  },
  {
    id: "CL14", dim: "mechanical", subType: "Heat transfer",
    text: "A clay diya and a metal coin are left in the same sunlit room. The metal coin feels hotter to the touch. Why?",
    imageUrl: "/disha-images/cl42.svg",
    imageDescription: "Sun shining on both a clay diya (feels cool) and a metal coin (feels hot) in the same room.",
    indiaContext: "Clay diyas are universally familiar, especially around Diwali.",
    options: ["The coin reflects more sunlight", "Clay absorbs heat better", "Metal has higher thermal conductivity", "The diya is cooled by its flame"],
    answer: 2,
  },
  {
    id: "CL15", dim: "mechanical", subType: "Pipes",
    text: "Pipe A has diameter 4 cm and Pipe B has diameter 8 cm. Both have the same pressure head. Which pipe delivers more water, and by approximately what factor?",
    imageUrl: "/disha-images/cl43.svg",
    imageDescription: "Pipe A (narrow, d=4cm) vs Pipe B (wide, d=8cm) with equal pressure head. Flow ∝ r².",
    options: ["Pipe B, ~2×", "Pipe B, ~4×", "Pipe B, ~8×", "Both deliver equal flow"],
    answer: 1,
  },
  {
    id: "CL16", dim: "mechanical", subType: "Pendulum",
    text: "A pendulum that swings at a certain rate on Earth is taken to the Moon (gravity = 1/6 of Earth's). Will it swing faster, slower, or at the same rate?",
    imageUrl: "/disha-images/cl44.svg",
    imageDescription: "Earth pendulum (normal arc) vs Moon pendulum (wider arc, slower). T = 2π√(L/g) — less g means longer period.",
    options: ["Faster", "Slower", "At the same rate", "Cannot be determined"],
    answer: 1,
  },
];

// 2F — Memory (6 items) · Creativity (4 items) — 10 items, 6 min
// Memory scored on recall accuracy; creativity scored on Fluency / Flexibility / Originality.
const MEMORY_CREATIVITY = [
  {
    id: "MC1", dim: "memory", subType: "Digit span forward",
    text: "The sequence below will be shown for 3 seconds then disappear. Type the digits in the SAME order from memory.",
    imageUrl: "/disha-images/mc45.svg",
    imageDescription: "Six digit boxes showing: 7 · 2 · 5 · 9 · 1 · 4",
    format: "text_recall",
    answer: "725914",
  },
  {
    id: "MC2", dim: "memory", subType: "Digit span backward",
    text: "Study the sequence below, then type it in REVERSE order from memory.",
    imageUrl: "/disha-images/mc46.svg",
    imageDescription: "Five digit boxes showing: 4 · 8 · 2 · 7 · 3",
    format: "text_recall",
    answer: "37284",
  },
  {
    id: "MC3", dim: "memory", subType: "Paired associates",
    text: "Study these 10 Indian word pairs for 60 seconds. When shown the first word, recall the second.\n\nGANGA – MOKSHA\nNEEM – MEDICINE\nDIYA – FESTIVAL\nTABLA – RHYTHM\nCRICKET – BAT\nCHAI – MORNING\nAUTO – FARE\nMANGO – SUMMER\nEXAM – STRESS\nKURTA – FABRIC\n\nHow many second-words did you recall correctly? (0–10)",
    indiaContext: "All pairs use culturally embedded Indian associations for ecological validity.",
    format: "count",
    maxCount: 10,
  },
  {
    id: "MC4", dim: "memory", subType: "Story recall",
    text: "Read the passage carefully. Answer 8 factual questions 5 minutes later (passage will not be visible).\n\nSunita Devi grew up in a small village near Patna, Bihar. Her father was a primary school teacher earning ₹18,000 per month, and her mother worked as an ASHA worker. The family had three children — Sunita was the eldest.\n\nDespite limited resources, Sunita was determined to clear the UPSC Civil Services examination. She studied for four years after completing her B.Sc. in Chemistry from Patna Women's College. She appeared three times before clearing it in her third attempt at the age of 26.\n\nIn her mains examination, she scored 987 out of 1750 marks. She was allocated the Bihar cadre and posted as a Sub-Divisional Magistrate in Muzaffarpur. Her first major assignment was flood relief coordination.\n\nHow many of the 8 recall questions did you answer correctly? (0–8)",
    indiaContext: "IAS exam passage. All 8 recall targets are marked in bold in the passage.",
    format: "count",
    maxCount: 8,
  },
  {
    id: "MC5", dim: "memory", subType: "Spatial grid",
    text: "Study the 4×4 grid of Indian cultural symbols for 30 seconds. Reproduce the symbol positions from memory.\n\nHow many symbols did you place in the correct position? (0–8)",
    imageUrl: "/disha-images/mc49.svg",
    imageDescription: "4×4 grid: Om(R1C1), Lotus(R1C2), Chakra(R1C4), Peacock(R2C2), Sun(R2C3), Tiger(R3C1), Crescent(R3C4), Star(R4C2). 8 empty cells.",
    indiaContext: "Symbols drawn from Indian cultural, religious, and national heritage.",
    format: "count",
    maxCount: 8,
  },
  {
    id: "MC6", dim: "memory", subType: "Name-career matching",
    text: "Study these 6 profiles for 45 seconds, then match names to careers from memory.\n\nRohit — Civil Engineer (builds bridges in Nagpur)\nKavitha — Surgeon (AIIMS Chennai, cardiac surgery)\nAryan — Musician (Sitar, Varanasi)\nPooja — IAS Officer (District Collector, UP)\nSalim — Chef (Restaurant owner, Mumbai)\nDeepa — Scientist (ISRO researcher, Bengaluru)\n\nHow many name–career pairs did you match correctly? (0–6)",
    indiaContext: "Names from diverse Indian regional, religious, and gender backgrounds.",
    format: "count",
    maxCount: 6,
  },
  {
    id: "MC7", dim: "creativity", subType: "Alternative uses",
    text: "List as many different uses as you can think of for a BROKEN BANGLE in 90 seconds. One idea per line. There are no right or wrong answers — be as creative as possible.\n\n(Scored on: Fluency = count of valid uses · Flexibility = number of different categories · Originality = rarity vs. peer group)",
    imageUrl: "/disha-images/mc51.svg",
    imageDescription: "A broken glass bangle (churiya) — the arc is nearly complete but snapped at one point.",
    indiaContext: "Glass bangles (churiyan) are universally familiar in India, especially around festivals.",
    format: "open_list",
  },
  {
    id: "MC8", dim: "creativity", subType: "Remote associates",
    text: "Find ONE word or phrase that meaningfully connects all three words:",
    imageUrl: "/disha-images/mc52.svg",
    imageDescription: "Three word tiles: CHAI · CUTTING · STALL",
    format: "open_text",
    answer: "Cutting Chai Stall",
    indiaContext: "'Cutting chai' is a Hindi-English term for half-glass tea sold at roadside stalls — deeply embedded in Indian urban culture.",
  },
  {
    id: "MC9", dim: "creativity", subType: "Consequence thinking",
    text: "What would happen if all Indian schools abolished exams and graded students only on projects?\n\nList as many consequences as possible — include unexpected, positive, negative, and far-fetched ones.\n(60 seconds · one per line · Scored on Fluency, Flexibility, Originality)",
    format: "open_list",
    indiaContext: "High-engagement prompt for Indian students given the centrality of exams in the education system.",
  },
  {
    id: "MC10", dim: "creativity", subType: "Incomplete figures",
    text: "Develop each of the 5 squiggles into a complete recognisable drawing and give each one an UNUSUAL title.\n(4 minutes for all 5 · Scored on Elaboration, Originality, Title quality)",
    imageUrl: "/disha-images/mc54.svg",
    imageDescription: "5 squiggle boxes: (1) S-curve, (2) plus/cross, (3) open arch, (4) circle with tail, (5) jagged line.",
    format: "count",
    maxCount: 5,
  },
];

/* =========================================================================
   MODULE 3 — PERSONALITY: BIG FIVE (OCEAN)
   48 items = 40 scored (8/factor: 4 normal + 4 reverse) + 8 validity (SD/RV).
   5-point Likert. Ipsative adjustment + reverse scoring applied in scoring.
   "factor" ∈ O,C,E,A,N. reverse=true → score = 6 − raw.
   validity items carry a "validity" tag instead of a factor.
   ========================================================================= */
const OCEAN = [
  // Openness (O)
  { id: "O1", type: "likert", factor: "O", reverse: false, text: "I enjoy exploring ideas from fields completely unrelated to my studies — I read about astronomy even when I study Commerce." },
  { id: "O2", type: "likert", factor: "O", reverse: false, text: "I find beauty in things others consider ordinary — a mathematical proof, a Mughal miniature, a circuit diagram." },
  { id: "O3", type: "likert", factor: "O", reverse: true, text: "I would rather follow a proven method than try an unproven, creative approach." },
  { id: "O4", type: "likert", factor: "O", reverse: false, text: "I often imagine how the world could be completely different from how it is — better cities, different social systems, alternative histories." },
  { id: "O5", type: "likert", factor: "O", reverse: false, indiaSpecific: true, text: "When I study a topic, I frequently wonder 'why does this work?' rather than just memorising it." },
  { id: "O6", type: "likert", factor: "O", reverse: false, indiaSpecific: true, text: "I enjoy listening to music from different traditions — Carnatic, Hindustani, jazz, rock — out of genuine curiosity." },
  { id: "O7", type: "likert", factor: "O", reverse: true, text: "I prefer career paths that are predictable and well-defined over those that are open-ended and exploratory." },
  { id: "O8", type: "likert", factor: "O", reverse: false, text: "Even when I strongly disagree with an idea, I find myself trying to understand why someone intelligent might believe it." },

  // Conscientiousness (C)
  { id: "C1", type: "likert", factor: "C", reverse: false, text: "I make detailed plans before starting any major task — study schedule, exam strategy, project outline." },
  { id: "C2", type: "likert", factor: "C", reverse: true, text: "I often leave things to the last minute and then rush to complete them." },
  { id: "C3", type: "likert", factor: "C", reverse: false, indiaSpecific: true, text: "Once I commit to a goal — like clearing JEE or scoring 90%+ in boards — I keep working even when it stops being exciting." },
  { id: "C4", type: "likert", factor: "C", reverse: false, indiaSpecific: true, text: "I maintain my study routine even during Diwali or Eid holidays, if exams are approaching." },
  { id: "C5", type: "likert", factor: "C", reverse: false, text: "I double-check my answer sheets for errors before submitting, even when running short on time." },
  { id: "C6", type: "likert", factor: "C", reverse: false, text: "I set smaller milestones (e.g., chapter-by-chapter targets) to track my progress toward a big goal." },
  { id: "C7", type: "likert", factor: "C", reverse: true, indiaSpecific: true, text: "I find it hard to resist distractions (mobile, friends, cricket matches on TV) when I am supposed to be studying." },
  { id: "C8", type: "likert", factor: "C", reverse: false, text: "I prefer to complete tasks well ahead of the deadline, leaving time to review and improve." },

  // Extraversion (E)
  { id: "E1", type: "likert", factor: "E", reverse: false, text: "I feel energised — not just fine, but genuinely energised — after spending time with a large group of people." },
  { id: "E2", type: "likert", factor: "E", reverse: false, indiaSpecific: true, text: "During family gatherings and festivals, I am usually one of the most active and talkative people present." },
  { id: "E3", type: "likert", factor: "E", reverse: true, text: "After a long day at school with many social interactions, I need quiet time alone to recover." },
  { id: "E4", type: "likert", factor: "E", reverse: false, text: "I speak up in class or group discussions, even when I am not entirely sure of my answer." },
  { id: "E5", type: "likert", factor: "E", reverse: false, indiaSpecific: true, text: "I would enjoy being a class representative, school captain, or event organiser." },
  { id: "E6", type: "likert", factor: "E", reverse: true, text: "I prefer working on a project alone than coordinating with a group." },
  { id: "E7", type: "likert", factor: "E", reverse: false, indiaSpecific: true, text: "I genuinely enjoy performing — speaking at a school function, acting in a play, presenting to the class." },
  { id: "E8", type: "likert", factor: "E", reverse: false, text: "I naturally take charge in unstructured situations where someone needs to lead." },

  // Agreeableness (A)
  { id: "A1", type: "likert", factor: "A", reverse: false, text: "I genuinely care about the well-being of people I have never met — underprivileged children, elderly farmers, displaced workers." },
  { id: "A2", type: "likert", factor: "A", reverse: false, text: "I often put others' needs before my own, sometimes at personal cost." },
  { id: "A3", type: "likert", factor: "A", reverse: false, indiaSpecific: true, text: "Maintaining family and community harmony is more important to me than always expressing my personal opinion." },
  { id: "A4", type: "likert", factor: "A", reverse: false, text: "I volunteer to help classmates who are struggling, even when I am busy with my own work." },
  { id: "A5", type: "likert", factor: "A", reverse: false, text: "I find satisfaction in contributing to a team's success, even when I receive no personal credit." },
  { id: "A6", type: "likert", factor: "A", reverse: true, text: "I believe in looking out for myself first — others will take care of themselves." },
  { id: "A7", type: "likert", factor: "A", reverse: false, indiaSpecific: true, text: "During family disputes or arguments, I usually try to find common ground rather than insisting on being right." },
  { id: "A8", type: "likert", factor: "A", reverse: false, text: "I feel genuinely troubled when I see others suffering — it stays with me beyond the moment." },

  // Neuroticism (N)
  { id: "N1", type: "likert", factor: "N", reverse: false, text: "I worry about things going wrong even when everything seems fine at the moment." },
  { id: "N2", type: "likert", factor: "N", reverse: false, indiaSpecific: true, text: "Thinking about not getting into IIT, AIIMS, or my dream college makes me feel significantly anxious." },
  { id: "N3", type: "likert", factor: "N", reverse: false, text: "My mood changes dramatically based on events around me — one piece of bad news ruins my entire day." },
  { id: "N4", type: "likert", factor: "N", reverse: false, text: "When I receive criticism of my work — from a teacher, parent, or friend — it affects my confidence for a long time." },
  { id: "N5", type: "likert", factor: "N", reverse: true, text: "I bounce back quickly after a setback — a bad exam result, a rejection — within a day or two." },
  { id: "N6", type: "likert", factor: "N", reverse: false, text: "I often feel that I am not good enough, even after performing well." },
  { id: "N7", type: "likert", factor: "N", reverse: false, indiaSpecific: true, text: "I feel overwhelmed when I have many tasks at once — mock tests, school exams, tuition, and family expectations." },
  { id: "N8", type: "likert", factor: "N", reverse: true, text: "I feel comfortable in uncertain, unpredictable situations — they excite rather than unsettle me." },

  // Embedded validity items (Social Desirability + Rare Virtues), 5-point Likert, agree-keyed.
  { id: "SD1", type: "likert", validity: "SD", agreeKeyed: true, reverse: false, text: "I always return the correct change, even when the shopkeeper gives me too much." },
  { id: "SD3", type: "likert", validity: "SD", agreeKeyed: true, reverse: false, indiaSpecific: true, text: "I have never been tempted to cheat in an exam, even under extreme pressure." },
  { id: "SD5", type: "likert", validity: "SD", agreeKeyed: true, reverse: false, indiaSpecific: true, text: "I always treat everyone with equal respect, regardless of their social status." },
  { id: "RV1", type: "likert", validity: "RV", agreeKeyed: true, reverse: false, text: "I have never, even briefly, felt envious of someone else's success." },
  { id: "RV2", type: "likert", validity: "RV", agreeKeyed: true, reverse: false, text: "I have never postponed any task I knew I should complete." },
  { id: "RV3", type: "likert", validity: "RV", agreeKeyed: true, reverse: false, text: "I have been completely honest in every single situation in my entire life." },
  { id: "RV4", type: "likert", validity: "RV", agreeKeyed: true, reverse: false, text: "I have never felt even briefly angry or resentful towards a family member." },
  { id: "SD7", type: "likert", validity: "SD", agreeKeyed: true, reverse: false, text: "I have never felt even briefly jealous of a classmate's success." },
];

/* =========================================================================
   MODULE 4A — INTERESTS: HOLLAND RIASEC
   36 items = 18 forced-choice + 18 Likert (3 per type).
   R_total = (Likert_R × 0.60) + (ForcedChoice_R × 0.40).
   ========================================================================= */

// Forced-choice pairs: each option maps to a RIASEC type. Choosing option adds to that type.
const RIASEC_FC = [
  { id: "FC1", type: "forced_choice", optionA: { text: "Designing mechanical components of a new electric vehicle at Tata Motors", dim: "R" }, optionB: { text: "Counselling children with learning difficulties at a Navnirmiti school", dim: "S" } },
  { id: "FC2", type: "forced_choice", optionA: { text: "Conducting original research on drug-resistant tuberculosis at ICMR", dim: "I" }, optionB: { text: "Creating the marketing strategy for a new startup in Bengaluru", dim: "E" } },
  { id: "FC3", type: "forced_choice", optionA: { text: "Writing and directing a short film for a national competition", dim: "A" }, optionB: { text: "Auditing financial records and preparing tax returns for a company", dim: "C" } },
  { id: "FC4", type: "forced_choice", optionA: { text: "Teaching Mathematics to Class 10 students at a government school", dim: "S" }, optionB: { text: "Leading the student council and organising all major school events", dim: "E" } },
  { id: "FC5", type: "forced_choice", optionA: { text: "Analysing data to find patterns in India's economic growth", dim: "I" }, optionB: { text: "Maintaining accurate financial records for a charitable trust", dim: "C" } },
  { id: "FC6", type: "forced_choice", optionA: { text: "Preparing detailed accounts and tax returns for a large manufacturing company", dim: "C" }, optionB: { text: "Developing a creative marketing campaign for that same company", dim: "A" } },
  { id: "FC7", type: "forced_choice", optionA: { text: "Repairing and maintaining heavy machinery on a construction site", dim: "R" }, optionB: { text: "Designing the visual identity and logo for a new brand", dim: "A" } },
  { id: "FC8", type: "forced_choice", optionA: { text: "Running experiments in a chemistry lab to test a new hypothesis", dim: "I" }, optionB: { text: "Organising and leading a community health awareness drive", dim: "S" } },
  { id: "FC9", type: "forced_choice", optionA: { text: "Persuading investors to fund a new business idea", dim: "E" }, optionB: { text: "Following a precise procedure to ensure error-free data entry", dim: "C" } },
  { id: "FC10", type: "forced_choice", optionA: { text: "Building furniture or repairing electronics with your own hands", dim: "R" }, optionB: { text: "Investigating the root cause of a complex scientific problem", dim: "I" } },
  { id: "FC11", type: "forced_choice", optionA: { text: "Helping elderly patients recover through physiotherapy", dim: "S" }, optionB: { text: "Composing music or writing poetry", dim: "A" } },
  { id: "FC12", type: "forced_choice", optionA: { text: "Starting and managing your own company", dim: "E" }, optionB: { text: "Operating and calibrating precision instruments in a workshop", dim: "R" } },
  { id: "FC13", type: "forced_choice", optionA: { text: "Managing the accounts and inventory for a retail chain", dim: "C" }, optionB: { text: "Diagnosing and treating patients as a doctor", dim: "I" } },
  { id: "FC14", type: "forced_choice", optionA: { text: "Mentoring younger students as a senior volunteer", dim: "S" }, optionB: { text: "Negotiating a major sales deal for a corporation", dim: "E" } },
  { id: "FC15", type: "forced_choice", optionA: { text: "Sketching architectural designs for a new museum", dim: "A" }, optionB: { text: "Assembling and testing a robotics kit", dim: "R" } },
  { id: "FC16", type: "forced_choice", optionA: { text: "Auditing a government scheme for compliance", dim: "C" }, optionB: { text: "Campaigning to be elected as a youth leader", dim: "E" } },
  { id: "FC17", type: "forced_choice", optionA: { text: "Researching renewable energy technologies at IISc", dim: "I" }, optionB: { text: "Teaching village women to read and write", dim: "S" } },
  { id: "FC18", type: "forced_choice", optionA: { text: "Designing a fashion collection for a Delhi label", dim: "A" }, optionB: { text: "Keeping meticulous records as a bank clerk", dim: "C" } },
];

// Likert items: 3 per RIASEC type.
const RIASEC_LIKERT = [
  { id: "RL_R1", type: "likert", dim: "R", text: "I enjoy working with tools, machines, or physical materials more than with words or ideas." },
  { id: "RL_R2", type: "likert", dim: "R", text: "I find satisfaction in building something physical — a model, a machine, a structure." },
  { id: "RL_R3", type: "likert", dim: "R", text: "I would rather fix or assemble something with my hands than read about how it works." },
  { id: "RL_I1", type: "likert", dim: "I", text: "I am genuinely curious about how diseases, ecosystems, or technologies work at a fundamental level." },
  { id: "RL_I2", type: "likert", dim: "I", text: "I enjoy reading about scientific discoveries even in fields unrelated to my studies." },
  { id: "RL_I3", type: "likert", dim: "I", text: "I like solving complex problems that require deep analysis and logical thinking." },
  { id: "RL_A1", type: "likert", dim: "A", text: "I find satisfaction in creating something original — a design, a story, a composition, a new solution." },
  { id: "RL_A2", type: "likert", dim: "A", text: "I have a portfolio, sketchbook, journal, or creative project I work on purely out of personal interest." },
  { id: "RL_A3", type: "likert", dim: "A", text: "I prefer open-ended, expressive work over tasks with one fixed correct answer." },
  { id: "RL_S1", type: "likert", dim: "S", text: "I feel most fulfilled when I am helping someone solve a difficult personal problem." },
  { id: "RL_S2", type: "likert", dim: "S", indiaSpecific: true, text: "Contributing to the betterment of society — not just earning money — is a core part of why I want to work." },
  { id: "RL_S3", type: "likert", dim: "S", text: "I enjoy teaching, mentoring, or guiding others." },
  { id: "RL_E1", type: "likert", dim: "E", text: "I am drawn to careers where I can lead, influence, or create change at a larger scale." },
  { id: "RL_E2", type: "likert", dim: "E", indiaSpecific: true, text: "I am drawn to careers where I can create policy-level change for Indian society (IAS sub-scale)." },
  { id: "RL_E3", type: "likert", dim: "E", text: "I enjoy persuading people and taking the lead on ambitious projects." },
  { id: "RL_C1", type: "likert", dim: "C", text: "I enjoy organising data, following procedures carefully, and ensuring accuracy in my work." },
  { id: "RL_C2", type: "likert", dim: "C", text: "I find satisfaction in completing a task correctly and precisely, even if it is routine." },
  { id: "RL_C3", type: "likert", dim: "C", text: "I like having clear rules, structure, and well-defined responsibilities at work." },
];

/* =========================================================================
   MODULE 4B — WORK VALUES INVENTORY (WVI-India) + INDIAN CONTEXT SCALE (ICS)
   12 Likert value items + 1 forced-choice (Family-Congruent index) + 12 ICS items.
   ICS modulates recommendations (does not override).
   ========================================================================= */
const WORK_VALUES = [
  { id: "WV_Security", type: "likert", scale: "Security", text: "Job security and a guaranteed pension (like a government job) are more important to me than a high salary with risk." },
  { id: "WV_Prestige", type: "likert", scale: "Prestige", indiaSpecific: true, text: "I want a career that earns genuine respect in society and brings honour to my family." },
  { id: "WV_Autonomy", type: "likert", scale: "Autonomy", text: "I need the freedom to work in my own way, without micromanagement or rigid procedures." },
  { id: "WV_Altruism", type: "likert", scale: "Altruism", text: "I would accept a lower salary if my work directly helped underprivileged people." },
  { id: "WV_EconSecurity", type: "likert", scale: "EconSecurity", text: "Earning enough to live comfortably and support my family is the most important thing I want from a career." },
  { id: "WV_WLB", type: "likert", scale: "WLB", text: "Having time for family, health, and personal interests matters more to me than career advancement or titles." },
  { id: "WV_Achievement", type: "likert", scale: "Achievement", text: "I want to become a recognised expert — the best in my specific field in India." },
  { id: "WV_Growth", type: "likert", scale: "Growth", text: "I enjoy continuous learning; I would be deeply unhappy in a job that stopped challenging me intellectually." },
  { id: "WV_SocialContact", type: "likert", scale: "SocialContact", text: "I would like a career where I work with and lead other people, not just independently." },
  { id: "WV_PatrioticAchv", type: "likert", scale: "PatrioticAchv", indiaSpecific: true, text: "I want my work to contribute to India's development as a nation — not just my personal financial success." },
  { id: "WV_Opportunity", type: "likert", scale: "Opportunity", text: "I am drawn to careers in rapidly growing sectors (AI, renewable energy, space tech, fintech) even if they are less stable." },
  { id: "WV_FamilyCongruent", type: "forced_choice", scale: "FamilyCongruentIndex", indiaSpecific: true, text: "Which matters more to you right now?", optionA: { text: "A career my family enthusiastically approves of, even if it's not my first choice.", dim: "family" }, optionB: { text: "A career I am passionate about, even if my family has reservations.", dim: "passion" } },
];

const ICS = [
  { id: "IC1", type: "likert", control: "likert_plus", text: "My parents/guardians have a strong preference for which career I choose.", followUp: { whenGTE: 4, control: "dropdown", text: "Which type?", options: ["Doctor", "Engineer", "Govt job", "Business", "Any respected career", "Other"] }, use: "parentalPressureIndex" },
  { id: "IC2", type: "likert", text: "Choosing a career that generates income quickly is necessary for my family's financial situation.", use: "financialUrgency" },
  { id: "IC3", type: "likert", text: "I live in / expect to live in a joint family, and my career must be compatible with this lifestyle.", use: "locationScheduleModulation" },
  { id: "IC4", type: "likert", control: "likert_plus", text: "I face significant expectations related to my gender that constrain my career options.", followUp: { whenGTE: 4, control: "text", text: "Optional — describe briefly." }, use: "genderBarrierSection" },
  { id: "IC5", type: "likert", text: "I need to remain in or near my current city/state for personal or family reasons.", use: "geographicConstraint" },
  { id: "IC6", type: "likert", control: "numeric", min: 1, max: 10, text: "On a scale of 1–10, how much is your daily life currently dominated by preparation for one specific competitive exam?", use: "examDominance" },
  { id: "IC7", type: "likert", control: "text", counsellorOnly: true, text: "Is there a career you are secretly interested in but feel you cannot pursue? If yes, describe it briefly. (Visible to counsellor only — never shared with parents.)", use: "suppressedInterest" },
  { id: "IC8", type: "likert", control: "dropdown", text: "My family's economic situation:", options: ["We face financial difficulty meeting daily needs", "We are careful but comfortable", "We are financially secure", "We are affluent"], use: "affordabilityFilter" },
  { id: "IC9", type: "likert", control: "yesno_text", text: "In my family, there is a tradition or strong expectation of entering a specific profession.", followUp: { control: "dropdown", text: "If yes, specify", options: ["Family business", "Army", "Medicine", "Teaching", "Other"] }, use: "familyTraditionIndex" },
  { id: "IC10", type: "likert", text: "I would consider studying or working outside my home state or abroad if it led to a significantly better career. (1 = Never, 5 = Definitely yes)", use: "geographicOpenness" },
  { id: "IC11", type: "likert", control: "text", text: "My career role model is: [Name]. What specifically inspires you about their career?", use: "valuesIdentity" },
  { id: "IC12", type: "likert", control: "dropdown", text: "Which best describes you?", options: ["I have firmly decided my career path", "I have a general direction but am open", "I am genuinely uncertain and exploring", "I feel confused and anxious about this"], use: "careerClarityIndex" },
];

/* =========================================================================
   MODULE 5 — SITUATIONAL JUDGMENT TESTS (SJT)
   15 scenarios (5 detailed below + 10 additional). MO/LO format.
   Scoring: each option anchored to a competency profile. MO = +2, LO = −1.
   moScore = highest-MO option index; loScore = poorest option index.
   ========================================================================= */
const SJT = [
  {
    id: "SJT1",
    type: "sjt",
    title: "The Parental Pressure Dilemma",
    competencies: ["Assertiveness", "Family-Congruence", "Evidence-Based Thinking"],
    classFocus: "Class 10",
    scenario: "You have scored 89% in your Class 10 Board exams. You are genuinely passionate about Fine Arts and have been invited for a portfolio review at NID (National Institute of Design). Your father is a government engineer; your mother a school teacher. Both insist you take Science (PCM) for JEE. 'Design is fine as a hobby, but it won't feed a family.' Your maternal uncle, an architect who respects you, asks privately what you truly want.",
    options: [
      { key: "A", text: "Tell your uncle you'll follow your parents' advice — there's no point creating conflict over this.", moPoints: 1, note: "Family-Congruent but low Assertiveness" },
      { key: "B", text: "Ask your uncle to help arrange a calm, evidence-based conversation where NID alumni salary data and placement records are shared with your parents.", moPoints: 3, note: "Evidence-Based Thinking + Initiative + assertive dialogue" },
      { key: "C", text: "Independently research NID career outcomes and salary data, then present a rational case to your parents yourself.", moPoints: 3, note: "Evidence-Based Thinking + Initiative" },
      { key: "D", text: "Secretly plan to take Science while intending to switch to Design after Class 12, without informing your parents.", moPoints: 0, note: "poor Integrity + low Emotional Regulation" },
    ],
  },
  {
    id: "SJT2",
    type: "sjt",
    title: "The Coaching Centre Setback",
    competencies: ["Resilience", "Pragmatism", "Deferred-Gratification"],
    classFocus: "Class 11–12",
    scenario: "You are in Class 12, preparing for JEE. Your family has invested ₹1.8 lakh in 2 years of coaching. Three months before the exam, a comprehensive mock test gives you 48 percentile. Your coaching centre director says your chances of JEE-Advanced are very low and suggests you 'focus on other options.' You still genuinely love engineering and problem-solving.",
    options: [
      { key: "A", text: "Accept the coach's assessment and immediately tell your parents you are giving up on engineering entirely.", moPoints: 1, note: "low Resilience" },
      { key: "B", text: "Ignore the feedback and continue with the exact same preparation strategy, believing sheer effort will overcome the gap.", moPoints: 1, note: "Grit but low Pragmatism" },
      { key: "C", text: "Reassess strategy: research NIT/BITS/State engineering colleges, recalibrate target institutions, and refocus on achievable goals — engineering remains the direction.", moPoints: 3, note: "Resilience + Pragmatism + Evidence-Based Thinking" },
      { key: "D", text: "Tell your parents you are confident and progressing well, to avoid causing them anxiety — even though you privately know the situation is difficult.", moPoints: 0, note: "low Integrity" },
    ],
  },
  {
    id: "SJT3",
    type: "sjt",
    title: "The Peer Pressure Career Choice",
    competencies: ["Assertiveness", "Evidence-Based Thinking", "Identity Clarity"],
    classFocus: "Class 11–12",
    scenario: "Rajan (Class 11, Commerce) has always been interested in economics and political economy. He wants to study at Delhi School of Economics (DSE) or JNU. His entire friend group is preparing for CA Foundation. They tell him repeatedly: 'DSE is for people who want to be professors and stay poor. CA is solid money. Why are you being different?' He is beginning to doubt himself.",
    options: [
      { key: "A", text: "Follow his friends and register for CA Foundation — going against the group feels isolating and unsupportive.", moPoints: 1, note: "low Assertiveness" },
      { key: "B", text: "Commit to DSE preparation and stop discussing his plans with friends who are negative about it.", moPoints: 2, note: "Assertive but limited evidence-gathering" },
      { key: "C", text: "Research both paths independently: contact DSE alumni via LinkedIn, understand real salary outcomes (DSE → RBI, NABARD, World Bank; CA → Big 4, CFO), then make a data-driven choice.", moPoints: 3, note: "Evidence-Based Thinking + Assertiveness + Initiative" },
      { key: "D", text: "Ask his parents to make the decision for him — they are adults and better positioned to evaluate options.", moPoints: 0, note: "low Initiative" },
    ],
  },
  {
    id: "SJT4",
    type: "sjt",
    title: "The Financial Constraint",
    competencies: ["Pragmatism", "Deferred-Gratification", "Initiative"],
    classFocus: "First-generation students",
    scenario: "Divya (19, first-generation college student, family income ₹2.2 lakh/year) has received admission to: (i) a private engineering college for CS — fees ₹1.3 lakh/year; (ii) a state government college for Civil Engineering — fees ₹22,000/year. She is more interested in CS. Her parents are uncertain about loans. A Central Sector Scholarship covers ₹10,000/year.",
    options: [
      { key: "A", text: "Take Civil Engineering at the government college — financial reality must come first, and she can always shift later.", moPoints: 2, note: "Pragmatic but passive" },
      { key: "B", text: "Reject both seats and search for scholarship-funded CS admissions, reapplying next year.", moPoints: 1, note: "Resilient but unrealistic" },
      { key: "C", text: "Take the government Civil Engineering seat and simultaneously register for free NPTEL/Coursera CS courses — building CS skills while keeping finances stable.", moPoints: 3, note: "Pragmatism + Initiative + Resilience" },
      { key: "D", text: "Take a full education loan for the CS seat independently, without fully informing her parents of the financial pressure.", moPoints: 0, note: "low Integrity + Family-Congruent conflict" },
    ],
  },
  {
    id: "SJT5",
    type: "sjt",
    title: "The Gender Expectation Crossroads",
    competencies: ["Assertiveness", "Family-Congruence", "Initiative", "Resilience"],
    classFocus: "Female students / Tier-2 & 3 city context",
    scenario: "Priya (17, Varanasi) has outstanding aptitude for Computer Science and has qualified for a national coding competition. Her parents support her but worry about her moving to Pune for a CS degree: 'Beta, it's far — girls should be close to home.' Her elder brother lives in Pune and can be her local guardian.",
    options: [
      { key: "A", text: "Accept her parents' wishes and take Commerce locally — family harmony and their peace of mind matters more.", moPoints: 1, note: "Family-Congruent but low Assertiveness" },
      { key: "B", text: "Leave for Pune immediately, against her parents' explicit concern, relying on her brother's support.", moPoints: 2, note: "Assertive but poor Family-Congruence" },
      { key: "C", text: "Involve her brother as a bridge: propose a trial semester at Pune staying with him — earning trust incrementally while pursuing CS.", moPoints: 3, note: "Assertiveness + Family-Congruence via dialogue + Initiative" },
      { key: "D", text: "Find the best CS college in her home state as a compromise while continuing to build parental trust over the next year.", moPoints: 2, note: "Pragmatic compromise" },
    ],
  },
  // 10 additional scenarios covering NEET failure, stream-career mismatch, technology vs.
  // traditional career, coaching vs. school balance, first-generation student, arts career
  // and family shame. Same MO/LO format and competency anchoring.
  {
    id: "SJT6",
    type: "sjt",
    title: "The NEET Failure",
    competencies: ["Resilience", "Pragmatism", "Emotional Regulation"],
    classFocus: "Class 12 / Drop year",
    scenario: "Aditya has attempted NEET twice. His second score is below the cutoff for any government MBBS seat, and his family cannot afford a private medical college (₹60+ lakh). He is emotionally exhausted and his parents are quietly disappointed. He still wants to work in healthcare.",
    options: [
      { key: "A", text: "Attempt NEET a third time with the same plan, refusing to consider any other field.", moPoints: 1, note: "Grit but low Pragmatism" },
      { key: "B", text: "Explore allied healthcare paths he is genuinely interested in — B.Sc Nursing, Physiotherapy, BPT, Biotechnology, Pharmacy — that use his strengths and are affordable.", moPoints: 3, note: "Resilience + Pragmatism + Evidence-Based Thinking" },
      { key: "C", text: "Abandon healthcare entirely and take any available course, convinced he has failed.", moPoints: 0, note: "low Resilience + poor Emotional Regulation" },
      { key: "D", text: "Take a private college seat by pressuring his parents into a large loan they cannot comfortably repay.", moPoints: 1, note: "low Family-Congruence" },
    ],
  },
  {
    id: "SJT7",
    type: "sjt",
    title: "The Stream-Career Mismatch",
    competencies: ["Identity Clarity", "Evidence-Based Thinking", "Initiative"],
    classFocus: "Class 11",
    scenario: "Sneha took PCM under family pressure but realises in Class 11 that she is far more drawn to psychology and human behaviour than to physics. Switching streams now would mean dropping a year and difficult conversations.",
    options: [
      { key: "A", text: "Continue with PCM and suppress her interest, since changing now is too disruptive.", moPoints: 1, note: "low Identity Clarity" },
      { key: "B", text: "Research how a PCM background can still lead to psychology (CUET, cognitive science, B.Sc Psychology) and map a realistic path before deciding.", moPoints: 3, note: "Evidence-Based Thinking + Initiative" },
      { key: "C", text: "Impulsively drop out of PCM mid-year without a concrete plan.", moPoints: 0, note: "poor planning" },
      { key: "D", text: "Wait until Class 12 results and decide everything later.", moPoints: 1, note: "low Initiative" },
    ],
  },
  {
    id: "SJT8",
    type: "sjt",
    title: "Technology vs. Traditional Career",
    competencies: ["Evidence-Based Thinking", "Pragmatism", "Family-Congruence"],
    classFocus: "Class 12",
    scenario: "Karan is fascinated by game design and AI but his family runs a respected textile business they expect him to join. Both paths are viable; he feels torn between passion and family duty.",
    options: [
      { key: "A", text: "Join the family business and abandon his interest in technology completely.", moPoints: 1, note: "Family-Congruent but low Identity Clarity" },
      { key: "B", text: "Reject the family business outright and leave to pursue game design without discussion.", moPoints: 1, note: "poor Family-Congruence" },
      { key: "C", text: "Propose using technology and AI to modernise the family textile business — bridging passion and family expectation.", moPoints: 3, note: "Evidence-Based Thinking + Family-Congruence + Initiative" },
      { key: "D", text: "Delay the decision indefinitely, hoping the conflict resolves itself.", moPoints: 0, note: "low Initiative" },
    ],
  },
  {
    id: "SJT9",
    type: "sjt",
    title: "Coaching vs. School Balance",
    competencies: ["Deferred-Gratification", "Pragmatism", "Emotional Regulation"],
    classFocus: "Class 11",
    scenario: "Meera attends heavy JEE coaching that clashes with school. Her school attendance and board preparation are slipping, but the coaching is intense. She is anxious about doing both poorly.",
    options: [
      { key: "A", text: "Skip school regularly to focus only on coaching, ignoring board requirements.", moPoints: 1, note: "short-term focus, ignores board risk" },
      { key: "B", text: "Create an integrated study plan that aligns school and coaching syllabi, and speak to teachers about managing both.", moPoints: 3, note: "Pragmatism + Initiative + Deferred-Gratification" },
      { key: "C", text: "Drop coaching entirely out of stress, without weighing the cost.", moPoints: 1, note: "poor Emotional Regulation" },
      { key: "D", text: "Continue both at full intensity and hope she does not burn out.", moPoints: 1, note: "low Pragmatism" },
    ],
  },
  {
    id: "SJT10",
    type: "sjt",
    title: "The First-Generation Student",
    competencies: ["Initiative", "Resilience", "Evidence-Based Thinking"],
    classFocus: "First-generation student",
    scenario: "Lakshmi is the first in her family to reach Class 12. No one at home can guide her on college applications, scholarships, or entrance exams. She feels lost but determined.",
    options: [
      { key: "A", text: "Apply only to the nearest college she has heard of, without exploring options.", moPoints: 1, note: "low Initiative" },
      { key: "B", text: "Seek out her school counsellor, free government portals (NSP scholarships), and alumni/mentors to understand her options fully.", moPoints: 3, note: "Initiative + Evidence-Based Thinking + Resilience" },
      { key: "C", text: "Give up on higher studies, assuming it is not for people like her.", moPoints: 0, note: "low Resilience" },
      { key: "D", text: "Wait for someone to tell her what to do.", moPoints: 1, note: "low Initiative" },
    ],
  },
  {
    id: "SJT11",
    type: "sjt",
    title: "The Arts Career and Family Shame",
    competencies: ["Assertiveness", "Family-Congruence", "Resilience"],
    classFocus: "Class 12",
    scenario: "Imran wants to pursue professional photography and visual storytelling. Relatives mock the idea at family gatherings — 'that's not a real job' — and his parents feel embarrassed. He is committed but hurt.",
    options: [
      { key: "A", text: "Abandon photography to avoid embarrassing his family at gatherings.", moPoints: 1, note: "Family-Congruent but low Assertiveness" },
      { key: "B", text: "Cut off relatives who mock him and pursue photography defiantly without engaging his parents.", moPoints: 1, note: "poor Family-Congruence" },
      { key: "C", text: "Build a small professional portfolio and freelance income to demonstrate viability, calmly sharing results with his parents over time.", moPoints: 3, note: "Initiative + Resilience + Family-Congruence via evidence" },
      { key: "D", text: "Quietly do photography on the side while telling everyone he has given it up.", moPoints: 1, note: "low Integrity" },
    ],
  },
  {
    id: "SJT12",
    type: "sjt",
    title: "The Safe Job vs. Startup",
    competencies: ["Pragmatism", "Initiative", "Evidence-Based Thinking"],
    classFocus: "Class 12 / Early college",
    scenario: "Varun has a confirmed seat for a stable B.Com → bank job track his family prefers, but he is excited by a startup idea with two friends. He cannot fully judge the risk.",
    options: [
      { key: "A", text: "Take the safe track and never test the startup idea.", moPoints: 2, note: "Pragmatic but low Initiative" },
      { key: "B", text: "Drop everything to do the startup full-time immediately.", moPoints: 1, note: "high risk, low Pragmatism" },
      { key: "C", text: "Pursue the degree while validating the startup idea part-time (small pilot, mentor feedback) before committing fully.", moPoints: 3, note: "Pragmatism + Initiative + Evidence-Based Thinking" },
      { key: "D", text: "Decide based purely on which his friends choose.", moPoints: 0, note: "low Identity Clarity" },
    ],
  },
  {
    id: "SJT13",
    type: "sjt",
    title: "The Exam Anxiety Spiral",
    competencies: ["Emotional Regulation", "Resilience", "Help-Seeking"],
    classFocus: "Class 12",
    scenario: "Two weeks before boards, Nikhil's anxiety is severe — he cannot sleep, panics during mock tests, and has stopped eating well. He is afraid to tell anyone in case they think he is weak.",
    options: [
      { key: "A", text: "Push through alone, hiding the anxiety, believing it shows weakness to ask for help.", moPoints: 1, note: "low Help-Seeking" },
      { key: "B", text: "Talk to a trusted teacher, school counsellor, or helpline (e.g., iCall) and adopt simple routines (sleep, breaks, breathing) to manage the anxiety.", moPoints: 3, note: "Emotional Regulation + Help-Seeking + Resilience" },
      { key: "C", text: "Stop studying entirely because the pressure feels unbearable.", moPoints: 0, note: "low Resilience" },
      { key: "D", text: "Rely only on more caffeine and longer hours to override the anxiety.", moPoints: 1, note: "poor Emotional Regulation" },
    ],
  },
  {
    id: "SJT14",
    type: "sjt",
    title: "The Reservation and Merit Debate",
    competencies: ["Evidence-Based Thinking", "Emotional Regulation", "Integrity"],
    classFocus: "Class 12",
    scenario: "Rohan misses a college cutoff by a small margin and feels angry, blaming reservation policy. A friend who got in through a reserved category is now distant. Rohan must decide how to respond.",
    options: [
      { key: "A", text: "Publicly blame his friend and reservation for his result, venting on social media.", moPoints: 0, note: "poor Emotional Regulation" },
      { key: "B", text: "Calmly assess the full range of his backup options and improvement areas, separating his disappointment from his friendship.", moPoints: 3, note: "Emotional Regulation + Evidence-Based Thinking + Integrity" },
      { key: "C", text: "Give up on college this year out of resentment.", moPoints: 1, note: "low Resilience" },
      { key: "D", text: "Pretend nothing happened and avoid all reflection.", moPoints: 1, note: "low Identity Clarity" },
    ],
  },
  {
    id: "SJT15",
    type: "sjt",
    title: "The Overseas Opportunity",
    competencies: ["Family-Congruence", "Pragmatism", "Initiative"],
    classFocus: "Class 12",
    scenario: "Ayesha is offered a strong undergraduate scholarship abroad, but it does not cover living costs and her parents are anxious about her being far away and the remaining expenses. She is excited but uncertain.",
    options: [
      { key: "A", text: "Decline immediately to avoid worrying her parents.", moPoints: 1, note: "Family-Congruent but low Initiative" },
      { key: "B", text: "Accept without addressing the funding gap or her parents' concerns.", moPoints: 1, note: "low Pragmatism" },
      { key: "C", text: "Research total costs, part-time work rules, and additional scholarships, then present a complete financial and safety plan to her parents.", moPoints: 3, note: "Pragmatism + Initiative + Family-Congruence" },
      { key: "D", text: "Leave the decision entirely to her parents without contributing any analysis.", moPoints: 1, note: "low Initiative" },
    ],
  },
];

/* =========================================================================
   MODULE METADATA — drives the client stepper, timers, and section summaries.
   ========================================================================= */
const MODULES = [
  { id: "marks", code: "1", name: "Academic Marks", construct: "Subject performance + trends", timeMin: 8, timed: false, format: "Score entry", weightHint: "25–30% of CCRE" },
  { id: "verbal", code: "2A", name: "Verbal Ability", construct: "Vocabulary, analogies, comprehension", timeMin: 8, timed: true, format: "MCQ" },
  { id: "numerical", code: "2B", name: "Numerical & Logical Reasoning", construct: "Arithmetic, DI, algebra, logic", timeMin: 8, timed: true, format: "MCQ" },
  { id: "spatial", code: "2C", name: "Spatial Reasoning", construct: "Mental rotation, pattern visualisation", timeMin: 6, timed: true, format: "MCQ" },
  { id: "abstract", code: "2D", name: "Logical / Abstract Reasoning", construct: "Series, syllogisms, deduction", timeMin: 6, timed: true, format: "MCQ" },
  { id: "closure", code: "2E", name: "Closure / Clerical / Mechanical", construct: "Pattern, accuracy, physics", timeMin: 7, timed: false, format: "MCQ" },
  { id: "memory", code: "2F", name: "Memory & Creativity", construct: "Working memory, divergent thinking", timeMin: 6, timed: false, format: "Mixed" },
  { id: "personality", code: "3", name: "Personality (OCEAN)", construct: "Big Five × facets", timeMin: 10, timed: false, format: "5-pt Likert" },
  { id: "interests", code: "4A", name: "Interests (RIASEC)", construct: "Holland 6 types", timeMin: 7, timed: false, format: "FC + Likert" },
  { id: "values", code: "4B", name: "Work Values + ICS", construct: "7 values + 12 context items", timeMin: 6, timed: false, format: "Likert + FC" },
  { id: "sjt", code: "5", name: "Situational Judgment", construct: "Decision-making, family dynamics", timeMin: 10, timed: false, format: "MO/LO SJT" },
];

module.exports = {
  MODULES,
  ACADEMIC_SUBJECTS,
  ACADEMIC_TERMS,
  ACADEMIC_SUPPLEMENTARY,
  VERBAL,
  NUMERICAL,
  SPATIAL,
  ABSTRACT,
  CLOSURE_CLERICAL_MECH,
  MEMORY_CREATIVITY,
  OCEAN,
  RIASEC_FC,
  RIASEC_LIKERT,
  WORK_VALUES,
  ICS,
  SJT,
  // Convenience grouping of all aptitude MCQ banks (for scoring iteration).
  APTITUDE_MCQ: {
    verbal: VERBAL,
    numerical: NUMERICAL,
    spatial: SPATIAL,
    abstract: ABSTRACT,
    closure: CLOSURE_CLERICAL_MECH,
  },
};
