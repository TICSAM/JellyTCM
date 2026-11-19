/* ================= 十二经脉循行流注动画 =================
 * 交互约定：鼠标停在图上或说明文字上 → 暂停；移开 → 从原处继续。
 * 手动「暂停」按钮则完全停止，移开鼠标也不会自己跑起来。
 */
(function(){
  const ORDER = ['LU','LI','ST','SP','HT','SI','BL','KI','PC','TE','GB','LR'];
  const SX = {LU:'寅时 3–5点',LI:'卯时 5–7点',ST:'辰时 7–9点',SP:'巳时 9–11点',HT:'午时 11–13点',SI:'未时 13–15点',
    BL:'申时 15–17点',KI:'酉时 17–19点',PC:'戌时 19–21点',TE:'亥时 21–23点',GB:'子时 23–1点',LR:'丑时 1–3点'};
  const SHORT = {LU:'肺',LI:'大肠',ST:'胃',SP:'脾',HT:'心',SI:'小肠',BL:'膀胱',KI:'肾',PC:'心包',TE:'三焦',GB:'胆',LR:'肝'};
  const DUR = 1900;      // 单经循行时长 ms
  const HOLD = 340;      // 走完后停顿

  let raf = null, idx = 0, cur = 'LU', lines = {};
  let wantPlay = false;   // 用户是否希望播放（不受悬停影响）
  let elapsed = 0, holdT = 0, lastTs = 0;
  const holds = new Set();// 悬停等原因的临时挂起

  const $ = s => document.querySelector(s);
  const svgEl = () => document.getElementById('merSvg');
  const active = () => wantPlay && holds.size === 0;

  function collect(){
    lines = {};
    const s = svgEl(); if(!s) return false;
    s.querySelectorAll('.mer-line').forEach(g=>{ lines[g.dataset.k] = g; });
    return Object.keys(lines).length > 0;
  }

  function reveal(k){
    cur = k;
    // 经脉信息面板与流注条同步（__merShow 会更新右侧文字与图例高亮）
    if(window.__merShow) window.__merShow(k);
    const strip = $('#merStrip');
    if(strip) strip.querySelectorAll('.ms-item').forEach(b=>b.classList.toggle('on', b.dataset.k === k));
    Object.keys(lines).forEach(kk=>{
      const g = lines[kk], so = kk === k;
      g.style.opacity = so ? '1' : (kk === 'REN' ? '.6' : '.28');
      const tr = g.querySelector('.mer-trace');
      if(tr) tr.setAttribute('stroke-dasharray', '0 9999');
      const d = g.querySelector('.flow-dot'), gl = g.querySelector('.flow-glow');
      if(d) d.setAttribute('r', '0');
      if(gl) gl.setAttribute('r', '0');
    });
    const box = $('#merNow');
    if(box){
      const m = (window.TY && TY.meridians || []).find(x=>x.abbr === k) || {};
      box.innerHTML = `<span class="mn-i">${idx+1} / 12</span>
        <b class="mn-n">${m.n || k}</b>
        <span class="tag">${SX[k]}</span>
        <span class="mn-x">${m.xing || ''}</span>`;
    }
  }

  function paint(p){
    const g = lines[cur]; if(!g) return;
    const path = g.querySelector('.mer-base'); if(!path) return;
    let L = 0;
    try{ L = path.getTotalLength(); }catch(e){ return; }
    if(!L) return;
    const tr = g.querySelector('.mer-trace');
    if(tr) tr.setAttribute('stroke-dasharray', `${L*p} ${L}`);
    const pt = path.getPointAtLength(L*p);
    const d = g.querySelector('.flow-dot'), gl = g.querySelector('.flow-glow');
    if(d){ d.setAttribute('cx', pt.x); d.setAttribute('cy', pt.y); d.setAttribute('r', '3.5'); }
    if(gl){ gl.setAttribute('cx', pt.x); gl.setAttribute('cy', pt.y); gl.setAttribute('r', '8'); }
  }

  function tick(ts){
    if(!active()){ raf = null; return; }
    if(!lastTs) lastTs = ts;
    const dt = Math.min(80, ts - lastTs);   // 切标签页回来时 dt 会很大，钳住避免跳经
    lastTs = ts;
    if(elapsed < DUR){
      elapsed = Math.min(DUR, elapsed + dt);
      paint(elapsed / DUR);
    }else{
      holdT += dt;
      if(holdT >= HOLD){
        holdT = 0; elapsed = 0;
        idx = (idx + 1) % ORDER.length;
        reveal(ORDER[idx]);
        paint(0);
      }
    }
    raf = requestAnimationFrame(tick);
  }
  function ensureRun(){
    if(active() && !raf){ lastTs = 0; raf = requestAnimationFrame(tick); }
  }
  function stopRun(){
    if(raf){ cancelAnimationFrame(raf); raf = null; }
    lastTs = 0;
  }
  function setHoldLabel(){
    const el = $('#merHold');
    if(!el) return;
    el.textContent = holds.size ? '悬停暂停中 · 移开继续' : '悬停图或文字即暂停';
    el.classList.toggle('on', holds.size > 0);
  }

  function play(){
    if(!collect()) return;
    wantPlay = true;
    const b = $('#merPlay'); if(b) b.innerHTML = '⏸ 暂停';
    ensureRun();
  }
  function pause(){
    wantPlay = false;
    stopRun();
    const b = $('#merPlay'); if(b) b.innerHTML = '▶ 播放';
  }
  function hold(k){ holds.add(k); stopRun(); setHoldLabel(); }
  function release(k){ holds.delete(k); setHoldLabel(); ensureRun(); }
  function jump(k){
    idx = Math.max(0, ORDER.indexOf(k));
    reveal(k); paint(0);
    elapsed = 0; holdT = 0;
  }

  function bindHover(el, key){
    if(!el) return;
    el.addEventListener('pointerenter', ()=>hold(key));
    el.addEventListener('pointerleave', ()=>release(key));
    // 触屏没有 hover：按下时暂停，抬起后继续
    el.addEventListener('pointerdown', ()=>hold(key+':touch'));
    el.addEventListener('pointerup', ()=>release(key+':touch'));
    el.addEventListener('pointercancel', ()=>release(key+':touch'));
  }

  function init(){
    if(!collect()) return;   // 非经脉图页面
    const playBtn = $('#merPlay');
    if(playBtn) playBtn.onclick = ()=> wantPlay ? pause() : play();
    const stepBtn = $('#merStep');
    if(stepBtn) stepBtn.onclick = ()=>{ pause(); idx = (idx+1) % ORDER.length; reveal(ORDER[idx]); paint(0); };
    const stopBtn = $('#merStop');
    if(stopBtn) stopBtn.onclick = ()=>{ pause(); idx = 0; reveal(ORDER[0]); paint(0); };
    const strip = $('#merStrip');
    if(strip) strip.querySelectorAll('.ms-item').forEach(b=>{
      b.onclick = ()=>{ pause(); jump(b.dataset.k); };
    });

    /* 悬停暂停：整张动画卡（含说明与流注条）+ 上方经脉图所在卡片 */
    bindHover($('.mer-anim'), 'card');
    const svg = svgEl();
    if(svg) bindHover(svg.closest('.card'), 'fig');

    idx = 0;
    reveal(ORDER[0]);
    paint(0);
    setHoldLabel();
    holds.clear();
    play();                  // 进入即自动演示一遍
  }

  window.MERANIM = {
    init,
    select(k){ if(!lines[k]) return false; pause(); jump(k); return true; },
    destroy(){ pause(); holds.clear(); lines = {}; setHoldLabel(); }
  };
  window.__merAnim = window.MERANIM;
  window.__merMeta = {ORDER, SX, SHORT};
})();
