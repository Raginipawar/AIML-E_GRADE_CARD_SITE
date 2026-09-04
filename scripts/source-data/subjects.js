// Official subject lists per semester.
// FY-Sem1/2 and SY-Sem1/2 (code, title, credits, raginiGrade) come straight off
// Ragini Pawar's 4 real provisional marksheets in Raw_data/ALL_SEM_RESULTS/.
// `scheme` (where present) is the REAL official examination-weightage table for
// that subject, transcribed from the "Course Structure" (Module III/IV) pages
// of Raw_data/AIML-Syllabus_CSE_AIML_AY-25_26-S2 (1).pdf. Components always
// sum to 100. Where a subject has no official scheme available to us (an
// elective from outside the AIML department, e.g. MEM002), `scheme` is null
// and the generator falls back to a generic Internal(40)+ESE(60) split —
// this fallback is also used for every FY subject, since FY is common
// first-year curriculum and no department-level scheme table exists for it.
// TY-Sem1/2 (Module V/VI) are real too, but TY has no results yet (current
// semester in progress) — no `raginiGrade`, no marks are ever generated for
// these, they exist only for the Syllabus & Subjects tab.

const FY_SEM1 = [
  { code: 'CS1018', title: 'Python For Engineers', credits: 2, raginiGrade: 'B+' },
  { code: 'ET1012', title: 'Applied Electromechanics', credits: 4, raginiGrade: 'A' },
  { code: 'HS1027', title: 'Induction Training', credits: 0, raginiGrade: 'P' },
  { code: 'HS1072', title: 'Reasoning & Aptitude Development - 1', credits: 1, raginiGrade: 'B' },
  { code: 'HS1074', title: 'General Proficiency - 1', credits: 1, raginiGrade: 'A+' },
  { code: 'HS1075', title: 'Student Activity - 1', credits: 1, raginiGrade: 'A' },
  { code: 'HS1076', title: 'Calculus and Statistics', credits: 4, raginiGrade: 'B' },
  { code: 'HS1077', title: 'Universal Human Values', credits: 2, raginiGrade: 'B+' },
  { code: 'ML1011', title: 'Applied Science & Engineering Project - 1', credits: 2, raginiGrade: 'A+' },
  { code: 'ML1013', title: 'Scientific Research Methods - 1', credits: 1, raginiGrade: 'A' },
  { code: 'ML1017', title: 'Data Analysis', credits: 2, raginiGrade: 'A+' },
];

const FY_SEM2 = [
  { code: 'CS1012', title: 'Problem Solving & Programming', credits: 4, raginiGrade: 'A' },
  { code: 'ES1014', title: 'Environmental Science', credits: 0, raginiGrade: 'P' },
  { code: 'HS1036', title: 'Indian Democracy and Constitution', credits: 0, raginiGrade: 'P' },
  { code: 'HS1071', title: 'Linear Algebra and Differential Equations', credits: 4, raginiGrade: 'B+' },
  { code: 'HS1073', title: 'Indian Knowledge System', credits: 2, raginiGrade: 'A' },
  { code: 'HS1079', title: 'Reasoning and Aptitude Development - 2', credits: 1, raginiGrade: 'B+' },
  { code: 'HS1080', title: 'General Proficiency - 2', credits: 1, raginiGrade: 'A' },
  { code: 'HS1081', title: 'Student Activity - 2', credits: 1, raginiGrade: 'A+' },
  { code: 'ML1014', title: 'Applied Science & Engineering Project - 2', credits: 2, raginiGrade: 'A+' },
  { code: 'ML1015', title: 'Scientific Research Methods - 2', credits: 1, raginiGrade: 'A+' },
  { code: 'ML1019', title: 'Web Development', credits: 2, raginiGrade: 'A+' },
  { code: 'ML1020', title: 'Computer Organization and Architecture', credits: 2, raginiGrade: 'A+' },
];

const SY_SEM1 = [
  { code: 'HS2001', title: 'Reasoning and Aptitude Development - 3', credits: 1, raginiGrade: 'C+', scheme: [{ key: 'ese', label: 'ESE', weight: 100, written: true }] },
  { code: 'HS2002', title: 'From Campus to Corporate - 1', credits: 2, raginiGrade: 'B', scheme: [{ key: 'mse', label: 'MSE', weight: 50, written: true }, { key: 'ese', label: 'ESE', weight: 50, written: true }] },
  { code: 'MEM002', title: 'Product Design and Development', credits: 3, raginiGrade: 'A', scheme: null },
  { code: 'ML2301', title: 'Fundamentals of Data Structures', credits: 3, raginiGrade: 'A+', scheme: [{ key: 'lab', label: 'Lab/Practical', weight: 50, written: false }, { key: 'cp', label: 'Course Project', weight: 30, written: false }, { key: 'cvv', label: 'CVV', weight: 20, written: false }] },
  { code: 'ML2302', title: 'Database Management Systems', credits: 3, raginiGrade: 'A', scheme: [{ key: 'lab', label: 'Lab', weight: 10, written: false }, { key: 'cp', label: 'Course Project', weight: 30, written: false }, { key: 'cvv', label: 'CVV', weight: 20, written: false }, { key: 'ese', label: 'ESE', weight: 40, written: true }] },
  { code: 'ML2303', title: 'Object Oriented Programming', credits: 3, raginiGrade: 'B+', scheme: [{ key: 'lab', label: 'Lab', weight: 10, written: false }, { key: 'cp', label: 'Course Project', weight: 30, written: false }, { key: 'cvv', label: 'CVV', weight: 20, written: false }, { key: 'ese', label: 'ESE', weight: 40, written: true }] },
  { code: 'ML2304', title: 'Digital Electronics and Microprocessor', credits: 3, raginiGrade: 'A', scheme: [{ key: 'test1', label: 'Test 1', weight: 35, written: true }, { key: 'test2', label: 'Test 2', weight: 35, written: true }, { key: 'cvv', label: 'CVV', weight: 30, written: false }] },
  { code: 'ML2305', title: 'Design Thinking - 1', credits: 1, raginiGrade: 'A', scheme: [{ key: 'ese', label: 'ESE', weight: 100, written: true }] },
  { code: 'ML2306', title: 'Engineering Design and Innovation - 1', credits: 2, raginiGrade: 'A', scheme: [{ key: 'internal', label: 'Internal', weight: 30, written: false }, { key: 'ese', label: 'ESE', weight: 70, written: true }] },
];

const SY_SEM2 = [
  { code: 'HS2003', title: 'From Campus to Corporate - 2', credits: 2, raginiGrade: 'A+', scheme: [{ key: 'mse', label: 'MSE', weight: 50, written: true }, { key: 'ese', label: 'ESE', weight: 50, written: true }] },
  { code: 'HS2004', title: 'Reasoning and Aptitude Development - 4', credits: 1, raginiGrade: 'B+', scheme: [{ key: 'ese', label: 'ESE', weight: 100, written: true }] },
  { code: 'ML2307', title: 'Advanced Data Structure', credits: 3, raginiGrade: 'A', scheme: [{ key: 'lab', label: 'Lab/Practical', weight: 50, written: false }, { key: 'cp', label: 'Course Project', weight: 30, written: false }, { key: 'cvv', label: 'CVV', weight: 20, written: false }] },
  { code: 'ML2308', title: 'Artificial Intelligence', credits: 3, raginiGrade: 'A', scheme: [{ key: 'lab', label: 'Lab', weight: 10, written: false }, { key: 'cp', label: 'Course Project', weight: 30, written: false }, { key: 'cvv', label: 'CVV', weight: 20, written: false }, { key: 'ese', label: 'ESE', weight: 40, written: true }] },
  { code: 'ML2309', title: 'Operating System', credits: 3, raginiGrade: 'A+', scheme: [{ key: 'lab', label: 'Lab', weight: 10, written: false }, { key: 'cp', label: 'Course Project', weight: 30, written: false }, { key: 'cvv', label: 'CVV', weight: 20, written: false }, { key: 'ese', label: 'ESE', weight: 40, written: true }] },
  { code: 'ML2310', title: 'Automata Theory and Compiler Design', credits: 3, raginiGrade: 'A', scheme: [{ key: 'test1', label: 'Test 1', weight: 35, written: true }, { key: 'test2', label: 'Test 2', weight: 35, written: true }, { key: 'cvv', label: 'CVV', weight: 30, written: false }] },
  { code: 'ML2311', title: 'Design Thinking - 2', credits: 1, raginiGrade: 'A', scheme: [{ key: 'ese', label: 'ESE', weight: 100, written: true }] },
  { code: 'ML2312', title: 'Engineering Design and Innovation - 2', credits: 2, raginiGrade: 'A+', scheme: [{ key: 'internal', label: 'Internal', weight: 30, written: false }, { key: 'ese', label: 'ESE', weight: 70, written: true }] },
  { code: 'MM0302', title: 'Data Visualization', credits: 3, raginiGrade: 'A', scheme: [{ key: 'test1', label: 'Test 1', weight: 35, written: true }, { key: 'test2', label: 'Test 2', weight: 35, written: true }, { key: 'internal', label: 'Internal (HA)', weight: 30, written: false }] },
];

// TY Module V (Sem1) / Module VI (Sem2) — real structure, syllabus-only, no marks yet.
const TY_SEM1 = [
  { code: 'ML3001', title: 'Computer Network Technology', credits: 4 },
  { code: 'ML3002', title: 'Design and Analysis of Algorithms', credits: 4 },
  { code: 'ML3003', title: 'Machine Learning', credits: 4 },
  { code: 'ML3004', title: 'Cloud Computing', credits: 4 },
  { code: 'ML3005', title: 'Design Thinking - 5', credits: 1 },
  { code: 'ML3007', title: 'Engineering Design & Innovation - 5', credits: 6 },
  { code: 'SH3001', title: 'Reasoning and Aptitude Development - 1', credits: 1 },
  { code: 'AC*', title: 'Audit Course (Industrial Robotics 2.0 / Smart City / Data Engineering)', credits: 0 },
];

const TY_SEM2 = [
  { code: 'ML3008', title: 'Software Engineering', credits: 4 },
  { code: 'ML3009', title: 'Cyber Security and Blockchain', credits: 4 },
  { code: 'ML3010', title: 'Deep Learning', credits: 4 },
  { code: 'Coursera', title: 'Coursera Course (IBM Full Stack / Power BI / Google Data Analytics / IBM Mainframe / Google UX / Tableau BI)', credits: 4 },
  { code: 'ML3011', title: 'Design Thinking - 6', credits: 1 },
  { code: 'ML3012', title: 'Engineering Design and Innovation - 6', credits: 6 },
  { code: 'SH3002', title: 'Reasoning and Aptitude Development - 2', credits: 1 },
  { code: 'AC*', title: 'Audit Course', credits: 0 },
];

// Final Year Module VII (Sem1) / Module VIII (Sem2) — real structure, "Course
// Work" track (an alternate "Internship" track of equal 16 credits exists in
// the syllabus for students who opt for an industry/project/research
// internship instead). Syllabus-only, years away from having results.
const FINAL_SEM1 = [
  { code: 'OE1', title: 'LinkedIn Learning (Open Elective)', credits: 2 },
  { code: 'ML4001', title: 'Generative AI', credits: 2 },
  { code: 'ML4015', title: 'Deep Learning for Computer Vision (Swayam)', credits: 2 },
  { code: 'ML4009', title: 'Major Project', credits: 9 },
  { code: 'ML4008', title: 'Design Thinking - 7', credits: 1 },
];

const FINAL_SEM2 = [
  { code: 'OE1', title: 'LinkedIn Learning (Open Elective)', credits: 2 },
  { code: 'ML4016', title: 'Generative AI', credits: 2 },
  { code: 'ML4015b', title: 'Parallel Computer Architecture (Swayam)', credits: 2 },
  { code: 'ML4018', title: 'Major Project', credits: 10 },
];

module.exports = {
  SEMESTERS: [
    { year: 'FY', semester: 1, label: 'First Year - Semester 1', subjects: FY_SEM1, hasResults: true },
    { year: 'FY', semester: 2, label: 'First Year - Semester 2', subjects: FY_SEM2, hasResults: true },
    { year: 'SY', semester: 1, label: 'Second Year - Semester 1', subjects: SY_SEM1, hasResults: true },
    { year: 'SY', semester: 2, label: 'Second Year - Semester 2', subjects: SY_SEM2, hasResults: true },
    { year: 'TY', semester: 1, label: 'Third Year - Semester 1', subjects: TY_SEM1, hasResults: false },
    { year: 'TY', semester: 2, label: 'Third Year - Semester 2', subjects: TY_SEM2, hasResults: false },
    { year: 'FINAL', semester: 1, label: 'Final Year - Semester 1', subjects: FINAL_SEM1, hasResults: false },
    { year: 'FINAL', semester: 2, label: 'Final Year - Semester 2', subjects: FINAL_SEM2, hasResults: false },
  ],
};
