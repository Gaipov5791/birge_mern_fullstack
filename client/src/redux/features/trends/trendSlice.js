import { createSlice } from "@reduxjs/toolkit";

import { getTrends } from "./trendThunks";

const initialState = {
    trends: [],
    isLoading: false,
    isError: false,
    message: "",
};

export const trendSlice = createSlice({
    name: "trends",
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isError = false;
            state.message = "";
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getTrends.pending, (state) => {
                state.isLoading = true;
                state.isError = false; // Сброс ошибки
                state.trends = []; // Очистка списка перед загрузкой
            })
            .addCase(getTrends.fulfilled, (state, action) => {
                state.isLoading = false;
                
                // ⭐ Улучшение: Гарантируем, что action.payload - массив
                // Если бэкенд вернет что-то другое, мы возьмем пустой массив
                const payloadData = action.payload || []; 
                state.trends = Array.isArray(payloadData) ? payloadData : [];
            })
            .addCase(getTrends.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.trends = []; // ✅ Здесь уже правильно установлено в пустой массив
            });
        },
});

export const { reset } = trendSlice.actions;
export default trendSlice.reducer;