const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const src = fs.readFileSync('src/maplescouter-en-fix.user.js', 'utf8');
const ctx = vm.createContext({ URLSearchParams });
vm.runInContext(src.slice(src.indexOf('  var GMS_LINKS ='), src.indexOf('  function readNativeLinkRows(')), ctx);
const eff = { dmgeff1: .001, cridmgeff1: .003, mainStatPereff1: .002 };
const input = (stat = {}, region = {}) => ({ isGMS: true, stat: { myClass: '은월', critical: '100', criticalDmg: '60', ...stat }, ...region });
const rows = (us = input(), upgrade = false, active = true, info = null, e = eff, cls = null) => ctx.gmsLinkEstimates(us, info, e, upgrade, active, cls);
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
test('no GMS estimates for KMS, JMS, TMS, MSEA or missing inputs', () => {
  for (const region of [{ isGMS: false }, { isJMS: true }, { isTMS: true }, { isMSEA: true }]) assert.equal(rows(input({}, region)).length, 0);
  assert.equal(rows(null).length, 0);
});
test('Hayato requires both critical thresholds; boundary values count', () => {
  assert.equal(value(rows(input({ critical: '99.9' })), 'hayato'), 0);
  assert.equal(value(rows(input({ criticalDmg: '49.9' })), 'hayato'), 0);
  assert.equal(value(rows(input({ critical: '100', criticalDmg: '50' })), 'hayato'), 1.5);
});
test('inactive effects remove Kanna and Mo Xuan stacks, preserving base boss damage', () => {
  assert.equal(value(rows(input(), false, false), 'kanna'), 0);
  assert.equal(value(rows(input(), false, false), 'mukhyun'), .4);
  assert.equal(value(rows(input(), true, false), 'mukhyun'), .2);
});
test('own link is not recommended as an extra transferred link', () => {
  for (const [myClass, id] of [['하야토','hayato'],['칸나','kanna'],['린','lynn'],['묵현','mukhyun']]) assert.equal(value(rows(input({myClass})), id), undefined);
});
test('Lynn HP affects Demon Avenger only; Vicious Shot uses class coefficient', () => {
  assert.equal(value(rows(input({myClass:'데몬어벤져'})), 'lynn'), 1.5);
  assert.equal(value(rows(input({myClass:'메르세데스'}), false, true, null, eff, {criInP:.4}), 'lynn'), 1.54);
  assert.equal(value(rows(input({myClass:'메르세데스'})), 'lynn'), 1.194);
});
test('equipped links match Korean and English aliases; no duplicate Lv3 upgrade', () => {
  const info = name => ({settings:{now_link:[{skill_name:name,skill_level:2}]}});
  for (const name of ['자선전수','Elementalism']) assert.equal(value(rows(input(),false,true,info(name)),'kanna'),1.523);
  assert.equal(value(rows(input(),true,true,{settings:{now_link:[{skill_name:'Spirit Guide Blessing',skill_level:3}]}}),'lynn'),undefined);
});
test('missing or invalid efficiency values cannot produce misleading finite estimates', () => {
  for (const x of [undefined, NaN, Infinity, -1]) assert.equal(value(rows(input(),false,true,null,{...eff,dmgeff1:x}),'kanna'),undefined);
  assert.equal(rows(input(),false,true,null,null).length,0);
});
test('calculating suggestions does not mutate character data or API response', () => {
  const us=input(), info={settings:{now_link:[{skill_name:'Qi Cultivation',skill_level:2}]}}, before=JSON.stringify([us,info,eff]);
  rows(us,false,true,info); rows(us,true,false,info);
  assert.equal(JSON.stringify([us,info,eff]),before);
});
test('manual and API results read their separate sources', () => {
  const manual={userStat:input(),simulatorData:{specEfficiency:eff}}, api={...manual,userApiData:{settings:{now_link:[]}}};
  ctx.siteRefs={manualStore:{getState:()=>({result:manual})},characterStore:{getState:()=>({searchResult:api})}};
  ctx.location={search:'?manual=true'}; assert.equal(ctx.gmsLinkContext().info,null);
  ctx.location.search='?name=Example'; assert.equal(ctx.gmsLinkContext().info,api.userApiData);
  ctx.siteRefs.characterStore=null; assert.equal(ctx.gmsLinkContext(),null);
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
