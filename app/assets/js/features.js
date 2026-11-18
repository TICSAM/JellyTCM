/* ================= 扩展功能：每日一句 / 产地采收储存 / 中西药相互作用 / 医案 / 类方家族 / 开方练习 / 方剂拼图 ================= */
(function(){
  const A = () => window.APP || {};
  const esc = s => (A().esc || (x=>String(x==null?'':x)))(s);
  const FM = () => A().FM || [];
  const HB = () => A().HB || [];
  const fByName = n => FM().find(f => f.n === n) || null;
  const hByName = n => ((A().HB_BY || {})[n] || null);

  /* ================= 小游戏战绩（本机） ================= */
  const GAME = (()=>{
    let s = { rxN:0, rxOk:0, pzN:0, pzOk:0, pzPerfect:0 };
    try{ Object.assign(s, JSON.parse(localStorage.getItem('jellytcm-game')||'{}')); }catch(e){}
    const save = ()=>{ try{ localStorage.setItem('jellytcm-game', JSON.stringify(s)); }catch(e){} };
    return {
      get: ()=>s,
      add(k, ok){
        s[k+'N'] = (s[k+'N']||0) + 1;
        if(ok) s[k+'Ok'] = (s[k+'Ok']||0) + 1;
        save();
      },
      perfect(){ s.pzPerfect = (s.pzPerfect||0) + 1; save(); },
      reset(){ s = {rxN:0,rxOk:0,pzN:0,pzOk:0,pzPerfect:0}; save(); }
    };
  })();

  /* ================= 每日一句《伤寒论》 ================= */
  function dailyQuote(){
    const S = (window.SHANGHAN||[]).filter(x=>x.f);
    if(!S.length) return '';
    let off = 0;
    try{ off = parseInt(localStorage.getItem('jellytcm-daily')||'0',10) || 0; }catch(e){}
    const day = Math.floor(Date.now()/864e5);
    const it = S[((day + off) % S.length + S.length) % S.length];
    const f = fByName(it.f);
    const ana = f ? (String(f.ana||'').split(/[。；]/)[0] + '。') : '';
    return `<div class="card daily" id="dailyCard">
      <div class="between" style="align-items:flex-start;gap:10px">
        <div class="daily-h"><span class="tag brand">每日一句</span><span>《伤寒论》· ${esc(it.b)} · 第 ${esc(it.n)} 条</span></div>
        <button class="btn btn-sm" data-daily-next style="flex:none">换一句</button>
      </div>
      <blockquote class="daily-q">${esc(it.t)}</blockquote>
      <div class="daily-f">
        <a class="tag gold" href="#/formula/${encodeURIComponent(it.f)}">${esc(it.f)}</a>
        <span class="daily-ana">${esc(ana)}</span>
      </div>
      <div class="row" style="margin-top:10px">
        <a class="btn btn-sm" href="#/formula/${encodeURIComponent(it.f)}">看这首方 →</a>
        ${it.tag?`<span class="tag" style="border:none;background:none;color:var(--muted)">${esc(it.tag)}</span>`:''}
        <a class="btn btn-sm" href="#/shanghan" style="margin-left:auto">全部原文 →</a>
      </div>
    </div>`;
  }
  document.addEventListener('click', e=>{
    const b = e.target.closest('[data-daily-next]');
    if(!b) return;
    let off = 0;
    try{ off = parseInt(localStorage.getItem('jellytcm-daily')||'0',10) || 0; }catch(err){}
    try{ localStorage.setItem('jellytcm-daily', String(off+1)); }catch(err){}
    const card = document.getElementById('dailyCard');
    if(card){
      const tmp = document.createElement('div');
      tmp.innerHTML = dailyQuote();
      card.replaceWith(tmp.firstElementChild);
    }
  });

  /* ================= 产地 / 采收 / 储存 ================= */
  function originOf(h){
    const O = window.ORIGIN || {};
    if(O.special && O.special[h.n]) return Object.assign({curated:true}, O.special[h.n]);
    const p = A().herbPart ? A().herbPart(h) : '根';
    const g = (O.part||{})[p] || (O.part||{})['根'] || {o:'—',h:'—',s:'—'};
    return Object.assign({curated:false, part:p}, g);
  }
  function originCard(h){
    const o = originOf(h);
    const O = window.ORIGIN || {};
    return `<div class="card" style="margin-top:16px">
      <div class="between" style="margin-bottom:8px">
        <h4 style="font-size:15px">产地 · 采收 · 储存</h4>
        <span class="tag ${o.curated?'jade':''}">${o.curated?'道地要点':'按部位通则'}</span>
      </div>
      <div class="tr3">
        <div class="tr3-i"><b>产地</b><p>${esc(o.o)}</p></div>
        <div class="tr3-i"><b>采收</b><p>${esc(o.h)}</p></div>
        <div class="tr3-i"><b>储存</b><p>${esc(o.s)}</p></div>
      </div>
      <p class="mini">${o.curated ? '以上为该药的道地要点简述；不同批次以《中国药典》与饮片包装标示为准。' : '这一味暂未逐条收录道地信息，以上按「' + esc(o.part||'药用部位') + '」给出通行原则，具体以药典与当地饮片规范为准。'}</p>
    </div>`;
  }
  function sameNameGroups(h){
    const O = window.ORIGIN || {};
    return (O.same||[]).filter(g => (g.hs||[]).includes(h.n));
  }
  function sameNameCard(h){
    const list = sameNameGroups(h);
    if(!list.length) return '';
    return `<div class="card" style="margin-top:16px">
      <div class="between" style="margin-bottom:8px">
        <h4 style="font-size:15px">同名异物 · 别买错</h4>
        <span class="tag" style="border-color:var(--gold);color:var(--gold)">${list.length} 组</span>
      </div>
      ${list.map(g=>`<div class="same-g">
        <div class="same-t">${esc(g.n)}</div>
        <p>${esc(g.d)}</p>
        <p class="same-tip"><b>用法差别</b>${esc(g.t)}</p>
      </div>`).join('')}
    </div>`;
  }

  /* ================= 中西药同服 · 相互作用 ================= */
  const LV = { '明确':'brand', '理论':'gold', '个案':'' };
  function ixRows(list){
    return list.map((x,i)=>`
      <details class="ix-row" data-k="${esc((x.a+' '+x.b+' '+x.d).toLowerCase())}">
        <summary>
          <b>${esc(x.a)}</b><i>+</i><span class="ix-b">${esc(x.b)}</span>
          <em class="tag ${LV[x.lv]||''}">${esc(x.lv)}</em>
        </summary>
        <p class="ix-d">${esc(x.d)}</p>
        <p class="ix-t"><b>怎么办</b>${esc(x.t)}</p>
      </details>`).join('');
  }
  function ixCard(){
    const I = window.INTERACT;
    if(!I) return '';
    return `<div class="card" style="margin-top:14px" id="ixCard">
      <div class="between" style="margin-bottom:6px">
        <h4 style="font-size:15.5px">中西药同服 · 相互作用速查</h4>
        <span class="tag">${I.list.length} 组</span>
      </div>
      <p class="mini" style="margin-bottom:8px">${esc(I.note)}</p>
      <input id="ixQ" class="ix-q" placeholder="搜中药名或西药名，如「甘草」「华法林」「他汀」">
      <div id="ixList" class="ix-list">${ixRows(I.list)}</div>
      <div id="ixEmpty" hidden class="ix-empty">没有匹配的条目，换个药名试试。</div>
      <p class="mini" style="margin-top:10px">等级说明：<b>明确</b>＝有临床报道或说明书警示；<b>理论</b>＝机制明确但临床证据有限；<b>个案</b>＝仅个案报道，需谨慎看待。本表只作提醒，不替代药师审方。</p>
    </div>`;
  }
  document.addEventListener('input', e=>{
    if(e.target.id !== 'ixQ') return;
    const q = e.target.value.trim().toLowerCase();
    const box = document.getElementById('ixList');
    if(!box) return;
    let n = 0;
    [...box.querySelectorAll('.ix-row')].forEach(el=>{
      const hit = !q || (el.dataset.k||'').includes(q);
      el.hidden = !hit;
      if(hit) n++;
    });
    const empty = document.getElementById('ixEmpty');
    if(empty) empty.hidden = n > 0;
  });

  /* ================= 医案 ================= */
  function caseOf(name){ return (window.CASES||[]).find(x=>x.n===name) || null; }
  function guOf(name){ return (window.SHANGHAN||[]).filter(x=>x.f===name).slice(0,2); }
  function caseCard(f){
    const c = caseOf(f.n), gu = guOf(f.n);
    if(!c && !gu.length) return '';
    return `<div class="card" style="margin-top:16px">
      <div class="between" style="margin-bottom:8px">
        <h4 style="font-size:15px">古今医案</h4>
        <span class="tag ${c?'jade':''}">${c?'古案 · 原文 ／ 今案 · 示例':'古案 · 原文'}</span>
      </div>
      ${gu.length?`<div class="case-blk">
        <div class="case-k">古籍依据</div>
        ${gu.map(x=>`<blockquote class="case-q">${esc(x.t)}<em>《伤寒论》· ${esc(x.n)}</em></blockquote>`).join('')}
      </div>`:''}
      ${c?`<div class="case-blk" style="margin-top:10px">
        <div class="case-k">${c.src?`名家医案<span class="case-warn">据 ${esc(c.src)} · 医家自述</span>`:'示例病案<span class="case-warn">据典型证候编拟 · 非真实病例</span>'}</div>
        <p class="case-t"><b>${esc(c.jin.p)}</b>　${esc(c.jin.s)}</p>
        <p class="case-r">${esc(c.jin.r)}</p>
        ${c.warn?`<p class="mini" style="margin-top:8px;color:#b3452e">⚠️ ${esc(c.warn)}</p>`:''}
      </div>`:''}
      <p class="mini" style="margin-top:8px">医案只示范「从症状到方证」的思路，剂量与加减须因人而异，<b>不构成诊疗建议</b>。</p>
    </div>`;
  }

  /* ================= 医案总览页 ================= */
  let csQ = '';
  function casesPage(){
    const list = (window.CASES||[]);
    return `<div class="view">
      <div class="row" style="margin-bottom:12px"><a class="btn btn-sm" href="#/tools">← 工具台</a></div>
      <h1 style="font-size:25px">古今医案</h1>
      <p style="font-size:13px;color:var(--muted);margin-top:4px">「古案」取《伤寒论》原文条文；「今案」为按典型证候编拟的示例病案，只练辨证思路；少量「名家医案」为医家自述门诊实录（已标注来源）</p>
      <div class="card" style="margin-top:14px;padding:12px 15px">
        <input id="csQ" class="ix-q" value="${esc(csQ)}" placeholder="搜方名 / 症状，如「桂枝汤」「失眠」「胁痛」">
        <div style="margin-top:8px;font-size:12px;color:var(--muted)" id="csCount"></div>
      </div>
      <div id="csList" class="cs-list" style="margin-top:14px"></div>
    </div>`;
  }
  function renderCases(){
    const box = document.getElementById('csList');
    if(!box) return;
    const q = csQ.trim();
    const list = (window.CASES||[]).filter(c=>{
      if(!q) return true;
      return (c.n + c.jin.p + c.jin.s + c.jin.r).includes(q);
    });
    const cnt = document.getElementById('csCount');
    if(cnt) cnt.textContent = `共 ${list.length} 则（古籍原文另见每首方剂页）`;
    box.innerHTML = list.length ? list.map(c=>`<details class="cs-item">
      <summary><b>${esc(c.n)}</b>${c.src?'<span class="tag gold" style="font-size:10px;margin-left:6px">名家</span>':''}<span>${esc(c.jin.s.slice(0,26))}${c.jin.s.length>26?'…':''}</span></summary>
      <div class="cs-body">
        ${guOf(c.n).map(x=>`<blockquote class="case-q">${esc(x.t)}<em>《伤寒论》· ${esc(x.n)}</em></blockquote>`).join('')}
        <p class="case-t"><b>${esc(c.jin.p)}</b>　${esc(c.jin.s)}</p>
        <p class="case-r">${esc(c.jin.r)}</p>
        ${c.src?`<p class="mini" style="margin-top:6px;color:var(--muted)">来源：${esc(c.src)}</p>`:''}
        ${c.warn?`<p class="mini" style="margin-top:4px;color:#b3452e">⚠️ ${esc(c.warn)}</p>`:''}
        <div class="row"><a class="btn btn-sm" href="#/formula/${encodeURIComponent(c.n)}">看这首方 →</a></div>
      </div>
    </details>`).join('') : `<div class="card" style="text-align:center;color:var(--muted)">没有匹配的医案</div>`;
  }

  /* ================= 类方家族树 ================= */
  function families(){
    const map = {};
    FM().forEach(f=>{
      const j = (f.c||[]).find(x=>x.r==='君');
      if(!j) return;
      (map[j.h] = map[j.h] || []).push(f);
    });
    return Object.keys(map)
      .filter(k=>map[k].length>=2)
      .map(k=>({k, list: map[k].slice().sort((a,b)=>a.c.length-b.c.length)}))
      .sort((a,b)=> b.list.length - a.list.length || a.k.localeCompare(b.k,'zh'));
  }
  /* 别名归一：某首方写「芍药」、另一首写「白芍」时，不能算一加一减 */
  const canonN = n => (window.HB_ALIAS||{})[n] || n;
  function famDiff(base, f){
    const b = new Set((base.c||[]).map(x=>canonN(x.h)));
    const s = new Set((f.c||[]).map(x=>canonN(x.h)));
    const add = [...new Set((f.c||[]).filter(x=>!b.has(canonN(x.h))).map(x=>x.h))];
    const del = [...new Set((base.c||[]).filter(x=>!s.has(canonN(x.h))).map(x=>x.h))];
    if(!add.length && !del.length){
      /* 药味全同但用量不同（如四逆汤 / 通脉四逆汤），说「组成相同」会误导，改成标出加量的药 */
      const bd = new Map((base.c||[]).map(x=>[canonN(x.h), String(x.g==null?'':x.g)]));
      const dd = (f.c||[]).filter(x=>{ const g=String(x.g==null?'':x.g); const k=canonN(x.h); return bd.has(k) && bd.get(k)!==g; })
        .map(x=>x.h+' '+bd.get(canonN(x.h))+'→'+x.g);
      return dd.length ? '同药异量：' + dd.join('、') : '组成相同';
    }
    const p = [];
    if(add.length) p.push('加 ' + add.join('、'));
    if(del.length) p.push('减 ' + del.join('、'));
    return p.join('；');
  }
  function familyPage(params, seg){
    const fams = families();
    if(!fams.length) return `<div class="view">数据未加载</div>`;
    const want = seg && seg[1] ? decodeURIComponent(seg[1]) : '';
    const cur = fams.find(x=>x.k===want) || fams[0];
    const base = cur.list[0];
    const h = hByName(cur.k);
    return `<div class="view">
      <div class="row" style="margin-bottom:12px"><a class="btn btn-sm" href="#/tools">← 工具台</a></div>
      <h1 style="font-size:25px">类方家族树</h1>
      <p style="font-size:13px;color:var(--muted);margin-top:4px">同一味君药底下的方，是一家人：抓住君药，就能顺藤摸瓜记住一串方</p>
      <div class="fam-wrap" style="margin-top:16px">
        <div class="fam-side">
          <div class="card" style="padding:12px 14px">
            <div class="mini" style="margin-bottom:6px">共 ${fams.length} 个家族 · 按方数排序</div>
            <div class="fam-list">
              ${fams.map(x=>`<a class="${x.k===cur.k?'on':''}" href="#/family/${encodeURIComponent(x.k)}">
                <b>${esc(x.k)}</b><span>${x.list.length} 首</span></a>`).join('')}
            </div>
          </div>
        </div>
        <div>
          <div class="card">
            <div class="between" style="margin-bottom:4px">
              <h4 style="font-size:16px">${esc(cur.k)}类方</h4>
              <span class="tag brand">${cur.list.length} 首</span>
            </div>
            <p class="mini">以「${esc(cur.k)}」为君药的方共 ${cur.list.length} 首。基础方按组成最少者取：<b>${esc(base.n)}</b>。</p>
            <div class="fam-tree">
              <div class="fam-root">
                <div class="fam-j">
                  <b>${esc(cur.k)}</b>
                  ${h?`<span>${esc(h.nat)}</span><em>${esc(h.eff.split('，').slice(0,2).join('，'))}</em>`:'<span>君药</span>'}
                </div>
                ${h?`<a class="btn btn-sm" href="#/herb/${encodeURIComponent(h.n)}">看这味药 →</a>`:''}
              </div>
              <div class="fam-kids">
                ${cur.list.map(f=>`<div class="fam-kid">
                  <div class="fam-kid-h">
                    <a href="#/formula/${encodeURIComponent(f.n)}">${esc(f.n)}</a>
                    <span class="tag">${esc(f.cat.split('·')[0])}</span>
                    ${f.cat.split('·')[1]?`<span class="tag" style="font-size:10px">${esc(f.cat.split('·')[1])}</span>`:''}
                    <span class="tag jade" style="font-size:10px">${f.c.length} 味</span>
                  </div>
                  <p class="fam-diff">${f.n===base.n ? '基础方 · 其余方都从它加减而来' : esc(famDiff(base, f))}</p>
                  <p class="fam-ind">${esc(f.ind)}</p>
                </div>`).join('')}
              </div>
            </div>
          </div>
          <div class="card" style="margin-top:14px">
            <h4 style="font-size:14.5px;margin-bottom:6px">怎么用这张图</h4>
            <p style="font-size:12.4px;color:var(--ink-2);line-height:1.9">
              ① 先记基础方的君臣佐使；<br>
              ② 再看每个「加减方」多了哪味、少了哪味——多出来的那味，往往就是它主治变化的钥匙；<br>
              ③ 反过来用：考试看到陌生方，先找君药，能猜出它属于哪一家。
            </p>
          </div>
        </div>
      </div>
    </div>`;
  }

  /* ================= 开方练习 ================= */
  let RX = null;
  const shuffle = a => { const x = a.slice(); for(let i=x.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [x[i],x[j]]=[x[j],x[i]]; } return x; };
  function pickFormula(){
    const pool = FM().filter(f=>f.c.length>=3 && f.c.length<=9 && f.c.every(x=>hByName(x.h) || (window.HB_ALIAS||{})[x.h]));
    return pool[Math.floor(Math.random()*pool.length)];
  }
  /* 方里可能写古名/别名（芍药、桂皮），统一成正名，才好在药材池里点 */
  const canon = n => hByName(n) ? n : ((window.HB_ALIAS||{})[n] || n);
  function newRx(){
    const f = pickFormula();
    const pairs = f.c.map(x=>({n: canon(x.h), r: x.r||'', raw: x.h, ga: x.ga||''}));
    const corr = [...new Set(pairs.map(p=>p.n))];
    const alias = window.HB_ALIAS || {};
    const isCorr = n => corr.includes(n) || corr.includes(alias[n]) || corr.some(c=>alias[c]===n);
    const decoys = shuffle(HB().map(h=>h.n).filter(n=>!isCorr(n) && !alias[n])).slice(0, 14);
    RX = { f, pairs, correct: corr, pool: shuffle([...corr, ...decoys]), pick: new Set(), done: false, score: 0, hint: false };
  }
  function rxScore(){
    const c = new Set(RX.correct);
    let right = 0, extra = 0;
    RX.pick.forEach(n=>{ if(c.has(n)) right++; else extra++; });
    const miss = RX.correct.filter(n=>!RX.pick.has(n));
    return { right, extra, miss, score: Math.max(0, Math.round((right - extra) * 100 / c.size)) };
  }
  function prescribePage(){
    if(!RX) newRx();
    const g = GAME.get();
    const f = RX.f;
    const res = RX.done ? rxScore() : null;
    return `<div class="view">
      <div class="row" style="margin-bottom:12px"><a class="btn btn-sm" href="#/tools">← 工具台</a><a class="btn btn-sm" href="#/puzzle">去拼图 →</a></div>
      <div class="between">
        <div>
          <h1 style="font-size:25px">开方练习</h1>
          <p style="font-size:13px;color:var(--muted);margin-top:4px">只看证候，自己组方：选对药、别多选，交卷后对照原方君臣佐使</p>
        </div>
        <div class="row" style="font-size:12.3px;color:var(--muted)">
          <span>已练 ${g.rxN} 次 · 合格 ${g.rxOk} 次</span>
          <button class="btn btn-sm" data-rx="new">换一首</button>
        </div>
      </div>

      <div class="card" style="margin-top:16px;border-left:3px solid var(--brand)">
        <div class="row" style="margin-bottom:6px">
          <span class="tag brand">证候</span>
          <span class="tag">共需 ${RX.correct.length} 味</span>
          ${RX.hint?`<span class="tag gold">答案是 ${esc(f.n)}</span>`:''}
        </div>
        <p style="font-size:14px;line-height:1.95">${esc(f.ind)}</p>
        ${RX.hint?`<p style="font-size:12.5px;color:var(--muted);margin-top:6px">功效：${esc(f.eff)}　·　${esc(f.cat)}</p>`:`<p style="font-size:12px;color:var(--muted);margin-top:6px">提示：先辨六经与寒热虚实，再想「君药是谁」。</p>`}
      </div>

      <div class="card" style="margin-top:14px">
        <div class="between" style="margin-bottom:8px">
          <h4 style="font-size:15px">我的方　<span style="color:var(--brand)">${RX.pick.size}</span> / ${RX.correct.length} 味</h4>
          <div class="row">
            ${RX.hint?'':`<button class="btn btn-sm" data-rx="hint">看提示</button>`}
            <button class="btn btn-sm btn-primary" data-rx="submit" ${RX.done||!RX.pick.size?'disabled':''}>交卷</button>
          </div>
        </div>
        <div class="rx-picked">
          ${RX.pick.size ? [...RX.pick].map(n=>`<button class="rx-chip on" data-rx-un="${esc(n)}">${esc(n)}<i>×</i></button>`).join('')
            : '<span class="mini">从下面挑药材，点一下加入，再点一下移除。</span>'}
        </div>
      </div>

      <div class="card" style="margin-top:14px">
        <div class="between" style="margin-bottom:8px">
          <h4 style="font-size:15px">药材池</h4>
          <span class="mini">含干扰项</span>
        </div>
        <div class="rx-pool">
          ${RX.pool.map(n=>`<button class="rx-chip ${RX.pick.has(n)?'on':''}" data-rx-add="${esc(n)}">${esc(n)}</button>`).join('')}
        </div>
      </div>

      ${res?`<div class="card" style="margin-top:14px;border-color:${res.score>=80?'var(--jade)':'var(--line)'}">
        <div class="between" style="margin-bottom:8px">
          <h4 style="font-size:15.5px">得分 ${res.score} 分　${res.score>=80?'过关 🎉':'再想想'}</h4>
          <a class="btn btn-sm" href="#/formula/${encodeURIComponent(f.n)}">看原方与方解 →</a>
        </div>
        <p style="font-size:13.4px"><b style="font-family:var(--serif);font-size:16px;color:var(--brand)">${esc(f.n)}</b>　<span class="tag">${esc(f.cat)}</span></p>
        <div class="rx-diff">
          <div><b>应选</b><span>${RX.pairs.map(p=>`<i class="${RX.pick.has(p.n)?'ok':'miss'}">${esc(p.n)}<em>${esc(p.r)}</em></i>`).join('')}</span></div>
          ${res.miss.length?`<div><b>漏选</b><span>${res.miss.map(n=>`<i class="miss">${esc(n)}</i>`).join('')}</span></div>`:''}
          ${res.extra?`<div><b>多选</b><span>${[...RX.pick].filter(n=>!RX.correct.includes(n)).map(n=>`<i class="bad">${esc(n)}</i>`).join('')}</span></div>`:''}
        </div>
        <div class="row" style="margin-top:10px"><button class="btn btn-sm btn-dark" data-rx="new">再来一首</button></div>
      </div>`:''}
    </div>`;
  }
  function bindPrescribe(){
    document.querySelectorAll('[data-rx]').forEach(b=>{
      b.onclick = ()=>{
        const k = b.dataset.rx;
        if(k==='new'){ newRx(); A().route(); return; }
        if(k==='hint'){ RX.hint = true; A().route(); return; }
        if(k==='submit' && !RX.done){
          const s = rxScore();
          RX.done = true; RX.score = s.score;
          GAME.add('rx', s.score>=80);
          A().route();
        }
      };
    });
    document.querySelectorAll('[data-rx-add]').forEach(b=>b.onclick = ()=>{
      if(RX.done) return;
      const n = b.dataset.rxAdd;
      if(RX.pick.has(n)) RX.pick.delete(n); else RX.pick.add(n);
      A().route();
    });
    document.querySelectorAll('[data-rx-un]').forEach(b=>b.onclick = ()=>{
      if(RX.done) return;
      RX.pick.delete(b.dataset.rxUn);
      A().route();
    });
  }

  /* ================= 方剂拼图 ================= */
  let PZ = null;
  function newPz(){
    const f = pickFormula();
    const pairs = f.c.map(x=>({n: canon(x.h), r: x.r||''}));
    const corr = [...new Set(pairs.map(p=>p.n))];
    const alias = window.HB_ALIAS || {};
    const isCorr = n => corr.includes(n) || corr.includes(alias[n]) || corr.some(c=>alias[c]===n);
    const decoys = shuffle(HB().map(h=>h.n).filter(n=>!isCorr(n) && !alias[n])).slice(0, 6);
    PZ = { f, pairs, correct: corr, tiles: shuffle([...corr, ...decoys]), sel: new Set(), done: false, score: 0 };
  }
  function pzResult(){
    const c = new Set(PZ.correct);
    let right = 0;
    PZ.sel.forEach(n=>{ if(c.has(n)) right++; });
    const wrong = PZ.sel.size - right;
    const miss = PZ.correct.length - right;
    return { right, wrong, miss, score: Math.max(0, Math.round((right - wrong) * 100 / PZ.correct.length)) };
  }
  function puzzlePage(){
    if(!PZ) newPz();
    const g = GAME.get();
    const f = PZ.f, res = PZ.done ? pzResult() : null;
    return `<div class="view">
      <div class="row" style="margin-bottom:12px"><a class="btn btn-sm" href="#/tools">← 工具台</a><a class="btn btn-sm" href="#/prescribe">去开方 →</a></div>
      <div class="between">
        <div>
          <h1 style="font-size:25px">方剂拼图</h1>
          <p style="font-size:13px;color:var(--muted);margin-top:4px">给你方名与功效，把组成拼出来；干扰项只差一味，别手快</p>
        </div>
        <div class="row" style="font-size:12.3px;color:var(--muted)">
          <span>已拼 ${g.pzN} 次 · 满分 ${g.pzPerfect} 次</span>
          <button class="btn btn-sm" data-pz="new">换一首</button>
        </div>
      </div>

      <div class="card" style="margin-top:16px;text-align:center;padding:22px 18px">
        <div class="tag brand" style="margin-bottom:6px">${esc(f.cat)}</div>
        <h2 style="font-size:26px;font-family:var(--serif)">${esc(f.n)}</h2>
        <p style="font-size:12.6px;color:var(--muted);margin-top:4px">${esc(f.eff)}</p>
        <p style="font-size:12.4px;color:var(--ink-2);margin-top:8px;line-height:1.9;max-width:620px;margin-left:auto;margin-right:auto">${esc(f.ind)}</p>
        <div class="row" style="justify-content:center;margin-top:10px">
          <span class="tag">应拼 ${PZ.correct.length} 味</span>
          <span class="tag ${PZ.sel.size?'brand':''}">已选 ${PZ.sel.size} 味</span>
        </div>
      </div>

      <div class="card" style="margin-top:14px">
        <div class="between" style="margin-bottom:8px">
          <h4 style="font-size:15px">药片</h4>
          <div class="row">
            <button class="btn btn-sm" data-pz="submit" ${PZ.done||!PZ.sel.size?'disabled':''}>交卷</button>
            <button class="btn btn-sm" data-pz="new">换一首</button>
          </div>
        </div>
        <div class="pz-tiles">
          ${PZ.tiles.map(n=>{
            const on = PZ.sel.has(n);
            let mark = '';
            if(PZ.done){
              const good = PZ.correct.includes(n);
              if(on && good) mark = 'ok';
              else if(on && !good) mark = 'bad';
              else if(!on && good) mark = 'miss';
            }
            return `<button class="pz-tile ${on?'on':''} ${mark}" data-pz-tile="${esc(n)}">${esc(n)}${mark==='ok'?'<i>✓</i>':mark==='bad'?'<i>×</i>':mark==='miss'?'<i>!</i>':''}</button>`;
          }).join('')}
        </div>
        ${res?`<div class="pz-res">
          <b>${res.score} 分</b>
          <span>对 ${res.right} 味${res.wrong?` · 多选 ${res.wrong} 味`:''}${res.miss?` · 漏选 ${res.miss} 味`:''}</span>
          <a class="btn btn-sm" href="#/formula/${encodeURIComponent(f.n)}">看方解 →</a>
        </div>
        <div class="pz-song">${esc((window.SONGS||[]).find(s=>s.n===f.n)?.s || '')}</div>`:''}
      </div>
    </div>`;
  }
  function bindPuzzle(){
    document.querySelectorAll('[data-pz]').forEach(b=>{
      b.onclick = ()=>{
        const k = b.dataset.pz;
        if(k==='new'){ newPz(); A().route(); return; }
        if(k==='submit' && !PZ.done){
          const r = pzResult();
          PZ.done = true; PZ.score = r.score;
          GAME.add('pz', r.score>=80);
          if(r.score===100) GAME.perfect();
          A().route();
        }
      };
    });
    document.querySelectorAll('[data-pz-tile]').forEach(b=>b.onclick = ()=>{
      if(PZ.done) return;
      const n = b.dataset.pzTile;
      if(PZ.sel.has(n)) PZ.sel.delete(n); else PZ.sel.add(n);
      A().route();
    });
  }

  /* ================= 注册 ================= */
  window.FEAT = {
    dailyQuote, originCard, sameNameCard, ixCard, caseCard, families, games: GAME.get, resetGames: GAME.reset
  };
  window.PAGES = Object.assign(window.PAGES || {}, {
    cases: casesPage, family: familyPage, prescribe: prescribePage, puzzle: puzzlePage
  });
  window.PAGE_BIND = Object.assign(window.PAGE_BIND || {}, {
    cases(){ renderCases(); const q = document.getElementById('csQ'); if(q) q.oninput = ()=>{ csQ = q.value; renderCases(); }; },
    prescribe: bindPrescribe,
    puzzle: bindPuzzle
  });
})();
