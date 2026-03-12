import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import M from 'materialize-css';
import './AdminPage.scss';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const { token, userId: currentUserId } = useContext(AuthContext);

  const getUsers = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (e) {
      M.toast({ html: 'Ошибка загрузки пользователей', classes: 'red' });
    }
  }, [token]);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const handleAction = async (action) => {
    if (selectedIds.length === 0) {
      return M.toast({ html: 'Никто не выбран', classes: 'orange' });
    }
    try {
      await axios.post('http://localhost:5001/api/admin/user-action', 
        { userIds: selectedIds, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSelectedIds([]);
      getUsers();
      M.toast({ html: `Действие "${action}" выполнено`, classes: 'green' });
    } catch (e) {
      M.toast({ html: 'Ошибка выполнения действия', classes: 'red' });
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === users.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(users.map(u => u.id));
    }
  };

  return (
    <div className="container">
      <div className="admin-page" style={{ marginTop: '2rem' }}>
        <h4 className="center-align">Управление пользователями</h4>
        
        <div className="admin-toolbar z-depth-1" style={{ 
          marginBottom: '20px', 
          display: 'flex', 
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '10px', 
          padding: '15px', 
          background: '#f5f5f5', 
          borderRadius: '8px' 
        }}>
          <button className="btn orange waves-effect" onClick={() => handleAction('block')}>Заблокировать</button>
          <button className="btn green waves-effect" onClick={() => handleAction('unblock')}>Разблокировать</button>
          <button className="btn blue waves-effect" onClick={() => handleAction('make_admin')}>Назначить админом</button>
          <button className="btn grey darken-2 waves-effect" onClick={() => handleAction('remove_admin')}>Снять админа</button>
          <button className="btn red waves-effect" onClick={() => handleAction('delete')}>Удалить</button>
        </div>

        <div className="card">
          <table className="highlight centered responsive-table">
            <thead>
              <tr>
                <th>
                  <label>
                    <input type="checkbox" className="filled-in" 
                      onChange={selectAll} 
                      checked={selectedIds.length === users.length && users.length > 0} 
                    />
                    <span>Все</span>
                  </label>
                </th>
                <th>ID</th>
                <th>Email</th>
                <th>Роль</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ backgroundColor: selectedIds.includes(user.id) ? '#e3f2fd' : 'transparent' }}>
                  <td>
                    <label>
                      <input type="checkbox" className="filled-in" 
                        checked={selectedIds.includes(user.id)}
                        onChange={() => toggleSelect(user.id)} 
                      />
                      <span></span>
                    </label>
                  </td>
                  <td>{user.id}</td>
                  <td>
                    {user.email} 
                    {user.id === parseInt(currentUserId) && <span className="badge blue white-text" style={{position:'relative', float:'none', marginLeft:'10px'}}>Вы</span>}
                  </td>
                  <td>
                    <span className={`chip ${user.is_admin ? 'blue white-text' : ''}`}>
                      {user.is_admin ? "Admin" : "User"}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 'bold', color: user.is_blocked ? '#f44336' : '#4caf50' }}>
                      {user.is_blocked ? "Заблокирован" : "Активен"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;