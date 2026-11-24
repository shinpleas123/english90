import test from 'node:test';
import assert from 'node:assert/strict';
import { pcmWave, assessRecording, parseAssessment, nextUsage, includeLegacyUsage } from '../lib/speech.mjs';

function audio(duration = 2, channels = 1) {
  const length = Math.round(duration * 16000);
  const samples = Array.from({ length: channels }, (_, c) => new Float32Array(length).fill(c ? -1 : 0.5));
  return { duration, length, sampleRate: 16000, numberOfChannels: channels, getChannelData: i => samples[i] };
}

// Artificial protocol fixtures. Values test parsing only.
const responseBody = { RecognitionStatus: 'Success', NBest: [{ AccuracyScore: 0, FluencyScore: 57,
  Words: [{ Word: 'Thursday', Offset: 5000000, Duration: 1000000, AccuracyScore: 22, ErrorType: 'Mispronunciation',
    Phonemes: [{ AccuracyScore: 22 }, { AccuracyScore: 42 }] },
  { Word: 'report', ErrorType: 'Omission' }] }] };
const request = { blob: new Blob(), region: 'japaneast', key: 'test-only', referenceText: 'Thursday’s report.' };

test('REST fields preserve omissions, observed zeroes, missing scores and unnamed en-GB phonemes', () => {
  const res = parseAssessment(responseBody);
  assert.equal(res.pronunciation, null);
  assert.equal(res.accuracy, 0);
  assert.equal(res.completeness, null);
  assert.equal(res.fluency, 57);
  assert.deepEqual(res.words[0].phonemes, [{ name: null, accuracy: 22 }, { name: null, accuracy: 42 }]);
  assert.equal(res.words[0].offsetSeconds, 0.5);
  assert.equal(res.words[0].durationSeconds, 0.1);
  assert.equal(res.words[1].errorType, 'Omission');
  assert.equal(res.words[1].accuracy, null);
  assert.equal('prosody' in res, false);
});

test('recognition alone and invalid values never become a pronunciation diagnosis', () => {
  for (const value of [null, {}, { RecognitionStatus: 'NoMatch' },
    { RecognitionStatus: 'Success', NBest: [{ Confidence: 1, Words: [{ Word: 'report' }] }] },
    { RecognitionStatus: 'Success', NBest: [{ AccuracyScore: 110, FluencyScore: '98' }] }]) {
    assert.throws(() => parseAssessment(value));
  }
});

test('PCM slice is mono, 16 bit little-endian and 16 kHz; channels are averaged', async () => {
  const clip = pcmWave(audio(3, 2), 0.5, 1.5);
  const bytes = new DataView(await clip.wav.arrayBuffer());
  assert.equal(bytes.byteLength, 32044);
  assert.equal(bytes.getUint16(22, true), 1);
  assert.equal(bytes.getUint32(24, true), 16000);
  assert.equal(bytes.getUint16(34, true), 16);
  assert.equal(bytes.getInt16(44, true), -8192);
});

test('a long recording requires an explicit valid range', () => {
  const longer = audio(42);
  assert.throws(() => pcmWave(longer), /30秒/);
  assert.throws(() => pcmWave(longer, 15, 50), /開始秒/);
  assert.throws(() => pcmWave(longer, NaN, 10));
  assert.throws(() => pcmWave(longer, 1, 1));
  assert.throws(() => pcmWave(longer, 0, 30.01));
  assert.equal(pcmWave(longer, 12, 42).wav.size, 44 + 30 * 32000);
});

test('long file sends just the confirmed PCM slice and its matching Unicode reference', async () => {
  const calls = [];
  const result = await assessRecording({ ...request, start: 31, end: 33.25 }, {
    decodeAudio: async () => audio(45),
    reserve: async (kind, amount) => { calls.push(['reserve', kind, amount]); },
    clientFetch: async (url, opts) => {
      calls.push(['fetch']);
      assert.equal(new URL(url).hostname, 'japaneast.stt.speech.microsoft.com');
      assert.equal(new URL(url).searchParams.get('language'), 'en-GB');
      assert.equal(opts.redirect, 'error');
      assert.equal(opts.credentials, 'omit');
      assert.equal(opts.body.size, 44 + 2.25 * 32000);
      const header = JSON.parse(Buffer.from(opts.headers['Pronunciation-Assessment'], 'base64').toString('utf8'));
      assert.equal(header.ReferenceText, request.referenceText);
      assert.equal(header.EnableMiscue, 'True');
      assert.equal(header.Granularity, 'Phoneme');
      assert.equal('EnableProsodyAssessment' in header, false);
      return Response.json(responseBody);
    }
  });
  assert.deepEqual(calls, [['reserve', 'assessmentSeconds', 3], ['fetch']]);
  assert.equal(result.referenceText, request.referenceText);
  assert.equal(result.start, 31);
  assert.equal(result.end, 33.25);
});

test('budget denial stops before fetch; malformed inputs stop before reservation', async () => {
  let sent = 0;
  let reserved = 0;
  const deps = { decodeAudio: async () => audio(), reserve: async () => { reserved++; throw Error('budget'); },
    clientFetch: async () => { sent++; } };
  await assert.rejects(assessRecording(request, deps), /budget/);
  await assert.rejects(assessRecording({ ...request, region: 'host.invalid/path' }, deps), /地域/);
  await assert.rejects(assessRecording({ ...request, referenceText: '' }, deps), /英文/);
  await assert.rejects(assessRecording({ ...request, end: 31 }, deps), /終了秒/);
  assert.equal(reserved, 1);
  assert.equal(sent, 0);
});

test('HTTP errors, invalid JSON, failed recognition and offline fetch do not retry', async () => {
  const cases = [
    [() => new Response(null, { status: 401 }), /401.*キー/],
    [() => new Response(null, { status: 403 }), /403.*権限/],
    [() => new Response(null, { status: 429 }), /429.*利用枠/],
    [() => new Response(null, { status: 503 }), /503.*サービス/],
    [() => new Response('bad json'), /採点結果/],
    [() => Response.json({ RecognitionStatus: 'InitialSilenceTimeout' }), /発話/],
    [() => { throw new TypeError('Failed to fetch'); }, /CORS/]
  ];
  for (const [respond, error] of cases) {
    let reservations = 0;
    let uploads = 0;
    await assert.rejects(assessRecording(request, {
      decodeAudio: async () => audio(), reserve: async () => { reservations++; },
      clientFetch: async () => { uploads++; return respond(); }
    }), error);
    assert.equal(reservations, 1);
    assert.equal(uploads, 1);
  }
});

test('speech recognition and assessment share a cap; TTS budget remains independent', () => {
  const before = { month: '2026-11', assessmentSeconds: 10000, recognitionSeconds: 4399, ttsCharacters: 399999 };
  assert.equal(nextUsage(before, 'assessmentSeconds', 1).assessmentSeconds, 10001);
  assert.throws(() => nextUsage(before, 'assessmentSeconds', 2), /上限/);
  assert.throws(() => nextUsage(before, 'recognitionSeconds', 2), /上限/);
  assert.equal(nextUsage(before, 'ttsCharacters', 1).ttsCharacters, 400000);
  assert.throws(() => nextUsage(before, 'ttsCharacters', 2), /上限/);
  for (const n of [0, -1, 0.2, Infinity, NaN]) assert.throws(() => nextUsage(before, 'assessmentSeconds', n));
  assert.throws(() => nextUsage({ ...before, assessmentSeconds: 'error' }, 'assessmentSeconds', 1), /記録/);
  assert.equal(before.assessmentSeconds, 10000);
});

test('legacy localStorage seconds are rounded up and subsequent imports only add new usage', () => {
  let usage = includeLegacyUsage({ month: '2026-11', assessmentSeconds: 0, recognitionSeconds: 0, ttsCharacters: 0 }, 8.2);
  usage = nextUsage(usage, 'assessmentSeconds', 3);
  assert.equal(includeLegacyUsage(usage, 8.2).assessmentSeconds, 12);
  usage = includeLegacyUsage(usage, 10.1);
  assert.equal(usage.assessmentSeconds, 14);
  assert.equal(includeLegacyUsage(usage, 0).assessmentSeconds, 14);
  assert.throws(() => includeLegacyUsage(usage, 'invalid'), /旧版/);
});
