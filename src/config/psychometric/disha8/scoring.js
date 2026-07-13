/**
 * DISHA Test 8 scoring engine — Long-term Life Values, Work-Life Balance,
 * Lifestyle Goals & Career Satisfaction Predictors (Capstone).
 *
 *  - Section A → Life Values Profile: 10 dimension T-scores + the student's
 *    self-ranked top-5 priority list (the primary CCRE moderator per §11.1).
 *  - Section B → WLB Index: High-Intensity vs Balance orientation +
 *    Family-Career Integration score, plus the 4 trade-off FC votes.
 *  - Section C → Lifestyle Profile: geographic preference, income aspiration,
 *    family structure preference, international mobility. Open-ended LD
 *    items are passed through verbatim for counsellor use (never scored).
 *  - Section D → Money Profile: Money-Security-Index vs Money-Growth
 *    orientation + Family Financial Responsibility weight.
 *  - Section E → Purpose Orientation Score: Seva vs PersonalSuccess vs
 *    Integration — explicitly NOT a virtue hierarchy (§6 note).
 *  - Section F → Satisfaction Prediction Index (SPI): Intrinsic/Growth/
 *    Autonomy/Purpose need strengths — used as a MODERATOR, not an additive
 *    score (§7 note).
 *  - Section G → Life Design Vision: quantitative slider profile + GP-5
 *    (the Non-Negotiable) passed through UNSUMMARISED, exactly as the source
 *    document requires ("NEVER summarised algorithmically — requires human
 *    reading and interpretation").
 *  - Section H → SJT values-alignment score: each response is scored against
 *    the student's OWN top-ranked values (not a universal competency key),
 *    exactly as the source document's per-scenario scoring notes specify.
 *  - Validity: 5 LikeMe SD items + the 5 values-consistency cross-checks
 *    from §10.2 (tension pairs, not necessarily "inconsistent" — flagged as
 *    "worth a counsellor conversation").
 *  - Career Regret Risk (§14): only the T8-computable risk factor (Lifestyle
 *    Mismatch — WLB preference vs High-Intensity self-endorsement) is scored
 *    here. Cross-test factors (Hidden Interest Suppression, Decision
 *    Autonomy Deficit, Values–Career Misalignment against a live career
 *    database) require Master Report integration across Tests 1/2/5 and an
 *    external career database that does not exist in this codebase — see the
 *    file header in questions.js for the documented scope decision.
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
   SECTION A — Life Values Profile (10 dimensions) + priority ranking.
   ------------------------------------------------------------------------- */
const VALUE_DIMS = ["Family", "Achievement", "Security", "Autonomy", "Seva", "Status", "Adventure", "Spirituality", "Intellectual", "Dharma"];

function scoreLifeValues(responsesById = {}, ranking = {}) {
  const dims = {};
  for (const d of VALUE_DIMS) {
    const { m } = scaleMean(Q.LIFE_VALUES, responsesById, d);
    dims[d] = { mean: round1(m), tScore: meanToT(m), pct: m ? pct1to5(m) : 0 };
  }

  // ranking: { Family: 1, Seva: 2, ... } (1 = most important), up to 5 ranked.
  const rankedEntries = Object.entries(ranking)
    .filter(([, rank]) => rank >= 1 && rank <= 5)
    .sort((a, b) => a[1] - b[1]);
  const top5Ranked = rankedEntries.map(([key]) => key);

  // If ranking incomplete, fall back to Likert-derived top 5.
  const likertRanked = [...VALUE_DIMS].sort((a, b) => dims[b].mean - dims[a].mean);
  const top5 = top5Ranked.length === 5 ? top5Ranked : likertRanked.slice(0, 5);
  const top3 = top5.slice(0, 3);

  return { dims, top5, top3, rankingProvided: top5Ranked.length === 5 };
}

/* -------------------------------------------------------------------------
   SECTION B — WLB Index.
   ------------------------------------------------------------------------- */
function scoreWlb(responsesById = {}, fcById = {}) {
  const scales = ["FamilyTime", "Parenting", "ElderCare", "TravelComfort", "Relocation", "Recovery", "Balance", "Boundaries"];
  const sub = {};
  for (const s of scales) {
    const { m } = scaleMean(Q.WLB_PREFERENCES, responsesById, s);
    sub[s] = m ? round1(m) : null;
  }
  // HighIntensity blended with reverse HighIntensity_R.
  const hi = scaleMean(Q.WLB_PREFERENCES, responsesById, "HighIntensity");
  const hiRev = scaleMean(Q.WLB_PREFERENCES, responsesById, "HighIntensity_R");
  const highIntensityT = meanToT(mean([hi.m, hiRev.m].filter(Boolean)));
  const balanceT = meanToT(scaleMean(Q.WLB_PREFERENCES, responsesById, "Balance").m);

  const orientation = highIntensityT > balanceT + 5 ? "HighIntensity" : balanceT > highIntensityT + 5 ? "Balance" : "Mixed";

  // Family-Career Integration score: mean of FamilyTime/Parenting/ElderCare.
  const familyVals = ["FamilyTime", "Parenting", "ElderCare"].map((s) => sub[s]).filter(Boolean);
  const familyCareerIntegrationT = meanToT(mean(familyVals));

  const fcVotes = {};
  for (const pair of Q.WLB_FC) {
    const sel = fcById[pair.id];
    if (!sel) continue;
    const key = sel === "A" ? pair.optionA.key : pair.optionB.key;
    fcVotes[key] = (fcVotes[key] || 0) + 1;
  }

  return { subScales: sub, highIntensityT, balanceT, orientation, familyCareerIntegrationT, fcVotes };
}

/* -------------------------------------------------------------------------
   SECTION C — Lifestyle Profile.
   ------------------------------------------------------------------------- */
function scoreLifestyle(responsesById = {}, openResponses = {}) {
  const geo = ["Metro", "Tier2", "International", "HomeState"].map((s) => ({
    key: s, pct: pct1to5(scaleMean(Q.LIFESTYLE_GOALS, responsesById, s).m || 0),
  })).sort((a, b) => b.pct - a.pct);

  const family = ["JointFam", "NuclearFam"].map((s) => ({
    key: s, pct: pct1to5(scaleMean(Q.LIFESTYLE_GOALS, responsesById, s).m || 0),
  })).sort((a, b) => b.pct - a.pct);

  const income = {
    incomeGoalT: meanToT(scaleMean(Q.LIFESTYLE_GOALS, responsesById, "IncomeGoal").m),
    sufficiencyT: meanToT(scaleMean(Q.LIFESTYLE_GOALS, responsesById, "Sufficiency").m),
    finIndependT: meanToT(scaleMean(Q.LIFESTYLE_GOALS, responsesById, "FinIndepend").m),
  };

  const intlMobilityT = meanToT(scaleMean(Q.LIFESTYLE_GOALS, responsesById, "IntlMobility").m);
  const careerFlexT = meanToT(scaleMean(Q.LIFESTYLE_GOALS, responsesById, "CareerFlex").m);
  const healthFirstT = meanToT(scaleMean(Q.LIFESTYLE_GOALS, responsesById, "HealthFirst").m);
  const simplicityT = meanToT(scaleMean(Q.LIFESTYLE_GOALS, responsesById, "Simplicity").m);

  // Open-ended LD items: passed through verbatim, never scored — counsellor use only.
  const openDesignResponses = Q.LIFE_DESIGN_OPEN.map((q) => ({
    id: q.id, question: q.question, response: openResponses[q.id] || null,
  }));

  return {
    topGeoPreference: geo[0]?.pct > 0 ? geo[0].key : null,
    geoBreakdown: geo,
    familyStructurePreference: family[0]?.pct > 0 ? family[0].key : null,
    income,
    intlMobilityT,
    careerFlexT,
    healthFirstT,
    simplicityT,
    openDesignResponses,
  };
}

/* -------------------------------------------------------------------------
   SECTION D — Money Profile.
   ------------------------------------------------------------------------- */
function scoreMoney(responsesById = {}, fcById = {}) {
  const moneySecurityT = meanToT(scaleMean(Q.MONEY_MINDSET, responsesById, "MoneySecurity").m);
  const moneyGrowthT = meanToT(scaleMean(Q.MONEY_MINDSET, responsesById, "MoneyGrowth").m);
  const orientation = moneySecurityT > moneyGrowthT + 5 ? "Security" : moneyGrowthT > moneySecurityT + 5 ? "Growth" : "Balanced";

  const familyFinRespT = meanToT(scaleMean(Q.MONEY_MINDSET, responsesById, "FamilyFinResp").m);
  const debtComfortT = meanToT(scaleMean(Q.MONEY_MINDSET, responsesById, "DebtComfort").m);
  const wealthAmbitionT = meanToT(scaleMean(Q.MONEY_MINDSET, responsesById, "WealthAmbition").m);
  const sufficiencyT = meanToT(scaleMean(Q.MONEY_MINDSET, responsesById, "MoneySufficiency").m);

  const fcVotes = {};
  for (const pair of Q.MONEY_FC) {
    const sel = fcById[pair.id];
    if (!sel) continue;
    const key = sel === "A" ? pair.optionA.key : pair.optionB.key;
    fcVotes[key] = (fcVotes[key] || 0) + 1;
  }

  return { moneySecurityT, moneyGrowthT, orientation, familyFinRespT, debtComfortT, wealthAmbitionT, sufficiencyT, fcVotes };
}

/* -------------------------------------------------------------------------
   SECTION E — Purpose Orientation (Seva vs PersonalSuccess vs Integration).
   Explicitly NOT a virtue hierarchy — all three profiles equally legitimate.
   ------------------------------------------------------------------------- */
function scorePurpose(responsesById = {}) {
  const sevaT = meanToT(scaleMean(Q.SOCIAL_CONTRIBUTION, responsesById, "Seva").m);
  const personalSuccessT = meanToT(scaleMean(Q.SOCIAL_CONTRIBUTION, responsesById, "PersonalSuccess").m);
  const integrationT = meanToT(scaleMean(Q.SOCIAL_CONTRIBUTION, responsesById, "Integration").m);
  const authenticSevaT = meanToT(scaleMean(Q.SOCIAL_CONTRIBUTION, responsesById, "AuthenticSeva").m);
  const statusMaterialismT = meanToT(scaleMean(Q.SOCIAL_CONTRIBUTION, responsesById, "StatusMaterialism").m);

  let profile = "Balanced";
  if (integrationT >= 58 && sevaT >= 52 && personalSuccessT >= 52) {
    profile = "Integration"; // highest social value, rarest — both Seva & Success high
  } else if (sevaT >= 58 && sevaT > personalSuccessT + 8) {
    profile = "Seva-Oriented";
  } else if (personalSuccessT >= 58 && personalSuccessT > sevaT + 8) {
    profile = "Personal-Success-Oriented";
  }

  return { sevaT, personalSuccessT, integrationT, authenticSevaT, statusMaterialismT, profile };
}

/* -------------------------------------------------------------------------
   SECTION F — Satisfaction Prediction Index (SPI). Used as a MODERATOR.
   ------------------------------------------------------------------------- */
function scoreSpi(responsesById = {}) {
  const intrinsicNeedT = meanToT(scaleMean(Q.SATISFACTION_PREDICTORS, responsesById, "IntrinsicNeed").m);

  const growth = scaleMean(Q.SATISFACTION_PREDICTORS, responsesById, "GrowthNeed");
  const growthRev = scaleMean(Q.SATISFACTION_PREDICTORS, responsesById, "GrowthNeed_R");
  const growthNeedT = meanToT(mean([growth.m, growthRev.m].filter(Boolean)));

  const autonomy = scaleMean(Q.SATISFACTION_PREDICTORS, responsesById, "AutonomyNeed");
  const autonomyRev = scaleMean(Q.SATISFACTION_PREDICTORS, responsesById, "AutonomyNeed_R");
  const autonomyNeedT = meanToT(mean([autonomy.m, autonomyRev.m].filter(Boolean)));

  const relatedness = scaleMean(Q.SATISFACTION_PREDICTORS, responsesById, "RelatednessNeed");
  const relatednessRev = scaleMean(Q.SATISFACTION_PREDICTORS, responsesById, "RelatednessNeed_R");
  const relatednessNeedT = meanToT(mean([relatedness.m, relatednessRev.m].filter(Boolean)));

  const purposeNeedT = meanToT(scaleMean(Q.SATISFACTION_PREDICTORS, responsesById, "PurposeNeed").m);
  const selfKnowledgeT = meanToT(scaleMean(Q.SATISFACTION_PREDICTORS, responsesById, "SelfKnowledge").m);
  const satisfactionHistoryT = meanToT(scaleMean(Q.SATISFACTION_PREDICTORS, responsesById, "SatisfactionHistory").m);

  const needs = { IntrinsicNeed: intrinsicNeedT, GrowthNeed: growthNeedT, AutonomyNeed: autonomyNeedT, RelatednessNeed: relatednessNeedT, PurposeNeed: purposeNeedT };
  const top3Needs = Object.entries(needs).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);

  const spiComposite = clampT(mean(Object.values(needs)));

  return { ...needs, selfKnowledgeT, satisfactionHistoryT, top3Needs, spiComposite };
}

/* -------------------------------------------------------------------------
   SECTION G — Future Life Projection (quantitative slider profile) + GP-5.
   sliderResponses: { [elementId]: index into the element's spectrum array }.
   GP5 text is passed through completely unsummarised, per source doc.
   ------------------------------------------------------------------------- */
function scoreFutureProjection(sliderResponses = {}, gp5Responses = {}) {
  const scenarios = Q.FUTURE_PROJECTION.map((scenario) => ({
    id: scenario.id,
    title: scenario.title,
    elements: scenario.elements.map((el) => {
      const idx = sliderResponses[el.id];
      return {
        id: el.id,
        label: el.label,
        selectedIndex: idx !== undefined ? idx : null,
        selectedLabel: idx !== undefined && el.spectrum[idx] !== undefined ? el.spectrum[idx] : null,
      };
    }),
  }));

  return {
    scenarios,
    nonNegotiable: {
      goodLife: gp5Responses.GP5_good || null,
      wastedLife: gp5Responses.GP5_wasted || null,
    },
    // Explicit acknowledgement this is qualitative, per source doc §8 note.
    algorithmicSummary: false,
  };
}

/* -------------------------------------------------------------------------
   SECTION H — SJT values-alignment scoring (scored against the student's OWN
   top-5 values, not a universal competency key).
   sjtById: { [scenarioId]: { mostLikely: "A".."D" } } — MO only; the source
   document's SJT-T8 items are single-select "most aligned" style items
   (no LO column used in scoring per the per-item notes), so only mostLikely
   is scored here.
   ------------------------------------------------------------------------- */
function scoreSjtValuesAlignment(sjtById = {}, top5Values = []) {
  const top5Set = new Set(top5Values);
  let totalAlignment = 0;
  let scoredCount = 0;
  const breakdown = [];

  for (const sc of Q.SJT_H) {
    if (sc.notScored) {
      const pick = sjtById[sc.id] || {};
      breakdown.push({ id: sc.id, mostLikely: pick.mostLikely || null, notScored: true });
      continue;
    }
    const pick = sjtById[sc.id] || {};
    const opt = sc.options.find((o) => o.key === pick.mostLikely);
    let alignment = 0;
    if (opt && opt.bestFor) {
      const overlap = opt.bestFor.filter((v) => top5Set.has(v)).length;
      alignment = overlap > 0 ? clamp(overlap / Math.min(3, opt.bestFor.length), 0, 1) : 0.2; // baseline for any answer
      totalAlignment += alignment;
      scoredCount += 1;
    }
    breakdown.push({ id: sc.id, mostLikely: pick.mostLikely || null, alignment: round1(alignment) });
  }

  const alignmentPct = scoredCount ? Math.round((totalAlignment / scoredCount) * 100) : 0;
  const futureSelfReflection = (sjtById["SJT_T8_H10"] || {}).mostLikely || null;

  // "Billion-Rupee Regret" flag (H9): selecting C/B despite high-MoneyGrowth
  // top values is a career-regret risk signal per the scenario's own note.
  const h9Pick = (sjtById["SJT_T8_H9"] || {}).mostLikely;
  const regretSignalH9 = h9Pick === "B" || h9Pick === "C";

  return { alignmentPct, breakdown, futureSelfReflection, regretSignalH9 };
}

/* -------------------------------------------------------------------------
   VALIDITY — LikeMe SD + values-consistency cross-checks (§10.1 / §10.2).
   ------------------------------------------------------------------------- */
function scoreValidity(validityById = {}, responsesById = {}) {
  const likeVals = Q.VALIDITY.map((i) => Number(validityById[i.id])).filter(Boolean);
  const likeMeT = meanToT(mean(likeVals));
  const socialDesirabilityFlag = likeMeT > 65;

  const raw = (id) => Number(responsesById[id]) || 0;
  const tensions = [];

  // High Security + High Adventure.
  if (raw("A5") >= 4 && raw("A13") >= 4) tensions.push({ pattern: "HighSecurity_HighAdventure", note: "You value both stability and novelty strongly — this is a real tension. Explore whether these compete at a personality level, or whether a career genuinely delivers both (e.g. international government service, development-sector fieldwork)." });
  // High Family Time + High Achievement (WLB item B4 + Achievement A3/A4).
  if (raw("B4") >= 4 && raw("B1") >= 4) tensions.push({ pattern: "HighFamilyTime_HighIntensity", note: "You want both intensive career achievement AND significant family presence. This tension is very common and very real. The report includes careers that best resolve it, but the trade-off requires an honest conversation." });
  // High Seva + High Status.
  if (raw("A9") >= 4 && raw("A11") >= 4) tensions.push({ pattern: "HighSeva_HighStatus", note: "Wanting to contribute to society AND wanting social recognition is not contradictory — many IAS officers, NGO leaders, and social entrepreneurs satisfy both. The report highlights these specifically." });
  // High Autonomy + High Security.
  if (raw("A7") >= 4 && raw("A5") >= 4) tensions.push({ pattern: "HighAutonomy_HighSecurity", note: "Autonomy and security are genuinely in tension. Careers that offer both (senior government consulting, independent practice in law or medicine, academic tenure) are flagged specifically." });
  // High Dharma + High FlatPref-equivalent (using JointFam vs independence proxy: Dharma high + Autonomy high).
  if (raw("A19") >= 4 && raw("A7") >= 4) tensions.push({ pattern: "HighDharma_HighAutonomy", note: "You value family duty deeply but also value personal freedom — this combination appears in people drawn to family businesses and social enterprises, where relationships are central but structures are flexible." });

  return {
    likeMeT,
    socialDesirabilityFlag,
    tensions,
    tensionCount: tensions.length,
    clean: !socialDesirabilityFlag,
    idealisationNote: socialDesirabilityFlag
      ? "Life values may be idealised rather than authentic. The open-ended items (LD questions and GP-5) are more reliable than the Likert scales for this student. Focus counselling on the narrative responses."
      : null,
  };
}

/* -------------------------------------------------------------------------
   CAREER REGRET RISK (T8-computable factors only — see file header).
   ------------------------------------------------------------------------- */
function computeRegretRiskFactors({ wlb, sjtAlignment, moneyProfile, purpose }) {
  const factors = [];

  // Lifestyle Mismatch — WLB: student endorses Balance strongly but also
  // strongly endorses HighIntensity items (internal contradiction / unclear
  // preference — worth exploring before committing to a high-intensity path).
  if (wlb.orientation === "Mixed" && wlb.highIntensityT >= 55 && wlb.balanceT >= 55) {
    factors.push({ factor: "LifestyleMismatch_WLB", note: "Your work-intensity preferences are not yet clearly resolved — you show real pull toward both high-intensity achievement and strong work-life balance. This is worth exploring before committing to a demanding career path." });
  }

  // Billion-Rupee Regret signal from H9.
  if (sjtAlignment.regretSignalH9 && (moneyProfile.orientation === "Growth" || moneyProfile.wealthAmbitionT >= 58)) {
    factors.push({ factor: "MoneyVsSatisfactionMismatch", note: "You show strong wealth ambition today, but your imagined 50-year-old self expressed some regret about a purely wealth-focused path. This gap is worth a direct conversation." });
  }

  // Seva-oriented but Personal-Success profile still shows Integration gap.
  if (purpose.profile === "Seva-Oriented" && moneyProfile.wealthAmbitionT >= 58) {
    factors.push({ factor: "PurposeVsWealthTension", note: "You have a strong service orientation alongside real wealth ambition. Careers combining both (social entrepreneurship, impact investing, development finance) deserve specific attention." });
  }

  const level = factors.length >= 3 ? "Elevated" : factors.length >= 1 ? "Moderate" : "Low";
  return { factors, level };
}

/* -------------------------------------------------------------------------
   SUMMARY
   ------------------------------------------------------------------------- */
function computeSummary({ lifeValues, wlb, purpose, spi, moneyProfile, regretRisk }) {
  return {
    top5Values: lifeValues.top5,
    top3Values: lifeValues.top3,
    wlbOrientation: wlb.orientation,
    purposeProfile: purpose.profile,
    moneyOrientation: moneyProfile.orientation,
    top3SpiNeeds: spi.top3Needs,
    regretRiskLevel: regretRisk.level,
    preliminary: true,
  };
}

module.exports = {
  scoreLifeValues,
  scoreWlb,
  scoreLifestyle,
  scoreMoney,
  scorePurpose,
  scoreSpi,
  scoreFutureProjection,
  scoreSjtValuesAlignment,
  scoreValidity,
  computeRegretRiskFactors,
  computeSummary,
};
