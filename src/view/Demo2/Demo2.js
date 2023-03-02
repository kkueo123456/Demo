import React from 'react'
import './Demo2.css'
import { useEffect, useState, useRef, createContext } from 'react';
import GoodList from '@/compoments/Demo2/GoodList/GoodList.js'
import MyBag from '@/compoments/Demo2/MyBag/MyBag.js'
import MyAbate from '@/compoments/Demo2/MyAbate/MyAbate.js'
import { AppstoreFilled, ShopFilled, GoldenFilled, UserOutlined, CreditCardOutlined, MessageOutlined } from '@ant-design/icons';
import addressObj from '@/config/address.js'
import Demo2Abi from '@/build/Demo2.json'
import { Menu, message, Avatar, Button, Modal, Form, InputNumber, Tooltip } from 'antd';
import { ethers } from 'ethers'
import Swiper from '../../compoments/Demo2/Swiper/Swiper';
import Loading from '../../compoments/Demo2/loading/loading';
import { getInAbatePriceIdList } from '@/compoments/Demo2/MyAbate/MyAbate.js';
import { parseUnits } from 'ethers/lib/utils';
const context = createContext(null)
export { context }
export default function Demo2() {
  const [account, setAccount] = useState('')
  const [wallet, setWallet] = useState(0)
  const [etherInfo, setEtherInfo] = useState(null)
  const [compName, setCompName] = useState('GoodList')
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [ethLoading, setEthLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecharge, setIsRecharge] = useState(false)
  const formRef = useRef(null)
  const [msgNumber, setMsgNumber] = useState(0)
  useEffect(() => {
    init()
  }, [])
  const init = async () => {
    const { ethereum } = window
    if (!window.ethereum) {
      message.error('请先安装metamask');
      return
    }
    const acct = await ethereum.request({ method: 'eth_accounts' })
    try {
      if (acct.length) {
        setAccount(acct[0])
      } else {
        const reqAcct = await ethereum.request({ method: 'eth_requestAccounts' })
        setAccount(reqAcct[0])
      }
      initEthers()
    } catch (error) {
      message.error(error.message);
    }
    // 账号改变时触发
    ethereum.on('accountsChanged', function (accounts) {
      console.log('accountsChanged', accounts)
      window.location.reload()
      // setAccount(accounts[0] ?? '')
      // initEthers()
    })
  }
  const initEthers = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = await provider.getSigner()
    const address = await signer.getAddress()
    const demo2Contract = new ethers.Contract(addressObj.Demo2Address, Demo2Abi.abi, signer);
    let obj = {
      provider,
      signer,
      address,
      demo2Contract,
    }
    setEtherInfo(obj)
    setWalletFn(address, demo2Contract)
    initList('GoodList', obj)
    requestListInterval(obj)
  }
  const meunList = [
    {
      label: '在售商品',
      key: 'GoodList',
      icon: <ShopFilled />,

    },
    {
      label: '我的背包',
      key: 'MyBag',
      icon: <AppstoreFilled />,
    }, {
      label: '还价管理',
      key: 'MyAbate',
      icon: <GoldenFilled />,
    },
  ];
  const handleText = (str) => {
    str ??= ''
    return str ? str.substr(0, 5) + '.....' + str.substr(-5) : '未登录'
  }
  const clickMenu = (itm) => {
    setCompName((v) => {
      return itm.key
    })
    // const 
    initList(itm.key)
  }
  const handleBigNumber = (val) => {
    return parseInt(val._hex, 16)
  }
  const requestListInterval = async (obj) => {
    const { demo2Contract, address } = obj
    let num = await getInAbatePriceIdList(demo2Contract, address)
    setMsgNumber(() => { return num.length })
    requestAnimationFrame(() => { requestListInterval(obj) })
  }
  const jumpAbate = () => {
    if(!msgNumber){
      message.error('无待处理的还价!')
      return
    }
    clickMenu({ key: 'MyAbate' })
  }
  const initList = async (name, info) => {
    setList([])
    let infoObj = etherInfo ?? info
    const { demo2Contract, address } = infoObj
    let onSaleListRes = await demo2Contract.saleListGetter()
    setLoading(true)
    let onSaleList = onSaleListRes.map(item => {
      console.warn(item)
      return {
        id: handleBigNumber(item.id),
        onSalePrice: ethers.utils.formatEther(item.price),
        owner: item.owner,
        state: handleBigNumber(item.state)
      }
    })
    if (name === 'MyBag') {
      let res = await demo2Contract.userItemListMapGetter(address)
      let myAbateArr = await getInAbatePriceIdList(demo2Contract, address)
      let arr = []
      arr = res.map(item => {
        let id = handleBigNumber(item.id)
        let state = handleBigNumber(item.state)
        let price = handleBigNumber(item.price)
        let status = onSaleList.map(itm => itm.id).includes(id) ? 1 : myAbateArr.includes(id) ? 2 : 0;
        let findItm = onSaleList.find(itm => id === itm.id)
        return {
          id,
          state,
          price,
          owner: item.owner,
          status,
          onSalePrice: findItm?.onSalePrice || 0
        }
      })
      setList(arr)
    } else if (name === 'GoodList') {
      setList(onSaleList)
    } else if (name === 'MyAbate') {
      let res = await demo2Contract.userInAbatePriceGetter(address)
      let arr = res.map(item => {
        return {
          ...item,
          key: handleBigNumber(item.id)
        }
      })
      setList(arr)
    }
    setLoading(false)
    console.error('finarr', onSaleList, 'onSaleList', onSaleListRes)
  }
  const setWalletFn = async (address, contract) => {
    const res = await contract.ethGetter(address)
    const price = ethers.utils.formatEther(res)
    setWallet(price)
  }
  const setEth = async (values) => {
    setEthLoading(true)
    if (ethLoading) return
    const { demo2Contract, address } = etherInfo
    try {
      let res;
      if (isRecharge) {
        console.warn(parseUnits(values.price + '', 18))
        res = await demo2Contract.setEthInContract({
          from: address,
          value: parseUnits(values.price + '', 18)
        })
      } else {
        res = await demo2Contract.withdrawalEth(parseUnits(values.price + '', 18)._hex)
      }
      await res.wait()
      setWalletFn(address, demo2Contract)
      setIsModalOpen(false)
      setEthLoading(false)
      formRef.current.resetFields()
    } catch (error) {
      setIsModalOpen(false)
      setEthLoading(false)
      message.error((isRecharge ? '充值' : '提现') + '失败，请重试！');
    }
  }
  const onFinishFailed = () => {

  }
  const handleCancel = () => {
    setIsModalOpen(false)
    setEthLoading(false)
    formRef.current.resetFields()
  }
  const openModal = (isRecharge) => {
    setIsModalOpen(true)
    setIsRecharge(isRecharge)
  }
  const mintItem = async () => {
    const { demo2Contract, address } = etherInfo
    for (let i = 1; i <= 17; i++) {
      let tokenUri = await demo2Contract.mint(`https://bafybeiapgcjztbtaw6fkz7elgicj2pkydaaqgt3su5tzzxzhghq2wti5aq.ipfs.nftstorage.link/${i}.json`, i)
      console.warn(tokenUri)

    }
    // let res = await demo2Contract.queryFilter('acceptAbatePriceEv', address)
  }
  return (
    <div className='demo2-wrap'>
      <Swiper></Swiper>
      <div className='demo2-main'>
        <Menu defaultSelectedKeys='GoodList' selectedKeys={compName} mode="horizontal" onClick={clickMenu} items={meunList} />
        <div className='user-info'><span className='info-item'> <Avatar shape="square" size="small" icon={<UserOutlined title={account} />} /> : &nbsp;{handleText(account)}</span>
          <span className='info-item'><CreditCardOutlined />&nbsp; : &nbsp;{wallet}&nbsp;ETH
            <span className='wallet-info'>
              <span onClick={() => { openModal(true) }}>充值</span>
              &nbsp;&nbsp;
              <span onClick={() => { openModal(false) }}>提现</span>
              {/* &nbsp;&nbsp; */}
              {/* <span onClick={() => { mintItem() }}>构建</span> */}
            </span>
          </span>
        </div>
      </div>
      {
        loading ? <Loading></Loading> : <context.Provider value={{ etherInfo, initList, setWalletFn }}>
          <div className='demo2-body'>
            {
              compName === 'GoodList' ? <GoodList list={list}></GoodList> : compName === "MyBag" ? <MyBag list={list}></MyBag> : <MyAbate list={list}></MyAbate>
            }
          </div>
        </context.Provider>
      }
      <Modal footer={null} width='350px' title={(isRecharge ? '充值' : '提现') + '信息'} open={isModalOpen} >
        <div className='modal-main'>
          {
            isRecharge ? null : <span style={{ color: 'rgb(249,10,10)', display: 'inline-block', fontSize: '12px', marginBottom: '8px' }}>提现会收取2%的手续费</span>
          }
          <Form
            ref={formRef}
            name="basic"
            onFinish={setEth}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item
              label="数额"
              name="price"
              rules={[
                {
                  required: true,
                  message: '请输入数额！',
                },
              ]}
            >
              <InputNumber min={0} max={10} step={0.1} />
            </Form.Item>

            <Form.Item
              className='form-button-wrap'
            >
              <Button type="primary" onClick={handleCancel} style={{ border: '1px solid white', backgroundColor: 'rgb(13,16,26)' }} >
                取消
              </Button>
              <Button loading={ethLoading} type="primary" htmlType="submit" style={{ border: '1px solid rgb(20,188,62)', backgroundColor: 'rgb(13,16,26)' }}>
                提交
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
      <div className='float-button-wrap'>
        <div className='float-button' onClick={jumpAbate}>
          <Tooltip placement="left" title={`有${msgNumber}条待处理的还价，点击跳转查看`}>
            <MessageOutlined />
            {
              msgNumber ? <span className='float-number'>{msgNumber}</span> : null
            }
          </Tooltip>
        </div>

      </div>

    </div>
  )
}

