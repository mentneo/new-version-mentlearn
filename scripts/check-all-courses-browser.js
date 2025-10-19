// Run this script in the browser console on ANY page to check all courses
// This will help debug why courses aren't showing

(async function checkAllCourses() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 CHECKING ALL COURSES IN DATABASE');
  console.log('='.repeat(80) + '\n');

  try {
    // Get Firestore
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore();
    
    // Fetch ALL courses
    const coursesRef = collection(db, 'courses');
    const snapshot = await getDocs(coursesRef);
    
    console.log(`📊 Total courses in database: ${snapshot.size}\n`);
    
    if (snapshot.empty) {
      console.log('⚠️ NO COURSES FOUND! Database is empty.');
      return;
    }
    
    let publishedCount = 0;
    let unpublishedCount = 0;
    let undefinedCount = 0;
    
    snapshot.forEach((doc, index) => {
      const data = doc.data();
      const num = index + 1;
      
      console.log(`\n📚 Course #${num}: "${data.title}"`);
      console.log('─'.repeat(60));
      console.log(`ID: ${doc.id}`);
      console.log(`Published: ${data.published} (type: ${typeof data.published})`);
      console.log(`Status: ${data.status || 'not set'}`);
      console.log(`Creator ID: ${data.creatorId || 'not set'}`);
      console.log(`Creator Name: ${data.creatorName || 'not set'}`);
      console.log(`Price: ₹${data.price || 0}`);
      console.log(`Category: ${data.category || 'not set'}`);
      console.log(`Created: ${data.createdAt || 'not set'}`);
      console.log(`Has Thumbnail: ${data.thumbnailUrl ? '✅ Yes' : '❌ No'}`);
      console.log(`Has Modules: ${data.modules ? `✅ Yes (${data.modules.length})` : '❌ No'}`);
      
      // Count visibility
      if (data.published === true) {
        console.log(`Visibility: ✅ WILL SHOW (published = true)`);
        publishedCount++;
      } else if (data.published === false) {
        console.log(`Visibility: ❌ HIDDEN (published = false)`);
        unpublishedCount++;
      } else {
        console.log(`Visibility: ⚠️ UNDEFINED (will show by default)`);
        undefinedCount++;
      }
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Courses: ${snapshot.size}`);
    console.log(`✅ Published (will show): ${publishedCount}`);
    console.log(`⚠️ Undefined (will show): ${undefinedCount}`);
    console.log(`❌ Unpublished (hidden): ${unpublishedCount}`);
    console.log(`\n👉 Courses visible on /courses page: ${publishedCount + undefinedCount}`);
    console.log('='.repeat(80) + '\n');
    
    if (publishedCount + undefinedCount === 0) {
      console.log('⚠️ NO VISIBLE COURSES!');
      console.log('💡 Fix: All courses have published=false. Run the fix script to update them.');
    } else {
      console.log('✅ Courses should be visible on /courses page');
    }
    
  } catch (error) {
    console.error('❌ Error checking courses:', error);
    console.error('Make sure you are on a page where Firebase is initialized');
  }
})();
