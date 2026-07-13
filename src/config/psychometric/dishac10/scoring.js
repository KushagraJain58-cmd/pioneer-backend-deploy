/**
 * DISHA Class 10 Stream Selection Test — scoring engine.
 *
 *  - Academic Profile: recency-weighted Subject Strength Index (SSI) per subject.
 *  - Aptitude Snapshot: formula score per dimension [Correct(+1) − Wrong(0.33)
 *    − Hint(extra 0.25) − Blank(0)] → T-score (M=50, SD=10).
 *  - Interest Profile: RIASEC percentages (3 items/type, 1..5 → 0..100).
 *  - Values: per-scale percentages (1..5 → 0..100).
 *  - Stream Preferences: direct-signal tally per stream (0..100 of appearances).
 *  - Your Context: personalisation only — never blocks a stream.
 *  - Scenarios: descriptive alignment only — explicitly does NOT change stream
 *    probabilities (per source spec); feeds a counsellor-facing summary.
 *  - Stream Probability Engine: blends Academic(35%) + Aptitude(20%) +
 *    Interest(25%) + Values(10%) + Stream-Preference(10%) per stream, with a
 *    Maths-strength differentiator between Commerce+Maths and Commerce.
 *  - Exam Readiness: activated per selected target exam in Section 6.
 *
 * Norm parameters are approximate (no real standardisation sample exists yet).
 */

const Q = require("./questions");

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const clampT = (t) => clamp(Math.round(t), 20, 80);
const round1 = (v) => Math.round(v * 10) / 10;
const mean = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
const pct1to5 = (m) => Math.round(((m - 1) / 4) * 100); // 1..5 mean → 0..100

/* -------------------------------------------------------------------------
   ELIGIBILITY — this test is restricted to students currently in Class 10.
   classGrade values in the platform look like "10th" / "Class 10" / "10".
   ------------------------------------------------------------------------- */
function isClass10(classGrade) {
  if (!classGrade) return false;
  const match = String(classGrade).match(/(\d+)/);
  return !!match && match[1] === "10";
}

/* -------------------------------------------------------------------------
   SECTION 1 — Academic Profile → SSI per subject.
   marks: { [subjectKey]: { terms: { termKey: { obtained, maximum } } } }
   enjoyment: { [subjectKey]: 1..5 }
   ------------------------------------------------------------------------- */
function weightedTermAverage(termPercents) {
  if (!termPercents.length) return null;
  const weights = termPercents.map((_, i) => 1 + i * 0.6);
  weights[weights.length - 1] *= 1.3; // slight extra weight on the latest term
  const wsum = weights.reduce((a, b) => a + b, 0);
  const num = termPercents.reduce((s, t, i) => s + t.pct * weights[i], 0);
  return num / wsum;
}

function scoreAcademic(marks = {}, enjoyment = {}, inTheZoneSubject = null) {
  const subjects = [];
  for (const subj of Q.SUBJECTS_C10) {
    const data = marks[subj.key];
    const terms = (data && data.terms) || {};
    const orderedPcts = [];
    for (const term of Q.TERMS_C10) {
      const val = terms[term.key];
      if (!val) continue;
      const obtained = Number(val.obtained);
      const maximum = Number(val.maximum);
      if (!maximum || isNaN(obtained)) continue;
      orderedPcts.push({ key: term.key, pct: clamp((obtained / maximum) * 100, 0, 100) });
    }
    const ssi = orderedPcts.length ? Math.round(weightedTermAverage(orderedPcts)) : null;
    subjects.push({
      subjectKey: subj.key,
      ssi,
      enjoyment: enjoyment[subj.key] != null ? Number(enjoyment[subj.key]) : null,
      hasMarks: orderedPcts.length > 0,
    });
  }
  const bySubject = Object.fromEntries(subjects.map((s) => [s.subjectKey, s.ssi]));
  const enjoymentBySubject = Object.fromEntries(subjects.map((s) => [s.subjectKey, s.enjoyment]));
  const overallAverage = (() => {
    const vals = subjects.filter((s) => s.ssi != null).map((s) => s.ssi);
    return vals.length ? Math.round(mean(vals)) : null;
  })();

  return { subjects, bySubject, enjoymentBySubject, overallAverage, inTheZoneSubject: inTheZoneSubject || null };
}

/* -------------------------------------------------------------------------
   SECTION 2 — Aptitude Snapshot → per-dimension T-score.
   answersById: { [id]: { selected: 0-based index | null, hintUsed: bool } }
   ------------------------------------------------------------------------- */
const APTITUDE_NORMS = {
  Numerical: { meanRaw: 2.2, sdRaw: 1.6 },
  Verbal: { meanRaw: 1.8, sdRaw: 1.3 },
  Logical: { meanRaw: 1.3, sdRaw: 1.0 },
  Abstract: { meanRaw: 0.8, sdRaw: 0.8 },
};

function rawToT(raw, meanRaw, sdRaw) {
  if (!sdRaw) return 50;
  return clampT(10 * ((raw - meanRaw) / sdRaw) + 50);
}

function scoreAptitude(answersById = {}) {
  const dims = {};
  const addRaw = (dim, val) => { dims[dim] = (dims[dim] || 0) + val; };
  let totalCorrect = 0; let totalWrong = 0; let totalBlank = 0; let totalHints = 0;

  for (const item of Q.APTITUDE_C10) {
    const ans = answersById[item.id];
    const selected = ans && ans.selected != null ? Number(ans.selected) : null;
    const hintUsed = !!(ans && ans.hintUsed);
    if (selected == null) {
      totalBlank += 1;
      continue;
    }
    const correct = selected === item.answer;
    let val = correct ? 1 : -1 / 3;
    if (hintUsed) {
      val -= 0.25;
      totalHints += 1;
    }
    if (correct) totalCorrect += 1; else totalWrong += 1;
    addRaw(item.dim, val);
  }

  const dimensions = Object.keys(APTITUDE_NORMS).map((dim) => {
    const raw = dims[dim] || 0;
    const { meanRaw, sdRaw } = APTITUDE_NORMS[dim];
    const t = rawToT(raw, meanRaw, sdRaw);
    return { dim, raw: round1(raw), tScore: t };
  });
  const avgT = Math.round(mean(dimensions.map((d) => d.tScore)));
  const byDim = Object.fromEntries(dimensions.map((d) => [d.dim, d.tScore]));

  return { dimensions, byDim, averageT: avgT, totalCorrect, totalWrong, totalBlank, totalHints };
}

/* -------------------------------------------------------------------------
   SECTION 3 — Interest Profile → RIASEC percentages.
   responsesById: { [id]: 1..5 }
   ------------------------------------------------------------------------- */
function scoreInterests(responsesById = {}) {
  const types = ["R", "I", "A", "S", "E", "C"];
  const sums = {}; const counts = {};
  types.forEach((t) => { sums[t] = 0; counts[t] = 0; });
  for (const item of Q.INTEREST_C10) {
    const v = Number(responsesById[item.id]);
    if (!v) continue;
    sums[item.type] += v;
    counts[item.type] += 1;
  }
  const scores = types.map((t) => {
    const m = counts[t] ? sums[t] / counts[t] : 0;
    return { type: t, mean: round1(m), pct: counts[t] ? pct1to5(m) : 0 };
  });
  const byType = Object.fromEntries(scores.map((s) => [s.type, s.pct]));
  const sorted = [...scores].sort((a, b) => b.pct - a.pct);
  return { scores, byType, topTypes: sorted.slice(0, 2).map((s) => s.type) };
}

/* -------------------------------------------------------------------------
   SECTION 4 — Values → per-scale percentages.
   responsesById: { [id]: 1..5 }
   ------------------------------------------------------------------------- */
function scoreValues(responsesById = {}) {
  const scales = ["Security", "Growth", "Altruism", "Prestige", "Autonomy", "Seva", "WLB", "Innovation"];
  const sums = {}; const counts = {};
  scales.forEach((s) => { sums[s] = 0; counts[s] = 0; });
  for (const item of Q.VALUES_C10) {
    const v = Number(responsesById[item.id]);
    if (!v) continue;
    sums[item.scale] += v;
    counts[item.scale] += 1;
  }
  const scores = scales.map((s) => {
    const m = counts[s] ? sums[s] / counts[s] : 0;
    return { scale: s, mean: round1(m), pct: counts[s] ? pct1to5(m) : 0 };
  });
  const byScale = Object.fromEntries(scores.map((s) => [s.scale, s.pct]));
  return { scores, byScale };
}

/* -------------------------------------------------------------------------
   SECTION 5 — Stream Preferences → direct-signal tally per stream.
   pairsById: { [pairId]: "A" | "B" }
   ------------------------------------------------------------------------- */
function scoreStreamPreference(pairsById = {}) {
  const wins = {}; const appearances = {};
  const initStream = (s) => { wins[s] = wins[s] || 0; appearances[s] = appearances[s] || 0; };

  for (const pair of Q.STREAM_PREF_C10) {
    initStream(pair.optionA.stream);
    initStream(pair.optionB.stream);
    appearances[pair.optionA.stream] += 1;
    appearances[pair.optionB.stream] += 1;
    const sel = pairsById[pair.id];
    if (sel === "A") wins[pair.optionA.stream] += 1;
    else if (sel === "B") wins[pair.optionB.stream] += 1;
  }
  const byStream = {};
  Object.keys(appearances).forEach((s) => {
    byStream[s] = appearances[s] ? Math.round((wins[s] / appearances[s]) * 100) : 0;
  });
  return { wins, appearances, byStream };
}

/* -------------------------------------------------------------------------
   SECTION 6 — Your Context. Personalisation only — never blocks a stream.
   ------------------------------------------------------------------------- */
function scoreContext(context = {}) {
  const parentPreference = context.parentPreference != null ? Number(context.parentPreference) : null;
  const financialUrgency = context.financialUrgency != null ? Number(context.financialUrgency) : null;
  const geographicConstraint = context.geographicConstraint != null ? Number(context.geographicConstraint) : null;
  const decisionStatus = context.decisionStatus || null;
  const examTargets = Array.isArray(context.examTargets) ? context.examTargets : [];
  // secretInterest is intentionally NOT summarised numerically — it is passed
  // through as free text for the counsellor-only section.
  return {
    parentPreference,
    financialUrgency,
    geographicConstraint,
    decisionStatus,
    examTargets,
    highParentalPressure: parentPreference != null && parentPreference >= 4,
    highFinancialUrgency: financialUrgency != null && financialUrgency >= 4,
    geographicallyConstrained: geographicConstraint != null && geographicConstraint >= 4,
  };
}

/* -------------------------------------------------------------------------
   SECTION 7 — Scenarios. Descriptive only (does not affect stream probability).
   responsesById: { [scenarioId]: "A"|"B"|"C"|"D" }
   ------------------------------------------------------------------------- */
function scoreScenarios(responsesById = {}) {
  const results = Q.SCENARIOS_C10.map((sc) => {
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
   STREAM PROBABILITY ENGINE — blends all pillars per stream.
   Weights: Academic 35% · Aptitude 20% · Interest 25% · Values 10% · Stream-
   Preference 10%. Scenarios are explicitly excluded from this calculation.
   ------------------------------------------------------------------------- */
function streamProbabilities({ academic, aptitude, interests, values, streamPreference }) {
  const subj = academic.bySubject; // may contain nulls
  const dim = aptitude.byDim;
  const int = interests.byType;
  const val = values.byScale;
  const sp = streamPreference.byStream;

  const avgOf = (vals) => {
    const present = vals.filter((v) => v != null);
    return present.length ? mean(present) : 50; // neutral default if no data
  };

  const defs = [
    {
      stream: "PCM",
      label: "Science (PCM)",
      academicPct: avgOf([subj.mathematics, subj.science, subj.computerScience != null ? subj.computerScience : null]),
      aptitudePct: dim.Numerical * 0.7 + dim.Abstract * 0.3,
      interestPct: avgOf([int.R, int.I]),
      valuesPct: val.Growth,
      streamPrefPct: sp.PCM ?? 50,
    },
    {
      stream: "PCB",
      label: "Science (PCB)",
      academicPct: avgOf([subj.science, subj.mathematics]),
      aptitudePct: dim.Logical * 0.6 + dim.Abstract * 0.4,
      interestPct: avgOf([int.I, int.S]),
      valuesPct: avgOf([val.Altruism, val.Security]),
      streamPrefPct: sp.PCB ?? 50,
    },
    {
      stream: "CommerceMaths",
      label: "Commerce + Maths",
      academicPct: avgOf([subj.mathematics, subj.socialScience, subj.english]),
      aptitudePct: dim.Numerical * 0.5 + dim.Verbal * 0.5,
      interestPct: avgOf([int.E, int.C]),
      valuesPct: avgOf([val.Security, val.Prestige]),
      streamPrefPct: sp.Commerce ?? 50,
    },
    {
      stream: "Commerce",
      label: "Commerce",
      academicPct: avgOf([subj.socialScience, subj.english]),
      aptitudePct: dim.Verbal * 0.6 + dim.Numerical * 0.4,
      interestPct: avgOf([int.E, int.C]),
      valuesPct: avgOf([val.Security, val.Prestige]),
      streamPrefPct: sp.Commerce ?? 50,
    },
    {
      stream: "Humanities",
      label: "Humanities",
      academicPct: avgOf([subj.socialScience, subj.english, subj.hindi]),
      aptitudePct: dim.Verbal * 0.6 + dim.Logical * 0.4,
      interestPct: avgOf([int.A, int.S, int.E]),
      valuesPct: avgOf([val.Autonomy, val.Seva]),
      streamPrefPct: sp.Humanities ?? 50,
    },
  ];

  // Maths-strength differentiator between Commerce+Maths and Commerce.
  const mathSsi = subj.mathematics != null ? subj.mathematics : 50;
  const mathAdj = (mathSsi - 50) * 0.15;

  const results = defs.map((d) => {
    let base =
      d.academicPct * 0.35 +
      d.aptitudePct * 0.2 +
      d.interestPct * 0.25 +
      d.valuesPct * 0.1 +
      d.streamPrefPct * 0.1;
    if (d.stream === "CommerceMaths") base += mathAdj;
    if (d.stream === "Commerce") base -= mathAdj;
    // gain adjustment for a more differentiated spread, then clamp to 30–95.
    const spread = 50 + (base - 50) * 1.3;
    const probability = clamp(Math.round(spread), 30, 95);
    return { stream: d.stream, label: d.label, probability };
  });

  results.sort((a, b) => b.probability - a.probability);
  const top = results[0];
  const second = results[1];
  const clarityGap = top && second ? top.probability - second.probability : 0;
  const explorationNeeded = clarityGap < 8; // top choices very close → genuinely undecided pattern

  return { streams: results, clarityGap, explorationNeeded };
}

/* -------------------------------------------------------------------------
   EXAM READINESS — activated per selected target exam (Section 6).
   ------------------------------------------------------------------------- */
const EXAM_STREAM_MAP = {
  "JEE (Engineering)": "PCM",
  "NEET (Medicine)": "PCB",
  "CLAT (Law)": "Humanities",
  "CA Foundation": "CommerceMaths",
  "NDA / Defence": "PCM",
  "Design entrance (NID / NIFT)": "Humanities",
};

function examReadiness(examTargets = [], streamResults = []) {
  const byStream = Object.fromEntries(streamResults.map((s) => [s.stream, s.probability]));
  const readiness = examTargets
    .filter((e) => EXAM_STREAM_MAP[e])
    .map((e) => {
      const stream = EXAM_STREAM_MAP[e];
      const p = byStream[stream] ?? 50;
      const band = p < 45 ? "Low" : p <= 65 ? "Moderate" : "High";
      return { exam: e, relatedStream: stream, probability: p, band };
    });
  return readiness;
}

/* -------------------------------------------------------------------------
   SUMMARY — headline "stream clarity" index for the standalone report.
   ------------------------------------------------------------------------- */
function computeSummary({ streamResult }) {
  const top = streamResult.streams[0];
  return {
    topStream: top ? top.stream : null,
    topStreamLabel: top ? top.label : null,
    topProbability: top ? top.probability : 0,
    clarityGap: streamResult.clarityGap,
    explorationNeeded: streamResult.explorationNeeded,
  };
}

module.exports = {
  isClass10,
  scoreAcademic,
  scoreAptitude,
  scoreInterests,
  scoreValues,
  scoreStreamPreference,
  scoreContext,
  scoreScenarios,
  streamProbabilities,
  examReadiness,
  computeSummary,
};
