import React from 'react'
import './Demo1-bottom.css'
// import Button from '@material-ui/core/Button';
import { message, Card, Form, Input, Button, Spin } from 'antd';
import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { ethers, utils } from 'ethers'
import useFeach from '../../hooks/useFeach';
function Demo1Top(props, ref) {
    const { account, initEthers, etherInfo } = props
    const formRef = useRef(null)
    const [listArr, setListArr] = useState([])
    const { Meta } = Card;
    const handleText = (str) => {
        str ??= ''
        return str.substr(0, 5) + '....' + str.substr(-5)
    }
    useImperativeHandle(ref, () => ({
        getInfo: () => {
            init()
        }
    }))
    useEffect(() => {
        if (etherInfo) {
            init()
        }
    }, [etherInfo]);
    const init = async () => {
        const res = await etherInfo.demo1Contract.getInfoMapping()
        let arr = res.map(item => {
            return {
                amount: item.amount,
                sender: item.sender,
                recipient: item.recipient,
                keyword: item.keyword,
                message: item.message,
                timestamp: new Date(parseInt(item.timestamp._hex, 16) * 1000).toLocaleDateString()
            }
        })
        setListArr(arr)
        console.warn(arr, res)
    }
    return (
        <div className='demo-bottom-wrap'>
            <h2>Latest Transactions</h2>
            <div className='card-list'>
                {
                    listArr.map((item, index) => {
                        return (<CardItem key={index} item={item} handleText={handleText}></CardItem>)
                    })
                }
                {/* <Card
                    hoverable
                    style={{ width: 240 }}
                    cover={<img alt="example" src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png" />}
                >
                    <Meta title="Europe Street beat" description="www.instagram.com" />
                </Card> */}
            </div>
        </div >
    )
}
const CardItem = (props) => {
    const { item, handleText } = props
    const imgUrl = useFeach({ keyword: item.keyword })
    return (<div className='card-item' >
        <div className='card-info'>
            <p>from : &nbsp;<span>{handleText(item.sender)}</span></p>
            <p>to : &nbsp;<span>{handleText(item.recipient)}</span></p>
            <p>Amount : &nbsp;<span>{ethers.utils.formatEther(item.amount)} ETH</span></p>
        </div>
        <p className='time-stamp'>{item.timestamp}</p>
        <img alt="example" src={imgUrl} />
    </div>)
}
export default forwardRef(Demo1Top)