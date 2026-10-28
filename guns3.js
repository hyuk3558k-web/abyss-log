'use strict';
// =====================================================================
//  심연 탐사록 - 총 추가 목록 3 (300종, 권총·리볼버 없음)  → guns2.js 다음에 불러와요
//  G(아이디, 이름, 종류, 탄약, 발사방식, 분당발사수, 탄창, 장전시간, 장전동작, 가격, 나라, 연도, 모양, 설명, 특징)
// =====================================================================

Object.assign(NATIONS, { NL: '네덜란드', NO: '노르웨이', PT: '포르투갈', GR: '그리스', RO: '루마니아', BG: '불가리아', TW: '대만', MX: '멕시코', UA: '우크라이나', RS: '세르비아', ID: '인도네시아', IR: '이란', EG: '이집트' });

Object.assign(CAL, {
  '40sw': { n: '.40 S&W', d: 28, r: .75, rg: 24 },
  '9x25': { n: '9×25mm 마우저', d: 27, r: .65, rg: 30 },
  '9glis': { n: '9mm 글리센티', d: 22, r: .55, rg: 22 },
  '9x23': { n: '9mm 라르고', d: 26, r: .65, rg: 26 },
  '65swe': { n: '6.5×55mm 스웨덴', d: 48, r: 1.1, rg: 90, pen: 1 },
  '765l': { n: '7.65mm 롱', d: 18, r: .4, rg: 22 },
  '58x21': { n: '5.8×21mm', d: 23, r: .45, rg: 33, pen: 1 },
  '68spc': { n: '6.8mm SPC', d: 36, r: .72, rg: 60 },
  '280': { n: '.280 브리티시', d: 44, r: 1.0, rg: 75 },
  '65cm': { n: '6.5mm 크리드무어', d: 52, r: 1.1, rg: 115, pen: 1 },
  '300wm': { n: '.300 윈체스터 매그넘', d: 95, r: 2.2, rg: 130, pen: 2 },
  '93x64': { n: '9.3×64mm 브렌네케', d: 72, r: 2.0, rg: 100, pen: 1 },
  '7x57': { n: '7×57mm 마우저', d: 54, r: 1.4, rg: 90, pen: 1 },
  '3040': { n: '.30-40 크라그', d: 52, r: 1.4, rg: 85, pen: 1 },
  '127x108': { n: '12.7×108mm', d: 200, r: 3.4, rg: 200, pen: 3 },
  '20mm': { n: '20mm 대물탄', d: 290, r: 3.9, rg: 220, pen: 3 },
  '55boys': { n: '.55 보이스', d: 220, r: 3.4, rg: 150, pen: 3 },
  '10ga': { n: '10게이지 산탄', d: 16, r: 2.4, rg: 15, pel: 10 },
  '20ga': { n: '20게이지 산탄', d: 12, r: 1.5, rg: 12, pel: 8 },
  '20gl': { n: '20mm 공중폭발탄', d: 150, r: 1.5, rg: 70, ex: 3.5 },
  '25mm': { n: '25mm 공중폭발탄', d: 190, r: 1.6, rg: 90, ex: 3.8 },
  '35mm': { n: '35mm 유탄', d: 200, r: 1.7, rg: 70, ex: 4 },
  'm72': { n: '66mm LAW 로켓', d: 380, r: 1.6, rg: 70, ex: 5.5, rocket: 1 },
  'pf60': { n: '판처파우스트 탄두', d: 360, r: 1.4, rg: 45, ex: 5.5, rocket: 1 },
  'pf3': { n: '110mm 판처파우스트 3', d: 480, r: 2.2, rg: 75, ex: 6.5, rocket: 1 },
  'piat': { n: 'PIAT 폭탄', d: 330, r: 2.0, rg: 50, ex: 5, rocket: 1 },
  'rpo': { n: '93mm 열압력 로켓', d: 520, r: 2.2, rg: 70, ex: 8, rocket: 1 },
});

// ---- 기관단총 ----
G('ump9', 'H&K UMP9', 'smg', '9mm', 'auto', 650, 30, 2.1, 'rifle', 2800, 'DE', 2000, { L: .3, B: .07, mg: 'straight', st: 'fold', h: 'box', rail: 1 }, 'UMP45의 9mm 동생. 반동이 순해서 오래 쏘기 좋아요.', { rec: .8 });
G('ump40', 'H&K UMP40', 'smg', '40sw', 'auto', 600, 30, 2.1, 'rifle', 3000, 'DE', 2000, { L: .3, B: .07, mg: 'straight', st: 'fold', h: 'box', rail: 1 }, '경찰이 좋아한 .40탄 UMP. 9mm보다 한 방이 세요.');
G('mp510', 'H&K MP5/10', 'smg', '10mm', 'auto', 800, 30, 2.1, 'hk', 3800, 'DE', 1992, { L: .3, B: .06, mg: 'straight', st: 'fold', h: 'round' }, 'FBI를 위해 센 10mm 탄을 쓰게 만든 MP5.', { acc: .85, rec: 1.1 });
G('uzipro', 'IWI Uzi Pro', 'smg', '9mm', 'auto', 1100, 25, 1.9, 'grip', 3000, 'IL', 2010, { L: .2, B: .03, mg: 'grip', st: 'fold', k: 'mac', rail: 1, c: 'blk' }, '플라스틱으로 가볍게 다시 태어난 아주 작은 우지.', { ads: 1.25 });
G('miniuzi', 'IMI Mini Uzi', 'smg', '9mm', 'auto', 950, 25, 1.9, 'grip', 2300, 'IL', 1980, { L: .22, B: .05, mg: 'grip', st: 'wire', k: 'uzi' }, '우지를 줄인 총. 작지만 연사가 빨라져요.', { ads: 1.2 });
G('apc45', 'B&T APC45', 'smg', '45acp', 'auto', 850, 25, 2.1, 'rifle', 4200, 'CH', 2012, { L: .28, B: .08, mg: 'straight', st: 'fold', h: 'rail', rail: 1 }, '스위스에서 만든 .45 기관단총. 위력과 정확함을 다 잡았어요.', { acc: .85 });
G('aug9', 'Steyr AUG 9mm Para', 'smg', '9mm', 'auto', 700, 25, 2.3, 'bullpup', 3600, 'AT', 1988, { k: 'aug', c: 'od' }, 'AUG 소총을 권총탄용으로 바꾼 불펍 기관단총.', { acc: .8, rec: .75 });
G('mpi69', 'Steyr MPi 69', 'smg', '9mm', 'auto', 550, 32, 2.1, 'grip', 1800, 'AT', 1969, { L: .26, B: .05, mg: 'grip', st: 'wire', k: 'uzi', c: 'blk' }, '멜빵을 당겨서 장전하는 신기한 오스트리아 기관단총.');
G('waltherMP', 'Walther MP-L', 'smg', '9mm', 'auto', 550, 32, 2.1, 'rifle', 2000, 'DE', 1963, { L: .28, B: .07, mg: 'straight', st: 'wire', c: 'blk' }, '독일 경찰과 해군이 쓴 납작한 기관단총.');
G('mp28', 'MP28', 'smg', '9mm', 'auto', 600, 32, 2.3, 'side', 1700, 'DE', 1928, { L: .3, B: .3, mg: 'side', st: 'wood', c: 'wood', h: 'shroud' }, '옆에서 탄창을 꽂는 옛 독일 기관단총. MP18을 고친 총이에요.');
G('mp34', 'Steyr-Solothurn MP34', 'smg', '9steyr', 'auto', 800, 32, 2.4, 'side', 2600, 'AT', 1930, { L: .32, B: .3, mg: 'side', st: 'wood', c: 'wood', h: 'shroud' }, '공들여 깎아 만든 ‘기관단총계의 롤스로이스’.', { acc: .85 });
G('mp35', 'Bergmann MP35', 'smg', '9mm', 'auto', 550, 32, 2.3, 'side', 1900, 'DE', 1935, { L: .3, B: .3, mg: 'side', st: 'wood', c: 'wood', h: 'shroud' }, '볼트 손잡이를 소총처럼 뒤에서 당기는 독일 기관단총.');
G('emp35', 'Erma EMP 35', 'smg', '9mm', 'auto', 540, 32, 2.3, 'side', 1800, 'DE', 1931, { L: .3, B: .3, mg: 'side', st: 'wood', c: 'wood', h: 'wood', fg: 1 }, '나무 앞손잡이가 달린 옛 독일 기관단총.');
G('m12', 'Beretta M12', 'smg', '9mm', 'auto', 550, 32, 2.0, 'rifle', 2300, 'IT', 1959, { L: .26, B: .08, mg: 'straight', st: 'fold', fg: 1, c: 'blk' }, '앞뒤 손잡이를 꽉 쥐고 쏘는 이탈리아 기관단총. 느린 연사로 다루기 쉬워요.', { rec: .8 });
G('b1918', 'Beretta Model 1918', 'smg', '9glis', 'auto', 900, 25, 2.3, 'top', 1500, 'IT', 1918, { L: .3, B: .4, mg: 'top', st: 'wood', c: 'wood', h: 'wood', bay: 1 }, '탄창을 위에 꽂고 총검까지 달린 1차 대전 기관단총.');
G('tz45', 'TZ-45', 'smg', '9mm', 'auto', 550, 40, 2.1, 'rifle', 1300, 'IT', 1944, { L: .28, B: .08, mg: 'straight', st: 'wire', c: 'st' }, '전쟁 끝무렵 급하게 만든 이탈리아 기관단총. 손잡이 안전장치가 있어요.');
G('fnab43', 'FNAB-43', 'smg', '9mm', 'auto', 400, 40, 2.2, 'rifle', 2400, 'IT', 1943, { L: .3, B: .1, mg: 'straight', st: 'fold', c: 'st', h: 'shroud' }, '아주 느리게 쏘는 대신 정확한 이탈리아 기관단총.', { acc: .75, rec: .7 });
G('lf57', 'Franchi LF-57', 'smg', '9mm', 'auto', 500, 40, 2.1, 'rifle', 1700, 'IT', 1957, { L: .27, B: .08, mg: 'straight', st: 'fold', c: 'blk' }, '철판을 눌러 만든 가볍고 단순한 해군 기관단총.');
G('ppd40', 'PPD-40', 'smg', '762tok', 'auto', 800, 71, 3.0, 'drum', 2900, 'RU', 1940, { L: .32, B: .34, mg: 'drum', st: 'wood', c: 'wood', h: 'shroud' }, '71발 드럼 탄창을 단 소련 기관단총. PPSh의 형이에요.');
G('kashtan', 'AEK-919K Kashtan', 'smg', '9x18', 'auto', 900, 30, 1.9, 'rifle', 2500, 'RU', 1995, { L: .24, B: .06, mg: 'straight', st: 'fold', c: 'blk', k: 'mac' }, '‘밤나무’라는 이름의 작은 러시아 경찰 기관단총.', { ads: 1.2 });
G('lanchester', 'Lanchester Mk1', 'smg', '9mm', 'auto', 600, 50, 2.6, 'side', 2000, 'UK', 1941, { L: .32, B: .34, mg: 'side', st: 'wood', c: 'wood', h: 'shroud', bay: 1 }, '영국 해군이 배 위에서 쓴 묵직한 기관단총. 50발 탄창!');
G('stenmk5', 'Sten Mk V', 'smg', '9mm', 'auto', 550, 32, 2.2, 'side', 1500, 'UK', 1944, { L: .3, B: .3, mg: 'side', st: 'wood', c: 'wood', fg: 1 }, '나무 개머리판과 앞손잡이를 단 고급 스텐.');
G('stenmk2s', 'Sten Mk IIS', 'smg', '9mm', 'auto', 450, 32, 2.2, 'side', 2600, 'UK', 1943, { L: .38, B: .1, mg: 'side', st: 'wire', c: 'st', h: 'sd' }, '소음기가 붙은 특수 작전용 스텐. 아주 조용해요.', { sup: 1 });
G('m1a1t', 'Thompson M1A1', 'smg', '45acp', 'auto', 700, 30, 2.4, 'rifle', 2800, 'US', 1942, { L: .32, B: .34, mg: 'straight', st: 'wood', c: 'wood', h: 'none' }, '빨리 만들 수 있게 단순하게 바꾼 전쟁용 톰슨.', { rec: .9 });
G('ud42', 'United Defense M42', 'smg', '9mm', 'auto', 700, 25, 2.3, 'rifle', 2400, 'US', 1942, { L: .32, B: .34, mg: 'straight', st: 'wood', c: 'wood', h: 'wood' }, '비밀 요원들에게 몰래 보내진 미국 기관단총.');
G('sw76', 'S&W M76', 'smg', '9mm', 'auto', 720, 36, 2.1, 'rifle', 2100, 'US', 1967, { L: .3, B: .08, mg: 'straight', st: 'fold', c: 'blk', h: 'shroud' }, '베트남에서 미 해군 특수부대가 쓴 기관단총.');
G('rugermp9', 'Ruger MP9', 'smg', '9mm', 'auto', 600, 32, 2.0, 'grip', 2000, 'US', 1995, { L: .24, B: .05, mg: 'grip', st: 'fold', k: 'uzi', c: 'blk' }, '우지를 만든 사람이 다시 설계한 미국 기관단총.');
G('sub2000', 'Kel-Tec SUB-2000', 'smg', '9mm', 'semi', 450, 17, 2.0, 'grip', 1400, 'US', 2001, { L: .32, B: .2, mg: 'grip', st: 'fixed', c: 'blk' }, '반으로 접혀서 가방에 쏙 들어가는 카빈. 반자동이지만 정확해요.', { acc: .7, rec: .7 });
G('cx4', 'Beretta Cx4 Storm', 'smg', '9mm', 'semi', 480, 17, 2.0, 'grip', 1900, 'IT', 2003, { L: .32, B: .2, mg: 'grip', st: 'fixed', c: 'blk', rail: 1 }, '미래적인 모양의 권총탄 카빈. 한 발 한 발 정확해요.', { acc: .65, rec: .7 });
G('am180', 'American-180', 'smg', '22lr', 'auto', 1300, 177, 3.6, 'pan', 2900, 'US', 1960, { L: .36, B: .34, mg: 'pan', st: 'wood', c: 'wood', h: 'wood' }, '위에 얹은 원판에 작은 탄 177발! 1분에 1300발을 쏟아내요.', { rec: .4 });
G('jatimatic', 'Jati-Matic', 'smg', '9mm', 'auto', 650, 40, 2.0, 'rifle', 2400, 'FI', 1980, { L: .22, B: .04, mg: 'straight', fg: 1, st: 'none', c: 'blk', k: 'mac' }, '볼트가 비스듬히 움직여서 총구가 거의 안 튀는 핀란드 기관단총.', { rec: .65 });
G('hovea', 'Hovea M49', 'smg', '9mm', 'auto', 600, 36, 2.2, 'rifle', 1700, 'DK', 1949, { L: .3, B: .08, mg: 'straight', st: 'fold', c: 'st', h: 'shroud' }, '덴마크 군대가 오래 쓴 튼튼한 기관단총.');
G('hm3', 'Mendoza HM-3', 'smg', '9mm', 'auto', 600, 32, 2.0, 'grip', 1900, 'MX', 1975, { L: .24, B: .05, mg: 'grip', st: 'fold', k: 'uzi', c: 'blk' }, '멕시코에서 만든 작은 기관단총. 가볍고 짧아요.', { ads: 1.15 });
G('fmk3', 'FMK-3', 'smg', '9mm', 'auto', 650, 40, 2.0, 'grip', 1800, 'AR', 1974, { L: .26, B: .06, mg: 'grip', st: 'wire', k: 'uzi', c: 'blk' }, '아르헨티나의 기관단총. 40발 탄창을 손잡이에 꽂아요.');
G('uru', 'Mekanika Uru', 'smg', '9mm', 'auto', 750, 30, 2.0, 'rifle', 1500, 'BR', 1974, { L: .26, B: .05, mg: 'straight', st: 'none', c: 'blk' }, '부품이 아주 적어서 정글에서도 고치기 쉬운 브라질 기관단총.');
G('type79', 'Type 79', 'smg', '762tok', 'auto', 1000, 20, 1.9, 'rifle', 2000, 'CN', 1979, { L: .24, B: .06, mg: 'straight', st: 'fold', c: 'blk' }, '아주 가볍고 빠른 중국 기관단총. 빠른 탄이 껍질을 뚫어요.');
G('type64', 'Type 64 소음기관단총', 'smg', '762tok', 'auto', 1000, 30, 2.1, 'rifle', 3200, 'CN', 1964, { L: .36, B: .1, mg: 'straight', st: 'fold', c: 'st', h: 'sd' }, '통째로 소음기를 두른 중국 정찰대 기관단총.', { sup: 1 });
G('qcw05', 'QCW-05', 'smg', '58x21', 'auto', 900, 50, 2.5, 'bullpup', 4200, 'CN', 2005, { bull: 1, c: 'blk', carry: 1 }, '50발이 들어가는 중국 불펍 기관단총. 단단한 껍질을 뚫는 탄을 써요.');
G('pm9', 'Minebea PM-9', 'smg', '9mm', 'auto', 1100, 25, 1.9, 'grip', 2400, 'JP', 1999, { L: .2, B: .03, mg: 'grip', st: 'none', fg: 1, k: 'mac', c: 'blk' }, '일본 자위대의 작은 기관단총. 앞에 손잡이가 붙어 있어요.', { ads: 1.25 });
G('m56', 'Zastava M56', 'smg', '762tok', 'auto', 600, 32, 2.2, 'rifle', 1500, 'YU', 1956, { L: .3, B: .08, mg: 'curved', st: 'fold', c: 'st', bay: 1 }, 'MP40을 닮은 유고슬라비아 기관단총. 총검이 달려요.');
G('ero', 'ERO', 'smg', '9mm', 'auto', 650, 32, 2.0, 'grip', 1900, 'HR', 1993, { L: .26, B: .06, mg: 'grip', st: 'fold', k: 'uzi', c: 'blk' }, '크로아티아가 직접 만든 우지 쌍둥이.');
G('agram', 'Agram 2000', 'smg', '9mm', 'auto', 800, 32, 2.0, 'rifle', 2200, 'HR', 1990, { L: .26, B: .04, mg: 'straight', st: 'none', fg: 1, c: 'blk', h: 'round' }, '총구에 소음기를 달기 쉬운 크로아티아 기관단총.');
G('pm84', 'PM-84 Glauberyt', 'smg', '9mm', 'auto', 640, 25, 1.9, 'grip', 2300, 'PL', 1984, { L: .24, B: .05, mg: 'grip', st: 'fold', fg: 1, k: 'mac', c: 'blk' }, '‘글라우버라이트’라는 광물 이름을 가진 폴란드 기관단총.', { ads: 1.2 });
G('mors', 'Mors wz.39', 'smg', '9mm', 'auto', 500, 25, 2.4, 'rifle', 2200, 'PL', 1939, { L: .34, B: .34, mg: 'straight', st: 'wood', c: 'wood', h: 'shroud', bipod: 1 }, '양각대까지 달린 폴란드 기관단총. 몇 자루 안 남은 귀한 총이에요.', { acc: .8 });
G('kgp9', 'KGP-9', 'smg', '9mm', 'auto', 900, 25, 2.0, 'rifle', 2000, 'HU', 1992, { L: .26, B: .06, mg: 'straight', st: 'fold', c: 'blk' }, '헝가리 경찰이 쓴 작은 기관단총.');
G('kiraly', '39M Király', 'smg', '9x25', 'auto', 750, 40, 2.5, 'rifle', 2600, 'HU', 1939, { L: .4, B: .36, mg: 'straight', st: 'wood', c: 'wood', h: 'wood', bay: 1 }, '소총만큼 긴 헝가리 기관단총. 센 탄을 써서 멀리까지 닿아요.', { acc: .8 });
G('orita', 'Orița M1941', 'smg', '9mm', 'auto', 600, 32, 2.3, 'rifle', 1800, 'RO', 1941, { L: .32, B: .34, mg: 'straight', st: 'wood', c: 'wood', h: 'wood' }, '루마니아가 만든 나무 기관단총. 꼼꼼하게 깎았어요.');
G('bxp', 'Mamba BXP', 'smg', '9mm', 'auto', 1000, 32, 1.9, 'grip', 2200, 'ZA', 1984, { L: .22, B: .04, mg: 'grip', st: 'fold', k: 'mac', c: 'blk' }, '남아공의 작고 빠른 기관단총.', { ads: 1.2 });
G('austen', 'Austen Mk I', 'smg', '9mm', 'auto', 500, 28, 2.2, 'side', 1500, 'AU', 1942, { L: .3, B: .1, mg: 'side', st: 'fold', fg: 1, c: 'st' }, '스텐과 MP40을 섞어 만든 호주 기관단총.');
G('f1smg', 'F1 SMG', 'smg', '9mm', 'auto', 640, 34, 2.2, 'top', 1900, 'AU', 1962, { L: .3, B: .3, mg: 'top', st: 'fixed', c: 'st', h: 'none' }, '오웬처럼 위에 탄창을 꽂는 호주 기관단총.');
G('vigneron', 'Vigneron M2', 'smg', '9mm', 'auto', 620, 32, 2.1, 'rifle', 1700, 'BE', 1953, { L: .3, B: .1, mg: 'straight', st: 'wire', c: 'st' }, '벨기에군이 아프리카에서 쓴 기관단총.');
G('z62', 'Star Z-62', 'smg', '9mm', 'auto', 550, 30, 2.0, 'rifle', 1700, 'ES', 1962, { L: .28, B: .08, mg: 'straight', st: 'fold', c: 'blk', h: 'shroud' }, '방아쇠 위를 누르면 한 발, 아래를 누르면 연사! 스페인 기관단총.');
G('labora', 'Labora Fontbernat', 'smg', '9x23', 'auto', 750, 36, 2.3, 'rifle', 2100, 'ES', 1938, { L: .3, B: .3, mg: 'straight', st: 'wood', c: 'wood', h: 'none' }, '전쟁 중에 공들여 깎아 만든 스페인 기관단총.');
G('mas38', 'MAS-38', 'smg', '765l', 'auto', 600, 32, 2.0, 'rifle', 1600, 'FR', 1938, { L: .3, B: .3, mg: 'straight', st: 'wood', c: 'wood', h: 'none' }, '총몸이 비스듬히 꺾인 프랑스 기관단총. 반동이 아주 작아요.', { rec: .6 });
G('hotchkissU', 'Hotchkiss Universal', 'smg', '9mm', 'auto', 650, 32, 2.0, 'rifle', 2000, 'FR', 1949, { L: .24, B: .08, mg: 'straight', st: 'fold', c: 'blk' }, '탄창까지 접어 넣어 상자처럼 작아지는 프랑스 기관단총.', { ads: 1.15 });
G('lusa', 'Lusa A2', 'smg', '9mm', 'auto', 900, 30, 2.0, 'rifle', 2200, 'PT', 1994, { L: .26, B: .08, mg: 'straight', st: 'fold', c: 'blk', h: 'round' }, '포르투갈의 독특한 2층 총몸 기관단총.');
G('fbp48', 'FBP m/948', 'smg', '9mm', 'auto', 500, 32, 2.1, 'rifle', 1500, 'PT', 1948, { L: .3, B: .1, mg: 'straight', st: 'wire', c: 'st', h: 'shroud' }, 'MP40과 M3를 섞은 포르투갈 기관단총.');
G('mp3008', 'MP 3008', 'smg', '9mm', 'auto', 500, 32, 2.0, 'rifle', 1100, 'DE', 1945, { L: .3, B: .1, mg: 'straight', st: 'wire', c: 'st' }, '전쟁 끝에 독일이 스텐을 베껴 만든 아주 단순한 총.');
G('shipka', 'Arsenal Shipka', 'smg', '9x18', 'auto', 700, 32, 1.9, 'rifle', 1700, 'BG', 1995, { L: .24, B: .06, mg: 'straight', st: 'fold', c: 'blk' }, '산 고개 이름을 딴 불가리아의 작은 기관단총.');
G('smg45', 'LWRC SMG-45', 'smg', '45acp', 'auto', 650, 25, 2.1, 'rifle', 3900, 'US', 2015, { L: .28, B: .1, mg: 'straight', st: 'fold', h: 'rail', rail: 1, c: 'tan' }, '총구가 거의 안 튀게 만든 최신 .45 기관단총.', { rec: .75 });

// ---- 돌격소총 ----
G('ak74m', 'AK-74M', 'ar', '545', 'auto', 650, 30, 2.4, 'ak', 5800, 'RU', 1991, { k: 'ak', c: 'blk', rail: 1 }, '플라스틱 개머리판을 접을 수 있는 러시아군의 기본 소총.', { rec: .85 });
G('ak101', 'AK-101', 'ar', '556', 'auto', 650, 30, 2.4, 'ak', 6000, 'RU', 1994, { k: 'ak', c: 'blk' }, '다른 나라에 팔려고 NATO 탄을 쓰게 만든 AK.');
G('ak103', 'AK-103', 'ar', '762x39', 'auto', 600, 30, 2.4, 'ak', 6300, 'RU', 1994, { k: 'ak', c: 'blk', rail: 1 }, '옛 AK-47 탄을 쓰는 새 AK. 한 방이 묵직해요.');
G('ak15', 'AK-15', 'ar', '762x39', 'auto', 700, 30, 2.3, 'ak', 8800, 'RU', 2018, { k: 'ak', c: 'blk', rail: 1, sg: 'dot' }, 'AK-12의 7.62mm 형제. 레드닷이 기본으로 달려 있어요.', { rec: .95 });
G('ak19', 'AK-19', 'ar', '556', 'auto', 700, 30, 2.3, 'ak', 8600, 'RU', 2020, { k: 'ak', c: 'blk', rail: 1 }, 'AK-12를 NATO 탄용으로 바꾼 최신 AK.', { rec: .85 });
G('aks74u', 'AKS-74U', 'ar', '545', 'auto', 700, 30, 2.2, 'ak', 5000, 'RU', 1979, { k: 'ak', c: 'wood', L: .26, st: 'fold' }, '‘크린코프’라는 별명의 아주 짧은 AK. 전차병이 들었어요.', { ads: 1.3, acc: 1.15 });
G('ak9', 'AK-9', 'ar', '9x39', 'auto', 700, 20, 2.2, 'ak', 8200, 'RU', 2005, { k: 'ak', c: 'blk', L: .3 }, '조용한 아음속탄을 쓰는 AK. 소음기를 달면 거의 소리가 안 나요.', { quiet: 1 });
G('ash12', 'ASh-12.7', 'ar', '127x55', 'auto', 650, 20, 2.8, 'bullpup', 15000, 'RU', 2011, { bull: 1, c: 'blk', carry: 1 }, '엄청 큰 12.7mm 탄을 쓰는 러시아 불펍 소총. 괴물 껍질도 뻥!', { rec: 1.2 });
G('n9a91', '9A-91', 'ar', '9x39', 'auto', 750, 20, 2.1, 'rifle', 6200, 'RU', 1994, { L: .26, B: .06, mg: 'straight', st: 'fold', c: 'blk', h: 'round' }, '작고 가벼운데 단단한 껍질을 뚫는 탄을 쏴요.', { ads: 1.2 });
G('a545', 'A-545', 'ar', '545', 'auto', 900, 30, 2.4, 'ak', 12000, 'RU', 2021, { k: 'ak', c: 'blk', rail: 1 }, '추가 균형 장치로 반동을 지운 러시아 특수부대 소총.', { rec: .55 });
G('ak203', 'AK-203', 'ar', '762x39', 'auto', 700, 30, 2.4, 'ak', 8000, 'IN', 2019, { k: 'ak', c: 'blk', rail: 1 }, '인도에서 러시아와 함께 만드는 새 AK.');
G('mk18', 'Mk 18 CQBR', 'ar', '556', 'auto', 850, 30, 2.1, 'rifle', 8000, 'US', 2000, { h: 'rail', rail: 1, c: 'blk', L: .28, st: 'fold' }, '미 해군 특수부대가 배 안에서 싸우려고 짧게 만든 M4.', { ads: 1.2 });
G('hk433', 'H&K HK433', 'ar', '556', 'auto', 700, 30, 2.3, 'rifle', 9200, 'DE', 2017, { h: 'rail', rail: 1, c: 'tan', st: 'fold' }, 'HK416과 G36의 좋은 점을 합친 독일 소총.', { acc: .85, rec: .85 });
G('g36c', 'H&K G36C', 'ar', '556', 'auto', 750, 30, 2.2, 'rifle', 7400, 'DE', 2001, { k: 'g36', c: 'blk', L: .26 }, '아주 짧게 줄인 G36. 들고 다니기 편해요.', { ads: 1.2 });
G('hk53', 'H&K HK53', 'ar', '556', 'auto', 750, 25, 2.2, 'hk', 6200, 'DE', 1975, { L: .26, B: .08, mg: 'curved', st: 'fold', h: 'round' }, 'MP5처럼 생겼지만 소총탄을 쏘는 짧은 총. 불꽃이 커요!');
G('g41', 'H&K G41', 'ar', '556', 'auto', 850, 30, 2.3, 'hk', 7000, 'DE', 1981, { mg: 'curved', st: 'fixed', h: 'round', c: 'blk', carry: 1 }, 'G3 가족을 NATO 탄용으로 만든 소총.');
G('xm8', 'XM8', 'ar', '556', 'auto', 750, 30, 2.2, 'rifle', 9800, 'US', 2003, { k: 'g36', c: 'tan', sg: 'dot' }, '미군의 다음 소총이 될 뻔한 하얀 미래 소총.', { rec: .8 });
G('fncal', 'FN CAL', 'ar', '556', 'b3', 850, 30, 2.4, 'rifle', 6000, 'BE', 1966, { c: 'wood', mg: 'straight', st: 'wood', h: 'wood' }, '3점사 기능을 처음 넣은 소총 가운데 하나. FAL의 작은 동생.');
G('sg552', 'SIG SG 552', 'ar', '556', 'auto', 780, 30, 2.3, 'rifle', 8200, 'CH', 1998, { mg: 'straight', st: 'fold', h: 'box', c: 'blk', clear: 1, L: .3 }, '투명한 탄창을 끼우는 짧은 스위스 소총. 남은 탄이 보여요.', { acc: .85 });
G('sg553', 'SIG SG 553', 'ar', '556', 'auto', 700, 30, 2.3, 'rifle', 8400, 'CH', 2008, { mg: 'straight', st: 'fold', h: 'rail', rail: 1, c: 'blk', clear: 1, L: .3 }, 'SG 552에 레일을 달아 새로 만든 소총.', { acc: .85 });
G('sg540', 'SIG SG 540', 'ar', '556', 'auto', 700, 30, 2.4, 'rifle', 5600, 'CH', 1977, { mg: 'straight', st: 'fixed', h: 'box', c: 'blk', bipod: 1 }, '프랑스와 칠레에서도 만든 튼튼한 스위스 설계 소총.');
G('sig516', 'SIG 516', 'ar', '556', 'auto', 750, 30, 2.2, 'rifle', 7600, 'US', 2010, { h: 'rail', rail: 1, c: 'blk' }, '가스 피스톤으로 쏴서 더러워져도 잘 걸리지 않는 AR.');
G('ar556', 'Ruger AR-556', 'ar', '556', 'semi', 500, 30, 2.2, 'rifle', 4200, 'US', 2015, { h: 'round', c: 'blk', carry: 1 }, '싸고 튼튼한 반자동 AR. 첫 소총으로 딱이에요.', { acc: .85 });
G('mp15', 'S&W M&P15', 'ar', '556', 'semi', 500, 30, 2.2, 'rifle', 4400, 'US', 2006, { h: 'round', c: 'blk' }, '미국에서 아주 많이 팔린 반자동 AR.', { acc: .85 });
G('lwrcm6', 'LWRC M6', 'ar', '556', 'auto', 750, 30, 2.2, 'rifle', 8000, 'US', 2006, { h: 'rail', rail: 1, c: 'tan' }, '총열이 굵고 튼튼해서 오래 쏴도 정확한 AR.', { acc: .85 });
G('rec7', 'Barrett REC7', 'ar', '68spc', 'auto', 700, 28, 2.2, 'rifle', 8800, 'US', 2007, { h: 'rail', rail: 1, c: 'blk' }, '5.56mm보다 센 6.8mm 탄을 쓰는 바렛의 소총.');
G('sr16', 'KAC SR-16', 'ar', '556', 'auto', 750, 30, 2.2, 'rifle', 7600, 'US', 1995, { h: 'rail', rail: 1, c: 'blk' }, '레일을 처음 두른 AR 가운데 하나. 부품을 마음대로 달아요.');
G('stoner63', 'Stoner 63', 'ar', '556', 'auto', 750, 30, 2.4, 'rifle', 7000, 'US', 1963, { mg: 'straight', st: 'fixed', h: 'shroud', c: 'blk' }, '부품을 바꾸면 소총도 기관총도 되는 ‘레고 총’.');
G('sp1', 'Colt AR-15 SP1', 'ar', '556', 'semi', 500, 20, 2.1, 'rifle', 4300, 'US', 1964, { mg: 'straight', st: 'fixed', h: 'round', c: 'blk', carry: 1 }, '처음 팔린 AR-15. 손잡이 위에 가늠자가 있어요.', { acc: .85 });
G('car15', 'Colt CAR-15', 'ar', '556', 'auto', 750, 20, 2.1, 'rifle', 5200, 'US', 1967, { mg: 'straight', st: 'fold', h: 'round', c: 'blk', carry: 1, L: .28 }, 'M16을 짧게 줄인 카빈의 원조.', { ads: 1.15 });
G('m27', 'M27 IAR', 'ar', '556', 'auto', 750, 30, 2.3, 'rifle', 9500, 'DE', 2010, { h: 'rail', rail: 1, c: 'tan', bipod: 1, sg: 'acog' }, '미 해병대가 기관총 대신 고른 HK416. 조준경이 달려 정확해요.', { zoom: 3, acc: .7 });
G('mdr', 'Desert Tech MDR', 'ar', '556', 'semi', 600, 30, 2.3, 'bullpup', 7400, 'US', 2014, { bull: 1, c: 'tan' }, '탄피가 앞으로 튀어나오는 불펍. 왼손잡이도 편해요.', { acc: .8 });
G('galilace', 'IWI Galil ACE', 'ar', '556', 'auto', 700, 35, 2.4, 'ak', 7600, 'IL', 2008, { k: 'ak', c: 'blk', rail: 1 }, 'AK의 튼튼함에 레일을 두른 이스라엘 소총.');
G('arad', 'IWI Arad', 'ar', '556', 'auto', 800, 30, 2.2, 'rifle', 8600, 'IL', 2018, { h: 'rail', rail: 1, c: 'tan', st: 'fold' }, '이스라엘 특수부대의 새 소총.');
G('type63', 'Type 63 자동소총', 'ar', '762x39', 'auto', 650, 20, 2.4, 'rifle', 4200, 'CN', 1963, { c: 'wood', mg: 'straight', st: 'trad', h: 'wood', trad: 1, bay: 1 }, 'SKS와 AK를 합친 것 같은 중국 나무 소총.');
G('qbz03', 'QBZ-03', 'ar', '58', 'auto', 650, 30, 2.4, 'rifle', 6400, 'CN', 2003, { mg: 'curved', st: 'fold', h: 'box', c: 'blk' }, '불펍이 아닌 모양으로 만든 중국 소총.');
G('t65', 'T65', 'ar', '556', 'auto', 750, 30, 2.3, 'rifle', 5200, 'TW', 1976, { mg: 'straight', st: 'fixed', h: 'round', c: 'blk', carry: 1 }, '대만이 M16과 AR-18을 섞어 만든 소총.');
G('t86', 'T86', 'ar', '556', 'auto', 750, 30, 2.2, 'rifle', 6000, 'TW', 2002, { mg: 'straight', st: 'fold', h: 'round', c: 'blk', carry: 1 }, '가볍고 짧은 대만 소총.');
G('t91', 'T91', 'ar', '556', 'auto', 750, 30, 2.2, 'rifle', 7000, 'TW', 2003, { mg: 'straight', st: 'fold', h: 'rail', rail: 1, c: 'blk' }, '대만군의 지금 소총. M4를 닮았어요.');
G('excalibur', 'INSAS Excalibur', 'ar', '556', 'auto', 700, 30, 2.4, 'rifle', 5600, 'IN', 2015, { mg: 'straight', st: 'fold', h: 'rail', c: 'blk', rail: 1 }, 'INSAS를 고쳐 연사도 되게 만든 인도 소총.');
G('ss1', 'Pindad SS1', 'ar', '556', 'auto', 750, 30, 2.3, 'rifle', 5200, 'ID', 1991, { mg: 'straight', st: 'fold', h: 'box', c: 'blk' }, 'FN FNC를 바탕으로 만든 인도네시아 소총.');
G('ss2', 'Pindad SS2', 'ar', '556', 'auto', 750, 30, 2.3, 'rifle', 6600, 'ID', 2006, { mg: 'straight', st: 'fold', h: 'rail', rail: 1, c: 'blk' }, '사격 대회에서 여러 번 우승한 인도네시아 소총.', { acc: .8 });
G('cr21', 'Vektor CR-21', 'ar', '556', 'auto', 700, 35, 2.5, 'bullpup', 6600, 'ZA', 1997, { bull: 1, c: 'blk', sg: 'dot' }, '남아공의 둥글둥글한 불펍 소총. 레드닷이 붙어 있어요.');
G('rk95', 'Sako Rk 95 TP', 'ar', '762x39', 'auto', 650, 30, 2.4, 'ak', 6800, 'FI', 1995, { k: 'ak', c: 'blk' }, '핀란드의 고급 AK. 추위 속에서도 정확해요.', { acc: .8 });
G('tantal', 'Tantal wz.88', 'ar', '545', 'auto', 650, 30, 2.4, 'ak', 5000, 'PL', 1988, { k: 'ak', c: 'blk', st: 'wire' }, '총구에 유탄을 얹어 쏠 수 있던 폴란드 AK.');
G('pm63r', 'PM md. 63', 'ar', '762x39', 'auto', 600, 30, 2.4, 'ak', 4400, 'RO', 1963, { k: 'ak', c: 'wood', fg: 1 }, '앞에 나무 손잡이가 달린 루마니아 AK.');
G('pa86', 'PA md. 86', 'ar', '545', 'b3', 650, 30, 2.3, 'ak', 4600, 'RO', 1986, { k: 'ak', c: 'blk', fg: 1, st: 'fold' }, '3점사로 쏘는 루마니아의 5.45mm AK.');
G('ak63', 'FEG AK-63', 'ar', '762x39', 'auto', 600, 30, 2.4, 'ak', 4400, 'HU', 1977, { k: 'ak', c: 'wood' }, '헝가리가 만든 깔끔한 AKM.');
G('m21', 'Zastava M21', 'ar', '556', 'auto', 650, 30, 2.4, 'ak', 6000, 'RS', 2004, { k: 'ak', c: 'blk', rail: 1 }, '세르비아의 NATO 탄 AK.');
G('m85', 'Zastava M85', 'ar', '556', 'auto', 680, 30, 2.2, 'ak', 5000, 'YU', 1985, { k: 'ak', c: 'wood', L: .3 }, '짧은 유고슬라비아 AK. 5.56mm 탄을 써요.', { ads: 1.15 });
G('bren2', 'CZ BREN 2', 'ar', '556', 'auto', 1000, 30, 2.2, 'rifle', 9000, 'CZ', 2016, { h: 'rail', rail: 1, c: 'od', st: 'fold' }, '아주 빠르게 쏘는 체코 최신 소총.', { rec: .9 });
G('malyuk', 'Malyuk', 'ar', '545', 'auto', 650, 30, 2.6, 'bullpup', 6000, 'UA', 2005, { bull: 1, c: 'blk' }, 'AK를 불펍으로 바꾼 우크라이나 소총. ‘아기’라는 뜻이에요.', { ads: 1.1 });
G('arm1', 'Arsenal AR-M1', 'ar', '556', 'auto', 650, 30, 2.4, 'ak', 5200, 'BG', 1998, { k: 'ak', c: 'blk' }, '불가리아의 튼튼한 AK. 무거워서 반동이 적어요.', { rec: .85 });
G('em2', 'EM-2', 'ar', '280', 'auto', 600, 20, 2.6, 'bullpup', 7200, 'UK', 1951, { bull: 1, c: 'wood', carry: 1 }, '1950년대에 나온 영국 불펍. 시대를 너무 앞서간 총이에요.', { acc: .8 });
G('stg45', 'StG 45(M)', 'ar', '792k', 'auto', 450, 30, 2.4, 'rifle', 6800, 'DE', 1945, { mg: 'curved', st: 'fixed', h: 'box', c: 'st' }, '롤러로 잠기는 구조로 나중에 G3를 낳은 시험 소총.');
G('vg15', 'Volkssturmgewehr VG 1-5', 'ar', '792k', 'semi', 350, 30, 2.4, 'rifle', 3200, 'DE', 1945, { mg: 'curved', st: 'wood', h: 'wood', c: 'wood' }, '전쟁 마지막 해에 급하게 만든 반자동 소총.');
G('mkb42', 'MKb 42(H)', 'ar', '792k', 'auto', 500, 30, 2.5, 'rifle', 6000, 'DE', 1942, { mg: 'curved', st: 'wood', h: 'shroud', c: 'wood' }, 'StG 44의 아빠. 세계 첫 돌격소총 가운데 하나예요.');
G('md97', 'IMBEL MD-97', 'ar', '556', 'auto', 650, 30, 2.3, 'rifle', 5000, 'BR', 1997, { mg: 'straight', st: 'fold', h: 'box', c: 'blk' }, '브라질의 FAL 가족 소총. 5.56mm 탄을 써요.');
G('saint', 'Springfield SAINT', 'ar', '556', 'semi', 500, 30, 2.2, 'rifle', 4600, 'US', 2016, { h: 'rail', rail: 1, c: 'blk' }, '가볍고 튼튼한 반자동 AR.', { acc: .85 });
G('su16', 'Kel-Tec SU-16', 'ar', '556', 'semi', 450, 30, 2.3, 'rifle', 3800, 'US', 2003, { mg: 'straight', st: 'fold', h: 'box', c: 'blk', bipod: 1 }, '앞손잡이가 펼쳐지면 양각대가 되는 신기한 소총.', { acc: .85 });
G('xcr', 'Robinson XCR', 'ar', '556', 'auto', 700, 30, 2.3, 'rifle', 7200, 'US', 2006, { h: 'rail', rail: 1, c: 'tan', st: 'fold' }, '총열을 몇 분 만에 바꿔 끼울 수 있는 소총.');
G('lr300', 'Z-M LR-300', 'ar', '556', 'auto', 700, 30, 2.2, 'rifle', 7200, 'US', 2000, { h: 'rail', rail: 1, c: 'blk', st: 'fold' }, '개머리판을 접을 수 있게 고친 AR.');
G('dr200', 'Daewoo DR-200', 'ar', '556', 'semi', 500, 10, 2.2, 'rifle', 4200, 'KR', 1995, { mg: 'straight', st: 'thumb', h: 'box', c: 'blk' }, '대한민국 K2를 사냥총 모양으로 바꾼 반자동 소총.', { acc: .8 });
G('sar21', 'ST Kinetics SAR 21', 'ar', '556', 'auto', 650, 30, 2.5, 'bullpup', 7000, 'SG', 1999, { bull: 1, c: 'od', sg: 'acog' }, '레이저와 조준경이 붙은 싱가포르 불펍.', { zoom: 3, acc: .8 });
G('sar80', 'CIS SAR 80', 'ar', '556', 'auto', 650, 30, 2.3, 'rifle', 5000, 'SG', 1980, { mg: 'straight', st: 'fold', h: 'box', c: 'blk' }, '싱가포르가 처음 만든 자기 나라 소총.');
G('sr88', 'CIS SR 88', 'ar', '556', 'auto', 800, 30, 2.3, 'rifle', 5400, 'SG', 1988, { mg: 'straight', st: 'fold', h: 'box', c: 'blk' }, 'SAR 80을 고쳐 만든 가벼운 소총.');
G('kh2002', 'KH-2002 Khaybar', 'ar', '556', 'auto', 800, 30, 2.6, 'bullpup', 6000, 'IR', 2004, { bull: 1, c: 'blk', carry: 1 }, '이란이 M16을 불펍으로 바꿔 만든 소총.');
G('rdb', 'Kel-Tec RDB', 'ar', '556', 'semi', 550, 30, 2.4, 'bullpup', 5600, 'US', 2015, { bull: 1, c: 'blk' }, '탄피가 아래로 떨어지는 불펍. 어느 손으로 쏴도 편해요.', { acc: .85 });
G('f90', 'Lithgow F90', 'ar', '556', 'auto', 750, 30, 2.4, 'bullpup', 8400, 'AU', 2015, { k: 'aug', c: 'tan' }, 'AUG를 바탕으로 호주가 새로 만든 불펍.', { rec: .85 });
G('c8', 'Colt Canada C8', 'ar', '556', 'auto', 800, 30, 2.2, 'rifle', 7000, 'CA', 1994, { h: 'rail', rail: 1, c: 'blk', st: 'fold', L: .3 }, '캐나다군의 짧은 카빈. 총열이 두꺼워 정확해요.', { acc: .85 });
G('fx05', 'FX-05 Xiuhcoatl', 'ar', '556', 'auto', 750, 30, 2.3, 'rifle', 6800, 'MX', 2005, { k: 'g36', c: 'blk' }, '‘불의 뱀’이라는 이름의 멕시코 소총.');
G('m17s', 'Bushmaster M17S', 'ar', '556', 'semi', 500, 30, 2.5, 'bullpup', 5000, 'US', 1992, { bull: 1, c: 'blk', carry: 1 }, '알루미늄으로 만든 가벼운 미국 불펍.');
G('stm556', 'Steyr STM-556', 'ar', '556', 'auto', 750, 30, 2.3, 'rifle', 7000, 'AT', 2017, { h: 'rail', rail: 1, c: 'blk', st: 'fold' }, 'AUG를 만든 회사가 만든 AR 모양 소총.');
G('k2a', 'Daewoo K2A', 'ar', '556', 'auto', 800, 30, 2.3, 'rifle', 7800, 'KR', 2016, { h: 'rail', rail: 1, c: 'blk', st: 'fold', sg: 'dot' }, '레일과 레드닷을 단 새 K2. 대한민국 군인이 들어요!');
G('xk8', 'Daewoo XK8', 'ar', '556', 'auto', 750, 30, 2.5, 'bullpup', 7600, 'KR', 2005, { bull: 1, c: 'blk', sg: 'dot' }, '대한민국이 시험 삼아 만든 불펍 소총. 짧은데 총열은 길어요.', { acc: .85 });

// ---- 전투·지정사수 소총 ----
G('sg510', 'SIG SG 510', 'br', '75swiss', 'auto', 550, 24, 2.6, 'rifle', 8600, 'CH', 1957, { c: 'blk', mg: 'straight', st: 'fixed', h: 'box', L: .44, B: .36, bipod: 1 }, '무겁지만 아주 정확한 스위스 전투소총. 반동이 순해요.', { acc: .7, rec: .85 });
G('bm59', 'Beretta BM59', 'br', '762n', 'auto', 750, 20, 2.5, 'rifle', 7000, 'IT', 1959, { c: 'wood', mg: 'straight', st: 'trad', h: 'wood', trad: 1, L: .42, B: .38, bipod: 1 }, 'M1 개런드에 20발 탄창을 단 이탈리아 소총.');
G('rfb', 'Kel-Tec RFB', 'br', '762n', 'semi', 400, 20, 2.6, 'bullpup', 7600, 'US', 2009, { bull: 1, c: 'blk' }, '탄피가 앞으로 나오는 7.62mm 불펍. 짧지만 힘이 세요.', { acc: .75 });
G('tavor7', 'IWI Tavor 7', 'br', '762n', 'auto', 650, 20, 2.6, 'bullpup', 10500, 'IL', 2018, { bull: 1, c: 'od', rail: 1 }, '큰 탄을 쓰는 타보르. 동굴 안에서도 휘두르기 좋아요.', { rec: 1.05 });
G('ak308', 'AK-308', 'br', '762n', 'auto', 650, 20, 2.6, 'ak', 10000, 'RU', 2018, { k: 'ak', c: 'blk', rail: 1 }, 'AK에 커다란 NATO 탄을 넣은 러시아 전투소총.', { rec: 1.15 });
G('howa64', 'Howa Type 64', 'br', '762n', 'auto', 500, 20, 2.6, 'rifle', 7400, 'JP', 1964, { c: 'wood', mg: 'straight', st: 'wood', h: 'wood', L: .44, B: .36, bipod: 1 }, '일본 자위대가 오래 쓴 소총. 느리게 쏴서 다루기 쉬워요.', { rec: .85, acc: .8 });
G('ak4', 'Ak 4', 'br', '762n', 'auto', 600, 20, 2.6, 'hk', 7200, 'SE', 1965, { mg: 'straight', st: 'fixed', h: 'box', c: 'od', L: .42, B: .34 }, '스웨덴에서 만든 G3. 추운 눈밭에서도 끄떡없어요.');
G('vsk94', 'VSK-94', 'br', '9x39', 'semi', 500, 20, 2.3, 'rifle', 8800, 'RU', 1995, { mg: 'straight', st: 'fixed', h: 'sd', c: 'blk', L: .38, B: .3, sg: 'scope' }, '소음기와 조준경을 단 조용한 저격소총.', { sup: 1, zoom: 4, acc: .55 });
G('mondragon', 'Mondragón M1908', 'br', '7x57', 'semi', 300, 8, 2.4, 'boltClip', 5200, 'MX', 1908, { c: 'wood', mg: 'internal', st: 'trad', h: 'wood', trad: 1, L: .44, B: .4 }, '세계에서 처음으로 군대가 쓴 반자동 소총 가운데 하나. 멕시코 사람이 만들었어요.', { acc: .8 });
G('hakim', 'Hakim', 'br', '792', 'semi', 300, 10, 2.5, 'rifle', 5600, 'EG', 1954, { c: 'wood', mg: 'straight', st: 'trad', h: 'wood', trad: 1, L: .44, B: .4 }, '스웨덴 소총을 바탕으로 이집트가 만든 반자동 소총.', { acc: .75 });
G('mas4956', 'MAS-49/56', 'br', '75fr', 'semi', 300, 10, 2.4, 'rifle', 6000, 'FR', 1956, { c: 'wood', mg: 'straight', st: 'trad', h: 'wood', trad: 1, L: .4, B: .38, brake: 1 }, 'MAS-49를 짧고 가볍게 고친 소총. 총구에 유탄도 얹어요.', { acc: .75 });
G('g3sg1', 'H&K G3SG/1', 'br', '762n', 'semi', 400, 20, 2.6, 'hk', 12000, 'DE', 1972, { mg: 'straight', st: 'fixed', h: 'box', c: 'blk', L: .44, B: .36, sg: 'scope', bipod: 1 }, '공장에서 가장 정확한 G3만 골라 조준경을 단 저격 소총.', { zoom: 6, acc: .45 });
G('msg90', 'H&K MSG90', 'br', '762n', 'semi', 360, 20, 2.6, 'hk', 15000, 'DE', 1990, { mg: 'straight', st: 'thumb', h: 'box', c: 'blk', L: .44, B: .4, sg: 'scope', bipod: 1 }, 'PSG1을 가볍고 싸게 만든 군대용 저격소총.', { zoom: 7, acc: .35 });
G('m39emr', 'M39 EMR', 'br', '762n', 'semi', 380, 20, 2.5, 'rifle', 13000, 'US', 2008, { c: 'tan', mg: 'straight', st: 'fixed', h: 'rail', rail: 1, L: .42, B: .4, sg: 'scope', bipod: 1 }, '미 해병대가 M14를 새 몸통에 넣은 지정사수 소총.', { zoom: 6, acc: .45 });
G('m21s', 'M21 SWS', 'br', '762n', 'semi', 360, 20, 2.5, 'rifle', 10500, 'US', 1969, { c: 'wood', mg: 'straight', st: 'trad', h: 'wood', trad: 1, L: .44, B: .4, sg: 'scope' }, '베트남 전쟁에서 쓴 M14 저격소총.', { zoom: 6, acc: .45 });
G('svdk', 'SVDK', 'br', '93x64', 'semi', 300, 10, 2.7, 'ak', 15000, 'RU', 2006, { k: 'ak', c: 'blk', mg: 'straight', st: 'fixed', L: .44, B: .55, sg: 'scope' }, 'SVD를 크게 키워 아주 큰 탄을 쓰는 저격소총.', { zoom: 6, acc: .45, rec: 1.1 });
G('svds', 'SVDS', 'br', '762r', 'semi', 300, 10, 2.6, 'ak', 12000, 'RU', 1991, { k: 'ak', c: 'blk', mg: 'straight', st: 'fold', L: .42, B: .48, sg: 'scope' }, '개머리판을 접는 짧은 드라구노프. 낙하산 부대용이에요.', { zoom: 4, acc: .5 });
G('svch', 'Chukavin SVCh', 'br', '762r', 'semi', 300, 10, 2.5, 'rifle', 15000, 'RU', 2017, { c: 'blk', mg: 'straight', st: 'fold', h: 'rail', rail: 1, L: .42, B: .45, sg: 'scope' }, '드라구노프 다음 세대로 만든 러시아 새 저격소총.', { zoom: 6, acc: .4 });
G('svt38', 'SVT-38', 'br', '762r', 'semi', 300, 10, 2.5, 'rifle', 4800, 'RU', 1938, { c: 'wood', mg: 'straight', st: 'trad', h: 'wood', trad: 1, L: .44, B: .4, bay: 1, brake: 1 }, 'SVT-40의 형. 조금 길고 무거워요.');
G('avt40', 'AVT-40', 'br', '762r', 'auto', 750, 10, 2.5, 'rifle', 6200, 'RU', 1942, { c: 'wood', mg: 'straight', st: 'trad', h: 'wood', trad: 1, L: .44, B: .4, brake: 1 }, 'SVT-40을 연사도 되게 고친 소총. 10발이 금방 끝나요!', { rec: 1.25 });
G('g41w', 'Gewehr 41', 'br', '792', 'semi', 280, 10, 2.8, 'boltClip', 5000, 'DE', 1941, { c: 'wood', mg: 'internal', st: 'trad', h: 'wood', trad: 1, L: .46, B: .4 }, 'Gewehr 43의 형. 앞부분이 무거워서 흔들림이 적어요.', { acc: .8 });
G('fg42', 'FG 42', 'br', '792', 'auto', 750, 20, 2.5, 'side', 12000, 'DE', 1942, { mg: 'side', st: 'fixed', h: 'shroud', c: 'st', L: .42, B: .32, bipod: 1, bay: 1 }, '낙하산 부대를 위한 독일 자동소총. 옆에서 탄창을 꽂아요.', { rec: 1.25 });
G('ljungman', 'Ljungman AG m/42', 'br', '65swe', 'semi', 300, 10, 2.4, 'rifle', 5200, 'SE', 1942, { c: 'wood', mg: 'straight', st: 'trad', h: 'wood', trad: 1, L: .44, B: .4 }, '가스가 직접 볼트를 미는 방식을 처음 쓴 스웨덴 소총.', { acc: .75, rec: .85 });
G('zh29', 'ZH-29', 'br', '792', 'semi', 300, 10, 2.5, 'rifle', 5400, 'CZ', 1929, { c: 'wood', mg: 'straight', st: 'trad', h: 'wood', trad: 1, L: .44, B: .4 }, '체코가 만든 옛 반자동 소총. 시대를 앞서간 총이에요.');
G('vz52', 'vz. 52/57', 'br', '762x39', 'semi', 330, 10, 2.4, 'boltClip', 3200, 'CZ', 1957, { c: 'wood', mg: 'internal', st: 'trad', h: 'wood', trad: 1, L: .42, B: .38, bay: 1 }, '총검이 붙어 있는 체코의 반자동 소총.');
G('type56c', 'Type 56 카빈', 'br', '762x39', 'semi', 350, 10, 2.4, 'boltClip', 2800, 'CN', 1956, { c: 'wood', mg: 'internal', st: 'trad', h: 'wood', trad: 1, L: .4, B: .38, bay: 1 }, '중국에서 아주 많이 만든 SKS. 뾰족한 총검이 붙어 있어요.');
G('psl', 'PSL', 'br', '762r', 'semi', 300, 10, 2.6, 'ak', 9000, 'RO', 1974, { k: 'ak', c: 'wood', mg: 'straight', st: 'wood', L: .44, B: .5, sg: 'scope' }, '구멍 뚫린 나무 개머리판의 루마니아 저격소총.', { zoom: 4, acc: .55 });
G('m91rs', 'Zastava M91', 'br', '762r', 'semi', 300, 10, 2.6, 'ak', 9600, 'RS', 1991, { k: 'ak', c: 'blk', mg: 'straight', st: 'thumb', L: .44, B: .5, sg: 'scope' }, '세르비아가 만든 드라구노프 닮은 저격소총.', { zoom: 6, acc: .5 });
G('galatz', 'IMI Galatz', 'br', '762n', 'semi', 350, 25, 2.6, 'ak', 10500, 'IL', 1983, { k: 'ak', c: 'wood', mg: 'straight', st: 'fold', L: .42, B: .45, sg: 'scope', bipod: 1 }, '갈릴 소총을 저격용으로 바꾼 이스라엘 총.', { zoom: 6, acc: .5 });
G('g28', 'H&K G28', 'br', '762n', 'semi', 360, 20, 2.5, 'rifle', 15000, 'DE', 2011, { c: 'tan', mg: 'straight', st: 'fixed', h: 'rail', rail: 1, L: .42, B: .42, sg: 'scope', bipod: 1 }, '독일군과 미군이 고른 아주 정확한 지정사수 소총.', { zoom: 6, acc: .35 });
G('sig716', 'SIG 716', 'br', '762n', 'semi', 400, 20, 2.5, 'rifle', 9000, 'US', 2011, { c: 'blk', mg: 'straight', st: 'fold', h: 'rail', rail: 1, L: .4, B: .36 }, '가스 피스톤으로 움직이는 7.62mm AR.', { acc: .65 });
G('scar20s', 'FN SCAR 20S', 'br', '65cm', 'semi', 400, 10, 2.5, 'rifle', 15000, 'BE', 2019, { c: 'tan', mg: 'straight', st: 'fixed', h: 'rail', rail: 1, L: .44, B: .42, sg: 'scope', bipod: 1 }, '멀리까지 곧게 날아가는 6.5mm 탄을 쓰는 SCAR 저격소총.', { zoom: 6, acc: .35 });
G('l1a1', 'L1A1 SLR', 'br', '762n', 'semi', 400, 20, 2.6, 'rifle', 7000, 'UK', 1954, { c: 'wood', mg: 'straight', st: 'wood', h: 'wood', L: .42, B: .33 }, '영국과 호주가 쓴 반자동 FAL. 한 발 한 발 묵직해요.', { acc: .7 });
G('qbu191', 'QBU-191', 'br', '58', 'semi', 450, 30, 2.4, 'rifle', 11000, 'CN', 2019, { c: 'blk', mg: 'curved', st: 'fold', h: 'rail', rail: 1, L: .42, B: .36, sg: 'acog' }, '중국군의 새 지정사수 소총. 30발이나 들어가요.', { zoom: 3, acc: .5 });
G('svu', 'SVU', 'br', '762r', 'semi', 300, 10, 2.6, 'bullpup', 12500, 'RU', 1991, { bull: 1, c: 'blk', sg: 'scope' }, '드라구노프를 불펍으로 줄인 러시아 저격소총.', { zoom: 4, acc: .55 });
G('m2carbine', 'M2 Carbine', 'br', '30car', 'auto', 750, 30, 2.1, 'rifle', 3800, 'US', 1945, { c: 'wood', mg: 'curved', st: 'trad', h: 'wood', trad: 1, L: .34, B: .34 }, '연사가 되는 M1 카빈. 30발 휜 탄창을 써요.', { rec: .85 });
G('socom16', 'M1A SOCOM 16', 'br', '762n', 'semi', 400, 20, 2.5, 'rifle', 7600, 'US', 2004, { c: 'blk', mg: 'straight', st: 'fixed', h: 'box', L: .34, B: .36, brake: 1 }, 'M14를 짧게 만든 카빈. 동굴 안에서 다루기 좋아요.', { ads: 1.1 });
G('mk11', 'Mk 11 Mod 0', 'br', '762n', 'semi', 380, 20, 2.5, 'rifle', 13500, 'US', 1999, { c: 'blk', mg: 'straight', st: 'fixed', h: 'rail', rail: 1, L: .44, B: .4, sg: 'scope', bipod: 1 }, '미 해군 특수부대가 쓴 SR-25 저격소총.', { zoom: 6, acc: .4 });
G('rasheed', 'Rasheed Carbine', 'br', '762x39', 'semi', 330, 10, 2.4, 'rifle', 3600, 'EG', 1960, { c: 'wood', mg: 'straight', st: 'trad', h: 'wood', trad: 1, L: .38, B: .38, bay: 1 }, '하킴을 작게 줄인 이집트 카빈. 총검이 접혀 있어요.');
G('m5966', 'Zastava M59/66', 'br', '762x39', 'semi', 350, 10, 2.4, 'boltClip', 3000, 'YU', 1966, { c: 'wood', mg: 'internal', st: 'trad', h: 'wood', trad: 1, L: .44, B: .38, bay: 1 }, '총구에 유탄 발사 장치가 붙은 유고슬라비아 SKS.');

// ---- 저격·볼트·레버 ----
G('mrad', 'Barrett MRAD', 'sniper', '338', 'bolt', 45, 10, 3.0, 'boltMag', 30000, 'US', 2011, { sg: 'scope', c: 'tan', st: 'fold', mg: 'straight', brake: 1, bipod: 1 }, '총열을 바꿔 여러 탄을 쓰는 바렛의 정밀 저격총.', { zoom: 8, acc: .2 });
G('m2010', 'M2010 ESR', 'sniper', '300wm', 'bolt', 50, 5, 2.9, 'boltMag', 21000, 'US', 2011, { sg: 'scope', c: 'tan', st: 'fold', mg: 'straight', brake: 1, bipod: 1 }, 'M24를 더 센 탄으로 바꾼 미 육군 저격총.', { zoom: 8, acc: .25 });
G('msr', 'Remington MSR', 'sniper', '338', 'bolt', 45, 10, 3.0, 'boltMag', 27000, 'US', 2009, { sg: 'scope', c: 'blk', st: 'fold', mg: 'straight', brake: 1, bipod: 1 }, '접히는 개머리판의 모듈식 저격총.', { zoom: 8, acc: .2 });
G('tac338', 'McMillan TAC-338', 'sniper', '338', 'bolt', 45, 5, 2.9, 'boltMag', 26000, 'US', 2006, { sg: 'scope', c: 'od', st: 'thumb', mg: 'straight', bipod: 1 }, '아주 멀리까지 맞히는 미국 저격총.', { zoom: 8, acc: .2 });
G('ax50', 'AI AX50', 'sniper', '50bmg', 'bolt', 35, 5, 3.4, 'boltMag', 38000, 'UK', 2010, { sg: 'scope', c: 'tan', st: 'fold', mg: 'straight', L: .4, B: .6, brake: 1, bipod: 1 }, '영국의 .50 대물 저격총. 괴물 껍질을 여러 겹 뚫어요.', { zoom: 8, acc: .25 });
G('as50', 'AI AS50', 'sniper', '50bmg', 'semi', 120, 5, 3.4, 'boltMag', 42000, 'UK', 2005, { sg: 'scope', c: 'blk', st: 'fixed', mg: 'straight', L: .4, B: .6, brake: 1, bipod: 1 }, '.50 탄을 반자동으로 빠르게 쏘는 대물 저격총.', { zoom: 8, acc: .35 });
G('trg22', 'Sako TRG-22', 'sniper', '762n', 'bolt', 55, 10, 2.7, 'boltMag', 17000, 'FI', 2000, { sg: 'scope', c: 'od', st: 'thumb', mg: 'straight', bipod: 1 }, 'TRG-42의 동생. 반동이 작고 정밀해요.', { zoom: 8, acc: .2 });
G('ssg3000', 'SIG SSG 3000', 'sniper', '762n', 'bolt', 55, 5, 2.6, 'boltMag', 15000, 'CH', 1992, { sg: 'scope', c: 'blk', st: 'thumb', mg: 'straight', bipod: 1 }, '경찰 저격수들이 좋아한 스위스 저격총.', { zoom: 8, acc: .2 });
G('r93', 'Blaser R93 Tactical', 'sniper', '762n', 'bolt', 80, 5, 2.6, 'boltMag', 16000, 'DE', 1993, { sg: 'scope', c: 'blk', st: 'thumb', mg: 'straight', bipod: 1 }, '볼트를 돌리지 않고 곧게 당겼다 밀어서 아주 빨리 다시 쏴요.', { zoom: 6, acc: .25 });
G('dsr50', 'DSR-50', 'sniper', '50bmg', 'bolt', 35, 5, 3.4, 'bullpup', 40000, 'DE', 2003, { bull: 1, c: 'blk', sg: 'scope' }, 'DSR-1을 키운 .50 불펍 저격총. 반동 줄이는 장치가 있어요.', { zoom: 8, acc: .25, rec: .85 });
G('hecate2', 'PGM Hécate II', 'sniper', '50bmg', 'bolt', 35, 7, 3.4, 'boltMag', 37000, 'FR', 1993, { sg: 'scope', c: 'blk', st: 'fixed', mg: 'straight', L: .42, B: .65, brake: 1, bipod: 1 }, '그리스 마녀 여신의 이름을 딴 프랑스 대물 저격총.', { zoom: 8, acc: .25 });
G('ultimaratio', 'PGM Ultima Ratio', 'sniper', '762n', 'bolt', 55, 5, 2.6, 'boltMag', 15500, 'FR', 1990, { sg: 'scope', c: 'blk', st: 'fixed', mg: 'straight', bipod: 1 }, '‘마지막 수단’이라는 뜻의 프랑스 저격총.', { zoom: 8, acc: .2 });
G('frf2', 'FR-F2', 'sniper', '762n', 'bolt', 50, 10, 2.7, 'boltMag', 13000, 'FR', 1986, { sg: 'scope', c: 'blk', st: 'fixed', mg: 'straight', bipod: 1 }, '총열에 열을 막는 덮개를 씌운 프랑스군 저격총.', { zoom: 6, acc: .25 });
G('t5000', 'Orsis T-5000', 'sniper', '338', 'bolt', 45, 5, 3.0, 'boltMag', 27000, 'RU', 2011, { sg: 'scope', c: 'blk', st: 'fold', mg: 'straight', brake: 1, bipod: 1 }, '러시아 특수부대의 정밀 저격총.', { zoom: 8, acc: .2 });
G('vks', 'VKS Vykhlop', 'sniper', '127x55', 'bolt', 35, 5, 3.0, 'bullpup', 26000, 'RU', 2002, { bull: 1, c: 'blk', sg: 'scope' }, '커다란 소음기를 단 조용한 대물 저격총. ‘배기음’이라는 뜻이에요.', { zoom: 6, sup: 1, acc: .3 });
G('osv96', 'OSV-96', 'sniper', '127x108', 'semi', 100, 5, 3.4, 'boltMag', 40000, 'RU', 1996, { sg: 'scope', c: 'blk', st: 'fixed', mg: 'straight', L: .44, B: .65, brake: 1, bipod: 1 }, '반으로 접히는 러시아 대물 저격총.', { zoom: 8, acc: .35 });
G('asvk', 'ASVK Kord', 'sniper', '127x108', 'bolt', 35, 5, 3.4, 'bullpup', 37000, 'RU', 2004, { bull: 1, c: 'blk', sg: 'scope' }, '불펍 모양의 러시아 12.7mm 저격총.', { zoom: 8, acc: .3 });
G('dvl10', 'Lobaev DVL-10', 'sniper', '762n', 'bolt', 50, 10, 2.8, 'boltMag', 18000, 'RU', 2014, { sg: 'scope', c: 'tan', st: 'fixed', mg: 'straight', h: 'sd', bipod: 1 }, '총열을 감싸는 소음기를 단 러시아 정밀 저격총.', { zoom: 8, sup: 1, acc: .2 });
G('sv99', 'SV-99', 'sniper', '22lr', 'bolt', 120, 10, 2.0, 'boltMag', 4000, 'RU', 2000, { sg: 'scope', c: 'blk', st: 'fold', mg: 'straight', h: 'sd', B: .3 }, '작은 .22 탄을 쓰는 아주 조용한 저격총. 볼트를 곧게 당겨 빨리 쏴요.', { zoom: 4, sup: 1, acc: .3 });
G('vssk', 'VSSK Vykhlop 2', 'sniper', '127x55', 'bolt', 35, 5, 3.0, 'bullpup', 28000, 'RU', 2013, { bull: 1, c: 'tan', sg: 'scope' }, 'VKS를 다듬은 새 버전. 조용한데 한 방이 아주 세요.', { zoom: 6, sup: 1, acc: .28 });
G('m44mosin', 'Mosin M44', 'sniper', '762r', 'bolt', 50, 5, 2.6, 'boltClip', 3600, 'RU', 1944, { B: .44, bay: 1 }, '짧게 줄인 모신나강 카빈. 접히는 총검이 붙어 있어요.', { ads: 1.15, rec: 1.15 });
G('m1893', 'Mauser M1893', 'sniper', '7x57', 'bolt', 55, 5, 2.6, 'boltClip', 3800, 'ES', 1893, {}, '‘스페인 마우저’. 1898년 전쟁에서 미군을 깜짝 놀라게 했어요.', { acc: .85 });
G('krag', 'Krag–Jørgensen', 'sniper', '3040', 'bolt', 50, 5, .55, 'boltLoad', 3600, 'NO', 1892, {}, '옆문을 열고 한 발씩 넣는 노르웨이 설계 소총. 볼트가 아주 부드러워요.', { acc: .85 });
G('type30', 'Arisaka Type 30', 'sniper', '65ari', 'bolt', 52, 5, 2.6, 'boltClip', 3200, 'JP', 1897, {}, '아리사카 소총의 첫 번째 모델.');
G('berthier', 'Berthier M1907/15', 'sniper', '8lebel', 'bolt', 45, 3, 2.4, 'boltClip', 3000, 'FR', 1915, { B: .5 }, '아주 긴 프랑스 소총. 클립 하나에 3발만 들어가요.');
G('mas36', 'MAS-36', 'sniper', '75fr', 'bolt', 55, 5, 2.6, 'boltClip', 3600, 'FR', 1936, {}, '볼트 손잡이가 앞으로 휘어진 프랑스 소총.');
G('trapdoor', 'Springfield 1873', 'sniper', '4570', 'single', 22, 1, 1.4, 'martini', 3400, 'US', 1873, { c: 'wood' }, '뒤쪽 뚜껑을 젖혀 한 발씩 넣는 ‘트랩도어’ 소총.', { acc: .8 });
G('rolling', 'Remington Rolling Block', 'sniper', '4570', 'single', 26, 1, 1.3, 'martini', 3600, 'US', 1867, { c: 'wood' }, '굴러가는 쇳덩이로 잠그는 단순하고 튼튼한 소총.', { acc: .75 });
G('henry', 'Henry 1860', 'sniper', '4440', 'lever', 120, 15, .45, 'lever', 3800, 'US', 1860, { k: 'lever', c: 'ch', B: .44 }, '15발을 넣고 레버만 당기면 계속 쏘는 최초의 레버액션.', { rec: .8 });
G('win1895', 'Winchester 1895', 'sniper', '762r', 'lever', 90, 5, 2.6, 'boltClip', 5200, 'US', 1895, { k: 'lever', c: 'st', B: .5 }, '러시아 군대가 사 간 레버액션. 위에서 클립으로 장전해요.', { rec: 1.1 });
G('savage99', 'Savage 99', 'sniper', '3030', 'lever', 100, 5, .5, 'lever', 3400, 'US', 1899, { k: 'lever', c: 'wood', B: .46 }, '빙글 도는 탄창에 탄이 몇 발 남았는지 보이는 레버액션.');
G('marlin336', 'Marlin 336', 'sniper', '3030', 'lever', 100, 6, .5, 'lever', 2600, 'US', 1948, { k: 'lever', c: 'wood', B: .44 }, '사슴 사냥꾼이 사랑한 레버액션. 옆으로 탄피가 튀어요.');
G('blr', 'Browning BLR', 'sniper', '762n', 'lever', 95, 4, 2.3, 'boltMag', 5600, 'BE', 1969, { k: 'lever', c: 'wood', B: .46 }, '탄창을 갈아 끼우는 레버액션. 센 탄을 써요.');
G('r1022', 'Ruger 10/22', 'sniper', '22lr', 'semi', 450, 10, 1.8, 'boltMag', 900, 'US', 1964, { c: 'wood', mg: 'straight', B: .3 }, '빙글 도는 10발 탄창을 쓰는 작은 사냥총. 반동이 거의 없어요.', { acc: .6, rec: .4 });
G('scout', 'Steyr Scout', 'sniper', '762n', 'bolt', 55, 5, 2.4, 'boltMag', 9000, 'AT', 1998, { c: 'blk', st: 'fixed', mg: 'straight', sg: 'acog', bipod: 1, B: .36 }, '짧고 가벼운 ‘정찰병 소총’. 조준경이 앞쪽에 달려요.', { zoom: 3, acc: .3, ads: 1.15 });
G('t3', 'Tikka T3x', 'sniper', '65cm', 'bolt', 55, 5, 2.4, 'boltMag', 8000, 'FI', 2003, { sg: 'scope', c: 'blk', st: 'thumb', mg: 'straight' }, '가볍고 정확한 핀란드 사냥 저격총.', { zoom: 6, acc: .25 });
G('cz550', 'CZ 550', 'sniper', '93x64', 'bolt', 50, 5, 2.6, 'boltMag', 8400, 'CZ', 1995, { sg: 'scope', c: 'wood' }, '큰 짐승도 잡는 체코의 튼튼한 사냥총.', { zoom: 4, acc: .3 });
G('markv', 'Weatherby Mark V', 'sniper', '300wm', 'bolt', 45, 3, .6, 'boltLoad', 12000, 'US', 1955, { sg: 'scope', c: 'wood' }, '총알이 아주 빠르게 날아가는 고급 사냥총.', { zoom: 6, acc: .25 });
G('win70', 'Winchester Model 70', 'sniper', '3006', 'bolt', 55, 5, .55, 'boltLoad', 6000, 'US', 1936, { sg: 'scope', c: 'wood' }, '‘소총 쏘는 사람의 소총’. 미 해병대 저격수도 썼어요.', { zoom: 6, acc: .3 });
G('sp66', 'Mauser SP66', 'sniper', '762n', 'bolt', 60, 3, .55, 'boltLoad', 13000, 'DE', 1976, { sg: 'scope', c: 'wood', st: 'thumb', brake: 1 }, '볼트가 아주 짧아서 빨리 다시 쏘는 독일 경찰 저격총.', { zoom: 8, acc: .2 });
G('wa2000', 'Walther WA 2000', 'sniper', '300wm', 'semi', 150, 6, 2.6, 'bullpup', 34000, 'DE', 1982, { bull: 1, c: 'wood', sg: 'scope' }, '176자루만 만든 아주 귀한 반자동 저격총. 나무와 쇠로 된 예술품이에요.', { zoom: 8, acc: .2 });
G('vidhwansak', 'Vidhwansak', 'sniper', '20mm', 'bolt', 25, 3, 3.6, 'boltMag', 44000, 'IN', 2005, { sg: 'scope', c: 'blk', st: 'fixed', mg: 'side', L: .48, B: .7, brake: 1, bipod: 1 }, '‘파괴자’라는 뜻의 인도 대물 저격총. 20mm 포탄을 쏴요!', { zoom: 8, acc: .35 });
G('lahti39', 'Lahti L-39', 'sniper', '20mm', 'semi', 60, 10, 3.8, 'top', 42000, 'FI', 1939, { c: 'st', st: 'fixed', mg: 'top', L: .5, B: .8, brake: 1, bipod: 1 }, '스키 양각대를 단 핀란드 대전차총. ‘코끼리 총’이라고 불렸어요.', { acc: .5, rec: 1.1 });
G('ntw20', 'Denel NTW-20', 'sniper', '20mm', 'bolt', 25, 3, 3.6, 'side', 45000, 'ZA', 1998, { sg: 'scope', c: 'blk', mg: 'side', st: 'fixed', L: .48, B: .7, brake: 1, bipod: 1 }, '옆에 탄창을 꽂는 남아공의 20mm 대물 저격총.', { zoom: 8, acc: .35 });
G('hs50', 'Steyr HS .50', 'sniper', '50bmg', 'single', 22, 1, 2.4, 'boltLoad', 30000, 'AT', 2004, { sg: 'scope', c: 'blk', st: 'fixed', mg: 'internal', L: .42, B: .65, brake: 1, bipod: 1 }, '한 발씩 넣고 쏘는 단순한 .50 저격총.', { zoom: 8, acc: .25 });
G('m93ba', 'Zastava M93 Black Arrow', 'sniper', '50bmg', 'bolt', 35, 5, 3.4, 'boltMag', 34000, 'YU', 1998, { sg: 'scope', c: 'blk', st: 'fixed', mg: 'straight', L: .42, B: .65, brake: 1, bipod: 1 }, '‘검은 화살’이라는 이름의 대물 저격총.', { zoom: 8, acc: .3 });
G('gepard', 'Gepárd M1', 'sniper', '127x108', 'single', 20, 1, 2.4, 'boltLoad', 30000, 'HU', 1991, { sg: 'scope', c: 'blk', st: 'fixed', mg: 'internal', L: .46, B: .65, brake: 1, bipod: 1 }, '‘치타’라는 이름의 헝가리 대물 저격총. 한 발씩 넣어요.', { zoom: 6, acc: .3 });
G('boys', 'Boys 대전차총', 'sniper', '55boys', 'bolt', 30, 5, 3.0, 'top', 26000, 'UK', 1937, { c: 'st', mg: 'top', st: 'fixed', L: .48, B: .65, brake: 1, bipod: 1 }, '탄창을 위에 꽂는 영국 대전차 소총. 반동이 어마어마해요!', { rec: 1.2, acc: .5 });
G('ptrs41', 'PTRS-41', 'sniper', '145', 'semi', 60, 5, 3.4, 'boltClip', 34000, 'RU', 1941, { c: 'wood', st: 'fixed', mg: 'internal', L: .5, B: .8, brake: 1, bipod: 1 }, '14.5mm 탄을 반자동으로 쏘는 소련 대전차총. PTRD의 친구예요.', { acc: .5 });
G('delisle', 'De Lisle 카빈', 'sniper', '45acp', 'bolt', 60, 8, 2.2, 'boltMag', 6000, 'UK', 1942, { c: 'wood', h: 'sd', mg: 'straight', B: .4 }, '역사상 가장 조용한 총 가운데 하나. 볼트를 당기는 소리가 더 커요.', { sup: 1, acc: .4 });

// ---- 산탄총 ----
G('m930', 'Mossberg 930', 'shotgun', '12ga', 'semi', 240, 8, .45, 'shell', 4400, 'US', 2005, { c: 'blk', noPump: 1 }, '반자동 모스버그. 빠르게 연달아 쏠 수 있어요.');
G('m590m', 'Mossberg 590M', 'shotgun', '12ga', 'pump', 85, 10, 2.4, 'rifle', 4800, 'US', 2017, { c: 'blk', mg: 'straight' }, '탄창을 갈아 끼우는 펌프 산탄총. 장전이 빨라요.');
G('m835', 'Mossberg 835 Ulti-Mag', 'shotgun', '10ga', 'pump', 70, 6, .55, 'shell', 4200, 'US', 1988, { c: 'od' }, '아주 센 매그넘 산탄을 쓰는 펌프 산탄총.', { rec: 1.1 });
G('r1187', 'Remington 11-87', 'shotgun', '12ga', 'semi', 220, 6, .5, 'shell', 4000, 'US', 1987, { c: 'wood', noPump: 1 }, '센 탄도 약한 탄도 다 쏘는 반자동 산탄총.');
G('sxp', 'Winchester SXP', 'shotgun', '12ga', 'pump', 110, 5, .45, 'shell', 3200, 'US', 2008, { c: 'blk' }, '세상에서 가장 빨리 펌프질하는 산탄총으로 알려졌어요.');
G('win1200', 'Winchester 1200', 'shotgun', '12ga', 'pump', 90, 5, .5, 'shell', 2400, 'US', 1964, { c: 'wood' }, '가볍고 싼 펌프 산탄총. 경찰차에 많이 실렸어요.');
G('bps', 'Browning BPS', 'shotgun', '12ga', 'pump', 85, 5, .5, 'shell', 3000, 'US', 1977, { c: 'wood' }, '탄피가 아래로 떨어져 왼손잡이도 편한 펌프 산탄총.');
G('b1301', 'Beretta 1301 Tactical', 'shotgun', '12ga', 'semi', 300, 7, .4, 'shell', 6400, 'IT', 2014, { c: 'blk', noPump: 1, rail: 1 }, '아주 빠르게 쏘는 반자동 산탄총. 장전도 빨라요.', { rec: .85 });
G('benellim2', 'Benelli M2', 'shotgun', '12ga', 'semi', 280, 5, .45, 'shell', 5000, 'IT', 2005, { c: 'blk', noPump: 1 }, '관성으로 움직이는 가볍고 빠른 산탄총.');
G('supernova', 'Benelli Supernova', 'shotgun', '12ga', 'pump', 85, 5, .5, 'shell', 3200, 'IT', 2006, { c: 'blk' }, '반동을 줄이는 개머리판을 단 튼튼한 펌프 산탄총.', { rec: .85 });
G('sdass', 'Fabarm SDASS', 'shotgun', '12ga', 'pump', 80, 7, .5, 'shell', 3600, 'IT', 1999, { c: 'blk' }, '군대와 경찰을 위해 만든 이탈리아 펌프 산탄총.');
G('al48', 'Franchi AL-48', 'shotgun', '20ga', 'semi', 250, 4, .45, 'shell', 2600, 'IT', 1948, { c: 'wood', noPump: 1 }, '아주 가벼운 20게이지 반자동 산탄총.', { rec: .75 });
G('vepr12', 'Vepr-12', 'shotgun', '12ga', 'semi', 240, 8, 2.6, 'ak', 7000, 'RU', 2003, { k: 'ak', c: 'blk', mg: 'straight', noPump: 1, st: 'fold' }, 'RPK 기관총 몸통으로 만든 탄창식 산탄총.');
G('saiga20', 'Saiga-20', 'shotgun', '20ga', 'semi', 260, 8, 2.5, 'ak', 5200, 'RU', 1997, { k: 'ak', c: 'blk', mg: 'straight', noPump: 1 }, '조금 작은 20게이지 사이가. 반동이 순해요.', { rec: .8 });
G('mka1919', 'Akdal MKA 1919', 'shotgun', '12ga', 'semi', 280, 5, 2.4, 'rifle', 5000, 'TR', 2009, { c: 'blk', mg: 'straight', st: 'fixed', h: 'rail', carry: 1, noPump: 1 }, 'M16처럼 생긴 튀르키예 산탄총.');
G('typhoonf12', 'Typhoon F12', 'shotgun', '12ga', 'semi', 280, 5, 2.4, 'rifle', 5200, 'TR', 2016, { c: 'tan', mg: 'straight', st: 'fixed', h: 'rail', rail: 1, noPump: 1 }, 'AR 모양의 튀르키예 반자동 산탄총.');
G('dp12', 'Standard DP-12', 'shotgun', '12ga', 'pump', 160, 16, .5, 'shell', 6000, 'US', 2015, { c: 'blk', bull: 1, tubes: 2 }, '관이 두 개라 펌프 한 번에 두 발을 쏘는 불펍 산탄총.');
G('ks7', 'Kel-Tec KS7', 'shotgun', '12ga', 'pump', 80, 7, .5, 'shell', 3000, 'US', 2018, { c: 'blk', bull: 1, carry: 1 }, 'KSG를 줄인 가벼운 불펍 산탄총.', { ads: 1.15 });
G('srm1216', 'SRM 1216', 'shotgun', '12ga', 'semi', 300, 16, 3.0, 'drum', 9000, 'US', 2011, { c: 'blk', mg: 'drum', st: 'fixed', h: 'rail', noPump: 1, fg: 1 }, '관 4개를 빙글 돌리며 16발을 쏘는 반자동 산탄총.');
G('neostead', 'Neostead', 'shotgun', '12ga', 'pump', 85, 12, .5, 'shell', 5200, 'ZA', 1990, { c: 'blk', bull: 1, carry: 1, tubes: 2 }, '펌프를 앞으로 미는 신기한 남아공 불펍 산탄총.');
G('jackhammer', 'Pancor Jackhammer', 'shotgun', '12ga', 'auto', 240, 10, 2.8, 'drum', 12000, 'US', 1984, { bull: 1, c: 'blk', mg: 'drum', noPump: 1 }, '리볼버 같은 원통을 꽂는 자동 산탄총. 몇 자루만 만들었어요.', { rec: .7 });
G('aas', 'Atchisson AAS', 'shotgun', '12ga', 'auto', 360, 7, 2.6, 'rifle', 11000, 'US', 1972, { c: 'wood', mg: 'straight', st: 'fixed', h: 'shroud', noPump: 1 }, 'AA-12의 할아버지. 1970년대의 자동 산탄총이에요.', { rec: .8 });
G('streetsweeper', 'Cobray Streetsweeper', 'shotgun', '12ga', 'semi', 300, 12, .5, 'shell', 5600, 'US', 1989, { c: 'blk', mg: 'drum', st: 'fold', noPump: 1, B: .3, fg: 1 }, '스트라이커를 미국에서 다시 만든 원통 산탄총.');
G('mag10', 'Ithaca Mag-10', 'shotgun', '10ga', 'semi', 200, 3, .55, 'shell', 4400, 'US', 1975, { c: 'wood', noPump: 1 }, '아주 큰 10게이지 반자동 산탄총. 거위 사냥용이에요.', { rec: 1.1 });
G('stevens520', 'Stevens 520-30', 'shotgun', '12ga', 'pump', 80, 5, .5, 'shell', 2400, 'US', 1918, { c: 'wood', bay: 1 }, '총검까지 단 1차 대전의 ‘참호 총’.');
G('win1901', 'Winchester 1901', 'shotgun', '10ga', 'lever', 60, 5, .55, 'lever', 3600, 'US', 1901, { k: 'lever', c: 'st', B: .5 }, '레버를 당겨 쏘는 10게이지 산탄총.');
G('hawk982', 'Norinco 982', 'shotgun', '12ga', 'pump', 80, 5, .5, 'shell', 1600, 'CN', 2000, { c: 'blk' }, '레밍턴 870을 닮은 싸고 튼튼한 중국 산탄총.');
G('r31', 'Remington Model 31', 'shotgun', '12ga', 'pump', 90, 4, .5, 'shell', 2400, 'US', 1931, { c: 'wood' }, '펌프질이 아주 부드러운 옛 산탄총.');
G('sav720', 'Savage Model 720', 'shotgun', '12ga', 'semi', 200, 4, .55, 'shell', 2600, 'US', 1930, { c: 'wood', noPump: 1 }, '2차 대전에서 쓴 오토-5 닮은 반자동 산탄총.');
G('mp153', 'Baikal MP-153', 'shotgun', '12ga', 'semi', 220, 4, .5, 'shell', 2800, 'RU', 2000, { c: 'blk', noPump: 1 }, '러시아의 튼튼한 반자동 사냥 산탄총.');
G('mp133', 'Baikal MP-133', 'shotgun', '12ga', 'pump', 80, 6, .5, 'shell', 1800, 'RU', 2000, { c: 'blk' }, '러시아에서 가장 흔한 펌프 산탄총.');
G('izh43', 'IZh-43', 'shotgun', '12ga', 'single', 400, 2, 2.0, 'break', 1500, 'RU', 1986, { k: 'double', c: 'wood' }, '총열이 나란히 두 개인 러시아 쌍열 산탄총.');
G('b682', 'Beretta 682', 'shotgun', '12ga', 'single', 400, 2, 2.0, 'break', 3600, 'IT', 1984, { k: 'double', c: 'wood' }, '총열이 위아래로 붙은 고급 사격 대회용 산탄총.', { acc: .8 });
G('citori', 'Browning Citori', 'shotgun', '20ga', 'single', 400, 2, 1.9, 'break', 3000, 'BE', 1973, { k: 'double', c: 'wood' }, '꺾어서 장전하는 위아래 쌍열 산탄총.');
G('bekas', 'Molot Bekas-M', 'shotgun', '12ga', 'pump', 80, 7, .5, 'shell', 2600, 'RU', 1990, { c: 'blk' }, '관이 두 줄인 러시아 펌프 산탄총.');

// ---- 기관총 ----
G('mk43', 'Mk 43 Mod 1', 'lmg', '762n', 'auto', 600, 100, 4.8, 'belt', 17000, 'US', 2003, { c: 'blk', st: 'fixed', rail: 1, h: 'rail' }, 'M60을 가볍게 고친 해군 특수부대 기관총.');
G('mk48', 'Mk 48', 'lmg', '762n', 'auto', 730, 100, 4.6, 'belt', 18000, 'BE', 2003, { c: 'tan', st: 'fixed', rail: 1 }, 'M249를 7.62mm 탄용으로 키운 기관총.', { rec: 1.05 });
G('pecheneg', 'PKP Pecheneg', 'lmg', '762r', 'auto', 650, 100, 4.8, 'belt', 18000, 'RU', 2001, { c: 'blk', st: 'fixed', h: 'shroud' }, '총열을 바람으로 식혀서 쉬지 않고 쏘는 러시아 기관총.', { acc: .85 });
G('rpk74', 'RPK-74', 'lmg', '545', 'auto', 600, 45, 2.7, 'ak', 9000, 'RU', 1974, { k: 'ak', c: 'wood', bipod: 1, L: .42 }, '총열이 긴 AK-74. 45발 탄창을 써요.', { acc: .8 });
G('rpk16', 'RPK-16', 'lmg', '545', 'auto', 700, 95, 3.4, 'drum', 13000, 'RU', 2017, { k: 'ak', c: 'blk', mg: 'drum', bipod: 1, rail: 1 }, '95발 드럼 탄창을 단 새 RPK. 총열을 짧게 바꿀 수 있어요.');
G('rpl20', 'RPL-20', 'lmg', '545', 'auto', 800, 100, 4.4, 'belt', 15000, 'RU', 2021, { c: 'blk', st: 'fold', rail: 1 }, '러시아가 새로 만든 5.45mm 탄띠 기관총.');
G('rp46', 'RP-46', 'lmg', '762r', 'auto', 650, 250, 5.0, 'belt', 12000, 'RU', 1946, { c: 'wood', st: 'wood', h: 'none' }, 'DP-28에 탄띠를 달아 고친 소련 기관총.');
G('sg43', 'SG-43 Goryunov', 'lmg', '762r', 'auto', 650, 250, 5.4, 'belt', 15000, 'RU', 1943, { c: 'st', st: 'none', h: 'shroud' }, '바퀴 달린 받침대에 얹어 쓰던 소련 중기관총.', { acc: .8 });
G('type99lmg', 'Type 99 경기관총', 'lmg', '77ari', 'auto', 800, 30, 2.6, 'top', 9000, 'JP', 1939, { c: 'wood', mg: 'top', st: 'wood', h: 'none', bipod: 1, L: .44, B: .4 }, '96식을 더 큰 탄용으로 고친 일본 기관총.', { acc: .7 });
G('type11', 'Type 11 경기관총', 'lmg', '65ari', 'auto', 500, 30, 3.2, 'boltClip', 7000, 'JP', 1922, { c: 'wood', mg: 'internal', st: 'wood', h: 'cooler', bipod: 1, L: .44, B: .4 }, '소총 클립을 깔때기에 넣어 쏘는 신기한 일본 기관총.');
G('mg3', 'MG3', 'lmg', '762n', 'auto', 1100, 100, 4.8, 'belt', 19000, 'DE', 1959, { c: 'blk', h: 'shroud', st: 'fixed' }, 'MG42를 NATO 탄용으로 다시 만든 총. 지금도 독일군이 써요.', { rec: 1.15 });
G('mg5', 'H&K MG5', 'lmg', '762n', 'auto', 800, 120, 4.8, 'belt', 21000, 'DE', 2015, { c: 'blk', st: 'fold', rail: 1 }, 'MG3 뒤를 잇는 독일의 새 기관총.', { rec: .95 });
G('hk21', 'H&K HK21', 'lmg', '762n', 'auto', 800, 100, 4.6, 'belt', 15000, 'DE', 1961, { c: 'blk', st: 'fixed', h: 'box' }, 'G3 소총을 기관총으로 바꾼 총.', { acc: .8 });
G('fnmag', 'FN MAG', 'lmg', '762n', 'auto', 750, 100, 4.8, 'belt', 17000, 'BE', 1958, { c: 'blk', st: 'fixed', h: 'none' }, '전 세계 80개 나라가 쓰는 범용 기관총.', { acc: .85 });
G('ameli', 'CETME Ameli', 'lmg', '556', 'auto', 1200, 100, 4.2, 'belt', 13000, 'ES', 1982, { c: 'blk', st: 'fixed', h: 'shroud' }, '작은 MG42처럼 생긴 스페인 경기관총. 아주 빨라요!', { rec: .8 });
G('vickers', 'Vickers Mk I', 'lmg', '303', 'auto', 500, 250, 5.4, 'belt', 15000, 'UK', 1912, { c: 'st', h: 'cooler', st: 'none' }, '물통으로 식히는 영국 중기관총. 몇 시간이고 쏘았어요.', { acc: .9 });
G('hotchkiss14', 'Hotchkiss M1914', 'lmg', '8lebel', 'auto', 450, 30, 3.0, 'side', 11000, 'FR', 1914, { c: 'ch', h: 'cooler', st: 'none', mg: 'side' }, '쇠판 띠를 옆으로 끼워 쏘는 프랑스 중기관총.', { acc: .85 });
G('fm2429', 'FM 24/29', 'lmg', '75fr', 'auto', 500, 25, 2.6, 'top', 9000, 'FR', 1929, { c: 'wood', mg: 'top', st: 'wood', h: 'none', bipod: 1, L: .44, B: .4 }, '방아쇠가 두 개라 한 발과 연사를 고르는 프랑스 경기관총.', { acc: .75 });
G('madsen', 'Madsen 경기관총', 'lmg', '792', 'auto', 450, 40, 2.8, 'top', 9500, 'DK', 1902, { c: 'wood', mg: 'top', st: 'wood', h: 'shroud', bipod: 1, L: .44, B: .4 }, '세계에서 처음으로 만든 경기관총 가운데 하나. 100년 넘게 쓰였어요.', { acc: .8 });
G('zb26', 'ZB vz. 26', 'lmg', '792', 'auto', 500, 30, 2.6, 'top', 9800, 'CZ', 1926, { c: 'wood', mg: 'top', st: 'wood', h: 'none', bipod: 1, L: .44, B: .4 }, '브렌 기관총의 엄마. 튼튼하고 정확한 체코 경기관총.', { acc: .65 });
G('breda30', 'Breda M30', 'lmg', '65car', 'auto', 475, 20, 3.0, 'side', 7000, 'IT', 1930, { c: 'wood', mg: 'side', st: 'wood', h: 'none', bipod: 1, L: .44, B: .4 }, '옆에 붙은 탄창 상자에 클립으로 장전하는 이탈리아 기관총.');
G('negevng7', 'IWI Negev NG7', 'lmg', '762n', 'auto', 700, 125, 4.6, 'belt', 19000, 'IL', 2012, { c: 'blk', st: 'fold', rail: 1 }, '7.62mm를 쓰는 네게브. 한 사람이 들고 다닐 수 있어요.');
G('qjy88', 'QJY-88', 'lmg', '58', 'auto', 700, 200, 4.6, 'belt', 15000, 'CN', 1988, { c: 'blk', st: 'fixed', h: 'shroud' }, '중국군의 범용 기관총.');
G('m2hb', 'M2 브라우닝', 'lmg', '50bmg', 'auto', 550, 100, 5.8, 'belt', 32000, 'US', 1933, { c: 'blk', st: 'none', h: 'shroud', L: .5, B: .2 }, '‘마 듀스’라는 별명의 .50 중기관총. 100년 가까이 쓰인 전설이에요!', { rec: 1.1, acc: .9 });
G('kord', 'Kord 6P50', 'lmg', '127x108', 'auto', 650, 50, 5.6, 'belt', 34000, 'RU', 1998, { c: 'blk', st: 'fixed', h: 'shroud', L: .48, B: .3 }, '양각대로 들고 쏠 수 있는 러시아 12.7mm 중기관총.', { rec: 1.05 });

// ---- 특수 화기 ----
G('k11', 'Daewoo K11', 'special', '20gl', 'semi', 150, 6, 3.6, 'mgl', 34000, 'KR', 2010, { k: 'mgl' }, '대한민국이 만든 공중폭발 유탄 소총! 괴물 머리 위에서 펑 터져요.');
G('xm25', 'XM25 CDTE', 'special', '25mm', 'semi', 140, 5, 3.4, 'mgl', 40000, 'US', 2010, { k: 'mgl' }, '거리를 재서 숨은 적 위에서 터뜨리는 미국 시험 무기.');
G('qlz87', 'QLZ-87', 'special', '35mm', 'auto', 400, 15, 4.2, 'mgl', 46000, 'CN', 2003, { k: 'mgl' }, '유탄을 연사하는 중국 자동 유탄발사기. 드럼에 15발!');
G('chinalake', 'China Lake 유탄발사기', 'special', '40mm', 'semi', 70, 4, 1.5, 'mgl', 26000, 'US', 1968, { k: 'mgl' }, '베트남 전쟁의 펌프식 유탄발사기. 몇 자루만 만든 귀한 총이에요.');
G('gm94', 'GM-94', 'special', '40mm', 'semi', 70, 3, 1.6, 'mgl', 24000, 'RU', 2004, { k: 'mgl' }, '위에 관 탄창이 달린 러시아 펌프식 유탄발사기.');
G('mm1', 'Hawk MM-1', 'special', '40mm', 'semi', 120, 12, 5.0, 'mgl', 42000, 'US', 1980, { k: 'mgl' }, '리볼버처럼 큰 원통에 유탄 12발이 들어가요!');
G('m72', 'M72 LAW', 'special', 'm72', 'single', 30, 1, 2.8, 'rocket', 20000, 'US', 1963, { k: 'rpg' }, '늘려서 쏘는 가벼운 로켓 발사기.');
G('at4', 'AT4', 'special', '84mm', 'single', 25, 1, 3.4, 'rocket', 34000, 'SE', 1987, { k: 'rpg' }, '스웨덴의 일회용 대전차 무기. 크게 폭발해요.');
G('pzf3', 'Panzerfaust 3', 'special', 'pf3', 'single', 22, 1, 3.6, 'rocket', 40000, 'DE', 1992, { k: 'rpg' }, '굵은 탄두를 쏘는 독일 대전차 무기. 폭발이 아주 커요.');
G('pzf60', 'Panzerfaust 60', 'special', 'pf60', 'single', 25, 1, 3.0, 'rocket', 18000, 'DE', 1944, { k: 'rpg' }, '관 끝에 커다란 탄두가 달린 2차 대전 대전차 무기.', { acc: 1.3 });
G('piat', 'PIAT', 'special', 'piat', 'single', 22, 1, 3.4, 'rocket', 21000, 'UK', 1942, { k: 'rpg' }, '커다란 용수철로 폭탄을 튕겨 쏘는 영국 대전차 무기.', { quiet: 1 });
G('smaw', 'SMAW', 'special', '84mm', 'single', 25, 1, 3.6, 'rocket', 36000, 'US', 1984, { k: 'rpg' }, '미 해병대가 벙커를 부수는 로켓 발사기.');
G('m202', 'M202 FLASH', 'special', 'm72', 'semi', 80, 4, 5.0, 'rocket', 48000, 'US', 1978, { k: 'rpg' }, '로켓 4발을 연달아 쏘는 네모난 발사기!');
G('rpoa', 'RPO-A Shmel', 'special', 'rpo', 'single', 20, 1, 3.8, 'rocket', 50000, 'RU', 1988, { k: 'rpg' }, '‘호박벌’이라는 이름의 열압력 로켓. 폭발이 엄청나게 커요!');
G('gau19', 'GAU-19', 'special', '50bmg', 'auto', 1300, 300, 6.0, 'minigun', 70000, 'US', 1983, { k: 'minigun' }, '총열 3개가 도는 .50 개틀링. 무겁지만 무시무시해요.', { spin: .9, rec: .45 });

GUNS.forEach(g => GUN[g.id] = g);
