# 英国英語の発音評価と無料運用

仕様・料金・利用条件の確認日 2026年11月24日。音読に対する Azure Speech Pronunciation Assessment は任意。音読原稿と利用者が選んだ録音区間だけを、採点の操作時に Microsoft の指定地域へ送る。日々の教材、復習、録音、音響分析はサービスが停止しても使える。

## 採点する範囲

| 項目 | en-GBでの扱い |
| --- | --- |
| 音読の全体・語別 | HundredMark、Phoneme、Comprehensive を指定。APIが返した Accuracy、Fluency、Completeness、PronScore と語別 Accuracy を表示できる。実際に送った区間が対象。 |
| 読み落とし | 短音声で EnableMiscue を有効にし、返された Omission / Insertion を記録する。雑音、原稿とのずれ、認識誤りの可能性があり、録音で確かめる。 |
| 音素 | en-GB では音素ごとの精度が提供される場合がある。Microsoft の表で IPA の音素名は en-US、SAPI の音素名は en-US と zh-CN。匿名の要素には名前を補わず、返却順と数値まで扱う。正解例の辞書IPAを測定結果に転記しない。 |
| Prosody / 強勢・音節 | Azure Prosody は en-US のみ。en-GB に Prosody を要求しない。音量やF0の推定値を英国アクセントの採点に使わない。 |
| 欠測 | 返らなかった値は null。ゼロは観測値として保持する。普通の文字起こしだけの応答、無音、異常なスコアは診断結果にしない。 |

参照文付き評価とサービスの出力項目を確認した。比較するときは原稿・使用区間・言語・採点方式を合わせる。この得点は音読に対するサービスの尺度であり、VERSANTや実際の聞き手による理解度との換算はできない。[言語対応](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=pronunciation-assessment)・[評価とロケール別機能](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-pronunciation-assessment)・[地域対応](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/regions)

## 長い録音と REST

1. マイク録音または端末内の音声ファイルを Web Audio でデコードする。M4A、MP3、WAVなど、実際に対応するコーデックはOS・ブラウザによる。
2. 30秒を超える録音は全文を保持し、再生で区切りを確認する。1回につき読み始めから読み終わりまでの30秒以内の範囲と、そこで読んだ英文を指定する。複数文を含むときは節・文の切れ目で分け、続く範囲も同様に採点する。
3. 選択区間を 16 kHz・モノラル・16 bit PCM WAV に変換する。原稿を UTF-8 / Base64 ヘッダーに入れて en-GB の地域エンドポイントへ送信する。APIの語の時間は区間先頭からの相対秒。元録音内の位置は開始秒を加算する。
4. 各結果に開始・終了秒と使用原稿を残す。区間結果から長い録音全体に対する Microsoft の流暢性や総合点を生成しない。

短音声 REST の採点上限は30秒。連続 SDK では長い録音を一括処理できるが EnableMiscue が使えず、読み落としには別の照合処理が必要になる。本実装では区間と原稿の対応を本人が確認する。機械的に等分した音声に全文を送る方法は採用しない。[短音声REST](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/rest-speech-to-text-short)・[認識エンドポイントの地域形式](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/get-started-speech-to-text?pivots=programming-language-rest)・[連続認識の制約](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-pronunciation-assessment)

## 費用と端末の自主上限

| 種別 | Microsoft 公表の F0 枠 | このアプリ |
| --- | --- | --- |
| リアルタイム認識・基本発音評価 | Standard / Custom のリアルタイム認識は共有で5音声時間／月。基本発音評価はSTT相当。他の有料追加評価は要求しない。 | 採点と将来の一般認識を合わせて4時間／端末・暦月。現在は発音採点のみ送信する。 |
| 標準ニューラル音声合成 | 50万文字／月 | Azure合成への送信は0文字。端末のお手本音声・本人が利用権を持つ音源を使う。 |

F0は継続提供される料金階層で、期間限定クレジットを前提としない。料金表と割当は変更され得る。本人が Speech リソースを作成した場合だけ、Azure Portal で価格レベルが **Free F0** であることを確認し、地域とキーを設定する。F0が作れない場合はクラウド採点を使わずに学習できる。アプリはAzureのリソース作成、階層変更、請求先操作に必要な権限を持たない。キーだけから価格レベルは検証できず、S0のキーを登録するとAzure側で課金され得る。[公式料金](https://azure.microsoft.com/en-us/pricing/details/speech/)・[F0 の割当](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-services-quotas-and-limits)・[無料サービス一覧](https://azure.microsoft.com/en-us/pricing/free-services/)

同一ブラウザの同一オリジンでは、IndexedDB の単一 readwrite トランザクションで照合・秒単位の切り上げ予約・保存を行ってから音声を送る。複数タブの同時送信でも上限判定を直列化する。旧版の同月 e90budget は小数秒を切り上げて引き継ぐ。旧版が後で増えたときも差分だけ加える。エラー、タイムアウト、利用者による中断後も送信済みの可能性を考え予約は戻さない。自動再試行は行わず、手動で再試行した場合に再度予約する。

端末時計、月境界、旧版との同時操作、他アプリ・別端末・別ブラウザ・プライベートモード・サイトデータの削除で実使用量とずれ得る。端末計をAzure側の上限保証や請求額の測定に使うことはできない。F0を維持し、複数端末で同一リソースを使う際はポータルのメトリクスを確認する。[Speechリソースの監視](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/monitor-speech-service)

## お手本と代替方式

| 方法 | 用途と選択理由 |
| --- | --- |
| 端末の英国音声 | OSに搭載または追加済みの en-GB 音声を再生。声・品質・速度範囲は端末差がある。ブラウザの読み上げAPIは再生PCMを返さないため、その音声のピッチ曲線は生成できない。比較には利用権のある実音源が必要。 |
| Azureのニューラル合成 | 高品質な en-GB-SoniaNeural などがある。料金面の無料枠と、生成音声の利用・配布権は別の条件。Product Termsの既製ニューラル音声の出力利用権に関する記載は有料階層が対象。F0生成音声をリポジトリで再配布する構成、保存済みモデル音声を必要とする構成は採用しない。 |
| Vosk / whisper.cpp | ローカルでの音声認識・文字起こしに有用。モデルの取得、メモリ、処理時間が必要で、文字認識結果だけでは英国式の語別・音素別発音評価にならない。実行時のダウンロードも不要にするため同梱しない。 |
| 人による確認 | 音読・自由発話の録音、Camblyなどの聞き手による聞き返しの記録、同条件での聴き比べ。サービスから音素を特定できない場合でも利用できる。 |

[Azure音声一覧](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts)・[Microsoft Product Terms の Text-to-Speech Services](https://www.microsoft.com/licensing/terms/productoffering/MicrosoftAzure/MCA)・[Web Speech API](https://webaudio.github.io/web-speech-api/)・[Vosk](https://alphacephei.com/vosk/)・[whisper.cpp WASM](https://github.com/ggml-org/whisper.cpp/blob/master/examples/whisper.wasm/README.md)

## セキュリティと送信確認

本人の端末・本人の Azure 契約用。音声、原稿、リソースキーが Microsoft の地域ホストへ送信される。ブラウザの開発ツール、同一オリジン上の他のページ・スクリプト、端末にアクセスできる者からクライアント側のキーを完全には秘匿できない。リソースに合う地域識別子を検証し、送信先のドメインとパスを固定する。キーや生の応答をURLやログに残さずリダイレクトを拒否する。公開リポジトリにはキーと録音を置かない。

事業者が利用者全員の採点を提供する場合は、鍵をサーバーに置いて本人認証・短命トークン・サービス側の利用制限を組み合わせる必要が生じる。匿名のトークン配布では共有キーを隠すだけで第三者の枠消費を防げない。今回は本人のF0のみを使うため、新規サーバー運用や他者の音声集約を避けた。Microsoft はリアルタイム認識の既定処理と任意ログについて個別に説明している。アプリは音声ログ機能を要求しない。[データの処理](https://learn.microsoft.com/en-us/azure/ai-foundry/responsible-ai/speech-service/speech-to-text/data-privacy-security)・[音声ログの設定](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/logging-audio-transcription)

2026-11-24 12:31:09 UTC、japaneast の上記 REST パスに Pages origin を指定した OPTIONS を送り HTTP 204 を確認。POST、Origin *、content-type、ocp-apim-subscription-key、pronunciation-assessment が許可された。キーも音声も送信していない。この確認は CORS の事前要求に限られる。本人の F0 キーでの認証・実録音の採点は未検証。

## 実機での確認

1. iOS Safari / Android Chrome で本人のF0と地域を設定し、短い自作英文を録音する。採点前に原稿と送信先を確認する。
2. 表示された Azure の項目を記録する。語の挿入・脱落を含むテイクと照合し、匿名音素を推測していないことを確認する。採点の良否は実録音と聞き手の判断でも確かめる。
3. 30秒超の録音から異なる2区間を採点し、各結果の参照文・時間範囲を確認する。端末の一日分の送信時間とAzure側メトリクスを見比べる。
4. 401 は地域とキー、403 はリソース・権限・枠、429 は同時実行・割当・混雑、接続失敗はオフラインやCORSを確認する。音声と原稿の再送は本人の操作で行う。
