import { createAsyncThunk } from "@reduxjs/toolkit";

import trendService from "../../../api/trendService";

// Асинхронный thunk для получения списка трендов
export const getTrends = createAsyncThunk(
    "trends/getTrends",
    async (_, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.token;
            const response = await trendService.getTrends(token);
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