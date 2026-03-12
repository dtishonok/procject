import React from "react"
import { Routes, Route,  } from 'react-router-dom'
import MainPage from "./pages/AuthPages/MainPage/MainPage.jsx"
import AuthPage from "./pages/AuthPages/AuthPage.jsx"

export const useRoutes = (isLogin) => {
    if (isLogin) {
        return (
            <Routes>
                <Route path="/" exepct Component={MainPage} />
                <Route path="/" />
            </Routes>
        );
    }

    return (
        <Routes>
            <Route path="/login" exepct Component={AuthPage} />
            <Route path="/"  />
        </Routes>
    );
};