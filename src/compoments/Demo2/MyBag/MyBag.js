import React from 'react'
import { useEffect, useState, useRef, useContext } from 'react';
import Item from '../item/ltem'
import { Modal, Form, Button, InputNumber, message } from 'antd';
import { context } from '../../../view/Demo2/Demo2';
import { ethers } from 'ethers'
import Empty from '@/compoments/Demo2/empty/empty.js';
import Demo2Abi from '@/build/Demo2.json'
import './MyBag.css'
export default function MyBag(props) {
  const { etherInfo, initList } = useContext(context)
  const { list } = props
  const formRef = useRef(null)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showItem, setShowItem] = useState({})
  const [loading, setLoading] = useState(false)
  useEffect(() => {
  }, []);
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
    try {
      setLoading(true)
      const res = await etherInfo.demo2Contract.onSaleMethod(showItem.id, ethers.utils.parseUnits(values.price + '', 'ether')._hex)
      await res.wait()
      initList('MyBag')
      setLoading(false)
      console.log('饰品上架成功！')
      setIsModalOpen(false);
      message.success('饰品上架成功！');
    } catch (error) {
      setIsModalOpen(false);
      setLoading(false)
      message.error('上架失败，请重试');
    }
  };
  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };
  const withdrawalSaleMethod = async (item) => {
    try {
      const res = await etherInfo.demo2Contract.withdrawalSaleMethod(item.id)
      await res.wait()
      initList('MyBag')
      let onSaleListRes = await etherInfo.demo2Contract.saleListGetter()
      console.warn('下架',onSaleListRes)
      message.success('饰品下架成功！');
    } catch (error) {
      message.error('下架失败，请重试');
    }
  }
  return (
    <div className='bag-wrap'>
      {
        list.length ? <div className='bag-list'>
          {
            list.map((item,index) => {
              return (<span key={index}><Item item={item} showUpModal={showModal} withdrawalSaleMethod={withdrawalSaleMethod} listType={'MyBag'}></Item></span>)
            })
          }
        </div> : <Empty></Empty>
      }
      <div>
        <Modal footer={null} width='350px' title="上架信息" open={isModalOpen} >
          <div className='modal-main'>
            <Form
              ref={formRef}
              name="basic"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
            >
              <Form.Item
                label="价格"
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
