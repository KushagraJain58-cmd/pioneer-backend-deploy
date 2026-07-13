/**
 * DISHA Class 12 Career Selection Test — scoring engine.
 *
 *  - Academic Profile: 3-year (Class 10 → 11 → 12) recency-weighted trajectory
 *    + per-subject SSI where subjects are reliably keyed (Class 10) and an
 *    overall average for the freeform-labelled Class 11/12 stream subjects.
 *  - Aptitude: formula score per dimension [Correct(+1) − Wrong(0.33) −
 *    Hint(extra 0.25) − Blank(0)] → T-score (M=50, SD=10).
 *  - Personality (OCEAN): ipsative-adjusted Big Five T-scores (mirrors the
 *    approach used in the flagship DISHA Test 1).
 *  - Interests: full 30-item RIASEC (0.6) blended with the 20 career-title
 *    appeal ratings redistributed across each title's Holland code (0.4) —
 *    mirrors the Test-2 RIASEC composite algorithm.
 *  - Career Recommendation Engine: blends direct appeal (0.55) + RIASEC fit
 *    (0.30) + values/sector fit (0.15), then applies Life-Design and Context
 *    modifiers additively (never removing a career from the list) — produces
 *    the Top 12 of the 20 rated career titles.
 *  - Values & Motivations: per-scale percentages; Intrinsic–Extrinsic gap
 *    reported neutrally (per the source document's explicit framing).
 *  - Life Design + Context: personalisation filters only — never block a
 *    career or exam pathway.
 *  - Scenarios: descriptive alignment only (explicitly excluded from the
 *    recommendation engine, per source spec) — feeds a counsellor summary.
 *  - Entrance Exam Probability: uses actual attempted scores where available
 *    (more accurate), falling back to a marks+aptitude proxy for exams the
 *    student is targeting but hasn't yet attempted.
 *  - College pathway guidance is intentionally returned as CATEGORIES (e.g.
 *    "IITs/NITs via JEE"), not a specific named college list — this codebase
 *    has no verified college database, and fabricating specific institution
 *    names/cutoffs would risk misleading students. This mirrors the scope
 *    already established by DISHA Tests 1–5 and the Class 10 test.
 *  - Multi-test data carry-forward (T1–T5 / Class 10) is NOT implemented here
 *    as live cross-collection lookups — each DISHA test in this codebase is
 *    self-contained on its own submitted responses; cross-test integration is
 *    documented as future/Master-Report scope in every source review doc and
 *    has not been built for any test in this codebase to date.
 *
 * Norm parameters are approximate (no real standardisation sample exists yet).
 */

const Q = require("./questions");

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const clampT = (t) => clamp(Math.round(t), 20, 80);
const round1 = (v) => Math.round(v * 10) / 10;
const mean = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
const pct1to5 = (m) => Math.round(((m - 1) / 4) * 100);

/* -------------------------------------------------------------------------
   ELIGIBILITY — restricted to students currently in Class 12.
   ------------------------------------------------------------------------- */
function isClass12(classGrade) {
  if (!classGrade) return false;
  const match = String(classGrade).match(/(\d+)/);
  return !!match && match[1] === "12";
}

/* -------------------------------------------------------------------------
   SECTION 1 — Academic Profile → 3-year trajectory.
   class10Marks: { [subjectKey]: { obtained, maximum } }
   class11Marks / class12Marks: { [slotKey]: { obtained, maximum, predicted? } }
   ------------------------------------------------------------------------- */
function pctOf(entry) {
  if (!entry) return null;
  const obtained = Number(entry.obtained);
  const maximum = Number(entry.maximum);
  if (!maximum || isNaN(obtained)) return null;
  return clamp((obtained / maximum) * 100, 0, 100);
}

function scoreAcademic(class10Marks = {}, class11Marks = {}, class12Marks = {}) {
  const class10 = {};
  for (const subj of Q.CLASS10_SUBJECTS) {
    class10[subj.key] = pctOf(class10Marks[subj.key]);
  }
  const class10Vals = Object.values(class10).filter((v) => v != null);
  const class10Average = class10Vals.length ? Math.round(mean(class10Vals)) : null;

  const avgOfSlots = (marksObj, slots) => {
    const vals = slots.map((k) => pctOf(marksObj[k])).filter((v) => v != null);
    return vals.length ? Math.round(mean(vals)) : null;
  };
  const class11Average = avgOfSlots(class11Marks, Q.CLASS11_SLOTS);
  const class12Average = avgOfSlots(class12Marks, Q.CLASS12_SLOTS);
  const class12Predicted = Q.CLASS12_SLOTS.some((k) => class12Marks[k]?.predicted);

  const years = [
    { label: "Class 10", pct: class10Average },
    { label: "Class 11", pct: class11Average },
    { label: "Class 12", pct: class12Average },
  ].filter((y) => y.pct != null);

  let trend = 0;
  let trendLabel = "Stable";
  if (years.length >= 2) {
    const first = years[0].pct;
    const last = years[years.length - 1].pct;
    const perYear = (last - first) / (years.length - 1);
    if (perYear > 8) { trend = 10; trendLabel = "Strongly improving"; }
    else if (perYear > 3) { trend = 5; trendLabel = "Improving"; }
    else if (perYear < -8) { trend = -10; trendLabel = "Strongly declining"; }
    else if (perYear < -3) { trend = -5; trendLabel = "Declining"; }
  }

  // Weighted 3-year average: Class 10 (0.25), Class 11 (0.35), Class 12 (0.40).
  const weights = { "Class 10": 0.25, "Class 11": 0.35, "Class 12": 0.4 };
  const wsum = years.reduce((s, y) => s + weights[y.label], 0);
  const overallAverage = wsum
    ? Math.round(years.reduce((s, y) => s + y.pct * weights[y.label], 0) / wsum)
    : null;

  return {
    class10,
    class10Average,
    class11Average,
    class12Average,
    class12Predicted,
    years,
    trend,
    trendLabel,
    overallAverage,
  };
}

/* -------------------------------------------------------------------------
   SECTION 2 — Aptitude (Extended) → per-dimension T-score.
   answersById: { [id]: { selected: 0-based index | null, hintUsed: bool } }
   ------------------------------------------------------------------------- */
const APTITUDE_NORMS = {
  Numerical: { meanRaw: 1.6, sdRaw: 1.8 },
  Verbal: { meanRaw: 1.4, sdRaw: 1.5 },
  Logical: { meanRaw: 1.0, sdRaw: 1.2 },
  Abstract: { meanRaw: 1.3, sdRaw: 1.5 },
};

function scoreAptitude(answersById = {}) {
  const dims = {};
  const addRaw = (dim, val) => { dims[dim] = (dims[dim] || 0) + val; };
  let totalCorrect = 0; let totalWrong = 0; let totalBlank = 0; let totalHints = 0;

  for (const item of Q.APTITUDE_C12) {
    const ans = answersById[item.id];
    const selected = ans && ans.selected != null ? Number(ans.selected) : null;
    const hintUsed = !!(ans && ans.hintUsed);
    if (selected == null) { totalBlank += 1; continue; }
    const correct = selected === item.answer;
    let val = correct ? 1 : -1 / 3;
    if (hintUsed) { val -= 0.25; totalHints += 1; }
    if (correct) totalCorrect += 1; else totalWrong += 1;
    addRaw(item.dim, val);
  }

  const dimensions = Object.keys(APTITUDE_NORMS).map((dim) => {
    const raw = dims[dim] || 0;
    const { meanRaw, sdRaw } = APTITUDE_NORMS[dim];
    const t = clampT(10 * ((raw - meanRaw) / sdRaw) + 50);
    return { dim, raw: round1(raw), tScore: t };
  });
  const byDim = Object.fromEntries(dimensions.map((d) => [d.dim, d.tScore]));
  const averageT = Math.round(mean(dimensions.map((d) => d.tScore)));

  return { dimensions, byDim, averageT, totalCorrect, totalWrong, totalBlank, totalHints };
}

/* -------------------------------------------------------------------------
   SECTION 3 — Personality (OCEAN) — ipsative adjustment + reverse scoring.
   ------------------------------------------------------------------------- */
function scorePersonality(responsesById = {}) {
  const factors = { O: [], C: [], E: [], A: [], N: [] };
  for (const item of Q.PERSONALITY_C12) {
    const raw = Number(responsesById[item.id]);
    if (!raw) continue;
    factors[item.factor].push(item.reverse ? 6 - raw : raw);
  }
  const rawMeans = {};
  for (const f of Object.keys(factors)) {
    rawMeans[f] = factors[f].length ? mean(factors[f]) : 3;
  }
  const grandMean = mean(Object.values(rawMeans));
  const result = {};
  for (const f of Object.keys(factors)) {
    const adj = rawMeans[f] - grandMean;
    const t = clampT(50 + adj * 12);
    result[f] = { rawMean: round1(rawMeans[f]), adjusted: round1(adj), tScore: t };
  }
  return result;
}

/* -------------------------------------------------------------------------
   SECTION 4 + 5 — Interests: full 30-item RIASEC (0.6) + career-title appeal
   redistributed across Holland codes (0.4). Mirrors the Test-2 algorithm.
   ------------------------------------------------------------------------- */
const HOLLAND_WEIGHTS = [0.5, 0.3, 0.2];

function scoreInterests(riasecById = {}, careerAppealById = {}) {
  const types = ["R", "I", "A", "S", "E", "C"];
  const sums = {}; const counts = {};
  types.forEach((t) => { sums[t] = 0; counts[t] = 0; });
  for (const item of Q.INTEREST_C12) {
    const v = Number(riasecById[item.id]);
    if (!v) continue;
    sums[item.type] += v; counts[item.type] += 1;
  }
  const activityPct = {};
  types.forEach((t) => { activityPct[t] = counts[t] ? pct1to5(sums[t] / counts[t]) : 0; });

  const occRaw = {}; const occMax = {};
  types.forEach((t) => { occRaw[t] = 0; occMax[t] = 0; });
  for (const career of Q.CAREER_TITLES_C12) {
    const letters = String(career.holland).toUpperCase().split("").slice(0, 3);
    letters.forEach((L, idx) => {
      const w = HOLLAND_WEIGHTS[idx] || 0;
      occMax[L] = (occMax[L] || 0) + w * 5;
    });
    const rating = Number(careerAppealById[career.id]);
    if (!rating) continue;
    letters.forEach((L, idx) => {
      const w = HOLLAND_WEIGHTS[idx] || 0;
      occRaw[L] = (occRaw[L] || 0) + w * rating;
    });
  }
  const occPct = {};
  types.forEach((t) => { occPct[t] = occMax[t] ? Math.round((occRaw[t] / occMax[t]) * 100) : 0; });

  const scores = types.map((t) => ({
    type: t,
    activityPct: activityPct[t],
    occPct: occPct[t],
    combined: clamp(Math.round(activityPct[t] * 0.6 + occPct[t] * 0.4), 0, 100),
  }));
  const byType = Object.fromEntries(scores.map((s) => [s.type, s.combined]));
  const sorted = [...scores].sort((a, b) => b.combined - a.combined);
  const hollandCode = sorted.slice(0, 3).map((s) => s.type).join("");

  return { scores, byType, hollandCode, topTypes: sorted.slice(0, 2).map((s) => s.type) };
}

/* -------------------------------------------------------------------------
   SECTION 6 — Values & Motivations.
   ------------------------------------------------------------------------- */
function scoreValuesMotivations(valuesById = {}, motivationsById = {}) {
  const valueScores = Q.WORK_VALUES_C12.map((item) => {
    const v = Number(valuesById[item.id]);
    return { scale: item.scale, pct: v ? pct1to5(v) : null };
  });
  const byValue = Object.fromEntries(valueScores.filter((v) => v.pct != null).map((v) => [v.scale, v.pct]));

  const motivSums = {}; const motivCounts = {};
  for (const item of Q.MOTIVATIONS_C12) {
    const v = Number(motivationsById[item.id]);
    if (!v) continue;
    motivSums[item.scale] = (motivSums[item.scale] || 0) + v;
    motivCounts[item.scale] = (motivCounts[item.scale] || 0) + 1;
  }
  const motivScales = ["Power", "Achievement", "Affiliation", "Mastery", "SocietalImpact", "Intrinsic", "Extrinsic"];
  const motivationScores = motivScales.map((scale) => {
    const m = motivCounts[scale] ? motivSums[scale] / motivCounts[scale] : 0;
    return { scale, pct: motivCounts[scale] ? pct1to5(m) : null };
  });
  const byMotivation = Object.fromEntries(motivationScores.filter((m) => m.pct != null).map((m) => [m.scale, m.pct]));

  const intrinsic = byMotivation.Intrinsic ?? null;
  const extrinsic = byMotivation.Extrinsic ?? null;
  const intrinsicExtrinsicGap = intrinsic != null && extrinsic != null ? intrinsic - extrinsic : null;

  const topValues = [...valueScores].filter((v) => v.pct != null).sort((a, b) => b.pct - a.pct).slice(0, 3).map((v) => v.scale);
  const topMotivations = [...motivationScores].filter((m) => m.pct != null).sort((a, b) => b.pct - a.pct).slice(0, 3).map((m) => m.scale);

  return { valueScores, byValue, motivationScores, byMotivation, topValues, topMotivations, intrinsic, extrinsic, intrinsicExtrinsicGap };
}

/* -------------------------------------------------------------------------
   SECTION 7 — Life Design Preferences. Filters only — never blocks a career.
   ------------------------------------------------------------------------- */
function scoreLifeDesign(responses = {}) {
  const likertPct = (v) => (v != null ? pct1to5(Number(v)) : null);
  return {
    metroPreference: likertPct(responses.metroPreference),
    autonomyIn5Years: likertPct(responses.autonomyIn5Years),
    incomeAspiration: likertPct(responses.incomeAspiration),
    familyPresence: likertPct(responses.familyPresence),
    orgType: responses.orgType || null,
    geoExpectation: responses.geoExpectation || null,
    workingStyle: responses.workingStyle || null,
    riskTolerance: likertPct(responses.riskTolerance),
  };
}

/* -------------------------------------------------------------------------
   SECTION 8 — Your Context. Personalisation only.
   ------------------------------------------------------------------------- */
function scoreContext(context = {}) {
  const parentPreference = context.parentPreference != null ? Number(context.parentPreference) : null;
  const financialUrgency = context.financialUrgency != null ? Number(context.financialUrgency) : null;
  const geographicConstraint = context.geographicConstraint != null ? Number(context.geographicConstraint) : null;
  return {
    parentPreference,
    financialUrgency,
    geographicConstraint,
    careerClarity: context.careerClarity || null,
    targetExam: Array.isArray(context.targetExam) ? context.targetExam : [],
    financialSituation: context.financialSituation || null,
    highParentalPressure: parentPreference != null && parentPreference >= 4,
    highFinancialUrgency: financialUrgency != null && financialUrgency >= 4,
    geographicallyConstrained: geographicConstraint != null && geographicConstraint >= 4,
  };
}

/* -------------------------------------------------------------------------
   SECTION 9 — Scenarios. Descriptive only.
   ------------------------------------------------------------------------- */
function scoreScenarios(responsesById = {}) {
  const results = Q.SCENARIOS_C12.map((sc) => {
    const picked = responsesById[sc.id] || null;
    const aligned = picked ? sc.bestKeys.includes(picked) : false;
    return { id: sc.id, title: sc.title, picked, aligned, skillsTested: sc.skillsTested };
  });
  const answered = results.filter((r) => r.picked);
  const alignedCount = results.filter((r) => r.aligned).length;
  const alignmentPct = answered.length ? Math.round((alignedCount / answered.length) * 100) : 0;
  return { results, alignedCount, totalAnswered: answered.length, alignmentPct };
}

/* -------------------------------------------------------------------------
   CAREER RECOMMENDATION ENGINE — Top 12 of the 20 rated career titles.
   ------------------------------------------------------------------------- */
const SECTOR_ORG_MAP = {
  Government: ["IAS / IPS Officer (Civil Services)", "MBBS Doctor — Government Hospital", "School Teacher / Professor (Govt College)", "Space Scientist (ISRO)", "Environmental Scientist (TERI, WWF India)"],
  PrivateMNC: ["Software Architect / Systems Designer", "Investment Banker (Goldman, Kotak, ICICI)", "Brand Manager / Marketing Director (HUL, P&G)", "HR Manager / Organisational Development", "Data Scientist / AI Engineer"],
  Startup: ["Entrepreneur / Startup Founder", "Data Scientist / AI Engineer", "Software Architect / Systems Designer", "Graphic Designer / UI-UX Designer"],
  SocialSector: ["Social Worker / NGO Programme Director", "Environmental Scientist (TERI, WWF India)", "Counsellor / Psychotherapist"],
  SelfEmployed: ["Chartered Accountant (CA)", "Corporate Lawyer / Litigation Advocate", "Architect + Urban Planner", "Entrepreneur / Startup Founder"],
  FamilyBusiness: ["Entrepreneur / Startup Founder"],
};
const ORG_OPTION_KEY = {
  "Large, stable government organisation (UPSC, PSU, Banking)": "Government",
  "Private MNC or large Indian corporate (Tata, Infosys, HUL)": "PrivateMNC",
  "Startup or entrepreneurial environment — high risk, high learning": "Startup",
  "Social sector / NGO / Development organisation": "SocialSector",
  "Self-employed or own practice (lawyer, CA, doctor)": "SelfEmployed",
  "Family business or established trade": "FamilyBusiness",
};

const WORKING_STYLE_MAP = {
  "Deep specialist — I want to be the best in one specific domain": ["Cardiologist / Neurologist (AIIMS, Apollo)", "Medical Researcher / ICMR Scientist", "Space Scientist (ISRO)"],
  "Generalist leader — I want to be involved in many things at a high level": ["IAS / IPS Officer (Civil Services)", "Entrepreneur / Startup Founder", "HR Manager / Organisational Development", "Brand Manager / Marketing Director (HUL, P&G)"],
  "Researcher or academic — slow, deep work over many years": ["Medical Researcher / ICMR Scientist", "Environmental Scientist (TERI, WWF India)", "Space Scientist (ISRO)", "School Teacher / Professor (Govt College)"],
  "Builder / maker — I want to create physical or digital things": ["Software Architect / Systems Designer", "Data Scientist / AI Engineer", "Architect + Urban Planner", "Graphic Designer / UI-UX Designer"],
  "People-focused — I want to spend most of my time working with and for people": ["MBBS Doctor — Government Hospital", "School Teacher / Professor (Govt College)", "Counsellor / Psychotherapist", "Social Worker / NGO Programme Director", "HR Manager / Organisational Development"],
};

const VALUE_CAREER_BONUS = {
  Security: ["IAS / IPS Officer (Civil Services)", "MBBS Doctor — Government Hospital", "School Teacher / Professor (Govt College)", "Space Scientist (ISRO)"],
  Altruism: ["Social Worker / NGO Programme Director", "Counsellor / Psychotherapist", "MBBS Doctor — Government Hospital"],
  Societal: ["IAS / IPS Officer (Civil Services)", "Social Worker / NGO Programme Director", "Environmental Scientist (TERI, WWF India)"],
  Prestige: ["IAS / IPS Officer (Civil Services)", "Cardiologist / Neurologist (AIIMS, Apollo)", "Chartered Accountant (CA)", "Corporate Lawyer / Litigation Advocate"],
  Innovation: ["Data Scientist / AI Engineer", "Entrepreneur / Startup Founder", "Software Architect / Systems Designer"],
  Autonomy: ["Entrepreneur / Startup Founder", "Chartered Accountant (CA)", "Corporate Lawyer / Litigation Advocate", "Architect + Urban Planner"],
  Mastery: ["Medical Researcher / ICMR Scientist", "Space Scientist (ISRO)", "Cardiologist / Neurologist (AIIMS, Apollo)"],
};

const READINESS_CHECKS = [
  { title: "MBBS Doctor — Government Hospital", need: (a) => a.class10?.science, min: 60, subject: "Science" },
  { title: "Cardiologist / Neurologist (AIIMS, Apollo)", need: (a) => a.class10?.science, min: 65, subject: "Science" },
  { title: "Medical Researcher / ICMR Scientist", need: (a) => a.class10?.science, min: 60, subject: "Science" },
  { title: "Chartered Accountant (CA)", need: (a, ap) => ap.byDim?.Numerical, min: 50, subject: "Numerical aptitude" },
  { title: "Investment Banker (Goldman, Kotak, ICICI)", need: (a, ap) => ap.byDim?.Numerical, min: 55, subject: "Numerical aptitude" },
  { title: "Data Scientist / AI Engineer", need: (a, ap) => ap.byDim?.Numerical, min: 55, subject: "Numerical aptitude" },
  { title: "Software Architect / Systems Designer", need: (a, ap) => ap.byDim?.Logical, min: 50, subject: "Logical aptitude" },
  { title: "Corporate Lawyer / Litigation Advocate", need: (a, ap) => ap.byDim?.Verbal, min: 55, subject: "Verbal aptitude" },
  { title: "IAS / IPS Officer (Civil Services)", need: (a, ap) => ap.byDim?.Verbal, min: 50, subject: "Verbal aptitude" },
];

function careerRecommendations({ interests, careerAppealById, valuesMotivations, lifeDesign, context, academic, aptitude }) {
  const orgKey = lifeDesign.orgType ? ORG_OPTION_KEY[lifeDesign.orgType] : null;

  const scored = Q.CAREER_TITLES_C12.map((career) => {
    const appealRaw = Number(careerAppealById[career.id]);
    const appealPct = appealRaw ? pct1to5(appealRaw) : 50;

    const letters = String(career.holland).toUpperCase().split("").slice(0, 3);
    const riasecFitPct = clamp(
      letters.reduce((s, L, idx) => s + (interests.byType[L] || 0) * (HOLLAND_WEIGHTS[idx] || 0), 0),
      0,
      100
    );

    let valuesBonus = 0;
    Object.entries(VALUE_CAREER_BONUS).forEach(([scale, careers]) => {
      if (careers.includes(career.title) && (valuesMotivations.byValue[scale] || 0) >= 65) {
        valuesBonus += 10;
      }
    });
    valuesBonus = clamp(valuesBonus, 0, 30);

    let base = appealPct * 0.55 + riasecFitPct * 0.3 + valuesBonus * 0.5; // valuesBonus already 0..30, scaled by 0.5 to cap influence
    const modifiers = [];

    if (orgKey && (SECTOR_ORG_MAP[orgKey] || []).includes(career.title)) {
      base += 6; modifiers.push("Matches your preferred organisation type");
    }
    if (lifeDesign.workingStyle && (WORKING_STYLE_MAP[lifeDesign.workingStyle] || []).includes(career.title)) {
      base += 6; modifiers.push("Matches your ideal working style");
    }
    if (context.highFinancialUrgency && ["Chartered Accountant (CA)", "Data Scientist / AI Engineer", "Software Architect / Systems Designer", "Brand Manager / Marketing Director (HUL, P&G)"].includes(career.title)) {
      base += 4; modifiers.push("Typically offers relatively quicker income");
    }

    const readinessCheck = READINESS_CHECKS.find((r) => r.title === career.title);
    let readinessFlag = null;
    if (readinessCheck) {
      const val = readinessCheck.need(academic, aptitude);
      if (val != null && val < readinessCheck.min) {
        readinessFlag = `Your current ${readinessCheck.subject} is a bit below what this path typically demands — a solvable, specific area to strengthen, not a disqualifier.`;
      }
    }

    return {
      careerId: career.id,
      title: career.title,
      sector: career.sector,
      holland: career.holland,
      appealPct,
      riasecFitPct,
      score: clamp(Math.round(base), 0, 100),
      modifiers,
      readinessFlag,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 12);
}

/* -------------------------------------------------------------------------
   ENTRANCE EXAM PROBABILITY — actual scores (if attempted) > marks/aptitude proxy.
   ------------------------------------------------------------------------- */
const sigmoid = (x) => 1 / (1 + Math.exp(-x));
const band = (p) => (p < 45 ? "Low" : p <= 70 ? "Moderate" : "High");

function examProbabilities({ attemptedScores = {}, targetExams = [], academic, aptitude }) {
  const results = [];

  // Actual attempted scores take priority — direct, more accurate bands.
  if (attemptedScores.jeeMains?.value != null) {
    const p = clamp(Number(attemptedScores.jeeMains.value), 0, 100);
    results.push({ exam: "JEE Mains", source: "actual", probability: Math.round(p), band: p >= 95 ? "High" : p >= 80 ? "Moderate" : "Low" });
  }
  if (attemptedScores.jeeAdvanced?.value != null) {
    const rank = Number(attemptedScores.jeeAdvanced.value);
    const b = rank <= 10000 ? "High" : rank <= 50000 ? "Moderate" : "Low";
    results.push({ exam: "JEE Advanced", source: "actual", rank, band: b });
  }
  if (attemptedScores.neet?.value != null) {
    const score = Number(attemptedScores.neet.value);
    const p = clamp(Math.round((score / 720) * 100), 0, 100);
    results.push({ exam: "NEET", source: "actual", probability: p, band: score >= 550 ? "High" : score >= 450 ? "Moderate" : "Low" });
  }
  if (attemptedScores.clat?.value != null) {
    const score = Number(attemptedScores.clat.value);
    results.push({ exam: "CLAT", source: "actual", score, band: score >= 100 ? "High" : score >= 80 ? "Moderate" : "Low" });
  }
  if (attemptedScores.cuet?.value != null) {
    const score = Number(attemptedScores.cuet.value);
    results.push({ exam: "CUET", source: "actual", score, band: score >= 80 ? "High" : score >= 60 ? "Moderate" : "Low" });
  }

  // Proxy estimate for exams targeted but not yet attempted.
  const dim = aptitude.byDim || {};
  const c10 = academic.class10 || {};
  const overall = academic.overallAverage ?? 50;
  const avgOf = (vals) => {
    const present = vals.filter((v) => v != null);
    return present.length ? mean(present) : 50;
  };
  const proxyBand = (m) => {
    const p = clamp(Math.round(sigmoid((m - 60) / 12) * 100), 5, 95);
    return { probability: p, band: band(p) };
  };

  const proxyMap = {
    "JEE Advanced (IIT)": ["JEE Mains", () => avgOf([dim.Numerical, dim.Abstract, c10.mathematics, overall])],
    "JEE Mains (NIT / state engineering)": ["JEE Mains", () => avgOf([dim.Numerical, dim.Abstract, c10.mathematics, overall])],
    "NEET (Medicine)": ["NEET", () => avgOf([c10.science, overall, dim.Logical])],
    "CLAT (Law)": ["CLAT", () => avgOf([dim.Verbal, c10.english, overall])],
    "CUET (Central University undergraduate)": ["CUET", () => avgOf([overall, dim.Verbal])],
    "CA Foundation": ["CA Foundation", () => avgOf([dim.Numerical, c10.mathematics])],
    "NDA / CDS (Defence)": ["NDA / CDS", () => avgOf([dim.Numerical, dim.Logical])],
    "NIFT / NID (Design)": ["NIFT / NID", () => avgOf([overall])],
  };

  const alreadyCovered = new Set(results.map((r) => r.exam));
  for (const target of targetExams) {
    const conf = proxyMap[target];
    if (!conf) continue; // GATE / UPSC / "no specific exam" — no meaningful proxy at Class 12 stage
    const [examLabel, calc] = conf;
    if (alreadyCovered.has(examLabel)) continue;
    const { probability, band: b } = proxyBand(calc());
    results.push({ exam: examLabel, source: "estimate", probability, band: b });
    alreadyCovered.add(examLabel);
  }

  return results;
}

/* -------------------------------------------------------------------------
   COLLEGE PATHWAY CATEGORIES (not a specific college database — see file header).
   ------------------------------------------------------------------------- */
function collegePathways({ targetExams = [], lifeDesign, context }) {
  const categories = [];
  if (targetExams.includes("JEE Advanced (IIT)") || targetExams.includes("JEE Mains (NIT / state engineering)")) categories.push("IITs / NITs / State Engineering Colleges via JEE");
  if (targetExams.includes("NEET (Medicine)")) categories.push("Government & Private Medical Colleges via NEET");
  if (targetExams.includes("CLAT (Law)")) categories.push("National Law Universities via CLAT");
  if (targetExams.includes("CUET (Central University undergraduate)")) categories.push("Central Universities via CUET");
  if (targetExams.includes("CA Foundation")) categories.push("ICAI-affiliated CA pathway (no separate college required)");
  if (targetExams.includes("NIFT / NID (Design)")) categories.push("NIFT / NID and private design institutes");
  if (targetExams.includes("UPSC (long-term aspiration)")) categories.push("Any UG degree + dedicated UPSC preparation post-graduation");
  if (lifeDesign.orgType === "Startup or entrepreneurial environment — high risk, high learning") categories.push("Entrepreneurship cells / incubators at reputed universities");
  if (context.geographicallyConstrained) categories.push("Within-state universities and recognised distance/online degree options");
  if (context.financialSituation === "We face financial difficulty in meeting daily needs") categories.push("Scholarship-supported and government-subsidised institutions");
  if (!categories.length) categories.push("General undergraduate options aligned with your top career recommendation");
  return categories;
}

/* -------------------------------------------------------------------------
   FIVE-YEAR VISION — structured composite (frontend renders as a narrative).
   ------------------------------------------------------------------------- */
function computeFiveYearVision({ topCareer, valuesMotivations, lifeDesign }) {
  return {
    topCareerTitle: topCareer ? topCareer.title : null,
    topValue: valuesMotivations.topValues?.[0] || null,
    topMotivation: valuesMotivations.topMotivations?.[0] || null,
    orgType: lifeDesign.orgType || null,
    geoExpectation: lifeDesign.geoExpectation || null,
    workingStyle: lifeDesign.workingStyle || null,
    riskOriented: (lifeDesign.riskTolerance || 0) >= 60,
  };
}

/* -------------------------------------------------------------------------
   SUMMARY
   ------------------------------------------------------------------------- */
function computeSummary({ recommendations, examResults }) {
  const top = recommendations[0];
  const second = recommendations[1];
  const clarityGap = top && second ? top.score - second.score : 0;
  return {
    topCareerTitle: top ? top.title : null,
    topScore: top ? top.score : 0,
    clarityGap,
    explorationNeeded: clarityGap < 6,
    examCount: examResults.length,
  };
}

module.exports = {
  isClass12,
  scoreAcademic,
  scoreAptitude,
  scorePersonality,
  scoreInterests,
  scoreValuesMotivations,
  scoreLifeDesign,
  scoreContext,
  scoreScenarios,
  careerRecommendations,
  examProbabilities,
  collegePathways,
  computeFiveYearVision,
  computeSummary,
};
