// User Profile Schema

/**
 * Firebase Firestore User Profile Schema
 * Collection: users
 * Document ID: User UID from Firebase Authentication
 */
const userProfileSchema = {
  // Basic Information
  uid: "string", // Firebase Auth User ID
  email: "string", // User's email
  firstName: "string", // User's first name
  lastName: "string", // User's last name
  displayName: "string", // Combined name (firstName + lastName)
  phone: "string", // Phone number
  bio: "string", // User bio/about me
  location: "string", // User's location/city
  
  // Profile Image
  profileImageUrl: "string", // URL to profile image (Cloudinary or Firebase Storage)
  
  // Education & Skills
  education: [
    {
      institution: "string", // School/University name
      degree: "string", // Degree/Certificate obtained
      fieldOfStudy: "string", // Field of study
      startYear: "number", // Start year
      endYear: "number", // End year (or expected graduation)
      description: "string" // Additional information
    }
  ],
  skills: ["string"], // Array of skills
  
  // Work Experience
  experience: [
    {
      company: "string", // Company name
      position: "string", // Job title
      startDate: "timestamp", // Start date
      endDate: "timestamp", // End date (null if current)
      isCurrent: "boolean", // Whether this is the current job
      description: "string" // Job description
    }
  ],
  
  // Personal Interests
  interests: ["string"], // Array of interests
  
  // Social Media Links
  socialLinks: {
    linkedin: "string", // LinkedIn profile URL
    github: "string", // GitHub profile URL
    twitter: "string", // Twitter profile URL
    website: "string", // Personal website URL
    other: "string" // Other social media URL
  },
  
  // Course Progress & Preferences
  enrolledCourses: ["string"], // Array of course IDs the user is enrolled in
  completedCourses: ["string"], // Array of course IDs the user has completed
  coursesInProgress: ["string"], // Array of course IDs the user is currently taking
  preferredLanguages: ["string"], // Programming languages preference
  learningPreferences: ["string"], // Learning style preferences
  
  // Account & App Settings
  notificationPreferences: {
    email: "boolean", // Receive email notifications
    browser: "boolean", // Receive browser notifications
    mobile: "boolean" // Receive mobile notifications
  },
  themePreference: "string", // 'light', 'dark', or 'system'
  
  // Timestamps
  createdAt: "timestamp", // When the user account was created
  updatedAt: "timestamp", // When the user profile was last updated
  lastLogin: "timestamp" // When the user last logged in
};

/**
 * Usage in Firebase:
 * 
 * Retrieving user profile:
 * ```
 * const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
 * if (userDoc.exists()) {
 *   const userData = userDoc.data();
 *   // Use userData...
 * }
 * ```
 * 
 * Updating user profile:
 * ```
 * const userRef = doc(db, 'users', currentUser.uid);
 * await updateDoc(userRef, {
 *   firstName: profileData.firstName,
 *   lastName: profileData.lastName,
 *   // Other fields...
 *   updatedAt: new Date()
 * });
 * ```
 */

export default userProfileSchema;