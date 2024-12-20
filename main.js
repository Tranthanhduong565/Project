const puppeteer = require('puppeteer');
const fs = require('fs');
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const cookieData = fs.readFileSync('cookies.txt', 'utf8');
  const cookies = cookieData.split('\n').map((line) => {
    const [name, value, domain] = line.split(';');
    return { name, value, domain };
  });
  await page.setCookie(...cookies);
  await page.goto('(link unavailable)');
  await new Promise(resolve => setTimeout(resolve, 5000)); // deplay 5s
  await page.screenshot({ path: 'screenshot.png' });
  console.log('Đăng nhập thành công, ảnh chụp màn hình đã được lưu!');
  await browser.close();
})();
