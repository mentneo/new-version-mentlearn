import React from 'react';
import StudentNavbar from '../student/StudentNavbar';
import Footer from './Footer';

const StudentLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <StudentNavbar />
      <main className="pb-16">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default StudentLayout;
