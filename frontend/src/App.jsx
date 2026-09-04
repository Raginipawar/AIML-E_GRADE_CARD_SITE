import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import SiteDock from './components/SiteDock.jsx';
import Home from './pages/Home.jsx';
import Syllabus from './pages/Syllabus.jsx';
import Marks from './pages/Marks.jsx';
import Gradecard from './pages/Gradecard.jsx';
import Admin from './pages/Admin.jsx';
import NotFound from './pages/NotFound.jsx';

const pageVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

function PageWrapper({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <>
      <Navbar />
      <main style={{ flex: 1 }}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
            <Route path="/syllabus" element={<PageWrapper><Syllabus /></PageWrapper>} />
            <Route path="/marks" element={<PageWrapper><Marks /></PageWrapper>} />
            <Route path="/gradecard" element={<PageWrapper><Gradecard /></PageWrapper>} />
            <Route path="/admin" element={<PageWrapper><Admin /></PageWrapper>} />
            <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
      <SiteDock />
    </>
  );
}
