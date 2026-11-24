// Original practice scenarios. Organisations, figures and events in the lessons are fictional.
// Each line of the script is a playable thought group. Punctuation survives joining the groups.
export const baseline = 'The Bank of England has warned that economic growth could remain weaker than expected over the coming months. Although inflation has fallen significantly, households across the country continue to face considerable financial pressure. Experts believe that further changes in interest rates will depend largely on developments in the labour market and the wider global economy.';

const rows = [];
function add(title, focus, target, cue, script, question, correct, distractor1, distractor2, prompt) {
  const day = rows.length + 1;
  const chunks = script.split(' | ');
  const options = [distractor1, distractor2];
  const answer = (day + Math.floor(day / 3)) % 3;
  options.splice(answer, 0, correct);
  rows.push({
    day, phase: day <= 30 ? 'Foundation' : day <= 60 ? 'Naturalisation' : 'Business Application',
    title, focus, target, cue, chunks, script: chunks.join(' '), question, options, answer, prompt
  });
}

add('引き継ぎの遅れを聞き分ける', '診断用に、普段の音読と即興説明を残す', 'work',
  'work /wɜːk/ は唇を丸めて始め、母音の後に独立した r の音を足さない。water と work の最初の唇を鏡で比べる。',
  'The morning handover was delayed | because the overnight team had to check a change in the file layout. | The figures themselves were sound. | Work resumed as soon as the column headings were confirmed.',
  '作業を再開できたきっかけは何ですか。','列見出しを確認できた','数値を再計算した','夜勤担当が戻った',
  '引き継ぎが遅れた理由と、引き継いだ同僚が最初に確認すべきことを、自分の言葉で説明する。');
add('支店に届いた二つの依頼', '短い /ɪ/ と長い /iː/ を語の意味と結ぶ', 'sheet',
  'sheep /ʃiːp/ と ship /ʃɪp/ を交互に言い、同じ語末で母音の質と長さを比べる。次に sheep の母音を sheet /ʃiːt/ に移して本文の句を読む。',
  'The branch asked for a clean sheet of figures | before it would sign off the change. | A colleague offered to split the file, | but that would have left the totals in two places.',
  'ファイルを分ける案にはどんな欠点がありますか。','合計が二か所に分かれる','承認者が増える','元の数値が消える',
  '分割と一枚への集約のどちらを提案するか、誤読のリスクを一つ添えて支店に伝える。');
add('列車の行き先を確認する', '短い /ʊ/ と /uː/ の違いを保つ', 'full',
  'full /fʊl/ と fool /fuːl/ を交互に言う。full では舌と唇を少し緩め、次の /l/ へ移る。',
  'The first train was already full, | so the platform staff suggested the following service. | It was due six minutes later | and would stop at the same station on the other side of the river.',
  '次の列車を選んでもよい理由は何ですか。','同じ駅に停車する','指定席がある','乗り換えが少ない',
  '急ぐ同僚に、今の列車を見送る選択を説明し、到着への影響を推測と事実に分けて話す。');
add('バックアップの範囲を確認する', '/æ/ と /ʌ/ を区別する', 'back',
  'back /bæk/ は口を縦に開き舌を前寄りにする。back と buck /bʌk/ を交互に言い、どちらを録ったか翌日聞く。',
  'We can go back to the copy made on Monday, | but it only includes active accounts. | To rebuild the closed accounts as well, | we shall need the separate archive from last month.',
  '月曜日のコピーだけで戻せるものは何ですか。','利用中の口座','解約済みの口座','前月のアーカイブ全体',
  '復旧の順序を二案示し、どちらを先に試すかを理由付きで提案する。');
add('四半期末の短い説明', '英国英語の非R音性と語の境界を意識する', 'quarter',
  'quarter /ˈkwɔːtə/ を単独で言い、次に quarter ends と quarter starts を言う。採用する非R音性のモデルでは、後続母音があると語末の r がつながり得る。',
  'This quarter ends on a Saturday. | The reporting team will take a snapshot on Friday evening, | then include weekend adjustments in a separate note. | The publication date itself has stayed the same.',
  '週末の修正はどこに載りますか。','別の注記','金曜のスナップショット','公開日変更の通知',
  '取引先に、対象日、補足情報、公開日の順で手短に説明する。');
add('支払い期限を訂正する', '二重母音 /eɪ/ を一つの音節に収める', 'late',
  'late /leɪt/ と let /let/ を対比する。late の母音は開き気味の位置から狭める。二つの拍に分断しない。',
  'A late payment has appeared on the screen, | although the customer sent the money on Tuesday. | The delay arose when the reference was matched, | so the branch has asked for the fee to be reviewed.',
  '遅れが生じたのはどの段階ですか。','参照番号の照合','顧客からの送金','支店での料金承認',
  '顧客に確認済みの事実と、支店の回答を待つ事項を分けて伝える。');
add('週報の増加と減少', '週次録音で /ɡr/ と語末 /θ/ を確認する', 'growth',
  'growth /ɡrəʊθ/ の語頭で母音を挟まず、語末は舌先を歯の間に軽く出し息を通す。grow と growth の末尾を聴き比べる。',
  'The weekly report shows growth in online enquiries, | while calls to the branch have declined. | The team suspects that customers are switching channels, | but it has not yet checked whether the same people used both services.',
  'まだ確かめていないことは何ですか。','同じ人が両方の手段を使ったか','電話が減ったか','オンラインの問い合わせが増えたか',
  '数値から言えることと、追加で確認すべき仮説を明確に分けて週報を口頭でまとめる。');
add('木曜の会議を調整する', '/θ/ と /s/ を区別する', 'Thursday',
  'Thursday /ˈθɜːzdeɪ/ の語頭は舌先を歯に軽く当てて無声の息を流す。thin /θɪn/ と sin /sɪn/ を比べてから曜日を文に戻す。',
  'Thursday would suit the audit team, | provided the papers arrive by Wednesday lunchtime. | If the figures come in later, | the chair would prefer a short call on Friday to a meeting without evidence.',
  '木曜日に会うための条件は何ですか。','水曜の昼までに資料が届く','金曜の電話を取り消す','木曜朝に議長が数字を出す',
  '水曜午後にしか資料が届かない設定で、参加者に代替の日時と理由を伝える。');
add('先方の数字を引用する', '/ð/ に声を乗せ、/d/ と識別する', 'their',
  'their /ðeə/ をゆっくり始め、舌先と歯の間の摩擦に声を伴わせる。they と day を交互に録る。',
  'Their estimate covers the larger sites only. | Our figure also includes small offices, | which explains most of the gap. | Both teams will use the same list of sites in the next comparison.',
  '二つの試算が異なる主な理由は何ですか。','対象拠点の範囲','比較した通貨','集計した月の違い',
  '先方を責めずに差の理由を説明し、次の比較の条件を合意する。');
add('照合前のバージョン管理', '/v/ と /b/ の作り方を区別する', 'version',
  'version /ˈvɜːʃən/ は下唇に上の歯を軽く触れさせ、声と摩擦を同時に出す。vest /vest/ と best /best/ で開始音を比べる。',
  'A revised version of the file is available, | but the reviewer is still checking yesterday’s copy. | Please send the new link directly to her | and ask her to confirm the time shown in the header.',
  '確認してもらう箇所はどこですか。','ヘッダーの時刻','ファイル末尾の合計','昨日送ったメールの件名',
  '古い版を見ている同僚に、最新版の見分け方と次の確認を簡潔に依頼する。');
add('貸出残高の説明', '/l/ と英語の /r/ を語頭で作り分ける', 'loan',
  'loan /ləʊn/ は舌先を上の歯茎に触れさせて始める。light /laɪt/ と right /raɪt/ で最初の接触を確認する。',
  'The loan balance fell in the final week, | partly because a single large borrower repaid early. | That makes the month look quieter than it felt, | especially for staff handling smaller applications.',
  '月末の残高が減った要因は何ですか。','大口借り手の早期返済','小口申込の全面停止','月末の金利変更',
  '残高だけでは支店の忙しさが見えない理由を、新任マネジャー向けに説明する。');
add('集計対象の家計を数える', '語末の子音連続を保つ', 'households',
  'households /ˈhaʊshəʊldz/ は最後の /ldz/ の後に母音を足さない。hold、holds、households の順に語末を録って比べる。',
  'The survey counted households rather than individuals. | Two adults sharing one address could therefore appear as a single response. | That distinction matters when the headline is used to estimate how many people needed support.',
  '見出しから人数をそのまま推定できない理由は何ですか。','回答単位が世帯だから','未成年だけが回答したから','住所を記録しなかったから',
  '回答数と人数の違いを、二人暮らしの具体例を使って説明する。');
add('顧客の依頼件数を検算する', '複数形の /s/・/z/・/ɪz/ を聞き分ける', 'requests',
  'requests の末尾は /sts/。checks、files、changes の語末を聞き、無声・有声・母音付きの三群に分類する。',
  'We received fewer requests, | but each one involved more checks and changes than usual. | Counting cases alone would therefore understate the pressure on staff | during the first week of the trial.',
  '件数だけでは見落とす変化は何ですか。','一件に必要な確認や修正が増えた','担当拠点が減った','試行期間が延びた',
  'チームの負荷をどう測るか、件数に加えてもう一つの指標を提案する。');
add('修正時点を正確に伝える', '過去形語尾の聞き落としを週次点検する', 'checked',
  'checked /tʃekt/、changed /tʃeɪndʒd/、added /ˈædɪd/ を一組ずつ録る。checked に余分な一音節を足していないかを聴く。',
  'The analyst checked the date, changed the label | and added a note to the record. | She left the original value in place | so that a reviewer could follow exactly what had happened.',
  '元の値を残した目的は何ですか。','後から変更の経緯を追えるようにする','新しいラベルを使わないようにする','日付の確認を先送りする',
  '三つの作業を過去形で報告し、意図的に維持した項目を一文添える。');
add('支出分類の強勢を探す', '長い語の主強勢を一つ決める', 'expenditure',
  'expenditure /ɪkˈspendɪtʃə/ は SPEN を核にして一語にまとめる。音量を一律に上げず、主強勢の長さと母音の明瞭さを聴く。',
  'Travel expenditure looks unusually high this month | because the conference was paid for in advance. | The event will take place next quarter, | when several teams are expected to share the cost.',
  '今月の支出が大きく見える理由は何ですか。','会議費を前払いした','会議が二回に増えた','全チームが今月精算を終えた',
  '費用の支払月とイベント月の違いを、予算担当者に説明する。');
add('分析担当の説明を取り次ぐ', '語形で移る主強勢を追う', 'analysis',
  'ANalyst と aNALysis と anaLYTical の強勢を手拍子一回で示す。analysis を本文で読む時にも同じ音節を核にする。',
  'The analyst has finished her analysis of the queue. | Her main finding is that simple cases wait behind complex ones. | She has suggested a separate route for routine requests | before any extra staff are hired.',
  '採用の前に提案した変更は何ですか。','定型案件を別ルートにする','複雑な案件を廃止する','全案件を同じ順番で処理する',
  '人員増の前に処理順を変えて試す意義を、analyst と analysis を用いて説明する。');
add('録音と記録の違いを伝える', '名詞と動詞の record を強勢で区別する', 'record',
  'a REcord と to reCORD の強勢位置を入れ替えて言う。一つの文で名詞と動詞を使い、録音を聞いて役割を特定する。',
  'Please record the reason for the change | before you close the case. | The record will be available to the complaints team, | who may need to explain the decision several months from now.',
  '案件を閉じる前に何を残す必要がありますか。','変更理由','数か月先の回答','苦情処理班の承認時刻',
  '誰が後日その記録を使うかを想定し、記録欄に何を書いてほしいか伝える。');
add('監査の前置詞を聞き取る', '機能語 to の弱形 /tə/ を文中で扱う', 'to review',
  'to review を /tə/ から滑らかにつなぐ。聞こえにくい to に強勢を戻した版も録り、情報の聞こえ方を比較する。',
  'We agreed to review the sample on Friday, | then to send our comments to the owner. | The aim is to settle the definition | before a second team starts collecting the same evidence.',
  '先に定義を確定したいのはなぜですか。','他チームによる証拠収集の重複を防ぐため','金曜日の会議を取り消すため','責任者を交代させるため',
  'review、send、settle を柱に作業予定を説明し、各動詞の前の to を自然につなげる。');
add('宛先と用途を聞き分ける', 'for の弱形 /fə/ と情報語の強勢を組み合わせる', 'for the board',
  'for the board では board を目立たせる。for を単独で言った版と、文の中で短く言う版を交互に聞く。',
  'The short summary is for the board, | while the working notes are for the project team. | Both draw on the same figures, | but only the notes explain how individual exceptions were handled.',
  '個別の例外処理について確認するにはどちらを使いますか。','プロジェクト用の作業メモ','取締役会用の要約','両方に同じ説明がある',
  '同じ資料の詳細版と要約版を誰に送るか、用途の違いが伝わるように説明する。');
add('二つの作業を一息で伝える', 'and の弱形と並列のリズムを作る', 'check and sign',
  'check and sign の二つの動詞を拍に置く。間の and を弱くした版を聞き、二つ目の動詞が明瞭か確認する。',
  'Please check and sign the change log | after you have seen the final extract. | A signature on the draft would suggest that the figures had already been approved, | which is precisely the confusion we want to avoid.',
  '下書きへの署名が招く誤解は何ですか。','数値が既に承認されたように見える','依頼が取り下げられたように見える','担当者が異動したように見える',
  '承認の正しい順番と、順番を逆にした場合の誤解を短く説明する。');
add('できることと制限を伝える', 'can と can’t の文脈・強勢・母音を週次確認する', 'can',
  '肯定の we can check の can を軽くし、否定の we can’t change の can’t を明瞭にする。聞き手が肯否を言い当てられるかで比較する。',
  'We can identify which accounts were affected, | but we cannot change the entries ourselves. | That step belongs to the payments team, | who will need a list of references before they can begin.',
  'このチームの権限でできることは何ですか。','影響口座を特定する','仕訳を自分で変更する','参照番号なしで支払班を動かす',
  '自分のチームの権限と他チームに依頼する行動を、一つずつ対比して伝える。');
add('数字の訂正を聞き逃さない', 'teen と ty の対比を主強勢と語末で示す', 'fifteen',
  'fifteen と fifty を単独で言い、訂正文では -teen の /n/ を残す。数を紙に書かずに聞き直して区別できるか試す。',
  'The original note said fifty cases were open. | The manager corrected that to fifteen | after removing duplicate entries. | The smaller number will appear in the pack, alongside a short explanation of the revision.',
  '最終資料に載せる件数はいくつですか。','15件','50件','65件',
  '会議でいったん誤った数を読み上げた設定で、訂正後の件数と修正理由を伝える。');
add('週と月を対比する', '訂正した語に文の核を置く', 'weekly',
  'weekly と monthly にそれぞれ核を置いて同じ文を録る。聞き返した時、何を訂正しているかを一語で書く。',
  'The feed arrives weekly, | although the dashboard groups the results by month. | A gap of three days can therefore be quite normal | and should not automatically trigger a call to the supplier.',
  '三日間更新がなくても通常の範囲なのはなぜですか。','配信頻度が週単位だから','月末だけ担当者がいるから','供給元が停止を予告したから',
  '配信頻度と表示単位を混同している同僚に、二つを対比して訂正する。');
add('長い条件をひと息ずつ区切る', '条件節と主節を意味単位で分ける', 'unless',
  'unless から始まる条件の終わりに短い切れ目を置く。the name のような一まとまりの内部に休止がないか聴く。',
  'Unless the name on the request matches the register, | the team will hold the payment for a manual check. | A mismatch does not prove that anything is wrong. | It simply means that further evidence is needed.',
  '名前が一致しない場合に行うことは何ですか。','支払いを保留して手動で確認する','不正として確定する','登録名を自動的に書き換える',
  '保留の条件と、保留が何を意味するかを、受け手が不安にならない表現で説明する。');
add('列挙の終わりを知らせる', '三項目の末尾の音調で列挙を閉じる', 'owner',
  'date、owner、decision を列挙し、最後の語で話を閉じる。初めの二語で終了したように聞こえないか録音を確認する。',
  'Every action needs a date, an owner and a decision. | The draft minutes include the first two, | but several rows still describe the discussion | without saying what anyone agreed to do.',
  '議事録に不足しているのは何ですか。','実行すると合意した内容','担当者の名前','日付',
  '担当者と期日だけがあるアクション項目を一つ想像し、完了が判定できる決定文を提案する。');
add('確認質問で聞き返す', '確かめたい情報を核にする', 'source',
  'Which source did you use? と The branch source? を別々に録る。疑問詞と確認したい固有の情報のどちらが目立つかを聞く。',
  'The total is lower than the number in my copy. | Which source did you use for the comparison? | If yours came straight from the branch system, | we may simply be looking at two different cut-off times.',
  '数字が違う理由として挙がった仮説は何ですか。','締め時刻が異なる','支店数が増えた','通貨換算を変更した',
  '相手に情報源と抽出時刻を尋ね、責める調子にならないよう確認質問を二つ組み立てる。');
add('地名と世界全体の区別', 'world の /ɜː/ と語末 /ld/ を一音節に収める', 'world',
  'world /wɜːld/ は唇を丸めて入り、母音の後に舌先を /l/ の位置へ移して /d/ で閉じる。word /wɜːd/ と交互に聞く。',
  'The map shows offices around the world, | but the pilot covers three cities in Britain. | Overseas colleagues may observe the trial, | although their figures will be excluded from the first set of results.',
  '海外拠点の数値は初回結果に入りますか。','見学はできるが数値は含まれない','見学した拠点だけ含まれる','英国拠点の数値と同じ扱いになる',
  '世界全体の地図と試行の対象範囲の違いを、海外支店からの質問に答える形で説明する。');
add('手数料の聞き間違いを防ぐ', 'free と three を週次録音で再点検する', 'three',
  'three /θriː/ と free /friː/ は舌と上歯か、下唇と上歯かを替える。three transfers と free transfers を聞き手が識別できるか試す。',
  'Three transfers are included in the monthly package. | Further transfers carry a small charge, | unless they are between the customer’s own accounts. | The leaflet gives an example of each type of payment.',
  '規定回数を超えても追加料金の対象外なのは何ですか。','本人の口座間の振替','同じ日に行う振替','窓口で依頼する振替すべて',
  '回数と例外が伝わるように、three と free を含む例を一つずつ作って案内する。');
add('受け渡し場所を指示する', '指示語と新情報の強勢を調整する', 'desk',
  'at the desk と at the side desk を聞き比べる。二つの窓口が対比される場合だけ side を特に明瞭にする。',
  'Please collect your pass at the side desk, | just beyond the main entrance. | The front desk can answer questions, | but it no longer holds visitor passes after the security arrangements changed.',
  '正面の窓口でできることは何ですか。','質問への対応','入館証の受け渡し','警備手順の変更承認',
  '初めて来る同僚に二つの窓口の役割を説明し、迷った場合の尋ね方も添える。');
add('月末の原因と対応を要約する', '30日目に母音・子音・強勢・弱形を再点検する', 'pressure',
  'pressure /ˈpreʃə/ の最初に核を置き、語末を軽くする。定点原稿から pressure を含むまとまりを一つ選び、初日の同じ箇所と聞き比べる。',
  'Pressure on the help desk eased after the new guide went out. | The fall was greatest among staff who had joined recently. | Experienced colleagues still raised complex questions, | suggesting that they needed a different kind of support.',
  '担当者が追加の支援を検討するなら、どの判断が報告に合いますか。','新任者に効果が見られた一方、経験者には複雑な質問向けの支援を試す','新任者は複雑な質問を続けたので、経験者用のガイドに切り替える','問い合わせ全体が減ったので、両方の層に同程度の効果があったと伝える',
  '全体傾向、層別の違い、次に確かめることの三点を、原稿を閉じて報告する。');

add('見出しから事実を拾う', '語末子音と次の母音をつなげる', 'pick up',
  'pick up の /k/ から次の母音へ直接移る。pick と up の間に別の母音や長い休止が入らないか聴く。',
  'New orders began to pick up in the final fortnight, | according to a small group of local manufacturers. | Several warned that shorter delivery times, rather than stronger demand, | might explain why more orders appeared in this month’s figures.',
  '受注が増えて見える別の説明は何ですか。','納期の短縮','調査対象の倍増','製品価格の下落',
  '地方ニュースの読者に、観測された変化と二つの解釈を混同しないよう伝える。');
add('予測と実績をつなぐ', '母音前の linking r を自然な速度で試す', 'later in',
  'later in と later this week を続けて録る。非R音性の英国モデルで、後ろに母音が来る箇所でのつながりを聴く。',
  'A revised forecast is expected later in the week. | For now, the committee will use the older estimate | and show a range around it. | That range reflects uncertainty about timing as well as uncertainty about the final amount.',
  '幅を持たせた表示に含まれる不確実性は何ですか。','金額と時期の両方','金額だけ','担当委員の人数だけ',
  '更新予測が来るまでの暫定表示について、later in the week を使って会議で説明する。');
add('選択肢の二択を明確にする', 'or の前後を滑らかにつなぐ', 'either',
  'either A or B の A と B に一つずつ拍を置く。or の後の情報が速く小さくなりすぎていないか確認する。',
  'We can either extend the review or narrow the sample. | The first option protects coverage but moves the deadline. | The second keeps the date, | although it leaves less evidence about smaller branches.',
  '調査対象を狭める場合の欠点は何ですか。','小規模支店に関する証拠が減る','締切が必ず遅れる','全支店の数値が消える',
  '相反する二案の内容と代償を説明し、自分ならどの点を重視するか述べる。');
add('暫定結果を断定せずに読む', 'might have の弱形を聞き取る', 'might have',
  'might have shifted を意味のまとまりで反復する。弱い have を書き取り、かつての可能性を表す形として聞き取れるか試す。',
  'The change might have shifted some applications into April, | even though customers submitted them in March. | Staff are checking the receipt dates | before deciding whether to amend the quarterly note.',
  '注記を修正する前に何を確認していますか。','申込の受付日','四月の人員数','顧客の年齢分布',
  '確定した事実を一文、過去についての仮説を一文、確認方法を一文で報告する。');
add('廃止予定の分岐を追う', 'used to と現在の動作を週次で聞き分ける', 'used to',
  'used to send をかたまりで聞き、今は変わったことを示す手掛かりを拾う。used the file も続けて言い、同じリズムにしない。',
  'The system used to send every exception to London. | It now sends only the larger cases there, | leaving the regional team to deal with the rest. | The new route should shorten the wait for customers with straightforward queries.',
  '現在ロンドンに送るのはどの案件ですか。','規模が大きい案件','すべての例外','地域チームで受け付けた定型照会',
  '旧運用と新運用の違いを説明し、待ち時間にどう影響する見込みか述べる。');
add('電話の聞き返しを予期する', 'would you の連続音を含む依頼を聞く', 'would you',
  'would と you を区切った版と、would you をつなぐ版を録る。融合する話者の音を聞くときも、would you の意味を復元する。',
  'Before we contact the supplier, would you check the account reference? | Two references differ by a single digit, | and both belong to active customers. | A quick check now could save us from sharing the wrong details.',
  '依頼が急がれる理由は何ですか。','一桁違いの有効な参照番号が二つある','供給元が番号を削除する','どちらの顧客も解約した',
  '電話で番号を一つ確認し、よく似た番号との混同を防ぐため相手に復唱を頼む。');
add('選ばれなかった指標を説明する', '文末の核で対比を聞かせる', 'median',
  '例文の mean と median を強くして二度読む。二度目は既に出た measure のような語を軽くし、対比が目立つか聴く。',
  'The mean waiting time rose after two exceptionally long cases. | The median barely moved, | so we have included both measures in the update. | Readers can then see what happened to the typical customer as well as to the tail.',
  '中央値の動きとして述べられたことは何ですか。','ほぼ変わらなかった','大きく上がった','計算不能になった',
  '同じ待ち時間を二種類の要約で伝える理由を、統計に詳しくない同僚に説明する。');
add('挿入句から本筋に戻る', '挿入句の前後で主文を保つ', 'remains',
  '挿入句を抜いて主文だけ読み、次に挿入句を軽く戻す。聞き手が主語と remains の対応を追える長さに休止を整える。',
  'The timetable, despite a delay in the survey, remains achievable. | The team has moved two interviews online | and booked a second room for the final workshop. | No change to the public launch date has been proposed.',
  '遅延を吸収するための対応はどれですか。','面談の一部をオンライン化し会場を追加した','公開日を延期した','調査を取りやめた',
  '主文に一つだけ挿入句を加えて進捗を伝え、続けて対応策を二点紹介する。');
add('変更の対象だけを限定する', 'only の位置と強勢で範囲を示す', 'only',
  'only the first file と the first file only を読み、何を限定しているか日本語で言う。file の前後を他の語から切り離しすぎない。',
  'Only the first file needs to be sent again. | The later files were checked against the new rule | and have already passed. | Sending the whole set would create duplicate entries in a queue that is nearly full.',
  '全件の再送を避ける理由は何ですか。','処理待ちに重複が生じる','二番目以降が未検査だから','新ルールが廃止されたから',
  '再送が必要な範囲を二文で指示し、誤って全件再送した場合の影響を添える。');
add('予定の後退幅を読む', 'from と to の両端に情報の山を作る', 'from June to July',
  'from June to July では月名をはっきりさせる。接続語を長くしすぎず、二つの月を順番どおりに書き取れるか試す。',
  'The first delivery has moved from June to July. | Installation can still begin on time, | as the engineers need the delayed units only for the second stage. | A further delay of a fortnight would change that assessment.',
  '現時点で据え付けを予定どおり開始できる理由は何ですか。','遅延品を使うのが第二段階だから','予備品を全て購入したから','技術者が六月以前に到着するから',
  '日程変更が影響する工程と、まだ影響しない工程を管理者に伝える。');
add('二つの留保を同時に伝える', '長い主語の後で一旦区切る', 'estimates',
  'Estimates から winter までを一まとまりに読み、動詞の前に短い境界を置く。主語の内部で語が途切れていないか聴く。',
  'Estimates based on last winter | may overstate demand this year. | The weather has been milder, and the service now costs more. | We cannot yet tell which of those factors has had the greater effect.',
  'まだ区別できていないものは何ですか。','天候と料金の影響の大きさ','昨冬の気温と今年の気温','利用料金を改定した日',
  '需要予測を低めに見る二つの理由を紹介し、原因の切り分けに必要なデータを一つ挙げる。');
add('譲歩の後の主張を聞き取る', 'although 節と主張を週次録音で区別する', 'although',
  'although 節の後で短く区切って主節に重心を移す。聞き手に一文で要約してもらう想定で、最後に残したい語を選ぶ。',
  'Although the sample was small, | it included every team that handles weekend payments. | The results tell us something about those teams, | but we should be careful about applying them to the rest of the bank.',
  '結果を慎重に一般化すべき理由は何ですか。','週末決済の担当チームに限られたから','週末決済の担当が全て抜けたから','全行から無作為に選んだから',
  '調査結果が役立つ範囲と範囲外を、although を用いて新任担当者に説明する。');
add('訂正速報の数字を維持する', '小数点前後をまとまりとして読む', 'point',
  'one point six と sixteen を交互に言う。point の後の six が語末まで聞こえ、数字が一つのまとまりになるか録音を確認する。',
  'An earlier bulletin gave the increase as sixteen per cent. | The correct figure is one point six per cent. | The underlying table was accurate. | The error arose when its figures were read aloud during the briefing.',
  '間違いが生じたのはいつですか。','説明会で数字を読み上げた時','原表を計算した時','調査を設計した時',
  '誤った速報を訂正する一分以内のアナウンスを作り、訂正前後の数字と誤りの範囲を伝える。');
add('要因を順に列挙する', '序列を作る語と内容語のバランスを取る', 'finally',
  'first、then、finally を手掛かりに三群に分ける。標識語だけが目立たないよう、各群の内容語にも一つ核を置く。',
  'First, the team removed closed cases. | It then combined entries from the same customer. | Finally, it checked the remaining records against the original forms. | Most of the reduction came from the second step.',
  '件数を最も減らした作業は何ですか。','同一顧客の記録をまとめた','終了案件を除いた','元の用紙と照合した',
  '作業の三段階を順番に説明し、結果に最も寄与した段階を明確にする。');
add('比較対象の入れ替わりを聞く', 'than と as の弱形を文脈で識別する', 'than',
  'higher than と as high as を短い句で交互に言う。比較対象までひと息で読み、何と比べたかをメモする。',
  'Demand was higher than last spring, | though not as high as the planning team had expected. | The service has attracted more regular users, | while the number of first-time visitors has remained almost unchanged.',
  '需要を予測値と比べるとどうですか。','予測を下回った','予測を上回った','予測と完全に同じだった',
  '過去実績との比較と、計画値との比較を別の文で述べ、両者が同時に成立する理由を説明する。');
add('欠測の意味を聞き分ける', 'negative と missing の対照を立てる', 'missing',
  'missing の最初の音節に核を置く。zero と missing を別の短文に置き、聞き手が区別に使える語をはっきりさせる。',
  'A blank cell indicates a missing return. | A recorded zero means the branch replied but had nothing to report. | Treating both as zero would make the figures look complete | while hiding which branches still owed us a response.',
  'ゼロを記録した支店の状態はどれですか。','回答済みで報告対象がない','未回答で督促を待っている','報告結果を削除した',
  '空欄とゼロを混同すると生じる解釈上の問題を、架空の二支店を例に説明する。');
add('部分否定を誤解せずに聞く', 'not all の範囲を意味のかたまりで示す', 'not all',
  'not all と none を別々の例文に入れ、not の後で長く途切れないようにする。含意を日本語で説明してから録音する。',
  'Not all of the complaints concerned late payments. | Several customers were unhappy with the wording of the letters, | even though their payments arrived on time. | The review will therefore include the letters as well as the payment process.',
  'レビュー対象に文面が含まれる理由は何ですか。','着金が定刻でも手紙に不満があった','全ての苦情が文面だけに関するものだった','遅延した支払いが一件もなかった',
  '「全件ではない」と「一件もない」を混同している相手に、反例を一つ挙げて説明する。');
add('ニュースの引用元を明示する', '報告動詞と引用内容の境界を示す', 'according',
  'according to the operator をひとまとまりとして軽く読み、重要な判断を次の群に置く。誰の見解か聞き手に再現してもらう想定で録る。',
  'According to the operator, the delay began after the morning inspection. | Passengers reported waiting outside the station well before then. | Both accounts could be accurate | if the first queue formed before the service was formally suspended.',
  '二つの説明が両立するのはどんな場合ですか。','正式な運休前に列ができていた','乗客全員が点検を行った','点検が中止されていた',
  '運行者と乗客それぞれの主張を、誰の証言か分かるように整理して伝える。');
add('丁寧な異論を聞き取る', '同意する部分と異論の核を週次点検する', 'however',
  '賛同の句と however の後を分けて録る。核は接続語よりも、実際の異論の内容を担う語に置く。',
  'I agree that the shorter form is easier to use. | My concern, however, is the missing space for a second address. | We could keep the shorter layout | and offer an additional field only when a customer needs it.',
  '提案した折衷案はどれですか。','必要なときだけ住所欄を追加する','元の長い書式に全面的に戻す','二つ目の住所を常に必須にする',
  '相手の案の利点を認め、一点だけ懸念を伝え、負担を減らす修正案を示す。');
add('優先順位を音声で伝える', '既知情報を弱め新情報を際立たせる', 'tonight',
  '同じ tonight を初出時と再言及時で録る。二文目では繰り返しよりも、新たに加わった担当や条件が聞こえるようにする。',
  'The file must leave tonight. | What matters now is who checks the final page before it goes. | The analyst has checked the totals, | but the chair still needs to approve the revised wording beneath them.',
  '残っている作業は何ですか。','議長による修正文面の承認','担当者による合計の計算','ファイルの送付日を決めること',
  '既に終えた確認を短く述べ、誰が何をすれば送付できるかに重心を置いて報告する。');
add('長い名詞句を組み立てる', '複合名詞を意味単位でまとめる', 'quality review',
  'review、quality review、quarterly data quality review の順に後ろから組み立てる。途中で息が切れる場合は句の前後で休む。',
  'The quarterly data quality review | will begin with the records that changed hands during the merger. | Those records passed through two reporting systems, | making it harder to trace an unexplained adjustment back to its source.',
  '統合時に担当が変わった記録を先に見る理由は何ですか。','二つのシステムを経て調整の追跡が難しい','その記録だけが公開済みだから','合併前のデータが全て消えたから',
  '長い会議名を自然に紹介し、優先対象と選定理由を原稿なしで補足する。');
add('例外条件を置き忘れない', 'except と unless の違いを区切りで示す', 'except',
  'except の後ろの範囲を一息に読む。最初は条件の手前に短い休止を置き、慣れたら文の流れを保って伝える。',
  'All teams should adopt the label on Monday, | except those still testing the older dashboard. | Those teams should wait until the test closes, | as a new label halfway through could make their two sets of results difficult to compare.',
  '旧画面をテスト中のチームはいつ新ラベルに移りますか。','試験が終わってから','月曜の開始前','二つの結果を破棄した直後',
  '基本ルールと一つの例外、例外を設ける理由を、該当者が判断できる順序で伝える。');
add('時系列を巻き戻して伝える', 'had already の弱形と過去の基準点を聞く', 'had already',
  'had already closed の had を短くつなぎ、already の強い音節を残す。二つの出来事を時間順に口頭で言い直す。',
  'By the time the second message arrived, | the branch had already closed the case. | Staff reopened it when they saw the attachment, | which contained evidence that had been missing from the first message.',
  '二通目が来た時点で案件はどの状態でしたか。','いったん終了していた','初めて受付中になった','まだ一通目を受け取っていなかった',
  '時系列を一度通常の順番で説明し、次に二通目の到着を起点として語り直す。');
add('質問を受けて言い直す', '言い換えの前後に自然な休止を置く', 'in other words',
  'in other words の後で短く区切り、難しい説明を短い言葉に直す。言い換えのほうが速くなりすぎないか聴く。',
  'The figure is cumulative. | In other words, it includes cases opened in earlier months that are still active. | A rise this month could reflect slower closures | even if the number of new cases has not changed.',
  '新規件数が同じでも数値が上がる理由は何ですか。','終了処理が以前より遅い','過去の案件を全て除外する','今月の数値だけで計算する',
  'cumulative を一度使い、すぐに平易な言い換えと具体例を続けて説明する。');
add('代替案の語尾まで届ける', '条件と帰結の抑揚を分ける', 'otherwise',
  '条件文と otherwise の文を交互に読む。後者の最後に重要な動詞があるので、声を小さくしすぎない。',
  'If the checks finish before noon, we can include the figures in today’s pack. | Otherwise, we should issue a short supplement tomorrow. | Publishing unchecked figures now would be harder to undo | than sending a clearly dated update later.',
  '確認が正午に間に合わない場合の案は何ですか。','翌日に日付入りの補足を出す','今日の資料に未確認値を載せる','数値を永久に取り下げる',
  '二つの締切シナリオを説明し、急いで公開する危険と遅らせる負担を比べる。');
add('短い速報を伝え直す', '週次評価で強勢と意味保持を同時に確認する', 'stable',
  'stable を含む最初の文の核を決め、後続の変更点に合わせて核を移す。聴き手が冒頭と結論の両方を要約できるか確認する。',
  'Overall service levels were stable, | but evening callers waited longer than morning callers. | The operator is moving two shifts later in the day | rather than increasing the total number of staff on duty.',
  '事業者が変更するのは何ですか。','二つの勤務枠の時間帯','全体の人員数','受け付ける問い合わせの種類',
  '速報を聞いた後に原稿を閉じ、全体・時間帯の差・運用変更を三文で再構成する。');
add('いったん保留する判断', '留保表現に合う音調を聴き比べる', 'at this stage',
  'at this stage を冒頭と文末に置く二通りを録る。結論を一時的な判断として伝えたいときに、どちらが自然か理由をメモする。',
  'At this stage, we have enough evidence to pause the rollout. | We do not yet know whether the fault affects every device. | A wider withdrawal would depend on the results of tests | using equipment from a second batch.',
  '全面的な引き上げを判断するために必要なのは何ですか。','別ロットの機器の試験結果','全利用者の承認','展開再開後の販売数',
  '暫定措置を明言し、追加の判断に必要な情報が一つ残っていることを説明する。');
add('人名なしで役割を紹介する', '同格の説明を挟んでも主文を保つ', 'reviewer',
  'the reviewer の後に役割説明を軽く挟み、主文の動詞へ戻る。初回は挿入を省略し、二回目に同じテンポで戻す。',
  'The reviewer, a colleague from outside the project, | asked to see the original instructions. | She wanted to establish whether the team had applied a poor rule correctly | or had applied a sound rule in the wrong way.',
  '査読者が区別しようとしたものは何ですか。','ルール自体の欠陥と適用方法の誤り','社内資料と公開資料','案件の受付日と終了日',
  '独立した確認者の立場を一言で紹介し、確認したい二つの可能性を説明する。');
add('話を遮られてから再開する', '短い再開フレーズで主張へ戻る', 'coming back',
  'coming back to the point を短くまとめ、次の主張に拍を残す。前置きだけが長く聞こえないよう録音を聴き直す。',
  'Coming back to the point about timing, | customers can see the transfer before the daily report is updated. | For a few hours both screens can be correct | even while they appear to show different balances.',
  '一時的に画面間の残高が違ってよい理由は何ですか。','振替表示と日次報告の更新時刻が異なる','片方が必ず誤っている','一方が別通貨で表示される',
  '途中で別の質問に答えた想定で本題に戻り、時刻差が解消するまでの確認方法を伝える。');
add('中間評価でニュースを要約する', '60日目に句境界・核強勢・初見転移を点検する', 'provisional',
  'provisional の主強勢を先に確かめ、provisional figures をまとめて読む。定点原稿と別の初見原稿を同じ条件で録る。',
  'Provisional figures suggest that demand has levelled off. | The conclusion is less certain in rural areas, | where several offices have yet to submit their returns. | A fuller picture should emerge when the final figures are published next week.',
  '会議で現時点の状況を一文で伝えるなら、どれが正確ですか。','全体は横ばいに見えるが、農村部は未提出分を含む来週の数字を待つ','農村部の数字はそろったが、都市部は未提出分を含む来週の数字を待つ','全体の横ばいは確定し、来週はその原因を調べた結果だけが出る',
  '45秒のニュース原稿を即興で作り、見出し、適用範囲の留保、次の公表予定を伝える。');

add('データ責任者を決める', '質問の焦点を owner と sign-off に分ける', 'owner',
  'Who is the owner? と Who can sign it off? を別々に録る。二つの問いが同じ意味に聞こえないよう、確認したい役割を際立たせる。',
  'The London office maintains the register, | but responsibility for approving a change sits with the business owner. | We need both names in the procedure, | particularly when the person who updates the record is covering for a colleague.',
  '変更を承認する役割は誰ですか。','業務上の責任者','台帳の入力担当者なら誰でも','ロンドンの全職員',
  '会議の冒頭で、台帳を更新する人と変更を承認する人を区別し、二者への依頼を一つずつ述べる。');
add('データの来歴を説明する', '工程を意味のまとまりに分けて追える速度にする', 'source system',
  'source system、staging table、final report の三つを、同じ速さの短い群で読む。工程の間に一拍だけ置く。',
  'A customer address moves from the source system into a staging table. | There, abbreviations are expanded before the address reaches the final report. | If the last line looks different, | first check whether the wording changed at that intermediate step.',
  '住所の略記を展開する場所はどこですか。','中間テーブル','最終報告の印刷時','元システムに登録する前',
  '住所データの流れを図なしで説明し、最終行が違う場合に最初に調べる工程を提案する。');
add('委員会で丁寧に割り込む', '週次評価で発言を取る句と本題を分ける', 'before we move on',
  'before we move on を短く言って間を置く。発言の中心である denominator の強い音節まで息を保つ。',
  'Before we move on, could we check the denominator? | The numerator includes all failed checks, | but the denominator appears to cover only overnight runs. | Until the populations match, the percentage could give the committee a misleading impression.',
  '率を解釈する前に解決すべき点は何ですか。','分子と分母の対象範囲が違う','夜間処理が全て失敗した','分子が空欄である',
  '議論が次へ移る直前に発言を取り、算出範囲の疑問と、解決まで留保したい判断を伝える。');
add('定義変更の影響を説明する', 'before と after の対比で系列の断絶を伝える', 'definition',
  'definition の強い音節を一つ選び、old definition と revised definition の区別が聞けるか録音で確認する。',
  'Under the revised definition, an account becomes inactive after six months without a transaction. | The previous threshold was twelve months. | A rise in inactive accounts may therefore reflect the shorter period | even if customers have not changed their behaviour.',
  '新定義だけでも非稼働口座が増え得る理由は何ですか。','判定期間が半分になった','顧客が必ず利用を止めた','取引を全て対象外にした',
  '役員に見かけの変化と実際の行動変化を説明し、どちらか確かめる比較を一つ提案する。');
add('障害発生の第一報を入れる', '確定・未確定・次報を別の三群にする', 'confirmed',
  'confirmed と investigating を対比して読む。未確定範囲まで断定に聞こえないよう、事実ごとに短く区切る。',
  'We have confirmed a delay in the morning feed. | We are still investigating whether any records were lost. | The dashboard will show yesterday’s position until the checks finish, | and we will issue a further update at half past eleven.',
  'どの事実が確認済みですか。','朝の配信が遅れた','記録が消失した','全件が復旧した',
  '架空の障害について、影響、未確認事項、次回連絡時刻を30秒で報告する。');
add('集計差を詰めすぎずに説明する', '概数と正確な数を言い分ける', 'approximately',
  'approximately と exactly を異なる数字の前で言う。長い副詞で息を使い切らずに数字を明瞭に伝える。',
  'Approximately two hundred records need a second look. | Exactly twelve have a reference that could belong to more than one customer. | The larger figure is a screening estimate, | while the smaller one counts cases already checked by hand.',
  '12件が表すものは何ですか。','手作業で参照先の曖昧さを確認した件数','未確認の全件の概数','既に二重請求された顧客数',
  '概算と精査済み件数を混同しないよう、口頭で重要度と次の調査手順を説明する。');
add('顧客情報の共有を調整する', '制約と代替案の語尾を明瞭にする', 'aggregated',
  'aggregated totals を一まとまりにする。代替物を表す totals と、許される用途を示す語を意識して録る。',
  'The research team has asked for customer-level dates. | For this exercise we can provide aggregated totals by week, | which should be enough to test the proposed chart. | If they need individual dates later, the purpose will need a separate review.',
  '当面の図表テストに提供できるものは何ですか。','週別の集計値','顧客ごとの日付','全顧客の明細と氏名',
  '架空の社内演習として、今回使える粒度、その理由、より細かなデータが必要な場合の次の相談を伝える。');
add('影響範囲を上席に絞って伝える', '範囲の限定と例外の核を変える', 'limited to',
  'limited to の後に来る支店名や範囲に重心を置く。後続の例外は新しい群にして、条件の終わりを明瞭にする。',
  'The error is limited to reports prepared before Tuesday. | Later reports use the corrected mapping. | One earlier report was regenerated on Wednesday, however, | so use its production timestamp before deciding whether it needs to be replaced.',
  '水曜に再生成した報告書の判断に何を使いますか。','作成タイムスタンプ','元の報告書の表題だけ','全資料の公開曜日だけ',
  '対象期間を説明し、境界にある例外を判断するための確認項目を一つ添える。');
add('コントロールの限界を説明する', 'detect と prevent の違いを対照的に伝える', 'detect',
  'detect と prevent の最後の強い音節を明瞭にする。二文に分け、それぞれの動詞の後ろまで同じ速度で話す。',
  'The daily check can detect a missing file | after the delivery window has closed. | It cannot prevent the supplier from missing that window. | To reduce the chance of a delay, we are discussing an earlier readiness check with the supplier.',
  '毎日の確認で分かるのは何ですか。','締切を過ぎてもファイルが届いていないこと','供給元が絶対に遅れないこと','遅延した根本原因の全て',
  '検知と予防を混同している会議で二つを区別し、現行確認を補う提案を述べる。');
add('上限超過を委員会に報告する', '週次評価で期間と閾値を明瞭に読む', 'threshold',
  'threshold の語頭 /θr/ をゆっくり確認してから、above the threshold と below the threshold を一息で対比する。',
  'The value stayed above the internal threshold for two hours. | It returned below the threshold before close of business. | The end-of-day snapshot therefore looks normal, | even though the monitoring log records a breach during the afternoon.',
  '終業時点の値だけでは何が見えませんか。','日中に二時間続いた超過','終業時の基準値','監視ログの保管先',
  '超過が発生した時間帯と解消時刻を伝え、日次スナップショットの限界を説明する。');
add('分類表の粒度を交渉する', '理由を短くして提案に重心を置く', 'breakdown',
  'a regional breakdown と a branch breakdown を口にし、違いを表す語を立てる。長い依頼でも最後の判断事項を落とさない。',
  'The board needs a regional breakdown, | while local managers want to see individual branches. | We suggest one regional page for the meeting | and a supporting table that lets managers examine a branch without crowding the main report.',
  '会議のメインページに載せる粒度はどれですか。','地域単位','全支店の全明細','顧客一人単位',
  '同じ情報に異なる粒度を求める二者に、メイン資料と補足資料を使う構成を提案する。');
add('レビュー範囲を切り分ける', 'in scope と out of scope の対照を保つ', 'in scope',
  'in scope と out of scope を短い句で言い、scope の語頭に母音を足さない。範囲を決める日付を際立たせる。',
  'Changes approved in September are in scope, | even if they went live in October. | Changes approved in August remain outside this review. | Using the approval date consistently will stop the two review teams from counting the same item twice.',
  '九月承認、十月稼働の変更は対象ですか。','承認日基準なので対象になる','稼働日が十月なので対象外','八月に申請していれば必ず対象外',
  '二つの境界事例を挙げ、どちらがレビュー対象かチームが判断できるルールを説明する。');
add('監査証跡を再構成する', '完了と未解決を表す語を並べて伝える', 'evidence',
  'evidence の最初を強くして一語にまとめる。we know と we still need を短い対にし、既知・未知の差を聞かせる。',
  'The email tells us when the request arrived, | and the system log tells us when the field changed. | Neither identifies who approved the change. | We need that final piece of evidence before the reviewer can close the action.',
  '不足している証拠は何ですか。','変更を承認した人の特定','依頼の到着時刻','項目の変更時刻',
  '使える証拠を二つ挙げ、そこから分からない一点を、結論を急がずに説明する。');
add('異議を述べて試行を提案する', '反対理由から代案へ自然に移る', 'pilot',
  'a small pilot で pilot の主強勢を残し、scale up で次の判断を明瞭にする。相手への反論の語尾より提案に十分な時間を割く。',
  'I share the aim of cutting manual checks. | My hesitation is about removing them across every branch at once. | Could we run a small pilot in two branches | and compare the exceptions before deciding whether to scale up?',
  '提案者がためらっているのは何ですか。','全支店で同時に手動確認を外すこと','手動作業を減らす目的そのもの','例外の比較を行うこと',
  '共通の目的を示し、懸念を具体化して、試行後にどう判断するかまで提案する。');
add('定例会で未解決項目を引き取る', 'I will と we need の主語を明確にする', 'follow up',
  'I will follow up の後に期限までを一群で続ける。相手の担当に移る時だけ軽く間を置き、二つの責任が混ざらないようにする。',
  'I will follow up with the supplier by Wednesday. | What I need from this group is a single agreed description of the issue. | If we send three different versions, | the supplier may spend time answering a question that nobody intended to ask.',
  '会議参加者に依頼したことは何ですか。','問題の記述を一つに合意する','各自で供給元へ照会する','回答期限を取り消す',
  '自分が引き取る項目、他の参加者がすること、期限を簡潔に読み上げて会議を閉じる。');
add('見積りの前提を問い直す', '控えめな疑問を後半まで保つ', 'assumption',
  'assumption の主強勢を確認し、Which assumption drives the result? を自然な息の長さで言う。質問の後に一拍待つ。',
  'The estimate rests on the assumption that half the branches will adopt the tool in January. | If adoption is slower, the savings will arrive later. | That does not necessarily reduce the total saving, | but it changes what the programme can deliver this financial year.',
  '導入が遅れる場合に直接変わるのは何ですか。','節約効果が出る時期','必ず節約総額がゼロになる','一月以前の実績値',
  '見積りの前提を一つ確認し、その前提が崩れたときに時期と総額へ及ぶ影響を区別する。');
add('取締役会の追質問に答える', '週次評価で短い結論を先に置く', 'material',
  'material と immaterial を交互に言い、接頭辞を聞き分ける。判断が限定的な場合は、その対象範囲を別の一文で補う。',
  'Is the difference material to the overall decision? | For the group total it is small, | but for one business line it changes the direction of the trend. | We recommend keeping the headline and adding a note for that line.',
  '全体の見出しに加え、何が提案されていますか。','該当する事業部門への注記','全社の見出しの削除','部門別集計の中止',
  '「重要ですか」と尋ねられた場面で、全体と例外部門を区別し、資料に反映する方法まで回答する。');
add('ロンドンで通勤経路を調整する', '駅の指示を区間ごとに区切る', 'change at',
  'change at の /dʒ/ から次の母音へつなぐ。乗り換え場所と路線を二つの意味群にして、聞き手が復唱できる速度で伝える。',
  'For today’s workshop, change at the next stop and take the eastbound service. | The direct route is open, | but its exit beside the venue is closed for repairs. | The eastbound route brings you out on the same side of the main road as the entrance.',
  '遠回りに見える経路を勧める理由は何ですか。','会場側の出口に出られる','直通経路が全面運休している','会場の入口が閉鎖された',
  '初めて参加する同僚に、移動手順、直通を避ける理由、迷った時の確認点を伝える。');
add('内見後に管理会社へ問い合わせる', '期限と誰が対応するかを明瞭に尋ねる', 'repair',
  'repair の後ろの音節を強くし、Who will arrange the repair? をひと息で読む。質問を重ねるときは一問ごとに短く区切る。',
  'The agent said that the loose window catch would be repaired before the tenancy began. | The written offer mentions the window, | but gives no date for the work. | I should like to confirm the deadline and who will arrange access for the contractor.',
  '書面で確認できていないのはどれですか。','修理の期限','窓に関する記載の有無','内見した物件の存在',
  '管理会社に電話し、口頭で聞いた予定を引用して、作業期限と立入り手配を確認する。');
add('近隣の保育施設に予定を尋ねる', '対になる締切を聞き違えないようにする', 'notice',
  'one day’s notice と one week’s notice を順番を替えて読む。day と week に重心を置き、意味の対比を聞き取る。',
  'The nursery asks for one day’s notice if a child will be absent. | A change to the regular collection time needs a week’s notice. | If collection is unexpectedly delayed on the day, | parents should ring the office as soon as they know.',
  '当日に迎えが予想外に遅れる場合はどうしますか。','分かった時点で事務所に電話する','一週間後に届け出る','欠席として前日に登録する',
  '欠席、定例時刻の変更、当日の遅れを区別してパートナーに説明し、電話で使う一文を作る。');
add('社外の相手に集計差を説明する', '日常語に置き換えても数値の単位を保つ', 'rounding',
  'rounding の /aʊ/ を一音節の滑りで示す。丸める順番を変えた二つの説明で、first と then をはっきりさせる。',
  'Each displayed amount has been rounded to the nearest pound. | The total is calculated from the original amounts and rounded only afterwards. | The order of rounding can therefore produce a small difference, | even when the underlying entries agree.',
  '表示額の合計と表示合計が少し違う理由は何ですか。','丸める順番が異なる','元の明細が必ず一致しない','片方が別通貨である',
  '問い合わせへの回答として、専門用語を一つまでに抑え、丸める順序による差を説明する。');
add('暫定対応の終了条件を決める', 'until と by の期限の違いを明示する', 'until',
  'until the check passes と by Friday を別々の文で読む。継続する期限と達成すべき締切を、語尾の内容まで聞かせる。',
  'Keep the manual check in place until two consecutive runs pass. | The team hopes to meet that condition by Friday. | Friday on its own is not the release criterion. | If either run fails, the manual check continues.',
  '手動確認を終了できる条件はどれですか。','二回連続で正常終了する','金曜日になった時点','最初の一回だけ成功する',
  '期限目標と終了条件の違いを説明し、金曜に一回失敗した場合の判断を付け加える。');
add('データ辞書の用語を合意する', '同じ語が指す二つの意味に別々の核を置く', 'customer',
  'customer を既知情報として軽くし、person と relationship に核を置く。どちらの定義に基づくかを文末で明瞭にする。',
  'In one system, a customer means a person. | In the other, it means a relationship with a product. | A person with two products may therefore appear twice. | Before we publish a customer count, we need to state which definition it uses.',
  '二商品を持つ一人が二件になるのはどちらの定義ですか。','商品との関係を単位にする定義','個人を単位にする定義','どちらの定義でも必ず二件',
  '同じ customer という名称に二つの数え方があることを、架空の一人の例で説明する。');
add('運営会議の議事をまとめる', '週次評価で決定事項と未決事項を区切る', 'agreed',
  'we agreed と we have yet to decide を交互に録り、二つ目の decide までリズムを保つ。未決事項が決定に聞こえないか確かめる。',
  'We agreed to retain the weekly check for another month. | We have yet to decide who will review its results after that. | The operations lead will bring two options to the next meeting, | with an estimate of the time each would require.',
  'まだ決まっていないのは何ですか。','一か月後の結果確認の担当','週次確認をもう一か月続けること','次回に二案を提示すること',
  '議長役になり、決定、保留、次回までの担当アクションの順に45秒でまとめる。');
add('リスク登録簿に残余リスクを書く', '残る可能性と見つける手段を対比する', 'residual',
  'residual risk を一まとまりにする。対策の説明を一文で閉じてから、それでも何が起こり得るかを続ける。',
  'The second check reduces the risk of a wrong code reaching the report. | A residual risk remains if both reviewers use the same outdated list. | We suggest dating the approved list | and checking that date before either review begins.',
  '二重確認をしても誤りが残るのはどのような場合ですか。','二人とも同じ古い一覧を使う','二人が異なる日に勤務する','報告書に日付がある',
  '残るリスクを原因と影響に分けて述べ、既存の統制を改善する小さな変更を提案する。');
add('相手の懸念を言い直す', '言い換えと同意の確認を続ける', 'if I understand',
  'if I understand you correctly の後で間を置き、自分が理解した懸念まで一息で伝える。最後に相手の確認を待つ。',
  'If I understand you correctly, | the concern is not the extra column itself but the time needed to populate it. | Would a short trial with existing records help us estimate the work | before we ask every branch to change its process?',
  '懸念の中心は何ですか。','追加列に値を入れる作業時間','列を表示すること自体','全支店が試行済みであること',
  '相手の反対意見を自分の言葉で確かめ、小さな試行で判断材料を集める案を出す。');
add('出張後の経費を確認する', '領収書と利用記録の違いを説明する', 'receipt',
  'receipt /rɪˈsiːt/ は二音節目に核を置く。p を発音せず、a receipt for the fare のまとまりで言う。',
  'The card statement shows the fare but does not show the route. | For this claim, the team has asked for a receipt or a journey record that identifies the stations. | An email confirming the meeting would explain the purpose, | but would not provide the missing route.',
  '精算の確認で不足している情報は何ですか。','利用した区間','カードの利用額','会議の有無だけ',
  '申請済みの同僚に何の証拠が不足しているかを説明し、代わりに提出できる資料を二つ挙げる。');
add('複数部署の意見を調停する', '立場を変えるときに主語を明示する', 'whereas',
  'whereas の前後に各部署の判断を一つずつ置く。聞き手がどの主張をどの部署に帰せるか確認する。',
  'Operations wants the field to be mandatory, | whereas the service team worries that customers may abandon the form. | We propose making it mandatory only when a specific product is selected. | The pilot should measure both missing information and unfinished applications.',
  '試行で並べて測る二つの結果は何ですか。','情報の欠落と未完了の申込','製品の価格と担当者の年齢','全社収益と支店の所在地',
  '二部署の懸念を公平に紹介し、条件付きの案と、成功の判定に必要な二つの指標を説明する。');
add('ロンドンの着任初日に自己紹介する', '職務紹介を短い意味群で構成する', 'my role',
  'my role is to の後ろを動詞から始める。役割、相手への依頼、助けられる場面をそれぞれ一呼吸で話す。',
  'My role is to help teams explain where their risk figures come from. | I will start by listening to the people who prepare the returns. | If a definition works in London but causes difficulties elsewhere, | I would like to understand the difference before suggesting a change.',
  '着任後にまずすることは何ですか。','報告を作る人の話を聞く','すぐに全拠点へ新定義を適用する','地域差を全て誤りとみなす',
  'ロンドン着任初日の自己紹介を一分で行い、担当業務、最初に学びたいこと、同僚への質問を含める。');
add('90日目の委員会ブリーフィング', '既知原稿・初見原稿・即興発話を総合評価する', 'recommendation',
  'recommendation の主強勢を確かめ、our recommendation is to の後の動詞を明瞭にする。録り直しの前に理由、数字、次の判断者が伝わったか聴く。',
  'Our recommendation is to publish the group total today, | with a note explaining that one regional figure is still under review. | The team will replace the note once the local owner confirms the corrected mapping. | Until then, comparisons involving that region should be treated with care.',
  '委員会で承認を求めた公表順序と、比較上の注意の組合せはどれですか。','全体は今日注記付きで公表し、地域責任者の確認まではその地域を含む比較を慎重に扱う','全体は今日公表し、修正対応表が完成した時点で責任者の確認を待たずに注記を外す','地域責任者の確認後に全体を初めて公表し、それまでは他地域同士の比較も保留する',
  '架空の委員会に一分で勧告し、「今公表する理由」「地域の制限」「次報の条件」という三つの追質問に一文ずつ答える。');

export const lessons = rows;
// Original assessment readings. Display only in the assessment flow, ahead of any rehearsal.
// These passages share a format but have not been psychometrically equated.
export const checkpoints = {
  1: 'A local library is testing longer evening hours at two branches. Early figures suggest that working adults are making use of the extra time. The council will review attendance and staffing costs together before it decides whether to extend the trial to smaller libraries in the autumn.',
  7: 'A parcel service has introduced a later collection in several towns. The change gives small shops more time to prepare orders, although not every route is included. Managers will compare the number of parcels collected with the cost of the extra journey before making a permanent decision.',
  14: 'An arts centre has moved its lunchtime talks into a larger room. Bookings rose after the move, but more seats were also made available online. The organisers plan to ask visitors how they heard about the talks before deciding which change helped to attract the larger audience.',
  21: 'A station café has begun displaying the waiting time for hot food. Customers can still order at the counter, while those in a hurry can choose something ready to take away. Staff will check whether the display helps customers make their trains without increasing the amount of food left over.',
  28: 'A community garden has reserved two plots for short courses. The waiting list for permanent plots remains long, yet the organisers say the courses reach residents who cannot attend every week. They will count both regular gardeners and occasional visitors when they review the arrangement later in the year.',
  30: 'A transport group has tested an earlier bus on three routes. Passenger numbers rose on two of them, while the third remained quiet. Before changing the full timetable, the group will examine whether the extra journeys attracted new passengers or simply moved existing passengers away from a later service.',
  35: 'A repair workshop is sending reminders before appointments. Fewer customers have missed their bookings since the messages began, although the trial also took place during a quieter month. The owner will repeat the exercise during a busier period before deciding how much time the reminders have actually saved.',
  42: 'A theatre has opened an additional entrance for afternoon performances. Queues outside became shorter, but staff noticed that people sometimes waited longer inside the building. The next review will measure the whole journey from the pavement to the seat, as well as the time spent at each entrance.',
  49: 'A group of volunteers is mapping places to rest along a walking route. The first map includes benches on public land, while a later version may include seats offered by local shops. The group must confirm when each seat is available before inviting visitors to rely on the map.',
  56: 'A university has offered a shorter induction session for experienced staff. Participants finish earlier, but some still ask for help with the local booking system. The organisers plan to keep the shorter session and add an optional demonstration for anyone who has not used that system before.',
  60: 'A housing team has tested a new way of booking repairs. Residents received an appointment sooner, although the time taken to complete each repair changed very little. The team will report both measures and collect further evidence before deciding whether the system improves the service as a whole.',
  63: 'A market organiser has moved several stalls closer to the main road. Traders near the entrance reported more visitors, while others noticed little difference. Before making the layout permanent, the organiser will speak to customers who enter from the station as well as those who arrive by bus.',
  70: 'A training centre has offered a second start time for one of its courses. Attendance has improved, but the two groups have different levels of experience. The centre will look at attendance and assessment results separately before drawing a conclusion about the effect of the later start.',
  77: 'A small museum has replaced printed guides with reusable information sheets in one gallery. Visitors can still request a paper copy to take home. Staff plan to count those requests alongside the sheets returned each evening so that their estimate of paper savings includes both parts of the service.',
  84: 'A food supplier has changed the labels on its delivery boxes. Receiving staff say that the new labels are easier to read, although damaged boxes still cause delays. The supplier will track reading errors and damaged packaging separately before deciding where to spend the next part of the budget.',
  90: 'A public service team has introduced a single number for appointment enquiries. More calls are answered on the first attempt, but complex requests can still pass through several offices. The team will examine the full time taken to resolve each request before it recommends the same approach for other services.'
};

function task(id, title, minutes, objective, material, steps, assessment, success, review) {
  return {id, title, minutes, objective, material, steps, assessment, success, review};
}

export function makePlan(day, short = false) {
  const item = lessons[day - 1];
  if (!item) throw new RangeError('教材日は1〜90で指定してください。');
  const evaluation = Boolean(checkpoints[day]);
  const listening = task('listen', '精聴', short ? 3 : 10,
    '原稿を伏せ、二つの情報の関係を捉える。', '本日のオリジナル音声と内容理解問題',
    short ? ['全文を一度聞き、何が起きたかを一文で言う。', '内容理解に回答し、根拠のチャンクをもう一度聞く。']
          : ['原稿を隠して全文を一度聞き、要点を一文で言う。', '内容理解に回答し、不確かなチャンクを一つ選ぶ。', 'そのチャンクを聞いて書き取り、原稿と照合する。脱落した語を一つ声に出す。', '原稿を閉じて再聴し、設問への根拠を言い直す。'],
    '初回の内容理解の正誤。書き取りでは一致した語と聞き落とした語を確認する。',
    '設問に回答し、正答を支える情報を音声から一つ挙げられる。',
    '翌日は聞き落とした一群だけ、原稿を開く前に再聴する。');
  const drill = [item.cue, '目標を含むまとまりを通常の速度で読み、一回録る。', '初回を聞いて修正点を一つだけ選び、再録する。'];
  const diagnostic = day === 1
    ? ['固定原稿と初見原稿を、お手本を聞く前に一回ずつ同じ環境で録る。',
       '固定原稿の growth（母音・語末子音）、significantly（語強勢）、of（弱形）を聞き、明瞭・要確認・判定保留のいずれかでメモする。',
       '内容語の拍、節の切れ目、文末の音調を各一箇所聴き、自信がない箇所には判断保留と記す。']
    : ['固定原稿を初回と同じ条件で一回録り、以前の同一原稿と聴き比べる。',
       '当日用の初見原稿を、練習する前に同じ条件で一回録る。固定と初見を別々に記録する。'];
  const pronunciation = task('pronounce', evaluation ? '定点音読と発音矯正' : '発音矯正', short ? 6 : 15,
    item.focus, evaluation ? '固定原稿・本日の初見原稿・練習語 ' + item.target : '練習語・句 ' + item.target,
    evaluation ? [...diagnostic, ...(short ? [item.cue] : drill)] : drill,
    '同じ語・同じ原稿の初回と再録を聴き比べる。サービス評価を使った場合は返った項目を別記する。',
    evaluation ? '固定と初見を別の録音で残し、次に確かめる一点を言える。' : '語単独と本文の中で試し、再録で聞こえ方がどう変わったか一箇所を指せる。',
    '翌日はお手本の前に同じ語句を一度録り、手掛かりを見ずに再現できるか確かめる。');
  const shadow = task('shadow', 'シャドーイング', 20,
    '意味を保ったまま、強勢と句境界を聴いて再現する。', '本日の全文・チャンク音声・録音',
    ['全文を聞いて意味を思い出し、読みづらい二群を選ぶ。', '各群を低速で二回反復し、通常速度で音声と同時に読む。', '原稿を閉じて一拍遅れて追い、全文を録る。イヤホンを使用できればお手本の回り込みを減らせる。', 'お手本と自分の録音の同じ箇所を聴き、語の抜けか句境界を一つ直して再録する。'],
    '二群について、語の脱落と意味の切れ目を自己確認する。',
    '原稿なしで二群を追い、改善前後の一箇所を聞き分けられる。',
    '次回は直した群から始め、別の群にも同じ読み方を一度適用する。');
  const speaking = task('speak', '即興スピーキング', short ? 5 : 10,
    '練習した語句やリズムを原稿なしの説明へ移す。', item.prompt,
    [item.prompt, short ? '要点を二つ決め、30秒で録る。' : 'メモは要点三語までにして45〜60秒話し、録音する。',
     '聞き手の立場で聴き、根拠が抜けた箇所、または聞き返したい語を一つ直す。'],
    '説明に必要な事実と次の行動が含まれたかを自己確認する。',
    '原稿を読まずに話し、相手に残したい要点を二つ確認できる。',
    '次のCamblyで同じ状況を説明し、聞き返された語と相手が受け取った要点を記す。');
  const reflection = task('reflect', '振り返り', short ? 1 : 5,
    '次回に確かめる修正点を一つ残す。', '本日の録音・回答・メモ',
    ['最も聞き取りづらかった語句か、伝わりにくかった文を一つ記す。', '次に何を変え、何が聞こえれば改善と判断するかを書いて終える。'],
    '測定値と自己判断を分け、録音・回答のどこを根拠にしたか記す。',
    '一つの具体例と次回の試し方を記録する。',
    '翌日の最初に目標を声に出し、復習項目を一回試す。');
  return short ? [listening, pronunciation, speaking, reflection]
               : [listening, pronunciation, shadow, speaking, reflection];
}
