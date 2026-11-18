/* ================= 扩展页面（二）：原文 / 十八反 / 时间轴 / 热力图 / 盲盒 / 默写 ================= */
(function(){
  const A = () => window.APP || {};
  const esc = s => (A().esc || (x=>String(x==null?'':x)))(s);

  /* ---------- 《伤寒论》原文索引 ---------- */
  let shQ = '', shB = '全部', shPage = 0;
  function shanghan(){
    const SH = window.SHANGHAN || [];
    const books = ['全部', ...new Set(SH.map(x=>x.b))];
    const q = shQ.trim();
    let list = SH.filter(x=>{
      if(shB!=='全部' && x.b!==shB) return false;
      if(!q) return true;
      return (x.t + (x.f||'') + (x.tag||'')).indexOf(q) >= 0;
    });
    const PER = 40, pages = Math.max(1, Math.ceil(list.length/PER));
    shPage = Math.min(shPage, pages-1);
    const view = list.slice(shPage*PER, shPage*PER+PER);
    return `<div class="view">
      <div class="row" style="margin-bottom:12px"><a class="btn btn-sm" href="#/tools">← 工具台</a></div>
      <div class="between">
        <div><h1 style="font-size:25px">《伤寒论》原文索引</h1>
          <p style="font-size:12.8px;color:var(--muted);margin-top:4px">已收录 <b style="color:var(--brand)">${SH.length}</b> 条精要条文 · 依宋本通行文字 · 编号为本站「篇·序」，非宋本条号</p></div>
        <input id="shQ" placeholder="搜原文 / 方名 / 症状…" value="${esc(q)}" class="sh-search">
      </div>
      <div class="chips" style="margin-top:14px" id="shB">
        ${books.map(b=>`<button class="chip ${shB===b?'on':''}" data-b="${esc(b)}">${esc(b)}</button>`).join('')}
      </div>
      <div class="card" style="margin-top:14px;padding:10px 15px;background:var(--card-2)">
        <p style="font-size:11.8px;color:var(--muted);line-height:1.8">全书 398 条（宋本），本站按「辨证要点 + 有方可用」的标准精选精要条文逐条校录，未收的条文多为重复论述、死证与针灸条文。所有文字均据通行宋本，不做改写。</p>
      </div>
      <div class="sh-list" style="margin-top:14px">
        ${view.map(x=>`<div class="sh-item">
          <div class="sh-meta"><span class="sh-no">${esc(x.n)}</span>${x.tag?`<span class="tag">${esc(x.tag)}</span>`:''}${x.f?`<a class="sh-f" href="#/formula/${encodeURIComponent(x.f)}">${esc(x.f)}</a>`:''}</div>
          <p class="sh-t">${esc(x.t)}</p>
        </div>`).join('') || '<div class="card" style="text-align:center;color:var(--muted)">没有匹配的条文</div>'}
      </div>
      ${pages>1?`<div class="pager">
        <button class="btn btn-sm" id="shPrev" ${shPage===0?'disabled':''}>← 上一页</button>
        <span>${shPage+1} / ${pages}</span>
        <button class="btn btn-sm" id="shNext" ${shPage>=pages-1?'disabled':''}>下一页 →</button>
      </div>`:''}
    </div>`;
  }
  function bindShanghan(){
    const q = document.getElementById('shQ');
    if(q) q.oninput = ()=>{ shQ = q.value; shPage = 0; window.APP.route(); };
    document.querySelectorAll('#shB .chip').forEach(b=>b.onclick=()=>{ shB=b.dataset.b; shPage=0; window.APP.route(); });
    const p = document.getElementById('shPrev'), n = document.getElementById('shNext');
    if(p) p.onclick = ()=>{ shPage=Math.max(0,shPage-1); window.APP.route(); };
    if(n) n.onclick = ()=>{ shPage++; window.APP.route(); };
  }

  /* ---------- 十八反 / 十九畏 ---------- */
  function safety(){
    const S = window.SAFETY; if(!S) return '<div class="view">数据未加载</div>';
    return `<div class="view">
      <div class="row" style="margin-bottom:12px"><a class="btn btn-sm" href="#/tools">← 工具台</a></div>
      <h1 style="font-size:25px">配伍禁忌 · 十八反 / 十九畏</h1>
      <p style="font-size:13px;color:var(--muted);margin-top:4px">背方之前先背禁忌——用错一味，整方皆废；页面下半部分是中药与西药同服的相互作用速查</p>
      <div class="card" style="margin-top:14px;padding:12px 15px;background:var(--card-2)">
        <p style="font-size:12.4px;line-height:1.9;color:var(--ink-2)">${S.note}</p>
      </div>
      <div class="card" style="margin-top:14px">
        <h4 style="font-size:15.5px;margin-bottom:10px">十八反 · 三组</h4>
        <div class="fan-list">
          ${S.fan.map(x=>`<div class="fan-row">
            <div class="fan-a">${esc(x.a)}</div>
            <div class="fan-b"><i>反</i>${x.b.map(n=>`<span class="fan-tag">${esc(n)}</span>`).join('')}</div>
            <div class="fan-s"><b>${esc(x.s)}</b><p>${esc(x.d)}</p></div>
          </div>`).join('')}
        </div>
      </div>
      <div class="card" style="margin-top:14px">
        <h4 style="font-size:15.5px;margin-bottom:10px">十九畏 · 九对</h4>
        <div class="tbl-wrap"><table class="tbl">
          <thead><tr><th style="width:120px">药 A</th><th style="width:120px">畏</th><th>说明</th></tr></thead>
          <tbody>${S.wei.map(x=>`<tr><td><b style="font-family:var(--serif)">${esc(x.a)}</b></td><td style="color:var(--danger)">畏 ${esc(x.b)}</td><td style="color:var(--ink-2)">${esc(x.d)}</td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="card" style="margin-top:14px">
        <h4 style="font-size:15.5px;margin-bottom:8px">交互核对：两味药能不能一起用</h4>
        <div class="safe-check">
          <select id="sx1">${(A().HB||[]).map(h=>`<option>${esc(h.n)}</option>`).join('')}</select>
          <span class="plus">+</span>
          <select id="sx2">${(A().HB||[]).map(h=>`<option>${esc(h.n)}</option>`).join('')}</select>
          <button class="btn btn-sm btn-dark" id="sxGo">核对</button>
        </div>
        <div id="sxOut" class="sx-out">选两味药，看是否属十八反、十九畏或妊娠禁忌。</div>
        <p style="font-size:11.4px;color:var(--muted);margin-top:8px;line-height:1.75">
          核对时按古今药名与同类药自动归组：<b>附子 / 川乌 / 草乌 → 乌头</b>，<b>栝蒌 / 天花粉 → 瓜蒌</b>，
          <b>川贝母 / 浙贝母 → 贝母</b>，<b>白芍 / 赤芍 → 芍药</b>，<b>芒硝 / 玄明粉 → 朴硝</b>。
        </p>
      </div>
      <div class="card" style="margin-top:14px">
        <h4 style="font-size:15.5px;margin-bottom:8px">妊娠用药禁忌</h4>
        <div class="preg-line"><b>禁用</b><div class="chips">${S.pregBan.map(n=>`<span class="tag" style="border-color:var(--danger);color:var(--danger)">${esc(n)}</span>`).join('')}</div></div>
        <div class="preg-line" style="margin-top:10px"><b>慎用</b><div class="chips">${S.pregCare.map(n=>`<span class="tag">${esc(n)}</span>`).join('')}</div></div>
        <p style="font-size:12px;color:var(--muted);margin-top:10px;line-height:1.85">${S.pregNote}</p>
      </div>
      ${window.FEAT ? window.FEAT.ixCard() : ''}
    </div>`;
  }
  function bindSafety(){
    const S = window.SAFETY; if(!S) return;
    const b = document.getElementById('sxGo');
    if(!b) return;
    const EQ = S.equiv || {};
    const norm = n => String(n).replace(/[（(][^）)]*[）)]/g, '').trim();
    // 一味药展开成「同名组」：自身 + 括号前主体 + 所属组的全部成员
    const groupOf = n => {
      const base = norm(n), out = [n, base];
      if(EQ[base]) out.push(...EQ[base]);
      Object.keys(EQ).forEach(k=>{
        if(EQ[k].includes(base) || EQ[k].includes(n)) out.push(k, ...EQ[k]);
      });
      return [...new Set(out.filter(Boolean))];
    };
    const inGroup = (n, list) => list.some(x => groupOf(x).includes(n) || groupOf(x).includes(norm(n)));

    b.onclick = ()=>{
      const a = document.getElementById('sx1').value, c = document.getElementById('sx2').value;
      const out = document.getElementById('sxOut');
      if(a === c){
        out.innerHTML = '<div class="sx-ok">同一味药，不必核对。</div>';
        return;
      }
      const hits = [];
      S.fan.forEach(g=>{
        const A = groupOf(g.a), B = g.b.flatMap(groupOf);
        if((A.includes(a) && B.includes(c)) || (A.includes(c) && B.includes(a)))
          hits.push(['十八反', `${g.a} 反 ${g.b.join('、')}`, `${a} 与 ${c} 同用，属十八反「${g.s}」。${g.d}`]);
      });
      S.wei.forEach(w=>{
        const A = String(w.a).split(/[、,，]/).flatMap(x=>groupOf(x.trim()));
        const B = String(w.b).split(/[、,，]/).flatMap(x=>groupOf(x.trim()));
        if((A.includes(a) && B.includes(c)) || (A.includes(c) && B.includes(a)))
          hits.push(['十九畏', `${w.a} 畏 ${w.b}`, `${a} 与 ${c} 同用，属十九畏。${w.d}`]);
      });
      let html = '';
      if(hits.length){
        html = hits.map(([k,t,d])=>`<div class="warn"><span class="ic">!</span><div class="tx"><b>${k}：${esc(t)}</b>${esc(d)}</div></div>`).join('');
      }else{
        html = `<div class="sx-ok">未见于十八反、十九畏。但「不相反」不等于「可以随便配」，还要看证候、剂量与煎法。</div>`;
      }
      const banA = inGroup(a, S.pregBan), banC = inGroup(c, S.pregBan);
      const careA = inGroup(a, S.pregCare), careC = inGroup(c, S.pregCare);
      if(banA || banC){
        html += `<div class="warn" style="margin-top:8px"><span class="ic">!</span><div class="tx"><b>妊娠禁用</b>${esc(banA?a:c)} 属妊娠禁用药物，孕妇不可用。</div></div>`;
      }else if(careA || careC){
        html += `<div class="warn sm" style="margin-top:8px"><span class="ic">!</span><div class="tx"><b>妊娠慎用</b>${esc(careA?a:c)} 属妊娠慎用药物，须由医师权衡。</div></div>`;
      }
      out.innerHTML = html;
    };
  }

  /* ---------- 煎服法时间轴 ---------- */
  function timeline(){
    const steps = [
      ['浸泡','冷水浸泡 30 分钟','让药材组织软化，有效成分易煎出。花叶类可短，根茎类宜长。','0 min'],
      ['先煎','先煮 20~30 分钟','矿石、贝壳、角甲类（石膏、牡蛎、龟甲）质地坚硬，须先煎；附子、乌头有毒，须先煎 1~2 小时至无麻感。','+30'],
      ['头煎','加水没过药材 2~3cm，武火煮沸后文火 20~30 分钟','解表药宜短（10~15 分钟），滋补药宜长（40~60 分钟）。','+30'],
      ['后下','头煎出锅前 5~10 分钟放入','薄荷、砂仁、钩藤、大黄等含挥发油或久煎失效的药。','-8'],
      ['包煎','纱布袋包好同煎','车前子、旋覆花、蒲黄、海金沙等细末、带绒毛或易糊锅的药。','全程'],
      ['另煎','单独煎 30~40 分钟，兑入药液','人参、西洋参等贵重药，避免有效成分被群药吸附。','单煎'],
      ['烊化','药液趁热溶化','阿胶、鹿角胶、龟甲胶等胶类，直接煎易粘锅糊底。','关火后'],
      ['冲服','用药液或温水冲开','三七粉、琥珀粉、朱砂、牛黄、麝香等粉状或贵重药。','服时'],
      ['二煎','再加水煎 20 分钟，与头煎混合','两煎混合后分服，浓度更均匀。','+20'],
      ['服法','温服，日 2~3 次','解表药服后温覆取微汗；补益药宜饭前；安神药宜睡前。','服']
    ];
    const feats = [
      ['解表药','武火速煎，沸后 10~15 分钟','取其气，久煎则挥发性成分散失'],
      ['滋补药','文火慢煎 40~60 分钟','取其味，久煎方出'],
      ['清热药','武火煎 15~20 分钟','防久煎破坏有效成分'],
      ['毒性药','先煎 1~2 小时','附子、乌头、细辛，以口尝无麻感为度'],
      ['胶类','烊化','阿胶、鹿角胶、龟甲胶'],
      ['贵重药','另煎或研末冲服','人参、虫草、羚羊角、麝香']
    ];
    return `<div class="view">
      <div class="row" style="margin-bottom:12px"><a class="btn btn-sm" href="#/tools">← 工具台</a></div>
      <h1 style="font-size:25px">煎服法时间轴</h1>
      <p style="font-size:13px;color:var(--muted);margin-top:4px">同一张方，煎法错了，效果差一半</p>
      <div class="tl">
        ${steps.map((s,i)=>`<div class="tl-row">
          <div class="tl-dot">${i+1}</div>
          <div class="tl-body">
            <div class="tl-h"><b>${esc(s[0])}</b><span class="tag">${esc(s[3])}</span></div>
            <p class="tl-s">${esc(s[1])}</p>
            <p class="tl-d">${esc(s[2])}</p>
          </div>
        </div>`).join('')}
      </div>
      <div class="card" style="margin-top:16px">
        <h4 style="font-size:15px;margin-bottom:10px">按药性选火候</h4>
        <div class="tbl-wrap"><table class="tbl">
          <thead><tr><th>药类</th><th>煎法</th><th>为什么</th></tr></thead>
          <tbody>${feats.map(f=>`<tr><td><b style="font-family:var(--serif)">${esc(f[0])}</b></td><td style="color:var(--brand)">${esc(f[1])}</td><td style="color:var(--muted)">${esc(f[2])}</td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="warn" style="margin-top:14px"><span class="ic">!</span>
        <div class="tx"><b>煎药器具</b>用砂锅、瓦罐或不锈钢锅，忌用铁锅、铝锅（金属离子会与鞣质、生物碱反应）。煎前不必反复水洗，以免水溶性成分流失。</div>
      </div>
    </div>`;
  }

  /* ---------- 学习热力图 + 掌握度雷达 ---------- */
  function heat(){
    const S = (A().Store||{}).state || {daily:{}, cards:{}};
    const FM = A().FM||[];
    const days = [];
    const today = new Date();
    const start = new Date(today.getTime() - 181*86400000);
    for(let i=0;i<182;i++){
      const d = new Date(start.getTime()+i*86400000);
      const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const v = S.daily[k] || {correct:0,wrong:0};
      days.push({k, n:(v.correct||0)+(v.wrong||0), d});
    }
    const max = Math.max(1, ...days.map(x=>x.n));
    const lvl = n => n===0?0 : n<=max*0.25?1 : n<=max*0.5?2 : n<=max*0.75?3 : 4;
    // 分周（7 列）
    const weeks = [];
    for(let i=0;i<days.length;i+=7) weeks.push(days.slice(i,i+7));
    // 雷达：按方剂分类（cat 形如「解表剂」「补益剂」，去掉「剂」字）
    const agg = {};
    FM.forEach(f=>{
      const c = S.cards[f.n]; if(!c || !c.seen) return;
      const g = String(f.cat || '其他').split('·')[0].replace(/剂$/, '') || '其他';
      if(!agg[g]) agg[g] = {seen:0, ok:0, box:0};
      agg[g].seen += c.seen; agg[g].ok += (c.correct||0); agg[g].box += (c.box||0);
    });
    const axes = Object.keys(agg).sort((a,b)=>agg[b].seen - agg[a].seen).slice(0,6);
    const radar = axes.length>=3 ? radarSVG(axes.map(k=>({k, v:Math.min(1, agg[k].ok/Math.max(1,agg[k].seen)*0.6 + agg[k].box/Math.max(1,agg[k].seen)/12*0.4)}))) : '';
    return `<div class="view">
      <div class="row" style="margin-bottom:12px"><a class="btn btn-sm" href="#/tools">← 工具台</a>
        <a class="btn btn-sm" href="#/data">数据与备份</a></div>
      <h1 style="font-size:25px">学习热力图 · 掌握度雷达</h1>
      <p style="font-size:13px;color:var(--muted);margin-top:4px">过去半年每天答了多少题；哪一类方剂你还没吃透</p>
      <div class="card" style="margin-top:14px">
        <div class="between" style="margin-bottom:10px"><h4 style="font-size:15px">答题热力图（近 26 周）</h4>
          <span class="tag">深色 = 答得多</span></div>
        <div class="heat-flex">
          <div class="heat-wrap"><div class="heat-grid">
            ${weeks.map(w=>`<div class="heat-col">${w.map(x=>`<i class="heat-cell lv${lvl(x.n)}" title="${x.k} · ${x.n} 题"></i>`).join('')}</div>`).join('')}
          </div></div>
          <div class="heat-side">
            <div><b>${days.reduce((a,b)=>a+b.n,0)}</b><span>累计题数</span></div>
            <div><b>${days.filter(x=>x.n>0).length}</b><span>有记录天数</span></div>
            <div><b>${longestStreak(days)}</b><span>最长连续</span></div>
          </div>
        </div>
        <div class="heat-legend"><span>少</span>${[0,1,2,3,4].map(i=>`<i class="heat-cell lv${i}"></i>`).join('')}<span>多</span></div>
      </div>
      <div class="card" style="margin-top:14px">
        <h4 style="font-size:15px;margin-bottom:6px">掌握度雷达</h4>
        ${radar || `<p style="font-size:12.6px;color:var(--muted);line-height:1.85">还没有足够的答题记录。去「练习」答上几组题，这里就会按方剂分类画出你的强弱。</p>`}
        ${axes.length>=3?`<div class="chips" style="margin-top:10px">${axes.map(k=>`<span class="tag">${esc(k)}　${Math.round(agg[k].ok/Math.max(1,agg[k].seen)*100)}%</span>`).join('')}</div>`:''}
        <p style="font-size:11.6px;color:var(--muted);margin-top:8px;line-height:1.8">掌握度 = 正确率 × 0.6 + 记忆层级 × 0.4。越靠外的方向，你越熟。</p>
      </div>
    </div>`;
  }
  function longestStreak(days){
    let best = 0, cur = 0;
    days.forEach(d=>{ if(d.n>0){ cur++; if(cur>best) best = cur; } else cur = 0; });
    return best;
  }
  function radarSVG(data){
    const cx=150, cy=140, R=96, n=data.length;
    const pt = (i, r)=>{ const a = -Math.PI/2 + i*2*Math.PI/n; return [cx+Math.cos(a)*r, cy+Math.sin(a)*r]; };
    const rings = [0.25,0.5,0.75,1].map(k=>
      `<polygon points="${Array.from({length:n},(_,i)=>pt(i,R*k).join(',')).join(' ')}" fill="none" stroke="var(--line)" stroke-width="1"/>`).join('');
    const axes = Array.from({length:n},(_,i)=>{
      const p = pt(i,R);
      return `<line x1="${cx}" y1="${cy}" x2="${p[0]}" y2="${p[1]}" stroke="var(--line-2)" stroke-width="1"/>`;
    }).join('');
    const poly = data.map((d,i)=>pt(i, Math.max(8, R*d.v)).join(',')).join(' ');
    const labels = data.map((d,i)=>{
      const p = pt(i, R+22);
      return `<text x="${p[0]}" y="${p[1]}" text-anchor="middle" font-size="10.5" fill="var(--muted)" font-family="var(--mono)">${esc(d.k)}</text>`;
    }).join('');
    return `<svg viewBox="0 0 300 290" style="width:100%;max-width:340px;height:auto;display:block;margin:0 auto">
      ${rings}${axes}
      <polygon points="${poly}" fill="var(--brand)" fill-opacity=".22" stroke="var(--brand)" stroke-width="1.8"/>
      ${data.map((d,i)=>{const p=pt(i,Math.max(8,R*d.v));return `<circle cx="${p[0]}" cy="${p[1]}" r="3" fill="var(--brand)"/>`;}).join('')}
      ${labels}
    </svg>`;
  }

  /* ---------- 盲盒抽方 ---------- */
  let rndF = null, rndT = 30, rndTimer = null, rndShow = false;
  function randomPage(){
    const FM = A().FM||[];
    if(!rndF) rndF = FM[Math.floor(Math.random()*FM.length)];
    const song = (A().SONGS||[]).find(s=>s.n===rndF.n);
    return `<div class="view">
      <div class="row" style="margin-bottom:12px"><a class="btn btn-sm" href="#/tools">← 工具台</a></div>
      <h1 style="font-size:25px">盲盒抽方</h1>
      <p style="font-size:13px;color:var(--muted);margin-top:4px">随机掉一首方，给你 30 秒，先在心里默一遍组成</p>
      <div class="card rnd-box" style="margin-top:16px">
        <div class="rnd-timer" id="rndTimer">${rndShow? '已揭晓' : rndT+'s'}</div>
        <h2 class="rnd-name">${esc(rndF.n)}</h2>
        <p class="rnd-cat">${esc(rndF.cat||'')}　·　${esc(rndF.book||'')}</p>
        ${rndShow?`<div class="rnd-ans">
          <div class="chips" style="justify-content:center">${rndF.c.map(x=>`<span class="tag ${x.r==='君'?'brand':''}">${esc(x.h)}${x.r?'·'+esc(x.r):''}</span>`).join('')}</div>
          <p class="rnd-eff">${esc(rndF.eff)}</p>
          ${song?`<p class="rnd-song">${esc(song.s)}</p>`:''}
        </div>`:`<p class="rnd-hint">想好了就点「揭晓」，看看差几味。</p>`}
        <div class="row" style="justify-content:center;margin-top:14px">
          ${rndShow?`<button class="btn btn-primary" id="rndNext">再来一首</button>`
            :`<button class="btn btn-primary" id="rndShow">揭晓答案</button>`}
          <a class="btn" href="#/formula/${encodeURIComponent(rndF.n)}">看方解</a>
          <button class="btn" id="rndRead">朗读歌诀</button>
        </div>
      </div>
    </div>`;
  }
  function bindRandom(){
    const show = document.getElementById('rndShow');
    if(show) show.onclick = ()=>{ rndShow = true; if(rndTimer){clearInterval(rndTimer);rndTimer=null;} window.APP.route(); };
    const next = document.getElementById('rndNext');
    if(next) next.onclick = ()=>{ rndF=null; rndT=30; rndShow=false; window.APP.route(); };
    const read = document.getElementById('rndRead');
    if(read) read.onclick = ()=> speakSong(rndF.n);
    if(!rndShow){
      if(rndTimer) clearInterval(rndTimer);
      rndTimer = setInterval(()=>{
        rndT--;
        const el = document.getElementById('rndTimer');
        if(el) el.textContent = rndT+'s';
        if(rndT<=0){
          clearInterval(rndTimer); rndTimer=null;
          rndShow = true; window.APP.route();
        }
      }, 1000);
    }
  }
  window.__stopRnd = ()=>{ if(rndTimer){clearInterval(rndTimer);rndTimer=null;} };

  /* ---------- 打字默写 ---------- */
  let dicIdx = 0, dicList = [], dicMode = 'herb', dicDone = [], dicInput = '';
  function dictate(){
    const FM = A().FM||[];
    if(!dicList.length){
      const pool = FM.slice();
      for(let i=pool.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
      dicList = pool.slice(0,10);
    }
    const f = dicList[dicIdx];
    const cur = dicDone[dicIdx];
    return `<div class="view">
      <div class="row" style="margin-bottom:12px"><a class="btn btn-sm" href="#/tools">← 工具台</a>
        <span class="tag">第 ${dicIdx+1} / ${dicList.length} 题</span>
        <span class="tag">答对 ${dicDone.filter(x=>x&&x.ok).length}</span></div>
      <h1 style="font-size:25px">打字默写</h1>
      <p style="font-size:13px;color:var(--muted);margin-top:4px">不给选项，直接敲出来——比选择题难一个层次，也最接近「背下来」</p>
      <div class="card dic-box" style="margin-top:16px">
        <div class="chips" style="margin-bottom:10px">
          <button class="chip ${dicMode==='herb'?'on':''}" data-m="herb">给方名 · 默药材</button>
          <button class="chip ${dicMode==='name'?'on':''}" data-m="name">给药组 · 默方名</button>
        </div>
        ${dicMode==='herb'?`
          <div class="dic-q">「${esc(f.n)}」由哪些药组成？</div>
          <p class="dic-tip">用空格或顿号分隔；顺序不限。答完可看差在哪几味。</p>
          <input id="dicIn" class="dic-in" placeholder="例如：桂枝 芍药 生姜 大枣 甘草" value="${cur?esc(cur.input):''}" ${cur?'disabled':''}>
        `:`
          <div class="dic-q">这组药属于哪首方？</div>
          <div class="chips" style="margin:10px 0">${f.c.map(x=>`<span class="tag">${esc(x.h)}</span>`).join('')}</div>
          <input id="dicIn" class="dic-in" placeholder="输入方名" value="${cur?esc(cur.input):''}" ${cur?'disabled':''}>
        `}
        <div class="row" style="margin-top:12px">
          ${cur?`<button class="btn btn-primary" id="dicNext">${dicIdx<dicList.length-1?'下一题 →':'看结果'}</button>`
            :`<button class="btn btn-primary" id="dicGo">提交</button>`}
          ${cur?'':`<button class="btn" id="dicGiveUp">不会，看答案</button>`}
        </div>
        ${cur?`<div class="dic-res">
          <div class="dic-verdict ${cur.ok?'ok':'no'}">${cur.ok?'✓ 全对':'差几味'}</div>
          <div class="chips" style="margin-top:8px">${f.c.map(x=>{
            const hit = (cur.norm||[]).some(y=>y.indexOf(x.h)>=0 || x.h.indexOf(y)>=0);
            return `<span class="tag" style="border-color:${hit?'var(--jade)':'var(--danger)'};color:${hit?'var(--jade)':'var(--danger)'}">${hit?'✓':'×'} ${esc(x.h)}</span>`;
          }).join('')}</div>
          ${cur.input?`<p style="font-size:12px;color:var(--muted);margin-top:8px">你写的是：${esc(cur.input)}</p>`:''}
        </div>`:''}
      </div>
    </div>`;
  }
  function bindDictate(){
    const FM = A().FM||[];
    const f = dicList[dicIdx];
    document.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{ dicMode=b.dataset.m; window.APP.route(); });
    const inp = document.getElementById('dicIn');
    const submit = ()=>{
      const raw = (inp? inp.value : dicInput) || '';
      dicInput = raw;
      const parts = raw.split(/[\s,，、;；]+/).filter(Boolean);
      let ok = false;
      if(dicMode==='herb'){
        const std = f.c.map(x=>x.h);
        const hit = std.filter(n=>parts.some(p=>p.indexOf(n)>=0 || n.indexOf(p)>=0));
        ok = hit.length === std.length;
      }else{
        const norm = raw.replace(/\s|汤|散|丸|饮|煎|丹|膏/g,'');
        const target = f.n.replace(/\s|汤|散|丸|饮|煎|丹|膏/g,'');
        ok = norm.length>0 && (target.indexOf(norm)>=0 || norm.indexOf(target)>=0);
      }
      dicDone[dicIdx] = {ok, input:raw, norm:parts};
      window.APP.route();
    };
    const go = document.getElementById('dicGo');
    if(go) go.onclick = submit;
    if(inp) inp.onkeydown = e=>{ if(e.key==='Enter') submit(); };
    const give = document.getElementById('dicGiveUp');
    if(give) give.onclick = ()=>{ dicDone[dicIdx] = {ok:false, input:'', norm:[]}; window.APP.route(); };
    const next = document.getElementById('dicNext');
    if(next) next.onclick = ()=>{
      if(dicIdx < dicList.length-1){ dicIdx++; dicInput=''; window.APP.route(); }
      else {
        const ok = dicDone.filter(x=>x&&x.ok).length;
        dicList = []; dicIdx = 0; dicDone = []; dicInput='';
        alert(`本轮结束：${ok} / 10 全对。` + (ok>=8?'很稳。':'再练一轮试试。'));
        window.APP.route();
      }
    };
  }

  /* ---------- 歌诀朗读（全局可用） ---------- */
  function speakSong(name){
    if(!('speechSynthesis' in window)){ alert('此浏览器不支持语音朗读。'); return; }
    const s = (A().SONGS||[]).find(x=>x.n===name);
    if(!s) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(`${name}。${s.s}`);
    u.lang = 'zh-CN'; u.rate = 0.86; u.pitch = 1;
    window.speechSynthesis.speak(u);
  }
  window.speakSong = speakSong;

  /* 全局委托：歌诀朗读按钮 */
  document.addEventListener('click', e=>{
    const b = e.target.closest('[data-speak]');
    if(b){ e.preventDefault(); speakSong(b.dataset.speak); }
  });

  window.PAGES = Object.assign(window.PAGES||{}, {
    shanghan, safety, timeline, heat, random: randomPage, dictate
  });
  window.PAGE_BIND = Object.assign(window.PAGE_BIND||{}, {
    shanghan: bindShanghan, safety: bindSafety, random: bindRandom, dictate: bindDictate
  });
})();
