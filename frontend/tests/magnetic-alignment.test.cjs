const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const ts = require('typescript');

// Load the small geometry modules directly, without a React Native test runtime.
require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  module._compile(compiled.outputText, filename);
};

const {
  resolveMagneticPlacement,
} = require('../src/features/apiaries/layout/geometry/magnetic-alignment.ts');
const { canPlaceHive } = require('../src/features/apiaries/layout/geometry/placement.ts');

const hive = { id: 'moving', hiveType: 'standard' };
const neighbor = { id: 'neighbor', hiveType: 'standard', x: 100, y: 100 };

function resolve(rawX, rawY, pointerX, pointerY, active = null, enabled = true) {
  return resolveMagneticPlacement(
    hive,
    rawX,
    rawY,
    pointerX,
    pointerY,
    [neighbor],
    1,
    enabled,
    active,
  );
}

test('horizontal spacing holds at ten units, then switches at the neighbor midpoint', () => {
  const left = resolve(15, 100, 55, 140);
  assert.deepEqual([left.x, left.y, left.valid], [10, 100, true]);
  assert.equal(left.alignment.spacing.axis, 'x');
  assert.equal(left.alignment.spacing.gapStart, 90);

  const held = resolve(70, 100, 110, 140, left.alignment);
  assert.equal(held.x, 10);

  const right = resolve(100, 100, 140, 140, held.alignment);
  assert.deepEqual([right.x, right.y, right.valid], [190, 100, true]);
  assert.equal(right.alignment.spacing.side, 'after');

  const released = resolve(230, 100, 270, 140, right.alignment);
  assert.equal(released.x, 230);
});

test('vertical spacing switches sides and respects the same ten-unit gap', () => {
  const above = resolve(100, 15, 140, 55);
  assert.deepEqual([above.x, above.y, above.valid], [100, 10, true]);

  const below = resolve(100, 100, 140, 140, above.alignment);
  assert.deepEqual([below.x, below.y, below.valid], [100, 190, true]);
  assert.equal(below.alignment.spacing.side, 'after');
});

test('horizontal edge alignment stays active alongside horizontal spacing', () => {
  const aligned = resolve(210, 104, 250, 144);
  assert.deepEqual([aligned.x, aligned.y], [210, 100]);
  assert.equal(aligned.alignment.edge.axis, 'y');
  assert.equal(aligned.alignment.spacing, null);

  const combined = resolve(185, 106, 225, 146, aligned.alignment);
  assert.deepEqual([combined.x, combined.y, combined.valid], [190, 100, true]);
  assert.equal(combined.alignment.edge.axis, 'y');
  assert.equal(combined.alignment.spacing.axis, 'x');
  assert.equal(combined.alignment.spacing.crossCoordinate, 140);

  const held = resolve(150, 108, 190, 148, combined.alignment);
  assert.deepEqual([held.x, held.y], [190, 100]);
  assert.equal(held.alignment.edge.axis, 'y');
  assert.equal(held.alignment.spacing.axis, 'x');
});

test('vertical edge alignment stays active alongside vertical spacing', () => {
  const aligned = resolve(104, 210, 144, 250);
  assert.deepEqual([aligned.x, aligned.y], [100, 210]);
  assert.equal(aligned.alignment.edge.axis, 'x');

  const combined = resolve(106, 185, 146, 225, aligned.alignment);
  assert.deepEqual([combined.x, combined.y, combined.valid], [100, 190, true]);
  assert.equal(combined.alignment.edge.axis, 'x');
  assert.equal(combined.alignment.spacing.axis, 'y');
  assert.equal(combined.alignment.spacing.gapStart, 180);
  assert.equal(combined.alignment.spacing.crossCoordinate, 140);
});

test('unsafe positions remain invalid when the magnet is disabled', () => {
  assert.equal(resolve(15, 100, 55, 140, null, false).valid, false);
  assert.equal(canPlaceHive(hive, 10, 100, [neighbor]), true);
  assert.equal(canPlaceHive(hive, 11, 100, [neighbor]), false);
});

test('the magnet releases when the hive moves away from the neighbor', () => {
  const left = resolve(15, 100, 55, 140);
  const away = resolve(-20, 100, 20, 140, left.alignment);
  assert.equal(away.x, -20);

  const separateRow = resolve(15, 300, 55, 340);
  assert.equal(separateRow.x, 15);
  assert.equal(separateRow.alignment, null);
});
