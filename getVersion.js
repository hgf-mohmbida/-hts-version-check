// getVersion.js
const { chromium } = require('playwright');

(async () => {
  const env = (process.argv[2] || '').toLowerCase();

  const cfg = {
    mirror: {
      url:  'https://mirror.hogrefe-ws.com/HTSMirror/main#',
      user: process.env.HTS_USERNAME_MIRROR,
      pass: process.env.HTS_PASSWORD_MIRROR,
    },
    prerelease: {
      url:  'https://eval.hogrefe-ws.com/HTSPrerelease/main#',
      user: process.env.HTS_USERNAME_PRERELEASE,
      pass: process.env.HTS_PASSWORD_PRERELEASE,
    },
  };

  if (!cfg[env]) { console.error('arg: mirror | prerelease'); process.exit(1); }

  const { url, user, pass } = cfg[env];

  const browser = await chromium.launch({ headless: true });
  const page    = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });

    await page.fill('input[type="text"]',     user);
    await page.fill('input[type="password"]', pass);

    await Promise.all([
      page.waitForSelector('#footerInfo-statusvalueVersion', { timeout: 15_000 }),
      page.click('button:has-text("Anmelden")'),
    ]);

    const version = await page.textContent('#footerInfo-statusvalueVersion');
    console.log(version.trim());
  } finally {
    await browser.close();
  }
})();

