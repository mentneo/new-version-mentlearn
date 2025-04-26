import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/firebase';

/**
 * Simple direct utility for uploading to Firebase Storage
 * Use this as a fallback if the regular utility fails
 */
export default async function uploadToFirebaseStorage(file) {
  console.log("Using direct upload utility");
  
  // Create a safe filename
  const filename = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
  const path = `courses/emergency/${Date.now()}_${filename}`;
  
  // Create storage reference
  const storageRef = ref(storage, path);
  
  // Upload file
  const snapshot = await uploadBytes(storageRef, file);
  
  // Get download URL
  return await getDownloadURL(snapshot.ref);
}
