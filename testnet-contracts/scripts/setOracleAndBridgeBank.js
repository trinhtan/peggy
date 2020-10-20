/** @format */

const { throttle } = require('lodash');

module.exports = async () => {
  try {
    const Web3 = require('web3');
    const HDWalletProvider = require('@truffle/hdwallet-provider');

    // Contract abstraction
    const truffleContract = require('truffle-contract');
    const cosmosBridgeContract = truffleContract(require('../build/contracts/CosmosBridge.json'));
    const oracleContract = truffleContract(require('../build/contracts/Oracle.json'));
    const bridgeBankContract = truffleContract(require('../build/contracts/BridgeBank.json'));

    let provider;
    if (process.argv[5] === 'ropsten') {
      provider = new HDWalletProvider(
        process.env.OPERATOR_PRIVATE_KEY,
        'https://ropsten.infura.io/v3/'.concat(process.env.INFURA_PROJECT_ID)
      );
    } else if (process.argv[5] === 'rinkeby') {
      provider = new HDWalletProvider(
        process.env.OPERATOR_PRIVATE_KEY,
        'https://rinkeby.infura.io/v3/'.concat(process.env.INFURA_PROJECT_ID)
      );
    } else if (process.argv[5] === 'mainnet') {
      provider = new HDWalletProvider(
        process.env.OPERATOR_PRIVATE_KEY,
        'https://mainnet.infura.io/v3/'.concat(process.env.INFURA_PROJECT_ID)
      );
    } else {
      throw new Error('Invalid Network ID!');
    }

    const web3 = new Web3(provider);

    cosmosBridgeContract.setProvider(web3.currentProvider);
    oracleContract.setProvider(web3.currentProvider);
    bridgeBankContract.setProvider(web3.currentProvider);

    /*******************************************
     *** Contract interaction
     ******************************************/
    // Get current accounts
    const accounts = await web3.eth.getAccounts();

    // Get deployed Oracle's address
    const oracleContractAddress = await oracleContract.deployed().then(function (instance) {
      return instance.address;
    });

    // Set Oracle
    const { logs: setOracleLogs } = await cosmosBridgeContract.deployed().then(function (instance) {
      return instance.setOracle(oracleContractAddress, {
        from: accounts[0],
        value: 0,
        gas: 300000, // 300,000 Gwei
      });
    });
    // Get event logs
    const setOracleEvent = setOracleLogs.find((e) => e.event === 'LogOracleSet');
    console.log("CosmosBridge's Oracle set:", setOracleEvent.args._oracle);

    // Get deployed BridgeBank's address
    const bridgeBankContractAddress = await bridgeBankContract.deployed().then(function (instance) {
      return instance.address;
    });

    // Set BridgeBank
    const { logs: setBridgeBankLogs } = await cosmosBridgeContract
      .deployed()
      .then(function (instance) {
        return instance.setBridgeBank(bridgeBankContractAddress, {
          from: accounts[0],
          value: 0,
          gas: 300000, // 300,000 Gwei
        });
      });

    // Get event logs
    const setBridgeBankEvent = setBridgeBankLogs.find((e) => e.event === 'LogBridgeBankSet');
    console.log("CosmosBridge's BridgeBank set:", setBridgeBankEvent.args._bridgeBank);

    process.exit(0);
  } catch (error) {
    console.error({ error });
    process.exit(1);
  }
};
