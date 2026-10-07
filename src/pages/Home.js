import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const highlights = [
    {
      icon: '🧠',
      title: '5 Tech & General Domains',
      desc: 'Carefully curated questions in Java, Python, React.js, Computer Science, and General Knowledge.'
    },
    {
      icon: '⏱️',
      title: 'Timed Interactive Challenges',
      desc: 'Active countdown timers test both your accuracy and speed under exam-like conditions.'
    },
    {
      icon: '📊',
      title: 'Instant Detailed Scoring',
      desc: 'Get immediate pass/fail analysis, percentages, and full review of correct answers with explanations.'
    },
    {
      icon: '🏆',
      title: 'Student Leaderboard',
      desc: 'Record your name, track your achievements, and compare scores across different quiz attempts.'
    }
  ];

  return (
    <div className="page-container home-page">
      <section className="hero-section">
        <div className="hero-badge">🎓 React Single Page Application</div>
        <h1 className="hero-title">
          Master Your Skills with <span className="highlight-text">QuizMaster</span>
        </h1>
        <p className="hero-subtitle">
          An interactive, responsive online quiz platform designed for students and developers.
          Select your category, beat the countdown timer, and discover your true ranking!
        </p>

        <div className="hero-actions">
          <Link to="/categories" className="btn btn-primary btn-lg">
            🚀 Start Quiz Now
          </Link>
          <Link to="/leaderboard" className="btn btn-outline btn-lg">
            🏆 View Leaderboard
          </Link>
          <Link to="/login" className="btn btn-outline btn-lg">
            👤 Student / Teacher Login
          </Link>
        </div>

        <div className="stats-strip">
          <div className="stat-item">
            <span className="stat-number">5</span>
            <span className="stat-label">Categories</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">30+</span>
            <span className="stat-label">Questions</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">3 Min</span>
            <span className="stat-label">Per Quiz</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">100%</span>
            <span className="stat-label">SPA Flow</span>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Key Features</h2>
          <p className="section-subtitle">Everything you need for an engaging self-assessment experience</p>
        </div>

        <div className="features-grid">
          {highlights.map((item, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{item.icon}</div>
              <h3 className="feature-title">{item.title}</h3>
              <p className="feature-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="how-it-works-section">
        <div className="section-header">
          <h2 className="section-title">How It Works</h2>
        </div>
        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Select Category</h3>
            <p>Choose between Java, Python, React, General Knowledge, or Computer Science.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Answer Timed Questions</h3>
            <p>Read through multiple-choice questions and navigate before the countdown finishes.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Review & Rank</h3>
            <p>Analyze mistakes with detailed explanations and save your score to the leaderboard.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
