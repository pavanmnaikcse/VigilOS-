const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'screenshot.png' });
  console.log("Screenshot saved.");
  
  const bodyBg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
  const bodyColor = await page.evaluate(() => window.getComputedStyle(document.body).color);
  const appBg = await page.evaluate(() => {
    const el = document.querySelector('.app-bg');
    return el ? window.getComputedStyle(el).backgroundColor : 'none';
  });
  console.log("Body bg:", bodyBg);
  console.log("Body color:", bodyColor);
  console.log(".app-bg bg:", appBg);

  await browser.close();
})();
