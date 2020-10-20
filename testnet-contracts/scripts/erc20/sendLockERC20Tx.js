module.exports = async () => {
  try {
    const Web3 = require('web3');
    const HDWalletProvider = require('@truffle/hdwallet-provider');
    const { CONSTANTS } = require('../constants');

    const truffleContract = require('truffle-contract');
    const contract = truffleContract(require('../../build/contracts/BridgeBank.json'));
    const erc20Json = require('./erc20.json');

    const COSMOS_RECIPIENT = Web3.utils.utf8ToHex(process.argv[4]);
    const AMOUNT = process.argv[5];
    const DENOM = process.argv[6];

    let provider;
    if (process.argv[8] == 'ropsten') {
      provider = new HDWalletProvider(
        process.env.USER_PRIVATE_KEY,
        'https://ropsten.infura.io/v3/'.concat(process.env.INFURA_PROJECT_ID)
      );
    } else if (process.argv[8] == 'rinkeby') {
      provider = new HDWalletProvider(
        process.env.USER_PRIVATE_KEY,
        'https://rinkeby.infura.io/v3/'.concat(process.env.INFURA_PROJECT_ID)
      );
    } else if (process.argv[8] == 'mainnet') {
      provider = new HDWalletProvider(
        process.env.USER_PRIVATE_KEY,
        'https://rinkeby.infura.io/v3/'.concat(process.env.INFURA_PROJECT_ID)
      );
    } else {
      throw new Error('Invalid Network ID!');
    }
    const USER_ADDRESS = process.env.USER_ADDRESS;

    const TOKEN_ADDRESS = CONSTANTS[process.argv[8]].tokens[DENOM].address;
    if (!TOKEN_ADDRESS) {
      throw new Error('Invalid Token!');
    }

    const web3 = new Web3(provider);
    contract.setProvider(web3.currentProvider);

    const erc20Contract = new web3.eth.Contract(erc20Json, TOKEN_ADDRESS);

    const bridgeBankInstance = await contract.deployed().then(function (instance) {
      return instance;
    });

    const bridgeBankAddress = bridgeBankInstance.address;

    // sender approve Bridge Bank
    console.log('Aprove for Bridge Bank');
    await erc20Contract.methods.approve(bridgeBankAddress, AMOUNT).send({
      from: USER_ADDRESS,
      value: 0,
      gas: 300000, // 300,000 Gwei
    });

    // Send lock transaction
    console.log('Connecting to contract....');
    const { logs } = await bridgeBankInstance.lock(COSMOS_RECIPIENT, TOKEN_ADDRESS, AMOUNT, {
      from: USER_ADDRESS,
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
