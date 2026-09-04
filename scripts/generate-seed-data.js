// Builds backend/src/main/resources/data/seed.json from the source data in
// scripts/source-data/. Deterministic (seeded PRNG keyed by PRN) so re-running
// this always produces the same output. See README.md "How the data was
// built" for the full explanation of what is real vs synthetic here.
const fs = require('fs');
const path = require('path');

const { ROSTER } = require('./source-data/roster');
const { SEMESTERS } = require('./source-data/subjects');
const {
  OOP_ESE_OUT_OF_60,
  TOC_TEST1_OUT_OF_35,
  TOC_TEST2_OUT_OF_35,
  TOC_CVV_OUT_OF_30,
} = require('./source-data/real-marks');
const { BAND_TARGET_PERCENT, gradeForPercent } = require('./source-data/grading');

const RAGINI_ROLL = 15;
const GENERIC_SCHEME = [
  { key: 'internal', label: 'Internal', weight: 40, written: false },
  { key: 'ese', label: 'ESE', weight: 60, written: true },
];

// ---- deterministic PRNG (mulberry32), seeded from a string ----
function seedFromString(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822519);
    h = Math.imul(h ^ (h >>> 13), 3266489917);
    h = (h ^= h >>> 16) >>> 0;
    return h / 4294967296;
  };
}

function mulberry32(seed) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rngFor(...parts) {
  const seedGen = seedFromString(parts.join('|'));
  return mulberry32(Math.floor(seedGen() * 4294967296));
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

// Each student gets a stable "ability" in [0.80, 0.99], drawn from the sum of
// 3 uniforms (approximates a bell curve) so grades cluster on A/A+ for the
// fully-synthetic subjects, by request, while still varying student to
// student and subject to subject instead of being a suspiciously identical
// A+ for everyone.
function studentAbility(prn) {
  const r = rngFor('ability', prn);
  const bell = (r() + r() + r()) / 3;
  return clamp(0.8 + bell * 0.19, 0.8, 0.99);
}

function subjectFraction(prn, subjectCode, componentKey, written, baseAbility) {
  const r = rngFor('component', prn, subjectCode, componentKey);
  const subjectDrift = (r() - 0.5) * 0.1; // -0.05..0.05, stable per subject
  const noise = (r() - 0.5) * 0.08;
  const writtenPenalty = written ? 0 : 0.05; // practicals/internals score a bit higher
  return clamp(baseAbility + subjectDrift + noise + writtenPenalty, 0.05, 1);
}

function buildComponents(scheme, fractionFor) {
  const components = {};
  let totalPercent = 0;
  for (const c of scheme) {
    const fraction = fractionFor(c);
    const score = Math.round(fraction * c.weight * 10) / 10;
    components[c.key] = score;
    totalPercent += score;
  }
  return { components, totalPercent: Math.round(totalPercent * 10) / 10 };
}

// Back-solve Ragini's components so the weighted total lands on the exact
// percent we've chosen to represent her real, known letter grade.
function solveForTarget(scheme, fixed, targetPercent) {
  const components = {};
  let fixedSum = 0;
  const remaining = [];
  for (const c of scheme) {
    if (fixed[c.key] != null) {
      components[c.key] = fixed[c.key];
      fixedSum += fixed[c.key];
    } else {
      remaining.push(c);
    }
  }
  const remainingWeight = remaining.reduce((s, c) => s + c.weight, 0);
  const neededFromRemaining = clamp(targetPercent - fixedSum, 0, remainingWeight);
  let runningTotal = fixedSum;
  remaining.forEach((c, idx) => {
    const isLast = idx === remaining.length - 1;
    if (isLast) {
      const score = Math.round((neededFromRemaining - (runningTotal - fixedSum)) * 10) / 10;
      components[c.key] = clamp(score, 0, c.weight);
      runningTotal += components[c.key];
    } else {
      const fraction = neededFromRemaining / remainingWeight;
      const score = Math.round(fraction * c.weight * 10) / 10;
      components[c.key] = clamp(score, 0, c.weight);
      runningTotal += components[c.key];
    }
  });
  const totalPercent = Math.round(Object.values(components).reduce((a, b) => a + b, 0) * 10) / 10;
  return { components, totalPercent };
}

function generateMarkRecord({ student, subject, year, semester }) {
  const isPassOnly = subject.credits === 0;
  if (isPassOnly) {
    return {
      prn: student.prn,
      subjectCode: subject.code,
      year,
      semester,
      components: {},
      totalPercent: null,
      letterGrade: 'P',
      gradePoint: null,
    };
  }

  const scheme = subject.scheme || GENERIC_SCHEME;
  const isRagini = student.rollNo === RAGINI_ROLL;

  // Real, extracted marks take priority over any generated value.
  const fixedReal = {};
  if (subject.code === 'ML2303') {
    const raw = OOP_ESE_OUT_OF_60[student.rollNo];
    if (raw != null) fixedReal.ese = Math.round((raw / 60) * 40 * 10) / 10;
  }
  if (subject.code === 'ML2310') {
    const t1 = TOC_TEST1_OUT_OF_35[student.rollNo];
    const t2 = TOC_TEST2_OUT_OF_35[student.rollNo];
    const cvv = TOC_CVV_OUT_OF_30[student.rollNo];
    if (t1 != null) fixedReal.test1 = t1;
    if (t2 != null) fixedReal.test2 = t2;
    if (cvv != null) fixedReal.cvv = cvv;
  }

  let components;
  let totalPercent;

  if (isRagini) {
    const target = BAND_TARGET_PERCENT[subject.raginiGrade];
    ({ components, totalPercent } = solveForTarget(scheme, fixedReal, target));
  } else {
    const baseAbility = studentAbility(student.prn);
    const allFixed = scheme.every((c) => fixedReal[c.key] != null);
    if (allFixed) {
      components = { ...fixedReal };
      totalPercent = Math.round(Object.values(components).reduce((a, b) => a + b, 0) * 10) / 10;
    } else {
      ({ components, totalPercent } = buildComponents(scheme, (c) => {
        if (fixedReal[c.key] != null) return fixedReal[c.key] / c.weight;
        return subjectFraction(student.prn, subject.code, c.key, c.written, baseAbility);
      }));
      // overlay any real fixed values exactly (buildComponents already used
      // the right fraction for them, this just avoids double-rounding drift)
      Object.assign(components, fixedReal);
      totalPercent = Math.round(Object.values(components).reduce((a, b) => a + b, 0) * 10) / 10;
    }
  }

  const { grade, point } = gradeForPercent(totalPercent);
  return {
    prn: student.prn,
    subjectCode: subject.code,
    year,
    semester,
    components,
    totalPercent,
    letterGrade: grade,
    gradePoint: point,
  };
}

function main() {
  const subjectsFlat = [];
  const markRecords = [];

  for (const sem of SEMESTERS) {
    for (const subject of sem.subjects) {
      subjectsFlat.push({
        code: subject.code,
        title: subject.title,
        credits: subject.credits,
        year: sem.year,
        semester: sem.semester,
        hasResults: sem.hasResults,
        scheme: subject.credits === 0 ? null : subject.scheme || GENERIC_SCHEME,
      });
      if (!sem.hasResults) continue;
      for (const student of ROSTER) {
        markRecords.push(
          generateMarkRecord({ student, subject, year: sem.year, semester: sem.semester })
        );
      }
    }
  }

  const seed = {
    generatedAt: new Date().toISOString(),
    division: 'CSAIML-E',
    students: ROSTER,
    subjects: subjectsFlat,
    markRecords,
  };

  // ---- sanity check: Ragini's SGPA/CGPA must reproduce her real transcripts ----
  const expected = {
    'FY-1': 8.55,
    'FY-2': 9.15,
    'SY-1': 8.67,
    'SY-2': 9.29,
  };
  const cgpaExpected = { 'FY-1': 8.55, 'FY-2': 8.85, 'SY-1': 8.79, 'SY-2': 8.91 };
  let cumCredits = 0;
  let cumPoints = 0;
  for (const sem of SEMESTERS) {
    if (!sem.hasResults) continue;
    const key = `${sem.year}-${sem.semester}`;
    const rows = markRecords.filter(
      (m) => m.prn === '12411012' && m.year === sem.year && m.semester === sem.semester && m.letterGrade !== 'P'
    );
    let credits = 0;
    let points = 0;
    for (const row of rows) {
      const subj = subjectsFlat.find((s) => s.code === row.subjectCode && s.year === row.year && s.semester === row.semester);
      credits += subj.credits;
      points += subj.credits * row.gradePoint;
    }
    const sgpa = Math.round((points / credits) * 100) / 100;
    cumCredits += credits;
    cumPoints += points;
    const cgpa = Math.round((cumPoints / cumCredits) * 100) / 100;
    if (Math.abs(sgpa - expected[key]) > 0.005) {
      throw new Error(`SGPA mismatch for ${key}: expected ${expected[key]}, got ${sgpa}`);
    }
    if (Math.abs(cgpa - cgpaExpected[key]) > 0.005) {
      throw new Error(`CGPA mismatch for ${key}: expected ${cgpaExpected[key]}, got ${cgpa}`);
    }
    console.log(`OK  ${key}  SGPA ${sgpa} (expected ${expected[key]})  CGPA ${cgpa} (expected ${cgpaExpected[key]})`);
  }

  const outDir = path.join(__dirname, '..', 'backend', 'src', 'main', 'resources', 'data');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'seed.json');
  fs.writeFileSync(outPath, JSON.stringify(seed, null, 2));
  console.log(`\nWrote ${markRecords.length} mark records for ${ROSTER.length} students to ${outPath}`);
}

main();
