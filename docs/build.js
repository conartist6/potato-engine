const esdoc = require('esdoc').default;

function makeConfig(pkg) {
  return {
    source: `../${pkg}/src`,
    destination: `./build/${pkg}`,
    package: `../${pkg}/package.json`,
    index: `../${pkg}/README.md`,
    plugins: [
      {
        name: 'esdoc-ecmascript-proposal-plugin',
        option: {
          classProperties: true,
          objectRestSpread: true,
          dynamicImport: true,
        },
      },
      {
        name: 'esdoc-accessor-plugin',
      },
      {
        name: 'esdoc-external-ecmascript-plugin',
      },
      {
        name: 'esdoc-external-nodejs-plugin',
      },
      {
        name: 'esdoc-lint-plugin',
      },
      {
        name: 'esdoc-publish-react-plugin',
        option: {
          stripPackageName: false,
          replaces: [
            { from: '^src/', to: 'kye-engine/lib/' },
            { from: '\\.js$', to: '' },
            { from: '/index$', to: '' },
          ],
        },
      },
    ],
  };
}

esdoc.generate(makeConfig('kye-engine'));
