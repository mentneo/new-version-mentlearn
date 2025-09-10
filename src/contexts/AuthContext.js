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
        const referrerData = referrerDoc.data();
        
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

  // Add payment status and subscription plan check to user data fetching
  useEffect(() => {
    if (currentUser) {
      const fetchUserDetails = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserDetails(userData);
            
            // Set payment status with verification status
            setPaymentStatus({
              hasPaid: userData.hasPaid || false,
              accessGranted: userData.accessGranted || false,
              accessLevel: userData.accessLevel || 'free',
              verificationStatus: userData.verificationStatus || null
            });
            
            // Set subscription plan
            setSubscriptionPlan(userData.planId || null);
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      };
      
      fetchUserDetails();
    } else {
      setUserDetails(null);
      setPaymentStatus(null);
      setSubscriptionPlan(null);
    }
  }, [currentUser]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      
      if (user) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              ...userData
            });
            
            // Set onboarding status
            setOnboardingComplete(userData.onboardingComplete || false);
          } else {
            setCurrentUser({
              uid: user.uid,
              email: user.email
            });
            setOnboardingComplete(false);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setCurrentUser({
            uid: user.uid,
            email: user.email
          });
          setOnboardingComplete(false);
        }
      } else {
        setCurrentUser(null);
        setOnboardingComplete(null);
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
    subscriptionPlan
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
