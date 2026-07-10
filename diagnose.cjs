const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  const logs = [];

  page.on('console', msg => {
    const text = msg.text();
    logs.push(`[${msg.type()}] ${text}`);
  });
  
  page.on('pageerror', err => {
    errors.push('PAGEERROR: ' + err.message + '\n' + err.stack);
  });

  page.on('requestfailed', req => {
    logs.push('REQFAIL: ' + req.url() + ' ' + req.failure()?.errorText);
  });

  await page.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
  
  // Wait for initial render
  await new Promise(r => setTimeout(r, 500));
  const html1 = await page.evaluate(() => document.getElementById('root')?.innerHTML?.length);
  console.log('Root innerHTML length at 500ms:', html1);

  // Wait for crash
  await new Promise(r => setTimeout(r, 4000));
  const html2 = await page.evaluate(() => document.getElementById('root')?.innerHTML?.length);
  console.log('Root innerHTML length at 4500ms:', html2);

  console.log('\n=== PAGE ERRORS ===');
  errors.forEach(e => console.log(e));

  console.log('\n=== CONSOLE LOGS (errors/warns) ===');
  logs.filter(l => l.includes('[error]') || l.includes('[warn]') || l.includes('REQFAIL') || l.includes('blocked')).forEach(l => console.log(l));

  await browser.close();
})();
