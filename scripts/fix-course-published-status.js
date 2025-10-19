// This script updates all courses without a 'published' field to set published: true
// Run this from the browser console on the creator dashboard page

(async function fixCoursePublishedStatus() {
  const { getFirestore, collection, getDocs, doc, updateDoc } = window.firebase;
  const db = getFirestore();
  
  console.log('🔄 Starting to fix course published status...\n');
  
  try {
    const coursesRef = collection(db, 'courses');
    const snapshot = await getDocs(coursesRef);
    
    let updatedCount = 0;
    let alreadyPublishedCount = 0;
    
    for (const courseDoc of snapshot.docs) {
      const data = courseDoc.data();
      
      // Check if published field is missing or explicitly false
      if (data.published !== true) {
        console.log(`📝 Updating course: ${data.title}`);
        console.log(`   Current published value: ${data.published}`);
        
        await updateDoc(doc(db, 'courses', courseDoc.id), {
          published: true,
          status: data.status || 'active'
        });
        
        console.log(`   ✅ Updated to published: true\n`);
        updatedCount++;
      } else {
        alreadyPublishedCount++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`✅ Fix completed!`);
    console.log(`   Courses updated: ${updatedCount}`);
    console.log(`   Already published: ${alreadyPublishedCount}`);
    console.log(`   Total courses: ${snapshot.size}`);
    console.log('='.repeat(60));
    console.log('\n🔄 Please refresh the page to see the changes.');
    
  } catch (error) {
    console.error('❌ Error fixing courses:', error);
  }
})();
