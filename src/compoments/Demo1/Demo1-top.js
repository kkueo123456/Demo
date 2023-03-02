import React from 'react'
import './Demo1-top.css'
// import Button from '@material-ui/core/Button';
import { message, Card, Form, Input, Button, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useEffect, useState, useRef } from 'react';
import { ethers, utils } from 'ethers'
import { Link } from 'react-router-dom'
import { CreditCardOutlined } from '@ant-design/icons';
import axios from 'axios'
export default function Demo1Top(props) {
    const { account, initEthers, etherInfo, getList } = props
    const formRef = useRef(null)
    const [loading, setLoading] = useState(false)
    const antIcon = (
        <LoadingOutlined
            style={{
                fontSize: 24,
            }}
            spin
        />)
    const connectWallet = async () => {
        const { ethereum } = window
        if (!window.ethereum) {
            message.error('请先安装metamask');
            return
        }
        try {
            const account = await ethereum.request({ method: 'eth_requestAccounts' })
            if (account.length) {
                // dispatch(setAccount(account[0]))
                initEthers()
            }
        } catch (error) {
            message.error(error.message);
            console.error(error)
        }
    }
    useEffect(() => {

        if (etherInfo) {
            initList()
        }
    }, [etherInfo]);
    const initList = async () => {
        // console.log(etherInfo.demo1Contract)
        // const res = await etherInfo.demo1Contract.getInfoMapping()
        // console.warn('res', res)

    }
    const handleText = (str) => {
        str ??= ''
        return str.substr(0, 5) + '.....' + str.substr(-5)
    }
    const onFinish = async (values) => {
        // console.log('Success:', values, state);
        const { ethereum } = window
        const { demo1Contract, signer } = etherInfo
        if (!ethereum) return
        try {
            console.log(ethers.utils.parseEther(values.amount)._hex + '')
            // let params = [{
            //     "from": account,
            //     "to": values.recipient,
            //     "gas": "0x5208", // 21000，
            //     // 将eth类型转成wei类型
            //     value: ethers.utils.parseUnits(values.amount, 'ether')._hex
            // }];
            // const gifInfo = await axios.get(`https://api.giphy.com/v1/gifs/search?api_key=eMPhvX5jeWEtOcLrwiqhN5zqi9K80boe&q=${encodeURIComponent(values.keyword)}&limit=1&offset=0&rating=g&lang=zh-CN`)
            // console.warn(gifInfo?.data?.data[0]?.images?.downsized_medium?.url)
            setLoading(true)
            console.log('value',ethers.utils.parseUnits(values.amount + '', 18)._hex)
            await signer.sendTransaction({ to: values.recipient, value: ethers.utils.parseUnits(values.amount + '', 18)._hex, gasLimit: '0x5208' })
            const demo1Hash = await demo1Contract.setInfoArray(values.recipient, ethers.utils.parseUnits(values.amount + '', 18)._hex, values.message, values.keyword)
            await demo1Hash.wait()
            const infoList = await demo1Contract.getInfoMapping()
            setLoading(false)
            console.log(infoList, 'infoList')
            getList()
            formRef.current.resetFields()

        } catch (error) {
            message.error(error.message);
            console.error(error)
            setLoading(false)
        }
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    return (
        <div className='demo-top-wrap'>
            <div className='demo-top-left'>
                <div className='left-title'>
                    Welcome !
                    <br />
                    send your transaction in this demo
                </div>
                <div className='left-btn'>
                    {
                        account ? (<Button style={{ background: 'rgb(26,28,48)', color: '#1677ff', borderColor: '#1677ff' }} variant="outlined" color="primary">
                            已连接metamask账户
                        </Button>) : (<Button onClick={connectWallet} style={{ background: 'rgb(26,28,48)', color: 'rgb(245, 239, 239)' }} variant="contained" color="primary">
                            Connect Wallet
                        </Button>)
                    }
                </div>
                <div className='left-other'>
                    <div>
                        <Link to='https://reactjs.org/'>React.js</Link>
                        <Link to='https://ant.design/components/message-cn'>Antd</Link>
                        <Link to='https://learnblockchain.cn/ethers_v5/getting-started/'>Ether.js</Link>
                    </div>
                    <div>
                        <Link >Web3.0</Link>
                        <Link >MetaMask</Link>
                        <Link>BlockChain</Link>
                    </div>
                </div>
            </div>
            <div className='demo-top-right'>
                <Card title={''} bordered={false}>
                    <CreditCardOutlined style={{ color: 'white', fontSize: '20px' }} />
                    <div className='account' title={account}>{handleText(account)}</div>
                    <span className='ethereum'>Ethereum</span>
                </Card>
                <div className='demo-top-right-bottom'>
                    <Form
                        ref={formRef}
                        name="basic"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        style={{ maxWidth: 600 }}
                        initialValues={{ remember: false }}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                    >
                        <Form.Item
                            name="recipient"
                            rules={[{ required: true, message: 'Please input your Address To!' }]}
                        >
                            <Input id="public-input" placeholder='Address To' />
                        </Form.Item>

                        <Form.Item
                            name="amount"
                            rules={[{ required: true, message: 'Please input your Amount!' }]}
                        >
                            <Input id="public-input" placeholder='Amount(ETH)' />
                        </Form.Item>
                        <Form.Item
                            name="keyword"
                            rules={[{ required: true, message: 'Please input your keyword!' }]}
                        >
                            <Input id="public-input" placeholder='Keyword(Gif)' />
                        </Form.Item>
                        <Form.Item
                            name="message"
                            rules={[{ required: true, message: 'Please input your message!' }]}
                        >
                            <Input id="public-input" placeholder='Enter Message' />
                        </Form.Item>
                        <Form.Item >
                            {
                                loading ? <Spin indicator={antIcon} /> : <Button htmlType="submit" style={{ background: 'rgb(26,28,48)', width: '90%', color: '#ccc' }} variant="contained" color="primary" >
                                    Send Now
                                </Button>
                            }

                        </Form.Item>
                    </Form>
                </div>
            </div>
        </div >
    )
}
