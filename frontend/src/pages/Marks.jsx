import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SubjectsApi, MarksApi, extractError } from '../api/client.js';
import { ErrorBanner, Loading } from '../components/StatusBanner.jsx';
import { gradeBadgeClass, YEAR_LABELS } from '../utils.js';
import './Marks.css';

export default function Marks() {
  const [subjects, setSubjects] = useState(null);
  const [year, setYear] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [rows, setRows] = useState(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    SubjectsApi.list()
      .then((all) => {
        const withResults = all.filter((s) => s.hasResults && s.credits > 0);
        setSubjects(withResults);
        if (withResults.length) setYear(withResults[0].year);
      })
      .catch((e) => setError(extractError(e)));
  }, []);

  const years = useMemo(() => [...new Set((subjects || []).map((s) => s.year))], [subjects]);
  const subjectsForYear = useMemo(() => (subjects || []).filter((s) => s.year === year), [subjects, year]);

  useEffect(() => {
    if (subjectsForYear.length && !subjectsForYear.some((s) => s.code === subjectCode)) {
      setSubjectCode(subjectsForYear[0].code);
    }
  }, [subjectsForYear]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeSubject = subjectsForYear.find((s) => s.code === subjectCode);

  useEffect(() => {
    if (!activeSubject) return;
    setRows(null);
    setError('');
    MarksApi.forSubject(activeSubject.year, activeSubject.semester, activeSubject.code)
      .then(setRows)
      .catch((e) => setError(extractError(e)));
  }, [activeSubject]);

  const componentDefs = activeSubject?.scheme || [];

  const filteredRows = (rows || []).filter((r) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return r.student.prn.includes(q) || r.student.name.toLowerCase().includes(q) || String(r.student.rollNo) === q;
  });

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>Subject-wise Marks</h1>
          <p>Every enrolled student's component breakdown and resulting grade for one subject.</p>
        </div>
      </div>

      <div className="section container">
        <ErrorBanner message={error} />
        {!subjects && !error && <Loading label="Loading subjects…" />}

        {subjects && (
          <>
            <div className="card filters">
              <div className="field">
                <label>Year</label>
                <select value={year} onChange={(e) => setYear(e.target.value)}>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {YEAR_LABELS[y]} ({y})
                    </option>
                  ))}
                </select>
              </div>
              <div className="field grow-2">
                <label>Subject</label>
                <select value={subjectCode} onChange={(e) => setSubjectCode(e.target.value)}>
                  <optgroup label="Semester 1">
                    {subjectsForYear
                      .filter((s) => s.semester === 1)
                      .map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.code}: {s.title}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Semester 2">
                    {subjectsForYear
                      .filter((s) => s.semester === 2)
                      .map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.code}: {s.title}
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>
              <div className="field grow">
                <label>Search by name / PRN / roll no.</label>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="e.g. Ragini or 12411012" />
              </div>
            </div>

            {activeSubject && (
              <p className="scheme-note">
                {activeSubject.title} · Semester {activeSubject.semester}
                {componentDefs.length > 0 && (
                  <> · Scheme: {componentDefs.map((c) => `${c.label} (${c.weight}%)`).join(' + ')}</>
                )}
              </p>
            )}

            {!rows && <Loading label="Loading marks…" />}

            <AnimatePresence mode="wait">
              {rows && (
                <motion.div
                  key={subjectCode}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="table-scroll"
                  style={{ marginTop: 12 }}
                >
                  <table>
                    <thead>
                      <tr>
                        <th>Roll</th>
                        <th>Name</th>
                        <th>PRN</th>
                        {componentDefs.map((c) => (
                          <th key={c.key}>
                            {c.label}
                            <br />
                            <span style={{ fontWeight: 400, opacity: 0.85 }}>/{c.weight}</span>
                          </th>
                        ))}
                        <th>Total %</th>
                        <th>Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.map((r) => (
                        <tr key={r.markId} className={r.student.prn === '12411012' ? 'highlight-row' : ''}>
                          <td>{r.student.rollNo}</td>
                          <td>{r.student.name}</td>
                          <td>{r.student.prn}</td>
                          {componentDefs.map((c) => (
                            <td key={c.key}>{r.components[c.key] ?? '-'}</td>
                          ))}
                          <td>{r.totalPercent}</td>
                          <td>
                            <span className={`badge ${gradeBadgeClass(r.letterGrade)}`}>{r.letterGrade}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}
