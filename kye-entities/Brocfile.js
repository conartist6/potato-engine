const Funnel = require('broccoli-funnel');
const MergeTrees = require('broccoli-merge-trees');
const esTranspiler = require('broccoli-babel-transpiler');
const path = require('path');

let js = esTranspiler('src', {
  filterExtensions: ['js'],
  plugins: ['check-es2015-constants', 'transform-object-rest-spread'],
});
js = new Funnel(js, {
  destDir: '',
  getDestinationPath(relativePath) {
    return relativePath.replace(/\.js$/, '.mjs');
  },
});

const mjs = esTranspiler('src', {
  filterExtensions: ['js'],
  plugins: [
    'check-es2015-constants',
    'transform-object-rest-spread',
    ['transform-es2015-modules-commonjs', { loose: true }],
  ],
});

module.exports = new MergeTrees([mjs, js]);
