import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Unauthorized from './pages/Unauthorized';
import DirectAdminAccess from './pages/DirectAdminAccess';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageCourses from './pages/admin/ManageCourses';
import ManageStudents from './pages/admin/ManageStudents';
import ManageMentors from './pages/admin/ManageMentors';
import ManageEnrollments from './pages/admin/ManageEnrollments';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import CourseView from './pages/student/CourseView';
import Progress from './pages/student/Progress';
import InterviewPrep from './pages/student/InterviewPrep';
import QuizAttempt from './pages/student/QuizAttempt';

// Mentor pages
import MentorDashboard from './pages/mentor/Dashboard';
import StudentView from './pages/mentor/StudentView';
import Reports from './pages/mentor/Reports';
import ManageQuizzes from './pages/mentor/ManageQuizzes';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Emergency Admin Access */}
          <Route path="/emergency-admin" element={<DirectAdminAccess />} />
          
          {/* DIRECT ACCESS ROUTES FOR TESTING - Remove in production */}
          <Route path="/direct-admin" element={<AdminDashboard />} />
          <Route path="/direct-admin/courses" element={<ManageCourses />} />
          <Route path="/direct-admin/students" element={<ManageStudents />} />
          <Route path="/direct-admin/mentors" element={<ManageMentors />} />
          
          {/* Admin Routes - simplified protection for initial setup */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/courses" element={<ManageCourses />} />
          <Route path="/admin/students" element={<ManageStudents />} />
          <Route path="/admin/mentors" element={<ManageMentors />} />
          <Route path="/admin/enrollments" element={<ManageEnrollments />} />
          <Route path="/admin/payments" element={<AdminDashboard />} />
          
          {/* Student Routes with protection */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/course/:courseId" element={<CourseView />} />
          <Route path="/student/progress" element={<Progress />} />
          <Route path="/student/interview-prep" element={<InterviewPrep />} />
          <Route path="/student/quiz/:quizId" element={<QuizAttempt />} />
          
          {/* Mentor Routes with protection */}
          <Route path="/mentor/dashboard" element={<MentorDashboard />} />
          <Route path="/mentor/student/:studentId" element={<StudentView />} />
          <Route path="/mentor/reports" element={<Reports />} />
          <Route path="/mentor/quizzes" element={<ManageQuizzes />} /> {/* New route */}
          
          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
