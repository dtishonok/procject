import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.scss'
import Navbar from './components/Navbar/Navbar.jsx'
import AuthPage from './pages/AuthPages/AuthPage.jsx'
import MainPage from "./pages/MainPage/MainPage.jsx"
import AdminPage from './pages/AdminPage/AdminPage.jsx'
import InventoryDetail from './pages/InventoryDetail/InventoryDetail.jsx'
import SearchPage from './pages/SearchPage/SearchPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import CreatePage from './pages/CreatePage/CreatePage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import { AuthContext } from './context/AuthContext.js'
import { LanguageProvider } from './LanguageContext/LanguageContext.js'
import { useAuth } from './hooks/AuthHook.js'
import 'materialize-css/dist/css/materialize.min.css'

function App() {
  const { login, logout, token, userId, isReady, isAdmin } = useAuth()
  const isLogin = !!token

  if (!isReady) {
    return (
      <div className="center" style={{ marginTop: '100px' }}>
        <div className="preloader-wrapper big active">
          <div className="spinner-layer spinner-blue-only">
            <div className="circle-clipper left"><div className="circle"></div></div>
            <div className="gap-patch"><div className="circle"></div></div>
            <div className="circle-clipper right"><div className="circle"></div></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ login, logout, token, userId, isLogin, isAdmin }}>
      <LanguageProvider>
        <Router>
          <div className="app">
            {isLogin && <Navbar />}
            <div className="main-content">
              <Routes>
                <Route path="/login" element={isLogin ? <Navigate to="/" /> : <AuthPage />} />
                <Route path="/" element={isLogin ? <MainPage /> : <Navigate to="/login" />} />
                
                <Route 
                  path="/create" 
                  element={isLogin ? <CreatePage /> : <Navigate to="/login" />} 
                />
                
                <Route 
                  path="/admin" 
                  element={isLogin && isAdmin ? <AdminPage /> : <Navigate to="/" />} 
                />
                
                <Route 
                  path="/inventory/:id" 
                  element={isLogin ? <InventoryDetail /> : <Navigate to="/login" />} 
                />
                
                <Route 
                  path="/search" 
                  element={isLogin ? <SearchPage /> : <Navigate to="/login" />} 
                />
                
                <Route 
                  path="/profile" 
                  element={isLogin ? <ProfilePage /> : <Navigate to="/login" />} 
                />
                
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/404" />} />
              </Routes>
            </div>
          </div>
        </Router>
      </LanguageProvider>
    </AuthContext.Provider>
  )
}

export default App