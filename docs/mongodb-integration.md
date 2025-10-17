# MongoDB Integration in MentNeo Backend

## Overview
This document describes the MongoDB integration in the MentNeo backend application. MongoDB is used for structured data while Firestore handles real-time data.

## MongoDB Connection Setup
The MongoDB connection is established in `src/config/mongodb.js` which exports:
- `connectMongo`: Function to establish a connection to the MongoDB database
- `mongoose`: The Mongoose instance for creating models and schemas

## Models Created/Updated
The following Mongoose models have been defined:

1. **User Model** (`src/models/User.js`)
   - Basic user information
   - Authentication details
   - Role-based access (admin, mentor, student, guest)

2. **Student Model** (`src/models/Student.js`)
   - Student profile
   - Course enrollment tracking
   - Extended from User model concept

3. **Course Model** (`src/models/Course.js`)
   - Course details including title, description, tags
   - Pricing and publication status

## API Routes
The backend exposes these MongoDB-based APIs:

1. **User Routes** (`/api/users`)
   - CRUD operations for user accounts
   - Authentication (register, login, profile)

2. **Course Routes** (`/api/courses`)
   - CRUD operations for courses
   - Course listings and details

3. **Student Routes** (`/api/students`)
   - Student profile management
   - Course enrollment tracking

4. **Progress Routes** (`/api/progress`)
   - Course progress tracking (hybrid with Firestore)

5. **Demo Booking Routes** (`/api/demo-bookings`)
   - Booking management for course demos (hybrid with Firestore)

## Environment Configuration
MongoDB connection requires these environment variables:

```
MONGODB_URI=mongodb://localhost:27017/mentneo  # Example local connection
```

For production, use a proper MongoDB Atlas or other hosted MongoDB URI.

## Next Steps
1. Add proper authentication middleware using JWT
2. Implement data validation
3. Add indexes for performance optimization
4. Set up proper error handling and logging

## API Documentation
See the full API documentation in `/docs/api-reference.md` for details on all available endpoints and request/response formats.