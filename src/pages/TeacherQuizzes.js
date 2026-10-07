import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { deleteCustomQuiz, listTeacherQuizzes } from '../lib/supabase';

const TeacherQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deletingQuizId, setDeletingQuizId] = useState('');
  const location = useLocation();

  const loadQuizzes = useCallback(async () => {
    setError('');
    setIsLoading(true);
    try {
      setQuizzes(await listTeacherQuizzes());
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  const handleDelete = async (quiz) => {
    if (!window.confirm(`Delete "${quiz.title}"? This cannot be undone.`)) return;
    setDeletingQuizId(quiz.id);
    setError('');
    try {
      await deleteCustomQuiz(quiz.id);
      setQuizzes((previous) => previous.filter((item) => item.id !== quiz.id));
    } catch (deleteError) {
      setError(`Could not delete quiz: ${deleteError.message}`);
    } finally {
      setDeletingQuizId('');
    }
  };

  return (
    <div className="page-container teacher-quizzes-page">
      <div className="page-header">
        <h1 className="page-title">Teacher Quiz Manager</h1>
        <p className="page-description">Create, edit, and delete the quizzes you have added.</p>
      </div>
      {location.state?.message && <p className="form-success" role="status">{location.state.message}</p>}
      <div className="teacher-manager-actions">
        <Link to="/create-quiz" className="btn btn-primary">＋ Add New Quiz</Link>
        <button type="button" className="btn btn-outline" onClick={loadQuizzes} disabled={isLoading}>
          Refresh
        </button>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      {isLoading ? (
        <p className="database-status">Loading your quizzes…</p>
      ) : quizzes.length === 0 ? (
        <div className="empty-leaderboard">
          <p>You have not created any quizzes yet.</p>
          <Link to="/create-quiz" className="btn btn-primary mt-2">Create your first quiz</Link>
        </div>
      ) : (
        <div className="teacher-quiz-list">
          {quizzes.map((quiz) => (
            <article className="builder-section teacher-quiz-row" key={quiz.id}>
              <div>
                <h2>{quiz.icon || '📝'} {quiz.title}</h2>
                <p>{quiz.description}</p>
                <span className="quiz-progress-text">
                  {quiz.questions.length} questions · {quiz.duration_minutes} minutes
                </span>
              </div>
              <div className="teacher-quiz-actions">
                <Link to={`/teacher/quizzes/${quiz.id}/edit`} className="btn btn-outline">Edit</Link>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleDelete(quiz)}
                  disabled={deletingQuizId === quiz.id}
                >
                  {deletingQuizId === quiz.id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherQuizzes;
