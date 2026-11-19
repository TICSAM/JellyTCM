/* ================= 扩展页面（三）：现代病 → 方剂 / 方剂解析 ================= */
(function(){
  const A = () => window.APP || {};
  const esc = s => (A().esc || (x=>String(x==null?'':x)))(s);
  const FM = () => A().FM || [];
  const HB = () => A().HB || [];
  const HB_BY = () => A().HB_BY || {};
  const AL = () => window.HB_ALIAS || {};
  const DIS = () => window.DISEASES || [];
  const canon = n => AL()[n] || n;
  const roleMap = {'君':'j','臣':'c','佐':'z','使':'s'};
  const fName = n => FM().some(f=>f.n===n);

  /* ==================================================================
     一、现代病 → 证型 → 方剂
     ================================================================== */
  let dsQ = '', dsDept = '全部';
  const PY = () => window.PYINI || {};
  const pyInit = s => [...String(s==null?'':s)].map(c=>PY()[c]||'').join('');

  function deptList(){
    return ['全部', ...new Set(DIS().map(d=>d.dept))];
  }
  function dsCard(d){
    const k = [d.n, d.tcm, d.dept, ...d.types.map(t=>t.z+' '+t.k+' '+t.f.join(' '))].join(' ').toLowerCase();
    const fs = [...new Set(d.types.flatMap(t=>t.f))];
    return `<a class="card ds-card" href="#/disease/${encodeURIComponent(d.n)}" data-k="${esc(k)}" data-py="${esc(pyInit(d.n + d.tcm))}" data-dept="${esc(d.dept)}">
      <div class="between" style="align-items:flex-start;gap:8px">
        <h4 style="font-size:16px">${esc(d.n)}</h4>
        <span class="tag">${esc(d.dept)}</span>
      </div>
      <p>${esc(d.sum)}</p>
      <div class="ds-meta">
        <span class="tag brand">${esc(d.tcm)}</span>
        <span class="tag">${d.types.length} 个证型</span>
        <span class="tag plain" style="font-size:11px">${fs.slice(0,2).map(esc).join(' · ')}${fs.length>2?' …':''}</span>
      </div>
    </a>`;
  }
  function diseasePage(params, seg){
    const want = seg && seg[1] ? decodeURIComponent(seg[1]) : '';
    const d = DIS().find(x=>x.n===want);
    if(want && !d){
      return `<div class="view"><div class="row" style="margin-bottom:12px"><a class="btn btn-sm" href="#/disease">← 现代病速查</a></div>
        <h1 style="font-size:24px">没有收录「${esc(want)}」</h1>
        <p class="mini" style="margin-top:6px">可以试试：感冒、咳嗽、失眠、痤疮、痛经、便秘。</p></div>`;
    }
    if(d) return diseaseDetail(d, params);

    return `<div class="view">
      <div class="row" style="margin-bottom:12px"><a class="btn btn-sm" href="#/tools">← 工具台</a></div>
      <h1 style="font-size:26px">现代病 → 方剂</h1>
      <p style="font-size:13px;color:var(--muted);margin-top:4px">按西医病名找到对应的中医证型，再核对辨证要点——同一个病，证不同，方就不同</p>
      <div class="card" style="margin-top:14px;padding:12px 15px">
        <input id="dsQ" class="ix-q" value="${esc(dsQ)}" placeholder="搜病名 / 证型 / 方名，或拼音首字母（cc → 痤疮）" autocomplete="off">
        <div class="chips" style="margin-top:10px" id="dsDept">
          ${deptList().map(x=>`<button class="chip ${dsDept===x?'on brand':''}" data-dept-btn="${esc(x)}" style="font-size:12px">${esc(x)}</button>`).join('')}
        </div>
        <div style="margin-top:9px;font-size:12px;color:var(--muted)">共 <b id="dsCount" style="color:var(--brand)">${DIS().length}</b> 个病名 / ${DIS().reduce((a,d)=>a+d.types.length,0)} 个证型 · <span class="mini" style="display:inline">${esc(window.DISEASE_NOTE||'')}</span></div>
      </div>
      <div class="ds-list" id="dsList">${DIS().map(dsCard).join('')}</div>
      <div class="card" id="dsEmpty" style="display:none;margin-top:14px;text-align:center;color:var(--muted)">没有匹配的病名，换个词试试</div>
      ${(()=>{
        const bases = (window.WANGFU||{}).base || [];
        if(!bases.length) return '';
        return `<div class="card" id="wf-base" style="margin-top:18px;padding:14px 16px;scroll-margin-top:76px">
          <div class="between" style="align-items:baseline;gap:10px;flex-wrap:wrap">
            <h4 style="font-size:16px;font-family:var(--serif)">王付 · 15 基础方</h4>
            <a class="mini" href="#/quiz?scope=base" style="color:var(--brand)">练「基础方叠加」→</a>
          </div>
          <p class="mini" style="margin-top:6px">基础方针对的是<b>病变属性</b>（气郁、瘀血、寒湿…），不是固定病名或部位；同一属性可跨病使用，两三种属性并见就合方。下列 15 首不在方剂库里做特别标注，集中放在这里按证查用。</p>
          <div class="chips" style="margin-top:11px">
            ${bases.map(([nm,tag])=>`<a class="chip" style="text-decoration:none" href="#/formula/${encodeURIComponent(nm)}">${esc(nm)}<i style="font-style:normal;color:var(--muted);font-size:10.5px">·${esc(tag)}</i></a>`).join('')}
          </div>
          <p class="mini" style="margin-top:9px">来源：${esc((window.WANGFU||{}).src||'')}（${esc((window.WANGFU||{}).from||'')}）</p>
        </div>`;
      })()}
    </div>`;
  }
  function diseaseDetail(d, params){
    const zWant = params && params.get ? parseInt(params.get('z'),10) : NaN;
    const rel = [...new Set(d.types.flatMap(t=>t.f))].filter(fName);
    return `<div class="view">
      <div class="row" style="margin-bottom:12px">
        <a class="btn btn-sm" href="#/disease">← 现代病</a>
        <span class="tag">${esc(d.dept)}</span>
        <span class="tag brand">中医：${esc(d.tcm)}</span>
      </div>
      <h1 style="font-size:27px">${esc(d.n)}</h1>
      <p style="font-size:13.4px;line-height:1.95;color:var(--ink-2);margin-top:8px;max-width:760px">${esc(d.sum)}</p>

      ${d.warn?`<div class="warn" style="margin-top:14px">
        <span class="ic">!</span>
        <div class="tx"><b>常见误区</b><span style="display:block;margin-top:2px">${esc(d.warn)}</span></div>
      </div>`:''}

      <div class="card" style="margin-top:16px">
        <div class="between"><h4 style="font-size:16px">按证型选方</h4><span class="tag">${d.types.length} 型</span></div>
        <p class="mini" style="margin-top:4px">先看「辨证要点」，与患者表现对得上，才谈得上用这个方；对不上就往下看下一型。</p>
        ${d.types.map((t,ti)=>`<div class="ds-type${ti===zWant?' hl':''}" id="z${ti}">
          <div class="row" style="gap:8px;align-items:baseline">
            <h5>${esc(t.z)}</h5>
            <span class="tag plain" style="font-size:11px;border-left:0;padding-left:0">${esc(t.f.filter(fName).join(' / '))}</span>
          </div>
          <p class="k"><b style="color:var(--brand);font-weight:500">辨证要点　</b>${esc(t.k)}</p>
          <p class="t">${esc(t.t)}</p>
          <div class="f">${t.f.map(n=>fName(n)
            ? `<a class="chip" href="#/formula/${encodeURIComponent(n)}">${esc(n)} →</a>`
            : `<span class="chip">${esc(n)}（库中暂缺）</span>`).join('')}
            <a class="chip" href="#/analyze?f=${encodeURIComponent(t.f[0]||'')}">去解析这首方</a>
          </div>
        </div>`).join('')}
      </div>

      <div class="card" style="margin-top:16px">
        <h4 style="font-size:15px;margin-bottom:8px">这张表怎么用</h4>
        <div class="mini" style="line-height:1.95">
          1. 先用西医病名定位到可能的中医病证（如「痤疮」对应「肺风粉刺」）。<br>
          2. 再逐条核对辨证要点——舌、脉、症，至少要能对上主症与舌脉，不能只看病名。<br>
          3. 方剂点开看组成、君臣佐使与方解，注意「加减」与「禁忌」，同一证型不同兼症，用药也要变。<br>
          4. 本页是学习用的对应表，不是处方；临床须由执业中医师四诊合参后决定。
        </div>
        ${rel.length?`<div class="chips" style="margin-top:10px">${rel.map(n=>`<a class="tag brand" style="text-decoration:none" href="#/formula/${encodeURIComponent(n)}">${esc(n)}</a>`).join('')}</div>`:''}
      </div>
    </div>`;
  }
  function dsFilter(){
    const q = (document.getElementById('dsQ')||{}).value || '';
    dsQ = q.trim().toLowerCase();
    const isPy = /^[a-z]{2,}$/.test(dsQ);
    let n = 0;
    document.querySelectorAll('#dsList .ds-card').forEach(el=>{
      const okQ = !dsQ || (el.dataset.k||'').includes(dsQ) || (isPy && (el.dataset.py||'').includes(dsQ));
      const okD = dsDept==='全部' || el.dataset.dept===dsDept;
      const show = okQ && okD;
      el.style.display = show ? '' : 'none';
      if(show) n++;
    });
    const c = document.getElementById('dsCount'); if(c) c.textContent = n;
    const e = document.getElementById('dsEmpty'); if(e) e.style.display = n ? 'none' : '';
  }
  function bindDisease(params){
    const q = document.getElementById('dsQ');
    if(q) q.oninput = dsFilter;
    document.querySelectorAll('[data-dept-btn]').forEach(b=>{
      b.onclick = ()=>{
        dsDept = b.dataset.deptBtn;
        document.querySelectorAll('[data-dept-btn]').forEach(x=>x.classList.toggle('on', x===b));
        document.querySelectorAll('[data-dept-btn]').forEach(x=>x.classList.toggle('brand', x===b));
        dsFilter();
      };
    });
    dsFilter();
    /* 从方剂详情或全站搜索跳进来：定位到「15 基础方」 */
    if(params && params.get && params.get('go') === 'base'){
      const el = document.getElementById('wf-base');
      if(el) setTimeout(()=>el.scrollIntoView({behavior:'smooth', block:'start'}), 60);
    }
    /* 从全站搜索点「证型」进来：定位到该证型 */
    const z = params && params.get ? parseInt(params.get('z'),10) : NaN;
    if(!isNaN(z)){
      const el = document.getElementById('z'+z);
      if(el){
        setTimeout(()=>{
          el.scrollIntoView({behavior:'smooth', block:'start'});
          el.classList.add('hl');
          setTimeout(()=>el.classList.remove('hl'), 2400);
        }, 60);
      }
    }
  }

  /* 方剂详情页的反向链接：这首方在现代病里治哪些证型 */
  function formulaDiseases(name){
    const hits = [];
    DIS().forEach(d=>d.types.forEach(t=>{ if((t.f||[]).includes(name)) hits.push({d, t}); }));
    if(!hits.length) return '';
    const map = {};
    hits.forEach(({d,t})=>{ (map[d.n] = map[d.n] || {d, zs:[]}).zs.push(t.z); });
    return `<div class="card" style="margin-top:16px">
      <div class="between"><h4 style="font-size:15px">现代病里的位置</h4><span class="tag">${hits.length} 个证型</span></div>
      <p class="mini" style="margin-top:4px">同一首方在不同病里，对应的是同一个证；反过来说，证对上了，病名可以不同。</p>
      <div class="ds-meta" style="margin-top:10px">
        ${Object.values(map).map(x=>`<a class="tag brand" style="text-decoration:none;padding:4px 9px" href="#/disease/${encodeURIComponent(x.d.n)}">${esc(x.d.n)} · ${esc(x.zs.join('、'))}</a>`).join('')}
      </div>
    </div>`;
  }

  /* ==================================================================
     二、方剂解析：粘贴药味与剂量 → 组成、君臣佐使、功效、药力、类方
     ================================================================== */
  const CN = {'零':0,'〇':0,'一':1,'二':2,'两':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9};
  function cnNum(s){
    if(!s) return NaN;
    if(s==='十') return 10;
    if(s.includes('十')){
      const [a,b] = s.split('十');
      const tens = a ? CN[a] : 1;
      const ones = b ? CN[b] : 0;
      return (tens==null||ones==null) ? NaN : tens*10+ones;
    }
    let n = 0;
    for(const c of s){ if(CN[c]==null) return NaN; n = n*10 + CN[c]; }
    return n;
  }
  /* 单位 → 克；枚/片/只/条/个为计数单位，不折算 */
  const UNIT_G = {'g':1,'克':1,'钱':3,'两':30,'分':0.3};
  function parseDose(seg){
    let s = String(seg||'').slice(0,18).replace(/^[\s:：,，、]+/,'');
    let m = s.match(/(\d+(?:\.\d+)?)\s*(?:[~～\-—至]\s*(\d+(?:\.\d+)?))?\s*(g|克|钱|两|分|枚|片|只|条|个|毫升|ml)?/i);
    if(m){
      const a = parseFloat(m[1]);
      const b = m[2] ? parseFloat(m[2]) : a;
      const unit = (m[3]||'').toLowerCase();
      if(!unit && a > 60) return {text:'', grams:null, unit:'', ancient:false};
      const text = m[0].trim();
      if(unit==='枚'||unit==='片'||unit==='只'||unit==='条'||unit==='个'||unit==='毫升'||unit==='ml')
        return {text, grams:null, unit, ancient:false};
      const k = UNIT_G[unit || 'g'] || 1;
      return {text, grams: ((a+b)/2)*k, unit: unit||'g', ancient: unit==='钱'||unit==='两'||unit==='分'};
    }
    m = s.match(/([一二三四五六七八九十两]+)\s*(钱|两|分|枚|片|只|条|个)/);
    if(m){
      const n = cnNum(m[1]);
      if(!isNaN(n)){
        const unit = m[2];
        const text = m[0];
        if(unit==='枚'||unit==='片'||unit==='只'||unit==='条'||unit==='个')
          return {text, grams:null, unit, ancient:false};
        return {text, grams: n * (UNIT_G[unit]||1), unit, ancient:true};
      }
    }
    return {text:'', grams:null, unit:'', ancient:false};
  }
  let NAMES = null;
  function herbNames(){
    if(NAMES) return NAMES;
    const set = new Set(HB().map(h=>h.n));
    Object.keys(AL()).forEach(k=>set.add(k));
    NAMES = [...set].filter(n=>n && n.length>=2).sort((a,b)=>b.length-a.length);
    return NAMES;
  }
  /* 从整段文字里顺序抓药名与紧随其后的剂量 */
  function parseRx(text){
    const raw = String(text||'').replace(/\r/g,'');
    const names = herbNames();
    const hits = [];
    let i = 0;
    while(i < raw.length){
      const c = raw[i];
      if(c >= '\u4e00' && c <= '\u9fa5'){
        let found = '';
        for(const n of names){ if(raw.startsWith(n, i)){ found = n; break; } }
        if(found){ hits.push({raw:found, start:i}); i += found.length; continue; }
      }
      i++;
    }
    const map = new Map();
    let ancient = false;
    hits.forEach((h,k)=>{
      const end = k+1 < hits.length ? hits[k+1].start : raw.length;
      const seg = raw.slice(h.start + h.raw.length, Math.min(end, h.start + h.raw.length + 18));
      const d = parseDose(seg);
      if(d.ancient) ancient = true;
      const name = canon(h.raw);
      const herb = HB_BY()[name] || HB().find(x=>x.n===name) || null;
      if(map.has(name)){
        const p = map.get(name);
        if(d.grams!=null) p.grams = (p.grams||0) + d.grams;
        p.text = [p.text, d.text].filter(Boolean).join(' + ');
      }else{
        map.set(name, {name, raw:h.raw, alias:h.raw!==name?h.raw:'', text:d.text, grams:d.grams, unit:d.unit, herb});
      }
    });
    return {items:[...map.values()], ancient, raw};
  }
  const POWER = {
    '大黄':1.6,'芒硝':1.7,'甘遂':2,'大戟':2,'芫花':2,'巴豆':2.2,'牵牛子':1.8,'商陆':1.8,
    '附子':1.7,'川乌':2,'草乌':2,'细辛':1.5,'麻黄':1.4,'石膏':1.4,'黄连':1.4,'龙胆草':1.5,
    '水蛭':1.8,'虻虫':1.9,'斑蝥':2.2,'蟾酥':2.2,'马钱子':2.2,'雷公藤':2,'朱砂':1.8,'雄黄':2,
    '麝香':2,'冰片':1.4,'人参':1.5,'黄芪':1.2,'熟地':1.2,'山茱萸':1.2,'五味子':1.1,
    '甘草':0.8,'大枣':0.6,'生姜':0.7,'薄荷':0.6,'茯苓':0.8,'山药':0.8,'薏苡仁':0.8,
    '神曲':0.8,'麦芽':0.8,'谷芽':0.8,'灯心草':0.6,'竹叶':0.7,'饴糖':0.8
  };
  const CATS = [
    {k:'解表', re:/解表|发汗|疏风|散风|透疹|宣肺/},
    {k:'清热', re:/清热|泻火|解毒|凉血|清暑|清虚热|退虚热/},
    {k:'泻下', re:/泻下|攻下|润肠|逐水|通便/},
    {k:'祛湿', re:/利水|渗湿|化湿|燥湿|利湿|通淋|退黄|利胆/},
    {k:'祛风湿', re:/祛风湿|通络|强筋骨|舒筋/},
    {k:'温里', re:/温中|散寒|回阳|温经|温阳/},
    {k:'理气', re:/理气|行气|降气|疏肝|解郁/},
    {k:'消食', re:/消食|化积|健胃|消痞/},
    {k:'活血', re:/活血|化瘀|祛瘀|破血|通经/},
    {k:'止血', re:/止血/},
    {k:'化痰止咳', re:/化痰|止咳|平喘|润肺|下气|消痰/},
    {k:'安神', re:/安神|定惊|镇心|养心/},
    {k:'开窍', re:/开窍|醒神|辟秽/},
    {k:'补益', re:/补气|补血|补阴|补阳|益气|养血|滋阴|温肾|补肾|健脾|填精|生津|补脾|补肝|补肺/},
    {k:'收涩', re:/收敛|固涩|涩肠|固精|止汗|缩尿|固冲/},
    {k:'杀虫', re:/杀虫|攻毒|蚀疮|截疟/}
  ];
  function catOf(h){
    const eff = String((h&&h.eff)||'');
    const first = eff.split(/[，,]/)[0] || eff;
    for(const c of CATS){ if(c.re.test(first)) return c.k; }
    for(const c of CATS){ if(c.re.test(eff)) return c.k; }
    return '其他';
  }
  function herbRange(h){
    const m = String((h&&h.dose)||'').match(/(\d+(?:\.\d+)?)\s*(?:[~～\-—至]\s*(\d+(?:\.\d+)?))?/);
    if(!m) return null;
    const a = parseFloat(m[1]), b = m[2] ? parseFloat(m[2]) : a;
    return {min:a, max:b, mid:(a+b)/2};
  }
  const NAT_RE = /(大寒|微寒|寒|凉|大热|微温|温|热|平)/;
  const FLAVORS = ['辛','甘','酸','苦','咸','淡','涩'];
  function natureOf(h){
    const s = String((h&&h.nat)||'');
    const m = s.match(/[，,]\s*(大寒|微寒|寒|凉|大热|微温|温|热|平)/) || s.match(NAT_RE);
    return m ? m[1] : '';
  }
  function natGroup(x){
    if(/寒|凉/.test(x)) return '寒凉';
    if(/温|热/.test(x)) return '温热';
    if(x==='平') return '平';
    return '未标';
  }
  function merList(h){
    return String((h&&h.mer)||'').replace(/经/g,'').split(/[、,，]/).map(s=>s.trim()).filter(Boolean);
  }
  /* ============ 合方拆解 ============
     判「像不像」用 Jaccard，方子一大就被稀释：一首 18 味的合方，跟任何单方都只有 20% 相似。
     临床读方不是这样读的——看的是「这张方里含了哪几首经典方，各占几成」。
     所以换指标：覆盖率 = 该方组成中被本方用到的味数 ÷ 该方总味数。
     左金丸 2 味全在 → 100%；旋覆代赭汤 7 味用到 5 味 → 71%；苍附导痰丸 10 味只用 4 味 → 40%。
     再用贪心逐首摘出，已被前一首解释完的药不重复计。 */

  /* 比对用的药名归一：党参可代人参，比对时视同一味（只影响匹配，不改药性与剂量） */
  const SUBST = {'党参':'人参'};
  const mkey = n => SUBST[n] || n;
  /* 同效互代的小方：2 味方缺一味时，若同类药在场，按「相代」处理并注明 */
  const ALT_GROUPS = [['浙贝母','瓦楞子','海蛤壳','牡蛎']];

  function altOf(n){
    const g = ALT_GROUPS.find(x=>x.includes(n));
    return g ? g.filter(x=>x!==n) : [];
  }
  function jacSet(a,b){
    let s = 0; a.forEach(x=>{ if(b.has(x)) s++; });
    return s/(a.size+b.size-s);
  }
  function decompose(rowsIn){
    const nameOf = new Map();     // 归一后的键 → 输入里实际写的药名
    rowsIn.forEach(r=>{
      const c = canon(r.name);
      if(!nameOf.has(mkey(c))) nameOf.set(mkey(c), c);
    });
    const inKey = new Set(nameOf.keys());
    const used = new Set();
    const taken = [];
    const pool = FM().map(f=>{
      const keys = [...new Set((f.c||[]).map(x=>canon(x.h)).map(mkey))];
      const hit = keys.filter(k=>inKey.has(k));
      return {f, keys, set:new Set(keys), hit, size:keys.length, cov:hit.length/keys.length, alt:'', altKey:'', altFor:''};
    });

    for(let step=0; step<6; step++){
      let best = null, bestScore = 0;
      pool.forEach(c=>{
        if(c.size < 2) return;
        if(taken.some(t=>jacSet(t.set, c.set) >= 0.8)) return;   // 近似重复，只留信息量大的那首
        const fresh = c.hit.filter(k=>!used.has(k));
        if(!fresh.length) return;
        let ok = false;
        if(c.cov === 1) ok = true;
        else if(c.size <= 3) ok = c.cov >= 2/3;
        else if(c.size <= 6) ok = c.cov >= 0.55;
        else ok = c.cov >= 0.45;
        let alt = '';
        if(!ok && c.size === 2){
          const miss = c.keys.filter(k=>!inKey.has(k));
          const sub = miss.find(m=>altOf(m).some(a=>inKey.has(mkey(a))));
          if(sub){
            const present = altOf(sub).find(a=>inKey.has(mkey(a)));
            ok = true;
            alt = `以${nameOf.get(mkey(present))||present}代${sub}`;
            c.altKey = mkey(present); c.altFor = sub;
          }
        }
        if(!ok) return;
        /* 大方给一点体量分：8 味方命中 4 味，信息量仍大于 3 味方命中 2 味 */
        const score = c.cov*3 + Math.min(fresh.length,4)*1.2 + Math.min(c.size,9)*0.35 - (alt?0.6:0);
        if(score > bestScore){ bestScore = score; best = c; if(alt) best.alt = alt; }
      });
      if(!best) break;
      best.hit.forEach(k=>used.add(k));
      if(best.altKey) used.add(best.altKey);
      taken.push(best);
    }

    const comps = taken.map(c=>{
      const hits = c.hit.map(k=>{
        const inName = nameOf.get(k) || k;
        const fName = (c.f.c||[]).map(x=>x.h).find(h=>mkey(canon(h))===k) || inName;
        return {inName, fName, subst: inName !== fName};
      });
      if(c.altKey) hits.push({inName:nameOf.get(c.altKey)||c.altKey, fName:c.altFor, subst:true, asSub:true});
      const miss = (c.f.c||[]).map(x=>x.h).filter(h=>!inKey.has(mkey(canon(h))));
      return {f:c.f, cov:c.cov, size:c.size, hits, miss, alt:c.alt, eff:c.f.eff||''};
    }).sort((a,b)=>b.cov-a.cov || b.size-a.size || a.f.n.localeCompare(b.f.n));

    const residual = [...inKey].filter(k=>!used.has(k)).map(k=>nameOf.get(k) || k);
    return {comps, residual, explained:used.size, totalIn:inKey.size};
  }

  /* 合方功效：把各首方的功效拆成关键词计数，看这张方整体在打哪几个方向 */
  const EFF_KEY = ['健脾','和胃','益气','补气','降逆','止呕','制酸','止痛','活血','化瘀','行气','理气',
    '疏肝','清肝','泻火','清热','化痰','燥湿','温中','散寒','收敛','止血','养阴','生津','安神','消食','通络','护膜'];

  function buildRes(parsed){
    const items = parsed.items.filter(x=>x.herb || x.name);
    if(!items.length){
      return {error:'没有识别出药材名。请按「桂枝 9g」一行一味地写，或直接粘贴一首方的组成。'};
    }
    const rows = items.map(it=>{
      const h = it.herb;
      const rng = h ? herbRange(h) : null;
      const ratio = (it.grams!=null && rng && rng.mid) ? it.grams/rng.mid : 1;
      const power = POWER[it.name] != null ? POWER[it.name] : (h ? ({'泻下':1.35,'开窍':1.3,'温里':1.15,'活血':1.15,'清热':1.08,'解表':1.05}[catOf(h)]||1) : 1);
      return {name:it.name, raw:it.raw, alias:it.alias, text:it.text, grams:it.grams, unit:it.unit,
        herb:h, rng, ratio, power, score:Math.max(.35, Math.min(3, ratio))*power, cat:h?catOf(h):'其他', role:''};
    });
    /* 君臣佐使：按「相对常用量的倍数 × 药力系数」排序，再按规则分档 */
    const sorted = rows.slice().sort((a,b)=>b.score-a.score);
    const first = sorted[0];
    const kingN = (rows.length>=6 && sorted[1] && sorted[1].score >= first.score*0.85) ? 2 : 1;
    const SHI = new Set(['甘草','大枣','生姜','薄荷','灯心草','竹叶','桔梗']);
    sorted.forEach((r,i)=>{
      if(i < kingN) r.role = '君';
      else if(i < kingN+3 && r.score >= first.score*0.55) r.role = '臣';
      else r.role = (SHI.has(r.name) && r.score < first.score*(r.name==='甘草'?0.95:0.7)) ? '使' : '佐';
    });
    const total = rows.reduce((a,r)=>a+(r.grams||0),0);
    const maxP = Math.max(...rows.map(r=>r.power));
    const avgScore = rows.reduce((a,r)=>a+r.score,0)/rows.length;
    let level;
    if(maxP>=1.65 && rows.some(r=>r.ratio>=0.8)) level = {k:'峻猛', d:'方中含峻烈药，药力峻猛，宜中病即止，不可久服；剂量与炮制须严格按药典。'};
    else if(avgScore>=1.3) level = {k:'较强', d:'药力偏强，多用于实证、急症；取效后应及时调整或减量。'};
    else if(rows.length<=6 && total>0 && total<=60) level = {k:'轻灵', d:'药味少、用量轻，取「轻可去实」之意，多用于上焦病或体虚者。'};
    else level = {k:'平和', d:'药力平和，攻补兼施，适合慢性病缓图，仍需随证加减。'};

    /* 性味归经统计（按药味数，不按剂量） */
    const nat = {'寒凉':0,'温热':0,'平':0,'未标':0};
    const flavor = {}; const mer = {};
    rows.forEach(r=>{
      if(!r.herb) return;
      nat[natGroup(natureOf(r.herb))]++;
      const fs = String(r.herb.nat||'').split(/[，,]/)[0].split('、');
      fs.forEach(f=>{ if(FLAVORS.includes(f)) flavor[f]=(flavor[f]||0)+1; });
      merList(r.herb).forEach(m=>{ mer[m]=(mer[m]||0)+1; });
    });
    const merTop = Object.entries(mer).sort((a,b)=>b[1]-a[1]).slice(0,4);
    const flavorTop = Object.entries(flavor).sort((a,b)=>b[1]-a[1]);

    /* 合方拆解：这张方更像哪几首经典方的叠加 */
    const decomp = decompose(rows);

    /* 单方相似度（合方已拆出来的不再重复列） */
    const inSet = new Set(rows.map(r=>canon(r.name)));
    const inKey = new Set([...inSet].map(mkey));
    const compNames = new Set(decomp.comps.map(c=>c.f.n));
    const allCmp = FM().map(f=>{
      const s = new Set((f.c||[]).map(x=>canon(x.h)));
      const ks = new Set([...s].map(mkey));
      let shared = 0;
      const common = [];
      ks.forEach(x=>{ if(inKey.has(x)){ shared++; common.push(x); } });
      if(shared < 2) return null;
      const union = inKey.size + ks.size - shared;
      return {f, shared, common,
        j: shared/union,
        cov: shared/ks.size,
        contain: shared/Math.min(inKey.size, ks.size),
        miss:[...s].filter(x=>!inKey.has(mkey(x))),
        extra:[...inSet].filter(x=>!ks.has(mkey(x)))};
    }).filter(Boolean).sort((a,b)=>b.cov-a.cov || b.j-a.j || b.shared-a.shared);
    const cmp = allCmp.filter(c=>!compNames.has(c.f.n)).slice(0,4);

    /* 组成与原方完全一致时，直接采用原方标注的君臣佐使（比按用量猜更权威） */
    const docHit = allCmp.find(c=>c.j===1) || null;
    let doc = null;
    if(docHit){
      doc = {name:docHit.f.n, book:docHit.f.book, roles:(docHit.f.c||[]).map(x=>({h:x.h, r:x.r||'', note:x.note||''}))};
      const rm = new Map(doc.roles.map(x=>[mkey(canon(x.h)), x.r]));
      rows.forEach(r=>{ r.guessRole = r.role; const rr = rm.get(mkey(canon(r.name))); if(rr) r.docRole = rr; });
      rows.forEach(r=>{ if(r.docRole) r.role = r.docRole; });
    }

    /* 功效归纳：按君臣佐使加权 */
    const W = {'君':3,'臣':2,'佐':1,'使':.5};
    const eff = {};
    rows.forEach(r=>{
      if(!r.herb) return;
      String(r.herb.eff||'').split(/[，,]/).forEach(t=>{
        t = t.trim();
        if(t.length<3 || t==='调和诸药') return;
        const o = eff[t] = eff[t] || {w:0,c:0};
        o.w += (W[r.docRole || r.role]||1); o.c++;
      });
    });
    const effTop = Object.entries(eff).sort((a,b)=>b[1].w-a[1].w).slice(0,6).map(([t,o])=>({t, c:o.c, w:o.w}));

    /* 安全核查 */
    const S = window.SAFETY || {};
    const eq = n => [n, ...(((S.equiv||{})[n])||[])].map(canon);
    const hasAny = list => list.some(x=>inSet.has(x));
    const collide = (a,b)=>{
      const as = eq(a), bs = eq(b);
      return as.some(x=>inSet.has(x)) && bs.some(y=>inSet.has(y));
    };
    const safety = {fan:[], wei:[], preg:[], toxic:[], over:[]};
    (S.fan||[]).forEach(g=>{
      (g.b||[]).forEach(b=>{ if(collide(g.a,b)) safety.fan.push({t:'十八反', d:g.a+' 反 '+b, s:g.s||''}); });
    });
    (S.wei||[]).forEach(g=>{
      String(g.a||'').split(/[、,，]/).forEach(a=>{
        if(collide(a,g.b)) safety.wei.push({t:'十九畏', d:a+' 畏 '+g.b, s:g.d||''});
      });
    });
    rows.forEach(r=>{
      if((S.pregBan||[]).includes(r.name)) safety.preg.push({n:r.name, lv:'禁用'});
      else if((S.pregCare||[]).includes(r.name)) safety.preg.push({n:r.name, lv:'慎用'});
      if(r.herb && /(大毒|小毒|有毒)/.test(String(r.herb.cau||'')) && !/无毒/.test(String(r.herb.cau||'')))
        safety.toxic.push(r.name);
      if(r.grams!=null && r.rng && r.grams > r.rng.max*1.8) safety.over.push({n:r.name, now:r.grams, max:r.rng.max});
    });

    /* 煎法提示 */
    const deco = [];
    rows.forEach(r=>{
      if(!r.herb) return;
      const t = String(r.herb.dec||'');
      const m = t.match(/(先煎|后下|包煎|另煎|另炖|烊化|冲服|煎汤代水|泡服)/);
      if(m) deco.push({n:r.name, tip:t.split(/[；;。]/)[0]});
    });

    return {rows, total, level, nat, flavorTop, merTop, effTop, cmp, safety, deco, doc, ancient:parsed.ancient,
      comp:decomp.comps, residual:decomp.residual, explained:decomp.explained, inN:decomp.totalIn};
  }

  function roleWhy(r){
    const x = r.ratio;
    const d = x>=1.6 ? '用量偏重' : x>=1.05 ? '用量稍重' : x>=0.7 ? '用量居中' : '用量偏轻';
    return `${d}（常量的 ${x.toFixed(1)} 倍）· 药力 ${r.power.toFixed(1)}`;
  }
  function renderRes(R){
    if(!R) return '';
    if(R.error) return `<div class="card" style="margin-top:14px;text-align:center;color:var(--muted)">${esc(R.error)}</div>`;
    const {rows, total, level, nat, flavorTop, merTop, effTop, cmp, safety, deco, ancient, doc, comp, residual, explained, inN} = R;
    const topByScore = rows.slice().sort((a,b)=>b.score-a.score)[0] || {name:'—', ratio:1};
    const cnt = {君:0,臣:0,佐:0,使:0};
    rows.forEach(r=>cnt[r.role]++);
    const roleRows = ['君','臣','佐','使'].map(role=>{
      const list = rows.filter(r=>r.role===role);
      if(!list.length) return '';
      return `<div class="ax-role">
        <span class="role ${roleMap[role]}">${role}</span>
        <b>${esc(list.map(r=>r.name).join('、'))}</b>
        <span class="why">${esc(list.map(r=>(list.length>1?r.name+' ':'')+roleWhy(r)).join('；'))}</span>
      </div>`;
    }).join('');
    const natTxt = ['寒凉','温热','平','未标'].filter(k=>nat[k]).map(k=>`${k} ${nat[k]}`).join(' · ');
    const cmpHTML = cmp.length ? cmp.map(c=>{
      const pct = Math.round(c.j*100);
      let desc;
      if(c.j===1){
        const sameDose = (c.f.c||[]).every(x=>{
          const r = rows.find(rr=>canon(rr.name)===canon(x.h));
          const g = parseFloat(String(x.g||''));
          return !r || r.grams==null || isNaN(g) || Math.abs(r.grams-g) < 0.01;
        });
        desc = `组成与《${c.f.book}》${c.f.n}完全一致${sameDose?'，用量也基本一致':'，但用量有出入'}。`;
      }
      else if(c.contain===1 && c.miss.length) desc = `本方即 <b>${esc(c.f.n)}</b> 去 ${c.miss.map(esc).join('、')}，属原方加减。`;
      else if(c.contain===1 && c.extra.length) desc = `本方即 <b>${esc(c.f.n)}</b> 加 ${c.extra.map(esc).join('、')}。`;
      else desc = `共同 ${c.shared} 味（${c.common.map(esc).join('、')}）${c.extra.length?`；本方多 ${c.extra.map(esc).join('、')}`:''}${c.miss.length?`；少 ${c.miss.map(esc).join('、')}`:''}。`;
      return `<div class="ax-cmp">
        <div class="hd2"><b>${esc(c.f.n)}</b><span class="tag">${esc(c.f.book)}</span>
          <span class="mini">相似 ${pct}%</span><span class="ax-bar"><i style="width:${pct}%"></i></span></div>
        <div class="d">${desc}</div>
      </div>`;
    }).join('') : `<div class="mini">没有找到组成相近（共同药 ≥ 2 味）的经典方，可能是自拟方，或药味差异较大。</div>`;

    const compHTML = (comp && comp.length) ? (()=>{
      const ek = {};
      comp.forEach(c=>EFF_KEY.forEach(k=>{ if(String(c.eff||'').includes(k)) ek[k]=(ek[k]||0)+1; }));
      const ekTop = Object.entries(ek).sort((a,b)=>b[1]-a[1] || a[0].localeCompare(b[0])).slice(0,7);
      return `<div class="ax-sec card ax-comp">
      <div class="between" style="align-items:baseline;gap:8px;flex-wrap:wrap">
        <h4>合方拆解<span class="mini">看这首经典方在你这张方里出现了几成</span></h4>
        <span class="tag brand">已解释 ${explained} / ${inN} 味</span>
      </div>
      <div style="margin-top:8px">
        ${comp.map(c=>{
          const pct = Math.round(c.cov*100);
          const hitTxt = c.hits.map(h=>esc(h.inName)+(h.subst?`<span class="mini" style="display:inline">（代${esc(h.fName)}）</span>`:'')).join('、');
          return `<div class="ax-cmp">
            <div class="hd2">
              <b>${esc(c.f.n)}</b>
              <span class="tag plain">${esc(c.f.book)}</span>
              <span class="mini">含 ${c.hits.length}/${c.size} 味 · ${pct}%</span>
              <span class="ax-bar"><i style="width:${pct}%"></i></span>
              <a class="tag" style="text-decoration:none;margin-left:auto" href="#/formula/${encodeURIComponent(c.f.n)}">原方 →</a>
            </div>
            <div class="d"><span class="hit">${hitTxt}</span>${c.miss.length?`　<span class="miss">缺 ${c.miss.map(esc).join('、')}</span>`:'　<span class="hit">组成全在</span>'}</div>
            <div class="mini" style="margin-top:3px">功效：${esc(c.eff)}${c.alt?`　· ${esc(c.alt)}` : ''}</div>
          </div>`;
        }).join('')}
      </div>
      ${residual && residual.length?`<div class="d" style="margin-top:10px;font-size:12.4px;color:var(--muted);line-height:1.9">
        <b style="color:var(--ink-2)">余下 ${residual.length} 味</b>：${residual.map(esc).join('、')}——<span style="color:var(--muted)">放在「加减」里看：或针对兼证，或是库中未收的小方、药对。</span></div>`:''}
      ${ekTop.length?`<div class="chips" style="margin-top:11px">
        ${ekTop.map(([k,v])=>`<span class="chip on" style="cursor:default">${esc(k)}${v>1?`<em style="font-style:normal;opacity:.65;margin-left:5px;font-family:var(--mono);font-size:10.5px">×${v}</em>`:''}</span>`).join('')}
      </div>`:''}
      <p class="mini" style="margin-top:7px">上面这排是各方功效的关键词并集（出现几次标 ×n），大致就是这张方在打的几个方向。合方不是简单相加：<b>重复药味要去重减量</b>，寒热攻补相反的药要重新权衡，剂量比例也随主治变。</p>
    </div>`;
    })() : '';

    const docHTML = doc ? `<div class="ax-sec card" style="padding:12px 15px;border-color:var(--jade)">
      <div class="row" style="gap:9px;align-items:baseline">
        <span class="tag jade">与原方一致</span>
        <span style="font-size:12.8px;line-height:1.8">组成与《${esc(doc.book)}》<b>${esc(doc.name)}</b>完全相同，君臣佐使已按原方标注（见下）；与下方的「按用量推测」对照，能看出剂量与君位并不是一回事。</span>
        <a class="tag brand" style="text-decoration:none;margin-left:auto" href="#/formula/${encodeURIComponent(doc.name)}">看原方 →</a>
      </div>
    </div>` : '';

    const warnList = [];
    safety.fan.forEach(x=>warnList.push(`<div class="warn sm" style="margin-top:8px"><span class="ic">!</span><div class="tx"><b>${esc(x.t)}：${esc(x.d)}</b><span style="display:block;margin-top:2px">${esc(x.s)}</span></div></div>`));
    safety.wei.forEach(x=>warnList.push(`<div class="warn sm" style="margin-top:8px"><span class="ic">!</span><div class="tx"><b>${esc(x.t)}：${esc(x.d)}</b><span style="display:block;margin-top:2px">${esc(x.s)}</span></div></div>`));
    if(safety.preg.length) warnList.push(`<div class="warn sm" style="margin-top:8px"><span class="ic">!</span><div class="tx"><b>妊娠用药</b><span style="display:block;margin-top:2px">${safety.preg.map(x=>`${esc(x.n)}（${x.lv}）`).join('、')}。妊娠期须由医师权衡，禁用者不可用。</span></div></div>`);
    if(safety.toxic.length) warnList.push(`<div class="warn sm" style="margin-top:8px"><span class="ic">!</span><div class="tx"><b>毒性药</b><span style="display:block;margin-top:2px">${safety.toxic.map(esc).join('、')}：药典标注有毒，须严格控量、按法炮制。</span></div></div>`);
    if(safety.over.length) warnList.push(`<div class="warn sm" style="margin-top:8px"><span class="ic">!</span><div class="tx"><b>用量超出常用量</b><span style="display:block;margin-top:2px">${safety.over.map(x=>`${esc(x.n)} ${x.now}g（常用上限 ${x.max}g）`).join('；')}。超量使用须有明确依据。</span></div></div>`);

    return `
    <div class="ax-sec">
      <div class="kpi">
        <div class="box"><b>${rows.length}</b><span>药味</span></div>
        <div class="box"><b>${total?Math.round(total)+'g':'—'}</b><span>总重（可折算部分）</span></div>
        <div class="box"><b>${cnt.君}/${cnt.臣}/${cnt.佐}/${cnt.使}</b><span>君/臣/佐/使</span></div>
        <div class="box"><b>${esc(level.k)}</b><span>药力评级</span></div>
      </div>
      <p class="mini" style="margin-top:9px">${esc(level.d)}</p>
      ${axActions(R)}
    </div>

    ${compHTML}

    ${docHTML}

    <div class="ax-sec card">
      <h4>组成与单味分析<span class="mini">性味归经与功效取自药材库</span></h4>
      <div class="tbl-wrap" style="margin-top:10px;max-height:none">
        <table class="tbl ax-tbl">
          <thead><tr><th>角色</th><th>药材</th><th>用量</th><th>性味</th><th>归经</th><th>功效</th><th>相对常量</th></tr></thead>
          <tbody>${rows.map(r=>{
            const h = r.herb;
            const over = r.grams!=null && r.rng && r.grams>r.rng.max*1.8;
            return `<tr>
              <td><span class="role ${roleMap[r.role]}">${r.role}</span></td>
              <td><b style="font-family:var(--serif);font-size:14px">${h?`<a href="#/herb/${encodeURIComponent(r.name)}" style="border-bottom:1px dashed var(--line)">${esc(r.name)}</a>`:esc(r.name)}</b>${r.alias?`<span class="mini" style="display:block">原写「${esc(r.alias)}」</span>`:''}</td>
              <td>${esc(r.text||'未标')}</td>
              <td>${h?esc(h.nat):'—'}</td>
              <td>${h?esc(h.mer):'—'}</td>
              <td style="font-size:12.2px">${h?esc(h.eff):'<span class="mini">药材库暂无此药</span>'}</td>
              <td>${r.rng?`<span style="color:${over?'var(--danger)':'var(--muted)'};font-family:var(--mono);font-size:11.5px">${r.ratio.toFixed(1)}×</span>`:'—'}</td>
            </tr>`;
          }).join('')}</tbody>
        </table>
      </div>
      <p class="mini" style="margin-top:9px">「相对常量」= 本方用量 ÷ 该药常用量的中值。超过 1.8 倍标红，只作提示，不等于错误——经方原量本就常大于今用。</p>
    </div>

    <div class="ax-sec card">
      <h4>${doc?'君臣佐使（原方标注）':'君臣佐使（按用量推测）'}<span class="mini">${doc?'取自《'+esc(doc.book)+'》'+esc(doc.name):'用量 ÷ 常用量中值 × 药力系数'}</span></h4>
      <div style="margin-top:8px">${roleRows}</div>
      <p class="mini" style="margin-top:8px">${doc
        ? `组成与原方一致，角色直接采用原书标注。若只按用量算，得分最高的是 <b>${esc(topByScore.name)}</b>（${topByScore.ratio.toFixed(1)} 倍常量）——剂量最大不等于君位，君药是由「治什么证」定的。`
        : `真实君臣佐使要看「药与证、药与药」的关系，不只看剂量：同一味药在不同方里可以是君，也可以是佐使。此处的排序只是给你一个起点。${comp && comp.length>=3?`<br>这张方是 <b>${comp.length} 首方叠加</b>而成，单个「全方君药」意义不大——各方原本的君药见上面的合方拆解（如 ${comp.slice(0,3).map(c=>esc(c.f.n)+'：'+esc((c.f.c.find(x=>x.r&&x.r[0]==='君')||{}).h||'—')).join('、')}）。`:''}`}</p>
    </div>

    <div class="ax-sec card">
      <h4>功效归纳<span class="mini">${doc?'按原方君臣佐使加权，取前 6 项':'按推测的君臣佐使加权，取前 6 项'}</span></h4>
      <div class="chips" style="margin-top:10px">
        ${effTop.map(x=>`<span class="chip on brand" style="cursor:default">${esc(x.t)}<em style="font-style:normal;opacity:.7;margin-left:5px;font-family:var(--mono);font-size:10.5px">${x.c} 味</em></span>`).join('') || '<span class="mini">药材库缺少功效字段</span>'}
      </div>
      <div class="ds-meta" style="margin-top:12px">
        <span class="tag">${esc(natTxt||'性味未标')}</span>
        ${flavorTop.slice(0,4).map(([k,v])=>`<span class="tag plain">${esc(k)} ${v}</span>`).join('')}
        ${merTop.map(([k,v])=>`<span class="tag jade">${esc(k)} ${v}</span>`).join('')}
      </div>
      <p class="mini" style="margin-top:8px">性味按药味计数（不是按重量）：${esc(natTxt||'—')}；归经取前四位。全方偏寒多主热证，偏温多主寒证，寒热并用则多属寒热错杂。</p>
    </div>

    <div class="ax-sec card">
      <h4>其它相近方<span class="mini">合方已拆出的不再重复；按「这首方被用到的比例」排序</span></h4>
      <div style="margin-top:6px">${cmpHTML}</div>
      <p class="mini" style="margin-top:8px">相似度高不代表「就是这首方」：同一组药，用量与君臣佐使一变，方名与主治就变了（如桂枝汤 vs 桂枝加桂汤）。判断合方要看上面的「合方拆解」——覆盖率比相似度可靠。</p>
    </div>

    <div class="ax-sec card">
      <h4>安全核查<span class="mini">十八反 / 十九畏 / 妊娠 / 毒性 / 超量</span></h4>
      ${warnList.length ? warnList.join('') : `<p class="mini" style="margin-top:8px">未发现十八反、十九畏、妊娠禁忌或明显超量。仍须结合患者体质、肝肾功能与合并用药复核。</p>`}
      ${ancient?`<p class="mini" style="margin-top:8px">输入中含「钱 / 两 / 分」等古制单位，已按 1 两 = 30g、1 钱 = 3g、1 分 = 0.3g 粗算；汉制与现代换算差别很大，精确折算请看「剂量换算器」。</p>`:''}
    </div>

    ${deco.length?`<div class="ax-sec card">
      <h4>煎法提示<span class="mini">按药材库的特殊煎法字段</span></h4>
      <div style="margin-top:8px">${deco.map(x=>`<div class="ax-role"><b>${esc(x.n)}</b><span class="why" style="font-family:inherit;font-size:12.3px">${esc(x.tip)}</span></div>`).join('')}</div>
    </div>`:''}

    <p class="mini" style="margin-top:14px;line-height:1.9">本解析由「用量 × 药力系数」与药材库功效字段推算，适合用来检查自己的组方思路，不能替代医师辨证。含毒性药、妊娠用药、十八反配伍的方，务必由执业中医师审核。</p>`;
  }

  let AX = null;
  const DEMOS = {
    '桂枝汤':'桂枝 9g\n白芍 9g\n生姜 9g\n大枣 20g\n炙甘草 6g',
    '大承气汤':'大黄 12g\n芒硝 9g\n枳实 12g\n厚朴 24g',
    '龙胆泻肝汤':'龙胆草 6g\n黄芩 9g\n栀子 9g\n泽泻 12g\n木通 6g\n车前子 9g\n当归 3g\n生地黄 9g\n柴胡 6g\n生甘草 6g'
  };
  function analyzePage(params, seg){
    const preset = params && params.get ? (params.get('f')||'') : '';
    const rxId = params && params.get ? (params.get('rx')||'') : '';
    if(rxId){
      const it = rxGet(rxId);
      if(it && (!AX || AX.rxId !== rxId)){
        AX = buildRes(parseRx(it.raw));
        AX.raw = it.raw; AX.rawName = ''; AX.rxId = it.id; AX.rxAt = it.at;
      }
    }else if(preset && FM().some(f=>f.n===preset)){
      const f = FM().find(x=>x.n===preset);
      if(!AX || AX.rawName!==preset){
        const raw = (f.c||[]).map(x=>`${x.h} ${x.g||''}`).join('\n');
        AX = buildRes(parseRx(raw)); AX.raw = raw; AX.rawName = preset;
      }
    }
    return `<div class="view">
      <div class="row" style="margin-bottom:12px">
        <a class="btn btn-sm" href="#/tools">← 工具台</a>
        <a class="btn btn-sm" href="#/rx">我的方${rxList().length?' · '+rxList().length:''}</a>
      </div>
      <h1 style="font-size:26px">方剂解析</h1>
      <p style="font-size:13px;color:var(--muted);margin-top:4px">把药味和剂量贴进来，看它像哪首经典方、君臣佐使怎么排、药力有多强、有没有配伍禁忌</p>

      <div class="card" style="margin-top:14px">
        <textarea id="axIn" class="ax-in" spellcheck="false" placeholder="一行一味，药名后跟剂量：&#10;桂枝 9g&#10;白芍 9g&#10;生姜 9g&#10;大枣 20g&#10;炙甘草 6g">${esc(AX && AX.raw ? AX.raw : '')}</textarea>
        <div class="ax-row">
          <button class="btn btn-primary btn-sm" id="axGo">开始解析</button>
          ${Object.keys(DEMOS).map(k=>`<button class="btn btn-sm" data-demo="${esc(k)}">示例：${esc(k)}</button>`).join('')}
          <button class="btn btn-sm" id="axClear">清空</button>
        </div>
        <p class="mini" style="margin-top:9px">支持「9g」「9克」「三钱」「一两」；药名可用别名（芍药、生地、炙甘草、川军…）。系统会自动归到药材库正名。</p>
      </div>

      <div id="axOut">${renderRes(AX)}</div>

      ${!AX?`<div class="card" style="margin-top:14px">
        <h4 style="font-size:15px">它是怎么分析的</h4>
        <div class="mini" style="margin-top:8px;line-height:2">
          ① <b style="color:var(--ink)">识药</b>：按最长匹配认药名，别名归正名，剂量换算为克（古制粗算）。<br>
          ② <b style="color:var(--ink)">排君臣</b>：用「用量 ÷ 该药常用量」乘「药力系数」排序，前 1~2 味为君，其后为臣，甘草、姜枣一类归使。<br>
          ③ <b style="color:var(--ink)">归纳功效</b>：把每味药的功效按君臣佐使加权，取高频项；再统计性味与归经。<br>
          ④ <b style="color:var(--ink)">找类方</b>：与方剂库 ${FM().length} 首逐首比对药味重合度，列出最接近的 5 首及差几味。<br>
          ⑤ <b style="color:var(--ink)">查禁忌</b>：十八反、十九畏、妊娠禁忌、毒性药、超量，逐项核对。
        </div>
      </div>`:''}
    </div>`;
  }
  function runAnalyze(){
    const el = document.getElementById('axIn');
    if(!el) return;
    const prev = AX, raw = el.value;
    const parsed = parseRx(raw);
    AX = buildRes(parsed);
    AX.raw = raw;
    AX.rawName = '';
    /* 内容没改（只是重新算一遍）时，保留「我的方」的归属，方便直接更新 */
    if(prev && prev.rxId && (prev.raw||'').trim() === raw.trim()){
      AX.rxId = prev.rxId; AX.rxAt = prev.rxAt;
    }
    const out = document.getElementById('axOut');
    if(out) out.innerHTML = renderRes(AX);
    bindAxAct(AX);
    const card = out && out.querySelector('.ax-sec');
    if(card && card.scrollIntoView) card.scrollIntoView({behavior:'smooth', block:'start'});
  }
  function bindAnalyze(){
    const go = document.getElementById('axGo');
    if(go) go.onclick = runAnalyze;
    const cl = document.getElementById('axClear');
    if(cl) cl.onclick = ()=>{ const el=document.getElementById('axIn'); if(el){ el.value=''; el.focus(); } AX=null; const out=document.getElementById('axOut'); if(out) out.innerHTML=''; };
    document.querySelectorAll('[data-demo]').forEach(b=>{
      b.onclick = ()=>{
        const el = document.getElementById('axIn');
        if(!el) return;
        el.value = DEMOS[b.dataset.demo] || '';
        runAnalyze();
      };
    });
    const el = document.getElementById('axIn');
    if(el) el.onkeydown = e=>{ if((e.ctrlKey||e.metaKey) && e.key==='Enter'){ e.preventDefault(); runAnalyze(); } };
    bindAxAct(AX);
  }

  /* ==================================================================
     三、我的方：把当前解析结果存到本地，随时打开 / 导出 / 备份
     ================================================================== */
  const ST = () => window.Store;
  const rxList = () => (ST() ? ST().rxList() : []);
  const rxGet = id => (ST() ? ST().rxGet(id) : null);
  const rxNewId = () => 'rx' + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
  function rxDate(ts){
    const d = new Date(ts || Date.now()), p = n => String(n).padStart(2,'0');
    return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }
  function suggestName(R){
    if(R && R.doc) return R.doc.name + '（我的）';
    const rows = (R && R.rows) || [];
    if(!rows.length) return '我的方';
    return rows[0].name + '等 ' + rows.length + ' 味';
  }
  function safeFileName(s){
    return String(s||'方剂解析').replace(/[\\/:*?"<>|\s]+/g,'-').slice(0,40);
  }
  function downloadFile(name, text, mime){
    try{
      const blob = new Blob(['\ufeff' + text], {type: mime || 'text/plain;charset=utf-8'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = name;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(()=>URL.revokeObjectURL(url), 3000);
      return true;
    }catch(e){ return false; }
  }
  function copyText(txt, btn){
    const done = ok=>{
      if(!btn) return;
      const old = btn.textContent;
      btn.textContent = ok ? '已复制 ✓' : '复制失败';
      setTimeout(()=>{ btn.textContent = old; }, 1600);
    };
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(txt).then(()=>done(true)).catch(()=>{
        const ta = document.createElement('textarea');
        ta.value = txt; ta.style.position='fixed'; ta.style.opacity='0';
        document.body.appendChild(ta); ta.select();
        let ok=false; try{ ok = document.execCommand('copy'); }catch(e){}
        ta.remove(); done(ok);
      });
    }else{
      const ta = document.createElement('textarea');
      ta.value = txt; ta.style.position='fixed'; ta.style.opacity='0';
      document.body.appendChild(ta); ta.select();
      let ok=false; try{ ok = document.execCommand('copy'); }catch(e){}
      ta.remove(); done(ok);
    }
  }
  function axText(R){
    if(!R || R.error) return '';
    const L = [];
    L.push('JellyTCM · 方剂解析');
    L.push(new Date().toLocaleString('zh-CN'));
    if(R.doc) L.push('组成与《' + R.doc.book + '》' + R.doc.name + '一致，君臣佐使按原方标注');
    L.push('');
    L.push('【组成】' + R.rows.length + ' 味' + (R.total ? '，可折算总重约 ' + Math.round(R.total) + 'g' : ''));
    R.rows.forEach(r=>{
      const h = r.herb || {};
      L.push('  ' + [r.role, r.name, r.text || '未标', h.nat || '', h.mer || '', h.eff || ''].filter(Boolean).join('　'));
    });
    if(R.comp && R.comp.length){
      L.push('');
      L.push('【合方拆解】已解释 ' + R.explained + '/' + R.inN + ' 味');
      R.comp.forEach(c=>{
        L.push('  ' + c.f.n + '（《' + c.f.book + '》' + Math.round(c.cov*100) + '%，含 ' + c.hits.length + '/' + c.size + ' 味）'
          + '：' + c.hits.map(h=>h.inName + (h.subst ? '（代' + h.fName + '）' : '')).join('、')
          + (c.miss.length ? '；缺 ' + c.miss.join('、') : '')
          + '；功效 ' + c.eff);
      });
      if(R.residual && R.residual.length) L.push('  余下（加减）：' + R.residual.join('、'));
    }
    L.push('');
    L.push('【君臣佐使】' + (R.doc ? '按原方标注' : '按用量推测'));
    ['君','臣','佐','使'].forEach(k=>{
      const l = R.rows.filter(r=>r.role===k);
      if(l.length) L.push('  ' + k + '：' + l.map(r=>r.name + (r.text ? ' ' + r.text : '')).join('、'));
    });
    L.push('');
    L.push('【功效归纳】' + (R.effTop.map(x=>x.t).join('、') || '—'));
    const natTxt = ['寒凉','温热','平','未标'].filter(k=>R.nat[k]).map(k=>k + ' ' + R.nat[k]).join(' · ');
    L.push('【性味归经】' + (natTxt || '—')
      + (R.merTop.length ? '；归经 ' + R.merTop.map(([k,v])=>k + ' ' + v).join('、') : ''));
    if(R.cmp.length){
      L.push('');
      L.push('【与经典方比对】');
      R.cmp.forEach(c=>{
        L.push('  ' + c.f.n + '（《' + c.f.book + '》）相似 ' + Math.round(c.j*100) + '%'
          + (c.common.length ? '；共同 ' + c.common.join('、') : '')
          + (c.extra.length ? '；本方多 ' + c.extra.join('、') : '')
          + (c.miss.length ? '；本方少 ' + c.miss.join('、') : ''));
      });
    }
    L.push('');
    L.push('【安全核查】');
    const safe = [];
    R.safety.fan.forEach(x=>safe.push(x.t + '：' + x.d));
    R.safety.wei.forEach(x=>safe.push(x.t + '：' + x.d));
    if(R.safety.preg.length) safe.push('妊娠用药：' + R.safety.preg.map(x=>x.n + '（' + x.lv + '）').join('、'));
    if(R.safety.toxic.length) safe.push('毒性药：' + R.safety.toxic.join('、'));
    if(R.safety.over.length) safe.push('超量：' + R.safety.over.map(x=>x.n + ' ' + x.now + 'g（上限 ' + x.max + 'g）').join('；'));
    if(safe.length) safe.forEach(s=>L.push('  ' + s));
    else L.push('  未发现十八反、十九畏、妊娠禁忌或明显超量');
    if(R.deco.length){
      L.push('');
      L.push('【煎法提示】');
      R.deco.forEach(x=>L.push('  ' + x.n + '：' + x.tip));
    }
    L.push('');
    L.push('—— 由「用量 × 药力系数」与药材库功效字段推算，仅供学习，不能替代医师辨证。');
    return L.join('\n');
  }

  function axActions(R){
    const saved = R.rxId ? rxGet(R.rxId) : null;
    const dirty = saved && String(saved.raw||'').trim() !== String(R.raw||'').trim();
    const n = rxList().length;
    return `<div class="ax-act" id="axAct">
      <div class="row" style="gap:8px;flex-wrap:wrap;align-items:center">
        ${saved
          ? `<button class="btn btn-primary btn-sm" data-ax="save">${dirty?'更新「'+esc(saved.name)+'」（含改动）':'更新「'+esc(saved.name)+'」'}</button>
             <button class="btn btn-sm" data-ax="saveAs">另存为新方</button>`
          : `<button class="btn btn-primary btn-sm" data-ax="save">存为我的方</button>`}
        <button class="btn btn-sm" data-ax="txt">导出 TXT</button>
        <button class="btn btn-sm" data-ax="copy">复制</button>
        <a class="btn btn-sm" href="#/rx">我的方${n?' · '+n:''}</a>
      </div>
      ${saved?`<p class="mini" style="margin-top:7px">已存入「我的方」，可到那里<b>改名 / 删除 / 导出</b>${dirty?'；当前内容与已保存版本不同，点「更新」覆盖':''}。</p>`:''}
      <div class="ax-save" id="axSaveBox" hidden>
        <input id="axName" class="ix-q" maxlength="40" autocomplete="off"
          value="${esc(saved?saved.name:suggestName(R))}" placeholder="给这首方起个名字，如「跟师抄方 · 咳嗽案 3」">
        <div class="row" style="gap:8px;margin-top:8px;align-items:center;flex-wrap:wrap">
          <button class="btn btn-primary btn-sm" data-ax="doSave">保存</button>
          <button class="btn btn-sm" data-ax="cancel">取消</button>
          <span class="mini" id="axSaveTip">只存在本机浏览器；会随「数据」页的 JSON 备份一起导出</span>
        </div>
      </div>
    </div>`;
  }
  function bindAxAct(R){
    const box = document.getElementById('axAct');
    if(!box || !R) return;
    box.querySelectorAll('[data-ax]').forEach(b=>{
      b.onclick = ()=>{
        const k = b.dataset.ax;
        const s = document.getElementById('axSaveBox');
        if(k==='save'){
          if(s){ s.hidden = false; const i=document.getElementById('axName'); if(i){ i.focus(); i.select&&i.select(); } }
        }else if(k==='saveAs'){
          R.rxId = null; R.rxAt = null; refreshAct();
          const s2 = document.getElementById('axSaveBox');
          if(s2){ s2.hidden = false; const i=document.getElementById('axName'); if(i){ i.value = suggestName(R); i.focus(); } }
        }else if(k==='cancel'){
          if(s) s.hidden = true;
        }else if(k==='doSave'){
          axSaveNow(R);
        }else if(k==='txt'){
          downloadFile('JellyTCM-方剂解析-' + safeFileName(suggestName(R)) + '.txt', axText(R));
        }else if(k==='copy'){
          copyText(axText(R), b);
        }
      };
    });
  }
  function refreshAct(){
    const old = document.getElementById('axAct');
    if(!old || !AX) return;
    const t = document.createElement('div');
    t.innerHTML = axActions(AX);
    const nw = t.firstElementChild;
    old.replaceWith(nw);
    bindAxAct(AX);
  }
  function axSaveNow(R){
    if(!R || R.error || !ST()) return;
    const inp = document.getElementById('axName');
    const name = ((inp && inp.value) || '').trim().slice(0,40) || suggestName(R);
    const rec = ST().rxUpsert({
      id: R.rxId || rxNewId(), name,
      raw: R.raw || '', n: R.rows.length, total: Math.round(R.total||0),
      level: R.level ? R.level.k : '', doc: R.doc ? R.doc.name : '',
      at: R.rxAt || Date.now(), updated: Date.now()
    });
    if(rec){ R.rxId = rec.id; R.rxAt = rec.at; }
    refreshAct();
  }

  let rxQ = '';
  function myfCard(x){
    const k = ((x.name||'') + ' ' + (x.raw||'') + ' ' + (x.doc||'')).toLowerCase();
    const lines = String(x.raw||'').split('\n');
    return `<div class="card myf-card" data-id="${esc(x.id)}" data-k="${esc(k)}">
      <div class="between" style="align-items:flex-start;gap:10px">
        <h4 style="font-size:15.5px">${esc(x.name)}</h4>
        <span class="tag plain" style="font-family:var(--mono);font-size:10.5px">${esc(rxDate(x.updated||x.at))}</span>
      </div>
      <div class="ds-meta">
        <span class="tag">${x.n||0} 味</span>
        ${x.total?`<span class="tag">约 ${x.total}g</span>`:''}
        ${x.level?`<span class="tag jade">${esc(x.level)}</span>`:''}
        ${x.doc?`<span class="tag brand">近《${esc(x.doc)}》</span>`:''}
      </div>
      <div class="myf-raw">${esc(lines.slice(0,3).join('\n'))}${lines.length>3?'\n…':''}</div>
      <div class="row" style="gap:8px;margin-top:10px;flex-wrap:wrap">
        <a class="btn btn-sm btn-primary" href="#/analyze?rx=${encodeURIComponent(x.id)}">打开</a>
        <button class="btn btn-sm" data-myf="ren">改名</button>
        <button class="btn btn-sm" data-myf="del">删除</button>
      </div>
      <div class="myf-ren" hidden>
        <input class="ix-q" maxlength="40" value="${esc(x.name)}" autocomplete="off">
        <div class="row" style="gap:8px;margin-top:8px">
          <button class="btn btn-sm btn-primary" data-myf="renOk">保存名字</button>
          <button class="btn btn-sm" data-myf="renNo">取消</button>
        </div>
      </div>
    </div>`;
  }
  function rxPage(){
    const list = rxList();
    return `<div class="view">
      <div class="row" style="margin-bottom:12px"><a class="btn btn-sm" href="#/analyze">← 方剂解析</a></div>
      <h1 style="font-size:26px">我的方</h1>
      <p style="font-size:13px;color:var(--muted);margin-top:4px">自己拼的、跟师抄的、随手改的方都放这儿——打开即重解析，可导出 TXT 带走</p>
      <div class="card" style="margin-top:14px;padding:12px 15px">
        <input id="rxQ" class="ix-q" value="${esc(rxQ)}" placeholder="搜方名 / 药名 / 方源，如「咳嗽」「黄芪」" autocomplete="off">
        <div class="row" style="gap:8px;margin-top:10px;flex-wrap:wrap;align-items:center">
          <button class="btn btn-sm" id="rxExp">导出全部（JSON）</button>
          <button class="btn btn-sm" id="rxImpBtn">导入 JSON</button>
          <input type="file" id="rxImp" accept=".json,application/json" style="display:none">
          <span class="mini" id="rxInfo">共 ${list.length} 首 · 只存本机浏览器</span>
        </div>
      </div>
      ${list.length
        ? `<div class="ds-list" id="rxList">${list.map(myfCard).join('')}</div>
           <div class="card" id="rxEmpty" style="display:none;margin-top:14px;text-align:center;color:var(--muted)">没有匹配的方</div>`
        : `<div class="card" style="margin-top:14px;text-align:center;padding:26px 18px">
             <b style="color:var(--ink);font-family:var(--serif);font-size:15px">还没有保存过方</b>
             <p class="mini" style="margin-top:6px">去「方剂解析」贴一组药味，解析后点「存为我的方」。</p>
             <a class="btn btn-sm btn-primary" style="margin-top:12px" href="#/analyze">去解析</a>
           </div>`}
    </div>`;
  }
  function bindRx(){
    const q = document.getElementById('rxQ');
    if(q){
      q.oninput = ()=>{
        rxQ = q.value.trim().toLowerCase();
        let n = 0;
        document.querySelectorAll('#rxList .myf-card').forEach(el=>{
          const show = !rxQ || (el.dataset.k||'').includes(rxQ);
          el.style.display = show ? '' : 'none';
          if(show) n++;
        });
        const info = document.getElementById('rxInfo');
        if(info) info.textContent = rxQ ? `筛出 ${n} / ${rxList().length} 首` : `共 ${rxList().length} 首 · 只存本机浏览器`;
        const em = document.getElementById('rxEmpty'); if(em) em.style.display = n ? 'none' : '';
      };
      if(rxQ) q.oninput();
    }
    document.querySelectorAll('#rxList .myf-card').forEach(card=>{
      const id = card.dataset.id;
      const ren = card.querySelector('.myf-ren');
      const h4 = card.querySelector('h4');
      const delBtn = card.querySelector('[data-myf="del"]');
      const renBtn = card.querySelector('[data-myf="ren"]');
      if(renBtn) renBtn.onclick = ()=>{ if(ren){ ren.hidden = false; const i=ren.querySelector('input'); if(i){ i.focus(); i.select&&i.select(); } } };
      const noBtn = card.querySelector('[data-myf="renNo"]');
      if(noBtn) noBtn.onclick = ()=>{ if(ren) ren.hidden = true; };
      const okBtn = card.querySelector('[data-myf="renOk"]');
      if(okBtn) okBtn.onclick = ()=>{
        const inp = ren.querySelector('input');
        const nm = (inp.value||'').trim();
        if(!nm || !ST()) return;
        ST().rxRename(id, nm);
        if(h4) h4.textContent = nm;
        card.dataset.k = (nm + ' ' + (card.dataset.k||'')).toLowerCase();
        ren.hidden = true;
      };
      if(delBtn) delBtn.onclick = ()=>{
        if(delBtn.dataset.armed !== '1'){
          delBtn.dataset.armed = '1'; delBtn.textContent = '确认删除？';
          setTimeout(()=>{ if(delBtn.isConnected){ delBtn.dataset.armed=''; delBtn.textContent='删除'; } }, 2600);
          return;
        }
        if(ST()) ST().rxRemove(id);
        card.remove();
        const left = document.querySelectorAll('#rxList .myf-card').length;
        const info = document.getElementById('rxInfo');
        if(info) info.textContent = `共 ${left} 首 · 只存本机浏览器`;
        if(!left && window.APP && APP.route) APP.route();
      };
    });
    const exp = document.getElementById('rxExp');
    if(exp) exp.onclick = ()=>{
      const payload = {app:'JellyTCM', kind:'myformulas', version:1,
        exportedAt:new Date().toISOString(), data:rxList()};
      downloadFile('jellytcm-myformulas-' + (ST()?ST().todayKey().replace(/-/g,''):'') + '.json',
        JSON.stringify(payload, null, 2), 'application/json');
    };
    const impBtn = document.getElementById('rxImpBtn'), imp = document.getElementById('rxImp');
    if(impBtn && imp){
      impBtn.onclick = ()=>imp.click();
      imp.onchange = ()=>{
        const f = imp.files && imp.files[0]; if(!f) return;
        const rd = new FileReader();
        rd.onload = ()=>{
          let arr = null;
          try{
            const o = JSON.parse(String(rd.result));
            arr = Array.isArray(o) ? o
              : (o && Array.isArray(o.data) ? o.data
              : (o && o.data && Array.isArray(o.data.rx) ? o.data.rx : null));
          }catch(e){ arr = null; }
          if(!arr){
            const info = document.getElementById('rxInfo');
            if(info) info.textContent = '导入失败：不是本页导出的 JSON';
            return;
          }
          if(ST()) ST().rxImport(arr);
          if(window.APP && APP.route) APP.route();
        };
        rd.readAsText(f);
      };
    }
  }

  /* ================= 注册 ================= */
  window.CLINIC = {
    parseRx, buildRes, formulaDiseases, axText, rxList,
    diseases: DIS, canon, analyze: ()=>AX
  };
  window.PAGES = Object.assign(window.PAGES || {}, {
    disease: diseasePage,
    analyze: analyzePage,
    rx: rxPage
  });
  window.PAGE_BIND = Object.assign(window.PAGE_BIND || {}, {
    disease: bindDisease,
    analyze: bindAnalyze,
    rx: bindRx
  });
})();
