import React, { useState, useContext, useCallback, useEffect, useRef } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext.js'
import { useLanguage } from '../../LanguageContext/LanguageContext.js'
import M from 'materialize-css'
import './MainPage.scss'

const MainPage = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [tags, setTags] = useState('')
  const [categories, setCategories] = useState([])
  const [inventories, setInventories] = useState([])
  const [deleteCandidate, setDeleteCandidate] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [customFields, setCustomFields] = useState([])
  const [selectedTag, setSelectedTag] = useState(null)

  const { token, userId } = useContext(AuthContext)
  const { t, lang } = useLanguage()
  const selectRef = useRef(null)
  const modalRef = useRef(null)

  const fetchData = useCallback(async () => {
    try {
      if (!userId || !token) return
      const config = { headers: { Authorization: `Bearer ${token}` } }
      const [invRes, catRes] = await Promise.all([
        axios.get(`http://localhost:5001/api/inventory?userId=${userId}`, config),
        axios.get('http://localhost:5001/api/categories')
      ])
      setInventories(invRes.data)
      setCategories(catRes.data)
    } catch (e) {
      console.error(e)
    }
  }, [token, userId])

  useEffect(() => {
    fetchData()
    M.Modal.init(modalRef.current)
  }, [fetchData])

  useEffect(() => {
    setTimeout(() => {
      M.updateTextFields()
      if (selectRef.current) {
        M.FormSelect.init(selectRef.current)
      }
    }, 100)
  }, [categories, customFields, lang])

  const handleLike = async (e, id) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } }
      await axios.post(`http://localhost:5001/api/inventory/${id}/like`, { userId }, config)
      fetchData()
    } catch (e) {
      M.toast({html: t('toast_error'), classes: 'red'})
    }
  }

  const addField = () => {
    if (customFields.length >= 12) return M.toast({html: 'Максимум 12 полей'})
    setCustomFields([...customFields, { label: '', type: 'string' }])
  }

  const removeField = (index) => {
    setCustomFields(customFields.filter((_, i) => i !== index))
  }

  const handleFieldChange = (index, key, value) => {
    const newFields = [...customFields]
    newFields[index][key] = value
    setCustomFields(newFields)
  }

  const createInventory = async () => {
    if (!title.trim() || !categoryId) {
      return M.toast({html: t('toast_error'), classes: 'red'})
    }
    try {
      const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t !== '')
      await axios.post('http://localhost:5001/api/inventory/add', 
        { 
          title, 
          description, 
          category_id: parseInt(categoryId), 
          owner_id: parseInt(userId), 
          is_public: isPublic,
          customFields,
          tags: tagsArray
        }, 
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setTitle('')
      setDescription('')
      setTags('')
      setIsPublic(false)
      setCustomFields([])
      fetchData()
      M.toast({html: t('toast_success'), classes: 'green'})
    } catch (e) {
      M.toast({html: t('toast_error'), classes: 'red'})
    }
  }

  const openDeleteModal = (id) => {
    setDeleteCandidate(id)
    const instance = M.Modal.getInstance(modalRef.current)
    if (instance) instance.open()
  }

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:5001/api/inventory/delete/${deleteCandidate}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setDeleteCandidate(null)
      fetchData()
      M.toast({html: t('toast_success'), classes: 'black'})
    } catch (e) {
      console.error(e)
    }
  }

  const allTags = Array.from(new Set(inventories.flatMap(inv => inv.tags || [])))

  const filteredInventories = inventories.filter(inv => {
    const matchesSearch = inv.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTag = selectedTag ? (inv.tags && inv.tags.includes(selectedTag)) : true
    return matchesSearch && matchesTag
  })

  return (
    <div className="container" key={lang}>
      <div className="main-page">
        <h4>{t('create_collection')}</h4>
        <div className="row card-panel">
          <div className="input-field col s12 m6">
            <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} />
            <label htmlFor="title" className={title ? 'active' : ''}>{t('title')}</label>
          </div>
          
          <div className="input-field col s12 m6">
            <select ref={selectRef} value={categoryId} onChange={e => setCategoryId(e.target.value)}>
              <option value="" disabled>{t('col_cat_select')}</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <label>{t('category')}</label>
          </div>

          <div className="input-field col s12">
            <textarea id="desc" className="materialize-textarea" value={description} onChange={e => setDescription(e.target.value)}></textarea>
            <label htmlFor="desc" className={description ? 'active' : ''}>{t('description')}</label>
          </div>

          <div className="input-field col s12">
            <input id="tags" type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="книги, редкое, 2024" />
            <label htmlFor="tags" className={tags ? 'active' : ''}>{t('col_tags')}</label>
          </div>

          <div className="col s12">
            <h6>{t('custom_fields_title')}:</h6>
            {customFields.map((field, index) => (
              <div key={index} className="row valign-wrapper card-panel grey lighten-5" style={{padding: '10px', marginBottom: '10px', border: '1px dashed #ccc'}}>
                <div className="input-field col s5">
                  <input 
                    type="text" 
                    placeholder={t('field_name_placeholder')}
                    value={field.label} 
                    onChange={e => handleFieldChange(index, 'label', e.target.value)} 
                  />
                </div>
                <div className="input-field col s5">
                  <select 
                    className="browser-default" 
                    value={field.type} 
                    onChange={e => handleFieldChange(index, 'type', e.target.value)}
                    style={{display: 'block', borderRadius: '4px', height: '3rem'}}
                  >
                    <option value="string">Строка</option>
                    <option value="integer">Число</option>
                    <option value="text">Большой текст</option>
                    <option value="boolean">Логическое</option>
                  </select>
                </div>
                <div className="col s2 center-align">
                  <button className="btn-floating red btn-small waves-effect waves-light" onClick={() => removeField(index)}>
                    <i className="material-icons">delete</i>
                  </button>
                </div>
              </div>
            ))}
            <button className="btn-flat blue-text waves-effect" onClick={addField}>
              <i className="material-icons left">add</i> {t('btn_add_field')}
            </button>
          </div>

          <div className="col s12 m6" style={{marginTop: '20px'}}>
            <p>
              <label>
                <input type="checkbox" className="filled-in" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
                <span>{t('label_public')}</span>
              </label>
            </p>
          </div>

          <div className="col s12 m6 right-align" style={{marginTop: '20px'}}>
            <button className="btn-large blue waves-effect waves-light" onClick={createInventory}>{t('btn_create')}</button>
          </div>
        </div>

        <div className="row valign-wrapper" style={{marginTop: '40px', marginBottom: '10px'}}>
          <div className="col s8">
            <h3 style={{margin: 0}}>{t('my_collections')}</h3>
          </div>
          <div className="input-field col s4">
            <i className="material-icons prefix">search</i>
            <input 
              id="search-local" 
              type="text" 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              placeholder={t('search_placeholder')}
            />
          </div>
        </div>

        {allTags.length > 0 && (
          <div className="tags-cloud" style={{ marginBottom: '20px', padding: '0 10px' }}>
            <span style={{ marginRight: '10px', fontWeight: 'bold' }}>Фильтр по тегам:</span>
            <div 
              className={`chip ${!selectedTag ? 'blue white-text' : 'grey lighten-3'}`} 
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedTag(null)}
            >
              Все
            </div>
            {allTags.map((tag, idx) => (
              <div 
                key={idx} 
                className={`chip ${selectedTag === tag ? 'blue white-text' : 'grey lighten-3'}`} 
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedTag(tag)}
              >
                #{tag}
              </div>
            ))}
          </div>
        )}

        <div className="collection z-depth-1">
          {filteredInventories.map((inv) => (
            <div key={inv.id} className="collection-item" style={{ position: 'relative', padding: '15px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flexGrow: 1 }}>
                  <Link to={`/inventory/${inv.id}`} className="blue-text text-darken-2" style={{ fontSize: '1.3rem', fontWeight: '500', display: 'block' }}>
                    {inv.title}
                  </Link>
                  <div style={{marginTop: '5px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px'}}>
                    <span className="chip">{inv.category_name}</span>
                    {inv.is_public && <span className="chip green white-text">Public</span>}
                    {inv.tags && inv.tags.map((tag, idx) => (
                      <span key={idx} className="chip blue lighten-4" style={{fontSize: '0.8rem'}}>#{tag}</span>
                    ))}

                    <div 
                      onClick={(e) => handleLike(e, inv.id)} 
                      style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', marginLeft: '10px', position: 'relative', zIndex: 10 }}
                    >
                      <i className={`material-icons ${inv.is_liked ? 'red-text' : 'grey-text'}`}>
                        {inv.is_liked ? 'favorite' : 'favorite_border'}
                      </i>
                      <span style={{ marginLeft: '4px', fontWeight: 'bold' }}>{inv.likes_count || 0}</span>
                    </div>
                  </div>
                </div>
                <div className="actions" style={{ position: 'relative', zIndex: 10 }}>
                  <button className="btn-flat circle waves-effect" onClick={() => openDeleteModal(inv.id)}>
                      <i className="material-icons red-text">delete_forever</i>
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredInventories.length === 0 && (
            <div className="collection-item center-align grey-text" style={{padding: '30px'}}>
              <i className="material-icons large opacity-2" style={{display: 'block', marginBottom: '10px'}}>folder_open</i>
              {searchQuery || selectedTag ? 'Ничего не найдено' : t('no_collections')}
            </div>
          )}
        </div>

        <div id="modalDelete" className="modal" ref={modalRef}>
          <div className="modal-content">
            <h4>{t('toast_error')}?</h4>
            <p>Это действие приведет к полному удалению коллекции и всех предметов внутри неё.</p>
          </div>
          <div className="modal-footer">
            <button className="modal-close btn-flat waves-effect">Отмена</button>
            <button className="modal-close btn red white-text waves-effect waves-light" onClick={confirmDelete}>Удалить</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainPage;