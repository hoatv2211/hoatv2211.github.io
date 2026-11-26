'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const portfolio = JSON.parse(fs.readFileSync(path.join(root, 'portfolio.json'), 'utf8'));
const config = portfolio.hiringFocus;

assert.ok(config, 'Canonical portfolio must define hiringFocus');
assert.equal(config.default, 'mobile');
assert.deepEqual(Object.keys(config.options), ['mobile', 'rpg', 'web3', 'automation', 'all']);
const projectKeys = portfolio.projects.map(project => project.detailKey);
for (const [key, focus] of Object.entries(config.options)) {
  for (const field of ['label', 'intro', 'cta']) {
    assert.equal(typeof focus[field], 'string', `${key}.${field} must be text`);
    assert.ok(focus[field].trim(), `${key}.${field} must not be empty`);
  }
  assert.ok(Array.isArray(focus.skills) && focus.skills.length, `${key} must list skills`);
  assert.ok(focus.skills.every(skill => typeof skill === 'string' && skill.trim()));
  assert.ok(Array.isArray(focus.projectKeys) && focus.projectKeys.length);
  assert.equal(new Set(focus.projectKeys).size, focus.projectKeys.length, `${key} has duplicate projects`);
  for (const detailKey of focus.projectKeys) {
    assert.ok(projectKeys.includes(detailKey), `${key} references unknown detailKey ${detailKey}`);
  }
}
assert.deepEqual(config.options.mobile.projectKeys.slice(0, 2), ['sandwich', 'shibainu']);
assert.deepEqual(config.options.rpg.projectKeys.slice(0, 4), ['flyingphoenix', 'muloren', 'jx1', 'archero']);
assert.deepEqual(config.options.web3.projectKeys, ['idleCyber', 'nekoverse', 'dalgona', 'cryptoquest']);
assert.deepEqual(config.options.automation.projectKeys, ['proxyapi-mad', 'brproxies', 'gamestudio-codexkit']);
assert.deepEqual(config.options.all.projectKeys, projectKeys);
for (const focus of Object.values(config.options)) {
  for (const [key, description] of Object.entries(focus.projectDescriptions || {})) {
    assert.ok(projectKeys.includes(key), 'Description must belong to an existing project');
    assert.ok(typeof description === 'string' && description.trim());
  }
}
console.log('PASS hiring focus canonical mappings');

const context = vm.createContext({});
const modelPath = path.join(root, 'assets/js/hiring-focus-model.js');
assert.ok(fs.existsSync(modelPath), 'Pure hiring focus model must exist');
vm.runInContext(fs.readFileSync(modelPath, 'utf8'), context, { filename: modelPath });
const model = context.HiringFocusModel;
assert.ok(model && typeof model.resolve === 'function');
const before = JSON.stringify(config);
for (const key of Object.keys(config.options)) {
  const focus = model.resolve(config, key);
  assert.equal(focus.id, key);
  assert.equal(focus.label, config.options[key].label);
  assert.equal(focus.projectKeys, config.options[key].projectKeys);
  assert.notEqual(focus, config.options[key], 'Resolution must not mutate canonical option');
}
for (const key of [undefined, null, '', 'unknown', '__proto__', 'constructor', 'toString']) {
  assert.equal(model.resolve(config, key).id, 'mobile');
}
assert.equal(model.resolve({ ...config, default: 'rpg' }, 'unknown').id, 'mobile');
assert.equal(JSON.stringify(config), before);
console.log('PASS resolution shape and mobile fallback');

assert.equal(typeof model.selectProjects, 'function');
const projects = Object.freeze(portfolio.projects.map(project => Object.freeze({ ...project })));
const originalKeys = projects.map(project => project.detailKey);
for (const key of Object.keys(config.options)) {
  const focus = model.resolve(config, key);
  const selected = model.selectProjects(projects, focus);
  if (key === 'all') {
    assert.equal(selected, projects, 'All returns the original array');
  } else {
    assert.equal(selected.length, projects.length, 'Every focus retains every project');
    assert.deepEqual(Array.from(selected.slice(0, focus.projectKeys.length), project => project.detailKey), focus.projectKeys);
    for (const project of selected) assert.ok(projects.includes(project), 'Preserve project references');
  }
}
const partial = model.selectProjects(projects, { id: 'custom', projectKeys: ['missing', 'jx1', 'sandwich'] });
assert.deepEqual(Array.from(partial.slice(0, 2), project => project.detailKey), ['jx1', 'sandwich']);
assert.equal(partial.length, projects.length);
assert.equal(model.selectProjects(projects, { id: 'custom', projectKeys: [] }).length, projects.length);
assert.equal(model.selectProjects([], model.resolve(config, 'mobile')).length, 0);
assert.equal(model.selectProjects(projects, { id: 'all', projectKeys: [] }), projects);
assert.deepEqual(projects.map(project => project.detailKey), originalKeys);
assert.equal(JSON.stringify(config), before);
const runtime = projects.map(project => ({ detailCategory: project.detailKey }));
assert.deepEqual(Array.from(model.selectProjects(runtime, model.resolve(config, 'mobile')).slice(0, config.options.mobile.projectKeys.length), project => project.detailCategory), config.options.mobile.projectKeys);
const idle = portfolio.projects.find(project => project.detailKey === 'idleCyber');
assert.match(model.describe(idle, model.resolve(config, 'web3')), /wallet|NFT/i);
assert.match(model.describe(idle, model.resolve(config, 'rpg')), /combat|progression/i);
assert.notEqual(model.describe(idle, model.resolve(config, 'web3')), model.describe(idle, model.resolve(config, 'rpg')));
assert.equal(model.projectView(idle, model.resolve(config, 'all')), idle);
assert.equal(model.projectView(idle, model.resolve(config, 'web3')).role, idle.role);
console.log('PASS all-project retention, audience copy, ordering, runtime records, and immutability');

