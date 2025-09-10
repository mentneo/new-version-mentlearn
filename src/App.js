import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
// Import our new protected route components
import { ProtectedRoute, PaymentProtectedRoute } from './components/ProtectedRoutes';
import SignupPaymentFlow from './components/SignupPaymentFlow';
import AdminLayout from './components/layouts/AdminLayout';
import ExternalRedirect from './components/ExternalRedirect';

// Public pages
import Home from './pages/Home';
import LandingPage from './pages/LandingPage'; // Import the existing landing page
import ModernLandingPage from './pages/ModernLandingPage'; // Import our new modern landing page
import AboutUs from './pages/AboutUs'; // Import the new About Us page
import ContactUs from './pages/ContactUs'; // Import the new Contact Us page
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
import ThemeTestPage from './pages/ThemeTestPage';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CancellationRefunds from './pages/CancellationRefunds';
import Shipping from './pages/Shipping';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import NewDashboard from './pages/admin/NewDashboard';
import ManageCourses from './pages/admin/ManageCourses';
import ManageStudents from './pages/admin/ManageStudents';
import ManageMentors from './pages/admin/ManageMentors';
import ManageEnrollments from './pages/admin/ManageEnrollments';
import VerifyPayments from './pages/admin/VerifyPayments';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import StudentNewDashboard from './pages/student/NewDashboard';
import SimplifiedDashboard from './pages/student/SimplifiedDashboard';
import CourseView from './pages/student/CourseView';
import CourseDetail from './pages/student/CourseDetail';
import Progress from './pages/student/Progress';
import InterviewPrep from './pages/student/InterviewPrep';
import QuizAttempt from './pages/student/QuizAttempt';
import StudentQuizzes from './pages/student/StudentQuizzes';
import ReferAndEarn from './pages/student/ReferAndEarn';
import TakeQuiz from './pages/student/TakeQuiz';
import QuizResults from './pages/student/QuizResults';
import StudentCourses from './pages/student/StudentCourses';
import ProfileSettings from './pages/student/ProfileSettings';
import CourseContent from './pages/student/CourseContent'; // Add missing import
import PaymentSuccess from './pages/payment/PaymentSuccess'; // Add missing import
import PaymentVerification from './pages/payment/PaymentVerification';
import CourseEnrollment from './pages/student/CourseEnrollment';
import CoursePaymentSuccess from './pages/student/CoursePaymentSuccess';

// Mentor pages
import MentorDashboard from './pages/mentor/Dashboard';
import StudentView from './pages/mentor/StudentView';
import Reports from './pages/mentor/Reports';
import ManageQuizzes from './pages/mentor/ManageQuizzes';
import QuizSubmissions from './pages/mentor/QuizSubmissions';
import CreateQuiz from './pages/mentor/CreateQuiz';
import AssignToStudents from './pages/mentor/AssignToStudents';
import InterviewPreparation from './pages/mentor/InterviewPreparation';
import Interviews from './pages/mentor/Interviews';

// Course selection page
import CourseSelectionPage from './pages/auth/CourseSelectionPage';

// Add new import
import RazorpayDebug from './pages/payment/RazorpayDebug';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<ModernLandingPage />} />
              <Route path="/home-classic" element={<LandingPage />} />
              <Route path="/home-old" element={<Home />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/courses/full-stack-development" element={<FullStackCoursePage />} />
              <Route path="/login" element={<GradientLogin />} />
              <Route path="/login-old" element={<Login />} />
              <Route path="/modern-login" element={<ModernLogin />} />
              <Route path="/new-login" element={<NewLoginPage />} />
              <Route path="/signup" element={<GradientSignup />} />
              <Route path="/signup-old" element={<Signup />} />
              <Route path="/new-signup" element={<NewSignupPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/debug" element={<DebugPage />} />
              <Route path="/debug-advanced" element={<DebugAdvanced />} />
              <Route path="/simple" element={<SimpleDashboard />} />
              <Route path="/theme-test" element={<ThemeTestPage />} />
              <Route path="/terms" element={<TermsAndConditions />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/cancellation-refunds" element={<CancellationRefunds />} />
              <Route path="/shipping" element={<Shipping />} />
              <Route path="/cookies" element={<CookiesPage />} />
              <Route path="/abhi" element={<ExternalRedirect to="https://mentneodashboard.vercel.app/login" />} />
              
              {/* Emergency Admin Access */}
              <Route path="/emergency-admin" element={<DirectAdminAccess />} />
              
              {/* DIRECT ACCESS ROUTES FOR TESTING - Remove in production */}
              <Route path="/direct-admin" element={<AdminDashboard />} />
              <Route path="/direct-admin/courses" element={<ManageCourses />} />
              <Route path="/direct-admin/students" element={<ManageStudents />} />
              <Route path="/direct-admin/mentors" element={<ManageMentors />} />
              
              {/* Admin Routes with new layout */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<NewDashboard />} />
                <Route path="courses" element={<ManageCourses />} />
                <Route path="students" element={<ManageStudents />} />
                <Route path="mentors" element={<ManageMentors />} />
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
            
            {/* Student Routes with protection */}
            <Route path="/student/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/new-dashboard" element={<ProtectedRoute><StudentNewDashboard /></ProtectedRoute>} />
            <Route path="/student/simple-dashboard" element={<ProtectedRoute><SimplifiedDashboard /></ProtectedRoute>} />
            <Route path="/student/courses" element={<ProtectedRoute><StudentCourses /></ProtectedRoute>} />
            <Route path="/student/course/:courseId" element={<ProtectedRoute><CourseView /></ProtectedRoute>} />
            <Route path="/student/course-details/:courseId" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
            <Route path="/student/enroll/:courseId" element={<ProtectedRoute><CourseEnrollment /></ProtectedRoute>} />
            <Route path="/payment/success" element={<ProtectedRoute><CoursePaymentSuccess /></ProtectedRoute>} />
            <Route path="/student/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
            <Route path="/student/interview-prep" element={<ProtectedRoute><InterviewPrep /></ProtectedRoute>} />
            <Route path="/student/refer-and-earn" element={<ProtectedRoute><ReferAndEarn /></ProtectedRoute>} />
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
            <Route path="/mentor/interviews" element={<Interviews />} />
            <Route path="/mentor/interviews/create" element={<InterviewPreparation />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Payment flow - Now redirects to dashboard */}
            <Route path="/payment-flow" element={<Navigate to="/dashboard" replace />} />
            
            {/* Protected routes - No longer require payment */}
            <Route path="/dashboard" element={
              <PaymentProtectedRoute>
                <StudentDashboard />
              </PaymentProtectedRoute>
            } />
            <Route path="/course/:courseId" element={
              <PaymentProtectedRoute>
                <CourseView />
              </PaymentProtectedRoute>
            } />
            <Route path="/course/:courseId/learn" element={
              <PaymentProtectedRoute>
                <CourseContent />
              </PaymentProtectedRoute>
            } />
            
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
