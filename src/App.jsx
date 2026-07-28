import './App.css'
import LoginPage from './pages/logingPage'
import HomePage from './pages/homePage'
import SignupPage from'./pages/singinPage'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import AdminHomePage from './pages/adminHomePage'
import { Toaster } from 'react-hot-toast'
import GamifiedRewards from './components/extras/GamifiedRewards'
import AIAssistantChatbot from './components/extras/AIAssistantChatbot'

function GlobalExtras() {
  const location = useLocation();
  
  // Hide the floating engagement tools on admin routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }
  
  return (
    <>
      <GamifiedRewards />
      <AIAssistantChatbot />
    </>
  );
}

function App() {

  return (
    <>
        <BrowserRouter>
        <Toaster/>
          <Routes>
            <Route path="/*" element={<HomePage/>}/>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/singin" element={<SignupPage/>}/>
            <Route path="/admin/*" element={<AdminHomePage/>}/>
          </Routes>
          
          {/* Global Engagement Extras */}
          <GlobalExtras />
        </BrowserRouter>
    </>
  )
}

export default App
