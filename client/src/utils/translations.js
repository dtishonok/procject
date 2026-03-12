import React, { createContext, useState, useContext } from 'react';

export const translations = {
  ru: {
    create_collection: "Создать новую коллекцию",
    title: "Название",
    description: "Описание",
    category: "Категория",
    save: "Сохранить",
    my_collections: "Мои коллекции",
    search: "Поиск...",
    items: "Предметы",
    discussion: "Обсуждение",
    settings: "Настройки",
    nav_home: "Главная",
    nav_admin: "Админка",
    nav_logout: "Выход",
    btn_create: "Создать",
    col_cat: "Без категории",
    col_tags: "Теги (через запятую)",
    col_cat_select: "Выберите категорию",
    label_public: "Публичная коллекция",
    auth_login: "Вход",
    auth_register: "Регистрация",
    auth_email: "Email",
    auth_pass: "Пароль",
    auth_btn_login: "ВОЙТИ",
    auth_btn_register: "РЕГИСТРАЦИЯ"
  },
  en: {
    create_collection: "Create New Collection",
    title: "Title",
    description: "Description",
    category: "Category",
    save: "Save",
    my_collections: "My Collections",
    search: "Search...",
    items: "Items",
    discussion: "Discussion",
    settings: "Settings",
    nav_home: "Home",
    nav_admin: "Admin",
    nav_logout: "Logout",
    btn_create: "Create",
    col_cat: "No Category",
    col_tags: "Tags (comma separated)",
    col_cat_select: "Select Category",
    label_public: "Make public",
    auth_login: "Login",
    auth_register: "Registration",
    auth_email: "Email",
    auth_pass: "Password",
    auth_btn_login: "SIGN IN",
    auth_btn_register: "SIGN UP"
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