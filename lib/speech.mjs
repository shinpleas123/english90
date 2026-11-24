import {decodeAudio as readBrowserAudio} from './pcm.mjs';
// Azure is optional. The only network calls in this module follow explicit UI actions.
const locale = 'en-GB';
const sampleRate = 16000;
const limitSeconds = 4 * 3600;
const limitCharacters = 400000;
const counters = ['assessmentSeconds', 'recognitionSeconds', 'ttsCharacters'];

function newUsage(month) {
  return { month, assessmentSeconds: 0, recognitionSeconds: 0, ttsCharacters: 0 };
}

// The original app keeps its own tab and localStorage counter. Import later increments too.
export function includeLegacyUsage(current, oldSeconds) {
  const previous = current.legacySeconds || 0;
  if (!Number.isFinite(oldSeconds) || oldSeconds < 0 || !Number.isSafeInteger(Math.ceil(oldSeconds))
      || !Number.isSafeInteger(previous) || previous < 0) {
    throw new Error('旧版の利用量を確認できないため送信を停止しました。');
  }
  const legacySeconds = Math.max(previous, Math.ceil(oldSeconds));
  return { ...current, assessmentSeconds: current.assessmentSeconds + legacySeconds - previous, legacySeconds };
}

/** Pure calculation shared by the atomic ledger and its boundary tests. */
export function nextUsage(current, counter, amount) {
  if (!counters.includes(counter) || !Number.isSafeInteger(amount) || amount <= 0) {
    throw new Error('送信量を算出できません。音声または原稿を確認してください。');
  }
  if (counters.some(name => !Number.isSafeInteger(current[name]) || current[name] < 0)) {
    throw new Error('利用量の記録を読み取れないため送信を停止しました。');
  }
  const usage = { ...current, [counter]: current[counter] + amount };
  const exhausted = counter === 'ttsCharacters'
    ? usage.ttsCharacters > limitCharacters
    : usage.assessmentSeconds + usage.recognitionSeconds > limitSeconds;
  if (exhausted) {
    throw new Error('この端末の月間自主上限に達します。端末音声と録音で練習を続けられます。');
  }
  return usage;
}

async function ledger(counter, amount) {
  if (!globalThis.indexedDB) throw new Error('利用量を保存できません。ブラウザの保存設定を確認してください。');
  const db = await new Promise((resolve, reject) => {
    const open = indexedDB.open('english90-speech-budget', 1);
    open.onupgradeneeded = () => open.result.createObjectStore('months', { keyPath: 'month' });
    open.onerror = () => reject(new Error('利用量を開けません。端末の空き容量と保存設定を確認してください。'));
    open.onsuccess = () => resolve(open.result);
  });
  const today = new Date();
  // Local calendar month matches e90budget from the previous app.
  const month = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction('months', counter ? 'readwrite' : 'readonly');
      const store = tx.objectStore('months');
      const read = store.get(month);
      let result;
      let reason;
      read.onsuccess = () => {
        try {
          let legacy;
          try {
            legacy = JSON.parse(localStorage.getItem('e90budget') || '{}');
          } catch {
            throw new Error('旧版の利用量を読み取れません。ブラウザの保存設定を確認してください。');
          }
          if (!legacy || typeof legacy !== 'object' || Array.isArray(legacy)) throw new Error('旧版の利用量を読み取れません。');
          result = includeLegacyUsage(read.result || newUsage(month), Object.hasOwn(legacy, month) ? legacy[month] : 0);
          if (counter) {
            result = nextUsage(result, counter, amount);
            store.put(result);
          }
        } catch (error) {
          reason = error;
          tx.abort();
        }
      };
      tx.oncomplete = () => resolve({ ...result, limitSeconds, limitCharacters });
      tx.onabort = () => reject(reason || new Error('利用量の記録に失敗しました。空き容量を確認してください。'));
    });
  } finally {
    db.close();
  }
}

export function getUsage() {
  return ledger();
}

function credentials(region, key) {
  if (typeof region !== 'string' || !/^[a-z][a-z0-9]{1,30}$/.test(region)
      || typeof key !== 'string' || !key.trim()) {
    throw new Error('設定でSpeechリソースの地域識別子（例 japaneast）とキーを入力してください。');
  }
}

/** Convert a selected slice of decoded 16 kHz audio to RIFF, mono PCM16 LE. */
export function pcmWave(buffer, start = 0, end = buffer.duration) {
  if (buffer.sampleRate !== sampleRate || !buffer.numberOfChannels) {
    throw new Error('音声を16 kHzで読み込めませんでした。');
  }
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end <= start || end > buffer.duration + 1 / sampleRate) {
    throw new Error('音声内の開始秒と終了秒を確認してください。');
  }
  const from = Math.round(start * sampleRate);
  const to = Math.min(buffer.length, Math.round(end * sampleRate));
  const count = to - from;
  if (count < 1 || count > 30 * sampleRate) {
    throw new Error('録音を聴き、30秒以内の区間とそこで読んだ原稿を指定してください。');
  }
  const bytes = new ArrayBuffer(44 + count * 2);
  const data = new DataView(bytes);
  const label = (offset, str) => {
    for (let i = 0; i < str.length; i++) data.setUint8(offset + i, str.charCodeAt(i));
  };
  label(0, 'RIFF');
  data.setUint32(4, 36 + count * 2, true);
  label(8, 'WAVE');
  label(12, 'fmt ');
  data.setUint32(16, 16, true);
  data.setUint16(20, 1, true);
  data.setUint16(22, 1, true);
  data.setUint32(24, sampleRate, true);
  data.setUint32(28, sampleRate * 2, true);
  data.setUint16(32, 2, true);
  data.setUint16(34, 16, true);
  label(36, 'data');
  data.setUint32(40, count * 2, true);
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, i) => buffer.getChannelData(i));
  for (let i = 0; i < count; i++) {
    let mix = 0;
    for (const channel of channels) mix += channel[from + i];
    const value = Math.max(-1, Math.min(1, mix / channels.length));
    data.setInt16(44 + i * 2, Math.round(value * (value < 0 ? 32768 : 32767)), true);
  }
  return { wav: new Blob([bytes], { type: 'audio/wav' }), start: from / sampleRate, end: to / sampleRate };
}

const decode = blob => readBrowserAudio(blob,sampleRate);

function score(n) {
  return typeof n === 'number' && n >= 0 && n <= 100 ? n : null;
}

function scoresOf(item) {
  return item?.PronunciationAssessment || item || {};
}

export function parseAssessment(payload) {
  if (!payload || payload.RecognitionStatus !== 'Success') {
    throw new Error('Azureが発話を認識できませんでした。区間内に声が入っているか再生して確認してください。');
  }
  const best = payload.NBest?.[0];
  const summary = scoresOf(best);
  const result = {
    provider: 'Azure', locale,
    pronunciation: score(summary.PronScore), accuracy: score(summary.AccuracyScore),
    fluency: score(summary.FluencyScore), completeness: score(summary.CompletenessScore),
    words: (Array.isArray(best?.Words) ? best.Words : []).filter(w => typeof w?.Word === 'string').map(w => ({
      word: w.Word,
      accuracy: score(scoresOf(w).AccuracyScore),
      errorType: typeof scoresOf(w).ErrorType === 'string' ? scoresOf(w).ErrorType : null,
      offsetSeconds: Number.isFinite(w.Offset) && w.Offset >= 0 ? w.Offset / 1e7 : null,
      durationSeconds: Number.isFinite(w.Duration) && w.Duration >= 0 ? w.Duration / 1e7 : null,
      phonemes: (Array.isArray(w.Phonemes) ? w.Phonemes : []).filter(Boolean).map(p => ({
        name: typeof p.Phoneme === 'string' && p.Phoneme.trim() ? p.Phoneme.trim() : null,
        accuracy: score(scoresOf(p).AccuracyScore)
      }))
    }))
  };
  if ([result.pronunciation, result.accuracy, result.fluency, result.completeness].every(n => n === null)
      && !result.words.some(w => w.accuracy !== null || w.errorType || w.phonemes.some(p => p.accuracy !== null))) {
    throw new Error('Azureの応答に発音評価がありません。リソース、地域、評価対象の原稿を確認してください。');
  }
  return result;
}

function readText(text) {
  if (typeof text !== 'string' || !text.trim()) throw new Error('該当区間で読んだ英文を入力してください。');
  const cleaned = text.trim();
  if (new TextEncoder().encode(cleaned).length > 3500) throw new Error('原稿を短い区間に分けてください。');
  return cleaned;
}

function b64Utf8(text) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(text)));
}

const httpMessages = {
  400: '原稿、区間または音声形式を確認してください。',
  401: 'Speechキーと地域の組み合わせをAzureポータルで確認してください。',
  403: 'リソースの種類、権限、ネットワーク設定、無料枠の残量を確認してください。',
  404: 'リソースの地域と機能の提供状況を確認してください。',
  413: '送信する音声区間または原稿を短くしてください。',
  415: '音声形式が拒否されました。WAVまたは別の録音でお試しください。',
  429: '利用枠・同時実行の制限またはサービス混雑です。Azureポータルを確認し、時間を置いてください。'
};

async function post(url, options, handle, clientFetch) {
  const controller = new AbortController();
  const stop = () => controller.abort();
  if (options.signal?.aborted) stop();
  options.signal?.addEventListener('abort', stop, { once: true });
  const timer = setTimeout(stop, 60000);
  try {
    let response;
    try {
      response = await clientFetch(url, { ...options, method: 'POST', mode: 'cors', cache: 'no-store',
        redirect: 'error', referrerPolicy: 'no-referrer', credentials: 'omit', signal: controller.signal });
    } catch {
      throw new Error(controller.signal.aborted
        ? '送信を中断しました。端末の利用量には予約分が残ります。'
        : 'Azureに接続できません。通信状態、地域、ブラウザのCORS制限を確認してください。');
    }
    if (!response.ok) throw new Error('Azure HTTP ' + response.status + '。' + (httpMessages[response.status] || 'サービスの状態を確認し、後でお試しください。'));
    return await handle(response);
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener('abort', stop);
  }
}

export async function assessRecording({ blob, start = 0, end, referenceText, region, key, signal },
    { decodeAudio = decode, reserve = ledger, clientFetch = fetch } = {}) {
  credentials(region, key);
  const text = readText(referenceText);
  const buffer = await decodeAudio(blob);
  const piece = pcmWave(buffer, start, end);
  const header = b64Utf8(JSON.stringify({
    ReferenceText: text, GradingSystem: 'HundredMark', Granularity: 'Phoneme',
    Dimension: 'Comprehensive', EnableMiscue: 'True'
  }));
  if (signal?.aborted) throw new Error('送信を中断しました。');
  await reserve('assessmentSeconds', Math.ceil(piece.end - piece.start));
  const url = 'https://' + region + '.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-GB&format=detailed';
  return post(url, { signal, headers: {
    'Ocp-Apim-Subscription-Key': key.trim(), 'Pronunciation-Assessment': header,
    'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000', Accept: 'application/json'
  }, body: piece.wav }, async response => {
    let payload;
    try { payload = await response.json(); }
    catch { throw new Error('採点結果を読み取れませんでした。通信状態を確認してください。'); }
    return { ...parseAssessment(payload), referenceText: text, start: piece.start, end: piece.end };
  }, clientFetch);
}
