const fs = require('fs');
const path = require('path');

// Define base paths
const BASE_DIR = '/Users/yeduruabhiram/Desktop/mentneo /new-version-mentlearn';
const STUDENT_PAGES_DIR = path.join(BASE_DIR, 'src/pages/student');
const STUDENT_COMPONENTS_DIR = path.join(BASE_DIR, 'src/components/student');

// Define files to process
const files = [
    path.join(STUDENT_PAGES_DIR, 'LearnIQAssignments.js'),
    path.join(STUDENT_PAGES_DIR, 'LearnIQCalendar.js'),
    path.join(STUDENT_PAGES_DIR, 'LearnIQCertificates.js'),
    path.join(STUDENT_PAGES_DIR, 'LearnIQCourseView.js'),
    path.join(STUDENT_PAGES_DIR, 'LearnIQDashboard.js'),
    path.join(STUDENT_PAGES_DIR, 'LearnIQLessonView.js'),
    path.join(STUDENT_PAGES_DIR, 'LearnIQNotifications.js'),
    path.join(STUDENT_PAGES_DIR, 'LearnIQProfile.js'),
    path.join(STUDENT_PAGES_DIR, 'LearnIQProgress.js'),
    path.join(STUDENT_COMPONENTS_DIR, 'LearnIQDashboardLayout.js'),
    path.join(STUDENT_COMPONENTS_DIR, 'LearnIQNavbar.js')
];

// Process each file
files.forEach(filePath => {
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`File not found: ${filePath}`);
            return;
        }

        let content = fs.readFileSync(filePath, 'utf8');
        
        // Fix broken framer-motion imports
        content = content.replace(/import { motion[\s\S]*?\/\/ from 'framer-motion';/g, 
            "// import { motion } from 'framer-motion';");
        
        content = content.replace(/import { motion, AnimatePresence[\s\S]*?\/\/ from 'framer-motion';/g, 
            "// import { motion, AnimatePresence } from 'framer-motion';");
        
        // Fix date-fns imports
        content = content.replace(/import { format[\s\S]*?\/\/ from 'date-fns';/g, 
            "// import { format, isToday, parseISO, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';");
        
        // Fix react-calendar import
        content = content.replace(/import Calendar[\s\S]*?\/\/ import 'react-calendar\/dist\/Calendar.css';/g, 
            "// import Calendar from 'react-calendar';\n// import 'react-calendar/dist/Calendar.css';");

        // Fix file extensions in imports
        content = content.replace(/from '..\/..\/contexts\/AuthContext'/g, "from '../../contexts/AuthContext.js'");
        content = content.replace(/from '..\/..\/firebase\/firebase'/g, "from '../../firebase/firebase.js'");
        
        // Fix LearnIQNavbar.js icons
        if (filePath.includes('LearnIQNavbar.js')) {
            // Replace icon imports
            content = content.replace(/import {[\s\S]*?} from 'react-icons\/fi';/g, 
                `import {
  FiHome,
  FiBookOpen,
  FiFileText,
  FiUser,
  FiSettings,
  FiLogOut,
  FiBell,
  FiCalendar,
  FiAward,
  FiHelpCircle,
  FiMenu,
  FiX,
  FiChevronRight,
  FiBarChart2 as ChartBarIcon
} from 'react-icons/fi';`);
        }
        
        // Fix LearnIQProfile.js icons
        if (filePath.includes('LearnIQProfile.js')) {
            // Add missing icon imports
            if (!content.includes('FiAward')) {
                const importStatement = `import {
  FiUser,
  FiSettings,
  FiBriefcase,
  FiAward,
  FiFileText,
  FiCheck,
  FiX,
  FiEdit,
  FiBookOpen,
  FiCalendar,
  FiClock,
  FiBook
} from 'react-icons/fi';`;
                
                const authImportIndex = content.indexOf("import { useAuth }");
                if (authImportIndex !== -1) {
                    content = content.slice(0, authImportIndex) + importStatement + "\n" + content.slice(authImportIndex);
                }
            }
        }
        
        // Write the updated content back to the file
        fs.writeFileSync(filePath, content);
        console.log(`Successfully updated: ${filePath}`);
    } catch (err) {
        console.error(`Error processing ${filePath}: ${err.message}`);
    }
});

console.log('Finished fixing files!');