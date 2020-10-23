const BridgeBank = require('../eth/contracts/BridgeBank.json');
const ERC20 = require('../eth/contracts/IERC20.json');
const Web3 = require('web3');
const web3 = new Web3(window.ethereum);
const bridgeBank = new web3.eth.Contract(BridgeBank.abi, BridgeBank.networks['3'].address);

export const sendEth = async (ethAddress, amount, cosmosAddress) => {
  try {
    bridgeBank.lock(cosmosAddress, '0x0000000000000000000000000000000000000000', amount, {
      from: ethAddress,
      value: amount,
      gas: 300000
    });
  } catch (e) {
    console.log(e);
  }
};

export const sendErc20 = async (ethAddress, amount, cosmosAddress, coinDenom) => {
  try {
    bridgeBank.lock(cosmosAddress, coinDenom, amount, {
      from: ethAddress
    });
  } catch (e) {
    console.log(e);
  }
};

export const approve = async (tokenAddress, amount) => {
  const web3 = new Web3(window.ethereum);
  const erc20 = new web3.eth.Contract(ERC20.abi, tokenAddress);
  let ethBridgeBankAddress = BridgeBank.networks['3'].address;
  await erc20.methods.approve(ethBridgeBankAddress, amount).send();
};
