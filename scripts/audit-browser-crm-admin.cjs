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
    this.events = [];
    this.consoleErrors = [];
    this.networkErrors = [];
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new globalThis.WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = err => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.method === 'Runtime.consoleAPICalled') {
          if (msg.params.type === 'error') {
            const args = msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
            this.consoleErrors.push(args);
          }
        }
        if (msg.method === 'Network.responseReceived') {
          const status = msg.params.response.status;
          const url = msg.params.response.url;
          if (status >= 400 && !url.includes('favicon')) {
            this.networkErrors.push({ url, status });
          }
        }
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

  await cdp.send('Runtime.enable');
  await cdp.send('Page.enable');
  await cdp.send('Network.enable');

  const pagesToTest = [
    { name: 'CRM Dashboard', url: 'http://localhost:5173/crm' },
    { name: 'Manage Categories', url: 'http://localhost:5173/crm/manage-categories' },
    { name: 'Manage Services', url: 'http://localhost:5173/crm/manage-services' },
    { name: 'Manage Packages', url: 'http://localhost:5173/crm/manage-packages' },
    { name: 'Manage Blogs', url: 'http://localhost:5173/crm/manage-blogs' },
    { name: 'Appointments', url: 'http://localhost:5173/crm/appointments' },
    { name: 'Users & Roles', url: 'http://localhost:5173/crm/users' },
    { name: 'Leads Pipeline', url: 'http://localhost:5173/crm/leads' },
    { name: 'Quotations Studio', url: 'http://localhost:5173/crm/quotations' },
    { name: 'Operations Tasks', url: 'http://localhost:5173/crm/tasks' },
    { name: 'Accounts / Customers', url: 'http://localhost:5173/crm/accounts' },
    { name: 'Call Analytics', url: 'http://localhost:5173/crm/call-analytics' },
    { name: 'Workforce Roster', url: 'http://localhost:5173/crm/workforce' },
    { name: 'IT Command Center', url: 'http://localhost:5173/crm/it-command' },
    { name: 'Marketing Hub', url: 'http://localhost:5173/crm/marketing' },
    { name: 'HR Desk', url: 'http://localhost:5173/crm/hr' },
    { name: 'Franchise Network', url: 'http://localhost:5173/crm/franchise' },
    { name: 'Sub-Brands Hub', url: 'http://localhost:5173/crm/sub-brands' },
  ];

  const results = [];

  for (const p of pagesToTest) {
    console.log(`Auditing page: ${p.name} (${p.url})...`);
    cdp.consoleErrors.length = 0;
    cdp.networkErrors.length = 0;

    await cdp.navigate(p.url);
    await sleep(1500);

    const check = await cdp.eval(`
      (function() {
        const bodyText = document.body.innerText || '';
        const h1 = document.querySelector('h1')?.innerText || '';
        const h2 = document.querySelector('h2')?.innerText || '';
        const h3 = document.querySelector('h3')?.innerText || '';
        const tableRows = document.querySelectorAll('tr').length;
        const inputs = document.querySelectorAll('input, select, textarea').length;
        const buttons = document.querySelectorAll('button').length;
        const isBlank = bodyText.trim().length < 50;
        const hasErrorBoundary = bodyText.includes('Something went wrong') || bodyText.includes('Application Error');
        return {
          h1,
          h2: h2 || h3,
          tableRows,
          inputs,
          buttons,
          textLength: bodyText.length,
          isBlank,
          hasErrorBoundary,
        };
      })()
    `);

    results.push({
      page: p.name,
      url: p.url,
      ...check,
      consoleErrors: [...cdp.consoleErrors],
      networkErrors: [...cdp.networkErrors],
      status: (check && !check.isBlank && !check.hasErrorBoundary && cdp.consoleErrors.length === 0) ? 'PASS' : 'WARN',
    });
  }

  console.log('\n======================================================');
  console.log('AUDIT SUMMARY FOR ALL 18 PAGES:');
  console.log('======================================================');
  console.table(results.map(r => ({
    Page: r.page,
    Status: r.status,
    Heading: (r.h1 || r.h2 || '').slice(0, 30),
    Rows: r.tableRows,
    Buttons: r.buttons,
    Errors: r.consoleErrors.length,
    NetErrors: r.networkErrors.length,
  })));

  const fs = require('fs');
  fs.writeFileSync('scripts/audit-browser-results.json', JSON.stringify(results, null, 2));
  console.log('\nSaved full results to scripts/audit-browser-results.json');
}

run().catch(err => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});
