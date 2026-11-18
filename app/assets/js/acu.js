/* JellyTCM · v2.8 穴位库（361 经穴 + 28 奇穴，可搜索）
 * 数据来自 data/acupoints-3~5.js（按十四经编排）与 acupoints-meta.js（合并索引）。
 * 页面分两种：列表 #/acu（搜索 + 按经/部位/特定穴筛选）、详情 #/acu?p=合谷。
 * 定位文字按 GB/T 12346 与规划教材的体表描述，只求「照着能摸到」；针刺深度角度不在本站范围。
 */
(function(){
  const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const A = window.ACU || { list: [], byName: {}, order: [], ptOrder: [], stats: {}, search: ()=>[] };
  const ALL = A.list;

  /* 特定穴解释：详情页把 sp 字段拆开逐个说明 */
  const SP_DOC = {
    '井穴': '五输穴之一，经气所出，如水之源。多用于神志昏迷、心下烦闷、热病；四肢末端，宜点按或点刺。',
    '荥穴': '五输穴之一，经气所溜。多用于热病、身热、咽喉肿痛；「荥主身热」。',
    '输穴': '五输穴之一，经气所注。多用于关节疼痛、体重节痛、肢体酸重。',
    '经穴': '五输穴之一，经气所行。多用于喘咳、寒热、咽喉病。',
    '合穴': '五输穴之一，经气所入，汇合于脏腑。多用于六腑病、胃痛、泄泻、呕吐。',
    '原穴': '脏腑原气留止之处。虚实皆可调，是调理本脏本腑最常用的穴位。',
    '络穴': '络脉由本经别出之处，能联络表里两经，治本经病兼治表里经病。',
    '郄穴': '经脉气血深聚之处。多用于本经的急性病、痛证与血证。',
    '募穴': '脏腑之气汇聚于胸腹部的穴位，多用于该脏腑的病证，常与背俞穴同用（俞募配穴）。',
    '背俞穴': '脏腑之气输注于背腰部的穴位，多用于该脏腑的慢性、虚弱病证。',
    '八会': '八会穴是脏、腑、气、血、筋、脉、骨、髓八者精气所会之处：脏会章门、腑会中脘、气会膻中、血会膈俞、筋会阳陵泉、脉会太渊、骨会大杼、髓会悬钟。',
    '八脉交会': '十二经脉与奇经八脉相通的八个穴位，临床上常上下配合使用（如内关配公孙）。',
    '交会穴': '两条以上经脉交会通过的穴位，能同时治疗所交经脉的病证。',
    '下合穴': '六腑之气下合于足三阳经的穴位（胃—足三里、大肠—上巨虚、小肠—下巨虚、膀胱—委中、三焦—委阳、胆—阳陵泉），专治相应腑病。'
  };
  const spDoc = sp => {
    if(!sp) return [];
    const out = [];
    Object.keys(SP_DOC).forEach(k => { if(sp.includes(k) && !out.some(x => x.k === k)) out.push({k, d:SP_DOC[k]}); });
    return out;
  };

  /* 按部位给默认的推拿操作建议（穴位自带的 op 字段优先） */
  const OP_BY_PT = {
    '头面': '用食指或中指指腹轻揉 1~2 分钟，以局部酸胀为度；面部皮薄，力度宜轻，勿搓揉皮肤。',
    '颈项': '用拇指指腹按揉 1 分钟，或自下而上轻推；颈侧有血管与气管，只做轻柔按压，不可猛力扳拧。',
    '胸腹': '用掌根或指腹顺时针轻揉 2~3 分钟；胸部宜轻，腹部饭后 1 小时内不宜操作。',
    '肩背腰': '用拇指或掌根按揉 2~3 分钟，可配合擦法至局部温热；脊柱两侧用力要匀，不可踩背、暴力按压。',
    '上肢': '用拇指按揉 1~2 分钟，可配合拿法、弹拨；出现麻电感即减力。',
    '下肢': '用拇指按揉 2~3 分钟，可配合点按、拿捏；小腿后侧按揉由下往上，静脉曲张处避开。'
  };

  const S = { q:'', mer:'全部', pt:'全部', sp:'全部', shown:120 };
  const SP_FILTERS = [
    ['全部', null], ['五输穴', /井穴|荥穴|输穴|经穴|合穴/], ['原穴', /原穴/], ['络穴', /络穴/],
    ['郄穴', /郄穴/], ['募穴', /募穴/], ['背俞穴', /背俞穴/], ['八会穴', /八会/],
    ['八脉交会', /八脉交会/], ['推拿常用', /__tuina__/]
  ];

  function filtered(){
    let list = ALL;
    if(S.mer !== '全部') list = list.filter(a => a.m === S.mer);
    if(S.pt !== '全部') list = list.filter(a => a.pt === S.pt);
    if(S.sp !== '全部'){
      const rule = (SP_FILTERS.find(x => x[0] === S.sp) || [])[1];
      list = list.filter(a => rule && (rule.source === '__tuina__' ? a.t : rule.test(a.sp || '')));
    }
    if(S.q.trim()){
      const q = S.q.trim().toLowerCase();
      const t = A.alias[q] || q.replace(/穴$/, '');
      list = list.filter(a =>
        a.n.includes(t) || (a.c || '').toLowerCase().includes(q) ||
        (a.m || '').includes(q) || (a.pt || '').includes(q) ||
        (a.ind || '').includes(q) || (a.loc || '').includes(q) || (a.sp || '').includes(q));
    }
    return list;
  }

  function acuPage(params){
    const p = params && params.get ? params.get('p') : null;
    if(p) return acuDetail(decodeURIComponent(p));
    if(params && params.get){
      const mer = params.get('mer'), pt = params.get('pt');
      if(mer && A.order.includes(mer)) S.mer = mer;
      if(pt && A.ptOrder.includes(pt)) S.pt = pt;
    }
    const nS = ALL.filter(a => a.m !== '经外奇穴').length;
    const nE = ALL.length - nS;
    const chips = ['全部', ...A.order.filter(m => (A.stats[m] || 0) > 0)];
    return `<div class="view">
      <div class="between">
        <div>
          <h1 style="font-size:26px">穴位库</h1>
          <p style="font-size:13px;color:var(--muted);margin-top:4px">共 <b>${ALL.length}</b> 穴：十二正经 ${nS - 52} 穴 · 任督二脉 52 穴 · 经外奇穴 ${nE} 穴；可按穴名、编号（LI4）、主治、部位搜</p>
        </div>
        <input id="aq" placeholder="搜穴名 / 编号 / 主治，如「失眠」「LI4」「合谷」" value="${esc(S.q)}"
          style="padding:9px 14px;border:1px solid var(--line);border-radius:10px;background:var(--card);width:280px;font-size:13.5px;outline:none">
      </div>
      <div class="chips" style="margin-top:14px" id="amer">
        ${chips.map(m => `<button class="chip ${S.mer === m ? 'on' : ''}" data-mer="${esc(m)}" style="font-size:12.5px">${esc(m)}${A.stats[m] ? `<i class="ac-n">${A.stats[m]}</i>` : ''}</button>`).join('')}
      </div>
      <div class="chips" style="margin-top:8px" id="apt">
        ${['全部', ...A.ptOrder].map(t => `<button class="chip ${S.pt === t ? 'on brand' : ''}" data-apt="${esc(t)}" style="font-size:12px">${esc(t)}</button>`).join('')}
      </div>
      <div class="chips" style="margin-top:8px" id="asp">
        ${SP_FILTERS.map(([k]) => `<button class="chip ${S.sp === k ? 'on brand' : ''}" data-asp="${esc(k)}" style="font-size:12px">${esc(k)}</button>`).join('')}
      </div>
      <div class="row" style="margin-top:10px;align-items:baseline">
        <span id="aCount" style="font-size:12.3px;color:var(--muted)"></span>
        <span id="aReset" style="font-size:12.3px;color:var(--brand);cursor:pointer">重置筛选</span>
        <span style="font-size:11.8px;color:var(--muted);margin-left:auto">红框 = 推拿常用</span>
      </div>
      <div id="alist" class="ac-grid"></div>
      <p class="mini" style="margin-top:14px;line-height:1.9">
        定位按国家标准经穴定位与规划教材的体表描述；穴名后的编号（如 LI4 = 手阳明大肠经第 4 穴）便于与图谱、教材对照。
        本站只讲「在哪、治什么、怎么按」，<b>针刺的深度、角度与禁忌不在本站范围</b>，须由执业医师操作。
      </p>
    </div>`;
  }

  function drawList(){
    const box = document.getElementById('alist'); if(!box) return;
    const list = filtered();
    const cnt = document.getElementById('aCount');
    if(cnt) cnt.textContent = `筛出 ${list.length} 穴 / 共 ${ALL.length} 穴`;
    if(!list.length){
      box.innerHTML = `<div class="card" style="grid-column:1/-1;text-align:center;color:var(--muted)">没有匹配的穴位，换个词试试（可搜主治，如「失眠」「腰痛」）</div>`;
      return;
    }
    const show = list.slice(0, S.shown);
    box.innerHTML = show.map(a => `<a class="ac-card ${a.t ? 'hot' : ''}" href="#/acu?p=${encodeURIComponent(a.n)}">
      <div class="ac-h"><b>${esc(a.n)}</b><i>${esc(a.c || '')}</i></div>
      <div class="ac-m">${esc(a.m)}${a.pt ? ' · ' + esc(a.pt) : ''}</div>
      <p class="ac-i">${esc((a.ind || '').split('、').slice(0, 5).join('、'))}</p>
      ${a.sp ? `<div class="ac-tags">${a.sp.split(' · ').map(t => `<span>${esc(t)}</span>`).join('')}</div>` : ''}
    </a>`).join('') + (list.length > show.length
      ? `<div style="grid-column:1/-1;text-align:center;padding:10px 0"><button class="btn" id="aMore">继续显示（还有 ${list.length - show.length} 穴）</button></div>` : '');
    const more = document.getElementById('aMore');
    if(more) more.onclick = () => { S.shown += 240; drawList(); };
  }

  function bindAcu(){
    const q = document.getElementById('aq');
    if(q){
      q.oninput = () => { S.q = q.value; S.shown = 120; drawList(); };
    }
    const mer = document.getElementById('amer');
    if(mer) mer.onclick = e => {
      const b = e.target.closest('[data-mer]'); if(!b) return;
      S.mer = b.dataset.mer; S.shown = 120;
      document.querySelectorAll('#amer .chip').forEach(x => x.classList.toggle('on', x === b));
      drawList();
    };
    const pt = document.getElementById('apt');
    if(pt) pt.onclick = e => {
      const b = e.target.closest('[data-apt]'); if(!b) return;
      S.pt = b.dataset.apt; S.shown = 120;
      document.querySelectorAll('#apt .chip').forEach(x => { x.classList.toggle('on', x === b); x.classList.toggle('brand', x === b); });
      drawList();
    };
    const sp = document.getElementById('asp');
    if(sp) sp.onclick = e => {
      const b = e.target.closest('[data-asp]'); if(!b) return;
      S.sp = b.dataset.asp; S.shown = 120;
      document.querySelectorAll('#asp .chip').forEach(x => { x.classList.toggle('on', x === b); x.classList.toggle('brand', x === b); });
      drawList();
    };
    const rs = document.getElementById('aReset');
    if(rs) rs.onclick = () => {
      S.q = ''; S.mer = '全部'; S.pt = '全部'; S.sp = '全部'; S.shown = 120;
      const el = document.getElementById('aq'); if(el) el.value = '';
      document.querySelectorAll('#amer .chip').forEach((x, i) => x.classList.toggle('on', i === 0));
      document.querySelectorAll('#apt .chip').forEach((x, i) => { x.classList.toggle('on', i === 0); x.classList.toggle('brand', i === 0); });
      document.querySelectorAll('#asp .chip').forEach((x, i) => { x.classList.toggle('on', i === 0); x.classList.toggle('brand', i === 0); });
      drawList();
    };
    if(!document.getElementById('aq')) bindDetail();
    drawList();
  }

  /* ---------------- 详情 ---------------- */
  function acuDetail(name){
    const a = A.byName[name];
    if(!a) return `<div class="view"><p>没找到穴位「${esc(name)}」。</p><a class="btn" href="#/acu">返回穴位库</a></div>`;
    const same = ALL.filter(x => x.m === a.m);
    const idx = same.findIndex(x => x.n === a.n);
    const prev = same[idx - 1], next = same[idx + 1];
    const idxAll = ALL.findIndex(x => x.n === a.n);
    const gPrev = ALL[idxAll - 1], gNext = ALL[idxAll + 1];
    const inds = (a.ind || '').replace(/[。；;]\s*$/, '').split('、').filter(Boolean);
    /* 相近主治：与本穴共享 2 个以上主治关键词的穴位 */
    const kw = new Set(inds.map(s => s.replace(/[。，;；].*$/, '').slice(0, 4)).filter(s => s.length >= 2));
    const near = ALL.filter(x => x.n !== a.n).map(x => {
      const hit = (x.ind || '').split('、').filter(t => [...kw].some(k => k && t.includes(k)));
      return { x, hit: hit.length };
    }).filter(o => o.hit >= 2).sort((p, q) => q.hit - p.hit || p.x.n.localeCompare(q.x.n, 'zh')).slice(0, 8);
    const docs = spDoc(a.sp);
    const op = a.op || OP_BY_PT[a.pt] || '以指腹按揉 1~2 分钟，酸胀为度。';

    return `<div class="view ac-detail">
      <a class="mini" href="#/acu" style="color:var(--brand)">← 穴位库</a>
      <div class="ac-hd">
        <div>
          <h1>${esc(a.n)}<span class="ac-code">${esc(a.c || '')}</span></h1>
          <div class="ac-sub">${esc(a.m)}${a.pt ? ' · ' + esc(a.pt) : ''}${a.t ? ' · <b class="ac-hot">推拿常用</b>' : ''}</div>
        </div>
        <div class="ac-nav">
          ${prev ? `<a class="btn btn-sm" href="#/acu?p=${encodeURIComponent(prev.n)}">← ${esc(prev.n)}</a>` : ''}
          ${next ? `<a class="btn btn-sm" href="#/acu?p=${encodeURIComponent(next.n)}">${esc(next.n)} →</a>` : ''}
        </div>
      </div>

      ${a.sp ? `<div class="chips" style="margin:12px 0 4px">${a.sp.split(' · ').map(t => `<span class="tag brand">${esc(t)}</span>`).join('')}</div>` : ''}

      <div class="card ac-loc">
        <div class="ac-lab">定位</div>
        <p class="ac-loc-t">${esc(a.loc || '')}</p>
        <p class="mini" style="margin-top:6px">取穴时先找骨性标志或皱纹、凹陷，再用「一夫法」（四指并拢为 3 寸）折算距离；左右各一（任督脉与部分奇穴在正中线上）。</p>
      </div>

      <div class="card" style="margin-top:14px">
        <h4 style="font-size:15px;margin-bottom:8px">主治</h4>
        <div class="chips">${inds.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
      </div>

      <div class="grid g2" style="margin-top:14px;gap:14px">
        <div class="card">
          <h4 style="font-size:15px;margin-bottom:6px">怎么按（推拿）</h4>
          <p style="font-size:13px;line-height:1.95;color:var(--ink-2)">${esc(op)}</p>
          <p class="mini" style="margin-top:6px">一般每日 1~2 次，每次每穴 1~3 分钟；酸胀、微热为得气感，刺痛或麻电感立即减力。</p>
        </div>
        <div class="card">
          <h4 style="font-size:15px;margin-bottom:6px">注意</h4>
          ${a.w ? `<p style="font-size:13px;line-height:1.95;color:var(--danger)">${esc(a.w)}</p>`
                : `<p style="font-size:13px;line-height:1.95;color:var(--ink-2)">本穴无特殊禁忌，但皮肤破损、红肿、骨折处及孕妇腹部腰骶部不宜按揉。</p>`}
          <p class="mini" style="margin-top:6px">针刺的深度、角度与禁忌须由执业医师掌握，本站不提供针刺操作。</p>
        </div>
      </div>

      ${docs.length ? `<div class="card" style="margin-top:14px">
        <h4 style="font-size:15px;margin-bottom:8px">这个「特定穴」是什么意思</h4>
        ${docs.map(d => `<p style="font-size:13px;line-height:1.95;color:var(--ink-2);margin-bottom:6px"><b style="color:var(--brand)">${esc(d.k)}</b>　${esc(d.d)}</p>`).join('')}
      </div>` : ''}

      ${near.length ? `<div class="card" style="margin-top:14px">
        <h4 style="font-size:15px;margin-bottom:8px">主治相近的穴</h4>
        <div class="chips">${near.map(o => `<a class="tag hit" href="#/acu?p=${encodeURIComponent(o.x.n)}">${esc(o.x.n)}<i class="ac-n">${o.hit}</i></a>`).join('')}</div>
        <p class="mini" style="margin-top:8px">数字表示与本穴共有几个主治关键词，仅供拓展选穴思路；实际配穴要看证，不是「同效叠加」。</p>
      </div>` : ''}

      <div class="card" style="margin-top:14px">
        <h4 style="font-size:15px;margin-bottom:8px">本经其他穴（${esc(a.m)}，共 ${same.length} 穴）</h4>
        <div class="chips">${same.map(x => x.n === a.n
          ? `<span class="tag brand">${esc(x.n)}</span>`
          : `<a class="tag hit" href="#/acu?p=${encodeURIComponent(x.n)}">${esc(x.n)}</a>`).join('')}</div>
      </div>

      <div class="between" style="margin-top:16px">
        ${gPrev ? `<a class="btn btn-sm" href="#/acu?p=${encodeURIComponent(gPrev.n)}">← ${esc(gPrev.n)}</a>` : '<span></span>'}
        <a class="btn btn-sm" href="#/acu">全部穴位</a>
        ${gNext ? `<a class="btn btn-sm" href="#/acu?p=${encodeURIComponent(gNext.n)}">${esc(gNext.n)} →</a>` : '<span></span>'}
      </div>
    </div>`;
  }

  function bindDetail(){
    /* 详情页不需要额外交互：上一穴/下一穴都是普通链接 */
  }

  window.ACU_PAGE = { spDoc, OP_BY_PT };
  window.PAGES = Object.assign(window.PAGES || {}, { acu: acuPage });
  window.PAGE_BIND = Object.assign(window.PAGE_BIND || {}, { acu: bindAcu });
})();
