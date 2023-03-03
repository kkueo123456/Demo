import './App.css';
import router from './router/router'
import Header from './compoments/Header/Header';
import { useRoutes } from 'react-router-dom'
import { Suspense, useState, useEffect } from 'react';
import { Modal, Checkbox } from 'antd';

function App() {
  const route = useRoutes(router)
  const [isModalOpen, setIsModalOpen] = useState(true);
  useEffect(() => {
    if (localStorage.getItem('dontShowModal')) {
      setIsModalOpen(false)
    }
  }, [])
  const changeCheckBox = (e) => {
    if (e.target.checked) {
      localStorage.setItem('dontShowModal', true)
    }
  }
  return (
    <div className="App">
      <Header></Header>
      <Suspense fallback={
        <div
          style={{
            textAlign: 'center',
            marginTop: 200
          }}
        >
          loading...
        </div>
      }>
        {route}
      </Suspense>
      <Modal footer={null} width='400px' title="注意事项" open={isModalOpen} onCancel={()=>{setIsModalOpen(false)}} closable={true}>
        <div className='modal-main'>
          <p>1.本DEMO内LOGO均来源于网络，如有侵权,请联系删除</p>
          <p>2.查看该Demo请保证浏览器已安装MetaMask</p>
          <p>3.因DEMO内部分数据上传至IPFS，查看前请先科学上网</p>
          <p>4.NFT饰品交易平台Demo请移步至xxSkins查看</p>
          <p><Checkbox onChange={changeCheckBox}>今后不再显示该弹窗</Checkbox>  </p>
        </div>
      </Modal>
    </div>
  );
}

export default App;
