/* JellyTCM · v2.7 脉象模块
 * 内容依据《中医诊断学》（朱文锋主编）脉诊章、《濒湖脉学》与《中医脉诊学》。
 * 站点定位是「看懂、记牢、能对上证」，所以：
 *   · 二十八脉逐脉给「脉象—主病—鉴别—记法」，并折算成右侧六个可比的轴
 *   · 寸关尺只讲分候与原理，不编造「某病必见某脉」的对应
 *   · 明确写清：脉诊是四诊之一，单凭脉不能定证，更不能定病
 */
(function(){
  const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  /* ---------------- 一、八要素 ---------------- */
  const DIMS = [
    {k:'脉位', e:'深浅', d:'脉动显现的部位：轻按即得为浮，重按始得为沉，推筋着骨才得为伏。',
     q:'手指该用几分力才摸到？', tip:'浮沉分表里——但「浮」不等于一定是表证，久病见浮要想到虚阳外越。'},
    {k:'脉体', e:'宽窄', d:'脉道的粗细：洪大如波涛为体宽，细如丝线为体窄。',
     q:'脉管是粗是细？', tip:'大而无力多虚，大而有力多实；细主气血两虚，也主湿。'},
    {k:'脉力', e:'强弱', d:'脉搏应指的力度：有力为实，无力为虚，按之欲绝为微。',
     q:'按下去顶手吗？', tip:'有力无力是辨虚实的第一眼，比快慢更靠得住。'},
    {k:'脉率', e:'快慢', d:'一息（一呼一吸）的至数：四至五至为平，不足四至为迟，五至以上为数，七八至为疾。',
     q:'一呼一吸跳几下？', tip:'成人约 60~90 次/分。数不一定是热，虚数无力是阴虚。'},
    {k:'脉律', e:'齐否', d:'节律是否均匀、有无歇止：止无定数为促（数）与结（迟），止有定数为代。',
     q:'跳得匀不匀？有没有停顿？', tip:'偶发歇止可见于常人，频发且止有定数要重视。'},
    {k:'脉幅', e:'起落', d:'每一次搏动起落的幅度：来盛去衰、来去俱盛、来去俱衰。',
     q:'跳起来高不高、落下去快不快？', tip:'洪脉「来盛去衰」，是热盛而津伤的样子。'},
    {k:'脉形', e:'形态', d:'脉道的形状与流利度：如弦、如珠、如刀刮竹、如豆动摇。',
     q:'脉是绷直的、圆滑的、还是涩滞的？', tip:'弦主肝胆与痛，滑主痰食与孕，涩主瘀与精血亏。'},
    {k:'脉势', e:'趋势', d:'搏动的总体趋势：是浮而无力（濡）、沉而无力（弱），还是浮大中空（芤）。',
     q:'气势往外还是往里？', tip:'脉势是诸要素的综合印象，最能反映「胃气」的有无。'}
  ];

  /* ---------------- 二、寸关尺 ---------------- */
  const POS = [
    {p:'左寸', z:'心', f:'小肠', d:'候心与心包。心悸、失眠、舌尖红多见此处偏数或细。'},
    {p:'左关', z:'肝', f:'胆', d:'候肝胆。情绪紧张、胁痛、月经不调常见弦。'},
    {p:'左尺', z:'肾', f:'膀胱、胞宫', d:'候肾阴与精血。腰膝酸软、耳鸣多见沉细。'},
    {p:'右寸', z:'肺', f:'大肠', d:'候肺与卫表。外感初起多见浮。'},
    {p:'右关', z:'脾', f:'胃', d:'候脾胃。纳差、腹胀、便溏多见缓弱。'},
    {p:'右尺', z:'命门', f:'三焦', d:'候肾阳（命门之火）。畏寒、五更泻多见沉迟无力。'}
  ];

  /* ---------------- 三、二十八脉 ----------------
     ax = [脉位(0浮-3沉), 脉体(0细-3大), 脉力(0无力-3有力), 脉率(0迟-3数), 流利(0涩-3滑), 脉律(0不齐-3齐)]
     平脉基准 1.5 */
  const LIST = [
    {n:'浮脉', py:'fm', cat:'浮类', desc:'轻取即得，重按稍减而不空；举之有余，按之不足。',
     zhu:'表证；久病见浮而无力，多为虚阳外越。', pts:'「水上漂木」——手指刚搭上就摸到，再按反而弱。',
     jian:'浮而中空如葱管为芤；浮而细软为濡；浮散无根为散；浮大中空外坚为革。',
     ax:[0,2,2,1.5,1.5,3], rate:'如常'},
    {n:'沉脉', py:'cm', cat:'沉类', desc:'轻取不应，重按始得；举之不足，按之有余。',
     zhu:'里证。有力为里实，无力为里虚。', pts:'「石投水底」——要按到筋骨才清楚。',
     jian:'沉细而软为弱；沉实大弦长、坚牢不移为牢；推筋着骨始得为伏。',
     ax:[3,2,2,1.5,1.5,3], rate:'如常'},
    {n:'迟脉', py:'chm', cat:'迟类', desc:'一息不足四至（约每分钟少于 60 次），来去缓慢。',
     zhu:'寒证。迟而有力为实寒，迟而无力为虚寒；亦见于邪热结聚（如阳明腑实）。',
     pts:'「走得慢」——数一数至数最直接。', jian:'迟而时有一止、止无定数为结。',
     ax:[1.5,2,2,0,1.5,3], rate:'<60'},
    {n:'数脉', py:'shm', cat:'数类', desc:'一息五至以上（约每分钟多于 90 次），来去急促。',
     zhu:'热证。数而有力为实热，数而无力为虚热；亦主里虚阳浮。',
     pts:'「赶路」——快而急。', jian:'数而时有一止为促；数而脉形如豆、厥厥动摇为动；七八至为疾。',
     ax:[1.5,2,2,3,1.5,3], rate:'>90'},
    {n:'虚脉', py:'xm', cat:'虚类', desc:'三部脉举按皆无力，应指松软，来去迟缓。',
     zhu:'虚证，多为气血两虚，尤以气虚为主。', pts:'「按棉花」——有形无势。',
     jian:'虚而浮细软为濡；虚而沉细软为弱；虚而极细欲绝为微。',
     ax:[2,1,0,1.5,1.5,3], rate:'稍慢'},
    {n:'实脉', py:'shm2', cat:'实类', desc:'三部脉举按皆有力，来去俱盛，脉体长大坚实。',
     zhu:'实证。邪气盛而正气不虚。', pts:'「按鼓面」——怎么按都顶手。',
     jian:'实而流利为滑；实而绷急为紧；实而端直为弦。',
     ax:[1.5,2.5,3,1.5,1.5,3], rate:'如常'},
    {n:'滑脉', py:'hm', cat:'实类', desc:'往来流利，应指圆滑，如盘走珠。',
     zhu:'痰饮、食积、实热；妇人妊娠亦见。', pts:'「珠走盘」——圆滑滚动，一滑而过。',
     jian:'滑而如豆动摇为动；滑数而短为促之渐。',
     ax:[1.5,2,2,1.5,3,3], rate:'如常'},
    {n:'涩脉', py:'sm', cat:'虚类', desc:'往来艰涩，迟滞不畅，如轻刀刮竹；三五不调。',
     zhu:'气滞血瘀、精伤血少、痰食内停。', pts:'「刀刮竹」——涩滞不顺，走一走停一停。',
     jian:'涩而时止为结；涩而细弱为精血亏。',
     ax:[1.5,1.5,1.5,1.5,0,2], rate:'稍慢'},
    {n:'长脉', py:'zhm', cat:'实类', desc:'首尾端直，超过本位（寸、尺之外仍可触及）。',
     zhu:'阳证、热证、实证；气血充盛之人亦可见，属平脉。', pts:'「长竿」——两头都出头。',
     jian:'长而端直绷急为弦；长而实大为实。',
     ax:[1,3,2.5,1.5,1.5,3], rate:'如常'},
    {n:'短脉', py:'dm', cat:'虚类', desc:'首尾俱短，不及本位，只在关部明显。',
     zhu:'气病。气虚则短而无力，气郁则短而有力。', pts:'「短棒」——两头缩在关部。',
     jian:'短而涩为气滞血瘀；短而弱为气虚。',
     ax:[1.5,1,1.5,1.5,1.5,2], rate:'如常'},
    {n:'洪脉', py:'hm2', cat:'实类', desc:'脉体阔大，充实有力，来盛去衰，状若波涛汹涌。',
     zhu:'气分热盛。久病见洪而无力，多为邪盛正衰。', pts:'「波涛」——来时汹涌，去时渐衰。',
     jian:'洪而芤为热盛伤津；洪大而数为实热。',
     ax:[0.5,3,3,2,1.5,3], rate:'稍快'},
    {n:'微脉', py:'wm', cat:'虚类', desc:'极细极软，按之欲绝，若有若无。',
     zhu:'气血大虚、阳气衰微；久病见之为危候。', pts:'「游丝将断」——几乎摸不到。',
     jian:'细脉虽细但应指明显，微脉则细软欲绝。',
     ax:[3,0.5,0,1.5,1,3], rate:'稍慢'},
    {n:'紧脉', py:'jm', cat:'实类', desc:'脉来绷急弹指，状如牵绳转索，左右弹手。',
     zhu:'寒证、痛证、宿食。', pts:'「拧紧的绳」——绷、急、弹手。',
     jian:'弦脉端直而长如琴弦，紧脉则绷急如转索、更有弹手感。',
     ax:[1,2,3,2,1,2.5], rate:'稍快'},
    {n:'缓脉', py:'hm3', cat:'平脉', desc:'一息四至，来去缓怠，从容不迫。',
     zhu:'气血调和之常脉（和缓有力）；病中见缓而无力为脾虚、湿困。',
     pts:'「从容」——不快不慢、不紧不软。', jian:'缓而濡为湿；缓而弱为脾虚。',
     ax:[1.5,2,1.5,1,1.5,3], rate:'60~90'},
    {n:'弦脉', py:'xm2', cat:'实类', desc:'端直以长，如按琴弦，指下挺然。',
     zhu:'肝胆病、痛证、痰饮；老年人常见，亦属生理性偏弦。',
     pts:'「琴弦」——直、长、有张力。', jian:'弦而绷急弹手为紧；弦而沉取减为虚弦。',
     ax:[1,2,2.5,1.5,1,3], rate:'如常'},
    {n:'芤脉', py:'km', cat:'浮类', desc:'浮大中空，如按葱管，两边有中间空。',
     zhu:'失血、伤阴（大失血后、吐泻津伤）。', pts:'「葱管」——浮大但中间按下去空。',
     jian:'芤与革都中空，革则外坚如鼓皮、按之不移。',
     ax:[0.5,1.5,0.5,1.5,1,3], rate:'偏数'},
    {n:'革脉', py:'gm', cat:'浮类', desc:'浮而搏指，中空外坚，如按鼓皮。',
     zhu:'亡血、失精、半产漏下；亦见于虚劳。', pts:'「鼓皮」——外面绷紧，里面是空的。',
     jian:'革比芤更「硬」，外坚明显而中空更甚。',
     ax:[0.5,1.5,0.5,1.5,1,3], rate:'偏数'},
    {n:'牢脉', py:'lm', cat:'沉类', desc:'沉按实大弦长，坚牢不移，浮取则无。',
     zhu:'阴寒内实、疝气、癥瘕积聚。', pts:'「深埋的桩」——沉、实、大、长。',
     jian:'牢沉而坚大，沉脉只言位置不言坚牢。',
     ax:[3,2,3,1.5,1,3], rate:'稍慢'},
    {n:'濡脉', py:'rm', cat:'浮类', desc:'浮而细软，轻取可得，重按不显。',
     zhu:'虚证、湿证。久病见濡多气血不足，湿困见濡多脾不运。',
     pts:'「水面浮棉」——浮、细、软三字。', jian:'濡浮细软，弱沉细软，只差一个位置。',
     ax:[0.5,1,0.5,1.5,1,3], rate:'如常'},
    {n:'弱脉', py:'rm2', cat:'沉类', desc:'沉细而软，重按始得，按之无力。',
     zhu:'气血不足、阳气虚衰；老人多见。', pts:'「沉下去才摸到的一点软」——沉、细、软。',
     jian:'弱与濡相对：濡浮、弱沉。',
     ax:[3,1,0.5,1.5,1,3], rate:'稍慢'},
    {n:'散脉', py:'sm2', cat:'浮类', desc:'浮散无根，稍按则无，至数不齐。',
     zhu:'元气离散、脏气将绝；见于心衰、临终前。', pts:'「风中飞絮」——浮散、无根、不齐。',
     jian:'散与濡都浮软，散则无根且不齐，是危候。',
     ax:[0.5,2.5,0.5,1.5,1,1], rate:'不齐'},
    {n:'细脉', py:'xm3', cat:'虚类', desc:'脉细如线，但应指明显，起落分明。',
     zhu:'气血两虚、湿邪困阻；亦见于阴虚。', pts:'「细线」——细而清楚。',
     jian:'细而软欲绝为微；细而浮软为濡。',
     ax:[2,0,1,1.5,1,3], rate:'如常'},
    {n:'伏脉', py:'fm2', cat:'沉类', desc:'重按推筋着骨始得，甚至暂伏不见。',
     zhu:'邪闭、厥证、痛极；亦见于阳虚欲脱。', pts:'「藏到骨头上」——要推到筋骨才有一丝。',
     jian:'伏比沉更深，沉脉重按可得，伏脉需推筋着骨。',
     ax:[3,1,1.5,1.5,1,3], rate:'稍慢'},
    {n:'动脉', py:'dm2', cat:'数类', desc:'脉形如豆，厥厥动摇，滑数有力，多见于关部。',
     zhu:'疼痛、惊恐；亦主妊娠。', pts:'「一颗豆在跳」——短、圆、摇、数。',
     jian:'动与滑都圆滑，动则短如豆而独见于关上。',
     ax:[1,1.5,2,2,2.5,1], rate:'偏数'},
    {n:'促脉', py:'cm2', cat:'数类', desc:'数而时有一止，止无定数。',
     zhu:'阳盛实热、气血痰食停滞；亦主脏气衰败。', pts:'「快跑中突然绊一下」——数而止。',
     jian:'促数而止，结迟而止，代则止有定数。',
     ax:[1.5,2,2,3,1.5,1], rate:'>90 有歇止'},
    {n:'结脉', py:'jm2', cat:'迟类', desc:'迟而时有一止，止无定数。',
     zhu:'阴盛气结、寒痰血瘀；亦主气血虚衰。', pts:'「慢走中停一下」——迟而止。',
     jian:'结与促都止无定数，区别在快慢；代则止有定数。',
     ax:[1.5,2,2,1,1.5,1], rate:'<60 有歇止'},
    {n:'代脉', py:'dm3', cat:'迟类', desc:'迟而中止，止有定数（每隔固定至数一止）。',
     zhu:'脏气衰微；亦主风证、痛证、七情惊恐、跌打损伤。', pts:'「按节拍漏一拍」——停顿有规律。',
     jian:'代止有定数，结促止无定数。',
     ax:[1.5,1.5,1,1.5,1.5,0], rate:'有规律歇止'},
    {n:'疾脉', py:'jm3', cat:'数类', desc:'一息七八至（约每分钟 120 次以上），脉来急疾。',
     zhu:'阳极阴竭、元气将脱；痨瘵见之为危。', pts:'「狂奔」——比数更快。',
     jian:'疾比数更急，且多无力，是危候。',
     ax:[1.5,2,2.5,3,1.5,3], rate:'>120'}
  ];

  /* 同类脉归组（用于筛选） */
  const CATS = ['全部','浮类','沉类','迟类','数类','虚类','实类','平脉'];

  const AXES = [
    {k:'脉位', a:0, lo:'浮', hi:'沉'},
    {k:'脉体', a:1, lo:'细', hi:'大'},
    {k:'脉力', a:2, lo:'无力', hi:'有力'},
    {k:'脉率', a:3, lo:'迟', hi:'数'},
    {k:'流利', a:4, lo:'涩', hi:'滑'},
    {k:'脉律', a:5, lo:'不齐', hi:'齐'}
  ];

  let sel = '浮脉', cat = '全部', q = '';

  const byName = n => LIST.find(p=>p.n===n) || LIST[0];
  const P = () => window.PULSE;

  /* ---------------- 页面 ---------------- */
  function pulsePage(params){
    const want = params && params.get ? params.get('p') : '';
    if(want && LIST.some(p=>p.n===want)) sel = want;
    return `<div class="view">
      <div class="between" style="align-items:flex-end;gap:12px;flex-wrap:wrap">
        <div>
          <h1 style="font-size:26px">脉象</h1>
          <p style="font-size:13px;color:var(--muted);margin-top:4px">寸关尺怎么分、二十八脉怎么辨——先看要素，再看单脉，最后才谈「脉证合参」</p>
        </div>
        <div class="row">
          <input id="plQ" class="ix-q" value="${esc(q)}" placeholder="搜脉名 / 主病 / 特征，如「弦」「痰饮」「如按琴弦」" autocomplete="off" style="width:270px">
        </div>
      </div>

      <div class="warn sm" style="margin-top:14px">
        <span class="ic">!</span>
        <div class="tx"><b>先说明白</b>脉诊只是四诊之一。同一脉可见于多种证，同一证也可见多种脉；单凭脉不能定证，更不能定病。这里的「主病」是教材上的常见对应，不是诊断结论。</div>
      </div>

      <!-- ① 寸关尺 -->
      <div class="ax-sec card" style="margin-top:16px">
        <h4>寸口三部分候<span class="mini">掌后高骨（桡骨茎突）定关，关前为寸、关后为尺</span></h4>
        <div class="pl-wrist">
          ${wristSVG()}
          <div class="pl-pos">
            ${['左','右'].map(side=>`<div class="pl-hand">
              <div class="pl-side">${side}手</div>
              ${POS.filter(p=>p.p[0]===side).map(p=>`<button class="pl-cell" data-pos="${p.p}">
                <b>${p.p}</b><span>${esc(p.z)}</span><em>${esc(p.f)}</em>
              </button>`).join('')}
            </div>`).join('')}
          </div>
        </div>
        <div id="plPosInfo" class="pl-posinfo">点上面任一部位，看它候什么。</div>
        <p class="mini" style="margin-top:9px">为什么独取寸口？寸口为「脉之大会」，肺朝百脉，五脏六腑之气皆会于此；且位置浅表、方便自按。分候的脏腑对应是「上竟上、下竟下」的推演，临床只作参考——<b>不要把「左关弦」直接读成「肝有病」</b>。</p>
      </div>

      <!-- ② 八要素 -->
      <div class="ax-sec">
        <div class="between" style="align-items:baseline;gap:8px">
          <h4 style="margin:0">八个要素：把一条脉拆开看</h4>
          <span class="mini">任何一条脉，都是这八项的组合</span>
        </div>
        <div class="pl-dims">
          ${DIMS.map(d=>`<div class="card pl-dim">
            <div class="between"><b>${esc(d.k)}</b><span class="tag plain">${esc(d.e)}</span></div>
            <p class="pl-q">${esc(d.q)}</p>
            <p class="pl-d">${esc(d.d)}</p>
            <p class="mini pl-t">${esc(d.tip)}</p>
          </div>`).join('')}
        </div>
      </div>

      <!-- ③ 28 脉 -->
      <div class="ax-sec">
        <div class="between" style="align-items:baseline;gap:8px;flex-wrap:wrap">
          <h4 style="margin:0">二十八脉<span class="mini">点一条看详情，右侧是同尺度的六轴比较</span></h4>
          <span class="mini" id="plCount">${LIST.length} 条</span>
        </div>
        <div class="chips" id="plCat" style="margin-top:10px">
          ${CATS.map(c=>`<button class="chip ${cat===c?'on':''}" data-cat="${c}">${c}</button>`).join('')}
        </div>
        <div class="pl-body">
          <div class="pl-list" id="plList"></div>
          <div class="pl-detail" id="plDetail"></div>
        </div>
      </div>

      <!-- ④ 常脉 -->
      <div class="ax-sec card">
        <h4>常脉是什么样<span class="mini">先知道「不病」，才谈得上「病」</span></h4>
        <div class="pl-normal">
          <div><b>有胃气</b><p>从容和缓、不疾不徐，按之柔和有力。这是脉象里最重要的底子。</p></div>
          <div><b>有神</b><p>柔和之中带一点力量，节律整齐，重按不绝。</p></div>
          <div><b>有根</b><p>尺脉沉取仍有力，说明肾气未竭；久病尺脉无根，预后多差。</p></div>
          <div><b>随四时</b><p>春微弦、夏微洪、秋微浮、冬微沉——季节不同，常脉也略有偏移。</p></div>
        </div>
        <p class="mini" style="margin-top:9px">还有个体差异：胖人脉多沉细，瘦人脉多浮大；运动员脉多迟缓；孕妇脉多滑数。判断「异常」要先有本人的基线。</p>
      </div>

      <!-- ⑤ 练一练 -->
      <div class="ax-sec card" id="plQuizBox">
        <div class="between" style="align-items:baseline;gap:8px;flex-wrap:wrap">
          <h4>练一练<span class="mini">给脉象描述，选脉名；共 5 题</span></h4>
          <button class="btn btn-sm" id="plQuizNew">换一组</button>
        </div>
        <div id="plQuiz" style="margin-top:10px"></div>
      </div>

      <p class="mini" style="margin-top:14px;line-height:1.9">内容据《中医诊断学》脉诊章与《濒湖脉学》整理。二十八脉的归类（浮类、沉类等）只是便于记忆的分组，不是严格的分类学。真正的脉诊要靠指下体会与跟师临证，文字只能帮你「认得名字、说得清特征」。</p>

      <div class="card" style="margin-top:14px">
        <h4 style="font-size:14px;margin-bottom:8px">四诊合参 · 相关页面</h4>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <a class="tag" href="#/tongue" style="text-decoration:none">舌诊 · 望诊 ↗</a>
          <a class="tag" href="#/theory" style="text-decoration:none">六经辨证 ↗</a>
          <a class="tag" href="#/disease" style="text-decoration:none">临床 · 病→证→方 ↗</a>
        </div>
      </div>
    </div>`;
  }

  function wristSVG(){
    return `<svg viewBox="46 0 150 200" class="pl-svg" role="img" aria-label="寸关尺位置示意">
      <defs>
        <linearGradient id="plSkin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="var(--card-2)"/><stop offset="1" stop-color="var(--card)"/>
        </linearGradient>
      </defs>
      <rect x="72" y="6" width="96" height="188" rx="30" fill="url(#plSkin)" stroke="var(--line)"/>
      <rect x="86" y="10" width="68" height="58" rx="20" fill="none" stroke="var(--line-2)"/>
      <text x="120" y="44" text-anchor="middle" font-size="11" fill="var(--muted)">掌</text>
      <ellipse cx="120" cy="120" rx="16" ry="17" fill="none" stroke="var(--brand)" stroke-width="1.4" stroke-dasharray="3 3"/>
      ${[['寸',84],['关',120],['尺',156]].map(([t,y])=>`
        <circle cx="120" cy="${y}" r="9" fill="var(--brand)" opacity=".15"/>
        <circle cx="120" cy="${y}" r="3.6" fill="var(--brand)"/>
        <text x="147" y="${y+5}" font-size="12" fill="var(--ink-2)">${t}</text>`).join('')}
      <path d="M96 176 L144 176" stroke="var(--line-2)" stroke-linecap="round"/>
      <text x="120" y="191" text-anchor="middle" font-size="9.5" fill="var(--muted)">前臂</text>
    </svg>`;
  }

  function renderList(){
    const box = document.getElementById('plList'); if(!box) return;
    const kw = q.trim().toLowerCase();
    const list = LIST.filter(p=>{
      if(cat!=='全部' && p.cat!==cat) return false;
      if(!kw) return true;
      return (p.n+p.py+p.cat+p.desc+p.zhu+p.pts+p.jian).toLowerCase().includes(kw);
    });
    box.innerHTML = list.map(p=>`<button class="pl-item ${p.n===sel?'on':''}" data-p="${esc(p.n)}">
      <b>${esc(p.n)}</b><span>${esc(p.cat)}</span>
    </button>`).join('') || `<p class="mini" style="padding:14px">没有匹配的脉。换个词试试，比如「弦」「痰饮」「歇止」。</p>`;
    const c = document.getElementById('plCount');
    if(c) c.textContent = list.length===LIST.length ? LIST.length+' 条' : `${list.length} / ${LIST.length} 条`;
  }

  function renderDetail(){
    const box = document.getElementById('plDetail'); if(!box) return;
    const p = byName(sel);
    const bars = AXES.map(ax=>{
      const v = p.ax[ax.a];
      const pct = Math.max(4, Math.min(100, v/3*100));
      return `<div class="pl-axis">
        <span class="pl-an">${ax.k}</span>
        <span class="pl-lo">${ax.lo}</span>
        <span class="pl-track"><i style="width:${pct}%"></i><em style="left:50%"></em></span>
        <span class="pl-hi">${ax.hi}</span>
      </div>`;
    }).join('');
    const rel = LIST.filter(x=>x!==p && x.jian.includes(p.n.replace('脉',''))).slice(0,3);
    box.innerHTML = `<div class="card pl-card">
      <div class="between" style="align-items:baseline;gap:8px">
        <h4 style="margin:0;font-size:19px">${esc(p.n)}<span class="tag" style="margin-left:8px">${esc(p.cat)}</span></h4>
        <span class="mini">至数 · ${esc(p.rate)}</span>
      </div>
      <p class="pl-desc">${esc(p.desc)}</p>
      <div class="pl-row"><b>主病</b><span>${esc(p.zhu)}</span></div>
      <div class="pl-row"><b>记法</b><span>${esc(p.pts)}</span></div>
      <div class="pl-row"><b>鉴别</b><span>${esc(p.jian)}</span></div>
      <div class="pl-axes">${bars}</div>
      <p class="mini" style="margin-top:6px">六轴为方便比较的粗略刻度（中线是平脉），不是量化诊断；同一脉在不同人身上可以差很多。</p>
      ${rel.length?`<div class="chips" style="margin-top:9px">${rel.map(r=>`<button class="chip" data-p="${esc(r.n)}">对比 ${esc(r.n)}</button>`).join('')}</div>`:''}
    </div>`;
  }

  function bindPulse(){
    const inp = document.getElementById('plQ');
    if(inp){
      inp.value = q;
      inp.oninput = ()=>{ q = inp.value; renderList(); };
    }
    const catBox = document.getElementById('plCat');
    if(catBox) catBox.onclick = e=>{
      const b = e.target.closest('[data-cat]'); if(!b) return;
      cat = b.dataset.cat;
      [...catBox.children].forEach(x=>x.classList.toggle('on', x===b));
      renderList();
    };
    const root = document.querySelector('.pl-body');
    if(root) root.onclick = e=>{
      const b = e.target.closest('[data-p]'); if(!b) return;
      sel = b.dataset.p;
      renderList(); renderDetail();
      const card = document.querySelector('.pl-card');
      if(card && card.getBoundingClientRect().top < 60) card.scrollIntoView({behavior:'smooth', block:'start'});
    };
    const pi = document.getElementById('plPosInfo');
    document.querySelectorAll('[data-pos]').forEach(b=>{
      b.onclick = ()=>{
        const p = POS.find(x=>x.p===b.dataset.pos);
        document.querySelectorAll('[data-pos]').forEach(x=>x.classList.toggle('on', x===b));
        if(pi) pi.innerHTML = `<b>${esc(p.p)}</b> 候 <b style="color:var(--brand)">${esc(p.z)}</b>（表里：${esc(p.f)}）<br><span style="color:var(--muted)">${esc(p.d)}</span>`;
      };
    });
    renderList(); renderDetail(); newQuiz();
    const nb = document.getElementById('plQuizNew');
    if(nb) nb.onclick = ()=> newQuiz();
  }

  /* ---------------- 练一练 ---------------- */
  let QZ = { items:[], i:0, right:0 };
  function newQuiz(){
    const pool = LIST.slice();
    for(let i=pool.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
    QZ = { items:pool.slice(0,5).map(p=>{
      const others = LIST.filter(x=>x!==p);
      for(let i=others.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [others[i],others[j]]=[others[j],others[i]]; }
      const opts = [p.n, others[0].n, others[1].n, others[2].n];
      for(let i=opts.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [opts[i],opts[j]]=[opts[j],opts[i]]; }
      return {p, opts, ans:p.n};
    }), i:0, right:0 };
    drawQuiz();
  }
  function drawQuiz(){
    const box = document.getElementById('plQuiz'); if(!box) return;
    const it = QZ.items[QZ.i];
    if(!it){
      box.innerHTML = `<div class="pl-quizend"><b>做完 5 题，答对 ${QZ.right} 题</b>
        <p class="mini">${QZ.right>=4?'记得不错。指下体会还得靠上手摸。':'别急，先记住每条脉的「一句话特征」。'}</p>
        <button class="btn btn-sm" id="plQuizAgain">再来一组</button></div>`;
      const ag = document.getElementById('plQuizAgain');
      if(ag) ag.onclick = ()=> newQuiz();
      return;
    }
    box.innerHTML = `<div class="pl-qhead">第 ${QZ.i+1} / 5 题 · 已答对 ${QZ.right}</div>
      <p class="pl-qtext">${esc(it.p.desc)}<br><span class="mini">主病：${esc(it.p.zhu.split('。')[0])}</span></p>
      <div class="chips" id="plOpts">${it.opts.map(o=>`<button class="chip" data-opt="${esc(o)}">${esc(o)}</button>`).join('')}</div>
      <div id="plFb" class="mini" style="margin-top:9px"></div>`;
    const opts = document.getElementById('plOpts');
    if(opts) opts.onclick = e=>{
      const b = e.target.closest('[data-opt]'); if(!b) return;
      const ok = b.dataset.opt === it.ans;
      [...opts.children].forEach(x=>{
        x.disabled = true;
        if(x.dataset.opt===it.ans) x.classList.add('on','brand');
        else if(x===b) x.classList.add('on');
      });
      if(ok) QZ.right++;
      const fb = document.getElementById('plFb');
      if(fb) fb.innerHTML = `${ok?'<b style="color:var(--jade)">对了。</b>':'<b style="color:var(--danger)">应该是 '+esc(it.ans)+'。</b>'} ${esc(it.p.pts)}`;
      setTimeout(()=>{ QZ.i++; drawQuiz(); }, ok?900:1800);
    };
  }

  /* ---------------- 导出 ---------------- */
  window.PULSE = {
    list: LIST, dims: DIMS, pos: POS, axes: AXES,
    names: ()=>LIST.map(p=>p.n),
    get: n=>LIST.find(p=>p.n===n)||null
  };
  window.PAGES = Object.assign(window.PAGES || {}, { pulse: pulsePage });
  window.PAGE_BIND = Object.assign(window.PAGE_BIND || {}, { pulse: bindPulse });
})();
