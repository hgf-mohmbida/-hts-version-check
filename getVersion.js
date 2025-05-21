// getVersion.js
const { chromium } = require('playwright');      // 1️⃣ Playwright API

(async () => {
  const env = process.argv[2];                   // mirror | prerelease

  const config = {
    mirror: {
      url: 'https://mirror.hogrefe-ws.com/HTSMirror/main#',
      username: process.env.HTS_USERNAME_MIRROR,
      password: process.env.HTS_PASSWORD_MIRROR
    },
    prerelease: {
      url: 'https://eval.hogrefe-ws.com/HTSPrerelease/main#',
      username: process.env.HTS_USERNAME_PRERELEASE,
      password: process.env.HTS_PASSWORD_PRERELEASE
    }
  };

  if (!env || !config[env]) {
    console.error('Please call with "mirror" or "prerelease"');
    process.exit(1);
  }

  const { url, username, password } = config[env];

  const browser = await chromium.launch({ headless: true });
  const page     = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  /* -----  🔑  Login  ----- */
  await page.fill('input[type="text"]',  username);   // erstes Textfeld = Serien-Nr.
  await page.fill('input[type="password"]', password);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle' }),
    page.click('button:has-text("Anmelden")')
  ]);

  /* -----  🔍  Version auslesen  ----- */
  // Footer-Span hat die ID, die im DevTools-Screenshot sichtbar war:
  const selector = '#footerInfo-statusvalueVersion';
  await page.waitForSelector(selector, { timeout: 15000 });
  const version = await page.textContent(selector);

  console.log(`Version from ${env}: ${version}`);
  await browser.close();
})();

