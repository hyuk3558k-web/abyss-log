'use strict';
// =====================================================================
//  친구와 함께 (파티): 두 컴퓨터를 인터넷으로 직접 잇는다 (PeerJS · WebRTC)
//  방장 = 방을 만든 사람. 괴물과 임무는 방장 컴퓨터가 맡고, 친구 컴퓨터는 받아서 보여 준다.
//  시험할 때는 ?nettest=1 을 붙이면 같은 브라우저의 두 탭끼리 이어진다 (인터넷 없이)
// =====================================================================
const NET = (() => {
  const GAME_ID = typeof SAVE_ID !== 'undefined' ? SAVE_ID : 'abyssLog_v1';
  const PREFIX = 'abysslog-' + GAME_ID.replace(/[^a-zA-Z0-9]/g, '') + '-';
  const LIB = 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';
  // 직접 연결(WebRTC)이 공유기·방화벽에 막히면 중계 서버(MQTT)를 거쳐서 잇는다
  const MQTT_LIB = 'https://unpkg.com/mqtt@5.10.1/dist/mqtt.min.js';
  const BROKERS = ['wss://broker.emqx.io:8084/mqtt', 'wss://broker.hivemq.com:8884/mqtt'];
  const TEST = /[?&]nettest=1/.test(location.search);
  const ONLY_RELAY = /[?&]relay=1/.test(location.search); // 시험용: 처음부터 중계로

  let peer = null, link = null, role = null, joinTimer = 0, beatTimer = 0, lastHeard = 0, isRelay = false;
  const st = { status: 'off', code: '', friend: '', msg: '' }; // off · making · waiting · joining · linked
  const subs = [];
  let onData = () => {}, onLink = () => {}, onUnlink = () => {};

  function set(o) { Object.assign(st, o); subs.forEach(f => { try { f(st); } catch (e) { console.error(e); } }); }
  function myName() { const n = (GAME.SAVE.nick || '').trim(); return n || '탐사대원'; }

  // ---------- PeerJS 불러오기 (파티를 누를 때만) ----------
  function loadLib(cb) {
    if (TEST || window.Peer) return cb();
    const s = document.createElement('script'); s.src = LIB;
    s.onload = cb;
    s.onerror = () => fail('파티 프로그램을 못 불러왔어요. 인터넷이 연결됐는지 확인해 주세요.');
    document.head.appendChild(s);
  }

  // ---------- 중계 연결 ----------
  // 시험(nettest)일 때는 같은 브라우저 탭끼리 BroadcastChannel, 진짜일 때는 중계 서버(MQTT)를 쓴다.
  // 둘 다 "채널 이름으로 말 보내기 · 받기"라서 똑같이 다룬다.
  let mq = null, mqWait = [];
  const mqSubs = {};
  function loadMqtt(cb) {
    if (window.mqtt) return cb();
    const s = document.createElement('script'); s.src = MQTT_LIB;
    s.onload = () => cb(); s.onerror = () => cb(new Error('lib'));
    document.head.appendChild(s);
  }
  function mqttReady(cb, k = 0) {
    if (mq && mq.connected) return cb();
    mqWait.push(cb);
    if (mq) return;
    loadMqtt(err => {
      if (err || !window.mqtt) { const w = mqWait; mqWait = []; w.forEach(f => f(new Error('lib'))); return; }
      const c = mq = window.mqtt.connect(BROKERS[k % BROKERS.length], { clientId: 'abyss' + Math.random().toString(36).slice(2, 10), clean: true, connectTimeout: 7000, reconnectPeriod: 2000 });
      let first = true;
      c.on('connect', () => { if (!first) return; first = false; const w = mqWait; mqWait = []; w.forEach(f => f()); });
      c.on('message', (topic, buf) => { const f = mqSubs[topic]; if (f) { try { f(JSON.parse(buf.toString())); } catch (e) {} } });
      c.on('error', () => {});
      // 첫 서버가 안 되면 다른 서버로
      setTimeout(() => { if (first && mq === c) { try { c.end(true); } catch (e) {} mq = null; const w = mqWait; mqWait = []; if (k < BROKERS.length - 1) w.forEach(f => mqttReady(f, k + 1)); else w.forEach(f => f(new Error('broker'))); } }, 8000);
    });
  }
  function chan(name) {
    if (TEST) { const b = new BroadcastChannel('nt-' + name); return { post: d => b.postMessage(d), set on(f) { b.onmessage = e => f(e.data); }, close: () => b.close() }; }
    const topic = 'abysslog/v1/' + name;
    const ch = { post: d => { if (mq) mq.publish(topic, JSON.stringify(d)); }, set on(f) { mqSubs[topic] = f; if (mq) mq.subscribe(topic); }, close: () => { delete mqSubs[topic]; if (mq) try { mq.unsubscribe(topic); } catch (e) {} } };
    return ch;
  }
  function relayPeer(id) {
    const me = id || 'g' + Math.random().toString(36).slice(2, 10);
    const ev = {}, on = (k, f) => { (ev[k] = ev[k] || []).push(f); }, emit = (k, v) => (ev[k] || []).forEach(f => f(v));
    const chans = [];
    const P = { id: me, on, relay: true, destroy() { chans.forEach(c => c.close()); } };
    const ready = cb => TEST ? setTimeout(cb, 10) : mqttReady(cb);
    ready(err => {
      if (err) { emit('error', { type: 'relay-failed' }); return; }
      if (id) {
        const ch = chan(id); chans.push(ch);
        const seen = {};
        ch.on = m => {
          if (!m.hello || seen[m.hello]) return; seen[m.hello] = 1;
          const pair = chan(id + '-' + m.hello); chans.push(pair);
          const c = fakeConn(pair, 'h'); emit('connection', c);
          setTimeout(() => { pair.post({ from: 'h', open: 1 }); c._open(); }, TEST ? 0 : 500); // 받을 준비가 된 뒤에
        };
      }
      emit('open', me);
    });
    P.connect = target => {
      const pair = chan(target + '-' + me); chans.push(pair);
      const c = fakeConn(pair, 'g');
      const hi = chan(target); chans.push(hi);
      // 방장이 못 받았을 수도 있으니 연결될 때까지 몇 번 다시 인사한다
      let n = 0; const say = () => { if (c._isOpen() || n++ > 8) return; hi.post({ hello: me }); setTimeout(say, 1000); };
      setTimeout(say, 300);
      return c;
    };
    return P;
  }
  const testPeer = relayPeer;
  function fakeConn(ch, side) {
    const ev = {}, emit = (k, v) => (ev[k] || []).forEach(f => f(v));
    let open = false;
    const c = {
      on(k, f) { (ev[k] = ev[k] || []).push(f); },
      send(d) { ch.post({ from: side, d }); },
      close() { ch.post({ from: side, bye: 1 }); emit('close'); },
      _open() { if (!open) { open = true; emit('open'); } },
      _isOpen: () => open,
    };
    ch.on = m => {
      if (m.from === side) return;
      if (m.open) { if (!open) ch.post({ from: side, open: 1 }); c._open(); }
      else if (m.bye) emit('close');
      else if (m.d !== undefined) emit('data', m.d);
    };
    return c;
  }
  const DIRECT = !TEST && !ONLY_RELAY; // 직접 연결을 먼저 해 볼지
  let relay = null;                    // 중계 연결 (peer와 따로)
  function killPeers() {
    if (peer) try { peer.destroy(); } catch (e) {}
    if (relay) try { relay.destroy(); } catch (e) {}
    peer = relay = null;
  }

  // ---------- 방 만들기 (방장) ----------
  // 직접 연결과 중계 연결 두 가지로 동시에 친구를 기다린다
  function host() {
    leave(true);
    role = 'host'; set({ status: 'making', msg: '', friend: '' });
    if (DIRECT) loadLib(() => tryCode(0)); else openRelay(String(1000 + Math.floor(Math.random() * 9000)));
  }
  function onConn(c) {
    if (link) { c.on('open', () => { c.send({ t: 'full' }); setTimeout(() => c.close(), 300); }); return; }
    attach(c);
  }
  function tryCode(n) {
    if (role !== 'host') return;
    const code = String(1000 + Math.floor(Math.random() * 9000));
    let p;
    try { p = peer = new window.Peer(PREFIX + code); } catch (e) { openRelay(code); return; }
    p.on('open', () => { if (peer === p) openRelay(code); });
    p.on('connection', onConn);
    p.on('error', e => {
      if (peer !== p) return;
      if (e && e.type === 'unavailable-id' && n < 5) { p.destroy(); tryCode(n + 1); return; }
      // 직접 연결 서버가 안 되면 중계만으로라도 방을 연다
      if (!relay && st.status === 'making') { peer = null; try { p.destroy(); } catch (x) {} openRelay(code); }
    });
    p.on('disconnected', () => { if (peer === p && !link && role === 'host') try { p.reconnect(); } catch (e) {} });
  }
  function openRelay(code) {
    if (role !== 'host' || relay) return;
    const r = relay = relayPeer(PREFIX + code);
    r.on('open', () => { if (relay === r) set({ status: 'waiting', code }); });
    r.on('connection', onConn);
    r.on('error', () => {
      if (relay !== r) return;
      relay = null;
      if (peer) set({ status: 'waiting', code }); // 직접 연결은 되니까 그걸로
      else fail('파티 서버에 연결하지 못했어요. 인터넷을 확인하고 다시 해 봐요.');
    });
  }

  // ---------- 코드로 참가 (친구) ----------
  // 먼저 직접 연결을 해 보고, 6초 안에 안 되면 중계 서버로 다시 해 본다
  function join(code) {
    code = String(code || '').replace(/\D/g, '');
    if (code.length !== 4) { set({ status: 'off', msg: '방 코드 숫자 4개를 넣어 주세요.' }); return; }
    leave(true);
    role = 'guest'; set({ status: 'joining', code, msg: '', friend: '' });
    if (!DIRECT) { joinRelay(code); return; }
    loadLib(() => {
      if (role !== 'guest') return;
      let p;
      try { p = peer = new window.Peer(); } catch (e) { joinRelay(code); return; }
      p.on('open', () => {
        if (peer !== p) return;
        attach(p.connect(PREFIX + code, { reliable: true, serialization: 'json' }));
      });
      p.on('error', () => { if (peer === p && st.status !== 'linked') joinRelay(code); });
      clearTimeout(joinTimer);
      joinTimer = setTimeout(() => { if (st.status === 'joining') joinRelay(code); }, 6000);
    });
  }
  function joinRelay(code) {
    if (role !== 'guest' || relay || st.status === 'linked') return;
    set({ status: 'joining', code, msg: '' });
    const r = relay = relayPeer();
    r.on('open', () => { if (relay === r) attach(r.connect(PREFIX + code)); });
    r.on('error', () => { if (relay === r && st.status !== 'linked') fail('파티 서버에 연결하지 못했어요. 인터넷을 확인하고 다시 해 봐요.'); });
    clearTimeout(joinTimer);
    joinTimer = setTimeout(() => { if (st.status === 'joining') fail('방을 못 찾았어요. 코드 숫자가 맞는지, 친구가 같은 편(1편/2편)에서 방을 열어 두었는지 확인해 주세요.'); }, 14000);
  }
  function errText(e) {
    const t = e && e.type;
    if (t === 'peer-unavailable') return '그 코드의 방이 없어요. 코드를 다시 확인해 주세요.';
    if (t === 'network' || t === 'server-error' || t === 'socket-error' || t === 'socket-closed') return '파티 서버에 연결하지 못했어요. 인터넷을 확인하고 다시 해 봐요.';
    if (t === 'browser-incompatible') return '이 브라우저는 파티를 지원하지 않아요. 크롬이나 엣지로 해 봐요.';
    return '연결에 문제가 생겼어요. 다시 해 봐요. (' + (t || e) + ')';
  }

  // ---------- 연결 하나 붙이기 ----------
  function attach(c) {
    c.on('open', () => {
      if (link && link !== c) { try { c.close(); } catch (e) {} return; } // 다른 길로 이미 연결됐다
      clearTimeout(joinTimer);
      link = c; lastHeard = performance.now();
      isRelay = !!c.send && !!c._isOpen;
      c.send({ t: 'hi', n: myName(), v: 1 });
      clearInterval(beatTimer);
      beatTimer = setInterval(() => {
        if (!link) return;
        send(st.status === 'linked' ? { t: 'beat' } : { t: 'hi', n: myName(), v: 1 }); // 인사가 사라졌으면 다시
        // 7초 동안 아무 소식이 없으면 끊긴 걸로 본다 (창을 그냥 닫았을 때)
        if (performance.now() - lastHeard > 7000) drop('친구와 연결이 끊겼어요.');
      }, 1000);
    });
    c.on('data', d => {
      if (c !== link || !d) return;
      lastHeard = performance.now();
      if (d.t === 'beat') return;
      if (d.t === 'full') { fail('그 방은 이미 두 명이 꽉 찼어요.'); return; }
      if (d.t === 'hi') {
        const was = st.status === 'linked';
        if (was && !d.r) c.send({ t: 'hi', n: myName(), v: 1, r: 1 }); // 친구가 내 인사를 못 받았나 보다
        set({ status: 'linked', friend: String(d.n || '친구').slice(0, 12), msg: '' });
        if (!was) onLink(role);
        return;
      }
      if (d.t === 'bye') { drop(role === 'guest' ? '방장이 파티를 끝냈어요.' : '친구가 파티에서 나갔어요.'); return; }
      try { onData(d); } catch (e) { console.error(e); }
    });
    c.on('close', () => { if (c === link) drop(role === 'guest' ? '방장과 연결이 끊겼어요.' : '친구와 연결이 끊겼어요.'); });
    c.on('error', () => { if (c === link) drop('연결에 문제가 생겼어요.'); });
  }
  function drop(msg) {
    const was = st.status === 'linked', r = role;
    const c = link; link = null;
    clearInterval(beatTimer);
    if (c) try { c.close(); } catch (e) {}
    if (r === 'host' && (peer || relay)) { set({ status: 'waiting', friend: '', msg }); }   // 방장은 방을 그대로 열어 둔다
    else { killPeers(); role = null; set({ status: 'off', friend: '', msg }); }
    if (was) onUnlink(r, msg);
  }
  function fail(msg) {
    clearTimeout(joinTimer);
    killPeers();
    link = null; role = null; clearInterval(beatTimer);
    set({ status: 'off', code: '', friend: '', msg });
  }
  function leave(quiet) {
    clearTimeout(joinTimer); clearInterval(beatTimer);
    const was = st.status === 'linked', r = role;
    if (link) { try { link.send({ t: 'bye' }); } catch (e) {} const c = link; setTimeout(() => { try { c.close(); } catch (e) {} }, 200); }
    link = null;
    const p = peer, q = relay; peer = relay = null; setTimeout(() => { [p, q].forEach(x => { if (x) try { x.destroy(); } catch (e) {} }); }, 250);
    role = null;
    if (!quiet || st.status !== 'off') set({ status: 'off', code: '', friend: '', msg: '' });
    if (was) onUnlink(r, '');
  }
  function send(d) { if (link) try { link.send(d); } catch (e) {} }

  addEventListener('pagehide', () => { if (link) try { link.send({ t: 'bye' }); } catch (e) {} });

  return {
    host, join, leave, send,
    bind(h) { onData = h.data || onData; onLink = h.link || onLink; onUnlink = h.unlink || onUnlink; },
    watch(f) { subs.push(f); },
    get st() { return st; },
    get on() { return st.status === 'linked'; },
    get isHost() { return st.status === 'linked' && role === 'host'; },
    get isGuest() { return st.status === 'linked' && role === 'guest'; },
    get role() { return role; },
    get relay() { return isRelay; }, // 중계 서버로 이어졌는지 (그러면 조금 덜 자주 보낸다)
  };
})();
