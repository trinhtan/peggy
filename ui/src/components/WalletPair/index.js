import React, { useState } from 'react';
import { Row, Col } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import MetaMaskWallet from 'components/MetaMaskWallet';
import LogoutButton from 'components/LogoutButton';
import Token from 'constants/Token';
import { Modal, Button, Input } from 'antd';
import mathWallet from 'icons/mathWallet.png';
import { setReceiver, setMnemonicAction } from 'store/actions';
import * as launchpad from '@cosmjs/launchpad';
import './index.css';

function WalletPair() {
  const dispatch = useDispatch();
  const senderAddress = useSelector(state => state.senderAddress);
  const receiverAddress = useSelector(state => state.receiverAddress);
  const senderBalance = useSelector(state => state.senderBalance);
  const receiverBalance = useSelector(state => state.receiverBalance);
  const senderToken = useSelector(state => state.senderToken);
  const token = Token.find(e => e.address === senderToken);

  const [mnemonic, setMnemonic] = useState('');
  const [visible, setVisible] = useState(false);

  const loginPeggy = () => {
    setVisible(true);
  };
  const handleOk = async () => {
    console.log('ok');
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
      setVisible(false);
    } catch (e) {
      console.error(e);
    }
  };
  const handleCancel = () => {
    console.log('cancel');
    setVisible(false);
  };
  const insertMnemonic = e => {
    setMnemonic(e.target.value);
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
      <Modal title='Insert Mnemonic' visible={visible} onOk={handleOk} onCancel={handleCancel}>
        <p>Some contents...</p>
        <Input placeholder='Basic usage' onChange={insertMnemonic} />
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
