import React from 'react'
import { useEffect, useState, useRef, useContext } from 'react';
import Item from '../item/ltem'
import { Modal, Form, Button, InputNumber, message } from 'antd';
import { context } from '../../../view/Demo2/Demo2';
import { ethers } from 'ethers'
import Empty from '@/compoments/Demo2/empty/empty.js';
import Demo2Abi from '@/build/Demo2.json'
import { parseUnits } from 'ethers/lib/utils';

import './GoodList.css'
export default function GoodList(props) {
  const { etherInfo, initList,setWalletFn } = useContext(context)
  const { list } = props
  const formRef = useRef(null)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showItem, setShowItem] = useState({})
  const [loading, setLoading] = useState(false)
  const [showList, setShwoList] = useState([])
  useEffect(() => {
    setShwoList(list)
  }, [list]);
  const showModal = (item) => {
    setShowItem(() => {
      return { ...item }
    })
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
    formRef.current.resetFields()
  };
  const onFinish = async (values) => {
    const { demo2Contract, address } = etherInfo
    const savePrice = await demo2Contract.ethGetter(address)
    if (parseInt(savePrice) < values.price * 1) {
      message.error('合约内余额不足，请充值后再试');
      return
    }
    try {
      setLoading(true)
      const res = await demo2Contract.abatePrice(showItem.id, ethers.utils.parseUnits(values.price + '', 'ether')._hex, showItem.owner)
      await res.wait()
      initList('GoodList')
      setLoading(false)
      setIsModalOpen(false);
      setWalletFn(address, demo2Contract)
      message.success('发起还价成功');
    } catch (error) {
      setIsModalOpen(false);
      setLoading(false)
      message.error('发起还价失败，请重试');
    }
  };
  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };
  const withdrawalSaleMethod = async (item) => {
    try {
      const res = await etherInfo.demo2Contract.withdrawalSaleMethod(item.id)
      await res.wait()
      initList('GoodList')
      message.success('饰品下架成功！');
    } catch (error) {
      message.error('下架失败，请重试');
    }
  }
  const buyItem = async (item) => {
    const { demo2Contract, address } = etherInfo
    const res = await demo2Contract.ethGetter(address)
    if (parseInt(res) < item.onSalePrice * 1) {
      message.error('余额不足');
      return
    }
    try {
      const purchaseRes = await demo2Contract.purchaseMethod(address, item.owner, item.id, parseUnits(item.onSalePrice + '', 18), 'inSalesArr')
      await purchaseRes.wait()
      initList('GoodList')
    } catch (error) {

    }
  }
  const abateItem = async (item) => {
    showModal(item)
    // const res = await demo2Contract.abatePrice(item.id,item)
  }
  return (
    <div className='bag-wrap'>
      {
        showList.length ? <div className='bag-list'>
          {
            showList.map((item, index) => {
              return (<span key={index}><Item item={item} buyItem={buyItem} showUpModal={showModal} withdrawalSaleMethod={withdrawalSaleMethod} listType={'GoodList'} abateItem={abateItem}></Item></span>)
            })
          }
        </div> : <Empty></Empty>
      }
      <div>
        <Modal footer={null} width='350px' title="还价信息" open={isModalOpen} >
          <div className='modal-main'>
            <Form
              ref={formRef}
              name="basic"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
            >
              <Form.Item
                label="还价价格"
                name="price"
                rules={[
                  {
                    required: true,
                    message: '请输入价格！',
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
                <Button loading={loading} type="primary" htmlType="submit" style={{ border: '1px solid rgb(20,188,62)', backgroundColor: 'rgb(13,16,26)' }}>
                  提交
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Modal>
      </div>
    </div >
  )
}
