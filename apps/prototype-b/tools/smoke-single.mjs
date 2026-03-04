import { chromium } from 'playwright';
const game = process.argv[2];
const browser = await chromium.launch({ headless:true });
const page = await browser.newPage();
page.on('pageerror', err => {
  console.log('PAGEERROR', err.stack || String(err));
});
page.on('console', msg => console.log('CONSOLE', msg.type(), msg.text()));
await page.goto(`http://127.0.0.1:4173/game_factory/games/${game}/index.html`, { waitUntil:'domcontentloaded' });
await page.waitForTimeout(4000);
await page.keyboard.press('ArrowLeft').catch(()=>{});
await page.waitForTimeout(2000);
await browser.close();