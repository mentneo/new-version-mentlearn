# LearnIQ Dashboard Components Guide

This document provides instructions on how to access and use the LearnIQ Dashboard components that have been added to the Mentneo application.

## Accessing the LearnIQ Dashboard

After logging in as a student, you will be automatically redirected to the LearnIQ Dashboard at `/student/dashboard`.

### Available Pages

The following pages are available in the LearnIQ Dashboard:

1. **Main Dashboard**: `/student/dashboard`
2. **Progress Tracking**: `/student/dashboard/progress`
3. **Assignments**: `/student/dashboard/assignments`
4. **Calendar**: `/student/dashboard/calendar`
5. **Certificates**: `/student/dashboard/certificates`
6. **Notifications**: `/student/dashboard/notifications`
7. **Profile**: `/student/dashboard/profile`
8. **Course View**: `/student/dashboard/course/:courseId`
9. **Lesson View**: `/student/dashboard/course/:courseId/lesson/:lessonId`

## Troubleshooting

If you encounter any issues accessing the LearnIQ Dashboard:

1. **Check for console errors** in your browser's developer tools
2. **Verify the routes** are correctly configured in `LearnIQRoutes.js` and `App.js`
3. **Make sure you are logged in** as a student user
4. **Clear your browser cache** and reload the page

## Common Issues and Solutions

### Issue: Dashboard doesn't load after login

**Solution**: Check if you're being redirected to the correct URL after login. The redirect URL should be `/student/dashboard`.

### Issue: Links in the sidebar don't work

**Solution**: Verify that the navigation paths in `LearnIQNavbar.js` match the routes defined in `LearnIQRoutes.js`.

### Issue: Pages show errors or don't render correctly

**Solution**: 
1. Check for any JavaScript errors in the console
2. Verify that Firebase is properly initialized and you have data for the current user
3. Make sure the correct components are being imported in `LearnIQRoutes.js`

## Manual Testing Procedure

1. Log in as a student user
2. Navigate to `/student/dashboard` to view the main dashboard
3. Click on each navigation link in the sidebar to verify all pages load correctly
4. Test the functionality of each component (adding events, viewing notifications, etc.)

## Development Notes

All LearnIQ Dashboard components are located in the following directories:
- Page components: `src/pages/student/`
- Layout and navigation: `src/components/student/`
- Routing configuration: `src/LearnIQRoutes.js`

To add new components to the LearnIQ Dashboard:
1. Create your component in `src/pages/student/`
2. Add a route in `LearnIQRoutes.js`
3. Update the navigation links in `LearnIQNavbar.js`