import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SubjectsApi, extractError } from '../api/client.js';
import { ErrorBanner, Loading } from '../components/StatusBanner.jsx';
import LineSidebar from '../components/reactbits/LineSidebar.jsx';
import { ALL_YEARS, YEAR_LABELS } from '../utils.js';
import './Syllabus.css';

const SYLLABUS_PDF = '/syllabus/AIML-CSE-Syllabus-AY2025-26.pdf';
const MODULE_NOTE = { SY: 'III/IV', TY: 'V/VI', FINAL: 'VII/VIII' };

function YearBlock({ year, semesters, open, onToggle, blockRef }) {
  return (
    <div ref={blockRef} className={`card year-block ${open ? 'open' : ''}`}>
      <div className="year-head" onClick={onToggle}>
        <h3>
          {YEAR_LABELS[year]} <span className="muted">({year})</span>
        </h3>
        <motion.span className="chev" animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.25 }}>
          ▶
        </motion.span>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="year-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 20px 20px' }}>
              {year === 'FY' ? (
                <p className="muted">
                  No official AIML-department syllabus PDF exists for First Year, since it's common
                  first-year curriculum shared across branches. The subjects below are transcribed
                  directly from Ragini Pawar's own FY provisional marksheets.
                </p>
              ) : (
                <div className="syllabus-links">
                  <a className="btn btn-outline" href={SYLLABUS_PDF} target="_blank" rel="noreferrer">
                    Download official {year === 'FINAL' ? 'Final Year' : year} syllabus PDF
                  </a>
                  <span className="muted" style={{ alignSelf: 'center', fontSize: '0.85rem' }}>
                    (Course Structure tables, Module {MODULE_NOTE[year]})
                  </span>
                </div>
              )}
              {year === 'FINAL' && (
                <p className="muted" style={{ fontSize: '0.85rem', marginTop: 8 }}>
                  Shown here is the Course Work track. Students may instead opt for an Internship track
                  (Industry / Project / Research Internship) worth the same 16 credits each semester.
                </p>
              )}

              {semesters.map((sem) => (
                <div key={sem.semester} className="sem-block">
                  <h4>Semester {sem.semester}</h4>
                  {!sem.subjects[0]?.hasResults && (
                    <div className="no-results-note">Results not yet declared for this semester</div>
                  )}
                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Course Title</th>
                          <th>Credits</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sem.subjects.map((s) => (
                          <tr key={s.code}>
                            <td>{s.code}</td>
                            <td>{s.title}</td>
                            <td>{s.credits}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Syllabus() {
  const [subjects, setSubjects] = useState(null);
  const [error, setError] = useState('');
  const [openYear, setOpenYear] = useState(null);
  const blockRefs = useRef({});

  useEffect(() => {
    SubjectsApi.list()
      .then(setSubjects)
      .catch((e) => setError(extractError(e)));
  }, []);

  const byYear = {};
  (subjects || []).forEach((s) => {
    byYear[s.year] = byYear[s.year] || {};
    byYear[s.year][s.semester] = byYear[s.year][s.semester] || [];
    byYear[s.year][s.semester].push(s);
  });

  const years = ALL_YEARS.filter((y) => byYear[y]);

  function goToYear(index) {
    const year = years[index];
    if (!year) return;
    setOpenYear(year);
    blockRefs.current[year]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>Syllabus & Subjects</h1>
          <p>Official course structure for every year of the AIML-E division, First Year through Final Year.</p>
        </div>
      </div>

      <div className="section container">
        <ErrorBanner message={error} />
        {!subjects && !error && <Loading label="Loading subjects…" />}
        {subjects && (
          <div className="syllabus-layout">
            <div className="syllabus-nav">
              <LineSidebar
                items={years.map((y) => YEAR_LABELS[y])}
                accentColor="#e8a627"
                textColor="#5b6b84"
                markerColor="#c7d3e3"
                proximityRadius={90}
                maxShift={14}
                fontSize={1.05}
                itemGap={22}
                onItemClick={(index) => goToYear(index)}
              />
            </div>
            <div className="syllabus-blocks">
              {years.map((year) => (
                <YearBlock
                  key={year}
                  year={year}
                  open={openYear === year}
                  onToggle={() => setOpenYear((cur) => (cur === year ? null : year))}
                  blockRef={(el) => {
                    blockRefs.current[year] = el;
                  }}
                  semesters={Object.keys(byYear[year])
                    .sort()
                    .map((sem) => ({ semester: Number(sem), subjects: byYear[year][sem] }))}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
