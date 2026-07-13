/**
 * DISHA Test 3 scoring engine.
 *
 * Implements the algorithms from the Test-3 review document:
 *  - Subject Strength Index (SSI) per subject: recency-weighted term average,
 *    trend score, and relative strength → 0–100 → T-score → grade zone.
 *  - Academic Profile Score (APS): stream average, consistency, trajectory.
 *  - Stream Probability Engine (6 streams): marks-based base probability with
 *    study-habits modifier; clamped 30–95%.
 *  - Self-efficacy gap: Section-2 comfort rating vs actual SSI
 *    (overconfidence / impostor syndrome).
 *  - Learning-style VARK profile + India adaptation flags (rote / coaching dep).
 *  - Study-habits sub-scales (+ Amotivation / burnout flag).
 *  - Exam-prep sub-scales + test-anxiety risk categories.
 *  - SJT competency points (MO/LO).
 *  - Exam probability estimates (marks-based; refined when T1 is present).
 *  - Validity (social-desirability + consistency).
 *
 * Norm parameters are approximate (no real standardisation sample exists yet).
 */

const Q = require("./questions");

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const clampT = (t) => clamp(Math.round(t), 20, 80);
const round1 = (v) => Math.round(v * 10) / 10;
const round = (v) => Math.round(v);
const mean = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

function gradeZone(t) {
  if (t >= 65) return "Exceptional";
  if (t >= 55) return "Strong";
  if (t >= 45) return "Average";
  if (t >= 35) return "Developing";
  return "Critical";
}

// Recency weights applied to term percentages (older → newer). The last entered
// term (board / predicted) gets the highest weight. Normalised over present terms.
function weightedTermAverage(termPercents) {
  // termPercents: ordered array of { key, pct } for terms that were entered.
  if (!termPercents.length) return null;
  // increasing weights; board-like last term emphasised
  const weights = termPercents.map((_, i) => 1 + i * 0.6);
  // emphasise final term a bit more (board result)
  weights[weights.length - 1] *= 1.4;
  const wsum = weights.reduce((a, b) => a + b, 0);
  const num = termPercents.reduce((s, t, i) => s + t.pct * weights[i], 0);
  return num / wsum;
}

// Trend score from the slope of term percentages: +10 strong improving …
// −10 strong declining. Needs ≥2 terms.
function trendScore(termPercents) {
  if (termPercents.length < 2) return 0;
  const first = termPercents[0].pct;
  const last = termPercents[termPercents.length - 1].pct;
  const perTerm = (last - first) / (termPercents.length - 1);
  if (perTerm > 10) return 10;
  if (perTerm > 3) return 5;
  if (perTerm < -10) return -10;
  if (perTerm < -3) return -5;
  return 0;
}

/* -------------------------------------------------------------------------
   MARKS → SSI per subject + APS + consistency + trajectory.
   marks: { [subjectKey]: { terms: { [termKey]: { obtained, maximum } } } }
   streamSubjects: optional array of subject keys forming the stream core.
   ------------------------------------------------------------------------- */
function scoreMarks(marks = {}, streamSubjects = null) {
  const subjects = [];
  const allTermPctsFlat = []; // for consistency SD across all entered marks

  for (const [subjectKey, data] of Object.entries(marks)) {
    const terms = (data && data.terms) || {};
    const orderedPcts = [];
    for (const [termKey, val] of Object.entries(terms)) {
      if (!val) continue;
      const obtained = Number(val.obtained);
      const maximum = Number(val.maximum);
      if (!maximum || isNaN(obtained)) continue;
      const pct = clamp((obtained / maximum) * 100, 0, 100);
      orderedPcts.push({ key: termKey, pct });
      allTermPctsFlat.push(pct);
    }
    if (!orderedPcts.length) continue;

    const wavg = weightedTermAverage(orderedPcts); // 0..100
    const trend = trendScore(orderedPcts); // -10..+10
    subjects.push({ subjectKey, orderedPcts, wavg, trend });
  }

  if (!subjects.length) {
    return { subjects: [], composite: 0, overallAverage: 0, consistencyScore: 0, trajectory: 0, aps: 0 };
  }

  const overallAverage = mean(subjects.map((s) => s.wavg));

  // SSI per subject. Components centred at 50 so a neutral trend/relative leaves
  // SSI ≈ weighted average (adjusted). SSI = wavg*0.65 + trendComp*0.20 + relComp*0.15.
  const scored = subjects.map((s) => {
    const relStrength = clamp(s.wavg - overallAverage, -20, 20); // -20..+20
    const trendComp = clamp(50 + s.trend * 4, 0, 100); // -10..+10 → 10..90
    const relComp = clamp(50 + relStrength * 2.5, 0, 100); // -20..+20 → 0..100
    const ssi = clamp(s.wavg * 0.65 + trendComp * 0.2 + relComp * 0.15, 0, 100);
    const t = clampT(10 * ((ssi - 55) / 12) + 50);
    let trendLabel = "Stable";
    if (s.trend >= 10) trendLabel = "Strongly improving";
    else if (s.trend >= 5) trendLabel = "Improving";
    else if (s.trend <= -10) trendLabel = "Strongly declining";
    else if (s.trend <= -5) trendLabel = "Declining";
    return {
      subjectKey: s.subjectKey,
      weightedAverage: round1(s.wavg),
      trend: s.trend,
      trendLabel,
      relativeStrength: round1(relStrength),
      ssi: round(ssi),
      tScore: t,
      zone: gradeZone(t),
      termPercents: s.orderedPcts.map((p) => ({ term: p.key, pct: round1(p.pct) })),
    };
  });

  // Consistency: lower term-to-term SD = higher consistency. SD→score 0..100.
  let consistencyScore = 100;
  if (allTermPctsFlat.length >= 2) {
    const m = mean(allTermPctsFlat);
    const variance = mean(allTermPctsFlat.map((p) => (p - m) ** 2));
    const sd = Math.sqrt(variance);
    consistencyScore = clamp(100 - sd * 3, 0, 100); // SD 0 → 100, SD ~33 → 0
  }

  // Trajectory: average per-subject trend mapped to 0..100 (50 = stable).
  const avgTrend = mean(subjects.map((s) => s.trend)); // -10..+10
  const trajectory = clamp(50 + avgTrend * 4, 0, 100);

  // Stream average: SSI of core stream subjects if provided, else all subjects.
  const coreScored = streamSubjects
    ? scored.filter((s) => streamSubjects.includes(s.subjectKey))
    : scored;
  const streamAverage = mean((coreScored.length ? coreScored : scored).map((s) => s.ssi));

  const aps = clamp(streamAverage * 0.5 + consistencyScore * 0.25 + trajectory * 0.25, 0, 100);

  return {
    subjects: scored,
    composite: round(mean(scored.map((s) => s.ssi))),
    overallAverage: round1(overallAverage),
    streamAverage: round(streamAverage),
    consistencyScore: round(consistencyScore),
    trajectory: round(trajectory),
    aps: round(aps),
  };
}

/* -------------------------------------------------------------------------
   SELF-EFFICACY GAP — Section 2 comfort rating (1..5) vs SSI.
   proficiency: { [subjectKey]: { comfort: 1..5, enjoyment: 1..5 } }
   ------------------------------------------------------------------------- */
function scoreProficiency(proficiency = {}, marksResult = { subjects: [] }) {
  const ssiByKey = Object.fromEntries((marksResult.subjects || []).map((s) => [s.subjectKey, s.ssi]));
  const items = [];
  for (const [subjectKey, val] of Object.entries(proficiency)) {
    if (!val) continue;
    const comfort = Number(val.comfort) || null;
    const enjoyment = Number(val.enjoyment) || null;
    const ssi = ssiByKey[subjectKey];
    let gapFlag = null;
    if (comfort != null && ssi != null) {
      const comfortPct = ((comfort - 1) / 4) * 100; // 1..5 → 0..100
      const diff = comfortPct - ssi;
      if (diff >= 25) gapFlag = "overconfidence"; // rates high, marks lower
      else if (diff <= -25) gapFlag = "impostor"; // marks high, rates low
    }
    let interestFlag = null;
    if (enjoyment != null && ssi != null) {
      const enjoyPct = ((enjoyment - 1) / 4) * 100;
      if (enjoyPct >= 75 && ssi < 55) interestFlag = "hiddenInterest"; // loves it, underperforming
    }
    items.push({ subjectKey, comfort, enjoyment, ssi: ssi ?? null, gapFlag, interestFlag });
  }
  return {
    items,
    overconfidenceSubjects: items.filter((i) => i.gapFlag === "overconfidence").map((i) => i.subjectKey),
    impostorSubjects: items.filter((i) => i.gapFlag === "impostor").map((i) => i.subjectKey),
    hiddenInterestSubjects: items.filter((i) => i.interestFlag === "hiddenInterest").map((i) => i.subjectKey),
  };
}

/* -------------------------------------------------------------------------
   LEARNING STYLES — VARK profile + India adaptation flags. Not CCRE-scored.
   likertById: { [id]: 1..5 }; fcById: { [id]: "A"|"B" }
   ------------------------------------------------------------------------- */
function scoreLearningStyles(likertById = {}, fcById = {}) {
  const sums = {}; const counts = {};
  for (const item of Q.LEARNING_STYLES) {
    const v = Number(likertById[item.id]);
    if (!v) continue;
    sums[item.scale] = (sums[item.scale] || 0) + v;
    counts[item.scale] = (counts[item.scale] || 0) + 1;
  }
  // forced-choice contributions: each chosen option's tags get +1
  const fcTally = {};
  for (const pair of Q.LEARNING_STYLE_FC) {
    const sel = fcById[pair.id];
    if (!sel) continue;
    const tags = sel === "A" ? pair.optionA.tags : pair.optionB.tags;
    tags.forEach((tag) => { fcTally[tag] = (fcTally[tag] || 0) + 1; });
  }

  const scaleList = ["Visual", "Auditory", "ReadWrite", "Kinesthetic", "Group", "Rote", "CoachDep", "Exploratory"];
  const scales = scaleList.map((scale) => {
    const avg = counts[scale] ? sums[scale] / counts[scale] : 0;
    const pct = counts[scale] ? Math.round(((avg - 1) / 4) * 100) : 0;
    return { scale, avg: round1(avg), pct, fc: fcTally[scale] || 0 };
  });

  const vark = scales.filter((s) => ["Visual", "Auditory", "ReadWrite", "Kinesthetic"].includes(s.scale));
  const dominantVark = [...vark].sort((a, b) => b.avg - a.avg)[0];

  const get = (scale) => scales.find((s) => s.scale === scale) || { avg: 0 };
  const roteFlag = get("Rote").avg >= 3.5;
  const coachDepFlag = get("CoachDep").avg >= 3.5;

  return {
    scales,
    varkProfile: vark.map((v) => ({ scale: v.scale, avg: v.avg, pct: v.pct })),
    dominantStyle: dominantVark ? dominantVark.scale : null,
    roteFlag,
    coachDepFlag,
    exploratory: round1(get("Exploratory").avg),
    group: round1(get("Group").avg),
  };
}

/* -------------------------------------------------------------------------
   STUDY HABITS — 5 sub-scales (reverse-aware) + Amotivation / burnout flag.
   likertById: { [id]: 1..5 }
   ------------------------------------------------------------------------- */
function scoreStudyHabits(likertById = {}) {
  const sums = {}; const counts = {};
  for (const item of Q.STUDY_HABITS) {
    const raw = Number(likertById[item.id]);
    if (!raw) continue;
    const v = item.reverse ? 6 - raw : raw;
    sums[item.scale] = (sums[item.scale] || 0) + v;
    counts[item.scale] = (counts[item.scale] || 0) + 1;
  }
  const scaleList = ["Consistency", "Planning", "Focus", "Resilience", "AcadMot_I", "AcadMot_E", "Amotivation", "CoachDep"];
  const subScales = scaleList.map((scale) => {
    const avg = counts[scale] ? sums[scale] / counts[scale] : 0;
    const pct = counts[scale] ? Math.round(((avg - 1) / 4) * 100) : 0;
    return { scale, avg: round1(avg), pct };
  });
  const byScale = Object.fromEntries(subScales.map((s) => [s.scale, s.avg]));

  // Study quality composite from Consistency/Planning/Focus/Resilience.
  const quality = mean([
    byScale.Consistency || 0,
    byScale.Planning || 0,
    byScale.Focus || 0,
    byScale.Resilience || 0,
  ]);
  const studyQualityScore = Math.round(((quality - 1) / 4) * 100);

  const amotivationFlag = (byScale.Amotivation || 0) > 3.5; // → mandatory wellbeing section

  return {
    subScales,
    studyQualityScore: clamp(studyQualityScore, 0, 100),
    consistencyScore: subScales.find((s) => s.scale === "Consistency")?.pct ?? 0,
    planningScore: subScales.find((s) => s.scale === "Planning")?.pct ?? 0,
    resilienceScore: subScales.find((s) => s.scale === "Resilience")?.pct ?? 0,
    amotivationAvg: byScale.Amotivation || 0,
    amotivationFlag,
    motivationType:
      (byScale.AcadMot_I || 0) >= (byScale.AcadMot_E || 0) ? "intrinsic" : "extrinsic",
  };
}

/* -------------------------------------------------------------------------
   EXAM PREP — ExamPrep / TestAnxiety / TestStrategy / Wellness + anxiety risk.
   likertById: { [id]: 1..5 }
   ------------------------------------------------------------------------- */
function scoreExamPrep(likertById = {}) {
  const sums = {}; const counts = {};
  for (const item of Q.EXAM_PREP) {
    const v = Number(likertById[item.id]);
    if (!v) continue;
    sums[item.scale] = (sums[item.scale] || 0) + v;
    counts[item.scale] = (counts[item.scale] || 0) + 1;
  }
  const scaleList = ["ExamPrep", "TestAnxiety", "TestStrategy", "Wellness"];
  const subScales = scaleList.map((scale) => {
    const avg = counts[scale] ? sums[scale] / counts[scale] : 0;
    const pct = counts[scale] ? Math.round(((avg - 1) / 4) * 100) : 0;
    return { scale, avg: round1(avg), pct };
  });
  const byScale = Object.fromEntries(subScales.map((s) => [s.scale, s.avg]));

  const anxietyAvg = byScale.TestAnxiety || 0;
  let anxietyRisk = "Low";
  if (anxietyAvg > 3.2) anxietyRisk = "High";
  else if (anxietyAvg >= 2.1) anxietyRisk = "Moderate";

  const examReadinessScore = Math.round(
    (((byScale.ExamPrep || 0) + (byScale.TestStrategy || 0) + (byScale.Wellness || 0)) / 3 - 1) / 4 * 100
  );

  return {
    subScales,
    examReadinessScore: clamp(examReadinessScore, 0, 100),
    examPrepScore: subScales.find((s) => s.scale === "ExamPrep")?.pct ?? 0,
    testStrategyScore: subScales.find((s) => s.scale === "TestStrategy")?.pct ?? 0,
    anxietyAvg,
    anxietyRisk, // Low | Moderate | High
  };
}

/* -------------------------------------------------------------------------
   SJT — MO/LO competency points (mirrors Test 1 / Test 2).
   sjtById: { [id]: { mostLikely, leastLikely } }
   ------------------------------------------------------------------------- */
function scoreSjt(sjtById = {}) {
  let total = 0; let maxTotal = 0;
  const competencyPoints = {};
  const breakdown = [];

  for (const sc of Q.SJT_T3) {
    const pick = sjtById[sc.id] || {};
    const moOpt = sc.options.find((o) => o.key === pick.mostLikely);
    const loOpt = sc.options.find((o) => o.key === pick.leastLikely);
    const best = Math.max(...sc.options.map((o) => o.moPoints));
    const worst = Math.min(...sc.options.map((o) => o.moPoints));
    maxTotal += best * 2 + 1;

    let earned = 0;
    if (moOpt) earned += moOpt.moPoints * 2;
    if (loOpt && loOpt.moPoints === worst) earned += 1;
    total += earned;

    if (moOpt) {
      for (const comp of sc.competencies) {
        competencyPoints[comp] = (competencyPoints[comp] || 0) + moOpt.moPoints;
      }
    }
    breakdown.push({ id: sc.id, mostLikely: pick.mostLikely || null, leastLikely: pick.leastLikely || null, earned });
  }

  const competencies = Object.entries(competencyPoints)
    .map(([name, score]) => ({ name, score }))
    .sort((a, b) => b.score - a.score);
  const percentage = maxTotal ? Math.round((total / maxTotal) * 100) : 0;
  return { total, maxTotal, percentage, competencies, breakdown };
}

/* -------------------------------------------------------------------------
   STREAM PROBABILITY ENGINE (6 streams). Marks-based base probability with a
   study-habits modifier. Returns probability (30..95) per stream + drivers.
   Subject SSI looked up by canonical keys present in marksResult.
   ------------------------------------------------------------------------- */
const sigmoid = (x) => 1 / (1 + Math.exp(-x));

function streamProbabilities(marksResult, studyHabits) {
  const ssi = {};
  (marksResult.subjects || []).forEach((s) => { ssi[s.subjectKey] = s.ssi; });
  const get = (k) => (ssi[k] != null ? ssi[k] : null);

  // Each stream: list of {key, min} requirements + weight on the strongest.
  const defs = [
    { stream: "PCM", label: "Science (PCM)", reqs: [["mathematics", 60], ["physics", 55], ["chemistry", 55]] },
    { stream: "PCB", label: "Science (PCB)", reqs: [["biology", 60], ["chemistry", 55], ["physics", 50]] },
    { stream: "CommerceMaths", label: "Commerce (with Maths)", reqs: [["mathematics", 55], ["english", 55], ["accountancy", 55]] },
    { stream: "CommerceNoMaths", label: "Commerce (without Maths)", reqs: [["english", 55], ["socialScience", 55], ["accountancy", 55], ["economics", 55]] },
    { stream: "Humanities", label: "Humanities / Arts", reqs: [["english", 60], ["socialScience", 55], ["history", 55], ["polsci", 55]] },
    { stream: "Vocational", label: "Vocational / Skill", reqs: [["vocationalSubject", 55], ["computerScience", 55]] },
  ];

  const studyMod =
    studyHabits && (studyHabits.consistencyScore || 0) >= 65 && (studyHabits.planningScore || 0) >= 65
      ? 3
      : studyHabits && ((studyHabits.consistencyScore || 0) < 40 || (studyHabits.planningScore || 0) < 40)
      ? -3
      : 0;

  const results = defs.map((d) => {
    // gather present requirement SSIs; if none present, low-confidence base.
    const present = d.reqs.map(([k, min]) => ({ k, min, v: get(k) })).filter((r) => r.v != null);
    let base;
    const drivers = [];
    const concerns = [];
    if (!present.length) {
      base = 40; // insufficient marks for this stream's subjects
    } else {
      // average margin above each requirement, scaled through a sigmoid.
      const margins = present.map((r) => r.v - r.min);
      const avgMargin = mean(margins);
      base = Math.round(sigmoid(avgMargin / 12) * 100);
      present.forEach((r) => {
        if (r.v >= r.min + 8) drivers.push(`${labelKey(r.k)} SSI ${r.v}`);
        else if (r.v < r.min) concerns.push(`${labelKey(r.k)} SSI ${r.v} — below ${r.min}`);
      });
    }
    const prob = clamp(base + studyMod, 30, 95);
    return { stream: d.stream, label: d.label, probability: prob, drivers: drivers.slice(0, 3), concerns: concerns.slice(0, 3) };
  });

  results.sort((a, b) => b.probability - a.probability);
  return results;
}

function labelKey(k) {
  const map = {
    mathematics: "Maths", physics: "Physics", chemistry: "Chemistry", biology: "Biology",
    english: "English", socialScience: "Social Science", history: "History", polsci: "Pol Sci",
    economics: "Economics", accountancy: "Accountancy", businessStudies: "Business Studies",
    computerScience: "Computer Science", vocationalSubject: "Vocational", science: "Science",
  };
  return map[k] || k;
}

/* -------------------------------------------------------------------------
   EXAM PROBABILITY ESTIMATES (marks-based; refined when T1 present in CCRE).
   Returns Low/Moderate/High band + numeric estimate per relevant exam.
   ------------------------------------------------------------------------- */
function examProbabilities(marksResult, studyHabits, examPrep) {
  const ssi = {};
  (marksResult.subjects || []).forEach((s) => { ssi[s.subjectKey] = s.ssi; });
  const prepBoost = (examPrep?.examPrepScore || 0) >= 65 ? 5 : 0;
  const consistencyBoost = (studyHabits?.consistencyScore || 0) >= 65 ? 5 : 0;
  const boost = prepBoost + consistencyBoost;

  const band = (p) => (p < 40 ? "Low" : p <= 65 ? "Moderate" : "High");
  const estimate = (keys) => {
    const vals = keys.map((k) => ssi[k]).filter((v) => v != null);
    if (!vals.length) return null;
    const avg = mean(vals);
    const p = clamp(Math.round(sigmoid((avg - 60) / 12) * 100) + boost, 5, 95);
    return { probability: p, band: band(p) };
  };

  return {
    jeeMains: estimate(["mathematics", "physics", "chemistry"]),
    neet: estimate(["biology", "chemistry", "physics"]),
    clat: estimate(["english", "socialScience"]),
    caFoundation: estimate(["mathematics", "accountancy"]),
    cuet: estimate(["english"]),
  };
}

/* -------------------------------------------------------------------------
   VALIDITY — social-desirability (agree-keyed) + consistency pairs.
   responsesById: { [id]: 1..5 }
   ------------------------------------------------------------------------- */
function scoreValidity(responsesById = {}) {
  const sdItems = Q.VALIDITY.filter((i) => i.validity === "SD");
  let sdSum = 0; let sdCount = 0;
  for (const item of sdItems) {
    const v = Number(responsesById[item.id]);
    if (!v) continue;
    sdSum += v; sdCount += 1;
  }
  const sdAvg = sdCount ? sdSum / sdCount : 0;
  const sdScore = sdCount ? Math.round(((sdAvg - 1) / 4) * 100) : 0;
  const socialDesirabilityFlag = sdAvg >= 4; // idealised self-presentation

  // consistency: pair A (V5 vs V6 reversed) and pair B (V7 vs V8 reversed).
  const val = (id) => Number(responsesById[id]);
  const pairs = [];
  if (val("V5") && val("V6")) pairs.push(Math.abs(val("V5") - (6 - val("V6"))));
  if (val("V7") && val("V8")) pairs.push(Math.abs(val("V7") - (6 - val("V8"))));
  const inconsistency = pairs.length ? mean(pairs) : 0; // 0..4
  const inconsistencyFlag = inconsistency >= 2.5;

  return {
    sdScore,
    socialDesirabilityFlag,
    inconsistency: round1(inconsistency),
    inconsistencyFlag,
    clean: !socialDesirabilityFlag && !inconsistencyFlag,
  };
}

/* -------------------------------------------------------------------------
   SUMMARY — headline academic-readiness index for the standalone T3 report.
   Blends APS (marks pillar), study quality, and exam readiness.
   ------------------------------------------------------------------------- */
function computeSummary({ marks, studyHabits, examPrep }) {
  const apsPillar = marks?.aps ?? 0;
  const studyPillar = studyHabits?.studyQualityScore ?? 0;
  const examPillar = examPrep?.examReadinessScore ?? 0;
  const overall = Math.round(apsPillar * 0.5 + studyPillar * 0.3 + examPillar * 0.2);
  return {
    overall: clamp(overall, 0, 100),
    pillars: { academic: apsPillar, studyQuality: studyPillar, examReadiness: examPillar },
    preliminary: true, // becomes "Full Combined" once T1/T2 are merged in CCRE
  };
}

module.exports = {
  scoreMarks,
  scoreProficiency,
  scoreLearningStyles,
  scoreStudyHabits,
  scoreExamPrep,
  scoreSjt,
  streamProbabilities,
  examProbabilities,
  scoreValidity,
  computeSummary,
  gradeZone,
};
