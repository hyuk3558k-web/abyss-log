'use strict';
// =====================================================================
//  괴생명체: 모양, 움직임, 공격
// =====================================================================
const CREATURES = (() => {
  const V3 = THREE.Vector3, PI = Math.PI;
  let LV = null, scene = null, H = {};
  const list = [], shots = [];
  let boss = null;
  const tmp = new V3(), tmp2 = new V3();
  const rand = (a, b) => a + Math.random() * (b - a);

  // ---------- 재질 ----------
  const std = (c, o) => { const m = new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .6, metalness: .1, flatShading: true }, o || {})); m.color.convertSRGBToLinear(); if (o && o.emissive) m.emissive.convertSRGBToLinear(); return m; };
  const glowM = c => new THREE.MeshBasicMaterial({ color: c });
  function glowSprite(c, s) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: WORLD.getGlow(), color: c, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); sp.scale.setScalar(s); return sp; }
  const ico = (r, d) => new THREE.IcosahedronGeometry(r, d || 0);
  const sph = (r, a, b) => new THREE.SphereGeometry(r, a || 10, b || 8);
  const bx = (w, h, d) => new THREE.BoxGeometry(w, h, d);

  function at(parent, o, x, y, z) { o.position.set(x, y, z); parent.add(o); return o; }
  function mk(parent, geo, m, x, y, z, sx, sy, sz) { const o = new THREE.Mesh(geo, m); o.position.set(x || 0, y || 0, z || 0); if (sx) o.scale.set(sx, sy || sx, sz || sx); o.castShadow = true; parent.add(o); return o; }

  // 다리 하나 (위 마디 + 아래 마디)
  function leg(parent, m, x, y, z, side, len, thick) {
    const pv = new THREE.Group(); pv.position.set(x, y, z); parent.add(pv);
    const up = mk(pv, bx(len, thick, thick), m, side * len * .45, len * .22, 0); up.rotation.z = side * .45;
    const lo = mk(pv, bx(thick, len * 1.05, thick), m, side * len * .9, -len * .1, 0); lo.rotation.z = -side * .25;
    pv.userData.side = side; return pv;
  }

  // =================================================================
  //  모양
  // =================================================================
  const MODELS = {
    tick() {
      const g = new THREE.Group(), body = std(0x5e4e40, { roughness: .8 }), eye = glowM(0xff6a20);
      const o = { g, hit: [], flash: [body], eyes: [eye], legs: [] };
      const b = mk(g, ico(.5, 1), body, 0, .45, 0, 1, .55, 1.3); o.hit.push(b);
      const hd = mk(g, ico(.22, 0), body, 0, .42, .62); o.hit.push(hd);
      const sac = mk(g, sph(.24, 12, 10), std(0xb02a14, { emissive: 0xff3a10, emissiveIntensity: .7, flatShading: false, roughness: .3 }), 0, .72, -.2, 1, .8, 1.2); o.hit.push(sac); sac.userData.weak = true;
      [[-.08, .48, .8], [.08, .48, .8], [-.14, .44, .76], [.14, .44, .76]].forEach(p => mk(g, sph(.035, 6, 4), eye, ...p));
      for (let k = 0; k < 3; k++) for (const s of [-1, 1]) o.legs.push(leg(g, body, s * .35, .45, .35 - k * .35, s, .55, .06));
      o.anim = (c, dt) => {
        const sp = c.vel.length(), ph = c.t * (4 + sp * 2.2);
        o.legs.forEach((l, i) => { const p = ph + (i % 2 ? PI : 0) + (i >> 1) * .8; l.rotation.y = Math.sin(p) * .4 * Math.min(1, sp); l.rotation.z = Math.max(0, Math.cos(p)) * .25 * l.userData.side * Math.min(1, sp); });
        sac.scale.y = .8 + Math.sin(c.t * 3) * .06;
      };
      return o;
    },
    bat() {
      const g = new THREE.Group(), body = std(0x2c2434, { roughness: .7 }), eye = glowM(0xff2a2a);
      const o = { g, hit: [], flash: [body], eyes: [eye] };
      o.hit.push(mk(g, sph(.22), body, 0, 0, 0, 1, .9, 1.3));
      const hd = mk(g, sph(.16), body, 0, .05, .26); o.hit.push(hd); hd.userData.weak = true;
      [[-.1, .2, .26], [.1, .2, .26]].forEach(p => { const e = mk(g, new THREE.ConeGeometry(.05, .14, 4), body, ...p); e.rotation.x = -.3; });
      [[-.06, .08, .4], [.06, .08, .4], [0, .13, .39]].forEach(p => mk(g, sph(.028, 6, 4), eye, ...p));
      const wm = new THREE.MeshStandardMaterial({ color: 0x5a3a70, emissive: 0x24103a, roughness: .5, transparent: true, opacity: .62, side: THREE.DoubleSide });
      const wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, .15, 1.1, .1, -.15, .55, 0, -.35, 0, 0, .15, .55, 0, -.35, 0, 0, -.2, 0, 0, .15, .95, .15, .2, 1.1, .1, -.15], 3)); wg.computeVertexNormals();
      o.wings = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * .15, .02, 0); g.add(p); const w = new THREE.Mesh(wg, wm); w.scale.x = s; p.add(w); p.userData.side = s; return p; });
      at(g, glowSprite(0xff2a2a, .5), 0, .1, .42);
      o.anim = (c) => { const f = c.state === 'swoop' ? 3 : 1; o.wings.forEach(w => w.rotation.z = Math.sin(c.t * 15 / f) * .8 * w.userData.side * (c.state === 'swoop' ? .3 : 1)); };
      return o;
    },
    spider() {
      const g = new THREE.Group(), body = std(0x2e2838, { roughness: .5, metalness: .2 }), eye = glowM(0xd090ff);
      const crys = std(0xb070ff, { emissive: 0x8a40ff, emissiveIntensity: .9, roughness: .1 });
      const o = { g, hit: [], flash: [body], eyes: [eye], legs: [] };
      o.hit.push(mk(g, ico(.6, 1), body, 0, .8, -.5, 1, .8, 1.2));
      o.hit.push(mk(g, ico(.36, 1), body, 0, .62, .3));
      for (let i = 0; i < 6; i++) { const c = mk(g, new THREE.OctahedronGeometry(.12, 0), crys, rand(-.4, .4), 1.1 + rand(0, .15), -.5 + rand(-.5, .4), 1, 2.5, 1); c.rotation.set(rand(-.5, .5), 0, rand(-.5, .5)); }
      const core = mk(g, new THREE.OctahedronGeometry(.26, 0), crys, 0, 1.3, -.55, 1, 1.7, 1); core.userData.weak = true; o.hit.push(core);
      at(g, glowSprite(0xb070ff, 1.6), 0, 1.35, -.55);
      for (let i = 0; i < 6; i++) mk(g, sph(.035, 6, 4), eye, (i % 3 - 1) * .09, .72 + (i > 2 ? .06 : 0), .6);
      for (let k = 0; k < 4; k++) for (const s of [-1, 1]) o.legs.push(leg(g, body, s * .3, .7, .45 - k * .28, s, .85, .07));
      o.anim = (c) => {
        const sp = c.vel.length(), ph = c.t * (3 + sp * 2);
        o.legs.forEach((l, i) => { const p = ph + (i % 2 ? PI : 0) + (i >> 1) * .7; l.rotation.y = Math.sin(p) * .35 * Math.min(1, sp + .2); l.rotation.z = Math.max(0, Math.cos(p)) * .2 * l.userData.side * Math.min(1, sp); });
        core.rotation.y += .02;
      };
      return o;
    },
    stalker() {
      const g = new THREE.Group(), body = std(0x1d2a2a, { roughness: .55 }), eye = glowM(0x60fff0), spot = glowM(0x40f0d0);
      const o = { g, hit: [], flash: [body], eyes: [eye, spot], legs: [] };
      const torso = new THREE.Group(); g.add(torso); o.torso = torso;
      o.hit.push(mk(torso, ico(.5, 1), body, 0, 1.0, 0, .85, .7, 1.8));
      const neck = mk(torso, ico(.22, 0), body, 0, 1.15, .82, 1, 1, 1.4); o.hit.push(neck);
      const head = new THREE.Group(); head.position.set(0, 1.2, 1.15); torso.add(head);
      const hd = mk(head, ico(.3, 1), body, 0, 0, .1, 1, .75, 1.4); hd.userData.weak = true; o.hit.push(hd);
      const jaw = new THREE.Group(); jaw.position.set(0, -.08, -.05); head.add(jaw); o.jaw = jaw;
      mk(jaw, bx(.32, .07, .45), body, 0, -.03, .25);
      for (let i = 0; i < 4; i++) mk(jaw, new THREE.ConeGeometry(.02, .07, 4), glowM(0xe8e8d8), (i - 1.5) * .07, .03, .4);
      [[-.12, .07, .42], [.12, .07, .42]].forEach(p => mk(head, sph(.045, 6, 4), eye, ...p));
      at(head, glowSprite(0x60fff0, .6), 0, .07, .45);
      for (let i = 0; i < 10; i++) mk(torso, sph(.04, 5, 4), spot, rand(-.25, .25), 1.3 + rand(0, .05), rand(-.7, .7));
      let tz = -.8; for (let i = 0; i < 5; i++) { mk(torso, sph(.16 - i * .025, 6, 5), body, 0, 1.05 - i * .05, tz); tz -= .22; }
      [[.3, .95, .6], [-.3, .95, .6], [.3, .95, -.55], [-.3, .95, -.55]].forEach(([x, y, z]) => {
        const pv = new THREE.Group(); pv.position.set(x, y, z); torso.add(pv);
        mk(pv, bx(.12, .55, .14), body, 0, -.25, 0); const lo = mk(pv, bx(.09, .55, .1), body, 0, -.7, .08); lo.rotation.x = -.3;
        o.legs.push(pv);
      });
      o.anim = (c) => {
        const sp = c.vel.length(), ph = c.t * (2 + sp * 1.6);
        o.legs.forEach((l, i) => l.rotation.x = Math.sin(ph + (i < 2 ? 0 : PI) + (i % 2) * .5) * Math.min(.8, sp * .12));
        torso.position.y = c.crouch ? -.35 * c.crouch : Math.abs(Math.sin(ph)) * .04 * Math.min(1, sp);
        jaw.rotation.x = c.jaw || 0;
      };
      return o;
    },
    golem() {
      const g = new THREE.Group(), rock = std(0x3a2a24, { roughness: .9 }), crack = std(0x2a1410, { emissive: 0xff5010, emissiveIntensity: .9 }), eye = glowM(0xffd070);
      const o = { g, hit: [], flash: [rock], eyes: [eye] };
      o.hit.push(mk(g, ico(.9, 0), rock, 0, 1.95, 0, 1.25, 1.1, .9));
      mk(g, ico(.55, 0), crack, 0, 1.5, .1, 1.2, .6, 1);
      const core = mk(g, sph(.3, 12, 10), std(0xffa030, { emissive: 0xff7a10, emissiveIntensity: 2, flatShading: false }), 0, 1.95, .62); core.userData.weak = true; o.hit.push(core);
      at(g, glowSprite(0xff7a20, 2.4), 0, 1.95, .7);
      const hd = mk(g, ico(.38, 0), rock, 0, 2.95, .15); o.hit.push(hd);
      [[-.14, 3, .48], [.14, 3, .48]].forEach(p => mk(g, sph(.06, 6, 4), eye, ...p));
      o.arms = [-1, 1].map(s => {
        const pv = new THREE.Group(); pv.position.set(s * 1.15, 2.45, 0); g.add(pv);
        o.hit.push(mk(pv, ico(.42, 0), rock, 0, -.25, 0)); mk(pv, ico(.32, 0), crack, s * .05, -.75, .05); o.hit.push(mk(pv, ico(.4, 0), rock, s * .05, -1.25, .1));
        return pv;
      });
      o.legs = [-1, 1].map(s => { const pv = new THREE.Group(); pv.position.set(s * .5, 1.15, 0); g.add(pv); o.hit.push(mk(pv, ico(.42, 0), rock, 0, -.4, 0)); mk(pv, ico(.38, 0), rock, 0, -.95, .05); return pv; });
      o.anim = (c) => {
        const sp = c.vel.length(), ph = c.t * (1.5 + sp * 1.2), sw = Math.sin(ph) * Math.min(.5, sp * .2);
        o.legs[0].rotation.x = sw; o.legs[1].rotation.x = -sw;
        const up = c.wind || 0;
        o.arms[0].rotation.x = -sw * .6 - up * 2.6; o.arms[1].rotation.x = sw * .6 - up * 2.6;
        crack.emissiveIntensity = .8 + Math.sin(c.t * 4) * .25;
      };
      return o;
    },
    queen() {
      const g = new THREE.Group(), skin = std(0x3a1830, { roughness: .45, metalness: .2 }), eye = glowM(0xff2a6a), spike = std(0x1a0a14, { roughness: .4 });
      const o = { g, hit: [], flash: [skin], eyes: [eye], tents: [] };
      o.hit.push(mk(g, sph(2.2, 18, 14), skin, 0, 3, 0, 1.3, 1, 1.5));
      const head = new THREE.Group(); head.position.set(0, 3.8, 2.6); g.add(head); o.head = head;
      o.hit.push(mk(head, sph(1.2, 16, 12), skin, 0, 0, 0, 1.1, .9, 1));
      [[-.45, .3, 1], [.45, .3, 1], [0, .7, .95]].forEach(p => { const e = mk(head, sph(.3, 12, 10), eye, ...p); e.userData.weak = true; o.hit.push(e); at(head, glowSprite(0xff2a6a, 1.6), p[0], p[1], p[2] + .2); });
      mk(head, bx(1.1, .25, .3), glowM(0x0a0005), 0, -.45, 1.0);
      for (let i = 0; i < 7; i++) { const s = mk(head, new THREE.ConeGeometry(.18, 1.1, 5), spike, (i - 3) * .32, 1.1 - Math.abs(i - 3) * .12, -.2); s.rotation.x = -.4; }
      for (let i = 0; i < 6; i++) {
        const a = i / 6 * PI * 2, base = new THREE.Group(); base.position.set(Math.cos(a) * 2.2, 1.6, Math.sin(a) * 2.6); g.add(base);
        const segs = []; let parent = base;
        for (let k = 0; k < 9; k++) { const sg = new THREE.Group(); sg.position.set(0, k ? .5 : 0, 0); parent.add(sg); const m = mk(sg, sph(.45 - k * .035, 8, 6), skin, 0, 0, 0); o.hit.push(m); segs.push(sg); parent = sg; }
        base.rotation.set(Math.sin(a) * .9, 0, -Math.cos(a) * .9);
        o.tents.push({ base, segs, a });
      }
      o.anim = (c) => {
        o.tents.forEach((t, i) => t.segs.forEach((s, k) => { s.rotation.x = Math.sin(c.t * 1.6 + i + k * .6) * .18 + (c.slam || 0) * -.15; s.rotation.z = Math.cos(c.t * 1.3 + i * 2 + k * .5) * .15; }));
        head.rotation.x = Math.sin(c.t * .8) * .08 - (c.roar || 0) * .3;
      };
      return o;
    },
  };

  // 새 종은 기존 모양을 빌려 색을 바꾼다
  function buildModel(sp) {
    const S = SPECIES[sp];
    if (!S.base) return MODELS[sp]();
    const o = MODELS[S.base](), tint = new THREE.Color(S.tint).convertSRGBToLinear(), glow = new THREE.Color(S.glow);
    const seen = new Set();
    o.g.traverse(m => {
      if (!m.material || seen.has(m.material)) return; seen.add(m.material);
      const mat = m.material;
      if (mat.isMeshStandardMaterial) { const l = mat.color.r * .3 + mat.color.g * .55 + mat.color.b * .15; mat.color.copy(tint).multiplyScalar(.6 + l * 2.2); if (mat.emissive && mat.emissiveIntensity > 0 && (mat.emissive.r + mat.emissive.g + mat.emissive.b) > .05) mat.emissive.copy(glow).convertSRGBToLinear(); }
      else if (mat.isMeshBasicMaterial || mat.isSpriteMaterial) mat.color.copy(glow);
    });
    if (S.scale) o.g.scale.setScalar(S.scale);
    o.baseScale = S.scale || 1;
    return o;
  }

  // =================================================================
  //  생성 · 업데이트
  // =================================================================
  function init(level, sc, hooks) { clear(); LV = level; scene = sc; H = hooks; }
  function clear() {
    list.forEach(c => scene && scene.remove(c.g)); list.length = 0;
    shots.forEach(s => scene && scene.remove(s.m)); shots.length = 0; boss = null;
    netShots.forEach(s => scene && scene.remove(s.m)); netShots.length = 0; nextId = 1;
  }
  // 소리는 친구 컴퓨터에도 알려 준다 (방장일 때만 H.voice · H.sfx가 있다)
  function voice(sp, kind, x, z) { AU.voice(sp, kind, x, z); if (H.voice) H.voice(sp, kind, x, z); }
  function sfx(name, x, z) { AU.fx(name, x, z); if (H.sfx) H.sfx(name, x, z); }
  let nextId = 1;
  function spawn(sp, pos, opts) {
    const S0 = SPECIES[sp], o = buildModel(sp), A = opts && opts.alpha;
    const S = A ? Object.assign({}, S0, { hp: S0.hp * 7, dmg: S0.dmg * 1.6, spd: S0.spd * 1.08, money: S0.money * 8, r: S0.r * 1.7, n: '우두머리 ' + S0.n }) : S0;
    o.baseScale = (o.baseScale || 1) * (A ? 1.8 : 1);
    const c = { id: (opts && opts.id) || nextId++, sp, S, o, g: o.g, hp: S.hp, max: S.hp, pos: pos.clone(), vel: new V3(), yaw: Math.random() * 6, yawT: 0, state: 'idle', t: Math.random() * 9,
      atkT: 1, spT: rand(1, 3), alpha: !!A, sc: o.baseScale, flash: 0, spawnT: opts && opts.instant ? 1 : 0, home: pos.clone(), wanderTo: null, wanderT: 0, losT: 0, los: false, dead: 0, sampled: false, scanned: false, alerted: false };
    o.hit.forEach(m => { m.userData.c = c; });
    if (S.kind === 'flyer') c.pos.y = rand(2.2, 3);
    if (S.kind === 'boss') { boss = c; c.state = 'boss'; c.phase = 1; c.volT = 3; c.sumT = 10; c.slamT = 0; }
    c.g.rotation.order = 'YXZ'; // 움찔(x)이 괴물이 보는 방향 기준으로 되게
    c.g.position.copy(c.pos); c.g.rotation.y = c.yaw;
    c.g.scale.setScalar(c.spawnT < 1 ? .01 : c.sc);
    scene.add(c.g); list.push(c);
    // 땅속에서 기어 나올 때 흙먼지가 튄다
    if (!(opts && opts.instant) && H.burst && S.kind !== 'flyer') H.burst(new V3(pos.x, .2, pos.z), 0x5a4c3c, 16, 3);
    return c;
  }
  function alert(c) {
    if (c.state !== 'idle') return;
    c.state = 'hunt'; c.alerted = true; voice(c.sp, 'alert', c.pos.x, c.pos.z);
    list.forEach(o => { if (o !== c && o.state === 'idle' && o.pos.distanceTo(c.pos) < 9) { o.state = 'hunt'; } });
  }
  function noise(pos, radius) { if (H.remote) return; list.forEach(c => { if (c.state === 'idle' && c.pos.distanceTo(pos) < radius) alert(c); }); }

  function angDiff(a, b) { let d = b - a; while (d > PI) d -= PI * 2; while (d < -PI) d += PI * 2; return d; }
  function move(c, tx, tz, speed, dt, accel) {
    let dx = tx - c.pos.x, dz = tz - c.pos.z; const d = Math.hypot(dx, dz);
    if (d > .05) { dx /= d; dz /= d; } else { dx = dz = 0; }
    const a = Math.min(1, (accel || 8) * dt);
    c.vel.x += (dx * speed - c.vel.x) * a; c.vel.z += (dz * speed - c.vel.z) * a;
    c.pos.x += c.vel.x * dt; c.pos.z += c.vel.z * dt;
    LV.collide(c.pos, c.S.r * .8);
    if (speed > .2 && d > .05) c.yawT = Math.atan2(dx, dz);
  }
  function chaseTarget(c, P) {
    if (c.los) return P.pos;
    if (LV.nextStep(c.pos.x, c.pos.z, tmp2)) return tmp2;
    return P.pos;
  }
  function shoot(c, from, target, speed, kind, dmg, grav) {
    const d = from.distanceTo(target), T = d / speed;
    const vel = new V3((target.x - from.x) / T, (target.y - from.y) / T + .5 * (grav || 0) * T, (target.z - from.z) / T);
    const col = c.S.shot || 0xff3a8a;
    const m = shotMesh(kind, col);
    m.position.copy(from); scene.add(m);
    shots.push({ m, vel, grav: grav || 0, dmg, life: 5, kind, col, r: kind === 'lava' ? .4 : .2, from: c.pos.clone() });
    sfx(kind === 'lava' ? 'lavaThrow' : 'spit', from.x, from.z);
  }
  function shotMesh(kind, col) {
    let m;
    if (kind === 'crystal') { m = new THREE.Mesh(new THREE.OctahedronGeometry(.12, 0), new THREE.MeshBasicMaterial({ color: 0xc090ff })); m.scale.z = 2.5; m.add(glowSprite(0xb070ff, .8)); }
    else if (kind === 'lava') { m = new THREE.Mesh(ico(.28, 0), new THREE.MeshBasicMaterial({ color: 0xff7a20 })); m.add(glowSprite(0xff6010, 2)); }
    else { m = new THREE.Mesh(sph(.16, 8, 6), new THREE.MeshBasicMaterial({ color: col })); m.add(glowSprite(col === 0xff3a8a ? 0xff2a6a : col, 1.1)); }
    return m;
  }

  // 친구와 함께 할 때는 살아 있는 사람 중 가장 가까운 사람을 노린다
  let tgt = null;
  function hurt(dmg, from) { H.hurt(dmg, from, tgt); }
  function nearest(c, P, others) {
    let T = P, best = P.dead ? 1e9 : Math.hypot(P.pos.x - c.pos.x, P.pos.z - c.pos.z);
    for (const o of others) {
      if (o.dead) continue;
      const d = Math.hypot(o.pos.x - c.pos.x, o.pos.z - c.pos.z) * (c.tgt === o ? .8 : 1); // 노리던 사람을 조금 더 좋아한다
      if (d < best) { best = d; T = o; }
    }
    return T;
  }

  function update(dt, P0, others) {
    others = others || [];
    const flowTo = P0.dead ? others.find(o => !o.dead) || P0 : P0;
    LV.updateFlow(flowTo.pos.x, flowTo.pos.z);
    for (let i = list.length - 1; i >= 0; i--) {
      const c = list[i], S = c.S;
      c.t += dt;
      if (c.state === 'dead') { deathAnim(c, dt); continue; }
      if (c.spawnT < 1) { c.spawnT = Math.min(1, c.spawnT + dt * 1.6); c.g.scale.setScalar((.01 + .99 * c.spawnT) * c.sc); }
      c.flash = Math.max(0, c.flash - dt);
      c.o.flash.forEach(m => m.emissive && m.emissive.setScalar(c.flash > 0 ? .7 : 0));
      const P = others.length ? nearest(c, P0, others) : P0;
      c.tgt = tgt = P;
      const head = new V3(P.pos.x, P.pos.y + 1.5, P.pos.z);
      const dx = P.pos.x - c.pos.x, dz = P.pos.z - c.pos.z, dist = Math.hypot(dx, dz);
      c.losT -= dt;
      if (c.losT <= 0) { c.losT = .2 + Math.random() * .1; c.los = dist < 40 && LV.los(c.pos.x, c.pos.z, P.pos.x, P.pos.z); if (c.los && dist < 22 && H.seen) H.seen(c); }
      c.atkT -= dt; c.spT -= dt;
      if (P.dead) { if (c.state !== 'boss') { move(c, c.home.x, c.home.z, S.spd * .3, dt); } }
      else if (c.state === 'idle') {
        c.wanderT -= dt;
        if (!c.wanderTo || c.wanderT <= 0 || Math.hypot(c.wanderTo.x - c.pos.x, c.wanderTo.z - c.pos.z) < .6) {
          c.wanderT = rand(2, 5); const a = Math.random() * PI * 2, r = Math.random() * 5;
          const w = new V3(c.home.x + Math.cos(a) * r, 0, c.home.z + Math.sin(a) * r);
          c.wanderTo = LV.isWallAt(w.x, w.z) ? c.home.clone() : w;
        }
        move(c, c.wanderTo.x, c.wanderTo.z, S.spd * .25, dt, 3);
        if (S.kind === 'flyer') c.pos.y = 2.6 + Math.sin(c.t) * .3;
        if (dist < 7 || (dist < 17 && c.los)) alert(c);
        if (c.spT <= 0) { c.spT = rand(4, 9); if (dist < 25) voice(c.sp, 'idle', c.pos.x, c.pos.z); }
      } else behave(c, dt, P, head, dist);
      // 서로 겹치지 않게
      if (S.kind !== 'boss') for (const o of list) if (o !== c && o.state !== 'dead' && o.S.kind !== 'boss') {
        const ddx = c.pos.x - o.pos.x, ddz = c.pos.z - o.pos.z, d = Math.hypot(ddx, ddz), m = (c.S.r + o.S.r) * .7;
        if (d < m && d > .001) { c.pos.x += ddx / d * (m - d) * .5; c.pos.z += ddz / d * (m - d) * .5; }
      }
      // 총에 맞으면 뒤로 밀리고 움찔한다
      if (c.knock) { c.pos.addScaledVector(c.knock, dt); c.knock.multiplyScalar(Math.max(0, 1 - dt * 9)); LV.collide(c.pos, S.r * .8); }
      if (c.flinch) c.flinch = Math.max(0, c.flinch - dt * 5);
      // 용암 웅덩이는 괴물도 피한다
      c.yaw += angDiff(c.yaw, c.yawT) * Math.min(1, dt * (S.kind === 'boss' ? 1.5 : 8));
      c.g.position.copy(c.pos); c.g.rotation.y = c.yaw; c.g.rotation.x = -(c.flinch || 0) * .35;
      if (c.lunge) { c.lunge = Math.max(0, c.lunge - dt * 4); c.g.position.x += Math.sin(c.yaw) * c.lunge * .4; c.g.position.z += Math.cos(c.yaw) * c.lunge * .4; }
      c.o.anim(c, dt);
    }
    updateShots(dt, [P0].concat(others));
  }

  function behave(c, dt, P, head, dist) {
    const S = c.S, k = S.kind;
    if (k === 'crawler') {
      const t = chaseTarget(c, P);
      move(c, t.x, t.z, dist < 1.2 ? 0 : S.spd * (c.spawnT < 1 ? 0 : 1), dt);
      c.pos.y = Math.abs(Math.sin(c.t * 9)) * .05 * Math.min(1, c.vel.length());
      if (dist < 1.5 && c.atkT <= 0 && Math.abs(P.pos.y - c.pos.y) < 1.2) { c.atkT = 1.15; c.lunge = 1; hurt(S.dmg, c.pos); voice(c.sp, 'attack', c.pos.x, c.pos.z); }
      if (c.spT <= 0) { c.spT = rand(2, 4); voice(c.sp, 'idle', c.pos.x, c.pos.z); }
    } else if (k === 'flyer') {
      const ceil = LV.ceilAt(c.pos.x, c.pos.z) - .6;
      if (c.state === 'swoop') {
        c.sw -= dt;
        c.pos.addScaledVector(c.vel, dt); LV.collide(c.pos, .4);
        if (c.pos.distanceTo(head) < 1.1 && !c.hitDone) { c.hitDone = true; hurt(S.dmg, c.pos); }
        if (c.sw <= 0 || c.pos.y < .6) { c.state = 'retreat'; c.sw = 1.2; }
      } else if (c.state === 'retreat') {
        c.sw -= dt;
        move(c, c.pos.x - (P.pos.x - c.pos.x), c.pos.z - (P.pos.z - c.pos.z), S.spd * .7, dt);
        c.pos.y += (Math.min(ceil, 3.4) - c.pos.y) * Math.min(1, dt * 3);
        if (c.sw <= 0) c.state = 'hunt';
      } else {
        const t = chaseTarget(c, P);
        const side = new V3(-(t.z - c.pos.z), 0, t.x - c.pos.x).normalize().multiplyScalar(dist < 9 ? 3 : 0);
        move(c, t.x + side.x, t.z + side.z, S.spd, dt, 4);
        c.pos.y += (Math.min(ceil, 3 + Math.sin(c.t * 2) * .4) - c.pos.y) * Math.min(1, dt * 3);
        if (dist < 7 && c.los && c.atkT <= 0) {
          c.state = 'swoop'; c.sw = .9; c.hitDone = false; c.atkT = 2.2;
          c.vel.copy(head).sub(c.pos).normalize().multiplyScalar(13);
          voice(c.sp, 'attack', c.pos.x, c.pos.z);
        }
      }
      c.yawT = Math.atan2(dist > .1 ? P.pos.x - c.pos.x : 0, dist > .1 ? P.pos.z - c.pos.z : 1);
    } else if (k === 'spitter') {
      const t = chaseTarget(c, P);
      if (c.los && dist < 14 && dist > 5) {
        c.str = c.str || 1; if (Math.random() < dt * .4) c.str *= -1;
        move(c, c.pos.x - dz(c, P) * c.str, c.pos.z + dx(c, P) * c.str, S.spd * .55, dt, 4);
        c.yawT = Math.atan2(P.pos.x - c.pos.x, P.pos.z - c.pos.z);
        if (c.atkT <= 0) { c.atkT = rand(1.8, 2.6); const from = c.pos.clone().add(new V3(Math.sin(c.yaw) * .7, .7, Math.cos(c.yaw) * .7)); shoot(c, from, head.clone().add(new V3(rand(-.4, .4), rand(-.3, .2), rand(-.4, .4))), 17, 'crystal', S.dmg, 2); }
      } else move(c, t.x, t.z, dist < 1.6 ? 0 : S.spd, dt);
      if (dist < 2 && c.atkT <= 0) { c.atkT = 1.1; c.lunge = 1; hurt(S.dmg, c.pos); }
    } else if (k === 'leaper') {
      if (c.air) {
        c.vy -= 16 * dt; c.pos.y += c.vy * dt; c.pos.x += c.vel.x * dt; c.pos.z += c.vel.z * dt; LV.collide(c.pos, .6);
        c.jaw = .6;
        if (!c.hitDone && c.pos.distanceTo(P.pos) < 1.6) { c.hitDone = true; hurt(S.dmg, c.pos); }
        if (c.pos.y <= 0) { c.pos.y = 0; c.air = false; c.vel.multiplyScalar(.2); c.jaw = 0; }
        return;
      }
      if (c.crouchT > 0) {
        c.crouchT -= dt; c.crouch = Math.min(1, (c.crouch || 0) + dt * 3);
        c.yawT = Math.atan2(P.pos.x - c.pos.x, P.pos.z - c.pos.z);
        if (c.crouchT <= 0) {
          c.crouch = 0; c.air = true; c.hitDone = false; c.vy = 5.5;
          const lead = P.pos.clone().addScaledVector(P.vel, .35);
          const T = .7; c.vel.set((lead.x - c.pos.x) / T, 0, (lead.z - c.pos.z) / T);
          if (c.vel.length() > 15) c.vel.setLength(15);
          voice(c.sp, 'attack', c.pos.x, c.pos.z);
        }
        return;
      }
      const t = chaseTarget(c, P);
      move(c, t.x, t.z, dist < 1.6 ? 0 : S.spd, dt);
      c.jaw = Math.max(0, (c.jaw || 0) - dt * 2);
      if (c.los && dist > 4 && dist < 10 && c.atkT <= 0) { c.atkT = 3.5; c.crouchT = .55; }
      if (dist < 1.9 && c.spT <= 0) { c.spT = 1.1; c.lunge = 1; c.jaw = .7; hurt(S.dmg * .6, c.pos); }
    } else if (k === 'brute') {
      if (c.windT > 0) {
        c.windT -= dt; c.wind = Math.min(1, (c.wind || 0) + dt * 2);
        if (c.windT <= 0) {
          c.wind = 0; sfx('slam', c.pos.x, c.pos.z); H.shake(.6);
          H.burst(c.pos.clone().add(new V3(Math.sin(c.yaw) * 1.5, .2, Math.cos(c.yaw) * 1.5)), 0xff7a30, 30, 7);
          if (dist < 3.8) hurt(S.dmg, c.pos);
        }
        return;
      }
      const t = chaseTarget(c, P);
      move(c, t.x, t.z, dist < 2.2 ? 0 : S.spd, dt);
      if (dist < 3 && c.atkT <= 0) { c.atkT = 2.6; c.windT = .75; voice(c.sp, 'attack', c.pos.x, c.pos.z); }
      else if (c.los && dist > 5 && dist < 26 && c.spT <= 0) {
        c.spT = rand(3, 4.2); c.wind = .5;
        const from = c.pos.clone().add(new V3(0, 3, 0));
        shoot(c, from, P.pos.clone().add(new V3(0, .8, 0)).addScaledVector(P.vel, .4), 13, 'lava', S.dmg * .75, 12);
      }
      c.wind = Math.max(0, (c.wind || 0) - dt);
      if (c.t % 1.3 < dt && c.vel.length() > .5) { H.shake(Math.max(0, .25 - dist * .01)); }
    } else if (k === 'boss') {
      const active = dist < 34 && c.los;
      c.yawT = Math.atan2(P.pos.x - c.pos.x, P.pos.z - c.pos.z);
      if (!active) return;
      if (!c.awake) { c.awake = true; c.roar = 1; voice(c.sp, 'alert', c.pos.x, c.pos.z); H.shake(.5); }
      c.roar = Math.max(0, (c.roar || 0) - dt);
      if (c.hp < c.max * .5 && c.phase === 1) { c.phase = 2; c.roar = 1.5; voice(c.sp, 'alert', c.pos.x, c.pos.z); H.shake(.7); H.phase && H.phase(); }
      c.volT -= dt; c.sumT -= dt; c.slamT -= dt;
      const mouth = c.pos.clone().add(new V3(Math.sin(c.yaw) * 3.2, 3.6, Math.cos(c.yaw) * 3.2));
      if (c.volT <= 0) {
        c.volT = c.phase === 1 ? 3.2 : 2.2; const n = c.phase === 1 ? 5 : 8;
        for (let i = 0; i < n; i++) { const a = (i - (n - 1) / 2) * .16; const tg = head.clone().sub(mouth); tg.applyAxisAngle(new V3(0, 1, 0), a); shoot(c, mouth, mouth.clone().add(tg), 15, 'acid', S.dmg, 3); }
        voice(c.sp, 'attack', c.pos.x, c.pos.z);
      }
      if (c.sumT <= 0) {
        c.sumT = c.phase === 1 ? 14 : 10;
        const mn = S.minion || 'tick', ticks = list.filter(o => o.sp === mn && o.state !== 'dead').length;
        for (let i = 0; i < 3 && ticks + i < 7; i++) {
          const a = Math.random() * PI * 2, p = c.pos.clone().add(new V3(Math.cos(a) * 4.5, 0, Math.sin(a) * 4.5));
          if (!LV.isWallAt(p.x, p.z)) { const t = spawn(mn, p); t.state = 'hunt'; H.burst(p.clone().setY(.5), S.shot || 0xff2a6a, 16, 4); }
        }
      }
      if (dist < 7.5 && c.slamT <= 0 && !c.slamW) { c.slamW = .9; c.slamT = 4; }
      if (c.slamW) {
        c.slamW -= dt; c.slam = Math.min(1, (c.slam || 0) + dt * 2);
        if (c.slamW <= 0) { c.slamW = 0; c.slam = 0; sfx('slam', c.pos.x, c.pos.z); H.shake(.8); H.burst(P.pos.clone().setY(.3), S.shot || 0xff2a6a, 30, 8); if (dist < 7.5) hurt(30, c.pos); }
      }
    }
  }
  const dx = (c, P) => (P.pos.x - c.pos.x) / Math.max(.1, Math.hypot(P.pos.x - c.pos.x, P.pos.z - c.pos.z));
  const dz = (c, P) => (P.pos.z - c.pos.z) / Math.max(.1, Math.hypot(P.pos.x - c.pos.x, P.pos.z - c.pos.z));

  function updateShots(dt, people) {
    for (let i = shots.length - 1; i >= 0; i--) {
      const s = shots[i]; s.life -= dt;
      s.vel.y -= s.grav * dt; s.m.position.addScaledVector(s.vel, dt);
      if (s.kind === 'crystal') s.m.lookAt(s.m.position.clone().add(s.vel)); else s.m.rotation.x += dt * 5;
      const p = s.m.position;
      const hitP = people.find(P => {
        const cy = Math.max(P.pos.y + .2, Math.min(P.pos.y + 1.7, p.y));
        return !P.dead && Math.hypot(p.x - P.pos.x, p.y - cy, p.z - P.pos.z) < .45 + s.r;
      });
      const hitW = LV.isWallAt(p.x, p.z) || p.y < LV.floorAt(p.x, p.z) || p.y > LV.ceilAt(p.x, p.z);
      if (hitP) H.hurt(s.dmg, s.from, hitP);
      if (hitP || hitW || s.life <= 0) {
        const col = s.kind === 'crystal' ? 0xc090ff : s.kind === 'lava' ? 0xff7a20 : 0xff3a8a;
        H.burst(p.clone(), col, s.kind === 'lava' ? 20 : 8, s.kind === 'lava' ? 5 : 3);
        if (s.kind === 'lava' && !hitP) people.forEach(P => { if (!P.dead && p.distanceTo(P.pos) < 2.2) H.hurt(s.dmg * .5, s.from, P); });
        scene.remove(s.m); shots.splice(i, 1);
      }
    }
  }

  // ---------- 친구 컴퓨터: 방장이 보내 준 괴물 모습을 그대로 따라 한다 ----------
  const ANIM = ['lunge', 'jaw', 'crouch', 'wind', 'slam', 'roar', 'phase', 'flinch', 'awake', 'air'];
  const r2 = v => Math.round((+v || 0) * 100) / 100;
  // 방장: 지금 괴물들 상태를 짧은 숫자 목록으로
  function snap() {
    return {
      c: list.map(c => [c.id, c.sp, c.alpha ? 1 : 0, r2(c.pos.x), r2(c.pos.y), r2(c.pos.z), r2(c.yaw), c.state, Math.round(c.hp), Math.round(c.max), r2(c.spawnT)].concat(ANIM.map(k => r2(c[k])))),
      s: shots.map(s => [r2(s.m.position.x), r2(s.m.position.y), r2(s.m.position.z), r2(s.vel.x), r2(s.vel.y), r2(s.vel.z), s.grav, s.kind, s.col]),
    };
  }
  const byId = id => list.find(c => c.id === id);
  // 친구: 받은 목록에 맞춰 괴물을 만들고, 옮기고, 없어진 건 지운다
  function applySnap(d) {
    const seen = new Set();
    for (const a of d.c) {
      const [id, sp, al, x, y, z, yaw, st, hp, mx, spT] = a;
      seen.add(id);
      let c = byId(id);
      if (!c) {
        if (!SPECIES[sp]) continue;
        c = spawn(sp, new V3(x, y, z), { id, alpha: !!al, instant: spT >= 1 });
        c.spawnT = spT; c.yaw = yaw;
        if (st === 'dead') { markDead(c, true); c.dead = 9; }
      }
      c.net = { x, y, z, yaw }; c.hp = hp; c.max = mx;
      if (st === 'dead') { if (c.state !== 'dead') markDead(c); }
      else c.state = st;
      ANIM.forEach((k, i) => { c[k] = a[11 + i]; });
      c.phase = c.phase || 1;
    }
    for (let i = list.length - 1; i >= 0; i--) if (!seen.has(list[i].id)) { scene.remove(list[i].g); if (boss === list[i]) boss = null; list.splice(i, 1); }
    // 날아오는 침·용암
    while (netShots.length > d.s.length) scene.remove(netShots.pop().m);
    d.s.forEach((a, i) => {
      let s = netShots[i];
      if (!s || s.kind !== a[7]) { if (s) scene.remove(s.m); s = netShots[i] = { m: shotMesh(a[7], a[8]), kind: a[7], vel: new V3() }; scene.add(s.m); }
      s.m.position.set(a[0], a[1], a[2]); s.vel.set(a[3], a[4], a[5]); s.grav = a[6];
    });
  }
  const netShots = [];
  function updatePuppets(dt) {
    for (const c of list) {
      c.t += dt;
      if (c.spawnT < 1) { c.spawnT = Math.min(1, c.spawnT + dt * 1.6); c.g.scale.setScalar((.01 + .99 * c.spawnT) * c.sc); }
      c.flash = Math.max(0, c.flash - dt);
      c.o.flash.forEach(m => m.emissive && m.emissive.setScalar(c.flash > 0 ? .7 : 0));
      if (c.state === 'dead') { deathAnim(c, dt); continue; }
      const n = c.net;
      if (n) {
        const ox = c.pos.x, oz = c.pos.z, far = Math.hypot(n.x - ox, n.z - oz) > 6, k = far ? 1 : Math.min(1, dt * 14);
        c.pos.x += (n.x - c.pos.x) * k; c.pos.y += (n.y - c.pos.y) * k; c.pos.z += (n.z - c.pos.z) * k;
        if (dt > 0) { c.vel.x += ((c.pos.x - ox) / dt - c.vel.x) * .3; c.vel.z += ((c.pos.z - oz) / dt - c.vel.z) * .3; }
        c.yaw += angDiff(c.yaw, n.yaw) * Math.min(1, dt * 12);
      }
      c.g.position.copy(c.pos); c.g.rotation.y = c.yaw; c.g.rotation.x = -(c.flinch || 0) * .35;
      if (c.lunge) { c.g.position.x += Math.sin(c.yaw) * c.lunge * .4; c.g.position.z += Math.cos(c.yaw) * c.lunge * .4; }
      c.o.anim(c, dt);
    }
    netShots.forEach(s => { s.vel.y -= (s.grav || 0) * dt; s.m.position.addScaledVector(s.vel, dt); s.m.rotation.x += dt * 5; });
  }

  // ---------- 피해 · 죽음 ----------
  function damage(c, dmg, weak, point) {
    if (c.state === 'dead') return false;
    // 친구 컴퓨터에서는 직접 깎지 않고 방장에게 "맞혔어요"를 보낸다
    if (H.remote) { c.flash = .08; H.remote(c, dmg, weak, point); return false; }
    c.hp -= dmg; c.flash = .08;
    if (c.state === 'idle') alert(c);
    if (c.hp <= 0) {
      markDead(c);
      H.kill(c, weak, point);
      return true;
    }
    return false;
  }
  function markDead(c, quiet) {
    c.hp = 0; c.state = 'dead'; c.dead = 0;
    if (!quiet) voice(c.sp, 'die', c.pos.x, c.pos.z);
    c.o.eyes.forEach(m => m.color && m.color.multiplyScalar(.15));
    c.g.traverse(o => { if (o.isSprite) o.visible = false; });
  }
  function deathAnim(c, dt) {
    c.dead += dt;
    const k = Math.min(1, c.dead / .6);
    if (c.S.kind === 'flyer') { c.pos.y = Math.max(.2, c.pos.y - dt * 6); c.g.position.copy(c.pos); c.g.rotation.z = k * 2.5; }
    else if (c.S.kind === 'boss') { c.g.position.y = -k * 1.2; c.g.rotation.x = k * .15; }
    else { c.g.rotation.z = k * 1.45; c.g.position.y = -k * .15 * (c.S.r); }
    if (c.o.legs) c.o.legs.forEach(l => { l.rotation.z = (l.userData.side || 1) * -.6 * k; });
  }
  function explode(pos, radius, dmg) {
    list.forEach(c => {
      if (c.state === 'dead') return;
      const ctr = c.pos.clone(); ctr.y += c.S.kind === 'boss' ? 3 : .8;
      const d = ctr.distanceTo(pos) - c.S.r * .6;
      if (d < radius) damage(c, dmg * (1 - Math.max(0, d) / radius * .7), false, ctr);
    });
    noise(pos, 40);
  }
  function hitMeshes() { const out = []; list.forEach(c => { if (c.state !== 'dead' && c.spawnT > .3) c.o.hit.forEach(m => out.push(m)); }); return out; }
  function nearestCorpse(pos, maxD) {
    let best = null, bd = maxD;
    list.forEach(c => { if (c.state === 'dead' && !c.sampled && c.S.sample > 0) { const d = Math.hypot(c.pos.x - pos.x, c.pos.z - pos.z); if (d < bd) { bd = d; best = c; } } });
    return best;
  }
  function alive(sp) { return list.filter(c => c.state !== 'dead' && (!sp || c.sp === sp)).length; }
  function pruneCorpses() {
    const dead = list.filter(c => c.state === 'dead');
    if (dead.length > 22) { const c = dead[0]; scene.remove(c.g); list.splice(list.indexOf(c), 1); }
  }

  return { init, clear, spawn, update, damage, explode, hitMeshes, nearestCorpse, alive, noise, buildModel, pruneCorpses, list, shots, snap, applySnap, updatePuppets, byId, markDead, get boss() { return boss; } };
})();
