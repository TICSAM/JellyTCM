/* 穴位总表 · 合并与索引
   把 theory.js / acupoints-2.js 里的 72 穴与 acupoints-3~5.js 的 317 穴合并去重，
   同名以新数据（含编号、部位、特定穴、警示）为准，旧数据里的写意坐标与补充字段保留。
   结果写回 TY.acupoints，并按「经脉顺序 + 穴位编号」排好，供全站使用。
*/
(function(){
  const TY = window.TY = window.TY || {};
  const old = TY.acupoints || [];
  const more = window.ACU_MORE || [];
  const map = new Map();
  old.forEach(a => { if(a && a.n) map.set(a.n, Object.assign({}, a)); });
  more.forEach(a => { if(a && a.n) map.set(a.n, Object.assign({}, map.get(a.n) || {}, a)); });

  const ORDER = ['手太阴肺经','手阳明大肠经','足阳明胃经','足太阴脾经','手少阴心经','手太阳小肠经',
    '足太阳膀胱经','足少阴肾经','手厥阴心包经','手少阳三焦经','足少阳胆经','足厥阴肝经','督脉','任脉','经外奇穴'];
  const PT_ORDER = ['头面','颈项','胸腹','肩背腰','上肢','下肢'];
  const num = c => { const m = String(c == null ? '' : c).match(/(\d+)\s*$/); return m ? +m[1] : 999; };

  const list = [...map.values()].filter(a => ORDER.includes(a.m));
  list.sort((a, b) => ORDER.indexOf(a.m) - ORDER.indexOf(b.m) || num(a.c) - num(b.c) || a.n.localeCompare(b.n, 'zh'));

  const byName = {};
  list.forEach(a => byName[a.n] = a);

  const ALIAS = {
    '人中': '水沟', '虎口': '合谷', '丹田': '关元', '落枕穴': '外劳宫', '脐中': '神阙',
    '太阳穴': '太阳', '印堂穴': '印堂', '百劳': '颈百劳', '内关穴': '内关',
    '足三里穴': '足三里', '三阴交穴': '三阴交', '合谷穴': '合谷', '风池穴': '风池'
  };
  /* 常用推拿穴：数据里标了 t:1 的，加上一批默认常用的 */
  const TUINA = new Set(list.filter(a => a.t).map(a => a.n));
  ['太阳','印堂','百会','风池','肩井','大椎','中脘','神阙','气海','关元','天枢','肾俞','脾俞','胃俞',
   '合谷','内关','曲池','手三里','外关','足三里','三阴交','阴陵泉','血海','太冲','涌泉','委中','承山',
   '肺俞','心俞','膈俞','八髎','环跳','阳陵泉','梁丘','犊鼻','内庭','太溪','照海','丰隆'].forEach(n => {
    if(byName[n]) TUINA.add(n);
  });
  list.forEach(a => { if(TUINA.has(a.n)) a.t = 1; });

  const stats = {};
  ORDER.forEach(m => stats[m] = list.filter(a => a.m === m).length);

  window.ACU = {
    list, byName, order: ORDER, ptOrder: PT_ORDER, alias: ALIAS, stats,
    search(q){
      q = String(q || '').trim().toLowerCase();
      if(!q) return list;
      const target = ALIAS[q] || q;
      return list.filter(a =>
        a.n.includes(target) ||
        (a.c || '').toLowerCase().includes(q) ||
        (a.m || '').includes(q) ||
        (a.pt || '').includes(q) ||
        (a.ind || '').includes(q) ||
        (a.loc || '').includes(q) ||
        (a.sp || '').includes(q));
    }
  };
  TY.acupoints = list;
})();
