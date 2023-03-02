

// const HDWalletProvider = require('@truffle/hdwallet-provider');
const HDWalletProvider = require("@truffle/hdwallet-provider")
const config = {
  alchemy: "0dba898c85ca47c2ac23471de88b0aaa", // 测试网络token
  privateKey: 'e97b717ee45bcf2e35e4b281f42f947984b17abf0a5a7c7fa8c9950a36a0c33d'
}
module.exports = {

  contracts_build_directory: "./src/build",

  networks: {

    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
    },

    goerli: {
      provider: () => new HDWalletProvider(
        config.privateKey,
        // get goerli endpoint
        `https://goerli.infura.io/v3/${config.alchemy}`,// your infura API key
      ),
      network_id: 5,
      from: "0xE72BB307051ea7788033F82d45bF6747afd5d2A6",
      gas: 5500000,
      gasPrice: 20000000000,
      confirmations: 2,
      networkCheckTimeout: 1000000,
      timeoutBlocks: 200
    },
  },

  mocha: {
  },


  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.17", // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {          // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: true,
          runs: 200
        },
        evmVersion: "byzantium"
      }
    }
  }

};
