/**
 * DISHA — Test 4 of 8
 * Emotional Intelligence, Resilience, Stress Management & Interpersonal Fit.
 *
 * Target: Classes 9–12, Ages 13–25. Duration 25–40 min. CCRE weight 15–20% of
 * the Master Combined Score.
 *
 * Test 4 addresses the dimension that most separates high-achieving students
 * from high-fulfilling professionals: emotional intelligence and resilience. It
 * does NOT diagnose mental-health conditions — it measures functional EI,
 * adaptive coping, interpersonal effectiveness and resilience, and translates
 * these into concrete career guidance with Indian cultural context at the core.
 *
 * Section map
 *  A — Emotional Self-Awareness        18 Likert (Goleman EI-1 + Neuroticism facets)
 *  B — Emotional Self-Regulation       16 Likert (Goleman EI-2; impulsivity index)
 *  C — Resilience, Grit & Growth       20 Likert (Duckworth Grit + Dweck Mindset)
 *  D — Empathy & Interpersonal Skills  18 Likert (Goleman EI-4&5 + collectivist)
 *  E — Social & Cultural Adaptability  16 Likert (Cultural Intelligence, India)
 *  F — SJT Block 1 (Emotional)         8 MO/LO Indian emotional scenarios
 *  G — SJT Block 2 (Resilience/Social) 7 MO/LO Indian resilience scenarios
 *  V — Validity (LikeMe)               5 social-desirability items + crisis self-check
 *
 * Item conventions
 *  - Likert item: { id, text, scale, reverse?, indiaSpecific? } on a 1..5 scale.
 *  - SJT: { id, title, competencies, context, scenario, options:[{key,text,moPoints,note}], crisisOption? }.
 *  - Scale interpretation (T-score): T≥65 Exceptional, 55–64 Strong, 45–54 Average,
 *    35–44 Developing, <35 Critical (counsellor-only).
 */

/* =========================================================================
   SECTION A — EMOTIONAL SELF-AWARENESS (18 items) · scale EI-A
   Identify, name and understand one's own emotions; body-signal awareness;
   emotional vocabulary; recognition of emotional patterns. Reverse: A4, A9, A16.
   ========================================================================= */
const SELF_AWARENESS = [
  { id: "A1", scale: "EI-A", text: "I can usually identify exactly what emotion I am feeling at any given moment — not just 'bad' or 'good' but specifically (anxious, jealous, proud, resentful, etc.).", indiaSpecific: false },
  { id: "A2", scale: "EI-A", text: "When I am stressed about exams or results, I can tell the difference between anxiety, disappointment, and shame — they feel physically different to me.", indiaSpecific: true },
  { id: "A3", scale: "EI-A", text: "I notice physical signs in my body (tight chest, shallow breathing, stomach knot) that tell me I am becoming emotionally overwhelmed before it becomes obvious to others.", indiaSpecific: false },
  { id: "A4", scale: "EI-A", reverse: true, text: "I often feel strong emotions but genuinely cannot explain what caused them.", indiaSpecific: false },
  { id: "A5", scale: "EI-A", text: "I am aware of how my mood in the morning affects the quality of my studying throughout the day.", indiaSpecific: true },
  { id: "A6", scale: "EI-A", text: "I have a rich vocabulary for emotions — I can describe what I feel with precision, not just 'stressed' or 'angry'.", indiaSpecific: false },
  { id: "A7", scale: "EI-A", text: "When a relative asks 'how are you?', I usually answer honestly about my emotional state rather than just saying 'I am fine'.", indiaSpecific: true },
  { id: "A8", scale: "EI-A", text: "I have noticed patterns in what triggers my emotional reactions — certain types of comments, situations, or people consistently affect me in specific ways.", indiaSpecific: false },
  { id: "A9", scale: "EI-A", reverse: true, text: "I often realise I was upset about something only after the emotion has already passed.", indiaSpecific: false },
  { id: "A10", scale: "EI-A", text: "I know which exam situations trigger my worst anxiety — it is not all exams, but specific types (oral exams, long papers, competitive mocks, etc.).", indiaSpecific: true },
  { id: "A11", scale: "EI-A", text: "I can sense when my parents or close family members are worried or stressed, even before they say anything.", indiaSpecific: true },
  { id: "A12", scale: "EI-A", text: "I am aware of how much the emotional atmosphere at home affects my ability to concentrate and study.", indiaSpecific: true },
  { id: "A13", scale: "EI-A", text: "I often feel guilty when I study — as if I am not doing enough, or am failing someone's expectations — even when I am working hard.", indiaSpecific: true },
  { id: "A14", scale: "EI-A", text: "I can distinguish between emotions I am genuinely feeling and emotions I think I 'should' feel in a given situation.", indiaSpecific: false },
  { id: "A15", scale: "EI-A", text: "I find it easy to reflect on why I reacted emotionally to a situation after it has passed.", indiaSpecific: false },
  { id: "A16", scale: "EI-A", reverse: true, text: "I sometimes suppress or ignore uncomfortable feelings until they become too strong to manage.", indiaSpecific: false },
  { id: "A17", scale: "EI-A", text: "I am honest with myself about my actual emotions, even when they are socially unacceptable (envy, resentment, fear of failure).", indiaSpecific: false },
  { id: "A18", scale: "EI-A", text: "After a difficult conversation with a teacher, parent, or peer, I can identify specifically which part of the exchange upset me.", indiaSpecific: true },
];

/* =========================================================================
   SECTION B — EMOTIONAL SELF-REGULATION (16 items) · scale EI-B
   Manage disruptive emotions, control impulses, maintain composure under
   pressure. Reverse: B2, B4, B13. Impulsivity Risk Index = avg of B2/B4/B13.
   ========================================================================= */
const SELF_REGULATION = [
  { id: "B1", scale: "EI-B", text: "When I receive a bad mark or a harsh comment, I manage to stay composed in the moment — even if I feel strong emotions internally.", indiaSpecific: true },
  { id: "B2", scale: "EI-B", reverse: true, impulsivity: true, text: "I sometimes say or do things in anger or frustration that I regret later.", indiaSpecific: false },
  { id: "B3", scale: "EI-B", text: "When I am in the middle of a difficult exam and feeling panicked, I have strategies to calm myself down rather than spiralling.", indiaSpecific: true },
  { id: "B4", scale: "EI-B", reverse: true, impulsivity: true, text: "I lose my temper or composure in ways that damage my relationships with teachers, classmates, or family members.", indiaSpecific: true },
  { id: "B5", scale: "EI-B", text: "When I catch myself thinking catastrophic thoughts ('I will fail, I will never succeed'), I can reframe them with more balanced thinking.", indiaSpecific: false },
  { id: "B6", scale: "EI-B", text: "I can delay a reaction — when something upsets me, I pause before responding rather than reacting immediately.", indiaSpecific: false },
  { id: "B7", scale: "EI-B", text: "I keep calm when things don't go as planned — I adapt rather than becoming anxious or angry.", indiaSpecific: false },
  { id: "B8", scale: "EI-B", text: "During a difficult JEE mock or board exam, I can set aside initial panic and refocus on the paper.", indiaSpecific: true },
  { id: "B9", scale: "EI-B", text: "If I make a careless mistake in an exam, I manage to move on to the next question rather than dwelling on it during the test.", indiaSpecific: true },
  { id: "B10", scale: "EI-B", text: "I use healthy strategies (breathing, brief exercise, music, prayer, journaling) to manage academic stress.", indiaSpecific: true },
  { id: "B11", scale: "EI-B", text: "When a family argument happens at home, I can emotionally 'step aside' and not let it derail my studying for the day.", indiaSpecific: true },
  { id: "B12", scale: "EI-B", text: "When a parent or relative says something hurtful about my academic performance, I can process it without it destroying my confidence for days.", indiaSpecific: true },
  { id: "B13", scale: "EI-B", reverse: true, impulsivity: true, text: "I have periods where I feel emotionally overwhelmed for days or weeks at a time, and struggle to function academically during these periods.", indiaSpecific: true },
  { id: "B14", scale: "EI-B", text: "I am able to separate my emotions from my academic decisions — I don't choose subjects or career paths primarily to avoid emotional discomfort.", indiaSpecific: true },
  { id: "B15", scale: "EI-B", text: "I can tolerate the sustained discomfort of not yet knowing my final result, career path, or future — without it becoming paralysing.", indiaSpecific: true },
  { id: "B16", scale: "EI-B", text: "I know which specific strategies work best for me when I am stressed (what calms me down, what helps me refocus).", indiaSpecific: false },
];

/* =========================================================================
   SECTION C — RESILIENCE, GRIT & GROWTH MINDSET (20 items)
   Sub-scales: Resilience(8), Grit(7), GrowthMindset(5). Reverse: C3, C5, C8(Grit), C16.
   The most India-critical section — resilience is the strongest moderator between
   aptitude and competitive-exam success over the 2-year preparation period.
   ========================================================================= */
const RESILIENCE = [
  { id: "C1", scale: "Resilience", text: "After getting a disappointing result in an exam or mock entrance test, I usually feel back to normal within 2–3 days.", indiaSpecific: true },
  { id: "C2", scale: "Resilience", text: "When I fail at something important to me (an exam, a competition, a project), my first instinct is to analyse what went wrong and try again differently.", indiaSpecific: false },
  { id: "C3", scale: "Resilience", reverse: true, text: "A single significant failure (failing a class, not clearing a competitive exam) has the potential to make me completely question my entire future.", indiaSpecific: true },
  { id: "C4", scale: "Resilience", text: "I have experienced a significant academic setback and recovered from it — my current situation is proof that I can bounce back.", indiaSpecific: true },
  { id: "C5", scale: "Resilience", reverse: true, text: "I tend to catastrophise failures — one bad result can make me feel like everything is collapsing.", indiaSpecific: false },
  { id: "C6", scale: "Grit", text: "I have been consistently working toward a specific long-term academic or career goal for at least one year, without giving up despite obstacles.", indiaSpecific: true },
  { id: "C7", scale: "Grit", text: "I finish whatever I begin — I don't abandon projects, study plans, or preparation midway, even when it gets difficult.", indiaSpecific: false },
  { id: "C8", scale: "Grit", reverse: true, text: "I have changed my 'ultimate goal' significantly in the last 2–3 years — what I am preparing for now is different from what I was working toward before.", indiaSpecific: true },
  { id: "C9", scale: "Grit", text: "I find it genuinely easy to maintain my focus on long-term goals when short-term distractions or temptations appear.", indiaSpecific: false },
  { id: "C10", scale: "Grit", text: "I am a hard worker — even when things don't come naturally to me, I am willing to outwork those with more talent.", indiaSpecific: false },
  { id: "C11", scale: "Grit", text: "Even after a particularly demoralising JEE or NEET mock result, I return to my study table the same day or the next morning and continue preparation.", indiaSpecific: true },
  { id: "C12", scale: "Grit", text: "I have maintained motivation through the JEE/NEET/UPSC/entrance exam preparation period (or similar sustained effort period) without a major motivation collapse.", indiaSpecific: true },
  { id: "C13", scale: "GrowthMindset", text: "I believe my intelligence and ability in any subject can grow significantly with the right effort and strategies — they are not fixed.", indiaSpecific: false },
  { id: "C14", scale: "GrowthMindset", text: "When someone is better than me at something (scoring higher marks, performing better in sports, excelling in arts), I am genuinely curious about how they did it — not primarily jealous.", indiaSpecific: false },
  { id: "C15", scale: "GrowthMindset", text: "I see critical feedback from teachers or parents as information that helps me improve, not as an attack on my character.", indiaSpecific: true },
  { id: "C16", scale: "GrowthMindset", reverse: true, text: "If a topic is very difficult, I tend to believe I am just 'not good at it' rather than believing I haven't found the right approach yet.", indiaSpecific: false },
  { id: "C17", scale: "GrowthMindset", text: "After a failure, my internal voice tends to say 'I can do better' more than 'I am not good enough'.", indiaSpecific: true },
  { id: "C18", scale: "Resilience", text: "I keep a mental or written record of my mistakes in exams and practice tests, and actively work on those specific areas.", indiaSpecific: false },
  { id: "C19", scale: "Resilience", text: "When people — family, friends, or teachers — doubt my abilities or question my career choices, I find a way to be motivated rather than discouraged by their doubt.", indiaSpecific: true },
  { id: "C20", scale: "Resilience", text: "During particularly difficult periods (exam season, result waiting, family stress), I find ways to maintain basic physical self-care — sleep, exercise, eating — even if reduced.", indiaSpecific: true },
];

/* =========================================================================
   SECTION D — EMPATHY & INTERPERSONAL SKILLS (18 items)
   Sub-scales: Empathy(6), CollEmpathy(3, collectivist), SocialSkill(7),
   SevaOrient(2, seva orientation). Reverse: D16 (empathic over-involvement flag).
   ========================================================================= */
const EMPATHY = [
  { id: "D1", scale: "Empathy", text: "I can usually tell how someone is feeling just from their tone of voice or facial expression — before they tell me.", indiaSpecific: false },
  { id: "D2", scale: "Empathy", text: "When I hear about someone going through a difficult situation (illness, financial crisis, family conflict), I naturally imagine what it feels like from their perspective.", indiaSpecific: false },
  { id: "D3", scale: "Empathy", text: "I find it relatively easy to understand why a person acts in ways I personally disagree with — I can see their reasoning.", indiaSpecific: false },
  { id: "D4", scale: "Empathy", text: "When someone near me is in pain or distress, I feel it as well — it is difficult to stay emotionally unaffected.", indiaSpecific: false },
  { id: "D5", scale: "Empathy", text: "I find genuine fulfilment in helping others work through a personal problem, even when it takes time and emotional energy from me.", indiaSpecific: false },
  { id: "D6", scale: "CollEmpathy", text: "The emotional needs and wellbeing of my family are as important to me as my own — I feel their struggles as my own.", indiaSpecific: true },
  { id: "D7", scale: "CollEmpathy", text: "I regularly check in on family members (grandparents, younger siblings) emotionally — not just practically.", indiaSpecific: true },
  { id: "D8", scale: "CollEmpathy", text: "When a classmate or friend is going through a difficult time, I actively reach out and make time for them, even during busy exam periods.", indiaSpecific: true },
  { id: "D9", scale: "SocialSkill", text: "I am good at explaining complex or sensitive topics to others in ways they can understand and receive without feeling judged.", indiaSpecific: false },
  { id: "D10", scale: "SocialSkill", text: "People often come to me when they have a personal problem — I am known as someone who listens well.", indiaSpecific: false },
  { id: "D11", scale: "SocialSkill", text: "I am able to say difficult things to people in a way that does not damage the relationship — I give hard feedback constructively.", indiaSpecific: false },
  { id: "D12", scale: "SocialSkill", text: "When there is a disagreement or conflict in a group I am part of, I naturally step in to help find a resolution.", indiaSpecific: false },
  { id: "D13", scale: "SocialSkill", text: "In arguments with my parents or friends, I try to understand their perspective before insisting on my own position.", indiaSpecific: true },
  { id: "D14", scale: "SocialSkill", text: "I can navigate disagreements with authority figures (teachers, parents, older relatives) without either capitulating or escalating.", indiaSpecific: true },
  { id: "D15", scale: "SocialSkill", text: "I am good at reading a room — I can sense when the atmosphere in a group has shifted and adjust my behaviour accordingly.", indiaSpecific: false },
  { id: "D16", scale: "Empathy", reverse: true, overInvolvement: true, text: "I sometimes become so absorbed in other people's emotional problems that it drains my own energy and affects my performance.", indiaSpecific: false },
  { id: "D17", scale: "SevaOrient", text: "I feel a genuine sense of satisfaction — not just obligation — when I contribute to someone else's wellbeing.", indiaSpecific: true },
  { id: "D18", scale: "SevaOrient", text: "I believe part of the purpose of a good career is to be of genuine service to others — not only personal benefit.", indiaSpecific: true },
];

/* =========================================================================
   SECTION E — SOCIAL & CULTURAL ADAPTABILITY (16 items)
   Sub-scales: UrbanRural(3), DiversityOpen(3), InterGen(2), LangAdapt(2),
   SocialFlex(2), TeamAdapt(2), GeoFlex(2). Reverse: E12 (SocialFlex).
   Low GeoFlex + Low UrbanRural (avg ≤2.0) → geographic filter modifier.
   ========================================================================= */
const ADAPTABILITY = [
  { id: "E1", scale: "UrbanRural", text: "I would be willing and able to live and work in a small town or rural area if my career required it — for at least 2–3 years.", indiaSpecific: true },
  { id: "E2", scale: "UrbanRural", text: "I find it genuinely interesting to spend time in places very different from where I grew up (different region, language, economic background).", indiaSpecific: true },
  { id: "E3", scale: "UrbanRural", text: "The idea of being posted to a different state — where I don't speak the local language — feels more exciting than threatening.", indiaSpecific: true },
  { id: "E4", scale: "DiversityOpen", text: "I am comfortable working closely with people from very different religious, caste, or economic backgrounds from my own.", indiaSpecific: true },
  { id: "E5", scale: "DiversityOpen", text: "I have meaningful friendships with people from different communities than my own — not just acquaintances.", indiaSpecific: true },
  { id: "E6", scale: "DiversityOpen", text: "I am comfortable in a workplace where the culture is very different from my home culture (e.g., fast-paced MNC culture if from a traditional family, or grassroots NGO culture if from an affluent background).", indiaSpecific: true },
  { id: "E7", scale: "InterGen", text: "I can communicate effectively with people much older than me (teachers, parents, senior colleagues) — adjusting my style without losing my perspective.", indiaSpecific: true },
  { id: "E8", scale: "InterGen", text: "I can communicate effectively with younger people (tutoring juniors, managing interns) without condescension.", indiaSpecific: false },
  { id: "E9", scale: "LangAdapt", text: "I am comfortable working and communicating in English in a professional setting, even if it is not my first language.", indiaSpecific: true },
  { id: "E10", scale: "LangAdapt", text: "I am comfortable switching between languages (Hindi ↔ English ↔ regional language) as different situations require.", indiaSpecific: true },
  { id: "E11", scale: "SocialFlex", text: "I can adjust my behaviour and communication style very quickly when entering a new social environment — I am a fast social learner.", indiaSpecific: false },
  { id: "E12", scale: "SocialFlex", reverse: true, text: "I feel uncomfortable and out of place in social settings where I don't know people or where the culture is unfamiliar.", indiaSpecific: false },
  { id: "E13", scale: "TeamAdapt", text: "I can work effectively in a team where people have very different working styles, priorities, and communication preferences.", indiaSpecific: false },
  { id: "E14", scale: "TeamAdapt", text: "I have managed or collaborated successfully with people who had a very different work ethic or approach from mine.", indiaSpecific: false },
  { id: "E15", scale: "GeoFlex", text: "I am open to relocating to a metro city (Delhi, Mumbai, Bengaluru) for a better career opportunity, even if it means being far from family.", indiaSpecific: true },
  { id: "E16", scale: "GeoFlex", text: "I would seriously consider working abroad (international organisation, MNC overseas, foreign scholarship) if the opportunity arose.", indiaSpecific: false },
];

/* =========================================================================
   SECTION F — SJT BLOCK 1: INDIAN EMOTIONAL SCENARIOS (8 scenarios)
   MO/LO. Competencies scored: Self-Awareness, Self-Regulation, Help-Seeking,
   Empathy, Assertiveness, Integrity, Resilience. moPoints 0–3.
   ========================================================================= */
const SJT_F = [
  {
    id: "SJT_T4_F1",
    title: "The Pre-Board Failure: Parents' Reaction",
    competencies: ["Resilience", "Emotional Regulation", "Assertiveness", "Help-Seeking"],
    context: "Class 12, 6 weeks before board exams",
    scenario:
      "Rahul has just received his Chemistry pre-board result: 41/100. His mother, on seeing the paper, says: 'Bete, I am so ashamed. Your cousin scored 88 in the same exam. What is wrong with you? At this rate you will ruin our family's name.' Rahul feels a wave of shame, then deep anger. His father is in the next room.",
    options: [
      { key: "A", text: "Stay silent, go to his room, and cry alone — he feels too humiliated to speak.", moPoints: 1, note: "Low EI-A — avoidance" },
      { key: "B", text: "Tell his mother firmly but calmly: 'I hear your disappointment. I am also upset. Comparing me to my cousin is not helping me improve — can we talk about what I should do next instead?'", moPoints: 3, note: "Self-Regulation + Assertiveness + Solution Focus" },
      { key: "C", text: "Lose his temper and shout back: 'You always compare me to everyone else! This is exactly why I can't study!'", moPoints: 0, note: "Low EI-B — impulsive escalation" },
      { key: "D", text: "Apologise to his mother, promise to do better, and immediately message his Chemistry teacher to ask for extra doubt-clearing time this week.", moPoints: 2, note: "Help-Seeking + appropriate emotional management" },
    ],
  },
  {
    id: "SJT_T4_F2",
    title: "The Uncooperative Group Project Partner",
    competencies: ["Social Skills", "Empathy", "Self-Regulation", "Leadership"],
    context: "Class 11–12 or college group project",
    scenario:
      "Priya is working on a group science project with two classmates. One member, Kiran, has not submitted his section for the third time. The deadline is tomorrow. The third member, Anjali, is furious and says: 'Let's just leave Kiran's name off the project and submit without him.' Priya knows Kiran has been going through a difficult family situation at home.",
    options: [
      { key: "A", text: "Agree with Anjali — Kiran has not contributed and the group shouldn't suffer because of him.", moPoints: 1, note: "Low Empathy" },
      { key: "B", text: "Call Kiran immediately, privately: 'I know things are tough at home. Is there any part of your section you can send by tonight? Even rough notes — I'll help format it. We don't want to submit without you.'", moPoints: 3, note: "Empathy + Social Skills + Creative problem-solving" },
      { key: "C", text: "Tell the teacher the whole situation and ask for an extension — transparency is the best policy.", moPoints: 2, note: "Transparency + Help-Seeking" },
      { key: "D", text: "Do Kiran's section herself to ensure the project is complete, without telling him or Anjali.", moPoints: 1, note: "Pragmatic but undermines Kiran's development and group trust" },
    ],
  },
  {
    id: "SJT_T4_F3",
    title: "Repeated JEE Mock Failures",
    competencies: ["Resilience", "Self-Regulation", "Help-Seeking", "Growth Mindset"],
    context: "Class 12, 4 months into JEE coaching preparation",
    scenario:
      "Arjun has taken 6 JEE mock tests. His highest score is 78/300 — well below the qualifying threshold. After each failure, he feels increasingly hopeless. His parents have invested ₹2 lakh in coaching and have relocated the family for his preparation. His friends in the same batch are scoring 150+. Today, after the 6th mock, he feels like giving up entirely.",
    options: [
      { key: "A", text: "Tell himself this is the end — clearly he is not smart enough for JEE. Begin quietly researching alternate options without telling his parents.", moPoints: 1, note: "Low Resilience + avoidance" },
      { key: "B", text: "Talk to his coaching teacher or counsellor and share honestly: 'I am scoring very low and feeling like I want to give up. Can you help me understand what is happening?'", moPoints: 3, note: "Help-Seeking + Honesty + Proactive; addresses the wellbeing crisis" },
      { key: "C", text: "Push through alone — studying even harder, sleeping less, and attempting the 7th mock in 3 days to prove to himself he can improve.", moPoints: 1, note: "High Grit but low Self-Awareness — ignoring distress signals" },
      { key: "D", text: "Have an honest conversation with his parents: 'I am struggling significantly. I want to continue preparing, but I need a strategy change and possibly some support. Can we talk?'", moPoints: 3, note: "Addresses family transparency" },
    ],
  },
  {
    id: "SJT_T4_F4",
    title: "Balancing Caregiving and Studies",
    competencies: ["Empathy", "Self-Regulation", "Assertiveness", "Help-Seeking"],
    context: "Class 11–12, joint family context",
    scenario:
      "Meena is in Class 12 (PCB, NEET target). Her maternal grandmother has been ill and her mother asks her to spend several hours each afternoon caring for her grandmother, as there is no one else available during those hours. Meena loves her grandmother and wants to help, but this is cutting significantly into her critical NEET preparation time. Her mother doesn't fully understand the exam pressure.",
    options: [
      { key: "A", text: "Comply fully with her mother's request — family duty comes first, and she will study late at night to compensate.", moPoints: 1, note: "High Family Duty but low Self-Advocacy" },
      { key: "B", text: "Refuse to help with caregiving until after the NEET exam — her future depends on this.", moPoints: 1, note: "High Autonomy but low Empathy; potentially damaging the relationship" },
      { key: "C", text: "Have an honest, gentle conversation with her mother: 'Dadi is my priority too. Can we figure out a schedule together — maybe I can help in the morning and study from 3–8 PM for NEET. Is there anyone else who can help on some days?'", moPoints: 3, note: "Assertiveness + Empathy + Collaborative problem-solving" },
      { key: "D", text: "Arrange for a neighbour or relative to help during critical study hours, while offering to take over fully on weekends.", moPoints: 2, note: "Creative solution that balances both needs" },
    ],
  },
  {
    id: "SJT_T4_F5",
    title: "Criticism from a Respected Teacher",
    competencies: ["Emotional Self-Awareness", "Self-Regulation", "Growth Mindset"],
    context: "Class 10–12 academic context",
    scenario:
      "Vikram's Physics teacher, in front of the class, returns his assignment and says: 'Vikram, this is your worst work in 2 years. I expected better. Your explanation of electromagnetic induction is completely wrong — it seems you haven't understood the concept at all.' Vikram is humiliated — he had stayed up late to complete it. He feels simultaneously ashamed, angry, and confused.",
    options: [
      { key: "A", text: "Say nothing. Sit quietly through the rest of class, then go home and avoid studying Physics for the next 3 days.", moPoints: 1, note: "Avoidance" },
      { key: "B", text: "Stay back after class and say to the teacher: 'Sir/Ma'am, I am upset about the feedback but I want to understand where I went wrong. Can you help me understand what the correct explanation is?'", moPoints: 3, note: "Growth Mindset + Self-Regulation + Assertive feedback-seeking" },
      { key: "C", text: "Protest in class: 'But Sir/Ma'am, I worked very hard on this!' — feeling that the teacher is being unfair.", moPoints: 1, note: "Valid emotion, but poorly timed and likely to worsen the relationship" },
      { key: "D", text: "Tell his parents and ask them to speak to the teacher about the public criticism — adults should intervene when teachers humiliate students.", moPoints: 2, note: "Context-dependent — valid if humiliation severe, but low EI as a first response" },
    ],
  },
  {
    id: "SJT_T4_F6",
    title: "Friend in Emotional Crisis",
    competencies: ["Empathy", "Social Skills", "Help-Seeking on behalf of others"],
    context: "Class 12 peer support context",
    scenario:
      "Rohit notices that his close friend and classmate, Sameer, has become increasingly withdrawn over 3 weeks. Sameer has stopped attending coaching classes, isn't responding to messages, and looked visibly distressed at school yesterday. Rohit heard from another classmate that Sameer mentioned 'not wanting to continue' after his latest NEET mock failure.",
    crisisOption: "A",
    options: [
      { key: "A", text: "Leave Sameer alone — he probably just needs space and will come around on his own.", moPoints: 0, note: "Crisis-detection: passive response when a friend may be in distress" },
      { key: "B", text: "Go directly to Sameer, privately: 'I've noticed you seem to be going through something really difficult. I'm here. Do you want to talk? I'm worried about you.'", moPoints: 3, note: "Critical first MO — direct, empathetic contact" },
      { key: "C", text: "Tell the class teacher: 'I'm worried about Sameer — I think he needs support beyond what I can give.' — without telling Sameer first.", moPoints: 2, note: "Valid (Transparency + Help-Seeking); B+C together = complete response" },
      { key: "D", text: "Tell Sameer's parents what Rohit has observed, so they can intervene.", moPoints: 2, note: "Valid — escalates appropriately" },
    ],
  },
  {
    id: "SJT_T4_F7",
    title: "Parental Pressure on Career Choice",
    competencies: ["Assertiveness", "Self-Regulation", "Empathy", "Family-Congruence"],
    context: "Class 11–12 stream / career decision",
    scenario:
      "Devika has strong Artistic interests and has secured admission to a prestigious Design foundation programme. Her parents — both in government service — are extremely disappointed. Her father says: 'Design is a hobby, not a career. Every educated person in our family has a professional degree. You are throwing your life away.' The conversation becomes heated.",
    options: [
      { key: "A", text: "Capitulate to avoid the conflict: enrol in Science, plan to shift later if possible.", moPoints: 1, note: "Low Self-Advocacy" },
      { key: "B", text: "Shout back: 'This is my life! You have no right to control my career!'", moPoints: 1, note: "Valid emotion but low EI-B" },
      { key: "C", text: "Take a pause, then say: 'Dad, I understand you're worried about my future. Can I take a week to gather information about Design careers — salary data, top colleges, alumni outcomes — and then can we have another conversation?'", moPoints: 3, note: "Self-Regulation + Assertiveness + Evidence-Based + Family respect" },
      { key: "D", text: "Ask a trusted relative, teacher, or counsellor to mediate a calm family conversation with evidence about Design career prospects.", moPoints: 2, note: "Creative bridge-building with external support" },
    ],
  },
  {
    id: "SJT_T4_F8",
    title: "Managing Exam-Day Anxiety",
    competencies: ["Self-Regulation", "Resilience", "Exam Strategy"],
    context: "Day of a major competitive entrance exam (NEET / JEE)",
    scenario:
      "Sneha is sitting the NEET exam. In the first 20 minutes, she encounters 3 Biology questions she finds very difficult — topics she had not fully revised. She feels her heart racing, her hands trembling slightly, and her mind beginning to spiral: 'I'm going to fail. Two years of preparation wasted. My parents will be devastated.' She has 2 hours and 40 minutes remaining.",
    options: [
      { key: "A", text: "Continue reading the difficult questions, trying harder and harder to answer them — not moving on until they are resolved.", moPoints: 1, note: "Low EI-B — fixating" },
      { key: "B", text: "Skip the 3 difficult questions, mark them for review, and move to Chemistry and Physics sections where she feels more confident. Return to Biology at the end if time permits.", moPoints: 2, note: "Strategic resource management" },
      { key: "C", text: "Take 60–90 seconds: close eyes, breathe deeply 5 times, tell herself 'These 3 questions don't determine my result — 180 questions do. I know more than I think I do.' Then continue with a systematic approach.", moPoints: 3, note: "Self-Regulation + Resilience + Strategic thinking" },
      { key: "D", text: "Accept that the exam is likely to go poorly and focus purely on minimising damage — answering what she knows and leaving the rest.", moPoints: 1, note: "Premature catastrophising — low Resilience" },
    ],
  },
];

/* =========================================================================
   SECTION G — SJT BLOCK 2: RESILIENCE & SOCIAL SCENARIOS (7 scenarios)
   Long-term resilience, social adaptation, cultural navigation, interpersonal.
   ========================================================================= */
const SJT_G = [
  {
    id: "SJT_T4_G1",
    title: "The Kota Hostel Experience",
    competencies: ["Resilience", "Self-Regulation", "Help-Seeking", "Social Adaptation"],
    context: "Class 11–12, coaching city hostel (Kota, Patna, Hyderabad)",
    scenario:
      "Kartik has left his family home in Chhattisgarh to study JEE in Kota. It is month 3. He is struggling: the competition is intense, he has no close friends yet, he misses his family deeply, and his mock scores are mediocre. He has not told his parents how he truly feels — they sacrificed significantly to send him here and he does not want to worry them.",
    options: [
      { key: "A", text: "Continue as he is — push through the loneliness and poor performance alone, showing only positivity to his parents on calls.", moPoints: 1, note: "Low Self-Awareness, high burnout risk" },
      { key: "B", text: "Tell his parents everything honestly in the next phone call: 'I am not coping well here. I'm lonely and my scores are not improving. I need us to talk about whether this is the right path.'", moPoints: 2, note: "Honesty + Family connection" },
      { key: "C", text: "Connect with his hostel counsellor or a senior student at the institute who has gone through the same experience and ask for specific strategies that helped them.", moPoints: 3, note: "Help-Seeking + Growth Mindset + Peer-resourcefulness" },
      { key: "D", text: "Come home for a week without telling his coaching centre — the break is what he needs, and he can catch up later.", moPoints: 1, note: "Avoidance with practical consequences" },
    ],
  },
  {
    id: "SJT_T4_G2",
    title: "Coping with NEET Repeat",
    competencies: ["Resilience", "Self-Awareness", "Pragmatism", "Growth Mindset"],
    context: "Post-NEET result — deciding whether to repeat",
    scenario:
      "Leela has just received her NEET result: 420/720 — not enough for a government MBBS seat. She is devastated. She has always wanted to be a doctor. Her options: (a) repeat NEET for 1 more year; (b) take a BDS or BAMS seat; (c) explore other healthcare careers (Physiotherapy, Nursing BSc, Biomedical Science). Her parents support her but are cautious about another year of uncertainty.",
    options: [
      { key: "A", text: "Repeat NEET immediately — she got 420 this year; with full preparation she can clear it next year.", moPoints: 2, note: "Valid if her analysis supports a repeat" },
      { key: "B", text: "Accept the BDS seat now — it's a respectable medical degree and she should not risk another year.", moPoints: 1, note: "Family-Congruent but premature" },
      { key: "C", text: "Take 2 weeks to genuinely reflect: talk to a NEET counsellor, speak with a BDS practitioner, research physiotherapy and biomedical science careers, and then make a data-informed decision — not an emotionally reactive one.", moPoints: 3, note: "Self-Awareness + Pragmatism + Evidence-Based Decision Making" },
      { key: "D", text: "Stop pursuing medicine entirely — the field is too competitive and clearly not meant for her.", moPoints: 0, note: "Low Resilience + Growth Mindset" },
    ],
  },
  {
    id: "SJT_T4_G3",
    title: "Managing Sibling Resentment",
    competencies: ["Empathy", "Self-Awareness", "Family Dynamics"],
    context: "Joint family context — sibling rivalry",
    scenario:
      "Sunaina is in Class 12 (Science) and receives significant family attention and financial investment. Her younger brother Rohan (Class 9) has been increasingly hostile toward her — making snide comments about her exam scores and refusing to talk to her. Sunaina realises Rohan probably feels neglected because all family resources and attention are focused on her.",
    options: [
      { key: "A", text: "Ignore Rohan's behaviour — exam preparation is what matters right now, and there's no time for this.", moPoints: 1, note: "Low Empathy" },
      { key: "B", text: "Make deliberate, small efforts to spend time with Rohan each week — ask about his interests, watch cricket together, help him with one subject — even 30 minutes — while continuing her preparation.", moPoints: 3, note: "Empathy + Relationship investment within constraint" },
      { key: "C", text: "Tell her parents about Rohan's hostility and ask them to manage it.", moPoints: 2, note: "Valid as a supplement to B" },
      { key: "D", text: "Confront Rohan directly: 'What is your problem? I'm under pressure and you're making it worse.'", moPoints: 1, note: "Low Social Skills" },
    ],
  },
  {
    id: "SJT_T4_G4",
    title: "New Environment Anxiety",
    competencies: ["Social Adaptability", "Self-Regulation", "Help-Seeking"],
    context: "First year of college / new city",
    scenario:
      "Ananya has moved from a small town in Rajasthan to Bengaluru for a B.Tech programme at a top private college. Everyone in her hostel seems more confident, speaks better English, and has lived in big cities their whole lives. After 2 weeks, she feels invisible, out of place, and significantly behind socially — even though she topped her district in JEE. She is beginning to avoid social situations.",
    options: [
      { key: "A", text: "Focus entirely on academics and avoid social situations — she came here to study, not to socialise.", moPoints: 1, note: "Low Social Adaptability" },
      { key: "B", text: "Join one college club or group related to her genuine interest — not to 'fit in' but to find one place where her competence shines.", moPoints: 3, note: "Builds genuine connection via competence" },
      { key: "C", text: "Reach out to her college's student counsellor or a senior from her region: 'I'm struggling to settle in. I'd appreciate any advice from someone who went through the same transition.'", moPoints: 2, note: "Help-seeking" },
      { key: "D", text: "Tell herself that this discomfort is temporary and normal — almost everyone feels it in the first month. Give herself 2 more months before drawing any conclusions about fit.", moPoints: 2, note: "Cognitive reframing — lowest-effort first step" },
    ],
  },
  {
    id: "SJT_T4_G5",
    title: "The Relative's Unsolicited Opinion",
    competencies: ["Self-Regulation", "Assertiveness", "Social Skills"],
    context: "Family social gathering — Diwali / wedding context",
    scenario:
      "Samyukta is interested in pursuing a career in Psychology. At a family Diwali gathering, an uncle (whose son is an IIT engineer) says loudly in front of everyone: 'Psychology? Psycho-logy? What will you do with that? Counsel madmen? In our family we produce engineers and doctors. Don't waste your life.' Several family members laugh. Samyukta feels humiliated and furious.",
    options: [
      { key: "A", text: "Say nothing — it is a family gathering and arguing with elders is disrespectful.", moPoints: 1, note: "Self-Regulation but zero Assertiveness" },
      { key: "B", text: "Calmly respond: 'Uncle, India has a severe shortage of mental health professionals — 1 psychiatrist for every 200,000 people. Psychology graduates work in hospitals, schools, HR, and tech companies. I'm happy to share more if you're interested.' Then smile and move the conversation on.", moPoints: 3, note: "Self-Regulation + Evidence-Based assertiveness + Social grace" },
      { key: "C", text: "Leave the gathering early — she doesn't need to stay in environments where she is belittled.", moPoints: 1, note: "Valid emotional boundary but high social cost" },
      { key: "D", text: "Later, send the uncle a message with data about Psychology career outcomes — after the event, away from the social pressure.", moPoints: 2, note: "Delayed, private response — avoids confrontation while still asserting" },
    ],
  },
  {
    id: "SJT_T4_G6",
    title: "When a Friend Overtakes You",
    competencies: ["Self-Awareness", "Empathy", "Growth Mindset", "Emotional Regulation"],
    context: "Academic peer comparison — competitive context",
    scenario:
      "Dev and his best friend Suhas have been preparing for IIT together since Class 9. Suhas has just scored 185/300 in a JEE mock — a significant improvement. Dev scored 112. Dev feels a sudden rush of emotions: happiness for Suhas, jealousy of Suhas, shame at his own performance, and a growing distance from his friend.",
    options: [
      { key: "A", text: "Congratulate Suhas warmly, then privately reflect: 'What specifically is Suhas doing that I'm not? Can I learn from his approach?'", moPoints: 3, note: "Self-Awareness + Growth Mindset + Healthy competitiveness + Social Skills" },
      { key: "B", text: "Avoid Suhas for a few days — it's too painful to be around someone performing so much better.", moPoints: 1, note: "Valid short-term self-protection but low long-term EI" },
      { key: "C", text: "Tell Suhas he got lucky and the paper was easy this time.", moPoints: 0, note: "Low Integrity + Social Skills" },
      { key: "D", text: "Accept that Suhas is more talented for JEE and reduce his own preparation intensity.", moPoints: 1, note: "Fixed Mindset" },
    ],
  },
  {
    id: "SJT_T4_G7",
    title: "Burnout During Extended Preparation",
    competencies: ["Self-Awareness", "Help-Seeking", "Resilience", "Self-Regulation"],
    context: "Class 12 / UPSC long preparation — burnout recognition",
    crisisOption: "A",
    scenario:
      "Nandita has been preparing intensively for UPSC for 18 months. In the last 3 weeks, she has noticed: she cannot focus for more than 15 minutes at a time, studying feels completely meaningless, she is sleeping 10+ hours but still feels exhausted, she snaps at her family over small things, and she has started questioning whether she even wants to be an IAS officer anymore. She is one month from the Prelims exam.",
    options: [
      { key: "A", text: "Push through — this is just a phase and the exam is close. She cannot afford to stop.", moPoints: 0, note: "Grit without Self-Awareness — the most common pattern in UPSC burnout; HIGH PRIORITY counsellor flag if selected as MO" },
      { key: "B", text: "Take 2–3 days completely off from UPSC preparation: sleep, eat well, spend time with family, go outside. Then reassess.", moPoints: 2, note: "A start" },
      { key: "C", text: "Speak to a doctor or counsellor immediately — what she is describing may be burnout, which requires real rest, not just willpower.", moPoints: 3, note: "Addresses the physical-emotional burnout" },
      { key: "D", text: "Tell her family what she is going through: 'I am not coping well. I need some support and perhaps a short break. Can we talk about this?'", moPoints: 3, note: "Addresses family support and transparency" },
    ],
  },
];

/* =========================================================================
   VALIDITY — LikeMe (social desirability, agree-keyed, 5 items) + crisis self-check.
   RII (response inconsistency) is computed from existing section responses.
   ========================================================================= */
const VALIDITY = [
  { id: "V1", validity: "LikeMe", agreeKeyed: true, text: "I never feel jealous or envious of others' success — I am always genuinely happy for them." },
  { id: "V2", validity: "LikeMe", agreeKeyed: true, text: "I never say anything unkind or insensitive, even when I am under extreme stress." },
  { id: "V3", validity: "LikeMe", agreeKeyed: true, text: "I always know exactly what I am feeling and why — I have never been confused about my own emotions." },
  { id: "V4", validity: "LikeMe", agreeKeyed: true, text: "I never let my emotions affect my behaviour with my family or friends." },
  { id: "V5", validity: "LikeMe", agreeKeyed: true, text: "I have never felt truly hopeless or defeated by a setback — I always bounce back immediately." },
];

// Crisis self-check (rendered last, special handling — agreement ≥4 surfaces help).
const CRISIS_SELF_CHECK = {
  id: "CRISIS1",
  text: "I have been feeling hopeless or like giving up on everything — not just exams — for more than 2 weeks.",
  threshold: 4,
};

// RII pairs (computed from existing items). Each pair: items that are semantic
// opposites; if both rated ≥4 (one already reverse-worded) → inconsistency.
const RII_PAIRS = [
  { a: "A4", b: "A1", note: "Cannot explain emotions vs can identify emotions precisely" },
  { a: "B13", b: "B3", note: "Periods of overwhelm vs strategies to stay calm" },
  { a: "C8", b: "C7", note: "Changed ultimate goal vs finish whatever I begin" },
  { a: "D16", b: "D5", note: "Over-involvement drain vs fulfilment in helping" },
];

/* =========================================================================
   SECTION METADATA — drives the client stepper.
   ========================================================================= */
const SECTIONS = [
  { id: "selfAwareness", code: "A", name: "Emotional Self-Awareness", construct: "Identify & understand emotions", timeMin: 5 },
  { id: "selfRegulation", code: "B", name: "Emotional Self-Regulation", construct: "Manage emotions under pressure", timeMin: 4 },
  { id: "resilience", code: "C", name: "Resilience, Grit & Mindset", construct: "Bounce-back, perseverance, growth", timeMin: 6 },
  { id: "empathy", code: "D", name: "Empathy & Interpersonal", construct: "Empathy, social skills, seva", timeMin: 5 },
  { id: "adaptability", code: "E", name: "Social & Cultural Adaptability", construct: "Diversity, mobility, language", timeMin: 4 },
  { id: "scenarios", code: "F·G", name: "Emotional Scenarios", construct: "Values-in-action under pressure", timeMin: 13 },
];

const EI_SCALES = ["EI-A", "EI-B", "Resilience", "Grit", "GrowthMindset", "Empathy", "CollEmpathy", "SocialSkill", "SevaOrient", "UrbanRural", "DiversityOpen", "InterGen", "LangAdapt", "SocialFlex", "TeamAdapt", "GeoFlex"];

module.exports = {
  SECTIONS,
  EI_SCALES,
  SELF_AWARENESS,
  SELF_REGULATION,
  RESILIENCE,
  EMPATHY,
  ADAPTABILITY,
  SJT_F,
  SJT_G,
  VALIDITY,
  CRISIS_SELF_CHECK,
  RII_PAIRS,
};
