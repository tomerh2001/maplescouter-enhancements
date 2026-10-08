const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { applyTranslationOverrides } = require('../scripts/translation-overrides.cjs');
const root = path.join(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const dict = read('data/dictionary.json'), patch = read('data/i18n-patch.json');
applyTranslationOverrides(patch, dict);
const source = fs.readFileSync(path.join(root, 'src/maplescouter-en-fix.user.js'), 'utf8');
const ctx = vm.createContext({ data: () => ({ dict, rules: read('data/rules.json') }), HANGUL: /[가-힣]/ });
vm.runInContext(source.slice(source.indexOf('  var KO_NUM_UNITS'), source.indexOf('  function translateTitle(')), ctx);
const reviewed = read('data/overrides/2026-09-17.json');

test('reviewed UI strings work in both i18next and exact DOM text, including whitespace', () => {
  for (const [ko, en] of Object.entries(reviewed)) {
    assert.equal(patch[ko], en, ko);
    assert.equal(ctx.translateString(ko), en, ko);
    assert.deepEqual(en.match(/{{[^}]+}}/g), ko.match(/{{[^}]+}}/g), ko);
  }
});

test('all 184 probability tables preserve every number, row and odds column', () => {
  const tables = Object.entries(reviewed).filter(([ko]) => ko.startsWith('\n') && /\s{2,}[\d.]+%/.test(ko));
  assert.equal(tables.length, 184);
  for (const [ko, en] of tables) {
    assert.doesNotMatch(en, /[가-힣]/);
    assert.deepEqual(en.match(/\d+(?:\.\d+)?/g), ko.match(/\d+(?:\.\d+)?/g));
    assert.equal(en.split('\n').length, ko.split('\n').length);
    assert.deepEqual(en.match(/\s{2,}\d+(?:\.\d+)?%\s*$/gm), ko.match(/\s{2,}\d+(?:\.\d+)?%\s*$/gm));
  }
});

test('potential skill names use GMS terminology', () => {
  const table = Object.values(reviewed).find(s => s.includes('Decent Speed Infusion'));
  assert.ok(table);
  assert.doesNotMatch(table, /Wind Booster/);
});

test('HEXA icon labels translate complete skill groups before splitting Korean runs', () => {
  assert.equal(ctx.translateString('hexa-이슈타르의 링 VI'), 'HEXA: Ishtar’s Ring VI');
  assert.equal(ctx.translateString('hexa-유니콘 스파이크 VI/거스트 다이브 VI/스트라이크 듀얼샷 VI'), 'HEXA: Unicorn Spike VI/Gust Dive VI/Stunning Strikes VI');
});

test('class analysis metadata translates around the server date and sample count', () => {
  const out = ctx.translateString('기준일 2026-09-13 · 샘플 8,795캐릭터 (환산주스탯 구간별)');
  assert.doesNotMatch(out, /[가-힣]/);
  assert.match(out, /2026-09-13/);
  assert.match(out, /8,795 characters by Equivalent Stat range/);
});

test('reviewed English is not changed a second time by legacy English substitutions', () => {
  for (const en of Object.values(reviewed)) {
    if (/[가-힣]/.test(en)) continue; // Required literal submission tag stays Korean.
    const again = ctx.translateString(en);
    assert.ok(again === null || again === en, `${en} -> ${again}`);
  }
});

for (const [ko, en] of [
  ['2086억 6801만 6589', '208,668,016,589'],
  ['1.5억', '150,000,000'], ['8천만', '80,000,000'],
  ['1.5천만', '15,000,000'], ['2경 3조', '20,003,000,000,000,000'],
  ['0억', '0'],
]) test(`Korean numeric display: ${ko}`, () => assert.equal(ctx.koreanNumberToEnglish(ko), en));

test('numeric translation leaves malformed strings and non-numeric names alone', () => {
  for (const text of ['억', '천만', '1..5억', '1억garbage', '23천억', '억1만', '1억2만3조oops', 'HTomer']) {
    assert.equal(ctx.koreanNumberToEnglish(text), null, text);
  }
});

test('dynamic equipment levels and stat tooltips retain their meaning', () => {
  assert.equal(ctx.translateString('250제 모자'), 'Lv. 250 Hat');
  assert.equal(ctx.translateString('운 32 증가'), 'LUK +32');
  assert.equal(ctx.translateString('힘 100 증가'), 'STR +100');
});

function localeHarness(current, saved, referrer = '') {
  let redirected, value = saved;
  const ctx = vm.createContext({
    URL, LOCALES: ['ko', 'en', 'ja', 'ch'], LS_LOCALE: 'locale',
    location: { pathname: current, origin: 'https://maplescouter.com', search: '?manual=true', hash: '#boss', replace: url => { redirected = url; } },
    document: { referrer },
    localStorage: { getItem: () => value, setItem: (_key, v) => { value = v; } },
  });
  vm.runInContext(source.slice(source.indexOf('  function pathLocale('), source.indexOf('  /* ---------------- 2. Region')), ctx);
  return { ctx, value: () => value, redirected: () => redirected };
}

test('detailed results retain English when a native route defaults to Korean', () => {
  const h = localeHarness('/ko/result', 'en', 'https://maplescouter.com/en/input');
  assert.equal(h.ctx.restoreLocale(), true);
  assert.equal(h.redirected(), '/en/result?manual=true#boss');
  assert.equal(h.value(), 'en');
  assert.equal(h.ctx.navigationLocale('/en/input', '/ko/result', 'en'), 'en');
});

test('deliberate language changes on the same page still work in both directions', () => {
  for (const [from, to] of [['en','ko'], ['ko','en'], ['ja','en']]) {
    const h = localeHarness(`/${to}/input`, from, `https://maplescouter.com/${from}/input`);
    const item = { textContent: {en:'English',ko:'Korean',ja:'Japanese'}[to], closest: () => ({}) };
    h.ctx.rememberLanguageChoice({ target: { closest: () => item } });
    assert.equal(h.ctx.restoreLocale(), false);
    assert.equal(h.value(), to);
    assert.equal(h.ctx.navigationLocale(`/${from}/input`, `/${to}/input`, h.value()), to);
  }
});

test('fresh entry and lookalike origins cannot overwrite the remembered language', () => {
  for (const ref of ['', 'https://maplescouter.com/en/result', 'https://maplescouter.com.evil.example/en/result']) {
    const h = localeHarness('/ko/result', 'en', ref);
    assert.equal(h.ctx.restoreLocale(), true);
    assert.equal(h.value(), 'en');
  }
});

test('first visit records the visible locale and ordinary navigation keeps it', () => {
  const h = localeHarness('/en/input', null);
  assert.equal(h.ctx.restoreLocale(), false);
  assert.equal(h.value(), 'en');
  assert.equal(h.ctx.navigationLocale('/en/input', '/en/base', 'en'), 'en');
});

const september24 = read('data/overrides/2026-09-24.json');
test('September 24 translations preserve placeholders and do not rewrite their own English', () => {
  for (const [ko, en] of Object.entries(september24)) {
    assert.equal(patch[ko], en, ko);
    assert.equal(ctx.translateString(ko), en, ko);
    assert.doesNotMatch(en, /[가-힣—]/);
    assert.deepEqual(en.match(/\{\{?\w+\}?\}/g), ko.match(/\{\{?\w+\}?\}/g), ko);
    assert.ok(ctx.translateString(en) === null || ctx.translateString(en) === en, en);
  }
});

test('Inner Ability generated rolls retain the stat, value and unit', () => {
  for (const [ko, en] of [
    ['공격 속도 1단계 증가', 'Attack Speed +1'],
    ['버프 스킬의 지속 시간 38% 증가', 'Buff Duration +38%'],
    ['10레벨마다 공격력 1 증가', 'ATT +1 per 10 levels'],
    ['16레벨마다 마력 1 증가', 'Magic ATT +1 per 16 levels'],
    ['AP를 직접 투자한 DEX의 5% 만큼 STR 증가', 'STR increase: 5% of DEX from assigned AP'],
    ['STR 20, DEX 10 증가', 'STR +20, DEX +10'],
    ['패시브 스킬 레벨 1 증가', 'Passive Skill Level +1'],
    ['패시브 스킬의 스킬레벨 1 증가', 'Passive Skill Level +1'],
    ['모든 능력치 40 증가', 'All Stats +40'],
    ['다수 공격 스킬의 공격 대상 1 증가', 'Targets Hit for Multi-target Skills +1'],
    ['메소 획득량 20% 증가', 'Mesos Obtained +20%'],
    ['아이템 드롭률 15% 증가', 'Item Drop Rate +15%'],
    ['스킬 사용 시 20% 확률로 재사용 대기시간이 미적용', 'Chance to Skip Cooldown: 20%'],
    ['방어력의 25% 만큼 데미지 고정값 증가', 'Flat Damage increase: 25% of Defense'],
  ]) assert.equal(ctx.translateString(ko), en, ko);
});

test('Inner Ability costs convert complete quantities in either site layout', () => {
  for (const [ko, en] of [
    ['2만 명성치 · 200만 메소', '20,000 Honor EXP · 2,000,000 mesos'],
    ['1회 비용 명성치 2만 · 메소 200만', 'Cost per reroll: 20,000 Honor EXP · 2,000,000 mesos'],
    ['명성치 1억 2000만', '120,000,000 Honor EXP'],
    ['0 명성치', '0 Honor EXP'],
    ['메소 1.5억', '150,000,000 mesos'],
    ['1회 비용 심연의 서큘레이터 1개', 'Cost per reroll: Abyss Circulator ×1'],
  ]) assert.equal(ctx.translateString(ko), en, ko);
  for (const value of ['1..5억 메소','23천억 명성치','HTomer','메소친구','some 200만 메소 text']) {
    assert.equal(ctx.abilityText(value, { dict }), null, value);
  }
});

test('Circulator constraints translate whole messages without losing rank or line restrictions', () => {
  assert.equal(ctx.translateString('카오스 서큘레이터는 어빌리티 등급이 유니크 이상이어야 씁니다'), 'Chaos Circulator requires Unique Inner Ability or higher.');
  assert.equal(ctx.translateString('심연의 서큘레이터는 어빌리티 등급이 레전드리 이상이어야 씁니다'), 'Abyss Circulator requires Legendary Inner Ability or higher.');
  assert.equal(ctx.translateString('블랙 서큘레이터는 2·3번째 옵션이 레전드리면 쓸 수 없습니다'), 'Black Circulator cannot be used if line 2 or 3 is Legendary.');
  assert.equal(ctx.translateString('레전드리 서큘레이터는 이미 레전드리인 어빌리티에는 쓸 수 없습니다'), 'Legendary Circulator cannot be used on Legendary Inner Ability.');
});

test('assembled ability explanations preserve live probabilities and locked option names', () => {
  const prefix = '레전드리 전용. 명성치와 메소를 함께 쓰고 등급 상승은 없지만, 2·3번째 옵션도 레전드리가 나올 수 있습니다 (';
  for (const odds of ['2','2.5']) assert.equal(ctx.translateString(prefix + odds + '%).'), september24[prefix] + odds + '%).');
  const honor = '명성치로 등급과 옵션을 함께 재설정합니다. 옵션을 고정하지 않았을 때만 등급이 오릅니다';
  const out = ctx.translateString(honor + ' (유니크 → 레전드리 1%).');
  assert.doesNotMatch(out, /[가-힣]/);
  assert.match(out, /Unique → Legendary 1%/);
  const locked = ctx.translateString('고정해 둔 옵션(보스 몬스터 공격 시 데미지 % 증가)은 다른 줄에 다시 나오지 않아 목록에서 빠집니다.');
  assert.match(locked, /Locked lines \(Boss Damage %\)/);
  assert.doesNotMatch(locked, /[가-힣]/);
});

test('new ranking timestamps stay timestamps rather than combat-duration labels', () => {
  assert.equal(ctx.translateString('9/20(일) 16시 20분 05초'), 'Sep 20 (Sun) 16:20:05');
  assert.equal(ctx.translateString('(본캐 비율 15.25%)'), '(Main character share: 15.25%)');
  assert.equal(ctx.translateString('레전드리 공격 속도 단계 증가 : 1 ~ 1'), 'Legendary Attack Speed: 1 to 1');
});

const october1 = read('data/overrides/2026-10-01.json');
test('October translations preserve placeholders and stable plain English', () => {
  for (const [ko, en] of Object.entries(october1)) {
    assert.equal(patch[ko], en, ko);
    assert.equal(ctx.translateString(ko), en, ko);
    assert.doesNotMatch(en, /[가-힣—]/);
    assert.deepEqual(en.match(/\{\{?\w+\}?\}/g), ko.match(/\{\{?\w+\}?\}/g), ko);
    assert.ok(ctx.translateString(en) === null || ctx.translateString(en) === en, en);
  }
});
test('Soul simulator messages keep live stages, probabilities and equipment names', () => {
  for (const [ko, en] of [
    ['소울 증폭 (4단계 도전)', 'Amplify Soul (Stage 4)'],
    ['소울 증폭 3단계 · 레전드리', 'Soul Amplification stage 3 · Legendary'],
    ['천장까지 24회', '24 attempts until guaranteed'],
    ['4단계 소울 에테르', 'Stage 4 Soul Ether'],
    ['등급 상승 보장 진행도 · 상승 확률 0.015%', 'Rank-up progress. Chance: 0.015%'],
    ['Example Weapon — 증폭 2단계 · 유니크 잠재를 불러왔습니다', 'Example Weapon: Amplification stage 2, Unique Potential loaded.'],
    ['Example Weapon — 소울 증폭 전 상태로 시작합니다', 'Example Weapon: starting without Soul Amplification.'],
    ['Example Weapon — 소울 잠재 옵션을 확률표에서 찾지 못해 에픽 등급으로 새로 굴렸습니다', 'Example Weapon: Soul Potential did not match the probability table. Rerolled at Epic rank.'],
    ['지금 유니크 줄이라 레전드리 목표를 채울 수 없습니다', 'This line is Unique, so it cannot reach a Legendary target.'],
    ['이 줄은 최대 38까지만 나옵니다', 'This line can roll 38 at most.'],
  ]) assert.equal(ctx.translateString(ko), en, ko);
});
test('Soul measure labels retain React text nodes and update again after a rerender', () => {
  const h = vm.createContext({ location: { pathname: '/en/simulator/soul' } });
  vm.runInContext(source.slice(source.indexOf('  var soulMeasures'), source.indexOf('  // Second-chance matching')), h);
  const value = { nodeType: 3, nodeValue: '1' }, suffix = { nodeType: 3, nodeValue: '단계' };
  const parent = { closest: () => true, childNodes: [value, suffix] };
  value.parentElement = suffix.parentElement = parent;
  assert.equal(h.translateSoulMeasure(value), true);
  assert.equal(value.nodeValue + suffix.nodeValue, 'Stage 1');
  value.nodeValue = '4'; // React changes only its dynamic value, not the static suffix.
  assert.equal(h.translateSoulMeasure(value), true);
  assert.equal(value.nodeValue + suffix.nodeValue, 'Stage 4');
  assert.equal(parent.childNodes[0], value);
  assert.equal(parent.childNodes[1], suffix);
  for (const [input, output] of [['25회','25 attempts'],['1회','1 attempt'],['9.2개','9.2 items']]) {
    const n = { nodeType:3, nodeValue:input, parentElement:parent };
    assert.equal(h.translateSoulMeasure(n), true);
    assert.equal(n.nodeValue, output);
  }
  h.location.pathname = '/ko/simulator/soul';
  value.nodeValue = '2';
  assert.equal(h.translateSoulMeasure(value), false);
  assert.equal(value.nodeValue, '2');
});

test('October 8 translations preserve CDR thresholds, skill levels and amplification stages', () => {
  for (const [ko, en] of Object.entries(read('data/overrides/2026-10-08.json'))) {
    assert.equal(patch[ko], en);
    assert.equal(ctx.translateString(ko), en);
    assert.doesNotMatch(en.replace('N기', ''), /[가-힣—]/); // Native post-i18next replacement token.
    assert.ok(ctx.translateString(en) === null || ctx.translateString(en) === en);
  }
  for (const n of [1, 2, 3, 4]) {
    assert.equal(ctx.translateString(`무기 소울 잠재 증폭 ${n}단계`), `Weapon Soul Potential amplification: Stage ${n}`);
  }
});

test('ranking season descriptions survive the native post-translation placeholder replacement', () => {
  const key = '메이플 공식 연무장 컨텐츠 N기 데이터를 기반으로 합니다.';
  for (const n of [2, 4, 5, 10]) {
    const rendered = patch[key].replace(' N기', ` ${n}기`);
    assert.equal(ctx.rankingSeason(`${n}기`, '/en/battle-ranking'), `Season ${n}`);
    assert.equal(ctx.translateString(rendered), `Based on Season ${n} data from MapleStory's official Training Grounds.`);
  }
  assert.doesNotMatch(patch[key].replace(' N기', ''), /[가-힣]|Season N/);
  assert.equal(ctx.rankingSeason('2기', '/en/coordination'), null);
  assert.equal(ctx.rankingSeason('2기', '/ko/battle-ranking'), null);
});

test('ranking tabs translate split season nodes without replacing them', () => {
  const h = vm.createContext({ location: { pathname: '/en/battle-ranking' } });
  vm.runInContext(source.slice(source.indexOf('  var rankingMeasures'), source.indexOf('  var soulMeasures')), h);
  const value = { nodeType: 3, nodeValue: '5' }, suffix = { nodeType: 3, nodeValue: '기' };
  const parent = { getAttribute: () => 'tab', childNodes: [value, suffix] };
  value.parentElement = suffix.parentElement = parent;
  h.translateRankingSeason(value);
  assert.equal(value.nodeValue + suffix.nodeValue, 'Season 5');
  value.nodeValue = '4';
  h.translateRankingSeason(value);
  assert.equal(value.nodeValue + suffix.nodeValue, 'Season 4');
  assert.equal(parent.childNodes[0], value);
  assert.equal(parent.childNodes[1], suffix);
  h.location.pathname = '/ko/battle-ranking'; value.nodeValue = '2';
  assert.equal(h.translateRankingSeason(value), false);
  assert.equal(value.nodeValue, '2');
});

test('Soul reroll and stage phrases retain all React-owned nodes during numeric updates', () => {
  const h = vm.createContext({ location: { pathname: '/en/simulator/soul' }, inOwnUi: () => false });
  vm.runInContext(source.slice(source.indexOf('  var soulMeasures'), source.indexOf('  var ATTRS')), h);
  for (const [prefix, suffix, expected] of [['소울 증폭 ', '단계', 'Soul Amplification stage '], ['재설정 ', '회', 'Reroll ×']]) {
    const parts = [prefix, '1', suffix].map(nodeValue => ({nodeType: 3, nodeValue}));
    const parent = { closest: () => true, childNodes: parts };
    parts.forEach(n => { n.parentElement = parent; });
    h.translateSoulMeasure(parts[0]);
    parts[1].nodeValue = '4';
    h.translateSoulMeasure(parts[1]);
    assert.equal(parts.map(n => n.nodeValue).join(''), expected + '4');
    assert.deepEqual(parent.childNodes, parts);
  }
  const card = { get children() { throw new Error('Must not replace React children on Soul success'); } };
  assert.doesNotThrow(() => h.tryElementTranslate(card, {}));
});
