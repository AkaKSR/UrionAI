import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const root = path.resolve('game_factory/games');
const dirs = fs.readdirSync(root).filter(d => fs.existsSync(path.join(root, d, 'index.html')));

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });

const results = [];
for (const game of dirs) {
  const page = await context.newPage();
  const logs = [];
  const errors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') logs.push(msg.text());
  });
  page.on('pageerror', err => errors.push(String(err)));

  const url = `http://127.0.0.1:4173/game_factory/games/${game}/index.html`;
  let navError = null;
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(2000);
    await page.keyboard.press('ArrowLeft').catch(() => {});
    await page.keyboard.press('ArrowRight').catch(() => {});
    await page.keyboard.press('Space').catch(() => {});
    await page.keyboard.press('KeyR').catch(() => {});
    await page.mouse.click(300, 300).catch(() => {});
    await page.waitForTimeout(2000);
  } catch (e) {
    navError = String(e);
  }

  results.push({
    game,
    navError,
    consoleErrors: logs,
    pageErrors: errors,
    hasIssue: !!navError || logs.length > 0 || errors.length > 0,
  });

  await page.close();
}

await browser.close();

const outPath = path.resolve('game_factory/docs/smoke-test-results.json');
fs.writeFileSync(outPath, JSON.stringify(results, null, 2));

const issues = results.filter(r => r.hasIssue);
console.log(`tested=${results.length} issues=${issues.length}`);
for (const r of issues) {
  console.log(`- ${r.game}`);
  if (r.navError) console.log(`  nav: ${r.navError}`);
  for (const e of r.pageErrors.slice(0,3)) console.log(`  pageerror: ${e}`);
  for (const e of r.consoleErrors.slice(0,3)) console.log(`  console: ${e}`);
}
