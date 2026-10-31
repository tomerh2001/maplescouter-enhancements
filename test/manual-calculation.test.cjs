const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('src/maplescouter-en-fix.user.js', 'utf8');
const section = source.slice(source.indexOf('  /* -- manual calculations:'), source.indexOf('  /* -- bindings:'));

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function env() {
  let clock = 0, sequence = 0;
  const timers = new Map();
  const draft = { stat: { myClass: '은월', level: '285' }, special: {}, hexa: {}, doping: {}, isGMS: true, isTMS: false };
  const store = { draftStat: draft, setDraftStat(value) { this.draftStat = value; } };
  const ctx = vm.createContext({
    Promise, WeakSet, Map, Set, Error, Number, Object, Array, DEBUG_REFS: true,
    siteRefs: { manualStore: { getState: () => store } }, location: { pathname: '/en/input' },
    document: { body: null }, data: () => ({ i18nPatch: {}, dict: {} }),
    hashData: value => JSON.stringify(value),
    setTimeout(fn, delay) { const id = ++sequence; timers.set(id, { at: clock + delay, fn }); return id; },
    clearTimeout(id) { timers.delete(id); }
  });
  ctx.isInputRoute = () => /^\/(ko|en|ja|ch)\/(manual\/)?input\/?$/.test(ctx.location.pathname);
  vm.runInContext(section, ctx);
  return {
    ctx, store, timers,
    async advance(ms) {
      clock += ms;
      for (;;) {
        const next = [...timers].find(([, timer]) => timer.at <= clock);
        if (!next) break;
        timers.delete(next[0]); next[1].fn(); await Promise.resolve();
      }
    }
  };
}
const preview = { general: 123456789, finalDamage: 81.25, atkTotal: 9021 };
function apiFor(ctx, fn, result) {
  const api = { fn, getCalcDmg: result || (() => Promise.resolve({ calculatedData: {} })), getCalcDmgSimulator() {} };
  ctx.noteCalculationRuntime(api);
  return api;
}

test('passive discovery keeps native arguments, receiver, successful values and unrelated calls', async () => {
  const { ctx, store } = env(), calls = [], untouched = Promise.resolve('native');
  const api = apiFor(ctx, function (...args) { calls.push({ receiver: this, args }); return args[0] === 'inputGeneral' ? Promise.resolve(preview) : untouched; });
  const method = api.fn;
  ctx.noteCalculationRuntime(api);
  assert.equal(api.fn, method);
  const args = [store.draftStat];
  assert.equal(await api.fn('inputGeneral', args), preview);
  assert.equal(calls[0].receiver, api); assert.equal(calls[0].args[1], args);
  assert.equal(ctx.manualCalc.preview.state, 'ready');
  assert.equal(api.fn('someOtherCalculation', args), untouched);
  ctx.location.pathname = '/en/result';
  assert.equal(api.fn('someOtherCalculation', args), untouched);
});

test('read-only API descriptors and incomplete shapes are left intact', () => {
  const { ctx } = env();
  const fn = () => {};
  const frozen = Object.freeze({ fn, getCalcDmg: fn, getCalcDmgSimulator: fn });
  ctx.noteCalculationRuntime(frozen); assert.equal(frozen.fn, fn);
  const incomplete = { fn, getCalcDmg: fn };
  ctx.noteCalculationRuntime(incomplete); assert.equal(incomplete.fn, fn);
});

test('failed preview is unavailable and Retry triggers the native effect without changing input values', async () => {
  const { ctx, store } = env(); let fail = true;
  const api = apiFor(ctx, () => fail ? Promise.reject({ status: 403 }) : Promise.resolve(preview));
  await assert.rejects(api.fn('inputGeneral', [store.draftStat]));
  const failure = ctx.manualCalc.preview, before = store.draftStat, saved = JSON.stringify(before);
  assert.equal(failure.state, 'error'); assert.match(failure.message, /verification/);
  assert.equal(ctx.retryManualCalculation(failure), true);
  assert.notEqual(store.draftStat, before); assert.notEqual(store.draftStat.stat, before.stat);
  assert.equal(JSON.stringify(store.draftStat), saved);
  fail = false;
  assert.equal(await api.fn('inputGeneral', [store.draftStat]), preview);
  assert.equal(ctx.manualCalc.preview.state, 'ready');
  assert.equal(ctx.retryManualCalculation(failure), false);
});

test('a stalled verification or response body times out without abandoning late rejection handlers', async () => {
  const { ctx, store, advance, timers } = env(), gate = deferred();
  const api = apiFor(ctx, () => gate.promise);
  const request = api.fn('inputGeneral', [store.draftStat]);
  const rejection = assert.rejects(request, { name: 'ManualCalculationTimeout' });
  await advance(64999); assert.equal(ctx.manualCalc.preview.state, 'pending');
  await advance(1); await rejection;
  assert.equal(ctx.manualCalc.preview.state, 'error'); assert.match(ctx.manualCalc.preview.message, /65 seconds/);
  assert.equal(timers.size, 0);
  gate.reject(new Error('late network failure')); await Promise.resolve(); await Promise.resolve();
  assert.equal(ctx.manualCalc.preview.state, 'error');
});

test('manual Result errors and timeouts settle its native spinner through the existing null branch', async () => {
  const { ctx, store, advance } = env(), gate = deferred();
  const api = apiFor(ctx, () => Promise.resolve(preview), () => gate.promise);
  const result = api.getCalcDmg(store.draftStat, { manual: true });
  await advance(65000);
  assert.equal(await result, null); assert.equal(ctx.manualCalc.result.state, 'error');
  const status = ctx.manualCalc.result;
  gate.resolve({ calculatedData: { boss300_hexaStat: 60000 } }); await Promise.resolve(); await Promise.resolve();
  assert.equal(ctx.manualCalc.result, status); assert.equal(status.state, 'error');
  const errorApi = apiFor(ctx, () => Promise.resolve(preview), () => Promise.reject({ status: 430 }));
  assert.equal(await errorApi.getCalcDmg(store.draftStat, { manual: true }), null);
  assert.match(ctx.manualCalc.result.message, /limiting requests/);
});

test('ordinary calculations and non-manual Result requests preserve native rejection and promise identity', () => {
  const { ctx, store } = env(), request = deferred();
  const api = apiFor(ctx, () => request.promise, () => request.promise);
  assert.equal(api.getCalcDmg(store.draftStat, { manual: false }), request.promise);
  assert.equal(api.getCalcDmg(store.draftStat), request.promise);
  ctx.location.pathname = '/en/result';
  assert.equal(api.getCalcDmg(store.draftStat, { manual: true }), request.promise);
  assert.equal(api.fn('inputGeneral', [store.draftStat]), request.promise);
  ctx.location.pathname = '/ja/input';
  assert.equal(api.getCalcDmg(store.draftStat, { manual: true }), request.promise);
  assert.equal(api.fn('inputGeneral', [store.draftStat]), request.promise);
  assert.equal(ctx.manualCalc.preview, null); assert.equal(ctx.manualCalc.result, null);
});

test('new preview disposes its pending predecessor and ignores its late response', async () => {
  const { ctx, store, timers } = env(), old = deferred(); let first = true;
  const api = apiFor(ctx, () => { if (first) { first = false; return old.promise; } return Promise.resolve(preview); });
  const prior = api.fn('inputGeneral', [store.draftStat]);
  const rejected = assert.rejects(prior, /superseded/);
  const current = api.fn('inputGeneral', [store.draftStat]);
  await rejected; assert.equal(await current, preview); assert.equal(timers.size, 0);
  old.resolve({ ...preview, general: 1 }); await Promise.resolve();
  assert.equal(ctx.manualCalc.preview.state, 'ready');
});

test('draft changes cancel pending Result and preview without carrying stale retry actions', async () => {
  const { ctx, store, timers } = env(), pending = deferred();
  const api = apiFor(ctx, () => pending.promise, () => pending.promise);
  const first = api.fn('inputGeneral', [store.draftStat]), rejected = assert.rejects(first, /superseded/);
  const result = api.getCalcDmg(store.draftStat, { manual: true }), rec = ctx.manualCalc.result;
  store.draftStat = { ...store.draftStat, stat: { ...store.draftStat.stat, level: '286' } };
  ctx.invalidateManualCalculations(store.draftStat);
  await rejected; assert.equal(await result, null); assert.equal(timers.size, 0);
  assert.equal(ctx.manualCalc.preview, null); assert.equal(ctx.manualCalc.result, null);
  assert.equal(ctx.retryManualCalculation(rec), false);
});

test('changing only HEXA preserves a pending preview because the native effect will not rerun', async () => {
  const { ctx, store } = env(), pending = deferred();
  const api = apiFor(ctx, () => pending.promise);
  const request = api.fn('inputGeneral', [store.draftStat]), rec = ctx.manualCalc.preview;
  store.draftStat = { ...store.draftStat, hexa: { skillCore1: '20' } };
  ctx.invalidateManualCalculations(store.draftStat);
  assert.equal(ctx.manualCalc.preview, rec);
  pending.resolve(preview); assert.equal(await request, preview);
});

test('route changes dispose requests even when returning to the same input URL', async () => {
  const { ctx, store } = env(), pending = deferred();
  const api = apiFor(ctx, () => pending.promise, () => pending.promise);
  const request = api.getCalcDmg(store.draftStat, { manual: true });
  ctx.location.pathname = '/en/hexa'; ctx.resetManualCalculations();
  ctx.location.pathname = '/en/input';
  pending.resolve({ calculatedData: {} });
  assert.equal(await request, null); assert.equal(ctx.manualCalc.result, null);
});

test('same-path router history maintenance preserves an in-flight native preview', async () => {
  const { ctx, store } = env(), pending = deferred();
  Object.assign(ctx, {
    localStorage: { getItem: () => 'en' }, LS_LOCALE: 'locale', lastNavigationPath: '/en/input',
    navigationLocale: () => 'en', pathLocale: () => 'en', saveLocale() {}, backupRegion() {}, applyRouteGate() {},
    schedulePickerMount() {}, revealManualTab() {}
  });
  vm.runInContext(source.slice(source.indexOf('  function onNavigate()'), source.indexOf('  function onReady()')), ctx);
  const api = apiFor(ctx, () => pending.promise);
  const request = api.fn('inputGeneral', [store.draftStat]), rec = ctx.manualCalc.preview;
  ctx.onNavigate();
  assert.equal(ctx.manualCalc.preview, rec); assert.equal(rec.state, 'pending');
  pending.resolve(preview); assert.equal(await request, preview);
});

test('a changed native DOM cannot strand successful or failed request promises', async () => {
  const { ctx, store } = env();
  ctx.renderManualCalculationStatus = () => { throw new Error('unsupported markup'); };
  const api = apiFor(ctx, () => Promise.resolve(preview), () => Promise.reject(new Error('network')));
  assert.equal(await api.fn('inputGeneral', [store.draftStat]), preview);
  assert.equal(await api.getCalcDmg(store.draftStat, { manual: true }), null);
});

test('legitimate zero previews and server calculation error objects remain native values', async () => {
  const { ctx, store } = env(), zero = { general: 0, finalDamage: 0, atkTotal: 0 };
  const response = { calculatedData: { error: -3, boss300_hexaStat: -3 } };
  const api = apiFor(ctx, () => Promise.resolve(zero), () => Promise.resolve(response));
  assert.equal(await api.fn('inputGeneral', [store.draftStat]), zero);
  assert.equal(await api.getCalcDmg(store.draftStat, { manual: true }), response);
  assert.equal(ctx.manualCalc.preview.state, 'ready'); assert.equal(ctx.manualCalc.result.state, 'ready');
});

test('malformed successful responses cannot become misleading ready metrics', async () => {
  const { ctx, store } = env();
  const api = apiFor(ctx, () => Promise.resolve({ general: NaN, finalDamage: 0 }), () => Promise.resolve({}));
  await assert.rejects(api.fn('inputGeneral', [store.draftStat]), /Incomplete/);
  assert.equal(await api.getCalcDmg(store.draftStat, { manual: true }), null);
  assert.equal(ctx.manualCalc.preview.state, 'error'); assert.equal(ctx.manualCalc.result.state, 'error');
});

test('Result retry locates the current native button and refuses stale route or draft callbacks', async () => {
  const { ctx, store } = env(); let clicks = 0;
  const button = { textContent: 'Result', disabled: false, closest: () => null, click: () => { clicks++; } };
  ctx.document.querySelectorAll = () => [button];
  const api = apiFor(ctx, () => Promise.resolve(preview), () => Promise.reject(new Error('network')));
  await api.getCalcDmg(store.draftStat, { manual: true });
  const rec = ctx.manualCalc.result;
  assert.equal(ctx.retryManualCalculation(rec), true); assert.equal(clicks, 1);
  button.disabled = true; assert.equal(ctx.retryManualCalculation(rec), false);
  button.disabled = false; ctx.location.pathname = '/en/hexa';
  assert.equal(ctx.retryManualCalculation(rec), false); assert.equal(clicks, 1);
  ctx.location.pathname = '/en/input'; store.draftStat = { ...store.draftStat, hexa: { skillCore1: '30' } };
  assert.equal(ctx.retryManualCalculation(rec), false); assert.equal(clicks, 1);
});
