import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({children}) => {
    const { user, isLoading } = useSelector((state) => state.auth); // Получаем пользователя из Redux 
    
    // if (isLoading) {
    //     return <div className="text-center text-xl mt-10">Загрузка...</div>;
    // }

    return user ? children : <Navigate to="/login"/>; // Если пользователь есть, отображаем children, иначе перенаправляем на страницу входа
}

export default PrivateRoute;