import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LearnIQDashboardLayout from './components/student/LearnIQDashboardLayout.js';
import LearnIQDashboard from './pages/student/LearnIQDashboard.js';
import LearnIQCourseView from './pages/student/LearnIQCourseView.js';
import LearnIQLessonView from './pages/student/LearnIQLessonView.js';
import LearnIQAssignments from './pages/student/LearnIQAssignments.js';
import StudentAssignmentDetail from './pages/student/AssignmentDetail.js';
import LearnIQProfile from './pages/student/LearnIQProfile.js';
import LearnIQCertificates from './pages/student/LearnIQCertificates.js';
import LearnIQCalendar from './pages/student/LearnIQCalendar.js';
import LearnIQProgress from './pages/student/LearnIQProgress.js';
import LearnIQNotifications from './pages/student/LearnIQNotifications.js';

// Example usage in your main router configuration
const LearnIQRoutes = () => {
  return (
    <Routes>
      <Route path="student-dashboard" element={<LearnIQDashboardLayout />}>
        <Route index element={<LearnIQDashboard />} />
        <Route path="profile" element={<LearnIQProfile />} />
        <Route path="assignments" element={<LearnIQAssignments />} />
        <Route path="assignments/:id" element={<StudentAssignmentDetail />} />
        <Route path="certificates" element={<LearnIQCertificates />} />
        <Route path="calendar" element={<LearnIQCalendar />} />
        <Route path="progress" element={<LearnIQProgress />} />
        <Route path="notifications" element={<LearnIQNotifications />} />
        <Route path="course/:courseId" element={<LearnIQCourseView />} />
        <Route path="course/:courseId/lesson/:lessonId" element={<LearnIQLessonView />} />
      </Route>
    </Routes>
  );
};

export default LearnIQRoutes;

// Usage instructions:
// 1. Import this file in your main App.js or router configuration
// 2. Add the LearnIQRoutes component to your Router
//
// Example:
//
// import LearnIQRoutes from './LearnIQRoutes';
//
// function App() {
//   return (
//     <Router>
//       <Routes>
//         {/* Existing routes */}
//         <Route path="/*" element={<LearnIQRoutes />} />
//       </Routes>
//     </Router>
//   );
// }
//