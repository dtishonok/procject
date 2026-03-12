import React from 'react';

const ID_ELEMENTS = [
  { type: 'text', label: 'Фиксированный текст' },
  { type: 'year', label: 'Год (2026)' },
  { type: 'rand6', label: '6-значное число' },
  { type: 'sequence', label: 'Порядковый номер' }
];

const CustomIdConfig = ({ format, onChange }) => {
  const addElement = (element) => {
    const newElement = { ...element, id: Date.now(), value: element.type === 'text' ? 'INV-' : '' };
    onChange([...format, newElement]);
  };

  const removeElement = (id) => {
    onChange(format.filter(el => el.id !== id));
  };

  const updateText = (id, val) => {
    onChange(format.map(el => el.id === id ? { ...el, value: val } : el));
  };

  const generatePreview = () => {
    return format.map(el => {
      if (el.type === 'text') return el.value;
      if (el.type === 'year') return new Date().getFullYear();
      if (el.type === 'rand6') return '123456';
      if (el.type === 'sequence') return '001';
      return '';
    }).join('');
  };

  return (
    <div className="card-panel">
      <h5>Конструктор Custom ID</h5>
      <div style={{ marginBottom: '20px' }}>
        {ID_ELEMENTS.map(el => (
          <button key={el.type} className="btn-small grey darken-2" onClick={() => addElement(el)} style={{ margin: '2px' }}>
            + {el.label}
          </button>
        ))}
      </div>
      <div className="preview-box blue lighten-5 black-text" style={{ padding: '15px', borderRadius: '5px' }}>
        <strong>Предпросмотр: </strong> 
        <span className="blue-text text-darken-4" style={{ letterSpacing: '2px', fontWeight: 'bold' }}>
          {format.length > 0 ? generatePreview() : "Выберите элементы..."}
        </span>
      </div>
      <ul className="collection" style={{ marginTop: '20px' }}>
        {format.map((el, index) => (
          <li key={el.id} className="collection-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{index + 1}. <b>{el.label}</b></span>
            {el.type === 'text' && (
              <input type="text" value={el.value} onChange={(e) => updateText(el.id, e.target.value)} style={{ width: '100px', margin: '0 15px' }} />
            )}
            <button className="btn-flat red-text" onClick={() => removeElement(el.id)}>
              <i className="material-icons">delete</i>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CustomIdConfig;