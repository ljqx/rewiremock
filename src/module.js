import {dirname, resolve} from 'path';

const Module = module.hot
  ? require('../webpack/module')
  : require('module');

import executor, {requireModule} from './executor';

export const originalLoader = Module._load;
//__webpack_require__
//__webpack_modules__

const NodeModule = {
  overloadRequire() {
    Module._load = executor;
    // overload modules by internally
  },

  restoreRequire(){
    Module._load = originalLoader;
  },

  _resolveFilename(fileName, module){
    return Module._resolveFilename(fileName, module);
  },

  get _cache() {
    return Module._cache;
  },

  relativeFileName (name, parent) {
    if (name[0] == '.') {
      return dirname(getModuleName(parent)) + '/' + name;
    }
    return name;
  },

  require(name) {
    return requireModule(name);
  }
};

const toModule = (name) => require.cache[name];

export const pickModuleName = (fileName, parent) => {
  if (typeof __webpack_modules__ !== 'undefined') {
    const targetFile = resolve(dirname(getModuleName(parent)), fileName);
    return Object
      .keys(__webpack_modules__)
      .find(name => name.indexOf(targetFile) > 0);
  } else {
    return fileName;
  }
}

export const moduleCompare = (a, b) => a === b || getModuleName(a) === getModuleName(b);

export const getModuleName = (module) => module.filename || module.i;
export const getModuleParent = (module) => module.parent || toModule(module.parents[0]);
export const getModuleParents = (module) => module.parent ? [getModuleName(module.parent)] : module.parents;

export const inParents = (a, b) => {
  const B = getModuleName(b)
  return !!getModuleParents(a).find(x => x === B);
}

export default NodeModule;
