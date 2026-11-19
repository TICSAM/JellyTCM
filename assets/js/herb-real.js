/* ================= 药材「实物形态」写生图 =================
   按性状类型绘制标本写生（slice/twig/bark/fruit/flower/seed/whole/leaf/
   mineral/animal/fungus/resin/prepared）。不是照片，用于配合性状文字记忆
   形状、断面与表面特征；真实照片请放入 assets/img/herbs/<药名>.jpg 并在
   HB_PHOTO 中登记（见 README）。
*/
(function(){
  let uid = 0;
  const dark = ()=> (document.documentElement.getAttribute('data-theme')||'light')==='dark';
  const anc  = ()=> document.documentElement.getAttribute('data-theme')==='ancient';

  function hash(s){ let h=0; for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))>>>0; return h; }
  function shade(hex, k){
    const m = /^#([0-9a-f]{6})$/i.exec(hex||'');
    if(!m) return hex;
    let n = parseInt(m[1],16);
    let r = (n>>16)&255, g=(n>>8)&255, b=n&255;
    r=Math.max(0,Math.min(255,Math.round(r*k))); g=Math.max(0,Math.min(255,Math.round(g*k))); b=Math.max(0,Math.min(255,Math.round(b*k)));
    return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
  }
  function paper(){
    if(dark()) return {bg:'#0e242b', line:'#2a4a52', txt:'#7c9ea3'};
    if(anc())  return {bg:'#f8efd8', line:'#d9c49a', txt:'#8b7550'};
    return {bg:'#f7fbfa', line:'#dbe9e6', txt:'#8aa5a6'};
  }

  /* 通用：投影 + 纸卡 */
  function frame(inner, w, h, note){
    const P = paper(); uid++;
    return `<svg viewBox="0 0 ${w} ${h}" class="herb-real-svg" role="img" aria-label="药材性状写生">
      <defs>
        <linearGradient id="hr${uid}a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ffffff" stop-opacity=".55"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="${P.bg}"/>
      <g opacity=".5" stroke="${P.line}" stroke-width=".7">
        ${Array.from({length:7},(_,i)=>`<line x1="0" y1="${18+i*26}" x2="${w}" y2="${18+i*26}"/>`).join('')}
      </g>
      ${inner}
      <g opacity=".55" font-family="ui-monospace,monospace" font-size="7.4" fill="${P.txt}">
        <line x1="12" y1="${h-12}" x2="52" y2="${h-12}" stroke="${P.txt}" stroke-width="1.2"/>
        <text x="57" y="${h-9.6}">1cm</text>
        <text x="${w-12}" y="${h-9.6}" text-anchor="end">${note||'性状写生'}</text>
      </g>
    </svg>`;
  }

  const cls = '<circle cx="0" cy="0" r="0" fill="none"/>';

  function shadow(w,h){
    return `<ellipse cx="${w/2}" cy="${h-26}" rx="${w*0.34}" ry="7" fill="#000" opacity="${dark()?.28:.07}"/>`;
  }

  /* ---------- 圆片（根/根茎/块茎切片） ---------- */
  function slice(c, a, w, h){
    const rnd = (i)=>((hash(c+i)%7)-3);
    let out = shadow(w,h);
    const items = [
      {x:w*0.36,y:h*0.44,r:34,rot:-12},
      {x:w*0.63,y:h*0.56,r:30,rot:18},
      {x:w*0.55,y:h*0.34,r:22,rot:6}
    ];
    items.forEach((it,i)=>{
      const rings = Array.from({length:5},(_,k)=>{
        const rr = it.r*(0.2+k*0.15);
        return `<ellipse cx="${it.x}" cy="${it.y}" rx="${rr}" ry="${rr*0.86}" fill="none" stroke="${shade(a,.86)}" stroke-width=".6" opacity=".35" transform="rotate(${it.rot} ${it.x} ${it.y})"/>`;
      }).join('');
      const rays = Array.from({length:11},(_,k)=>{
        const ang = k*32.7 + rnd(i+k);
        const x2 = it.x + Math.cos(ang*Math.PI/180)*it.r*0.9;
        const y2 = it.y + Math.sin(ang*Math.PI/180)*it.r*0.78;
        return `<line x1="${it.x}" y1="${it.y}" x2="${x2}" y2="${y2}" stroke="${shade(a,.9)}" stroke-width=".55" opacity=".3"/>`;
      }).join('');
      out += `<g>
        <ellipse cx="${it.x}" cy="${it.y+2}" rx="${it.r}" ry="${it.r*0.9}" fill="#000" opacity="${dark()?.3:.08}" transform="rotate(${it.rot} ${it.x} ${it.y})"/>
        <ellipse cx="${it.x}" cy="${it.y}" rx="${it.r}" ry="${it.r*0.88}" fill="${shade(c,1.1)}" transform="rotate(${it.rot} ${it.x} ${it.y})"/>
        <ellipse cx="${it.x}" cy="${it.y}" rx="${it.r*0.92}" ry="${it.r*0.8}" fill="${shade(c,1.18)}" transform="rotate(${it.rot} ${it.x} ${it.y})"/>
        <g transform="rotate(${it.rot} ${it.x} ${it.y})">${rings}${rays}</g>
        <ellipse cx="${it.x}" cy="${it.y}" rx="${it.r}" ry="${it.r*0.88}" fill="none" stroke="${shade(a,1)}" stroke-width="2.6" opacity=".85" transform="rotate(${it.rot} ${it.x} ${it.y})"/>
        <ellipse cx="${it.x-it.r*0.28}" cy="${it.y-it.r*0.34}" rx="${it.r*0.3}" ry="${it.r*0.2}" fill="url(#hr${uid}a)" transform="rotate(${it.rot} ${it.x} ${it.y})"/>
      </g>`;
    });
    return frame(out,w,h);
  }

  /* ---------- 枝条 / 藤茎 ---------- */
  function twig(c, a, w, h){
    let out = shadow(w,h);
    const sticks = [
      {x1:w*0.16,y1:h*0.78,x2:w*0.78,y2:h*0.26,w:13,rot:0},
      {x1:w*0.26,y1:h*0.86,x2:w*0.86,y2:h*0.4,w:10,rot:0},
      {x1:w*0.34,y1:h*0.2,x2:w*0.72,y2:h*0.74,w:9,rot:0}
    ];
    sticks.forEach((s,i)=>{
      out += `<g>
        <line x1="${s.x1}" y1="${s.y1+2}" x2="${s.x2}" y2="${s.y2+2}" stroke="#000" stroke-opacity="${dark()?.34:.1}" stroke-width="${s.w}" stroke-linecap="round"/>
        <line x1="${s.x1}" y1="${s.y1}" x2="${s.x2}" y2="${s.y2}" stroke="${shade(a,1)}" stroke-width="${s.w}" stroke-linecap="round"/>
        <line x1="${s.x1}" y1="${s.y1-1.6}" x2="${s.x2}" y2="${s.y2-1.6}" stroke="${shade(c,1.05)}" stroke-width="${s.w*0.55}" stroke-linecap="round" opacity=".9"/>
        <line x1="${s.x1+3}" y1="${s.y1-2}" x2="${s.x2-3}" y2="${s.y2-2}" stroke="${shade(c,1.3)}" stroke-width="1" stroke-linecap="round" opacity=".55"/>
        <circle cx="${s.x2}" cy="${s.y2}" r="${s.w*0.5}" fill="${shade(c,1.28)}" stroke="${shade(a,.9)}" stroke-width="1"/>
        <circle cx="${s.x2}" cy="${s.y2}" r="${s.w*0.26}" fill="${shade(a,.75)}" opacity=".5"/>
        ${i===0?`<g stroke="${shade(a,.9)}" stroke-width=".9" opacity=".5" fill="none">
          <path d="M${s.x1+18} ${s.y1-6} l-8 -12"/><path d="M${s.x1+40} ${s.y1-10} l6 -13"/>
          <path d="M${s.x1+62} ${s.y1-14} l-7 -11"/></g>`:''}
      </g>`;
    });
    return frame(out,w,h);
  }

  /* ---------- 树皮卷筒 ---------- */
  function bark(c, a, w, h){
    let out = shadow(w,h);
    [0,1].forEach(i=>{
      const x = w*0.22 + i*w*0.3, y = h*0.26 + i*8;
      out += `<g transform="translate(${x} ${y}) rotate(${i?-6:4})">
        <path d="M0 0c34-14 70-14 92 0v88c-24 14-66 14-92 0z" fill="#000" opacity="${dark()?.3:.09}" transform="translate(3 3)"/>
        <path d="M0 0c34-14 70-14 92 0v88c-24 14-66 14-92 0z" fill="${shade(a,1.05)}"/>
        <path d="M0 0c34-14 70-14 92 0v14c-24 12-66 12-92 0z" fill="${shade(c,1.12)}" opacity=".9"/>
        <path d="M8 10c26-10 56-10 80 0v74c-22 10-58 10-80 0z" fill="${shade(c,.72)}" opacity=".55"/>
        <g stroke="${shade(a,.8)}" stroke-width=".7" opacity=".45">
          ${Array.from({length:6},(_,k)=>`<path d="M${6+k*15} 2c-2 22-1 46 1 84"/>`).join('')}
        </g>
        <g stroke="${shade(a,.95)}" stroke-width=".8" opacity=".5">
          ${Array.from({length:5},(_,k)=>`<path d="M4 ${26+k*13}c30 7 62 7 86 0"/>`).join('')}
        </g>
      </g>`;
    });
    return frame(out,w,h);
  }

  /* ---------- 果实 ---------- */
  function fruit(c, a, w, h){
    let out = shadow(w,h);
    const pts = [[0.3,0.42,1],[0.5,0.56,1.1],[0.68,0.4,0.95],[0.42,0.28,0.85],[0.6,0.68,0.8],[0.76,0.6,0.72]];
    pts.forEach(([px,py,sc],i)=>{
      const r = 20*sc, x=w*px, y=h*py;
      out += `<g>
        <ellipse cx="${x}" cy="${y+r*0.9}" rx="${r*0.94}" ry="${r*0.28}" fill="#000" opacity="${dark()?.3:.08}"/>
        <circle cx="${x}" cy="${y}" r="${r}" fill="${shade(a,1)}"/>
        <circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${shade(a,.7)}" stroke-width="1.1" opacity=".6"/>
        <path d="M${x-r*0.9} ${y-r*0.1}c${r*0.5} -${r*0.55} ${r*1.3} -${r*0.6} ${r*1.8} -${r*0.25}" fill="none" stroke="${shade(c,1.3)}" stroke-width=".9" opacity=".55"/>
        <ellipse cx="${x-r*0.3}" cy="${y-r*0.36}" rx="${r*0.3}" ry="${r*0.2}" fill="#fff" opacity="${dark()?.16:.4}"/>
        ${i===1?`<g><circle cx="${x}" cy="${y}" r="${r*0.55}" fill="${shade(c,1.35)}"/><g fill="${shade(a,.62)}">${Array.from({length:5},(_,k)=>`<ellipse cx="${x+Math.cos(k*72*Math.PI/180)*r*0.26}" cy="${y+Math.sin(k*72*Math.PI/180)*r*0.26}" rx="${r*0.15}" ry="${r*0.1}" transform="rotate(${k*72} ${x} ${y})"/>`).join('')}</g></g>`:''}
      </g>`;
    });
    return frame(out,w,h);
  }

  /* ---------- 花 ---------- */
  function flower(c, a, w, h){
    let out = shadow(w,h);
    const buds = [[0.38,0.5,1],[0.58,0.42,0.85],[0.48,0.66,0.72]];
    buds.forEach(([px,py,sc],i)=>{
      const S = 30*sc, x=w*px, y=h*py;
      out += `<g transform="translate(${x} ${y})">
        <path d="M0 ${S*0.9}c-4 14-2 26 2 34" stroke="${shade(a,.9)}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
        <g>${Array.from({length:5},(_,k)=>{
          const ang = -90 + k*72 + i*12;
          return `<ellipse cx="0" cy="${-S*0.62}" rx="${S*0.26}" ry="${S*0.62}" fill="${shade(c,1+k*0.04)}" stroke="${shade(a,1.1)}" stroke-width=".7" opacity=".95" transform="rotate(${ang})"/>`;
        }).join('')}
        <circle cx="0" cy="0" r="${S*0.2}" fill="${shade(a,1.35)}"/>
        <circle cx="0" cy="0" r="${S*0.12}" fill="${shade(a,1.7)}" opacity=".8"/></g>
      </g>`;
    });
    return frame(out,w,h);
  }

  /* ---------- 种子 ---------- */
  function seed(c, a, w, h){
    let out = shadow(w,h);
    const pts=[[0.26,0.42],[0.4,0.56],[0.54,0.38],[0.66,0.54],[0.78,0.4],[0.46,0.24],[0.62,0.7]];
    pts.forEach(([px,py],i)=>{
      const x=w*px,y=h*py, r=11+(hash(c+i)%5);
      out += `<g transform="translate(${x} ${y}) rotate(${(hash(c+i)%40)-20})">
        <ellipse cx="1.5" cy="2.5" rx="${r}" ry="${r*1.25}" fill="#000" opacity="${dark()?.28:.07}"/>
        <ellipse cx="0" cy="0" rx="${r}" ry="${r*1.25}" fill="${shade(a,1.1)}" stroke="${shade(a,.7)}" stroke-width=".7"/>
        <path d="M0 ${-r*1.1}c${r*0.5} ${r*0.5} ${r*0.5} ${r*1.6} 0 ${r*2.1}" fill="none" stroke="${shade(c,1.3)}" stroke-width=".8" opacity=".7"/>
        <ellipse cx="${-r*0.3}" cy="${-r*0.4}" rx="${r*0.26}" ry="${r*0.42}" fill="#fff" opacity="${dark()?.12:.32}"/>
      </g>`;
    });
    return frame(out,w,h);
  }

  /* ---------- 全草 / 带叶茎 ---------- */
  function whole(c, a, w, h){
    let out = shadow(w,h);
    out += `<g transform="translate(${w*0.5} ${h*0.92})">
      <path d="M0 0c-6-40-3-74 4-104" stroke="${shade(a,1)}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
      ${Array.from({length:6},(_,i)=>{
        const y = -22 - i*15, dir = i%2?-1:1;
        return `<g transform="translate(${dir*2} ${y})">
          <path d="M0 0c${dir*10} -6 ${dir*24} -4 ${dir*30} 4c-${dir*10} 6 -${dir*22} 4 -${dir*30} -4z" fill="${shade(c,1+i*0.03)}" stroke="${shade(a,1.2)}" stroke-width=".7"/>
          <path d="M${dir*3} 0h${dir*24}" stroke="${shade(a,.9)}" stroke-width=".6" opacity=".7"/>
        </g>`;
      }).join('')}
      <g>${Array.from({length:4},(_,k)=>`<circle cx="${(k-1.5)*9}" cy="-108" r="3.2" fill="${shade(a,1.5)}"/>`).join('')}</g>
    </g>`;
    return frame(out,w,h);
  }

  /* ---------- 叶 ---------- */
  function leaf(c, a, w, h){
    let out = shadow(w,h);
    [[0.4,0.5,-14,1],[0.62,0.58,10,.9],[0.52,0.36,4,.72]].forEach(([px,py,rot,sc],i)=>{
      out += `<g transform="translate(${w*px} ${h*py}) rotate(${rot}) scale(${sc})">
        <path d="M0 44c-26-18-34-46-16-64 12-12 32-8 40 6 8 14 2 36-16 52-3 3-6 4-8 6z" fill="${shade(c,1.05)}" stroke="${shade(a,1.15)}" stroke-width="1.1"/>
        <path d="M0 44C-2 22 0 4 6-14" stroke="${shade(a,.95)}" stroke-width="1" fill="none"/>
        ${Array.from({length:6},(_,k)=>{
          const y = 30-k*9;
          return `<path d="M1 ${y}c8-3 14-8 18-14M1 ${y}c-8-3-14-8-18-14" stroke="${shade(a,.95)}" stroke-width=".65" fill="none" opacity=".7"/>`;
        }).join('')}
      </g>`;
    });
    return frame(out,w,h);
  }

  /* ---------- 矿物 / 结晶 ---------- */
  function mineral(c, a, w, h){
    let out = shadow(w,h);
    [[0.36,0.52,.95],[0.58,0.46,1.15],[0.5,0.68,.7]].forEach(([px,py,sc],i)=>{
      const x=w*px, y=h*py, S=34*sc;
      out += `<g transform="translate(${x} ${y}) rotate(${i*14-10})">
        <path d="M${-S} ${S*0.5} L${-S*0.6} ${-S*0.7} L${S*0.3} ${-S*0.9} L${S} ${-S*0.1} L${S*0.6} ${S*0.7} L${-S*0.3} ${S*0.85} Z" fill="${shade(c,1)}" stroke="${shade(a,.85)}" stroke-width="1"/>
        <path d="M${-S*0.6} ${-S*0.7} L${S*0.1} ${-S*0.35} L${S} ${-S*0.1} L${S*0.6} ${S*0.7} L${-S*0.1} ${S*0.2} Z" fill="${shade(c,1.25)}" opacity=".85"/>
        <path d="M${S*0.1} ${-S*0.35} L${-S*0.1} ${S*0.2} L${-S} ${S*0.5} L${-S*0.6} ${-S*0.7} Z" fill="${shade(a,1.05)}" opacity=".55"/>
        <path d="M${-S*0.55} ${-S*0.62} L${-S*0.1} ${-S*0.42}" stroke="#fff" stroke-width="1.6" opacity="${dark()?.3:.65}"/>
      </g>`;
    });
    return frame(out,w,h);
  }

  /* ---------- 动物类（干燥全体） ---------- */
  function animal(c, a, w, h){
    let out = shadow(w,h);
    const seg = Array.from({length:7},(_,i)=>`<ellipse cx="${w*0.3+i*15}" cy="${h*0.5+Math.sin(i*0.9)*5}" rx="15" ry="10" fill="${shade(c,1+i*0.02)}" stroke="${shade(a,.9)}" stroke-width=".6"/>`).join('');
    out += `<g transform="rotate(-8 ${w/2} ${h/2})">
      <path d="M${w*0.26} ${h*0.52}c4-16 16-24 30-24" stroke="${shade(a,1)}" stroke-width="2" fill="none"/>
      ${seg}
      <ellipse cx="${w*0.26}" cy="${h*0.5}" rx="14" ry="11" fill="${shade(c,1.15)}" stroke="${shade(a,.9)}" stroke-width=".7"/>
      <circle cx="${w*0.24}" cy="${h*0.47}" r="2" fill="${shade(a,.6)}"/>
      <path d="M${w*0.72} ${h*0.5}c12-2 20-8 22-16" stroke="${shade(a,1)}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      ${Array.from({length:4},(_,k)=>`<path d="M${w*0.34+k*13} ${h*0.56}l-4 12" stroke="${shade(a,.9)}" stroke-width="1.3"/>`).join('')}
    </g>
    <g opacity=".5" font-size="7" fill="${paper().txt}" font-family="ui-monospace,monospace">
      <text x="14" y="20">干燥全体 · 示意</text>
    </g>`;
    return frame(out,w,h);
  }

  /* ---------- 菌类 ---------- */
  function fungus(c, a, w, h){
    let out = shadow(w,h);
    out += `<g>
      <path d="M${w*0.3} ${h*0.68}c-14-18-6-38 14-42 10-2 18 2 26-2 14-6 28 4 26 18-1 8-6 12-12 14 4 10-4 20-16 20-12 0-30 2-38-8z" fill="${shade(c,1.02)}" stroke="${shade(a,1.1)}" stroke-width="1.2"/>
      <path d="M${w*0.34} ${h*0.56}c8-10 22-14 34-8" stroke="${shade(c,1.3)}" stroke-width="2" fill="none" opacity=".8"/>
      <g fill="${shade(a,.9)}" opacity=".35">
        ${Array.from({length:16},(_,k)=>`<circle cx="${w*0.34+(k%5)*14}" cy="${h*0.44+Math.floor(k/5)*12}" r="1.5"/>`).join('')}
      </g>
      <path d="M${w*0.62} ${h*0.7}c10 6 24 4 30-4" stroke="${shade(a,1.1)}" stroke-width="1" fill="none" opacity=".5"/>
    </g>`;
    return frame(out,w,h);
  }

  /* ---------- 树脂 / 胶类 ---------- */
  function resin(c, a, w, h){
    let out = shadow(w,h);
    [[0.38,0.5,1],[0.58,0.42,.8],[0.52,0.66,.65]].forEach(([px,py,sc],i)=>{
      const x=w*px,y=h*py,S=30*sc;
      out += `<g transform="translate(${x} ${y})">
        <path d="M0 ${-S}c${S*0.7} ${S*0.1} ${S} ${S*0.6} ${S*0.7} ${S*0.9}-${S*0.3} ${S*0.3}-${S*1.1} ${S*0.3}-${S*1.4} 0-${S*0.3}-${S*0.3} 0-${S*0.8} ${S*0.7}-${S*0.9}z" fill="${shade(c,1.05)}" stroke="${shade(a,1.1)}" stroke-width=".9" opacity=".95"/>
        <path d="M${-S*0.4} ${-S*0.2}c${S*0.4} -${S*0.3} ${S*0.8} -${S*0.2} ${S*1} ${S*0.1}" stroke="#fff" stroke-width="1.4" fill="none" opacity="${dark()?.25:.6}"/>
      </g>`;
    });
    return frame(out,w,h);
  }

  /* ---------- 加工品（胶块 / 曲块） ---------- */
  function prepared(c, a, w, h){
    let out = shadow(w,h);
    out += `<g transform="translate(${w*0.5} ${h*0.52})">
      <path d="M-52 -26 L18 -40 L54 -14 L54 30 L-16 42 L-52 16 Z" fill="${shade(a,1)}" stroke="${shade(a,.75)}" stroke-width="1"/>
      <path d="M-52 -26 L18 -40 L54 -14 L-16 0 Z" fill="${shade(c,1.15)}" opacity=".95"/>
      <path d="M-16 0 L54 -14 L54 30 L-16 42 Z" fill="${shade(c,.9)}"/>
      <path d="M-52 -26 L-16 0 L-16 42 L-52 16 Z" fill="${shade(c,1)}" opacity=".9"/>
      <path d="M-40 -22 L8 -32" stroke="#fff" stroke-width="2" opacity="${dark()?.2:.5}"/>
      <path d="M-8 6 L44 -6" stroke="#fff" stroke-width="1.4" opacity="${dark()?.15:.35}"/>
    </g>`;
    return frame(out,w,h);
  }

  const FORMS = {slice, twig, bark, fruit, flower, seed, whole, leaf, mineral, animal, fungus, resin, prepared};

  function svg(name, h, trait){
    const form = (trait && trait.form) || 'slice';
    const c = h && h.a ? h.a[1] : '#b08a5a';
    const a = h && h.a ? h.a[2] : '#8a6a3a';
    const fn = FORMS[form] || slice;
    const note = (trait && trait.form) ? '性状写生' : '部位示意';
    return fn(c, a, 240, 190, note);
  }

  window.HERB_REAL = {svg, FORMS};
})();
