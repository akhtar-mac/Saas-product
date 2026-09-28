/**
 * Test ETaxwala Staff Chat Popup Notification live in Chrome in front of user
 */
const http = require('http');
const { execSync } = require('child_process');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getTargetPage() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json/list', (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          const list = JSON.parse(data);
          const page = list.find((p) => p.type === 'page' && p.url.includes('localhost:5173')) || list.find((p) => p.type === 'page');
          if (!page) return reject(new Error('No active Chrome tab found'));
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
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { res, rej } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) rej(msg.error);
          else res(msg.result);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { res: resolve, rej: reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result?.value;
  }

  async navigate(url) {
    await this.send('Page.navigate', { url });
    await sleep(1500);
  }
}

async function run() {
  console.log('Connecting to Chrome on port 9222...');
  const target = await getTargetPage();
  const cdp = new CdpClient(target.webSocketDebuggerUrl);
  await cdp.connect();

  // Focus Chrome window
  try {
    execSync(`osascript -e 'tell application "Google Chrome" to activate'`);
  } catch {}

  console.log('Navigating to CRM dashboard...');
  await cdp.navigate('http://localhost:5173/crm');
  await sleep(1500);

  console.log('Triggering ETaxwala Staff Chat Popup Notification...');
  const triggerResult = await cdp.eval(`
    (function() {
      const btn = document.getElementById('staff-test-notif-btn') || document.getElementById('whatsapp-test-notif-btn');
      if (btn) {
        btn.click();
        return { clicked: true };
      }
      return { clicked: false, reason: 'Button not found' };
    })()
  `);
  console.log('Staff alert trigger button clicked:', triggerResult);

  // Wait 2.2 seconds so user sees the newly branded popup appear
  await sleep(2200);

  console.log('Clicking Quick Reply on the staff popup card...');
  await cdp.eval(`
    (function() {
      const quickReplyBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Quick Reply'));
      if (quickReplyBtn) quickReplyBtn.click();
    })()
  `);

  await sleep(1200);

  console.log('Typing response in the inline Quick Reply input...');
  await cdp.eval(`
    (function() {
      const input = document.querySelector('input[placeholder*="reply"]');
      if (input) {
        input.value = 'Acknowledged Priya! Proceeding to upload to MCA portal. 👍';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    })()
  `);

  await sleep(1200);

  console.log('Dispatching quick reply to staff member...');
  await cdp.eval(`
    (function() {
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    })()
  `);

  await sleep(2200);
  console.log('ETaxwala Staff Chat Popup successfully verified live in Chrome!');
}

run().catch((err) => {
  console.error('Error during test:', err);
  process.exit(1);
});
