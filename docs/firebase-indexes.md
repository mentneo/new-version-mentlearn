# Firebase Indexes for Mentneo

This document lists the Firestore indexes required for efficient querying in the Mentneo platform.

## Dashboard Queries

For the admin dashboard, the following indexes are needed:

### Users Collection

1. **Recent Students Query**
   - Fields: `role` (Ascending), `createdAt` (Descending)
   - Purpose: Get recent students for the admin dashboard

2. **Recent Mentors Query**
   - Fields: `role` (Ascending), `createdAt` (Descending) 
   - Purpose: Get recent mentors for the admin dashboard

### Payments Collection

1. **Recent Payments Query**
   - Fields: `timestamp` (Descending)
   - Purpose: Get recent payments for the admin dashboard

## Creating Indexes

These indexes can be created in the Firebase Console under Firestore > Indexes > Composite, or by using the Firebase CLI with the following command:

```bash
firebase deploy --only firestore:indexes
```

Make sure you have the appropriate index definitions in your `firestore.indexes.json` file.
