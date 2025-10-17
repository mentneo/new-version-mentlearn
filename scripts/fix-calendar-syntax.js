const fs = require('fs');
const path = require('path');

const calendarFilePath = path.join(__dirname, '../src/pages/student/LearnIQCalendar.js');

try {
  let content = fs.readFileSync(calendarFilePath, 'utf8');
  
  // Fix the incomplete import statement
  content = content.replace(
    "import { motion, AnimatePresence } // // from 'framer-motion';",
    "import { motion, AnimatePresence } from 'framer-motion';"
  );
  
  fs.writeFileSync(calendarFilePath, content);
  console.log('✅ Fixed LearnIQCalendar.js syntax');
} catch (error) {
  console.error('Error fixing LearnIQCalendar.js:', error);
}