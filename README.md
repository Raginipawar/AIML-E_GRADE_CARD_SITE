# AIML-E Grade Card Portal

A website for the CSAIML-E division (Vishwakarma Institute of Technology, Pune) where any of the 73
classmates can browse the official syllabus, look up subject-wise marks, and fetch their own
semester grade card with SGPA/CGPA. Built as part of CNT Experiment 5 ("design a responsive website
using REACT, Spring Boot and MySQL, tested via Postman").

This README explains, in plain English, exactly what was built and what data is real versus
synthetic, and how to run everything yourself.

## 1. What's real, and what isn't

Everything in `Raw_data/` is genuine: real marksheets, real test-marks sheets, a real class roster,
the real AIML department syllabus. Here's exactly how each piece was used.

| What | Source | Real or synthetic? |
|---|---|---|
| The 73-student roster (name, roll no., PRN) | `CSAIML-E_ML2303_OOP_ESE_25_1 (1).xlsx`, cross-checked against `E_TY.xlsx` and the PRN columns of the Test-1/Test-2/CVV sheets | 100% real |
| FY-Sem1, FY-Sem2, SY-Sem1, SY-Sem2 subject lists, credits, and official exam-weight schemes (Test1/Test2/CVV/ESE %) | Ragini Pawar's 4 real provisional marksheets, and the "Course Structure" tables inside the AIML syllabus PDF | Real. FY has no official percentage scheme published, so a generic Internal-40%/ESE-60% split is assumed and labelled as such |
| TY-Sem1 / TY-Sem2 subject list and credits | The syllabus PDF's Module V/VI Course Structure tables | Real, but TY has no results yet (current semester), so the site only shows the subject list and never fabricates a TY grade |
| Object Oriented Programming (SY-Sem1, ML2303) marks | `CSAIML-E_ML2303_OOP_ESE_25_1 (1).xlsx` | Real ESE marks for all 73 students. The Internal (Lab + Project + CVV) component isn't in our data, so it's generated |
| Automata Theory & Compiler Design (SY-Sem2, ML2310) marks | `Online test-1.pdf`, `Online test-2.pdf`, `CVV_1.pdf` | 100% real Test1 + Test2 + CVV for every student. This subject has no synthetic component at all |
| Every other subject's marks, for every student except Ragini | (generated) | Synthetic, generated so grades vary realistically across the class (see §4) |
| Ragini Pawar's grade in every subject | Her 4 real marksheets (letter grades, SGPA, CGPA) | Real. Her synthetic component numbers are deliberately chosen to land on her actual letter grade, so her SGPA/CGPA on the site match her real transcripts exactly (verified, see §4) |

Mother's name, ABC ID, QR code and real student photos from the reference screenshot were
deliberately left out of the site. They aren't needed for a gradecard/CGPA tool, and there's no
reason to publish that level of personal detail for 72 classmates who never provided it. Every
student gets a plain initials avatar instead.

## 2. What the site does

- **Home**: hero banner, quick stats, and cards into the three tabs.
- **Syllabus & Subjects**: accordion by year (FY, SY, TY), each showing the real subject table
  (code, title, credits). SY and TY link to the real AIML syllabus PDF; FY has no such document, so
  that's stated plainly instead of faked.
- **Subject-wise Marks**: pick a year, then a subject, and see every enrolled student's component
  breakdown (Test 1 / Test 2 / CVV / ESE / Internal, whichever apply to that subject) and resulting
  grade, with a name/PRN/roll number search box.
- **Gradecard & CGPA Finder**: enter PRN, Name, Year and Semester (the name just needs to roughly
  match, any word order, so classmates don't need to know the exact official "Surname First Middle"
  format). Returns a single semester's grade card in the style of an official VIT marksheet: letterhead,
  the course table, Current Semester Record and Cumulative Record side by side, and a Download PDF
  button (generated server-side, same layout).
- **`/admin`** (not in the main menu, linked from the footer): Add / Show / Update / Delete / Search
  Marksheet, mirroring the CNT lab experiment's sample-output CRUD flow, backed by the same REST API.

## 3. Tech stack

Matches the assignment brief: React (Vite) frontend, Spring Boot backend (Controller, Service,
Repository/JPA, exactly like the architecture diagram in the lab manual), REST API tested with
Postman, SQL database.

- **Backend**: Spring Boot 4 / Java 21, Spring Data JPA, Bean Validation, OpenPDF for PDF export.
  Built with the Maven Wrapper (`mvnw`), no global Maven install needed.
- **Database**: defaults to a file-based H2 database, zero install, `mvnw spring-boot:run` just works
  on any classmate's machine. A `mysql` Spring profile plus `docker-compose.yml` gives you a real
  MySQL instance for the official demo, with the exact same JPA code.
- **Frontend**: React 19 with React Router, plain hand-written CSS in a VIT-blue theme with a serif
  typeface, no UI framework dependency.

## 4. How the synthetic data was generated

`scripts/generate-seed-data.js` builds `backend/src/main/resources/data/seed.json`, which the backend
loads into the database on first boot. It's deterministic, seeded by PRN rather than `Math.random()`,
so re-running it always produces the same data.

- Each student gets a stable "ability" score, and each subject gets a bit of per-student noise on top
  of that, so grades vary realistically instead of every student getting the same result.
- For Ragini Pawar specifically, the script back-solves her component marks so the total lands
  exactly in the percentage band matching her real letter grade in that subject. Because SGPA/CGPA
  only depend on the letter grade, not the exact percentage within a band, this reproduces her real
  SGPA for all 4 semesters and her real CGPA exactly. The script asserts this on every run and fails
  loudly if it doesn't match.
- VIT's grade-point scale was reverse-engineered by solving her 4 real SGPAs against her 4 real
  transcripts: `A+=10, A=9, B+=8, B=7` came out exact to 2 decimal places for all four semesters.
  `C+=6, C=5, D=4, F=0` are a reasonable continuation but weren't independently confirmed, since none
  of her subjects fall below B. 0-credit courses are graded P and excluded from GPA math entirely.
- The percentage-to-letter-grade bands (90 and above A+, 80 to 89 A, 70 to 79 B+, 60 to 69 B, 55 to
  59 C+, 50 to 54 C, 45 to 49 D, below 45 F) are a reasonable assumption, not an officially published
  table, validated once against Automata Theory's real marks, which land exactly on Ragini's real
  "A" grade.

To regenerate the data (for example after editing `scripts/source-data/*.js`):

```bash
cd scripts
npm install
node generate-seed-data.js
```

## 5. Running it

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

Starts on `http://localhost:8080` using the bundled H2 database (created at `backend/data/` on first
run, loaded from `seed.json` automatically). The H2 console is at `/h2-console` (JDBC URL
`jdbc:h2:file:./data/aiml-gradecard`, user `sa`, no password) if you want to look at the tables
directly.

To use real MySQL instead, for the official Postman/MySQL demo:

```bash
docker compose up -d
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=mysql
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Starts on `http://localhost:5173` and talks to the backend on port 8080 (override with a
`VITE_API_BASE` env var if you move the backend).

### Postman

Import `postman/AIML-E-Gradecard.postman_collection.json`. It covers every endpoint (students,
subjects, marks, gradecard plus PDF, and the full admin CRUD) against `http://localhost:8080`.

## 6. Project structure

```
CNT_5_ASSIGNMENT/
  Raw_data/                    Original source files (marksheets, syllabus, roster, images), untouched
  scripts/
    source-data/                Transcribed real data: roster.js, subjects.js, real-marks.js, grading.js
    generate-seed-data.js       Builds backend/.../data/seed.json (see §4)
  backend/                      Spring Boot app (mvnw, pom.xml, src/main/java/com/aiml/gradecard/...)
  frontend/                     React app (Vite, src/pages, src/components, public/images, public/syllabus)
  docker-compose.yml            Optional real MySQL for the official demo
  postman/                      Postman collection
```

## 7. A note on privacy

This is meant for the CSAIML-E division to use among themselves. Classmates' phone numbers and
personal email addresses, present in `Raw_data/E_TY.xlsx`, were not used anywhere on the site. Only
name, roll number, PRN and division are shown, which already appear on the shared Test/CVV marks
sheets routinely circulated to the class.
