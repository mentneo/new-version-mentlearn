# Creator Dashboard Placeholder Image Fix

## Issue
Getting "Failed to load resource: A server with the specified hostname could not be found" errors for placeholder images.

## Root Cause
The Creator Dashboard was using `https://via.placeholder.com` for placeholder images:
- Student avatars: `https://via.placeholder.com/50?text=Student`
- Course thumbnails: `https://via.placeholder.com/150`

The `via.placeholder.com` service is unreachable or blocked, causing hostname resolution errors.

## Solution
Replaced all `via.placeholder.com` URLs with `ui-avatars.com` API, which generates avatar images based on names:

### Student Avatars
**Before:**
```javascript
avatar: student.photoURL || 'https://via.placeholder.com/50?text=Student'
```

**After:**
```javascript
avatar: student.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.displayName || 'Student')}&size=50&background=3B82F6&color=fff`
```

### Course Thumbnails
**Before:**
```javascript
thumbnail: course.thumbnailUrl || 'https://via.placeholder.com/150'
```

**After:**
```javascript
thumbnail: course.thumbnailUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.title || 'Course')}&size=150&background=3B82F6&color=fff`
```

### With Error Handling
For image elements, added onError handler:
```javascript
<img 
  src={course.thumbnail || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.title || 'Course')}&size=150&background=3B82F6&color=fff`} 
  alt={course.title}
  onError={(e) => {
    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(course.title || 'Course')}&size=150&background=3B82F6&color=fff`;
  }}
/>
```

## Files Modified
- `src/pages/creator/Dashboard.js`
  - Line ~335: Top students avatar placeholder
  - Line ~383: Top revenue courses thumbnail placeholder
  - Line ~1182: Course table thumbnail placeholder (with error handler)
  - Line ~1341: Revenue section thumbnail placeholder (with error handler)

## Benefits of ui-avatars.com
1. **Reliable**: More stable service, better uptime
2. **Dynamic**: Generates initials/names automatically
3. **Customizable**: Can set size, background color, text color
4. **Branded**: Uses blue (#3B82F6) matching the app theme
5. **No hostname errors**: Service is consistently reachable

## UI Avatars API Parameters
- `name`: The text to display (URL encoded)
- `size`: Image dimensions (50, 150, etc.)
- `background`: Hex color without # (3B82F6 for blue)
- `color`: Text color (fff for white)

## Testing
After this fix:
- ✅ No more "hostname could not be found" errors
- ✅ Student avatars show initials when no photo exists
- ✅ Course thumbnails show course title initials when no thumbnail exists
- ✅ All placeholders match app color scheme (blue)
- ✅ Fallback images work correctly

## Date Fixed
October 18, 2025
