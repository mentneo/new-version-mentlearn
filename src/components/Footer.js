import React, { useContext, useState, useEffect, createContext } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  doc, getDoc, setDoc, collection, getDocs,
  query, where, updateDoc, arrayUnion, increment
} from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState(null);

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
      
      // Handle referral if present
      if (extraData.referredBy) {
        await handleReferral(userCredential.user.uid, extraData.referredBy);
      }
      
      return userCredential;
    } catch (error) {
      console.error("Error during signup:", error);
      throw error;
    }
  }
  
  // Process a referral when a new user signs up
  async function handleReferral(newUserId, referralCode) {
    try {
      // Find the user who referred the new user
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("referralCode", "==", referralCode));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const referrerDoc = querySnapshot.docs[0];
        const referrerId = referrerDoc.id;
        
        // Get new user's data
        const newUserDoc = await getDoc(doc(db, "users", newUserId));
        const newUserData = newUserDoc.data();
        
        // Update the referrals document
        const referralRef = doc(db, "referrals", referrerId);
        const referralDoc = await getDoc(referralRef);
        
        if (referralDoc.exists()) {
          // Add the new referral to history
          await updateDoc(referralRef, {
            totalReferrals: increment(1),
            pendingReferrals: increment(1),
            referralHistory: arrayUnion({
              userId: newUserId,
              name: newUserData.firstName + ' ' + newUserData.lastName || newUserData.email,
              email: newUserData.email,
              date: new Date(),
              status: 'pending'
            })
          });
        }
        
        // Update the new user to record who referred them
        await updateDoc(doc(db, "users", newUserId), {
          referredBy: referrerId,
          referralCode: referralCode
        });
        
        console.log(`Referral processed: User ${newUserId} was referred by ${referrerId}`);
      } else {
        console.log(`No user found with referral code: ${referralCode}`);
      }
    } catch (error) {
      console.error("Error processing referral:", error);
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

      // First check users collection
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const role = userDoc.data().role;
        setUserRole(role);
        return role;
      }

      // If not found in users, check creators collection
      const creatorDoc = await getDoc(doc(db, "creators", uid));
      if (creatorDoc.exists()) {
        const role = 'creator';
        setUserRole(role);
        return role;
      }

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

      return null;
    } catch (error) {
      console.error("Error getting user role:", error);
      return null;
    }
  }

  // Consolidated function to fetch user data
  async function fetchUserData(uid) {
    try {
      // First check users collection
      let userDoc = await getDoc(doc(db, 'users', uid));
      let userData = null;
      let isCreator = false;
      
      if (userDoc.exists()) {
        userData = userDoc.data();
      } else {
        // Check creators collection
        const creatorDoc = await getDoc(doc(db, 'creators', uid));
        if (creatorDoc.exists()) {
          userData = creatorDoc.data();
          isCreator = true;
        }
      }
      
      if (userData) {
        // Update user states
        setUserDetails(userData);
        setUserRole(isCreator ? 'creator' : (userData.role || 'student'));
        setOnboardingComplete(userData.onboardingComplete || false);
        
        // Set payment status
        setPaymentStatus({
          hasPaid: userData.hasPaid || false,
          accessGranted: userData.accessGranted || false,
          accessLevel: userData.accessLevel || 'free',
          verificationStatus: userData.verificationStatus || null
        });
        
        // Set subscription plan
        setSubscriptionPlan(userData.planId || null);
        
        return {
          uid: uid,
          email: userData.email,
          role: isCreator ? 'creator' : (userData.role || 'student'),
          ...userData
        };
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  }

  // Add a new function to create data analyst users
  async function createDataAnalyst(email, password, name) {
    try {
      // Create the user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document with data_analyst role
      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        role: 'data_analyst',
        name: name || email.split('@')[0],
        createdAt: new Date().toISOString(),
        onboardingComplete: true
      };

      await setDoc(doc(db, "users", userCredential.user.uid), userData);
      
      return userCredential;
    } catch (error) {
      console.error("Error creating data analyst:", error);
      throw error;
    }
  }
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      
      if (user) {
        try {
          const userData = await fetchUserData(user.uid);
          
          if (userData) {
            setCurrentUser(userData);
          } else {
            // No user document found, create default user object
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              role: 'student' // Default role
            });
            setOnboardingComplete(false);
            setUserDetails(null);
            setPaymentStatus(null);
            setSubscriptionPlan(null);
          }
        } catch (error) {
          console.error("Error in auth state change:", error);
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            role: 'student' // Default role
          });
          setOnboardingComplete(false);
        }
      } else {
        setCurrentUser(null);
        setOnboardingComplete(null);
        setUserDetails(null);
        setUserRole(null);
        setPaymentStatus(null);
        setSubscriptionPlan(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);
  
  const value = {
    currentUser,
    userRole,
    onboardingComplete,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    getUserRole,
    userDetails,
    paymentStatus,
    subscriptionPlan,
    createDataAnalyst // Add the new function to the context value
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}