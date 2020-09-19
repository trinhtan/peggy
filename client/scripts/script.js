/** @format */

const cosmosjs = require('@cosmostation/cosmosjs');
const PEGGY_CHAIN_ID = 'peggy';
const peggy = cosmosjs.network('http://localhost:1317', PEGGY_CHAIN_ID);
const sig = require('@tendermint/sig');

const getAddressFromMnemonic = (mnemonic) => {
  try {
    const address = peggy.getAddress(mnemonic);
    return address;
  } catch (error) {
    console.log(error);
    throw Error(
      `Error cannot get cosmos account from mnemonic: ${error.message}`
    );
  }
};

const getPrivateKeyFromMnemonic = (mnemonic) => {
  try {
    const privateKey = peggy.getECPairPriv(mnemonic);
    return privateKey;
  } catch (error) {
    console.log(error);
    throw Error(`Error cannot set private key from mnemonic: ${error.message}`);
  }
};

const burnETH = (mnemonic) => {
  try {
    const address = getAddressFromMnemonic(mnemonic);
    const privateKey = getPrivateKeyFromMnemonic(mnemonic);
    // return;
    const wallet = sig.createWalletFromMnemonic(mnemonic); // BIP39 mnemonic string
    console.log(wallet);
    peggy.getAccounts(address).then((data) => {
      // return;
      const tx = {
        type: 'cosmos-sdk/StdTx',
        value: {
          fee: {
            amount: [],
            gas: '200000',
          },
          memo: '',
          signatures: null,
          msg: [
            {
              type: 'ethbridge/MsgBurn',
              value: {
                cosmos_sender: 'cosmos1l7k86et6jshyvxpk48l0g27qzdf554x0qkheud',
                amount: '100',
                symbol: 'peggyeth',
                ethereum_chain_id: '3',
                ethereum_receiver: '0xf68F0c27D90bDcde125724D390fF75b3635FF0Ab',
              },
            },
          ],
        },
      };

      const signMeta = {
        account_number: String(data.result.value.account_number),
        chain_id: 'peggy',
        sequence: String(data.result.value.sequence),
      };

      const stdTx = sig.signTx(tx, signMeta, wallet);
      console.log(JSON.stringify(stdTx));
      convertAndBroadcastMessage(peggy, stdTx, privateKey);
    });
  } catch (error) {
    console.log(error);
  }
};

const convertAndBroadcastMessage = (cosmos, stdTx, privateKey) => {
  // let convertTx = convertSignMsg(stdTx);
  let abc = {
    tx: {
      msg: [
        {
          type: 'ethbridge/MsgBurn',
          value: {
            cosmos_sender: 'cosmos1l7k86et6jshyvxpk48l0g27qzdf554x0qkheud',
            amount: '100',
            symbol: 'peggyeth',
            ethereum_chain_id: '3',
            ethereum_receiver: '0xf68F0c27D90bDcde125724D390fF75b3635FF0Ab',
          },
        },
      ],
      fee: { amount: [], gas: '200000' },
      signatures: [
        {
          signature:
            '7hKF8I+fzor5StDHMAK05Mg9L7XQ967n7T3G1De6PtwLplscvoz7k+DvVvIbwWIva6Q1NfkCrVy4v7IuWeZpuw==',
          pub_key: {
            type: 'tendermint/PubKeySecp256k1',
            value: 'An0kjE4dpcbZHDrJimdzCVjxP+TctJfkFLzTYP/XqpIA',
          },
        },
      ],
      memo: '',
    },
    mode: 'block',
  };
  cosmos.broadcast(abc).then((response) => console.log(response));
};

const convertSignMsg = (stdTx) => {
  console.log(JSON.stringify(stdTx));
  let convertTx = {};
  return;
};

// getAddressFromMnemonic(
//   'column despair mountain space report exchange style attend receive target basket master'
// );

// this.getPrivateKeyFromMnemonic(
//   'column despair mountain space report exchange style attend receive target basket master'
// );

burnETH(
  'divert electric share deny upset have aim loop error burden normal erosion coin subway ginger clay junk lend busy match general pink rude example'
);
