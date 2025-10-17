# Mentor Pages Redesign - Student Design Integration

## Overview
This document outlines the complete redesign of all mentor pages to match the LearnIQ student design aesthetic and enable full bi-directional feature connectivity between mentors and students.

## Design System Matching

### Colors & Gradients
- **Background**: `bg-gradient-to-br from-purple-50 via-white to-blue-50`
- **Primary Color**: Indigo (#4F46E5)
- **Accent Colors**: Blue, Green, Yellow, Red for status indicators
- **Card Background**: White with subtle shadow (`shadow-sm hover:shadow-md`)

### Typography
- **Headings**: `text-4xl font-bold text-gray-900` for main titles
- **Body Text**: `text-gray-600` for descriptions
- **Small Text**: `text-sm text-gray-500` for metadata

### Components
- **Stat Cards**: White background, rounded-xl, with colored icon backgrounds
- **Charts**: Recharts library for data visualization
- **Animations**: Framer Motion for smooth transitions
- **Icons**: react-icons/fi (Feather Icons)

## Firestore Collections for Bi-Directional Features

### 1. mentorStudents (Relationships)
```javascript
{
  id: "auto-generated",
  mentorId: "user-uid",
  studentId: "user-uid",
  assignedAt: Timestamp,
  status: "active" | "inactive"
}
```

### 2. assignments (Shared between Mentor & Student)
```javascript
{
  id: "auto-generated",
  title: "Assignment Title",
  description: "Description",
  courseId: "course-id",
  createdBy: "mentor-uid",
  studentIds: ["student-uid-1", "student-uid-2"],
  dueDate: Timestamp,
  points: 100,
  status: "active" | "closed",
  createdAt: Timestamp
}
```

### 3. submissions (Student submissions for mentor review)
```javascript
{
  id: "auto-generated",
  assignmentId: "assignment-id",
  studentId: "student-uid",
  mentorId: "mentor-uid",
  submittedAt: Timestamp,
  submissionText: "Student response",
  attachmentUrl: "optional-file-url",
  status: "submitted" | "graded",
  grade: 0-100,
  feedback: "Mentor feedback",
  gradedAt: Timestamp,
  gradedBy: "mentor-uid"
}
```

### 4. notifications (Bi-directional notifications)
```javascript
{
  id: "auto-generated",
  userId: "recipient-uid",
  type: "assignment" | "grade" | "message" | "event",
  title: "Notification Title",
  message: "Notification message",
  fromUserId: "sender-uid",
  read: false,
  timestamp: Timestamp,
  link: "/path/to/action"
}
```

### 5. mentorEvents (Calendar events, can be shared with students)
```javascript
{
  id: "auto-generated",
  mentorId: "mentor-uid",
  title: "Event Title",
  description: "Description",
  date: Timestamp,
  startTime: "09:00",
  endTime: "10:00",
  type: "meeting" | "session" | "reminder",
  color: "#4F46E5",
  studentIds: ["student-uid-1"], // Optional: students who can see this event
  reminder: "15" // minutes before
}
```

### 6. studentEvents (Student calendar, mentors can see)
```javascript
{
  id: "auto-generated",
  studentId: "student-uid",
  title: "Event Title",
  description: "Description",
  date: Timestamp,
  startTime: "09:00",
  endTime: "10:00",
  type: "study" | "assignment" | "meeting" | "reminder",
  color: "#4F46E5",
  isAssignment: false
}
```

### 7. enrollments (Course enrollments)
```javascript
{
  id: "auto-generated",
  studentId: "student-uid",
  courseId: "course-id",
  status: "in-progress" | "completed",
  progress: 0-100,
  enrolledAt: Timestamp
}
```

### 8. lessonProgress (Lesson completion tracking)
```javascript
{
  id: "auto-generated",
  studentId: "student-uid",
  courseId: "course-id",
  lessonId: "lesson-id",
  completed: true | false,
  completedAt: Timestamp,
  timeSpent: 0 // minutes
}
```

### 9. studyTime (Time tracking for analytics)
```javascript
{
  id: "auto-generated",
  studentId: "student-uid",
  courseId: "course-id",
  duration: 0, // minutes
  timestamp: Timestamp
}
```

### 10. certificates (Achievement tracking)
```javascript
{
  id: "auto-generated",
  studentId: "student-uid",
  courseId: "course-id",
  issuedAt: Timestamp,
  certificateUrl: "url-to-pdf"
}
```

## Feature Connectivity

### Mentor → Student Features

#### 1. Assignments
- **Mentor Can**: Create, assign to multiple students, set due dates, grade submissions, provide feedback
- **Student Sees**: Assigned assignments, due dates, submission status, grades, mentor feedback
- **Connection**: `assignments` → `submissions` → notifications to students

#### 2. Notifications
- **Mentor Can**: Send notifications to students, broadcast announcements, notify about new assignments/events
- **Student Sees**: All notifications from mentor in their notification center
- **Connection**: `notifications` with `fromUserId` = mentor ID

#### 3. Calendar Events
- **Mentor Can**: Create events visible to students (meetings, sessions, deadlines)
- **Student Sees**: Mentor's shared events in their calendar alongside own events
- **Connection**: `mentorEvents` with `studentIds` array

#### 4. Progress Tracking
- **Mentor Can**: View all students' progress, course completion, study time, assignment grades
- **Student Sees**: Own progress and statistics
- **Connection**: Read from `enrollments`, `lessonProgress`, `studyTime`, `submissions`

### Student → Mentor Features

#### 1. Assignment Submissions
- **Student Can**: Submit assignments, view submission status
- **Mentor Sees**: All submissions from students, pending reviews highlighted
- **Connection**: Student creates `submissions` → mentor gets notification

#### 2. Progress Updates
- **Student Can**: Complete lessons, track study time
- **Mentor Sees**: Real-time progress updates in dashboard and progress page
- **Connection**: `lessonProgress` and `studyTime` updated by student, viewed by mentor

#### 3. Notifications (Questions/Help Requests)
- **Student Can**: Send messages/questions to mentor via notifications
- **Mentor Sees**: Student queries in notification center
- **Connection**: `notifications` with `fromUserId` = student ID

## Page-by-Page Redesign

### 1. MentorDashboard.jsx ✅ COMPLETED
**Features**:
- Student design gradient background
- Stat cards matching student style
- Recharts for student progress visualization
- Recent activity feed
- Student list with progress indicators
- Quick action buttons

**Data Sources**:
- `mentorStudents` for student list
- `assignments` and `submissions` for assignment stats
- `notifications` for unread count
- `mentorEvents` for upcoming events

### 2. MentorAssignments.jsx 🔄 IN PROGRESS
**Features**:
- Match LearnIQAssignments design
- Search and filter functionality
- Create assignment modal with student selection
- View all submissions per assignment
- Grade submissions with feedback
- Real-time statistics

**Bi-Directional**:
- Create assignments → notify students
- Grade submissions → notify students
- View student submissions in real-time

### 3. MentorNotifications.jsx
**Features**:
- Match LearnIQNotifications design
- Filter by type (all/unread/read)
- Mark as read/unread
- Bulk delete functionality
- Send notifications to students
- View student messages

**Bi-Directional**:
- Receive notifications from students (questions, help requests)
- Send notifications to students (announcements, reminders)
- Reply to student notifications

### 4. MentorCalendar.jsx
**Features**:
- Match LearnIQCalendar design
- Full calendar view with navigation
- Create events (private or shared with students)
- Color-coded event types
- Event modals for details
- Sync assignment deadlines automatically

**Bi-Directional**:
- Create events visible to students
- View student events (optional permission)
- Schedule 1-on-1 meetings with students
- Assignment deadlines auto-appear on calendar

### 5. MentorProgress.jsx
**Features**:
- Match LearnIQProgress design
- Tabs for different views (Overview, Students, Courses, Time)
- Charts and visualizations
- Timeframe filters (week/month/year)
- Detailed student analytics
- Export functionality

**Bi-Directional**:
- View all student progress data
- Track course completions
- Monitor study time
- View assignment grades
- Identify struggling students

## Implementation Status

- ✅ **MentorDashboard.jsx**: Complete redesign with student design matching
- 🔄 **MentorAssignments.jsx**: In progress - needs completion
- ⏳ **MentorNotifications.jsx**: Pending
- ⏳ **MentorCalendar.jsx**: Pending
- ⏳ **MentorProgress.jsx**: Pending

## Next Steps

1. Complete MentorAssignments.jsx with full create/grade functionality
2. Redesign MentorNotifications.jsx with bi-directional messaging
3. Redesign MentorCalendar.jsx with shared events
4. Redesign MentorProgress.jsx with comprehensive analytics
5. Test all bi-directional features
6. Create sample data in Firestore for testing
7. Update documentation with usage examples

## Testing Checklist

### Mentor Side
- [ ] Create assignment and assign to students
- [ ] View student submissions
- [ ] Grade submissions and provide feedback
- [ ] Send notifications to students
- [ ] Create calendar events visible to students
- [ ] View student progress dashboards
- [ ] Export progress reports

### Student Side  
- [ ] Receive assignment notifications
- [ ] Submit assignments
- [ ] View grades and feedback
- [ ] Receive mentor notifications
- [ ] See mentor's shared calendar events
- [ ] Progress tracked correctly
- [ ] Send questions to mentor

### Bi-Directional
- [ ] Assignment creation notifies students
- [ ] Submission notifies mentor
- [ ] Grading notifies student
- [ ] Calendar events sync correctly
- [ ] Progress updates in real-time
- [ ] Notifications work both ways

---

**Last Updated**: October 17, 2025
**Status**: In Progress - Dashboard Complete, Assignments In Progress
**Design System**: LearnIQ Student Design
**Framework**: React + Firebase/Firestore + Framer Motion + Recharts
