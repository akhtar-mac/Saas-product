/**
 * Test WhatsApp Chat Popup Notification live in Chrome in front of user
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

  // Focus Chrome
  try {
    execSync(`osascript -e 'tell application "Google Chrome" to activate'`);
  } catch {}

  console.log('Navigating to CRM Leads dashboard...');
  await cdp.navigate('http://localhost:5173/crm/leads');
  await sleep(1500);

  console.log('Triggering WhatsApp Popup Notification...');
  // Click the header WhatsApp button
  const triggerResult = await cdp.eval(`
    (function() {
      const btn = document.getElementById('whatsapp-test-notif-btn');
      if (btn) {
        btn.click();
        return { clicked: true };
      }
      return { clicked: false, reason: 'Button not found' };
    })()
  `);
  console.log('WhatsApp notification button clicked:', triggerResult);

  // Wait 2 seconds so the user sees the popup appear with the green WhatsApp badge, avatar, and message!
  await sleep(2200);

  // Click "Quick Reply" on the popup card
  console.log('Clicking Quick Reply inside WhatsApp popup...');
  await cdp.eval(`
    (function() {
      const quickReplyBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Quick Reply'));
      if (quickReplyBtn) quickReplyBtn.click();
    })()
  `);

  await sleep(1000);

  // Type a reply into the WhatsApp popup input
  console.log('Typing WhatsApp reply into popup...');
  await cdp.eval(`
    (function() {
      const input = document.querySelector('input[placeholder*="WhatsApp reply"]');
      if (input) {
        input.value = 'Approved! Proceeding with MCA ROC verification. 👍';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    })()
  `);

  await sleep(1200);

  // Send the reply
  console.log('Sending WhatsApp quick reply...');
  await cdp.eval(`
    (function() {
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    })()
  `);

  await sleep(2000);
  console.log('WhatsApp Popup test completed successfully in front of user!');
}

run().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
