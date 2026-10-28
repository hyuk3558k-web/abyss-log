'use strict';
// =====================================================================
//  동굴 만들기: 방과 굴을 무작위로 파내고, 울퉁불퉁한 바위벽을 씌운다
// =====================================================================
const WORLD = (() => {
  const V3 = THREE.Vector3;
  const CS = 3;            // 칸 하나 = 3m
  const CHUNK = 8;         // 8×8칸씩 묶어서 그린다

  function rng(seed) {
    let s = seed >>> 0;
    return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function hash(x, y, z) {
    let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(z | 0, 1442695041);
    h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
    return (h >>> 0) / 4294967295;
  }
  const sm = t => t * t * (3 - 2 * t);
  function vnoise(x, y, z) {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    const xf = sm(x - xi), yf = sm(y - yi), zf = sm(z - zi);
    const l = (a, b, t) => a + (b - a) * t;
    const c = (dx, dy, dz) => hash(xi + dx, yi + dy, zi + dz);
    return l(l(l(c(0, 0, 0), c(1, 0, 0), xf), l(c(0, 1, 0), c(1, 1, 0), xf), yf), l(l(c(0, 0, 1), c(1, 0, 1), xf), l(c(0, 1, 1), c(1, 1, 1), xf), yf), zf);
  }
  function fbm(x, y, z) { return (vnoise(x, y, z) * .55 + vnoise(x * 2.1, y * 2.1, z * 2.1) * .3 + vnoise(x * 4.3, y * 4.3, z * 4.3) * .15); }

  // ---------- 바위 무늬 ----------
  let rockTex = null;
  function getRockTex() {
    if (rockTex) return rockTex;
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    const img = g.createImageData(256, 256);
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
      const n = fbm(x / 22, y / 22, 3.3) * .7 + vnoise(x / 4, y / 4, 9) * .3;
      const v = 120 + n * 120; const i = (y * 256 + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    // 얼룩덜룩한 광물 반점
    for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(${Math.random() < .5 ? '20,18,16' : '235,228,215'},${.05 + Math.random() * .12})`; g.beginPath(); g.arc(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 6, 0, Math.PI * 2); g.fill(); }
    rockTex = new THREE.CanvasTexture(c); rockTex.wrapS = rockTex.wrapT = THREE.RepeatWrapping;
    return rockTex;
  }
  let glowTex = null;
  function getGlow() {
    if (glowTex) return glowTex;
    const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.3, 'rgba(255,255,255,.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64); glowTex = new THREE.CanvasTexture(c); return glowTex;
  }

  // ---------- 캔버스 무늬 (풀밭, 집 벽, 돌길, 연구소 벽·바닥·천장) ----------
  const texCache = {};
  function canvasTex(key, size, draw) {
    if (texCache[key]) return texCache[key];
    const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d'); draw(g, size);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; texCache[key] = t; return t;
  }
  function noiseFill(g, S, sc, lo, hi, seed) {
    const img = g.createImageData(S, S);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const v = lo + fbm(x / sc, y / sc, seed) * (hi - lo); const i = (y * S + x) * 4; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
    g.putImageData(img, 0, 0);
  }
  const TEX = {
    grass: () => canvasTex('grass', 256, (g, S) => {
      noiseFill(g, S, 18, 120, 230, 4.4);
      for (let i = 0; i < 1400; i++) { const x = Math.random() * S, y = Math.random() * S; g.strokeStyle = `rgba(${Math.random() < .5 ? '255,255,255' : '30,30,30'},${.08 + Math.random() * .12})`; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (Math.random() - .5) * 4, y - 3 - Math.random() * 5); g.stroke(); }
    }),
    cobble: () => canvasTex('cobble', 256, (g, S) => {
      noiseFill(g, S, 30, 70, 110, 8.1);
      for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { const ox = (y % 2) * 16; const v = 150 + Math.random() * 70; g.fillStyle = `rgb(${v},${v},${v})`; g.beginPath(); g.roundRect ? g.roundRect(x * 32 + ox + 2, y * 32 + 2, 28, 28, 7) : g.rect(x * 32 + ox + 2, y * 32 + 2, 28, 28); g.fill(); }
    }),
    facade: () => canvasTex('facade', 256, (g, S) => {
      noiseFill(g, S, 24, 170, 235, 2.2);
      g.fillStyle = 'rgba(70,50,40,.55)'; for (let y = 176; y < S; y += 12) for (let x = (y / 12 % 2) * 14; x < S; x += 28) g.fillRect(x, y, 26, 10);
      g.fillStyle = '#3a2a20'; g.fillRect(0, 168, S, 8); g.fillRect(0, 0, S, 10);
      g.fillStyle = '#2a2420'; g.fillRect(70, 42, 116, 96); g.fillStyle = '#141820'; g.fillRect(78, 50, 48, 38); g.fillRect(130, 50, 48, 38); g.fillRect(78, 92, 48, 38); g.fillRect(130, 92, 48, 38);
      g.strokeStyle = 'rgba(200,220,255,.25)'; g.beginPath(); g.moveTo(84, 84); g.lineTo(120, 56); g.stroke();
    }),
    facadeGlow: () => canvasTex('facadeGlow', 256, (g, S) => {
      g.fillStyle = '#000'; g.fillRect(0, 0, S, S);
      const gr = g.createLinearGradient(0, 50, 0, 130); gr.addColorStop(0, '#ffb050'); gr.addColorStop(1, '#a05010');
      g.fillStyle = gr; g.fillRect(130, 92, 48, 38); g.globalAlpha = .6; g.fillRect(78, 50, 48, 38);
    }),
    panel: () => canvasTex('panel', 256, (g, S) => {
      noiseFill(g, S, 40, 175, 215, 6.6);
      g.strokeStyle = 'rgba(40,44,48,.7)'; g.lineWidth = 3; g.strokeRect(2, 2, S - 4, S - 4); g.beginPath(); g.moveTo(S / 2, 0); g.lineTo(S / 2, S * .8); g.stroke();
      for (let x = 0; x < S; x += 32) { g.fillStyle = (x / 32) % 2 ? '#d8b020' : '#202020'; g.beginPath(); g.moveTo(x, S); g.lineTo(x + 32, S * .86); g.lineTo(x + 64, S * .86); g.lineTo(x + 32, S); g.fill(); }
      g.fillStyle = 'rgba(30,30,30,.6)'; g.fillRect(0, S * .8, S, 6);
      g.fillStyle = 'rgba(120,60,40,.35)'; for (let i = 0; i < 6; i++) g.fillRect(Math.random() * S, 10, 3 + Math.random() * 4, 30 + Math.random() * 120);
    }),
    tile: () => canvasTex('tile', 256, (g, S) => {
      noiseFill(g, S, 30, 150, 200, 7.7);
      g.strokeStyle = 'rgba(30,30,30,.6)'; g.lineWidth = 3; for (let i = 0; i <= S; i += 64) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, S); g.moveTo(0, i); g.lineTo(S, i); g.stroke(); }
      g.fillStyle = 'rgba(40,30,20,.3)'; for (let i = 0; i < 20; i++) { g.beginPath(); g.arc(Math.random() * S, Math.random() * S, 4 + Math.random() * 18, 0, 7); g.fill(); }
    }),
    ceilLab: () => canvasTex('ceilLab', 256, (g, S) => { noiseFill(g, S, 30, 90, 130, 5.5); g.strokeStyle = 'rgba(20,20,20,.7)'; g.lineWidth = 3; g.strokeRect(2, 2, S - 4, S - 4); g.fillStyle = '#e8eef8'; g.fillRect(S * .38, 20, S * .24, S - 40); }),
    ceilGlow: () => canvasTex('ceilGlow', 256, (g, S) => { g.fillStyle = '#000'; g.fillRect(0, 0, S, S); g.fillStyle = '#cfe0ff'; g.fillRect(S * .38, 20, S * .24, S - 40); }),
  };

  // 여러 장식을 한 덩어리로 합쳐서 그린다 (휴대폰도 빠르게)
  function Batch() {
    const pos = [], nor = [], col = [], m4 = new THREE.Matrix4(), nm = new THREE.Matrix3(), v = new V3(), c = new THREE.Color(), q = new THREE.Quaternion(), e = new THREE.Euler();
    return {
      add(geo, x, y, z, o) {
        o = o || {};
        const gg = geo.index ? geo.toNonIndexed() : geo;
        if (!gg.attributes.normal) gg.computeVertexNormals();
        e.set(o.rx || 0, o.ry || 0, o.rz || 0); q.setFromEuler(e);
        const s = o.s || [1, 1, 1]; m4.compose(new V3(x, y, z), q, new V3(s[0], s[1], s[2])); nm.getNormalMatrix(m4);
        c.set(o.c === undefined ? 0xffffff : o.c).convertSRGBToLinear();
        const p = gg.attributes.position, n = gg.attributes.normal;
        for (let i = 0; i < p.count; i++) {
          v.fromBufferAttribute(p, i).applyMatrix4(m4); pos.push(v.x, v.y, v.z);
          v.fromBufferAttribute(n, i).applyMatrix3(nm).normalize(); nor.push(v.x, v.y, v.z); col.push(c.r, c.g, c.b);
        }
      },
      mesh(mat, shadow) {
        if (!pos.length) return null;
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
        g.computeBoundingSphere();
        const m = new THREE.Mesh(g, mat); m.castShadow = !!shadow; m.receiveShadow = true; return m;
      },
    };
  }
  const GEO = {};
  const geo = (k, f) => GEO[k] || (GEO[k] = f());

  // ---------- 사람이 만든 곳 (마을 · 연구소): 네모난 방과 곧은 길 ----------
  function carveRect(ch, R) {
    const N = ch.size || 48, grid = new Uint8Array(N * N), lab = ch.theme.kind === 'lab';
    const fill = (x0, z0, x1, z1) => {
      for (let z = Math.max(2, Math.min(z0, z1)); z <= Math.min(N - 3, Math.max(z0, z1)); z++)
        for (let x = Math.max(2, Math.min(x0, x1)); x <= Math.min(N - 3, Math.max(x0, x1)); x++) grid[z * N + x] = 1;
    };
    const start = { x: 5, z: Math.floor(N / 2) };
    const rooms = [{ x: start.x, z: start.z, w: 3, h: 3, r: 3, start: true }];
    fill(start.x - 3, start.z - 3, start.x + 3, start.z + 3);
    const cw = lab ? 1 : 2;
    const corridor = (a, b) => {
      if (R() < .5) { fill(a.x, a.z, b.x, a.z + cw - 1); fill(b.x, a.z, b.x + cw - 1, b.z); }
      else { fill(a.x, a.z, a.x + cw - 1, b.z); fill(a.x, b.z, b.x, b.z + cw - 1); }
    };
    for (let i = 1; i < (ch.rooms || 9); i++) {
      for (let tries = 0; tries < 60; tries++) {
        const base = rooms[Math.floor(R() * rooms.length)];
        const ang = R() * Math.PI * 2, d = 9 + R() * 7;
        const nx = Math.round(base.x + Math.cos(ang) * d), nz = Math.round(base.z + Math.sin(ang) * d);
        const w = 2 + Math.floor(R() * (lab ? 3 : 4)), h = 2 + Math.floor(R() * (lab ? 3 : 4));
        if (nx - w < 4 || nz - h < 4 || nx + w > N - 5 || nz + h > N - 5) continue;
        if (rooms.some(o => Math.abs(o.x - nx) < o.w + w + 3 && Math.abs(o.z - nz) < o.h + h + 3)) continue;
        const room = { x: nx, z: nz, w, h, r: Math.min(w, h) + 1 };
        rooms.push(room); corridor(base, room); fill(nx - w, nz - h, nx + w, nz + h);
        if (R() < .3 && rooms.length > 3) { const o = rooms[Math.floor(R() * (rooms.length - 1))]; if (o !== room && Math.hypot(o.x - nx, o.z - nz) < 22) corridor(o, room); }
        break;
      }
    }
    let far = rooms[0], fd = 0;
    rooms.forEach(r => { const d = Math.hypot(r.x - start.x, r.z - start.z); if (d > fd) { fd = d; far = r; } });
    far.deep = true;
    if (ch.boss) { far.w = far.h = 6; far.r = 6.5; fill(far.x - 6, far.z - 6, far.x + 6, far.z + 6); }
    return { N, grid, rooms, start, R };
  }

  // ---------- 동굴 모양 만들기 ----------
  function carveMap(ch, seed, mode) {
    const R = rng(seed);
    if (mode === 'range') {
      const N = 26, grid = new Uint8Array(N * N);
      for (let z = 8; z <= 14; z++) for (let x = 2; x <= 23; x++) grid[z * N + x] = 1;
      return { N, grid, rooms: [{ x: 3, z: 11, r: 3, start: true }], start: { x: 3, z: 11 }, R };
    }
    if (ch.theme && (ch.theme.kind === 'village' || ch.theme.kind === 'lab')) return carveRect(ch, R);
    const open = ch.theme && ch.theme.kind === 'mountain';
    const N = ch.size || 48, grid = new Uint8Array(N * N);
    const set = (x, z) => { if (x > 1 && z > 1 && x < N - 2 && z < N - 2) grid[z * N + x] = 1; };
    const carve = (cx, cz, r) => { const ri = Math.ceil(r); for (let dz = -ri; dz <= ri; dz++) for (let dx = -ri; dx <= ri; dx++) if (dx * dx + dz * dz <= r * r) set(Math.round(cx + dx), Math.round(cz + dz)); };
    const blob = (cx, cz, r) => { carve(cx, cz, r); for (let i = 0; i < 3; i++) carve(cx + (R() - .5) * r, cz + (R() - .5) * r, r * (.55 + R() * .35)); };
    const start = { x: 5, z: Math.floor(N / 2) };
    const rooms = [{ x: start.x, z: start.z, r: 3.2, start: true }];
    blob(start.x, start.z, 3.2);
    const tunnel = (a, b) => {
      const dx = b.x - a.x, dz = b.z - a.z, len = Math.hypot(dx, dz), px = -dz / len, pz = dx / len;
      const amp = 1.5 + R() * 2.5, freq = 1 + R() * 2, ph = R() * 6, w = open ? 1.8 + R() * .8 : 1.1 + R() * .5;
      for (let t = 0; t <= 1; t += .5 / len) {
        const wob = Math.sin(t * Math.PI * freq + ph) * amp * Math.sin(t * Math.PI);
        carve(a.x + dx * t + px * wob, a.z + dz * t + pz * wob, w);
      }
    };
    for (let i = 1; i < (ch.rooms || 8); i++) {
      for (let tries = 0; tries < 40; tries++) {
        const base = rooms[Math.floor(R() * rooms.length)];
        const ang = R() * Math.PI * 2, d = 9 + R() * 6;
        const nx = Math.round(base.x + Math.cos(ang) * d), nz = Math.round(base.z + Math.sin(ang) * d);
        if (nx < 6 || nz < 6 || nx > N - 7 || nz > N - 7) continue;
        const r = open ? 3.4 + R() * 2.8 : 2.6 + R() * 2.4;
        if (rooms.some(o => Math.hypot(o.x - nx, o.z - nz) < o.r + r + 2.5)) continue;
        const room = { x: nx, z: nz, r };
        rooms.push(room); tunnel(base, room); blob(nx, nz, r);
        if (R() < .3 && rooms.length > 3) { const o = rooms[Math.floor(R() * (rooms.length - 1))]; if (o !== room && Math.hypot(o.x - nx, o.z - nz) < 20) tunnel(o, room); }
        break;
      }
    }
    // 가장 먼 방 = 깊은 곳 (보스 방)
    let far = rooms[0], fd = 0;
    rooms.forEach(r => { const d = Math.hypot(r.x - start.x, r.z - start.z); if (d > fd) { fd = d; far = r; } });
    far.deep = true;
    if (ch.boss) { far.r = 6.5; carve(far.x, far.z, 6.5); }
    // 부드럽게 다듬기
    for (let pass = 0; pass < 2; pass++) {
      const nx = new Uint8Array(grid);
      for (let z = 2; z < N - 2; z++) for (let x = 2; x < N - 2; x++) {
        let c = 0; for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) if (dx || dz) c += grid[(z + dz) * N + x + dx];
        if (c >= 6) nx[z * N + x] = 1; else if (c <= 2) nx[z * N + x] = 0;
      }
      grid.set(nx);
    }
    rooms.forEach(r => carve(r.x, r.z, Math.min(r.r, 2)));
    // 출발점에서 이어진 곳만 남긴다
    const seen = new Uint8Array(N * N), q = [start.z * N + start.x]; seen[q[0]] = 1;
    while (q.length) { const c = q.pop(), x = c % N, z = (c / N) | 0; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, b]) => { const n = (z + b) * N + x + a; if (grid[n] && !seen[n]) { seen[n] = 1; q.push(n); } }); }
    for (let i = 0; i < N * N; i++) if (!seen[i]) grid[i] = 0;
    return { N, grid, rooms: rooms.filter(r => grid[r.z * N + r.x]), start, R };
  }

  // =================================================================
  //  레벨 만들기
  // =================================================================
  function build(ch, seed, mode, opts) {
    opts = opts || {};
    const T = mode === 'range' ? { rock: 0x6a6660, fog: 0x0c0c0e, fogD: .012, amb: 0x605a50, light: 0xffe0b0 } : ch.theme;
    const K = mode === 'range' ? 'range' : (T.kind || 'cave');
    const sky = K === 'mountain' || K === 'village', made = K === 'village' || K === 'lab', cave = K === 'cave';
    const { N, grid, rooms, start, R } = carveMap(ch || {}, seed, mode);
    const isFloor = (i, j) => i >= 0 && j >= 0 && i < N && j < N && grid[j * N + i] === 1;
    // 벽까지 거리
    const dw = new Int16Array(N * N).fill(-1); const q = [];
    for (let i = 0; i < N * N; i++) if (!grid[i]) { dw[i] = 0; q.push(i); }
    for (let h = 0; h < q.length; h++) { const c = q[h], x = c % N, z = (c / N) | 0; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, b]) => { const xx = x + a, zz = z + b; if (xx < 0 || zz < 0 || xx >= N || zz >= N) return; const n = zz * N + xx; if (dw[n] < 0) { dw[n] = dw[c] + 1; q.push(n); } }); }
    // 천장 높이 (넓은 곳일수록 높다)
    const ceilC = new Float32Array((N + 1) * (N + 1));
    const cdw = (i, j) => (i < 0 || j < 0 || i >= N || j >= N) ? 0 : dw[j * N + i];
    const range = mode === 'range';
    for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) {
      const a = (cdw(i - 1, j - 1) + cdw(i, j - 1) + cdw(i - 1, j) + cdw(i, j)) / 4;
      ceilC[j * (N + 1) + i] = range ? 7 : sky ? 9 : K === 'lab' ? 3.8 : 3.2 + Math.min(a, 5) * 1.05 + vnoise(i * .4, j * .4, 7) * 1.6;
    }
    const flat = range || sky || made;
    const ceilAt = (x, z) => {
      const fx = Math.max(0, Math.min(N - .001, x / CS)), fz = Math.max(0, Math.min(N - .001, z / CS));
      const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, w = fz - j, W = N + 1;
      const c = (ceilC[j * W + i] * (1 - u) + ceilC[j * W + i + 1] * u) * (1 - w) + (ceilC[(j + 1) * W + i] * (1 - u) + ceilC[(j + 1) * W + i + 1] * u) * w;
      return c + (flat ? 0 : (fbm(x * .2, 5, z * .2) - .5) * 1.2);
    };
    const floorAt = (x, z) => range || made ? 0 : (fbm(x * .25, 1.7, z * .25) - .5) * (K === 'mountain' ? .4 : .25);
    const dk = K === 'mountain' ? 1.7 : 1;
    const disp = (x, y, z) => range || made ? [0, 0, 0] : [(fbm(x * .3, y * .3, z * .3) - .5) * 1.5 * dk, (fbm(x * .3 + 11, y * .3, z * .3) - .5) * .7, (fbm(x * .3, y * .3 + 23, z * .3) - .5) * 1.5 * dk];
    // 밖에서는 벽 높이: 산은 높은 절벽, 마을은 집 높이
    const edgeTop = (x, z, i, j, e) => K === 'mountain' ? 6 + fbm(x * .07, 3.1, z * .07) * 11 : K === 'village' ? [4.6, 5.6, 6.8, 5.2][Math.floor(hash(i, j, e) * 4)] : K === 'lab' ? 3.9 : ceilAt(x, z) + 1;

    const group = new THREE.Group();
    const rockCol = new THREE.Color(T.rock), mossCol = new THREE.Color(T.moss || T.rock), tmp = new THREE.Color();
    const groundCol = new THREE.Color(T.ground || T.rock), grassCol = new THREE.Color(T.grass || T.ground || T.rock), wallCol = new THREE.Color(T.wall || T.rock);
    const chunks = {};
    const getChunk = (i, j, kind) => { const k = ((i / CHUNK) | 0) + ',' + ((j / CHUNK) | 0) + (cave || range ? '' : ',' + kind); return chunks[k] || (chunks[k] = { pos: [], col: [], uv: [], kind }); };
    const colorAt = (x, y, z, kind) => {
      const n = fbm(x * .18, y * .18, z * .18);
      if (made) { tmp.copy(kind === 'wall' ? wallCol : groundCol).multiplyScalar(.8 + n * .4); if (kind === 'ceil') tmp.copy(wallCol).multiplyScalar(.6); return tmp; }
      if (K === 'mountain' && kind === 'floor') { tmp.copy(groundCol).lerp(grassCol, vnoise(x * .12, 0, z * .12)).multiplyScalar(.7 + n * .5); return tmp; }
      tmp.copy(rockCol).multiplyScalar(.55 + n * .75);
      if (K === 'mountain' && kind === 'wall' && y > 3 && vnoise(x * .2, y * .2, z * .2) > .62) tmp.lerp(grassCol, .5);
      if (kind === 'floor') { tmp.multiplyScalar(.85); if (T.moss && vnoise(x * .15, 0, z * .15) > .6) tmp.lerp(mossCol, .5); if (T.lava && vnoise(x * .3, 2, z * .3) > .78) tmp.setRGB(1.4, .45, .12); }
      if (kind === 'ceil') tmp.multiplyScalar(.7);
      if (T.crystal && kind === 'wall' && vnoise(x * .35, y * .35, z * .35) > .8) tmp.lerp(new THREE.Color(T.crystal), .45);
      return tmp;
    };
    const pushTri = (C, a, b, c, kind, uvs) => {
      [a, b, c].forEach((p, k) => {
        C.pos.push(p[0], p[1], p[2]);
        const col = colorAt(p[0], p[1], p[2], kind); C.col.push(col.r, col.g, col.b);
        if (uvs) C.uv.push(uvs[k][0], uvs[k][1]);
        else if (made) C.uv.push(p[0] / CS, p[2] / CS);
        else if (kind === 'wall') C.uv.push((p[0] + p[2]) * .22, p[1] * .22); else C.uv.push(p[0] * .22, p[2] * .22);
      });
    };
    const dispP = (x, y, z) => { const d = disp(x, y, z); return [x + d[0], y + d[1], z + d[2]]; };
    // 바닥 · 천장
    const nearFloor = (i, j) => { for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) if (isFloor(i + a, j + b)) return true; return false; };
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      if (!nearFloor(i, j)) continue;
      const C = getChunk(i, j, 'floor'), CC = getChunk(i, j, 'ceil'), S = made ? 1 : 2;
      for (let b = 0; b < S; b++) for (let a = 0; a < S; a++) {
        const x0 = (i + a / S) * CS, x1 = (i + (a + 1) / S) * CS, z0 = (j + b / S) * CS, z1 = (j + (b + 1) / S) * CS;
        const f = (x, z) => [x, floorAt(x, z), z];
        pushTri(C, f(x0, z0), f(x0, z1), f(x1, z1), 'floor'); pushTri(C, f(x0, z0), f(x1, z1), f(x1, z0), 'floor');
        if (sky) continue;
        const cc = (x, z) => dispP(x, ceilAt(x, z), z);
        pushTri(CC, cc(x0, z0), cc(x1, z1), cc(x0, z1), 'ceil'); pushTri(CC, cc(x0, z0), cc(x1, z0), cc(x1, z1), 'ceil');
      }
    }
    // 벽
    const SU = 3;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      if (!isFloor(i, j)) continue;
      const C = getChunk(i, j, 'wall');
      [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([di, dj]) => {
        if (isFloor(i + di, j + dj)) return;
        let ax, az, bx, bz;
        if (di === -1) { ax = i * CS; az = j * CS; bx = i * CS; bz = (j + 1) * CS; }
        if (di === 1) { ax = (i + 1) * CS; az = j * CS; bx = (i + 1) * CS; bz = (j + 1) * CS; }
        if (dj === -1) { ax = i * CS; az = j * CS; bx = (i + 1) * CS; bz = j * CS; }
        if (dj === 1) { ax = i * CS; az = (j + 1) * CS; bx = (i + 1) * CS; bz = (j + 1) * CS; }
        const ex = bx - ax, ez = bz - az, nx = -di, nz = -dj;
        // 벽 면이 방 쪽을 보도록 삼각형 감는 방향을 정한다
        const cross = [ -ez, 0, ex ];
        const good = cross[0] * nx + cross[2] * nz > 0;
        for (let u = 0; u < SU; u++) {
          const u0 = u / SU, u1 = (u + 1) / SU;
          const x0 = ax + ex * u0, z0 = az + ez * u0, x1 = ax + ex * u1, z1 = az + ez * u1;
          const e = (di + 1) * 3 + dj + 1;
          const top0 = edgeTop(x0, z0, i, j, e), top1 = made ? top0 : edgeTop(x1, z1, i, j, e), SV = made ? 1 : Math.max(3, Math.ceil(Math.max(top0, top1) / 1.3));
          for (let s = 0; s < SV; s++) {
            const v0 = s / SV, v1 = (s + 1) / SV;
            const y00 = -.6 + (top0 + .6) * v0, y01 = -.6 + (top0 + .6) * v1, y10 = -.6 + (top1 + .6) * v0, y11 = -.6 + (top1 + .6) * v1;
            const A = dispP(x0, y00, z0), B = dispP(x1, y10, z1), Cc = dispP(x1, y11, z1), D = dispP(x0, y01, z0);
            const uA = [u0, v0], uB = [u1, v0], uC = [u1, v1], uD = [u0, v1];
            const U = made ? true : null;
            if (good) { pushTri(C, A, B, Cc, 'wall', U && [uA, uB, uC]); pushTri(C, A, Cc, D, 'wall', U && [uA, uC, uD]); }
            else { pushTri(C, A, Cc, B, 'wall', U && [uA, uC, uB]); pushTri(C, A, D, Cc, 'wall', U && [uA, uD, uC]); }
          }
        }
      });
    }
    const tex = getRockTex();
    const rockMat = new THREE.MeshStandardMaterial({ map: tex, bumpMap: tex, bumpScale: .08, vertexColors: true, flatShading: true, roughness: T.crystal ? .7 : .95, metalness: T.crystal ? .15 : 0 });
    const night = T.sky && T.sky.moon;
    const MATS = { floor: rockMat, ceil: rockMat, wall: rockMat };
    if (K === 'mountain') MATS.floor = new THREE.MeshStandardMaterial({ map: TEX.grass(), vertexColors: true, roughness: 1 });
    if (K === 'village') {
      MATS.floor = new THREE.MeshStandardMaterial({ map: TEX.cobble(), bumpMap: TEX.cobble(), bumpScale: .05, vertexColors: true, roughness: .95 });
      MATS.wall = new THREE.MeshStandardMaterial({ map: TEX.facade(), vertexColors: true, roughness: .9, emissiveMap: TEX.facadeGlow(), emissive: 0xffffff, emissiveIntensity: night ? .9 : .25 });
    }
    if (K === 'lab') {
      MATS.floor = new THREE.MeshStandardMaterial({ map: TEX.tile(), vertexColors: true, roughness: .6, metalness: .1 });
      MATS.wall = new THREE.MeshStandardMaterial({ map: TEX.panel(), vertexColors: true, roughness: .7, metalness: .2 });
      MATS.ceil = new THREE.MeshStandardMaterial({ map: TEX.ceilLab(), vertexColors: true, roughness: .8, emissiveMap: TEX.ceilGlow(), emissive: 0xffffff, emissiveIntensity: .9 });
    }
    const solids = [];
    for (const k in chunks) {
      const C = chunks[k], g = new THREE.BufferGeometry();
      if (!C.pos.length) continue;
      g.setAttribute('position', new THREE.Float32BufferAttribute(C.pos, 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(C.col, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(C.uv, 2));
      g.computeVertexNormals(); g.computeBoundingSphere();
      const m = new THREE.Mesh(g, MATS[C.kind] || rockMat); m.receiveShadow = true; m.castShadow = cave || range || C.kind !== 'floor';
      group.add(m); solids.push(m);
    }

    // ---------- 충돌 ----------
    const isWallAt = (x, z) => !isFloor(Math.floor(x / CS), Math.floor(z / CS));
    const obstacles = [];
    function collide(pos, r) {
      const ci = Math.floor(pos.x / CS), cj = Math.floor(pos.z / CS);
      for (let j = cj - 1; j <= cj + 1; j++) for (let i = ci - 1; i <= ci + 1; i++) {
        if (isFloor(i, j)) continue;
        const x0 = i * CS, x1 = x0 + CS, z0 = j * CS, z1 = z0 + CS;
        const cx = Math.max(x0, Math.min(pos.x, x1)), cz = Math.max(z0, Math.min(pos.z, z1));
        const dx = pos.x - cx, dz = pos.z - cz, d2 = dx * dx + dz * dz;
        if (d2 < r * r) {
          if (d2 > 1e-8) { const d = Math.sqrt(d2); pos.x += dx / d * (r - d); pos.z += dz / d * (r - d); }
          else { pos.x = (ci + .5) * CS; pos.z = (cj + .5) * CS; }
        }
      }
      for (const o of obstacles) {
        const dx = pos.x - o.x, dz = pos.z - o.z, d = Math.hypot(dx, dz), m = r + o.r;
        if (d < m && d > 1e-5) { pos.x += dx / d * (m - d); pos.z += dz / d * (m - d); }
      }
    }
    function los(ax, az, bx, bz) {
      const d = Math.hypot(bx - ax, bz - az), n = Math.ceil(d / .6);
      for (let s = 1; s < n; s++) { const t = s / n; if (isWallAt(ax + (bx - ax) * t, az + (bz - az) * t)) return false; }
      return true;
    }

    // ---------- 장식 ----------
    const decoMats = {
      rock: new THREE.MeshStandardMaterial({ color: T.rock, roughness: .95, flatShading: true, map: tex }),
      bone: new THREE.MeshStandardMaterial({ color: 0xd8d0bc, roughness: .8 }),
    };
    const rand = (a, b) => a + R() * (b - a);
    const cellC = (i, j) => new V3((i + .5) * CS, 0, (j + .5) * CS);
    const startW = cellC(start.x, start.z);
    const lightSpots = [];
    const glowPts = [], glowCols = [];
    // 산 · 마을 · 연구소 장식
    const B = Batch(), BG = Batch();
    const G_ = {
      cyl: geo('cyl', () => new THREE.CylinderGeometry(1, 1, 1, 8)), cyl6: geo('cyl6', () => new THREE.CylinderGeometry(1, 1, 1, 6)),
      cone: geo('cone', () => new THREE.ConeGeometry(1, 1, 7)), box: geo('box', () => new THREE.BoxGeometry(1, 1, 1)), ico: geo('ico', () => new THREE.IcosahedronGeometry(1, 0)),
    };
    const spot = (x, y, z, col) => { const v = new V3(x, y, z); v.col = col; lightSpots.push(v); return v; };
    const nightSky = sky && T.sky.star > .5;
    function decoOther(p, d, i, j) {
      if (K === 'mountain') {
        if ((d <= 2 && R() < .16) || (d >= 2 && R() < .025)) {
          const s = rand(.8, 1.7), green = (T.snow ? [0xc8d4dc, 0xa8b8bc, 0x6a8070, 0xdde6ea] : [0x2e4a2a, 0x36522c, 0x283f26, 0x3c5a30])[Math.floor(R() * 4)];
          B.add(G_.cyl6, p.x, .8 * s, p.z, { s: [.16 * s, 1.6 * s, .16 * s], c: 0x4a3424 });
          [[1.35, 2.2, 1.9], [1.05, 1.9, 2.9], [.72, 1.5, 3.8]].forEach(([r, h, y]) => B.add(G_.cone, p.x, y * s, p.z, { s: [r * s, h * s, r * s], ry: R() * 3, c: green }));
          obstacles.push({ x: p.x, z: p.z, r: .3 * s });
        } else if (R() < .04) {
          const r = rand(.4, 1.2); B.add(G_.ico, p.x, r * .35, p.z, { s: [r, r * .7, r], rx: R() * 3, ry: R() * 3, c: 0x7a7468 }); obstacles.push({ x: p.x, z: p.z, r: r * .75 });
        } else if (R() < .12) B.add(G_.ico, p.x + rand(-1, 1), .15, p.z + rand(-1, 1), { s: [rand(.3, .6), rand(.25, .4), rand(.3, .6)], ry: R() * 3, c: T.snow ? 0xc0ccd4 : 0x3e5a2c });
        for (let k = 0; k < 3; k++) if (R() < .35) B.add(G_.cone, p.x + rand(-1.4, 1.4), .12, p.z + rand(-1.4, 1.4), { s: [.06, .3, .06], c: T.snow ? 0xa8b4b0 : 0x5a7a36 });
        if (nightSky && R() < .2) glowPts.push(p.x + rand(-1.4, 1.4), rand(.4, 2.2), p.z + rand(-1.4, 1.4));
      } else if (K === 'village') {
        if (d === 1 && R() < .06) {
          B.add(G_.cyl, p.x, 1.8, p.z, { s: [.06, 3.6, .06], c: 0x24262a }); B.add(G_.box, p.x, 3.55, p.z, { s: [.34, .12, .34], c: 0x24262a });
          BG.add(G_.box, p.x, 3.4, p.z, { s: [.24, .2, .24], c: nightSky ? 0xffd090 : 0x807060 });
          if (nightSky) spot(p.x, 3.2, p.z, 0xffb060);
          obstacles.push({ x: p.x, z: p.z, r: .15 });
        } else if (d === 1 && R() < .08) {
          const rust = [0x6a4a30, 0x5a5a4a, 0x7a3a2a][Math.floor(R() * 3)];
          B.add(G_.cyl, p.x, .45, p.z, { s: [.32, .9, .32], c: rust }); if (R() < .5) B.add(G_.cyl, p.x + .7, .45, p.z + .2, { s: [.32, .9, .32], c: rust });
          obstacles.push({ x: p.x, z: p.z, r: .45 });
        } else if (d === 1 && R() < .07) {
          const s = rand(.6, 1); B.add(G_.box, p.x, s / 2, p.z, { s: [s, s, s], ry: R() * 3, c: 0x6a5434 }); if (R() < .4) B.add(G_.box, p.x + .1, s * 1.4, p.z, { s: [s * .8, s * .8, s * .8], ry: R() * 3, c: 0x7a6440 });
          obstacles.push({ x: p.x, z: p.z, r: s * .65 });
        } else if (d >= 2 && R() < .02) {
          const ry = R() * 3, col = [0x6a7a8a, 0x8a3a30, 0x4a5a3a, 0xa09060][Math.floor(R() * 4)], cx = Math.sin(ry), cz = Math.cos(ry);
          B.add(G_.box, p.x, .55, p.z, { s: [1.7, .7, 4], ry, c: col }); B.add(G_.box, p.x - cz * 0 + cx * -.3, 1.15, p.z + cz * -.3, { s: [1.5, .55, 2], ry, c: col });
          [[-.85, 1.3], [.85, 1.3], [-.85, -1.3], [.85, -1.3]].forEach(([a, b]) => B.add(G_.cyl, p.x + cz * a + cx * b, .32, p.z - cx * a + cz * b, { s: [.32, .2, .32], rz: Math.PI / 2, ry, c: 0x1a1a1a }));
          obstacles.push({ x: p.x + cx * 1.1, z: p.z + cz * 1.1, r: 1 }, { x: p.x - cx * 1.1, z: p.z - cz * 1.1, r: 1 });
        } else if (R() < .05) for (let k = 0; k < 4; k++) B.add(G_.ico, p.x + rand(-.8, .8), .1, p.z + rand(-.8, .8), { s: [rand(.15, .35), rand(.1, .25), rand(.15, .35)], ry: R() * 3, c: 0x7a7066 });
        if (nightSky && R() < .05) glowPts.push(p.x + rand(-1.4, 1.4), rand(.6, 2.5), p.z + rand(-1.4, 1.4));
      } else if (K === 'lab') {
        if (d === 1 && R() < .12) {
          if (R() < .5) { B.add(G_.box, p.x, 1, p.z, { s: [.8, 2, .55], c: 0x4a5a6a }); }
          else { B.add(G_.box, p.x, .5, p.z, { s: [1, 1, .6], c: 0x3a3e44 }); BG.add(G_.box, p.x, 1.05, p.z, { s: [.7, .1, .45], c: R() < .5 ? 0x40ff90 : 0x50a0ff }); }
          obstacles.push({ x: p.x, z: p.z, r: .5 });
        } else if (d >= 1 && R() < .05) {
          B.add(G_.box, p.x, .76, p.z, { s: [1.6, .06, .8], c: 0x8a8a84 }); [[-.7, -.33], [.7, -.33], [-.7, .33], [.7, .33]].forEach(([a, b]) => B.add(G_.box, p.x + a, .38, p.z + b, { s: [.05, .76, .05], c: 0x5a5a5a }));
          if (R() < .5) BG.add(G_.box, p.x + .3, .95, p.z, { s: [.4, .3, .03], c: 0x60c0ff });
          obstacles.push({ x: p.x, z: p.z, r: .7 });
        } else if (d >= 2 && R() < .03) {
          const broken = R() < .5;
          B.add(G_.cyl, p.x, .2, p.z, { s: [.75, .4, .75], c: 0x3a3e44 }); B.add(G_.cyl, p.x, 2.9, p.z, { s: [.75, .3, .75], c: 0x3a3e44 });
          if (!broken) BG.add(G_.cyl, p.x, 1.5, p.z, { s: [.6, 2.4, .6], c: 0x3a9a50 });
          else for (let k = 0; k < 5; k++) BG.add(G_.box, p.x + rand(-1, 1), .03, p.z + rand(-1, 1), { s: [rand(.1, .3), .02, rand(.1, .3)], ry: R() * 3, c: 0x6ab0a0 });
          spot(p.x, 1.4, p.z, broken ? 0x60ffa0 : 0x40ff80);
          obstacles.push({ x: p.x, z: p.z, r: .8 });
        } else if (R() < .05) { const s = rand(.5, .8); B.add(G_.box, p.x, s / 2, p.z, { s: [s, s, s], ry: R() * 3, c: 0x5a6040 }); obstacles.push({ x: p.x, z: p.z, r: s * .6 }); }
        if (d === 1 && R() < .3) B.add(G_.cyl, p.x, 3.55, p.z, { s: [.09, CS, .09], rz: Math.PI / 2, ry: (i + j) % 2 ? 0 : Math.PI / 2, c: 0x6a5a4a });
      }
    }
    for (let j = 0; j < N && !range; j++) for (let i = 0; i < N; i++) {
      if (!isFloor(i, j)) continue;
      const d = dw[j * N + i], p = cellC(i, j).add(new V3(rand(-1, 1), 0, rand(-1, 1)));
      if (p.distanceTo(startW) < 9) continue;
      const ch2 = ceilAt(p.x, p.z);
      if (!cave) { decoOther(p, d, i, j); continue; }
      if (d >= 2 && R() < .045) {
        const h = rand(1, 3.2), r = rand(.3, .65);
        const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), decoMats.rock); m.position.set(p.x, h / 2 - .1, p.z); m.castShadow = true; m.receiveShadow = true; group.add(m);
        obstacles.push({ x: p.x, z: p.z, r: r * .8 });
      }
      if (d >= 1 && R() < .09) {
        const h = rand(.6, 2.2), r = rand(.15, .45);
        const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 6), decoMats.rock); m.rotation.x = Math.PI; m.position.set(p.x + rand(-1, 1), ch2 - h / 2 + .3, p.z + rand(-1, 1)); group.add(m);
      }
      if (d === 1 && R() < .06) {
        const r = rand(.5, 1.1), m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), decoMats.rock);
        m.position.set(p.x, r * .4, p.z); m.rotation.set(R() * 3, R() * 3, R() * 3); m.castShadow = true; group.add(m);
        obstacles.push({ x: p.x, z: p.z, r: r * .75 });
      }
      if (T.crystal && d <= 1 && R() < .13) {
        const cm = new THREE.MeshStandardMaterial({ color: T.crystal, emissive: T.crystal, emissiveIntensity: .7, roughness: .15, metalness: .2, flatShading: true });
        const n = 3 + Math.floor(R() * 4);
        for (let k = 0; k < n; k++) { const s = rand(.15, .35), m = new THREE.Mesh(new THREE.OctahedronGeometry(s, 0), cm); m.scale.y = rand(2.5, 5); m.position.set(p.x + rand(-.6, .6), s * m.scale.y * .5, p.z + rand(-.6, .6)); m.rotation.set(rand(-.4, .4), R() * 3, rand(-.4, .4)); group.add(m); }
        lightSpots.push(p.clone().setY(1.2));
      }
      if (T.mush && d >= 1 && R() < .14) {
        const big = d >= 2 && R() < .25, s = big ? rand(1.6, 2.6) : rand(.3, .7);
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(.08 * s, .12 * s, s, 8), new THREE.MeshStandardMaterial({ color: 0xcfd8c8, roughness: .8 }));
        stem.position.set(p.x, s / 2, p.z); group.add(stem);
        const cap = new THREE.Mesh(new THREE.SphereGeometry(.4 * s, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x1fa088, emissive: 0x30f0d0, emissiveIntensity: .8, roughness: .5 }));
        cap.position.set(p.x, s, p.z); cap.scale.y = .6; group.add(cap);
        if (big) { obstacles.push({ x: p.x, z: p.z, r: .2 * s }); lightSpots.push(p.clone().setY(s)); }
      }
      if (T.deco === 'bones' && d <= 2 && R() < .05) {
        for (let k = 0; k < 4; k++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, rand(.3, .6), 5), decoMats.bone); b.rotation.set(Math.PI / 2, 0, R() * 3); b.position.set(p.x + rand(-.5, .5), .05, p.z + rand(-.5, .5)); group.add(b); }
        if (R() < .5) { const sk = new THREE.Mesh(new THREE.SphereGeometry(.13, 8, 6), decoMats.bone); sk.position.set(p.x, .1, p.z); sk.scale.set(1, .85, 1.2); group.add(sk); }
      }
      if (T.deco === 'eggs' && d <= 1 && R() < .1) {
        const em = new THREE.MeshStandardMaterial({ color: 0x7a2048, emissive: 0xff2a6a, emissiveIntensity: .45, roughness: .3, transparent: true, opacity: .9 });
        for (let k = 0; k < 4; k++) { const e = new THREE.Mesh(new THREE.SphereGeometry(rand(.2, .4), 10, 8), em); e.scale.y = 1.3; e.position.set(p.x + rand(-.6, .6), .25, p.z + rand(-.6, .6)); group.add(e); }
        if (R() < .4) lightSpots.push(p.clone().setY(.8));
      }
      if (T.water && d >= 1 && R() < .05) {
        const w = new THREE.Mesh(new THREE.CircleGeometry(rand(1, 2.2), 20), new THREE.MeshStandardMaterial({ color: 0x0a1a24, roughness: .05, metalness: .9 }));
        w.rotation.x = -Math.PI / 2; w.position.set(p.x, .03, p.z); group.add(w);
      }
      if (R() < .35) { glowPts.push(p.x + rand(-1.4, 1.4), ch2 - .4 - R() * .4, p.z + rand(-1.4, 1.4)); }
    }
    // 반딧불 같은 천장 빛벌레
    if (glowPts.length) {
      const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.Float32BufferAttribute(glowPts, 3));
      const gc = sky ? 0xd8ff70 : T.crystal || (T.lava ? 0xffa050 : 0x9adfff);
      const pts = new THREE.Points(pg, new THREE.PointsMaterial({ color: gc, size: sky ? .12 : .09, map: getGlow(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      group.add(pts);
    }
    { const m = B.mesh(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .85, flatShading: true }), true); if (m) { group.add(m); solids.push(m); } }
    { const m = BG.mesh(new THREE.MeshBasicMaterial({ vertexColors: true })); if (m) group.add(m); }
    // 용암 웅덩이 (밟으면 아프다)
    const hazards = [], lavaMats = [];
    if (T.lava) {
      rooms.forEach((r, idx) => {
        if (r.start || idx % 2) return;
        const c = cellC(r.x, r.z).add(new V3(rand(-2, 2), 0, rand(-2, 2)));
        const rad = rand(1.4, 2.6);
        const lm = new THREE.MeshStandardMaterial({ color: 0xff5010, emissive: 0xff5a10, emissiveIntensity: 1.2, roughness: .6 });
        const m = new THREE.Mesh(new THREE.CircleGeometry(rad, 24), lm); m.rotation.x = -Math.PI / 2; m.position.set(c.x, .06, c.z); group.add(m);
        hazards.push({ x: c.x, z: c.z, r: rad, dps: 12 }); lavaMats.push(lm); lightSpots.push(c.clone().setY(.8));
      });
    }

    // ---------- 조명 ----------
    const SK = sky ? T.sky : null;
    if (SK) {
      group.add(new THREE.HemisphereLight(SK.top, T.ground || 0x302820, SK.moon ? .55 : .75));
      group.add(new THREE.AmbientLight(SK.amb, SK.moon ? .25 : .3));
    } else {
      group.add(new THREE.HemisphereLight(T.amb, 0x050403, range ? .9 : K === 'lab' ? .7 : .55));
      group.add(new THREE.AmbientLight(T.amb, range ? .4 : K === 'lab' ? .2 : .12));
    }
    const lights = [];
    const spots = lightSpots.sort(() => R() - .5);
    const chosen = [];
    for (const s of spots) { if (chosen.length >= 6) break; if (chosen.every(o => o.distanceTo(s) > 14)) chosen.push(s); }
    if (K === 'lab') rooms.filter(r => !r.start).slice(0, Math.max(0, 7 - chosen.length)).forEach(r => chosen.push(spot((r.x + .5) * CS, 3.4, (r.z + .5) * CS, R() < .3 ? 0xff3020 : 0xdfe8ff)));
    if (cave && !T.crystal && !T.mush && !T.lava) {
      // 옛 탐험가가 남긴 등불
      rooms.filter(r => !r.start).slice(0, 4).forEach(r => {
        const c = cellC(r.x, r.z).add(new V3(1.2, 0, .8)); chosen.push(c.clone().setY(.6));
        const lp = new THREE.Mesh(new THREE.BoxGeometry(.18, .26, .18), new THREE.MeshStandardMaterial({ color: 0x302010, emissive: 0xffa040, emissiveIntensity: 1.4 }));
        lp.position.set(c.x, .13, c.z); group.add(lp);
      });
    }
    chosen.forEach(p => {
      const col = p.col || (T.lava ? 0xff6a20 : T.crystal || (T.mush ? 0x40ffd8 : 0xffa040));
      const l = new THREE.PointLight(col, T.lava ? 2.2 : p.col ? 1.4 : 1.6, p.col ? 18 : 16, 2); l.position.copy(p); group.add(l); lights.push(l);
      if (col === 0xff3020) l.userData.alarm = true;
    });
    // ---------- 하늘 (산 · 마을) ----------
    let skyGroup = null, sun = null;
    const fogColor = new THREE.Color(T.fog);
    if (SK) {
      skyGroup = new THREE.Group(); group.add(skyGroup);
      const top = new THREE.Color(SK.top).convertSRGBToLinear(), hor = new THREE.Color(SK.hor).convertSRGBToLinear();
      fogColor.copy(new THREE.Color(SK.fog).convertSRGBToLinear());
      const dg2 = new THREE.SphereGeometry(130, 24, 14), dc = [], pp = dg2.attributes.position;
      for (let i = 0; i < pp.count; i++) { const y = pp.getY(i) / 130, c = y > 0 ? hor.clone().lerp(top, Math.pow(y, .6)) : fogColor.clone().multiplyScalar(.7); dc.push(c.r, c.g, c.b); }
      dg2.setAttribute('color', new THREE.Float32BufferAttribute(dc, 3));
      const dome = new THREE.Mesh(dg2, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }));
      dome.renderOrder = -10; skyGroup.add(dome);
      // 해 · 달
      const sunDir = new V3(-.6, SK.sunY, .45).normalize();
      const disc = new THREE.Sprite(new THREE.SpriteMaterial({ map: getGlow(), color: SK.moon ? 0xdde8ff : SK.sun, fog: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending }));
      disc.position.copy(sunDir).multiplyScalar(110); disc.scale.setScalar(SK.moon ? 14 : 30); disc.renderOrder = -9; skyGroup.add(disc);
      // 별
      if (SK.star) {
        const sp = [];
        for (let i = 0; i < 700; i++) { const a = Math.random() * Math.PI * 2, y = .08 + Math.random() * .92, r = Math.sqrt(1 - y * y); sp.push(Math.cos(a) * r * 115, y * 115, Math.sin(a) * r * 115); }
        const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
        skyGroup.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 1.1, sizeAttenuation: false, fog: false, transparent: true, opacity: SK.star, depthWrite: false })));
      }
      // 멀리 보이는 산줄기
      const ring = [], rc = [], far1 = hor.clone().lerp(top, .55).multiplyScalar(SK.moon ? .5 : .62), far2 = far1.clone().multiplyScalar(.6);
      [[100, 26, far1, 1.3], [88, 17, far2, 2.1]].forEach(([rad, hh, col, sd]) => {
        const SEG = 90;
        for (let s = 0; s < SEG; s++) {
          const a0 = s / SEG * Math.PI * 2, a1 = (s + 1) / SEG * Math.PI * 2;
          const h0 = 4 + fbm(a0 * 3 + sd, sd, 1) * hh, h1 = 4 + fbm(a1 * 3 + sd, sd, 1) * hh;
          const P0 = [Math.cos(a0) * rad, -8, Math.sin(a0) * rad], P1 = [Math.cos(a1) * rad, -8, Math.sin(a1) * rad];
          const Q0 = [P0[0], h0, P0[2]], Q1 = [P1[0], h1, P1[2]];
          [P0, Q0, P1, P1, Q0, Q1].forEach(v => { ring.push(...v); rc.push(col.r, col.g, col.b); });
        }
      });
      const rg2 = new THREE.BufferGeometry(); rg2.setAttribute('position', new THREE.Float32BufferAttribute(ring, 3)); rg2.setAttribute('color', new THREE.Float32BufferAttribute(rc, 3));
      const rm = new THREE.Mesh(rg2, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, fog: false, depthWrite: false })); rm.renderOrder = -8; skyGroup.add(rm);
      // 햇빛 (그림자)
      sun = new THREE.DirectionalLight(SK.sun, SK.sunI);
      sun.userData.dir = sunDir;
      if (opts.shadows) { sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); const sc = sun.shadow.camera; sc.left = sc.bottom = -28; sc.right = sc.top = 28; sc.near = 1; sc.far = 120; sun.shadow.bias = -.0006; }
      group.add(sun); group.add(sun.target);
    }
    if (range) {
      for (let x = 10; x <= 70; x += 15) { const l = new THREE.PointLight(0xffe8c0, 1.6, 24, 2); l.position.set(x, 5.5, 33); group.add(l); }
    }

    // ---------- 캠프와 무전기 ----------
    const camp = new THREE.Group(); group.add(camp);
    const sw = startW.clone();
    const radioPos = sw.clone().add(new V3(-1.6, 0, 1.4));
    const crateM = new THREE.MeshStandardMaterial({ color: 0x5a4a30, roughness: .85 });
    const metalM = new THREE.MeshStandardMaterial({ color: 0x2a2d32, roughness: .5, metalness: .7 });
    const table = new THREE.Mesh(new THREE.BoxGeometry(1.2, .08, .7), crateM); table.position.set(radioPos.x, .78, radioPos.z); camp.add(table);
    [[-.5, -.28], [.5, -.28], [-.5, .28], [.5, .28]].forEach(([a, b]) => { const l = new THREE.Mesh(new THREE.BoxGeometry(.06, .78, .06), crateM); l.position.set(radioPos.x + a, .39, radioPos.z + b); camp.add(l); });
    const radio = new THREE.Mesh(new THREE.BoxGeometry(.5, .28, .3), new THREE.MeshStandardMaterial({ color: 0x3d4a2e, roughness: .7 })); radio.position.set(radioPos.x, .96, radioPos.z); camp.add(radio);
    const dial = new THREE.Mesh(new THREE.BoxGeometry(.2, .08, .01), new THREE.MeshBasicMaterial({ color: 0x9cff9c })); dial.position.set(radioPos.x, .99, radioPos.z + .156); camp.add(dial);
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(.008, .008, 1.4, 5), metalM); ant.position.set(radioPos.x + .2, 1.75, radioPos.z); camp.add(ant);
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(.045, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff3020 })); beacon.position.set(radioPos.x + .2, 2.46, radioPos.z); camp.add(beacon);
    const beaconGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: getGlow(), color: 0xff3020, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); beaconGlow.scale.setScalar(.8); beaconGlow.position.copy(beacon.position); camp.add(beaconGlow);
    for (let k = 0; k < 3; k++) { const cr = new THREE.Mesh(new THREE.BoxGeometry(.6, .5, .6), crateM); cr.position.set(sw.x + 1.4 + k * .1, .25 + (k === 2 ? .5 : 0), sw.z - 1.6 + (k === 1 ? .65 : 0)); cr.rotation.y = R(); camp.add(cr); }
    const tent = new THREE.Mesh(new THREE.ConeGeometry(1.3, 1.6, 4), new THREE.MeshStandardMaterial({ color: 0x8a6a30, roughness: .9, side: THREE.DoubleSide })); tent.position.set(sw.x - 2.2, .8, sw.z - 1.4); tent.rotation.y = .7; camp.add(tent);
    const lantern = new THREE.PointLight(0xffb060, 1.8, 14, 2); lantern.position.set(radioPos.x + .5, 1.3, radioPos.z); camp.add(lantern);
    const lm2 = new THREE.Mesh(new THREE.BoxGeometry(.12, .2, .12), new THREE.MeshStandardMaterial({ color: 0x302010, emissive: 0xffb060, emissiveIntensity: 1.6 })); lm2.position.set(radioPos.x + .45, .92, radioPos.z); camp.add(lm2);
    obstacles.push({ x: radioPos.x, z: radioPos.z, r: .6 }, { x: sw.x - 2.2, z: sw.z - 1.4, r: 1.1 });

    // ---------- 떠다니는 먼지 ----------
    const DN = 260, dpos = new Float32Array(DN * 3);
    for (let i = 0; i < DN; i++) { dpos[i * 3] = rand(-10, 10); dpos[i * 3 + 1] = rand(0, 5); dpos[i * 3 + 2] = rand(-10, 10); }
    const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
    const dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xd8d0c0, size: .03, transparent: true, opacity: .55, depthWrite: false, map: getGlow() }));
    group.add(dust);

    // ---------- 길찾기 (플레이어까지의 거리 지도) ----------
    const flow = new Int16Array(N * N).fill(-1);
    let flowCell = -1;
    function updateFlow(px, pz) {
      const ci = Math.floor(px / CS), cj = Math.floor(pz / CS), id = cj * N + ci;
      if (id === flowCell || !isFloor(ci, cj)) return; flowCell = id;
      flow.fill(-1); const qq = [id]; flow[id] = 0;
      for (let h = 0; h < qq.length; h++) {
        const c = qq[h], x = c % N, z = (c / N) | 0;
        for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) {
          if (!a && !b) continue; const xx = x + a, zz = z + b;
          if (!isFloor(xx, zz) || (a && b && (!isFloor(x + a, z) || !isFloor(x, z + b)))) continue;
          const n = zz * N + xx; if (flow[n] < 0) { flow[n] = flow[c] + 1; qq.push(n); }
        }
      }
    }
    function nextStep(x, z, out) {
      const ci = Math.floor(x / CS), cj = Math.floor(z / CS); let best = -1, bv = 1e9;
      for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) {
        const xx = ci + a, zz = cj + b; if (!isFloor(xx, zz)) continue;
        if (a && b && (!isFloor(ci + a, cj) || !isFloor(ci, cj + b))) continue;
        const f = flow[zz * N + xx]; if (f >= 0 && f < bv) { bv = f; best = zz * N + xx; }
      }
      if (best < 0) return false;
      out.set(((best % N) + .5) * CS, 0, (((best / N) | 0) + .5) * CS); return true;
    }
    function randomFloor(minDist, from) {
      for (let t = 0; t < 200; t++) {
        const i = 2 + Math.floor(Math.random() * (N - 4)), j = 2 + Math.floor(Math.random() * (N - 4));
        if (!isFloor(i, j) || dw[j * N + i] < 1) continue;
        const p = cellC(i, j); if (p.distanceTo(from || startW) < minDist) continue;
        return p;
      }
      return null;
    }

    const explored = new Uint8Array(N * N);
    let t = 0;
    function update(dt, cam) {
      t += dt;
      beacon.visible = beaconGlow.visible = Math.sin(t * 5) > 0;
      if (skyGroup) skyGroup.position.set(cam.x, 0, cam.z);
      if (sun) { sun.target.position.set(cam.x, 0, cam.z); sun.position.copy(sun.target.position).addScaledVector(sun.userData.dir, 60); }
      lights.forEach((l, i) => { if (l.userData.alarm) l.intensity = Math.sin(t * 4 + i) > 0 ? 1.6 : .15; });
      lavaMats.forEach((m, i) => m.emissiveIntensity = 1 + Math.sin(t * 2 + i) * .3);
      // 먼지가 카메라를 따라다니게
      const a = dg.attributes.position;
      for (let i = 0; i < DN; i++) {
        let x = a.array[i * 3], y = a.array[i * 3 + 1], z = a.array[i * 3 + 2];
        y += Math.sin(t * .5 + i) * .002; x += .002;
        if (x - cam.x > 10) x -= 20; if (x - cam.x < -10) x += 20;
        if (z - cam.z > 10) z -= 20; if (z - cam.z < -10) z += 20;
        a.array[i * 3] = x; a.array[i * 3 + 1] = y; a.array[i * 3 + 2] = z;
      }
      a.needsUpdate = true;
      const ci = Math.floor(cam.x / CS), cj = Math.floor(cam.z / CS);
      for (let b = -4; b <= 4; b++) for (let a2 = -4; a2 <= 4; a2++) { const xx = ci + a2, zz = cj + b; if (xx >= 0 && zz >= 0 && xx < N && zz < N && a2 * a2 + b * b <= 18) explored[zz * N + xx] = 1; }
    }

    return {
      N, CS, grid, rooms, theme: T, kind: K, sky, fogColor, group, solids, obstacles, hazards, lights, explored,
      start: startW.clone(), radio: radioPos, isFloor, isWallAt, collide, los, ceilAt, floorAt,
      cellC, updateFlow, nextStep, randomFloor, update, dw,
      deep: rooms.find(r => r.deep) || rooms[rooms.length - 1],
    };
  }

  return { build, CS, getGlow };
})();
