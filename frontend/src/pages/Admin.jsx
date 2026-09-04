import { useEffect, useMemo, useState } from 'react';
import { SubjectsApi, AdminMarksApi, extractError } from '../api/client.js';
import { ErrorBanner, Loading } from '../components/StatusBanner.jsx';
import { gradeBadgeClass } from '../utils.js';
import './Admin.css';

const MENU = [
  { key: 'home', label: 'Home' },
  { key: 'add', label: 'Add Marks' },
  { key: 'show', label: 'Show / Update / Delete Marksheet' },
];

function AddMarksForm({ subjects }) {
  const [prn, setPrn] = useState('');
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [components, setComponents] = useState({});
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const years = useMemo(() => [...new Set(subjects.map((s) => s.year))], [subjects]);
  const semesters = useMemo(
    () => [...new Set(subjects.filter((s) => s.year === year).map((s) => s.semester))].sort(),
    [subjects, year],
  );
  const subjectOptions = useMemo(
    () => subjects.filter((s) => s.year === year && s.semester === Number(semester) && s.scheme),
    [subjects, year, semester],
  );
  const activeSubject = subjectOptions.find((s) => s.code === subjectCode);

  function reset() {
    setPrn('');
    setYear('');
    setSemester('');
    setSubjectCode('');
    setComponents({});
    setStatus('');
    setError('');
  }

  function submit(e) {
    e.preventDefault();
    setStatus('');
    setError('');
    AdminMarksApi.create({ prn, subjectCode, year, semester: Number(semester), components })
      .then((res) => setStatus(`Added: ${res.student.name} / ${subjectCode} - ${res.letterGrade} (${res.totalPercent}%)`))
      .catch((err) => setError(extractError(err)));
  }

  return (
    <form className="card admin-form" onSubmit={submit}>
      <div className="field">
        <label>PRN</label>
        <input value={prn} onChange={(e) => setPrn(e.target.value)} placeholder="e.g. 12410292" required />
      </div>
      <div className="field">
        <label>Year</label>
        <select value={year} onChange={(e) => { setYear(e.target.value); setSemester(''); setSubjectCode(''); }} required>
          <option value="">Select year</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Semester</label>
        <select value={semester} onChange={(e) => { setSemester(e.target.value); setSubjectCode(''); }} required disabled={!year}>
          <option value="">Select semester</option>
          {semesters.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Subject</label>
        <select value={subjectCode} onChange={(e) => { setSubjectCode(e.target.value); setComponents({}); }} required disabled={!semester}>
          <option value="">Select subject</option>
          {subjectOptions.map((s) => (
            <option key={s.code} value={s.code}>{s.code}: {s.title}</option>
          ))}
        </select>
      </div>

      {activeSubject && (
        <div className="grid components-grid" style={{ marginBottom: 14 }}>
          {activeSubject.scheme.map((c) => (
            <div className="field" key={c.key}>
              <label>{c.label} (/{c.weight})</label>
              <input
                type="number"
                min="0"
                max={c.weight}
                step="0.1"
                value={components[c.key] ?? ''}
                onChange={(e) => setComponents((prev) => ({ ...prev, [c.key]: Number(e.target.value) }))}
                required
              />
            </div>
          ))}
        </div>
      )}

      <div className="admin-form-actions">
        <button className="btn btn-primary" type="submit" disabled={!activeSubject}>Add Marks</button>
        <button type="button" className="btn btn-outline" onClick={reset}>Clear</button>
      </div>

      {status && <p style={{ color: 'var(--success)', marginTop: 12 }}>{status}</p>}
      <ErrorBanner message={error} />
    </form>
  );
}

function EditRow({ row, onSaved, onCancel }) {
  const [components, setComponents] = useState(row.components);
  const [error, setError] = useState('');

  function save() {
    AdminMarksApi.update(row.markId, {
      prn: row.student.prn,
      subjectCode: row.subjectCode,
      year: row.year,
      semester: row.semester,
      components,
    })
      .then(onSaved)
      .catch((err) => setError(extractError(err)));
  }

  return (
    <tr className="edit-row">
      <td colSpan={5}>
        <div className="edit-inline">
          {Object.keys(components).map((key) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {key}
              <input
                type="number"
                value={components[key]}
                onChange={(e) => setComponents((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
              />
            </label>
          ))}
          <button className="btn btn-primary" style={{ padding: '6px 12px' }} onClick={save}>Save</button>
          <button className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={onCancel}>Cancel</button>
        </div>
        <ErrorBanner message={error} />
      </td>
    </tr>
  );
}

function ShowMarksheet() {
  const [prn, setPrn] = useState('');
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);

  function search() {
    setError('');
    const params = {};
    if (prn.trim()) params.prn = prn.trim();
    if (year) params.year = year;
    if (semester) params.semester = Number(semester);
    if (subjectCode.trim()) params.subjectCode = subjectCode.trim();
    AdminMarksApi.search(params)
      .then(setRows)
      .catch((err) => setError(extractError(err)));
  }

  function refreshRow(updated) {
    setRows((prev) => prev.map((r) => (r.markId === updated.markId ? updated : r)));
    setEditingId(null);
  }

  function remove(row) {
    if (!window.confirm(`Delete the ${row.subjectCode} mark for ${row.student.name}?`)) return;
    AdminMarksApi.remove(row.markId)
      .then(() => setRows((prev) => prev.filter((r) => r.markId !== row.markId)))
      .catch((err) => setError(extractError(err)));
  }

  return (
    <div>
      <div className="card search-bar">
        <div className="field">
          <label>PRN</label>
          <input value={prn} onChange={(e) => setPrn(e.target.value)} placeholder="optional" />
        </div>
        <div className="field">
          <label>Year</label>
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="">Any</option>
            <option value="FY">FY</option>
            <option value="SY">SY</option>
            <option value="TY">TY</option>
          </select>
        </div>
        <div className="field">
          <label>Semester</label>
          <select value={semester} onChange={(e) => setSemester(e.target.value)}>
            <option value="">Any</option>
            <option value="1">1</option>
            <option value="2">2</option>
          </select>
        </div>
        <div className="field">
          <label>Subject Code</label>
          <input value={subjectCode} onChange={(e) => setSubjectCode(e.target.value)} placeholder="e.g. ML2310" />
        </div>
        <button className="btn btn-primary" onClick={search} style={{ alignSelf: 'flex-end' }}>
          Search
        </button>
      </div>

      <ErrorBanner message={error} />

      {rows && (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>PRN</th>
                <th>Components</th>
                <th>Grade</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) =>
                editingId === r.markId ? (
                  <EditRow key={r.markId} row={r} onSaved={refreshRow} onCancel={() => setEditingId(null)} />
                ) : (
                  <tr key={r.markId}>
                    <td>{r.student.name}</td>
                    <td>{r.student.prn}</td>
                    <td>
                      {Object.entries(r.components)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(', ')}{' '}
                      (Total {r.totalPercent}%)
                    </td>
                    <td>
                      <span className={`badge ${gradeBadgeClass(r.letterGrade)}`}>{r.letterGrade}</span>
                    </td>
                    <td className="row-actions">
                      <button className="edit-btn" onClick={() => setEditingId(r.markId)}>Edit</button>
                      <button className="del-btn" onClick={() => remove(r)}>Delete</button>
                    </td>
                  </tr>
                ),
              )}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="muted">No matching mark records.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const [view, setView] = useState('home');
  const [subjects, setSubjects] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    SubjectsApi.list()
      .then(setSubjects)
      .catch((e) => setError(extractError(e)));
  }, []);

  return (
    <div className="admin-shell">
      <aside className="admin-menu">
        <div className="admin-menu-title">Menu</div>
        {MENU.map((m) => (
          <button
            key={m.key}
            className={`admin-menu-item ${view === m.key ? 'active' : ''}`}
            onClick={() => setView(m.key)}
          >
            {m.label}
          </button>
        ))}
      </aside>
      <div className="admin-main">
        <div className="admin-main-header">Marksheet Administration</div>
        <ErrorBanner message={error} />
        {!subjects && !error && <Loading />}

        {subjects && view === 'home' && (
          <p className="muted">
            Add / Show / Update / Delete / Search Marksheet: the CRUD surface behind this class portal's REST
            API, testable directly with the Postman collection in <code>postman/</code>.
          </p>
        )}
        {subjects && view === 'add' && <AddMarksForm subjects={subjects.filter((s) => s.hasResults)} />}
        {subjects && view === 'show' && <ShowMarksheet />}
      </div>
    </div>
  );
}
