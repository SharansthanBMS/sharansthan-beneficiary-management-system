import puppeteer from 'puppeteer-core';
(async () => {
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  await page.goto('http://localhost:3000/test4.html');
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
