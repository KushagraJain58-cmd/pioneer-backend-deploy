/**
 * DISHA Test 4 scoring engine.
 *
 * Implements the algorithms from the Test-4 review document:
 *  - EI-A / EI-B / EI-C (Resilience, Grit, Growth Mindset) / EI-D (Empathy,
 *    Collectivist, Social Skill, Seva) / EI-E (Adaptability sub-scales): mean
 *    of (reverse-aware) Likert responses → T-score (M=50, SD=10) + band.
 *  - Resilience Index (prominently reported), impulsivity-risk flag, growth-
 *    mindset fixed flag, empathic over-involvement flag, geographic filter.
 *  - SJT (Blocks F + G): MO/LO competency points; crisis-option detection.
 *  - Overall EQ score: weighted composite T-score + EQ band classification.
 *  - Validity: LikeMe social-desirability scale + RII inconsistency check.
 *  - Crisis / burnout flags + wellbeing referral logic.
 *
 * Norm parameters are approximate (no real standardisation sample exists yet).
 * EI raw item means cluster around ~3.4; T = 50 + (mean − 3.3)/0.7 × 10.
 */

const Q = require("./questions");

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const clampT = (t) => clamp(Math.round(t), 20, 80);
const round1 = (v) => Math.round(v * 10) / 10;
const mean = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

// Convert a 1..5 mean to a T-score. Mean 3.3 → 50, 4.0 → 60, 4.7 → 70.
function meanToT(m) {
  if (!m) return 50;
  return clampT(50 + ((m - 3.3) / 0.7) * 10);
}

function eqBand(t) {
  if (t >= 65) return "Exceptional";
  if (t >= 55) return "Strong";
  if (t >= 45) return "Average";
  if (t >= 35) return "Developing";
  return "Critical Concern";
}

// Reverse-aware mean of a Likert bank filtered to a scale (or all items).
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
   SECTION A — Emotional Self-Awareness (single scale EI-A).
   ------------------------------------------------------------------------- */
function scoreSelfAwareness(responsesById = {}) {
  const { m, n } = scaleMean(Q.SELF_AWARENESS, responsesById);
  const t = meanToT(m);
  return { mean: round1(m), tScore: t, band: eqBand(t), answered: n };
}

/* -------------------------------------------------------------------------
   SECTION B — Emotional Self-Regulation (EI-B) + impulsivity risk index.
   ------------------------------------------------------------------------- */
function scoreSelfRegulation(responsesById = {}) {
  const { m, n } = scaleMean(Q.SELF_REGULATION, responsesById);
  const t = meanToT(m);
  // Impulsivity index uses RAW responses to the flagged items (high raw = high impulsivity).
  const impItems = Q.SELF_REGULATION.filter((i) => i.impulsivity);
  const impVals = impItems.map((i) => Number(responsesById[i.id])).filter(Boolean);
  const impulsivityAvg = mean(impVals);
  return {
    mean: round1(m),
    tScore: t,
    band: eqBand(t),
    answered: n,
    impulsivityAvg: round1(impulsivityAvg),
    impulsivityFlag: impulsivityAvg >= 3.5, // counsellor flag for high-stakes careers
  };
}

/* -------------------------------------------------------------------------
   SECTION C — Resilience / Grit / Growth Mindset (3 sub-scales).
   ------------------------------------------------------------------------- */
function scoreResilience(responsesById = {}) {
  const sub = (scale) => {
    const { m, n } = scaleMean(Q.RESILIENCE, responsesById, scale);
    const t = meanToT(m);
    return { scale, mean: round1(m), tScore: t, band: eqBand(t), answered: n };
  };
  const resilience = sub("Resilience");
  const grit = sub("Grit");
  const growth = sub("GrowthMindset");

  // Fixed-mindset flag: low growth-mindset average (reverse-aware mean < 3 → fixed).
  const fixedMindsetFlag = growth.mean > 0 && growth.mean < 3;

  // Composite Resilience Index = weighted blend (Resilience 0.5, Grit 0.3, Growth 0.2).
  const indexT = clampT(resilience.tScore * 0.5 + grit.tScore * 0.3 + growth.tScore * 0.2);

  // Combined critical flag (the document's URGENT condition).
  const combinedCritical = resilience.tScore < 38 && grit.tScore < 40;

  return {
    resilience,
    grit,
    growthMindset: growth,
    resilienceIndex: indexT,
    fixedMindsetFlag,
    combinedCritical,
  };
}

/* -------------------------------------------------------------------------
   SECTION D — Empathy & Interpersonal (4 sub-scales) + over-involvement flag.
   ------------------------------------------------------------------------- */
function scoreEmpathy(responsesById = {}) {
  const sub = (scale) => {
    const { m, n } = scaleMean(Q.EMPATHY, responsesById, scale);
    const t = meanToT(m);
    return { scale, mean: round1(m), tScore: t, band: eqBand(t), answered: n };
  };
  const empathy = sub("Empathy");
  const collEmpathy = sub("CollEmpathy");
  const socialSkill = sub("SocialSkill");
  const sevaOrient = sub("SevaOrient");

  // Over-involvement flag uses RAW D16 (high raw = high over-involvement).
  const d16 = Number(responsesById.D16);
  const overInvolvementFlag = d16 >= 4;

  // Headline empathy score blends cognitive/affective empathy + collectivist.
  const empathyScore = clampT(empathy.tScore * 0.6 + collEmpathy.tScore * 0.4);

  return {
    empathy,
    collEmpathy,
    socialSkill,
    sevaOrient,
    empathyScore,
    overInvolvementFlag,
  };
}

/* -------------------------------------------------------------------------
   SECTION E — Social & Cultural Adaptability (7 sub-scales) + geo filter.
   ------------------------------------------------------------------------- */
function scoreAdaptability(responsesById = {}) {
  const scales = ["UrbanRural", "DiversityOpen", "InterGen", "LangAdapt", "SocialFlex", "TeamAdapt", "GeoFlex"];
  const subScales = scales.map((scale) => {
    const { m, n } = scaleMean(Q.ADAPTABILITY, responsesById, scale);
    const t = meanToT(m);
    return { scale, mean: round1(m), tScore: t, answered: n };
  });
  const byScale = Object.fromEntries(subScales.map((s) => [s.scale, s.mean]));

  const overallMean = mean(subScales.filter((s) => s.answered).map((s) => s.mean));
  const adaptabilityT = meanToT(overallMean);

  // Geographic filter: low GeoFlex + low UrbanRural (avg ≤ 2.0) → metro-heavy /
  // field-posting careers down-ranked; "prefer staying close to home" honoured.
  const geoMean = mean([byScale.GeoFlex || 0, byScale.UrbanRural || 0].filter(Boolean));
  const lowGeoFilter = geoMean > 0 && geoMean <= 2.0;

  // Urban-rural comfort (0..100) for the environment filter.
  const urbanRuralComfort = byScale.UrbanRural ? Math.round(((byScale.UrbanRural - 1) / 4) * 100) : 0;

  return {
    subScales,
    adaptabilityT,
    adaptabilityBand: eqBand(adaptabilityT),
    urbanRuralComfort,
    lowGeoFilter,
  };
}

/* -------------------------------------------------------------------------
   SJT (Blocks F + G) — MO/LO competency points + crisis-option detection.
   sjtById: { [id]: { mostLikely, leastLikely, note? } }
   ------------------------------------------------------------------------- */
function scoreSjt(sjtById = {}) {
  const all = [...Q.SJT_F, ...Q.SJT_G];
  let total = 0; let maxTotal = 0;
  const competencyPoints = {};
  const breakdown = [];
  let crisisSjtFlag = false;

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

    // Crisis detection: choosing the passive/at-risk option on a crisis scenario.
    if (sc.crisisOption && pick.mostLikely === sc.crisisOption) {
      crisisSjtFlag = true;
    }

    breakdown.push({ id: sc.id, mostLikely: pick.mostLikely || null, leastLikely: pick.leastLikely || null, earned });
  }

  const competencies = Object.entries(competencyPoints)
    .map(([name, score]) => ({ name, score }))
    .sort((a, b) => b.score - a.score);
  const percentage = maxTotal ? Math.round((total / maxTotal) * 100) : 0;
  // SJT contributes a T-score-like figure to the overall EQ composite.
  const sjtT = clampT(40 + (percentage / 100) * 30); // 0%→40, 100%→70
  return { total, maxTotal, percentage, sjtT, competencies, breakdown, crisisSjtFlag };
}

/* -------------------------------------------------------------------------
   VALIDITY — LikeMe social-desirability + RII inconsistency.
   responsesById here is the union of validity items + all section responses.
   ------------------------------------------------------------------------- */
function scoreValidity(validityById = {}, allResponses = {}) {
  const likeItems = Q.VALIDITY.filter((i) => i.validity === "LikeMe");
  const likeVals = likeItems.map((i) => Number(validityById[i.id])).filter(Boolean);
  const likeMean = mean(likeVals);
  const likeMeT = meanToT(likeMean);
  const socialDesirabilityFlag = likeMeT > 65; // aspirational rather than actual

  // RII: both items in a semantic-opposite pair rated ≥4 → inconsistency.
  let inconsistentPairs = 0;
  let pairsChecked = 0;
  for (const pair of Q.RII_PAIRS) {
    const a = Number(allResponses[pair.a]);
    const b = Number(allResponses[pair.b]);
    if (!a || !b) continue;
    pairsChecked += 1;
    if (a >= 4 && b >= 4) inconsistentPairs += 1;
  }
  const inconsistencyRate = pairsChecked ? inconsistentPairs / pairsChecked : 0;
  const inconsistencyFlag = inconsistencyRate >= 0.5;

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
   OVERALL EQ — weighted composite of section T-scores + SJT.
   Weights from §10.1 (relative): A 8, B 8, C 10, D 8, E 4, SJT 7.
   ------------------------------------------------------------------------- */
function computeOverallEq({ selfAwareness, selfRegulation, resilience, empathy, adaptability, sjt }) {
  const parts = [
    { t: selfAwareness.tScore, w: 8 },
    { t: selfRegulation.tScore, w: 8 },
    { t: resilience.resilienceIndex, w: 10 },
    { t: empathy.empathyScore, w: 8 },
    { t: adaptability.adaptabilityT, w: 4 },
    { t: sjt.sjtT, w: 7 },
  ].filter((p) => p.t != null);
  const wsum = parts.reduce((s, p) => s + p.w, 0);
  const composite = wsum ? Math.round(parts.reduce((s, p) => s + p.t * p.w, 0) / wsum) : 50;
  const t = clampT(composite);
  return { tScore: t, band: eqBand(t) };
}

/* -------------------------------------------------------------------------
   WELLBEING / CRISIS flags + summary (0..100 EQ-readiness index for the dial).
   ------------------------------------------------------------------------- */
function computeFlagsAndSummary({ selfRegulation, resilience, empathy, sjt, validity, overall, crisisSelfCheck }) {
  const crisisSelfCheckFlag = Number(crisisSelfCheck) >= (Q.CRISIS_SELF_CHECK.threshold || 4);

  // Burnout risk (standalone proxy): low resilience index + low regulation.
  const burnoutRiskFlag = resilience.resilienceIndex < 42 && selfRegulation.tScore < 45;

  // Crisis support: crisis SJT option chosen OR explicit self-check OR combined critical.
  const crisisSupportFlag = sjt.crisisSjtFlag || crisisSelfCheckFlag || resilience.combinedCritical;

  const flags = {
    impulsivityRisk: selfRegulation.impulsivityFlag,
    fixedMindset: resilience.fixedMindsetFlag,
    empathicOverInvolvement: empathy.overInvolvementFlag,
    combinedCriticalResilience: resilience.combinedCritical,
    burnoutRisk: burnoutRiskFlag,
    crisisSupport: crisisSupportFlag,
    crisisSelfCheck: crisisSelfCheckFlag,
    socialDesirability: validity.socialDesirabilityFlag,
    inconsistency: validity.inconsistencyFlag,
  };

  // EQ-readiness dial: overall T mapped to 0..100 ((T−20)/60×100).
  const overallPct = clamp(Math.round(((overall.tScore - 20) / 60) * 100), 0, 100);

  return {
    flags,
    summary: {
      overall: overallPct,
      tScore: overall.tScore,
      band: overall.band,
      preliminary: true,
    },
  };
}

module.exports = {
  scoreSelfAwareness,
  scoreSelfRegulation,
  scoreResilience,
  scoreEmpathy,
  scoreAdaptability,
  scoreSjt,
  scoreValidity,
  computeOverallEq,
  computeFlagsAndSummary,
  eqBand,
};
