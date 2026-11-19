/* 中医术语白话词典 · 交互层（v2.15）
   1) 把正文中出现的术语自动标注为虚线可点词，鼠标移上去显示白话解释
   2) 点击术语在新标签页打开 #/term/<术语> 细看页
   3) #/term 词典总览：按分类筛选、搜索
*/
(function(){
  const A = () => window.APP || {};
  const esc = s => (A().esc || (x=>String(x==null?'':x)))(s);
  const list = window.TERMS || [];
  const BY = new Map();
  list.forEach(x=>{ if(x && x.t && !BY.has(x.t)) BY.set(x.t, x); });
  /* a 字段：同一概念的其他写法，也指向同一条解释 */
  const ALIAS = new Map();
  list.forEach(x=>{ (x.a||[]).forEach(w=>{ if(w && !BY.has(w)) ALIAS.set(w, x); }); });
  /* 长词优先，避免「中风」抢在「中风表虚」前面 */
  const WORDS = [...BY.keys(), ...ALIAS.keys()].sort((a,b)=>b.length-a.length);
  const RE = WORDS.length ? new RegExp(WORDS.map(w=>w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g') : null;
  const SKIP = new Set(['SCRIPT','STYLE','A','BUTTON','INPUT','TEXTAREA','CODE','PRE','SELECT','OPTION']);

  /* ---------- 正文标注 ---------- */
  function decorate(root){
    if(!root || !RE) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(n){
        if(!n.nodeValue || n.nodeValue.length < 2) return NodeFilter.FILTER_REJECT;
        const p = n.parentElement;
        if(!p || SKIP.has(p.tagName) || p.closest('.term') || p.closest('.term-tip')) return NodeFilter.FILTER_REJECT;
        return RE.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    RE.lastIndex = 0;
    const nodes = [];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n=>{
      const text = n.nodeValue;
      RE.lastIndex = 0;
      const frag = document.createDocumentFragment();
      let last = 0, m;
      while((m = RE.exec(text))){
        if(m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        const d = BY.get(m[0]) || ALIAS.get(m[0]);
        const a = document.createElement('a');
        a.className = 'term';
        a.href = '#/term/' + encodeURIComponent(m[0]);
        a.target = '_blank';
        a.rel = 'noopener';
        a.dataset.tip = (d ? d.m : '') + (d && d.k ? '\n辨证：' + d.k : '');
        a.textContent = m[0];
        frag.appendChild(a);
        last = m.index + m[0].length;
      }
      if(last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      if(last) n.parentNode.replaceChild(frag, n);
    });
  }

  /* ---------- 悬浮解释 ---------- */
  let tip = null;
  function hideTip(){ if(tip){ tip.remove(); tip = null; } }
  function showTip(html, x, y){
    hideTip();
    tip = document.createElement('div');
    tip.className = 'term-tip';
    tip.innerHTML = html.split('\n').map((s,i)=>`<div class="${i?'tt-k':''}">${esc(s)}</div>`).join('');
    document.body.appendChild(tip);
    const w = tip.offsetWidth, h = tip.offsetHeight;
    tip.style.left = Math.max(8, Math.min(window.innerWidth - w - 8, x + 14)) + 'px';
    tip.style.top = Math.max(8, y - h - 12) + 'px';
  }
  document.addEventListener('mouseover', e=>{
    const a = e.target.closest && e.target.closest('.term');
    if(a && a.dataset.tip) showTip(a.dataset.tip, e.clientX, e.clientY);
  });
  document.addEventListener('mousemove', e=>{
    if(tip){
      const w = tip.offsetWidth, h = tip.offsetHeight;
      tip.style.left = Math.max(8, Math.min(window.innerWidth - w - 8, e.clientX + 14)) + 'px';
      tip.style.top = Math.max(8, e.clientY - h - 12) + 'px';
    }
  });
  document.addEventListener('mouseout', e=>{
    const a = e.target.closest && e.target.closest('.term');
    if(a) hideTip();
  });
  document.addEventListener('click', e=>{ if(!e.target.closest || !e.target.closest('.term')) hideTip(); });

  /* ---------- 词典页 ---------- */
  let tQ = '', tCat = '全部';
  const CATS = ['全部', ...new Set(list.map(x=>x.c).filter(Boolean))];
  function termCard(x){
    return `<details class="tc" data-c="${esc(x.c||'术语')}" data-k="${esc(x.t + x.m + x.k)}">
      <summary><b>${esc(x.t)}</b><span class="tag">${esc(x.c||'术语')}</span></summary>
      <div class="tc-b">
        <p><b>白话：</b>${esc(x.m)}</p>
        <p><b>辨证眼目：</b>${esc(x.k)}</p>
        <a class="mini" href="#/term/${encodeURIComponent(x.t)}">单独打开这一条 →</a>
      </div>
    </details>`;
  }
  function pageTerms(params, seg){
    const one = seg && seg[1] ? decodeURIComponent(seg[1]) : '';
    if(one){
      const d = BY.get(one);
      if(!d) return `<div class="view"><div class="row"><a class="btn btn-sm" href="#/term">← 术语词典</a></div>
        <h1 style="font-size:25px;margin-top:14px">未收录「${esc(one)}」</h1>
        <p class="mini" style="margin-top:8px">词典还在扩充中，你可以在全站搜索里直接搜这个词。</p></div>`;
      const near = list.filter(x=>x!==d && x.c===d.c).slice(0,8);
      return `<div class="view">
        <div class="row" style="margin-bottom:14px">
          <a class="btn btn-sm" href="#/term">← 术语词典</a>
          <span class="tag brand">${esc(d.c||'术语')}</span>
          <a class="btn btn-sm" style="margin-left:auto" href="#/jiangji">去条文精讲里看它出现的地方 →</a>
        </div>
        <h1 style="font-size:31px;letter-spacing:.03em">${esc(d.t)}</h1>
        <div class="card" style="margin-top:16px">
          <h4 style="font-size:15px;color:var(--brand);margin-bottom:8px">用现在的话说</h4>
          <p style="font-size:15px;line-height:2">${esc(d.m)}</p>
        </div>
        <div class="card" style="margin-top:14px">
          <h4 style="font-size:15px;color:var(--jade);margin-bottom:8px">辨证眼目 · 什么症状算它</h4>
          <p style="font-size:14px;line-height:2">${esc(d.k)}</p>
        </div>
        ${near.length?`<div class="sec" style="margin-top:20px"><h2 style="font-size:17px">同类术语</h2></div>
          <div class="row" style="flex-wrap:wrap;gap:8px">${near.map(x=>`<a class="btn btn-sm" href="#/term/${encodeURIComponent(x.t)}">${esc(x.t)}</a>`).join('')}</div>`:''}
        <p class="mini" style="margin-top:20px;line-height:1.9">本词典为教材内容的口语化改写，帮助读懂古文与术语，不构成诊断或治疗建议。</p>
      </div>`;
    }
    return `<div class="view">
      <div class="row" style="margin-bottom:12px"><a class="btn btn-sm" href="#/tools">← 工具台</a></div>
      <h1 style="font-size:26px">中医术语 · 白话词典</h1>
      <p class="mini" style="margin-top:6px">正文里带虚线下划线的词，鼠标移上去就有白话解释；点开是新页面。共 ${list.length} 条。</p>
      <div class="card" style="margin-top:14px;padding:12px 15px">
        <input id="tqQ" class="ix-q" placeholder="搜术语或白话，如「谵语」「肝阳上亢」「气滞」" value="${esc(tQ)}">
        <div class="chips" id="tqCat" style="margin-top:9px">${CATS.map(c=>`<button class="chip ${tCat===c?'on':''}" data-c="${esc(c)}">${esc(c)}</button>`).join('')}</div>
        <div class="mini" id="tqCount" style="margin-top:9px"></div>
      </div>
      <div id="tqList" style="margin-top:14px">${list.map(termCard).join('')}</div>
      <div id="tqEmpty" class="card" style="display:none;text-align:center;color:var(--muted)">没有匹配的术语，换个词试试</div>
    </div>`;
  }
  function bindTerms(){
    const q = document.getElementById('tqQ'), box = document.getElementById('tqList');
    if(!q || !box) return;
    const apply = ()=>{
      tQ = q.value.trim();
      let n = 0;
      [...box.querySelectorAll('.tc')].forEach(el=>{
        const hit = (tCat==='全部' || el.dataset.c===tCat) && (!tQ || (el.dataset.k||'').toLowerCase().includes(tQ.toLowerCase()));
        el.hidden = !hit; if(hit) n++;
      });
      const c = document.getElementById('tqCount');
      if(c) c.textContent = `共 ${n} 条`;
      const e = document.getElementById('tqEmpty');
      if(e) e.style.display = n ? 'none' : 'block';
    };
    q.oninput = apply;
    const cats = document.getElementById('tqCat');
    if(cats) cats.onclick = e=>{
      const b = e.target.closest('.chip'); if(!b) return;
      tCat = b.dataset.c;
      [...cats.querySelectorAll('.chip')].forEach(x=>x.classList.toggle('on', x===b));
      apply();
    };
    apply();
  }

  window.PAGES = window.PAGES || {};
  window.PAGES.term = pageTerms;
  window.PAGE_BIND = window.PAGE_BIND || {};
  window.PAGE_BIND.term = bindTerms;
  window.TERMUI = { decorate, hideTip, count: list.length };
})();
