import { createAsyncThunk } from "@reduxjs/toolkit";
import userService from "../../../api/userService";

// Асинхронный thunk для получения профиля пользователя по ID
export const getUserById = createAsyncThunk(
    "users/getUserById",
    async (userId, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token;
            const response = await userService.getUserById(userId, token);
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

// Асинхронный thunk для получения рекомендованных пользователей
export const getRecommendedUsers = createAsyncThunk(
    "users/getRecommendedUsers",
    async (_, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.token;
            const response = await userService.getRecommendedUsers(token);
            return response.users;
        } catch (error) {
            const message =
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                error.toString();   
            return thunkAPI.rejectWithValue(message);
        }
    }
);