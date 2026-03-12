import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="container center-align" style={{ marginTop: '100px' }}>
      <div className="row">
        <div className="col s12">
          <i className="material-icons large orange-text">error_outline</i>
          <h2 style={{ fontWeight: '700' }}>404</h2>
          <h4>Упс! Страница не найдена</h4>
          <p className="grey-text" style={{ fontSize: '1.2rem' }}>
            Похоже, вы зашли в тупик. Страница, которую вы ищете, не существует или была перемещена.
          </p>
          <div style={{ marginTop: '30px' }}>
            <Link to="/" className="btn-large blue waves-effect waves-light">
              Вернуться на главную
              <i className="material-icons left">home</i>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;