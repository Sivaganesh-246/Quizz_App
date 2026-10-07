import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { categories, quizQuestions } from '../data/questions';
import { ensureBuiltInQuizzes, listBuiltInQuizzes, listCustomQuizzes } from '../lib/supabase';

const Categories = () => {
  const navigate = useNavigate();
  const [customQuizzes, setCustomQuizzes] = useState([]);
  const [customQuizError, setCustomQuizError] = useState('');
  const [builtInQuizzes, setBuiltInQuizzes] = useState([]);
  const [isLoadingCustomQuizzes, setIsLoadingCustomQuizzes] = useState(true);

  useEffect(() => {
    let isActive = true;
    const loadQuizzes = async () => {
      try {
        await ensureBuiltInQuizzes(categories.map((category) => ({
          category_id: category.id,
          title: category.name,
          description: category.description,
          icon: category.icon,
          duration_minutes: category.timeInMinutes,
          questions: quizQuestions[category.id]
        })));
        const [savedBuiltIns, savedCustom] = await Promise.all([
          listBuiltInQuizzes(),
          listCustomQuizzes()
        ]);
        if (isActive) {
          setBuiltInQuizzes(savedBuiltIns);
          setCustomQuizzes(savedCustom);
        }
      } catch (error) {
        if (isActive) setCustomQuizError(error.message);
      } finally {
        if (isActive) setIsLoadingCustomQuizzes(false);
      }
    };
    loadQuizzes();
    return () => {
      isActive = false;
    };
  }, []);

  const handleStartCategory = (categoryId) => {
    navigate(`/quiz/${categoryId}`);
  };

  return (
    <div className="page-container categories-page">
      <div className="page-header">
        <Link to="/" className="back-link">← Back to Home</Link>
        <h1 className="page-title">Select Quiz Category</h1>
        <p className="page-description">
          Pick your favorite subject to test your understanding. Each quiz contains multiple-choice questions with a countdown timer.
        </p>
      </div>

      <div className="categories-grid">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="category-card"
            style={{ '--cat-color': cat.color }}
          >
            <div className="category-header">
              <span className="category-icon">{cat.icon}</span>
              <span className="difficulty-pill">{cat.difficulty}</span>
            </div>

            <h3 className="category-name">{cat.name}</h3>
            <p className="category-desc">{cat.description}</p>

            <div className="category-meta">
              <div className="meta-badge">
                <span>📝</span> {cat.totalQuestions} Questions
              </div>
              <div className="meta-badge">
                <span>⏳</span> {cat.timeInMinutes} Minutes
              </div>
            </div>

            <button
              type="button"
              className="btn btn-category"
              onClick={() => {
                const savedQuiz = builtInQuizzes.find((quiz) => quiz.category_id === cat.id);
                if (savedQuiz) navigate(`/quiz/custom/${savedQuiz.id}`);
                else handleStartCategory(cat.id);
              }}
            >
              Start {cat.name} Quiz →
            </button>
          </div>
        ))}
        {customQuizzes.map((quiz) => (
          <div key={quiz.id} className="category-card custom-category-card">
            <div className="category-header">
              <span className="category-icon">{quiz.icon || '📝'}</span>
              <span className="difficulty-pill">Custom quiz</span>
            </div>
            <h3 className="category-name">{quiz.title}</h3>
            <p className="category-desc">{quiz.description}</p>
            <div className="category-meta">
              <div className="meta-badge"><span>📝</span> {quiz.questions.length} Questions</div>
              <div className="meta-badge"><span>⏳</span> {quiz.duration_minutes} Minutes</div>
            </div>
            <button
              type="button"
              className="btn btn-category"
              onClick={() => navigate(`/quiz/custom/${quiz.id}`)}
            >
              Start Quiz →
            </button>
          </div>
        ))}
      </div>
      {isLoadingCustomQuizzes && <p className="database-status">Loading quizzes saved in Supabase…</p>}
      {customQuizError && <p className="form-error" role="alert">Could not load custom quizzes: {customQuizError}</p>}
      <div className="create-quiz-prompt">
        <p>Want to create your own quiz?</p>
        <Link to="/login" className="btn btn-primary">👤 Student / Teacher Login</Link>
      </div>
    </div>
  );
};

export default Categories;
