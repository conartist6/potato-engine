const esdoc = require('esdoc').default;

function makeConfig(pkg) {
  return {
    source: `../${pkg}/src`,
    destination: `./build/${pkg}`,
    package: `../${pkg}/package.json`,
    index: `../${pkg}/README.md`,
    plugins: [
      {
        name: 'esdoc-standard-plugin',
        option: {
          undocumentIdentifier: { enable: false },
        },
      },
      {
        name: 'esdoc-importpath-plugin',
        option: {
          stripPackageName: false,
          replaces: [
            { from: '^src/', to: 'lib/' },
            { from: '\\.js$', to: '' },
            { from: '/index$', to: '' },
          ],
        },
      },
      {
        name: 'esdoc-ecmascript-proposal-plugin',
        option: {
          classProperties: true,
          objectRestSpread: true,
          dynamicImport: true,
        },
      },
      {
        name: 'esdoc-external-nodejs-plugin',
      },
    ],
  };
}

esdoc.generate(makeConfig('kye-engine'));
