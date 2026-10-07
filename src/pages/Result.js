import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { saveAttemptStudentName } from '../lib/supabase';

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state;

  const [studentName, setStudentName] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // If page accessed directly without quiz state, provide fallback redirect
  if (!state || !state.questions) {
    return (
      <div className="page-container result-page fallback">
        <div className="result-card text-center">
          <h2>No Active Quiz Results Found</h2>
          <p>Please take a quiz first to view your score and performance report.</p>
          <Link to="/categories" className="btn btn-primary mt-4">
            Go to Categories
          </Link>
        </div>
      </div>
    );
  }

  const {
    categoryId,
    categoryName,
    categoryIcon,
    quizId,
    attemptId,
    questions,
    userAnswers,
    timeSpent
  } = state;

  // Calculate scores
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;

  questions.forEach((q, index) => {
    const userChoice = userAnswers[index];
    if (userChoice === undefined) {
      skippedCount++;
    } else if (userChoice === q.correctAnswer) {
      correctCount++;
    } else {
      wrongCount++;
    }
  });

  const totalQuestions = questions.length;
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const isPass = percentage >= 50;

  const minutesSpent = Math.floor(timeSpent / 60);
  const secondsSpent = timeSpent % 60;
  const formattedTimeSpent = `${minutesSpent}m ${secondsSpent}s`;

  // Save to Leaderboard
  const handleSaveToLeaderboard = async (e) => {
    e.preventDefault();
    if (!studentName.trim() || !attemptId || isSaving) return;
    setIsSaving(true);
    setSaveError('');
    try {
      await saveAttemptStudentName(attemptId, studentName.trim());
      setIsSaved(true);
    } catch (error) {
      setSaveError(`Could not save your name to Supabase: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-container result-page">
      <div className="result-card">
        {/* Header Badge */}
        <div className="result-badge-container">
          <span className={`status-badge ${isPass ? 'badge-pass' : 'badge-fail'}`}>
            {isPass ? '🎉 PASSED' : '⚠️ NEEDS IMPROVEMENT'}
          </span>
          <span className="category-tag">
            {categoryIcon} {categoryName}
          </span>
        </div>

        <h1 className="result-title">
          {isPass ? 'Congratulations! Great Effort!' : 'Good Try! Keep Practicing!'}
        </h1>
        <p className="result-subtitle">
          Here is your comprehensive performance analysis for the {categoryName} quiz.
        </p>

        {/* Circular / Score Highlight */}
        <div className="score-hero-circle">
          <div className="score-circle-inner">
            <span className="big-percentage">{percentage}%</span>
            <span className="score-ratio">{correctCount} / {totalQuestions} Correct</span>
          </div>
        </div>

        {/* 4 Stat Boxes */}
        <div className="result-stats-grid">
          <div className="stat-box box-total">
            <span className="box-val">{totalQuestions}</span>
            <span className="box-lbl">Total Questions</span>
          </div>
          <div className="stat-box box-correct">
            <span className="box-val">{correctCount}</span>
            <span className="box-lbl">Correct</span>
          </div>
          <div className="stat-box box-wrong">
            <span className="box-val">{wrongCount}</span>
            <span className="box-lbl">Wrong</span>
          </div>
          <div className="stat-box box-time">
            <span className="box-val">{formattedTimeSpent}</span>
            <span className="box-lbl">Time Taken</span>
          </div>
        </div>

        {/* Leaderboard Submission Form */}
        <div className="leaderboard-save-section">
          {!isSaved ? (
            <form onSubmit={handleSaveToLeaderboard} className="save-form">
              <label htmlFor="student-name" className="form-label">
                Enter your name to add your saved score to the Leaderboard:
              </label>
              <div className="input-row">
                <input
                  id="student-name"
                  type="text"
                  placeholder="e.g. Sabari / Alex Doe"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="input-text"
                  maxLength={120}
                  required
                />
                <button type="submit" className="btn btn-save" disabled={isSaving}>
                  {isSaving ? 'Saving…' : 'Save Name 💾'}
                </button>
              </div>
              {saveError && <p className="form-error" role="alert">{saveError}</p>}
            </form>
          ) : (
            <div className="save-success">
              <span>✅ Your score has been added to the Leaderboard!</span>
              <button
                type="button"
                className="btn btn-sm btn-link"
                onClick={() => navigate('/leaderboard')}
              >
                View Leaderboard →
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="result-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate(quizId ? `/quiz/custom/${quizId}` : `/quiz/${categoryId}`)}
          >
            🔄 Retake Quiz
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/categories')}
          >
            📚 Change Category
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setShowExplanation(!showExplanation)}
          >
            {showExplanation ? 'Hide Answer Review ▲' : 'Review Questions & Explanations ▼'}
          </button>
        </div>

        {/* Detailed Question Review */}
        {showExplanation && (
          <div className="detailed-review-section">
            <h2 className="review-title">Detailed Question Review</h2>
            <div className="review-list">
              {questions.map((q, idx) => {
                const userChoice = userAnswers[idx];
                const isCorrect = userChoice === q.correctAnswer;
                const isUnanswered = userChoice === undefined;

                return (
                  <div
                    key={q.id}
                    className={`review-item ${isCorrect ? 'review-correct' : isUnanswered ? 'review-unanswered' : 'review-wrong'}`}
                  >
                    <div className="review-item-header">
                      <span className="q-number">Question {idx + 1}</span>
                      <span className="q-verdict">
                        {isCorrect ? '✓ Correct (+1)' : isUnanswered ? '○ Unanswered (0)' : '✗ Incorrect (0)'}
                      </span>
                    </div>

                    <p className="q-prompt">{q.question}</p>

                    <div className="review-options">
                      {q.options.map((opt, optIdx) => {
                        let optClass = 'review-opt';
                        if (optIdx === q.correctAnswer) {
                          optClass += ' opt-correct';
                        }
                        if (userChoice === optIdx && !isCorrect) {
                          optClass += ' opt-user-wrong';
                        }
                        return (
                          <div key={optIdx} className={optClass}>
                            <span className="opt-marker">
                              {['A', 'B', 'C', 'D'][optIdx]}
                            </span>
                            <span className="opt-text">{opt}</span>
                            {optIdx === q.correctAnswer && <span className="opt-tag">✓ Correct Answer</span>}
                            {userChoice === optIdx && !isCorrect && <span className="opt-tag tag-wrong">Your Answer</span>}
                          </div>
                        );
                      })}
                    </div>

                    <div className="review-explanation">
                      <strong>💡 Explanation: </strong>
                      {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Result;
