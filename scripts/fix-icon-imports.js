const fs = require('fs');
const path = require('path');

// Paths
const componentsPath = path.join(__dirname, '../src/components/student');
const pagesPath = path.join(__dirname, '../src/pages/student');

// Files to process
const files = [
  path.join(componentsPath, 'LearnIQNavbar.js'),
  path.join(pagesPath, 'LearnIQAssignments.js'),
  path.join(pagesPath, 'LearnIQCertificates.js'),
  path.join(pagesPath, 'LearnIQCourseView.js'),
  path.join(pagesPath, 'LearnIQDashboard.js'),
  path.join(pagesPath, 'LearnIQLessonView.js'),
  path.join(pagesPath, 'LearnIQNotifications.js'),
  path.join(pagesPath, 'LearnIQProfile.js'),
  path.join(pagesPath, 'LearnIQProgress.js')
];

// Map of icon names that need Fi prefix
const iconMap = {
  'Activity': 'FiActivity',
  'ArrowRight': 'FiArrowRight',
  'ArrowLeft': 'FiArrowLeft',
  'Award': 'FiAward',
  'BarChart2': 'FiBarChart2',
  'Bell': 'FiBell',
  'Calendar': 'FiCalendar',
  'Camera': 'FiCamera',
  'ChevronDown': 'FiChevronDown',
  'ChevronLeft': 'FiChevronLeft',
  'ChevronRight': 'FiChevronRight',
  'ChevronUp': 'FiChevronUp',
  'Download': 'FiDownload',
  'Edit': 'FiEdit',
  'Edit2': 'FiEdit2',
  'ExternalLink': 'FiExternalLink',
  'FileText': 'FiFileText',
  'Globe': 'FiGlobe',
  'Grid': 'FiGrid',
  'HelpCircle': 'FiHelpCircle',
  'List': 'FiList',
  'Lock': 'FiLock',
  'Mail': 'FiMail',
  'MapPin': 'FiMapPin',
  'Maximize': 'FiMaximize',
  'MessageCircle': 'FiMessageCircle',
  'MessageSquare': 'FiMessageSquare',
  'Pause': 'FiPause',
  'Phone': 'FiPhone',
  'PlusCircle': 'FiPlusCircle',
  'Settings': 'FiSettings',
  'Share': 'FiShare',
  'Share2': 'FiShare2',
  'ThumbsDown': 'FiThumbsDown',
  'ThumbsUp': 'FiThumbsUp',
  'Upload': 'FiUpload',
  'User': 'FiUser',
  'Volume1': 'FiVolume1',
  'Volume2': 'FiVolume2',
  'VolumeX': 'FiVolumeX',
  'Facebook': 'FiFacebook',
  'Twitter': 'FiTwitter',
  'Linkedin': 'FiLinkedin',
  'Instagram': 'FiInstagram',
  'Book': 'FiBook',
  'BookOpen': 'FiBookOpen',
  'Home': 'FiHome',
  'Plus': 'FiPlus'
};

// Fix LearnIQNavbar.js
const fixLearnIQNavbar = () => {
  try {
    const filePath = path.join(componentsPath, 'LearnIQNavbar.js');
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix the icon imports
    content = content.replace(
      /import\s*{\s*FiHome,[\s\S]*?}\s*from\s*'react-icons\/fi';/,
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
  FiBarChart2 
} from 'react-icons/fi';
import { motion } from 'framer-motion';`
    );
    
    // Fix icon references
    content = content.replace(/icon: Home/g, 'icon: FiHome');
    content = content.replace(/icon: BookOpen/g, 'icon: FiBookOpen');
    content = content.replace(/icon: ChartBarIcon/g, 'icon: FiBarChart2');
    
    fs.writeFileSync(filePath, content);
    console.log('✅ Fixed LearnIQNavbar.js');
  } catch (error) {
    console.error('Error fixing LearnIQNavbar.js:', error);
  }
};

// Fix LearnIQCalendar.js
const fixLearnIQCalendar = () => {
  try {
    const filePath = path.join(pagesPath, 'LearnIQCalendar.js');
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix the incomplete import statement
    content = content.replace(
      "import { motion, AnimatePresence } // // from 'framer-motion';",
      "import { motion, AnimatePresence } from 'framer-motion';"
    );
    
    fs.writeFileSync(filePath, content);
    console.log('✅ Fixed LearnIQCalendar.js syntax');
  } catch (error) {
    console.error('Error fixing LearnIQCalendar.js:', error);
  }
};

// Fix icon imports in a file to use Fi prefix
const fixIconImports = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    let modified = false;
    
    // 1. Fix import statements - look for react-icons/fi imports
    const importRegex = /import\s*{([^}]*)}\s*from\s*['"]react-icons\/fi(?:\/index\.js)?['"]/g;
    const matches = [...content.matchAll(importRegex)];
    
    if (matches.length > 0) {
      for (const match of matches) {
        const originalImport = match[0];
        const importedIcons = match[1].split(',').map(i => i.trim());
        
        // Check each imported icon and add Fi prefix if needed
        const fixedIcons = importedIcons.map(icon => {
          // Handle "Icon as AliasName" format
          const parts = icon.split(' as ');
          let iconName = parts[0].trim();
          const alias = parts.length > 1 ? ` as ${parts[1].trim()}` : '';
          
          // Skip if already has Fi prefix
          if (iconName.startsWith('Fi')) {
            return icon;
          }
          
          // Apply Fi prefix if in our map
          if (iconMap[iconName]) {
            return `${iconMap[iconName]}${alias}`;
          }
          
          return icon; // Keep unchanged if not in our map
        });
        
        // Create new import statement
        const newImport = `import { ${fixedIcons.join(', ')} } from 'react-icons/fi'`;
        
        // Only replace if there's a change
        if (originalImport !== newImport) {
          content = content.replace(originalImport, newImport);
          modified = true;
        }
      }
    }
    
    // 2. Fix JSX usage - look for icon components in JSX
    for (const [oldName, newName] of Object.entries(iconMap)) {
      // Only process if the old name is actually used in the content
      if (content.includes(`<${oldName}`)) {
        // Fix opening tags: <IconName ... > or <IconName/>
        content = content.replace(new RegExp(`<${oldName}(\\s+|>|\\/>)`, 'g'), `<${newName}$1`);
        // Fix closing tags: </IconName>
        content = content.replace(new RegExp(`</${oldName}>`, 'g'), `</${newName}>`);
        modified = true;
      }
    }
    
    // 3. Add missing imports for framer motion if needed
    if (content.includes('<motion.') && !content.includes('framer-motion')) {
      // Check if we need to add motion import
      const motionImport = "import { motion, AnimatePresence } from 'framer-motion';";
      
      // Add after the first import statement
      const firstImportRegex = /(import[\s\S]*?;)/;
      const match = content.match(firstImportRegex);
      
      if (match) {
        content = content.replace(match[0], `${match[0]}\n${motionImport}`);
        modified = true;
      }
    }
    
    // 4. Fix icon references in non-JSX code (like arrays, objects)
    for (const [oldName, newName] of Object.entries(iconMap)) {
      // Look for patterns like: icon: IconName,
      const iconPropRegex = new RegExp(`icon:\\s*${oldName}[,}]`, 'g');
      if (content.match(iconPropRegex)) {
        content = content.replace(iconPropRegex, (match) => match.replace(oldName, newName));
        modified = true;
      }
    }
    
    // Save changes if modified
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed icon imports in ${fileName}`);
      return true;
    } else {
      console.log(`📝 No changes needed in ${fileName}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${path.basename(filePath)}:`, error);
    return false;
  }
};

// Add missing imports to all files (if needed)
const addMissingImports = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    // Check if file uses icons but has no react-icons/fi import
    const hasIconUsage = Object.keys(iconMap).some(icon => 
      content.includes(`<${icon}`) || content.includes(`<${iconMap[icon]}`)
    );
    
    if (hasIconUsage && !content.includes("from 'react-icons/fi'")) {
      // Add the import at the beginning after the first import
      const importStatement = `import {
  FiActivity,
  FiArrowRight,
  FiArrowLeft,
  FiAward,
  FiBarChart2,
  FiBell,
  FiBook,
  FiBookOpen,
  FiCalendar,
  FiCamera,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiDownload,
  FiEdit2,
  FiExternalLink,
  FiFileText,
  FiFilter,
  FiGlobe,
  FiGrid,
  FiHelpCircle,
  FiHome,
  FiList,
  FiLock,
  FiMail,
  FiMapPin,
  FiMenu,
  FiMessageCircle,
  FiMessageSquare,
  FiPhone,
  FiPlusCircle,
  FiSearch,
  FiSettings,
  FiShare2,
  FiUser,
  FiX
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';`;

      // Insert after the first import statement
      const firstImportRegex = /(import[\s\S]*?;)/;
      const match = content.match(firstImportRegex);
      
      if (match) {
        content = content.replace(match[0], `${match[0]}\n${importStatement}`);
        fs.writeFileSync(filePath, content);
        console.log(`✅ Added missing imports to ${fileName}`);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${path.basename(filePath)}:`, error);
    return false;
  }
};

// Scan directory for JS/JSX files
const scanDirectory = (dirPath) => {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  let filesFound = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively scan subdirectories
      filesFound = [...filesFound, ...scanDirectory(fullPath)];
    } else if (entry.isFile() && /\.(js|jsx)$/.test(entry.name)) {
      // Add JS and JSX files
      filesFound.push(fullPath);
    }
  }

  return filesFound;
};

// Fix all react-icons/fi/index.js imports to use react-icons/fi
const fixAllIconImportPaths = () => {
  const files = scanDirectory(path.join(__dirname, '../src'));
  let fixedCount = 0;
  
  files.forEach(file => {
    try {
      let content = fs.readFileSync(file, 'utf8');
      const originalContent = content;
      
      // Replace all import statements using react-icons/fi/index.js to react-icons/fi
      const importRegex = /from\s+['"]react-icons\/fi\/index\.js['"]/g;
      content = content.replace(importRegex, "from 'react-icons/fi'");
      
      if (content !== originalContent) {
        fs.writeFileSync(file, content);
        console.log(`✅ Fixed import path in ${path.basename(file)}`);
        fixedCount++;
      }
    } catch (error) {
      console.error(`❌ Error fixing import path in ${path.basename(file)}:`, error);
    }
  });
  
  return fixedCount;
};

// Main execution
const fixAllFiles = () => {
  console.log('🔧 Starting LearnIQ files fixes...');
  
  // Fix specific files with special handling
  fixLearnIQNavbar();
  fixLearnIQCalendar();
  
  // First fix any issues with react-icons/fi/index.js imports
  console.log('🔍 Fixing import paths...');
  const pathFixCount = fixAllIconImportPaths();
  console.log(`✅ Fixed ${pathFixCount} files with incorrect import paths`);
  
  // Gather all JS/JSX files in the components and pages directories
  const componentFiles = scanDirectory(path.join(__dirname, '../src/components'));
  const pageFiles = scanDirectory(path.join(__dirname, '../src/pages'));
  const allFiles = [...componentFiles, ...pageFiles];
  
  console.log(`📁 Found ${allFiles.length} JS/JSX files to process`);
  
  // Count fixed files
  let fixedCount = 0;
  
  // Process all files
  allFiles.forEach(file => {
    // First try to fix existing imports
    const fixed = fixIconImports(file);
    if (fixed) {
      fixedCount++;
    } else {
      // If no existing imports fixed, try to add missing imports
      const added = addMissingImports(file);
      if (added) fixedCount++;
    }
  });
  
  console.log(`✅ Fixed ${fixedCount} files out of ${allFiles.length} total`);
  console.log('✨ Completed LearnIQ files fixes!');
};

// Run the script
fixAllFiles();