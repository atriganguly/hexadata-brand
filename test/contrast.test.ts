import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contrastRatio, hexToChannels, isHex6, parseHex, relativeLuminance, wcagGrade } from '../src/core/contrast.ts';

test('black on white is 21:1 and identical colours are 1:1', () => {
  assert.ok(Math.abs(contrastRatio('#000000', '#FFFFFF') - 21) < 1e-9);
  assert.equal(contrastRatio('#336699', '#336699'), 1);
});

test('contrast is symmetric', () => {
  assert.equal(contrastRatio('#009BB6', '#F8FAFC'), contrastRatio('#F8FAFC', '#009BB6'));
});

test('luminance extremes', () => {
  assert.equal(relativeLuminance('#000000'), 0);
  assert.ok(Math.abs(relativeLuminance('#FFFFFF') - 1) < 1e-9);
});

test('known WCAG reference: #767676 on white is just over 4.5 (the AA grey)', () => {
  const r = contrastRatio('#767676', '#FFFFFF');
  assert.ok(r >= 4.5 && r < 4.6, String(r));
});

test('ratios are not rounded up across a threshold', () => {
  // #777777 on white is 4.478: must NOT be treated as 4.5.
  assert.ok(contrastRatio('#777777', '#FFFFFF') < 4.5);
});

test('grades', () => {
  assert.equal(wcagGrade(7), 'AAA');
  assert.equal(wcagGrade(4.5), 'AA');
  assert.equal(wcagGrade(3), 'AA-large');
  assert.equal(wcagGrade(2.99), 'fail');
});

test('hex parsing is strict', () => {
  assert.ok(isHex6('#aabbcc'));
  for (const bad of ['#abc', '#aabbccdd', 'aabbcc', 'white', 'rgb(0,0,0)', '#gggggg', '', ' #aabbcc', 12, null, undefined]) {
    assert.equal(isHex6(bad), false, String(bad));
  }
  assert.throws(() => parseHex('#abc'));
  assert.equal(hexToChannels('#009BB6'), '0 155 182');
});
