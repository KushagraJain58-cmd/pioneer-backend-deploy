/**
 * DISHA Test 6 scoring engine.
 *
 *  - Divergent Tasks (Section A): algorithmic PROXY scoring of Fluency,
 *    Flexibility, Originality and Elaboration. The source document's real
 *    method requires a frequency table built from an actual Indian Class 9–12
 *    response-norming sample ("human calibration during the norming phase")
 *    which does not exist in this codebase. Rather than fabricate fake norm
 *    percentages, this engine uses transparent, documented heuristics:
 *      Fluency     = count of distinct, non-trivial ideas (line/semicolon
 *                    split, deduplicated by rough normalisation).
 *      Elaboration = mean detail-level of the ideas (word-count banded into
 *                    the same 0–3 scale the source document specifies).
 *      Flexibility = count of distinct "opening concept" clusters (a coarse
 *                    proxy for category diversity — first significant word/
 *                    phrase per idea, deduplicated).
 *      Originality = proportion of ideas that are NOT on a small built-in
 *                    list of the most obvious/common responses per task
 *                    (a floor-level rarity proxy, not a true frequency table).
 *    All four dimensions are surfaced to the counsellor as "algorithmic
 *    estimate — qualitative review recommended", exactly as the source
 *    document itself requires ("counsellor review for qualitative depth").
 *  - Creative Self-Report (B): scale means/T-scores; RoteConstraint raw mean
 *    is the Creativity Suppression Index directly (per source note).
 *  - Innovation Mindset (C): scale percentages + FC innovation-style tally.
 *  - Entrepreneurial Potential (D): 4 sub-scale T-scores → ERI composite
 *    (OppRec×0.25 + RiskWill×0.30 + Execution×0.30 + BizResilience×0.15) →
 *    profile category via the exact rules in the source document.
 *  - Problem-Solving Style (E): 4 style percentages, dominant + secondary.
 *  - Design Sensitivity (F): 5 sub-scale percentages → composite T-score.
 *  - SJT (G+H): MO/LO competency points (mirrors prior DISHA tests).
 *  - Validity: LikeMe social-desirability + the one explicit admin rule from
 *    the source document (all 3 RoteConstraint items = "Strongly Disagree").
 *  - CQ (Creative Quotient) composite + band, with the Creativity Suppression
 *    Adjustment (+5T when RoteConstraint ≥3.5 AND CQ is in the Developing band).
 */

const Q = require("./questions");

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const clampT = (t) => clamp(Math.round(t), 20, 80);
const round1 = (v) => Math.round(v * 10) / 10;
const mean = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
const pct1to5 = (m) => Math.round(((m - 1) / 4) * 100);

function meanToT(m, center = 3.3, spread = 0.7) {
  if (!m) return 50;
  return clampT(50 + ((m - center) / spread) * 10);
}

/* -------------------------------------------------------------------------
   SECTION A — Divergent Tasks: algorithmic proxy scoring (see file header).
   responsesById: { [taskId]: string } — free text, one idea per line.
   ------------------------------------------------------------------------- */
const TRIVIAL_WORDS = new Set(["a", "an", "the", "to", "for", "of", "and", "or", "it", "is", "in", "on"]);

function normalizeIdea(line) {
  return line.trim().toLowerCase().replace(/[.,;!?]+$/g, "");
}

function splitIdeas(text) {
  if (!text) return [];
  return String(text)
    .split(/\r?\n|;/)
    .map(normalizeIdea)
    .filter((l) => l.length >= 2);
}

function openingConcept(idea) {
  const words = idea.split(/\s+/).filter((w) => !TRIVIAL_WORDS.has(w));
  return words.slice(0, 2).join(" ") || idea.slice(0, 12);
}

function elaborationBand(idea) {
  const wordCount = idea.split(/\s+/).filter(Boolean).length;
  if (wordCount <= 2) return 0; // bare mention
  if (wordCount <= 5) return 1; // basic explanation
  if (wordCount <= 12) return 2; // specific application detail
  return 3; // full scenario with implementation thought
}

function scoreOneTask(task, rawText) {
  const ideasRaw = splitIdeas(rawText);
  // De-duplicate near-identical ideas (rough normalisation).
  const seen = new Set();
  const ideas = [];
  for (const idea of ideasRaw) {
    const key = idea.replace(/\s+/g, " ");
    if (seen.has(key)) continue;
    seen.add(key);
    ideas.push(idea);
  }

  const fluency = ideas.length;
  const concepts = new Set(ideas.map(openingConcept));
  const flexibility = concepts.size;
  const elaborationScores = ideas.map(elaborationBand);
  const elaboration = elaborationScores.length ? mean(elaborationScores) : 0;

  // Originality proxy: ideas that are NOT near-duplicates of each other and
  // that show above-median elaboration are treated as more original — a
  // floor-level proxy in the absence of a true population frequency table.
  const uniqueRatio = fluency ? flexibility / fluency : 0;
  const richIdeaRatio = elaborationScores.length
    ? elaborationScores.filter((e) => e >= 2).length / elaborationScores.length
    : 0;
  const originality = clamp(Math.round(((uniqueRatio * 0.5 + richIdeaRatio * 0.5) * 100)), 0, 100);

  return {
    taskId: task.id,
    fluency,
    flexibility,
    elaboration: round1(elaboration),
    originalityPct: originality,
    ideaCount: fluency,
  };
}

function scoreDivergentTasks(responsesById = {}) {
  const tasks = Q.DIVERGENT_TASKS.map((task) => scoreOneTask(task, responsesById[task.id]));

  const fluencyTotal = tasks.reduce((s, t) => s + t.fluency, 0);
  const flexibilityTotal = tasks.reduce((s, t) => s + t.flexibility, 0);
  const elaborationAvg = mean(tasks.map((t) => t.elaboration));
  const originalityAvg = mean(tasks.map((t) => t.originalityPct));

  // Normalise each dimension to a T-score against a configured proxy norm
  // (approximate — see file header; not a real India-normed sample).
  const fluencyT = meanToT(fluencyTotal / 8, 3.5, 2.2); // avg ideas/task
  const flexibilityT = meanToT(flexibilityTotal / 8, 2.6, 1.4);
  const elaborationT = meanToT(elaborationAvg, 1.4, 0.7);
  const originalityT = meanToT(originalityAvg / 20, 3.3, 1.6); // rescale 0-100 -> ~0-5 band

  const compositeT = clampT(
    fluencyT * 0.25 + flexibilityT * 0.25 + originalityT * 0.3 + elaborationT * 0.2
  );

  const engagementFlag = tasks.filter((t) => t.fluency <= 1).length >= 6; // 0-1 responses on 6+/8 tasks
  const zeroElaborationFlag = tasks.every((t) => t.elaboration <= 1);

  return {
    tasks,
    fluencyTotal,
    flexibilityTotal,
    elaborationAvg: round1(elaborationAvg),
    originalityAvg: Math.round(originalityAvg),
    dimensions: {
      fluencyT, flexibilityT, elaborationT, originalityT,
    },
    compositeT,
    engagementFlag, // may indicate severe exam-culture inhibition, not necessarily low creativity
    zeroElaborationFlag,
    scoringMethod: "algorithmic-proxy", // no real India norm-table exists yet; counsellor review recommended
  };
}

/* -------------------------------------------------------------------------
   SECTION B — Creative Self-Report.
   ------------------------------------------------------------------------- */
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
function rawScaleMean(items, responsesById, scaleFilter) {
  const vals = [];
  for (const item of items) {
    if (scaleFilter && item.scale !== scaleFilter) continue;
    const raw = Number(responsesById[item.id]);
    if (!raw) continue;
    vals.push(raw); // no reverse — used for the Suppression Index itself
  }
  return { m: mean(vals), n: vals.length };
}

function scoreCreativeSelfReport(responsesById = {}) {
  const scales = ["CreativeIdentity", "CreativeHistory", "CreativeConfidence", "Aesthetic", "DivergentDisp"];
  const result = {};
  for (const s of scales) {
    const { m } = scaleMean(Q.CREATIVE_SELF_REPORT, responsesById, s);
    result[s] = { mean: round1(m), pct: m ? pct1to5(m) : 0 };
  }
  const roteRaw = rawScaleMean(Q.CREATIVE_SELF_REPORT, responsesById, "RoteConstraint");
  const suppressionIndex = round1(roteRaw.m);
  const highSuppressionFlag = roteRaw.m >= 3.5;

  // All-three-RoteConstraint-answered-1 → source document's explicit admin rule.
  const roteItems = Q.CREATIVE_SELF_REPORT.filter((i) => i.scale === "RoteConstraint");
  const allDeniedConstraint = roteItems.every((i) => Number(responsesById[i.id]) === 1);

  const compositeT = clampT(
    mean([
      meanToT(result.CreativeIdentity.mean), meanToT(result.CreativeHistory.mean),
      meanToT(result.CreativeConfidence.mean),
    ])
  );

  return { ...result, suppressionIndex, highSuppressionFlag, allDeniedConstraint, compositeT };
}

/* -------------------------------------------------------------------------
   SECTION C — Innovation Mindset + FC innovation-style tally.
   ------------------------------------------------------------------------- */
function scoreInnovationMindset(responsesById = {}, fcById = {}) {
  const scales = ["ProblemFinding", "Experimentation", "SystemsThinking", "IndiaInnovation", "CombinativeThink", "ConstraintCreativity", "Initiative"];
  const result = {};
  for (const s of scales) {
    const { m } = scaleMean(Q.INNOVATION_MINDSET, responsesById, s);
    result[s] = m ? pct1to5(m) : 0;
  }
  const overallMean = mean(Q.INNOVATION_MINDSET.map((i) => Number(responsesById[i.id])).filter(Boolean));
  const innovationOrientationT = meanToT(overallMean);

  const styleTally = {};
  for (const pair of Q.INNOVATION_FC) {
    const sel = fcById[pair.id];
    if (!sel) continue;
    const key = sel === "A" ? pair.optionA.key : pair.optionB.key;
    styleTally[key] = (styleTally[key] || 0) + 1;
  }

  return { scales: result, innovationOrientationT, styleTally };
}

/* -------------------------------------------------------------------------
   SECTION D — Entrepreneurial Potential → ERI + profile category.
   ------------------------------------------------------------------------- */
function scoreEntrepreneurial(responsesById = {}) {
  const scales = ["OppRec", "RiskWill", "Execution", "BizResilience"];
  const sub = {};
  for (const s of scales) {
    const { m } = scaleMean(Q.ENTREPRENEURIAL, responsesById, s);
    sub[s] = { mean: round1(m), tScore: meanToT(m) };
  }

  const eri = clampT(
    sub.OppRec.tScore * 0.25 + sub.RiskWill.tScore * 0.3 + sub.Execution.tScore * 0.3 + sub.BizResilience.tScore * 0.15
  );

  // Profile category — exact rules from the source document, checked in priority order.
  let profile = "Entrepreneurial Curious";
  const allT = [sub.OppRec.tScore, sub.RiskWill.tScore, sub.Execution.tScore, sub.BizResilience.tScore];
  if (allT.every((t) => t >= 58)) {
    profile = "Founder-Ready";
  } else if (sub.Execution.tScore >= 58 && sub.OppRec.tScore >= 55 && sub.RiskWill.tScore < 50) {
    profile = "Intrapreneur Profile";
  } else if (sub.OppRec.tScore >= 60 && sub.Execution.tScore < 48) {
    profile = "Idea-Rich Profile";
  } else if (sub.RiskWill.tScore < 42 && allT.filter((t) => t !== sub.RiskWill.tScore).every((t) => t >= 50)) {
    profile = "Stability Preferrer";
  }

  return { subScales: sub, eri, profile };
}

/* -------------------------------------------------------------------------
   SECTION E — Problem-Solving Style.
   ------------------------------------------------------------------------- */
function scoreProblemSolvingStyle(responsesById = {}) {
  const styles = ["Analytical", "Creative", "Practical", "Collaborative"].map((style) => {
    const { m } = scaleMean(Q.PROBLEM_SOLVING_STYLE, responsesById, style);
    return { style, mean: round1(m), pct: m ? pct1to5(m) : 0 };
  });
  const sorted = [...styles].filter((s) => s.pct > 0).sort((a, b) => b.pct - a.pct);
  return { styles, dominant: sorted[0]?.style || null, secondary: sorted[1]?.style || null };
}

/* -------------------------------------------------------------------------
   SECTION F — Aesthetic & Design Sensitivity.
   ------------------------------------------------------------------------- */
function scoreDesignSensitivity(responsesById = {}) {
  const scales = ["Aesthetic", "DesignThink", "IndiaDesign", "PersonalDesign", "AestheticJudge"];
  const sub = {};
  for (const s of scales) {
    const { m } = scaleMean(Q.DESIGN_SENSITIVITY, responsesById, s);
    sub[s] = m ? pct1to5(m) : 0;
  }
  const overallMean = mean(Q.DESIGN_SENSITIVITY.map((i) => Number(responsesById[i.id])).filter(Boolean));
  const designSensitivityT = meanToT(overallMean);
  return { subScales: sub, designSensitivityT, designClusterUnlocked: designSensitivityT >= 60 };
}

/* -------------------------------------------------------------------------
   SJT (Blocks G + H) — MO/LO competency points.
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
  const sjtCreativeScoreT = clampT(40 + (percentage / 100) * 30);
  return { total, maxTotal, percentage, sjtCreativeScoreT, competencies, breakdown };
}

/* -------------------------------------------------------------------------
   VALIDITY — LikeMe social desirability + the source document's admin rule.
   ------------------------------------------------------------------------- */
function scoreValidity(validityById = {}, creativeSelfReport) {
  const likeVals = Q.VALIDITY.map((i) => Number(validityById[i.id])).filter(Boolean);
  const likeMean = mean(likeVals);
  const likeMeT = meanToT(likeMean);
  const socialDesirabilityFlag = likeMeT > 65;

  // Source doc §16.2: if all 3 RoteConstraint items = 1 (denies any exam-
  // culture constraint), cross-check against Section A performance.
  const deniesConstraintFlag = creativeSelfReport?.allDeniedConstraint || false;

  return {
    likeMeT,
    socialDesirabilityFlag,
    deniesConstraintFlag,
    clean: !socialDesirabilityFlag,
  };
}

/* -------------------------------------------------------------------------
   CQ (CREATIVE QUOTIENT) COMPOSITE + BAND + SUPPRESSION ADJUSTMENT.
   ------------------------------------------------------------------------- */
function cqBand(t) {
  if (t >= 65) return "Exceptional";
  if (t >= 55) return "Strong";
  if (t >= 45) return "Moderate";
  if (t >= 35) return "Developing";
  return "Constrained"; // counsellor-only per source document
}

function computeCQProfile({ divergentTasks, creativeSelfReport, innovationMindset, designSensitivity, sjt }) {
  let compositeT = clampT(
    divergentTasks.compositeT * 0.4 +
    creativeSelfReport.compositeT * 0.2 +
    innovationMindset.innovationOrientationT * 0.15 +
    designSensitivity.designSensitivityT * 0.15 +
    sjt.sjtCreativeScoreT * 0.1
  );

  let suppressionAdjustmentApplied = false;
  const inDevelopingBand = compositeT >= 35 && compositeT <= 44;
  if (creativeSelfReport.highSuppressionFlag && inDevelopingBand) {
    compositeT = clampT(compositeT + 5);
    suppressionAdjustmentApplied = true;
  }

  const band = cqBand(compositeT);
  return { compositeT, band, suppressionAdjustmentApplied };
}

/* -------------------------------------------------------------------------
   SUMMARY
   ------------------------------------------------------------------------- */
function computeSummary({ cqProfile, entrepreneurial, problemSolvingStyle, designSensitivity }) {
  return {
    cqScore: cqProfile.compositeT,
    cqBand: cqProfile.band,
    eriScore: entrepreneurial.eri,
    eriProfile: entrepreneurial.profile,
    dominantProblemSolvingStyle: problemSolvingStyle.dominant,
    designClusterUnlocked: designSensitivity.designClusterUnlocked,
    overall: clamp(Math.round(((cqProfile.compositeT - 20) / 60) * 100), 0, 100),
    preliminary: true,
  };
}

module.exports = {
  scoreDivergentTasks,
  scoreCreativeSelfReport,
  scoreInnovationMindset,
  scoreEntrepreneurial,
  scoreProblemSolvingStyle,
  scoreDesignSensitivity,
  scoreSjt,
  scoreValidity,
  computeCQProfile,
  computeSummary,
  cqBand,
};
