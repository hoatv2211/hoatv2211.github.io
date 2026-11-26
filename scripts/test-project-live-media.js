'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'portfolio.json'), 'utf8'));
for (const [id, repo] of [['brproxies', 'BrProxies'], ['gamestudio-codexkit', 'GameStudio-CodexKIT']]) {
  const project = data.projects.find(item => item.id === id);
  assert(project, `${id}: canonical project exists`);
  assert(project.logo?.src && project.logo?.alt && project.logo?.sourceUrl, `${id}: official local logo with provenance required`);
  assert(fs.existsSync(path.join(root, project.logo.src)), `${id}: logo exists`);
  const media = project.detail.media;
  assert(media.length >= 3, `${id}: at least three informative assets`);
  assert.equal(new Set(media.map(item => item.key)).size, media.length, `${id}: unique media keys`);
  for (const item of media) {
    assert(fs.existsSync(path.join(root, item.src)), `${id}: ${item.src} exists`);
    assert(item.width > 0 && item.height > 0, `${id}: dimensions required`);
    assert(item.sourceUrl?.startsWith(`https://github.com/hoatv2211/${repo}/`) || item.sourceUrl === `https://hoatv2211.github.io/${repo}/`, `${id}: official source provenance`);
  }
  assert(media.some(item => item.sourceUrl === `https://hoatv2211.github.io/${repo}/` && /website preview/i.test(item.alt)), `${id}: actual landing capture explicitly labeled website preview`);
  const refs = [project.detail.presentation.heroMediaKey, ...project.detail.presentation.storyBeats.flatMap(beat => beat.mediaKeys)];
  assert.equal(new Set(refs).size, refs.length, `${id}: no repeated presentation media`);
  for (const key of refs) assert(media.some(item => item.key === key), `${id}: valid media reference ${key}`);
}
console.log('Official project media: local logos, provenance, website previews and unique story media verified.');
