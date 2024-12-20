const puppeteer = require('puppeteer');
const fs = require('fs');

global.accessToken = null;
global.userData = {};

async function login() {
  try {
    if (!fs.existsSync('cookies.txt')) {
      console.error('File cookies.txt không tồn tại!');
      return;
    }

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    const cookies = fs.readFileSync('cookies.txt', 'utf8').split('\n').map(line => line.split(';'));

    for (const cookie of cookies) {
      await page.setCookie({
        name: cookie[0],
        value: cookie[1],
        domain: '(link unavailable)',
        url: '(link unavailable)'
      });
    }

    await page.goto('(link unavailable)');
    await page.waitForTimeout(5000);

    global.userData = await page.evaluate(() => ({
      fullName: document.title.split(' | ')[0],
      userId: document.querySelector('a[href*="profile.php"]').href.split('=')[1],
      accessToken: document.cookie.match(/EAAA\w+/)[0],
      country: document.querySelector('._5kxv').textContent,
      isActive: document.querySelector('._50f4').textContent.includes('Hoạt động')
    }));

    global.accessToken = global.userData.accessToken;
    console.log('Đăng nhập thành công!');
    console.log(global.userData);

    await page.screenshot({ path: 'login_success.png' });
    console.log('Chụp màn hình thành công!');

    await browser.close();
  } catch (error) {
    console.error('Đăng nhập thất bại:', error.message);
  }
}

login();
