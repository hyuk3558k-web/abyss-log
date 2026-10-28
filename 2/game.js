'use strict';
// =====================================================================
//  게임 본체: 플레이어, 사격, 장전, 조사, 보고, 화면 정보
// =====================================================================
const GAME = (() => {
  const V3 = THREE.Vector3, PI = Math.PI;
  const $ = id => document.getElementById(id);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const isTouch = matchMedia('(pointer: coarse)').matches || ('ontouchstart' in window && navigator.maxTouchPoints > 0);

  // ---------------------------------------------------------------
  //  저장
  // ---------------------------------------------------------------
  const SAVE_KEY = typeof SAVE_ID !== 'undefined' ? SAVE_ID : 'abyssLog_v1';
  const START = typeof GAME_START !== 'undefined' ? GAME_START : { money: 300, owned: ['glock17'], loadout: ['glock17', null, null] };
  const fresh = () => JSON.parse(JSON.stringify(START));
  const SAVE = { ...fresh(), mods: {}, modOwned: {}, research: {}, seen: {}, reported: [], done: [], gunTalk: [], sens: 1, vol: .8, quality: isTouch ? 'low' : 'high', started: false, kills: 0, prologue: false };
  function load() { try { const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); if (s) Object.assign(SAVE, s); } catch (e) {} }
  function save() { try { SAVE.savedAt = Date.now(); localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) {} }
  // 자동 저장: 플레이 중 10초마다, 창을 닫거나 숨길 때
  setInterval(() => { if (state === 'playing') save(); }, 10000);
  addEventListener('pagehide', () => save());
  function resetSave() { const keep = { sens: SAVE.sens, vol: SAVE.vol, quality: SAVE.quality }; Object.assign(SAVE, { ...fresh(), mods: {}, modOwned: {}, research: {}, seen: {}, reported: [], done: [], gunTalk: [], started: true, kills: 0, prologue: false }, keep); save(); }
  load();
  const modsOf = id => Object.assign(defaultMods(GUN[id]), SAVE.mods[id] || {});

  // ---------------------------------------------------------------
  //  렌더러
  // ---------------------------------------------------------------
  const renderer = new THREE.WebGLRenderer({ antialias: !isTouch, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, SAVE.quality === 'high' ? 2 : 1.25));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.25;
  renderer.shadowMap.enabled = SAVE.quality === 'high'; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.autoClear = false;
  $('game').appendChild(renderer.domElement);

  let scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, .05, 160);
  camera.rotation.order = 'YXZ';
  const gunScene = new THREE.Scene();
  const gunCam = new THREE.PerspectiveCamera(66, innerWidth / innerHeight, .01, 10);
  const gunHemi = new THREE.HemisphereLight(0xd0c8bc, 0x302820, .85); gunScene.add(gunHemi);
  const gunKey = new THREE.DirectionalLight(0xfff0dd, 1.25); gunKey.position.set(.4, 1, .8); gunScene.add(gunKey);
  const gunRim = new THREE.DirectionalLight(0x8ab8ff, .7); gunRim.position.set(-1, .3, -1); gunScene.add(gunRim);
  const gunFlash = new THREE.PointLight(0xffb060, 0, 2, 2); gunFlash.position.set(0, 0, -.6); gunScene.add(gunFlash);
  const flashSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: WORLD.getGlow(), color: 0xffc060, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  flashSprite.visible = false; gunScene.add(flashSprite);
  const flashStar = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex(), color: 0xffd890, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  flashStar.visible = false; gunScene.add(flashStar);
  function starTex() {
    const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
    g.translate(32, 32); g.fillStyle = 'rgba(255,255,255,1)';
    for (let i = 0; i < 6; i++) { g.rotate(PI / 3); g.beginPath(); g.moveTo(0, -3); g.lineTo(30, 0); g.lineTo(0, 3); g.fill(); }
    return new THREE.CanvasTexture(c);
  }

  // 필름 알갱이 무늬 (한 번만 만들어서 화면 위에 아주 옅게 깐다)
  (() => {
    const c = document.createElement('canvas'); c.width = c.height = 160; const g = c.getContext('2d'), d = g.createImageData(160, 160);
    for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    g.putImageData(d, 0, 0); $('grain').style.backgroundImage = `url(${c.toDataURL()})`;
  })();

  // 손전등
  let flashlight = null, fillLight = null, muzzleLight = null, boomLights = [], nvLight = null;
  function makeLights() {
    flashlight = new THREE.SpotLight(0xfff1dc, 2.4, 42, .52, .55, 1.6);
    flashlight.castShadow = SAVE.quality === 'high'; flashlight.shadow.mapSize.set(1024, 1024); flashlight.shadow.bias = -.0008; flashlight.shadow.camera.near = .3;
    flashlight.position.set(.15, -.1, 0); camera.add(flashlight);
    const tgt = new THREE.Object3D(); tgt.position.set(.05, -.05, -5); camera.add(tgt); flashlight.target = tgt;
    fillLight = new THREE.PointLight(0xd8d0c0, .35, 7, 2); camera.add(fillLight);
    muzzleLight = new THREE.PointLight(0xffb060, 0, 12, 2); scene.add(muzzleLight);
    nvLight = new THREE.AmbientLight(0xa0ffb0, 0); scene.add(nvLight);
    boomLights = [0, 1].map(() => { const l = new THREE.PointLight(0xff9a40, 0, 18, 2); scene.add(l); return l; });
  }

  // ---------------------------------------------------------------
  //  상태
  // ---------------------------------------------------------------
  const P = { pos: new V3(), vel: new V3(), yaw: 0, pitch: 0, hp: 100, onGround: true, dead: false, hurtT: 9, r: .38, stepT: 0, bob: 0 };
  let LV = null, RUN = null, state = 'menu';
  const input = { keys: {}, fire: false, firePressed: false, aim: false, e: false, f: false, look: new THREE.Vector2() };
  let locked = false, everLocked = false, noLock = false;
  let slots = [], cur = -1;
  const ray = new THREE.Raycaster();
  const fx = { parts: [], tracers: [], holes: [], smoke: [], pops: [], nades: [], boomT: [], sparks: [], goo: [] };

  // ---------------------------------------------------------------
  //  효과 (불꽃, 피, 연기, 총알 자국)
  // ---------------------------------------------------------------
  const sparkGeo = new THREE.BoxGeometry(.05, .05, .05);
  const basicCache = {};
  const basic = c => basicCache[c] || (basicCache[c] = new THREE.MeshBasicMaterial({ color: c }));
  function burst(pos, color, n, speed, life = .5, grav = 1, size = 1) {
    for (let i = 0; i < n; i++) {
      if (fx.parts.length > 600) break;
      const m = new THREE.Mesh(sparkGeo, basic(color)); m.position.copy(pos); const s = size * rand(.5, 1.4); m.scale.setScalar(s);
      const v = new V3(rand(-1, 1), rand(-.2, 1), rand(-1, 1)).normalize().multiplyScalar(speed * rand(.3, 1));
      scene.add(m); fx.parts.push({ m, v, life, max: life, grav, s });
    }
  }
  const tracerGeo = new THREE.BoxGeometry(.012, .012, 1); tracerGeo.translate(0, 0, .5);
  function tracer(from, to) {
    const m = new THREE.Mesh(tracerGeo, new THREE.MeshBasicMaterial({ color: 0xffd8a0, transparent: true, opacity: .8, blending: THREE.AdditiveBlending, depthWrite: false }));
    m.position.copy(from); m.lookAt(to); m.scale.z = from.distanceTo(to); scene.add(m); fx.tracers.push({ m, life: .05 });
  }
  let holeTex = null;
  function hole(point, normal) {
    if (!holeTex) { const c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext('2d'); const gr = g.createRadialGradient(16, 16, 0, 16, 16, 15); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(.4, 'rgba(10,8,6,.85)'); gr.addColorStop(1, 'rgba(10,8,6,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); holeTex = new THREE.CanvasTexture(c); }
    const m = new THREE.Mesh(new THREE.PlaneGeometry(.12, .12), new THREE.MeshBasicMaterial({ map: holeTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }));
    m.position.copy(point).addScaledVector(normal, .01); m.lookAt(point.clone().add(normal)); scene.add(m); fx.holes.push(m);
    if (fx.holes.length > 120) { const o = fx.holes.shift(); scene.remove(o); o.material.dispose(); o.geometry.dispose(); }
  }
  function smoke(pos, size = .3, life = 1, color = 0x8a8680) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: WORLD.getGlow(), color, transparent: true, opacity: .35, depthWrite: false }));
    s.position.copy(pos); s.scale.setScalar(size); scene.add(s); fx.smoke.push({ s, life, max: life, size });
  }
  // 총알이 벽에 맞을 때 번쩍이는 빛
  function spark(pos) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: WORLD.getGlow(), color: 0xffc070, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    s.position.copy(pos); s.scale.setScalar(.45); scene.add(s); fx.sparks.push({ s, life: .07 });
  }
  // 괴물이 죽은 자리에 남는 체액 웅덩이
  let gooTex = null;
  function goo(pos, color, size) {
    if (!gooTex) { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); for (let i = 0; i < 9; i++) { const x = 32 + rand(-14, 14), y = 32 + rand(-14, 14), r = rand(6, 16); const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(.7, 'rgba(255,255,255,.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); } gooTex = new THREE.CanvasTexture(c); }
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: gooTex, color, transparent: true, opacity: .75, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }));
    m.rotation.x = -PI / 2; m.rotation.z = rand(0, 6); m.position.set(pos.x, LV.floorAt(pos.x, pos.z) + .015, pos.z); m.scale.setScalar(.1);
    scene.add(m); fx.goo.push({ m, t: 0, size });
    if (fx.goo.length > 30) { const o = fx.goo.shift(); scene.remove(o.m); o.m.geometry.dispose(); o.m.material.dispose(); }
  }
  function explosion(pos, radius) {
    burst(pos, 0xffd070, 40, 12, .6, 1, 1.6); burst(pos, 0xff6a20, 30, 8, .9, 1, 2.2); burst(pos, 0x2a2420, 20, 6, 1.4, 1.2, 3);
    for (let i = 0; i < 6; i++) smoke(pos.clone().add(new V3(rand(-1, 1), rand(0, 1), rand(-1, 1))), 2, 1.8, 0x5a5048);
    const l = boomLights[fx.boomT.length % 2]; l.position.copy(pos); fx.boomT.push({ l, life: .35 });
    AU.fx('explosion'); shake(Math.max(.1, .9 - pos.distanceTo(P.pos) * .04));
    CREATURES.explode(pos, radius, 0);
  }
  function shake(a) { RUN && (RUN.shake = Math.min(1, (RUN.shake || 0) + a)); }

  // 공기 중에 떠다니는 먼지 (동굴) · 반딧불이 (밤 바깥) · 꽃가루 (낮 바깥)
  let motes = null;
  function makeMotes() {
    const out = !!LV.sky, night = out && !!(LV.theme.sky && LV.theme.sky.moon), snow = !!LV.theme.snow, fly = night && !snow;
    const N = (SAVE.quality === 'high' ? 280 : 140) * (snow ? 3 : 1), R = 14;
    const pos = new Float32Array(N * 3), ph = new Float32Array(N);
    for (let i = 0; i < N; i++) { pos[i * 3] = P.pos.x + rand(-R, R); pos[i * 3 + 1] = rand(.2, fly ? 3 : 5); pos[i * 3 + 2] = P.pos.z + rand(-R, R); ph[i] = rand(0, 99); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const col = snow ? 0xffffff : fly ? 0xa8ff38 : out ? 0xfff2d0 : (LV.theme.light || 0xffd8a0);
    const mat = new THREE.PointsMaterial({ map: WORLD.getGlow(), color: col, size: snow ? .09 : fly ? .16 : .05, transparent: true, opacity: snow ? .85 : fly ? .9 : .4, depthWrite: false, blending: THREE.AdditiveBlending });
    const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; scene.add(pts);
    motes = { pts, N, R, ph, fly, snow, t: 0 };
  }
  function updateMotes(dt) {
    if (!motes) return;
    const M = motes, a = M.pts.geometry.attributes.position, p = a.array, R = M.R, cx = camera.position.x, cz = camera.position.z;
    M.t += dt;
    const sp = M.fly ? .5 : .12;
    for (let i = 0; i < M.N; i++) {
      const k = M.ph[i] + M.t * (M.fly ? .7 : .25);
      p[i * 3] += Math.sin(k) * sp * dt; p[i * 3 + 1] += Math.cos(k * 1.3) * sp * .5 * dt; p[i * 3 + 2] += Math.cos(k * .8) * sp * dt;
      // 눈: 바람에 날리며 떨어지고, 바닥에 닿으면 위에서 다시 내린다
      if (M.snow) { p[i * 3] += (1.2 + Math.sin(k) * .6) * dt; p[i * 3 + 1] -= (1.1 + (M.ph[i] % 1) * .8) * dt; if (p[i * 3 + 1] < 0) p[i * 3 + 1] += 8; }
      if (p[i * 3] - cx > R) p[i * 3] -= R * 2; else if (cx - p[i * 3] > R) p[i * 3] += R * 2;
      if (p[i * 3 + 2] - cz > R) p[i * 3 + 2] -= R * 2; else if (cz - p[i * 3 + 2] > R) p[i * 3 + 2] += R * 2;
    }
    a.needsUpdate = true;
    if (M.fly) M.pts.material.opacity = .55 + Math.sin(M.t * 2.3) * .35;
  }

  // 영화 같은 연출: 위아래 검은 띠 + 큰 제목 / 가운데 알림 띠
  const cine = (() => {
    let t = 0, bt = 0;
    return {
      show(eye, title, sub, dur, cls) {
        $('cineEye').textContent = eye; $('cineTitle').textContent = title; $('cineSub').textContent = sub || '';
        const el = $('cine'); el.className = cls || ''; void el.offsetWidth; el.classList.add('on'); t = dur;
      },
      banner(a, b, dur) {
        $('bannerT').textContent = a; $('bannerS').textContent = b || '';
        const el = $('banner'); el.classList.remove('on'); void el.offsetWidth; el.classList.add('on'); bt = dur || 3.2;
      },
      update(dt) {
        if (t > 0) { t -= dt; if (t <= 0) $('cine').classList.remove('on'); }
        if (bt > 0) { bt -= dt; if (bt <= 0) $('banner').classList.remove('on'); }
      },
      end() { t = bt = 0; $('cine').classList.remove('on'); $('banner').classList.remove('on'); },
    };
  })();

  // 화면에 뜨는 숫자 (피해, 돈)
  function popAt(pos, text, cls) {
    const el = document.createElement('div'); el.className = 'pop ' + (cls || ''); el.textContent = text; $('pops').appendChild(el);
    fx.pops.push({ el, pos: pos.clone(), life: .9, max: .9 });
  }
  function updatePops(dt) {
    const w = innerWidth, h = innerHeight, v = new V3();
    for (let i = fx.pops.length - 1; i >= 0; i--) {
      const p = fx.pops[i]; p.life -= dt; p.pos.y += dt * .6;
      v.copy(p.pos).project(camera);
      if (v.z > 1 || p.life <= 0) { if (p.life <= 0) { p.el.remove(); fx.pops.splice(i, 1); } else p.el.style.opacity = 0; continue; }
      p.el.style.transform = `translate(${(v.x * .5 + .5) * w}px, ${(-v.y * .5 + .5) * h}px) translate(-50%,-50%)`;
      p.el.style.opacity = Math.min(1, p.life / p.max * 2);
    }
  }
  function updateFx(dt) {
    for (let i = fx.parts.length - 1; i >= 0; i--) {
      const s = fx.parts[i]; s.life -= dt; const k = Math.max(0, s.life / s.max);
      s.v.y -= 12 * s.grav * dt; s.m.position.addScaledVector(s.v, dt);
      const fy = LV ? LV.floorAt(s.m.position.x, s.m.position.z) + .03 : .03;
      if (s.m.position.y < fy) { s.m.position.y = fy; s.v.y *= -.3; s.v.x *= .6; s.v.z *= .6; }
      s.m.scale.setScalar(s.s * k);
      if (s.life <= 0) { scene.remove(s.m); fx.parts.splice(i, 1); }
    }
    for (let i = fx.tracers.length - 1; i >= 0; i--) { const t = fx.tracers[i]; t.life -= dt; t.m.material.opacity = Math.max(0, t.life / .05) * .8; if (t.life <= 0) { scene.remove(t.m); t.m.material.dispose(); fx.tracers.splice(i, 1); } }
    for (let i = fx.smoke.length - 1; i >= 0; i--) { const s = fx.smoke[i]; s.life -= dt; const k = s.life / s.max; s.s.scale.setScalar(s.size * (1 + (1 - k) * 2.5)); s.s.material.opacity = .35 * k; s.s.position.y += dt * .3; if (s.life <= 0) { scene.remove(s.s); s.s.material.dispose(); fx.smoke.splice(i, 1); } }
    for (let i = fx.sparks.length - 1; i >= 0; i--) { const s = fx.sparks[i]; s.life -= dt; s.s.material.opacity = Math.max(0, s.life / .07); if (s.life <= 0) { scene.remove(s.s); s.s.material.dispose(); fx.sparks.splice(i, 1); } }
    fx.goo.forEach(o => { if (o.t < 1) { o.t = Math.min(1, o.t + dt * 1.5); o.m.scale.setScalar(o.size * (1 - Math.pow(1 - o.t, 3))); } });
    updateMotes(dt);
    for (let i = fx.boomT.length - 1; i >= 0; i--) { const b = fx.boomT[i]; b.life -= dt; b.l.intensity = Math.max(0, b.life / .35) * 5; if (b.life <= 0) fx.boomT.splice(i, 1); }
    // 유탄 · 로켓
    for (let i = fx.nades.length - 1; i >= 0; i--) {
      const n = fx.nades[i]; n.life -= dt; n.v.y -= n.grav * dt; n.m.position.addScaledVector(n.v, dt);
      if (n.rocket && Math.random() < .8) smoke(n.m.position.clone(), .35, .8);
      const p = n.m.position;
      let hit = LV.isWallAt(p.x, p.z) || p.y < LV.floorAt(p.x, p.z) + .05 || (!LV.sky && p.y > LV.ceilAt(p.x, p.z)) || n.life <= 0;
      if (!hit) for (const c of CREATURES.list) if (c.state !== 'dead' && Math.hypot(c.pos.x - p.x, c.pos.z - p.z) < c.S.r + .3 && p.y > c.pos.y - .2 && p.y < c.pos.y + (c.S.kind === 'boss' ? 6 : 2.2)) { hit = true; break; }
      if (hit) {
        scene.remove(n.m); fx.nades.splice(i, 1);
        explosion(p.clone(), n.radius);
        CREATURES.list.forEach(c => {
          if (c.state === 'dead') return;
          const ctr = c.pos.clone(); ctr.y += c.S.kind === 'boss' ? 3 : .8;
          const d = Math.max(0, ctr.distanceTo(p) - c.S.r * .6);
          if (d < n.radius) { const dm = n.dmg * (1 - d / n.radius * .7); damageCreature(c, dm, false, ctr); }
        });
        const pd = P.pos.clone().setY(P.pos.y + 1).distanceTo(p);
        if (pd < n.radius) hurtPlayer(Math.min(35, n.dmg * .15 * (1 - pd / n.radius)), p);
      }
    }
  }

  // ---------------------------------------------------------------
  //  무기
  // ---------------------------------------------------------------
  function makeSlot(id) {
    const g = GUN[id], mods = modsOf(id), st = gunStats(g, mods), view = GUNVIEW.build(g, mods, true);
    return { id, g, mods, st, view, mag: st.mag, cool: 0, burst: 0, reload: null, cycle: null, spin: 0, spent: 0, bloom: 0 };
  }
  function equip(i) {
    if (!slots[i] || i === cur) return;
    const W = slots[cur];
    if (W) { W.reload = null; gunScene.remove(W.view.root); }
    cur = i; const N = slots[cur];
    gunScene.add(N.view.root); N.swapT = .45; N.cycle = null;
    AU.mech('swap'); updateSlotsHud();
    if (RUN && RUN.mode !== 'range') MISSIONRT.onEquip(N.g);
  }
  function curW() { return slots[cur]; }

  function startReload() {
    const W = curW(); if (!W || W.reload || W.swapT > 0 || state !== 'playing' || P.dead) return;
    const st = W.st, g = W.g;
    if (W.mag >= st.mag) return;
    if (GUNVIEW.SHELL[g.rt]) W.reload = { kind: 'shell', phase: 'start', t: 0, dur: .42, empty: W.mag === 0, spent: W.spent, stop: false };
    else W.reload = { kind: 'mag', t: 0, dur: st.rld, empty: W.mag === 0, spent: W.spent };
    W.cycle = null; W.burst = 0;
  }
  function updateReload(W, dt, A) {
    const r = W.reload, g = W.g, st = W.st;
    const ctx = { empty: r.empty, spent: r.spent };
    const t0 = r.t; r.t += dt;
    if (r.kind === 'mag') {
      A.k0 = t0 / r.dur; A.k = Math.min(1, r.t / r.dur);
      (GUNVIEW.RL[g.rt] || GUNVIEW.RL.rifle)(A.k, A, W.view, ctx);
      if (r.t >= r.dur) { W.mag = st.mag; W.spent = 0; W.reload = null; }
      return;
    }
    const S = GUNVIEW.SHELL[g.rt];
    A.k0 = t0 / r.dur; A.k = Math.min(1, r.t / r.dur);
    S[r.phase](A.k, A, W.view, ctx);
    if (r.t >= r.dur) {
      if (r.phase === 'start') { r.phase = 'load'; r.t = 0; r.dur = st.rld; }
      else if (r.phase === 'load') {
        W.mag++; r.spent = Math.max(0, r.spent - 1); W.spent = r.spent;
        if (W.mag >= st.mag || r.stop) { r.phase = 'end'; r.t = 0; r.dur = r.empty ? S.endLen : .42; }
        else r.t = 0;
      } else W.reload = null;
    }
  }

  function trigger() {
    const W = curW(); if (!W || state !== 'playing' || P.dead || W.swapT > 0) return;
    if (W.reload) { if (W.reload.kind === 'shell' && W.mag > 0) W.reload.stop = true; return; }
    if (W.cool > 0 || W.burst > 0) return;
    if (W.st.spin && W.spin < 1) return;
    if (W.mag <= 0) { AU.mech('empty'); W.cool = .3; if (RUN.mode !== 'range') MISSIONRT.onEmpty(); startReload(); return; }
    const m = W.g.mode;
    if (m === 'b3' || m === 'b2') { W.burst = m === 'b3' ? 3 : 2; W.burstT = 0; return; }
    fireShot(W);
  }

  const camFwd = new V3(), camRight = new V3(), camUp = new V3();
  function muzzleWorld(W) {
    const mz = W.view.muzzle; mz.updateWorldMatrix(true, false);
    return new V3().setFromMatrixPosition(mz.matrixWorld).applyMatrix4(camera.matrixWorld);
  }
  function fireShot(W) {
    const st = W.st, g = W.g, v = W.view;
    W.mag--; W.spent++;
    W.cool = st.interval;
    const cyc = v.cyc;
    if (['bolt', 'pump', 'lever', 'sa'].includes(cyc)) W.cycle = { t: 0, dur: Math.max(.3, st.interval * .92), type: cyc };
    else if (cyc !== 'none' && cyc !== 'spin') W.cycle = { t: 0, dur: Math.min(.11, st.interval * .9), type: cyc };
    if (['slide', 'carrier', 'ak', 'toggle', 'boltSmall', 'spin'].includes(cyc) || (cyc === 'none' && v.casing === 'brass' && g.mode !== 'single')) GUNVIEW.spawnCasing(v, gunScene, v.casing);
    if (st.ping && W.mag === 0) { AU.mech('ping'); GUNVIEW.flyPart(v, gunScene, 'clip'); }
    camera.updateMatrixWorld();
    camera.getWorldDirection(camFwd);
    camRight.setFromMatrixColumn(camera.matrixWorld, 0); camUp.setFromMatrixColumn(camera.matrixWorld, 1);
    const moving = Math.hypot(P.vel.x, P.vel.z) > 1.2;
    const aimK = RUN.aim;
    let spread = (st.hip * (1 - aimK) + st.ads * aimK) * (moving ? 1.6 : 1) * (P.onGround ? 1 : 2.5) + W.bloom;
    const from = muzzleWorld(W);
    if (st.ex) {
      const rocket = g.cal === 'rkt' || !!CAL[g.cal].rocket;
      const m = new THREE.Mesh(new THREE.SphereGeometry(rocket ? .09 : .05, 8, 6), new THREE.MeshBasicMaterial({ color: rocket ? 0xffc070 : 0x7a8a50 }));
      if (rocket) m.add(new THREE.Sprite(new THREE.SpriteMaterial({ map: WORLD.getGlow(), color: 0xff9030, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })));
      m.position.copy(camera.position).addScaledVector(camFwd, .6); scene.add(m);
      const dir = camFwd.clone().addScaledVector(camRight, rand(-1, 1) * spread * .5).addScaledVector(camUp, rand(-1, 1) * spread * .5).normalize();
      fx.nades.push({ m, v: dir.multiplyScalar(rocket ? 38 : 42), grav: rocket ? 1.5 : 9, life: 4, dmg: st.dmg, radius: st.ex, rocket });
      if (rocket) for (let i = 0; i < 8; i++) smoke(camera.position.clone().addScaledVector(camFwd, -.8).add(new V3(rand(-.3, .3), rand(-.2, .2), rand(-.3, .3))), .8, 1.2);
    } else {
      const targets = CREATURES.hitMeshes().concat(LV.solids, RUN.targets || []);
      const per = new Map();
      for (let i = 0; i < st.pellets; i++) {
        const a = Math.random() * PI * 2, s = Math.sqrt(Math.random()) * spread;
        const dir = camFwd.clone().addScaledVector(camRight, Math.cos(a) * s).addScaledVector(camUp, Math.sin(a) * s).normalize();
        ray.set(camera.position, dir); ray.far = 150;
        const hits = ray.intersectObjects(targets, false);
        let pen = st.pen, end = null, hitC = new Set();
        for (const h of hits) {
          const ud = h.object.userData;
          if (ud.c) {
            if (hitC.has(ud.c)) continue; hitC.add(ud.c);
            const fall = h.distance < st.range ? 1 : Math.max(.35, 1 - (h.distance - st.range) / (st.range * 2));
            const k = per.get(ud.c) || { dmg: 0, weak: false, point: h.point.clone() };
            k.dmg += st.dmg * fall * (ud.weak ? 2 : 1) * (i === 0 ? 1 : 1); k.weak = k.weak || !!ud.weak; per.set(ud.c, k);
            burst(h.point, bloodOf(ud.c.sp), ud.weak ? 11 : 6, ud.weak ? 5 : 4, .45, 1, ud.weak ? 1.3 : 1);
            if (pen-- <= 0) { end = h.point; break; }
          } else if (ud.target) {
            const dm = Math.round(st.dmg * (h.distance < st.range ? 1 : Math.max(.35, 1 - (h.distance - st.range) / (st.range * 2))));
            RUN.rangeHit = (RUN.rangeHit || 0) + dm; ud.target.flash = .1;
            const bull = h.uv && Math.hypot(h.uv.x - .5, h.uv.y - .5) < .08;
            popAt(h.point, bull ? dm * 2 + '!' : String(dm), bull ? 'weak' : ''); AU.fx(bull ? 'hitWeak' : 'hitRock'); showHit(bull);
            hole(h.point, h.face.normal.clone().transformDirection(h.object.matrixWorld)); end = h.point; break;
          } else {
            const n = h.face.normal.clone().transformDirection(h.object.matrixWorld);
            hole(h.point, n); burst(h.point.clone().addScaledVector(n, .05), 0xffe0a0, 3, 4, .25); burst(h.point.clone().addScaledVector(n, .05), 0x8a8070, 3, 2, .5, .6, 1.4);
            if (i < 2) { smoke(h.point.clone().addScaledVector(n, .12), .35, .7, 0x9a9080); spark(h.point.clone().addScaledVector(n, .04)); }
            if (i < 2) AU.fx('hitRock', h.point.x, h.point.z, .5);
            end = h.point; break;
          }
        }
        if (i < 3 || st.pellets === 1) tracer(from, end || camera.position.clone().addScaledVector(dir, 80));
      }
      for (const [c, k] of per) damageCreature(c, k.dmg, k.weak, k.point);
    }
    // 반동 · 불꽃 · 소리
    // 총마다 정해진 무늬로 튄다. 계속 쏘면 점점 세지고, 마우스로 직접 눌러 잡아야 한다
    const R = st.rp;
    W.streak = RUN.time - (W.lastShot || -9) < Math.max(.22, st.interval * 2.2) ? (W.streak || 0) + 1 : 0;
    W.lastShot = RUN.time; RUN.lastShot = RUN.time;
    const n = W.streak, ramp = 1 + Math.min(1, n / R.rampN) * R.ramp, aimM = aimK > .5 ? .8 : 1;
    const kick = st.rec * .021 * R.up * ramp * aimM * rand(.9, 1.1);
    const side = (R.bias + Math.sin(n * R.freq + R.phase) * R.wob) * st.rec * .014 * ramp * aimM + rand(-1, 1) * st.rec * .0025;
    P.pitch += kick; RUN.recoilPitch += kick * R.back; P.yaw -= side;
    RUN.punch = Math.min(1.5, (RUN.punch || 0) + clamp(st.rec * .35, .15, 1)); RUN.roll = rand(-1, 1) * clamp(st.rec * .006, .002, .02);
    RUN.kick = 1; W.bloom = Math.min(.05, W.bloom + st.rec * .004 * (st.hyper && W.burst > 0 ? 0 : 1));
    const big = clamp(st.dmg * st.pellets / 60, .6, 2.2);
    RUN.flashT = st.sup ? .02 : .045; RUN.flashSize = st.sup ? .3 : big;
    muzzleLight.position.copy(from); muzzleLight.intensity = st.sup ? .4 : 2.5 * big;
    smoke(from, .15 * big, .9);
    AU.shot(st); CREATURES.noise(P.pos, st.noise);
    shake(st.pellets > 1 || st.dmg > 100 ? .12 : .02);
    if (st.ex && g.rt === 'rocket') W.view.hideMag = true;
  }
  function bloodOf(sp) { return { tick: 0xc06a2a, bat: 0x8a3aa0, spider: 0xb070ff, stalker: 0x30d0b0, golem: 0xff7a20, queen: 0xff3a8a, howler: 0xa02a20, brood: 0x9aff40, warden: 0x60d0ff }[sp] || (SPECIES[sp] && SPECIES[sp].blood) || 0xaa3030; }

  function damageCreature(c, dmg, weak, point) {
    if (c.state === 'dead') return;
    const killed = CREATURES.damage(c, dmg, weak, point);
    // 맞으면 뒤로 밀리고 움찔한다 (보스는 안 밀림)
    if (!killed && c.S.kind !== 'boss') {
      const d = point.clone().sub(camera.position).setY(0), L = d.length();
      if (L > .01) {
        const f = clamp(dmg / c.max, .05, .6) * (c.alpha ? .3 : 1);
        c.knock = (c.knock || new V3()).addScaledVector(d.divideScalar(L), f * 7);
        c.flinch = Math.min(1, (c.flinch || 0) + f * 3 + .2);
      }
    }
    if (killed && weak) RUN.slowT = Math.max(RUN.slowT || 0, .07);
    showHit(weak, killed);
    AU.fx(weak ? 'hitWeak' : 'hitFlesh', undefined, undefined, .6);
    popAt(point, String(Math.round(dmg)), weak ? 'weak' : '');
  }

  function updateWeapon(dt) {
    const W = curW(); if (!W) return;
    const st = W.st;
    W.cool -= dt; W.bloom = Math.max(0, W.bloom - dt * .06);
    if (W.swapT > 0) W.swapT -= dt;
    const firing = (input.fire || touch.fire) && state === 'playing' && !P.dead;
    // 미니건 예열
    if (st.spin) {
      const want = firing && !W.reload && W.mag > 0 ? 1 : 0;
      W.spin = clamp(W.spin + (want ? dt / st.spin : -dt / 1.2), 0, 1);
      W.view.spin += W.spin * dt * 45; AU.spin(W.spin);
    }
    // 점사
    if (W.burst > 0) { W.burstT -= dt; if (W.burstT <= 0) { if (W.mag > 0) { fireShot(W); W.burst--; W.burstT = st.interval; if (W.burst === 0) W.cool = st.hyper ? .32 : .28; } else W.burst = 0; } }
    const mode = W.g.mode;
    if (mode === 'auto') { if (firing) trigger(); }
    else if (input.firePressed || (touch.fire && isTouch && W.cool < -.12)) trigger();
    input.firePressed = false;
    if (W.mag === 0 && !W.reload && W.cool <= 0 && !firing && W.burst === 0) startReload();
  }

  function updateView(dt) {
    const W = curW(); if (!W) return;
    const v = W.view, st = W.st;
    const A = GUNVIEW.newPose();
    if (W.reload) updateReload(W, dt, A);
    else if (W.cycle) {
      const c = W.cycle, t0 = c.t; c.t += dt; A.k0 = t0 / c.dur; A.k = Math.min(1, c.t / c.dur);
      GUNVIEW.CY[c.type](A.k, A, v, {});
      if (c.type === 'da' || c.type === 'sa') { if (c.t >= c.dur) v.cylRot += v.cylStep; }
      if (c.t >= c.dur) W.cycle = null;
    }
    // 마지막 발을 쏘면 슬라이드/노리쇠가 뒤로 멈춘다
    if (W.mag === 0 && !W.reload) {
      if (v.cyc === 'slide') { const p = A.parts.slide || (A.parts.slide = { p: new V3(), r: new V3(), vis: true }); p.p.z = Math.max(p.p.z, .03); }
      if (v.cyc === 'carrier') { const p = A.parts.carrier || (A.parts.carrier = { p: new V3(), r: new V3(), vis: true }); p.p.z = Math.max(p.p.z, .025); }
    }
    v.hideMag = (W.g.rt === 'rocket' && W.mag === 0 && !W.reload);
    GUNVIEW.apply(v, A);
    for (const e of A.ev) handleEvent(W, e);
    // 총 위치
    const canAim = !W.reload && W.swapT <= 0 && !P.dead && !RUN.sprint;
    const aimTarget = (input.aim || touch.aim) && canAim ? 1 : 0;
    RUN.aim += (aimTarget - RUN.aim) * Math.min(1, dt / st.adsT * 2.2);
    const aimK = RUN.aim;
    const hip = v.hip.clone(), ads = new V3(0, -v.sightY, -v.eyeDist - v.sightZ);
    const pos = hip.lerp(ads, aimK);
    const spd = Math.hypot(P.vel.x, P.vel.z), bobA = Math.min(1, spd / 6) * (P.onGround ? 1 : 0) * (1 - aimK * .85);
    pos.x += Math.cos(P.bob) * .012 * bobA + RUN.sway.x; pos.y += Math.abs(Math.sin(P.bob)) * .014 * bobA + RUN.sway.y;
    RUN.kick = Math.max(0, RUN.kick - dt * 8);
    const kz = clamp(st.rec * .03, .012, .09);
    pos.z += RUN.kick * kz; pos.y += RUN.kick * kz * .25;
    pos.add(A.pos);
    let rx = A.rot.x + RUN.kick * clamp(st.rec * .05, .02, .22), ry = A.rot.y, rz = A.rot.z;
    if (RUN.sprint && aimK < .1 && !W.reload) { const s = RUN.sprintK; rx -= .35 * s; ry += .55 * s; pos.x -= .02 * s; pos.y -= .03 * s; }
    if (W.swapT > 0) pos.y -= (W.swapT / .45) * .35;
    v.root.position.copy(pos); v.root.rotation.set(rx, ry, rz);
    // 조준경
    const scoped = RUN.scoped = st.zoom >= 3 && aimK > .85;
    v.root.visible = !scoped;
    $('scope').hidden = !scoped;
    $('prompt').style.visibility = scoped ? 'hidden' : '';
    // 야간 투시: 안개를 걷고 밝게 (멀리 있는 괴물도 보이게)
    const dayOut = LV.sky && !(LV.theme.sky && LV.theme.sky.moon);
    if (scene.fog) scene.fog.density = LV.theme.fogD * (scoped ? .12 : 1);
    renderer.toneMappingExposure = 1.25;
    if (nvLight) nvLight.intensity = scoped && !dayOut ? .3 : 0;
    $('scope').classList.toggle('nv', scoped && !dayOut);
    const fov = 72 / (1 + (st.zoom - 1) * aimK) + (scoped ? 0 : (RUN.punch || 0) * .9);
    if (Math.abs(camera.fov - fov) > .01) { camera.fov = fov; camera.updateProjectionMatrix(); }
    // 총구 불꽃
    RUN.flashT -= dt;
    const on = RUN.flashT > 0 && !scoped;
    flashSprite.visible = flashStar.visible = on;
    if (on) {
      v.muzzle.updateWorldMatrix(true, false); flashSprite.position.setFromMatrixPosition(v.muzzle.matrixWorld); flashStar.position.copy(flashSprite.position);
      flashSprite.scale.setScalar(rand(.12, .18) * RUN.flashSize); flashStar.scale.setScalar(rand(.18, .26) * RUN.flashSize); flashStar.material.rotation = rand(0, 6);
    }
    gunFlash.intensity = on ? 3 * RUN.flashSize : 0; gunFlash.position.copy(flashSprite.position);
    muzzleLight.intensity = Math.max(0, muzzleLight.intensity - dt * 50);
  }
  function handleEvent(W, e) {
    const v = W.view;
    switch (e) {
      case 'dropMag': GUNVIEW.dropPart(v, gunScene, 'mag'); break;
      case 'ejectAll': GUNVIEW.spawnMany(v, gunScene, W.g.cal === '12ga' ? 'shell' : W.g.cal === '40mm' ? 'grenade' : 'brass', Math.max(1, W.reload ? W.reload.spent : 1), W.g.rt === 'webley'); AU.mech('casing'); break;
      case 'ejectOne': GUNVIEW.spawnMany(v, gunScene, W.g.cal === '12ga' ? 'shell' : 'brass', 1, false); AU.mech('casing'); break;
      case 'eject': GUNVIEW.spawnCasing(v, gunScene, v.casing); AU.mechAt(v.casing === 'shell' ? 'shellDrop' : 'casing'); break;
      case 'pingEject': AU.mech('ping'); GUNVIEW.flyPart(v, gunScene, 'clip'); break;
      default: AU.mech(e);
    }
  }

  // ---------------------------------------------------------------
  //  플레이어
  // ---------------------------------------------------------------
  function hurtPlayer(dmg, from) {
    if (state !== 'playing' || P.dead) return;
    P.hp -= dmg; P.hurtT = 0; RUN.hurt = 1; shake(Math.min(.5, dmg * .02));
    RUN.dmgFrom = from.clone(); RUN.dmgT = 1.2; AU.fx('hurt');
    if (P.hp <= 0) { P.hp = 0; die(); }
  }
  function die() {
    P.dead = true; RUN.deadT = 0;
    if (document.pointerLockElement) document.exitPointerLock();
    save();
    setTimeout(() => { if (RUN && P.dead) UI.showDeath(runSummary()); }, 1800);
  }
  function updatePlayer(dt) {
    if (P.dead) { P.vel.set(0, 0, 0); RUN.deadT += dt; return; }
    const k = input.keys;
    let f = (k.KeyW || k.ArrowUp ? 1 : 0) - (k.KeyS || k.ArrowDown ? 1 : 0);
    let r = (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0);
    if (touch.stickId !== null) { f = -touch.my; r = touch.mx; }
    const sy = Math.sin(P.yaw), cy = Math.cos(P.yaw);
    const wish = new V3(-sy * f + cy * r, 0, -cy * f - sy * r); if (wish.length() > 1) wish.normalize();
    const W = curW();
    RUN.sprint = (k.ShiftLeft || k.ShiftRight || touch.sprint) && f > 0 && RUN.aim < .3 && !(W && W.reload);
    RUN.sprintK += ((RUN.sprint ? 1 : 0) - RUN.sprintK) * Math.min(1, dt * 8);
    const speed = (RUN.sprint ? 8.2 : 5.4) * (W ? W.st.move : 1) * (1 - RUN.aim * .45) * (W && W.st.spin && W.spin > .2 ? .6 : 1);
    const a = 1 - Math.exp(-(P.onGround ? 12 : 2.5) * dt);
    P.vel.x += (wish.x * speed - P.vel.x) * a; P.vel.z += (wish.z * speed - P.vel.z) * a;
    P.pos.x += P.vel.x * dt; P.pos.z += P.vel.z * dt;
    LV.collide(P.pos, P.r);
    P.vel.y -= 20 * dt; P.pos.y += P.vel.y * dt;
    const fl = Math.max(0, LV.floorAt(P.pos.x, P.pos.z));
    if (P.pos.y <= fl) { if (P.vel.y < -8) { AU.fx('land'); shake(.08); } P.pos.y = fl; P.vel.y = 0; P.onGround = true; } else P.onGround = false;
    const spd = Math.hypot(P.vel.x, P.vel.z);
    if (P.onGround) {
      const prev = P.bob; P.bob += dt * spd * 1.35;
      if (Math.floor(prev / PI) !== Math.floor(P.bob / PI) && spd > 1) AU.fx('step', undefined, undefined, RUN.sprint ? 1 : .7);
    }
    // 체력 회복
    P.hurtT += dt;
    if (P.hurtT > 4 && P.hp < 100) P.hp = Math.min(100, P.hp + 8 * dt);
    // 용암
    for (const h of LV.hazards) if (Math.hypot(P.pos.x - h.x, P.pos.z - h.z) < h.r && P.pos.y < .3) { P.hp -= h.dps * dt; P.hurtT = 0; RUN.hurt = Math.max(RUN.hurt, .5); if (P.hp <= 0) { P.hp = 0; die(); } }
    AU.setListener(P.pos.x, P.pos.z, P.yaw);
  }
  function jump() { if (P.onGround && state === 'playing' && !P.dead) { P.vel.y = 6.2; P.onGround = false; } }

  function updateCamera(dt) {
    // 반동 일부를 천천히 되돌린다 (쏘는 동안은 안 돌아오고, 손을 뗀 뒤에야 돌아온다)
    if (RUN.time - (RUN.lastShot || -9) > .14) {
      const back = RUN.recoilPitch * Math.min(1, dt * 4.5);
      P.pitch -= back; RUN.recoilPitch -= back;
    }
    P.pitch = clamp(P.pitch, -1.45, 1.45);
    // 쏠 때 화면이 살짝 들썩이고 기울어진다
    RUN.punch = Math.max(0, (RUN.punch || 0) - dt * 9); RUN.roll = (RUN.roll || 0) * Math.max(0, 1 - dt * 14);
    camera.rotation.set(P.pitch + RUN.punch * .006, P.yaw, RUN.roll);
    const spd = Math.hypot(P.vel.x, P.vel.z), bobA = Math.min(1, spd / 6) * (P.onGround ? 1 : 0) * (1 - RUN.aim * .8);
    camera.position.set(P.pos.x, P.pos.y + (P.dead ? Math.max(.3, 1.62 - RUN.deadT * 1.5) : 1.62) + Math.sin(P.bob * 2) * .035 * bobA, P.pos.z);
    if (P.dead) camera.rotation.z = Math.min(.6, RUN.deadT * .5);
    if (RUN.shake > 0) { camera.position.x += rand(-1, 1) * RUN.shake * .08; camera.position.y += rand(-1, 1) * RUN.shake * .08; camera.rotation.z += rand(-1, 1) * RUN.shake * .01; RUN.shake = Math.max(0, RUN.shake - dt * 2); }
    RUN.sway.x += (-input.look.x * .0006 - RUN.sway.x) * Math.min(1, dt * 10);
    RUN.sway.y += (input.look.y * .0006 - RUN.sway.y) * Math.min(1, dt * 10);
    input.look.set(0, 0);
    // 손전등 깜빡임 (조준경을 볼 때는 손전등을 줄여서 화면이 하얗게 타지 않게)
    const day = LV && LV.sky && !(LV.theme.sky && LV.theme.sky.moon) && LV.theme.sky.sunY > .5;
    if (flashlight) flashlight.intensity = day ? 0 : (Math.random() < .002 ? .4 : 2.4) * (RUN.scoped ? .12 : 1);
  }

  // ---------------------------------------------------------------
  //  조사 · 샘플 · 보고
  // ---------------------------------------------------------------
  function research(sp, amount, why) {
    if (!RUN || RUN.mode === 'range') return;
    const before = SAVE.research[sp] || 0; if (before >= 100) return;
    const now = Math.min(100, before + amount); SAVE.research[sp] = now;
    toast(`${SPECIES[sp].n} 조사 +${Math.round(now - before)}% (${why})`);
    if (now >= 100) toast(`${SPECIES[sp].n} 조사 완료! 도감에 보고서가 열렸어요`);
  }
  function addMoney(n, at) {
    n = Math.round(n); if (!n) return;
    SAVE.money += n; RUN.money += n; AU.fx('money', undefined, undefined, .5);
    const el = document.createElement('div'); el.className = 'cash'; el.textContent = `+${n.toLocaleString()} G`;
    $('cashFeed').prepend(el); setTimeout(() => el.remove(), 1800);
    void at;
  }
  function onKill(c, weak) {
    if (!RUN) return;
    RUN.kills++; SAVE.kills++;
    addMoney(c.S.money * .5 * (weak ? 1.25 : 1) * (RUN.mode === 'hunt' ? 1.15 : 1));
    research(c.sp, c.S.kill, '처치');
    if (c.S.kind === 'boss') research(c.sp, 100, c.S.n + ' 처치');
    MISSIONRT.onKill(c, weak);
    feed(`${c.S.n} 처치${weak ? ' · 약점!' : ''}`, weak);
    shake(c.S.kind === 'boss' ? 1 : .05);
    AU.fx('kill', undefined, undefined, weak ? .9 : .6);
    // 쓰러질 때 체액이 튀고 바닥에 웅덩이가 번진다
    const big = c.S.kind === 'boss' ? 5 : c.S.r * 2.4 * (c.alpha ? 1.5 : 1);
    burst(c.pos.clone().setY(c.pos.y + .6), bloodOf(c.sp), c.S.kind === 'boss' ? 60 : 18, 5, .8, 1, 1.3);
    goo(c.pos, bloodOf(c.sp), big);
    if (c.S.kind === 'boss' || c.alpha) { RUN.slowT = 1.1; cine.banner(c.S.kind === 'boss' ? '최종 보스 쓰러짐' : '우두머리 쓰러짐', `${c.S.n}을(를) 해치웠어요!`, 3.5); }
    CREATURES.pruneCorpses();
  }
  function onSeen(c) {
    if (!RUN) return;
    if (!SAVE.seen[c.sp]) { SAVE.seen[c.sp] = 1; toast(`새로운 생명체 발견: ${c.S.n}`); }
    MISSIONRT.onSeen(c);
  }

  // 대화 (무전)
  const subs = [];
  function say(line) { if (line && subs.length < 6) subs.push(line); }
  const busy = () => subs.length > 0 || (RUN && RUN.subT > 0);
  let talking = false;
  function updateSubs(dt) {
    if (!RUN) return;
    RUN.subT -= dt;
    if (RUN.subT <= 0) {
      if (subs.length) {
        const [who, text] = subs.shift();
        $('subWho').textContent = who; $('subText').textContent = ''; $('sub').hidden = false;
        RUN.subFull = text; RUN.subK = 0;
        RUN.subT = 2.2 + text.length * .06; talking = who === '윤 박사'; AU.fx('radio', undefined, undefined, .35);
      } else { $('sub').hidden = true; talking = false; }
    }
    // 글자가 한 자씩 타자 치듯 나온다
    if (RUN.subFull && RUN.subK < RUN.subFull.length) {
      RUN.subK = Math.min(RUN.subFull.length, RUN.subK + dt * 34);
      $('subText').textContent = RUN.subFull.slice(0, Math.ceil(RUN.subK));
    }
  }

  // 길게 누르기 (E: 샘플 · 보고, F: 스캔)
  function updateInteract(dt) {
    let prompt = '', holdKey = null, action = null, need = 1;
    const nearRadio = Math.hypot(P.pos.x - LV.radio.x, P.pos.z - LV.radio.z) < 2.6;
    if (P.dead) { $('prompt').hidden = true; $('hold').hidden = true; return; }
    if (nearRadio) {
      if (RUN.mode === 'range') { prompt = '[E] 사격장 나가기'; holdKey = 'e'; need = .4; action = () => finish('range'); }
      else if (RUN.mode === 'hunt') { prompt = '[E] 길게 눌러 캠프로 돌아가기'; holdKey = 'e'; need = .8; action = () => finish('hunt'); }
      else if (RUN.ready) { prompt = '[E] 길게 눌러 바깥세상에 보고하기'; holdKey = 'e'; need = 1.4; action = () => finish('report'); }
      else prompt = `무전기 · 임무를 끝내면 여기서 보고해요 (${Math.round(MISSIONRT.prog * 100)}%)`;
    }
    const mi = !nearRadio && RUN.mode === 'story' ? MISSIONRT.interact() : null;
    if (mi) { prompt = mi.text; holdKey = mi.key; need = mi.need; action = mi.act; }
    else if (!nearRadio) {
      const corpse = CREATURES.nearestCorpse(P.pos, 2.4);
      if (corpse) { prompt = `[E] 길게 눌러 ${corpse.S.n} 샘플 채집`; holdKey = 'e'; need = 1; action = () => sample(corpse); }
      else if (RUN.mode !== 'range') {
        const c = aimedCreature(32);
        if (c && !c.scanned && (SAVE.research[c.sp] || 0) < 100 && c.S.scan) { prompt = `[F] 길게 눌러 ${c.S.n} 조사 스캔`; holdKey = 'f'; need = 1.2; action = () => { c.scanned = true; research(c.sp, c.S.scan, '스캔'); AU.fx('scanDone'); MISSIONRT.onScan(); }; RUN.scanTarget = c; }
      }
    }
    $('prompt').textContent = prompt; $('prompt').hidden = !prompt;
    const pressed = holdKey && (holdKey === 'e' ? (input.e || touch.e) : (input.f || touch.f));
    if (pressed) {
      RUN.holdT += dt; RUN.holdKey = holdKey;
      if (holdKey === 'f' && Math.floor(RUN.holdT * 8) !== Math.floor((RUN.holdT - dt) * 8)) AU.fx('scan');
      if (RUN.holdT >= need) { RUN.holdT = 0; input.e = input.f = false; touch.e = touch.f = false; action(); }
    } else RUN.holdT = Math.max(0, RUN.holdT - dt * 3);
    const hk = $('hold'); hk.hidden = RUN.holdT <= 0;
    hk.style.setProperty('--p', Math.min(1, RUN.holdT / need));
  }
  function aimedCreature(maxD) {
    camera.getWorldDirection(camFwd); ray.set(camera.position, camFwd); ray.far = maxD;
    const hits = ray.intersectObjects(CREATURES.hitMeshes().concat(LV.solids), false);
    return hits[0] && hits[0].object.userData.c || null;
  }
  function sample(c) {
    c.sampled = true; RUN.samples++;
    AU.fx('sample'); burst(c.pos.clone().setY(.6), 0x5fe0c8, 16, 3, .6);
    addMoney(25 + c.S.money * .2);
    research(c.sp, c.S.sample, '샘플');
    MISSIONRT.onSample(); save();
  }
  function finish(kind) {
    if (state !== 'playing') return;
    if (kind === 'report') {
      const id = RUN.ch.id;
      const first = !SAVE.done.includes(id);
      const pay = first ? RUN.ch.reward : Math.round(RUN.ch.reward * .15);
      if (first) SAVE.done.push(id);
      SAVE.money += pay; RUN.money += pay; RUN.reward = pay;
      const sum = runSummary(); save(); endLevel(); UI.showReport(id, sum, first);
    } else if (kind === 'hunt') { save(); endLevel(); UI.showResult(runSummary()); }
    else { endLevel(); UI.showHub('shop'); }
  }
  function runSummary() { return { kills: RUN.kills, samples: RUN.samples, money: RUN.money, reward: RUN.reward || 0, time: RUN.time, ch: RUN.ch, chIdx: RUN.chIdx, mode: RUN.mode }; }

  // ---------------------------------------------------------------
  //  사격장 표적
  // ---------------------------------------------------------------
  function buildTargets() {
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    g.fillStyle = '#e8e0cc'; g.fillRect(0, 0, 128, 128);
    ['#1a1a1a', '#e8e0cc', '#1a1a1a', '#e8e0cc', '#c8281e'].forEach((col, i) => { g.fillStyle = col; g.beginPath(); g.arc(64, 64, 58 - i * 12, 0, PI * 2); g.fill(); });
    const tex = new THREE.CanvasTexture(c);
    const list = [];
    [10, 8, 15, 25, 40, 55].forEach((d, i) => {
      // 상자 면 순서: +x, -x, +y, -y, +z, -z → 플레이어 쪽(-x) 면에 과녁 그림
      const wood = new THREE.MeshStandardMaterial({ color: 0x6a5030 });
      const face = new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveIntensity: 0 });
      const m = new THREE.Mesh(new THREE.BoxGeometry(.06, 1.2, 1.2), [wood, face, wood, wood, wood, wood]);
      const x = LV.start.x + d, z = i === 0 ? LV.start.z : LV.start.z + (i % 2 ? 3 : -3) * (i > 2 ? 1 : .5);
      m.position.set(x, 1.4, z); m.rotation.y = 0;
      const t = { m, flash: 0, base: z, move: i === 3 || i === 5 }; m.userData.target = t;
      scene.add(m); list.push(m);
      const post = new THREE.Mesh(new THREE.BoxGeometry(.08, .8, .08), new THREE.MeshStandardMaterial({ color: 0x3a2a1a })); post.position.set(x, .4, z); scene.add(post); t.post = post;
    });
    return list;
  }
  function updateTargets(dt) {
    (RUN.targets || []).forEach((m, i) => {
      const t = m.userData.target; t.flash = Math.max(0, t.flash - dt);
      m.material[1].emissiveIntensity = t.flash > 0 ? .6 : 0;
      if (t.move) { m.position.z = t.base + Math.sin(RUN.time * (.8 + i * .2)) * 5; t.post.position.z = m.position.z; }
    });
  }

  // ---------------------------------------------------------------
  //  레벨 시작 · 끝
  // ---------------------------------------------------------------
  function startLevel(chIdx, mode, opts) {
    opts = opts || {};
    AU.init();
    if (typeof UI !== 'undefined') UI.hideAll();
    endLevel(true);
    scene = new THREE.Scene(); scene.add(camera);
    camera.children.slice().forEach(o => camera.remove(o));
    makeLights();
    const mm = MISSION[chIdx];
    const ch = mode === 'range' ? { n: '사격장' } : Object.assign({}, mm, { theme: missionTheme(mm), target: mm.sp, half: mm.half || '여왕이 약해지고 있어요! 세 개의 눈을 노려요!' });
    const seed = mode === 'story' ? ch.seed : (Math.random() * 1e9) | 0;
    LV = WORLD.build(ch, seed, mode, { shadows: SAVE.quality === 'high' });
    scene.add(LV.group);
    const T = LV.theme;
    scene.fog = new THREE.FogExp2(LV.fogColor || T.fog, T.fogD); scene.background = new THREE.Color(T.fog);
    gunHemi.color.set(T.amb).lerp(new THREE.Color(0xd0c8bc), .6);
    // 플레이어
    P.pos.copy(LV.start); P.pos.y = 0; P.vel.set(0, 0, 0); P.yaw = -PI / 2; P.pitch = 0; P.hp = 100; P.dead = false; P.hurtT = 9; P.bob = 0;
    camera.rotation.z = 0;
    RUN = { ch, chIdx, mode, money: 0, kills: 0, samples: 0, time: 0, ready: false, aim: 0, kick: 0, recoilPitch: 0, sway: new THREE.Vector2(), shake: 0, hurt: 0, dmgT: 0, flashT: 0, flashSize: 1, subT: 0, holdT: 0, sprint: false, sprintK: 0, spawnT: 15, mapT: 0, saidSeen: false };
    subs.length = 0;
    // 무기
    gunScene.children.filter(o => o.type === 'Group').forEach(o => gunScene.remove(o));
    GUNVIEW.clearDebris(gunScene);
    const ids = mode === 'range' && opts.test ? [opts.test].concat(SAVE.loadout.filter(x => x && x !== opts.test)).slice(0, 3) : SAVE.loadout.filter(Boolean);
    slots = ids.map(makeSlot); cur = -1; equip(0); slots[0].swapT = .5;
    // 괴물
    CREATURES.init(LV, scene, { hurt: hurtPlayer, kill: onKill, seen: onSeen, burst: (p, c, n, s) => burst(p, c, n, s, .6), shake, phase: () => say(RUN.ch.half) });
    if (mode === 'range') RUN.targets = buildTargets();
    else {
      const n = Math.round(ch.count * (mode === 'hunt' ? 1.3 : 1));
      for (let i = 0; i < n; i++) spawnOne(20, true);
      if (ch.boss && (mode === 'hunt' || !(SAVE.research[ch.boss] >= 100))) {
        const d = LV.deep; const b = CREATURES.spawn(ch.boss, LV.cellC(d.x, d.z), { instant: true }); void b;
      }
      MISSIONRT.start(mode === 'story' ? mm : Object.assign({}, mm, { type: 'free' }), { LV, scene, P, RUN, SAVE, say, busy, toast, addMoney, save });
      if (mode === 'story') ch.intro.forEach(say);
      else say(['윤 박사', '자유 사냥이에요. 원할 때 무전기(E)로 돌아오면 돼요.']);
      MISSIONRT.onEquip(slots[0].g);
    }
    AU.ambient(T);
    makeMotes();
    state = 'playing';
    showHud(true);
    $('bossBar').hidden = true; $('scope').hidden = true;
    $('objTitle').textContent = mode === 'range' ? '사격장' : `${MISSIONS.indexOf(mm) + 1}. ${ch.n}`;
    // 임무 시작 제목 화면
    const R0 = mm && REGIONS[mm.r];
    if (mode === 'story') cine.show(`임무 ${MISSIONS.indexOf(mm) + 1} · ${R0 ? R0.n : ''}`, ch.n, R0 ? `${R0.depth} · ${mm.desc || R0.desc}` : '', 4.2);
    else if (mode === 'hunt') cine.show('자유 사냥', R0 ? R0.n : ch.n, '괴물을 잡아 돈을 벌어요', 3);
    lock();
  }
  function spawnOne(minD, initial) {
    const ch = RUN.ch, w = ch.spawn, keys = Object.keys(w);
    let r = Math.random() * keys.reduce((s, k) => s + w[k], 0), sp = keys[0];
    for (const k of keys) { r -= w[k]; if (r <= 0) { sp = k; break; } }
    const p = LV.randomFloor(minD, initial ? LV.start : P.pos);
    if (!p) return;
    if (!initial && LV.los(p.x, p.z, P.pos.x, P.pos.z)) return;
    const c = CREATURES.spawn(sp, p, { instant: initial });
    if (!initial) { c.state = 'hunt'; }
  }
  function endLevel(silent) {
    MISSIONRT.end();
    AU.stopAmbient(); AU.spin(0);
    if (LV) { scene.remove(LV.group); LV.group.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
    CREATURES.clear();
    [...fx.parts, ...fx.tracers].forEach(p => scene.remove(p.m)); fx.parts.length = fx.tracers.length = 0;
    fx.holes.forEach(h => scene.remove(h)); fx.holes.length = 0;
    fx.smoke.forEach(s => scene.remove(s.s)); fx.smoke.length = 0;
    fx.sparks.forEach(s => scene.remove(s.s)); fx.sparks.length = 0;
    fx.goo.forEach(o => { scene.remove(o.m); o.m.geometry.dispose(); o.m.material.dispose(); }); fx.goo.length = 0;
    if (motes) { scene.remove(motes.pts); motes.pts.geometry.dispose(); motes = null; }
    cine.end();
    fx.nades.forEach(n => scene.remove(n.m)); fx.nades.length = 0;
    fx.pops.forEach(p => p.el.remove()); fx.pops.length = 0;
    if (!silent) { state = 'menu'; showHud(false); if (document.pointerLockElement) document.exitPointerLock(); }
    LV = LV && silent ? LV : (silent ? LV : null);
  }

  // ---------------------------------------------------------------
  //  화면 정보 (HUD)
  // ---------------------------------------------------------------
  function showHud(on) { $('hud').hidden = !on; $('touch').hidden = !(on && isTouch); }
  function toast(t) { const el = document.createElement('div'); el.textContent = t; $('toasts').prepend(el); setTimeout(() => el.remove(), 3200); while ($('toasts').children.length > 4) $('toasts').lastChild.remove(); }
  function feed(t, weak) { const el = document.createElement('div'); el.textContent = t; if (weak) el.className = 'weak'; $('feed').prepend(el); setTimeout(() => el.remove(), 2600); while ($('feed').children.length > 5) $('feed').lastChild.remove(); }
  let hitT = 0;
  function showHit(weak, kill) { hitT = .18; const h = $('hitmark'); h.classList.toggle('weak', !!weak); h.classList.toggle('kill', !!kill); }
  function updateSlotsHud() {
    $('slots').innerHTML = '';
    slots.forEach((s, i) => { const d = document.createElement('div'); d.className = 'slot' + (i === cur ? ' on' : ''); d.innerHTML = `<b>${i + 1}</b>${s.g.name}`; $('slots').appendChild(d); });
  }
  const MODE_N = { semi: '반자동', auto: '자동', b3: '3점사', b2: '2점사', pump: '펌프', bolt: '볼트', lever: '레버', single: '단발', sa: '싱글액션', da: '더블액션' };
  const last = {};
  const setT = (id, v) => { if (last[id] !== v) { last[id] = v; $(id).textContent = v; } };
  function updateHud(dt) {
    const W = curW();
    setT('hpNum', String(Math.ceil(P.hp)));
    $('hpFill').style.width = P.hp + '%'; $('hpFill').classList.toggle('low', P.hp < 30);
    if (W) {
      setT('ammoNum', String(W.mag)); setT('ammoMax', '/ ' + W.st.mag);
      $('ammoNum').classList.toggle('empty', W.mag === 0);
      setT('gunName', W.g.name); setT('fireMode', MODE_N[W.g.mode] + (W.st.sup ? ' · 소음' : ''));
      setT('reloadMsg', W.reload ? '장전 중' : W.mag === 0 ? 'R 재장전' : W.mag <= W.st.mag * .25 ? '탄약 부족' : '');
      const moving = Math.hypot(P.vel.x, P.vel.z) > 1.2;
      const sp = (W.st.hip * (1 - RUN.aim) + W.st.ads * RUN.aim) * (moving ? 1.6 : 1) * (P.onGround ? 1 : 2.5) + W.bloom;
      $('cross').style.setProperty('--g', (4 + sp * 420 + RUN.kick * 5).toFixed(1) + 'px');
      $('cross').style.opacity = RUN.aim > .6 ? .15 : 1;
    }
    setT('money', SAVE.money.toLocaleString() + ' G');
    hitT -= dt; $('hitmark').style.opacity = hitT > 0 ? 1 : 0;
    RUN.hurt = Math.max(0, RUN.hurt - dt * 1.8);
    $('vig').style.opacity = Math.max(RUN.hurt, P.hp < 30 ? .4 + Math.sin(RUN.time * 5) * .1 : 0);
    RUN.dmgT -= dt;
    if (RUN.dmgT > 0 && RUN.dmgFrom) {
      const dx = RUN.dmgFrom.x - P.pos.x, dz = RUN.dmgFrom.z - P.pos.z, sy = Math.sin(P.yaw), cy = Math.cos(P.yaw);
      $('dmgdir').style.transform = `translate(-50%,-50%) rotate(${Math.atan2(dx * cy - dz * sy, -dx * sy - dz * cy)}rad)`;
      $('dmgdir').style.opacity = Math.min(1, RUN.dmgT);
    } else $('dmgdir').style.opacity = 0;
    // 목표
    if (RUN.mode !== 'range') {
      const pct = Math.round(MISSIONRT.prog * 100);
      const lines = [];
      if (RUN.mode === 'story') lines.push(...MISSIONRT.lines());
      else lines.push(['자유 사냥 · 돈 벌기', false, `+${RUN.money.toLocaleString()} G`]);
      const html = lines.map(([t, done, r]) => `<li class="${done ? 'done' : ''}"><span>${t}</span><em>${r}</em></li>`).join('');
      if (last.obj !== html) { last.obj = html; $('objList').innerHTML = html; }
      $('objBar').style.width = pct + '%';
    } else { const html = `<li><span>표적을 쏴서 위력을 확인해요</span><em>${RUN.rangeHit || 0}</em></li><li><span>무전기(E)로 나가기</span><em></em></li>`; if (last.obj !== html) { last.obj = html; $('objList').innerHTML = html; } $('objBar').style.width = '0%'; }
    // 무전기 방향
    const goal = RUN.mode === 'story' && !RUN.ready ? MISSIONRT.navTarget() : null;
    const tgt = goal || ((RUN.ready || RUN.mode !== 'story') ? { x: LV.radio.x, z: LV.radio.z, n: '무전기' } : null);
    const nd = tgt ? Math.hypot(tgt.x - P.pos.x, tgt.z - P.pos.z) : 0;
    $('nav').hidden = !tgt || nd < 3;
    if (tgt) {
      const dx = tgt.x - P.pos.x, dz = tgt.z - P.pos.z, sy = Math.sin(P.yaw), cy = Math.cos(P.yaw);
      $('navArrow').style.transform = `rotate(${Math.atan2(dx * cy - dz * sy, -dx * sy - dz * cy)}rad)`;
      setT('navDist', `${tgt.n} ${Math.round(nd)}m`);
    }
    // 보스
    const B = CREATURES.boss;
    const AB = MISSIONRT.bossBar();
    const bossN = B && B.awake && B.state !== 'dead' ? B.S.n : AB ? AB.n : null;
    if (B && B.awake && B.state !== 'dead') { $('bossBar').hidden = false; $('bossFill').style.width = (B.hp / B.max * 100) + '%'; setT('bossName', B.S.n); }
    else if (AB) { $('bossBar').hidden = false; $('bossFill').style.width = (AB.hp * 100) + '%'; setT('bossName', AB.n); }
    else $('bossBar').hidden = true;
    // 보스가 처음 나타나면 경고 화면
    if (bossN && RUN.bossIntro !== bossN) {
      RUN.bossIntro = bossN; RUN.slowT = Math.max(RUN.slowT || 0, .5);
      cine.show('경고 · 거대 생명체 접근', bossN, '빛나는 약점을 노려서 쓰러뜨려요!', 3.2, 'boss'); shake(.4); AU.fx('slam');
    }
    // 목표를 다 채우면 알림
    if (RUN.mode === 'story' && RUN.ready && !RUN.readyShown) {
      RUN.readyShown = true; cine.banner('목표 완료', '입구 무전기로 돌아가 보고하세요'); AU.fx('chapter', undefined, undefined, .6);
    }
    RUN.mapT -= dt; if (RUN.mapT <= 0) { RUN.mapT = .2; drawMap(); }
  }
  function drawMap() {
    const cv = $('minimap'), g = cv.getContext('2d'), S = cv.width, N = LV.N, CS = LV.CS;
    const view = 22, px = P.pos.x / CS, pz = P.pos.z / CS, sc = S / view;
    g.clearRect(0, 0, S, S);
    g.save(); g.translate(S / 2, S / 2); g.rotate(P.yaw); g.translate(-px * sc, -pz * sc);
    g.fillStyle = 'rgba(200,190,170,.26)';
    for (let j = Math.max(0, Math.floor(pz - view)); j < Math.min(N, pz + view); j++) for (let i = Math.max(0, Math.floor(px - view)); i < Math.min(N, px + view); i++) if (LV.explored[j * N + i] && LV.grid[j * N + i]) g.fillRect(i * sc, j * sc, sc + .5, sc + .5);
    g.fillStyle = '#5fe0c8';
    CREATURES.list.forEach(c => { if (c.state === 'dead' && !c.sampled && c.S.sample) g.fillRect(c.pos.x / CS * sc - 2, c.pos.z / CS * sc - 2, 4, 4); });
    g.fillStyle = '#ffb347'; g.beginPath(); g.arc(LV.radio.x / CS * sc, LV.radio.z / CS * sc, 4, 0, PI * 2); g.fill();
    if (RUN.mode !== 'range') MISSIONRT.mapPoints().forEach(o => { g.fillStyle = o.c; g.beginPath(); g.arc(o.x / CS * sc, o.z / CS * sc, o.s || 4, 0, PI * 2); g.fill(); });
    g.restore();
    g.fillStyle = '#f3ece0'; g.beginPath(); g.moveTo(S / 2, S / 2 - 7); g.lineTo(S / 2 - 5, S / 2 + 5); g.lineTo(S / 2 + 5, S / 2 + 5); g.fill();
  }

  // ---------------------------------------------------------------
  //  입력
  // ---------------------------------------------------------------
  function lock() {
    if (isTouch || noLock) return;
    try { const p = renderer.domElement.requestPointerLock(); if (p && p.catch) p.catch(onLockErr); } catch (e) { onLockErr(); }
  }
  function onLockErr() { if (everLocked) { if (state === 'playing') pause(); } else noLock = true; }
  document.addEventListener('pointerlockerror', onLockErr);
  document.addEventListener('pointerlockchange', () => {
    locked = document.pointerLockElement === renderer.domElement;
    if (locked) everLocked = true; else if (state === 'playing' && !P.dead) pause();
  });
  function pause() {
    if (state !== 'playing') return;
    state = 'paused'; input.keys = {}; input.fire = input.aim = input.e = input.f = false; touch.fire = false;
    AU.spin(0); UI.showPause();
  }
  function resume() { AU.init(); state = 'playing'; UI.hideAll(); showHud(true); lock(); }
  function quitToCamp() { save(); endLevel(); UI.showHub('expedition'); }

  addEventListener('keydown', e => {
    if (state !== 'playing') return;
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) e.preventDefault();
    if (e.repeat) return;
    input.keys[e.code] = true;
    if (e.code === 'Space') jump();
    if (e.code === 'KeyR') startReload();
    if (e.code === 'KeyE') input.e = true;
    if (e.code === 'KeyF') input.f = true;
    if (e.code === 'Digit1') equip(0); if (e.code === 'Digit2') equip(1); if (e.code === 'Digit3') equip(2);
    if (e.code === 'KeyQ') equip((cur + 1) % slots.length);
    if (e.code === 'KeyP' || (e.code === 'Escape' && noLock)) pause();
  });
  addEventListener('keyup', e => { input.keys[e.code] = false; if (e.code === 'KeyE') input.e = false; if (e.code === 'KeyF') input.f = false; });
  addEventListener('blur', () => { input.keys = {}; input.fire = false; });
  let mouseDown = false;
  renderer.domElement.addEventListener('mousedown', e => {
    if (state !== 'playing') return;
    if (!locked && !noLock) { lock(); return; }
    mouseDown = true;
    if (e.button === 0) { input.fire = true; input.firePressed = true; }
    if (e.button === 2) input.aim = true;
  });
  addEventListener('mouseup', e => { mouseDown = false; if (e.button === 0) input.fire = false; if (e.button === 2) input.aim = false; });
  addEventListener('contextmenu', e => { if (state === 'playing') e.preventDefault(); });
  addEventListener('mousemove', e => {
    if (state !== 'playing' || P.dead || !(locked || (noLock && mouseDown))) return;
    const W = curW(), z = W ? 1 + (W.st.zoom - 1) * RUN.aim : 1;
    const s = .0021 * SAVE.sens / z;
    const mx = clamp(e.movementX || 0, -250, 250), my = clamp(e.movementY || 0, -250, 250);
    P.yaw -= mx * s; P.pitch -= my * s; input.look.x += mx; input.look.y += my;
  });
  addEventListener('wheel', e => { if (state === 'playing' && slots.length > 1) equip((cur + (e.deltaY > 0 ? 1 : slots.length - 1)) % slots.length); }, { passive: true });

  // 터치
  const touch = { stickId: null, sx: 0, sy: 0, mx: 0, my: 0, lookId: null, lx: 0, ly: 0, fire: false, aim: false, e: false, f: false, sprint: false };
  function setupTouch() {
    const layer = $('touch'), stick = $('stick'), knob = $('knob');
    layer.addEventListener('touchstart', e => {
      e.preventDefault(); if (tedit) return; AU.init();
      for (const t of e.changedTouches) {
        if (t.target.closest && t.target.closest('.tbtn')) continue;
        if (t.clientX < innerWidth * .42 && touch.stickId === null) { touch.stickId = t.identifier; touch.sx = t.clientX; touch.sy = t.clientY; stick.style.display = 'block'; stick.style.left = t.clientX + 'px'; stick.style.top = t.clientY + 'px'; }
        else if (touch.lookId === null) { touch.lookId = t.identifier; touch.lx = t.clientX; touch.ly = t.clientY; }
      }
    }, { passive: false });
    layer.addEventListener('touchmove', e => {
      e.preventDefault(); if (tedit) return;
      for (const t of e.changedTouches) {
        if (t.identifier === touch.stickId) {
          const sr = 50 * (SAVE.stickS || 1); // 조이스틱이 크면 더 멀리 밀어야 끝까지 간다
          let dx = (t.clientX - touch.sx) / sr, dy = (t.clientY - touch.sy) / sr; const l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; }
          touch.mx = dx; touch.my = dy; touch.sprint = dy < -.95; knob.style.transform = `translate(${dx * 35}px, ${dy * 35}px)`;
        } else if (t.identifier === touch.lookId) {
          const W = curW(), z = W ? 1 + (W.st.zoom - 1) * RUN.aim : 1;
          const dx = t.clientX - touch.lx, dy = t.clientY - touch.ly; touch.lx = t.clientX; touch.ly = t.clientY;
          P.yaw -= dx * .0055 * SAVE.sens / z; P.pitch -= dy * .0055 * SAVE.sens / z; input.look.x += dx; input.look.y += dy;
        }
      }
    }, { passive: false });
    const end = e => { for (const t of e.changedTouches) { if (t.identifier === touch.stickId) { touch.stickId = null; touch.mx = touch.my = 0; touch.sprint = false; stick.style.display = 'none'; knob.style.transform = ''; } if (t.identifier === touch.lookId) touch.lookId = null; } };
    layer.addEventListener('touchend', end); layer.addEventListener('touchcancel', end);
    const btn = (id, down, up) => { const el = $(id); el.addEventListener('touchstart', e => { e.preventDefault(); e.stopPropagation(); if (tedit) return; AU.init(); down(); }, { passive: false }); if (up) { el.addEventListener('touchend', e => { e.preventDefault(); up(); }); el.addEventListener('touchcancel', up); } };
    btn('tFire', () => { touch.fire = true; input.firePressed = true; }, () => { touch.fire = false; });
    btn('tAim', () => { touch.aim = !touch.aim; $('tAim').classList.toggle('on', touch.aim); });
    btn('tJump', jump); btn('tReload', startReload);
    btn('tSwap', () => equip((cur + 1) % slots.length));
    btn('tUse', () => { touch.e = true; }, () => { touch.e = false; });
    btn('tScan', () => { touch.f = true; }, () => { touch.f = false; });
    btn('tPause', pause);
  }
  setupTouch();

  // ---------------------------------------------------------------
  //  핸드폰 버튼 배치: 끌어서 옮기고, 크기를 바꾸고, 저장한다
  //  SAVE.touchLayout[id] = { x, y (화면 가로·세로 비율로 버튼 가운데), s (크기 배율) }
  // ---------------------------------------------------------------
  const TBTN = { tFire: '발사', tAim: '조준', tJump: '점프', tReload: '장전', tSwap: '무기 바꾸기', tUse: 'E (샘플·보고)', tScan: '스캔', tPause: '멈춤' };
  function applyTouchLayout() {
    const L = SAVE.touchLayout || {};
    Object.keys(TBTN).forEach(id => {
      const el = $(id), p = L[id];
      if (!p) { el.style.left = el.style.top = el.style.right = el.style.bottom = el.style.margin = el.style.transform = ''; return; }
      Object.assign(el.style, { left: p.x * 100 + '%', top: p.y * 100 + '%', right: 'auto', bottom: 'auto', margin: '0', transform: `translate(-50%, -50%) scale(${p.s})` });
    });
    $('stick').style.transform = `scale(${SAVE.stickS || 1})`;
  }
  applyTouchLayout();
  let tedit = null;
  function editTouch(done) {
    if (tedit) return;
    const layer = $('touch'); layer.hidden = false; layer.classList.add('editing'); $('tedit').hidden = false; $('tedit').style.cssText = '';
    const stick = $('stick'); stick.style.display = 'block'; stick.style.left = '22%'; stick.style.top = '68%';
    // 아직 옮긴 적 없는 버튼은 지금 자리를 그대로 적어 둔다
    const L = SAVE.touchLayout = SAVE.touchLayout || {};
    Object.keys(TBTN).forEach(id => {
      if (L[id]) return;
      const r = $(id).getBoundingClientRect();
      L[id] = { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight, s: 1 };
    });
    applyTouchLayout();
    const size = $('teSize'), stickR = $('teStick');
    const sel = id => {
      tedit.sel = id; Object.keys(TBTN).forEach(k => $(k).classList.toggle('sel', k === id));
      $('teSelN').textContent = TBTN[id] + ' 버튼'; size.value = L[id].s; $('teSizeV').textContent = Math.round(L[id].s * 100) + '%';
    };
    const panel = $('tedit'), bar = panel.querySelector('.tt');
    const down = e => {
      const el = e.target.closest('.tbtn'); if (!el) return;
      e.preventDefault(); e.stopPropagation(); sel(el.id);
      tedit.drag = { id: el.id, pid: e.pointerId, ox: e.clientX - L[el.id].x * innerWidth, oy: e.clientY - L[el.id].y * innerHeight };
      panel.classList.add('ghost'); // 버튼을 옮기는 동안은 설정 창이 흐려져서 뒤가 보인다
    };
    // 설정 창도 제목 줄을 잡고 끌어서 옮길 수 있다 (뒤에 가려진 버튼을 꺼내려고)
    const barDown = e => {
      e.preventDefault(); const r = panel.getBoundingClientRect();
      tedit.drag = { panel: true, pid: e.pointerId, ox: e.clientX - r.left, oy: e.clientY - r.top };
    };
    const move = e => {
      const d = tedit.drag; if (!d || e.pointerId !== d.pid) return;
      e.preventDefault();
      if (d.panel) {
        const r = panel.getBoundingClientRect();
        Object.assign(panel.style, { left: clamp(e.clientX - d.ox, 0, innerWidth - r.width) + 'px', top: clamp(e.clientY - d.oy, 0, innerHeight - r.height) + 'px', transform: 'none' });
        return;
      }
      L[d.id].x = clamp((e.clientX - d.ox) / innerWidth, .03, .97); L[d.id].y = clamp((e.clientY - d.oy) / innerHeight, .03, .97);
      applyTouchLayout();
    };
    const up = e => { if (tedit.drag && e.pointerId === tedit.drag.pid) { tedit.drag = null; panel.classList.remove('ghost'); } };
    layer.addEventListener('pointerdown', down); bar.addEventListener('pointerdown', barDown);
    addEventListener('pointermove', move, { passive: false }); addEventListener('pointerup', up); addEventListener('pointercancel', up);
    size.oninput = () => { L[tedit.sel].s = +size.value; $('teSizeV').textContent = Math.round(size.value * 100) + '%'; applyTouchLayout(); };
    stickR.value = SAVE.stickS || 1; $('teStickV').textContent = Math.round(stickR.value * 100) + '%';
    stickR.oninput = () => { SAVE.stickS = +stickR.value; $('teStickV').textContent = Math.round(stickR.value * 100) + '%'; applyTouchLayout(); };
    $('teAll').onclick = () => { const s = L[tedit.sel].s; Object.keys(TBTN).forEach(k => L[k].s = s); applyTouchLayout(); };
    $('teReset').onclick = () => { SAVE.touchLayout = null; SAVE.stickS = 1; close(); editTouch(done); };
    const close = () => {
      layer.removeEventListener('pointerdown', down); bar.removeEventListener('pointerdown', barDown); removeEventListener('pointermove', move); removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
      Object.keys(TBTN).forEach(k => $(k).classList.remove('sel'));
      layer.classList.remove('editing'); layer.hidden = true; $('tedit').hidden = true; stick.style.display = 'none';
      tedit = null; applyTouchLayout(); save();
    };
    $('teDone').onclick = () => { close(); done && done(); };
    tedit = { sel: null, drag: null };
    sel('tFire');
  }

  addEventListener('resize', () => {
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = gunCam.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); gunCam.updateProjectionMatrix();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });

  // ---------------------------------------------------------------
  //  메인 반복
  // ---------------------------------------------------------------
  const clock = new THREE.Clock();
  let menuScene = null;
  function frame() {
    requestAnimationFrame(frame);
    const dt = Math.min(.05, clock.getDelta());
    if (state === 'playing' && LV) step(dt);
    else if (state === 'menu') { if (typeof UI !== 'undefined' && UI.menuRender) UI.menuRender(dt); return; }
    renderer.clear();
    if (LV) renderer.render(scene, camera);
    const W = curW();
    if (W && state !== 'menu' && W.view.root.visible && !P.dead) { renderer.clearDepth(); renderer.render(gunScene, gunCam); }
  }
  function step(dt) {
    {
      cine.update(dt);
      // 잠깐 느려지는 순간 (약점으로 처치, 보스 등장·처치)
      if (RUN.slowT > 0) { RUN.slowT -= dt; dt *= RUN.slowT > .3 ? .35 : .5; }
      RUN.time += dt;
      updatePlayer(dt);
      updateWeapon(dt);
      CREATURES.update(dt, P);
      updateFx(dt);
      if (RUN.mode === 'range') updateTargets(dt);
      else {
        RUN.spawnT -= dt;
        if (RUN.spawnT <= 0) { RUN.spawnT = RUN.mode === 'hunt' || RUN.ch.type === 'hunt' ? 9 : 20; if (CREATURES.alive() < RUN.ch.count * .7) spawnOne(26, false); }
        MISSIONRT.update(dt, talking);
      }
      updateCamera(dt);
      updateView(dt);
      updateInteract(dt);
      if (state !== 'playing' || !LV) return; // 보고하고 캠프로 갔다
      updateSubs(dt);
      updateHud(dt);
      updatePops(dt);
      LV.update(dt, camera.position);
      AU.tick(dt);
      GUNVIEW.updateDebris(dt, gunScene);
    }
  }
  frame();
  void menuScene;

  return {
    SAVE, save, load, resetSave, modsOf, renderer, startLevel, resume, pause, quitToCamp, isTouch, editTouch,
    get state() { return state; }, set state(v) { state = v; },
    setSens(v) { SAVE.sens = v; save(); }, setVol(v) { SAVE.vol = v; AU.setVolume(v); save(); },
    // 시험용: 화면을 그리지 않고 게임 시간을 앞으로 돌린다
    _dbg: { input, P, get slots() { return slots; }, get cur() { return cur; }, step: dt => { if (state === 'playing' && LV) { scene.updateMatrixWorld(); gunScene.updateMatrixWorld(); step(dt); } }, equip, startReload, get LV() { return LV; }, get RUN() { return RUN; } },
  };
})();
