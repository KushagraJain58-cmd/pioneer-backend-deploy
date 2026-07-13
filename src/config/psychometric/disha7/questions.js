/**
 * DISHA — Test 7 of 8
 * Leadership Potential, Management Aptitude, Teamwork Skills & Organisational Fit.
 *
 * Target: Classes 9–12, Ages 13–25. Duration 25–40 min. CCRE weight 15–20% of
 * the Master Combined Score.
 *
 * India's most celebrated career paths — IAS, IIM graduate, Army Officer,
 * Hospital Director, Family Business Patriarch, School Principal, Startup CEO —
 * all require different flavours of leadership. Test 7 measures not whether a
 * student WILL become a great leader (no test can do that), but whether their
 * current profile — how they think about authority, how they function in teams,
 * how they make decisions under pressure, what kind of power they are
 * comfortable holding and exercising — aligns with careers that require
 * leadership as a core competency.
 *
 * Critically: Test 7 does NOT privilege one leadership style. Authoritative
 * leadership (IAS/Army), servant leadership (NGO/social work), entrepreneurial
 * leadership (startups), distributed leadership (flat-org tech companies), and
 * quiet leadership (technical teams) are all measured and valued. Low scores on
 * the "prefer to follow / individual contributor" items are NOT negative — some
 * excellent careers (research, clinical medicine, deep technical work) do not
 * require formal leadership, and the report frames these as Expert/Individual
 * Achiever profiles, not deficits.
 *
 * Like the general numbered battery (Tests 1–6), Test 7 carries no class
 * restriction — it is available to all students, Classes 9–12.
 *
 * Section map
 *  A — Leadership Potential (LPI)                 18 Likert items
 *  B — Management & Organizational Skills         16 Likert items
 *  C — Teamwork & Team Role Preferences           16 Likert + 4 FC pairs (Belbin-adapted)
 *  D — Authority & Power Orientation              14 Likert items
 *  E — Ethical Leadership & Social Responsibility 14 Likert items
 *  F — Preferred Work Culture & Org Fit           16 Likert + 4 FC pairs
 *  G — Forced-Choice Leadership Preferences       12 FC pairs
 *  H — SJT Block 1: Indian Leadership Dilemmas     8 MO/LO scenarios
 *  I — SJT Block 2: Management & Ethical Scenarios 7 MO/LO scenarios
 *  V — Validity (embedded)                         6 LikeMe (SD) items + RII cross-item logic
 *
 * A note on Section V fidelity: the source review document prints exactly 6
 * LikeMe social-desirability items (§11.1) and defines the Response
 * Inconsistency Index (§11.2) as 5 cross-checks between EXISTING Section A–G
 * items — it introduces no new RII item text. The 6 LikeMe items are
 * transcribed verbatim below; the RII pairs are implemented as cross-item
 * consistency checks in scoring.js (referencing the real item IDs), exactly as
 * the source document specifies.
 */

/* =========================================================================
   SECTION A — LEADERSHIP POTENTIAL (18 items) → Leadership Potential Index
   Vision(4) · Influence(4) · DecisionMaking(4) · MotivOthers(4) ·
   Leadership_R(2, reverse — low scores are NOT negative for a consistent
   individual-contributor profile).
   Format: 1..5 Strongly Disagree → Strongly Agree.
   ========================================================================= */
const LEADERSHIP_POTENTIAL = [
  { id: "A1", scale: "Vision", indiaSpecific: false, text: "When I see a problem in my school, community, or team, I often imagine how things could be completely different and better — I think in terms of what 'could be', not just what 'is'." },
  { id: "A2", scale: "Vision", indiaSpecific: false, text: "I naturally think beyond the immediate task — I am aware of the larger direction, the bigger picture, the longer-term goal." },
  { id: "A3", scale: "Vision", indiaSpecific: false, text: "When I talk about something I care about, people around me often get excited or motivated by my perspective — I inspire energy in others." },
  { id: "A4", scale: "Vision", indiaSpecific: true, text: "I find it genuinely exciting to set an ambitious goal — even one that seems difficult or uncertain — and then work backwards to figure out how to reach it." },
  { id: "A5", scale: "Influence", indiaSpecific: false, text: "I am good at persuading others to see something from a different perspective — not by arguing but by appealing to what matters to them." },
  { id: "A6", scale: "Influence", indiaSpecific: false, text: "In group settings, my opinion tends to carry weight — people often look to me or reference what I have said." },
  { id: "A7", scale: "Influence", indiaSpecific: false, text: "I can motivate people around me to work harder or care more about a shared goal — not through authority but through inspiration." },
  { id: "A8", scale: "Influence", indiaSpecific: true, text: "I have successfully led a group, initiative, or event — even informally — and felt naturally in my element doing so." },
  { id: "A9", scale: "DecisionMaking", indiaSpecific: false, text: "When a group is stuck and cannot decide, I am usually the one who helps cut through the confusion and moves things forward." },
  { id: "A10", scale: "DecisionMaking", indiaSpecific: false, text: "I make decisions confidently under pressure — I don't freeze or over-deliberate when the situation needs a clear call." },
  { id: "A11", scale: "DecisionMaking", indiaSpecific: false, text: "I accept personal responsibility for decisions I make — if a decision I lead turns out to be wrong, I own it rather than deflecting." },
  { id: "A12", scale: "DecisionMaking", indiaSpecific: true, text: "I can make an unpopular decision — something the group may not like — when I genuinely believe it is the right thing to do." },
  { id: "A13", scale: "MotivOthers", indiaSpecific: false, text: "I take genuine pleasure in helping others develop — seeing a classmate, junior, or teammate grow because of something I shared with them is deeply satisfying." },
  { id: "A14", scale: "MotivOthers", indiaSpecific: false, text: "I am good at figuring out what motivates different people and adapting my approach to bring out the best in each person." },
  { id: "A15", scale: "MotivOthers", indiaSpecific: false, text: "I naturally notice when someone on a team is disengaged or struggling and take steps to bring them back into the effort." },
  { id: "A16", scale: "MotivOthers", indiaSpecific: true, text: "I have been approached by classmates, juniors, or peers for advice, guidance, or encouragement — people trust me to help them navigate challenges." },
  { id: "A17", scale: "Leadership_R", reverse: true, indiaSpecific: false, text: "I prefer to follow clear instructions from a leader rather than take initiative myself — I am more comfortable as a well-functioning team member than as the decision-maker." },
  { id: "A18", scale: "Leadership_R", reverse: true, indiaSpecific: false, text: "Leading and managing others feels draining rather than energising to me — I function better when I can focus on my own work." },
];

/* =========================================================================
   SECTION B — MANAGEMENT & ORGANIZATIONAL SKILLS (16 items)
   Planning(4) · Delegation(3) · Coordination(3) · Execution(3) ·
   Management_R(3, reverse).
   ========================================================================= */
const MANAGEMENT_SKILLS = [
  { id: "B1", scale: "Planning", indiaSpecific: false, text: "When working on a group project, I am usually the one who creates the structure — assigning tasks, setting timelines, defining deliverables." },
  { id: "B2", scale: "Planning", indiaSpecific: false, text: "I break complex goals into manageable steps and track progress systematically — not just for myself but for teams I am part of." },
  { id: "B3", scale: "Planning", indiaSpecific: false, text: "I anticipate what might go wrong in a plan and build contingencies — I am not just an optimistic planner." },
  { id: "B4", scale: "Planning", indiaSpecific: true, text: "I have successfully planned and executed an event, project, or initiative — in school, community, or otherwise — that required coordinating multiple people." },
  { id: "B5", scale: "Delegation", indiaSpecific: false, text: "I am comfortable delegating tasks to others rather than doing everything myself — I know that getting the best outcome often requires trusting others." },
  { id: "B6", scale: "Delegation", indiaSpecific: false, text: "I can judge which tasks to delegate and which to retain — I don't over-delegate or under-delegate." },
  { id: "B7", scale: "Delegation", indiaSpecific: false, text: "When I delegate, I give clear instructions and follow up appropriately — not micromanaging, but not disappearing either." },
  { id: "B8", scale: "Coordination", indiaSpecific: false, text: "I am effective at coordinating people with different roles, priorities, and working styles toward a common goal." },
  { id: "B9", scale: "Coordination", indiaSpecific: true, text: "I handle the 'administration' of a team effort well — keeping track of who is doing what, who needs support, what is falling behind." },
  { id: "B10", scale: "Coordination", indiaSpecific: true, text: "I manage upward and sideways well — communicating progress to authority figures (teachers, seniors, parents) without over-reporting or under-reporting." },
  { id: "B11", scale: "Execution", indiaSpecific: false, text: "I prioritise completion and results — when I lead something, it gets done." },
  { id: "B12", scale: "Execution", indiaSpecific: false, text: "I am comfortable holding others accountable for their commitments — I can give difficult feedback without damaging relationships." },
  { id: "B13", scale: "Execution", indiaSpecific: false, text: "I monitor quality, not just quantity — I care whether work was done well, not just whether it was submitted." },
  { id: "B14", scale: "Management_R", reverse: true, indiaSpecific: false, text: "I often feel overwhelmed when I have to manage multiple tasks or people simultaneously." },
  { id: "B15", scale: "Management_R", reverse: true, indiaSpecific: false, text: "I find it frustrating when I have to coordinate with others — I prefer to handle things myself." },
  { id: "B16", scale: "Management_R", reverse: true, indiaSpecific: true, text: "When things go wrong in a group I am part of, my instinct is to step back rather than step up." },
];

/* =========================================================================
   SECTION C — TEAMWORK & TEAM ROLE PREFERENCES (16 Likert + 4 FC pairs)
   Belbin-adapted 8 roles: Coordinator, Implementer, Shaper, Monitor-Evaluator,
   Teamworker, Resource Investigator, Plant (Innovator), Specialist.
   Likert scales: Teamwork(4) · Coordinator(2) · Shaper(2) · Implementer(2) ·
   Teamworker(2) · ResourceInvest(1) · Plant(1) · IndividualPref_R(2, reverse).
   ========================================================================= */
const TEAMWORK = [
  { id: "C1", scale: "Teamwork", indiaSpecific: false, text: "I find team work energising — I genuinely think the best results come from well-functioning teams, not solo efforts." },
  { id: "C2", scale: "Teamwork", indiaSpecific: false, text: "I actively contribute to team cohesion — not just task completion — by managing interpersonal dynamics and morale." },
  { id: "C3", scale: "Teamwork", indiaSpecific: false, text: "I am good at bringing out the best in diverse team members — people with different skills, personalities, and communication styles." },
  { id: "C4", scale: "Teamwork", indiaSpecific: true, text: "I am deeply trusted by team members — people rely on me not just for my contribution but for my loyalty and integrity within the group." },
  { id: "C5", scale: "Coordinator", role: "Coordinator", indiaSpecific: false, text: "In a group, I naturally take on the role of coordinating contributions — making sure the right person is doing the right thing." },
  { id: "C6", scale: "Coordinator", role: "Coordinator", indiaSpecific: false, text: "I am good at facilitating group decisions — getting diverse opinions, finding consensus, and moving toward action." },
  { id: "C7", scale: "Shaper", role: "Shaper", indiaSpecific: false, text: "I am the one who pushes the team when they are being too slow, complacent, or unfocused — I challenge the group to perform." },
  { id: "C8", scale: "Shaper", role: "Shaper", indiaSpecific: false, text: "I will openly challenge a bad idea in a group setting, even if it means some short-term friction." },
  { id: "C9", scale: "Implementer", role: "Implementer", indiaSpecific: false, text: "I am reliable — when I say I will do something for the team, it gets done, on time and to the standard expected." },
  { id: "C10", scale: "Implementer", role: "Implementer", indiaSpecific: false, text: "I prefer translating plans into clear tasks and executing them well over spending time in strategy and planning discussions." },
  { id: "C11", scale: "Teamworker", role: "Teamworker", indiaSpecific: false, text: "I prioritise team harmony — I actively work to prevent and resolve conflicts before they damage the group's performance." },
  { id: "C12", scale: "Teamworker", role: "Teamworker", indiaSpecific: true, text: "People come to me when there are interpersonal problems in a group — I am trusted to navigate them without taking sides." },
  { id: "C13", scale: "ResourceInvest", role: "ResourceInvestigator", indiaSpecific: false, text: "I energise teams by bringing in external ideas, contacts, and opportunities — I am the person who says 'I know someone who can help.'" },
  { id: "C14", scale: "Plant", role: "Plant", indiaSpecific: false, text: "My value in a team is often the unusual, creative, or unexpected idea that no one else has thought of." },
  { id: "C15", scale: "IndividualPref_R", reverse: true, indiaSpecific: false, text: "I prefer to work independently on well-defined tasks rather than in collaborative, ambiguous team environments." },
  { id: "C16", scale: "IndividualPref_R", reverse: true, indiaSpecific: false, text: "I find group decision-making processes inefficient — individual work produces better results in my experience." },
];

// Team-role forced-choice pairs — each option maps to Belbin roles (a role tally).
const TEAMWORK_FC = [
  { id: "CFC1", prompt: "In a school cultural festival team with 8 members and 2 weeks to plan, which role do you most naturally gravitate toward?",
    optionA: { roles: ["Coordinator", "Shaper"], text: "Taking charge of the overall plan — assigning roles to each person, building a timeline, and ensuring everyone knows what to do" },
    optionB: { roles: ["Plant"], text: "Generating the most creative concept for the event — the theme, the unexpected idea that will make this festival stand out" } },
  { id: "CFC2", prompt: "In a school cultural festival team with 8 members and 2 weeks to plan, which role do you most naturally gravitate toward?",
    optionA: { roles: ["Implementer"], text: "Making sure every task on the list is completed on time — chasing people, completing your own part first, keeping things moving" },
    optionB: { roles: ["Teamworker"], text: "Making sure the team is motivated and working well together — resolving conflicts, checking in on how people are feeling" } },
  { id: "CFC3", prompt: "In a school cultural festival team with 8 members and 2 weeks to plan, which role do you most naturally gravitate toward?",
    optionA: { roles: ["ResourceInvestigator"], text: "Identifying what resources and contacts outside the team can help — finding a sponsor, connecting to a performer you know, sourcing materials" },
    optionB: { roles: ["MonitorEvaluator"], text: "Critically evaluating all proposals and plans — identifying what won't work before the team commits to it" } },
  { id: "CFC4", prompt: "In a school cultural festival team with 8 members and 2 weeks to plan, which role do you most naturally gravitate toward?",
    optionA: { roles: ["Coordinator"], text: "Representing the team to authority figures (principal, teachers, sponsors) — communicating progress and negotiating resources" },
    optionB: { roles: ["Specialist"], text: "Deep specialisation — being the person most expert in one critical area (AV technology, stage design, budget accounting)" } },
];

/* =========================================================================
   SECTION D — AUTHORITY & POWER ORIENTATION (14 items)
   PowerDrive(3) · HierarchyComfort(4) · FlatPref(2) · EthicalPower(2) ·
   Assertiveness(1) · PowerDrive_R(2, reverse).
   ========================================================================= */
const POWER_ORIENTATION = [
  { id: "D1", scale: "PowerDrive", indiaSpecific: false, text: "I am genuinely motivated by the prospect of having authority — the power to make decisions that affect many people." },
  { id: "D2", scale: "PowerDrive", indiaSpecific: false, text: "I want my career to give me significant influence over important outcomes — not just influence over my own work, but over others' work and lives." },
  { id: "D3", scale: "PowerDrive", indiaSpecific: false, text: "The idea of being in charge — of an organisation, a department, a project — is genuinely appealing rather than burdensome." },
  { id: "D4", scale: "HierarchyComfort", indiaSpecific: true, text: "I respect and work well within hierarchical structures — I understand the importance of reporting lines, seniority, and organisational protocols." },
  { id: "D5", scale: "HierarchyComfort", indiaSpecific: true, text: "When I disagree with a senior person (teacher, boss, official), I express my view through appropriate channels rather than directly confronting or ignoring their authority." },
  { id: "D6", scale: "HierarchyComfort", indiaSpecific: true, text: "I understand and accept that earning authority takes time — I am patient with the process of working up through a hierarchy." },
  { id: "D7", scale: "HierarchyComfort", indiaSpecific: true, text: "I can work effectively within bureaucratic and institutional structures even when I think they are inefficient." },
  { id: "D8", scale: "FlatPref", indiaSpecific: false, text: "I work best in flat, non-hierarchical environments where authority comes from competence and contribution — not from title or seniority." },
  { id: "D9", scale: "FlatPref", indiaSpecific: false, text: "I find rigid hierarchies frustrating — I want direct access to decision-makers and fast feedback loops." },
  { id: "D10", scale: "EthicalPower", indiaSpecific: true, text: "I believe power is best used in service of others, not self-interest — leadership is a responsibility, not a reward." },
  { id: "D11", scale: "EthicalPower", indiaSpecific: true, text: "I would use authority to protect the less powerful — even if it meant conflict with those above me." },
  { id: "D12", scale: "Assertiveness", indiaSpecific: false, text: "I am comfortable questioning authority when I believe a rule or decision is genuinely wrong — respectfully but without hesitation." },
  { id: "D13", scale: "PowerDrive_R", reverse: true, indiaSpecific: false, text: "Having formal authority over others makes me uncomfortable — I prefer to lead through my expertise and relationship, not my title." },
  { id: "D14", scale: "PowerDrive_R", reverse: true, indiaSpecific: false, text: "I would rather be the best individual contributor on a team than the manager responsible for the team's overall performance." },
];

/* =========================================================================
   SECTION E — ETHICAL LEADERSHIP & SOCIAL RESPONSIBILITY (14 items)
   The most India-critical dimension. Integrity(3) · Accountability(3) ·
   ServiceOrient(2) · SocialResponsibility(2) · MoralCourage(2) ·
   Integrity_R(1, reverse — a 'moral pragmatism' probe) · IndiaEthics(1).
   ========================================================================= */
const ETHICAL_LEADERSHIP = [
  { id: "E1", scale: "Integrity", indiaSpecific: false, text: "I believe a person in authority has an absolute obligation to be honest, even when dishonesty would be easier or more personally advantageous." },
  { id: "E2", scale: "Integrity", indiaSpecific: true, text: "I would not misuse a position of authority for personal benefit — not even in small ways (using resources, bending rules slightly in my favour)." },
  { id: "E3", scale: "Integrity", indiaSpecific: false, text: "I hold myself to a higher ethical standard when I am in a position of responsibility or leadership." },
  { id: "E4", scale: "Accountability", indiaSpecific: false, text: "I believe leaders are fully accountable to the people they lead — their authority is earned through service, not granted by title." },
  { id: "E5", scale: "Accountability", indiaSpecific: false, text: "I am comfortable being publicly accountable for outcomes — even failures — when I am in a leadership role." },
  { id: "E6", scale: "Accountability", indiaSpecific: false, text: "I would rather lose a leadership position than compromise my integrity to retain it." },
  { id: "E7", scale: "ServiceOrient", indiaSpecific: false, text: "I see leadership primarily as a form of service — the leader's job is to enable others' success, not their own." },
  { id: "E8", scale: "ServiceOrient", indiaSpecific: true, text: "The most admirable leaders, in my view, are those who have made the greatest positive difference to the greatest number of people — not those who accumulated the most wealth or power." },
  { id: "E9", scale: "SocialResponsibility", indiaSpecific: true, text: "I believe people in authority have a special responsibility toward those with less power — the poor, marginalised, or vulnerable." },
  { id: "E10", scale: "SocialResponsibility", indiaSpecific: true, text: "I would use my influence or authority, when available, to speak up for those who cannot speak for themselves in institutional settings." },
  { id: "E11", scale: "MoralCourage", indiaSpecific: false, text: "I can make morally difficult decisions — when two values conflict (e.g., loyalty vs integrity, efficiency vs fairness) — without paralysis." },
  { id: "E12", scale: "MoralCourage", indiaSpecific: false, text: "I would report a colleague or superior who is doing something unethical, even if it meant personal risk or social cost." },
  { id: "E13", scale: "Integrity_R", reverse: true, indiaSpecific: false, text: "I believe the ends sometimes justify the means — bending rules is acceptable if the overall outcome is good." },
  { id: "E14", scale: "IndiaEthics", indiaSpecific: true, text: "In India's public sector, maintaining personal integrity while working within a corrupt system is extremely difficult but ultimately the only defensible path." },
];

/* =========================================================================
   SECTION F — PREFERRED WORK CULTURE & ORG FIT (16 Likert + 4 FC pairs)
   Corporate(3) · Govt(3) · Startup(3) · NGO(3) · FamilyBiz(2) · Dynamic(1) ·
   Stable(1).
   ========================================================================= */
const WORK_CULTURE = [
  { id: "F1", scale: "Corporate", indiaSpecific: false, text: "I am motivated by performance-linked rewards — bonus, promotion, equity — tied to measurable individual and team outcomes." },
  { id: "F2", scale: "Corporate", indiaSpecific: false, text: "I enjoy the structure and processes of a large, well-run organisation — clear KPIs, annual reviews, defined career ladders." },
  { id: "F3", scale: "Corporate", indiaSpecific: false, text: "I am comfortable in a globally-connected professional environment where English communication, formal presentation, and international norms apply." },
  { id: "F4", scale: "Govt", indiaSpecific: true, text: "I value the authority, stability, and societal impact that comes with a government or public sector position." },
  { id: "F5", scale: "Govt", indiaSpecific: true, text: "I am motivated by the ability to shape policy, implement schemes at scale, and serve the public — even if personal financial reward is lower." },
  { id: "F6", scale: "Govt", indiaSpecific: true, text: "I can work effectively within slow-moving bureaucratic systems and find ways to create impact within them." },
  { id: "F7", scale: "Startup", indiaSpecific: false, text: "I am excited by the pace, ambiguity, and resource-scarcity of a startup environment — where everyone does many things and learning is rapid." },
  { id: "F8", scale: "Startup", indiaSpecific: false, text: "I am comfortable with an organisation that is making things up as it goes — where the job description evolves every 3 months." },
  { id: "F9", scale: "Startup", indiaSpecific: false, text: "I want to be in an environment where my contribution is immediately visible and where I have real decision-making authority early in my career." },
  { id: "F10", scale: "NGO", indiaSpecific: true, text: "I want my workplace to be oriented toward social impact — the mission matters more than profits or prestige." },
  { id: "F11", scale: "NGO", indiaSpecific: false, text: "I am comfortable with below-market compensation if the work is genuinely meaningful and the organisation has a strong culture." },
  { id: "F12", scale: "NGO", indiaSpecific: true, text: "I am motivated by collective achievement and community-level change, not individual performance metrics." },
  { id: "F13", scale: "FamilyBiz", indiaSpecific: true, text: "I see leading and growing my family's business as a meaningful and exciting career — not as a fallback but as a genuine first choice." },
  { id: "F14", scale: "FamilyBiz", indiaSpecific: true, text: "I value the trust, context-depth, and long-term perspective that a family business environment provides." },
  { id: "F15", scale: "Dynamic", indiaSpecific: false, text: "I thrive in environments that change rapidly — new challenges, new contexts, shifting priorities." },
  { id: "F16", scale: "Stable", indiaSpecific: false, text: "I do my best work in stable, predictable environments where I can develop deep expertise over time." },
];

// Org-culture forced-choice pairs — each option maps to an org-fit archetype.
const WORK_CULTURE_FC = [
  { id: "FFC1", prompt: "When two organisational types conflict, which environment would you genuinely prefer to work in?",
    optionA: { key: "Corporate", text: "A well-established multinational corporation — clear structure, global scale, strong brand, performance-linked compensation" },
    optionB: { key: "Startup", text: "An early-stage startup — uncertain but exciting, fast-learning, immediate impact, undefined role boundaries" } },
  { id: "FFC2", prompt: "When two organisational types conflict, which environment would you genuinely prefer to work in?",
    optionA: { key: "Govt", text: "A government department or PSU — significant authority and societal impact, stable tenure, pension, national-scale work" },
    optionB: { key: "NGO", text: "An NGO or social enterprise — lower pay but strong mission alignment, community-level impact, values-driven culture" } },
  { id: "FFC3", prompt: "When two organisational types conflict, which environment would you genuinely prefer to work in?",
    optionA: { key: "Corporate", text: "A large Indian conglomerate (Tata, Infosys, Reliance) — scale, brand, structured career growth, institutional respect" },
    optionB: { key: "FamilyBiz", text: "A family business — trust-based, flexible, long-term context, higher early responsibility, succession possibilities" } },
  { id: "FFC4", prompt: "When two organisational types conflict, which environment would you genuinely prefer to work in?",
    optionA: { key: "IndianOrg", text: "A domestic Indian organisation (government, PSU, Indian corporate) where Indian cultural norms, relationships, and context dominate" },
    optionB: { key: "GlobalOrg", text: "A global or international organisation where international professional norms, cross-cultural teams, and global perspective are central" } },
];

/* =========================================================================
   SECTION G — FORCED-CHOICE LEADERSHIP PREFERENCES (12 pairs)
   Clarify fundamental orientation toward leadership, team roles, and authority,
   reducing social-desirability effects. G1 → lead_vs_follow signal;
   G6 → hierarchy_vs_flat signal.
   ========================================================================= */
const LEADERSHIP_FC = [
  { id: "G1", prompt: "Which appeals to you more?",
    optionA: { key: "Leader", text: "Leading a group toward an ambitious goal — bearing final responsibility for outcomes" },
    optionB: { key: "Contributor", text: "Being the best individual contributor on a team — excelling in your specific domain without people-management responsibility" } },
  { id: "G2", prompt: "Which appeals to you more?",
    optionA: { key: "Decisive", text: "Making a difficult unpopular decision alone and defending it firmly" },
    optionB: { key: "Consensual", text: "Reaching a consensus decision with the team, even if it takes longer and requires compromise" } },
  { id: "G3", prompt: "Which appeals to you more?",
    optionA: { key: "LargeOrg", text: "Working in a large organisation with significant resources, structure, and institutional prestige" },
    optionB: { key: "SmallOrg", text: "Working in a small, agile organisation where your impact is visible and your role is flexible" } },
  { id: "G4", prompt: "Which appeals to you more?",
    optionA: { key: "Lead", text: "Taking on a team leadership role in a school event — managing 10 people, coordinating tasks, being responsible for the outcome" },
    optionB: { key: "DeepSpecialist", text: "Taking the most technically challenging individual role in the same event — excelling at one thing deeply rather than managing many" } },
  { id: "G5", prompt: "Which appeals to you more?",
    optionA: { key: "FormalAuthority", text: "Having formal authority — a title, a rank, a clear mandate to direct others" },
    optionB: { key: "InformalInfluence", text: "Having influence without formal authority — leading through relationships, credibility, and expertise" } },
  { id: "G6", prompt: "Which appeals to you more?",
    optionA: { key: "Hierarchy", text: "Working in a hierarchical environment where seniority is clearly defined and respected" },
    optionB: { key: "Flat", text: "Working in a flat environment where authority comes from contribution and competence, regardless of age or tenure" } },
  { id: "G7", prompt: "Which appeals to you more?",
    optionA: { key: "LeadNow", text: "Taking on leadership now — even with incomplete experience — learning as you lead" },
    optionB: { key: "MasterFirst", text: "Building deep expertise first, then moving into leadership once you have real mastery to offer" } },
  { id: "G8", prompt: "Which appeals to you more?",
    optionA: { key: "Push", text: "Motivating a team through high standards and challenging expectations — pushing them to perform beyond what they thought possible" },
    optionB: { key: "Enable", text: "Supporting a team by removing obstacles, providing resources, and ensuring everyone can do their best work" } },
  { id: "G9", prompt: "Which appeals to you more?",
    optionA: { key: "VisibleLeader", text: "A role where you are publicly recognised as the leader — visible, accountable, responsible" },
    optionB: { key: "BehindScenes", text: "A role where you are the power behind the leader — advising, influencing, making things happen from a less visible position" } },
  { id: "G10", prompt: "Which appeals to you more?",
    optionA: { key: "BuildNew", text: "Building a team from scratch — recruiting, training, and shaping the culture of a new group" },
    optionB: { key: "InheritImprove", text: "Inheriting and improving an existing team — understanding what's already there, fixing what's broken, elevating performance" } },
  { id: "G11", prompt: "Which appeals to you more?",
    optionA: { key: "ManageUp", text: "Managing upward effectively — working with senior people, navigating institutional politics, influencing those with more authority" },
    optionB: { key: "ManageDown", text: "Managing downward effectively — developing your direct reports, building team capacity, being the best possible boss" } },
  { id: "G12", prompt: "Which appeals to you more?",
    optionA: { key: "Results", text: "Prioritising task completion and results — the team succeeds when outcomes are achieved" },
    optionB: { key: "People", text: "Prioritising team development and morale — the team succeeds when people grow and feel genuinely valued" } },
];

/* =========================================================================
   SECTION H — SJT BLOCK 1: INDIAN LEADERSHIP DILEMMAS (8 scenarios)
   Format: MO/LO. moPoints 0-3 (from the source scoring notes).
   ========================================================================= */
const SJT_H = [
  {
    id: "SJT_T7_H1", title: "The School Event Leadership Crisis",
    competencies: ["Decision-Making", "Team Leadership", "Crisis Management"],
    context: "Class 11–12 — school cultural event leadership",
    scenario: "Priya is leading a school cultural festival team of 12 students. Two days before the event, she discovers that the student responsible for all stage decoration has done almost nothing — they have been missing rehearsals and the task is 70% incomplete. The teacher-in-charge asks Priya: 'How are things going?' The event cannot be postponed.",
    options: [
      { key: "A", text: "Tell the teacher everything is fine — she doesn't want to create trouble or get the other student in trouble.", moPoints: 1, note: "Dishonesty under pressure" },
      { key: "B", text: "Tell the teacher the situation honestly: 'We have a significant problem with stage decoration. I have a plan to recover — can I have 3 additional volunteers and 2 extra hours tomorrow?'", moPoints: 3, note: "Highest MO — Transparency + Accountability + Resource-seeking" },
      { key: "C", text: "Redistribute the remaining decoration work among 4 volunteers tonight, personally take on the most critical pieces, and complete it without escalating to the teacher.", moPoints: 3, note: "Also strong MO — Execution + Resilience without blame" },
      { key: "D", text: "Confront the responsible student publicly in front of the team to motivate them to complete the work.", moPoints: 0, note: "Lowest — damaging to team morale" },
    ],
  },
  {
    id: "SJT_T7_H2", title: "The Unethical Instruction",
    competencies: ["Ethical Leadership", "Integrity", "Moral Courage"],
    context: "School or early workplace — authority conflict",
    scenario: "Rohan is the class representative. The school principal asks him to submit a document showing full student attendance at a compulsory government programme — but many students were absent. The principal says: 'Just mark everyone present — this is for the official report and there will be no consequences.' Rohan knows the attendance was genuinely poor.",
    options: [
      { key: "A", text: "Mark everyone present as instructed — the principal has authority and there will be no consequences.", moPoints: 0, note: "Lowest — Ethical failure" },
      { key: "B", text: "Refuse directly and say: 'I can't submit false records. What are the actual consequences of submitting accurate attendance?'", moPoints: 3, note: "Strong MO — honest and direct, but less likely to find a workable solution" },
      { key: "C", text: "Submit accurate attendance records and inform the principal what he has done, being prepared to explain why.", moPoints: 2, note: "Highest Integrity, lowest political intelligence" },
      { key: "D", text: "Ask to speak with the principal privately and say: 'I understand the pressure here. But I am not comfortable submitting a false document. Is there an alternative approach we can explore?'", moPoints: 3, note: "Highest MO — Ethical courage + Tactful + Solution-seeking" },
    ],
  },
  {
    id: "SJT_T7_H3", title: "The Underperforming Team Member",
    competencies: ["People Management", "Delegation", "Feedback Delivery"],
    context: "College group project or early workplace",
    scenario: "Arjun is leading a 5-person group project. One member, Kiran, has missed 2 meetings and submitted poor-quality work. The rest of the team is frustrated. The deadline is in 5 days. Kiran is known to be going through a difficult personal period.",
    options: [
      { key: "A", text: "Remove Kiran from the group and redistribute his tasks — the team's outcome matters more than one person's feelings.", moPoints: 1, note: "Valid in extreme circumstances but lacks empathy" },
      { key: "B", text: "Speak to Kiran privately, acknowledge the personal difficulty, and together figure out what portion of the remaining work Kiran can realistically contribute — hold him to that.", moPoints: 3, note: "Highest MO — Empathy + Accountability + Practical solution" },
      { key: "C", text: "Do nothing — the rest of the team will compensate, and it's too sensitive to confront Kiran directly.", moPoints: 0, note: "Lowest — avoidant management" },
      { key: "D", text: "Ask the group to vote on whether Kiran should be removed.", moPoints: 1, note: "Leadership abdication" },
    ],
  },
  {
    id: "SJT_T7_H4", title: "Inheriting a Family Business",
    competencies: ["Leadership Vision", "Change Management", "Authority & Hierarchy"],
    context: "Post-graduation — family business succession",
    scenario: "Vikram has joined his family's textile manufacturing business after graduation. His father has run it for 30 years with a top-down style. Most employees are long-tenured and resistant to change. Vikram can see significant inefficiencies — outdated machinery, no digital records, no performance tracking. His father is resistant to change: 'Our people have been loyal for 20 years — don't upset them.'",
    options: [
      { key: "A", text: "Respect his father's authority completely — Vikram is new and should earn trust before suggesting change.", moPoints: 1, note: "Low initiative" },
      { key: "B", text: "Introduce changes unilaterally while his father is unavailable — ask forgiveness later.", moPoints: 0, note: "Low ethics + low relationship intelligence" },
      { key: "C", text: "Identify 1–2 low-risk, high-visibility improvements that old employees will welcome (e.g., better canteen, digital leave tracking), implement them successfully, and use the goodwill to propose larger changes over the next 6–12 months.", moPoints: 3, note: "Highest MO — quick wins + trust-building" },
      { key: "D", text: "Request a formal conversation with his father and 2 senior employees: 'I'd like to understand what has worked and what you see as the most important challenges. Then I'd like to propose some ideas for your consideration.'", moPoints: 3, note: "Highest MO — structured engagement + respect for existing relationships" },
    ],
  },
  {
    id: "SJT_T7_H5", title: "The IAS Officer's First Posting Dilemma",
    competencies: ["Ethical Leadership", "Systemic Courage", "Social Responsibility"],
    context: "IAS aspiration — district posting context",
    scenario: "Meena has just been posted as Sub-Divisional Magistrate in a rural district. In her first week, she discovers that the local contractor who is building a government school has significantly substandard construction — the building will likely not survive 5 years. The contractor has a relationship with her superior, the District Collector. She has documented evidence of the substandard work.",
    options: [
      { key: "A", text: "Report the issue to the District Collector and wait for his response — hierarchy must be respected.", moPoints: 1, note: "Bureaucratically correct but passive" },
      { key: "B", text: "Document the evidence thoroughly and escalate to the next level authority (Commissioner/State Government) through official channels — her obligation is to the public, not to protect her superior.", moPoints: 3, note: "Highest MO — Ethical Leadership + Institutional courage + Systematic approach" },
      { key: "C", text: "Speak to the contractor directly and give them an ultimatum: fix the construction to standard within 30 days or face formal action.", moPoints: 2, note: "Also valid — direct accountability before escalating" },
      { key: "D", text: "Do nothing for now — in her first week, confronting a senior's contractor relationship would damage her ability to function in the district.", moPoints: 0, note: "Ethical failure — the most common choice in actual Indian bureaucracy, which the scenario is designed to surface" },
    ],
  },
  {
    id: "SJT_T7_H6", title: "The Corporate Manager's Ethical Conflict",
    competencies: ["Ethical Leadership", "Stakeholder Management", "Moral Courage"],
    context: "Corporate management — mid-level manager context",
    scenario: "Deepika is a marketing manager at an FMCG company. Her sales director instructs her to approve a campaign with misleading nutritional claims for a children's food product. The director says: 'Legal has approved it. It's technically within the guidelines. We need to hit Q3 targets.' Deepika believes the claims will mislead parents.",
    options: [
      { key: "A", text: "Approve the campaign — legal has cleared it and it's her manager's call, not hers.", moPoints: 0, note: "Ethical failure" },
      { key: "B", text: "Refuse to approve the campaign, send a written objection documenting her ethical concern, and escalate to the CMO if the director insists.", moPoints: 3, note: "Highest MO — Ethical Leadership + Institutional courage + Written accountability trail" },
      { key: "C", text: "Ask for a meeting with the legal team to understand specifically what the approval covers — then decide based on what she learns.", moPoints: 2, note: "Also valid if genuinely seeking information" },
      { key: "D", text: "Quietly approve the campaign but forward the details to a consumer watchdog organisation.", moPoints: 1, note: "Low Integrity + potentially damaging consequences" },
    ],
  },
  {
    id: "SJT_T7_H7", title: "The Coaching Group Leadership Conflict",
    competencies: ["Conflict Resolution", "Team Leadership", "Emotional Intelligence"],
    context: "JEE/NEET coaching group — student leadership context",
    scenario: "Kabir is the informal leader of a 6-student JEE study group. Two members, Ananya and Ravi, are in constant conflict — competing over who explains concepts better, interrupting each other, creating tension that is affecting everyone's focus. After 2 weeks of this, the group is becoming dysfunctional.",
    options: [
      { key: "A", text: "Ignore the conflict — it will resolve itself when exam pressure increases.", moPoints: 1, note: "Avoidant" },
      { key: "B", text: "Have a direct, private conversation with both Ananya and Ravi separately: acknowledge their competence, explain the group impact, and propose a new structure (each leads specific topic areas) that channels their competition constructively.", moPoints: 3, note: "Highest MO — Conflict resolution + Empathy + Creative structural solution" },
      { key: "C", text: "Ask the group to vote on whether to exclude one or both members.", moPoints: 0, note: "Destructive group dynamics" },
      { key: "D", text: "Set explicit group norms in a joint meeting: 'Here are the behaviours that are and aren't acceptable in our group. Everyone agrees or we don't continue.' Address both students without naming them.", moPoints: 3, note: "Also high MO — group norm-setting" },
    ],
  },
  {
    id: "SJT_T7_H8", title: "Leading Social Change in Your Community",
    competencies: ["Social Leadership", "Vision", "Community Mobilisation"],
    context: "Class 11–12 or young adult — community leadership",
    scenario: "Shreya lives in a residential colony where a vacant government plot has been used as an illegal waste dump for years despite multiple complaints. She has tried complaining officially — no response. She has 25 neighbours willing to act. The municipal councillor is unresponsive.",
    options: [
      { key: "A", text: "Give up — government apathy is too entrenched for one person to change.", moPoints: 0, note: "Lowest — zero Social Leadership" },
      { key: "B", text: "Organise the 25 willing neighbours: a peaceful, documented clean-up of the dump combined with a social media campaign tagging the municipal councillor, the local MLA, and state government accounts — creating accountability through visibility.", moPoints: 3, note: "Highest MO — community mobilisation + visibility" },
      { key: "C", text: "Organise a physical protest outside the councillor's office with the 25 neighbours.", moPoints: 2, note: "Valid but escalatory" },
      { key: "D", text: "Find a legal way to force the issue: file an RTI about the waste management budget for the area, then use the response to publicly hold officials accountable.", moPoints: 3, note: "Highest MO — institutional accountability through information rights" },
    ],
  },
];

/* =========================================================================
   SECTION I — SJT BLOCK 2: MANAGEMENT & ETHICAL SCENARIOS (7 scenarios)
   ========================================================================= */
const SJT_I = [
  {
    id: "SJT_T7_I1", title: "Managing Upward: Disagreeing with a Superior",
    competencies: ["Assertiveness", "Hierarchy Navigation", "Influence Without Authority"],
    context: "Corporate or government context — junior professional",
    scenario: "Rajan (25, junior marketing executive at an Indian FMCG firm) believes his senior manager's campaign strategy for a new product launch is significantly flawed — he has data that predicts it will fail in the target market. His manager is senior, experienced, and has already presented the plan to the CEO. The launch is in 4 weeks.",
    options: [
      { key: "A", text: "Stay silent — he is too junior to challenge a senior manager's plan, and the consequences for speaking up could damage his career.", moPoints: 1, note: "Zero initiative" },
      { key: "B", text: "Prepare a 1-page evidence brief showing the market data that contradicts the strategy, and request a private 20-minute meeting with his manager: 'I'd like to share some data that might be worth considering before launch.'", moPoints: 3, note: "Highest MO — Evidence-based assertiveness + Hierarchy respect + Private channel" },
      { key: "C", text: "Send an email to the CEO directly, bypassing his manager — the stakes are too high for hierarchical discretion.", moPoints: 1, note: "Hierarchy bypass without cause — risks relationship and career" },
      { key: "D", text: "Raise the concern in the next team meeting openly — transparency is the best policy.", moPoints: 2, note: "Depends on team culture; generally lower EI than B" },
    ],
  },
  {
    id: "SJT_T7_I2", title: "The Performance Review Conversation",
    competencies: ["People Management", "Feedback", "Coaching"],
    context: "Team leader context — managing a direct report",
    scenario: "Nandita manages a team of 3 at a small NGO. One team member, Shyam, is technically competent but frequently misses internal deadlines, causing cascading delays for the whole team. It's the quarterly review. Shyam has personal health challenges that Nandita is aware of.",
    options: [
      { key: "A", text: "Give Shyam a positive review to avoid adding stress during a difficult health period.", moPoints: 1, note: "Kind intent but does not serve Shyam's professional development" },
      { key: "B", text: "Be honest in the review: 'Your technical work is strong and valued. The missed deadlines are creating real problems for the team. Here is what I need from you in the next quarter — and I want to understand what support would help you meet these expectations.'", moPoints: 3, note: "Highest MO — Honest + Empathetic + Action-oriented feedback" },
      { key: "C", text: "Ask Shyam to manage their own workload differently without providing specific guidance — they are experienced enough to figure it out.", moPoints: 1, note: "Low management quality — abdication of coaching responsibility" },
      { key: "D", text: "Report the deadline issue to the NGO director without discussing it with Shyam first.", moPoints: 1, note: "Escalation before direct conversation — low EI" },
    ],
  },
  {
    id: "SJT_T7_I3", title: "The Decision Under Uncertainty",
    competencies: ["Decision-Making", "Risk Management", "Leadership Courage"],
    context: "Senior student or young leader — group decision required now",
    scenario: "During a college trekking trip, the group of 15 students is 6 km from base camp. Weather has deteriorated significantly and the student leader (Vivek) estimates there's a 40% chance of heavy rain in the next 2 hours, which would make the trail impassable. The official guide is unavailable. The group is split: 8 want to head back now, 7 want to continue to the viewpoint (30 min away). Vivek must decide.",
    options: [
      { key: "A", text: "Take a group vote — democratic decision-making is fair.", moPoints: 1, note: "Leadership abdication in a safety context" },
      { key: "B", text: "Decide unilaterally: turn back immediately. Safety over preference, and when there is uncertainty, the conservative option is the right call.", moPoints: 3, note: "Highest MO — Leadership Courage + Safety-first decision under uncertainty + Unambiguous direction" },
      { key: "C", text: "Split the group: those who want to continue can go with 2 experienced trekkers; the rest head back with Vivek.", moPoints: 0, note: "Operational disaster — splitting an inexperienced group" },
      { key: "D", text: "Continue to the viewpoint — 30 minutes is manageable, and the weather may not worsen. You don't want to disappoint the group.", moPoints: 0, note: "Risk-taking that dismisses objective safety signals" },
    ],
  },
  {
    id: "SJT_T7_I4", title: "The Star Employee Who Behaves Badly",
    competencies: ["Ethical Leadership", "Team Culture", "Accountability"],
    context: "Team management context",
    scenario: "Ananya manages a sales team of 8 at a fintech startup. Her top performer, Dev, consistently hits 150% of target. However, multiple team members have separately complained that Dev is rude, dismissive, and takes credit for others' ideas. The CEO loves Dev and has publicly praised him. Ananya must address this.",
    options: [
      { key: "A", text: "Do nothing — Dev is the top performer and the CEO values him. Addressing this will cause unnecessary friction.", moPoints: 0, note: "Ethical failure — condoning toxic behaviour" },
      { key: "B", text: "Have a direct, private conversation with Dev: share the specific feedback, make clear that the behaviour is not acceptable regardless of performance, and set clear expectations for change — with consequences if it continues.", moPoints: 3, note: "Highest MO — Ethical Leadership + Direct accountability + Culture protection" },
      { key: "C", text: "Quietly document the complaints and wait until Dev underperforms before acting.", moPoints: 1, note: "Passive and eventually dishonest" },
      { key: "D", text: "Raise it with the CEO first — get support before confronting Dev directly.", moPoints: 2, note: "Valid only if Ananya lacks authority; generally signals low leadership confidence" },
    ],
  },
  {
    id: "SJT_T7_I5", title: "The Resource Allocation Dilemma",
    competencies: ["Management Planning", "Fairness", "Stakeholder Management"],
    context: "Student organisation leadership — budget allocation",
    scenario: "Rahul heads his college's student body and has ₹1.5 lakh allocated for annual activities. Three departments have submitted budgets totalling ₹3.2 lakh. The three department heads are all personal friends of his. He must decide how to allocate the available ₹1.5 lakh.",
    options: [
      { key: "A", text: "Divide equally between the three departments — fairness through equal distribution.", moPoints: 1, note: "Equitable but not strategic — doesn't serve students best" },
      { key: "B", text: "Allocate based on potential impact, past execution quality, and stated student need — with a transparent rationale shared with all three department heads before the decision is finalised.", moPoints: 3, note: "Highest MO — Evidence-based + Transparent + Accountable" },
      { key: "C", text: "Favour the department he personally believes in most — he is the leader, and leaders must have a vision.", moPoints: 0, note: "Biased decision-making" },
      { key: "D", text: "Ask a neutral student committee to make the recommendation, then endorse it — removing himself from the decision to protect friendships.", moPoints: 2, note: "Also valid — governance through due process" },
    ],
  },
  {
    id: "SJT_T7_I6", title: "The Startup Founder's First Hire",
    competencies: ["Entrepreneurial Leadership", "Team Building", "Execution"],
    context: "Young entrepreneur — first team hire",
    scenario: "Pooja has started an EdTech venture and has ₹50,000 to offer as a first hire's monthly salary — below market rate. She has two candidates: (A) A highly skilled developer who wants ₹70,000 and is lukewarm about the mission, and (B) A less experienced developer who is deeply passionate about the mission, available for ₹40,000, and is a fast learner.",
    options: [
      { key: "A", text: "Hire Candidate A — skill is everything in an early-stage product.", moPoints: 1, note: "Valid if the technical gap is truly critical" },
      { key: "B", text: "Hire Candidate B — mission alignment and learning agility matter more than current skill in an early startup.", moPoints: 3, note: "Generally highest MO for early-stage startup — mission alignment + agility > skill" },
      { key: "C", text: "Negotiate with Candidate A: offer ₹50,000 now + equity + 3-month performance-linked raise to ₹70,000 if targets are met.", moPoints: 2, note: "Strong for risk-managed hiring" },
      { key: "D", text: "Don't hire yet — the salary constraint makes both options suboptimal. Bootstrap the product further alone.", moPoints: 1, note: "Too risk-averse — delays team-building momentum" },
    ],
  },
  {
    id: "SJT_T7_I7", title: "The Village Sarpanch's Decision",
    competencies: ["Community Leadership", "Social Responsibility", "Ethical Power"],
    context: "IAS aspiration or community leadership context",
    scenario: "A newly elected female Sarpanch in a village in rural Rajasthan faces her first major decision: the village development committee (dominated by older male members) has voted to allocate the annual MGNREGA development budget to a road that primarily benefits wealthier landowners. She believes the priority should be a community storage tank that would benefit all households, especially women and marginalised families.",
    options: [
      { key: "A", text: "Implement the committee's decision — the democratic process has spoken.", moPoints: 1, note: "Lowest Social Leadership score" },
      { key: "B", text: "Use her authority as Sarpanch to table the water tank proposal at the next gram sabha (village assembly), present the data on how each project benefits different populations, and allow the full community — not just the committee — to vote.", moPoints: 3, note: "Highest MO — Democratic legitimacy + Inclusion + Social accountability + Process integrity" },
      { key: "C", text: "Unilaterally redirect the budget to the water tank project — she has the authority and the moral clarity.", moPoints: 1, note: "Uses authority correctly but skips democratic accountability" },
      { key: "D", text: "Accept the road decision but submit a separate application to the District Collector's office for water tank funds — pursue both simultaneously.", moPoints: 3, note: "Also strong MO — pragmatic parallel action" },
    ],
  },
];

/* =========================================================================
   VALIDITY (embedded) — 6 LikeMe social-desirability items (verbatim from
   the source document §11.1). RII cross-item consistency logic lives in
   scoring.js (§11.2 defines it over existing A–G items, not new ones).
   ========================================================================= */
const VALIDITY = [
  { id: "V1", validity: "LikeMe", agreeKeyed: true, text: "I always make the right decisions under pressure — I have never regretted a decision I made as a leader." },
  { id: "V2", validity: "LikeMe", agreeKeyed: true, text: "I never feel intimidated by authority figures — I always speak up confidently regardless of the seniority of the person." },
  { id: "V3", validity: "LikeMe", agreeKeyed: true, text: "I have never favoured a friend over a more deserving colleague or team member in any group I've led." },
  { id: "V4", validity: "LikeMe", agreeKeyed: true, text: "I have always maintained my ethical standards as a leader — I have never compromised even slightly." },
  { id: "V5", validity: "LikeMe", agreeKeyed: true, text: "People always follow my lead when I take charge — I have never encountered meaningful resistance to my leadership." },
  { id: "V6", validity: "LikeMe", agreeKeyed: true, text: "I am equally comfortable and effective in all team roles — leader, follower, specialist, coordinator." },
];

/* =========================================================================
   SECTION METADATA
   ========================================================================= */
const SECTIONS = [
  { id: "leadershipPotential", code: "A", name: "Leadership Potential", timeMin: 5 },
  { id: "managementSkills", code: "B", name: "Management & Organisation", timeMin: 4 },
  { id: "teamwork", code: "C", name: "Teamwork & Team Roles", timeMin: 4 },
  { id: "powerOrientation", code: "D", name: "Authority & Power Orientation", timeMin: 4 },
  { id: "ethicalLeadership", code: "E", name: "Ethical Leadership", timeMin: 4 },
  { id: "workCulture", code: "F", name: "Preferred Work Culture & Org Fit", timeMin: 4 },
  { id: "leadershipFc", code: "G", name: "Leadership Preferences", timeMin: 3 },
  { id: "scenarios", code: "H·I", name: "Leadership & Management Scenarios", timeMin: 12 },
];

module.exports = {
  SECTIONS,
  LEADERSHIP_POTENTIAL,
  MANAGEMENT_SKILLS,
  TEAMWORK,
  TEAMWORK_FC,
  POWER_ORIENTATION,
  ETHICAL_LEADERSHIP,
  WORK_CULTURE,
  WORK_CULTURE_FC,
  LEADERSHIP_FC,
  SJT_H,
  SJT_I,
  VALIDITY,
};
