import 'dotenv/config';
import { chromium } from '@playwright/test';

const inspectScript = `(() => {
  const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim().slice(0, 100);
  const info = (el) => {
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName.toLowerCase(),
      id: el.id || undefined,
      type: el.getAttribute('type') || undefined,
      name: el.getAttribute('name') || undefined,
      placeholder: el.getAttribute('placeholder') || undefined,
      ariaLabel: el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || undefined,
      text: clean(el.textContent),
      value: el.value || undefined,
      visible: r.width > 0 && r.height > 0,
      classes: clean(el.getAttribute('class')),
    };
  };
  return {
    inputs: Array.from(document.querySelectorAll('input, textarea, select')).map(info),
    buttons: Array.from(document.querySelectorAll('button, [role=button], input[type=submit]')).map(info),
    ids: Array.from(document.querySelectorAll('[id]')).map((e) => e.id).filter(Boolean).slice(0, 250),
    links: Array.from(document.querySelectorAll('a[href]')).map((a) => ({
      text: clean(a.textContent),
      href: a.getAttribute('href'),
      id: a.id || undefined,
      visible: a.getBoundingClientRect().width > 0,
    })).slice(0, 80),
    forms: Array.from(document.querySelectorAll('form')).map((f) => ({
      id: f.id,
      action: f.getAttribute('action'),
      method: f.getAttribute('method'),
    })),
    bodyText: clean(document.body.innerText),
  };
})()`;

async function main() {
  const base = process.env.BASE_URL;
  if (!base) throw new Error('BASE_URL missing');
  const path = process.env.LOGIN_PATH ?? '/login_page';

  const browser = await chromium.launch();
  const appPassword = process.env.APP_PASSWORD;
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    httpCredentials: appPassword
      ? { username: process.env.APP_USERNAME || 'bubble', password: appPassword }
      : undefined,
  });
  const page = await context.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log('[console.error]', msg.text());
  });

  await page.goto(base + path, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);

  console.log('URL:', page.url());
  console.log('TITLE:', await page.title());

  const data = await page.evaluate(inspectScript);
  console.log(JSON.stringify(data, null, 2));
  await page.screenshot({ path: 'artifacts/login-page.png', fullPage: true });
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
