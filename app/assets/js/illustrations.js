/* ================= 图形引擎 =================
   1) HERB_ART.svg(kind,color,accent)  药材写意插图
   2) BODY.meridian()                  十二经脉人体图
   3) BODY.acupoints(list)             穴位图
   4) BODY.liujing(key)                六经病位示意图
   5) BODY.qixue()                     卫气营血层次图
*/
(function(){
  /* ---------- 主题调色板 ---------- */
  function isDark(){
    return (document.documentElement.getAttribute('data-theme')||'light') === 'dark';
  }
  const MAP_DARK = {
    '#fbf8f0':'#081820', '#f7f2e4':'#dceef0', '#f2ebd9':'#c4d9dc',
    '#d6cbb2':'#7c9ba1', '#e8dfc9':'#4f747b', '#9a8f79':'#8fb0b4',
    '#4a4234':'#d5e9ea', '#5c5344':'#cfe4e6', '#fffdf7':'#081820',
    '#f6f1e4':'#0f242b', '#e6dcc6':'#1d3d46', '#b03a2a':'#ff6f8b',
    '#f4f6ec':'#0c1f26', '#f8ece8':'#15232b', '#e3dccd':'#1d3d46',
    '#8a8070':'#8fb0b4', '#6b6455':'#a9c6ca', '#3a6ea8':'#63a4e0', '#a1668c':'#cc93b6'
  };
  /* 把浅色底稿里的“纸/线/墨”色按当前主题替换 */
  function th(str){
    if(!isDark()) return str;
    return str.replace(/#(?:fbf8f0|f7f2e4|f2ebd9|d6cbb2|e8dfc9|9a8f79|4a4234|5c5344|fffdf7|f6f1e4|e6dcc6|b03a2a|f4f6ec|f8ece8|e3dccd|8a8070|6b6455|3a6ea8|a1668c)/gi,
      m=>MAP_DARK[m.toLowerCase()]||m);
  }

  /* ---------- 药材插图 ---------- */
  function herbArt(kind, c, a){
    c = c || '#b08a5a'; a = a || '#8a6a3a';
    const g = `g${Math.random().toString(36).slice(2,7)}`;
    const defs = `
      <defs>
        <linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${c}"/><stop offset="1" stop-color="${a}"/>
        </linearGradient>
        <filter id="${g}f"><feGaussianBlur stdDeviation=".6"/></filter>
      </defs>`;
    let body = '';
    switch(kind){
      case 'root':
        body = `<g>
          <path d="M60 22c7 0 10 6 10 14 0 10-2 16-1 24 4 12 10 24 14 38 3 11-2 15-8 8-5-6-8-14-12-22-3 10-5 20-6 30-1 9-5 9-6 2-1-11 1-22 2-32-5 8-10 15-15 22-4 5-8 1-5-5 6-11 13-23 15-34 2-11 0-19 1-27 1-9 3-16 8-18z" fill="url(#${g})"/>
          <g stroke="${a}" stroke-width="1" fill="none" opacity=".45">
            <path d="M60 26c4 10 4 24 3 38M65 66c4 9 8 19 11 29M57 60c-4 8-8 16-11 23"/>
          </g>
          <g stroke="${a}" stroke-width="1.3" fill="none" opacity=".6" stroke-linecap="round">
            <path d="M56 96c-3 6-6 10-10 13M64 100c3 5 6 9 10 11M48 78c-5 4-9 8-12 13"/>
          </g>
          <ellipse cx="60" cy="21" rx="10" ry="4" fill="${a}" opacity=".5"/>
          <path d="M56 18c-2-5 1-9 5-10" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>
        </g>`; break;
      case 'rhizome':
        body = `<g>
          <path d="M24 62c2-12 12-20 26-18 10 2 16 8 22 6 8-2 16 2 20 10 5 9-1 18-12 20-9 2-16-2-24-2-9 0-17 4-25 0-6-3-8-9-7-16z" fill="url(#${g})"/>
          <g stroke="${a}" stroke-width="1" opacity=".55" fill="none">
            <path d="M40 52c-1 8 0 16 2 24M58 50c-1 9 0 17 1 26M76 54c0 8 1 14 2 20"/>
          </g>
          <g fill="${a}" opacity=".5"><circle cx="42" cy="60" r="2.2"/><circle cx="61" cy="58" r="2.2"/><circle cx="78" cy="62" r="2"/></g>
          <path d="M96 58c8-6 14 0 12 8-2 7-9 9-13 4" fill="${c}" opacity=".9"/>
        </g>`; break;
      case 'twig':
        body = `<g>
          <path d="M32 98C44 78 52 54 60 30" fill="none" stroke="${a}" stroke-width="5.2" stroke-linecap="round"/>
          <path d="M52 62c10-6 20-13 28-21" fill="none" stroke="${a}" stroke-width="3.4" stroke-linecap="round"/>
          <path d="M44 80c8 4 16 6 24 6" fill="none" stroke="${a}" stroke-width="2.6" stroke-linecap="round"/>
          <g fill="${c}" opacity=".92">
            ${[[86,38,-30],[68,20,-54],[62,50,-6],[78,64,26],[46,56,38],[94,58,16]].map(([x,y,r])=>
              `<path d="M0 0C6-5 14-5 20-1c5 4 4 6-1 7-8 1-14-1-19-6z" transform="translate(${x} ${y}) rotate(${r})"/>`).join('')}
          </g>
          <g stroke="${a}" stroke-width=".7" opacity=".4" fill="none">
            ${[[86,38,-30],[68,20,-54],[62,50,-6],[78,64,26],[46,56,38],[94,58,16]].map(([x,y,r])=>
              `<path d="M2 0L18 1" transform="translate(${x} ${y}) rotate(${r})"/>`).join('')}
          </g>
          <ellipse cx="33" cy="97" rx="5" ry="3.4" fill="${a}" opacity=".55" transform="rotate(-30 33 97)"/>
        </g>`; break;
      case 'bark':
        body = `<g>
          <path d="M28 40c14-10 40-12 56-4 10 5 12 16 6 26-8 13-30 20-46 14-12-5-20-22-16-36z" fill="url(#${g})"/>
          <path d="M42 34c-4 22 2 40 12 50M60 30c-2 24 2 42 10 52M76 34c0 18 2 32 8 40" stroke="${a}" stroke-width="1.4" fill="none" opacity=".5"/>
          <path d="M28 40c14-10 40-12 56-4 4 2 7 5 9 9-16-4-42-4-58 4-4 1-6 0-7-3z" fill="#fff" opacity=".28"/>
          <path d="M86 62c8 6 12 16 6 22-5 5-13 3-16-3" fill="${a}" opacity=".5"/>
        </g>`; break;
      case 'leaf':
        body = `<g>
          <path d="M58 96C44 74 40 48 54 26c4-6 10-6 13 0 16 24 14 50 2 70-3 5-8 5-11 0z" fill="url(#${g})"/>
          <path d="M62 94C58 70 58 44 62 24" stroke="${a}" stroke-width="1.6" fill="none"/>
          <g stroke="${a}" stroke-width="1" fill="none" opacity=".55">
            <path d="M62 40c6 2 12 6 16 12M62 54c7 2 13 6 17 12M62 68c6 2 11 6 14 10M62 44c-6 2-10 6-13 11M62 58c-7 2-11 6-14 11M62 72c-6 2-10 5-12 9"/>
          </g>
        </g>`; break;
      case 'flower':
        body = `<g>
          ${[...Array(9)].map((_,i)=>{
            const ang = i*40, rad = ang*Math.PI/180;
            const x = 60+Math.cos(rad)*24, y = 58+Math.sin(rad)*24;
            return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="15" ry="6.5" transform="rotate(${ang} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${c}" opacity="${i%2?0.86:0.98}"/>`;
          }).join('')}
          <circle cx="60" cy="58" r="11" fill="${a}"/>
          <circle cx="60" cy="58" r="6" fill="${c}" opacity=".55"/>
          <g stroke="${a}" stroke-width="1" opacity=".5">${[...Array(8)].map((_,i)=>{const rad=i*45*Math.PI/180;return `<line x1="60" y1="58" x2="${(60+Math.cos(rad)*9).toFixed(1)}" y2="${(58+Math.sin(rad)*9).toFixed(1)}"/>`}).join('')}</g>
        </g>`; break;
      case 'fruit':
        body = `<g>
          <path d="M60 32c14 0 26 12 26 26 0 18-12 34-26 34S34 76 34 58c0-14 12-26 26-26z" fill="url(#${g})"/>
          <path d="M60 34c-3-8 2-14 9-16" stroke="${a}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
          <path d="M68 20c8-6 16-4 19 2-6 5-14 5-19-2z" fill="${a}" opacity=".8"/>
          <ellipse cx="50" cy="48" rx="8" ry="11" transform="rotate(-20 50 48)" fill="#fff" opacity=".22"/>
        </g>`; break;
      case 'seed':
        body = `<g>
          ${[[46,50,-18],[68,42,12],[56,68,8],[76,64,-14],[40,72,20],[64,84,0]].map(([x,y,r],i)=>
            `<ellipse cx="${x}" cy="${y}" rx="13" ry="9" transform="rotate(${r} ${x} ${y})" fill="url(#${g})" opacity="${0.85+ (i%3)*0.05}"/>
             <path d="M${x-8} ${y+2}c4-3 9-3 14 0" stroke="${a}" stroke-width=".9" fill="none" opacity=".5"/>`).join('')}
        </g>`; break;
      case 'whole':
        body = `<g>
          <path d="M60 100V34" stroke="${a}" stroke-width="2.6" fill="none"/>
          <g fill="${c}" opacity=".9">
            <ellipse cx="42" cy="44" rx="16" ry="6" transform="rotate(-30 42 44)"/>
            <ellipse cx="78" cy="50" rx="16" ry="6" transform="rotate(26 78 50)"/>
            <ellipse cx="44" cy="66" rx="14" ry="5.5" transform="rotate(-16 44 66)"/>
            <ellipse cx="76" cy="74" rx="13" ry="5" transform="rotate(20 76 74)"/>
          </g>
          <path d="M60 34c-4-8 0-14 6-16" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round"/>
        </g>`; break;
      case 'bulb':
        body = `<g>
          <path d="M60 30c12 0 22 12 22 28 0 18-9 30-22 30S38 76 38 58c0-16 10-28 22-28z" fill="#f2ecd8"/>
          <g stroke="${a}" stroke-width="1.1" fill="none" opacity=".55">
            <path d="M60 32c-6 16-6 34 0 54M60 32c6 16 6 34 0 54M60 34c-11 14-13 30-8 46M60 34c11 14 13 30 8 46"/>
          </g>
          <path d="M60 30c-2-10 2-16 8-18" stroke="${c}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
          <path d="M58 88c-2 6 0 10 4 12" stroke="${a}" stroke-width="1.6" fill="none" opacity=".6"/>
        </g>`; break;
      case 'fungus':
        body = `<g>
          <path d="M32 66c0-16 14-26 30-24 8 1 14 5 20 9 8 5 10 16 3 22-9 8-22 8-34 6-11-2-19-4-19-13z" fill="url(#${g})"/>
          <ellipse cx="58" cy="52" rx="12" ry="7" fill="#fff" opacity=".18"/>
          <path d="M40 74c8 4 18 4 26 2" stroke="${a}" stroke-width="1" fill="none" opacity=".5"/>
          <circle cx="78" cy="74" r="6" fill="${a}" opacity=".45"/><circle cx="34" cy="78" r="4" fill="${a}" opacity=".35"/>
        </g>`; break;
      case 'mineral':
        body = `<g>
          <path d="M40 34l24-8 22 12 6 26-18 26-28 4-16-22z" fill="url(#${g})"/>
          <g stroke="#fff" stroke-width=".9" opacity=".45" fill="none">
            <path d="M40 34l18 20-4 30M64 26l-6 28 28 10M58 54l16 22M40 34l14-2"/>
          </g>
          <path d="M40 34l24-8 22 12-28 4z" fill="#fff" opacity=".3"/>
        </g>`; break;
      case 'animal':
        body = `<g>
          <path d="M34 44c10-8 34-10 48-4 12 5 14 18 6 28-6 8-20 12-32 10-12-2-22-10-24-18-1-6 0-12 2-16z" fill="url(#${g})"/>
          <path d="M40 50c12-4 28-4 40 0" stroke="#fff" stroke-width="2" fill="none" opacity=".35"/>
          <path d="M44 68c10 4 22 4 32 0" stroke="${a}" stroke-width="1" fill="none" opacity=".5"/>
          <ellipse cx="52" cy="56" rx="7" ry="4" fill="#fff" opacity=".22"/>
        </g>`; break;
      case 'prepared':
        body = `<g>
          <path d="M34 50c0-10 10-16 20-14 6-8 18-8 24 0 10-2 18 6 16 16 8 6 6 20-4 24-10 4-22 2-30 6-10 5-24 1-26-8-1-5-1-10 0-14z" fill="url(#${g})"/>
          <path d="M40 52c10 4 22 4 32 0M42 66c10 4 22 4 30-1" stroke="#fff" stroke-width="1.2" fill="none" opacity=".28"/>
          <ellipse cx="56" cy="44" rx="10" ry="4" fill="#fff" opacity=".2"/>
        </g>`; break;
      case 'rind':
        body = `<g>
          <path d="M28 62c4-16 20-26 38-24 16 2 26 12 28 22 2 12-10 20-24 22-18 2-34-4-40-14-1-2-2-4-2-6z" fill="url(#${g})"/>
          <path d="M32 66c14 6 34 8 50 2" stroke="#fff" stroke-width="1.4" fill="none" opacity=".3"/>
          <g fill="${a}" opacity=".5"><circle cx="46" cy="54" r="1.6"/><circle cx="60" cy="50" r="1.6"/><circle cx="72" cy="56" r="1.6"/><circle cx="54" cy="64" r="1.6"/></g>
          <path d="M92 54c8-2 14 2 14 8s-6 10-13 8" fill="${c}" opacity=".75"/>
        </g>`; break;
      case 'stem':
        body = `<g>
          <rect x="42" y="24" width="36" height="72" rx="16" fill="url(#${g})"/>
          <g stroke="#fff" stroke-width="1" opacity=".4" fill="none">
            <path d="M50 32v56M60 28v64M70 32v56"/>
          </g>
          <ellipse cx="60" cy="24" rx="18" ry="5" fill="${c}"/>
          <ellipse cx="60" cy="96" rx="18" ry="5" fill="${a}" opacity=".7"/>
        </g>`; break;
      default:
        body = `<circle cx="60" cy="60" r="26" fill="url(#${g})"/>`;
    }
    // 依药名生成细微差异，避免同类药材长得一模一样
    let hsh = 0;
    for(const ch of (kind + c + a)) hsh = (hsh*31 + ch.charCodeAt(0)) % 9973;
    const rot = (hsh % 13) - 6;
    const sc = 0.92 + ((hsh >> 3) % 9) / 100;
    const flip = (hsh % 4 === 0) ? -1 : 1;
    return th(`<svg viewBox="0 0 120 120" class="herb-svg" aria-hidden="true">${defs}
      <rect width="120" height="120" fill="none"/>
      <circle cx="60" cy="60" r="46" fill="#f6f1e4"/>
      <circle cx="60" cy="60" r="46" fill="none" stroke="#e6dcc6" stroke-width="1"/>
      <g transform="translate(60 60) scale(${(flip*sc).toFixed(3)} ${sc.toFixed(3)}) rotate(${rot}) translate(-60 -60)">${body}</g></svg>`);
  }

  /* ---------- 人体轮廓 ---------- */
  // 正面轮廓 viewBox 0 0 240 470
  const FRONT = `
    <g fill="none" stroke-linecap="round">
      <path d="M100 72c-8 24-14 60-20 96-4 26-8 44-14 58" stroke="#f7f2e4" stroke-width="15"/>
      <path d="M140 72c8 24 14 60 20 96 4 26 8 44 14 58" stroke="#f7f2e4" stroke-width="15"/>
      <path d="M109 204c-2 62-4 142-7 224" stroke="#f7f2e4" stroke-width="18"/>
      <path d="M131 204c2 62 4 142 7 224" stroke="#f7f2e4" stroke-width="18"/>
    </g>
    <path d="M111 50h18v16h-18z" fill="#f7f2e4" stroke="#d6cbb2" stroke-width="1"/>
    <path d="M97 66c9-6 37-6 46 0 3 24 3 60 1 84-1 18-2 34-2 54H98c0-20-1-36-2-54-2-24-2-60 1-84z"
      fill="#f7f2e4" stroke="#d6cbb2" stroke-width="1.2"/>
    <circle cx="120" cy="34" r="21" fill="#f7f2e4" stroke="#d6cbb2" stroke-width="1.3"/>
    <g fill="none" stroke="#d6cbb2" stroke-width="1.05" opacity=".9">
      <path d="M100 72c-8 24-14 60-20 96-4 26-8 44-14 58"/>
      <path d="M140 72c8 24 14 60 20 96 4 26 8 44 14 58"/>
      <path d="M109 204c-2 62-4 142-7 224"/>
      <path d="M131 204c2 62 4 142 7 224"/>
      <path d="M98 104c-1 34-1 68 0 100M142 104c1 34 1 68 0 100"/>
    </g>
    <ellipse cx="102" cy="430" rx="8" ry="4" fill="#f2ebd9" stroke="#d6cbb2" stroke-width="1"/>
    <ellipse cx="138" cy="430" rx="8" ry="4" fill="#f2ebd9" stroke="#d6cbb2" stroke-width="1"/>
    <circle cx="66" cy="228" r="5.5" fill="#f2ebd9" stroke="#d6cbb2" stroke-width="1"/>
    <circle cx="174" cy="228" r="5.5" fill="#f2ebd9" stroke="#d6cbb2" stroke-width="1"/>
    <path d="M120 66v140" stroke="#e8dfc9" stroke-width="1" stroke-dasharray="2 4"/>
  `;

  /* ---------- 十二经脉 ---------- */
  const MER = [
    {k:'LU', name:'手太阴肺经', c:'#b8523f', d:'M112 96c-6 6-8 18-6 30 2 14 0 30-4 46-3 12-8 26-14 38-4 8-10 14-16 18', pts:[[112,96],[100,140],[88,196],[76,240]]},
    {k:'LI', name:'手阳明大肠经', c:'#c07b33', d:'M62 250c-2-14 2-28 8-40 6-12 16-22 22-34 4-8 6-16 4-24', pts:[[62,250],[76,206],[92,164],[104,112]]},
    {k:'ST', name:'足阳明胃经', c:'#b8973c', d:'M104 52c-2 12 0 26 2 38 2 16 2 34 4 50 2 18 6 36 6 52 2 20 0 38-4 52', pts:[[104,52],[106,110],[110,180],[112,250],[104,320],[96,398]]},
    {k:'SP', name:'足太阴脾经', c:'#8a9a4e', d:'M96 424c2-22 4-44 6-62 2-22 0-44 2-64 2-16 4-32 2-46', pts:[[96,424],[104,360],[110,290],[106,220],[102,168]]},
    {k:'HT', name:'手少阴心经', c:'#a8434f', d:'M108 118c-4 10-8 22-12 34-4 14-8 28-14 40-4 8-10 14-14 18', pts:[[108,118],[92,168],[76,216],[62,244]]},
    {k:'SI', name:'手太阳小肠经', c:'#a5642e', d:'M58 268c-4-16 0-32 8-44 8-12 16-20 24-30', pts:[[58,268],[72,224],[88,180],[110,142]]},
    {k:'KI', name:'足少阴肾经', c:'#4a6b7c', d:'M112 430c4-24 8-46 10-66 2-22 0-44 2-64 2-14 2-28 0-40', pts:[[112,430],[118,362],[124,290],[124,222],[118,168]]},
    {k:'PC', name:'手厥阴心包经', c:'#8f4a6b', d:'M116 112c-2 12-6 24-10 36-6 16-10 32-16 46-4 8-8 14-12 18', pts:[[116,112],[98,164],[82,212],[66,250]]},
    {k:'TE', name:'手少阳三焦经', c:'#7c5a2e', d:'M60 262c-4-14 2-28 10-40 8-14 20-24 28-38 6-10 8-22 6-32', pts:[[60,262],[78,218],[98,176],[116,130]]},
    {k:'GB', name:'足少阳胆经', c:'#3f7d63', d:'M140 46c6 8 10 18 10 28 0 14-6 26-6 40 0 18 6 34 4 52-2 20-8 38-12 56-4 20-4 40-6 58', pts:[[140,46],[150,80],[146,140],[142,212],[136,296],[130,380]]},
    {k:'LR', name:'足厥阴肝经', c:'#5c6b3f', d:'M100 424c4-22 8-42 10-60 2-20 0-40 2-58 2-16 6-30 8-44', pts:[[100,424],[110,358],[118,288],[120,214],[112,168]]},
    {k:'BL', name:'足太阳膀胱经', c:'#3a6ea8', dash:1, d:'M112 44Q118 14 132 24Q148 38 150 62Q158 104 156 152Q154 202 152 252Q150 302 148 352Q146 402 143 434', pts:[[132,24],[150,62],[156,152],[152,252],[148,352],[143,434]]},
    {k:'REN', name:'任脉（前正中）', c:'#a1668c', d:'M120 60v360', pts:[[120,120],[120,190],[120,250],[120,320]]}
  ];

  function meridian(){
    const paths = MER.map(m=>`
      <g class="mer-line" data-k="${m.k}">
        <path class="mer-hit" data-k="${m.k}" d="${m.d}" fill="none" stroke="transparent" stroke-width="13" stroke-linecap="round"/>
        <path class="mer-base" d="${m.d}" fill="none" stroke="${m.c}" stroke-width="2.1" stroke-linecap="round" opacity=".82"${m.dash?' stroke-dasharray="5 4"':''}/>
        <path class="mer-trace" d="${m.d}" fill="none" stroke="${m.c}" stroke-width="4.4" stroke-linecap="round" opacity=".55" stroke-dasharray="0 9999"/>
        ${m.pts.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="2.6" fill="#fff" stroke="${m.c}" stroke-width="1.4"/>`).join('')}
        <circle class="flow-glow" data-k="${m.k}" r="0" fill="${m.c}" opacity=".3"/>
        <circle class="flow-dot" data-k="${m.k}" r="0" fill="#fff" stroke="${m.c}" stroke-width="1.8"/>
      </g>`).join('');
    return th(`<svg viewBox="0 0 240 470" class="body-svg" id="merSvg">
      <rect width="240" height="470" fill="#fbf8f0"/>
      ${FRONT}${paths}
      <g fill="#9a8f79" font-size="8" font-family="serif">
        <text x="8" y="30">头面</text><text x="8" y="120">胸</text><text x="8" y="210">腹</text><text x="8" y="330">腿</text><text x="8" y="440">足</text>
      </g>
    </svg>`);
  }

  /* ---------- 穴位图 ---------- */
  function acupoints(list, numbered){
    const dots = list.map((p,i)=>{
      if(numbered){
        return `<g class="acu-dot acu-item" data-i="${i}" data-n="${p.n}">
          <circle cx="${p.x}" cy="${p.y}" r="15" fill="transparent"/>
          <circle cx="${p.x}" cy="${p.y}" r="8.4" fill="#b03a2a"/>
          <text x="${p.x}" y="${p.y+3.2}" text-anchor="middle" font-size="9" fill="#fffdf7" font-family="sans-serif">${i+1}</text>
        </g>`;
      }
      return `<g class="acu-dot acu-item" data-i="${i}" data-n="${p.n}">
        <circle cx="${p.x}" cy="${p.y}" r="11" fill="transparent"/>
        <circle cx="${p.x}" cy="${p.y}" r="4.2" fill="#b03a2a" opacity=".85"/>
        <circle cx="${p.x}" cy="${p.y}" r="8" fill="none" stroke="#b03a2a" stroke-width=".8" opacity=".35"/>
        <text x="${p.x + (p.dx||7)}" y="${p.y + (p.dy||3)}" font-size="7.5" fill="#5c5344" font-family="serif">${p.n}</text>
      </g>`;
    }).join('');
    return th(`<svg viewBox="0 0 240 470" class="body-svg acu-svg">
      <rect width="240" height="470" fill="#fbf8f0"/>${FRONT}${dots}</svg>`);
  }

  const ACU_POS = {
    '百会':{x:120,y:14,dx:8,dy:-2},'太阳':{x:100,y:30,dx:-24},'风池':{x:132,y:44,dx:10},'大椎':{x:120,y:52,dx:-26},
    '合谷':{x:60,y:252,dx:-24},'曲池':{x:74,y:196,dx:-26},'内关':{x:74,y:224,dx:-26},'神门':{x:62,y:238,dx:-24},
    '中脘':{x:120,y:150,dx:8},'神阙':{x:120,y:186,dx:8},'气海':{x:120,y:206,dx:8},'关元':{x:120,y:220,dx:8},
    '足三里':{x:104,y:330,dx:10},'阴陵泉':{x:112,y:352,dx:10},'三阴交':{x:108,y:392,dx:12},'血海':{x:104,y:300,dx:-30},
    '委中':{x:132,y:346,dx:8},'太冲':{x:100,y:414,dx:-22},'涌泉':{x:110,y:440,dx:8},'肾俞':{x:120,y:230,dx:8},
    '膻中':{x:120,y:118,dx:8},'肺俞':{x:120,y:132,dx:-26},'脾俞':{x:120,y:168,dx:-26},'肝俞':{x:120,y:158,dx:8}
  };

  /* ---------- 六经病位 ---------- */
  const LJ_ZONE = {
    taiyang:{label:'太阳 · 表（皮毛、项背、膀胱经）', y:['#e8f0e6','#d6e6d2'], zone:`
      <path d="M118 8h4v54h-4z" fill="#7fa06a" opacity=".28"/>
      <ellipse cx="120" cy="34" rx="34" ry="30" fill="#7fa06a" opacity=".16"/>
      <path d="M104 56c-4 10-6 22-6 34 0 10 1 20 2 30h40c1-10 2-20 2-30 0-12-2-24-6-34z" fill="#7fa06a" opacity=".22"/>
      <path d="M60 250c-2-14 2-28 8-40M180 250c2-14-2-28-8-40" stroke="#7fa06a" stroke-width="6" fill="none" opacity=".3"/>`},
    yangming:{label:'阳明 · 里（胃肠、气分）', y:['#f6ead6','#efd9b8'], zone:`
      <path d="M104 120c-2 30-2 60 0 90 2 20 4 34 4 44h36c0-10 2-24 4-44 2-30 2-60 0-90z" fill="#c99a4a" opacity=".26"/>
      <circle cx="120" cy="34" r="20" fill="#c99a4a" opacity=".12"/>`},
    shaoyang:{label:'少阳 · 半表半里（胆、三焦、胁肋）', y:['#eef0e2','#e2e6cd'], zone:`
      <path d="M88 100c-6 20-8 44-6 66 2 24 8 40 14 52M152 100c6 20 8 44 6 66-2 24-8 40-14 52" stroke="#9aa24e" stroke-width="9" fill="none" opacity=".35"/>
      <path d="M96 116h48v40H96z" fill="#9aa24e" opacity=".18"/>`},
    taiyin:{label:'太阴 · 里（脾、腹部）', y:['#f2eee4','#e8e0cc'], zone:`
      <path d="M100 150c-2 26-2 50 2 70h36c4-20 4-44 2-70z" fill="#b8a05e" opacity=".26"/>
      <path d="M96 160c-6 10-8 22-8 34M144 160c6 10 8 22 8 34" stroke="#b8a05e" stroke-width="5" fill="none" opacity=".3"/>`},
    shaoyin:{label:'少阴 · 里（心、肾、阴阳之根）', y:['#e6ecf2','#d3dfe8'], zone:`
      <circle cx="120" cy="128" r="15" fill="#5f7f95" opacity=".3"/>
      <ellipse cx="120" cy="216" rx="16" ry="14" fill="#5f7f95" opacity=".3"/>
      <path d="M110 236c-4 30-4 60-2 84M130 236c4 30 4 60 2 84" stroke="#5f7f95" stroke-width="6" fill="none" opacity=".25"/>`},
    jueyin:{label:'厥阴 · 里（肝、心包、阴阳交接）', y:['#f0e8ea','#e6d5da'], zone:`
      <path d="M96 140c-4 22-4 44 0 62 6 0 14-4 24-4s18 4 24 4c4-18 4-40 0-62z" fill="#8a5a6b" opacity=".2"/>
      <path d="M104 96c-6 6-8 18-6 30 2 14 0 30-4 46-3 12-8 26-14 38-4 8-10 14-16 18" stroke="#8a5a6b" stroke-width="3" fill="none" opacity=".35"/>
      <path d="M136 96c6 6 8 18 6 30-2 14 0 30 4 46 3 12 8 26 14 38 4 8 10 14 16 18" stroke="#8a5a6b" stroke-width="3" fill="none" opacity=".35"/>`}
  };

  function liujing(key){
    const z = LJ_ZONE[key]; if(!z) return '';
    return th(`<svg viewBox="0 0 240 470" class="body-svg">
      <rect width="240" height="470" fill="#fbf8f0"/>${FRONT}${z.zone}
      <g><rect x="4" y="446" width="232" height="20" rx="4" fill="#fff" opacity=".9"/>
      <text x="12" y="460" font-size="11" fill="#4a4234" font-family="serif">${z.label}</text></g>
    </svg>`);
  }

  /* ---------- 卫气营血层次 ---------- */
  function qixue(active){
    const layers=[
      {n:'卫',d:'肺卫 · 表',c:'#8aa86a'},
      {n:'气',d:'肺胃 · 里热',c:'#c99a4a'},
      {n:'营',d:'心包 · 阴伤',c:'#b06a4a'},
      {n:'血',d:'肝肾 · 动血',c:'#9a3a3a'}
    ];
    return th(`<svg viewBox="0 0 560 150" class="qx-svg">
      <defs><linearGradient id="qxg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f4f6ec"/><stop offset="1" stop-color="#f8ece8"/></linearGradient></defs>
      <rect x="8" y="10" width="544" height="128" rx="12" fill="url(#qxg)" stroke="#e3dccd"/>
      ${layers.map((l,i)=>{
        const x = 30 + i*130;
        const on = (active===undefined)||active===i;
        return `<g opacity="${on?1:.28}">
          <rect x="${x}" y="26" width="112" height="70" rx="10" fill="${isDark()?'#0b1d24':'#fff'}" stroke="${l.c}" stroke-width="1.6"/>
          <text x="${x+56}" y="58" text-anchor="middle" font-size="26" font-family="serif" fill="${l.c}">${l.n}</text>
          <text x="${x+56}" y="80" text-anchor="middle" font-size="11" fill="#6b6455">${l.d}</text>
          ${i<3?`<path d="M${x+116} 61h10" stroke="${l.c}" stroke-width="1.6"/><path d="M${x+122} 57l5 4-5 4" fill="${l.c}"/>`:''}
        </g>`;
      }).join('')}
      <text x="30" y="122" font-size="10.5" fill="#8a8070" font-family="serif">病邪由浅入深 · 顺传</text>
      <text x="530" y="122" text-anchor="end" font-size="10.5" fill="#8a8070" font-family="serif">逆传心包 ←</text>
    </svg>`);
  }

  window.HERB_ART = {svg:herbArt};
  window.BODY = {meridian, acupoints, liujing, qixue, MER, ACU_POS};
})();
