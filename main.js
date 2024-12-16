const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

function parseCookie(rawCookie) {
    return rawCookie.split('; ').map(cookie => {
        const [name, value] = cookie.split('=');
        return {
            name: name.trim(),
            value: value.trim(),
            domain: '.facebook.com',
            path: '/'
        };
    });
}

function getCookiesFromFile() {
    const cookiePath = path.join(__dirname, 'cookies.txt');
    if (!fs.existsSync(cookiePath)) {
        throw new Error('cookies.json not found!');
    }

    const rawData = fs.readFileSync(cookiePath, 'utf-8').trim();
    if (rawData.startsWith('{') || rawData.startsWith('[')) {
        return JSON.parse(rawData);
    } else {
        return parseCookie(rawData);
    }
}

async function loginWithCookie() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    try {
        const cookies = getCookiesFromFile();
        await page.setCookie(...cookies);

        await page.goto('https://www.facebook.com/', { waitUntil: 'networkidle2' });

        const isLoggedIn = await page.evaluate(() => {
            return !document.querySelector('a[href="/login/"]');
        });

        if (!isLoggedIn) {
            throw new Error('Login failed! Cookie may be invalid.');
        }

        console.log('Login successful using cookies.');

        // Lấy ID và tên Facebook
        const userInfo = await page.evaluate(() => {
            const id = document.cookie.match(/c_user=(\d+)/)?.[1];
            const name = document.querySelector('span[data-click="profile_icon"]')?.textContent || null;
            return { id, name };
        });

        if (!userInfo.id || !userInfo.name) {
            throw new Error('Failed to retrieve Facebook user info.');
        }

        console.log(`Facebook ID: ${userInfo.id}`);
        console.log(`Facebook Name: ${userInfo.name}`);

        const updatedCookies = await page.cookies();
        fs.writeFileSync(
            path.join(__dirname, 'updated_cookies.json'),
            JSON.stringify(updatedCookies, null, 4)
        );

        console.log('Cookies have been updated and saved.');
    } catch (err) {
        console.error(`Error during login: ${err.message}`);
    } finally {
        await browser.close();
    }
}

loginWithCookie();
