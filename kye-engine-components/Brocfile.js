const Funnel = require('broccoli-funnel');
const BroccoliSass = require('broccoli-sass-modular');
const MergeTrees = require('broccoli-merge-trees');
const esTranspiler = require('broccoli-babel-transpiler');

const path = require('path');

let mjs = 'src';
mjs = esTranspiler(mjs, {
  filterExtensions: ['js'],
  plugins: [
    'syntax-jsx',
    'check-es2015-constants',
    'transform-object-rest-spread',
    'transform-class-properties',
    'transform-react-display-name',
    'transform-react-jsx',
  ],
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
    'syntax-jsx',
    'check-es2015-constants',
    'transform-object-rest-spread',
    'transform-class-properties',
    ['transform-es2015-modules-commonjs', { loose: true }],
    'transform-react-display-name',
    'transform-react-jsx',
  ],
});

let css = 'src';
css = new Funnel(css, {
  destDir: '',
  include: ['**/*.scss'],
});

css = new BroccoliSass(css);

module.exports = new MergeTrees([mjs, es, css]);
