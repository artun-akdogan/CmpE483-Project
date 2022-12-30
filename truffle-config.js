require('dotenv').config();
const HDWalletProvider = require("@truffle/hdwallet-provider");

const mnemonic = process.env.PRIVATE_KEY;

module.exports = {
  networks: {
    fuji: {
      provider: function () {
        return new HDWalletProvider({
          mnemonic,
          providerOrUrl: `https://avalanche-fuji.infura.io/v3/b5b26cc448bd4bc7b4774b7f7eb96224`,
          chainId: "0xa869"
        })
      },
      network_id: "*",
      gas: 3000000,
      gasPrice: 470000000000,
      skipDryRun: true
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
}