/**
 * Script to create test mentor-student relationships
 * This will link a mentor to students in the Firestore database
 */

const admin = require('firebase-admin');
const serviceAccount = require('../mentor-app-238c6-firebase-adminsdk-fbsvc-8db9a224f3.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// CONFIGURATION - Update these with your actual UIDs
const MENTOR_UID = 'your-mentor-uid-here'; // Replace with actual mentor UID
const STUDENT_UIDS = [
  // Add actual student UIDs here, or leave empty to create test students
];

async function createTestStudents() {
  console.log('🎓 Creating Test Students and Mentor Relationships...\n');
  
  try {
    // Step 1: Get or create mentor
    let mentorId = MENTOR_UID;
    
    if (MENTOR_UID === 'your-mentor-uid-here') {
      console.log('⚠️  No mentor UID provided, checking for existing mentors...');
      
      // Find existing mentor
      const mentorsQuery = await db.collection('users')
        .where('role', '==', 'mentor')
        .limit(1)
        .get();
      
      if (!mentorsQuery.empty) {
        mentorId = mentorsQuery.docs[0].id;
        const mentorData = mentorsQuery.docs[0].data();
        console.log(`✅ Found existing mentor: ${mentorData.displayName || mentorData.email} (${mentorId})`);
      } else {
        console.log('❌ No mentor found. Please create a mentor user first or provide a MENTOR_UID in the script.');
        return;
      }
    }
    
    // Step 2: Get or create students
    let studentIds = STUDENT_UIDS;
    
    if (studentIds.length === 0) {
      console.log('\n📝 No student UIDs provided, fetching existing students...');
      
      const studentsQuery = await db.collection('users')
        .where('role', '==', 'student')
        .limit(10)
        .get();
      
      if (!studentsQuery.empty) {
        studentIds = studentsQuery.docs.map(doc => doc.id);
        console.log(`✅ Found ${studentIds.length} existing students`);
        
        studentsQuery.docs.forEach(doc => {
          const data = doc.data();
          console.log(`   - ${data.displayName || data.email} (${doc.id})`);
        });
      } else {
        console.log('⚠️  No students found. Creating 3 test students...\n');
        
        // Create test students
        const testStudents = [
          {
            email: 'student1@test.com',
            displayName: 'John Smith',
            role: 'student',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          },
          {
            email: 'student2@test.com',
            displayName: 'Jane Doe',
            role: 'student',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          },
          {
            email: 'student3@test.com',
            displayName: 'Mike Johnson',
            role: 'student',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          }
        ];
        
        for (const student of testStudents) {
          const docRef = await db.collection('users').add(student);
          studentIds.push(docRef.id);
          console.log(`✅ Created student: ${student.displayName} (${docRef.id})`);
        }
      }
    }
    
    // Step 3: Create mentor-student relationships
    console.log('\n🔗 Creating mentor-student relationships...\n');
    
    let createdCount = 0;
    let existingCount = 0;
    
    for (const studentId of studentIds) {
      // Check if relationship already exists
      const existingQuery = await db.collection('mentorStudents')
        .where('mentorId', '==', mentorId)
        .where('studentId', '==', studentId)
        .get();
      
      if (!existingQuery.empty) {
        console.log(`⏭️  Relationship already exists for student ${studentId}`);
        existingCount++;
        continue;
      }
      
      // Create relationship
      const relationshipData = {
        mentorId: mentorId,
        studentId: studentId,
        status: 'active',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      await db.collection('mentorStudents').add(relationshipData);
      
      // Get student details for display
      const studentDoc = await db.collection('users').doc(studentId).get();
      const studentData = studentDoc.data();
      
      console.log(`✅ Created relationship: Mentor → ${studentData?.displayName || studentData?.email || studentId}`);
      createdCount++;
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 SUMMARY');
    console.log('='.repeat(50));
    console.log(`Mentor ID: ${mentorId}`);
    console.log(`Total Students: ${studentIds.length}`);
    console.log(`New Relationships Created: ${createdCount}`);
    console.log(`Existing Relationships: ${existingCount}`);
    console.log('='.repeat(50));
    
    console.log('\n✅ Done! You can now see students in the mentor assignments page.');
    console.log('\n💡 TIP: Refresh your application to see the changes.');
    
  } catch (error) {
    console.error('❌ Error creating test data:', error);
    console.error('\nFull error details:', error.message);
  }
}

// Run the script
createTestStudents()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
