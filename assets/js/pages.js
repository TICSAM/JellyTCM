/* ================= 扩展页面（一）：决策树 / 对比 / 剂量 / 反查 / 工具台 ================= */
(function(){
  const A = () => window.APP || {};
  const esc = s => (A().esc || (x=>String(x==null?'':x)))(s);
  const h = (tag, cls, html) => `<${tag}${cls?` class="${cls}"`:''}>${html}</${tag}>`;

  /* ---------- 工具台（按用途分四区） ---------- */
  function tools(){
    const GROUPS = [
      ['找方用药', '从证候、病名或药味出发，找到该用的方', [
        ['#/tree','六经辨证决策树','回答一串问题，走到一个证型与主方','问诊路径'],
        ['#/disease','现代病 → 方剂','按病名找证型，再核对辨证要点与主方','临床'],
        ['#/analyze','方剂解析','贴入药味与剂量，看君臣佐使、药力与类方','组方'],
        ['#/rx','我的方','自己存的方，随时打开重解析、导出、备份','随身'],
        ['#/reverse/桂枝','一药多方反查','一味药在各方的君臣佐使与用量','配伍'],
        ['#/family','类方家族树','同一君药底下的方，一眼看成一家人','横向'],
        ['#/safety','十八反 · 中西药相互作用','配伍禁忌 + 中药西药同服速查','安全']
      ]],
      ['辨析对比', '易混的东西摆在一起看差异', [
        ['#/compare','相似方对比','两首易混方并排，差异药高亮','辨析'],
        ['#/dose','剂量换算器','一两到底是几克？汉、宋、明清、现代对照','换算'],
        ['#/shanghan','《伤寒论》原文','精要条文检索，直达对应方剂','原文'],
        ['#/jiangji','条文精讲','逐条读：白话、辨证眼目、用药与误治、病案','精读'],
        ['#/cases','古今医案','古案取原文，今案练「从症状到方证」','医案']
      ]],
      ['诊法与操作', '四诊怎么做、操作类知识在哪', [
        ['#/pulse','脉象','寸关尺怎么分、二十八脉怎么辨，八要素拆开看','诊法'],
        ['#/tongue','舌诊','望舌怎么望、舌质舌苔各看什么，常见舌象对照','诊法'],
        ['#/acu','穴位库','361 经穴 + 28 奇穴，搜穴名或主治就能找到它在哪','认穴'],
        ['#/tuina','推拿','成人 19 种手法 + 小儿推拿（天河水五法、捏脊…）+ 14 套保健流程','手法'],
        ['#/timeline','煎服法时间轴','先煎、后下、包煎、烊化、冲服怎么排','操作']
      ]],
      ['记忆与练习', '把「背了」变成「会用」', [
        ['#/quiz?scope=base','基础方配伍','王付 15 基础方：证素认方、归属、合方叠加情景题','练习'],
        ['#/prescribe','开方练习','只看证候，自己组方，交卷对君臣佐使','练习'],
        ['#/puzzle','方剂拼图','给方名与功效，把组成拼出来','练习'],
        ['#/random','盲盒抽方','随机一首方，30 秒速记挑战','记忆'],
        ['#/dictate','打字默写','不给选项，直接敲出药材或方名','默写'],
        ['#/heat','学习热力图','一年打卡 + 掌握度雷达','复盘']
      ]]
    ];
    const total = GROUPS.reduce((a,g)=>a+g[2].length,0);
    return `<div class="view">
      <h1 style="font-size:26px">工具台</h1>
      <p style="font-size:13px;color:var(--muted);margin-top:4px">按用途分四区，共 ${total} 件小工具——先想「我要干什么」，再进对应区</p>
      ${GROUPS.map(([g,hint,list])=>`
        <div class="sec" style="margin-top:20px"><h2>${g}</h2><span class="hint">${hint}</span></div>
        <div class="grid auto-280">
          ${list.map(([u,t,d,tag])=>`<a class="card tool-card" href="${u}">
            <div class="between"><h4 style="font-size:15.5px">${esc(t)}</h4><span class="tag">${esc(tag)}</span></div>
            <p>${esc(d)}</p>
            <span class="go">进入 →</span>
          </a>`).join('')}
        </div>`).join('')}
    </div>`;
  }

  /* ---------- 六经辨证决策树 ---------- */
  let treePath = [];
  function treePage(){
    const T = window.TREE; if(!T) return '<div class="view">数据未加载</div>';
    const cur = treePath.length ? treePath[treePath.length-1] : {go:T.start};
    const node = cur.res ? null : T.nodes[cur.go];
    const res = cur.res ? T.res[cur.res] : null;
    const crumbs = treePath.map((s,i)=>{
      const n = s.res ? T.res[s.res] : null;
      return `<span class="crumb">${esc(n? n.t : (T.nodes[s.go]? '第'+(i+1)+'问' : ''))}</span>`;
    }).join('<i>›</i>');
    if(res){
      const fm = (A().FM||[]).find(f=>f.n===res.f[0]);
      return `<div class="view">
        <div class="row" style="margin-bottom:12px"><a class="btn btn-sm" href="#/tools">← 工具台</a>
          <button class="btn btn-sm" id="treeReset">重新开始</button></div>
        <h1 style="font-size:25px">辨为：${esc(res.t)}</h1>
        <div class="chips" style="margin-top:8px">
          <span class="tag brand">${esc(res.liu)}</span>
          <span class="tag">主方 ${esc(res.f.join('、'))}</span>
        </div>
        <div class="card" style="margin-top:16px">
          <h4 style="font-size:15px;color:var(--brand);margin-bottom:6px">辨证要点</h4>
          <p style="font-size:13.4px;line-height:1.95">${esc(res.sig)}</p>
          <h4 style="font-size:15px;color:var(--brand);margin:14px 0 6px">为什么是这个方</h4>
          <p style="font-size:13.4px;line-height:1.95">${esc(res.why)}</p>
          <div class="warn" style="margin-top:14px"><span class="ic">!</span>
            <div class="tx"><b>记忆钥匙</b>${esc(res.key)}</div></div>
        </div>
        ${fm?`<div class="card" style="margin-top:14px">
          <div class="between"><h4 style="font-size:15px">主方：${esc(fm.n)}</h4>
            <a class="btn btn-sm" href="#/formula/${encodeURIComponent(fm.n)}">看完整方解 →</a></div>
          <p style="font-size:12.8px;color:var(--ink-2);line-height:1.9;margin-top:6px">
            <b>功效</b>　${esc(fm.eff)}<br><b>主治</b>　${esc(fm.ind)}</p>
          <div class="chips" style="margin-top:8px">
            ${fm.c.map(x=>`<span class="tag">${esc(x.h)}${x.r?'·'+esc(x.r):''}</span>`).join('')}
          </div>
        </div>`:''}
        <div class="card" style="margin-top:14px">
          <h4 style="font-size:14.5px;margin-bottom:8px">你的辨证路径</h4>
          <div class="tree-crumbs">${treePath.map((s,i)=>{
            const n = s.res ? T.res[s.res] : T.nodes[s.go];
            const q = s.res ? '辨为「'+T.res[s.res].t+'」' : (n.q||'');
            const pick = s.pick ? `<em>→ ${esc(s.pick)}</em>` : '';
            return `<div class="tree-step"><b>${i+1}</b><span>${esc(q)}</span>${pick}</div>`;
          }).join('')}</div>
        </div>
      </div>`;
    }
    if(!node) return '<div class="view">节点缺失</div>';
    return `<div class="view">
      <div class="row" style="margin-bottom:12px"><a class="btn btn-sm" href="#/tools">← 工具台</a>
        ${treePath.length?`<button class="btn btn-sm" id="treeBack">← 上一问</button>`:''}
        <button class="btn btn-sm" id="treeReset">重新开始</button></div>
      <h1 style="font-size:25px">六经辨证决策树</h1>
      <p style="font-size:12.6px;color:var(--muted);margin-top:4px">第 ${treePath.length+1} 问 · 共 10 问左右走到一个方</p>
      ${crumbs?`<div class="tree-crumbs" style="margin-top:12px">${crumbs}</div>`:''}
      <div class="card tree-q" style="margin-top:16px">
        <div class="q-no">Q${treePath.length+1}</div>
        <h3>${esc(node.q)}</h3>
        ${node.hint?`<p class="hint">${esc(node.hint)}</p>`:''}
        <div class="tree-opts">
          ${node.opts.map((o,i)=>`<button class="tree-opt" data-i="${i}">
            <span class="k">${'ABCDE'[i]}</span><span class="t">${esc(o.t)}</span></button>`).join('')}
        </div>
      </div>
      <p style="font-size:11.6px;color:var(--muted);margin-top:12px;line-height:1.75">
        这是教学用的鉴别路径，真实辨证还要看舌、脉、体质与病程，不能只凭一问定方。
      </p>
    </div>`;
  }
  function bindTree(){
    const T = window.TREE; if(!T) return;
    const reset = document.getElementById('treeReset');
    if(reset) reset.onclick = ()=>{ treePath = []; location.hash = '#/tree'; window.APP.route(); };
    const back = document.getElementById('treeBack');
    if(back) back.onclick = ()=>{ treePath.pop(); window.APP.route(); };
    document.querySelectorAll('.tree-opt').forEach(b=>{
      b.onclick = ()=>{
        const cur = treePath.length ? treePath[treePath.length-1] : {go:T.start};
        const node = T.nodes[cur.go];
        const o = node.opts[parseInt(b.dataset.i,10)];
        const step = {pick:o.t};
        if(o.go.startsWith('r_')){
          treePath.push({...step, res:o.go});
        } else {
          treePath.push({...step, go:o.go});
        }
        window.APP.route();
      };
    });
  }

  /* ---------- 相似方对比 ---------- */
  const PAIRS = [
    ['桂枝汤','麻黄汤','有汗与无汗'],
    ['大承气汤','小承气汤','痞满燥实俱备与否'],
    ['小承气汤','调胃承气汤','有芒硝与有甘草'],
    ['银翘散','桑菊饮','辛凉平剂与辛凉轻剂'],
    ['四君子汤','六君子汤','补气与补气化痰'],
    ['六君子汤','香砂六君子汤','再加木香砂仁'],
    ['二陈汤','温胆汤','痰湿与痰热'],
    ['小柴胡汤','大柴胡汤','和解与和解兼通下'],
    ['四逆汤','通脉四逆汤','倍干姜与加大附子'],
    ['麻黄汤','大青龙汤','无汗与无汗烦躁'],
    ['桂枝汤','桂枝加葛根汤','项背强几几'],
    ['白虎汤','白虎加人参汤','气津两伤'],
    ['理中丸','四逆汤','中焦虚寒与肾阳衰'],
    ['逍遥散','柴胡疏肝散','肝郁脾虚与肝郁气滞'],
    ['八珍汤','十全大补汤','补气血与温补气血']
  ];
  let cmpA = '桂枝汤', cmpB = '麻黄汤';
  function compare(params){
    const FM = A().FM || [];
    cmpA = params.get('a') || cmpA; cmpB = params.get('b') || cmpB;
    const fa = FM.find(f=>f.n===cmpA), fb = FM.find(f=>f.n===cmpB);
    /* 按别名归一后再分组：二陈汤写「橘红」、温胆汤写「陈皮」，其实是一味 */
    const cN = n => (window.HB_ALIAS||{})[n] || n;
    const keys = [...new Set([...(fa?fa.c:[]), ...(fb?fb.c:[])].map(x=>cN(x.h)))];
    const pick = (f,k)=>{ const x=(f?f.c:[]).find(c=>cN(c.h)===k); return x||null; };
    const rows = keys.map(k=>{
      const xa = pick(fa,k), xb = pick(fb,k);
      const cur = xa || xb;
      const other = xa && xb && xa.h!==xb.h ? (xa.h===cur.h? xb.h : xa.h) : '';
      return {n:cur.h, dup:other, inA:!!xa, inB:!!xb,
        ra:xa?(xa.r||''):'', rb:xb?(xb.r||''):'', da:xa?xa.g:'', db:xb?xb.g:''};
    });
    const onlyA = rows.filter(r=>r.inA&&!r.inB), onlyB = rows.filter(r=>!r.inA&&r.inB), both = rows.filter(r=>r.inA&&r.inB);
    const sel = (which, cur)=>`<select id="${which}" class="cmp-sel">
      ${FM.map(f=>`<option value="${esc(f.n)}" ${f.n===cur?'selected':''}>${esc(f.n)}</option>`).join('')}
    </select>`;
    return `<div class="view">
      <div class="row" style="margin-bottom:12px"><a class="btn btn-sm" href="#/tools">← 工具台</a></div>
      <h1 style="font-size:25px">相似方对比</h1>
      <p style="font-size:13px;color:var(--muted);margin-top:4px">相同的药压暗，只在一方出现的药高亮——差异就是辨证的眼目</p>
      <div class="card" style="margin-top:14px;padding:13px 15px">
        <div class="cmp-head">
          <div>${sel('cmpA',cmpA)}<div class="cmp-sub">${esc(fa?fa.eff:'')}</div></div>
          <div class="vs">VS</div>
          <div>${sel('cmpB',cmpB)}<div class="cmp-sub">${esc(fb?fb.eff:'')}</div></div>
        </div>
      </div>
      <div class="grid g2" style="margin-top:14px">
        <div class="card">
          <h4 style="font-size:14.5px;margin-bottom:8px">共用药（${both.length}）</h4>
          <div class="cmp-pills">${both.map(r=>`<span class="cmp-pill both">${esc(r.n)}${r.dup?`<i style="font-style:normal;opacity:.6;font-size:10px">${esc(r.dup)}</i>`:''}<em>${esc(r.da||'')} / ${esc(r.db||'')}</em></span>`).join('')||'<span style="color:var(--muted);font-size:12px">无</span>'}</div>
          <h4 style="font-size:14.5px;margin:14px 0 8px">只在「${esc(cmpA)}」（${onlyA.length}）</h4>
          <div class="cmp-pills">${onlyA.map(r=>`<span class="cmp-pill a">${esc(r.n)}<em>${esc(r.ra)} ${esc(r.da)}</em></span>`).join('')||'<span style="color:var(--muted);font-size:12px">无</span>'}</div>
          <h4 style="font-size:14.5px;margin:14px 0 8px">只在「${esc(cmpB)}」（${onlyB.length}）</h4>
          <div class="cmp-pills">${onlyB.map(r=>`<span class="cmp-pill b">${esc(r.n)}<em>${esc(r.rb)} ${esc(r.db)}</em></span>`).join('')||'<span style="color:var(--muted);font-size:12px">无</span>'}</div>
        </div>
        <div class="card">
          <h4 style="font-size:14.5px;margin-bottom:8px">主治与差异</h4>
          <div class="cmp-ana">
            <div><b>${esc(cmpA)}</b><p>${esc(fa?fa.ind:'')}</p></div>
            <div><b>${esc(cmpB)}</b><p>${esc(fb?fb.ind:'')}</p></div>
          </div>
          ${fa?`<div class="warn sm" style="margin-top:12px"><span class="ic">!</span><div class="tx"><b>${esc(cmpA)} 的方解</b>${esc(fa.ana||'')}</div></div>`:''}
          ${fb?`<div class="warn sm" style="margin-top:8px"><span class="ic">!</span><div class="tx"><b>${esc(cmpB)} 的方解</b>${esc(fb.ana||'')}</div></div>`:''}
        </div>
      </div>
      <div class="card" style="margin-top:14px">
        <h4 style="font-size:14.5px;margin-bottom:10px">常考的易混对</h4>
        <div class="chips">${PAIRS.map(([a,b,why])=>`<a class="chip" href="#/compare?a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}" title="${esc(why)}">${esc(a)} ↔ ${esc(b)}</a>`).join('')}</div>
      </div>
    </div>`;
  }
  function bindCompare(){
    const a = document.getElementById('cmpA'), b = document.getElementById('cmpB');
    if(a) a.onchange = ()=> location.hash = `#/compare?a=${encodeURIComponent(a.value)}&b=${encodeURIComponent(b.value)}`;
    if(b) b.onchange = ()=> location.hash = `#/compare?a=${encodeURIComponent(a.value)}&b=${encodeURIComponent(b.value)}`;
  }

  /* ---------- 剂量换算器 ---------- */
  const UNITS = [
    {k:'liang', n:'两', hd:13.8, sd:41.3, md:37.3, now:30, note:'东汉 1 两约 13.8g（柯雪帆考证 13.92g）；宋 1 两 41.3g；明清 37.3g；现代处方习用 1 两 = 30g'},
    {k:'qian', n:'钱', hd:1.38, sd:4.13, md:3.73, now:3, note:'1 两 = 10 钱（宋以后）；现代 1 钱约 3g'},
    {k:'fen', n:'分', hd:0.35, sd:0.41, md:0.37, now:0.3, note:'宋 1 分 = 1/10 钱；东汉「分」多为等分比例，非重量单位'},
    {k:'zhu', n:'铢', hd:0.57, sd:0, md:0, now:0, note:'东汉 1 两 = 24 铢，1 铢约 0.57g'},
    {k:'jin', n:'斤', hd:220, sd:661, md:596.8, now:500, note:'东汉 1 斤 = 16 两约 220g；宋 1 斤 661g；明清 596.8g；今市斤 500g'},
    {k:'sheng', n:'升（容量）', hd:200, sd:200, md:200, now:200, note:'汉 1 升约 200ml，多用于水、酒、醋的计量'}
  ];
  const PIECES = [
    ['大枣','12 枚 ≈ 20~30g','一枚约 2~3g，擘开入煎'],
    ['附子','1 枚 ≈ 15~25g','中等大小，炮附子一枚约 20g'],
    ['杏仁','50 个 ≈ 20g','一个约 0.4g，去皮尖'],
    ['桃仁','50 枚 ≈ 15g','一枚约 0.3g'],
    ['栀子','10 个 ≈ 10g','一个约 1g'],
    ['枳实','1 枚 ≈ 18g','中等个约 15~20g'],
    ['石膏','如鸡子大 ≈ 45~60g','一枚鸡蛋大约 45g'],
    ['半夏','半升 ≈ 50~60g','一升约 110~130g'],
    ['粳米','半升 ≈ 90g','一升约 180g'],
    ['水','一斗 = 10 升 ≈ 2000ml','煮取三升即煎至约 600ml']
  ];
  let doseVal = 3, doseUnit = 'liang';
  function dose(params){
    const u = UNITS.find(x=>x.k===doseUnit) || UNITS[0];
    const v = doseVal;
    const row = (label, val, cls) => val? `<tr><td>${label}</td><td class="${cls}">${(val*v).toFixed(val*v<10?2:1)} g</td></tr>` : '';
    return `<div class="view">
      <div class="row" style="margin-bottom:12px"><a class="btn btn-sm" href="#/tools">← 工具台</a></div>
      <h1 style="font-size:25px">剂量换算器</h1>
      <p style="font-size:13px;color:var(--muted);margin-top:4px">古人写「三两」，到底是今天的多少克？不同朝代差三倍</p>
      <div class="card" style="margin-top:14px">
        <div class="dose-in">
          <input id="doseVal" type="number" min="0" step="0.5" value="${v}">
          <select id="doseUnit">${UNITS.map(x=>`<option value="${x.k}" ${x.k===u.k?'selected':''}>${x.n}</option>`).join('')}</select>
          <span style="font-size:12.6px;color:var(--muted)">按不同朝代的衡制折算：</span>
        </div>
        <div class="tbl-wrap" style="margin-top:12px"><table class="tbl">
          <thead><tr><th>朝代 / 标准</th><th>折算结果</th><th>说明</th></tr></thead>
          <tbody>
            <tr><td><b>东汉（《伤寒论》）</b></td><td style="color:var(--brand);font-family:var(--mono)">${(u.hd*v).toFixed(u.hd*v<10?2:1)} g</td><td>1 两 ≈ 13.8g，1 斤 = 16 两</td></tr>
            <tr><td><b>宋（《局方》）</b></td><td style="color:var(--brand);font-family:var(--mono)">${(u.sd*v).toFixed(u.sd*v<10?2:1)} g</td><td>1 两 ≈ 41.3g，1 斤 = 16 两 = 661g</td></tr>
            <tr><td><b>明清</b></td><td style="color:var(--brand);font-family:var(--mono)">${(u.md*v).toFixed(u.md*v<10?2:1)} g</td><td>1 斤 ≈ 596.8g，1 两 ≈ 37.3g</td></tr>
            <tr><td><b>现代处方习用</b></td><td style="color:var(--brand);font-family:var(--mono)">${(u.now*v).toFixed(u.now*v<10?2:1)} g</td><td>1 两 = 30g（旧制），1 钱 = 3g</td></tr>
          </tbody></table></div>
        <p style="font-size:11.8px;color:var(--muted);margin-top:10px;line-height:1.8">${esc(u.note)}</p>
      </div>
      <div class="card" style="margin-top:14px">
        <h4 style="font-size:15px;margin-bottom:10px">「枚 / 个 / 升」这类没法直接换的</h4>
        <div class="tbl-wrap"><table class="tbl">
          <thead><tr><th>写法</th><th>约合</th><th>备注</th></tr></thead>
          <tbody>${PIECES.map(p=>`<tr><td><b style="font-family:var(--serif)">${esc(p[0])}</b></td><td style="color:var(--brand)">${esc(p[1])}</td><td style="color:var(--muted)">${esc(p[2])}</td></tr>`).join('')}</tbody>
        </table></div>
        <div class="warn" style="margin-top:12px"><span class="ic">!</span>
          <div class="tx"><b>别按古方原量照抓</b>汉代一两约 13.8g，但一剂常分三服，且今人煎服法与体质都不同。临床折算须由医师按病情、体质与药物毒性决定；有毒药（附子、乌头、细辛）尤须谨慎。</div>
        </div>
      </div>
    </div>`;
  }
  function bindDose(){
    const v = document.getElementById('doseVal'), u = document.getElementById('doseUnit');
    if(v) v.oninput = ()=>{ doseVal = parseFloat(v.value)||0; window.APP.route(); };
    if(u) u.onchange = ()=>{ doseUnit = u.value; window.APP.route(); };
  }

  /* ---------- 一药多方反查 ---------- */
  function reverse(params, seg){
    const nm = decodeURIComponent(seg[1] || '桂枝');
    const FM = A().FM||[], HB = A().HB||[], AL = A().HB_ALIAS||{};
    const hb = HB.find(x=>x.n===nm || AL[nm]===x.n) || HB.find(x=>nm && x.n.indexOf(nm)>=0);
    if(!hb) return `<div class="view"><p>未找到药材「${esc(nm)}」</p><a class="btn" href="#/herbs">回药材库</a></div>`;
    const list = FM.filter(f=>f.c.some(c=>c.h===hb.n || AL[c.h]===hb.n));
    const byRole = {君:[],臣:[],佐:[],使:[],'':[]};
    list.forEach(f=>{
      const c = f.c.find(c=>c.h===hb.n || AL[c.h]===hb.n);
      byRole[c.r||''] ? byRole[c.r||''].push({f,c}) : byRole[''].push({f,c});
    });
    /* 配伍药同样按正名归并，否则「白芍」的配伍里会把它自己的别名「芍药」算进去 */
    const cN2 = n => AL[n] || n;
    const partners = {};
    list.forEach(f=>f.c.forEach(c=>{ const k=cN2(c.h); if(k!==hb.n) partners[k]=(partners[k]||0)+1; }));
    const top = Object.entries(partners).sort((a,b)=>b[1]-a[1]).slice(0,14);
    return `<div class="view">
      <div class="row" style="margin-bottom:12px"><a class="btn btn-sm" href="#/herb/${encodeURIComponent(hb.n)}">← 药材页</a>
        <a class="btn btn-sm" href="#/tools">工具台</a></div>
      <h1 style="font-size:25px">${esc(hb.n)}　<span style="font-size:14px;color:var(--muted);font-weight:400">一药多方反查</span></h1>
      <p style="font-size:13px;color:var(--muted);margin-top:4px">${esc(hb.eff)}　·　共出现在 <b style="color:var(--brand)">${list.length}</b> 首方中</p>
      <div class="grid" style="margin-top:14px;grid-template-columns:repeat(auto-fit,minmax(186px,1fr))">
        ${['君','臣','佐','使'].map(r=>`<div class="card" style="padding:12px 14px">
          <div class="between"><span class="tag ${r==='君'?'brand':''}">为${r}</span><b style="font-family:var(--mono);color:var(--brand)">${byRole[r].length}</b></div>
          <p style="font-size:12px;color:var(--muted);margin-top:6px;line-height:1.7">${byRole[r].slice(0,4).map(x=>esc(x.f.n)).join('、')||'—'}</p>
        </div>`).join('')}
      </div>
      ${top.length?`<div class="card" style="margin-top:14px">
        <h4 style="font-size:14.5px;margin-bottom:8px">最常与它配伍的药</h4>
        <div class="chips">${top.map(([n,c])=>`<a class="chip" href="#/reverse/${encodeURIComponent(n)}">${esc(n)} <b style="color:var(--brand)">${c}</b></a>`).join('')}</div>
      </div>`:''}
      <div class="card" style="margin-top:14px">
        <div class="between" style="margin-bottom:8px"><h4 style="font-size:15px">逐方看它的角色与用量</h4>
          <span class="tag">${list.length} 方</span></div>
        <div class="rev-list">
          ${list.map(f=>{
            const c = f.c.find(c=>c.h===hb.n || AL[c.h]===hb.n);
            const others = f.c.filter(x=>x!==c);
            return `<div class="rev-row">
              <div class="rev-h">
                <a href="#/formula/${encodeURIComponent(f.n)}">${esc(f.n)}</a>
                <span class="tag ${c.r==='君'?'brand':''}">${c.r?('为'+c.r):'—'}</span>
                <span class="tag gold">${esc(c.g||'')}</span>
                <span class="tag" style="border:none;background:none;color:var(--muted)">${esc(f.book||'')}</span>
              </div>
              <p class="rev-d">${esc(c.note||'')}</p>
              <p class="rev-o">同方：${others.map(x=>`<a href="#/reverse/${encodeURIComponent(x.h)}">${esc(x.h)}</a>`).join('、')}</p>
            </div>`;
          }).join('')}
        </div>
      </div>
      <p style="font-size:11.6px;color:var(--muted);margin-top:12px;line-height:1.75">
        同是一味桂枝：在桂枝汤为君（解肌），在麻黄汤为臣（助麻黄发汗），在苓桂术甘汤为臣（温阳化饮），在桃核承气汤为佐（通阳活血）。「一药多能」正是方剂配伍的核心。
      </p>
    </div>`;
  }

  window.PAGES = Object.assign(window.PAGES||{}, { tools, tree:treePage, compare, dose, reverse });
  window.PAGE_BIND = Object.assign(window.PAGE_BIND||{}, {
    tree: bindTree, compare: bindCompare, dose: bindDose
  });
})();
