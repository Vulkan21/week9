const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

// Отключаем строгую проверку Content-Type
app.disable('etag');

// Обработка OPTIONS для CORS
app.options('*', (req, res) => {
  res.sendStatus(200);
});

// Корневой маршрут
app.get('/', (req, res) => {
  res.type('text/plain').send('Week 9 Server - Use /login/ or /test/?URL=...');
});

app.get('/login/', (req, res) => {
  res.type('text/plain').send('c5803a15-0cfc-4719-ab77-c604044c9c5a');
});

app.get('/test/', async (req, res) => {
  const targetURL = req.query.URL;

  if (!targetURL) {
    return res.type('text/plain').status(400).send('URL parameter is required');
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
        '--no-zygote'
      ]
    });
  } catch (error) {
    return res.type('text/plain').status(500).send(`Error launching browser: ${error.message}`);
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
      return res.type('text/plain').status(500).send('Error: Could not get result from input field');
    }

    res.type('text/plain').send(result);
  } catch (error) {
    if (browser) {
      await browser.close().catch(() => {});
    }
    res.type('text/plain').status(500).send(`Error: ${error.message}`);
  }
});

// На Render используем переменную окружения PORT, по умолчанию 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

