// getVersion.js
const { chromium } = require('playwright');

(async () => {
  const env = process.argv[2]; // "mirror" or "prerelease"

  const config = {
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

  if (!env || !config[env]) {
    console.error("Please provide 'mirror' or 'prerelease' as argument.");
    process.exit(1);
  }

  const { url, username, password } = config[env];

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url);

  await page.fill('input[name="serialNumber"]', username);
  await page.fill('input[name="password"]', password);
  await page.click('button:has-text("Anmelden")');

  // Wait until version label appears
  await page.waitForSelector('#ext-gen1119'); // might need to adjust selector

  const version = await page.textContent('#ext-gen1119');

  console.log(`Version from ${env}: ${version}`);
  await browser.close();
})();
