import { createSlice } from "@reduxjs/toolkit";
import { getUserById, getRecommendedUsers } from "./userThunks"; 

const initialState = {
    users: [],
    recommendedUsers: [],
    userProfile: null,

    isLoading: false, // Глобальный флаг загрузки
    isSuccess: false,
    isError: false,

    // Флаги рекомендаций (для recommendedUsers)
    isRecommendedLoading: false, // ⭐ НОВЫЙ ФЛАГ
    isRecommendedError: false,   // ⭐ НОВЫЙ ФЛАГ

    message: "",
};

export const userSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = "";
        },
        clearUserProfile: (state) => {
            state.userProfile = null;
        },
        // ⭐ НОВЫЙ REDUCER ДЛЯ СБРОСА
        resetRecommendedUsers: (state) => {
            state.recommendedUsers = [];
            state.isRecommendedLoading = false; // Сбрасываем флаг на всякий случай
            state.isRecommendedError = false;
            state.message = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // --- Обработчики для getUserById (Здесь мы МОЖЕМ менять isLoading) ---
            .addCase(getUserById.pending, (state) => {
                state.isLoading = true; // Включаем глобальный спиннер
                state.userProfile = null; 
            })
            .addCase(getUserById.fulfilled, (state, action) => {
                state.isLoading = false; // Выключаем глобальный спиннер
                state.isSuccess = true;
                state.userProfile = action.payload.user; 
                state.message = ""; 
            })
            .addCase(getUserById.rejected, (state, action) => {
                state.isLoading = false; // Выключаем глобальный спиннер
                state.isError = true;
                state.message = action.payload;
                state.userProfile = null; 
            })
            // --- Обработчики для getRecommendedUsers 
            .addCase(getRecommendedUsers.pending, (state) => {
                state.isRecommendedLoading = true;
                state.isRecommendedError = false; // Сброс ошибки при начале новой загрузки
            })
            .addCase(getRecommendedUsers.fulfilled, (state, action) => {
                state.isRecommendedLoading = false;
                
                // action.payload должен быть массивом, если Thunk возвращает response.users
                state.recommendedUsers = Array.isArray(action.payload) ? action.payload : []; 
                state.isRecommendedError = false;
            })
            .addCase(getRecommendedUsers.rejected, (state, action) => {
                state.isRecommendedLoading = false;
                state.isRecommendedError = true;
                state.message = action.payload; // Можно сохранить сообщение в отдельное поле для рекомендаций
                state.recommendedUsers = [];
            });
    },
});

export const { reset, clearUserProfile, resetRecommendedUsers } = userSlice.actions;
export default userSlice.reducer;

