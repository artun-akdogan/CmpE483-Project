require('dotenv').config();
const HDWalletProvider = require("@truffle/hdwallet-provider");

const mnemonic = process.env.PRIVATE_KEY;

module.exports = {
  networks: {
    fuji: {
      provider: new HDWalletProvider(mnemonic, "https://api.avax-test.network/ext/bc/C/rpc"),
      network_id: 43113,
    }
  },
  compilers: {
    solc: {
      version: "^0.8.0",
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}