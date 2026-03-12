import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const SearchPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const { token } = useContext(AuthContext);
  
  const query = new URLSearchParams(location.search).get('q');

  const getResults = useCallback(async () => {
    if (!query) return;
    try {
      setLoading(true);
      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };
      
      const response = await axios.get(`http://localhost:5001/api/search?q=${encodeURIComponent(query)}`, config);
      setResults(response.data);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }, [query, token]);

  useEffect(() => {
    getResults();
  }, [getResults]);

  if (loading) {
    return (
      <div className="container center" style={{ marginTop: '100px' }}>
        <div className="preloader-wrapper big active">
          <div className="spinner-layer spinner-blue-only">
            <div className="circle-clipper left"><div className="circle"></div></div>
            <div className="gap-patch"><div className="circle"></div></div>
            <div className="circle-clipper right"><div className="circle"></div></div>
          </div>
        </div>
        <p className="grey-text">Ищем самое интересное...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row" style={{ marginTop: '2rem' }}>
        <div className="col s12">
          <h4>Результаты поиска</h4>
          <p className="grey-text">По запросу: <b>"{query}"</b> найдено {results.length} совпадений</p>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="card-panel grey lighten-4 center-align" style={{ padding: '50px' }}>
          <i className="material-icons large grey-text text-lighten-1">search_off</i>
          <h5>Ничего не нашли</h5>
          <p>Попробуйте изменить запрос или поискать в другой категории.</p>
          <Link to="/" className="btn blue waves-effect waves-light" style={{ marginTop: '20px' }}>
            На главную
          </Link>
        </div>
      ) : (
        <div className="collection z-depth-1" style={{ borderRadius: '8px', overflow: 'hidden' }}>
          {results.map((res, index) => (
            <Link 
              to={`/inventory/${res.link_id}`} 
              key={index} 
              className="collection-item avatar-item waves-effect" 
              style={{ display: 'block', color: 'inherit', padding: '15px 20px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="title" style={{ fontSize: '1.3rem', fontWeight: '500', color: '#1e88e5' }}>
                    {res.name}
                  </span>
                  <p className="grey-text" style={{ margin: '5px 0 0 0' }}>
                    {res.type === 'inventory' ? `Описание: ${res.detail || 'нет'}` : `В коллекции: ${res.detail}`}
                  </p>
                </div>
                
                <span className={`chip ${res.type === 'inventory' ? 'orange' : 'blue'} white-text`}>
                  {res.type === 'inventory' ? (
                    <><i className="material-icons left" style={{ fontSize: '14px', margin: '0 4px 0 0' }}>folder</i>Коллекция</>
                  ) : (
                    <><i className="material-icons left" style={{ fontSize: '14px', margin: '0 4px 0 0' }}>label</i>Предмет</>
                  )}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;