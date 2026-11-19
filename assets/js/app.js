/* ================= 应用主逻辑 ================= */
(function(){
  const FM = window.FM || [], HB = window.HB || [], TY = window.TY || {};
  const SONGS = window.SONGS || [];
  const TRAIT = window.HB_TRAIT || {};
  const SYM = window.SYMPTOMS || [];
  const WX = window.WUXING || {rows:[],zangfu:[]};
  const ACU = (window.TY && window.TY.acupoints) || [];
  const HB_BY = {}; HB.forEach(h=>HB_BY[h.n]=h);
  const HB_ALIAS = window.HB_ALIAS || {};
  const ALIAS_OF = {};
  Object.keys(HB_ALIAS).forEach(k=>{
    if(HB_BY[HB_ALIAS[k]] && !HB_BY[k]) HB_BY[k] = HB_BY[HB_ALIAS[k]];
    (ALIAS_OF[HB_ALIAS[k]] = ALIAS_OF[HB_ALIAS[k]] || []).push(k);
  });
  const FM_BY = {}; FM.forEach(f=>FM_BY[f.n]=f);
  const $ = (s,r)=> (r||document).querySelector(s);
  const $$ = (s,r)=> [...(r||document).querySelectorAll(s)];
  const esc = s => String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  /* 允许数据里用 **强调** 标记加粗（先转义再转 <b>，避免注入） */
  const mdB = s => esc(s).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  const view = ()=> $('#view');
  const LIU_KEYS = ['太阳','阳明','少阳','太阴','少阴','厥阴'];
  const ACU_HOME = ['百会','太阳','风池','合谷','内关','足三里','三阴交','关元']
    .map(n=>{ const p = BODY.ACU_POS[n]; return p ? {n, ...p} : null; }).filter(Boolean);
  /* 读取当前主题的常用配色（图表 SVG 用） */
  function C(){
    const cs = getComputedStyle(document.documentElement);
    const g = k => (cs.getPropertyValue(k)||'').trim();
    return {
      brand:g('--brand'), brandSoft:g('--brand-soft'), jade:g('--jade'), accent:g('--accent'),
      line:g('--line'), line2:g('--line-2'), muted:g('--muted'), card:g('--card'),
      card2:g('--card-2'), ink:g('--ink'), ink2:g('--ink-2'), panel:g('--panel')
    };
  }
  function liuGroup(f){
    const s = f.liu || '';
    for(const k of LIU_KEYS) if(s.startsWith(k)) return k+'病';
    if(/卫分|气分|营分|血分/.test(s)) return '温病';
    return '其他';
  }

  /* ============ 像素水母插画（首页 hero 用） ============ */
  function jellyArt(){
    const U = 8, cx = 100;
    // 伞盖：自下而上收拢的像素穹顶
    const rows = [[56,5],[64,7],[72,9],[80,11],[88,12],[96,13],[104,13],[112,12],[120,11]];
    const bell = rows.map(([y,w])=>
      `<rect x="${cx-w*U/2}" y="${y}" width="${w*U}" height="${U}" fill="url(#hjBell)"/>`
    ).join('');
    // 伞底裙边：6 段扇贝，自最后一行下垂
    const lip = [0,1,2,3,4,5].map(i=>{
      const x = cx - 5.5*U + i*14.4;
      return `<rect x="${x.toFixed(1)}" y="128" width="12" height="8" fill="url(#hjBell)"/>`;
    }).join('');
    // 触手：正弦摆动的像素链（首尾相接）
    function tentacle(x, len, col, delay, amp){
      let out = '';
      for(let i=0;i<len;i++){
        const y = 136 + i*8;
        const dx = Math.sin(i*0.8 + x*0.09) * amp;
        const op = Math.max(.3, 1 - i/(len*1.15)).toFixed(2);
        out += `<rect x="${(x+dx).toFixed(1)}" y="${y}" width="7" height="9" fill="${col}" opacity="${op}"/>`;
      }
      return `<g class="pulse" style="animation-delay:${delay}s">${out}</g>`;
    }
    const tents = [
      tentacle(54, 9,  '#7ff2e8', 0,   2.4),
      tentacle(70, 13, '#9c7bf0', .45, 1.8),
      tentacle(86, 10, '#7ff2e8', .85, 2.6),
      tentacle(102,13, '#9c7bf0', .25, 2.0),
      tentacle(118,10, '#7ff2e8', .65, 2.6),
      tentacle(134,9,  '#9c7bf0', .15, 2.2)
    ].join('');
    return `<svg viewBox="0 0 200 248" shape-rendering="crispEdges" role="img" aria-label="像素水母">
      <defs>
        <linearGradient id="hjBell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#d6fffa"/>
          <stop offset="45%" stop-color="#5fe6da"/>
          <stop offset="100%" stop-color="#158b86"/>
        </linearGradient>
        <radialGradient id="hjAura" cx="50%" cy="42%" r="52%">
          <stop offset="0%" stop-color="#7ff2e8" stop-opacity=".32"/>
          <stop offset="100%" stop-color="#7ff2e8" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="96" rx="94" ry="88" fill="url(#hjAura)"/>
      <g opacity=".5" fill="#7ff2e8">
        <rect x="20" y="52" width="2" height="2"/><rect x="176" y="74" width="2" height="2"/>
        <rect x="32" y="200" width="2" height="2"/><rect x="168" y="186" width="2" height="2"/>
        <rect x="152" y="34" width="2" height="2"/><rect x="44" y="30" width="2" height="2"/>
      </g>
      ${bell}${lip}
      <rect x="52" y="112" width="96" height="8" fill="#0a2f38" opacity=".18"/>
      <rect x="76" y="84" width="10" height="10" fill="#061d24"/>
      <rect x="112" y="84" width="10" height="10" fill="#061d24"/>
      <rect x="78" y="86" width="4" height="4" fill="#e9fffb"/>
      <rect x="114" y="86" width="4" height="4" fill="#e9fffb"/>
      <rect x="94" y="102" width="12" height="4" fill="#061d24" opacity=".4"/>
      ${tents}
    </svg>`;
  }

  /* ============ 水墨水母（古籍主题 hero） ============ */
  function inkJelly(){
    return `<svg viewBox="0 0 260 300" aria-hidden="true">
      <defs>
        <linearGradient id="inkA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3a2a18" stop-opacity=".78"/>
          <stop offset="52%" stop-color="#6b5433" stop-opacity=".55"/>
          <stop offset="100%" stop-color="#8a7350" stop-opacity=".26"/>
        </linearGradient>
        <radialGradient id="inkW" cx="50%" cy="46%" r="52%">
          <stop offset="0%" stop-color="#8a7350" stop-opacity=".16"/>
          <stop offset="100%" stop-color="#8a7350" stop-opacity="0"/>
        </radialGradient>
        <filter id="inkB"><feGaussianBlur stdDeviation="1.1"/></filter>
      </defs>
      <ellipse cx="130" cy="120" rx="118" ry="106" fill="url(#inkW)"/>
      <g class="ink-cap">
        <path d="M42 96c4-34 40-58 88-58s84 24 88 58c1 7-3 11-9 11H51c-6 0-10-4-9-11z" fill="url(#inkA)"/>
        <path d="M48 103c8 8 20 8 28 0 9 9 21 9 30 0 9 9 21 9 30 0 9 9 21 9 30 0 8 8 20 8 28 0" fill="none" stroke="#5b4423" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/>
        <path d="M70 76c14-12 36-18 58-18" fill="none" stroke="#f8efd8" stroke-opacity=".55" stroke-width="4" stroke-linecap="round"/>
        <g fill="#f8efd8" opacity=".85">
          <ellipse cx="106" cy="86" rx="7" ry="9"/><ellipse cx="150" cy="86" rx="7" ry="9"/>
        </g>
        <g fill="#3a2a18"><ellipse cx="106" cy="88" rx="3" ry="4"/><ellipse cx="150" cy="88" rx="3" ry="4"/></g>
        <g stroke="#4a3518" stroke-opacity=".45" stroke-width="2.4" fill="none" stroke-linecap="round" filter="url(#inkB)">
          <path d="M74 116c-6 26 4 48-4 72-4 12-2 22 4 30"/>
          <path d="M100 118c4 30-2 54 2 80 2 12 0 20-2 28"/>
          <path d="M126 118c-2 28 4 52 0 78-2 14 2 24 4 30"/>
          <path d="M152 118c4 26-2 50 4 74 4 12 2 22-2 30"/>
          <path d="M176 116c8 24 0 46 8 68 4 12 6 20 2 28"/>
        </g>
        <g stroke="#8a7350" stroke-opacity=".3" stroke-width="1.2" fill="none">
          <path d="M86 120c-3 22 3 40-1 58"/><path d="M114 122c2 26-1 48 1 70"/>
          <path d="M162 122c3 24-1 46 2 66"/>
        </g>
      </g>
      <g transform="translate(196 236) rotate(-6)">
        <rect width="46" height="46" rx="3" fill="#94301f" opacity=".92"/>
        <rect x="2.4" y="2.4" width="41.2" height="41.2" fill="none" stroke="#f8efd8" stroke-opacity=".5" stroke-width="1"/>
        <g fill="#f8efd8" font-family="var(--serif)" font-size="11.5" text-anchor="middle">
          <text x="14" y="19">水</text><text x="32" y="19">母</text>
          <text x="14" y="35">中</text><text x="32" y="35">醫</text>
        </g>
      </g>
    </svg>`;
  }

  /* ============ 首页 ============ */
  function pageHome(){
    const st = Store.stats(FM.length);
    const due = FM.filter(f=>Store.isDue(f.n));
    const news = FM.filter(f=>Store.isNew(f.n));
    const pct = Math.min(100, Math.round((st.todayNew+st.todayReview)*100/(st.goal*2||20)));
    const guideCards = TY.guides.map((g,i)=>`
      <div class="card hover" style="padding:16px 18px">
        <div class="row" style="gap:8px;margin-bottom:6px">
          <span class="tag brand">${esc(g.step)}</span>
        </div>
        <h4 style="font-size:15.5px">${esc(g.t)}</h4>
        <p style="font-size:12.8px;color:var(--muted);margin-top:6px;line-height:1.75">${esc(g.d)}</p>
      </div>`).join('');

    return `
    <div class="view">
      <section class="hero">
        <div class="hero-jelly" aria-hidden="true"><div class="float">${jellyArt()}</div></div>
        <div class="hero-ink" aria-hidden="true">${inkJelly()}</div>
        <div class="kicker">JELLY&nbsp;TCM&nbsp;/&nbsp;伤寒论 · 金匮要略 · 黄帝内经 · 本草纲目</div>
        <h1>顺着记忆的水流，<em>一证一方</em>地学中医</h1>
        <p>以《伤寒论》《金匮要略》为骨，以《神农本草经》《本草纲目》为肉。把六经辨证、君臣佐使、炮制与煎法，拆成每天十分钟就能记住的小卡片。答错的方子自动进入错题本，再按艾宾浩斯曲线游回来找你。</p>
        <div class="actions">
          <a class="btn btn-primary btn-lg" href="#/quiz?scope=new">开始今日学习</a>
          <a class="btn btn-lg" href="#/quiz?scope=due">复习到期 ${due.length} 首</a>
          <a class="btn btn-lg" href="#/theory">先看六经理论</a>
        </div>
        <div class="hero-meta">
          <span><b>${FM.length}</b> 首方剂</span>
          <span><b>${HB.length}</b> 味药材</span>
          <span><b>${SONGS.length}</b> 首汤头歌诀</span>
          <span><b>${TY.meridians.length}</b> 条经脉</span>
          <span><b>${TY.paozhi.length}</b> 种炮制法</span>
          <span><b>10</b> 阶记忆曲线</span>
        </div>
      </section>

      <div class="grid g4" style="margin-top:20px">
        <div class="stat">
          <div class="lab">今日目标</div>
          <div class="row" style="justify-content:space-between;align-items:center">
            <div>
              <div class="val">${st.todayNew+st.todayReview}<small>/ ${st.goal*2} 题</small></div>
              <div class="sub">新学 ${st.todayNew} · 复习 ${st.todayReview}</div>
            </div>
            <div class="ring" style="--p:${pct}"><span>${pct}<small>%</small></span></div>
          </div>
        </div>
        <div class="stat">
          <div class="lab">已学方剂</div>
          <div class="val">${st.learned}<small>/ ${FM.length} 首</small></div>
          <div class="bar"><i style="width:${Math.round(st.learned*100/FM.length)}%"></i></div>
          <div class="sub" style="margin-top:6px">掌握（≥15天间隔）${st.mastered} 首</div>
        </div>
        <div class="stat">
          <div class="lab">今日正确率</div>
          <div class="val">${st.accuracy}<small>%</small></div>
          <div class="bar jade"><i style="width:${st.accuracy}%"></i></div>
          <div class="sub" style="margin-top:6px">对 ${st.todayCorrect} · 错 ${st.todayWrong}</div>
        </div>
        <div class="stat">
          <div class="lab">连续打卡</div>
          <div class="val">${st.streak}<small>天</small></div>
          <div class="sub" style="margin-top:2px">错题本待攻克 ${st.wrongOpen} 首</div>
          <div class="row" style="margin-top:8px">
            <a class="btn btn-sm" href="#/wrong">打开错题本</a>
          </div>
        </div>
      </div>

      <div class="sec"><h2>今日学习路线</h2><span class="hint">按记忆曲线自动安排，照着做就行</span></div>
      <div style="margin-bottom:18px">${window.FEAT ? window.FEAT.dailyQuote() : ''}</div>
      <div class="grid g3">
        <div class="card">
          <div class="row"><span class="tag brand">第 1 步</span><h4 style="font-size:15.5px">新学 5 首方剂</h4></div>
          <p style="font-size:12.8px;color:var(--muted);margin:8px 0 12px">先看方剂详情，理解君臣佐使，再做选择题检验。剩余未学 ${news.length} 首。</p>
          <a class="btn btn-sm btn-dark" href="#/quiz?scope=new&n=5">开始</a>
        </div>
        <div class="card">
          <div class="row"><span class="tag gold">第 2 步</span><h4 style="font-size:15.5px">复习到期的 ${due.length} 首</h4></div>
          <p style="font-size:12.8px;color:var(--muted);margin:8px 0 12px">这些是你在 1/2/4/7/15/30 天前学过的内容，今天正好该回忆一次。</p>
          <a class="btn btn-sm btn-dark" href="#/quiz?scope=due">复习</a>
        </div>
        <div class="card">
          <div class="row"><span class="tag jade">第 3 步</span><h4 style="font-size:15.5px">攻克错题 ${st.wrongOpen} 首</h4></div>
          <p style="font-size:12.8px;color:var(--muted);margin:8px 0 12px">连续答对 3 次才算过关，系统会自动把过关的题移出错题本。</p>
          <a class="btn btn-sm btn-dark" href="#/quiz?scope=wrong">去攻克</a>
        </div>
      </div>

      <div class="sec"><h2>常看图表</h2><span class="hint">零基础先把这三张图看懂</span><a class="more" href="#/charts">全部图表 →</a></div>
      <div class="grid g3">
        <div class="card" style="padding:16px">
          <div class="between" style="margin-bottom:6px"><h4 style="font-size:15.5px">十二经脉循行</h4><span class="tag">经络</span></div>
          ${BODY.meridian()}
          <p style="font-size:12.2px;color:var(--muted);line-height:1.8;margin-top:8px">"经脉所过，主治所及"。太阳经行于项背，故太阳病见头项强痛；少阳经行于两胁，故见胸胁苦满。</p>
          <a class="btn btn-sm" href="#/charts" style="margin-top:10px">看图解经络 →</a>
        </div>
        <div class="card" style="padding:16px">
          <div class="between" style="margin-bottom:6px"><h4 style="font-size:15.5px">常用穴位</h4><span class="tag">针灸</span></div>
          ${BODY.acupoints(ACU_HOME, true)}
          <div style="display:flex;flex-wrap:wrap;gap:3px 10px;margin-top:8px;font-size:11.5px;color:var(--ink-2)">${ACU_HOME.map((p,i)=>`<span>${i+1}. ${p.n}</span>`).join('')}</div>
          <p style="font-size:12.2px;color:var(--muted);line-height:1.8;margin-top:8px">合谷治面口、内关调心胸、足三里健脾胃、三阴交调妇科。先记四总穴，够用很久。</p>
          <a class="btn btn-sm" href="#/charts?tab=acu" style="margin-top:10px">看全部穴位 →</a>
        </div>
        <div class="card" style="padding:16px">
          <div class="between" style="margin-bottom:6px"><h4 style="font-size:15.5px">一张图看懂六经</h4><span class="tag">辨证</span></div>
          ${liujingWheel()}
          <p style="font-size:12.2px;color:var(--muted);line-height:1.8;margin-top:8px">六经不是六个器官，而是六种"病位＋病性"的组合。由表入里、由阳转阴，是外感病传变的一般规律。</p>
          <a class="btn btn-sm" href="#/theory" style="margin-top:10px">学六经辨证 →</a>
        </div>
      </div>

      <div class="sec"><h2>入门学习指南</h2><span class="hint">给完全没基础的人</span><a class="more" href="#/theory">理论基础 →</a></div>
      <div class="grid g4 stagger">${guideCards}</div>

      <div class="sec"><h2>古代计量换算</h2><span class="hint">"一两"到底是多少克？</span><a class="more" href="#/charts?tab=units">完整换算表 →</a></div>
      <div class="card">
        <div class="grid g4" style="gap:10px">
          ${TY.units.table.slice(0,8).map(u=>`
            <div style="padding:10px 12px;background:var(--card-2);border:1px solid var(--line-2);border-radius:10px">
              <div style="font-family:var(--serif);font-size:15px">${esc(u.a)} <span style="color:var(--muted);font-size:11.5px">= ${esc(u.b)}</span></div>
              <div style="font-size:12px;color:var(--brand);margin-top:3px">${esc(u.c)}</div>
            </div>`).join('')}
        </div>
        <p style="font-size:12.5px;color:var(--muted);margin-top:12px;line-height:1.8">⚠️ ${esc(TY.units.note)}</p>
      </div>

      <div class="sec"><h2>今日待复习</h2><span class="hint">按艾宾浩斯曲线到期</span><a class="more" href="#/plan">复习计划 →</a></div>
      ${due.length ? `<div class="grid auto-280">${due.slice(0,6).map(fCard).join('')}</div>` :
        `<div class="card" style="text-align:center;padding:34px"><p style="color:var(--muted);font-size:13.5px">今天没有到期内容。先去学几首新方子吧 👉 <a href="#/quiz?scope=new" style="color:var(--brand)">开始学习</a></p></div>`}

      <div class="sec"><h2>成就徽章</h2><span class="hint">已点亮 ${badgesHTML(st,true).got} / ${BADGES.length}</span></div>
      ${badgesHTML(st)}
    </div>`;
  }

  /* ============ 成就徽章 ============ */
  const BADGES = [
    {ico:'◎', n:'初窥门径', d:'完成第 1 次答题', t:s=>s.answers>=1},
    {ico:'❖', n:'十方在握', d:'学会 10 首方剂', t:s=>s.learned>=10},
    {ico:'✚', n:'三十而立', d:'学会 30 首方剂', t:s=>s.learned>=30},
    {ico:'✦', n:'百方通', d:'学会 100 首方剂', t:s=>s.learned>=100},
    {ico:'★', n:'全库通关', d:'学会全部方剂', t:s=>s.learned>=FM.length},
    {ico:'▲', n:'三日之约', d:'连续学习 3 天', t:s=>s.streak>=3},
    {ico:'✧', n:'七日不断', d:'连续学习 7 天', t:s=>s.streak>=7},
    {ico:'⌘', n:'月满西楼', d:'连续学习 30 天', t:s=>s.streak>=30},
    {ico:'◈', n:'一箭中的', d:'累计答题 50 且今日正确率 ≥90%', t:s=>s.answers>=50&&s.accuracy>=90},
    {ico:'❂', n:'错题清空', d:'累计答题 20 且错题本无待攻克', t:s=>s.answers>=20&&s.wrongOpen===0},
    {ico:'⬢', n:'记忆大师', d:'掌握 20 首（复习间隔 ≥15 天）', t:s=>s.mastered>=20},
    {ico:'✎', n:'开方初试', d:'开方练习首次过关（≥80 分）', t:()=>{ const g = window.FEAT?window.FEAT.games():{}; return (g.rxOk||0)>=1; }},
    {ico:'▦', n:'拼图巧手', d:'方剂拼图满分 3 次', t:()=>{ const g = window.FEAT?window.FEAT.games():{}; return (g.pzPerfect||0)>=3; }},
    {ico:'☾', n:'夜航水母', d:'开启「深渊」夜海主题', t:()=>document.documentElement.dataset.theme==='dark'}
  ];
  function badgesHTML(st, countOnly){
    const got = BADGES.filter(b=>{ try{ return b.t(st); }catch(e){ return false; } });
    if(countOnly) return {got:got.length};
    return `<div class="badges">${BADGES.map(b=>{
      const on = got.includes(b);
      return `<div class="badge ${on?'got':''}" title="${esc(b.d)}">
        <div class="ico">${b.ico}</div><b>${esc(b.n)}</b><span>${esc(b.d)}</span>
      </div>`;
    }).join('')}</div>`;
  }

  function fCard(f){
    return `<div class="fcard" data-go="#/formula/${encodeURIComponent(f.n)}">
      <h4>${esc(f.n)}</h4>
      <div class="herbs">${esc(f.c.map(x=>x.h).join('、'))}</div>
      <div class="meta"><span class="tag">${esc(f.cat.split('·')[0])}</span><span class="tag plain book-mark">${esc(f.book)}</span></div>
    </div>`;
  }

  /* ============ 六经轮盘 ============ */
  function liujingWheel(){
    const P = C();
    const items = TY.liujing;
    const cx=170, cy=150, R=104;
    const cols = ['#5f9e7f','#c9a04a','#a8ad52','#c0a866','#6f93ab','#a86b7e'];
    const nodes = items.map((it,i)=>{
      const ang = -90 + i*60, rad = ang*Math.PI/180;
      const x = cx + Math.cos(rad)*R, y = cy + Math.sin(rad)*R*0.82;
      const col = cols[i%6];
      const biao = it.biaoli.replace(/（.*?）/g,'').replace('半表半里','半表里');
      return `<g class="lj-node" data-go="#/theory/${it.key}" style="cursor:pointer">
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="27" fill="${P.card}" stroke="${col}" stroke-width="1.6"/>
        <text x="${x.toFixed(1)}" y="${(y-2).toFixed(1)}" text-anchor="middle" font-size="12.5" font-family="serif" fill="${P.ink}">${it.name.slice(0,2)}</text>
        <text x="${x.toFixed(1)}" y="${(y+13).toFixed(1)}" text-anchor="middle" font-size="9" fill="${col}">${biao}</text>
      </g>`;
    }).join('');
    return `<svg viewBox="0 0 340 300" style="width:100%;height:auto">
      <circle cx="170" cy="150" r="72" fill="${P.card2}" stroke="${P.line}" stroke-dasharray="3 4"/>
      <text x="170" y="146" text-anchor="middle" font-size="15" font-family="serif" fill="${P.brand}">六经</text>
      <text x="170" y="166" text-anchor="middle" font-size="10" fill="${P.muted}">由表入里 · 由阳转阴</text>
      ${nodes}
      <text x="170" y="288" text-anchor="middle" font-size="9.5" fill="${P.muted}" font-family="serif">点击任一经查看提纲、病机与现代解释</text>
    </svg>`;
  }

  /* ============ 六经辨证页 ============ */
  function pageTheory(key){
    if(key){
      const it = TY.liujing.find(x=>x.key===key);
      if(it) return theoryDetail(it);
    }
    return `
    <div class="view">
      <div class="sec" style="margin-top:0"><h2>六经辨证总览</h2><span class="hint">《伤寒论》以六经统万病</span></div>
      <div class="card">
        <p style="font-size:13.6px;color:var(--ink-2);line-height:1.9">
          六经辨证是把外感病按<b>病位深浅</b>（表 / 半表半里 / 里）与<b>病性</b>（寒热虚实、阴阳）分成六个阶段。三阳病（太阳、阳明、少阳）多属正盛邪实，治以祛邪为主；三阴病（太阴、少阴、厥阴）多属正气不足，治以扶正或寒热并调。它是方证对应的"地图"——先定位在哪一经，再从该经的方剂里选方。
        </p>
        <div class="grid g2" style="margin-top:16px;align-items:center">
          <div>${liujingWheel()}</div>
          <div>
            <div class="table-mini">
              ${TY.liujing.map(it=>`
              <div class="row" style="padding:9px 0;border-bottom:1px dashed var(--line-2);cursor:pointer" data-go="#/theory/${it.key}">
                <b style="font-family:var(--serif);font-size:15px;min-width:72px">${esc(it.name)}</b>
                <span class="tag">${esc(it.biaoli)}</span>
                <span class="tag ${it.yinyang==='阳'?'gold':'jade'}">${esc(it.hanre)}</span>
                <span style="font-size:12.5px;color:var(--muted);margin-left:auto">${esc(it.treat)}</span>
              </div>`).join('')}
            </div>
            <div class="row" style="margin-top:14px">
              <a class="btn btn-sm" href="#/charts?tab=liujing">看六经病位图 →</a>
              <a class="btn btn-sm btn-dark" href="#/jiangji">逐条读原文精讲 →</a>
            </div>
          </div>
        </div>
      </div>

      <div class="sec"><h2>六经传变规律</h2><span class="hint">病邪是怎么一步步深入的</span></div>
      <div class="card">
        ${biangChart()}
        <div class="grid g3" style="margin-top:16px">
          ${TY.biang.rules.map(r=>`
            <div style="padding:12px 14px;background:var(--card-2);border:1px solid var(--line-2);border-radius:10px">
              <b style="font-family:var(--serif);font-size:14px;color:var(--brand)">${esc(r.t)}</b>
              <p style="font-size:12.4px;color:var(--ink-2);line-height:1.75;margin-top:4px">${esc(r.d)}</p>
            </div>`).join('')}
        </div>
      </div>

      <div class="sec"><h2>卫气营血辨证</h2><span class="hint">温病学的另一套定位法</span></div>
      <div class="card">
        ${BODY.qixue()}
        <div class="grid g4" style="margin-top:14px">
          ${TY.weiqi.map((w,i)=>`
            <div style="padding:13px 15px;border:1px solid var(--line);border-radius:11px;background:var(--card)">
              <div class="row"><b style="font-family:var(--serif);font-size:16px">${esc(w.n)}</b><span class="tag">第 ${i+1} 层</span></div>
              <p style="font-size:12.2px;color:var(--muted);margin-top:6px;line-height:1.7">${esc(w.d)}</p>
              <p style="font-size:12.2px;color:var(--ink-2);margin-top:6px"><b style="color:var(--brand);font-weight:500">主症：</b>${esc(w.sym)}</p>
              <p style="font-size:12.2px;color:var(--ink-2);margin-top:4px"><b style="color:var(--brand);font-weight:500">治法：</b>${esc(w.tr)}</p>
              <p style="font-size:12.2px;color:var(--jade);margin-top:4px">${esc(w.f)}</p>
            </div>`).join('')}
        </div>
      </div>

      <div class="sec"><h2>三焦辨证 & 八纲辨证</h2></div>
      <div class="grid g2">
        <div class="card">
          <h4 style="font-size:16px;margin-bottom:10px">三焦辨证</h4>
          ${TY.sanjiao.map(s=>`
            <div style="padding:10px 0;border-bottom:1px dashed var(--line-2)">
              <div class="row"><b style="font-family:var(--serif);font-size:14.5px">${esc(s.n)}</b><span class="tag">${esc(s.z)}</span></div>
              <p style="font-size:12.3px;color:var(--ink-2);margin-top:4px">${esc(s.d)}</p>
              <p style="font-size:12.3px;color:var(--muted);margin-top:2px">主症：${esc(s.sym)} · 治法：${esc(s.tr)} · ${esc(s.f)}</p>
            </div>`).join('')}
        </div>
        <div class="card">
          <h4 style="font-size:16px;margin-bottom:10px">八纲辨证</h4>
          ${TY.bagang.map(b=>`
            <div style="padding:10px 0;border-bottom:1px dashed var(--line-2)">
              <b style="font-family:var(--serif);font-size:14.5px;color:var(--brand)">${esc(b.n)}</b>
              <p style="font-size:12.4px;color:var(--ink-2);margin-top:3px;line-height:1.75">${esc(b.d)}</p>
            </div>`).join('')}
          <p style="font-size:12.2px;color:var(--muted);margin-top:12px">八纲是总纲，六经、卫气营血、三焦是具体的辨证模型。初学建议：<b style="color:var(--ink)">先用八纲定性，再用六经定位。</b></p>
        </div>
      </div>
    </div>`;
  }

  function biangChart(){
    const P = C();
    const nodes = TY.biang.order;
    return `<svg viewBox="0 0 720 134" style="width:100%;height:auto">
      ${nodes.map((n,i)=>{
        const x = 30 + i*112;
        const col = i<3 ? P.accent : P.jade;
        return `<g>
          <rect x="${x}" y="34" width="86" height="42" rx="4" fill="${P.card}" stroke="${col}" stroke-width="1.4"/>
          <text x="${x+43}" y="61" text-anchor="middle" font-size="14" font-family="serif" fill="${P.ink}">${n}</text>
          ${i<5?`<path d="M${x+88} 55h20" stroke="${P.muted}" stroke-width="1.3"/><path d="M${x+104} 51l6 4-6 4" fill="${P.muted}"/>`:''}
        </g>`;
      }).join('')}
      <text x="30" y="104" font-size="10" fill="${P.accent}">三阳（表 · 实 · 热）</text>
      <text x="366" y="104" font-size="10" fill="${P.jade}">三阴（里 · 虚 · 寒）</text>
      <text x="30" y="122" font-size="10" fill="${P.muted}" font-family="monospace">← 病位由浅入深 · 正气由盛转衰</text>
    </svg>`;
  }

  function theoryDetail(it){
    const fangs = it.fang.map(n=>FM_BY[n]).filter(Boolean);
    return `
    <div class="view">
      <div class="row" style="margin-bottom:10px">
        <a class="btn btn-sm" href="#/theory">← 六经总览</a>
        <span class="tag brand">${esc(it.biaoli)}</span>
        <span class="tag ${it.yinyang==='阳'?'gold':'jade'}">${esc(it.hanre)}</span>
        <span class="tag">${esc(it.xushi)}</span>
      </div>
      <h1 style="font-size:30px">${esc(it.name)}</h1>
      <p style="color:var(--muted);font-size:13px;margin-top:4px">${esc(it.sub)}　·　脏腑：${esc(it.zangfu)}</p>

      <div class="grid detail-grid" style="margin-top:18px">
        <div>
          <div class="card">
            <h4 style="font-size:15px;color:var(--brand);margin-bottom:10px">提纲原文</h4>
            <div class="guwen">${esc(it.gang)}</div>
            <h4 style="font-size:15px;color:var(--brand);margin:16px 0 8px">病机原理</h4>
            <p style="font-size:13.6px;line-height:1.95;color:var(--ink-2)">${esc(it.essence)}</p>
            <h4 style="font-size:15px;color:var(--brand);margin:16px 0 8px">现代解释</h4>
            <p style="font-size:13.4px;line-height:1.95;color:var(--ink-2)">${esc(it.modern)}</p>
          </div>

          <div class="card" style="margin-top:16px">
            <h4 style="font-size:15px;margin-bottom:10px">典型临床表现</h4>
            <div class="chips">${it.symptoms.map(s=>`<span class="chip">${esc(s)}</span>`).join('')}</div>
            <div class="row" style="margin-top:14px;padding-top:12px;border-top:1px dashed var(--line-2)">
              <span class="tag jade">治法</span><b style="font-family:var(--serif);font-size:15px">${esc(it.treat)}</b>
            </div>
          </div>

          <div class="card" style="margin-top:16px">
            <h4 style="font-size:15px;margin-bottom:6px">传变与要点</h4>
            <p style="font-size:13.3px;line-height:1.9;color:var(--ink-2)">${esc(it.bian)}</p>
            <div style="margin-top:12px">
              ${it.points.map(p=>`<div style="display:flex;gap:8px;font-size:13px;line-height:1.8;margin-top:6px"><span style="color:var(--brand)">·</span><span>${esc(p)}</span></div>`).join('')}
            </div>
          </div>

          <div class="sec"><h2 style="font-size:18px">本经代表方剂</h2></div>
          <div class="grid auto-280">${fangs.map(fCard).join('')}</div>
        </div>
        <div>
          <div class="card" style="position:sticky;top:76px">
            <h4 style="font-size:15px;margin-bottom:8px">病位示意图</h4>
            ${BODY.liujing(it.key)}
            <p style="font-size:12px;color:var(--muted);margin-top:10px;line-height:1.75">图示为该经病变的主要部位与循行区域，帮助把"文字症状"落到"身体位置"上。</p>
            <div class="row" style="margin-top:12px">
              <a class="btn btn-sm btn-dark" href="#/quiz?scope=liujing&n=10">做这部分的题</a>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }

  /* ============ 方剂库 ============ */
  let fState = {q:'', cat:'全部', liu:'全部'};
  function pageFormulas(){
    const cats = ['全部', ...new Set(FM.map(f=>f.cat.split('·')[0]))];
    const lius = ['全部', ...new Set(FM.map(liuGroup).filter(g=>g!=='其他'))];
    return `
    <div class="view">
      <div class="between">
        <div>
          <h1 style="font-size:26px">方剂库</h1>
          <p style="font-size:13px;color:var(--muted);margin-top:4px">共 ${FM.length} 首 · 每首标注组成、君臣佐使、原方用量、炮制与煎法、史料出处</p>
        </div>
        <div class="row">
          <input id="fq" placeholder="搜方名 / 药材 / 功效 / 拼音 gzt…" value="${esc(fState.q)}"
            style="padding:9px 14px;border:1px solid var(--line);border-radius:10px;background:var(--card);width:230px;font-size:13.5px;outline:none">
        </div>
      </div>
      <div style="margin-top:14px" class="chips" id="fcat">
        ${cats.map(c=>`<button class="chip ${fState.cat===c?'on':''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}
      </div>
      <div style="margin-top:8px" class="chips" id="fliu">
        ${lius.map(c=>`<button class="chip ${fState.liu===c?'on brand':''}" data-liu="${esc(c)}" style="font-size:12px">${esc(c)}</button>`).join('')}
      </div>
      <div id="flist" class="grid auto-280" style="margin-top:18px"></div>
    </div>`;
  }
  function renderFormulaList(){
    const box = $('#flist'); if(!box) return;
    const q = fState.q.trim();
    const ql = q.toLowerCase();
    const isAbc = /^[a-z]+$/.test(ql);
    const list = FM.filter(f=>{
      if(fState.cat!=='全部' && f.cat.split('·')[0]!==fState.cat) return false;
      if(fState.liu!=='全部' && liuGroup(f)!==fState.liu) return false;
      if(!q) return true;
      if(isAbc) return pyWords(f.py).some(w=>w.startsWith(ql)) || pyWords(f.py).join('').startsWith(ql) || pyInit(f.n).startsWith(ql);
      const hay = f.n + f.eff + f.ind + f.c.map(x=>x.h).join('') + f.book;
      return hay.includes(q);
    });
    box.innerHTML = list.length ? list.map(f=>`
      <div class="fcard" data-go="#/formula/${encodeURIComponent(f.n)}">
        <h4>${esc(f.n)}${Store.isDue(f.n)?'<span class="tag brand" style="font-size:10px">待复习</span>':''}</h4>
        <div class="herbs">${esc(f.c.map(x=>x.h).join('、'))}</div>
        <div style="font-size:11.8px;color:var(--muted)">${esc(f.eff)}</div>
        <div class="meta"><span class="tag">${esc(f.cat.split('·')[1]||f.cat)}</span><span class="tag plain book-mark">${esc(f.book)}</span></div>
      </div>`).join('') : `<div class="card" style="grid-column:1/-1;text-align:center;color:var(--muted)">没有找到匹配的方剂</div>`;
  }

  function pageFormula(nm){
    const f = FM_BY[nm];
    if(!f) return `<div class="wrap"><p>未找到方剂「${esc(nm)}」</p><a class="btn" href="#/formulas">返回方剂库</a></div>`;
    const related = FM.filter(x=>x!==f && (x.cat===f.cat || x.liu===f.liu)).slice(0,4);
    const song = SONGS.find(s=>s.n===f.n);
    const cautions = (f.cau||'').split('；').filter(Boolean);
    const roleMap = {'君':'j','臣':'c','佐':'z','使':'s'};
    return `
    <div class="view">
      <div class="row" style="margin-bottom:12px">
        <a class="btn btn-sm" href="#/formulas">← 方剂库</a>
        <span class="tag">${esc(f.cat)}</span>
        ${f.liu?`<span class="tag jade">${esc(f.liu)}</span>`:''}
      </div>
      ${f.wf?`<div class="card" style="margin-top:14px;border-left:3px solid var(--brand);background:var(--panel)">
        <div class="between" style="margin-bottom:6px">
          <h4 style="font-size:14.5px">${esc(f.wf.tag)} · 王付《学用经方的思路与方法》</h4>
          <a class="mini" href="#/disease?go=base" style="color:var(--brand)">在临床病证方看 15 个基础方 →</a>
        </div>
        <p style="font-size:13px;line-height:1.95;color:var(--ink-2)">${f.wf.t}</p>
      </div>`:''}
      <div class="between">
        <div>
          <h1 style="font-size:30px">${esc(f.n)}</h1>
          <p style="font-size:12.5px;color:var(--muted);margin-top:3px;letter-spacing:.05em">${esc(f.py||'')}　·　${esc(f.book)}${f.ch?' · '+esc(f.ch):''}</p>
        </div>
        <div class="row">
          <button class="btn btn-sm btn-dark" id="learnBtn">标记为已学并复习</button>
          <button class="btn btn-sm" id="cardBtn">导出背诵卡</button>
          <a class="btn btn-sm" href="#/analyze?f=${encodeURIComponent(f.n)}">解析这首方</a>
          <a class="btn btn-sm" href="#/quiz?scope=one&one=${encodeURIComponent(f.n)}&n=5">练这首</a>
        </div>
      </div>

      <div class="grid detail-grid" style="margin-top:18px">
        <div>
          <div class="card">
            <div class="row" style="justify-content:space-between">
              <h4 style="font-size:16px">药物组成 · 君臣佐使</h4>
              <span class="tag">共 ${f.c.length} 味</span>
            </div>
            <div style="margin-top:12px">
              ${f.c.map(x=>{
                const hb = HB_BY[x.h];
                const role = (x.r||'')[0];
                return `<div class="herb-line">
                  <span class="role ${roleMap[role]||'z'}">${role||'·'}</span>
                  <span class="hname">${hb?`<a href="#/herb/${encodeURIComponent(x.h)}" style="border-bottom:1px dashed var(--line)">${esc(x.h)}</a>`:esc(x.h)}</span>
                  <span class="dose">${esc(x.ga||'')}</span>
                  <span class="note">${esc(x.note||'')}<span style="color:var(--jade)">　现用 ${esc(x.g||'')}</span></span>
                </div>`;
              }).join('')}
            </div>
            <p style="font-size:11.5px;color:var(--muted);margin-top:10px">「原方用量」为古籍记载，「现用」为现代临床常用参考量（非处方，用药须遵医嘱）。点击药名可查看该药的炮制与煎法。</p>
          </div>

          ${song?`<div class="card" style="margin-top:16px">
            <div class="between" style="margin-bottom:8px">
              <h4 style="font-size:15px;color:var(--gold)">汤头歌诀</h4>
              <span class="tag gold">${song.src?'自编助记':'通行方歌'}</span>
            </div>
            <div class="song">${esc(song.s)}</div>
            <p style="font-size:12.5px;color:var(--ink-2);line-height:1.85;margin-top:9px"><b style="color:var(--brand);font-weight:500">释义：</b>${esc(song.j)}</p>
            <p style="font-size:12.2px;color:var(--muted);line-height:1.8;margin-top:3px"><b style="color:var(--jade);font-weight:500">记忆点：</b>${esc(song.k)}</p>
            <div class="row" style="margin-top:10px">
              <button class="btn btn-sm" data-speak="${esc(song.n)}">🔊 朗读歌诀</button>
              <a class="btn btn-sm" href="#/songs">去歌诀页背</a>
            </div>
          </div>`:''}

          <div class="card" style="margin-top:16px">
            <h4 style="font-size:15px;color:var(--brand);margin-bottom:8px">煎服法</h4>
            <div class="guwen" style="font-size:14px">${mdB(f.dec)}</div>
            <h4 style="font-size:15px;color:var(--brand);margin:16px 0 8px">方解</h4>
            <p style="font-size:13.5px;line-height:1.95;color:var(--ink-2)">${esc(f.ana)}</p>
          </div>

          ${window.FEAT ? window.FEAT.caseCard(f) : ''}

          ${window.CLINIC ? window.CLINIC.formulaDiseases(f.n) : ''}

          <div class="card" style="margin-top:16px">
            <h4 style="font-size:15px;margin-bottom:10px">功效主治</h4>
            <div class="row" style="margin-bottom:8px"><span class="tag brand">功效</span><b style="font-family:var(--serif);font-size:14.5px">${esc(f.eff)}</b></div>
            <p style="font-size:13.4px;line-height:1.9;color:var(--ink-2)"><b style="color:var(--brand);font-weight:500">主治：</b>${esc(f.ind)}</p>
            ${f.mod?`<p style="font-size:13.2px;line-height:1.9;color:var(--ink-2);margin-top:10px"><b style="color:var(--jade);font-weight:500">加减：</b>${esc(f.mod)}</p>`:''}
            ${f.use?`<p style="font-size:13.2px;line-height:1.9;color:var(--ink-2);margin-top:6px"><b style="color:var(--jade);font-weight:500">现代应用：</b>${esc(f.use)}</p>`:''}
            ${f.cau?`<div class="warn" style="margin-top:13px">
              <span class="ic">!</span>
              <div class="tx"><b>禁忌与慎用</b>${cautions.map(c=>`<span style="display:block;margin-top:2px">· ${mdB(c)}</span>`).join('')}</div>
            </div>`:''}
          </div>

          <div class="sec"><h2 style="font-size:18px">同类方剂</h2></div>
          <div class="grid auto-280">${related.map(fCard).join('')}</div>
        </div>

        <div>
          <div class="card" style="position:sticky;top:76px">
            <h4 style="font-size:15px;margin-bottom:10px">史料出处</h4>
            <div style="padding:14px 16px;background:linear-gradient(var(--card-2),var(--panel));border-radius:10px;border:1px solid var(--line-2)">
              <div style="font-family:var(--serif);font-size:17px;color:var(--brand)">《${esc(f.book)}》</div>
              <div style="font-size:12.5px;color:var(--muted);margin-top:3px">${esc(f.ch||'')}</div>
            </div>
            <h4 style="font-size:15px;margin:16px 0 8px">学习记录</h4>
            ${(()=>{const c=Store.card(f.n); const lab=Store.boxLabel(c.box);
              return `<div class="dl">
                <dt>记忆阶段</dt><dd><span class="tag ${c.box>=6?'jade':'brand'}">${lab}</span></dd>
                <dt>累计答对</dt><dd>${c.correct} 次</dd>
                <dt>累计答错</dt><dd>${c.wrong} 次</dd>
                <dt>下次复习</dt><dd>${c.seen?new Date(c.due).toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}):'尚未学习'}</dd>
              </div>`})()}
            <div style="margin-top:14px;font-size:12.3px;color:var(--muted);line-height:1.85">
              <b style="color:var(--ink)">君臣佐使速记：</b>君药主治主症，臣药辅助君药或兼治兼症，佐药制约毒性或反佐，使药引经或调和。
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }

  /* ============ 药材库 ============ */
  let hState = {q:'', part:'全部', tag:'全部', pic:'全部', nat:'全部'};
  function herbNat(h){
    const m = String(h.nat||'').match(/(大寒|大热|微温|微寒|温|热|寒|凉|平)/);
    if(!m) return '其他';
    const x = m[1];
    return x==='微温' ? '温' : (x==='微寒'||x==='大寒') ? '寒' : x==='大热' ? '热' : x;
  }
  function herbToxic(h){
    const c = String(h.cau||'');
    return /(大毒|小毒|有毒|毒烈)/.test(c) && !/无毒/.test(c);
  }
  function herbPics(h){ return ((window.PHOTOS||{})[h.n]||[]).filter(x=>x&&x.f); }
  function pageHerbs(){
    const present = new Set(HB.map(herbPart));
    const parts = ['全部', ...PART_ORDER.filter(p=>present.has(p))];
    const tags = ['全部','有毒'];
    const pics = ['全部','有图','无图'];
    const nats = ['全部','寒','热','温','凉','平'];
    return `
    <div class="view">
      <div class="between">
        <div>
          <h1 style="font-size:26px">药材库</h1>
          <p style="font-size:13px;color:var(--muted);margin-top:4px">共 ${HB.length} 味 · 药用部位、性味归经、炮制方法、特殊煎法、使用注意</p>
        </div>
        <input id="hq" placeholder="搜药名 / 功效 / 拼音 gz…" value="${esc(hState.q)}"
          style="padding:9px 14px;border:1px solid var(--line);border-radius:10px;background:var(--card);width:220px;font-size:13.5px;outline:none">
      </div>
      <div class="chips" style="margin-top:14px" id="hpart">
        ${parts.map(p=>`<button class="chip ${hState.part===p?'on':''}" data-part="${esc(p)}">${esc(p)}</button>`).join('')}
      </div>
      <div class="chips" style="margin-top:8px" id="htag">
        <span style="font-size:11.5px;color:var(--muted);font-family:var(--mono);padding:4px 2px">特性</span>
        ${tags.map(t=>`<button class="chip ${hState.tag===t?'on brand':''}" data-tag="${esc(t)}" style="font-size:12px">${esc(t)}</button>`).join('')}
        <span style="font-size:11.5px;color:var(--muted);font-family:var(--mono);padding:4px 2px;margin-left:10px">图片</span>
        ${pics.map(t=>`<button class="chip ${hState.pic===t?'on brand':''}" data-pic="${esc(t)}" style="font-size:12px">${esc(t)}</button>`).join('')}
        <span style="font-size:11.5px;color:var(--muted);font-family:var(--mono);padding:4px 2px;margin-left:8px">药性</span>
        ${nats.map(t=>`<button class="chip ${hState.nat===t?'on brand':''}" data-nat="${esc(t)}" style="font-size:12px">${esc(t)}</button>`).join('')}
      </div>
      <div class="row" style="margin-top:10px;align-items:baseline">
        <span id="hCount" style="font-size:12.3px;color:var(--muted)"></span>
        <span id="hReset" style="font-size:12.3px;color:var(--brand);cursor:pointer;">重置筛选</span>
      </div>
      <div id="hlist" class="grid auto-280" style="margin-top:14px"></div>
    </div>`;
  }
  function herbPart(h){
    const p = h.part || '';
    if(/菌/.test(p)) return '菌类';
    if(/炮制|蒸晒|发酵|熬制|糖化|炼蜜|糖类/.test(p)) return '加工品';
    if(/矿物|矿石|结晶|硅酸/.test(p)) return '矿物';
    if(/动物|角|背甲|蛋黄|干燥体/.test(p)) return '动物';
    if(/地上部分|全草|草质茎/.test(p)) return '全草';
    if(/根茎/.test(p)) return '根茎';
    if(/茎髓/.test(p)) return '茎枝';
    if(/根/.test(p)) return '根';
    if(/果皮|果实|果肉/.test(p)) return '果实';
    if(/种子|种仁|仁/.test(p)) return '种子';
    if(/叶/.test(p)) return '叶';
    if(/花/.test(p)) return '花';
    if(/皮/.test(p)) return '皮';
    if(/枝|藤|茎/.test(p)) return '茎枝';
    return '其他';
  }
  const PART_ORDER = ['根','根茎','茎枝','皮','叶','花','果实','种子','全草','菌类','矿物','动物','加工品'];
  /* 拼音：全拼（数据里的 py 字段）与首字母（pinyin.js）都参与匹配 */
  const PYINI = window.PYINI || {};
  const pyInit = s => [...String(s==null?'':s)].map(c=>PYINI[c]||'').join('');
  const pyFull = s => String(s==null?'':s).toLowerCase().replace(/[^a-z]/g,'');
  /* 整段拼音按空格分词，匹配时按词首比，避免 "gz" 命中 "cangzhu" 中间 */
  const pyWords = s => String(s==null?'':s).toLowerCase().split(/\s+/).map(t=>t.replace(/[^a-z]/g,'')).filter(Boolean);
  function herbFiltered(){
    const q = hState.q.trim();
    const ql = q.toLowerCase();
    const isAbc = /^[a-z]+$/.test(ql);
    return HB.filter(h=>{
      if(hState.part!=='全部' && herbPart(h)!==hState.part) return false;
      if(hState.tag==='有毒' && !herbToxic(h)) return false;
      if(hState.pic==='有图' && !herbPics(h).length) return false;
      if(hState.pic==='无图' && herbPics(h).length) return false;
      if(hState.nat!=='全部' && herbNat(h)!==hState.nat) return false;
      if(!q) return true;
      if(isAbc) return pyWords(h.py).some(w=>w.startsWith(ql)) || pyWords(h.py).join('').startsWith(ql) || pyInit(h.n).startsWith(ql);
      if((ALIAS_OF[h.n]||[]).some(a=>a.includes(q))) return true; /* 搜「白虎」也能找到石膏 */
      return (h.n+h.eff+h.ind+(h.la||'')+h.nat).includes(q);
    });
  }
  /* 一次全部渲染：写意小图卡片列表，实拍照片留到详情页再看 */
  function renderHerbList(){
    const box = $('#hlist'); if(!box) return;
    const list = herbFiltered();
    const cnt = $('#hCount');
    if(cnt) cnt.textContent = `筛选出 ${list.length} 味 / 共 ${HB.length} 味`;
    if(!list.length){
      box.innerHTML = `<div class="card" style="text-align:center;color:var(--muted);padding:26px">没有找到匹配的药材，换个词或重置筛选试试</div>`;
      return;
    }
    box.innerHTML = list.map(h=>{
      const nPic = herbPics(h).length;
      return `<div class="hcard" data-go="#/herb/${encodeURIComponent(h.n)}">
        <div class="top">
          <div style="flex:0 0 74px">${HERB_ART.svg(h.a[0], h.a[1], h.a[2])}</div>
          <div style="min-width:0">
            <h4>${esc(h.n)} <span class="lat">${esc(h.la||'')}</span></h4>
            <div class="row" style="gap:4px;margin-top:5px;flex-wrap:wrap">
              <span class="tag" style="font-size:10.5px">${esc(herbPart(h))}</span>
              ${nPic?`<span class="tag jade" style="font-size:10.5px">实拍 ${nPic}</span>`:''}
              ${herbToxic(h)?`<span class="tag gold" style="font-size:10.5px">毒</span>`:''}
            </div>
          </div>
        </div>
        <div class="body">
          <div class="kv"><b>性味</b><span>${esc(h.nat)}</span></div>
          <div class="kv"><b>功效</b><span>${esc(h.eff)}</span></div>
        </div>
      </div>`;
    }).join('');
  }

  function pageHerb(nm){
    const h = HB_BY[nm];
    if(!h) return `<div class="wrap"><p>未找到药材「${esc(nm)}」</p><a class="btn" href="#/herbs">返回药材库</a></div>`;
    const inF = FM.filter(f=>f.c.some(x=>x.h===h.n || HB_ALIAS[x.h]===h.n));
    const aliasNames = (ALIAS_OF[h.n]||[]).filter(a=>a!==h.n);
    /* 党参常代人参：库中无「含党参」的方，就把用到人参的方列出来，并给出折算 */
    const ALT_OF = {'党参':'人参'};
    const altHerb = ALT_OF[h.n] || '';
    const altF = altHerb ? FM.filter(f=>f.c.some(x=>x.h===altHerb)) : [];
    const tr = TRAIT[h.n] || null;
    const gal = ((window.PHOTOS||{})[h.n] || []).filter(x=>x && x.f).map(x=>Object.assign({}, x, {f:'assets/photos/'+x.f}));
    const photo = gal.length ? gal[0].f : '';
    const cautions = (h.cau||'').split('；').filter(Boolean);
    const quick = tr && tr.xz ? tr.xz.split('。').slice(0,1).join('。') : '';
    const pz = window.PZ ? PZ.why(h) : [];
    const roles = {君:0,臣:0,佐:0,使:0};
    inF.forEach(f=>f.c.forEach(x=>{ if((x.h===h.n||HB_ALIAS[x.h]===h.n) && roles[x.r]!==undefined) roles[x.r]++; }));
    const modList = String(h.mod||'').split('；').filter(Boolean);
    return `
    <div class="view">
      <div class="row" style="margin-bottom:12px">
        <a class="btn btn-sm" href="#/herbs">← 药材库</a>
        <span class="tag">${esc(herbPart(h))}</span>
        <span class="tag gold">${esc(h.nat)}</span>
        <span class="tag jade">归${esc(h.mer)}</span>
        ${aliasNames.length?`<span class="tag" style="font-size:10.5px" title="${esc(aliasNames.join('、'))}">别称 ${esc(aliasNames.slice(0,5).join('、'))}${aliasNames.length>5?'…':''}</span>`:''}
      </div>
      <div class="between" style="align-items:flex-end">
        <div>
          <h1 style="font-size:29px">${esc(h.n)}</h1>
          <p style="font-size:12.5px;color:var(--muted);margin-top:2px;letter-spacing:.04em">${esc(h.py||'')}　<i>${esc(h.la||'')}</i></p>
        </div>
        <div class="row">
          ${inF[0]?`<a class="btn btn-sm" href="#/quiz?scope=one&one=${encodeURIComponent(inF[0].n)}&n=5">练相关方剂</a>`:''}
          <a class="btn btn-sm" href="#/reverse/${encodeURIComponent(h.n)}">一药多方反查 →</a>
        </div>
      </div>

      <div class="herb-detail" style="margin-top:16px">
        <div>
          <!-- ① 写意示意（保持原样） -->
          <div class="card">
            <div class="between" style="margin-bottom:10px">
              <h4 style="font-size:16px"><span class="no">①</span>药材形态 · 写意示意</h4>
              <span class="tag">${esc(h.part)}</span>
            </div>
            <div class="spec-grid">
              <div class="spec">
                <div class="lbl"><i></i>写意示意 · 药用部位</div>
                <div class="fig">${HERB_ART.svg(h.a[0],h.a[1],h.a[2])}</div>
                <div class="cap">取的是「${esc(herbPart(h))}」<br>${esc(h.part.split('的').slice(-1)[0]||'')}</div>
              </div>
              <div class="trait">
                <div class="tr"><b>药用部位</b><span>${esc(h.part)}</span></div>
                <div class="tr"><b>性味</b><span>${esc(h.nat)}；归${esc(h.mer)}</span></div>
                <div class="tr"><b>常用量</b><span style="color:var(--brand)">${esc(h.dose)}</span>　<span style="color:var(--muted);font-size:11.4px">（成人一日量，须遵医嘱）</span></div>
                <div class="tr"><b>性状特征</b><span>${tr?esc(tr.xz):`<span style="color:var(--muted)">本站暂未收录该药的性状描述，请以《中国药典》性状项与专业图谱为准。</span>`}</span></div>
              </div>
            </div>
            <p style="font-size:11.3px;color:var(--muted);margin-top:10px;line-height:1.7">
              写意图标的是"取哪个部位"，性状描述标的是"长什么样、断面什么样"。两者都不能替代药典标准与专业鉴定。
            </p>
          </div>

          <div class="card" style="margin-top:16px">
            <h4 style="font-size:15px;color:var(--brand);margin-bottom:8px">功效主治</h4>
            <p style="font-size:14px;line-height:1.9"><b style="font-family:var(--serif)">${esc(h.eff)}</b></p>
            <p style="font-size:13.3px;line-height:1.9;color:var(--ink-2);margin-top:6px">${esc(h.ind)}</p>
          </div>

          <div class="card" style="margin-top:16px">
            <div class="between" style="margin-bottom:8px">
              <h4 style="font-size:15px">炮制方法 · 为什么要这样制</h4>
              <span class="tag">${(h.pre||[]).length} 种</span>
            </div>
            ${pz.length?`<div class="pz-list">
              ${pz.map(x=>`<div class="pz-row"><span class="pz-p">${esc(x.p)}</span><span class="pz-w">${esc(x.w)}</span></div>`).join('')}
            </div>`:`<p style="font-size:12.6px;color:var(--muted)">本品一般生用，无需特殊炮制。</p>`}
            <div class="trait" style="margin-top:12px">
              <div class="tr"><b>煎法</b><span>${mdB(h.dec)}</span></div>
            </div>
            <div class="warn" style="margin-top:12px">
              <span class="ic">!</span>
              <div class="tx"><b>使用注意</b>${cautions.map(c=>`<span style="display:block;margin-top:2px">· ${mdB(c)}</span>`).join('')}</div>
            </div>
          </div>

          ${h.sub?`<div class="card" style="margin-top:16px;border-left:3px solid var(--jade)">
            <div class="between" style="margin-bottom:6px">
              <h4 style="font-size:15px">代用 · 临床常见的「平替」</h4>
              <span class="tag jade">用药习惯</span>
            </div>
            <p style="font-size:12.8px;line-height:1.95;color:var(--ink-2)">${mdB(h.sub)}</p>
            <div class="row" style="margin-top:9px;gap:8px;align-items:center">
              ${h.n==='党参'?`<a class="tag brand" style="text-decoration:none" href="#/herb/${encodeURIComponent('人参')}">对照看「人参」→</a>`:''}
              ${h.n==='人参'?`<a class="tag brand" style="text-decoration:none" href="#/herb/${encodeURIComponent('党参')}">对照看「党参」→</a>`:''}
              <span class="mini">代用只解决「有没有、吃不吃得起」，不改变辨证</span>
            </div>
          </div>`:''}

          ${window.FEAT ? window.FEAT.originCard(h) : ''}
          ${window.FEAT ? window.FEAT.sameNameCard(h) : ''}

          <div class="card" style="margin-top:16px">
            <div class="between" style="margin-bottom:8px">
              <h4 style="font-size:15px">现代药理</h4>
              <span class="tag">实验研究 · 供参考</span>
            </div>
            ${modList.length?`<ul class="mod-list">${modList.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:`<p style="font-size:12.6px;color:var(--muted)">暂无收录。</p>`}
            <p style="font-size:11.2px;color:var(--muted);margin-top:8px;line-height:1.7">药理结论多来自实验与提取物研究，剂量与给药方式不等同于临床煎服，不能据此自行用药。</p>
          </div>

          <div class="sec">
            <div class="between" style="align-items:baseline;gap:8px;flex-wrap:wrap">
              <h2 style="font-size:18px">含「${esc(h.n)}」的方剂　${inF.length} 首</h2>
              ${inF.length>8?`<span style="font-size:11.5px;color:var(--muted)">先看 8 首，其余按类别排成一行一首</span>`:''}
            </div>
          </div>
          <div class="grid auto-280">${inF.slice(0,8).map(fCard).join('')}</div>
          ${inF.length>8?`
          <div id="fxMore" hidden style="margin-top:14px">
            <div class="fx-mini">
              ${inF.slice(8).map(f=>`<a class="fx-row" href="#/formula/${encodeURIComponent(f.n)}">
                <b>${esc(f.n)}</b>
                <span class="tag plain">${esc(f.cat.split('·')[0])}</span>
                <span class="fx-c">${f.c.length} 味</span>
                <span class="fx-b">${esc(f.book)}</span>
                <span class="fx-e">${esc((f.eff||'').split('，').slice(0,2).join('，'))}</span>
              </a>`).join('')}
            </div>
          </div>
          <button class="btn btn-sm" id="fxMoreBtn" style="margin-top:12px" data-open="0"
            data-n="${inF.length-8}">展开其余 ${inF.length-8} 首</button>`:''}
          ${!inF.length && altF.length?`<div class="card" style="margin-top:4px;border-left:3px solid var(--brand)">
            <div class="between" style="margin-bottom:6px">
              <h4 style="font-size:15px">库中 ${altF.length} 首方用人参，临床多以党参代之</h4>
              <a class="tag brand" style="text-decoration:none" href="#/herb/${encodeURIComponent('人参')}">看「人参」→</a>
            </div>
            <p style="font-size:12.6px;line-height:1.9;color:var(--ink-2)">原书写作人参，现代为控制成本、避免温燥，多直接开党参，用量按 1 : 2~3 折算（人参 6g ≈ 党参 15~20g）。下列方剂按原方组成收录，换算时自行加量。</p>
            <div class="chips" style="margin-top:9px">
              ${altF.slice(0,12).map(f=>`<a class="chip" href="#/formula/${encodeURIComponent(f.n)}" style="text-decoration:none">${esc(f.n)}</a>`).join('')}
              ${altF.length>12?`<span class="chip" style="cursor:default;opacity:.7">等 ${altF.length} 首</span>`:''}
            </div>
          </div>`:''}
        </div>

        <div>
          <!-- ② 真实照片 -->
          <div class="card">
            <div class="between" style="margin-bottom:8px">
              <h4 style="font-size:15.5px"><span class="no">②</span>真实形态 · 实拍照片</h4>
              <span class="tag ${gal.length?'jade':''}">${gal.length?gal.length+' 张':'待补'}</span>
            </div>
            <div class="photo-box ${gal.length?'':'empty'}" id="photoBox" data-i="0">
              ${gal.length?`<img id="photoMain" src="${esc(encodeURI(gal[0].f))}" alt="${esc(h.n)} 照片" loading="lazy">`
                :`<div class="ph-empty">
                   <b>暂无照片</b>
                   <span>这一味还没配上图。你可以用「我的照片」放一张自己的图（只存本机），或把图片放进 <code>assets/photos/</code> 并在 <code>photos.js</code> 登记。</span>
                 </div>`}
            </div>
            ${gal.length>1?`<div class="photo-gal" id="photoGal">
              ${gal.map((g,i)=>`<button class="${i?'':'on'}" data-i="${i}" title="${esc(g.cap||'')}"><img src="${esc(encodeURI(g.f))}" alt="" loading="lazy"></button>`).join('')}
            </div>`:''}
            <div class="row" style="margin-top:9px;align-items:center">
              <label class="btn btn-sm" style="cursor:pointer">我的照片
                <input type="file" id="photoPick" accept="image/*" hidden>
              </label>
              <button class="btn btn-sm" id="photoReset" hidden>恢复内置图</button>
              <span style="font-size:11.2px;color:var(--muted);line-height:1.6">只存本机浏览器，不上传</span>
            </div>
            <div class="photo-cap" id="photoCap" data-list='${esc(JSON.stringify(gal.map(g=>({cap:g.cap||'',page:g.page||''}))))}'>${gal.length?esc(gal[0].cap||''):'以左侧性状特征对照实物辨认'}</div>
            <p style="font-size:11px;color:var(--muted);margin-top:6px;line-height:1.7">照片来自公开网络（百度百科词条图 / 360 图片检索），仅作学习辨识参考，版权归原作者；如需商用请自行替换。鉴定以《中国药典》性状为准。</p>
          </div>

          <!-- ③ 真伪鉴别 -->
          ${tr&&tr.fake&&tr.fake.length?`<div class="card" style="margin-top:16px">
            <div class="between" style="margin-bottom:10px">
              <h4 style="font-size:15.5px"><span class="no">③</span>真伪鉴别 · 伪品与混淆品</h4>
              <span class="tag" style="border-color:var(--danger);color:var(--danger)">${tr.fake.length} 种</span>
            </div>
            <div class="fake-list">
              ${tr.fake.map(x=>`<div class="fake-item">
                <div class="fn">× ${esc(x.n)}</div>
                <div class="fd">${esc(x.d)}</div>
              </div>`).join('')}
            </div>
            <div class="warn sm" style="margin-top:12px">
              <span class="ic">!</span>
              <div class="tx"><b>买药提醒</b>走正规药店与饮片厂，看包装上的《药品生产许可证》与批号；颜色过于鲜艳、气味刺鼻（硫熏）、价格明显低于市场价的，都要警惕。</div>
            </div>
          </div>`:`<div class="card" style="margin-top:16px">
            <h4 style="font-size:15.5px;margin-bottom:6px"><span class="no">③</span>真伪鉴别</h4>
            <p style="font-size:12.5px;color:var(--muted);line-height:1.85">本站尚未收录这味药的具体伪品对照。通用原则：一看形状断面是否符合药典描述，二闻气味是否自然（刺鼻多为硫熏），三尝味道（甘甜、苦涩、辛麻各有其性），四是到正规药店购买并留好票据。</p>
          </div>`}

          <!-- ④ 怎么用（速记） -->
          <div class="card" style="margin-top:16px;position:sticky;top:74px">
            <h4 style="font-size:15px;margin-bottom:8px"><span class="no">④</span>这味药怎么用（速记）</h4>
            <div style="font-size:12.6px;line-height:1.95;color:var(--ink-2)">
              <p><b style="color:var(--brand)">① 是什么：</b>${esc(h.part)}</p>
              <p style="margin-top:6px"><b style="color:var(--brand)">② 什么味：</b>${esc(h.nat)}，归${esc(h.mer)}</p>
              <p style="margin-top:6px"><b style="color:var(--brand)">③ 干什么：</b>${esc(h.eff)}</p>
              <p style="margin-top:6px"><b style="color:var(--brand)">④ 怎么制：</b>${esc((h.pre||[])[0]||'生用')}${pz[0]?'　<span style="color:var(--muted)">'+esc(pz[0].w)+'</span>':''}</p>
              <p style="margin-top:6px"><b style="color:var(--brand)">⑤ 注意啥：</b>${mdB(cautions[0]||h.cau||'')}</p>
              <p style="margin-top:6px"><b style="color:var(--brand)">⑥ 怎么认：</b>${esc(quick||'见左侧性状特征')}</p>
            </div>
            <div class="divider-dot">速查</div>
            <div class="chips">
              <span class="tag">${esc(herbPart(h))}</span>
              <span class="tag">${esc(h.dose)}</span>
              <span class="tag">${inF.length} 方</span>
              ${roles.君?`<span class="tag brand">为君 ${roles.君}</span>`:''}
              ${roles.臣?`<span class="tag">为臣 ${roles.臣}</span>`:''}
            </div>
            ${inF[0]?`<div class="row" style="margin-top:12px">
              <a class="btn btn-sm btn-dark" href="#/quiz?scope=one&one=${encodeURIComponent(inF[0].n)}&n=5">练相关方剂</a>
            </div>`:''}
            <p style="font-size:11.2px;color:var(--muted);margin-top:10px;line-height:1.7">速记卡只记骨架，真正的取舍要看配伍与证候。</p>
          </div>
        </div>
      </div>
    </div>`;
  }


  /* ============ 背诵卡导出（canvas → PNG） ============ */
  function exportCard(f, song){
    const W = 760, H = 1080;
    const cv = document.createElement('canvas');
    cv.width = W*2; cv.height = H*2;
    const g = cv.getContext('2d'); g.scale(2,2);
    const isDark = document.documentElement.getAttribute('data-theme')==='dark';
    const isAnc  = document.documentElement.getAttribute('data-theme')==='ancient';
    const bg = isDark? '#0b1d24' : (isAnc? '#f5ead0' : '#fbfdfc');
    const ink = isDark? '#e4f7f6' : '#0b2026';
    const brand = isDark? '#45e3d4' : (isAnc? '#94301f' : '#0d8388');
    const line = isDark? '#17333b' : (isAnc? '#dcc9a2' : '#d2e2e0');
    const muted = isDark? '#7c9ea3' : (isAnc? '#8b7550' : '#65868a');
    g.fillStyle = bg; g.fillRect(0,0,W,H);
    // 细网格
    g.strokeStyle = line; g.globalAlpha = .45; g.lineWidth = 1;
    for(let x=0;x<W;x+=24){ g.beginPath(); g.moveTo(x,0); g.lineTo(x,H); g.stroke(); }
    for(let y=0;y<H;y+=24){ g.beginPath(); g.moveTo(0,y); g.lineTo(W,y); g.stroke(); }
    g.globalAlpha = 1;
    // 外框
    g.strokeStyle = brand; g.lineWidth = 2; g.strokeRect(26,26,W-52,H-52);
    // 顶部标签
    g.fillStyle = brand; g.font = '600 13px ui-monospace, Menlo, monospace';
    g.fillText('JELLY TCM · 背诵卡', 48, 70);
    g.fillStyle = muted; g.font = '12px ui-monospace, Menlo, monospace';
    g.textAlign = 'right'; g.fillText(f.cat||'', W-48, 70); g.textAlign='left';
    // 方名
    g.fillStyle = ink; g.font = '700 54px "Noto Serif SC", Songti SC, serif';
    g.fillText(f.n, 48, 148);
    g.fillStyle = muted; g.font = 'italic 16px Georgia, serif';
    g.fillText(f.py||'', 50, 176);
    // 出处
    g.fillStyle = brand; g.font = '13px ui-monospace, Menlo, monospace';
    g.fillText(`${f.book||''}　${f.ch||''}`, 48, 208);
    // 组成
    let y = 254;
    g.fillStyle = ink; g.font = '600 17px "Noto Serif SC", serif';
    g.fillText('组成', 48, y); y += 14;
    g.strokeStyle = line; g.beginPath(); g.moveTo(48,y); g.lineTo(W-48,y); g.stroke(); y += 26;
    f.c.forEach(x=>{
      g.fillStyle = brand; g.font = '13px ui-monospace, Menlo, monospace';
      g.fillText(x.r||'·', 48, y);
      g.fillStyle = ink; g.font = '19px "Noto Serif SC", serif';
      g.fillText(x.h, 76, y);
      g.fillStyle = muted; g.font = '13px ui-monospace, Menlo, monospace';
      g.fillText(x.g||'', 190, y);
      g.fillStyle = muted; g.font = '12.5px sans-serif';
      const note = (x.note||'').slice(0, 22);
      g.fillText(note, 300, y);
      y += 30;
    });
    y += 8;
    // 功效主治
    g.fillStyle = brand; g.font = '600 14px "Noto Serif SC", serif';
    g.fillText('功效', 48, y); y += 24;
    g.fillStyle = ink; g.font = '16px "Noto Serif SC", serif';
    wrapText(g, f.eff||'', 48, y, W-96, 26); y += 26*Math.ceil(g.measureText(f.eff||'').width/(W-96)) + 8;
    g.fillStyle = brand; g.font = '600 14px "Noto Serif SC", serif';
    g.fillText('主治', 48, y); y += 24;
    g.fillStyle = ink; g.font = '14px sans-serif';
    y = wrapText(g, f.ind||'', 48, y, W-96, 24) + 14;
    // 歌诀（框高按实际行数算，短歌诀不留大片空白）
    if(song){
      g.font = '17px "Noto Serif SC", serif';
      const sw = W - 140;
      const lines = Math.max(1, Math.ceil(g.measureText(song.s).width / sw));
      const boxH = 26 + lines*30 + 8;
      g.fillStyle = isAnc? '#f9f1dc' : (isDark? '#0e242b' : '#f3f9f8');
      g.fillRect(40, y-14, W-80, boxH);
      g.fillStyle = brand; g.fillRect(40, y-14, 4, boxH);
      g.fillStyle = ink;
      wrapText(g, song.s, 60, y+12, sw, 30);
      y += boxH + 4;
    }
    // 方解（还有空间才画，避免压到底注）
    if(f.ana && y < H - 210){
      y += 22;
      g.fillStyle = brand; g.font = '600 14px "Noto Serif SC", serif';
      g.fillText('方解', 48, y); y += 24;
      g.fillStyle = ink; g.font = '13.5px sans-serif';
      y = wrapText(g, f.ana, 48, y, W-96, 23) + 6;
    }
    // 底注
    g.fillStyle = muted; g.font = '11.5px ui-monospace, Menlo, monospace';
    g.textAlign = 'left';
    g.fillText('水母中医 JellyTCM · 仅供学习 · 不构成诊疗建议', 48, H-56);
    g.textAlign = 'right';
    g.fillText(new Date().toLocaleDateString('zh-CN'), W-48, H-56);
    g.textAlign = 'left';
    const a = document.createElement('a');
    a.download = `JellyTCM-${f.n}.png`;
    a.href = cv.toDataURL('image/png');
    a.click();
  }
  function wrapText(g, text, x, y, maxW, lh){
    const chars = String(text).split('');
    let line = '', out = y;
    for(const ch of chars){
      if(g.measureText(line+ch).width > maxW){ g.fillText(line, x, out); line = ch; out += lh; }
      else line += ch;
    }
    if(line) { g.fillText(line, x, out); out += lh; }
    return out;
  }

  /* ============ 图表中心 ============ */
  let cTab = 'meridian';
  function pageCharts(){
    const tabs = [['meridian','十二经脉'],['acu','常用穴位'],['b3d','3D 经络人体'],['liujing','六经病位'],['wuxing','五行脏腑'],['qixue','卫气营血'],['units','计量换算'],['paozhi','炮制方法'],['jianfa','特殊煎法']];
    return `
    <div class="view">
      <h1 style="font-size:26px">图表中心</h1>
      <p style="font-size:13px;color:var(--muted);margin-top:4px">把抽象的中医概念变成看得见的图</p>
      <div class="chips" style="margin-top:16px" id="ctab">
        ${tabs.map(([k,label])=>`<button class="chip ${cTab===k?'on':''}" data-tab="${k}">${label}</button>`).join('')}
      </div>
      <div id="cbody" style="margin-top:18px"></div>
    </div>`;
  }
  function renderChartBody(){
    const box = $('#cbody'); if(!box) return;
    if(cTab==='meridian'){
      box.innerHTML = `<div class="grid g2">
        <div class="card"><h4 style="font-size:16px;margin-bottom:10px">十二经脉循行</h4>${BODY.meridian()}
          <p style="font-size:11.5px;color:var(--muted);margin-top:8px">线路为示意，非解剖定位。点击右侧经脉名可高亮。</p></div>
        <div class="card"><h4 style="font-size:16px;margin-bottom:10px">经脉速查</h4>
          <div class="mer-legend" id="merLegend">
            ${TY.meridians.map(m=>`<div class="mer-item" data-k="${m.abbr}"><i style="background:${(BODY.MER.find(x=>x.k===m.abbr)||{}).c||'#999'}"></i><span>${esc(m.n)}</span></div>`).join('')}
          </div>
          <div id="merInfo" style="margin-top:12px;font-size:13px;color:var(--ink-2);min-height:110px;line-height:1.85"></div>
        </div>
      </div>
      <div class="card mer-anim" style="margin-top:16px">
        <div class="between" style="align-items:flex-start">
          <div>
            <h4 style="font-size:16px">十二经脉流注 · 循行动画</h4>
            <p style="font-size:11.8px;color:var(--muted);margin-top:4px">气血自肺经始，依次流注十二经，至肝经复归于肺，如环无端</p>
          </div>
          <div class="row" style="flex:none;align-items:center">
            <span class="mer-hold" id="merHold"></span>
            <button class="btn btn-sm" id="merPlay">▶ 播放</button>
            <button class="btn btn-sm" id="merStep">下一经</button>
            <button class="btn btn-sm" id="merStop">重置</button>
          </div>
        </div>
        <div class="mer-now" id="merNow"></div>
        <div class="mer-strip" id="merStrip">
          ${[['LU','寅','肺'],['LI','卯','大肠'],['ST','辰','胃'],['SP','巳','脾'],['HT','午','心'],['SI','未','小肠'],['BL','申','膀胱'],['KI','酉','肾'],['PC','戌','心包'],['TE','亥','三焦'],['GB','子','胆'],['LR','丑','肝']].map(([k,s,n])=>
            `<button class="ms-item" data-k="${k}"><i>${s}</i><span>${n}</span></button>`).join('')}
        </div>
        <p style="font-size:11.4px;color:var(--muted);margin-top:10px;line-height:1.8">
          虚线为背侧循行（足太阳膀胱经行于背面，正面图上以虚线示意）。点上面的时辰可直接跳到该经；动画只表示气血流注次序，不代表解剖走行。
        </p>
      </div>
      <div class="card" style="margin-top:16px">
        <h4 style="font-size:16px;margin-bottom:10px">十二经脉主治对照表</h4>
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th>经脉</th><th>流注时辰</th><th>循行方向</th><th>所主</th><th>常见病候</th></tr></thead>
        <tbody>${TY.meridians.map(m=>`<tr><td><b style="font-family:var(--serif)">${esc(m.n)}</b></td><td style="white-space:nowrap">${esc(m.sx)}</td><td>${esc(m.xing)}</td><td>${esc(m.zhu)}</td><td>${esc(m.zheng)}</td></tr>`).join('')}</tbody></table></div>
      </div>`;
    }
    if(cTab==='acu'){
      const BACK = ['肺俞','肝俞','脾俞','肾俞'];
      const front = TY.acupoints.filter(x=>BODY.ACU_POS[x.n] && !BACK.includes(x.n))
        .map(x=>({...x, ...BODY.ACU_POS[x.n]}));
      const back = TY.acupoints.filter(x=>BACK.includes(x.n));
      const more = TY.acupoints.filter(x=>!BODY.ACU_POS[x.n] && !BACK.includes(x.n));
      box.innerHTML = `<div class="acu-grid">
        <div class="acu-fig">
          <div class="card">
            <div class="between" style="margin-bottom:8px">
              <h4 style="font-size:16px">常用穴位分布（正面）</h4>
              <span class="tag">悬停看注解</span>
            </div>
            ${BODY.acupoints(front, true)}
            <p style="font-size:11.5px;color:var(--muted);margin-top:8px;line-height:1.75">红点为示意位置；把鼠标移到点上（手机上点一下）可以看到定位与主治。实际取穴需结合骨度分寸与解剖标志。</p>
            <div style="margin-top:10px;padding-top:10px;border-top:1px dashed var(--line-2)">
              <div style="font-size:12px;color:var(--muted);margin-bottom:5px">背部腧穴（第 1~12 胸椎棘突下旁开 1.5 寸，膀胱经第一侧线）</div>
              <div class="chips">${back.map(x=>`<span class="tag hit" data-acu="${esc(x.n)}">${esc(x.n)}</span>`).join('')}</div>
            </div>
            <a class="btn btn-sm" href="#/charts?tab=b3d" style="margin-top:12px">看 3D 可旋转经络人体 →</a>
          </div>
        </div>
        <div class="card">
          <div class="between" style="margin-bottom:6px">
            <h4 style="font-size:16px">取穴与主治</h4>
            <span class="tag">${TY.acupoints.length} 穴</span>
          </div>
          <div class="acu-list">
            ${front.map((a,idx)=>`
              <div class="acu-item" data-acu-row="${esc(a.n)}">
                <div class="hd"><span class="no">${idx+1}</span><span class="nm">${esc(a.n)}</span><span class="tag" style="font-size:10.5px">${esc(a.m)}</span></div>
                <p class="lo"><b>定位</b>　${esc(a.loc)}</p>
                <p class="in"><b>主治</b>　${esc(a.ind)}</p>
              </div>`).join('')}
            ${back.map(a=>`
              <div class="acu-item" data-acu-row="${esc(a.n)}">
                <div class="hd"><span class="nm">${esc(a.n)}</span><span class="tag" style="font-size:10.5px">${esc(a.m)}</span></div>
                <p class="lo"><b>定位</b>　${esc(a.loc)}</p>
                <p class="in"><b>主治</b>　${esc(a.ind)}</p>
              </div>`).join('')}
          </div>
          ${more.length?`<div style="margin-top:14px;padding-top:12px;border-top:1px dashed var(--line-2)">
            <div class="mini" style="margin-bottom:8px">其余 ${more.length} 穴按体表标志取穴，图上不再逐点标注；完整 <b>361 经穴 + 28 奇穴</b> 已单独成库，可搜穴名 / 编号 / 主治，也能按经与部位筛</div>
            <div class="chips">${[['肺','手太阴肺经'],['大肠','手阳明大肠经'],['胃','足阳明胃经'],['脾','足太阴脾经'],['心','手少阴心经'],['小肠','手太阳小肠经'],['膀胱','足太阳膀胱经'],['肾','足少阴肾经'],['心包','手厥阴心包经'],['三焦','手少阳三焦经'],['胆','足少阳胆经'],['肝','足厥阴肝经'],['督','督脉'],['任','任脉'],['奇穴','经外奇穴']]
              .map(([l,m])=>`<a class="tag hit" href="#/acu?mer=${encodeURIComponent(m)}">${l}</a>`).join('')}</div>
            <a class="btn btn-sm" href="#/acu" style="margin-top:10px">打开穴位库（含 137 个推拿常用穴）→</a>
          </div>`:''}
        </div>
      </div>`;
    }
    if(cTab==='b3d'){
      box.innerHTML = `<div class="grid b3d-grid" id="b3dGrid">
        <div>
          <div class="b3d" id="b3dBox">
            <div class="b3d-hud">
              <button class="chip" data-view="front">正面</button>
              <button class="chip" data-view="back">背面</button>
              <button class="chip" data-view="left">左侧</button>
              <button class="chip" data-view="right">右侧</button>
              <button class="chip brand" id="b3dAuto">自动旋转</button>
            </div>
            <div class="b3d-ctl">
              <button class="chip" id="b3dFlip">翻转 180°</button>
              <button class="chip" id="b3dZin">放大</button>
              <button class="chip" id="b3dZout">缩小</button>
            </div>
          </div>
          <p class="b3d-note">拖拽旋转 · 滚轮或双指缩放 · 双击暂停/继续自动旋转 · 悬停（手机上轻点）穴位看定位与主治。模型是「空间关系示意」，经脉走向与穴位分区按经典记载简化，不能替代骨度分寸取穴。</p>
        </div>
        <div class="b3d-side">
          <div class="card" style="padding:14px 15px">
            <h4 style="font-size:14.5px;margin-bottom:8px">经脉筛选</h4>
            <div class="b3d-mer" id="b3dMer">
              <button data-mer="" class="on"><i style="background:var(--brand)"></i>全部</button>
              ${(function(){
                const list = (window.Body3D && window.Body3D.MER) ? window.Body3D.MER
                  : (BODY.MER||[]).map(x=>({k:x.k, n:x.name, c:x.c}));
                return list.map(m=>`<button data-mer="${m.k}"><i style="background:${m.c}"></i>${esc(String(m.n||'').replace('（前正中）','').replace('（后正中）',''))}</button>`).join('');
              })()}
            </div>
          </div>
          <div class="card" style="padding:14px 15px">
            <h4 style="font-size:14.5px;margin-bottom:6px">怎么用这张图</h4>
            <p style="font-size:12px;color:var(--ink-2);line-height:1.8">① 先转到正面，找任脉（前正中）与胃经（胸腹旁开）；<br>② 再转背面，看督脉与膀胱经第一侧线（五脏俞都在这里）；<br>③ 点某条经脉，只留它一条，看清"从哪走到哪"；<br>④ 记住"经脉所过，主治所及"——比如胃经过面，故面部病常取胃经穴。</p>
          </div>
        </div>
      </div>`;
    }
    if(cTab==='wuxing'){
      box.innerHTML = wuxingPanel();
    }
    if(cTab==='liujing'){
      box.innerHTML = `<div class="grid g3">
        ${TY.liujing.map(it=>`<div class="card" style="padding:14px">
          <h4 style="font-size:15px;margin-bottom:6px">${esc(it.name)}</h4>
          ${BODY.liujing(it.key)}
          <p style="font-size:11.8px;color:var(--muted);margin-top:8px;line-height:1.7">${esc(it.sub)}</p>
          <a class="btn btn-sm" style="margin-top:8px" href="#/theory/${it.key}">详解 →</a>
        </div>`).join('')}
      </div>
      <div class="card" style="margin-top:16px"><h4 style="font-size:16px;margin-bottom:10px">传变路径</h4>${biangChart()}</div>`;
    }
    if(cTab==='qixue'){
      box.innerHTML = `<div class="card">${BODY.qixue()}
        <div class="tbl-wrap" style="margin-top:14px"><table class="tbl"><thead><tr><th>层次</th><th>病机</th><th>主症</th><th>治法</th><th>代表方</th><th>现代理解</th></tr></thead>
        <tbody>${TY.weiqi.map(w=>`<tr><td><b style="font-family:var(--serif)">${esc(w.n)}</b></td><td>${esc(w.d)}</td><td>${esc(w.sym)}</td><td>${esc(w.tr)}</td><td style="color:var(--brand)">${esc(w.f)}</td><td style="color:var(--muted)">${esc(w.modern)}</td></tr>`).join('')}</tbody></table></div>
      </div>`;
    }
    if(cTab==='units'){
      box.innerHTML = `<div class="card">
        <p style="font-size:13px;line-height:1.9;color:var(--ink-2)">${esc(TY.units.note)}</p>
        <div class="tbl-wrap" style="margin-top:14px"><table class="tbl"><thead><tr><th>古代单位</th><th>进制</th><th>现代折算</th><th>说明</th></tr></thead>
        <tbody>${TY.units.table.map(u=>`<tr><td><b style="font-family:var(--serif)">${esc(u.a)}</b></td><td>${esc(u.b)}</td><td style="color:var(--brand)">${esc(u.c)}</td><td style="color:var(--muted)">${esc(u.d)}</td></tr>`).join('')}</tbody></table></div>
        <div style="margin-top:14px">
          ${TY.units.tips.map(t=>`<p style="font-size:12.6px;color:var(--ink-2);line-height:1.85;padding-left:14px;position:relative"><span style="position:absolute;left:0;color:var(--brand)">·</span>${esc(t)}</p>`).join('')}
        </div>
      </div>`;
    }
    if(cTab==='paozhi'){
      box.innerHTML = `<div class="card">
        <p style="font-size:13px;color:var(--ink-2);line-height:1.9">炮制是中药的"二次加工"。同一味药，生用与制用功效常有差异：<b>生姜</b>发散、<b>干姜</b>温中、<b>炮姜</b>止血；<b>生大黄</b>泻下、<b>大黄炭</b>止血；<b>生甘草</b>解毒、<b>炙甘草</b>补中。背方时连炮制一起背，才不会用错。</p>
        <div class="tbl-wrap" style="margin-top:14px"><table class="tbl"><thead><tr><th style="width:86px">方法</th><th>做法与目的</th><th>常用药材</th></tr></thead>
        <tbody>${TY.paozhi.map(p=>`<tr><td><b style="font-family:var(--serif)">${esc(p.t)}</b></td><td>${esc(p.d)}</td><td style="color:var(--brand)">${esc(p.e)}</td></tr>`).join('')}</tbody></table></div>
      </div>`;
    }
    if(cTab==='jianfa'){
      box.innerHTML = `<div class="card">
        <p style="font-size:13px;color:var(--ink-2);line-height:1.9">煎药不是"全部丢进锅里煮"。有些药要先煎减毒，有些要后下保香，有些要包煎防糊，有些要烊化防粘——这些细节直接决定疗效。</p>
        <div class="grid g2" style="margin-top:14px">
          ${TY.jianfa.map(j=>`<div style="padding:13px 15px;border:1px solid var(--line);border-radius:11px;background:var(--card-2)">
            <div class="row"><b style="font-family:var(--serif);font-size:15px;color:var(--brand)">${esc(j.k)}</b></div>
            <p style="font-size:12.4px;color:var(--ink-2);margin-top:5px;line-height:1.75">${esc(j.d)}</p>
            <p style="font-size:12.2px;color:var(--jade);margin-top:5px">${esc(j.e)}</p>
          </div>`).join('')}
        </div>
      </div>`;
    }
    // 交互绑定
    if(cTab==='meridian'){
      const info = $('#merInfo');
      const show = k=>{
        const m = TY.meridians.find(x=>x.abbr===k); if(!m||!info) return;
        $$('.mer-item').forEach(el=>el.classList.toggle('on', el.dataset.k===k));
        $$('.mer-line').forEach(el=>el.style.opacity = el.dataset.k===k?'1':'.3');
        info.innerHTML = `<div class="row"><b style="font-family:var(--serif);font-size:16px;color:var(--brand)">${esc(m.n)}</b><span class="tag">${esc(m.sx)}</span></div>
          <p style="margin-top:6px"><b style="color:var(--ink)">走向：</b>${esc(m.xing)}</p>
          <p style="margin-top:4px"><b style="color:var(--ink)">所主：</b>${esc(m.zhu)}</p>
          <p style="margin-top:4px"><b style="color:var(--ink)">病候：</b>${esc(m.zheng)}</p>`;
      };
      $$('.mer-item').forEach(el=>{
        el.onclick = ()=>{ if(window.__merAnim && window.__merAnim.select(el.dataset.k)) return; show(el.dataset.k); };
        el.onmouseenter = ()=>show(el.dataset.k);
      });
      show('LU');
      window.__merShow = show;
      if(window.MERANIM) window.MERANIM.init();
    }
  }

  /* ============ 练习 ============ */
  let Q = null; // {list, i, answers, scope, mode, n, start}
  /* ---------- 本机照片存储（IndexedDB，失败退 localStorage） ---------- */
  const IMGSTORE = (()=>{
    let dbp = null;
    function open(){
      if(dbp) return dbp;
      dbp = new Promise((res, rej)=>{
        if(!window.indexedDB) return rej(new Error('no idb'));
        const r = indexedDB.open('jellytcm-photo', 1);
        r.onupgradeneeded = ()=>{ if(!r.result.objectStoreNames.contains('ph')) r.result.createObjectStore('ph'); };
        r.onsuccess = ()=>res(r.result);
        r.onerror = ()=>rej(r.error);
      });
      return dbp;
    }
    async function op(mode, fn){
      const db = await open();
      return new Promise((res, rej)=>{
        const t = db.transaction('ph', mode);
        const q = fn(t.objectStore('ph'));
        t.oncomplete = ()=>res(q ? q.result : null);
        t.onerror = ()=>rej(t.error);
        t.onabort = ()=>rej(t.error);
      });
    }
    return {
      async put(k, v){ try{ return await op('readwrite', s=>s.put(v, k)); }catch(e){ try{ localStorage.setItem('jellytcm-img:'+k, v); }catch(e2){ throw e2; } } },
      async get(k){ try{ const v = await op('readonly', s=>s.get(k)); if(v) return v; }catch(e){} return localStorage.getItem('jellytcm-img:'+k); },
      async del(k){ try{ await op('readwrite', s=>s.delete(k)); }catch(e){} try{ localStorage.removeItem('jellytcm-img:'+k); }catch(e){} },
      async keys(){
        let list = [];
        try{ list = await op('readonly', s=>s.getAllKeys()); }catch(e){}
        try{ Object.keys(localStorage).forEach(k=>{ if(k.startsWith('jellytcm-img:')) list.push(k.slice(14)); }); }catch(e){}
        return [...new Set(list)];
      }
    };
  })();

  /* ---------- 练习区（答题 / 错题 / 计划）共用子导航 ---------- */
  const PRACTICE_TABS = [['quiz','练习答题','#/quiz'],['wrong','错题本','#/wrong'],['plan','复习计划','#/plan']];
  function practiceBar(page){
    if(!PRACTICE_TABS.some(t=>t[0]===page)) return '';
    let st = {};
    try{ st = Store.stats(FM.length); }catch(e){}
    const badge = {quiz:'', wrong: st.wrongOpen||0, plan: st.dueCount||0};
    return `<div class="pbar">${PRACTICE_TABS.map(([k,n,h])=>{
      const b = badge[k];
      return `<a class="pbar-i${k===page?' on':''}" href="${h}">${n}${b?`<i>${b}</i>`:''}</a>`;
    }).join('')}</div>`;
  }

  function pageQuiz(params){
    const scope = params.get('scope') || 'mix';
    const n = parseInt(params.get('n')||'0',10);
    const one = params.get('one');
    if(!Q){
      return quizSetup(scope, one);
    }
    return Q.done ? quizResult() : quizRun();
  }

  function quizSetup(scope, oneF){
    const st = Store.stats(FM.length);
    const oneF_ = oneF && FM_BY[oneF];
    const modes = [
      ['mix','综合混合','方名→药物、药物→方名、功效、比例、出处，随机搭配'],
      ['f2h','方名 → 药物','给出方名，选出正确组成（最常用）'],
      ['h2f','药物 → 方名','给出组成，选出方名'],
      ['effect','功效 → 方名','给出功效主治，选方'],
      ['ratio','用量比例 → 方名','按原方用量比例辨认方剂'],
      ['missing','组成鉴别','下列哪味药不属于此方']
    ];
    const scopes = [
      ['mix','综合练习',`全部 ${FM.length} 首方剂，随机出题`],
      ['new','新学方剂',`还有 ${FM.filter(f=>Store.isNew(f.n)).length} 首未学`],
      ['due','到期复习',`按记忆曲线到期 ${st.dueCount} 首`],
      ['wrong','错题强化',`错题本待攻克 ${st.wrongOpen} 首`],
      ['liujing','六经理论','提纲证、主方归属、病机'],
      ['base','基础方配伍','王付 15 基础方：证素认方、归属、合方叠加']
    ];
    return `
    <div class="view quiz-wrap">
      <h1 style="font-size:26px">开始练习</h1>
      <p style="font-size:13px;color:var(--muted);margin-top:4px">全部为选择题。答错自动进入错题本，并按艾宾浩斯曲线安排复习。</p>
      ${oneF_?`<div class="card" style="margin-top:16px;border-color:var(--accent);background:var(--accent-soft)">
        <span class="tag brand">单方练习</span><b style="font-family:var(--serif);font-size:16px;margin-left:8px">${esc(oneF_.n)}</b>
        <p style="font-size:12.5px;color:var(--muted);margin-top:6px">${esc(oneF_.eff)}　·　${esc(oneF_.c.map(x=>x.h).join('、'))}</p>
      </div>`:''}

      <div class="card" style="margin-top:16px">
        <div class="between" style="margin-bottom:12px"><h4 style="font-size:15px">① 选择题型</h4><span class="hint" style="font-size:12px;color:var(--muted)">不确定就选综合混合</span></div>
        <div class="grid g3" style="gap:10px">
          ${modes.map(([k,t,d])=>`
            <button class="pick" data-mode="${k}">
              <span class="dot"></span>
              <span><b>${t}</b><span class="d">${d}</span></span>
            </button>`).join('')}
        </div>
      </div>

      <div class="card" style="margin-top:14px">
        <h4 style="font-size:15px;margin-bottom:12px">② 选择范围</h4>
        <div class="grid g2" style="gap:10px">
          ${scopes.map(([k,t,d])=>`
            <button class="pick" data-scope="${k}">
              <span class="dot"></span>
              <span><b>${t}</b><span class="d">${d}</span></span>
            </button>`).join('')}
        </div>
      </div>

      <div class="card" style="margin-top:14px">
        <div class="between" style="margin-bottom:10px"><h4 style="font-size:15px">③ 选择题量</h4>
          <span style="font-size:12px;color:var(--muted)">已选：<b id="selHint" style="color:var(--brand)"></b></span></div>
        <div class="chips" id="qn">
          ${[5,10,20,50].map(v=>`<button class="chip" data-n="${v}">${v} 题<span style="opacity:.55;font-size:11px"> · 约 ${Math.ceil(v*0.6)} 分钟</span></button>`).join('')}
        </div>
        <div class="row" style="margin-top:18px">
          <button class="btn btn-primary btn-lg" id="startQuiz">开始答题</button>
          <a class="btn" href="#/formulas">先去方剂库看看</a>
        </div>
      </div>

      ${st.dueCount?`<div class="card" style="margin-top:14px;background:linear-gradient(var(--card-2),var(--panel))">
        <div class="between"><div><b style="font-family:var(--serif)">今天有 ${st.dueCount} 首方剂到期</b>
        <p style="font-size:12.4px;color:var(--muted);margin-top:3px">先复习到期的，再学新的，效率最高</p></div>
        <button class="btn btn-sm btn-dark" onclick="location.hash='#/quiz?scope=due&start=1&n=10'">立即复习</button></div></div>`:''}
    </div>`;
  }

  function quizRun(){
    const q = Q.list[Q.i];
    const answered = Q.answers[Q.i] !== undefined;
    const pct = Math.round((Q.i + (answered?1:0.35))*100/Q.list.length);
    return `
    <div class="view quiz-wrap">
      <div class="q-top">
        <a class="btn btn-sm" href="#/quiz" id="quitQuiz">退出</a>
        <div class="q-progress"><i style="width:${pct}%"></i></div>
        <span style="font-size:12.5px;color:var(--muted);white-space:nowrap">${Q.i+1} / ${Q.list.length}</span>
      </div>
      <div class="q-card">
        <div class="q-type">${esc(q.type)}</div>
        <div class="q-title">${esc(q.title)}</div>
        <div class="q-sub">${esc(q.sub||'')}</div>
        <div id="opts">
          ${q.options.map((o,i)=>`
            <button class="opt" data-i="${i}" ${answered?'disabled':''}>
              <span class="k">${String.fromCharCode(65+i)}</span>
              <span>${esc(o)}</span>
            </button>`).join('')}
        </div>
        <div class="q-fb ${answered?(Q.answers[Q.i]?'ok':'no'):''}" id="fb">
          ${answered?feedbackHTML(q, Q.answers[Q.i]):''}
        </div>
        <div class="q-foot">
          <span style="font-size:12px;color:var(--muted)" id="hintSlot">${answered?'按 Enter 继续 →':(Store.settings().hideHint?'':'选择你认为正确的答案　·　键盘 A / B / C / D 也可作答')}</span>
          <div class="row">
            ${answered?`<button class="btn btn-primary" id="nextQ">${Q.i+1===Q.list.length?'查看结果':'下一题 →'}</button>`:''}
          </div>
        </div>
      </div>
    </div>`;
  }
  function feedbackHTML(q, ok){
    return `<b style="color:${ok?'var(--jade)':'var(--brand)'}">${ok?'✓ 回答正确':'✗ 答错了'}</b>
      <div style="margin-top:6px">正确答案：<b>${esc(q.options[q.answer])}</b></div>
      <div class="ex">${esc(q.explain).replace(/\n/g,'<br>')}</div>
      ${q.extra?`<div class="ex" style="color:var(--muted)">${esc(q.extra)}</div>`:''}`;
  }

  function quizResult(){
    const right = Q.answers.filter((a,i)=>a===Q.list[i].answer).length;
    const total = Q.list.length;
    const acc = Math.round(right*100/total);
    const wrongItems = Q.list.map((q,i)=>({q, ok:Q.answers[i]===q.answer, chosen:q.options[Q.answers[i]]})).filter(x=>!x.ok);
    const dur = Math.round((Date.now()-Q.start)/1000);
    const msg = acc>=90?'方证已成，继续精进。':acc>=70?'基础不错，薄弱点已在错题本。':acc>=50?'差不多了，把错的再背一遍。':'别急，先把君药记住。';
    return `
    <div class="view quiz-wrap">
      <div class="result-hero">
        <div class="big">${acc}<small>%</small></div>
        <h2>${esc(msg)}</h2>
        <p>共 ${total} 题 · 答对 ${right} · 答错 ${total-right} · 用时 ${Math.floor(dur/60)}分${dur%60}秒</p>
        <div class="row" style="justify-content:center;margin-top:16px">
          <button class="btn btn-primary" id="againSame">再来一组</button>
          ${wrongItems.length?`<button class="btn" id="againWrong">只练错题 ${wrongItems.length}</button>`:''}
          <a class="btn" href="#/wrong">看错题本</a>
        </div>
      </div>
      ${wrongItems.length?`
      <div class="sec"><h2 style="font-size:18px">本次错题</h2><span class="hint">已自动加入错题本</span></div>
      <div>${wrongItems.map(({q,chosen})=>`
        <div class="card" style="margin-bottom:10px">
          <div class="q-type" style="font-size:11px">${esc(q.type)}</div>
          <p style="font-family:var(--serif);font-size:15.5px;margin:4px 0 6px">${esc(q.title)}</p>
          <p style="font-size:12.8px;color:var(--danger)">你选了：${esc(chosen||'未作答')}</p>
          <p style="font-size:12.8px;color:var(--jade);margin-top:2px">正确：${esc(q.options[q.answer])}</p>
          <p style="font-size:12.3px;color:var(--muted);margin-top:4px">${esc(q.explain)}</p>
        </div>`).join('')}</div>`:''}
      ${right?`<div class="sec"><h2 style="font-size:18px">本组全部题目</h2></div>
        <div>${Q.list.map((q,i)=>`
          <div class="witem" style="align-items:flex-start">
            <span class="tag ${Q.answers[i]===q.answer?'jade':'brand'}" style="margin-top:2px">${Q.answers[i]===q.answer?'对':'错'}</span>
            <div><p style="font-size:13.5px">${esc(q.title)}</p>
            <p style="font-size:12px;color:var(--muted);margin-top:2px">正确：${esc(q.options[q.answer])}</p></div>
          </div>`).join('')}</div>`:''}
    </div>`;
  }

  function startQuiz(opts){
    const list = Quiz.make(opts);
    if(!list.length){ alert('当前范围内没有可出题的方剂'); return; }
    Q = {list, i:0, answers:new Array(list.length), scope:opts.scope, mode:opts.mode, n:list.length, start:Date.now(), done:false};
    render();
  }

  /* ============ 错题本 ============ */
  function pageWrong(){
    const list = Store.wrongList().sort((a,b)=>b.count-a.count);
    const resolved = Store.wrongAll().filter(w=>w.resolved);
    return `
    <div class="view">
      <div class="between">
        <div>
          <h1 style="font-size:26px">错题本</h1>
          <p style="font-size:13px;color:var(--muted);margin-top:4px">答错的方剂会在这里排队，连续答对 3 次自动移出</p>
        </div>
        <div class="row">
          ${list.length?`<a class="btn btn-primary" href="#/quiz?scope=wrong&n=${Math.min(50,list.length)}">开始攻克（${list.length}）</a>`:''}
        </div>
      </div>
      ${list.length? `<div style="margin-top:18px">
        ${list.map(w=>{
          const f = FM_BY[w.id] || {n:w.id, eff:'（六经理论题）', book:'伤寒论'};
          return `<div class="witem">
            <div>
              <div class="nm">${esc(f.n)}</div>
              <div class="dt">${esc(f.book||'')} · ${esc(f.cat||f.eff||'')} ${w.last?'· 最近 '+new Date(w.last).toLocaleDateString('zh-CN'):''}</div>
            </div>
            <div class="cnt">
              <span class="tag brand">错 ${w.count} 次</span>
              <span class="tag ${w.streak>=2?'jade':''}">连对 ${w.streak||0}/3</span>
              ${FM_BY[w.id]?`<a class="btn btn-sm" href="#/formula/${encodeURIComponent(w.id)}">看方</a>`:''}
              <button class="btn btn-sm" data-rm="${esc(w.id)}">移出</button>
            </div>
          </div>`;
        }).join('')}
      </div>`:`<div class="card" style="margin-top:18px;text-align:center;padding:44px">
        <p style="font-family:var(--serif);font-size:18px;color:var(--jade)">错题本是空的</p>
        <p style="font-size:13px;color:var(--muted);margin-top:6px">说明你最近答得不错。保持下去。</p>
        <a class="btn" style="margin-top:14px" href="#/quiz">去做几道题</a>
      </div>`}
      ${resolved.length?`<div class="sec"><h2 style="font-size:17px">已攻克</h2><span class="hint">${resolved.length} 首</span></div>
        <div class="chips">${resolved.map(w=>`<span class="tag jade">${esc((FM_BY[w.id]||{}).n||w.id)}</span>`).join('')}</div>`:''}
    </div>`;
  }

  /* ============ 复习计划 ============ */
  function pagePlan(){
    const st = Store.stats(FM.length);
    const due = FM.filter(f=>Store.isDue(f.n));
    const week = Store.last7();
    const maxV = Math.max(1, ...week.map(d=>d.new+d.review));
    // 未来 7 天预测
    const fc = [];
    for(let i=0;i<7;i++){
      const t0 = Date.now()+i*86400000, t1 = t0+86400000;
      const c = FM.filter(f=>{const k=Store.state.cards[f.n]; return k&&k.seen&&k.due>=t0&&k.due<t1;}).length;
      fc.push({label:i===0?'今天':`+${i}天`, c});
    }
    const maxF = Math.max(1, ...fc.map(x=>x.c));
    return `
    <div class="view">
      <h1 style="font-size:26px">复习计划</h1>
      <p style="font-size:13px;color:var(--muted);margin-top:4px">艾宾浩斯遗忘曲线：新学的知识在 20 分钟后只记得 58%，1 天后剩 33%。在"快要忘记"的节点复习，效率最高。</p>

      <div class="grid g2" style="margin-top:18px">
        <div class="card">
          <h4 style="font-size:16px;margin-bottom:10px">记忆曲线与复习节点</h4>
          ${ebbinghaus()}
          <p style="font-size:12.3px;color:var(--muted);line-height:1.85;margin-top:8px">每次成功回忆，遗忘曲线被"抬回"顶部，且下降速度变慢。本站在 <b>10分钟 · 1天 · 2天 · 4天 · 7天 · 15天 · 30天 · 60天 · 120天</b> 设置复习节点，共 9 个记忆阶段。</p>
        </div>
        <div class="card">
          <h4 style="font-size:16px;margin-bottom:10px">最近 7 天学习量</h4>
          ${barChart(week, maxV)}
          <div class="grid g3" style="margin-top:14px">
            <div class="stat" style="padding:12px"><div class="lab">已学</div><div class="val" style="font-size:22px">${st.learned}</div></div>
            <div class="stat" style="padding:12px"><div class="lab">掌握</div><div class="val" style="font-size:22px">${st.mastered}</div></div>
            <div class="stat" style="padding:12px"><div class="lab">薄弱</div><div class="val" style="font-size:22px">${st.weak}</div></div>
          </div>
        </div>
      </div>

      <div class="sec"><h2>今日到期 ${due.length} 首</h2><span class="hint">按记忆阶段排序，越靠前越该复习</span></div>
      ${due.length?`<div class="grid auto-280">${due.map(fCard).join('')}</div>
        <div class="row" style="margin-top:14px"><a class="btn btn-primary" href="#/quiz?scope=due&n=${Math.min(50,Math.max(5,due.length))}">开始复习</a></div>`
      :`<div class="card" style="text-align:center;padding:34px;color:var(--muted)">今天没有到期内容</div>`}

      <div class="sec"><h2>未来 7 天复习负荷</h2><span class="hint">提前知道哪天忙</span></div>
      <div class="card">
        <div class="grid g4" style="gap:10px">
          ${fc.map(x=>`<div style="padding:12px;background:var(--card-2);border:1px solid var(--line-2);border-radius:10px;text-align:center">
            <div style="font-size:12px;color:var(--muted)">${x.label}</div>
            <div style="font-family:var(--serif);font-size:22px;color:${x.c?'var(--brand)':'var(--muted)'}">${x.c}</div>
            <div class="bar" style="height:4px"><i style="width:${Math.round(x.c*100/maxF)}%"></i></div>
          </div>`).join('')}
        </div>
      </div>

      <div class="sec"><h2>记忆阶段分布</h2></div>
      <div class="card">
        ${boxDist()}
      </div>
    </div>`;
  }

  function ebbinghaus(){
    const P = C();
    const W=540,H=232,pad={l:38,r:16,t:18,b:40};
    const intervals=[0,1,2,4,7,15,30];
    // 用平方根压缩时间轴：早期复习点密（10分钟/1天/2天），后期稀，这样两头都看得清
    const px = d => pad.l + Math.sqrt(d/32)*(W-pad.l-pad.r);
    const py = r => pad.t + (1-r)*(H-pad.t-pad.b);
    let segs=[], points=[];
    for(let s=0;s<intervals.length;s++){
      const start=intervals[s], end=intervals[s+1]||32;
      const pts=[];
      for(let d=start; d<=end; d+=0.4){
        const t=d-start;
        const r = 0.28 + 0.72*Math.exp(-t/(1.6 + s*1.2));
        pts.push([px(d), py(r)]);
      }
      segs.push(pts);
      points.push([px(start), py(1)]);
    }
    // 段与段之间用一条竖直"回忆抬升"线连起来，读起来才是一条连续的遗忘曲线
    const path = segs.map((pp,i)=>
      (i===0?'M':'L') + pp.map(q=>q[0].toFixed(1)+' '+q[1].toFixed(1)).join('L')
    ).join('');
    const labelIdx = [0,1,3,4,5,6];
    return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto">
      <g stroke="${P.line2}" stroke-width="1">
        ${[0,25,50,75,100].map(v=>`<line x1="${pad.l}" y1="${py(v/100).toFixed(1)}" x2="${W-pad.r}" y2="${py(v/100).toFixed(1)}"/>`).join('')}
      </g>
      <g fill="${P.muted}" font-size="9" font-family="monospace">
        ${[0,25,50,75,100].map(v=>`<text x="${pad.l-7}" y="${(py(v/100)+3).toFixed(1)}" text-anchor="end">${v}%</text>`).join('')}
      </g>
      <path d="${path}" fill="none" stroke="${P.brand}" stroke-width="2" stroke-linejoin="round"/>
      ${points.map(pp=>`<g>
        <line x1="${pp[0].toFixed(1)}" y1="${H-pad.b}" x2="${pp[0].toFixed(1)}" y2="${H-pad.b+4}" stroke="${P.line}"/>
        <circle cx="${pp[0].toFixed(1)}" cy="${pp[1].toFixed(1)}" r="4.2" fill="${P.card}" stroke="${P.brand}" stroke-width="1.8"/>
      </g>`).join('')}
      ${labelIdx.map(i=>`<text x="${points[i][0].toFixed(1)}" y="${H-pad.b+16}" text-anchor="middle" font-size="8.6" fill="${P.muted}">${i===0?'学习':"第"+intervals[i]+"天"}</text>`).join('')}
      <text x="${W-pad.r}" y="${H-4}" text-anchor="end" font-size="8.4" fill="${P.muted}">记忆保持率 · 时间 →</text>
    </svg>`;
  }
  function barChart(week, maxV){
    const P = C();
    const empty = week.every(d=>!d.new && !d.review);
    const W=520,H=180,pad={l:26,r:10,t:12,b:26};
    const bw=(W-pad.l-pad.r)/week.length;
    return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto">
      ${[0,.5,1].map(f=>`<line x1="${pad.l}" y1="${(pad.t+(H-pad.t-pad.b)*(1-f)).toFixed(1)}" x2="${W-pad.r}" y2="${(pad.t+(H-pad.t-pad.b)*(1-f)).toFixed(1)}" stroke="${P.line2}"/>`).join('')}
      ${week.map((d,i)=>{
        const x=pad.l+i*bw, h1=(H-pad.t-pad.b)*(d.new/maxV), h2=(H-pad.t-pad.b)*(d.review/maxV);
        return `<g>
          <rect x="${(x+bw*0.18).toFixed(1)}" y="${(H-pad.b-h1).toFixed(1)}" width="${(bw*0.28).toFixed(1)}" height="${h1.toFixed(1)}" fill="${P.accent}"/>
          <rect x="${(x+bw*0.52).toFixed(1)}" y="${(H-pad.b-h2).toFixed(1)}" width="${(bw*0.28).toFixed(1)}" height="${h2.toFixed(1)}" fill="${P.jade}"/>
          <text x="${(x+bw*0.5).toFixed(1)}" y="${H-8}" text-anchor="middle" font-size="8.6" fill="${P.muted}">${d.label}</text>
        </g>`;
      }).join('')}
      ${empty?`<text x="${W/2}" y="${H/2}" text-anchor="middle" font-size="11" fill="${P.muted}">还没有学习记录，做一组题就会出现在这里</text>`:''}
      <g font-size="8.6" fill="${P.muted}"><rect x="${W-96}" y="4" width="8" height="8" fill="${P.accent}"/><text x="${W-84}" y="11">新学</text>
      <rect x="${W-54}" y="4" width="8" height="8" fill="${P.jade}"/><text x="${W-42}" y="11">复习</text></g>
    </svg>`;
  }
  function boxDist(){
    const P = C();
    const counts = new Array(10).fill(0);
    Object.values(Store.state.cards).forEach(c=>{ if(c.seen) counts[Math.min(c.box,9)]++; });
    const max = Math.max(1, ...counts);
    return `<div style="display:grid;grid-template-columns:repeat(10,1fr);gap:7px;align-items:end;height:124px">
      ${counts.map((c,i)=>`<div style="display:flex;flex-direction:column;justify-content:flex-end;height:100%;align-items:center;gap:4px">
        <span style="font-size:11px;color:var(--muted);font-family:var(--mono)">${c}</span>
        <div style="width:100%;background:${i>=6?P.jade:P.accent};height:${Math.max(4,c*100/max)}%"></div>
        <span style="font-size:9px;color:var(--muted);white-space:nowrap">${i===0?'新':Store.boxLabel(i)}</span>
      </div>`).join('')}
    </div>`;
  }

  /* ============ 汤头歌诀 ============ */
  let gState = {cat:'全部', mask:false, q:''};
  function pageSongs(){
    const cats = ['全部', ...new Set(SONGS.map(s=>s.cat))];
    return `
    <div class="view">
      <div class="between">
        <div>
          <h1 style="font-size:26px">汤头歌诀</h1>
          <p style="font-size:13px;color:var(--muted);margin-top:4px">共 ${SONGS.length} 首 · 清·汪昂《汤头歌诀》为主，部分为《方剂学》通行方歌 · 先背歌诀，再解方义</p>
        </div>
        <div class="row">
          <button class="btn btn-sm ${gState.mask?'btn-primary':''}" id="maskBtn">${gState.mask?'已进入背诵模式':'遮盖背诵'}</button>
          <a class="btn btn-sm" href="#/quiz?scope=mix">去做题巩固</a>
        </div>
      </div>
      <div class="card" style="margin-top:14px;padding:14px 16px;background:var(--card-2)">
        <p style="font-size:12.6px;color:var(--ink-2);line-height:1.85">
          <b style="color:var(--brand)">怎么用：</b>点「遮盖背诵」后，歌诀会被遮挡。先自己出声背一遍，再点任意一行核对——能背下来就说明你记住了药材顺序；背不下来，点方名旁边「看方」，回到君臣佐使里找线索。
        </p>
      </div>
      <div class="chips" style="margin-top:14px" id="gcat">
        ${cats.map(c=>`<button class="chip ${gState.cat===c?'on':''}" data-gcat="${esc(c)}">${esc(c)}</button>`).join('')}
      </div>
      <div class="grid g2" style="margin-top:16px" id="glist"></div>
    </div>`;
  }
  function renderSongList(){
    const box = $('#glist'); if(!box) return;
    const q = gState.q.trim();
    const list = SONGS.filter(s=>{
      if(gState.cat!=='全部' && s.cat!==gState.cat) return false;
      if(!q) return true;
      return (s.n+s.s+s.j+s.k).includes(q);
    });
    box.innerHTML = list.length ? list.map(s=>{
      const f = FM_BY[s.n];
      const lines = s.s.split('；');
      const body = lines.map((l,i)=>
        `<span class="txt" data-line>${esc(l)}</span>${i<lines.length-1?'；':''}`).join('');
      return `<div class="card" style="padding:16px 18px">
        <div class="between" style="margin-bottom:9px">
          <h4 style="font-size:17px">${esc(s.n)}</h4>
          <div class="row" style="gap:6px">
            <span class="tag">${esc(s.cat)}</span>
            <button class="btn btn-sm" data-speak="${esc(s.n)}" title="朗读歌诀">🔊 读</button>
            ${f?`<a class="btn btn-sm" href="#/formula/${encodeURIComponent(f.n)}">看方</a>`:''}
          </div>
        </div>
        <div class="song ${gState.mask?'song-mask':''}" data-song>${body}</div>
        <div data-jie ${gState.mask?'hidden':''}>
          <p style="font-size:12.6px;color:var(--ink-2);line-height:1.85;margin-top:10px"><b style="color:var(--brand);font-weight:500">释义：</b>${esc(s.j)}</p>
          <p style="font-size:12.3px;color:var(--muted);line-height:1.8;margin-top:4px"><b style="color:var(--jade);font-weight:500">记忆点：</b>${esc(s.k)}</p>
        </div>
        ${gState.mask?`<div class="row" style="margin-top:10px">
          <button class="btn btn-sm" data-all>全部揭示</button>
          <button class="btn btn-sm" data-showjie>看释义</button>
        </div>`:''}
      </div>`;
    }).join('') : `<div class="card" style="grid-column:1/-1;text-align:center;color:var(--muted)">没有找到匹配的歌诀</div>`;
  }

  /* ============ 悬停批注 ============ */
  let TIP = null;
  function tipEl(){
    if(!TIP){ TIP = document.createElement('div'); TIP.className='tip'; TIP.id='tip'; document.body.appendChild(TIP); }
    return TIP;
  }
  function tipPlace(x, y){
    const t = TIP; if(!t) return;
    const r = t.getBoundingClientRect();
    let left = x + 16, top = y + 16;
    if(left + r.width > window.innerWidth - 8) left = x - r.width - 16;
    if(top + r.height > window.innerHeight - 8) top = y - r.height - 16;
    t.style.left = Math.max(8, left)+'px';
    t.style.top = Math.max(8, top)+'px';
  }
  function tipShow(html, x, y){
    const t = tipEl();
    /* 同样的内容不重复写 innerHTML，避免鼠标移动时整块重排 */
    if(t._html !== html){ t.innerHTML = html; t._html = html; }
    t.classList.add('on');
    tipPlace(x, y);
  }
  function tipMove(x, y){ if(TIP && TIP.classList.contains('on')) tipPlace(x, y); }
  function tipHide(){ if(TIP) TIP.classList.remove('on'); }

  function acuTipHTML(a){
    return `<div class="tt">${esc(a.n)}<em>${esc(a.m)}</em></div>
      <div class="tl"><b>定位</b>　${esc(a.loc)}</div>
      <div class="tl"><b>主治</b>　${esc(a.ind)}</div>
      ${a.eff?`<div class="tl" style="color:var(--muted)"><b>功效</b>　${esc(a.eff)}</div>`:''}`;
  }

  /* 穴位图：悬停即显、移开即隐（不再整块监听 mousemove 重建提示） */
  function bindAcu(root){
    if(!root) return;
    const byName = {}; (TY.acupoints||[]).forEach(a=>byName[a.n]=a);
    let curEl = null, raf = 0, mx = 0, my = 0;
    const mark = n => {
      $$('.acu-svg .acu-item', root).forEach(el=>el.classList.toggle('on', el.dataset.n===n));
      $$('.acu-svg', root).forEach(svg=>svg.classList.toggle('dim', !!n));
      $$('[data-acu-row]', root).forEach(el=>el.classList.toggle('on', el.dataset.acuRow===n));
    };
    const clear = ()=>{ curEl = null; tipHide(); mark(null); };
    const hitOf = t => (t && t.closest ? t.closest('[data-n]') : null);

    root.addEventListener('pointerover', e=>{
      const g = hitOf(e.target);
      if(!g || !root.contains(g) || g === curEl) return;
      const a = byName[g.dataset.n]; if(!a) return;
      curEl = g;
      tipShow(acuTipHTML(a), e.clientX, e.clientY);
      mark(a.n);
    });
    root.addEventListener('pointerout', e=>{
      const g = hitOf(e.target);
      if(!g) return;
      const to = hitOf(e.relatedTarget);
      if(to === g) return;            // 点在同一个穴位内部移动，不隐
      if(curEl === g) clear();
    });
    root.addEventListener('pointermove', e=>{
      if(!curEl) return;
      mx = e.clientX; my = e.clientY;
      if(raf) return;
      raf = requestAnimationFrame(()=>{ raf = 0; if(curEl) tipMove(mx, my); });
    });
    root.addEventListener('pointerleave', clear);

    /* 点击（触屏 / 点标签）：显示后，点别处即消失 */
    root.addEventListener('click', e=>{
      const g = hitOf(e.target);
      const a = g ? byName[g.dataset.n] : (e.target.closest('[data-acu]') ? byName[e.target.closest('[data-acu]').dataset.acu] : null);
      if(a){
        curEl = null;
        tipShow(acuTipHTML(a), e.clientX, e.clientY);
        mark(a.n);
        return;
      }
      const row = e.target.closest('[data-acu-row]');
      if(row && byName[row.dataset.acuRow]){
        tipShow(acuTipHTML(byName[row.dataset.acuRow]), e.clientX, e.clientY);
        mark(row.dataset.acuRow);
        return;
      }
      clear();
    });
    /* 列表行悬停也联动高亮 */
    root.addEventListener('pointerover', e=>{
      const row = e.target.closest('[data-acu-row]');
      if(row) mark(row.dataset.acuRow);
    });
  }

  /* 经脉图：悬停显示经脉信息，移开即隐 */
  function bindMer(root){
    if(!root) return;
    const byK = {}; (TY.meridians||[]).forEach(m=>byK[m.abbr]=m);
    let raf = 0, mx = 0, my = 0, on = false;
    root.addEventListener('pointerover', e=>{
      const hit = e.target.closest('.mer-hit');
      if(!hit || !root.contains(hit)) return;
      const m = byK[hit.dataset.k]; if(!m) return;
      on = true;
      tipShow(`<div class="tt">${esc(m.n)}<em>${esc(m.sx)}</em></div>
        <div class="tl"><b>走向</b>　${esc(m.xing)}</div>
        <div class="tl"><b>所主</b>　${esc(m.zhu)}</div>
        <div class="tl"><b>病候</b>　${esc(m.zheng)}</div>`, e.clientX, e.clientY);
    });
    root.addEventListener('pointerout', e=>{
      const hit = e.target.closest('.mer-hit');
      if(!hit) return;
      const to = e.relatedTarget && e.relatedTarget.closest ? e.relatedTarget.closest('.mer-hit') : null;
      if(to === hit) return;
      on = false; tipHide();
    });
    root.addEventListener('pointermove', e=>{
      if(!on) return;
      mx = e.clientX; my = e.clientY;
      if(raf) return;
      raf = requestAnimationFrame(()=>{ raf = 0; tipMove(mx, my); });
    });
    root.addEventListener('pointerleave', ()=>{ on = false; tipHide(); });
  }

  /* ============ 五行脏腑 ============ */
  function wuxingWheel(){
    const P = C();
    const ord = WX.order || [];
    const W=380, H=330, cx=190, cy=162, R=108;
    const pos = ord.map((el,i)=>{ const a=(-90+i*72)*Math.PI/180; return [cx+Math.cos(a)*R, cy+Math.sin(a)*R*0.94]; });
    let arcs = '';
    for(let i=0;i<5;i++){
      const a=pos[i], b=pos[(i+1)%5];
      const mx=(a[0]+b[0])/2, my=(a[1]+b[1])/2;
      const cxp=(mx-cx)*0.42+cx, cyp=(my-cy)*0.42+cy;
      arcs += `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)} Q${cxp.toFixed(1)} ${cyp.toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}" fill="none" stroke="${P.jade}" stroke-width="1.6" opacity=".5" marker-end="url(#wxA)"/>`;
    }
    let ke = '';
    for(let i=0;i<5;i++){
      const a=pos[i], b=pos[(i+2)%5];
      ke += `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="${P.accent}" stroke-width="1.1" stroke-dasharray="4 4" opacity=".42"/>`;
    }
    const nodes = (WX.rows||[]).map((r,i)=>{
      const [x,y] = pos[i];
      const col = (WX.color||{})[r.el] || P.brand;
      return `<g class="wx-node" data-el="${esc(r.el)}">
        <circle cx="${x}" cy="${y}" r="35" fill="${col}" opacity=".13"/>
        <circle cx="${x}" cy="${y}" r="27" fill="${P.card}" stroke="${col}" stroke-width="1.6"/>
        <text x="${x}" y="${y-2}" text-anchor="middle" font-size="19" font-family="var(--serif)" fill="${col}" font-weight="600">${esc(r.el)}</text>
        <text x="${x}" y="${y+15}" text-anchor="middle" font-size="10.5" font-family="var(--serif)" fill="${P.ink2}">${esc(r.zang)}</text>
      </g>`;
    }).join('');
    return `<svg viewBox="0 0 ${W} ${H}" class="wx-svg" role="img" aria-label="五行生克与五脏对应图">
      <defs><marker id="wxA" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
        <path d="M0 0 L8 4 L0 8 z" fill="${P.jade}" opacity=".7"/></marker></defs>
      ${ke}${arcs}${nodes}
      <text x="${cx}" y="${cy-4}" text-anchor="middle" font-size="12.5" font-family="var(--serif)" fill="${P.muted}">五行</text>
      <text x="${cx}" y="${cy+14}" text-anchor="middle" font-size="10.5" font-family="var(--mono)" fill="${P.muted}">生 · 克</text>
      <g font-size="9.6" font-family="var(--mono)">
        <text x="14" y="${H-10}" fill="${P.jade}">实线＝相生</text>
        <text x="86" y="${H-10}" fill="${P.accent}">虚线＝相克</text>
      </g>
    </svg>`;
  }

  function wuxingPanel(){
    const P = C();
    const rows = WX.rows || [];
    return `<div class="card">
      <div class="between" style="align-items:flex-start">
        <div style="max-width:760px">
          <h4 style="font-size:16px;margin-bottom:6px">五行不是玄学，是一张「关系表」</h4>
          <p style="font-size:13px;line-height:1.95;color:var(--ink-2)">${esc(WX.note||'')}</p>
        </div>
        <span class="tag gold">《素问》阴阳应象大论</span>
      </div>
      <div class="row" style="gap:18px;margin-top:12px;font-size:12.4px;color:var(--ink-2)">
        <span><b style="color:var(--jade)">相生</b>　${esc(WX.sheng||'')}</span>
        <span><b style="color:var(--accent)">相克</b>　${esc(WX.ke||'')}</span>
      </div>
    </div>

    <div class="wx-grid" style="margin-top:16px">
      <div class="card">
        <h4 style="font-size:15px;margin-bottom:4px">五行生克盘</h4>
        ${wuxingWheel()}
        <p style="font-size:11.8px;color:var(--muted);line-height:1.75;margin-top:4px">外圈顺着走是「生」，隔一位拉一条是「克」。生克失衡就是病：木旺克土见肝气犯胃，土虚木乘见食少腹胀。</p>
      </div>
      <div class="card">
        <h4 style="font-size:15px;margin-bottom:8px">五行—脏腑—体窍对应</h4>
        <div class="tbl-wrap" style="max-height:none">
          <table class="tbl wx-table">
            <thead><tr><th>五行</th><th>五脏</th><th>六腑</th><th>体</th><th>窍</th><th>志</th><th>液</th><th>色</th><th>味</th><th>季</th></tr></thead>
            <tbody>${rows.map(r=>`<tr>
              <td><b style="font-family:var(--serif);color:${(WX.color||{})[r.el]||P.brand}">${esc(r.el)}</b></td>
              <td><b style="font-family:var(--serif)">${esc(r.zang)}</b></td>
              <td>${esc(r.fu)}</td><td>${esc(r.ti)}</td><td>${esc(r.qiao)}</td>
              <td>${esc(r.zhi)}</td><td>${esc(r.ye)}</td><td>${esc(r.se)}</td><td>${esc(r.wei)}</td><td>${esc(r.ji)}</td>
            </tr>`).join('')}</tbody>
          </table>
        </div>
        <p style="font-size:11.6px;color:var(--muted);line-height:1.7;margin-top:8px">这张表是"取象比类"的归纳：同一行的事物被认为有相通的功能属性。它帮助记忆与推理，但不是把人体简化成五个格子。</p>
      </div>
    </div>

    <div class="sec"><h2>五脏功能与常见病候</h2><span class="hint">把"主什么"和"病了什么"对上</span></div>
    <div class="grid g3">
      ${rows.map(r=>`<div class="card" style="padding:15px 16px;border-left:3px solid ${(WX.color||{})[r.el]||P.brand}">
        <div class="row" style="gap:7px"><b style="font-family:var(--serif);font-size:17px;color:${(WX.color||{})[r.el]||P.brand}">${esc(r.zang)}</b><span class="tag">${esc(r.el)}</span><span class="tag" style="font-size:10px">${esc(r.ji)}</span></div>
        <p style="font-size:12.3px;color:var(--ink-2);line-height:1.8;margin-top:6px"><b style="color:var(--brand);font-weight:500">主</b>　${esc(r.gong)}</p>
        <p style="font-size:12.2px;color:var(--ink-2);line-height:1.8;margin-top:3px"><b style="color:var(--accent);font-weight:500">病</b>　${esc(r.bing)}</p>
        <p style="font-size:12px;color:var(--muted);line-height:1.8;margin-top:6px">${esc(r.zhi2)}</p>
      </div>`).join('')}
    </div>

    <div class="sec"><h2>脏腑表里相合</h2><span class="hint">一阴一阳、一脏一腑，经脉络属</span></div>
    <div class="zf">
      ${(WX.zangfu||[]).map(z=>`<div class="pair"><b>${esc(z.p)}</b><span style="color:var(--muted);font-family:var(--mono);font-size:10.5px">${esc(z.t)}</span><span>${esc(z.d)}</span></div>`).join('')}
    </div>

    <div class="sec"><h2>六经与脏腑</h2><span class="hint">伤寒六经不是六个器官，而是六组证候</span></div>
    <div class="grid g3">
      ${(WX.liujingMap||[]).map(l=>`<div class="card" style="padding:13px 15px">
        <div class="row"><b style="font-family:var(--serif);font-size:15px;color:var(--brand)">${esc(l.l)}</b></div>
        <p style="font-size:12.2px;color:var(--ink-2);line-height:1.8;margin-top:4px">${esc(l.d)}</p>
      </div>`).join('')}
    </div>`;
  }

  /* ============ 症状查方 ============ */
  let symState = {q:''};
  function pageSymptom(params){
    const q0 = params && params.get('q') ? params.get('q') : symState.q;
    symState.q = q0;
    return `
    <div class="view">
      <div class="between">
        <div>
          <h1 style="font-size:26px">症状查方</h1>
          <p style="font-size:13px;color:var(--muted);margin-top:4px">输入你身上的感觉，看看古人用哪些方子应对——重点是看"为什么是它"，而不是照方抓药　<a href="#/disease" style="color:var(--brand)">按病名查 → 去临床页 ↗</a></p>
        </div>
        <span class="tag gold">${SYM.length} 组症状 · ${SYM.reduce((a,g)=>a+g.items.length,0)} 条方证</span>
      </div>

      <div class="card" style="margin-top:14px">
        <textarea class="sym-in" id="symIn" placeholder="例如：头痛、怕冷、没有汗　/　口苦、胁肋胀、容易发脾气　/　湿气重、身体沉、舌苔厚腻　/　失眠、心慌、手脚心热">${esc(q0)}</textarea>
        <div class="between" style="margin-top:10px">
          <div class="sym-pills" id="symPills">
            ${['头痛','咳嗽','失眠','便秘','湿气','口苦','胃痛','水肿','痛经','怕冷','盗汗','咽痛'].map(k=>`<button class="chip" data-sym="${k}">${k}</button>`).join('')}
          </div>
          <div class="row">
            <button class="btn btn-sm" id="symClear">清空</button>
            <button class="btn btn-primary" id="symGo">查方剂</button>
          </div>
        </div>
      </div>

      <div id="symRes" class="sym-res"></div>

      <div class="warn" style="margin-top:18px">
        <span class="ic">!</span>
        <div class="tx"><b>重要提醒</b>同一个症状，证型不同，用方完全相反。比如"头痛"，风寒用川芎茶调散、肝阳上亢用天麻钩藤饮、瘀血用血府逐瘀汤——辨错证，方子就是毒。本页只做学习索引，<b>不构成诊疗建议</b>；身体不适请找执业中医师面诊。</div>
      </div>
    </div>`;
  }

  function renderSym(q){
    const box = $('#symRes'); if(!box) return;
    q = (q||'').trim();
    symState.q = q;
    const fill = txt => {
      const inp = $('#symIn'); if(!inp) return;
      inp.value = txt; inp.focus();
      renderSym(txt);
    };
    if(!q){
      const demos = [
        ['外感', '头痛 怕冷 没有汗 鼻塞'],
        ['少阳', '口苦 胁肋胀 忽冷忽热'],
        ['湿困', '身体沉 舌苔厚腻 大便黏'],
        ['虚烦', '失眠 心慌 手脚心热']
      ];
      const groups = SYM.slice(0, 30);
      box.innerHTML = `
        <div class="card" style="padding:16px 18px">
          <h4 style="font-size:15px;margin-bottom:4px">不知道怎么描述？先照这四种格式来</h4>
          <p style="font-size:12.4px;color:var(--muted);line-height:1.8;margin-bottom:10px">把自己真实的感觉、怕冷怕热、出汗、大小便、舌苔，用几个词连起来写就行，不用写成句子。</p>
          <div class="grid g4" style="gap:8px">
            ${demos.map(([t, txt])=>`<button class="sym-demo" data-fill="${esc(txt)}"><b>${esc(t)}</b><span>${esc(txt)}</span></button>`).join('')}
          </div>
        </div>
        <div class="card" style="padding:16px 18px">
          <div class="between" style="margin-bottom:8px">
            <h4 style="font-size:15px">按常见症状挑</h4>
            <span class="tag">${SYM.length} 组 · ${SYM.reduce((a,g)=>a+g.items.length,0)} 条方证</span>
          </div>
          <div class="chips">${groups.map(g=>`<button class="chip" data-sym="${esc(g.k)}">${esc(g.k)}</button>`).join('')}</div>
        </div>
        <div class="card" style="padding:16px 18px;background:var(--card-2)">
          <h4 style="font-size:14.5px;margin-bottom:6px">查出来之后怎么用</h4>
          <p style="font-size:12.4px;color:var(--ink-2);line-height:1.9">
            ① 先看「辨证要点」，确认自己的寒热虚实对不对得上；<br>
            ② 再看方剂的君臣佐使，理解为什么这几味药能管这个证；<br>
            ③ 最后看一眼禁忌——同样一个症状，证型辨反了，方子就是毒。
          </p>
        </div>`;
      $$('#symRes [data-fill]').forEach(b=>b.onclick = ()=>fill(b.dataset.fill));
      $$('#symRes [data-sym]').forEach(b=>b.onclick = ()=>fill(b.dataset.sym));
      return;
    }
    const norm = s => s.replace(/[\s，,、。;；:：/|]+/g,'');
    const nq = norm(q);
    const hitGroups = [];
    SYM.forEach(g=>{
      const keys = [g.k, ...(g.alias||[])];
      if(keys.some(k=>nq.includes(norm(k)))) hitGroups.push(g);
    });
    // 逐字包含（如输入"头有点痛"）
    if(!hitGroups.length){
      SYM.forEach(g=>{ if(nq.includes(g.k.slice(0,1)) && (g.alias||[]).some(a=>nq.includes(a))) hitGroups.push(g); });
    }

    const score = {};
    hitGroups.forEach(g=>{
      g.items.forEach(it=>{
        score[it.n] = score[it.n] || {n:it.n, s:0, hits:[]};
        score[it.n].s += 10;
        score[it.n].hits.push({k:g.k, tag:it.tag, why:it.why});
      });
    });
    // 方名直接命中
    const direct = [...FM].filter(f=>nq.includes(norm(f.n)) || (nq.length>=2 && f.n.includes(nq))).slice(0,6);
    direct.forEach(f=>{
      score[f.n] = score[f.n] || {n:f.n, s:0, hits:[]};
      score[f.n].s += 100;
      score[f.n].hits.push({k:'方名', tag:f.cat, why:'你直接输入了方名'});
    });

    let list = Object.values(score).sort((a,b)=>b.s-a.s);
    // 兜底：按主治/功效关键词搜
    if(!list.length){
      const kw = q.split(/[\s，,、。;；]+/).filter(Boolean);
      const fb = FM.filter(f=>kw.some(k=>k.length>=2 && (f.ind+f.eff+f.n).includes(k))).slice(0,10);
      if(fb.length){
        box.innerHTML = `<div class="card" style="padding:12px 15px;background:var(--card-2)">
          <p style="font-size:12.6px;color:var(--ink-2);line-height:1.85">没有匹配到症状组，下面按「主治/功效关键词」直接检索到 ${fb.length} 首方剂，请自行核对证候。</p>
        </div>
        <div class="sym-res">${fb.map(f=>`<div class="sym-card">
          <div class="top"><span class="nm">${esc(f.n)}</span><span class="tag">${esc(f.cat)}</span></div>
          <div class="why"><b>功效：</b>${esc(f.eff)}</div>
          <div class="why"><b>主治：</b>${esc(f.ind)}</div>
          <div class="row"><a class="btn btn-sm" href="#/formula/${encodeURIComponent(f.n)}">看方剂</a></div>
        </div>`).join('')}</div>`;
        return;
      }
      box.innerHTML = `<div class="sym-empty">没有找到与「${esc(q)}」相关的方剂。<br>试试更常见的说法：${['头痛','咳嗽','失眠','便秘','湿气','口苦','怕冷'].map(k=>`<button class="chip" data-sym="${k}">${k}</button>`).join(' ')}</div>`;
      return;
    }

    const showS = new Set(hitGroups.map(g=>g.k));
    box.innerHTML = `
      <div class="card" style="padding:13px 16px;background:var(--card-2);border-style:dashed">
        <p style="font-size:12.6px;color:var(--ink-2);line-height:1.85">
          你描述了 <b style="color:var(--brand)">${hitGroups.length}</b> 组症状：${hitGroups.map(g=>`<span class="tag brand" style="margin:0 3px">${esc(g.k)}</span>`).join('')}。
          下面按匹配度排序；<b>同一症状下的不同证型会用不同的方</b>，请看每条的「辨证要点」，别只看方名。
        </p>
      </div>
      ${list.slice(0,14).map(it=>{
        const f = FM_BY[it.n]; if(!f) return '';
        return `<div class="sym-card">
          <div class="top">
            <span class="nm">${esc(f.n)}</span>
            <span class="tag">${esc(f.cat)}</span>
            ${f.liu?`<span class="tag jade">${esc(f.liu)}</span>`:''}
            <span class="sc">命中 ${it.hits.length}</span>
          </div>
          <div class="sx">${it.hits.map(h=>`<span class="tag" style="font-size:10.5px">${esc(h.k)} · ${esc(h.tag)}</span>`).join('')}</div>
          <div class="why">${it.hits.map(h=>`<div>· <b>${esc(h.tag)}</b>：${esc(h.why)}</div>`).join('')}</div>
          <div class="why" style="color:var(--muted);font-size:11.8px">功效：${esc(f.eff)}</div>
          <div class="row">
            <a class="btn btn-sm btn-dark" href="#/formula/${encodeURIComponent(f.n)}">看方剂与君臣佐使</a>
            <a class="btn btn-sm" href="#/quiz?scope=one&one=${encodeURIComponent(f.n)}&n=5">练这首</a>
            ${f.cau?`<span class="tag" title="${esc(f.cau)}" style="border-color:var(--accent);color:var(--accent);font-size:10.5px">有禁忌，慎用</span>`:''}
          </div>
        </div>`;
      }).join('')}
    `;
    // 重新绑定内联 chips
    $$('#symRes [data-sym]').forEach(b=>b.onclick=()=>{
      const inp = $('#symIn'); if(!inp) return;
      inp.value = (inp.value.trim()? inp.value.trim()+' ':'') + b.dataset.sym;
      renderSym(inp.value);
    });
  }

  /* ============ 数据（导出 / 导入 / 成就） ============ */
  function pageData(){
    const st = Store.stats(FM.length);
    let size = '0';
    try{ size = (JSON.stringify(Store.state).length/1024).toFixed(1); }catch(e){}
    const today = Store.todayKey().replace(/-/g,'');
    /* 药材图片覆盖情况 */
    const PH = window.PHOTOS || {};
    const pics = h => (PH[h.n]||[]).filter(x=>x&&x.f);
    const withPhoto = HB.filter(h=>pics(h).length>0);
    const noPhoto = HB.filter(h=>pics(h).length===0);
    const multiPic = HB.filter(h=>pics(h).length>1);
    const totalPics = Object.values(PH).reduce((a,v)=>a+(v||[]).filter(x=>x&&x.f).length,0);
    return `
    <div class="view">
      <h1 style="font-size:26px">数据与迁移</h1>
      <p style="font-size:13px;color:var(--muted);margin-top:4px">学习记录只存在你这台电脑、这个浏览器里；换设备或换浏览器时，用下面的 JSON 搬过去</p>

      <div class="card" style="margin-top:16px">
        <div class="between" style="margin-bottom:10px">
          <h4 style="font-size:16px">外观与特效</h4>
          <span class="tag">都在本机生效</span>
        </div>
        <div class="set-row">
          <div>
            <b>主题</b>
            <span>古海＝宣纸朱印（默认，最像旧书）；浅海＝青绿浅色，白天看舒服；夜海＝深色荧光，关灯背歌诀用。</span>
          </div>
          <div class="row" id="setTheme">
            <button class="btn btn-sm" data-t="ancient">古海</button>
            <button class="btn btn-sm" data-t="light">浅海</button>
            <button class="btn btn-sm" data-t="dark">夜海</button>
          </div>
        </div>
        <div class="set-row">
          <div>
            <b>我给药材拍的照片</b>
            <span id="setPhotoInfo">照片只存在这个浏览器里，不会上传；换设备或清缓存会丢，重要的图请自己留底。</span>
          </div>
          <button class="btn btn-sm" id="setPhotoClear">清除全部</button>
        </div>
      </div>

      <div class="card" style="margin-top:16px">
        <h4 style="font-size:16px;margin-bottom:10px">内容规模</h4>
        <div class="kpi">
          <div class="box"><b>${HB.length}</b><span>药材</span></div>
          <div class="box"><b>${FM.length}</b><span>方剂</span></div>
          <div class="box"><b>${SONGS.length}</b><span>歌诀</span></div>
          <div class="box"><b>${(window.SHANGHAN||[]).length}</b><span>伤寒条文</span></div>
          <div class="box"><b>${(TY.acupoints||[]).length}</b><span>穴位</span></div>
          <div class="box"><b>${(window.DISEASES||[]).length}</b><span>现代病 · ${(window.DISEASES||[]).reduce((a,d)=>a+d.types.length,0)} 证型</span></div>
        </div>
        <p style="font-size:12.3px;color:var(--muted);margin-top:12px;line-height:1.85">
          药材的性味归经、功效用量按《中国药典》2020 年版与《中药学》教材；方剂的组成、君臣佐使按《方剂学》教材与原著。
          现代病一栏是「病名 → 常见证型 → 主方」的学习索引，不是处方集。
        </p>
      </div>

      <div class="card" style="margin-top:16px">
        <h4 style="font-size:16px;margin-bottom:10px">你现在的情况</h4>
        <div class="kpi">
          <div class="box"><b>${st.learned}</b><span>已学方剂</span></div>
          <div class="box"><b>${st.mastered}</b><span>已掌握</span></div>
          <div class="box"><b>${st.answers}</b><span>累计答题</span></div>
          <div class="box"><b>${st.accuracy}%</b><span>今日正确率</span></div>
          <div class="box"><b>${st.streak}</b><span>连续天数</span></div>
          <div class="box"><b>${st.wrongOpen}</b><span>待攻克错题</span></div>
          <div class="box"><b>${size}K</b><span>记录体积</span></div>
        </div>
        <p style="font-size:12.3px;color:var(--muted);margin-top:12px;line-height:1.85">
          存储位置：浏览器 <code>localStorage</code> 的 <code>jellytcm-v1</code> 键（旧版 <code>tcm-study-v1</code> 会自动迁移）。
          <b style="color:var(--ink-2)">清浏览器缓存 / 换浏览器 / 用无痕窗口，记录都会丢</b>，所以建议每周导出一次备份。
        </p>
      </div>

      <div class="grid g2" style="margin-top:16px">
        <div class="card">
          <h4 style="font-size:16px;margin-bottom:6px">① 导出（备份 / 换机）</h4>
          <p style="font-size:12.5px;color:var(--muted);line-height:1.85;margin-bottom:12px">生成一个 JSON 文件，包含全部学习记录、错题本、记忆阶段与每日统计，以及「我的方」里自己存的方。拷到新电脑后用下面的「导入」恢复。</p>
          <div class="row">
            <button class="btn btn-primary" id="dlBtn">下载 JSON 备份</button>
            <button class="btn" id="copyBtn">复制到剪贴板</button>
          </div>
          <p style="font-size:11.5px;color:var(--muted);margin-top:10px;font-family:var(--mono)">建议文件名：jellytcm-backup-${today}.json</p>
          <div style="margin-top:14px;padding-top:12px;border-top:1px dashed var(--line-2)">
            <div style="font-size:11.5px;color:var(--muted);font-family:var(--mono);margin-bottom:6px">备份包含</div>
            <div class="chips">
              <span class="tag">${Object.keys(Store.state.cards).length} 张记忆卡片</span>
              <span class="tag">${Object.keys(Store.state.wrong).length} 条错题</span>
              <span class="tag">${Object.keys(Store.state.daily).length} 天统计</span>
              <span class="tag">连续 ${Store.state.streak.days||0} 天</span>
            </div>
            <p style="font-size:11.8px;color:var(--muted);line-height:1.8;margin-top:8px">
              不含题库（题库就在文件夹里），所以备份文件很小，几十 KB 而已。
            </p>
          </div>
        </div>

        <div class="card">
          <h4 style="font-size:16px;margin-bottom:6px">② 导入（恢复 / 合并）</h4>
          <p style="font-size:12.5px;color:var(--muted);line-height:1.85;margin-bottom:12px">选择备份文件，或把 JSON 内容粘贴到下面的框里。可拖动文件到虚线区。</p>
          <div class="drop" id="drop">
            <p style="font-size:13px;color:var(--ink-2)">把 <b>.json</b> 文件拖到这里</p>
            <p style="font-size:11.5px;color:var(--muted);margin-top:4px">或</p>
            <div class="row" style="justify-content:center;margin-top:8px">
              <button class="btn btn-sm" id="pickBtn">选择文件</button>
              <input type="file" id="impFile" accept=".json,application/json" hidden>
            </div>
          </div>
          <textarea id="impText" placeholder="也可以直接粘贴备份 JSON 内容…" spellcheck="false"
            style="width:100%;height:74px;margin-top:10px;padding:10px 12px;border:1px solid var(--line);border-radius:5px;
            background:var(--card-2);color:var(--ink);font-family:var(--mono);font-size:11.5px;resize:vertical;outline:none"></textarea>
          <div id="impInfo" style="font-size:12.2px;color:var(--muted);margin-top:8px;min-height:18px"></div>
          <div class="row" style="margin-top:10px">
            <label class="row" style="gap:6px;font-size:12.5px;cursor:pointer"><input type="radio" name="impMode" value="merge" checked> 合并（保留现有并取优）</label>
            <label class="row" style="gap:6px;font-size:12.5px;cursor:pointer"><input type="radio" name="impMode" value="replace"> 覆盖（清空后恢复）</label>
          </div>
          <div class="row" style="margin-top:10px">
            <button class="btn btn-primary" id="doImport">执行导入</button>
          </div>
        </div>
      </div>

      <div class="card" style="margin-top:16px">
        <div class="between" style="margin-bottom:10px">
          <h4 style="font-size:16px">药材图片库</h4>
          <span class="tag ${noPhoto.length?'gold':'jade'}">${noPhoto.length?('待补 '+noPhoto.length+' 味'):'全部有图'}</span>
        </div>
        <div class="kpi">
          <div class="box"><b>${HB.length}</b><span>药材总数</span></div>
          <div class="box"><b>${withPhoto.length}</b><span>有实拍图</span></div>
          <div class="box"><b>${noPhoto.length}</b><span>暂无图</span></div>
          <div class="box"><b>${totalPics}</b><span>图片总张数</span></div>
          <div class="box"><b>${multiPic.length}</b><span>含两张以上</span></div>
        </div>
        ${noPhoto.length?`<details style="margin-top:12px">
          <summary style="cursor:pointer;font-size:12.6px;color:var(--brand)">查看这 ${noPhoto.length} 味暂无图的药材</summary>
          <div class="chips" style="margin-top:8px">${noPhoto.map(h=>`<a class="tag hit" href="#/herb/${encodeURIComponent(h.n)}">${esc(h.n)}</a>`).join('')}</div>
        </details>`:''}
        <p style="font-size:12.3px;color:var(--muted);margin-top:12px;line-height:1.85">
          ${noPhoto.length ? `目前 ${withPhoto.length} 味有实拍图、${noPhoto.length} 味暂无，共 ${totalPics} 张` : `每味药至少 1 张实拍图，共 ${totalPics} 张`}（部分药有饮片 + 原植物两张）；内容完全相同的重复图已去重。
          照片来自公开网络（百度百科 / 360 图片），仅作辨识参考；你也可以在药材页用「我的照片」换成本机的图，只存这个浏览器。
        </p>
      </div>

      <div class="sec"><h2>成就徽章</h2><span class="hint">已点亮 ${badgesHTML(st,true).got} / ${BADGES.length}</span></div>
      ${badgesHTML(st)}

      <div class="sec"><h2>便携说明</h2><span class="hint">怎么把水母中医带到别的地方</span></div>
      <div class="card">
        <div class="grid g2">
          <div>
            <h4 style="font-size:14.5px;color:var(--brand);margin-bottom:6px">方式一：整个文件夹拷走</h4>
            <p style="font-size:12.6px;color:var(--ink-2);line-height:1.9">
              把整个 <code>JellyTCM</code> 文件夹复制到 U 盘 / 另一台电脑，双击 <code>index.html</code> 就能用。
              零依赖、零安装、不联网，也不需要 Node 或任何服务器。界面与题库全部随之带走。
            </p>
          </div>
          <div>
            <h4 style="font-size:14.5px;color:var(--brand);margin-bottom:6px">方式二：连学习记录一起搬</h4>
            <p style="font-size:12.6px;color:var(--ink-2);line-height:1.9">
              记录不在文件夹里，而在浏览器本地存储。所以：旧机器「导出 JSON」→ 新机器打开同一份网页 →「导入」→ 选「合并」。
              这样错题本、记忆阶段、连续打卡天数都能接上。
            </p>
          </div>
        </div>
      </div>

      <div class="sec"><h2>危险操作</h2><span class="hint">会丢数据，请先导出</span></div>
      <div class="card" style="border-color:var(--danger)">
        <div class="between">
          <div>
            <h4 style="font-size:14.5px;color:var(--danger);margin-bottom:4px">清空全部学习记录</h4>
            <p style="font-size:12.4px;color:var(--muted)">移除所有记忆阶段、错题本、打卡记录与「我的方」，题库不受影响。操作不可撤销。</p>
          </div>
          <button class="btn btn-sm" id="resetBtn" style="color:var(--danger);border-color:var(--danger)">重置</button>
        </div>
      </div>
    </div>`;
  }

  /* ============ 路由 ============ */
  /* 列表页滚动位置记忆：从详情返回列表时停在原处 */
  const SCROLL = {};
  const RESTORE_PAGES = new Set(['/herbs','/formulas','/theory','/songs','/wrong','/plan','/cases','/family','/data','/prescribe','/puzzle','/rx','/jiangji','/shanghan']);
  const LIST_PAGES = new Set(['herbs','formulas','songs','wrong','plan','theory','jiangji','shanghan']);
  const isDetailKey = k => k.split('/').filter(Boolean).length >= 2;
  let curPath = '';        // 上一次路由的 path（不含 query）
  let curKey  = '';        // 上一次路由的滚动键
  function scrollKey(page, path, qs){
    return LIST_PAGES.has(page) ? path : (qs ? path+'?'+qs : path);
  }
  function route(){
    tipHide();
    const raw = location.hash.replace(/^#/,'') || '/';
    const [path, qs] = raw.split('?');
    const params = new URLSearchParams(qs||'');
    const seg = path.split('/').filter(Boolean);
    const page = seg[0] || 'home';
    const nextKey = scrollKey(page, path, qs);
    const prevPath = curPath;
    if(curKey && curKey !== nextKey) SCROLL[curKey] = window.scrollY;
    if(page !== 'quiz') Q = null;
    let html = '';
    if(page==='home') html = pageHome();
    else if(page==='theory') html = pageTheory(seg[1]);
    else if(page==='formulas') html = pageFormulas();
    else if(page==='formula') html = pageFormula(decodeURIComponent(seg[1]||''));
    else if(page==='herbs') html = pageHerbs();
    else if(page==='herb') html = pageHerb(decodeURIComponent(seg[1]||''));
    else if(page==='charts'){
      const tb = params.get('tab');
      const OK = ['meridian','acu','b3d','liujing','wuxing','qixue','units','paozhi','jianfa'];
      cTab = OK.includes(tb) ? tb : 'meridian';
      html = pageCharts();
    }
    else if(page==='quiz') html = pageQuiz(params);
    else if(page==='wrong') html = pageWrong();
    else if(page==='plan') html = pagePlan();
    else if(page==='songs') html = pageSongs();
    else if(page==='symptom') html = pageSymptom(params);
    else if(page==='data') html = pageData();
    else if(window.PAGES && window.PAGES[page]) html = window.PAGES[page](params, seg);
    else html = pageHome();

    html = practiceBar(page) + html;

    if(window.__b3d){ try{ window.__b3d.destroy(); }catch(e){} window.__b3d = null; }
    if(window.__merAnim){ try{ window.__merAnim.destroy(); }catch(e){} }
    view().innerHTML = html;
    if(page==='quiz' && params.get('start')==='1' && !Q){
      const opts = buildOpts(params.get('scope')||'mix', params.get('mode')||'mix',
        parseInt(params.get('n')||'10',10), params.get('one'));
      setTimeout(()=>{ if(!Q) startQuiz(opts); }, 30);
    }
    // 导航高亮（含分组下拉：组内任意页命中，整组按钮亮起）
    // 先清空分组，再按当前页重算——否则从「临床」切到「诊法」后，旧分组会一直亮着
    $$('.nav-dd').forEach(dd=>dd.classList.remove('on'));
    $$('.nav a').forEach(a=>{
      const k = a.getAttribute('href').replace('#/','').split('?')[0] || 'home';
      const inPractice = (page==='wrong'||page==='plan') && k==='quiz';
      const inTools = (page==='tree'||page==='compare'||page==='dose'||page==='analyze'||page==='rx'||page==='reverse'||page==='family'||page==='shanghan'||page==='timeline'||page==='prescribe'||page==='puzzle'||page==='random'||page==='dictate'||page==='heat') && k==='tools';
      const hit = k===page || inPractice || inTools || (page==='formula'&&k==='formulas') || (page==='herb'&&k==='herbs') || ((page==='disease'||page==='analyze'||page==='rx')&&k==='disease');
      a.classList.toggle('on', hit);
      const dd = a.closest('.nav-dd');
      if(dd && hit) dd.classList.add('on');
    });
    $$('#streakVal').forEach(el=>el.textContent = Store.stats().streak);
    bind(page);
    if(window.PAGE_BIND && window.PAGE_BIND[page]) window.PAGE_BIND[page](params, seg);
    if(window.__stopRnd && page!=='random') window.__stopRnd();
    /* 恢复 / 归零：回到「上次离开过」的列表或详情页才回原位，其余一律回顶 */
    const canRestore = (RESTORE_PAGES.has(nextKey) || isDetailKey(nextKey)) &&
      prevPath && prevPath !== path && SCROLL[nextKey] != null;
    const y = canRestore ? SCROLL[nextKey] : 0;
    window.scrollTo({top:y, behavior:'instant'});
    curPath = path; curKey = nextKey;
  }

  /* ============ 事件绑定 ============ */
  function bind(page){

    if(page==='home'){
      routeHooks();
    }
    if(page==='formulas'){
      const q = $('#fq');
      if(q){ q.oninput = ()=>{ fState.q = q.value; renderFormulaList(); }; }
      $$('#fcat .chip').forEach(b=>b.onclick=()=>{ fState.cat=b.dataset.cat; fState.q=''; route(); });
      $$('#fliu .chip').forEach(b=>b.onclick=()=>{ fState.liu=b.dataset.liu; fState.q=''; route(); });
      renderFormulaList();
    }
    if(page==='herbs'){
      const q = $('#hq');
      if(q){ q.oninput = ()=>{ hState.q = q.value; renderHerbList(); }; }
      $$('#hpart .chip').forEach(b=>b.onclick=()=>{ hState.part=b.dataset.part; route(); });
      $$('#htag [data-tag]').forEach(b=>b.onclick=()=>{ hState.tag=b.dataset.tag; route(); });
      $$('#htag [data-nat]').forEach(b=>b.onclick=()=>{ hState.nat=b.dataset.nat; route(); });
      $$('#htag [data-pic]').forEach(b=>b.onclick=()=>{ hState.pic=b.dataset.pic; route(); });
      const rs = $('#hReset');
      if(rs) rs.onclick = ()=>{ hState = {q:'', part:'全部', tag:'全部', pic:'全部', nat:'全部'}; route(); };
      renderHerbList();
    }
    if(page==='formula'){
      const b = $('#learnBtn');
      if(b) b.onclick = ()=>{
        const nm = decodeURIComponent(location.hash.split('/')[2]||'');
        const wasNew = Store.isNew(nm);
        Store.grade(nm, true);
        if(wasNew) Store.bumpNew();
        b.textContent='已加入复习计划 ✓'; b.disabled = true;
        setTimeout(()=>route(), 700);
      };
    }
    if(page==='formula'){
      const cb = $('#cardBtn');
      if(cb) cb.onclick = ()=>{
        const nm = decodeURIComponent(location.hash.split('/')[2]||'');
        const f = FM_BY[nm]; if(!f) return;
        exportCard(f, SONGS.find(s=>s.n===f.n));
      };
    }
    if(page==='data'){
      const cur = document.documentElement.getAttribute('data-theme')||'ancient';
      $$('#setTheme button').forEach(b=>{
        b.classList.toggle('on', b.dataset.t===cur);
        b.classList.toggle('btn-primary', b.dataset.t===cur);
        b.onclick = ()=>{ setTheme(b.dataset.t); route(); };
      });
      const sc = null;
      (async()=>{
        const info = $('#setPhotoInfo');
        if(!info) return;
        const ks = await IMGSTORE.keys().catch(()=>[]);
        info.innerHTML = ks.length
          ? `当前存了 <b>${ks.length}</b> 张：${ks.slice(0,8).map(esc).join('、')}${ks.length>8?' 等':''}。只存在这个浏览器里，不会上传；换设备或清缓存会丢。`
          : '还没有放自己的照片。到任意药材页点「我的照片」选图即可，照片只存在这个浏览器里，不会上传。';
      })();
      const pc = $('#setPhotoClear');
      if(pc) pc.onclick = async ()=>{
        const ks = await IMGSTORE.keys().catch(()=>[]);
        for(const nm of ks) await IMGSTORE.del(nm).catch(()=>{});
        tipShow('已清除 ' + ks.length + ' 张本机照片', '内置图不受影响，页面刷新后恢复原样');
        route();
      };
    }
    if(page==='herb'){
      const hname = decodeURIComponent(location.hash.replace(/^#\/?/,'').split('?')[0].split('/')[1]||'');
      const box = $('#photoBox');
      const cap = $('#photoCap');
      const reset = $('#photoReset');
      const gal = $$('#photoGal button');
      const mainImg = () => $('#photoMain');
      let caps = [];
      try{ caps = JSON.parse(cap.dataset.list||'[]'); }catch(e){ caps = []; }

      const showCap = i=>{
        if(!cap) return;
        const c = caps[i];
        cap.textContent = c && c.cap ? c.cap : '照片 · 仅作辨识参考';
      };
      gal.forEach(b=>b.onclick = ()=>{
        const i = +b.dataset.i;
        const img = mainImg();
        const item = ((window.PHOTOS||{})[hname]||[])[i];
        if(!img || !item) return;
        img.src = encodeURI('assets/photos/'+item.f);
        gal.forEach(x=>x.classList.toggle('on', x===b));
        box.dataset.i = i;
        showCap(i);
      });

      /* 本机照片：压缩后存 IndexedDB（失败退 localStorage），刷新仍在 */
      const useMine = url=>{
        if(!box) return;
        box.classList.remove('empty');
        let img = mainImg();
        if(!img){
          box.innerHTML = '<img id="photoMain" alt="本机照片">';
          img = mainImg();
        }
        img.src = url;
        if(cap) cap.textContent = '我的照片 · 仅存本机，未上传';
        if(reset) reset.hidden = false;
      };
      const pp = $('#photoPick');
      if(pp) pp.onchange = e=>{
        const f = e.target.files && e.target.files[0];
        if(!f) return;
        const fr = new FileReader();
        fr.onload = ()=>{
          const im = new Image();
          im.onload = async ()=>{
            const max = 1000;
            let w = im.width, hh = im.height;
            if(Math.max(w,hh) > max){ const k = max/Math.max(w,hh); w = Math.round(w*k); hh = Math.round(hh*k); }
            const cv = document.createElement('canvas');
            cv.width = w; cv.height = hh;
            cv.getContext('2d').drawImage(im, 0, 0, w, hh);
            const data = cv.toDataURL('image/jpeg', 0.82);
            try{ await IMGSTORE.put(hname, data); }catch(err){ console.warn('照片保存失败', err); }
            useMine(data);
            tipShow('已保存到本机', '换设备或清缓存后会消失，可用「数据」页导出备份');
          };
          im.onerror = ()=> tipShow('读不出这张图', '换一张常见格式（JPG / PNG）试试');
          im.src = fr.result;
        };
        fr.readAsDataURL(f);
      };
      if(reset) reset.onclick = async ()=>{
        try{ await IMGSTORE.del(hname); }catch(e){}
        const first = ((window.PHOTOS||{})[hname]||[])[0];
        if(first){
          useMine(encodeURI('assets/photos/'+first.f));
          if(cap) cap.textContent = first.cap || '照片 · 仅作辨识参考';
        }
        reset.hidden = true;
        gal.forEach((x,i)=>x.classList.toggle('on', i===0));
      };
      /* 之前存过的本机照片 */
      (async()=>{
        try{
          const saved = await IMGSTORE.get(hname);
          if(saved){ useMine(saved); }
        }catch(e){}
      })();
    }
    if(page==='herb'){
      const mb = $('#fxMoreBtn'), more = $('#fxMore');
      if(mb && more) mb.onclick = ()=>{
        const open = mb.dataset.open==='1';
        more.hidden = open;
        mb.dataset.open = open ? '0' : '1';
        mb.textContent = open ? `展开其余 ${mb.dataset.n} 首` : '收起';
      };
    }
    if(page==='charts'){
      $$('#ctab .chip').forEach(b=>b.onclick=()=>{
        const t = b.dataset.tab;
        if(location.hash === '#/charts?tab='+t) return;
        location.hash = '#/charts?tab='+t;
      });
      renderChartBody();
      const cb = $('#cbody');
      if(cb){
        bindAcu(cb);
        if(cTab==='meridian') bindMer(cb);
      }
      if(cTab==='b3d' && window.Body3D){
        const boxEl = $('#b3dBox');
        if(boxEl){
          const b = window.Body3D.mount(boxEl, h=>{
            if(!h) return tipHide();
            tipShow(acuTipHTML(h.acu), h.x, h.y);
          });
          window.__b3d = b;
          $$('#b3dBox [data-view]').forEach(btn=>btn.onclick=()=>b.face(btn.dataset.view));
          const au = $('#b3dAuto'); if(au) au.onclick=()=>{ b.setAuto(!b.state.auto); au.classList.toggle('brand', b.state.auto); au.textContent = b.state.auto? '自动旋转' : '已暂停'; };
          const fl = $('#b3dFlip'); if(fl) fl.onclick=()=>{ b.flip(); tipHide(); };
          const zi = $('#b3dZin'); if(zi) zi.onclick=()=>b.zoom(b.state.zoom*1.14);
          const zo = $('#b3dZout'); if(zo) zo.onclick=()=>b.zoom(b.state.zoom/1.14);
          $$('#b3dMer button').forEach(btn=>btn.onclick=()=>{
            $$('#b3dMer button').forEach(x=>x.classList.remove('on'));
            btn.classList.add('on');
            const k = btn.dataset.mer;
            b.setMer(k);
            tipHide();
            // 膀胱经、督脉在背面；任脉在正面 —— 自动转到能看见的那一面
            if(k==='BL' || k==='DU') b.face('back');
            else if(k==='REN') b.face('front');
            if(k){ b.setAuto(false); const au2=$('#b3dAuto'); if(au2){ au2.classList.remove('brand'); au2.textContent='已暂停'; } }
          });
        }
      }
    }
    if(page==='wrong'){
      $$('[data-rm]').forEach(b=>b.onclick=()=>{ Store.removeWrong(b.dataset.rm); route(); });
    }
    if(page==='songs'){
      renderSongList();
      $$('#gcat .chip').forEach(b=>b.onclick=()=>{
        gState.cat=b.dataset.gcat;
        $$('#gcat .chip').forEach(x=>x.classList.toggle('on', x===b));
        renderSongList();
      });
      const mb = $('#maskBtn');
      if(mb) mb.onclick = ()=>{ gState.mask = !gState.mask; route(); };
      const gl = $('#glist');
      if(gl) gl.onclick = e=>{
        const txt = e.target.closest('[data-line]');
        if(txt && txt.closest('.song-mask')){ txt.classList.add('reveal'); return; }
        const all = e.target.closest('[data-all]');
        if(all){ const s = all.closest('.card').querySelector('[data-song]'); if(s) s.classList.toggle('reveal'); return; }
        const sj = e.target.closest('[data-showjie]');
        if(sj){
          const j = sj.closest('.card').querySelector('[data-jie]');
          if(j){ j.hidden = !j.hidden; sj.textContent = j.hidden ? '看释义' : '收起释义'; }
        }
      };
    }
    if(page==='symptom'){
      const ta = $('#symIn');
      const go = ()=>renderSym(ta? ta.value : '');
      if(ta){
        ta.oninput = ()=>{ clearTimeout(ta._t); ta._t = setTimeout(go, 260); };
        ta.onkeydown = e=>{ if(e.key==='Enter' && (e.ctrlKey||e.metaKey||!e.shiftKey)){ e.preventDefault(); go(); } };
      }
      const g = $('#symGo'); if(g) g.onclick = go;
      const c = $('#symClear'); if(c) c.onclick = ()=>{ if(ta){ ta.value=''; ta.focus(); } renderSym(''); };
      $$('#symPills [data-sym]').forEach(b=>b.onclick=()=>{
        if(!ta) return;
        ta.value = (ta.value.trim()? ta.value.trim()+' ':'') + b.dataset.sym;
        renderSym(ta.value);
      });
      renderSym(symState.q);
    }
    if(page==='data') bindData();
    if(page==='quiz'){
      bindQuiz();
    }
  }

  /* ============ 数据页交互 ============ */
  function bindData(){
    const dl = $('#dlBtn');
    if(dl) dl.onclick = ()=>{
      try{
        const blob = new Blob([Store.dump()], {type:'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'jellytcm-backup-'+Store.todayKey().replace(/-/g,'')+'.json';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(()=>URL.revokeObjectURL(url), 3000);
        dl.textContent = '已生成备份 ✓';
        setTimeout(()=>{ dl.textContent='下载 JSON 备份'; }, 1800);
      }catch(e){ alert('下载失败，请用「复制到剪贴板」代替'); }
    };
    const cp = $('#copyBtn');
    if(cp) cp.onclick = ()=>{
      const txt = Store.dump();
      const done = ok=>{
        cp.textContent = ok ? '已复制 ✓' : '复制失败，请用下载';
        setTimeout(()=>{ cp.textContent='复制到剪贴板'; }, 1800);
      };
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(txt).then(()=>done(true)).catch(()=>done(fallbackCopy(txt)));
      }else done(fallbackCopy(txt));
    };
    function fallbackCopy(txt){
      const ta = document.createElement('textarea');
      ta.value = txt; ta.style.position='fixed'; ta.style.opacity='0';
      document.body.appendChild(ta); ta.select();
      let ok = false;
      try{ ok = document.execCommand('copy'); }catch(e){}
      ta.remove(); return ok;
    }

    const info = $('#impInfo');
    const ta = $('#impText');
    let pending = null;
    const preview = text=>{
      const r = Store.parseBackup(text);
      if(!r.ok){ pending = null; info.innerHTML = `<span style="color:var(--danger)">${esc(r.msg)}</span>`; return; }
      pending = r.data;
      info.innerHTML = `<span style="color:var(--jade)">✓ 识别成功</span>：${r.cards} 张记忆卡片` +
        (r.at ? ` · 导出于 ${new Date(r.at).toLocaleString('zh-CN')}` : '');
    };
    const file = $('#impFile'), pick = $('#pickBtn');
    if(pick && file) pick.onclick = ()=>file.click();
    if(file) file.onchange = ()=>{
      const f = file.files[0]; if(!f) return;
      const rd = new FileReader();
      rd.onload = ()=>{ ta.value = rd.result; preview(rd.result); };
      rd.readAsText(f, 'utf-8');
    };
    if(ta) ta.oninput = ()=>{ if(ta.value.trim()) preview(ta.value); else { pending=null; info.textContent=''; } };
    const drop = $('#drop');
    if(drop){
      ['dragenter','dragover'].forEach(ev=>drop.addEventListener(ev, e=>{ e.preventDefault(); drop.classList.add('hot'); }));
      ['dragleave','drop'].forEach(ev=>drop.addEventListener(ev, e=>{ e.preventDefault(); drop.classList.remove('hot'); }));
      drop.addEventListener('drop', e=>{
        const f = e.dataTransfer.files && e.dataTransfer.files[0]; if(!f) return;
        const rd = new FileReader();
        rd.onload = ()=>{ ta.value = rd.result; preview(rd.result); };
        rd.readAsText(f, 'utf-8');
      });
    }
    const doImp = $('#doImport');
    if(doImp) doImp.onclick = ()=>{
      if(!pending){ alert('请先选择文件、拖入文件，或粘贴备份 JSON'); return; }
      const mode = (document.querySelector('input[name=impMode]:checked')||{}).value || 'merge';
      if(mode==='replace' && !confirm('覆盖会清空当前全部学习记录（含我的方），确定继续？')) return;
      Store.restore(pending, mode!=='replace');
      alert(mode==='replace' ? '已覆盖恢复 ✓' : '已合并导入 ✓');
      route();
    };
    const rb = $('#resetBtn');
    if(rb) rb.onclick = ()=>{
      if(!confirm('确定清空全部学习记录？操作不可撤销，建议先导出备份。')) return;
      if(!confirm('再次确认：记忆阶段、错题本、打卡天数、我的方都会归零。')) return;
      Store.reset(); route();
    };
  }
  function routeHooks(){}

  let selMode='mix', selN=10, selScope='mix';
  function bindQuiz(){
    // 设置页
    if(!$('#startQuiz')) {
      // 运行页
      if(!Q) return;
      if(Q.done){
        const again = $('#againSame');
        if(again) again.onclick = ()=>{ Q=null; route(); };
        const aw = $('#againWrong');
        if(aw) aw.onclick = ()=>{
          const ids = Q.list.filter((q,i)=>Q.answers[i]!==q.answer).map(q=>q.fid).filter(Boolean);
          Q=null; startQuiz({n:Math.max(5,ids.length), mode:'mix', scope:'wrong', ids:[...new Set(ids)]});
        };
        return;
      }
      const q = Q.list[Q.i];
      $$('#opts .opt').forEach(btn=>{
        btn.onclick = ()=>{
          if(Q.answers[Q.i]!==undefined) return;
          const i = parseInt(btn.dataset.i,10);
          Q.answers[Q.i] = i;
          const ok = i===q.answer;
          // 记录
          if(q.fid && !String(q.fid).startsWith('__lj_')){
            const wasNew = Store.isNew(q.fid);
            Store.grade(q.fid, ok);
            if(wasNew) Store.bumpNew(); else Store.bumpReview();
          }else{
            // 六经理论题：不单独建卡片，但计入每日统计
            Store.touchAnswer(ok);
          }
          // 视觉
          $$('#opts .opt').forEach((b,j)=>{
            b.disabled = true;
            if(j===q.answer) b.classList.add('right');
            if(j===i && !ok) b.classList.add('wrong');
          });
          const fb = $('#fb');
          fb.className = 'q-fb show ' + (ok?'ok':'no');
          fb.innerHTML = feedbackHTML(q, ok);
          const foot = $('.q-foot .row');
          if(foot) foot.innerHTML = `<button class="btn btn-primary" id="nextQ">${Q.i+1===Q.list.length?'查看结果':'下一题 →'}</button>`;
          const nx = $('#nextQ');
          if(nx) nx.onclick = next;
          const hs = $('#hintSlot'); if(hs) hs.textContent='按 Enter 继续 →';
        };
      });
      const nx = $('#nextQ'); if(nx) nx.onclick = next;
      const quit = $('#quitQuiz'); if(quit) quit.onclick=(e)=>{ e.preventDefault(); Q=null; render(); };
      return;
    }
    // 设置页交互
    selMode='mix'; selN=10; selScope='mix';
    const modes = {mix:'综合混合',f2h:'方名→药物',h2f:'药物→方名',effect:'功效→方名',ratio:'用量比例',missing:'组成鉴别'};
    const upd = ()=>{
      const d = $('#selHint');
      if(d) d.textContent = `${modes[selMode]||selMode} · ${selN} 题`;
      $$('[data-mode]').forEach(b=>b.classList.toggle('sel', b.dataset.mode===selMode));
      $$('[data-scope]').forEach(b=>b.classList.toggle('sel', b.dataset.scope===selScope));
      $$('#qn .chip').forEach(b=>b.classList.toggle('on', +b.dataset.n===selN));
    };
    $$('[data-mode]').forEach(b=>b.onclick=()=>{ selMode=b.dataset.mode; upd(); });
    $$('[data-scope]').forEach(b=>b.onclick=()=>{ selScope=b.dataset.scope; upd(); });
    $$('#qn .chip').forEach(b=>b.onclick=()=>{ selN=+b.dataset.n; upd(); });
    const p = new URLSearchParams((location.hash.split('?')[1])||'');
    selScope = p.get('scope') || 'mix';
    if(!['mix','new','due','wrong','liujing'].includes(selScope)) selScope = 'mix';
    selN = parseInt(p.get('n')||'10',10);
    if(![5,10,20,50].includes(selN)) selN = 10;
    const pm = p.get('mode');
    if(pm && ['mix','f2h','h2f','effect','ratio','missing'].includes(pm)) selMode = pm;
    const one = p.get('one');
    upd();
    const st = $('#startQuiz');
    if(st) st.onclick = ()=>{
      const opts = buildOpts(selScope, selMode, selN, one);
      if(opts.ids && !opts.ids.length){
        alert(selScope==='due' ? '今天没有到期内容，先学几首新的吧' : selScope==='wrong' ? '错题本是空的，去练习吧' : '所有方剂都已学过，试试综合练习');
        return;
      }
      Q = null;
      startQuiz(opts);
    };
  }
  function buildOpts(scope, mode, n, one){
    const opts = {n, mode, scope};
    if(one){ opts.ids = [one]; opts.n = Math.max(5, n); opts.mode = 'mix'; return opts; }
    if(scope==='due') opts.ids = FM.filter(f=>Store.isDue(f.n)).map(f=>f.n);
    else if(scope==='new') opts.ids = FM.filter(f=>Store.isNew(f.n)).map(f=>f.n);
    else if(scope==='wrong') opts.ids = Store.wrongList().map(w=>w.id).filter(id=>FM_BY[id]);
    if(scope==='liujing'){ opts.mode='liujing'; opts.n = Math.min(6, n); }
    if(scope==='base'){ opts.mode='base'; opts.n = Math.min(15, n); }
    return opts;
  }
  function next(){
    if(!Q) return;
    if(Q.i+1 >= Q.list.length){ Q.done = true; render(); return; }
    Q.i++; render();
  }
  function render(){
    // 重绘当前路由（不改变 hash）
    const raw = location.hash.replace(/^#/,'') || '/';
    const [path, qs] = raw.split('?');
    const params = new URLSearchParams(qs||'');
    const seg = path.split('/').filter(Boolean);
    const page = seg[0]||'home';
    let html='';
    if(page==='quiz') html = pageQuiz(params);
    else if(page==='home') html = pageHome();
    else route();
    if(html){
      view().innerHTML = html;
    if(page==='quiz' && params.get('start')==='1' && !Q){
      const opts = buildOpts(params.get('scope')||'mix', params.get('mode')||'mix',
        parseInt(params.get('n')||'10',10), params.get('one'));
      setTimeout(()=>{ if(!Q) startQuiz(opts); }, 30);
    }
      bind(page);
      window.scrollTo({top:0,behavior:'instant'});
    }
  }

  /* ============ 全局搜索（Ctrl/Cmd + K） ============ */
  const SEARCH = {open:false, idx:[], sel:0, items:[]};
  function buildIndex(){
    const idx = [];
    FM.forEach(f=>idx.push({
      t:f.n, s:'方剂 · '+f.cat, u:'#/formula/'+encodeURIComponent(f.n),
      py:pyWords(f.py).join('|')+'|'+pyWords(f.py).join(''), ini:pyInit(f.n).toLowerCase(),
      k:(f.n+f.c.map(x=>x.h).join('')+f.eff+f.ind+f.book).toLowerCase()
    }));
    /* 药材别名：方里写「芍药」「桂皮」也要能搜到白芍、肉桂 */
    const aliasOf = {};
    Object.entries(window.HB_ALIAS || {}).forEach(([a, c]) => { (aliasOf[c] = aliasOf[c] || []).push(a); });
    HB.forEach(h=>{
      const extra = (aliasOf[h.n] || []).join('');
      idx.push({
        t:h.n, s:'药材 · '+h.part + (extra ? ' · 别名 ' + extra : ''), u:'#/herb/'+encodeURIComponent(h.n),
        al:(aliasOf[h.n]||[]).join('|').toLowerCase(),
        py:pyWords(h.py).join('|')+'|'+pyWords(h.py).join(''), ini:pyInit(h.n).toLowerCase(),
        k:(h.n+extra+h.eff+h.ind+(h.la||'')+(h.nat||'')).toLowerCase()
      });
    });
    SONGS.forEach(s=>idx.push({
      t:s.n, s:'歌诀 · '+s.cat, u:'#/songs', ini:pyInit(s.n).toLowerCase(),
      k:(s.n+s.s+s.j).toLowerCase()
    }));
    SYM.forEach(g=>idx.push({
      t:g.k, s:'症状查方 · '+g.items.length+' 首', u:'#/symptom?q='+encodeURIComponent(g.k),
      ini:pyInit(g.k).toLowerCase(),
      k:(g.k+(g.alias||[]).join('')).toLowerCase()
    }));
    (window.DISEASES||[]).forEach(d=>idx.push({
      t:d.n, s:'现代病 · '+d.dept+' · '+d.tcm, u:'#/disease/'+encodeURIComponent(d.n),
      ini:pyInit(d.n).toLowerCase(),
      k:(d.n+d.tcm+d.dept+d.sum+d.types.map(t=>t.z+t.k+t.f.join('')).join('')).toLowerCase()
    }));
    /* 证型单独入索引：搜「肝阳上亢」「风寒束表」能直达那个证型，不必先记住病名 */
    (window.DISEASES||[]).forEach(d=>(d.types||[]).forEach((t,ti)=>idx.push({
      t:t.z, s:'证型 · '+d.n+' · '+d.dept, u:'#/disease/'+encodeURIComponent(d.n)+'?z='+ti,
      ini:pyInit(t.z).toLowerCase(),
      k:(t.z+' '+t.k+' '+t.f.join(' ')+' '+d.n+' '+d.tcm).toLowerCase()
    })));
    /* 二十八脉入索引：搜「弦」「滑」「如按琴弦」都能到脉象页并选中那一条 */
    (window.PULSE && window.PULSE.list || []).forEach(p=>idx.push({
      t:p.n, s:'脉象 · '+p.cat+' · '+p.zhu.split('。')[0].slice(0,16), u:'#/pulse?p='+encodeURIComponent(p.n),
      ini:p.py,
      k:(p.n+p.cat+p.desc+p.zhu+p.pts+p.jian).toLowerCase()
    }));
    /* 穴位入索引：搜「合谷」「LI4」「失眠 穴」都能到穴位详情 */
    (ACU||[]).forEach(a=>idx.push({
      t:a.n, s:'穴位 · '+a.m+(a.pt?' · '+a.pt:'')+(a.c?' · '+a.c:''),
      u:'#/acu?p='+encodeURIComponent(a.n),
      ini:pyInit(a.n).toLowerCase(),
      k:(a.n+' '+(a.c||'')+' '+a.m+' '+(a.pt||'')+' '+(a.ind||'')+' '+(a.sp||'')+' '+(a.loc||'')).toLowerCase()
    }));
    (TY.liujing||[]).forEach(it=>idx.push({
      t:it.name, s:'六经 · '+it.biaoli, u:'#/theory/'+it.key,
      k:(it.name+it.gang+it.essence+it.treat).toLowerCase()
    }));
    /* 推拿入索引：搜「清天河水」「捏脊」「滚法」「小儿发热」能直达对应 tab */
    (function(){
      const T = window.TUINA; if(!T) return;
      T.hand.forEach(h=>idx.push({
        t:h.n, s:'推拿手法 · 成人', u:'#/tuina?tab=hand',
        k:(h.n+h.d+h.use+h.key+h.g).toLowerCase()
      }));
      T.tianhe.forEach(t=>idx.push({
        t:t.n, s:'小儿推拿 · 天河水', u:'#/tuina?tab=kid',
        k:(t.n+t.xing+t.zhu+t.use+t.dir+t.note+'天河水 清热 退热 发热').toLowerCase()
      }));
      T.kidheat.forEach(k=>idx.push({
        t:k.n, s:'小儿推拿 · 清热温法', u:'#/tuina?tab=kid',
        k:(k.n+k.pos+k.xing+k.use).toLowerCase()
      }));
      T.kid.forEach(k=>idx.push({
        t:k.n, s:'小儿推拿穴', u:'#/tuina?tab=kid',
        k:(k.n+k.loc+k.op+k.zhu+k.use+'小儿').toLowerCase()
      }));
      T.fushi.forEach(f=>idx.push({
        t:f.n, s:'小儿推拿 · 复式操作', u:'#/tuina?tab=kid',
        k:(f.n+f.d+f.use+'复式').toLowerCase()
      }));
      T.routine.forEach(r=>idx.push({
        t:r.n, s:'保健套路', u:'#/tuina?tab=routine',
        k:(r.n+r.for+r.steps.join(' ')).toLowerCase()
      }));
    })();
    /* 舌象入索引：搜「齿痕舌」「绛舌」直达舌诊页 */
    (window.TONGUE && window.TONGUE.signs || []).forEach(s=>idx.push({
      t:s.n, s:'舌象 · '+s.cat, u:'#/tongue',
      k:(s.n+s.cat+s.see+s.zu+s.ji+'舌诊').toLowerCase()
    }));
    /* 医案入索引：搜病案里用到的方 */
    (window.CASES||[]).forEach(c=>idx.push({
      t:c.n, s:c.src?'医案 · 名家医案':'医案 · 示例病案', u:'#/cases',
      k:('医案 '+(c.jin?c.jin.p+c.jin.s+c.jin.r:'')+c.n).toLowerCase()
    }));
    /* 条文精讲入索引：搜「但欲寐」「懊憹」「蒸蒸而振」直达那一条 */
    (window.SHANGHAN||[]).forEach(x=>{
      const d = (window.JJ||{})[x.n] || {};
      idx.push({
        t:x.n+' '+x.t.slice(0,18)+(x.t.length>18?'…':''),
        s:'条文精讲 · '+x.b+'篇'+(x.f?' · '+x.f:'')+(x.tag?' · '+x.tag:''),
        u:'#/jiangji?p='+encodeURIComponent(x.b)+'&n='+encodeURIComponent(x.n),
        ini:pyInit(x.t).toLowerCase(),
        k:(x.t+' '+(x.f||'')+' '+(x.tag||'')+' '+(d.yi||'')+' '+(d.yao||'')+' '+(d.wu||'')+' '+(d.an||'')+' '+(d.key||'')+' 条文 精讲').toLowerCase()
      });
    });
    /* 王付基础方体系入索引 */
    if(window.WANGFU){
      idx.push({t:'基础方体系', s:'王付 · 学用经方的思路与方法', u:'#/disease?go=base',
        k:'基础方 王付 经方 思路 方法 气郁 瘀血 寒痰 热痰 湿热 寒湿'.toLowerCase()});
      window.WANGFU.base.forEach(([nm,tag])=>idx.push({
        t:tag+'基础方', s:'王付基础方 · '+nm, u:'#/formula/'+encodeURIComponent(nm),
        k:(nm+'基础方 王付').toLowerCase()
      }));
      (window.WANGFU.stack||[]).forEach((st,i)=>idx.push({
        t:'合方 · 基础方叠加', s:st.ans.join(' + '), u:'#/quiz?scope=base',
        k:(st.sit+st.ans.join('')+'合方 基础方 叠加').toLowerCase()
      }));
    }
    SEARCH.idx = idx;
  }
  function initSearch(){
    buildIndex();
    const mask = document.createElement('div');
    mask.className = 'search-mask'; mask.id = 'searchMask';
    mask.innerHTML = `<div class="search-box">
      <input id="searchInput" placeholder="搜方剂 / 药材 / 穴位 / 证型 / 歌诀…  ↑↓ 选择，Enter 打开，Esc 关闭" autocomplete="off">
      <div class="search-res" id="searchRes"></div>
    </div>`;
    document.body.appendChild(mask);
    mask.addEventListener('click', e=>{ if(e.target===mask) closeSearch(); });
    const inp = $('#searchInput');
    inp.addEventListener('input', ()=>runSearch(inp.value));
    inp.addEventListener('keydown', e=>{
      if(e.key==='ArrowDown'){ e.preventDefault(); moveSel(1); }
      else if(e.key==='ArrowUp'){ e.preventDefault(); moveSel(-1); }
      else if(e.key==='Enter'){
        e.preventDefault();
        const a = SEARCH.items[SEARCH.sel];
        if(a){ closeSearch(); location.hash = a.dataset.u; }
      }
    });
  }
  function runSearch(q){
    const box = $('#searchRes');
    q = (q||'').trim().toLowerCase();
    SEARCH.sel = 0;
    if(!q){
      box.innerHTML = `<div class="search-empty">输入关键词，例如「桂枝」「合谷」「太阳病」「肝阳上亢」；穴位可搜编号（LI4）或主治（失眠）；也可以打拼音首字母，如「gz」「hg」</div>`;
      SEARCH.items = []; return;
    }
    const isAbc = /^[a-z]+$/.test(q);
    const hit = x => isAbc
      ? ((x.ini||'').startsWith(q) || (x.py||'').split('|').some(w=>w.startsWith(q)))
      : x.k.includes(q);
    const hits = SEARCH.idx.filter(hit).slice(0, 60);
    // 排序：正名完全命中 > 首字母命中 > 别名完全命中（搜「芍药」先出白芍）> 其余
    const rank = x => {
      if(x.t.toLowerCase() === q) return 0;
      if(isAbc && (x.ini||'') === q) return 1;
      if((x.al||'').split('|').includes(q)) return 2;
      if(q.length >= 2 && x.t.toLowerCase().includes(q)) return 3;
      return 4;
    };
    hits.sort((a,b)=>rank(a)-rank(b));
    hits.length = Math.min(hits.length, 40);
    if(!hits.length){ box.innerHTML = `<div class="search-empty">没有找到「${esc(q)}」</div>`; SEARCH.items=[]; return; }
    box.innerHTML = hits.map((x,i)=>
      `<a href="javascript:void(0)" data-u="${esc(x.u)}" class="${i===0?'on':''}">
        <span class="t">${esc(x.t)}</span><span class="s">${esc(x.s)}</span></a>`).join('');
    SEARCH.items = [...box.querySelectorAll('a')];
    SEARCH.items.forEach(a=>a.onclick = ()=>{ const u=a.dataset.u; closeSearch(); location.hash = u; });
  }
  function moveSel(d){
    if(!SEARCH.items.length) return;
    SEARCH.items[SEARCH.sel].classList.remove('on');
    SEARCH.sel = (SEARCH.sel + d + SEARCH.items.length) % SEARCH.items.length;
    const a = SEARCH.items[SEARCH.sel];
    a.classList.add('on');
    a.scrollIntoView({block:'nearest'});
  }
  function openSearch(){
    const m = $('#searchMask'); if(!m) return;
    SEARCH.open = true; m.classList.add('on');
    const inp = $('#searchInput');
    inp.value=''; runSearch('');
    setTimeout(()=>inp.focus(), 30);
  }
  function closeSearch(){
    const m = $('#searchMask'); if(!m) return;
    SEARCH.open = false; m.classList.remove('on');
  }

  /* ============ 主题 ============ */
  function redrawKeepScroll(){
    const y = window.scrollY;
    route();
    window.scrollTo({top:y, behavior:'instant'});
  }
  const THEMES = [
    {k:'ancient', n:'古海', d:'宣纸 · 朱印 · 默认', c:'#f2e7cd'},
    {k:'light', n:'浅海', d:'青绿 · 浅色', c:'#eef3f2'},
    {k:'dark',  n:'夜海', d:'荧光 · 深色', c:'#07181e'}
  ];
  function updateThemeUI(){
    const k = document.documentElement.getAttribute('data-theme')||'ancient';
    const sub = $('#brandSub');
    if(sub) sub.textContent = k==='ancient' ? 'JELLY TCM · 古海本' : (k==='dark' ? 'JELLY TCM · 夜海' : 'JELLY TCM · 浅海');
    const tb = $('#themeBtn');
    if(tb) tb.title = '当前主题：' + ((THEMES.find(t=>t.k===k)||{}).n||'古海') + '（点击切换）';
    const mt = document.querySelector('meta[name="theme-color"]');
    if(mt) mt.setAttribute('content', k==='dark' ? '#04141a' : (k==='ancient' ? '#f2e7cd' : '#eef3f2'));
  }
  function setTheme(k){
    document.documentElement.setAttribute('data-theme', k);
    try{ localStorage.setItem('jellytcm-theme', k); }catch(e){}
    updateThemeUI();
    redrawKeepScroll();
  }
  function themePop(){
    let p = $('#themePop');
    if(!p){
      p = document.createElement('div');
      p.id='themePop'; p.className='theme-pop';
      p.innerHTML = THEMES.map(t=>`<button data-t="${t.k}"><i style="background:${t.c}"></i><span>${t.n}<em style="display:block;font-size:10px;color:var(--muted);font-style:normal">${t.d}</em></span></button>`).join('');
      document.body.appendChild(p);
      p.addEventListener('click', e=>{
        const b = e.target.closest('[data-t]');
        if(!b) return;
        setTheme(b.dataset.t);
        p.classList.remove('on');
      });
      document.addEventListener('click', e=>{
        if(!e.target.closest('#themePop') && !e.target.closest('#themeBtn')) p.classList.remove('on');
      });
    }
    return p;
  }

  function initTools(){
    const tb = $('#themeBtn');
    if(tb) tb.onclick = e=>{
      e.stopPropagation();
      const p = themePop();
      const r = tb.getBoundingClientRect();
      p.style.top = (r.bottom+8)+'px';
      p.style.left = Math.max(8, Math.min(window.innerWidth-208, r.right-196))+'px';
      const k = document.documentElement.getAttribute('data-theme')||'ancient';
      $$('#themePop [data-t]').forEach(b=>b.classList.toggle('on', b.dataset.t===k));
      p.classList.toggle('on');
    };
    const sb = $('#searchBtn');
    if(sb) sb.onclick = openSearch;
  }

  /* ============ 启动 ============ */
  document.addEventListener('click', e=>{
    const el = e.target.closest('[data-go]');
    if(!el || e.target.closest('a,button')) return;
    location.hash = el.dataset.go;
  });
  /* 触屏/鼠标：点击分组按钮展开下拉；点组外收起 */
  document.addEventListener('click', e=>{
    const btn = e.target.closest('.nav-dd > .nav-btn');
    document.querySelectorAll('.nav-dd.open').forEach(dd=>{
      if(!btn || dd !== btn.closest('.nav-dd')) dd.classList.remove('open');
    });
    if(btn){
      const dd = btn.closest('.nav-dd');
      dd.classList.toggle('open', !dd.classList.contains('open'));
    }
  });
  window.addEventListener('hashchange', route);
  /* 滚动时收起批注（fixed 定位会跟丢），也顺手清掉旧版遗留的 CRT 开关 */
  window.addEventListener('scroll', ()=>tipHide(), {passive:true});
  try{ localStorage.removeItem('jellytcm-crt'); localStorage.removeItem('jellytcm-crt-tip'); }catch(e){}
  if('scrollRestoration' in history) history.scrollRestoration = 'manual';

  /* 键盘：Ctrl/Cmd+K 搜索、Esc 关闭、答题 ABCD/1-4、Enter 下一题 */
  document.addEventListener('keydown', e=>{
    const tag = (e.target && e.target.tagName) || '';
    const inField = /^(INPUT|TEXTAREA|SELECT)$/.test(tag);
    if((e.ctrlKey||e.metaKey) && String(e.key).toLowerCase()==='k'){
      e.preventDefault(); SEARCH.open ? closeSearch() : openSearch(); return;
    }
    if(e.key==='Escape'){ if(SEARCH.open) closeSearch(); return; }
    if(inField || SEARCH.open) return;
    const page = (location.hash.replace(/^#\/?/,'').split('?')[0]) || 'home';
    if(page!=='quiz' || !Q || Q.done) return;
    const q = Q.list[Q.i];
    if(!q) return;
    const answered = Q.answers[Q.i] !== undefined;
    if(!answered){
      const k = String(e.key).toUpperCase();
      let idx = -1;
      if(/^[ABCD]$/.test(k)) idx = k.charCodeAt(0)-65;
      else if(/^[1-4]$/.test(e.key)) idx = +e.key-1;
      if(idx >= 0 && idx < q.options.length){
        e.preventDefault();
        const btn = $$('#opts .opt')[idx];
        if(btn) btn.click();
      }
    }else if(e.key==='Enter' || e.key===' '){
      e.preventDefault();
      const nx = $('#nextQ'); if(nx) nx.click();
    }
  });

  window.APP = {esc, $, $$, FM, HB, HB_BY, FM_BY, SONGS, TY, Store, C, fCard, route, SEARCH,
    tipShow, tipHide, acuTipHTML, exportCard, herbPart, herbNat, herbToxic, HB_ALIAS, PHOTOS: (window.PHOTOS||{})};

  document.addEventListener('DOMContentLoaded', ()=>{
    initSearch();
    initTools();
    updateThemeUI();
    route();
  });
})();
