import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase.js';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext.js';

export default function CourseDebugger() {
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all courses
      const coursesSnapshot = await getDocs(collection(db, 'courses'));
      const coursesData = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCourses(coursesData);
      
      // Fetch all enrollments
      const enrollmentsSnapshot = await getDocs(collection(db, 'enrollments'));
      const enrollmentsData = enrollmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEnrollments(enrollmentsData);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const createSampleCourses = async () => {
    try {
      setCreating(true);
      
      const sampleCourses = [
        {
          title: 'Introduction to Web Development',
          description: 'Learn the basics of HTML, CSS, and JavaScript to build modern websites',
          category: 'Web Development',
          level: 'Beginner',
          price: '0',
          duration: '4 weeks',
          published: true,
          thumbnailUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400',
          modules: [
            { id: 1, title: 'HTML Basics', duration: '2 hours', lessons: [] },
            { id: 2, title: 'CSS Fundamentals', duration: '3 hours', lessons: [] },
            { id: 3, title: 'JavaScript Introduction', duration: '4 hours', lessons: [] }
          ],
          enrolledStudents: [],
          creatorId: currentUser?.uid || 'sample-creator',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: 'Python Programming Masterclass',
          description: 'Master Python programming from basics to advanced concepts',
          category: 'Programming',
          level: 'Intermediate',
          price: '999',
          duration: '8 weeks',
          published: true,
          thumbnailUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400',
          modules: [
            { id: 1, title: 'Python Basics', duration: '3 hours', lessons: [] },
            { id: 2, title: 'Data Structures', duration: '4 hours', lessons: [] },
            { id: 3, title: 'Object-Oriented Programming', duration: '5 hours', lessons: [] }
          ],
          enrolledStudents: [],
          creatorId: currentUser?.uid || 'sample-creator',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: 'Digital Marketing Fundamentals',
          description: 'Learn SEO, social media marketing, and content strategy',
          category: 'Marketing',
          level: 'Beginner',
          price: '1499',
          duration: '6 weeks',
          published: true,
          thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
          modules: [
            { id: 1, title: 'SEO Basics', duration: '2 hours', lessons: [] },
            { id: 2, title: 'Social Media Marketing', duration: '3 hours', lessons: [] }
          ],
          enrolledStudents: [],
          creatorId: currentUser?.uid || 'sample-creator',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      for (const course of sampleCourses) {
        await addDoc(collection(db, 'courses'), course);
      }
      
      alert('Sample courses created successfully!');
      fetchData();
    } catch (error) {
      console.error('Error creating courses:', error);
      alert('Error creating courses: ' + error.message);
    } finally {
      setCreating(false);
    }
  };

  const createEnrollment = async (courseId) => {
    try {
      await addDoc(collection(db, 'enrollments'), {
        courseId: courseId,
        studentId: currentUser.uid,
        userId: currentUser.uid,
        status: 'active',
        progress: 0,
        enrolledAt: new Date(),
        createdAt: new Date()
      });
      
      alert('Enrolled successfully!');
      fetchData();
    } catch (error) {
      console.error('Error enrolling:', error);
      alert('Error enrolling: ' + error.message);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  const publishedCourses = courses.filter(c => c.published);
  const myEnrollments = enrollments.filter(e => 
    e.studentId === currentUser?.uid || e.userId === currentUser?.uid
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Course Debugger</h1>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm text-gray-600 mb-2">Total Courses</h3>
            <p className="text-3xl font-bold">{courses.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm text-gray-600 mb-2">Published Courses</h3>
            <p className="text-3xl font-bold">{publishedCourses.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm text-gray-600 mb-2">My Enrollments</h3>
            <p className="text-3xl font-bold">{myEnrollments.length}</p>
          </div>
        </div>

        {/* Create Sample Courses */}
        {courses.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg mb-8">
            <h3 className="text-lg font-semibold mb-2">No courses found!</h3>
            <p className="text-gray-700 mb-4">Create some sample courses to test the system.</p>
            <button
              onClick={createSampleCourses}
              disabled={creating}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {creating ? 'Creating...' : 'Create Sample Courses'}
            </button>
          </div>
        )}

        {/* Current User Info */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="text-lg font-semibold mb-4">Current User</h3>
          <p><strong>UID:</strong> {currentUser?.uid}</p>
          <p><strong>Email:</strong> {currentUser?.email}</p>
        </div>

        {/* Courses List */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">All Courses ({courses.length})</h3>
            {courses.length > 0 && (
              <button
                onClick={createSampleCourses}
                disabled={creating}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 text-sm"
              >
                Add More Courses
              </button>
            )}
          </div>
          {courses.length === 0 ? (
            <p className="text-gray-500">No courses in database</p>
          ) : (
            <div className="space-y-4">
              {courses.map(course => {
                const isEnrolled = myEnrollments.some(e => e.courseId === course.id);
                return (
                  <div key={course.id} className="border p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{course.title}</h4>
                        <p className="text-sm text-gray-600">{course.description}</p>
                        <div className="mt-2 flex gap-4 text-sm">
                          <span className={`px-2 py-1 rounded ${course.published ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {course.published ? 'Published' : 'Not Published'}
                          </span>
                          <span className="text-gray-600">Category: {course.category}</span>
                          <span className="text-gray-600">Price: ₹{course.price || '0'}</span>
                          <span className="text-gray-600">Modules: {course.modules?.length || 0}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">ID: {course.id}</p>
                      </div>
                      <div>
                        {isEnrolled ? (
                          <span className="px-4 py-2 bg-green-100 text-green-800 rounded text-sm">
                            Enrolled ✓
                          </span>
                        ) : (
                          <button
                            onClick={() => createEnrollment(course.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                          >
                            Enroll
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Enrollments List */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">All Enrollments ({enrollments.length})</h3>
          {enrollments.length === 0 ? (
            <p className="text-gray-500">No enrollments in database</p>
          ) : (
            <div className="space-y-2">
              {enrollments.map(enrollment => {
                const course = courses.find(c => c.id === enrollment.courseId);
                const isMine = enrollment.studentId === currentUser?.uid || enrollment.userId === currentUser?.uid;
                return (
                  <div key={enrollment.id} className={`border p-3 rounded ${isMine ? 'bg-blue-50 border-blue-200' : ''}`}>
                    <p className="font-medium">
                      Course: {course?.title || enrollment.courseId}
                      {isMine && <span className="ml-2 text-blue-600 text-sm">(You)</span>}
                    </p>
                    <div className="text-sm text-gray-600 mt-1">
                      <span>Student ID: {enrollment.studentId || enrollment.userId}</span>
                      <span className="ml-4">Status: {enrollment.status}</span>
                      <span className="ml-4">Progress: {enrollment.progress || 0}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
