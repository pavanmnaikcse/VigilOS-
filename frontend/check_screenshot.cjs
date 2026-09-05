const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'screenshot.png' });
  console.log("Screenshot saved.");
  
  // also dump the computed styles of the body
  const bodyBg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
  const bodyColor = await page.evaluate(() => window.getComputedStyle(document.body).color);
  console.log("Body bg:", bodyBg);
  console.log("Body color:", bodyColor);

  await browser.close();
})();
