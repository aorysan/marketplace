const { assertSlideStructure } = require('../skills/builder/scripts/build-deck');

// OK case: 2 direct-child sections
assertSlideStructure('<section class="a"></section>\n<section class="b"></section>', 2);

// Foster-parenting case: nested section must throw naming slide 2
let threw = false;
try {
  assertSlideStructure('<section class="a"><table><section class="b"></section></table></section>', 2);
} catch (e) {
  threw = /slide 2/i.test(e.message) || /foster|nested/i.test(e.message);
}
if (!threw) { console.error('FAIL: nested section did not throw'); process.exit(1); }

// Count mismatch must throw
threw = false;
try {
  assertSlideStructure('<section class="a"></section>', 2);
} catch (e) { threw = true; }
if (!threw) { console.error('FAIL: count mismatch did not throw'); process.exit(1); }

console.log('PASS: slide structure assert catches foster-parenting and count mismatch');
process.exit(0);
