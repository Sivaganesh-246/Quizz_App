import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listQuizAttempts } from '../lib/supabase';

const Leaderboard = () => {
  const [scores, setScores] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;
    listQuizAttempts()
      .then((attempts) => {
        if (!isActive) return;
        setScores(attempts.map((attempt) => ({
          id: attempt.id,
          name: attempt.student_name || 'Anonymous student',
          category: attempt.category_name,
          categoryIcon: attempt.category_icon,
          score: attempt.score,
          total: attempt.total_questions,
          percentage: attempt.percentage,
          status: attempt.percentage >= 50 ? 'PASS' : 'FAIL',
          timeSpent: `${Math.floor(attempt.time_spent_seconds / 60)}m ${attempt.time_spent_seconds % 60}s`,
          date: new Date(attempt.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
        })));
      })
      .catch((loadError) => {
        if (isActive) setError(loadError.message);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, []);

  const filteredScores = scores.filter((item) => {
    if (selectedFilter === 'All') return true;
    return item.category.toLowerCase().includes(selectedFilter.toLowerCase());
  });

  const getRankBadge = (index) => {
    if (index === 0) return <span className="rank-badge rank-1">🥇 1st</span>;
    if (index === 1) return <span className="rank-badge rank-2">🥈 2nd</span>;
    if (index === 2) return <span className="rank-badge rank-3">🥉 3rd</span>;
    return <span className="rank-badge rank-other">#{index + 1}</span>;
  };

  return (
    <div className="page-container leaderboard-page">
      <div className="page-header">
        <h1 className="page-title">🏆 Quiz Leaderboard</h1>
        <p className="page-description">Top scoring students ranked by percentage, score, and completion speed.</p>
      </div>

      <div className="leaderboard-controls">
        <div className="category-tabs">
          {['All', 'Java', 'Python', 'React', 'Computer Science', 'General Knowledge'].map((category) => (
            <button
              key={category}
              type="button"
              className={`filter-tab ${selectedFilter === category ? 'active' : ''}`}
              onClick={() => setSelectedFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <p className="database-status">Loading scores from Supabase…</p>}
      {error && <p className="form-error" role="alert">Could not load leaderboard: {error}</p>}
      {!isLoading && !error && filteredScores.length === 0 ? (
        <div className="empty-leaderboard">
          <p>No records found for the selected category.</p>
          <Link to="/categories" className="btn btn-primary mt-2">Be the First to Play! 🚀</Link>
        </div>
      ) : !isLoading && !error && (
        <div className="table-wrapper">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Student Name</th>
                <th>Category</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Status</th>
                <th>Time</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredScores.map((entry, index) => (
                <tr key={entry.id} className={index < 3 ? `top-row top-${index + 1}` : ''}>
                  <td>{getRankBadge(index)}</td>
                  <td><strong>{entry.name}</strong></td>
                  <td><span className="cat-chip">{entry.categoryIcon || '🎯'} {entry.category}</span></td>
                  <td><span className="score-pill">{entry.score} / {entry.total}</span></td>
                  <td>
                    <div className="score-bar-inline">
                      <span>{entry.percentage}%</span>
                      <div className="mini-progress">
                        <div
                          className="mini-fill"
                          style={{
                            width: `${entry.percentage}%`,
                            backgroundColor: entry.percentage >= 80 ? '#10b981' : entry.percentage >= 50 ? '#f59e0b' : '#ef4444'
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td><span className={`status-pill ${entry.status === 'PASS' ? 'pass' : 'fail'}`}>{entry.status}</span></td>
                  <td>{entry.timeSpent}</td>
                  <td>{entry.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="leaderboard-cta">
        <p>Think you can score higher?</p>
        <Link to="/categories" className="btn btn-primary btn-lg">Take a Quiz Now →</Link>
      </div>
    </div>
  );
};

export default Leaderboard;
