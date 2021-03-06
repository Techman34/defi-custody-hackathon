require('dotenv').config();

// work around for RAY artifacts
const { copyRayBuilds } = require("./test/utils/ray.js");
copyRayBuilds();

const privateKey = process.env.DEFICUSTODY_PRIVATE_KEY;
const HDWalletProvider = require("truffle-hdwallet-provider");
// Create your own key for Production environments (https://infura.io/)
const INFURA_ID = process.env.INFURA_ID || 'd6760e62b67f4937ba1ea2691046f06d';

const configNetwork = (network, network_id, path = "m/44'/60'/0'/0/", gas = 6465030, gasPrice = 1e10) => ({
  provider: () => new HDWalletProvider(
      privateKey, `https://${network}.infura.io/v3/${INFURA_ID}`,
      0, 1, true, path
  ),
  network_id,
  gas,
  gasPrice,
});

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },
    ropsten: configNetwork('ropsten', 3),
    kovan: configNetwork('kovan', 42),
    rinkeby: configNetwork('rinkeby', 4),
    main: configNetwork('mainnet', 1),
  },
};