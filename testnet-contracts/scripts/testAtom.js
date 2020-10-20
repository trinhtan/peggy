require('dotenv').config();

const BN = require('bn.js');

const Web3 = require('web3');
const web3 = new Web3('https://ropsten.infura.io/v3/' + process.env.INFURA_PROJECT_ID);

const BridgeBank = require('../build/contracts/BridgeBank.json');
const BridgeBankAddress = BridgeBank.networks['3'].address;
const BridgeBankContract = new web3.eth.Contract(BridgeBank.abi, BridgeBankAddress);

const getTokenAddress = async function (symbol) {
  try {
    let address = await BridgeBankContract.methods.lockedTokenList(symbol).call();
    console.log(address);
    return address;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

getTokenAddress("PEGGYSTAKE");
