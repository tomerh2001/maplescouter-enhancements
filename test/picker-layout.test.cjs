const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('src/maplescouter-en-fix.user.js', 'utf8');
const start = source.indexOf('  function placePickerDropdown()');
const end = source.indexOf('  function renderDropdown()', start);
assert.ok(start >= 0 && end > start);

function setup(viewport, anchor, width) {
  const dd = { hidden: false, style: {},
    parentElement: { getBoundingClientRect: () => anchor },
    getBoundingClientRect: () => ({ width: Math.min(width, parseFloat(dd.style.maxWidth) || width) }) };
  const ctx = vm.createContext({ picker: { open: true, dd },
    document: { documentElement: { clientWidth: viewport } }, window: {} });
  vm.runInContext(source.slice(start, end), ctx);
  return { ctx, dd, place: () => {
    ctx.placePickerDropdown();
    const left = anchor.left + parseFloat(dd.style.left);
    return { left, right: left + dd.getBoundingClientRect().width };
  } };
}

test('phone dropdown keeps every action inside the viewport', () => {
  for (const viewport of [320, 360, 390, 414]) {
    const h = setup(viewport, { left: 35, right: 251 }, Math.min(340, viewport - 16));
    const rect = h.place();
    assert.ok(rect.left >= 8);
    assert.ok(rect.right <= viewport - 8);
    assert.deepEqual(h.place(), rect, 'repeated rendering must not drift');
  }
});

test('desktop dropdown keeps its existing alignment to the input right edge', () => {
  const h = setup(1280, { left: 720, right: 936 }, 340);
  assert.deepEqual(h.place(), { left: 596, right: 936 });
});

test('right-edge overflow is clamped as well', () => {
  const h = setup(390, { left: 300, right: 516 }, 340);
  const rect = h.place();
  assert.ok(rect.left >= 8);
  assert.equal(rect.right, 382);
});

test('a non-overlay scrollbar does not reduce the right screen margin', () => {
  const h = setup(305, { left: 35, right: 251 }, 340);
  h.ctx.window.innerWidth = 320;
  assert.deepEqual(h.place(), { left: 8, right: 297 });
});

test('closed and hidden dropdowns are not measured or repositioned', () => {
  const h = setup(390, { left: 35, right: 251 }, 340);
  h.dd.getBoundingClientRect = () => { throw new Error('hidden dropdown was measured'); };
  h.ctx.picker.open = false;
  h.ctx.placePickerDropdown();
  h.ctx.picker.open = true;
  h.dd.hidden = true;
  h.ctx.placePickerDropdown();
  assert.deepEqual(h.dd.style, {});
});
