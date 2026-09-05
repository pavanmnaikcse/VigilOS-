const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  
  const bodyBg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
  const bodyColor = await page.evaluate(() => window.getComputedStyle(document.body).color);
  console.log("Body bg:", bodyBg);
  console.log("Body color:", bodyColor);

  await browser.close();
})();
