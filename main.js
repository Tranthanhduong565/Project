const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function loginAndExportCookies(email, password) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: puppeteer.executablePath()
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
