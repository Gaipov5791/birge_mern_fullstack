import { createSlice } from "@reduxjs/toolkit";
import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    followUser, 
    unfollowUser, 
    loadUserFromStorage,
    getMe 
} from "./authThunks";

// Получаем пользователя из localStorage, если он есть
const userFromLocalStorage = JSON.parse(localStorage.getItem("user"));
const tokenFromLocalStorage = localStorage.getItem("token");

const initialState = {
    user: userFromLocalStorage ? {
        ...userFromLocalStorage,
        // Убедимся, что following и followers всегда массивы
        following: userFromLocalStorage.following || [],
        followers: userFromLocalStorage.followers || []
    } : null,
    token: tokenFromLocalStorage ? tokenFromLocalStorage : null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: "",
    isFollowing: false,
};

export const authSlice = createSlice({
    name:  "auth",
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = "";
            state.isFollowing = false;
        },
        setUserProfile: (state, action) => {
            state.userProfile = action.payload;
        },
        updateUserFollowing: (state, action) => {
            const { userId, isFollowing } = action.payload;
            // ... (логика подписки/отписки)
            if (isFollowing) {
                if (!state.user.following.includes(userId)) {
                    state.user.following.push(userId);
                }
            } else {
                state.user.following = state.user.following.filter(id => id !== userId);
            }
        }, 
        
        // ⭐ НОВЫЙ/ОБНОВЛЕННЫЙ РЕДЬЮСЕР для Google OAuth
        // Сохраняет только токен, полученный из URL. Данные user будут получены Thunk'ом.
        setAuthToken: (state, action) => {
            state.token = action.payload; // action.payload - это JWT-токен
            state.isSuccess = true; // Считаем, что токен означает успешный вход
        },  

        setAuthLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        
        // ⭐ НОВЫЙ РЕДЬЮСЕР для установки объекта user после получения его по токену
        setUserData: (state, action) => {
            state.user = action.payload; // action.payload - это объект пользователя
            // Также обновляем localStorage, если мы используем этот редьюсер для загрузки данных
            localStorage.setItem("user", JSON.stringify(action.payload));
        }
    },
    // ... (extraReducers остаются без изменений)
    extraReducers: (builder) => {
        builder
            // ... (registerUser, loginUser, logoutUser, followUser, unfollowUser)
            .addCase(registerUser.pending, (state) => { state.isLoading = true; })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.message = action.payload.message;
            })
            .addCase(registerUser.rejected, (state, action) => { /* ... */ })
            .addCase(loginUser.pending, (state) => { state.isLoading = true; })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.message = action.payload.message;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.user = null;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.message = null;
            })
            .addCase(followUser.pending, (state) => {
                state.isFollowing = true;
                state.isLoading = false;
            })
            .addCase(followUser.fulfilled, (state, action) => {
                state.isFollowing = false;
                state.isLoading = false;
                state.message = '';
                state.user.following = action.payload.currentUser.following; 
                localStorage.setItem("user", JSON.stringify(state.user));
                // Обновление userProfile
                if (state.userProfile && state.userProfile._id === action.payload.userToFollow._id) {
                    state.userProfile = action.payload.userToFollow; 
                }
            })
            .addCase(followUser.rejected, (state, action) => { /* ... */ })
            .addCase(unfollowUser.pending, (state) => {
                state.isFollowing = true;
                state.isLoading = false;
            })
            .addCase(unfollowUser.fulfilled, (state, action) => {
                state.isFollowing = false;
                state.isLoading = false;
                state.message = '';
                state.user.following = action.payload.currentUser.following; 
                localStorage.setItem("user", JSON.stringify(state.user));
                // Обновление userProfile
                if (state.userProfile && state.userProfile._id === action.payload.userToUnfollow._id) {
                    state.userProfile = action.payload.userToUnfollow;
                }
            })
            .addCase(unfollowUser.rejected, (state, action) => { /* ... */ })
            .addCase(loadUserFromStorage.fulfilled, (state, action) => {})
            .addCase(loadUserFromStorage.rejected, (state) => {})
            
            // ⭐ НОВЫЕ ОБРАБОТЧИКИ ДЛЯ getMe
            .addCase(getMe.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getMe.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload; 
                state.isSuccess = true;
                // Обновляем localStorage с полными данными пользователя
                localStorage.setItem("user", JSON.stringify(action.payload));
            })
            .addCase(getMe.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                // state.user и state.token уже должны быть очищены через logoutUser
            });
    },
});

export const { reset, setUserProfile, updateUserFollowing, setAuthToken, setAuthLoading, setUserData } = authSlice.actions;

export default authSlice.reducer;