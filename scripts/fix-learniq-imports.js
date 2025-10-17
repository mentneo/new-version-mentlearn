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

// Path replacements to fix
const replacements = [
    { from: "import { useAuth } from '../../contexts/AuthContext'", to: "import { useAuth } from '../../contexts/AuthContext.js'" },
    { from: "import { db } from '../../firebase/firebase'", to: "import { db } from '../../firebase/firebase.js'" },
    { from: "from 'lucide-react'", to: "from 'react-icons/fi'" },
    { from: "from 'framer-motion'", to: "// from 'framer-motion'" },
    { from: "import { motion } from ", to: "// import { motion } from " },
    { from: "from 'date-fns'", to: "// from 'date-fns'" },
    { from: "import { format, isToday, parseISO, addDays } from ", to: "// import { format, isToday, parseISO, addDays } from " },
    { from: "import 'react-calendar/dist/Calendar.css';", to: "// import 'react-calendar/dist/Calendar.css';" },
    { from: "import Calendar from 'react-calendar';", to: "// import Calendar from 'react-calendar';" }
];

// Icon replacements (from lucide-react to react-icons/fi)
const iconReplacements = {
    'Bell': 'FiBell',
    'Search': 'FiSearch',
    'Home': 'FiHome',
    'BookOpen': 'FiBook',
    'FileText': 'FiFileText',
    'User': 'FiUser',
    'Settings': 'FiSettings',
    'LogOut': 'FiLogOut',
    'Calendar': 'FiCalendar',
    'CalendarDays': 'FiCalendar',
    'Award': 'FiAward',
    'HelpCircle': 'FiHelpCircle',
    'Menu': 'FiMenu',
    'X': 'FiX',
    'ChevronRight': 'FiChevronRight',
    'BarChart3': 'FiBarChart2',
    'CircleCheck': 'FiCheckCircle',
    'Clock': 'FiClock',
    'Clock3': 'FiClock',
    'MessageCircle': 'FiMessageCircle',
    'Trash2': 'FiTrash2',
    'Filter': 'FiFilter',
    'AlertCircle': 'FiAlertCircle',
    'CheckCircle': 'FiCheckCircle',
    'TrendingUp': 'FiTrendingUp',
    'GraduationCap': 'FiAward',
    'CircleDashed': 'FiCircle',
    'Trophy': 'FiAward',
    'Target': 'FiTarget',
    'Briefcase': 'FiBriefcase',
    'PieChart': 'FiPieChart',
    'LineChart': 'FiTrendingUp',
    'Line': 'FiTrendingUp',
    'Star': 'FiStar',
    'PlayCircle': 'FiPlay',
    'AlertTriangle': 'FiAlertTriangle',
    'MessageSquare': 'FiMessageSquare',
    'SkipBack': 'FiSkipBack',
    'SkipForward': 'FiSkipForward',
    'Check': 'FiCheck'
};

// Process each file
files.forEach(filePath => {
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`File not found: ${filePath}`);
            return;
        }

        let content = fs.readFileSync(filePath, 'utf8');
        
        // Apply path replacements
        replacements.forEach(replacement => {
            content = content.replace(new RegExp(replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement.to);
        });
        
        // Replace lucide-react icons with react-icons/fi
        for (const [lucideIcon, fiIcon] of Object.entries(iconReplacements)) {
            const iconRegex = new RegExp(`<${lucideIcon}([\\s\\S]*?)/>`, 'g');
            content = content.replace(iconRegex, `<${fiIcon}$1/>`);
            
            // Also replace icon destructuring in import statements
            const importRegex = new RegExp(`\\b${lucideIcon}\\b(?=.*?from\\s+['"]react-icons/fi['"])`, 'g');
            content = content.replace(importRegex, fiIcon);
        }
        
        // Add missing import for FiIcons
        if (content.includes('from \'react-icons/fi\'') === false) {
            // Find the first import statement
            const importIndex = content.indexOf('import ');
            const usedIcons = [];
            
            // Determine which icons are used in this file
            for (const [lucideIcon, fiIcon] of Object.entries(iconReplacements)) {
                if (content.includes(`<${fiIcon}`) || content.includes(` ${fiIcon}`) || content.includes(`(${fiIcon}`)) {
                    usedIcons.push(fiIcon);
                }
            }
            
            if (usedIcons.length > 0) {
                const fiIconsImport = `import { ${usedIcons.join(', ')} } from 'react-icons/fi';\n`;
                content = content.slice(0, importIndex) + fiIconsImport + content.slice(importIndex);
            }
        }
        
        fs.writeFileSync(filePath, content);
        console.log(`Successfully updated: ${filePath}`);
    } catch (err) {
        console.error(`Error processing ${filePath}: ${err.message}`);
    }
});

console.log('Finished fixing import paths.');