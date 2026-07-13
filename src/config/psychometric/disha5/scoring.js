/**
 * DISHA Test 5 scoring engine.
 *
 * Implements the algorithms from the Test-5 review document:
 *  - Career Adaptability (4Cs): Concern / Control / Curiosity / Confidence
 *    T-scores + Overall Adaptability composite + band.
 *  - Growth Mindset Index (Fixed items reverse-scored) + India-specific fixed flags.
 *  - Decision-Making Style: 4 styles scored 0–100; dominant style; Dependent /
 *    Avoidant counsellor flags.
 *  - Learning Agility T-score + sub-views (FutureSkills / Digital / Breadth).
 *  - Ambiguity & Risk: AmbigTol / RiskTake / Stability T-scores → risk-stability
 *    profile.
 *  - Future Orientation & AI-Readiness T-score + sub-views.
 *  - SJT (Blocks G + H): MO/LO competency points → adaptability-in-action score.
 *  - Validity: LikeMe social-desirability + RII inconsistency.
 *  - Career Adaptability Profile: 2×2 quadrant (Overall Adaptability × Risk).
 *  - Future-Readiness Index (standalone composite) + summary.
 *
 * Norm parameters are approximate (no real standardisation sample exists yet).
 * Likert means cluster around ~3.3; T = 50 + (mean − 3.3)/0.7 × 10.
 */

const Q = require("./questions");

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const clampT = (t) => clamp(Math.round(t), 20, 80);
const round1 = (v) => Math.round(v * 10) / 10;
const mean = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
const pct = (m) => Math.round(((m - 1) / 4) * 100); // 1..5 mean → 0..100

function meanToT(m) {
  if (!m) return 50;
  return clampT(50 + ((m - 3.3) / 0.7) * 10);
}

// Reverse-aware mean of a Likert bank, optionally filtered to a scale.
function scaleMean(items, responsesById, scaleFilter) {
  const vals = [];
  for (const item of items) {
    if (scaleFilter && item.scale !== scaleFilter) continue;
    const raw = Number(responsesById[item.id]);
    if (!raw) continue;
    vals.push(item.reverse ? 6 - raw : raw);
  }
  return { m: mean(vals), n: vals.length };
}

/* -------------------------------------------------------------------------
   SECTION A — Career Adaptability (4Cs).
   ------------------------------------------------------------------------- */
function scoreAdaptability(responsesById = {}) {
  const dims = ["Concern", "Control", "Curiosity", "Confidence"].map((scale) => {
    const { m, n } = scaleMean(Q.ADAPTABILITY_4C, responsesById, scale);
    const t = meanToT(m);
    return { scale, mean: round1(m), tScore: t, answered: n };
  });
  const overallT = clampT(mean(dims.filter((d) => d.answered).map((d) => d.tScore)));
  const band = overallT >= 60 ? "High" : overallT >= 50 ? "Moderate" : overallT >= 45 ? "Developing" : "Low";
  const byScale = Object.fromEntries(dims.map((d) => [d.scale, d]));
  return {
    dimensions: dims,
    overallT,
    band,
    controlMean: byScale.Control?.mean ?? null, // used for Dependent-style flag
    curiosityT: byScale.Curiosity?.tScore ?? null,
    confidenceT: byScale.Confidence?.tScore ?? null,
  };
}

/* -------------------------------------------------------------------------
   SECTION B — Growth vs Fixed Mindset Index.
   ------------------------------------------------------------------------- */
function scoreMindset(responsesById = {}) {
  const { m, n } = scaleMean(Q.MINDSET, responsesById); // reverse-aware over all
  const t = meanToT(m);
  let band = "Mixed";
  if (t >= 62) band = "Strong Growth";
  else if (t >= 50) band = "Moderate Growth";
  else if (t >= 40) band = "Mixed";
  else band = "Predominantly Fixed";

  // India-specific fixed-belief flags: raw agreement (≥4) on flagged Fixed items.
  const fixedIndiaItems = Q.MINDSET.filter((i) => i.fixedIndia);
  const fixedBeliefs = fixedIndiaItems
    .filter((i) => Number(responsesById[i.id]) >= 4)
    .map((i) => i.id);

  return {
    tScore: t,
    mean: round1(m),
    band,
    answered: n,
    fixedBeliefFlags: fixedBeliefs,
    abilityBeliefChallenge: fixedBeliefs.length > 0, // triggers report section
  };
}

/* -------------------------------------------------------------------------
   SECTION C — Decision-Making Style (4 styles 0–100) + flags.
   adaptability is passed in to evaluate the Dependent + low-Control flag.
   ------------------------------------------------------------------------- */
function scoreDecisionStyle(responsesById = {}, adaptability = {}) {
  const styles = ["Analytical", "Intuitive", "Dependent", "Avoidant"].map((scale) => {
    const { m, n } = scaleMean(Q.DECISION_STYLE, responsesById, scale);
    return { style: scale, mean: round1(m), score: pct(m), answered: n };
  });
  const sorted = [...styles].filter((s) => s.answered).sort((a, b) => b.score - a.score);
  const dominant = sorted[0]?.style || null;
  const secondary = sorted[1]?.style || null;
  const byStyle = Object.fromEntries(styles.map((s) => [s.style, s]));

  const dependentAvg = byStyle.Dependent?.mean ?? 0;
  const avoidantAvg = byStyle.Avoidant?.mean ?? 0;
  const controlMean = adaptability.controlMean ?? 5;

  // Dependent flag only when combined with low Control (cultural deference vs constraint).
  const dependentFlag = dependentAvg >= 4 && controlMean <= 2.5;
  // Avoidant flag — decision avoidance at a high-stakes juncture.
  const avoidantFlag = avoidantAvg >= 4;

  return {
    styles,
    dominant,
    secondary,
    dependentFlag,
    avoidantFlag,
    dependentAvg: round1(dependentAvg),
    avoidantAvg: round1(avoidantAvg),
  };
}

/* -------------------------------------------------------------------------
   SECTION D — Learning Agility.
   ------------------------------------------------------------------------- */
function scoreLearningAgility(responsesById = {}) {
  const main = scaleMean(Q.LEARNING_AGILITY, responsesById, "LearnAgility");
  const overall = scaleMean(Q.LEARNING_AGILITY, responsesById); // all items, reverse-aware
  const t = meanToT(overall.m);
  const band = t >= 58 ? "High" : t >= 45 ? "Moderate" : "Low";
  const sub = (scale) => {
    const { m } = scaleMean(Q.LEARNING_AGILITY, responsesById, scale);
    return { scale, score: pct(m) };
  };
  return {
    tScore: t,
    band,
    coreMean: round1(main.m),
    subScales: ["LearnAgility", "FutureSkills", "Digital", "Breadth"].map(sub),
    highAgility: t >= 58, // unlocks India 2030 emerging-career section
  };
}

/* -------------------------------------------------------------------------
   SECTION E — Ambiguity & Risk → risk-stability profile.
   ------------------------------------------------------------------------- */
function scoreAmbiguityRisk(responsesById = {}) {
  const sub = (scale) => {
    const { m, n } = scaleMean(Q.AMBIGUITY_RISK, responsesById, scale);
    return { scale, mean: round1(m), tScore: meanToT(m), answered: n };
  };
  const ambig = sub("AmbigTol");
  const risk = sub("RiskTake");
  const stability = sub("Stability");

  // Risk-Stability spectrum profile (per §6.1).
  let profile = "Balanced";
  if (ambig.tScore >= 58 && risk.tScore >= 58) profile = "High Ambiguity Tolerance + High Risk-Taking";
  else if (ambig.tScore >= 55 && risk.tScore < 48) profile = "High Tolerance + Low Risk-Taking";
  else if (ambig.tScore < 45 && risk.tScore >= 55) profile = "Low Tolerance + High Risk-Taking";
  else if (ambig.tScore < 45 && risk.tScore < 45 && stability.tScore >= 58) profile = "Low Ambiguity + Low Risk (Stability Seeker)";

  return { ambigTol: ambig, riskTake: risk, stability, profile };
}

/* -------------------------------------------------------------------------
   SECTION F — Future Orientation & AI-Readiness.
   ------------------------------------------------------------------------- */
function scoreFutureOrientation(responsesById = {}) {
  const overall = scaleMean(Q.FUTURE_ORIENTATION, responsesById);
  const t = meanToT(overall.m);
  const band = t >= 60 ? "High" : t >= 45 ? "Moderate" : "Near-present-focused";
  const sub = (scale) => {
    const { m } = scaleMean(Q.FUTURE_ORIENTATION, responsesById, scale);
    return { scale, score: pct(m) };
  };
  return {
    tScore: t,
    band,
    subScales: ["FutOrient", "Planning", "AIAware", "Agility", "India2030"].map(sub),
    highFutureOrientation: t >= 60,
  };
}

/* -------------------------------------------------------------------------
   SJT (Blocks G + H) — MO/LO competency points → adaptability-in-action score.
   ------------------------------------------------------------------------- */
function scoreSjt(sjtById = {}) {
  const all = [...Q.SJT_G, ...Q.SJT_H];
  let total = 0; let maxTotal = 0;
  const competencyPoints = {};
  const breakdown = [];

  for (const sc of all) {
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
  const adaptabilityInActionT = clampT(40 + (percentage / 100) * 30);
  return { total, maxTotal, percentage, adaptabilityInActionT, competencies, breakdown };
}

/* -------------------------------------------------------------------------
   VALIDITY — LikeMe social-desirability + RII inconsistency.
   ------------------------------------------------------------------------- */
function scoreValidity(validityById = {}, allResponses = {}) {
  const likeItems = Q.VALIDITY.filter((i) => i.validity === "LikeMe");
  const likeVals = likeItems.map((i) => Number(validityById[i.id])).filter(Boolean);
  const likeMean = mean(likeVals);
  const likeMeT = meanToT(likeMean);
  const socialDesirabilityFlag = likeMeT > 65;

  let inconsistentPairs = 0;
  let pairsChecked = 0;
  for (const pair of Q.RII_PAIRS) {
    const a = Number(allResponses[pair.a]);
    const b = Number(allResponses[pair.b]);
    if (!a || !b) continue;
    pairsChecked += 1;
    if (a >= 4 && b >= 4) inconsistentPairs += 1;
  }
  const inconsistencyFlag = pairsChecked > 0 && inconsistentPairs / pairsChecked >= 0.5;

  return {
    likeMeT,
    socialDesirabilityFlag,
    inconsistentPairs,
    pairsChecked,
    inconsistencyFlag,
    clean: !socialDesirabilityFlag && !inconsistencyFlag,
  };
}

/* -------------------------------------------------------------------------
   CAREER ADAPTABILITY PROFILE — 2×2 quadrant (Overall Adaptability × Risk).
   ------------------------------------------------------------------------- */
function computeQuadrant(adaptability, ambiguityRisk) {
  const highAdapt = (adaptability.overallT ?? 50) >= 50;
  const highRisk = (ambiguityRisk.riskTake?.tScore ?? 50) >= 50;
  let quadrant, label, clusters;
  if (highAdapt && highRisk) {
    quadrant = "HighAdapt_HighRisk";
    label = "The Explorer-Builder";
    clusters = ["Entrepreneurship", "Frontier Tech (AI/Space/Biotech)", "Research", "Creative Industries", "IAS (policy roles)", "Consulting"];
  } else if (highAdapt && !highRisk) {
    quadrant = "HighAdapt_LowRisk";
    label = "The Flexible Specialist";
    clusters = ["Research in established institutes (ISRO, CSIR, IITs)", "NGO / Development sector", "Academia", "Senior government advisory"];
  } else if (!highAdapt && highRisk) {
    quadrant = "LowAdapt_HighRisk";
    label = "The Bold Traditionalist";
    clusters = ["Family business (known territory)", "Real estate", "Traditional financial trading", "Corporate fast-track (structured risk)"];
  } else {
    quadrant = "LowAdapt_LowRisk";
    label = "The Stability Seeker";
    clusters = ["Government jobs (IAS/Banking/PSU/Teaching)", "Traditional professions (CA, Law, Medicine in established practice)", "Salaried roles in large organisations"];
  }
  return { quadrant, label, clusters, highAdapt, highRisk };
}

/* -------------------------------------------------------------------------
   FUTURE-READINESS INDEX + summary (standalone T5 composite).
   Blends Overall Adaptability, Learning Agility, Future Orientation, Growth Mindset.
   ------------------------------------------------------------------------- */
function computeSummary({ adaptability, learningAgility, futureOrientation, mindset, sjt }) {
  const parts = [
    { t: adaptability.overallT, w: 3 },
    { t: learningAgility.tScore, w: 3 },
    { t: futureOrientation.tScore, w: 2 },
    { t: mindset.tScore, w: 2 },
    { t: sjt.adaptabilityInActionT, w: 1 },
  ].filter((p) => p.t != null);
  const wsum = parts.reduce((s, p) => s + p.w, 0);
  const compositeT = wsum ? clampT(parts.reduce((s, p) => s + p.t * p.w, 0) / wsum) : 50;
  const overallPct = clamp(Math.round(((compositeT - 20) / 60) * 100), 0, 100);
  return {
    futureReadinessT: compositeT,
    overall: overallPct,
    pillars: {
      adaptability: clamp(Math.round(((adaptability.overallT - 20) / 60) * 100), 0, 100),
      learningAgility: clamp(Math.round(((learningAgility.tScore - 20) / 60) * 100), 0, 100),
      futureOrientation: clamp(Math.round(((futureOrientation.tScore - 20) / 60) * 100), 0, 100),
      growthMindset: clamp(Math.round(((mindset.tScore - 20) / 60) * 100), 0, 100),
    },
    preliminary: true,
  };
}

module.exports = {
  scoreAdaptability,
  scoreMindset,
  scoreDecisionStyle,
  scoreLearningAgility,
  scoreAmbiguityRisk,
  scoreFutureOrientation,
  scoreSjt,
  scoreValidity,
  computeQuadrant,
  computeSummary,
};
