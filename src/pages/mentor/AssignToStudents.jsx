import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/mentor/Navbar';

export default function AssignToStudents() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [students, setStudents] = useState([]);
  const [assigningToAll, setAssigningToAll] = useState(false);
  const [itemTitle, setItemTitle] = useState('');
  const [itemId, setItemId] = useState('');
  const [itemType, setItemType] = useState('quiz'); // 'quiz' or 'interview'

  // Check URL params for the quiz and automatically assign to students
  useEffect(() => {
    async function fetchAndAssign() {
      try {
        setLoading(true);
        
        const urlParams = new URLSearchParams(window.location.search);
        const idParam = urlParams.get('id');
        const typeParam = urlParams.get('type') || 'quiz';
        
        // If no ID provided, redirect to dashboard
        if (!idParam) {
          console.log("No item ID provided, redirecting to dashboard");
          navigate('/mentor/dashboard');
          return;
        }
        
        setItemId(idParam);
        setItemType(typeParam);
        
        // Check if we have title information in session storage
        const storedTitle = window.sessionStorage.getItem(typeParam === 'interview' ? 'interviewTitle' : 'quizTitle');
        if (storedTitle) {
          setItemTitle(storedTitle);
          window.sessionStorage.removeItem(typeParam === 'interview' ? 'interviewTitle' : 'quizTitle');
          window.sessionStorage.removeItem(typeParam === 'interview' ? 'interviewCreated' : 'quizCreated');
        }
        
        // Fetch all students assigned to this mentor
        const mentorAssignmentsQuery = query(
          collection(db, "mentorAssignments"),
          where("mentorId", "==", currentUser.uid)
        );
        
        const assignmentDocs = await getDocs(mentorAssignmentsQuery);
        
        if (assignmentDocs.empty) {
          setError("You don't have any students assigned to you.");
          setLoading(false);
          return;
        }
        
        // Extract student IDs
        const studentIds = assignmentDocs.docs.map(doc => doc.data().studentId);
        
        // Fetch student data
        const studentsData = [];
        
        for (const studentId of studentIds) {
          const userQuery = query(
            collection(db, "users"),
            where("uid", "==", studentId)
          );
          
          const userDocs = await getDocs(userQuery);
          
          if (!userDocs.empty) {
            const userData = userDocs.docs[0].data();
            studentsData.push({
              id: studentId,
              name: userData.name || userData.email,
              email: userData.email
            });
          }
        }
        
        setStudents(studentsData);
        
        // Auto-assign to all students
        if (studentsData.length > 0) {
          setAssigningToAll(true);
          const type = urlParams.get('type') || 'quiz';
          await assignItemToAllStudents(idParam, studentsData, storedTitle, type);
        }
        
      } catch (err) {
        console.error("Error fetching and assigning:", err);
        setError(`Failed to assign ${itemType} to students: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    
    fetchAndAssign();
  }, [currentUser, navigate]);
  
  // Function to assign quiz or interview to all students
  const assignItemToAllStudents = useCallback(async (itemId, students, title, type) => {
    try {
      if (type === 'interview') {
        const assignments = students.map(student => {
          return addDoc(collection(db, "studentInterviews"), {
            interviewId: itemId,
            interviewTitle: title || "Interview",
            studentId: student.id,
            studentName: student.name,
            assignedBy: currentUser.uid,
            assignedAt: serverTimestamp(),
            status: 'assigned',
            completed: false
          });
        });
        
        await Promise.all(assignments);
      } else {
        const assignments = students.map(student => {
          return addDoc(collection(db, "studentQuizzes"), {
            quizId: itemId,
            quizTitle: title || "Quiz",
            studentId: student.id,
            studentName: student.name,
            assignedBy: currentUser.uid,
            assignedAt: serverTimestamp(),
            dueDate: null, // No specific due date
            status: 'assigned',
            completed: false
          });
        });
        
        await Promise.all(assignments);
      }
      
      setSuccessMessage(`${type === 'interview' ? 'Interview' : 'Quiz'} has been automatically assigned to ${students.length} student(s).`);
      setAssigningToAll(false);
      
    } catch (err) {
      console.error("Error assigning to students:", err);
      setError("Failed to assign to students: " + err.message);
      setAssigningToAll(false);
    }
  }, [currentUser]);

  // Function to return to the appropriate page
  const handleReturn = () => {
    navigate(itemType === 'interview' ? '/mentor/interviews' : '/mentor/quizzes');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
            <p className="text-center mt-4">
              {assigningToAll ? `Assigning ${itemType} to students...` : 'Loading...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {itemType === 'interview' ? 'Interview' : 'Quiz'} Assignment
              </h1>
              {itemTitle && (
                <p className="text-gray-500 mt-1">{itemType === 'interview' ? 'Interview' : 'Quiz'}: {itemTitle}</p>
              )}
            </div>
          </div>
          
          {error && (
            <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <p>{error}</p>
              <div className="mt-4">
                <button 
                  onClick={handleReturn}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Return to Quizzes
                </button>
              </div>
            </div>
          )}
          
          {successMessage && (
            <div className="mt-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
              <p>{successMessage}</p>
              <div className="mt-4">
                <button 
                  onClick={handleReturn}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Return to Quizzes
                </button>
              </div>
            </div>
          )}
          
          {!error && !successMessage && students.length > 0 && (
            <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg p-6">
              <p className="text-gray-700">
                Your {itemType === 'interview' ? 'interview' : 'quiz'} is being automatically assigned to your students.
              </p>
              <div className="mt-4">
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-5 w-5 border-t-2 border-b-2 border-indigo-500 rounded-full"></div>
                  <p>Processing assignment...</p>
                </div>
              </div>
            </div>
          )}
          
          {!error && !successMessage && students.length === 0 && (
            <div className="mt-6 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
              <p>You don't have any students assigned to you. Please add students to your roster first.</p>
              <div className="mt-4">
                <button 
                  onClick={() => navigate('/mentor/roster')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 mr-3"
                >
                  Manage Student Roster
                </button>
                <button 
                  onClick={handleReturn}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Return to Quizzes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}