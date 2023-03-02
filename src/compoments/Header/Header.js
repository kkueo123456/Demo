import React from 'react'
import './Header.css'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
export default function Header() {
    const [titleArr, setTitleArr] = useState([])
    const navigate = useNavigate()
    useEffect(() => {
        let arr = [{
            path:'Demo1',
            name:'transaction'
        },
        {
            path:'Demo2',
            name:"xxSkins"
        }]
        setTitleArr(arr)
    }, [])
    const changePage = (item)=>{
        console.warn(item)
        navigate('/'+ item.path, { replace: false })
    }
    return (
        <div className='header-wrap'>
            <div className='header-left'>
                {
                    titleArr.map(item=>{
                        return (<span key={item.path} className='header-title' onClick={()=>{changePage(item)}}>{item.name}</span>)
                    })
                }
            </div>
            <div className='header-right'></div>
        </div>
    )
}
