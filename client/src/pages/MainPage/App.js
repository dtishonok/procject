import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.scss'
import Navbar from './components/Navbar/Navbar.jsx' 
import AuthPage from './pages/AuthPages/AuthPage.jsx'
import MainPage from './pages/MainPage/MainPage.jsx'
import AdminPage from './pages/AdminPage/AdminPage.jsx'
import { AuthContext } from './context/AuthContext.js' 
import { LanguageProvider } from './LanguageContext/LanguageContext.js'
import { useAuth } from './hooks/AuthHook.js' 
import 'materialize-css/dist/css/materialize.min.css'

function App() {
  const { login, logout, token, userId, isAdmin, isReady } = useAuth()
  const isLogin = !!token 

  if (!isReady) {
    return <div className="center">Loading...</div>
  }

  return (
    <AuthContext.Provider value={{ login, logout, token, userId, isLogin, isAdmin }}>
      {/* ОБЯЗАТЕЛЬНО ОБОРАЧИВАЕМ В LANGUAGE PROVIDER */}
      <LanguageProvider>
        <Router>
          <div className="app">
            <Navbar />
            <div className="container">
              <Routes>
                {isLogin ? (
                  <>
                    <Route path="/" element={<MainPage />} />
                    {isAdmin && <Route path="/admin" element={<AdminPage />} />}
                    <Route path="*" element={<Navigate to="/" />} />
                  </>
                ) : (
                  <>
                    <Route path="/login" element={<AuthPage />} />
                    <Route path="*" element={<Navigate to="/login" />} />
                  </>
                )}
              </Routes>
            </div>
          </div>
        </Router>
      </LanguageProvider>
    </AuthContext.Provider>
  )
}

export default App