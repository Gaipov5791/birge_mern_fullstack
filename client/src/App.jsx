import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import MainApp from './MainApp'; // ⭐ НОВЫЙ КОМПОНЕНТ

import { loadUserFromStorage } from './redux/features/auth/authThunks';
import LoadingLogoPage from './components/common/LoadingLogoPage';

const App = () => {
  // Логика первого визита остается здесь
  const [isFirstVisit, setIsFirstVisit] = useState(() => {
    return sessionStorage.getItem('hasVisited') !== 'true';
  });
  const dispatch = useDispatch();

  useEffect(() => {
    // При монтировании приложения пытаемся загрузить пользователя из localStorage
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  useEffect(() => {
    if (isFirstVisit) {
      sessionStorage.setItem('hasVisited', 'true');
      const timer = setTimeout(() => {
        setIsFirstVisit(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isFirstVisit]);

  if (isFirstVisit) {
    return <LoadingLogoPage />;
  } 
  
  return (
    <>
      {/* ⭐ ВСЕ ВАШИ РОУТЫ И ЛОГИКУ ПЕРЕНЕСЕМ В MAINAPP */}
      <Router>
        <MainApp /> 
      </Router>
    </>
  )
}

export default App;
