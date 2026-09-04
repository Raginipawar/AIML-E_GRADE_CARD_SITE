export function gradeBadgeClass(grade) {
  if (!grade) return 'badge-P';
  if (grade.startsWith('A')) return 'badge-A';
  if (grade.startsWith('B')) return 'badge-B';
  if (grade.startsWith('C')) return 'badge-C';
  if (grade === 'P') return 'badge-P';
  return 'badge-D';
}

export const YEARS = ['FY', 'SY', 'TY'];
export const ALL_YEARS = ['FY', 'SY', 'TY', 'FINAL'];
export const YEAR_LABELS = { FY: 'First Year', SY: 'Second Year', TY: 'Third Year', FINAL: 'Final Year' };
