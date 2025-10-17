# LearnIQ Dashboard - Setup Guide

## Overview
The LearnIQ Dashboard provides students with a comprehensive learning management interface including:
- Course progress tracking
- Calendar with scheduled events
- Certificate management
- Notifications
- Assignments
- Profile management

## Installation

### Step 1: Install Dependencies
Run the setup script to install required dependencies and fix import paths:

```bash
chmod +x ./scripts/setup-learniq-dashboard.sh
./scripts/setup-learniq-dashboard.sh
```

This script will install:
- react-icons (replacement for lucide-react)
- date-fns (date formatting library)

### Step 2: Start the Development Server
```bash
npm start
```

## Accessing the Dashboard

After starting the development server, you can access the LearnIQ Dashboard at:
```
http://localhost:3000/student-dashboard
```

Individual components can be accessed at:
- Dashboard Home: `/student-dashboard`
- Course View: `/student-dashboard/course/:courseId`
- Lesson View: `/student-dashboard/lesson/:lessonId`
- Assignments: `/student-dashboard/assignments`
- Calendar: `/student-dashboard/calendar`
- Certificates: `/student-dashboard/certificates`
- Notifications: `/student-dashboard/notifications`
- Progress: `/student-dashboard/progress`
- Profile: `/student-dashboard/profile`

## Component Structure

### LearnIQDashboardLayout.js
- Main layout component that wraps all dashboard pages
- Includes the navbar and common UI elements

### LearnIQNavbar.js
- Navigation component with links to all dashboard sections
- Responsive design with mobile menu

### LearnIQRoutes.js
- Defines all routes for the dashboard
- Protected routes that require authentication

## Troubleshooting

### Common Issues:

1. **Import Path Errors**
   - If you see import errors, run the fix-learniq-imports.js script:
   ```bash
   node ./scripts/fix-learniq-imports.js
   ```

2. **Missing Icons**
   - The dashboard uses react-icons/fi instead of lucide-react
   - Make sure to import icons correctly:
   ```jsx
   import { FiUser, FiSettings } from 'react-icons/fi';
   ```

3. **Authentication Issues**
   - Ensure you're logged in as a student account
   - Check AuthContext implementation for role verification

## Development Guidelines

When modifying or extending the LearnIQ components:

1. Follow the existing component structure
2. Use the LearnIQDashboardLayout for consistency
3. Add new routes to LearnIQRoutes.js
4. Add navigation links to LearnIQNavbar.js
5. Use Tailwind CSS for styling
6. Keep Firebase queries optimized for performance