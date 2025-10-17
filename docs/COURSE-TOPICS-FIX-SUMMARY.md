# Course Topics/Lessons Display Fix

**Date:** October 17, 2025  
**Issue:** Course modules showing "0 lessons" and lesson view showing "Lesson not found"

## Problem

The admin panel creates courses with **`topics`** inside modules:
```javascript
modules: [{
  title: "Module Title",
  topics: [{           // ← Called "topics" not "lessons"
    title: "...",
    type: "video",
    videoUrl: "...",
    content: "..."
  }]
}]
```

But the student pages were only looking for `module.lessons`, causing:
- ❌ Modules showing "0 lessons"
- ❌ "Lesson not found" error when clicking a topic
- ❌ Content not displaying

## Solution

### 1. Fixed LearnIQCourseView.js

**Updated module/lesson fetching** to support both `topics` and `lessons`:

```javascript
// Now checks for both field names
const embeddedLessons = module.lessons || module.topics || [];

if (Array.isArray(embeddedLessons) && embeddedLessons.length > 0) {
  lessons = embeddedLessons.map((lesson, index) => ({
    ...lesson,
    id: lesson.id || `lesson-${module.id}-${index}`,
    title: lesson.title || lesson.name || `Lesson ${index + 1}`,
    videoUrl: lesson.videoUrl || lesson.video || lesson.url || lesson.content,
    type: lesson.type || 'video',
    duration: lesson.duration || lesson.videoDuration || 0,
    // ... more field normalization
  }));
}
```

**Field name variations supported:**
- Title: `title`, `name`, `lessonTitle`
- Video URL: `videoUrl`, `video`, `url`, `content`, `videoLink`, `link`
- Duration: `duration`, `videoDuration`, `length`, `time`
- Type: `type`, `lessonType`

### 2. Fixed LearnIQLessonView.js

**Rewrote lesson fetching** to handle embedded topics structure:

```javascript
// First fetch course with embedded modules
const courseData = await getDoc(doc(db, "courses", courseId));

// Extract lessons/topics from embedded modules
if (courseData.modules && Array.isArray(courseData.modules)) {
  courseData.modules.forEach((mod, moduleIndex) => {
    const topics = mod.topics || mod.lessons || [];
    
    topics.forEach((topic, topicIndex) => {
      const lessonData = {
        id: topic.id || `topic-${moduleId}-${topicIndex}`,
        title: topic.title || `Lesson ${topicIndex + 1}`,
        videoUrl: topic.videoUrl || topic.content,
        type: topic.type || 'video',
        // ... normalize all fields
      };
      allLessonsData.push(lessonData);
    });
  });
}
```

**Fallback support:** Still supports legacy separate collections (`lessons`, `modules`) for backward compatibility.

## Files Modified

1. **src/pages/student/LearnIQCourseView.js**
   - Lines ~115-145: Added `module.topics` support
   - Added field name normalization for multiple variations

2. **src/pages/student/LearnIQLessonView.js**
   - Lines ~40-120: Complete rewrite of lesson fetching
   - Now extracts topics from embedded course.modules structure
   - Supports both embedded and collection-based architectures

## Database Structure Support

### ✅ Supported Structures

**Embedded (Current/Primary):**
```
courses/{courseId}
  └─ modules: [{
      title: "...",
      topics: [{ title, videoUrl, type, ... }]
     }]
```

**Collection-based (Legacy/Fallback):**
```
courses/{courseId}
modules/{moduleId} → courseId
lessons/{lessonId} → moduleId
```

**Mixed structures** (some courses embedded, some in collections)

## Testing

After applying these changes:

1. ✅ Modules should show correct number of topics/lessons
2. ✅ Clicking a lesson should open the video player
3. ✅ Video URLs should display correctly
4. ✅ Lesson titles should appear properly
5. ✅ Navigation between lessons should work

## Browser Console Debugging

Added extensive logging:
- `"Modules found: X"` - Shows module count
- `"Module '<name>' lessons:"` - Shows extracted topics/lessons
- `"Modules with lessons:"` - Final structured data

To debug:
1. Open browser DevTools (F12)
2. Navigate to a course
3. Check Console tab for these logs
4. Verify topics are being extracted from modules

## Next Steps

If issues persist:
1. Check browser console for error messages
2. Verify course data structure in Firestore
3. Confirm admin panel is saving topics correctly
4. Check that topic IDs are being generated consistently

## Notes

- The fix maintains **backward compatibility** with any existing courses using separate collections
- Field name variations allow flexibility in admin data entry
- Duration conversion handles both seconds and minutes automatically
- Empty states gracefully handled with "No lessons in this module yet" message
