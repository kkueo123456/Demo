import React from 'react'
import './Swiper.css'
import anime from 'animejs/lib/anime.es.js';
import { useEffect, useState, useRef } from 'react';
import csLogo from '@/assets/img/cs_logo.png'
import Const from './Const'
export default function Swiper() {
    const [swiperList, setSwiperList] = useState(Const);
    const [animeObj, setAnime] = useState(null)
    const swpRef = useRef()
    useEffect(() => {
        let arr = [...Const]
        setSwiperList(arr)
        initSwiper()
        return () => {
            anime.remove(swiperList)
        }
    }, [])
    const initSwiper = () => {
        swiperAnime()
    }
    const swiperAnime = () => {
        anime.set('.head-item', {
            translateX: function (el, i, l) {
                swiperList[i].x = i * 162
                return i * 162;
            },
        });
        let ani = anime({
            targets: swiperList,
            duration: 28000, //走一周持续时间
            easing: 'linear',
            x: "+=3200",
            loop: true,
            update: function (anim) {
                anime.set('.head-item', {
                    translateX: function (el, i, l) {
                        return (swiperList[i].x) % 3240
                    }
                });
            }
        })
        setAnime(ani)
    }
    const stopAnimate = () => {
        animeObj && animeObj.pause()
    }
    const playAnimate = () => {
        animeObj && animeObj.play()
    }
    return (
        <div className='demo2-head'>
            {/* <div className='head-logo'><span>XX SKINS</span></div> */}
            <div className='demo2-head-wrap' ref={swpRef} >
                {
                    swiperList.map((item, index) => {
                        return (
                            <div className={['head-item', 'color-' + item.weight].join(' ')} key={index} >
                                <img className='cs-img' alt='' src={require(`@/assets/img/${item.img}.png`)} onMouseEnter={stopAnimate} onMouseOut={playAnimate}></img>
                                <img className='cs-logo' alt='' src={csLogo}></img>
                                <span className='item-text'>{item.name}</span>
                            </div>
                        )
                    })
                }

            </div>
        </div>
    )
}

