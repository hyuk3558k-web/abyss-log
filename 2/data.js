'use strict';
// =====================================================================
//  심연 탐사록 - 게임 데이터 (총, 탄약, 개조, 괴생명체, 이야기)
// =====================================================================

const NATIONS = { US: '미국', RU: '러시아', DE: '독일', AT: '오스트리아', IT: '이탈리아', BE: '벨기에', CH: '스위스', CZ: '체코', IL: '이스라엘', UK: '영국', FR: '프랑스', CN: '중국', JP: '일본', KR: '대한민국', BR: '브라질', CA: '캐나다', SG: '싱가포르', ZA: '남아공' };

// 탄약: d=한 발 위력, r=반동, rg=유효 사거리(m), pen=관통 수, pel=산탄 알 수, ex=폭발 반경
const CAL = {
  '22lr': { n: '.22 LR', d: 14, r: .25, rg: 25 },
  '380': { n: '.380 ACP', d: 18, r: .45, rg: 20 },
  '9x18': { n: '9×18mm', d: 21, r: .5, rg: 22 },
  '8nambu': { n: '8mm 남부', d: 19, r: .45, rg: 22 },
  '763m': { n: '7.63mm 마우저', d: 24, r: .55, rg: 30 },
  '9mm': { n: '9mm 파라벨럼', d: 24, r: .6, rg: 25 },
  '762tok': { n: '7.62×25mm', d: 26, r: .65, rg: 30, pen: 1 },
  '45acp': { n: '.45 ACP', d: 31, r: .85, rg: 22 },
  '57': { n: '5.7×28mm', d: 23, r: .45, rg: 35, pen: 1 },
  '46': { n: '4.6×30mm', d: 22, r: .4, rg: 35, pen: 1 },
  '38': { n: '.38 스페셜', d: 30, r: .8, rg: 25 },
  '357': { n: '.357 매그넘', d: 42, r: 1.3, rg: 35 },
  '44mag': { n: '.44 매그넘', d: 56, r: 1.8, rg: 40 },
  '45lc': { n: '.45 롱 콜트', d: 44, r: 1.4, rg: 30 },
  '762nag': { n: '7.62mm 나강', d: 30, r: .8, rg: 25 },
  '455': { n: '.455 웨블리', d: 40, r: 1.2, rg: 28 },
  '50ae': { n: '.50 AE', d: 62, r: 2.2, rg: 40 },
  '500sw': { n: '.500 S&W 매그넘', d: 90, r: 3.0, rg: 45, pen: 1 },
  '545': { n: '5.45×39mm', d: 30, r: .55, rg: 60 },
  '556': { n: '5.56×45mm NATO', d: 32, r: .6, rg: 65 },
  '58': { n: '5.8×42mm', d: 31, r: .6, rg: 60 },
  '473': { n: '4.73mm 무탄피', d: 28, r: .4, rg: 60 },
  '300blk': { n: '.300 블랙아웃', d: 36, r: .75, rg: 50 },
  '762x39': { n: '7.62×39mm', d: 38, r: .9, rg: 55 },
  '792k': { n: '7.92×33mm 쿠르츠', d: 38, r: .9, rg: 50 },
  '9x39': { n: '9×39mm 아음속', d: 42, r: .8, rg: 45, pen: 1 },
  '30car': { n: '.30 카빈', d: 30, r: .6, rg: 45 },
  '762n': { n: '7.62×51mm NATO', d: 50, r: 1.4, rg: 90, pen: 1 },
  '762r': { n: '7.62×54mmR', d: 54, r: 1.5, rg: 90, pen: 1 },
  '3006': { n: '.30-06 스프링필드', d: 56, r: 1.6, rg: 95, pen: 1 },
  '792': { n: '7.92×57mm 마우저', d: 57, r: 1.6, rg: 95, pen: 1 },
  '303': { n: '.303 브리티시', d: 52, r: 1.4, rg: 90, pen: 1 },
  '77ari': { n: '7.7mm 아리사카', d: 52, r: 1.5, rg: 90, pen: 1 },
  '4440': { n: '.44-40 윈체스터', d: 40, r: 1.0, rg: 40 },
  '4570': { n: '.45-70 정부탄', d: 78, r: 2.4, rg: 60, pen: 1 },
  '577': { n: '.577/450 마티니', d: 80, r: 2.6, rg: 60, pen: 1 },
  '338': { n: '.338 라푸아 매그넘', d: 130, r: 2.6, rg: 150, pen: 2 },
  '408': { n: '.408 샤이택', d: 160, r: 3.0, rg: 180, pen: 2 },
  '50bmg': { n: '.50 BMG', d: 200, r: 3.4, rg: 200, pen: 3 },
  '12ga': { n: '12게이지 산탄', d: 14, r: 2.0, rg: 14, pel: 9 },
  '40mm': { n: '40mm 유탄', d: 240, r: 1.8, rg: 60, ex: 4.5 },
  'rkt': { n: 'PG-7 로켓', d: 420, r: 2.0, rg: 80, ex: 6 },
};

// 종류별 기본 성질
const CATS = [
  { k: 'pistol', n: '권총', spread: .02, ads: .3, kick: 1.0, rg: 1, move: 1.0, adsT: .14 },
  { k: 'revolver', n: '리볼버', spread: .022, ads: .25, kick: 1.0, rg: 1.1, move: 1.0, adsT: .16 },
  { k: 'smg', n: '기관단총', spread: .028, ads: .32, kick: .45, rg: 1, move: .97, adsT: .16 },
  { k: 'ar', n: '돌격소총', spread: .02, ads: .22, kick: .55, rg: 1, move: .92, adsT: .2 },
  { k: 'br', n: '전투·지정사수 소총', spread: .018, ads: .15, kick: .6, rg: 1, move: .9, adsT: .22 },
  { k: 'sniper', n: '저격·볼트·레버', spread: .03, ads: .03, kick: .6, rg: 1, move: .88, adsT: .26 },
  { k: 'shotgun', n: '산탄총', spread: .075, ads: .75, kick: .5, rg: 1, move: .92, adsT: .2 },
  { k: 'lmg', n: '기관총', spread: .035, ads: .3, kick: .45, rg: 1, move: .8, adsT: .3 },
  { k: 'special', n: '특수 화기', spread: .02, ads: .5, kick: .8, rg: 1, move: .82, adsT: .25 },
];
const CAT = {}; CATS.forEach(c => CAT[c.k] = c);

// ---------------------------------------------------------------------
//  총 목록
//  G(아이디, 이름, 종류, 탄약, 발사방식, 분당발사수, 탄창, 장전시간, 장전동작, 가격, 나라, 연도, 모양, 설명, 특징)
//  발사방식: semi 반자동 / auto 자동 / b3 3점사 / b2 2점사 / pump 펌프 / bolt 볼트 / lever 레버 / single 단발 / sa 싱글액션 / da 더블액션
//  탄을 한 발씩 넣는 장전(gate, shell, lever, boltLoad)은 장전시간이 '한 발당' 시간이에요.
// ---------------------------------------------------------------------
const GUNS = [];
function G(id, name, cat, cal, mode, rpm, mag, rld, rt, price, nat, year, m, note, x) {
  GUNS.push({ id, name, cat, cal, mode, rpm, mag, rld, rt, price, nat, year, m: m || {}, note: note || '', x: x || {} });
}

// ---- 권총 ----
G('glock17', 'Glock 17', 'pistol', '9mm', 'semi', 450, 17, 1.45, 'pistol', 0, 'AT', 1982, { c: 'blk' }, '폴리머 몸통이라 가볍고 고장이 거의 없어요. 탐험가의 첫 파트너.');
G('glock19', 'Glock 19', 'pistol', '9mm', 'semi', 450, 15, 1.35, 'pistol', 600, 'AT', 1988, { c: 'blk', L: .17 }, '17보다 짧아서 꺼내고 겨누는 속도가 빨라요.', { ads: 1.2 });
G('glock18', 'Glock 18C', 'pistol', '9mm', 'auto', 1200, 33, 1.6, 'pistol', 4200, 'AT', 1986, { c: 'blk', ext: 1 }, '권총인데 기관총처럼 연사돼요. 33발 탄창도 순식간에 비어요.', { rec: 1.3 });
G('m1911', 'Colt M1911', 'pistol', '45acp', 'semi', 380, 7, 1.5, 'pistol', 900, 'US', 1911, { c: 'st', L: .21 }, '100년 넘게 쓰인 전설의 권총. 한 발 한 발이 묵직해요.');
G('m9', 'Beretta M9', 'pistol', '9mm', 'semi', 420, 15, 1.5, 'pistol', 800, 'IT', 1985, { c: 'blk', L: .21, k: 'beretta' }, '윗부분이 뚫린 슬라이드가 특징. 탄창이 넉넉해요.');
G('b93r', 'Beretta 93R', 'pistol', '9mm', 'b3', 1100, 20, 1.6, 'pistol', 3500, 'IT', 1979, { c: 'blk', L: .23, k: 'beretta', fg: 1, ext: 1 }, '방아쇠 한 번에 3발! 앞 손잡이를 잡고 쏘는 점사 권총.');
G('deagle', 'Desert Eagle .50', 'pistol', '50ae', 'semi', 220, 7, 1.9, 'pistol', 5200, 'IL', 1983, { c: 'ch', L: .26, k: 'deagle' }, '권총 중 최강급 위력. 반동도 엄청나서 두 손으로 꽉!');
G('p226', 'SIG P226', 'pistol', '9mm', 'semi', 430, 15, 1.45, 'pistol', 1100, 'CH', 1984, { c: 'blk', L: .2 }, '정밀하고 튼튼해서 특수부대가 사랑한 권총.', { acc: .85 });
G('p320', 'SIG P320', 'pistol', '9mm', 'semi', 450, 17, 1.4, 'pistol', 1300, 'CH', 2014, { c: 'tan', L: .2 }, '부품을 바꿔 끼우는 모듈식 권총. 반동이 부드러워요.', { rec: .85 });
G('usp', 'H&K USP .45', 'pistol', '45acp', 'semi', 400, 12, 1.55, 'pistol', 1500, 'DE', 1993, { c: 'blk', L: .21 }, '.45탄을 쓰면서도 12발이나 들어가는 튼튼한 권총.');
G('ppk', 'Walther PPK', 'pistol', '380', 'semi', 480, 7, 1.3, 'pistol', 500, 'DE', 1931, { c: 'st', L: .155 }, '작고 우아한 비밀요원의 권총. 위력은 약하지만 빨라요.', { ads: 1.3 });
G('p99', 'Walther P99', 'pistol', '9mm', 'semi', 450, 15, 1.4, 'pistol', 900, 'DE', 1997, { c: 'blk', L: .18 }, '손 크기에 맞게 손잡이 뒤판을 바꿀 수 있는 독일 권총.');
G('fiveseven', 'FN Five-seveN', 'pistol', '57', 'semi', 480, 20, 1.5, 'pistol', 2400, 'BE', 1998, { c: 'od', L: .2 }, '작고 빠른 탄이 괴물의 단단한 껍질을 뚫어요.');
G('cz75', 'CZ 75', 'pistol', '9mm', 'semi', 440, 16, 1.45, 'pistol', 1000, 'CZ', 1975, { c: 'blk', L: .2 }, '손에 착 감기는 체코의 명작. 정확도가 좋아요.', { acc: .8 });
G('makarov', 'Makarov PM', 'pistol', '9x18', 'semi', 400, 8, 1.4, 'pistol', 300, 'RU', 1951, { c: 'st', L: .16 }, '소련의 단순하고 튼튼한 권총.');
G('tt33', 'Tokarev TT-33', 'pistol', '762tok', 'semi', 400, 8, 1.45, 'pistol', 450, 'RU', 1933, { c: 'st', L: .19 }, '빠른 탄 덕분에 작은 권총치고 관통력이 좋아요.');
G('luger', 'Luger P08', 'pistol', '9mm', 'semi', 380, 8, 1.7, 'pistol', 2000, 'DE', 1908, { c: 'st', L: .22, k: 'luger' }, '쏠 때마다 위쪽 토글이 자벌레처럼 꺾여 올라가요.');
G('hipower', 'Browning Hi-Power', 'pistol', '9mm', 'semi', 420, 13, 1.45, 'pistol', 1100, 'BE', 1935, { c: 'st', L: .2 }, '처음으로 13발이나 들어갔던 대용량 탄창 권총.');
G('c96', 'Mauser C96', 'pistol', '763m', 'semi', 400, 10, 2.4, 'c96', 2600, 'DE', 1896, { c: 'st', L: .29, k: 'c96' }, '‘빗자루 손잡이’ 권총. 위에서 클립으로 10발을 밀어 넣어요.');
G('qsz92', 'QSZ-92', 'pistol', '9mm', 'semi', 440, 15, 1.45, 'pistol', 800, 'CN', 1998, { c: 'blk', L: .19 }, '중국군의 표준 권총.');
G('nambu', 'Nambu Type 14', 'pistol', '8nambu', 'semi', 350, 8, 1.6, 'pistol', 700, 'JP', 1925, { c: 'st', L: .23, k: 'luger' }, '일본의 옛 권총. 가늘고 긴 총열이 특징이에요.');
G('mp9mm', 'S&W M&P9', 'pistol', '9mm', 'semi', 450, 17, 1.4, 'pistol', 1000, 'US', 2005, { c: 'blk', L: .19 }, '미국 경찰이 많이 쓰는 튼튼한 권총.');
G('ruger22', 'Ruger Mk IV', 'pistol', '22lr', 'semi', 520, 10, 1.35, 'pistol', 250, 'US', 2016, { c: 'st', L: .24, k: 'ruger' }, '가장 약하지만 반동이 거의 없어 연습용으로 최고.', { rec: .4, acc: .7 });
G('vp9', 'H&K VP9', 'pistol', '9mm', 'semi', 460, 17, 1.4, 'pistol', 1200, 'DE', 2014, { c: 'blk', L: .19 }, '방아쇠가 가볍고 정확한 최신 권총.', { acc: .85 });
G('jericho', 'IWI Jericho 941', 'pistol', '9mm', 'semi', 430, 16, 1.45, 'pistol', 1000, 'IL', 1990, { c: 'blk', L: .2 }, 'CZ 75를 바탕으로 만든 이스라엘 권총.');
G('k5', 'Daewoo K5', 'pistol', '9mm', 'semi', 450, 13, 1.4, 'pistol', 900, 'KR', 1989, { c: 'blk', L: .19 }, '대한민국 국군의 권총! 첫 발을 빠르게 쏠 수 있어요.', { ads: 1.15 });

// ---- 리볼버 ----
G('saa', 'Colt Single Action Army', 'revolver', '45lc', 'sa', 140, 6, .55, 'gate', 1600, 'US', 1873, { c: 'st', B: .14, k: 'saa' }, '서부 시대의 총. 공이치기를 젖히고, 한 발씩 넣는 장전이 멋있어요.');
G('m29', 'S&W Model 29', 'revolver', '44mag', 'da', 170, 6, 2.3, 'revolver', 3000, 'US', 1955, { c: 'blk', B: .16 }, '‘세상에서 가장 강한 권총’으로 유명했던 리볼버.');
G('m500', 'S&W Model 500', 'revolver', '500sw', 'da', 100, 5, 2.6, 'revolver', 6500, 'US', 2003, { c: 'ch', B: .2, big: 1 }, '괴물 사냥용 권총. 한 발이면 웬만한 괴물이 쓰러져요.');
G('python', 'Colt Python', 'revolver', '357', 'da', 190, 6, 2.2, 'revolver', 2800, 'US', 1955, { c: 'st', B: .15, rib: 1 }, '방아쇠가 버터처럼 부드러운 리볼버의 명품.', { acc: .75 });
G('gp100', 'Ruger GP100', 'revolver', '357', 'da', 190, 6, 2.2, 'revolver', 1800, 'US', 1985, { c: 'ch', B: .11 }, '튼튼해서 매그넘 탄을 계속 쏴도 끄떡없어요.');
G('rhino', 'Chiappa Rhino', 'revolver', '357', 'da', 200, 6, 2.1, 'revolver', 3200, 'IT', 2009, { c: 'blk', B: .1, k: 'rhino' }, '총열이 아래에 있어서 반동이 손으로 곧장 와 덜 튀어요.', { rec: .55 });
G('nagant', 'Nagant M1895', 'revolver', '762nag', 'da', 150, 7, .5, 'gate', 900, 'RU', 1895, { c: 'st', B: .11 }, '탄을 앞으로 밀어 틈을 막는 특이한 리볼버. 7발이 들어가요.');
G('webley', 'Webley Mk VI', 'revolver', '455', 'da', 170, 6, 2.0, 'webley', 1500, 'UK', 1915, { c: 'st', B: .15, k: 'webley' }, '총이 반으로 꺾이며 탄피 6개가 한꺼번에 튀어나와요.');
G('redhawk', 'Ruger Super Redhawk', 'revolver', '44mag', 'da', 170, 6, 2.3, 'revolver', 3400, 'US', 1987, { c: 'ch', B: .19 }, '조준경도 달 수 있는 사냥용 대형 리볼버.', { scopeOk: 1 });
G('ragingbull', 'Taurus Raging Bull', 'revolver', '44mag', 'da', 180, 5, 2.3, 'revolver', 3600, 'BR', 1997, { c: 'blk', B: .17, rib: 1 }, '총열 위의 구멍들이 반동을 줄여 줘요.', { rec: .8 });
G('mateba', 'Mateba 6 Unica', 'revolver', '357', 'semi', 320, 6, 2.2, 'revolver', 4500, 'IT', 1997, { c: 'st', B: .15, k: 'rhino' }, '쏠 때마다 몸통이 미끄러져 다음 발을 준비하는 ‘자동 리볼버’.', { rec: .7 });
G('m10', 'S&W Model 10', 'revolver', '38', 'da', 200, 6, 2.0, 'revolver', 1000, 'US', 1899, { c: 'blk', B: .1 }, '100년 넘게 경찰이 쓴 기본 리볼버. 반동이 순해요.');

// ---- 기관단총 ----
G('mp5', 'H&K MP5A3', 'smg', '9mm', 'auto', 800, 30, 2.1, 'hk', 3200, 'DE', 1966, { L: .3, B: .06, mg: 'curvedS', st: 'fixed', h: 'round' }, '정확하고 다루기 쉬운 기관단총의 대명사. 철컥 하고 장전 손잡이를 내려쳐요.', { acc: .8 });
G('mp5sd', 'H&K MP5SD', 'smg', '9mm', 'auto', 700, 30, 2.2, 'hk', 4200, 'DE', 1974, { L: .3, B: .16, mg: 'curvedS', st: 'fixed', h: 'sd' }, '총열 전체가 소음기! 괴물이 총소리를 거의 못 들어요.', { sup: 1 });
G('mp7', 'H&K MP7', 'smg', '46', 'auto', 950, 40, 2.0, 'grip', 4800, 'DE', 2001, { L: .24, B: .05, mg: 'grip', st: 'wire', rail: 1 }, '작은 탄이 빠르게 날아가 껍질을 뚫는 개인 방어 화기.');
G('ump45', 'H&K UMP45', 'smg', '45acp', 'auto', 600, 25, 2.1, 'hk', 3400, 'DE', 1999, { L: .32, B: .04, mg: 'straight', st: 'fold', h: 'box' }, '느리지만 한 발 한 발이 센 .45 기관단총.');
G('p90', 'FN P90', 'smg', '57', 'auto', 900, 50, 2.6, 'p90', 5500, 'BE', 1990, { k: 'p90' }, '위에 얹는 50발 탄창! 미래에서 온 것 같은 모양.');
G('uzi', 'IMI Uzi', 'smg', '9mm', 'auto', 600, 32, 2.0, 'grip', 2200, 'IL', 1954, { L: .26, B: .06, mg: 'grip', st: 'fold', k: 'uzi' }, '손잡이 안에 탄창이 들어가는 튼튼한 기관단총.');
G('microuzi', 'Micro Uzi', 'smg', '9mm', 'auto', 1250, 20, 1.8, 'grip', 2600, 'IL', 1984, { L: .2, B: .03, mg: 'grip', st: 'none', k: 'uzi' }, '작은 몸집으로 엄청나게 빠르게 연사해요.', { rec: 1.3 });
G('mac10', 'MAC-10', 'smg', '45acp', 'auto', 1100, 30, 1.9, 'grip', 2000, 'US', 1970, { L: .2, B: .04, mg: 'grip', st: 'none', k: 'mac' }, '작은 상자 같은 몸통에서 미친 듯이 연사해요.', { rec: 1.4, acc: 1.3 });
G('vector', 'KRISS Vector', 'smg', '45acp', 'auto', 1200, 25, 2.0, 'grip', 7200, 'US', 2009, { k: 'vector' }, '반동을 아래로 꺾는 장치 덕분에 연사해도 총이 거의 안 튀어요.', { rec: .45 });
G('thompson', 'Thompson M1928', 'smg', '45acp', 'auto', 700, 50, 3.2, 'drum', 4600, 'US', 1928, { L: .36, B: .12, mg: 'drum', st: 'wood', c: 'wood', h: 'none', fg: 1, k: 'tommy' }, '‘토미건’. 둥근 드럼 탄창에 50발이 들어가요.');
G('mp40', 'MP40', 'smg', '9mm', 'auto', 550, 32, 2.2, 'rifle', 2400, 'DE', 1940, { L: .3, B: .1, mg: 'straight', st: 'fold', c: 'st' }, '느린 연사 덕분에 다루기 쉬운 옛 기관단총.', { rec: .8 });
G('ppsh', 'PPSh-41', 'smg', '762tok', 'auto', 1000, 71, 3.4, 'drum', 3800, 'RU', 1941, { L: .36, B: .1, mg: 'drum', st: 'wood', c: 'wood', h: 'shroud' }, '71발 드럼 탄창으로 끝없이 쏴요.');
G('sten', 'Sten Mk II', 'smg', '9mm', 'auto', 550, 32, 2.2, 'side', 1200, 'UK', 1941, { L: .3, B: .08, mg: 'side', st: 'wire', c: 'st', h: 'shroud' }, '옆으로 꽂는 탄창, 쇠파이프 같은 단순한 구조.');
G('skorpion', 'Skorpion vz. 61', 'smg', '380', 'auto', 850, 20, 1.9, 'rifle', 1700, 'CZ', 1961, { L: .22, B: .04, mg: 'curvedS', st: 'wire', c: 'st' }, '권총만큼 작은 체코의 기관단총.');
G('bizon', 'PP-19 Bizon', 'smg', '9x18', 'auto', 700, 64, 2.8, 'helical', 3300, 'RU', 1996, { L: .32, B: .06, mg: 'helical', st: 'fold', c: 'blk' }, '총열 아래 원통 모양 탄창에 64발!');
G('evo3', 'CZ Scorpion EVO 3', 'smg', '9mm', 'auto', 1150, 30, 2.0, 'rifle', 3600, 'CZ', 2009, { L: .3, B: .05, mg: 'straight', st: 'fold', rail: 1 }, '빠른 연사와 가벼운 몸통의 현대 기관단총.');
G('mpx', 'SIG MPX', 'smg', '9mm', 'auto', 850, 30, 1.9, 'rifle', 4300, 'US', 2013, { L: .3, B: .08, mg: 'straight', st: 'fold', h: 'rail', rail: 1 }, '소총처럼 다루기 편한 고급 기관단총.', { acc: .8, rec: .85 });
G('sterling', 'Sterling L2A3', 'smg', '9mm', 'auto', 550, 34, 2.2, 'side', 1800, 'UK', 1953, { L: .3, B: .1, mg: 'side', st: 'fold', h: 'shroud', c: 'blk' }, '옆으로 꽂는 휜 탄창이 특징인 영국 기관단총.');
G('m3', 'M3 Grease Gun', 'smg', '45acp', 'auto', 450, 30, 2.2, 'rifle', 1600, 'US', 1942, { L: .28, B: .08, mg: 'straight', st: 'wire', c: 'st' }, '기름총처럼 생겼지만 묵직한 한 방.', { rec: .8 });
G('pp2000', 'PP-2000', 'smg', '9mm', 'auto', 700, 44, 2.0, 'grip', 2700, 'RU', 2006, { L: .23, B: .04, mg: 'grip', st: 'none', k: 'mac' }, '손잡이에 44발 긴 탄창을 꽂아요.');
G('type100', 'Type 100', 'smg', '8nambu', 'auto', 450, 30, 2.2, 'side', 1500, 'JP', 1942, { L: .33, B: .1, mg: 'side', st: 'wood', c: 'wood', h: 'shroud' }, '옆으로 탄창을 꽂는 일본의 옛 기관단총.', { rec: .7 });
G('k7', 'Daewoo K7', 'smg', '9mm', 'auto', 900, 30, 2.0, 'rifle', 4500, 'KR', 2003, { L: .3, B: .16, mg: 'straight', st: 'fold', h: 'sd' }, '대한민국 특수부대의 소음 기관단총!', { sup: 1 });
G('tmp', 'Steyr TMP', 'smg', '9mm', 'auto', 900, 30, 1.9, 'grip', 2500, 'AT', 1992, { L: .22, B: .04, mg: 'grip', st: 'none', fg: 1, k: 'mac' }, '앞 손잡이가 달린 작은 기관권총.');
G('mp9', 'B&T MP9', 'smg', '9mm', 'auto', 1000, 30, 1.9, 'grip', 3000, 'CH', 2001, { L: .24, B: .04, mg: 'grip', st: 'fold', fg: 1, k: 'mac' }, '접히는 개머리판과 앞 손잡이가 달린 작은 기관단총.');

// ---- 돌격소총 ----
G('ak47', 'AK-47', 'ar', '762x39', 'auto', 600, 30, 2.5, 'ak', 5000, 'RU', 1949, { k: 'ak', c: 'wood' }, '진흙에 빠져도 쏘아지는, 세계에서 가장 많이 만들어진 소총.');
G('akm', 'AKM', 'ar', '762x39', 'auto', 600, 30, 2.4, 'ak', 5400, 'RU', 1959, { k: 'ak', c: 'wood', brake: 1 }, 'AK-47을 가볍게 다듬은 버전. 총구가 덜 튀어요.', { rec: .9 });
G('ak74', 'AK-74', 'ar', '545', 'auto', 650, 30, 2.4, 'ak', 5800, 'RU', 1974, { k: 'ak', c: 'blk', brake: 1 }, '작은 탄으로 반동이 크게 줄어든 AK.', { rec: .8 });
G('ak12', 'AK-12', 'ar', '545', 'auto', 700, 30, 2.3, 'ak', 8200, 'RU', 2018, { k: 'ak', c: 'blk', rail: 1, brake: 1, st: 'fixed' }, '레일을 단 현대식 AK. 정확도가 좋아졌어요.', { acc: .8, rec: .8 });
G('ak105', 'AK-105', 'ar', '545', 'auto', 650, 30, 2.3, 'ak', 7000, 'RU', 2001, { k: 'ak', c: 'blk', B: .16, brake: 1 }, '짧은 총열의 AK. 좁은 동굴에 좋아요.', { ads: 1.1 });
G('type56', 'Type 56', 'ar', '762x39', 'auto', 650, 30, 2.5, 'ak', 4600, 'CN', 1956, { k: 'ak', c: 'wood', bay: 1 }, '중국에서 만든 AK. 총검이 접혀 붙어 있어요.');
G('m16a1', 'M16A1', 'ar', '556', 'auto', 750, 20, 2.3, 'rifle', 5200, 'US', 1967, { carry: 1, h: 'round', c: 'blk' }, '손잡이 겸 가늠자가 달린 초기 M16.');
G('m16a4', 'M16A4', 'ar', '556', 'b3', 800, 30, 2.3, 'rifle', 6000, 'US', 1997, { h: 'rail', rail: 1, B: .3 }, '3발씩 끊어 쏘는 정확한 소총.', { acc: .75 });
G('m4a1', 'M4A1', 'ar', '556', 'auto', 800, 30, 2.2, 'rifle', 6800, 'US', 1994, { h: 'rail', rail: 1, st: 'fixed' }, '짧고 가벼워 동굴 같은 좁은 곳에서도 좋아요.');
G('commando', 'Colt Commando', 'ar', '556', 'auto', 850, 30, 2.2, 'rifle', 6200, 'US', 1966, { h: 'round', carry: 1, B: .11 }, '아주 짧게 줄인 M16. 빠르게 휘두를 수 있어요.', { ads: 1.15, acc: 1.1 });
G('hk416', 'HK416', 'ar', '556', 'auto', 850, 30, 2.2, 'rifle', 8500, 'DE', 2005, { h: 'rail', rail: 1 }, 'M4를 더 튼튼하게 만든 특수부대 소총.', { acc: .85, rec: .9 });
G('scarl', 'FN SCAR-L', 'ar', '556', 'auto', 625, 30, 2.3, 'rifle', 8000, 'BE', 2009, { h: 'rail', rail: 1, c: 'tan', st: 'fold' }, '모래색 몸통의 튼튼한 특수부대 소총.', { rec: .85 });
G('aug', 'Steyr AUG', 'ar', '556', 'auto', 700, 30, 2.6, 'bullpup', 7600, 'AT', 1978, { bull: 1, c: 'od', fg: 1, k: 'aug' }, '기본 조준경이 달린 불펍 소총. 짧은데 총열은 길어요.', { zoom: 1.5 });
G('famas', 'FAMAS', 'ar', '556', 'auto', 1000, 25, 2.5, 'bullpup', 7000, 'FR', 1978, { bull: 1, carry: 1, bipod: 1 }, '‘나팔’이라 불리는 프랑스 불펍. 연사가 매우 빨라요.');
G('g36', 'H&K G36', 'ar', '556', 'auto', 750, 30, 2.3, 'rifle', 7400, 'DE', 1997, { c: 'blk', h: 'box', st: 'fold', k: 'g36', clear: 1 }, '반투명 탄창으로 남은 탄을 볼 수 있어요.', { zoom: 1.5 });
G('sg550', 'SIG SG 550', 'ar', '556', 'auto', 700, 30, 2.4, 'rifle', 8200, 'CH', 1990, { st: 'fold', h: 'box', c: 'od', bipod: 1, clear: 1 }, '스위스 시계처럼 정밀한 소총.', { acc: .7 });
G('galil', 'IWI Galil ARM', 'ar', '556', 'auto', 650, 35, 2.5, 'ak', 6200, 'IL', 1972, { k: 'ak', c: 'blk', bipod: 1, st: 'fold' }, 'AK를 바탕으로 만든 튼튼한 이스라엘 소총.');
G('tavor', 'IWI Tavor TAR-21', 'ar', '556', 'auto', 900, 30, 2.5, 'bullpup', 8400, 'IL', 2001, { bull: 1, c: 'blk', rail: 1 }, '짧고 둥근 몸통의 불펍 소총.');
G('qbz95', 'QBZ-95', 'ar', '58', 'auto', 650, 30, 2.6, 'bullpup', 6400, 'CN', 1995, { bull: 1, c: 'blk', carry: 1 }, '손잡이 위에 손잡이가 또 있는 중국 불펍 소총.');
G('k2', 'Daewoo K2', 'ar', '556', 'auto', 750, 30, 2.3, 'rifle', 6600, 'KR', 1985, { st: 'fold', h: 'round' }, '대한민국 국군의 소총! 접이식 개머리판이 특징.');
G('k2c1', 'Daewoo K2C1', 'ar', '556', 'auto', 800, 30, 2.2, 'rifle', 7800, 'KR', 2016, { st: 'fold', h: 'rail', rail: 1 }, '레일과 조절식 개머리판을 단 개량형 K2.', { rec: .85 });
G('an94', 'AN-94', 'ar', '545', 'b2', 1800, 30, 2.5, 'ak', 9800, 'RU', 1994, { k: 'ak', c: 'blk', st: 'fixed' }, '2발을 눈 깜짝할 새에 쏘는 ‘하이퍼버스트’. 같은 곳을 두 번 맞혀요.', { acc: .7, hyper: 1 });
G('asval', 'AS Val', 'ar', '9x39', 'auto', 900, 20, 2.2, 'rifle', 9500, 'RU', 1987, { h: 'sd', st: 'wire', B: .2, c: 'blk' }, '소음기와 한 몸인 돌격소총. 조용하고 강해요.', { sup: 1 });
G('acr', 'Remington ACR', 'ar', '556', 'auto', 700, 30, 2.3, 'rifle', 8000, 'US', 2010, { h: 'rail', rail: 1, c: 'tan', st: 'fold' }, '부품을 빠르게 바꿀 수 있는 모듈식 소총.', { rec: .85 });
G('f2000', 'FN F2000', 'ar', '556', 'auto', 850, 30, 2.5, 'bullpup', 8800, 'BE', 2001, { bull: 1, c: 'blk', k: 'f2000' }, '탄피가 앞으로 나오는 미래형 불펍.', { zoom: 1.6 });
G('l85', 'L85A2', 'ar', '556', 'auto', 700, 30, 2.6, 'bullpup', 6800, 'UK', 1985, { bull: 1, c: 'blk', sg: 'acog' }, '4배율 SUSAT 조준경이 기본으로 달린 영국 소총.', { acc: .8 });
G('stg44', 'StG 44', 'ar', '792k', 'auto', 550, 30, 2.5, 'rifle', 6000, 'DE', 1943, { c: 'wood', mg: 'curvedL', st: 'wood', h: 'none' }, '세계 최초의 돌격소총.');
G('type89', 'Howa Type 89', 'ar', '556', 'auto', 750, 30, 2.3, 'rifle', 6600, 'JP', 1989, { h: 'round', bipod: 1 }, '일본 자위대의 소총. 반동이 부드러워요.', { rec: .85 });
G('vz58', 'Vz. 58', 'ar', '762x39', 'auto', 800, 30, 2.4, 'rifle', 5600, 'CZ', 1958, { c: 'wood', mg: 'curved', h: 'wood', st: 'wood' }, 'AK처럼 생겼지만 속은 완전히 다른 체코 소총.');
G('groza', 'OTs-14 Groza', 'ar', '9x39', 'auto', 700, 20, 2.4, 'bullpup', 9000, 'RU', 1994, { bull: 1, c: 'blk', L: .26, fg: 1 }, '짧고 묵직한 불펍. 아음속탄이라 조용한 편이에요.', { quiet: 1 });
G('g11', 'H&K G11', 'ar', '473', 'b3', 2100, 45, 2.8, 'g11', 15000, 'DE', 1990, { k: 'g11' }, '탄피 없는 탄을 쓰는 실험 소총. 3발이 한 발처럼 나가요.', { hyper: 1, acc: .6, zoom: 1.5 });
G('mcx', 'SIG MCX', 'ar', '300blk', 'auto', 800, 30, 2.2, 'rifle', 9200, 'US', 2015, { h: 'rail', rail: 1, st: 'fold' }, '아음속 탄을 쓰는 조용하고 센 소총.', { quiet: 1 });
G('cz805', 'CZ 805 BREN', 'ar', '556', 'auto', 760, 30, 2.3, 'rifle', 7600, 'CZ', 2011, { h: 'rail', rail: 1, c: 'od', st: 'fold' }, '체코의 최신 모듈식 소총.');

// ---- 전투소총 · 지정사수 ----
G('fal', 'FN FAL', 'br', '762n', 'auto', 650, 20, 2.6, 'rifle', 9000, 'BE', 1953, { c: 'wood', mg: 'straight', st: 'wood', h: 'wood', L: .42, B: .33, brake: 1 }, '‘자유세계의 오른팔’. 강하지만 연사 반동이 커요.', { rec: 1.15 });
G('g3', 'H&K G3', 'br', '762n', 'auto', 550, 20, 2.6, 'hk', 8600, 'DE', 1959, { c: 'blk', mg: 'straight', st: 'fixed', h: 'box', L: .42, B: .32 }, '튼튼하고 강한 독일 전투소총.', { rec: 1.1 });
G('scarh', 'FN SCAR-H', 'br', '762n', 'auto', 600, 20, 2.5, 'rifle', 11000, 'BE', 2009, { c: 'tan', mg: 'straight', st: 'fold', h: 'rail', rail: 1, L: .4, B: .3 }, '큰 탄을 쓰면서도 반동을 잘 잡은 소총.', { rec: .9 });
G('m14', 'M14', 'br', '762n', 'auto', 700, 20, 2.6, 'rifle', 8200, 'US', 1959, { c: 'wood', mg: 'straight', st: 'trad', h: 'wood', L: .44, B: .36, trad: 1 }, '나무 개머리판의 강력한 전투소총.', { rec: 1.2 });
G('garand', 'M1 Garand', 'br', '3006', 'semi', 300, 8, 2.0, 'garand', 5000, 'US', 1936, { c: 'wood', mg: 'internal', st: 'trad', h: 'wood', L: .44, B: .4, trad: 1 }, '8발을 다 쏘면 ‘핑!’ 소리와 함께 클립이 튀어나와요.', { ping: 1, acc: .75 });
G('sks', 'SKS', 'br', '762x39', 'semi', 350, 10, 2.4, 'boltClip', 3000, 'RU', 1945, { c: 'wood', mg: 'internal', st: 'trad', h: 'wood', L: .4, B: .38, trad: 1, bay: 1 }, '클립을 위에서 꾹 눌러 10발을 장전해요.');
G('m1carbine', 'M1 Carbine', 'br', '30car', 'semi', 400, 15, 2.0, 'rifle', 2800, 'US', 1942, { c: 'wood', mg: 'straight', st: 'trad', h: 'wood', L: .36, B: .3, trad: 1 }, '가볍고 짧아서 다루기 쉬운 카빈.', { rec: .6 });
G('svd', 'SVD Dragunov', 'br', '762r', 'semi', 300, 10, 2.6, 'ak', 11000, 'RU', 1963, { c: 'wood', mg: 'straight', st: 'thumb', h: 'wood', L: .44, B: .5, sg: 'scope' }, '스코프가 달린 반자동 저격소총.', { zoom: 4, acc: .5 });
G('mk14', 'Mk 14 EBR', 'br', '762n', 'semi', 360, 20, 2.5, 'rifle', 12500, 'US', 2004, { c: 'blk', mg: 'straight', st: 'fixed', h: 'rail', rail: 1, L: .42, B: .36, sg: 'scope', bipod: 1 }, 'M14를 최신형으로 개조한 지정사수 소총.', { zoom: 4, acc: .5 });
G('m110', 'M110', 'br', '762n', 'semi', 360, 20, 2.5, 'rifle', 13000, 'US', 2008, { c: 'tan', mg: 'straight', st: 'fixed', h: 'rail', rail: 1, L: .42, B: .4, sg: 'scope', bipod: 1 }, '정확한 반자동 저격소총.', { zoom: 6, acc: .4 });
G('psg1', 'H&K PSG1', 'br', '762n', 'semi', 300, 20, 2.6, 'hk', 15000, 'DE', 1972, { c: 'blk', mg: 'straight', st: 'thumb', h: 'box', L: .44, B: .42, sg: 'scope' }, '아주 정밀한 반자동 저격총.', { zoom: 6, acc: .3 });
G('vss', 'VSS Vintorez', 'br', '9x39', 'auto', 800, 10, 2.2, 'rifle', 10000, 'RU', 1987, { c: 'wood', mg: 'straight', st: 'thumb', h: 'sd', L: .36, B: .2, sg: 'scope' }, '소리 없이 쏘는 저격총. 연사도 돼요.', { sup: 1, zoom: 4, acc: .6 });

// ---- 저격 · 볼트액션 · 레버액션 ----
G('kar98k', 'Kar98k', 'sniper', '792', 'bolt', 55, 5, 2.6, 'boltClip', 5500, 'DE', 1935, {}, '볼트를 당기고 밀어 한 발씩. 5발 클립을 위에서 눌러 넣어요.');
G('mosin', 'Mosin–Nagant', 'sniper', '762r', 'bolt', 50, 5, 2.7, 'boltClip', 4200, 'RU', 1891, { B: .52 }, '100년 넘게 쓰인 러시아의 볼트액션 소총.');
G('enfield', 'Lee-Enfield No.4', 'sniper', '303', 'bolt', 80, 10, 2.8, 'boltClip', 5800, 'UK', 1939, { mg: 'straight' }, '볼트가 아주 빨라서 ‘1분에 30발’로 유명했어요.');
G('m1903', 'Springfield M1903', 'sniper', '3006', 'bolt', 55, 5, 2.6, 'boltClip', 5600, 'US', 1903, {}, '미국의 정확한 볼트액션 소총.', { acc: .8 });
G('arisaka', 'Arisaka Type 99', 'sniper', '77ari', 'bolt', 52, 5, 2.6, 'boltClip', 4800, 'JP', 1939, {}, '일본의 볼트액션 소총.');
G('r700', 'Remington 700', 'sniper', '762n', 'bolt', 55, 5, .55, 'boltLoad', 7000, 'US', 1962, { sg: 'scope' }, '한 발씩 넣는 사냥용 저격총. 첫 발이 아주 정확해요.', { zoom: 6, acc: .4 });
G('m24', 'M24 SWS', 'sniper', '762n', 'bolt', 55, 5, .55, 'boltLoad', 12000, 'US', 1988, { sg: 'scope', c: 'od', st: 'fixed' }, '미 육군의 저격총.', { zoom: 8, acc: .3 });
G('m40', 'M40A5', 'sniper', '762n', 'bolt', 55, 5, 2.8, 'boltMag', 13000, 'US', 2009, { sg: 'scope', c: 'tan', st: 'fixed', mg: 'straight' }, '탄창을 바꿔 끼우는 해병대 저격총.', { zoom: 8, acc: .3 });
G('awm', 'AI AWM', 'sniper', '338', 'bolt', 45, 5, 3.0, 'boltMag', 22000, 'UK', 1996, { sg: 'scope', c: 'od', st: 'thumb', mg: 'straight', brake: 1 }, '괴물을 뚫고 뒤에 있는 괴물까지 맞히는 강력한 저격총.', { zoom: 8, acc: .25 });
G('l96', 'AI L96A1', 'sniper', '762n', 'bolt', 55, 10, 2.8, 'boltMag', 14000, 'UK', 1982, { sg: 'scope', c: 'od', st: 'thumb', mg: 'straight' }, '초록색 몸통의 영국 저격총. 탄창이 10발.', { zoom: 6, acc: .3 });
G('sv98', 'SV-98', 'sniper', '762r', 'bolt', 55, 10, 2.8, 'boltMag', 13500, 'RU', 1998, { sg: 'scope', c: 'blk', st: 'thumb', mg: 'straight' }, '러시아 특수부대의 저격총.', { zoom: 8, acc: .3 });
G('m200', 'CheyTac M200', 'sniper', '408', 'bolt', 40, 7, 3.2, 'boltMag', 32000, 'US', 2001, { sg: 'scope', c: 'blk', st: 'fixed', mg: 'straight', L: .4, B: .6, brake: 1, bipod: 1 }, '2km 너머를 맞히는 초장거리 저격총.', { zoom: 10, acc: .2 });
G('tac50', 'McMillan TAC-50', 'sniper', '50bmg', 'bolt', 38, 5, 3.4, 'boltMag', 36000, 'CA', 2000, { sg: 'scope', c: 'od', st: 'thumb', mg: 'straight', L: .42, B: .65, brake: 1, bipod: 1 }, '세계 최장거리 저격 기록을 세운 총.', { zoom: 10, acc: .2 });
G('m82', 'Barrett M82A1', 'sniper', '50bmg', 'semi', 150, 10, 3.4, 'rifle', 40000, 'US', 1982, { c: 'blk', mg: 'straight', st: 'fixed', h: 'box', L: .5, B: .55, brake: 1, bipod: 1, sg: 'scope', big: 1 }, '대물 저격총. 괴물 여러 마리를 한 번에 뚫어 버려요.', { zoom: 8, acc: .3 });
G('martini', 'Martini-Henry', 'sniper', '577', 'single', 40, 1, 1.3, 'martini', 2400, 'UK', 1871, { c: 'wood' }, '한 발 쏘고 한 발 넣는 옛날 총. 위력이 대단해요.');
G('win1873', 'Winchester 1873', 'sniper', '4440', 'lever', 120, 14, .45, 'lever', 3600, 'US', 1873, { k: 'lever', c: 'wood' }, '‘서부를 정복한 총’. 레버를 철컥 당겨 쏴요.');
G('marlin', 'Marlin 1895', 'sniper', '4570', 'lever', 90, 6, .5, 'lever', 5200, 'US', 1895, { k: 'lever', c: 'st' }, '곰도 잡는 묵직한 레버액션 소총.');

// ---- 산탄총 ----
G('r870', 'Remington 870', 'shotgun', '12ga', 'pump', 75, 6, .5, 'shell', 3000, 'US', 1950, { c: 'wood' }, '가장 많이 팔린 펌프 산탄총. 철컥철컥!');
G('m500s', 'Mossberg 500', 'shotgun', '12ga', 'pump', 75, 6, .5, 'shell', 2800, 'US', 1961, { c: 'blk' }, '튼튼하고 값싼 펌프 산탄총.');
G('benellim4', 'Benelli M4', 'shotgun', '12ga', 'semi', 240, 7, .45, 'shell', 6200, 'IT', 1999, { c: 'blk', st: 'fixed', rail: 1, noPump: 1 }, '반자동이라 펌프질 없이 빠르게 연속 사격!');
G('spas12', 'Franchi SPAS-12', 'shotgun', '12ga', 'pump', 80, 8, .5, 'shell', 5000, 'IT', 1979, { c: 'blk', st: 'fold', h: 'shroud' }, '무시무시하게 생긴 펌프 산탄총.');
G('aa12', 'AA-12', 'shotgun', '12ga', 'auto', 300, 20, 3.0, 'drum', 14000, 'US', 2005, { c: 'blk', mg: 'drum', st: 'fixed', h: 'box', L: .38, B: .3, carry: 1, noPump: 1 }, '자동 산탄총! 드럼 탄창 20발을 쏟아부어요.', { rec: .6 });
G('saiga12', 'Saiga-12', 'shotgun', '12ga', 'semi', 220, 8, 2.6, 'ak', 6800, 'RU', 1997, { k: 'ak', c: 'blk', mg: 'straight', noPump: 1 }, 'AK 구조의 산탄총. 탄창을 갈아 끼워요.');
G('ksg', 'Kel-Tec KSG', 'shotgun', '12ga', 'pump', 75, 14, .45, 'shell', 5800, 'US', 2011, { bull: 1, c: 'blk', tubes: 2 }, '튜브 탄창이 2개! 14발 불펍 펌프 산탄총.');
G('w1887', 'Winchester 1887', 'shotgun', '12ga', 'lever', 70, 5, .55, 'lever', 4200, 'US', 1887, { k: 'lever', c: 'wood' }, '레버를 휙 돌려 장전하는 산탄총.');
G('coach', 'Coach Gun', 'shotgun', '12ga', 'single', 400, 2, 2.2, 'break', 1500, 'US', 1880, { k: 'double', c: 'wood' }, '두 발을 연달아 쏘고 꺾어서 재장전하는 쌍열 산탄총.', { dm: 1.15 });
G('ithaca37', 'Ithaca 37', 'shotgun', '12ga', 'pump', 85, 4, .5, 'shell', 2600, 'US', 1937, { c: 'wood' }, '탄피가 아래로 떨어지는 펌프 산탄총.');
G('usas12', 'Daewoo USAS-12', 'shotgun', '12ga', 'auto', 360, 20, 3.0, 'drum', 12000, 'KR', 1989, { c: 'blk', mg: 'drum', st: 'fixed', h: 'box', L: .38, B: .28, carry: 1, noPump: 1 }, '대한민국에서 만든 자동 산탄총!');
G('m1897', 'Winchester M1897', 'shotgun', '12ga', 'pump', 90, 5, .5, 'shell', 3200, 'US', 1897, { c: 'wood', h: 'shroud' }, '‘트렌치건’. 펌프를 빠르게 움직여 연달아 쏴요.');

// ---- 기관총 ----
G('m249', 'M249 SAW', 'lmg', '556', 'auto', 800, 200, 4.6, 'belt', 16000, 'BE', 1984, { c: 'blk' }, '200발 탄띠로 쉬지 않고 쏴요.');
G('m60', 'M60', 'lmg', '762n', 'auto', 550, 100, 4.8, 'belt', 17000, 'US', 1957, { c: 'blk' }, '‘돼지’라는 별명의 묵직한 기관총.', { rec: 1.1 });
G('pkm', 'PKM', 'lmg', '762r', 'auto', 650, 100, 4.8, 'belt', 16500, 'RU', 1969, { c: 'wood', st: 'thumb' }, '가볍고 튼튼한 러시아 기관총.');
G('rpk', 'RPK', 'lmg', '762x39', 'auto', 600, 75, 3.4, 'drum', 11000, 'RU', 1961, { k: 'ak', c: 'wood', mg: 'drum', B: .36, bipod: 1 }, 'AK를 길게 만든 경기관총. 75발 드럼.');
G('mg42', 'MG42', 'lmg', '792', 'auto', 1200, 100, 4.8, 'belt', 20000, 'DE', 1942, { c: 'blk', h: 'shroud', st: 'fixed' }, '천을 찢는 소리가 날 만큼 빠른 연사의 기관총.', { rec: 1.2 });
G('bren', 'Bren Mk II', 'lmg', '303', 'auto', 500, 30, 2.6, 'top', 9000, 'UK', 1938, { c: 'wood', mg: 'top', st: 'fixed', h: 'none', bipod: 1, L: .44, B: .4 }, '위에 꽂는 휜 탄창. 아주 정확한 경기관총.', { acc: .6 });
G('m1919', 'Browning M1919', 'lmg', '3006', 'auto', 500, 250, 5.2, 'belt', 15000, 'US', 1919, { c: 'blk', h: 'shroud', st: 'fixed' }, '250발 탄띠의 묵직한 기관총.');
G('negev', 'IWI Negev', 'lmg', '556', 'auto', 900, 150, 4.4, 'belt', 17500, 'IL', 1997, { c: 'blk', st: 'fold' }, '빠른 연사의 이스라엘 경기관총.');
G('m240', 'M240B', 'lmg', '762n', 'auto', 650, 100, 4.8, 'belt', 18000, 'BE', 1977, { c: 'blk' }, '믿음직한 7.62mm 기관총.');
G('dp28', 'DP-28', 'lmg', '762r', 'auto', 550, 47, 3.2, 'pan', 9500, 'RU', 1928, { c: 'wood', mg: 'pan', st: 'wood', h: 'shroud', bipod: 1, L: .44, B: .4 }, '위에 얹는 원판 탄창. ‘레코드판’이라고 불렸어요.');
G('lewis', 'Lewis Gun', 'lmg', '303', 'auto', 550, 47, 3.2, 'pan', 10000, 'UK', 1914, { c: 'wood', mg: 'pan', st: 'wood', h: 'cooler', bipod: 1, L: .44, B: .45 }, '총열을 감싼 굵은 냉각통이 특징인 옛 기관총.');
G('k3', 'Daewoo K3', 'lmg', '556', 'auto', 850, 200, 4.5, 'belt', 15500, 'KR', 1991, { c: 'blk' }, '대한민국 국군의 경기관총!');
G('ultimax', 'Ultimax 100', 'lmg', '556', 'auto', 600, 100, 3.2, 'drum', 14000, 'SG', 1982, { c: 'blk', mg: 'drum', st: 'fixed', fg: 1, h: 'round' }, '반동이 아주 적은 경기관총.', { rec: .45 });

// ---- 특수 화기 ----
G('minigun', 'M134 미니건', 'special', '762n', 'auto', 3000, 500, 5.5, 'minigun', 60000, 'US', 1963, { k: 'minigun' }, '총열 6개가 돌며 1초에 50발! 돌기까지 시간이 걸려요.', { spin: .7, rec: .35 });
G('m79', 'M79 유탄발사기', 'special', '40mm', 'single', 60, 1, 1.6, 'm79', 18000, 'US', 1961, { k: 'm79' }, '‘뽕’ 하고 날아가 폭발하는 유탄.');
G('m32', 'M32 MGL', 'special', '40mm', 'semi', 150, 6, 4.5, 'mgl', 35000, 'ZA', 1983, { k: 'mgl' }, '유탄 6발을 연달아 쏘는 회전식 발사기.');
G('rpg7', 'RPG-7', 'special', 'rkt', 'single', 30, 1, 3.0, 'rocket', 30000, 'RU', 1961, { k: 'rpg' }, '로켓이 날아가 크게 폭발! 장전이 느려요.');

const GUN = {}; GUNS.forEach(g => GUN[g.id] = g);

// ---------------------------------------------------------------------
//  개조 부품
// ---------------------------------------------------------------------
const MOD_SLOTS = [
  { k: 'sight', n: '조준기', opts: [
    { k: 'iron', n: '기본 가늠자', p: 0 },
    { k: 'dot', n: '레드닷', p: .12, zoom: 1.35, d: '빨간 점으로 빠르게 조준' },
    { k: 'holo', n: '홀로그램 조준기', p: .16, zoom: 1.45, d: '넓은 창으로 주변이 잘 보여요' },
    { k: 'acog', n: '3배율 조준경', p: .25, zoom: 3, d: '중거리 조준' },
    { k: 'scope', n: '8배율 저격 조준경', p: .35, zoom: 8, d: '멀리 있는 약점까지 정확하게' },
  ] },
  { k: 'muzzle', n: '총구', opts: [
    { k: 'none', n: '없음', p: 0 },
    { k: 'sup', n: '소음기', p: .2, d: '괴물이 소리를 잘 못 들어요 (위력 -7%)' },
    { k: 'comp', n: '보정기', p: .12, d: '반동 -20%' },
  ] },
  { k: 'mag', n: '탄창', opts: [
    { k: 'std', n: '기본 탄창', p: 0 },
    { k: 'ext', n: '확장 탄창', p: .18, d: '탄 +50%' },
  ] },
  { k: 'grip', n: '손잡이', opts: [
    { k: 'none', n: '없음', p: 0 },
    { k: 'vert', n: '수직 손잡이', p: .12, d: '반동 -25%' },
  ] },
  { k: 'laser', n: '레이저', opts: [
    { k: 'none', n: '없음', p: 0 },
    { k: 'laser', n: '레이저 조준기', p: .1, d: '조준 없이 쏠 때 정확도 +35%' },
  ] },
  { k: 'barrel', n: '총열 강화', opts: [
    { k: 0, n: '기본', p: 0 },
    { k: 1, n: '강화 1단계', p: .15, d: '위력 +10%' },
    { k: 2, n: '강화 2단계', p: .3, d: '위력 +20%' },
    { k: 3, n: '강화 3단계', p: .5, d: '위력 +32%' },
  ] },
  { k: 'speed', n: '장전 개조', opts: [
    { k: 'std', n: '기본', p: 0 },
    { k: 'fast', n: '빠른 장전', p: .15, d: '장전 속도 +25%' },
  ] },
  { k: 'skin', n: '도색', opts: [
    { k: 'base', n: '기본', p: 0 },
    { k: 'desert', n: '사막', p: .05 },
    { k: 'forest', n: '숲', p: .05 },
    { k: 'urban', n: '회색 도시', p: .05 },
    { k: 'snow', n: '설원', p: .06 },
    { k: 'gold', n: '황금', p: .6 },
    { k: 'crystal', n: '수정', p: .4 },
    { k: 'lava', n: '용암', p: .45 },
  ] },
];
const MOD_SLOT = {}; MOD_SLOTS.forEach(s => MOD_SLOT[s.k] = s);

function defaultMods(g) {
  return { sight: g.m.sg || (g.x.zoom >= 3 && g.cat === 'sniper' ? 'scope' : 'iron'), muzzle: 'none', mag: 'std', grip: 'none', laser: 'none', barrel: 0, speed: 'std', skin: 'base' };
}
const NO_EXT_MAG = ['revolver', 'webley', 'gate', 'break', 'martini', 'garand', 'rocket', 'm79', 'mgl', 'boltClip', 'c96'];
function modAllowed(g, slot, k) {
  const c = g.cat, rt = g.rt;
  if (slot === 'sight') {
    if (c === 'special') return k === 'iron' || (k === 'dot' && g.id !== 'minigun');
    if (c === 'pistol') return k === 'iron' || k === 'dot';
    if (c === 'revolver') return k === 'iron' || k === 'dot' || (k === 'acog' && g.x.scopeOk);
    if (g.m.sg === 'scope' && k === 'iron') return false;
    if (g.m.sg === 'acog' && k === 'iron') return false;
    return true;
  }
  if (slot === 'muzzle') {
    if (g.x.sup) return k === 'none';
    if (c === 'special') return k === 'none';
    if (c === 'revolver') return k === 'none' || (k === 'sup' && g.id === 'nagant');
    if (g.m.k === 'double' || g.m.k === 'lever') return k !== 'sup';
    return true;
  }
  if (slot === 'mag') return k === 'std' || !NO_EXT_MAG.includes(rt);
  if (slot === 'grip') return k === 'none' || !['pistol', 'revolver', 'special'].includes(c) && !g.m.fg && g.m.k !== 'double';
  if (slot === 'laser') return k === 'none' || c !== 'special';
  return true;
}
function modPrice(g, slot, opt) {
  if (!opt.p) return 0;
  return Math.max(100, Math.round(opt.p * Math.max(g.price, 1500) / 50) * 50);
}

// 총의 실제 성능 계산
function sightZoom(g, mods) {
  const s = MOD_SLOT.sight.opts.find(o => o.k === mods.sight);
  if (mods.sight === 'iron') return g.x.zoom && g.x.zoom < 3 ? g.x.zoom : (CAT[g.cat].k === 'sniper' || g.cat === 'br' ? 1.4 : 1.25);
  if (mods.sight === 'scope' && g.x.zoom) return Math.max(g.x.zoom, 4);
  return (s && s.zoom) || 1.25;
}
function gunStats(g, mods) {
  mods = mods || defaultMods(g);
  const c = CAL[g.cal], cat = CAT[g.cat], x = g.x;
  const barrel = [1, 1.1, 1.2, 1.32][mods.barrel || 0];
  const sup = !!(x.sup || mods.muzzle === 'sup');
  const dmg = c.d * (x.dm || 1) * barrel * (mods.muzzle === 'sup' && !x.sup ? .93 : 1);
  const pellets = c.pel || 1;
  const shellType = ['shell', 'lever', 'boltLoad', 'gate'].includes(g.rt);
  const mag = Math.max(1, Math.round(g.mag * (mods.mag === 'ext' ? (shellType ? 1.34 : 1.5) : 1)));
  const rld = g.rld * (mods.speed === 'fast' ? .75 : 1);
  const rec = c.r * cat.kick * (x.rec || 1) * (mods.grip === 'vert' ? .75 : 1) * (mods.muzzle === 'comp' ? .8 : 1) * (mods.muzzle === 'sup' ? .9 : 1);
  const hip = cat.spread * (pellets > 1 ? 1 : (x.acc || 1)) * (mods.laser === 'laser' ? .65 : 1);
  const ads = pellets > 1 ? hip * .75 : cat.spread * cat.ads * (x.acc || 1);
  const zoom = sightZoom(g, mods);
  return {
    dmg, pellets, rpm: g.rpm, interval: 60 / g.rpm, mag, rld, rec, hip, ads, zoom,
    range: c.rg * cat.rg, pen: (c.pen || 0) + (x.pen || 0), ex: c.ex || 0, sup,
    noise: sup ? 7 : x.quiet ? 16 : Math.min(60, 22 + c.d * .2),
    move: cat.move * (g.id === 'minigun' ? .8 : 1), adsT: cat.adsT / (x.ads || 1),
    mode: g.mode, spin: x.spin || 0, hyper: !!x.hyper, ping: !!x.ping,
    rp: recoilPat(g),
  };
}
// 총마다 다른 반동 무늬: 총 이름으로 정해지는 숫자라서 같은 총은 늘 같은 방향으로 튄다
//   up: 위로 튀는 힘, ramp: 계속 쏘면 점점 세지는 정도, bias: 왼(-)/오른(+) 쏠림,
//   wob: 좌우로 흔들리는 크기, freq: 흔들리는 빠르기, back: 손을 떼면 저절로 돌아오는 양
const RP_CAT = {
  pistol: { up: 1.25, ramp: .25, wob: .5, back: .55 }, revolver: { up: 1.6, ramp: .1, wob: .4, back: .5 },
  smg: { up: .9, ramp: .9, wob: 1.5, back: .4 }, ar: { up: 1, ramp: 1.1, wob: 1, back: .38 },
  br: { up: 1.2, ramp: .7, wob: .8, back: .4 }, sniper: { up: 1.8, ramp: 0, wob: .3, back: .45 },
  shotgun: { up: 1.7, ramp: .3, wob: .7, back: .45 }, lmg: { up: .85, ramp: 1.6, wob: 1.3, back: .3 },
  special: { up: 1.3, ramp: .6, wob: 1, back: .4 },
};
const rpCache = {};
function recoilPat(g) {
  if (rpCache[g.id]) return rpCache[g.id];
  let h = 2166136261; for (const ch of g.id) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  const r = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; };
  const C = RP_CAT[g.cat] || RP_CAT.ar;
  const bias = (r() * 2 - 1) * (.4 + r() * .8);
  const p = { up: C.up * (.85 + r() * .4), ramp: C.ramp * (.7 + r() * .7), rampN: 6 + Math.floor(r() * 10), bias,
    wob: C.wob * (.6 + r() * .9), freq: .35 + r() * 1.1, phase: r() * 6.28, back: C.back * (.85 + r() * .3) };
  const side = Math.abs(bias) < .35 ? '좌우로 흔들림' : bias < 0 ? '왼쪽으로 쏠림' : '오른쪽으로 쏠림';
  p.desc = (p.up > 1.4 ? '위로 세게 튐' : p.up > 1.05 ? '위로 튐' : '위로 조금 튐') + ' · ' + side + (p.ramp > 1 ? ' · 오래 쏘면 날뜀' : '');
  return (rpCache[g.id] = p);
}

// 같은 종류 안에서 눈에 띄는 장점 뽑기
function gunBadges(g) {
  const s = gunStats(g), list = GUNS.filter(o => o.cat === g.cat).map(o => gunStats(o));
  const rank = (f, hi) => { const v = f(s); const arr = list.map(f).sort((a, b) => hi ? b - a : a - b); return arr.indexOf(v) / Math.max(1, arr.length - 1); };
  const b = [];
  if (g.x.sup) b.push('소음 일체형');
  if (g.x.quiet) b.push('조용한 아음속탄');
  if (s.ex) b.push('폭발');
  if (s.pen >= 2) b.push('강력 관통'); else if (s.pen === 1 && g.cat !== 'sniper' && g.cat !== 'br') b.push('관통');
  if (g.mode === 'b3') b.push(s.hyper ? '초고속 3점사' : '3점사');
  if (g.mode === 'b2') b.push('하이퍼버스트');
  if (s.spin) b.push('예열 필요');
  if (s.ping) b.push('핑! 클립');
  if (rank(t => t.dmg * t.pellets, true) <= .2) b.push('강한 위력');
  if (g.mode === 'auto' && rank(t => t.rpm, true) <= .2) b.push('빠른 연사');
  if (rank(t => t.mag, true) <= .2) b.push('큰 탄창');
  if ((g.x.acc || 1) <= .8) b.push('정확함');
  if (rank(t => t.rec, false) <= .2) b.push('반동 적음');
  if (rank(t => t.rld, false) <= .2 && !['gate', 'shell', 'lever', 'boltLoad'].includes(g.rt)) b.push('빠른 장전');
  if (g.rt === 'drum' || g.m.mg === 'drum') b.push('드럼 탄창');
  if (g.m.bull) b.push('불펍');
  if (g.mode === 'bolt') b.push('볼트액션');
  if (g.mode === 'lever') b.push('레버액션');
  if (g.mode === 'pump') b.push('펌프액션');
  if (g.cat === 'shotgun' && g.mode === 'auto') b.push('자동 산탄');
  if (g.x.zoom && g.m.sg !== 'scope') b.push('기본 조준경');
  if (g.year < 1920) b.push('전설의 고전');
  if (g.nat === 'KR') b.push('대한민국');
  return b.slice(0, 6);
}

// ---------------------------------------------------------------------
//  괴생명체
// ---------------------------------------------------------------------
const SPECIES = {
  tick: {
    n: '바위진드기', sci: 'Petracarus minor', kind: 'crawler', hp: 45, spd: 6.2, dmg: 6, money: 40, r: .55,
    kill: 20, sample: 30, scan: 15, danger: 1, weak: '등에 붙은 붉은 주머니',
    look: '바위 조각 같은 단단한 껍질에 다리가 여섯 개. 등에 붉게 빛나는 주머니가 있어요.',
    act: '무리 지어 다니다가 소리가 나면 우르르 달려와 물어요. 빛을 싫어해서 그늘로 숨어요.',
    report: '등의 주머니는 동굴 속 미네랄을 녹이는 소화액 주머니였다. 이 주머니를 맞히면 껍질이 버티지 못한다.',
  },
  bat: {
    n: '그림자날개', sci: 'Umbrala volans', kind: 'flyer', hp: 35, spd: 8.5, dmg: 7, money: 60, r: .6,
    kill: 18, sample: 30, scan: 15, danger: 2, weak: '머리',
    look: '박쥐를 닮았지만 날개가 거의 투명해서 손전등 빛이 스며들어요. 눈이 셋이에요.',
    act: '천장 근처를 맴돌다가 목표가 보이면 빠르게 내리꽂혀요. 한 번 공격하면 다시 높이 올라가요.',
    report: '세 번째 눈은 초음파 대신 열을 보는 기관이었다. 완전한 어둠 속에서도 사냥하는 이유가 밝혀졌다.',
  },
  spider: {
    n: '수정거미', sci: 'Crystallaranea lucens', kind: 'spitter', hp: 110, spd: 4.6, dmg: 11, money: 130, r: .8,
    kill: 15, sample: 30, scan: 15, danger: 3, weak: '배에 박힌 큰 수정',
    look: '몸 곳곳에 보석 같은 수정이 자라는 큰 거미예요. 배의 큰 수정이 보라색으로 빛나요.',
    act: '거리를 두고 날카로운 수정 조각을 뱉어요. 가까이 가면 다리로 찍어요.',
    report: '수정은 몸 안에서 자라는 살아 있는 광물이었다. 수정 조각을 뱉어 사냥하는 생물은 처음 보고되었다.',
  },
  stalker: {
    n: '어둠사냥꾼', sci: 'Noctivenator fungicola', kind: 'leaper', hp: 220, spd: 7, dmg: 20, money: 220, r: .9,
    kill: 15, sample: 30, scan: 15, danger: 4, weak: '머리',
    look: '네 발로 걷는 날렵한 포식자. 몸의 무늬가 버섯처럼 청록색으로 빛나요.',
    act: '조용히 다가와 멀리서 크게 뛰어올라 덮쳐요. 뛰기 직전에 몸을 낮추니 그때를 노려요.',
    report: '빛나는 무늬는 버섯과 함께 사는 공생 균류였다. 버섯 숲에 숨어 사냥감을 기다린다.',
  },
  golem: {
    n: '용암골렘', sci: 'Magmagolem ignis', kind: 'brute', hp: 650, spd: 2.7, dmg: 28, money: 500, r: 1.3,
    kill: 25, sample: 35, scan: 15, danger: 5, weak: '가슴 속에서 빛나는 핵',
    look: '뜨거운 바위가 모여 사람처럼 걸어요. 갈라진 틈 사이로 용암이 흘러요.',
    act: '느리지만 아주 튼튼해요. 멀리서는 용암 덩어리를 던지고, 가까이 오면 땅을 내려쳐요.',
    report: '골렘은 하나의 생물이 아니라 바위 속에 사는 작은 생물 수백만 마리가 모인 군체였다. 가슴의 핵이 그 중심이다.',
  },
  queen: {
    n: '심연의 여왕', sci: 'Abyssa regina', kind: 'boss', hp: 6500, spd: 0, dmg: 14, money: 8000, r: 3,
    kill: 100, sample: 0, scan: 0, danger: 6, weak: '빛나는 세 개의 눈',
    look: '동굴 가장 깊은 곳에 사는 거대한 생명체. 촉수 여섯 개와 빛나는 눈 세 개가 있어요.',
    act: '산성 침을 여러 갈래로 뱉고, 바위진드기를 불러내고, 가까이 오면 촉수로 내려쳐요.',
    report: '동굴의 모든 괴생명체는 여왕이 내뿜는 포자에서 시작되었다. 지하 생태계의 비밀이 마침내 풀렸다.',
  },
};

