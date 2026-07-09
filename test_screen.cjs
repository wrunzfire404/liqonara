const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  console.log("Navigating...");
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
  
  await new Promise(r => setTimeout(r, 2000)); 
  
  await page.screenshot({ path: 'screenshot.png' });
  console.log("Screenshot saved.");
  
  await browser.close();
})();
