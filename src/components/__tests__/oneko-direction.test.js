/**
 * Unit tests for the Oneko direction detection logic.
 * Tests the angleToDirection function and verifies all 8 compass directions
 * plus boundary/edge cases.
 *
 * Run with: node src/components/__tests__/oneko-direction.test.js
 */

// Replicate the exact angleToDirection function from Oneko.jsx
function angleToDirection(deg) {
  if (deg < 0) deg += 360;
  if (deg >= 337.5 || deg < 22.5) return 'E';
  if (deg >= 22.5 && deg < 67.5) return 'SE';
  if (deg >= 67.5 && deg < 112.5) return 'S';
  if (deg >= 112.5 && deg < 157.5) return 'SW';
  if (deg >= 157.5 && deg < 202.5) return 'W';
  if (deg >= 202.5 && deg < 247.5) return 'NW';
  if (deg >= 247.5 && deg < 292.5) return 'N';
  return 'NE'; // 292.5–337.5
}

// Simulate the full direction pipeline: given cat pos and mouse pos, return direction
function getDirection(catX, catY, mouseX, mouseY) {
  const angle = (Math.atan2(mouseY - catY, mouseX - catX) * 180) / Math.PI;
  return angleToDirection(angle);
}

let passed = 0;
let failed = 0;

function assert(testName, actual, expected) {
  if (actual === expected) {
    passed++;
    console.log(`  ✅ ${testName}`);
  } else {
    failed++;
    console.error(`  ❌ ${testName}: expected "${expected}", got "${actual}"`);
  }
}

// ============================
// Test 1: angleToDirection sectors
// ============================
console.log('\n🧪 Test 1: angleToDirection – sector centers');
assert('0° → E',    angleToDirection(0),   'E');
assert('45° → SE',  angleToDirection(45),  'SE');
assert('90° → S',   angleToDirection(90),  'S');
assert('135° → SW', angleToDirection(135), 'SW');
assert('180° → W',  angleToDirection(180), 'W');
assert('225° → NW', angleToDirection(225), 'NW');
assert('270° → N',  angleToDirection(270), 'N');
assert('315° → NE', angleToDirection(315), 'NE');

// ============================
// Test 2: Negative angles (atan2 returns -180 to 180)
// ============================
console.log('\n🧪 Test 2: angleToDirection – negative angles');
assert('-45° → NE',  angleToDirection(-45),  'NE');
assert('-90° → N',   angleToDirection(-90),  'N');
assert('-135° → NW', angleToDirection(-135), 'NW');
assert('-180° → W',  angleToDirection(-180), 'W');
assert('-10° → E',   angleToDirection(-10),  'E');

// ============================
// Test 3: Boundary values (edges of 45° sectors)
// ============================
console.log('\n🧪 Test 3: angleToDirection – sector boundaries');
assert('22.4° → E (just before SE)',  angleToDirection(22.4),  'E');
assert('22.5° → SE (start of SE)',    angleToDirection(22.5),  'SE');
assert('67.4° → SE (just before S)',  angleToDirection(67.4),  'SE');
assert('67.5° → S (start of S)',      angleToDirection(67.5),  'S');
assert('337.4° → NE (just before E)', angleToDirection(337.4), 'NE');
assert('337.5° → E (start of E)',     angleToDirection(337.5), 'E');
assert('360° → E (wrap around)',      angleToDirection(360),   'E');

// ============================
// Test 4: Full pipeline – getDirection with actual coordinates
// ============================
console.log('\n🧪 Test 4: getDirection – coordinate-based (cat at 100,100)');
const cx = 100, cy = 100;
assert('Mouse right → E',         getDirection(cx, cy, 200, 100), 'E');
assert('Mouse below-right → SE',  getDirection(cx, cy, 200, 200), 'SE');
assert('Mouse below → S',         getDirection(cx, cy, 100, 200), 'S');
assert('Mouse below-left → SW',   getDirection(cx, cy, 0,   200), 'SW');
assert('Mouse left → W',          getDirection(cx, cy, 0,   100), 'W');
assert('Mouse above-left → NW',   getDirection(cx, cy, 0,   0),   'NW');
assert('Mouse above → N',         getDirection(cx, cy, 100, 0),   'N');
assert('Mouse above-right → NE',  getDirection(cx, cy, 200, 0),   'NE');

// ============================
// Test 5: Shallow diagonals (the bug case – NW/NE at shallow angles)
// ============================
console.log('\n🧪 Test 5: Shallow diagonals – the former glitch case');
// Mouse slightly up and far to the right → angle ~12° → still E sector (correct)
assert('Shallow up-right (190,80) → E',   getDirection(100, 100, 190, 80),  'E');
assert('Shallow up-left (10,80) → W',     getDirection(100, 100, 10,  80),  'W');
// Steeper diagonals that cross into NE/NW territory (~30°+)
assert('NE diagonal (170,50) → NE',       getDirection(100, 100, 170, 50),  'NE');
assert('NW diagonal (30,50) → NW',        getDirection(100, 100, 30,  50),  'NW');
// Mouse far up and slightly right → should be stable N
assert('Steep NE (120,0) → N',            getDirection(100, 100, 120, 0),   'N');
assert('Steep NW (80,0) → N',             getDirection(100, 100, 80,  0),   'N');
// Mouse at exact 45° diagonal
assert('Exact NE (200,0) → NE',           getDirection(100, 100, 200, 0),   'NE');
assert('Exact NW (0,0) → NW',             getDirection(100, 100, 0,   0),   'NW');

// ============================
// Test 6: Very close positions (near idle threshold)
// ============================
console.log('\n🧪 Test 6: Close positions – direction still computable');
assert('1px right → E',  getDirection(100, 100, 101, 100), 'E');
assert('1px up → N',     getDirection(100, 100, 100, 99),  'N');
assert('1px NE → NE',    getDirection(100, 100, 101, 99),  'NE');

// ============================
// Summary
// ============================
console.log(`\n${'='.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
console.log('='.repeat(40));

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 All direction tests passed!\n');
  process.exit(0);
}
