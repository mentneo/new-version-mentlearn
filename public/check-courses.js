// Test script to check and create sample courses
// Run this from the browser console

async function checkAndCreateCourses() {
  try {
    console.log('Checking for courses...');
    
    // Import Firebase functions
    const { db } = await import('./src/firebase/firebase.js');
    const { collection, getDocs, addDoc, query, where } = await import('firebase/firestore');
    
    // Check existing courses
    const coursesRef = collection(db, 'courses');
    const coursesSnapshot = await getDocs(coursesRef);
    
    console.log(`Found ${coursesSnapshot.size} courses in database`);
    
    if (coursesSnapshot.size === 0) {
      console.log('No courses found! Creating sample courses...');
      
      // Sample courses to create
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
            { id: 1, title: 'HTML Basics', duration: '2 hours' },
            { id: 2, title: 'CSS Fundamentals', duration: '3 hours' },
            { id: 3, title: 'JavaScript Introduction', duration: '4 hours' }
          ],
          creatorId: 'sample-creator-1',
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
            { id: 1, title: 'Python Basics', duration: '3 hours' },
            { id: 2, title: 'Data Structures', duration: '4 hours' },
            { id: 3, title: 'Object-Oriented Programming', duration: '5 hours' }
          ],
          creatorId: 'sample-creator-2',
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
            { id: 1, title: 'SEO Basics', duration: '2 hours' },
            { id: 2, title: 'Social Media Marketing', duration: '3 hours' },
            { id: 3, title: 'Content Strategy', duration: '2 hours' }
          ],
          creatorId: 'sample-creator-3',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: 'Data Science with Python',
          description: 'Analyze data and build machine learning models with Python',
          category: 'Data Science',
          level: 'Advanced',
          price: '2499',
          duration: '12 weeks',
          published: true,
          thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
          modules: [
            { id: 1, title: 'Data Analysis', duration: '4 hours' },
            { id: 2, title: 'Machine Learning', duration: '6 hours' },
            { id: 3, title: 'Deep Learning', duration: '8 hours' }
          ],
          creatorId: 'sample-creator-4',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      // Add courses to Firestore
      for (const course of sampleCourses) {
        const docRef = await addDoc(coursesRef, course);
        console.log(`✅ Created course: ${course.title} (ID: ${docRef.id})`);
      }
      
      console.log('\n✅ Sample courses created successfully!');
      console.log('Refresh the page to see the courses.');
      
    } else {
      console.log('\nExisting courses:');
      coursesSnapshot.forEach((doc, index) => {
        const course = doc.data();
        console.log(`${index + 1}. ${course.title} (Published: ${course.published ? 'Yes' : 'No'})`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the function
checkAndCreateCourses();
