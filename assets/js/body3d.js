/* ================= 3D 经络人体（canvas 手写渲染） =================
   不依赖任何 3D 库：把人体拆成若干「管状体」→ 索引网格 → 按面深度排序
   逐面填充（画家算法）+ 轮廓边描线，再叠加经脉折线与穴位点。
   定位为「空间关系的示意」：经络走向、穴位所在区域、前后深浅，
   不是解剖定位，也不能替代骨度分寸取穴。
*/
(function(){
  const rad = d => d*Math.PI/180;
  const lerp = (a,b,t)=>[a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t];
  const along = (a,b,arr)=>arr.map(t=>lerp(a,b,t));

  /* ---------------- 人体轮廓参数 ---------------- */
  const TORSO = [
    [0.392,0.052,0.044],[0.420,0.100,0.070],[0.450,0.126,0.083],
    [0.480,0.133,0.087],[0.530,0.120,0.078],[0.580,0.113,0.073],
    [0.630,0.119,0.077],[0.680,0.133,0.086],[0.720,0.145,0.092],
    [0.760,0.157,0.096],[0.790,0.167,0.094],[0.806,0.148,0.085]
  ];
  const NECK = [[0.786,0.056,0.054],[0.820,0.047,0.046],[0.852,0.045,0.044]];
  const HEAD = (()=>{
    const out=[], n=11, y0=0.845, y1=1.000;
    for(let k=0;k<=n;k++){
      const t=k/n, y=y0+(y1-y0)*t;
      let r = 0.079 * Math.sqrt(Math.max(0.015, 1 - Math.pow((t-0.45)/0.60, 2)));
      if(t<0.26) r *= 0.84 + t*0.62;          // 下颌收窄
      out.push([y, r*0.93, r]);
    }
    return out;
  })();

  const SHO = [0.158,0.788,0], ELB=[0.246,0.636,0.008], WRI=[0.298,0.492,0.016], HND=[0.316,0.412,0.022];
  const HIP = [0.070,0.452,0], KNE=[0.080,0.268,0.006], ANK=[0.084,0.048,0.002], TOE=[0.086,0.020,0.082];

  /* ---------------- 网格构建（顶点去重 → 面 + 边邻接） ---------------- */
  function buildMesh(){
    const verts=[], vmap=new Map(), faces=[], seeds=[], parts=[];
    let CUR = 0;
    const V = p=>{
      let i = vmap.get(p);
      if(i===undefined){ i=verts.length; verts.push(p); vmap.set(p,i); }
      return i;
    };
    // seed = 该面所属「管轴」上的参考点，用于把法线统一朝外
    const quad=(a,b,c,d,seed)=>{ faces.push([V(a),V(b),V(c),V(d)]); seeds.push(seed||[0,0.5,0]); parts.push(CUR); };
    const tri =(a,b,c,seed)=>{ faces.push([V(a),V(b),V(c)]); seeds.push(seed||[0,0.5,0]); parts.push(CUR); };

    function tube(rings, sides, capTop, capBot){
      CUR++;
      const grid = rings.map(([y,rx,rz])=>{
        const pts=[];
        for(let i=0;i<sides;i++){
          const a=i/sides*Math.PI*2;
          pts.push([Math.sin(a)*rx, y, Math.cos(a)*rz]);
        }
        return pts;
      });
      for(let j=0;j<grid.length-1;j++)
        for(let i=0;i<sides;i++){
          const i2=(i+1)%sides;
          const seed=[0,(rings[j][0]+rings[j+1][0])/2,0];
          quad(grid[j][i], grid[j][i2], grid[j+1][i2], grid[j+1][i], seed);
        }
      if(capTop){ const p=grid[grid.length-1], sd=[0,rings[rings.length-1][0]-0.02,0];
        for(let i=1;i<sides-1;i++) tri(p[0],p[i],p[i+1], sd); }
      if(capBot){ const p=grid[0], sd=[0,rings[0][0]+0.02,0];
        for(let i=1;i<sides-1;i++) tri(p[0],p[i+1],p[i], sd); }
    }
    function ball(c, r, sides, rows){
      CUR++;
      const grid=[];
      for(let k=0;k<=rows;k++){
        const a=Math.PI*k/rows;
        const y=c[1]+Math.cos(a)*r, rr=Math.max(0.0018, Math.sin(a)*r);
        const row=[];
        for(let i=0;i<sides;i++){
          const t=i/sides*Math.PI*2;
          row.push([c[0]+Math.sin(t)*rr*0.96, y, c[2]+Math.cos(t)*rr*0.94]);
        }
        grid.push(row);
      }
      for(let j=0;j<grid.length-1;j++)
        for(let i=0;i<sides;i++){
          const i2=(i+1)%sides;
          quad(grid[j][i], grid[j][i2], grid[j+1][i2], grid[j+1][i], c);
        }
    }
    function limb(from, to, r0, r1, sides, bulge){
      CUR++;
      const steps=6, grid=[];
      for(let k=0;k<=steps;k++){
        const t=k/steps, p=lerp(from,to,t);
        const r=(r0+(r1-r0)*t)*(1+Math.sin(Math.PI*t)*(bulge||0));
        const row=[];
        for(let i=0;i<sides;i++){
          const a=i/sides*Math.PI*2;
          row.push([p[0]+Math.sin(a)*r*0.97, p[1], p[2]+Math.cos(a)*r*0.94]);
        }
        grid.push(row);
      }
      const seed = lerp(from, to, 0.5);
      for(let j=0;j<grid.length-1;j++)
        for(let i=0;i<sides;i++){
          const i2=(i+1)%sides;
          quad(grid[j][i], grid[j][i2], grid[j+1][i2], grid[j+1][i], seed);
        }
    }

    tube(TORSO, 34, true, false);
    ball([0,0.402,0], 0.056, 20, 8);   // 骨盆底：遮住躯干管口
    tube(NECK, 20, false, false);
    tube(HEAD, 26, true, true);
    [1,-1].forEach(s=>{
      const M = p=>[p[0]*s, p[1], p[2]];
      ball(M(SHO), 0.052, 16, 7);
      limb(M(SHO), M(ELB), 0.047, 0.034, 18, 0.07);
      limb(M(ELB), M(WRI), 0.034, 0.024, 16, 0.06);
      limb(M(WRI), M(HND), 0.026, 0.017, 12, 0.02);
      ball(M(ELB), 0.035, 14, 6);
      ball(M(WRI), 0.025, 12, 5);
      ball(M(HND), 0.019, 12, 5);
      // 手指：四指沿 z 排开（掌面朝内），再加拇指
      for(let fi=0; fi<4; fi++){
        const z = 0.0345 - fi*0.0088;
        const len = 0.034 - Math.abs(fi-1.15)*0.0038;
        limb(M([0.314+fi*0.0018,0.409,z]), M([0.320+fi*0.0022,0.409-len,z*0.94]), 0.0084, 0.0056, 8, 0.02);
      }
      limb(M([0.303,0.418,0.041]), M([0.294,0.394,0.052]), 0.0090, 0.0064, 8, 0.02);
      ball(M(HIP), 0.062, 16, 7);
      limb(M(HIP), M(KNE), 0.066, 0.046, 20, 0.06);
      ball(M(KNE), 0.047, 14, 6);
      limb(M(KNE), M(ANK), 0.046, 0.030, 18, 0.08);
      ball(M(ANK), 0.030, 12, 5);
      limb(M(ANK), M(TOE), 0.028, 0.021, 14, 0);
      ball(M(TOE), 0.020, 10, 4);
      // 脚趾
      for(let ti=0; ti<3; ti++) ball(M([0.086,0.0125,0.068+ti*0.0115]), 0.0088, 7, 3);
    });

    // 面法线
    const normals = faces.map((f,fi)=>{
      let cx=0, cy=0, cz=0;
      for(const i of f){ const p=verts[i]; cx+=p[0]; cy+=p[1]; cz+=p[2]; }
      cx/=f.length; cy/=f.length; cz/=f.length;
      const a=verts[f[0]], b=verts[f[1]], c=verts[f[2]];
      const u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]], v=[c[0]-a[0],c[1]-a[1],c[2]-a[2]];
      let n=[u[1]*v[2]-u[2]*v[1], u[2]*v[0]-u[0]*v[2], u[0]*v[1]-u[1]*v[0]];
      const L=Math.hypot(n[0],n[1],n[2])||1;
      n=[n[0]/L,n[1]/L,n[2]/L];
      const sd=seeds[fi]||[0,0.5,0];
      const outward = n[0]*(cx-sd[0]) + n[1]*(cy-sd[1]) + n[2]*(cz-sd[2]);
      if(outward<0) n=[-n[0],-n[1],-n[2]];
      return n;
    });

    // 边邻接（用于轮廓线）
    const em=new Map();
    faces.forEach((f,fi)=>{
      for(let k=0;k<f.length;k++){
        const a=f[k], b=f[(k+1)%f.length];
        const key = a<b ? a+'_'+b : b+'_'+a;
        const e = em.get(key);
        if(!e) em.set(key, {a,b,f1:fi,f2:-1});
        else e.f2=fi;
      }
    });

    return {verts, faces, normals, parts, edges:[...em.values()]};
  }

  /* ---------------- 体表取点 ---------------- */
  function profAt(list, y){
    let i=0;
    while(i<list.length-2 && y>list[i+1][0]) i++;
    const a=list[i], b=list[i+1];
    const t=Math.max(0,Math.min(1,(y-a[0])/((b[0]-a[0])||1)));
    return [a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t];
  }
  function torsoPt(y, deg, k){
    const [rx,rz]=profAt(TORSO,y), r=(k||1);
    return [Math.sin(rad(deg))*rx*r, y, Math.cos(rad(deg))*rz*r];
  }
  function headPt(y, deg){
    const [rx,rz]=profAt(HEAD,y);
    return [Math.sin(rad(deg))*rx, y, Math.cos(rad(deg))*rz];
  }

  /* ---------------- 十二经脉 + 任督（示意走向，右半身；左半身镜像） ---------------- */
  const MER = [
    {k:'LU',n:'手太阴肺经',c:'#c05a45',pts:[
      torsoPt(0.760,24),torsoPt(0.792,30),[0.130,0.796,0.030],SHO,
      ...along(SHO,ELB,[.35,.7]),...along(ELB,WRI,[.3,.65]),...along(WRI,HND,[.55,1])]},
    {k:'LI',n:'手阳明大肠经',c:'#c47d31',pts:[
      HND,WRI,ELB,SHO,[0.168,0.812,0.018],torsoPt(0.842,18),headPt(0.900,24),headPt(0.922,20)]},
    {k:'HT',n:'手少阴心经',c:'#b04452',pts:[
      torsoPt(0.728,58),[0.126,0.768,0.034],SHO,
      ...along(SHO,ELB,[.42,.82]),...along(ELB,WRI,[.42,.82]),...along(WRI,HND,[.7,1])]},
    {k:'SI',n:'手太阳小肠经',c:'#a9602c',pts:[
      HND,[0.306,0.446,-0.018],WRI,[0.262,0.628,-0.026],ELB,[0.196,0.798,-0.026],torsoPt(0.812,152),torsoPt(0.852,162)]},
    {k:'PC',n:'手厥阴心包经',c:'#94506f',pts:[
      torsoPt(0.742,32),[0.140,0.770,0.046],SHO,
      ...along(SHO,ELB,[.5,.86]),...along(ELB,WRI,[.5,.86]),...along(WRI,HND,[.8,1])]},
    {k:'TE',n:'手少阳三焦经',c:'#80602f',pts:[
      HND,[0.318,0.444,0.004],WRI,[0.254,0.632,-0.004],ELB,[0.176,0.800,-0.014],torsoPt(0.836,78)]},
    {k:'ST',n:'足阳明胃经',c:'#b39434',pts:[
      headPt(0.884,16),headPt(0.852,18),torsoPt(0.796,20),torsoPt(0.720,22),torsoPt(0.640,24),torsoPt(0.560,22),
      [0.078,0.470,0.058],...along(HIP,KNE,[.35,.75]),KNE,[0.080,0.200,0.050],[0.084,0.090,0.034],TOE]},
    {k:'SP',n:'足太阴脾经',c:'#8a9a4a',pts:[
      [0.072,0.028,0.050],[0.070,0.120,0.014],[0.072,0.260,0.018],
      ...along(HIP,KNE,[.5,.8]),[0.070,0.462,0.026],torsoPt(0.540,10),torsoPt(0.620,12),torsoPt(0.700,14),torsoPt(0.782,16)]},
    {k:'KI',n:'足少阴肾经',c:'#4b6b7c',pts:[
      [0.064,0.012,0.024],[0.060,0.100,0.004],[0.064,0.280,0.006],[0.060,0.462,0.010],
      torsoPt(0.520,4),torsoPt(0.600,5),torsoPt(0.680,6),torsoPt(0.756,7)]},
    {k:'LR',n:'足厥阴肝经',c:'#5e6d40',pts:[
      [0.080,0.026,0.046],[0.074,0.140,0.008],[0.072,0.300,0.010],[0.064,0.470,0.024],
      torsoPt(0.500,8),torsoPt(0.560,7),torsoPt(0.620,9)]},
    {k:'GB',n:'足少阳胆经',c:'#3f7d63',pts:[
      headPt(0.902,74),headPt(0.858,82),torsoPt(0.798,86),torsoPt(0.720,88),torsoPt(0.620,88),torsoPt(0.520,86),
      [0.118,0.470,0.008],...along(HIP,KNE,[.28,.7]),[0.102,0.270,0.024],[0.100,0.120,0.026],[0.092,0.034,0.056]]},
    {k:'BL',n:'足太阳膀胱经',c:'#3d6f9c',pts:[
      headPt(0.930,178),headPt(0.868,176),torsoPt(0.812,168),torsoPt(0.740,172),torsoPt(0.660,174),torsoPt(0.580,172),
      [0.078,0.470,-0.056],...along(HIP,KNE,[.4,.75]),[0.078,0.260,-0.050],[0.080,0.100,-0.034],[0.080,0.030,-0.004]]},
    {k:'REN',n:'任脉',mid:true,c:'#b03a4a',pts:[
      torsoPt(0.418,0),torsoPt(0.440,0),torsoPt(0.500,0),torsoPt(0.580,0),torsoPt(0.660,0),torsoPt(0.735,0),torsoPt(0.795,0),headPt(0.845,0)]},
    {k:'DU',n:'督脉',mid:true,c:'#7a4ba8',pts:[
      [0,0.398,-0.044],torsoPt(0.440,180),torsoPt(0.500,180),torsoPt(0.580,180),torsoPt(0.660,180),torsoPt(0.740,180),torsoPt(0.810,180),
      headPt(0.890,180),headPt(0.940,180),headPt(0.990,160)]}
  ];

  /* ---------------- 穴位坐标（模型空间，右半身；左半身镜像） ---------------- */
  const P = {
    '百会':[0,0.995,0.004],'太阳':[0.058,0.930,0.036],'风池':[0.038,0.868,-0.066],'大椎':[0,0.812,-0.058],
    '印堂':[0,0.902,0.074],'神庭':[0,0.946,0.050],'睛明':[0.018,0.910,0.072],'迎香':[0.018,0.882,0.070],
    '地仓':[0.026,0.866,0.060],'颊车':[0.048,0.866,0.038],'听宫':[0.068,0.898,0.010],'翳风':[0.052,0.874,-0.040],
    '率谷':[0.056,0.944,0.012],'缺盆':[0.064,0.792,0.062],'天突':[0,0.800,0.078],'膻中':[0,0.730,0.098],
    '巨阙':[0,0.676,0.094],'中脘':[0,0.636,0.092],'神阙':[0,0.582,0.082],'气海':[0,0.542,0.080],'关元':[0,0.510,0.078],
    '天枢':[0.048,0.568,0.080],'大横':[0.072,0.568,0.070],'章门':[0.100,0.622,0.060],'期门':[0.084,0.674,0.076],
    '带脉':[0.104,0.556,0.044],'命门':[0,0.598,-0.074],'至阳':[0,0.696,-0.078],'腰阳关':[0,0.498,-0.068],
    '长强':[0,0.408,-0.052],'肺俞':[0.040,0.768,-0.070],'心俞':[0.038,0.732,-0.076],'肝俞':[0.036,0.688,-0.078],
    '脾俞':[0.036,0.648,-0.078],'肾俞':[0.034,0.582,-0.076],'肩髃':[0.152,0.790,0.032],'肩髎':[0.158,0.782,-0.026],
    '臂臑':[0.196,0.722,0.020],'曲池':[0.244,0.634,0.030],'手三里':[0.226,0.682,0.028],'外关':[0.284,0.462,-0.008],
    '支沟':[0.286,0.472,-0.013],'内关':[0.292,0.462,0.030],'郄门':[0.262,0.580,0.034],'大陵':[0.305,0.430,0.021],
    '神门':[0.301,0.424,0.006],'劳宫':[0.313,0.402,0.019],'合谷':[0.315,0.400,0.032],'后溪':[0.311,0.404,-0.004],
    '少商':[0.319,0.379,0.030],'商阳':[0.319,0.379,0.009],'环跳':[0.108,0.442,-0.030],'承扶':[0.072,0.422,-0.050],
    '殷门':[0.076,0.348,-0.046],'委中':[0.078,0.266,-0.044],'承山':[0.080,0.132,-0.040],'昆仑':[0.090,0.040,-0.012],
    '血海':[0.088,0.302,0.046],'阴陵泉':[0.078,0.222,0.032],'阳陵泉':[0.094,0.230,0.026],'足三里':[0.086,0.188,0.050],
    '上巨虚':[0.086,0.138,0.044],'悬钟':[0.094,0.112,0.020],'三阴交':[0.072,0.108,0.016],'太溪':[0.068,0.040,0.008],
    '公孙':[0.072,0.018,0.046],'太白':[0.076,0.016,0.044],'内庭':[0.082,0.018,0.066],'太冲':[0.084,0.024,0.052],
    '涌泉':[0.078,0.006,0.032],'丘墟':[0.096,0.042,0.032],'解溪':[0.082,0.046,0.042]
  };

  /* ---------------- 渲染器 ---------------- */
  function mount(el, cb){
    if(!el) return null;
    const old = el.querySelector('canvas'); if(old) old.remove();
    const cv = document.createElement('canvas');
    cv.setAttribute('role','img'); cv.setAttribute('aria-label','可旋转的 3D 经络人体示意图');
    el.appendChild(cv);
    const ctx = cv.getContext('2d');

    const state = {yaw:-0.42, pitch:0.05, zoom:1, auto:true, drag:false, px:0, py:0,
      mer:null, hover:null, hitMap:[], alive:true};
    const MESH = buildMesh();
    const {verts, faces, normals, parts, edges} = MESH;
    const VN = verts.length;
    const rotBuf = new Float32Array(VN*3);
    const fz = new Float32Array(faces.length), fvis = new Uint8Array(faces.length), flit = new Float32Array(faces.length);
    const MAXOP = faces.length + edges.length;
    const opKind = new Uint8Array(MAXOP), opId = new Int32Array(MAXOP), opZ = new Float32Array(MAXOP);
    const opArr = [];
    const scrX = new Float32Array(VN), scrY = new Float32Array(VN), scrP = new Float32Array(VN);
    let W=0,H=0,DPR=1;

    function size(){
      const r = cv.getBoundingClientRect();
      DPR = Math.min(2, window.devicePixelRatio||1);
      W = Math.max(220, Math.round(r.width));
      H = Math.max(260, Math.round(r.height));
      cv.width = W*DPR; cv.height = H*DPR;
      ctx.setTransform(DPR,0,0,DPR,0,0);
    }
    const ro = new ResizeObserver(size); ro.observe(cv); size();

    function theme(){
      const cs = getComputedStyle(document.documentElement);
      const g = k=>(cs.getPropertyValue(k)||'').trim();
      const t = document.documentElement.getAttribute('data-theme')||'light';
      return {t, dark:t==='dark', anc:t==='ancient',
        brand:g('--brand')||'#0d8388', muted:g('--muted')||'#65868a',
        ink:g('--ink-2')||'#234249', accent:g('--accent')||'#c04a78'};
    }
    function palette(T){
      if(T.dark)  return {base:[64,126,134], dark:[8,26,34],  hi:[176,250,242], edge:'rgba(160,244,236,.70)'};
      if(T.anc)   return {base:[238,220,186], dark:[124,88,46], hi:[255,251,238], edge:'rgba(78,48,18,.74)'};
      return        {base:[214,232,228], dark:[84,116,116], hi:[252,255,254], edge:'rgba(18,68,66,.72)'};
    }
    const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t];
    const css=c=>`rgb(${Math.round(Math.max(0,Math.min(255,c[0])))},${Math.round(Math.max(0,Math.min(255,c[1])))},${Math.round(Math.max(0,Math.min(255,c[2])))})`;

    function draw(){
      if(!state.alive) return;
      const T=theme(), C=palette(T);
      ctx.clearRect(0,0,W,H);
      if(state.auto && !state.drag) state.yaw += 0.0032;

      const scale = Math.min(H*0.94, W*0.74) * state.zoom;
      const ox = W/2, oy = H*0.53, yaw = state.yaw, pitch = state.pitch;
      const cy=Math.cos(yaw), sy=Math.sin(yaw), cp=Math.cos(pitch), sp=Math.sin(pitch);
      const L=[0.62,0.34,0.70];

      // 背景柔光 + 脚下投影
      const bg = ctx.createRadialGradient(ox, oy-scale*0.08, scale*0.04, ox, oy, scale*0.90);
      bg.addColorStop(0, T.dark? 'rgba(36,86,94,.34)' : (T.anc? 'rgba(255,251,238,.55)' : 'rgba(255,255,255,.45)'));
      bg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

      ctx.save();
      ctx.translate(ox, oy+scale*0.487); ctx.scale(1,0.19);
      const gr=ctx.createRadialGradient(0,0,scale*0.02,0,0,scale*0.28);
      gr.addColorStop(0, T.dark? 'rgba(120,240,230,.26)' : 'rgba(28,106,106,.20)');
      gr.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=gr; ctx.beginPath(); ctx.arc(0,0,scale*0.28,0,Math.PI*2); ctx.fill();
      ctx.restore();

      const proj = p=>{
        const x=p[0]*cy - p[2]*sy, z0=p[0]*sy + p[2]*cy;
        const y=p[1]*cp - z0*sp, z=p[1]*sp + z0*cp;
        const per=1/(1-z*0.42);
        return [ox+x*scale*per, oy-(y-0.5)*scale*per, z, per];
      };
      const faceOn = Math.cos(yaw);
      const rr=(x,y,w,h,r2)=>{ ctx.beginPath();
        if(ctx.roundRect){ ctx.roundRect(x,y,w,h,r2); return; }
        ctx.moveTo(x+r2,y); ctx.arcTo(x+w,y,x+w,y+h,r2); ctx.arcTo(x+w,y+h,x,y+h,r2);
        ctx.arcTo(x,y+h,x,y,r2); ctx.arcTo(x,y,x+w,y,r2); ctx.closePath(); };
      const inkMark = T.dark? 'rgba(160,246,238,.52)' : (T.anc? 'rgba(104,66,26,.52)' : 'rgba(16,70,70,.46)');
      const inkSoft = T.dark? 'rgba(160,246,238,.30)' : (T.anc? 'rgba(104,66,26,.30)' : 'rgba(16,70,70,.26)');
      const line=(pts, close, col, w)=>{
        const q = pts.filter(Boolean).map(proj);
        if(q.length<2) return;
        ctx.beginPath(); ctx.moveTo(q[0][0], q[0][1]);
        for(let i=1;i<q.length;i++) ctx.lineTo(q[i][0], q[i][1]);
        if(close) ctx.closePath();
        ctx.strokeStyle=col; ctx.lineWidth=w; ctx.stroke();
      };
      const markDot=(p, r, col, a)=>{
        const q=proj(p); if(q[2] <= 0.004) return;
        ctx.globalAlpha=a; ctx.beginPath(); ctx.arc(q[0], q[1], r*(0.9+q[3]*0.18), 0, 6.2832);
        ctx.fillStyle=col; ctx.fill(); ctx.globalAlpha=1;
      };
      const markEllipse=(p, rx, ry, rot, col, a)=>{
        const q=proj(p); if(q[2] <= 0.010) return;
        ctx.globalAlpha=a; ctx.save(); ctx.translate(q[0], q[1]); ctx.rotate(rot||0);
        ctx.beginPath(); ctx.ellipse(0,0, rx*scale*q[3], ry*scale*q[3], 0, 0, 6.2832);
        ctx.fillStyle=col; ctx.fill(); ctx.restore(); ctx.globalAlpha=1;
      };
      // 体表标志：让正面像胸、背面像背
      function drawMarks(){
        if(faceOn > 0.22){
          // 胸骨正中线
          line([0.796,0.775,0.752,0.728,0.704].map(v=>torsoPt(v,0)), false, inkMark, 1.5);
          // 锁骨
          line([torsoPt(0.804,0), torsoPt(0.802,20), torsoPt(0.798,44)], false, inkMark, 1.3);
          line([torsoPt(0.804,0), torsoPt(0.802,-20), torsoPt(0.798,-44)], false, inkMark, 1.3);
          // 肋弓
          line([torsoPt(0.706,10), torsoPt(0.680,24), torsoPt(0.656,32)], false, inkSoft, 0.9);
          line([torsoPt(0.706,-10), torsoPt(0.680,-24), torsoPt(0.656,-32)], false, inkSoft, 0.9);
          // 腹直肌外缘
          line([0.700,0.664,0.628,0.592,0.556,0.520].map(v=>torsoPt(v,13)), false, inkSoft, 0.9);
          line([0.700,0.664,0.628,0.592,0.556,0.520].map(v=>torsoPt(v,-13)), false, inkSoft, 0.9);
          // 乳头、脐
          markDot(torsoPt(0.738,26), 2.6, T.ink, .62);
          markDot(torsoPt(0.738,-26), 2.6, T.ink, .62);
          markDot(torsoPt(0.582,0), 3.4, T.ink, .68);
          ctx.globalAlpha=.30; const oq=proj(torsoPt(0.582,0));
          ctx.beginPath(); ctx.ellipse(oq[0],oq[1], 4.6*scale*oq[3]/60, 1.6, 0,0,6.2832);
          ctx.strokeStyle=T.ink; ctx.lineWidth=0.9; ctx.stroke(); ctx.globalAlpha=1;
        }
        if(faceOn < 0.55){
          // 脊柱中线
          line([0.800,0.765,0.730,0.695,0.660,0.625,0.590,0.555,0.520,0.485,0.450].map(v=>torsoPt(v,180)), false, inkMark, 1.3);
          // 肩胛骨
          line([torsoPt(0.784,150), torsoPt(0.750,144), torsoPt(0.714,156)], true, inkSoft, 1.0);
          line([torsoPt(0.784,-150), torsoPt(0.750,-144), torsoPt(0.714,-156)], true, inkSoft, 1.0);
          // 臀沟
          line([torsoPt(0.452,180), torsoPt(0.432,180), torsoPt(0.412,180)], false, inkSoft, 1.1);
        }
        // 五官（随头部一起转，只看正面）
        const eyeC = T.dark? 'rgba(6,20,26,.62)' : (T.anc? 'rgba(74,50,24,.48)' : 'rgba(18,54,56,.44)');
        markEllipse(headPt(0.916,20), 0.0092, 0.0042, 0.14, eyeC, .82);
        markEllipse(headPt(0.916,-20), 0.0092, 0.0042, -0.14, eyeC, .82);
        markEllipse(headPt(0.905,79), 0.0056, 0.0104, 0.05, T.ink, .40);
        markEllipse(headPt(0.905,-79), 0.0056, 0.0104, -0.05, T.ink, .40);
        // 鼻
        const n1=proj(headPt(0.906,0)), n2=proj(headPt(0.888,0));
        if(n1[2]>0.02){
          ctx.globalAlpha=.55; ctx.strokeStyle=T.ink; ctx.lineWidth=1.15;
          ctx.beginPath(); ctx.moveTo(n1[0],n1[1]); ctx.lineTo(n2[0],n2[1]); ctx.stroke();
          ctx.beginPath(); ctx.ellipse(n2[0], n2[1]+1.2, 2.6*scale*n2[3]/60, 1.1, 0,0,6.2832); ctx.stroke();
          ctx.globalAlpha=1;
        }
        // 口
        const m1=proj(headPt(0.876,9)), m2=proj(headPt(0.873,0)), m3=proj(headPt(0.876,-9));
        if(m2[2]>0.02){
          ctx.globalAlpha=.50; ctx.strokeStyle=T.ink; ctx.lineWidth=1.2;
          ctx.beginPath(); ctx.moveTo(m1[0],m1[1]); ctx.quadraticCurveTo(m2[0],m2[1]+1.6,m3[0],m3[1]); ctx.stroke();
          ctx.globalAlpha=1;
        }
      }

      /* 顶点一次性投影 */
      for(let i=0;i<VN;i++){
        const p=verts[i];
        const x=p[0]*cy - p[2]*sy, z0=p[0]*sy + p[2]*cy;
        const y = p[1]*cp - z0*sp, z = p[1]*sp + z0*cp;
        const per = 1/(1 - z*0.42);
        rotBuf[i*3]=x; rotBuf[i*3+1]=y; rotBuf[i*3+2]=z;
        scrX[i]=ox + x*scale*per;
        scrY[i]=oy - (y-0.5)*scale*per;
        scrP[i]=per;
      }

      /* 面：法线光照 + 背面剔除 + 与轮廓边一起按深度排序 */
      const NF = faces.length;
      for(let fi=0;fi<NF;fi++){
        const f=faces[fi], n=normals[fi];
        let z=0;
        for(let k=0;k<f.length;k++) z+=rotBuf[f[k]*3+2];
        fz[fi]=z/f.length;
        const nz = n[0]*sy + n[2]*cy;
        const ny2 = n[1]*cp - nz*sp, nz2 = n[1]*sp + nz*cp;
        fvis[fi] = nz2>0 ? 1:0;
        const nx2 = n[0]*cy - n[2]*sy;
        // 以「朝向观察者」为主的柔和立体光：正面亮、两侧渐暗，避免出现硬竖条
        const dir = 0.42 + 0.50*Math.max(0,nz2) + 0.10*Math.max(0,ny2) + 0.06*Math.max(0,nx2);
        flit[fi] = Math.min(1, dir);
      }
      let nOp=0;
      for(let fi=0;fi<NF;fi++){
        if(!fvis[fi]) continue;
        opKind[nOp]=0; opId[nOp]=fi; opZ[nOp]=fz[fi]; nOp++;
      }
      for(let ei=0;ei<edges.length;ei++){
        const e=edges[ei];
        if(e.f2<0) continue;
        if(parts[e.f1]!==parts[e.f2]) continue;         // 零件接缝不画轮廓
        if(fvis[e.f1]===fvis[e.f2]) continue;
        opKind[nOp]=1; opId[nOp]=ei;
        opZ[nOp]=fz[fvis[e.f1]? e.f1 : e.f2] + 0.004; nOp++;
      }
      opArr.length=nOp;
      for(let i=0;i<nOp;i++) opArr[i]=i;
      opArr.sort((a,b)=>opZ[a]-opZ[b]);

      ctx.lineCap='round';
      for(const oi of opArr){
        if(opKind[oi]===0){
          const fi=opId[oi], f=faces[fi];
          const lit=flit[fi];
          const k=Math.pow(lit,0.85);
          const col=mix(C.dark, C.base, 0.02+0.98*k);
          const col2=mix(col, C.hi, Math.max(0,lit-0.84)*1.8);
          ctx.fillStyle=css(col2);
          ctx.beginPath();
          ctx.moveTo(scrX[f[0]], scrY[f[0]]);
          for(let k2=1;k2<f.length;k2++) ctx.lineTo(scrX[f[k2]], scrY[f[k2]]);
          ctx.closePath(); ctx.fill();
          ctx.strokeStyle=ctx.fillStyle; ctx.lineWidth=0.7; ctx.stroke();
        } else {
          const e=edges[opId[oi]];
          ctx.strokeStyle=C.edge; ctx.lineWidth=1.05;
          ctx.beginPath();
          ctx.moveTo(scrX[e.a], scrY[e.a]); ctx.lineTo(scrX[e.b], scrY[e.b]);
          ctx.stroke();
        }
      }

      ctx.lineCap='round'; ctx.lineJoin='round';
      drawMarks();

      /* 经脉：右半身 + 左半身镜像（任督不镜像） */
      const lineW = state.mer? 3.0 : 2.0;
      ctx.lineCap='round'; ctx.lineJoin='round';
      for(const m of MER){
        if(state.mer && state.mer!==m.k) continue;
        for(const s of (m.mid?[1]:[1,-1])){
          const pts = m.pts.map(p=>proj([p[0]*s, p[1], p[2]]));
          ctx.strokeStyle=m.c; ctx.lineWidth=lineW;
          for(let i=0;i<pts.length-1;i++){
            const a=pts[i], b=pts[i+1];
            const z=(a[2]+b[2])/2;
            const al = Math.max(0, Math.min(1, (z+0.045)/0.075));
            if(al<0.06) continue;
            ctx.globalAlpha = al*0.95;
            ctx.beginPath(); ctx.moveTo(a[0],a[1]); ctx.lineTo(b[0],b[1]); ctx.stroke();
          }
          ctx.globalAlpha=1;
        }
      }

      /* 穴位：外描边保证在浅色人体上也清楚；悬停出准星 + 引线 + 名称 */
      const hits=[];
      for(const ac of (window.TY.acupoints||[])){
        const p=P[ac.n]; if(!p) continue;
        const mm = MER.find(x=>x.n.replace(/（.*?）/g,'')===ac.m);
        if(state.mer && !(mm && mm.k===state.mer)) continue;
        for(const sgn of (Math.abs(p[0])<0.006?[1]:[1,-1])){
          const pr=proj([p[0]*sgn, p[1], p[2]]);
          if(pr[2] < -0.004) continue;
          const isHover = state.hover && state.hover.n===ac.n;
          const base = (state.mer? 3.7 : 3.0) * (0.86 + pr[3]*0.24);
          const r = isHover? base*1.75 : base;
          ctx.beginPath(); ctx.arc(pr[0],pr[1],r+1.8,0,6.2832);
          ctx.fillStyle = T.dark? 'rgba(4,16,20,.90)' : 'rgba(255,255,255,.93)'; ctx.fill();
          ctx.beginPath(); ctx.arc(pr[0],pr[1],r,0,6.2832);
          ctx.fillStyle = isHover? T.accent : (mm? mm.c : T.brand); ctx.fill();
          if(isHover){
            ctx.strokeStyle=T.accent; ctx.lineWidth=1.15; ctx.globalAlpha=.9;
            ctx.beginPath(); ctx.arc(pr[0],pr[1],r+5.4,0,6.2832); ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(pr[0]-r-9,pr[1]); ctx.lineTo(pr[0]-r-4,pr[1]);
            ctx.moveTo(pr[0]+r+4,pr[1]); ctx.lineTo(pr[0]+r+9,pr[1]);
            ctx.moveTo(pr[0],pr[1]-r-9); ctx.lineTo(pr[0],pr[1]-r-4);
            ctx.moveTo(pr[0],pr[1]+r+4); ctx.lineTo(pr[0],pr[1]+r+9);
            ctx.stroke(); ctx.globalAlpha=1;
            // 引线 + 名称
            const right = pr[0] < W*0.55;
            const ex = pr[0] + (right? 34 : -34), ey = pr[1] - 28;
            ctx.strokeStyle=T.accent; ctx.lineWidth=1; ctx.globalAlpha=.8;
            ctx.beginPath(); ctx.moveTo(pr[0]+(right?r+9:-r-9), pr[1]-2); ctx.lineTo(ex, ey);
            ctx.lineTo(ex + (right? 14 : -14), ey); ctx.stroke(); ctx.globalAlpha=1;
            ctx.font='600 11px ui-monospace, SFMono-Regular, Menlo, monospace';
            const tw=ctx.measureText(ac.n).width;
            const bx = right? ex+14 : ex-14-tw-9;
            ctx.fillStyle = T.dark? 'rgba(6,20,24,.88)' : 'rgba(255,255,255,.95)';
            rr(bx-5, ey-10, tw+10, 16, 3); ctx.fill();
            ctx.strokeStyle=T.accent; ctx.lineWidth=1; ctx.stroke();
            ctx.fillStyle = T.dark? '#e4f7f6' : '#0b2026';
            ctx.textAlign='left'; ctx.textBaseline='alphabetic';
            ctx.fillText(ac.n, bx, ey+2);
          }
          hits.push({a:ac, x:pr[0], y:pr[1], front:true, r});
        }
      }
      state.hitMap = hits;

      /* 朝向徽标 + 提示 */
      const deg = ((yaw*180/Math.PI)%360+360)%360;
      const faceName = (deg<45 || deg>=315) ? '正面 FRONT'
        : deg<135 ? '右侧面 RIGHT' : deg<225 ? '背面 BACK' : '左侧面 LEFT';
      ctx.textBaseline='alphabetic'; ctx.textAlign='left';
      ctx.font='600 10.5px ui-monospace, SFMono-Regular, Menlo, monospace';
      const tw2 = ctx.measureText('◉ '+faceName).width + 20;
      ctx.fillStyle = T.dark? 'rgba(6,22,26,.72)' : 'rgba(255,255,255,.86)';
      rr(W-tw2-10, 10, tw2, 21, 4); ctx.fill();
      ctx.strokeStyle = T.dark? 'rgba(140,240,232,.26)' : 'rgba(20,80,80,.20)';
      ctx.lineWidth=1; ctx.stroke();
      ctx.fillStyle = T.brand; ctx.fillText('◉ '+faceName, W-tw2-2, 24);
      ctx.font='10px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.fillStyle=T.muted; ctx.textAlign='right';
      if(W>=560){
        ctx.fillText('共 '+hits.length+' 个穴位 · 拖拽旋转 · 双指/滚轮缩放 · 双击暂停', W-12, H-12);
      } else {
        ctx.fillText('共 '+hits.length+' 穴', W-12, H-12);
      }
    }

    function loop(){
      if(!state.alive) return;
      draw();
      requestAnimationFrame(loop);
    }

    /* 交互 */
    let lastTap=0;
    const pts = new Map();      // 多指（捏合缩放）
    let pinchD = 0, downAt = 0, moved = 0;
    const hitAt = (cx, cy) => {
      if(!state.hitMap.length) return null;
      const r = cv.getBoundingClientRect();
      const mx = cx - r.left, my = cy - r.top;
      let best = null, bd = 15*15;
      for(const h of state.hitMap){
        const d = (h.x-mx)**2 + (h.y-my)**2;
        if(d < bd){ bd = d; best = h; }
      }
      return best;
    };
    cv.addEventListener('pointerdown', e=>{
      pts.set(e.pointerId, {x:e.clientX, y:e.clientY});
      downAt = Date.now(); moved = 0;
      if(pts.size >= 2){
        /* 双指：进入捏合缩放，停止旋转 */
        const [a,b] = [...pts.values()];
        pinchD = Math.hypot(a.x-b.x, a.y-b.y);
        state.drag = false;
        cv.classList.remove('drag');
      }else{
        state.drag=true; state.px=e.clientX; state.py=e.clientY; cv.classList.add('drag');
      }
      try{ cv.setPointerCapture(e.pointerId); }catch(err){}
    });
    cv.addEventListener('pointermove', e=>{
      if(pts.has(e.pointerId)) pts.set(e.pointerId, {x:e.clientX, y:e.clientY});
      /* 双指捏合 → 缩放 */
      if(pts.size >= 2){
        const [a,b] = [...pts.values()];
        const d = Math.hypot(a.x-b.x, a.y-b.y);
        if(pinchD > 0 && d > 0) state.zoom = Math.max(0.5, Math.min(2.8, state.zoom * (d/pinchD)));
        pinchD = d;
        return;
      }
      if(state.drag){
        moved += Math.abs(e.clientX-state.px) + Math.abs(e.clientY-state.py);
        state.yaw += (e.clientX-state.px)*0.008;
        state.pitch = Math.max(-0.42, Math.min(0.5, state.pitch + (e.clientY-state.py)*0.005));
        state.px=e.clientX; state.py=e.clientY;
        return;
      }
      const best = hitAt(e.clientX, e.clientY);
      state.hover = best? best.a : null;
      cv.style.cursor = best? 'pointer' : (state.drag?'grabbing':'grab');
      if(cb) cb(best? {acu:best.a, x:e.clientX, y:e.clientY, kind:'acu'} : null);
    });
    const endDrag=()=>{ state.drag=false; cv.classList.remove('drag'); };
    cv.addEventListener('pointerup', e=>{
      pts.delete(e.pointerId);
      if(pts.size < 2) pinchD = 0;
      if(pts.size === 0) endDrag();
      /* 触屏：轻点穴位显示注解，点空白处收起（没有 hover 可依靠） */
      if(e.pointerType !== 'mouse' && moved < 12 && Date.now()-downAt < 420){
        const best = hitAt(e.clientX, e.clientY);
        state.hover = best? best.a : null;
        if(cb) cb(best? {acu:best.a, x:e.clientX, y:e.clientY, kind:'acu'} : null);
      }
    });
    cv.addEventListener('pointercancel', e=>{
      pts.delete(e.pointerId);
      if(pts.size < 2) pinchD = 0;
      endDrag();
    });
    cv.addEventListener('pointerleave', ()=>{ pts.clear(); pinchD=0; endDrag(); state.hover=null; if(cb) cb(null); });
    cv.addEventListener('wheel', e=>{
      e.preventDefault();
      state.zoom = Math.max(0.5, Math.min(2.8, state.zoom*(e.deltaY>0?0.94:1.06)));
    }, {passive:false});
    cv.addEventListener('click', ()=>{
      const now=Date.now();
      if(now-lastTap<280) state.auto=!state.auto;
      lastTap=now;
    });

    loop();
    const inst={
      setMer(k){ state.mer=k||null; },
      setAuto(v){ state.auto=!!v; },
      flip(){ state.yaw += Math.PI; },
      face(v){
        state.yaw = v==='back'? Math.PI : v==='left'? -Math.PI/2 : v==='right'? Math.PI/2 : 0;
        state.pitch = 0.05;
      },
      zoom(v){ state.zoom = Math.max(0.5, Math.min(2.8, v)); },
      state,
      destroy(){ state.alive=false; ro.disconnect(); cv.remove(); }
    };
    return inst;
  }

  window.Body3D = {mount, MER};
})();
