import { useState } from 'react'
import './App.css'
import ProductCard from './components/productCard'
import Testing from './components/testing'
import LoginPage from './pages/logingPage'
import HomePage from './pages/homePage'
import SignupPage from'./pages/singinPage'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AdminHomePage from './pages/adminHomePage'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
        <BrowserRouter>
          <Routes path="/*">
            <Route path="/*" element={<HomePage/>}/>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/singin" element={<SignupPage/>}/>
            <Route path="/admin/*" element={<AdminHomePage/>}/>
            <Route path="/*" element={<HomePage/>}/>
          </Routes>
        </BrowserRouter>
    </>
  )
}

export default App
