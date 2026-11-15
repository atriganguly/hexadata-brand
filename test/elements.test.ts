import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_TAGLINES } from '../src/core/index.ts';
import { defineHexaElements, HexaTaglineElement } from '../src/elements/index.ts';

test('defineHexaElements is a safe no-op without a DOM and the classes are exported', () => {
  assert.doesNotThrow(() => defineHexaElements());
  assert.equal(typeof HexaTaglineElement, 'function');
  assert.equal(typeof DEFAULT_TAGLINES.primary, 'string');
});
