const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    const email = 'duongduongg465@gmail.com';
    const password = 'ttđ952008';

    try {
        await page.goto('https://www.facebook.com/');
        await page.type('#email', email);
        await page.type('#pass', password);
        await page.click('button[name="login"]');
        await page.waitForNavigation();

        if (page.url().includes('https://www.facebook.com/')) {
            await page.goto('https://www.facebook.com/me');
            await page.waitForTimeout(2000);

            const userId = await page.evaluate(() => {
                const meta = document.querySelector('meta[property="al:android:url"]');
                return meta ? meta.content.match(/profile\/(\d+)/)?.[1] : null;
            });

            console.log(userId ? `ID tài khoản: ${userId}` : 'Không tìm thấy ID.');
        } else {
            console.log('Đăng nhập thất bại.');
        }
    } catch (error) {
        console.error('Lỗi:', error);
    } finally {
        await browser.close();
    }
})();
