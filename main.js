const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Hàm đăng nhập và xuất cookie
async function loginAndExportCookies(email, password) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Cần thiết cho hosting
    });
    const page = await browser.newPage();

    try {
        // Điều hướng đến trang đăng nhập của Facebook
        await page.goto('https://www.facebook.com/login', { waitUntil: 'networkidle2' });

        // Nhập email và mật khẩu
        await page.type('#email', email, { delay: 100 });
        await page.type('#pass', password, { delay: 100 });

        // Nhấn nút đăng nhập và chờ điều hướng
        await Promise.all([
            page.click('[name="login"]'),
            page.waitForNavigation({ waitUntil: 'networkidle2' }),
        ]);

        // Kiểm tra đăng nhập thành công
        const isLoggedIn = await page.evaluate(() => {
            return !document.querySelector('#error_box'); // Không có lỗi đăng nhập
        });

        if (!isLoggedIn) {
            throw new Error('Đăng nhập thất bại! Kiểm tra tài khoản hoặc mật khẩu.');
        }

        // Lấy cookie từ trình duyệt
        const cookies = await page.cookies();

        // Lọc cookie liên quan đến Facebook
        const fbCookies = cookies.filter(cookie => cookie.domain.includes('facebook.com'));
        const fbState = fbCookies.map(cookie => ({
            key: cookie.name,
            value: cookie.value,
            domain: cookie.domain,
            path: cookie.path,
            expirationDate: cookie.expires || null,
            hostOnly: cookie.hostOnly,
            creation: new Date().toISOString(),
            lastAccessed: new Date().toISOString(),
        }));

        // Log ID người dùng (có thể trích xuất từ trang chủ hoặc trang profile)
        const userId = await page.evaluate(() => {
            const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
            return userInfo.id || 'Không tìm thấy ID';
        });

        // Log ID người dùng ra console
        console.log(`ID người dùng: ${userId}`);

        return fbState;
    } catch (err) {
        throw new Error(`Lỗi trong quá trình đăng nhập: ${err.message}`);
    } finally {
        await browser.close();
    }
}

// Gọi hàm đăng nhập và xuất cookie
const email = 'duongduongg465@gmail.com';  // Thay thế bằng email của bạn
const password = 'ttđ952008';        // Thay thế bằng mật khẩu của bạn

loginAndExportCookies(email, password)
    .then(fbState => {
        // Lưu vào file fbstate.json
        const filePath = path.join(__dirname, 'fbstate.json');
        fs.writeFileSync(filePath, JSON.stringify(fbState, null, 4));

        console.log('Đăng nhập thành công và cookie đã được lưu!');
    })
    .catch(err => {
        console.error(`Đăng nhập thất bại: ${err.message}`);
    });
