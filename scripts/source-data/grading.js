// VIT (this autonomous scheme) grade-point scale, reverse-engineered from
// Ragini Pawar's 4 real SGPA values against her 4 real transcripts:
//   FY-S1: 20 credits -> SGPA 8.55   FY-S2: 20 credits -> SGPA 9.15
//   SY-S1: 21 credits -> SGPA 8.67   SY-S2: 21 credits -> SGPA 9.29
// Solving credit-weighted grade points against those targets landed exactly
// (to 2 d.p.) on A+=10, A=9, B+=8, B=7 for all four semesters. C+ and below
// never appear in her transcripts, so C+=6, C=5, D=4, F=0 are a reasonable
// descending continuation, not independently verified — documented in the
// README as an assumption. 0-credit courses are graded P and excluded from
// GPA math entirely (also confirmed: they never move her SGPA).
const BANDS = [
  { min: 90, grade: 'A+', point: 10 },
  { min: 80, grade: 'A', point: 9 },
  { min: 70, grade: 'B+', point: 8 },
  { min: 60, grade: 'B', point: 7 },
  { min: 55, grade: 'C+', point: 6 },
  { min: 50, grade: 'C', point: 5 },
  { min: 45, grade: 'D', point: 4 },
  { min: 0, grade: 'F', point: 0 },
];

// A representative percentage to target inside each band, used only when we
// are back-solving Ragini's synthetic components to reproduce her real grade.
const BAND_TARGET_PERCENT = {
  'A+': 93,
  A: 84,
  'B+': 74,
  B: 64,
  'C+': 57,
  C: 52,
  D: 47,
  F: 30,
};

function gradeForPercent(percent) {
  const band = BANDS.find((b) => percent >= b.min);
  return band ? { grade: band.grade, point: band.point } : { grade: 'F', point: 0 };
}

module.exports = { BANDS, BAND_TARGET_PERCENT, gradeForPercent };
