const fs = require('fs');
const path = require('path');

const packageRoot = path.join(__dirname, '..', 'node_modules', 'core-js-pure');
const filesToPatch = [
  {
    contents: "'use strict';\nmodule.exports = require('../es/global-this');\n",
    filePath: path.join(packageRoot, 'actual', 'global-this.js'),
  },
  {
    contents: "'use strict';\nmodule.exports = require('../internals/global-this');\n",
    filePath: path.join(packageRoot, 'es', 'global-this.js'),
  },
];

try {
  if (!fs.existsSync(packageRoot)) {
    console.log('core-js-pure package not found, skipping patch');
    process.exit(0);
  }

  filesToPatch.forEach(({ contents, filePath }) => {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, contents, 'utf8');
      console.log(`Patched missing ${path.relative(packageRoot, filePath)}`);
    } else {
      console.log(`${path.relative(packageRoot, filePath)} already present`);
    }
  });
} catch (error) {
  console.error('Failed to patch core-js-pure:', error.message);
  process.exit(1);
}
