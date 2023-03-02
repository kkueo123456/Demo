import React from 'react'
import {Empty} from 'antd'
export default function empty() {
    return (
        <div style={{ color: 'white', width: '100%', height: 'calc(100vh - 300px)', display: "flex", alignItems: 'center', justifyContent: "center" }}><Empty ></Empty></div>
    )
}
