import { useState } from 'react'
import './App.css'
import ProductCard from './components/productCard'
import Testing from './components/testing'
import LoginPage from './pages/logingPage'
import HomePage from './pages/homePage'
import { BrowserRouter, Routes, Route } from 'react-router-dom'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
        <BrowserRouter>
          <Routes path="/*">
            <Route path="/" element={<HomePage/>}/>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/*" element={<h1>404 Error</h1>}/>
          </Routes>
        </BrowserRouter>
    </>
  )
}

export default App
