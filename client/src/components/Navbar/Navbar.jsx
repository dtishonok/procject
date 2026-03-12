import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

import { useLanguage } from '../../LanguageContext/LanguageContext';

const Navbar = () => {
  const { logout, isLogin, isAdmin } = useContext(AuthContext);
  const { lang, toggleLang, t } = useLanguage();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue('');
    }
  };

  return (
    <nav>
      <div className="nav-wrapper container">
        <Link to="/" className="brand-logo">Inventory App</Link>
        
        <ul id="nav-mobile" className="right hide-on-med-and-down">
          <li>
            <button 
              onClick={() => toggleLang(lang === 'ru' ? 'en' : 'ru')}
              style={{ 
                background: 'none', border: 'none', cursor: 'pointer', 
                color: 'inherit', display: 'flex', alignItems: 'center', 
                height: '64px', padding: '0 10px', fontSize: '14px', fontWeight: 'bold'
              }}
            >
              <i className="material-icons left" style={{ marginRight: '5px' }}>language</i>
              {lang.toUpperCase()}
            </button>
          </li>

          <li>
            <button 
              onClick={() => setIsDark(!isDark)} 
              style={{ 
                background: 'none', border: 'none', cursor: 'pointer', 
                color: 'inherit', display: 'flex', alignItems: 'center', 
                height: '64px', padding: '0 10px'
              }}
            >
              <i className="material-icons">{isDark ? 'brightness_7' : 'brightness_4'}</i>
            </button>
          </li>

          <li>
            <div className="input-field" style={{ marginRight: '20px' }}>
              <input 
                id="search-nav"
                type="search" 
                placeholder={t('search_placeholder')} 
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                onKeyDown={handleSearch}
                style={{ 
                  height: '64px', 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  paddingLeft: '45px'
                }} 
                autoComplete="off"
              />
              <label className="label-icon" htmlFor="search-nav" style={{ transform: 'translateY(-10px)' }}>
                <i className="material-icons">search</i>
              </label>
            </div>
          </li>

          {isLogin ? (
            <>
              <li><Link to="/">{t('nav_home')}</Link></li>
              <li><Link to="/create">{t('btn_create')}</Link></li>
              <li><Link to="/profile">{t('tab_settings')}</Link></li>
              {isAdmin && <li><Link to="/admin" className="orange-text text-lighten-3">{t('nav_admin')}</Link></li>}
              <li>
                <button 
                  className="btn red waves-effect waves-light btn-small" 
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  style={{ marginLeft: '15px' }}
                >
                  {t('nav_logout')}
                </button>
              </li>
            </>
          ) : (
            <li><Link to="/login" className="btn green">Login</Link></li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;