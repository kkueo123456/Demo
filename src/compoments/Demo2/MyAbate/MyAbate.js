import React from 'react'
import { Space, Table, Radio, Modal, message } from 'antd';
import { useEffect, useState, useContext } from 'react';
import { context } from '../../../view/Demo2/Demo2';
import './MyAbate.css'
import axios from 'axios';
import publicObj from '@/config/public.js'
import { ethers } from 'ethers'
import Web3 from 'web3';
import { handleText } from '@/config/utils.js'
export const getInAbatePriceIdList = async (contract, address) => {
  let res = await contract.abatePriceGetter()
  let arr = res.reduce((firArr, item) => {
    if (item.owner === address) {
      firArr.push(parseInt(item.id, 16))
    }
    return firArr
  }, [])
  return arr
}

export default function MyAbate(props) {
  const { etherInfo, setWalletFn } = useContext(context)
  const [value, setValue] = useState(5);
  const { list } = props
  const [allAbate, setAllabate] = useState([])
  const [data, setData] = useState([])
  const [finalData, setFinalData] = useState([])
  const [loading, setLoading] = useState(false)
  const [other, setOther] = useState(0)
  const statusMap = {
    0: '还价中',
    1: '还价成功',
    2: '还价失败',
  }
  useEffect(() => {
    initData()
  }, [])
  useEffect(() => {
    onChange(5)
  }, [allAbate])
  const initData = async () => {
    setLoading(true)
    list.forEach((item, index) => {
      item && handleItem(item)
    })
    setData(list)

    setLoading(false)
    await getInAbatePriceIdListFn()

  }
  const handleBigNumber = (val) => {
    return parseInt(val._hex, 16)
  }
  const handleItem = async (item) => {
    const { demo2Contract, address } = etherInfo
    let tokenUri = await demo2Contract.tokenURI(handleBigNumber(item.id))
    let res = await axios({
      // url: publicObj.nftStorageAds + publicObj.nftJsonCid + '/' + item.id + '.json',
      url: tokenUri,
      timeout: 180000
    })
    let successRes = await demo2Contract.queryFilter('acceptAbatePriceEv', address)
    let errorRes = await demo2Contract.queryFilter('refuseBargainEv', address)
    try {
      let successResArr = successRes.map(itm => handleBigNumber(itm.id))
      let errorResArr = errorRes.map(itm => handleBigNumber(itm.id))

      if (res.status === 200) {
        item.id = handleBigNumber(item.id)
        item.onSalePrice = handleBigNumber(item.onSalePrice)
        item.price = handleBigNumber(item.price)
        item.name = res.data.name;
        item.image = res.data.image;
        // 
        item.status = successResArr.includes(item.id) ? 1 : errorResArr.includes(item.id) ? 2 : 0
      }
      setOther(Math.random())
    } catch (error) {
      console.error(error)
    }
    return item
  }
  const getInAbatePriceIdListFn = async () => {
    const { demo2Contract, address } = etherInfo
    let res = await demo2Contract.abatePriceGetter()
    let arr = res.reduce((firArr, item) => {
      if (item.owner === address) {
        let obj = { ...item, key: handleBigNumber(item.id) }
        handleItem(obj)
        firArr.push(obj)
      }
      return firArr
    }, [])

    setAllabate(arr)
  }
  const onChange = async (e) => {
    let arr = []
    switch (e) {
      case 4:
        arr = data.filter(item => item.status === 0)
        break;
      case 5:
        arr = allAbate
        break;
      default:
        if ([2, 3].includes(e)) {
          arr = data.filter(item => item.status === e - 1)
        } else {
          arr = data
        }
        break;
    }
    setValue(e);
    console.log(arr)
    setFinalData(arr)
  };
  const agreeAbate = async (item) => {
    publicFn(item, true)
  }
  const publicFn = (item, type) => {
    Modal.confirm({
      content: `确认${type ? '接受' : '拒绝'}该还价么？`,
      okText: "确认",
      cancelText: '取消',
      async onOk() {
        const { demo2Contract, address } = etherInfo
        try {
          setLoading(true)
          let price = item.price
          let onSalePrice = item.onSalePrice
          let res
          if (type) {
            res = await demo2Contract.acceptAbatePrice(item.id, item.buyer, Web3.utils.numberToHex(price), Web3.utils.numberToHex(onSalePrice))
          } else {
            res = await demo2Contract.refuseBargain(item.id, item.buyer, Web3.utils.numberToHex(price), Web3.utils.numberToHex(onSalePrice), '拒绝')
          }
          await res.wait()
          setWalletFn(address, demo2Contract)
          await getInAbatePriceIdListFn()
          onChange(5)
          setLoading(false)
        } catch (error) {
          message.error(error)
        }
      },
      onCancel() {
        message.error('用户取消操作');
      },
    });
  }
  const disAgreeAbate = (item) => {
    publicFn(item, false)
  }
  const columns = [
    {
      title: '饰品信息',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => {
        return (<div className='abate-item-info'>
          <div className='abate-item-info-img'>
            <img src={record.image} alt=''></img>
          </div>
          <div className='abate-item-info-text'>{record.name}</div>
        </div>)
      },
    },

    {
      title: '饰品所有者',
      dataIndex: 'owner',
      key: 'owner',
      render: (text) => <span title={text}>{text === etherInfo.address ? '本账户' : handleText(text + '')}</span>,
    },
    {
      title: '买家',
      dataIndex: 'buyer',
      key: 'buyer',
      render: (text) => <span title={text}>{text === etherInfo.address ? '本账户' : handleText(text + '')}</span>,
    },
    {
      title: '在售价格',
      dataIndex: 'onSalePrice',
      key: 'onSalePrice',
      render: (text) => <span>{text && ethers.utils.formatEther(text + '')} ETH</span>,
    },
    {
      title: '还价价格',
      dataIndex: 'price',
      key: 'price',
      render: (text) => <span>{text && ethers.utils.formatEther(text + '')} ETH</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text) => <span>{statusMap[text]}</span>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <div>
          {
            value === 5 ? <Space size="middle">
              <span className='agree' onClick={() => { agreeAbate(record) }}>接受</span>
              <span className='disAgree' onClick={() => { disAgreeAbate(record) }}>拒绝</span>
            </Space> : <div></div>
          }
        </div>
      ),
    },
  ];
  return (
    <div className='abate-wrap'>
      <div className='abate-wrap-head'>
        <Radio.Group onChange={(e) => { onChange(e.target.value) }} value={value}>
          {/* <Radio value={1}>我发起的</Radio> */}
          <Radio value={2}>还价成功</Radio>
          <Radio value={3}>还价失败</Radio>
          <Radio value={4}>还价中</Radio>
          <Radio value={5}>待处理的还价</Radio>
        </Radio.Group>
      </div>
      <div className='abate-wrap-main'>
        <Table pagination={false} loading={loading} columns={columns} dataSource={finalData} />
      </div>
    </div>
  )
}
