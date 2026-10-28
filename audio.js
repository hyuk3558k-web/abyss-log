'use strict';
// =====================================================================
//  소리: 모든 소리를 코드로 직접 만든다 (동굴 메아리 포함)
// =====================================================================
const AU = (() => {
  let ctx = null, master, dry, conv, wetGain, noiseBuf, amb = null, spinNode = null;
  let lx = 0, lz = 0, lyaw = 0, volume = .8, dripT = 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = volume;
      const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 5;
      master.connect(comp); comp.connect(ctx.destination);
      dry = ctx.createGain(); dry.connect(master);
      conv = ctx.createConvolver(); conv.buffer = impulse(2.6, 2.4);
      wetGain = ctx.createGain(); wetGain.gain.value = .55; conv.connect(wetGain); wetGain.connect(master);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) { ctx = null; }
  }
  function impulse(sec, decay) {
    const len = Math.floor(ctx.sampleRate * sec), b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = b.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay) * (i < 400 ? i / 400 : 1);
    }
    return b;
  }
  // 소리가 나가는 통로 (볼륨, 좌우, 메아리 양)
  function bus(gain, pan = 0, wet = .3) {
    const g = ctx.createGain(); g.gain.value = gain;
    let node = g;
    if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); g.connect(p); node = p; }
    node.connect(dry);
    if (wet > 0) { const s = ctx.createGain(); s.gain.value = wet; node.connect(s); s.connect(conv); }
    return g;
  }
  function nz(dest, t, dur, f, q, type, gain, f2) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const fl = ctx.createBiquadFilter(); fl.type = type || 'lowpass'; fl.frequency.setValueAtTime(f, t); fl.Q.value = q || .7;
    if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.0008, t + dur);
    s.connect(fl); fl.connect(g); g.connect(dest); s.start(t, Math.random() * 1.5); s.stop(t + dur + .05);
  }
  function tn(dest, t, f0, f1, dur, gain, type, attack) {
    const o = ctx.createOscillator(); o.type = type || 'sine';
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    const g = ctx.createGain();
    if (attack) { g.gain.setValueAtTime(.0008, t); g.gain.exponentialRampToValueAtTime(gain, t + attack); }
    else g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(.0008, t + dur);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + .05);
  }
  const now = () => ctx.currentTime;

  function spatial(x, z, range = 45) {
    const dx = x - lx, dz = z - lz, d = Math.hypot(dx, dz);
    const sy = Math.sin(lyaw), cy = Math.cos(lyaw);
    const right = dx * cy - dz * sy;
    const g = Math.pow(clamp(1 - d / range, 0, 1), 1.6);
    return { g, pan: d > .5 ? clamp(right / d, -1, 1) * .8 : 0, d };
  }

  // ---------- 총소리 ----------
  function shot(st, cal, k = 1, pan = 0) { // k·pan: 친구 총소리는 멀수록 작게
    if (!ctx) return;
    const t = now(), d = st.dmg * st.pellets;
    if (st.ex) { const b = bus(.9 * k, pan, .5); tn(b, t, 120, 45, .25, .8, 'sine'); nz(b, t, .3, 800, .6, 'lowpass', .6); return; }
    const low = clamp(150 - d * .4, 45, 140), crack = clamp(5200 - d * 18, 1300, 5200), len = clamp(.07 + d / 650, .07, .45);
    if (st.sup) {
      const b = bus(.45 * k, pan, .12);
      nz(b, t, .09, 1400, .8, 'lowpass', .6); tn(b, t, 300, 120, .05, .25, 'triangle'); nz(b, t + .01, .05, 4000, 2, 'bandpass', .15);
      return;
    }
    const g = clamp(.45 + d / 220, .45, 1.1);
    const b = bus(g * k, pan, .6);
    nz(b, t, len * .6, crack, .5, 'lowpass', .9);
    nz(b, t, len, 600, .7, 'lowpass', .7, 120);
    tn(b, t, low * 2, low * .5, len * .8, .9, 'sine');
    nz(b, t, .02, 7000, .5, 'highpass', .5);
    if (st.pellets > 1) nz(b, t, len * 1.4, 300, .5, 'lowpass', .7);
  }
  function dry_click(b, t, f, g) { tn(b, t, f, f * .7, .025, g, 'square'); nz(b, t, .03, f * 2, 3, 'bandpass', g * 1.5); }

  // ---------- 장전 · 기계 소리 ----------
  const MECH = {
    magOut(b, t) { dry_click(b, t, 900, .12); nz(b, t + .02, .12, 2500, 1, 'bandpass', .18, 900); },
    magIn(b, t) { nz(b, t, .08, 1800, 1, 'bandpass', .2); dry_click(b, t + .07, 1300, .2); dry_click(b, t + .1, 800, .15); },
    slide(b, t) { nz(b, t, .1, 3000, 1.5, 'bandpass', .22, 1500); dry_click(b, t + .09, 1100, .2); },
    bolt(b, t) { nz(b, t, .09, 2200, 1.2, 'bandpass', .25, 900); dry_click(b, t + .08, 700, .22); },
    boltUp(b, t) { dry_click(b, t, 1500, .12); },
    charge(b, t) { nz(b, t, .12, 2600, 1.2, 'bandpass', .22, 1200); dry_click(b, t + .12, 900, .25); dry_click(b, t + .16, 600, .2); },
    shell(b, t) { nz(b, t, .06, 1600, 1, 'bandpass', .2); dry_click(b, t + .05, 700, .15); tn(b, t + .05, 180, 120, .05, .12, 'sine'); },
    pump(b, t) { nz(b, t, .1, 1800, 1, 'bandpass', .3, 900); dry_click(b, t + .09, 600, .25); nz(b, t + .18, .08, 2200, 1, 'bandpass', .28); dry_click(b, t + .25, 900, .25); },
    lever(b, t) { dry_click(b, t, 800, .2); nz(b, t + .02, .1, 2000, 1, 'bandpass', .2); dry_click(b, t + .2, 1100, .22); },
    cylOpen(b, t) { dry_click(b, t, 1600, .15); nz(b, t, .06, 3500, 2, 'bandpass', .12); },
    cylClose(b, t) { dry_click(b, t, 1200, .25); dry_click(b, t + .03, 2200, .1); },
    cyl(b, t) { dry_click(b, t, 2400, .08); },
    hammer(b, t) { dry_click(b, t, 1900, .14); dry_click(b, t + .05, 2600, .08); },
    casing(b, t) { for (let i = 0; i < 3; i++) tn(b, t + .18 + i * .07 + Math.random() * .03, 3800 + Math.random() * 1500, 3500, .06, .05 / (i + 1), 'sine'); },
    shellDrop(b, t) { tn(b, t + .2, 260, 200, .06, .1, 'triangle'); tn(b, t + .3, 300, 240, .05, .05, 'triangle'); },
    ping(b, t) { tn(b, t, 2750, 2700, .9, .28, 'sine'); tn(b, t, 4120, 4100, .6, .12, 'sine'); tn(b, t, 6900, 6800, .3, .05, 'sine'); },
    cover(b, t) { dry_click(b, t, 700, .25); nz(b, t, .08, 1400, 1, 'bandpass', .2); },
    belt(b, t) { for (let i = 0; i < 5; i++) dry_click(b, t + i * .04, 2000 + Math.random() * 800, .06); },
    empty(b, t) { dry_click(b, t, 1700, .12); },
    swap(b, t) { nz(b, t, .15, 1800, 1, 'bandpass', .18, 900); dry_click(b, t + .14, 1000, .12); },
    clip(b, t) { nz(b, t, .12, 2500, 1.2, 'bandpass', .25, 1000); dry_click(b, t + .12, 800, .25); },
    rocket(b, t) { nz(b, t, .2, 900, 1, 'bandpass', .2, 500); dry_click(b, t + .2, 500, .3); },
    break(b, t) { dry_click(b, t, 900, .25); tn(b, t, 400, 300, .05, .15, 'triangle'); },
  };
  function mech(name) { if (!ctx || !MECH[name]) return; MECH[name](bus(1, 0, .08), now()); }

  // ---------- 미니건 회전음 ----------
  function spin(level) {
    if (!ctx) return;
    if (level <= .01) { if (spinNode) { spinNode.g.gain.setTargetAtTime(0, now(), .1); const n = spinNode; setTimeout(() => { try { n.o.stop(); } catch (e) {} }, 500); spinNode = null; } return; }
    if (!spinNode) {
      const o = ctx.createOscillator(); o.type = 'sawtooth';
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900;
      const g = ctx.createGain(); g.gain.value = 0;
      o.connect(f); f.connect(g); g.connect(dry); o.start();
      spinNode = { o, g };
    }
    spinNode.o.frequency.setTargetAtTime(60 + level * 220, now(), .05);
    spinNode.g.gain.setTargetAtTime(.08 + level * .06, now(), .05);
  }

  // ---------- 괴생명체 목소리 ----------
  const VOICE = {
    tick(b, t, k) {
      const n = k === 'die' ? 8 : k === 'alert' ? 6 : 3;
      for (let i = 0; i < n; i++) tn(b, t + i * .045, 1800 + Math.random() * 900, 1500, .03, .2, 'square');
      if (k === 'die') nz(b, t, .25, 900, 1, 'lowpass', .4);
    },
    bat(b, t, k) {
      tn(b, t, 3200, k === 'attack' ? 6000 : 4800, .12, .2, 'sine');
      tn(b, t + .08, 4400, 3000, .1, .14, 'triangle');
      if (k === 'die') tn(b, t + .1, 3000, 900, .4, .2, 'sawtooth');
    },
    spider(b, t, k) {
      nz(b, t, k === 'attack' ? .25 : .45, 4000, .8, 'highpass', .3);
      for (let i = 0; i < 5; i++) tn(b, t + i * .03, 900, 700, .02, .1, 'square');
      if (k === 'die') nz(b, t, .6, 1200, 1, 'lowpass', .5, 200);
    },
    stalker(b, t, k) {
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(k === 'attack' ? 140 : 75, t);
      o.frequency.linearRampToValueAtTime(k === 'die' ? 40 : 95, t + .6);
      const l = ctx.createOscillator(); l.frequency.value = 18; const lg = ctx.createGain(); lg.gain.value = 20; l.connect(lg); lg.connect(o.frequency);
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 700;
      const g = ctx.createGain(); g.gain.setValueAtTime(.001, t); g.gain.exponentialRampToValueAtTime(.45, t + .08); g.gain.exponentialRampToValueAtTime(.001, t + .8);
      o.connect(f); f.connect(g); g.connect(b); o.start(t); l.start(t); o.stop(t + .85); l.stop(t + .85);
      nz(b, t, .5, 600, 1, 'bandpass', .2);
    },
    golem(b, t, k) {
      nz(b, t, k === 'attack' ? .6 : 1, 180, .8, 'lowpass', .7);
      tn(b, t, 55, 35, .8, .5, 'sine');
      if (k !== 'idle') for (let i = 0; i < 4; i++) nz(b, t + Math.random() * .4, .05, 2000, 2, 'bandpass', .25);
    },
    queen(b, t, k) {
      [70, 73.5, 105, 141].forEach((f, i) => tn(b, t, f * (k === 'attack' ? 1.5 : 1), f * .7, 1.6, .22 - i * .03, 'sawtooth', .15));
      nz(b, t, 1.4, 900, .7, 'lowpass', .4, 200);
    },
  };
  function voice(sp, kind, x, z) {
    if (!ctx) return;
    if (!VOICE[sp] && SPECIES[sp] && SPECIES[sp].base) sp = SPECIES[sp].base;
    if (!VOICE[sp]) return;
    const s = spatial(x, z, sp === 'queen' ? 90 : 42); if (s.g < .02) return;
    VOICE[sp](bus(s.g * .9, s.pan, .5), now(), kind);
  }

  // ---------- 효과음 ----------
  const FX = {
    hitFlesh(b, t) { nz(b, t, .08, 700, 1, 'lowpass', .5); tn(b, t, 160, 70, .06, .3, 'sine'); },
    hitWeak(b, t) { nz(b, t, .1, 900, 1, 'lowpass', .5); tn(b, t, 1800, 2600, .06, .15, 'square'); },
    hitRock(b, t) { nz(b, t, .06, 3500, 1, 'bandpass', .25); tn(b, t, 1200 + Math.random() * 800, 700, .03, .08, 'triangle'); },
    kill(b, t) { nz(b, t, .3, 500, 1, 'lowpass', .5, 120); tn(b, t, 900, 1800, .08, .1, 'square'); },
    explosion(b, t) { nz(b, t, 1.4, 800, .6, 'lowpass', 1.2, 60); tn(b, t, 90, 25, 1, .9, 'sine'); nz(b, t, .2, 4000, .5, 'highpass', .4); },
    hurt(b, t) { nz(b, t, .2, 500, 1, 'lowpass', .5); tn(b, t, 220, 110, .18, .25, 'sawtooth'); },
    step(b, t) { nz(b, t, .07, 500 + Math.random() * 300, 1, 'lowpass', .18); nz(b, t, .04, 3000, 2, 'bandpass', .04); },
    land(b, t) { nz(b, t, .15, 300, 1, 'lowpass', .4); },
    scan(b, t) { tn(b, t, 1400, 1400, .05, .07, 'sine'); },
    scanDone(b, t) { tn(b, t, 880, 880, .1, .15, 'sine'); tn(b, t + .1, 1320, 1320, .18, .15, 'sine'); },
    sample(b, t) { nz(b, t, .2, 600, 2, 'bandpass', .3); tn(b, t + .15, 1046, 1046, .15, .12, 'triangle'); tn(b, t + .25, 1568, 1568, .25, .12, 'triangle'); },
    money(b, t) { tn(b, t, 1568, 1568, .08, .08, 'square'); tn(b, t + .06, 2093, 2093, .12, .08, 'square'); },
    radio(b, t) { nz(b, t, .25, 2500, .7, 'bandpass', .15); tn(b, t + .22, 1200, 1200, .06, .08, 'square'); },
    ui(b, t) { tn(b, t, 900, 1200, .04, .08, 'triangle'); },
    buy(b, t) { [523, 659, 784, 1046].forEach((f, i) => tn(b, t + i * .07, f, f, .2, .12, 'triangle')); },
    denied(b, t) { tn(b, t, 200, 150, .2, .15, 'square'); },
    heal(b, t) { tn(b, t, 600, 900, .3, .06, 'sine'); },
    spit(b, t) { nz(b, t, .15, 1500, 1, 'bandpass', .3, 600); },
    lavaThrow(b, t) { nz(b, t, .4, 400, 1, 'lowpass', .5); },
    slam(b, t) { nz(b, t, .6, 250, .8, 'lowpass', .9); tn(b, t, 70, 30, .5, .7, 'sine'); },
    newspaper(b, t) { nz(b, t, .3, 3000, .5, 'highpass', .12, 6000); },
    kill(b, t) { tn(b, t, 220, 55, .22, .4, 'sine'); nz(b, t, .1, 2200, 1.2, 'bandpass', .22); tn(b, t + .03, 1400, 900, .08, .08, 'triangle'); },
    chapter(b, t) { [392, 523, 659, 784].forEach((f, i) => tn(b, t + i * .14, f, f, .5, .1, 'triangle', .02)); },
  };
  function fx(name, x, z, vol = 1) {
    if (!ctx || !FX[name]) return;
    let g = vol, pan = 0;
    if (x !== undefined) { const s = spatial(x, z); g *= s.g; pan = s.pan; if (g < .02) return; }
    FX[name](bus(g, pan, name === 'explosion' ? .7 : .25), now());
  }

  // ---------- 동굴 배경음 ----------
  function ambient(theme) {
    stopAmbient(); if (!ctx) return;
    const out = ctx.createGain(); out.gain.value = 0; out.connect(master);
    out.gain.setTargetAtTime(.5, now(), 1.5);
    const nodes = [];
    [41, 41.6, 62].forEach((f, i) => {
      const o = ctx.createOscillator(); o.type = i === 2 ? 'triangle' : 'sine'; o.frequency.value = f * (theme && theme.lava ? .8 : 1);
      const g = ctx.createGain(); g.gain.value = i === 2 ? .03 : .09; o.connect(g); g.connect(out); o.start(); nodes.push(o);
    });
    const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 300; f.Q.value = .6;
    const lfo = ctx.createOscillator(); lfo.frequency.value = .07; const lg = ctx.createGain(); lg.gain.value = 180; lfo.connect(lg); lg.connect(f.frequency);
    const g = ctx.createGain(); g.gain.value = theme && theme.lava ? .09 : .05;
    s.connect(f); f.connect(g); g.connect(out); s.start(); lfo.start(); nodes.push(s, lfo);
    amb = { out, nodes, theme };
  }
  function stopAmbient() {
    if (!amb) return; const a = amb; amb = null;
    a.out.gain.setTargetAtTime(0, now(), .3);
    setTimeout(() => a.nodes.forEach(n => { try { n.stop(); } catch (e) {} }), 1200);
  }
  function tick(dt) {
    if (!ctx || !amb) return;
    dripT -= dt;
    if (dripT <= 0) {
      dripT = 1.5 + Math.random() * 4;
      const b = bus(.12 + Math.random() * .12, Math.random() * 1.6 - .8, .9), t = now(), f = 900 + Math.random() * 900;
      if (amb.theme && amb.theme.lava) nz(b, t, .3, 500, 1, 'lowpass', .5);
      else tn(b, t, f * 1.6, f, .07, .3, 'sine');
    }
  }

  return {
    init, shot, mech, spin, voice, fx, ambient, stopAmbient, tick,
    get on() { return !!ctx; },
    setListener(x, z, yaw) { lx = x; lz = z; lyaw = yaw; },
    setVolume(v) { volume = v; if (master) master.gain.value = v; },
    mechAt(name, delay) { if (!ctx || !MECH[name]) return; MECH[name](bus(1, 0, .08), now() + (delay || 0)); },
  };
})();
