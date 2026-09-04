import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GradecardApi, extractError } from '../api/client.js';
import { ErrorBanner, Loading } from '../components/StatusBanner.jsx';
import { gradeBadgeClass, YEARS, YEAR_LABELS } from '../utils.js';
import './Gradecard.css';

export default function Gradecard() {
  const [prn, setPrn] = useState('');
  const [name, setName] = useState('');
  const [year, setYear] = useState('SY');
  const [semester, setSemester] = useState(2);
  const [gc, setGc] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!prn.trim() || !name.trim()) {
      setError('Please enter both PRN and Name.');
      return;
    }
    setLoading(true);
    setError('');
    setGc(null);
    GradecardApi.get(prn.trim(), name.trim(), year, semester)
      .then(setGc)
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoading(false));
  }

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>Gradecard & CGPA Finder</h1>
          <p>Enter your PRN, name, year and semester exactly as on your admission records to fetch your grade card.</p>
        </div>
      </div>

      <div className="section container">
        <form className="card lookup-form" onSubmit={handleSubmit}>
          <div className="field">
            <label>PRN</label>
            <input value={prn} onChange={(e) => setPrn(e.target.value)} placeholder="e.g. 12411012" />
          </div>
          <div className="field grow">
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ragini Pawar" />
          </div>
          <div className="field">
            <label>Year</label>
            <select value={year} onChange={(e) => setYear(e.target.value)}>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {YEAR_LABELS[y]} ({y})
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Semester</label>
            <select value={semester} onChange={(e) => setSemester(Number(e.target.value))}>
              <option value={1}>Semester 1</option>
              <option value={2}>Semester 2</option>
            </select>
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Fetching…' : 'Fetch'}
          </button>
          <p className="hint" style={{ flexBasis: '100%' }}>
            Your name just needs to roughly match our records (any order/spelling of your official name works).
            Find your PRN on any Test/CVV marks sheet or your admission documents.
          </p>
        </form>

        <ErrorBanner message={error} />
        {loading && <Loading label="Fetching your grade card…" />}

        <AnimatePresence mode="wait">
          {gc && (
            <motion.div
              key={`${gc.student.prn}-${gc.year}-${gc.semester}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="card marksheet"
            >
              <div className="marksheet-letterhead">
                <div className="trust">Bansilal Ramnath Agarwal Charitable Trust's</div>
                <h2>Vishwakarma Institute of Technology, Pune</h2>
                <div className="affil">(An Autonomous Institute affiliated to Savitribai Phule Pune University)</div>
                <div className="addr">666, Upper Indiranagar, Bibwewadi, Pune - 411 037.</div>
              </div>

              <div className="marksheet-title">Semester Grade Card</div>

              <div className="grid info-grid">
                <div className="info-row">
                  <span className="info-label">Name</span>
                  <span>{gc.student.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">PRN</span>
                  <span>{gc.student.prn}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Roll No.</span>
                  <span>{gc.student.rollNo}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Division</span>
                  <span>{gc.student.division}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Program</span>
                  <span>Bachelor of Technology</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Branch</span>
                  <span>Computer Science &amp; Engineering (AI &amp; ML)</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Class</span>
                  <span>{YEAR_LABELS[gc.year]}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Semester</span>
                  <span>{gc.semester}</span>
                </div>
              </div>

              {!gc.hasResults ? (
                <p className="muted">Results have not yet been declared for this semester.</p>
              ) : (
                <>
                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Sr.No</th>
                          <th>Course Code</th>
                          <th>Course Title</th>
                          <th>Credits</th>
                          <th>Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gc.subjects.map((s, i) => (
                          <tr key={s.code}>
                            <td>{i + 1}</td>
                            <td>{s.code}</td>
                            <td>{s.title}</td>
                            <td>{s.credits}</td>
                            <td>
                              <span className={`badge ${gradeBadgeClass(s.letterGrade)}`}>{s.letterGrade}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid summary-grid">
                    <div className="summary-cell">
                      <h4>Current Semester Record</h4>
                      <div className="summary-row">
                        <span>Credits Registered</span>
                        <strong>{gc.currentCreditsRegistered}</strong>
                      </div>
                      <div className="summary-row">
                        <span>Credits Earned</span>
                        <strong>{gc.currentCreditsEarned}</strong>
                      </div>
                      <div className="summary-row">
                        <span>SGPA</span>
                        <strong>{gc.sgpa ?? '-'}</strong>
                      </div>
                    </div>
                    <div className="summary-cell">
                      <h4>Cumulative Record</h4>
                      <div className="summary-row">
                        <span>Credits Registered</span>
                        <strong>{gc.cumulativeCreditsRegistered}</strong>
                      </div>
                      <div className="summary-row">
                        <span>Credits Earned</span>
                        <strong>{gc.cumulativeCreditsEarned}</strong>
                      </div>
                      <div className="summary-row">
                        <span>CGPA</span>
                        <strong>{gc.cgpa ?? '-'}</strong>
                      </div>
                    </div>
                  </div>

                  <p className={`result-status ${gc.resultStatus === 'PASS' ? 'pass' : 'fail'}`}>
                    Result Status: {gc.resultStatus}
                  </p>

                  <div className="marksheet-actions">
                    <a
                      className="btn btn-primary"
                      href={GradecardApi.pdfUrl(gc.student.prn, gc.student.name, gc.year, gc.semester)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Download PDF
                    </a>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
