import esdoc_module from 'esdoc';
const esdoc = esdoc_module.default;

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
        name: './esdoc-publish-react-plugin',
      },
    ],
  };
}

esdoc.generate(makeConfig('kye-engine'));
