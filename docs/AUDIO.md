# 英国英語の教材音声
日別の教材MP3は本アプリの自作英文を英国英語で合成したものです。Piper の en_GB-northern_english_male-medium で各チャンクを読み上げ、短い間を挟んで連結し、22,050 Hz・モノラル・48 kbps MP3に変換しました。モデル・訓練データは配布しません。[モデルカード](https://huggingface.co/rhasspy/piper-voices/blob/main/en/en_GB/northern_english_male/medium/MODEL_CARD)

モデルの訓練データは **Crowdsourced high-quality UK and Ireland English Dialect speech data set**（SLR83）、© 2018, 2019 Google, Inc. です。原データのライセンスは CC BY-SA 4.0。教材MP3も同じライセンスで提供します。再配布・改変時にはクレジット、ライセンス、変更の表示を保持してください。[OpenSLR 83](https://www.openslr.org/83/) ・ [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)

Isin Demirsahin, Oddur Kjartansson, Alexander Gutkin, Clara Rivera (2020). *Open-source Multi-speaker Corpora of the English Accents in the British Isles*. [LREC 2020](https://aclanthology.org/2020.lrec-1.804/)

## 再生成
通常の学習にはモデルは不要です。使用したモデル本体のSHA-256は `41199d55776c142c151e018cf77bea80ca5f01b7b834f81cd781df5b751bf2fb`。本体と対応する .onnx.json を並べ、Pythonの piper-tts 1.8.0、onnxruntime 1.32.0、lameenc 1.9.0 で生成しました。

```sh
python tools/render_narration.py path/to/en_GB-northern_english_male-medium.onnx
npm run build:offline
```

区間の境界は合成したPCMのサンプル数から計算します。MP3の遅延やブラウザのイベント粒度により、チャンク端にはわずかな再生時差が生じます。モデルの聞こえ方も地域や話者の一例です。
