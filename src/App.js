import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
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
import StudentQuizzes from './pages/student/StudentQuizzes';
import TakeQuiz from './pages/student/TakeQuiz';
import QuizResults from './pages/student/QuizResults'; // Add this import
import StudentCourses from './pages/student/StudentCourses';
import ProfileSettings from './pages/student/ProfileSettings'; // Import the new ProfileSettings component

// Mentor pages
import MentorDashboard from './pages/mentor/Dashboard';
import StudentView from './pages/mentor/StudentView';
import Reports from './pages/mentor/Reports';
import ManageQuizzes from './pages/mentor/ManageQuizzes';
import QuizSubmissions from './pages/mentor/QuizSubmissions';
import CreateQuiz from './pages/mentor/CreateQuiz';
import AssignToStudents from './pages/mentor/AssignToStudents';

// Course selection page
import CourseSelectionPage from './pages/auth/CourseSelectionPage';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
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
            <Route path="/student/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/courses" element={<ProtectedRoute><StudentCourses /></ProtectedRoute>} />
            <Route path="/student/course/:courseId" element={<ProtectedRoute><CourseView /></ProtectedRoute>} />
            <Route path="/student/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
            <Route path="/student/interview-prep" element={<ProtectedRoute><InterviewPrep /></ProtectedRoute>} />
            <Route path="/student/quiz/:quizId" element={<ProtectedRoute><QuizAttempt /></ProtectedRoute>} />
            <Route path="/student/quizzes" element={<ProtectedRoute><StudentQuizzes /></ProtectedRoute>} />
            <Route path="/student/quizzes/:quizId/take/:assignmentId" element={<ProtectedRoute><TakeQuiz /></ProtectedRoute>} />
            <Route path="/student/quizzes/:quizId/results/:assignmentId" element={<ProtectedRoute><QuizResults /></ProtectedRoute>} />
            
            {/* Add the new profile settings route */}
            <Route path="/student/profile" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
            
            {/* Mentor Routes with protection */}
            <Route path="/mentor/dashboard" element={<MentorDashboard />} />
            <Route path="/mentor/student/:studentId" element={<StudentView />} />
            <Route path="/mentor/reports" element={<Reports />} />
            <Route path="/mentor/quizzes" element={<ManageQuizzes />} />
            <Route path="/mentor/create-quiz" element={<CreateQuiz />} />
            <Route path="/mentor/quiz-submissions/:quizId" element={<QuizSubmissions />} />
            <Route path="/mentor/assign-to-students" element={<AssignToStudents />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Protected Course Selection Route */}
            <Route 
              path="/course-selection" 
              element={
                <ProtectedRoute>
                  <CourseSelectionPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
