import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import M from 'materialize-css';

const AdminPanel = () => {
  const { token, userId: currentUserId } = useContext(AuthContext);
  const [users, setUsers] = useState([]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (e) {
      M.toast({ html: 'Ошибка доступа', classes: 'red' });
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleStatus = async (userId, currentStatus) => {
    try {
      await axios.put(`http://localhost:5001/api/admin/users/${userId}/status`, 
        { status: currentStatus === 'active' ? 'blocked' : 'active' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (e) {
      M.toast({ html: 'Ошибка изменения статуса' });
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Удалить пользователя и все его данные?')) return;
    try {
      await axios.delete(`http://localhost:5001/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (e) {
      M.toast({ html: 'Ошибка удаления' });
    }
  };

  const toggleAdmin = async (userId, isAdmin) => {
    try {
      await axios.put(`http://localhost:5001/api/admin/users/${userId}/role`, 
        { isAdmin: !isAdmin },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (e) {
      M.toast({ html: 'Ошибка прав' });
    }
  };

  return (
    <div className="container">
      <h3>Панель администратора</h3>
      <table className="highlight responsive-table card-panel">
        <thead>
          <tr>
            <th>ID</th>
            <th>Имя</th>
            <th>Email</th>
            <th>Статус</th>
            <th>Роль</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                <span className={`chip ${u.status === 'active' ? 'green' : 'red'} white-text`}>
                  {u.status}
                </span>
              </td>
              <td>{u.is_admin ? 'Admin' : 'User'}</td>
              <td>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button className="btn-small blue" onClick={() => toggleStatus(u.id, u.status)}>
                    <i className="material-icons">block</i>
                  </button>
                  <button className="btn-small orange" onClick={() => toggleAdmin(u.id, u.is_admin)}>
                    <i className="material-icons">security</i>
                  </button>
                  {parseInt(currentUserId) !== u.id && (
                    <button className="btn-small red" onClick={() => deleteUser(u.id)}>
                      <i className="material-icons">delete</i>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanel;