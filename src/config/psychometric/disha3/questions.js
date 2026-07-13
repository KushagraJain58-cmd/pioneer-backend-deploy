/**
 * DISHA — Test 3 of 8
 * Academic Performance Analysis, Subject Strengths, Learning Styles & Study Habits.
 *
 * Target: Classes 9–12, Ages 13–18+. Duration 35–50 min (incl. marks entry).
 * CCRE contribution: 25–30% of the Master Combined Score (marks are the single
 * highest-weight input).
 *
 * Where Test 1 measures cognitive potential and Test 2 measures what a student
 * wants, Test 3 measures what the student is actually PERFORMING at and WHY —
 * grounding every recommendation in demonstrated academic reality. India's
 * career pathways are heavily marks-gated, so this test prevents the most common
 * counselling failure: aspirations unsupported by current marks.
 *
 * Section map
 *  1 — Academic Marks Input Module     intake config + subject/term marks + context
 *  2 — Subject Proficiency & Preference per entered subject: comfort + enjoyment, +12 identity Qs
 *  3 — Learning Styles & Preferences    VARK + India adaptations (24 Likert + 4 FC)
 *  4 — Study Habits, Time Mgmt & Motiv. 28 Likert (5 sub-scales, some reverse)
 *  5 — Exam Preparedness & Stress       20 Likert (ExamPrep, TestAnxiety, TestStrategy, Wellness)
 *  6 — Situational Judgment Tests       10 Indian academic scenarios (MO/LO)
 *  V — Validity scales (embedded)       social desirability + consistency
 *
 * Conventions
 *  - Likert items: { id, text, scale, reverse?, indiaSpecific? } on a 1..5 scale.
 *  - FC items: { id, prompt, optionA:{text,tags}, optionB:{text,tags} }.
 *  - SJT: { id, title, competencies, context, scenario, options:[{key,text,moPoints,note}] }.
 */

/* =========================================================================
   SECTION 1 — ACADEMIC MARKS INPUT MODULE
   The marks module is the highest-weight CCRE input. Self-reported marks with
   optional mark-sheet upload verification. Subjects + term slots are rendered
   conditionally based on class & stream.
   ========================================================================= */

// Intake / configuration fields (M-INT-01 … 07).
const MARKS_INTAKE = [
  { id: "M-INT-01", label: "Current Class", control: "dropdown", options: ["Class 8", "Class 9", "Class 10", "Class 11", "Class 12", "Passed Class 12"], use: "Controls subject fields and term slots." },
  { id: "M-INT-02", label: "School Board", control: "dropdown", options: ["CBSE", "ICSE", "IB", "State Board", "NIOS", "Other"], use: "Selects norm table for percentile calculation." },
  { id: "M-INT-03", label: "Current Stream (Class 11–12 only)", control: "dropdown", options: ["Science PCM", "Science PCB", "Science PCMB", "Commerce with Maths", "Commerce without Maths", "Humanities", "Vocational", "Not yet decided"], use: "Determines which subject fields appear for Class 11–12." },
  { id: "M-INT-04", label: "Have you appeared for Class 10 Board Exam?", control: "dropdown", options: ["Yes", "No", "Appearing this year"], use: "If Yes: board result fields unlocked (verified marks available)." },
  { id: "M-INT-05", label: "Do you attend coaching classes?", control: "dropdown", options: ["JEE coaching", "NEET coaching", "CLAT coaching", "CA Foundation coaching", "General tuition", "Multiple", "None"], use: "Contextual modifier for study habits interpretation." },
  { id: "M-INT-07", label: "Self-Declaration", control: "checkbox", text: "I confirm these marks are accurate to the best of my knowledge.", use: "Required before proceeding (data quality control)." },
];

// Term sets keyed by class group. Each subject row collects obtained/maximum per term.
const TERM_SETS = {
  "9": [
    { key: "t1", label: "Term 1 (Quarterly)" },
    { key: "t2", label: "Term 2 (Half-Yearly)" },
    { key: "t3", label: "Term 3 (Annual)" },
  ],
  "10": [
    { key: "t1", label: "Term 1 (Periodic Test)" },
    { key: "t2", label: "Term 2 (Half-Yearly)" },
    { key: "t3", label: "Term 3 (Pre-board)" },
    { key: "board", label: "Board Result" },
  ],
  "11-12": [
    { key: "unit", label: "Unit Tests (avg)" },
    { key: "mid", label: "Mid-term / HY" },
    { key: "pre1", label: "Annual / Pre-board 1" },
    { key: "pre2", label: "Pre-board 2" },
    { key: "board", label: "Board / Predicted" },
  ],
};

// Subject sets. Keyed by a selector derived from class + stream.
const SUBJECT_SETS = {
  core_9_10: [
    { key: "mathematics", label: "Mathematics (Std / Basic)" },
    { key: "english", label: "English (Core / Elective)" },
    { key: "science", label: "Science (Class 9–10 combined)" },
    { key: "socialScience", label: "Social Science" },
    { key: "hindi", label: "Hindi / Second Language" },
    { key: "thirdLanguage", label: "Sanskrit / Third Language" },
    { key: "computerScience", label: "Computer Science / IT" },
    { key: "physicalEducation", label: "Physical Education (if graded)" },
    { key: "optional", label: "Optional / Additional Subject" },
  ],
  pcm: [
    { key: "physics", label: "Physics (Theory + Practical)" },
    { key: "chemistry", label: "Chemistry (Theory + Practical)" },
    { key: "mathematics", label: "Mathematics" },
    { key: "english", label: "English (Core)" },
    { key: "fifthSubject", label: "5th Subject (CS / PE / Economics)" },
  ],
  pcb: [
    { key: "physics", label: "Physics (Theory + Practical)" },
    { key: "chemistry", label: "Chemistry (Theory + Practical)" },
    { key: "biology", label: "Biology (Theory + Practical)" },
    { key: "english", label: "English (Core)" },
    { key: "fifthSubject", label: "5th Subject (Maths / CS / PE)" },
  ],
  pcmb: [
    { key: "physics", label: "Physics (Theory + Practical)" },
    { key: "chemistry", label: "Chemistry (Theory + Practical)" },
    { key: "mathematics", label: "Mathematics" },
    { key: "biology", label: "Biology (Theory + Practical)" },
    { key: "english", label: "English (Core)" },
  ],
  commerce_maths: [
    { key: "accountancy", label: "Accountancy" },
    { key: "businessStudies", label: "Business Studies" },
    { key: "economics", label: "Economics" },
    { key: "mathematics", label: "Mathematics" },
    { key: "english", label: "English (Core)" },
    { key: "fifthSubject", label: "5th Subject (Informatics / PE / IP)" },
  ],
  commerce_nomaths: [
    { key: "accountancy", label: "Accountancy" },
    { key: "businessStudies", label: "Business Studies" },
    { key: "economics", label: "Economics" },
    { key: "english", label: "English (Core)" },
    { key: "fifthSubject", label: "5th Subject (Informatics / PE / IP)" },
  ],
  humanities: [
    { key: "history", label: "History" },
    { key: "polsci", label: "Political Science / Civics" },
    { key: "geography", label: "Geography" },
    { key: "economics", label: "Economics" },
    { key: "psychology", label: "Psychology / Sociology (if applicable)" },
    { key: "english", label: "English (Core / Elective)" },
  ],
  vocational: [
    { key: "vocationalSubject", label: "Vocational / Skill Subject" },
    { key: "english", label: "English (Core)" },
    { key: "mathematics", label: "Mathematics (if applicable)" },
    { key: "optional", label: "Other Subject" },
  ],
};

// Maps a class + stream selection to a subject-set key + term-set key.
// Used by the client to render the correct marks grid.
const SUBJECT_SET_RULES = {
  note:
    "For Class 9–10 use core_9_10 with term set for the class. For Class 11–12 use the stream key (pcm/pcb/pcmb/commerce_maths/commerce_nomaths/humanities/vocational) with the 11-12 term set.",
  streamToSet: {
    "Science PCM": "pcm",
    "Science PCB": "pcb",
    "Science PCMB": "pcmb",
    "Commerce with Maths": "commerce_maths",
    "Commerce without Maths": "commerce_nomaths",
    Humanities: "humanities",
    Vocational: "vocational",
  },
};

// Supplementary academic context (M-SUP-01 … 08).
const MARKS_SUPPLEMENTARY = [
  { id: "M-SUP-01", text: "Are you taking any remedial or extra coaching for any subjects?", control: "yesno_text", use: "Support-seeking flag; contextual modifier on trend." },
  { id: "M-SUP-02", text: "In which subject do you feel most confident? (Not necessarily your highest marks — genuine confidence.)", control: "subject_dropdown", use: "Self-efficacy anchor, cross-validated with marks." },
  { id: "M-SUP-03", text: "Which subject do you find hardest, regardless of marks?", control: "subject_dropdown", use: "Subject difficulty perception (impostor syndrome vs genuine struggle)." },
  { id: "M-SUP-04", text: "Has your performance in any subject significantly improved in the last 6 months? If yes, which subject and why?", control: "yesno_text", use: "Positive trend confirmation; improvement attribution." },
  { id: "M-SUP-05", text: "Has your performance in any subject significantly declined in the last 6 months? If yes, which subject and why?", control: "yesno_text", use: "Negative trend flag; decline attribution for counsellor." },
  { id: "M-SUP-06", text: "How many hours per day do you study on average (school days)?", control: "numeric", min: 0, max: 8, step: 0.5, use: "Study intensity input." },
  { id: "M-SUP-07", text: "How many hours per day do you study during exam preparation periods?", control: "numeric", min: 0, max: 12, step: 0.5, use: "Peak-period study intensity." },
  { id: "M-SUP-08", text: "Do you have access to the internet and a smartphone or laptop for studying?", control: "dropdown", options: ["Full access", "Smartphone only", "Limited access", "No digital access"], use: "Digital literacy modifier for study plan." },
];

/* =========================================================================
   SECTION 2 — SUBJECT PROFICIENCY & PREFERENCE SELF-ASSESSMENT
   For every subject entered in Section 1, the student gives a Comfort/Proficiency
   self-rating (1..5) and an Enjoyment/Interest rating (1..5). Cross-validated with
   actual SSI to flag overconfidence / impostor syndrome / hidden interest.
   Plus 12 open-format Subject Identity questions.
   ========================================================================= */
const PROFICIENCY_SCALE = {
  comfort: { label: "Comfort / Proficiency", anchorsLow: "Very Low", anchorsHigh: "Very High" },
  enjoyment: { label: "Enjoyment / Interest", anchorsLow: "Very Low", anchorsHigh: "Very High" },
};

const SUBJECT_IDENTITY = [
  { id: "SP-01", text: "Which subject would you study for fun, with no exam attached?", control: "subject_dropdown", use: "Intrinsic interest anchor — most authentic interest signal." },
  { id: "SP-02", text: "Which subject do you think you are genuinely talented at — beyond just marks?", control: "subject_dropdown_text", use: "Talent identity — cross-validated with T1 aptitude." },
  { id: "SP-03", text: "Which subject do you feel your teachers have never taught well enough?", control: "subject_dropdown_text", use: "Attribution of low marks — teaching quality vs student effort." },
  { id: "SP-04", text: "If you could take one extra subject not offered in your school, what would it be?", control: "text", use: "Undiscovered interests — analysed qualitatively." },
  { id: "SP-05", text: "In which subject do you feel most 'in the zone' — time flies when you are studying it?", control: "subject_dropdown", use: "Flow-state identification — strongest interest signal." },
  { id: "SP-06", text: "Which subject do you feel your marks do NOT reflect your actual ability?", control: "subject_dropdown_direction", directions: ["My marks are lower than my ability", "My marks are higher than my ability"], use: "Impostor syndrome vs overconfidence detection." },
  { id: "SP-07", text: "Which subject do you think is most important for your future career?", control: "subject_dropdown_text", use: "Career–subject linkage as perceived by student." },
  { id: "SP-08", text: "If you had to teach one subject to a group of students for a year, which would you choose?", control: "subject_dropdown", use: "Teaching interest = deep mastery interest." },
  { id: "SP-09", text: "Which subject gives you the most anxiety before exams?", control: "subject_dropdown_text", use: "Exam-anxiety subject flag — feeds Section 5." },
  { id: "SP-10", text: "Which subject do your parents most want you to excel in?", control: "subject_dropdown", use: "Parental pressure mapping — counsellor context." },
  { id: "SP-11", text: "Is there a subject in which you feel you have significantly declined recently? If yes, briefly explain what changed.", control: "yesno_subject_text", use: "Decline narrative — counsellor insight." },
  { id: "SP-12", text: "Is there a subject in which you feel you have significantly improved recently? What do you think caused it?", control: "yesno_subject_text", use: "Improvement attribution — growth-mindset signal." },
];

/* =========================================================================
   SECTION 3 — LEARNING STYLES & PREFERENCES (24 Likert + 4 FC)
   VARK (Visual / Auditory / ReadWrite / Kinesthetic) + India adaptations
   (Group study, Rote memorisation, Coaching dependence, Exploratory learning).
   NOT scored for CCRE career matching — used to personalise the study plan and
   flag rote / coaching dependence that may struggle in conceptual entrance exams.
   ========================================================================= */
const LEARNING_STYLES = [
  { id: "LS1", scale: "Visual", text: "I understand topics much better when I see them drawn as diagrams, flowcharts, or mind maps.", indiaSpecific: false },
  { id: "LS2", scale: "Visual", text: "When I study, I often draw tables, timelines, or visual summaries in my notebook.", indiaSpecific: false },
  { id: "LS3", scale: "Visual", text: "Watching an educational YouTube video on a topic helps me understand it better than reading the textbook.", indiaSpecific: true },
  { id: "LS4", scale: "Visual", text: "I remember information better when I colour-code my notes or use highlighting systematically.", indiaSpecific: false },
  { id: "LS5", scale: "Auditory", text: "I find that listening to a teacher explain something once is more effective for me than reading it multiple times.", indiaSpecific: false },
  { id: "LS6", scale: "Auditory", text: "I study better when I read my notes aloud or explain concepts to myself out loud.", indiaSpecific: false },
  { id: "LS7", scale: "Auditory", text: "Attending coaching class lectures helps me understand concepts better than self-studying from books.", indiaSpecific: true },
  { id: "LS8", scale: "Auditory", text: "I often hum or talk to myself when I am trying to memorise something.", indiaSpecific: false },
  { id: "LS9", scale: "ReadWrite", text: "I understand topics best by reading the NCERT textbook or reference book carefully and taking detailed written notes.", indiaSpecific: true },
  { id: "LS10", scale: "ReadWrite", text: "Writing practice papers and rewriting key points in my own words is how I learn most effectively.", indiaSpecific: false },
  { id: "LS11", scale: "ReadWrite", text: "I prefer written instructions and textbook explanations over verbal explanations or videos.", indiaSpecific: false },
  { id: "LS12", scale: "ReadWrite", text: "I retain information better when I write summaries from memory after reading, rather than re-reading.", indiaSpecific: false },
  { id: "LS13", scale: "Kinesthetic", text: "I learn science concepts best through lab experiments and practical work, not just theory.", indiaSpecific: false },
  { id: "LS14", scale: "Kinesthetic", text: "I understand Mathematics best by solving many practice problems myself, not by watching someone solve them.", indiaSpecific: false },
  { id: "LS15", scale: "Kinesthetic", text: "I learn history or civics better when I visit historical sites, museums, or participate in debates.", indiaSpecific: true },
  { id: "LS16", scale: "Kinesthetic", text: "I find that group discussions or peer teaching help me understand topics better than studying alone.", indiaSpecific: true },
  { id: "LS17", scale: "Group", text: "I study better with a study group than alone — explaining concepts to friends deepens my understanding.", indiaSpecific: true },
  { id: "LS18", scale: "Group", text: "During exam season, group revision sessions with classmates are one of my most effective study strategies.", indiaSpecific: true },
  { id: "LS19", scale: "Rote", text: "I often memorise answers, definitions, or solved examples to reproduce in exams, even if I haven't fully understood the concept.", indiaSpecific: true },
  { id: "LS20", scale: "Rote", text: "I focus primarily on what has come in previous board exam papers when deciding what to study.", indiaSpecific: true },
  { id: "LS21", scale: "CoachDep", text: "I find it very difficult to study effectively without the structure provided by a coaching class or tuition.", indiaSpecific: true },
  { id: "LS22", scale: "CoachDep", text: "I believe I would score significantly lower in exams if I didn't attend coaching or tuition.", indiaSpecific: true },
  { id: "LS23", scale: "Exploratory", text: "I often study topics beyond the syllabus because I find them genuinely interesting.", indiaSpecific: false },
  { id: "LS24", scale: "Exploratory", text: "When I don't understand something, I look for multiple explanations (different books, YouTube, asking teachers) rather than just memorising.", indiaSpecific: false },
];

const LEARNING_STYLE_FC = [
  {
    id: "LSFC1",
    prompt: "You have 3 days to prepare a difficult Chemistry chapter (Organic Mechanisms). Which approach would work best for you?",
    optionA: { text: "Watch 5–6 YouTube videos (Vedantu, PhysicsWallah, Khan Academy India) and make a visual flowchart of reaction mechanisms.", tags: ["Visual", "Auditory"] },
    optionB: { text: "Read NCERT + HC Verma carefully, write detailed notes in your own words, and solve all practice questions at the end.", tags: ["ReadWrite"] },
  },
  {
    id: "LSFC2",
    prompt: "You are struggling with a Trigonometry chapter. You have two evenings free. Which would you choose?",
    optionA: { text: "Go to your coaching class for a doubt-clearing session with your maths teacher.", tags: ["CoachDep", "Auditory"] },
    optionB: { text: "Sit alone with your textbook and work through 20 practice problems from scratch, making your own notes.", tags: ["Kinesthetic", "ReadWrite"] },
  },
  {
    id: "LSFC3",
    prompt: "Your Economics exam is in 1 week. Which study approach matches how you actually work best?",
    optionA: { text: "Form a study group with 3–4 friends — each person teaches one chapter to the others, discuss PYQs together.", tags: ["Group"] },
    optionB: { text: "Study alone systematically: NCERT chapter by chapter, write 1-page summaries, then practise previous-year questions solo.", tags: ["ReadWrite"] },
  },
  {
    id: "LSFC4",
    prompt: "You have 2 hours to learn a completely new topic (Genetics) for the first time. Which approach would you naturally choose?",
    optionA: { text: "Watch a 30-min video lecture + look at detailed diagrams, then attempt MCQs to test yourself.", tags: ["Visual"] },
    optionB: { text: "Read the textbook chapter completely first, mark key terms, write a summary table, then do end-of-chapter questions.", tags: ["ReadWrite"] },
  },
];

/* =========================================================================
   SECTION 4 — STUDY HABITS, TIME MANAGEMENT & ACADEMIC MOTIVATION (28 items)
   5 sub-scales: Consistency, Planning, Focus, Resilience, Academic Motivation
   (Intrinsic / Extrinsic / Amotivation), plus a CoachDep item. Reverse items
   marked reverse:true. Amotivation avg > 3.5 triggers a wellbeing flag.
   ========================================================================= */
const STUDY_HABITS = [
  { id: "SH1", scale: "Consistency", text: "I study every day — even when there is no test or assignment due the next day.", indiaSpecific: false },
  { id: "SH2", scale: "Consistency", text: "I maintain a fixed study timetable and follow it consistently throughout the week.", indiaSpecific: false },
  { id: "SH3", scale: "Consistency", reverse: true, text: "I study only when exams are approaching — otherwise I tend to skip or delay.", indiaSpecific: false },
  { id: "SH4", scale: "Consistency", text: "During festivals or family events (Diwali, Eid, Holi, weddings), I manage to study at least 1 hour daily.", indiaSpecific: true },
  { id: "SH5", scale: "Planning", text: "Before beginning to study, I make a list of topics to cover and stick to it.", indiaSpecific: false },
  { id: "SH6", scale: "Planning", text: "I break large chapters into smaller parts and set mini-deadlines for myself.", indiaSpecific: false },
  { id: "SH7", scale: "Planning", reverse: true, text: "I often realise I have run out of time to revise all topics before an exam.", indiaSpecific: false },
  { id: "SH8", scale: "Planning", text: "I use a planner, timetable, or study app to organise my academic schedule.", indiaSpecific: false },
  { id: "SH9", scale: "Planning", text: "I leave a buffer day before each exam for final revision — I do not study new material on exam day.", indiaSpecific: true },
  { id: "SH10", scale: "Focus", text: "I can study for 60–90 minutes at a stretch without checking my phone or getting distracted.", indiaSpecific: false },
  { id: "SH11", scale: "Focus", reverse: true, text: "I find it difficult to study at home because of noise, family activity, or phone distractions.", indiaSpecific: true },
  { id: "SH12", scale: "Focus", text: "I use techniques like Pomodoro (25 min study, 5 min break) or similar to maintain focus.", indiaSpecific: false },
  { id: "SH13", scale: "Focus", reverse: true, text: "When I sit down to study, I often end up studying something different from what I planned.", indiaSpecific: false },
  { id: "SH14", scale: "Resilience", text: "When I get a bad mark in a test, I analyse my mistakes and study those topics again within 2 days.", indiaSpecific: false },
  { id: "SH15", scale: "Resilience", reverse: true, text: "A single bad test result can demotivate me for several days.", indiaSpecific: false },
  { id: "SH16", scale: "Resilience", text: "I ask my teacher for help when I do not understand a topic — I don't let it carry forward unresolved.", indiaSpecific: false },
  { id: "SH17", scale: "Resilience", text: "I bounce back quickly from academic setbacks — one bad exam does not affect my next one.", indiaSpecific: false },
  { id: "SH18", scale: "Resilience", reverse: true, text: "I have given up on a subject at some point because I felt it was impossible to improve.", indiaSpecific: true },
  { id: "SH19", scale: "AcadMot_I", text: "I study topics beyond the syllabus because I find them genuinely fascinating.", indiaSpecific: false },
  { id: "SH20", scale: "AcadMot_I", text: "The subjects I work hardest in are the ones I personally find interesting — not necessarily the ones most important for exams.", indiaSpecific: false },
  { id: "SH21", scale: "AcadMot_I", text: "I feel a genuine sense of satisfaction when I truly understand a difficult concept — independent of marks.", indiaSpecific: false },
  { id: "SH22", scale: "AcadMot_E", text: "My primary motivation for studying hard is to get good marks, get into a good college, and make my parents proud.", indiaSpecific: true },
  { id: "SH23", scale: "AcadMot_E", text: "I study hardest in subjects where my performance directly affects my parents' or teachers' opinion of me.", indiaSpecific: true },
  { id: "SH24", scale: "AcadMot_E", text: "If there were no entrance exams or board exams, I would study significantly less.", indiaSpecific: false },
  { id: "SH25", scale: "Amotivation", text: "Honestly, I am not sure why I am studying what I am studying — it sometimes feels pointless.", indiaSpecific: true },
  { id: "SH26", scale: "Amotivation", text: "I often feel exhausted and overwhelmed by the amount I am expected to study.", indiaSpecific: true },
  { id: "SH27", scale: "Amotivation", text: "I feel like no matter how hard I study, my marks don't improve — what's the point?", indiaSpecific: true },
  { id: "SH28", scale: "CoachDep", text: "I rely on my coaching institute for motivation and structure — without it, I would not study as effectively.", indiaSpecific: true },
];

/* =========================================================================
   SECTION 5 — EXAM PREPAREDNESS, STRESS HANDLING & TEST-TAKING (20 items)
   Sub-scales: ExamPrep (quality), TestAnxiety (index — higher = more anxiety),
   TestStrategy (skills), Wellness. India-specific exam context throughout.
   ========================================================================= */
const EXAM_PREP = [
  { id: "EP1", scale: "ExamPrep", text: "I complete at least 5 previous years' question papers (PYQs) for each major subject before the board exam.", indiaSpecific: true },
  { id: "EP2", scale: "ExamPrep", text: "I attempt full-length mock tests under timed exam conditions (not just chapter-wise tests).", indiaSpecific: false },
  { id: "EP3", scale: "ExamPrep", text: "I review my mistakes in mock tests systematically — I keep an error log.", indiaSpecific: false },
  { id: "EP4", scale: "ExamPrep", text: "I revise every major topic at least twice before the final exam.", indiaSpecific: false },
  { id: "EP5", scale: "ExamPrep", text: "I focus my exam preparation on understanding mark distribution and question patterns, not just content.", indiaSpecific: true },
  { id: "EP6", scale: "TestAnxiety", text: "I feel very anxious the night before a major exam — I struggle to sleep.", indiaSpecific: true },
  { id: "EP7", scale: "TestAnxiety", text: "During exams, I sometimes blank out on answers I knew the day before.", indiaSpecific: false },
  { id: "EP8", scale: "TestAnxiety", text: "I feel significantly more anxious about competitive entrance exams (JEE/NEET/CLAT) than about school tests.", indiaSpecific: true },
  { id: "EP9", scale: "TestAnxiety", text: "My exam performance is often lower than what I expected based on my preparation.", indiaSpecific: false },
  { id: "EP10", scale: "TestAnxiety", text: "I have avoided attempting a subject exam or competitive exam because I was afraid of failing.", indiaSpecific: true },
  { id: "EP11", scale: "TestAnxiety", text: "Physical symptoms (stomach ache, headache, rapid heartbeat) before important exams affect my performance.", indiaSpecific: false },
  { id: "EP12", scale: "TestStrategy", text: "During exams, I always read all questions first and plan which to attempt in what order.", indiaSpecific: false },
  { id: "EP13", scale: "TestStrategy", text: "I manage my time well during exams — I rarely run out of time before finishing.", indiaSpecific: false },
  { id: "EP14", scale: "TestStrategy", text: "I know when to move on from a difficult question rather than spending too much time on it.", indiaSpecific: false },
  { id: "EP15", scale: "TestStrategy", text: "In objective/MCQ exams, I have a clear strategy for handling questions I am unsure about (educated guess vs skip).", indiaSpecific: true },
  { id: "EP16", scale: "TestStrategy", text: "I check my answers in the last 10 minutes rather than submitting immediately when finished.", indiaSpecific: false },
  { id: "EP17", scale: "Wellness", text: "I maintain my sleep and diet routine during exam periods — I don't sacrifice sleep for last-minute cramming.", indiaSpecific: true },
  { id: "EP18", scale: "Wellness", text: "I take breaks between study sessions during exam preparation — I don't study 8+ hours without a break.", indiaSpecific: false },
  { id: "EP19", scale: "Wellness", text: "I have healthy ways to manage exam stress (exercise, talking to family, prayer, music).", indiaSpecific: true },
  { id: "EP20", scale: "Wellness", text: "After a difficult exam, I can let it go and focus on the next one — I don't dwell on mistakes for days.", indiaSpecific: false },
];

/* =========================================================================
   SECTION 6 — SITUATIONAL JUDGMENT TESTS (10 Indian academic scenarios)
   MO/LO format. Each option anchored to competencies: Academic Resilience,
   Strategic Thinking, Intellectual Honesty, Help-Seeking, Self-Advocacy,
   Pragmatism, Growth Mindset. moPoints 0–3.
   ========================================================================= */
const SJT_T3 = [
  {
    id: "SJT_T3_1",
    title: "The Pre-Board Disaster",
    competencies: ["Academic Resilience", "Growth Mindset", "Help-Seeking"],
    context: "Class 12, 2 months before board exams",
    scenario:
      "Vikram has just received his Chemistry pre-board results: 44/100. His overall is 71%. He has always planned to do B.Tech through JEE. The school principal calls his parents to discuss his performance. Vikram knows Chemistry is his weakest subject — he has been avoiding it and focusing on Physics and Maths.",
    options: [
      { key: "A", text: "Tell his parents the exam was very difficult and everyone did poorly — minimise the significance of the result.", moPoints: 0, note: "Poor Intellectual Honesty + Avoidance" },
      { key: "B", text: "Accept the result as a realistic picture of his Chemistry preparation and immediately create a focused 6-week Chemistry revision plan targeting his specific weak chapters.", moPoints: 3, note: "Academic Resilience + Growth Mindset + Strategic Planning" },
      { key: "C", text: "Request a doubt-clearing session with his Chemistry teacher this week and sign up for extra Chemistry coaching immediately.", moPoints: 2, note: "Help-Seeking + Proactive" },
      { key: "D", text: "Reconsider the JEE goal and explore engineering colleges accessible through CUET or State CETs that don't require Chemistry at 75%+.", moPoints: 2, note: "Pragmatic — valid if time is very short" },
    ],
  },
  {
    id: "SJT_T3_2",
    title: "The Coaching vs Self-Study Dilemma",
    competencies: ["Strategic Thinking", "Self-Awareness", "Autonomy"],
    context: "Class 11, beginning of the year",
    scenario:
      "Riya is in Class 11 (PCB, NEET target). Her parents have enrolled her in an expensive NEET coaching institute (₹1.5 lakh/year). After 3 months, she realises she learns better from NCERT + YouTube (Unacademy, PhysicsWallah) alone — the coaching pace is either too fast or too slow, and she feels the batch environment is stressful. But her parents have invested significantly and expect her to attend.",
    options: [
      { key: "A", text: "Continue attending coaching dutifully — her parents have invested significantly and she should honour that.", moPoints: 1, note: "Family-congruent but passive" },
      { key: "B", text: "Tell her parents honestly that the coaching format isn't working for her, show them her self-study results, and propose a trial month of self-directed study to compare outcomes.", moPoints: 3, note: "Self-Advocacy + Intellectual Honesty + Evidence-based" },
      { key: "C", text: "Reduce coaching attendance secretly and spend that time on self-study — her parents don't need to know.", moPoints: 0, note: "Low Integrity + avoidance" },
      { key: "D", text: "Ask to switch to a different NEET coaching batch or institute that better matches her learning pace, and have this conversation with her parents.", moPoints: 2, note: "Constructive compromise" },
    ],
  },
  {
    id: "SJT_T3_3",
    title: "The Subject Regret",
    competencies: ["Self-Awareness", "Pragmatism", "Adaptability"],
    context: "Class 11, mid-year",
    scenario:
      "Aryan took Commerce (with Maths) in Class 11 because his parents wanted him to do CA. But 8 months in, he realises he finds Economics very interesting — much more than Accountancy — and wants to study Economics at Delhi University or JNU. He is performing well in Economics (82%) but poorly in Accountancy (54%). He needs both for 12th Boards.",
    options: [
      { key: "A", text: "Push through both subjects and focus on improving Accountancy — he committed to Commerce and should finish what he started.", moPoints: 1, note: "Low Self-Awareness" },
      { key: "B", text: "Shift his focus: strengthen Economics as the pathway subject for DSE/JNU, while doing the minimum necessary in Accountancy to pass Class 12.", moPoints: 2, note: "Pragmatic middle ground — valid for risk-averse profile" },
      { key: "C", text: "Have a frank conversation with his parents and counsellor about shifting his academic target from CA to BA Economics, and create a revised plan accordingly.", moPoints: 3, note: "Self-Awareness + Courage + Long-term Pragmatism" },
      { key: "D", text: "Request a mid-year stream change to Humanities — the late switch is risky but he feels strongly about it.", moPoints: 1, note: "Highest risk — only valid if time and school policies permit" },
    ],
  },
  {
    id: "SJT_T3_4",
    title: "The Declining Marks Mystery",
    competencies: ["Help-Seeking", "Growth Mindset", "Intellectual Honesty"],
    context: "Class 10, mid-year",
    scenario:
      "Anjali was consistently scoring 85%+ in Mathematics until Class 9. In Class 10, her marks have dropped to 68% in two consecutive tests. She doesn't understand why — she feels she is studying as much as before. Her teacher has not commented. Her parents are getting concerned.",
    options: [
      { key: "A", text: "Assume the Class 10 syllabus is just harder and hope marks improve when she studies more before the annual exam.", moPoints: 1, note: "Passive avoidance" },
      { key: "B", text: "Proactively ask her Maths teacher after class: 'I've noticed my marks dropping. Can you help me understand what I'm doing differently or missing?'", moPoints: 3, note: "Help-Seeking + Proactive + Intellectual Honesty" },
      { key: "C", text: "Attempt 3 full chapter practice tests from the chapters she scored poorly in, carefully analyse every mistake, and identify specific concept gaps.", moPoints: 3, note: "Diagnostic thinking + Growth Mindset" },
      { key: "D", text: "Join a Maths tuition class — extra support will definitely help reverse the decline.", moPoints: 1, note: "May help but doesn't address root cause — reactive rather than diagnostic" },
    ],
  },
  {
    id: "SJT_T3_5",
    title: "The Night Before the Big Exam",
    competencies: ["Exam Strategy", "Wellness", "Self-Regulation"],
    context: "Class 12 board exam or JEE Mock — night before",
    scenario:
      "It is 10 PM, the night before Meena's Chemistry board exam. She has prepared well but feels there are 2 chapters she hasn't revised properly — Coordination Compounds and Biomolecules. Both are typically 10–12 marks in the board exam. She is tempted to stay up until 2 AM to revise them, but she knows she functions poorly on less than 7 hours of sleep.",
    options: [
      { key: "A", text: "Stay up until 2 AM to revise both chapters — the extra revision is worth the sleep loss.", moPoints: 0, note: "Worst option for most — sleep deprivation significantly impairs recall" },
      { key: "B", text: "Sleep by 11:30 PM — her overall preparation is good and she should trust it; sleep deprivation is a bigger risk than 2 unrevised chapters.", moPoints: 2, note: "Valid for a well-prepared student who recognises sleep importance" },
      { key: "C", text: "Spend 45 minutes on rapid review of the most important topics from those 2 chapters using summary notes, then sleep by 11 PM.", moPoints: 3, note: "Strategic Thinking + Wellness balance" },
      { key: "D", text: "Message her study group for a quick last-minute revision call — group revision is more effective than solo cramming.", moPoints: 1, note: "Risky — group calls often extend beyond planned time" },
    ],
  },
  {
    id: "SJT_T3_6",
    title: "The Coaching Town Pressure",
    competencies: ["Academic Resilience", "Wellness", "Help-Seeking"],
    context: "Class 11–12, hostel in a coaching town (Kota / Patna)",
    scenario:
      "Sahil has moved to Kota for JEE coaching and lives in a hostel away from family. He feels isolated, the competition among peers is intense, and a recent test rank has shaken his confidence. He has started skipping meals and calling home less to 'avoid worrying them'.",
    options: [
      { key: "A", text: "Push harder and study more hours to climb the rank list — that will fix how he feels.", moPoints: 1, note: "Ignores wellbeing; risks burnout" },
      { key: "B", text: "Reach out — call family honestly, talk to the hostel counsellor or a trusted mentor, and build a small support routine (regular meals, a friend, short breaks).", moPoints: 3, note: "Help-Seeking + Wellness + Resilience" },
      { key: "C", text: "Decide coaching-town life isn't for him and demand to return home immediately without discussing alternatives.", moPoints: 1, note: "Avoidant; forecloses options without reflection" },
      { key: "D", text: "Keep his struggles private but quietly fix his routine — sleep, meals, and a weekly call home.", moPoints: 2, note: "Self-regulation, though support-seeking would help more" },
    ],
  },
  {
    id: "SJT_T3_7",
    title: "The NEET Repeat Dilemma",
    competencies: ["Pragmatism", "Academic Resilience", "Self-Awareness"],
    context: "Post-Class 12 / drop year decision",
    scenario:
      "Pooja missed the NEET government-college cutoff by a small margin in her first attempt. She can take a drop year to reattempt, accept a seat in a related field (BSc Nursing, Biotechnology, Pharmacy), or take a private MBBS seat her family cannot comfortably afford. She still loves medicine.",
    options: [
      { key: "A", text: "Take a drop year and reattempt NEET with the same preparation strategy as before.", moPoints: 1, note: "Grit, but ignores what needs to change" },
      { key: "B", text: "Take a drop year only after honestly analysing what went wrong and building a specific improvement plan with measurable targets.", moPoints: 3, note: "Resilience + Self-Awareness + Strategic Planning" },
      { key: "C", text: "Explore allied healthcare paths she genuinely likes (BSc Nursing, BPT, Biotechnology) that are affordable and use her strengths.", moPoints: 3, note: "Pragmatism + keeps healthcare direction" },
      { key: "D", text: "Pressure her family into a large loan for a private MBBS seat they cannot comfortably repay.", moPoints: 0, note: "Ignores family financial reality" },
    ],
  },
  {
    id: "SJT_T3_8",
    title: "The Vocational Interest vs Family Science Expectation",
    competencies: ["Self-Advocacy", "Self-Awareness", "Evidence-Based Thinking"],
    context: "Class 10, stream-choice point",
    scenario:
      "Karthik is strong in practical, hands-on subjects and is genuinely excited by a vocational track (e.g., automobile technology / IT / design) offered after Class 10. His family assumes he will take Science PCM 'like everyone serious about a future'. His Science marks are average; his project and practical work are outstanding.",
    options: [
      { key: "A", text: "Take Science PCM as expected and set aside his interest in vocational and practical fields.", moPoints: 1, note: "Suppresses a genuine, evidenced strength" },
      { key: "B", text: "Research real outcomes of the vocational pathway (skill-sector growth, diploma-to-degree routes, salaries) and present an evidence-based case to his family.", moPoints: 3, note: "Self-Advocacy + Evidence-Based Thinking" },
      { key: "C", text: "Refuse Science outright and enrol in the vocational track without discussing it with family.", moPoints: 1, note: "Poor family-congruence; skips dialogue" },
      { key: "D", text: "Take Science for now but keep building practical skills and projects, revisiting the choice in Class 11 with evidence of where he excels.", moPoints: 2, note: "Pragmatic, keeps options open" },
    ],
  },
  {
    id: "SJT_T3_9",
    title: "Managing Multiple Exams at Once",
    competencies: ["Strategic Thinking", "Planning", "Self-Regulation"],
    context: "Class 12, board + entrance season",
    scenario:
      "Neha is preparing for board exams, JEE Mains, and a CUET attempt — all within a few months. The syllabi overlap partly but the question styles differ. She feels scattered, switching between them daily without a clear plan, and her mock scores are stagnant.",
    options: [
      { key: "A", text: "Study whichever exam feels most urgent each day and hope it balances out over time.", moPoints: 1, note: "Reactive; no integrated plan" },
      { key: "B", text: "Build one integrated timetable mapping shared topics, with dedicated slots for each exam's distinct question style, and weekly review checkpoints.", moPoints: 3, note: "Strategic Thinking + Planning" },
      { key: "C", text: "Drop CUET preparation entirely to focus only on boards and JEE, after weighing which outcomes matter most to her.", moPoints: 2, note: "Pragmatic prioritisation if deliberate" },
      { key: "D", text: "Increase total study hours dramatically, cutting sleep, to cover everything.", moPoints: 0, note: "Unsustainable; harms performance" },
    ],
  },
  {
    id: "SJT_T3_10",
    title: "Board Marks vs Entrance Performance Discrepancy",
    competencies: ["Self-Awareness", "Strategic Thinking", "Intellectual Honesty"],
    context: "Class 12 / drop year",
    scenario:
      "Rohan scores very high in board exams (92%) through thorough, well-organised preparation, but his JEE/NEET mock scores are mediocre. He realises board success rewards completeness and presentation, while entrance exams reward speed and conceptual problem-solving — two different skills.",
    options: [
      { key: "A", text: "Assume his strong board marks mean he is well prepared for entrance exams too, and keep studying the same way.", moPoints: 1, note: "Conflates two different skill sets" },
      { key: "B", text: "Honestly diagnose the gap and shift entrance-prep toward timed problem-solving, concept application, and previous-year analysis — distinct from board prep.", moPoints: 3, note: "Self-Awareness + Strategic adaptation + Intellectual Honesty" },
      { key: "C", text: "Decide entrance exams 'aren't for him' and focus only on board-based admission routes (CUET, state colleges) after weighing his real options.", moPoints: 2, note: "Pragmatic if a deliberate, informed choice" },
      { key: "D", text: "Blame the mock tests for being unrealistically hard and ignore the signal.", moPoints: 0, note: "Denial; ignores diagnostic feedback" },
    ],
  },
];

/* =========================================================================
   VALIDITY SCALES (8 embedded items)
   Social-desirability (agree-keyed) + consistency pairs. Used to flag idealised
   self-presentation; reported to the counsellor only.
   ========================================================================= */
const VALIDITY = [
  { id: "V1", validity: "SD", agreeKeyed: true, text: "I have never once skipped studying when I had planned to." },
  { id: "V2", validity: "SD", agreeKeyed: true, text: "I have never felt even slightly jealous of a classmate's marks." },
  { id: "V3", validity: "SD", agreeKeyed: true, text: "I always understand every topic the first time it is taught." },
  { id: "V4", validity: "SD", agreeKeyed: true, text: "I have never made a careless mistake in an exam." },
  // consistency pair A — should align with high Consistency / Planning
  { id: "V5", validity: "CONS_A", text: "I almost always follow my study plan exactly as I set it." },
  { id: "V6", validity: "CONS_B", reverse: true, text: "My study routine is unpredictable and changes a lot from week to week." },
  // consistency pair B — should align with low Amotivation
  { id: "V7", validity: "CONS_C", text: "I generally feel clear and purposeful about why I am studying." },
  { id: "V8", validity: "CONS_D", reverse: true, text: "I frequently feel that my studying is pointless and directionless." },
];

/* =========================================================================
   SECTION METADATA — drives the client stepper and section summaries.
   ========================================================================= */
const SECTIONS = [
  { id: "marks", code: "1", name: "Academic Marks", construct: "SSI, academic profile, trends", timeMin: 12, format: "Marks entry" },
  { id: "proficiency", code: "2", name: "Subject Proficiency & Preference", construct: "Self-efficacy, enjoyment, identity", timeMin: 7, format: "Ratings + open" },
  { id: "learningStyles", code: "3", name: "Learning Styles", construct: "VARK + India adaptations", timeMin: 6, format: "Likert + FC" },
  { id: "studyHabits", code: "4", name: "Study Habits & Motivation", construct: "Consistency, planning, focus, resilience", timeMin: 7, format: "Likert" },
  { id: "examPrep", code: "5", name: "Exam Preparedness & Stress", construct: "Prep quality, anxiety, strategy, wellness", timeMin: 5, format: "Likert" },
  { id: "sjt", code: "6", name: "Situational Judgment", construct: "Academic values-in-action", timeMin: 8, format: "MO/LO SJT" },
];

const STREAMS = ["PCM", "PCB", "CommerceMaths", "CommerceNoMaths", "Humanities", "Vocational"];

module.exports = {
  SECTIONS,
  STREAMS,
  // Section 1
  MARKS_INTAKE,
  TERM_SETS,
  SUBJECT_SETS,
  SUBJECT_SET_RULES,
  MARKS_SUPPLEMENTARY,
  // Section 2
  PROFICIENCY_SCALE,
  SUBJECT_IDENTITY,
  // Section 3
  LEARNING_STYLES,
  LEARNING_STYLE_FC,
  // Section 4
  STUDY_HABITS,
  // Section 5
  EXAM_PREP,
  // Section 6
  SJT_T3,
  // Validity
  VALIDITY,
};
