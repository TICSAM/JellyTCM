/* ============ 本地存储 + 艾宾浩斯记忆调度 ============ */
(function(){
  const KEY = 'jellytcm-v1';
  const LEGACY = ['tcm-study-v1'];   // 旧版键名，自动迁移
  // 艾宾浩斯复习间隔（分钟）：0→10分钟→1天→2天→4天→7天→15天→30天→60天→120天
  const BOX_MIN = [0, 10, 1440, 2880, 5760, 10080, 21600, 43200, 86400, 172800];
  const BOX_LABEL = ['新学','10分钟','1天','2天','4天','7天','15天','30天','60天','120天'];

  const DEF = { cards:{}, wrong:{}, daily:{}, streak:{last:'', days:0}, settings:{goal:10, mode:'mix', hideHint:false},
                rx:[] };   // rx：「我的方」——自己保存的组方，随备份一起导出

  function todayKey(d){
    d = d || new Date();
    const m = String(d.getMonth()+1).padStart(2,'0'), day = String(d.getDate()).padStart(2,'0');
    return `${d.getFullYear()}-${m}-${day}`;
  }
  function load(){
    try{
      let raw = localStorage.getItem(KEY);
      if(!raw){
        for(const k of LEGACY){
          const old = localStorage.getItem(k);
          if(old){ raw = old; try{ localStorage.setItem(KEY, old); }catch(e){} break; }
        }
      }
      if(!raw) return JSON.parse(JSON.stringify(DEF));
      const o = JSON.parse(raw);
      const base = JSON.parse(JSON.stringify(DEF));
      const out = Object.assign(base, o || {});
      out.cards = out.cards || {}; out.wrong = out.wrong || {}; out.daily = out.daily || {};
      out.settings = Object.assign(base.settings, out.settings||{});
      out.streak = Object.assign(base.streak, out.streak||{});
      out.rx = Array.isArray(out.rx) ? out.rx : [];
      return out;
    }catch(e){ return JSON.parse(JSON.stringify(DEF)); }
  }
  let S = load();
  function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); return true; }catch(e){ return false; } }
  function reset(){ S = JSON.parse(JSON.stringify(DEF)); save(); }

  /* ---- 卡片 ---- */
  function card(id){
    if(!S.cards[id]) S.cards[id] = {box:0, due:0, correct:0, wrong:0, seen:0, last:0, hist:[]};
    return S.cards[id];
  }
  function isNew(id){ return !S.cards[id] || S.cards[id].seen === 0; }
  function isDue(id, now){
    const c = S.cards[id];
    if(!c || !c.seen) return false;
    return c.due <= (now || Date.now());
  }
  function grade(id, ok){
    const c = card(id);
    c.seen = (c.seen||0) + 1;
    c.last = Date.now();
    c.hist.push(ok?1:0);
    if(c.hist.length>30) c.hist.shift();
    if(ok){
      c.correct++; c.box = Math.min(c.box+1, BOX_MIN.length-1);
      c.due = Date.now() + BOX_MIN[c.box]*60000;
      if(S.wrong[id]){
        S.wrong[id].streak = (S.wrong[id].streak||0)+1;
        if(S.wrong[id].streak >= 3) S.wrong[id].resolved = true;
      }
    }else{
      c.wrong++; c.box = 0;
      c.due = Date.now() + 5*60000;
      const w = S.wrong[id] || {count:0, streak:0, resolved:false};
      w.count++; w.streak = 0; w.resolved = false; w.last = Date.now();
      S.wrong[id] = w;
    }
    bumpDaily(ok);
    save();
    return c;
  }
  function bumpDaily(ok){
    const k = todayKey();
    if(!S.daily[k]) S.daily[k] = {new:0, review:0, correct:0, wrong:0};
    const d = S.daily[k];
    if(ok) d.correct++; else d.wrong++;
    // 连续打卡
    if(S.streak.last !== k){
      const y = new Date(Date.now()-86400000);
      S.streak.days = (S.streak.last === todayKey(y)) ? (S.streak.days||0)+1 : 1;
      S.streak.last = k;
    }
  }
  function touchNew(id){
    const c = card(id); c.seen = c.seen || 0;
    const k = todayKey();
    if(!S.daily[k]) S.daily[k] = {new:0, review:0, correct:0, wrong:0};
    save();
  }

  /* ---- 统计 ---- */
  function stats(total){
    const cards = S.cards, ids = Object.keys(cards);
    let learned=0, mastered=0, weak=0, dueCount=0, boxSum=0, answers=0;
    const now = Date.now();
    ids.forEach(id=>{
      const c = cards[id];
      answers += (c.correct||0)+(c.wrong||0);
      if(c.seen>0){ learned++; boxSum += c.box;
        if(c.box>=6) mastered++;
        if(c.box<=1) weak++;
        if(c.due<=now) dueCount++;
      }
    });
    const k = todayKey();
    const d = S.daily[k] || {new:0, review:0, correct:0, wrong:0};
    const wrongOpen = Object.keys(S.wrong).filter(id=>!S.wrong[id].resolved).length;
    const wrongTotal = Object.keys(S.wrong).length;
    return {
      total: total || 0, learned, mastered, weak, dueCount, wrongOpen, wrongTotal, answers,
      todayNew: d.new, todayReview: d.review, todayCorrect: d.correct, todayWrong: d.wrong,
      streak: S.streak.days || 0,
      accuracy: (d.correct+d.wrong) ? Math.round(d.correct*100/(d.correct+d.wrong)) : 0,
      avgBox: learned ? (boxSum/learned) : 0,
      goal: S.settings.goal || 10
    };
  }
  function bumpNew(){
    const k = todayKey();
    if(!S.daily[k]) S.daily[k] = {new:0, review:0, correct:0, wrong:0};
    S.daily[k].new++;
    save();
  }
  function bumpReview(){
    const k = todayKey();
    if(!S.daily[k]) S.daily[k] = {new:0, review:0, correct:0, wrong:0};
    S.daily[k].review++;
    save();
  }

  function boxLabel(b){ return BOX_LABEL[Math.min(b,BOX_LABEL.length-1)]; }
  /* 只计入每日统计，不建记忆卡片（用于六经理论题这类无法单独复习的题） */
  function touchAnswer(ok){ bumpDaily(ok); save(); }  function last7(){
    const out=[];
    for(let i=6;i>=0;i--){
      const dt = new Date(Date.now()-i*86400000);
      const k = todayKey(dt);
      const d = S.daily[k] || {new:0, review:0, correct:0, wrong:0};
      out.push({k, label:`${dt.getMonth()+1}/${dt.getDate()}`, ...d});
    }
    return out;
  }

  /* ---- 备份 / 迁移 ---- */
  function dump(){
    return JSON.stringify({ app:'JellyTCM', version:2, exportedAt:new Date().toISOString(), key:KEY, data:S }, null, 2);
  }
  function parseBackup(text){
    let o;
    try{ o = JSON.parse(text); }catch(e){ return {ok:false, msg:'不是合法的 JSON 文件'}; }
    const data = (o && o.data) ? o.data : o;
    if(!data || typeof data !== 'object' || !('cards' in data)) return {ok:false, msg:'缺少 cards 字段，可能不是本站备份文件'};
    return {ok:true, data, cards:Object.keys(data.cards||{}).length, at:(o && o.exportedAt)||''};
  }
  function restore(data, merge){
    const src = JSON.parse(JSON.stringify(data));
    src.cards = src.cards || {}; src.wrong = src.wrong || {}; src.daily = src.daily || {};
    if(merge){
      Object.keys(src.cards).forEach(id=>{
        const a = S.cards[id], b = src.cards[id];
        if(!a){ S.cards[id] = b; return; }
        a.box = Math.max(a.box||0, b.box||0);
        a.correct = (a.correct||0)+(b.correct||0);
        a.wrong = (a.wrong||0)+(b.wrong||0);
        a.seen = Math.max(a.seen||0, b.seen||0);
        a.due = Math.min(a.due||0, b.due||Date.now());
        a.last = Math.max(a.last||0, b.last||0);
        a.hist = ((a.hist||[]).concat(b.hist||[])).slice(-30);
      });
      Object.keys(src.wrong).forEach(id=>{
        const a = S.wrong[id], b = src.wrong[id];
        if(!a){ S.wrong[id] = b; return; }
        a.count = Math.max(a.count||0, b.count||0);
        a.streak = Math.max(a.streak||0, b.streak||0);
        a.resolved = !!(a.resolved && b.resolved);
        a.last = Math.max(a.last||0, b.last||0);
      });
      Object.keys(src.daily).forEach(k=>{
        const a = S.daily[k], b = src.daily[k];
        if(!a){ S.daily[k] = b; return; }
        a.new = Math.max(a.new||0, b.new||0);
        a.review = Math.max(a.review||0, b.review||0);
        a.correct = Math.max(a.correct||0, b.correct||0);
        a.wrong = Math.max(a.wrong||0, b.wrong||0);
      });
      if(((src.streak||{}).days||0) > (S.streak.days||0)){
        S.streak.days = src.streak.days;
        S.streak.last = src.streak.last || S.streak.last;
      }
      /* 我的方：按 id 取并集，同一首谁新用谁 */
      const rxMap = new Map((S.rx||[]).map(x=>[x.id, x]));
      (src.rx||[]).forEach(x=>{
        if(!x || !x.id) return;
        const old = rxMap.get(x.id);
        if(!old || (x.updated||x.at||0) > (old.updated||old.at||0)) rxMap.set(x.id, x);
      });
      S.rx = [...rxMap.values()];
    }else{
      S = Object.assign(JSON.parse(JSON.stringify(DEF)), src);
      S.settings = Object.assign(JSON.parse(JSON.stringify(DEF.settings)), src.settings||{});
      S.streak = Object.assign(JSON.parse(JSON.stringify(DEF.streak)), src.streak||{});
      S.rx = Array.isArray(src.rx) ? src.rx : [];
    }
    save();
    return true;
  }

  window.Store = {
    KEY, get state(){ return S; },
    dump, parseBackup, restore,
    save, reset, card, isNew, isDue, grade, stats, bumpNew, bumpReview, touchAnswer,
    touchNew, boxLabel, last7, todayKey,
    wrongList(){ return Object.keys(S.wrong).filter(id=>!S.wrong[id].resolved).map(id=>({id, ...S.wrong[id]})); },
    wrongAll(){ return Object.keys(S.wrong).map(id=>({id, ...S.wrong[id]})); },
    removeWrong(id){ if(S.wrong[id]){ S.wrong[id].resolved = true; save(); } },
    settings(){ return S.settings; },
    setSetting(k,v){ S.settings[k]=v; save(); },

    /* ---- 我的方 ---- */
    rxList(){
      return (S.rx||[]).slice().sort((a,b)=>(b.updated||b.at||0)-(a.updated||a.at||0));
    },
    rxGet(id){ return (S.rx||[]).find(x=>x.id===id) || null; },
    rxUpsert(item){
      if(!item || !item.id) return null;
      const i = (S.rx||[]).findIndex(x=>x.id===item.id);
      const rec = Object.assign({}, item);
      if(i >= 0){
        rec.at = S.rx[i].at || item.at || Date.now();
        rec.updated = Date.now();
        S.rx[i] = rec;
      }else{
        rec.at = item.at || Date.now();
        rec.updated = rec.updated || rec.at;
        S.rx.push(rec);
      }
      save();
      return rec;
    },
    rxRemove(id){
      S.rx = (S.rx||[]).filter(x=>x.id!==id);
      save();
    },
    rxRename(id, name){
      const it = (S.rx||[]).find(x=>x.id===id);
      if(!it) return false;
      it.name = String(name||'').slice(0,40) || it.name;
      it.updated = Date.now();
      save();
      return true;
    },
    /* 导入：按 id 合并，返回新增 / 更新条数 */
    rxImport(list){
      if(!Array.isArray(list)) return {added:0, updated:0, bad:true};
      let added = 0, updated = 0;
      list.forEach(x=>{
        if(!x || typeof x !== 'object' || !x.raw) return;
        const item = {
          id: x.id || ('rx'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)),
          name: String(x.name||'未命名方').slice(0,40),
          raw: String(x.raw),
          n: parseInt(x.n,10)||0, total: Math.round(parseFloat(x.total)||0),
          level: x.level||'', doc: x.doc||'',
          at: parseInt(x.at,10)||Date.now(), updated: parseInt(x.updated,10)||Date.now()
        };
        const i = S.rx.findIndex(y=>y.id===item.id);
        if(i >= 0){ S.rx[i] = item; updated++; } else { S.rx.push(item); added++; }
      });
      save();
      return {added, updated};
    }
  };
})();
