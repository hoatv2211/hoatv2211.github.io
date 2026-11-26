"use strict";
const assert = require('node:assert/strict');
const fs = require('node:fs');
for (const file of ['index.html','backup/recruiter-clean/index.html','backup/dev-console/index.html','backup/game-studio/index.html']) {
  const html = fs.readFileSync(file,'utf8');
  assert.match(html, /href="https:\/\/hoatv2211\.github\.io\/mad-game-hub-shared\/"[^>]*>GameHub<\/a>/, `${file}: GameHub preserves destination`);
  assert.doesNotMatch(html, />PlayableHUB</);
  assert.match(html, /GitShare/i, 'Keep GitShare unchanged');
}
console.log('GameHub label and unchanged destination/GitShare passed for root and three backup routes.');
