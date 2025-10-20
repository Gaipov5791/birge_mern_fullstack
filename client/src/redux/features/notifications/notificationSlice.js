import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    // Хранит массив уведомлений. Каждое уведомление: { id, message, type }
    toasts: [],
};

// Генератор уникального ID (для простоты)
let nextToastId = 0;

export const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        /** * Добавляет новое уведомление в очередь.
         * payload: { message: string, type: 'success' | 'error' | 'info' }
         */
        addToast: (state, action) => {
            const newToast = {
                id: nextToastId++,
                message: action.payload.message,
                type: action.payload.type || 'info',
            };
            // Добавляем новый тост в начало, чтобы он отображался сверху
            state.toasts.unshift(newToast);
        },
        /** * Удаляет уведомление по ID.
         * payload: id (number)
         */
        removeToast: (state, action) => {
            state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
        },
        // Хелпер-экшены для удобства
        toastSuccess: (state, action) => {
            notificationSlice.caseReducers.addToast(state, {
                payload: { message: action.payload, type: 'success' }
            });
        },
        toastError: (state, action) => {
            notificationSlice.caseReducers.addToast(state, {
                payload: { message: action.payload, type: 'error' }
            });
        },
        toastInfo: (state, action) => {
            notificationSlice.caseReducers.addToast(state, {
                payload: { message: action.payload, type: 'info' }
            });
        },
    },
});

export const { addToast, removeToast, toastSuccess, toastError, toastInfo } = notificationSlice.actions;

export default notificationSlice.reducer;