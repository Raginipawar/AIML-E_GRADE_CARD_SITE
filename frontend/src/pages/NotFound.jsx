import { Link } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import Ballpit from '../components/reactbits/Ballpit.jsx';

export default function NotFound() {
  return (
    <div className="container section" style={{ textAlign: 'center' }}>
      <ErrorBoundary>
        <div style={{ position: 'relative', overflow: 'hidden', minHeight: '380px', maxHeight: '380px', width: '100%', borderRadius: 'var(--radius)' }}>
          <Ballpit
            count={90}
            gravity={0.35}
            friction={0.9825}
            wallBounce={0.9}
            followCursor={true}
            colors={[0x0b2247, 0x17539e, 0xe8a627, 0x2a72c9]}
            minSize={0.4}
            maxSize={0.9}
          />
        </div>
      </ErrorBoundary>
      <h1 style={{ marginTop: 24 }}>404</h1>
      <p className="muted">That page doesn't exist. Even the balls above couldn't find it.</p>
      <Link to="/" className="btn btn-primary">
        Back to Home
      </Link>
    </div>
  );
}
