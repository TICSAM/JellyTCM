/* ============ 出题引擎 ============ */
(function(){
  const FM = window.FM || [];
  const byId = {}; FM.forEach(f=>byId[f.n]=f);
  const CN = {'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10,'半':0.5};

  function parseLiang(ga){
    if(!ga) return 0;
    if(/等分|适量|少许/.test(ga)) return 0;
    const m = ga.match(/^([一二三四五六七八九十半]+)\s*两/);
    if(!m) return 0;
    const s = m[1];
    if(s === '半') return 0.5;
    let total = 0;
    if(s.includes('十')){
      const parts = s.split('十');
      total = (parts[0]?CN[parts[0]]:1)*10 + (parts[1]?CN[parts[1]]:0);
    }else total = CN[s]||0;
    return total;
  }
  function shuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
  function pick(arr,n,exclude){ const pool = arr.filter(x=>x!==exclude); return shuffle(pool).slice(0,n); }
  function herbsOf(f){ return f.c.map(x=>x.h).filter(h=>!/^（/.test(h)); }
  function ga(t){ return String(t||'').replace(/（[^）]*）/g,'').replace(/\s+/g,'').trim(); }

  /* 找同分类/近似的干扰方 */
  function siblings(f){
    const same = FM.filter(x=>x!==f && x.cat===f.cat);
    const sameLiu = FM.filter(x=>x!==f && x.liu===f.liu && x.cat!==f.cat);
    return same.length>=3 ? same : same.concat(sameLiu);
  }

  /* ---- 类型1：方名 → 药物组成 ---- */
  function qF2H(f){
    const names = herbsOf(f);
    const correct = names.join('、');
    const sibs = siblings(f);
    const opts = new Set([correct]);
    let guard = 0;
    while(opts.size < 4 && guard++ < 60){
      const other = (sibs.length?sibs:FM)[Math.floor(Math.random()* (sibs.length?sibs.length:FM.length))];
      const otherNames = herbsOf(other);
      let arr = names.slice();
      const mode = Math.random();
      if(mode < 0.6 && otherNames.length){
        // 换掉一味
        const outIdx = Math.floor(Math.random()*arr.length);
        const cand = otherNames.filter(h=>!arr.includes(h));
        if(!cand.length) continue;
        arr[outIdx] = cand[Math.floor(Math.random()*cand.length)];
      }else if(mode < 0.85){
        // 少一味
        if(arr.length<=3) continue;
        arr.splice(Math.floor(Math.random()*arr.length),1);
      }else{
        // 多一味
        const cand = otherNames.filter(h=>!arr.includes(h));
        if(!cand.length) continue;
        arr.push(cand[Math.floor(Math.random()*cand.length)]);
      }
      opts.add(arr.join('、'));
    }
    const options = shuffle([...opts]);
    return {
      type:'方名 → 药物', fid:f.n,
      title:`【${f.n}】的药物组成是？`,
      sub:`${f.book} · ${f.cat}`,
      options, answer: options.indexOf(correct),
      explain:`${f.n}（${f.book}${f.ch?'·'+f.ch:''}）：` + f.c.map(x=>`${x.h}${ga(x.ga)}（${x.r}）`).join('、'),
      extra:'君药：' + (f.c.find(x=>x.r.includes('君'))||{}).h
    };
  }

  /* ---- 类型2：药物组成 → 方名 ---- */
  function qH2F(f){
    const names = shuffle(herbsOf(f));
    const correct = f.n;
    const sibs = siblings(f);
    const pool = (sibs.length>=3?sibs:FM).filter(x=>x.n!==f.n);
    const options = shuffle([correct, ...pick(pool.map(x=>x.n),3)]);
    return {
      type:'药物 → 方名', fid:f.n,
      title:`由【${names.join('、')}】组成的方剂是？`,
      sub:`共 ${names.length} 味`,
      options, answer: options.indexOf(correct),
      explain:`${f.n}：${f.eff}。主治：${f.ind}`,
      extra:`出处：${f.book}${f.ch?'·'+f.ch:''}`
    };
  }

  /* ---- 类型3：功效主治 → 方名 ---- */
  function qEffect(f){
    const correct = f.n;
    const sibs = siblings(f);
    const pool = (sibs.length>=3?sibs:FM).filter(x=>x.n!==f.n);
    const options = shuffle([correct, ...pick(pool.map(x=>x.n),3)]);
    return {
      type:'功效 → 方名', fid:f.n,
      title:`功效为「${f.eff}」，主治${f.ind.split('。')[0]}，应选：`,
      sub:f.liu || '',
      options, answer: options.indexOf(correct),
      explain:`${f.n}　${f.eff}`,
      extra:`组成：${herbsOf(f).join('、')}`
    };
  }

  /* ---- 类型4：用量比例 → 方名 ---- */
  function qRatio(f){
    const rows = f.c.map(x=>({h:x.h, n:parseLiang(x.ga), ga:x.ga})).filter(x=>x.n>0);
    if(rows.length < 3) return null;
    if(new Set(rows.map(r=>r.n)).size < 2) return null;
    const use = rows.slice(0,4);
    const correct = f.n;
    const sibs = siblings(f);
    const pool = (sibs.length>=3?sibs:FM).filter(x=>x.n!==f.n);
    const options = shuffle([correct, ...pick(pool.map(x=>x.n),3)]);
    return {
      type:'用量比例 → 方名', fid:f.n,
      title:'原方用量比例为「' + use.map(x=>`${x.h} ${x.n}`).join(' : ') + '」的方剂是？',
      sub:'按《' + f.book + '》原方折算比例',
      options, answer: options.indexOf(correct),
      explain:`${f.n}原方：` + f.c.map(x=>`${x.h} ${x.ga}`).join('、'),
      extra:`现代参考：` + f.c.map(x=>`${x.h}${x.g}`).join('、')
    };
  }

  /* ---- 类型5：不含哪味药 ---- */
  function qMissing(f){
    const names = herbsOf(f);
    if(names.length < 4) return null;
    const sibs = siblings(f);
    const pool = (sibs.length?sibs:FM).filter(x=>x.n!==f.n);
    let notIn = null, src = null;
    for(const s of shuffle(pool)){
      const cand = herbsOf(s).filter(h=>!names.includes(h));
      if(cand.length){ notIn = cand[Math.floor(Math.random()*cand.length)]; src = s; break; }
    }
    if(!notIn) return null;
    const others = pick(names.filter(h=>h!==notIn), 3);
    const options = shuffle([notIn, ...others]);
    if(new Set(options).size !== 4) return null;
    return {
      type:'组成鉴别', fid:f.n,
      title:`下列哪味药不属于【${f.n}】的组成？`,
      sub:`提示：${f.cat}`,
      options, answer: options.indexOf(notIn),
      explain:`${f.n}由 ${names.join('、')} 组成；「${notIn}」是${src.n}的药物。`,
      extra:`${f.n}：${f.eff}`
    };
  }

  /* ---- 类型6：出处 ---- */
  function qSource(f){
    const books = [...new Set(FM.map(x=>x.book))];
    const correct = f.book;
    if(books.length < 4) return null;
    const options = shuffle([correct, ...pick(books.filter(b=>b!==correct),3)]);
    return {
      type:'出处', fid:f.n,
      title:`【${f.n}】出自下列哪部医籍？`,
      sub:f.eff,
      options, answer: options.indexOf(correct),
      explain:`${f.n}出自《${f.book}》${f.ch ? '·'+f.ch : ''}。`,
      extra:`组成：${herbsOf(f).join('、')}`
    };
  }

  /* ---- 类型7：六经理论 ---- */
  function qLiujing(item){
    const LJ = window.TY.liujing;
    const others = LJ.filter(x=>x.key!==item.key);
    const mode = Math.floor(Math.random()*3);
    if(mode===0){
      const options = shuffle([item.name, ...pick(others.map(x=>x.name),3)]);
      return {
        type:'六经提纲', fid:'__lj_'+item.key,
        title:`「${item.gang}」是哪一经的提纲证？`,
        sub:'《伤寒论》原文',
        options, answer: options.indexOf(item.name),
        explain:`${item.name}提纲：${item.gang}\n病机：${item.essence}`,
        extra:item.sub
      };
    }
    if(mode===1){
      const options = shuffle([item.gang, ...pick(others.map(x=>x.gang),3)]);
      return {
        type:'六经提纲', fid:'__lj_'+item.key,
        title:`【${item.name}】的提纲证是？`,
        sub:item.sub,
        options, answer: options.indexOf(item.gang),
        explain:`${item.name}：${item.essence}`,
        extra:'治法：' + item.treat
      };
    }
    const fangList = item.fang;
    const right = fangList[Math.floor(Math.random()*fangList.length)];
    const allFang = FM.map(x=>x.n);
    const options = shuffle([right, ...pick(allFang.filter(n=>!fangList.includes(n)),3)]);
    return {
      type:'六经主方', fid:'__lj_'+item.key,
      title:`下列方剂中，主治【${item.name}】的是？`,
      sub:item.treat,
      options, answer: options.indexOf(right),
      explain:`${item.name}主方：${fangList.join('、')}。${item.essence}`,
      extra:'主症：' + item.symptoms.join('、')
    };
  }

  /* ---- 类型8：王付基础方（证素认方 / 合方叠加 / 归属） ---- */
  const BASE = (window.WANGFU && window.WANGFU.base) || [];
  const STACK = (window.WANGFU && window.WANGFU.stack) || [];
  const baseNames = BASE.map(x=>x[0]);
  function qBaseBase(){
    if(BASE.length < 4) return null;
    const [nm, tag] = BASE[Math.floor(Math.random()*BASE.length)];
    const options = shuffle([nm, ...pick(baseNames.filter(x=>x!==nm),3)]);
    return {
      type:'基础方 · 证素认方', fid:'__wf_'+nm,
      title:`按王付「基础方」思路：治【${tag}】的基础方是？`,
      sub:'王付《学用经方的思路与方法》',
      options, answer: options.indexOf(nm),
      explain:`王付：${tag}的基础方是【${nm}】。基础方针对病变属性，而不局限于病变部位——凡见${tag}，都可首先考虑它。`,
      extra:'基础方共 15 个，见方剂库「★ 基础方」筛选'
    };
  }
  function qBaseStack(){
    if(!STACK.length) return null;
    const s = STACK[Math.floor(Math.random()*STACK.length)];
    const wrong = [];
    let guard = 0;
    while(wrong.length < 3 && guard++ < 80){
      const other = STACK[Math.floor(Math.random()*STACK.length)];
      if(other!==s && !wrong.some(w=>w.join()===other.ans.join())) wrong.push(other.ans);
    }
    while(wrong.length < 3){
      const r = shuffle(baseNames).slice(0, s.ans.length).join(' + ');
      if(r!==s.ans.join(' + ')) wrong.push(shuffle(baseNames).slice(0, s.ans.length));
    }
    const options = shuffle([s.ans.join(' + '), ...wrong.map(w=>w.join(' + '))]);
    return {
      type:'基础方 · 合方叠加', fid:'__wf_stack'+STACK.indexOf(s),
      title:`患者：${s.sit}\n按王付「基础方叠加」思路，应合用哪组基础方？`,
      sub:'基础方针对病变属性，合方针对并存证素',
      options, answer: options.indexOf(s.ans.join(' + ')),
      explain:`应选【${s.ans.join(' + ')}】。${s.why}`,
      extra:'思路：先辨属性，再选基础方；证素并存就叠加合方'
    };
  }
  function qBaseWhich(){
    if(BASE.length < 4) return null;
    const [nm, tag] = BASE[Math.floor(Math.random()*BASE.length)];
    const tags = BASE.map(x=>x[1]).filter(x=>x!==tag);
    const options = shuffle([tag, ...pick(tags,3)]);
    return {
      type:'基础方 · 归属', fid:'__wf_w'+nm,
      title:`王付把【${nm}】用作哪类基础方？`,
      sub:'王付《学用经方的思路与方法》',
      options, answer: options.indexOf(tag),
      explain:`【${nm}】是${tag}的基础方。`,
      extra:'见方剂库「★ 基础方」筛选，或搜「基础方」'
    };
  }

  /* ---- 组装 ---- */
  function makeOne(f, mode, noTheory){
    const builders = [qF2H, qH2F, qEffect, qMissing, qSource];
    if(mode==='ratio') builders.unshift(qRatio);
    if(mode==='mix' && !noTheory && Math.random()<0.15) return qLiujing(window.TY.liujing[Math.floor(Math.random()*6)]);
    if(mode==='f2h') return qF2H(f);
    if(mode==='h2f') return qH2F(f);
    if(mode==='effect') return qEffect(f);
    if(mode==='ratio') return qRatio(f) || qH2F(f);
    if(mode==='missing') return qMissing(f) || qH2F(f);
    // mix
    for(let i=0;i<8;i++){
      const b = builders[Math.floor(Math.random()*builders.length)];
      const q = b(f);
      if(q) return q;
    }
    return qEffect(f) || qH2F(f);
  }

  function makeQuiz(opts){
    const n = opts.n || 10, mode = opts.mode || 'mix';
    let pool = opts.ids ? opts.ids.map(id=>byId[id]).filter(Boolean) : FM.slice();
    if(opts.filter) pool = pool.filter(opts.filter);
    pool = shuffle(pool);
    if(mode==='liujing'){
      return shuffle(window.TY.liujing).slice(0, Math.min(n,6)).map(it=>qLiujing(it));
    }
    if(mode==='base'){
      const gen = [qBaseBase, qBaseStack, qBaseWhich];
      const qs = [];
      let g = 0;
      while(qs.length < n && g++ < 300){
        const q = gen[Math.floor(Math.random()*gen.length)]();
        if(q && !qs.some(x=>x.title===q.title)) qs.push(q);
      }
      return shuffle(qs).slice(0, n);
    }
    const single = pool.length === 1;
    const qs = [];
    let i = 0;
    while(qs.length < n && i < n*6 && pool.length){
      const f = single ? pool[0] : pool[i % pool.length];
      const q = makeOne(f, mode, single);
      if(q && !qs.some(x=>x.fid===q.fid && x.type===q.type)) qs.push(q);
      i++;
    }
    let guard = 0;
    while(qs.length < n && guard++ < 120){
      const f = single ? pool[0] : FM[Math.floor(Math.random()*FM.length)];
      const q = makeOne(f, mode, single);
      if(q) qs.push(q);
    }
    return qs.slice(0, n);
  }

  window.Quiz = {make:makeQuiz, byId, herbsOf, parseLiang, shuffle};
})();
