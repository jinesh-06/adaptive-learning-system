import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const port = 9222;
  const edge = spawn(edgePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--disable-gpu',
    '--window-size=375,850',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ]);

  try {
    // Wait for CDP to be ready
    let target = null;
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 300));
      try {
        const res = await fetch(`http://127.0.0.1:${port}/json`);
        const list = await res.json();
        if (list && list.length > 0) {
          target = list[0];
          break;
        }
      } catch (e) {}
    }

    if (!target) {
      console.error('Could not connect to Edge DevTools');
      return;
    }

    const ws = new WebSocket(target.webSocketDebuggerUrl);
    let id = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        callbacks.get(msg.id)(msg);
        callbacks.delete(msg.id);
      }
    };

    await new Promise(r => ws.onopen = r);

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const msgId = id++;
        callbacks.set(msgId, resolve);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Page.navigate', { url: 'http://localhost:3000/catalog' });

    console.log('Navigating to catalog page...');
    await new Promise(r => setTimeout(r, 4000));

    console.log('Evaluating catalog cards...');
    const evalRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const cards = Array.from(document.querySelectorAll('h3')).map(h3 => {
            const card = h3.closest('.rounded-2xl') || h3.parentElement;
            const progressEl = card.querySelector('.text-white.font-bold');
            const metaEls = Array.from(card.querySelectorAll('.font-mono span'));
            const ctaBtn = card.querySelector('button');
            return {
              title: h3.textContent.trim(),
              progress: progressEl ? progressEl.textContent.trim() : null,
              meta: metaEls.map(m => m.textContent.trim()),
              cta: ctaBtn ? ctaBtn.textContent.trim() : null
            };
          });
          return { cards };
        })()
      `,
      returnByValue: true
    });

    console.log('Catalog DOM Evaluation Result:', JSON.stringify(evalRes.result?.value, null, 2));

    await new Promise(r => setTimeout(r, 500));

    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    console.log('Screenshot response keys:', Object.keys(screenshot || {}));
    if (screenshot?.result?.data) {
      const buffer = Buffer.from(screenshot.result.data, 'base64');
      const outPath = path.join(__dirname, 'lesson_summary_fixed.png');
      fs.writeFileSync(outPath, buffer);
      console.log('Saved screenshot to:', outPath);
    } else {
      console.log('Screenshot raw:', JSON.stringify(screenshot));
    }

    ws.close();
  } finally {
    edge.kill();
  }
}

run().catch(console.error);
