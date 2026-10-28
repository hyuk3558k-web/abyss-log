'use strict';
// =====================================================================
//  임무 진행 + 옆에서 따라다니는 윤 박사
// =====================================================================
const MISSIONRT = (() => {
  const V3 = THREE.Vector3, PI = Math.PI;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  let X = null;         // 게임이 넘겨준 도구들
  let m = null, LV = null, scene = null, P = null;
  let objs = [], yoon = null, surv = null, alphaC = null;
  const S = {};         // 진행 상태

  // ---------- 재질 ----------
  const std = (c, o) => { const mt = new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .7, flatShading: true }, o || {})); mt.color.convertSRGBToLinear(); if (o && o.emissive) mt.emissive.convertSRGBToLinear(); return mt; };
  const basic = c => new THREE.MeshBasicMaterial({ color: c });
  const glow = (c, s) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: WORLD.getGlow(), color: c, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); sp.scale.setScalar(s); return sp; };
  function mk(parent, geo, mat, x, y, z) { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.castShadow = true; parent.add(o); return o; }
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);

  // ---------- 사람 모양 (윤 박사 · 구조할 사람) ----------
  function human(C) {
    const g = new THREE.Group(), skin = std(0xe8c0a0), coat = std(C.coat), pants = std(C.pants), hair = std(C.hair);
    const legs = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * .1, .9, 0); g.add(p); mk(p, box(.14, .86, .16), pants, 0, -.43, 0); mk(p, box(.15, .08, .24), std(0x2a2420), 0, -.86, .04); return p; });
    mk(g, box(.42, .58, .24), coat, 0, 1.2, 0);
    if (C.long) mk(g, box(.46, .36, .27), coat, 0, .84, 0);
    if (C.vest) mk(g, box(.44, .4, .26), std(C.vest), 0, 1.25, 0);
    const arms = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * .28, 1.46, 0); g.add(p); mk(p, box(.11, .58, .12), coat, 0, -.28, 0); mk(p, box(.09, .1, .1), skin, 0, -.6, 0); return p; });
    const head = new THREE.Group(); head.position.set(0, 1.63, 0); g.add(head);
    mk(head, new THREE.SphereGeometry(.13, 12, 10), skin, 0, 0, 0);
    const h = mk(head, new THREE.SphereGeometry(.14, 12, 8, 0, PI * 2, 0, PI * .55), hair, 0, .02, -.01); h.rotation.x = -.25;
    if (C.tail) { const t = mk(head, box(.07, .22, .07), hair, 0, -.08, -.15); t.rotation.x = .4; }
    if (C.glasses) { mk(head, box(.22, .035, .02), basic(0x101010), 0, .02, .125); [-1, 1].forEach(s => mk(head, box(.07, .05, .01), new THREE.MeshBasicMaterial({ color: 0x8ab8d8, transparent: true, opacity: .5 }), s * .055, .015, .13)); }
    if (C.lamp) { mk(head, box(.06, .05, .05), std(0x303030), 0, .1, .12); const gl = glow(0xfff0c0, .35); gl.position.set(0, .1, .16); head.add(gl); }
    if (C.pack) mk(g, box(.32, .42, .16), std(0x4a5a3a), 0, 1.2, -.2);
    let tablet = null;
    if (C.tablet) { tablet = mk(arms[1], box(.16, .22, .02), basic(0x5fe0c8), -.05, -.55, .1); tablet.rotation.x = -.9; }
    return { g, legs, arms, head, tablet, ph: 0 };
  }
  function animHuman(h, speed, dt, talk) {
    h.ph += dt * (2 + speed * 1.6);
    const k = Math.min(1, speed / 3);
    h.legs[0].rotation.x = Math.sin(h.ph) * .6 * k; h.legs[1].rotation.x = -Math.sin(h.ph) * .6 * k;
    h.arms[0].rotation.x = -Math.sin(h.ph) * .5 * k; h.arms[1].rotation.x = h.tablet ? -.5 : Math.sin(h.ph) * .5 * k;
    h.head.rotation.x = talk ? Math.sin(h.ph * 4) * .06 : 0;
    h.g.position.y = Math.abs(Math.sin(h.ph)) * .03 * k;
    if (h.tablet) h.tablet.material.color.setHSL(.47, .7, .55 + Math.sin(h.ph * 2) * .1);
  }

  // ---------- 따라다니기 ----------
  const tmp = new V3();
  function follow(F, dt, dist, side) {
    const sy = Math.sin(P.yaw), cy = Math.cos(P.yaw);
    // 플레이어 뒤쪽 옆
    const tx = P.pos.x + sy * dist + cy * side, tz = P.pos.z + cy * dist - sy * side;
    let gx = tx, gz = tz;
    const pd = Math.hypot(P.pos.x - F.pos.x, P.pos.z - F.pos.z);
    const see = LV.los(F.pos.x, F.pos.z, P.pos.x, P.pos.z);
    if (LV.isWallAt(tx, tz) || !see) { if (LV.nextStep(F.pos.x, F.pos.z, tmp)) { gx = tmp.x; gz = tmp.z; } else { gx = P.pos.x; gz = P.pos.z; } }
    F.lost = see ? 0 : F.lost + dt;
    if (pd > 22 || F.lost > 6) {
      // 너무 멀어지면 플레이어 뒤로 순간이동 (보이지 않는 곳)
      for (let k = 0; k < 8; k++) { const a = P.yaw + rand(-.7, .7), r = rand(2.5, 4); const x = P.pos.x + Math.sin(a) * r, z = P.pos.z + Math.cos(a) * r; if (!LV.isWallAt(x, z)) { F.pos.set(x, 0, z); F.lost = 0; break; } }
    }
    const dx = gx - F.pos.x, dz = gz - F.pos.z, d = Math.hypot(dx, dz);
    const want = d < .5 ? 0 : Math.min(7.6, d * 2.6);
    const a = Math.min(1, dt * 6);
    F.vel.x += ((d > .01 ? dx / d : 0) * want - F.vel.x) * a; F.vel.z += ((d > .01 ? dz / d : 0) * want - F.vel.z) * a;
    F.pos.x += F.vel.x * dt; F.pos.z += F.vel.z * dt;
    LV.collide(F.pos, .3);
    if (Math.hypot(F.pos.x - P.pos.x, F.pos.z - P.pos.z) < .8) { const k = .8 / Math.max(.01, Math.hypot(F.pos.x - P.pos.x, F.pos.z - P.pos.z)); F.pos.x = P.pos.x + (F.pos.x - P.pos.x) * k; F.pos.z = P.pos.z + (F.pos.z - P.pos.z) * k; }
    const spd = Math.hypot(F.vel.x, F.vel.z);
    // 바라보기: 걸을 땐 가는 쪽, 서 있으면 주원 쪽 (괴물이 가까우면 괴물 쪽)
    let look = spd > .6 ? Math.atan2(F.vel.x, F.vel.z) : Math.atan2(P.pos.x - F.pos.x, P.pos.z - F.pos.z);
    const near = CREATURES.list.find(c => c.state !== 'dead' && c.pos.distanceTo(F.pos) < 10);
    if (near && spd < 2) look = Math.atan2(near.pos.x - F.pos.x, near.pos.z - F.pos.z);
    let dy = look - F.yaw; while (dy > PI) dy -= PI * 2; while (dy < -PI) dy += PI * 2; F.yaw += dy * Math.min(1, dt * 8);
    F.h.g.position.x = F.pos.x; F.h.g.position.z = F.pos.z; F.h.g.rotation.y = F.yaw;
    return spd;
  }
  function makeFollower(h, pos) { const F = { h, pos: pos.clone(), vel: new V3(), yaw: 0, lost: 0 }; h.g.position.copy(pos); scene.add(h.g); return F; }

  // ---------- 임무 물건 ----------
  const ITEM = { 0: ['일기장', 'book'], 1: ['일기장', 'book'], 2: ['보급 상자', 'crate'], 3: ['보급 상자', 'crate'], 4: ['연구 일지', 'book'], 5: ['수정 표본', 'crystal'], 6: ['포자 주머니', 'spore'], 7: ['보급 상자', 'crate'], 8: ['연구 일지', 'book'] };
  const POWER = { 1: '발전기', 4: '비상 전원', 6: '중계기', 8: '봉인 장치' };
  const DEVICE = { 1: '통신 장치', 4: '서버', 7: '보급 장치' };
  function nameOf(type) {
    if (type === 'survey') return '신호기';
    if (type === 'collect') return (ITEM[m.r] || ITEM[2])[0];
    if (type === 'power') return POWER[m.r] || '발전기';
    if (type === 'defend') return DEVICE[m.r] || '통신 장치';
    return '';
  }
  function spots(n) {
    // 출발점에서 먼 방부터 고르게 골라 물건을 둔다
    const rs = LV.rooms.filter(r => !r.start).map(r => ({ r, d: Math.hypot(r.x - LV.rooms[0].x, r.z - LV.rooms[0].z) })).sort((a, b) => a.d - b.d);
    const out = [];
    for (let k = 0; k < n; k++) {
      let p = null;
      if (rs.length) { const idx = Math.min(rs.length - 1, Math.floor((k + 1) / n * rs.length - .5 + rs.length * .1)); const r = rs.splice(Math.max(0, Math.min(rs.length - 1, idx)), 1)[0].r; p = LV.cellC(r.x, r.z); }
      if (!p || out.some(o => o.distanceTo(p) < 8)) p = LV.randomFloor(14, LV.start) || LV.start.clone();
      for (let t = 0; t < 10; t++) { const q = p.clone().add(new V3(rand(-2, 2), 0, rand(-2, 2))); if (!LV.isWallAt(q.x, q.z) && !LV.isWallAt(q.x + .8, q.z) && !LV.isWallAt(q.x - .8, q.z) && !LV.isWallAt(q.x, q.z + .8) && !LV.isWallAt(q.x, q.z - .8)) { p = q; break; } }
      p.y = 0; out.push(p);
    }
    return out;
  }
  function buildObj(type, pos) {
    const g = new THREE.Group(); g.position.copy(pos);
    const o = { type, pos, g, done: false, light: null, t: Math.random() * 6 };
    if (type === 'survey') {
      mk(g, new THREE.CylinderGeometry(.04, .05, 1.8, 6), std(0x3a3a3a, { metalness: .6 }), 0, .9, 0);
      [-1, 0, 1].forEach(k => { const l = mk(g, box(.02, .7, .02), std(0x3a3a3a), Math.sin(k * 2.1) * .35, .32, Math.cos(k * 2.1) * .35); l.rotation.set(Math.cos(k * 2.1) * .45, 0, -Math.sin(k * 2.1) * .45); });
      o.head = mk(g, box(.22, .16, .16), std(0xd8a020, { emissive: 0xffb020, emissiveIntensity: .8 }), 0, 1.85, 0);
      o.glow = glow(0xffc040, 1.4); o.glow.position.y = 1.95; g.add(o.glow);
    } else if (type === 'collect') {
      const kind = (ITEM[m.r] || ITEM[2])[1];
      if (kind === 'book') { mk(g, box(.32, .07, .24), std(0x5a3a2a), 0, .5, 0); mk(g, box(.3, .06, .22), std(0xe8e0c8), .005, .54, 0); mk(g, box(.6, .5, .5), std(0x4a3a2a), 0, .25, 0); }
      else if (kind === 'crate') { mk(g, box(.7, .5, .5), std(0x4a5a3a), 0, .25, 0); mk(g, box(.72, .08, .52), std(0x2a2a2a), 0, .5, 0); mk(g, box(.2, .1, .02), basic(0xffffff), 0, .3, .26); }
      else if (kind === 'crystal') { const c = mk(g, new THREE.OctahedronGeometry(.25, 0), std(0xb070ff, { emissive: 0xb070ff, emissiveIntensity: .9, roughness: .2 }), 0, .55, 0); c.scale.y = 2; o.spin = c; }
      else { const c = mk(g, new THREE.SphereGeometry(.28, 12, 10), std(0x20a090, { emissive: 0x40ffd0, emissiveIntensity: .8 }), 0, .45, 0); o.spin = c; }
      o.glow = glow(0x60c8ff, 1.6); o.glow.position.y = .7; g.add(o.glow);
    } else if (type === 'power') {
      mk(g, box(1, 1, .7), std(0x6a6a30, { metalness: .4 }), 0, .5, 0); mk(g, box(1.04, .1, .74), std(0x2a2a2a), 0, 1.02, 0);
      mk(g, new THREE.CylinderGeometry(.08, .08, .5, 6), std(0x3a3a3a), .3, 1.3, 0);
      o.head = mk(g, box(.2, .12, .02), std(0x401010, { emissive: 0xff2010, emissiveIntensity: .8 }), -.2, .7, .36);
      o.glow = glow(0xff4020, .9); o.glow.position.set(-.2, .7, .4); g.add(o.glow);
      LV.obstacles.push({ x: pos.x, z: pos.z, r: .7 });
    } else if (type === 'defend') {
      mk(g, box(1.2, 1.3, .8), std(0x3a4450, { metalness: .5 }), 0, .65, 0);
      mk(g, new THREE.CylinderGeometry(.03, .03, 2.4, 5), std(0x2a2a2a), .4, 2.4, 0);
      o.head = mk(g, box(.8, .4, .02), std(0x103020, { emissive: 0x40ff90, emissiveIntensity: .7 }), 0, .9, .41);
      o.glow = glow(0x40ff90, 1.2); o.glow.position.set(.4, 3.6, 0); g.add(o.glow);
      o.ring = new THREE.Mesh(new THREE.RingGeometry(8.6, 9, 64), new THREE.MeshBasicMaterial({ color: 0x40ff90, transparent: true, opacity: .25, side: THREE.DoubleSide, depthWrite: false }));
      o.ring.rotation.x = -PI / 2; o.ring.position.y = .06; g.add(o.ring);
      LV.obstacles.push({ x: pos.x, z: pos.z, r: .8 });
    }
    scene.add(g); objs.push(o); return o;
  }

  // ---------- 괴물 부르기 ----------
  function pickSp() {
    const w = m.spawn, keys = Object.keys(w); let r = Math.random() * keys.reduce((s, k) => s + w[k], 0);
    for (const k of keys) { r -= w[k]; if (r <= 0) return k; } return keys[0];
  }
  function spawnNear(center, n, minR, maxR) {
    let made = 0;
    for (let t = 0; t < n * 12 && made < n; t++) {
      const a = Math.random() * PI * 2, r = rand(minR, maxR), x = center.x + Math.cos(a) * r, z = center.z + Math.sin(a) * r;
      const i = Math.floor(x / LV.CS), j = Math.floor(z / LV.CS);
      if (!LV.isFloor(i, j) || LV.dw[j * LV.N + i] < 1) continue;
      if (Math.hypot(x - P.pos.x, z - P.pos.z) < 9) continue;
      if (CREATURES.alive() > 26) break;
      const c = CREATURES.spawn(pickSp(), new V3(x, 0, z)); c.state = 'hunt'; made++;
    }
    return made;
  }

  // ---------- 말하기 ----------
  const bag = {};
  function fromBag(key, list) {
    if (!bag[key] || !bag[key].length) bag[key] = list.slice().sort(() => Math.random() - .5);
    return bag[key].pop();
  }
  function sayY(t) { X.say(['윤 박사', t]); }
  function sayLow(t) { if (!X.busy()) sayY(t); }
  const cd = {};
  function ready(k, sec) { const now = S.time; if (cd[k] !== undefined && now - cd[k] < sec) return false; cd[k] = now; return true; }

  // ---------- 시작 ----------
  function start(mission, ctx) {
    X = ctx; m = mission; LV = ctx.LV; scene = ctx.scene; P = ctx.P;
    objs = []; surv = null; alphaC = null;
    Object.keys(S).forEach(k => delete S[k]); Object.keys(cd).forEach(k => delete cd[k]);
    Object.assign(S, { time: 0, prog: 0, ready: false, idleT: rand(25, 40), regionSaid: 0, combo: [], kills: 0, seen: {}, waveT: 8, timer: 0, started: false, away: 0, half: false, said50: false, hints: {}, guns: {}, money: false });
    // 윤 박사
    const yh = human({ coat: 0xe8e8e0, pants: 0x30384a, hair: 0x1a1210, long: 1, tail: 1, glasses: 1, lamp: 1, pack: 1, tablet: 1 });
    yoon = makeFollower(yh, LV.start.clone().add(new V3(-1.2, 0, -1)));
    // 임무 물건
    const t = m.type;
    if (['survey', 'collect', 'power'].includes(t)) spots(m.goal).forEach(p => buildObj(t, p));
    if (t === 'defend') { const rs = LV.rooms.filter(r => !r.start).sort((a, b) => Math.hypot(a.x - LV.rooms[0].x, a.z - LV.rooms[0].z) - Math.hypot(b.x - LV.rooms[0].x, b.z - LV.rooms[0].z)); const r = rs[Math.floor(rs.length * .45)] || rs[0]; buildObj('defend', r ? LV.cellC(r.x, r.z) : LV.start.clone().add(new V3(8, 0, 0))); }
    if (t === 'rescue') {
      const d = LV.deep, p = LV.cellC(d.x, d.z);
      const h = human({ coat: 0x7a6a50, pants: 0x3a3a30, hair: 0x9a9a9a, vest: 0xe07020, pack: 0 });
      surv = makeFollower(h, p); surv.found = false; surv.yaw = rand(0, 6);
      h.legs.forEach(l => l.rotation.x = -1.45); h.g.position.y = -.45;
      const sos = glow(0xff4020, 1.2); sos.position.y = 2.2; h.g.add(sos); surv.sos = sos;
    }
    if (t === 'alpha') {
      const d = LV.deep; alphaC = CREATURES.spawn(m.sp, LV.cellC(d.x, d.z), { instant: true, alpha: true });
    }
    if (t === 'survive') S.timer = 0;
  }

  // ---------- 매 프레임 ----------
  function update(dt, talking) {
    if (!m) return;
    S.time += dt;
    // 주원이 멈춰 있으면 앞쪽 옆으로 나와서 얼굴을 보여 주고, 움직이면 뒤를 따라간다
    const still = Math.hypot(P.vel.x, P.vel.z) < 1;
    S.stillT = still ? (S.stillT || 0) + dt : 0;
    const ys = S.stillT > 1.2 ? follow(yoon, dt, -2.8, 1.7) : follow(yoon, dt, 1.9, 1.1);
    animHuman(yoon.h, ys, dt, talking);
    objs.forEach(o => {
      o.t += dt;
      if (o.glow) o.glow.material.opacity = o.done ? .4 : .6 + Math.sin(o.t * 4) * .4;
      if (o.spin) o.spin.rotation.y += dt;
      if (o.type === 'survey' && !o.done) o.head.rotation.y += dt * 2;
      if (o.ring) o.ring.material.opacity = S.started && !S.ready ? .25 + Math.sin(o.t * 3) * .1 : .12;
    });
    // 구조할 사람
    if (surv) {
      if (surv.found) {
        const sp = follow(surv, dt, 2.6, -1.1); animHuman(surv.h, sp, dt, false);
        if (!S.ready && Math.hypot(surv.pos.x - LV.radio.x, surv.pos.z - LV.radio.z) < 5) { S.prog = 1; complete(); }
      } else { surv.sos.visible = Math.sin(S.time * 5) > 0; surv.h.g.position.set(surv.pos.x, -.45, surv.pos.z); }
    }
    const t = m.type;
    // 버티기
    if (t === 'survive' && !S.ready) {
      if (!S.started && S.time > 4) { S.started = true; sayY(YOON.obj.survive.start); }
      if (S.started) {
        S.timer += dt; S.prog = S.timer / m.goal;
        S.waveT -= dt;
        if (S.waveT <= 0) { S.waveT = Math.max(6, 11 - S.timer / 40); const n = 2 + Math.floor(S.timer / 45); if (spawnNear(P.pos, n, 16, 30) && Math.random() < .3) sayLow(YOON.obj.survive.wave); }
        if (!S.half && S.prog >= .5) { S.half = true; sayY(YOON.obj.survive.half); }
        if (S.timer >= m.goal) complete();
      }
    }
    // 지키기
    if (t === 'defend' && S.started && !S.ready) {
      const o = objs[0], d = Math.hypot(P.pos.x - o.pos.x, P.pos.z - o.pos.z);
      if (d < 9) { S.timer += dt; S.away = 0; } else { S.away += dt; if (S.away > 2 && ready('away', 12)) sayY(YOON.obj.defend.away); }
      S.prog = S.timer / m.goal;
      S.waveT -= dt;
      if (S.waveT <= 0) { S.waveT = Math.max(7, 12 - S.timer / 30); spawnNear(o.pos, 2 + Math.floor(S.timer / 40), 14, 26); }
      if (!S.half && S.prog >= .5) { S.half = true; sayY(YOON.obj.defend.half); }
      if (S.timer >= m.goal) complete();
    }
    // 연구 목표
    if ((t === 'research') && !S.ready) {
      const pct = X.SAVE.research[m.sp] || 0; S.prog = pct / 100;
      if (!S.said50 && pct >= 50) { S.said50 = true; sayY(pick(YOON.research50)); }
      if (pct >= 100) complete();
    }
    if (t === 'boss') {
      const B = CREATURES.boss; S.prog = B ? 1 - B.hp / B.max : 0;
      if (X.SAVE.research[m.sp] >= 100 || (B && B.state === 'dead')) complete();
    }
    if (t === 'alpha' && alphaC && !S.ready) {
      S.prog = 1 - Math.max(0, alphaC.hp) / alphaC.max;
      if (!S.alphaSeen && alphaC.pos.distanceTo(P.pos) < 24 && LV.los(alphaC.pos.x, alphaC.pos.z, P.pos.x, P.pos.z)) { S.alphaSeen = true; sayY(YOON.obj.alpha.seen); if (alphaC.state === 'idle') alphaC.state = 'hunt'; }
      if (!S.alphaHurt && S.prog > .6) { S.alphaHurt = true; sayY(YOON.obj.alpha.hurt); }
      if (alphaC.state === 'dead') complete();
    }
    talk(dt);
  }

  function complete() {
    if (S.ready) return;
    S.ready = true; S.prog = 1;
    X.RUN.ready = true;
    if (m.done) sayY(m.done);
    sayY(pick(YOON.obj.ready));
    AU.fx('scanDone'); X.save();
  }

  // ---------- 저절로 하는 말 ----------
  function talk(dt) {
    const fight = CREATURES.list.some(c => c.state !== 'dead' && c.state !== 'idle' && c.pos.distanceTo(P.pos) < 22);
    if (!fight && !X.busy()) S.idleT -= dt;
    if (S.idleT <= 0) {
      S.idleT = rand(35, 65);
      const rl = YOON.region[m.r] || [];
      if (S.regionSaid < 2 && rl.length) { S.regionSaid++; sayY(fromBag('r' + m.r, rl)); }
      else if (Math.random() < .3 && rl.length) sayY(fromBag('r' + m.r, rl));
      else sayY(fromBag('idle', YOON.idle));
    }
    if (P.hp < 35 && !P.dead && ready('hurt', 25)) sayY(pick(YOON.hurt));
    if (!S.hints.sample && S.time > 50 && X.RUN.samples === 0 && CREATURES.nearestCorpse(P.pos, 12)) { S.hints.sample = true; sayLow(YOON.sampleHint[0]); }
    if (!S.hints.scan && m.type === 'research' && S.time > 90 && !S.scanned) { S.hints.scan = true; sayLow(YOON.scanHint[0]); }
    if (!S.money && X.RUN.money >= 2500) { S.money = true; sayLow(YOON.money[0]); }
  }

  // ---------- 게임에서 알려 주는 일 ----------
  function onKill(c, weak) {
    if (!m) return;
    const now = S.time; S.combo = S.combo.filter(t => now - t < 3.5); S.combo.push(now);
    if (m.type === 'hunt' && !S.ready && (!m.sp || c.sp === m.sp)) {
      S.kills++; S.prog = S.kills / m.goal;
      const left = m.goal - S.kills;
      if (left === Math.floor(m.goal / 2)) sayY(YOON.obj.hunt.half); else if (left > 0 && left <= 3) sayLow(YOON.obj.hunt.last(left));
      if (S.kills >= m.goal) complete();
    }
    if (S.combo.length >= 3 && ready('multi', 12)) { sayY(pick(YOON.multi)); S.combo = []; }
    else if (weak && Math.random() < .3 && ready('kill', 8)) sayLow(pick(YOON.weak));
    else if (Math.random() < .18 && ready('kill', 8)) sayLow(pick(YOON.kill));
  }
  function onSeen(c) {
    if (!m || S.seen[c.sp]) return; S.seen[c.sp] = 1;
    const l = YOON.seen[c.sp]; if (l) sayY(pick(l));
  }
  function onSample() { if (Math.random() < .4 && ready('sample', 20)) sayLow(pick(YOON.sample)); }
  function onScan() { S.scanned = true; if (Math.random() < .4 && ready('scan', 20)) sayLow(pick(YOON.scan)); }
  function onEmpty() { if (ready('empty', 45)) sayLow(pick(YOON.empty)); }
  function onEquip(g, first) {
    if (!m || S.guns[g.id]) return; S.guns[g.id] = 1;
    const told = X.SAVE.gunTalk || (X.SAVE.gunTalk = []);
    if (told.includes(g.id) && !first) return;
    if (told.includes(g.id)) return;
    told.push(g.id); YOON.newGun(g).forEach(t => sayY(t));
  }

  // ---------- 상호작용 (E / F) ----------
  function interact() {
    if (!m || S.ready) return null;
    const t = m.type;
    if (surv && !surv.found && Math.hypot(P.pos.x - surv.pos.x, P.pos.z - surv.pos.z) < 2.6)
      return { key: 'e', need: 1.2, text: '[E] 길게 눌러 구조하기', act: () => { surv.found = true; surv.sos.visible = false; surv.h.legs.forEach(l => l.rotation.x = 0); sayY(YOON.obj.rescue.found); sayY(YOON.obj.rescue.follow); X.toast('구조 성공! 무전기까지 데려가요'); AU.fx('scanDone'); } };
    for (const o of objs) {
      if (o.done) continue;
      const d = Math.hypot(P.pos.x - o.pos.x, P.pos.z - o.pos.z);
      if (o.type === 'survey' && d < 4.5) return { key: 'f', need: 1.4, text: '[F] 길게 눌러 신호기 스캔', act: () => doneObj(o) };
      if (o.type === 'collect' && d < 2.4) return { key: 'e', need: .8, text: `[E] 길게 눌러 ${nameOf('collect')} 줍기`, act: () => doneObj(o) };
      if (o.type === 'power' && d < 2.6) return { key: 'e', need: 2, text: `[E] 길게 눌러 ${nameOf('power')} 켜기`, act: () => doneObj(o) };
      if (o.type === 'defend' && !S.started && d < 3) return { key: 'e', need: 1, text: `[E] 길게 눌러 ${nameOf('defend')} 작동`, act: () => { S.started = true; S.waveT = 5; o.head.material.emissiveIntensity = 1.4; sayY(YOON.obj.defend.start); AU.fx('scanDone'); } };
    }
    return null;
  }
  function doneObj(o) {
    o.done = true; S.prog = objs.filter(x => x.done).length / objs.length;
    const left = objs.filter(x => !x.done).length;
    AU.fx(o.type === 'collect' ? 'sample' : 'scanDone');
    if (o.type === 'survey') { o.head.material.color.set(0x30c060); o.head.material.emissive.set(0x40ff80); o.glow.material.color.set(0x40ff80); }
    if (o.type === 'power') {
      o.head.material.emissive.set(0x40ff60); o.glow.material.color.set(0x40ff60);
      const l = new THREE.PointLight(0xfff0c0, 1.5, 14, 2); l.position.set(0, 2.2, 0); o.g.add(l);
      spawnNear(o.pos, 3 + Math.floor(Math.random() * 3), 12, 24);
      CREATURES.noise(o.pos, 40);
    }
    if (o.type === 'collect') { o.g.visible = false; X.addMoney(40 + m.r * 25); }
    X.toast(`${nameOf(o.type)} ${objs.length - left}/${objs.length}`);
    const L = YOON.obj[o.type];
    if (left === 0) complete();
    else if (left === 1) sayY(L.last);
    else sayY(L.one(left));
  }

  // ---------- 화면 정보 ----------
  function lines() {
    const t = m.type, out = [], pct = Math.round(S.prog * 100);
    const n = nameOf(t);
    if (t === 'research') out.push([`${SPECIES[m.sp].n} 조사`, S.ready, pct + '%'], ['처치 · 샘플(E) · 스캔(F)', S.ready, '']);
    else if (t === 'survey' || t === 'collect' || t === 'power') out.push([t === 'survey' ? `${n} 스캔하기 (F)` : t === 'collect' ? `${n} 모으기 (E)` : `${n} 켜기 (E)`, S.ready, `${objs.filter(o => o.done).length}/${objs.length}`]);
    else if (t === 'rescue') out.push([surv && surv.found ? '무전기까지 데려가기' : '실종자 찾기 (빨간 신호)', S.ready, surv && surv.found ? '함께 이동 중' : '']);
    else if (t === 'defend') out.push([S.started ? `${n} 지키기 (초록 원 안)` : `${n} 작동하기 (E)`, S.ready, S.started ? fmtT(Math.max(0, m.goal - S.timer)) : '']);
    else if (t === 'survive') out.push(['살아남기', S.ready, fmtT(Math.max(0, m.goal - S.timer))]);
    else if (t === 'alpha') out.push([`우두머리 ${SPECIES[m.sp].n} 쓰러뜨리기`, S.ready, pct + '%']);
    else if (t === 'hunt') out.push([`${m.sp ? SPECIES[m.sp].n : '괴물'} 처치`, S.ready, `${S.kills}/${m.goal}`]);
    else if (t === 'boss') out.push([`${SPECIES[m.sp].n} 쓰러뜨리기`, S.ready, pct + '%']);
    out.push(['입구 무전기로 돌아가 보고하기', false, S.ready ? '지금!' : '']);
    return out;
  }
  const fmtT = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  // 화살표가 가리킬 곳
  function navTarget() {
    if (!m) return null;
    if (S.ready) return null;
    if (surv && !surv.found) return { x: surv.pos.x, z: surv.pos.z, n: '실종자' };
    if (m.type === 'defend' && !S.started) return { x: objs[0].pos.x, z: objs[0].pos.z, n: nameOf('defend') };
    if (m.type === 'defend') { const o = objs[0]; return Math.hypot(P.pos.x - o.pos.x, P.pos.z - o.pos.z) > 9 ? { x: o.pos.x, z: o.pos.z, n: nameOf('defend') } : null; }
    let best = null, bd = 1e9;
    objs.forEach(o => { if (o.done) return; const d = Math.hypot(P.pos.x - o.pos.x, P.pos.z - o.pos.z); if (d < bd) { bd = d; best = o; } });
    if (best) return { x: best.pos.x, z: best.pos.z, n: nameOf(best.type) };
    if (m.type === 'alpha' && alphaC && alphaC.state !== 'dead' && S.alphaSeen) return null;
    return null;
  }
  function mapPoints() {
    const out = objs.filter(o => !o.done || o.type === 'defend').map(o => ({ x: o.pos.x, z: o.pos.z, c: o.type === 'defend' ? '#40ff90' : o.type === 'collect' ? '#60c8ff' : '#ffc040' }));
    if (surv) out.push({ x: surv.pos.x, z: surv.pos.z, c: '#ff4020' });
    if (yoon) out.push({ x: yoon.pos.x, z: yoon.pos.z, c: '#f3ece0', s: 2 });
    return out;
  }
  function bossBar() { return alphaC && alphaC.state !== 'dead' && (alphaC.state !== 'idle' || S.alphaSeen) ? { hp: alphaC.hp / alphaC.max, n: alphaC.S.n } : null; }
  function end() { m = null; yoon = null; surv = null; objs = []; alphaC = null; }

  return {
    start, update, end, interact, lines, navTarget, mapPoints, bossBar,
    onKill, onSeen, onSample, onScan, onEmpty, onEquip,
    get ready() { return S.ready; }, get prog() { return S.prog || 0; }, get mission() { return m; }, get yoon() { return yoon; },
  };
})();
