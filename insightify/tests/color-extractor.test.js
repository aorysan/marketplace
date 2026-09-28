const { describe, test } = require('node:test');
const assert = require('assert');
const cheerio = require('cheerio');
const { extractColors, renderColorsSection } = require('../skills/planner/parsers/color-extractor');

describe('color-extractor', () => {
  test('extracts hex colors from style tag and normalizes shorthand', () => {
    const $ = cheerio.load('<html><head><style>.a { color: #fff; } .b { background-color: #A1b2C3; }</style></head></html>');
    const colors = extractColors($);
    assert.deepStrictEqual(colors, [
      { color: '#fff', hex: '#ffffff' },
      { color: '#A1b2C3', hex: '#a1b2c3' }
    ]);
  });

  test('extracts rgb and rgba, converting to hex (alpha -> 8 digit)', () => {
    const $ = cheerio.load('<div style="color: rgb(26, 115, 232);"></div>');
    const colors = extractColors($);
    assert.deepStrictEqual(colors, [
      { color: 'rgb(26, 115, 232)', hex: '#1a73e8' }
    ]);

    const $2 = cheerio.load('<div style="color: rgba(0, 0, 0, 0.5);"></div>');
    assert.deepStrictEqual(extractColors($2), [
      { color: 'rgba(0, 0, 0, 0.5)', hex: '#00000080' }
    ]);
  });

  test('extracts hsl and hsla, converting to hex', () => {
    const $ = cheerio.load('<div style="color: hsl(217, 89%, 51%);"></div>');
    const colors = extractColors($);
    assert.strictEqual(colors[0].hex, '#1368f1');

    const $2 = cheerio.load('<div style="color: hsla(120, 100%, 25%, 0.7);"></div>');
    assert.strictEqual(extractColors($2)[0].hex, '#008000b3');
  });

  test('extracts colors from inline style attributes and multiple rules', () => {
    const $ = cheerio.load('<html><body><p style="color: #ff0000; background: #0000ff">x</p></body></html>');
    const colors = extractColors($);
    assert.deepStrictEqual(colors, [
      { color: '#ff0000', hex: '#ff0000' },
      { color: '#0000ff', hex: '#0000ff' }
    ]);
  });

  test('deduplicates by hex, keeping first raw occurrence (style before inline)', () => {
    const $ = cheerio.load('<html><head><style>.a { color: rgb(26, 115, 232); }</style></head><body><p style="color: #1a73e8"></p></body></html>');
    const colors = extractColors($);
    assert.strictEqual(colors.length, 1);
    assert.strictEqual(colors[0].color, 'rgb(26, 115, 232)');
    assert.strictEqual(colors[0].hex, '#1a73e8');
  });

  test('returns empty array when no colors present', () => {
    const $ = cheerio.load('<html><body><p>no colors here</p></body></html>');
    assert.deepStrictEqual(extractColors($), []);
  });

  test('skips malformed CSS rules silently and still extracts valid ones', () => {
    const $ = cheerio.load('<html><head><style>.ok { color: #123456; } .broken { color: </style></head><body><p style="font-size: 16px;">x</p></body></html>');
    const colors = extractColors($);
    assert.deepStrictEqual(colors, [{ color: '#123456', hex: '#123456' }]);
  });

  test('skips malformed alpha literal silently and emits no NaN hex', () => {
    const $ = cheerio.load('<div style="color: rgba(0, 0, 0, ..);"></div>');
    assert.deepStrictEqual(extractColors($), []);
  });

  test('renderColorsSection returns empty string for empty array', () => {
    assert.strictEqual(renderColorsSection([]), '');
  });

  test('renderColorsSection renders a markdown table', () => {
    const table = renderColorsSection([{ color: 'rgb(26, 115, 232)', hex: '#1a73e8' }]);
    assert.ok(table.includes('## Colors'));
    assert.ok(table.includes('| Color | Hex |'));
    assert.ok(table.includes('| rgb(26, 115, 232) | #1a73e8 |'));
  });
});
