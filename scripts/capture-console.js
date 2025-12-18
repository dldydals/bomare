import puppeteer from 'puppeteer';

(async () => {
  const url = process.argv[2] || 'http://localhost:5173/tarrot';
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  page.on('console', msg => {
    console.log('PAGE LOG:', msg.type(), msg.text());
  });

  page.on('pageerror', err => {
    console.error('PAGE ERROR:', err.toString());
  });

  await page.goto(url, { waitUntil: 'networkidle0', timeout: 10000 }).catch(e => console.error('GOTO ERROR:', e.message));

  // capture HTML
  const html = await page.content();
  console.log('\n--- HTML snapshot ---');
  console.log(html.slice(0, 2000));

  // If debug button exists, click it to trigger error
  const clicked = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Trigger Error'));
    if (btn) { btn.click(); return true; }
    return false;
  });
  if (clicked) {
    console.log('Clicked debug trigger button');
    await new Promise(r => setTimeout(r, 500));
  }

  const errorText = await page.evaluate(() => {
    const pre = document.querySelector('pre');
    const h1 = document.querySelector('h1');
    return { pre: pre ? pre.textContent : null, h1: h1 ? h1.textContent : null, body: document.body.innerText };
  });
  console.log('\n--- ErrorBoundary content ---');
  console.log(errorText);

  await browser.close();
})();