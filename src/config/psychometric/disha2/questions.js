/**
 * DISHA — Test 2 of 8
 * Interests, Work Values, Career Motivations & Occupational Preferences.
 *
 * Target: Classes 9–12, Ages 13–25. Duration 30–45 min. ~185 scored items
 * across 6 modules (A–F) + embedded validity. CCRE contribution: 20–25% of the
 * Master Combined Score.
 *
 * Where Test 1 measures cognitive capability and academic performance, Test 2
 * answers a different question: even if a student CAN do something, will they
 * WANT to do it and sustain effort over a lifetime? This file is the single
 * source of truth for the Test-2 item bank. It is served to the client (answer
 * keys / scoring weights stripped) and used server-side for scoring.
 *
 * Module map
 *  A — Activity Preferences (90 items)      RIASEC × 6 types × 15, 5-pt Like/Dislike
 *  B — Occupational Title Ratings (60)      5-pt appeal scale, Indian career titles
 *  C — Work Values Inventory (40)           28 Likert + 8 forced-choice + top-5 ranking
 *  D — Career Motivations (25)              5-pt Likert; intrinsic vs extrinsic drivers
 *  E — Work Environment Preferences (20)    5 sector FC pairs + 10 work-style bipolar
 *  F — Situational Judgment Tests (15)      MO/LO; values-in-action, Indian dilemmas
 *
 * Item conventions
 *  - Module A item: { id, type: R|I|A|S|E|C, text, indiaSpecific }
 *  - Module B item: { id, title, holland (3-char), sector, description }
 *  - Module C Likert: { id, text, scale, indiaSpecific }; FC: optionA/optionB { text, value }
 *  - Module D item: { id, text, scale, indiaSpecific }
 *  - Module E sector FC: optionA/optionB { text, key }; work-style: { id, left, right, maps }
 *  - Module F SJT: { id, title, competencies, classFocus, scenario, options:[{key,text,moPoints,note}] }
 */

/* =========================================================================
   MODULE A — ACTIVITY PREFERENCES (90 items)
   Format: 5-point scale 1 = Strongly Dislike … 5 = Strongly Like.
   15 items per RIASEC type. Items describe concrete activities (not
   occupations, not personality traits). ★ = India-specific item.
   Instruction: "Rate how much you would enjoy doing each activity, regardless
   of whether you think you are good at it or whether your family would approve."
   ========================================================================= */
const ACTIVITY_PREFS = [
  // ---- Type R — Realistic (hands-on, physical, technical, tool-based) ----
  { id: "AP_R1", type: "R", text: "Assembling a small engine from spare parts (like repairing a motorcycle engine)", indiaSpecific: true },
  { id: "AP_R2", type: "R", text: "Installing electrical wiring in a building under construction", indiaSpecific: true },
  { id: "AP_R3", type: "R", text: "Operating heavy machinery (a tractor, crane, or printing press)", indiaSpecific: true },
  { id: "AP_R4", type: "R", text: "Repairing a broken household appliance (washing machine, ceiling fan) using tools", indiaSpecific: false },
  { id: "AP_R5", type: "R", text: "Designing and building a working model bridge for a science exhibition", indiaSpecific: false },
  { id: "AP_R6", type: "R", text: "Maintaining and calibrating laboratory equipment in a research facility", indiaSpecific: false },
  { id: "AP_R7", type: "R", text: "Working outdoors doing physical survey work (mapping land boundaries, soil testing)", indiaSpecific: true },
  { id: "AP_R8", type: "R", text: "Learning to drive and maintain a commercial vehicle (truck, bus)", indiaSpecific: true },
  { id: "AP_R9", type: "R", text: "Growing crops using modern farming techniques (drip irrigation, greenhouse farming)", indiaSpecific: true },
  { id: "AP_R10", type: "R", text: "Performing detailed carpentry work (building furniture, wooden structures from scratch)", indiaSpecific: false },
  { id: "AP_R11", type: "R", text: "Reading and interpreting technical engineering blueprints or architectural drawings", indiaSpecific: false },
  { id: "AP_R12", type: "R", text: "Conducting quality control checks on a manufacturing production line", indiaSpecific: false },
  { id: "AP_R13", type: "R", text: "Working as part of a team building a physical infrastructure project (road, dam, bridge)", indiaSpecific: true },
  { id: "AP_R14", type: "R", text: "Servicing and tuning a musical instrument (harmonium, tabla, sitar)", indiaSpecific: true },
  { id: "AP_R15", type: "R", text: "Doing hands-on first aid — treating injuries, setting bones, physical rehabilitation", indiaSpecific: true },

  // ---- Type I — Investigative (intellectual inquiry, science, analysis) ----
  { id: "AP_I1", type: "I", text: "Conducting an experiment to understand why a particular plant disease spreads faster in monsoon", indiaSpecific: true },
  { id: "AP_I2", type: "I", text: "Analysing crime statistics across Indian districts to identify patterns and causes", indiaSpecific: true },
  { id: "AP_I3", type: "I", text: "Reading research papers about new developments in artificial intelligence or quantum computing", indiaSpecific: false },
  { id: "AP_I4", type: "I", text: "Investigating why certain medications become ineffective against bacteria over time (antibiotic resistance)", indiaSpecific: false },
  { id: "AP_I5", type: "I", text: "Studying economic data to understand why inflation rises during election years in India", indiaSpecific: true },
  { id: "AP_I6", type: "I", text: "Writing a technical paper explaining a new algorithm you developed", indiaSpecific: false },
  { id: "AP_I7", type: "I", text: "Designing a scientific study to test whether a new teaching method improves student outcomes", indiaSpecific: false },
  { id: "AP_I8", type: "I", text: "Analysing satellite imagery to track deforestation in the Western Ghats", indiaSpecific: true },
  { id: "AP_I9", type: "I", text: "Spending hours solving a complex mathematical proof just for the intellectual satisfaction", indiaSpecific: false },
  { id: "AP_I10", type: "I", text: "Studying the historical roots of the Indian caste system using primary source documents", indiaSpecific: true },
  { id: "AP_I11", type: "I", text: "Building and testing a hypothesis about what causes floods in Assam each year", indiaSpecific: true },
  { id: "AP_I12", type: "I", text: "Working in a genetics laboratory, studying DNA sequences to understand hereditary diseases", indiaSpecific: false },
  { id: "AP_I13", type: "I", text: "Developing a computer simulation to model how pollution spreads in the Ganga river", indiaSpecific: true },
  { id: "AP_I14", type: "I", text: "Researching the psychological effects of competitive exam pressure on Class 12 students", indiaSpecific: true },
  { id: "AP_I15", type: "I", text: "Identifying and classifying rare insects in a forest biodiversity survey", indiaSpecific: true },

  // ---- Type A — Artistic (creative, expressive, aesthetic, original) ----
  { id: "AP_A1", type: "A", text: "Writing a short story set in a village during the Partition of India", indiaSpecific: true },
  { id: "AP_A2", type: "A", text: "Composing an original piece of music blending Carnatic classical with electronic beats", indiaSpecific: true },
  { id: "AP_A3", type: "A", text: "Designing the layout and visual identity of a new Indian mobile app", indiaSpecific: true },
  { id: "AP_A4", type: "A", text: "Creating a short documentary film about street food vendors in Mumbai", indiaSpecific: true },
  { id: "AP_A5", type: "A", text: "Painting a large mural representing the diversity of Indian cultures", indiaSpecific: true },
  { id: "AP_A6", type: "A", text: "Choreographing a Bharatanatyam performance that tells a modern story", indiaSpecific: true },
  { id: "AP_A7", type: "A", text: "Writing lyrics for a Bollywood or indie-pop song", indiaSpecific: true },
  { id: "AP_A8", type: "A", text: "Designing the interior of a cafe that fuses Kerala architecture with modern minimalism", indiaSpecific: true },
  { id: "AP_A9", type: "A", text: "Creating illustrations for a graphic novel set in ancient Mohenjo-daro", indiaSpecific: true },
  { id: "AP_A10", type: "A", text: "Photographing daily life in a Rajasthan village and curating a photo exhibition", indiaSpecific: true },
  { id: "AP_A11", type: "A", text: "Developing a creative marketing campaign using storytelling for a social cause", indiaSpecific: false },
  { id: "AP_A12", type: "A", text: "Writing a play that explores the conflict between tradition and modernity in Indian families", indiaSpecific: true },
  { id: "AP_A13", type: "A", text: "Designing traditional Indian textiles (sarees, dupattas) with contemporary patterns", indiaSpecific: true },
  { id: "AP_A14", type: "A", text: "Creating a YouTube series exploring forgotten Indian folk art traditions", indiaSpecific: true },
  { id: "AP_A15", type: "A", text: "Producing a podcast series interviewing India's unsung changemakers", indiaSpecific: true },

  // ---- Type S — Social (helping, teaching, healing, community / seva) ----
  { id: "AP_S1", type: "S", text: "Teaching Mathematics to Class 10 students in a government school in a small town", indiaSpecific: true },
  { id: "AP_S2", type: "S", text: "Counselling a teenager who is struggling with exam anxiety and family pressure", indiaSpecific: true },
  { id: "AP_S3", type: "S", text: "Organising a health camp in a rural village to provide basic medical check-ups", indiaSpecific: true },
  { id: "AP_S4", type: "S", text: "Mentoring a first-generation college student through the application process", indiaSpecific: true },
  { id: "AP_S5", type: "S", text: "Working as a community health worker visiting homes in a slum to check on mothers and newborns", indiaSpecific: true },
  { id: "AP_S6", type: "S", text: "Facilitating a conflict resolution session between two communities in dispute", indiaSpecific: true },
  { id: "AP_S7", type: "S", text: "Training self-help group members in a village on financial literacy and microfinance", indiaSpecific: true },
  { id: "AP_S8", type: "S", text: "Volunteering regularly at an old age home or orphanage — not as a one-time event but long term", indiaSpecific: true },
  { id: "AP_S9", type: "S", text: "Designing and running a life-skills program for adolescent girls in tribal areas", indiaSpecific: true },
  { id: "AP_S10", type: "S", text: "Working with NGOs to rehabilitate children rescued from child labour", indiaSpecific: true },
  { id: "AP_S11", type: "S", text: "Helping a student with a disability navigate the challenges of mainstream education", indiaSpecific: false },
  { id: "AP_S12", type: "S", text: "Running a free coaching class for underprivileged students preparing for competitive exams", indiaSpecific: true },
  { id: "AP_S13", type: "S", text: "Providing emotional support to families affected by farmer suicides in Maharashtra or Punjab", indiaSpecific: true },
  { id: "AP_S14", type: "S", text: "Training frontline healthcare workers (ANMs, ASHAs) in remote areas", indiaSpecific: true },
  { id: "AP_S15", type: "S", text: "Creating and leading a youth club in your locality that works on social issues", indiaSpecific: true },

  // ---- Type E — Enterprising (leadership, persuasion, business, influence) ----
  { id: "AP_E1", type: "E", text: "Pitching a new business idea to investors at a startup event", indiaSpecific: false },
  { id: "AP_E2", type: "E", text: "Leading the student council to negotiate with the school principal for better facilities", indiaSpecific: true },
  { id: "AP_E3", type: "E", text: "Managing the expansion of your family's retail business to a new city", indiaSpecific: true },
  { id: "AP_E4", type: "E", text: "Preparing a policy proposal for the district collector on reducing water scarcity", indiaSpecific: true },
  { id: "AP_E5", type: "E", text: "Negotiating a deal between two companies as a corporate lawyer", indiaSpecific: false },
  { id: "AP_E6", type: "E", text: "Running a political campaign for a local municipal election", indiaSpecific: true },
  { id: "AP_E7", type: "E", text: "Building a team from scratch for a new startup you have launched", indiaSpecific: false },
  { id: "AP_E8", type: "E", text: "Persuading a bank to fund a social enterprise for rural women", indiaSpecific: true },
  { id: "AP_E9", type: "E", text: "Competing in a national-level business plan competition (like IIM's B-Plan contest)", indiaSpecific: true },
  { id: "AP_E10", type: "E", text: "Managing a film production — coordinating crew, budget, and timeline", indiaSpecific: false },
  { id: "AP_E11", type: "E", text: "Leading a government scheme implementation as a Block Development Officer", indiaSpecific: true },
  { id: "AP_E12", type: "E", text: "Creating and monetising an Instagram or YouTube channel with 100,000+ followers", indiaSpecific: true },
  { id: "AP_E13", type: "E", text: "Taking over and turning around a loss-making family business", indiaSpecific: true },
  { id: "AP_E14", type: "E", text: "Organising and hosting a major cultural festival at your college", indiaSpecific: true },
  { id: "AP_E15", type: "E", text: "Recruiting, training and managing a sales team for a new FMCG product", indiaSpecific: false },

  // ---- Type C — Conventional (structured, precise, organised, rule-based) ----
  { id: "AP_C1", type: "C", text: "Maintaining accurate financial accounts for a charitable trust and preparing annual audit reports", indiaSpecific: true },
  { id: "AP_C2", type: "C", text: "Organising and digitising 20 years of government land records for a district collectorate", indiaSpecific: true },
  { id: "AP_C3", type: "C", text: "Preparing GST filings and tax returns for 50 small business clients", indiaSpecific: true },
  { id: "AP_C4", type: "C", text: "Creating a detailed Excel model to forecast a company's revenue for the next 5 years", indiaSpecific: false },
  { id: "AP_C5", type: "C", text: "Systematically verifying insurance claims by cross-checking medical bills and policy documents", indiaSpecific: false },
  { id: "AP_C6", type: "C", text: "Managing the inventory system of a large hospital pharmacy with zero tolerance for error", indiaSpecific: true },
  { id: "AP_C7", type: "C", text: "Sorting and classifying thousands of legal case files in a court records room", indiaSpecific: true },
  { id: "AP_C8", type: "C", text: "Reconciling accounts in a bank branch at the end of every working day", indiaSpecific: true },
  { id: "AP_C9", type: "C", text: "Running payroll for 500 employees, ensuring accuracy in salary, PF, and tax deductions", indiaSpecific: true },
  { id: "AP_C10", type: "C", text: "Ensuring that all government scheme beneficiaries in a district are correctly documented and verified", indiaSpecific: true },
  { id: "AP_C11", type: "C", text: "Writing precise technical documentation for a software product", indiaSpecific: false },
  { id: "AP_C12", type: "C", text: "Conducting a statistical analysis of census data to identify poverty trends by district", indiaSpecific: true },
  { id: "AP_C13", type: "C", text: "Managing the scheduling and logistics for a hospital's 100+ daily outpatient appointments", indiaSpecific: true },
  { id: "AP_C14", type: "C", text: "Maintaining compliance records for a pharmaceutical company's FDA submissions", indiaSpecific: false },
  { id: "AP_C15", type: "C", text: "Cataloguing and indexing a university library's entire collection using the Dewey Decimal System", indiaSpecific: true },
];

/* =========================================================================
   MODULE B — OCCUPATIONAL TITLE RATINGS (60 careers)
   Format: 5-point appeal scale 1 = Not at all appealing … 5 = Very appealing.
   Instruction: "Rate how appealing each career sounds to you — regardless of
   whether you think you could get into it. Focus purely on whether you would
   enjoy doing it."
   Each career carries a 3-letter Holland code; the rating distributes to those
   types (1st × 0.4, 2nd × 0.2, 3rd × 0.1) in the RIASEC composite.
   ========================================================================= */
const OCCUPATIONS = [
  // Realistic-led
  { id: "OC1", title: "Civil / Structural Engineer", holland: "RIC", sector: "Government / PSU", description: "Designs and supervises construction of buildings, bridges, roads, dams and other infrastructure." },
  { id: "OC2", title: "Automobile Engineer (EV design)", holland: "RIE", sector: "Private / R&D", description: "Designs and develops vehicles and components — increasingly electric — at firms like Tata or Mahindra." },
  { id: "OC3", title: "Agricultural Scientist", holland: "RIS", sector: "Govt Research", description: "Researches crops, soil and farming techniques at ICAR or a Krishi Vigyan Kendra to improve yields." },
  { id: "OC4", title: "Biomedical Equipment Technician", holland: "RIC", sector: "Healthcare", description: "Installs, maintains and repairs medical devices like ventilators, MRI and dialysis machines in hospitals." },
  { id: "OC5", title: "Pilot (commercial / IAF)", holland: "RIC", sector: "Aviation / Defence", description: "Flies passenger or military aircraft, responsible for navigation, safety and crew coordination." },
  { id: "OC6", title: "Navy or Army Technical Officer", holland: "RIC", sector: "Defence", description: "Operates and maintains technical systems — engineering, electronics, weaponry — in the armed forces." },
  { id: "OC7", title: "Architect", holland: "RAI", sector: "Private / Own practice", description: "Designs residential and commercial buildings, balancing aesthetics, function, safety and budget." },
  { id: "OC8", title: "ITI Trade Professional", holland: "RC", sector: "Skilled trades", description: "A skilled tradesperson — electrician, plumber, welder — trained through an Industrial Training Institute." },
  { id: "OC9", title: "Physiotherapist / Sports Medicine", holland: "RSI", sector: "Healthcare / Sports", description: "Helps patients and athletes recover movement and manage pain through physical therapy and rehabilitation." },
  { id: "OC10", title: "Mining / Petroleum Engineer", holland: "RIC", sector: "PSU / Private", description: "Plans and manages the safe extraction of minerals, coal, oil or gas from the earth." },
  // Investigative-led
  { id: "OC11", title: "Data Scientist / AI Engineer", holland: "ICR", sector: "IT / Finance", description: "Builds models from data to find patterns and power AI products at companies like TCS, Infosys or startups." },
  { id: "OC12", title: "Medical Researcher / ICMR Scientist", holland: "IRS", sector: "Govt Research", description: "Investigates diseases, treatments and public-health problems through laboratory and field research." },
  { id: "OC13", title: "Cardiologist / Neurologist", holland: "ISR", sector: "Healthcare", description: "A specialist doctor (AIIMS, Apollo) diagnosing and treating heart or brain and nervous-system conditions." },
  { id: "OC14", title: "Economist", holland: "IEC", sector: "Govt / International", description: "Analyses economic data and advises on policy at institutions like the RBI, World Bank or NITI Aayog." },
  { id: "OC15", title: "Software Architect / Systems Designer", holland: "ICR", sector: "IT MNCs / Startups", description: "Designs the high-level structure of large software systems and guides engineering teams." },
  { id: "OC16", title: "Forensic Scientist", holland: "IRS", sector: "Govt", description: "Applies science to crime investigation — analysing evidence for the CBI or state forensic labs." },
  { id: "OC17", title: "Environmental Scientist", holland: "IRS", sector: "NGO / Research", description: "Studies ecosystems, pollution and climate to protect the environment at bodies like TERI or WWF India." },
  { id: "OC18", title: "Mathematician / Statistician", holland: "ICR", sector: "Academia / Finance", description: "Works on abstract or applied mathematics and statistics at institutes like ISI or CMI, or in finance." },
  { id: "OC19", title: "Psychologist / Psychiatrist", holland: "ISA", sector: "Healthcare / NGO", description: "Studies and treats the mind and behaviour — counselling, therapy or clinical practice (e.g. NIMHANS)." },
  { id: "OC20", title: "Space Scientist (ISRO)", holland: "IRT", sector: "Govt Research", description: "Designs satellites, launch vehicles and space missions at the Indian Space Research Organisation." },
  // Artistic-led
  { id: "OC21", title: "Graphic / UI-UX Designer", holland: "AEI", sector: "Tech / Creative", description: "Designs visual interfaces and brand assets for apps and websites at startups or firms like Canva India." },
  { id: "OC22", title: "Bollywood / OTT Film Director", holland: "AEI", sector: "Entertainment", description: "Leads the creative vision of films or web series — directing actors, story and the whole production." },
  { id: "OC23", title: "Classical Musician / Performer", holland: "AS", sector: "Arts", description: "Performs and teaches Hindustani or Carnatic classical music as a professional artist." },
  { id: "OC24", title: "Fashion Designer (NIFT graduate)", holland: "AE", sector: "Fashion / Retail", description: "Designs clothing and accessories, from concept and fabric to runway and retail collections." },
  { id: "OC25", title: "Architect + Urban Planner", holland: "AIR", sector: "Govt / Private", description: "Plans how cities grow — land use, transport, housing — combining design with public policy." },
  { id: "OC26", title: "Content Creator / Influencer", holland: "AE", sector: "Digital / Media", description: "Builds an audience on YouTube or Instagram, creating videos and monetising through brands and ads." },
  { id: "OC27", title: "Journalist / Documentary Filmmaker", holland: "ASE", sector: "Media", description: "Investigates and tells true stories through news reporting or long-form documentary film." },
  { id: "OC28", title: "Creative Writer / Author", holland: "AI", sector: "Independent", description: "Writes novels, screenplays or other original work, usually as an independent professional." },
  { id: "OC29", title: "Industrial / Product Designer", holland: "AIR", sector: "Manufacturing / Tech", description: "Designs physical products for manufacture — form, usability and engineering (e.g. NID graduate)." },
  { id: "OC30", title: "Animator / VFX Artist", holland: "AR", sector: "Entertainment / IT", description: "Creates animation and visual effects for film, advertising and gaming studios." },
  // Social-led
  { id: "OC31", title: "MBBS Doctor (Govt / Rural Health)", holland: "SIR", sector: "Healthcare / Govt", description: "A general physician diagnosing and treating patients, often serving rural and government health systems." },
  { id: "OC32", title: "School Teacher / Professor", holland: "SEC", sector: "Education", description: "Educates students in a school or government college, shaping knowledge and character." },
  { id: "OC33", title: "IAS / IPS Officer", holland: "ESI", sector: "Govt / Administration", description: "A senior civil servant — District Collector or Superintendent of Police — running administration and law." },
  { id: "OC34", title: "Social Worker / NGO Programme Director", holland: "SA", sector: "Development sector", description: "Designs and runs programmes that improve lives of vulnerable communities in the development sector." },
  { id: "OC35", title: "Speech Therapist / Special Educator", holland: "SI", sector: "Healthcare / Education", description: "Helps children and adults with speech, language or learning difficulties to communicate and learn." },
  { id: "OC36", title: "HR Manager / Organisational Development", holland: "SE", sector: "Corporate", description: "Manages hiring, people development and workplace culture inside an organisation." },
  { id: "OC37", title: "Community Development Officer", holland: "SE", sector: "Govt / Rural", description: "Implements rural development and welfare schemes (DRDA, MNREGA) at the grassroots." },
  { id: "OC38", title: "Counsellor / Psychotherapist", holland: "SIA", sector: "Mental health", description: "Supports people's mental health through talk-based counselling and therapy." },
  { id: "OC39", title: "Nurse / Midwife", holland: "SIR", sector: "Healthcare", description: "Provides patient care, supports doctors and assists childbirth at AIIMS or district hospitals." },
  { id: "OC40", title: "Foreign Service Officer (IFS)", holland: "ESI", sector: "Govt / International", description: "Represents India abroad as a diplomat, handling foreign policy, embassies and international relations." },
  // Enterprising-led
  { id: "OC41", title: "Entrepreneur / Startup Founder", holland: "EAI", sector: "Own venture", description: "Builds a business from an idea — raising funds, building teams and taking on financial risk." },
  { id: "OC42", title: "Investment Banker", holland: "ECR", sector: "Finance", description: "Advises companies on raising capital, mergers and deals at firms like Goldman Sachs, Kotak or ICICI." },
  { id: "OC43", title: "Corporate Lawyer / Litigation Advocate", holland: "ECI", sector: "Law", description: "Advises clients and argues cases — from corporate contracts to litigation at the Supreme Court." },
  { id: "OC44", title: "Management Consultant", holland: "ECI", sector: "Consulting", description: "Solves business problems for client companies at firms like McKinsey or BCG India." },
  { id: "OC45", title: "Politician / Elected Representative", holland: "ESC", sector: "Politics", description: "Seeks elected office (MLA, MP) to represent citizens and shape laws and public policy." },
  { id: "OC46", title: "Real Estate / Infrastructure Developer", holland: "ERC", sector: "Real estate", description: "Plans, finances and builds residential or commercial real-estate and infrastructure projects." },
  { id: "OC47", title: "Film Producer / Events Manager", holland: "EAR", sector: "Entertainment", description: "Organises the money, people and logistics behind films, shows and large events." },
  { id: "OC48", title: "Sales Director / Business Development Head", holland: "EC", sector: "Corporate", description: "Leads sales strategy and revenue growth, often for FMCG and consumer companies." },
  { id: "OC49", title: "Brand Manager / Marketing Director", holland: "ECA", sector: "FMCG / Consumer", description: "Owns a brand's strategy, positioning and campaigns at companies like HUL or P&G India." },
  { id: "OC50", title: "Digital Marketing Entrepreneur / Agency Owner", holland: "EAC", sector: "Digital / Own business", description: "Runs a digital marketing agency — SEO, social media and ads — as an independent business." },
  // Conventional-led
  { id: "OC51", title: "Chartered Accountant", holland: "CEI", sector: "Finance", description: "Audits accounts, plans tax and advises on finance — at a Big 4 firm or running an own CA practice." },
  { id: "OC52", title: "Bank Manager / RBI Officer", holland: "CER", sector: "Banking", description: "Manages a bank branch or works in central banking, overseeing operations, credit and compliance." },
  { id: "OC53", title: "Financial Analyst / CFA", holland: "CIE", sector: "Finance", description: "Analyses investments, markets and company performance for funds and institutions (NSE, BSE)." },
  { id: "OC54", title: "Government Administrative Officer", holland: "CES", sector: "Govt", description: "Runs day-to-day government administration after clearing SSC CGL or a State PSC exam." },
  { id: "OC55", title: "Insurance Actuary", holland: "CIR", sector: "Finance / Insurance", description: "Uses mathematics and statistics to assess risk and price insurance and pension products." },
  { id: "OC56", title: "Pharmacist / Drug Inspector", holland: "CIR", sector: "Healthcare / Govt", description: "Dispenses medicines safely or inspects drug quality and licensing for the government." },
  { id: "OC57", title: "IT Project Manager / Scrum Master", holland: "CEI", sector: "IT", description: "Plans, tracks and delivers software projects, coordinating engineering teams and timelines." },
  { id: "OC58", title: "Tax Consultant / GST Practitioner", holland: "CEI", sector: "Finance", description: "Advises individuals and businesses on tax and GST compliance, filings and planning." },
  { id: "OC59", title: "Library and Information Scientist", holland: "CI", sector: "Academia / Govt", description: "Organises, catalogues and manages information and knowledge resources in libraries and archives." },
  { id: "OC60", title: "Company Secretary (ICSI)", holland: "CES", sector: "Corporate", description: "Ensures a company follows the law and governance rules, managing compliance and board matters." },
];

/* =========================================================================
   MODULE C — WORK VALUES INVENTORY (40 items)
   Part 1: 28 Likert (1 = Not important at all … 5 = Extremely important).
   Part 2: 8 forced-choice value-conflict pairs.
   Part 3: top-5 value ranking (11 values).
   11 value scales: Security, Prestige, FinGrowth, WLB, Altruism, Autonomy,
   Innovation, Intellectual, FamilyDuty★, SocietalContribution★, Stability★.
   ========================================================================= */
const WORK_VALUES_LIKERT = [
  { id: "WV1", scale: "Security", text: "My career gives me a guaranteed income every month regardless of market conditions.", indiaSpecific: true },
  { id: "WV2", scale: "Security", text: "I will have a pension and retirement benefits that keep me secure in old age.", indiaSpecific: true },
  { id: "WV3", scale: "Security", text: "My job cannot easily be taken away — I have strong tenure protection.", indiaSpecific: false },
  { id: "WV4", scale: "Prestige", text: "My career earns me respect in my community and among my relatives.", indiaSpecific: true },
  { id: "WV5", scale: "Prestige", text: "My job title and position are ones that my family can be proud of.", indiaSpecific: true },
  { id: "WV6", scale: "Prestige", text: "My work brings recognition in society — people know who I am and what I do.", indiaSpecific: false },
  { id: "WV7", scale: "FinGrowth", text: "My earnings have significant potential to grow over time — well beyond my starting salary.", indiaSpecific: false },
  { id: "WV8", scale: "FinGrowth", text: "I have opportunities to earn performance-based bonuses, equity, or profit shares.", indiaSpecific: false },
  { id: "WV9", scale: "FinGrowth", text: "Within 10 years, I can earn enough to buy a house and support my family comfortably.", indiaSpecific: true },
  { id: "WV10", scale: "Autonomy", text: "I can choose how and when I work — without a boss telling me every step.", indiaSpecific: false },
  { id: "WV11", scale: "Autonomy", text: "I can make important decisions in my work without needing approval from many layers.", indiaSpecific: false },
  { id: "WV12", scale: "WLB", text: "I have enough time for family, festivals, and personal interests outside of work.", indiaSpecific: true },
  { id: "WV13", scale: "WLB", text: "My career allows me to be present for my children and ageing parents when needed.", indiaSpecific: true },
  { id: "WV14", scale: "WLB", text: "I do not have to work nights, weekends, or extreme overtime regularly.", indiaSpecific: false },
  { id: "WV15", scale: "Altruism", text: "My work directly improves the lives of people who are poor, sick, or marginalised.", indiaSpecific: true },
  { id: "WV16", scale: "Altruism", text: "I can contribute to solving a large social problem through my career.", indiaSpecific: false },
  { id: "WV17", scale: "Altruism", text: "Knowing that my work matters for society gives me deep personal satisfaction.", indiaSpecific: false },
  { id: "WV18", scale: "Innovation", text: "I regularly get to try new ideas, methods, or approaches — not just follow the same routine.", indiaSpecific: false },
  { id: "WV19", scale: "Innovation", text: "My career is in a field where new discoveries and disruptions are happening constantly.", indiaSpecific: false },
  { id: "WV20", scale: "Innovation", text: "I can create something genuinely new — a product, an idea, a piece of work that did not exist before.", indiaSpecific: false },
  { id: "WV21", scale: "Intellectual", text: "My work constantly challenges me to learn, think deeply, and solve complex problems.", indiaSpecific: false },
  { id: "WV22", scale: "Intellectual", text: "I am surrounded by very smart, knowledgeable colleagues from whom I keep learning.", indiaSpecific: false },
  { id: "WV23", scale: "FamilyDuty", text: "My career supports my parents and family — I can contribute financially to the household.", indiaSpecific: true },
  { id: "WV24", scale: "FamilyDuty", text: "My career choice does not cause major conflict with my parents or extended family.", indiaSpecific: true },
  { id: "WV25", scale: "FamilyDuty", text: "I can practise my religion, observe fasts and festivals, without my career forcing me to skip them.", indiaSpecific: true },
  { id: "WV26", scale: "SocietalContribution", text: "My career contributes to India's progress as a developing nation.", indiaSpecific: true },
  { id: "WV27", scale: "SocietalContribution", text: "I am working on problems that are specific to India — not just global issues irrelevant here.", indiaSpecific: true },
  { id: "WV28", scale: "Stability", text: "I prefer a known, stable career path over a volatile, high-risk, high-reward one.", indiaSpecific: true },
];

const WORK_VALUES_FC = [
  { id: "WVFC1", optionA: { text: "A career with complete job security (government job, pension)", value: "Security" }, optionB: { text: "A career with high earning potential but less security (private sector, startup)", value: "FinGrowth" } },
  { id: "WVFC2", optionA: { text: "A career that earns strong family / community respect (doctor, IAS)", value: "Prestige" }, optionB: { text: "A career that gives you maximum personal freedom and autonomy (entrepreneur, artist)", value: "Autonomy" } },
  { id: "WVFC3", optionA: { text: "A career where you make a real difference to the poor and marginalised", value: "Altruism" }, optionB: { text: "A career where you earn a high income and build personal wealth", value: "FinGrowth" } },
  { id: "WVFC4", optionA: { text: "A stable career your family supports and approves of", value: "FamilyDuty" }, optionB: { text: "A career you are passionate about, even if your family has strong reservations", value: "Autonomy" } },
  { id: "WVFC5", optionA: { text: "A career with excellent work-life balance (evenings and weekends free)", value: "WLB" }, optionB: { text: "A career with very high income potential that requires long, intense work hours", value: "FinGrowth" } },
  { id: "WVFC6", optionA: { text: "A career where you work on India's specific problems (poverty, health, infrastructure)", value: "SocietalContribution" }, optionB: { text: "A career in a global company / platform, solving universal problems and earning globally", value: "Innovation" } },
  { id: "WVFC7", optionA: { text: "A career that is intellectually challenging and keeps you constantly learning", value: "Intellectual" }, optionB: { text: "A career that is comfortable, predictable, and low-stress once you learn the job", value: "Stability" } },
  { id: "WVFC8", optionA: { text: "A career in a field that is stable and well-established (law, medicine, engineering)", value: "Stability" }, optionB: { text: "A career in a new, fast-growing field that didn't exist 10 years ago (AI, clean energy, space tech)", value: "Innovation" } },
];

// Part 3 — top-5 ranking pool. Students rank their top 5 (1 = most important).
const VALUE_RANK_OPTIONS = [
  { value: "Security", label: "Security", description: "Guaranteed income, job stability, pension" },
  { value: "Prestige", label: "Prestige", description: "Social respect, family honour, recognition" },
  { value: "FinGrowth", label: "Financial Growth", description: "High earning potential, wealth building" },
  { value: "WLB", label: "Work-Life Balance", description: "Time for family, festivals, personal life" },
  { value: "Altruism", label: "Altruism / Service", description: "Helping the poor, underprivileged, marginalised" },
  { value: "Autonomy", label: "Autonomy", description: "Freedom to work on your own terms" },
  { value: "Innovation", label: "Innovation", description: "Creating new things, working on cutting-edge problems" },
  { value: "Intellectual", label: "Intellectual Challenge", description: "Constant learning, complex problems" },
  { value: "FamilyDuty", label: "Family Duty", description: "Supporting family, avoiding family conflict", indiaSpecific: true },
  { value: "SocietalContribution", label: "Societal Contribution", description: "Contributing to India's development", indiaSpecific: true },
  { value: "Stability", label: "Stability", description: "Predictable, low-risk career path", indiaSpecific: true },
];

/* =========================================================================
   MODULE D — CAREER MOTIVATIONS (25 items)
   Format: 5-pt Likert (1 = Strongly Disagree … 5 = Strongly Agree).
   Measures WHY a student wants what they want — intrinsic passion vs extrinsic
   obligation. Based on McClelland (Achievement/Power/Affiliation) +
   Self-Determination Theory (Intrinsic/Extrinsic). Extrinsic items are NOT
   reverse scored; a high Extrinsic score is reported neutrally.
   Scales: Achievement(4), Power(4), Affiliation(3), Mastery(4),
   SocietalImpact(4), Intrinsic(3), Extrinsic(3).
   ========================================================================= */
const MOTIVATIONS = [
  { id: "MT1", scale: "Achievement", text: "I set myself very high personal standards and feel genuinely upset if I fall short — even if others think my performance was fine.", indiaSpecific: false },
  { id: "MT2", scale: "Achievement", text: "The idea of becoming the best in my chosen field — truly expert — excites me more than any other career goal.", indiaSpecific: false },
  { id: "MT3", scale: "Achievement", text: "I keep a mental scorecard of my performance over time and push myself to beat my own previous results.", indiaSpecific: false },
  { id: "MT4", scale: "Achievement", text: "Receiving a gold medal, a top rank, or public recognition for excellence is deeply motivating to me.", indiaSpecific: false },
  { id: "MT5", scale: "Power", text: "I want my career to give me the power to change things — laws, policies, systems — not just work within them.", indiaSpecific: false },
  { id: "MT6", scale: "Power", text: "I am energised by the idea of leading large organisations or having influence over many people's lives.", indiaSpecific: false },
  { id: "MT7", scale: "Power", text: "The thought of being an IAS officer, a CEO, or a senior politician genuinely excites me.", indiaSpecific: true },
  { id: "MT8", scale: "Power", text: "I want a platform from which I can speak and be heard — not just execute others' decisions.", indiaSpecific: false },
  { id: "MT9", scale: "Affiliation", text: "The best part of any career would be the relationships — working with good people, building a team, being part of a community.", indiaSpecific: false },
  { id: "MT10", scale: "Affiliation", text: "I find deep satisfaction in being a trusted, valued member of a group — a team, a class, a community.", indiaSpecific: false },
  { id: "MT11", scale: "Affiliation", text: "A career that isolates me from people — even if intellectually stimulating — would make me miserable.", indiaSpecific: false },
  { id: "MT12", scale: "Mastery", text: "I am most engaged when I am learning something genuinely new — a new subject, a new skill, a new perspective.", indiaSpecific: false },
  { id: "MT13", scale: "Mastery", text: "I would willingly take a lower-paying job if it offered dramatically better learning and skill development.", indiaSpecific: false },
  { id: "MT14", scale: "Mastery", text: "Becoming a true expert — someone who knows a field more deeply than almost anyone — is a core career goal for me.", indiaSpecific: false },
  { id: "MT15", scale: "Mastery", text: "I feel 'flow' (completely absorbed, time flying by) when I am learning something difficult but interesting.", indiaSpecific: false },
  { id: "MT16", scale: "SocietalImpact", text: "Making a tangible, visible difference in the lives of ordinary Indians is the most important outcome I want from my career.", indiaSpecific: true },
  { id: "MT17", scale: "SocietalImpact", text: "A high-paying career with no positive societal contribution would feel hollow to me.", indiaSpecific: false },
  { id: "MT18", scale: "SocietalImpact", text: "I want to look back in 30 years and feel that India is a little better because of the work I did.", indiaSpecific: true },
  { id: "MT19", scale: "SocietalImpact", text: "Contributing to India's transformation — making it a more equal, educated, and healthy country — is a genuine career motivation for me.", indiaSpecific: true },
  { id: "MT20", scale: "Intrinsic", text: "I am choosing my career primarily because I genuinely love the work itself — not because of the salary, status, or parental approval.", indiaSpecific: false },
  { id: "MT21", scale: "Intrinsic", text: "When I imagine my ideal career, the thing I feel most strongly is that I want to do work I find personally meaningful.", indiaSpecific: false },
  { id: "MT22", scale: "Intrinsic", text: "I would pursue this career even if nobody else approved of it — family, friends, or society.", indiaSpecific: false },
  { id: "MT23", scale: "Extrinsic", text: "Honestly, much of my career thinking is driven by what my parents want or what is considered respectable in my community.", indiaSpecific: true },
  { id: "MT24", scale: "Extrinsic", text: "I am primarily drawn to careers that will impress others — relatives, society, future partners.", indiaSpecific: true },
  { id: "MT25", scale: "Extrinsic", text: "If I were completely free from all financial pressure and family expectations, my career choice might be quite different from what I am currently planning.", indiaSpecific: false },
];

/* =========================================================================
   MODULE E — WORK ENVIRONMENT PREFERENCES (20 items)
   Produces a FILTER PROFILE that constrains the career recommendation list —
   not a scored construct. 5 sector forced-choice pairs + 10 bipolar work-style
   items (1 = strongly prefer the first end … 5 = strongly prefer the second).
   ========================================================================= */
const ENV_SECTOR_FC = [
  { id: "ENV1", optionA: { text: "Large, stable government job (UPSC, PSC, Banking, PSU) — predictable growth, pension, authority", key: "GovtSector" }, optionB: { text: "Private MNC or Indian corporate (Tata, Infosys, HUL) — higher salary, faster growth, less security", key: "PrivateSector" } },
  { id: "ENV2", optionA: { text: "Startup / entrepreneurial environment — high risk, high reward, rapid learning, uncertain income", key: "Startup" }, optionB: { text: "Family business or established traditional trade — lower risk, known industry, family relationship dynamics", key: "FamilyBusiness" } },
  { id: "ENV3", optionA: { text: "Social sector / NGO / development organisation — lower pay, high impact, mission-driven work", key: "SocialSector" }, optionB: { text: "Self-employed / independent professional (lawyer, CA, doctor in own practice) — autonomy, variable income", key: "Independent" } },
  { id: "ENV4", optionA: { text: "Work primarily indoors in a controlled office environment", key: "OfficeWork" }, optionB: { text: "Work primarily outdoors, in the field, travelling — unpredictable but dynamic", key: "FieldWork" } },
  { id: "ENV5", optionA: { text: "Work in a metro city (Delhi, Mumbai, Bengaluru, Hyderabad, Chennai)", key: "Metro" }, optionB: { text: "Work in a Tier-2 or Tier-3 city or rural area — lower cost of living, closer to home, different lifestyle", key: "Tier2Rural" } },
];

// Bipolar 1..5 (left end = 1, right end = 5). "maps" notes the derived filter field.
const WORK_STYLE = [
  { id: "WS1", left: "Working independently on deep, focused work", right: "Working with a team — collaborating, discussing, jointly deciding", maps: "teamwork" },
  { id: "WS2", left: "A fixed, predictable daily schedule", right: "A varied schedule that changes day-to-day", maps: "variety" },
  { id: "WS3", left: "Clear rules and defined procedures to follow", right: "Creative freedom and self-directed work methods", maps: "structure" },
  { id: "WS4", left: "Working with data, systems, and information", right: "Working with people face-to-face daily", maps: "peopleVsData" },
  { id: "WS5", left: "A specialist role — being very deep in one area", right: "A generalist role — involved in many different things", maps: "specialistVsGeneralist" },
  { id: "WS6", left: "Leading and directing others' work", right: "Being an individual contributor without people management", maps: "leadership" },
  { id: "WS7", left: "Working from home or remotely most of the time", right: "Working from an office or on-site, with colleagues physically present", maps: "wfh" },
  { id: "WS8", left: "A career that is geographically stable — I can stay in one city", right: "A career that involves significant travel within India or internationally", maps: "travel" },
  { id: "WS9", left: "Working in a small organisation where everyone knows each other", right: "Working in a large organisation with scale, brand, and structure", maps: "orgSize" },
  { id: "WS10", left: "A career where I can work part-time or have significant time flexibility", right: "A full-time, demanding career where output is the primary measure", maps: "intensity" },
];

/* =========================================================================
   MODULE F — SITUATIONAL JUDGMENT TESTS (15 scenarios, Indian career dilemmas)
   Format: MO/LO (Most-Likely / Least-Likely). 4 options per scenario.
   Each option carries moPoints (0–3) reflecting how adaptive it is for the
   competencies measured. There is no universally correct answer — responses
   are interpreted against the student's own values profile (Module C/D).
   ========================================================================= */
const SJT_T2 = [
  {
    id: "SJT_T2_1",
    title: "The UPSC Dream vs the Engineering Seat",
    competencies: ["Intrinsic Motivation", "Pragmatism", "Risk-Tolerance"],
    classFocus: "Class 12 / Post-board decision",
    scenario:
      "Arjun has cleared JEE with a rank that will get him into a good NIT for Engineering. He has also always had a deep desire to become an IAS officer to make policy-level change. His father, an engineer, is pushing strongly: 'UPSC is a gamble — 99% fail. Take the NIT seat, get a job, then try if you want.' Arjun's profile shows high Enterprising and Social interests and strong Power motivation.",
    options: [
      { key: "A", text: "Accept the NIT seat — father knows best, and engineering is a reliable foundation even for UPSC preparation.", moPoints: 1, note: "Family-Congruence but low Initiative" },
      { key: "B", text: "Decline the NIT seat, take a gap year, and begin UPSC preparation from Day 1 — all in.", moPoints: 1, note: "Intrinsic motivation but high Risk-Taking" },
      { key: "C", text: "Accept the NIT seat but plan strategically: use 4 years of engineering to build the analytical foundation for UPSC Mains, and begin optional-subject preparation alongside B.Tech.", moPoints: 3, note: "Pragmatism + Strategic Thinking + Delayed Gratification" },
      { key: "D", text: "Accept the NIT seat, complete engineering, take a job for 2 years to satisfy family, then resign and attempt UPSC — a delayed but staged plan.", moPoints: 2, note: "Pragmatic but a 2-year delay weakens the UPSC preparation window" },
    ],
  },
  {
    id: "SJT_T2_2",
    title: "The Startup Offer vs the Bank Job",
    competencies: ["Risk-Tolerance", "FinGrowth", "Security", "Autonomy"],
    classFocus: "Post-graduation / UG final year",
    scenario:
      "Priya has just graduated with a B.Com (Hons) from Delhi University. She has two offers: (i) a government bank probationary officer position (₹45,000/month, full security, pension); (ii) a Series-A funded EdTech startup in Bengaluru as Finance Manager (₹65,000/month, ESOPs, no job guarantee beyond 12 months). Her values show high Innovation, moderate Security, and high FinGrowth. Her parents strongly prefer the bank job.",
    options: [
      { key: "A", text: "Take the bank job — financial security and parental support are worth more than the marginal salary difference.", moPoints: 2, note: "Highest MO for a high Security + FamilyDuty profile" },
      { key: "B", text: "Take the startup job — ESOPs could be worth ₹50–100 lakh in 3 years if the startup does well, and the learning is irreplaceable.", moPoints: 2, note: "Highest MO for a high Innovation + FinGrowth profile" },
      { key: "C", text: "Negotiate with the startup for a 3-month probation period to evaluate culture and stability before declining the bank offer.", moPoints: 3, note: "Pragmatic risk-management — preserves both options" },
      { key: "D", text: "Take the bank job, but spend 2 years learning startup finance through side projects and online courses, then move.", moPoints: 2, note: "Pragmatic compound strategy" },
    ],
  },
  {
    id: "SJT_T2_3",
    title: "The Family Business Dilemma",
    competencies: ["Family Duty", "Autonomy", "Achievement", "Intrinsic Motivation"],
    classFocus: "Class 11–12 / Post-graduation",
    scenario:
      "Rohan's family has a successful textile trading business in Surat. His father has always assumed Rohan will join after graduation. Rohan, however, has developed a strong interest in film direction after winning a short-film competition at his college. His profile shows very high Artistic interests and high Intrinsic motivation but moderate Family-Duty values.",
    options: [
      { key: "A", text: "Join the family business — it is financially secure, and he can always pursue film as a hobby.", moPoints: 1, note: "Family-Congruence but suppresses high Intrinsic motivation" },
      { key: "B", text: "Tell his father honestly that he does not want to join the business, and enroll in a film school (FTII, SRFTI, or a private film institute).", moPoints: 2, note: "Highest MO for very high Artistic + high Intrinsic motivation" },
      { key: "C", text: "Propose a compromise: manage the family business for 3 years, save money, then self-fund a short film to demonstrate seriousness before making the full switch.", moPoints: 3, note: "Balances moderate Family-Duty with high Achievement" },
      { key: "D", text: "Enroll in a Business Management programme that includes a media module — combine both worlds before making a decision.", moPoints: 2, note: "Exploratory hedge; defers the core decision" },
    ],
  },
  {
    id: "SJT_T2_4",
    title: "The Rural Posting Dilemma",
    competencies: ["Societal Contribution", "WLB", "Altruism", "Security"],
    classFocus: "Post-MBBS / Government service",
    scenario:
      "Kavitha has completed her MBBS and been allocated a government posting as a Medical Officer at a PHC in Vidarbha (rural Maharashtra) — ₹65,000/month, government accommodation, strong rural-health impact. She can accept it or apply for a transfer to a district hospital in Pune. Her profile shows high Social interests, high Altruism, and moderate WLB values.",
    options: [
      { key: "A", text: "Accept the rural posting enthusiastically — rural healthcare need is enormous and this is exactly why she studied medicine.", moPoints: 2, note: "Highest MO for very high Altruism + Societal Contribution" },
      { key: "B", text: "Apply for a Pune transfer — she can serve patients better in a well-equipped facility with specialist support.", moPoints: 1, note: "Highest MO for high WLB + Prestige" },
      { key: "C", text: "Accept the rural posting for 2 years (as required by bond), but during this time prepare for post-graduate entrance exams to become a specialist.", moPoints: 3, note: "Highest MO for high Achievement + Mastery — honours the bond and builds a future" },
      { key: "D", text: "Request a posting in a small town rather than deep rural — a middle ground between impact and personal wellbeing.", moPoints: 2, note: "Pragmatic compromise" },
    ],
  },
  {
    id: "SJT_T2_5",
    title: "The Creative Career Shame",
    competencies: ["Intrinsic Motivation", "Prestige", "Family Duty", "Autonomy"],
    classFocus: "Class 9–11 stream / career exploration",
    scenario:
      "Simran (Class 11, Commerce) has an extraordinary talent for fashion design and has won state-level design competitions twice. Her extended family is dismissive when she mentions fashion school (NIFT, Pearl Academy): 'Fashion is not even a career? Why not do MBA or CA?' Her parents are unsure but not openly discouraging. Her profile: very high Artistic, high Autonomy need, high Intrinsic motivation.",
    options: [
      { key: "A", text: "Give up on fashion design and do a conventional Commerce course — family harmony is more important than personal passion.", moPoints: 1, note: "Suppresses very high Intrinsic motivation" },
      { key: "B", text: "Apply to NIFT and NID entrance exams seriously, research career outcomes (Manish Malhotra, Sabyasachi, NIFT placement data), and present a well-researched case to her parents.", moPoints: 3, note: "Highest MO for high Artistic + high Intrinsic + low Prestige dependence" },
      { key: "C", text: "Do a B.Com or BMS first to satisfy family, then do a post-graduate diploma in fashion — proving conventional academic ability first.", moPoints: 2, note: "Moderate Family-Duty hedge" },
      { key: "D", text: "Continue pursuing fashion as an intense hobby and self-learning track while doing a conventional degree, committing professionally only once financially independent.", moPoints: 2, note: "High WLB + Stability seeker; delays commitment" },
    ],
  },
  {
    id: "SJT_T2_6",
    title: "The Passion Penalty — NGO vs Corporate Pay",
    competencies: ["Altruism", "FinGrowth", "Family Duty"],
    classFocus: "UG final year / Post-graduation",
    scenario:
      "Meera has offers from a respected development NGO (₹30,000/month, deep social impact, rural postings) and a corporate CSR role at an MNC (₹70,000/month, urban, structured). Her family has loans to repay. Her profile shows very high Altruism and Societal Contribution but real financial pressure at home.",
    options: [
      { key: "A", text: "Take the NGO role immediately — impact matters more than money, and she can adjust her lifestyle.", moPoints: 1, note: "Honours Altruism but ignores genuine financial duty" },
      { key: "B", text: "Take the corporate CSR role — it pays the family loans and still lets her work on social impact within a company.", moPoints: 3, note: "Balances Altruism with real FamilyDuty and FinGrowth" },
      { key: "C", text: "Take the corporate role for 3–4 years to clear loans and build savings, then move to the development sector with financial security.", moPoints: 3, note: "Pragmatic staged plan honouring both values" },
      { key: "D", text: "Reject both and keep searching for a high-paying pure-impact role that may not exist at this stage.", moPoints: 0, note: "Unrealistic; risks unemployment" },
    ],
  },
  {
    id: "SJT_T2_7",
    title: "The Coaching Centre vs Self-Study Dilemma",
    competencies: ["Pragmatism", "Autonomy", "Achievement"],
    classFocus: "Class 11–12",
    scenario:
      "Imran is preparing for NEET. An expensive coaching centre (₹2 lakh/year) promises results, but he is a disciplined self-learner who finds the classes too slow. His parents believe coaching is essential 'because everyone does it'. His profile shows high Autonomy and high Achievement.",
    options: [
      { key: "A", text: "Join the coaching centre fully — parents are paying and 'everyone does it', so it must be the safe choice.", moPoints: 1, note: "Low Autonomy; ignores self-knowledge" },
      { key: "B", text: "Skip formal coaching entirely and self-study with free and low-cost online resources, tracking mock-test scores rigorously.", moPoints: 2, note: "High Autonomy but high risk if discipline slips" },
      { key: "C", text: "Take a test-series and doubt-clearing package (not full classroom coaching) to combine self-study with structured benchmarking.", moPoints: 3, note: "Pragmatic blend honouring Autonomy and Achievement" },
      { key: "D", text: "Join coaching but secretly skip most classes to self-study, without telling parents.", moPoints: 0, note: "Low Integrity; wastes family money" },
    ],
  },
  {
    id: "SJT_T2_8",
    title: "The STEM Student Who Loves Economics",
    competencies: ["Intrinsic Motivation", "Pragmatism", "Identity Clarity"],
    classFocus: "Class 11–12 / Stream review",
    scenario:
      "Sneha took PCM expecting to do engineering, but in Class 11 she has fallen in love with economics and data. Switching now feels disruptive and her teachers warn her against 'wasting' her science seat. Her profile shows high Investigative and Enterprising interests and high Intrinsic motivation toward economics.",
    options: [
      { key: "A", text: "Stick with engineering — she has already invested in PCM and switching looks like indecision.", moPoints: 1, note: "Sunk-cost thinking; suppresses genuine interest" },
      { key: "B", text: "Research bridge pathways: economics via CUET, B.Sc Economics, or engineering-plus-economics routes (e.g., data science), then choose deliberately.", moPoints: 3, note: "Evidence-based, honours Intrinsic interest pragmatically" },
      { key: "C", text: "Abruptly drop PCM mid-year without a concrete plan because she dislikes it.", moPoints: 1, note: "Impulsive; lacks planning" },
      { key: "D", text: "Finish PCM, take engineering, and treat economics purely as a hobby she may never use.", moPoints: 1, note: "Safe but likely long-term dissatisfaction" },
    ],
  },
  {
    id: "SJT_T2_9",
    title: "Joint Family vs Career Mobility",
    competencies: ["Family Duty", "Autonomy", "Pragmatism"],
    classFocus: "Class 12 / UG",
    scenario:
      "Ankit has a strong career opportunity that requires relocating from his hometown to Bengaluru. He lives in a joint family where he is expected to stay close and support ageing grandparents. His profile shows high FamilyDuty values but also strong career ambition.",
    options: [
      { key: "A", text: "Decline the opportunity and stay home — family responsibilities come first, no discussion needed.", moPoints: 1, note: "Honours FamilyDuty but forecloses growth without exploring options" },
      { key: "B", text: "Take the opportunity and move immediately, treating family concerns as something they'll adjust to.", moPoints: 1, note: "Honours Autonomy but disregards genuine FamilyDuty" },
      { key: "C", text: "Have an open family conversation, propose a trial period with regular visits and financial support sent home, and arrange backup care for grandparents.", moPoints: 3, note: "Balances FamilyDuty and Autonomy through dialogue" },
      { key: "D", text: "Look for a comparable opportunity closer to home as a first choice, keeping the Bengaluru offer as backup.", moPoints: 2, note: "Pragmatic compromise" },
    ],
  },
  {
    id: "SJT_T2_10",
    title: "Two Dream Careers — Doctor vs IAS",
    competencies: ["Identity Clarity", "Achievement", "Societal Contribution"],
    classFocus: "Class 12 / Drop year",
    scenario:
      "Fatima is torn between MBBS (she loves medicine and healing) and the civil services (she wants systemic, policy-level impact). Both are realistic for her. Her profile shows high Social and Investigative interests with strong Societal Impact and Power motivation.",
    options: [
      { key: "A", text: "Pick whichever her relatives say is more prestigious, to avoid endless deliberation.", moPoints: 0, note: "Externally driven; low Identity Clarity" },
      { key: "B", text: "Pursue MBBS first — she can still attempt UPSC later, and many doctors become administrators in public health.", moPoints: 3, note: "Keeps both pathways open; aligns healing + systemic impact" },
      { key: "C", text: "Commit fully to UPSC preparation now, foregoing medicine, because policy impact is her strongest motivation.", moPoints: 2, note: "Coherent if Power/Impact truly dominate" },
      { key: "D", text: "Attempt both NEET and UPSC foundation simultaneously without prioritising, hoping one works out.", moPoints: 1, note: "Spreads effort thin; high burnout risk" },
    ],
  },
  {
    id: "SJT_T2_11",
    title: "Digital Content Creator as a Serious Career",
    competencies: ["Autonomy", "Risk-Tolerance", "Family Duty"],
    classFocus: "Class 11–12",
    scenario:
      "Vikram has built a YouTube channel to 80,000 subscribers explaining science in Hindi, earning modest ad income. His parents see it as a distraction from 'real studies'. His profile shows very high Artistic and Enterprising interests and high Autonomy.",
    options: [
      { key: "A", text: "Shut the channel down to focus only on conventional studies and avoid family friction.", moPoints: 1, note: "Suppresses a genuine, monetisable talent" },
      { key: "B", text: "Drop formal education plans and go full-time on content creation immediately.", moPoints: 1, note: "High risk; abandons fallback at an early stage" },
      { key: "C", text: "Continue education while treating the channel as a serious parallel venture, tracking growth and income to show parents real evidence over time.", moPoints: 3, note: "Balances Autonomy and FamilyDuty with evidence" },
      { key: "D", text: "Pause the channel during board exams, then scale it deliberately afterward with a clear plan.", moPoints: 2, note: "Pragmatic sequencing" },
    ],
  },
  {
    id: "SJT_T2_12",
    title: "The Science Student Who Wants to Be a Musician",
    competencies: ["Intrinsic Motivation", "Family Duty", "Pragmatism"],
    classFocus: "Class 11–12",
    scenario:
      "Aditya is a strong PCB student whose family expects medicine, but his deepest passion is Hindustani classical music, which he has trained in since childhood. His profile shows very high Artistic interests and high Intrinsic motivation, with high family expectations.",
    options: [
      { key: "A", text: "Abandon music and pursue medicine — it is the responsible, respectable choice.", moPoints: 1, note: "Honours FamilyDuty but suppresses core identity" },
      { key: "B", text: "Reject medicine outright and pursue music full-time against family wishes.", moPoints: 1, note: "Honours passion but disregards family and security entirely" },
      { key: "C", text: "Explore careers that bridge both — music therapy, ethnomusicology, or a science degree with serious parallel music training — and discuss a trial plan with family.", moPoints: 3, note: "Integrative; honours Intrinsic motivation and FamilyDuty" },
      { key: "D", text: "Pursue medicine but commit to performing and teaching music seriously on the side, revisiting the choice after graduation.", moPoints: 2, note: "Pragmatic dual-track" },
    ],
  },
  {
    id: "SJT_T2_13",
    title: "First-Generation Student vs Family Business Expectations",
    competencies: ["Family Duty", "Achievement", "Initiative"],
    classFocus: "Class 12 / UG",
    scenario:
      "Sunita is the first in her family to reach Class 12. Her family runs a small kirana shop and expects her to help run it rather than 'waste time' on higher studies. Her profile shows high Achievement and Investigative interests and strong intrinsic drive to study further.",
    options: [
      { key: "A", text: "Drop higher-study plans and join the shop — the family needs help and that's the expected path.", moPoints: 1, note: "Honours immediate FamilyDuty but forecloses potential" },
      { key: "B", text: "Seek out scholarships, government schemes and mentors, and present a concrete plan showing how higher education will benefit the whole family.", moPoints: 3, note: "Initiative + Achievement; reframes FamilyDuty for the long term" },
      { key: "C", text: "Quietly apply to colleges without telling the family, planning to reveal it only if selected.", moPoints: 1, note: "Low transparency; risks deeper family conflict" },
      { key: "D", text: "Help in the shop part-time while pursuing a nearby affordable course, balancing both for now.", moPoints: 2, note: "Pragmatic balance" },
    ],
  },
  {
    id: "SJT_T2_14",
    title: "Teacher vs Corporate",
    competencies: ["Altruism", "FinGrowth", "WLB"],
    classFocus: "UG final year",
    scenario:
      "Deepa loves teaching and has an offer to join a government school (modest pay, strong stability, deep satisfaction). She also has a corporate trainer role at twice the pay but with heavy travel and targets. Her profile shows high Social interests, high Altruism, and high WLB values.",
    options: [
      { key: "A", text: "Take the corporate role purely for the higher pay, even though it conflicts with her WLB and Altruism values.", moPoints: 1, note: "Misaligned with her dominant values" },
      { key: "B", text: "Take the teaching role — it aligns strongly with her Altruism, WLB and Social interests.", moPoints: 3, note: "Strong values alignment for this profile" },
      { key: "C", text: "Take the corporate role for a few years to build savings, then transition into teaching or education leadership.", moPoints: 2, note: "Pragmatic staged plan" },
      { key: "D", text: "Decline both and wait for an ideal high-pay, high-impact, low-stress education role.", moPoints: 0, note: "Unrealistic; risks missing both" },
    ],
  },
  {
    id: "SJT_T2_15",
    title: "The Late-Career Pivot",
    competencies: ["Resilience", "Intrinsic Motivation", "Pragmatism"],
    classFocus: "Working professional / mature student",
    scenario:
      "Rakesh, 28, has worked 5 years as an accountant but feels unfulfilled; he is genuinely drawn to UX design. He has savings for about a year and family responsibilities. His profile shows high Artistic and Investigative interests and high Intrinsic motivation, with the accounting work scoring low on engagement.",
    options: [
      { key: "A", text: "Stay in accounting indefinitely — switching this late is too risky and unconventional.", moPoints: 1, note: "Avoids risk but ignores a clear interest–work mismatch" },
      { key: "B", text: "Resign immediately and enroll full-time in a design programme, relying on savings.", moPoints: 1, note: "Honours passion but high financial risk with dependents" },
      { key: "C", text: "Build UX skills through evening courses and freelance projects while still employed, then transition once he has a portfolio and some client income.", moPoints: 3, note: "Resilient, pragmatic, honours Intrinsic motivation" },
      { key: "D", text: "Seek roles that blend both — finance-product or fintech UX — to use existing experience while moving toward design.", moPoints: 2, note: "Leverages prior experience; lower-risk pivot" },
    ],
  },
];

/* =========================================================================
   MODULE METADATA — drives the client stepper, timers, section summaries.
   ========================================================================= */
const MODULES = [
  { id: "activities", code: "A", name: "Activity Preferences", construct: "RIASEC × 6 types × 15", timeMin: 12, format: "5-pt Like/Dislike" },
  { id: "occupations", code: "B", name: "Occupational Title Ratings", construct: "60 Indian career titles", timeMin: 8, format: "5-pt appeal" },
  { id: "workValues", code: "C", name: "Work Values Inventory", construct: "11 values + family-congruence", timeMin: 7, format: "Likert + FC + ranking" },
  { id: "motivations", code: "D", name: "Career Motivations", construct: "Achievement, Power, Mastery, Impact…", timeMin: 5, format: "5-pt Likert" },
  { id: "environment", code: "E", name: "Work Environment Preferences", construct: "Sector, location, work-style filters", timeMin: 4, format: "FC + bipolar" },
  { id: "sjt", code: "F", name: "Situational Judgment", construct: "Values-in-action, Indian dilemmas", timeMin: 9, format: "MO/LO SJT" },
];

const RIASEC_TYPES = ["R", "I", "A", "S", "E", "C"];

const VALUE_SCALES = [
  "Security", "Prestige", "FinGrowth", "WLB", "Altruism", "Autonomy",
  "Innovation", "Intellectual", "FamilyDuty", "SocietalContribution", "Stability",
];

const MOTIVATION_SCALES = [
  "Achievement", "Power", "Affiliation", "Mastery", "SocietalImpact", "Intrinsic", "Extrinsic",
];

module.exports = {
  MODULES,
  RIASEC_TYPES,
  VALUE_SCALES,
  MOTIVATION_SCALES,
  ACTIVITY_PREFS,
  OCCUPATIONS,
  WORK_VALUES_LIKERT,
  WORK_VALUES_FC,
  VALUE_RANK_OPTIONS,
  MOTIVATIONS,
  ENV_SECTOR_FC,
  WORK_STYLE,
  SJT_T2,
};
