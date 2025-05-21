const { chromium } = require('playwright');

(async () => {
  const env = (process.argv[2] || '').toLowerCase();
  const cfg = {
    mirror: {
      url: 'https://mirror.hogrefe-ws.com/HTSMirror/main#',
      username: process.env.HTS_USERNAME_MIRROR,
      password: process.env.HTS_PASSWORD_MIRROR,
    },
    prerelease: {
      url: 'https://eval.hogrefe-ws.com/HTSPrerelease/main#',
      username: process.env.HTS_USERNAME_PRERELEASE,
      password: process.env.HTS_PASSWORD_PRERELEASE,
    },
  };

  if (!cfg[env]) process.exit(1);
  const { url, username, password } = cfg[env];

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.fill('input[name="serialNumber"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('button:has-text("Anmelden")');

    await page
      .waitForSelector('#footerInfo-statusvalueVersion', { timeout: 45_000 })
      .catch(async (e) => {
        await page.screenshot({ path: 'debug.png', fullPage: true });
        throw e;
      });

    const version = await page.textContent('#footerInfo-statusvalueVersion');
    console.log(version.trim());
  } finally {
    await browser.close();
  }
})();



