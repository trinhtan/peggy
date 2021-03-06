require('dotenv');
const launchpad = require('@cosmjs/launchpad');
const axios = require('axios');
const API = process.env.REACT_APP_SERVER_ENDPOINT;
const PEGGY_CHAIN_ID = 'peggy';
const ETHEREUM_CHAIN_ID = '4';
const BRIDGE_REGISTRY_CONTRACT_ADDRESS = '0xef16E53EB12628B80c1d93608eEd997cB8fdb018';
const ETHEREUM_TOKEN_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000';
const ETH_SYMBOL = 'eth';

export const getBalCosmos = async function (cosmosAddress, symbol) {
  try {
    if (!cosmosAddress) return 0;
    const { data } = await axios.get(`${API}/bank/balances/${cosmosAddress}`);
    const res = data.result.find((e) => e.denom === symbol);
    console.log(res.amount);
    return res.amount;
  } catch (e) {
    return 0;
  }
};

export const transferErc20FromPeggy = async function (
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
      'cosmos'
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
      symbol: symbol,
    };

    const req = { base_req, ...body };
    const { data } = await axios.post(`${API}/ethbridge/burn`, req);
    const { msg, fee, memo } = data.value;
    let a = await client.signAndPost(msg, fee, memo);
    console.log(a);
  } catch (error) {
    console.log('Transfer ETH from Cosmos to Ethereum fail! ', error);
  }
};

export const transferEthFromPeggy = async function (mnemonic, ethAddress, amount) {
  try {
    let wallet = await launchpad.Secp256k1Wallet.fromMnemonic(
      mnemonic,
      launchpad.makeCosmoshubPath(0),
      'cosmos'
    );

    let [{ address }] = await wallet.getAccounts();
    let client = new launchpad.SigningCosmosClient(API, address, wallet);
    let base_req = { chain_id: PEGGY_CHAIN_ID, from: address };
    let body = {
      ethereum_chain_id: ETHEREUM_CHAIN_ID,
      bridge_registry_contract_address: BRIDGE_REGISTRY_CONTRACT_ADDRESS,
      token_contract_address: ETHEREUM_TOKEN_CONTRACT_ADDRESS,
      cosmos_sender: address,
      ethereum_receiver: ethAddress,
      amount: amount,
      symbol: ETH_SYMBOL,
    };

    const req = { base_req, ...body };
    const { data } = await axios.post(`${API}/ethbridge/burn`, req);
    const { msg, fee, memo } = data.value;
    let tx = await client.signAndPost(msg, fee, memo);
    console.log(tx);
  } catch (e) {
    console.log(e);
  }
};
