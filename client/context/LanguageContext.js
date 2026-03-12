import React, { createContext, useState, useContext } from 'react';

const translations = {
  en: {
    nav_home: "Home",
    nav_admin: "Admin",
    nav_logout: "Logout",
    btn_create: "Create Collection",
    btn_add_item: "Add Item",
    search_placeholder: "Search collections and items...",
    col_title: "Title",
    col_desc: "Description",
    col_cat: "Category",
    col_tags: "Tags",
    tab_items: "Items",
    tab_discuss: "Discussion",
    tab_settings: "Settings",
    status_active: "Active",
    status_blocked: "Blocked",
    role_admin: "Admin",
    role_user: "User"
  },
  ru: {
    nav_home: "Главная",
    nav_admin: "Админка",
    nav_logout: "Выход",
    btn_create: "Создать коллекцию",
    btn_add_item: "Добавить предмет",
    search_placeholder: "Поиск коллекций и предметов...",
    col_title: "Название",
    col_desc: "Описание",
    col_cat: "Категория",
    col_tags: "Теги",
    tab_items: "Предметы",
    tab_discuss: "Обсуждение",
    tab_settings: "Настройки",
    status_active: "Активен",
    status_blocked: "Заблокирован",
    role_admin: "Админ",
    role_user: "Пользователь"
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'ru');

  const toggleLang = (l) => {
    setLang(l);
    localStorage.setItem('lang', l);
  };

  const t = (key) => translations[lang][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);