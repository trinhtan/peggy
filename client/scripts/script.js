const cosmosjs = require('@cosmostation/cosmosjs');
const PEGGY_CHAIN_ID = 'peggy';
const peggy = cosmosjs.network('http://localhost:1317', PEGGY_CHAIN_ID);
const tendermint = require('@tendermint/sig');

const getAddressFromMnemonic = mnemonic => {
  try {
    const address = peggy.getAddress(mnemonic);
    return address;
  } catch (error) {
    console.log(error);
    throw Error(`Error cannot get cosmos account from mnemonic: ${error.message}`);
  }
};

const getPrivateKeyFromMnemonic = mnemonic => {
  try {
    const privateKey = peggy.getECPairPriv(mnemonic);
    return privateKey;
  } catch (error) {
    console.log(error);
    throw Error(`Error cannot set private key from mnemonic: ${error.message}`);
  }
};

const burnETH = mnemonic => {
  try {
    const wallet = tendermint.createWalletFromMnemonic(mnemonic);
    const address = tendermint.createAddress(wallet.publicKey);

    peggy.getAccounts(address).then(data => {
      const signMeta = {
        account_number: String(data.result.value.account_number),
        chain_id: 'peggy',
        sequence: String(data.result.value.sequence)
      };
      const tx = {
        type: 'cosmos-sdk/StdTx',
        value: {
          msg: [
            {
              type: 'ethbridge/MsgBurn',
              value: {
                cosmos_sender: address,
                amount: '1',
                symbol: 'peggyeth',
                ethereum_chain_id: '3',
                ethereum_receiver: '0x8f287eA4DAD62A3A626942d149509D6457c2516C'
              }
            }
          ],
          fee: { amount: [], gas: '200000' },
          signatures: null,
          memo: ''
        },
        mode: 'async'
      };

      const stdTx = tendermint.signTx(tx, signMeta, wallet);
      const signedTx = convertTx(stdTx);

      // peggy.broadcast(signedTx).then(response => console.log(response));
      signAndBroadcastMessage(peggy, tx);
    });
  } catch (error) {
    console.log(error);
  }
};

const signAndBroadcastMessage = (cosmos, tx) => {
  let abc = {
    type: 'cosmos-sdk/StdTx',
    value: {
      msg: [
        {
          type: 'ethbridge/MsgCreateEthBridgeClaim',
          value: {
            ethereum_chain_id: '3',
            bridge_registry_contract_address: '0x14d268ed94340f757b253CdeBd3b3528B83aBdb1',
            nonce: '5',
            symbol: 'eth',
            token_contract_address: '0x0000000000000000000000000000000000000000',
            ethereum_sender: '0x8f287eA4DAD62A3A626942d149509D6457c2516C',
            cosmos_receiver: 'cosmos1xf5940g7mrrl00n2380cu736z89pevddw7frku',
            validator_address: 'cosmosvaloper1fy4vqc47tdfstrmrhfellnfr082s7madyvqd0u',
            amount: '100',
            claim_type: 'lock'
          }
        }
      ],
      fee: {
        amount: [],
        gas: '200000'
      },
      signatures: [
        {
          pub_key: {
            type: 'tendermint/PubKeySecp256k1',
            value: 'A/RH5esTMTZEaYeGP3AOarBLinb1+ftjCGpPKy0XBY5+'
          },
          signature:
            'cd9nTAkb7qt9KBJAiBYvrC8wuU37ptYb/0SUi50ezZ81d6St6P7lxiNik4B3JxClf+SQ5JEaI7ZDlKN3fhzHIg=='
        }
      ],
      memo: ''
    },
    mode: 'block'
  };

  // console.log(JSON.stringify(abc));
  cosmos.broadcast(abc).then(response => console.log(response));
};

const convertTx = signedTx => {
  // console.log(signedTx);
  let tx = {
    type: signedTx.type,
    value: {
      msg: signedTx.value.msg,
      fee: signedTx.value.fee,
      signatures: signedTx.signatures,
      memo: signedTx.value.memo
    },
    mode: 'async'
  };
  return tx;
};

// getAddressFromMnemonic(
//   'column despair mountain space report exchange style attend receive target basket master'
// );

// this.getPrivateKeyFromMnemonic(
//   'column despair mountain space report exchange style attend receive target basket master'
// );

burnETH('column despair mountain space report exchange style attend receive target basket master');
