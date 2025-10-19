import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase.js';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext.js';

const CourseVisibilityTest = () => {
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    visible: 0,
    hidden: 0,
    withoutPublished: 0
  });

  useEffect(() => {
    testCourseVisibility();
  }, []);

  const testCourseVisibility = async () => {
    try {
      console.clear();
      console.log('🔍 COURSE VISIBILITY TEST STARTED');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Test 1: Check if user is authenticated
      console.log('\n📝 Test 1: Authentication Check');
      console.log('Current User:', currentUser?.uid || 'NOT LOGGED IN');
      console.log('User Email:', currentUser?.email || 'N/A');
      
      if (!currentUser) {
        console.error('❌ USER NOT AUTHENTICATED - Cannot fetch courses');
        setLoading(false);
        return;
      }
      console.log('✅ User is authenticated');
      
      // Test 2: Fetch all courses
      console.log('\n📝 Test 2: Fetching All Courses from Firestore');
      const coursesRef = collection(db, 'courses');
      const snapshot = await getDocs(coursesRef);
      
      console.log(`Total courses in Firestore: ${snapshot.size}`);
      
      if (snapshot.empty) {
        console.error('❌ NO COURSES FOUND - Database is empty');
        setLoading(false);
        return;
      }
      console.log(`✅ Found ${snapshot.size} courses`);
      
      // Test 3: Analyze each course
      console.log('\n📝 Test 3: Course Visibility Analysis');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      let visibleCount = 0;
      let hiddenCount = 0;
      let withoutPublishedCount = 0;
      
      const courseData = [];
      
      snapshot.forEach((doc, index) => {
        const data = doc.data();
        const hasPublished = 'published' in data;
        const publishedValue = data.published;
        const isVisible = publishedValue !== false;
        
        if (isVisible) visibleCount++;
        else hiddenCount++;
        
        if (!hasPublished) withoutPublishedCount++;
        
        const status = isVisible ? '✅ VISIBLE' : '❌ HIDDEN';
        
        console.log(`\n${index + 1}. ${status} - "${data.title}"`);
        console.log(`   Course ID: ${doc.id}`);
        console.log(`   Published field exists: ${hasPublished ? 'Yes' : 'No'}`);
        console.log(`   Published value: ${JSON.stringify(publishedValue)} (${typeof publishedValue})`);
        console.log(`   Status field: ${data.status || 'not set'}`);
        console.log(`   Creator ID: ${data.creatorId || 'not set'}`);
        console.log(`   Created At: ${data.createdAt || 'not set'}`);
        console.log(`   Has Thumbnail: ${data.thumbnailUrl ? 'Yes' : 'No'}`);
        console.log(`   Module Count: ${data.modules?.length || 0}`);
        console.log(`   Visibility Logic: published (${publishedValue}) !== false → ${isVisible}`);
        
        courseData.push({
          id: doc.id,
          ...data,
          isVisible,
          hasPublished
        });
      });
      
      // Test 4: Summary
      console.log('\n📝 Test 4: Summary Statistics');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Total Courses: ${snapshot.size}`);
      console.log(`✅ Visible to Students: ${visibleCount}`);
      console.log(`❌ Hidden from Students: ${hiddenCount}`);
      console.log(`⚠️  Without 'published' field: ${withoutPublishedCount}`);
      
      // Test 5: Visibility Rules
      console.log('\n📝 Test 5: Current Visibility Rules');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Courses are VISIBLE when:');
      console.log('  • published = true');
      console.log('  • published = undefined (no field)');
      console.log('  • published = null');
      console.log('\nCourses are HIDDEN when:');
      console.log('  • published = false (explicit)');
      
      // Test 6: Expected Result
      console.log('\n📝 Test 6: Expected Student View');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Students should see ${visibleCount} courses on their dashboard`);
      
      if (visibleCount === 0) {
        console.error('\n⚠️  WARNING: NO VISIBLE COURSES!');
        console.log('Possible reasons:');
        console.log('  1. All courses have published=false');
        console.log('  2. Courses need to be created with published=true');
        console.log('  3. Existing courses need published field updated');
      } else {
        console.log('\n✅ SUCCESS: Courses should be visible to students');
      }
      
      console.log('\n🔍 COURSE VISIBILITY TEST COMPLETED');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      setCourses(courseData);
      setStats({
        total: snapshot.size,
        visible: visibleCount,
        hidden: hiddenCount,
        withoutPublished: withoutPublishedCount
      });
      
    } catch (error) {
      console.error('❌ ERROR during test:', error);
      console.error('Error details:', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-lg">Running visibility test...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Visibility Test</h1>
          <p className="text-gray-600">Check browser console for detailed analysis</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-blue-800 font-medium">Total Courses</div>
          </div>
          
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
            <div className="text-3xl font-bold text-green-600">{stats.visible}</div>
            <div className="text-sm text-green-800 font-medium">Visible to Students</div>
          </div>
          
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
            <div className="text-3xl font-bold text-red-600">{stats.hidden}</div>
            <div className="text-sm text-red-800 font-medium">Hidden Courses</div>
          </div>
          
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
            <div className="text-3xl font-bold text-yellow-600">{stats.withoutPublished}</div>
            <div className="text-sm text-yellow-800 font-medium">Missing Published Field</div>
          </div>
        </div>

        {/* Course List */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-8 py-6 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">All Courses in Database</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {courses.map((course, index) => (
              <div 
                key={course.id} 
                className={`p-6 ${course.isVisible ? 'bg-white' : 'bg-red-50'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-semibold text-gray-500">#{index + 1}</span>
                      <h3 className="text-lg font-bold text-gray-900">{course.title}</h3>
                      {course.isVisible ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                          ✅ VISIBLE
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                          ❌ HIDDEN
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                      <div>
                        <span className="text-gray-500">Published:</span>
                        <span className={`ml-2 font-semibold ${
                          course.published === true ? 'text-green-600' : 
                          course.published === false ? 'text-red-600' : 
                          'text-yellow-600'
                        }`}>
                          {course.hasPublished ? JSON.stringify(course.published) : 'undefined'}
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <span className="ml-2 font-semibold text-gray-900">
                          {course.status || 'not set'}
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-gray-500">Modules:</span>
                        <span className="ml-2 font-semibold text-gray-900">
                          {course.modules?.length || 0}
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-gray-500">Creator:</span>
                        <span className="ml-2 font-semibold text-gray-900 truncate">
                          {course.creatorName || course.creatorId?.substring(0, 8) || 'Unknown'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-500">
                      ID: {course.id}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">📋 Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Check the browser console (F12) for detailed analysis</li>
            <li>Verify that courses have <code className="bg-blue-100 px-2 py-1 rounded">published: true</code></li>
            <li>If courses are hidden, update them in Firestore or recreate them</li>
            <li>Green courses should appear on the student dashboard</li>
            <li>Red courses will NOT appear (they have published: false)</li>
          </ol>
        </div>

        {/* Refresh Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => { setLoading(true); testCourseVisibility(); }}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Re-run Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseVisibilityTest;
