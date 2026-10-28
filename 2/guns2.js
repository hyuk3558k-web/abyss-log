'use strict';
// =====================================================================
//  심연 탐사록 - 총 추가 목록 (147종)  → data.js 다음에 불러와요
//  G(아이디, 이름, 종류, 탄약, 발사방식, 분당발사수, 탄창, 장전시간, 장전동작, 가격, 나라, 연도, 모양, 설명, 특징)
// =====================================================================

// 새 나라
Object.assign(NATIONS, { SE: '스웨덴', FI: '핀란드', DK: '덴마크', PL: '폴란드', HU: '헝가리', YU: '유고슬라비아', TR: '튀르키예', ES: '스페인', AU: '호주', HR: '크로아티아', IN: '인도', AR: '아르헨티나' });

// 새 탄약 (rocket: 1 = 로켓처럼 곧게 날아가는 탄)
Object.assign(CAL, {
  '32acp': { n: '.32 ACP', d: 16, r: .35, rg: 18 },
  '9jr': { n: '9mm 일본 리볼버', d: 20, r: .5, rg: 20 },
  '9steyr': { n: '9×23mm 슈타이어', d: 25, r: .62, rg: 26 },
  '9x21': { n: '9×21mm 규르자', d: 28, r: .65, rg: 30, pen: 1 },
  '10mm': { n: '10mm 오토', d: 31, r: .8, rg: 28 },
  '127x55': { n: '12.7×55mm', d: 72, r: 2.4, rg: 45, pen: 1 },
  '410': { n: '.410 산탄', d: 11, r: 1.0, rg: 10, pel: 5 },
  '23mm': { n: '23mm KS-23 산탄', d: 20, r: 2.8, rg: 16, pel: 10 },
  '3030': { n: '.30-30 윈체스터', d: 46, r: 1.1, rg: 60 },
  '65ari': { n: '6.5mm 아리사카', d: 46, r: 1.1, rg: 85, pen: 1 },
  '65car': { n: '6.5mm 카르카노', d: 47, r: 1.2, rg: 85, pen: 1 },
  '8lebel': { n: '8mm 르벨', d: 54, r: 1.6, rg: 90, pen: 1 },
  '8mann': { n: '8×50mmR 만리허', d: 53, r: 1.5, rg: 85, pen: 1 },
  '75swiss': { n: '7.5×55mm 스위스', d: 54, r: 1.4, rg: 95, pen: 1 },
  '75fr': { n: '7.5×54mm 프랑스', d: 52, r: 1.4, rg: 90, pen: 1 },
  '277fury': { n: '6.8×51mm (.277 퓨리)', d: 55, r: 1.3, rg: 100, pen: 1 },
  '145': { n: '14.5×114mm', d: 260, r: 3.6, rg: 200, pen: 3 },
  '60rkt': { n: '60mm 바주카 로켓', d: 320, r: 1.5, rg: 60, ex: 5, rocket: 1 },
  '88rkt': { n: '88mm 판처슈렉 로켓', d: 400, r: 1.9, rg: 60, ex: 5.5, rocket: 1 },
  '84mm': { n: '84mm 무반동포탄', d: 460, r: 2.4, rg: 90, ex: 6.5, rocket: 1 },
});

// ---- 권총 ----
G('dp51', 'Daewoo DP51', 'pistol', '9mm', 'semi', 440, 13, 1.4, 'pistol', 950, 'KR', 1991, { c: 'blk', L: .18 }, '대한민국 대우정밀이 만든 작고 가벼운 권총. 경찰과 군인이 썼어요.', { ads: 1.1 });
G('glock20', 'Glock 20', 'pistol', '10mm', 'semi', 420, 15, 1.5, 'pistol', 1700, 'AT', 1991, { c: 'blk', L: .21 }, '곰도 막는다는 10mm 탄을 15발이나 넣는 큰 글록.', { rec: 1.1 });
G('p38', 'Walther P38', 'pistol', '9mm', 'semi', 400, 8, 1.55, 'pistol', 1200, 'DE', 1938, { c: 'st', L: .215, k: 'beretta' }, '윗부분이 뚫린 슬라이드의 원조. 베레타 M9의 할아버지 같은 총이에요.');
G('p210', 'SIG P210', 'pistol', '9mm', 'semi', 380, 8, 1.55, 'pistol', 2600, 'CH', 1949, { c: 'st', L: .21 }, '스위스 장인이 손으로 다듬은 권총. 세상에서 가장 정확한 권총으로 손꼽혀요.', { acc: .6, rec: .9 });
G('m1934', 'Beretta M1934', 'pistol', '380', 'semi', 470, 7, 1.3, 'pistol', 450, 'IT', 1934, { c: 'st', L: .165, k: 'beretta' }, '이탈리아 군인들이 들고 다닌 작고 튼튼한 권총.', { ads: 1.25 });
G('cz52', 'CZ 52', 'pistol', '762tok', 'semi', 420, 8, 1.45, 'pistol', 700, 'CZ', 1952, { c: 'st', L: .21 }, '롤러로 잠기는 특이한 구조. 아주 빠른 탄이 껍질을 뚫어요.', { pen: 1 });
G('aps', 'Stechkin APS', 'pistol', '9x18', 'auto', 750, 20, 1.6, 'pistol', 2200, 'RU', 1951, { c: 'blk', L: .225, ext: 1 }, '소련의 연발 권총. 방아쇠를 당기고 있으면 다다다 연사돼요!', { rec: 1.2 });
G('grach', 'MP-443 Grach', 'pistol', '9mm', 'semi', 430, 17, 1.45, 'pistol', 1000, 'RU', 2003, { c: 'blk', L: .2 }, '‘까마귀’라는 이름의 러시아군 새 권총. 17발이 들어가요.');
G('sr1', 'SR-1 Vektor', 'pistol', '9x21', 'semi', 420, 18, 1.5, 'pistol', 2400, 'RU', 1996, { c: 'blk', L: .21 }, '방탄조끼를 뚫으려고 만든 특별한 탄을 써요. 단단한 껍질도 뚫어요.');
G('steyr1912', 'Steyr M1912', 'pistol', '9steyr', 'semi', 400, 8, 2.3, 'c96', 1500, 'AT', 1912, { c: 'st', L: .22 }, '탄창을 빼지 않고 위에서 클립으로 8발을 눌러 넣는 옛 권총.');
G('fn1910', 'FN M1910', 'pistol', '32acp', 'semi', 500, 7, 1.25, 'pistol', 350, 'BE', 1910, { c: 'st', L: .15 }, '천재 총기 설계자 브라우닝이 만든 작은 권총. 꺼내기가 아주 빨라요.', { ads: 1.35, rec: .7 });
G('type94', 'Type 94 Nambu', 'pistol', '8nambu', 'semi', 360, 6, 1.5, 'pistol', 500, 'JP', 1934, { c: 'st', L: .18 }, '비행기 조종사들이 갖고 다니던 작은 일본 권총.');
G('vis35', 'Radom Vis wz.35', 'pistol', '9mm', 'semi', 400, 8, 1.5, 'pistol', 1300, 'PL', 1935, { c: 'st', L: .21 }, '묵직해서 반동이 적은 폴란드의 명품 권총.', { rec: .8, acc: .85 });
G('lahti35', 'Lahti L-35', 'pistol', '9mm', 'semi', 380, 8, 1.6, 'pistol', 1400, 'FI', 1935, { c: 'st', L: .23, k: 'luger' }, '영하 40도 추위에서도 잘 쏴지는 핀란드 권총.', { acc: .85 });
G('p7', 'H&K P7', 'pistol', '9mm', 'semi', 470, 8, 1.35, 'pistol', 1600, 'DE', 1979, { c: 'st', L: .17 }, '손잡이 앞쪽을 꽉 쥐어야 쏠 수 있는 ‘꽉 쥐기’ 권총.', { ads: 1.25, acc: .85 });
G('mk23', 'H&K Mk 23', 'pistol', '45acp', 'semi', 380, 12, 1.6, 'pistol', 2800, 'DE', 1996, { c: 'blk', L: .25 }, '미국 특수부대를 위해 만든 커다란 .45 권총. 아주 정확해요.', { acc: .75, ads: .9 });
G('hs2000', 'HS2000', 'pistol', '9mm', 'semi', 450, 16, 1.4, 'pistol', 1000, 'HR', 1999, { c: 'blk', L: .19 }, '크로아티아에서 태어나 미국에서 ‘XD’라는 이름으로 인기를 얻었어요.');
G('p365', 'SIG P365', 'pistol', '9mm', 'semi', 480, 10, 1.3, 'pistol', 1100, 'US', 2018, { c: 'blk', L: .15 }, '손바닥만 한데 10발이나 들어가는 아주 작은 권총.', { ads: 1.35, rec: 1.15 });
G('canik', 'Canik TP9', 'pistol', '9mm', 'semi', 460, 18, 1.4, 'pistol', 1000, 'TR', 2012, { c: 'tan', L: .2 }, '튀르키예에서 만든 권총. 방아쇠가 부드럽고 탄창이 넉넉해요.');
G('pt92', 'Taurus PT92', 'pistol', '9mm', 'semi', 420, 17, 1.5, 'pistol', 750, 'BR', 1983, { c: 'st', L: .21, k: 'beretta' }, '베레타 공장을 산 브라질 회사가 만든 쌍둥이 권총.');
G('bersa', 'Bersa Thunder 380', 'pistol', '380', 'semi', 480, 8, 1.3, 'pistol', 400, 'AR', 1995, { c: 'st', L: .165 }, '아르헨티나의 작고 값싼 권총. 반동이 아주 순해요.', { rec: .75, ads: 1.25 });
G('pb', 'PB 소음권총', 'pistol', '9x18', 'semi', 380, 8, 1.5, 'pistol', 2600, 'RU', 1967, { c: 'blk', L: .27 }, '앞쪽 반이 소음기인 소련 비밀요원의 권총. 쉿!', { sup: 1 });
G('welrod', 'Welrod Mk II', 'pistol', '32acp', 'single', 50, 8, 1.7, 'pistol', 2000, 'UK', 1942, { c: 'blk', L: .3, k: 'ruger' }, '자전거 펌프처럼 생긴 비밀 작전용 총. 한 발씩 쏘지만 거의 소리가 안 나요.', { sup: 1, dm: 1.3, acc: .8 });
G('liberator', 'FP-45 Liberator', 'pistol', '45acp', 'single', 30, 1, 2.4, 'pistol', 400, 'US', 1942, { c: 'st', L: .14 }, '전쟁 중 하늘에서 뿌리려고 싸게 만든 한 발짜리 권총.', { acc: 1.8 });

// ---- 리볼버 ----
G('judge', 'Taurus Judge', 'revolver', '410', 'da', 170, 5, 2.2, 'revolver', 2400, 'BR', 2006, { c: 'blk', B: .12 }, '권총인데 산탄을 쏴요! 가까이 있는 괴물에게 딱이에요.');
G('anaconda', 'Colt Anaconda', 'revolver', '44mag', 'da', 170, 6, 2.3, 'revolver', 3500, 'US', 1990, { c: 'ch', B: .2, rib: 1 }, '번쩍이는 은색의 커다란 .44 매그넘 리볼버.', { rec: .9 });
G('m19', 'S&W Model 19', 'revolver', '357', 'da', 200, 6, 2.0, 'revolver', 1700, 'US', 1957, { c: 'blk', B: .09 }, '짧고 가벼운 경찰용 매그넘. 빠르게 꺼낼 수 있어요.', { ads: 1.2 });
G('m627', 'S&W Model 627', 'revolver', '357', 'da', 200, 8, 2.3, 'revolver', 3000, 'US', 1989, { c: 'ch', B: .13 }, '실린더에 8발이나 들어가는 욕심쟁이 리볼버.');
G('korth', 'Korth Combat', 'revolver', '357', 'da', 200, 6, 2.1, 'revolver', 5200, 'DE', 1965, { c: 'blk', B: .14, rib: 1 }, '한 자루를 몇 달 동안 손으로 만드는 아주 비싼 리볼버.', { acc: .65, rec: .9 });
G('mr73', 'Manurhin MR73', 'revolver', '357', 'da', 190, 6, 2.1, 'revolver', 3800, 'FR', 1973, { c: 'blk', B: .15 }, '프랑스 특수경찰의 리볼버. 정확하기로 소문났어요.', { acc: .7 });
G('blackhawk', 'Ruger Blackhawk', 'revolver', '357', 'sa', 150, 6, .5, 'gate', 1300, 'US', 1955, { c: 'blk', B: .16, k: 'saa' }, '서부 총처럼 공이치기를 젖혀 쏘고, 옆 문으로 한 발씩 넣어요.', { acc: .8 });
G('schofield', 'S&W Schofield', 'revolver', '45lc', 'sa', 140, 6, 1.9, 'webley', 1900, 'US', 1875, { c: 'st', B: .17, k: 'webley' }, '꺾으면 탄피가 한꺼번에 튀어나와 말 위에서도 빨리 장전했어요.');
G('fosbery', 'Webley-Fosbery', 'revolver', '455', 'semi', 300, 6, 2.0, 'webley', 4200, 'UK', 1901, { c: 'st', B: .16, k: 'webley' }, '쏠 때마다 윗부분이 미끄러지며 실린더가 저절로 도는 ‘자동 리볼버’.', { rec: .85 });
G('type26', 'Type 26 리볼버', 'revolver', '9jr', 'da', 190, 6, 2.0, 'webley', 800, 'JP', 1893, { c: 'st', B: .12, k: 'webley' }, '일본 최초의 군용 리볼버. 꺾어서 장전해요.', { rec: .8 });
G('rsh12', 'RSh-12', 'revolver', '127x55', 'da', 110, 5, 2.6, 'revolver', 6000, 'RU', 2013, { c: 'blk', B: .17, k: 'rhino', big: 1 }, '소총 탄만큼 큰 12.7mm 탄을 쏘는 러시아의 괴물 리볼버.', { rec: .9 });
G('detective', 'Colt Detective Special', 'revolver', '38', 'da', 210, 6, 1.9, 'revolver', 800, 'US', 1927, { c: 'blk', B: .06 }, '총열이 아주 짧은 형사용 리볼버. 주머니에 쏙!', { ads: 1.3, acc: 1.2 });

// ---- 기관단총 ----
G('mp18', 'MP18', 'smg', '9mm', 'auto', 500, 32, 2.6, 'side', 1500, 'DE', 1918, { L: .34, B: .14, mg: 'side', st: 'wood', c: 'wood', h: 'shroud' }, '세계 최초의 기관단총! 1차 대전 참호에서 처음 쓰였어요.', { rec: .75 });
G('m38a', 'Beretta M1938A', 'smg', '9mm', 'auto', 600, 40, 2.3, 'rifle', 2600, 'IT', 1938, { L: .34, B: .2, mg: 'straight', st: 'wood', c: 'wood', h: 'shroud' }, '소총처럼 긴 총열 덕분에 멀리까지 정확한 기관단총.', { acc: .7 });
G('suomi', 'Suomi KP/-31', 'smg', '9mm', 'auto', 900, 70, 3.4, 'drum', 3900, 'FI', 1931, { L: .36, B: .14, mg: 'drum', st: 'wood', c: 'wood', h: 'shroud' }, '눈 덮인 숲에서 싸운 핀란드의 드럼 탄창 기관단총. 70발!');
G('pps43', 'PPS-43', 'smg', '762tok', 'auto', 650, 35, 2.2, 'rifle', 2200, 'RU', 1943, { L: .28, B: .1, mg: 'curved', st: 'fold', c: 'st', h: 'shroud' }, '포위된 도시에서 쇳조각을 찍어 만든 단순하고 튼튼한 총.');
G('owen', 'Owen Gun', 'smg', '9mm', 'auto', 700, 33, 2.3, 'top', 2300, 'AU', 1942, { L: .32, B: .1, mg: 'top', st: 'wire', c: 'st', h: 'none' }, '탄창을 위에 꽂는 호주 기관단총. 진흙 속에서도 고장이 안 났어요.');
G('mat49', 'MAT-49', 'smg', '9mm', 'auto', 600, 32, 2.1, 'rifle', 1800, 'FR', 1949, { L: .28, B: .08, mg: 'straight', st: 'wire', c: 'st' }, '탄창을 앞으로 접어 넣을 수 있는 프랑스 기관단총.');
G('cgm45', 'Carl Gustaf m/45', 'smg', '9mm', 'auto', 600, 36, 2.2, 'rifle', 2000, 'SE', 1945, { L: .32, B: .1, mg: 'straight', st: 'fold', c: 'st', h: 'shroud' }, '‘스웨덴 K’라 불린 튼튼한 기관단총. 아주 오래 쓰였어요.', { rec: .85 });
G('madsen50', 'Madsen M-50', 'smg', '9mm', 'auto', 550, 32, 2.1, 'rifle', 1700, 'DK', 1950, { L: .28, B: .08, mg: 'straight', st: 'fold', c: 'st' }, '조개처럼 몸통이 반으로 열리는 덴마크 기관단총.', { rec: .8 });
G('sa25', 'Sa 25', 'smg', '9mm', 'auto', 650, 24, 1.9, 'grip', 2100, 'CZ', 1948, { L: .26, B: .07, mg: 'grip', st: 'fold', c: 'st', k: 'uzi' }, '손잡이에 탄창을 꽂는 방식을 처음 쓴 체코 기관단총.');
G('mp5k', 'H&K MP5K', 'smg', '9mm', 'auto', 900, 30, 2.0, 'hk', 3600, 'DE', 1976, { L: .23, B: .03, mg: 'curvedS', st: 'none', fg: 1, h: 'none' }, '서류 가방에 숨길 만큼 짧게 줄인 MP5.', { ads: 1.2, rec: 1.1 });
G('colt635', 'Colt 9mm SMG', 'smg', '9mm', 'auto', 900, 32, 2.1, 'rifle', 3400, 'US', 1982, { L: .3, B: .1, mg: 'straight', st: 'fixed', h: 'round', carry: 1 }, 'M16처럼 생겼지만 권총탄을 쓰는 기관단총. 반동이 아주 작아요.', { rec: .75 });
G('calico', 'Calico M960', 'smg', '9mm', 'auto', 750, 50, 2.7, 'helical', 3300, 'US', 1990, { L: .3, B: .08, mg: 'helical', st: 'fold', c: 'blk' }, '나선 모양 원통 탄창에 50발이 빙글빙글 들어가요.');
G('spectre', 'Spectre M4', 'smg', '9mm', 'auto', 850, 50, 2.4, 'rifle', 3800, 'IT', 1983, { L: .28, B: .07, mg: 'straight', st: 'fold', fg: 1 }, '4줄로 탄을 쌓아 짧은 탄창에 50발을 넣었어요.');
G('mac11', 'MAC-11', 'smg', '380', 'auto', 1200, 32, 1.8, 'grip', 1700, 'US', 1972, { L: .17, B: .03, mg: 'grip', st: 'none', k: 'mac' }, 'MAC-10의 동생. 손바닥만 한데 엄청 빨리 쏴요.', { rec: 1.25, acc: 1.25, ads: 1.2 });
G('kedr', 'PP-91 Kedr', 'smg', '9x18', 'auto', 1000, 30, 1.9, 'rifle', 2400, 'RU', 1994, { L: .22, B: .04, mg: 'straight', st: 'fold', c: 'blk' }, '‘삼나무’라는 이름의 작은 러시아 경찰 기관단총.', { ads: 1.15 });
G('vityaz', 'PP-19-01 Vityaz', 'smg', '9mm', 'auto', 750, 30, 2.3, 'ak', 3500, 'RU', 2004, { k: 'ak', c: 'blk', mg: 'straight', st: 'fold', L: .32, B: .1 }, 'AK와 똑같이 다루는 권총탄 기관단총. 아주 튼튼해요.', { rec: .75 });
G('veresk', 'SR-2 Veresk', 'smg', '9x21', 'auto', 900, 30, 2.0, 'rifle', 4600, 'RU', 2000, { L: .26, B: .06, mg: 'straight', st: 'fold', c: 'blk', fg: 1 }, '조끼를 뚫는 규르자 탄을 쓰는 러시아 특수부대 기관단총.');
G('apc9', 'B&T APC9', 'smg', '9mm', 'auto', 1080, 30, 2.0, 'rifle', 4400, 'CH', 2011, { L: .28, B: .07, mg: 'straight', st: 'fold', h: 'rail', rail: 1 }, '미국 육군도 고른 스위스의 최신 기관단총.', { rec: .85, acc: .85 });
G('pmx', 'Beretta PMX', 'smg', '9mm', 'auto', 900, 30, 2.0, 'rifle', 3900, 'IT', 2017, { L: .29, B: .07, mg: 'straight', st: 'fold', h: 'rail', rail: 1, c: 'tan' }, '이탈리아 경찰의 새 기관단총. 가볍고 다루기 쉬워요.', { rec: .85 });
G('z84', 'Star Z-84', 'smg', '9mm', 'auto', 600, 30, 2.0, 'grip', 2300, 'ES', 1985, { L: .25, B: .05, mg: 'grip', st: 'fold', k: 'uzi' }, '스페인의 작고 묵직한 기관단총. 느린 연사로 다루기 쉬워요.', { rec: .8, acc: .9 });
G('pm63', 'PM-63 RAK', 'smg', '9x18', 'auto', 650, 25, 1.8, 'grip', 1900, 'PL', 1963, { L: .2, B: .03, mg: 'grip', st: 'wire', fg: 1, k: 'mac' }, '권총처럼 슬라이드가 움직이는 신기한 폴란드 기관단총.', { ads: 1.2 });
G('reising', 'Reising M50', 'smg', '45acp', 'auto', 550, 20, 2.2, 'rifle', 1900, 'US', 1941, { L: .32, B: .16, mg: 'straight', st: 'trad', c: 'wood', h: 'wood' }, '나무 개머리판의 소총처럼 생긴 미 해병대의 .45 기관단총.', { acc: .8 });

// ---- 돌격소총 ----
G('k1a', 'Daewoo K1A', 'ar', '556', 'auto', 800, 30, 2.2, 'rifle', 5800, 'KR', 1982, { st: 'wire', h: 'round', B: .13, L: .32 }, '대한민국 특전사의 짧은 소총! 철사 개머리판을 쭉 뽑아 써요.', { ads: 1.15, acc: 1.05 });
G('stc16', 'SNT STC-16', 'ar', '556', 'auto', 800, 30, 2.2, 'rifle', 8600, 'KR', 2016, { st: 'fold', h: 'rail', rail: 1, c: 'tan', B: .18 }, '대한민국 특수부대를 위해 새로 만든 최신 카빈.', { acc: .85, rec: .85, ads: 1.05 });
G('m16a2', 'M16A2', 'ar', '556', 'b3', 800, 30, 2.3, 'rifle', 5600, 'US', 1983, { carry: 1, h: 'round', c: 'blk', B: .3 }, '3발씩 끊어 쏘도록 바꾼 M16. 탄을 아껴 쓸 수 있어요.', { acc: .8 });
G('c7', 'Colt Canada C7', 'ar', '556', 'auto', 800, 30, 2.3, 'rifle', 5800, 'CA', 1984, { carry: 1, h: 'round', c: 'od', B: .3 }, '캐나다군의 M16. 초록색 몸통이 특징이에요.', { acc: .85 });
G('xm7', 'SIG XM7', 'ar', '277fury', 'auto', 650, 20, 2.4, 'rifle', 13500, 'US', 2022, { h: 'rail', rail: 1, st: 'fold', c: 'tan', mg: 'straight', brake: 1 }, '미 육군의 다음 세대 소총. 새로 만든 강한 탄을 써요.', { rec: 1.1, acc: .8 });
G('hk33', 'H&K HK33', 'ar', '556', 'auto', 750, 30, 2.3, 'hk', 5600, 'DE', 1968, { mg: 'curvedS', st: 'fixed', h: 'box', c: 'blk' }, 'G3를 작게 만든 형제 소총. 장전 손잡이를 탁 쳐서 장전해요.');
G('fnc', 'FN FNC', 'ar', '556', 'auto', 700, 30, 2.3, 'rifle', 6200, 'BE', 1979, { st: 'fold', h: 'round', c: 'blk' }, '벨기에의 튼튼한 소총. 여러 나라 군대가 썼어요.', { rec: .9 });
G('ar7090', 'Beretta AR70/90', 'ar', '556', 'auto', 700, 30, 2.3, 'rifle', 6000, 'IT', 1990, { st: 'fixed', h: 'box', carry: 1, c: 'blk' }, '손잡이를 떼어 낼 수 있는 이탈리아 소총.');
G('arx160', 'Beretta ARX160', 'ar', '556', 'auto', 700, 30, 2.2, 'rifle', 7600, 'IT', 2008, { st: 'fold', h: 'rail', rail: 1, c: 'od' }, '탄피가 나오는 방향을 왼쪽·오른쪽으로 바꿀 수 있어요.', { ads: 1.1 });
G('rk62', 'Valmet Rk 62', 'ar', '762x39', 'auto', 700, 30, 2.4, 'ak', 5800, 'FI', 1962, { k: 'ak', c: 'blk', st: 'wire' }, '핀란드가 다듬은 AK. 원래 AK보다 훨씬 정확해요.', { acc: .75 });
G('ak5', 'Bofors Ak 5', 'ar', '556', 'auto', 700, 30, 2.3, 'rifle', 6400, 'SE', 1986, { st: 'fold', h: 'round', c: 'od' }, '추운 나라를 위해 장갑을 끼고도 쏠 수 있게 만든 스웨덴 소총.', { rec: .9 });
G('beryl', 'FB Beryl wz.96', 'ar', '556', 'auto', 700, 30, 2.4, 'ak', 6200, 'PL', 1996, { k: 'ak', c: 'blk', st: 'fold', rail: 1, brake: 1 }, 'AK를 NATO 탄에 맞게 바꾼 폴란드 소총.', { rec: .85 });
G('grot', 'FB MSBS Grot', 'ar', '556', 'auto', 700, 30, 2.2, 'rifle', 8000, 'PL', 2017, { st: 'fold', h: 'rail', rail: 1, c: 'od' }, '폴란드어로 ‘화살촉’이라는 뜻의 최신 소총.', { acc: .85 });
G('amd65', 'AMD-65', 'ar', '762x39', 'auto', 600, 30, 2.4, 'ak', 5200, 'HU', 1965, { k: 'ak', c: 'blk', st: 'wire', B: .12, fg: 1, brake: 1 }, '앞 손잡이가 달린 짧은 헝가리 AK. 좁은 동굴에서 휘두르기 좋아요.', { ads: 1.15, rec: 1.15 });
G('m70', 'Zastava M70', 'ar', '762x39', 'auto', 620, 30, 2.5, 'ak', 5000, 'YU', 1970, { k: 'ak', c: 'wood', bay: 1 }, '더 두꺼운 몸통으로 튼튼하게 만든 유고슬라비아 AK.', { rec: .95 });
G('aek971', 'AEK-971', 'ar', '545', 'auto', 900, 30, 2.4, 'ak', 9200, 'RU', 1978, { k: 'ak', c: 'blk', st: 'fold', brake: 1 }, '안에 있는 추가 반대로 움직여 반동을 지워 주는 신기한 소총.', { rec: .55 });
G('sr3', 'SR-3 Vikhr', 'ar', '9x39', 'auto', 900, 20, 2.1, 'rifle', 9000, 'RU', 1996, { st: 'fold', mg: 'straight', B: .1, L: .27, c: 'blk' }, '‘회오리바람’이라는 이름의 작은 소총. 짧은데 탄이 무거워요.', { ads: 1.2, quiet: 1 });
G('type81', 'Type 81', 'ar', '762x39', 'auto', 700, 30, 2.4, 'ak', 5000, 'CN', 1981, { k: 'ak', c: 'wood' }, 'AK처럼 생겼지만 반동이 더 부드러운 중국 소총.', { rec: .85 });
G('qbz191', 'QBZ-191', 'ar', '58', 'auto', 750, 30, 2.3, 'rifle', 8200, 'CN', 2019, { st: 'fold', h: 'rail', rail: 1, c: 'blk', sg: 'dot' }, '불펍 대신 다시 일반형으로 돌아온 중국의 새 소총.', { acc: .8 });
G('type20', 'Howa Type 20', 'ar', '556', 'auto', 750, 30, 2.2, 'rifle', 8000, 'JP', 2020, { st: 'fold', h: 'rail', rail: 1, c: 'tan' }, '바닷물에 젖어도 녹이 잘 안 스는 일본의 새 소총.', { acc: .85 });
G('insas', 'INSAS', 'ar', '556', 'b3', 650, 20, 2.3, 'rifle', 5200, 'IN', 1998, { st: 'fixed', h: 'box', mg: 'curvedS', clear: 1, c: 'blk' }, '인도의 소총. 투명한 탄창으로 남은 탄을 볼 수 있어요.');
G('r4', 'Vektor R4', 'ar', '556', 'auto', 650, 35, 2.5, 'ak', 6000, 'ZA', 1980, { k: 'ak', c: 'blk', st: 'fold', bipod: 1 }, '남아공의 넓은 초원을 위해 만든 튼튼한 소총.');
G('ia2', 'IMBEL IA2', 'ar', '556', 'auto', 700, 30, 2.3, 'rifle', 6600, 'BR', 2012, { st: 'fold', h: 'rail', rail: 1, c: 'blk' }, '브라질 군대가 직접 만든 새 소총.');
G('cetmel', 'CETME L', 'ar', '556', 'auto', 700, 30, 2.3, 'hk', 5600, 'ES', 1984, { mg: 'straight', st: 'fixed', h: 'box', c: 'blk' }, '스페인 소총. G3와 같은 피가 흐르는 형제예요.');
G('x95', 'IWI X95', 'ar', '556', 'auto', 850, 30, 2.4, 'bullpup', 8600, 'IL', 2009, { bull: 1, c: 'tan', rail: 1, sg: 'holo' }, '타보르를 더 짧고 가볍게 다듬은 불펍 소총.', { ads: 1.15 });
G('fedorov', 'Fedorov Avtomat', 'ar', '65ari', 'auto', 450, 25, 2.6, 'rifle', 6600, 'RU', 1916, { mg: 'curvedS', st: 'trad', c: 'wood', h: 'wood', fg: 1, B: .26 }, '100년도 더 전에 만든 자동 소총. 돌격소총의 조상님이에요.', { acc: .9, rec: .9 });
G('ar18', 'ArmaLite AR-18', 'ar', '556', 'auto', 750, 20, 2.2, 'rifle', 5400, 'US', 1963, { st: 'fold', h: 'box', mg: 'straight', c: 'blk' }, '쇠판을 찍어 싸게 만든 소총. 많은 소총의 설계도가 됐어요.');
G('mini14', 'Ruger Mini-14', 'ar', '556', 'semi', 450, 20, 2.2, 'rifle', 4200, 'US', 1973, { st: 'trad', c: 'wood', h: 'wood', mg: 'straight', trad: 1 }, '작은 M14처럼 생긴 나무 소총. 반자동이지만 정확해요.', { acc: .7, rec: .8 });

// ---- 전투소총 · 지정사수 ----
G('g43', 'Gewehr 43', 'br', '792', 'semi', 300, 10, 2.5, 'rifle', 6000, 'DE', 1943, { c: 'wood', mg: 'straight', st: 'trad', h: 'wood', L: .42, B: .38, trad: 1 }, '갈아 끼우는 10발 탄창을 단 독일의 반자동 소총.', { acc: .75 });
G('svt40', 'SVT-40', 'br', '762r', 'semi', 330, 10, 2.5, 'rifle', 5600, 'RU', 1940, { c: 'wood', mg: 'straight', st: 'trad', h: 'wood', L: .42, B: .4, trad: 1, brake: 1 }, '‘스베타’라는 별명의 소련 반자동 소총.', { rec: 1.1 });
G('avs36', 'AVS-36', 'br', '762r', 'auto', 600, 15, 2.6, 'rifle', 7200, 'RU', 1936, { c: 'wood', mg: 'straight', st: 'trad', h: 'wood', L: .42, B: .4, trad: 1, brake: 1, bay: 1 }, '센 소총탄을 자동으로 쏘는 옛 소련 소총. 반동이 엄청나요!', { rec: 1.4 });
G('johnson41', 'Johnson M1941', 'br', '3006', 'semi', 300, 10, 2.4, 'boltClip', 5800, 'US', 1941, { c: 'wood', mg: 'internal', st: 'trad', h: 'wood', L: .42, B: .4, trad: 1 }, '빙글 도는 탄창에 클립으로 10발을 넣는 해병대 소총.', { acc: .75 });
G('fn49', 'FN Model 49', 'br', '3006', 'semi', 300, 10, 2.4, 'boltClip', 5600, 'BE', 1949, { c: 'wood', mg: 'internal', st: 'trad', h: 'wood', L: .42, B: .4, trad: 1 }, 'FAL보다 먼저 나온 벨기에의 반자동 소총.', { acc: .8 });
G('mas49', 'MAS-49', 'br', '75fr', 'semi', 300, 10, 2.5, 'rifle', 5800, 'FR', 1949, { c: 'wood', mg: 'straight', st: 'trad', h: 'wood', L: .42, B: .38, trad: 1 }, '조준경을 달 수 있게 만든 프랑스 반자동 소총.', { acc: .7 });
G('ar10', 'ArmaLite AR-10', 'br', '762n', 'auto', 700, 20, 2.5, 'rifle', 8400, 'US', 1956, { c: 'tan', mg: 'straight', carry: 1, h: 'round', L: .4, B: .34 }, 'M16의 큰형. 가벼운 알루미늄과 플라스틱으로 만들었어요.', { rec: 1.15 });
G('sr25', 'KAC SR-25', 'br', '762n', 'semi', 350, 20, 2.5, 'rifle', 12800, 'US', 1990, { c: 'blk', mg: 'straight', st: 'fixed', h: 'rail', rail: 1, L: .42, B: .42, sg: 'scope', bipod: 1 }, '네이비씰 저격수가 쓴 정밀한 반자동 소총.', { zoom: 6, acc: .35 });
G('hk417', 'H&K HK417', 'br', '762n', 'auto', 600, 20, 2.5, 'rifle', 11500, 'DE', 2005, { c: 'blk', mg: 'straight', st: 'fold', h: 'rail', rail: 1, L: .4, B: .32 }, 'HK416의 큰 탄 버전. 강하면서도 정확해요.', { acc: .7 });
G('l129a1', 'L129A1', 'br', '762n', 'semi', 360, 20, 2.5, 'rifle', 12000, 'UK', 2010, { c: 'od', mg: 'straight', st: 'fixed', h: 'rail', rail: 1, L: .42, B: .4, sg: 'acog' }, '아프가니스탄의 넓은 계곡을 위해 고른 영국 지정사수 소총.', { acc: .45 });
G('mk12', 'Mk 12 SPR', 'br', '556', 'semi', 400, 30, 2.3, 'rifle', 9000, 'US', 2002, { c: 'blk', mg: 'curvedS', st: 'fixed', h: 'round', L: .38, B: .4, sg: 'scope', bipod: 1 }, '작은 탄을 쓰지만 무거운 탄두로 멀리까지 정확한 특수부대 소총.', { zoom: 4, acc: .4, dm: 1.15, rec: .7 });
G('qbu88', 'QBU-88', 'br', '58', 'semi', 350, 10, 2.5, 'bullpup', 9500, 'CN', 1997, { bull: 1, c: 'blk', mg: 'straight', sg: 'scope' }, '짧은 불펍 몸통에 긴 총열을 넣은 중국 지정사수 소총.', { zoom: 4, acc: .45 });
G('m76', 'Zastava M76', 'br', '792', 'semi', 300, 10, 2.6, 'ak', 10500, 'YU', 1976, { k: 'ak', c: 'wood', mg: 'straight', st: 'wood', L: .44, B: .5, sg: 'scope' }, 'AK를 길게 늘인 유고슬라비아 저격소총. 한 방이 묵직해요.', { zoom: 4, acc: .5, rec: 1.1 });

// ---- 저격 · 볼트액션 · 레버액션 ----
G('gew98', 'Gewehr 98', 'sniper', '792', 'bolt', 50, 5, 2.7, 'boltClip', 5000, 'DE', 1898, { B: .56, L: .36 }, 'Kar98k의 아빠. 더 길고 정확한 1차 대전 소총이에요.', { acc: .85 });
G('smle', 'SMLE Mk III', 'sniper', '303', 'bolt', 85, 10, 2.8, 'boltClip', 5200, 'UK', 1907, { mg: 'straight', B: .42 }, '‘미친 1분’ 훈련으로 1분에 15발을 쏘던 영국 소총.', { ads: 1.1 });
G('m1917', 'M1917 Enfield', 'sniper', '3006', 'bolt', 55, 6, 2.6, 'boltClip', 5300, 'US', 1917, { B: .5 }, '1차 대전 때 미군이 가장 많이 들었던 볼트액션 소총.', { acc: .8 });
G('k31', 'Schmidt-Rubin K31', 'sniper', '75swiss', 'bolt', 90, 6, 2.5, 'boltClip', 6200, 'CH', 1931, { B: .44, c: 'wood' }, '볼트를 앞뒤로만 당기는 ‘직선식’이라 장전이 빨라요. 아주 정확해요.', { acc: .6 });
G('carcano', 'Carcano M91', 'sniper', '65car', 'bolt', 55, 6, 2.4, 'garand', 3600, 'IT', 1891, { B: .5 }, '클립째 쑥 넣고, 다 쏘면 클립이 아래로 툭 떨어져요.');
G('lebel', 'Lebel M1886', 'sniper', '8lebel', 'bolt', 45, 8, .65, 'boltLoad', 4400, 'FR', 1886, { B: .58, L: .36 }, '연기가 거의 안 나는 화약을 처음 쓴 소총. 총열 아래 관에 한 발씩 넣어요.');
G('type38', 'Arisaka Type 38', 'sniper', '65ari', 'bolt', 55, 5, 2.5, 'boltClip', 4000, 'JP', 1905, { B: .56 }, '작은 탄이라 반동이 순하고 정확한 일본 소총.', { rec: .8, acc: .85 });
G('m1895m', 'Steyr-Mannlicher M1895', 'sniper', '8mann', 'bolt', 85, 5, 2.4, 'garand', 4600, 'AT', 1895, { B: .46 }, '볼트를 당기고 밀기만 하는 직선식 소총. 클립째 넣어 장전해요.');
G('axmc', 'AI AXMC', 'sniper', '338', 'bolt', 45, 10, 3.0, 'boltMag', 26000, 'UK', 2010, { sg: 'scope', c: 'tan', st: 'fold', mg: 'straight', brake: 1, bipod: 1 }, '총열을 바꿔 여러 탄을 쓸 수 있는 영국 최신 저격총. 탄창도 10발!', { zoom: 8, acc: .22 });
G('trg42', 'Sako TRG-42', 'sniper', '338', 'bolt', 45, 5, 2.9, 'boltMag', 23000, 'FI', 1999, { sg: 'scope', c: 'od', st: 'thumb', mg: 'straight', brake: 1 }, '추운 핀란드에서 만든 아주 정밀한 저격총.', { zoom: 8, acc: .2 });
G('ssg69', 'Steyr SSG 69', 'sniper', '762n', 'bolt', 55, 5, 2.7, 'boltMag', 11000, 'AT', 1969, { sg: 'scope', c: 'od', mg: 'straight' }, '빙글 도는 원통 탄창을 쓰는 오스트리아 저격총.', { zoom: 6, acc: .28 });
G('dsr1', 'DSR-1', 'sniper', '338', 'bolt', 45, 5, 2.8, 'boltMag', 28000, 'DE', 2000, { bull: 1, sg: 'scope', c: 'blk', mg: 'straight', bipod: 1 }, '탄창이 손잡이 뒤에 있는 불펍 저격총. 짧아서 다루기 쉬워요.', { zoom: 8, acc: .22, ads: 1.15 });
G('k14', 'Daewoo K14', 'sniper', '762n', 'bolt', 55, 5, 2.7, 'boltMag', 14000, 'KR', 2013, { sg: 'scope', c: 'blk', st: 'fold', mg: 'straight', bipod: 1 }, '대한민국 저격수의 저격소총! 멀리 있는 목표도 정확히 맞혀요.', { zoom: 8, acc: .28 });
G('ptrd41', 'PTRD-41', 'sniper', '145', 'bolt', 25, 1, 1.0, 'boltLoad', 34000, 'RU', 1941, { c: 'wood', L: .45, B: .8, brake: 1, bipod: 1, big: 1 }, '탱크를 잡으려고 만든 대전차 소총. 한 발 쏘고 한 발 넣어요.', { rec: 1.2, ads: .7 });
G('win1894', 'Winchester 1894', 'sniper', '3030', 'lever', 110, 7, .45, 'lever', 3800, 'US', 1894, { k: 'lever', c: 'wood' }, '사냥꾼들이 가장 사랑한 레버액션 소총. 700만 자루 넘게 만들어졌어요.');
G('win1886', 'Winchester 1886', 'sniper', '4570', 'lever', 85, 8, .5, 'lever', 5600, 'US', 1886, { k: 'lever', c: 'st', B: .5 }, '아주 큰 탄을 쓰는 힘센 레버액션. 들소도 잡았어요.', { rec: 1.1 });
G('sharps', 'Sharps 1874', 'sniper', '4570', 'single', 35, 1, 1.4, 'martini', 3800, 'US', 1874, { c: 'wood', B: .6 }, '1km 넘게 떨어진 곳을 맞혔다는 전설의 단발 소총.', { acc: .45, dm: 1.05 });
G('barrettm95', 'Barrett M95', 'sniper', '50bmg', 'bolt', 35, 5, 3.4, 'boltMag', 34000, 'US', 1995, { bull: 1, sg: 'scope', c: 'blk', mg: 'straight', brake: 1, bipod: 1, big: 1, B: .6 }, '.50 대물 저격총을 불펍으로 줄였어요. 괴물 여러 마리를 뚫어요.', { zoom: 10, acc: .25 });

// ---- 산탄총 ----
G('m3super90', 'Benelli M3 Super 90', 'shotgun', '12ga', 'semi', 220, 7, .45, 'shell', 5400, 'IT', 1989, { c: 'blk', st: 'fixed' }, '스위치 하나로 반자동과 펌프를 바꿀 수 있는 산탄총.', { rec: .9 });
G('m590a1', 'Mossberg 590A1', 'shotgun', '12ga', 'pump', 80, 9, .5, 'shell', 3600, 'US', 1987, { c: 'blk', h: 'shroud' }, '미군이 쓰는 9발짜리 튼튼한 펌프 산탄총.');
G('r1100', 'Remington 1100', 'shotgun', '12ga', 'semi', 230, 5, .5, 'shell', 3800, 'US', 1963, { c: 'wood', noPump: 1 }, '가스로 반동을 줄여 주는 부드러운 반자동 산탄총.', { rec: .75 });
G('auto5', 'Browning Auto-5', 'shotgun', '12ga', 'semi', 200, 5, .5, 'shell', 3400, 'BE', 1902, { c: 'wood', noPump: 1 }, '세계 최초의 반자동 산탄총. 뒷부분이 네모나서 ‘곱사등’이라 불렸어요.');
G('win12', 'Winchester Model 12', 'shotgun', '12ga', 'pump', 100, 6, .5, 'shell', 3000, 'US', 1912, { c: 'wood' }, '방아쇠를 누른 채 펌프만 하면 계속 쏴지는 ‘완벽한 리피터’.');
G('ks23', 'KS-23', 'shotgun', '23mm', 'pump', 60, 3, .6, 'shell', 4800, 'RU', 1971, { c: 'wood', B: .45 }, '대포 포신으로 만든 거대한 23mm 산탄총. 한 방이 엄청나요!', { rec: 1.2 });
G('striker', 'Armsel Striker', 'shotgun', '12ga', 'semi', 300, 12, .5, 'shell', 6400, 'ZA', 1981, { c: 'blk', mg: 'drum', st: 'fold', noPump: 1, B: .3, fg: 1 }, '리볼버처럼 빙글 도는 큰 원통에 12발이 들어가요.');
G('uts15', 'UTAS UTS-15', 'shotgun', '12ga', 'pump', 80, 14, .45, 'shell', 6000, 'TR', 2012, { bull: 1, c: 'tan', tubes: 2 }, '튜브 두 개를 번갈아 쓰는 튀르키예 불펍 산탄총.');
G('spas15', 'Franchi SPAS-15', 'shotgun', '12ga', 'semi', 220, 6, 2.5, 'rifle', 6200, 'IT', 1986, { c: 'blk', mg: 'straight', st: 'fold', carry: 1, noPump: 1, h: 'box' }, '소총처럼 상자 탄창을 갈아 끼우는 산탄총.');
G('nova', 'Benelli Nova', 'shotgun', '12ga', 'pump', 80, 4, .5, 'shell', 2400, 'IT', 1999, { c: 'blk' }, '몸통과 개머리판이 한 덩어리로 된 플라스틱 펌프 산탄총.', { rec: .9 });
G('lupara', 'Lupara', 'shotgun', '12ga', 'single', 400, 2, 2.0, 'break', 1300, 'IT', 1900, { k: 'double', c: 'wood', B: .2 }, '총열을 짧게 자른 이탈리아 시골의 쌍열 산탄총. 가까이서 아주 세요.', { dm: 1.2, ads: 1.2 });
G('mag7', 'Techno Arms MAG-7', 'shotgun', '12ga', 'pump', 80, 5, 2.3, 'grip', 3300, 'ZA', 1995, { c: 'blk', mg: 'grip', st: 'fold', B: .3 }, '권총처럼 손잡이에 탄창을 꽂는 특이한 펌프 산탄총.');

// ---- 기관총 ----
G('bar', 'M1918 BAR', 'lmg', '3006', 'auto', 550, 20, 2.6, 'rifle', 9500, 'US', 1918, { c: 'wood', mg: 'straight', st: 'trad', h: 'wood', L: .44, B: .4, bipod: 1 }, '한 사람이 들고 걸으며 쏘는 ‘브라우닝 자동소총’.', { rec: 1.25 });
G('chauchat', 'Chauchat', 'lmg', '8lebel', 'auto', 250, 20, 2.8, 'rifle', 6500, 'FR', 1915, { c: 'wood', mg: 'curved', st: 'wood', h: 'shroud', L: .46, B: .38, bipod: 1 }, '반달 모양 탄창의 프랑스 기관총. 느리지만 한 발이 묵직해요.', { acc: 1.3, rec: 1.15 });
G('mg34', 'MG34', 'lmg', '792', 'auto', 850, 100, 4.8, 'belt', 18000, 'DE', 1934, { c: 'blk', h: 'shroud', st: 'fixed' }, '세계 최초의 범용 기관총. MG42의 형이에요.', { rec: 1.1 });
G('type96', 'Type 96 경기관총', 'lmg', '65ari', 'auto', 500, 30, 2.6, 'top', 8500, 'JP', 1936, { c: 'wood', mg: 'top', st: 'wood', h: 'none', bipod: 1, bay: 1, L: .44, B: .4 }, '조준경과 총검까지 달린 일본 경기관총.', { zoom: 2.5, acc: .7 });
G('rpd', 'RPD', 'lmg', '762x39', 'auto', 700, 100, 4.6, 'belt', 13500, 'RU', 1944, { c: 'wood', st: 'wood', h: 'none' }, '둥근 통 속 100발 탄띠로 쏘는 가벼운 소련 기관총.');
G('mg4', 'H&K MG4', 'lmg', '556', 'auto', 850, 200, 4.4, 'belt', 17000, 'DE', 2005, { c: 'blk', st: 'fold', rail: 1 }, '가볍고 반동이 적은 독일 경기관총.', { rec: .8 });
G('l86', 'L86A2 LSW', 'lmg', '556', 'auto', 700, 30, 2.6, 'bullpup', 10500, 'UK', 1985, { bull: 1, mg: 'curved', c: 'blk', sg: 'acog', B: .42, bipod: 1 }, '긴 총열과 조준경을 단 불펍 분대 지원 화기. 아주 정확해요.', { acc: .55 });
G('k12', 'Daewoo K12', 'lmg', '762n', 'auto', 700, 100, 4.8, 'belt', 17500, 'KR', 2012, { c: 'blk', st: 'fixed', rail: 1 }, '대한민국이 만든 7.62mm 기관총! 헬기에도 달려요.', { rec: 1.05 });
G('k15', 'SNT K15', 'lmg', '556', 'auto', 800, 200, 4.4, 'belt', 17000, 'KR', 2019, { c: 'blk', st: 'fold', rail: 1, sg: 'dot' }, '대한민국의 새 경기관총! 조준기가 달려 있어 정확해요.', { acc: .8, rec: .85 });
G('maxim', 'Maxim M1910', 'lmg', '762r', 'auto', 600, 250, 5.4, 'belt', 16000, 'RU', 1910, { c: 'st', h: 'cooler', st: 'none', bipod: 0 }, '물통으로 총열을 식히는 옛 기관총. 하루 종일 쏴도 끄떡없어요.', { rec: .85, acc: 1.2 });

// ---- 특수 화기 ----
G('rg6', 'RG-6 유탄발사기', 'special', '40mm', 'semi', 140, 6, 4.2, 'mgl', 32000, 'RU', 1994, { k: 'mgl' }, '러시아의 회전식 유탄발사기. 6발을 연달아 쏴요.');
G('m320', 'M320 유탄발사기', 'special', '40mm', 'single', 60, 1, 1.4, 'm79', 19000, 'DE', 2008, { k: 'm79' }, '옆으로 열려서 빠르게 장전하는 최신 유탄발사기.');
G('hk69', 'HK69A1', 'special', '40mm', 'single', 55, 1, 1.5, 'm79', 17000, 'DE', 1969, { k: 'm79' }, '접히는 개머리판이 달린 독일의 작은 유탄발사기.');
G('bazooka', 'M1 바주카', 'special', '60rkt', 'single', 30, 1, 3.2, 'rocket', 22000, 'US', 1942, { k: 'rpg' }, '‘바주카’라는 악기 이름을 얻은 최초의 로켓 발사기.');
G('panzerschreck', 'Panzerschreck', 'special', '88rkt', 'single', 25, 1, 3.4, 'rocket', 27000, 'DE', 1943, { k: 'rpg' }, '‘전차 공포’라는 뜻의 굵은 로켓 발사기. 폭발이 커요.');
G('carlgustaf', 'Carl Gustaf M2', 'special', '84mm', 'single', 25, 1, 3.6, 'rocket', 38000, 'SE', 1948, { k: 'rpg' }, '총열에 강선이 있는 무반동포. 멀리까지 곧게 날아가 크게 폭발해요.');
G('gatling', 'Gatling M1874', 'special', '4570', 'auto', 400, 40, 4.2, 'minigun', 26000, 'US', 1874, { k: 'minigun', c: 'st' }, '손잡이를 돌리면 총열 여러 개가 돌며 쏘는 미니건의 할아버지.', { spin: .9, rec: .5 });
G('xm214', 'XM214 마이크로건', 'special', '556', 'auto', 4000, 500, 5.0, 'minigun', 52000, 'US', 1970, { k: 'minigun' }, '미니건을 작은 탄에 맞게 줄인 실험 무기. 엄청 빨라요!', { spin: .5, rec: .2 });

GUNS.forEach(g => GUN[g.id] = g);
