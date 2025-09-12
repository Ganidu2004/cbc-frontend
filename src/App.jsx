import './App.css'
import LoginPage from './pages/logingPage'
import HomePage from './pages/homePage'
import SignupPage from'./pages/singinPage'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AdminHomePage from './pages/adminHomePage'
import { Toaster } from 'react-hot-toast'


function App() {

  return (
    <>
        <BrowserRouter>
        <Toaster/>
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
