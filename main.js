const puppeteer = require('puppeteer');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Hàm cài đặt Chromium nếu không có
async function installChromeIfNeeded() {
    try {
        // Kiểm tra xem Puppeteer đã cài đặt Chrome chưa
        const result = await puppeteer.executablePath();
        if (!result) {
            throw new Error('Chromium không được cài đặt.');
        }
    } catch (error) {
        console.log('Chrome không tìm thấy. Đang cài đặt Chromium...');
        try {
            // Cài đặt Chromium
            execSync('npx puppeteer install', { stdio: 'inherit' });
            console.log('Chromium đã được cài đặt thành công!');
        } catch (installError) {
            console.error('Không thể cài đặt Chromium:', installError.message);
            throw new Error('Cài đặt Chromium thất bại!');
        }
    }
}

// Hàm đăng nhập và xuất cookie
async function loginAndExportCookies(email, password) {
    await installChromeIfNeeded();  // Kiểm tra và cài đặt Chromium nếu cần

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],  // Các tham số cho môi trường không có giao diện người dùng
        executablePath: puppeteer.executablePath()  // Sử dụng đường dẫn đến Chromium đã cài đặt
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
            throw new Error('Đăng nhập thất bại! Kiểm tra tài khoản hoặc mật khẩu.');
        }

        const cookies = await page.cookies();
        const fbCookies = cookies.filter(cookie => cookie.domain.includes('facebook.com'));
        
        const userId = await page.evaluate(() => {
            const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
            return userInfo.id || 'Không tìm thấy ID';
        });

        console.log(`ID người dùng: ${userId}`);

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
        throw new Error(`Lỗi trong quá trình đăng nhập: ${err.message}`);
    } finally {
        await browser.close();
    }
}

// Sử dụng email và mật khẩu của bạn
const email = 'duongduongg465@gmail.com';
const password = 'ttđ952008';

loginAndExportCookies(email, password)
    .then(fbState => {
        const filePath = path.join(__dirname, 'fbstate.json');
        fs.writeFileSync(filePath, JSON.stringify(fbState, null, 4));
        console.log('Đăng nhập thành công và cookie đã được lưu!');
    })
    .catch(err => {
        console.error(`Đăng nhập thất bại: ${err.message}`);
    });
