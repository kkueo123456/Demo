import React, { createRef } from 'react'
import './Demo1.css'
import Demo1Top from '@/compoments/Demo1/Demo1-top'
import Demo1Bottom from '@/compoments/Demo1/Demo1-bottom'
import { ethers } from 'ethers'
import { useEffect, useState,useRef } from 'react';
import demo1Abi from '@/build/Demo1.json'
import addressObj from '@/config/address.js'
export default function Demo1() {
    const [account, setAccount] = useState('')
    const [etherInfo, setEtherInfo] = useState(null)
    const Demo1BottomRef = useRef(null)
    const requestAccount = async () => {
        const { ethereum } = window
        if (!window.ethereum) {
            return
        }
        const acct = await ethereum.request({ method: 'eth_accounts' })
        if (acct.length) {
            setAccount(acct[0])
            initEthers()
        }
        // 账号改变时触发
        ethereum.on('accountsChanged', function (accounts) {
            console.log('accountsChanged', accounts)
            setAccount(accounts[0] ?? '')
            initEthers()
            // window.location.reload()
        })
    }
    const getList = () => {
        Demo1BottomRef.current.getInfo()
    }
    const initEthers = async () => {
        // if (!account) return
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const address = await signer.getAddress()
        const demo1Contract = new ethers.Contract(addressObj.Demo1Address, demo1Abi.abi, signer);
        let obj = {
            provider,
            signer,
            address,
            demo1Contract,
        }
        setEtherInfo(
            obj
        )
    }
    useEffect(() => {
        requestAccount()
    }, [])

    return (
        <div className='demo-wrap'>
            <Demo1Top account={account} initEthers={initEthers} etherInfo={etherInfo} getList={getList}></Demo1Top>
            <Demo1Bottom ref={Demo1BottomRef} account={account} initEthers={initEthers} etherInfo={etherInfo}></Demo1Bottom>
        </div>
    )
}
