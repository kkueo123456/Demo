import React from 'react'
import { useEffect, useState, useRef, useContext } from 'react';
import csLogo from '@/assets/img/cs_logo.png'
import { context } from '@/view/Demo2/Demo2.js'
import axios from 'axios';
import publicObj from '@/config/public.js'
import { Modal, message } from 'antd';
import { Button } from '@material-ui/core';
import './item.css'
export default function MyBag(props) {
    const { item, showUpModal, withdrawalSaleMethod, listType, buyItem, abateItem } = props
    const { etherInfo } = useContext(context)
    const [info, setInfo] = useState({})
    const [loading, setLoading] = useState(false)
    const [statusInfo, setStatusInfo] = useState({
        0: '未出售',
        1: '出售中',
        2: '还价中'
    })
    useEffect(() => {
        initItem()
    }, [])
    const handleText = (str) => {
        str ??= ''
        return str.substr(0, 3) + '...' + str.substr(-3)
    }
    const initItem = async () => {
        const { demo2Contract } = etherInfo
        let tokenUri = await demo2Contract.tokenURI(item.id)
        let res = await axios({
            // url: publicObj.nftStorageAds + publicObj.nftJsonCid + '/' + item.id + '.json',
            url: tokenUri,
            timeout: 180000
        })
        if (res.status === 200) {
            let tokenInfo = res.data
            item.name = tokenInfo.name
            item.img = publicObj.ipfsAds + tokenInfo.image.split('/')[tokenInfo.image.split('/').length - 1]
            item.weight = tokenInfo.attributes[0].value
            item.isOwner = etherInfo.address === item.owner
            setInfo(item)
            // console.error('请求完成', item,listType)
        }

    }
    const showUpModalFn = async (item) => {
        if (loading) return
        setLoading(true)
        await showUpModal(item)
        setLoading(false)
    }
    const withdrawalFn = (item) => {
        if (loading) return
        setLoading(true)
        Modal.confirm({
            content: '确认要下架该饰品么？',
            okText: "确认",
            cancelText: '取消',
            async onOk() {
                await withdrawalSaleMethod(item)
                setLoading(false)
            },
            onCancel() {
                message.error('用户取消下架');
                setLoading(false)
            },
        });
    }
    const buyFn = async (item) => {
        setLoading(true)
        await buyItem(item)
        setLoading(false)
    }
    const abatePriceFn = async (item) => {
        setLoading(true)
        await abateItem(item)
        setLoading(false)
    }
    return (
        <div className='item-wrap'>
            <span className='item-name' title={info.name}>{info.name}</span>
            <div className={['list-item', 'color-' + info.weight].join(' ')} >
                <div className='item-left'>
                    <img className='cs-img' alt='' src={info.img} ></img>
                    <img className='cs-logo' alt='' src={csLogo}></img>
                </div>
                <div className='item-right'>
                    {
                        listType === 'MyBag' ? <div>
                            <p className='price'>预估价 : {info.price} ETH</p>
                            <p className={['status'].join(' ')}>状态 : <span className={'status-' + info.status}>{statusInfo[info.status]}</span> </p>
                            {
                                info.status === 1 ? <p>售价 : <span className={'status-' + info.status}>{info.onSalePrice} ETH</span></p> : null
                            }
                            <p className='percent'>稀有度 : {info.weight / 100} %</p>
                            {
                                info.status === 1 ? <Button onClick={() => { withdrawalFn(info) }} size="small" variant="contained" className='btn btn-down'>
                                    {loading ? '下架中' : '下架'}
                                </Button> : info.status === 2 ? <Button size="small" variant="contained" style={{ backgroundColor: 'rgb(220,0,78)' }} className='btn'>
                                    还价中
                                </Button> : <Button onClick={() => { showUpModalFn(info) }} size="small" variant="contained" className='btn btn-up'>
                                    {loading ? '上架中' : '上架'}
                                </Button>
                            }

                        </div> : <div className='sale-item'>
                            <p>售价 : <span className={'status-' + info.status}>{info.onSalePrice} ETH</span></p>
                            <p title={info.owner}>卖家 : {handleText(info.owner)}</p>
                            {info.isOwner ? <Button onClick={() => { withdrawalFn(info) }} size="small" variant="contained" className='btn btn-down'>
                                {loading ? '下架中' : '下架'}
                            </Button> : <div>
                                <Button onClick={() => { buyFn(info) }} style={{ marginBottom: '8px' }} size="small" variant="contained" className='btn btn-buy'>
                                    购买
                                </Button>
                                <Button onClick={() => { abatePriceFn(info) }} size="small" variant="contained" className='btn btn-up'>
                                    还价
                                </Button>
                            </div>}
                        </div>
                    }
                </div>
            </div>
        </div >
    )
}
