import React, { useContext, useState, useEffect, createContext } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if this is the first user to sign up (for admin assignment)
  async function isFirstUser() {
    try {
      const usersRef = collection(db, "users");
      const querySnapshot = await getDocs(usersRef);
      return querySnapshot.empty;
    } catch (error) {
      console.error("Error checking if first user:", error);
      return false;
    }
  }

  async function signup(email, password, extraData = {}) {
    try {
      // Check if this is the first user (will be admin)
      const firstUser = await isFirstUser();
      
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Assign role - first user is always admin
      const role = firstUser ? 'admin' : (extraData.role || 'student');
      console.log(`Creating new user with role: ${role} (first user: ${firstUser})`);
      
      // Create user document
      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        role: role,
        name: extraData.name || email.split('@')[0],
        createdAt: new Date().toISOString(),
        ...extraData
      };

      await setDoc(doc(db, "users", userCredential.user.uid), userData);
      
      return userCredential;
    } catch (error) {
      console.error("Error during signup:", error);
      throw error;
    }
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  async function getUserRole(uid) {
    try {
      // If no users exist yet, this will be the first admin
      const isFirst = await isFirstUser();
      if (isFirst) {
        return 'admin';
      }

      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const role = userDoc.data().role;
        setUserRole(role);
        return role;
      } else {
        // Create a user document if it doesn't exist yet
        console.log("Creating missing user document with default role");
        const user = auth.currentUser;
        if (user) {
          const userData = {
            uid: user.uid,
            email: user.email,
            role: 'admin', // Default to admin during initial setup
            name: user.email?.split('@')[0] || 'User',
            createdAt: new Date().toISOString()
          };
          await setDoc(doc(db, "users", user.uid), userData);
          setUserRole('admin');
          return 'admin';
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error getting user role:", error);
      return null;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed. User:", user?.uid);
      
      if (user) {
        setCurrentUser(user);
        const role = await getUserRole(user.uid);
        console.log("User role:", role);
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    login,
    signup,
    logout,
    resetPassword,
    getUserRole
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
