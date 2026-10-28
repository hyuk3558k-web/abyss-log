'use strict';
// =====================================================================
//  화면: 타이틀, 프롤로그, 캠프(탐사·상점·개조·도감), 신문, 결과
// =====================================================================
const UI = (() => {
  const $ = id => document.getElementById(id);
  const S = GAME.SAVE;
  const V3 = THREE.Vector3;
  const SCREENS = ['title', 'prologue', 'hub', 'pause', 'death', 'news', 'result', 'loading'];
  if (GAME.isTouch) document.body.classList.add('touch');
  function only(name) { SCREENS.forEach(s => $(s).hidden = s !== name); }
  function hideAll() { only(null); }
  const fmt = n => Math.round(n).toLocaleString();
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---------------------------------------------------------------
  //  메뉴 배경 (손전등에 비친 총과 어둠 속 눈빛)
  // ---------------------------------------------------------------
  const menu = { scene: new THREE.Scene(), cam: new THREE.PerspectiveCamera(40, innerWidth / innerHeight, .01, 60), t: 0, gun: null, gunId: null };
  menu.scene.fog = new THREE.FogExp2(0x07080a, .09); menu.scene.background = new THREE.Color(0x07080a);
  menu.cam.position.set(0, .35, 1.25); menu.cam.lookAt(0, .1, 0);
  const ms = new THREE.SpotLight(0xfff0d8, 3, 8, .45, .6, 1.5); ms.position.set(.6, 2, 1.4); ms.target.position.set(0, 0, 0); menu.scene.add(ms, ms.target);
  menu.scene.add(new THREE.HemisphereLight(0x405060, 0x100804, .5));
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20, 30, 30), new THREE.MeshStandardMaterial({ color: 0x3a342c, roughness: 1, flatShading: true }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -.12;
  const fp = floor.geometry.attributes.position; for (let i = 0; i < fp.count; i++) fp.setZ(i, Math.random() * .08); floor.geometry.computeVertexNormals();
  menu.scene.add(floor);
  const eyes = new THREE.Group(); menu.scene.add(eyes);
  [[-1.6, .5, -4], [1.9, .3, -5.5], [.4, 1.1, -7]].forEach(([x, y, z], i) => {
    [-.07, .07].forEach(dx => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: WORLD.getGlow(), color: [0xff4a20, 0x60fff0, 0xb070ff][i], blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); s.scale.setScalar(.18); s.position.set(x + dx, y, z); eyes.add(s); });
  });
  function setMenuGun(id) {
    if (menu.gunId === id) return;
    if (menu.gun) menu.scene.remove(menu.gun);
    const v = GUNVIEW.build(GUN[id], GAME.modsOf(id), false);
    menu.gun = new THREE.Group(); menu.gun.add(v.root);
    fit(v.root, .9); menu.scene.add(menu.gun); menu.gunId = id;
  }
  function fit(obj, size) {
    const box = new THREE.Box3().setFromObject(obj), c = box.getCenter(new V3()), s = box.getSize(new V3());
    const k = size / Math.max(s.x, s.y, s.z, .001);
    obj.scale.setScalar(k); obj.position.copy(c).multiplyScalar(-k);
  }
  function menuRender(dt) {
    menu.t += dt;
    if (menu.gun) { menu.gun.rotation.y = -1.2 + Math.sin(menu.t * .3) * .5; menu.gun.position.y = .1 + Math.sin(menu.t * .8) * .015; }
    eyes.children.forEach((e, i) => e.visible = Math.sin(menu.t * .7 + i * 1.7) > -.6);
    ms.intensity = Math.random() < .004 ? .6 : 3;
    const r = GAME.renderer; r.clear(); r.render(menu.scene, menu.cam);
  }
  addEventListener('resize', () => { menu.cam.aspect = innerWidth / innerHeight; menu.cam.updateProjectionMatrix(); });

  // ---------------------------------------------------------------
  //  미리보기 (상점 · 개조 · 도감)
  // ---------------------------------------------------------------
  const pv = { r: null, scene: new THREE.Scene(), cam: new THREE.PerspectiveCamera(30, 1.6, .01, 50), obj: null, box: null, t: 0, active: false };
  pv.scene.add(new THREE.HemisphereLight(0xc8d0e0, 0x302820, .9));
  const pk = new THREE.DirectionalLight(0xfff0dd, 1.3); pk.position.set(1, 2, 2); pv.scene.add(pk);
  const pr = new THREE.DirectionalLight(0x6ad8ff, .6); pr.position.set(-2, 1, -2); pv.scene.add(pr);
  function ensurePv() {
    if (pv.r) return;
    pv.r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    pv.r.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); pv.r.outputEncoding = THREE.sRGBEncoding;
    pv.r.toneMapping = THREE.ACESFilmicToneMapping; pv.r.toneMappingExposure = 1.2;
    const loop = () => { requestAnimationFrame(loop); if (!pv.active || !pv.obj || !pv.box || !pv.box.isConnected) return; pv.t += .016; pv.obj.rotation.y = pv.spin ? pv.t * .5 : -1.25 + Math.sin(pv.t * .5) * .45; sizePv(); pv.r.render(pv.scene, pv.cam); };
    loop();
  }
  function sizePv() {
    const w = pv.box.clientWidth, h = pv.box.clientHeight;
    if (!w || !h) return;
    const c = pv.r.domElement;
    if (c.width !== Math.floor(w * pv.r.getPixelRatio()) || c.height !== Math.floor(h * pv.r.getPixelRatio())) { pv.r.setSize(w, h, false); pv.cam.aspect = w / h; pv.cam.updateProjectionMatrix(); }
  }
  function showPreview(box, obj, opts) {
    ensurePv();
    if (pv.obj) pv.scene.remove(pv.obj);
    const holder = new THREE.Group(); holder.add(obj); fit(obj, 1);
    pv.obj = holder; pv.scene.add(holder); pv.box = box; pv.active = true; pv.spin = !!(opts && opts.spin);
    pv.cam.position.set(0, .25, 1.9); pv.cam.lookAt(0, 0, 0);
    box.appendChild(pv.r.domElement); sizePv();
  }
  function gunObj(id, mods) { return GUNVIEW.build(GUN[id], mods || GAME.modsOf(id), false).root; }
  function creatureObj(sp) {
    const o = CREATURES.buildModel(sp); o.g.rotation.y = 0;
    if (o.anim) o.anim({ t: 1, vel: new V3(), crouch: 0, jaw: .3, wind: 0 }, 0);
    return o.g;
  }

  // ---------------------------------------------------------------
  //  타이틀
  // ---------------------------------------------------------------
  function showTitle() {
    GAME.state = 'menu';
    setMenuGun(S.loadout[0] || 'glock17');
    only('title');
    $('btnContinue').hidden = !S.started;
    $('btnNew').textContent = S.started ? '처음부터' : '시작하기';
    $('newConfirm').hidden = true;
    // 마지막 임무까지 끝냈으면 처음 화면에도 다음 편 안내
    const sb = $('sequelBox');
    if (sb) {
      const cleared = typeof SEQUEL !== 'undefined' && S.done.includes(MISSIONS[MISSIONS.length - 1].id);
      sb.hidden = !cleared;
      if (cleared) sb.innerHTML = `<b>1편 클리어! 🎉</b> 이야기는 끝나지 않았어요. 얼음 밑에 잠든 왕이 깨어나요. <a href="${sequelHref()}" target="_blank" rel="noopener">${esc(SEQUEL.name)} 하러 가기 →</a>`;
    }
    syncSettings();
  }
  $('btnContinue').onclick = () => { AU.init(); AU.fx('ui'); showHub('expedition'); };
  $('btnNew').onclick = () => { AU.init(); if (S.started) { $('newConfirm').hidden = false; return; } startNew(); };
  $('btnNewYes').onclick = startNew;
  $('btnNewNo').onclick = () => $('newConfirm').hidden = true;
  function startNew() { GAME.resetSave(); menu.gunId = null; showPrologue(); }
  function syncSettings() {
    [['setSens', 'setSensV', 'pSens', 'pSensV']].forEach(() => {});
    ['setSens', 'pSens'].forEach(id => $(id).value = S.sens); ['setSensV', 'pSensV'].forEach(id => $(id).textContent = S.sens.toFixed(1));
    ['setVol', 'pVol'].forEach(id => $(id).value = S.vol); ['setVolV', 'pVolV'].forEach(id => $(id).textContent = Math.round(S.vol * 100) + '%');
    $('setQ').value = S.quality;
  }
  ['setSens', 'pSens'].forEach(id => $(id).addEventListener('input', e => { GAME.setSens(parseFloat(e.target.value)); syncSettings(); }));
  ['setVol', 'pVol'].forEach(id => $(id).addEventListener('input', e => { GAME.setVol(parseFloat(e.target.value)); syncSettings(); }));
  $('setQ').addEventListener('change', e => { S.quality = e.target.value; GAME.save(); });
  AU.setVolume(S.vol);

  // ---------------------------------------------------------------
  //  프롤로그
  // ---------------------------------------------------------------
  let proI = 0;
  function showPrologue() {
    only('prologue'); proI = 0; $('proText').innerHTML = ''; $('proSkip').hidden = false;
    document.querySelector('#prologue .eyebrow').textContent = '프롤로그';
    $('proNext').onclick = nextPro; $('proSkip').onclick = () => { proI = PROLOGUE.length; nextPro(); };
    nextPro();
  }
  function nextPro() {
    if (proI >= PROLOGUE.length) { S.prologue = true; S.started = true; GAME.save(); showHub('expedition'); return; }
    const p = document.createElement('p'); p.textContent = PROLOGUE[proI++]; $('proText').appendChild(p);
    while ($('proText').children.length > 3) $('proText').firstChild.remove();
    $('proNext').textContent = proI >= PROLOGUE.length ? '캠프로' : '다음';
    AU.fx('radio', undefined, undefined, .4);
  }

  // ---------------------------------------------------------------
  //  캠프
  // ---------------------------------------------------------------
  let tab = 'expedition';
  const shopSt = { cat: 'pistol', sel: 'glock17' };
  const modSt = { sel: null };
  let jSel = 'tick';
  function showHub(t) {
    GAME.state = 'menu'; S.started = true; GAME.save();
    partyMsg = '';
    if (t) tab = t;
    only('hub'); pv.active = false;
    setMenuGun(S.loadout[0] || 'glock17');
    renderHub();
  }
  $('tabs').addEventListener('click', e => { const b = e.target.closest('.tab'); if (!b) return; AU.fx('ui'); tab = b.dataset.tab; renderHub(); });
  $('hubTitle').onclick = () => { pv.active = false; showTitle(); };
  function renderHub() {
    $('wallet').textContent = fmt(S.money) + ' G';
    document.querySelectorAll('.tab').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
    pv.active = false;
    ({ expedition: renderExpedition, shop: renderShop, mods: renderMods, journal: renderJournal })[tab]();
    $('pane').scrollTop = 0;
  }
  function loadoutBar() {
    return `<div class="loadbar"><span class="lbl">장착</span>${[0, 1, 2].map(i => `<div class="lslot"><b>${i + 1}</b>${S.loadout[i] ? esc(GUN[S.loadout[i]].name) : '<span style="color:var(--muted)">비어 있음</span>'}</div>`).join('')}</div>`;
  }

  // ----- 탐사 -----
  const mDone = id => (S.done || []).includes(id);
  function missionOpen(i) { return i === 0 || mDone(MISSIONS[i - 1].id); }
  function renderExpedition() {
    const doneN = MISSIONS.filter(x => mDone(x.id)).length;
    const nextI = MISSIONS.findIndex((x, i) => missionOpen(i) && !mDone(x.id));
    let html = `<div class="prog"><span>1편 진행도 <b style="color:var(--fg)">${doneN} / ${MISSIONS.length}</b> 임무</span><span class="bar"><i style="width:${doneN / MISSIONS.length * 100}%"></i></span></div>`;
    REGIONS.forEach((R, ri) => {
      const list = MISSIONS.map((x, i) => [x, i]).filter(([x]) => x.r === ri);
      const anyOpen = list.some(([, i]) => missionOpen(i)), anyDone = list.some(([x]) => mDone(x.id));
      html += `<div class="region" id="reg${ri}"><div class="num">지역 ${ri + 1} · ${esc(R.depth)}</div><h3>${anyOpen ? esc(R.n) : '??? (잠김)'}</h3><p>${anyOpen ? esc(R.desc) : '앞 지역의 임무를 끝내면 열려요.'}</p></div>`;
      html += '<div class="chapters">' + list.map(([x, i]) => {
        const open = missionOpen(i), done = mDone(x.id), T = MTYPES[x.type];
        return `<div class="chap ${open ? '' : 'locked'} ${i === nextI ? 'next' : ''}" ${i === nextI ? 'id="nextMission"' : ''}>
          ${done ? '<div class="stamp">완료</div>' : ''}
          <div class="num">임무 ${i + 1} · <span class="type">${T.icon} ${T.n}</span></div>
          <h3 class="sm">${open ? esc(x.n) : '???'}</h3>
          <p>${open ? esc(x.desc) : '앞 임무를 끝내면 열려요.'}</p>
          <div class="meta"><span>보상 <b>${fmt(done ? x.reward * .15 : x.reward)} G</b></span>${x.time !== 'cave' && open ? `<span>${{ day: '낮', dusk: '저녁', night: '밤' }[x.time]}</span>` : ''}${x.news ? '<span>📰 신문 발표</span>' : ''}</div>
          <div class="row">${open ? `<button class="btn small" data-go="story" data-i="${x.id}" type="button">${done ? '다시 하기' : '임무 시작'}</button>` : ''}</div>
        </div>`;
      }).join('') + (anyDone ? `<div class="chap"><div class="num">자유 사냥</div><h3 class="sm">${esc(R.n)}에서 돈 벌기</h3><p>임무 없이 괴물을 사냥해요. 원할 때 무전기로 돌아오면 돼요.</p><div class="row"><button class="btn ghost" data-go="hunt" data-i="${list.filter(([x]) => mDone(x.id)).pop()[0].id}" type="button">자유 사냥</button></div></div>` : '') + '</div>';
    });
    const range = `<div class="region"><div class="num">훈련</div><h3>사격장</h3></div><div class="chapters"><div class="chap"><p>모든 총을 사기 전에 직접 쏴 볼 수 있어요. 총기 상점에서 총을 고르고 ‘사격장에서 시험’을 눌러도 돼요.</p><div class="row"><button class="btn small bio" data-go="range" data-i="m1" type="button">사격장 가기</button></div></div></div>`;
    const pb = partyBar();
    $('pane').innerHTML = pb + loadoutBar() + html + range;
    $('pane').querySelectorAll('[data-go]').forEach(b => b.onclick = () => go(b.dataset.i, b.dataset.go));
    bindPartyBar();
    const nx = $('nextMission'); if (!pb && nx &&MISSIONS.indexOf(MISSION[nx.querySelector('[data-i]') ? nx.querySelector('[data-i]').dataset.i : 'm1']) > 0) setTimeout(() => nx.scrollIntoView({ block: 'center' }), 30);
  }
  function go(i, mode, opts) {
    // 친구 파티에서는 방장만 임무를 고른다 (사격장은 혼자 가도 된다)
    if (NET.isGuest && mode !== 'range') { AU.fx('ui'); partyMsg = '파티에서는 방장이 임무를 골라요. 방장이 시작하면 자동으로 같이 들어가요!'; renderHub(); return; }
    AU.init(); AU.fx('chapter');
    pv.active = false; only('loading');
    setTimeout(() => { hideAll(); GAME.startLevel(i, mode, opts); }, 60);
  }

  // ----- 상점 -----
  function statBars(st) {
    const rows = [
      ['위력', Math.min(1, Math.log10(1 + st.dmg * st.pellets) / Math.log10(420)), Math.round(st.dmg) + (st.pellets > 1 ? '×' + st.pellets : '')],
      ['연사', Math.min(1, st.rpm / 1200), st.rpm + 'rpm'],
      ['정확도', Math.max(.05, 1 - st.ads / .03), ''],
      ['반동 제어', Math.max(.05, 1 - st.rec * st.rp.up / 3.6), ''],
      ['탄창', Math.min(1, Math.log2(1 + st.mag) / Math.log2(201)), st.mag + '발'],
      ['장전 속도', Math.max(.05, 1 - st.rld / 5.5), st.rld.toFixed(1) + '초'],
      ['사거리', Math.min(1, st.range / 150), Math.round(st.range) + 'm'],
    ];
    return `<div class="stats">${rows.map(([n, v, t]) => `<span>${n}</span><span class="b"><i style="width:${Math.round(v * 100)}%"></i></span><span class="v">${t}</span>`).join('')}</div><div class="sub">반동: ${st.rp.desc}</div>`;
  }
  function renderShop() {
    const list = GUNS.filter(g => g.cat === shopSt.cat);
    if (!GUN[shopSt.sel] || GUN[shopSt.sel].cat !== shopSt.cat) shopSt.sel = list[0].id;
    const chips = CATS.map(c => `<button class="chip ${c.k === shopSt.cat ? 'on' : ''}" data-cat="${c.k}" type="button">${c.n} <span class="mono" style="opacity:.6">${GUNS.filter(g => g.cat === c.k).length}</span></button>`).join('');
    const cards = list.map(g => {
      const own = S.owned.includes(g.id);
      return `<button class="gcard ${g.id === shopSt.sel ? 'on' : ''}" data-id="${g.id}" type="button"><span class="gn">${esc(g.name)}</span><span class="gs">${NATIONS[g.nat]} · ${g.year} · ${esc(CAL[g.cal].n)}</span><span class="gp ${own ? 'own' : ''}">${own ? '보유 중' : fmt(g.price) + ' G'}</span></button>`;
    }).join('');
    $('pane').innerHTML = loadoutBar() + `<div class="chips">${chips}</div><div class="shop"><div class="glist">${cards}</div><aside class="detail" id="gdetail"></aside></div>`;
    $('pane').querySelectorAll('.chip').forEach(b => b.onclick = () => { AU.fx('ui'); shopSt.cat = b.dataset.cat; renderShop(); });
    $('pane').querySelectorAll('.gcard').forEach(b => b.onclick = () => { AU.fx('ui'); shopSt.sel = b.dataset.id; document.querySelectorAll('.gcard').forEach(x => x.classList.toggle('on', x === b)); renderDetail(); });
    renderDetail();
  }
  function renderDetail() {
    const g = GUN[shopSt.sel], own = S.owned.includes(g.id), st = gunStats(g, GAME.modsOf(g.id));
    const badges = gunBadges(g).map(b => `<span class="badge">${b}</span>`).join('');
    const can = S.money >= g.price;
    $('gdetail').innerHTML = `
      <div class="pvbox" id="pvbox"></div>
      <div><h2>${esc(g.name)}</h2><div class="sub">${CAT[g.cat].n} · ${NATIONS[g.nat]} ${g.year}년 · ${esc(CAL[g.cal].n)}</div></div>
      <p class="note">${esc(g.note)}</p>
      <div class="badges">${badges}</div>
      ${statBars(st)}
      <div class="row" style="justify-content:space-between">
        ${own ? '<span class="price" style="color:var(--bio)">보유 중</span>' : `<span class="price">${fmt(g.price)} G</span>`}
        <button class="btn ghost" id="btnTest" type="button">사격장에서 시험</button>
      </div>
      <div class="row">${own ? [0, 1, 2].map(i => `<button class="btn small ${S.loadout[i] === g.id ? 'bio' : ''}" data-slot="${i}" type="button">${S.loadout[i] === g.id ? i + 1 + '번 장착됨' : i + 1 + '번에 장착'}</button>`).join('') : `<button class="btn" id="btnBuy" type="button" ${can ? '' : 'disabled'}>${can ? '구매하기' : fmt(g.price - S.money) + ' G 부족'}</button>`}</div>`;
    showPreview($('pvbox'), gunObj(g.id));
    $('btnTest').onclick = () => go('m1', 'range', { test: g.id });
    const bb = $('btnBuy'); if (bb) bb.onclick = () => buy(g);
    $('gdetail').querySelectorAll('[data-slot]').forEach(b => b.onclick = () => assign(g.id, +b.dataset.slot));
  }
  function buy(g) {
    if (S.money < g.price) { AU.fx('denied'); return; }
    S.money -= g.price; S.owned.push(g.id);
    const empty = S.loadout.indexOf(null); if (empty >= 0) S.loadout[empty] = g.id;
    GAME.save(); AU.fx('buy'); renderShop();
  }
  function assign(id, i) {
    const j = S.loadout.indexOf(id);
    if (j === i) { if (S.loadout.filter(Boolean).length > 1) S.loadout[i] = null; }
    else { if (j >= 0) S.loadout[j] = S.loadout[i]; S.loadout[i] = id; }
    if (!S.loadout[0]) { const k = S.loadout.findIndex(Boolean); S.loadout[0] = S.loadout[k]; S.loadout[k] = null; }
    GAME.save(); AU.fx('ui'); menu.gunId = null; renderHub();
  }

  // ----- 개조 -----
  function renderMods() {
    const owned = S.owned.slice().sort((a, b) => GUNS.indexOf(GUN[a]) - GUNS.indexOf(GUN[b]));
    if (!modSt.sel || !owned.includes(modSt.sel)) modSt.sel = S.loadout[0] || owned[0];
    const g = GUN[modSt.sel], mods = GAME.modsOf(g.id), have = S.modOwned[g.id] || {};
    const list = owned.map(id => `<button class="gcard ${id === g.id ? 'on' : ''}" data-id="${id}" type="button"><span class="gn">${esc(GUN[id].name)}</span><span class="gs">${CAT[GUN[id].cat].n}</span></button>`).join('');
    const slotsHtml = MOD_SLOTS.map(sl => {
      const opts = sl.opts.filter(o => modAllowed(g, sl.k, o.k));
      if (opts.length <= 1) return '';
      return `<div class="mslot"><h4>${sl.n}</h4><div class="mopts">${opts.map(o => {
        const p = modPrice(g, sl.k, o), got = !p || (have[sl.k] || []).includes(o.k), on = mods[sl.k] === o.k;
        return `<button class="mopt ${on ? 'on' : ''}" data-s="${sl.k}" data-k="${o.k}" type="button" ${!got && S.money < p ? 'disabled' : ''} title="${esc(o.d || '')}"><span>${esc(o.n)}</span><small class="${got ? 'own' : ''}">${on ? '장착됨' : got ? '보유' : fmt(p) + ' G'}</small></button>`;
      }).join('')}</div></div>`;
    }).join('');
    $('pane').innerHTML = loadoutBar() + `<div class="shop"><div><div class="lbl" style="margin-bottom:8px">개조할 총 고르기</div><div class="glist">${list}</div></div>
      <aside class="detail"><div class="pvbox" id="pvbox"></div><div><h2>${esc(g.name)}</h2><div class="sub">부품을 사면 계속 보유해요. 보유한 부품은 언제든 공짜로 바꿔 낄 수 있어요.</div></div>${statBars(gunStats(g, mods))}<div class="mods">${slotsHtml}</div></aside></div>`;
    showPreview($('pvbox'), gunObj(g.id, mods));
    $('pane').querySelectorAll('.gcard').forEach(b => b.onclick = () => { AU.fx('ui'); modSt.sel = b.dataset.id; renderMods(); });
    $('pane').querySelectorAll('.mopt').forEach(b => b.onclick = () => applyMod(g, b.dataset.s, b.dataset.k));
  }
  function applyMod(g, slot, key) {
    const o = MOD_SLOT[slot].opts.find(x => String(x.k) === key), k = o.k;
    const p = modPrice(g, slot, o);
    const have = S.modOwned[g.id] || (S.modOwned[g.id] = {});
    const list = have[slot] || (have[slot] = []);
    if (p && !list.includes(k)) {
      if (S.money < p) { AU.fx('denied'); return; }
      S.money -= p; list.push(k); AU.fx('buy');
    } else AU.mech('magIn');
    const m = S.mods[g.id] || (S.mods[g.id] = {});
    m[slot] = k;
    GAME.save(); menu.gunId = null; renderMods(); $('wallet').textContent = fmt(S.money) + ' G';
  }

  // ----- 도감 -----
  function renderJournal() {
    const ids = Object.keys(SPECIES);
    const cards = ids.map(sp => {
      const s = SPECIES[sp], pct = Math.round(S.research[sp] || 0), seen = S.seen[sp] || pct > 0;
      return `<button class="scard ${sp === jSel ? 'on' : ''}" data-sp="${sp}" type="button"><span class="lbl">위험도 ${'●'.repeat(s.danger)}${'○'.repeat(6 - s.danger)}</span><span class="sn">${seen ? esc(s.n) : '???'}</span><span class="rb"><i style="width:${pct}%"></i></span><span class="lbl">조사 ${pct}%</span></button>`;
    }).join('');
    $('pane').innerHTML = `<div class="journal"><div class="slist">${cards}</div><aside class="detail" id="jdetail"></aside></div>`;
    $('pane').querySelectorAll('.scard').forEach(b => b.onclick = () => { AU.fx('ui'); jSel = b.dataset.sp; renderJournal(); });
    const s = SPECIES[jSel], pct = S.research[jSel] || 0, seen = S.seen[jSel] || pct > 0;
    const row = (need, t, v) => `<div><dt>${t}</dt><dd>${pct >= need ? esc(v) : `<span class="locked-txt">조사 ${need}% 이상이면 밝혀져요</span>`}</dd></div>`;
    $('jdetail').innerHTML = `<div class="pvbox" id="pvbox" style="height:240px"></div>
      <div><h2>${seen ? esc(s.n) : '알 수 없는 생명체'}</h2><div class="sub mono">${pct >= 30 ? esc(s.sci) : '학명 미확인'}</div></div>
      <dl class="facts">${row(0, '생김새', seen ? s.look : '아직 마주친 적이 없어요.')}${row(30, '행동', s.act)}${row(60, '약점', s.weak)}${row(100, '조사 보고서', s.report)}</dl>
      <div class="lbl">조사 방법: 처치 +${s.kill}% · 샘플 +${s.sample}% · 스캔 +${s.scan}%</div>`;
    if (seen) showPreview($('pvbox'), creatureObj(jSel), { spin: true });
    else { const b = $('pvbox'); b.innerHTML = '<div style="display:grid;place-items:center;height:100%;font-family:var(--f-display);font-size:64px;color:#2a2c32">?</div>'; pv.active = false; }
  }

  // ---------------------------------------------------------------
  //  일시정지 · 죽음 · 결과
  // ---------------------------------------------------------------
  function showPause() { syncSettings(); only('pause'); $('hud').hidden = true; $('touch').hidden = true; $('pauseCoop').hidden = !NET.on; }
  $('btnResume').onclick = () => GAME.resume();
  // 핸드폰 버튼 배치 바꾸기 (일시정지 화면 · 처음 화면)
  $('btnTouchEdit').onclick = () => { $('pause').hidden = true; GAME.editTouch(() => showPause()); };
  $('btnTouchEdit2').onclick = () => { $('title').hidden = true; GAME.editTouch(() => showTitle()); };
  $('btnQuit').onclick = () => GAME.quitToCamp();
  const statsHtml = r => `<div><span class="lbl">처치</span><b>${r.kills}</b></div><div><span class="lbl">샘플</span><b>${r.samples}</b></div><div><span class="lbl">번 돈</span><b>${fmt(r.money)}</b></div>`;
  function showDeath(r) { only('death'); $('hud').hidden = true; $('touch').hidden = true; $('deathStats').innerHTML = statsHtml(r); }
  $('btnDeathCamp').onclick = () => GAME.quitToCamp();
  function showResult(r) {
    only('result'); $('resultStats').innerHTML = statsHtml(r);
    $('resultEye').textContent = '자유 사냥 결과'; $('resultHead').textContent = '무사 귀환'; $('resultMsg').textContent = '';
    $('btnResultCamp').textContent = '캠프로';
  }
  // 임무 보고: 새 생명체를 밝힌 임무는 신문, 나머지는 결과 카드
  function showReport(id, r, first) {
    GAME.state = 'menu';
    const x = MISSION[id];
    if (x.news && first) { showNews(id, r, first); return; }
    only('result'); AU.fx('newspaper');
    $('resultEye').textContent = `임무 ${MISSIONS.indexOf(x) + 1} 완료 · ${MTYPES[x.type].n}`;
    $('resultHead').textContent = x.n;
    $('resultMsg').textContent = `윤 박사: “${x.done}” · 보상 +${fmt(r.reward)} G${first ? '' : ' (다시 하기 보상)'}`;
    $('resultStats').innerHTML = statsHtml(r);
    $('btnResultCamp').textContent = '캠프로';
  }
  $('btnResultCamp').onclick = () => showHub('expedition');

  // ---------------------------------------------------------------
  //  신문
  // ---------------------------------------------------------------
  function snapshot(sp) {
    ensurePv();
    const holder = new THREE.Group(), obj = creatureObj(sp); holder.add(obj); fit(obj, 1);
    const sc = new THREE.Scene(); sc.background = new THREE.Color(0x1a1a1a);
    sc.add(new THREE.HemisphereLight(0xffffff, 0x202020, .7));
    const fl = new THREE.SpotLight(0xffffff, 3, 10, .6, .4, 1); fl.position.set(.6, 1.2, 2); sc.add(fl, fl.target);
    holder.rotation.y = -.6; sc.add(holder);
    const cam = new THREE.PerspectiveCamera(32, 4 / 3, .01, 20); cam.position.set(.2, .3, 2); cam.lookAt(0, 0, 0);
    const prev = pv.active; pv.active = false;
    pv.r.setSize(640, 480, false); pv.r.render(sc, cam);
    const url = pv.r.domElement.toDataURL('image/jpeg', .85);
    pv.active = prev; return url;
  }
  function showNews(id, r, first) {
    GAME.state = 'menu';
    const ch = MISSION[id], s = SPECIES[ch.sp], R = REGIONS[ch.r];
    const no = MISSIONS.filter(x => x.news).indexOf(ch) + 1;
    only('news'); AU.fx('newspaper');
    const d = new Date(); $('newsDate').textContent = `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 · 특별판 제${no}호`;
    $('newsHead').textContent = ch.news.head; $('newsSub').textContent = ch.news.sub;
    $('newsImg').src = snapshot(ch.sp);
    $('newsCap').textContent = `탐험가 서주원이 촬영한 ${s.n} (${s.sci})`;
    const last = id === MISSIONS[MISSIONS.length - 1].id;
    $('newsArticle').innerHTML = `<p>【${esc(R.n)}】 탐험가 서주원과 윤 박사 팀이 ${esc(R.depth)} 지점에서 새로운 생명체 ‘${esc(s.n)}’을(를) 조사해 바깥세상에 처음으로 알렸다.</p><p>${esc(s.look)} ${esc(s.act)}</p><p>윤 박사는 “${esc(s.report)}”라고 밝혔다.</p>${last ? '<p><b>이로써 검은 아가리 동굴의 비밀이 모두 풀렸다. 전 세계 과학자들이 탐험가 서주원의 이름을 기억하게 되었다.</b></p>' : ''}<p style="text-align:right">— 바깥세상 일보 과학부 · 서주원 탐험가 제보</p>`;
    $('newsReward').textContent = `임무 보상 +${fmt(r.reward)} G · 이번 탐사 ${fmt(r.money)} G · 처치 ${r.kills}`;
    $('btnNewsOk').textContent = last && first ? '엔딩 보기' : '캠프로';
    $('btnNewsOk').onclick = () => {
      if (last && first) { showEnding(); return; }
      showHub('expedition');
    };
  }
  function showEnding() {
    only('prologue');
    const lines = typeof ENDING !== 'undefined' ? ENDING : ['심연의 여왕이 쓰러지자, 동굴의 울음소리도 멈췄다.', '바깥세상 사람들은 지하에 또 다른 세계가 있다는 것을 처음 알게 되었다.', '탐험가 서주원의 조사 기록은 세계 곳곳의 교과서에 실렸다.', '— 심연 탐사록 · 끝 —', '서주원이 만듬'];
    $('proText').innerHTML = ''; $('proSkip').hidden = false; let k = 0;
    document.querySelector('#prologue .eyebrow').textContent = '엔딩';
    const next = () => {
      // 엔딩이 끝나면 다음 편 안내 (SEQUEL은 이야기 파일이 정한다)
      if (k === lines.length && typeof SEQUEL !== 'undefined') {
        k++; $('proText').innerHTML = sequelCard(); $('proSkip').hidden = true; $('proNext').textContent = '캠프로'; return;
      }
      if (k >= lines.length) { showHub('expedition'); return; }
      const p = document.createElement('p'); p.textContent = lines[k++]; $('proText').appendChild(p);
      while ($('proText').children.length > 3) $('proText').firstChild.remove();
      $('proNext').textContent = k >= lines.length ? '캠프로' : '다음';
    };
    $('proNext').onclick = next; $('proSkip').onclick = () => { k = lines.length; next(); };
    next();
  }
  // 다음 편으로 가는 안내 카드 (내 컴퓨터 파일로 열었으면 옆 폴더로, 아니면 게임 링크로)
  const sequelHref = () => location.protocol === 'file:' ? encodeURI(SEQUEL.local) : SEQUEL.url;
  function sequelCard() {
    return `<div class="sequel"><div class="eyebrow">다음 이야기</div><h2>${esc(SEQUEL.name)}</h2>${SEQUEL.desc.map(t => `<p>${esc(t)}</p>`).join('')}
      <ul>${SEQUEL.points.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
      <a class="btn" href="${sequelHref()}" target="_blank" rel="noopener">2편 하러 가기 →</a></div>`;
  }

  // ---------------------------------------------------------------
  //  친구와 함께 (파티)
  // ---------------------------------------------------------------
  let partyOpen = false, partyMsg = '';
  function openParty() { AU.init(); AU.fx('ui'); partyOpen = true; $('party').hidden = false; renderParty(); }
  function closeParty() { AU.fx('ui'); partyOpen = false; $('party').hidden = true; if (!$('hub').hidden) renderHub(); }
  $('btnParty').onclick = openParty;
  $('btnParty2').onclick = openParty;
  $('btnPartyClose').onclick = closeParty;
  function renderParty() {
    if (!partyOpen) return;
    const s = NET.st;
    let h = `<div class="pfield"><label for="pNick">내 이름</label><input id="pNick" maxlength="12" placeholder="탐사대원" value="${esc(S.nick || '')}"></div>`;
    if (s.status === 'off') {
      h += `<p class="lead" style="margin:0">한 명이 <b>파티 만들기</b>를 누르면 숫자 4개짜리 코드가 나와요. 다른 한 명은 그 코드를 넣고 <b>참가</b>를 누르면 돼요.</p>
        <div class="row"><button class="btn" id="pHost" type="button">파티 만들기</button></div>
        <div class="row pjoin"><input id="pCode" inputmode="numeric" maxlength="4" placeholder="코드" aria-label="방 코드 4자리"><button class="btn ghost" id="pJoin" type="button">참가</button></div>`;
    } else if (s.status === 'making' || s.status === 'joining') {
      h += `<p class="lead" style="margin:0">${s.status === 'making' ? '방을 만드는 중…' : `방 ${esc(s.code)}에 연결하는 중…`}</p><div class="row"><button class="btn ghost" id="pLeave" type="button">취소</button></div>`;
    } else if (s.status === 'waiting') {
      h += `<div class="pcode">${esc(s.code)}</div><p class="lead" style="margin:0;text-align:center">이 코드를 친구에게 알려 주세요.<br>친구를 기다리는 중…</p><div class="row"><button class="btn" id="pGo" type="button">캠프로 가기</button><button class="btn ghost" id="pLeave" type="button">파티 끝내기</button></div>`;
    } else if (s.status === 'linked') {
      h += `<p class="pok">✅ <b>${esc(s.friend)}</b>와(과) 연결됐어요!</p>
        <p class="lead" style="margin:0">${NET.isHost ? '내가 <b>방장</b>이에요. 캠프에서 임무를 고르면 친구도 같이 들어와요.' : '친구가 <b>방장</b>이에요. 방장이 임무를 고르면 나도 자동으로 들어가요.'}</p>
        <div class="row"><button class="btn" id="pGo" type="button">캠프로 가기</button><button class="btn ghost" id="pLeave" type="button">파티 나가기</button></div>`;
    }
    const msg = s.msg || partyMsg;
    if (msg && s.status !== 'linked') h += `<p class="perr">${esc(msg)}</p>`;
    h += `<p class="lead" style="margin:0;font-size:12px">같은 편끼리만 같이 할 수 있어요 (1편은 1편끼리). 둘 다 인터넷이 연결돼 있어야 해요. 돈·총·조사 기록은 각자 컴퓨터에 저장되고, 잡은 괴물의 돈은 둘 다 받아요.</p>`;
    $('partyBody').innerHTML = h;
    $('pNick').oninput = e => { S.nick = e.target.value.slice(0, 12); GAME.save(); };
    const on = (id, f) => { const el = $(id); if (el) el.onclick = () => { AU.fx('ui'); partyMsg = ''; f(); }; };
    on('pHost', () => NET.host());
    on('pJoin', () => NET.join($('pCode').value));
    on('pLeave', () => NET.leave());
    on('pGo', () => { partyOpen = false; $('party').hidden = true; showHub('expedition'); });
    const pc = $('pCode');
    if (pc) { pc.onkeydown = e => { if (e.key === 'Enter') { partyMsg = ''; NET.join(pc.value); } }; pc.oninput = () => { pc.value = pc.value.replace(/\D/g, '').slice(0, 4); }; }
  }
  // 캠프 탐사 화면 맨 위 파티 알림
  function partyBar() {
    const s = NET.st, lob = GAME.lobby;
    if (s.status === 'linked') {
      const say = NET.isHost ? '내가 방장 · 임무를 고르면 친구도 같이 가요' : lob ? `방장이 지금 “${esc(lob.n)}” 하는 중이에요` : '방장이 임무를 고르면 자동으로 들어가요';
      return `<div class="partybar"><b>👥 ${esc(s.friend)}와(과) 파티 중</b><span>${say}</span>${NET.isGuest && lob ? '<button class="btn small" id="pJoinNow" type="button">지금 합류하기</button>' : ''}<button class="btn ghost small" id="pOpen" type="button">파티</button></div>`
        + (partyMsg ? `<div class="partybar warn"><span>${esc(partyMsg)}</span></div>` : '');
    }
    if (s.status === 'waiting') return `<div class="partybar"><b>👥 방 코드 ${esc(s.code)}</b><span>친구를 기다리는 중… 먼저 임무를 시작해도 친구가 나중에 들어올 수 있어요.</span><button class="btn ghost small" id="pOpen" type="button">파티</button></div>`;
    if (partyMsg) return `<div class="partybar warn"><span>${esc(partyMsg)}</span><button class="btn ghost small" id="pOpen" type="button">파티</button></div>`;
    return '';
  }
  function bindPartyBar() {
    const a = $('pOpen'); if (a) a.onclick = openParty;
    const b = $('pJoinNow'); if (b) b.onclick = () => { AU.init(); AU.fx('chapter'); partyMsg = ''; only('loading'); GAME.joinHost(); setTimeout(() => { if (!$('loading').hidden) showHub('expedition'); }, 8000); };
  }
  function partyChanged() { renderParty(); if (!$('hub').hidden && tab === 'expedition') { const y = $('pane').scrollTop; renderExpedition(); $('pane').scrollTop = y; } }
  function partyNote(msg) { partyMsg = msg; partyChanged(); }
  NET.watch(() => partyChanged());

  // 시작
  showTitle();

  return { showHub, showPause, showDeath, showResult, showReport, showNews, hideAll, menuRender, showTitle, partyChanged, partyNote };
})();
