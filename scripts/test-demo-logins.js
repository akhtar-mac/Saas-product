const http = require('http');

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function getTargetPage() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json/list', (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const list = JSON.parse(data);
          const page = list.find(p => p.type === 'page' && p.url.includes('localhost:5173')) || list.find(p => p.type === 'page');
          if (!page) return reject(new Error('No active Chrome tab found on port 9222'));
          resolve(page);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new globalThis.WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = reject;
      this.ws.onmessage = (msg) => {
        const payload = JSON.parse(msg.data);
        if (payload.id && this.callbacks.has(payload.id)) {
          const cb = this.callbacks.get(payload.id);
          this.callbacks.delete(payload.id);
          cb(payload);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      const payload = { id, method, params };
      this.callbacks.set(id, (res) => {
        if (res.error) reject(new Error(JSON.stringify(res.error)));
        else resolve(res.result);
      });
      this.ws.send(JSON.stringify(payload));
    });
  }

  async eval(expr) {
    const res = await this.send('Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result?.value;
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function main() {
  const page = await getTargetPage();
  const cdp = new CdpClient(page.webSocketDebuggerUrl);
  await cdp.connect();
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');

  const report = {};

  try {
    // 1. Test /login redirect
    console.log('Testing /login redirect...');
    await cdp.send('Page.navigate', { url: 'http://localhost:5173/login' });
    await sleep(1500);
    report.afterLoginUrl = await cdp.eval('window.location.href');
    console.log('Navigated /login ->', report.afterLoginUrl);

    // 2. Test Staff CRM Login Page
    console.log('Testing CRM 1-Click Demo Login...');
    await cdp.send('Page.navigate', { url: 'http://localhost:5173/crm/login' });
    await sleep(1500);

    const checkForm = await cdp.eval(`({
      hasAdminEmail: document.querySelector('input[type="email"]')?.value,
      hasPassword: !!document.querySelector('input[type="password"]')?.value,
      quickButtons: Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(t => t.includes('Admin') || t.includes('Login')),
      staffCardsCount: document.querySelectorAll('.grid > div').length
    })`);
    report.crmLoginForm = checkForm;
    console.log('CRM Form State:', JSON.stringify(checkForm, null, 2));

    // Click Super Admin 1-Click button
    console.log('Clicking Super Admin 1-Click button...');
    await cdp.eval(`(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const adminBtn = btns.find(b => b.innerText.includes('Super Admin')) || document.querySelector('button[type="submit"]');
      if (adminBtn) adminBtn.click();
      return !!adminBtn;
    })()`);

    await sleep(2500);
    report.crmAfterClickUrl = await cdp.eval('window.location.href');
    report.crmRoleDisplay = await cdp.eval(`document.querySelector('.uppercase')?.innerText || document.body.innerText.slice(0, 100)`);
    console.log('CRM URL after login:', report.crmAfterClickUrl);

    // 3. Test Client Portal Login
    console.log('Testing Client Portal 1-Click Demo Login...');
    await cdp.send('Page.navigate', { url: 'http://localhost:5173/portal/login' });
    await sleep(1500);

    const clientFormCheck = await cdp.eval(`({
      identifier: document.querySelector('input[type="text"]')?.value,
      hasPassword: !!document.querySelector('input[type="password"]')?.value,
      has1ClickBtn: !!Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('1-Click Login'))
    })`);
    report.clientFormState = clientFormCheck;
    console.log('Client Portal Form State:', JSON.stringify(clientFormCheck, null, 2));

    // Click 1-Click Login button
    await cdp.eval(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('1-Click Login')) || document.querySelector('button[type="submit"]');
      if (btn) btn.click();
      return !!btn;
    })()`);

    await sleep(2500);
    report.portalAfterClickUrl = await cdp.eval('window.location.href');
    report.portalHeading = await cdp.eval(`document.querySelector('h1')?.innerText || document.body.innerText.slice(0, 100)`);
    console.log('Portal URL after login:', report.portalAfterClickUrl);

  } finally {
    cdp.close();
  }

  console.log('\n=== FINAL VERIFICATION SUMMARY ===');
  console.log(JSON.stringify(report, null, 2));
}

main().catch(console.error);
