import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createCustomQuiz, getCustomQuiz, updateCustomQuiz } from '../lib/supabase';

const createQuestion = (id) => ({
  id,
  question: '',
  options: ['', '', '', ''],
  correctAnswer: 0,
  explanation: ''
});

const CreateQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(quizId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(3);
  const [questions, setQuestions] = useState([createQuestion(1)]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [createdQuiz, setCreatedQuiz] = useState(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(isEditing);

  useEffect(() => {
    if (!quizId) return undefined;
    let isActive = true;
    getCustomQuiz(quizId)
      .then((quiz) => {
        if (!isActive) return;
        if (!quiz || quiz.category_id !== null) {
          setError('This teacher-created quiz could not be found.');
          return;
        }
        setTitle(quiz.title);
        setDescription(quiz.description);
        setDuration(quiz.duration_minutes);
        setQuestions(quiz.questions);
      })
      .catch((loadError) => {
        if (isActive) setError(loadError.message);
      })
      .finally(() => {
        if (isActive) setIsLoadingQuiz(false);
      });
    return () => {
      isActive = false;
    };
  }, [quizId]);

  const updateQuestion = (index, field, value) => {
    setQuestions((previous) => previous.map((question, questionIndex) => (
      questionIndex === index ? { ...question, [field]: value } : question
    )));
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    setQuestions((previous) => previous.map((question, index) => {
      if (index !== questionIndex) return question;
      const options = question.options.map((option, currentOption) => (
        currentOption === optionIndex ? value : option
      ));
      return { ...question, options };
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (
      !title.trim()
      || !description.trim()
      || questions.some((question) => (
        !question.question.trim() || question.options.some((option) => !option.trim())
      ))
    ) {
      setError('Complete the quiz details, question text, and all four answer options before saving.');
      return;
    }
    setIsSaving(true);
    setError('');
    setCreatedQuiz(null);

    try {
      const quizData = {
        title: title.trim(),
        description: description.trim(),
        icon: '📝',
        duration_minutes: Number(duration),
        questions: questions.map((question, index) => ({
          ...question,
          id: index + 1,
          question: question.question.trim(),
          options: question.options.map((option) => option.trim()),
          explanation: question.explanation.trim()
        }))
      };
      if (isEditing) {
        await updateCustomQuiz(quizId, quizData);
        navigate('/teacher/quizzes', { state: { message: `Updated "${title.trim()}".` } });
      } else {
        const savedQuiz = await createCustomQuiz(quizData);
        setCreatedQuiz(savedQuiz);
      }
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-container create-quiz-page">
      <div className="page-header">
        <Link to={isEditing ? '/teacher/quizzes' : '/categories'} className="back-link">
          ← {isEditing ? 'Back to Quiz Manager' : 'Back to Quizzes'}
        </Link>
        <h1 className="page-title">{isEditing ? 'Edit Quiz' : 'Add a New Quiz'}</h1>
        <p className="page-description">
          {isEditing ? 'Update this quiz and save your changes to Supabase.' : 'Create a multiple-choice quiz and save it to Supabase for students to take.'}
        </p>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}
      {isLoadingQuiz ? (
        <p className="database-status">Loading quiz…</p>
      ) : (
      <>
      {createdQuiz && (
        <div className="form-success" role="status">
          Quiz saved to Supabase. <Link to={`/quiz/custom/${createdQuiz.id}`}>Take “{createdQuiz.title}” →</Link>
        </div>
      )}

      <form className="quiz-builder-form" onSubmit={handleSubmit}>
        <section className="builder-section">
          <h2>Quiz details</h2>
          <label className="form-label" htmlFor="quiz-title">Quiz title</label>
          <input
            id="quiz-title"
            className="input-text builder-input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={120}
            required
          />
          <label className="form-label" htmlFor="quiz-description">Description</label>
          <textarea
            id="quiz-description"
            className="input-text builder-input"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={500}
            rows={3}
            required
          />
          <label className="form-label" htmlFor="quiz-duration">Time limit (minutes)</label>
          <input
            id="quiz-duration"
            className="input-text builder-input duration-input"
            type="number"
            min="1"
            max="180"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            required
          />
        </section>

        <div className="builder-heading">
          <h2>Questions</h2>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setQuestions((previous) => [...previous, createQuestion(Date.now())])}
          >
            + Add Question
          </button>
        </div>

        {questions.map((question, questionIndex) => (
          <section className="builder-section question-editor" key={question.id}>
            <div className="builder-heading">
              <h3>Question {questionIndex + 1}</h3>
              {questions.length > 1 && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setQuestions((previous) => previous.filter((_, index) => index !== questionIndex))}
                  aria-label={`Remove question ${questionIndex + 1}`}
                >
                  Remove
                </button>
              )}
            </div>
            <label className="form-label" htmlFor={`question-${questionIndex}`}>Question text</label>
            <textarea
              id={`question-${questionIndex}`}
              className="input-text builder-input"
              value={question.question}
              onChange={(event) => updateQuestion(questionIndex, 'question', event.target.value)}
              rows={2}
              required
            />
            <fieldset className="options-editor">
              <legend className="form-label">Answer options — select the correct answer</legend>
              {question.options.map((option, optionIndex) => (
                <div className="builder-option-row" key={optionIndex}>
                  <input
                    type="radio"
                    name={`correct-answer-${questionIndex}`}
                    aria-label={`Mark option ${optionIndex + 1} as correct`}
                    checked={question.correctAnswer === optionIndex}
                    onChange={() => updateQuestion(questionIndex, 'correctAnswer', optionIndex)}
                  />
                  <input
                    className="input-text builder-input"
                    value={option}
                    onChange={(event) => updateOption(questionIndex, optionIndex, event.target.value)}
                    placeholder={`Option ${optionIndex + 1}`}
                    aria-label={`Question ${questionIndex + 1}, option ${optionIndex + 1}`}
                    required
                  />
                </div>
              ))}
            </fieldset>
            <label className="form-label" htmlFor={`explanation-${questionIndex}`}>Explanation (optional)</label>
            <textarea
              id={`explanation-${questionIndex}`}
              className="input-text builder-input"
              value={question.explanation}
              onChange={(event) => updateQuestion(questionIndex, 'explanation', event.target.value)}
              rows={2}
            />
          </section>
        ))}

        <button type="submit" className="btn btn-primary btn-lg" disabled={isSaving}>
          {isSaving ? 'Saving…' : isEditing ? 'Save Quiz Changes' : 'Save Quiz to Supabase'}
        </button>
      </form>
      </>
      )}
    </div>
  );
};

export default CreateQuiz;
