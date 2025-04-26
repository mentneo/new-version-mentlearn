import { doc, getDoc, setDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../firebase/firebase';

/**
 * Runs initial setup procedures for a fresh installation
 * @param {string} uid - The current user's UID
 * @param {string} email - The current user's email
 */
export const runFirstTimeSetup = async (uid, email) => {
  try {
    console.log("Running first-time setup checks...");
    
    // Check if user document exists
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.log("Creating admin user document for first-time setup");
      await setDoc(userDocRef, {
        uid: uid,
        email: email,
        name: email.split('@')[0], // Default name from email
        role: 'admin', // First user is admin
        createdAt: new Date().toISOString()
      });
      console.log("Admin user document created successfully");
      return true;
    }
    
    // Check if any courses exist
    const coursesSnapshot = await getDocs(collection(db, "courses"));
    if (coursesSnapshot.empty) {
      console.log("No courses found - this appears to be a fresh installation");
      return true;
    }
    
    console.log("First-time setup checks completed, system appears to be configured");
    return false;
  } catch (error) {
    console.error("Error during first-time setup:", error);
    return false;
  }
};
