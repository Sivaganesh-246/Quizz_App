import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { categories, quizQuestions } from '../data/questions';
import { createQuizAttempt, getCustomQuiz } from '../lib/supabase';
import QuizCard from '../components/QuizCard';
import Timer from '../components/Timer';

const Quiz = () => {
  const { categoryId, quizId } = useParams();
  const navigate = useNavigate();
  const isDatabaseQuiz = Boolean(quizId);
  const initialCategory = categories.find((category) => category.id === categoryId) || categories[0];
  const [customQuiz, setCustomQuiz] = useState(null);
  const [customQuizError, setCustomQuizError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(initialCategory.timeInMinutes * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const submittingRef = useRef(false);
  const answersRef = useRef(userAnswers);
  const timeLeftRef = useRef(timeLeft);
  answersRef.current = userAnswers;
  timeLeftRef.current = timeLeft;

  useEffect(() => {
    if (!isDatabaseQuiz) return undefined;
    let isActive = true;
    getCustomQuiz(quizId)
      .then((quiz) => {
        if (!isActive) return;
        if (!quiz) {
          setCustomQuizError('This quiz could not be found in Supabase.');
          return;
        }
        setCustomQuiz(quiz);
        setTimeLeft(quiz.duration_minutes * 60);
      })
      .catch((error) => {
        if (isActive) setCustomQuizError(error.message);
      });
    return () => {
      isActive = false;
    };
  }, [isDatabaseQuiz, quizId]);

  const currentCategory = isDatabaseQuiz
    ? {
      id: customQuiz?.id || quizId,
      name: customQuiz?.title || 'Custom Quiz',
      icon: customQuiz?.icon || '📝',
      timeInMinutes: customQuiz?.duration_minutes || 3
    }
    : categories.find((category) => category.id === categoryId) || categories[0];
  const questions = isDatabaseQuiz
    ? (customQuiz?.questions || [])
    : (quizQuestions[categoryId] || quizQuestions.java);
  const totalTimeSeconds = (currentCategory.timeInMinutes || 3) * 60;
  const isReady = !isDatabaseQuiz || Boolean(customQuiz);

  const handleSubmitQuiz = useCallback(async () => {
    if (!isReady || submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    setSubmissionError('');

    const answers = answersRef.current;
    const correctCount = questions.reduce((count, question, index) => (
      count + (answers[index] === question.correctAnswer ? 1 : 0)
    ), 0);
    const timeSpent = Math.max(0, totalTimeSeconds - timeLeftRef.current);

    try {
      const attempt = await createQuizAttempt({
        quiz_id: isDatabaseQuiz ? customQuiz.id : null,
        category_id: isDatabaseQuiz ? (customQuiz.category_id || `custom-${customQuiz.id}`) : currentCategory.id,
        category_name: currentCategory.name,
        category_icon: currentCategory.icon,
        score: correctCount,
        total_questions: questions.length,
        percentage: Math.round((correctCount / questions.length) * 100),
        time_spent_seconds: timeSpent,
        answers
      });

      navigate('/result', {
        state: {
          categoryId: isDatabaseQuiz ? (customQuiz.category_id || customQuiz.id) : currentCategory.id,
          quizId: isDatabaseQuiz ? customQuiz.id : null,
          attemptId: attempt.id,
          categoryName: currentCategory.name,
          categoryIcon: currentCategory.icon,
          questions,
          userAnswers: answers,
          timeSpent,
          totalTime: totalTimeSeconds
        }
      });
    } catch (error) {
      submittingRef.current = false;
      setIsSubmitting(false);
      setSubmissionError(`Could not save your answers to Supabase: ${error.message}`);
    }
  }, [
    currentCategory.id,
    currentCategory.name,
    currentCategory.icon,
    customQuiz,
    isDatabaseQuiz,
    isReady,
    navigate,
    questions,
    totalTimeSeconds
  ]);

  useEffect(() => {
    if (!isReady || questions.length === 0 || isSubmitting) return undefined;
    const timerInterval = setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          clearInterval(timerInterval);
          handleSubmitQuiz();
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [handleSubmitQuiz, isReady, isSubmitting, questions.length]);

  const handleSelectOption = (optionIndex) => {
    setUserAnswers((previous) => ({ ...previous, [currentIndex]: optionIndex }));
  };

  const handleClearAnswer = () => {
    setUserAnswers((previous) => {
      const updated = { ...previous };
      delete updated[currentIndex];
      return updated;
    });
  };

  if (customQuizError) {
    return (
      <div className="page-container">
        <p className="form-error" role="alert">{customQuizError}</p>
        <Link className="btn btn-primary" to="/categories">Back to Quizzes</Link>
      </div>
    );
  }

  if (!isReady) return <div className="page-container database-status">Loading quiz from Supabase…</div>;

  const answeredCount = Object.keys(userAnswers).length;
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="page-container quiz-page">
      <div className="quiz-header-bar">
        <div className="quiz-title-info">
          <span className="quiz-category-pill">{currentCategory.icon} {currentCategory.name}</span>
          <span className="quiz-progress-text">Answered {answeredCount} of {questions.length}</span>
        </div>
        <Timer timeLeft={timeLeft} totalTime={totalTimeSeconds} />
      </div>

      <div className="progress-container">
        <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      <main className="quiz-main-content">
        <QuizCard
          questionData={questions[currentIndex]}
          currentIndex={currentIndex}
          totalQuestions={questions.length}
          selectedOption={userAnswers[currentIndex]}
          onSelectOption={handleSelectOption}
        />

        {submissionError && (
          <div className="form-error submission-error" role="alert">
            <span>{submissionError}</span>
            <button type="button" className="btn btn-primary" onClick={handleSubmitQuiz}>
              Save &amp; Submit
            </button>
          </div>
        )}

        <div className="quiz-controls">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setCurrentIndex((index) => index - 1)}
            disabled={currentIndex === 0 || isSubmitting}
          >
            ← Previous
          </button>

          {userAnswers[currentIndex] !== undefined && (
            <button type="button" className="btn btn-ghost" onClick={handleClearAnswer} disabled={isSubmitting}>
              Clear Choice
            </button>
          )}

          {currentIndex < questions.length - 1 ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setCurrentIndex((index) => index + 1)}
              disabled={isSubmitting}
            >
              {userAnswers[currentIndex] !== undefined ? 'Save Answer & Next →' : 'Next →'}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-submit"
              onClick={() => setShowConfirmModal(true)}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving…' : 'Finish & Submit Quiz ✓'}
            </button>
          )}
        </div>

        <div className="question-palette">
          <span className="palette-title">Question Navigator:</span>
          <div className="palette-grid">
            {questions.map((_, index) => {
              const isAnswered = userAnswers[index] !== undefined;
              const isCurrent = index === currentIndex;
              return (
                <button
                  key={index}
                  type="button"
                  className={`palette-num ${isCurrent ? 'current' : ''} ${isAnswered ? 'answered' : ''}`}
                  onClick={() => setCurrentIndex(index)}
                  disabled={isSubmitting}
                  title={`Go to Question ${index + 1}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {showConfirmModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Submit Quiz Confirmation</h3>
            <p>You have answered <strong>{answeredCount}</strong> out of <strong>{questions.length}</strong> questions.</p>
            {answeredCount < questions.length && (
              <p className="modal-warning">
                ⚠️ You have {questions.length - answeredCount} unanswered question(s). Are you sure you want to finish now?
              </p>
            )}
            {submissionError && <p className="form-error" role="alert">{submissionError}</p>}
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
              >
                Keep Answering
              </button>
              <button type="button" className="btn btn-submit" onClick={handleSubmitQuiz} disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Yes, Submit Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;
