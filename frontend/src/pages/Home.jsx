import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import BubbleMenu from '../components/reactbits/BubbleMenu.jsx';
import './Home.css';

const EXPLORE_ITEMS = [
  { label: 'syllabus', href: '/syllabus', ariaLabel: 'Syllabus & Subjects', rotation: -8, hoverStyles: { bgColor: '#17539e', textColor: '#ffffff' } },
  { label: 'marks', href: '/marks', ariaLabel: 'Subject-wise Marks', rotation: 6, hoverStyles: { bgColor: '#0b2247', textColor: '#ffffff' } },
  { label: 'gradecard', href: '/gradecard', ariaLabel: 'Gradecard & CGPA', rotation: 8, hoverStyles: { bgColor: '#e8a627', textColor: '#402d00' } },
  { label: 'admin', href: '/admin', ariaLabel: 'Admin', rotation: -6, hoverStyles: { bgColor: '#2a72c9', textColor: '#ffffff' } },
  { label: 'vit.edu', href: 'https://www.vit.edu/', ariaLabel: 'VIT official website', rotation: 8, hoverStyles: { bgColor: '#5b6b84', textColor: '#ffffff' } },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const FEATURES = [
  {
    to: '/syllabus',
    title: 'Syllabus & Subjects',
    desc: 'Official subjects and credits for every year, FY through TY.',
  },
  {
    to: '/marks',
    title: 'Subject-wise Marks',
    desc: 'See every classmate’s marks and grade, subject by subject.',
  },
  {
    to: '/gradecard',
    title: 'Gradecard & CGPA',
    desc: 'Fetch your official-style grade card and CGPA instantly.',
  },
];

export default function Home() {
  return (
    <div>
      <section className="hero">
        <div className="hero-bg" />
        <BubbleMenu
          logo={<span style={{ fontWeight: 800, color: '#0b2247', fontFamily: 'var(--font-serif)' }}>V</span>}
          items={EXPLORE_ITEMS}
          menuAriaLabel="Quick explore"
          menuBg="#ffffff"
          menuContentColor="#0b2247"
          useFixedPosition={false}
          animationEase="back.out(1.5)"
          animationDuration={0.5}
          staggerDelay={0.1}
          className="hero-bubble-menu"
          style={{ top: 'auto', bottom: '22px', left: 'auto', right: '28px', padding: 0, justifyContent: 'flex-end' }}
        />
        <motion.div
          className="hero-content"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        >
          <motion.h1 variants={fadeUp}>AIML-E Grade Card Portal</motion.h1>
          <motion.p variants={fadeUp}>
            A division-wide reference built by a classmate, for classmates: syllabus, subject-wise
            marks and a self-serve CGPA gradecard for CSAIML-E, Vishwakarma Institute of Technology.
          </motion.p>
          <motion.div className="hero-cta" variants={fadeUp}>
            <Link to="/gradecard" className="btn btn-gold">
              Find my Gradecard
            </Link>
            <Link to="/syllabus" className="btn glass hero-glass-btn">
              Browse Syllabus
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <div className="container stats-strip">
        <motion.div
          className="glass grid stats-grid"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="stat">
            <span className="num">73</span>
            <span className="label">Students</span>
          </div>
          <div className="stat">
            <span className="num">FY-TY</span>
            <span className="label">Years covered</span>
          </div>
          <div className="stat">
            <span className="num">CSAIML-E</span>
            <span className="label">Division</span>
          </div>
          <div className="stat">
            <span className="num">4</span>
            <span className="label">Semesters with results</span>
          </div>
        </motion.div>
      </div>

      <section className="section container">
        <h2 style={{ textAlign: 'center' }}>What you can do here</h2>
        <div className="grid feature-grid" style={{ marginTop: 24 }}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.to}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={fadeUp}
            >
              <Link to={f.to} className="card feature-card">
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="section container">
        <h2 style={{ textAlign: 'center' }}>Campus</h2>
        <div className="grid gallery" style={{ marginTop: 20 }}>
          {['campus-wide', 'computer-lab', 'boardroom'].map((img, i) => (
            <motion.img
              key={img}
              src={`/images/${img}.webp`}
              alt=""
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={fadeUp}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
