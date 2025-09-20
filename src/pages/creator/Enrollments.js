import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

export default function CreatorEnrollments() {
  const { currentUser } = useAuth();
  const db = getFirestore();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState({}); // { courseId: [student, ...] }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch all courses created by this creator
        const coursesRef = collection(db, 'courses');
        const q = query(coursesRef, where('creatorId', '==', currentUser.uid));
        const courseSnap = await getDocs(q);
        const courseList = courseSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCourses(courseList);

        // 2. For each course, fetch enrollments
        const enrollmentsData = {};
        for (const course of courseList) {
          const enrollRef = collection(db, 'enrollments');
          const eq = query(enrollRef, where('courseId', '==', course.id));
          const enrollSnap = await getDocs(eq);
          const students = [];
          for (const enrollDoc of enrollSnap.docs) {
            const data = enrollDoc.data();
            // Fetch student profile
            const studentRef = doc(db, 'users', data.studentId);
            const studentSnap = await getDoc(studentRef);
            if (studentSnap.exists()) {
              students.push({ id: data.studentId, ...studentSnap.data() });
            }
          }
          enrollmentsData[course.id] = students;
        }
        setEnrollments(enrollmentsData);
      } catch (err) {
        setError('Failed to load enrollments');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser, db]);

  if (loading) return <div className="p-8 text-center text-indigo-600 font-semibold">Loading enrollments...</div>;
  if (error) return <div className="p-8 text-center text-red-500 font-semibold">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-extrabold mb-8 text-indigo-700">Course Enrollments</h1>
      {courses.length === 0 ? (
        <div className="text-gray-500">No courses found.</div>
      ) : (
        courses.map(course => (
          <div key={course.id} className="mb-8 bg-white rounded-xl shadow-lg border border-indigo-100">
            <h2 className="text-xl font-bold mb-3 text-indigo-600 flex items-center gap-2">
              <span className="inline-block w-2 h-6 bg-indigo-400 rounded-full mr-2"></span>
              {course.title}
            </h2>
            {enrollments[course.id] && enrollments[course.id].length > 0 ? (
              <ul className="divide-y divide-indigo-100">
                {enrollments[course.id].map(student => (
                  <li key={student.id} className="py-3 flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-3">
                      {student.firstName?.[0] || student.displayName?.[0] || student.email?.[0] || 'S'}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">{student.firstName || student.displayName || student.email}</span>
                      <span className="ml-2 text-gray-500 text-sm">{student.email}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-400 italic">No students enrolled.</div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
