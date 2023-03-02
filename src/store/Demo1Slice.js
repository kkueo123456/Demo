import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { ethers } from 'ethers'
import demo1Abi from '@/build/Demo1.json'
const Demo1Slice = createSlice({
    name: 'Demo1Slice',
    initialState: {
        account: '',
        etherInfo: {}
    },
    reducers: {
        setAccount: (state, action) => {
            state.account = action.payload
        },
        initEthersDispatch(state, action) {
            state.etherInfo = action.payload
        }
    }
})
export const { setAccount, initEthersDispatch } = Demo1Slice.actions
export const initEthers = createAsyncThunk(
    'Demo1Slice/initEthers',
    async (data, { dispatch }) => {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const address = await signer.getAddress()
        const demo1Contract = new ethers.Contract(address, demo1Abi.abi, signer);
        let obj = {
            provider,
            signer,
            address,
            demo1Contract,
        }
        dispatch(initEthersDispatch(obj))
    }
)
export default Demo1Slice
