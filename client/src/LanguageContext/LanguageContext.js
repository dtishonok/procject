import React, { createContext, useState, useContext } from 'react';

export const translations = {
  en: {
    nav_home: "Home",
    nav_admin: "Admin",
    nav_logout: "Logout",
    btn_create: "Create",
    search_placeholder: "Search...",
    tab_settings: "Profile",
    my_collections: "My Collections",
    create_collection: "Create New Collection",
    title: "Title",
    description: "Description",
    category: "Category",
    col_cat_select: "Select category",
    col_tags: "Tags (comma separated)",
    btn_add_field: "ADD FIELD",
    label_public: "Make public",
    save: "CREATE",
    no_collections: "Nothing here yet",
    view_more: "View Details",
    custom_fields_title: "Additional fields",
    field_name_placeholder: "Field name",
    toast_success: "Success!",
    toast_error: "Error"
  },
  ru: {
    nav_home: "Главная",
    nav_admin: "Админка",
    nav_logout: "Выход",
    btn_create: "Создать",
    search_placeholder: "Поиск...",
    tab_settings: "Профиль",
    my_collections: "Мои коллекции",
    create_collection: "Создать новую коллекцию",
    title: "Название",
    description: "Описание",
    category: "Категория",
    col_cat_select: "Выберите категорию",
    col_tags: "Теги (через запятую)",
    btn_add_field: "ДОБАВИТЬ ПОЛЕ",
    label_public: "Сделать публичной",
    save: "СОЗДАТЬ",
    no_collections: "Пока ничего нет",
    view_more: "Подробнее",
    custom_fields_title: "Дополнительные поля предметов",
    field_name_placeholder: "Название поля",
    toast_success: "Успешно!",
    toast_error: "Ошибка"
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'ru');

  const toggleLang = (l) => {
    setLang(l);
    localStorage.setItem('lang', l);
  };

  const t = (key) => translations[lang] && translations[lang][key] ? translations[lang][key] : key;

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);