#!/bin/bash

# Script to remove old student pages and keep only LearnIQ templates
# This will clean up the codebase to use only modern templates

echo "🧹 Cleaning up old student pages..."

cd "/Users/yeduruabhiram/Desktop/mentneo /new-version-mentlearn"

# Backup directory (just in case)
BACKUP_DIR="old-pages-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR/student"

echo "📦 Creating backup in $BACKUP_DIR..."

# List of old files to remove
OLD_FILES=(
  "src/pages/student/Dashboard.js"
  "src/pages/student/CourseView.js"
  "src/pages/student/CourseDetail.js"
  "src/pages/student/Progress.js"
  "src/pages/student/SimplifiedDashboard.js"
  "src/pages/student/StudentDashboard.js"
  "src/pages/student/NewDashboard.js"
  "src/pages/student/NewDashboard.js.bak"
  "src/pages/student/NewDashboard.js.empty"
  "src/pages/student/ProfileSettings.js"
  "src/pages/student/StudentProfile.js"
  "src/pages/student/StudentNewDashboard.js"
  "src/pages/student/adminController.js"
  "src/pages/student/app.js"
  "src/pages/student/const express = require('express');.js"
  "src/pages/student/create-notification.ejs"
  "src/pages/student/notification.controller.js"
  "src/pages/student/notifications.ejs"
  "src/pages/student/studentController.js"
)

# Move old files to backup
for file in "${OLD_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✓ Backing up: $file"
    cp "$file" "$BACKUP_DIR/student/$(basename "$file")"
    rm "$file"
    echo "  ✓ Removed: $file"
  fi
done

echo ""
echo "✅ Cleanup complete!"
echo "📁 Backup saved to: $BACKUP_DIR"
echo ""
echo "📋 Remaining LearnIQ pages:"
ls -1 src/pages/student/LearnIQ*.js

echo ""
echo "🎯 Current working templates (LearnIQ):"
echo "  ✓ LearnIQDashboard.js"
echo "  ✓ LearnIQCourseView.js"
echo "  ✓ LearnIQLessonView.js"
echo "  ✓ LearnIQAssignments.js"
echo "  ✓ LearnIQProfile.js"
echo "  ✓ LearnIQCertificates.js"
echo "  ✓ LearnIQCalendar.js"
echo "  ✓ LearnIQProgress.js"
echo "  ✓ LearnIQNotifications.js"
echo ""
echo "💡 Note: Payment and enrollment pages (CourseEnrollment.js, CoursePaymentSuccess.js) have been kept"
echo "💡 Note: Quiz pages have been kept for backward compatibility"
