const puppeteer = require('puppeteer');

// This script will navigate to each LearnIQ dashboard page and take screenshots
async function testDashboardPages() {
  console.log('Starting test of LearnIQ Dashboard pages...');
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Set viewport for screenshots
    await page.setViewport({ width: 1280, height: 800 });
    
    // Login first (adjust with your actual login flow)
    await page.goto('http://localhost:3000/login');
    console.log('Logging in...');
    
    // Fill in login form (adjust selectors and credentials as needed)
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', 'test@example.com');
    await page.type('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for login to complete
    await page.waitForNavigation();
    
    // List of pages to test
    const pagesToTest = [
      { url: '/student/dashboard', name: 'dashboard' },
      { url: '/student/dashboard/progress', name: 'progress' },
      { url: '/student/dashboard/assignments', name: 'assignments' },
      { url: '/student/dashboard/calendar', name: 'calendar' },
      { url: '/student/dashboard/certificates', name: 'certificates' },
      { url: '/student/dashboard/notifications', name: 'notifications' },
      { url: '/student/dashboard/profile', name: 'profile' }
    ];
    
    // Navigate to each page and take screenshot
    for (const pageData of pagesToTest) {
      console.log(`Testing ${pageData.name} page...`);
      await page.goto(`http://localhost:3000${pageData.url}`);
      
      // Wait for main content to load
      await page.waitForSelector('.max-w-7xl', { timeout: 5000 }).catch(() => {
        console.log(`Warning: Main content selector not found on ${pageData.name}`);
      });
      
      // Take screenshot
      await page.screenshot({ 
        path: `learniq-${pageData.name}.png`,
        fullPage: true 
      });
      console.log(`Screenshot saved for ${pageData.name}`);
      
      // Wait briefly between pages
      await new Promise(r => setTimeout(r, 1000));
    }
    
    console.log('All pages tested successfully!');
  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    await browser.close();
  }
}

testDashboardPages();