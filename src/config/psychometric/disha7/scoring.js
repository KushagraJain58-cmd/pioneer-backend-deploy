/**
 * DISHA Test 7 scoring engine — Leadership Potential, Management Aptitude,
 * Teamwork Skills & Organisational Fit.
 *
 *  - Section A → Leadership Potential Index (LPI): a weighted composite of
 *    Vision&Influence (30%), Decision-Making under pressure (20%),
 *    Motivation-of-Others (20%), Management aptitude (Section B, 15%) and
 *    Ethical Leadership (Section E, 15%). Banded per §12.2.
 *  - Section B → Management Aptitude (Planning/Delegation/Coordination/Execution).
 *  - Section C → Belbin-adapted Team Role profile (8 roles), from Likert scales
 *    + the 4 FC role-preference pairs. Primary/secondary role.
 *  - Section D → Power Orientation profile (§5.1): PowerDrive / HierarchyComfort
 *    / FlatPref / EthicalPower → one of 5 profile categories.
 *  - Section E → Ethical Leadership Index. Operates as a THRESHOLD for public-
 *    sector careers (§13.2): T≥60 full, 48–59 partial + note, <48 no-boost +
 *    counsellor alert. ethicsThresholdFlag = Ethical T≥48.
 *  - Section F → Organisational Fit profile: 5 archetypes (Corporate / Govt /
 *    Startup / NGO / FamilyBiz) ranked with fit percentages, from Likert +
 *    4 org-culture FC pairs.
 *  - Section G → 12 FC leadership preferences; G1 (lead vs follow) and G6
 *    (hierarchy vs flat) exported as fundamental-orientation signals.
 *  - Sections H+I → SJT MO/LO leadership judgment score + competency tally.
 *  - Leadership Style (§12.3): one of 6 styles from the A/B/C/D/E/G pattern.
 *  - Critical flag (§13.2 / §14.2): High PowerDrive + Low Ethics → counsellor
 *    urgent note; career recommendations de-emphasise authority-heavy roles.
 *  - Validity: 6 LikeMe SD items + RII cross-item consistency checks (§11.2).
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

// Scale mean honouring reverse flags (for trait scoring).
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

// Mean over an explicit list of item IDs (reverse-aware via a lookup map).
function idsMean(itemMap, responsesById, ids) {
  const vals = [];
  for (const id of ids) {
    const item = itemMap[id];
    const raw = Number(responsesById[id]);
    if (!item || !raw) continue;
    vals.push(item.reverse ? 6 - raw : raw);
  }
  return mean(vals);
}

function buildItemMap(items) {
  const map = {};
  for (const i of items) map[i.id] = i;
  return map;
}

/* -------------------------------------------------------------------------
   SECTION A — Leadership sub-components (excluding management/ethics, which
   come from B and E and are folded into the LPI composite separately).
   ------------------------------------------------------------------------- */
function scoreLeadershipPotential(responsesById = {}) {
  const scales = ["Vision", "Influence", "DecisionMaking", "MotivOthers"];
  const sub = {};
  for (const s of scales) {
    const { m } = scaleMean(Q.LEADERSHIP_POTENTIAL, responsesById, s);
    sub[s] = { mean: round1(m), tScore: meanToT(m), pct: m ? pct1to5(m) : 0 };
  }
  // Leadership_R (reverse) — high => individual-contributor preference (NOT a deficit).
  const followPref = scaleMean(Q.LEADERSHIP_POTENTIAL, responsesById, "Leadership_R");
  // note: scaleMean already reverses, so a high mean here = high leadership orientation.
  const individualContributorLean = followPref.m > 0 && followPref.m < 2.5;

  const visionInfluenceT = clampT((sub.Vision.tScore + sub.Influence.tScore) / 2);
  return {
    subScales: sub,
    visionInfluenceT,
    decisionMakingT: sub.DecisionMaking.tScore,
    motivOthersT: sub.MotivOthers.tScore,
    individualContributorLean,
  };
}

/* -------------------------------------------------------------------------
   SECTION B — Management Aptitude.
   ------------------------------------------------------------------------- */
function scoreManagement(responsesById = {}) {
  const scales = ["Planning", "Delegation", "Coordination", "Execution"];
  const sub = {};
  for (const s of scales) {
    const { m } = scaleMean(Q.MANAGEMENT_SKILLS, responsesById, s);
    sub[s] = { mean: round1(m), pct: m ? pct1to5(m) : 0 };
  }
  // Management_R (reverse) already reversed in scaleMean; include in composite.
  const posItems = Q.MANAGEMENT_SKILLS.filter((i) => i.scale !== "Management_R");
  const revItems = Q.MANAGEMENT_SKILLS.filter((i) => i.scale === "Management_R");
  const allVals = [
    ...posItems.map((i) => Number(responsesById[i.id])).filter(Boolean),
    ...revItems.map((i) => { const r = Number(responsesById[i.id]); return r ? 6 - r : 0; }).filter(Boolean),
  ];
  const managementT = meanToT(mean(allVals));
  return { subScales: sub, managementT };
}

/* -------------------------------------------------------------------------
   SECTION C — Belbin-adapted Team Role profile.
   ------------------------------------------------------------------------- */
const ALL_ROLES = ["Coordinator", "Implementer", "Shaper", "MonitorEvaluator", "Teamworker", "ResourceInvestigator", "Plant", "Specialist"];

function scoreTeamwork(responsesById = {}, fcById = {}) {
  const { m: teamworkMean } = scaleMean(Q.TEAMWORK, responsesById, "Teamwork");
  const teamworkOrientationT = meanToT(teamworkMean);

  // Role scores: start from Likert role items (0..5 each averaged), then add FC votes.
  const roleScore = {};
  for (const r of ALL_ROLES) roleScore[r] = 0;

  for (const item of Q.TEAMWORK) {
    if (!item.role) continue;
    const raw = Number(responsesById[item.id]);
    if (!raw) continue;
    roleScore[item.role] = (roleScore[item.role] || 0) + raw;
  }
  // FC votes (each option can map to multiple roles) — weight ~ one strong-agree.
  for (const pair of Q.TEAMWORK_FC) {
    const sel = fcById[pair.id];
    if (!sel) continue;
    const opt = sel === "A" ? pair.optionA : pair.optionB;
    for (const r of (opt.roles || [])) roleScore[r] = (roleScore[r] || 0) + 4;
  }

  const ranked = ALL_ROLES.map((r) => ({ role: r, score: roleScore[r] || 0 }))
    .sort((a, b) => b.score - a.score);

  // Individual-preference reverse scale: high => weak team orientation.
  const indPref = scaleMean(Q.TEAMWORK, responsesById, "IndividualPref_R");
  const individualPreference = indPref.m > 0 && indPref.m < 2.5; // reversed: low mean = strong individual pref

  return {
    teamworkOrientationT,
    roleScores: ranked,
    primaryRole: ranked[0]?.score > 0 ? ranked[0].role : null,
    secondaryRole: ranked[1]?.score > 0 ? ranked[1].role : null,
    individualPreference,
  };
}

/* -------------------------------------------------------------------------
   SECTION D — Power Orientation profile (§5.1).
   ------------------------------------------------------------------------- */
function scorePowerOrientation(responsesById = {}, teamwork) {
  const scales = ["PowerDrive", "HierarchyComfort", "FlatPref", "EthicalPower", "Assertiveness"];
  const sub = {};
  for (const s of scales) {
    const { m } = scaleMean(Q.POWER_ORIENTATION, responsesById, s);
    sub[s] = { mean: round1(m), tScore: meanToT(m) };
  }
  // PowerDrive_R (reverse) blended into the PowerDrive read.
  const pdRev = scaleMean(Q.POWER_ORIENTATION, responsesById, "PowerDrive_R");
  const powerDriveT = clampT((sub.PowerDrive.tScore + meanToT(pdRev.m)) / 2);

  const pd = powerDriveT;
  const hc = sub.HierarchyComfort.tScore;
  const fp = sub.FlatPref.tScore;
  const teamworkT = teamwork?.teamworkOrientationT || 50;

  // Profile categories, checked in priority order (§5.1).
  let profile = "Institutional Leader";
  if (pd >= 55 && fp >= 55 && hc < 48) {
    profile = "Entrepreneurial Leader";
  } else if (pd >= 55 && hc >= 48 && hc <= 60) {
    profile = "High Authority Leader";
  } else if (pd >= 48 && pd < 58 && hc >= 55) {
    profile = "Institutional Leader";
  } else if (pd >= 45 && pd < 58 && teamworkT >= 58) {
    profile = "Collaborative Leader";
  } else if (pd < 45 && hc < 50) {
    profile = "Expert Contributor";
  }

  return { subScales: sub, powerDriveT, hierarchyComfortT: hc, flatPrefT: fp, profile };
}

/* -------------------------------------------------------------------------
   SECTION E — Ethical Leadership Index + public-sector threshold (§13.2).
   ------------------------------------------------------------------------- */
function scoreEthicalLeadership(responsesById = {}) {
  const scales = ["Integrity", "Accountability", "ServiceOrient", "SocialResponsibility", "MoralCourage"];
  const sub = {};
  for (const s of scales) {
    const { m } = scaleMean(Q.ETHICAL_LEADERSHIP, responsesById, s);
    sub[s] = { mean: round1(m), pct: m ? pct1to5(m) : 0 };
  }
  // Whole-index T (Integrity_R reverse-scored, IndiaEthics included).
  const vals = Q.ETHICAL_LEADERSHIP.map((i) => {
    const raw = Number(responsesById[i.id]);
    if (!raw) return null;
    return i.reverse ? 6 - raw : raw;
  }).filter((v) => v !== null);
  const ethicalT = meanToT(mean(vals));

  const socialResponsibilityT = meanToT(scaleMean(Q.ETHICAL_LEADERSHIP, responsesById, "SocialResponsibility").m);

  // Public-sector threshold band.
  let civilServiceBand = "Low";
  if (ethicalT >= 60) civilServiceBand = "High";
  else if (ethicalT >= 48) civilServiceBand = "Moderate";
  const ethicsThresholdFlag = ethicalT >= 48; // false => civil-service recommendation capped

  // 'Moral pragmatism' probe (E13): high raw agreement is the signal (pre-reverse).
  const e13 = Number(responsesById["E13"]) || 0;
  const moralPragmatismProbe = e13 >= 4;

  return { subScales: sub, ethicalT, socialResponsibilityT, civilServiceBand, ethicsThresholdFlag, moralPragmatismProbe };
}

/* -------------------------------------------------------------------------
   SECTION F — Organisational Fit profile.
   ------------------------------------------------------------------------- */
function scoreWorkCulture(responsesById = {}, fcById = {}) {
  const archetypes = ["Corporate", "Govt", "Startup", "NGO", "FamilyBiz"];
  const base = {};
  for (const a of archetypes) {
    const { m } = scaleMean(Q.WORK_CULTURE, responsesById, a);
    base[a] = m; // 1..5 mean
  }
  // FC votes nudge fit (each vote ~ +0.4 on the 1..5 scale, capped at 5).
  const fcVotes = {};
  for (const pair of Q.WORK_CULTURE_FC) {
    const sel = fcById[pair.id];
    if (!sel) continue;
    const key = sel === "A" ? pair.optionA.key : pair.optionB.key;
    fcVotes[key] = (fcVotes[key] || 0) + 1;
  }
  const fit = archetypes.map((a) => {
    const nudged = clamp((base[a] || 0) + (fcVotes[a] || 0) * 0.4, 0, 5);
    return { archetype: a, pct: base[a] ? clamp(pct1to5(nudged), 0, 100) : 0 };
  }).sort((a, b) => b.pct - a.pct);

  const dynamic = scaleMean(Q.WORK_CULTURE, responsesById, "Dynamic").m;
  const stable = scaleMean(Q.WORK_CULTURE, responsesById, "Stable").m;
  const stabilityOrientation = stable > dynamic ? "Stable" : dynamic > stable ? "Dynamic" : "Balanced";

  return {
    fit,
    topFit: fit[0]?.pct > 0 ? fit[0].archetype : null,
    stabilityOrientation,
    fcVotes,
  };
}

/* -------------------------------------------------------------------------
   SECTION G — 12 FC leadership preferences → tally + key signals.
   ------------------------------------------------------------------------- */
function scoreLeadershipFc(fcById = {}) {
  const tally = {};
  for (const pair of Q.LEADERSHIP_FC) {
    const sel = fcById[pair.id];
    if (!sel) continue;
    const key = sel === "A" ? pair.optionA.key : pair.optionB.key;
    tally[key] = (tally[key] || 0) + 1;
  }
  const leadVsFollow = fcById["G1"] === "A" ? "Lead" : fcById["G1"] === "B" ? "Follow" : "Balanced";
  const hierarchyVsFlat = fcById["G6"] === "A" ? "Hierarchy" : fcById["G6"] === "B" ? "Flat" : "Balanced";
  const resultsVsPeople = fcById["G12"] === "A" ? "Results" : fcById["G12"] === "B" ? "People" : "Balanced";
  return { tally, leadVsFollow, hierarchyVsFlat, resultsVsPeople };
}

/* -------------------------------------------------------------------------
   SJT (Blocks H + I) — MO/LO leadership judgment.
   ------------------------------------------------------------------------- */
function scoreSjt(sjtById = {}) {
  const all = [...Q.SJT_H, ...Q.SJT_I];
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
  const sjtLeadershipScoreT = clampT(40 + (percentage / 100) * 30);
  return { total, maxTotal, percentage, sjtLeadershipScoreT, competencies, breakdown };
}

/* -------------------------------------------------------------------------
   LEADERSHIP POTENTIAL INDEX (LPI) — §12.1 / §12.2.
   ------------------------------------------------------------------------- */
function lpiBand(t) {
  if (t >= 65) return "Exceptional Leader";
  if (t >= 55) return "Strong Leader";
  if (t >= 45) return "Emerging Leader";
  if (t >= 35) return "Collaborative Contributor";
  return "Individual Achiever"; // counsellor-framed; not a deficit
}

function computeLPI({ leadership, management, ethical }) {
  const compositeT = clampT(
    leadership.visionInfluenceT * 0.3 +
    leadership.decisionMakingT * 0.2 +
    leadership.motivOthersT * 0.2 +
    management.managementT * 0.15 +
    ethical.ethicalT * 0.15
  );
  return { compositeT, band: lpiBand(compositeT) };
}

/* -------------------------------------------------------------------------
   LEADERSHIP STYLE (§12.3) — one primary style from the A/B/C/D/E/G pattern.
   ------------------------------------------------------------------------- */
function classifyLeadershipStyle({ leadership, management, power, ethical, teamwork, leadershipFc }) {
  const vision = leadership.subScales.Vision.tScore;
  const influence = leadership.subScales.Influence.tScore;
  const motiv = leadership.motivOthersT;
  const mgmt = management.managementT;
  const pd = power.powerDriveT;
  const hc = power.hierarchyComfortT;
  const fp = power.flatPrefT;
  const eth = ethical.ethicalT;
  const team = teamwork.teamworkOrientationT;
  const contributorLean = leadershipFc.leadVsFollow === "Follow";
  const consensual = leadershipFc.tally?.Consensual >= 1;

  // Priority-ordered pattern match (§12.3).
  if (vision >= 55 && influence >= 55 && eth >= 55 && pd >= 48) {
    return { style: "Transformational Leader", roleModel: "Narayana Murthy", indiaExpression: "IAS, IIM CEO track, Social Entrepreneur, NGO Director, Political Leadership" };
  }
  if (mgmt >= 55 && hc >= 55 && vision >= 45) {
    return { style: "Transactional / Administrative", roleModel: "T.N. Seshan (IAS)", indiaExpression: "PSU Senior Management, Bank Branch Manager, Hospital Administration, Government Dept Head" };
  }
  if (motiv >= 55 && eth >= 55 && team >= 55 && pd < 50) {
    return { style: "Servant Leader", roleModel: "Ela Bhatt (SEWA)", indiaExpression: "NGO Programme Lead, Community Leader, Teaching leadership, Panchayat" };
  }
  if (vision >= 55 && pd >= 55 && fp >= 52) {
    return { style: "Entrepreneurial Leader", roleModel: "Ritesh Agarwal", indiaExpression: "Startup Founder, Family Business Leader, Creative Agency Head" };
  }
  if (team >= 55 && consensual && vision >= 45) {
    return { style: "Democratic / Collaborative", roleModel: "Dr. Verghese Kurien", indiaExpression: "HR leadership, Consulting, Social Work, IT Team Management" };
  }
  if (contributorLean && pd < 48 && mgmt >= 50) {
    return { style: "Expert / Technical Leader", roleModel: "Dr. APJ Abdul Kalam", indiaExpression: "Senior Engineer/Doctor/Researcher who leads through expertise" };
  }
  // Fallback: nearest of transformational vs expert.
  return vision >= 50
    ? { style: "Emerging Transformational", roleModel: "Narayana Murthy", indiaExpression: "Developing leadership across multiple domains" }
    : { style: "Expert / Technical Leader", roleModel: "Dr. APJ Abdul Kalam", indiaExpression: "Leads through depth of expertise" };
}

/* -------------------------------------------------------------------------
   VALIDITY — LikeMe SD + RII cross-item consistency (§11.1 / §11.2).
   ------------------------------------------------------------------------- */
function scoreValidity(validityById = {}, responsesById = {}, fcById = {}) {
  const likeVals = Q.VALIDITY.map((i) => Number(validityById[i.id])).filter(Boolean);
  const likeMean = mean(likeVals);
  const likeMeT = meanToT(likeMean);
  const socialDesirabilityFlag = likeMeT > 65;

  // RII cross-item pairs (§11.2) over EXISTING items.
  const A = buildItemMap(Q.LEADERSHIP_POTENTIAL);
  const B = buildItemMap(Q.MANAGEMENT_SKILLS);
  const C = buildItemMap(Q.TEAMWORK);
  const D = buildItemMap(Q.POWER_ORIENTATION);
  const E = buildItemMap(Q.ETHICAL_LEADERSHIP);
  const F = buildItemMap(Q.WORK_CULTURE);

  const raw = (id) => Number(responsesById[id]) || 0;
  const inconsistencies = [];

  // 1) High initiative/leadership (A) but selects 'Contributor' in G1.
  const initiativeMean = idsMean(A, responsesById, ["A8", "A9", "A17", "A18"]); // reverse-aware
  if (initiativeMean >= 4 && fcById["G1"] === "B") {
    inconsistencies.push("LeadershipInitiative_vs_ContributorChoice");
  }
  // 2) High HierarchyComfort (D4) but strongly prefers startup/flat (F7).
  if (raw("D4") >= 4 && raw("F7") >= 4) {
    inconsistencies.push("HierarchyComfort_vs_StartupPreference");
  }
  // 3) Leaders fully accountable (E4) but ends-justify-means (E13).
  if (raw("E4") >= 4 && raw("E13") >= 4) {
    inconsistencies.push("Accountability_vs_EndsJustifyMeans");
  }
  // 4) Prioritises completion/results (B11) but frustrated coordinating (B15).
  if (raw("B11") >= 4 && raw("B15") >= 4) {
    inconsistencies.push("ResultsClaim_vs_CoordinationAversion");
  }
  // 5) Inspires/motivates others (A7) but leading feels draining (A18).
  if (raw("A7") >= 4 && raw("A18") >= 4) {
    inconsistencies.push("MotivatesOthers_vs_LeadingDrains");
  }

  const riiCount = inconsistencies.length;
  const inconsistencyFlag = riiCount >= 2;

  return {
    likeMeT,
    socialDesirabilityFlag,
    inconsistencies,
    riiCount,
    inconsistencyFlag,
    clean: !socialDesirabilityFlag && !inconsistencyFlag,
    // combined counsellor flag from §11.1 note (LikeMe>65 + all leadership high).
    leadershipInflationFlag: likeMeT > 65,
  };
}

/* -------------------------------------------------------------------------
   CRITICAL FLAG (§13.2 / §14.2): High PowerDrive + Low Ethics.
   ------------------------------------------------------------------------- */
function computeCriticalFlags({ power, ethical }) {
  const highPowerLowEthics = power.powerDriveT >= 58 && ethical.ethicalT < 48;
  return {
    highPowerLowEthics, // most sensitive flag in the battery — counsellor-only, developmental
    civilServiceCapped: !ethical.ethicsThresholdFlag,
    moralPragmatismConcern: ethical.moralPragmatismProbe && power.powerDriveT >= 58,
  };
}

/* -------------------------------------------------------------------------
   SUMMARY
   ------------------------------------------------------------------------- */
function computeSummary({ lpi, style, power, teamwork, ethical, workCulture }) {
  return {
    lpiScore: lpi.compositeT,
    lpiBand: lpi.band,
    leadershipStyle: style.style,
    styleRoleModel: style.roleModel,
    powerProfile: power.profile,
    primaryTeamRole: teamwork.primaryRole,
    ethicalBand: ethical.civilServiceBand,
    topOrgFit: workCulture.topFit,
    overall: clamp(Math.round(((lpi.compositeT - 20) / 60) * 100), 0, 100),
    preliminary: true,
  };
}

module.exports = {
  scoreLeadershipPotential,
  scoreManagement,
  scoreTeamwork,
  scorePowerOrientation,
  scoreEthicalLeadership,
  scoreWorkCulture,
  scoreLeadershipFc,
  scoreSjt,
  computeLPI,
  classifyLeadershipStyle,
  scoreValidity,
  computeCriticalFlags,
  computeSummary,
  lpiBand,
};
