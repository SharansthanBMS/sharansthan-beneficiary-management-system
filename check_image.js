import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  page.on('request', request => {
    if (request.resourceType() === 'image') {
      console.log('IMAGE REQUEST:', request.url());
    }
  });
  page.on('response', response => {
    if (response.request().resourceType() === 'image') {
      console.log('IMAGE RESPONSE:', response.url(), response.status());
    }
  });

  await page.goto('http://localhost:3001');
  
  // Try to find the image in DOM or wait a bit
  await new Promise(r => setTimeout(r, 5000));
  
  const beneficiaryInfo = await page.evaluate(() => {
    // In React dev tools we'd get the props, but here let's just find Avatar components
    const imgs = Array.from(document.querySelectorAll('img'));
    return imgs.map(img => img.src);
  });
  
  console.log('IMG TAGS:', beneficiaryInfo);
  
  await browser.close();
})();
