/* JellyTCM · v2.8 舌诊模块
 * 依据《中医诊断学》（朱文锋主编）望舌章与《舌诊图谱》通行描述。
 * 取舍：只讲「怎么看、看什么、看到什么说明什么」，不写「某舌必是某病」；
 *      明确标注染苔、光线、伸舌姿势、药物与食物对舌象的影响——这是初学者最容易看错的地方。
 */
(function(){
  const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  /* ---------- 舌面分区 ---------- */
  const DIST = [
    {k:'舌尖', z:'心、肺', d:'舌尖候心肺。舌尖红、起芒刺多见于心火旺或外感风热初起；舌尖淡白可见于心气不足。'},
    {k:'舌中', z:'脾、胃', d:'舌中候脾胃。苔厚腻多在舌中，配合同伴的腹胀、纳呆、便溏更好判断。'},
    {k:'舌边', z:'肝、胆', d:'舌边候肝胆。舌边红、有紫斑多见于肝郁化火或气滞血瘀；齿痕也常在舌边最明显。'},
    {k:'舌根', z:'肾、下焦（膀胱、胞宫、大肠）', d:'舌根候肾与下焦。苔厚积于舌根，多与湿浊下注、下焦积滞有关。'},
    {k:'舌下络脉', z:'血瘀', d:'舌下两条静脉（舌下络脉）青紫、增粗、迂曲，是血瘀的常见指征之一。看时把舌尖轻抵上腭，别用力。'}
  ];

  /* ---------- 舌质 ---------- */
  const QUAL = [
    {k:'舌色', e:'颜色', q:'比淡红更深还是更淡？',
     items:[
       {n:'淡红', d:'正常舌色。淡红润泽、苔薄白，为「淡红舌、薄白苔」。'},
       {n:'淡白', d:'比正常浅淡，甚至几乎无血色。主气血两虚、阳虚；淡白而胖嫩多为阳虚水停，淡白而瘦薄多为气血不足。'},
       {n:'红', d:'比淡红深，呈鲜红。主热证：实热多红而苔黄，虚热多红而少苔、有裂纹。'},
       {n:'绛', d:'深红而暗，比红更深一层。主热入营血、阴虚火旺；绛而干燥起刺多热盛伤津，绛而少苔多阴虚。'},
       {n:'青紫', d:'舌呈青紫或紫暗，或有紫斑、瘀点。主血瘀、寒凝、热毒；淡紫而润多阳虚寒凝，紫绛而干多热灼营血。'}
     ]},
    {k:'舌形', e:'形状', q:'胖不胖？有没有齿痕、裂纹、芒刺？',
     items:[
       {n:'胖大', d:'舌体胖大、撑满口腔。多脾肾阳虚、水湿内停；胖而淡白多阳虚水泛，胖而红多脾虚湿热。'},
       {n:'瘦薄', d:'舌体瘦小、薄而瘪。多气血两虚或阴虚火旺；瘦薄淡白多气血不足，瘦薄红绛多阴虚火旺。'},
       {n:'齿痕', d:'舌边缘有牙齿压出的锯齿状痕迹，常与胖大并存。多脾虚湿盛、气虚。'},
       {n:'裂纹', d:'舌面有深浅不一的裂沟。红绛而裂多热盛伤津或阴虚；淡白而裂多血虚；天生裂纹（无不适）不属病象。'},
       {n:'芒刺', d:'舌面乳头高起如刺，摸之棘手，多在舌尖、舌中。多热邪亢盛；舌尖芒刺多心火，舌中芒刺多胃肠热。'},
       {n:'瘀斑瘀点', d:'舌面出现紫红色或紫黑色斑点。多血瘀；结合舌下络脉看更可靠。'}
     ]},
    {k:'舌态', e:'动态', q:'伸出来稳不稳？有没有歪、抖、缩？',
     items:[
       {n:'强硬', d:'舌体僵硬、转动不灵、言语不清。多热入心包、痰浊内阻或中风先兆，属重证，须及时就医。'},
       {n:'痿软', d:'舌体软弱、不能随意伸缩。多气血虚极或阴液亏耗。'},
       {n:'颤动', d:'舌体抖动不能自主。多气血两虚、热极生风或阴虚风动。'},
       {n:'歪斜', d:'伸舌时舌尖偏向一侧。多中风或中风先兆，须立即就医。'},
       {n:'吐弄', d:'舌常伸出口外为吐，舔口唇四周为弄。小儿多见心脾热或智能发育问题。'},
       {n:'短缩', d:'舌体紧缩不能伸长。多危重之候：寒凝筋脉、痰浊内阻或热盛伤津。'}
     ]}
  ];

  /* ---------- 舌苔 ---------- */
  const COAT = [
    {k:'苔色', e:'白 / 黄 / 灰黑',
     items:[
       {n:'白苔', d:'主表证、寒证。薄白而润为正常或表寒；白厚而腻多寒湿、痰浊、食积。'},
       {n:'黄苔', d:'主里证、热证。苔由白转黄、由薄转厚，多表示邪已入里、热势渐盛；薄黄多风热或热未深，黄厚而燥多里热伤津。'},
       {n:'灰黑苔', d:'多由黄苔或白苔发展而来，主里证，有寒热之分：灰黑而润多阳虚寒盛，灰黑而燥多热极伤阴。'}
     ]},
    {k:'苔质', e:'厚薄 / 润燥 / 腐腻 / 剥落',
     items:[
       {n:'薄苔', d:'透过苔能隐约看到舌质。多为正常或病邪轻浅。'},
       {n:'厚苔', d:'苔厚不见舌质。多邪气盛、痰湿食积内停；苔越厚，邪越重。'},
       {n:'润苔', d:'苔面湿润、不干。正常或津液未伤；过润而滑（滑苔）多水湿内停。'},
       {n:'燥苔', d:'苔面干燥、粗糙，甚至起裂纹。多热盛伤津或阴虚；也可见于吐泻伤津。'},
       {n:'腻苔', d:'苔质致密、颗粒细腻、紧贴舌面、刮之不易去。多湿浊、痰饮、食积。'},
       {n:'腐苔', d:'苔质疏松、颗粒粗大、如豆腐渣，刮之易去。多食积、痰浊；久病见腐苔多为胃气衰败。'},
       {n:'剥苔', d:'舌苔部分或全部剥落，剥处光滑无苔。多胃阴不足、胃气大伤；地图舌（剥落呈地图状）多见于小儿。'},
       {n:'偏全', d:'苔布满全舌为全苔；仅见于局部为偏苔。偏于舌根多下焦湿浊，偏于一侧多与该侧脏腑相关。'}
     ]}
  ];

  /* ---------- 常见舌象（可搜索） ---------- */
  const SIGNS = [
    {n:'淡红舌 · 薄白苔', cat:'正常', see:'舌色淡红润泽，苔薄白均匀，不干不湿。', zu:'气血调和，胃气有根。', ji:'正常舌象，也见于病情轻浅。'},
    {n:'淡白舌', cat:'舌质', see:'舌色比正常浅淡，甚至苍白无华。', zu:'气血两虚、阳虚。', ji:'淡白而胖嫩多为阳虚水停；淡白而瘦薄多为气血不足；淡白而润、畏寒肢冷更支持阳虚。'},
    {n:'红舌', cat:'舌质', see:'舌色鲜红，较淡红为深。', zu:'热证。', ji:'红而苔黄燥为实热；红而少苔、有裂纹为虚热（阴虚）；舌尖独红多心火。'},
    {n:'绛舌', cat:'舌质', see:'舌色深红而暗。', zu:'热入营血、阴虚火旺。', ji:'绛而干燥起刺多热盛伤津；绛而光剥无苔多阴虚火旺；在内伤杂病中见到要重视。'},
    {n:'青紫舌', cat:'舌质', see:'舌质青紫或紫暗，或有紫斑。', zu:'血瘀、寒凝、热毒。', ji:'淡紫而润多阳虚寒凝；紫绛而干多热灼营血；紫暗有瘀斑多气滞血瘀。'},
    {n:'胖大舌', cat:'舌形', see:'舌体胖大，充盈口腔，边缘常有齿痕。', zu:'脾肾阳虚、水湿内停。', ji:'胖而淡白多阳虚水泛；胖而红多脾虚湿热；胖大伴齿痕、便溏、乏力更典型。'},
    {n:'瘦薄舌', cat:'舌形', see:'舌体瘦小、薄而瘪。', zu:'气血两虚、阴虚火旺。', ji:'瘦薄淡白多气血不足；瘦薄红绛多阴虚火旺。'},
    {n:'齿痕舌', cat:'舌形', see:'舌边缘有牙齿压痕，呈锯齿状。', zu:'脾虚、湿盛。', ji:'常与胖大舌并存；若舌淡胖有齿痕、容易疲劳、大便偏稀，多属脾虚湿盛。'},
    {n:'裂纹舌', cat:'舌形', see:'舌面有纵横交错的裂沟。', zu:'热盛伤津、阴虚、血虚。', ji:'红绛而裂多热盛或阴虚；淡白而裂多血虚；先天裂纹无任何不适者不作病论。'},
    {n:'芒刺舌', cat:'舌形', see:'舌面乳头高起如刺，摸之棘手。', zu:'热邪亢盛。', ji:'舌尖芒刺多心火；舌中芒刺多胃肠热；常伴苔黄、口干、便秘。'},
    {n:'瘀斑舌', cat:'舌形', see:'舌面出现紫红或紫黑色斑点。', zu:'血瘀。', ji:'结合舌下络脉青紫增粗、局部刺痛、痛有定处，判断更可靠。'},
    {n:'白苔', cat:'舌苔', see:'苔呈白色，薄白或白厚。', zu:'表证、寒证。', ji:'薄白而润多为正常或表寒；白厚腻多寒湿、痰浊、食积；白苔转黄提示邪渐入里。'},
    {n:'黄苔', cat:'舌苔', see:'苔呈淡黄、深黄或焦黄。', zu:'里证、热证。', ji:'薄黄多风热或热未深；黄厚而腻多湿热；黄厚而燥多里热伤津。苔色越深、越厚，热越重。'},
    {n:'灰黑苔', cat:'舌苔', see:'苔呈灰黑色，多由白苔或黄苔转化。', zu:'里证（寒极或热极）。', ji:'灰黑而润、舌淡胖多阳虚寒盛；灰黑而燥、舌红绛多热极伤阴。属重证，须就医。'},
    {n:'薄苔', cat:'舌苔', see:'能透过苔隐约看到舌质。', zu:'正常或病邪轻浅。', ji:'外感初起多见薄白苔；苔由薄转厚，多表示邪气渐盛。'},
    {n:'厚苔', cat:'舌苔', see:'苔厚，看不到舌质。', zu:'邪气盛、痰湿食积内停。', ji:'苔越厚邪越重；厚腻苔多见于湿浊、痰饮、食积。'},
    {n:'腻苔', cat:'舌苔', see:'苔质致密、颗粒细腻、紧贴舌面，刮之不易去。', zu:'湿浊、痰饮、食积。', ji:'白腻多寒湿，黄腻多湿热；腻苔退得慢，说明湿浊黏滞难去。'},
    {n:'腐苔', cat:'舌苔', see:'苔质疏松、颗粒粗大如豆腐渣，刮之易去。', zu:'食积、痰浊。', ji:'久病见腐苔多为胃气衰败，须重视。'},
    {n:'燥苔', cat:'舌苔', see:'苔面干燥粗糙，甚至起裂纹。', zu:'热盛伤津、阴虚。', ji:'常伴口干、喜饮、尿少；也可见于吐泻、大汗之后。'},
    {n:'滑苔', cat:'舌苔', see:'苔面水滑，伸舌欲滴。', zu:'水湿内停、阳虚水泛。', ji:'常伴畏寒、水肿、小便不利或痰多稀白。'},
    {n:'剥苔', cat:'舌苔', see:'舌苔部分剥落，剥处光滑无苔。', zu:'胃阴不足、胃气大伤。', ji:'剥落呈地图状（地图舌）多见于小儿，常与偏食、消化不良相关；全舌光剥（镜面舌）多属阴虚重证。'},
    {n:'舌下络脉青紫', cat:'舌下', see:'舌下两条静脉青紫、增粗、迂曲，甚至呈结节状。', zu:'血瘀。', ji:'常与紫暗舌、瘀斑并见；观察时舌尖轻抵上腭，勿用力，否则会假性充盈。'}
  ];

  const STEPS = [
    {k:'时间', d:'晨起空腹、未刷牙刮苔、未进食时最准。刚喝完牛奶、咖啡、豆浆，或吃过杨梅、橄榄、巧克力，苔色会假性改变。'},
    {k:'光线', d:'自然光下看。白炽灯偏黄、暖光灯偏红、彩灯更会串色；拍照别开美颜与滤镜，也别用闪光灯直射。'},
    {k:'姿势', d:'自然张口，舌体放松，舌尖略向下、平伸出口。用力挺出会变红、卷缩会变淡，都会失真。每次伸舌 10~20 秒即收回。'},
    {k:'顺序', d:'先看舌质（色、形、态），再看舌苔（色、质、分布），最后看舌下络脉。从舌尖看到舌根，从舌面看到舌边。'},
    {k:'刮苔与否', d:'厚苔要看「刮之去不去」：刮之易去多为腐苔（食积痰浊），刮之不去多为腻苔（湿浊黏滞）。看前不要刻意刷舌。'},
    {k:'干扰因素', d:'吸烟使苔变黄褐；抗生素、铁剂、黄连素、部分中药会染苔；长期用嘴呼吸、口干症、义齿也会影响。判断前先问一句「今天吃过/喝过什么」。'}
  ];

  const QZ = { i:0, right:0 };
  function quizSet(){
    const pool = SIGNS.filter(s => s.cat !== '正常');
    const pick = [];
    const used = new Set();
    while(pick.length < 5 && used.size < pool.length){
      const k = Math.floor(Math.random() * pool.length);
      if(used.has(k)) continue;
      used.add(k); pick.push(pool[k]);
    }
    return pick.map(s => {
      const others = pool.filter(x => x.n !== s.n).sort(() => Math.random() - .5).slice(0, 3).map(x => x.n);
      return { s, opts: [s.n, ...others].sort(() => Math.random() - .5), ans: s.n };
    });
  }
  let QS = null;

  function tonguePage(){
    if(!QS) QS = quizSet();
    return `<div class="view">
      <div class="between">
        <div>
          <h1 style="font-size:26px">舌诊</h1>
          <p style="font-size:13px;color:var(--muted);margin-top:4px">望舌怎么望 · 舌面分哪几区 · 舌质舌苔各看什么 · ${SIGNS.length} 种常见舌象对照</p>
        </div>
        <input id="tq" placeholder="搜舌象，如「腻」「齿痕」「剥苔」" style="padding:9px 14px;border:1px solid var(--line);border-radius:10px;background:var(--card);width:240px;font-size:13.5px;outline:none">
      </div>

      <div class="tg-note">
        <b>先说清楚</b>　望舌是四诊之一：<b>舌质看脏腑虚实，舌苔看邪气深浅</b>。但同一个舌象可以见于多种证，
        同一证在不同人、不同季节舌象也不一样。<b>单凭一张舌照不能定证，更不能定病</b>；照片还有色差与光线问题。
      </div>

      <div class="sec"><h2>一、怎么望</h2><span class="hint">六件事做对，舌象才有参考价值</span></div>
      <div class="grid auto-260">
        ${STEPS.map((s, i) => `<div class="card tg-step">
          <div class="tg-i">${String(i + 1).padStart(2, '0')}</div>
          <h4 style="font-size:14.5px">${esc(s.k)}</h4>
          <p>${esc(s.d)}</p>
        </div>`).join('')}
      </div>

      <div class="sec"><h2>二、舌面分哪几区</h2><span class="hint">点一下分区，看它候什么</span></div>
      <div class="card tg-map">
        <div class="tg-fig">
          <svg viewBox="0 0 260 250" class="tg-svg" id="tgSvg">
            <defs>
              <clipPath id="tgClip">
                <path d="M130 14c-56 0-92 30-96 78-4 50 26 132 96 132s100-82 96-132c-4-48-40-78-96-78z"/>
              </clipPath>
            </defs>
            <g clip-path="url(#tgClip)">
              <rect class="tz" data-t="0" x="8" y="4" width="244" height="74"/>
              <rect class="tz" data-t="1" x="74" y="80" width="112" height="60"/>
              <rect class="tz" data-t="2" x="8" y="80" width="64" height="60"/>
              <rect class="tz" data-t="2" x="188" y="80" width="64" height="60"/>
              <rect class="tz" data-t="3" x="8" y="142" width="244" height="98"/>
            </g>
            <path d="M130 14c-56 0-92 30-96 78-4 50 26 132 96 132s100-82 96-132c-4-48-40-78-96-78z"
              fill="none" stroke="var(--brand)" stroke-width="2.2"/>
            <path d="M44 142h172" fill="none" stroke="var(--line)" stroke-width="1.2" stroke-dasharray="4 4"/>
            <text class="tg-tx" x="130" y="48" text-anchor="middle">舌尖</text>
            <text class="tg-tx sm" x="130" y="66" text-anchor="middle">心肺</text>
            <text class="tg-tx" x="130" y="110" text-anchor="middle">舌中</text>
            <text class="tg-tx sm" x="130" y="128" text-anchor="middle">脾胃</text>
            <text class="tg-tx" x="58" y="106" text-anchor="middle" style="font-size:12px">舌边</text>
            <text class="tg-tx sm" x="58" y="122" text-anchor="middle">肝胆</text>
            <text class="tg-tx" x="202" y="106" text-anchor="middle" style="font-size:12px">舌边</text>
            <text class="tg-tx sm" x="202" y="122" text-anchor="middle">肝胆</text>
            <text class="tg-tx" x="130" y="176" text-anchor="middle">舌根</text>
            <text class="tg-tx sm" x="130" y="194" text-anchor="middle">肾 · 下焦</text>
          </svg>
          <button class="tg-sub" data-t="4">舌下络脉（舌底）</button>
        </div>
        <div class="tg-zone" id="tgZone"></div>
      </div>

      <div class="sec"><h2>三、舌质看什么</h2><span class="hint">色 · 形 · 态</span></div>
      <div class="grid auto-300">
        ${QUAL.map(q => `<div class="card tg-q">
          <div class="between" style="align-items:baseline">
            <h4 style="font-size:15px">${esc(q.k)}</h4><span class="tag">${esc(q.e)}</span>
          </div>
          <p class="mini" style="margin:4px 0 8px">上手自问：${esc(q.q)}</p>
          ${q.items.map(it => `<div class="tg-row"><b>${esc(it.n)}</b><span>${esc(it.d)}</span></div>`).join('')}
        </div>`).join('')}
      </div>

      <div class="sec"><h2>四、舌苔看什么</h2><span class="hint">苔色 · 苔质</span></div>
      <div class="grid auto-300">
        ${COAT.map(q => `<div class="card tg-q">
          <div class="between" style="align-items:baseline">
            <h4 style="font-size:15px">${esc(q.k)}</h4><span class="tag">${esc(q.e)}</span>
          </div>
          <div style="margin-top:8px">${q.items.map(it => `<div class="tg-row"><b>${esc(it.n)}</b><span>${esc(it.d)}</span></div>`).join('')}</div>
        </div>`).join('')}
      </div>

      <div class="sec"><h2>五、常见舌象对照</h2><span class="hint">共 ${SIGNS.length} 条，可搜索</span></div>
      <div class="chips" id="tcat">
        ${['全部', '正常', '舌质', '舌形', '舌苔', '舌下'].map(c => `<button class="chip ${c === '全部' ? 'on' : ''}" data-tcat="${c}" style="font-size:12px">${c}</button>`).join('')}
      </div>
      <div id="tlist" class="tg-list"></div>

      <div class="sec"><h2>六、练一练</h2><span class="hint">看描述，选舌象</span></div>
      <div class="card" id="tquiz"></div>

      <p class="mini" style="margin-top:18px;line-height:1.95">
        舌象只是辨证的一条线索：<b>要和问诊、脉诊、症状合起来看</b>。同一舌象在寒证、热证里都可能出现，
        例如红舌既可见于实热，也可见于阴虚；苔厚既可能是湿浊，也可能是食积。本站不提供诊断结论，
        若舌象突然改变（如出现光剥、青紫、歪斜）或伴有明显不适，请及时就医。
      </p>

      <div class="card" style="margin-top:14px">
        <h4 style="font-size:14px;margin-bottom:8px">四诊合参 · 相关页面</h4>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <a class="tag" href="#/pulse" style="text-decoration:none">脉象 · 切诊 ↗</a>
          <a class="tag" href="#/tuina" style="text-decoration:none">推拿 · 成人+小儿 ↗</a>
          <a class="tag" href="#/acu" style="text-decoration:none">穴位库 ↗</a>
        </div>
      </div>
    </div>`;
  }

  function drawZone(i){
    const box = document.getElementById('tgZone'); if(!box) return;
    const d = DIST[i] || DIST[0];
    box.innerHTML = `<div class="tg-zt">${esc(d.k)}　<span>${esc(d.z)}</span></div>
      <p>${esc(d.d)}</p>`;
    document.querySelectorAll('.tg-map [data-t]').forEach(g => g.classList.toggle('on', +g.dataset.t === i));
  }

  function drawSigns(){
    const box = document.getElementById('tlist'); if(!box) return;
    const q = (document.getElementById('tq')?.value || '').trim();
    const cat = document.querySelector('#tcat .chip.on')?.dataset.tcat || '全部';
    let list = SIGNS;
    if(cat !== '全部') list = list.filter(s => s.cat === cat);
    if(q) list = list.filter(s => (s.n + s.see + s.zu + s.ji).includes(q));
    if(!list.length){ box.innerHTML = `<div class="card" style="color:var(--muted);text-align:center">没有匹配的舌象</div>`; return; }
    box.innerHTML = list.map(s => `<div class="card tg-sign">
      <div class="between" style="align-items:baseline">
        <h4 style="font-size:15.5px">${esc(s.n)}</h4><span class="tag">${esc(s.cat)}</span>
      </div>
      <p class="tg-see"><b>舌象</b>　${esc(s.see)}</p>
      <p class="tg-zu"><b>主</b>　${esc(s.zu)}</p>
      <p class="tg-ji"><b>怎么辨</b>　${esc(s.ji)}</p>
    </div>`).join('');
  }

  function drawQuiz(){
    const box = document.getElementById('tquiz'); if(!box) return;
    if(QZ.i >= QS.length){
      box.innerHTML = `<div class="tg-qhead">完成 · 答对 ${QZ.right} / ${QS.length}</div>
        <p class="mini" style="margin:8px 0 12px">换个顺序再来一轮，或回到上面「常见舌象对照」逐条看。</p>
        <button class="btn btn-sm" id="tqAgain">再来一遍</button>`;
      document.getElementById('tqAgain').onclick = () => { QS = quizSet(); QZ.i = 0; QZ.right = 0; drawQuiz(); };
      return;
    }
    const it = QS[QZ.i];
    box.innerHTML = `<div class="tg-qhead">第 ${QZ.i + 1} / ${QS.length} 题 · 已答对 ${QZ.right}</div>
      <p class="tg-qtext">「${esc(it.s.see)}」<br><span class="mini">主病提示：${esc(it.s.zu)}</span></p>
      <div class="chips" id="tOpts">${it.opts.map(o => `<button class="chip" data-opt="${esc(o)}">${esc(o)}</button>`).join('')}</div>
      <div id="tFb" class="mini" style="margin-top:9px"></div>`;
    const opts = document.getElementById('tOpts');
    opts.onclick = e => {
      const b = e.target.closest('[data-opt]'); if(!b) return;
      const ok = b.dataset.opt === it.ans;
      [...opts.children].forEach(x => { x.disabled = true; if(x.dataset.opt === it.ans) x.classList.add('on', 'brand'); else if(x === b) x.classList.add('on'); });
      if(ok) QZ.right++;
      const fb = document.getElementById('tFb');
      if(fb) fb.innerHTML = `${ok ? '<b style="color:var(--jade)">对了。</b>' : '<b style="color:var(--danger)">应该是「' + esc(it.ans) + '」。</b>'} ${esc(it.s.ji)}`;
      setTimeout(() => { QZ.i++; drawQuiz(); }, ok ? 1000 : 2200);
    };
  }

  function bindTongue(){
    const q = document.getElementById('tq');
    if(q) q.oninput = drawSigns;
    const cat = document.getElementById('tcat');
    if(cat) cat.onclick = e => {
      const b = e.target.closest('[data-tcat]'); if(!b) return;
      [...cat.children].forEach(x => x.classList.toggle('on', x === b));
      drawSigns();
    };
    const map = document.querySelector('.tg-map');
    if(map) map.onclick = e => {
      const t = e.target.closest('[data-t]');
      if(t && map.contains(t)) drawZone(+t.dataset.t);
    };
    if(document.getElementById('tgZone')) drawZone(0);
    if(document.getElementById('tlist')){ drawSigns(); drawQuiz(); }
  }

  window.TONGUE = { dist: DIST, qual: QUAL, coat: COAT, signs: SIGNS, steps: STEPS };
  window.PAGES = Object.assign(window.PAGES || {}, { tongue: tonguePage });
  window.PAGE_BIND = Object.assign(window.PAGE_BIND || {}, { tongue: bindTongue });
})();
