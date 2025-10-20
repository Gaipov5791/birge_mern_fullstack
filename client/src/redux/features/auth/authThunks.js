import { createAsyncThunk } from "@reduxjs/toolkit";

import authService from "../../../api/authService";


// ⭐ НОВЫЙ ASYNC THUNK ДЛЯ ЗАГРУЗКИ ПОЛЬЗОВАТЕЛЯ ИЗ localStorage
export const loadUserFromStorage = createAsyncThunk(
    "auth/loadUserFromStorage",
    async (_, { dispatch }) => {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");
        if (user && token) {
            // Dispatch a regular action to set the state
            dispatch(authSlice.actions.setUser({ user, token }));
            return { user, token };
        }
        return null;
    }
);

// Асинхронный thunk для регистрации пользователя
export const registerUser = createAsyncThunk(
    "auth/register",
    async (userData, thunkAPI) => {
        try {
            const response = await authService.register(userData);
            // Сохраняем пользователя и токен в localStorage
            if (response.user && response.token) {
                localStorage.setItem("user", JSON.stringify(response.user));
                localStorage.setItem("token", response.token);
            }
            return response;
        } catch (error) {
            const message =
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Асинхронный thunk для логина пользователя
export const loginUser = createAsyncThunk(
    "auth/login",
    async (userData, thunkAPI) => {
        try {
            const response = await authService.login(userData);
            // Сохраняем пользователя и токен в localStorage
            if (response.user && response.token) {
                localStorage.setItem("user", JSON.stringify(response.user));
                localStorage.setItem("token", response.token);
            }
            return response;
        } catch (error) {
            const message =
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Асинхронный thunk для выхода пользователя
export const logoutUser = createAsyncThunk("auth/logout", async () => {
    await authService.logout();
    // Удаляем пользователя и токен из localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
});

// Асинхронный thunk подписаться на пользователя
export const followUser = createAsyncThunk(
    "users/follow",
    async (userIdToFollow, thunkAPI) => {
        try {
            const response = await authService.followUser(userIdToFollow);
            console.log("followUser thunk: Ответ от сервиса:", response);
            // ⭐ ИСПРАВЛЕНИЕ: Возвращаем ТОЛЬКО необходимые данные
            // Если вам нужно обновить другие срезы, делайте это в extraReducers
            return {
                currentUser: response.currentUser,
                userToFollow: response.userToFollow,
            };
        } catch (error) {
            const message =
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Асинхронный thunk отписаться от пользователя
export const unfollowUser = createAsyncThunk(
    "users/unfollow",
    async (userIdToUnfollow, thunkAPI) => {
        try {
            const response = await authService.unfollowUser(userIdToUnfollow);
            console.log("unfollowUser thunk: Ответ от сервиса:", response);
            return {
                currentUser: response.currentUser, 
                userToUnfollow: response.userToUnfollow,
            };
        } catch (error) {
            console.error("unfollowUser thunk: Ошибка:", error);
            const message =
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// ⭐ НОВЫЙ ASYNC THUNK ДЛЯ ПОЛУЧЕНИЯ ДАННЫХ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ
export const getMe = createAsyncThunk(
    "auth/getMe",
    async (_, thunkAPI) => {
        try {
            const response = await authService.getUserMe();
            return response; // Предполагается, что response содержит данные пользователя
        } catch (error) {
            const message =
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);