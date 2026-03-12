import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useLanguage } from '../../LanguageContext/LanguageContext';
import M from 'materialize-css';

const CreatePage = () => {
  const { token, userId } = useContext(AuthContext);
  const { t, lang } = useLanguage(); 
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [customFields, setCustomFields] = useState([]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/categories');
        setCategories(res.data);
        setTimeout(() => {
          M.FormSelect.init(document.querySelectorAll('select'));
          M.updateTextFields(); 
        }, 0);
      } catch (e) {
        console.error(e);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      M.updateTextFields();
      M.FormSelect.init(document.querySelectorAll('select'));
    }, 100);
  }, [lang]);

  const addField = () => {
    setCustomFields([...customFields, { label: '', type: 'string' }]);
  };

  const handleFieldChange = (index, key, value) => {
    const newFields = [...customFields];
    newFields[index][key] = value;
    setCustomFields(newFields);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t !== '');
      const res = await axios.post('http://localhost:5001/api/inventory/add', {
        title,
        description,
        category_id: categoryId,
        owner_id: userId,
        is_public: isPublic,
        tags: tagsArray,
        customFields
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      M.toast({ html: t('toast_success'), classes: 'green' });
      navigate(`/inventory/${res.data.id}`);
    } catch (err) {
      M.toast({ html: t('toast_error'), classes: 'red' });
    }
  };

  return (
    <div className="container" key={lang}> {}
      <h4 className="white-text">{t('create_collection')}</h4>
      <div className="card-panel grey darken-4 white-text">
        <form onSubmit={handleSubmit}>
          
          <div className="input-field">
            <input 
              id="title" 
              type="text" 
              className="white-text"
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
            />
            <label htmlFor="title" className={title ? 'active' : ''}>{t('title')}</label>
          </div>

          <div className="input-field">
            <textarea 
              id="desc" 
              className="materialize-textarea white-text" 
              value={description} 
              onChange={e => setDescription(e.target.value)}
            ></textarea>
            <label htmlFor="desc" className={description ? 'active' : ''}>{t('description')}</label>
          </div>

          <div className="input-field">
            {}
            <select 
              className="browser-default grey darken-3 white-text" 
              style={{ display: 'block', marginBottom: '20px', border: '1px solid #555' }}
              value={categoryId} 
              onChange={e => setCategoryId(e.target.value)} 
              required
            >
              <option value="" disabled>{t('col_cat_select')}</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <label className="active" style={{ position: 'relative', top: '-10px' }}>{t('category')}</label>
          </div>

          <div className="input-field">
            <input 
              id="tags" 
              type="text" 
              className="white-text"
              value={tags} 
              onChange={e => setTags(e.target.value)} 
            />
            <label htmlFor="tags" className={tags ? 'active' : ''}>{t('col_tags')}</label>
          </div>

          <p>
            <label>
              <input 
                type="checkbox" 
                className="filled-in" 
                checked={isPublic} 
                onChange={e => setIsPublic(e.target.checked)} 
              />
              <span className="white-text">{t('label_public')}</span>
            </label>
          </p>

          <h5 style={{ marginTop: '30px' }}>{t('custom_fields_title') || "Additional Fields"}</h5>
          
          {customFields.map((field, index) => (
            <div key={index} className="row valign-wrapper grey darken-3" style={{ padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>
              <div className="input-field col s5">
                <input 
                  placeholder={t('field_name_placeholder')} 
                  className="white-text"
                  value={field.label} 
                  onChange={e => handleFieldChange(index, 'label', e.target.value)} 
                />
              </div>
              <div className="input-field col s5">
                <select 
                  className="browser-default grey darken-2 white-text" 
                  value={field.type} 
                  onChange={e => handleFieldChange(index, 'type', e.target.value)}
                >
                  <option value="string">String</option>
                  <option value="integer">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="text">Long Text</option>
                </select>
              </div>
              <div className="col s2">
                <button 
                  type="button" 
                  className="btn-flat red-text" 
                  onClick={() => setCustomFields(customFields.filter((_, i) => i !== index))}
                >
                  <i className="material-icons">delete</i>
                </button>
              </div>
            </div>
          ))}

          <button 
            type="button" 
            className="btn-flat blue-text" 
            style={{ marginBottom: '20px' }}
            onClick={addField}
          >
            <i className="material-icons left">add</i> {t('btn_add_field')}
          </button>

          <div className="divider" style={{ marginBottom: '20px' }}></div>

          <div className="right-align">
            <button 
              className="btn waves-effect waves-light blue accent-4" 
              type="submit"
            >
              {t('save')}
              <i className="material-icons right">send</i>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePage;