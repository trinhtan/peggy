const launchpad = require('@cosmjs/launchpad');
const bip39 = require('bip39');
const axios = require('axios');

const API = 'http://localhost:1317';

const PEGGY_CHAIN_ID = 'peggy';
const PEGGY_PREFIX = 'peggy';
const ADDRESS_PREFIX = 'cosmos';

const BRIDGE_REGISTRY_CONTRACT_ADDRESS = '0x22B5DB062B42d7D090fff36d1C44764283F3bD6B';

const ETHEREUM_TOKEN_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000';
const DAI_TOKEN_CONTRACT_ADDRESS = '0xad6d458402f60fd3bd25163575031acdce07538d';

const ETH_SYMBOL = 'eth';
const ETHEREUM_CHAIN_ID = '3';

const ETHEREUM_SENDER = '0x8f287eA4DAD62A3A626942d149509D6457c2516C';
const ETHEREUM_RECEIVER = '0xf68F0c27D90bDcde125724D390fF75b3635FF0Ab';

const validator = require('../validator.json');
const testuser = require('../testuser.json');

// Only validator can call this function
exports.createClaim = async function (
  validatorMnemonic,
  nonce,
  ethereumSender,
  cosmosReceiver,
  validator,
  amount
) {
  try {
    let wallet = await launchpad.Secp256k1Wallet.fromMnemonic(
      validatorMnemonic,
      launchpad.makeCosmoshubPath(0),
      ADDRESS_PREFIX
    );

    let [{ address }] = await wallet.getAccounts();

    let client = new launchpad.SigningCosmosClient(API, address, wallet);
    let base_req = { chain_id: PEGGY_CHAIN_ID, from: address };

    let body = {
      ethereum_chain_id: ETHEREUM_CHAIN_ID,
      bridge_registry_contract_address: BRIDGE_REGISTRY_CONTRACT_ADDRESS,
      nonce: nonce,
      symbol: ETH_SYMBOL,
      token_contract_address: ETHEREUM_TOKEN_CONTRACT_ADDRESS,
      ethereum_sender: ethereumSender,
      cosmos_receiver: cosmosReceiver,
      validator: validator,
      amount: amount,
      claim_type: 'lock'
    };

    const req = { base_req, ...body };
    const { data } = await axios.post(`${API}/ethbridge/prophecies`, req);
    const { msg, fee, memo } = data.value;
    return await client.signAndPost(msg, fee, memo);
  } catch (error) {
    console.log('Create Claim fail!', error);
  }
};

// testuser calls this function
exports.transferETHFromCosmosToEthereum = async function (mnemonic, ethereumReceiver, amount) {
  try {
    let wallet = await launchpad.Secp256k1Wallet.fromMnemonic(
      mnemonic,
      launchpad.makeCosmoshubPath(0),
      ADDRESS_PREFIX
    );

    let [{ address }] = await wallet.getAccounts();

    let client = new launchpad.SigningCosmosClient(API, address, wallet);
    let base_req = { chain_id: PEGGY_CHAIN_ID, from: address };

    let body = {
      ethereum_chain_id: ETHEREUM_CHAIN_ID,
      bridge_registry_contract_address: BRIDGE_REGISTRY_CONTRACT_ADDRESS,
      token_contract_address: ETHEREUM_TOKEN_CONTRACT_ADDRESS,
      cosmos_sender: address,
      ethereum_receiver: ethereumReceiver,
      amount: amount,
      symbol: PEGGY_PREFIX + ETH_SYMBOL
    };

    const req = { base_req, ...body };
    const { data } = await axios.post(`${API}/ethbridge/burn`, req);
    const { msg, fee, memo } = data.value;
    return await client.signAndPost(msg, fee, memo);
  } catch (error) {
    console.log('Transfer ETH from Cosmos to Ethereum fail! ', error);
  }
};

// generate new cosmos account
exports.newAccount = async function () {
  try {
    const mnemonic = bip39.generateMnemonic();
    let wallet = await launchpad.Secp256k1Wallet.fromMnemonic(
      mnemonic,
      launchpad.makeCosmoshubPath(0),
      ADDRESS_PREFIX
    );

    let [{ address }] = await wallet.getAccounts();
    console.log(address);
    console.log(mnemonic);

    return mnemonic;
  } catch (error) {
    throw `Error while generate new mnemonic: ${error}`;
  }
};

// send coin fron cosmos account to another cosmos account
exports.transferCoinToAnother = async function (mnemonic, receiverAddress, amount, denom) {
  try {
    let wallet = await launchpad.Secp256k1Wallet.fromMnemonic(
      mnemonic,
      launchpad.makeCosmoshubPath(0),
      ADDRESS_PREFIX
    );

    let [{ address }] = await wallet.getAccounts();
    let url = `${API}/auth/accounts/${address}`;
    let acc = (await axios.get(url)).data;
    let account = acc.result.value;

    let client = new launchpad.SigningCosmosClient(API, address, wallet);
    let base_req = {
      chain_id: PEGGY_CHAIN_ID,
      from: address,
      memo: '',
      account_number: account.account_number,
      sequence: account.sequence,
      gas: '200000',
      gas_adjustment: '1.2',
      fees: [
        {
          denom: denom,
          amount: amount
        }
      ],
      simulate: false
    };

    let body = {
      amount: [
        {
          denom: denom,
          amount: amount
        }
      ]
    };

    const req = { base_req, ...body };
    const { data } = await axios.post(`${API}/bank/accounts/${receiverAddress}/transfers`, req);
    const { msg, fee, memo } = data.value;
    return await client.signAndPost(msg, fee, memo);
  } catch (error) {
    throw `Error while generate new mnemonic: ${error}`;
  }
};

// send ERC20 from cosmos to ethereum
exports.transferERC20FromCosmosToEthereum = async function (
  mnemonic,
  ethereumReceiver,
  amount,
  tokenContractAddress,
  symbol
) {
  try {
    let wallet = await launchpad.Secp256k1Wallet.fromMnemonic(
      mnemonic,
      launchpad.makeCosmoshubPath(0),
      ADDRESS_PREFIX
    );

    let [{ address }] = await wallet.getAccounts();

    let client = new launchpad.SigningCosmosClient(API, address, wallet);
    let base_req = { chain_id: PEGGY_CHAIN_ID, from: address };

    let body = {
      ethereum_chain_id: ETHEREUM_CHAIN_ID,
      bridge_registry_contract_address: BRIDGE_REGISTRY_CONTRACT_ADDRESS,
      token_contract_address: tokenContractAddress,
      cosmos_sender: address,
      ethereum_receiver: ethereumReceiver,
      amount: amount,
      symbol: PEGGY_PREFIX + symbol
    };

    const req = { base_req, ...body };
    const { data } = await axios.post(`${API}/ethbridge/burn`, req);
    const { msg, fee, memo } = data.value;
    return await client.signAndPost(msg, fee, memo);
  } catch (error) {
    console.log('Transfer ETH from Cosmos to Ethereum fail! ', error);
  }
};

// send local asset from cosmos to ethereum
exports.transferLocalAssetFromCosmosToEthereum = async function (
  mnemonic,
  ethereumReceiver,
  amount,
  tokenContractAddress,
  symbol
) {
  try {
    let wallet = await launchpad.Secp256k1Wallet.fromMnemonic(
      mnemonic,
      launchpad.makeCosmoshubPath(0),
      ADDRESS_PREFIX
    );

    let [{ address }] = await wallet.getAccounts();

    let client = new launchpad.SigningCosmosClient(API, address, wallet);
    let base_req = { chain_id: PEGGY_CHAIN_ID, from: address };

    let body = {
      ethereum_chain_id: ETHEREUM_CHAIN_ID,
      bridge_registry_contract_address: BRIDGE_REGISTRY_CONTRACT_ADDRESS,
      token_contract_address: tokenContractAddress,
      cosmos_sender: address,
      ethereum_receiver: ethereumReceiver,
      amount: amount,
      symbol: symbol
    };

    const req = { base_req, ...body };
    const { data } = await axios.post(`${API}/ethbridge/lock`, req);
    const { msg, fee, memo } = data.value;
    return await client.signAndPost(msg, fee, memo);
  } catch (error) {
    console.log('Transfer ETH from Cosmos to Ethereum fail! ', error);
  }
};

// this.createClaim(
//   validator.mnemonic,
//   '2', // monotonically increasing
//   ETHEREUM_SENDER,
//   testuser.address,
//   'cosmosvaloper13k29zha6u78hl2t6ta9sx2nkagqv8rvecr4t64',
//   '500'
// );

// this.transferETHFromCosmosToEthereum(
//   'shrug give segment transfer hotel hurry acquire stomach oil warfare reason mirror cute try buyer female provide myth own dash hungry card glare use',
//   ETHEREUM_RECEIVER,
//   '500'
// );

// this.newAccount();

// this.transferCoinToAnother(
//   'shrug give segment transfer hotel hurry acquire stomach oil warfare reason mirror cute try buyer female provide myth own dash hungry card glare use',
//   'cosmos13k29zha6u78hl2t6ta9sx2nkagqv8rveahp7kx',
//   '500',
//   'peggyeth'
// );

// this.transferERC20FromCosmosToEthereum(
//   'shrug give segment transfer hotel hurry acquire stomach oil warfare reason mirror cute try buyer female provide myth own dash hungry card glare use',
//   ETHEREUM_RECEIVER,
//   '1000',
//   DAI_TOKEN_CONTRACT_ADDRESS,
//   'dai'
// );

// this.transferLocalAssetFromCosmosToEthereum(
//   'canoe bridge wash industry blue trumpet lion skull champion jazz key cliff such arctic tunnel ankle intact zero initial patch domain depth cloth promote',
//   ETHEREUM_RECEIVER,
//   '1',
//   DAI_TOKEN_CONTRACT_ADDRESS,
//   'stake'
// );
