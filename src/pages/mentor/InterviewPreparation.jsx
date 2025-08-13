import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/mentor/Navbar';

export default function InterviewPreparation() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const storage = getStorage();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState('');
  const [documentFile, setDocumentFile] = useState(null);
  const [documentName, setDocumentName] = useState('');

  // Fetch assigned students
  useEffect(() => {
    async function fetchAssignedStudents() {
      try {
        setLoading(true);
        
        // Query mentor assignments for current mentor
        const assignmentsQuery = query(
          collection(db, "mentorAssignments"),
          where("mentorId", "==", currentUser.uid)
        );
        
        const assignmentDocs = await getDocs(assignmentsQuery);
        const studentIds = assignmentDocs.docs.map(doc => doc.data().studentId);
        
        if (studentIds.length === 0) {
          setStudents([]);
          setLoading(false);
          return;
        }
        
        // Fetch student data for each assigned student
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
      } catch (err) {
        console.error("Error fetching assigned students:", err);
        setError("Failed to load your assigned students. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchAssignedStudents();
  }, [currentUser]);

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocumentFile(file);
      setDocumentName(file.name);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!title.trim()) {
      setError("Interview title is required.");
      return;
    }
    
    if (selectedStudents.length === 0) {
      setError("Please select at least one student.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      let documentUrl = null;
      
      // Upload document if provided
      if (documentFile) {
        const fileRef = ref(storage, `interview-documents/${currentUser.uid}/${Date.now()}-${documentName}`);
        await uploadBytes(fileRef, documentFile);
        documentUrl = await getDownloadURL(fileRef);
      }
      
      // Create the interview preparation in Firestore
      const interviewRef = await addDoc(collection(db, "interviewPreparations"), {
        title,
        description,
        questions,
        documentUrl,
        documentName: documentName || null,
        creatorId: currentUser.uid,
        creatorName: currentUser.displayName || currentUser.email,
        createdAt: serverTimestamp(),
        status: 'active'
      });
      
      // Assign to selected students
      const assignments = selectedStudents.map(studentId => {
        const student = students.find(s => s.id === studentId);
        return addDoc(collection(db, "studentInterviews"), {
          interviewId: interviewRef.id,
          interviewTitle: title,
          studentId,
          studentName: student ? student.name : "Unknown",
          assignedBy: currentUser.uid,
          assignedAt: serverTimestamp(),
          status: 'assigned',
          completed: false
        });
      });
      
      await Promise.all(assignments);
      
      setSuccess(`Interview preparation "${title}" created and assigned to ${selectedStudents.length} student(s).`);
      
      // Reset form
      setTitle('');
      setDescription('');
      setQuestions('');
      setDocumentFile(null);
      setDocumentName('');
      setSelectedStudents([]);
      
    } catch (err) {
      console.error("Error creating interview preparation:", err);
      setError("Failed to create interview preparation: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // Handle student selection
  const handleStudentSelection = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  // Handle select all students
  const handleSelectAllStudents = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(student => student.id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Interview Preparation</h1>
            <button
              type="button"
              onClick={() => navigate('/mentor/interviews')}
              className="bg-gray-200 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              View All Interviews
            </button>
          </div>
          
          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}
          
          {loading ? (
            <div className="mt-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {/* Interview Details */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg font-medium text-gray-900">Interview Details</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Provide details about the interview preparation.
                  </p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-6">
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Title *
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          required
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="description"
                          rows={3}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Describe the interview preparation"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="questions" className="block text-sm font-medium text-gray-700">
                        Interview Questions
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="questions"
                          rows={6}
                          value={questions}
                          onChange={(e) => setQuestions(e.target.value)}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Enter interview questions here (one per line)"
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Enter each question on a new line. Add as many questions as needed.
                      </p>
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="document" className="block text-sm font-medium text-gray-700">
                        Supporting Document
                      </label>
                      <div className="mt-1 flex items-center">
                        <input
                          type="file"
                          id="document"
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                        <label
                          htmlFor="document"
                          className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Choose file
                        </label>
                        <span className="ml-3 text-sm text-gray-500">
                          {documentName || "No file selected"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Upload a document that students can use for preparation (PDF, DOCX, etc.).
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Selection */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg font-medium text-gray-900">Assign to Students</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Select students who should receive this interview preparation.
                  </p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  {students.length === 0 ? (
                    <p className="text-gray-500">You don't have any assigned students yet.</p>
                  ) : (
                    <>
                      <div className="mb-4">
                        <button
                          type="button"
                          onClick={handleSelectAllStudents}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          {selectedStudents.length === students.length ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        <ul className="divide-y divide-gray-200">
                          {students.map((student) => (
                            <li key={student.id} className="py-3 flex items-center">
                              <input
                                type="checkbox"
                                id={`student-${student.id}`}
                                checked={selectedStudents.includes(student.id)}
                                onChange={() => handleStudentSelection(student.id)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                              <label htmlFor={`student-${student.id}`} className="ml-3 block text-sm font-medium text-gray-700">
                                {student.name} ({student.email})
                              </label>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/mentor/dashboard')}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || students.length === 0}
                  className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    loading || students.length === 0
                      ? 'bg-indigo-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {loading ? 'Creating...' : 'Create and Assign'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
