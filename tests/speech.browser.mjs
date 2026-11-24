// Run with Playwright and Chromium installed. Set BROWSER_CHANNEL=msedge to use Edge.
// All requests to Azure are intercepted. This exercises browser audio/IDB, not the service.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const speech = await readFile(new URL('../lib/speech.mjs', import.meta.url));
let browser;
try {
  browser = await chromium.launch(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {});
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const url = 'https://english90.test';
  await context.route(url + '/**', route => {
    if (new URL(route.request().url()).pathname === '/speech.mjs') {
      return route.fulfill({ contentType: 'application/javascript', body: speech });
    }
    return route.fulfill({ contentType: 'text/html', body: '<title>Speech integration fixture</title>' });
  });
  const a = await context.newPage();
  const b = await context.newPage();
  await Promise.all([a.goto(url), b.goto(url)]);
  const sizes = [];
  await context.route('https://japaneast.stt.speech.microsoft.com/**', async route => {
    assert.equal(route.request().method(), 'POST');
    sizes.push(route.request().postDataBuffer().length);
    await route.fulfill({ contentType: 'application/json', json: {
      RecognitionStatus: 'Success', NBest: [{ AccuracyScore: 1 }]
    } });
  });
  await a.evaluate(async () => {
    const { getUsage } = await import('/speech.mjs');
    const { month, limitSeconds } = await getUsage();
    // Leave room for exactly one 2-second request across the two tabs.
    localStorage.setItem('e90budget', JSON.stringify({ [month]: limitSeconds - 2.3 }));
  });
  async function assess(page) {
    return page.evaluate(async () => {
      const { assessRecording } = await import('/speech.mjs');
      // Artificial 31 s, 44.1 kHz stereo silence. Actual Web Audio resamples the file.
      const bytes = new ArrayBuffer(44 + 31 * 44100 * 4);
      const view = new DataView(bytes);
      const label = (offset, text) => {
        [...text].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)));
      };
      label(0, 'RIFF'); label(8, 'WAVE'); label(12, 'fmt '); label(36, 'data');
      view.setUint32(4, bytes.byteLength - 8, true);
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true); view.setUint16(22, 2, true);
      view.setUint32(24, 44100, true); view.setUint32(28, 44100 * 4, true);
      view.setUint16(32, 4, true); view.setUint16(34, 16, true);
      view.setUint32(40, bytes.byteLength - 44, true);
      try {
        const result = await assessRecording({ region: 'japaneast', key: 'test-only',
          referenceText: 'Selected interval.', blob: new Blob([bytes]), start: 27, end: 29 });
        return { ok: true, start: result.start, end: result.end };
      } catch (error) {
        return { ok: false, message: error.message };
      }
    });
  }
  const results = await Promise.all([assess(a), assess(b)]);
  assert.deepEqual(results.find(r => r.ok), { ok: true, start: 27, end: 29 });
  assert.match(results.find(r => !r.ok)?.message || '', /自主上限/);
  assert.deepEqual(sizes, [44 + 2 * 32000]);
  await a.reload();
  const saved = await a.evaluate(async () => (await import('/speech.mjs')).getUsage());
  assert.equal(saved.assessmentSeconds, saved.limitSeconds);
  assert.equal(saved.ttsCharacters, 0);
  process.stdout.write('Browser speech checks passed: real WAV decode/resample, range upload, two-tab cap, legacy carry-over and reload. Azure mocked.\n');
} finally {
  await browser?.close();
}
