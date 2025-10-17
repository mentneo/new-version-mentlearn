import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LearnIQRoutes from './LearnIQRoutes';
// Import protected route components
import { ProtectedRoute, PaymentProtectedRoute } from './components/ProtectedRoutes';
import CreatorRoute from './components/CreatorRoute';
import AdminLayout from './components/layouts/AdminLayout';
import CreatorLayout from './components/layouts/CreatorLayout';
import ExternalRedirect from './components/ExternalRedirect';
import RoleBasedRedirect from './components/RoleBasedRedirect';

// Public pages
import Home from './pages/Home';
import LandingPage from './pages/LandingPage';
import AboutUs from './pages/AboutUs'; // Import the new About Us page
import CookiesPage from './pages/CookiesPage'; // Import our cookies page
import Login from './pages/Login';
import ModernLogin from './pages/ModernLogin';
import NewLoginPage from './pages/NewLoginPage'; // Import our new login page
import GradientLogin from './pages/GradientLogin'; // Import our gradient login page
import Signup from './pages/Signup';
import NewSignupPage from './pages/NewSignupPage'; // Import our new signup page
import GradientSignup from './pages/GradientSignup'; // Import our gradient signup page
import FullStackCoursePage from './pages/FullStackCoursePage'; // Import our new course landing page
import ForgotPassword from './pages/ForgotPassword';
import Unauthorized from './pages/Unauthorized';
import DirectAdminAccess from './pages/DirectAdminAccess';
import DebugPage from './pages/DebugPage';
import DebugAdvanced from './pages/DebugAdvanced';
import SimpleDashboard from './pages/SimpleDashboard';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CancellationRefunds from './pages/CancellationRefunds';
import Shipping from './pages/Shipping';
import BookDemo from './pages/BookDemo';
import HireFromUs from './pages/HireFromUs'; // Import the Hire From Us page
import Reviews from './pages/Reviews';
import Academy from './pages/Academy'; // <-- Add this import
import TechWave from './pages/TechWave'; // Import TechWave page
import ChatUs from './pages/ChatUs'; // Import ChatUs page
import TechCareer from './pages/TechCareer'; // Import TechCareer page
import CreateTestCreator from './pages/CreateTestCreator'; // Import Create Test Creator page
import CreateTestCreatorDirect from './pages/CreateTestCreatorDirect'; // Import Direct Test Creator page

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import NewDashboard from './pages/admin/NewDashboard.js';
import ManageCreators from './pages/admin/ManageCreators';
import ManageCourses from './pages/admin/ManageCourses';
import ManageStudents from './pages/admin/ManageStudents';
import ManageMentors from './pages/admin/ManageMentors';
import ManageEnrollments from './pages/admin/ManageEnrollments';
import VerifyPayments from './pages/admin/VerifyPayments';
import DataAnalystDashboard from './pages/admin/DataAnalystDashboard';
import SupportTickets from './pages/admin/SupportTickets';

// Student pages - Modern LearnIQ Templates Only
// Old pages have been removed - using LearnIQ templates from LearnIQRoutes.js
import InterviewPrep from './pages/student/InterviewPrep';
import QuizAttempt from './pages/student/QuizAttempt';
import StudentQuizzes from './pages/student/StudentQuizzes';
import ReferAndEarn from './pages/student/ReferAndEarn';
import TakeQuiz from './pages/student/TakeQuiz';
import QuizResults from './pages/student/QuizResults';
import StudentCourses from './pages/student/StudentCourses';
import CourseContent from './pages/student/CourseContent';
import PaymentSuccessPage from './pages/payment/PaymentSuccessPage';
import CourseEnrollment from './pages/student/CourseEnrollment';
import CoursePaymentSuccess from './pages/student/CoursePaymentSuccess';
import LearnIQSupport from './pages/student/LearnIQSupport';
import LearnIQSettings from './pages/student/LearnIQSettings';
import CourseDebugger from './pages/student/CourseDebugger';

// Mentor pages
import MentorDashboard from './pages/mentor/Dashboard';
import StudentView from './pages/mentor/StudentView';
import Reports from './pages/mentor/Reports';
import ManageQuizzes from './pages/mentor/ManageQuizzes';
import QuizSubmissions from './pages/mentor/QuizSubmissions';
import CreateQuiz from './pages/mentor/CreateQuiz';
import AssignToStudents from './pages/mentor/AssignToStudents';
// New mentor pages with student-like features
import MentorAssignments from './pages/mentor/MentorAssignments';
import MentorAssignmentDetail from './pages/mentor/AssignmentDetail';
import MentorNotifications from './pages/mentor/MentorNotifications';
import MentorCalendar from './pages/mentor/MentorCalendar';
import MentorProgress from './pages/mentor/MentorProgress';
import StudentAssignmentDetail from './pages/student/AssignmentDetail';

// Creator pages
import CreatorDashboard from './pages/creator/Dashboard';
import CreatorCourses from './pages/creator/Courses';
import CreatorProfile from './pages/creator/Profile';
import CreatorEnrollments from './pages/creator/Enrollments';

// Create route protection components for different roles
function AdminRoute({ children }) {
  const { userRole } = useAuth();
  
  if (userRole !== 'admin') {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
}

function DataAnalystRoute({ children }) {
  const { userRole } = useAuth();
  
  if (userRole !== 'data_analyst' && userRole !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
}

// Create a redirect component instead of defining DataAnalystAccess twice
function AnalyticsRedirect() {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (userRole === 'admin' || userRole === 'data_analyst') {
      navigate('/data-analyst/dashboard');
    } else {
      navigate('/unauthorized');
    }
  }, [currentUser, userRole, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Data Analytics Dashboard...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/home-classic" element={<LandingPage />} />
              <Route path="/home-old" element={<Home />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/courses/full-stack-development" element={<FullStackCoursePage />} />
              <Route path="/login" element={<GradientLogin />} />
              <Route path="/signup" element={<GradientSignup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/login-old" element={<Login />} />
              <Route path="/modern-login" element={<ModernLogin />} />
              <Route path="/new-login" element={<NewLoginPage />} />
              <Route path="/signup-old" element={<Signup />} />
              <Route path="/new-signup" element={<NewSignupPage />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/debug" element={<DebugPage />} />
              <Route path="/debug-advanced" element={<DebugAdvanced />} />
              <Route path="/simple" element={<SimpleDashboard />} />
              <Route path="/terms" element={<TermsAndConditions />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/cancellation-refunds" element={<CancellationRefunds />} />
              <Route path="/shipping" element={<Shipping />} />
              <Route path="/cookies" element={<CookiesPage />} />
              <Route path="/abhi" element={<ExternalRedirect to="https://mentneodashboard.vercel.app/login" />} />
              <Route path="/demo" element={<BookDemo />} />
              <Route path="/hire-from-us" element={<HireFromUs />} />
              <Route path="/reviews" element={<Reviews />} />
              {/* Add this route for Academy page */}
              <Route path="/courses/academy" element={<Academy />} />
              <Route path="/courses/techwave" element={<TechWave />} />
              <Route path="/courses/tech-career" element={<TechCareer />} />
              <Route path="/chat-us" element={<ChatUs />} />
              <Route path="/create-test-creator" element={<CreateTestCreator />} />
              <Route path="/create-test-creator-direct" element={<CreateTestCreatorDirect />} />
              
              {/* Emergency Admin Access */}
              <Route path="/emergency-admin" element={<DirectAdminAccess />} />
              
              {/* Admin Routes with new layout */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<NewDashboard />} />
                <Route path="courses" element={<ManageCourses />} />
                <Route path="students" element={<ManageStudents />} />
                <Route path="mentors" element={<ManageMentors />} />
                <Route path="creators" element={<ManageCreators />} />
                <Route path="enrollments" element={<ManageEnrollments />} />
                <Route path="payments" element={<VerifyPayments />} />
                <Route path="verify-payments" element={<VerifyPayments />} />
                <Route path="reports" element={<NewDashboard />} />
                <Route path="settings" element={<NewDashboard />} />
              </Route>
              
              {/* Legacy Admin Routes */}
              <Route path="/admin-old/dashboard" element={<AdminDashboard />} />
              <Route path="/admin-old/courses" element={<ManageCourses />} />
              <Route path="/admin-old/students" element={<ManageStudents />} />
              <Route path="/admin-old/mentors" element={<ManageMentors />} />
              <Route path="/admin-old/enrollments" element={<ManageEnrollments />} />
              <Route path="/admin-old/payments" element={<AdminDashboard />} />
              <Route path="/admin-old/verify-payments" element={<VerifyPayments />} />

              {/* Creator Routes */}
              <Route path="/creator" element={<CreatorRoute><CreatorLayout /></CreatorRoute>}>
                <Route path="dashboard" element={<CreatorDashboard />} />
                <Route path="courses" element={<CreatorCourses />} />
                <Route path="enrollments" element={<CreatorEnrollments />} />
                <Route path="profile" element={<CreatorProfile />} />
              </Route>
            
            {/* Student Routes - Using Modern LearnIQ Templates */}
            {/* LearnIQ Dashboard Routes */}
            <Route path="/student/*" element={<LearnIQRoutes />} />
            
            {/* Legacy redirects to LearnIQ templates */}
            <Route path="/student/dashboard" element={<Navigate to="/student/student-dashboard" replace />} />
            <Route path="/student/new-dashboard" element={<Navigate to="/student/student-dashboard" replace />} />
            <Route path="/student/simple-dashboard" element={<Navigate to="/student/student-dashboard" replace />} />
            
            {/* Keep essential functional pages */}
            <Route path="/student/courses" element={<ProtectedRoute><StudentCourses /></ProtectedRoute>} />
            <Route path="/student/enroll/:courseId" element={<ProtectedRoute><CourseEnrollment /></ProtectedRoute>} />
            <Route path="/payment/success" element={<ProtectedRoute><CoursePaymentSuccess /></ProtectedRoute>} />
            <Route path="/student/interview-prep" element={<ProtectedRoute><InterviewPrep /></ProtectedRoute>} />
            <Route path="/student/refer-and-earn" element={<ProtectedRoute><ReferAndEarn /></ProtectedRoute>} />
            <Route path="/student/quiz/:quizId" element={<ProtectedRoute><QuizAttempt /></ProtectedRoute>} />
            <Route path="/student/quizzes" element={<ProtectedRoute><StudentQuizzes /></ProtectedRoute>} />
            <Route path="/student/quizzes/:quizId/take/:assignmentId" element={<ProtectedRoute><TakeQuiz /></ProtectedRoute>} />
            <Route path="/student/quizzes/:quizId/results/:assignmentId" element={<ProtectedRoute><QuizResults /></ProtectedRoute>} />
            <Route path="/student/support" element={<ProtectedRoute><LearnIQSupport /></ProtectedRoute>} />
            <Route path="/student/settings" element={<ProtectedRoute><LearnIQSettings /></ProtectedRoute>} />
            <Route path="/student/debug-courses" element={<ProtectedRoute><CourseDebugger /></ProtectedRoute>} />
            
            {/* Mentor Routes with protection */}
            <Route path="/mentor/dashboard" element={<MentorDashboard />} />
            <Route path="/mentor/student/:studentId" element={<StudentView />} />
            <Route path="/mentor/reports" element={<Reports />} />
            <Route path="/mentor/quizzes" element={<ManageQuizzes />} />
            <Route path="/mentor/create-quiz" element={<CreateQuiz />} />
            <Route path="/mentor/quiz-submissions/:quizId" element={<QuizSubmissions />} />
            <Route path="/mentor/assign-to-students" element={<AssignToStudents />} />
            {/* New Mentor Routes with student-like features */}
            <Route path="/mentor/assignments" element={<MentorAssignments />} />
            <Route path="/mentor/assignments/:id" element={<MentorAssignmentDetail />} />
            <Route path="/mentor/notifications" element={<MentorNotifications />} />
            <Route path="/mentor/calendar" element={<MentorCalendar />} />
            <Route path="/mentor/progress" element={<MentorProgress />} />
            
            {/* Auth Routes */}
            
            {/* Payment Routes */}
            <Route 
              path="/course/:courseId/enroll" 
              element={
                <ProtectedRoute>
                  <CourseEnrollment />
                </ProtectedRoute>
              } 
            />
            <Route path="/course/:courseId/success" element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>} />
            <Route path="/payment-flow" element={<RoleBasedRedirect />} />
            
            {/* Legacy dashboard routes - use role-based redirect */}
            <Route path="/dashboard" element={<RoleBasedRedirect />} />
            <Route path="/course/:courseId" element={<Navigate to="/student/student-dashboard/course/:courseId" replace />} />
            <Route path="/course/:courseId/learn" element={<Navigate to="/student/student-dashboard/course/:courseId" replace />} />
            
            {/* Admin Dashboard */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              </ProtectedRoute>
            } />
            
            {/* Data Analyst Dashboard */}
            <Route path="/data-analyst/dashboard" element={
              <ProtectedRoute>
                <DataAnalystRoute>
                  <DataAnalystDashboard />
                </DataAnalystRoute>
              </ProtectedRoute>
            } />
            
            {/* Data Analyst Support Tickets */}
            <Route path="/data-analyst/support-tickets" element={
              <ProtectedRoute>
                <DataAnalystRoute>
                  <SupportTickets />
                </DataAnalystRoute>
              </ProtectedRoute>
            } />
            
            {/* Add easy access route for analytics */}
            <Route path="/analytics" element={<AnalyticsRedirect />} />

            {/* LearnIQ Dashboard Routes */}
            <Route path="/*" element={<LearnIQRoutes />} />
            
            {/* Redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
