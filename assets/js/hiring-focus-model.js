/* Pure recruiter-focus selection; no DOM, storage, or project mutation. */
(function (root) {
  'use strict';

  function resolve(config, key) {
    var options = config.options;
    var id = typeof key === 'string' && Object.prototype.hasOwnProperty.call(options, key)
      ? key
      : 'mobile';
    return Object.assign({}, options[id], { id: id });
  }

  function selectProjects(projects, focus) {
    if (focus.id === 'all') return projects;
    var byKey = new Map(projects.map(function (project) {
      return [project.detailKey || project.detailCategory, project];
    }));
    var preferred = focus.projectKeys.filter(function (key) {
      return byKey.has(key);
    }).map(function (key) {
      return byKey.get(key);
    });
    var keys = new Set(focus.projectKeys);
    return preferred.concat(projects.filter(function (project) {
      return !keys.has(project.detailKey || project.detailCategory);
    }));
  }

  function describe(project, focus) {
    var key = project.detailKey || project.detailCategory;
    if (focus.projectDescriptions && focus.projectDescriptions[key]) return focus.projectDescriptions[key];
    return project.summary || project.description || '';
  }

  function projectView(project, focus) {
    if (focus.id === 'all') return project;
    return Object.assign({}, project, { summary: describe(project, focus) });
  }

  root.HiringFocusModel = { resolve: resolve, selectProjects: selectProjects, describe: describe, projectView: projectView };
})(typeof window !== 'undefined' ? window : globalThis);
