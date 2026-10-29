'use strict';
// =====================================================================
//  총 3D 모델 + 손 + 장전/사격 동작
//  좌표: 총구는 -Z, 위는 +Y, 오른쪽은 +X. (0,0,0)은 오른손이 잡는 손잡이 위쪽.
// =====================================================================
const GUNVIEW = (() => {
  const V3 = THREE.Vector3;
  const PI = Math.PI;

  // ---------- 모양/재질 캐시 ----------
  const geoCache = {};
  const k4 = n => n.toFixed(4);
  function boxG(w, h, d) { const k = 'b' + k4(w) + k4(h) + k4(d); return geoCache[k] || (geoCache[k] = new THREE.BoxGeometry(w, h, d)); }
  function cylG(r1, r2, len, seg) {
    const k = 'c' + k4(r1) + k4(r2) + k4(len) + seg;
    if (!geoCache[k]) { const g = new THREE.CylinderGeometry(r1, r2, len, seg); g.rotateX(PI / 2); geoCache[k] = g; }
    return geoCache[k];
  }
  function vcylG(r, h, seg) { const k = 'v' + k4(r) + k4(h) + seg; return geoCache[k] || (geoCache[k] = new THREE.CylinderGeometry(r, r, h, seg)); }
  const matCache = {};
  function mat(key, o) {
    if (matCache[key]) return matCache[key];
    const m = new THREE.MeshStandardMaterial(o); m.color.convertSRGBToLinear(); if (o.emissive) m.emissive.convertSRGBToLinear();
    return (matCache[key] = m);
  }
  function basic(key, o) { return matCache[key] || (matCache[key] = new THREE.MeshBasicMaterial(o)); }
  const BASE = {
    poly: () => mat('poly', { color: 0x1d1e21, roughness: .72, metalness: .12 }),
    anod: () => mat('anod', { color: 0x26282c, roughness: .48, metalness: .55 }),
    steel: () => mat('steel', { color: 0x34363a, roughness: .38, metalness: .75 }),
    dark: () => mat('dark', { color: 0x141518, roughness: .45, metalness: .6 }),
    wood: () => mat('wood', { color: 0x4e2a14, roughness: .55, metalness: .05 }),
    tan: () => mat('tan', { color: 0xa48a60, roughness: .7, metalness: .1 }),
    od: () => mat('od', { color: 0x4b5537, roughness: .7, metalness: .1 }),
    chrome: () => mat('chrome', { color: 0xd0d4da, roughness: .12, metalness: 1 }),
    brass: () => mat('brass', { color: 0xc9a04a, roughness: .28, metalness: 1 }),
    shellRed: () => mat('shellRed', { color: 0xa82020, roughness: .5, metalness: .1 }),
    green: () => mat('green', { color: 0x3d4a2a, roughness: .7, metalness: .1 }),
    clear: () => mat('clear', { color: 0x8a6a3a, roughness: .25, metalness: 0, transparent: true, opacity: .72 }),
    glove: () => mat('glove', { color: 0x26201a, roughness: .9, metalness: 0 }),
    sleeve: () => mat('sleeve', { color: 0x3b3424, roughness: .95, metalness: 0 }),
    lens: () => mat('lens', { color: 0x10203a, roughness: .05, metalness: .9, emissive: 0x0a1830, emissiveIntensity: .6 }),
  };
  const SKIN = {
    desert: () => mat('sk_desert', { color: 0xb4976a, roughness: .75, metalness: .1 }),
    forest: () => mat('sk_forest', { color: 0x46552f, roughness: .75, metalness: .1 }),
    urban: () => mat('sk_urban', { color: 0x6a6f77, roughness: .6, metalness: .3 }),
    snow: () => mat('sk_snow', { color: 0xdfe3e8, roughness: .7, metalness: .1 }),
    gold: () => mat('sk_gold', { color: 0xe0b43c, roughness: .22, metalness: 1 }),
    crystal: () => mat('sk_crystal', { color: 0x8e62ff, roughness: .1, metalness: .3, emissive: 0x3b1490, emissiveIntensity: .8 }),
    lava: () => mat('sk_lava', { color: 0x2a1a14, roughness: .6, metalness: .4, emissive: 0xff4a10, emissiveIntensity: .55 }),
  };
  const RED = () => basic('red', { color: 0xff2a1a });
  // 조준기 유리: 정조준할 때 앞이 비쳐 보이게 거의 투명하게
  const GLASS = () => matCache.glass || (matCache.glass = new THREE.MeshBasicMaterial({ color: 0x6fa8ff, transparent: true, opacity: .12, depthWrite: false }));
  const GLOW_G = () => basic('glowg', { color: 0x6aff8a });

  function matsFor(g, mods) {
    const c = g.m.c || (g.cat === 'sniper' ? 'wood' : 'blk');
    let body, furn, frame;
    switch (c) {
      case 'wood': body = BASE.steel(); furn = BASE.wood(); frame = body; break;
      case 'st': body = BASE.steel(); furn = (g.cat === 'pistol' || g.cat === 'revolver') ? BASE.wood() : BASE.poly(); frame = body; break;
      case 'tan': body = BASE.tan(); furn = BASE.tan(); frame = furn; break;
      case 'od': body = BASE.od(); furn = BASE.od(); frame = furn; break;
      case 'ch': body = BASE.chrome(); furn = BASE.poly(); frame = body; break;
      default: body = BASE.anod(); furn = BASE.poly(); frame = furn;
    }
    if (g.id === 'win1873') body = BASE.brass();
    let metal = BASE.steel();
    const sk = mods && mods.skin && SKIN[mods.skin] ? SKIN[mods.skin]() : null;
    if (sk) { body = furn = frame = sk; if (mods.skin === 'gold') metal = sk; }
    return { body, furn, frame, metal, dark: BASE.dark() };
  }

  // ---------- 조립 도우미 ----------
  function Ctx(g, mods) {
    this.g = g; this.mods = mods; this.M = matsFor(g, mods);
    this.root = new THREE.Group(); this.body = new THREE.Group(); this.root.add(this.body);
    this.parts = {}; this.v = { g, parts: this.parts, props: {} };
  }
  Ctx.prototype.box = function (p, w, h, d, m, x, y, z, rx, ry, rz) {
    const o = new THREE.Mesh(boxG(w, h, d), m); o.position.set(x, y, z);
    if (rx || ry || rz) o.rotation.set(rx || 0, ry || 0, rz || 0);
    p.add(o); return o;
  };
  Ctx.prototype.cyl = function (p, r, len, m, x, y, z, seg, r2) {
    const o = new THREE.Mesh(cylG(r, r2 === undefined ? r : r2, len, seg || 14), m); o.position.set(x, y, z); p.add(o); return o;
  };
  // 속이 빈 통 (조준기 몸통): 뚜껑이 없어서 들여다보면 앞이 보인다
  Ctx.prototype.tube = function (p, r, len, m, x, y, z, seg) {
    const k = 't' + k4(r) + k4(len) + (seg || 18);
    if (!geoCache[k]) { const g = new THREE.CylinderGeometry(r, r, len, seg || 18, 1, true); g.rotateX(PI / 2); geoCache[k] = g; }
    const key = 'dbl' + m.uuid;
    const dm = matCache[key] || (matCache[key] = Object.assign(m.clone(), { side: THREE.DoubleSide }));
    const o = new THREE.Mesh(geoCache[k], dm); o.position.set(x, y, z); p.add(o); return o;
  };
  Ctx.prototype.part = function (name, x, y, z, rx, parent) {
    const p = new THREE.Group(); p.position.set(x, y, z); if (rx) p.rotation.x = rx;
    (parent || this.body).add(p);
    p.userData.home = { p: p.position.clone(), r: p.rotation.clone() };
    this.parts[name] = p; return p;
  };
  Ctx.prototype.pt = function (name, x, y, z, parent) { const o = new THREE.Object3D(); o.position.set(x, y, z); (parent || this.body).add(o); this.v[name] = o; return o; };

  // 탄 하나 (손에 들고 넣는 용도)
  function roundMesh(kind) {
    const g = new THREE.Group();
    if (kind === 'shell') {
      g.add(new THREE.Mesh(cylG(.0105, .0105, .05, 10), BASE.shellRed()));
      const b = new THREE.Mesh(cylG(.011, .011, .014, 10), BASE.brass()); b.position.z = .03; g.add(b);
    } else if (kind === 'grenade') {
      g.add(new THREE.Mesh(cylG(.02, .02, .05, 12), BASE.brass()));
      const h = new THREE.Mesh(new THREE.SphereGeometry(.02, 10, 8), BASE.green()); h.position.z = -.03; g.add(h);
    } else {
      g.add(new THREE.Mesh(cylG(.0045, .0045, .03, 8), BASE.brass()));
      const tip = new THREE.Mesh(cylG(.0042, .0001, .012, 8), mat('copper', { color: 0xb06a3a, roughness: .35, metalness: .9 })); tip.position.z = -.021; g.add(tip);
    }
    return g;
  }

  // ---------- 손 ----------
  function makeHand(dir, len) {
    const g = new THREE.Group();
    const palm = new THREE.Mesh(boxG(.034, .05, .08), BASE.glove()); g.add(palm);
    const fing = new THREE.Mesh(boxG(.036, .026, .045), BASE.glove()); fing.position.set(-.004, -.026, -.03); g.add(fing);
    const thumb = new THREE.Mesh(boxG(.012, .014, .04), BASE.glove()); thumb.position.set(-.02, .012, -.035); g.add(thumb);
    const d = new V3(...dir).normalize();
    const arm = new THREE.Mesh(cylG(.028, .034, len, 10), BASE.sleeve());
    arm.position.copy(d).multiplyScalar(len / 2 + .03);
    arm.quaternion.setFromUnitVectors(new V3(0, 0, 1), d);
    g.add(arm);
    const cuff = new THREE.Mesh(cylG(.03, .03, .03, 10), BASE.glove()); cuff.position.copy(d).multiplyScalar(.04); cuff.quaternion.copy(arm.quaternion); g.add(cuff);
    return g;
  }

  // =================================================================
  //  권총
  // =================================================================
  function buildPistol(c) {
    const g = c.g, m = g.m, M = c.M, k = m.k, b = c.body, mods = c.mods;
    const L = m.L || .2, big = k === 'deagle' ? 1.18 : 1, sh = .03 * big;
    const zR = .055, zF = -L + .055, yS = .042;
    const v = c.v;
    if (['luger', 'c96', 'ruger', 'beretta', 'deagle'].includes(k)) c.box(b, .026 * big, .024, L * .8, M.frame, 0, .015, (zR + zF) / 2 + .015);
    let slide;
    if (k === 'luger') {
      c.box(b, .026, .028, L * .42, M.body, 0, .04, zR - L * .21);
      c.cyl(b, .0075, L * .58, M.body, 0, .04, zF + L * .29);
      slide = c.part('toggle', 0, .056, zR - .055);
      c.box(slide, .02, .012, .035, M.body, 0, 0, .018); c.cyl(slide, .007, .028, M.dark, 0, 0, .04);
      c.box(slide, .03, .008, .008, M.dark, 0, 0, .04);
      v.cyc = 'toggle'; v.slidePos = new V3(0, .056, zR - .02);
    } else if (k === 'c96') {
      c.box(b, .03, .04, L * .5, M.body, 0, .038, zR - L * .25);
      c.cyl(b, .0085, L * .5, M.body, 0, .044, zF + L * .25);
      c.box(b, .03, .05, .055, M.body, 0, .002, -.055);
      slide = c.part('bolt', 0, .062, zR - .03); c.box(slide, .018, .014, .04, M.dark, 0, 0, 0); c.box(slide, .03, .006, .006, M.dark, 0, .004, .018);
      v.cyc = 'boltSmall'; v.slidePos = new V3(0, .07, zR - .01);
    } else if (k === 'ruger') {
      c.cyl(b, .014, L * .5, M.body, 0, .04, zR - L * .25);
      c.cyl(b, .0095, L * .5, M.body, 0, .038, zF + L * .25);
      slide = c.part('bolt', 0, .04, zR); c.box(slide, .03, .01, .01, M.dark, 0, 0, .004);
      v.cyc = 'boltSmall'; v.slidePos = new V3(0, .04, zR + .005);
    } else {
      slide = c.part('slide', 0, 0, 0);
      if (k === 'beretta') {
        c.box(slide, .03, sh, L * .52, M.body, 0, yS, zR - L * .26);
        c.box(slide, .007, sh * .75, L * .48, M.body, .0115, yS - .003, zF + L * .24);
        c.box(slide, .007, sh * .75, L * .48, M.body, -.0115, yS - .003, zF + L * .24);
        c.cyl(slide, .0085, L * .48, M.metal, 0, yS + .002, zF + L * .24);
      } else if (k !== 'deagle') {
        realPistol(c, { L, zR, zF, yS, sh, big, slide });
      } else {
        c.box(slide, .03 * big, sh, L, M.body, 0, yS, (zR + zF) / 2);
        if (k === 'deagle') c.box(slide, .02, .006, L * .9, M.body, 0, yS + sh / 2 + .003, (zR + zF) / 2);
      }
      for (let i = 0; i < 5; i++) c.box(slide, .0312 * big, sh * .7, .0025, M.dark, 0, yS, zR - .008 - i * .006);
      c.box(slide, .002, .012, .028, M.dark, .0152 * big, yS + .004, -.02);
      v.cyc = 'slide'; v.slidePos = new V3(0, yS, zR - .015);
    }
    v.slide = slide;
    const sTop = yS + sh / 2 + (k === 'deagle' ? .006 : 0);
    // 가늠자
    c.box(slide, .022, .007, .006, M.dark, 0, sTop + .0035, zR - .006);
    c.box(slide, .004, .008, .005, M.dark, 0, sTop + .004, zF + .008);
    c.box(slide, .002, .002, .001, GLOW_G(), 0, sTop + .006, zF + .0052);
    c.box(slide, .002, .002, .001, GLOW_G(), .006, sTop + .005, zR - .0095);
    c.box(slide, .002, .002, .001, GLOW_G(), -.006, sTop + .005, zR - .0095);
    c.cyl(b, .0075 * big, .012, M.metal, 0, yS + .001, zF - .002);
    // 손잡이 · 방아쇠
    const realP = !['luger', 'c96', 'ruger', 'beretta', 'deagle'].includes(k);
    if (!realP) {
      c.box(b, .028 * big, .1, .046, M.furn, 0, -.046, .026, .22);
      c.box(b, .026, .008, .02, M.frame, 0, .006, .056);
      c.box(b, .006, .004, .048, M.frame, 0, -.012, -.026);
      c.box(b, .006, .024, .005, M.frame, 0, -.001, -.05);
    }
    c.box(b, .004, .016, .005, M.dark, 0, -.002, -.02);
    if (m.c === 'st' && k !== 'luger' && k !== 'ruger') { const h = c.part('hammer', 0, .045, zR + .003); c.box(h, .008, .016, .008, M.dark, 0, .006, .003); }
    if (m.fg) c.box(b, .012, .036, .012, M.dark, 0, -.018, -.075);
    // 탄창
    const mg = c.part('mag', 0, -.094, .042, .22);
    c.box(mg, .03, .011, .05, M.dark, 0, -.002, 0);
    c.box(mg, .021, .1, .034, M.dark, 0, .05, 0);
    if (m.ext || mods.mag === 'ext') c.box(mg, .026, .045, .044, M.dark, 0, -.025, 0);
    v.magPos = mg.position.clone(); v.magHold = mg.position.clone().add(new V3(0, -.015, 0)); v.magDir = new V3(0, -1, .22).normalize(); v.magLen = .1;
    // 개조
    let muzZ = zF - .008, sightY = sTop + .007;
    if (mods.sight === 'dot') {
      const s = new THREE.Group(); slide.add(s);
      c.box(s, .022, .006, .032, M.dark, 0, sTop + .003, zR - .03);
      c.box(s, .022, .003, .02, M.dark, 0, sTop + .0195, zR - .035);
      c.box(s, .003, .016, .02, M.dark, .0095, sTop + .012, zR - .035); c.box(s, .003, .016, .02, M.dark, -.0095, sTop + .012, zR - .035);
      c.box(s, .002, .002, .002, RED(), 0, sTop + .013, zR - .044);
      sightY = sTop + .013;
    }
    if (mods.muzzle === 'sup') { c.cyl(slide, .016, .14, M.dark, 0, yS + .001, zF - .075); muzZ = zF - .148; }
    else if (mods.muzzle === 'comp') { c.box(slide, .028, sh, .03, M.dark, 0, yS, zF - .012); muzZ = zF - .03; }
    if (mods.laser === 'laser') addLaser(c, b, 0, .0, zF + .03, .014);
    c.pt('muzzle', 0, yS + .001, muzZ, slide);
    c.pt('eject', .018, yS + .006, -.02);
    v.sightY = sightY; v.sightZ = zR; v.eyeDist = .3; v.hip = new V3(.13, -.12 - sightY * .4, -.32);
    v.homeR = new V3(0, -.036, .034); v.homeL = m.fg ? new V3(0, -.04, -.075) : new V3(-.008, -.062, .018);
    v.dirL = [-.55, -.6, 1]; v.casing = 'brass';
    v.chargePos = v.slidePos;
  }

  // =================================================================
  //  리볼버
  // =================================================================
  function buildRevolver(c) {
    const g = c.g, m = g.m, M = c.M, k = m.k, b = c.body, mods = c.mods, v = c.v;
    const s = m.big ? 1.15 : 1, B = (m.B || .13) * s, low = k === 'rhino';
    const by = low ? .01 : .047 * s, cy = .028 * s;
    c.box(b, .03 * s, .055 * s, .1, M.body, 0, .025 * s, -.025);
    c.box(b, .022 * s, .01, .06, M.body, 0, .059 * s, -.035);
    // 꺾이는 리볼버(웨블리)는 총열+실린더가 하나로 움직인다
    const front = k === 'webley' ? c.part('brk', 0, .002, -.075) : b;
    const fo = k === 'webley' ? new V3(0, -.002, .075) : new V3();
    c.cyl(front, .011 * s, B, M.body, fo.x, by + fo.y, -.08 - B / 2 + fo.z);
    if (!low) c.box(front, .016 * s, .018 * s, B * .9, M.body, fo.x, by - .016 * s + fo.y, -.08 - B * .45 + fo.z);
    if (m.rib) c.box(front, .008, .007, B, M.body, fo.x, by + .013 * s + fo.y, -.08 - B / 2 + fo.z);
    c.box(front, .004, .012, .008, M.dark, fo.x, by + .016 * s + fo.y, -.08 - B + .01 + fo.z);
    // 실린더 (스윙아웃)
    let crane;
    if (k === 'webley') crane = c.part('crane', fo.x, cy + fo.y, -.03 + fo.z, 0, front);
    else crane = c.part('crane', -.014 * s, cy - .016 * s, -.03);
    const cylG2 = c.part('cyl', k === 'webley' ? 0 : .014 * s, k === 'webley' ? 0 : .016 * s, 0, 0, crane);
    c.cyl(cylG2, .024 * s, .046, M.body, 0, 0, 0, 12);
    for (let i = 0; i < 6; i++) { const a = i / 6 * PI * 2 + PI / 6; c.box(cylG2, .004, .004, .036, M.dark, Math.cos(a) * .024 * s, Math.sin(a) * .024 * s, 0); }
    const rims = c.part('rims', 0, 0, .024, 0, cylG2);
    const n = g.mag;
    for (let i = 0; i < n; i++) { const a = i / n * PI * 2 + PI / 2; const r = new THREE.Mesh(cylG(.0048, .0048, .004, 8), BASE.brass()); r.position.set(Math.cos(a) * .0145 * s, Math.sin(a) * .0145 * s, 0); rims.add(r); }
    c.cyl(b, .003, .04, M.metal, .0, by - .02, -.065);
    // 손잡이 · 공이치기
    c.box(b, .028 * s, .09 * s, .045, M.furn, 0, -.036 * s, .042, .38);
    c.box(b, .006, .004, .04, M.frame, 0, -.008, -.005);
    c.box(b, .006, .02, .005, M.frame, 0, .002, -.025);
    c.box(b, .004, .016, .005, M.dark, 0, .0, .0);
    const h = c.part('hammer', 0, .055 * s, .025); c.box(h, .007, .02, .012, M.dark, 0, .008, .004);
    if (k === 'saa') { const gate = c.part('gate', .014 * s, cy, .0); c.box(gate, .004, .014, .012, M.body, 0, 0, 0); }
    let muzZ = -.08 - B - .005, sightY = .066 * s;
    if (mods.sight === 'dot' || mods.sight === 'acog') {
      const zz = mods.sight === 'acog' ? .1 : .045;
      c.box(b, .02, .012, .05, M.dark, 0, .07 * s, -.05);
      c.tube(b, mods.sight === 'acog' ? .017 : .015, zz, M.dark, 0, .09 * s, -.05);
      c.box(b, .002, .002, .002, RED(), 0, .09 * s, -.05 - zz / 2 + .004);
      sightY = .09 * s;
    }
    if (mods.muzzle === 'sup') { c.cyl(front, .016, .13, M.dark, fo.x, by + fo.y, muzZ - .065 + fo.z); muzZ -= .13; }
    if (mods.laser === 'laser') addLaser(c, b, 0, by - .03, -.1, .014);
    c.pt('muzzle', fo.x, by + fo.y, muzZ + fo.z, front);
    c.pt('eject', 0, cy, .02);
    v.cyc = g.mode === 'sa' ? 'sa' : 'da'; v.cylStep = PI * 2 / n;
    v.sightY = sightY; v.sightZ = .03; v.eyeDist = .3; v.hip = new V3(.13, -.12 - sightY * .4, -.33);
    v.homeR = new V3(0, -.036, .04); v.homeL = new V3(-.008, -.062, .022); v.dirL = [-.55, -.6, 1]; v.casing = 'none';
    v.cylPos = new V3(0, cy, -.03); v.cylOpenPos = new V3(-.035 * s, cy + .005, -.03);
    v.portPos = new V3(.016 * s, cy, .0);
    v.magHold = v.cylPos.clone(); v.magPos = v.cylPos.clone();
  }

  // =================================================================
  //  긴 총 (기관단총 · 소총 · 산탄총 · 기관총)
  // =================================================================
  const LONG_DEF = {
    smg: { L: .3, B: .08, H: .055, W: .042, st: 'fold', mg: 'straight', h: 'none' },
    ar: { L: .36, B: .24, H: .06, W: .046, st: 'fixed', mg: 'curved', h: 'round' },
    br: { L: .42, B: .34, H: .062, W: .048, st: 'fixed', mg: 'straight', h: 'box' },
    sniper: { L: .34, B: .46, H: .058, W: .045, st: 'trad', mg: 'internal', h: 'wood', trad: 1 },
    shotgun: { L: .3, B: .42, H: .066, W: .05, st: 'trad', mg: 'tube', h: 'pump', trad: 1 },
    lmg: { L: .46, B: .42, H: .075, W: .056, st: 'fixed', mg: 'box', h: 'round', bipod: 1 },
  };
  function spec(g) {
    const d = Object.assign({}, LONG_DEF[g.cat] || LONG_DEF.ar), m = g.m;
    if (m.k === 'ak') Object.assign(d, { mg: 'curved', h: 'ak', st: m.c === 'wood' ? 'wood' : 'fold' });
    if (g.cat === 'shotgun' && m.c && m.c !== 'wood') Object.assign(d, { st: 'fixed', trad: 0 });
    if (g.cat === 'sniper' && m.st && m.st !== 'trad') d.trad = 0;
    Object.assign(d, m);
    if (m.st === 'trad') d.trad = 1;
    if (d.noPump && d.h === 'pump') d.h = 'box';
    if (g.cat === 'lmg' && !m.mg && g.rt === 'belt') d.mg = 'box';
    return d;
  }
  function magLen(g, mods) { const cap = Math.min(g.mag * (mods.mag === 'ext' ? 1.5 : 1), 60); return .07 + cap * .0032; }

  function buildLong(c) {
    const g = c.g, M = c.M, b = c.body, mods = c.mods, v = c.v, S = spec(g);
    const { L, B, H, W } = S;
    const bull = !!S.bull, trad = !!S.trad;
    const zr = bull ? .27 : trad ? .0 : .085, zf = zr - L;
    const by = H * .64, br = g.cat === 'lmg' ? .012 : g.cat === 'shotgun' ? .013 : S.big ? .016 : g.cat === 'sniper' ? .011 : .0095;
    const ak = S.k === 'ak';
    const RA = realArch(g, S);
    if (RA) realBody(c, RA, { S, L, B, H, W, zr, zf, by, g });
    // 몸통
    if (RA) { /* 진짜 모양 */ } else if (trad) c.box(b, W * .96, .05, L + .02, M.furn, 0, .01, (zr + zf) / 2);
    if (!RA) c.box(b, W, H, L, M.body, 0, H / 2 - .004, (zr + zf) / 2);
    if (!RA && !trad && !bull) c.box(b, W * .9, H * .35, L * .55, M.body, 0, -.005, zf + L * .5);
    if (S.lever || S.k === 'lever') { /* 레버액션은 몸통 그대로 */ }
    // 배출구
    c.box(b, .002, H * .35, .05, M.dark, W / 2 + .001, H * .62, zf + L * .45);
    // 총열
    const sd = S.h === 'sd';
    if (S.k === 'double') {
      c.box(b, W, H * .8, .03, M.body, 0, H * .4, zf);
    } else c.cyl(b, br, B + .02, M.metal, 0, by, zf - B / 2);
    // 총몸 덮개
    switch (RA && !sd ? '' : S.h) {
      case 'round': c.cyl(b, .026, B * .55, M.furn, 0, by, zf - B * .28, 14); break;
      case 'rail': c.box(b, W * 1.05, .055, B * .6, M.body, 0, by - .004, zf - B * .3); c.box(b, W * .42, .007, B * .58, M.dark, 0, by + .027, zf - B * .3); break;
      case 'box': c.box(b, W, .05, B * .55, M.furn, 0, by - .006, zf - B * .28); break;
      case 'wood': c.box(b, W * .95, .044, B * .78, M.furn, 0, by - .014, zf - B * .39); break;
      case 'ak': c.box(b, W * .95, .048, .17, M.furn, 0, by - .012, zf - .09); c.box(b, W * .7, .024, .13, M.furn, 0, by + .024, zf - .075); c.cyl(b, .007, B * .45, M.metal, 0, by + .02, zf - B * .3); break;
      case 'shroud': c.cyl(b, .022, B * .75, M.dark, 0, by, zf - B * .38, 10); for (let i = 0; i < 5; i++) c.cyl(b, .0225, .006, BASE.poly(), 0, by, zf - B * .1 - i * B * .13, 10); break;
      case 'cooler': c.cyl(b, .04, B * .85, M.dark, 0, by, zf - B * .43, 16); break;
      case 'sd': c.cyl(b, .03, B + .05, M.dark, 0, by, zf - B / 2 - .02, 16); break;
    }
    // 펌프 · 튜브 탄창
    if (g.rt === 'shell' || S.mg === 'tube' || S.k === 'lever') {
      const tubes = S.tubes || 1;
      for (let i = 0; i < tubes; i++) c.cyl(b, .011, B * .85, M.metal, tubes > 1 ? (i ? .012 : -.012) : 0, by - .028, zf - B * .43);
    }
    if (g.mode === 'pump') { const pp = c.part('pump', 0, by - .03, zf - .12); if (RA) realPump(c, pp, W, M.furn); else { c.box(pp, W * .92, .046, .15, M.furn, 0, 0, 0); for (let i = 0; i < 5; i++) c.box(pp, W * .95, .04, .004, M.dark, 0, 0, -.06 + i * .03); } }
    // 손잡이 · 방아쇠
    if (!RA) {
      if (!trad) c.box(b, .03, .095, .045, M.furn, 0, -.05, .022, .3);
      c.box(b, .006, .004, .05, M.dark, 0, -.015, -.02);
      c.box(b, .006, .024, .005, M.dark, 0, -.004, -.045);
    }
    c.box(b, .004, .016, .005, M.dark, 0, -.005, -.015);
    // 개머리판
    const stk = RA ? 'none' : trad ? 'trad' : bull ? 'none' : S.st;
    switch (stk) {
      case 'fixed': c.cyl(b, .016, .2, M.dark, 0, .028, zr + .1); c.box(b, W * .85, .06, .17, M.furn, 0, .016, zr + .13); c.box(b, W, .12, .025, M.furn, 0, .0, zr + .22); break;
      case 'fold': c.cyl(b, .005, .22, M.dark, .013, .03, zr + .11); c.cyl(b, .005, .22, M.dark, -.013, .03, zr + .11); c.cyl(b, .005, .2, M.dark, 0, -.025, zr + .1); c.box(b, W * .8, .1, .012, M.dark, 0, .0, zr + .22); break;
      case 'wire': c.cyl(b, .005, .22, M.dark, 0, .035, zr + .11); c.cyl(b, .005, .22, M.dark, 0, -.025, zr + .11); c.box(b, W * .7, .08, .01, M.dark, 0, .005, zr + .22); break;
      case 'wood': c.box(b, W * .8, .07, .26, M.furn, 0, -.012, zr + .13, -.12); c.box(b, W * .85, .115, .02, M.furn, 0, -.035, zr + .26); break;
      case 'trad': c.box(b, W * .92, .055, .34, M.furn, 0, -.02, zr + .16, -.1); c.box(b, W * .95, .12, .03, M.furn, 0, -.05, zr + .33); break;
      case 'thumb': c.box(b, W * .8, .03, .28, M.furn, 0, .035, zr + .14); c.box(b, W * .85, .05, .22, M.furn, 0, -.035, zr + .16); c.box(b, W * .9, .13, .03, M.furn, 0, 0, zr + .28); break;
    }
    if (bull && !RA) { c.box(b, W, .12, .03, M.furn, 0, .0, zr + .01); c.box(b, W * .95, .04, L * .45, M.body, 0, -.02, zr - L * .23); }
    // 탄창
    const mt = S.mg, ml = magLen(g, mods);
    const zmw = bull ? zr - .07 : ak ? zf + L * .36 : zf + L * .3;
    const magM = S.clear ? BASE.clear() : (S.c === 'wood' && mt === 'drum' ? BASE.steel() : M.dark);
    let mgp = null;
    v.magDir = new V3(0, -1, 0);
    if (RA && realMag(c, RA, mgp = c.part('mag', 0, 0, zmw), ml, W, magM, mt, g)) {
      const kk = RA === 'ak' ? (mt === 'straight' ? .05 : .34) : .15;
      v.magHold = new V3(0, -ml * .7, zmw - kk * ml * .5);
    } else if (mt === 'straight' || mt === 'curved' || mt === 'curvedL' || mt === 'curvedS') {
      if (!mgp) mgp = c.part('mag', 0, 0, zmw);
      const segs = mt === 'straight' ? 1 : 4, bend = mt === 'curvedS' ? .06 : mt === 'curvedL' ? .09 : .13;
      let y = 0, z = 0, a = .05;
      for (let i = 0; i < segs; i++) {
        const sl = ml / segs;
        const o = c.box(mgp, W * .55, sl + .002, .052, magM, 0, y - Math.cos(a) * sl / 2, z - Math.sin(a) * sl / 2, -a);
        void o;
        y -= Math.cos(a) * sl; z -= Math.sin(a) * sl; a += bend;
      }
      c.box(mgp, W * .6, .008, .056, magM, 0, y, z, -a);
      v.magHold = new V3(0, -ml * .7, zmw - .02);
    } else if (mt === 'drum') {
      mgp = c.part('mag', 0, 0, zmw);
      c.box(mgp, W * .5, .03, .045, magM, 0, -.015, 0);
      const d = new THREE.Mesh(vcylG(.07, .05, 22), magM); d.rotation.z = PI / 2; d.position.set(0, -.09, 0); mgp.add(d);
      const hub = new THREE.Mesh(vcylG(.02, .056, 10), M.metal); hub.rotation.z = PI / 2; hub.position.set(0, -.09, 0); mgp.add(hub);
      v.magHold = new V3(-.03, -.1, zmw);
      if (S.k === 'tommy') v.magDir = new V3(-1, 0, 0);
      else v.magDir = new V3(0, -1, .2).normalize();
    } else if (mt === 'box') {
      mgp = c.part('mag', -.01, -.005, zf + L * .4);
      c.box(mgp, .075, .09, .11, BASE.green(), -.02, -.05, 0);
      c.box(mgp, .02, .01, .08, M.dark, -.02, -.0, 0);
      const belt = c.part('belt', -W / 2 - .005, H * .55, zf + L * .4);
      for (let i = 0; i < 5; i++) { const r = roundMesh('brass'); r.rotation.y = PI / 2; r.position.set(-i * .008, -i * .012, 0); belt.add(r); }
      v.magHold = new V3(-.04, -.08, zf + L * .4);
    } else if (mt === 'top') {
      mgp = c.part('mag', 0, H, zmw);
      let y = 0, z = 0, a = -.15;
      for (let i = 0; i < 4; i++) { const sl = ml / 4; c.box(mgp, W * .5, sl + .002, .05, magM, 0, y + Math.cos(a) * sl / 2, z + Math.sin(a) * sl / 2, a); y += Math.cos(a) * sl; z += Math.sin(a) * sl; a -= .12; }
      v.magHold = new V3(0, H + ml * .7, zmw - .02); v.magDir = new V3(0, 1, 0);
    } else if (mt === 'side') {
      mgp = c.part('mag', -W / 2, by * .9, zmw);
      c.box(mgp, ml, .028, .04, magM, -ml / 2, 0, 0);
      v.magHold = new V3(-W / 2 - ml * .7, by * .9, zmw); v.magDir = new V3(-1, 0, 0);
    } else if (mt === 'pan') {
      mgp = c.part('mag', 0, H + .004, zmw);
      const p = new THREE.Mesh(vcylG(.11, .022, 26), magM); p.position.y = .012; mgp.add(p);
      const hub = new THREE.Mesh(vcylG(.025, .03, 12), M.metal); hub.position.y = .014; mgp.add(hub);
      v.magHold = new V3(-.06, H + .03, zmw); v.magDir = new V3(0, 1, 0);
    } else if (mt === 'grip') {
      mgp = c.part('mag', 0, -.094, .035, .3);
      c.box(mgp, .03, .012, .048, M.dark, 0, -.002, 0);
      c.box(mgp, .022, .1, .034, M.dark, 0, .05, 0);
      const extra = Math.max(0, (g.mag * (mods.mag === 'ext' ? 1.5 : 1) - 20) * .0028);
      if (extra) c.box(mgp, .025, extra, .04, M.dark, 0, -extra / 2, 0);
      v.magHold = new V3(0, -.1 - extra, .045); v.magDir = new V3(0, -1, .3).normalize();
    } else if (mt === 'helical') {
      mgp = c.part('mag', 0, -.005, zf + .02);
      c.cyl(mgp, .032, .24, magM, 0, -.03, -.12, 16);
      v.magHold = new V3(0, -.06, zf - .08); v.magDir = new V3(0, -.3, -1).normalize();
    } else if (mt === 'internal' || mt === 'tube') {
      mgp = c.part('mag', 0, -.005, zmw);
      if (mt === 'internal') c.box(mgp, W * .6, .01, .07, M.metal, 0, 0, 0);
      v.magHold = new V3(0, -.03, zmw);
    }
    v.magPos = mgp ? mgp.position.clone() : new V3(0, 0, zmw);
    v.magLen = ml;
    // 장전 손잡이 / 볼트
    const rt = g.rt;
    let charge = 'ar';
    if (g.mode === 'bolt') {
      const bp = c.part('bolt', 0, H * .72, zr - .03);
      c.cyl(bp, .009, .1, M.metal, 0, 0, -.02);
      c.box(bp, .045, .007, .008, M.metal, .024, 0, .02);
      const knob = new THREE.Mesh(new THREE.SphereGeometry(.009, 10, 8), M.metal); knob.position.set(.048, -.004, .02); bp.add(knob);
      v.knobPos = new V3(.048, H * .72 - .004, zr - .01); v.boltRot = true; charge = 'boltAction';
    } else if (ak || S.k === 'g36' || g.cat === 'br' && !trad || S.k === 'mg') {
      const bp = c.part('bolt', W / 2 + .004, H * .62, zf + L * .45);
      c.box(bp, .006, .012, .02, M.metal, 0, 0, 0); c.cyl(bp, .006, .012, M.metal, .008, 0, .006);
      charge = 'ak'; v.chargePos = new V3(W / 2 + .02, H * .62, zf + L * .45);
    } else if (rt === 'hk') {
      const bp = c.part('bolt', -W / 2 - .006, by + .01, zf - .02);
      c.box(bp, .014, .008, .02, M.dark, 0, 0, 0);
      charge = 'hk'; v.chargePos = new V3(-W / 2 - .02, by + .01, zf - .02);
    } else if (S.mg === 'grip' || S.k === 'tommy' || S.mg === 'side') {
      const bp = c.part('bolt', S.mg === 'side' ? W / 2 + .004 : 0, S.mg === 'side' ? H * .5 : H + .004, zf + L * .55);
      c.box(bp, .012, .014, .016, M.metal, 0, 0, 0);
      charge = S.mg === 'side' ? 'ak' : 'top'; v.chargePos = new V3(0, H + .02, zf + L * .55);
      if (S.mg === 'side') v.chargePos = new V3(W / 2 + .02, H * .5, zf + L * .55);
    } else if (g.mode === 'lever') {
      charge = 'none';
    } else {
      const bp = c.part('bolt', 0, H + .002, zr - .012);
      c.box(bp, .032, .007, .018, M.dark, 0, 0, 0);
      const car = c.part('carrier', W / 2 + .0015, H * .6, zf + L * .5);
      c.box(car, .002, H * .3, .04, M.metal, 0, 0, 0);
      charge = g.cat === 'shotgun' ? 'none' : 'ar';
      v.chargePos = new V3(0, H + .015, zr - .012); v.releasePos = new V3(-W / 2 - .012, H * .3, zf + L * .52);
    }
    if (rt === 'belt' || g.cat === 'lmg' && S.mg === 'box') {
      const cv = c.part('cover', 0, H, zf + .03);
      c.box(cv, W * .96, .012, L * .5, M.body, 0, .006, L * .25);
      v.coverPos = new V3(0, H + .02, zf + L * .3);
    }
    if (g.mode === 'lever') {
      const lv = c.part('lever', 0, -.012, -.03);
      c.box(lv, .007, .007, .1, M.body, 0, -.004, .03);
      c.box(lv, .007, .05, .007, M.body, 0, -.03, -.02);
      c.box(lv, .007, .007, .07, M.body, 0, -.055, .015);
      c.box(lv, .007, .04, .007, M.body, 0, -.035, .05);
    }
    if (g.rt === 'martini') { const lv = c.part('lever', 0, -.015, .0); c.box(lv, .007, .007, .14, M.metal, 0, -.01, .07); }
    if (S.k === 'double') {
      const brk = c.part('brk', 0, .0, zf + .01);
      c.cyl(brk, .014, B, M.metal, .0145, by - .005, -B / 2 - .01);
      c.cyl(brk, .014, B, M.metal, -.0145, by - .005, -B / 2 - .01);
      c.box(brk, .008, .006, B, M.metal, 0, by + .01, -B / 2 - .01);
      c.box(brk, W * .9, .03, B * .4, M.furn, 0, by - .03, -B * .25);
      c.pt('muzzle', 0, by - .005, -B - .015, brk);
      v.portPos = new V3(0, by, zf + .03);
    }
    v.charge = charge;
    // 조준기
    let sightY = H + .012, sightZ = zr - .02, eye = .12;
    const zo = bull ? zf + L * .3 : (zr + zf) / 2;
    const integrated = g.x.zoom && g.x.zoom < 3 && mods.sight === 'iron';
    if (S.rail || mods.sight !== 'iron' || integrated) c.box(b, W * .45, .008, L * .9, M.dark, 0, H + .002, (zr + zf) / 2);
    const optic = integrated ? 'integrated' : mods.sight;
    if (optic === 'iron') {
      if (S.carry) {
        c.box(b, W * .35, .028, .15, M.body, 0, H + .028, zr - .09);
        c.box(b, W * .3, .024, .015, M.body, 0, H + .014, zr - .02); c.box(b, W * .3, .024, .015, M.body, 0, H + .014, zr - .16);
        c.box(b, .012, .014, .008, M.dark, 0, H + .048, zr - .03);
        c.box(b, .006, .045, .012, M.body, 0, by + .03, zf - B * .6);
        sightY = H + .05; sightZ = zr - .03;
      } else {
        const rz = trad ? zf + .02 : ak ? zf + L * .78 : zr - .02;
        c.box(b, .022, .012, .008, M.dark, -.0075, H + .006, rz); c.box(b, .022, .012, .008, M.dark, .0075, H + .006, rz);
        c.box(b, .005, by + .03 - (H + .012) + .022, .006, M.dark, 0, (by + .03 + H + .012) / 2 - .002, zf - B + .03);
        c.box(b, .004, .022, .006, M.dark, 0, H + .006, zf - B + .03);
        sightY = H + .012; sightZ = rz; eye = trad ? .2 : .14;
      }
    } else {
      const top = H + .006;
      const og = new THREE.Group(); b.add(og);
      if (optic === 'dot') {
        c.box(og, .02, .014, .035, M.dark, 0, top + .007, zo);
        c.tube(og, .017, .045, M.dark, 0, top + .03, zo);
        c.box(og, .002, .002, .002, RED(), 0, top + .03, zo - .015);
        sightY = top + .03; sightZ = zo + .025; eye = .18;
      } else if (optic === 'holo') {
        c.box(og, .03, .012, .06, M.dark, 0, top + .006, zo);
        c.box(og, .034, .004, .05, M.dark, 0, top + .042, zo);
        c.box(og, .003, .036, .05, M.dark, .0155, top + .024, zo); c.box(og, .003, .036, .05, M.dark, -.0155, top + .024, zo);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(.0045, .0006, 6, 16), RED()); ring.position.set(0, top + .026, zo - .02); og.add(ring);
        c.box(og, .0012, .0012, .0012, RED(), 0, top + .026, zo - .02);
        sightY = top + .026; sightZ = zo + .03; eye = .18;
      } else if (optic === 'acog' || optic === 'integrated') {
        const r = optic === 'integrated' ? .02 : .018;
        c.box(og, .02, .02, .05, M.dark, 0, top + .01, zo);
        if (optic === 'integrated') c.box(og, W * .4, .035, .17, M.body, 0, top + .018, zo);
        c.tube(og, r, .11, M.dark, 0, top + .04, zo);
        c.tube(og, r + .004, .03, M.dark, 0, top + .04, zo - .065);
        c.cyl(og, r * .85, .002, GLASS(), 0, top + .04, zo - .081);
        c.box(og, .0015, .0015, .0015, RED(), 0, top + .04, zo - .02);
        sightY = top + .04; sightZ = zo + .058; eye = .08;
      } else if (optic === 'scope') {
        c.box(og, .018, .028, .015, M.dark, 0, top + .014, zo - .06); c.box(og, .018, .028, .015, M.dark, 0, top + .014, zo + .06);
        c.cyl(og, .016, .24, M.dark, 0, top + .046, zo);
        c.cyl(og, .018, .07, M.dark, 0, top + .046, zo - .14, 16, .027);
        c.cyl(og, .021, .05, M.dark, 0, top + .046, zo + .135, 16, .02);
        c.cyl(og, .023, .002, BASE.lens(), 0, top + .046, zo - .176);
        const t1 = new THREE.Mesh(vcylG(.009, .022, 10), M.dark); t1.position.set(0, top + .066, zo); og.add(t1);
        const t2 = new THREE.Mesh(vcylG(.009, .022, 10), M.dark); t2.rotation.z = PI / 2; t2.position.set(.02, top + .046, zo); og.add(t2);
        sightY = top + .046; sightZ = zo + .16; eye = .07;
      }
      if (optic !== 'integrated') c.box(b, .004, .022, .006, M.dark, 0, by + .02, zf - B + .03);
    }
    // 총구 장치
    let muzZ = zf - B - .005;
    if (S.brake && mods.muzzle === 'none' && !sd) { c.box(b, br * 2.6, br * 2.2, .045, M.dark, 0, by, muzZ - .02); muzZ -= .045; }
    if (sd) muzZ -= .03;
    if (mods.muzzle === 'sup') { c.cyl(b, .021, .18, M.dark, 0, by, muzZ - .09, 16); muzZ -= .18; }
    else if (mods.muzzle === 'comp') { c.box(b, .028, .028, .04, M.dark, 0, by, muzZ - .02); muzZ -= .04; }
    if (S.bay) c.box(b, .004, .012, .2, M.metal, 0, by - .028, zf - B * .4);
    if (S.bipod) { c.cyl(b, .004, .18, M.dark, .012, by - .028, zf - B * .55); c.cyl(b, .004, .18, M.dark, -.012, by - .028, zf - B * .55); }
    const zfg = bull ? zf - .02 : zf - Math.min(B * .3, .12);
    const hasFg = S.fg || mods.grip === 'vert';
    if (hasFg) c.box(b, .024, .075, .03, S.fg ? M.furn : M.dark, 0, by - .065, zfg);
    if (mods.laser === 'laser') addLaser(c, b, W / 2 + .012, by - .01, zf - B * .25, .02);
    if (!c.v.muzzle) c.pt('muzzle', 0, by, muzZ);
    c.pt('eject', W / 2 + .004, H * .62, zf + L * .45);
    // 손 위치
    v.homeR = trad ? new V3(0, -.035, .035) : new V3(0, -.036, .03);
    if (hasFg) v.homeL = new V3(0, by - .085, zfg);
    else if (g.mode === 'pump') v.homeL = new V3(0, by - .055, zf - .12);
    else if (bull) v.homeL = new V3(0, by - .045, zf - .05);
    else v.homeL = new V3(0, by - .045, Math.max(zf - B * .4, zf - .17));
    v.dirL = [-.45, -.55, 1];
    v.sightY = sightY; v.sightZ = sightZ; v.eyeDist = eye;
    const zoff = Math.min(.08, Math.max(-.05, zr - .1));
    v.hip = new V3(.13, -.165 - sightY * .3, -.22 - zoff * .5);
    v.portPos = v.portPos || (g.rt === 'lever' ? new V3(W / 2 + .004, H * .35, zf + L * .2) : g.mode === 'bolt' || g.rt === 'boltClip' || g.rt === 'garand' || g.rt === 'martini' ? new V3(0, H + .01, zr - .07) : new V3(0, -.01, zf + .08));
    v.clipPos = new V3(0, H + .015, trad ? zf + L * .55 : zr - .07);
    v.casing = g.cat === 'shotgun' ? 'shell' : (g.cal === '473' ? 'none' : 'brass');
    v.cyc = g.mode === 'bolt' ? 'bolt' : g.mode === 'pump' ? 'pump' : g.mode === 'lever' ? 'lever' : g.mode === 'single' ? 'none' : charge === 'ak' ? 'ak' : 'carrier';
    if (g.rt === 'break') v.casing = 'none';
    v.knobPos = v.knobPos || v.chargePos;
  }

  // =================================================================
  //  모양이 특별한 총들
  // =================================================================
  function buildP90(c) {
    const M = c.M, b = c.body, v = c.v;
    c.box(b, .05, .07, .4, M.body, 0, .02, .03);
    c.box(b, .05, .03, .1, M.body, 0, -.03, .17);
    c.box(b, .03, .085, .04, M.furn, 0, -.04, .02, .15);
    c.box(b, .045, .03, .06, M.body, 0, -.03, -.1);
    c.cyl(b, .01, .06, M.metal, 0, .03, -.19);
    const mg = c.part('mag', 0, .066, .02); c.box(mg, .036, .02, .3, BASE.clear(), 0, 0, 0);
    v.magHold = new V3(0, .085, .0); v.magPos = mg.position.clone(); v.magDir = new V3(0, 1, .4).normalize(); v.magLen = .1;
    const bp = c.part('bolt', .028, .0, -.08); c.box(bp, .008, .012, .016, M.metal, 0, 0, 0);
    v.chargePos = new V3(.04, .0, -.08); v.charge = 'ak';
    c.box(b, .03, .03, .06, M.dark, 0, .09, -.06);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.005, .0007, 6, 16), RED()); ring.position.set(0, .095, -.09); b.add(ring);
    c.pt('muzzle', 0, .03, -.225); c.pt('eject', 0, -.04, .1);
    v.sightY = .095; v.sightZ = -.03; v.eyeDist = .2; v.hip = new V3(.12, -.14, -.26);
    v.homeR = new V3(0, -.036, .03); v.homeL = new V3(0, -.05, -.1); v.dirL = [-.45, -.55, 1];
    v.casing = 'brass'; v.cyc = 'carrier';
  }
  function buildVector(c) {
    const M = c.M, b = c.body, v = c.v;
    c.box(b, .042, .06, .3, M.body, 0, .025, -.06);
    c.box(b, .04, .1, .1, M.body, 0, -.04, -.11, .3);
    c.box(b, .03, .09, .042, M.furn, 0, -.05, .022, .25);
    c.cyl(b, .01, .14, M.metal, 0, -.01, -.27);
    c.box(b, .018, .008, .28, M.dark, 0, .058, -.06);
    c.cyl(b, .006, .2, M.dark, .013, .03, .18); c.cyl(b, .006, .2, M.dark, -.013, .03, .18); c.box(b, .036, .1, .012, M.dark, 0, .005, .28);
    const mg = c.part('mag', 0, -.08, -.04, .1); c.box(mg, .024, .15, .04, M.dark, 0, -.07, 0);
    v.magHold = new V3(0, -.18, -.05); v.magPos = mg.position.clone(); v.magDir = new V3(0, -1, .1).normalize(); v.magLen = .15;
    const bp = c.part('bolt', -.024, .03, -.12); c.box(bp, .008, .01, .02, M.dark, 0, 0, 0);
    v.chargePos = new V3(-.035, .03, -.12); v.charge = 'ak';
    c.box(b, .004, .02, .006, M.dark, 0, .07, -.18); c.box(b, .016, .012, .008, M.dark, 0, .066, .06);
    let muz = -.345;
    if (c.mods.muzzle === 'sup') { c.cyl(b, .02, .16, M.dark, 0, -.01, -.42); muz = -.5; }
    c.pt('muzzle', 0, -.01, muz); c.pt('eject', .022, .02, -.06);
    v.sightY = .072; v.sightZ = .06; v.eyeDist = .14; v.hip = new V3(.12, -.13, -.26);
    if (c.mods.sight !== 'iron') { opticOnTop(c, .062, -.06); }
    v.homeR = new V3(0, -.036, .03); v.homeL = new V3(0, -.06, -.2); v.dirL = [-.45, -.55, 1]; v.casing = 'brass'; v.cyc = 'carrier';
  }
  function opticOnTop(c, top, zo) {
    const M = c.M, b = c.body, v = c.v;
    if (c.mods.sight === 'dot' || c.mods.sight === 'holo') {
      c.tube(b, .017, .045, M.dark, 0, top + .024, zo); c.box(b, .002, .002, .002, RED(), 0, top + .024, zo - .015);
      v.sightY = top + .024; v.sightZ = zo + .025; v.eyeDist = .18;
    } else {
      c.tube(b, .018, .12, M.dark, 0, top + .03, zo); c.box(b, .0015, .0015, .0015, RED(), 0, top + .03, zo - .03);
      v.sightY = top + .03; v.sightZ = zo + .06; v.eyeDist = .08;
    }
  }
  function buildG11(c) {
    const M = c.M, b = c.body, v = c.v;
    c.box(b, .06, .11, .62, M.body, 0, .02, .05);
    c.box(b, .03, .085, .04, M.furn, 0, -.06, .0, .2);
    c.box(b, .035, .012, .16, M.dark, 0, .074, -.05);
    c.tube(b, .018, .16, M.dark, 0, .1, -.05);
    c.cyl(b, .016, .005, GLASS(), 0, .1, -.13);
    const mg = c.part('mag', 0, .085, .2); c.box(mg, .03, .02, .22, M.dark, 0, 0, -.06);
    v.magHold = new V3(0, .1, .25); v.magPos = mg.position.clone(); v.magDir = new V3(0, .2, 1).normalize(); v.magLen = .1;
    c.pt('muzzle', 0, .02, -.27); c.pt('eject', .03, 0, -.05);
    v.sightY = .1; v.sightZ = .03; v.eyeDist = .1; v.hip = new V3(.12, -.14, -.25);
    v.homeR = new V3(0, -.036, .03); v.homeL = new V3(0, -.04, -.18); v.dirL = [-.45, -.55, 1]; v.casing = 'none'; v.cyc = 'none'; v.charge = 'none';
  }
  function buildLever(c) {
    // 레버액션은 긴 총 조립을 쓰고 레버만 추가된다
    c.g.m.trad = 1; buildLong(c);
    c.v.homeR = new V3(0, -.03, .02);
  }
  function buildMinigun(c) {
    const M = c.M, b = c.body, v = c.v;
    c.box(b, .1, .1, .22, M.dark, 0, .0, .05);
    c.cyl(b, .05, .06, M.dark, 0, .0, -.08, 18);
    const sp = c.part('spin', 0, 0, -.1);
    for (let i = 0; i < 6; i++) { const a = i / 6 * PI * 2; c.cyl(sp, .009, .55, M.metal, Math.cos(a) * .028, Math.sin(a) * .028, -.28); }
    c.cyl(sp, .045, .02, M.dark, 0, 0, -.35, 16); c.cyl(sp, .045, .02, M.dark, 0, 0, -.52, 16);
    c.box(b, .02, .05, .16, M.dark, 0, .09, .0); c.box(b, .02, .04, .02, M.dark, 0, .06, .07); c.box(b, .02, .04, .02, M.dark, 0, .06, -.06);
    c.box(b, .03, .09, .04, M.furn, 0, -.08, .1, .2);
    const mg = c.part('mag', -.12, -.08, .06); c.box(mg, .12, .12, .16, BASE.green(), -.02, -.04, 0);
    c.cyl(b, .02, .14, M.dark, -.07, -.03, .06);
    v.magHold = new V3(-.14, -.1, .06); v.magPos = mg.position.clone(); v.magDir = new V3(-.3, -1, 0).normalize(); v.magLen = .12;
    c.pt('muzzle', 0, 0, -.56); c.pt('eject', .05, -.05, .05);
    v.sightY = .12; v.sightZ = .05; v.eyeDist = .25; v.hip = new V3(.11, -.17, -.22);
    v.homeR = new V3(0, -.036, .09); v.homeL = new V3(0, .1, .0); v.dirL = [-.6, -.3, 1]; v.casing = 'brass'; v.cyc = 'spin'; v.charge = 'none';
  }
  function buildRPG(c) {
    const M = c.M, b = c.body, v = c.v;
    c.cyl(b, .022, .9, M.metal, 0, .05, -.15, 16);
    c.cyl(b, .028, .26, BASE.wood(), 0, .05, -.05, 16);
    c.cyl(b, .045, .18, M.metal, 0, .05, .36, 16, .024);
    c.box(b, .03, .085, .04, M.furn, 0, -.03, .02, .2); c.box(b, .03, .085, .04, M.furn, 0, -.03, -.16, .1);
    c.box(b, .015, .04, .08, M.dark, -.04, .07, -.05);
    const wh = c.part('mag', 0, .05, -.62);
    c.cyl(wh, .016, .14, BASE.green(), 0, 0, .0);
    c.cyl(wh, .045, .16, BASE.green(), 0, 0, -.15, 14, .0001);
    c.cyl(wh, .045, .05, BASE.green(), 0, 0, -.045, 14);
    v.magHold = new V3(0, .02, -.66); v.magPos = wh.position.clone(); v.magDir = new V3(0, -.2, -1).normalize(); v.magLen = .2;
    c.pt('muzzle', 0, .05, -.62); c.pt('eject', 0, 0, 0);
    v.sightY = .09; v.sightZ = -.02; v.eyeDist = .2; v.hip = new V3(.1, -.15, -.2);
    v.homeR = new V3(0, -.03, .03); v.homeL = new V3(0, -.06, -.16); v.dirL = [-.45, -.55, 1]; v.casing = 'none'; v.cyc = 'none'; v.charge = 'none';
    c.box(b, .004, .02, .006, M.dark, -.04, .1, -.08);
  }
  function buildM79(c) {
    const M = c.M, b = c.body, v = c.v;
    c.box(b, .045, .05, .08, M.metal, 0, .02, -.02);
    const brk = c.part('brk', 0, .0, -.06);
    c.cyl(brk, .026, .3, M.metal, 0, .04, -.15, 16);
    c.box(brk, .045, .03, .14, BASE.wood(), 0, .0, -.1);
    c.box(b, .042, .06, .32, BASE.wood(), 0, -.01, .17, -.12); c.box(b, .045, .12, .03, BASE.wood(), 0, -.04, .33);
    c.box(b, .03, .03, .02, M.dark, 0, .07, -.05);
    c.pt('muzzle', 0, .04, -.31, brk); c.pt('eject', 0, .04, -.07);
    v.portPos = new V3(0, .05, -.06);
    v.sightY = .085; v.sightZ = -.05; v.eyeDist = .2; v.hip = new V3(.12, -.14, -.26);
    v.homeR = new V3(0, -.035, .03); v.homeL = new V3(0, -.03, -.17); v.dirL = [-.45, -.55, 1]; v.casing = 'none'; v.cyc = 'none'; v.charge = 'none';
    v.magHold = v.portPos.clone(); v.magPos = v.portPos.clone();
  }
  function buildMGL(c) {
    const M = c.M, b = c.body, v = c.v;
    c.box(b, .05, .03, .26, M.body, 0, .07, -.05);
    const crane = c.part('crane', -.0, .0, -.05);
    const cyl = c.part('cyl', 0, .02, 0, 0, crane);
    c.cyl(cyl, .065, .13, M.dark, 0, 0, 0, 18);
    const rims = c.part('rims', 0, 0, .066, 0, cyl);
    for (let i = 0; i < 6; i++) { const a = i / 6 * PI * 2; const r = new THREE.Mesh(cylG(.02, .02, .004, 12), BASE.brass()); r.position.set(Math.cos(a) * .04, Math.sin(a) * .04, 0); rims.add(r); }
    c.cyl(b, .028, .16, M.metal, 0, .06, -.23, 16);
    c.box(b, .03, .085, .04, M.furn, 0, -.05, .05, .2); c.box(b, .03, .07, .03, M.furn, 0, -.04, -.22);
    c.cyl(b, .006, .2, M.dark, .015, .03, .2); c.cyl(b, .006, .2, M.dark, -.015, .03, .2); c.box(b, .04, .1, .015, M.dark, 0, .0, .3);
    c.cyl(b, .017, .045, M.dark, 0, .11, -.05); c.box(b, .002, .002, .002, RED(), 0, .11, -.065);
    c.pt('muzzle', 0, .06, -.32); c.pt('eject', 0, .02, .0);
    v.sightY = .11; v.sightZ = -.03; v.eyeDist = .2; v.hip = new V3(.12, -.15, -.26);
    v.homeR = new V3(0, -.036, .05); v.homeL = new V3(0, -.06, -.22); v.dirL = [-.45, -.55, 1]; v.casing = 'none'; v.cyc = 'da'; v.cylStep = PI / 3; v.charge = 'none';
    v.cylPos = new V3(0, .02, -.05); v.cylOpenPos = new V3(-.05, .03, -.05); v.magHold = v.cylPos.clone(); v.magPos = v.cylPos.clone();
  }

  // =================================================================
  //  진짜 총처럼: 실제 총의 옆모습 윤곽선을 그대로 뽑아(압출) 만든 부품들
  //  좌표는 [z, y] (z가 작을수록 총구 쪽). 두께 w만큼 좌우로 뽑는다
  // =================================================================
  const extCache = {};
  function extG(pts, w, holes, bev) {
    const key = JSON.stringify([pts, w, holes || 0, bev === undefined ? -1 : bev]);
    if (extCache[key]) return extCache[key];
    const sh = new THREE.Shape(); pts.forEach(([z, y], i) => i ? sh.lineTo(-z, y) : sh.moveTo(-z, y));
    (holes || []).forEach(hp => { const p = new THREE.Path(); hp.forEach(([z, y], i) => i ? p.lineTo(-z, y) : p.moveTo(-z, y)); sh.holes.push(p); });
    const bv = bev === undefined ? Math.min(.0016, w * .16) : bev, d = Math.max(.0004, w - bv * 2);
    const g = new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: bv > 0, bevelThickness: bv, bevelSize: bv, bevelSegments: 1, steps: 1, curveSegments: 4 });
    g.translate(0, 0, -d / 2); g.rotateY(PI / 2);
    return extCache[key] = g;
  }
  Ctx.prototype.ext = function (p, pts, w, m, x, holes, bev) { const o = new THREE.Mesh(extG(pts, w, holes, bev), m); o.position.x = x || 0; p.add(o); return o; };
  const R5 = v => Math.round(v * 1e5) / 1e5;
  const mv = (pts, dz, dy) => pts.map(([z, y]) => [R5(z + dz), R5(y + dy)]);
  // 둥근 모서리용 호
  const arc = (cz, cy, r, a0, a1, n) => { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push([R5(cz + Math.cos(a) * r), R5(cy + Math.sin(a) * r)]); } return o; };

  // 피카티니 레일: 바탕 위로 이가 줄지어 솟아 있다. side: 'top' | 'l' | 'r' | 'bot'
  function rail(c, p, z0, z1, x, y, side, m) {
    const L = z0 - z1, zc = (z0 + z1) / 2, w = .021;
    const T = side === 'top' || side === 'bot', s = side === 'bot' || side === 'l' ? -1 : 1;
    if (T) c.box(p, w * .75, .005, L, m, x, y + s * .0025, zc); else c.box(p, .005, w * .75, L, m, x + s * .0025, y, zc);
    for (let z = z1 + .004; z < z0 - .002; z += .01) {
      if (T) c.box(p, w, .004, .0052, m, x, y + s * .007, z); else c.box(p, .004, w, .0052, m, x + s * .007, y, z);
    }
  }
  // 방아쇠울 (가운데가 뚫린 고리)
  function tguard(c, p, z0, y0, m, sq) {
    const o = [[z0 - .058, y0 + .002], [z0 - .058, y0 - (sq ? .026 : .018)], [z0 - (sq ? .055 : .05), y0 - .028], [z0 + .004, y0 - .028], [z0 + .004, y0 + .002]];
    const h = [[z0 - .052, y0 - .001], [z0 - .052, y0 - (sq ? .021 : .016)], [z0 - (sq ? .05 : .046), y0 - .022], [z0 - .003, y0 - .022], [z0 - .003, y0 - .001]];
    c.ext(p, o, .007, m, 0, [h]);
  }
  // 권총 손잡이 (소총용). 원점 = 몸통 밑 앞쪽
  const GRIPS = {
    a2: [[-.013, 0], [-.008, -.026], [-.014, -.04], [-.006, -.052], [.003, -.086], [.012, -.099], [.044, -.094], [.034, -.05], [.03, -.012], [.032, 0]],
    ak: [[-.008, 0], [.004, -.07], [.008, -.092], [.03, -.096], [.032, -.07], [.026, 0]],
    hk: [[-.012, 0], [-.004, -.03], [-.01, -.045], [.002, -.09], [.014, -.1], [.044, -.095], [.034, -.04], [.034, 0]],
    wood: [[-.006, 0], [.006, -.08], [.016, -.094], [.04, -.088], [.03, -.02], [.03, 0]],
    mod: [[-.012, 0], [-.006, -.028], [-.012, -.042], [-.004, -.056], [.006, -.088], [.016, -.1], [.046, -.093], [.038, -.05], [.035, -.012], [.036, 0]],
  };
  function pgrip(c, p, z, y, kind, m, w) { c.ext(p, mv(GRIPS[kind] || GRIPS.a2, z, y), w || .029, m); }

  // 탄창 윤곽: 위에서 아래로 내려가며 앞으로 휘어진다. d = 앞뒤 폭, k = 휘는 정도
  function magShape(ml, d, k, plate, lug) {
    const n = 6, front = [], back = [];
    for (let i = 0; i <= n; i++) { const t = i / n, y = -t * ml, cz = -k * ml * t * t; front.push([R5(cz - d / 2), R5(y)]); back.push([R5(cz + d / 2), R5(y)]); }
    const bz = -k * ml, by = -ml;
    const pts = [[d / 2, .004]].concat(lug ? [[-d / 2 - .006, .004], [-d / 2 - .006, -.01]] : [[-d / 2, .004]]).concat(front.slice(1));
    if (plate) pts.push([R5(bz - d / 2 - .004), R5(by)], [R5(bz - d / 2 - .004), R5(by - .008)], [R5(bz + d / 2 + .004), R5(by - .008)], [R5(bz + d / 2 + .004), R5(by)]);
    return pts.concat(back.reverse().slice(0, -1));
  }
  function realMag(c, RA, mgp, ml, W, m, mt, g) {
    if (mt !== 'curved' && mt !== 'straight' && mt !== 'curvedL' && mt !== 'curvedS') return false;
    let d = .056, k = mt === 'straight' ? .02 : mt === 'curvedS' ? .1 : mt === 'curvedL' ? .16 : .2, lug = false, rib = 0, w = W * .55;
    if (RA === 'ak') { d = .062; k = mt === 'straight' ? .05 : .34; lug = true; rib = 1; }
    else if (RA === 'ar' || RA === 'mod' || RA === 'pup') { d = .058; k = mt === 'straight' ? .02 : .13; rib = 2; w = .024; }
    else if (RA === 'hk') { if (g.cat === 'smg') { d = .036; k = .3; w = .022; } else { d = .062; k = .08; } rib = 2; }
    else if (RA === 'box' || RA === 'tube') { d = .034; k = .0; w = .022; }
    const pts = magShape(ml, d, k, true, lug);
    c.ext(mgp, pts, w, m);
    // 탄창 옆면의 홈 (보강 갈비뼈)
    if (rib) for (let i = 1; i <= 3; i++) {
      const t = i / 4.2, y = -t * ml, cz = -k * ml * t * t;
      c.box(mgp, w + .003, .004, d * .82, m, 0, y, cz, -2 * k * t * .9);
    }
    // 맨 위의 탄 (보이는 곳)
    if (g.cat !== 'shotgun') { const r = roundMesh('brass'); r.position.set(0, .006, .004); r.scale.setScalar(.9); mgp.add(r); }
    return true;
  }

  // 총이 어느 집안인지 (모양 고르기)
  function realArch(g, S) {
    const id = g.id, k = g.m.k;
    if (['p90', 'vector', 'g11', 'minigun', 'rpg', 'm79', 'mgl', 'double', 'tommy'].includes(k)) return null;
    if (S.bull) return 'pup';
    const has = re => re.test(id);
    if (g.cat === 'shotgun') return k === 'ak' ? 'ak' : has(/^(aa12|usas12|striker|jackhammer|dp12|srm1216|neostead|uts15|mag7|spas15|ksg|ks7|streetsweeper|typhoonf12|mka1919)$/) ? 'mod' : 'shot';
    if (has(/^(svd|svdk|svds|psl|m76|m91rs|svch|galatz)$/)) return 'svd';
    if (k === 'ak' || has(/^(vz58|insas|excalibur|type63|t65)$/)) return 'ak';
    if (has(/^(mp5|mp5sd|mp5k|mp510|g3|g3sg1|hk33|hk53|hk21|psg1|msg90|ak4|cetmel|g41|ameli)$/)) return 'hk';
    if (has(/^(m16a1|m16a2|m16a4|m4a1|commando|hk416|k2|k2c1|k2a|k1a|stc16|c7|c8|mcx|xm7|sr16|sig516|ar556|mp15|lwrcm6|rec7|sp1|car15|m27|mk18|saint|lr300|stm556|xk8|t86|t91|ss2|ar10|sr25|hk417|l129a1|mk12|m110|mk11|g28|sig716|m39emr|xcr|arad|ar18|ss1|fnc|sar80|sr88|mk16)$/)) return 'ar';
    if (g.cat === 'sniper') {
      if (has(/^(m82|as50|barrettm95|hecate2|osv96|asvk|ntw20|hs50|m93ba|gepard|vks|lahti39|ptrd41|ptrs41|boys|ax50|m200|vidhwansak)$/)) return 'amr';
      if (has(/^(awm|l96|axmc|mrad|msr|m2010|tac50|tac338|dsr1|dsr50|sv98|t5000|dvl10|ultimaratio|frf2|ssg3000|sv99|trg42|trg22|k14)$/)) return 'tac';
      if (has(/^(r700|m24|m40|win70|t3|cz550|markv|scout|sp66|ssg69|r93|r1022)$/)) return 'sport';
      return 'wood';
    }
    if (g.cat === 'lmg') {
      if (k === 'ak') return 'ak';
      if (has(/^(m249|m60|pkm|pecheneg|m240|mg42|mg34|mg3|mg4|mg5|negev|negevng7|k3|k12|k15|mk43|mk48|fnmag|rpl20|m1919|qjy88|rp46|sg43|type99lmg|ultimax)$/)) return 'belt';
      return 'wood';
    }
    if (g.cat === 'br') {
      if (has(/^(scarh|scar20s|tavor7|qbu191|rfb|mk14)$/)) return 'mod';
      if (has(/^(fal|l1a1)$/)) return 'fal';
      return 'wood';
    }
    if (g.cat === 'smg') {
      if (k === 'uzi' || k === 'mac') return 'box';
      if (has(/^(mp40|sten|stenmk5|stenmk2s|sterling|m3|mat49|owen|austen|lanchester|mp3008|f1smg|cgm45|m56|madsen50|type100|pps43)$/)) return 'tube';
      if (has(/^(ppsh|ppd40|suomi|thompson|m1a1t|mp18|mp28|mp34|mp35|emp35|m38a|b1918|reising|kiraly|orita|mas38|fnab43|tz45|lf57|hovea|labora|mors|m12|vigneron|z62|hotchkissU|fbp48|ud42|sw76|type79|lusa|sub2000|cx4)$/)) return 'wood';
      return 'mod';
    }
    if (g.cat === 'ar') {
      if (has(/^(stg44|stg45|mkb42|vg15|fedorov|mini14|sks|em2)$/)) return 'wood';
      return 'mod';
    }
    return null;
  }

  // ---------- 집안별 몸통 · 총열 덮개 · 손잡이 · 개머리판 ----------
  function realBody(c, RA, X) {
    const { S, L, B, H, W, zr, zf, by, g } = X, M = c.M, b = c.body, id = g.id, dk = M.dark, met = M.metal;
    const flatTop = !S.carry;
    const stockOf = () => S.st;
    if (RA === 'ar') {
      // 아래 몸통: 탄창 들어가는 곳이 아래로 벌어지고, 방아쇠울이 붙어 있다
      const zm = zf + L * .3;
      c.ext(b, [[zr, H * .45], [zr, H * .05], [zr - .02, -.006], [zm + .03, -.006], [zm + .033, -.022], [zm - .033, -.022], [zm - .036, -.002], [zf + .02, H * .1], [zf + .02, H * .45]], W * .96, M.body);
      tguard(c, b, .002, -.004, M.body, true);
      // 위 몸통 + 전진 보조 장치 + 탄피 막이
      c.ext(b, [[zr + .004, H * .45], [zr + .004, H * .96], [zf, H * .96], [zf, H * .45]], W * .9, M.body);
      c.cyl(b, .007, .04, M.body, W * .45, H * .72, zr - .03).rotation.x = .25;
      c.ext(b, [[zr - .05, H * .55], [zr - .045, H * .92], [zr - .062, H * .92], [zr - .066, H * .7]], .008, M.body, W * .5);
      c.box(b, .002, H * .26, .06, dk, W * .46, H * .64, zf + L * .48);
      if (flatTop) rail(c, b, zr, zf - .005, 0, H * .96, 'top', dk);
      // 총열 덮개: 옛 M16은 둥근 홈 덮개, 요즘 것은 레일 덮개
      const old = /^(m16a1|m16a2|c7|sp1|car15|commando|t65|t86|ar18|k2|k1a)$/.test(id), slim = /^(mcx|xm7|mp15|ar556|sig516|saint|lwrcm6|m27|m110|g28|sig716|ar10|sr25|hk417|l129a1|mk11|m39emr|xk8|stc16|arad|mk16)$/.test(id);
      const hl = Math.min(B * .62, .34), hz = zf - hl / 2;
      if (old) {
        c.cyl(b, .025, hl, M.furn, 0, by, hz, 14, .028);
        for (let i = 0; i < 10; i++) { const a = i / 10 * PI * 2; c.box(b, .004, .004, hl * .9, dk, Math.cos(a) * .026, by + Math.sin(a) * .026, hz); }
        c.cyl(b, .03, .012, M.body, 0, by, zf - .004, 14);
      } else if (slim) {
        c.ext(b, [[zf, by + .028], [zf - hl, by + .026], [zf - hl, by - .026], [zf, by - .03]], .052, M.body);
        for (let i = 0; i < 5; i++) c.box(b, .054, .009, .022, dk, 0, by - .004, zf - .04 - i * hl * .18);
        rail(c, b, zf, zf - hl, 0, by + .028, 'top', dk);
      } else {
        c.box(b, .05, .052, hl, M.body, 0, by, hz);
        rail(c, b, zf, zf - hl, 0, by + .026, 'top', dk); rail(c, b, zf, zf - hl, 0, by - .026, 'bot', dk);
        rail(c, b, zf, zf - hl, .025, by, 'r', dk); rail(c, b, zf, zf - hl, -.025, by, 'l', dk);
      }
      // A자 가늠쇠 + 가스 블록 (레일 덮개가 긴 요즘 총은 접이식 가늠쇠)
      const zs = zf - Math.min(B * .72, hl + .04);
      if (!slim || old) {
        c.ext(b, [[zs + .014, by - .013], [zs + .005, by + .055], [zs - .005, by + .055], [zs - .016, by - .013], [zs - .012, by - .03], [zs + .01, by - .03]], .014, M.body);
        c.box(b, .004, .02, .004, dk, 0, by + .065, zs);
      }
      pgrip(c, b, .006, -.004, slim ? 'mod' : 'a2', M.furn);
      // 개머리판: 버퍼관 + 접이/고정
      const fixed = stockOf() === 'fixed' && /^(m16a1|m16a2|m16a4|c7|sp1|ar10|sr25|m110|mk12|t65|t91|ss1)$/.test(id);
      c.cyl(b, .015, .2, M.body, 0, H * .66, zr + .1, 14);
      if (fixed) c.ext(b, [[zr, H * .95], [zr + .25, H * .98], [zr + .26, H * .98], [zr + .26, -.07], [zr + .24, -.07], [zr + .04, -.006], [zr, H * .1]], W * .88, M.furn);
      else if (stockOf() !== 'none') c.ext(b, [[zr + .12, H * 1.02], [zr + .23, H * 1.05], [zr + .245, H * 1.05], [zr + .245, -.062], [zr + .225, -.062], [zr + .19, H * .1], [zr + .12, H * .28]], W * .9, M.furn);
      return;
    }
    if (RA === 'ak') {
      // 찍어 만든 몸통 + 둥근 덮개 + 앞쪽 가늠자 받침
      c.ext(b, [[zr, H * .1], [zr, H * .72], [zr - .01, H * .8], [zf + .07, H * .8], [zf + .07, H * .86], [zf + .015, H * .9], [zf, H * .84], [zf, -.004], [zf + .06, -.004], [zf + .062, -.012], [zf + .11, -.012], [zf + .112, -.004], [zr - .03, -.004], [zr - .045, H * .1]], W * .92, M.body);
      c.ext(b, [[zr - .002, H * .72], ...arc(zr - .02, H * .72, .018, 0, PI / 2, 3), [zf + .075, H * .9], [zf + .075, H * .72]], W * .8, M.body);
      c.box(b, .006, .004, .03, met, W * .46, H * .5, zr - .04);
      c.box(b, .003, .014, .05, met, W * .48, H * .4, zr - .06, -.2);
      // 위 · 아래 총열 덮개와 가스관
      const fe = Math.min(.19, B * .55), wood = M.furn;
      c.ext(b, [[zf, by - .006], [zf - .01, by + .006], [zf - fe, by + .006], [zf - fe - .004, by - .012], [zf - fe + .01, by - .036], [zf - .02, by - .04], [zf, by - .034]], W * .96, wood);
      for (let i = 0; i < 3; i++) c.box(b, W * .99, .003, fe * .7, dk, 0, by - .016 - i * .007, zf - fe * .5);
      c.cyl(b, .0075, B * .42, met, 0, by + .02, zf - B * .25);
      c.ext(b, [[zf - .005, by + .012], [zf - .012, by + .032], [zf - fe * .75, by + .032], [zf - fe * .8, by + .012]], .03, wood);
      const zg = zf - B * .46, zs = zf - B + .03;
      c.ext(b, [[zg + .012, by - .012], [zg + .012, by + .03], [zg - .02, by + .03], [zg - .02, by - .012]], .02, met);
      c.ext(b, [[zs + .016, by - .01], [zs + .008, by + .045], [zs - .004, by + .045], [zs - .01, by - .01]], .014, met);
      // AKM은 비스듬한 총구 덮개, AK-74 계열은 큰 총구 제퇴기
      if (/74|105|12|15|19|545|a545|9$/.test(id) || /^(ak74|ak74m|aks74u|ak12|ak15|ak105|an94)$/.test(id)) c.cyl(b, .012, .05, met, 0, by, zf - B - .02, 12);
      else c.ext(b, [[zf - B + .002, by - .01], [zf - B + .002, by + .01], [zf - B - .022, by + .01], [zf - B - .018, by - .01]], .02, met);
      pgrip(c, b, .008, -.004, 'ak', M.furn);
      tguard(c, b, .004, -.004, met, false);
      const st = stockOf(), modern = /^(ak12|ak15|ak19|ak203|a545|ak308|ak9|vityaz|beryl|grot|rk95|arm1|galilace|tantal|m21|m85)$/.test(id);
      if (st === 'wood' || st === 'fixed' || /^(ak47|akm|type56|ak74|ak101|ak103|rk62|m70|amd65|pm63r|ak63|r4|galil|svd)$/.test(id) && st !== 'fold') {
        c.ext(b, [[zr, H * .78], [zr + .25, H * .38], [zr + .26, H * .38], [zr + .26, -.085], [zr + .245, -.086], [zr + .07, -.032], [zr, -.002]], W * .86, M.furn);
        c.box(b, W * .88, .12, .006, met, 0, H * .38 - .061, zr + .262);
      } else if (modern) {
        c.cyl(b, .014, .2, dk, 0, H * .6, zr + .1, 12);
        c.ext(b, [[zr + .08, H * 1.05], [zr + .21, H * 1.08], [zr + .23, H * 1.08], [zr + .23, -.065], [zr + .205, -.065], [zr + .17, H * .1], [zr + .08, H * .25]], W * .9, M.furn);
      } else {
        // 옆으로 접는 세모 개머리판
        c.ext(b, [[zr, H * .75], [zr + .24, H * .6], [zr + .245, H * .6], [zr + .245, -.07], [zr + .22, -.07], [zr, H * .05]], .012, M.furn, 0, [[[zr + .02, H * .55], [zr + .215, H * .48], [zr + .215, -.052], [zr + .03, H * .12]]]);
      }
      return;
    }
    if (RA === 'svd') {
      c.ext(b, [[zr, H * .1], [zr, H * .75], [zf + .02, H * .82], [zf, H * .8], [zf, -.004], [zr, -.004]], W * .92, M.body);
      const fe = Math.min(.22, B * .45);
      c.ext(b, [[zf, by - .03], [zf, by + .03], [zf - fe, by + .027], [zf - fe, by - .027]], .05, M.furn);
      for (let i = 0; i < 4; i++) c.box(b, .052, .008, .02, dk, 0, by, zf - .04 - i * fe * .22);
      c.ext(b, [[zf - B * .5 + .01, by - .012], [zf - B * .5 + .01, by + .028], [zf - B * .5 - .016, by + .028], [zf - B * .5 - .016, by - .012]], .02, met);
      c.cyl(b, .012, .07, met, 0, by, zf - B - .03, 12);
      // 엄지 구멍이 뚫린 뼈대 개머리판
      c.ext(b, [[zr, H * .85], [zr + .3, H * .7], [zr + .31, H * .7], [zr + .31, -.09], [zr + .29, -.09], [zr + .09, -.03], [zr + .03, -.1], [zr, -.098], [zr - .01, -.005]], W * .8, M.furn, 0,
        [[[zr + .04, H * .6], [zr + .28, H * .5], [zr + .28, H * .05], [zr + .1, H * .05], [zr + .04, -.02]], [[zr + .01, -.02], [zr + .055, -.03], [zr + .04, -.08], [zr + .012, -.08]]]);
      tguard(c, b, .004, -.004, met, false);
      return;
    }
    if (RA === 'hk') {
      const smg = g.cat === 'smg';
      // 길쭉하게 눌러 만든 몸통 + 총열 위 장전 손잡이 관 + 둥근 가늠쇠 덮개
      c.ext(b, [[zr, H * .15], [zr, H * .88], [zr - .015, H * .98], [zf, H * .98], [zf, H * .05], [zf + L * .2, -.004], [zr - .02, -.004]], W * .9, M.body);
      c.box(b, W * .94, .004, L * .7, dk, 0, H * .55, (zr + zf) / 2);
      const tz = zf - Math.min(B * .8, smg ? .11 : .3), tl = zf - tz;
      c.cyl(b, .0105, tl + .01, M.body, 0, by + .026, zf - tl / 2, 12);
      const fr = new THREE.Mesh(new THREE.TorusGeometry(.013, .003, 6, 16), M.body); fr.position.set(0, by + .046, tz + .006); b.add(fr);
      c.box(b, .003, .016, .004, dk, 0, by + .044, tz + .006);
      c.cyl(b, .016, .012, M.body, 0, by + .022, tz + .006, 14);
      const drum = new THREE.Mesh(cylG(.013, .013, .016, 12), M.body); drum.rotation.z = PI / 2; drum.position.set(0, H + .012, zr - .02); b.add(drum);
      // 총열 덮개: MP5는 가는 것, G3는 넓은 것
      const fl = smg ? .11 : Math.min(.2, B * .55);
      if (g.id !== 'mp5sd') c.ext(b, [[zf, by + .018], [zf - fl, by + .016], [zf - fl - .006, by - .01], [zf - fl, by - .03], [zf - .02, by - .036], [zf, by - .03]], smg ? .046 : .056, M.furn);
      for (let i = 0; i < 4 && g.id !== 'mp5sd'; i++) c.box(b, smg ? .048 : .058, .006, .006, dk, 0, by - .01, zf - .02 - i * fl * .24);
      // 방아쇠 뭉치 (비스듬한 손잡이와 한 덩어리)
      c.ext(b, [[.03, -.004], [-.065, -.004], [-.065, -.03], [-.012, -.03], [-.012, -.004]], .03, M.furn, 0, [[[-.058, -.008], [-.058, -.024], [-.016, -.024], [-.016, -.008]]]);
      pgrip(c, b, .004, -.004, 'hk', M.furn);
      if (g.id === 'mp5k') { c.box(b, .024, .07, .028, M.furn, 0, by - .07, zf - .03); return; }
      const st = stockOf();
      if (/^(mp5|mp5sd|mp510|hk53)$/.test(g.id) || st === 'fold' && !smg) {
        c.cyl(b, .005, .22, dk, .014, H * .6, zr + .11); c.cyl(b, .005, .22, dk, -.014, H * .6, zr + .11);
        c.ext(b, [[zr + .2, H * .9], [zr + .222, H * .9], [zr + .222, -.06], [zr + .2, -.06]], W * .9, M.furn);
      } else c.ext(b, [[zr, H * .9], [zr + .07, H * .95], [zr + .26, H * .92], [zr + .27, H * .92], [zr + .27, -.07], [zr + .25, -.07], [zr + .06, -.012], [zr, H * .05]], W * .92, M.furn);
      return;
    }
    if (RA === 'fal') {
      c.ext(b, [[zr, H * .1], [zr, H * .95], [zf + .04, H * 1.02], [zf, H * .9], [zf, -.004], [zf + L * .35, -.016], [zf + L * .55, -.016], [zr - .02, -.004]], W * .94, M.body);
      c.ext(b, [[zr - .12, H * .95], [zr - .1, H * 1.5], [zf + .08, H * 1.5], [zf + .06, H * .95]], .008, M.dark, 0, [[[zr - .115, H * 1.05], [zr - .11, H * 1.38], [zf + .085, H * 1.38], [zf + .075, H * 1.05]]]);
      const fe = Math.min(.24, B * .55);
      c.ext(b, [[zf, by - .034], [zf, by + .022], [zf - fe, by + .02], [zf - fe - .006, by - .02], [zf - fe + .01, by - .036]], W * .98, M.furn);
      for (let i = 0; i < 6; i++) c.box(b, W, .012, .004, dk, 0, by + .004, zf - .03 - i * fe * .14);
      c.ext(b, [[zf - fe - .01, by - .012], [zf - fe - .01, by + .03], [zf - fe - .04, by + .03], [zf - fe - .04, by - .012]], .022, M.metal);
      c.cyl(b, .013, .06, M.metal, 0, by, zf - B - .02, 10);
      pgrip(c, b, .006, -.004, 'mod', M.furn); tguard(c, b, .002, -.004, M.metal, true);
      c.ext(b, [[zr, H * .9], [zr + .26, H * .8], [zr + .27, H * .8], [zr + .27, -.085], [zr + .25, -.086], [zr + .06, -.02], [zr, H * .05]], W * .88, M.furn);
      return;
    }
    if (RA === 'mod') {
      // 요즘 총: 위는 레일이 끝까지 이어진 통짜, 아래는 플라스틱
      const hl = Math.min(B * .6, .3), shot = g.cat === 'shotgun';
      c.ext(b, [[zr, H * .48], [zr, H * .98], [zf - hl, H * .98], [zf - hl, by - .028], [zf, by - .032], [zf, H * .48]], W * .98, M.body);
      for (let i = 0; i < 4; i++) c.box(b, W * 1.02, .01, .024, M.dark, 0, by - .006, zf - .03 - i * hl * .24);
      rail(c, b, zr, zf - hl, 0, H * .98, 'top', M.dark);
      rail(c, b, zf - .02, zf - hl + .01, W * .5, by - .008, 'r', M.dark); rail(c, b, zf - .02, zf - hl + .01, -W * .5, by - .008, 'l', M.dark);
      const zm = zf + L * .3;
      c.ext(b, [[zr - .01, H * .5], [zr - .01, H * .1], [zr - .04, -.006], [zm + .032, -.006], [zm + .034, -.02], [zm - .034, -.02], [zm - .037, -.002], [zf + .02, H * .15], [zf + .02, H * .5]], W * .94, M.furn);
      tguard(c, b, .002, -.004, M.furn, true);
      pgrip(c, b, .006, -.004, 'mod', M.furn);
      if (g.x.zoom && g.x.zoom < 3) c.ext(b, [[zr - .03, H * .98], [zr - .04, H * 1.6], [zf + .05, H * 1.6], [zf + .03, H * .98]], .018, M.body, 0, [[[zr - .05, H * 1.05], [zr - .055, H * 1.45], [zf + .07, H * 1.45], [zf + .06, H * 1.05]]]);
      // 옆으로 접는 개머리판 (뺨 받침 + 구멍)
      if (S.st !== 'none') c.ext(b, [[zr, H * .95], [zr + .23, H * 1.02], [zr + .25, H * 1.02], [zr + .25, -.066], [zr + .225, -.066], [zr + .14, H * .05], [zr, H * .1]], W * .82, M.furn, 0, [[[zr + .03, H * .75], [zr + .19, H * .78], [zr + .2, H * .3], [zr + .13, H * .3], [zr + .03, H * .35]]]);
      void shot;
      return;
    }
    if (RA === 'pup') {
      // 불펍: 개머리판 안에 기관부가 있고 탄창은 손잡이 뒤
      const back = zr + .02, famas = /famas/.test(id), aug = /aug|f90/.test(id), tav = /tavor|x95|tar21|sar21/.test(id);
      const top = aug ? H * .9 : H * 1.02;
      c.ext(b, [[back, top], [back, -.07], [back - .02, -.08], [zr - .045, -.06], [zr - .045, -.002], [zr - .1, -.002], [-.012, -.008], [-.02, -.004], [zf + .1, -.004], [zf + .02, by - .035], [zf - .01, by - .03], [zf - .01, by + .02], [zf + .05, top], [back - .03, top + .004]], W * 1.08, M.furn);
      c.box(b, W * 1.1, .003, L * .6, M.dark, 0, H * .3, (zr + zf) / 2 + .03);
      if (famas) c.ext(b, [[zr - .03, H * 1.02], [zr - .03, H * 1.6], [zf + .03, H * 1.65], [zf + .02, H * 1.02]], .014, M.furn, 0, [[[zr - .06, H * 1.12], [zr - .06, H * 1.48], [zf + .06, H * 1.5], [zf + .06, H * 1.12]]]);
      if (aug || tav) c.ext(b, [[-.02, -.008], [-.02, -.035], [zf + .1, -.04], [zf + .07, -.11], [zf + .05, -.11], [zf + .05, -.004]], .026, M.furn, 0, [[[-.03, -.012], [-.03, -.03], [zf + .1, -.034], [zf + .085, -.012]]]);
      if (!aug && !famas) rail(c, b, zr - .02, zf + .02, 0, top, 'top', M.dark);
      pgrip(c, b, .006, -.004, 'mod', M.furn);
      return;
    }
    if (RA === 'box') {
      c.ext(b, [[zr, H * .1], [zr, H * .85], ...arc(zr - .015, H * .85, .015, 0, PI / 2, 3), [zf + .02, H], ...arc(zf + .02, H * .5, H * .5, PI / 2, PI, 3), [zf + .02, 0], [zr, 0]], W, M.body);
      for (let i = 0; i < 6; i++) c.box(b, W * 1.02, .003, .005, M.dark, 0, H * .9, zr - .03 - i * .012);
      c.box(b, W * 1.03, .006, L * .5, M.dark, 0, H * .3, (zr + zf) / 2);
      tguard(c, b, .004, -.002, M.body, true);
      return;
    }
    if (RA === 'tube') {
      const r = H * .42;
      c.cyl(b, r, L, M.body, 0, H * .55, (zr + zf) / 2, 16);
      const sh = id === 'sterling' || id === 'stenmk2s' || id === 'lanchester';
      if (sh) for (let i = 0; i < 10; i++) for (let s = -1; s <= 1; s += 2) c.box(b, .003, .006, .006, M.dark, s * r * .98, H * .55, zf + .02 + i * L * .08);
      c.box(b, W * .7, H * .5, L * .55, M.body, 0, 0, zf + L * .4);
      if (id === 'mp40') c.ext(b, [[zf + .02, H * .3], [zf + .02, -.03], [zf - .015, -.03], [zf - .015, H * .3]], .03, M.dark);
      tguard(c, b, .004, -.002, M.body, true);
      pgrip(c, b, .006, -.004, 'ak', M.furn);
      return;
    }
    if (RA === 'belt') {
      c.ext(b, [[zr, H * .1], [zr, H * 1.05], [zf + .02, H * 1.08], [zf, H * .95], [zf, H * .05], [zf + .05, -.01], [zr - .02, -.01]], W * 1.05, M.body);
      for (let i = 0; i < 4; i++) c.box(b, W * 1.08, .004, .03, M.dark, 0, H * .4, zr - .05 - i * .06);
      const mg42 = /^(mg42|mg3|mg34|mg5|mg4)$/.test(id);
      if (mg42) {
        const sl = B * .7; c.cyl(b, .022, sl, M.body, 0, by, zf - sl / 2, 12);
        for (let i = 0; i < 7; i++) for (const s of [-1, 1]) c.box(b, .004, .012, .02, M.dark, s * .021, by, zf - .03 - i * sl * .13);
      } else if (!/m1919|maxim|vickers|sg43/.test(id)) {
        c.ext(b, [[zf - .04, by + .02], [zf - .055, by + .07], [zf - .16, by + .07], [zf - .175, by + .02]], .012, M.dark, 0, [[[zf - .065, by + .03], [zf - .072, by + .06], [zf - .145, by + .06], [zf - .152, by + .03]]]);
        c.ext(b, [[zf, by - .03], [zf, by + .02], [zf - Math.min(.2, B * .45), by + .02], [zf - Math.min(.2, B * .45), by - .03]], W, M.furn);
      }
      pgrip(c, b, .004, -.008, 'mod', M.furn); tguard(c, b, .002, -.008, M.body, true);
      if (/pkm|pecheneg|rp46|sg43/.test(id)) c.ext(b, [[zr, H * .9], [zr + .27, H * .55], [zr + .28, H * .55], [zr + .28, -.08], [zr + .26, -.08], [zr + .05, -.02], [zr, H * .1]], W * .8, M.furn, 0, [[[zr + .03, H * .7], [zr + .25, H * .42], [zr + .25, -.04], [zr + .08, -.01], [zr + .03, H * .15]]]);
      else if (!/m1919|maxim|vickers|m2hb|kord/.test(id)) c.ext(b, [[zr, H * .95], [zr + .27, H * .85], [zr + .28, H * .85], [zr + .28, -.08], [zr + .26, -.08], [zr + .05, -.02], [zr, H * .05]], W * .9, M.furn);
      return;
    }
    // ---------- 나무 총 (옛 볼트 소총 · 반자동 소총 · 레버 · 옛 기관단총 · 옛 기관총) ----------
    if (RA === 'wood' || RA === 'sport') {
      const semi = g.cat === 'br' || g.cat === 'ar', smg = g.cat === 'smg', lever = g.mode === 'lever', lmg = g.cat === 'lmg';
      const fe = smg ? Math.min(.12, B * .6) : lever ? B * .4 : semi ? B * .62 : RA === 'sport' ? B * .5 : B * .78;
      const pg = RA === 'sport' || /^(stg44|stg45|mkb42|fedorov|m1928|thompson|m1a1t|ud42|sub2000|cx4|bar)$/.test(id);
      const ztip = zf - fe;
      // 개머리판 + 손목 + 앞나무가 한 덩어리
      const pts = [
        [zr + .33, H * .55], [zr + .34, H * .5], [zr + .34, -.088], [zr + .32, -.092],
        pg ? [zr + .09, -.035] : [zr + .12, -.035], pg ? [zr + .05, -.09] : [zr + .05, -.03], pg ? [zr + .02, -.092] : [zr + .02, -.028],
        [zr - .01, -.026], [zf + .04, -.026], [ztip + .03, by - .03], [ztip, by - .022], [ztip - .004, by - .006], [ztip + .004, by + .004],
        [zf, by + .004], [zf, H * .3], [zr + .01, H * .3], [zr + .04, H * .62], [zr + .12, H * .7],
      ];
      c.ext(b, pts, W * .94, M.furn);
      if (RA === 'sport') c.box(b, W * .96, .03, .14, M.furn, 0, H * .62, zr + .2);
      // 총열 위 나무 덮개 · 총열 띠 · 앞 마개
      if (!smg && !lever && RA !== 'sport') {
        c.ext(b, [[zf - .02, by + .003], [zf - .02, by + .018], [ztip + .04, by + .016], [ztip + .04, by + .003]], .024, M.furn);
        [zf - fe * .35, ztip + .02].forEach(z => c.cyl(b, .02, .012, M.metal, 0, by - .006, z, 12));
        c.cyl(b, .014, .02, M.metal, 0, by - .004, ztip - .006, 10);
      }
      if (semi && !/m1carbine|m2carbine/.test(id)) c.cyl(b, .008, B * .55, M.metal, 0, by - .016, zf - B * .3);
      if (smg && id === 'ppsh') { c.cyl(b, .02, B + .02, M.body, 0, by, zf - B / 2, 12); for (let i = 0; i < 6; i++) for (const s of [-1, 1]) c.box(b, .003, .007, .012, M.dark, s * .0195, by, zf - .015 - i * B * .15); }
      // 몸통: 볼트 소총은 둥근 쇠통
      if (g.mode === 'bolt') c.cyl(b, H * .36, L * .9, M.body, 0, H * .58, (zr + zf) / 2, 14);
      else c.box(b, W * .8, H * .6, L, M.body, 0, H * .6, (zr + zf) / 2);
      tguard(c, b, .004, -.026, M.metal, false);
      if (lmg && /dp28|lewis/.test(id)) c.cyl(b, .03, B * .8, M.body, 0, by, zf - B * .4, 14);
      return;
    }
    if (RA === 'tac' || RA === 'amr') {
      const amr = RA === 'amr', s = amr ? 1.3 : 1;
      // 쇠로 깎은 몸통 + 긴 레일
      c.ext(b, [[zr, H * .1], [zr, H * 1.02], [zf, H * 1.02], [zf, H * .1]], W * 1.05 * s, M.body, 0, amr ? [[[zf + .04, H * .3], [zf + .04, H * .75], [zf + .12, H * .75], [zf + .12, H * .3]]] : null);
      rail(c, b, zr, zf - (amr ? .1 : .05), 0, H * 1.02, 'top', M.dark);
      const fe = Math.min(B * (amr ? .45 : .55), .3);
      c.ext(b, [[zf, by - .03 * s], [zf, by + .025 * s], [zf - fe, by + .025 * s], [zf - fe, by - .03 * s]], .05 * s, M.body);
      for (let i = 0; i < 5; i++) c.box(b, .052 * s, .008, .03, M.dark, 0, by - .004, zf - .03 - i * fe * .19);
      if (amr) { c.ext(b, [[zf - B, by - .03], [zf - B, by + .03], [zf - B - .09, by + .03], [zf - B - .09, by - .03]], .05, M.dark, 0, [[[zf - B - .01, by - .02], [zf - B - .01, by + .02], [zf - B - .035, by + .02], [zf - B - .035, by - .02]], [[zf - B - .05, by - .02], [zf - B - .05, by + .02], [zf - B - .078, by + .02], [zf - B - .078, by - .02]]]); }
      else c.cyl(b, .015, .05, M.dark, 0, by, zf - B - .02, 10);
      pgrip(c, b, .008, -.004, 'mod', M.furn); tguard(c, b, .004, -.004, M.body, true);
      // 엄지 구멍 개머리판 + 뺨 받침
      c.ext(b, [[zr, H * 1.02], [zr + .3, H * 1.0], [zr + .31, H * 1.0], [zr + .31, -.09], [zr + .29, -.092], [zr + .12, -.04], [zr + .08, -.1], [zr + .05, -.102], [zr, H * .1]], W * .95, M.furn, 0,
        [[[zr + .1, H * .85], [zr + .27, H * .84], [zr + .27, -.03], [zr + .14, -.025]], [[zr + .045, H * .5], [zr + .085, H * .5], [zr + .07, -.06], [zr + .05, -.06]]]);
      c.box(b, W * .7, .018, .12, M.dark, 0, H * 1.12, zr + .17);
      if (amr) c.cyl(b, .02, .06, M.dark, 0, -.02, zr + .25, 10);
      return;
    }
    if (RA === 'shot') {
      // 펌프 · 반자동 산탄총: 둥그스름한 몸통 + 나무 개머리판
      c.ext(b, [[zr, H * .25], [zr, H * .82], ...arc(zr - .025, H * .82, .025, 0, PI / 2, 3), [zf, H * 1.03], [zf, H * .12], [zf + .04, -.004], [zr - .02, -.004]], W, M.body);
      c.box(b, .002, H * .35, .07, M.dark, W / 2 + .0005, H * .55, zf + L * .42);
      const pist = /^(m590a1|m590m|benellim4|b1301|m3super90|spas12|m930)$/.test(g.id);
      tguard(c, b, .004, -.004, M.metal, false);
      if (pist) {
        pgrip(c, b, .008, -.004, 'mod', M.furn);
        c.ext(b, [[zr, H * .85], [zr + .26, H * .92], [zr + .27, H * .92], [zr + .27, -.07], [zr + .25, -.07], [zr + .1, H * .05], [zr, H * .2]], W * .88, M.furn, 0, [[[zr + .04, H * .7], [zr + .2, H * .72], [zr + .21, H * .25], [zr + .1, H * .25]]]);
      } else c.ext(b, [[zr, H * .82], [zr + .3, H * .52], [zr + .31, H * .52], [zr + .31, -.095], [zr + .29, -.098], [zr + .1, -.04], [zr + .04, -.032], [zr, -.002]], W * .9, M.furn);
      if (g.mode !== 'pump') c.ext(b, [[zf, by - .034], [zf, by + .002], [zf - .2, by - .004], [zf - .205, by - .03], [zf - .19, by - .042]], W * .95, M.furn);
      const bead = new THREE.Mesh(new THREE.SphereGeometry(.0028, 8, 6), BASE.brass()); bead.position.set(0, by + .016, zf - B + .006); b.add(bead);
      return;
    }
  }
  // 펌프 손잡이: 홈이 파인 둥근 앞나무
  function realPump(c, pp, W, m) {
    c.ext(pp, [[.07, .02], [-.07, .02], [-.078, .006], [-.078, -.022], [-.07, -.03], [.07, -.03], [.078, -.02], [.078, .01]], W * .98, m);
    for (let i = 0; i < 7; i++) c.box(pp, W * 1.01, .032, .004, BASE.dark(), 0, -.005, -.054 + i * .018);
  }
  // 권총: 슬라이드 · 몸통 · 손잡이 윤곽
  function pistolStyle(g) {
    if (/^(glock|p320|p99|vp9|mp9mm|p365|canik|hs2000|fiveseven|grach|qsz92|k5|sr1|p7)/.test(g.id)) return 'poly';
    return 'steel';
  }
  function realPistol(c, X) {
    const { L, zR, zF, yS, sh, big, slide } = X, M = c.M, b = c.body, poly = pistolStyle(c.g) === 'poly', w = .03 * big;
    // 슬라이드: 앞이 비스듬하게 깎이고, 오른쪽에 탄피 나가는 구멍
    c.ext(slide, [[zR, yS - sh / 2], [zR, yS + sh / 2 - .003], [zR - .004, yS + sh / 2], [zF + .012, yS + sh / 2], [zF, yS + sh / 2 - .008], [zF, yS - sh / 2]], w, M.body);
    c.box(slide, .002, sh * .5, .03, M.dark, w / 2 + .0005, yS + sh * .12, zR - .05);
    // 몸통 (총열 아래 레일 포함) + 방아쇠울
    const fy = yS - sh / 2;
    c.ext(b, [[zR + .006, fy], [zF + .005, fy], [zF + .005, fy - .018], [zF + .03, fy - .02], [zR - .03, fy - .02], [zR - .03, fy - .012], [zR + .006, fy - .012]], w * .94, M.frame);
    if (poly) for (let i = 0; i < 3; i++) c.box(b, w * .96, .004, .003, M.dark, 0, fy - .016, zF + .012 + i * .01);
    const tz = -.002, ty = fy - .018;
    c.ext(b, [[tz - .056, ty + .002], [tz - .056, ty - (poly ? .024 : .02)], [tz - (poly ? .053 : .046), ty - .026], [tz + .004, ty - .026], [tz + .004, ty + .002]], .008, M.frame, 0, [[[tz - .05, ty - .001], [tz - .05, ty - .018], [tz - .044, ty - .021], [tz - .003, ty - .021], [tz - .003, ty - .001]]]);
    // 손잡이: 폴리머 권총은 손가락 홈, 쇠 권총은 곧고 뒤에 비버테일
    const gp = poly ? [[.006, fy - .002], [.008, fy - .03], [.006, fy - .046], [.016, fy - .058], [.013, fy - .072], [.024, fy - .086], [.032, fy - .122], [.084, fy - .122], [.064, fy - .02], [.074, fy - .008], [.076, fy - .002]]
      : [[.006, fy - .002], [.032, fy - .122], [.084, fy - .122], [.062, fy - .014], [.074, fy - .008], [.076, fy - .002]];
    c.ext(b, gp, w * .95, M.furn);
    if (!poly) c.ext(b, mv([[.014, fy - .02], [.034, fy - .112], [.074, fy - .112], [.056, fy - .02]], 0, 0), w * 1.12, c.g.m.c === 'st' ? BASE.wood() : M.dark);
    else for (let y = fy - .032; y > fy - .115; y -= .008) c.box(b, w * .97, .003, .03, M.dark, 0, y, .04 + (fy - y) * .2);
  }
  function addLaser(c, parent, x, y, z, s) {
    c.box(parent, s, s, .035, BASE.dark(), x, y, z);
    c.box(parent, .003, .003, .002, RED(), x, y, z - .018);
    const beam = new THREE.Mesh(cylG(.0008, .0008, 4, 4), basic('beam', { color: 0xff2020, transparent: true, opacity: .35, blending: THREE.AdditiveBlending, depthWrite: false }));
    beam.position.set(x, y, z - 2.02); parent.add(beam);
  }

  // =================================================================
  //  조립 시작
  // =================================================================
  function build(g, mods, withHands) {
    mods = mods || defaultMods(g);
    const c = new Ctx(g, mods), k = g.m.k;
    if (g.cat === 'pistol') buildPistol(c);
    else if (g.cat === 'revolver') buildRevolver(c);
    else if (k === 'p90') buildP90(c);
    else if (k === 'vector') buildVector(c);
    else if (k === 'g11') buildG11(c);
    else if (k === 'minigun') buildMinigun(c);
    else if (k === 'rpg') buildRPG(c);
    else if (k === 'm79') buildM79(c);
    else if (k === 'mgl') buildMGL(c);
    else if (k === 'lever') buildLever(c);
    else buildLong(c);
    const v = c.v;
    v.root = c.root; v.body = c.body; v.mods = mods; v.charge = v.charge || 'none';
    v.homeL = v.homeL || new V3(); v.homeR = v.homeR || new V3();
    v.magHold = v.magHold || new V3(0, -.05, 0); v.magDir = v.magDir || new V3(0, -1, 0);
    v.portPos = v.portPos || v.magHold.clone();
    v.chargePos = v.chargePos || v.homeL.clone();
    v.knobPos = v.knobPos || v.chargePos.clone();
    v.releasePos = v.releasePos || v.chargePos.clone();
    v.coverPos = v.coverPos || v.chargePos.clone();
    v.clipPos = v.clipPos || v.portPos.clone();
    v.cylPos = v.cylPos || v.magHold.clone(); v.cylOpenPos = v.cylOpenPos || v.cylPos.clone();
    v.cylRot = 0; v.spin = 0;
    // 허리 사격 자세: 화면 오른쪽 아래에 총이 잘 보이도록 조금 올린다
    v.hip.y += .045; v.hip.z -= .03; v.hip.x += .02;
    c.root.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } });
    if (withHands) {
      v.handR = makeHand([.35, -.55, 1], .5); v.handR.position.copy(v.homeR); v.handR.rotation.x = .3; c.root.add(v.handR);
      v.handL = makeHand(v.dirL || [-.45, -.55, 1], .7); v.handL.position.copy(v.homeL); v.handL.rotation.set(.2, 0, -.35); c.root.add(v.handL);
      // 손에 드는 소품
      const roundKind = g.cal === '12ga' ? 'shell' : g.cal === '40mm' ? 'grenade' : 'brass';
      const prop = (name, obj) => { obj.visible = false; obj.position.set(0, .03, -.04); v.handL.add(obj); v.props[name] = obj; };
      prop('round', roundMesh(roundKind));
      const pair = new THREE.Group(); [-.012, .012].forEach(x => { const r = roundMesh('shell'); r.position.x = x; pair.add(r); }); prop('pair', pair);
      const loader = new THREE.Group(); const lr = new THREE.Mesh(cylG(.02, .02, .012, 12), BASE.dark()); loader.add(lr);
      for (let i = 0; i < Math.min(g.mag, 7); i++) { const a = i / g.mag * PI * 2; const r = roundMesh(roundKind === 'grenade' ? 'grenade' : 'brass'); r.scale.setScalar(roundKind === 'grenade' ? .5 : 1); r.position.set(Math.cos(a) * .0145, Math.sin(a) * .0145, -.012); loader.add(r); }
      prop('loader', loader);
      const clip = new THREE.Group(); c.box(clip, .012, .004, .05, BASE.steel(), 0, .03, 0);
      const cr = new THREE.Group(); cr.name = 'rounds'; clip.add(cr);
      for (let i = 0; i < 5; i++) { const r = roundMesh('brass'); r.rotation.x = PI / 2; r.position.set(0, .012, -.02 + i * .01); cr.add(r); }
      clip.rotation.x = -PI / 2; prop('clip', clip);
    }
    return v;
  }

  // =================================================================
  //  동작 (장전 · 사격)
  // =================================================================
  const ss = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
  const seg = (k, a, b) => ss((k - a) / (b - a));
  const hold = (k, a, b, c, d) => seg(k, a, b) * (1 - seg(k, c, d));
  function path(k, keys) {
    if (k <= keys[0][0]) return keys[0][1].clone();
    for (let i = 1; i < keys.length; i++) if (k <= keys[i][0]) { const a = keys[i - 1], b = keys[i]; return a[1].clone().lerp(b[1], ss((k - a[0]) / (b[0] - a[0]))); }
    return keys[keys.length - 1][1].clone();
  }
  function newPose() { return { pos: new V3(), rot: new V3(), parts: {}, L: null, R: null, magVis: true, show: {}, ev: [], k0: 0, k: 0 }; }
  function P(A, n) { return A.parts[n] || (A.parts[n] = { p: new V3(), r: new V3(), vis: true }); }
  function E(A, at, name) { if (A.k0 < at && A.k >= at) A.ev.push(name); }
  const off = v => v.homeL.clone().add(new V3(-.06, -.32, .16));
  const add = (a, x, y, z) => a.clone().add(new V3(x, y, z));

  // 탄창을 갈아 끼우는 장전 (방향·기울기·장전손잡이 방식이 총마다 다르다)
  function magRL(o) {
    return (k, A, v, ctx) => {
      const tilt = hold(k, 0, .14, .84, 1);
      A.rot.x += o.tilt[0] * tilt; A.rot.y += o.tilt[1] * tilt; A.rot.z += o.tilt[2] * tilt; A.pos.y += (o.lift || 0) * tilt;
      const dir = v.magDir, dist = o.dist || .3, mp = P(A, 'mag');
      let out = 0;
      if (k < .34) { out = seg(k, o.grab ? .14 : .1, .3); if (o.rock) mp.r.x -= .3 * seg(k, .08, .16); }
      else if (k < .44) { out = 1; mp.vis = false; }
      else { out = (1 - seg(k, .44, .62)) * .55; if (o.rock) mp.r.x -= .3 * (1 - seg(k, .58, .66)); }
      mp.p.addScaledVector(dir, out * dist);
      if (o.spin) mp.r.y += o.spin * out;
      E(A, .12, 'magOut'); E(A, .3, 'dropMag'); E(A, .6, 'magIn');
      const H0 = v.homeL, OFF = off(v), at = d => v.magHold.clone().addScaledVector(dir, d);
      const keys = o.grab
        ? [[0, H0], [.12, at(0)], [.3, at(dist)], [.37, OFF], [.45, at(dist * .55)], [.62, at(0)], [.67, at(0)]]
        : [[0, H0], [.16, OFF], [.38, OFF], [.46, at(dist * .55)], [.62, at(0)], [.67, at(0)]];
      const ch = ctx.empty ? o.charge : 'none';
      if (ch === 'slide') {
        P(A, 'slide').p.z += k < .78 ? .03 + .006 * seg(k, .72, .76) : .036 * (1 - seg(k, .78, .8));
        keys.push([.72, add(v.slidePos, -.01, .0, .01)], [.77, add(v.slidePos, -.01, 0, .04)], [.88, H0]); E(A, .79, 'slide');
      } else if (ch === 'ar') {
        P(A, 'carrier').p.z += k < .77 ? .03 : 0;
        keys.push([.73, v.releasePos], [.77, add(v.releasePos, .012, 0, 0)], [.88, H0]); E(A, .77, 'bolt');
      } else if (ch === 'ak' || ch === 'top') {
        const bp = P(A, 'bolt'); bp.p.z += .07 * seg(k, .73, .78) * (1 - seg(k, .8, .82));
        keys.push([.72, v.chargePos], [.78, add(v.chargePos, 0, 0, .07)], [.8, add(v.chargePos, 0, 0, .07)], [.9, H0]); E(A, .8, 'charge');
      } else if (ch === 'hk') {
        const bp = P(A, 'bolt'); bp.p.z += k < .75 ? .05 : 0; bp.r.z += k < .75 ? .3 : 0;
        keys.push([.7, add(v.chargePos, 0, .02, .05)], [.75, v.chargePos], [.85, H0]); E(A, .75, 'charge');
      } else if (ch === 'boltAction') {
        const bp = P(A, 'bolt'); bp.r.z += 1.1 * hold(k, .7, .74, .84, .88); bp.p.z += .09 * hold(k, .74, .78, .8, .84);
        A.R = path(k, [[.66, v.homeR], [.7, v.knobPos], [.74, add(v.knobPos, 0, .03, 0)], [.78, add(v.knobPos, 0, .03, .09)], [.84, add(v.knobPos, 0, .03, 0)], [.88, v.knobPos], [.95, v.homeR]]);
        keys.push([.85, H0]); E(A, .73, 'boltUp'); E(A, .86, 'bolt');
      } else keys.push([.85, H0]);
      keys.push([1, H0]);
      A.L = path(k, keys);
    };
  }

  const RL = {
    pistol: magRL({ tilt: [.15, .1, .42], lift: .015, dist: .3, charge: 'slide' }),
    rifle: magRL({ tilt: [.12, .12, -.45], lift: .02, dist: .35, charge: 'ar' }),
    hk: magRL({ tilt: [.12, .1, -.4], lift: .02, dist: .33, charge: 'hk', grab: true }),
    ak: magRL({ tilt: [.15, 0, -.38], lift: .02, dist: .33, charge: 'ak', grab: true, rock: true }),
    grip: magRL({ tilt: [.25, .1, .35], lift: .015, dist: .3, charge: 'top' }),
    bullpup: magRL({ tilt: [.45, .1, .28], lift: .03, dist: .3, charge: 'ak', grab: true }),
    p90: magRL({ tilt: [.1, 0, .9], lift: .02, dist: .22, charge: 'ak', grab: true }),
    drum: magRL({ tilt: [.15, .1, .45], lift: .02, dist: .32, charge: 'top', grab: true }),
    side: magRL({ tilt: [.1, 0, -.6], lift: .02, dist: .3, charge: 'ak', grab: true }),
    helical: magRL({ tilt: [.2, 0, .4], lift: .02, dist: .25, charge: 'ak', grab: true }),
    top: magRL({ tilt: [-.05, 0, .35], lift: .02, dist: .3, charge: 'ak', grab: true }),
    pan: magRL({ tilt: [.05, 0, .25], lift: .02, dist: .25, charge: 'ak', grab: true, spin: 1.6 }),
    g11: magRL({ tilt: [.25, 0, .3], lift: .02, dist: .25, charge: 'none', grab: true }),
    boltMag: magRL({ tilt: [.12, .1, -.35], lift: .02, dist: .3, charge: 'boltAction', grab: true }),
    minigun: magRL({ tilt: [-.15, 0, .2], lift: -.04, dist: .3, charge: 'none', grab: true }),

    // 리볼버: 실린더를 열고, 총구를 들어 탄피를 빼고, 스피드로더로 넣고, 휙 닫는다
    revolver(k, A, v) {
      const t1 = hold(k, 0, .1, .85, 1);
      A.rot.z += .5 * t1; A.rot.y += .15 * t1; A.pos.x -= .02 * t1;
      P(A, 'crane').r.z += 1.3 * hold(k, .08, .16, .66, .7);
      E(A, .09, 'cylOpen'); E(A, .29, 'ejectAll'); E(A, .58, 'shell'); E(A, .68, 'cylClose');
      A.rot.x += .9 * hold(k, .18, .26, .34, .42) - .3 * hold(k, .42, .5, .64, .72);
      const rm = P(A, 'rims'); rm.p.z += .03 * seg(k, .24, .29);
      if (k > .3 && k < .58) rm.vis = false;
      A.show.loader = k > .38 && k < .58;
      A.L = path(k, [[0, v.homeL], [.12, v.cylOpenPos], [.28, add(v.cylOpenPos, 0, 0, -.02)], [.36, off(v)], [.42, off(v)], [.5, add(v.cylOpenPos, 0, -.01, .07)], [.58, add(v.cylOpenPos, 0, 0, .035)], [.64, v.cylOpenPos], [.7, v.cylPos], [.84, v.homeL]]);
    },
    mgl(k, A, v) { RL.revolver(k, A, v); },
    // 웨블리: 총이 반으로 꺾인다
    webley(k, A, v) {
      const t1 = hold(k, 0, .1, .85, 1);
      A.rot.z += .3 * t1; A.rot.x += .15 * t1;
      P(A, 'brk').r.x += .85 * hold(k, .08, .16, .64, .7);
      E(A, .1, 'cylOpen'); E(A, .26, 'ejectAll'); E(A, .58, 'shell'); E(A, .68, 'cylClose');
      const rm = P(A, 'rims'); if (k > .27 && k < .58) rm.vis = false;
      A.show.loader = k > .36 && k < .58;
      const cp = add(v.cylPos, 0, .05, .03);
      A.L = path(k, [[0, v.homeL], [.1, add(v.cylPos, 0, .03, -.06)], [.2, add(v.cylPos, 0, .03, -.06)], [.3, off(v)], [.4, off(v)], [.5, add(cp, 0, .03, .05)], [.58, cp], [.66, add(v.cylPos, 0, .04, -.05)], [.82, v.homeL]]);
    },
    // 클립 장전 (Kar98k, 모신나강, SKS, C96)
    boltClip(k, A, v) {
      const t1 = hold(k, 0, .12, .86, 1);
      A.rot.z += .3 * t1; A.rot.x += .1 * t1;
      const bp = P(A, 'bolt');
      if (v.boltRot) bp.r.z += 1.1 * hold(k, .06, .14, .74, .8);
      bp.p.z += .09 * hold(k, .14, .22, .66, .74);
      E(A, .1, 'boltUp'); E(A, .44, 'clip'); E(A, .56, 'shell'); E(A, .73, 'bolt');
      A.show.clip = k > .26 && k < .62;
      if (v.props.clip) { const r = v.props.clip.getObjectByName('rounds'); if (r) r.position.y = -.03 * seg(k, .45, .56); }
      const kp = v.knobPos, cp = v.clipPos;
      A.R = path(k, [[0, v.homeR], [.07, kp], [.14, add(kp, 0, .03, 0)], [.22, add(kp, 0, .03, .09)], [.66, add(kp, 0, .03, .09)], [.74, add(kp, 0, .03, 0)], [.8, kp], [.9, v.homeR]]);
      A.L = path(k, [[0, v.homeL], [.18, off(v)], [.3, add(cp, 0, .12, .03)], [.42, add(cp, 0, .03, 0)], [.56, add(cp, 0, -.01, 0)], [.6, add(cp, 0, .07, .02)], [.68, off(v)], [.86, v.homeL]]);
    },
    c96(k, A, v) { RL.boltClip(k, A, v); },
    // M1 개런드: 엔블록 클립을 눌러 넣으면 노리쇠가 쾅!
    garand(k, A, v, ctx) {
      const t1 = hold(k, 0, .12, .85, 1);
      A.rot.z += .25 * t1; A.rot.x += .12 * t1;
      if (!ctx.empty) E(A, .06, 'pingEject');
      P(A, 'bolt').p.z += k < .55 ? .07 : .07 * (1 - seg(k, .55, .57));
      A.show.clip = k > .24 && k < .53;
      if (v.props.clip) { const r = v.props.clip.getObjectByName('rounds'); if (r) r.position.y = 0; }
      E(A, .5, 'clip'); E(A, .56, 'bolt');
      const cp = v.clipPos;
      A.L = path(k, [[0, v.homeL], [.18, off(v)], [.3, add(cp, 0, .12, .02)], [.45, add(cp, 0, .02, 0)], [.52, add(cp, 0, -.02, 0)], [.56, add(cp, 0, .08, .03)], [.75, v.homeL]]);
    },
    martini(k, A, v) {
      const t1 = hold(k, 0, .12, .86, 1); A.rot.z += .25 * t1; A.rot.x += .1 * t1;
      P(A, 'lever').r.x += .9 * hold(k, .08, .2, .66, .76);
      E(A, .1, 'lever'); E(A, .22, 'ejectOne'); E(A, .58, 'shell'); E(A, .74, 'lever');
      A.show.round = k > .3 && k < .58;
      A.L = path(k, [[0, v.homeL], [.2, off(v)], [.34, off(v)], [.48, add(v.portPos, 0, .05, .06)], [.58, v.portPos], [.62, v.portPos], [.8, v.homeL]]);
    },
    // 꺾어서 장전 (쌍열 산탄총, M79)
    break(k, A, v) {
      const t1 = hold(k, 0, .12, .86, 1); A.rot.x += .15 * t1; A.rot.z += .25 * t1;
      P(A, 'brk').r.x += .75 * hold(k, .08, .14, .68, .73);
      A.rot.x += .45 * hold(k, .16, .22, .3, .36);
      E(A, .1, 'break'); E(A, .22, 'ejectAll'); E(A, .58, 'shell'); E(A, .72, 'break');
      A.rot.x += .3 * hold(k, .68, .71, .73, .8);
      if (v.g.mag > 1) A.show.pair = k > .36 && k < .6; else A.show.round = k > .36 && k < .6;
      A.L = path(k, [[0, v.homeL], [.18, off(v)], [.38, off(v)], [.5, add(v.portPos, 0, .06, .08)], [.6, add(v.portPos, 0, .02, .02)], [.66, add(v.portPos, 0, .02, .02)], [.84, v.homeL]]);
    },
    m79(k, A, v) { RL.break(k, A, v); },
    // 탄띠 기관총: 덮개를 열고 탄통을 바꾸고 탄띠를 깔고 덮개를 쾅
    belt(k, A, v) {
      const t1 = hold(k, 0, .1, .88, 1); A.rot.z -= .25 * t1; A.rot.x += .15 * t1; A.pos.y += .03 * t1;
      P(A, 'cover').r.x -= 1.2 * hold(k, .12, .2, .66, .72);
      const mp = P(A, 'mag'); let o = 0;
      if (k < .35) o = seg(k, .27, .35); else if (k < .48) { o = 1; mp.vis = false; } else o = (1 - seg(k, .48, .56)) * .6;
      mp.p.y -= .25 * o;
      const bl = P(A, 'belt'); if (k > .3 && k < .6) bl.vis = false;
      E(A, .14, 'cover'); E(A, .3, 'magOut'); E(A, .32, 'dropMag'); E(A, .56, 'magIn'); E(A, .62, 'belt'); E(A, .71, 'cover'); E(A, .8, 'charge');
      P(A, 'bolt').p.z += .07 * seg(k, .76, .8) * (1 - seg(k, .8, .82));
      const cv = v.coverPos;
      A.L = path(k, [[0, v.homeL], [.1, cv], [.2, add(cv, 0, .1, .05)], [.27, v.magHold], [.35, add(v.magHold, 0, -.2, 0)], [.42, off(v)], [.5, add(v.magHold, 0, -.15, 0)], [.56, v.magHold], [.6, add(cv, -.02, .02, 0)], [.64, add(cv, -.02, .02, -.03)], [.68, add(cv, 0, .1, .05)], [.71, cv], [.76, v.chargePos], [.8, add(v.chargePos, 0, 0, .07)], [.9, v.homeL]]);
    },
    // 로켓: 새 탄두를 앞에서 끼운다
    rocket(k, A, v) {
      const t1 = hold(k, 0, .15, .8, 1); A.pos.y -= .08 * t1; A.rot.x -= .25 * t1; A.rot.z += .25 * t1;
      const mp = P(A, 'mag');
      if (k < .38) mp.vis = false;
      else { const u = 1 - seg(k, .4, .66); mp.p.z -= .25 * u; mp.p.y -= .06 * u; }
      E(A, .66, 'rocket');
      A.L = path(k, [[0, v.homeL], [.2, off(v)], [.36, off(v)], [.42, add(v.magHold, 0, -.06, -.25)], [.66, v.magHold], [.72, v.magHold], [.9, v.homeL]]);
    },
  };

  // 한 발씩 넣는 장전: 시작 → (한 발 넣기 × n) → 끝
  const SHELL = {
    shell: {
      start(k, A, v) { const u = seg(k, 0, 1); A.rot.z += .75 * u; A.rot.x += .15 * u; A.pos.y += .02 * u; A.L = v.homeL.clone().lerp(add(v.portPos, -.02, -.1, .07), u); },
      load(k, A, v) {
        A.rot.z += .75; A.rot.x += .15; A.pos.y += .02;
        A.show.round = k < .7; E(A, .66, 'shell');
        A.L = path(k, [[0, add(v.portPos, -.02, -.1, .07)], [.45, add(v.portPos, 0, -.035, .025)], [.7, v.portPos], [1, add(v.portPos, -.02, -.1, .07)]]);
      },
      end(k, A, v, ctx) {
        const pump = ctx.empty && v.g.mode === 'pump', back = pump ? .45 : 1;
        const u = 1 - seg(k, 0, back); A.rot.z += .75 * u; A.rot.x += .15 * u; A.pos.y += .02 * u;
        A.L = add(v.portPos, -.02, -.1, .07).lerp(v.homeL, seg(k, 0, back));
        if (pump) { P(A, 'pump').p.z += .09 * hold(k, .5, .65, .75, .9); E(A, .52, 'pump'); A.L.add(new V3(0, 0, P(A, 'pump').p.z)); }
        else if (ctx.empty && v.g.mode !== 'pump') E(A, .5, 'bolt');
      },
    },
    lever: {
      start(k, A, v) { const u = seg(k, 0, 1); A.rot.z += .6 * u; A.rot.x += .1 * u; A.L = v.homeL.clone().lerp(add(v.portPos, .08, -.06, .08), u); },
      load(k, A, v) { A.rot.z += .6; A.rot.x += .1; A.show.round = k < .7; E(A, .66, 'shell'); A.L = path(k, [[0, add(v.portPos, .08, -.06, .08)], [.45, add(v.portPos, .03, -.01, .03)], [.7, v.portPos], [1, add(v.portPos, .08, -.06, .08)]]); },
      end(k, A, v, ctx) {
        const u = 1 - seg(k, 0, .45); A.rot.z += .6 * u; A.rot.x += .1 * u; A.L = add(v.portPos, .08, -.06, .08).lerp(v.homeL, seg(k, 0, .45));
        if (ctx.empty) { P(A, 'lever').r.x += 1 * hold(k, .5, .65, .75, .9); E(A, .52, 'lever'); A.R = v.homeR.clone().add(new V3(0, -.07 * hold(k, .5, .65, .75, .9), .03 * hold(k, .5, .65, .75, .9))); }
      },
    },
    gate: {
      start(k, A, v) { const u = seg(k, 0, 1); A.rot.z += .8 * u; A.rot.x += .2 * u; P(A, 'hammer').r.x -= .4 * u; P(A, 'gate').r.y += 1.2 * u; A.L = v.homeL.clone().lerp(add(v.portPos, .07, -.05, .1), u); E(A, .5, 'hammer'); },
      load(k, A, v, ctx) {
        A.rot.z += .8; A.rot.x += .2; P(A, 'hammer').r.x -= .4; P(A, 'gate').r.y += 1.2;
        if (ctx.spent > 0) E(A, .15, 'ejectOne');
        A.show.round = k > .2 && k < .7; E(A, .66, 'shell');
        P(A, 'cyl').r.z += v.cylStep * seg(k, .75, .95);
        A.L = path(k, [[0, add(v.portPos, .07, -.05, .1)], [.4, add(v.portPos, .03, -.01, .05)], [.7, v.portPos], [1, add(v.portPos, .07, -.05, .1)]]);
      },
      end(k, A, v) { const u = 1 - seg(k, 0, 1); A.rot.z += .8 * u; A.rot.x += .2 * u; P(A, 'hammer').r.x -= .4 * u; P(A, 'gate').r.y += 1.2 * u; A.L = add(v.portPos, .07, -.05, .1).lerp(v.homeL, 1 - u); E(A, .2, 'cylClose'); },
    },
    boltLoad: {
      start(k, A, v) {
        A.rot.z += .3 * seg(k, 0, .5); const bp = P(A, 'bolt'); bp.r.z += 1.1 * seg(k, .1, .45); bp.p.z += .09 * seg(k, .5, .9);
        E(A, .15, 'boltUp'); A.R = path(k, [[0, v.homeR], [.15, v.knobPos], [.45, add(v.knobPos, 0, .03, 0)], [.9, add(v.knobPos, 0, .03, .09)]]);
        A.L = v.homeL.clone().lerp(add(v.portPos, -.03, .08, .02), seg(k, .3, 1));
      },
      load(k, A, v) {
        A.rot.z += .3; const bp = P(A, 'bolt'); bp.r.z += 1.1; bp.p.z += .09; A.R = add(v.knobPos, 0, .03, .09);
        A.show.round = k < .7; E(A, .66, 'shell');
        A.L = path(k, [[0, add(v.portPos, -.03, .08, .02)], [.45, add(v.portPos, 0, .03, 0)], [.7, v.portPos], [1, add(v.portPos, -.03, .08, .02)]]);
      },
      end(k, A, v) {
        A.rot.z += .3 * (1 - seg(k, .5, 1)); const bp = P(A, 'bolt'); bp.r.z += 1.1 * (1 - seg(k, .4, .7)); bp.p.z += .09 * (1 - seg(k, 0, .35));
        E(A, .3, 'bolt'); A.R = path(k, [[0, add(v.knobPos, 0, .03, .09)], [.35, add(v.knobPos, 0, .03, 0)], [.7, v.knobPos], [1, v.homeR]]);
        A.L = add(v.portPos, -.03, .08, .02).lerp(v.homeL, seg(k, 0, .6));
      },
    },
  };
  SHELL.lever.endLen = .9; SHELL.shell.endLen = .85; SHELL.gate.endLen = .45; SHELL.boltLoad.endLen = .55;

  // 쏠 때마다 움직이는 부품
  const kickBack = k => k < .3 ? ss(k / .3) : 1 - ss((k - .3) / .7);
  const CY = {
    slide(k, A) { P(A, 'slide').p.z += .032 * kickBack(k); P(A, 'hammer').r.x -= .6 * kickBack(k); },
    toggle(k, A) { P(A, 'toggle').r.x -= 1.1 * kickBack(k); },
    boltSmall(k, A) { P(A, 'bolt').p.z += .03 * kickBack(k); },
    carrier(k, A) { P(A, 'carrier').p.z += .025 * kickBack(k); },
    ak(k, A) { P(A, 'bolt').p.z += .065 * kickBack(k); },
    bolt(k, A, v) {
      const bp = P(A, 'bolt'); bp.r.z += 1.1 * hold(k, .08, .2, .72, .85); bp.p.z += .09 * hold(k, .22, .38, .5, .68);
      A.rot.z += .12 * hold(k, 0, .15, .8, 1); A.rot.x -= .04 * hold(k, 0, .15, .8, 1);
      E(A, .12, 'boltUp'); E(A, .37, 'eject'); E(A, .68, 'bolt');
      const kp = v.knobPos;
      A.R = path(k, [[0, v.homeR], [.08, kp], [.2, add(kp, 0, .03, 0)], [.38, add(kp, 0, .03, .09)], [.5, add(kp, 0, .03, .09)], [.68, add(kp, 0, .03, 0)], [.85, kp], [1, v.homeR]]);
    },
    pump(k, A, v) {
      const z = .09 * hold(k, .05, .35, .45, .8); P(A, 'pump').p.z += z;
      A.L = v.homeL.clone().add(new V3(0, 0, z)); A.rot.x += .04 * hold(k, 0, .3, .5, .9);
      E(A, .06, 'pump'); E(A, .33, 'eject');
    },
    lever(k, A, v) {
      const u = hold(k, .05, .35, .5, .85); P(A, 'lever').r.x += 1.0 * u;
      A.R = v.homeR.clone().add(new V3(0, -.07 * u, .03 * u)); A.rot.x -= .08 * u;
      E(A, .06, 'lever'); E(A, .32, 'eject');
    },
    da(k, A, v) { P(A, 'cyl').r.z += v.cylStep * seg(k, 0, .5); P(A, 'hammer').r.x -= .5 * kickBack(k); },
    sa(k, A, v) { P(A, 'hammer').r.x -= .7 * hold(k, .3, .6, .8, .82); P(A, 'cyl').r.z += v.cylStep * seg(k, .3, .6); A.rot.z += .08 * hold(k, .2, .4, .7, .9); E(A, .45, 'hammer'); },
    none() {}, spin() {},
  };

  // 계산된 자세를 실제 모델에 적용
  function apply(v, A) {
    for (const n in v.parts) {
      const p = v.parts[n], h = p.userData.home, a = A.parts[n];
      p.position.copy(h.p); p.rotation.copy(h.r);
      if (n === 'cyl') p.rotation.z += v.cylRot;
      if (n === 'spin') p.rotation.z += v.spin;
      if (a) { p.position.add(a.p); p.rotation.x += a.r.x; p.rotation.y += a.r.y; p.rotation.z += a.r.z; }
      p.visible = a ? a.vis : true;
    }
    if (v.parts.mag && v.hideMag) v.parts.mag.visible = false;
    if (v.handL) {
      v.handL.position.copy(A.L || v.homeL);
      v.handR.position.copy(A.R || v.homeR);
      for (const n in v.props) v.props[n].visible = !!A.show[n];
    }
  }

  // ---------- 탄피 · 떨어지는 탄창 ----------
  const debris = [];
  function spawnCasing(v, scene, kind) {
    if (!v.eject || kind === 'none') return;
    const m = roundMesh(kind === 'shell' ? 'shell' : 'brass');
    if (kind !== 'shell') m.children[1] && (m.children[1].visible = false);
    v.eject.updateWorldMatrix(true, false);
    m.position.setFromMatrixPosition(v.eject.matrixWorld);
    const vel = new V3(1.1 + Math.random() * .5, .9 + Math.random() * .5, .3).transformDirection(v.root.matrixWorld).multiplyScalar(1.6);
    scene.add(m); debris.push({ m, vel, spin: new V3(Math.random() * 20, Math.random() * 20, 0), life: .7, grav: 6 });
  }
  function spawnMany(v, scene, kind, n, up) {
    for (let i = 0; i < n; i++) {
      const m = roundMesh(kind === 'shell' ? 'shell' : kind === 'grenade' ? 'grenade' : 'brass');
      const base = v.cylOpenPos || v.portPos;
      m.position.copy(base).add(new V3((Math.random() - .5) * .02, (Math.random() - .5) * .02, .03)).applyMatrix4(v.root.matrixWorld);
      const vel = new V3((Math.random() - .5) * .6, up ? 1.2 : -.6, up ? .9 : .6).transformDirection(v.root.matrixWorld).multiplyScalar(1.4);
      scene.add(m); debris.push({ m, vel, spin: new V3(Math.random() * 10, Math.random() * 10, 0), life: .9, grav: 5 });
    }
  }
  function dropPart(v, scene, name) {
    const p = v.parts[name]; if (!p) return;
    p.updateWorldMatrix(true, true);
    const g = new THREE.Group();
    p.children.forEach(ch => { if (ch.isMesh) { const m = ch.clone(); g.add(m); } });
    g.applyMatrix4(p.matrixWorld);
    scene.add(g);
    debris.push({ m: g, vel: new V3(-.2, -.6, .2), spin: new V3(2, 0, 3), life: .8, grav: 4 });
  }
  function flyPart(v, scene, prop) {
    const p = v.props[prop]; if (!p) return;
    const g = p.clone(); g.visible = true;
    g.position.copy(v.clipPos).add(new V3(0, .03, 0)).applyMatrix4(v.root.matrixWorld);
    scene.add(g);
    debris.push({ m: g, vel: new V3(.4, 2.2, .5).transformDirection(v.root.matrixWorld).multiplyScalar(1.2), spin: new V3(14, 6, 0), life: .9, grav: 6 });
  }
  function updateDebris(dt, scene) {
    for (let i = debris.length - 1; i >= 0; i--) {
      const d = debris[i]; d.life -= dt;
      d.vel.y -= d.grav * dt; d.m.position.addScaledVector(d.vel, dt);
      d.m.rotation.x += d.spin.x * dt; d.m.rotation.y += d.spin.y * dt; d.m.rotation.z += d.spin.z * dt;
      if (d.life <= 0) { scene.remove(d.m); debris.splice(i, 1); }
    }
  }
  function clearDebris(scene) { debris.forEach(d => scene.remove(d.m)); debris.length = 0; }

  return { build, RL, SHELL, CY, newPose, apply, spawnCasing, spawnMany, dropPart, flyPart, updateDebris, clearDebris, roundMesh, seg, hold };
})();
