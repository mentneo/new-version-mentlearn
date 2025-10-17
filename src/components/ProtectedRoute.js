import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase.js';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { currentUser, userRole: contextUserRole, ensureUserDocument } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    async function checkUserRole() {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        // If we already have the role in context, use it
        if (contextUserRole) {
          setUserRole(contextUserRole);
          setLoading(false);
          return;
        }

        // Use ensureUserDocument to both get and create user document if needed
        const role = await ensureUserDocument(currentUser);
        setUserRole(role);
      } catch (error) {
        console.error("Error checking user role:", error);
      } finally {
        setLoading(false);
      }
    }

    checkUserRole();
  }, [currentUser, contextUserRole, ensureUserDocument]);

  if (loading) {
    // Return a loading indicator
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!currentUser) {
    console.log("Not logged in, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // For first time users with no role set, allow access (they'll be admins)
  if (!userRole) {
    console.log("No role found, treating as admin");
    return children;
  }

  // Check if user's role is in allowedRoles
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    console.log("Unauthorized access, current role:", userRole, "allowed roles:", allowedRoles);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
