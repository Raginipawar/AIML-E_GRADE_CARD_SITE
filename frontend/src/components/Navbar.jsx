import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Navbar.css';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/syllabus', label: 'Syllabus & Subjects' },
  { to: '/marks', label: 'Subject-wise Marks' },
  { to: '/gradecard', label: 'Gradecard & CGPA' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark">V</span>
          <span className="brand-text">
            <strong>AIML-E</strong> Grade Card
          </span>
        </NavLink>

        <button className="nav-toggle" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav-menu ${open ? 'open' : ''}`}>
          {LINKS.map((l) => {
            const isActive = l.end ? pathname === l.to : pathname.startsWith(l.to);
            return (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                onClick={() => setOpen(false)}
                className="nav-link"
                style={{ color: isActive ? '#fff' : undefined }}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="nav-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="nav-link-text">{l.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
