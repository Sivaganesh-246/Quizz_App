import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL?.replace(/\/$/, '');
const supabasePublishableKey = process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY;
export const TEACHER_LOGIN_EMAIL = 'teacher@quizmaster.local';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey)
  : null;

const request = async (table, { method = 'GET', query = '', body, prefer } = {}) => {
  if (!supabase || !supabaseUrl || !supabasePublishableKey) {
    throw new Error('Supabase is not configured. Add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_PUBLISHABLE_KEY to your .env file.');
  }

  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}${query}`, {
    method,
    headers: {
      apikey: supabasePublishableKey,
      Authorization: `Bearer ${session?.access_token || supabasePublishableKey}`,
      'Content-Type': 'application/json',
      ...(prefer ? { Prefer: prefer } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });

  if (!response.ok) {
    const details = await response.json().catch(() => null);
    throw new Error(details?.message || details?.hint || `Supabase request failed (${response.status}).`);
  }

  if (response.status === 204) return null;
  return response.json();
};

export const listCustomQuizzes = () =>
  request('quizzes', {
    query: '?category_id=is.null&select=id,title,description,icon,duration_minutes,questions&order=created_at.desc'
  });

export const listBuiltInQuizzes = () =>
  request('quizzes', {
    query: '?category_id=not.is.null&select=id,category_id,title,description,icon,duration_minutes,questions'
  });

export const ensureBuiltInQuizzes = async (quizzes) => {
  const existing = await request('quizzes', {
    query: '?category_id=not.is.null&select=category_id'
  });
  const existingCategories = new Set(existing.map((quiz) => quiz.category_id));
  const missing = quizzes.filter((quiz) => !existingCategories.has(quiz.category_id));
  if (missing.length === 0) return;

  await request('quizzes', {
    method: 'POST',
    query: '?on_conflict=category_id',
    prefer: 'resolution=ignore-duplicates,return=minimal',
    body: missing
  });
};

export const getCustomQuiz = async (id) => {
  const rows = await request('quizzes', {
    query: `?id=eq.${encodeURIComponent(id)}&select=id,category_id,title,description,icon,duration_minutes,questions`
  });
  return rows[0] || null;
};

export const createCustomQuiz = async (quiz) => {
  const rows = await request('quizzes', {
    method: 'POST',
    query: '?select=id,title',
    prefer: 'return=representation',
    body: quiz
  });
  return rows[0];
};

export const updateCustomQuiz = async (id, quiz) => {
  const rows = await request('quizzes', {
    method: 'PATCH',
    query: `?id=eq.${encodeURIComponent(id)}&category_id=is.null&select=id`,
    prefer: 'return=representation',
    body: quiz
  });
  if (rows.length === 0) throw new Error('The quiz was not updated. It may have been deleted or you may not have teacher access.');
};

export const deleteCustomQuiz = async (id) => {
  const rows = await request('quizzes', {
    method: 'DELETE',
    query: `?id=eq.${encodeURIComponent(id)}&category_id=is.null&select=id`,
    prefer: 'return=representation'
  });
  if (rows.length === 0) throw new Error('The quiz was not deleted. It may have already been removed or you may not have teacher access.');
};

export const listTeacherQuizzes = () =>
  request('quizzes', {
    query: '?category_id=is.null&select=id,title,description,icon,duration_minutes,questions,created_at&order=created_at.desc'
  });

export const createQuizAttempt = async (attempt) => {
  const rows = await request('quiz_attempts', {
    method: 'POST',
    query: '?select=id',
    prefer: 'return=representation',
    body: attempt
  });
  return rows[0];
};

export const saveAttemptStudentName = (attemptId, studentName) =>
  request('quiz_attempts', {
    method: 'PATCH',
    query: `?id=eq.${encodeURIComponent(attemptId)}`,
    prefer: 'return=minimal',
    body: { student_name: studentName }
  });

export const listQuizAttempts = () =>
  request('quiz_attempts', {
    query: '?select=id,student_name,category_name,category_icon,score,total_questions,percentage,time_spent_seconds,created_at&order=percentage.desc,time_spent_seconds.asc&limit=1000'
  });
