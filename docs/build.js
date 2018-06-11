const esdoc = require('esdoc2').default;

function makeConfig(pkg) {
  return {
    destination: `./build/${pkg}`,
    root: `../packages/${pkg}`,
    index: `../packages/${pkg}/README.md`,
    plugins: [
      {
        name: 'esdoc2-react-standard-plugin',
      },
    ],
  };
}

esdoc.generate(makeConfig('kye-engine'));
