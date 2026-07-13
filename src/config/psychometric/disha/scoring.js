/**
 * DISHA scoring engine.
 *
 * Implements the algorithms from §13 of the DISHA review document:
 *  - Aptitude: formula scoring [Correct − Wrong/(k−1)] → T-score (M=50, SD=10).
 *  - Personality: ipsative adjustment + reverse scoring → T-scores per OCEAN factor.
 *  - RIASEC: R_total = Likert(0.60) + ForcedChoice(0.40) → Holland code (top 3).
 *  - Work Values: ranked value scores; Family-Congruent index.
 *  - SJT: competency points from Most-Likely / Least-Likely choices.
 *  - Validity: Social-Desirability (Like-Me), Rare-Virtues, Inconsistency flags.
 *  - SSI: Subject Strength Index per subject (recency + trend + relative strength).
 *  - CCRE: pillar aggregation → overall Fit indices (T1-only weighting).
 *
 * Norm parameters are approximate (no real standardisation sample exists yet);
 * each aptitude dimension uses a configured raw mean/SD so T-scores and zones
 * behave sensibly. These can be swapped for real norm tables later.
 */

const Q = require("./questions");

const K = 4; // options per aptitude MCQ → wrong penalty = 1/(k-1) = 1/3

// Approx norm parameters per aptitude dimension: { items, meanRaw, sdRaw }.
// meanRaw ≈ expected formula-score for an average student; sdRaw spreads the T.
const APTITUDE_NORMS = {
  verbal: { meanRaw: 9, sdRaw: 4 },
  numerical: { meanRaw: 8, sdRaw: 4 },
  logical: { meanRaw: 4, sdRaw: 2.2 },
  spatial: { meanRaw: 7, sdRaw: 3.5 },
  abstract: { meanRaw: 7, sdRaw: 3.5 },
  closure: { meanRaw: 3, sdRaw: 1.8 },
  clerical: { meanRaw: 3, sdRaw: 1.8 },
  mechanical: { meanRaw: 2.5, sdRaw: 1.5 },
  memory: { meanRaw: 18, sdRaw: 8 },
  creativity: { meanRaw: 6, sdRaw: 3 },
};

const clampT = (t) => Math.max(20, Math.min(80, Math.round(t)));

function tScoreZone(t) {
  if (t >= 65) return "Exceptional";
  if (t >= 55) return "Strong";
  if (t >= 45) return "Average";
  if (t >= 35) return "Developing";
  return "Needs support";
}

function rawToT(raw, meanRaw, sdRaw) {
  if (!sdRaw) return 50;
  return clampT(10 * ((raw - meanRaw) / sdRaw) + 50);
}

/* -------------------------------------------------------------------------
   APTITUDE
   answersById: { [questionId]: optionIndex }  (selected option 0..3)
   For "count"/"open_list"/"text_recall" memory & creativity items, the answer
   may be a number (count) or a string (recall / list). Handled per format.
   ------------------------------------------------------------------------- */
function scoreAptitude(answersById) {
  // Collect raw formula scores per dimension.
  const dims = {};
  const addRaw = (dim, val) => { dims[dim] = (dims[dim] || 0) + val; };

  // Standard MCQ banks (verbal, numerical/logical, spatial, abstract, closure/clerical/mech).
  const mcqBanks = [Q.VERBAL, Q.NUMERICAL, Q.SPATIAL, Q.ABSTRACT, Q.CLOSURE_CLERICAL_MECH];
  for (const bank of mcqBanks) {
    for (const item of bank) {
      const sel = answersById[item.id];
      if (sel === undefined || sel === null) continue;
      const correct = Number(sel) === item.answer;
      addRaw(item.dim, correct ? 1 : -1 / (K - 1));
    }
  }

  // Memory & creativity items: counts / recall accuracy / list fluency.
  for (const item of Q.MEMORY_CREATIVITY) {
    const ans = answersById[item.id];
    if (ans === undefined || ans === null || ans === "") continue;
    if (item.format === "count") {
      addRaw(item.dim, Number(ans) || 0);
    } else if (item.format === "text_recall") {
      // exact-match recall → full credit (length of answer); else partial char match.
      const norm = String(ans).replace(/[^0-9]/g, "");
      const target = String(item.answer);
      let hits = 0;
      for (let i = 0; i < target.length; i++) if (norm[i] === target[i]) hits++;
      addRaw(item.dim, hits);
    } else if (item.format === "open_list") {
      // fluency = number of non-empty lines (proxy for divergent-thinking output).
      const lines = String(ans).split("\n").map((l) => l.trim()).filter(Boolean);
      addRaw(item.dim, lines.length);
    } else if (item.options) {
      const correct = Number(ans) === item.answer;
      addRaw(item.dim, correct ? 1 : -1 / (K - 1));
    }
  }

  // Convert each raw dimension into a T-score using its norm parameters.
  const dimensions = Object.keys(APTITUDE_NORMS).map((dim) => {
    const raw = dims[dim] || 0;
    const { meanRaw, sdRaw } = APTITUDE_NORMS[dim];
    const t = rawToT(raw, meanRaw, sdRaw);
    return { dim, raw: Math.round(raw * 100) / 100, tScore: t, zone: tScoreZone(t) };
  });

  const avgT = dimensions.length
    ? Math.round(dimensions.reduce((s, d) => s + d.tScore, 0) / dimensions.length)
    : 50;

  return { dimensions, averageT: avgT };
}

/* -------------------------------------------------------------------------
   PERSONALITY (OCEAN) — ipsative adjustment + reverse scoring.
   responsesById: { [id]: 1..5 }
   ------------------------------------------------------------------------- */
function scorePersonality(responsesById) {
  const factors = { O: [], C: [], E: [], A: [], N: [] };
  for (const item of Q.OCEAN) {
    if (!item.factor) continue; // skip validity items here
    const raw = Number(responsesById[item.id]);
    if (!raw) continue;
    const scored = item.reverse ? 6 - raw : raw;
    factors[item.factor].push(scored);
  }

  // raw factor means
  const rawMeans = {};
  for (const f of Object.keys(factors)) {
    const arr = factors[f];
    rawMeans[f] = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 3;
  }
  const grandMean = Object.values(rawMeans).reduce((a, b) => a + b, 0) / 5;

  // ipsative adjustment: adj = rawMean − (sum of all factor means / 5)
  // → recentre around the person's own average (controls 'nod bias').
  const result = {};
  for (const f of Object.keys(factors)) {
    const adj = rawMeans[f] - grandMean; // roughly −2..+2
    // map adjusted mean to a T-score: T = 50 + adj*10 (adj of +1 ≈ T60)
    const t = clampT(50 + adj * 12);
    result[f] = {
      rawMean: Math.round(rawMeans[f] * 100) / 100,
      adjusted: Math.round(adj * 100) / 100,
      tScore: t,
      zone: tScoreZone(t),
    };
  }
  return result;
}

/* -------------------------------------------------------------------------
   RIASEC — combined Likert(0.60) + ForcedChoice(0.40).
   fcById: { [id]: "A"|"B" }; likertById: { [id]: 1..5 }
   ------------------------------------------------------------------------- */
function scoreRiasec(fcById, likertById) {
  const types = ["R", "I", "A", "S", "E", "C"];
  const fcCount = {}; const fcMax = {};
  const likSum = {}; const likCount = {};
  types.forEach((t) => { fcCount[t] = 0; fcMax[t] = 0; likSum[t] = 0; likCount[t] = 0; });

  for (const pair of Q.RIASEC_FC) {
    fcMax[pair.optionA.dim] += 1;
    fcMax[pair.optionB.dim] += 1;
    const sel = fcById[pair.id];
    if (sel === "A") fcCount[pair.optionA.dim] += 1;
    else if (sel === "B") fcCount[pair.optionB.dim] += 1;
  }
  for (const item of Q.RIASEC_LIKERT) {
    const v = Number(likertById[item.id]);
    if (!v) continue;
    likSum[item.dim] += v;
    likCount[item.dim] += 1;
  }

  // Normalise each component to 0..100, then combine.
  const scores = types.map((t) => {
    const likPct = likCount[t] ? ((likSum[t] / likCount[t]) - 1) / 4 * 100 : 0; // 1..5 → 0..100
    const fcPct = fcMax[t] ? (fcCount[t] / fcMax[t]) * 100 : 0;
    const combined = Math.round(likPct * 0.6 + fcPct * 0.4);
    return { type: t, likert: Math.round(likPct), forcedChoice: Math.round(fcPct), combined };
  });

  const sorted = [...scores].sort((a, b) => b.combined - a.combined);
  const hollandCode = sorted.slice(0, 3).map((s) => s.type).join("");
  return { scores, hollandCode };
}

/* -------------------------------------------------------------------------
   WORK VALUES — rank value scores; capture Family-Congruent index.
   likertById: { [id]: 1..5 }; fcById: { [id]: "A"|"B" }
   ------------------------------------------------------------------------- */
function scoreWorkValues(likertById, fcById) {
  const values = [];
  let familyCongruent = null;
  for (const item of Q.WORK_VALUES) {
    if (item.type === "forced_choice") {
      const sel = fcById[item.id];
      familyCongruent = sel === "A" ? "family" : sel === "B" ? "passion" : null;
      continue;
    }
    const v = Number(likertById[item.id]);
    if (!v) continue;
    values.push({ scale: item.scale, score: v });
  }
  const ranked = [...values].sort((a, b) => b.score - a.score);
  return { ranked, topValues: ranked.slice(0, 5).map((v) => v.scale), familyCongruent };
}

/* -------------------------------------------------------------------------
   SJT — competency points from Most-Likely / Least-Likely picks.
   sjtById: { [scenarioId]: { mostLikely: "B", leastLikely: "D" } }
   MO = +2 weight on the chosen option's moPoints; LO = −1 on poorest avoided.
   ------------------------------------------------------------------------- */
function scoreSjt(sjtById) {
  let total = 0; let maxTotal = 0;
  const competencyPoints = {};
  const breakdown = [];

  for (const sc of Q.SJT) {
    const pick = sjtById[sc.id] || {};
    const moOpt = sc.options.find((o) => o.key === pick.mostLikely);
    const loOpt = sc.options.find((o) => o.key === pick.leastLikely);
    const best = Math.max(...sc.options.map((o) => o.moPoints));
    const worst = Math.min(...sc.options.map((o) => o.moPoints));
    maxTotal += best * 2;

    let earned = 0;
    if (moOpt) earned += moOpt.moPoints * 2;
    // reward correctly identifying a poor option as least-likely
    if (loOpt && loOpt.moPoints === worst) earned += 1;
    total += earned;

    // attribute the most-likely option's quality to its competencies
    if (moOpt) {
      const quality = moOpt.moPoints; // 0..3
      for (const comp of sc.competencies) {
        competencyPoints[comp] = (competencyPoints[comp] || 0) + quality;
      }
    }
    breakdown.push({ id: sc.id, title: sc.title, mostLikely: pick.mostLikely || null, leastLikely: pick.leastLikely || null, earned });
  }

  const competencies = Object.entries(competencyPoints)
    .map(([name, score]) => ({ name, score }))
    .sort((a, b) => b.score - a.score);

  const percentage = maxTotal ? Math.round((total / maxTotal) * 100) : 0;
  return { total, maxTotal, percentage, competencies, breakdown };
}

/* -------------------------------------------------------------------------
   VALIDITY — Social Desirability (Like-Me), Rare Virtues, RII inconsistency.
   responsesById covers OCEAN/likert items (1..5).
   ------------------------------------------------------------------------- */
function scoreValidity(responsesById) {
  let sdScore = 0; let sdMax = 0; // Like-Me: agree on aspirational items
  let rvScore = 0;                // Rare Virtues: +1 per agreement (>=3 → flag)

  for (const item of Q.OCEAN) {
    if (!item.validity) continue;
    const v = Number(responsesById[item.id]);
    if (item.validity === "SD") {
      sdMax += 1;
      if (v >= 4) sdScore += 1;
    } else if (item.validity === "RV") {
      if (v >= 4) rvScore += 1;
    }
  }
  // Map Like-Me to a T-score (high → impression management).
  const sdT = sdMax ? clampT(50 + ((sdScore / sdMax) - 0.4) * 50) : 50;

  // Response Inconsistency Index (RII): semantically-opposite pairs that exist in
  // our bank. Both items rated extreme (>=4) on contradictory statements → flag.
  const realPairs = [
    { a: "C3", b: "WV_WLB" },      // persistence vs flexibility/balance
    { a: "RL_I3", b: "E1" },        // independent focus vs needing crowds
    { a: "N5", b: "N1" },           // bounce back vs chronic worry (reverse-keyed N5)
  ];
  let inconsistentPairs = 0;
  for (const p of realPairs) {
    const va = Number(responsesById[p.a]);
    const vb = Number(responsesById[p.b]);
    if (va >= 4 && vb >= 4) inconsistentPairs += 1;
  }

  const flags = [];
  if (sdT > 65) flags.push({ scale: "Like-Me (Social Desirability)", severity: "elevated", note: "Responses may reflect aspirational rather than actual self. Deepen interview with open-ended questions." });
  if (rvScore >= 3) flags.push({ scale: "Rare Virtues", severity: "elevated", note: "Agreement on universally-unachievable virtues suggests extreme positive self-presentation." });
  if (inconsistentPairs > 1) flags.push({ scale: "Response Inconsistency (RII)", severity: inconsistentPairs > 2 ? "severe" : "minor", note: "Contradictory responses on semantically-opposite items. Severe RII may invalidate aptitude scores." });

  return {
    likeMe: { score: sdScore, max: sdMax, tScore: sdT },
    rareVirtues: { score: rvScore },
    inconsistency: { pairs: inconsistentPairs },
    flags,
    clean: flags.length === 0,
  };
}

/* -------------------------------------------------------------------------
   SSI — Subject Strength Index per subject.
   marks: [{ subjectKey, terms: { previousYear:{obtained,maximum}, ... }, enjoyment }]
   SSI = WeightedAvg%(0.70) + TrendScore(0.20 normalised) + RelativeStrength(0.10)
   ------------------------------------------------------------------------- */
function scoreAcademic(marks, allSubjectAverages) {
  const termWeight = {};
  Q.ACADEMIC_TERMS.forEach((t) => { termWeight[t.key] = t.recencyWeight; });

  const perSubject = [];
  for (const m of marks || []) {
    const terms = m.terms || {};
    let wSum = 0; let wTotal = 0;
    const pcts = [];
    // weighted average %, recency-weighted
    for (const tk of Object.keys(terms)) {
      const { obtained, maximum } = terms[tk] || {};
      if (!maximum || obtained === undefined || obtained === null) continue;
      const pct = (Number(obtained) / Number(maximum)) * 100;
      const w = termWeight[tk] || 1;
      wSum += pct * w;
      wTotal += w;
      pcts.push({ tk, pct });
    }
    if (!wTotal) continue;
    const weightedAvg = wSum / wTotal;

    // trend: compare most-recent vs earliest available
    const ordered = Q.ACADEMIC_TERMS.map((t) => t.key).filter((k) => terms[k] && terms[k].maximum);
    let trendScore = 0;
    if (ordered.length >= 2) {
      const first = (terms[ordered[0]].obtained / terms[ordered[0]].maximum) * 100;
      const last = (terms[ordered[ordered.length - 1]].obtained / terms[ordered[ordered.length - 1]].maximum) * 100;
      const delta = last - first;
      if (delta >= 8) trendScore = 10;
      else if (delta >= 3) trendScore = 5;
      else if (delta <= -8) trendScore = -10;
      else if (delta <= -3) trendScore = -5;
      else trendScore = 0;
    }

    perSubject.push({ subjectKey: m.subjectKey, weightedAvg, trendScore, enjoyment: m.enjoyment ?? null, pcts });
  }

  // relative strength: subject vs student's own average across all subjects
  const overallAvg = perSubject.length
    ? perSubject.reduce((s, x) => s + x.weightedAvg, 0) / perSubject.length
    : 0;

  const subjects = perSubject.map((x) => {
    const relStrength = x.weightedAvg - overallAvg; // +ve above, −ve below
    // normalise trend (−10..10 → 0..100 contribution) and relStrength (−30..30 → 0..100)
    const trendNorm = ((x.trendScore + 10) / 20) * 100;
    const relNorm = Math.max(0, Math.min(100, 50 + relStrength * (50 / 30)));
    const ssi = Math.round(x.weightedAvg * 0.7 + trendNorm * 0.2 + relNorm * 0.1);
    let zone = "Below-average";
    if (x.weightedAvg >= 85) zone = "Excellent";
    else if (x.weightedAvg >= 70) zone = "Good";
    else if (x.weightedAvg >= 55) zone = "Average";
    // self-efficacy / impostor flag: high marks but low enjoyment
    const enjoymentFlag = x.enjoyment !== null && x.enjoyment <= 2 && x.weightedAvg >= 75
      ? "Performing well in a subject you dislike — worth discussing with counsellor."
      : null;
    return {
      subjectKey: x.subjectKey,
      weightedAvg: Math.round(x.weightedAvg * 10) / 10,
      trendScore: x.trendScore,
      relativeStrength: Math.round(relStrength * 10) / 10,
      ssi,
      zone,
      enjoyment: x.enjoyment,
      enjoymentFlag,
    };
  });

  const composite = subjects.length
    ? Math.round(subjects.reduce((s, x) => s + x.ssi, 0) / subjects.length)
    : 0;

  return { subjects, composite, overallAverage: Math.round(overallAvg * 10) / 10 };
}

/* -------------------------------------------------------------------------
   CCRE — overall Fit indices from pillars (T1-only weighting from §2.2 / §13.4).
   Produces 0..100 pillar scores and a blended overall index. This is a
   T1-standalone snapshot (full career matching against the IOD happens in the
   Combined engine once more tests are completed).
   ------------------------------------------------------------------------- */
function computeCcre({ aptitude, academic, personality, riasec, workValues }) {
  // Aptitude pillar: average T mapped to 0..100 (T20..T80 → 0..100).
  const aptitudePillar = Math.round(Math.max(0, Math.min(100, ((aptitude.averageT - 20) / 60) * 100)));
  // Marks pillar: SSI composite already 0..100.
  const marksPillar = academic.composite || 0;
  // Personality pillar: how 'developed' the adaptive profile is — use C & O & low N as a proxy
  const persPillar = personality
    ? Math.round(Math.max(0, Math.min(100, (personality.C.tScore + personality.O.tScore + (100 - personality.N.tScore)) / 3 * (100 / 80))))
    : 50;
  // Interests pillar: strength of top Holland type.
  const interestsPillar = riasec && riasec.scores.length
    ? Math.max(...riasec.scores.map((s) => s.combined))
    : 50;
  // Values pillar: top value strength (1..5 → 0..100).
  const valuesPillar = workValues && workValues.ranked.length
    ? Math.round(((workValues.ranked[0].score - 1) / 4) * 100)
    : 50;

  // T1-only weights: Aptitude 35, Marks 30, Personality 15, Interests 15, Values 5.
  const overall = Math.round(
    aptitudePillar * 0.35 +
    marksPillar * 0.30 +
    persPillar * 0.15 +
    interestsPillar * 0.15 +
    valuesPillar * 0.05
  );

  return {
    pillars: {
      aptitude: aptitudePillar,
      marks: marksPillar,
      personality: persPillar,
      interests: interestsPillar,
      values: valuesPillar,
    },
    overall,
    preliminary: true, // flagged Preliminary until full battery completed
  };
}

module.exports = {
  scoreAptitude,
  scorePersonality,
  scoreRiasec,
  scoreWorkValues,
  scoreSjt,
  scoreValidity,
  scoreAcademic,
  computeCcre,
  tScoreZone,
};
