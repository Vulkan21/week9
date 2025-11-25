const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

app.get('/login/', (_, res) => {
  res.send('c5803a15-0cfc-4719-ab77-c604044c9c5a');
});

app.get('/test/', async (req, res) => {
  const targetURL = req.query.URL;

  if (!targetURL) {
    return res.status(400).send('URL parameter is required');
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
  } catch (error) {
    return res.status(500).send(`Error launching browser: ${error.message}`);
  }

  try {
    const page = await browser.newPage();
    await page.goto(targetURL, { waitUntil: 'networkidle2', timeout: 30000 });

    await page.click('#bt');

    await page.waitForFunction(() => {
      const input = document.querySelector('#inp');
      return input && input.value;
    }, { timeout: 10000 });

    const result = await page.evaluate(() => {
      const input = document.querySelector('#inp');
      return input ? input.value : null;
    });

    await browser.close();

    if (!result) {
      return res.status(500).send('Error: Could not get result from input field');
    }

    res.setHeader('Content-Type', 'text/plain');
    res.send(result);
  } catch (error) {
    if (browser) {
      await browser.close().catch(() => {});
    }
    res.status(500).send(`Error: ${error.message}`);
  }
});

// На Render используем переменную окружения PORT, по умолчанию 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

