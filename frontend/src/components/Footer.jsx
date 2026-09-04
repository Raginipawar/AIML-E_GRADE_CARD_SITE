import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <strong>AIML-E Grade Card Portal</strong>
          <p className="muted">
            Built for the CSAIML-E division, Vishwakarma Institute of Technology, Pune.
          </p>
        </div>
        <div className="footer-links">
          <a href="/admin">Admin</a>
          <span>·</span>
          <a href="https://www.vit.edu/" target="_blank" rel="noreferrer">
            vit.edu
          </a>
        </div>
      </div>
    </footer>
  );
}
