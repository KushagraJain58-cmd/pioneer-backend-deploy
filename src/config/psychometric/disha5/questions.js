/**
 * DISHA — Test 5 of 8
 * Career Adaptability, Decision-Making Style, Growth Mindset, Learning Agility &
 * Future-Readiness.
 *
 * Target: Classes 9–12, Ages 13–25. Duration 25–35 min. CCRE weight 15–20% of
 * the Master Combined Score.
 *
 * Tests 1–4 measure who a student is today. Test 5 measures who they will need
 * to become tomorrow and how well-equipped they are for that journey. In an
 * economy where AI is displacing routine roles and the average professional will
 * change careers 3–5 times, career adaptability is the meta-skill that determines
 * whether all other skills remain valuable.
 *
 * Section map
 *  A — Career Adaptability (Savickas 4Cs)   24 Likert: Concern, Control, Curiosity, Confidence
 *  B — Growth vs Fixed Mindset              16 Likert (Dweck; Fixed reverse-scored)
 *  C — Decision-Making Style                18 Likert: Analytical, Intuitive, Dependent, Avoidant
 *  D — Learning Agility & New Skills        16 Likert: LearnAgility, FutureSkills, Digital, Breadth
 *  E — Tolerance for Ambiguity & Risk       14 Likert: AmbigTol, RiskTake, Stability
 *  F — Future Orientation & AI-Readiness    14 Likert: FutOrient, Planning, AIAware, Agility, India2030
 *  G — SJT Block 1 (Career Transitions)     8 MO/LO
 *  H — SJT Block 2 (Future & Uncertainty)   7 MO/LO
 *  V — Validity (LikeMe + RII)              5 social-desirability items + RII pairs
 *
 * Conventions
 *  - Section A Likert: 1 = Not strong at all … 5 = Very strong.
 *  - Sections B–F Likert: 1 = Strongly Disagree … 5 = Strongly Agree.
 *  - Items: { id, text, scale, reverse?, indiaSpecific? }.
 *  - SJT: { id, title, competencies, context, scenario, options:[{key,text,moPoints,note}] }.
 */

/* =========================================================================
   SECTION A — CAREER ADAPTABILITY: SAVICKAS 4C MODEL (24 items)
   Scale: 1 = Not strong at all … 5 = Very strong.
   Concern (6) · Control (6) · Curiosity (6) · Confidence (6).
   ========================================================================= */
const ADAPTABILITY_4C = [
  // Concern
  { id: "A1", scale: "Concern", text: "Thinking about what my career will be like in the future.", indiaSpecific: false },
  { id: "A2", scale: "Concern", text: "Realising that today's educational choices will shape my career options for years to come.", indiaSpecific: true },
  { id: "A3", scale: "Concern", text: "Preparing for my future career by taking the right subjects and building relevant skills now.", indiaSpecific: true },
  { id: "A4", scale: "Concern", text: "Planning how to reach my career goal step by step — not just having a vague dream.", indiaSpecific: false },
  { id: "A5", scale: "Concern", text: "Being aware of how the changes happening in India's economy (AI, startups, new sectors) might affect my career choices.", indiaSpecific: true },
  { id: "A6", scale: "Concern", text: "Thinking about what kind of life I want to be living in 10 years — not just what career title I want.", indiaSpecific: true },
  // Control
  { id: "A7", scale: "Control", text: "Making my own decisions about my future — not just going along with what my parents or teachers decide for me.", indiaSpecific: true },
  { id: "A8", scale: "Control", text: "Taking responsibility for my own career — if something isn't working, it's my job to change it.", indiaSpecific: false },
  { id: "A9", scale: "Control", text: "Keeping my options open so I can adjust my direction when new information arises.", indiaSpecific: false },
  { id: "A10", scale: "Control", text: "Relying primarily on my own judgment when making important academic or career choices.", indiaSpecific: false },
  { id: "A11", scale: "Control", text: "Asserting my own view in career discussions with family, even when they strongly disagree.", indiaSpecific: true },
  { id: "A12", scale: "Control", text: "Making my own choices about my career — rather than defaulting to whatever is most familiar or expected in my family/community.", indiaSpecific: true },
  // Curiosity
  { id: "A13", scale: "Curiosity", text: "Exploring many different career options before narrowing down — not just the standard 3 (doctor, engineer, IAS).", indiaSpecific: true },
  { id: "A14", scale: "Curiosity", text: "Seeking out information about careers and fields I know very little about, just to see if they interest me.", indiaSpecific: false },
  { id: "A15", scale: "Curiosity", text: "Imagining myself in very different types of careers — not just the ones I've been exposed to.", indiaSpecific: false },
  { id: "A16", scale: "Curiosity", text: "Learning about the skills, lifestyle, and day-to-day reality of careers I am curious about.", indiaSpecific: false },
  { id: "A17", scale: "Curiosity", text: "Being curious about what work in fields like AI, sustainability, space technology, or behavioural economics actually involves.", indiaSpecific: true },
  { id: "A18", scale: "Curiosity", text: "Talking to professionals in different careers — not just the ones my family recommends — to understand what their work is really like.", indiaSpecific: true },
  // Confidence
  { id: "A19", scale: "Confidence", text: "Believing I can handle whatever challenges come my way in my education and career.", indiaSpecific: false },
  { id: "A20", scale: "Confidence", text: "Performing effectively in most of the tasks I take on — even challenging ones.", indiaSpecific: false },
  { id: "A21", scale: "Confidence", text: "Successfully executing the plans I make — not just making plans but actually carrying them out.", indiaSpecific: false },
  { id: "A22", scale: "Confidence", text: "Tackling problems before they become serious — being proactive rather than reactive.", indiaSpecific: false },
  { id: "A23", scale: "Confidence", text: "Developing new skills when my career requires it — even if they are completely outside my current expertise.", indiaSpecific: false },
  { id: "A24", scale: "Confidence", text: "Remaining confident about my future career path even when I face setbacks, rejections, or unexpected changes.", indiaSpecific: true },
];

/* =========================================================================
   SECTION B — GROWTH vs FIXED MINDSET (16 items) · 1=SD … 5=SA
   Growth items + Fixed items (reverse-scored). India-specific Fixed: B6,B7,B8,B15.
   ========================================================================= */
const MINDSET = [
  { id: "B1", scale: "Growth", text: "I believe my intelligence can grow significantly — the brain is like a muscle that gets stronger with challenging work.", indiaSpecific: false },
  { id: "B2", scale: "Growth", text: "My talent and ability in any subject can improve substantially with the right methods and consistent effort.", indiaSpecific: false },
  { id: "B3", scale: "Growth", text: "When I struggle with a subject, I see it as a sign that I need to try a different approach — not as proof that I lack the ability.", indiaSpecific: false },
  { id: "B4", scale: "Growth", text: "I genuinely believe that people who seem 'naturally talented' in Maths or Science developed that ability through practice — it wasn't just given to them.", indiaSpecific: false },
  { id: "B5", scale: "Fixed", reverse: true, text: "Some people are just born smarter or more talented than others — no amount of effort can fully close that gap.", indiaSpecific: false },
  { id: "B6", scale: "Fixed", reverse: true, fixedIndia: true, text: "If someone is struggling significantly with a subject after trying hard, they probably just don't have the aptitude for it.", indiaSpecific: true },
  { id: "B7", scale: "Fixed", reverse: true, fixedIndia: true, text: "I have subjects I am simply 'not a Maths person' or 'not a science person' for — and no amount of effort will change that fundamentally.", indiaSpecific: true },
  { id: "B8", scale: "Fixed", reverse: true, fixedIndia: true, text: "Success in JEE or NEET primarily requires natural intelligence — the students who clear it were always going to.", indiaSpecific: true },
  { id: "B9", scale: "Fixed", reverse: true, text: "When I fail at something important, my first instinct is to question whether I have the ability — rather than questioning whether I had the right strategy.", indiaSpecific: false },
  { id: "B10", scale: "Growth", text: "A poor result in a test or exam is information about my current approach — not a verdict on my long-term potential.", indiaSpecific: false },
  { id: "B11", scale: "Growth", text: "I actively seek out feedback on my mistakes because I know it helps me improve, even though it is sometimes uncomfortable to receive.", indiaSpecific: false },
  { id: "B12", scale: "Growth", text: "I prefer studying topics that genuinely challenge me — even when they are uncomfortable — over topics I already know well.", indiaSpecific: false },
  { id: "B13", scale: "Growth", text: "When I see someone perform better than me, my primary reaction is curiosity about what they are doing differently.", indiaSpecific: false },
  { id: "B14", scale: "Growth", text: "The primary reason smart students succeed is that they have good strategy and genuine effort — not that they are inherently more capable.", indiaSpecific: false },
  { id: "B15", scale: "Fixed", reverse: true, fixedIndia: true, text: "In India, certain careers (IAS, IIT, top medicine) are really only for people with a specific type of intelligence that most people don't have.", indiaSpecific: true },
  { id: "B16", scale: "Growth", text: "I believe I could, with the right preparation and time, become good at almost any skill or subject — even ones I currently find very difficult.", indiaSpecific: false },
];

/* =========================================================================
   SECTION C — DECISION-MAKING STYLE UNDER PRESSURE (18 items) · 1=SD … 5=SA
   Analytical (5) · Intuitive (3) · Dependent (5) · Avoidant (5). All neutral.
   ========================================================================= */
const DECISION_STYLE = [
  { id: "C1", scale: "Analytical", text: "When making an important career or educational decision, I research thoroughly — I compare options, look at data, and consider multiple perspectives before deciding.", indiaSpecific: false },
  { id: "C2", scale: "Analytical", text: "I make a list of pros and cons — or some form of structured analysis — for major decisions like which stream to take or which coaching to join.", indiaSpecific: true },
  { id: "C3", scale: "Analytical", text: "I like to understand the logic and data behind a career choice before committing to it.", indiaSpecific: false },
  { id: "C4", scale: "Analytical", text: "I prefer to have at least 2–3 clearly analysed options before I make a major decision.", indiaSpecific: false },
  { id: "C5", scale: "Intuitive", text: "When it comes to major career decisions, I often go with my gut feeling — if it feels right, I trust that instinct.", indiaSpecific: false },
  { id: "C6", scale: "Intuitive", text: "I have made some of my best decisions relatively quickly — based on instinct rather than extensive analysis.", indiaSpecific: false },
  { id: "C7", scale: "Intuitive", text: "I trust my inner sense when it comes to choosing between career paths — data is helpful, but my gut tells me more.", indiaSpecific: false },
  { id: "C8", scale: "Dependent", text: "I feel most comfortable making a major decision about my career after checking with people I trust — parents, relatives, counsellors.", indiaSpecific: true },
  { id: "C9", scale: "Dependent", text: "I rely heavily on what my parents or family think when making career decisions — their opinion matters more than my own in most cases.", indiaSpecific: true },
  { id: "C10", scale: "Dependent", text: "I feel uncertain about my own judgment when it comes to career decisions — I prefer to defer to someone more experienced.", indiaSpecific: true },
  { id: "C11", scale: "Dependent", text: "I rarely make a final decision about my education or career without first getting the approval of at least one authority figure (parent, teacher, senior).", indiaSpecific: true },
  { id: "C12", scale: "Dependent", text: "Even when I have a strong personal preference for a career, I would not pursue it if my parents strongly disapproved.", indiaSpecific: true },
  { id: "C13", scale: "Avoidant", text: "When I think about making a final decision about my future career, I tend to postpone it as long as possible.", indiaSpecific: true },
  { id: "C14", scale: "Avoidant", text: "I avoid thinking too specifically about career decisions because the thought of getting it 'wrong' is stressful.", indiaSpecific: false },
  { id: "C15", scale: "Avoidant", text: "I prefer to wait and see how things develop rather than making a definite career plan now.", indiaSpecific: false },
  { id: "C16", scale: "Avoidant", text: "The idea of committing to a specific career path makes me anxious — I'd rather keep all options open indefinitely.", indiaSpecific: false },
  { id: "C17", scale: "Avoidant", text: "I find it easier to go along with a decision others have made for me than to assert my own preference.", indiaSpecific: true },
  { id: "C18", scale: "Analytical", text: "After making a major decision, I feel at peace with it and commit fully — I don't spend weeks second-guessing myself.", indiaSpecific: false },
];

/* =========================================================================
   SECTION D — LEARNING AGILITY & OPENNESS TO NEW SKILLS (16 items) · 1=SD … 5=SA
   LearnAgility (10, incl. reverse D6) · FutureSkills (2) · Digital (2) · Breadth (2).
   ========================================================================= */
const LEARNING_AGILITY = [
  { id: "D1", scale: "LearnAgility", text: "I pick up new skills and concepts relatively quickly — when I am motivated to learn something, I learn it fast.", indiaSpecific: false },
  { id: "D2", scale: "LearnAgility", text: "I actively look for opportunities to learn things outside my formal school or coaching curriculum.", indiaSpecific: false },
  { id: "D3", scale: "LearnAgility", text: "I have independently learned a skill (coding, graphic design, a new language, an instrument, video editing) that was not taught in school.", indiaSpecific: true },
  { id: "D4", scale: "LearnAgility", text: "I enjoy the feeling of being a beginner — not knowing something yet and having the challenge of figuring it out.", indiaSpecific: false },
  { id: "D5", scale: "LearnAgility", text: "When I need to learn something new, I don't wait for a formal class — I find resources (YouTube, books, online courses) and start immediately.", indiaSpecific: false },
  { id: "D6", scale: "LearnAgility", reverse: true, text: "I feel embarrassed or anxious when I don't know something that others around me seem to know.", indiaSpecific: true },
  { id: "D7", scale: "LearnAgility", text: "I am comfortable asking 'basic' questions in class or with peers, even if it makes me look like I don't know something.", indiaSpecific: false },
  { id: "D8", scale: "LearnAgility", text: "I can take skills or knowledge I developed in one area and apply them in a completely different context.", indiaSpecific: false },
  { id: "D9", scale: "LearnAgility", text: "I learn a lot from experiences outside studying — from conversations, travel, part-time work, volunteering, sports, or creative projects.", indiaSpecific: false },
  { id: "D10", scale: "FutureSkills", text: "I am currently developing or am genuinely interested in at least one skill that will be important in India's job market in the next 5–10 years (e.g., data analysis, AI/ML basics, sustainability, entrepreneurship, coding, communication).", indiaSpecific: true },
  { id: "D11", scale: "FutureSkills", text: "I follow news, blogs, or videos about technology trends, emerging industries, or the future of work — not because I have to, but because I find it genuinely interesting.", indiaSpecific: false },
  { id: "D12", scale: "Digital", text: "I feel reasonably comfortable using digital tools, apps, and online platforms to learn, create, or solve problems.", indiaSpecific: false },
  { id: "D13", scale: "Digital", text: "I have at least a basic understanding of what AI and automation are doing to different career fields.", indiaSpecific: true },
  { id: "D14", scale: "LearnAgility", text: "When I fail at a task or skill attempt, I analyse specifically what went wrong and adjust my approach — I don't just try harder with the same approach.", indiaSpecific: false },
  { id: "D15", scale: "Breadth", text: "I am genuinely interested in learning across multiple domains — not just depth in one subject.", indiaSpecific: false },
  { id: "D16", scale: "Breadth", text: "I find it exciting to learn about how different fields connect — for example, how biology connects to AI, or how economics connects to psychology.", indiaSpecific: false },
];

/* =========================================================================
   SECTION E — TOLERANCE FOR AMBIGUITY & RISK-TAKING (14 items) · 1=SD … 5=SA
   AmbigTol (5, incl. reverse E3,E5) · RiskTake (5) · Stability (4).
   ========================================================================= */
const AMBIGUITY_RISK = [
  { id: "E1", scale: "AmbigTol", text: "I am comfortable with situations where the right answer is not clear — where there are many possible approaches and no guaranteed outcome.", indiaSpecific: false },
  { id: "E2", scale: "AmbigTol", text: "I find it stimulating, rather than stressful, to work on problems that have no established solution.", indiaSpecific: false },
  { id: "E3", scale: "AmbigTol", reverse: true, text: "I feel uncomfortable when career decisions or life situations don't have a clear, defined path forward.", indiaSpecific: false },
  { id: "E4", scale: "AmbigTol", text: "I can function effectively even when I don't have all the information I need — I can proceed with partial information.", indiaSpecific: false },
  { id: "E5", scale: "AmbigTol", reverse: true, text: "I prefer a career with a clear, predictable structure (government job, traditional profession) over one with exciting but uncertain prospects.", indiaSpecific: true },
  { id: "E6", scale: "RiskTake", text: "I am willing to take significant calculated risks if the potential reward — financial, personal, or social — is worth it.", indiaSpecific: false },
  { id: "E7", scale: "RiskTake", text: "I would seriously consider starting a business rather than seeking a traditional job, if I had an idea I believed in strongly.", indiaSpecific: true },
  { id: "E8", scale: "RiskTake", text: "Financial insecurity — not knowing exactly what I will earn — is something I could handle in the early years of my career, if the long-term potential is high.", indiaSpecific: true },
  { id: "E9", scale: "RiskTake", text: "I find the idea of building something from nothing — a startup, an NGO, a creative project with uncertain outcomes — genuinely exciting.", indiaSpecific: false },
  { id: "E10", scale: "Stability", text: "Job security and a predictable income matter more to me than the excitement of a high-risk, high-reward path.", indiaSpecific: true },
  { id: "E11", scale: "Stability", text: "I would choose a government or PSU job with certainty over a startup role with potentially much higher upside.", indiaSpecific: true },
  { id: "E12", scale: "Stability", text: "I get anxious when I don't have a clear plan — I need to know roughly what my life will look like in 5–10 years.", indiaSpecific: false },
  { id: "E13", scale: "Stability", text: "In India's uncertain economy, taking career risks is a luxury — most people need to pursue the most secure path available.", indiaSpecific: true },
  { id: "E14", scale: "RiskTake", text: "I believe that in today's India, calculated risk-taking in career choices is actually the safest long-term strategy — playing it too safe has its own risks.", indiaSpecific: true },
];

/* =========================================================================
   SECTION F — FUTURE ORIENTATION, PLANNING & AI-READINESS (14 items) · 1=SD … 5=SA
   FutOrient (4) · Planning (3) · AIAware (3) · Agility (2) · India2030 (2).
   ========================================================================= */
const FUTURE_ORIENTATION = [
  { id: "F1", scale: "FutOrient", text: "I regularly think about what the world and job market will look like in 10–15 years — not just the immediate next step (exam, college).", indiaSpecific: false },
  { id: "F2", scale: "FutOrient", text: "I have a rough idea of what kind of professional life I want to be living at age 30 — not just what degree I want to complete.", indiaSpecific: false },
  { id: "F3", scale: "FutOrient", text: "I think about how the career I am targeting will be different in 10 years due to technology, policy, or global changes.", indiaSpecific: true },
  { id: "F4", scale: "FutOrient", text: "I am genuinely excited about — rather than anxious about — the pace at which India and the world are changing.", indiaSpecific: true },
  { id: "F5", scale: "Planning", text: "I have a rough multi-year plan for my education and career — not a rigid plan, but a directional map with milestones.", indiaSpecific: false },
  { id: "F6", scale: "Planning", text: "I think about which skills I need to develop now that will pay off over the next 5–10 years.", indiaSpecific: false },
  { id: "F7", scale: "Planning", text: "I am actively doing something today (learning a skill, working on a project, building knowledge) that is part of my longer-term career plan.", indiaSpecific: false },
  { id: "F8", scale: "AIAware", text: "I have thought about whether AI or automation might affect the career I am currently targeting.", indiaSpecific: true },
  { id: "F9", scale: "AIAware", text: "I believe having basic AI literacy — understanding what AI can and cannot do — is important for almost every professional in India by 2030.", indiaSpecific: true },
  { id: "F10", scale: "AIAware", text: "I feel reasonably prepared for a future where I might need to significantly change my career direction once or twice.", indiaSpecific: false },
  { id: "F11", scale: "Agility", text: "I believe being a T-shaped professional (deep in one area + broad across several) is more valuable than being a pure specialist in today's India.", indiaSpecific: true },
  { id: "F12", scale: "Agility", text: "I am open to the possibility that my most fulfilling career might not yet have a name — it may emerge from combining skills that don't currently connect.", indiaSpecific: false },
  { id: "F13", scale: "India2030", text: "I believe India's development needs over the next 20 years will create significant opportunities in areas that don't get much attention in standard career conversations — rural tech, sustainability, health systems, policy.", indiaSpecific: true },
  { id: "F14", scale: "India2030", text: "I am prepared to invest in learning outside my formal degree — certifications, projects, side ventures — because I know formal degrees alone won't be sufficient.", indiaSpecific: true },
];

/* =========================================================================
   SECTION G — SJT BLOCK 1: INDIAN CAREER TRANSITION SCENARIOS (8) · MO/LO
   ========================================================================= */
const SJT_G = [
  {
    id: "SJT_T5_G1",
    title: "AI Disrupts Your Target Career",
    competencies: ["Future Orientation", "Learning Agility", "Growth Mindset"],
    context: "Class 12 / Post-graduation planning",
    scenario:
      "Deepika is in Class 12 (PCM) and has been preparing for JEE to become a software engineer. She reads a well-researched report stating that 40% of current entry-level software engineering roles in India will be significantly automated by AI within 6–8 years. Many of her relatives in IT are already experiencing job insecurity. She is 3 months from JEE.",
    options: [
      { key: "A", text: "Continue with the original JEE plan unchanged — this AI disruption news is overblown, and software engineers will always be needed.", moPoints: 1, note: "Fixed response, low adaptability" },
      { key: "B", text: "Abandon the JEE plan immediately and explore alternative careers — the risk to software engineering is too high.", moPoints: 1, note: "Overreaction — low Analytical DM" },
      { key: "C", text: "Continue JEE preparation, but proactively research which software-engineering specialisations are AI-resistant (AI development, systems architecture, human-AI interaction design, ethical AI) and begin informal learning in those areas alongside preparation.", moPoints: 3, note: "Growth Mindset + Learning Agility + Future Orientation" },
      { key: "D", text: "Discuss with a career counsellor and trusted professionals in the IT industry before making any changes — gather more specific, nuanced information before reacting.", moPoints: 3, note: "Analytical Decision Making + Curiosity" },
    ],
  },
  {
    id: "SJT_T5_G2",
    title: "JEE Low Rank — Drop or Proceed?",
    competencies: ["Decision-Making Style", "Adaptability", "Control", "Resilience"],
    context: "Post-JEE result — Class 12",
    scenario:
      "Aryan received a JEE rank of 42,000 — enough for a decent NIT in a branch he isn't excited about (Metallurgy), or a state engineering college in CS. He can also take a drop year and attempt JEE again. His parents want him to take the NIT seat (security). He genuinely wants CS — either IIT or a strong private college (BITS/VIT). He has never analysed whether his low score was due to preparation strategy, exam anxiety, or a genuine gap in ability.",
    options: [
      { key: "A", text: "Take the NIT seat in Metallurgy immediately — a bird in hand is better than two in the bush.", moPoints: 1, note: "Low Control + Dependent DM" },
      { key: "B", text: "Take the drop year and prepare again — he must reach an IIT or there's no point in engineering.", moPoints: 1, note: "High Risk-Taking but low Analytical DM" },
      { key: "C", text: "Before deciding, do a structured analysis: What specifically went wrong in the JEE? Is his CS passion strong enough to motivate a second attempt? Is his study approach and mental health ready for another year? Then decide based on evidence, not fear or family pressure.", moPoints: 3, note: "Analytical DM + Control + evidence-based decision" },
      { key: "D", text: "Accept the state engineering college CS seat — get the CS he wants at a lower-ranked college, and compensate with projects, internships, and online learning.", moPoints: 2, note: "Pragmatic, CS-aligned, growth-mindset compensation strategy" },
    ],
  },
  {
    id: "SJT_T5_G3",
    title: "Startup vs PSU Offer",
    competencies: ["Risk Tolerance", "Ambiguity", "Future Orientation", "Autonomy"],
    context: "Post-graduation, first job decision",
    scenario:
      "Rohit (B.Tech graduate, 22) has two offers: (i) a government PSU (ONGC engineer) — ₹60,000/month, full security, pension; (ii) an early-stage climate tech startup — ₹45,000/month, ESOPs, high learning, no job guarantee beyond 12 months. His parents strongly prefer the PSU. Rohit has high Test-5 Risk Tolerance and high Learning Agility scores.",
    options: [
      { key: "A", text: "Take the PSU — financial security is paramount at this stage, and his parents' experience matters.", moPoints: 1, note: "Highest MO for a low-risk-tolerance + high Family-Duty profile" },
      { key: "B", text: "Take the startup — the ESOPs could be life-changing and the learning will be irreplaceable.", moPoints: 2, note: "Valid if Risk Tolerance is very high" },
      { key: "C", text: "Take the startup for 12–18 months as a deliberate learning period. Set a clear personal review milestone — if the company's viability and his growth are strong, continue. If not, he will have strong skills to move to a more stable role.", moPoints: 3, note: "Adaptability + Strategic thinking + Control" },
      { key: "D", text: "Negotiate further — ask the startup for a higher fixed salary or role clarity before deciding.", moPoints: 2, note: "Pragmatic information-gathering" },
    ],
  },
  {
    id: "SJT_T5_G4",
    title: "Forced Career Pivot at 20",
    competencies: ["Learning Agility", "Growth Mindset", "Adaptability", "Resilience"],
    context: "Class 12 / early college — stream mismatch discovered late",
    scenario:
      "Manisha took Commerce in Class 11 under family pressure. She is now in Class 12 and has realised she has a deep interest in Environmental Science — something Commerce doesn't lead to directly. She has high marks in Economics (82%) and Geography (88%). She has 1 year until college applications.",
    options: [
      { key: "A", text: "Accept the Commerce path completely — it's too late to change direction and Commerce has many good options.", moPoints: 1, note: "Low Adaptability" },
      { key: "B", text: "Stop Commerce preparation and shift to Science — even at this late stage, a stream change is worth it.", moPoints: 1, note: "Brave but strategically risky at this stage" },
      { key: "C", text: "Research pathways from Commerce/Economics into Environmental Science. She finds: BA Economics at DSE or JNU → MA Environmental Policy; or CUET for BSc Environmental Science; or private colleges offering interdisciplinary programmes. She identifies a realistic bridge pathway without abandoning her strong Commerce marks.", moPoints: 3, note: "Learning Agility + Curiosity + Analytical DM" },
      { key: "D", text: "Ask her parents to decide — she is too confused to choose between competing interests on her own.", moPoints: 1, note: "High Dependent DM style" },
    ],
  },
  {
    id: "SJT_T5_G5",
    title: "Relocating for a Better Opportunity",
    competencies: ["Control", "Future Orientation", "Social Adaptability"],
    context: "Post-graduation / early career — geographic mobility decision",
    scenario:
      "Priya (22, from Nagpur) has been offered a Data Science role at a healthcare AI startup in Bengaluru — ₹12 LPA. She also has a government bank PO offer in Nagpur — ₹7 LPA, full security, near home. Her parents are concerned about her moving alone to Bengaluru but are not explicitly refusing. She is personally excited about the AI startup but anxious about the move.",
    options: [
      { key: "A", text: "Take the bank job — being close to family is a priority and Bengaluru is daunting.", moPoints: 1, note: "High Stability preference" },
      { key: "B", text: "Take the Bengaluru startup job — the learning and salary differential are significant, and she is an adult who can manage the move.", moPoints: 2, note: "High Control but low evidence-gathering" },
      { key: "C", text: "Before deciding, spend a week in Bengaluru: visit the startup office, explore accommodation options, connect with a professional women's network or alumni from her college — make the decision with information, not anxiety.", moPoints: 3, note: "Analytical DM + Curiosity + Control" },
      { key: "D", text: "Ask her parents to visit the startup office with her and help evaluate the environment together — involve them in the decision.", moPoints: 2, note: "High Dependent DM but constructive family-engagement approach" },
    ],
  },
  {
    id: "SJT_T5_G6",
    title: "Skills Made Obsolete After Graduation",
    competencies: ["Learning Agility", "Growth Mindset", "Future Orientation"],
    context: "2 years post-graduation — career skill disruption",
    scenario:
      "Suresh graduated with a BCA in 2024 and got a job as a software tester. In 2026, he reads that AI tools can now do 80% of manual software testing work, and his company has reduced its testing team by 40%. His manager suggests he either upskill in AI-assisted testing or pivot to a product management track. Suresh has never thought of himself as a product person.",
    options: [
      { key: "A", text: "Resign and look for another manual testing job at a different company.", moPoints: 1, note: "Low Learning Agility" },
      { key: "B", text: "Begin the AI-assisted testing upskilling immediately — complete a relevant certification within 3 months, then re-evaluate.", moPoints: 3, note: "Learning Agility + Growth Mindset + Proactive adaptation" },
      { key: "C", text: "Explore product management seriously: read about what PMs do, speak to a PM at his company, take a free online PM course — then decide if the pivot is right for him.", moPoints: 3, note: "Strategic pivot exploration" },
      { key: "D", text: "Wait and see if the situation stabilises — the AI disruption might not be as significant as it seems.", moPoints: 1, note: "Low Future Orientation + Avoidant response" },
    ],
  },
  {
    id: "SJT_T5_G7",
    title: "Choosing Between Passion and Practicality",
    competencies: ["Decision-Making Style", "Control", "Ambiguity Tolerance"],
    context: "Class 12 stream / career decision — parents involved",
    scenario:
      "Kabir (Class 12, Commerce) wants to study Psychology at university and eventually become an organisational psychologist working with companies. His father — an accountant — strongly insists he complete CA first: 'Psychology is fine for women. Men need professional qualifications. Do CA, then do whatever you want.' Kabir has scored 85% in Commerce subjects and has high Control + low Dependent decision style.",
    options: [
      { key: "A", text: "Agree to do CA as his father insists — family relationships are more important than personal preferences.", moPoints: 1, note: "High Family-Duty but low Control" },
      { key: "B", text: "Firmly and clearly communicate his preference to pursue Psychology, research BA Psychology programmes at good institutions, and present a concrete career plan for organisational psychology to his father.", moPoints: 3, note: "Highest for high-Control + low-Dependent: Assertiveness + Evidence-Based" },
      { key: "C", text: "Do the first year of CA Foundation while simultaneously applying for BA Psychology — delay the confrontation until results clarify which he is better suited for.", moPoints: 2, note: "Pragmatic hedge — valid for a moderate-Dependent profile" },
      { key: "D", text: "Ask his school counsellor to speak to his father — he doesn't want to have the difficult conversation himself.", moPoints: 1, note: "Avoidant + high-Dependent style" },
    ],
  },
  {
    id: "SJT_T5_G8",
    title: "NEET Failure — Pivot or Repeat?",
    competencies: ["Adaptability", "Growth Mindset", "Analytical Decision-Making"],
    context: "Post-NEET result — 380/720",
    scenario:
      "Kavitha has attempted NEET twice. Her score is 380/720 (well below the government MBBS cutoff). She has always wanted to be a doctor. Her options: a third NEET attempt; a BDS seat; B.Sc Nursing; Physiotherapy; Paramedical sciences. Her Test-5 profile shows Moderate Adaptability, Low Curiosity (she has never explored alternatives), and Low Decision Autonomy.",
    options: [
      { key: "A", text: "Attempt NEET a third time — she cannot imagine any other path.", moPoints: 1, note: "Only valid if her analysis post-exploration still points to a repeat" },
      { key: "B", text: "Accept a BDS seat immediately — dentistry is a good medical profession.", moPoints: 2, note: "Pragmatic" },
      { key: "C", text: "Take 2 weeks to genuinely explore the alternative healthcare pathways she has never considered — speak to a physiotherapist, a nurse, and a BDS practitioner. Assess which alternative genuinely interests her before making a decision.", moPoints: 3, note: "Curiosity + Analytical DM + opening the Curiosity dimension" },
      { key: "D", text: "Stop pursuing medicine entirely — three failures is a clear signal.", moPoints: 1, note: "Low Resilience + Growth Mindset" },
    ],
  },
];

/* =========================================================================
   SECTION H — SJT BLOCK 2: FUTURE & UNCERTAINTY SCENARIOS (7) · MO/LO
   ========================================================================= */
const SJT_H = [
  {
    id: "SJT_T5_H1",
    title: "The Unknown Career Path",
    competencies: ["Curiosity", "Ambiguity Tolerance", "Future Orientation"],
    context: "Class 11–12 career exploration",
    scenario:
      "Tanvi is in Class 11 (Humanities) and has no strong career preference. All her friends have clear targets (UPSC, Law, Journalism). Her parents ask what she wants to be, and she honestly doesn't know. She feels anxious about this uncertainty but also slightly excited. When she reflects, she finds herself drawn to human behaviour, design, and technology — but has no idea what career combines these.",
    options: [
      { key: "A", text: "Pick the most 'respectable' career from her stream (IAS) and start preparing — at least having a direction is better than having none.", moPoints: 1, note: "Dependent DM" },
      { key: "B", text: "Actively explore the intersection of her interests: research careers like UX Design, Behavioural Economics, Human-Computer Interaction, Organisational Psychology — and speak to people in those fields before deciding.", moPoints: 3, note: "Curiosity + Active Exploration + Growth Mindset" },
      { key: "C", text: "Tell her parents she doesn't know yet and ask them to suggest a career for her — they have more experience.", moPoints: 1, note: "High Dependent DM" },
      { key: "D", text: "Wait for clarity to come — forcing a decision before she is ready will lead to the wrong choice.", moPoints: 2, note: "Valid for the short-term if combined with active exploration" },
    ],
  },
  {
    id: "SJT_T5_H2",
    title: "When Your Dream Career Becomes Automated",
    competencies: ["Learning Agility", "Future Orientation", "Adaptability"],
    context: "Post-graduation — speculative but realistic",
    scenario:
      "Nikhil studied CA. He qualified in 2024. By 2026, AI tools (like Tally's AI module) are automating 60% of routine audit and tax work. Many small CA firms are downsizing. Nikhil's senior colleagues with 10+ years of experience are worried. He is 24 and just starting his career.",
    options: [
      { key: "A", text: "Continue standard CA practice — his firm is established and clients are loyal.", moPoints: 1, note: "Low Learning Agility + low Future Orientation" },
      { key: "B", text: "Immediately invest in learning AI-assisted accounting tools, financial advisory skills, and an FMVA (Financial Modelling) certification — pivot from compliance work to advisory and analysis.", moPoints: 3, note: "Learning Agility + Future Orientation (fastest to execute)" },
      { key: "C", text: "Start his own CA practice targeting small businesses — before the large firms fully automate.", moPoints: 2, note: "Entrepreneurial risk response — valid for a high Risk-Tolerance profile" },
      { key: "D", text: "Consider a pivot to finance-adjacent emerging fields: ESG reporting, M&A advisory, startup CFO-as-a-service.", moPoints: 3, note: "More creative pivot" },
    ],
  },
  {
    id: "SJT_T5_H3",
    title: "The Gap Year Decision",
    competencies: ["Control", "Future Planning", "Analytical DM", "Ambiguity Tolerance"],
    context: "Post-Class 12 — gap year consideration",
    scenario:
      "Ritika has finished Class 12 and is unsure what she wants to study. She has a CUET score that would get her into a reasonable BA programme, but she is not excited about it. She is considering a gap year to travel, volunteer, and explore. Her parents are horrified — 'A year wasted! All your friends will be ahead!' In India, gap years have significant social stigma.",
    options: [
      { key: "A", text: "Take whatever course her CUET score allows — losing a year is unacceptable.", moPoints: 1, note: "Low Adaptability + Dependent DM" },
      { key: "B", text: "Take the gap year entirely — full exploration, no structured plan, and figure it out as she goes.", moPoints: 2, note: "Valid for a high Ambiguity Tolerance profile with strong self-direction" },
      { key: "C", text: "Design a structured gap year: specific goals (explore 3 career fields, complete 2 relevant internships or volunteer placements, take 1 online course), with a clear re-enrollment plan at the end.", moPoints: 3, note: "Future Orientation + Analytical DM + Control — turns ambiguity into structured exploration" },
      { key: "D", text: "Ask her parents to decide — this is causing too much family conflict for her to handle alone.", moPoints: 1, note: "Avoidant" },
    ],
  },
  {
    id: "SJT_T5_H4",
    title: "Learning a Completely New Skill at 22",
    competencies: ["Learning Agility", "Growth Mindset", "Future Orientation"],
    context: "Early career — skill acquisition pressure",
    scenario:
      "Ramesh completed B.Com and got a job at an accounting firm. His company's CTO announces that all finance staff need to become proficient in data analytics (Python + Power BI) within 6 months or risk being redeployed to less central roles. Ramesh has never coded. He is 22 and finds the idea of coding intimidating.",
    options: [
      { key: "A", text: "Start learning Python immediately from free resources (NPTEL, YouTube) — 1 hour per day for 6 months will make him adequately proficient.", moPoints: 3, note: "Self-directed learning action" },
      { key: "B", text: "Resign and look for an accounting job that doesn't require coding skills.", moPoints: 1, note: "Low Learning Agility" },
      { key: "C", text: "Speak to his manager and ask for structured company support (a training programme, a mentor) — he shouldn't have to figure this out entirely alone.", moPoints: 3, note: "Leveraging available support" },
      { key: "D", text: "Learn just enough to appear competent — minimum viable compliance rather than genuine skill acquisition.", moPoints: 1, note: "Low Growth Mindset" },
    ],
  },
  {
    id: "SJT_T5_H5",
    title: "Family Business vs Own Vision",
    competencies: ["Autonomy", "Control", "Decision-Making Style", "Ambiguity Tolerance"],
    context: "Post-graduation — family business expectation",
    scenario:
      "Shreya's family has a successful textile trading business. It is assumed she will join after her B.Com. But Shreya wants to start a fashion tech platform — an app connecting Indian weavers directly to urban buyers. Her idea is strong but unproven. Her parents see it as reckless: 'We have a running business. Why risk it?' The family business would give her ₹50,000/month and eventual ownership.",
    options: [
      { key: "A", text: "Join the family business — the security and eventual ownership are too valuable to pass up.", moPoints: 1, note: "Low Autonomy but financially rational" },
      { key: "B", text: "Launch the fashion tech startup immediately, rejecting the family business offer.", moPoints: 1, note: "High Autonomy but potentially reckless — valid only for a very high Ambiguity Tolerance profile" },
      { key: "C", text: "Propose a 12-month pilot: join the family business part-time, use the income to fund MVP development, test market response, and revisit the decision with actual data at the end of the year.", moPoints: 3, note: "Analytical DM + Risk calibration + Control + Creative compromise" },
      { key: "D", text: "Ask for an investor's perspective — get a startup mentor or incubator's feedback on the idea's viability before making the family decision.", moPoints: 2, note: "Curiosity + external validation" },
    ],
  },
  {
    id: "SJT_T5_H6",
    title: "Overdependence on One Career Path",
    competencies: ["Curiosity", "Adaptability", "Analytical DM"],
    context: "Class 12 — career tunnel vision",
    scenario:
      "Aditya has prepared exclusively for IIT Computer Science for 3 years. His entire identity is built around 'IITian'. He has never explored any other career path. His JEE result gives him IIT Dhanbad Mechanical — not his target (CS at IIT Bombay / Delhi). He refuses to consider this a success. He is considering a second attempt.",
    options: [
      { key: "A", text: "Reject the IIT Dhanbad seat and take a drop year — anything less than CS at a top IIT is failure.", moPoints: 1, note: "Low Adaptability + Fixed Mindset ('only one definition of success')" },
      { key: "B", text: "Accept IIT Dhanbad Mechanical — IIT is IIT, and the brand will open doors regardless of branch.", moPoints: 2, note: "Valid — IIT placement data supports this" },
      { key: "C", text: "Take a week to genuinely research: What do Mechanical graduates from IIT Dhanbad do? What is the placement record? Can he branch into CS via coursework and projects? Then decide with information.", moPoints: 3, note: "Curiosity + Analytical DM + Growth Mindset" },
      { key: "D", text: "Ask his JEE coaching teacher to advise — they have seen hundreds of students in this situation.", moPoints: 1, note: "Dependent DM" },
    ],
  },
  {
    id: "SJT_T5_H7",
    title: "Choosing Between Certainty and Growth",
    competencies: ["Risk Tolerance", "Future Orientation", "Ambiguity Tolerance"],
    context: "Post-graduation — career choice values clarification",
    scenario:
      "Meghna (23, MA Economics) has two offers: (i) Research Analyst at NITI Aayog — ₹45,000/month, prestigious, stable, India-policy focused, slow promotion; (ii) Product Analyst at a Series B fintech startup — ₹65,000/month, rapid learning, ESOPs, 70% chance the company is acquired or fails in 3 years. She finds both genuinely appealing for different reasons.",
    options: [
      { key: "A", text: "Take the NITI Aayog role — prestige and stability are the priority at the start of a career.", moPoints: 2, note: "Valid" },
      { key: "B", text: "Take the fintech role — the learning and compensation differential are worth the risk.", moPoints: 2, note: "Valid" },
      { key: "C", text: "Take 2 weeks to clarify her personal values around risk, career pace, and lifestyle — then let those values (not fear) drive the decision. Either choice can be right depending on her genuine preferences.", moPoints: 3, note: "Self-awareness + Values clarification + Analytical DM" },
      { key: "D", text: "Ask her parents and a senior professional in each field for their perspective before deciding.", moPoints: 2, note: "Dependent DM but constructive" },
    ],
  },
];

/* =========================================================================
   VALIDITY — LikeMe (social desirability, agree-keyed, 5 items) + RII pairs.
   RII is computed from existing section responses (semantic opposites).
   ========================================================================= */
const VALIDITY = [
  { id: "V1", validity: "LikeMe", agreeKeyed: true, text: "I am always excited about change — I never find uncertainty or ambiguity uncomfortable." },
  { id: "V2", validity: "LikeMe", agreeKeyed: true, text: "I always make career decisions independently — I have never been influenced by what my family thinks." },
  { id: "V3", validity: "LikeMe", agreeKeyed: true, text: "I have never avoided making a difficult decision about my future out of fear or uncertainty." },
  { id: "V4", validity: "LikeMe", agreeKeyed: true, text: "I am always curious about new careers — I have never been tempted to take the 'safe' familiar path." },
  { id: "V5", validity: "LikeMe", agreeKeyed: true, text: "I always have a clear, detailed plan for my future — I am never uncertain about what I want." },
];

// RII pairs: each references items already administered. If both rated ≥4 (one is
// reverse-worded), the responses are semantically inconsistent.
const RII_PAIRS = [
  { a: "A7", b: "C11", note: "Make own decisions vs rarely decide without parental approval" },
  { a: "E1", b: "E12", note: "Comfortable with uncertain paths vs need to know 5–10 year plan" },
  { a: "B1", b: "B5", note: "Abilities can grow vs some are simply born smarter" },
  { a: "D1", b: "D6", note: "Pick up new skills quickly vs embarrassed not knowing things" },
];

/* =========================================================================
   SECTION METADATA — drives the client stepper.
   ========================================================================= */
const SECTIONS = [
  { id: "adaptability", code: "A", name: "Career Adaptability (4Cs)", construct: "Concern, Control, Curiosity, Confidence", timeMin: 6 },
  { id: "mindset", code: "B", name: "Growth vs Fixed Mindset", construct: "Developable vs fixed ability beliefs", timeMin: 4 },
  { id: "decisionStyle", code: "C", name: "Decision-Making Style", construct: "Analytical, Intuitive, Dependent, Avoidant", timeMin: 5 },
  { id: "learningAgility", code: "D", name: "Learning Agility", construct: "Speed & openness to new skills", timeMin: 4 },
  { id: "ambiguityRisk", code: "E", name: "Ambiguity & Risk Tolerance", construct: "Comfort with uncertainty & risk", timeMin: 4 },
  { id: "futureOrientation", code: "F", name: "Future Orientation & AI-Readiness", construct: "Planning, AI-awareness, 2030 readiness", timeMin: 4 },
  { id: "scenarios", code: "G·H", name: "Career Scenarios", construct: "Adaptability-in-action", timeMin: 12 },
];

module.exports = {
  SECTIONS,
  ADAPTABILITY_4C,
  MINDSET,
  DECISION_STYLE,
  LEARNING_AGILITY,
  AMBIGUITY_RISK,
  FUTURE_ORIENTATION,
  SJT_G,
  SJT_H,
  VALIDITY,
  RII_PAIRS,
};
