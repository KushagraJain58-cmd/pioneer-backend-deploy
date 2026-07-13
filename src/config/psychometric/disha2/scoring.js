/**
 * DISHA Test 2 scoring engine.
 *
 * Implements the algorithms from the Test-2 review document:
 *  - RIASEC (Modules A + B): activity preferences (per-type sum → T-score) and
 *    occupational appeal ratings (distributed to each career's Holland code).
 *    Module A weighted 0.65, Module B weighted 0.35 within Test 2. Top-3 types
 *    form the Holland Code.
 *  - Work Values (Module C): Likert(0.60) + Forced-Choice(0.30) + Ranking(0.10)
 *    → 0–100 per value; family-congruence flag.
 *  - Career Motivations (Module D): per-scale 0–100; Intrinsic–Extrinsic gap.
 *  - Work Environment (Module E): sector / location / work-style FILTER profile
 *    (not a scored construct).
 *  - SJT (Module F): MO/LO competency points (mirrors Test 1).
 *  - Test-2 Career Fit summary: a preliminary "interest + values + motivation"
 *    fit index used until Test 1 (aptitude / marks) data is combined in CCRE.
 *
 * Norm parameters are approximate (no real standardisation sample exists yet).
 * Each RIASEC type uses a configured raw mean/SD so T-scores behave sensibly;
 * these can be swapped for real norm tables later.
 */

const Q = require("./questions");

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const clampT = (t) => clamp(Math.round(t), 20, 80);
const round1 = (v) => Math.round(v * 10) / 10;

function tScoreZone(t) {
  if (t >= 65) return "Dominant";
  if (t >= 55) return "Strong";
  if (t >= 45) return "Moderate";
  if (t >= 35) return "Mild";
  return "Low";
}

// Activity-preference norm: 15 items × (1..5). Average student ≈ 3/item → 45 raw.
const ACTIVITY_NORM = { meanRaw: 45, sdRaw: 10 };

// Holland-code letter weights when an occupation rating is distributed.
const HOLLAND_WEIGHTS = [0.4, 0.2, 0.1];

/* -------------------------------------------------------------------------
   RIASEC — Module A (activity preferences) + Module B (occupational ratings).
   activityById: { [id]: 1..5 }; occupationById: { [id]: 1..5 }
   Returns per-type { activityRaw, activityT, occScore, combined(0..100) } +
   hollandCode (top 3) and a consistency flag (adjacent on the hexagon).
   ------------------------------------------------------------------------- */
const HEXAGON_ORDER = ["R", "I", "A", "S", "E", "C"]; // adjacency around the hexagon

function adjacentOnHexagon(a, b) {
  const ia = HEXAGON_ORDER.indexOf(a);
  const ib = HEXAGON_ORDER.indexOf(b);
  if (ia < 0 || ib < 0) return false;
  const d = Math.abs(ia - ib);
  return d === 1 || d === 5; // neighbours (wrap-around)
}

function scoreRiasec(activityById = {}, occupationById = {}) {
  const types = Q.RIASEC_TYPES;

  // --- Module A: sum of 15 items per type → T-score → 0..100 percent. ---
  const activitySum = {};
  const activityCount = {};
  types.forEach((t) => { activitySum[t] = 0; activityCount[t] = 0; });
  for (const item of Q.ACTIVITY_PREFS) {
    const v = Number(activityById[item.id]);
    if (!v) continue;
    activitySum[item.type] += v;
    activityCount[item.type] += 1;
  }

  // --- Module B: distribute each occupation rating across its Holland code. ---
  const occRaw = {};
  const occMax = {};
  types.forEach((t) => { occRaw[t] = 0; occMax[t] = 0; });
  for (const occ of Q.OCCUPATIONS) {
    const letters = String(occ.holland).toUpperCase().split("").slice(0, 3);
    letters.forEach((L, idx) => {
      const w = HOLLAND_WEIGHTS[idx] || 0;
      occMax[L] = (occMax[L] || 0) + w * 5; // max appeal = 5
    });
    const rating = Number(occupationById[occ.id]);
    if (!rating) return;
    letters.forEach((L, idx) => {
      const w = HOLLAND_WEIGHTS[idx] || 0;
      occRaw[L] = (occRaw[L] || 0) + w * rating;
    });
  }

  const scores = types.map((t) => {
    // activity → T then to 0..100 (T 20..80 → 0..100)
    const raw = activitySum[t];
    const aT = clampT(10 * ((raw - ACTIVITY_NORM.meanRaw) / ACTIVITY_NORM.sdRaw) + 50);
    const activityPct = Math.round(((aT - 20) / 60) * 100);
    const occPct = occMax[t] ? Math.round((occRaw[t] / occMax[t]) * 100) : 0;
    const combined = Math.round(activityPct * 0.65 + occPct * 0.35);
    return {
      type: t,
      activityRaw: raw,
      activityT: aT,
      activityPct: clamp(activityPct, 0, 100),
      occPct: clamp(occPct, 0, 100),
      combined: clamp(combined, 0, 100),
      zone: tScoreZone(aT),
    };
  });

  const sorted = [...scores].sort((a, b) => b.combined - a.combined);
  const top3 = sorted.slice(0, 3).map((s) => s.type);
  const hollandCode = top3.join("");
  const consistent =
    adjacentOnHexagon(top3[0], top3[1]) || adjacentOnHexagon(top3[1], top3[2]);

  return {
    scores,
    hollandCode,
    dominantTypes: sorted.filter((s) => s.activityT >= 60).map((s) => s.type),
    consistency: consistent ? "consistent" : "differentiated",
  };
}

/* -------------------------------------------------------------------------
   WORK VALUES — Module C. Likert(0.60) + FC(0.30) + ranking(0.10) → 0..100.
   likertById: { [id]: 1..5 }; fcById: { [id]: "A"|"B" };
   ranking: ["FinGrowth","Autonomy",...] (ordered top→down, length up to 5)
   ------------------------------------------------------------------------- */
function scoreWorkValues(likertById = {}, fcById = {}, ranking = []) {
  const scales = Q.VALUE_SCALES;
  const likSum = {}; const likCount = {};
  const fcWins = {}; const fcAppear = {};
  scales.forEach((s) => { likSum[s] = 0; likCount[s] = 0; fcWins[s] = 0; fcAppear[s] = 0; });

  for (const item of Q.WORK_VALUES_LIKERT) {
    const v = Number(likertById[item.id]);
    if (!v) continue;
    likSum[item.scale] += v;
    likCount[item.scale] += 1;
  }

  let familyCongruent = null; // tracked from WVFC4 specifically
  for (const pair of Q.WORK_VALUES_FC) {
    fcAppear[pair.optionA.value] = (fcAppear[pair.optionA.value] || 0) + 1;
    fcAppear[pair.optionB.value] = (fcAppear[pair.optionB.value] || 0) + 1;
    const sel = fcById[pair.id];
    if (sel === "A") fcWins[pair.optionA.value] = (fcWins[pair.optionA.value] || 0) + 1;
    else if (sel === "B") fcWins[pair.optionB.value] = (fcWins[pair.optionB.value] || 0) + 1;
    if (pair.id === "WVFC4" && sel) {
      familyCongruent = sel === "A" ? "family" : "passion";
    }
  }

  // ranking → points: rank 1 = 5 ... rank 5 = 1
  const rankPoints = {};
  scales.forEach((s) => { rankPoints[s] = 0; });
  (ranking || []).slice(0, 5).forEach((val, idx) => {
    if (rankPoints[val] !== undefined) rankPoints[val] = 5 - idx;
  });

  const valueScores = scales.map((s) => {
    const likPct = likCount[s] ? ((likSum[s] / likCount[s]) - 1) / 4 * 100 : 0; // 1..5 → 0..100
    const fcPct = fcAppear[s] ? (fcWins[s] / fcAppear[s]) * 100 : 0;
    const rankPct = (rankPoints[s] / 5) * 100; // 0..100
    const combined = Math.round(likPct * 0.6 + fcPct * 0.3 + rankPct * 0.1);
    return { scale: s, likPct: Math.round(likPct), fcPct: Math.round(fcPct), rankPct: Math.round(rankPct), score: clamp(combined, 0, 100) };
  });

  const ranked = [...valueScores].sort((a, b) => b.score - a.score);
  return {
    valueScores,
    ranked,
    topValues: ranked.slice(0, 3).map((v) => v.scale),
    familyCongruent,
    userRanking: (ranking || []).slice(0, 5),
  };
}

/* -------------------------------------------------------------------------
   CAREER MOTIVATIONS — Module D. Per-scale mean → 0..100. Intrinsic–Extrinsic
   gap is the key diagnostic (large gap → counsellor flag, reported neutrally).
   likertById: { [id]: 1..5 }
   ------------------------------------------------------------------------- */
function scoreMotivations(likertById = {}) {
  const scales = Q.MOTIVATION_SCALES;
  const sum = {}; const count = {};
  scales.forEach((s) => { sum[s] = 0; count[s] = 0; });

  for (const item of Q.MOTIVATIONS) {
    const v = Number(likertById[item.id]);
    if (!v) continue;
    sum[item.scale] += v;
    count[item.scale] += 1;
  }

  const motivationScores = scales.map((s) => {
    const pct = count[s] ? Math.round((((sum[s] / count[s]) - 1) / 4) * 100) : 0;
    return { scale: s, score: clamp(pct, 0, 100) };
  });

  const byScale = Object.fromEntries(motivationScores.map((m) => [m.scale, m.score]));
  const intrinsic = byScale.Intrinsic ?? 0;
  const extrinsic = byScale.Extrinsic ?? 0;
  const gap = intrinsic - extrinsic; // positive = more passion-driven
  const dominantDriver = gap >= 0 ? "intrinsic" : "extrinsic";
  // "large gap" = extrinsic substantially exceeds intrinsic → reflection prompt
  const extrinsicFlag = extrinsic - intrinsic >= 25;

  const sorted = [...motivationScores].sort((a, b) => b.score - a.score);

  return {
    motivationScores,
    topMotivations: sorted.slice(0, 3).map((m) => m.scale),
    intrinsic,
    extrinsic,
    intrinsicExtrinsicGap: gap,
    dominantDriver,
    extrinsicFlag, // counsellor-facing; reported neutrally to the student
  };
}

/* -------------------------------------------------------------------------
   WORK ENVIRONMENT — Module E. Produces a filter profile (not scored).
   sectorById: { [id]: "A"|"B" }; styleById: { [id]: 1..5 }
   ------------------------------------------------------------------------- */
function scoreEnvironment(sectorById = {}, styleById = {}) {
  // sector / location preferences from FC pairs
  const sectorPrefs = {};
  for (const pair of Q.ENV_SECTOR_FC) {
    const sel = sectorById[pair.id];
    if (!sel) continue;
    const chosen = sel === "A" ? pair.optionA.key : pair.optionB.key;
    sectorPrefs[pair.id] = chosen;
  }

  // bipolar work-style 1..5 → 0..10 modulators (left=0, right=10)
  const style = {};
  for (const item of Q.WORK_STYLE) {
    const v = Number(styleById[item.id]);
    if (!v) continue;
    style[item.maps] = Math.round(((v - 1) / 4) * 10);
  }

  // derive headline filter fields used by the recommendation engine
  const filter = {
    sector: sectorPrefs.ENV1 || null,        // GovtSector | PrivateSector
    ownership: sectorPrefs.ENV2 || null,     // Startup | FamilyBusiness
    impactMode: sectorPrefs.ENV3 || null,    // SocialSector | Independent
    setting: sectorPrefs.ENV4 || null,       // OfficeWork | FieldWork
    location: sectorPrefs.ENV5 || null,      // Metro | Tier2Rural
    teamworkPref: style.teamwork ?? null,    // 0 independent → 10 team
    travelPref: style.travel ?? null,        // 0 stable → 10 frequent travel
    wfhPref: style.wfh ?? null,              // 0 office → 10 remote
    leadershipPref: style.leadership ?? null,
    structurePref: style.structure ?? null,
    specialistPref: style.specialistVsGeneralist ?? null,
  };

  return { sectorPrefs, style, filter };
}

/* -------------------------------------------------------------------------
   SJT — Module F. Competency points from Most-Likely / Least-Likely picks.
   sjtById: { [scenarioId]: { mostLikely, leastLikely } }
   MO = +2 weight on chosen option's moPoints; +1 for spotting a poor option.
   ------------------------------------------------------------------------- */
function scoreSjt(sjtById = {}) {
  let total = 0; let maxTotal = 0;
  const competencyPoints = {};
  const breakdown = [];

  for (const sc of Q.SJT_T2) {
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
      const quality = moOpt.moPoints;
      for (const comp of sc.competencies) {
        competencyPoints[comp] = (competencyPoints[comp] || 0) + quality;
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
   TEST-2 CAREER FIT SUMMARY — preliminary index until CCRE combines Test 1.
   Blends interest clarity (RIASEC spread), values clarity and motivation
   alignment into a single 0..100 "self-knowledge / fit readiness" figure.
   ------------------------------------------------------------------------- */
function computeT2Summary({ riasec, workValues, motivations }) {
  // interest clarity: how strongly the top type stands out (0..100)
  const sortedTypes = [...(riasec?.scores || [])].sort((a, b) => b.combined - a.combined);
  const topType = sortedTypes[0]?.combined ?? 0;
  const interestPillar = Math.round(topType);

  // values clarity: average of top-3 value scores
  const topVals = (workValues?.ranked || []).slice(0, 3);
  const valuesPillar = topVals.length
    ? Math.round(topVals.reduce((s, v) => s + v.score, 0) / topVals.length)
    : 0;

  // motivation alignment: intrinsic-led profiles score higher on "sustainable fit"
  const intrinsic = motivations?.intrinsic ?? 0;
  const motivationPillar = clamp(Math.round(intrinsic), 0, 100);

  const overall = Math.round(interestPillar * 0.45 + valuesPillar * 0.3 + motivationPillar * 0.25);

  return {
    overall: clamp(overall, 0, 100),
    pillars: {
      interests: clamp(interestPillar, 0, 100),
      values: clamp(valuesPillar, 0, 100),
      motivation: clamp(motivationPillar, 0, 100),
    },
    preliminary: true, // becomes "Full Combined" once Test 1 data is merged in CCRE
  };
}

module.exports = {
  scoreRiasec,
  scoreWorkValues,
  scoreMotivations,
  scoreEnvironment,
  scoreSjt,
  computeT2Summary,
  tScoreZone,
  round1,
};
