const puppeteer = require('puppeteer');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to install Chromium if missing
async function installChromeIfNeeded() {
    try {
        // Check if Puppeteer has installed Chromium
        const result = await puppeteer.executablePath();
        if (!result) {
            throw new Error('Chromium not installed.');
        }
    } catch (error) {
        console.log('Chromium not found. Installing Chromium...');
        try {
            // Install Chromium using Puppeteer
            execSync('npx puppeteer install', { stdio: 'inherit' });
            console.log('Chromium installed successfully!');
        } catch (installError) {
            console.error('Could not install Chromium:', installError.message);
            throw new Error('Chromium installation failed!');
        }
    }
}

// Set the cache path manually (important for Render or similar environments)
process.env.PUPPETEER_CACHE_DIR = '/opt/render/.cache/puppeteer'; // Set the correct cache path for Render

async function loginAndExportCookies(email, password) {
    await installChromeIfNeeded();  // Check and install Chromium if needed

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],  // Args for headless environment
        executablePath: puppeteer.executablePath()  // Use installed Chromium
    });

    const page = await browser.newPage();

    try {
        await page.goto('https://www.facebook.com/login', { waitUntil: 'networkidle2' });

        await page.type('#email', email, { delay: 100 });
        await page.type('#pass', password, { delay: 100 });

        await Promise.all([
            page.click('[name="login"]'),
            page.waitForNavigation({ waitUntil: 'networkidle2' }),
        ]);

        const isLoggedIn = await page.evaluate(() => !document.querySelector('#error_box'));

        if (!isLoggedIn) {
            throw new Error('Login failed! Check your email or password.');
        }

        const cookies = await page.cookies();
        const fbCookies = cookies.filter(cookie => cookie.domain.includes('facebook.com'));
        
        const userId = await page.evaluate(() => {
            const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
            return userInfo.id || 'User ID not found';
        });

        console.log(`User ID: ${userId}`);

        return fbCookies.map(cookie => ({
            key: cookie.name,
            value: cookie.value,
            domain: cookie.domain,
            path: cookie.path,
            expirationDate: cookie.expires || null,
            hostOnly: cookie.hostOnly,
            creation: new Date().toISOString(),
            lastAccessed: new Date().toISOString(),
        }));
    } catch (err) {
        throw new Error(`Error during login: ${err.message}`);
    } finally {
        await browser.close();
    }
}

// Email and password for login
const email = 'duongduongg465@gmail.com';  // Replace with your email
const password = 'ttđ952008';        // Replace with your password

loginAndExportCookies(email, password)
    .then(fbState => {
        const filePath = path.join(__dirname, 'fbstate.json');
        fs.writeFileSync(filePath, JSON.stringify(fbState, null, 4));
        console.log('Login successful and cookies saved!');
    })
    .catch(err => {
        console.error(`Login failed: ${err.message}`);
    });
