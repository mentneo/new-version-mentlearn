# Dual Storage Architecture: MongoDB + Firebase

This document outlines the implementation of our dual storage architecture that stores user activities, course progress, and transactions in both MongoDB and Firebase.

## Overview

For each user action in the system (signup, login, course viewing, quiz completion, etc.), data is stored in:

1. **MongoDB**: For structured data, analytics, reporting, and historical records
2. **Firebase/Firestore**: For real-time data access, current state, and live updates

## Data Models

### MongoDB Models

1. **Activity Model**
   - Tracks all user actions (signup, login, course views, quiz attempts, etc.)
   - Stores detailed context (IP address, device info, timestamps)
   - Used for audit trails and analytics

2. **UserProgress Model**
   - Stores detailed course progress (modules, lessons, quizzes completed)
   - Maintains comprehensive history of user learning journey
   - Used for reports, certificates, and admin dashboards

3. **Transaction Model**
   - Records all payment transactions (course purchases, subscriptions, refunds)
   - Stores payment details, invoice information, and subscription status
   - Used for financial reporting and reconciliation

### Firebase Collections

1. **activities**
   - Real-time feed of recent user activities
   - Lightweight records with essential fields only
   - Used for activity feeds and notifications

2. **userProgress**
   - Current state of user progress in courses
   - Fast access for live progress indicators
   - Used for dashboards and progress bars

3. **transactions**
   - Recent transaction status
   - Used for payment confirmations and receipts

## Synchronization Process

The `ActivityService` class handles the dual-storage logic:

1. When an activity is recorded:
   - First stores complete data in MongoDB
   - Then syncs essential data to Firebase Firestore
   - Handles any derived updates (e.g., quiz completion updates progress)

2. Firebase serves as the "current state" and "real-time" layer:
   - Provides immediate feedback to users
   - Enables live notifications and updates
   - Maintains lightweight recent history

3. MongoDB serves as the "system of record" and "historical archive":
   - Stores all historical data with full detail
   - Powers analytics, reporting, and data exports
   - Provides data integrity and relationships

## Implementation Components

1. **Server-side Components**:
   - `ActivityService.js`: Core service for dual storage logic
   - `activityController.js`: API endpoints for activity data
   - `activityTracker.js` (middleware): Automatic activity tracking

2. **Client-side Components**:
   - `activityTracker.js`: Client-side helper for tracking activities
   - Integrates with React components for seamless tracking

## Example Flow: Quiz Completion

1. User completes a quiz in the frontend
2. Client-side tracker sends data to backend API
3. Backend `ActivityService`:
   - Stores complete quiz data in MongoDB Activity collection
   - Updates UserProgress model with new quiz results
   - Recalculates module and course completion percentages
   - Syncs updated progress data to Firebase
4. Frontend receives real-time updates via Firebase
5. User sees immediate progress updates

## Benefits of Dual Storage

1. **Performance**: Fast reads from Firebase for current state
2. **Reliability**: Comprehensive data storage in MongoDB
3. **Real-time Updates**: Live feedback and notifications via Firebase
4. **Analytics**: Rich historical data in MongoDB for reporting
5. **Scalability**: Each database handles what it does best

## Deployment Considerations

1. Ensure both MongoDB and Firebase connections are properly configured
2. Set up proper error handling for sync failures
3. Consider implementing a retry mechanism for failed syncs
4. Monitor sync performance and optimize as needed

## Next Steps

1. Implement admin dashboard using aggregated MongoDB data
2. Add background process to verify and repair any sync discrepancies
3. Enhance analytics capabilities with MongoDB aggregation pipeline
4. Add data export functionality for reporting