/**
 * Handles Firebase errors and provides user-friendly messages
 * @param {Error} error - The error from Firebase
 * @returns {string} A user-friendly error message
 */
export const handleFirebaseError = (error) => {
  console.error('Firebase Error:', error);
  
  // Common Firebase Auth errors
  const errorCode = error.code;
  
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/operation-not-allowed':
      return 'This operation is not allowed.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email but different sign-in credentials.';
    case 'auth/requires-recent-login':
      return 'Please log in again before retrying this request.';
    case 'auth/user-disabled':
      return 'This account has been disabled by an administrator.';
    case 'permission-denied':
    case 'PERMISSION_DENIED':
      return 'You do not have permission to perform this action. Make sure you are logged in with the correct account.';
    case 'unavailable':
      return 'The service is currently unavailable. Please try again later.';
    case 'not-found':
      return 'The requested resource was not found.';
    case 'already-exists':
      return 'The document or resource already exists.';
    default:
      return error.message || 'An unknown error occurred. Please try again.';
  }
};
