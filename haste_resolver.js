const fs = require('fs');

/**
 * Simple hasteImpl that parses @providesModule annotation from JS modules.
 */
module.exports = {
  getHasteName(filename) {
    console.log('Attempt to resolve: ' + filename);
    const matches = fs
      .readFileSync(filename, 'utf8')
      .match(/@providesModule ([^\n]+)/);

    if (!matches) {
      return undefined;
    }

    return matches[1];
  },
};