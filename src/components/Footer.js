import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-branding">
          <p className="footer-title">🎯 Online Quiz Single Page Application</p>
          <p className="footer-subtitle">Built with React.js, Supabase, React Router, Hooks & Modern CSS</p>
        </div>
        <div className="footer-badges">
          <span className="tech-pill">React 18</span>
          <span className="tech-pill">React Router v6</span>
          <span className="tech-pill">Supabase Database</span>
          <span className="tech-pill">Responsive Design</span>
        </div>
        <div className="footer-copy">
          <p>© {new Date().getFullYear()} QuizMaster College Project. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
