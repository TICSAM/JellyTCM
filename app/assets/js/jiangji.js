/* ================= 《伤寒论》条文精讲 · 阅读页 =================
   一条一条地读：原文 → 白话 → 辨证眼目 → 用药与误治 → 病案 → 一句话记忆。
   数据见 data/jiangji-*.js（键名与 data/shanghan.js 的条文编号一一对应）。
*/
(function(){
  const A = () => window.APP || {};
  const esc = s => (A().esc || (x=>String(x==null?'':x)))(s);
  const JJ = () => window.JJ || {};
  const SH = () => window.SHANGHAN || [];

  const ORDER = ['太阳上','太阳中','太阳下','阳明','少阳','太阴','少阴','厥阴','霍乱','差后'];
  const TITLE = {
    '太阳上':'辨太阳病脉证并治 · 上',
    '太阳中':'辨太阳病脉证并治 · 中',
    '太阳下':'辨太阳病脉证并治 · 下',
    '阳明':'辨阳明病脉证并治',
    '少阳':'辨少阳病脉证并治',
    '太阴':'辨太阴病脉证并治',
    '少阴':'辨少阴病脉证并治',
    '厥阴':'辨厥阴病脉证并治',
    '霍乱':'辨霍乱病脉证并治',
    '差后':'辨阴阳易差后劳复病脉证并治'
  };

  let q = '', book = '全部';

  /* 方名 → 可点链接；方名不存在的（如热利条无方）原样输出 */
  function fangLink(name){
    if(!name) return '';
    const by = (A().FM_BY || {});
    const has = !!by[name];
    return has
      ? `<a class="jj-fang" href="#/formula/${encodeURIComponent(name)}">${esc(name)}</a>`
      : `<span class="jj-fang nolink">${esc(name)}</span>`;
  }

  function itemHTML(x, dupOf){
    const d = JJ()[x.n];
    if(!d) return '';
    /* 同一段原文在书中两处重出（如大柴胡条），第二次只给指路，不重复展开 */
    if(dupOf){
      return `<article class="jj-item dup" id="jj-${esc(x.n)}">
        <div class="jj-hd">
          <span class="jj-no">${esc(x.n)}</span>
          ${x.tag?`<span class="tag">${esc(x.tag)}</span>`:''}
          ${x.f?fangLink(x.f):''}
        </div>
        <p class="jj-yuan">${esc(x.t)}</p>
        <p class="jj-dup">同文重出，讲解见 <a href="#/jiangji?p=${encodeURIComponent(dupOf.b)}&n=${encodeURIComponent(dupOf.n)}">${esc(dupOf.n)}</a></p>
      </article>`;
    }
    const rows = [];
    if(d.yi) rows.push(['白话', d.yi]);
    if(d.yao) rows.push(['辨证眼目', d.yao]);
    if(d.wu) rows.push(['用药与误治', d.wu]);
    return `<article class="jj-item" id="jj-${esc(x.n)}">
      <div class="jj-hd">
        <span class="jj-no">${esc(x.n)}</span>
        ${x.tag?`<span class="tag">${esc(x.tag)}</span>`:''}
        ${x.f?fangLink(x.f):''}
      </div>
      <p class="jj-yuan">${esc(x.t)}</p>
      <div class="jj-body">
        ${rows.map(([k,v])=>`<div class="jj-row"><span class="jj-k">${k}</span><span class="jj-v">${esc(v)}</span></div>`).join('')}
        ${d.an?`<div class="jj-an"><b>病案示例</b>${esc(d.an)}</div>`:''}
        ${d.key?`<div class="jj-key">记：${esc(d.key)}</div>`:''}
      </div>
    </article>`;
  }

  function jiangjiPage(params){
    const all = SH();
    const books = ['全部', ...ORDER.filter(b=>all.some(x=>x.b===b))];
    const qq = (params.get('q') || q || '').trim();
    const pb = params.get('p');
    if(pb && books.includes(pb)) book = pb;

    let list = all.filter(x=>{
      if(book!=='全部' && x.b!==book) return false;
      if(!qq) return true;
      const d = JJ()[x.n] || {};
      return (x.t + (x.f||'') + (x.tag||'') + (d.yi||'') + (d.yao||'') + (d.wu||'') + (d.an||'') + (d.key||'')).indexOf(qq) >= 0;
    });

    /* 按篇分组，保持顺序 */
    const groups = [];
    list.forEach(x=>{
      let g = groups.find(v=>v.b===x.b);
      if(!g){ g = {b:x.b, items:[]}; groups.push(g); }
      g.items.push(x);
    });
    const withFang = all.filter(x=>x.f).length;
    /* 同文重出检测：同一段原文在书中出现两次时，正文归到"后出"的那一篇（宋本正位），
       先出的一篇只留指路，避免同一段话读两遍 */
    const normT = t => String(t).replace(/[，。；：、！？…\s（）]/g,'').slice(0,26);
    const rank = b => { const i = ORDER.indexOf(b); return i < 0 ? 0 : i; };
    const canon = new Map();
    list.forEach(x=>{
      const k = normT(x.t), cur = canon.get(k);
      if(!cur || rank(x.b) > rank(cur.b)) canon.set(k, x);
    });

    return `<div class="view">
      <div class="row" style="margin-bottom:12px">
        <a class="btn btn-sm" href="#/shanghan">原文索引</a>
        <a class="btn btn-sm" href="#/theory">六经辨证</a>
        <a class="btn btn-sm" href="#/tools">← 工具台</a>
      </div>
      <div class="between">
        <div>
          <h1 style="font-size:25px">《伤寒论》条文精讲</h1>
          <p style="font-size:12.8px;color:var(--muted);margin-top:4px">
            已精讲 <b style="color:var(--brand)">${Object.keys(JJ()).length}</b> 条 / 共 ${all.length} 条 ·
            其中 <b style="color:var(--brand)">${withFang}</b> 条有方可循 ·
            白话 · 辨证眼目 · 用药与误治 · 病案 · 一句话记忆
          </p>
        </div>
        <input id="jjQ" placeholder="搜原文 / 方名 / 症状 / 白话…" value="${esc(qq)}" class="sh-search">
      </div>

      <div class="chips" style="margin-top:14px" id="jjB">
        ${books.map(b=>`<button class="chip ${book===b?'on':''}" data-b="${esc(b)}">${esc(b==='全部'?'全部':b+'篇')}</button>`).join('')}
      </div>

      <div class="card jj-note">
        <p>读法建议：先看<b>原文</b>，自己试着断句、抓症状；再看<b>辨证眼目</b>，核对你想的和它说的是不是一回事；最后看<b>用药与误治</b>，把"什么时候不能用"记牢——背书背的是方，临床靠的是禁忌。<b>病案示例</b>是依该条证候编拟的练习，不是真实病例。</p>
        <p style="margin-top:6px">全书 398 条（宋本），本站收录 170 条精要条文并逐条讲解，未收者多为重复论述、死证与针灸条文。讲解依通行义理，仅供学习复习，<b>不构成诊疗建议</b>。</p>
      </div>

      ${groups.length ? groups.map(g=>`
        <section class="jj-sec">
          <h2 class="jj-sec-t">${esc(TITLE[g.b] || g.b)}<span>${g.items.length} 条</span></h2>
          ${g.items.map(x=>{ const f = canon.get(normT(x.t)); return itemHTML(x, (f && f.n!==x.n) ? f : null); }).join('')}
        </section>`).join('')
        : `<div class="card" style="text-align:center;color:var(--muted);margin-top:16px">没有匹配的条文，换个关键词试试</div>`}

      <div class="row" style="margin-top:18px;justify-content:center">
        <button class="btn btn-sm" id="jjRand">随机抽一条，考考自己</button>
      </div>
    </div>`;
  }

  function bindJiangji(params){
    const qi = document.getElementById('jjQ');
    if(qi) qi.oninput = ()=>{
      q = qi.value;
      book = '全部';          /* 一搜索就跨全篇找，不然会误以为"搜不到" */
      window.APP.route();
      const n = document.getElementById('jjQ');
      if(n){ n.focus(); n.setSelectionRange(n.value.length, n.value.length); }
    };
    document.querySelectorAll('#jjB .chip').forEach(b=>b.onclick=()=>{
      book = b.dataset.b; q = '';
      location.hash = '#/jiangji' + (book==='全部'?'':'?p='+encodeURIComponent(book));
      window.APP.route();
    });
    const rb = document.getElementById('jjRand');
    if(rb) rb.onclick = ()=>{
      const all = SH();
      if(!all.length) return;
      const x = all[Math.floor(Math.random()*all.length)];
      location.hash = '#/jiangji?p='+encodeURIComponent(x.b)+'&n='+encodeURIComponent(x.n);
      window.APP.route();
      setTimeout(()=>{
        const el = document.getElementById('jj-'+x.n);
        if(el){ el.scrollIntoView({block:'center',behavior:'smooth'}); el.classList.add('flash'); setTimeout(()=>el.classList.remove('flash'),1400); }
      }, 60);
    };
    /* 深链：?n=条文编号 时滚到该条 */
    const target = params.get('n');
    if(target){
      setTimeout(()=>{
        const el = document.getElementById('jj-'+target);
        if(el){ el.scrollIntoView({block:'center'}); el.classList.add('flash'); setTimeout(()=>el.classList.remove('flash'),1400); }
      }, 80);
    }
  }

  window.PAGES = Object.assign(window.PAGES||{}, { jiangji: jiangjiPage });
  window.PAGE_BIND = Object.assign(window.PAGE_BIND||{}, { jiangji: bindJiangji });
})();
