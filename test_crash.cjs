const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => {
    console.log('REQUEST FAILED:', request.url(), request.failure().errorText);
  });
  page.on('response', response => {
    if (response.status() >= 400) {
      console.log('ERROR STATUS:', response.status(), response.url());
    }
  });

  console.log("Navigating...");
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
  
  await new Promise(r => setTimeout(r, 2000)); // Wait a bit to see if it blanks
  
  const content = await page.content();
  if (!content.includes('Liqonara')) {
     console.log("PAGE IS LIKELY BLANK. Length:", content.length);
  }
  
  await browser.close();
})();
