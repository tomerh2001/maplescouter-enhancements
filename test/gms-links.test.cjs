const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const src = fs.readFileSync('src/maplescouter-en-fix.user.js', 'utf8');
const maxCatalog = JSON.parse(fs.readFileSync('data/link-max-levels.json', 'utf8'));
const ctx = vm.createContext({ URLSearchParams, data: () => ({linkMaxLevels:maxCatalog}), translateString: x => x });
vm.runInContext(src.slice(src.indexOf('  var GMS_LINKS ='), src.indexOf('  function readNativeLinkRows(')), ctx);
const eff = { dmgeff1: .001, cridmgeff1: .003, mainStatPereff1: .002 };
const input = (stat = {}, region = {}) => ({ isGMS: true, stat: { myClass: '은월', critical: '100', criticalDmg: '60', ...stat }, ...region });
const rows = (us = input(), upgrade = false, info = null, e = eff, cls = null) => ctx.gmsLinkEstimates(us, info, e, upgrade, cls);
const value = (arr, id) => arr.find(x => x.id === id)?.value;
test('GMS Lv2 candidates have current effects, not obsolete flat ATT', () => {
  assert.equal(value(rows(), 'hayato'), 1.5);
  assert.equal(value(rows(), 'kanna'), 1.5);
  assert.equal(value(rows(), 'lynn'), .7);
  assert.equal(value(rows(), 'mukhyun'), 1.6);
});
test('Lv2 to Lv3 uses increments, including Lynn 7 to 11 boss damage', () => {
  assert.equal(value(rows(input(), true), 'hayato'), .6);
  assert.equal(value(rows(input(), true), 'kanna'), .5);
  assert.equal(value(rows(input(), true), 'lynn'), .4);
  assert.equal(value(rows(input(), true), 'mukhyun'), .8);
});
test('Guiding Stars combines both Shine links at Lv4 or Lv6 and ranks critical damage', () => {
  const base = rows().find(r => r.id === 'shine');
  const upgrade = rows(input(), true).find(r => r.id === 'shine');
  assert.equal(base.value, 1.2);
  assert.equal(base.label, 'GMS Lv. 4');
  assert.match(base.note, /\+13% Buff Duration/);
  assert.equal(upgrade.value, .6);
  assert.equal(upgrade.label, 'GMS Lv. 4 → 6');
  assert.match(upgrade.note, /\+6% Buff Duration/);
  assert.match(base.note, /Score excludes buff duration/);
  assert.match(base.icon, /^data:image\/png;base64,/);
});
test('Guiding Stars removes the actual equipped level and accepts all six levels', () => {
  for (let level = 0; level <= 6; level++) {
    const info = {settings:{now_link:[{skill_name:'Guiding Stars',skill_level:level}]}};
    assert.equal(value(rows(input(), false, info), 'shine'), Math.round(.012 / (1 - level * .003) * 100000) / 1000);
    assert.equal(value(rows(input(), true, info), 'shine'), level === 6 ? undefined : .6);
  }
  for (const level of [-1, 7, 1.5, 'bad']) {
    assert.equal(value(rows(input(), false, {settings:{now_link:[{skill_name:'Guiding Stars',skill_level:level}]}}), 'shine'), undefined);
  }
});
test('no GMS estimates for KMS, JMS, TMS, MSEA or missing inputs', () => {
  for (const region of [{ isGMS: false }, { isJMS: true }, { isTMS: true }, { isMSEA: true }]) assert.equal(rows(input({}, region)).length, 0);
  assert.equal(rows(null).length, 0);
});
test('Hayato requires both critical thresholds; boundary values count', () => {
  assert.equal(value(rows(input({ critical: '99.9' })), 'hayato'), 0);
  assert.equal(value(rows(input({ criticalDmg: '49.9' })), 'hayato'), 0);
  assert.equal(value(rows(input({ critical: '100', criticalDmg: '50' })), 'hayato'), 1.5);
});
test('GMS suggestions always use active Kanna and full Mo Xuan stacks', () => {
  assert.equal(value(rows(), 'kanna'), 1.5);
  assert.equal(value(rows(), 'mukhyun'), 1.6);
  assert.equal(value(rows(input(), true), 'mukhyun'), .8);
});
test('own link is not recommended as an extra transferred link', () => {
  for (const [myClass, id] of [['하야토','hayato'],['칸나','kanna'],['린','lynn'],['묵현','mukhyun']]) assert.equal(value(rows(input({myClass})), id), undefined);
});
test('Lynn HP affects Demon Avenger only; Vicious Shot uses class coefficient', () => {
  assert.equal(value(rows(input({myClass:'데몬어벤져'})), 'lynn'), 1.5);
  assert.equal(value(rows(input({myClass:'메르세데스'}), false, null, eff, {criInP:.4}), 'lynn'), 1.54);
  assert.equal(value(rows(input({myClass:'메르세데스'})), 'lynn'), 1.194);
});
test('equipped links match Korean and English aliases; no duplicate Lv3 upgrade', () => {
  const info = name => ({settings:{now_link:[{skill_name:name,skill_level:2}]}});
  for (const name of ['자선전수','Elementalism']) assert.equal(value(rows(input(),false,info(name)),'kanna'),1.523);
  assert.equal(value(rows(input(),true,{settings:{now_link:[{skill_name:'Spirit Guide Blessing',skill_level:3}]}}),'lynn'),undefined);
});
test('missing or invalid efficiency values cannot produce misleading finite estimates', () => {
  for (const x of [undefined, NaN, Infinity, -1]) assert.equal(value(rows(input(),false,null,{...eff,dmgeff1:x}),'kanna'),undefined);
  assert.equal(rows(input(),false,null,null).length,0);
});
test('calculating suggestions does not mutate character data or API response', () => {
  const us=input(), info={settings:{now_link:[{skill_name:'Qi Cultivation',skill_level:2}]}}, before=JSON.stringify([us,info,eff]);
  rows(us,false,info); rows(us,true,info);
  assert.equal(JSON.stringify([us,info,eff]),before);
});
test('manual and API results read their separate sources', () => {
  const manual={userStat:input(),simulatorData:{specEfficiency:eff}}, api={...manual,userApiData:{settings:{now_link:[]}}};
  ctx.siteRefs={manualStore:{getState:()=>({result:manual})},characterStore:{getState:()=>({searchResult:api})}};
  ctx.location={search:'?manual=true'}; assert.equal(ctx.gmsLinkContext().info,null);
  ctx.location.search='?name=Example'; assert.equal(ctx.gmsLinkContext().info,api.userApiData);
  ctx.siteRefs.characterStore=null; assert.equal(ctx.gmsLinkContext(),null);
});

const maxEff = {...eff, allStatEff:.002, atkeff1:.0002, mainStateff1:.0001, subStateff1:.00001, ssubStateff1:0, igreff1:.001, igreff1_380:.002};
const maxRows = (us=input(), info=null, defense=false, e=maxEff) => ctx.maxLevelLinkEstimates(us,info,e,defense,null);
const maxValue = (ko, rows=maxRows()) => rows.find(r=>r.ko===ko)?.value;
test('Max level ranks full bonuses rather than Lv2 to Lv3 increments', () => {
  assert.equal(maxValue('자선전수'),2);
  assert.equal(maxValue('기백'),2.4);
  assert.equal(maxValue('창인전수'),2.1);
  assert.equal(maxValue('수호신의 가호'),1.1);
  assert.equal(maxValue('데몬스 퓨리'),2);
  assert.equal(maxValue('하이브리드 로직'),3);
  assert.equal(maxValue('전투의 흐름'),1.6);
});
test('shared GMS links use their actual combined caps and transferable effects', () => {
  const byKo=Object.fromEntries(maxRows().map(r=>[r.ko,r]));
  assert.equal(byKo['임피리컬 널리지'].label,'Lv. 9');
  assert.equal(byKo['임피리컬 널리지'].value,2.4);
  assert.equal(byKo['시그너스 블레스'].label,'Lv. 15');
  assert.equal(byKo['시그너스 블레스'].value,.7);
  assert.equal(byKo['파이렛 블레스'].value,1.1);
  assert.equal(byKo['륀느의 축복'].label,'Lv. 6');
  assert.equal(byKo['륀느의 축복'].value,1.5);
  assert.equal(byKo['Guiding Stars'].label,'Lv. 6');
  assert.equal(byKo['Guiding Stars'].value,1.8);
  assert.match(byKo['Guiding Stars'].note,/\+19% Buff Duration/);
});
test('Guiding Stars max-level score removes equipped critical damage without scoring buff duration', () => {
  const info = {settings:{now_link:[{skill_name:'Guiding Stars',skill_level:6}]}};
  assert.equal(maxValue('Guiding Stars',maxRows(input(),info)),1.833);
  assert.equal(maxValue('Guiding Stars',maxRows(input(),null,false,{...maxEff,cridmgeff1:NaN})),undefined);
  for (const myClass of ['시아','에렐']) {
    assert.equal(value(rows(input({myClass})),'shine'),undefined);
    assert.equal(maxValue('Guiding Stars',maxRows(input({myClass}))),undefined);
  }
});
test('max levels preserve native timing weights for timed links', () => {
  assert.equal(maxValue('소울 컨트랙트'),3.333);
  assert.equal(maxValue('시프 커닝'),1.65);
  assert.equal(maxValue('프라이어 프리퍼레이션'),1.176);
  assert.equal(maxValue('노블레스'),.9); // same solo-party assumption as native
});
test('max-level IED responds to 300/380 and removes equipped IED multiplicatively', () => {
  assert.equal(maxValue('퍼미에이트'),2);
  assert.equal(maxValue('퍼미에이트',maxRows(input(),null,true)),4);
  const equipped={settings:{now_link:[{skill_name:'퍼미에이트',skill_level:2}]}};
  const expected=Math.round((20*.001/.85)/(1-15*.001/.85)*100000)/1000;
  assert.equal(maxValue('퍼미에이트',maxRows(input(),equipped)),expected);
});
test('an equipped max-level link stays in full-bonus comparisons, with no mutation', () => {
  const us=input(), info={settings:{now_link:[{skill_name:'Elementalism',skill_level:3}]}}, before=JSON.stringify([us,info,maxEff,maxCatalog]);
  assert.equal(maxValue('자선전수',maxRows(us,info)),2.041);
  assert.equal(JSON.stringify([us,info,maxEff,maxCatalog]),before);
});
test('max-level HP and critical rate retain the native class-specific scoring', () => {
  assert.equal(maxValue('파이렛 블레스',maxRows(input({myClass:'데몬어벤져'}))),17.5);
  assert.equal(maxValue('아이언 윌',maxRows(input({myClass:'데몬어벤져'}))),4);
  assert.equal(maxValue('데들리 인스팅트'),undefined);
  assert.equal(maxValue('데들리 인스팅트',maxRows(input({myClass:'메르세데스'}))),1.41);
  assert.equal(maxValue('창인전수',maxRows(input({critical:'99'}))),0);
  assert.equal(maxValue('데몬스 퓨리',maxRows(input({myClass:'데몬슬레이어'}))),undefined);
});
test('max-level scoring fails closed for unsupported regions and invalid coefficients', () => {
  assert.equal(maxRows(input({}, {isGMS:false})).length,0);
  assert.equal(maxRows(input({}, {isTMS:true})).length,0);
  assert.equal(maxValue('퍼미에이트',maxRows(input(),null,true,{...maxEff,igreff1_380:NaN})),undefined);
  const removedAll={settings:{now_link:[{skill_name:'Elementalism',skill_level:3}]}};
  assert.equal(maxValue('자선전수',maxRows(input(),removedAll,false,{...maxEff,dmgeff1:1})),undefined);
  const info={settings:{now_link:[{skill_name:'Elementalism',skill_level:4}]}};
  assert.equal(maxValue('자선전수',maxRows(input(),info)),undefined);
});

vm.runInContext(src.slice(src.indexOf('  function readNativeLinkRows('), src.indexOf('  function clearGmsLinkView(')), ctx);
function nativeRow(value, names, interactive = false) {
  return { lastElementChild: { textContent: value }, querySelector: () => interactive ? {} : null,
    querySelectorAll: () => names.map(name => ({alt: name, getAttribute: () => '/skill.png', closest: () => ({title: name + ' details'})})) };
}
test('native ties retain every candidate and original score', () => {
  const result=ctx.readNativeLinkRows({children:[nativeRow('1.234%', ['Wild Rage', 'Tide of Battle'])]});
  assert.equal(result.length,2); assert.equal(result[0].value,1.234); assert.equal(result[1].value,1.234);
});
test('unknown or interactive native structures fall back without cloning controls', () => {
  for(const row of [nativeRow('NaN%', ['A']), nativeRow('1%', []), nativeRow('1%', ['A'], true)]) assert.equal(ctx.readNativeLinkRows({children:[row]}),null);
  assert.equal(ctx.readNativeLinkRows({children:[]}),null);
});
