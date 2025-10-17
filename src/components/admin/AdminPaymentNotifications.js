import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';

const AdminPaymentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'adminNotifications'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setNotifications(newNotifications);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Payment Notifications</h2>
      </div>

      <div className="divide-y divide-gray-200">
        {notifications.map((notification) => (
          <div key={notification.id} className="p-4 hover:bg-gray-50">
            <div className="flex items-start space-x-3">
              {/* Notification Icon */}
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-100">
                  <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              </div>

              {/* Notification Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {notification.title || 'New Payment Received'}
                </p>
                <p className="text-sm text-gray-500">
                  {notification.message}
                </p>
                {notification.createdAt && (
                  <p className="mt-1 text-xs text-gray-400">
                    {notification.createdAt.toLocaleString()}
                  </p>
                )}
              </div>

              {/* Status Badge */}
              {notification.status && (
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${notification.status === 'success' ? 'bg-green-100 text-green-800' : 
                      notification.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-gray-100 text-gray-800'}`}>
                    {notification.status}
                  </span>
                </div>
              )}
            </div>

            {/* Additional Details */}
            {notification.details && (
              <div className="mt-2 text-sm text-gray-500">
                <div className="bg-gray-50 rounded p-2">
                  <pre className="whitespace-pre-wrap font-mono text-xs">
                    {JSON.stringify(notification.details, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No notifications yet
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPaymentNotifications;