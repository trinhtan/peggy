import React, { useState } from 'react';
import { Row, Col } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import MetaMaskWallet from 'components/MetaMaskWallet';
import LogoutButton from 'components/LogoutButton';
import Token from 'constants/Token';
import { Modal, Button, Input } from 'antd';
import mathWallet from 'icons/cosmos.png';
import { setReceiver, setMnemonicAction } from 'store/actions';
import * as launchpad from '@cosmjs/launchpad';
import './index.css';
const bip39 = require('bip39');

function WalletPair() {
  const dispatch = useDispatch();
  const senderAddress = useSelector(state => state.senderAddress);
  const receiverAddress = useSelector(state => state.receiverAddress);
  const senderBalance = useSelector(state => state.senderBalance);
  const receiverBalance = useSelector(state => state.receiverBalance);
  const senderToken = useSelector(state => state.senderToken);
  const token = Token.find(e => e.address === senderToken);

  const [mnemonic, setMnemonic] = useState('');
  const [newMnemonic, setNewMnemonic] = useState('');
  const [insertMnemonicVisible, setInsertMnemonicVisible] = useState(false);
  const [newMnemonicVisible, setNewMnemonicVisible] = useState(false);

  const loginPeggy = () => {
    setInsertMnemonicVisible(true);
  };

  const handleInsertMnemonicOk = async () => {
    try {
      dispatch(setMnemonicAction(mnemonic));
      let wallet = await launchpad.Secp256k1Wallet.fromMnemonic(
        mnemonic,
        launchpad.makeCosmoshubPath(0),
        'cosmos'
      );
      dispatch(setReceiver(wallet.address));
      console.log(wallet.address);

      let account = await wallet.getAccounts();
      console.log('account', account);
      setInsertMnemonicVisible(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleInsertMnemonicCancel = () => {
    setInsertMnemonicVisible(false);
  };

  const handleNewMnemonicCancel = () => {
    setNewMnemonicVisible(false);
    setInsertMnemonicVisible(true);
  };

  const insertMnemonic = e => {
    setMnemonic(e.target.value);
  };

  const genNewMnemonic = () => {
    let mnem = bip39.generateMnemonic();
    setNewMnemonic(mnem);
    setInsertMnemonicVisible(false);
    setNewMnemonicVisible(true);
  };

  let sender;
  senderAddress
    ? (sender = (
        <div>
          {senderAddress} <LogoutButton isSender={true} />
          <br />
          <img src={token.src} width={'20px'} alt={token.name}></img>
          {'  ' + senderBalance}
        </div>
      ))
    : (sender = <MetaMaskWallet isSender={true}></MetaMaskWallet>);

  let receiver;
  receiverAddress
    ? (receiver = (
        <div>
          {receiverAddress} <LogoutButton isSender={false} />
          <br />
          <img src={token.src} width={'20px'} alt={token.name}></img>
          {'  ' + receiverBalance}
        </div>
      ))
    : (receiver = (
        <Button type='dashed' shape='round' size='large' onClick={() => loginPeggy()}>
          <img src={mathWallet} width={'120px'} alt='mathwallet'></img>
        </Button>
      ));

  return (
    <div className='wallet-pair'>
      <Modal
        title='Insert Mnemonic'
        visible={insertMnemonicVisible}
        onCancel={handleInsertMnemonicCancel}
        footer={[
          <Button key='NewMnemonic' onClick={genNewMnemonic}>
            New Mnemonic
          </Button>,
          <Button key='Oke' type='primary' onClick={handleInsertMnemonicOk}>
            Oke
          </Button>
        ]}
      >
        <p>Fill your mnemonic:</p>
        <Input placeholder='Basic usage' onChange={insertMnemonic} />
      </Modal>
      <Modal
        title='Please copy and store it safely!'
        visible={newMnemonicVisible}
        onCancel={handleNewMnemonicCancel}
        footer={[]}
      >
        <p>{newMnemonic}</p>
      </Modal>
      <Row gutter={[8, 8]}>
        <Col span={9} className='wallet-left'>
          <div className='wallet-type'>Ethereum</div>
          {sender}
        </Col>

        <Col span={9} offset={6} className='wallet-right'>
          <div className='wallet-type'>Peggy chain</div>
          {receiver}
        </Col>
      </Row>
    </div>
  );
}

export default WalletPair;
