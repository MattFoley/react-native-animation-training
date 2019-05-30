const fs = require('fs');
const stream = fs.createWriteStream("append-test.txt", {flags:'a'});

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

 /**
  * From Tj:
  * 
  * This entire file is copied from hasteImpl.js from within ReactNative's core repo. We've added a few Skillz changes to 
  * create module names from @providesModule for Skillz classes. I've also modified the requires and path resolves
  * to work from our project root, rather than inside node_modules where hasteImpl.js lives.
  *  
  * Eventually, we can port this over to just use filename. This will requiring ensuring there
  * are no duplicate filenames in the Skillz SDK.
  * 
  * SKILLZ_ROOT controls what javascript files should be turned into modules, and would need to change per project
  * to point to the proper JS source root.
  * 
  * There may be other problems that come up when executing this. Know that jest-haste-map/worker.js 
  * handles parsing of a file path to a module name. jest-haste-map/index.js handles collecting all files available.
  * 
  * Logging won't work from here to debug issues, but you can use fs.createWriteStream to create a log file.
  * The exported function is executed in parallel, so be careful (don't overwrite, append).
  */

'use strict';

const path = require('path');
const findPlugins = require('./node_modules/react-native/local-cli/core/findPlugins');
const plugins = findPlugins([path.resolve(__dirname)]);

const SKILLZ_ROOT =  path.resolve(__dirname, 'App') + path.sep;

// Detect out-of-tree platforms and add them to the whitelists
const pluginRoots /*: Array<
  string,
> */ = plugins.haste.providesModuleNodeModules.map(
  name => path.resolve(__dirname, 'node_modules/', name) + path.sep,
);

const pluginNameReducers /*: Array<
  [RegExp, string],
> */ = plugins.haste.platforms.map(name => [
  new RegExp(`^(.*)\.(${name})$`),
  '$1',
]);

const ROOTS = [path.resolve(__dirname, 'node_modules/react-native/') + path.sep, ...pluginRoots];

const BLACKLISTED_PATTERNS /*: Array<RegExp> */ = [
  /.*[\\\/]__(mocks|tests)__[\\\/].*/,
  /^Libraries[\\\/]Animated[\\\/]src[\\\/]polyfills[\\\/].*/,
  /^Libraries[\\\/]Renderer[\\\/]fb[\\\/].*/,
];

const WHITELISTED_PREFIXES /*: Array<string> */ = [
  'IntegrationTests',
  'Libraries',
  'ReactAndroid',
  'RNTester',
];

const NAME_REDUCERS /*: Array<[RegExp, string]> */ = [
  // extract basename
  [/^(?:.*[\\\/])?([a-zA-Z0-9$_.-]+)$/, '$1'],
  // strip .js/.js.flow suffix
  [/^(.*)\.js(\.flow)?$/, '$1'],
  // strip platform suffix
  [/^(.*)\.(android|ios|native|App)$/, '$1'],
  // strip plugin platform suffixes
  ...pluginNameReducers,
];

const haste = {
  /*
   * @return {string|void} hasteName for module at filePath; or undefined if
   *                       filePath is not a haste module
   */
  getHasteName(
    filePath /*: string */,
    sourceCode /*: ?string */,
  ) /*: string | void */ {
    
    if (!isHastePath(filePath)) {
      /**
       * INSERT CUSTOM SEARCH FUNCTION HERE.
       */
      if (filePath.startsWith(SKILLZ_ROOT)) {
        stream.write('Found skillz root, check matches: ' + filePath + '\n');
        const matches = fs.readFileSync(filePath, 'utf8').match(/@providesModule ([^\n]+)/);

        if (!matches) {
          stream.write('Found skillz root but no matches: ' + filePath + '\n');
          return undefined;
        } else {
          stream.write('Found skillz root, setting module name to: ' + matches[1] + ' for: ' + filePath + '\n');
        }
        
        return matches[1];
      }

      stream.write('Returning undefined for : ' + filePath + '\n');
      return undefined;
    }

    const hasteName = NAME_REDUCERS.reduce(
      (name, [pattern, replacement]) => name.replace(pattern, replacement),
      filePath,
    );
    stream.write('Returning :' + hasteName + ' for : ' + filePath + '\n');
    return hasteName;
  },
};

function isHastePath(filePath /*: string */) /*: boolean */ {
  if (!filePath.endsWith('.js') && !filePath.endsWith('.js.flow')) {
    return false;
  }

  const root = ROOTS.find(r => filePath.startsWith(r));
  if (!root) {
    stream.write('Skipping filepath, not in roots :' + filePath + '\n');
    return false;
  }

  filePath = filePath.substr(root.length);
  if (BLACKLISTED_PATTERNS.some(pattern => pattern.test(filePath))) {
    stream.write('Skipping filepath, in black list :' + filePath + '\n');
    return false;
  }
  if (!WHITELISTED_PREFIXES.some(prefix => filePath.startsWith(prefix))) {
    stream.write('Skipping filepath, not in white list :' + filePath + '\n');
    return false;
  } else {
    return true;
  }
}

module.exports = haste;
