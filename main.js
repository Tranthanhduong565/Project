const puppeteer = require('puppeteer');
const fs = require('fs');

global.accessToken = null;
global.userData = {};

async function login() {
  try {
    if (!fs.existsSync('cookies.txt')) return fs.writeFileSync('cookies.txt', '');
    const cookies = fs.readFileSync('cookies.txt', 'utf8').split('\n').map(line => line.split(';'));
    if (!cookies.every(cookie => cookie.length === 3)) return console.error('Định dạng cookies không chính xác!');

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setCookie(...cookies.map(([name, value, domain]) => ({ name, value, domain })));
    await page.goto('(link unavailable)');
    await new Promise(resolve => setTimeout(resolve, 5000));

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
    await browser.close();
  } catch (error) {
    console.error('Đăng nhập thất bại:', error.message);
  }
}

login();
