import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Categories from './pages/Categories';
import Quiz from './pages/Quiz';
import Result from './pages/Result';
import Leaderboard from './pages/Leaderboard';
import CreateQuiz from './pages/CreateQuiz';
import Login from './pages/Login';
import TeacherQuizzes from './pages/TeacherQuizzes';
import { AuthProvider, useAuth } from './auth/AuthContext';
import './App.css';

const TeacherOnly = ({ children }) => {
  const { isLoading, isTeacher } = useAuth();
  if (isLoading) return <div className="page-container database-status">Checking teacher session…</div>;
  return isTeacher ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const { isLoading, isTeacher, signOut } = useAuth();

  return (
    <Router>
      <div className="app-shell">
        <Navbar isTeacher={!isLoading && isTeacher} onSignOut={signOut} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/quiz/:categoryId" element={<Quiz />} />
            <Route path="/quiz/custom/:quizId" element={<Quiz />} />
            <Route path="/result" element={<Result />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/create-quiz" element={<TeacherOnly><CreateQuiz /></TeacherOnly>} />
            <Route path="/teacher/quizzes" element={<TeacherOnly><TeacherQuizzes /></TeacherOnly>} />
            <Route path="/teacher/quizzes/:quizId/edit" element={<TeacherOnly><CreateQuiz /></TeacherOnly>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

function App() {
  return <AuthProvider><AppRoutes /></AuthProvider>;
}

export default App;
