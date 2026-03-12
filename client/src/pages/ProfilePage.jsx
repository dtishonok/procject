import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import M from 'materialize-css';

const ProfilePage = () => {
  const [userCollections, setUserCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userId, token } = useContext(AuthContext);

  const fetchUserCollections = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/inventory', {
        params: { userId }
      });
      const mine = res.data.filter(inv => parseInt(inv.owner_id) === parseInt(userId));
      setUserCollections(mine);
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserCollections();
  }, [fetchUserCollections]);

  const deleteCollection = async (id) => {
    if (!window.confirm('Удалить всю коллекцию и все предметы в ней?')) return;
    try {
      await axios.delete(`http://localhost:5001/api/inventory/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      M.toast({ html: 'Удалено', classes: 'green' });
      fetchUserCollections();
    } catch (e) {
      M.toast({ html: 'Ошибка удаления', classes: 'red' });
    }
  };

  if (loading) return <div className="progress"><div className="indeterminate"></div></div>;

  return (
    <div className="container">
      <div className="row" style={{ marginTop: '2rem' }}>
        <div className="col s12">
          <h4>Мой профиль</h4>
          <p className="grey-text">Ваши персональные коллекции</p>
        </div>
      </div>

      <div className="row">
        {userCollections.length === 0 ? (
          <div className="col s12 center-align">
            <p>У вас еще нет коллекций.</p>
            <Link to="/create" className="btn blue">Создать</Link>
          </div>
        ) : (
          userCollections.map(inv => (
            <div key={inv.id} className="col s12">
              <div className="card-panel white hoverable" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="bold" style={{ fontSize: '1.2rem' }}>{inv.title}</span>
                  <br />
                  <span className="chip">{inv.category_name}</span>
                </div>
                <div>
                  <Link to={`/inventory/${inv.id}`} className="btn-flat blue-text">
                    <i className="material-icons">visibility</i>
                  </Link>
                  <button onClick={() => deleteCollection(inv.id)} className="btn-flat red-text">
                    <i className="material-icons">delete</i>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProfilePage;