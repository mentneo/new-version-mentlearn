const fs = require('fs');
const path = require('path');

// Paths
const componentsPath = path.join(__dirname, '../src/components/student');
const pagesPath = path.join(__dirname, '../src/pages/student');

// Map of files and their required imports
const filesToFix = {
  // Components
  [path.join(componentsPath, 'LearnIQNavbar.js')]: {
    icons: [
      'FiHome', 'FiBookOpen', 'FiFileText', 'FiUser', 'FiSettings', 'FiLogOut', 
      'FiBell', 'FiCalendar', 'FiAward', 'FiHelpCircle', 'FiMenu', 'FiX', 'FiChevronRight', 'FiBarChart2'
    ],
    imports: [
      "import { motion } from 'framer-motion';",
      "import { useAuth } from '../../contexts/AuthContext';",
      "import { useLocation, useNavigate } from 'react-router-dom';"
    ]
  },

  // Pages
  [path.join(pagesPath, 'LearnIQCalendar.js')]: {
    icons: [
      'FiCalendar', 'FiChevronLeft', 'FiChevronRight', 'FiClock', 'FiPlus', 'FiTrash2', 
      'FiEdit', 'FiX', 'FiCheck', 'FiAlertCircle', 'FiBook', 'FiFileText', 
      'FiMessageCircle', 'FiCalendar', 'FiCheckSquare'
    ],
    imports: [
      "import { motion, AnimatePresence } from 'framer-motion';",
      "import { useAuth } from '../../contexts/AuthContext';",
      "import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';",
      "import { db } from '../../firebase/firebase';",
      "import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth } from 'date-fns';"
    ]
  },
  [path.join(pagesPath, 'LearnIQAssignments.js')]: {
    icons: [
      'FiCalendar', 'FiClock', 'FiAlertCircle', 'FiCheckCircle', 'FiFileText', 
      'FiFilter', 'FiSearch', 'FiChevronRight', 'FiX'
    ],
    imports: [
      "import { motion, AnimatePresence } from 'framer-motion';",
      "import { useAuth } from '../../contexts/AuthContext';",
      "import { collection, query, where, getDocs } from 'firebase/firestore';",
      "import { db } from '../../firebase/firebase';"
    ]
  },
  [path.join(pagesPath, 'LearnIQCertificates.js')]: {
    icons: [
      'FiAward', 'FiCalendar', 'FiUser', 'FiBook'
    ],
    imports: [
      "import { motion } from 'framer-motion';",
      "import { useAuth } from '../../contexts/AuthContext';",
      "import { collection, query, where, getDocs } from 'firebase/firestore';",
      "import { db } from '../../firebase/firebase';"
    ]
  },
  [path.join(pagesPath, 'LearnIQCourseView.js')]: {
    icons: [
      'FiBook', 'FiClock', 'FiCheckCircle', 'FiPlay', 'FiFileText', 
      'FiUsers', 'FiMessageSquare', 'FiChevronRight', 'FiAlertTriangle'
    ],
    imports: [
      "import { motion } from 'framer-motion';",
      "import { useAuth } from '../../contexts/AuthContext';",
      "import { useParams } from 'react-router-dom';",
      "import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';",
      "import { db } from '../../firebase/firebase';"
    ]
  },
  [path.join(pagesPath, 'LearnIQDashboard.js')]: {
    icons: [
      'FiBell', 'FiSettings', 'FiBook', 'FiCheck', 'FiClock', 'FiChevronRight',
      'FiFileText', 'FiXAxis', 'FiCalendar', 'FiAward'
    ],
    imports: [
      "import { motion } from 'framer-motion';",
      "import { useAuth } from '../../contexts/AuthContext';",
      "import { collection, query, where, getDocs } from 'firebase/firestore';",
      "import { db } from '../../firebase/firebase';",
      "import { PieChart, Pie, LineChart, Line, XAxis } from 'recharts';"
    ]
  },
  [path.join(pagesPath, 'LearnIQLessonView.js')]: {
    icons: [
      'FiChevronRight', 'FiPlay', 'FiCheckCircle', 'FiX', 'FiMessageSquare'
    ],
    imports: [
      "import { motion } from 'framer-motion';",
      "import { useAuth } from '../../contexts/AuthContext';",
      "import { useParams } from 'react-router-dom';",
      "import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';",
      "import { db } from '../../firebase/firebase';"
    ]
  },
  [path.join(pagesPath, 'LearnIQNotifications.js')]: {
    icons: [
      'FiBell', 'FiBook', 'FiCalendar', 'FiCheckCircle', 'FiClock', 'FiMessageCircle',
      'FiFilter', 'FiAlertCircle'
    ],
    imports: [
      "import { motion, AnimatePresence } from 'framer-motion';",
      "import { useAuth } from '../../contexts/AuthContext';",
      "import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';",
      "import { db } from '../../firebase/firebase';"
    ]
  },
  [path.join(pagesPath, 'LearnIQProfile.js')]: {
    icons: [
      'FiX', 'FiCheck', 'FiAward', 'FiBook', 'FiClock', 'FiCalendar', 'FiFileText'
    ],
    imports: [
      "import { motion } from 'framer-motion';",
      "import { useAuth } from '../../contexts/AuthContext';",
      "import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';",
      "import { db } from '../../firebase/firebase';"
    ]
  },
  [path.join(pagesPath, 'LearnIQProgress.js')]: {
    icons: [
      'FiBarChart2', 'FiBook', 'FiClock', 'FiCalendarDays', 'FiCheckCircle',
      'FiAward', 'FiTarget', 'FiTrendingUp', 'FiCircle', 'FiClock3', 'FiCalendar'
    ],
    imports: [
      "import { motion } from 'framer-motion';",
      "import { useAuth } from '../../contexts/AuthContext';",
      "import { collection, query, where, getDocs } from 'firebase/firestore';",
      "import { db } from '../../firebase/firebase';"
    ]
  }
};

function fixImports() {
  console.log('Starting to fix imports...');
  
  Object.entries(filesToFix).forEach(([filePath, config]) => {
    try {
      const fileName = path.basename(filePath);
      console.log(`Processing ${fileName}...`);
      
      if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return;
      }
      
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Fix react-icons/fi imports to use .js extension
      content = content.replace(
        /from\s+['"]react-icons\/fi['"]/g,
        "from 'react-icons/fi/index.js'"
      );
      
      // Add missing icon imports if they don't exist
      if (!content.includes("from 'react-icons/fi") || 
          config.icons.some(icon => !content.includes(icon))) {
        
        // Replace existing icons import or add new one
        if (content.includes("from 'react-icons/fi")) {
          const iconImportRegex = /import\s+{[\s\S]*?}\s+from\s+['"]react-icons\/fi(?:\/index\.js)?['"];?/;
          const iconsList = config.icons.join(',\n  ');
          
          content = content.replace(
            iconImportRegex,
            `import {\n  ${iconsList}\n} from 'react-icons/fi/index.js';`
          );
        } else {
          // Add new import after the first import
          const iconsList = config.icons.join(',\n  ');
          const firstImportRegex = /^(import .+?;)/m;
          
          content = content.replace(
            firstImportRegex,
            `$1\n\nimport {\n  ${iconsList}\n} from 'react-icons/fi/index.js';`
          );
        }
      }
      
      // Add any other missing imports
      for (const importStatement of config.imports) {
        if (!content.includes(importStatement.split(' ')[1])) {
          // Insert after the first import statement if not already present
          if (!content.includes(importStatement)) {
            const firstImport = content.match(/^(import .+?;)/m);
            if (firstImport) {
              content = content.replace(
                firstImport[0],
                `${firstImport[0]}\n${importStatement}`
              );
            }
          }
        }
      }
      
      // Fix syntax errors in framer-motion imports
      if (content.includes('import { motion, AnimatePresence }') && content.includes('// from')) {
        content = content.replace(
          /import\s+{\s*motion,\s*AnimatePresence\s*}\s*\/\/.*$/m,
          "import { motion, AnimatePresence } from 'framer-motion';"
        );
      }
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed imports in ${fileName}`);
      
    } catch (error) {
      console.error(`Error processing file: ${filePath}`, error);
    }
  });
  
  console.log('Finished fixing imports!');
}

// Run the fix
fixImports();