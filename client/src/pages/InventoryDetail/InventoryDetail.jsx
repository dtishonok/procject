import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { AuthContext } from '../../context/AuthContext';
import M from 'materialize-css';

const InventoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId, token } = useContext(AuthContext);
  
  const [inventory, setInventory] = useState(null);
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState('');
  const [categories, setCategories] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [customValues, setCustomValues] = useState({});
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCat, setEditCat] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const config = { 
        headers: { Authorization: `Bearer ${token}` },
        params: { userId } 
      };
      
      const [invRes, itemsRes, catRes, fieldsRes] = await Promise.all([
        axios.get(`http://localhost:5001/api/inventory/${id}`, config),
        axios.get(`http://localhost:5001/api/inventory/${id}/items`, config),
        axios.get('http://localhost:5001/api/categories'),
        axios.get(`http://localhost:5001/api/inventory/${id}/fields`, config)
      ]);
      
      setInventory(invRes.data);
      setItems(itemsRes.data);
      setCategories(catRes.data);
      setCustomFields(fieldsRes.data);
      
      setEditTitle(invRes.data.title);
      setEditDesc(invRes.data.description || '');
      setEditCat(invRes.data.category_id);
    } catch (e) {
      console.error(e);
      M.toast({html: 'Ошибка загрузки данных', classes: 'red'});
    }
  }, [id, token, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (isEditing || customFields.length > 0) {
      setTimeout(() => {
        const selects = document.querySelectorAll('select');
        M.FormSelect.init(selects);
        M.updateTextFields();
      }, 0);
    }
  }, [isEditing, customFields]);

  const handleLike = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`http://localhost:5001/api/inventory/${id}/like`, { userId }, config);
      fetchData(); 
    } catch (e) {
      M.toast({html: 'Ошибка', classes: 'red'});
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:5001/api/inventory/${id}`, {
        title: editTitle,
        description: editDesc,
        category_id: parseInt(editCat),
        is_public: inventory.is_public
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsEditing(false);
      fetchData();
      M.toast({html: 'Обновлено!', classes: 'green'});
    } catch (e) {
      M.toast({html: 'Ошибка при обновлении', classes: 'red'});
    }
  };

  const addItem = async () => {
    if (!itemName.trim()) return;
    try {
      await axios.post(`http://localhost:5001/api/inventory/${id}/items/add-full`, 
        { name: itemName, customValues },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setItemName('');
      setCustomValues({});
      fetchData();
      M.toast({html: 'Добавлено', classes: 'blue'});
    } catch (e) {
      M.toast({html: 'Ошибка при добавлении', classes: 'red'});
    }
  };

  const deleteItem = async (itemId) => {
    try {
      await axios.delete(`http://localhost:5001/api/inventory/item/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
      M.toast({html: 'Удалено', classes: 'black'});
    } catch (e) {
      M.toast({html: 'Ошибка при удалении', classes: 'red'});
    }
  };

  if (!inventory) return <div className="progress"><div className="indeterminate"></div></div>;

  const isOwner = parseInt(inventory.owner_id) === parseInt(userId);

  return (
    <div className="container">
      <div style={{marginTop: '20px', display: 'flex', justifyContent: 'space-between'}}>
        <button className="btn-flat waves-effect" onClick={() => navigate('/')}>
          <i className="material-icons left">arrow_back</i> К списку
        </button>
        
        <div 
          onClick={handleLike} 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <i className={`material-icons ${inventory.is_liked ? 'red-text' : 'grey-text'}`}>
            {inventory.is_liked ? 'favorite' : 'favorite_border'}
          </i>
          <span className="bold">{inventory.likes_count || 0}</span>
        </div>
      </div>

      {isEditing ? (
        <div className="card-panel">
          <h5>Редактирование коллекции</h5>
          <div className="input-field">
            <input id="title" type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
            <label htmlFor="title" className="active">Название</label>
          </div>
          <div className="input-field">
            <textarea id="desc" className="materialize-textarea" value={editDesc} onChange={e => setEditDesc(e.target.value)}></textarea>
            <label htmlFor="desc" className="active">Описание (Markdown поддерживается)</label>
          </div>
          <div className="input-field">
            <select value={editCat} onChange={e => setEditCat(e.target.value)}>
              <option value="" disabled>Выберите категорию</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <label>Категория</label>
          </div>
          <button className="btn green waves-effect waves-light" onClick={handleUpdate} style={{marginRight: '10px'}}>
            <i className="material-icons left">save</i>Сохранить
          </button>
          <button className="btn grey waves-effect" onClick={() => setIsEditing(false)}>Отмена</button>
        </div>
      ) : (
        <div className="inventory-header" style={{marginTop: '1rem'}}>
          <div className="row valign-wrapper" style={{marginBottom: 0}}>
            <div className="col s9">
              <h3 style={{margin: '0.5rem 0'}}>{inventory.title}</h3>
              <div style={{marginBottom: '10px'}}>
                <span className="chip blue white-text">
                  {inventory.category_name || categories.find(c => c.id === inventory.category_id)?.name}
                </span>
                {inventory.is_public ? 
                  <span className="chip green white-text">Публичная</span> : 
                  <span className="chip grey white-text">Приватная</span>
                }
              </div>
            </div>
            <div className="col s3 right-align">
              {isOwner && (
                <button className="btn-floating btn-large orange waves-effect waves-light" onClick={() => setIsEditing(true)}>
                  <i className="material-icons">edit</i>
                </button>
              )}
            </div>
          </div>
          <div className="card-panel white z-depth-1 markdown-body" style={{padding: '20px'}}>
            <ReactMarkdown>{inventory.description || '*Описание отсутствует*'}</ReactMarkdown>
          </div>
        </div>
      )}

      <div className="divider" style={{margin: '2rem 0'}}></div>

      {isOwner && (
        <div className="card-panel white z-depth-2">
          <h5><i className="material-icons left blue-text">playlist_add</i>Добавить новый предмет</h5>
          <div className="row">
            <div className="input-field col s12">
              <i className="material-icons prefix">shopping_basket</i>
              <input 
                id="item_name" 
                type="text" 
                value={itemName} 
                onChange={e => setItemName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addItem()}
              />
              <label htmlFor="item_name">Название предмета</label>
            </div>
            
            {customFields.map(field => (
              <div key={field.id} className="input-field col s12 m4">
                {field.type === 'boolean' ? (
                  <p style={{marginTop: '20px'}}>
                    <label>
                      <input 
                        type="checkbox" 
                        className="filled-in"
                        checked={customValues[field.id] || false}
                        onChange={e => setCustomValues({...customValues, [field.id]: e.target.checked})} 
                      />
                      <span>{field.label}</span>
                    </label>
                  </p>
                ) : field.type === 'text' ? (
                  <div className="input-field">
                    <textarea 
                      className="materialize-textarea" 
                      placeholder={field.label} 
                      value={customValues[field.id] || ''}
                      onChange={e => setCustomValues({...customValues, [field.id]: e.target.value})}
                    ></textarea>
                    <span className="helper-text">{field.label}</span>
                  </div>
                ) : (
                  <div className="input-field">
                    <input 
                      type={field.type === 'integer' ? 'number' : 'text'} 
                      placeholder={field.label} 
                      value={customValues[field.id] || ''}
                      onChange={e => setCustomValues({...customValues, [field.id]: e.target.value})} 
                    />
                    <span className="helper-text">{field.label}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button className="btn blue btn-large waves-effect waves-light w100" onClick={addItem} style={{width: '100%'}}>
            <i className="material-icons left">add</i>Добавить предмет
          </button>
        </div>
      )}

      <ul className="collection with-header z-depth-1">
        <li className="collection-header grey lighten-3">
          <h5 style={{margin: 0}}>Предметы в коллекции ({items.length})</h5>
        </li>
        {items.map(item => (
          <li key={item.id} className="collection-item" style={{padding: '15px 20px'}}>
            <div className="row" style={{marginBottom: 0, display: 'flex', alignItems: 'center'}}>
              <div className="col s10">
                <span className="title" style={{fontWeight: '600', fontSize: '1.25rem', display: 'block'}}>{item.name}</span>
                <div style={{marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                  {item.custom_data && Object.entries(item.custom_data).map(([key, val]) => (
                    (val !== null && val !== "" && val !== false) && (
                      <span key={key} className="chip grey lighten-3" style={{height: 'auto', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem'}}>
                        <b className="blue-text text-darken-3">{key}:</b> {val === true ? 'Да' : val.toString()}
                      </span>
                    )
                  ))}
                </div>
              </div>
              <div className="col s2 right-align">
                {isOwner && (
                  <button className="btn-flat circle waves-effect" onClick={() => deleteItem(item.id)}>
                    <i className="material-icons red-text">delete_outline</i>
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
        {items.length === 0 && (
          <li className="collection-item grey-text center-align" style={{padding: '40px'}}>
            <i className="material-icons medium opacity-2">inventory_2</i>
            <p>В этой коллекции пока нет предметов</p>
          </li>
        )}
      </ul>
    </div>
  );
};

export default InventoryDetail;