import { Navigate } from 'react-router-dom'
import { lazy } from 'react'
const Demo1 = lazy(() => import('../view/Demo1/Demo1'))
const Demo2 = lazy(() => import('../view/Demo2/Demo2'))
let routerArr = [
    {
        path: '/Demo1',
        element: <Demo1></Demo1>
    },
    {
        path: '/Demo2',
        element: <Demo2></Demo2>
    },
    {
        path: '/',
        element: <Navigate to={'/Demo1'}></Navigate>
    }
]
export default routerArr