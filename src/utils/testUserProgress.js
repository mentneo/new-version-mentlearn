// Utility functions for test user progress management
export const getTestUserProgress = (userId, courseId) => {
  const testUserProgressKey = `test_user_progress_${userId}_${courseId}`;
  const savedProgress = localStorage.getItem(testUserProgressKey);
  if (savedProgress) {
    return JSON.parse(savedProgress);
  }
  return { progress: 0, completedTopics: {} };
};

export const saveTestUserProgress = (userId, courseId, progress, completedTopics) => {
  const testUserProgressKey = `test_user_progress_${userId}_${courseId}`;
  const progressData = {
    progress: progress,
    completedTopics: completedTopics,
    lastUpdated: new Date().toISOString()
  };
  localStorage.setItem(testUserProgressKey, JSON.stringify(progressData));
};

export const calculateProgress = (course, completedTopics) => {
  if (!course?.modules) return 0;

  let totalTopics = 0;
  let completedCount = 0;

  course.modules.forEach(module => {
    if (module.topics && module.topics.length > 0) {
      module.topics.forEach(topic => {
        totalTopics++;
        if (completedTopics[topic.id]) {
          completedCount++;
        }
      });
    }
  });

  return Math.round((completedCount / totalTopics) * 100);
};
