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
  const TEST = /[?&]nettest=1/.test(location.search);

  let peer = null, link = null, role = null, joinTimer = 0, beatTimer = 0, lastHeard = 0;
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

  // ---------- 시험용: 같은 브라우저 탭끼리 BroadcastChannel로 잇기 ----------
  function testPeer(id) {
    const me = id || 'g' + Math.random().toString(36).slice(2, 8);
    const ev = {}, on = (k, f) => { (ev[k] = ev[k] || []).push(f); }, emit = (k, v) => (ev[k] || []).forEach(f => f(v));
    const chans = [];
    const P = { id: me, on, destroy() { chans.forEach(c => c.close()); } };
    if (id) {
      const ch = new BroadcastChannel('nt-' + id); chans.push(ch);
      ch.onmessage = e => {
        if (e.data.hello) {
          const pair = new BroadcastChannel('nt-' + id + '-' + e.data.hello); chans.push(pair);
          const c = fakeConn(pair, 'h'); emit('connection', c); pair.postMessage({ from: 'h', open: 1 }); setTimeout(() => c._open(), 0);
        }
      };
    }
    P.connect = target => {
      const pair = new BroadcastChannel('nt-' + target + '-' + me); chans.push(pair);
      const c = fakeConn(pair, 'g');
      new BroadcastChannel('nt-' + target).postMessage({ hello: me });
      return c;
    };
    setTimeout(() => emit('open', me), 10);
    return P;
  }
  function fakeConn(ch, side) {
    const ev = {}, emit = (k, v) => (ev[k] || []).forEach(f => f(v));
    let open = false;
    const c = {
      on(k, f) { (ev[k] = ev[k] || []).push(f); },
      send(d) { ch.postMessage({ from: side, d }); },
      close() { ch.postMessage({ from: side, bye: 1 }); emit('close'); },
      _open() { if (!open) { open = true; emit('open'); } },
    };
    ch.onmessage = e => {
      const m = e.data; if (m.from === side) return;
      if (m.open) { ch.postMessage({ from: side, open: 1 }); c._open(); }
      else if (m.bye) emit('close');
      else if (m.d !== undefined) emit('data', m.d);
    };
    return c;
  }
  const newPeer = id => TEST ? testPeer(id) : (id ? new window.Peer(id) : new window.Peer());

  // ---------- 방 만들기 (방장) ----------
  function host() {
    leave(true);
    role = 'host'; set({ status: 'making', msg: '', friend: '' });
    loadLib(() => tryCode(0));
  }
  function tryCode(n) {
    if (role !== 'host') return;
    const code = String(1000 + Math.floor(Math.random() * 9000));
    const p = peer = newPeer(PREFIX + code);
    p.on('open', () => { if (peer === p) set({ status: 'waiting', code }); });
    p.on('connection', c => {
      if (link) { c.on('open', () => { c.send({ t: 'full' }); setTimeout(() => c.close(), 300); }); return; }
      attach(c);
    });
    p.on('error', e => {
      if (peer !== p) return;
      if (e && e.type === 'unavailable-id' && n < 5) { p.destroy(); tryCode(n + 1); return; }
      if (!link) fail(errText(e));
    });
    p.on('disconnected', () => { if (peer === p && !link && role === 'host') try { p.reconnect(); } catch (e) {} });
  }

  // ---------- 코드로 참가 (친구) ----------
  function join(code) {
    code = String(code || '').replace(/\D/g, '');
    if (code.length !== 4) { set({ status: 'off', msg: '방 코드 숫자 4개를 넣어 주세요.' }); return; }
    leave(true);
    role = 'guest'; set({ status: 'joining', code, msg: '', friend: '' });
    loadLib(() => {
      const p = peer = newPeer();
      p.on('open', () => {
        if (peer !== p) return;
        const c = p.connect(PREFIX + code, { reliable: true, serialization: 'json' });
        attach(c);
        clearTimeout(joinTimer);
        joinTimer = setTimeout(() => { if (st.status === 'joining') fail('방을 못 찾았어요. 코드가 맞는지, 친구가 방을 열어 두었는지 확인해 주세요.'); }, 12000);
      });
      p.on('error', e => { if (peer === p && st.status !== 'linked') fail(errText(e)); });
    });
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
      clearTimeout(joinTimer);
      link = c; lastHeard = performance.now();
      c.send({ t: 'hi', n: myName(), v: 1 });
      clearInterval(beatTimer);
      beatTimer = setInterval(() => {
        if (!link) return;
        send({ t: 'beat' });
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
    if (r === 'host' && peer) { set({ status: 'waiting', friend: '', msg }); }   // 방장은 방을 그대로 열어 둔다
    else { if (peer) try { peer.destroy(); } catch (e) {} peer = null; role = null; set({ status: 'off', friend: '', msg }); }
    if (was) onUnlink(r, msg);
  }
  function fail(msg) {
    clearTimeout(joinTimer);
    if (peer) try { peer.destroy(); } catch (e) {}
    peer = null; link = null; role = null; clearInterval(beatTimer);
    set({ status: 'off', code: '', friend: '', msg });
  }
  function leave(quiet) {
    clearTimeout(joinTimer); clearInterval(beatTimer);
    const was = st.status === 'linked', r = role;
    if (link) { try { link.send({ t: 'bye' }); } catch (e) {} const c = link; setTimeout(() => { try { c.close(); } catch (e) {} }, 200); }
    link = null;
    const p = peer; peer = null; if (p) setTimeout(() => { try { p.destroy(); } catch (e) {} }, 250);
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
  };
})();
