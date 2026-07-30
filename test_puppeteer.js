import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('requestfailed', request => {
    console.log(`FAILED: ${request.url()} - ${request.failure().errorText}`);
  });
  page.on('response', response => {
    console.log(`RESPONSE: ${response.url()} - Status: ${response.status()}`);
  });

  await page.goto('http://localhost:3000/test.html');
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
