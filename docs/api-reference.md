# MentNeo API Documentation

## Authentication Endpoints

### Register
- **URL:** `/api/users/register`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```
- **Response:** `201 Created`
  ```json
  {
    "message": "Registration successful",
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "isActive": true,
      "createdAt": "2025-10-16T12:00:00.000Z",
      "updatedAt": "2025-10-16T12:00:00.000Z"
    }
  }
  ```

### Login
- **URL:** `/api/users/login`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "message": "Login successful",
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "isActive": true,
      "lastLogin": "2025-10-16T12:00:00.000Z",
      "createdAt": "2025-10-16T12:00:00.000Z",
      "updatedAt": "2025-10-16T12:00:00.000Z"
    }
  }
  ```

### Get Current User
- **URL:** `/api/users/me`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer user_id`
- **Response:** `200 OK`
  ```json
  {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "isActive": true,
    "lastLogin": "2025-10-16T12:00:00.000Z",
    "createdAt": "2025-10-16T12:00:00.000Z",
    "updatedAt": "2025-10-16T12:00:00.000Z"
  }
  ```

## User Management Endpoints

### Get All Users
- **URL:** `/api/users`
- **Method:** `GET`
- **Query Parameters:**
  - `role`: Filter by role (e.g., `admin`, `mentor`, `student`)
  - `isActive`: Filter by active status (`true` or `false`)
  - `page`: Page number for pagination
  - `limit`: Number of results per page
- **Headers:** `Authorization: Bearer user_id`
- **Response:** `200 OK`
  ```json
  {
    "users": [
      {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "student",
        "isActive": true,
        "createdAt": "2025-10-16T12:00:00.000Z",
        "updatedAt": "2025-10-16T12:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "pages": 5
    }
  }
  ```

### Get User by ID
- **URL:** `/api/users/:id`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer user_id`
- **Response:** `200 OK`
  ```json
  {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "isActive": true,
    "createdAt": "2025-10-16T12:00:00.000Z",
    "updatedAt": "2025-10-16T12:00:00.000Z"
  }
  ```

### Create User
- **URL:** `/api/users`
- **Method:** `POST`
- **Headers:** `Authorization: Bearer user_id`
- **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "securepassword",
    "role": "mentor"
  }
  ```
- **Response:** `201 Created`
  ```json
  {
    "_id": "user_id",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "mentor",
    "isActive": true,
    "createdAt": "2025-10-16T12:00:00.000Z",
    "updatedAt": "2025-10-16T12:00:00.000Z"
  }
  ```

### Update User
- **URL:** `/api/users/:id`
- **Method:** `PUT`
- **Headers:** `Authorization: Bearer user_id`
- **Request Body:**
  ```json
  {
    "name": "Jane Smith",
    "role": "admin"
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "_id": "user_id",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "admin",
    "isActive": true,
    "createdAt": "2025-10-16T12:00:00.000Z",
    "updatedAt": "2025-10-16T12:00:00.000Z"
  }
  ```

### Delete User
- **URL:** `/api/users/:id`
- **Method:** `DELETE`
- **Headers:** `Authorization: Bearer user_id`
- **Response:** `200 OK`
  ```json
  {
    "message": "User deleted successfully"
  }
  ```

## Course Endpoints

### Get All Courses
- **URL:** `/api/courses`
- **Method:** `GET`
- **Response:** `200 OK`
  ```json
  [
    {
      "_id": "course_id",
      "title": "Full Stack Development",
      "slug": "full-stack-development",
      "description": "Learn full stack web development",
      "tags": ["javascript", "react", "node"],
      "price": 199.99,
      "published": true,
      "createdAt": "2025-10-16T12:00:00.000Z",
      "updatedAt": "2025-10-16T12:00:00.000Z"
    }
  ]
  ```

### Get Course by ID
- **URL:** `/api/courses/:id`
- **Method:** `GET`
- **Response:** `200 OK`
  ```json
  {
    "_id": "course_id",
    "title": "Full Stack Development",
    "slug": "full-stack-development",
    "description": "Learn full stack web development",
    "tags": ["javascript", "react", "node"],
    "price": 199.99,
    "published": true,
    "createdAt": "2025-10-16T12:00:00.000Z",
    "updatedAt": "2025-10-16T12:00:00.000Z"
  }
  ```

### Create Course
- **URL:** `/api/courses`
- **Method:** `POST`
- **Headers:** `Authorization: Bearer user_id`
- **Request Body:**
  ```json
  {
    "title": "Data Science Fundamentals",
    "slug": "data-science-fundamentals",
    "description": "Learn the basics of data science",
    "tags": ["python", "data-analysis", "machine-learning"],
    "price": 249.99,
    "published": false
  }
  ```
- **Response:** `201 Created`
  ```json
  {
    "_id": "course_id",
    "title": "Data Science Fundamentals",
    "slug": "data-science-fundamentals",
    "description": "Learn the basics of data science",
    "tags": ["python", "data-analysis", "machine-learning"],
    "price": 249.99,
    "published": false,
    "createdAt": "2025-10-16T12:00:00.000Z",
    "updatedAt": "2025-10-16T12:00:00.000Z"
  }
  ```

### Update Course
- **URL:** `/api/courses/:id`
- **Method:** `PUT`
- **Headers:** `Authorization: Bearer user_id`
- **Request Body:**
  ```json
  {
    "price": 199.99,
    "published": true
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "_id": "course_id",
    "title": "Data Science Fundamentals",
    "slug": "data-science-fundamentals",
    "description": "Learn the basics of data science",
    "tags": ["python", "data-analysis", "machine-learning"],
    "price": 199.99,
    "published": true,
    "createdAt": "2025-10-16T12:00:00.000Z",
    "updatedAt": "2025-10-16T12:00:00.000Z"
  }
  ```

## Student Endpoints

### Get All Students
- **URL:** `/api/students`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer user_id`
- **Response:** `200 OK`
  ```json
  [
    {
      "_id": "student_id",
      "name": "John Doe",
      "email": "john@example.com",
      "enrolledCourses": ["course_id1", "course_id2"],
      "createdAt": "2025-10-16T12:00:00.000Z",
      "updatedAt": "2025-10-16T12:00:00.000Z"
    }
  ]
  ```

### Get Student by ID
- **URL:** `/api/students/:id`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer user_id`
- **Response:** `200 OK`
  ```json
  {
    "_id": "student_id",
    "name": "John Doe",
    "email": "john@example.com",
    "enrolledCourses": ["course_id1", "course_id2"],
    "createdAt": "2025-10-16T12:00:00.000Z",
    "updatedAt": "2025-10-16T12:00:00.000Z"
  }
  ```

### Create Student
- **URL:** `/api/students`
- **Method:** `POST`
- **Headers:** `Authorization: Bearer user_id`
- **Request Body:**
  ```json
  {
    "name": "Alice Brown",
    "email": "alice@example.com",
    "enrolledCourses": ["course_id1"]
  }
  ```
- **Response:** `201 Created`
  ```json
  {
    "_id": "student_id",
    "name": "Alice Brown",
    "email": "alice@example.com",
    "enrolledCourses": ["course_id1"],
    "createdAt": "2025-10-16T12:00:00.000Z",
    "updatedAt": "2025-10-16T12:00:00.000Z"
  }
  ```

### Update Student
- **URL:** `/api/students/:id`
- **Method:** `PUT`
- **Headers:** `Authorization: Bearer user_id`
- **Request Body:**
  ```json
  {
    "name": "Alice Smith",
    "enrolledCourses": ["course_id1", "course_id2"]
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "_id": "student_id",
    "name": "Alice Smith",
    "email": "alice@example.com",
    "enrolledCourses": ["course_id1", "course_id2"],
    "createdAt": "2025-10-16T12:00:00.000Z",
    "updatedAt": "2025-10-16T12:00:00.000Z"
  }
  ```

## Progress Endpoints

### Get Student Progress
- **URL:** `/api/progress`
- **Method:** `GET`
- **Query Parameters:**
  - `studentId`: ID of the student
  - `courseId`: (optional) ID of the course
- **Headers:** `Authorization: Bearer user_id`
- **Response:** `200 OK`
  ```json
  {
    "studentId": "student_id",
    "coursesProgress": [
      {
        "courseId": "course_id1",
        "modulesCompleted": 3,
        "totalModules": 5,
        "percentComplete": 60,
        "lastActivity": "2025-10-16T12:00:00.000Z"
      }
    ]
  }
  ```

### Sync Progress
- **URL:** `/api/progress`
- **Method:** `POST`
- **Headers:** `Authorization: Bearer user_id`
- **Request Body:**
  ```json
  {
    "studentId": "student_id",
    "courseId": "course_id1",
    "moduleId": "module_id",
    "completed": true,
    "timeSpent": 1200
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "message": "Progress updated successfully",
    "updatedProgress": {
      "courseId": "course_id1",
      "modulesCompleted": 4,
      "totalModules": 5,
      "percentComplete": 80,
      "lastActivity": "2025-10-16T12:00:00.000Z"
    }
  }
  ```

## Demo Booking Endpoints

### Get All Demo Bookings
- **URL:** `/api/demo-bookings`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer user_id`
- **Response:** `200 OK`
  ```json
  [
    {
      "id": "booking_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "course": "Full Stack Development",
      "preferredDate": "2025-10-20T14:00:00.000Z",
      "status": "pending",
      "createdAt": "2025-10-16T12:00:00.000Z"
    }
  ]
  ```

### Create Demo Booking
- **URL:** `/api/demo-bookings`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "course": "Full Stack Development",
    "preferredDate": "2025-10-20T14:00:00.000Z",
    "message": "I'm interested in learning more about this course."
  }
  ```
- **Response:** `201 Created`
  ```json
  {
    "id": "booking_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "course": "Full Stack Development",
    "preferredDate": "2025-10-20T14:00:00.000Z",
    "status": "pending",
    "message": "I'm interested in learning more about this course.",
    "createdAt": "2025-10-16T12:00:00.000Z"
  }
  ```

### Update Demo Booking Status
- **URL:** `/api/demo-bookings/:id`
- **Method:** `PUT`
- **Headers:** `Authorization: Bearer user_id`
- **Request Body:**
  ```json
  {
    "status": "confirmed",
    "notes": "Scheduled with instructor Alex"
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "id": "booking_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "course": "Full Stack Development",
    "preferredDate": "2025-10-20T14:00:00.000Z",
    "status": "confirmed",
    "notes": "Scheduled with instructor Alex",
    "createdAt": "2025-10-16T12:00:00.000Z",
    "updatedAt": "2025-10-16T12:00:00.000Z"
  }
  ```