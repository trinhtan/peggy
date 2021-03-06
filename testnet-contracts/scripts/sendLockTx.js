/** @format */

module.exports = async () => {
  try {
    const Web3 = require('web3');
    const HDWalletProvider = require('@truffle/hdwallet-provider');

    // Contract abstraction
    const truffleContract = require('truffle-contract');
    const contract = truffleContract(require('../build/contracts/BridgeBank.json'));

    const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
    const COSMOS_RECIPIENT = Web3.utils.utf8ToHex(process.argv[4]);
    const AMOUNT = process.argv[5];
    const ETH_DENOM = process.argv[6];
    console.log(COSMOS_RECIPIENT, ETH_DENOM, AMOUNT);

    let provider;
    if (process.argv[8] === 'ropsten') {
      provider = new HDWalletProvider(
        process.env.USER_PRIVATE_KEY,
        'https://ropsten.infura.io/v3/'.concat(process.env.INFURA_PROJECT_ID)
      );
    } else if (process.argv[8] === 'rinkeby') {
      provider = new HDWalletProvider(
        process.env.USER_PRIVATE_KEY,
        'https://rinkeby.infura.io/v3/'.concat(process.env.INFURA_PROJECT_ID)
      );
    } else if (process.argv[8] === 'mainnet') {
      provider = new HDWalletProvider(
        process.env.USER_PRIVATE_KEY,
        'https://mainnet.infura.io/v3/'.concat(process.env.INFURA_PROJECT_ID)
      );
    } else {
      throw new Error('Invalid Network ID!');
    }

    const USER_ADDRESS = process.env.USER_ADDRESS;

    if (ETH_DENOM !== 'eth') {
      throw new Error('Invalid ETH denom!');
    }

    const web3 = new Web3(provider);
    contract.setProvider(web3.currentProvider);

    // Send lock transaction
    console.log('Connecting to contract....');
    const { logs } = await contract.deployed().then(function (instance) {
      console.log('Connected to contract, sending lock...');
      return instance.lock(COSMOS_RECIPIENT, NULL_ADDRESS, AMOUNT, {
        from: USER_ADDRESS,
        value: AMOUNT,
      });
    });

    console.log('Sent lock...');

    // Get event logs
    const event = logs.find((e) => e.event === 'LogLock');
    console.log(event);
    // Parse event fields
    const lockEvent = {
      to: event.args._to,
      from: event.args._from,
      symbol: event.args._symbol,
      token: event.args._token,
      value: Number(event.args._value),
      nonce: Number(event.args._nonce),
    };

    console.log(lockEvent);
    process.exit(0);
  } catch (error) {
    console.error({ error });
    process.exit(1);
  }
};
