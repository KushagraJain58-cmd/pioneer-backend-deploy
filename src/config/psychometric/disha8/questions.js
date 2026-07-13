/**
 * DISHA — Test 8 of 8 (Capstone)
 * Long-term Life Values, Work-Life Balance, Lifestyle Goals & Career
 * Satisfaction Predictors.
 *
 * Target: Classes 9–12, Ages 13–25. Duration 25–35 min. CCRE weight 8% base,
 * but functions as a MODERATOR on the entire Master Combined Report — it can
 * boost OR reduce any career recommendation from Tests 1–7 based on lifestyle
 * compatibility, not just add a score.
 *
 * Tests 1–7 measure who the student IS — cognitive abilities, academic
 * performance, interests, values, emotional intelligence, adaptability,
 * creativity, and leadership. Test 8 asks the question all the others have
 * implicitly been building toward: what kind of life does this person want to
 * live? This is the most important and most frequently skipped question in
 * Indian career counselling — the system pushes students toward careers based
 * on marks, entrance ranks, and parental expectations without ever
 * systematically asking whether the life that career produces is one the
 * student actually wants.
 *
 * Test 8 targets five specific career-regret patterns common in India:
 * prestige-vs-meaning mismatch, family-vs-career conflict, money-vs-
 * satisfaction mismatch, geographic displacement regret, and social-
 * contribution regret. It is deliberately reflective in tone rather than
 * diagnostic — several items have no "better" answer.
 *
 * Section map
 *  A — Core Life Values Inventory              20 Likert items + top-5 ranking
 *      (10 value dimensions, Schwartz-adapted + 3 India-specific: Dharma, Seva, Status)
 *  B — Work-Life Balance Preferences            16 Likert + 4 FC trade-off pairs
 *  C — Lifestyle Goals & Life Design            18 Likert + 5 open-ended (counsellor use)
 *  D — Financial Risk Tolerance & Money Mindset 14 Likert + 3 FC income-scenario pairs
 *  E — Social Contribution vs Personal Success  14 Likert items
 *  F — Long-term Satisfaction Predictors        12 Likert items → SPI
 *  G — Future Life Projection Scenarios          5 guided-imagination scenarios (sliders + GP-5 open text)
 *  H — SJTs: Indian Life Design Dilemmas        10 scenarios, scored against the student's OWN T8 values profile
 *  V — Validity (embedded)                       5 LikeMe (SD) items + values-consistency cross-checks
 *
 * Like Tests 1–7, Test 8 carries no class restriction — available to all
 * students, Classes 9–12 (though its depth is intended to matter most from
 * Class 11 onward per the source document's administration guidelines).
 *
 * A note on Lifestyle Compatibility Rating (LCR) scope: the source document's
 * §11.2 defines an LCR algorithm that cross-references a live career database
 * (career_wlb_typical, career_income_10yr, career_family_compat, etc.) that
 * does not exist in this codebase — the same "external database" scope gap
 * already documented in the Class-10/Class-12 and Test-6 implementations.
 * This implementation produces the complete, real T8 profile (Life Values,
 * WLB Index, Lifestyle Profile, Money Profile, Purpose Orientation, SPI) that
 * the LCR would consume, and computes the T8-only Career Regret risk factors
 * that don't require cross-referencing an external career database (Lifestyle
 * Mismatch, Values consistency flags). Cross-test regret factors that need
 * T1/T2/T5 data (Hidden Interest Suppression, Decision Autonomy Deficit) are
 * documented but require Master Report integration beyond a standalone test.
 */

/* =========================================================================
   SECTION A — CORE LIFE VALUES INVENTORY (20 items, 10 dimensions × 2)
   Format: 1..5 Strongly Disagree → Strongly Agree.
   Family · Achievement · Security · Autonomy · Seva · Status · Adventure ·
   Spirituality · Intellectual · Dharma.
   Instruction: "Rate how important each of the following is to you in your
   life — not what you think you should value, but what genuinely matters
   most to you personally."
   ========================================================================= */
const LIFE_VALUES = [
  { id: "A1", scale: "Family", indiaSpecific: true, text: "Having a close, harmonious family — being present for my parents, spouse, children, and extended family — is among the most important things in my life." },
  { id: "A2", scale: "Family", indiaSpecific: true, text: "I want to prioritise my family relationships over career advancement — a promotion that damages my family life is not worth taking." },
  { id: "A3", scale: "Achievement", indiaSpecific: false, text: "Achieving mastery in my chosen field — being genuinely excellent at what I do, not just competent — is a core life goal." },
  { id: "A4", scale: "Achievement", indiaSpecific: false, text: "I want to be known as someone who achieved something significant — not just in my family's eyes, but in my professional world." },
  { id: "A5", scale: "Security", indiaSpecific: true, text: "Knowing that my financial future is secure — that I won't face hardship, won't be in debt, won't depend on others — is essential to my peace of mind." },
  { id: "A6", scale: "Security", indiaSpecific: false, text: "I need a predictable, stable life — dramatic changes to my income, location, or career make me anxious rather than excited." },
  { id: "A7", scale: "Autonomy", indiaSpecific: false, text: "Living on my own terms — having real freedom to make my own choices about how I spend my time, who I work for, and what I work on — is deeply important to me." },
  { id: "A8", scale: "Autonomy", indiaSpecific: false, text: "I resist structures or situations that constrain my personal choices — I need to feel that I could change direction if I wanted to." },
  { id: "A9", scale: "Seva", indiaSpecific: true, text: "Genuinely contributing to the improvement of other people's lives — especially those who are disadvantaged — is a core purpose I want my life to serve." },
  { id: "A10", scale: "Seva", indiaSpecific: true, text: "I would be willing to earn significantly less if my work had a direct, tangible positive impact on society." },
  { id: "A11", scale: "Status", indiaSpecific: true, text: "Being respected and admired in my community — that people know my name and see me as successful — matters genuinely to me, not just to my family." },
  { id: "A12", scale: "Status", indiaSpecific: true, text: "The opinion of my extended family, community, and peers about my career choice matters a lot to me — I care about 'log kya kahenge.'" },
  { id: "A13", scale: "Adventure", indiaSpecific: false, text: "I want my life to be full of new experiences — travel, new challenges, diverse environments — rather than comfortable predictability." },
  { id: "A14", scale: "Adventure", indiaSpecific: false, text: "Routine and repetition are genuinely uncomfortable for me — I need variety and novel stimulation in my life and work." },
  { id: "A15", scale: "Spirituality", indiaSpecific: true, text: "My spiritual or religious life — prayer, meditation, connection to a tradition or philosophy — is an important part of who I am, not just a social practice." },
  { id: "A16", scale: "Spirituality", indiaSpecific: true, text: "I want my career to be compatible with my spiritual values — I would not pursue work that conflicts with my fundamental ethical or religious beliefs." },
  { id: "A17", scale: "Intellectual", indiaSpecific: false, text: "Continuous learning and intellectual growth — constantly expanding my understanding and capability — is a non-negotiable life priority." },
  { id: "A18", scale: "Intellectual", indiaSpecific: false, text: "I would find a life where I stopped growing intellectually deeply unsatisfying — stagnation is one of my deepest fears." },
  { id: "A19", scale: "Dharma", indiaSpecific: true, text: "Fulfilling my responsibilities to my parents — supporting them financially and being present for them as they age — is a sacred duty, not an optional choice." },
  { id: "A20", scale: "Dharma", indiaSpecific: true, text: "Honouring my family's expectations of me — the sacrifices they made for my education, the hopes they have for my future — is a genuine core value, not just social pressure." },
];

// §2.1 — Life Values Priority Ranking: rank top 5 of the 10 dimensions.
const LIFE_VALUES_RANKING = [
  { key: "Family", label: "Family & Relationships", description: "Deep bonds with family, presence for parents and children" },
  { key: "Achievement", label: "Achievement & Mastery", description: "Excellence in your field; being genuinely great at what you do" },
  { key: "Security", label: "Security & Stability", description: "Financial safety, predictability, no major uncertainty" },
  { key: "Autonomy", label: "Autonomy & Freedom", description: "Living on your own terms, real personal freedom" },
  { key: "Seva", label: "Seva (Service)", description: "Making a real difference to disadvantaged people or society" },
  { key: "Status", label: "Status & Recognition", description: "Respect, admiration, visible social success" },
  { key: "Adventure", label: "Adventure & Novelty", description: "New experiences, travel, variety, stimulation" },
  { key: "Spirituality", label: "Spirituality", description: "Faith, inner peace, alignment with deep ethical/religious values" },
  { key: "Intellectual", label: "Intellectual Growth", description: "Continuous learning; never stop expanding understanding" },
  { key: "Dharma", label: "Dharma (Family Duty)", description: "Honouring family sacrifices, fulfilling duty to parents/community" },
];

/* =========================================================================
   SECTION B — WORK-LIFE BALANCE PREFERENCES (16 items + 4 FC pairs)
   HighIntensity(2) · Boundaries(1) · FamilyTime(2) · Parenting(1) · ElderCare(2)
   · TravelComfort(1) · Relocation(1) · Recovery(2) · Balance(2) ·
   HighIntensity_R(2, reverse).
   ========================================================================= */
const WLB_PREFERENCES = [
  { id: "B1", scale: "HighIntensity", indiaSpecific: false, text: "I am willing to work 10–12 hours per day consistently for the first 5–7 years of my career, in exchange for significantly faster advancement and higher compensation." },
  { id: "B2", scale: "Boundaries", indiaSpecific: false, text: "I want to be genuinely 'off' on evenings and weekends — not checking emails, not thinking about work — after reasonable working hours." },
  { id: "B3", scale: "HighIntensity", indiaSpecific: false, text: "I am comfortable with a career that frequently requires last-minute demands, weekend work, and unpredictable hours." },
  { id: "B4", scale: "FamilyTime", indiaSpecific: true, text: "Being home for dinner with family most evenings is something I actively prioritise — not just ideally but as a real lifestyle choice." },
  { id: "B5", scale: "FamilyTime", indiaSpecific: true, text: "I want to be genuinely present for major family events (weddings, festivals, health crises) without the career making this impossible." },
  { id: "B6", scale: "Parenting", indiaSpecific: true, text: "I plan to take an active daily role in raising my children — not outsourcing parenting to grandparents or domestic help during critical years." },
  { id: "B7", scale: "ElderCare", indiaSpecific: true, text: "I expect to have significant responsibility for my aging parents' care and presence — this is a genuine life priority, not just a contingency plan." },
  { id: "B8", scale: "ElderCare", indiaSpecific: true, text: "I would not take a job that required me to live more than 4–5 hours from my parents once they need regular attention or care." },
  { id: "B9", scale: "TravelComfort", indiaSpecific: false, text: "I am comfortable with career-related travel of 5–10 days per month — or more — as a regular feature of my professional life." },
  { id: "B10", scale: "Relocation", indiaSpecific: false, text: "Frequent relocation as part of a career (different city every 2–3 years) is something I could embrace rather than resent." },
  { id: "B11", scale: "Recovery", indiaSpecific: false, text: "I need sufficient personal time for recovery and activities I enjoy (exercise, reading, music, prayer, relationships) to feel sane and healthy." },
  { id: "B12", scale: "Recovery", indiaSpecific: false, text: "A career that frequently consumes personal time for months without relief would significantly damage my wellbeing and relationships." },
  { id: "B13", scale: "Balance", indiaSpecific: false, text: "I would genuinely choose a role with slower career growth if it meant significantly better work-life balance — this is not just something I say." },
  { id: "B14", scale: "Balance", indiaSpecific: false, text: "Long-term, I care more about having a satisfying integrated life than about maximising career title or income." },
  { id: "B15", scale: "HighIntensity_R", reverse: true, indiaSpecific: false, text: "I would find a career without intense demands and high stakes boring and unstimulating." },
  { id: "B16", scale: "HighIntensity_R", reverse: true, indiaSpecific: false, text: "Work-life balance is a myth — genuinely successful people always sacrifice personal time for professional achievement." },
];

const WLB_FC = [
  { id: "BFC1", prompt: "When these values conflict directly, which would you genuinely choose?",
    optionA: { key: "HighPay-HighStress", text: "A career with very high income (₹30–50 LPA in 5 years) that consistently requires 12+ hour days, frequent travel, and limited family time" },
    optionB: { key: "ModPay-Balance", text: "A career with moderate income (₹12–20 LPA) that allows consistent evening and weekend family time, minimal travel, and location stability" } },
  { id: "BFC2", prompt: "When these values conflict directly, which would you genuinely choose?",
    optionA: { key: "CareerMobility", text: "A career requiring you to live in a different city from your parents for 10+ years (better career), but you can visit 4 times/year" },
    optionB: { key: "FamilyProximity", text: "A career in your home city or state (lower career ceiling) that allows regular family presence and supports aging parents directly" } },
  { id: "BFC3", prompt: "When these values conflict directly, which would you genuinely choose?",
    optionA: { key: "AlwaysOn", text: "A role where you are expected to respond to work messages evenings and weekends (part of the culture, with high rewards)" },
    optionB: { key: "StrictBoundaries", text: "A role with strict work-hour discipline — when you leave at 7 PM you are genuinely finished for the day (moderate rewards)" } },
  { id: "BFC4", prompt: "When these values conflict directly, which would you genuinely choose?",
    optionA: { key: "CareerFirst-OutsourceCare", text: "Having domestic help, crèche facilities, and financial resources that allow you to pursue a demanding career while outsourcing some family responsibilities" },
    optionB: { key: "FamilyFirst-CareerPause", text: "Slowing your career growth for 3–5 years to be personally present for young children or aging parents, then resuming later" } },
];

/* =========================================================================
   SECTION C — LIFESTYLE GOALS & LIFE DESIGN (18 items + 5 open-ended)
   Metro/Tier2/International/HomeState(geographic) · IncomeGoal/Sufficiency/
   FinIndepend(income) · JointFam/NuclearFam(family structure) ·
   IntlMobility/IntlSpecific(international) · CulturalLife/CommunityStatus
   (cultural) · Leisure/Simplicity/CareerFlex/HealthFirst/Meaning40 (life design).
   ========================================================================= */
const LIFESTYLE_GOALS = [
  { id: "C1", scale: "Metro", indiaSpecific: true, text: "I see myself building my long-term life in a metro city (Delhi, Mumbai, Bengaluru, Hyderabad) — the opportunity, energy, and lifestyle of a large city genuinely appeal to me." },
  { id: "C2", scale: "Tier2", indiaSpecific: true, text: "I would prefer to settle in a Tier-2 city or smaller town — lower cost of living, closer to family, less stressful pace, stronger community roots." },
  { id: "C3", scale: "International", indiaSpecific: true, text: "Living abroad — in another country for 5–10 years or permanently — is a genuine aspiration for me, not just a possibility I'd accept." },
  { id: "C4", scale: "HomeState", indiaSpecific: true, text: "I want to settle in my home state or region — I feel most myself in the cultural and social context I grew up in." },
  { id: "C5", scale: "IncomeGoal", indiaSpecific: true, text: "Within 10 years of starting my career, I want to be earning enough to afford a comfortable home (owned, not rented) in the city I live in." },
  { id: "C6", scale: "Sufficiency", indiaSpecific: false, text: "My income aspiration is 'enough to live comfortably and support my family' — I don't feel a particular drive for high income beyond that threshold." },
  { id: "C7", scale: "FinIndepend", indiaSpecific: false, text: "I want to achieve financial independence early — the ability to stop working (or choose my work freely) before age 45." },
  { id: "C8", scale: "JointFam", indiaSpecific: true, text: "I expect and want to live in a joint family setup with my parents and/or in-laws — this is a genuine preference, not just a cultural default." },
  { id: "C9", scale: "NuclearFam", indiaSpecific: true, text: "I want to set up an independent nuclear family household — while maintaining close relationships with extended family, I prefer managing my own home." },
  { id: "C10", scale: "IntlMobility", indiaSpecific: false, text: "If an excellent career opportunity required me to work or study abroad for 2–5 years, I would take it without significant personal conflict." },
  { id: "C11", scale: "IntlSpecific", indiaSpecific: false, text: "I have a clear interest in higher education or work experience in a specific country (open field: which country, why)." },
  { id: "C12", scale: "CulturalLife", indiaSpecific: true, text: "I want my career to allow me to observe religious practices, fasts, and festivals meaningfully — not just nominally." },
  { id: "C13", scale: "CommunityStatus", indiaSpecific: true, text: "The social standing of my career in my specific community (caste, region, religion) genuinely matters to me — I care about being respected within my own community, not just generally." },
  { id: "C14", scale: "Leisure", indiaSpecific: false, text: "I want enough discretionary income and time for significant leisure — travel, hobbies, experiences — not just survival." },
  { id: "C15", scale: "Simplicity", indiaSpecific: false, text: "I am drawn to a simple, non-materialistic life — I don't want to be in a hamster wheel of earning and spending." },
  { id: "C16", scale: "CareerFlex", indiaSpecific: false, text: "I want my career to allow for significant pauses or pivots — periods where I step back to study more, care for family, or pursue something different." },
  { id: "C17", scale: "HealthFirst", indiaSpecific: false, text: "The physical and mental health demands of a career are a real factor in my choice — I will not pursue a career that systematically destroys health." },
  { id: "C18", scale: "Meaning40", indiaSpecific: true, text: "When I imagine myself at 40, the most important thing is that I feel I have built something meaningful — a career, a family, a contribution — not just accumulated a salary." },
];

// §4.1 — Open-ended Life Design Questions (qualitative, counsellor use only).
const LIFE_DESIGN_OPEN = [
  { id: "LD1", question: "Describe your ideal working day at age 35 — where are you, what are you doing, who are you with, what do you feel?", format: "Open text, 100 words", counsellorUse: "Reveals authentic lifestyle vision beyond what structured items capture. Used qualitatively in counsellor report." },
  { id: "LD2", question: "What does 'success' mean to you — personally, not what you think it should mean? Write in your own words.", format: "Open text, 75 words", counsellorUse: "Surfaces authentic success definition vs culturally-imposed definition. Key for career regret prevention." },
  { id: "LD3", question: "If money were no concern and all careers were equally respected, what would you spend your working life doing?", format: "Open text, 75 words", counsellorUse: "Intrinsic interest identification — removes financial and social constraints. Often reveals suppressed interests." },
  { id: "LD4", question: "What is the single biggest sacrifice you would NOT be willing to make for career success?", format: "Open text, 50 words", counsellorUse: "Hard constraint identification — the non-negotiable. This single answer often determines the most important career filter." },
  { id: "LD5", question: "Is there anything about the career you are currently targeting that worries you in terms of the life it will produce? What specifically concerns you?", format: "Open text, 100 words", counsellorUse: "Career fit anxiety identification. Surfaces doubts student hasn't said aloud. Critical for counsellor conversation." },
];

/* =========================================================================
   SECTION D — FINANCIAL RISK TOLERANCE & MONEY MINDSET (14 items + 3 FC pairs)
   MoneySecurity(3) · MoneyGrowth(2) · MoneySufficiency(1) · WealthAmbition(1) ·
   FamilyFinResp(2) · DebtComfort(1) · DebtAnxiety(1) · MoneyIdentity(1) ·
   ScarcityContext(1) · AbundanceMindset(1).
   ========================================================================= */
const MONEY_MINDSET = [
  { id: "D1", scale: "MoneySecurity", indiaSpecific: true, text: "A guaranteed monthly income — knowing exactly what will arrive in my account every month — matters more to me than income potential." },
  { id: "D2", scale: "MoneySecurity", indiaSpecific: false, text: "The idea of a month where I might earn ₹0 — however good the long-term upside — is genuinely anxiety-producing for me." },
  { id: "D3", scale: "MoneySecurity", indiaSpecific: true, text: "Job security matters more to me than a higher salary — I would take 30% less pay for guaranteed employment." },
  { id: "D4", scale: "MoneyGrowth", indiaSpecific: false, text: "I am excited by the possibility of variable income — if my ceiling is high enough, I can handle months of low income." },
  { id: "D5", scale: "MoneyGrowth", indiaSpecific: false, text: "I am willing to delay significant income for years in exchange for equity, ownership, or a much higher ceiling later." },
  { id: "D6", scale: "MoneySufficiency", indiaSpecific: false, text: "Money is primarily a means to an end for me — once I have enough for a comfortable life, additional income has diminishing importance." },
  { id: "D7", scale: "WealthAmbition", indiaSpecific: false, text: "I am genuinely ambitious about wealth — I want to be financially successful in a way that goes well beyond 'comfortable.'" },
  { id: "D8", scale: "FamilyFinResp", indiaSpecific: true, text: "I feel a significant sense of responsibility for my family's financial security — I need to earn enough to contribute substantially to household income." },
  { id: "D9", scale: "FamilyFinResp", indiaSpecific: true, text: "The financial expectations my family has of me — sending money home, funding siblings' education, funding parents' medical needs — are a real factor in my career income planning." },
  { id: "D10", scale: "DebtComfort", indiaSpecific: true, text: "I am comfortable taking on significant education debt (₹20–50 lakh for an MBA or foreign education) if the ROI is clear and the career upside is strong." },
  { id: "D11", scale: "DebtAnxiety", indiaSpecific: false, text: "The idea of being significantly in debt — even for a high-quality education — causes me substantial anxiety." },
  { id: "D12", scale: "MoneyIdentity", indiaSpecific: true, text: "Financial success is an important part of how I define my own self-worth and social identity." },
  { id: "D13", scale: "ScarcityContext", indiaSpecific: true, text: "I grew up with financial constraints that have shaped my attitude toward money — financial security carries emotional weight beyond its practical value." },
  { id: "D14", scale: "AbundanceMindset", indiaSpecific: false, text: "I believe that worrying too much about money security can cause people to make worse career decisions — the best careers are chosen for growth and meaning, not safety." },
];

const MONEY_FC = [
  { id: "DFC1", prompt: "When two paths to a financial future conflict, which would you genuinely choose?",
    optionA: { key: "GovtSecurity", text: "A stable government job paying ₹60,000–90,000/month with pension, housing allowance, and full job security for life" },
    optionB: { key: "PrivateGrowth", text: "A private-sector role paying ₹1.5–2L/month with high performance-linked bonuses, no job guarantee, and variable income" } },
  { id: "DFC2", prompt: "When two paths to a financial future conflict, which would you genuinely choose?",
    optionA: { key: "ImmediateSalary", text: "A salary of ₹12 LPA immediately after graduation with 10% annual growth — predictable, stable, no surprises" },
    optionB: { key: "StartupBet", text: "No salary for 2 years while building a startup, then either ₹0 or ₹1 Cr+ depending on success" } },
  { id: "DFC3", prompt: "When two paths to a financial future conflict, which would you genuinely choose?",
    optionA: { key: "MeaningfulModerate", text: "A career that provides comfortable income (₹20–30 LPA at peak) but deep meaning and social impact — you are proud of what you do every day" },
    optionB: { key: "HighPayLowMeaning", text: "A career that provides very high income (₹60–80 LPA at peak) but work that is primarily transactional — you do it for the money, not the meaning" } },
];

/* =========================================================================
   SECTION E — SOCIAL CONTRIBUTION VS PERSONAL SUCCESS ORIENTATION (14 items)
   Not scored as a virtue hierarchy — both orientations are equally valid.
   Seva(2) · SevaNation(1) · PublicService(1) · PersonalSuccess(2) ·
   PersonalWealth(1) · Integration(2) · SocialEntrepreneur(1) ·
   AuthenticSeva(1) · StatusMaterialism(1) · Civic(1) · NationalContrib(1).
   ========================================================================= */
const SOCIAL_CONTRIBUTION = [
  { id: "E1", scale: "Seva", indiaSpecific: true, text: "The most satisfying career outcomes I can imagine involve genuinely improving the lives of people who are disadvantaged, sick, uneducated, or marginalised." },
  { id: "E2", scale: "SevaNation", indiaSpecific: true, text: "I want to be able to look back at my career and feel that India — or some part of it — is meaningfully better because of my work." },
  { id: "E3", scale: "PublicService", indiaSpecific: true, text: "I am drawn to careers in public health, education, community development, or government — not for the salary but for the scale of impact possible." },
  { id: "E4", scale: "Seva", indiaSpecific: false, text: "I find the idea of working in a corporate role with no direct social impact — however well-paid — genuinely unfulfilling at a deep level." },
  { id: "E5", scale: "PersonalSuccess", indiaSpecific: false, text: "I am genuinely motivated by personal advancement — better title, higher income, more prestige — and this is honest, not something I need to apologise for." },
  { id: "E6", scale: "PersonalSuccess", indiaSpecific: false, text: "I want to be recognised as exceptional in my field — not just competent, not just contributing, but genuinely outstanding." },
  { id: "E7", scale: "PersonalWealth", indiaSpecific: false, text: "Building personal financial wealth is a genuine priority — not just for security, but because wealth gives me agency, freedom, and the ability to support people I care about." },
  { id: "E8", scale: "Integration", indiaSpecific: true, text: "I believe the best career is one that simultaneously serves my personal ambition AND creates genuine social value — the two are not mutually exclusive." },
  { id: "E9", scale: "Integration", indiaSpecific: true, text: "I am inspired by Indian leaders who have built great institutions AND made a social impact — Verghese Kurien (Amul), Ela Bhatt (SEWA), Narayana Murthy (Infosys Foundation)." },
  { id: "E10", scale: "SocialEntrepreneur", indiaSpecific: true, text: "I am attracted to social entrepreneurship — building organisations that create both economic value and direct social benefit." },
  { id: "E11", scale: "AuthenticSeva", indiaSpecific: false, text: "My desire to contribute to society is genuinely mine — not primarily driven by what my family or community expects of a 'good person.'" },
  { id: "E12", scale: "StatusMaterialism", indiaSpecific: true, text: "I am honest enough to acknowledge that social status and the markers of success — house, car, lifestyle — matter to me." },
  { id: "E13", scale: "Civic", indiaSpecific: true, text: "I feel a genuine sense of civic responsibility — being an informed, active citizen who contributes to Indian democracy and civic life." },
  { id: "E14", scale: "NationalContrib", indiaSpecific: true, text: "I want my career to contribute to 'Atmanirbhar Bharat' — India's self-reliance, innovation, and development as a nation." },
];

/* =========================================================================
   SECTION F — LONG-TERM SATISFACTION PREDICTORS (12 items) → SPI
   IntrinsicNeed(2) · GrowthNeed(1) · GrowthNeed_R(1, reverse) ·
   AutonomyNeed(1) · AutonomyNeed_R(1, reverse) · RelatednessNeed(1) ·
   RelatednessNeed_R(1, reverse) · PurposeNeed(2) · SatisfactionHistory(1) ·
   SelfKnowledge(1).
   ========================================================================= */
const SATISFACTION_PREDICTORS = [
  { id: "F1", scale: "IntrinsicNeed", indiaSpecific: false, text: "I need to find the work itself genuinely interesting — not just the outcomes, rewards, or recognition, but the actual tasks of the job, day to day." },
  { id: "F2", scale: "IntrinsicNeed", indiaSpecific: false, text: "When I imagine doing work I find tedious or meaningless for 10 years — even at high pay — I feel a visceral sense of dread." },
  { id: "F3", scale: "GrowthNeed", indiaSpecific: false, text: "I need to feel I am growing and developing continuously in my career — if I plateau, I lose motivation entirely." },
  { id: "F4", scale: "GrowthNeed_R", reverse: true, indiaSpecific: false, text: "I can tolerate repetitive, low-growth work for years if the security and income are good." },
  { id: "F5", scale: "AutonomyNeed", indiaSpecific: false, text: "I need at least some degree of control over how I work — being micromanaged or rigidly controlled is deeply frustrating for me." },
  { id: "F6", scale: "AutonomyNeed_R", reverse: true, indiaSpecific: false, text: "I can be genuinely happy in a highly structured role with little personal discretion if the environment is supportive and the work is secure." },
  { id: "F7", scale: "RelatednessNeed", indiaSpecific: false, text: "The quality of my relationships at work — with colleagues, clients, the people I serve — significantly determines my career satisfaction." },
  { id: "F8", scale: "RelatednessNeed_R", reverse: true, indiaSpecific: false, text: "I could be happy in a role that involved minimal human connection if the intellectual or creative stimulation was high enough." },
  { id: "F9", scale: "PurposeNeed", indiaSpecific: false, text: "I need to feel that my work contributes to something larger than my own welfare — without that sense of purpose, I cannot sustain motivation." },
  { id: "F10", scale: "PurposeNeed", indiaSpecific: false, text: "A career that pays very well but serves no obvious social purpose would eventually hollow me out, even if I tried to ignore it." },
  { id: "F11", scale: "SatisfactionHistory", indiaSpecific: false, text: "Looking back at my own history: I have been most satisfied and energised when I was working on something I genuinely believed in, with people I respected." },
  { id: "F12", scale: "SelfKnowledge", indiaSpecific: false, text: "I think I know myself well enough that I am unlikely to be in a career I deeply regret at age 40 — I am making my choices with real self-awareness." },
];

/* =========================================================================
   SECTION G — FUTURE LIFE PROJECTION SCENARIOS (5 scenarios)
   Guided-imagination exercise. Format: slider/selection along a labelled
   spectrum per element (no time limit; students are asked to genuinely
   engage, not answer quickly). GP-5 is a free-text, counsellor-only item —
   the single most important item in Test 8; never summarised algorithmically.
   ========================================================================= */
const FUTURE_PROJECTION = [
  {
    id: "GP1", title: "Your Ideal Tuesday at Age 35",
    instruction: "It is a Tuesday morning. You are 35 years old. Imagine the most satisfying, energising version of this day — a day that represents your life at its best. Describe or rate the following elements of that day:",
    elements: [
      { id: "GP1_1", label: "I am working for…", spectrum: ["Only myself (own business/freelance)", "A large established organisation"] },
      { id: "GP1_2", label: "The work I am doing today involves…", spectrum: ["Primarily solo, focused, deep work", "Primarily people, teams, and relationships"] },
      { id: "GP1_3", label: "My location today is…", spectrum: ["Rural/small town India", "Metro Indian city", "Abroad"] },
      { id: "GP1_4", label: "My primary feeling about this day is…", spectrum: ["Productive and achieved", "Connected and meaningful", "Creative and expressive", "Calm and secure"] },
      { id: "GP1_5", label: "In the evening, I am…", spectrum: ["Still working (I love it and time has flown)", "Completely off work and with family or friends"] },
    ],
  },
  {
    id: "GP2", title: "The Financial Picture at Age 40",
    instruction: "You are 40 years old. Rate the following statements about your financial life at this age:",
    elements: [
      { id: "GP2_1", label: "My monthly take-home income is approximately…", spectrum: ["₹50,000–1 lakh", "₹1–3 lakh", "₹3–8 lakh", "₹8L+/variable (own business)"] },
      { id: "GP2_2", label: "My financial feeling is primarily…", spectrum: ["Secure and stable (I could stop working for 1 year)", "Growing and expanding (best years ahead)", "Uncertain but exciting"] },
      { id: "GP2_3", label: "My family's financial situation is…", spectrum: ["I am the primary earner; my income is critical", "Dual income family; my income is significant", "My income is for my personal goals only"] },
      { id: "GP2_4", label: "I have…", spectrum: ["Significant debt I am paying off", "Zero debt and growing savings", "Invested wealth generating passive income"] },
    ],
  },
  {
    id: "GP3", title: "The Family Picture at Age 40",
    instruction: "You are 40 years old. Rate the following aspects of your family life:",
    elements: [
      { id: "GP3_1", label: "My living situation is…", spectrum: ["Joint family with parents and/or in-laws", "Nuclear family in the same city as parents", "Nuclear family in a different city", "Abroad from parents"] },
      { id: "GP3_2", label: "My active role as a parent is…", spectrum: ["Deeply present (school drop-offs, homework, weekends fully available)", "Present but career-constrained (quality time but not quantity)", "Career-first in this phase"] },
      { id: "GP3_3", label: "My parents' situation is…", spectrum: ["Living with me/nearby, I provide significant care", "Independent, I support financially", "Not a significant care responsibility at this age"] },
      { id: "GP3_4", label: "My social life includes…", spectrum: ["Strong local community ties (friends, neighbourhood, religious group)", "Mostly professional networks", "Family is my primary social world"] },
    ],
  },
  {
    id: "GP4", title: "Your Legacy Vision at Age 60",
    instruction: "You are 60 years old and preparing to slow down or retire. Rate the following reflections on your working life:",
    elements: [
      { id: "GP4_1", label: "The thing I am most proud of professionally is…", spectrum: ["Something I built (company, institution, product, body of creative work)", "People I mentored or helped develop", "Problems I solved or impact I created", "Positions I held and influence I exercised"] },
      { id: "GP4_2", label: "My overall career satisfaction looking back is…", spectrum: ["Deeply fulfilled (this is exactly the life I wanted)", "Mostly satisfied with some regrets", "Substantially different from what I would choose if starting again"] },
      { id: "GP4_3", label: "The single biggest sacrifice I made for my career was…", spectrum: ["Family time", "Health", "Personal interests and passions", "Geographic stability", "I didn't sacrifice significantly"] },
      { id: "GP4_4", label: "If I could give my 18-year-old self one piece of career advice, it would be…", spectrum: ["Follow your genuine interests without apology", "Be more practical and realistic", "Build relationships first", "Take more risks early"] },
    ],
  },
];

// GP-5 — the single most important item in Test 8. Free text, never
// summarised algorithmically; shared with the counsellor in full and used
// qualitatively in the Career Regret Prevention narrative.
const GP5_NON_NEGOTIABLE = {
  id: "GP5",
  title: "The Non-Negotiable Life Design Question",
  instruction: "Complete this sentence honestly — the answer you write here is for your eyes and your counsellor only, and it is the single most important piece of information in this entire assessment:",
  prompts: [
    { id: "GP5_good", label: "'When I imagine my life at 40, the one thing that would make me feel it was a genuinely good life is: ____'" },
    { id: "GP5_wasted", label: "'And the one thing that would make me feel I wasted it is: ____'" },
  ],
};

/* =========================================================================
   SECTION H — SJTs: INDIAN LIFE DESIGN DILEMMAS (10 scenarios)
   Format: MO/LO. NOT scored on a competency basis — scored on values
   ALIGNMENT with the student's own T8 profile (per each scenario's scoring
   note). Options carry a `bestFor` array of value-profile conditions rather
   than a universal moPoints ranking (see scoring.js for the alignment logic).
   SJT-T8-10 (GP-style closing reflection) is NOT scored — noted qualitatively.
   ========================================================================= */
const SJT_H = [
  {
    id: "SJT_T8_H1", title: "The High-Salary vs High-Meaning Trade-off",
    competencies: ["Money Mindset", "Social Contribution", "Satisfaction Prediction"],
    context: "Post-graduation — first major career decision",
    scenario: "Aryan (24, IIT graduate) has two offers: (A) A product manager role at Google India — ₹35 LPA, fast career growth, prestigious, intellectually stimulating, no direct social impact. (B) Programme Director at a rural education NGO — ₹8 LPA, direct impact on 50,000 children annually, mission-aligned, deeply meaningful. His parents prefer A. He has always said he wants to 'give back.'",
    options: [
      { key: "A", text: "Take Option A — financial security and career capital now, social contribution later when he has more resources and leverage.", bestFor: ["Security", "PersonalSuccess", "MoneyGrowth"] },
      { key: "B", text: "Take Option B — this is exactly what he has always said he wanted; if not now, when? Compromise is a path to regret.", bestFor: ["Seva"] },
      { key: "C", text: "Take Option A with a structured commitment: dedicate 20% of his income and 4 Saturdays per month to education initiatives — building the 'giving back' track alongside the career track.", bestFor: ["Security", "Integration", "PersonalSuccess"] },
      { key: "D", text: "Take 3 months to do a fellowship at the NGO before deciding — experience the reality of Option B before committing to either.", bestFor: ["AutonomyNeed", "SelfKnowledge"] },
    ],
    scoringNote: "If Seva is the student's top-ranked value, B has highest alignment; if Security + PersonalSuccess are top-ranked, A or C have highest alignment. There is no universally correct answer.",
  },
  {
    id: "SJT_T8_H2", title: "The Career vs Aging Parent Dilemma",
    competencies: ["Family Duty (Dharma)", "Career Ambition", "Work-Life Balance"],
    context: "Mid-career — parent health crisis",
    scenario: "Meena (28, working as a consultant in Bengaluru) receives a call that her father has had a serious stroke. He will need 6 months of intensive care and ongoing support. Her mother cannot manage alone. Meena is at a critical juncture in her consulting career — she is being considered for promotion to senior consultant. She has a younger brother who could help but lives abroad.",
    options: [
      { key: "A", text: "Take 6 months unpaid leave to care for her father — the promotion can wait, or there will be another one.", bestFor: ["Dharma", "Family"] },
      { key: "B", text: "Hire a full-time caregiver for her father, pay for it from her salary, and continue her career — she can be most useful by earning well and funding the care.", bestFor: ["Security", "Achievement", "MoneyGrowth"] },
      { key: "C", text: "Negotiate with her company for remote work from her home city for 6 months — giving her physical proximity while maintaining career momentum.", bestFor: ["Balance", "Dharma", "Achievement"] },
      { key: "D", text: "Ask her brother to return from abroad for 6 months — share the responsibility rather than bearing it alone.", bestFor: ["Balance", "Dharma"] },
    ],
    scoringNote: "High Family/Dharma → A or C highest alignment. High Security/Achievement → B or C highest alignment. High Balance → C highest alignment.",
  },
  {
    id: "SJT_T8_H3", title: "Log Kya Kahenge — The Prestige vs Passion Decision",
    competencies: ["Status Orientation", "Authenticity", "Family Duty"],
    context: "Class 12 / post-graduation — career choice under social scrutiny",
    scenario: "Vikram has secured a seat in IIT Kharagpur Civil Engineering — one of his family's proudest moments. He has also been accepted at a graphic design diploma programme at a leading design institute. He is far more passionate about design. His family's social circle — neighbours, relatives, father's office colleagues — know about the IIT seat. His father says: 'If you leave IIT for design, I will have to face everyone.'",
    options: [
      { key: "A", text: "Take the IIT seat — his father's dignity and the family's social standing are not a trivial concern in his cultural context.", bestFor: ["Dharma", "Status"] },
      { key: "B", text: "Take the design diploma — it is his life to live; social pressure is ultimately temporary.", bestFor: ["Autonomy"] },
      { key: "C", text: "Research whether IIT Kharagpur offers any design electives or a dual programme, and whether he could transfer after 1 year — look for a path that honoured both.", bestFor: ["Balance", "Dharma", "Autonomy"] },
      { key: "D", text: "Ask his father: 'Can we have a private, honest conversation about what is best for me — separate from what we need to tell people? I respect your concern, but I need us to actually talk.'", bestFor: ["Balance", "Autonomy", "Dharma"] },
    ],
    scoringNote: "D = highest alignment for most profiles — separates authentic family dialogue from social-face management. B = valid for high-Autonomy + low-Status profile. A = valid for high-Dharma + high-Status profile. C = practical bridge-building.",
  },
  {
    id: "SJT_T8_H4", title: "The Joint Family vs Career Mobility Dilemma",
    competencies: ["Family Values", "Geographic Preference", "Career Ambition"],
    context: "Post-marriage or early-career context",
    scenario: "Priya (26) has been offered an outstanding role at a Bengaluru fintech company — ₹18 LPA, 40% above her current salary, clear growth path. Her husband works in their home city of Bhopal. His career is stable but not exceptional. His mother lives with them and has a health condition requiring regular attention. Moving to Bengaluru means him leaving his job, uprooting his mother, or Priya going alone.",
    options: [
      { key: "A", text: "Decline the Bengaluru offer — the disruption to the family is too significant.", bestFor: ["Family", "Dharma"] },
      { key: "B", text: "Accept the Bengaluru offer and relocate — her husband can find another job there, and his mother's care can be managed with hired help.", bestFor: ["Achievement", "Autonomy"] },
      { key: "C", text: "Accept the Bengaluru offer but propose a 6-month trial — husband keeps his Bhopal job for 6 months, she proves the career ROI, and then the family makes a fully informed decision together.", bestFor: ["Achievement", "Balance"] },
      { key: "D", text: "Have a long, honest conversation with her husband — not unilaterally deciding either way — exploring what each option costs and gains for both of them.", bestFor: ["Family", "Balance"] },
    ],
    scoringNote: "D = highest alignment for high-Family + high-Balance profile. C = high-Achievement + pragmatic. B = high-Autonomy + high-Achievement. A = high-Dharma + high-Family Duty. Scored against the student's own T8 values profile — no universal correct answer.",
  },
  {
    id: "SJT_T8_H5", title: "The Spiritual vs Corporate Life Conflict",
    competencies: ["Spirituality", "Work-Life Balance", "Authenticity"],
    context: "Young professional — identity and career tension",
    scenario: "Rahul (23, MBA fresher) gets a placement at an aggressive investment banking firm. The culture is: 16-hour days, alcohol-mandatory client dinners, weekend work, performance-above-all ethics. He is from a deeply religious family, practices yoga and meditation daily, and genuinely values spiritual discipline. His friends in the batch are excited about the offer.",
    options: [
      { key: "A", text: "Accept the offer — everyone in IB makes this compromise, and he can return to his spiritual practice when senior enough to set his own schedule.", bestFor: ["Achievement", "Security"] },
      { key: "B", text: "Decline the offer and specifically target firms with cultures compatible with his values — even at lower initial compensation.", bestFor: ["Spirituality"] },
      { key: "C", text: "Accept the offer but privately maintain his core practices (morning meditation, dietary choices) as non-negotiables — see if it is actually possible to hold his values within the environment.", bestFor: ["Spirituality", "Achievement"] },
      { key: "D", text: "Have honest conversations with 2–3 people currently working at this firm before deciding — understand the actual culture, not the recruitment brand.", bestFor: ["SelfKnowledge", "AutonomyNeed"] },
    ],
    scoringNote: "D = highest alignment for all profiles initially — information before decision. B = highest long-term alignment for high-Spirituality + high-Authenticity profile. A = high-Achievement + high-Security. C = pragmatic hypothesis-testing.",
  },
  {
    id: "SJT_T8_H6", title: "The Expensive Education vs Family Stability Trade-off",
    competencies: ["Financial Risk Tolerance", "Family Duty", "Career Ambition"],
    context: "Post-graduation — education investment decision",
    scenario: "Neha (22) has been accepted at IIM Ahmedabad (MBA, fees ₹23 lakh, 2 years). She would need a loan. Her family runs a small business — stable but modest. Her parents are approaching retirement. Her younger sister's education also needs funding in 3 years. The IIM MBA would likely lift her income trajectory significantly. But the debt and 2-year pause makes her anxious, and she feels she should be earning, not studying.",
    options: [
      { key: "A", text: "Decline the IIM seat — the family financial situation makes the timing wrong, and she can apply again in 2–3 years.", bestFor: ["Family", "MoneySecurity"] },
      { key: "B", text: "Accept the IIM seat and take the full loan — the lifetime ROI of an IIM MBA is clear and the debt is manageable.", bestFor: ["Achievement", "MoneyGrowth"] },
      { key: "C", text: "Accept the IIM seat, take the loan, and simultaneously apply for all available scholarships and assistantships to reduce the debt burden.", bestFor: ["Achievement", "MoneySecurity"] },
      { key: "D", text: "Have a transparent family conversation: present the data (IIM lifetime salary trajectory vs current trajectory), the risk (loan, 2-year pause), and ask the family to collectively decide — she is not the only stakeholder.", bestFor: ["Family", "Dharma"] },
    ],
    scoringNote: "D = highest alignment for high-Family + high-transparency profile. C = practical + evidence-based. B = high-Achievement + high-Financial Risk Tolerance. A = high-Family Duty + high-Security orientation.",
  },
  {
    id: "SJT_T8_H7", title: "The Work-From-Anywhere Vision vs Reality",
    competencies: ["Lifestyle Goals", "Financial Security", "Autonomy"],
    context: "Young professional — remote work era decision",
    scenario: "Kartik (24, junior data analyst) has a stable ₹12 LPA job at an IT company. He sees colleagues becoming freelance consultants, working remotely, and earning ₹20–30 LPA with lifestyle freedom — working from Rishikesh, Goa, or wherever they choose. He is tempted. But his job is secure, his family approves, and freelancing income is variable.",
    options: [
      { key: "A", text: "Stay in the stable job — security and family approval are more important than lifestyle freedom at this stage.", bestFor: ["Security"] },
      { key: "B", text: "Transition to freelancing immediately — the lifestyle freedom and income potential are worth the risk.", bestFor: ["Adventure", "Autonomy"] },
      { key: "C", text: "Build a freelancing practice on the side (nights and weekends) for 12 months — reach ₹5 LPA in freelance income before considering leaving the stable job.", bestFor: ["Security", "Autonomy"] },
      { key: "D", text: "Research the actual experience of people who made this transition — the 50th percentile outcome, not the Instagram version.", bestFor: ["SelfKnowledge", "Security"] },
    ],
    scoringNote: "C and D together = highest alignment for most profiles — C (risk-managed transition) + D (evidence before decision). B = high-Adventure + high-Autonomy. A = high-Security.",
  },
  {
    id: "SJT_T8_H8", title: "The Career That Demands Everything",
    competencies: ["Satisfaction Prediction", "Family Values", "Self-Knowledge"],
    context: "Class 12 / early career — UPSC preparation decision",
    scenario: "Deepa (20, graduated with honours in Political Science) has always dreamed of IAS. She begins UPSC preparation. Six months in, she realises: this preparation requires her to be a near-recluse for 2–3 years. No time for family events, social life, reading for pleasure, or the art projects she loves. She is performing well in mock tests. But she misses her life.",
    options: [
      { key: "A", text: "Continue UPSC preparation with full commitment — the IAS is worth any sacrifice for 2–3 years.", bestFor: ["Achievement", "Status"] },
      { key: "B", text: "Abandon UPSC preparation — if she already misses her life after 6 months, 2–3 more years is unsustainable.", bestFor: ["Balance", "Adventure"] },
      { key: "C", text: "Have an honest self-conversation: is it the IAS she wants, or is it the idea of the IAS? What specifically about IAS is non-negotiable for her — if she could achieve those specific things in another way, would she?", bestFor: ["SelfKnowledge", "AuthenticSeva"] },
      { key: "D", text: "Continue preparation but set a realistic time limit: two attempts. If she doesn't qualify in two attempts, she will explore allied careers (State civil services, development sector) that serve similar goals.", bestFor: ["Balance", "SelfKnowledge"] },
    ],
    scoringNote: "C = highest alignment for high-Authenticity + high-Self-Knowledge profile. D = pragmatic with clear exit strategy. A = high-Grit + high-Achievement. B = low-Resilience response but valid for someone with strong contrary evidence.",
  },
  {
    id: "SJT_T8_H9", title: "The Billion-Rupee Regret",
    competencies: ["Money Mindset", "Satisfaction Prediction", "Values Integration"],
    context: "Future projection scenario — career reflection",
    scenario: "Imagine you are 50. You pursued a highly lucrative finance career — your net worth is ₹15 crore. By most external measures, you are successful. But you realise you have spent 25 years doing work you found intellectually boring, away from family during critical years, in an environment that did not reflect your values. You are wealthy. Are you satisfied? How do you feel?",
    options: [
      { key: "A", text: "Grateful — financial security for my family for generations was worth everything I sacrificed.", bestFor: ["Security", "Family"] },
      { key: "B", text: "Mixed — I achieved what I set out to achieve financially, but I wish I had found a way to combine financial success with more meaningful work.", bestFor: ["Integration"] },
      { key: "C", text: "Deeply regretful — I pursued someone else's definition of success, and I cannot get those years back.", bestFor: ["AuthenticSeva", "Autonomy"] },
      { key: "D", text: "Redirected — I am now using the wealth I built to do the work that matters. It's not too late.", bestFor: ["Integration", "Seva"] },
    ],
    scoringNote: "Not a leadership scenario — a self-knowledge probe. The response reveals the student's authentic hierarchy of life values when stripped of present-tense social desirability. Students who select C or B despite currently pursuing high-income pathways = career regret risk flag. Counsellor uses this as a conversation starter.",
  },
  {
    id: "SJT_T8_H10", title: "The Ultimate Life Design Question",
    competencies: ["All T8 dimensions — integrative"],
    context: "Capstone self-reflection scenario",
    scenario: "You have just met your future self — you at age 65, at the end of a full working life. Your future self says: 'I am going to tell you the one thing that would have made the biggest difference to whether my life was a good one. Are you ready?' What does your future self say to you? Choose the option that resonates most deeply, honestly.",
    options: [
      { key: "A", text: "'Spend less time trying to meet other people's expectations. The life you are supposed to live and the life you actually want are not always the same — and the gap between them, accumulated over decades, is the source of almost all regret.'" },
      { key: "B", text: "'Do not sacrifice your health and your relationships for career achievement. The career will not hold your hand when you are sick. The titles will not visit you in the hospital.'" },
      { key: "C", text: "'Take the risk earlier. The safe choice that seemed prudent in your twenties was actually the highest-risk choice — the risk of a half-lived life.'" },
      { key: "D", text: "'The connection and love you gave and received — that is all that will matter. Everything else is a story you told yourself.'" },
    ],
    notScored: true,
    scoringNote: "No scoring — this is a closing reflection item. The student's choice is noted qualitatively and referenced in the Final Master Report's closing paragraph. It is the most human moment in the entire DISHA battery.",
  },
];

/* =========================================================================
   VALIDITY (embedded) — 5 LikeMe social-desirability items (verbatim, §10.1).
   Values-consistency cross-checks (§10.2) implemented in scoring.js over
   existing item IDs.
   ========================================================================= */
const VALIDITY = [
  { id: "V1", validity: "LikeMe", agreeKeyed: true, text: "I have never prioritised career advancement or money over family time — my values have always been perfectly consistent." },
  { id: "V2", validity: "LikeMe", agreeKeyed: true, text: "I have never felt envious of someone else's income, status, or career achievements." },
  { id: "V3", validity: "LikeMe", agreeKeyed: true, text: "My desire to serve others and contribute to society has never been influenced by how it looks to others." },
  { id: "V4", validity: "LikeMe", agreeKeyed: true, text: "I have always been perfectly honest about what I truly want from life — I have never told myself a story that wasn't true." },
  { id: "V5", validity: "LikeMe", agreeKeyed: true, text: "I have no conflict whatsoever between what I want for myself and what my family expects of me." },
];

/* =========================================================================
   SECTION METADATA
   ========================================================================= */
const SECTIONS = [
  { id: "lifeValues", code: "A", name: "Core Life Values Inventory", timeMin: 6 },
  { id: "wlbPreferences", code: "B", name: "Work-Life Balance Preferences", timeMin: 4 },
  { id: "lifestyleGoals", code: "C", name: "Lifestyle Goals & Life Design", timeMin: 5 },
  { id: "moneyMindset", code: "D", name: "Financial Risk Tolerance & Money Mindset", timeMin: 4 },
  { id: "socialContribution", code: "E", name: "Social Contribution vs Personal Success", timeMin: 4 },
  { id: "satisfactionPredictors", code: "F", name: "Long-term Satisfaction Predictors", timeMin: 3 },
  { id: "futureProjection", code: "G", name: "Future Life Projection", timeMin: 5 },
  { id: "scenarios", code: "H", name: "Life Design Dilemmas", timeMin: 8 },
];

module.exports = {
  SECTIONS,
  LIFE_VALUES,
  LIFE_VALUES_RANKING,
  WLB_PREFERENCES,
  WLB_FC,
  LIFESTYLE_GOALS,
  LIFE_DESIGN_OPEN,
  MONEY_MINDSET,
  MONEY_FC,
  SOCIAL_CONTRIBUTION,
  SATISFACTION_PREDICTORS,
  FUTURE_PROJECTION,
  GP5_NON_NEGOTIABLE,
  SJT_H,
  VALIDITY,
};
