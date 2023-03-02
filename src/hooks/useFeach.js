import { useEffect, useState, } from 'react';
import axios from 'axios'
function useFeach(props) {
    const { keyword } = props
    const [imgUrl, setImgurl] = useState('')
    const initUrl = async () => {
        const gifInfo = await axios.get(`https://api.giphy.com/v1/gifs/search?api_key=eMPhvX5jeWEtOcLrwiqhN5zqi9K80boe&q=${encodeURIComponent(keyword)}&limit=1&offset=0&rating=g&lang=zh-CN`)
        let url = gifInfo?.data?.data[0]?.images?.downsized_medium?.url
        setImgurl(url)
    }
    useEffect(() => {
        if (keyword) {
            initUrl()
        }
    }, [keyword])
    return imgUrl
}

export default useFeach;