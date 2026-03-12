import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import M from 'materialize-css'; // Добавил уведомления
import './AuthPage.scss';

const AuthPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [isLoginMode, setIsLoginMode] = useState(true);

  const changeHandler = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const loginHandler = async () => {
    try {
      const response = await axios.post('http://localhost:5001/api/auth/login', { ...form });
      
      const { token, userId, isAdmin } = response.data;

      if (token && userId) {
        login(token, userId, isAdmin); 
        M.toast({ html: 'Вы вошли!', classes: 'green' });
        navigate('/');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Ошибка при входе';
      M.toast({ html: errorMsg, classes: 'red' });
      console.error(errorMsg);
    }
  };

  const registerHandler = async () => {
    try {
      await axios.post('http://localhost:5001/api/auth/registration', { ...form });
      M.toast({ html: 'Регистрация успешна! Войдите.', classes: 'green' });
      setIsLoginMode(true);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Ошибка регистрации';
      M.toast({ html: errorMsg, classes: 'red' });
      console.error(errorMsg);
    }
  };

  return (
    <div className="container">
      <div className="auth-page">
        <h3>{isLoginMode ? 'Авторизация' : 'Регистрация'}</h3>
        <form className="form form-login" onSubmit={(e) => e.preventDefault()}>
          <div className="row">
            <div className="input-field col s12">
              <input
                type="email"
                name="email"
                id="email"
                value={form.email} // ВАЖНО: добавлено value
                onChange={changeHandler}
                required
              />
              <label htmlFor="email" className="active">Email</label>
            </div>

            <div className="input-field col s12">
              <input
                type="password"
                name="password"
                id="password"
                value={form.password} // ВАЖНО: добавлено value
                onChange={changeHandler}
                required
              />
              <label htmlFor="password" className="active">Пароль</label>
            </div>
          </div>

          <div className="row" style={{ marginTop: '20px' }}>
            <button 
              className="waves-effect waves-light btn blue"
              onClick={isLoginMode ? loginHandler : registerHandler}
              style={{ marginRight: '15px' }}
            >
              {isLoginMode ? 'Войти' : 'Создать аккаунт'}
            </button>
            
            <button 
              className="btn-flat"
              type="button"
              onClick={() => setIsLoginMode(!isLoginMode)}
            >
              {isLoginMode ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;