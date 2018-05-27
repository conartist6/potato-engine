const Funnel = require('broccoli-funnel');
const MergeTrees = require('broccoli-merge-trees');
const esTranspiler = require('broccoli-babel-transpiler');
const path = require('path');

let mjs = 'src';
mjs = esTranspiler(mjs, {
  filterExtensions: ['js'],
  plugins: ['check-es2015-constants', 'transform-object-rest-spread'],
});
mjs = new Funnel(mjs, {
  destDir: '',
  include: ['**/*.js'],
  getDestinationPath(relativePath) {
    return relativePath.replace(/\.js$/, '.mjs');
  },
});

let es = 'src';
es = new Funnel(es, {
  destDir: '',
  include: ['**/*.js'],
});
es = esTranspiler(es, {
  filterExtensions: ['js'],
  plugins: [
    'check-es2015-constants',
    'transform-object-rest-spread',
    ['transform-es2015-modules-commonjs', { loose: true }],
  ],
});

module.exports = new MergeTrees([mjs, es]);
