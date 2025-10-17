const fs = require('fs');
const path = require('path');

// Define base paths
const BASE_DIR = '/Users/yeduruabhiram/Desktop/mentneo /new-version-mentlearn';
const STUDENT_PAGES_DIR = path.join(BASE_DIR, 'src/pages/student');
const STUDENT_COMPONENTS_DIR = path.join(BASE_DIR, 'src/components/student');

// Fix LearnIQAssignments.js
function fixAssignments() {
    const filePath = path.join(STUDENT_PAGES_DIR, 'LearnIQAssignments.js');
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/import { motion } \/\/ \/\/ from 'framer-motion';/g, 
        "// import { motion } from 'framer-motion';");
    
    fs.writeFileSync(filePath, content);
    console.log(`Successfully fixed: ${filePath}`);
}

// Fix LearnIQCalendar.js
function fixCalendar() {
    const filePath = path.join(STUDENT_PAGES_DIR, 'LearnIQCalendar.js');
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix date-fns import
    content = content.replace(
        /import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, isSameDay, parseISO, addDays } \/\/ \/\/ from 'date-fns';/g,
        "// import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, isSameDay, parseISO, addDays } from 'date-fns';"
    );
    
    // Fix react-icons import
    content = content.replace(
        /import {[\s\S]*?} from 'react-icons\/fi';/g,
        `import { 
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiPlus,
  FiTrash2,
  FiEdit,
  FiX,
  FiCheck,
  FiAlertCircle
} from 'react-icons/fi';`
    );
    
    // Comment out Calendar import
    content = content.replace(
        /import Calendar from 'react-calendar';[\s\S]*?import 'react-calendar\/dist\/Calendar.css';/g,
        "// import Calendar from 'react-calendar';\n// import 'react-calendar/dist/Calendar.css';"
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`Successfully fixed: ${filePath}`);
}

// Fix LearnIQCertificates.js
function fixCertificates() {
    const filePath = path.join(STUDENT_PAGES_DIR, 'LearnIQCertificates.js');
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/import { motion } \/\/ \/\/ from 'framer-motion';/g, 
        "// import { motion } from 'framer-motion';");
    
    fs.writeFileSync(filePath, content);
    console.log(`Successfully fixed: ${filePath}`);
}

// Fix LearnIQCourseView.js
function fixCourseView() {
    const filePath = path.join(STUDENT_PAGES_DIR, 'LearnIQCourseView.js');
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/import { motion } \/\/ \/\/ from 'framer-motion';/g, 
        "// import { motion } from 'framer-motion';");
    
    fs.writeFileSync(filePath, content);
    console.log(`Successfully fixed: ${filePath}`);
}

// Fix LearnIQDashboard.js
function fixDashboard() {
    const filePath = path.join(STUDENT_PAGES_DIR, 'LearnIQDashboard.js');
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/import { motion } \/\/ \/\/ from 'framer-motion';/g, 
        "// import { motion } from 'framer-motion';");
    
    fs.writeFileSync(filePath, content);
    console.log(`Successfully fixed: ${filePath}`);
}

// Fix LearnIQLessonView.js
function fixLessonView() {
    const filePath = path.join(STUDENT_PAGES_DIR, 'LearnIQLessonView.js');
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/import { motion } \/\/ \/\/ from 'framer-motion';/g, 
        "// import { motion } from 'framer-motion';");
    
    fs.writeFileSync(filePath, content);
    console.log(`Successfully fixed: ${filePath}`);
}

// Fix LearnIQNotifications.js
function fixNotifications() {
    const filePath = path.join(STUDENT_PAGES_DIR, 'LearnIQNotifications.js');
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/import { motion, AnimatePresence } \/\/ \/\/ from 'framer-motion';/g, 
        "// import { motion, AnimatePresence } from 'framer-motion';");
    
    fs.writeFileSync(filePath, content);
    console.log(`Successfully fixed: ${filePath}`);
}

// Fix LearnIQProfile.js
function fixProfile() {
    const filePath = path.join(STUDENT_PAGES_DIR, 'LearnIQProfile.js');
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix firebase import
    content = content.replace(/from '\.\.\/\.\.\/firebase\/firebase'/g, 
        "from '../../firebase/firebase.js'");
    
    // Fix icons import
    if (!content.includes('FiAward')) {
        const fiIconsImport = `import {
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
        
        // Find the position of the AuthContext import and insert before it
        const authImport = "import { useAuth } from";
        const authImportIndex = content.indexOf(authImport);
        if (authImportIndex !== -1) {
            content = content.slice(0, authImportIndex) + fiIconsImport + "\n" + content.slice(authImportIndex);
        }
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`Successfully fixed: ${filePath}`);
}

// Fix LearnIQProgress.js
function fixProgress() {
    const filePath = path.join(STUDENT_PAGES_DIR, 'LearnIQProgress.js');
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/import { motion } \/\/ \/\/ from 'framer-motion';/g, 
        "// import { motion } from 'framer-motion';");
    
    fs.writeFileSync(filePath, content);
    console.log(`Successfully fixed: ${filePath}`);
}

// Fix LearnIQNavbar.js
function fixNavbar() {
    const filePath = path.join(STUDENT_COMPONENTS_DIR, 'LearnIQNavbar.js');
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix framer-motion import
    content = content.replace(/import { motion } \/\/ from 'framer-motion';/g, 
        "// import { motion } from 'framer-motion';");
    
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
    
    fs.writeFileSync(filePath, content);
    console.log(`Successfully fixed: ${filePath}`);
}

// Run all fix functions
try {
    fixAssignments();
    fixCalendar();
    fixCertificates();
    fixCourseView();
    fixDashboard();
    fixLessonView();
    fixNotifications();
    fixProfile();
    fixProgress();
    fixNavbar();
    console.log('All files fixed successfully!');
} catch (err) {
    console.error(`Error fixing files: ${err.message}`);
}